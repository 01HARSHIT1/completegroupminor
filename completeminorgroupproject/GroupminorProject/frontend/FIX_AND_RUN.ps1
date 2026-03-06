# Fix ENOTEMPTY and run Vite dashboard
# Close VS Code / other apps if Remove-Item fails
$dir = $PSScriptRoot
Set-Location $dir
Write-Host "Removing node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    npx rimraf node_modules
}
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
Write-Host "Starting dev server... Open http://localhost:5173" -ForegroundColor Green
npx vite
