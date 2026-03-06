@echo off
echo ========================================
echo Smart Irrigation Digital Twin System
echo Starting all services...
echo ========================================
echo.

echo [1/3] Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

echo [2/3] Starting ML Prediction API...
start "ML API Server" cmd /k "cd ml-models && python api_server.py"
timeout /t 3 /nobreak >nul

echo [3/3] Starting Dashboard...
start "Dashboard" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo All services started!
echo ========================================
echo Backend: http://localhost:5000
echo ML API: http://localhost:5001
echo Dashboard: http://localhost:5173
echo.
echo Press any key to exit...
pause >nul
