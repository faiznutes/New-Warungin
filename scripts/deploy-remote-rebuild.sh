#!/bin/bash
# Script untuk dijalankan di server VPS
# Pull latest code, rebuild Docker, dan restart containers
# Usage: bash deploy-remote-rebuild.sh

set -e

PROJECT_DIR="/home/warungin/Warungin"

echo "=========================================="
echo "🚀 Deploy dengan Rebuild Docker"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo "⚠️  Running as root - switching to warungin user"
   su - warungin -c "cd $PROJECT_DIR && bash -c '$(cat <<'\''EOF'\''
cd /home/warungin/Warungin
echo "📂 Current directory: $(pwd)"
echo "Current user: $(whoami)"
echo ""

# Step 1: Pull latest changes
echo "📥 [1/4] Pulling latest changes from Git..."
git fetch origin
git pull origin main || {
    echo "⚠️  Git pull failed, continuing..."
}
echo "✅ Git pull completed"
echo ""

# Step 2: Stop containers
echo "🛑 [2/4] Stopping containers..."
docker compose down || docker-compose down
echo "✅ Containers stopped"
echo ""

# Step 3: Rebuild images
echo "🔨 [3/4] Rebuilding Docker images..."
echo "This may take several minutes..."
docker compose build --no-cache || {
    echo "⚠️  Build dengan --no-cache failed, trying without..."
    docker compose build || {
        echo "❌ Build failed"
        exit 1
    }
}
echo "✅ Docker images rebuilt"
echo ""

# Step 4: Start containers
echo "🚀 [4/4] Starting containers..."
docker compose up -d
echo "✅ Containers started"
echo ""

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 15

# Check status
echo ""
echo "📊 Container Status:"
docker compose ps

echo ""
echo "✅ Deploy completed!"
echo ""
echo "📝 Check logs if needed:"
echo "   docker compose logs -f"
EOF
)'"
   exit 0
fi

# If not root, run directly
cd "$PROJECT_DIR" || {
    echo "❌ Project directory tidak ditemukan: $PROJECT_DIR"
    exit 1
}

echo "📂 Current directory: $(pwd)"
echo "Current user: $(whoami)"
echo ""

# Step 1: Pull latest changes
echo "📥 [1/4] Pulling latest changes from Git..."
git fetch origin
git pull origin main || {
    echo "⚠️  Git pull failed, continuing..."
}
echo "✅ Git pull completed"
echo ""

# Step 2: Stop containers
echo "🛑 [2/4] Stopping containers..."
docker compose down || docker-compose down
echo "✅ Containers stopped"
echo ""

# Step 3: Rebuild images
echo "🔨 [3/4] Rebuilding Docker images..."
echo "This may take several minutes..."
docker compose build --no-cache || {
    echo "⚠️  Build dengan --no-cache failed, trying without..."
    docker compose build || {
        echo "❌ Build failed"
        exit 1
    }
}
echo "✅ Docker images rebuilt"
echo ""

# Step 4: Start containers
echo "🚀 [4/4] Starting containers..."
docker compose up -d
echo "✅ Containers started"
echo ""

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 15

# Check status
echo ""
echo "📊 Container Status:"
docker compose ps

echo ""
echo "✅ Deploy completed!"
echo ""
echo "📝 Check logs if needed:"
echo "   docker compose logs -f"
