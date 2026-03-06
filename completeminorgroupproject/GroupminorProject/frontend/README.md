
# Smart Irrigation Dashboard Design

This is the Smart Irrigation Digital Twin dashboard frontend. It connects to **Backend 2** (central API) for sensors, predictions, and pump control, and to **Backend 4** (Babylon) for digital twin state.

## Running the code

```bash
npm install
npm run dev
```

Open the URL shown (e.g. http://localhost:5173).

## Backend connections

- **Backend 2 (central API)** – default `http://localhost:5000`  
  Sensors, predictions, pump ON/OFF, real-time via Socket.IO.
- **Backend 4 (Babylon)** – default `http://localhost:5004`  
  Digital twin state for the visualization section.

Create a `.env` file (see `.env.example`) to override:

- `VITE_API_URL` – Backend 2 URL  
- `VITE_BABYLON_API_URL` – Backend 4 URL  

## Full stack (all 4 backends)

1. **Backend** (central API): `cd backend && npm start` (port 5000)
2. **Babylon** (digital twin): `cd babylon && npm start` (port 5004)
3. **ML API** (optional): `cd ml-models && python api_server.py` (5001)
4. **Pump API** (optional): `cd pump_dataset_generator && python pump_api.py` (5003)
5. **This dashboard**: `npm run dev`

Original design: https://www.figma.com/design/1PxalxU8ZP4bwsHy1L5IfP/Smart-Irrigation-Dashboard-Design
  