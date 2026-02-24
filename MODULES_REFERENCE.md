# Project Modules Reference

Modular structure for easy maintenance and adding new functions.

---

## Shared (Node.js) — `shared/`

Used by: `send_test_sensor_data.js`, `serial_to_backend.js`, `babylon/`

### `shared/config.js`
- `BACKEND_URL`, `BABYLON_URL` — Default URLs
- `API_PATHS` — Path constants (`/api/sensors`, etc.)
- `getBackendUrl()`, `getBabylonUrl()` — Normalized URLs

### `shared/apiClient.js` — Send/Receive API data

| Function | Purpose |
|----------|---------|
| `postSensors(data, url?)` | POST sensor data to backend |
| `postSensorsRaw(jsonStr, url?)` | POST raw JSON (e.g. from Serial) |
| `getSensors(url?)` | GET latest sensors |
| `getSensorsHistory(limit?, url?)` | GET sensor history |
| `getPredictions(url?)` | GET ML predictions |
| `getPumpStatus(url?)` | GET pump status |
| `postPumpOn(url?)` | POST pump ON |
| `postPumpOff(url?)` | POST pump OFF |
| `getStats(url?)` | GET system stats |
| `getTwinState(url?)` | GET twin state (Babylon) |
| `getHealth(url?)` | GET backend health |

**Example — send data:**
```js
const { postSensors } = require('./shared/apiClient');
await postSensors({ flow_rate_Lmin: 12, current_A: 4 });
```

**Example — receive data:**
```js
const { getSensors, getPredictions } = require('./shared/apiClient');
const sensors = await getSensors();
```

---

## Backend — `backend/modules/`

### `config.js`
- `PORT`, `CSV_SIMULATION_PATH`, `DEFAULT_SENSOR_DATA`, etc.

### `store.js` — In-memory state
- `getSensors()`, `setSensors()`, `mergeSensors()`
- `getHistory()`, `pushHistory()`
- `getPrediction()`, `setPrediction()`
- `getPumpStatus()`, `setPumpOn()`, `setPumpOff()`
- `getStats()`

### `csvSimulation.js`
- `load()` — Load CSV file
- `start(onTick)` — Start simulation, calls `onTick(payload)` each interval
- `stop()` — Stop simulation

### `websocket.js`
- `setup(io)` — Socket.IO connection handlers
- `broadcastSensorUpdate(io, data)`
- `broadcastPredictionUpdate(io, data)`
- `broadcastPumpStatus(io, data)`

### `routes.js`
- `registerRoutes(app, io, processSensorData)` — Registers all API routes

### `ml/predictor.js` — AIML (TensorFlow.js + rule-based)
- `loadTensorFlowModel()` — Load TF.js model if present
- `predict(sensorData)` — Run prediction
- `ruleBasedPrediction(sensorData)` — Fallback rules

---

## Frontend — `frontend/src/lib/api/`

### `api/types.ts` — TypeScript interfaces
- `SensorDataBackend`, `PredictionBackend`, `PumpStatus`, `TwinState`

### `api/sensors.ts`
- `getSensorData()` — GET sensors

### `api/predictions.ts`
- `getPredictions()` — GET predictions

### `api/pump.ts`
- `getPumpStatus()`, `turnPumpOn()`, `turnPumpOff()`

### `api/realtime.ts`
- `createRealtimeConnection(onSensor, onPrediction, onPumpStatus)` — WebSocket

### `api/twin.ts`
- `getTwinState()` — GET twin state

**Import:**
```ts
import { getSensorData, turnPumpOn } from "@/lib/api";
```

---

## Adding New Functions

### Send data to backend (script/ESP bridge)
1. Add function to `shared/apiClient.js` (or use `postSensors` for sensors)
2. Use: `const { postSensors } = require('./shared/apiClient');`

### Receive data (script)
1. Use `getSensors()`, `getPredictions()`, etc. from `shared/apiClient`

### New backend API route
1. Add handler in `backend/modules/routes.js`
2. Use `store` for state, `websocket` for broadcast

### New frontend API call
1. Add function in `frontend/src/lib/api/` (e.g. `api/stats.ts`)
2. Export from `api/index.ts`
3. Import in component: `import { getStats } from "@/lib/api";`
