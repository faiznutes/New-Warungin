#!/bin/bash

# Script comprehensive untuk fix cloudflared restarting issue
# Usage: bash scripts/fix-cloudflared-complete.sh

echo "=========================================="
echo "🔧 Complete Cloudflared Fix"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ERRORS_FOUND=0

# 1. Check and Fix Token in .env
echo -e "${BLUE}1. Checking Token in .env...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ File .env tidak ditemukan${NC}"
    echo "   Creating from env.example..."
    cp env.example .env
    ERRORS_FOUND=$((ERRORS_FOUND + 1))
fi

TOKEN=$(grep "^CLOUDFLARE_TUNNEL_TOKEN=" .env 2>/dev/null | cut -d '=' -f2- | tr -d ' ' || echo "")
if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ CLOUDFLARE_TUNNEL_TOKEN tidak ditemukan di .env${NC}"
    ERRORS_FOUND=$((ERRORS_FOUND + 1))
else
    TOKEN_LENGTH=${#TOKEN}
    # Check if token looks valid (should be base64, at least 50 chars)
    if [ "$TOKEN_LENGTH" -lt 50 ]; then
        echo -e "${RED}❌ Token terlalu pendek (${TOKEN_LENGTH} karakter)${NC}"
        ERRORS_FOUND=$((ERRORS_FOUND + 1))
    else
        # Check for duplicate/corrupted token (contains multiple eyJh)
        EYJH_COUNT=$(echo "$TOKEN" | grep -o "eyJh" | wc -l)
        if [ "$EYJH_COUNT" -gt 1 ]; then
            echo -e "${RED}❌ Token terlihat corrupted (multiple eyJh found)${NC}"
            echo "   Token mungkin duplikat atau corrupted"
            ERRORS_FOUND=$((ERRORS_FOUND + 1))
        else
            echo -e "${GREEN}✅ Token ditemukan (${TOKEN_LENGTH} karakter)${NC}"
        fi
    fi
fi
echo ""

# 2. Check Docker Compose Configuration
echo -e "${BLUE}2. Checking Docker Compose Configuration...${NC}"
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ docker-compose.yml tidak ditemukan${NC}"
    ERRORS_FOUND=$((ERRORS_FOUND + 1))
else
    # Check if cloudflared service exists
    if grep -q "cloudflared:" docker-compose.yml; then
        echo -e "${GREEN}✅ Cloudflared service configured${NC}"
        
        # Check network configuration
        if grep -q "warungin-network" docker-compose.yml; then
            echo -e "${GREEN}✅ Network warungin-network configured${NC}"
        else
            echo -e "${RED}❌ Network warungin-network tidak ditemukan${NC}"
            ERRORS_FOUND=$((ERRORS_FOUND + 1))
        fi
        
        # Check depends_on
        if grep -A 5 "cloudflared:" docker-compose.yml | grep -q "depends_on"; then
            echo -e "${GREEN}✅ Depends_on configured${NC}"
        else
            echo -e "${YELLOW}⚠️  Depends_on tidak ditemukan${NC}"
        fi
    else
        echo -e "${RED}❌ Cloudflared service tidak ditemukan di docker-compose.yml${NC}"
        ERRORS_FOUND=$((ERRORS_FOUND + 1))
    fi
fi
echo ""

# 3. Force Stop and Clean Cloudflared
echo -e "${BLUE}3. Force Stopping and Cleaning Cloudflared...${NC}"
docker compose --profile cloudflare stop cloudflared 2>/dev/null || true
docker compose --profile cloudflare rm -f cloudflared 2>/dev/null || true
docker stop warungin-cloudflared 2>/dev/null || true
docker kill warungin-cloudflared 2>/dev/null || true
docker rm -f warungin-cloudflared 2>/dev/null || true
sleep 5
echo -e "${GREEN}✅ Cloudflared cleaned${NC}"
echo ""

# 4. Check Nginx Status
echo -e "${BLUE}4. Checking Nginx Status...${NC}"
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
    echo -e "${GREEN}✅ Nginx healthy${NC}"
else
    echo -e "${RED}❌ Nginx belum healthy${NC}"
    ERRORS_FOUND=$((ERRORS_FOUND + 1))
fi
echo ""

# 5. Check Network
echo -e "${BLUE}5. Checking Docker Network...${NC}"
NETWORK_NAME=$(docker network ls | grep warungin-network | awk '{print $2}' | head -1)
if [ -z "$NETWORK_NAME" ]; then
    echo -e "${YELLOW}⚠️  Network tidak ditemukan, creating...${NC}"
    docker compose up -d postgres 2>/dev/null || true
    sleep 5
    NETWORK_NAME=$(docker network ls | grep warungin-network | awk '{print $2}' | head -1)
fi

if [ -n "$NETWORK_NAME" ]; then
    echo -e "${GREEN}✅ Network: $NETWORK_NAME${NC}"
    
    # Check nginx in network
    NGINX_IN_NETWORK=$(docker network inspect "$NETWORK_NAME" 2>/dev/null | grep -c "warungin-nginx" || echo "0")
    if [ "$NGINX_IN_NETWORK" -gt "0" ]; then
        echo -e "${GREEN}✅ Nginx di network${NC}"
    else
        echo -e "${YELLOW}⚠️  Nginx tidak di network${NC}"
    fi
else
    echo -e "${RED}❌ Network tidak ditemukan${NC}"
    ERRORS_FOUND=$((ERRORS_FOUND + 1))
fi
echo ""

# 6. Pull Latest Image
echo -e "${BLUE}6. Pulling Latest Cloudflared Image...${NC}"
docker pull cloudflare/cloudflared:latest
echo -e "${GREEN}✅ Image updated${NC}"
echo ""

# 7. Recreate Cloudflared
echo -e "${BLUE}7. Recreating Cloudflared...${NC}"
docker compose --profile cloudflare up -d cloudflared
sleep 10
echo -e "${GREEN}✅ Cloudflared recreated${NC}"
echo ""

# 8. Verify Cloudflared in Network
echo -e "${BLUE}8. Verifying Cloudflared in Network...${NC}"
sleep 5
if [ -n "$NETWORK_NAME" ]; then
    CLOUDFLARED_IN_NETWORK=$(docker network inspect "$NETWORK_NAME" 2>/dev/null | grep -c "warungin-cloudflared" || echo "0")
    if [ "$CLOUDFLARED_IN_NETWORK" -gt "0" ]; then
        echo -e "${GREEN}✅ Cloudflared di network${NC}"
    else
        echo -e "${YELLOW}⚠️  Cloudflared belum di network, waiting...${NC}"
        sleep 10
        CLOUDFLARED_IN_NETWORK=$(docker network inspect "$NETWORK_NAME" 2>/dev/null | grep -c "warungin-cloudflared" || echo "0")
        if [ "$CLOUDFLARED_IN_NETWORK" -gt "0" ]; then
            echo -e "${GREEN}✅ Cloudflared sekarang di network${NC}"
        else
            echo -e "${RED}❌ Cloudflared masih tidak di network${NC}"
            ERRORS_FOUND=$((ERRORS_FOUND + 1))
        fi
    fi
fi
echo ""

# 9. Check Status
echo -e "${BLUE}9. Checking Cloudflared Status...${NC}"
sleep 10
CLOUDFLARED_STATUS=$(docker compose ps cloudflared 2>/dev/null | grep -c "Up" || echo "0")
RESTARTING=$(docker compose ps cloudflared 2>/dev/null | grep -c "Restarting" || echo "0")

if [ "$RESTARTING" -gt "0" ]; then
    echo -e "${RED}❌ Cloudflared masih restarting${NC}"
    ERRORS_FOUND=$((ERRORS_FOUND + 1))
elif [ "$CLOUDFLARED_STATUS" -gt "0" ]; then
    echo -e "${GREEN}✅ Cloudflared running!${NC}"
else
    echo -e "${RED}❌ Cloudflared tidak running${NC}"
    ERRORS_FOUND=$((ERRORS_FOUND + 1))
fi
echo ""

# 10. Check Logs for Errors
echo -e "${BLUE}10. Checking Recent Logs...${NC}"
echo "-----------------------------------"
LOGS=$(docker compose logs cloudflared 2>/dev/null | tail -30)
echo "$LOGS"

# Check for common errors
if echo "$LOGS" | grep -qi "token.*invalid\|invalid.*token"; then
    echo -e "${RED}❌ ERROR: Token invalid${NC}"
    ERRORS_FOUND=$((ERRORS_FOUND + 1))
fi

if echo "$LOGS" | grep -qi "connection.*refused\|refused.*connection"; then
    echo -e "${RED}❌ ERROR: Connection refused${NC}"
    ERRORS_FOUND=$((ERRORS_FOUND + 1))
fi

if echo "$LOGS" | grep -qi "unable.*reach\|reach.*origin"; then
    echo -e "${RED}❌ ERROR: Unable to reach origin${NC}"
    ERRORS_FOUND=$((ERRORS_FOUND + 1))
fi

if echo "$LOGS" | grep -qi "connection.*established\|tunnel.*up"; then
    echo -e "${GREEN}✅ Connection established!${NC}"
fi
echo ""

# 11. Final Summary
echo "=========================================="
echo "📋 Final Summary"
echo "=========================================="
echo ""
docker compose ps cloudflared
echo ""

if [ "$ERRORS_FOUND" -gt 0 ]; then
    echo -e "${RED}❌ Ditemukan $ERRORS_FOUND error(s)${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Check logs: docker compose logs cloudflared | tail -50"
    echo "2. Verify token: grep CLOUDFLARE_TUNNEL_TOKEN .env"
    echo "3. Check Service URL di Dashboard = http://nginx:80"
    echo "4. Regenerate token jika token invalid"
else
    if [ "$RESTARTING" -eq "0" ] && [ "$CLOUDFLARED_STATUS" -gt "0" ]; then
        echo -e "${GREEN}✅ Semua check passed! Cloudflared sepertinya sudah running.${NC}"
        echo ""
        echo "Verifikasi:"
        echo "1. Check logs: docker compose logs -f cloudflared"
        echo "2. Test tunnel: docker compose exec cloudflared cloudflared tunnel info"
        echo "3. Check Dashboard: https://one.dash.cloudflare.com/"
    else
        echo -e "${YELLOW}⚠️  Cloudflared mungkin masih starting...${NC}"
        echo "   Tunggu beberapa detik dan check: docker compose ps cloudflared"
    fi
fi
echo ""

