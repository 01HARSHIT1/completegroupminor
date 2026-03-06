@echo off
REM Run All - Start Backend, Babylon, and Frontend
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "%~dp0runall.ps1"
