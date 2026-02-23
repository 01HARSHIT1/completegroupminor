@echo off
title Smart Irrigation - AI + Dashboard
echo Starting Pump API (5003), ML API (5001), Backend (5000), Dashboard (5173)...
echo.

start "Pump API" cmd /k "cd /d %~dp0pump_dataset_generator && python pump_api.py"
timeout /t 3 /nobreak >nul

start "ML API" cmd /k "cd /d %~dp0ml-models && python api_server.py"
timeout /t 2 /nobreak >nul

start "Backend" cmd /k "cd /d %~dp0backend && npm start"
timeout /t 2 /nobreak >nul

start "Dashboard" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo All services starting in new windows.
echo - Pump API:   http://localhost:5003
echo - ML API:     http://localhost:5001
echo - Backend:    http://localhost:5000
echo - Dashboard:  http://localhost:5173
echo.
echo Open the dashboard: http://localhost:5173
echo Sensor data flows: Sensors -> Backend -> ML API -> Pump API -> condition/health_score -> Dashboard
pause
