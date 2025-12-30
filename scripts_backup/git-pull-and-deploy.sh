#!/bin/bash
# Script untuk pull dari git dan deploy di SSH server
# Usage: ssh root@192.168.1.101 "bash -s" < scripts/git-pull-and-deploy.sh

REMOTE_PATH="/root/New-Warungin"
GIT_BRANCH="main"

cd $REMOTE_PATH || { echo "❌ Directory tidak ditemukan"; exit 1; }

echo "📥 Pulling latest changes dari git..."
git fetch origin
git pull origin $GIT_BRANCH

if [ $? -ne 0 ]; then
    echo "❌ Git pull failed"
    exit 1
fi

echo "✅ Git pull completed"
echo ""

echo "🛑 Stopping containers..."
docker compose down

echo "✅ Containers stopped"
echo ""

echo "🔨 Building Docker containers..."
docker compose build --no-cache

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed"
    exit 1
fi

echo "✅ Docker build completed"
echo ""

echo "🚀 Starting containers..."
docker compose up -d

echo "✅ Containers started"
echo ""

echo "⏳ Waiting for containers to be ready..."
sleep 10

echo ""
echo "📊 Container Status:"
docker compose ps

echo ""
echo "📋 Recent logs (last 20 lines):"
docker compose logs --tail=20

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
