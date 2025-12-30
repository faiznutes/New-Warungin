#!/bin/bash
# Script untuk fix error 502 backend yang restart terus
# Usage: bash scripts/fix-backend-502.sh

set -e

echo "=========================================="
echo "🔧 Fix Backend 502 Error - Diagnostic & Fix"
echo "=========================================="
echo ""

cd /root/New-Warungin || cd /home/warungin/New-Warungin || {
    echo "❌ Project directory not found. Please cd to project directory first."
    exit 1
}

echo "📋 [1/8] Checking Docker status..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not installed!"
    exit 1
fi

docker ps > /dev/null 2>&1 || {
    echo "❌ Docker daemon not running!"
    echo "   Starting Docker..."
    systemctl start docker || service docker start
    sleep 5
}

echo "✅ Docker is running"
echo ""

echo "📊 [2/8] Checking container status..."
docker compose ps
echo ""

echo "📝 [3/8] Checking backend logs (last 50 lines)..."
echo "----------------------------------------"
docker compose logs backend --tail 50
echo "----------------------------------------"
echo ""

echo "🔍 [4/8] Checking for errors in backend logs..."
ERRORS=$(docker compose logs backend --tail 200 2>&1 | grep -i "error\|fatal\|cannot\|failed" | head -20)
if [ -n "$ERRORS" ]; then
    echo "⚠️  Found errors:"
    echo "$ERRORS"
else
    echo "✅ No critical errors found in recent logs"
fi
echo ""

echo "💾 [5/8] Checking database connection..."
DB_CONNECT=$(docker compose exec -T postgres psql -U postgres -d warungin -c "SELECT 1;" 2>&1)
if echo "$DB_CONNECT" | grep -q "1 row"; then
    echo "✅ Database is accessible"
else
    echo "❌ Database connection issue:"
    echo "$DB_CONNECT"
    echo ""
    echo "🔄 Restarting postgres..."
    docker compose restart postgres
    sleep 10
fi
echo ""

echo "🌐 [6/8] Checking backend health endpoint..."
HEALTH=$(docker compose exec -T backend wget -q -O- http://localhost:3000/health 2>&1 || docker compose exec -T backend curl -s http://localhost:3000/health 2>&1)
if echo "$HEALTH" | grep -q "ok\|status"; then
    echo "✅ Backend health check OK"
    echo "Response: $HEALTH"
else
    echo "❌ Backend health check failed"
    echo "Response: $HEALTH"
    echo ""
    echo "🔍 Checking if backend process is running..."
    docker compose exec -T backend ps aux | grep -E "node|npm" || echo "   ⚠️  No Node.js process found"
fi
echo ""

echo "🔧 [7/8] Checking .env file..."
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    # Check critical variables
    if grep -q "DATABASE_URL=" .env && grep -q "JWT_SECRET=" .env; then
        echo "✅ Critical environment variables present"
    else
        echo "⚠️  Some critical environment variables missing"
    fi
else
    echo "❌ .env file not found!"
    echo "   This is critical - backend needs .env file"
fi
echo ""

echo "🚀 [8/8] Attempting to fix..."
echo ""

# Stop all containers
echo "1️⃣  Stopping containers..."
docker compose down
sleep 5

# Remove backend container if exists
echo "2️⃣  Removing old backend container..."
docker rm -f warungin-backend 2>/dev/null || true

# Check and fix .env
if [ ! -f ".env" ]; then
    echo "⚠️  .env file missing - cannot start backend"
    echo "   Please create .env file with required variables"
    exit 1
fi

# Rebuild backend
echo "3️⃣  Rebuilding backend image..."
docker compose build --no-cache backend || {
    echo "❌ Backend build failed!"
    echo "   Checking build logs..."
    docker compose build backend 2>&1 | tail -50
    exit 1
}

# Start postgres first
echo "4️⃣  Starting postgres..."
docker compose up -d postgres
sleep 10

# Wait for postgres to be ready
echo "5️⃣  Waiting for postgres to be ready..."
RETRIES=30
until docker compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
    RETRIES=$((RETRIES-1))
    if [ $RETRIES -eq 0 ]; then
        echo "❌ Postgres not ready after 30 attempts"
        exit 1
    fi
    echo "   Waiting for postgres... ($RETRIES attempts left)"
    sleep 2
done
echo "✅ Postgres is ready"

# Start backend
echo "6️⃣  Starting backend..."
docker compose up -d backend
sleep 15

# Check backend status
echo "7️⃣  Checking backend status..."
sleep 5
for i in {1..10}; do
    if docker compose exec -T backend wget -q -O- http://localhost:3000/health > /dev/null 2>&1; then
        echo "✅ Backend is healthy!"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "❌ Backend health check failed after 10 attempts"
        echo ""
        echo "📋 Last 30 lines of backend logs:"
        docker compose logs backend --tail 30
        echo ""
        echo "🔍 Checking for specific errors:"
        docker compose logs backend --tail 100 | grep -i "error\|fatal\|cannot\|failed" | tail -10
        exit 1
    fi
    echo "   Waiting for backend to be ready... ($i/10)"
    sleep 3
done

# Start other services
echo "8️⃣  Starting other services..."
docker compose up -d
sleep 5

echo ""
echo "=========================================="
echo "✅ Fix completed!"
echo "=========================================="
echo ""
echo "📊 Final status:"
docker compose ps
echo ""
echo "🔍 Backend health:"
docker compose exec -T backend wget -q -O- http://localhost:3000/health 2>&1 || echo "⚠️  Health check failed"
echo ""
echo "📝 Last 10 lines of backend logs:"
docker compose logs backend --tail 10
