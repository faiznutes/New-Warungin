#!/bin/bash
# Deploy script via WSL to SSH server

SSH_HOST="faiz@192.168.1.101"
SSH_PASS="123"
PROJECT_DIR="~/New-Warungin"

# Install sshpass if missing (assuming running as root in WSL for installation)
if ! command -v sshpass &> /dev/null; then
    echo "Installing sshpass..."
    apt-get update && apt-get install -y sshpass
fi

echo "🔐 Connecting to server ($SSH_HOST)..."
sshpass -p "$SSH_PASS" ssh -o StrictHostKeyChecking=no "$SSH_HOST" << 'ENDSSH'
# Ensure we are in the project directory
if [ -d "$HOME/New-Warungin" ]; then
    cd "$HOME/New-Warungin"
elif [ -d "$HOME/Warungin" ]; then
    cd "$HOME/Warungin"
else
    echo "❌ Project directory not found. Contents of $HOME:"
    ls -F "$HOME"
    exit 1
fi

echo "📂 Current directory: $(pwd)"

echo "📥 Pulling latest changes from git..."
git pull origin main

echo "🗄️ Running database migrations..."
# Using dry-run protection or simple deploy
docker compose exec -T backend npx prisma migrate deploy

echo "🔨 Rebuilding backend..."
docker compose build backend

echo "🚀 Restarting updated services..."
docker compose up -d backend nginx

echo "✅ Backend Deployment completed!"
echo "   Checking status..."
docker compose ps
ENDSSH

