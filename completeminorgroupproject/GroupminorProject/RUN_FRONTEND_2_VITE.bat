@echo off
echo ========================================
echo FRONTEND 2: Vite + React (port 5173)
echo Smart Irrigation Dashboard Design
echo ========================================
echo.
cd /d "%~dp0frontend"
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)
echo.
echo Starting Vite dashboard... Open http://localhost:5173
echo.
call npm run dev
pause
