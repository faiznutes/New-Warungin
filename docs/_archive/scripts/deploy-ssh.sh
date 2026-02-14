#!/bin/bash
# Deploy script untuk dijalankan via sshpass

set -e

SERVER="192.168.1.101"
USER="root"
PASSWORD="123"
PROJECT_DIR="New-Warungin"

echo "==================================="
echo "🚀 PHASE 35 Deployment via SSH"
echo "==================================="
echo ""

# Deploy using sshpass
echo "📥 Connecting to $SERVER and deploying..."

sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no \
  -o UserKnownHostsFile=/dev/null \
  "$USER@$SERVER" << 'DEPLOY_SCRIPT'

set -e
echo "✅ Connected to server!"
echo ""

# 1. Navigate to project directory
cd /root/New-Warungin || { echo "❌ Directory not found"; exit 1; }
echo "📂 Working directory: $(pwd)"
echo ""

# 2. Git pull
echo "📥 Pulling latest changes..."
git pull origin main
echo "✅ Git pull complete"
echo ""

# 3. Install dependencies
echo "📦 Installing dependencies..."
npm ci --production
echo "✅ Dependencies installed"
echo ""

# 4. Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate
echo "✅ Prisma client generated"
echo ""

# 5. Apply migrations
echo "🗄️ Applying database migrations..."
npx prisma migrate deploy
echo "✅ Migrations applied"
echo ""

# 6. Build
echo "🏗️ Building application..."
npm run build
echo "✅ Build complete"
echo ""

# 7. Summary
echo "==================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "==================================="
echo ""
echo "Summary:"
echo "  Branch: $(git branch --show-current)"
echo "  Latest: $(git log -1 --oneline)"
echo ""

DEPLOY_SCRIPT

echo "✅ Deployment finished!"
echo ""
echo "Next steps:"
echo "1. SSH ke server: sshpass -p '123' ssh root@$SERVER"
echo "2. Start aplikasi: npm start"
echo "3. Check status: curl http://localhost:3000/health"

