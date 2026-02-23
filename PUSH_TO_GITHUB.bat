@echo off
echo ========================================
echo Pushing to GitHub Repository
echo ========================================
echo.

echo Initializing git repository...
if not exist .git (
    git init
)

echo Setting remote repository...
git remote remove origin 2>nul
git remote add origin https://github.com/01HARSHIT1/Groupminor.git

echo Adding files to git...
git add README.md
git add .gitignore
git add documentation/
git add hardware/
git add backend/
git add ml-models/
git add dashboard/
git add datasets/
git add *.md
git add START_PROJECT.*
git add QUICK_COMMANDS.md
git add SETUP_GUIDE.md
git add IMPLEMENTATION_STEPS.md
git add README_IMPLEMENTATION.md
git add PUSH_TO_GITHUB.*

echo Committing changes...
git commit -m "Initial commit: Smart Irrigation Digital Twin System with ML Predictive Maintenance"

echo.
echo Pushing to GitHub...
echo You may be prompted for GitHub credentials.
echo.

git push -u origin master

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Successfully pushed to GitHub!
    echo ========================================
    echo.
    echo Repository: https://github.com/01HARSHIT1/Groupminor
) else (
    echo.
    echo ========================================
    echo Push failed. Please check:
    echo 1. GitHub credentials
    echo 2. Repository access permissions
    echo 3. Internet connection
    echo ========================================
    echo.
    echo You can also push manually using:
    echo   git push -u origin master
)

echo.
pause
