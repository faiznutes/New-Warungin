#!/bin/bash

# Simple pull and compose script for Warungin POS System
# Usage: ./scripts/pull-and-compose.sh [environment]
# Example: ./scripts/pull-and-compose.sh production

set -e

ENV=${1:-production}
COMPOSE_FILE="docker-compose.yml"

echo "🚀 Warungin POS - Pull and Compose Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Pull latest code
echo -e "${YELLOW}📥 Step 1: Pulling latest code from git...${NC}"
git pull origin main || {
    echo -e "${RED}❌ Failed to pull from git${NC}"
    exit 1
}
echo -e "${GREEN}✅ Code pulled successfully${NC}"
echo ""

# Step 2: Check if .env exists
echo -e "${YELLOW}🔍 Step 2: Checking environment files...${NC}"
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from env.example...${NC}"
    if [ -f env.example ]; then
        cp env.example .env
        echo -e "${YELLOW}⚠️  Please update .env file with your configuration${NC}"
        exit 1
    else
        echo -e "${RED}❌ env.example not found${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✅ Environment file found${NC}"
echo ""

# Step 3: Install dependencies
echo -e "${YELLOW}📦 Step 3: Installing backend dependencies...${NC}"
npm install || {
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
}
echo -e "${GREEN}✅ Backend dependencies installed${NC}"
echo ""

echo -e "${YELLOW}📦 Step 4: Installing frontend dependencies...${NC}"
cd client
npm install || {
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
}
cd ..
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
echo ""

# Step 4: Generate Prisma Client
echo -e "${YELLOW}🗄️  Step 5: Generating Prisma client...${NC}"
npm run prisma:generate || {
    echo -e "${RED}❌ Failed to generate Prisma client${NC}"
    exit 1
}
echo -e "${GREEN}✅ Prisma client generated${NC}"
echo ""

# Step 5: Validate Prisma schema
echo -e "${YELLOW}✅ Step 6: Validating Prisma schema...${NC}"
npx prisma validate || {
    echo -e "${RED}❌ Prisma schema validation failed${NC}"
    exit 1
}
echo -e "${GREEN}✅ Prisma schema valid${NC}"
echo ""

# Step 6: Build Docker images
echo -e "${YELLOW}🐳 Step 7: Building Docker images...${NC}"
docker compose build || {
    echo -e "${RED}❌ Failed to build Docker images${NC}"
    exit 1
}
echo -e "${GREEN}✅ Docker images built${NC}"
echo ""

# Step 7: Run database migrations
echo -e "${YELLOW}🗄️  Step 8: Running database migrations...${NC}"
docker compose run --rm backend npm run prisma:migrate || {
    echo -e "${YELLOW}⚠️  Migrations may have failed or already applied. Continuing...${NC}"
}
echo -e "${GREEN}✅ Migrations completed${NC}"
echo ""

# Step 8: Start services
echo -e "${YELLOW}🚀 Step 9: Starting services with Docker Compose...${NC}"
docker compose up -d || {
    echo -e "${RED}❌ Failed to start services${NC}"
    exit 1
}
echo -e "${GREEN}✅ Services started${NC}"
echo ""

# Step 9: Show service status
echo -e "${YELLOW}📊 Step 10: Checking service status...${NC}"
sleep 5
docker compose ps
echo ""

# Step 10: Show logs
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${YELLOW}📋 Service URLs:${NC}"
echo "  - Frontend: http://localhost:80 (or your configured port)"
echo "  - Backend API: http://localhost:3000/api"
echo ""
echo -e "${YELLOW}📝 Useful commands:${NC}"
echo "  - View logs: docker compose logs -f"
echo "  - Stop services: docker compose down"
echo "  - Restart services: docker compose restart"
echo "  - View status: docker compose ps"
echo ""
echo -e "${GREEN}🎉 All done!${NC}"
