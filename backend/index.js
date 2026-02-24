/**
 * Smart Irrigation Digital Twin - Backend Server
 * Modular: config, store, csvSimulation, routes, websocket, ml/predictor
 */
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const fs = require('fs');

const { loadTensorFlowModel, predict: mlPredict, ruleBasedPrediction } = require('./ml/predictor');
const { config, store, csvSimulation, websocket, routes } = require('./modules');

const { PORT, CSV_SIMULATION_PATH } = config;
const { mergeSensors, pushHistory, setPrediction } = store;

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

async function processSensorData(sensorData) {
  mergeSensors(sensorData);
  pushHistory({ timestamp: new Date().toISOString() });

  try {
    const pred = await mlPredict(store.getSensors());
    setPrediction(pred);
  } catch (err) {
    console.error('ML predict error:', err.message);
    setPrediction(ruleBasedPrediction(store.getSensors()));
  }

  websocket.broadcastSensorUpdate(io, store.getSensors());
  websocket.broadcastPredictionUpdate(io, store.getPrediction());
}

websocket.setup(io);
routes.registerRoutes(app, io, processSensorData);

server.listen(PORT, async () => {
  console.log('='.repeat(50));
  console.log('Smart Irrigation Backend Server');
  console.log('='.repeat(50));
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`WebSocket ready`);
  const tfLoaded = await loadTensorFlowModel();
  console.log(`AIML: ${tfLoaded ? 'TensorFlow.js' : 'Rule-based'}`);
  if (fs.existsSync(CSV_SIMULATION_PATH)) {
    console.log('CSV simulation ready');
  }
  console.log('='.repeat(50));
});
