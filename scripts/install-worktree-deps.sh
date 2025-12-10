#!/bin/bash
# Script to install dependencies in Cursor worktree
# Run this script if you see TypeScript errors about missing type definitions

WORKTREE_PATH="c:/Users/Iz/.cursor/worktrees/New-Warungin/oso/client"

if [ -d "$WORKTREE_PATH" ]; then
    echo "📦 Installing dependencies in worktree..."
    cd "$WORKTREE_PATH" || exit 1
    
    echo "Installing npm packages..."
    npm install
    
    echo "Installing type definitions..."
    npm install -D @types/node
    
    echo "Installing vite..."
    npm install vite
    
    echo "✅ Dependencies installed successfully!"
    echo "Please restart TypeScript server in Cursor: Ctrl+Shift+P -> 'TypeScript: Restart TS Server'"
else
    echo "❌ Worktree path not found: $WORKTREE_PATH"
    echo "Please update the path in this script to match your worktree location."
fi

