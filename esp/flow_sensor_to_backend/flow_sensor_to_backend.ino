/**
 * ESP32 Flow Sensor → Express Backend → Python AIML
 *
 * Data flow: collect 3 samples (1/sec) → mean of each parameter → one CSV row → send to API
 * Row format: TimeWindow,MeanFlowRate,MeanDividerV,DividerOK (e.g. "1-3", 0.98, 0.99, TRUE)
 * Windows: 1-3s, 4-6s, 7-9s ... send one row per window every ~3 seconds.
 *
 * Transport: WiFi, Serial, Ethernet, or WIFI_AND_SERIAL
 */

#include <Arduino.h>
#include <ArduinoJson.h>

// ============ CSV buffering & mean ============
#define SAMPLES_PER_WINDOW 3   // 3 samples per window (1-3 sec, 4-6 sec, ...)
#define SAMPLE_INTERVAL_MS 1000
#define WINDOW_LABEL_LEN 12
#define ENABLE_CSV_SERIAL_LOG 1   // Print CSV row for capture to file (e.g. flowdata.csv)

// ============ TRANSPORT ============
#ifndef TRANSPORT
#define TRANSPORT WIFI
#endif

#if defined(TRANSPORT_SERIAL) || defined(TRANSPORT_WIFI_AND_SERIAL)
#define USE_SERIAL 1
#else
#define USE_SERIAL 0
#endif

#if defined(TRANSPORT_WIFI) || defined(TRANSPORT_WIFI_AND_SERIAL)
#define USE_WIFI 1
#else
#define USE_WIFI 0
#endif

#if defined(TRANSPORT_ETHERNET)
#define USE_ETHERNET 1
#else
#define USE_ETHERNET 0
#endif

#if USE_WIFI || USE_ETHERNET
#include <WiFi.h>
#include <HTTPClient.h>
#endif

#if USE_ETHERNET
#include <ETH.h>
#endif

// ============ CONFIG ============
#ifndef WIFI_SSID
#define WIFI_SSID "YOUR_WIFI_SSID"
#endif
#ifndef WIFI_PASSWORD
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
#endif
#ifndef BACKEND_URL
#define BACKEND_URL "http://192.168.1.100:5000"
#endif
#ifndef SAMPLE_INTERVAL_MS
#define SAMPLE_INTERVAL_MS 1000
#endif

#define FLOW_PIN 27
#define FLOW_K_FACTOR 7.5
#define DIVIDER_PIN 34

volatile unsigned long pulseCount = 0;

float flowBuf[SAMPLES_PER_WINDOW];
float dividerBuf[SAMPLES_PER_WINDOW];
bool dividerOKBuf[SAMPLES_PER_WINDOW];
uint8_t sampleIdx = 0;
uint32_t windowStartSec = 0;

void IRAM_ATTR flowInterrupt() {
  pulseCount++;
}

bool checkDivider(float &voltageOut) {
#if DIVIDER_PIN > 0
  int raw = analogRead(DIVIDER_PIN);
  voltageOut = (raw / 4095.0f) * 3.3f;
  return (voltageOut >= 0.0f && voltageOut <= 3.3f);
#else
  voltageOut = 0.0f;
  return true;
#endif
}

// Compute mean of 3 samples and majority for dividerOK
void computeWindowMean(float &meanFlow, float &meanDividerV, bool &dividerOK) {
  meanFlow = 0;
  meanDividerV = 0;
  int okCount = 0;
  for (uint8_t i = 0; i < SAMPLES_PER_WINDOW; i++) {
    meanFlow += flowBuf[i];
    meanDividerV += dividerBuf[i];
    if (dividerOKBuf[i]) okCount++;
  }
  meanFlow /= SAMPLES_PER_WINDOW;
  meanDividerV /= SAMPLES_PER_WINDOW;
  dividerOK = (okCount >= 2);
}

void buildPayload(StaticJsonDocument<384> &doc, const char *timeWindow,
                  float meanFlow, float meanDividerV, bool dividerOK) {
  doc["time_window"] = timeWindow;
  doc["flow_rate_Lmin"] = round(meanFlow * 100) / 100.0;
  doc["divider_voltage"] = round(meanDividerV * 100) / 100.0;
  doc["divider_ok"] = dividerOK;
  doc["current_A"] = 4.0;
  doc["temperature_C"] = 40.0;
  doc["vibration_rms"] = 2.5;
  doc["pump_status"] = "ON";
}

// Send via HTTP (WiFi or Ethernet)
bool sendViaHttp(const char *payload) {
#if USE_WIFI
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(String(BACKEND_URL) + "/api/sensors");
    http.addHeader("Content-Type", "application/json");
    int code = http.POST(payload);
    http.end();
    return (code == 200);
  }
#endif
#if USE_ETHERNET
  if (ETH.linkUp()) {
    HTTPClient http;
    String url = String(BACKEND_URL) + "/api/sensors";
    http.begin(url);  // ESP32 may use ETH when WiFi not connected; else use ETHClient for your board
    http.addHeader("Content-Type", "application/json");
    int code = http.POST(payload);
    http.end();
    return (code == 200);
  }
#endif
  return false;
}

// Output JSON to Serial for cable bridge (PC reads COM port and POSTs)
void sendViaSerial(const char *payload) {
#if USE_SERIAL
  Serial.println(payload);  // One JSON line per reading; bridge script parses this
#endif
}

void setup() {
  Serial.begin(115200);
  delay(500);

  pinMode(FLOW_PIN, INPUT);
  attachInterrupt(digitalPinToInterrupt(FLOW_PIN), flowInterrupt, RISING);

  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);

  Serial.println("\nFlow Sensor -> Backend");
  Serial.println("======================");

#if USE_WIFI
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi OK");
  Serial.printf("IP: %s\n", WiFi.localIP().toString().c_str());
#endif

#if USE_ETHERNET
  // ETH.begin(addr, power, mdc, mdio, phy, clock, type) - adjust pins for your board
  // Example: ESP32-Ethernet-Kit uses (0, -1, 23, 18, ...)
  if (!ETH.begin(0, -1, 23, 18, ETH_PHY_LAN8720, ETH_CLOCK_GPIO0_IN, ETH_TYPE_MII)) {
    Serial.println("Ethernet init failed");
  } else {
    Serial.print("Ethernet connecting");
    while (!ETH.linkUp()) {
      delay(500);
      Serial.print(".");
    }
    Serial.println("\nEthernet OK");
    Serial.printf("IP: %s\n", ETH.localIP().toString().c_str());
  }
#endif

#if USE_SERIAL && !USE_WIFI && !USE_ETHERNET
  Serial.println("SERIAL mode: output JSON to cable. Run serial_to_backend.js on PC.");
#endif

  Serial.printf("Backend: %s | Window: %d samples x %d ms\n\n", BACKEND_URL, SAMPLES_PER_WINDOW, SAMPLE_INTERVAL_MS);
  Serial.println("CSV: TimeWindow,FlowRate,DividerV,DividerOK -> API");
}

void loop() {
  pulseCount = 0;
  delay(SAMPLE_INTERVAL_MS);  // 1 sample per second

  float flowRate = pulseCount / FLOW_K_FACTOR;
  float dividerVoltage = 0.0f;
  bool dividerOK = checkDivider(dividerVoltage);

  flowBuf[sampleIdx] = flowRate;
  dividerBuf[sampleIdx] = dividerVoltage;
  dividerOKBuf[sampleIdx] = dividerOK;
  sampleIdx++;

  if (sampleIdx >= SAMPLES_PER_WINDOW) {
    sampleIdx = 0;
    float meanFlow, meanDividerV;
    bool meanDividerOK;
    computeWindowMean(meanFlow, meanDividerV, meanDividerOK);

    uint32_t tEnd = windowStartSec + SAMPLES_PER_WINDOW;
    char timeLabel[WINDOW_LABEL_LEN];
    snprintf(timeLabel, sizeof(timeLabel), "%lu-%lu", (unsigned long)windowStartSec + 1, (unsigned long)tEnd);
    windowStartSec = tEnd;

    StaticJsonDocument<384> doc;
    buildPayload(doc, timeLabel, meanFlow, meanDividerV, meanDividerOK);
    String payload;
    serializeJson(doc, payload);
    const char *payloadStr = payload.c_str();

    bool httpOk = sendViaHttp(payloadStr);
    sendViaSerial(payloadStr);

#if ENABLE_CSV_SERIAL_LOG
    // CSV row for flowdata.csv: Time(ms),FlowRate,DividerV,DividerOK
    Serial.print(millis());
    Serial.print(",");
    Serial.print(meanFlow);
    Serial.print(",");
    Serial.print(meanDividerV);
    Serial.print(",");
    Serial.println(meanDividerOK ? "TRUE" : "FALSE");
#else
    Serial.printf("[%s] %.2f,%.2f -> %s\n",
      timeLabel, meanFlow, meanDividerV,
      httpOk ? "API" : (USE_SERIAL ? "Serial" : "-"));
#endif
  }
}
