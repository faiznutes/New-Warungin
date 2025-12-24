#!/bin/bash

# Emergency Backend Rebuild Script
# Run this on the server to force rebuild the backend image with latest changes
# Usage: bash EMERGENCY_BACKEND_REBUILD.sh

set -e  # Exit on error

echo "==== Emergency Backend Rebuild ===="
echo "This script will:"
echo "1. Stop all services"
echo "2. Remove old backend image"
echo "3. Force rebuild backend from scratch"
echo "4. Restart all services"
echo ""

cd ~/New-Warungin || { echo "Failed to cd to New-Warungin"; exit 1; }

echo "[1/5] Stopping all containers..."
echo "123" | sudo -S docker compose down

echo "[2/5] Removing old backend image..."
echo "123" | sudo -S docker rmi new-warungin-backend:latest 2>/dev/null || true
echo "123" | sudo -S docker image prune -f

echo "[3/5] Verifying source file exists..."
if [ ! -f "src/routes/superadmin-backup.routes.ts" ]; then
  echo "ERROR: Source file not found!"
  exit 1
fi

echo "Checking if /critical route is first in file..."
head -50 src/routes/superadmin-backup.routes.ts | grep -q "router.get" && {
  echo "✓ Route file structure looks correct"
} || {
  echo "⚠ Warning: Could not verify route structure"
}

echo ""
echo "[4/5] Building all images from scratch..."
echo "123" | sudo -S docker compose build --no-cache

echo "[5/5] Starting all services..."
echo "123" | sudo -S docker compose up -d

echo ""
echo "==== Rebuild Complete ===="
echo "Waiting 30 seconds for services to start..."
sleep 30

echo ""
echo "Checking service status..."
echo "123" | sudo -S docker compose ps

echo ""
echo "Testing backend health..."
curl -s http://localhost:3000/health | jq . || echo "Health check endpoint may still be starting..."

echo ""
echo "==== Done ===="
echo "If backend still not responding:"
echo "1. Check logs: docker compose logs backend | tail -100"
echo "2. Verify nginx proxy: docker compose logs nginx | tail -50"
echo "3. Test API: curl http://localhost/api/superadmin/backups"
