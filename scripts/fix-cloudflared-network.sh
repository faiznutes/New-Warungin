#!/bin/bash

# Script untuk fix cloudflared network issue
# Usage: bash scripts/fix-cloudflared-network.sh

echo "=========================================="
echo "🔧 Fix Cloudflared Network Issue"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Stop Cloudflared
echo -e "${BLUE}1. Stopping Cloudflared...${NC}"
docker compose --profile cloudflare stop cloudflared 2>/dev/null || true
docker compose --profile cloudflare rm -f cloudflared 2>/dev/null || true
docker rm -f warungin-cloudflared 2>/dev/null || true
sleep 3
echo -e "${GREEN}✅ Cloudflared stopped${NC}"
echo ""

# 2. Check Network
echo -e "${BLUE}2. Checking Docker Network...${NC}"
NETWORK_NAME=$(docker network ls | grep warungin-network | awk '{print $2}' | head -1)
if [ -z "$NETWORK_NAME" ]; then
    echo -e "${RED}❌ Network warungin-network tidak ditemukan${NC}"
    echo "   Creating network..."
    docker compose up -d postgres 2>/dev/null || true
    sleep 5
    NETWORK_NAME=$(docker network ls | grep warungin-network | awk '{print $2}' | head -1)
fi

if [ -n "$NETWORK_NAME" ]; then
    echo -e "${GREEN}✅ Network ditemukan: ${NETWORK_NAME}${NC}"
    
    # Check containers in network
    echo "   Checking containers in network..."
    docker network inspect "$NETWORK_NAME" 2>/dev/null | grep -o "warungin-[a-z]*" | sort -u
else
    echo -e "${RED}❌ Masih tidak bisa menemukan network${NC}"
    exit 1
fi
echo ""

# 3. Verify Nginx in Network
echo -e "${BLUE}3. Verifying Nginx in Network...${NC}"
NGINX_IN_NETWORK=$(docker network inspect "$NETWORK_NAME" 2>/dev/null | grep -c "warungin-nginx" || echo "0")
if [ "$NGINX_IN_NETWORK" -gt "0" ]; then
    echo -e "${GREEN}✅ Nginx di network${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx tidak di network, restarting nginx...${NC}"
    docker compose restart nginx
    sleep 10
fi
echo ""

# 4. Check Nginx Status
echo -e "${BLUE}4. Checking Nginx Status...${NC}"
NGINX_STATUS=$(docker compose ps nginx 2>/dev/null | grep -c "Up" || echo "0")
if [ "$NGINX_STATUS" -eq "0" ]; then
    echo -e "${RED}❌ Nginx tidak running${NC}"
    echo "   Starting nginx..."
    docker compose up -d nginx
    sleep 15
else
    echo -e "${GREEN}✅ Nginx running${NC}"
fi
echo ""

# 5. Test Nginx Connectivity
echo -e "${BLUE}5. Testing Nginx Connectivity...${NC}"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:80 | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ Nginx accessible dari host${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx mungkin belum ready${NC}"
fi
echo ""

# 6. Recreate Cloudflared with Network
echo -e "${BLUE}6. Recreating Cloudflared with Correct Network...${NC}"
docker compose --profile cloudflare up -d cloudflared
sleep 5
echo -e "${GREEN}✅ Cloudflared recreated${NC}"
echo ""

# 7. Verify Cloudflared in Network
echo -e "${BLUE}7. Verifying Cloudflared in Network...${NC}"
sleep 5
CLOUDFLARED_IN_NETWORK=$(docker network inspect "$NETWORK_NAME" 2>/dev/null | grep -c "warungin-cloudflared" || echo "0")
if [ "$CLOUDFLARED_IN_NETWORK" -gt "0" ]; then
    echo -e "${GREEN}✅ Cloudflared sekarang di network${NC}"
else
    echo -e "${RED}❌ Cloudflared masih TIDAK di network${NC}"
    echo "   Trying manual network connect..."
    docker network connect "$NETWORK_NAME" warungin-cloudflared 2>/dev/null || true
    sleep 3
    CLOUDFLARED_IN_NETWORK=$(docker network inspect "$NETWORK_NAME" 2>/dev/null | grep -c "warungin-cloudflared" || echo "0")
    if [ "$CLOUDFLARED_IN_NETWORK" -gt "0" ]; then
        echo -e "${GREEN}✅ Cloudflared sekarang di network (manual connect)${NC}"
    else
        echo -e "${RED}❌ Masih gagal connect ke network${NC}"
    fi
fi
echo ""

# 8. Test Connectivity from Cloudflared to Nginx
echo -e "${BLUE}8. Testing Connectivity from Cloudflared to Nginx...${NC}"
sleep 10
CLOUDFLARED_STATUS=$(docker compose ps cloudflared 2>/dev/null | grep -c "Up" || echo "0")
RESTARTING=$(docker compose ps cloudflared 2>/dev/null | grep -c "Restarting" || echo "0")

if [ "$RESTARTING" -gt "0" ]; then
    echo -e "${RED}❌ Cloudflared masih restarting, tidak bisa test connectivity${NC}"
    echo "   Check logs: docker compose logs cloudflared"
else
    if [ "$CLOUDFLARED_STATUS" -gt "0" ]; then
        echo "   Testing wget from cloudflared to nginx..."
        if docker compose exec -T cloudflared wget -q -O- http://nginx:80 > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Cloudflared bisa reach nginx!${NC}"
        else
            echo -e "${YELLOW}⚠️  Cloudflared belum bisa reach nginx${NC}"
            echo "   Mungkin masih starting, tunggu beberapa detik"
        fi
    else
        echo -e "${RED}❌ Cloudflared tidak running${NC}"
    fi
fi
echo ""

# 9. Check Status
echo -e "${BLUE}9. Final Status Check...${NC}"
echo "=========================================="
docker compose ps cloudflared
echo ""

# 10. Check Logs
echo -e "${BLUE}10. Recent Logs (last 20 lines)...${NC}"
echo "-----------------------------------"
docker compose logs cloudflared 2>/dev/null | tail -20
echo ""

# 11. Summary
echo "=========================================="
echo "📋 Summary"
echo "=========================================="
echo ""

if [ "$RESTARTING" -gt "0" ]; then
    echo -e "${RED}❌ Cloudflared masih restarting${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Check logs: docker compose logs cloudflared | tail -50"
    echo "2. Verify token: grep CLOUDFLARE_TUNNEL_TOKEN .env"
    echo "3. Check Service URL di Dashboard = http://nginx:80"
else
    if [ "$CLOUDFLARED_STATUS" -gt "0" ]; then
        echo -e "${GREEN}✅ Cloudflared running!${NC}"
        echo ""
        echo "Verifikasi:"
        echo "1. Check status: docker compose ps cloudflared"
        echo "2. Check logs: docker compose logs -f cloudflared"
        echo "3. Test tunnel: docker compose exec cloudflared cloudflared tunnel info"
        echo "4. Check Dashboard: https://one.dash.cloudflare.com/"
    else
        echo -e "${RED}❌ Cloudflared tidak running${NC}"
        echo "   Check logs untuk error"
    fi
fi
echo ""

