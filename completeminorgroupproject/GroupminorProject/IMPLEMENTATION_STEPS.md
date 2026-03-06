# Complete Step-by-Step Implementation Guide
## Smart Irrigation Digital Twin + ML Predictive Maintenance

**Project Timeline: 16 Weeks (4 Months)**

---

## ⭐ PHASE 0 — Project Setup (Week 1)

### Step 0.1 — Final Modules in Your Project

Your system will have:
- ✅ Mini Farm + Pump Setup
- ✅ Sensor Monitoring (Flow, Temp, Vibration, Current, Water Quality)
- ✅ ESP32 Data Upload (IoT Layer)
- ✅ Next.js Digital Twin Dashboard
- ✅ ML Model for Fault Prediction
- ✅ Mobile Control + Alerts
- ✅ Camera Live Streaming

### Step 0.2 — Folder Structure

```
smart-irrigation-digital-twin/
├── hardware/
│   └── esp32_firmware/
├── ml-model/
│   ├── train.py
│   └── predict.py
├── backend-server/
│   ├── index.js
│   └── package.json
├── dashboard-nextjs/
│   └── (Next.js app)
├── mobile-app/
│   └── (Flutter/React Native)
└── docs/
```

---

## ⭐ PHASE 1 — Hardware + Sensor Integration (Week 1-3)

### Step 1.1 — Required Hardware Connections

| Sensor | ESP32 Pin | Connection Type |
|--------|-----------|------------------|
| Flow Sensor (YF-S201) | GPIO 27 | Digital (Interrupt) |
| Temp Sensor (LM35) | GPIO 34 | Analog |
| Current Sensor (ACS712) | GPIO 35 | Analog |
| MPU6050 (Vibration) | GPIO 21/22 | I2C (SDA/SCL) |
| Water Level Sensor | GPIO 32 | Analog |
| pH Sensor | GPIO 33 | Analog |
| Turbidity Sensor | GPIO 36 | Analog |
| Relay Module | GPIO 26 | Digital Output |

### Step 1.2 — Install Arduino IDE Libraries

1. Open Arduino IDE
2. Go to **Tools → Board → Boards Manager**
3. Search "ESP32" → Install "esp32 by Espressif Systems"
4. Go to **Sketch → Include Library → Manage Libraries**
5. Install:
   - **MPU6050** by Electronic Cats
   - **PubSubClient** by Nick O'Leary
   - **ArduinoJson** by Benoit Blanchon

### Step 1.3 — ESP32 Sensor Code

Upload the firmware from `hardware/esp32_firmware/esp32_firmware.ino`

**Key Functions:**
- Reads all sensors every 1 second
- Sends data to backend server every 5 seconds
- Handles pump control via relay

**Output JSON Format:**
```json
{
  "vibration_rms": 0.87,
  "temperature_C": 41.2,
  "current_A": 2.3,
  "flow_rate_Lmin": 15.6,
  "tank_level_cm": 72,
  "ph_value": 7.2,
  "turbidity_NTU": 45,
  "pump_status": "ON",
  "timestamp": 1234567890
}
```

### Step 1.4 — Test Hardware

```bash
# Open Serial Monitor at 115200 baud
# Verify sensor readings appear
# Check WiFi connection
# Verify MQTT/HTTP data transmission
```

---

## ⭐ PHASE 2 — Backend Server (Week 3-5)

### Step 2.1 — Create Backend Folder

```bash
cd C:\CodeData\GroupminorProject
mkdir backend-server
cd backend-server
npm init -y
```

### Step 2.2 — Install Dependencies

```bash
npm install express cors mongoose socket.io axios
npm install --save-dev nodemon
```

### Step 2.3 — Create Server File

See `backend-server/index.js` for complete implementation.

**Key Endpoints:**
- `POST /api/sensors` - Receive sensor data from ESP32
- `GET /api/sensors` - Get latest sensor data
- `POST /api/pump/on` - Turn pump ON
- `POST /api/pump/off` - Turn pump OFF
- `GET /api/predictions` - Get ML predictions
- WebSocket: Real-time updates

### Step 2.4 — Run Backend Server

```bash
# Development mode (auto-restart)
npm run dev

# Production mode
node index.js
```

Server runs at: `http://localhost:5000`

### Step 2.5 — Test Backend

```bash
# Test sensor endpoint
curl http://localhost:5000/api/sensors

# Test pump control
curl -X POST http://localhost:5000/api/pump/on
```

---

## ⭐ PHASE 3 — Digital Twin Dashboard (React + Next.js) (Week 5-8)

### Step 3.1 — Create Next.js App

```bash
cd C:\CodeData\GroupminorProject
cd dashboard
npm install
npm run dev
```

Dashboard starts at: `http://localhost:3000`

### Step 3.2 — Dashboard Pages

Already created in `dashboard/app/`:
- `/` - Home/Overview
- `/dashboard` - Live sensor data
- `/analytics` - Historical trends
- `/predictions` - ML predictions
- `/camera` - Live camera feed
- `/control` - Pump control

### Step 3.3 — Connect to Backend

Update API URL in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000
```

### Step 3.4 — Test Dashboard

1. Open `http://localhost:3000`
2. Verify data updates in real-time
3. Test pump control buttons
4. Check charts render correctly

---

## ⭐ PHASE 4 — Pump Control System (Week 8-10)

### Step 4.1 — ESP32 Relay Control

The ESP32 firmware already includes relay control.

**Test Commands:**
```bash
# Turn pump ON
curl -X POST http://ESP32_IP/api/pump/on

# Turn pump OFF
curl -X POST http://ESP32_IP/api/pump/off
```

### Step 4.2 — Dashboard Control Integration

Control page at `/control` already has ON/OFF buttons.

**Safety Checks:**
- Water level > 5cm before turning ON
- Automatic shutdown on fault detection
- Status feedback to dashboard

---

## ⭐ PHASE 5 — Leakage + Blockage Detection (Week 10-12)

### Step 5.1 — Detection Logic

Implemented in `ml-models/predict.py`:

**Leakage Detection:**
```python
if pump_on and flow < expected_flow * 0.7:
    leakage_detected = True
```

**Blockage Detection:**
```python
if pump_on and current > 4.0 and flow < 3.0:
    blockage_detected = True
```

### Step 5.2 — Dashboard Alerts

Alerts automatically appear in:
- `/dashboard` - Immediate alerts
- `/predictions` - Detailed analysis
- `/analytics` - Historical patterns

---

## ⭐ PHASE 6 — Machine Learning Predictive Maintenance (Week 12-15)

### Step 6.1 — Create Dataset

```bash
cd ml-model
# Collect sensor data for 2-3 weeks
# Label data: Normal, Leakage, Blockage, Failure
# Save as datasets/sensor_data.csv
```

### Step 6.2 — Train ML Model

```bash
cd ml-model
pip install -r requirements.txt
python train_model.py
```

Models saved to `ml-model/models/`:
- `random_forest_model.pkl`
- `lstm_model.h5`
- `isolation_forest_model.pkl`
- `scaler.pkl`

### Step 6.3 — Prediction API

Backend automatically loads models and generates predictions.

**Test Prediction:**
```bash
curl http://localhost:5000/api/predictions
```

**Output:**
```json
{
  "health_score": 82,
  "condition": "Blockage Suspected",
  "failure_probability": 0.18,
  "alerts": ["⚠️ Blockage detected"],
  "recommendations": ["Clean irrigation pipes"]
}
```

---

## ⭐ PHASE 7 — Camera Integration (Week 15-16)

### Step 7.1 — ESP32-CAM Setup

1. Upload ESP32-CAM firmware
2. Configure WiFi credentials
3. Access stream at: `http://ESP32_CAM_IP/stream`

### Step 7.2 — Dashboard Integration

Camera page at `/camera` displays live feed.

**Update Camera URL:**
```env
NEXT_PUBLIC_CAMERA_URL=http://your-esp32cam-ip/stream
```

---

## ⭐ FINAL DELIVERABLES (Week 16)

### Complete System Checklist

- [ ] Mini Smart Farm Model built
- [ ] All sensors connected and calibrated
- [ ] ESP32 firmware uploaded and tested
- [ ] Backend server running
- [ ] Dashboard displaying real-time data
- [ ] Pump control working
- [ ] Leakage detection validated
- [ ] Blockage detection validated
- [ ] ML models trained (>90% accuracy)
- [ ] Predictions generating correctly
- [ ] Camera feed streaming
- [ ] Mobile app (optional) connected
- [ ] Final report written
- [ ] Presentation prepared

---

## ⭐ Final Command Summary

### Start Backend Server
```bash
cd backend-server
npm install
npm run dev
```

### Start Dashboard
```bash
cd dashboard
npm install
npm run dev
```

### Train ML Model
```bash
cd ml-model
pip install -r requirements.txt
python train_model.py
```

### Upload ESP32 Firmware
1. Open `hardware/esp32_firmware/esp32_firmware.ino` in Arduino IDE
2. Select board: ESP32 Dev Module
3. Upload

---

## 🐛 Troubleshooting

### ESP32 Not Connecting
- Check WiFi credentials
- Verify serial monitor output
- Check power supply

### Backend Not Receiving Data
- Verify ESP32 IP address
- Check firewall settings
- Test with Postman/curl

### Dashboard Not Updating
- Check WebSocket connection
- Verify API URL in .env.local
- Check browser console for errors

### ML Predictions Wrong
- Verify model files exist
- Check data format matches training
- Re-train with more data

---

## 📊 Expected Performance

- **ML Accuracy**: > 90%
- **Detection Time**: < 5 seconds
- **System Uptime**: > 95%
- **Water Efficiency**: 30-40% improvement

---

**Status**: ✅ Ready for Implementation  
**Next Step**: Start with Phase 1 (Hardware Setup)
