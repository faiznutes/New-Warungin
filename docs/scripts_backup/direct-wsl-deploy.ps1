Write-Host "Direct WSL Deployment (Ubuntu-22.04) as ROOT" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

$REPO_DIR = "~/Warungin"
$WSL_DISTRO = "Ubuntu-22.04"

function Invoke-WSL {
    param([string]$Command)
    Write-Host "> $Command" -ForegroundColor Gray
    # Use -u root to match previous script's behavior
    wsl -d $WSL_DISTRO -u root bash -c "cd $REPO_DIR && $Command"
}

# 1. Pull Code
Write-Host "`n[1/7] Pulling latest code..." -ForegroundColor Yellow
Invoke-WSL "git pull origin main"

# 2. Env Check
Write-Host "`n[2/7] Checking environment..." -ForegroundColor Yellow
Invoke-WSL "if [ ! -f .env ]; then cp .env.example .env; fi"

# 3. Build Backend
Write-Host "`n[3/7] Rebuilding backend..." -ForegroundColor Yellow
Invoke-WSL "docker compose build backend"

# 4. Start Backend & DB
Write-Host "`n[4/7] Starting Backend & DB..." -ForegroundColor Yellow
Invoke-WSL "docker compose up -d backend postgres"
Start-Sleep -Seconds 5

# 5. Migrations & Admin
Write-Host "`n[5/7] Running Migrations & Admin Setup..." -ForegroundColor Yellow
Invoke-WSL "npx prisma migrate deploy"
Invoke-WSL "node scripts/create-super-admin-docker.js"

# 6. Build & Start Frontend
Write-Host "`n[6/7] Rebuilding & Starting Frontend..." -ForegroundColor Yellow
Invoke-WSL "docker compose build frontend"
Invoke-WSL "docker compose up -d frontend nginx"

# 7. Status
Write-Host "`n[7/7] Deployment Status..." -ForegroundColor Yellow
Invoke-WSL "docker compose ps"

Write-Host "`n✅ Deployment Complete!" -ForegroundColor Green
Write-Host "Try accessing: http://localhost (or via WSL IP)"
