/**
 * ESP32 Sensor → Main Backend API (every second)
 *
 * Data flow: read sensors every 1 sec → send raw reading to POST /api/sensors
 * Main backend buffers 3 samples, computes mean (1-3s window), runs ML model
 *
 * Parameters: flow_rate_Lmin, divider_voltage, divider_ok, current_A, temperature_C, vibration_rms
 * Optional analog pins for current/temp/vibration (set to -1 for placeholders)
 *
 * Transport: WiFi, Serial, Ethernet, or WIFI_AND_SERIAL
 */

#include <Arduino.h>
#include <ArduinoJson.h>

#define SAMPLE_INTERVAL_MS 1000
#define ENABLE_CSV_SERIAL_LOG 1

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
// Optional: set analog pins for current, temp, vibration (e.g. 35, 36, 39) or -1 for placeholder
#define CURRENT_PIN    -1
#define TEMP_PIN      -1
#define VIBRATION_PIN -1

volatile unsigned long pulseCount = 0;

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

float readCurrent() {
#if CURRENT_PIN >= 0
  int raw = analogRead(CURRENT_PIN);
  return (raw / 4095.0f) * 5.0f;
#else
  return 4.0f;
#endif
}

float readTemp() {
#if TEMP_PIN >= 0
  int raw = analogRead(TEMP_PIN);
  return (raw / 4095.0f) * 100.0f;
#else
  return 40.0f;
#endif
}

float readVibration() {
#if VIBRATION_PIN >= 0
  int raw = analogRead(VIBRATION_PIN);
  return (raw / 4095.0f) * 5.0f;
#else
  return 2.5f;
#endif
}

void buildPayload(StaticJsonDocument<384> &doc, float flowRate, float dividerV,
                  bool dividerOK, float current, float temp, float vibration) {
  doc["flow_rate_Lmin"] = round(flowRate * 100) / 100.0;
  doc["divider_voltage"] = round(dividerV * 100) / 100.0;
  doc["divider_ok"] = dividerOK;
  doc["current_A"] = round(current * 100) / 100.0;
  doc["temperature_C"] = round(temp * 100) / 100.0;
  doc["vibration_rms"] = round(vibration * 100) / 100.0;
  doc["pump_status"] = "ON";
  doc["pump_runtime_min"] = millis() / 60000.0f;
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

  Serial.printf("Backend: %s | Send every %d ms (raw -> backend groups 1-3s)\n\n", BACKEND_URL, SAMPLE_INTERVAL_MS);
}

void loop() {
  pulseCount = 0;
  delay(SAMPLE_INTERVAL_MS);

  float flowRate = pulseCount / FLOW_K_FACTOR;
  float dividerVoltage = 0.0f;
  bool dividerOK = checkDivider(dividerVoltage);
  float current = readCurrent();
  float temp = readTemp();
  float vibration = readVibration();

  StaticJsonDocument<384> doc;
  buildPayload(doc, flowRate, dividerVoltage, dividerOK, current, temp, vibration);
  String payload;
  serializeJson(doc, payload);
  const char *payloadStr = payload.c_str();

  bool httpOk = sendViaHttp(payloadStr);
  sendViaSerial(payloadStr);

#if ENABLE_CSV_SERIAL_LOG
  Serial.print(millis());
  Serial.print(",");
  Serial.print(flowRate);
  Serial.print(",");
  Serial.print(dividerVoltage);
  Serial.print(",");
  Serial.print(current);
  Serial.print(",");
  Serial.print(temp);
  Serial.print(",");
  Serial.print(vibration);
  Serial.print(",");
  Serial.println(dividerOK ? "TRUE" : "FALSE");
#else
  Serial.printf("[1s] flow=%.2f cur=%.2f -> %s\n",
    flowRate, current, httpOk ? "API" : (USE_SERIAL ? "Serial" : "-"));
#endif
}
