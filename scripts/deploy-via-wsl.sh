#!/bin/bash
# Deploy script via WSL to SSH server

SSH_HOST="root@192.168.1.101"
SSH_PASS="123"
PROJECT_DIR="~/New-Warungin"

echo "🔐 Connecting to server..."
sshpass -p "$SSH_PASS" ssh -o StrictHostKeyChecking=no "$SSH_HOST" << 'ENDSSH'
cd ~/New-Warungin

echo "📥 Pulling latest changes from git..."
git pull

echo "🗄️ Running database migrations..."
docker compose exec -T postgres psql -U postgres -d warungin << 'SQL'
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS "purchasedBy" TEXT NOT NULL DEFAULT 'SELF';
ALTER TABLE tenant_addons ADD COLUMN IF NOT EXISTS "purchasedBy" TEXT NOT NULL DEFAULT 'SELF';
SQL

echo "🛑 Stopping containers..."
docker compose down

echo "🔨 Building containers..."
docker compose build

echo "🚀 Starting containers..."
docker compose up -d

echo "✅ Deployment completed!"
docker compose ps
ENDSSH
