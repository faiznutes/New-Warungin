#!/bin/bash

# Script untuk verify cloudflared status
# Usage: bash scripts/verify-cloudflared.sh

echo "=========================================="
echo "✅ Verifying Cloudflared Status"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Check Status
echo -e "${BLUE}1. Container Status...${NC}"
STATUS_OUTPUT=$(docker compose ps cloudflared 2>/dev/null)
echo "$STATUS_OUTPUT"
echo ""

RESTARTING=$(echo "$STATUS_OUTPUT" | grep -c "Restarting" 2>/dev/null || echo "0")
RESTARTING=${RESTARTING:-0}
RUNNING=$(echo "$STATUS_OUTPUT" | grep -c "Up" 2>/dev/null || echo "0")
RUNNING=${RUNNING:-0}

if [ "$RESTARTING" -gt 0 ]; then
    echo -e "${RED}❌ Cloudflared masih restarting${NC}"
    echo ""
    echo "Checking logs for errors..."
    docker compose logs cloudflared 2>&1 | tail -30
    exit 1
elif [ "$RUNNING" -gt 0 ]; then
    echo -e "${GREEN}✅ Cloudflared running!${NC}"
else
    echo -e "${RED}❌ Cloudflared tidak running${NC}"
    exit 1
fi
echo ""

# 2. Check Logs
echo -e "${BLUE}2. Recent Logs (last 20 lines)...${NC}"
echo "-----------------------------------"
LOGS=$(docker compose logs cloudflared 2>&1 | tail -20)
echo "$LOGS"
echo ""

# Check for success messages
if echo "$LOGS" | grep -qi "connection.*established\|tunnel.*up\|connected"; then
    echo -e "${GREEN}✅ Connection established!${NC}"
elif echo "$LOGS" | grep -qi "help\|usage\|invalid"; then
    echo -e "${RED}❌ Command error detected${NC}"
    echo "   Cloudflared menampilkan help message"
elif echo "$LOGS" | grep -qi "error\|failed\|refused"; then
    echo -e "${RED}❌ Error detected in logs${NC}"
else
    echo -e "${YELLOW}⚠️  No clear success/error message${NC}"
    echo "   Check logs manually"
fi
echo ""

# 3. Test Tunnel Info
echo -e "${BLUE}3. Testing Tunnel Connection...${NC}"
sleep 5
TUNNEL_INFO=$(docker compose exec -T cloudflared cloudflared tunnel info 2>&1 || echo "ERROR")
if echo "$TUNNEL_INFO" | grep -qi "error\|Error\|failed\|Failed\|ERROR"; then
    echo -e "${RED}❌ Tunnel info error:${NC}"
    echo "$TUNNEL_INFO" | head -10
else
    echo -e "${GREEN}✅ Tunnel info OK:${NC}"
    echo "$TUNNEL_INFO" | head -10
fi
echo ""

# 4. Check Network
echo -e "${BLUE}4. Checking Network...${NC}"
NETWORK_NAME=$(docker network ls | grep warungin-network | awk '{print $2}' | head -1)
if [ -n "$NETWORK_NAME" ]; then
    CLOUDFLARED_IN_NETWORK=$(docker network inspect "$NETWORK_NAME" 2>/dev/null | grep -c "warungin-cloudflared" || echo "0")
    if [ "$CLOUDFLARED_IN_NETWORK" -gt 0 ]; then
        echo -e "${GREEN}✅ Cloudflared di network: $NETWORK_NAME${NC}"
    else
        echo -e "${YELLOW}⚠️  Cloudflared tidak di network${NC}"
    fi
fi
echo ""

# 5. Test Connectivity to Nginx
echo -e "${BLUE}5. Testing Connectivity to Nginx...${NC}"
if docker compose exec -T cloudflared wget -q -O- http://nginx:80 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Cloudflared bisa reach nginx!${NC}"
else
    echo -e "${YELLOW}⚠️  Cloudflared belum bisa reach nginx${NC}"
    echo "   Mungkin masih starting atau network issue"
fi
echo ""

# 6. Summary
echo "=========================================="
echo "📋 Summary"
echo "=========================================="
echo ""

if [ "$RESTARTING" -eq 0 ] && [ "$RUNNING" -gt 0 ]; then
    echo -e "${GREEN}✅ Cloudflared sepertinya sudah running dengan benar!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Monitor logs: docker compose logs -f cloudflared"
    echo "2. Check Dashboard: https://one.dash.cloudflare.com/"
    echo "   Zero Trust > Networks > Tunnels"
    echo "   Status harus 'Connected' atau 'Active'"
    echo "3. Test domain: https://pos.faiznute.site"
else
    echo -e "${RED}❌ Masih ada masalah${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check logs: docker compose logs cloudflared | tail -50"
    echo "2. Verify token: grep CLOUDFLARE_TUNNEL_TOKEN .env"
    echo "3. Check Service URL di Dashboard = http://nginx:80"
fi
echo ""

