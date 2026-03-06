# ESP Board Prerequisites - Smart Irrigation Digital Twin

Complete setup guide for developing and flashing ESP32/ESP8266 firmware for the Smart Irrigation system.

---

## Quick Prerequisites Checklist

| Requirement | Purpose |
|-------------|---------|
| **PlatformIO IDE** (VS Code / Cursor extension) | Build, upload, debug ESP firmware |
| **Python 3.8+** (optional) | For `esptool` command-line flashing |
| **USB driver** (CP210x, CH340, etc.) | Serial communication with ESP board |
| **ESP32 or ESP8266 board** | Hardware for sensor node |

---

## 1. Install PlatformIO (Recommended - All-in-One)

PlatformIO is the standard way to develop for ESP boards in VS Code and Cursor. It installs the toolchain, libraries, and build system automatically.

### Option A: Cursor / VS Code Extension

1. Open **Cursor** (or VS Code)
2. Open Extensions (`Ctrl+Shift+X`)
3. Search for **PlatformIO IDE**
   - **Cursor**: Install **PlatformIO IDE for Cursor** by **DavidGomes** (official `platformio.platformio-ide` is not on Cursor’s marketplace)
   - **VS Code**: Install **PlatformIO IDE** by **PlatformIO**
4. Restart the editor when prompted
5. PlatformIO will download the ESP32/ESP8266 toolchain on first build (~2–5 min)

### Option B: Command Line Install

```powershell
# If you have PlatformIO Core CLI
pip install platformio
```

---

## 2. See the PlatformIO Icon (Important)

PlatformIO only loads when the **workspace root** (or one of the roots) contains `platformio.ini`. If you opened the main project folder (`GroupminorProject`) only, the PlatformIO icon will **not** show.

**Do one of the following:**

| Option | Steps |
|--------|--------|
| **A. Open ESP folder only** | **File → Open Folder** → go to `C:\CodeData\GroupminorProject\esp32-firmware` → **Select Folder**. The PlatformIO icon (ant/alien head) should appear in the left sidebar. |
| **B. Use the workspace file** | **File → Open Workspace from File…** → open `SmartIrrigation.code-workspace` in the project root. You get both “Project root” and “ESP32 Firmware”. Click the **ESP32 Firmware** folder in the sidebar; PlatformIO may then show for that root. If the icon still doesn’t appear, use Option A when you work on firmware. |
| **C. Reload after opening** | After opening `esp32-firmware` (or the workspace), press **Ctrl+Shift+P** → type **Developer: Reload Window** → Enter. |

**Icon location:** Left activity bar (vertical strip). If you don’t see it, click the **…** or the bottom icon to reveal more (e.g. Extensions, PlatformIO).

---

## 3. Configure and Build the Firmware

1. Open the project (or just `esp32-firmware`) as above so PlatformIO is active.

2. Edit `esp32-firmware/platformio.ini` and set:
   ```ini
   build_flags =
       -D BACKEND_URL="http://YOUR_PC_IP:5000"    ; Your PC's LAN IP
       -D WIFI_SSID="YourWiFiName"
       -D WIFI_PASSWORD="YourWiFiPassword"
       -D SEND_INTERVAL_MS=2000
   ```

3. Connect your ESP32 via USB.

4. Build and upload:
   - **Using PlatformIO sidebar**: Click the **PlatformIO** icon in the left bar → **Project Tasks** → **esp32dev** → **Build** or **Upload**
   - **Or via terminal** (from project root; use full path if `pio` is not in PATH):
     ```powershell
     cd C:\CodeData\GroupminorProject\esp32-firmware
     & "$env:USERPROFILE\.platformio\penv\Scripts\platformio.exe" run -t upload
     ```
     Or if PlatformIO is on PATH: `pio run -t upload`

5. Open serial monitor (115200 baud):
   - **Sidebar**: PlatformIO → **Monitor**
   - **Terminal**: `pio device monitor` or `& "$env:USERPROFILE\.platformio\penv\Scripts\platformio.exe" device monitor`

---

## 4. Python Tools (Optional - Command-Line Flashing)

If you prefer not to use PlatformIO or need `esptool` for other scripts:

```powershell
# Create a virtual environment (recommended)
python -m venv venv-esp
.\venv-esp\Scripts\Activate.ps1

# Install ESP tools
pip install -r requirements-esp.txt

# Or install manually:
pip install esptool pyserial
```

### Flash pre-built binary manually

```powershell
# Erase flash
esptool.py --chip esp32 --port COM3 erase_flash

# Write firmware (after building with PlatformIO)
esptool.py --chip esp32 --port COM3 write_flash 0x1000 .pio/build/esp32dev/bootloader.bin 0x8000 .pio/build/esp32dev/partitions.bin 0x10000 .pio/build/esp32dev/firmware.bin
```

---

## 5. USB Drivers

Your ESP32 board uses a USB–serial chip. Install the correct driver:

| Chip | Driver | Download |
|------|--------|----------|
| **CP210x** (Silicon Labs) | CP210x Driver | [Silicon Labs](https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers) |
| **CH340 / CH341** | CH340 Driver | [WCH](http://www.wch.cn/downloads/CH341SER_EXE.html) |
| **FTDI** | FTDI VCP | [FTDI](https://ftdichip.com/drivers/vcp-drivers/) |

After installing, verify the COM port:

```powershell
# PlatformIO
pio device list

# Or in Device Manager (Windows): Ports (COM & LPT)
```

---

## 6. Network Requirements

- Your **PC** and **ESP32** must be on the same Wi-Fi network.
- Set `BACKEND_URL` to your PC’s LAN IP, e.g. `http://192.168.1.100:5000`.
- Ensure the backend server is running (`cd backend-server && npm start`).

---

## 7. Project Structure

```
GroupminorProject/
├── esp32-firmware/           # ESP32 sensor firmware
│   ├── platformio.ini        # PlatformIO config
│   ├── src/
│   │   └── main.cpp          # Sensor reading + HTTP POST
│   └── requirements-esp.txt  # Optional Python deps
├── backend-server/           # Receives POST /api/sensors
├── dashboard/                # Real-time dashboard
└── ESP_SETUP_PREREQUISITES.md  # This file
```

---

## 8. Expected Sensor Data Format

The backend expects JSON at `POST /api/sensors`:

```json
{
  "current_A": 2.5,
  "vibration_rms": 1.2,
  "temperature_C": 42.0,
  "flow_rate_Lmin": 8.5,
  "tank_level_cm": 35.0,
  "ph_value": 7.0,
  "turbidity_NTU": 45.0,
  "pump_status": "OFF",
  "pump_runtime_min": 0
}
```

---

## 9. Troubleshooting

| Issue | Solution |
|-------|----------|
| `Port COM3 not found` | Install USB driver, check cable, try another USB port |
| `Failed to connect` | Check `BACKEND_URL` IP, firewall, backend running |
| `WiFi timeout` | Verify `WIFI_SSID` and `WIFI_PASSWORD` |
| `pio: command not found` | Use PlatformIO sidebar or ensure `~/.platformio/penv` is in PATH |
| Build fails | Run `pio pkg update` and retry |

---

## 10. ESP8266 Support

To target NodeMCU or ESP-01, uncomment the `[env:nodemcuv2]` section in `platformio.ini` and select that environment when building.

---

## Summary: Minimum Setup

1. Install **PlatformIO IDE** extension in Cursor.
2. Set Wi-Fi and backend URL in `esp32-firmware/platformio.ini`.
3. Connect ESP32 via USB and run **Upload** from PlatformIO.
4. Start backend (`cd backend-server && npm start`) and dashboard (`cd dashboard && npm run dev`).
5. Open http://localhost:3000 to see live sensor data.
