#!/bin/bash

# Script untuk cleanup disk space di server
# Usage: ./scripts/cleanup-disk-space.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧹 Cleanup Disk Space${NC}\n"

# Step 1: Check current disk usage
echo -e "${YELLOW}📊 Step 1: Checking disk usage...${NC}"
df -h
echo ""

# Step 2: Stop containers
echo -e "${YELLOW}🛑 Step 2: Stopping containers...${NC}"
docker compose down || true
echo -e "${GREEN}✅ Containers stopped${NC}\n"

# Step 3: Remove unused Docker images
echo -e "${YELLOW}🗑️  Step 3: Removing unused Docker images...${NC}"
docker image prune -a -f || true
echo -e "${GREEN}✅ Unused images removed${NC}\n"

# Step 4: Remove unused containers
echo -e "${YELLOW}🗑️  Step 4: Removing stopped containers...${NC}"
docker container prune -f || true
echo -e "${GREEN}✅ Stopped containers removed${NC}\n"

# Step 5: Remove unused volumes
echo -e "${YELLOW}🗑️  Step 5: Removing unused volumes...${NC}"
docker volume prune -f || true
echo -e "${GREEN}✅ Unused volumes removed${NC}\n"

# Step 6: Remove build cache
echo -e "${YELLOW}🗑️  Step 6: Removing Docker build cache...${NC}"
docker builder prune -a -f || true
echo -e "${GREEN}✅ Build cache removed${NC}\n"

# Step 7: Remove old logs
echo -e "${YELLOW}🗑️  Step 7: Cleaning old logs...${NC}"
find ~/New-Warungin/logs -name "*.log" -type f -mtime +7 -delete 2>/dev/null || true
find ~/New-Warungin/nginx/logs -name "*.log" -type f -mtime +7 -delete 2>/dev/null || true
echo -e "${GREEN}✅ Old logs cleaned${NC}\n"

# Step 8: Remove node_modules in dist (if exists)
echo -e "${YELLOW}🗑️  Step 8: Cleaning dist folders...${NC}"
rm -rf ~/New-Warungin/dist 2>/dev/null || true
rm -rf ~/New-Warungin/src/dist 2>/dev/null || true
rm -rf ~/New-Warungin/client/dist 2>/dev/null || true
echo -e "${GREEN}✅ Dist folders cleaned${NC}\n"

# Step 9: Check disk usage after cleanup
echo -e "${YELLOW}📊 Step 9: Checking disk usage after cleanup...${NC}"
df -h
echo ""

# Step 10: Show Docker disk usage
echo -e "${YELLOW}🐳 Docker disk usage:${NC}"
docker system df
echo ""

echo -e "${GREEN}✅ Disk cleanup completed!${NC}"
echo -e "${BLUE}💡 Tips:${NC}"
echo -e "   - Check disk space: ${YELLOW}df -h${NC}"
echo -e "   - Check Docker usage: ${YELLOW}docker system df${NC}"
echo -e "   - If still full, consider: ${YELLOW}docker system prune -a --volumes${NC} (WARNING: removes all unused resources)"
