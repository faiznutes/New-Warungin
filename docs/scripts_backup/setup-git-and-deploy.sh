#!/bin/bash
# Script lengkap: Setup git repository dan deploy
# Usage: Jalankan di SSH server langsung

REMOTE_PATH="/root/New-Warungin"
GIT_REPO="https://github.com/faiznutes/New-Warungin.git"
GIT_BRANCH="main"

echo "=========================================="
echo "🔧 Setup Git Repository & Deploy"
echo "=========================================="
echo ""

# Step 1: Backup .env jika ada
if [ -f "$REMOTE_PATH/.env" ]; then
    echo "💾 Backup .env file..."
    cp "$REMOTE_PATH/.env" /root/.env.backup
    echo "✅ .env backed up to /root/.env.backup"
fi

# Step 2: Setup git repository
if [ -d "$REMOTE_PATH" ]; then
    echo "📁 Directory $REMOTE_PATH sudah ada"
    cd "$REMOTE_PATH"
    
    if [ -d ".git" ]; then
        echo "✅ Git repository sudah ada"
        echo "📥 Pulling latest changes..."
        git fetch origin
        git pull origin $GIT_BRANCH || {
            echo "⚠️  Pull failed, trying to reset..."
            git fetch origin
            git reset --hard origin/$GIT_BRANCH
        }
    else
        echo "⚠️  Directory ada tapi belum git repository"
        echo "🔧 Initializing git repository..."
        
        # Backup semua file penting
        if [ -f ".env" ]; then
            cp .env /root/.env.backup
        fi
        
        # Remove all files except .env
        find . -maxdepth 1 ! -name '.env' ! -name '.' ! -name '..' -exec rm -rf {} + 2>/dev/null || true
        
        # Initialize git
        git init
        git remote add origin "$GIT_REPO"
        git fetch origin
        git checkout -b $GIT_BRANCH
        git branch --set-upstream-to=origin/$GIT_BRANCH $GIT_BRANCH
        git reset --hard origin/$GIT_BRANCH
        
        echo "✅ Git repository initialized"
    fi
else
    echo "📁 Directory tidak ada, cloning repository..."
    cd /root
    
    # Clone repository
    git clone "$GIT_REPO" New-Warungin
    cd "$REMOTE_PATH"
    git checkout $GIT_BRANCH
    
    echo "✅ Repository cloned"
fi

# Step 3: Restore .env
if [ -f "/root/.env.backup" ]; then
    echo "✅ Restore .env file..."
    cp /root/.env.backup "$REMOTE_PATH/.env"
    echo "✅ .env restored"
fi

# Step 4: Verify git
cd "$REMOTE_PATH"
echo ""
echo "📊 Git Status:"
git status --short | head -10 || echo "No changes"

echo ""
echo "📝 Current branch:"
git branch --show-current

echo ""
echo "🔗 Remote URL:"
git remote -v

echo ""
echo "=========================================="
echo "✅ Git Setup Complete!"
echo "=========================================="
echo ""

# Step 5: Deploy Docker
echo "🛑 Stopping containers..."
cd "$REMOTE_PATH"
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
