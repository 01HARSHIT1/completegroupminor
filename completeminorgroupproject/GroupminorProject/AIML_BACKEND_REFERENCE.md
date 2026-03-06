# AIML Backend — Full Path & Purpose Reference

Two folders handle the AI/ML engine. **motor_digital_twin** has been removed.

---

## Folder 1: ml-models (ML API — Port 5001)

**Path:** `C:\CodeData\completeminorgroupproject\GroupminorProject\ml-models\`

**Purpose:** Central ML gateway. Receives sensor data from backend, calls Pump API, returns predictions (health, condition, leakage/blockage) to the dashboard.

| File | Purpose |
|------|---------|
| `api_server.py` | Flask app; POST /predict receives sensor data, calls Pump API (5003), returns health_score, condition, recommendations |
| `predict.py` | IrrigationPredictor class; rule-based/model-based prediction fallback |
| `train_model.py` | Trains ML models (if using local models) |
| `requirements.txt` | Python deps for training |
| `requirements_api.txt` | Python deps for API server |
| `README.md` | Setup instructions |

**Start:** `cd ml-models && python api_server.py`

---

## Folder 2: pump_dataset_generator (Pump Health API — Port 5003)

**Path:** `C:\CodeData\completeminorgroupproject\GroupminorProject\pump_dataset_generator\`

**Purpose:** Main AI model. Trained on LEVEL1_LEVEL2_PUMP_DATASET_IMPROVED.csv. Predicts Healthy/Warning/Fault from current, temp, vibration, flow. Returns health score and control recommendations.

| File | Purpose |
|------|---------|
| `pump_api.py` | Flask API; POST /predict → Healthy/Warning/Fault, health_score, recommendation |
| `realtime_predictor.py` | Buffer 50 samples → GRU inference → health class |
| `model_pump_gru.py` | GRU model definition (4 inputs → 3 classes) |
| `train_model.py` | Trains GRU on dataset; saves pump_health_model.pth |
| `generate_level12_dataset.py` | Generates LEVEL1_LEVEL2_PUMP_DATASET_IMPROVED.csv |
| `prepare_dataset.py` | Data prep for training |
| `create_windows.py` | Window creation for time-series |
| `LEVEL1_LEVEL2_PUMP_DATASET_IMPROVED.csv` | Main dataset (time, current, temp, vibration, flow, health, rul, label) |
| `LEVEL1_LEVEL2_PUMP_DATASET.csv` | Earlier dataset version |
| `model_dataset.csv` | Prepared training data |
| `README_AI_STEPS.md` | AI integration steps |
| `DASHBOARD_INTEGRATION.md` | Dashboard integration guide |

**Start:** `cd pump_dataset_generator && python pump_api.py`

---

## Data Flow

```
Backend (5000) → ML API (5001) → Pump API (5003)
                                    ↓
                        Healthy / Warning / Fault
                        health_score, recommendation
                                    ↓
                        Backend → Dashboard (5173)
```

---

## Start Order

1. Pump API (5003): `cd pump_dataset_generator && python pump_api.py`
2. ML API (5001): `cd ml-models && python api_server.py`
3. Backend (5000): `cd backend && npm start`
4. Dashboard (5173): `cd frontend && npm run dev`

Use `.\START_WITH_AI.ps1` or `.\START_FULL.ps1` to start all.
