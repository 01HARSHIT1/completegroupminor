"""
Python API Server for ML Predictions
Can be called by Node.js backend via HTTP
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from predict import IrrigationPredictor
import os

app = Flask(__name__)
CORS(app)

# Initialize predictor
predictor = None
try:
    model_dir = os.path.join(os.path.dirname(__file__), 'models')
    predictor = IrrigationPredictor(model_dir=model_dir)
    print("✓ ML models loaded successfully")
except Exception as e:
    print(f"⚠ Error loading ML models: {e}")
    print("  Using rule-based fallback")
    predictor = None

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'running',
        'ml_models_loaded': predictor is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Predict endpoint - receives sensor data, returns predictions"""
    try:
        sensor_data = request.json
        
        if not sensor_data:
            return jsonify({'error': 'No sensor data provided'}), 400
        
        # Use ML predictor if available
        if predictor:
            result = predictor.predict(sensor_data)
        else:
            # Fallback rule-based prediction
            result = rule_based_prediction(sensor_data)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def rule_based_prediction(sensor_data):
    """Fallback rule-based prediction when ML models not available"""
    vibration = sensor_data.get('vibration_rms', 0)
    temp = sensor_data.get('temperature_C', 0)
    current = sensor_data.get('current_A', 0)
    flow = sensor_data.get('flow_rate_Lmin', 0)
    pump_status = sensor_data.get('pump_status', 'OFF')
    
    condition = 'Normal'
    condition_code = 0
    alerts = []
    recommendations = ['System operating normally']
    health_score = 100
    failure_probability = 0.0
    leakage_detected = False
    blockage_detected = False
    
    if pump_status == 'ON':
        # Leakage detection
        expected_flow = current * 2.5
        if expected_flow > 0:
            flow_ratio = flow / expected_flow
            if flow_ratio < 0.7 and flow > 0:
                leakage_detected = True
                condition = 'Leakage Detected'
                condition_code = 1
                alerts.append('⚠️ Leakage detected - Water loss in pipeline')
                recommendations = ['Check irrigation pipes for leaks', 'Inspect connection points']
                health_score -= 15
        
        # Blockage detection
        if current > 4.0 and flow < 3.0:
            blockage_detected = True
            condition = 'Blockage Suspected'
            condition_code = 2
            alerts.append('⚠️ Blockage suspected - Reduced water delivery')
            recommendations = ['Clean irrigation pipes', 'Check drip channels']
            health_score -= 25
    
    # Failure risk
    if vibration > 2.0 or temp > 60:
        condition = 'Failure Risk High'
        condition_code = 3
        failure_probability = 0.3
        alerts.append('🚨 Pump failure risk high - Maintenance required soon')
        recommendations = ['Schedule maintenance immediately', 'Reduce pump load']
        health_score -= 40
    elif vibration > 1.5 or temp > 50:
        failure_probability = 0.15
        health_score -= 20
    
    # Performance
    expected_flow = current * 2.5
    performance_efficiency = min(100, (flow / expected_flow) * 100) if expected_flow > 0 else 0
    
    health_score = max(0, min(100, health_score))
    
    return {
        'health_score': health_score,
        'condition': condition,
        'condition_code': condition_code,
        'confidence': 0.85,
        'failure_probability': failure_probability,
        'performance_efficiency': performance_efficiency,
        'leakage_detected': leakage_detected,
        'blockage_detected': blockage_detected,
        'alerts': alerts,
        'recommendations': recommendations
    }

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"Starting ML Prediction API server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)
