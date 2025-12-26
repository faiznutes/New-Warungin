#!/bin/bash
set -e

echo "[INFO] Starting Local Deployment Script on Server..."

# Try to find the directory
TARGET_DIR=""
if [ -d "/home/faiz/New-Warungin" ]; then
    TARGET_DIR="/home/faiz/New-Warungin"
elif [ -d "/root/New-Warungin" ]; then
    TARGET_DIR="/root/New-Warungin"
else
    echo "[ERROR] Could not find New-Warungin directory in /home/faiz or /root"
    exit 1
fi

echo "[INFO] Navigate to $TARGET_DIR"
cd "$TARGET_DIR"

echo "[INFO] Pulling latest changes..."
git config --global --add safe.directory "$TARGET_DIR"
git pull origin main

echo "[INFO] Rebuilding dependencies in Dockerfile (if changed)..."
# The docker-compose build will handle this since we updated the Dockerfile

echo "[INFO] Stopping containers..."
docker compose down

echo "[INFO] Removing old backend/frontend images to force rebuild..."
docker rmi new-warungin-backend new-warungin-frontend 2>/dev/null || true

echo "[INFO] Starting stack with build..."
docker compose up -d --build --remove-orphans

echo "[INFO] Waiting for services to initialize..."
sleep 10

echo "[INFO] Checking status..."
docker compose ps

echo "[INFO] Deployment Complete."
