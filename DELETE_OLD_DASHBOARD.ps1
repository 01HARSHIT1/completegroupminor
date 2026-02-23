# Delete old Next.js dashboard (port 3000)
# STOP the Next.js server first (Ctrl+C), then run: .\DELETE_OLD_DASHBOARD.ps1
$path = "$PSScriptRoot\dashboard"
if (Test-Path $path) {
    Write-Host "Removing dashboard folder..." -ForegroundColor Yellow
    npx rimraf $path
    if (Test-Path $path) {
        Write-Host "Some files may be locked. Close terminals/VS Code and run again." -ForegroundColor Red
    } else {
        Write-Host "Dashboard folder removed." -ForegroundColor Green
    }
} else {
    Write-Host "Dashboard folder not found (already removed)." -ForegroundColor Green
}
