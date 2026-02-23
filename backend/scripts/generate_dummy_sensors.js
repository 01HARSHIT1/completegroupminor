/**
 * Generates dummy_sensor_data.csv with current_A, vibration_rms, temperature_C, flow_rate_Lmin.
 * Run from project root: node backend/scripts/generate_dummy_sensors.js
 * Output: backend/data/dummy_sensor_data.csv
 */

const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'data');
const outPath = path.join(outDir, 'dummy_sensor_data.csv');

function randomIn(min, max) {
  return min + Math.random() * (max - min);
}

const rows = [];
rows.push('current_A,vibration_rms,temperature_C,flow_rate_Lmin');

// Healthy (0-120): normal operation
for (let i = 0; i < 120; i++) {
  rows.push([
    randomIn(1.8, 2.8).toFixed(3),
    randomIn(0.3, 0.8).toFixed(3),
    randomIn(35, 42).toFixed(2),
    randomIn(7, 11).toFixed(2)
  ].join(','));
}
// Warning (121-200): degrading
for (let i = 0; i < 80; i++) {
  rows.push([
    randomIn(2.5, 3.5).toFixed(3),
    randomIn(0.9, 1.4).toFixed(3),
    randomIn(45, 55).toFixed(2),
    randomIn(5, 8).toFixed(2)
  ].join(','));
}
// Fault (201-280): high risk
for (let i = 0; i < 80; i++) {
  rows.push([
    randomIn(3.2, 4.2).toFixed(3),
    randomIn(1.5, 2.2).toFixed(3),
    randomIn(55, 65).toFixed(2),
    randomIn(2, 5).toFixed(2)
  ].join(','));
}
// Recovery (281-400): back to healthy
for (let i = 0; i < 120; i++) {
  rows.push([
    randomIn(1.8, 2.8).toFixed(3),
    randomIn(0.3, 0.9).toFixed(3),
    randomIn(36, 44).toFixed(2),
    randomIn(7, 11).toFixed(2)
  ].join(','));
}

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, rows.join('\n'), 'utf8');
console.log('Written:', outPath, '(' + (rows.length - 1) + ' data rows)');
