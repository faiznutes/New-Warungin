#!/bin/bash

# Full deployment script for backup route fix
# This script:
# 1. Pulls latest changes from server repo
# 2. Rebuilds docker images
# 3. Restarts services

set -e

echo "=========================================="
echo "Backup Route Fix - Server Deployment"
echo "=========================================="
echo ""

cd ~/New-Warungin

echo "[1/4] Pulling latest changes from GitHub..."
git pull origin main
echo "✓ Pull complete"
echo ""

echo "[2/4] Stopping current services..."
echo "123" | sudo -S docker compose down
echo "✓ Services stopped"
echo ""

echo "[3/4] Removing old backend image..."
echo "123" | sudo -S docker rmi new-warungin-backend 2>/dev/null || echo "Image not found (OK)"
echo ""

echo "[4/4] Building and starting services..."
echo "123" | sudo -S docker compose up -d --build
echo "✓ Services starting"
echo ""

sleep 30

echo "=========================================="
echo "Checking service status..."
echo "=========================================="
echo "123" | sudo -S docker compose ps | grep -E "nginx|backend|frontend|postgres"
echo ""

echo "Checking for errors in backend logs..."
echo "123" | sudo -S docker compose logs backend 2>&1 | tail -20
echo ""

echo "=========================================="
echo "✓ Deployment Complete!"
echo "=========================================="
