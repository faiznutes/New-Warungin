# Script to install dependencies in Cursor worktree
# Run this script if you see TypeScript errors about missing type definitions

$worktreePath = "c:/Users/Iz/.cursor/worktrees/New-Warungin/oso/client"

if (Test-Path $worktreePath) {
    Write-Host "📦 Installing dependencies in worktree..." -ForegroundColor Cyan
    Set-Location $worktreePath
    
    Write-Host "Installing npm packages..." -ForegroundColor Yellow
    npm install
    
    Write-Host "Installing type definitions..." -ForegroundColor Yellow
    npm install -D @types/node
    
    Write-Host "Installing vite..." -ForegroundColor Yellow
    npm install vite
    
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
    Write-Host "Please restart TypeScript server in Cursor: Ctrl+Shift+P -> 'TypeScript: Restart TS Server'" -ForegroundColor Yellow
} else {
    Write-Host "❌ Worktree path not found: $worktreePath" -ForegroundColor Red
    Write-Host "Please update the path in this script to match your worktree location." -ForegroundColor Yellow
}

