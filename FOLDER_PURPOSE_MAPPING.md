# Folder → Purpose Mapping (Quick Reference)

| Folder | Purpose | Key Files |
|--------|---------|-----------|
| **frontend** | Dashboard UI, sensor charts, pump control, camera, ML predictions | `frontend/` (port 5173) |
| **esp** | ESP32 firmware, sensor reads, pump relay control | `esp/src/main.cpp` |
| **aiml_model** | ML training, Pump Health API, ML API | `ml-models/`, `pump_dataset_generator/` |
| **backend** | Central API, WebSocket, pump control, ML proxy | `backend/index.js` |
| **babylon** | Digital twin state aggregation for 3D client | `babylon/index.js` |

## Current Paths (GroupminorProject)

```
GroupminorProject/
├── frontend/                            → Dashboard (Vite+React, port 5173)
├── esp/                                → ESP32 firmware
├── backend/                             → Central API (port 5000)
├── babylon/                             → Digital twin backend (port 5004)
├── ml-models/                          → ML API (port 5001)
└── pump_dataset_generator/             → Pump Health API (port 5003)
```

## Dataset

- **LEVEL1_LEVEL2_PUMP_DATASET_IMPROVED.csv** → `pump_dataset_generator/`
- Columns: time, current, temperature, vibration, flow, health, rul, label (0=Healthy, 1=Warning, 2=Fault)
