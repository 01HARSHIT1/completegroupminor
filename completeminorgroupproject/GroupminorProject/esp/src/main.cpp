/**
 * Smart Irrigation Digital Twin - ESP32 Sensor Firmware
 *
 * Sends sensor data to the backend at POST /api/sensors
 * Expected fields: current_A, vibration_rms, temperature_C, flow_rate_Lmin,
 *                  tank_level_cm, ph_value, turbidity_NTU, pump_status, pump_runtime_min
 *
 * Configure in platformio.ini or below:
 *   - WIFI_SSID, WIFI_PASSWORD
 *   - BACKEND_URL (e.g. http://192.168.1.100:5000)
 */

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

#ifndef WIFI_SSID
#define WIFI_SSID "YOUR_WIFI_SSID"
#endif
#ifndef WIFI_PASSWORD
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
#endif
#ifndef BACKEND_URL
#define BACKEND_URL "http://192.168.1.100:5000"
#endif
#ifndef SEND_INTERVAL_MS
#define SEND_INTERVAL_MS 2000
#endif

// Pin mappings - adjust to match your hardware
#define PIN_CURRENT     34    // ADC for current sensor (ACS712 or similar)
#define PIN_VIBRATION   35    // ADC for vibration (MPU6050 or analog)
#define PIN_TEMPERATURE 36    // ADC for temperature (TMP36, LM35, or NTC)
#define PIN_FLOW        39    // ADC/pulse for flow sensor
#define PIN_TANK_LEVEL  32    // ADC for ultrasonic/analog water level
#define PIN_PH          33    // ADC for pH sensor
#define PIN_TURBIDITY   25    // ADC for turbidity sensor

// Scale factors (calibrate for your sensors)
#define CURRENT_SCALE       0.0264   // V per A for ACS712 5A
#define VIBRATION_SCALE     0.001
#define TEMP_OFFSET         0.5
#define FLOW_SCALE          0.5
#define TANK_SCALE          0.1
#define PH_SCALE            0.0147
#define TURBIDITY_SCALE     0.01

unsigned long lastSend = 0;
bool pumpStatus = false;
unsigned long pumpStartTime = 0;

float readAnalogScaled(int pin, float scale, float offset = 0) {
  int raw = analogRead(pin);
  return (raw / 4095.0 * 3.3) * scale + offset;
}

// Simulated or real sensor reads - replace with actual sensor logic
float getCurrent() {
  return readAnalogScaled(PIN_CURRENT, CURRENT_SCALE, 2.5) * 2.0;  // Example: 1.5-4A range
}

float getVibration() {
  return readAnalogScaled(PIN_VIBRATION, VIBRATION_SCALE) * 5.0;   // Example: 0.2-2.0 g
}

float getTemperature() {
  float mv = (analogRead(PIN_TEMPERATURE) / 4095.0) * 3300;
  return mv / 10.0;  // LM35: 10mV per °C
}

float getFlowRate() {
  return readAnalogScaled(PIN_FLOW, FLOW_SCALE) * 15.0;  // Example: 0-15 L/min
}

float getTankLevel() {
  return readAnalogScaled(PIN_TANK_LEVEL, TANK_SCALE) * 50.0;  // Example: 0-50 cm
}

float getPH() {
  return 5.0 + readAnalogScaled(PIN_PH, PH_SCALE) * 4.0;  // Example: 5-9 pH
}

float getTurbidity() {
  return readAnalogScaled(PIN_TURBIDITY, TURBIDITY_SCALE) * 100.0;  // Example: 0-100 NTU
}

void readSensorsAndSend() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected. Skipping send.");
    return;
  }

  float current_A = getCurrent();
  float vibration_rms = getVibration();
  float temperature_C = getTemperature();
  float flow_rate_Lmin = getFlowRate();
  float tank_level_cm = getTankLevel();
  float ph_value = getPH();
  float turbidity_NTU = getTurbidity();

  // Pump runtime in minutes
  unsigned long pumpRuntimeMin = 0;
  if (pumpStatus && pumpStartTime > 0) {
    pumpRuntimeMin = (millis() - pumpStartTime) / 60000;
  }

  StaticJsonDocument<512> doc;
  doc["current_A"] = round(current_A * 100) / 100.0;
  doc["vibration_rms"] = round(vibration_rms * 100) / 100.0;
  doc["temperature_C"] = round(temperature_C * 100) / 100.0;
  doc["flow_rate_Lmin"] = round(flow_rate_Lmin * 100) / 100.0;
  doc["tank_level_cm"] = round(tank_level_cm * 100) / 100.0;
  doc["ph_value"] = round(ph_value * 100) / 100.0;
  doc["turbidity_NTU"] = round(turbidity_NTU * 100) / 100.0;
  doc["pump_status"] = pumpStatus ? "ON" : "OFF";
  doc["pump_runtime_min"] = pumpRuntimeMin;

  String payload;
  serializeJson(doc, payload);

  HTTPClient http;
  String url = String(BACKEND_URL) + "/api/sensors";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  int httpCode = http.POST(payload);

  if (httpCode == 200) {
    Serial.printf("[OK] Sent to %s\n", url.c_str());
  } else {
    Serial.printf("[ERR] HTTP %d - %s\n", httpCode, url.c_str());
  }

  http.end();
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\nSmart Irrigation ESP32 - Sensor Node");
  Serial.println("====================================");

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");
  Serial.printf("IP: %s\n", WiFi.localIP().toString().c_str());
  Serial.printf("Backend: %s\n", BACKEND_URL);
  Serial.printf("Send interval: %lu ms\n\n", (unsigned long)SEND_INTERVAL_MS);

  // ADC setup for ESP32
  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);
}

void loop() {
  unsigned long now = millis();
  if (now - lastSend >= SEND_INTERVAL_MS) {
    lastSend = now;
    readSensorsAndSend();
  }
  delay(100);
}
