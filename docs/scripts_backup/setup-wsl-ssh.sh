#!/bin/bash
# Script untuk setup SSH key di WSL
# Usage: bash scripts/setup-wsl-ssh.sh

HOST="warungin@192.168.0.101"
SSH_KEY_NAME="id_rsa_warungin"
SSH_KEY_PATH="$HOME/.ssh/$SSH_KEY_NAME"

echo "=========================================="
echo "Setup SSH Key in WSL"
echo "Server: $HOST"
echo "=========================================="
echo ""

# Check if running in WSL
if [ -z "$WSL_DISTRO_NAME" ] && [ -z "$WSLENV" ]; then
    echo "⚠️  This script is designed for WSL"
    echo "If you're in Git Bash, the key might already be in Windows"
    echo ""
fi

# Check if key already exists
if [ -f "$SSH_KEY_PATH" ]; then
    echo "SSH key already exists: $SSH_KEY_PATH"
    read -p "Do you want to use existing key? (y/n): " use_existing
    if [ "$use_existing" != "y" ]; then
        echo "Generating new SSH key..."
        ssh-keygen -t rsa -b 4096 -f "$SSH_KEY_PATH" -N "" -C "warungin-vps-wsl"
    fi
else
    echo "Generating new SSH key..."
    ssh-keygen -t rsa -b 4096 -f "$SSH_KEY_PATH" -N "" -C "warungin-vps-wsl"
fi

echo ""
echo "=== Copying public key to server ==="
echo "You will be prompted for password: 123"
echo ""

# Copy key to server
cat "$SSH_KEY_PATH.pub" | ssh -o StrictHostKeyChecking=no "$HOST" "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"

echo ""
echo "=== Testing SSH connection ==="
ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no "$HOST" "echo 'SSH key authentication successful from WSL!' && hostname && whoami"

if [ $? -eq 0 ]; then
    echo ""
    echo "=== Setting up SSH config in WSL ==="
    
    # Create or update SSH config
    SSH_CONFIG="$HOME/.ssh/config"
    mkdir -p "$HOME/.ssh"
    
    if [ ! -f "$SSH_CONFIG" ]; then
        touch "$SSH_CONFIG"
        chmod 600 "$SSH_CONFIG"
    fi
    
    # Check if config already exists
    if ! grep -q "Host warungin-vps" "$SSH_CONFIG"; then
        cat >> "$SSH_CONFIG" << EOF

# Warungin VPS (WSL)
Host warungin-vps
    HostName 192.168.0.101
    User warungin
    IdentityFile $SSH_KEY_PATH
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
EOF
        echo "SSH config added to $SSH_CONFIG"
    else
        echo "SSH config already exists"
    fi
    
    echo ""
    echo "=========================================="
    echo "✅ WSL SSH Key Setup Complete!"
    echo "=========================================="
    echo ""
    echo "You can now connect without password using:"
    echo "  ssh warungin-vps"
    echo ""
else
    echo ""
    echo "❌ SSH key authentication failed!"
    echo "Please check the error above and try again."
    exit 1
fi
