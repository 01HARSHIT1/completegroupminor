# How to See the AI Model Working on the Dashboard

The dashboard shows **Condition** and **Health Score** from the **Pump GRU AI** (trained on `LEVEL1_LEVEL2_PUMP_DATASET_IMPROVED.csv`) only when all services are running **and** the Pump API has received at least **50 sensor samples** (about 5 seconds of data).

---

## 1. Start all 4 services (in 4 terminals)

**Terminal 1 — Pump API (AI model)**  
```bash
cd pump_dataset_generator
python pump_api.py
```
→ Runs on **http://localhost:5003**. Must be running for AI predictions.

**Terminal 2 — ML API (calls Pump API)**  
```bash
cd ml-models
python api_server.py
```
→ Runs on **http://localhost:5001**. Calls Pump API and merges condition/health_score.

**Terminal 3 — Backend**  
```bash
cd backend-server
npm start
```
→ Runs on **http://localhost:5000**. Sends sensor data to ML API and pushes updates to the dashboard.

**Terminal 4 — Dashboard**  
```bash
cd dashboard
npm run dev
```
→ Runs on **http://localhost:3000**. Open this in the browser.

---

## 2. Send sensor data so the AI can run

The Pump model needs **50 readings** in a row before it outputs a prediction. If no data is sent, the dashboard shows default/rule-based values and you will **not** see "AI Model: Active".

**Option A — Test script (easiest)**  
From the project root:
```bash
node send_test_sensor_data.js
```
This sends 60 fake sensor readings to the backend. After about 50, the Pump API returns **Healthy** / **Warning** / **Fault** and the ML API adds `prediction_source: "pump_ai"`.  
Refresh or keep the dashboard open; within a few seconds you should see:
- **Condition** from the AI (e.g. Healthy / Warning / Fault)
- **Health Score** from the AI
- Green banner: **"AI Model (Pump GRU): Active"** on the home page
- Badge **"AI Model (Pump GRU): Active"** on the Dashboard page

**Option B — Manual POST**  
Send POST requests to `http://localhost:5000/api/sensors` with a body like:
```json
{
  "current_A": 2.1,
  "temperature_C": 42,
  "vibration_rms": 1.0,
  "flow_rate_Lmin": 8.5
}
```
Send at least 50 times (e.g. every 100–200 ms). Then check the dashboard.

**Option C — ESP32 / real hardware**  
When you connect real sensors, the ESP32 (or similar) should POST to the backend the same way. After 50 samples, the AI will run and the dashboard will show AI predictions.

---

## 3. How to tell if the AI is running

- **Backend (5000):** Logs like `ML Prediction API connected` mean it talks to the ML API.
- **ML API (5001):** No extra log when it uses the Pump API; it just returns the merged response.
- **Pump API (5003):** In the browser, open `http://localhost:5003/health`. You should see `"pump_model_loaded": true`.
- **Dashboard:**  
  - **AI active:** Green banner on the home page: *"AI Model (Pump GRU): Active"* and the Dashboard page shows the **"AI Model (Pump GRU): Active"** badge.  
  - **AI not active:** No green banner, no badge; Condition/Health Score are from rule-based or default logic.

---

## 4. Checklist

| Step | Action |
|------|--------|
| 1 | Pump API running (5003) |
| 2 | ML API running (5001) |
| 3 | Backend running (5000) |
| 4 | Dashboard running (3000) |
| 5 | Run `node send_test_sensor_data.js` (or send 50+ sensor POSTs) |
| 6 | Open http://localhost:3000 and check Condition, Health Score, and "AI Model: Active" |

---

## 5. If you still don’t see the AI

- **Pump API not running:** Start `python pump_api.py` in `pump_dataset_generator`. Without it, the ML API never gets AI predictions.
- **No sensor data:** Run `node send_test_sensor_data.js` so the backend receives at least 50 readings. Until then, the Pump API returns "Collecting data..." and the dashboard will not show AI.
- **Backend can’t reach ML API:** Ensure the ML API is on 5001 and the backend uses `ML_API_URL=http://localhost:5001` (or the correct host).
- **ML API can’t reach Pump API:** Ensure the Pump API is on 5003. On another machine, set `PUMP_API_URL=http://<pump-server-ip>:5003` when starting the ML API.

Once the chain is running and 50+ samples are sent, the dashboard will show the AI model working with the green banner and badge.
