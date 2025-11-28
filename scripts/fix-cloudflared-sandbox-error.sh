#!/bin/bash

# Script untuk fix cloudflared network sandbox error
# Usage: bash scripts/fix-cloudflared-sandbox-error.sh

echo "=========================================="
echo "🔧 Fix Cloudflared Network Sandbox Error"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Force Stop Cloudflared
echo -e "${BLUE}1. Force Stopping Cloudflared...${NC}"
docker compose --profile cloudflare stop cloudflared 2>/dev/null || true
docker compose --profile cloudflare rm -f cloudflared 2>/dev/null || true
docker stop warungin-cloudflared 2>/dev/null || true
docker kill warungin-cloudflared 2>/dev/null || true
docker rm -f warungin-cloudflared 2>/dev/null || true
sleep 5
echo -e "${GREEN}✅ Cloudflared force stopped${NC}"
echo ""

# 2. Clean Up Network State
echo -e "${BLUE}2. Cleaning Up Network State...${NC}"
# Remove any orphaned network connections
NETWORK_NAME=$(docker network ls | grep warungin-network | awk '{print $2}' | head -1)
if [ -n "$NETWORK_NAME" ]; then
    echo "   Network: $NETWORK_NAME"
    # Try to disconnect if exists (will fail if not connected, that's OK)
    docker network disconnect "$NETWORK_NAME" warungin-cloudflared 2>/dev/null || true
fi
sleep 2
echo -e "${GREEN}✅ Network state cleaned${NC}"
echo ""

# 3. Verify Nginx is Ready
echo -e "${BLUE}3. Verifying Nginx is Ready...${NC}"
NGINX_STATUS=$(docker compose ps nginx 2>/dev/null | grep -c "Up" || echo "0")
NGINX_HEALTHY=$(docker compose ps nginx 2>/dev/null | grep -c "healthy" || echo "0")

if [ "$NGINX_STATUS" -eq "0" ]; then
    echo -e "${YELLOW}⚠️  Nginx tidak running, starting...${NC}"
    docker compose up -d nginx
    sleep 15
elif [ "$NGINX_HEALTHY" -eq "0" ]; then
    echo -e "${YELLOW}⚠️  Nginx belum healthy, waiting...${NC}"
    sleep 10
fi

NGINX_HEALTHY=$(docker compose ps nginx 2>/dev/null | grep -c "healthy" || echo "0")
if [ "$NGINX_HEALTHY" -gt "0" ]; then
    echo -e "${GREEN}✅ Nginx ready and healthy${NC}"
else
    echo -e "${RED}❌ Nginx belum healthy${NC}"
    echo "   Check: docker compose logs nginx"
fi
echo ""

# 4. Check Network
echo -e "${BLUE}4. Checking Docker Network...${NC}"
if [ -z "$NETWORK_NAME" ]; then
    NETWORK_NAME=$(docker network ls | grep warungin-network | awk '{print $2}' | head -1)
fi

if [ -z "$NETWORK_NAME" ]; then
    echo -e "${RED}❌ Network tidak ditemukan, creating...${NC}"
    docker compose up -d postgres 2>/dev/null || true
    sleep 5
    NETWORK_NAME=$(docker network ls | grep warungin-network | awk '{print $2}' | head -1)
fi

if [ -n "$NETWORK_NAME" ]; then
    echo -e "${GREEN}✅ Network: $NETWORK_NAME${NC}"
    
    # List containers in network
    echo "   Containers in network:"
    docker network inspect "$NETWORK_NAME" 2>/dev/null | grep -o "warungin-[a-z]*" | sort -u || echo "   (none)"
else
    echo -e "${RED}❌ Masih tidak bisa menemukan network${NC}"
    exit 1
fi
echo ""

# 5. Pull Latest Image
echo -e "${BLUE}5. Pulling Latest Cloudflared Image...${NC}"
docker pull cloudflare/cloudflared:latest
echo -e "${GREEN}✅ Image updated${NC}"
echo ""

# 6. Recreate Cloudflared with Clean State
echo -e "${BLUE}6. Recreating Cloudflared with Clean State...${NC}"
# Remove any existing container first
docker rm -f warungin-cloudflared 2>/dev/null || true
sleep 2

# Create with docker compose
docker compose --profile cloudflare up -d cloudflared
sleep 5
echo -e "${GREEN}✅ Cloudflared recreated${NC}"
echo ""

# 7. Verify Cloudflared in Network
echo -e "${BLUE}7. Verifying Cloudflared in Network...${NC}"
sleep 5
CLOUDFLARED_IN_NETWORK=$(docker network inspect "$NETWORK_NAME" 2>/dev/null | grep -c "warungin-cloudflared" || echo "0")

if [ "$CLOUDFLARED_IN_NETWORK" -gt "0" ]; then
    echo -e "${GREEN}✅ Cloudflared di network${NC}"
else
    echo -e "${YELLOW}⚠️  Cloudflared belum di network, trying manual connect...${NC}"
    # Wait a bit more for container to stabilize
    sleep 5
    
    # Check if container is running (not restarting)
    CLOUDFLARED_STATUS=$(docker ps | grep warungin-cloudflared | grep -c "Up" || echo "0")
    RESTARTING=$(docker ps | grep warungin-cloudflared | grep -c "Restarting" || echo "0")
    
    if [ "$RESTARTING" -eq "0" ] && [ "$CLOUDFLARED_STATUS" -gt "0" ]; then
        echo "   Container is running, connecting to network..."
        docker network connect "$NETWORK_NAME" warungin-cloudflared 2>/dev/null && \
            echo -e "${GREEN}✅ Connected manually${NC}" || \
            echo -e "${RED}❌ Manual connect failed${NC}"
    else
        echo -e "${RED}❌ Container masih restarting, tidak bisa connect${NC}"
        echo "   Check logs untuk error: docker compose logs cloudflared"
    fi
fi
echo ""

# 8. Check Status
echo -e "${BLUE}8. Checking Cloudflared Status...${NC}"
sleep 5
CLOUDFLARED_STATUS=$(docker compose ps cloudflared 2>/dev/null | grep -c "Up" || echo "0")
RESTARTING=$(docker compose ps cloudflared 2>/dev/null | grep -c "Restarting" || echo "0")

if [ "$RESTARTING" -gt "0" ]; then
    echo -e "${RED}❌ Cloudflared masih restarting${NC}"
    echo ""
    echo "Recent logs:"
    docker compose logs cloudflared 2>/dev/null | tail -20
elif [ "$CLOUDFLARED_STATUS" -gt "0" ]; then
    echo -e "${GREEN}✅ Cloudflared running!${NC}"
else
    echo -e "${RED}❌ Cloudflared tidak running${NC}"
fi
echo ""

# 9. Test Connectivity
echo -e "${BLUE}9. Testing Connectivity...${NC}"
if [ "$RESTARTING" -eq "0" ] && [ "$CLOUDFLARED_STATUS" -gt "0" ]; then
    echo "   Testing from cloudflared to nginx..."
    if docker compose exec -T cloudflared wget -q -O- http://nginx:80 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Cloudflared bisa reach nginx!${NC}"
    else
        echo -e "${YELLOW}⚠️  Cloudflared belum bisa reach nginx${NC}"
        echo "   Mungkin masih starting, tunggu beberapa detik"
    fi
else
    echo -e "${YELLOW}⚠️  Skip test (container restarting atau tidak running)${NC}"
fi
echo ""

# 10. Final Summary
echo "=========================================="
echo "📋 Summary"
echo "=========================================="
echo ""
docker compose ps cloudflared
echo ""

if [ "$RESTARTING" -gt "0" ]; then
    echo -e "${RED}❌ Cloudflared masih restarting${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check logs: docker compose logs cloudflared | tail -50"
    echo "2. Verify token: grep CLOUDFLARE_TUNNEL_TOKEN .env"
    echo "3. Check Service URL di Dashboard = http://nginx:80"
    echo "4. Try regenerate token di Cloudflare Dashboard"
else
    if [ "$CLOUDFLARED_STATUS" -gt "0" ]; then
        echo -e "${GREEN}✅ Cloudflared sepertinya sudah running!${NC}"
        echo ""
        echo "Verifikasi:"
        echo "1. Check logs: docker compose logs -f cloudflared"
        echo "2. Test tunnel: docker compose exec cloudflared cloudflared tunnel info"
        echo "3. Check Dashboard: https://one.dash.cloudflare.com/"
    fi
fi
echo ""

