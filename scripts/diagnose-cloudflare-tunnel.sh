#!/bin/bash

# Script untuk diagnose Cloudflare Tunnel Error 1033
# Usage: bash scripts/diagnose-cloudflare-tunnel.sh

echo "=========================================="
echo "🔍 Cloudflare Tunnel Diagnosis"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check Docker Compose
echo "1. Checking Docker Compose..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker tidak terinstall${NC}"
    exit 1
fi
if ! command -v docker compose &> /dev/null && ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose tidak terinstall${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose tersedia${NC}"
echo ""

# 2. Check Container Status
echo "2. Checking Container Status..."
echo "-----------------------------------"
docker compose ps
echo ""

# 3. Check Nginx Status
echo "3. Checking Nginx Status..."
echo "-----------------------------------"
NGINX_STATUS=$(docker compose ps nginx 2>/dev/null | grep -c "Up" || echo "0")
if [ "$NGINX_STATUS" -eq "0" ]; then
    echo -e "${RED}❌ Nginx tidak running${NC}"
    echo "   Jalankan: docker compose up -d nginx"
else
    echo -e "${GREEN}✅ Nginx running${NC}"
    # Check if healthy
    NGINX_HEALTHY=$(docker compose ps nginx 2>/dev/null | grep -c "healthy" || echo "0")
    if [ "$NGINX_HEALTHY" -eq "0" ]; then
        echo -e "${YELLOW}⚠️  Nginx belum healthy${NC}"
        echo "   Check logs: docker compose logs nginx"
    else
        echo -e "${GREEN}✅ Nginx healthy${NC}"
    fi
fi
echo ""

# 4. Check Cloudflared Status
echo "4. Checking Cloudflared Status..."
echo "-----------------------------------"
CLOUDFLARED_STATUS=$(docker compose ps cloudflared 2>/dev/null | grep -c "Up" || echo "0")
if [ "$CLOUDFLARED_STATUS" -eq "0" ]; then
    echo -e "${RED}❌ Cloudflared tidak running${NC}"
    echo "   Jalankan: docker compose --profile cloudflare up -d cloudflared"
else
    echo -e "${GREEN}✅ Cloudflared running${NC}"
fi
echo ""

# 5. Check Tunnel Token
echo "5. Checking Tunnel Token..."
echo "-----------------------------------"
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ File .env tidak ditemukan${NC}"
else
    TOKEN=$(grep CLOUDFLARE_TUNNEL_TOKEN .env | cut -d '=' -f2 | tr -d ' ' || echo "")
    if [ -z "$TOKEN" ]; then
        echo -e "${RED}❌ CLOUDFLARE_TUNNEL_TOKEN tidak di-set${NC}"
        echo "   Edit .env dan tambahkan: CLOUDFLARE_TUNNEL_TOKEN=your_token"
    else
        TOKEN_LENGTH=${#TOKEN}
        if [ "$TOKEN_LENGTH" -lt 50 ]; then
            echo -e "${YELLOW}⚠️  Token terlalu pendek (mungkin invalid)${NC}"
        else
            echo -e "${GREEN}✅ Token ditemukan (${TOKEN_LENGTH} karakter)${NC}"
        fi
    fi
fi
echo ""

# 6. Test Nginx from Host
echo "6. Testing Nginx from Host..."
echo "-----------------------------------"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:80 | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ Nginx accessible dari host (localhost:80)${NC}"
else
    echo -e "${RED}❌ Nginx tidak accessible dari host${NC}"
    echo "   Check: curl http://localhost:80"
fi
echo ""

# 7. Test Nginx from Cloudflared Container
echo "7. Testing Nginx from Cloudflared Container..."
echo "-----------------------------------"
if docker compose ps cloudflared | grep -q "Up"; then
    if docker compose exec -T cloudflared wget -q -O- http://nginx:80 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Cloudflared bisa reach nginx${NC}"
    else
        echo -e "${RED}❌ Cloudflared TIDAK bisa reach nginx${NC}"
        echo "   Ini adalah penyebab utama Error 1033!"
        echo "   Check network: docker network inspect new-warungin_warungin-network"
    fi
else
    echo -e "${YELLOW}⚠️  Cloudflared tidak running, skip test${NC}"
fi
echo ""

# 8. Check Network
echo "8. Checking Docker Network..."
echo "-----------------------------------"
NETWORK_EXISTS=$(docker network ls | grep -c "warungin-network" || echo "0")
if [ "$NETWORK_EXISTS" -eq "0" ]; then
    echo -e "${RED}❌ Network warungin-network tidak ditemukan${NC}"
    echo "   Jalankan: docker compose up -d (akan create network)"
else
    echo -e "${GREEN}✅ Network warungin-network ditemukan${NC}"
    # Check if containers are in network
    NETWORK_NAME=$(docker network ls | grep warungin-network | awk '{print $2}')
    NGINX_IN_NETWORK=$(docker network inspect "$NETWORK_NAME" 2>/dev/null | grep -c "warungin-nginx" || echo "0")
    CLOUDFLARED_IN_NETWORK=$(docker network inspect "$NETWORK_NAME" 2>/dev/null | grep -c "warungin-cloudflared" || echo "0")
    
    if [ "$NGINX_IN_NETWORK" -eq "0" ]; then
        echo -e "${RED}❌ Nginx tidak di network${NC}"
    else
        echo -e "${GREEN}✅ Nginx di network${NC}"
    fi
    
    if [ "$CLOUDFLARED_IN_NETWORK" -eq "0" ]; then
        echo -e "${RED}❌ Cloudflared tidak di network${NC}"
    else
        echo -e "${GREEN}✅ Cloudflared di network${NC}"
    fi
fi
echo ""

# 9. Check Cloudflared Logs
echo "9. Recent Cloudflared Logs (last 20 lines)..."
echo "-----------------------------------"
docker compose logs cloudflared 2>/dev/null | tail -20
echo ""

# 10. Summary and Recommendations
echo "=========================================="
echo "📋 Summary & Recommendations"
echo "=========================================="
echo ""

if [ "$NGINX_STATUS" -eq "0" ]; then
    echo -e "${RED}❌ ACTION REQUIRED: Start nginx${NC}"
    echo "   docker compose up -d nginx"
    echo ""
fi

if [ "$CLOUDFLARED_STATUS" -eq "0" ]; then
    echo -e "${RED}❌ ACTION REQUIRED: Start cloudflared${NC}"
    echo "   docker compose --profile cloudflare up -d cloudflared"
    echo ""
fi

echo "🔧 Next Steps:"
echo "1. Pastikan Service URL di Cloudflare Dashboard: http://nginx:80"
echo "2. Check: https://one.dash.cloudflare.com/ > Zero Trust > Networks > Tunnels"
echo "3. Restart cloudflared: docker compose --profile cloudflare restart cloudflared"
echo "4. Check logs: docker compose logs -f cloudflared"
echo ""

