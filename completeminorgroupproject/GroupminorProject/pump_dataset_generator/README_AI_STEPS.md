# Step-by-Step: Pump AI Model → System Health & Control

Pipeline: **Dataset → Train Model → Real-time Prediction → Health Score → Auto Control**

---

## STEP 1 — Install AI environment (once)

```bash
pip install numpy pandas scikit-learn torch matplotlib flask flask-cors
```

Optional for later ESP32: `pip install pyserial`

---

## STEP 2 — Prepare dataset

```bash
cd pump_dataset_generator
python prepare_dataset.py
```

**Creates:** `model_dataset.csv` (time, current, temperature, vibration, flow, label) from `LEVEL1_LEVEL2_PUMP_DATASET_IMPROVED.csv`.

---

## STEP 3 — Create time-windows

```bash
python create_windows.py
```

**Creates:** `X.npy`, `y.npy` (50-step windows, 4 features). We train on **behaviour over time**, not single readings.

---

## STEP 4 — Train the GRU model

```bash
python train_model.py
```

**Creates:** `pump_health_model.pth`. You should see test accuracy (~80–90% with class weights). Re-run after editing `train_model.py` if you add class weights.

---

## STEP 5 — Real-time prediction

```python
from realtime_predictor import predict, control_recommendation

# After 50 samples, returns ("Healthy"|"Warning"|"Fault", 0|1|2)
health_class, label = predict(1.8, 42, 1.1, 0.12)
print(health_class)
print(control_recommendation(health_class))  # (action, recommendation)
```

Or test from command line:
```bash
python -c "from realtime_predictor import predict; [predict(1.8,42,1.1,0.12) for _ in range(50)]; print(predict(1.8,42,1.1,0.12))"
```

---

## STEP 6 — Connect to dashboard (see system health & control)

**Option A — Run Pump API and point backend to it**

1. Start Pump Health API (this folder):
   ```bash
   python pump_api.py
   ```
   Runs at **http://localhost:5003**.

2. In `ml-models/api_server.py` you can add a call to `http://localhost:5003/predict` (like GRU_API_URL) and merge `condition` / `health_score` from the pump model when you want pump-specific health.

3. Start backend (5000) and dashboard (3000). Sensor data → backend → ML API → Pump API (5003) → condition & health_score → dashboard.

**Option B — Use predictor in your own control script**

- Read sensor data (Serial/HTTP from ESP32).
- Call `predict(current, temp, vib, flow)`.
- **Healthy** → keep pump ON.  
- **Warning** → show alert, reduce load.  
- **Fault** → stop relay, log event.

---

## STEP 7 — Automatic control logic (in code)

Already in `realtime_predictor.py`:

- **Healthy** → `"OK"`, keep pump ON  
- **Warning** → `"ALERT"`, reduce load or schedule maintenance  
- **Fault** → `"STOP"`, stop pump / check motor  

Use `control_recommendation(health_class)` to get `(action, recommendation)`.

---

## Files in this folder

| File | Purpose |
|------|--------|
| `LEVEL1_LEVEL2_PUMP_DATASET_IMPROVED.csv` | Improved 50k dataset (realism) |
| `prepare_dataset.py` | STEP 2 → model_dataset.csv |
| `create_windows.py` | STEP 3 → X.npy, y.npy |
| `model_pump_gru.py` | GRU model (4 inputs → 3 classes) |
| `train_model.py` | STEP 4 → pump_health_model.pth |
| `realtime_predictor.py` | STEP 5 — buffer + predict |
| `pump_api.py` | Flask API for dashboard (port 5003) |

---

## Expected performance

- With improved dataset: **~88–92%** before calibration.  
- After adding real sensor data and calibration: **~93–96%**.

---

## Quick run order (full pipeline)

```bash
cd pump_dataset_generator
python prepare_dataset.py
python create_windows.py
python train_model.py
python pump_api.py
```

Then open dashboard and backend; point ML API to Pump API (5003) if you want pump health on the dashboard.
