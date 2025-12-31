# Phase 26 Production Deployment Script
# Run in PowerShell
# .\deploy-to-prod.ps1

param(
    [string]$Server = "192.168.1.101",
    [string]$User = "faiz",
    [string]$Password = "faiz_password_here",  # Change this
    [string]$RootPassword = "123"
)

Write-Host "========================================"
Write-Host "Phase 26 Production Deployment" -ForegroundColor Green
Write-Host "========================================"
Write-Host ""

# Function to run SSH commands
function Invoke-SSHCommand {
    param(
        [string]$Command,
        [string]$Description
    )
    
    Write-Host "[$Description]" -ForegroundColor Yellow
    Write-Host "> $Command"
    
    # Using SSH key if available, otherwise will prompt for password
    ssh $User@$Server $Command
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Success`n" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed`n" -ForegroundColor Red
        exit 1
    }
}

# Step 1: Check connection
Write-Host "[Step 1/8] Testing Connection..." -ForegroundColor Cyan
ssh -o ConnectTimeout=5 $User@$Server "echo 'Connection OK'"

# Step 2: Check Docker
Invoke-SSHCommand "su - root -c 'docker --version && docker ps --format `"table {{.Names}}\t{{.Status}}`"'" "Checking Docker"

# Step 3: Check current git
Invoke-SSHCommand "su - root -c 'cd /root/New-Warungin && git log --oneline | head -3'" "Current Git Status"

# Step 4: Pull latest
Invoke-SSHCommand "su - root -c 'cd /root/New-Warungin && git pull origin main'" "Pulling Latest Code"

# Step 5: Stop containers
Invoke-SSHCommand "su - root -c 'cd /root/New-Warungin && docker-compose down'" "Stopping Containers"

# Step 6: Build images
Invoke-SSHCommand "su - root -c 'cd /root/New-Warungin && docker-compose build --no-cache'" "Building Docker Images"

# Step 7: Start containers
Invoke-SSHCommand "su - root -c 'cd /root/New-Warungin && docker-compose up -d'" "Starting Containers"

# Step 8: Verify
Write-Host "[Step 8/8] Verifying Deployment..." -ForegroundColor Cyan
ssh $User@$Server "su - root -c 'cd /root/New-Warungin && sleep 30 && docker-compose ps'"

# Step 9: Health check
Write-Host ""
Write-Host "Testing Backend Health..." -ForegroundColor Yellow
ssh $User@$Server "curl -s http://localhost:3001/api/health | ConvertFrom-Json | Format-Table -AutoSize"

Write-Host ""
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open browser: http://192.168.1.101"
Write-Host "2. Login as SUPER_ADMIN"
Write-Host "3. Navigate to Tenants"
Write-Host "4. Verify all fixes working"
