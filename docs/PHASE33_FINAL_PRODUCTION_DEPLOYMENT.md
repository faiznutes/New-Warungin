# Phase 33: Final Production Deployment Guide

**Status**: READY FOR DEPLOYMENT  
**Target Server**: 192.168.1.101:3000  
**Environment**: Production  
**Database**: PostgreSQL 15-alpine (Production)  

---

## 1. Pre-Deployment Checklist

### 1.1 Code Quality & Testing
```
✅ All Unit Tests Passing
  └─ Target: 1,000+ tests all green
  └─ Command: npm run test:all
  └─ Status: VERIFIED

✅ E2E Tests Passing
  └─ Target: All critical user flows working
  └─ Command: npm run cypress:run
  └─ Status: VERIFIED

✅ Linting & Code Quality
  └─ Target: No errors, warnings <5
  └─ Command: npm run lint
  └─ Status: VERIFIED

✅ Security Audit Complete
  └─ Target: 0 critical, 0 high vulnerabilities
  └─ Command: npm audit
  └─ Status: VERIFIED (Phase 31)

✅ Performance Baseline
  └─ Target: API response <200ms, <50ms for cache hits
  └─ Command: npm run perf:test
  └─ Status: VERIFIED
```

### 1.2 Infrastructure Readiness
```
✅ Production Server Prepared
  └─ IP: 192.168.1.101
  └─ OS: Ubuntu 20.04 LTS
  └─ Disk: >50GB free
  └─ Memory: >8GB available
  └─ CPU: >4 cores

✅ Database Ready
  └─ PostgreSQL 15-alpine running
  └─ Database: warungin_production
  └─ Backup: Recent backup taken
  └─ Migrations: All up-to-date
  └─ Status: Verified

✅ Redis Cache Ready
  └─ Redis 7-alpine running
  └─ Port: 6379
  └─ Memory: >2GB configured
  └─ Status: Verified

✅ Monitoring Stack Ready
  └─ Prometheus: Collecting metrics
  └─ Grafana: Dashboards ready
  └─ AlertManager: Alerts configured
  └─ Loki: Log collection ready
```

### 1.3 Secrets & Configuration
```
✅ Environment Variables Set
  └─ DATABASE_URL: postgresql://...
  └─ REDIS_URL: redis://...
  └─ JWT_SECRET: Configured
  └─ JWT_REFRESH_SECRET: Configured
  └─ API_KEYS: All configured
  └─ SSL_CERT_PATH: /etc/ssl/...
  └─ SSL_KEY_PATH: /etc/ssl/...

✅ Encryption Keys Ready
  └─ Data encryption key: Stored in secure vault
  └─ Session encryption: Enabled
  └─ Password hashing: bcrypt with cost 12

✅ SSL/TLS Certificates
  └─ Certificate: Valid
  └─ Expiry: >30 days remaining
  └─ Chain: Complete
  └─ Key: Secure (400 permissions)
```

### 1.4 Team & Documentation
```
✅ Team Notified
  └─ Deployment time: Scheduled
  └─ Expected downtime: <30 minutes
  └─ Rollback plan: Documented
  └─ Contact: Escalation contact ready

✅ Documentation Complete
  └─ Deployment guide: Phase 33_DEPLOYMENT_GUIDE.md
  └─ API documentation: /docs/api
  └─ Database schema: /docs/schema
  └─ Troubleshooting: /docs/troubleshooting

✅ Backup Verified
  └─ Database backup: Done
  └─ Code backup: Git tags created (v1.0.0-prod)
  └─ Configuration backup: Saved
  └─ Restoration tested: Yes
```

---

## 2. Deployment Steps

### Step 1: Pre-Deployment Verification (15 minutes)
```bash
#!/bin/bash

echo "=== PHASE 33: PRE-DEPLOYMENT VERIFICATION ==="
echo "Start time: $(date)"

# 1.1 Verify Git Status
echo -e "\n=== Step 1.1: Git Status ==="
git status
git log --oneline -5

# Expected Output:
# On branch main
# nothing to commit, working tree clean
# bbcec5d Phase 32: Complete QA Testing Framework
# ...

# 1.2 Verify Dependencies
echo -e "\n=== Step 1.2: Verify Dependencies ==="
npm list --depth=0
# Expected: All dependencies listed

# 1.3 Verify Build
echo -e "\n=== Step 1.3: Build Verification ==="
npm run build
# Expected: Build successful, no errors

# 1.4 Verify Tests
echo -e "\n=== Step 1.4: Test Verification ==="
npm run test:all -- --run
# Expected: All tests passing

# 1.5 Verify Server Can Start
echo -e "\n=== Step 1.5: Server Start Verification ==="
timeout 10 npm run dev
# Expected: Server starts, no critical errors in logs

# 1.6 Database Connection Check
echo -e "\n=== Step 1.6: Database Connection ==="
npm run db:check
# Expected: Connected to production database

echo -e "\n=== Verification Complete ==="
echo "End time: $(date)"
```

### Step 2: Production Environment Setup (30 minutes)
```bash
#!/bin/bash

echo "=== PHASE 33: PRODUCTION ENVIRONMENT SETUP ==="

# 2.1 Connect to Production Server
echo -e "\n=== Step 2.1: Connect to Production Server ==="
ssh -i ~/.ssh/id_rsa deploy@192.168.1.101
# Expected: SSH connection successful

# 2.2 Check Current Deployment
echo -e "\n=== Step 2.2: Check Current Deployment ==="
cd /opt/warungin
docker ps
docker-compose -f docker-compose.yml ps
# Expected: Current containers running

# 2.3 Create Backup
echo -e "\n=== Step 2.3: Create Production Backup ==="
./scripts/backup-production.sh
# Expected: Backup completed successfully
# Location: /backups/production-$(date +%Y%m%d-%H%M%S).tar.gz

# 2.4 Prepare New Release
echo -e "\n=== Step 2.4: Prepare New Release ==="
mkdir -p /opt/warungin/releases/v1.0.0
cd /opt/warungin/releases/v1.0.0

# Clone latest code
git clone --depth 1 --branch main https://github.com/your-repo/warungin.git .
# Or pull latest:
cd /opt/warungin
git fetch origin main
git checkout origin/main

# 2.5 Update Environment
echo -e "\n=== Step 2.5: Update Environment ==="
cat > .env.production << 'EOF'
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/warungin_production
REDIS_URL=redis://localhost:6379/0
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
API_RATE_LIMIT_WINDOW=900000
API_RATE_LIMIT_MAX_REQUESTS=1000
LOG_LEVEL=info
CORS_ORIGIN=https://warungin.yourdomain.com
ENVIRONMENT=production
EOF

# 2.6 Verify Environment
echo -e "\n=== Step 2.6: Verify Environment ==="
cat .env.production | grep -E "^[A-Z]" | wc -l
# Expected: 11+ environment variables

echo -e "\n=== Setup Complete ==="
```

### Step 3: Database Migration (20 minutes)
```bash
#!/bin/bash

echo "=== PHASE 33: DATABASE MIGRATION ==="

# 3.1 Backup Current Database
echo -e "\n=== Step 3.1: Backup Current Database ==="
BACKUP_FILE="/backups/db-$(date +%Y%m%d-%H%M%S).sql.gz"
pg_dump -h localhost -U postgres warungin_production | gzip > $BACKUP_FILE
echo "Backup saved to: $BACKUP_FILE"

# Verify backup
gunzip -t $BACKUP_FILE && echo "✓ Backup integrity verified"

# 3.2 Run Database Migrations
echo -e "\n=== Step 3.2: Run Prisma Migrations ==="
cd /opt/warungin
npx prisma migrate deploy
# Expected: All migrations applied

# 3.3 Verify Database Schema
echo -e "\n=== Step 3.3: Verify Database Schema ==="
npx prisma db push --skip-generate
# Expected: Schema verified

# 3.4 Seed Production Data (if needed)
echo -e "\n=== Step 3.4: Seed Production Data ==="
npm run db:seed:production
# Expected: Base data seeded (admin user, default roles, etc.)

# 3.5 Database Health Check
echo -e "\n=== Step 3.5: Database Health Check ==="
npm run db:health
# Expected: Database health report
# Tables: 30+
# Records: Expected counts
# Indexes: All present
# Foreign Keys: All valid

echo -e "\n=== Database Migration Complete ==="
```

### Step 4: Build & Deploy (30 minutes)
```bash
#!/bin/bash

echo "=== PHASE 33: BUILD & DEPLOY ==="

cd /opt/warungin

# 4.1 Stop Current Deployment
echo -e "\n=== Step 4.1: Stop Current Deployment ==="
docker-compose -f docker-compose.yml down --remove-orphans
# Expected: All containers stopped

# 4.2 Build Docker Images
echo -e "\n=== Step 4.2: Build Docker Images ==="
docker-compose -f docker-compose.yml build --no-cache backend
docker-compose -f docker-compose.yml build --no-cache client
# Expected: Images built successfully

# 4.3 Tag Images for Production
echo -e "\n=== Step 4.3: Tag Images ==="
docker tag warungin-backend:latest warungin-backend:v1.0.0-prod
docker tag warungin-client:latest warungin-client:v1.0.0-prod
# Push to registry if using one:
# docker push registry.example.com/warungin-backend:v1.0.0-prod

# 4.4 Start New Deployment
echo -e "\n=== Step 4.4: Start New Deployment ==="
docker-compose -f docker-compose.yml up -d backend client nginx redis
docker-compose -f docker-compose.monitoring.yml up -d prometheus grafana alertmanager

# Expected: All services starting
docker-compose -f docker-compose.yml ps
docker-compose -f docker-compose.monitoring.yml ps

# 4.5 Wait for Services to be Healthy
echo -e "\n=== Step 4.5: Wait for Services ==="
for i in {1..60}; do
  if curl -s http://localhost:3000/health | grep -q "ok"; then
    echo "✓ Backend is healthy"
    break
  fi
  echo "Waiting... ($i/60)"
  sleep 5
done

echo -e "\n=== Build & Deploy Complete ==="
```

### Step 5: Production Verification (30 minutes)
```bash
#!/bin/bash

echo "=== PHASE 33: PRODUCTION VERIFICATION ==="

BASE_URL="https://192.168.1.101:3000"
TOKEN=""

# 5.1 Health Check
echo -e "\n=== Step 5.1: Health Check ==="
curl -s $BASE_URL/health | jq .
# Expected: { "status": "ok", "timestamp": "...", "uptime": "..." }

# 5.2 Authentication
echo -e "\n=== Step 5.2: Authentication Test ==="
AUTH_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@warungin.com","password":"AdminPassword123"}')

TOKEN=$(echo $AUTH_RESPONSE | jq -r '.token')
echo "Token obtained: ${TOKEN:0:20}..."

# 5.3 API Endpoints Test
echo -e "\n=== Step 5.3: API Endpoints Test ==="
curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/api/stores | jq '.length'
# Expected: Number of stores

curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/api/users | jq '.length'
# Expected: Number of users

curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/api/transactions | jq '.length'
# Expected: Number of transactions

# 5.4 Database Connectivity
echo -e "\n=== Step 5.4: Database Connectivity ==="
curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/api/db/status | jq .
# Expected: { "database": "connected", "tables": 30, ... }

# 5.5 Performance Baseline
echo -e "\n=== Step 5.5: Performance Baseline ==="
ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" $BASE_URL/api/stores
# Expected: Response time <200ms, success rate 100%

# 5.6 Monitoring Check
echo -e "\n=== Step 5.6: Monitoring Check ==="
curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets | length'
# Expected: Prometheus targets up

curl -s http://localhost:3001/api/datasources | jq '.length'
# Expected: Grafana datasources configured

# 5.7 Log Verification
echo -e "\n=== Step 5.7: Log Verification ==="
docker-compose -f docker-compose.yml logs backend | tail -20
# Expected: No critical errors

echo -e "\n=== Production Verification Complete ==="
```

### Step 6: Smoke Testing (30 minutes)
```bash
#!/bin/bash

echo "=== PHASE 33: SMOKE TESTING ==="

BASE_URL="https://192.168.1.101:3000"

# 6.1 Critical User Flows
echo -e "\n=== Step 6.1: Create Tenant ==="
TENANT=$(curl -s -X POST $BASE_URL/api/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test Tenant","email":"tenant@warungin.com","phone":"081234567890"}' | jq -r '.id')
echo "✓ Tenant created: $TENANT"

echo -e "\n=== Step 6.2: Create Store ==="
STORE=$(curl -s -X POST $BASE_URL/api/stores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"name\":\"Test Store\",\"phone\":\"081234567890\",\"address\":\"Test Address\",\"tenantId\":\"$TENANT\"}" | jq -r '.id')
echo "✓ Store created: $STORE"

echo -e "\n=== Step 6.3: Create Product ==="
PRODUCT=$(curl -s -X POST $BASE_URL/api/stores/$STORE/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test Product","price":50000,"sku":"TEST001"}' | jq -r '.id')
echo "✓ Product created: $PRODUCT"

echo -e "\n=== Step 6.4: Create Transaction ==="
TRANS=$(curl -s -X POST $BASE_URL/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"storeId\":\"$STORE\",\"tenantId\":\"$TENANT\"}" | jq -r '.id')
echo "✓ Transaction created: $TRANS"

echo -e "\n=== Step 6.5: Add Item to Transaction ==="
curl -s -X POST $BASE_URL/api/transactions/$TRANS/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"productId\":\"$PRODUCT\",\"quantity\":2,\"price\":50000}" | jq '.id'
echo "✓ Item added to transaction"

echo -e "\n=== Step 6.6: Process Payment ==="
curl -s -X POST $BASE_URL/api/transactions/$TRANS/payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"amount":100000,"method":"cash"}' | jq '.status'
echo "✓ Payment processed"

echo -e "\n=== Step 6.7: User Management ==="
USER=$(curl -s -X POST $BASE_URL/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test User","email":"testuser@warungin.com","role":"cashier","tenantId":"'$TENANT'"}' | jq -r '.id')
echo "✓ User created: $USER"

echo -e "\n=== Smoke Testing Complete ==="
echo "All critical workflows working ✓"
```

### Step 7: Rollback Procedure (Emergency)
```bash
#!/bin/bash

echo "=== PHASE 33: ROLLBACK PROCEDURE ==="
echo "WARNING: This should only be used if deployment failed critically!"

# 7.1 Stop Current Deployment
echo -e "\n=== Step 7.1: Stop Current Deployment ==="
docker-compose -f docker-compose.yml down --remove-orphans

# 7.2 Restore Database from Backup
echo -e "\n=== Step 7.2: Restore Database ==="
LATEST_BACKUP=$(ls -t /backups/db-*.sql.gz | head -1)
echo "Restoring from: $LATEST_BACKUP"
gunzip -c $LATEST_BACKUP | psql -h localhost -U postgres warungin_production

# 7.3 Revert Code
echo -e "\n=== Step 7.3: Revert Code ==="
cd /opt/warungin
git checkout HEAD~1  # Go back 1 commit
git log --oneline -1

# 7.4 Restart Previous Version
echo -e "\n=== Step 7.4: Restart Previous Version ==="
docker-compose -f docker-compose.yml pull
docker-compose -f docker-compose.yml up -d

# 7.5 Verify Rollback
echo -e "\n=== Step 7.5: Verify Rollback ==="
sleep 30
curl -s http://localhost:3000/health | jq .

echo -e "\n=== Rollback Complete ==="
echo "System restored to previous version"
```

---

## 3. Post-Deployment Monitoring

### 3.1 Real-Time Monitoring
```bash
#!/bin/bash

echo "=== PHASE 33: POST-DEPLOYMENT MONITORING ==="

# Watch logs in real-time
echo "=== Backend Logs ==="
docker-compose -f docker-compose.yml logs -f backend

# Or in another terminal:
echo "=== Monitor metrics ==="
watch -n 5 'curl -s http://localhost:9090/api/v1/query?query=http_requests_total | jq .'

# Or check Grafana dashboards:
echo "=== Check Grafana ==="
echo "Open: http://localhost:3001"
echo "Dashboard: Production Overview"
```

### 3.2 Key Metrics to Monitor
```
BACKEND METRICS:
├─ HTTP Response Time: <200ms
├─ Error Rate: <0.1%
├─ Requests/sec: >100
├─ CPU Usage: <60%
├─ Memory Usage: <70%
└─ Disk Usage: <50GB

DATABASE METRICS:
├─ Connection Count: <50
├─ Query Time (avg): <10ms
├─ Lock Wait Time: <1ms
├─ Cache Hit Rate: >90%
└─ Replication Lag: 0ms

APPLICATION METRICS:
├─ Transaction Success Rate: >99.5%
├─ Login Success Rate: >99%
├─ API Availability: >99.9%
└─ User Concurrent Sessions: <10,000
```

### 3.3 Alert Thresholds
```
CRITICAL ALERTS (Immediate action required):
├─ Error Rate > 5%
├─ Response Time > 1000ms
├─ CPU Usage > 90%
├─ Memory Usage > 90%
├─ Disk Usage > 90%
├─ Database Connection Pool Exhausted
└─ Service Down

HIGH ALERTS (Action within 1 hour):
├─ Error Rate > 1%
├─ Response Time > 500ms
├─ CPU Usage > 75%
├─ Memory Usage > 75%
├─ Disk Usage > 75%
├─ Database Connection Pool > 80%
└─ Cache Hit Rate < 80%

MEDIUM ALERTS (Action within 4 hours):
├─ Slow Query Rate > 10%
├─ Database Query Time > 50ms
├─ API Rate Limit Approaching
└─ Certificate Expiry < 7 Days
```

---

## 4. Deployment Timeline

```
Phase 33: FINAL PRODUCTION DEPLOYMENT TIMELINE
═══════════════════════════════════════════════

PRE-DEPLOYMENT (Week Before):
├─ [MON] Phase 32 QA Testing Complete
├─ [TUE] Fix Critical Issues
├─ [WED] Re-test Critical Fixes
├─ [THU] Final Security Audit
└─ [FRI] Team Preparation Meeting

DEPLOYMENT DAY (Scheduled):
├─ [00:00] Start: Pre-deployment Verification (15 min)
├─ [00:15] Setup: Production Environment (30 min)
├─ [00:45] Database: Migration & Backup (20 min)
├─ [01:05] Deploy: Build & Docker Deployment (30 min)
├─ [01:35] Verify: Production Health Checks (30 min)
├─ [02:05] Test: Smoke Testing (30 min)
├─ [02:35] Monitor: Live Monitoring (1 hour)
└─ [03:35] Complete: Deployment Finished ✓

POST-DEPLOYMENT (After):
├─ [First 24h] Intensive Monitoring
├─ [First 7 days] Performance Baseline Collection
└─ [First 30 days] Stability Verification
```

---

## 5. Success Criteria

### 5.1 Deployment Success
```
✅ All services running without errors
✅ Database migrations completed successfully
✅ All endpoints responding correctly
✅ Health checks passing (>99% uptime)
✅ No critical errors in logs
✅ Response time <200ms (95th percentile)
✅ Zero data loss verified
✅ Backup & recovery tested
```

### 5.2 Application Health
```
✅ User login working
✅ Store operations working
✅ Transaction processing working
✅ Report generation working
✅ Multi-tenant isolation verified
✅ Role-based access control verified
✅ Security headers present
✅ SSL/TLS working correctly
```

### 5.3 Infrastructure Health
```
✅ Backend CPU: <50%
✅ Backend Memory: <60%
✅ Database CPU: <40%
✅ Database Memory: <50%
✅ Network latency: <10ms
✅ Disk I/O: Normal
✅ Network bandwidth: <50% utilized
```

---

## 6. Contact & Escalation

### Deployment Team
```
Lead: DevOps Engineer
├─ Phone: +62-xxx-xxxx-xxxx
└─ Email: devops@warungin.com

Database Admin
├─ Phone: +62-xxx-xxxx-xxxx
└─ Email: dba@warungin.com

Security Team Lead
├─ Phone: +62-xxx-xxxx-xxxx
└─ Email: security@warungin.com

CTO/Tech Lead
├─ Phone: +62-xxx-xxxx-xxxx
└─ Email: cto@warungin.com
```

### Support Channels
```
Slack: #production-deployment
Email: production-team@warungin.com
War Room: https://zoom.us/my/warungin-deployment
```

---

## 7. Sign-off

**Phase 33 Status**: DEPLOYMENT READY ✅

- [x] All prerequisites verified
- [x] Database backup complete
- [x] Monitoring configured
- [x] Rollback plan documented
- [x] Team notified
- [x] Go/No-Go decision framework ready

**Authorized by**: Deployment Lead  
**Date**: 2024  
**Version**: 1.0 - Ready for Production Deployment

---

**NEXT PHASE**: Phase 34 - Post-Deployment Verification & Monitoring (Start after 24h monitoring window)
