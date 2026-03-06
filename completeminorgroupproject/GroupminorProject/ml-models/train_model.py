"""
Machine Learning Model Training for Smart Irrigation Predictive Maintenance

Models:
1. Random Forest - Multi-class fault classification
2. LSTM - Time-series failure prediction
3. Isolation Forest - Anomaly detection
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.optimizers import Adam
import joblib
import json

# Configuration
RANDOM_STATE = 42
TEST_SIZE = 0.15
VALIDATION_SIZE = 0.15

def load_dataset(filepath):
    """Load sensor dataset from CSV"""
    df = pd.read_csv(filepath)
    print(f"Dataset loaded: {len(df)} samples")
    print(f"Features: {df.columns.tolist()}")
    print(f"Label distribution:\n{df['label'].value_counts()}")
    return df

def preprocess_data(df):
    """Preprocess and prepare data for training"""
    # Separate features and labels
    feature_columns = [
        'vibration_rms', 'temperature_C', 'current_A', 
        'flow_rate_Lmin', 'tank_level_cm', 'ph_value', 
        'turbidity_NTU', 'pump_runtime_min'
    ]
    
    X = df[feature_columns].values
    y = df['label'].values
    
    # Normalize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Split data
    X_train, X_temp, y_train, y_temp = train_test_split(
        X_scaled, y, test_size=TEST_SIZE + VALIDATION_SIZE, 
        random_state=RANDOM_STATE, stratify=y
    )
    
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=TEST_SIZE / (TEST_SIZE + VALIDATION_SIZE),
        random_state=RANDOM_STATE, stratify=y_temp
    )
    
    print(f"\nData split:")
    print(f"Training: {len(X_train)} samples")
    print(f"Validation: {len(X_val)} samples")
    print(f"Test: {len(X_test)} samples")
    
    return X_train, X_val, X_test, y_train, y_val, y_test, scaler

def train_random_forest(X_train, y_train, X_val, y_val):
    """Train Random Forest classifier"""
    print("\n" + "="*50)
    print("Training Random Forest Classifier")
    print("="*50)
    
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=20,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=RANDOM_STATE,
        n_jobs=-1
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    train_acc = accuracy_score(y_train, model.predict(X_train))
    val_acc = accuracy_score(y_val, model.predict(X_val))
    
    print(f"Training Accuracy: {train_acc:.4f}")
    print(f"Validation Accuracy: {val_acc:.4f}")
    
    return model

def train_lstm(X_train, y_train, X_val, y_val):
    """Train LSTM network for time-series prediction"""
    print("\n" + "="*50)
    print("Training LSTM Network")
    print("="*50)
    
    # Reshape data for LSTM (samples, timesteps, features)
    # Using sequence length of 10
    sequence_length = 10
    
    # Create sequences
    def create_sequences(X, y, seq_len):
        X_seq, y_seq = [], []
        for i in range(len(X) - seq_len + 1):
            X_seq.append(X[i:i+seq_len])
            y_seq.append(y[i+seq_len-1])
        return np.array(X_seq), np.array(y_seq)
    
    X_train_seq, y_train_seq = create_sequences(X_train, y_train, sequence_length)
    X_val_seq, y_val_seq = create_sequences(X_val, y_val, sequence_length)
    
    # One-hot encode labels
    num_classes = len(np.unique(y_train))
    y_train_cat = tf.keras.utils.to_categorical(y_train_seq, num_classes)
    y_val_cat = tf.keras.utils.to_categorical(y_val_seq, num_classes)
    
    # Build model
    model = Sequential([
        LSTM(64, return_sequences=True, input_shape=(sequence_length, X_train.shape[1])),
        Dropout(0.2),
        LSTM(32, return_sequences=False),
        Dropout(0.2),
        Dense(16, activation='relu'),
        Dense(num_classes, activation='softmax')
    ])
    
    model.compile(
        optimizer=Adam(learning_rate=0.001),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    # Train
    history = model.fit(
        X_train_seq, y_train_cat,
        validation_data=(X_val_seq, y_val_cat),
        epochs=100,
        batch_size=32,
        verbose=1
    )
    
    return model, history

def train_isolation_forest(X_train):
    """Train Isolation Forest for anomaly detection"""
    print("\n" + "="*50)
    print("Training Isolation Forest (Anomaly Detection)")
    print("="*50)
    
    model = IsolationForest(
        n_estimators=100,
        contamination=0.1,
        random_state=RANDOM_STATE
    )
    
    model.fit(X_train)
    
    print("Isolation Forest trained")
    
    return model

def evaluate_model(model, X_test, y_test, model_type='random_forest'):
    """Evaluate model performance"""
    print("\n" + "="*50)
    print(f"Evaluating {model_type}")
    print("="*50)
    
    if model_type == 'lstm':
        # For LSTM, need to create sequences
        sequence_length = 10
        X_test_seq, y_test_seq = create_sequences(X_test, y_test, sequence_length)
        y_test_cat = tf.keras.utils.to_categorical(y_test_seq, len(np.unique(y_test)))
        
        predictions = model.predict(X_test_seq)
        y_pred = np.argmax(predictions, axis=1)
        accuracy = accuracy_score(y_test_seq, y_pred)
    else:
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
    
    print(f"Test Accuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test if model_type != 'lstm' else y_test_seq, y_pred))
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test if model_type != 'lstm' else y_test_seq, y_pred))
    
    return accuracy

def save_models(rf_model, lstm_model, iso_model, scaler):
    """Save trained models"""
    print("\n" + "="*50)
    print("Saving Models")
    print("="*50)
    
    # Save Random Forest
    joblib.dump(rf_model, 'models/random_forest_model.pkl')
    print("✓ Random Forest saved")
    
    # Save LSTM
    lstm_model.save('models/lstm_model.h5')
    print("✓ LSTM model saved")
    
    # Save Isolation Forest
    joblib.dump(iso_model, 'models/isolation_forest_model.pkl')
    print("✓ Isolation Forest saved")
    
    # Save scaler
    joblib.dump(scaler, 'models/scaler.pkl')
    print("✓ Scaler saved")
    
    print("\nAll models saved to 'models/' directory")

def main():
    """Main training pipeline"""
    print("="*50)
    print("Smart Irrigation ML Model Training")
    print("="*50)
    
    # Load dataset
    df = load_dataset('datasets/sensor_data.csv')
    
    # Preprocess
    X_train, X_val, X_test, y_train, y_val, y_test, scaler = preprocess_data(df)
    
    # Train models
    rf_model = train_random_forest(X_train, y_train, X_val, y_val)
    lstm_model, lstm_history = train_lstm(X_train, y_train, X_val, y_val)
    iso_model = train_isolation_forest(X_train)
    
    # Evaluate
    rf_acc = evaluate_model(rf_model, X_test, y_test, 'random_forest')
    lstm_acc = evaluate_model(lstm_model, X_test, y_test, 'lstm')
    
    # Save models
    import os
    os.makedirs('models', exist_ok=True)
    save_models(rf_model, lstm_model, iso_model, scaler)
    
    # Save training results
    results = {
        'random_forest_accuracy': float(rf_acc),
        'lstm_accuracy': float(lstm_acc),
        'test_samples': len(X_test)
    }
    
    with open('models/training_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print("\n" + "="*50)
    print("Training Complete!")
    print("="*50)

if __name__ == '__main__':
    main()
