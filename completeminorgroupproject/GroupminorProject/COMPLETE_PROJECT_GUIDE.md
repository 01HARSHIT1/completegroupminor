# Smart Irrigation Digital Twin — Complete Project Guide

## 🎯 Project Summary

A **Digital Twin of an Irrigation System** that combines:

| Component | Purpose |
|-----------|---------|
| **Physical Setup** | Motor pump, water container, plastic farm model, plant models |
| **ESP32** | Flow sensor, voltage divider; sends via WiFi, Serial (USB), or Ethernet |
| **Dashboard** | Real-time sensors, motor health, camera, pump control (Vite+React) |
| **AIML** | Runs in **Node.js backend** via TensorFlow.js (no Python required by default) |
| **Babylon** | Twin state aggregation for 3D visualization |

---

## 📁 FOLDER STRUCTURE

```
GroupminorProject/
├── frontend/                  ← Dashboard (Vite+React, port 5173)
├── esp/                       ← ESP32 firmware (PlatformIO)
│   ├── src/main.cpp           ← Full sensor firmware
│   └── flow_sensor_to_backend/← Flow sensor (WiFi/Serial/Ethernet)
├── backend/                   ← Central API (port 5000) + AIML (TensorFlow.js)
│   ├── modules/               ← config, store, csvSimulation, websocket, routes
│   └── ml/predictor.js        ← AIML predictor
├── babylon/                   ← Digital twin backend (port 5004)
├── shared/                    ← apiClient, config (used by scripts, babylon)
├── ml-models/                 ← Optional Python ML API (port 5001)
└── pump_dataset_generator/    ← Pump Health API (port 5003)
```

---

## 📂 FOLDER MAPPING

| Folder | Purpose |
|--------|---------|
| **frontend** | Dashboard (Vite+React): sensors, pump control, camera, AI predictions, digital twin viz |
| **esp** | ESP32 firmware: full sensors or flow-only; WiFi / Serial (USB) / Ethernet transport |
| **backend** | Central API + **AIML (TensorFlow.js)** — no Python required by default |
| **babylon** | Twin state aggregation; uses `shared/apiClient` to fetch from backend |
| **shared** | `apiClient`, `config` — send/receive data from scripts, serial bridge, babylon |
| **ml-models** | Optional Python ML API (port 5001) — superseded by backend TF.js |
| **pump_dataset_generator** | Pump Health API (port 5003); optional |

---

## 📄 FILE/FOLDER PURPOSE BREAKDOWN

### 1. FRONTEND (Dashboard)

| File/Folder | Purpose |
|-------------|---------|
| `frontend/` (Vite+React) | Main dashboard: MotorControl, SensorGrid, AIHealthPrediction, DigitalTwinVisualization, camera |
| Port 5173 | Runs at http://localhost:5173 |

---

### 2. ESP32 (Firmware)

| File/Folder | Purpose |
|-------------|---------|
| `esp/src/main.cpp` | Full sensor firmware: current, vibration, temp, flow, tank, pH, turbidity |
| `esp/flow_sensor_to_backend/` | Flow-only firmware: WiFi, Serial (USB), or Ethernet transport |
| `esp/flow_sensor_to_backend/serial_to_backend.js` | PC bridge: reads Serial JSON, POSTs to backend (uses `shared/apiClient`) |

**Flow sensor transport:** `pio run -e wifi` \| `serial` \| `wifi_and_serial` \| `ethernet`  
**Data buffering:** 3 samples per window (1–3s, 4–6s…) → mean → one CSV row → POST to API  
**CSV format:** `Time(ms),FlowRate,DividerV,DividerOK` (matches flowdata.csv)

---

### 3. AIML (AI/ML)

| File/Folder | Purpose |
|-------------|---------|
| **`backend/ml/predictor.js`** | **Main AIML** — TensorFlow.js + rule-based; runs in Node.js (no Python) |
| `backend/ml/models/` | Optional: place converted TF.js model here (`model.json` + `.bin`) |
| `ml-models/api_server.py` | Optional Python ML API (port 5001) — superseded by backend TF.js |
| `pump_dataset_generator/pump_api.py` | Pump Health API (port 5003) — optional |
| `pump_dataset_generator/` | Dataset, GRU training, LEVEL1_LEVEL2 model |

**Default:** Backend uses rule-based prediction (leakage, blockage, failure risk). Add TF.js model for ML.

---

### 4. BACKEND (Central API)

| File/Folder | Purpose |
|-------------|---------|
| `backend/index.js` | Express + Socket.IO; loads modules |
| `backend/modules/config.js` | PORT, CSV path, defaults |
| `backend/modules/store.js` | In-memory state: sensors, history, predictions |
| `backend/modules/csvSimulation.js` | Load/start/stop CSV simulation |
| `backend/modules/websocket.js` | Socket.IO setup, broadcast helpers |
| `backend/modules/routes.js` | API route handlers |
| `backend/ml/predictor.js` | AIML (TensorFlow.js + rule-based) |
| `backend/data/dummy_sensor_data.csv` | CSV for simulation when no ESP |

**Port:** 5000  
**Flow:** ESP → POST `/api/sensors` → Backend merge → **AIML in Node.js** → WebSocket to dashboard.

---

### 5. BABYLON (Digital Twin Backend)

| File/Folder | Purpose |
|-------------|---------|
| `babylon/index.js` | Uses `shared/apiClient` (getSensors, getPredictions) → exposes `GET /api/twin/state` |

**Port:** 5004  
**Flow:** Polls backend every 1s → Dashboard calls `GET /api/twin/state` → Uses data for 3D viz.

---

### 6. SHARED (Modules)

| File/Folder | Purpose |
|-------------|---------|
| `shared/config.js` | BACKEND_URL, BABYLON_URL, API_PATHS, getBackendUrl(), getBabylonUrl() |
| `shared/apiClient.js` | postSensors, postSensorsRaw, getSensors, getPredictions, getPumpStatus, postPumpOn, postPumpOff, getStats, getTwinState |

**Used by:** `send_test_sensor_data.js`, `serial_to_backend.js`, `babylon/`

---

### 7. FRONTEND API MODULES

| File/Folder | Purpose |
|-------------|---------|
| `frontend/src/lib/api/` | Modular API: sensors, predictions, pump, realtime, twin |
| `frontend/src/lib/api/index.ts` | Re-exports all; import `from "@/lib/api"` |

---

## 🔷 PORT MAP

| Port | Service | Folder |
|------|---------|--------|
| 5173 | Dashboard (Vite) | frontend |
| 5000 | Backend (Central API + AIML) | backend |
| 5001 | ML API (optional Python) | ml-models |
| 5003 | Pump Health API (optional) | pump_dataset_generator |
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
ESP32 (WiFi / Serial bridge / Ethernet)
    → POST /api/sensors → Backend (5000)
    → Backend: AIML (TensorFlow.js or rule-based) in Node.js
    → Backend stores prediction, WebSocket → Dashboard
    → Babylon (5004) polls backend via shared/apiClient → GET /api/twin/state
    → Dashboard uses twin state for 3D viz

Optional: Python ML API (5001), Pump API (5003) — not required by default.
```

---

## 🔷 STEP-BY-STEP IMPLEMENTATION

### Phase 1: Backend + Dashboard

1. `cd backend && npm install && npm start` (port 5000).
2. `cd frontend && npm install && npm run dev` (port 5173).
3. AIML runs in backend (TensorFlow.js or rule-based) — no Python needed.

### Phase 2: ESP32 / Test Data

**Option A — WiFi:** `cd esp/flow_sensor_to_backend && pio run -e wifi`  
Set `WIFI_SSID`, `WIFI_PASSWORD`, `BACKEND_URL` in platformio.ini.

**Option B — Serial (USB):** `pio run -e serial`; on PC: `node serial_to_backend.js COM3`

**Option C — No ESP:** `node send_test_sensor_data.js` (uses `shared/apiClient`)

### Phase 3: Babylon

1. `cd babylon && npm install && npm start` (port 5004).
2. Dashboard uses `getTwinState()` from `frontend/src/lib/api`.

### Phase 4: Optional Python ML

1. Pump API: `cd pump_dataset_generator && python pump_api.py` (5003).
2. ML API: `cd ml-models && python api_server.py` (5001).  
   (Main backend uses TensorFlow.js by default; Python is optional.)

### Phase 5: Vercel (Frontend Deploy)

1. Root Directory: `frontend`
2. Build: `npm run build`; Output: `dist`
3. `vercel.json` is preconfigured.

---

## 🔷 START ORDER (Minimal)

1. Backend (5000) — `cd backend && npm start`
2. Dashboard (5173) — `cd frontend && npm run dev`
3. Babylon (5004) — `cd babylon && npm start`
4. ESP32 or `node send_test_sensor_data.js`

**Optional:** Pump API (5003), Python ML API (5001)

---

## 🔷 MODULES REFERENCE (Send/Receive Data)

### Shared — `shared/apiClient.js`
```js
const { postSensors, getSensors, getPredictions } = require('./shared/apiClient');
await postSensors({ flow_rate_Lmin: 12, current_A: 4 });
const sensors = await getSensors();
```

### Frontend — `frontend/src/lib/api`
```ts
import { getSensorData, turnPumpOn } from "@/lib/api";
```

### Backend — `backend/modules`
- `store` — getSensors, setPrediction, etc.
- `routes` — registerRoutes(app, io, processSensorData)
- `websocket` — broadcastSensorUpdate, broadcastPredictionUpdate

See **MODULES_REFERENCE.md** for full API.

---

## 🔷 VERCEL DEPLOYMENT

| Setting | Value |
|---------|-------|
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

---

## 🔷 FOLDER → PURPOSE (Quick Reference)

| Folder | Purpose |
|--------|---------|
| **frontend** | Dashboard (Vite+React), modular `lib/api` |
| **esp** | ESP32 firmware; flow_sensor_to_backend: WiFi/Serial/Ethernet |
| **backend** | Central API + AIML (TensorFlow.js), modular `modules/` |
| **babylon** | Twin state; uses shared apiClient |
| **shared** | apiClient, config — send/receive for scripts |
| **ml-models** | Optional Python ML API |
| **pump_dataset_generator** | Pump Health API, GRU, dataset |

---

---

## 🔷 RELATED DOCS

| Doc | Purpose |
|-----|---------|
| `MODULES_REFERENCE.md` | Full module API (shared, backend, frontend) |
| `esp/flow_sensor_to_backend/FLOW_TO_BACKEND_README.md` | Flow sensor config, transport, serial bridge |
| `VERCEL_FRONTEND_DEPLOY.md` | Vercel deployment fix |
| `FOLDER_PURPOSE_MAPPING.md` | Quick folder reference |

---

**Status:** Single source of truth for folder mapping, data flow, modules, and deployment.
