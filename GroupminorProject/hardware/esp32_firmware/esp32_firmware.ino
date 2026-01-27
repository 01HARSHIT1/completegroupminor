/*
 * Smart Irrigation System - ESP32 Firmware
 * Digital Twin Based Pump Monitoring with Predictive Maintenance
 * 
 * Sensors:
 * - MPU6050 (Vibration)
 * - LM35 (Temperature)
 * - ACS712 (Current)
 * - YF-S201 (Flow)
 * - Water Level Sensor
 * - pH Sensor
 * - Turbidity Sensor
 * 
 * Features:
 * - WiFi connectivity
 * - MQTT data transmission
 * - HTTP API server
 * - Relay control for pump
 * - ESP32-CAM integration
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <MPU6050.h>
#include <WebServer.h>
#include <ArduinoJson.h>

// WiFi Credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// MQTT Configuration
const char* mqtt_server = "YOUR_MQTT_BROKER_IP";
const int mqtt_port = 1883;
const char* mqtt_topic = "smart_irrigation/sensors";

// Pin Definitions
#define RELAY_PIN 2           // Pump control relay
#define FLOW_SENSOR_PIN 4     // Flow sensor interrupt pin
#define TEMP_SENSOR_PIN 34    // LM35 analog pin
#define CURRENT_SENSOR_PIN 35 // ACS712 analog pin
#define WATER_LEVEL_PIN 32    // Water level sensor analog pin
#define PH_SENSOR_PIN 33      // pH sensor analog pin
#define TURBIDITY_PIN 36      // Turbidity sensor analog pin

// Sensor Objects
MPU6050 mpu;
WiFiClient espClient;
PubSubClient mqttClient(espClient);
WebServer server(80);

// Sensor Variables
float vibration_rms = 0.0;
float temperature_C = 0.0;
float current_A = 0.0;
float flow_rate_Lmin = 0.0;
float tank_level_cm = 0.0;
float ph_value = 7.0;
float turbidity_NTU = 0.0;
bool pump_status = false;
unsigned long pump_runtime_min = 0;

// Flow Sensor Variables
volatile int flow_pulse_count = 0;
unsigned long last_flow_time = 0;
const float flow_calibration = 450.0; // Pulses per liter

// Timing
unsigned long last_sensor_read = 0;
unsigned long last_mqtt_publish = 0;
const unsigned long sensor_interval = 1000;  // Read sensors every 1 second
const unsigned long mqtt_interval = 5000;    // Publish every 5 seconds

void setup() {
  Serial.begin(115200);
  
  // Initialize pins
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(FLOW_SENSOR_PIN, INPUT_PULLUP);
  digitalWrite(RELAY_PIN, LOW); // Pump OFF initially
  
  // Initialize I2C for MPU6050
  Wire.begin();
  if (mpu.begin() != 0) {
    Serial.println("MPU6050 initialization failed!");
  }
  
  // Initialize flow sensor interrupt
  attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), flowPulseCounter, RISING);
  
  // Connect to WiFi
  connectWiFi();
  
  // Setup MQTT
  mqttClient.setServer(mqtt_server, mqtt_port);
  
  // Setup HTTP API server
  setupWebServer();
  
  Serial.println("System initialized successfully!");
}

void loop() {
  // Handle MQTT
  if (!mqttClient.connected()) {
    reconnectMQTT();
  }
  mqttClient.loop();
  
  // Handle HTTP requests
  server.handleClient();
  
  // Read sensors periodically
  if (millis() - last_sensor_read >= sensor_interval) {
    readAllSensors();
    last_sensor_read = millis();
  }
  
  // Publish to MQTT periodically
  if (millis() - last_mqtt_publish >= mqtt_interval) {
    publishSensorData();
    last_mqtt_publish = millis();
  }
  
  // Update pump runtime
  if (pump_status) {
    pump_runtime_min = (millis() / 60000);
  }
}

void connectWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\nWiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("Attempting MQTT connection...");
    
    if (mqttClient.connect("ESP32_Irrigation")) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" retrying in 5 seconds");
      delay(5000);
    }
  }
}

void readAllSensors() {
  // Read Vibration (MPU6050)
  readVibration();
  
  // Read Temperature (LM35)
  readTemperature();
  
  // Read Current (ACS712)
  readCurrent();
  
  // Read Flow Rate (YF-S201)
  readFlowRate();
  
  // Read Water Level
  readWaterLevel();
  
  // Read pH
  readPH();
  
  // Read Turbidity
  readTurbidity();
}

void readVibration() {
  int16_t ax, ay, az;
  mpu.getAcceleration(&ax, &ay, &az);
  
  // Calculate RMS vibration
  float ax_g = ax / 16384.0;
  float ay_g = ay / 16384.0;
  float az_g = az / 16384.0;
  
  vibration_rms = sqrt((ax_g * ax_g + ay_g * ay_g + az_g * az_g) / 3.0);
}

void readTemperature() {
  int temp_raw = analogRead(TEMP_SENSOR_PIN);
  float voltage = (temp_raw / 4095.0) * 3.3;
  temperature_C = voltage * 100.0; // LM35: 10mV per degree C
}

void readCurrent() {
  int current_raw = analogRead(CURRENT_SENSOR_PIN);
  float voltage = (current_raw / 4095.0) * 3.3;
  // ACS712-30A: 66mV per Ampere, offset at 2.5V
  current_A = abs((voltage - 2.5) / 0.066);
}

void flowPulseCounter() {
  flow_pulse_count++;
}

void readFlowRate() {
  unsigned long current_time = millis();
  unsigned long time_diff = current_time - last_flow_time;
  
  if (time_diff >= 1000) { // Calculate every second
    float flow_L = flow_pulse_count / flow_calibration;
    flow_rate_Lmin = flow_L * 60.0; // Convert to L/min
    
    flow_pulse_count = 0;
    last_flow_time = current_time;
  }
}

void readWaterLevel() {
  int level_raw = analogRead(WATER_LEVEL_PIN);
  // Convert to cm (calibrate based on your sensor)
  tank_level_cm = map(level_raw, 0, 4095, 0, 50);
}

void readPH() {
  int ph_raw = analogRead(PH_SENSOR_PIN);
  float voltage = (ph_raw / 4095.0) * 3.3;
  // pH sensor calibration (adjust based on your sensor)
  ph_value = 3.3 * voltage;
}

void readTurbidity() {
  int turb_raw = analogRead(TURBIDITY_PIN);
  // Convert to NTU (calibrate based on your sensor)
  turbidity_NTU = map(turb_raw, 0, 4095, 0, 1000);
}

void publishSensorData() {
  DynamicJsonDocument doc(1024);
  
  doc["timestamp"] = millis();
  doc["vibration_rms"] = vibration_rms;
  doc["temperature_C"] = temperature_C;
  doc["current_A"] = current_A;
  doc["flow_rate_Lmin"] = flow_rate_Lmin;
  doc["tank_level_cm"] = tank_level_cm;
  doc["ph_value"] = ph_value;
  doc["turbidity_NTU"] = turbidity_NTU;
  doc["pump_status"] = pump_status ? "ON" : "OFF";
  doc["pump_runtime_min"] = pump_runtime_min;
  
  char buffer[1024];
  serializeJson(doc, buffer);
  
  mqttClient.publish(mqtt_topic, buffer);
  Serial.println("Data published to MQTT");
}

void setupWebServer() {
  // Root endpoint - return sensor data as JSON
  server.on("/", handleRoot);
  
  // API endpoints
  server.on("/api/sensors", handleGetSensors);
  server.on("/api/pump/on", handlePumpOn);
  server.on("/api/pump/off", handlePumpOff);
  server.on("/api/pump/status", handlePumpStatus);
  
  server.begin();
  Serial.println("HTTP server started");
}

void handleRoot() {
  server.send(200, "text/html", "<h1>Smart Irrigation System API</h1>");
}

void handleGetSensors() {
  DynamicJsonDocument doc(1024);
  
  doc["vibration_rms"] = vibration_rms;
  doc["temperature_C"] = temperature_C;
  doc["current_A"] = current_A;
  doc["flow_rate_Lmin"] = flow_rate_Lmin;
  doc["tank_level_cm"] = tank_level_cm;
  doc["ph_value"] = ph_value;
  doc["turbidity_NTU"] = turbidity_NTU;
  doc["pump_status"] = pump_status;
  doc["pump_runtime_min"] = pump_runtime_min;
  
  String response;
  serializeJson(doc, response);
  
  server.send(200, "application/json", response);
}

void handlePumpOn() {
  if (tank_level_cm > 5) { // Safety check: water level > 5cm
    digitalWrite(RELAY_PIN, HIGH);
    pump_status = true;
    server.send(200, "application/json", "{\"status\":\"ON\",\"message\":\"Pump started\"}");
  } else {
    server.send(400, "application/json", "{\"status\":\"ERROR\",\"message\":\"Water level too low\"}");
  }
}

void handlePumpOff() {
  digitalWrite(RELAY_PIN, LOW);
  pump_status = false;
  pump_runtime_min = 0;
  server.send(200, "application/json", "{\"status\":\"OFF\",\"message\":\"Pump stopped\"}");
}

void handlePumpStatus() {
  DynamicJsonDocument doc(256);
  doc["pump_status"] = pump_status ? "ON" : "OFF";
  doc["runtime_min"] = pump_runtime_min;
  
  String response;
  serializeJson(doc, response);
  
  server.send(200, "application/json", response);
}
