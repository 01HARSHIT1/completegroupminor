"""
GRU model for pump health: 4 inputs (current, temperature, vibration, flow) -> 3 classes.
Used by train_model.py and realtime_predictor.py (no circular import).
"""
import torch.nn as nn

class PumpGRU(nn.Module):
    def __init__(self, input_size=4, hidden_size=32, num_classes=3):
        super().__init__()
        self.gru = nn.GRU(input_size=input_size, hidden_size=hidden_size, batch_first=True)
        self.fc = nn.Linear(hidden_size, num_classes)

    def forward(self, x):
        out, _ = self.gru(x)
        out = out[:, -1, :]
        return self.fc(out)
