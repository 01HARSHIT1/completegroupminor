# Start Smart Irrigation with AI (Pump API) integrated
# Run: .\START_WITH_AI.ps1
# First time: run "npm install" in backend and frontend

$root = $PSScriptRoot

Write-Host "Starting Pump API (5003), ML API (5001), Backend (5000), Dashboard (5173)..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\pump_dataset_generator'; python pump_api.py" -WindowStyle Normal
Start-Sleep -Seconds 3

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\ml-models'; python api_server.py" -WindowStyle Normal
Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; npm start" -WindowStyle Normal
Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "Pump API:   http://localhost:5003" -ForegroundColor Green
Write-Host "ML API:     http://localhost:5001" -ForegroundColor Green
Write-Host "Backend:    http://localhost:5000" -ForegroundColor Green
Write-Host "Dashboard:  http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Open dashboard: http://localhost:5173" -ForegroundColor Yellow
