@echo off
cd /d "C:\Users\NTHUILST\Ray\Ai art book\ai-storybook"
echo === Quick Git Status Check ===
echo.
powershell -Command "git fetch origin --quiet; $status = git status -uno; if ($status -match 'Your branch is up to date') { Write-Host 'SUCCESS: All changes are pushed to GitHub!' -ForegroundColor Green } elseif ($status -match 'Your branch is ahead') { Write-Host 'WARNING: You have unpushed commits!' -ForegroundColor Red; git status --short } else { Write-Host $status }"
echo.
echo GitHub: https://github.com/Meowbotz-ll/ai-storybook
echo.
pause
