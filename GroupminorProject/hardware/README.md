# Hardware Implementation

## ESP32 Firmware

### Setup Instructions

1. **Install Arduino IDE** or **PlatformIO**
2. **Install Required Libraries**:
   - WiFi (built-in)
   - PubSubClient (MQTT)
   - ArduinoJson
   - MPU6050 library

3. **Configure WiFi and MQTT**:
   - Edit `esp32_firmware.ino`
   - Update `ssid` and `password`
   - Update `mqtt_server` IP address

4. **Upload to ESP32**:
   - Select board: ESP32 Dev Module
   - Select port
   - Upload code

### Pin Connections

| Component | ESP32 Pin | Notes |
|-----------|-----------|-------|
| Relay Module | GPIO 2 | Pump control |
| Flow Sensor | GPIO 4 | Interrupt pin |
| Temperature (LM35) | GPIO 34 | Analog input |
| Current (ACS712) | GPIO 35 | Analog input |
| Water Level | GPIO 32 | Analog input |
| pH Sensor | GPIO 33 | Analog input |
| Turbidity | GPIO 36 | Analog input |
| MPU6050 | SDA/SCL | I2C (GPIO 21/22) |

### Circuit Diagram

```
ESP32
  |
  ├── Relay ──> Pump Motor
  ├── MPU6050 (I2C)
  ├── LM35 ──> GPIO 34
  ├── ACS712 ──> GPIO 35
  ├── YF-S201 ──> GPIO 4
  ├── Water Level ──> GPIO 32
  ├── pH Sensor ──> GPIO 33
  └── Turbidity ──> GPIO 36
```

### Calibration

Each sensor requires calibration:

1. **Flow Sensor**: Adjust `flow_calibration` constant (typically 450 pulses/L)
2. **Current Sensor**: Verify offset voltage (2.5V for ACS712)
3. **Temperature**: Verify LM35 output (10mV/°C)
4. **Water Level**: Calibrate based on tank height
5. **pH Sensor**: Calibrate using pH buffer solutions
6. **Turbidity**: Calibrate using standard solutions

### Testing

1. Serial Monitor: Check sensor readings at 115200 baud
2. MQTT: Verify data publishing to broker
3. HTTP API: Test endpoints using browser/Postman
4. Pump Control: Test relay activation

### Troubleshooting

- **WiFi not connecting**: Check credentials and signal strength
- **MQTT not connecting**: Verify broker IP and port
- **Sensor readings wrong**: Check wiring and calibration
- **Pump not working**: Verify relay connections and power supply
