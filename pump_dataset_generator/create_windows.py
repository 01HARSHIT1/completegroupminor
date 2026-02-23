"""
STEP 3 — Convert data into time-windows (5 sec at 10 Hz = 50 samples).
We train on behaviour over time, not single readings.
"""
import numpy as np
import pandas as pd
import os

WINDOW = 50   # 5 seconds if sampling 10 Hz

script_dir = os.path.dirname(os.path.abspath(__file__))
df = pd.read_csv(os.path.join(script_dir, "model_dataset.csv"))

features = df[["current", "temperature", "vibration", "flow"]].values
labels = df["label"].values

X = []
y = []
for i in range(len(features) - WINDOW):
    X.append(features[i : i + WINDOW])
    y.append(labels[i + WINDOW])

X = np.array(X, dtype=np.float32)
y = np.array(y, dtype=np.int64)

np.save(os.path.join(script_dir, "X.npy"), X)
np.save(os.path.join(script_dir, "y.npy"), y)
print("Windows created: X", X.shape, "y", y.shape)
