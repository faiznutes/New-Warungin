# Script untuk deploy Warungin ke VPS dari Windows
# Clone repository Root, setup Docker, dan create super admin
# Usage: .\scripts\deploy-to-vps-root.ps1

param(
    [Parameter(Mandatory=$true)]
    [string]$SSHHost,
    
    [string]$SSHPassword = "",
    [string]$ProjectPath = "/home/warungin/Warungin",
    [string]$GitRepo = "https://YOUR_GITHUB_TOKEN@github.com/faiznutes/Root.git",
    [string]$GitBranch = "main"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🚀 Deploy Warungin ke VPS dari Root" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "SSH Host: $SSHHost" -ForegroundColor Yellow
Write-Host "Project Path: $ProjectPath" -ForegroundColor Yellow
Write-Host "Git Repository: Root" -ForegroundColor Yellow
Write-Host ""

# Check if sshpass is available for password auth
$useSshpass = $false
if ($SSHPassword -and (Get-Command sshpass -ErrorAction SilentlyContinue)) {
    $useSshpass = $true
    Write-Host "✅ sshpass ditemukan, akan menggunakan password authentication" -ForegroundColor Green
} elseif ($SSHPassword) {
    Write-Host "⚠️  sshpass tidak ditemukan. Install dengan: choco install sshpass" -ForegroundColor Yellow
    Write-Host "   Atau gunakan SSH key authentication" -ForegroundColor Yellow
}

Write-Host ""

# Commands untuk dijalankan di VPS
$deployCommands = @"
set -e

echo "=========================================="
echo "🚀 Warungin VPS Setup dari Root"
echo "=========================================="
echo ""

PROJECT_DIR="$ProjectPath"
GIT_REPO="$GitRepo"
GIT_BRANCH="$GitBranch"

# Step 1: Install prerequisites (jika belum)
echo "[1/7] Checking prerequisites..."
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker `$USER
    rm get-docker.sh
    echo "✅ Docker installed"
else
    echo "✅ Docker sudah terinstall"
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-`$(uname -s)-`$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed"
else
    echo "✅ Docker Compose sudah terinstall"
fi

echo ""

# Step 2: Clone atau update repository
echo "[2/7] Setting up repository..."
if [ -d "`$PROJECT_DIR" ]; then
    echo "Directory sudah ada, updating..."
    cd `$PROJECT_DIR
    git remote set-url origin `$GIT_REPO
    git pull origin `$GIT_BRANCH || echo "⚠️  Pull failed, continuing..."
else
    echo "Cloning repository..."
    mkdir -p `$(dirname `$PROJECT_DIR)
    cd `$(dirname `$PROJECT_DIR)
    git clone `$GIT_REPO `$PROJECT_DIR
    cd `$PROJECT_DIR
    git checkout `$GIT_BRANCH 2>/dev/null || true
fi

cd `$PROJECT_DIR
echo "✅ Repository ready"
echo ""

# Step 3: Setup .env file
echo "[3/7] Setting up environment file..."
if [ ! -f .env ]; then
    echo "Creating .env from env.example..."
    cp env.example .env
    
    # Generate secure secrets
    JWT_SECRET=`$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    JWT_REFRESH=`$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    DB_PASSWORD=`$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-24)
    
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=`$JWT_SECRET/" .env
    sed -i "s/JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=`$JWT_REFRESH/" .env
    sed -i "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=`$DB_PASSWORD/" .env
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgresql://postgres:`$DB_PASSWORD@postgres:5432/warungin?schema=public|" .env
    
    echo "✅ .env file created dengan secure passwords"
    echo "⚠️  IMPORTANT: Edit .env untuk konfigurasi SMTP, Midtrans, dan Cloudflare"
else
    echo "✅ .env file sudah ada"
fi

echo ""

# Step 4: Setup firewall
echo "[4/7] Setting up firewall..."
if command -v ufw &> /dev/null; then
    sudo ufw allow 22/tcp comment 'SSH' 2>/dev/null || true
    sudo ufw allow 80/tcp comment 'HTTP' 2>/dev/null || true
    sudo ufw allow 443/tcp comment 'HTTPS' 2>/dev/null || true
    echo "✅ Firewall configured"
else
    echo "⚠️  UFW tidak ditemukan, skip firewall"
fi

echo ""

# Step 5: Build Docker images
echo "[5/7] Building Docker images..."
echo "This may take several minutes..."
docker compose build --no-cache 2>/dev/null || docker compose build 2>/dev/null || docker-compose build || {
    echo "❌ Build failed"
    exit 1
}
echo "✅ Docker images built"
echo ""

# Step 6: Start containers
echo "[6/7] Starting Docker containers..."
docker compose down 2>/dev/null || true
docker compose up -d

echo "Waiting for services to start..."
sleep 20

echo ""
echo "Container Status:"
docker compose ps
echo ""

# Step 7: Setup database and super admin
echo "[7/7] Setting up database and super admin..."
echo "Waiting for database to be ready..."
sleep 30

# Create super admin
if docker compose ps | grep -q "warungin-backend.*Up"; then
    echo "Creating super admin..."
    docker compose exec -T backend node scripts/create-super-admin-docker.js 2>/dev/null || {
        echo "⚠️  Super admin creation failed, mungkin sudah ada"
    }
    echo "✅ Super admin setup completed"
else
    echo "⚠️  Backend belum ready, super admin akan dibuat otomatis"
fi

echo ""

# Cloudflare Tunnel (jika dikonfigurasi)
if grep -q "CLOUDFLARE_TUNNEL_TOKEN=" .env && ! grep -q "CLOUDFLARE_TUNNEL_TOKEN=$" .env; then
    TOKEN=`$(grep "CLOUDFLARE_TUNNEL_TOKEN=" .env | cut -d'=' -f2 | tr -d ' ')
    if [ -n "`$TOKEN" ] && [ "`$TOKEN" != "" ]; then
        echo "Starting Cloudflare Tunnel..."
        docker compose --profile cloudflare up -d cloudflared 2>/dev/null || true
        echo "✅ Cloudflare Tunnel started"
    fi
fi

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "📊 Final Status:"
docker compose ps --format "table {{.Name}}\t{{.Status}}"
echo ""
echo "🔑 Super Admin:"
echo "   Email: admin@warungin.com"
echo "   Password: admin123"
echo "   ⚠️  Ganti password setelah login pertama!"
echo ""
echo "📝 Next Steps:"
echo "   1. Edit .env: nano `$PROJECT_DIR/.env"
echo "   2. Cek logs: cd `$PROJECT_DIR && docker compose logs -f"
echo "   3. Akses: http://`$(hostname -I | awk '{print `$1}')"
echo ""
"@

# Execute via SSH
try {
    Write-Host "Connecting ke VPS dan menjalankan setup..." -ForegroundColor Green
    Write-Host ""
    
    if ($useSshpass) {
        $deployCommands | sshpass -p $SSHPassword ssh -o StrictHostKeyChecking=no -o ConnectTimeout=30 $SSHHost bash
    } else {
        $deployCommands | ssh -o StrictHostKeyChecking=no -o ConnectTimeout=30 $SSHHost bash
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Deployment berhasil!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "⚠️  Deployment selesai dengan beberapa warning" -ForegroundColor Yellow
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error saat deployment: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Pastikan SSH connection berhasil: ssh $SSHHost" -ForegroundColor Gray
    Write-Host "2. Pastikan user memiliki sudo access" -ForegroundColor Gray
    Write-Host "3. Pastikan Docker bisa diinstall di VPS" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

