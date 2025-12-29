#!/bin/bash
set -e

cd /root/New-Warungin

echo "=== Step 0: Pulling latest code ==="
git reset --hard
git pull origin main

echo ""
echo "=== Step 1: Stopping containers ==="
docker compose down -v

echo ""
echo "=== Step 2: Building images (no cache) ==="
docker compose build --no-cache backend frontend

echo ""
echo "=== Step 3: Starting all services ==="
docker compose up -d

echo ""
echo "=== Step 4: Waiting for services to be ready ==="
sleep 20

echo ""
echo "=== Step 5: Running database migrations ==="
docker compose exec -T backend npx prisma migrate deploy

echo ""
echo "=== Step 6: Seeding database with super admin ==="
docker compose exec -T backend npm run seed

echo ""
echo "=== Step 7: Final container status ==="
docker compose ps

echo ""
echo "=== ✅ Rebuild complete! ==="
