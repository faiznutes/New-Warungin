# Script untuk pull dari git Root dan deploy ke Docker via SSH
# Usage: .\scripts\pull-and-deploy-root.ps1

param(
    [string]$SSHHost = "warungin@192.168.0.101",
    [string]$SSHPassword = "123",
    [string]$ProjectPath = "/home/warungin/Warungin",
    [string]$GitBranch = "main"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Pull dari Git Root & Deploy ke Docker" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "SSH Host: $SSHHost" -ForegroundColor Yellow
Write-Host "Project Path: $ProjectPath" -ForegroundColor Yellow
Write-Host "Git Branch: $GitBranch" -ForegroundColor Yellow
Write-Host ""

# Step 1: Pull dari git Root di lokal
Write-Host "[1/5] Pulling latest code dari Root repository..." -ForegroundColor Green
try {
    $gitStatus = git status --short 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Warning: Git status check failed" -ForegroundColor Yellow
    } else {
        Write-Host "Git status sebelum pull:" -ForegroundColor Gray
        Write-Host $gitStatus -ForegroundColor Gray
    }
    
    Write-Host "Pulling dari origin/$GitBranch..." -ForegroundColor Gray
    git pull origin $GitBranch
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Pull berhasil!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Pull mungkin gagal atau sudah up-to-date" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error saat pull: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Push ke Root repository (jika ada perubahan)
Write-Host "[2/5] Checking untuk push ke Root repository..." -ForegroundColor Green
try {
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Host "Ada perubahan yang belum di-commit. Ingin commit dan push? (y/n): " -ForegroundColor Yellow -NoNewline
        $response = Read-Host
        if ($response -eq "y" -or $response -eq "Y") {
            Write-Host "Masukkan commit message: " -ForegroundColor Yellow -NoNewline
            $commitMsg = Read-Host
            if ([string]::IsNullOrWhiteSpace($commitMsg)) {
                $commitMsg = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
            }
            
            git add .
            git commit -m $commitMsg
            git push origin $GitBranch
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Push berhasil!" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "✅ Tidak ada perubahan untuk di-push" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Warning: Error saat check push: $_" -ForegroundColor Yellow
}

Write-Host ""

# Step 3: Deploy ke server via SSH
Write-Host "[3/5] Connecting ke server via SSH..." -ForegroundColor Green

# Check if sshpass is available (for password authentication)
$useSshpass = $false
if (Get-Command sshpass -ErrorAction SilentlyContinue) {
    $useSshpass = $true
    Write-Host "✅ sshpass ditemukan, akan menggunakan password authentication" -ForegroundColor Green
} else {
    Write-Host "⚠️  sshpass tidak ditemukan, akan menggunakan SSH key (jika ada)" -ForegroundColor Yellow
    Write-Host "   Install sshpass untuk password auth: choco install sshpass atau download dari GitHub" -ForegroundColor Gray
}

Write-Host ""

# Commands untuk dijalankan di server
$deployCommands = @"
cd $ProjectPath
echo '=== Current Directory ==='
pwd
echo ''
echo '=== Git Remote Check ==='
git remote -v
echo ''
echo '=== Updating Git Remote to Root ==='
git remote set-url origin https://YOUR_GITHUB_TOKENKpQBqVwr7Xk6YmdkSqHuKlumGirBTE0Oab0p@github.com/faiznutes/Root.git
echo ''
echo '=== Git Status (Before Pull) ==='
git status --short
echo ''
echo '=== Pulling Latest Changes from Root ==='
git pull origin $GitBranch
echo ''
echo '=== Git Status (After Pull) ==='
git status --short
echo ''
echo '=== Rebuilding Docker Containers ==='
docker compose down 2>/dev/null || docker-compose down 2>/dev/null || true
docker compose build --no-cache 2>/dev/null || docker-compose build --no-cache 2>/dev/null || true
echo ''
echo '=== Starting Docker Containers ==='
docker compose up -d 2>/dev/null || docker-compose up -d 2>/dev/null || true
echo ''
echo '=== Waiting 15 seconds for services to start ==='
sleep 15
echo ''
echo '=== Container Status ==='
docker compose ps 2>/dev/null || docker-compose ps 2>/dev/null || docker ps --format 'table {{.Names}}\t{{.Status}}'
echo ''
echo '=== Backend Logs (last 30 lines) ==='
docker compose logs --tail=30 backend 2>/dev/null || docker-compose logs --tail=30 backend 2>/dev/null || echo 'Could not get backend logs'
echo ''
echo '=== Frontend Logs (last 20 lines) ==='
docker compose logs --tail=20 frontend 2>/dev/null || docker-compose logs --tail=20 frontend 2>/dev/null || echo 'Could not get frontend logs'
echo ''
echo '=== Done! ==='
"@

# Execute via SSH
try {
    if ($useSshpass) {
        Write-Host "Deploying dengan sshpass..." -ForegroundColor Gray
        $deployCommands | sshpass -p $SSHPassword ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 $SSHHost bash
    } else {
        Write-Host "Deploying dengan SSH key..." -ForegroundColor Gray
        $deployCommands | ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 $SSHHost bash
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Deploy berhasil!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "⚠️  Deploy selesai dengan beberapa warning" -ForegroundColor Yellow
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error saat deploy: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Pastikan SSH connection berhasil: ssh $SSHHost" -ForegroundColor Gray
    Write-Host "2. Pastikan Docker terinstall di server" -ForegroundColor Gray
    Write-Host "3. Pastikan project path benar: $ProjectPath" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Tunggu 10-15 detik untuk services fully start" -ForegroundColor Gray
Write-Host "   2. Cek health: curl http://$($SSHHost.Split('@')[1])/api/health" -ForegroundColor Gray
Write-Host "   3. Akses aplikasi: http://$($SSHHost.Split('@')[1])" -ForegroundColor Gray
Write-Host ""

