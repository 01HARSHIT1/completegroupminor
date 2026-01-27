# ML Dataset Format and Training Approach

## Dataset Structure

### Feature Set (Input Parameters)

Each data sample contains the following features collected from sensors:

| Feature Name | Data Type | Range/Unit | Description |
|--------------|-----------|------------|-------------|
| `vibration_rms` | Float | 0-16 g | Root mean square of vibration magnitude |
| `temperature_C` | Float | 0-100 °C | Motor temperature reading |
| `current_A` | Float | 0-30 A | Motor current consumption |
| `flow_rate_Lmin` | Float | 0-30 L/min | Water flow rate from flow sensor |
| `tank_level_cm` | Float | 0-50 cm | Water level in storage tank |
| `ph_value` | Float | 0-14 | Water pH level |
| `turbidity_NTU` | Float | 0-1000 NTU | Water turbidity reading |
| `pump_runtime_min` | Integer | 0-1440 min | Continuous pump operation time |
| `timestamp` | DateTime | - | Data collection timestamp |

### Target Labels (Output Classes)

| Label | Class Name | Condition Description |
|-------|------------|----------------------|
| `0` | **Normal** | Pump operating normally, all parameters within safe range |
| `1` | **Leakage** | Water loss detected - flow rate lower than expected for given current |
| `2` | **Blockage** | Pipeline obstruction - high current, low flow, increased vibration |
| `3` | **Failure Risk** | Motor fault predicted - abnormal vibration, temperature, or current patterns |

### Dataset Collection Scenarios

#### Scenario 1: Normal Operation
- **Duration**: 2-3 hours continuous operation
- **Conditions**: All sensors in normal range
- **Expected Samples**: ~1000-1500 samples
- **Label**: 0 (Normal)

#### Scenario 2: Leakage Simulation
- **Method**: Create intentional small leak in pipeline
- **Duration**: 1-2 hours
- **Expected Pattern**: 
  - Flow rate decreases
  - Tank level drops faster
  - Current remains normal
- **Label**: 1 (Leakage)

#### Scenario 3: Blockage Simulation
- **Method**: Partially block irrigation pipe
- **Duration**: 1-2 hours
- **Expected Pattern**:
  - Current increases (motor under load)
  - Flow rate decreases significantly
  - Vibration increases slightly
  - Temperature may rise
- **Label**: 2 (Blockage)

#### Scenario 4: Failure Risk Simulation
- **Method**: 
  - Overload motor (restrict flow completely)
  - Run motor continuously until overheating
  - Simulate bearing fault (add weight to motor)
- **Duration**: 30-60 minutes
- **Expected Pattern**:
  - Vibration spikes
  - Temperature rises abnormally
  - Current fluctuates
- **Label**: 3 (Failure Risk)

### Dataset Format (CSV)

```csv
vibration_rms,temperature_C,current_A,flow_rate_Lmin,tank_level_cm,ph_value,turbidity_NTU,pump_runtime_min,label
0.5,35.2,2.1,8.5,25.3,7.2,45.0,15,0
0.6,36.1,2.3,8.2,24.8,7.1,48.0,20,0
0.4,35.8,2.0,7.8,24.1,7.3,50.0,25,1
1.2,42.5,4.5,2.1,23.5,7.0,55.0,30,2
2.5,58.3,6.8,1.5,22.0,6.9,60.0,35,3
```

### Dataset Size Requirements

- **Minimum**: 5,000 samples (balanced across all classes)
- **Recommended**: 10,000-15,000 samples
- **Training/Validation/Test Split**: 70% / 15% / 15%

## Machine Learning Models

### Model 1: Random Forest Classifier

**Purpose**: Multi-class fault classification

**Hyperparameters**:
```python
{
    'n_estimators': 100,
    'max_depth': 20,
    'min_samples_split': 5,
    'min_samples_leaf': 2,
    'random_state': 42
}
```

**Expected Performance**: 90-95% accuracy

### Model 2: LSTM Network

**Purpose**: Time-series failure prediction

**Architecture**:
- Input Layer: 8 features
- LSTM Layer 1: 64 units
- LSTM Layer 2: 32 units
- Dense Layer: 16 units
- Output Layer: 4 classes (softmax)

**Training Parameters**:
- Epochs: 100
- Batch Size: 32
- Optimizer: Adam
- Learning Rate: 0.001
- Loss: Categorical Crossentropy

### Model 3: Isolation Forest (Anomaly Detection)

**Purpose**: Detect unknown anomalies

**Hyperparameters**:
```python
{
    'n_estimators': 100,
    'contamination': 0.1,
    'random_state': 42
}
```

## Training Workflow

### Step 1: Data Collection
```python
# Collect sensor data for each scenario
# Save to CSV files
# Label data appropriately
```

### Step 2: Data Preprocessing
```python
# Load dataset
# Handle missing values
# Normalize features (StandardScaler)
# Encode labels
# Split into train/validation/test sets
```

### Step 3: Feature Engineering
```python
# Create derived features:
# - Vibration trend (moving average)
# - Temperature gradient
# - Current-to-flow ratio
# - Efficiency metric (flow/current)
```

### Step 4: Model Training
```python
# Train Random Forest
# Train LSTM
# Train Isolation Forest
# Hyperparameter tuning
# Cross-validation
```

### Step 5: Model Evaluation
```python
# Accuracy, Precision, Recall
# Confusion Matrix
# ROC-AUC curves
# Classification Report
```

### Step 6: Model Deployment
```python
# Save trained models
# Create prediction API
# Integrate with dashboard
```

## Prediction Output Format

### JSON Response
```json
{
    "timestamp": "2026-01-27T10:30:00",
    "pump_status": "ON",
    "health_score": 82,
    "predictions": {
        "condition": "Blockage Suspected",
        "condition_code": 2,
        "confidence": 0.87,
        "failure_probability": 0.18,
        "performance_efficiency": 65
    },
    "sensor_readings": {
        "vibration_rms": 1.2,
        "temperature_C": 42.5,
        "current_A": 4.5,
        "flow_rate_Lmin": 2.1,
        "tank_level_cm": 23.5,
        "ph_value": 7.0,
        "turbidity_NTU": 55.0
    },
    "alerts": [
        "⚠️ Blockage detected - Flow reduced to 2.1 L/min",
        "⚠️ Motor current elevated - 4.5A (Normal: 2-3A)"
    ],
    "recommendations": [
        "Check irrigation pipes for obstructions",
        "Clean drip channels",
        "Monitor motor temperature"
    ]
}
```

## Performance Metrics

### Classification Metrics
- **Accuracy**: > 90%
- **Precision**: > 85% (per class)
- **Recall**: > 85% (per class)
- **F1-Score**: > 0.85

### Business Metrics
- **False Positive Rate**: < 10%
- **Early Detection Time**: 2-4 hours before failure
- **Maintenance Cost Reduction**: 30-40%

## Model Training Script Structure

```
ml-models/
├── data_collection/
│   ├── collect_data.py
│   └── label_data.py
├── preprocessing/
│   ├── clean_data.py
│   └── feature_engineering.py
├── training/
│   ├── train_random_forest.py
│   ├── train_lstm.py
│   └── train_isolation_forest.py
├── evaluation/
│   ├── evaluate_models.py
│   └── visualize_results.py
└── deployment/
    ├── model_api.py
    └── predict.py
```

## Continuous Learning

The system should support:
- **Online Learning**: Update models with new data
- **Retraining Schedule**: Weekly/monthly retraining
- **Model Versioning**: Track model performance over time
- **A/B Testing**: Compare model versions
