#!/bin/bash

# Script untuk rebuild semua services: database, frontend, backend, cloudflare
# Usage: bash scripts/rebuild-all.sh

echo "=========================================="
echo "🔨 Rebuild All Services"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Confirmation
read -p "Apakah Anda yakin ingin rebuild semua services? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Rebuild dibatalkan."
    exit 1
fi

# 1. Stop All Services
echo -e "${BLUE}1. Stopping All Services...${NC}"
docker compose --profile cloudflare down
echo -e "${GREEN}✅ All services stopped${NC}"
echo ""

# 2. Remove Containers (optional, keep volumes)
echo -e "${BLUE}2. Removing Containers...${NC}"
docker compose --profile cloudflare rm -f
echo -e "${GREEN}✅ Containers removed${NC}"
echo ""

# 3. Pull Latest Code
echo -e "${BLUE}3. Pulling Latest Code...${NC}"
git pull origin main
echo -e "${GREEN}✅ Code updated${NC}"
echo ""

# 4. Rebuild Database (PostgreSQL)
echo -e "${BLUE}4. Rebuilding Database (PostgreSQL)...${NC}"
docker compose build --no-cache postgres
docker compose up -d postgres
echo "   Waiting for database to be ready..."
sleep 15

# Check database health
DB_HEALTHY=$(docker compose ps postgres 2>/dev/null | grep -c "healthy" || echo "0")
if [ "$DB_HEALTHY" -gt "0" ]; then
    echo -e "${GREEN}✅ Database healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Database belum healthy, waiting...${NC}"
    sleep 10
    docker compose ps postgres
fi
echo ""

# 5. Rebuild Backend
echo -e "${BLUE}5. Rebuilding Backend...${NC}"
docker compose build --no-cache backend
docker compose up -d backend
echo "   Waiting for backend to be ready..."
sleep 20

# Check backend health
BACKEND_HEALTHY=$(docker compose ps backend 2>/dev/null | grep -c "healthy" || echo "0")
if [ "$BACKEND_HEALTHY" -gt "0" ]; then
    echo -e "${GREEN}✅ Backend healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Backend belum healthy, waiting...${NC}"
    sleep 15
    docker compose ps backend
fi
echo ""

# 6. Rebuild Frontend
echo -e "${BLUE}6. Rebuilding Frontend...${NC}"
docker compose build --no-cache frontend
docker compose up -d frontend
echo "   Waiting for frontend to be ready..."
sleep 15
echo -e "${GREEN}✅ Frontend rebuilt${NC}"
echo ""

# 7. Rebuild Nginx
echo -e "${BLUE}7. Rebuilding Nginx...${NC}"
docker compose build --no-cache nginx 2>/dev/null || docker compose pull nginx
docker compose up -d nginx
echo "   Waiting for nginx to be ready..."
sleep 15

# Check nginx health
NGINX_HEALTHY=$(docker compose ps nginx 2>/dev/null | grep -c "healthy" || echo "0")
if [ "$NGINX_HEALTHY" -gt "0" ]; then
    echo -e "${GREEN}✅ Nginx healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx belum healthy, waiting...${NC}"
    sleep 10
    docker compose ps nginx
fi
echo ""

# 8. Rebuild Cloudflared
echo -e "${BLUE}8. Rebuilding Cloudflared...${NC}"
docker pull cloudflare/cloudflared:latest
docker compose --profile cloudflare up -d cloudflared
echo "   Waiting for cloudflared to be ready..."
sleep 10
echo -e "${GREEN}✅ Cloudflared rebuilt${NC}"
echo ""

# 9. Final Status Check
echo -e "${BLUE}9. Final Status Check...${NC}"
echo "=========================================="
docker compose --profile cloudflare ps
echo ""

# 10. Check Logs
echo -e "${BLUE}10. Recent Logs Summary...${NC}"
echo "=========================================="

echo -e "\n${YELLOW}PostgreSQL Logs (last 5 lines):${NC}"
docker compose logs postgres 2>/dev/null | tail -5

echo -e "\n${YELLOW}Backend Logs (last 5 lines):${NC}"
docker compose logs backend 2>/dev/null | tail -5

echo -e "\n${YELLOW}Frontend Logs (last 5 lines):${NC}"
docker compose logs frontend 2>/dev/null | tail -5

echo -e "\n${YELLOW}Nginx Logs (last 5 lines):${NC}"
docker compose logs nginx 2>/dev/null | tail -5

echo -e "\n${YELLOW}Cloudflared Logs (last 10 lines):${NC}"
docker compose logs cloudflared 2>/dev/null | tail -10
echo ""

# 11. Health Check Summary
echo -e "${BLUE}11. Health Check Summary...${NC}"
echo "=========================================="

# Check each service
SERVICES=("postgres" "backend" "frontend" "nginx" "cloudflared")
ALL_HEALTHY=true

for service in "${SERVICES[@]}"; do
    STATUS=$(docker compose ps "$service" 2>/dev/null | grep -c "Up" || echo "0")
    if [ "$STATUS" -gt "0" ]; then
        if [ "$service" = "postgres" ] || [ "$service" = "backend" ] || [ "$service" = "nginx" ]; then
            HEALTHY=$(docker compose ps "$service" 2>/dev/null | grep -c "healthy" || echo "0")
            if [ "$HEALTHY" -gt "0" ]; then
                echo -e "${GREEN}✅ $service: Up (healthy)${NC}"
            else
                echo -e "${YELLOW}⚠️  $service: Up (not healthy yet)${NC}"
                ALL_HEALTHY=false
            fi
        else
            echo -e "${GREEN}✅ $service: Up${NC}"
        fi
    else
        echo -e "${RED}❌ $service: Down${NC}"
        ALL_HEALTHY=false
    fi
done
echo ""

# 12. Final Summary
echo "=========================================="
echo "📋 Rebuild Summary"
echo "=========================================="
if [ "$ALL_HEALTHY" = true ]; then
    echo -e "${GREEN}✅ All services rebuilt and running!${NC}"
else
    echo -e "${YELLOW}⚠️  Some services may still be starting...${NC}"
    echo "   Wait a few minutes and check: docker compose ps"
fi
echo ""

echo "Next steps:"
echo "1. Check all services: docker compose --profile cloudflare ps"
echo "2. Monitor logs: docker compose logs -f [service_name]"
echo "3. Test application: curl http://localhost:80"
echo "4. Check Cloudflare Tunnel: docker compose logs cloudflared"
echo "5. Verify in Dashboard: https://one.dash.cloudflare.com/"
echo ""

