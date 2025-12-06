#!/bin/bash
# Alternative: Clone via wget (download ZIP) jika git clone gagal
# Usage: bash scripts/clone-via-wget.sh

set -e

PROJECT_DIR="/home/warungin/Warungin"
GITHUB_PAT="YOUR_GITHUB_TOKENKpQBqVwr7Xk6YmdkSqHuKlumGirBTE0Oab0p"
REPO_URL="https://api.github.com/repos/faiznutes/Root/zipball/main"

echo "=========================================="
echo "📥 Download Repository Root via ZIP"
echo "=========================================="
echo ""

# Create directory
mkdir -p "$(dirname $PROJECT_DIR)"
cd "$(dirname $PROJECT_DIR)"

# Remove existing
if [ -d "$PROJECT_DIR" ]; then
    echo "Removing existing directory..."
    rm -rf "$PROJECT_DIR"
fi

# Download ZIP
echo "Downloading repository..."
curl -L -H "Authorization: token $GITHUB_PAT" "$REPO_URL" -o Root.zip || {
    echo "❌ Download failed"
    echo "Trying without auth..."
    curl -L "$REPO_URL" -o Root.zip || {
        echo "❌ Download failed"
        exit 1
    }
}

# Extract
echo "Extracting..."
unzip -q Root.zip || {
    echo "❌ Extract failed"
    exit 1
}

# Rename to Warungin
EXTRACTED_DIR=$(ls -d faiznutes-Root-* 2>/dev/null | head -1)
if [ -n "$EXTRACTED_DIR" ]; then
    mv "$EXTRACTED_DIR" "$PROJECT_DIR"
else
    echo "❌ Could not find extracted directory"
    exit 1
fi

# Cleanup
rm -f Root.zip

cd "$PROJECT_DIR"
echo "✅ Repository downloaded successfully"
echo ""
echo "Location: $PROJECT_DIR"
echo ""

