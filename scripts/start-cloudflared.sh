#!/bin/bash

# Script untuk start cloudflared dengan benar
# Usage: bash scripts/start-cloudflared.sh

echo "=========================================="
echo "🚀 Starting Cloudflared"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Check and Clean Existing Containers
echo -e "${BLUE}1. Checking and Cleaning Existing Containers...${NC}"
# Remove any existing cloudflared container (from docker run or docker compose)
docker stop warungin-cloudflared 2>/dev/null || true
docker rm -f warungin-cloudflared 2>/dev/null || true
docker compose --profile cloudflare rm -f cloudflared 2>/dev/null || true
sleep 2

# Check if already running via docker compose
STATUS=$(docker compose ps cloudflared 2>/dev/null | grep -c "Up" 2>/dev/null || echo "0")
STATUS=${STATUS:-0}
if [ "$STATUS" -gt 0 ]; then
    echo -e "${GREEN}✅ Cloudflared sudah running${NC}"
    docker compose ps cloudflared
    exit 0
fi
echo -e "${GREEN}✅ Cleaned${NC}"
echo ""

# 2. Verify Nginx
echo -e "${BLUE}2. Verifying Nginx...${NC}"
NGINX_HEALTHY=$(docker compose ps nginx 2>/dev/null | grep -c "healthy" || echo "0")
if [ "$NGINX_HEALTHY" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Nginx belum healthy, waiting...${NC}"
    sleep 10
fi
NGINX_HEALTHY=$(docker compose ps nginx 2>/dev/null | grep -c "healthy" || echo "0")
if [ "$NGINX_HEALTHY" -gt 0 ]; then
    echo -e "${GREEN}✅ Nginx healthy${NC}"
else
    echo -e "${RED}❌ Nginx tidak healthy${NC}"
    echo "   Starting nginx..."
    docker compose up -d nginx
    sleep 15
fi
echo ""

# 3. Check Token
echo -e "${BLUE}3. Checking Token...${NC}"
TOKEN=$(grep "^CLOUDFLARE_TUNNEL_TOKEN=" .env 2>/dev/null | cut -d '=' -f2- | tr -d ' ' || echo "")
if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Token tidak ditemukan di .env${NC}"
    exit 1
fi
TOKEN_LENGTH=${#TOKEN}
if [ "$TOKEN_LENGTH" -lt 50 ]; then
    echo -e "${RED}❌ Token terlalu pendek${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Token OK (${TOKEN_LENGTH} chars)${NC}"
echo ""

# 4. Start Cloudflared
echo -e "${BLUE}4. Starting Cloudflared...${NC}"
docker compose --profile cloudflare up -d cloudflared
sleep 10
echo -e "${GREEN}✅ Started${NC}"
echo ""

# 5. Check Status
echo -e "${BLUE}5. Checking Status...${NC}"
sleep 5
STATUS_OUTPUT=$(docker compose ps cloudflared 2>/dev/null)
echo "$STATUS_OUTPUT"
echo ""

RESTARTING=$(echo "$STATUS_OUTPUT" | grep -c "Restarting" 2>/dev/null || echo "0")
RESTARTING=${RESTARTING:-0}
if [ -z "$RESTARTING" ]; then RESTARTING=0; fi
RUNNING=$(echo "$STATUS_OUTPUT" | grep -c "Up" 2>/dev/null || echo "0")
RUNNING=${RUNNING:-0}
if [ -z "$RUNNING" ]; then RUNNING=0; fi

if [ "$RESTARTING" -gt 0 ]; then
    echo -e "${RED}❌ Cloudflared masih restarting${NC}"
    echo ""
    echo "Recent logs:"
    docker compose logs cloudflared 2>&1 | tail -20
elif [ "$RUNNING" -gt 0 ]; then
    echo -e "${GREEN}✅ Cloudflared running!${NC}"
    echo ""
    echo "Recent logs:"
    docker compose logs cloudflared 2>&1 | tail -10
else
    echo -e "${RED}❌ Cloudflared tidak running${NC}"
    echo ""
    echo "Check logs:"
    docker compose logs cloudflared 2>&1 | tail -20
fi
echo ""

# 6. Summary
echo "=========================================="
echo "📋 Summary"
echo "=========================================="
echo ""
if [ "$RESTARTING" -eq 0 ] && [ "$RUNNING" -gt 0 ] 2>/dev/null; then
    echo -e "${GREEN}✅ Cloudflared started successfully!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Monitor: docker compose logs -f cloudflared"
    echo "2. Verify: bash scripts/verify-cloudflared.sh"
    echo "3. Check Dashboard: https://one.dash.cloudflare.com/"
else
    echo -e "${RED}❌ Masih ada masalah${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check logs: docker compose logs cloudflared | tail -50"
    echo "2. Verify token: grep CLOUDFLARE_TUNNEL_TOKEN .env"
fi
echo ""

