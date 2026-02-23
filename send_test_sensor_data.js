/**
 * Send test sensor data to the backend so the Pump AI model buffer fills
 * and the dashboard shows AI predictions (Healthy / Warning / Fault).
 *
 * Run: node send_test_sensor_data.js
 * Requires: Backend running on http://localhost:5000
 *
 * Sends 60 readings at 100ms interval (~6 sec). After 50 samples,
 * Pump API returns AI prediction and dashboard shows "AI Model: Active".
 */

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

function randomIn(min, max) {
  return min + Math.random() * (max - min);
}

async function sendOne() {
  const body = {
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
  const res = await fetch(`${BACKEND_URL}/api/sensors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.ok;
}

async function main() {
  const count = 60;
  const intervalMs = 100;
  console.log(`Sending ${count} sensor readings to ${BACKEND_URL} every ${intervalMs}ms...`);
  console.log('After ~50 samples, Pump AI will return predictions and dashboard will show "AI Model: Active".\n');

  for (let i = 0; i < count; i++) {
    const ok = await sendOne();
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
