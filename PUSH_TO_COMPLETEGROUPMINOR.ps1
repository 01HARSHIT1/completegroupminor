# Push Smart Irrigation Digital Twin to https://github.com/01HARSHIT1/completegroupminor.git
# Only pushes GroupminorProject content (not other CodeData folders)
# Run: cd C:\CodeData\completeminorgroupproject\GroupminorProject
#      .\PUSH_TO_COMPLETEGROUPMINOR.ps1

$repoUrl = "https://github.com/01HARSHIT1/completegroupminor.git"
$projectRoot = $PSScriptRoot
$tempDir = Join-Path $env:TEMP "completegroupminor_push_" + (Get-Date -Format "yyyyMMddHHmmss")

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Push to completegroupminor" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Copying project to temp folder..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
robocopy "$projectRoot" $tempDir /E /XD node_modules .git __pycache__ /NFL /NDL /NJH /NJS
Copy-Item -Path "$projectRoot\.gitignore" -Destination $tempDir -Force -ErrorAction SilentlyContinue

# Also copy root guides from completeminorgroupproject
$parentRoot = Split-Path $projectRoot -Parent
if (Test-Path "$parentRoot\COMPLETE_PROJECT_GUIDE.md") {
    Copy-Item "$parentRoot\COMPLETE_PROJECT_GUIDE.md" $tempDir -Force
}
if (Test-Path "$parentRoot\FOLDER_PURPOSE_MAPPING.md") {
    Copy-Item "$parentRoot\FOLDER_PURPOSE_MAPPING.md" $tempDir -Force
}

Set-Location $tempDir
Write-Host "Initializing git..." -ForegroundColor Yellow
git init
git remote add origin $repoUrl

Write-Host "Adding files..." -ForegroundColor Yellow
git add -A
git status --short

Write-Host "Committing..." -ForegroundColor Yellow
git commit -m "Smart Irrigation Digital Twin: ML-assisted pump monitoring, leakage/blockage detection

- Frontend (Vite+React): dashboard, sensors, pump control, AI predictions
- Backend (Node.js): API, WebSocket, ML proxy
- Babylon: digital twin state API
- ESP: ESP32 firmware
- ML: ml-models + pump_dataset_generator (GRU, LEVEL1_LEVEL2 dataset)
- Full documentation and scripts"

Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "Use Personal Access Token as password if prompted." -ForegroundColor Cyan
git branch -M main
git push -u origin main

$exitCode = $LASTEXITCODE
Set-Location $projectRoot
Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue

if ($exitCode -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Success! Repository: https://github.com/01HARSHIT1/completegroupminor" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Push failed. Try manually:" -ForegroundColor Red
    Write-Host "  git push -u origin main" -ForegroundColor White
}
