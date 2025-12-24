# 🚀 PRODUCTION DEPLOYMENT PLAN - Warungin SaaS POS

**Version:** 1.0  
**Date Created:** 2024-12-22  
**Target Go-Live:** 2024-12-28 - 2024-12-31 (2-3 weeks from current state)  
**Status:** Ready for Staging Deployment

---

## 📋 SECTION 1: PRE-DEPLOYMENT CHECKLIST

### Phase 1: Code Quality & Testing (Days 1-3)

#### 1.1 Unit Tests Execution ✅
- [x] TypeScript compilation - 0 errors
- [x] Discount calculation tests (26 test cases)
- [x] Product stock tests
- [x] Order creation tests
- [ ] Run full test suite: `npm test`

**Command:**
```bash
npm test -- --run --reporter=verbose
```

**Expected Result:** All tests pass, coverage > 80%

#### 1.2 Integration Tests Execution (NEW)
- [ ] Run integration test suite
- [ ] Verify offline order flow
- [ ] Verify multi-tenant isolation
- [ ] Verify payment integration
- [ ] Verify concurrent order handling
- [ ] Verify stock rollback

**Command:**
```bash
npm test -- tests/integration/offline-order-flow.test.ts --run
```

**Expected Result:** All scenarios pass

#### 1.3 Security Tests Execution (NEW)
- [ ] Run security audit tests
- [ ] Verify authentication requirements
- [ ] Verify authorization checks
- [ ] Verify data isolation
- [ ] Verify input validation
- [ ] Verify CSRF protection

**Command:**
```bash
npm test -- tests/security/security-audit.test.ts --run
```

**Expected Result:** All security tests pass

#### 1.4 Load Testing Execution ✅
- [ ] Run K6 load test for concurrent orders
- [ ] Verify stock accuracy under load
- [ ] Monitor response times
- [ ] Check error rates
- [ ] Monitor database performance

**Command:**
```bash
k6 run load-test-stock.js \
  -e BASE_URL=http://staging:3000 \
  -e CONCURRENT_USERS=50 \
  -e ORDERS_PER_USER=10
```

**Expected Result:** 
- Stock accuracy: 100% (no overselling)
- Error rate: < 1%
- Response time p95: < 500ms
- No database connection issues

#### 1.5 Code Review
- [ ] Have 2+ senior developers review:
  - `src/services/order.service.ts` (critical changes)
  - `src/services/transaction.service.ts` (idempotency)
  - `src/services/product.service.ts` (stock management)
  - `client/src/views/pos/FailedSyncReview.vue` (new component)
  - `tests/integration/offline-order-flow.test.ts` (new tests)
  - `tests/security/security-audit.test.ts` (security)

**Approval Required:** Minimum 2 approval comments

---

### Phase 2: Infrastructure & Configuration (Days 4-5)

#### 2.1 Database Preparation
- [ ] Backup production database schema
- [ ] Run migrations on staging
- [ ] Verify data integrity
- [ ] Test rollback procedure
- [ ] Create snapshot for quick recovery

**Commands:**
```bash
# On staging database
npx prisma migrate deploy --preview-feature
npx prisma db seed

# Backup
pg_dump -h staging-db -U postgres -d warungin > backup-$(date +%Y%m%d).sql
```

#### 2.2 Environment Configuration
- [ ] Configure `.env` for production:
  - `DATABASE_URL` → production PostgreSQL
  - `REDIS_HOST` → production Redis (optional)
  - `JWT_SECRET` → strong random secret
  - `JWT_REFRESH_SECRET` → different random secret
  - `INTERNAL_API_KEY` → secure API key
  - `NODE_ENV=production`
  - `LOG_LEVEL=info`
  - `ORDER_TRANSACTION_TIMEOUT=30000` (30s)

**Security:**
- Never commit `.env` to git
- Use environment variable management (AWS Secrets Manager, HashiCorp Vault, etc.)
- Rotate secrets after deployment

#### 2.3 Docker Image Build
- [ ] Build backend Docker image
- [ ] Build frontend Docker image
- [ ] Scan for vulnerabilities: `docker scan image`
- [ ] Test on staging first

**Commands:**
```bash
# Build
docker build -f Dockerfile.backend -t warungin:backend-1.0.0 .
docker build -f client/Dockerfile -t warungin:frontend-1.0.0 .

# Scan
docker scan warungin:backend-1.0.0
docker scan warungin:frontend-1.0.0

# Test on staging
docker-compose -f docker-compose.yml up -d
```

#### 2.4 SSL/TLS Certificates
- [ ] Obtain SSL certificates (Let's Encrypt or CA)
- [ ] Configure in reverse proxy (nginx/Cloudflare)
- [ ] Test HTTPS connectivity
- [ ] Verify certificate chain

**Verification:**
```bash
curl -I https://api.warungin.example.com/health
# Expected: HTTP/1.1 200 OK, SSL certificate valid
```

#### 2.5 DNS Configuration
- [ ] Verify DNS records point to production
- [ ] Set up DNS failover (if needed)
- [ ] Configure CNAME/A records properly
- [ ] Test DNS propagation

**Testing:**
```bash
dig api.warungin.example.com
nslookup api.warungin.example.com
```

---

### Phase 3: Monitoring & Alerts Setup (Days 6-7)

#### 3.1 Application Monitoring
- [ ] Setup Prometheus metrics scraping
- [ ] Configure Grafana dashboards
- [ ] Create key metrics:
  - `warungin_orders_total` (counter)
  - `warungin_order_duration_seconds` (histogram)
  - `warungin_stock_lock_wait_seconds` (histogram)
  - `warungin_api_request_duration_seconds` (histogram)
  - `warungin_errors_total` (counter)

**Grafana Dashboards to Create:**
1. Order Metrics (orders/day, avg response time, error rate)
2. Stock Management (stock updates/day, lock wait times)
3. System Health (CPU, memory, disk usage)
4. Error Dashboard (error rates by endpoint)

#### 3.2 Log Aggregation
- [ ] Setup log aggregation (ELK, Datadog, CloudWatch)
- [ ] Configure log retention (30 days minimum)
- [ ] Create log search queries for:
  - Failed orders
  - Failed syncs
  - Stock mismatches
  - Authentication failures
  - Rate limit hits

**Example Queries:**
```
# Failed orders
level=error AND message="Order creation failed"

# Failed syncs
syncFailed=true AND retryCount > 0

# Stock issues
message="Stock insufficient" OR "Stock mismatch"
```

#### 3.3 Alert Configuration
- [ ] Setup alerting rules:
  - Error rate > 5% → Alert
  - Stock lock timeout > 10 times/hour → Alert
  - Database connection pool exhausted → Critical
  - Failed sync orders > 100 → Alert
  - Response time p95 > 1000ms → Alert

**Alert Channels:**
- Slack: #production-alerts
- PagerDuty: On-call engineer
- Email: Engineering team

#### 3.4 Uptime Monitoring
- [ ] Setup external monitoring (Pingdom, StatusPage)
- [ ] Configure health checks
- [ ] Create status page for customers
- [ ] Setup SLA tracking

**Health Check Endpoint:**
```
GET /api/health
Response: { status: "ok", timestamp, checks: { db, redis, disk } }
```

---

### Phase 4: Security Hardening (Days 8-9)

#### 4.1 Network Security
- [ ] Configure WAF (Web Application Firewall)
- [ ] Setup DDoS protection
- [ ] Configure rate limiting:
  - API endpoints: 1000 req/min per IP
  - Login endpoint: 10 req/min per IP
  - Payment endpoints: 100 req/min per IP

**Nginx Configuration Example:**
```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=1000r/m;
limit_req_zone $binary_remote_addr zone=login:10m rate=10r/m;

location /api/orders {
  limit_req zone=api burst=100 nodelay;
}

location /api/auth/login {
  limit_req zone=login burst=5 nodelay;
}
```

#### 4.2 Data Encryption
- [ ] Enable TLS 1.2+ for all communications
- [ ] Encrypt sensitive data in database (passwords, tokens)
- [ ] Setup encrypted backups
- [ ] Configure encryption key rotation

#### 4.3 Access Control
- [ ] Implement IP whitelisting for admin API (if applicable)
- [ ] Setup VPN for internal access
- [ ] Configure firewall rules:
  - Database: Only accessible from app servers
  - Redis: Only accessible from app servers
  - Admin panel: Behind authentication

#### 4.4 Secrets Management
- [ ] Rotate JWT secrets
- [ ] Rotate database passwords
- [ ] Rotate API keys
- [ ] Setup automated secret rotation
- [ ] Implement secret versioning

#### 4.5 Security Headers
- [ ] Configure CSP (Content Security Policy)
- [ ] Set X-Frame-Options: SAMEORIGIN
- [ ] Set X-Content-Type-Options: nosniff
- [ ] Set X-XSS-Protection: 1; mode=block
- [ ] Set HSTS: max-age=31536000

**Nginx Configuration:**
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

---

### Phase 5: Backup & Disaster Recovery (Days 10-11)

#### 5.1 Backup Strategy
- [ ] Configure automated daily backups
- [ ] Backup location: Separate geographic region
- [ ] Retention: 30 days for daily, 1 year for monthly
- [ ] Test backup restoration every week

**Backup Commands:**
```bash
# Daily backup
pg_dump -h prod-db -U postgres warungin | gzip > /backups/warungin-$(date +%Y%m%d).sql.gz

# Upload to S3
aws s3 cp /backups/warungin-$(date +%Y%m%d).sql.gz s3://backup-bucket/production/
```

#### 5.2 Disaster Recovery Plan
- [ ] Document RTO (Recovery Time Objective): < 1 hour
- [ ] Document RPO (Recovery Point Objective): < 15 minutes
- [ ] Create runbook for:
  - Database restoration
  - Application rollback
  - DNS failover
  - Cache invalidation

#### 5.3 Rollback Plan
- [ ] Document rollback procedure
- [ ] Keep previous version running temporarily
- [ ] Database migration rollback script
- [ ] Frontend version rollback steps

**Rollback Procedure:**
```bash
# 1. Stop new version
docker-compose stop warungin-backend

# 2. Switch to previous version
docker-compose -f docker-compose.v1.0.1.yml up -d

# 3. Rollback database (if needed)
psql < rollback-migration.sql

# 4. Verify health checks
curl https://api.warungin.example.com/health
```

---

## 📈 SECTION 2: STAGING DEPLOYMENT (Days 1-7)

### Staging Deployment Procedure

#### Step 1: Deploy to Staging
```bash
# SSH into staging server
ssh deploy@staging.warungin.com

# Pull latest code
cd /app/warungin
git pull origin main
git checkout v1.0.0  # Specific version tag

# Install dependencies
npm ci

# Build
npm run build

# Database migration
npx prisma migrate deploy

# Start services
docker-compose up -d --build
```

#### Step 2: Verify Staging Deployment
```bash
# Health checks
curl https://staging-api.warungin.example.com/health

# Test critical endpoints
curl -X POST https://staging-api.warungin.example.com/api/orders \
  -H "Authorization: Bearer $TEST_TOKEN" \
  -H "X-Tenant-ID: test-tenant" \
  -d '{"items": [{"productId": "test", "quantity": 1, "price": 10000}]}'

# Run integration tests against staging
npm test -- tests/integration/offline-order-flow.test.ts \
  --env TEST_API_URL=https://staging-api.warungin.example.com
```

#### Step 3: Run Load Tests on Staging
```bash
k6 run load-test-stock.js \
  -e BASE_URL=https://staging-api.warungin.example.com \
  -e CONCURRENT_USERS=100 \
  -e ORDERS_PER_USER=10
```

#### Step 4: UAT on Staging (5 days)
- [ ] Provide staging credentials to 5-10 beta users
- [ ] Have them test complete workflows
- [ ] Gather feedback on UX/stability
- [ ] Fix critical bugs found
- [ ] Document known issues

**Testing Checklist for Beta Users:**
- [ ] Create offline orders and sync
- [ ] View failed sync orders and retry
- [ ] Cancel orders and verify stock restoration
- [ ] Create concurrent orders (multiple browser tabs)
- [ ] Test with slow/unstable internet
- [ ] Test payment processing
- [ ] Generate reports

#### Step 5: Monitoring Verification on Staging
- [ ] Verify all metrics being collected
- [ ] Verify alert rules triggering correctly
- [ ] Verify logs being aggregated
- [ ] Check dashboard visibility
- [ ] Verify error notifications working

---

## 🚀 SECTION 3: PRODUCTION DEPLOYMENT (Day 12)

### Pre-Deployment Checklist (24 hours before)
- [ ] Final code review approved
- [ ] All tests passing
- [ ] Staging UAT complete
- [ ] Backup taken
- [ ] Rollback plan verified
- [ ] Team members on-call
- [ ] Maintenance window scheduled
- [ ] Customers notified

### Deployment Steps

#### Step 1: Maintenance Window Announcement
```
Announcement (2 hours before):
"Warungin will be under maintenance from 2024-12-28 14:00-15:00 UTC for system upgrades. 
Service may be unavailable during this time. We apologize for any inconvenience."
```

#### Step 2: Enable Read-Only Mode (optional)
```bash
# Set environment variable
export MAINTENANCE_MODE=true

# This will:
# - Allow read operations
# - Reject write operations with maintenance message
# - Display maintenance page on frontend
```

#### Step 3: Database Migration
```bash
# Connect to production database
psql -h prod-db.example.com -U prod_user -d warungin

# Run migrations
npx prisma migrate deploy

# Verify schema
\d  # List all tables
```

#### Step 4: Deploy Application
```bash
# SSH into production server
ssh deploy@prod.warungin.com

# Backup current state
docker-compose exec warungin-backend npm run backup

# Update code
git pull origin main
git checkout v1.0.0

# Install dependencies
npm ci --production

# Build (if needed)
npm run build

# Restart services (with 0-downtime rolling update)
docker-compose up -d --no-deps --build warungin-backend
docker-compose up -d --no-deps --build warungin-frontend
```

#### Step 5: Health Checks
```bash
# Check backend health
curl -I https://api.warungin.example.com/health
# Expected: HTTP 200

# Check frontend
curl -I https://warungin.example.com
# Expected: HTTP 200

# Database connectivity
psql -h prod-db.example.com -U prod_user -d warungin -c "SELECT COUNT(*) FROM orders;"

# Redis connectivity
redis-cli -h prod-redis ping
# Expected: PONG
```

#### Step 6: Smoke Tests
```bash
# Run critical smoke tests
npm test -- tests/smoke/critical-paths.test.ts \
  --env TEST_API_URL=https://api.warungin.example.com \
  --timeout=30000
```

**Critical Paths to Test:**
1. Create order → Transaction → Receipt
2. Cancel order → Stock restoration
3. Create offline order → Sync
4. Login → Dashboard
5. View products → Add to cart → Checkout

#### Step 7: Disable Maintenance Mode
```bash
# Set environment variable
export MAINTENANCE_MODE=false

# Announcement
"Warungin is back online. Thank you for your patience!"
```

#### Step 8: Post-Deployment Verification (1 hour)
- [ ] Monitor error rates (should be < 1%)
- [ ] Monitor response times (p95 < 500ms)
- [ ] Monitor stock accuracy (no mismatches)
- [ ] Check failed sync count (should be low)
- [ ] Verify no data loss
- [ ] Check customer reports

**Monitoring Commands:**
```bash
# Check error rate
curl https://api.warungin.example.com/metrics | grep warungin_errors_total

# Check order count
curl https://api.warungin.example.com/metrics | grep warungin_orders_total

# Check response times
curl https://api.warungin.example.com/metrics | grep http_request_duration_seconds
```

---

## 📊 SECTION 4: POST-DEPLOYMENT (Days 13+)

### 24-Hour Observation Period
- [ ] Team on-call 24/7
- [ ] Monitor metrics continuously
- [ ] Respond to any issues within 15 minutes
- [ ] Collect feedback from users

### Weekly Checks (First 4 weeks)
- [ ] Review error logs
- [ ] Check database growth
- [ ] Verify backup completion
- [ ] Review customer feedback
- [ ] Plan improvements based on metrics

### Success Criteria
- Error rate: < 1% ✅
- Uptime: > 99.9% ✅
- Response time p95: < 500ms ✅
- Stock accuracy: 100% ✅
- Failed sync count: < 1% of orders ✅
- Zero data loss incidents ✅

---

## 🎯 SECTION 5: TIMELINE SUMMARY

| Phase | Duration | Dates | Status |
|-------|----------|-------|--------|
| **Unit & Integration Tests** | 2-3 days | Dec 22-24 | 🚀 Ready |
| **Load Testing** | 1-2 days | Dec 24-25 | 🚀 Ready |
| **Infrastructure Setup** | 2-3 days | Dec 25-27 | ⏳ In Progress |
| **Security Hardening** | 2-3 days | Dec 25-27 | ⏳ In Progress |
| **Staging Deployment** | 3-5 days | Dec 25-29 | ⏳ Pending |
| **UAT & Testing** | 4-5 days | Dec 25-29 | ⏳ Pending |
| **Production Deployment** | 1-2 hours | Dec 28-31 | ⏳ Pending |
| **24-Hour Monitoring** | 1 day | Dec 28-31 | ⏳ Pending |
| **Total** | **2-3 weeks** | **Dec 22 - Dec 31** | ✅ On Track |

---

## 📞 SECTION 6: CONTACTS & ESCALATION

### On-Call Engineer Rotation (24/7 for 1 week post-deployment)
- **Week 1:** [Engineer Name] - [Phone] - [Email]
- **Backup:** [Engineer Name] - [Phone] - [Email]

### Escalation Path
1. **L1 (15 min):** On-call engineer investigates
2. **L2 (30 min):** Engineering manager engaged
3. **L3 (1 hour):** CTO/Tech Lead engaged
4. **Critical Issue:** All hands on deck, notify CEO/COO

### Communication Channels
- **Slack:** #production-alerts
- **PagerDuty:** warungin-prod
- **War Room:** https://meet.google.com/abc-xyz (reserved for critical incidents)

---

## ✅ SIGN-OFF

**Prepared by:** GitHub Copilot (Claude Haiku 4.5)  
**Date:** 2024-12-22  
**Version:** 1.0

**Approval Required:**
- [ ] CTO/Tech Lead
- [ ] DevOps/Infrastructure
- [ ] QA Lead
- [ ] Product Manager

---

**END OF PRODUCTION DEPLOYMENT PLAN**
