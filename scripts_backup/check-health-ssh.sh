#!/bin/bash

# Script untuk cek health status via SSH
# Usage: ./scripts/check-health-ssh.sh

SSH_HOST="192.168.1.101"
SSH_USER="faiz"
SSH_PASS="123"
PROJECT_DIR="/root/New-Warungin"

echo "🏥 Checking health status on SSH server..."
echo ""

# Function to run command on remote server
run_remote() {
    sshpass -p "$SSH_PASS" ssh -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" "echo '$SSH_PASS' | su - root -c \"$1\""
}

# Check container status
echo "📊 Container Status:"
run_remote "cd $PROJECT_DIR && docker compose ps --format 'table {{.Name}}\t{{.Status}}\t{{.Health}}'"
echo ""

# Check health endpoints
echo "🔍 Checking health endpoints..."
echo ""

# Backend health
echo "Backend Health:"
run_remote "cd $PROJECT_DIR && docker compose exec -T backend wget --quiet --tries=1 --spider http://localhost:3000/health && echo '✅ Backend is healthy' || echo '❌ Backend is unhealthy'"
echo ""

# Frontend health
echo "Frontend Health:"
run_remote "cd $PROJECT_DIR && docker compose exec -T frontend wget --quiet --tries=1 --spider http://localhost:80 && echo '✅ Frontend is healthy' || echo '❌ Frontend is unhealthy'"
echo ""

# Database health
echo "Database Health:"
run_remote "cd $PROJECT_DIR && docker compose exec -T postgres pg_isready -U postgres && echo '✅ Database is healthy' || echo '❌ Database is unhealthy'"
echo ""

# Nginx health
echo "Nginx Health:"
run_remote "cd $PROJECT_DIR && docker compose exec -T nginx wget --quiet --tries=1 --spider http://localhost:80 && echo '✅ Nginx is healthy' || echo '❌ Nginx is unhealthy'"
echo ""

echo "✅ Health check completed!"

