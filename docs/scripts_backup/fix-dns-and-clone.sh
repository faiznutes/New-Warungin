#!/bin/bash
# Script untuk fix DNS dan clone repository Root
# Usage: bash scripts/fix-dns-and-clone.sh

set -e

echo "=========================================="
echo "🔧 Fix DNS & Clone Repository Root"
echo "=========================================="
echo ""

# Step 1: Check internet connection
echo "[1/5] Checking internet connection..."
if ping -c 1 8.8.8.8 &> /dev/null; then
    echo "✅ Internet connection OK"
else
    echo "❌ No internet connection"
    echo "   Please check your network settings"
    exit 1
fi

# Step 2: Check DNS resolution
echo ""
echo "[2/5] Checking DNS resolution..."
if ping -c 1 github.com &> /dev/null; then
    echo "✅ DNS resolution OK"
else
    echo "⚠️  DNS resolution failed, fixing..."
    
    # Backup original resolv.conf
    if [ -f /etc/resolv.conf ]; then
        sudo cp /etc/resolv.conf /etc/resolv.conf.backup
    fi
    
    # Add Google DNS
    echo "Setting up Google DNS..."
    echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf > /dev/null
    echo "nameserver 8.8.4.4" | sudo tee -a /etc/resolv.conf > /dev/null
    
    # Also try Cloudflare DNS
    # echo "nameserver 1.1.1.1" | sudo tee -a /etc/resolv.conf > /dev/null
    
    echo "✅ DNS configured"
    
    # Test again
    sleep 2
    if ping -c 1 github.com &> /dev/null; then
        echo "✅ DNS resolution now working"
    else
        echo "⚠️  DNS still not working, trying alternative methods..."
    fi
fi

# Step 3: Try alternative: Use IP address directly
echo ""
echo "[3/5] Testing GitHub connectivity..."
if curl -I https://github.com --max-time 5 &> /dev/null; then
    echo "✅ GitHub is accessible"
else
    echo "⚠️  GitHub HTTPS not accessible, trying HTTP..."
    if curl -I http://github.com --max-time 5 &> /dev/null; then
        echo "✅ GitHub HTTP is accessible"
    else
        echo "❌ Cannot access GitHub"
        echo ""
        echo "Troubleshooting steps:"
        echo "1. Check if you're behind a proxy:"
        echo "   export http_proxy=http://proxy:port"
        echo "   export https_proxy=http://proxy:port"
        echo ""
        echo "2. Check firewall:"
        echo "   sudo ufw status"
        echo ""
        echo "3. Try using SSH instead of HTTPS:"
        echo "   git clone git@github.com:faiznutes/Root.git Warungin"
        exit 1
    fi
fi

# Step 4: Clone repository
echo ""
echo "[4/5] Cloning repository Root..."
GIT_REPO="https://YOUR_GITHUB_TOKEN@github.com/faiznutes/Root.git"
PROJECT_DIR="/home/warungin/Warungin"

# Create directory if not exists
if [ ! -d "$(dirname $PROJECT_DIR)" ]; then
    mkdir -p "$(dirname $PROJECT_DIR)"
fi

# Remove existing directory if exists
if [ -d "$PROJECT_DIR" ]; then
    echo "⚠️  Directory $PROJECT_DIR already exists"
    read -p "Remove and clone again? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$PROJECT_DIR"
    else
        echo "Using existing directory..."
        cd "$PROJECT_DIR"
        git remote set-url origin "$GIT_REPO"
        git pull origin main || echo "⚠️  Pull failed"
        exit 0
    fi
fi

# Clone
cd "$(dirname $PROJECT_DIR)"
git clone "$GIT_REPO" "$PROJECT_DIR" || {
    echo "❌ Clone failed, trying alternative method..."
    
    # Alternative: Clone via SSH (if SSH key is set up)
    echo "Trying SSH method..."
    GIT_REPO_SSH="git@github.com:faiznutes/Root.git"
    git clone "$GIT_REPO_SSH" "$PROJECT_DIR" || {
        echo "❌ SSH clone also failed"
        echo ""
        echo "Manual steps:"
        echo "1. Download repository as ZIP:"
        echo "   wget https://github.com/faiznutes/Root/archive/refs/heads/main.zip"
        echo "   unzip main.zip"
        echo "   mv Root-main Warungin"
        echo ""
        echo "2. Or setup SSH key first:"
        echo "   ssh-keygen -t rsa -b 4096"
        echo "   cat ~/.ssh/id_rsa.pub"
        echo "   # Add to GitHub Settings > SSH Keys"
        exit 1
    }
}

cd "$PROJECT_DIR"
git checkout main 2>/dev/null || true

echo "✅ Repository cloned successfully"
echo ""

# Step 5: Verify
echo "[5/5] Verifying repository..."
cd "$PROJECT_DIR"
if [ -f "package.json" ] && [ -f "docker-compose.yml" ]; then
    echo "✅ Repository structure verified"
    echo ""
    echo "Repository location: $PROJECT_DIR"
    echo "Files found:"
    ls -la | head -10
else
    echo "⚠️  Repository structure incomplete"
fi

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  cd $PROJECT_DIR"
echo "  bash scripts/vps-setup-root.sh"
echo ""

