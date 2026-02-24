/**
 * CSV simulation - load and stream dummy sensor data when no ESP32.
 */
const fs = require('fs');
const path = require('path');
const { CSV_SIMULATION_PATH, CSV_SIMULATION_INTERVAL_MS } = require('./config');
const { getCsvSimulationId, setCsvSimulationId, mergeSensors, pushHistory } = require('./store');

let csvRows = [];
let csvRowIndex = 0;

function load() {
  if (csvRows.length > 0) return true;
  try {
    if (!fs.existsSync(CSV_SIMULATION_PATH)) {
      console.log('CSV simulation: file not found:', CSV_SIMULATION_PATH);
      return false;
    }
    const raw = fs.readFileSync(CSV_SIMULATION_PATH, 'utf8');
    const lines = raw.trim().split('\n');
    if (lines.length < 2) return false;
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts.length >= 4) {
        csvRows.push({
          current_A: parseFloat(parts[0]) || 0,
          vibration_rms: parseFloat(parts[1]) || 0,
          temperature_C: parseFloat(parts[2]) || 0,
          flow_rate_Lmin: parseFloat(parts[3]) || 0,
        });
      }
    }
    console.log('CSV simulation: loaded', csvRows.length, 'rows from', path.basename(CSV_SIMULATION_PATH));
    return csvRows.length > 0;
  } catch (e) {
    console.error('CSV simulation load error:', e.message);
    return false;
  }
}

function start(onTick) {
  if (getCsvSimulationId()) return;
  if (!load()) return;
  csvRowIndex = 0;
  const tick = () => {
    const row = csvRows[csvRowIndex];
    csvRowIndex = (csvRowIndex + 1) % csvRows.length;
    const payload = {
      ...row,
      tank_level_cm: 35,
      ph_value: 7.0,
      turbidity_NTU: 50,
      pump_status: 'ON',
      pump_runtime_min: Math.floor(csvRowIndex / 2),
    };
    onTick(payload);
  };
  tick();
  const id = setInterval(tick, CSV_SIMULATION_INTERVAL_MS);
  setCsvSimulationId(id);
  console.log('CSV simulation: started (interval', CSV_SIMULATION_INTERVAL_MS, 'ms)');
}

function stop() {
  const id = getCsvSimulationId();
  if (id) {
    clearInterval(id);
    setCsvSimulationId(null);
    console.log('CSV simulation: stopped');
  }
}

module.exports = { load, start, stop };
