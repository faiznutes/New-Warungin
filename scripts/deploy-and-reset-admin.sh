#!/bin/bash

# Script untuk deploy ke SSH server dan reset superadmin
# Usage: ./scripts/deploy-and-reset-admin.sh

set -e

SSH_HOST="192.168.1.101"
SSH_USER="faiz"
SSH_PASS="123"
PROJECT_DIR="/root/New-Warungin"
SUPERADMIN_PASSWORD="${SUPERADMIN_PASSWORD:-SuperAdmin123!}"

echo "🚀 Starting deployment to SSH server..."
echo ""

# Function to run command on remote server
run_remote() {
    sshpass -p "$SSH_PASS" ssh -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" "echo '$SSH_PASS' | su - root -c \"$1\""
}

# 1. Git pull di server
echo "📥 Pulling latest changes from git..."
run_remote "cd $PROJECT_DIR && git pull origin main || git pull upstream main || true"
echo "✅ Git pull completed"
echo ""

# 2. Stop containers
echo "🛑 Stopping containers..."
run_remote "cd $PROJECT_DIR && docker compose down"
echo "✅ Containers stopped"
echo ""

# 3. Rebuild containers
echo "🔨 Rebuilding containers..."
run_remote "cd $PROJECT_DIR && docker compose build --no-cache"
echo "✅ Containers rebuilt"
echo ""

# 4. Start containers
echo "▶️ Starting containers..."
run_remote "cd $PROJECT_DIR && docker compose up -d"
echo "✅ Containers started"
echo ""

# 5. Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10
run_remote "cd $PROJECT_DIR && docker compose exec -T postgres pg_isready -U postgres"
echo "✅ Database is ready"
echo ""

# 6. Run migrations
echo "🔄 Running database migrations..."
run_remote "cd $PROJECT_DIR && docker compose exec -T backend npm run prisma:migrate:safe || true"
echo "✅ Migrations completed"
echo ""

# 7. Reset superadmin
echo "🔐 Resetting superadmin password..."
run_remote "cd $PROJECT_DIR && SUPERADMIN_PASSWORD='$SUPERADMIN_PASSWORD' docker compose exec -T backend node scripts/reset-superadmin.js"
echo "✅ Superadmin reset completed"
echo ""

# 8. Check health status
echo "🏥 Checking health status..."
run_remote "cd $PROJECT_DIR && docker compose ps --format 'table {{.Name}}\t{{.Status}}'"
echo ""

# 9. Show superadmin credentials
echo "📋 Superadmin credentials:"
echo "   Email: admin@warungin.com"
echo "   Password: $SUPERADMIN_PASSWORD"
echo ""

echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Container Status:"
run_remote "cd $PROJECT_DIR && docker compose ps"

