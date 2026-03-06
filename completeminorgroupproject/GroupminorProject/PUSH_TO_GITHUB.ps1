# Script to push Smart Irrigation Digital Twin project to GitHub
# Run this script from the project directory

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Pushing to GitHub Repository" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path .git)) {
    Write-Host "Initializing git repository..." -ForegroundColor Yellow
    git init
}

# Set remote URL
Write-Host "Setting remote repository..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin https://github.com/01HARSHIT1/Groupminor.git

# Add all project files
Write-Host "Adding files to git..." -ForegroundColor Yellow
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
git add PUSH_TO_GITHUB.ps1

# Commit changes
Write-Host "Committing changes..." -ForegroundColor Yellow
$commitMessage = "Initial commit: Smart Irrigation Digital Twin System with ML Predictive Maintenance

- Complete project structure with hardware, software, and ML components
- Next.js Digital Twin Dashboard
- Node.js backend server with WebSocket support
- Python ML prediction API
- ESP32 firmware for sensor integration
- Complete documentation (IEEE format, reports, PPT structure)
- Implementation guides and setup instructions"

git commit -m $commitMessage

# Push to GitHub
Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "You may be prompted for GitHub credentials." -ForegroundColor Cyan
Write-Host ""

git push -u origin master

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Repository: https://github.com/01HARSHIT1/Groupminor" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Push failed. Please check:" -ForegroundColor Red
    Write-Host "1. GitHub credentials" -ForegroundColor Yellow
    Write-Host "2. Repository access permissions" -ForegroundColor Yellow
    Write-Host "3. Internet connection" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "You can also push manually using:" -ForegroundColor Cyan
    Write-Host "  git push -u origin master" -ForegroundColor White
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
