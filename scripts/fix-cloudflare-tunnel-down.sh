#!/bin/bash

# Script untuk fix Cloudflare Tunnel yang down meskipun token sudah benar
# Usage: bash scripts/fix-cloudflare-tunnel-down.sh

echo "=========================================="
echo "🔧 Fix Cloudflare Tunnel Down"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Check Cloudflared Container
echo -e "${BLUE}1. Checking Cloudflared Container...${NC}"
CLOUDFLARED_RUNNING=$(docker compose ps cloudflared 2>/dev/null | grep -c "Up" || echo "0")
if [ "$CLOUDFLARED_RUNNING" -eq "0" ]; then
    echo -e "${RED}❌ Cloudflared tidak running${NC}"
    echo "   Starting cloudflared..."
    docker compose --profile cloudflare up -d cloudflared
    sleep 5
else
    echo -e "${GREEN}✅ Cloudflared running${NC}"
fi
echo ""

# 2. Check Recent Logs
echo -e "${BLUE}2. Recent Cloudflared Logs (last 30 lines)...${NC}"
echo "-----------------------------------"
docker compose logs cloudflared 2>/dev/null | tail -30
echo ""

# 3. Check Token in Container
echo -e "${BLUE}3. Checking Token in Container...${NC}"
TOKEN_IN_CONTAINER=$(docker compose exec -T cloudflared env 2>/dev/null | grep TUNNEL_TOKEN | cut -d '=' -f2 || echo "")
if [ -z "$TOKEN_IN_CONTAINER" ]; then
    echo -e "${RED}❌ Token tidak ada di container${NC}"
    echo "   Restarting cloudflared..."
    docker compose --profile cloudflare restart cloudflared
    sleep 5
else
    TOKEN_LENGTH=${#TOKEN_IN_CONTAINER}
    echo -e "${GREEN}✅ Token ada di container (${TOKEN_LENGTH} karakter)${NC}"
fi
echo ""

# 4. Test Tunnel Info
echo -e "${BLUE}4. Testing Tunnel Connection...${NC}"
TUNNEL_INFO=$(docker compose exec -T cloudflared cloudflared tunnel info 2>&1)
if echo "$TUNNEL_INFO" | grep -q "error\|Error\|failed\|Failed"; then
    echo -e "${RED}❌ Tunnel info error:${NC}"
    echo "$TUNNEL_INFO" | head -10
    echo ""
    echo -e "${YELLOW}⚠️  Kemungkinan token invalid atau expired${NC}"
    echo "   Solusi: Regenerate token di Cloudflare Dashboard"
else
    echo -e "${GREEN}✅ Tunnel info OK:${NC}"
    echo "$TUNNEL_INFO" | head -10
fi
echo ""

# 5. Check Internet Connectivity
echo -e "${BLUE}5. Testing Internet Connectivity...${NC}"
if docker compose exec -T cloudflared ping -c 2 1.1.1.1 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Internet connectivity OK${NC}"
else
    echo -e "${RED}❌ Internet connectivity FAILED${NC}"
    echo "   Cloudflared tidak bisa connect ke internet"
fi
echo ""

# 6. Check Nginx Connectivity
echo -e "${BLUE}6. Testing Nginx Connectivity from Cloudflared...${NC}"
if docker compose exec -T cloudflared wget -q -O- http://nginx:80 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Cloudflared bisa reach nginx${NC}"
else
    echo -e "${RED}❌ Cloudflared TIDAK bisa reach nginx${NC}"
    echo "   Ini bisa menyebabkan Error 1033"
    echo ""
    echo "   Checking nginx status..."
    NGINX_STATUS=$(docker compose ps nginx 2>/dev/null | grep -c "Up" || echo "0")
    if [ "$NGINX_STATUS" -eq "0" ]; then
        echo -e "${RED}   ❌ Nginx tidak running${NC}"
        echo "   Starting nginx..."
        docker compose up -d nginx
        sleep 10
    else
        echo -e "${GREEN}   ✅ Nginx running${NC}"
    fi
fi
echo ""

# 7. Check Network
echo -e "${BLUE}7. Checking Docker Network...${NC}"
NETWORK_NAME=$(docker network ls | grep warungin-network | awk '{print $2}' | head -1)
if [ -z "$NETWORK_NAME" ]; then
    echo -e "${RED}❌ Network warungin-network tidak ditemukan${NC}"
    echo "   Recreating network..."
    docker compose down
    docker compose up -d
    sleep 10
else
    echo -e "${GREEN}✅ Network ditemukan: ${NETWORK_NAME}${NC}"
    
    # Check if containers are in network
    NGINX_IN_NETWORK=$(docker network inspect "$NETWORK_NAME" 2>/dev/null | grep -c "warungin-nginx" || echo "0")
    CLOUDFLARED_IN_NETWORK=$(docker network inspect "$NETWORK_NAME" 2>/dev/null | grep -c "warungin-cloudflared" || echo "0")
    
    if [ "$NGINX_IN_NETWORK" -eq "0" ]; then
        echo -e "${YELLOW}⚠️  Nginx tidak di network${NC}"
    else
        echo -e "${GREEN}✅ Nginx di network${NC}"
    fi
    
    if [ "$CLOUDFLARED_IN_NETWORK" -eq "0" ]; then
        echo -e "${YELLOW}⚠️  Cloudflared tidak di network${NC}"
        echo "   Recreating cloudflared..."
        docker compose --profile cloudflare down cloudflared
        docker compose --profile cloudflare up -d cloudflared
        sleep 5
    else
        echo -e "${GREEN}✅ Cloudflared di network${NC}"
    fi
fi
echo ""

# 8. Restart Cloudflared
echo -e "${BLUE}8. Restarting Cloudflared with Clean State...${NC}"
echo "-----------------------------------"
docker compose --profile cloudflare stop cloudflared
sleep 2
docker compose --profile cloudflare rm -f cloudflared 2>/dev/null || true
sleep 2
docker compose --profile cloudflare up -d cloudflared
echo -e "${GREEN}✅ Cloudflared restarted${NC}"
echo ""

# 9. Wait and Check Status
echo -e "${BLUE}9. Waiting for Cloudflared to Connect...${NC}"
echo "   (This may take 10-30 seconds)"
sleep 15

echo ""
echo -e "${BLUE}10. Final Status Check...${NC}"
echo "-----------------------------------"
docker compose ps cloudflared
echo ""

echo -e "${BLUE}11. Recent Logs (check for 'Connection established' or 'Tunnel is up')...${NC}"
echo "-----------------------------------"
docker compose logs cloudflared 2>/dev/null | tail -20
echo ""

# 12. Summary
echo "=========================================="
echo "📋 Summary & Next Steps"
echo "=========================================="
echo ""

# Check if tunnel is up
RECENT_LOGS=$(docker compose logs cloudflared 2>/dev/null | tail -10)
if echo "$RECENT_LOGS" | grep -qi "connection established\|tunnel is up\|connected"; then
    echo -e "${GREEN}✅ Tunnel sepertinya sudah connect!${NC}"
    echo ""
    echo "Verifikasi di Cloudflare Dashboard:"
    echo "1. Buka: https://one.dash.cloudflare.com/"
    echo "2. Zero Trust > Networks > Tunnels"
    echo "3. Check status tunnel (harus 'Connected' atau 'Active')"
    echo ""
    echo "Jika masih down, check:"
    echo "- Service URL di Dashboard harus: http://nginx:80"
    echo "- Public Hostname sudah configured"
else
    echo -e "${YELLOW}⚠️  Tunnel mungkin masih down${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Check logs: docker compose logs -f cloudflared"
    echo "2. Verify token di .env: grep CLOUDFLARE_TUNNEL_TOKEN .env"
    echo "3. Check Cloudflare Dashboard:"
    echo "   - Zero Trust > Networks > Tunnels"
    echo "   - Pastikan Public Hostname configured"
    echo "   - Service URL = http://nginx:80"
    echo "4. Jika masih down, regenerate token di Dashboard"
fi
echo ""

