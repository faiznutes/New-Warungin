#!/bin/bash

# Simple Build Test Script
# Run this on the server to test TypeScript compilation

cd ~/New-Warungin || exit 1

echo "===== TypeScript Build Test ====="
echo "Timestamp: $(date)"
echo ""

echo "Running: npm run build"
npm run build 2>&1

echo ""
echo "Build exit code: $?"
echo ""

if [ -d "dist" ]; then
  echo "✓ dist/ directory created"
  echo "  Files in dist/routes/:"
  ls -lh dist/routes/superadmin-backup.routes.js 2>/dev/null && echo "  ✓ superadmin-backup.routes.js compiled" || echo "  ✗ superadmin-backup.routes.js NOT found"
else
  echo "✗ dist/ directory NOT created - compilation failed"
fi
