# Backend 4 - Babylon / Digital Twin

Data processing and data transfer for the Digital Twin (and future Babylon 3D visualization). Fetches live state from **Backend 2** (central API) and exposes aggregated twin state.

## Run

```bash
npm install
npm start
```

Server: **http://localhost:5004**

## Endpoints

- `GET /` - Service info
- `GET /health` - Health check
- `GET /api/twin/state` - Aggregated twin state (pump, sensors, health) for dashboard or Babylon client

## Environment

- `BACKEND2_URL` - Central API URL (default: http://localhost:5000)
- `PORT` - Server port (default: 5004)

## Flow

1. Backend 4 polls Backend 2 every 1 second.
2. Dashboard (or a Babylon 3D app) calls `GET /api/twin/state` to get the latest pump/sensor/health snapshot.
3. Use this for 3D scene updates or digital twin visualization without calling Backend 2 directly from the client.
