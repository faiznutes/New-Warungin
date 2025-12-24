#!/bin/bash

# tmpfs Fix Deployment Script
# Execute on server: bash ~/deploy-fix.sh

set -e

echo "==========================================="
echo "Docker Compose tmpfs Fix - Deployment"
echo "==========================================="
echo ""

cd ~/New-Warungin

echo "[1/5] Checking git status..."
git status
echo ""

echo "[2/5] Pulling latest changes from GitHub..."
git pull origin main
echo "✓ Pull complete"
echo ""

echo "[3/5] Stopping Docker containers..."
docker compose down
echo "✓ Containers stopped"
echo ""

echo "[4/5] Starting containers with fixed docker-compose.yml..."
docker compose up -d
sleep 5
echo "✓ Containers started"
echo ""

echo "[5/5] Verifying services..."
echo ""
echo "=== Docker Compose Status ==="
docker compose ps
echo ""
echo "=== Nginx Status Check ==="
docker compose ps | grep nginx
echo ""
echo "=== Nginx Logs (Last 30 lines) ==="
docker compose logs nginx 2>&1 | tail -30
echo ""
echo "==========================================="
echo "✓ Deployment Complete!"
echo "==========================================="
echo ""
echo "Expected: nginx should be 'Up X minutes' or 'Up ... (health: healthy)'"
echo "NOT 'Restarting (1)'"
echo ""
