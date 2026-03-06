# Frontend Dashboard (port 5173)
# Run: .\RUN_FRONTEND_2_VITE.ps1
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Frontend Dashboard (port 5173)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Set-Location "$PSScriptRoot\frontend"
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}
Write-Host "`nStarting Vite dashboard... Open http://localhost:5173`n" -ForegroundColor Green
npm run dev
