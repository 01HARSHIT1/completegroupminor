/**
 * Sensor grouping - buffer 3 samples (1-3 second window), compute mean per parameter.
 * Simplified data is passed to ML model for prediction.
 */

const SAMPLES_PER_WINDOW = 3;

const NUMERIC_KEYS = [
  'current_A', 'temperature_C', 'vibration_rms', 'flow_rate_Lmin',
  'divider_voltage', 'tank_level_cm', 'ph_value', 'turbidity_NTU',
  'pump_runtime_min', 'health_score', 'sensor_distance_m'
];

const BOOLEAN_KEYS = ['divider_ok'];

function computeMean(buffer) {
  const result = { time_window: null };
  const n = buffer.length;

  for (const key of NUMERIC_KEYS) {
    let sum = 0;
    let count = 0;
    for (const row of buffer) {
      const v = row[key];
      if (typeof v === 'number' && !Number.isNaN(v)) {
        sum += v;
        count++;
      }
    }
    if (count > 0) {
      result[key] = Math.round((sum / count) * 100) / 100;
    } else {
      result[key] = 0;
    }
  }

  for (const key of BOOLEAN_KEYS) {
    let trueCount = 0;
    for (const row of buffer) {
      if (row[key] === true || row[key] === 'true' || row[key] === 1) trueCount++;
    }
    result[key] = trueCount >= Math.ceil(n / 2);
  }

  // Preserve non-numeric fields from last row
  const last = buffer[buffer.length - 1];
  if (last) {
    for (const key of Object.keys(last)) {
      if (!(key in result) && typeof last[key] !== 'number') {
        result[key] = last[key];
      }
    }
  }

  result.timestamp = Date.now();
  result.pump_status = last?.pump_status ?? 'ON';
  return result;
}

let buffer = [];
let windowStart = 1;
let onGrouped = null;

function setOnGrouped(callback) {
  onGrouped = callback;
}

function push(reading) {
  buffer.push({ ...reading });
  if (buffer.length >= SAMPLES_PER_WINDOW) {
    const grouped = computeMean(buffer);
    grouped.time_window = `${windowStart}-${windowStart + SAMPLES_PER_WINDOW - 1}`;
    windowStart += SAMPLES_PER_WINDOW;
    buffer = [];
    if (typeof onGrouped === 'function') {
      onGrouped(grouped);
    }
  }
}

function getBufferLength() {
  return buffer.length;
}

function reset() {
  buffer = [];
  windowStart = 1;
}

module.exports = {
  SAMPLES_PER_WINDOW,
  setOnGrouped,
  push,
  getBufferLength,
  reset,
};
