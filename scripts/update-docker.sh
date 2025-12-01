#!/bin/bash

# Script untuk update Docker setelah pull dari Git
# Usage: ./scripts/update-docker.sh [--no-rebuild] [--skip-migration]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Flags
NO_REBUILD=false
SKIP_MIGRATION=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --no-rebuild)
      NO_REBUILD=true
      shift
      ;;
    --skip-migration)
      SKIP_MIGRATION=true
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Usage: $0 [--no-rebuild] [--skip-migration]"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Docker Update Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Check if git is clean
echo -e "${YELLOW}📋 Step 1: Checking Git status...${NC}"
if ! git diff-index --quiet HEAD --; then
  echo -e "${YELLOW}⚠️  Warning: You have uncommitted changes${NC}"
  read -p "Continue anyway? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Aborted.${NC}"
    exit 1
  fi
fi

# Step 2: Pull from Git
echo -e "${YELLOW}🔄 Step 2: Pulling latest changes from Git...${NC}"
if git pull origin main; then
  echo -e "${GREEN}✅ Git pull successful${NC}"
else
  echo -e "${RED}❌ Git pull failed${NC}"
  exit 1
fi
echo ""

# Step 3: Stop containers
echo -e "${YELLOW}🛑 Step 3: Stopping containers...${NC}"
docker compose down
echo -e "${GREEN}✅ Containers stopped${NC}"
echo ""

# Step 4: Rebuild (if not skipped)
if [ "$NO_REBUILD" = false ]; then
  echo -e "${YELLOW}🔨 Step 4: Rebuilding containers...${NC}"
  docker compose build --no-cache
  echo -e "${GREEN}✅ Containers rebuilt${NC}"
else
  echo -e "${YELLOW}⏭️  Step 4: Skipping rebuild (--no-rebuild flag)${NC}"
fi
echo ""

# Step 5: Run migrations (if not skipped)
if [ "$SKIP_MIGRATION" = false ]; then
  echo -e "${YELLOW}🗄️  Step 5: Running database migrations...${NC}"
  if docker compose run --rm backend npm run prisma:migrate:safe; then
    echo -e "${GREEN}✅ Migrations completed${NC}"
  else
    echo -e "${YELLOW}⚠️  Migration failed or no migrations to run${NC}"
  fi
else
  echo -e "${YELLOW}⏭️  Step 5: Skipping migrations (--skip-migration flag)${NC}"
fi
echo ""

# Step 6: Start containers
echo -e "${YELLOW}🚀 Step 6: Starting containers...${NC}"
docker compose up -d
echo -e "${GREEN}✅ Containers started${NC}"
echo ""

# Step 7: Wait for services
echo -e "${YELLOW}⏳ Step 7: Waiting for services to be healthy...${NC}"
sleep 10
echo ""

# Step 8: Check status
echo -e "${YELLOW}📊 Step 8: Checking services status...${NC}"
docker compose ps
echo ""

# Step 9: Show recent logs
echo -e "${YELLOW}📋 Step 9: Recent logs (last 20 lines)...${NC}"
docker compose logs --tail=20
echo ""

# Step 10: Health check
echo -e "${YELLOW}🏥 Step 10: Health check...${NC}"
HEALTHY=$(docker compose ps --format json | jq -r '.[] | select(.Health == "healthy") | .Name' 2>/dev/null || echo "")
UNHEALTHY=$(docker compose ps --format json | jq -r '.[] | select(.Health == "unhealthy") | .Name' 2>/dev/null || echo "")

if [ -n "$HEALTHY" ]; then
  echo -e "${GREEN}✅ Healthy services:${NC}"
  echo "$HEALTHY" | while read -r service; do
    echo -e "  ${GREEN}✓${NC} $service"
  done
fi

if [ -n "$UNHEALTHY" ]; then
  echo -e "${RED}❌ Unhealthy services:${NC}"
  echo "$UNHEALTHY" | while read -r service; do
    echo -e "  ${RED}✗${NC} $service"
  done
  echo -e "${YELLOW}⚠️  Please check logs: docker compose logs <service-name>${NC}"
fi
echo ""

# Final message
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✨ Update complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Useful commands:"
echo -e "  ${BLUE}docker compose logs -f${NC}          # Follow logs"
echo -e "  ${BLUE}docker compose ps${NC}               # Check status"
echo -e "  ${BLUE}docker compose restart <service>${NC} # Restart service"
echo ""

