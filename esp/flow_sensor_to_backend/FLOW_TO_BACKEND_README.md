# Flow Sensor → Express Backend → Python AIML

## Data buffering (CSV window + mean)

- **3 samples per window** at 1-second intervals (1–3 s, 4–6 s, 7–9 s, …)
- **Mean** of flow, divider voltage over each window; **majority** for divider OK
- **One row per window** sent to API every ~3 seconds
- **CSV format** (Serial): `Time(ms),FlowRate,DividerV,DividerOK` — match `flowdata.csv`

## Transport options

| Mode | How | Use case |
|------|-----|----------|
| **WiFi** | ESP32 HTTP POST directly | Wireless, same LAN |
| **Serial (USB cable)** | ESP32 → JSON over USB → PC bridge → HTTP | No WiFi, USB to PC |
| **WiFi + Serial** | Both HTTP and Serial output | Redundancy / logging |
| **Ethernet (RJ45)** | ESP32 + LAN8720 board | Wired LAN |

Build: `pio run -e wifi` | `pio run -e serial` | `pio run -e wifi_and_serial` | `pio run -e ethernet`

## Data flow

```
ESP32 (flow sensor)
    ├─ WiFi:     HTTP POST ─────────────────┐
    ├─ Serial:   JSON over USB → PC bridge ──┤
    └─ Ethernet: HTTP POST ─────────────────┘
                                      │
                                      ▼
Express.js Backend (port 5000)
    │  Merges data, POST /predict
    ▼
Python AIML API (port 5001, TensorFlow/Pump Health)
    │  Returns prediction
    ▼
Express → WebSocket → Frontend dashboard
```

## Why this path

1. **Express as hub** – One place for sensors, pump control, and WebSocket.
2. **No direct ESP32 → Python** – Python ML runs on a machine; ESP32 talks to whatever host/IP you give it.
3. **Fast** – Single HTTP POST every 1–2 seconds; backend handles ML and broadcasting to the frontend.
4. **Scalable** – Easy to add more sensors or endpoints on Express.

## Configuration

### 1. Serial cable mode (USB)

When using `serial` or `wifi_and_serial`:

1. Connect ESP32 via USB cable.
2. On PC: `npm install` then `node serial_to_backend.js COM3 http://localhost:5000`
   - Windows: `COM3`, `COM4`, etc. | Linux: `/dev/ttyUSB0`
   - List ports: `node serial_to_backend.js list`

### 2. WiFi / Ethernet (platformio.ini build_flags)

```ini
-D WIFI_SSID="YourNetwork"
-D WIFI_PASSWORD="password"
-D BACKEND_URL="http://192.168.1.100:5000"
-D SEND_INTERVAL_MS=1000
```

- Ethernet: needs board with LAN8720; adjust `ETH.begin()` pins for your board.

### 3. Hardware

- **Flow sensor**: Pulse output on **GPIO 27**.
- **Voltage divider**: Optional, on **GPIO 34** (must be ADC1 when WiFi is used).
- If you don't use a voltage divider, set `#define DIVIDER_PIN 0` in the sketch.

### 4. Backend

- Express backend must be running on the IP used in `BACKEND_URL`.
- Python ML API must be reachable from the Express host (usually `localhost:5001`).

## Wiring

| ESP32 Pin | Function |
|-----------|----------|
| GPIO 27   | Flow sensor pulse output |
| GPIO 34   | Voltage divider output (optional) |
| 3.3V/GND | Power and ground |

## API payload

ESP32 sends:

```json
{
  "flow_rate_Lmin": 12.5,
  "divider_voltage": 1.65,
  "divider_ok": true,
  "current_A": 4.0,
  "temperature_C": 40.0,
  "vibration_rms": 2.5,
  "pump_status": "ON"
}
```

- `flow_rate_Lmin`, `divider_voltage`, `divider_ok` – from your flow/divider logic.
- Other fields – placeholders for the ML model; replace with real sensors when available.

## Build & flash

```bash
cd esp/flow_sensor_to_backend
pio run -e wifi -t upload
pio device monitor
```
