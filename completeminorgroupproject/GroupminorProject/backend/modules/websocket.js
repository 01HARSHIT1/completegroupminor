/**
 * WebSocket (Socket.IO) setup - broadcast sensor and prediction updates.
 */
const { getSensors, getPrediction } = require('./store');

function setup(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.emit('sensor-update', getSensors());
    socket.emit('prediction-update', getPrediction());

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    socket.on('request-data', () => {
      socket.emit('sensor-update', getSensors());
      socket.emit('prediction-update', getPrediction());
    });

    socket.on('message', (data) => {
      try {
        const msg = typeof data === 'string' ? JSON.parse(data) : data;
        if (msg.type === 'request-data') {
          socket.emit('sensor-update', getSensors());
          socket.emit('prediction-update', getPrediction());
        }
      } catch (err) {
        console.error('Socket message error:', err);
      }
    });
  });
}

function broadcastSensorUpdate(io, data) {
  io.emit('sensor-update', data);
}

function broadcastPredictionUpdate(io, data) {
  io.emit('prediction-update', data);
}

function broadcastPumpStatus(io, data) {
  io.emit('pump-status', data);
}

module.exports = {
  setup,
  broadcastSensorUpdate,
  broadcastPredictionUpdate,
  broadcastPumpStatus,
};
