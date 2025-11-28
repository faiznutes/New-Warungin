#!/bin/bash

# Final fix script untuk cloudflared yang restarting dan tidak di network
# Usage: bash scripts/fix-cloudflared-final.sh

echo "=========================================="
echo "🔧 Final Cloudflared Fix"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Force Stop Everything
echo -e "${BLUE}1. Force Stopping Cloudflared...${NC}"
docker compose --profile cloudflare stop cloudflared 2>/dev/null || true
docker compose --profile cloudflare rm -f cloudflared 2>/dev/null || true
docker stop warungin-cloudflared 2>/dev/null || true
docker kill warungin-cloudflared 2>/dev/null || true
docker rm -f warungin-cloudflared 2>/dev/null || true
sleep 5
echo -e "${GREEN}✅ Stopped${NC}"
echo ""

# 2. Check Logs for Error
echo -e "${BLUE}2. Checking Previous Logs for Errors...${NC}"
echo "-----------------------------------"
PREV_LOGS=$(docker logs warungin-cloudflared 2>&1 | tail -30 2>/dev/null || echo "No previous logs")
echo "$PREV_LOGS"
echo ""

# 3. Verify Nginx
echo -e "${BLUE}3. Verifying Nginx...${NC}"
NGINX_HEALTHY=$(docker compose ps nginx 2>/dev/null | grep -c "healthy" || echo "0")
if [ "$NGINX_HEALTHY" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Nginx belum healthy, waiting...${NC}"
    sleep 15
fi
NGINX_HEALTHY=$(docker compose ps nginx 2>/dev/null | grep -c "healthy" || echo "0")
if [ "$NGINX_HEALTHY" -gt 0 ]; then
    echo -e "${GREEN}✅ Nginx healthy${NC}"
else
    echo -e "${RED}❌ Nginx tidak healthy${NC}"
    exit 1
fi
echo ""

# 4. Get Network Name
echo -e "${BLUE}4. Getting Network Name...${NC}"
NETWORK_NAME=$(docker network ls | grep warungin-network | awk '{print $2}' | head -1)
if [ -z "$NETWORK_NAME" ]; then
    echo -e "${RED}❌ Network tidak ditemukan${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Network: $NETWORK_NAME${NC}"
echo ""

# 5. Check Token
echo -e "${BLUE}5. Checking Token...${NC}"
TOKEN=$(grep "^CLOUDFLARE_TUNNEL_TOKEN=" .env 2>/dev/null | cut -d '=' -f2- | tr -d ' ' || echo "")
if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Token tidak ditemukan${NC}"
    exit 1
fi
TOKEN_LENGTH=${#TOKEN}
if [ "$TOKEN_LENGTH" -lt 50 ]; then
    echo -e "${RED}❌ Token terlalu pendek${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Token OK (${TOKEN_LENGTH} chars)${NC}"
echo ""

# 6. Create Cloudflared with Explicit Network
echo -e "${BLUE}6. Creating Cloudflared with Explicit Network...${NC}"
docker run -d \
  --name warungin-cloudflared \
  --restart unless-stopped \
  --network "$NETWORK_NAME" \
  -e TUNNEL_TOKEN="$TOKEN" \
  cloudflare/cloudflared:latest \
  tunnel --no-autoupdate run --retries 5

sleep 10
echo -e "${GREEN}✅ Created${NC}"
echo ""

# 7. Verify in Network
echo -e "${BLUE}7. Verifying in Network...${NC}"
CLOUDFLARED_IN_NETWORK=$(docker network inspect "$NETWORK_NAME" 2>/dev/null | grep -c "warungin-cloudflared" || echo "0")
if [ "$CLOUDFLARED_IN_NETWORK" -gt 0 ]; then
    echo -e "${GREEN}✅ Cloudflared di network${NC}"
else
    echo -e "${RED}❌ Cloudflared tidak di network${NC}"
    docker network connect "$NETWORK_NAME" warungin-cloudflared 2>/dev/null || true
    sleep 3
    CLOUDFLARED_IN_NETWORK=$(docker network inspect "$NETWORK_NAME" 2>/dev/null | grep -c "warungin-cloudflared" || echo "0")
    if [ "$CLOUDFLARED_IN_NETWORK" -gt 0 ]; then
        echo -e "${GREEN}✅ Connected manually${NC}"
    fi
fi
echo ""

# 8. Check Status
echo -e "${BLUE}8. Checking Status...${NC}"
sleep 10
RESTARTING=$(docker ps | grep warungin-cloudflared | grep -c "Restarting" || echo "0")
RUNNING=$(docker ps | grep warungin-cloudflared | grep -c "Up" || echo "0")

if [ "$RESTARTING" -gt 0 ]; then
    echo -e "${RED}❌ Masih restarting${NC}"
    echo ""
    echo "Recent logs:"
    docker logs warungin-cloudflared 2>&1 | tail -20
elif [ "$RUNNING" -gt 0 ]; then
    echo -e "${GREEN}✅ Running!${NC}"
else
    echo -e "${RED}❌ Tidak running${NC}"
fi
echo ""

# 9. Test Connectivity
if [ "$RESTARTING" -eq 0 ] && [ "$RUNNING" -gt 0 ]; then
    echo -e "${BLUE}9. Testing Connectivity...${NC}"
    if docker exec warungin-cloudflared wget -q -O- http://nginx:80 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Can reach nginx!${NC}"
    else
        echo -e "${YELLOW}⚠️  Cannot reach nginx yet${NC}"
    fi
    echo ""
fi

# 10. Summary
echo "=========================================="
echo "📋 Summary"
echo "=========================================="
docker ps | grep warungin-cloudflared
echo ""

if [ "$RESTARTING" -gt 0 ]; then
    echo -e "${RED}❌ Masih restarting - check logs untuk error${NC}"
    echo "   docker logs warungin-cloudflared"
else
    if [ "$RUNNING" -gt 0 ]; then
        echo -e "${GREEN}✅ Cloudflared running!${NC}"
        echo "   Check logs: docker logs -f warungin-cloudflared"
    fi
fi
echo ""

