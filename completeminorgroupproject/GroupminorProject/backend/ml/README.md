# AIML Predictor (TensorFlow.js)

The main backend runs predictions in Node.js using TensorFlow.js. No Python API required.

## Feature set (aligned with pump dataset)

| Feature | Source | Notes |
|---------|--------|-------|
| current_A | Sensor | Pump current (A) |
| temperature_C | Sensor | Pump/motor temperature (°C) |
| vibration_rms | Sensor | Vibration RMS |
| flow_rate_Lmin | Flow sensor | Flow rate (L/min) |
| pump_runtime_min | Computed | Pump runtime |
| health | Previous prediction | Health score (0–100) |
| flow_trend | Derived | Slope from recent flow readings |
| zero_flow_seconds | Derived | 1 when flow ≈ 0 |
| divider_voltage | ESP32 | Voltage divider (optional) |
| sensor_distance_m | Config | Distance from pump (future) |

**Future:** `tube_type` (rubber, PVC, etc.), `total_volume_L`

## Default: Rule-based

When no TF.js model is found, the predictor uses rule-based logic (leakage, blockage, failure risk).

## Train & deploy TensorFlow.js model

1. **Train** (from project root):
   ```bash
   cd GroupminorProject
   pip install tensorflow pandas numpy scikit-learn
   python backend/ml/train_aiml.py --dataset pump_dataset_generator/LEVEL1_LEVEL2_PUMP_DATASET_IMPROVED.csv
   ```
   Output: `backend/ml/models/aiml_model.h5`, `feature_config.json`

2. **Convert to TF.js**:
   ```bash
   pip install tensorflowjs
   tensorflowjs_converter --input_format keras backend/ml/models/aiml_model.h5 backend/ml/models/
   ```
   Creates `model.json` and `*.bin` in `backend/ml/models/`.

3. **Restart backend** — it will load the model and use it for predictions.

4. **Output:** 4 classes — Normal (0), Leakage (1), Blockage (2), Failure Risk (3).

## Files

- `predictor.js` — Loads TF.js model or uses rule-based prediction
- `features.js` — Feature extraction and normalization
- `train_aiml.py` — Training script for AIML model
- `models/` — model.json, *.bin, feature_config.json
