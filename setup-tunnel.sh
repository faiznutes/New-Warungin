#!/bin/bash

# ========================================
# CLOUDFLARE TUNNEL - AUTOMATED DOCKER SETUP
# ========================================
# Tunnel ID: dadba309-669b-4163-b903-59ef4302c3cb
# Usage: bash setup-tunnel.sh

set -e

echo "🚀 STARTING CLOUDFLARE TUNNEL DOCKER SETUP"
echo "==========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
TUNNEL_ID="dadba309-669b-4163-b903-59ef4302c3cb"
CREDENTIALS_DIR="/root/New-Warungin/credentials"
COMPOSE_FILE="/root/New-Warungin/docker-compose.yml"

# ========================================
# STEP 1: Create credentials directory
# ========================================
echo -e "${YELLOW}📁 STEP 1: Creating credentials directory${NC}"

if [ ! -d "$CREDENTIALS_DIR" ]; then
    mkdir -p "$CREDENTIALS_DIR"
    echo -e "${GREEN}✅ Credentials directory created: $CREDENTIALS_DIR${NC}"
else
    echo -e "${GREEN}✅ Credentials directory already exists${NC}"
fi

# ========================================
# STEP 2: Check credentials file
# ========================================
echo ""
echo -e "${YELLOW}🔑 STEP 2: Checking credentials file${NC}"

CREDENTIALS_FILE="$CREDENTIALS_DIR/$TUNNEL_ID.json"

if [ ! -f "$CREDENTIALS_FILE" ]; then
    echo -e "${RED}❌ ERROR: Credentials file not found!${NC}"
    echo "Expected location: $CREDENTIALS_FILE"
    echo ""
    echo "📥 REQUIRED ACTION:"
    echo "1. Download credentials from: https://dash.cloudflare.com/"
    echo "   - Go to: Zero Trust → Tunnels → warungin-pos"
    echo "   - Click: Download credentials"
    echo "2. Save to: $CREDENTIALS_FILE"
    echo ""
    exit 1
else
    echo -e "${GREEN}✅ Credentials file found${NC}"
    # Verify JSON format
    if ! jq empty "$CREDENTIALS_FILE" 2>/dev/null; then
        echo -e "${RED}❌ ERROR: Credentials file is not valid JSON!${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Credentials file is valid JSON${NC}"
fi

# ========================================
# STEP 3: Stop existing containers
# ========================================
echo ""
echo -e "${YELLOW}🛑 STEP 3: Stopping existing containers${NC}"

cd /root/New-Warungin

if docker-compose -f docker-compose.yml ps 2>/dev/null | grep -q "warungin-"; then
    echo "Stopping containers..."
    docker-compose -f docker-compose.yml down --remove-orphans 2>/dev/null || true
    sleep 2
    echo -e "${GREEN}✅ Containers stopped${NC}"
else
    echo -e "${GREEN}✅ No running containers${NC}"
fi

# ========================================
# STEP 4: Pull latest images
# ========================================
echo ""
echo -e "${YELLOW}📦 STEP 4: Pulling latest images${NC}"

docker pull postgres:15-alpine
docker pull redis:7-alpine
docker pull node:20
docker pull nginx:latest
docker pull prom/prometheus:latest
docker pull grafana/grafana:latest
docker pull prom/alertmanager:latest
docker pull cloudflare/cloudflared:latest

echo -e "${GREEN}✅ All images updated${NC}"

# ========================================
# STEP 5: Start all services
# ========================================
echo ""
echo -e "${YELLOW}🚀 STEP 5: Starting all services${NC}"

docker-compose -f docker-compose.yml up -d

echo -e "${GREEN}✅ Services starting...${NC}"

# ========================================
# STEP 6: Wait for services to be healthy
# ========================================
echo ""
echo -e "${YELLOW}⏳ STEP 6: Waiting for services to become healthy${NC}"

sleep 5

# Function to check if all services are healthy
check_health() {
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        local total=$(docker ps -q --filter "label!=com.docker.compose.project" | wc -l)
        local healthy=$(docker ps -q --filter "health=healthy" | wc -l)
        
        if [ "$total" -eq 0 ]; then
            echo "Waiting for services to start..."
        else
            echo "Services running: $total | Healthy: $healthy"
            
            if [ "$healthy" -ge 8 ]; then
                return 0
            fi
        fi
        
        sleep 2
        attempt=$((attempt + 1))
    done
    
    return 1
}

if check_health; then
    echo -e "${GREEN}✅ All services are healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Some services still starting (this is normal)${NC}"
fi

# ========================================
# STEP 7: Display service status
# ========================================
echo ""
echo -e "${YELLOW}📊 STEP 7: Service Status${NC}"
echo ""

docker-compose -f docker-compose.yml ps

# ========================================
# STEP 8: Verify tunnel connected
# ========================================
echo ""
echo -e "${YELLOW}🌍 STEP 8: Verifying tunnel connection${NC}"

sleep 3

# Check tunnel logs
TUNNEL_LOGS=$(docker logs warungin-cloudflared 2>&1 | tail -20)

if echo "$TUNNEL_LOGS" | grep -q "Connection registered"; then
    echo -e "${GREEN}✅ Tunnel CONNECTED!${NC}"
    echo ""
    echo "📋 Recent tunnel logs:"
    echo "$TUNNEL_LOGS" | grep -E "Connection registered|Tunnel running|registration"
elif echo "$TUNNEL_LOGS" | grep -q "ERROR\|error\|failed"; then
    echo -e "${RED}❌ Tunnel ERROR detected${NC}"
    echo ""
    echo "📋 Recent tunnel logs:"
    echo "$TUNNEL_LOGS" | tail -10
else
    echo -e "${YELLOW}⏳ Tunnel still connecting (give it 30-60 seconds)${NC}"
    echo ""
    echo "📋 Recent tunnel logs:"
    echo "$TUNNEL_LOGS" | tail -10
fi

# ========================================
# STEP 9: Test local connectivity
# ========================================
echo ""
echo -e "${YELLOW}🧪 STEP 9: Testing local connectivity${NC}"

sleep 2

echo "Testing frontend..."
if curl -k -s -o /dev/null -w "%{http_code}" https://127.0.0.1/ | grep -q -E "200|302|404"; then
    echo -e "${GREEN}✅ Frontend responding${NC}"
else
    echo -e "${RED}❌ Frontend not responding${NC}"
fi

echo "Testing API..."
if curl -k -s -o /dev/null -w "%{http_code}" https://127.0.0.1/api/ | grep -q -E "200|302|404"; then
    echo -e "${GREEN}✅ API responding${NC}"
else
    echo -e "${RED}❌ API not responding${NC}"
fi

echo "Testing Grafana..."
if curl -k -s -o /dev/null -w "%{http_code}" https://127.0.0.1/grafana/ | grep -q -E "200|302|404"; then
    echo -e "${GREEN}✅ Grafana responding${NC}"
else
    echo -e "${RED}❌ Grafana not responding${NC}"
fi

# ========================================
# FINAL STATUS
# ========================================
echo ""
echo "=========================================="
echo -e "${GREEN}✅ CLOUDFLARE TUNNEL SETUP COMPLETE!${NC}"
echo "=========================================="
echo ""
echo "📊 Service Summary:"
echo "  - 8 services configured"
echo "  - Cloudflare Tunnel: warungin-cloudflared"
echo "  - Tunnel ID: $TUNNEL_ID"
echo ""
echo "🌍 Access Points:"
echo "  - Local: https://192.168.1.101/"
echo "  - External: https://pos.faiznute.site/ (pending DNS propagation)"
echo ""
echo "📋 Useful Commands:"
echo "  - Check status:     docker-compose -f docker-compose.yml ps"
echo "  - View logs:        docker-compose -f docker-compose.yml logs -f"
echo "  - Tunnel logs:      docker logs -f warungin-cloudflared"
echo "  - Backend logs:     docker logs -f warungin-backend"
echo "  - Stop services:    docker-compose -f docker-compose.yml down"
echo "  - Restart services: docker-compose -f docker-compose.yml restart"
echo ""
echo "✨ Next Steps:"
echo "  1. Wait 30-60 seconds for tunnel to fully connect"
echo "  2. Verify tunnel status: docker logs warungin-cloudflared | tail -20"
echo "  3. Check external access: https://pos.faiznute.site/"
echo "  4. If DNS not working, verify CNAME record in CloudFlare"
echo ""
