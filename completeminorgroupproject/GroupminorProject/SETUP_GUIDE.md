# Complete Setup Guide
## Smart Irrigation Digital Twin System

This guide will help you set up the entire project from scratch.

---

## 📋 Prerequisites

### Software Required
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.8+ ([Download](https://www.python.org/))
- **Arduino IDE** ([Download](https://www.arduino.cc/en/software))
- **Git** (Optional, for version control)

### Hardware Required
See `documentation/04_Component_List_Cost.md` for complete list.

---

## 🚀 Step-by-Step Setup

### Step 1: Install Node.js and Python

**Node.js:**
```bash
# Verify installation
node --version  # Should be 18+
npm --version
```

**Python:**
```bash
# Verify installation
python --version  # Should be 3.8+
pip --version
```

### Step 2: Clone/Download Project

If using Git:
```bash
git clone <your-repo-url>
cd GroupminorProject
```

Or extract the project folder to your desired location.

### Step 3: Backend Server Setup

```bash
# Navigate to backend folder
cd backend-server

# Install dependencies
npm install

# Test run
npm run dev
```

Backend should start on `http://localhost:5000`

### Step 4: ML API Server Setup

```bash
# Navigate to ML models folder
cd ml-models

# Install Python dependencies
pip install -r requirements_api.txt

# Test run
python api_server.py
```

ML API should start on `http://localhost:5001`

### Step 5: Dashboard Setup

```bash
# Navigate to dashboard folder
cd dashboard

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local
echo "NEXT_PUBLIC_WS_URL=ws://localhost:5000" >> .env.local

# Run development server
npm run dev
```

Dashboard should start on `http://localhost:3000`

### Step 6: ESP32 Firmware Setup

1. **Install ESP32 Board in Arduino IDE:**
   - Open Arduino IDE
   - Go to **File → Preferences**
   - Add to "Additional Board Manager URLs":
     ```
     https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
     ```
   - Go to **Tools → Board → Boards Manager**
   - Search "ESP32" and install

2. **Install Required Libraries:**
   - Go to **Sketch → Include Library → Manage Libraries**
   - Install:
     - **MPU6050** by Electronic Cats
     - **PubSubClient** by Nick O'Leary
     - **ArduinoJson** by Benoit Blanchon

3. **Upload Firmware:**
   - Open `hardware/esp32_firmware/esp32_firmware.ino`
   - Update WiFi credentials:
     ```cpp
     const char* ssid = "YOUR_WIFI_SSID";
     const char* password = "YOUR_WIFI_PASSWORD";
     ```
   - Update backend server IP:
     ```cpp
     const char* mqtt_server = "YOUR_LAPTOP_IP";
     ```
   - Select Board: **ESP32 Dev Module**
   - Select Port: Your ESP32 port
   - Click **Upload**

4. **Test ESP32:**
   - Open Serial Monitor (115200 baud)
   - Verify WiFi connection
   - Check sensor readings

---

## 🧪 Testing the System

### Test 1: Backend API
```bash
curl http://localhost:5000/api/sensors
```

### Test 2: ML API
```bash
curl http://localhost:5001/health
```

### Test 3: Dashboard
Open browser: `http://localhost:3000`

### Test 4: ESP32 Connection
- Check Serial Monitor for connection status
- Verify data appears in backend logs
- Check dashboard updates

---

## 🎯 Quick Start (All Services)

### Windows PowerShell:
```powershell
.\START_PROJECT.ps1
```

### Windows Batch:
```cmd
START_PROJECT.bat
```

### Manual (3 Terminals):

**Terminal 1:**
```bash
cd backend-server && npm run dev
```

**Terminal 2:**
```bash
cd ml-models && python api_server.py
```

**Terminal 3:**
```bash
cd dashboard && npm run dev
```

---

## 📊 Access Points

Once all services are running:

- **Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **ML API**: http://localhost:5001
- **ESP32 Web Server**: http://ESP32_IP (if configured)

---

## 🔧 Troubleshooting

### Backend won't start
- Check if port 5000 is available
- Verify Node.js is installed
- Run `npm install` again

### ML API won't start
- Check if port 5001 is available
- Verify Python is installed
- Install dependencies: `pip install -r requirements_api.txt`

### Dashboard won't start
- Check if port 3000 is available
- Verify Node.js is installed
- Run `npm install` again
- Check `.env.local` file exists

### ESP32 not connecting
- Verify WiFi credentials
- Check Serial Monitor output
- Verify power supply
- Check backend server is running

### No data in dashboard
- Verify backend is running
- Check WebSocket connection in browser console
- Verify ESP32 is sending data
- Check API endpoints in Network tab

---

## 📝 Next Steps

1. **Collect Training Data** (Week 3-4)
   - Run system under normal conditions
   - Simulate faults (leakage, blockage, failure)
   - Save data to `ml-models/datasets/sensor_data.csv`

2. **Train ML Models** (Week 12-15)
   ```bash
   cd ml-models
   python train_model.py
   ```

3. **Calibrate Sensors**
   - Follow calibration guide in `hardware/README.md`
   - Adjust sensor readings for accuracy

4. **Test All Features**
   - Pump control
   - Leakage detection
   - Blockage detection
   - Failure prediction
   - Camera feed

---

## ✅ Setup Checklist

- [ ] Node.js installed
- [ ] Python installed
- [ ] Arduino IDE installed
- [ ] ESP32 board package installed
- [ ] Backend server running
- [ ] ML API server running
- [ ] Dashboard running
- [ ] ESP32 firmware uploaded
- [ ] WiFi connected
- [ ] Sensors reading data
- [ ] Dashboard displaying data
- [ ] Pump control working

---

**Need Help?** Check:
- `QUICK_COMMANDS.md` - Quick command reference
- `IMPLEMENTATION_STEPS.md` - Detailed implementation guide
- Individual README files in each folder
