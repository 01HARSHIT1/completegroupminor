# Block Diagram and System Architecture

## System Block Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    MINI SMART FARM SETUP                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Crop Bed   │    │  Irrigation │    │   Drip       │  │
│  │   (Field)    │◄───│    Pipes     │◄───│  Channels    │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │
┌─────────────────────────────────────────────────────────────┐
│              UNDERGROUND WATER STORAGE TANK                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Water Level Sensor  │  pH Sensor  │  Turbidity      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    PUMP MOTOR SYSTEM                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  DC Pump/Motor  │  Relay Module  │  Flow Sensor     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    SENSOR MONITORING LAYER                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  MPU6050     │  │  LM35        │  │  ACS712      │     │
│  │  Vibration   │  │  Temperature │  │  Current     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  YF-S201     │  │  Water Level │  │  pH/Turbidity│     │
│  │  Flow Sensor │  │  Sensor      │  │  Sensors     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  ESP32 IoT CONTROLLER                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  WiFi Module  │  MQTT Client  │  HTTP Server         │  │
│  │  Data Logger  │  Relay Control │  Camera Stream       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                    ┌───────┴───────┐
                    │               │
            ┌───────▼──────┐  ┌──────▼──────┐
            │   WiFi/MQTT  │  │  HTTP API   │
            │  Connection  │  │   Server    │
            └───────┬──────┘  └──────┬──────┘
                    │               │
        ┌───────────┴───────────────┴───────────┐
        │                                         │
┌───────▼──────────┐              ┌──────────────▼──────┐
│  Digital Twin    │              │   Mobile App        │
│  Dashboard       │              │   (Farmer Control)  │
│  (React+Next.js) │              │                     │
│                  │              │  • Pump ON/OFF     │
│  • Live Status   │              │  • Sensor Values    │
│  • Analytics     │              │  • Alerts          │
│  • Predictions   │              │  • Camera View     │
│  • Camera Feed   │              │                     │
└───────┬──────────┘              └─────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│           MACHINE LEARNING PREDICTION ENGINE                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Random      │  │  LSTM        │  │  Isolation    │     │
│  │  Forest      │  │  Network     │  │  Forest       │     │
│  │  (Fault      │  │  (Time-Series│  │  (Anomaly     │     │
│  │  Classifier) │  │  Prediction) │  │  Detection)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│              PREDICTION OUTPUTS                              │
│  ✅ Live Pump Performance (Efficiency %)                    │
│  ⚠️  Leakage Detection Alert                                │
│  ⚠️  Blockage Detection Alert                               │
│  🚨 Pump Failure Prediction (Risk %)                        │
└─────────────────────────────────────────────────────────────┘
```

## System Architecture Layers

### Layer 1: Physical Hardware Layer
- Mini farm model with crop bed
- Underground water storage tank
- DC Pump/Motor system
- Irrigation pipes and drip channels
- All sensors (vibration, temperature, current, flow, water level, pH, turbidity)
- ESP32-CAM for live monitoring

### Layer 2: IoT Communication Layer
- ESP32 microcontroller
- WiFi connectivity
- MQTT/HTTP data transmission
- Real-time sensor data collection
- Relay control for pump operation

### Layer 3: Digital Twin & AI Layer
- React + Next.js web dashboard
- Real-time data visualization
- Machine Learning prediction engine
- Database (MongoDB/Firebase)
- WebSocket for live updates
- Mobile app integration

## Data Flow Architecture

```
Sensors → ESP32 → WiFi/MQTT → Backend Server → Database
                                              ↓
Mobile App ← WebSocket ← Dashboard ← ML Engine ← Database
```

## Communication Protocols

1. **MQTT**: For lightweight sensor data transmission
2. **HTTP REST API**: For dashboard and mobile app communication
3. **WebSocket**: For real-time bidirectional updates
4. **WiFi**: Primary communication medium
