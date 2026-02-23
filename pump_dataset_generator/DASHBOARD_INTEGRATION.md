# Dashboard + New Pump AI (Improved Dataset) Integration

## What was fixed

1. **GET / 404 on port 5003** — Added a root route so visiting `http://192.168.0.101:5003/` returns JSON (no more "page is not working").
2. **Dashboard using new AI** — ML API (5001) now calls Pump API (5003) first and uses its **condition** and **health_score** in the response, so the dashboard shows the model trained on `LEVEL1_LEVEL2_PUMP_DATASET_IMPROVED.csv`.

## Where to open the dashboard

- **Pump API (5003):** Backend service only. Opening `http://192.168.0.101:5003` in the browser now shows a short JSON info page (no 404).
- **Dashboard (Next.js):** Open **http://192.168.0.101:3000** (or `http://localhost:3000`) to use the actual dashboard. Health and Condition there come from the new pump AI when the chain below is running.

## Run order (all on same PC or adjust hosts)

1. **Pump API (5003)**  
   `cd pump_dataset_generator` → `python pump_api.py`  
   → Serves `/`, `/health`, `/predict`.

2. **ML API (5001)**  
   `cd ml-models` → `python api_server.py`  
   → Calls Pump API (5003) and merges condition/health_score.

3. **Backend (5000)**  
   `cd backend-server` → `npm start`  
   → Sends sensor data to ML API, broadcasts to dashboard.

4. **Dashboard (3000)**  
   `cd dashboard` → `npm run dev`  
   → Open **http://localhost:3000** or **http://192.168.0.101:3000**.

## If ML API and Pump API are on different machines

On the machine where ML API runs, set:

```bash
set PUMP_API_URL=http://192.168.0.101:5003
python api_server.py
```

So the dashboard works and is integrated with the new AI model when you use the **dashboard URL (3000)** and keep Pump API (5003), ML API (5001), and Backend (5000) running as above.
