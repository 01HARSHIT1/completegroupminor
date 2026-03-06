/**
 * AIML Predictor - TensorFlow.js + rule-based fallback
 * Runs in main Node.js backend; no Python API needed.
 *
 * Model features (train_aiml.py): current, temperature, vibration, flow,
 * pump_runtime, health, flow_trend, zero_flow_seconds, divider_voltage, sensor_distance_m
 *
 * To deploy:
 *   1. python backend/ml/train_aiml.py --dataset pump_dataset_generator/LEVEL1_LEVEL2_PUMP_DATASET_IMPROVED.csv
 *   2. pip install tensorflowjs
 *   3. tensorflowjs_converter --input_format keras backend/ml/models/aiml_model.h5 backend/ml/models/
 */

const path = require('path');
const fs = require('fs');
const { buildModelInput } = require('./features');

let tf = null;
let tfModel = null;
const MODEL_DIR = path.join(__dirname, 'models');
const CONDITION_LABELS = ['Normal', 'Leakage Detected', 'Blockage Suspected', 'Failure Risk High'];

async function loadTensorFlowModel() {
  if (tf !== null) return tfModel !== null;
  try {
    tf = require('@tensorflow/tfjs-node');
  } catch (e) {
    tf = undefined;
    if (e.code !== 'MODULE_NOT_FOUND') console.warn('TF.js:', e.message);
    return false;
  }
  try {
    const modelPath = path.join(MODEL_DIR, 'model.json');
    if (fs.existsSync(modelPath)) {
      tfModel = await tf.loadLayersModel(`file://${modelPath}`);
      console.log('✓ TensorFlow.js model loaded from', MODEL_DIR);
      return true;
    }
  } catch (e) {
    console.warn('TF.js model:', e.message);
  }
  return false;
}

/**
 * Rule-based prediction (matches Python rule_based_prediction)
 * Used when no TF.js model is available
 */
function ruleBasedPrediction(sensorData) {
  const vibration = sensorData.vibration_rms ?? 0;
  const temp = sensorData.temperature_C ?? 0;
  const current = sensorData.current_A ?? 0;
  const flow = sensorData.flow_rate_Lmin ?? 0;
  const pumpStatus = sensorData.pump_status || 'OFF';

  let condition = 'Normal';
  let conditionCode = 0;
  const alerts = [];
  let recommendations = ['System operating normally'];
  let healthScore = 100;
  let failureProbability = 0.0;
  let leakageDetected = false;
  let blockageDetected = false;

  if (pumpStatus === 'ON') {
    const expectedFlow = current * 2.5;
    if (expectedFlow > 0) {
      const flowRatio = flow / expectedFlow;
      if (flowRatio < 0.7 && flow > 0) {
        leakageDetected = true;
        condition = 'Leakage Detected';
        conditionCode = 1;
        alerts.push('⚠️ Leakage detected - Water loss in pipeline');
        recommendations = ['Check irrigation pipes for leaks', 'Inspect connection points'];
        healthScore -= 15;
      }
    }
    if (current > 4.0 && flow < 3.0) {
      blockageDetected = true;
      condition = 'Blockage Suspected';
      conditionCode = 2;
      alerts.push('⚠️ Blockage suspected - Reduced water delivery');
      recommendations = ['Clean irrigation pipes', 'Check drip channels'];
      healthScore -= 25;
    }
  }

  if (vibration > 2.0 || temp > 60) {
    condition = 'Failure Risk High';
    conditionCode = 3;
    failureProbability = 0.3;
    alerts.push('🚨 Pump failure risk high - Maintenance required soon');
    recommendations = ['Schedule maintenance immediately', 'Reduce pump load', 'Monitor temperature closely'];
    healthScore -= 40;
  } else if (vibration > 1.5 || temp > 50) {
    failureProbability = 0.15;
    healthScore -= 20;
  }

  const expectedFlow = current * 2.5;
  const performanceEfficiency = expectedFlow > 0
    ? Math.min(100, (flow / expectedFlow) * 100)
    : 0;
  if (performanceEfficiency < 70) healthScore -= 10;

  healthScore = Math.max(0, Math.min(100, healthScore));

  return {
    health_score: healthScore,
    condition,
    condition_code: conditionCode,
    confidence: 0.85,
    failure_probability: failureProbability,
    performance_efficiency: performanceEfficiency,
    leakage_detected: leakageDetected,
    blockage_detected: blockageDetected,
    alerts,
    recommendations,
    timestamp: Date.now()
  };
}

/**
 * Predict using TensorFlow.js model if loaded, else rule-based
 * @param {Object} sensorData - Sensor readings
 * @param {Object} options - { history: [] } for flow_trend derivation
 */
async function predict(sensorData, options = {}) {
  const { history = [] } = options;
  const useTf = tfModel && tf && typeof tf.tensor2d === 'function';
  if (useTf) {
    try {
      const features = buildModelInput(sensorData, history);
      const input = tf.tensor2d([features]);
      const pred = tfModel.predict(input);
      const predData = await pred.data();
      pred.dispose();
      input.dispose();

      const conditionIdx = predData.indexOf(Math.max(...predData));
      const condition = CONDITION_LABELS[conditionIdx] || 'Normal';

      const baseResult = ruleBasedPrediction(sensorData);
      return {
        ...baseResult,
        condition,
        condition_code: conditionIdx,
        confidence: predData[conditionIdx],
        prediction_source: 'tensorflow_js'
      };
    } catch (e) {
      console.warn('TF.js predict error:', e.message);
    }
  }
  return ruleBasedPrediction(sensorData);
}

module.exports = {
  loadTensorFlowModel,
  predict,
  ruleBasedPrediction
};
