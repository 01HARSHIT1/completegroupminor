# Start Smart Irrigation - Backend, Babylon, Frontend
# Run from GroupminorProject folder
$root = $PSScriptRoot
Write-Host "Starting Smart Irrigation Stack..." -ForegroundColor Cyan

# 1. Backend (port 5000)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; Write-Host 'Backend (5000)' -ForegroundColor Green; node index.js"

# 2. Babylon (port 5004)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\babylon'; Write-Host 'Babylon (5004)' -ForegroundColor Green; node index.js"

# 3. Frontend (port 5173/5174)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; Write-Host 'Frontend' -ForegroundColor Green; npm run dev"

Write-Host ""
Write-Host "All services starting in new windows." -ForegroundColor Green
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor Yellow
Write-Host "  Babylon:  http://localhost:5004" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:5173 (or 5174)" -ForegroundColor Yellow
Write-Host "  Digital Twin: http://localhost:5174/digital-twin" -ForegroundColor Yellow
Write-Host ""
Write-Host "Wait ~10 seconds, then open the Digital Twin page in your browser." -ForegroundColor Cyan
