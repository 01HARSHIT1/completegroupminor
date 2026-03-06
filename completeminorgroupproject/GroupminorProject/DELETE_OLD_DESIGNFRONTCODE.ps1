# Remove EXTRA folders - keep ONLY: frontend, backend, babylon, esp, ml-models, pump_dataset_generator
# STOP all dev servers first (Ctrl+C in all terminals), then run: .\DELETE_OLD_DESIGNFRONTCODE.ps1

$root = $PSScriptRoot
$keep = @('frontend','backend','babylon','esp','ml-models','pump_dataset_generator')

Get-ChildItem $root -Directory | Where-Object { $_.Name -notin $keep } | ForEach-Object {
    Write-Host "Removing: $($_.Name)..." -ForegroundColor Yellow
    npx rimraf $_.FullName 2>$null
    if (Test-Path $_.FullName) {
        Write-Host "  Locked - close terminals/VS Code and run again." -ForegroundColor Red
    } else {
        Write-Host "  Removed." -ForegroundColor Green
    }
}
Write-Host "`nRemaining folders: $keep" -ForegroundColor Cyan
