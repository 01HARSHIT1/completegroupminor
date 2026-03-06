/**
 * API routes - sensors, pump, stats, etc.
 */
const { getSensors, getHistory, getPrediction, getPumpStatus, getStats, setPumpOn, setPumpOff, getCsvSimulationId, setPrediction } = require('./store');
const { broadcastSensorUpdate, broadcastPredictionUpdate, broadcastPumpStatus } = require('./websocket');
const csvSim = require('./csvSimulation');
const sensorGrouping = require('./sensorGrouping');

function registerRoutes(app, io, handleIncomingSensor) {
  app.get('/', (req, res) => {
    res.json({ status: 'running', service: 'Smart Irrigation Backend', version: '1.0.0' });
  });

  app.post('/api/sensors', (req, res) => {
    handleIncomingSensor(req.body);
    res.json({ status: 'received', timestamp: Date.now() });
  });

  app.get('/api/sensors', (req, res) => {
    res.json(getSensors());
  });

  app.get('/api/sensors/history', (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 50;
    res.json(getHistory(limit));
  });

  app.get('/api/predictions', (req, res) => {
    res.json(getPrediction());
  });

  app.post('/api/pump/on', async (req, res) => {
    const sensors = getSensors();
    if (sensors.tank_level_cm < 5 && !getCsvSimulationId()) {
      return res.status(400).json({ status: 'error', message: 'Water level too low. Cannot start pump.' });
    }
    setPumpOn();
    sensorGrouping.reset();
    csvSim.start((payload) => handleIncomingSensor(payload));
    broadcastPumpStatus(io, { status: 'ON' });
    res.json({ status: 'success', message: 'Pump turned ON', pump_status: 'ON' });
  });

  app.post('/api/pump/off', async (req, res) => {
    csvSim.stop();
    sensorGrouping.reset();
    setPumpOff();
    broadcastPumpStatus(io, { status: 'OFF' });
    res.json({ status: 'success', message: 'Pump turned OFF', pump_status: 'OFF' });
  });

  app.get('/api/pump/status', (req, res) => {
    res.json(getPumpStatus());
  });

  app.get('/api/stats', (req, res) => {
    res.json(getStats());
  });
}

module.exports = { registerRoutes };
