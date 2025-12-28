# PHASE 2: DEPLOYMENT EXECUTION CHECKLIST
**Status: READY TO EXECUTE**
**Date: 2025-12-23**
**Timeline: 12 Days**

---

## 📋 Pre-Deployment Verification (1 Hour)

### Step 1: Verify All Tests Pass
```bash
# Test 1: Integration Tests
npm test -- tests/integration/offline-order-flow.fixed.test.ts --run

# Expected: ✅ 19 passed | 14 skipped | Exit Code: 0
```

**Checklist:**
- [ ] Integration tests: 19 passed, 14 skipped
- [ ] No errors in output
- [ ] Exit code: 0

```bash
# Test 2: Security Tests  
npm test -- tests/security/security-audit.fixed.test.ts --run

# Expected: ✅ 30 passed | 21 skipped | Exit Code: 0
```

**Checklist:**
- [ ] Security tests: 30 passed, 21 skipped
- [ ] No errors in output
- [ ] Exit code: 0

```bash
# Test 3: Unit Tests
npm test -- tests/unit/discount-calculation.test.ts --run

# Expected: ✅ 26 passed | Exit Code: 0
```

**Checklist:**
- [ ] Unit tests: 26 passed
- [ ] No errors in output
- [ ] Exit code: 0

### Step 2: Verify Code Compilation
```bash
npm run build
# or
npx tsc --noEmit
```

**Checklist:**
- [ ] No TypeScript errors
- [ ] No compilation warnings
- [ ] Build successful

### Step 3: Verify Backend Runs
```bash
npm run dev
# Wait 10 seconds, then check API availability
```

**Checklist:**
- [ ] Backend starts without errors
- [ ] API responds on http://localhost:3000
- [ ] Database connection successful
- [ ] No critical errors in logs

---

## 🚀 PHASE 1: STAGING DEPLOYMENT (Days 1-4)

### Day 1-2: Setup & Preparation

#### Step 1.1: Create Staging Environment
```bash
# SSH into staging server
ssh admin@staging.warungin.example.com

# Create deployment directory
mkdir -p /opt/warungin/{app,backup,logs}
cd /opt/warungin/app

# Clone latest code
git clone https://github.com/warungin/saas-pos.git .
git checkout production-ready-v1.0
```

**Checklist:**
- [ ] Staging server accessible via SSH
- [ ] Code cloned successfully
- [ ] Correct branch checked out
- [ ] Backup directory created

#### Step 1.2: Setup Environment Variables
```bash
# Create .env.staging file
cat > /opt/warungin/app/.env << 'EOF'
NODE_ENV=staging
DATABASE_URL=postgresql://user:password@staging-db:5432/warungin_staging
REDIS_URL=redis://staging-redis:6379
API_PORT=3000
FRONTEND_URL=https://staging.warungin.example.com
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRY=24h
EOF
```

**Checklist:**
- [ ] Environment variables set
- [ ] Database credentials correct
- [ ] JWT secret generated
- [ ] Frontend URL configured

#### Step 1.3: Install Dependencies
```bash
cd /opt/warungin/app
npm install --production

# Backend dependencies
npm install

# Frontend dependencies
cd client && npm install && cd ..
```

**Checklist:**
- [ ] npm install successful
- [ ] No critical vulnerabilities
- [ ] All dependencies installed
- [ ] No permission errors

### Day 2-3: Database & Infrastructure

#### Step 2.1: Database Migration
```bash
# Run Prisma migrations
npx prisma migrate deploy --skip-generate

# Seed test data
npx prisma db seed
```

**Checklist:**
- [ ] Migrations executed successfully
- [ ] No migration errors
- [ ] Database schema updated
- [ ] Seed data loaded

#### Step 2.2: Setup Database Backups
```bash
# Create backup script
cat > /opt/warungin/backup/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/warungin/backup"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > $BACKUP_DIR/warungin_$DATE.sql
gzip $BACKUP_DIR/warungin_$DATE.sql
# Keep last 7 backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
EOF

chmod +x /opt/warungin/backup/backup.sh

# Schedule daily backups (cron)
(crontab -l; echo "0 2 * * * /opt/warungin/backup/backup.sh") | crontab -
```

**Checklist:**
- [ ] Backup script created
- [ ] Backup script executable
- [ ] Cron job scheduled
- [ ] Test backup runs successfully

#### Step 2.3: Setup Monitoring
```bash
# Create monitoring directory
mkdir -p /opt/warungin/monitoring

# Start Prometheus & Grafana (if using Docker)
docker-compose -f docker-compose.monitoring.yml up -d

# Verify services running
docker-compose ps
```

**Checklist:**
- [ ] Monitoring stack running
- [ ] Prometheus collecting metrics
- [ ] Grafana accessible
- [ ] Dashboards configured

### Day 3-4: Build & Deploy

#### Step 3.1: Build Application
```bash
cd /opt/warungin/app

# Build frontend
cd client && npm run build && cd ..

# Build backend
npm run build

# Verify builds
ls -la dist/
ls -la client/dist/
```

**Checklist:**
- [ ] Frontend build successful
- [ ] Backend build successful
- [ ] No build errors
- [ ] Output files present

#### Step 3.2: Setup PM2 Process Manager
```bash
# Install PM2 globally
npm install -g pm2

# Create PM2 config
cat > /opt/warungin/app/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'warungin-api',
      script: './dist/server.js',
      instances: 4,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'staging'
      },
      error_file: '/opt/warungin/logs/error.log',
      out_file: '/opt/warungin/logs/out.log',
      log_file: '/opt/warungin/logs/combined.log',
      time: true
    }
  ]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**Checklist:**
- [ ] PM2 installed
- [ ] ecosystem.config.js created
- [ ] App started with PM2
- [ ] PM2 startup configured

#### Step 3.3: Setup Nginx Reverse Proxy
```bash
# Create Nginx config
cat > /etc/nginx/sites-available/warungin-staging << 'EOF'
upstream warungin_api {
  server localhost:3000;
  keepalive 64;
}

server {
  listen 80;
  server_name staging.warungin.example.com;
  
  # Redirect to HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name staging.warungin.example.com;
  
  ssl_certificate /etc/letsencrypt/live/staging.warungin.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/staging.warungin.example.com/privkey.pem;
  
  # Frontend
  location / {
    root /opt/warungin/app/client/dist;
    try_files $uri $uri/ /index.html;
  }
  
  # Backend API
  location /api {
    proxy_pass http://warungin_api;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_buffering off;
  }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/warungin-staging /etc/nginx/sites-enabled/

# Test & reload
nginx -t
systemctl reload nginx
```

**Checklist:**
- [ ] Nginx config created
- [ ] Config syntax valid
- [ ] Site enabled
- [ ] Nginx reloaded
- [ ] HTTPS certificate installed

#### Step 3.4: Health Check
```bash
# Test API endpoint
curl -X GET https://staging.warungin.example.com/api/health \
  -H "Authorization: Bearer test-token"

# Expected response: { "status": "ok" }

# Test Frontend
curl -s https://staging.warungin.example.com | head -20
```

**Checklist:**
- [ ] API responds successfully
- [ ] Health check returns OK
- [ ] Frontend loads successfully
- [ ] No SSL errors

---

## 🔐 PHASE 2: SECURITY & LOAD TESTING (Days 5-7)

### Day 5: Security Validation

#### Step 4.1: Run Security Tests
```bash
npm test -- tests/security/security-audit.fixed.test.ts --run
```

**Checklist:**
- [ ] All security tests pass
- [ ] Authentication tests pass
- [ ] Authorization tests pass
- [ ] Data isolation tests pass
- [ ] Input validation tests pass
- [ ] No security warnings

#### Step 4.2: Security Audit
```bash
# Run OWASP dependency check
npm audit

# Scan for vulnerabilities
npx snyk test

# Check SSL/TLS
testssl.sh https://staging.warungin.example.com
```

**Checklist:**
- [ ] npm audit shows no critical issues
- [ ] Snyk test passes
- [ ] SSL/TLS configuration good
- [ ] No known vulnerabilities

#### Step 4.3: Verify Data Protection
```bash
# Check password hashing
# Check data encryption
# Verify CORS settings
# Check rate limiting
```

**Checklist:**
- [ ] Passwords properly hashed
- [ ] Sensitive data encrypted
- [ ] CORS configured correctly
- [ ] Rate limiting active

### Day 6-7: Load Testing

#### Step 5.1: Setup K6 Load Test
```bash
# Install K6
curl https://dl.k6.io/key.gpg | apt-key add -
echo "deb https://dl.k6.io/deb stable main" | tee /etc/apt/sources.list.d/k6.list
apt-get update && apt-get install k6

# Run baseline load test
k6 run load-test-stock.js --vus 10 --duration 30s
```

**Expected Results:**
- Max response time: < 500ms
- Error rate: < 1%
- Throughput: > 100 requests/sec

**Checklist:**
- [ ] K6 installed
- [ ] Baseline test passes
- [ ] Performance acceptable
- [ ] No critical errors

#### Step 5.2: Stress Test
```bash
# Gradual load increase
k6 run - <<EOF
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m30s', target: 100 },
    { duration: '30s', target: 0 },
  ],
};

export default function () {
  let response = http.get('https://staging.warungin.example.com/api/health');
  check(response, {
    'status is 200': (r) => r.status === 200,
  });
}
EOF
```

**Checklist:**
- [ ] System handles 100 concurrent users
- [ ] Response times acceptable
- [ ] No system crashes
- [ ] Database handles load

#### Step 5.3: Performance Analysis
```bash
# Check system resources during test
top -b -n 1
free -h
df -h
```

**Checklist:**
- [ ] CPU usage < 80%
- [ ] Memory usage < 85%
- [ ] Disk usage < 90%
- [ ] No I/O bottlenecks

---

## 🚀 PHASE 3: UAT & VALIDATION (Days 8-10)

### Day 8: User Acceptance Testing Setup

#### Step 6.1: Create UAT Environment
- [ ] User account created for UAT
- [ ] Test data prepared
- [ ] Documentation provided to users
- [ ] Test scenarios documented

#### Step 6.2: Test Scenarios
```
Scenario 1: POS Operations
- [ ] Create order offline
- [ ] Sync to server
- [ ] View order history
- [ ] Generate receipt

Scenario 2: Stock Management
- [ ] Update product stock
- [ ] View inventory report
- [ ] Verify stock calculations

Scenario 3: Reports
- [ ] Generate daily sales report
- [ ] Export to CSV
- [ ] View transaction history

Scenario 4: Multi-user
- [ ] Multiple users create orders
- [ ] Test concurrent access
- [ ] Verify data isolation
```

#### Step 6.3: Bug Tracking
```
If issues found:
1. Document issue clearly
2. Record in issue tracker
3. Assess priority (critical/high/medium/low)
4. Schedule fix for hotfix or next release
```

### Day 9-10: User Feedback & Fixes

#### Step 7.1: Collect Feedback
- [ ] Gather user feedback
- [ ] Document feature requests
- [ ] Record usability issues
- [ ] Performance observations

#### Step 7.2: Hotfixes (if needed)
```bash
# If critical issues found
git checkout -b hotfix/issue-name
# Make fix
git push origin hotfix/issue-name
# Create pull request for review
# After approval and tests pass
git merge hotfix/issue-name into main
# Redeploy to staging
```

---

## 🌍 PHASE 4: PRODUCTION DEPLOYMENT (Days 11-12)

### Day 11: Production Preparation

#### Step 8.1: Pre-Production Checklist
- [ ] All staging tests passed
- [ ] Security audit completed
- [ ] Load testing successful
- [ ] UAT completed and approved
- [ ] Database backups verified
- [ ] Rollback procedure documented
- [ ] Monitoring configured
- [ ] Team briefed on deployment

#### Step 8.2: Production Database Setup
```bash
# Backup existing production database (if any)
pg_dump $PRODUCTION_DATABASE_URL > /backup/warungin_prod_$(date +%Y%m%d_%H%M%S).sql

# Run migrations on production
npx prisma migrate deploy

# Verify schema
psql $PRODUCTION_DATABASE_URL -c "\dt"
```

**Checklist:**
- [ ] Production database backup created
- [ ] Migrations executed
- [ ] Schema verified
- [ ] Rollback backup secured

#### Step 8.3: Production Deployment
```bash
# SSH into production server
ssh admin@api.warungin.example.com

# Clone production branch
cd /opt/warungin/app
git fetch origin
git checkout main
git pull origin main

# Install dependencies
npm install --production

# Build
npm run build

# Stop old version
pm2 stop warungin-api

# Start new version
pm2 start ecosystem.config.js

# Verify deployment
curl https://api.warungin.example.com/health
```

**Checklist:**
- [ ] Code pulled successfully
- [ ] Dependencies installed
- [ ] Build completed
- [ ] Old version stopped
- [ ] New version started
- [ ] Health check passes

### Day 12: Production Verification & Monitoring

#### Step 9.1: Smoke Testing
```bash
# Test basic functionality
curl -X POST https://api.warungin.example.com/api/orders \
  -H "Content-Type: application/json" \
  -d '{"items": []}'

# Test health endpoint
curl https://api.warungin.example.com/api/health

# Test database
curl https://api.warungin.example.com/api/products
```

**Checklist:**
- [ ] API responds
- [ ] Health check passes
- [ ] Database queries work
- [ ] No error responses

#### Step 9.2: Monitor Metrics
```bash
# Check Grafana dashboard
# Check logs for errors
tail -f /opt/warungin/logs/error.log

# Monitor system resources
watch -n 1 'ps aux | grep node'

# Check PM2 status
pm2 monit
```

**Checklist:**
- [ ] Grafana dashboard showing normal metrics
- [ ] No error logs
- [ ] CPU/Memory normal
- [ ] All PM2 processes running

#### Step 9.3: User Validation
- [ ] First customers can login
- [ ] Orders process successfully
- [ ] No critical bugs reported
- [ ] Performance acceptable

#### Step 9.4: Post-Deployment
```bash
# Enable monitoring alerts
# Document any issues found
# Prepare incident response plan
# Schedule post-deployment review
```

**Checklist:**
- [ ] Monitoring alerts active
- [ ] Documentation updated
- [ ] Team aware of any issues
- [ ] Review meeting scheduled

---

## 📊 MONITORING & SUCCESS CRITERIA

### Performance Metrics
- Response time: < 500ms (p95)
- Error rate: < 0.1%
- Uptime: > 99.5%
- Throughput: > 100 requests/sec

### System Metrics
- CPU usage: < 70%
- Memory usage: < 75%
- Disk usage: < 80%
- Database connections: < 80% of max

### Business Metrics
- Users can create orders offline
- Orders sync successfully
- Reports generate correctly
- Multi-tenant isolation maintained

---

## 🆘 ROLLBACK PROCEDURE (If Needed)

### Quick Rollback
```bash
# Stop current version
pm2 stop warungin-api

# Checkout previous version
git checkout main~1

# Rebuild and restart
npm run build
pm2 start ecosystem.config.js

# Restore from database backup
pg_restore -d warungin_prod /backup/warungin_prod_*.sql
```

**Checklist:**
- [ ] Previous version running
- [ ] Health check passes
- [ ] Database restored
- [ ] Users notified

---

## ✅ SIGN-OFF CHECKLIST

- [ ] Pre-deployment tests all pass
- [ ] Staging deployment successful
- [ ] Security audit complete
- [ ] Load testing successful
- [ ] UAT approved
- [ ] Production database ready
- [ ] Monitoring configured
- [ ] Team trained
- [ ] Deployment procedure reviewed
- [ ] Rollback plan confirmed
- [ ] Production deployment complete
- [ ] Smoke tests pass
- [ ] Monitoring shows normal metrics
- [ ] Users report successful use
- [ ] Post-deployment review scheduled

---

**Status:** READY FOR EXECUTION
**Timeline:** 12 Days
**Approval:** Pending DevOps Team
**Next Step:** Execute Day 1-2 (Setup & Preparation)
