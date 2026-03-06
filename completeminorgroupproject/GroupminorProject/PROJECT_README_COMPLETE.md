# Smart Irrigation Digital Twin — Complete Project Reference

---

## Project Description

**Machine Learning Assisted Digital Twin for Smart Irrigation Pump Performance Monitoring, Leakage/Blockage Detection, and Predictive Maintenance**

This project implements a complete Industry 4.0–style smart irrigation system that combines physical hardware (motor pump, water tank, sensors), IoT data collection (ESP32), a web-based digital twin dashboard, and AI/ML for predictive maintenance. The system monitors motor health through current, temperature, vibration, and flow sensors; detects leakage and blockage; predicts failures; and provides real-time control. A digital twin backend aggregates live state for 3D visualization. The ML model (GRU) is trained on the LEVEL1_LEVEL2_PUMP_DATASET_IMPROVED dataset and outputs Healthy, Warning, or Fault conditions with health scores and recommendations.

---

## System Architecture

```
Physical Setup (Pump, Tank, Sensors)
            ↓
ESP32 Firmware (esp/)
            ↓ HTTP POST
Backend (backend/) ←→ ML API (ml-models/) ←→ Pump Health API (pump_dataset_generator/)
            ↓                                    ↓
Babylon Backend (babylon/)              Predictions (Healthy/Warning/Fault)
            ↓
Frontend Dashboard (frontend/)
```

---

## Folder Overview

| Folder | Purpose | Port |
|--------|---------|------|
| **frontend** | Vite+React dashboard: sensors, pump control, AI predictions, camera, digital twin view | 5173 |
| **backend** | Node.js API: sensors, pump control, WebSocket, ML proxy | 5000 |
| **babylon** | Digital twin backend: aggregates backend + ML data, exposes `/api/twin/state` | 5004 |
| **esp** | ESP32 firmware: sensors, HTTP POST to backend, pump relay | — |
| **ml-models** | ML API: receives sensor data, calls Pump API, returns predictions | 5001 |
| **pump_dataset_generator** | Pump Health API, GRU model, dataset, training | 5003 |

---

## Full File List with Paths and Purpose

### Root (GroupminorProject)

| Full Path | Purpose |
|-----------|---------|
| `C:\CodeData\completeminorgroupproject\GroupminorProject\README.md` | Main project overview and quick start |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\vercel.json` | Vercel deployment config (build frontend, output dist) |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\send_test_sensor_data.js` | Sends dummy sensor data to backend for testing without ESP |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\FOLDER_STRUCTURE.md` | Folder layout and cleanup instructions |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\AIML_BACKEND_REFERENCE.md` | AIML folders, paths, and data flow |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\PROJECT_STRUCTURE_REFERENCE.md` | Target folder structure reference |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\DELETE_OLD_DESIGNFRONTCODE.ps1` | Script to remove extra folders |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\PROJECT_README_COMPLETE.md` | This file — complete project reference |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\START_FULL.ps1` | Starts all services (Pump API, ML API, Backend, Babylon, Frontend) |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\START_WITH_AI.ps1` | Starts AI chain + Backend + Frontend |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\START_WITH_AI.bat` | Same as above (batch) |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\START_PROJECT.ps1` | Starts Backend, ML API, Frontend |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\START_PROJECT.bat` | Same (batch) |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\RUN_FRONTEND_2_VITE.ps1` | Runs frontend only |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\RUN_FRONTEND_2_VITE.bat` | Same (batch) |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\install_esp_prerequisites.ps1` | ESP/PlatformIO setup helper |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\HOW_TO_RUN_FRONTENDS.txt` | Instructions to run dashboard |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\QUICK_COMMANDS.md` | Quick command reference |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\SETUP_GUIDE.md` | Setup and installation guide |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\QUICK_START.md` | Quick start guide |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\IMPLEMENTATION_GUIDE.md` | Implementation details |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\IMPLEMENTATION_STEPS.md` | Step-by-step implementation |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\README_IMPLEMENTATION.md` | Implementation readme |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\PROJECT_SUMMARY.md` | Project summary |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\AI_DASHBOARD_INTEGRATION.md` | AI and dashboard integration guide |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\HOW_TO_SEE_AI_WORKING.md` | How to verify AI predictions |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\CONNECTION_ERRORS_FIX.md` | Fixing connection errors |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\ESP_SETUP_PREREQUISITES.md` | ESP32 and PlatformIO prerequisites |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\MOTOR_DATASET_GUIDE.md` | Motor dataset usage |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\VERCEL_DEPLOYMENT.md` | Vercel deployment guide |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\VERCEL_FIX.md` | Vercel troubleshooting |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\VERCEL_404_FIX.md` | Vercel 404 fix |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\VERCEL_SETTINGS.md` | Vercel settings reference |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\QUICK_VERCEL_SETUP.md` | Quick Vercel setup |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\GITHUB_PUSH_INSTRUCTIONS.md` | GitHub push instructions |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\PUSH_TO_GITHUB.ps1` | GitHub push script |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\PUSH_TO_GITHUB.bat` | Same (batch) |

---

### Frontend (`frontend/`)

**Responsibility:** Dashboard UI — sensor display, pump control, AI predictions, camera feed, digital twin overview.

| Full Path | Purpose |
|-----------|---------|
| `C:\CodeData\completeminorgroupproject\GroupminorProject\frontend\package.json` | Dependencies and scripts (dev, build) |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\frontend\vite.config.ts` | Vite config, path aliases |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\frontend\index.html` | HTML entry point |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\frontend\src\main.tsx` | React entry point |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\frontend\src\lib\api.ts` | API client: getSensorData, getPredictions, turnPumpOn/Off, getTwinState, WebSocket |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\frontend\src\app\App.tsx` | Main app: layout, state, API calls, real-time updates |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\frontend\src\app\components\SystemHealthOverview.tsx` | System health overview |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\frontend\src\app\components\SensorGrid.tsx` | Sensor readings grid |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\frontend\src\app\components\ElectricityPanel.tsx` | Current, voltage, power display |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\frontend\src\app\components\MotorControl.tsx` | Pump ON/OFF control |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\frontend\src\app\components\CameraFeed.tsx` | Live camera stream |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\frontend\src\app\components\AIHealthPrediction.tsx` | AI condition, health score, recommendations |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\frontend\src\app\components\AlertsAndLogs.tsx` | Alerts and event log |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\frontend\src\app\components\HistoricalAnalytics.tsx` | Historical charts |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\frontend\src\app\components\DigitalTwinVisualization.tsx` | Digital twin architecture diagram |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\frontend\src\app\components\SystemStatus.tsx` | System status indicator |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\frontend\README.md` | Frontend setup and run instructions |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\frontend\guidelines\Guidelines.md` | Design/UI guidelines |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\frontend\ATTRIBUTIONS.md` | Third-party attributions |

---

### Backend (`backend/`)

**Responsibility:** Central API — receives sensor data, pump commands; stores state; calls ML API; broadcasts via WebSocket.

| Full Path | Purpose |
|-----------|---------|
| `C:\CodeData\completeminorgroupproject\GroupminorProject\backend\index.js` | Express + Socket.IO server: /api/sensors, /api/predictions, /api/pump/on, /api/pump/off, WebSocket |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\backend\scripts\generate_dummy_sensors.js` | Generates dummy sensor CSV for testing |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\backend\data\dummy_sensor_data.csv` | CSV for simulation when no ESP connected |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\backend\package.json` | Dependencies |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\backend\README.md` | Backend setup and API docs |

---

### Babylon (`babylon/`)

**Responsibility:** Digital twin backend — polls backend for sensors and predictions, exposes aggregated twin state.

| Full Path | Purpose |
|-----------|---------|
| `C:\CodeData\completeminorgroupproject\GroupminorProject\babylon\index.js` | Express server; polls backend; GET /api/twin/state |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\babylon\package.json` | Dependencies |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\babylon\README.md` | Babylon backend setup |

---

### ESP (`esp/`)

**Responsibility:** ESP32 firmware — reads sensors, sends HTTP POST to backend, controls pump relay.

| Full Path | Purpose |
|-----------|---------|
| `C:\CodeData\completeminorgroupproject\GroupminorProject\esp\src\main.cpp` | Main firmware: WiFi, sensor reads, HTTP POST /api/sensors |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\esp\platformio.ini` | PlatformIO config (board, libs, env vars) |

---

### ML Models (`ml-models/`)

**Responsibility:** ML API — receives sensor data from backend, calls Pump API, returns predictions.

| Full Path | Purpose |
|-----------|---------|
| `C:\CodeData\completeminorgroupproject\GroupminorProject\ml-models\api_server.py` | Flask API: POST /predict, calls Pump API (5003), returns condition, health_score |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\ml-models\predict.py` | Rule-based/ML predictor fallback |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\ml-models\train_model.py` | Trains local models |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\ml-models\requirements.txt` | Python deps for training |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\ml-models\requirements_api.txt` | Python deps for API |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\ml-models\README.md` | ML API setup |

---

### Pump Dataset Generator (`pump_dataset_generator/`)

**Responsibility:** Pump Health API — GRU model trained on LEVEL1_LEVEL2; real-time predictions.

| Full Path | Purpose |
|-----------|---------|
| `C:\CodeData\completeminorgroupproject\GroupminorProject\pump_dataset_generator\pump_api.py` | Flask API: POST /predict → Healthy/Warning/Fault, health_score |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\pump_dataset_generator\realtime_predictor.py` | 50-sample buffer, GRU inference |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\pump_dataset_generator\model_pump_gru.py` | GRU model (4 inputs → 3 classes) |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\pump_dataset_generator\train_model.py` | Trains GRU on dataset, saves pump_health_model.pth |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\pump_dataset_generator\generate_level12_dataset.py` | Generates LEVEL1_LEVEL2 dataset |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\pump_dataset_generator\prepare_dataset.py` | Data preparation for training |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\pump_dataset_generator\create_windows.py` | Time-series window creation |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\pump_dataset_generator\LEVEL1_LEVEL2_PUMP_DATASET_IMPROVED.csv` | Main dataset (~50k rows: time, current, temp, vibration, flow, health, rul, label) |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\pump_dataset_generator\LEVEL1_LEVEL2_PUMP_DATASET.csv` | Earlier dataset version |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\pump_dataset_generator\README_AI_STEPS.md` | AI integration steps |
| `C:\CodeData\completeminorgroupproject\GroupminorProject\pump_dataset_generator\DASHBOARD_INTEGRATION.md` | Dashboard integration |

---

## Data Flow

1. **ESP32** reads sensors → POST `/api/sensors` → **Backend**
2. **Backend** stores data, calls **ML API** (5001)
3. **ML API** sends to **Pump API** (5003) → GRU predicts → returns condition, health_score
4. **Backend** stores prediction, broadcasts via WebSocket → **Frontend**
5. **Babylon** polls backend → exposes `GET /api/twin/state` for 3D client
6. **Frontend** displays sensors, predictions, pump control; connects to backend + Babylon

---

## Start Order

1. `cd pump_dataset_generator && python pump_api.py` (5003)
2. `cd ml-models && python api_server.py` (5001)
3. `cd backend && npm start` (5000)
4. `cd babylon && npm start` (5004)
5. `cd frontend && npm run dev` (5173)

Or run `.\START_FULL.ps1`.

---

## Dataset

**LEVEL1_LEVEL2_PUMP_DATASET_IMPROVED.csv**

| Column | Description |
|--------|-------------|
| time | Simulation time (s) |
| current | Current (A) |
| temperature | Temperature (°C) |
| vibration | Vibration |
| flow | Flow rate |
| health | Health score (100→0) |
| rul | Remaining useful life |
| label | 0=Healthy, 1=Warning, 2=Fault |

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Vite, React, TypeScript, Tailwind, Recharts |
| Backend | Node.js, Express, Socket.IO |
| Babylon | Node.js, Express, Axios |
| ESP | C++, PlatformIO |
| ML | Python, Flask, PyTorch, GRU |
| Dataset | CSV, Pandas |

---

## Prerequisites

- Node.js 18+, npm
- Python 3.8+
- PlatformIO or Arduino IDE (for ESP32)
- ESP32 board
- WiFi (for ESP and backend on same network)
