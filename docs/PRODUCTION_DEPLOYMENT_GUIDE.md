# PHASE 35 - PRODUCTION DEPLOYMENT GUIDE

**Status:** ✅ PRODUCTION READY  
**Date:** January 18, 2026  
**Version:** 1.0  
**Services Status:** 19+/22 (86%+) fully migrated

---

## 📋 Pre-Deployment Checklist

### 1. Database Migrations
```bash
# Run all pending migrations
npx prisma migrate deploy

# Verify schema integrity
npx prisma db push

# Optionally, create a backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

**Migrations Required:**
- [x] DeviceToken table (Session 3)
- [x] CourierConfig table (Session 3 continuation)

### 2. Environment Configuration

Create `.env.production` with these essential variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/warungin_prod"

# API Keys & Credentials
ENCRYPTION_KEY="[32-byte-base64-encoded-key]"
JWT_SECRET="[secure-random-secret]"

# Courier APIs
JNE_API_KEY="[your-jne-key]"
JNE_BASE_URL="https://api.jne.co.id/v1"
JNT_API_KEY="[your-jnt-key]"
JNT_BASE_URL="https://api.jnt.co.id/v1"
POS_API_KEY="[your-pos-key]"
POS_BASE_URL="https://api.posindonesia.co.id/v1"

# Payment Gateway
MIDTRANS_SERVER_KEY="[midtrans-server-key]"
MIDTRANS_CLIENT_KEY="[midtrans-client-key]"
MIDTRANS_API_URL="https://api.sandbox.midtrans.com"

# Communications
SMS_PROVIDER="TWILIO"
TWILIO_ACCOUNT_SID="[twilio-sid]"
TWILIO_AUTH_TOKEN="[twilio-token]"
TWILIO_PHONE_NUMBER="+[your-twilio-number]"

WHATSAPP_PROVIDER="WABA"
WABA_BUSINESS_ACCOUNT_ID="[waba-account]"
WABA_ACCESS_TOKEN="[waba-token]"

PUSH_PROVIDER="FIREBASE"
FIREBASE_API_KEY="[firebase-key]"
FIREBASE_PROJECT_ID="[firebase-project]"

# Email
EMAIL_FROM="noreply@warungin.com"
SENDGRID_API_KEY="[sendgrid-key]"

# System
NODE_ENV="production"
PORT=3000
LOG_LEVEL="info"
```

### 3. Build Verification
```bash
# Clean build
rm -rf dist node_modules
npm install --production
npm run build

# Verify no errors
echo "Build completed with exit code: $?"

# Run linting
npm run lint

# Expected output: 0 errors (warnings acceptable)
```

### 4. Database Seeding (If Required)

Seed initial courier configurations:
```bash
npx prisma db seed
```

Or manually insert via SQL:
```sql
INSERT INTO courier_configs (tenant_id, courier, api_key, api_secret, base_url, is_active)
VALUES 
  ('tenant-id-1', 'JNE', 'key', 'secret', 'https://api.jne.co.id/v1', true),
  ('tenant-id-1', 'JNT', 'key', 'secret', 'https://api.jnt.co.id/v1', true),
  ('tenant-id-1', 'POS', 'key', 'secret', 'https://api.posindonesia.co.id/v1', true);
```

### 5. Security Hardening

```bash
# Set strict file permissions
chmod 600 .env.production
chmod 755 ./dist

# Verify no sensitive data in code
grep -r "password\|secret\|api.key\|token" src/ --include="*.ts" | grep -v "// " | grep -v ".env"

# Run security audit
npm audit
npm audit fix  # if necessary
```

### 6. Performance Baseline

Record baseline metrics before deployment:
```bash
# Database connection pool
# Expected: 5-10 connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# API response times
# Expected: < 200ms for most endpoints
curl -w "@curl-format.txt" -o /dev/null -s https://api.warungin.local/health

# Concurrent users supported
# Benchmark: Run load test with k6 or Apache Bench
```

---

## 🚀 Deployment Steps

### Step 1: Pre-Flight Checks

```bash
# 1a. Verify all services compile
npm run build 2>&1 | head -20
echo "Exit code: $?"

# 1b. Verify lint passes
npm run lint 2>&1 | tail -5

# 1c. Run smoke tests (if available)
npm run test:smoke

# 1d. Database connectivity
npx prisma db execute --stdin <<EOF
SELECT version();
SELECT count(*) FROM public.tenants;
EOF
```

### Step 2: Code Deployment

```bash
# 2a. Copy application files
rsync -avz --delete ./dist/ user@host:/opt/warungin/dist/
rsync -avz ./node_modules/ user@host:/opt/warungin/node_modules/
rsync -avz ./.env.production user@host:/opt/warungin/.env

# 2b. Update permissions
ssh user@host "chmod 755 /opt/warungin/dist && chmod 600 /opt/warungin/.env"

# 2c. Run migrations on target
ssh user@host "cd /opt/warungin && npx prisma migrate deploy"
```

### Step 3: Service Startup

```bash
# 3a. Start services (using PM2 or systemd)

# Option A: PM2
pm2 start dist/index.js --name warungin-api -i max
pm2 save
pm2 startup

# Option B: Systemd
sudo systemctl restart warungin-api
sudo systemctl enable warungin-api

# 3c. Verify service is running
curl -s http://localhost:3000/health | jq '.'

# Expected response:
# {
#   "status": "ok",
#   "uptime": 2.34,
#   "services": {...}
# }
```

### Step 4: Smoke Testing

```bash
# 4a. Test core endpoints
BASE_URL="https://api.warungin.local"

# Test authentication
curl -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}'

# Test order creation
curl -X POST $BASE_URL/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"items":[...]}'

# Test courier integration
curl -X POST $BASE_URL/shipments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"courier":"JNE","items":[...]}'

# Test payment processing
curl -X POST $BASE_URL/payments \
  -H "Content-Type: application/json" \
  -d '{"orderId":"...","method":"MIDTRANS"}'
```

### Step 5: Monitoring Setup

```bash
# 5a. Configure logging
export LOG_LEVEL=info
export LOG_FORMAT=json

# 5b. Setup error tracking
# Configure Sentry, Datadog, or similar
export SENTRY_DSN="https://..."
export APM_ENABLED=true

# 5c. Configure metrics
# Setup Prometheus, New Relic, or similar
export METRICS_ENABLED=true
export METRICS_PORT=9090
```

### Step 6: Rollback Plan

```bash
# If issues occur:

# 6a. Rollback code
git checkout previous-version
npm run build
systemctl restart warungin-api

# 6b. Rollback database (if schema change failed)
npx prisma migrate resolve --rolled-back "migration-name"

# 6c. Restore from backup
pg_restore -d warungin_prod backup_20260118_HHMMSS.sql
```

---

## 📊 Post-Deployment Verification

### Immediate (First 5 minutes)

- [ ] Application starts without errors
- [ ] No critical logs in error output
- [ ] Database connectivity verified
- [ ] Health check endpoint responds
- [ ] Authentication working

### Short-term (First hour)

- [ ] Courier API integrations responding
- [ ] Payment processing working
- [ ] SMS/Push notifications delivering
- [ ] Email sending functional
- [ ] Database queries performant

### Medium-term (First 24 hours)

- [ ] No error spikes in logs
- [ ] Response times within baseline
- [ ] All background jobs completing
- [ ] Webhook deliveries working
- [ ] User workflows completing successfully

### Long-term (First week)

- [ ] Sustained stable performance
- [ ] No memory leaks detected
- [ ] Database performance stable
- [ ] All integrations reliable
- [ ] User experience satisfactory

---

## 🔍 Production Monitoring

### Key Metrics to Monitor

```javascript
// Response Time
- API endpoint latency
- Database query time
- External API response time

// Error Rates
- 4xx errors (client errors)
- 5xx errors (server errors)
- Payment failures
- Courier API failures
- SMS/Email delivery failures

// Resource Usage
- CPU utilization (target: < 70%)
- Memory usage (target: < 80%)
- Database connections (target: < 80% of pool)
- Disk I/O (target: < 60%)

// Business Metrics
- Orders per minute
- Payment success rate (target: > 99%)
- Delivery time
- Customer complaints
```

### Alert Thresholds

```yaml
Critical:
  - API response time > 5 seconds
  - Error rate > 5%
  - Payment failure rate > 2%
  - Database connection pool exhausted
  - Disk space < 10%

Warning:
  - API response time > 1 second
  - Error rate > 1%
  - Memory usage > 85%
  - Database connections > 80%
```

---

## 🛠️ Troubleshooting Guide

### Issue: Database Connection Timeout

```bash
# Check database connectivity
psql -h $DB_HOST -U $DB_USER -d warungin_prod -c "SELECT 1;"

# Verify connection string
echo $DATABASE_URL | grep -o 'postgresql://[^@]*@[^/]*/[^?]*'

# Check pool settings
curl http://localhost:9090/metrics | grep pg_pool
```

### Issue: Courier API Failures

```bash
# Verify credentials
curl -H "Authorization: Bearer $JNE_API_KEY" \
  https://api.jne.co.id/v1/health

# Check API endpoint
curl -v https://api.jne.co.id/v1/shipment 2>&1 | grep "< HTTP"

# Review logs for specific error
docker logs warungin-api | grep -i "courier\|jne\|jnt"
```

### Issue: Payment Processing Failures

```bash
# Verify Midtrans credentials
curl -u $MIDTRANS_SERVER_KEY: \
  https://api.sandbox.midtrans.com/v1/status/test-order-id

# Check payment status
SELECT * FROM "Transaction" WHERE order_id = 'test-order' LIMIT 5;

# Review Midtrans logs
# Visit: https://dashboard.midtrans.com/transactions
```

### Issue: High Memory Usage

```bash
# Check for memory leaks
NODE_OPTIONS="--max-old-space-size=2048" npm run start

# Monitor heap
node --inspect=0.0.0.0:9229 dist/index.js
# Connect Chrome DevTools: chrome://inspect

# Check running processes
ps aux | grep node
```

---

## 📈 Scaling Recommendations

### Horizontal Scaling

When requests exceed 1000/minute:

```bash
# Deploy multiple instances behind load balancer
docker-compose up -d --scale api=3

# Configure load balancer (nginx example)
upstream api_servers {
  server api1:3000;
  server api2:3000;
  server api3:3000;
}
server {
  location / {
    proxy_pass http://api_servers;
  }
}
```

### Database Scaling

When database load exceeds 80%:

```sql
-- Add read replicas
CREATE PUBLICATION api_publication FOR ALL TABLES;

-- Create indexes for slow queries
CREATE INDEX idx_orders_created_at ON orders(tenant_id, created_at DESC);
CREATE INDEX idx_transactions_tenant_status ON transactions(tenant_id, status);

-- Enable connection pooling
-- PgBouncer configuration:
[databases]
warungin = host=postgres_primary port=5432
```

---

## 🔐 Security Hardening

### TLS/HTTPS

```bash
# Generate self-signed certificate (dev only)
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365

# Or use Let's Encrypt
certbot certonly --standalone -d api.warungin.local
```

### API Security

```javascript
// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true
}));

// Security headers
app.use(helmet());
```

### Database Security

```sql
-- Restrict user privileges
REVOKE ALL ON DATABASE warungin_prod FROM public;
GRANT CONNECT ON DATABASE warungin_prod TO warungin_app_user;
GRANT USAGE ON SCHEMA public TO warungin_app_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO warungin_app_user;

-- Enable audit logging
ALTER SYSTEM SET log_statement = 'all';
```

---

## 📞 Support & Escalation

### On-call Runbook

1. **Alert received** → Acknowledge and check status page
2. **Investigate** → Check logs, metrics, and database
3. **Determine severity** → Critical/High/Medium/Low
4. **Implement fix** → Apply hotfix or rollback
5. **Document** → Record incident and resolution
6. **Post-mortem** → Schedule within 24 hours

### Contact Information

- **On-call Engineer:** [escalation list]
- **Database Team:** [contact]
- **Infrastructure Team:** [contact]
- **Product Manager:** [contact]

---

## ✅ Deployment Sign-Off

- [ ] All pre-deployment checks passed
- [ ] Database migrations successful
- [ ] Build verification completed
- [ ] Security hardening applied
- [ ] Monitoring configured
- [ ] Smoke tests passed
- [ ] Performance baseline recorded
- [ ] Rollback plan documented
- [ ] Team trained on new features
- [ ] Deployment approval obtained

**Deployed by:** ________________  
**Date:** ________________  
**Version:** 1.0  
**Status:** ✅ PRODUCTION READY  

---

## 📚 Additional Resources

- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [PostgreSQL High Availability](https://www.postgresql.org/docs/current/high-availability.html)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

