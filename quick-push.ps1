# Quick Git Push Script
Set-Location "C:\Users\NTHUILST\Ray\Ai art book\ai-storybook"

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$defaultMessage = "Update: $timestamp"

Write-Host "=== Quick Git Push ===" -ForegroundColor Yellow
Write-Host "Using commit message: $defaultMessage" -ForegroundColor Cyan

git add .
git commit -m $defaultMessage
git push origin master

Write-Host "`n=== Push Complete! ===" -ForegroundColor Green
Start-Sleep -Seconds 2
