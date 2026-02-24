# AIML Predictor (TensorFlow.js)

The main backend runs predictions in Node.js using TensorFlow.js. No Python API required.

## Default: Rule-based

When no TF.js model is found, the predictor uses rule-based logic (leakage, blockage, failure risk) matching the Python fallback.

## Optional: TensorFlow.js model

1. Convert your Keras model to TF.js format:
   ```bash
   pip install tensorflowjs
   tensorflowjs_converter --input_format keras ml-models/models/lstm_model.h5 backend/ml/models/
   ```
   This creates `model.json` and `*.bin` in `backend/ml/models/`.

2. Restart the backend. It will load the model and use it for predictions.
3. Output format: 4 classes — Normal (0), Leakage (1), Blockage (2), Failure Risk (3).

## Files

- `predictor.js` — Loads TF.js model or uses rule-based prediction
- `models/` — Place converted TF.js model here (model.json + .bin weights)
