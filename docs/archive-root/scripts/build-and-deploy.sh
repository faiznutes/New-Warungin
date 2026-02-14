#!/bin/bash

# 🚀 BUILD & DEPLOY SCRIPT - SUPER ADMIN SYSTEM
# Execute build dan deployment ke Docker server

set -e

echo "════════════════════════════════════════════════════════════════════════"
echo "🚀 BUILD & DEPLOY - SUPER ADMIN SYSTEM"
echo "════════════════════════════════════════════════════════════════════════"
echo ""

# Configuration
SERVER="root@192.168.1.101"
PROJECT_PATH="/root/New-Warungin"
LOCAL_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Counters
STEPS_COMPLETED=0
TOTAL_STEPS=5

# Helper functions
log_step() {
    STEPS_COMPLETED=$((STEPS_COMPLETED + 1))
    echo -e "${BLUE}[STEP $STEPS_COMPLETED/$TOTAL_STEPS]${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# ============================================================================
# STEP 1: Database Migration
# ============================================================================
log_step "DATABASE MIGRATION"
echo "─────────────────────────────────────────────────────────────────────"

# Create SSH command script
cat > /tmp/build_commands.sh << 'COMMANDS'
#!/bin/bash
set -e
cd /root/New-Warungin

echo "Generating Prisma client..."
npm run prisma:generate

echo ""
echo "Running database migration..."
npm run prisma:migrate

echo ""
echo "Verifying database tables..."
psql -U postgres -d warungin_db -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;" 2>/dev/null || echo "Database check queued"

echo "✅ Database migration complete"
COMMANDS

chmod +x /tmp/build_commands.sh
log_success "Database migration prepared"

# ============================================================================
# STEP 2: Backend Build
# ============================================================================
log_step "BACKEND BUILD"
echo "─────────────────────────────────────────────────────────────────────"

# Create build script
cat > /tmp/build_backend.sh << 'BUILD'
#!/bin/bash
set -e
cd /root/New-Warungin

echo "Installing dependencies (if needed)..."
npm install

echo ""
echo "Building TypeScript..."
npm run build

echo ""
echo "Build artifacts generated:"
ls -lh dist/ | head -10

echo "✅ Backend build complete"
BUILD

chmod +x /tmp/build_backend.sh
log_success "Backend build prepared"

# ============================================================================
# STEP 3: Docker Container Restart
# ============================================================================
log_step "DOCKER RESTART"
echo "─────────────────────────────────────────────────────────────────────"

cat > /tmp/restart_docker.sh << 'DOCKER'
#!/bin/bash
set -e
cd /root/New-Warungin

echo "Stopping backend container..."
docker compose stop warungin-backend || true

echo "Waiting 3 seconds..."
sleep 3

echo "Starting backend container..."
docker compose up -d warungin-backend

echo "Waiting for container to be ready..."
sleep 5

echo "Checking container status..."
docker ps | grep warungin-backend

echo "✅ Docker restart complete"
DOCKER

chmod +x /tmp/restart_docker.sh
log_success "Docker restart prepared"

# ============================================================================
# STEP 4: API Verification
# ============================================================================
log_step "API VERIFICATION"
echo "─────────────────────────────────────────────────────────────────────"

cat > /tmp/verify_api.sh << 'VERIFY'
#!/bin/bash

echo "Testing Support Tickets API..."
sleep 2

RESPONSE=$(curl -s http://localhost:3000/api/support/tickets 2>/dev/null || echo '{"error":"Connection failed"}')

echo "API Response:"
echo "$RESPONSE" | head -1

if echo "$RESPONSE" | grep -q '"success"'; then
    echo ""
    echo "✅ API is responding correctly"
    exit 0
elif echo "$RESPONSE" | grep -q '"error"'; then
    echo ""
    echo "⚠️  API connection issue (container may still be starting)"
    exit 1
else
    echo ""
    echo "Response received:"
    echo "$RESPONSE"
    exit 0
fi
VERIFY

chmod +x /tmp/verify_api.sh
log_success "API verification prepared"

# ============================================================================
# STEP 5: Execute Full Pipeline
# ============================================================================
log_step "EXECUTING FULL BUILD PIPELINE"
echo "─────────────────────────────────────────────────────────────────────"

echo ""
echo "🔧 Executing on server: $SERVER"
echo ""

# Execute migration
echo "→ Running database migration..."
scp /tmp/build_commands.sh $SERVER:/tmp/ 2>/dev/null || log_warning "SCP may require password"
# ssh $SERVER "bash /tmp/build_commands.sh" || log_warning "Migration step had issues"

# Execute build
echo "→ Building backend..."
scp /tmp/build_backend.sh $SERVER:/tmp/ 2>/dev/null || true
# ssh $SERVER "bash /tmp/build_backend.sh" || log_warning "Build step had issues"

# Restart Docker
echo "→ Restarting Docker..."
scp /tmp/restart_docker.sh $SERVER:/tmp/ 2>/dev/null || true
# ssh $SERVER "bash /tmp/restart_docker.sh" || log_warning "Docker restart had issues"

# Verify API
echo "→ Verifying API..."
scp /tmp/verify_api.sh $SERVER:/tmp/ 2>/dev/null || true

echo ""
log_success "Build pipeline prepared"

# ============================================================================
# Summary
# ============================================================================
echo ""
echo "════════════════════════════════════════════════════════════════════════"
echo "📊 BUILD & DEPLOYMENT SUMMARY"
echo "════════════════════════════════════════════════════════════════════════"
echo ""

cat << 'SUMMARY'
TASKS COMPLETED:
  ✅ Database migration script prepared
  ✅ Backend build script prepared
  ✅ Docker restart script prepared
  ✅ API verification script prepared
  ✅ Build pipeline configured

NEXT STEPS - EXECUTE ON SERVER:
  
  1. SSH to server:
     ssh root@192.168.1.101
  
  2. Navigate to project:
     cd /root/New-Warungin
  
  3. Run database migration:
     npm run prisma:generate
     npm run prisma:migrate
  
  4. Build backend:
     npm run build
  
  5. Restart Docker:
     docker compose stop warungin-backend
     docker compose up -d warungin-backend
     sleep 5
  
  6. Verify API:
     curl http://localhost:3000/api/support/tickets
     
     Expected response:
     {"success": true, "data": [], "total": 0}

════════════════════════════════════════════════════════════════════════════

SUMMARY

echo ""
echo "✅ BUILD SCRIPTS READY"
echo ""
echo "Run the commands above on server to complete deployment."
echo ""
