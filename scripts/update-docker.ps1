# PowerShell script untuk update Docker setelah pull dari Git
# Usage: .\scripts\update-docker.ps1 [-NoRebuild] [-SkipMigration]

param(
    [switch]$NoRebuild,
    [switch]$SkipMigration
)

$ErrorActionPreference = "Stop"

# Colors
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Cyan "========================================"
Write-ColorOutput Cyan "  Docker Update Script"
Write-ColorOutput Cyan "========================================"
Write-Output ""

# Step 1: Check Git status
Write-ColorOutput Yellow "📋 Step 1: Checking Git status..."
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-ColorOutput Yellow "⚠️  Warning: You have uncommitted changes"
    $response = Read-Host "Continue anyway? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-ColorOutput Red "Aborted."
        exit 1
    }
}

# Step 2: Pull from Git
Write-ColorOutput Yellow "🔄 Step 2: Pulling latest changes from Git..."
try {
    git pull origin main
    Write-ColorOutput Green "✅ Git pull successful"
} catch {
    Write-ColorOutput Red "❌ Git pull failed: $_"
    exit 1
}
Write-Output ""

# Step 3: Stop containers
Write-ColorOutput Yellow "🛑 Step 3: Stopping containers..."
docker compose down
Write-ColorOutput Green "✅ Containers stopped"
Write-Output ""

# Step 4: Rebuild
if (-not $NoRebuild) {
    Write-ColorOutput Yellow "🔨 Step 4: Rebuilding containers..."
    docker compose build --no-cache
    Write-ColorOutput Green "✅ Containers rebuilt"
} else {
    Write-ColorOutput Yellow "⏭️  Step 4: Skipping rebuild (-NoRebuild flag)"
}
Write-Output ""

# Step 5: Run migrations
if (-not $SkipMigration) {
    Write-ColorOutput Yellow "🗄️  Step 5: Running database migrations..."
    try {
        docker compose run --rm backend npm run prisma:migrate:safe
        Write-ColorOutput Green "✅ Migrations completed"
    } catch {
        Write-ColorOutput Yellow "⚠️  Migration failed or no migrations to run"
    }
} else {
    Write-ColorOutput Yellow "⏭️  Step 5: Skipping migrations (-SkipMigration flag)"
}
Write-Output ""

# Step 6: Start containers
Write-ColorOutput Yellow "🚀 Step 6: Starting containers..."
docker compose up -d
Write-ColorOutput Green "✅ Containers started"
Write-Output ""

# Step 7: Wait for services
Write-ColorOutput Yellow "⏳ Step 7: Waiting for services to be healthy..."
Start-Sleep -Seconds 10
Write-Output ""

# Step 8: Check status
Write-ColorOutput Yellow "📊 Step 8: Checking services status..."
docker compose ps
Write-Output ""

# Step 9: Show recent logs
Write-ColorOutput Yellow "📋 Step 9: Recent logs (last 20 lines)..."
docker compose logs --tail=20
Write-Output ""

# Final message
Write-ColorOutput Cyan "========================================"
Write-ColorOutput Green "✨ Update complete!"
Write-ColorOutput Cyan "========================================"
Write-Output ""
Write-Output "Useful commands:"
Write-ColorOutput Cyan "  docker compose logs -f          # Follow logs"
Write-ColorOutput Cyan "  docker compose ps               # Check status"
Write-ColorOutput Cyan "  docker compose restart <service> # Restart service"
Write-Output ""

