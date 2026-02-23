"""
Real-time Prediction API for Smart Irrigation System

Uses trained ML models to predict:
1. Pump performance
2. Leakage detection
3. Blockage detection
4. Failure prediction
"""

import numpy as np
import joblib
import tensorflow as tf
from tensorflow.keras.models import load_model
import json

class IrrigationPredictor:
    def __init__(self, model_dir='models'):
        """Initialize predictor with trained models"""
        self.model_dir = model_dir
        self.scaler = joblib.load(f'{model_dir}/scaler.pkl')
        self.rf_model = joblib.load(f'{model_dir}/random_forest_model.pkl')
        self.lstm_model = load_model(f'{model_dir}/lstm_model.h5')
        self.iso_model = joblib.load(f'{model_dir}/isolation_forest_model.pkl')
        
        # LSTM sequence buffer
        self.sequence_buffer = []
        self.sequence_length = 10
        
        print("ML models loaded successfully")
    
    def preprocess(self, sensor_data):
        """Preprocess sensor data for prediction"""
        features = np.array([[
            sensor_data['vibration_rms'],
            sensor_data['temperature_C'],
            sensor_data['current_A'],
            sensor_data['flow_rate_Lmin'],
            sensor_data['tank_level_cm'],
            sensor_data['ph_value'],
            sensor_data['turbidity_NTU'],
            sensor_data.get('pump_runtime_min', 0)
        ]])
        
        # Normalize
        features_scaled = self.scaler.transform(features)
        return features_scaled
    
    def predict_condition(self, sensor_data):
        """Predict pump condition using Random Forest"""
        features = self.preprocess(sensor_data)
        prediction = self.rf_model.predict(features)[0]
        probabilities = self.rf_model.predict_proba(features)[0]
        
        condition_map = {
            0: 'Normal',
            1: 'Leakage Detected',
            2: 'Blockage Suspected',
            3: 'Failure Risk High'
        }
        
        return {
            'condition_code': int(prediction),
            'condition': condition_map[prediction],
            'confidence': float(max(probabilities))
        }
    
    def predict_failure_lstm(self, sensor_data):
        """Predict failure using LSTM (time-series)"""
        features = self.preprocess(sensor_data)
        
        # Add to sequence buffer
        self.sequence_buffer.append(features[0])
        if len(self.sequence_buffer) > self.sequence_length:
            self.sequence_buffer.pop(0)
        
        # Need enough history for LSTM
        if len(self.sequence_buffer) < self.sequence_length:
            return {'failure_probability': 0.0, 'status': 'insufficient_data'}
        
        # Create sequence
        sequence = np.array([self.sequence_buffer])
        
        # Predict
        prediction = self.lstm_model.predict(sequence, verbose=0)
        failure_prob = prediction[0][3]  # Class 3 = Failure Risk
        
        return {
            'failure_probability': float(failure_prob),
            'status': 'predicted'
        }
    
    def detect_anomaly(self, sensor_data):
        """Detect anomalies using Isolation Forest"""
        features = self.preprocess(sensor_data)
        prediction = self.iso_model.predict(features)[0]
        
        return {
            'is_anomaly': prediction == -1,
            'anomaly_score': float(self.iso_model.score_samples(features)[0])
        }
    
    def calculate_performance(self, sensor_data):
        """Calculate pump performance efficiency"""
        # Performance = (Actual Flow / Expected Flow) * 100
        # Expected flow based on current consumption
        current = sensor_data['current_A']
        flow = sensor_data['flow_rate_Lmin']
        
        # Expected flow (calibrate based on your pump)
        expected_flow = current * 2.5  # Example: 2.5 L/min per Ampere
        
        if expected_flow > 0:
            efficiency = min(100, (flow / expected_flow) * 100)
        else:
            efficiency = 0
        
        return {
            'performance_efficiency': float(efficiency),
            'expected_flow': float(expected_flow),
            'actual_flow': float(flow)
        }
    
    def detect_leakage(self, sensor_data):
        """Detect leakage based on flow analysis"""
        flow = sensor_data['flow_rate_Lmin']
        current = sensor_data['current_A']
        tank_level = sensor_data['tank_level_cm']
        
        # Leakage indicators:
        # 1. Flow rate lower than expected for given current
        # 2. Tank level dropping faster than expected
        
        expected_flow = current * 2.5
        flow_ratio = flow / expected_flow if expected_flow > 0 else 0
        
        leakage_detected = flow_ratio < 0.7  # Flow < 70% of expected
        
        return {
            'leakage_detected': leakage_detected,
            'flow_ratio': float(flow_ratio),
            'severity': 'high' if flow_ratio < 0.5 else 'medium' if flow_ratio < 0.7 else 'low'
        }
    
    def detect_blockage(self, sensor_data):
        """Detect blockage based on pressure/flow analysis"""
        flow = sensor_data['flow_rate_Lmin']
        current = sensor_data['current_A']
        vibration = sensor_data['vibration_rms']
        
        # Blockage indicators:
        # 1. High current (motor under load)
        # 2. Low flow rate
        # 3. Increased vibration
        
        current_high = current > 4.0  # Threshold
        flow_low = flow < 3.0  # Threshold
        vibration_high = vibration > 1.0  # Threshold
        
        blockage_detected = (current_high and flow_low) or (vibration_high and flow_low)
        
        return {
            'blockage_detected': blockage_detected,
            'indicators': {
                'high_current': current_high,
                'low_flow': flow_low,
                'high_vibration': vibration_high
            }
        }
    
    def predict(self, sensor_data):
        """Complete prediction pipeline"""
        # Get all predictions
        condition = self.predict_condition(sensor_data)
        failure = self.predict_failure_lstm(sensor_data)
        anomaly = self.detect_anomaly(sensor_data)
        performance = self.calculate_performance(sensor_data)
        leakage = self.detect_leakage(sensor_data)
        blockage = self.detect_blockage(sensor_data)
        
        # Calculate health score
        health_score = self.calculate_health_score(
            condition, failure, performance, leakage, blockage
        )
        
        # Generate alerts
        alerts = self.generate_alerts(condition, leakage, blockage, failure)
        
        # Generate recommendations
        recommendations = self.generate_recommendations(
            condition, leakage, blockage, failure
        )
        
        return {
            'timestamp': sensor_data.get('timestamp', ''),
            'health_score': health_score,
            'condition': condition['condition'],
            'condition_code': condition['condition_code'],
            'confidence': condition['confidence'],
            'failure_probability': failure.get('failure_probability', 0.0),
            'performance_efficiency': performance['performance_efficiency'],
            'leakage_detected': leakage['leakage_detected'],
            'blockage_detected': blockage['blockage_detected'],
            'is_anomaly': anomaly['is_anomaly'],
            'alerts': alerts,
            'recommendations': recommendations
        }
    
    def calculate_health_score(self, condition, failure, performance, leakage, blockage):
        """Calculate overall health score (0-100)"""
        base_score = 100
        
        # Deduct based on condition
        condition_penalty = {
            0: 0,   # Normal
            1: 15,  # Leakage
            2: 25,  # Blockage
            3: 40   # Failure Risk
        }
        base_score -= condition_penalty.get(condition['condition_code'], 0)
        
        # Deduct based on failure probability
        base_score -= failure.get('failure_probability', 0) * 30
        
        # Deduct based on performance
        base_score -= (100 - performance['performance_efficiency']) * 0.2
        
        # Deduct for leakage
        if leakage['leakage_detected']:
            base_score -= 10
        
        # Deduct for blockage
        if blockage['blockage_detected']:
            base_score -= 15
        
        return max(0, min(100, base_score))
    
    def generate_alerts(self, condition, leakage, blockage, failure):
        """Generate alert messages"""
        alerts = []
        
        if condition['condition_code'] == 1:
            alerts.append("⚠️ Leakage detected - Water loss in pipeline")
        if condition['condition_code'] == 2:
            alerts.append("⚠️ Blockage suspected - Reduced water delivery")
        if condition['condition_code'] == 3:
            alerts.append("🚨 Pump failure risk high - Maintenance required soon")
        
        if leakage['leakage_detected']:
            alerts.append(f"⚠️ Leakage detected - Flow ratio: {leakage['flow_ratio']:.2f}")
        
        if blockage['blockage_detected']:
            alerts.append("⚠️ Pipe blockage detected - Clean irrigation system")
        
        if failure.get('failure_probability', 0) > 0.2:
            alerts.append(f"🚨 High failure probability: {failure['failure_probability']*100:.1f}%")
        
        return alerts
    
    def generate_recommendations(self, condition, leakage, blockage, failure):
        """Generate maintenance recommendations"""
        recommendations = []
        
        if condition['condition_code'] == 0:
            recommendations.append("System operating normally")
            recommendations.append("Continue regular monitoring")
        
        if leakage['leakage_detected']:
            recommendations.append("Check irrigation pipes for leaks")
            recommendations.append("Inspect connection points")
            recommendations.append("Monitor water level closely")
        
        if blockage['blockage_detected']:
            recommendations.append("Clean irrigation pipes")
            recommendations.append("Check drip channels")
            recommendations.append("Inspect filter system")
        
        if condition['condition_code'] == 3 or failure.get('failure_probability', 0) > 0.2:
            recommendations.append("Schedule maintenance immediately")
            recommendations.append("Reduce pump load")
            recommendations.append("Monitor temperature closely")
        
        return recommendations

# Example usage
if __name__ == '__main__':
    # Initialize predictor
    predictor = IrrigationPredictor()
    
    # Example sensor data
    sensor_data = {
        'vibration_rms': 1.2,
        'temperature_C': 42.5,
        'current_A': 4.5,
        'flow_rate_Lmin': 2.1,
        'tank_level_cm': 23.5,
        'ph_value': 7.0,
        'turbidity_NTU': 55.0,
        'pump_runtime_min': 30,
        'timestamp': '2026-01-27T10:30:00'
    }
    
    # Get prediction
    result = predictor.predict(sensor_data)
    
    print(json.dumps(result, indent=2))
