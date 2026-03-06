# Project Structure Reference

**Keep this structure in mind** for the Smart Irrigation Digital Twin / Minor Group Project.

> **Full guide:** See `COMPLETE_PROJECT_GUIDE.md` in `completeminorgroupproject/` root.

## Folder hierarchy

```
completeminorgroupproject/          ← Root
└── minorgroupproject/
    ├── frontend/                    ← Dashboard (React, Next.js, or Vite)
    ├── smartirrigation/             ← ESP32 firmware
    ├── aiml_model/                  ← AI/ML (training, Pump API, ML API)
    ├── backend/                     ← Central API (sensors, pump, ML proxy)
    └── babylon/                     ← Babylon backend (digital twin state)
```

## Summary

| Path under `completeminorgroupproject/minorgroupproject/` | Purpose |
|----------------------------------------------------------|--------|
| **frontend** | Dashboard / Smart Irrigation frontend |
| **smartirrigation** | ESP code (firmware for ESP32) |
| **aiml model** | AI/ML model (e.g. GRU, pump health, training, ML API) |
| **backend** | Central backend (API, storage, pump control, calls ML) |
| **babylon** | Babylon backend (digital twin, data transfer, 3D/visualization) |

## Mapping to current workspace

If you are still working inside `GroupminorProject` (this repo), the rough mapping is:

- **frontend** → `frontend/`
- **esp** (ESP32 firmware) → `esp/`
- **aiml model** → `ml-models/`, `pump_dataset_generator/`
- **backend** → `backend/`
- **babylon** → `babylon/`

When you migrate or create the `completeminorgroupproject` layout, use the hierarchy above as the target structure.
