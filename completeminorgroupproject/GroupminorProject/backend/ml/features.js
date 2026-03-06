/**
 * Feature extraction for AIML model
 * Maps sensor data -> normalized feature vector (matches train_aiml.py)
 */

const path = require('path');
const fs = require('fs');

const FEATURE_ORDER = [
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
];

let config = null;

function loadFeatureConfig() {
  if (config !== null) return config;
  try {
    const configPath = path.join(__dirname, 'models', 'feature_config.json');
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config;
    }
  } catch (e) {
    // ignore
  }
  return null;
}

/**
 * Extract feature vector from sensor data (raw, not normalized)
 * Uses defaults for missing fields
 */
function extractFeatures(sensorData, options = {}) {
  const {
    history = [],
    flowTrendWindow = 5,
  } = options;

  const get = (key, def = 0) => {
    const v = sensorData[key];
    return v !== undefined && v !== null ? Number(v) : def;
  };

  // Core
  const current_A = get('current_A', 0);
  const temperature_C = get('temperature_C', 0);
  const vibration_rms = get('vibration_rms', 0);
  const flow_rate_Lmin = get('flow_rate_Lmin', 0);
  const pump_runtime_min = get('pump_runtime_min', 0);
  const health = get('health_score', sensorData.health_score ?? sensorData.health ?? 100);
  const divider_voltage = get('divider_voltage', 1.0);
  const sensor_distance_m = get('sensor_distance_m', 0);

  // Derived: flow_trend from recent history
  let flow_trend = 0;
  if (history.length >= 2 && flowTrendWindow > 0) {
    const recent = history.slice(-flowTrendWindow).map(h => h.flow_rate_Lmin ?? 0);
    if (recent.length >= 2) {
      const first = recent[0];
      const last = recent[recent.length - 1];
      flow_trend = Math.max(-2, Math.min(2, (last - first) / (recent.length || 1)));
    }
  }

  // Derived: zero_flow_seconds (when flow near zero)
  const zero_flow_seconds = Math.abs(flow_rate_Lmin) < 0.01 ? 1 : 0;

  return [
    current_A,
    temperature_C,
    vibration_rms,
    flow_rate_Lmin,
    pump_runtime_min,
    health,
    flow_trend,
    zero_flow_seconds,
    divider_voltage,
    sensor_distance_m,
  ];
}

/**
 * Normalize features using scaler from config
 */
function normalizeFeatures(features, cfg) {
  if (!cfg || !cfg.scaler_mean || !cfg.scaler_scale) return features;
  return features.map((v, i) => {
    const mean = cfg.scaler_mean[i] ?? 0;
    const scale = cfg.scaler_scale[i] ?? 1;
    return (v - mean) / (scale || 1);
  });
}

/**
 * Build model input: extract -> normalize
 */
function buildModelInput(sensorData, history = []) {
  const cfg = loadFeatureConfig();
  const raw = extractFeatures(sensorData, { history });
  const normalized = normalizeFeatures(raw, cfg);
  return normalized;
}

module.exports = {
  FEATURE_ORDER,
  extractFeatures,
  normalizeFeatures,
  buildModelInput,
  loadFeatureConfig,
};
