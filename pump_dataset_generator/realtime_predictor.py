"""
STEP 5 — Real-time prediction engine.
Buffer 50 samples (current, temp, vib, flow) -> GRU -> Healthy / Warning / Fault.
"""
import torch
import numpy as np
import os
from collections import deque

from model_pump_gru import PumpGRU

script_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(script_dir, "pump_health_model.pth")

model = PumpGRU(input_size=4, hidden_size=32, num_classes=3)
model.load_state_dict(torch.load(model_path, map_location="cpu"))
model.eval()

WINDOW = 50
buffer = deque(maxlen=WINDOW)
LABELS = ["Healthy", "Warning", "Fault"]


def predict(current, temp, vib, flow):
    """Add one reading and return health class when buffer is full."""
    buffer.append([float(current), float(temp), float(vib), float(flow)])
    if len(buffer) < WINDOW:
        return "Collecting data...", None
    x = torch.tensor([list(buffer)], dtype=torch.float32)
    with torch.no_grad():
        out = model(x)
        cls = torch.argmax(out, dim=1).item()
    return LABELS[cls], cls


def get_health_score(label_class):
    """Map class to 0-100 health score for dashboard."""
    if label_class == 0:
        return 95
    if label_class == 1:
        return 55
    return 20


def reset_buffer():
    buffer.clear()


# STEP 7 — Control logic (use in your control layer)
# Healthy -> keep pump ON
# Warning -> show alert
# Fault -> stop relay
def control_recommendation(health_class):
    if health_class == "Healthy":
        return "OK", "keep pump ON"
    if health_class == "Warning":
        return "ALERT", "reduce load or schedule maintenance"
    return "STOP", "stop pump / check motor"


if __name__ == "__main__":
    # Quick test
    for _ in range(50):
        out, cls = predict(1.8, 42, 1.1, 0.12)
    print("Prediction:", out, "| Recommendation:", control_recommendation(out))
