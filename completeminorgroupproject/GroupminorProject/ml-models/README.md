# Machine Learning Models

## Overview

This directory contains ML models for predictive maintenance of the smart irrigation system.

## Models

1. **Random Forest Classifier** - Multi-class fault classification
2. **LSTM Network** - Time-series failure prediction
3. **Isolation Forest** - Anomaly detection

## Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Create directories
mkdir -p models datasets
```

## Dataset Format

CSV file with columns:
- `vibration_rms` - Motor vibration (g)
- `temperature_C` - Motor temperature (°C)
- `current_A` - Motor current (A)
- `flow_rate_Lmin` - Water flow rate (L/min)
- `tank_level_cm` - Water level (cm)
- `ph_value` - Water pH (0-14)
- `turbidity_NTU` - Water turbidity (NTU)
- `pump_runtime_min` - Pump runtime (minutes)
- `label` - Target class (0=Normal, 1=Leakage, 2=Blockage, 3=Failure)

## Training

```bash
# Place your dataset at datasets/sensor_data.csv
python train_model.py
```

Models will be saved to `models/` directory.

## Prediction

```python
from predict import IrrigationPredictor

predictor = IrrigationPredictor()
result = predictor.predict(sensor_data)
```

## Model Performance

Expected metrics:
- **Accuracy**: > 90%
- **Precision**: > 85% (per class)
- **Recall**: > 85% (per class)
- **F1-Score**: > 0.85

## Integration

The prediction API can be integrated with:
- Dashboard backend
- Mobile app
- Real-time monitoring system
