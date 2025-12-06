#!/bin/bash

# Script untuk fix dan update server secara otomatis
# Usage: ./scripts/fix-and-update-server.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Fix dan Update Server Otomatis${NC}\n"

# Step 1: Check current directory
echo -e "${YELLOW}📁 Step 1: Checking current directory...${NC}"
if [ ! -f ~/New-Warungin/docker-compose.yml ]; then
    echo -e "${RED}❌ docker-compose.yml not found in ~/New-Warungin${NC}"
    echo "Creating directory if needed..."
    mkdir -p ~/New-Warungin
    cd ~/New-Warungin
else
    cd ~/New-Warungin
    echo -e "${GREEN}✅ Found docker-compose.yml${NC}"
fi
echo ""

# Step 2: Check disk space
echo -e "${YELLOW}💾 Step 2: Checking disk space...${NC}"
df -h | head -3
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    echo -e "${RED}⚠️  Disk usage is ${DISK_USAGE}% - running cleanup...${NC}"
    docker system prune -f || true
    docker image prune -a -f || true
    docker volume prune -f || true
    docker builder prune -a -f || true
    echo -e "${GREEN}✅ Cleanup completed${NC}"
else
    echo -e "${GREEN}✅ Disk usage: ${DISK_USAGE}%${NC}"
fi
echo ""

# Step 3: Check for containers from wrong project
echo -e "${YELLOW}🔍 Step 3: Checking for containers from wrong project...${NC}"
WRONG_PROJECT=$(docker compose ls 2>/dev/null | grep -i debian13 || true)
if [ ! -z "$WRONG_PROJECT" ]; then
    echo -e "${YELLOW}⚠️  Found containers from project 'debian13'${NC}"
    echo "Stopping containers from wrong project..."
    
    # Try to stop from debian13 project
    if [ -d /home/faiz/Debian13 ]; then
        cd /home/faiz/Debian13 2>/dev/null && docker compose down 2>/dev/null || true
    fi
    
    # Stop containers manually if needed
    docker stop warungin-backend warungin-frontend warungin-nginx warungin-postgres warungin-redis warungin-cloudflared 2>/dev/null || true
    docker rm warungin-backend warungin-frontend warungin-nginx warungin-postgres warungin-redis warungin-cloudflared 2>/dev/null || true
    
    echo -e "${GREEN}✅ Stopped containers from wrong project${NC}"
else
    echo -e "${GREEN}✅ No wrong project containers found${NC}"
fi
echo ""

# Step 4: Pull latest code
echo -e "${YELLOW}📥 Step 4: Pulling latest code from GitHub...${NC}"
cd ~/New-Warungin
git pull origin main || {
    echo -e "${YELLOW}⚠️  Git pull failed or no changes${NC}"
}
echo -e "${GREEN}✅ Code updated${NC}"
echo ""

# Step 5: Stop existing containers from New-Warungin
echo -e "${YELLOW}🛑 Step 5: Stopping existing containers...${NC}"
cd ~/New-Warungin
docker compose down 2>/dev/null || true
echo -e "${GREEN}✅ Containers stopped${NC}"
echo ""

# Step 6: Cleanup old images and build cache
echo -e "${YELLOW}🧹 Step 6: Cleaning up old images and cache...${NC}"
docker image prune -f || true
docker builder prune -f || true
echo -e "${GREEN}✅ Cleanup completed${NC}"
echo ""

# Step 7: Build containers
echo -e "${YELLOW}🔨 Step 7: Building containers...${NC}"
cd ~/New-Warungin
docker compose build --no-cache backend frontend || {
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
}
echo -e "${GREEN}✅ Build completed${NC}"
echo ""

# Step 8: Start containers
echo -e "${YELLOW}🚀 Step 8: Starting containers...${NC}"
cd ~/New-Warungin
docker compose up -d || {
    echo -e "${RED}❌ Failed to start containers${NC}"
    exit 1
}
echo -e "${GREEN}✅ Containers started${NC}"
echo ""

# Step 9: Wait for services to be healthy
echo -e "${YELLOW}⏳ Step 9: Waiting for services to be healthy...${NC}"
sleep 10
echo ""

# Step 10: Check status
echo -e "${YELLOW}📊 Step 10: Checking container status...${NC}"
docker compose ps
echo ""

# Step 11: Show logs (last 20 lines)
echo -e "${YELLOW}📋 Step 11: Recent logs...${NC}"
docker compose logs --tail=20
echo ""

# Step 12: Verify
echo -e "${YELLOW}✅ Step 12: Verification...${NC}"
cd ~/New-Warungin
docker compose ls
echo ""

echo -e "${GREEN}✅ Fix dan update completed!${NC}"
echo -e "${BLUE}💡 Tips:${NC}"
echo -e "   - Check logs: ${YELLOW}docker compose logs -f${NC}"
echo -e "   - Check status: ${YELLOW}docker compose ps${NC}"
echo -e "   - Restart service: ${YELLOW}docker compose restart <service>${NC}"
