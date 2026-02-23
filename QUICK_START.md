# Quick Start Guide

## 🚀 Getting Started in 5 Steps

### Step 1: Hardware Setup (Week 1)

1. **Assemble Mini Farm Prototype**
   - Set up crop bed base
   - Install underground water tank
   - Connect pump and irrigation pipes
   - Mount all sensors

2. **Wire ESP32**
   - Connect sensors to ESP32 pins (see `hardware/README.md`)
   - Connect relay module for pump control
   - Power up ESP32

3. **Upload Firmware**
   - Open `hardware/esp32_firmware/esp32_firmware.ino` in Arduino IDE
   - Install required libraries
   - Configure WiFi credentials
   - Upload to ESP32

### Step 2: Dashboard Setup (Week 2)

```bash
# Navigate to dashboard directory
cd dashboard

# Install dependencies
npm install

# Run development server
npm run dev
```

Open browser: `http://localhost:3000`

### Step 3: Data Collection (Week 3-4)

1. **Normal Operation**
   - Run pump for 2-3 hours
   - Collect sensor data
   - Label as "Normal" (label=0)

2. **Leakage Simulation**
   - Create intentional leak
   - Run pump for 1-2 hours
   - Label as "Leakage" (label=1)

3. **Blockage Simulation**
   - Partially block pipe
   - Run pump for 1-2 hours
   - Label as "Blockage" (label=2)

4. **Failure Simulation**
   - Overload motor
   - Run until overheating
   - Label as "Failure Risk" (label=3)

### Step 4: ML Model Training (Week 5-6)

```bash
# Navigate to ML directory
cd ml-models

# Install Python dependencies
pip install -r requirements.txt

# Place dataset at datasets/sensor_data.csv
# Run training
python train_model.py
```

Models will be saved to `models/` directory.

### Step 5: Integration (Week 7-8)

1. **Connect Dashboard to ESP32**
   - Configure API endpoints
   - Set up WebSocket connection
   - Test real-time data flow

2. **Integrate ML Predictions**
   - Connect prediction API
   - Display predictions on dashboard
   - Test alert system

3. **Mobile App** (Optional)
   - Develop using Flutter/React Native
   - Connect to same API
   - Test remote control

## 📋 Checklist

### Hardware
- [ ] Mini farm prototype built
- [ ] All sensors connected
- [ ] ESP32 firmware uploaded
- [ ] WiFi connection working
- [ ] MQTT broker configured
- [ ] Pump control tested

### Software
- [ ] Dashboard running
- [ ] Real-time data displaying
- [ ] ML models trained
- [ ] Predictions working
- [ ] Alerts generating
- [ ] Camera feed streaming

### Testing
- [ ] Normal operation tested
- [ ] Leakage detection tested
- [ ] Blockage detection tested
- [ ] Failure prediction tested
- [ ] Mobile app tested (if applicable)

## 🔧 Troubleshooting

### ESP32 Not Connecting to WiFi
- Check SSID and password
- Verify signal strength
- Check WiFi credentials in code

### Dashboard Not Showing Data
- Verify ESP32 is publishing to MQTT
- Check API endpoints
- Verify WebSocket connection

### ML Predictions Not Working
- Check model files exist
- Verify sensor data format
- Check prediction API logs

### Pump Not Responding
- Check relay connections
- Verify power supply
- Check safety checks (water level)

## 📞 Next Steps

1. Review full documentation in `documentation/` folder
2. Follow detailed guides in each component's README
3. Collect more data for better ML accuracy
4. Customize dashboard design
5. Add more features as needed

---

**Need Help?** Check individual README files:
- Hardware: `hardware/README.md`
- Dashboard: `dashboard/README.md`
- ML Models: `ml-models/README.md`
