# Backend Server - Smart Irrigation Digital Twin

Node.js/Express backend server for handling sensor data, ML predictions, and pump control.

## Quick Start

```bash
# Install dependencies
npm install

# Run in development mode (auto-restart)
npm run dev

# Run in production mode
npm start
```

Server runs on: `http://localhost:5000`

## API Endpoints

### Sensor Data
- `POST /api/sensors` - Receive sensor data from ESP32
- `GET /api/sensors` - Get latest sensor data
- `GET /api/sensors/history` - Get historical data (last 50 readings)

### Pump Control
- `POST /api/pump/on` - Turn pump ON
- `POST /api/pump/off` - Turn pump OFF
- `GET /api/pump/status` - Get pump status

### Predictions
- `GET /api/predictions` - Get ML predictions

### Statistics
- `GET /api/stats` - Get system statistics

## WebSocket Events

### Server → Client
- `sensor-update` - Real-time sensor data
- `prediction-update` - ML predictions
- `pump-status` - Pump status changes

### Client → Server
- `request-data` - Request current data

## ML Integration

The server automatically loads ML models from `../ml-models/` if available.

If models are not found, it falls back to rule-based detection.

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/irrigation (optional)
```

## Testing

```bash
# Test sensor endpoint
curl http://localhost:5000/api/sensors

# Test pump control
curl -X POST http://localhost:5000/api/pump/on
curl -X POST http://localhost:5000/api/pump/off

# Test predictions
curl http://localhost:5000/api/predictions
```
