/**
 * Backend config - paths, ports, constants
 */
const path = require('path');

const PORT = parseInt(process.env.PORT, 10) || 5000;
const CSV_SIMULATION_PATH = process.env.CSV_SIMULATION_PATH || path.join(__dirname, '..', 'data', 'dummy_sensor_data.csv');
const CSV_SIMULATION_INTERVAL_MS = parseInt(process.env.CSV_SIMULATION_INTERVAL_MS, 10) || 500;

const DEFAULT_SENSOR_DATA = {
  vibration_rms: 0,
  temperature_C: 0,
  current_A: 0,
  flow_rate_Lmin: 0,
  tank_level_cm: 0,
  ph_value: 7.0,
  turbidity_NTU: 0,
  pump_status: 'OFF',
  pump_runtime_min: 0,
  timestamp: Date.now(),
};

const DEFAULT_PREDICTION = {
  health_score: 100,
  condition: 'Normal',
  condition_code: 0,
  confidence: 1.0,
  failure_probability: 0.0,
  performance_efficiency: 100,
  leakage_detected: false,
  blockage_detected: false,
  alerts: [],
  recommendations: ['System operating normally'],
};

module.exports = {
  PORT,
  CSV_SIMULATION_PATH,
  CSV_SIMULATION_INTERVAL_MS,
  DEFAULT_SENSOR_DATA,
  DEFAULT_PREDICTION,
};
