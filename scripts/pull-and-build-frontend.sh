#!/bin/bash

# Script untuk pull code terbaru dan rebuild frontend container
# Usage: ./scripts/pull-and-build-frontend.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Pull dan Build Frontend${NC}\n"

# Step 1: Navigate to project directory
echo -e "${YELLOW}📁 Step 1: Navigate to project directory...${NC}"
cd ~/New-Warungin || {
    echo -e "${RED}❌ Directory ~/New-Warungin not found${NC}"
    exit 1
}
echo -e "${GREEN}✅ In project directory${NC}\n"

# Step 2: Pull latest code
echo -e "${YELLOW}📥 Step 2: Pulling latest code from GitHub...${NC}"
git pull origin main || {
    echo -e "${RED}❌ Failed to pull from git${NC}"
    exit 1
}
echo -e "${GREEN}✅ Code pulled successfully${NC}\n"

# Step 3: Rebuild frontend container
echo -e "${YELLOW}🔨 Step 3: Rebuilding frontend container...${NC}"
docker compose build frontend || {
    echo -e "${RED}❌ Failed to build frontend${NC}"
    exit 1
}
echo -e "${GREEN}✅ Frontend container built${NC}\n"

# Step 4: Restart frontend container
echo -e "${YELLOW}🔄 Step 4: Restarting frontend container...${NC}"
docker compose up -d frontend || {
    echo -e "${RED}❌ Failed to start frontend${NC}"
    exit 1
}
echo -e "${GREEN}✅ Frontend container restarted${NC}\n"

# Step 5: Check status
echo -e "${YELLOW}📊 Step 5: Checking container status...${NC}"
sleep 3
docker compose ps frontend

# Step 6: Show recent logs
echo -e "\n${YELLOW}📋 Step 6: Recent frontend logs (last 20 lines)...${NC}"
docker compose logs --tail=20 frontend

echo -e "\n${GREEN}✅ Frontend rebuild completed!${NC}"
echo -e "${BLUE}💡 Tips:${NC}"
echo -e "   - View logs: ${YELLOW}docker compose logs -f frontend${NC}"
echo -e "   - Check status: ${YELLOW}docker compose ps frontend${NC}"
echo -e "   - Restart: ${YELLOW}docker compose restart frontend${NC}"
