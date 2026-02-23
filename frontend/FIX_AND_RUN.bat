@echo off
cd /d "%~dp0"
echo Removing old node_modules...
if exist node_modules call npx rimraf node_modules
echo.
echo Installing dependencies...
call npm install
echo.
echo Starting dev server...
call npx vite
pause
