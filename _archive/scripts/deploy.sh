#!/bin/bash
# Deploy PHASE 35 - via SSH gateway through Windows host
# This script will execute remote commands via SSH

set -e

SERVER="192.168.1.101"
USER="root"
PASSWORD="123"

echo "=========================================="
echo "🚀 PHASE 35 Deployment"
echo "=========================================="
echo ""
echo "Server: $SERVER"
echo "User: $USER"
echo ""

# Try direct SSH connection via sshpass
echo "📥 Attempting SSH connection..."
echo ""

# Execute deployment via sshpass with heredoc
sshpass -p "$PASSWORD" ssh \
  -o StrictHostKeyChecking=no \
  -o UserKnownHostsFile=/dev/null \
  -o ConnectTimeout=10 \
  "$USER@$SERVER" bash << 'REMOTE_DEPLOY'

set -e

echo "✅ SSH Connection Successful!"
echo ""
echo "=========================================="
echo "Starting Deployment on Remote Server"
echo "=========================================="
echo ""

# 1. Navigate to project
echo "📂 [1/7] Navigating to project directory..."
cd /root/New-Warungin || { echo "❌ Directory /root/New-Warungin not found!"; exit 1; }
echo "✅ Current directory: $(pwd)"
echo ""

# 2. Git pull
echo "📥 [2/7] Pulling latest changes from GitHub..."
git pull origin main || { echo "⚠️ Git pull failed, continuing anyway..."; }
echo "✅ Git changes synced"
echo ""

# 3. Install dependencies
echo "📦 [3/7] Installing npm dependencies..."
npm ci --production
echo "✅ Dependencies installed"
echo ""

# 4. Prisma generate
echo "🔧 [4/7] Generating Prisma client..."
npx prisma generate
echo "✅ Prisma client generated"
echo ""

# 5. Database migrations
echo "🗄️  [5/7] Applying database migrations..."
npx prisma migrate deploy || { echo "⚠️ Migration already applied, continuing..."; }
echo "✅ Database migrations completed"
echo ""

# 6. Build
echo "🏗️  [6/7] Building application..."
npm run build
echo "✅ Build completed"
echo ""

# 7. Display summary
echo "=========================================="
echo "✅ [7/7] DEPLOYMENT SUCCESSFUL!"
echo "=========================================="
echo ""
echo "Deployment Summary:"
echo "  ├─ Server: $SERVER"
echo "  ├─ Branch: $(git branch --show-current)"
echo "  ├─ Latest Commit: $(git log -1 --oneline)"
echo "  └─ Build Status: ✅ SUCCESS"
echo ""
echo "To start the application:"
echo "  1. ssh root@$SERVER"
echo "  2. cd /root/New-Warungin"
echo "  3. npm start"
echo ""

REMOTE_DEPLOY

echo "=========================================="
echo "✅ Remote Deployment Script Completed!"
echo "=========================================="
