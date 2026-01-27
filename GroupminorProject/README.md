# Machine Learning Assisted Digital Twin for Smart Irrigation Pump Performance Monitoring, Leakage/Blockage Detection, and Predictive Maintenance

## 🎯 Project Overview

This project develops a mini smart farm prototype where irrigation is supplied from an underground water storage tank through a pumping motor system. The entire irrigation setup is digitally replicated using a Digital Twin dashboard, and Machine Learning is applied for predictive maintenance of the motor-pump system.

### Key Features

✅ **Smart Irrigation Automation** - Remote pump control via mobile app  
✅ **Digital Twin Dashboard** - Real-time visualization using React + Next.js  
✅ **Live Camera Monitoring** - ESP32-CAM for farm surveillance  
✅ **Sensor-Based Monitoring** - Water quality + motor health sensors  
✅ **ML Predictive Maintenance** - AI-based failure prediction  
✅ **Leakage & Blockage Detection** - Flow-based anomaly detection  
✅ **Performance Monitoring** - Real-time pump efficiency tracking  

## 📁 Project Structure

```
GroupminorProject/
├── documentation/          # Research papers, reports, presentations
├── hardware/              # ESP32 code, sensor schematics
├── dashboard/             # Next.js + React Digital Twin Dashboard
├── ml-models/             # ML training scripts and models
├── mobile-app/            # Mobile application code
├── datasets/              # Training datasets
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Arduino IDE / PlatformIO
- ESP32 Development Board

### Installation

1. **Dashboard Setup**
```bash
cd dashboard
npm install
npm run dev
```

2. **ML Model Training**
```bash
cd ml-models
pip install -r requirements.txt
python train_model.py
```

3. **ESP32 Firmware**
- Open `hardware/esp32_firmware/esp32_firmware.ino` in Arduino IDE
- Install required libraries
- Upload to ESP32

## 📊 System Architecture

The system consists of 3 integrated layers:

1. **Physical Layer** - Mini farm setup with pump, sensors, and irrigation system
2. **IoT Layer** - ESP32 data collection and transmission
3. **Digital Twin Layer** - React/Next.js dashboard with ML predictions

## 🔬 Research Components

- IEEE Abstract and Literature Review
- Block Diagrams and Architecture
- Component List with Cost Estimation
- ML Dataset Format and Training Approach
- Complete Project Report Structure

## 📱 Mobile App Features

- Remote pump ON/OFF control
- Live sensor data visualization
- Alert notifications
- Camera feed viewing
- Irrigation scheduling

## 🤖 ML Predictions

The system provides 4 major predictions:

1. **Live Pump Performance** - Efficiency monitoring
2. **Leakage Detection** - Water loss identification
3. **Blockage Detection** - Pipeline obstruction alerts
4. **Failure Prediction** - Predictive maintenance alerts

## 📅 4-Month Implementation Plan

- **Month 1**: Hardware + Mini Farm Setup
- **Month 2**: IoT + Dashboard Digital Twin
- **Month 3**: Leakage + Blockage Detection Logic
- **Month 4**: Machine Learning Predictive Maintenance

## 📄 Documentation

See `documentation/` folder for:
- IEEE Abstract
- Literature Review
- Block Diagrams
- Component List
- ML Training Approach
- Report Structure
- PPT Structure

## 🛠️ Technologies Used

- **Frontend**: React, Next.js, TypeScript
- **Backend**: Node.js, Express, WebSockets
- **Database**: MongoDB / Firebase
- **ML**: Python, Scikit-learn, TensorFlow
- **IoT**: ESP32, Arduino, MQTT
- **Mobile**: Flutter / React Native

## 👥 Team

- Harshit (Project Lead)

## 📝 License

This project is for academic/research purposes.

---

**Status**: 🚧 In Development (4-Month Project)
