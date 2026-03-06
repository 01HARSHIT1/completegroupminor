/**
 * Shared config - API URLs, paths. Use in backend, scripts, babylon.
 */
const BACKEND_URL = process.env.BACKEND_URL || process.env.VITE_API_URL || 'http://localhost:5000';
const BABYLON_URL = process.env.BABYLON_URL || process.env.VITE_BABYLON_API_URL || 'http://localhost:5004';

const API_PATHS = {
  sensors: '/api/sensors',
  sensorsHistory: '/api/sensors/history',
  predictions: '/api/predictions',
  pumpOn: '/api/pump/on',
  pumpOff: '/api/pump/off',
  pumpStatus: '/api/pump/status',
  stats: '/api/stats',
  twinState: '/api/twin/state',
  health: '/health',
};

function getBackendUrl() {
  return BACKEND_URL.replace(/\/$/, '');
}

function getBabylonUrl() {
  return BABYLON_URL.replace(/\/$/, '');
}

module.exports = {
  BACKEND_URL,
  BABYLON_URL,
  API_PATHS,
  getBackendUrl,
  getBabylonUrl,
};
