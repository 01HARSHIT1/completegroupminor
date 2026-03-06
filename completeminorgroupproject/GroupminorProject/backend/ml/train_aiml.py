#!/usr/bin/env python3
"""
AIML Model Training for Smart Irrigation (TensorFlow.js Backend)

Features (aligned with pump dataset + flow metrics):
  - current (A)
  - temperature (C)
  - vibration (rms)
  - flow (L/min)
  - time / pump_runtime (min)
  - health (current health %)
  - flow_trend (derived: slope over window)
  - zero_flow_seconds (derived)
  - total_volume_L (optional, 0 if unavailable)
  - sensor_distance_m (optional, 0 = default)
  - tube_type_* (optional one-hot: rubber, pvc, etc.)

Output: 4 classes — Normal (0), Leakage (1), Blockage (2), Failure Risk (3)

Usage:
  python train_aiml.py [--dataset path/to/dataset.csv] [--output-dir backend/ml/models]
"""

import argparse
import json
import os
import sys

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

try:
    import tensorflow as tf
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import Dense, Dropout, BatchNormalization
    from tensorflow.keras.optimizers import Adam
    from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
except ImportError:
    print("Install: pip install tensorflow pandas numpy scikit-learn")
    sys.exit(1)

RANDOM_STATE = 42
NUM_CLASSES = 4  # Normal, Leakage, Blockage, Failure Risk

# Feature order for inference (must match predictor.js)
FEATURE_ORDER = [
    'current_A',
    'temperature_C',
    'vibration_rms',
    'flow_rate_Lmin',
    'pump_runtime_min',
    'health',
    'flow_trend',
    'zero_flow_seconds',
    'divider_voltage',
    'sensor_distance_m',
]

CONDITION_LABELS = ['Normal', 'Leakage Detected', 'Blockage Suspected', 'Failure Risk High']


def load_and_prepare_dataset(filepath):
    """Load pump dataset and map to standard column names."""
    df = pd.read_csv(filepath)
    # Map pump dataset columns
    col_map = {
        'current': 'current_A',
        'temperature': 'temperature_C',
        'vibration': 'vibration_rms',
        'flow': 'flow_rate_Lmin',
    }
    df = df.rename(columns=col_map)

    # Ensure label is 0-3; add synthetic Failure Risk (3) if missing
    labels = df['label'].values
    if 3 not in np.unique(labels):
        # Add synthetic samples: high vibration + high temp -> Failure Risk
        mask = (df['vibration_rms'] > 2.0) | (df['temperature_C'] > 60)
        n_add = min(500, mask.sum())
        if n_add > 0:
            fail_idx = np.where(mask)[0][:n_add]
            labels[fail_idx] = 3
            df['label'] = labels
    df['label'] = np.clip(df['label'].astype(int), 0, 3)

    # Derived features
    df['pump_runtime_min'] = df.get('time', pd.Series(0, index=df.index)) / 60.0
    df['flow_trend'] = df['flow_rate_Lmin'].diff().fillna(0).clip(-2, 2)  # bounded slope
    df['zero_flow_seconds'] = (df['flow_rate_Lmin'].abs() < 0.01).astype(float)  # simplified
    df['divider_voltage'] = 1.0  # placeholder
    df['sensor_distance_m'] = 0.0  # placeholder for future

    print(f"Dataset: {len(df)} rows")
    print(f"Label distribution:\n{df['label'].value_counts().sort_index()}")
    return df


def build_feature_matrix(df):
    """Build X and y from dataframe."""
    available = [f for f in FEATURE_ORDER if f in df.columns]
    missing = [f for f in FEATURE_ORDER if f not in df.columns]
    if missing:
        for m in missing:
            df[m] = 0.0
    X = df[FEATURE_ORDER].values.astype(np.float32)
    y = df['label'].values.astype(np.int32)
    return X, y


def build_model(input_dim, num_classes=4):
    """Dense classifier for condition prediction."""
    model = Sequential([
        tf.keras.layers.Input(shape=(input_dim,)),
        Dense(64, activation='relu'),
        BatchNormalization(),
        Dropout(0.3),
        Dense(32, activation='relu'),
        Dropout(0.2),
        Dense(16, activation='relu'),
        Dropout(0.2),
        Dense(num_classes, activation='softmax'),
    ])
    model.compile(
        optimizer=Adam(learning_rate=0.001),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    return model


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dataset', default='../../pump_dataset_generator/LEVEL1_LEVEL2_PUMP_DATASET_IMPROVED.csv',
                        help='Path to pump CSV (relative to script dir)')
    parser.add_argument('--output-dir', default=None, help='Output dir (default: same as script)')
    parser.add_argument('--epochs', type=int, default=50)
    parser.add_argument('--batch-size', type=int, default=64)
    args = parser.parse_args()

    script_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = args.dataset if os.path.isabs(args.dataset) else os.path.join(script_dir, args.dataset)
    output_dir = args.output_dir or os.path.join(script_dir, 'models')
    os.makedirs(output_dir, exist_ok=True)

    print("=" * 50)
    print("AIML Model Training (TensorFlow.js)")
    print("=" * 50)

    df = load_and_prepare_dataset(dataset_path)
    X, y = build_feature_matrix(df)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_temp, y_train, y_temp = train_test_split(
        X_scaled, y, test_size=0.25, random_state=RANDOM_STATE, stratify=y
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, random_state=RANDOM_STATE, stratify=y_temp
    )

    print(f"\nTrain: {len(X_train)} | Val: {len(X_val)} | Test: {len(X_test)}")

    model = build_model(X_train.shape[1], NUM_CLASSES)
    callbacks = [
        EarlyStopping(patience=10, restore_best_weights=True, verbose=1),
        ReduceLROnPlateau(factor=0.5, patience=5, verbose=1),
    ]
    model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=args.epochs,
        batch_size=args.batch_size,
        callbacks=callbacks,
        verbose=1
    )

    y_pred = np.argmax(model.predict(X_test), axis=1)
    acc = accuracy_score(y_test, y_pred)
    print(f"\nTest accuracy: {acc:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=CONDITION_LABELS))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    # Save Keras model
    h5_path = os.path.join(output_dir, 'aiml_model.h5')
    model.save(h5_path)
    print(f"\nSaved Keras model: {h5_path}")

    # Save feature config (scaler params + feature order) for predictor
    config = {
        'feature_order': FEATURE_ORDER,
        'condition_labels': CONDITION_LABELS,
        'num_classes': NUM_CLASSES,
        'scaler_mean': scaler.mean_.tolist(),
        'scaler_scale': scaler.scale_.tolist(),
        'test_accuracy': float(acc),
    }
    config_path = os.path.join(output_dir, 'feature_config.json')
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)
    print(f"Saved feature config: {config_path}")

    print("\n" + "=" * 50)
    print("Convert to TensorFlow.js:")
    print("  pip install tensorflowjs")
    print(f"  tensorflowjs_converter --input_format keras {h5_path} {output_dir}")
    print("  (Then delete aiml_model.h5 if desired; keep model.json and *.bin)")
    print("=" * 50)


if __name__ == '__main__':
    main()
