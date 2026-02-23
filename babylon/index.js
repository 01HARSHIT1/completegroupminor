/**
 * Backend 4 - Babylon / Digital Twin
 * Data processing and data transfer for 3D visualization and digital twin.
 * Fetches live state from Backend 2 (central API) and exposes aggregated twin state.
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const BACKEND2_URL = process.env.BACKEND2_URL || 'http://localhost:5000';
const PORT = process.env.PORT || 5004;

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// Cache of twin state (updated by polling Backend 2)
let twinState = {
  pumpOn: false,
  sensors: {
    current_A: 0,
    temperature_C: 0,
    vibration_rms: 0,
    flow_rate_Lmin: 0,
    voltage_V: 230,
    tank_level_cm: 0,
  },
  health: {
    condition: 'Normal',
    health_score: 100,
    confidence: 0,
  },
  lastSync: null,
  timestamp: null,
};

async function fetchFromBackend2() {
  try {
    const [sensorsRes, predictionsRes] = await Promise.all([
      axios.get(`${BACKEND2_URL}/api/sensors`, { timeout: 3000 }),
      axios.get(`${BACKEND2_URL}/api/predictions`, { timeout: 3000 }),
    ]);
    const sensors = sensorsRes.data;
    const prediction = predictionsRes.data;
    twinState = {
      pumpOn: sensors.pump_status === 'ON',
      sensors: {
        current_A: sensors.current_A ?? 0,
        temperature_C: sensors.temperature_C ?? 0,
        vibration_rms: sensors.vibration_rms ?? 0,
        flow_rate_Lmin: sensors.flow_rate_Lmin ?? 0,
        voltage_V: sensors.voltage_V ?? 230,
        tank_level_cm: sensors.tank_level_cm ?? 0,
      },
      health: {
        condition: prediction.condition ?? 'Normal',
        health_score: prediction.health_score ?? 100,
        confidence: prediction.confidence ?? 0,
      },
      lastSync: new Date().toISOString(),
      timestamp: Date.now(),
    };
    return true;
  } catch (err) {
    return false;
  }
}

// Poll Backend 2 every 1 second
setInterval(fetchFromBackend2, 1000);
fetchFromBackend2();

app.get('/', (req, res) => {
  res.json({
    service: 'Smart Irrigation - Babylon / Digital Twin Backend',
    version: '1.0.0',
    backend2: BACKEND2_URL,
    endpoints: {
      twinState: 'GET /api/twin/state',
      health: 'GET /health',
    },
  });
});

app.get('/health', (req, res) => {
  res.json({ ok: true, lastSync: twinState.lastSync });
});

app.get('/api/twin/state', (req, res) => {
  res.json(twinState);
});

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('Babylon / Digital Twin Backend (Backend 4)');
  console.log('='.repeat(50));
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Backend 2 (central API): ${BACKEND2_URL}`);
  console.log('GET /api/twin/state - aggregated twin state for 3D/visualization');
  console.log('='.repeat(50));
});
