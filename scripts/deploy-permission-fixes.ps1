# Script to deploy permission fixes to SSH server
# Usage: .\scripts\deploy-permission-fixes.ps1

$sshHost = "root@192.168.1.101"
$sshPassword = "123"
$remotePath = "/root/New-Warungin"
$localPath = "f:\Backup W11\Project\New-Warungin"

Write-Host "🚀 Starting deployment to SSH server..." -ForegroundColor Cyan

# Create temporary directory for tar file
$tempDir = $env:TEMP
$tarFile = Join-Path $tempDir "warungin-update.tar.gz"

Write-Host "📦 Creating archive..." -ForegroundColor Yellow
cd $localPath

# Create tar.gz excluding node_modules, .git, dist, build, logs
$excludeArgs = @(
    "--exclude=node_modules",
    "--exclude=.git",
    "--exclude=dist",
    "--exclude=build",
    "--exclude=*.log",
    "--exclude=.env"
)

# Use PowerShell compression or tar if available
if (Get-Command tar -ErrorAction SilentlyContinue) {
    tar -czf $tarFile $excludeArgs .
    Write-Host "✅ Archive created: $tarFile" -ForegroundColor Green
} else {
    Write-Host "❌ tar command not found. Please install tar or use WSL." -ForegroundColor Red
    exit 1
}

# Transfer file using SCP (requires ssh/scp in PATH)
Write-Host "📤 Transferring files to server..." -ForegroundColor Yellow

# Use plink (PuTTY) or ssh with expect-like approach
# Or use PowerShell SSH module if available

# Try using OpenSSH if available
if (Get-Command scp -ErrorAction SilentlyContinue) {
    # Create a simple expect-like script using PowerShell
    $scpScript = @"
$sshPassword
"@
    
    Write-Host "Using SCP to transfer file..." -ForegroundColor Yellow
    Write-Host "Please enter password when prompted: $sshPassword"
    
    scp -o StrictHostKeyChecking=no $tarFile "${sshHost}:${tarFile}"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ File transferred successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Transfer failed. Trying alternative method..." -ForegroundColor Red
    }
}

# Execute commands on remote server
Write-Host "🔧 Extracting files and rebuilding containers..." -ForegroundColor Yellow

# SSH command sequence
$sshCommands = @"
cd $remotePath || mkdir -p $remotePath && cd $remotePath
tar -xzf $tarFile -C $remotePath --strip-components=0 2>/dev/null || tar -xzf $tarFile
rm -f $tarFile
echo '📦 Files extracted'
cd $remotePath
docker compose down
echo '🛑 Containers stopped'
docker compose build --no-cache
echo '🔨 Docker build completed'
docker compose up -d
echo '🚀 Containers started'
sleep 5
docker compose ps
"@

# Save commands to a temporary file
$cmdFile = Join-Path $tempDir "deploy-commands.sh"
$sshCommands | Out-File -FilePath $cmdFile -Encoding ASCII

Write-Host "Executing remote commands..." -ForegroundColor Yellow
Write-Host "Please enter password when prompted: $sshPassword"
Write-Host ""
Write-Host "Or run these commands manually on the server:" -ForegroundColor Cyan
Write-Host $sshCommands -ForegroundColor Gray
Write-Host ""

# Try to execute via SSH
if (Get-Command ssh -ErrorAction SilentlyContinue) {
    Write-Host "Attempting SSH connection..." -ForegroundColor Yellow
    ssh -o StrictHostKeyChecking=no $sshHost "bash -s" < $cmdFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  SSH command had issues. Please run manually." -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ SSH command not found. Please run commands manually." -ForegroundColor Red
}

# Cleanup
Remove-Item -Path $cmdFile -ErrorAction SilentlyContinue
Write-Host ""
Write-Host "📝 Manual deployment instructions:" -ForegroundColor Cyan
Write-Host "1. Copy $tarFile to server" -ForegroundColor White
Write-Host "2. SSH to server: ssh root@192.168.1.101" -ForegroundColor White
Write-Host "3. Run: cd $remotePath && tar -xzf $tarFile && docker compose down && docker compose build --no-cache && docker compose up -d" -ForegroundColor White
