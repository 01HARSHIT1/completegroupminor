/**
 * Smart Irrigation Digital Twin - Backend Server
 * Handles sensor data, ML predictions, pump control, and WebSocket updates
 */

const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');

// ML Prediction API URL (Python Flask server)
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5001';
const axios = require('axios');
let mlApiAvailable = false;

// Check ML API availability (async, non-blocking)
setTimeout(() => {
  axios.get(`${ML_API_URL}/health`)
    .then(() => {
      mlApiAvailable = true;
      console.log('✓ ML Prediction API connected');
    })
    .catch(() => {
      console.log('⚠ ML Prediction API not available - using rule-based fallback');
      console.log('  Start ML API: cd ml-models && python api_server.py');
    });
}, 2000);


const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Store latest sensor data
let latestSensorData = {
  vibration_rms: 0,
  temperature_C: 0,
  current_A: 0,
  flow_rate_Lmin: 0,
  tank_level_cm: 0,
  ph_value: 7.0,
  turbidity_NTU: 0,
  pump_status: 'OFF',
  pump_runtime_min: 0,
  timestamp: Date.now()
};

// Store historical data (last 100 readings)
let historicalData = [];

// Store latest prediction
let latestPrediction = {
  health_score: 100,
  condition: 'Normal',
  condition_code: 0,
  confidence: 1.0,
  failure_probability: 0.0,
  performance_efficiency: 100,
  leakage_detected: false,
  blockage_detected: false,
  alerts: [],
  recommendations: ['System operating normally']
};

// ==================== API ENDPOINTS ====================

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    service: 'Smart Irrigation Backend',
    version: '1.0.0'
  });
});

// Receive sensor data from ESP32
app.post('/api/sensors', (req, res) => {
  const sensorData = req.body;
  
  // Update latest data
  latestSensorData = {
    ...latestSensorData,
    ...sensorData,
    timestamp: Date.now()
  };
  
  // Add to historical data
  historicalData.push({
    ...latestSensorData,
    timestamp: new Date().toISOString()
  });
  
  // Keep only last 100 readings
  if (historicalData.length > 100) {
    historicalData.shift();
  }
  
  // Generate ML prediction (async, non-blocking)
  if (mlApiAvailable) {
    // Call Python ML API
    axios.post(`${ML_API_URL}/predict`, latestSensorData)
      .then(response => {
        latestPrediction = response.data;
        // Broadcast updated prediction
        io.emit('prediction-update', latestPrediction);
      })
      .catch(error => {
        console.error('ML API error:', error.message);
        latestPrediction = generateRuleBasedPrediction(latestSensorData);
      });
  } else {
    // Fallback rule-based detection
    latestPrediction = generateRuleBasedPrediction(latestSensorData);
  }
  
  // Broadcast to all connected clients
  io.emit('sensor-update', latestSensorData);
  io.emit('prediction-update', latestPrediction);
  
  res.json({ status: 'received', timestamp: Date.now() });
});

// Get latest sensor data
app.get('/api/sensors', (req, res) => {
  res.json(latestSensorData);
});

// Get historical data
app.get('/api/sensors/history', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  res.json(historicalData.slice(-limit));
});

// Get ML predictions
app.get('/api/predictions', (req, res) => {
  res.json(latestPrediction);
});

// Pump control - Turn ON
app.post('/api/pump/on', async (req, res) => {
  // Safety check: water level
  if (latestSensorData.tank_level_cm < 5) {
    return res.status(400).json({
      status: 'error',
      message: 'Water level too low. Cannot start pump.'
    });
  }
  
  // Send command to ESP32 (if connected via HTTP)
  // In production, this would send to ESP32
  latestSensorData.pump_status = 'ON';
  
  // Broadcast update
  io.emit('pump-status', { status: 'ON' });
  
  res.json({
    status: 'success',
    message: 'Pump turned ON',
    pump_status: 'ON'
  });
});

// Pump control - Turn OFF
app.post('/api/pump/off', async (req, res) => {
  latestSensorData.pump_status = 'OFF';
  latestSensorData.pump_runtime_min = 0;
  
  // Broadcast update
  io.emit('pump-status', { status: 'OFF' });
  
  res.json({
    status: 'success',
    message: 'Pump turned OFF',
    pump_status: 'OFF'
  });
});

// Get pump status
app.get('/api/pump/status', (req, res) => {
  res.json({
    pump_status: latestSensorData.pump_status,
    runtime_min: latestSensorData.pump_runtime_min
  });
});

// Get system statistics
app.get('/api/stats', (req, res) => {
  const stats = {
    total_readings: historicalData.length,
    current_health: latestPrediction.health_score,
    current_condition: latestPrediction.condition,
    pump_status: latestSensorData.pump_status,
    active_alerts: latestPrediction.alerts.length,
    last_update: latestSensorData.timestamp
  };
  
  res.json(stats);
});

// ==================== WEBSOCKET HANDLING ====================

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send current data immediately
  socket.emit('sensor-update', latestSensorData);
  socket.emit('prediction-update', latestPrediction);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
  
  // Handle client requests
  socket.on('request-data', () => {
    socket.emit('sensor-update', latestSensorData);
    socket.emit('prediction-update', latestPrediction);
  });
  
  // Handle JSON messages
  socket.on('message', (data) => {
    try {
      const message = typeof data === 'string' ? JSON.parse(data) : data;
      if (message.type === 'request-data') {
        socket.emit('sensor-update', latestSensorData);
        socket.emit('prediction-update', latestPrediction);
      }
    } catch (error) {
      console.error('Socket message error:', error);
    }
  });
});

// ==================== RULE-BASED PREDICTION (Fallback) ====================

function generateRuleBasedPrediction(sensorData) {
  const { vibration_rms, temperature_C, current_A, flow_rate_Lmin, tank_level_cm, pump_status } = sensorData;
  
  let condition = 'Normal';
  let condition_code = 0;
  let alerts = [];
  let recommendations = ['System operating normally'];
  let health_score = 100;
  let failure_probability = 0.0;
  let leakage_detected = false;
  let blockage_detected = false;
  
  // Leakage detection
  if (pump_status === 'ON') {
    const expected_flow = current_A * 2.5; // Expected flow based on current
    const flow_ratio = flow_rate_Lmin / expected_flow;
    
    if (flow_ratio < 0.7 && flow_rate_Lmin > 0) {
      leakage_detected = true;
      condition = 'Leakage Detected';
      condition_code = 1;
      alerts.push('⚠️ Leakage detected - Water loss in pipeline');
      recommendations = ['Check irrigation pipes for leaks', 'Inspect connection points'];
      health_score -= 15;
    }
  }
  
  // Blockage detection
  if (pump_status === 'ON') {
    if (current_A > 4.0 && flow_rate_Lmin < 3.0) {
      blockage_detected = true;
      condition = 'Blockage Suspected';
      condition_code = 2;
      alerts.push('⚠️ Blockage suspected - Reduced water delivery');
      recommendations = ['Clean irrigation pipes', 'Check drip channels'];
      health_score -= 25;
    }
  }
  
  // Failure risk detection
  if (vibration_rms > 2.0 || temperature_C > 60) {
    condition = 'Failure Risk High';
    condition_code = 3;
    failure_probability = 0.3;
    alerts.push('🚨 Pump failure risk high - Maintenance required soon');
    recommendations = ['Schedule maintenance immediately', 'Reduce pump load', 'Monitor temperature closely'];
    health_score -= 40;
  } else if (vibration_rms > 1.5 || temperature_C > 50) {
    failure_probability = 0.15;
    health_score -= 20;
  }
  
  // Performance efficiency
  const expected_flow = current_A * 2.5;
  const performance_efficiency = expected_flow > 0 
    ? Math.min(100, (flow_rate_Lmin / expected_flow) * 100)
    : 0;
  
  if (performance_efficiency < 70) {
    health_score -= 10;
  }
  
  health_score = Math.max(0, Math.min(100, health_score));
  
  return {
    health_score,
    condition,
    condition_code,
    confidence: 0.85,
    failure_probability,
    performance_efficiency,
    leakage_detected,
    blockage_detected,
    alerts,
    recommendations,
    timestamp: Date.now()
  };
}

// ==================== SERVER START ====================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('Smart Irrigation Backend Server');
  console.log('='.repeat(50));
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket server ready`);
  console.log(`ML Predictions: ${predictor ? 'Enabled' : 'Disabled (Rule-based fallback)'}`);
  console.log('='.repeat(50));
});
