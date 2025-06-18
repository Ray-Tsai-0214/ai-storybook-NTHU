# Git Push Script for AI Storybook
# 切換到專案目錄
Set-Location "C:\Users\NTHUILST\Ray\Ai art book\ai-storybook"

Write-Host "=== Git Status ===" -ForegroundColor Yellow
git status

Write-Host "`n=== Adding all changes ===" -ForegroundColor Yellow
git add .

Write-Host "`n=== Creating commit ===" -ForegroundColor Yellow
$commitMessage = Read-Host "Enter commit message"
git commit -m $commitMessage

Write-Host "`n=== Pushing to GitHub ===" -ForegroundColor Yellow
git push origin master

Write-Host "`n=== Push Complete! ===" -ForegroundColor Green
Write-Host "Repository: https://github.com/Meowbotz-ll/ai-storybook.git" -ForegroundColor Cyan

Read-Host "Press Enter to exit"
