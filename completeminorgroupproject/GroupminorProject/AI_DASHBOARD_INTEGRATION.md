# AI Model + Dashboard Integration

The **GRU motor health model** is integrated with the dashboard. Predictions (Healthy / Warning / Fault) come from the AI when all services are running.

## Data flow

```
Sensors (ESP32)  -->  Backend (5000)  -->  ML API (5001)  -->  GRU API (5002)
                                                                    |
                        Dashboard (3000)  <--  prediction-update  <--+
```

- **Backend** receives sensor data, calls **ML API** `/predict`.
- **ML API** forwards to **GRU API**; GRU returns `condition` and `health_score` from the 50-step sliding window.
- **ML API** merges GRU result into the response and sends it back to the backend.
- **Backend** broadcasts `prediction-update` to the dashboard via WebSocket.
- **Dashboard** shows **Condition** and **Health Score** from the AI.

## How to run (all 4 services)

### One-time setup

```bash
# Install backend dependencies
cd backend-server && npm install

# Install dashboard dependencies  
cd dashboard && npm install
```

### Start everything

**Option A — Windows (double-click or run in cmd):**
```cmd
START_WITH_AI.bat
```

**Option B — PowerShell:**
```powershell
.\START_WITH_AI.ps1
```

**Option C — Manual (4 terminals):**

1. **Terminal 1 — GRU API**
   ```bash
   cd motor_digital_twin
   python gru_api.py
   ```
   → http://localhost:5002

2. **Terminal 2 — ML API**
   ```bash
   cd ml-models
   python api_server.py
   ```
   → http://localhost:5001

3. **Terminal 3 — Backend**
   ```bash
   cd backend-server
   npm start
   ```
   → http://localhost:5000

4. **Terminal 4 — Dashboard**
   ```bash
   cd dashboard
   npm run dev
   ```
   → http://localhost:3000

### Open the dashboard

**http://localhost:3000**

- Home and Dashboard pages show **Condition** and **Health Score**.
- When the GRU API is running and has 50 samples in the buffer, those values come from the **GRU model** (Current + Temperature + Vibration).
- Before 50 samples, or if the GRU API is not running, the ML API uses rule-based or existing predictor fallback.

## Integration points in code

| Component | Role |
|-----------|------|
| `motor_digital_twin/gru_api.py` | Flask app on 5002; buffer + GRU inference; returns `health_class`, `condition`, `health_score`. |
| `ml-models/api_server.py` | Calls `GRU_API_URL` (5002) on `/predict`, merges `condition` and `health_score` into response. |
| `backend-server/index.js` | Calls `ML_API_URL` (5001) on POST sensor data; broadcasts `prediction-update` to dashboard. |
| `dashboard/lib/api.ts` | Fetches `/api/predictions`, subscribes to WebSocket `prediction-update`; uses `condition`, `health_score`. |

## If GRU API is not running

- ML API (5001) still responds; it uses the existing predictor or rule-based logic.
- Dashboard still works; **Condition** and **Health Score** come from the fallback, not the GRU.

So: **yes, the AI model is integrated with the dashboard.** Run the four services (e.g. via `START_WITH_AI.bat` or manually), then open **http://localhost:3000** to use the dashboard with the GRU model.
