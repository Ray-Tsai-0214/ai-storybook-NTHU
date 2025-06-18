@echo off
cd /d "C:\Users\NTHUILST\Ray\Ai art book\ai-storybook"
powershell.exe -ExecutionPolicy Bypass -Command "& {Set-Location 'C:\Users\NTHUILST\Ray\Ai art book\ai-storybook'; git add .; git commit -m 'Auto update: %date% %time%'; git push origin master; Write-Host 'Push complete!' -ForegroundColor Green; Start-Sleep -Seconds 2}"
