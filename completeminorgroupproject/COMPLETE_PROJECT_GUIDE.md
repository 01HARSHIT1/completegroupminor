# Smart Irrigation Digital Twin — Complete Project Guide

## 🎯 Project Summary

You are building a **Digital Twin of an Irrigation System** that combines:

| Component | Purpose |
|-----------|---------|
| **Physical Setup** | Motor pump, water container, plastic farm model, plant models |
| **ESP32/Arduino** | Reads sensors (current, vibration, temperature, flow) and controls pump |
| **Dashboard** | Real-time device data, motor health, live camera, pump control |
| **AI/ML Model** | Detects leakage, blockage, faults, failure; calculates component health |
| **Babylon.js** | 3D Digital Twin model synced with real-time data |

---

## 📁 TARGET FOLDER STRUCTURE (What You Want)

```
completeminorgroupproject/
└── minorgroupproject/
    ├── frontend/              ← Dashboard (React/Next.js/Vite)
    ├── smartirrigation/       ← ESP32 firmware (Arduino/PlatformIO)
    ├── aiml_model/            ← AI/ML training + inference API
    ├── backend/               ← Central API (Node.js)
    └── babylon/               ← Babylon backend + (optional) 3D client
```

---

## 📂 CURRENT → TARGET MAPPING (GroupminorProject)

| Target Folder | Current Location | Purpose |
|---------------|------------------|---------|
| **frontend** | `GroupminorProject/frontend/` | Dashboard UI (Vite+React): sensor charts, pump control, camera, predictions |
| **esp** | `GroupminorProject/esp/` | ESP32 firmware: sensor reads, HTTP POST to backend, pump relay control |
| **aiml_model** | `GroupminorProject/ml-models/` + `GroupminorProject/pump_dataset_generator/` | ML API, Pump Health API (LEVEL1_LEVEL2 model) |
| **backend** | `GroupminorProject/backend/` | Central API: sensors, pump control, ML proxy, WebSocket |
| **babylon** | `GroupminorProject/babylon/` | Digital Twin data aggregation; fetches from backend, exposes `/api/twin/state` |

---

## 📄 FILE/FOLDER PURPOSE BREAKDOWN

### 1. FRONTEND (Dashboard)

| File/Folder | Purpose |
|-------------|---------|
| `frontend/` (Vite+React) | Main dashboard: MotorControl, SensorGrid, AIHealthPrediction, DigitalTwinVisualization, camera |
| Port 5173 | Runs at http://localhost:5173 |

---

### 2. SMARTIRRIGATION (ESP32 Firmware)

| File/Folder | Purpose |
|-------------|---------|
| `esp/src/main.cpp` | Main firmware: WiFi, HTTP POST to backend, sensor reads |
| `esp/platformio.ini` | PlatformIO config |
| `hardware/esp32_firmware/esp32_firmware.ino` | Arduino sketch (alternative to PlatformIO) |

**Data sent:** `current_A`, `vibration_rms`, `temperature_C`, `flow_rate_Lmin`, `tank_level_cm`, `ph_value`, `turbidity_NTU`, `pump_status`, `pump_runtime_min`  
**Control:** Backend sends pump ON/OFF; ESP listens (MQTT or HTTP polling in future).

---

### 3. AIML MODEL (AI/ML Engine)

| File/Folder | Purpose |
|-------------|---------|
| `pump_dataset_generator/` | Dataset + training for pump health |
| `pump_dataset_generator/LEVEL1_LEVEL2_PUMP_DATASET_IMPROVED.csv` | **Your dataset** — time, current, temperature, vibration, flow, health, rul, label (0=Healthy, 1=Warning, 2=Fault) |
| `pump_dataset_generator/generate_level12_dataset.py` | Generates synthetic pump dataset |
| `pump_dataset_generator/model_pump_gru.py` | GRU model definition (4 inputs → 3 classes) |
| `pump_dataset_generator/realtime_predictor.py` | Real-time prediction from 50-sample window |
| `pump_dataset_generator/pump_api.py` | **Pump Health API** (port 5003) — used by ML API |
| `pump_dataset_generator/train_model.py` | Train GRU on LEVEL1_LEVEL2 dataset |
| `ml-models/api_server.py` | **ML API** (port 5001) — called by backend; calls Pump API (5003) or GRU API (5002) |
| `ml-models/predict.py` | Rule-based / model-based predictor |

---

### 4. BACKEND (Central API)

| File/Folder | Purpose |
|-------------|---------|
| `backend/index.js` | Express + Socket.IO: `/api/sensors`, `/api/predictions`, `/api/pump/on`, `/api/pump/off`, WebSocket |
| `backend/scripts/generate_dummy_sensors.js` | Dummy sensor data for testing |
| `backend/data/dummy_sensor_data.csv` | CSV for simulation when no ESP connected |

**Port:** 5000  
**Flow:** ESP → POST `/api/sensors` → Backend stores → Calls ML API (5001) → Stores predictions → WebSocket to dashboard.

---

### 5. BABYLON (Digital Twin Backend)

| File/Folder | Purpose |
|-------------|---------|
| `babylon/index.js` | Fetches sensors + predictions from backend (5000), exposes `GET /api/twin/state` |
| `babylon/` | **Backend only** — aggregates twin state; does not render 3D |

**Port:** 5004  
**Flow:** Polls backend every 1s → Dashboard or Babylon.js 3D client calls `/api/twin/state` → Uses data for 3D scene (pump color, water animation).

**Note:** The actual Babylon.js 3D scene (pump, pipes, farm, water animation) is **to be built** — either inside the dashboard app or as a separate frontend that consumes `GET /api/twin/state`.

---

## 🔷 PORT MAP

| Port | Service | Folder |
|------|---------|--------|
| 5173 | Dashboard (Vite) | frontend / designfrontcode |
| 5000 | Backend (Central API) | backend |
| 5001 | ML API (predictions) | aiml_model / ml-models |
| 5003 | Pump Health API | aiml_model / pump_dataset_generator |
| 5004 | Babylon / Twin Backend | babylon |

---

## 🔷 DATASET: LEVEL1_LEVEL2_PUMP_DATASET_IMPROVED.csv

| Column | Description |
|--------|--------------|
| time | Simulation time (seconds) |
| current | Current (A) |
| temperature | Temperature (°C) |
| vibration | Vibration |
| flow | Flow rate |
| health | Health score (100 → 0) |
| rul | Remaining useful life |
| label | 0=Healthy, 1=Warning, 2=Fault |

**Labels used by ML:** Healthy (95), Warning (55), Fault (20) health scores.

---

## 🔷 DATA FLOW (End-to-End)

```
ESP32 (sensors + pump) 
    → HTTP POST /api/sensors → Backend (5000)
    → Backend calls ML API (5001)
    → ML API calls Pump API (5003) with current, temp, vib, flow
    → Pump API returns: condition (Healthy/Warning/Fault), health_score
    → Backend stores prediction, WebSocket → Dashboard
    → Babylon backend (5004) polls backend → GET /api/twin/state
    → Dashboard / 3D client uses twin state for visualization
```

---

## 🔷 STEP-BY-STEP IMPLEMENTATION (For AI/Software Engineer)

### Phase 1: Reorganize Folders (Optional)

1. Create target structure under `completeminorgroupproject/minorgroupproject/`:
   - `frontend` ← Dashboard (Vite+React)
   - `esp` ← ESP32 firmware
   - `aiml_model` ← ml-models + pump_dataset_generator
   - `backend` ← Central API
   - `babylon` ← Digital twin backend

2. Update all configs (API URLs, paths) to match new structure.

### Phase 2: Hardware + ESP Communication

1. Flash ESP32 with `esp` (PlatformIO or Arduino).
2. Set `WIFI_SSID`, `WIFI_PASSWORD`, `BACKEND_URL` (e.g. `http://<PC_IP>:5000`).
3. Ensure backend (5000) is running; ESP sends POST to `/api/sensors` every 2s.
4. If no ESP: use CSV simulation via `send_test_sensor_data.js` or dummy CSV.

### Phase 3: Backend + Dashboard

1. `cd backend && npm install && npm start` (port 5000).
2. `cd frontend && npm install && npm run dev` (port 5173).
3. Verify: sensor data appears, pump control works (simulated or relay).

### Phase 4: AI/ML Integration

1. Train model (if needed):
   ```bash
   cd pump_dataset_generator
   python generate_level12_dataset.py   # if dataset missing
   python train_model.py                 # train GRU
   ```
2. Start Pump Health API: `python pump_api.py` (port 5003).
3. Start ML API: `cd ml-models && python api_server.py` (port 5001).
4. Backend auto-connects to ML API; predictions flow to dashboard.

### Phase 5: Babylon Digital Twin Backend

1. `cd babylon && npm install && npm start` (port 5004).
2. Dashboard calls `GET http://localhost:5004/api/twin/state` for twin data.

### Phase 6: Babylon.js 3D Digital Twin (To Build)

1. Create 3D scene: tank, pump, pipes, farm bed, plants.
2. Consume `GET /api/twin/state` (or WebSocket).
3. Logic:
   - `health_score` → pump color (green/yellow/red).
   - `pumpOn` → animate water flow.
   - High temperature → heat glow effect.

### Phase 7: Alerts and Polish

1. Add popup/sound when condition = Warning or Fault.
2. Add SMS/Email (optional).
3. Add voice control (Web Speech API) — future phase.

---

## 🔷 START ORDER (All Services)

1. Pump Health API (5003) — `cd pump_dataset_generator && python pump_api.py`
2. ML API (5001) — `cd ml-models && python api_server.py`
3. Backend (5000) — `cd backend && npm start`
4. Babylon (5004) — `cd babylon && npm start`
5. Dashboard (5173) — `cd frontend && npm run dev`
6. ESP32 — power on (or use CSV sim)

---

## 🔷 FOLDER → PURPOSE TABLE (Quick Reference)

| Folder | Purpose |
|--------|---------|
| **frontend** | Dashboard UI, sensor charts, pump control, camera, predictions |
| **smartirrigation** | ESP32 firmware, sensor reads, pump relay |
| **aiml_model** | ML training, Pump Health API, ML API, GRU |
| **backend** | Central API, WebSocket, pump control, ML proxy |
| **babylon** | Twin state aggregation, `/api/twin/state` for 3D client |

---

**Status:** Use this document as the single source of truth for folder mapping and implementation steps.
