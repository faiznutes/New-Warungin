#!/bin/bash

# Script untuk check error cloudflared yang restarting
# Usage: bash scripts/check-cloudflared-error.sh

echo "=========================================="
echo "🔍 Checking Cloudflared Error"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Check Status
echo -e "${BLUE}1. Cloudflared Status...${NC}"
docker compose ps cloudflared
echo ""

# 2. Check Recent Logs
echo -e "${BLUE}2. Recent Logs (last 50 lines)...${NC}"
echo "-----------------------------------"
docker compose logs cloudflared 2>/dev/null | tail -50
echo ""

# 3. Check Logs from Container Directly
echo -e "${BLUE}3. Direct Container Logs...${NC}"
echo "-----------------------------------"
docker logs warungin-cloudflared 2>&1 | tail -30
echo ""

# 4. Check Token
echo -e "${BLUE}4. Checking Tunnel Token...${NC}"
TOKEN=$(grep CLOUDFLARE_TUNNEL_TOKEN .env 2>/dev/null | cut -d '=' -f2 | tr -d ' ' || echo "")
if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ CLOUDFLARE_TUNNEL_TOKEN tidak ditemukan di .env${NC}"
else
    TOKEN_LENGTH=${#TOKEN}
    echo -e "${GREEN}✅ Token ditemukan (${TOKEN_LENGTH} karakter)${NC}"
    echo "   First 20 chars: ${TOKEN:0:20}..."
fi
echo ""

# 5. Check Environment in Container
echo -e "${BLUE}5. Checking Environment Variables in Container...${NC}"
# Try to get env from container (may fail if restarting)
docker inspect warungin-cloudflared 2>/dev/null | grep -A 5 "TUNNEL_TOKEN" || echo "Cannot inspect container (may be restarting)"
echo ""

# 6. Check Network
echo -e "${BLUE}6. Checking Network Connectivity...${NC}"
NETWORK_NAME=$(docker network ls | grep warungin-network | awk '{print $2}' | head -1)
if [ -z "$NETWORK_NAME" ]; then
    echo -e "${RED}❌ Network warungin-network tidak ditemukan${NC}"
else
    echo -e "${GREEN}✅ Network ditemukan: ${NETWORK_NAME}${NC}"
    
    # Check if cloudflared in network
    CLOUDFLARED_IN_NETWORK=$(docker network inspect "$NETWORK_NAME" 2>/dev/null | grep -c "warungin-cloudflared" || echo "0")
    if [ "$CLOUDFLARED_IN_NETWORK" -gt "0" ]; then
        echo -e "${GREEN}✅ Cloudflared di network${NC}"
    else
        echo -e "${RED}❌ Cloudflared TIDAK di network${NC}"
    fi
fi
echo ""

# 7. Check Nginx Connectivity
echo -e "${BLUE}7. Testing Nginx from Host...${NC}"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:80 | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ Nginx accessible dari host${NC}"
else
    echo -e "${RED}❌ Nginx tidak accessible dari host${NC}"
fi
echo ""

# 8. Common Error Patterns
echo -e "${BLUE}8. Common Error Patterns in Logs...${NC}"
echo "-----------------------------------"
LOGS=$(docker compose logs cloudflared 2>/dev/null | tail -50)

if echo "$LOGS" | grep -qi "token.*invalid\|invalid.*token"; then
    echo -e "${RED}❌ ERROR: Token invalid${NC}"
    echo "   Solusi: Regenerate token di Cloudflare Dashboard"
fi

if echo "$LOGS" | grep -qi "connection.*refused\|refused.*connection"; then
    echo -e "${RED}❌ ERROR: Connection refused${NC}"
    echo "   Solusi: Check nginx status dan network connectivity"
fi

if echo "$LOGS" | grep -qi "unable.*reach\|reach.*origin"; then
    echo -e "${RED}❌ ERROR: Unable to reach origin${NC}"
    echo "   Solusi: Check nginx dan service URL di Dashboard"
fi

if echo "$LOGS" | grep -qi "network.*not.*found\|network.*error"; then
    echo -e "${RED}❌ ERROR: Network error${NC}"
    echo "   Solusi: Recreate network dan restart cloudflared"
fi

if echo "$LOGS" | grep -qi "permission.*denied\|permission.*error"; then
    echo -e "${RED}❌ ERROR: Permission denied${NC}"
    echo "   Solusi: Check file permissions dan Docker access"
fi

if [ -z "$(echo "$LOGS" | grep -i "error\|failed\|refused")" ]; then
    echo -e "${YELLOW}⚠️  Tidak ada error pattern yang jelas${NC}"
    echo "   Check logs di atas untuk detail"
fi
echo ""

# 9. Recommendations
echo "=========================================="
echo "📋 Recommendations"
echo "=========================================="
echo ""

# Check if token exists
if [ -z "$TOKEN" ]; then
    echo -e "${RED}1. ACTION REQUIRED: Set tunnel token${NC}"
    echo "   nano .env"
    echo "   Add: CLOUDFLARE_TUNNEL_TOKEN=your_token"
    echo ""
fi

# Check if nginx is accessible
NGINX_ACCESSIBLE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:80 || echo "000")
if [ "$NGINX_ACCESSIBLE" != "200" ] && [ "$NGINX_ACCESSIBLE" != "301" ] && [ "$NGINX_ACCESSIBLE" != "302" ]; then
    echo -e "${YELLOW}2. WARNING: Nginx mungkin tidak accessible${NC}"
    echo "   Check: docker compose ps nginx"
    echo ""
fi

echo "3. Try fix steps:"
echo "   bash scripts/fix-cloudflared-restarting.sh"
echo ""
echo "4. If still restarting:"
echo "   - Check logs: docker compose logs cloudflared"
echo "   - Regenerate token di Cloudflare Dashboard"
echo "   - Verify Service URL di Dashboard = http://nginx:80"
echo ""

