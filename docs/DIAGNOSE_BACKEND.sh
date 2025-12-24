#!/bin/bash

# Backend Diagnostics Script
# Run this to diagnose why backend is not responding
# Usage: bash DIAGNOSE_BACKEND.sh

echo "==== Backend Diagnostics ===="
echo "Timestamp: $(date)"
echo ""

cd ~/New-Warungin || { echo "Failed to cd to New-Warungin"; exit 1; }

echo "[CHECK 1] Verify source file exists and has correct route order..."
if [ -f "src/routes/superadmin-backup.routes.ts" ]; then
  echo "✓ File exists"
  echo "  First 30 lines:"
  head -30 src/routes/superadmin-backup.routes.ts | grep -E "^(router\.|//)" | head -10
else
  echo "✗ ERROR: File not found!"
fi

echo ""
echo "[CHECK 2] Docker container status..."
echo "123" | sudo -S docker compose ps --format "table {{.Names}}\t{{.Status}}" | head -15

echo ""
echo "[CHECK 3] Backend container logs (last 50 lines)..."
echo "123" | sudo -S docker compose logs backend --tail=50 2>&1 | tail -50

echo ""
echo "[CHECK 4] Check if backend port is open..."
echo "123" | sudo -S docker compose exec backend  grep -r "PORT" /app/dist/src/ 2>/dev/null | head -3 || echo "Could not check compiled code"

echo ""
echo "[CHECK 5] Test health endpoint..."
if curl -s http://localhost:3000/health > /tmp/health.json 2>&1; then
  echo "✓ Health endpoint responds:"
  cat /tmp/health.json | jq . || cat /tmp/health.json
else
  echo "✗ Health endpoint not responding"
fi

echo ""
echo "[CHECK 6] Test via nginx proxy..."
if curl -s http://localhost/api/superadmin/backups -H "Authorization: Bearer test" 2>&1 | head -20; then
  echo "✓ API endpoint accessible via nginx"
else
  echo "✗ API endpoint not accessible via nginx"
fi

echo ""
echo "[CHECK 7] Inspect compiled routes file..."
if echo "123" | sudo -S docker compose exec backend test -f /app/dist/routes/superadmin-backup.routes.js; then
  echo "✓ Compiled routes file exists"
  echo "  Checking for /critical route..."
  echo "123" | sudo -S docker compose exec backend grep -n "critical" /app/dist/routes/superadmin-backup.routes.js | head -5 || echo "  Pattern not found"
else
  echo "✗ Compiled routes file missing"
fi

echo ""
echo "[CHECK 8] Backend container info..."
echo "123" | sudo -S docker inspect warungin-backend --format="State: {{json .State}}" | jq .

echo ""
echo "==== End of Diagnostics ===="
