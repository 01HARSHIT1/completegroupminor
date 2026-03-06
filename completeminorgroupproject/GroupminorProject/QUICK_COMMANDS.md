# Quick Command Reference

## 🚀 Start All Services

### Windows (PowerShell)
```powershell
.\START_PROJECT.ps1
```

### Windows (Batch)
```cmd
START_PROJECT.bat
```

### Manual Start

**Terminal 1 - Backend Server:**
```bash
cd backend-server
npm install
npm run dev
```

**Terminal 2 - ML API Server:**
```bash
cd ml-models
pip install -r requirements_api.txt
python api_server.py
```

**Terminal 3 - Dashboard:**
```bash
cd dashboard
npm install
npm run dev
```

---

## 📡 ESP32 Setup

### Upload Firmware
1. Open `hardware/esp32_firmware/esp32_firmware.ino` in Arduino IDE
2. Select Board: **ESP32 Dev Module**
3. Select Port: Your ESP32 port
4. Click **Upload**

### Configure WiFi
Edit in `esp32_firmware.ino`:
```cpp
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "YOUR_BACKEND_IP";
```

---

## 🤖 ML Model Training

### Collect Data
1. Run system under normal conditions (2-3 hours)
2. Simulate leakage (1-2 hours)
3. Simulate blockage (1-2 hours)
4. Simulate failure (30-60 minutes)
5. Save data as `ml-models/datasets/sensor_data.csv`

### Train Models
```bash
cd ml-models
pip install -r requirements.txt
python train_model.py
```

Models saved to `ml-models/models/`

---

## 🧪 Testing Commands

### Test Backend API
```bash
# Get sensor data
curl http://localhost:5000/api/sensors

# Get predictions
curl http://localhost:5000/api/predictions

# Turn pump ON
curl -X POST http://localhost:5000/api/pump/on

# Turn pump OFF
curl -X POST http://localhost:5000/api/pump/off
```

### Test ML API
```bash
# Health check
curl http://localhost:5001/health

# Prediction
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{"vibration_rms":1.2,"temperature_C":42.5,"current_A":4.5,"flow_rate_Lmin":2.1,"tank_level_cm":23.5,"ph_value":7.0,"turbidity_NTU":55.0}'
```

---

## 📊 Access Points

- **Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **ML API**: http://localhost:5001
- **ESP32 Web Server**: http://ESP32_IP (if configured)

---

## 🔧 Troubleshooting

### Backend not starting
```bash
cd backend-server
npm install
npm run dev
```

### ML API not starting
```bash
cd ml-models
pip install -r requirements_api.txt
python api_server.py
```

### Dashboard not starting
```bash
cd dashboard
npm install
npm run dev
```

### ESP32 not connecting
- Check WiFi credentials
- Verify Serial Monitor output
- Check power supply

---

## 📝 Development Workflow

1. **Hardware**: Upload ESP32 firmware
2. **Backend**: Start backend server
3. **ML API**: Start ML prediction server
4. **Dashboard**: Start Next.js dashboard
5. **Test**: Verify all connections
6. **Train**: Collect data and train ML models

---

**Quick Start**: Run `START_PROJECT.ps1` or `START_PROJECT.bat`
