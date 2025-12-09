#!/bin/bash
# Script to deploy permission fixes to SSH server
# Usage: bash scripts/deploy-permission-fixes.sh

SSH_HOST="root@192.168.1.101"
SSH_PASSWORD="123"
REMOTE_PATH="/root/New-Warungin"
LOCAL_PATH="."

echo "🚀 Starting deployment to SSH server..."

# Create temporary directory for tar file
TEMP_DIR="/tmp"
TAR_FILE="$TEMP_DIR/warungin-update.tar.gz"

echo "📦 Creating archive..."
cd "$LOCAL_PATH" || exit 1

# Create tar.gz excluding node_modules, .git, dist, build, logs
tar -czf "$TAR_FILE" \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='dist' \
    --exclude='build' \
    --exclude='*.log' \
    --exclude='.env' \
    .

if [ $? -eq 0 ]; then
    echo "✅ Archive created: $TAR_FILE"
else
    echo "❌ Failed to create archive"
    exit 1
fi

# Transfer file using SCP
echo "📤 Transferring files to server..."

# Check if sshpass is available
if command -v sshpass &> /dev/null; then
    sshpass -p "$SSH_PASSWORD" scp -o StrictHostKeyChecking=no "$TAR_FILE" "${SSH_HOST}:${TAR_FILE}"
else
    echo "⚠️  sshpass not found. Please enter password manually:"
    scp -o StrictHostKeyChecking=no "$TAR_FILE" "${SSH_HOST}:${TAR_FILE}"
fi

if [ $? -eq 0 ]; then
    echo "✅ File transferred successfully"
else
    echo "❌ Transfer failed"
    exit 1
fi

# Execute commands on remote server
echo "🔧 Extracting files and rebuilding containers..."

if command -v sshpass &> /dev/null; then
    sshpass -p "$SSH_PASSWORD" ssh -o StrictHostKeyChecking=no "$SSH_HOST" << 'ENDSSH'
cd /root/New-Warungin || mkdir -p /root/New-Warungin && cd /root/New-Warungin
tar -xzf /tmp/warungin-update.tar.gz
rm -f /tmp/warungin-update.tar.gz
echo "📦 Files extracted"
docker compose down
echo "🛑 Containers stopped"
docker compose build --no-cache
echo "🔨 Docker build completed"
docker compose up -d
echo "🚀 Containers started"
sleep 5
docker compose ps
ENDSSH
else
    echo "⚠️  sshpass not found. Please run these commands manually:"
    echo "ssh root@192.168.1.101"
    echo "cd $REMOTE_PATH"
    echo "tar -xzf /tmp/warungin-update.tar.gz"
    echo "rm -f /tmp/warungin-update.tar.gz"
    echo "docker compose down"
    echo "docker compose build --no-cache"
    echo "docker compose up -d"
fi

if [ $? -eq 0 ]; then
    echo "✅ Deployment completed successfully!"
else
    echo "⚠️  Deployment had issues. Please check manually."
    exit 1
fi

# Cleanup local tar file
rm -f "$TAR_FILE"
echo "🧹 Cleanup completed"
