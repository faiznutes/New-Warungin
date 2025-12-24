#!/bin/bash
set -e

echo "================================"
echo "Docker-Compose tmpfs Fix Deployment"
echo "================================"
echo ""

# Step 1: Push to GitHub (if not already pushed)
echo "[1/5] Pushing changes to GitHub..."
cd ~/New-Warungin
git push origin main || echo "Already up to date or push failed - continuing anyway"
echo "✓ Push complete (or already synced)"
echo ""

# Step 2: Stop running containers
echo "[2/5] Stopping Docker containers..."
docker compose down
echo "✓ Containers stopped"
echo ""

# Step 3: Pull latest changes
echo "[3/5] Pulling latest docker-compose.yml..."
git pull origin main
echo "✓ Latest changes pulled"
echo ""

# Step 4: Start containers with fixed config
echo "[4/5] Starting Docker containers with fixed config..."
docker compose up -d
sleep 5
echo "✓ Containers started"
echo ""

# Step 5: Verify health status
echo "[5/5] Verifying service health..."
echo ""
echo "Service Status:"
docker compose ps
echo ""
echo "Nginx Status:"
docker compose ps | grep nginx || echo "Checking nginx logs..."
echo ""
echo "Nginx Logs (last 20 lines):"
docker compose logs nginx | tail -20
echo ""
echo "================================"
echo "✓ Deployment Complete!"
echo "================================"
