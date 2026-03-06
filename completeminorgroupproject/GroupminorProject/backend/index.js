/**
 * Smart Irrigation Digital Twin - Backend Server
 * Modular: config, store, csvSimulation, sensorGrouping, routes, websocket, ml/predictor
 *
 * Data flow: ESP/sensors -> API (every second) -> sensorGrouping (buffer 3) ->
 *   mean per param (1-3s window) -> ML model -> WebSocket
 */
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const fs = require('fs');

const { loadTensorFlowModel, predict: mlPredict, ruleBasedPrediction } = require('./ml/predictor');
const { config, store, csvSimulation, sensorGrouping, websocket, routes } = require('./modules');

const { PORT, CSV_SIMULATION_PATH } = config;
const { mergeSensors, pushHistory, setPrediction, getSensors, getHistory } = store;

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Called when 3 samples are buffered: compute mean, run ML, broadcast.
 * Receives grouped (simplified) data for time window 1-3, 4-6, etc.
 */
async function processGroupedSensorData(groupedData) {
  mergeSensors(groupedData);
  pushHistory({ timestamp: new Date().toISOString(), time_window: groupedData.time_window });
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Grouped ${groupedData.time_window}] flow=${groupedData.flow_rate_Lmin?.toFixed(2)} cur=${groupedData.current_A?.toFixed(2)} -> ML`);
  }

  try {
    const pred = await mlPredict(getSensors(), { history: getHistory(10) });
    setPrediction(pred);
  } catch (err) {
    console.error('ML predict error:', err.message);
    setPrediction(ruleBasedPrediction(getSensors()));
  }

  websocket.broadcastSensorUpdate(io, getSensors());
  websocket.broadcastPredictionUpdate(io, store.getPrediction());
}

/** Incoming sensor data (every second from ESP) - push to buffer for grouping */
function handleIncomingSensor(data) {
  sensorGrouping.push(data);
}

sensorGrouping.setOnGrouped(processGroupedSensorData);

websocket.setup(io);
routes.registerRoutes(app, io, handleIncomingSensor);

server.listen(PORT, async () => {
  console.log('='.repeat(50));
  console.log('Smart Irrigation Backend Server');
  console.log('='.repeat(50));
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`WebSocket ready`);
  console.log(`Sensor grouping: 3 samples (1-3s) -> mean -> ML`);
  const tfLoaded = await loadTensorFlowModel();
  console.log(`AIML: ${tfLoaded ? 'TensorFlow.js' : 'Rule-based'}`);
  if (fs.existsSync(CSV_SIMULATION_PATH)) {
    console.log('CSV simulation ready');
  }
  console.log('='.repeat(50));
});
