#!/bin/bash
# Script untuk setup git repository di SSH server
# Usage: ssh root@192.168.1.101 "bash -s" < scripts/setup-git-on-server.sh

REMOTE_PATH="/root/New-Warungin"
GIT_REPO="https://github.com/faiznutes/New-Warungin.git"
GIT_BRANCH="main"

echo "=========================================="
echo "🔧 Setup Git Repository di Server"
echo "=========================================="
echo ""

# Check if directory exists
if [ -d "$REMOTE_PATH" ]; then
    echo "📁 Directory $REMOTE_PATH sudah ada"
    cd "$REMOTE_PATH"
    
    # Check if it's already a git repo
    if [ -d ".git" ]; then
        echo "✅ Git repository sudah ada"
        echo "📥 Fetching latest changes..."
        git fetch origin
        git pull origin $GIT_BRANCH
    else
        echo "⚠️  Directory ada tapi belum git repository"
        echo "🔧 Initializing git repository..."
        
        # Backup .env if exists
        if [ -f ".env" ]; then
            echo "💾 Backup .env file..."
            cp .env .env.backup
        fi
        
        # Initialize git
        git init
        git remote add origin "$GIT_REPO"
        git fetch origin
        git checkout -b $GIT_BRANCH
        git branch --set-upstream-to=origin/$GIT_BRANCH $GIT_BRANCH
        git pull origin $GIT_BRANCH --allow-unrelated-histories || git pull origin $GIT_BRANCH
        
        # Restore .env if backed up
        if [ -f ".env.backup" ]; then
            echo "✅ Restore .env file..."
            cp .env.backup .env
        fi
        
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

echo ""
echo "📊 Git Status:"
git status --short | head -10

echo ""
echo "📝 Current branch:"
git branch --show-current

echo ""
echo "=========================================="
echo "✅ Git Setup Complete!"
echo "=========================================="
