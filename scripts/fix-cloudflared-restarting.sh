#!/bin/bash

# Script untuk fix Cloudflared yang terus restarting
# Usage: bash scripts/fix-cloudflared-restarting.sh

echo "=========================================="
echo "🔧 Fix Cloudflared Restarting Loop"
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
# Force remove jika masih restarting
docker rm -f warungin-cloudflared 2>/dev/null || true
sleep 3
echo -e "${GREEN}✅ Cloudflared stopped${NC}"
echo ""

# 2. Check Logs (before restart)
echo -e "${BLUE}2. Checking Previous Logs (last 50 lines)...${NC}"
echo "-----------------------------------"
docker compose logs cloudflared 2>/dev/null | tail -50 || echo "No previous logs"
echo ""

# 3. Check Token
echo -e "${BLUE}3. Checking Tunnel Token...${NC}"
TOKEN=$(grep CLOUDFLARE_TUNNEL_TOKEN .env 2>/dev/null | cut -d '=' -f2 | tr -d ' ' || echo "")
if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ CLOUDFLARE_TUNNEL_TOKEN tidak ditemukan di .env${NC}"
    echo ""
    echo "Solusi:"
    echo "1. Buka Cloudflare Dashboard: https://one.dash.cloudflare.com/"
    echo "2. Zero Trust > Networks > Tunnels"
    echo "3. Buat tunnel baru atau copy token dari tunnel existing"
    echo "4. Edit .env: nano .env"
    echo "5. Tambahkan: CLOUDFLARE_TUNNEL_TOKEN=your_token_here"
    exit 1
else
    TOKEN_LENGTH=${#TOKEN}
    if [ "$TOKEN_LENGTH" -lt 50 ]; then
        echo -e "${YELLOW}⚠️  Token terlalu pendek (${TOKEN_LENGTH} karakter)${NC}"
        echo "   Token mungkin invalid atau tidak lengkap"
        echo "   Token harus minimal 50 karakter"
    else
        echo -e "${GREEN}✅ Token ditemukan (${TOKEN_LENGTH} karakter)${NC}"
    fi
fi
echo ""

# 4. Check Nginx Status
echo -e "${BLUE}4. Checking Nginx Status...${NC}"
NGINX_STATUS=$(docker compose ps nginx 2>/dev/null | grep -c "Up" || echo "0")
if [ "$NGINX_STATUS" -eq "0" ]; then
    echo -e "${YELLOW}⚠️  Nginx tidak running${NC}"
    echo "   Starting nginx..."
    docker compose up -d nginx
    sleep 10
    NGINX_HEALTHY=$(docker compose ps nginx 2>/dev/null | grep -c "healthy" || echo "0")
    if [ "$NGINX_HEALTHY" -eq "0" ]; then
        echo -e "${YELLOW}⚠️  Nginx belum healthy, waiting...${NC}"
        sleep 10
    fi
else
    echo -e "${GREEN}✅ Nginx running${NC}"
fi
echo ""

# 5. Check Network
echo -e "${BLUE}5. Checking Docker Network...${NC}"
NETWORK_NAME=$(docker network ls | grep warungin-network | awk '{print $2}' | head -1)
if [ -z "$NETWORK_NAME" ]; then
    echo -e "${YELLOW}⚠️  Network tidak ditemukan, creating...${NC}"
    docker compose up -d postgres 2>/dev/null || true
    sleep 5
else
    echo -e "${GREEN}✅ Network ditemukan: ${NETWORK_NAME}${NC}"
fi
echo ""

# 6. Pull Latest Image
echo -e "${BLUE}6. Pulling Latest Cloudflared Image...${NC}"
docker pull cloudflare/cloudflared:latest
echo -e "${GREEN}✅ Image updated${NC}"
echo ""

# 7. Start Cloudflared
echo -e "${BLUE}7. Starting Cloudflared...${NC}"
docker compose --profile cloudflare up -d cloudflared
sleep 5
echo -e "${GREEN}✅ Cloudflared started${NC}"
echo ""

# 8. Wait and Check Status
echo -e "${BLUE}8. Waiting for Cloudflared to Start (10 seconds)...${NC}"
sleep 10

CLOUDFLARED_STATUS=$(docker compose ps cloudflared 2>/dev/null | grep -c "Up" || echo "0")
RESTARTING=$(docker compose ps cloudflared 2>/dev/null | grep -c "Restarting" || echo "0")

if [ "$RESTARTING" -gt "0" ]; then
    echo -e "${RED}❌ Cloudflared masih restarting!${NC}"
    echo ""
    echo "Checking logs for errors..."
    echo "-----------------------------------"
    docker compose logs cloudflared 2>/dev/null | tail -30
    echo ""
    echo -e "${YELLOW}Kemungkinan penyebab:${NC}"
    echo "1. Token invalid atau expired"
    echo "2. Network connectivity issue"
    echo "3. Configuration error"
    echo ""
    echo "Solusi:"
    echo "1. Check logs di atas untuk error spesifik"
    echo "2. Verify token: grep CLOUDFLARE_TUNNEL_TOKEN .env"
    echo "3. Regenerate token di Cloudflare Dashboard"
    echo "4. Check internet: docker compose exec cloudflared ping 1.1.1.1"
else
    if [ "$CLOUDFLARED_STATUS" -gt "0" ]; then
        echo -e "${GREEN}✅ Cloudflared running!${NC}"
    else
        echo -e "${RED}❌ Cloudflared tidak running${NC}"
    fi
fi
echo ""

# 9. Check Recent Logs
echo -e "${BLUE}9. Recent Logs (last 30 lines)...${NC}"
echo "-----------------------------------"
docker compose logs cloudflared 2>/dev/null | tail -30
echo ""

# 10. Test Tunnel Info
echo -e "${BLUE}10. Testing Tunnel Connection...${NC}"
sleep 5
TUNNEL_INFO=$(docker compose exec -T cloudflared cloudflared tunnel info 2>&1 || echo "ERROR")
if echo "$TUNNEL_INFO" | grep -q "error\|Error\|failed\|Failed\|ERROR"; then
    echo -e "${RED}❌ Tunnel info error:${NC}"
    echo "$TUNNEL_INFO" | head -10
    echo ""
    echo -e "${YELLOW}⚠️  Token mungkin invalid atau expired${NC}"
    echo "   Solusi: Regenerate token di Cloudflare Dashboard"
else
    echo -e "${GREEN}✅ Tunnel info OK:${NC}"
    echo "$TUNNEL_INFO" | head -10
fi
echo ""

# 11. Summary
echo "=========================================="
echo "📋 Summary"
echo "=========================================="
echo ""
docker compose ps cloudflared
echo ""

if [ "$RESTARTING" -gt "0" ]; then
    echo -e "${RED}❌ ACTION REQUIRED: Cloudflared masih restarting${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Check logs: docker compose logs cloudflared"
    echo "2. Verify token: grep CLOUDFLARE_TUNNEL_TOKEN .env"
    echo "3. Regenerate token di Cloudflare Dashboard jika perlu"
    echo "4. Check internet connectivity dari server"
else
    echo -e "${GREEN}✅ Cloudflared sepertinya sudah running!${NC}"
    echo ""
    echo "Verifikasi:"
    echo "1. Check status: docker compose ps cloudflared"
    echo "2. Check logs: docker compose logs -f cloudflared"
    echo "3. Check di Dashboard: https://one.dash.cloudflare.com/"
    echo "   Zero Trust > Networks > Tunnels"
fi
echo ""

