/**
 * API Client - send/receive data from Backend and Babylon.
 * Use in: send_test_sensor_data.js, serial_to_backend.js, babylon, or any Node script.
 */
const { getBackendUrl, getBabylonUrl, API_PATHS } = require('./config');

const base = getBackendUrl();

// ---- SEND (POST) ----
async function postSensors(sensorData, backendUrl = base) {
  const url = `${backendUrl.replace(/\/$/, '')}${API_PATHS.sensors}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sensorData),
  });
  if (!res.ok) throw new Error(`POST sensors: ${res.status}`);
  return res.json();
}

async function postSensorsRaw(jsonString, backendUrl = base) {
  const url = `${backendUrl.replace(/\/$/, '')}${API_PATHS.sensors}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: jsonString,
  });
  return res.ok;
}

// ---- RECEIVE (GET) ----
async function getSensors(backendUrl = base) {
  const url = `${backendUrl.replace(/\/$/, '')}${API_PATHS.sensors}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET sensors: ${res.status}`);
  return res.json();
}

async function getSensorsHistory(limit = 50, backendUrl = base) {
  const url = `${backendUrl.replace(/\/$/, '')}${API_PATHS.sensorsHistory}?limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET sensors/history: ${res.status}`);
  return res.json();
}

async function getPredictions(backendUrl = base) {
  const url = `${backendUrl.replace(/\/$/, '')}${API_PATHS.predictions}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET predictions: ${res.status}`);
  return res.json();
}

async function getPumpStatus(backendUrl = base) {
  const url = `${backendUrl.replace(/\/$/, '')}${API_PATHS.pumpStatus}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET pump/status: ${res.status}`);
  return res.json();
}

async function postPumpOn(backendUrl = base) {
  const url = `${backendUrl.replace(/\/$/, '')}${API_PATHS.pumpOn}`;
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) throw new Error(`POST pump/on: ${res.status}`);
  return res.json();
}

async function postPumpOff(backendUrl = base) {
  const url = `${backendUrl.replace(/\/$/, '')}${API_PATHS.pumpOff}`;
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) throw new Error(`POST pump/off: ${res.status}`);
  return res.json();
}

async function getStats(backendUrl = base) {
  const url = `${backendUrl.replace(/\/$/, '')}${API_PATHS.stats}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET stats: ${res.status}`);
  return res.json();
}

async function getTwinState(babylonUrl = getBabylonUrl()) {
  const url = `${babylonUrl.replace(/\/$/, '')}${API_PATHS.twinState}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getHealth(backendUrl = base) {
  const url = `${backendUrl.replace(/\/$/, '')}${API_PATHS.health}`;
  const res = await fetch(url);
  return res.ok ? res.json() : null;
}

module.exports = {
  postSensors,
  postSensorsRaw,
  getSensors,
  getSensorsHistory,
  getPredictions,
  getPumpStatus,
  postPumpOn,
  postPumpOff,
  getStats,
  getTwinState,
  getHealth,
};
