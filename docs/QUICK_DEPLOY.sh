#!/bin/bash
# Quick Deploy Script untuk Permission Fixes
# Usage: bash QUICK_DEPLOY.sh

SSH_HOST="root@192.168.1.101"
SSH_PASSWORD="123"
REMOTE_PATH="/root/New-Warungin"

echo "=========================================="
echo "🚀 Deploy Permission Fixes ke SSH Server"
echo "=========================================="
echo ""

# Create archive with only changed files
echo "📦 Creating archive..."
tar -czf /tmp/warungin-permission-fix.tar.gz \
    src/middlewares/plan-feature-guard.ts \
    src/routes/outlet.routes.ts \
    src/routes/supplier.routes.ts \
    src/routes/purchase-order.routes.ts \
    src/routes/stock-transfer.routes.ts \
    src/routes/stock-alert.routes.ts \
    src/services/plan-features.service.ts \
    client/src/layouts/AppLayout.vue \
    client/src/layouts/TenantLayout.vue \
    client/src/views/stores/Stores.vue \
    client/src/router/index.ts \
    docker-compose.yml

if [ $? -ne 0 ]; then
    echo "❌ Failed to create archive"
    exit 1
fi

echo "✅ Archive created: /tmp/warungin-permission-fix.tar.gz"
echo ""

# Transfer file
echo "📤 Transferring to server..."
if command -v sshpass &> /dev/null; then
    sshpass -p "$SSH_PASSWORD" scp -o StrictHostKeyChecking=no /tmp/warungin-permission-fix.tar.gz "${SSH_HOST}:/tmp/"
else
    echo "⚠️  sshpass not found. Enter password manually: $SSH_PASSWORD"
    scp -o StrictHostKeyChecking=no /tmp/warungin-permission-fix.tar.gz "${SSH_HOST}:/tmp/"
fi

if [ $? -ne 0 ]; then
    echo "❌ Transfer failed"
    exit 1
fi

echo "✅ File transferred"
echo ""

# Deploy on server
echo "🔧 Deploying on server..."
if command -v sshpass &> /dev/null; then
    sshpass -p "$SSH_PASSWORD" ssh -o StrictHostKeyChecking=no "$SSH_HOST" << 'ENDSSH'
cd /root/New-Warungin
echo "Extracting files..."
tar -xzf /tmp/warungin-permission-fix.tar.gz
rm /tmp/warungin-permission-fix.tar.gz
echo "✅ Files extracted"
echo ""
echo "Stopping containers..."
docker compose down
echo "✅ Containers stopped"
echo ""
echo "Building containers..."
docker compose build --no-cache
echo "✅ Build completed"
echo ""
echo "Starting containers..."
docker compose up -d
echo "✅ Containers started"
echo ""
sleep 5
echo "Container status:"
docker compose ps
ENDSSH
else
    echo "⚠️  sshpass not found. Please run manually:"
    echo "ssh root@192.168.1.101"
    echo "cd /root/New-Warungin"
    echo "tar -xzf /tmp/warungin-permission-fix.tar.gz"
    echo "rm /tmp/warungin-permission-fix.tar.gz"
    echo "docker compose down"
    echo "docker compose build --no-cache"
    echo "docker compose up -d"
fi

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="

# Cleanup
rm -f /tmp/warungin-permission-fix.tar.gz
