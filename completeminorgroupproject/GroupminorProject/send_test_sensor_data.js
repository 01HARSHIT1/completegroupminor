/**
 * Send test sensor data to the backend.
 * Run: node send_test_sensor_data.js
 * Uses: shared/apiClient module
 */
const { postSensors } = require('./shared/apiClient');

function randomIn(min, max) {
  return min + Math.random() * (max - min);
}

function randomSensorData() {
  return {
    current_A: randomIn(1.5, 3.5),
    temperature_C: randomIn(32, 48),
    vibration_rms: randomIn(0.4, 1.5),
    flow_rate_Lmin: randomIn(6, 12),
    tank_level_cm: randomIn(20, 45),
    ph_value: randomIn(6.8, 7.4),
    turbidity_NTU: randomIn(40, 60),
    pump_status: 'OFF',
    pump_runtime_min: 0,
  };
}

async function main() {
  const { getBackendUrl } = require('./shared/config');
  const count = 60;
  const intervalMs = 100;
  console.log(`Sending ${count} readings to ${getBackendUrl()} every ${intervalMs}ms...\n`);

  for (let i = 0; i < count; i++) {
    const ok = await postSensors(randomSensorData()).then(() => true).catch(() => false);
    process.stdout.write(ok ? '.' : 'x');
    if (i < count - 1) {
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  }
  console.log('\nDone. Open the dashboard (http://localhost:5173) and check Condition / Health Score and "AI Model: Active".');
}

main().catch((e) => {
  console.error('Error:', e.message);
  console.error('Make sure the backend is running: cd backend && npm start');
  process.exit(1);
});
