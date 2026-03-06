/**
 * Serial-to-Backend Bridge
 * Reads JSON lines from ESP32 over USB, forwards to backend via shared apiClient.
 * Usage: node serial_to_backend.js [COM_PORT] [BACKEND_URL]
 */
const path = require('path');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { postSensorsRaw } = require(path.join(__dirname, '../../shared/apiClient'));
const { getBackendUrl } = require(path.join(__dirname, '../../shared/config'));

const COM_PORT = process.argv[2] || 'COM3';
const BACKEND_URL = process.argv[3] ? process.argv[3].replace(/\/$/, '') : getBackendUrl();
const BAUDRATE = 115200;

async function listPorts() {
  const ports = await SerialPort.list();
  if (ports.length === 0) {
    console.error('No serial ports found. Is ESP32 connected via USB?');
    process.exit(1);
  }
  console.log('Available ports:');
  ports.forEach(p => console.log(`  ${p.path} - ${p.manufacturer || p.friendlyName || 'Unknown'}`));
  return ports;
}

async function main() {
  let portPath = COM_PORT;

  if (COM_PORT === 'COM3' || COM_PORT === 'list' || COM_PORT === '-l') {
    const ports = await listPorts();
    if (COM_PORT === 'list' || COM_PORT === '-l') {
      console.log('\nUsage: node serial_to_backend.js <PORT> [BACKEND_URL]');
      process.exit(0);
    }
    portPath = ports[0]?.path || COM_PORT;
    console.log(`\nUsing ${portPath} (or pass port as first arg)\n`);
  }

  const port = new SerialPort({
    path: portPath,
    baudRate: BAUDRATE,
    autoOpen: false,
  });

  const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

  parser.on('data', async (line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed[0] !== '{') return;
    try {
      JSON.parse(trimmed);
      const ok = await postSensorsRaw(trimmed, BACKEND_URL);
      console.log(ok ? `[OK] ${trimmed.substring(0, 60)}...` : `[FAIL] ${trimmed.substring(0, 40)}...`);
    } catch (_) { /* Skip invalid JSON */ }
  });

  port.open((err) => {
    if (err) {
      console.error('Serial open error:', err.message);
      process.exit(1);
    }
    console.log(`Bridge: ${portPath} -> ${BACKEND_URL}/api/sensors`);
    console.log('Waiting for ESP32 JSON lines...\n');
  });
}

main().catch(console.error);
