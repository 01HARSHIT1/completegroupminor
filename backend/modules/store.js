/**
 * In-memory store - sensors, history, prediction.
 * Single source of truth for backend state.
 */
const { DEFAULT_SENSOR_DATA, DEFAULT_PREDICTION } = require('./config');

const store = {
  latestSensorData: { ...DEFAULT_SENSOR_DATA },
  historicalData: [],
  latestPrediction: { ...DEFAULT_PREDICTION },
  csvSimulationIntervalId: null,
};

const MAX_HISTORY = 100;

function getSensors() {
  return store.latestSensorData;
}

function setSensors(data) {
  store.latestSensorData = { ...store.latestSensorData, ...data, timestamp: Date.now() };
  return store.latestSensorData;
}

function mergeSensors(data) {
  return setSensors(data);
}

function pushHistory(entry) {
  store.historicalData.push({ ...store.latestSensorData, ...entry });
  if (store.historicalData.length > MAX_HISTORY) store.historicalData.shift();
}

function getHistory(limit = 50) {
  return store.historicalData.slice(-limit);
}

function getPrediction() {
  return store.latestPrediction;
}

function setPrediction(pred) {
  store.latestPrediction = pred;
  return store.latestPrediction;
}

function getPumpStatus() {
  return {
    pump_status: store.latestSensorData.pump_status || 'OFF',
    runtime_min: store.latestSensorData.pump_runtime_min || 0,
  };
}

function setPumpOn() {
  store.latestSensorData.pump_status = 'ON';
  return store.latestSensorData;
}

function setPumpOff() {
  store.latestSensorData.pump_status = 'OFF';
  store.latestSensorData.pump_runtime_min = 0;
  return store.latestSensorData;
}

function getStats() {
  return {
    total_readings: store.historicalData.length,
    current_health: store.latestPrediction.health_score,
    current_condition: store.latestPrediction.condition,
    pump_status: store.latestSensorData.pump_status,
    active_alerts: (store.latestPrediction.alerts || []).length,
    last_update: store.latestSensorData.timestamp,
  };
}

function getCsvSimulationId() {
  return store.csvSimulationIntervalId;
}

function setCsvSimulationId(id) {
  store.csvSimulationIntervalId = id;
}

function reset() {
  store.latestSensorData = { ...DEFAULT_SENSOR_DATA };
  store.historicalData = [];
  store.latestPrediction = { ...DEFAULT_PREDICTION };
}

module.exports = {
  store,
  getSensors,
  setSensors,
  mergeSensors,
  pushHistory,
  getHistory,
  getPrediction,
  setPrediction,
  getPumpStatus,
  setPumpOn,
  setPumpOff,
  getStats,
  getCsvSimulationId,
  setCsvSimulationId,
  reset,
};
