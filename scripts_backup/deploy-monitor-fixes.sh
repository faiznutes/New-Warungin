#!/bin/bash
# Script untuk deploy perbaikan Server Monitor dan Backup
# Jalankan di server: bash scripts/deploy-monitor-fixes.sh

set -e

echo "🚀 Deploying Server Monitor and Backup Fixes..."
echo ""

# Navigate to project directory
cd ~/New-Warungin || { echo "❌ Directory ~/New-Warungin not found"; exit 1; }

# Pull latest changes
echo "📥 Pulling latest changes from Git..."
git pull || { echo "❌ Git pull failed"; exit 1; }
echo "✅ Git pull successful"
echo ""

# Restart backend
echo "🔄 Restarting backend container..."
echo "123" | sudo -S docker compose restart backend || { echo "❌ Backend restart failed"; exit 1; }
echo "✅ Backend restart initiated"
echo ""

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready (60 seconds)..."
sleep 60

# Check backend status
echo "📊 Checking backend status..."
BACKEND_STATUS=$(echo "123" | sudo -S docker compose ps backend --format '{{.Status}}' 2>&1)
echo "Backend Status: $BACKEND_STATUS"
echo ""

# Health check
echo "🏥 Performing health check..."
if echo "123" | sudo -S docker compose exec -T backend wget --quiet --tries=1 --spider http://localhost:3000/health 2>&1; then
    echo "✅ Backend health check: PASSED"
else
    echo "❌ Backend health check: FAILED"
    echo "Checking logs..."
    echo "123" | sudo -S docker compose logs --tail=20 backend 2>&1 | tail -10
fi
echo ""

# Show all services status
echo "📋 All Services Status:"
echo "123" | sudo -S docker compose ps --format 'table {{.Name}}\t{{.Status}}' 2>&1 | grep -E 'NAME|warungin' | head -12
echo ""

echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Test Server Monitor page: https://pos.faiznute.site/app/superadmin/server-monitor"
echo "2. Test Backup Management page: https://pos.faiznute.site/app/superadmin/backups"
echo "3. Verify disk usage shows data (not 'Tidak ada data disk')"
echo "4. Verify backup loading works without errors"

