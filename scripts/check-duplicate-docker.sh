#!/bin/bash

# Script untuk cek apakah ada duplicate Docker containers berjalan
# Usage: ./scripts/check-duplicate-docker.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Checking for Duplicate Docker Containers${NC}\n"

# Step 1: List all running containers
echo -e "${YELLOW}📋 Step 1: All Running Containers${NC}"
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
echo ""

# Step 2: Check for duplicate container names
echo -e "${YELLOW}🔍 Step 2: Checking for duplicate container names...${NC}"
CONTAINERS=$(docker ps --format "{{.Names}}")
DUPLICATES=$(echo "$CONTAINERS" | sort | uniq -d)

if [ -z "$DUPLICATES" ]; then
    echo -e "${GREEN}✅ No duplicate container names found${NC}"
else
    echo -e "${RED}❌ Found duplicate container names:${NC}"
    echo "$DUPLICATES"
fi
echo ""

# Step 3: Check for multiple instances of same service
echo -e "${YELLOW}🔍 Step 3: Checking for multiple instances of same service...${NC}"
echo "Backend containers:"
docker ps --filter "name=backend" --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}" || echo "No backend containers"
echo ""

echo "Frontend containers:"
docker ps --filter "name=frontend" --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}" || echo "No frontend containers"
echo ""

echo "Database containers:"
docker ps --filter "name=postgres" --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}" || echo "No postgres containers"
echo ""

echo "Nginx containers:"
docker ps --filter "name=nginx" --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}" || echo "No nginx containers"
echo ""

# Step 4: Check Docker Compose projects
echo -e "${YELLOW}🔍 Step 4: Checking Docker Compose projects...${NC}"
docker compose ls 2>/dev/null || docker-compose ps 2>/dev/null || echo "No docker compose projects found"
echo ""

# Step 5: Check for containers using same ports
echo -e "${YELLOW}🔍 Step 5: Checking for port conflicts...${NC}"
echo "Containers using port 80:"
docker ps --filter "publish=80" --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}" || echo "No containers using port 80"
echo ""

echo "Containers using port 3000:"
docker ps --filter "publish=3000" --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}" || echo "No containers using port 3000"
echo ""

echo "Containers using port 443:"
docker ps --filter "publish=443" --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}" || echo "No containers using port 443"
echo ""

# Step 6: Check all containers (including stopped)
echo -e "${YELLOW}📋 Step 6: All Containers (including stopped)${NC}"
docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
echo ""

# Step 7: Check Docker networks
echo -e "${YELLOW}🌐 Step 7: Docker Networks${NC}"
docker network ls
echo ""

# Step 8: Summary
echo -e "${BLUE}📊 Summary:${NC}"
TOTAL_RUNNING=$(docker ps -q | wc -l)
TOTAL_STOPPED=$(docker ps -a -q | wc -l)
echo -e "   Running containers: ${GREEN}$TOTAL_RUNNING${NC}"
echo -e "   Total containers: ${YELLOW}$TOTAL_STOPPED${NC}"
echo ""

# Check for Warungin containers specifically
echo -e "${YELLOW}🔍 Warungin-specific containers:${NC}"
docker ps -a --filter "name=warungin" --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}" || echo "No warungin containers found"
echo ""

echo -e "${GREEN}✅ Check completed!${NC}"
