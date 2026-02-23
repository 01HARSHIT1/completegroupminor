# Start Smart Irrigation Digital Twin - ALL services in correct order
# Pump API (5003) -> ML API (5001) -> Backend (5000) -> Babylon (5004) -> Dashboard (5173)

$root = $PSScriptRoot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Smart Irrigation Digital Twin - Full Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Pump Health API (LEVEL1_LEVEL2 dataset model) - port 5003
Write-Host "[1/5] Starting Pump Health API (5003)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\pump_dataset_generator'; python pump_api.py" -WindowStyle Normal
Start-Sleep -Seconds 3

# 2. ML API (calls Pump API) - port 5001
Write-Host "[2/5] Starting ML API (5001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\ml-models'; python api_server.py" -WindowStyle Normal
Start-Sleep -Seconds 2

# 3. Backend (Central API) - port 5000
Write-Host "[3/5] Starting Backend (5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; npm start" -WindowStyle Normal
Start-Sleep -Seconds 2

# 4. Babylon / Digital Twin Backend - port 5004
Write-Host "[4/5] Starting Babylon Twin Backend (5004)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\babylon'; npm start" -WindowStyle Normal
Start-Sleep -Seconds 2

# 5. Dashboard (Vite) - port 5173
Write-Host "[5/5] Starting Dashboard (5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "All services starting. URLs:" -ForegroundColor Green
Write-Host "  Pump API:    http://localhost:5003" -ForegroundColor White
Write-Host "  ML API:      http://localhost:5001" -ForegroundColor White
Write-Host "  Backend:     http://localhost:5000" -ForegroundColor White
Write-Host "  Babylon:     http://localhost:5004" -ForegroundColor White
Write-Host "  Dashboard:   http://localhost:5173" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Open: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
