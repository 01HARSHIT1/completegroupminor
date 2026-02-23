"""
STEP 2 — Prepare dataset for training: keep only sensor inputs + label.
Reads LEVEL1_LEVEL2_PUMP_DATASET_IMPROVED.csv -> model_dataset.csv
"""
import pandas as pd
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
in_path = os.path.join(script_dir, "LEVEL1_LEVEL2_PUMP_DATASET_IMPROVED.csv")
out_path = os.path.join(script_dir, "model_dataset.csv")

df = pd.read_csv(in_path)
df = df[["time", "current", "temperature", "vibration", "flow", "label"]]
df.to_csv(out_path, index=False)
print("Dataset ready:", out_path)
print("Rows:", len(df), "Columns:", list(df.columns))
