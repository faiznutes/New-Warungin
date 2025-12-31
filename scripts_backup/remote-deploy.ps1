# PowerShell script untuk remote deploy ke WSL
# Usage: .\scripts\remote-deploy.ps1

$WSL_IP = "172.27.30.45"
$WSL_USER = "root"
$WSL_PASS = "123"
$REPO_DIR = "~/Warungin"

Write-Host "Remote Deploy ke WSL" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""

# Function untuk execute command via SSH
function Invoke-SSHCommand {
    param([string]$Command)
    
    $sshCommand = "sshpass -p '$WSL_PASS' ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 $WSL_USER@$WSL_IP `"$Command`""
    
    # Try using WSL if sshpass not available
    if (-not (Get-Command sshpass -ErrorAction SilentlyContinue)) {
        # Use expect-like approach with WSL
        $wslCommand = "wsl bash -c `"sshpass -p '$WSL_PASS' ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 $WSL_USER@$WSL_IP '$Command'`""
        Invoke-Expression $wslCommand
    } else {
        Invoke-Expression $sshCommand
    }
}

Write-Host "Connecting to WSL at $WSL_IP..." -ForegroundColor Yellow
Write-Host ""

# 1. Pull latest code
Write-Host "[1/6] Pulling latest code..." -ForegroundColor Yellow
Invoke-SSHCommand "cd $REPO_DIR ; git pull origin main"
Write-Host ""

# 2. Check JWT_SECRET
Write-Host "[2/6] Checking environment variables..." -ForegroundColor Yellow
$jwtSecret = Invoke-SSHCommand "cd $REPO_DIR ; grep JWT_SECRET .env 2>/dev/null | cut -d'=' -f2"
if ([string]::IsNullOrWhiteSpace($jwtSecret) -or $jwtSecret -like "*CHANGE_THIS*") {
    Write-Host "   Generating JWT secrets..." -ForegroundColor Yellow
    $newJwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    $newJwtRefresh = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    Invoke-SSHCommand "cd $REPO_DIR ; sed -i 's/JWT_SECRET=.*/JWT_SECRET=$newJwtSecret/' .env ; sed -i 's/JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=$newJwtRefresh/' .env"
    Write-Host "   JWT secrets generated" -ForegroundColor Green
} else {
    Write-Host "   JWT_SECRET already set" -ForegroundColor Green
}
Write-Host ""

# 3. Rebuild backend
Write-Host "[3/6] Rebuilding backend..." -ForegroundColor Yellow
Invoke-SSHCommand "cd $REPO_DIR ; docker compose build backend"
Write-Host ""

# 4. Create super admin
Write-Host "[4/6] Creating/updating super admin..." -ForegroundColor Yellow
Invoke-SSHCommand "cd $REPO_DIR ; docker compose exec -T backend node scripts/create-super-admin-docker.js"
Write-Host ""

# 5. Restart services
Write-Host "[5/6] Restarting services..." -ForegroundColor Yellow
Invoke-SSHCommand "cd $REPO_DIR ; docker compose restart backend nginx"
Start-Sleep -Seconds 5
Write-Host "   Services restarted" -ForegroundColor Green
Write-Host ""

# 6. Rebuild frontend
Write-Host "[6/6] Rebuilding frontend..." -ForegroundColor Yellow
Invoke-SSHCommand "cd $REPO_DIR ; docker compose build frontend ; docker compose up -d frontend"
Write-Host ""

# 7. Check status
Write-Host "Checking deployment status..." -ForegroundColor Yellow
Invoke-SSHCommand "cd $REPO_DIR ; docker compose ps"
Write-Host ""

# 8. Health Check
Write-Host "Performing Health Check..." -ForegroundColor Yellow
Invoke-SSHCommand "cd $REPO_DIR ; curl -s http://localhost:3000/health || echo 'Health check endpoint unreachable'"
Write-Host ""

Write-Host "Deploy complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "   1. Wait 10-15 seconds for services to start"
Write-Host "   2. Clear browser cache (Ctrl+Shift+Delete)"
Write-Host "   3. Hard refresh (Ctrl+Shift+R)"
Write-Host "   4. Try login: admin@warungin.com / admin123"
Write-Host ""
