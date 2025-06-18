# Auto Git Push Script
Set-Location "C:\Users\NTHUILST\Ray\Ai art book\ai-storybook"

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$commitMessage = "Auto update: $timestamp"

Write-Host "=== Automated Git Push Starting ===" -ForegroundColor Green
Write-Host "Repository: https://github.com/Meowbotz-ll/ai-storybook.git" -ForegroundColor Cyan
Write-Host "Commit message: $commitMessage" -ForegroundColor Yellow

# Add all changes
Write-Host "`nAdding all changes..." -ForegroundColor Yellow
git add .

# Create commit
Write-Host "Creating commit..." -ForegroundColor Yellow
git commit -m $commitMessage

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push origin master

Write-Host "`n=== Push Complete! ===" -ForegroundColor Green
Write-Host "Check your repository at: https://github.com/Meowbotz-ll/ai-storybook" -ForegroundColor Cyan

# Auto close after 3 seconds
Start-Sleep -Seconds 3
