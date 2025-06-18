# Check Git Status Script
Set-Location "C:\Users\NTHUILST\Ray\Ai art book\ai-storybook"

Write-Host "=== Git Push Status Check ===" -ForegroundColor Cyan
Write-Host ""

# Check current branch
Write-Host "Current Branch:" -ForegroundColor Yellow
git branch --show-current

# Check if there are uncommitted changes
Write-Host "`nUncommitted Changes:" -ForegroundColor Yellow
git status --short

# Check if local is ahead/behind remote
Write-Host "`nLocal vs Remote Status:" -ForegroundColor Yellow
git fetch origin
$status = git status -uno
if ($status -match "Your branch is up to date") {
    Write-Host "✓ Your local branch is synchronized with GitHub!" -ForegroundColor Green
} elseif ($status -match "Your branch is ahead") {
    Write-Host "⚠ You have commits that haven't been pushed yet!" -ForegroundColor Red
    Write-Host "Run git push to upload your changes." -ForegroundColor Yellow
} elseif ($status -match "Your branch is behind") {
    Write-Host "⚠ GitHub has newer commits than your local copy!" -ForegroundColor Yellow
    Write-Host "Run git pull to update your local copy." -ForegroundColor Yellow
}

# Show last 5 commits
Write-Host "`nLast 5 Commits:" -ForegroundColor Yellow
git log --oneline -5

# Show remote URL
Write-Host "`nRemote Repository:" -ForegroundColor Yellow
git remote -v | Select-String "origin.*push"

Write-Host "`n=== Check Complete ===" -ForegroundColor Green
Write-Host "GitHub URL: https://github.com/Meowbotz-ll/ai-storybook" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"
