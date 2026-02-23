"""
Pump Health API — Real-time health from current, temperature, vibration, flow.
For dashboard: POST /predict returns condition + health_score.
"""
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from collections import deque

from model_pump_gru import PumpGRU
from realtime_predictor import predict, get_health_score, control_recommendation

app = Flask(__name__)
CORS(app)

import torch
script_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(script_dir, "pump_health_model.pth")

model = None
try:
    model = PumpGRU(input_size=4, hidden_size=32, num_classes=3)
    model.load_state_dict(torch.load(model_path, map_location="cpu"))
    model.eval()
    print("Pump health model loaded")
except Exception as e:
    print("Pump model not loaded:", e)


def _get_sensors(data):
    c = data.get("current_A") or data.get("current") or 0.0
    t = data.get("temperature_C") or data.get("temperature") or 0.0
    v = data.get("vibration_rms") or data.get("vibration") or 0.0
    f = data.get("flow_rate_Lmin") or data.get("flow") or 0.0
    return float(c), float(t), float(v), float(f)


@app.route("/")
def index():
    """Root route so GET / does not return 404. Dashboard runs on Next.js (port 3000)."""
    return jsonify({
        "service": "Pump Health API",
        "model": "GRU (LEVEL1_LEVEL2_PUMP_DATASET_IMPROVED)",
        "status": "running",
        "endpoints": {"health": "GET /health", "predict": "POST /predict", "reset": "POST /reset"},
        "dashboard": "Use Next.js app on port 3000; backend (5000) + ML API (5001) call this API for health.",
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "running", "pump_model_loaded": model is not None})


@app.route("/predict", methods=["POST"])
def api_predict():
    if model is None:
        return jsonify({"condition": "Model not loaded", "health_score": 50})
    try:
        data = request.json or {}
        c, t, v, f = _get_sensors(data)
        health_class, label = predict(c, t, v, f)
        if label is None:
            return jsonify({
                "condition": "Collecting data...",
                "health_score": 100,
                "status": "collecting..."
            })
        score = get_health_score(label)
        action, recommendation = control_recommendation(health_class)
        return jsonify({
            "condition": health_class,
            "health_score": score,
            "label": label,
            "action": action,
            "recommendation": recommendation,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/reset", methods=["POST"])
def reset():
    from realtime_predictor import reset_buffer
    reset_buffer()
    return jsonify({"status": "buffer cleared"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5003))
    print("Pump Health API on http://localhost:" + str(port))
    app.run(host="0.0.0.0", port=port, debug=False)
