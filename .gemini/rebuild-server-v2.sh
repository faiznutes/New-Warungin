#!/bin/bash
set -e
cd /root/New-Warungin

echo "=== Step 0: Pulling latest code ==="
git reset --hard
git pull origin main

echo "=== Step 1: Stopping containers & cleaning volumes ==="
docker compose down
# Force remove containers to release volume locks
docker rm -f warungin-postgres warungin-backend warungin-frontend warungin-nginx warungin-redis warungin-loki warungin-promtail warungin-cloudflared || true
# Remove volumes explicitly
docker volume rm new-warungin_postgres_data new-warungin_redis_data || true
docker volume prune -f

echo "=== Step 2: Rebuilding images (update migrations) ==="
# We assume frontend is fine, but backend crucial for migration update
docker compose build --no-cache backend

echo "=== Step 3: Starting services (with profiles) ==="
docker compose --profile with-redis --profile cloudflare up -d

echo "=== Step 4: Waiting for DB (30s) ==="
sleep 30

echo "=== Step 5: Deploying Migrations ==="
# Gunakan migrate deploy, bukan reset, karena volume sudah fresh
docker compose exec -T backend npx prisma migrate deploy

echo "=== Step 6: Creating Super Admin & Demo Data ==="
# Use the script we copied to /tmp/create-super-admin.js
if [ -f /tmp/create-super-admin.js ]; then
    cat /tmp/create-super-admin.js | docker compose exec -T backend node -
else
    echo "WARNING: /tmp/create-super-admin.js not found. Skipping user creation."
fi

echo "=== Done! ==="
docker ps
