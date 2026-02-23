# Install ESP board development prerequisites
# Run: .\install_esp_prerequisites.ps1
# Options: -PlatformIO (recommended) | -PythonTools (optional esptool)

param(
    [switch]$PlatformIO,
    [switch]$PythonTools,
    [switch]$All
)

$root = $PSScriptRoot

if ($All -or (-not $PlatformIO -and -not $PythonTools)) {
    $PlatformIO = $true
    $PythonTools = $true
}

Write-Host "=== ESP Board Prerequisites Installer ===" -ForegroundColor Cyan
Write-Host ""

# 1. PlatformIO - Install via extension (user must do manually in Cursor/VS Code)
if ($PlatformIO) {
    Write-Host "[1] PlatformIO IDE (Extension)" -ForegroundColor Yellow
    Write-Host "    Install the PlatformIO IDE extension in Cursor/VS Code:" -ForegroundColor Gray
    Write-Host "    - Open Extensions (Ctrl+Shift+X)" -ForegroundColor Gray
    Write-Host "    - Search: PlatformIO IDE" -ForegroundColor Gray
    Write-Host "    - Click Install" -ForegroundColor Gray
    Write-Host "    - Restart editor. First build will download ESP toolchain (~2-5 min)" -ForegroundColor Gray
    Write-Host ""
}

# 2. Python tools (esptool, pyserial)
if ($PythonTools) {
    Write-Host "[2] Python ESP Tools" -ForegroundColor Yellow
    $venvPath = Join-Path $root "venv-esp"
    $reqPath = Join-Path $root "esp\requirements-esp.txt"
    
    if (-not (Test-Path $reqPath)) {
        Write-Host "    requirements-esp.txt not found at esp\" -ForegroundColor Red
    } else {
        try {
            if (-not (Test-Path $venvPath)) {
                Write-Host "    Creating venv-esp..." -ForegroundColor Gray
                python -m venv $venvPath
            }
            Write-Host "    Installing esptool, pyserial, adafruit-ampy..." -ForegroundColor Gray
            & "$venvPath\Scripts\pip.exe" install -r $reqPath
            Write-Host "    Done. Activate with: .\venv-esp\Scripts\Activate.ps1" -ForegroundColor Green
        } catch {
            Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "    Ensure Python 3.8+ is installed and in PATH" -ForegroundColor Yellow
        }
    }
    Write-Host ""
}

Write-Host "For full setup guide, see: ESP_SETUP_PREREQUISITES.md" -ForegroundColor Cyan
