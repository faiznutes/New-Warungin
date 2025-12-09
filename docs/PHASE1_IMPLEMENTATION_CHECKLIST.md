# ✅ PHASE 1: CRITICAL ITEMS IMPLEMENTATION CHECKLIST
**Status:** Ready for Manual Deployment  
**Target Completion:** December 16, 2025  
**Effort:** ~10.5 hours total

---

## 📋 ITEM 1.1: Log Rotation Configuration ⏱️ 15 minutes

**Current Situation:**
- `/var` partition: **81% full** (1.4GB used, ~350MB free)
- At current rate, will fill in ~30 days
- Logs not being rotated = critical space issue
- **Priority:** 🔴 CRITICAL

### Implementation Checklist

#### Step 1: Create logrotate configuration
```bash
# SSH to server as root or with sudo
ssh warungin@192.168.0.102

# Create /etc/logrotate.d/warungin config file
sudo cat > /etc/logrotate.d/warungin <<'EOFCONFIG'
/var/lib/docker/containers/*/*.log {
  daily
  rotate 7
  compress
  delaycompress
  missingok
  copytruncate
  size 100M
}

/var/log/syslog {
  daily
  rotate 7
  compress
  delaycompress
  missingok
  copytruncate
  size 100M
}

/var/log/daemon.log {
  daily
  rotate 7
  compress
  delaycompress
  missingok
  copytruncate
  size 100M
}
EOFCONFIG
```

**Expected Output:**
```
# File should be created without errors
# Size: ~500 bytes
```

**Pre-Deployment Check:**
- [ ] File path: `/etc/logrotate.d/warungin`
- [ ] File readable: `sudo ls -l /etc/logrotate.d/warungin`
- [ ] Syntax valid: `sudo logrotate -d /etc/logrotate.d/warungin`

#### Step 2: Verify logrotate configuration
```bash
# Test the configuration (dry-run, doesn't actually rotate)
sudo logrotate -d /etc/logrotate.d/warungin

# Should output messages like:
# rotating /var/lib/docker/containers/*/*.log
# rotating /var/log/syslog
# rotating /var/log/daemon.log
```

**Success Criteria:**
- [ ] No errors in logrotate output
- [ ] All 3 log paths recognized
- [ ] No file not found errors

#### Step 3: Test log rotation
```bash
# Check /var usage BEFORE rotation
df -h /var
# Sample output:
# /dev/mapper/vg0-var  20G  16G  4.0G  81% /var

# Force immediate rotation (test)
sudo logrotate -f /etc/logrotate.d/warungin

# Check /var usage AFTER rotation
df -h /var
# Expected: Should drop significantly (especially syslog)
# Target: < 50% (< 10GB)
```

**Success Criteria:**
- [ ] Disk usage dropped after rotation
- [ ] /var usage now < 50%
- [ ] Logs compressed (.gz files exist)
- [ ] No errors in rotation

#### Step 4: Verify rotated logs
```bash
# List old logs to confirm rotation worked
ls -lh /var/log/syslog*
# Should show:
# syslog (current)
# syslog.1, syslog.2.gz, syslog.3.gz, ... (old rotated)

ls -lh /var/log/daemon.log*
# Similar pattern

# Check total freed space
du -sh /var/log/*
```

**Success Criteria:**
- [ ] Rotated files exist (.1, .2.gz, etc.)
- [ ] Compressed files use .gz format
- [ ] /var usage dropped by at least 30%
- [ ] Current log files (.log, .log.1) exist

#### Step 5: Verify cron schedule
```bash
# Check if logrotate cron job exists
ls -la /etc/cron.daily/
# Should see: logrotate

# View logrotate cron config
cat /etc/cron.daily/logrotate

# Verify logrotate state file
sudo cat /var/lib/logrotate/status
```

**Success Criteria:**
- [ ] logrotate cron job exists
- [ ] logrotate state file shows recent rotation

### Deployment Verification
- [ ] `/etc/logrotate.d/warungin` file created
- [ ] logrotate config syntax valid
- [ ] Forced rotation completed without errors
- [ ] /var usage dropped to < 50%
- [ ] Rotated log files exist and are compressed

### Rollback Plan (if needed)
```bash
# If rotation causes issues:
sudo rm /etc/logrotate.d/warungin
sudo logrotate -f /etc/logrotate.d/logrotate  # Reset logrotate
```

**Status:** ⏳ Pending manual deployment

---

## 📋 ITEM 1.2: Docker Container Resource Limits ⏱️ 2 hours

**Current Situation:**
```
✅ Backend:    4GB mem / 4CPU (LIMITS SET)
✅ Nginx:      1GB mem / 2CPU (LIMITS SET)
⚠️  PostgreSQL: UNLIMITED (can consume all 5.7GB!)
⚠️  Redis:      UNLIMITED (OK, but unchecked)
⚠️  Frontend:   UNLIMITED (can cause OOM)
```

**Priority:** 🟡 HIGH (Risk of OOM crashes)

### Pre-Deployment Verification
```bash
# Check current limits
docker stats --no-stream --format 'table {{.Container}}\t{{.MemUsage}}\t{{.MemLimit}}\t{{.CPUPerc}}'

# Expected: PostgreSQL, Redis, Frontend show "∞" or "-" for limits
```

### Implementation Steps

#### Step 1: Backup docker-compose.yml
```bash
cd /app
cp docker-compose.yml docker-compose.yml.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup created at docker-compose.yml.backup.*"
```

#### Step 2: Update docker-compose.yml

**Add to PostgreSQL service:**
```yaml
postgres:
  image: postgres:15-alpine
  container_name: warungin-postgres
  # ... existing config ...
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 2G
      reservations:
        cpus: '1'
        memory: 1G
```

**Add to Redis service:**
```yaml
redis:
  image: redis:7-alpine
  container_name: warungin-redis
  # ... existing config ...
  deploy:
    resources:
      limits:
        cpus: '1'
        memory: 512M
      reservations:
        cpus: '0.5'
        memory: 256M
```

**Add to Frontend service:**
```yaml
frontend:
  build: ./client
  container_name: warungin-frontend
  # ... existing config ...
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 512M
      reservations:
        cpus: '1'
        memory: 256M
```

**Validation:**
- [ ] YAML syntax valid: `docker-compose config` (no errors)
- [ ] Indentation correct (2 spaces per level)
- [ ] All service limits added

#### Step 3: Restart containers with new limits
```bash
cd /app

# Stop current containers (graceful)
docker compose down

# Wait 5 seconds
sleep 5

# Start with new config
docker compose up -d

# Wait for services to stabilize
sleep 15

echo "✅ Containers restarted with new resource limits"
```

#### Step 4: Verify limits applied
```bash
# Check resource limits
docker stats --no-stream --format 'table {{.Container}}\t{{.MemUsage}}/{{.MemLimit}}\t{{.CPUPerc}}'

# Expected output:
# warungin-postgres   62.28 MiB / 2GiB      0.00%
# warungin-redis      10.54 MiB / 512MiB    1.96%
# warungin-frontend   11.26 MiB / 512MiB    0.00%
# warungin-backend    122.8 MiB / 4GiB      1.21%
# warungin-nginx      12.49 MiB / 1GiB      0.00%
```

**Success Criteria:**
- [ ] All containers show memory LIMIT column
- [ ] PostgreSQL limit: 2GiB
- [ ] Redis limit: 512MiB
- [ ] Frontend limit: 512MiB
- [ ] No containers restarting
- [ ] Backend still healthy

#### Step 5: Monitor for 1 hour
```bash
# Watch for any OOM errors
docker logs warungin-postgres | grep -i "out of memory" || echo "✅ No OOM errors"
docker logs warungin-redis | grep -i "out of memory" || echo "✅ No OOM errors"
docker logs warungin-frontend | grep -i "out of memory" || echo "✅ No OOM errors"

# Monitor real-time usage
watch -n 5 'docker stats --no-stream'
```

### Rollback Plan (if needed)
```bash
# Restore backup
cd /app
docker compose down
cp docker-compose.yml.backup.* docker-compose.yml
docker compose up -d
```

**Status:** ⏳ Pending manual deployment

---

## 📋 ITEM 1.3: Enhanced Health Checks ⏱️ 3 hours

**Current Status:**
```
Basic: HEALTHCHECK CMD curl localhost:3001
Goal:  Check dependencies (database, Redis) + service health
```

### Implementation Steps

#### Step 1: Create health check utility
Create file: `src/utils/health-check.ts`

```typescript
import { prisma } from '../config/database';
import { redis } from '../config/redis';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  checks: {
    database: boolean;
    redis: boolean;
    memoryUsage: number;
    uptime: number;
  };
}

export async function performHealthCheck(): Promise<HealthStatus> {
  const checks = {
    database: false,
    redis: false,
    memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
    uptime: process.uptime()
  };

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  // Check Redis
  try {
    await redis.ping();
    checks.redis = true;
  } catch (error) {
    console.error('Redis health check failed:', error);
  }

  const isHealthy = checks.database && checks.redis;

  return {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks
  };
}
```

#### Step 2: Create health check endpoint
Add to your routes file (e.g., `src/routes/system.routes.ts`):

```typescript
import express from 'express';
import { performHealthCheck } from '../utils/health-check';

const router = express.Router();

router.get('/health', async (req, res) => {
  const health = await performHealthCheck();
  res.status(health.status === 'healthy' ? 200 : 503).json(health);
});

router.get('/ready', async (req, res) => {
  const health = await performHealthCheck();
  // Readiness check is stricter - requires all checks to pass
  res.status(health.checks.database && health.checks.redis ? 200 : 503).json({
    ready: health.checks.database && health.checks.redis
  });
});

export default router;
```

#### Step 3: Update docker-compose.yml health checks

**For Backend:**
```yaml
warungin-backend:
  # ... existing config ...
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s
```

**For PostgreSQL:**
```yaml
postgres:
  # ... existing config ...
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U postgres -h localhost"]
    interval: 30s
    timeout: 10s
    retries: 3
```

**For Redis:**
```yaml
redis:
  # ... existing config ...
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 30s
    timeout: 10s
    retries: 3
```

**For Nginx:**
```yaml
nginx:
  # ... existing config ...
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost/health"]
    interval: 30s
    timeout: 10s
    retries: 3
```

#### Step 4: Test health checks
```bash
# After restart, verify health checks are running
docker ps --format 'table {{.Container}}\t{{.Status}}'
# Expected: All should show "healthy"

# Test individual health endpoints
curl -s http://localhost:3001/api/health | jq .

# Force a failure and verify detection
docker pause warungin-postgres
docker ps --format 'table {{.Container}}\t{{.Status}}'
# Expected: warungin-backend should show "unhealthy" within 30-90 seconds

# Unpause and verify recovery
docker unpause warungin-postgres
docker ps --format 'table {{.Container}}\t{{.Status}}'
# Expected: warungin-backend should recover to "healthy"
```

**Status:** ⏳ Pending manual deployment

---

## 📋 ITEM 1.4: Backup & Disaster Recovery Testing ⏱️ 1 hour

**Current Status:**
```
✅ Daily backup exists @ 23:59
⚠️  Restore procedure never tested
⚠️  No offsite backup
```

### Implementation Steps

#### Step 1: Create backup script
Create file: `scripts/backup.sh`

```bash
#!/bin/bash
BACKUP_DIR="/backups/warungin"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

echo "[$(date)] Starting PostgreSQL backup..."

# Backup PostgreSQL
docker exec warungin-postgres pg_dump -U postgres warungin > \
  $BACKUP_DIR/postgres_$DATE.sql

if [ $? -eq 0 ]; then
    echo "[$(date)] ✅ Backup successful: $BACKUP_DIR/postgres_$DATE.sql"
    
    # Compress for storage
    gzip $BACKUP_DIR/postgres_$DATE.sql
    
    # Clean old backups (keep 7 days)
    find $BACKUP_DIR -name 'postgres_*.sql.gz' -mtime +7 -delete
    
    # Show stats
    du -sh $BACKUP_DIR
else
    echo "[$(date)] ❌ Backup failed!"
    exit 1
fi
```

#### Step 2: Setup cron job
```bash
# Add to crontab
sudo crontab -e

# Add this line (daily at 23:59):
59 23 * * * /app/scripts/backup.sh

# Verify
sudo crontab -l
```

#### Step 3: Test backup
```bash
# Run backup manually
bash /app/scripts/backup.sh

# Verify backup file created
ls -lh /backups/warungin/

# Should show:
# postgres_20251209_235900.sql.gz
```

#### Step 4: Test restore
```bash
# Create test database
docker exec warungin-postgres createdb warungin_test

# Find latest backup
BACKUP_FILE=$(ls -t /backups/warungin/postgres_*.sql.gz | head -1)

# Restore to test database
gunzip -c $BACKUP_FILE | docker exec -i warungin-postgres psql -U postgres warungin_test

# Verify data restored
docker exec warungin-postgres psql -U postgres -c \
  "SELECT COUNT(*) as row_count FROM information_schema.tables WHERE table_schema='public'" warungin_test

# Expected: Should show number of tables

# Cleanup
docker exec warungin-postgres dropdb warungin_test
```

**Status:** ⏳ Pending manual deployment

---

## 📋 ITEM 1.5: Docker Image Optimization ⏱️ 2.25 hours

**Current Status:**
```
Backend image:  715 MB (large)
Frontend image: 450 MB (large)
Goal:           Backend 300-350 MB, Frontend 150-200 MB
```

### Implementation Steps (LOCAL DEVELOPMENT)

#### Step 1: Update Dockerfile.backend

Replace content with multi-stage build:

```dockerfile
# Stage 1: Build dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Stage 2: Build application
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: Runtime (minimal)
FROM node:20-alpine
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy production deps only
COPY --from=deps /app/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env* ./

# Copy package.json for versioning
COPY package.json .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
```

#### Step 2: Update client/Dockerfile

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && \
    npm cache clean --force

# Stage 2: Serve with nginx
FROM nginx:alpine
RUN apk add --no-cache curl

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d /etc/nginx/conf.d

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Step 3: Build and test locally
```bash
# Build backend
docker build -t warungin-backend:optimized -f Dockerfile.backend .

# Check size
docker images | grep warungin-backend
# Expected: Should be ~300-350 MB (was 715 MB)

# Test container
docker run --rm -p 3001:3001 warungin-backend:optimized

# In another terminal, test endpoint
curl http://localhost:3001/api/health
```

#### Step 4: Build frontend
```bash
# Build frontend
docker build -t warungin-frontend:optimized -f client/Dockerfile .

# Check size
docker images | grep warungin-frontend
# Expected: Should be ~150-200 MB (was 450 MB)

# Test container
docker run --rm -p 80:80 warungin-frontend:optimized

# In another terminal, test
curl http://localhost/
```

**Status:** ⏳ Pending manual deployment

---

## 📋 ITEM 1.6: Documentation & Runbooks ⏱️ 2 hours

Create following files:

1. **EMERGENCY_PROCEDURES.md** - What to do when things break
2. **HEALTH_CHECK_TROUBLESHOOTING.md** - Debug health issues
3. **MONITORING_DASHBOARD.md** - Setup monitoring

**Status:** ⏳ Pending manual deployment

---

## 📊 PHASE 1 Progress Tracking

| Item | Task | Duration | Status | Notes |
|------|------|----------|--------|-------|
| 1.1 | Log Rotation | 15 min | ⏳ Ready | Critical - /var 81% full |
| 1.2 | Resource Limits | 2h | ⏳ Ready | Backup made before changes |
| 1.3 | Health Checks | 3h | ⏳ Ready | Code changes + docker-compose |
| 1.4 | Backup Testing | 1h | ⏳ Ready | Test restore procedure |
| 1.5 | Image Optimization | 2.25h | ⏳ Ready | Local build + test |
| 1.6 | Documentation | 2h | ⏳ Ready | Create runbooks |

**Total:** 10.5 hours

---

## 🎯 Success Criteria (ALL must pass)

### ITEM 1.1: Log Rotation
- [ ] `/etc/logrotate.d/warungin` created
- [ ] logrotate config syntax valid
- [ ] /var usage <50% after rotation
- [ ] Logs compressed with .gz extension

### ITEM 1.2: Resource Limits
- [ ] docker-compose.yml updated
- [ ] All services restart without errors
- [ ] `docker stats` shows memory limits for PostgreSQL, Redis, Frontend
- [ ] No OOM errors in logs after 1 hour

### ITEM 1.3: Health Checks
- [ ] Health check utility created and working
- [ ] All service health checks passing
- [ ] Unhealthy service detected within 90 seconds
- [ ] Service auto-recovers when fixed

### ITEM 1.4: Backup & Disaster Recovery
- [ ] Backup script created and executable
- [ ] Test backup completes without errors
- [ ] Restore procedure tested on test database
- [ ] Backup cron job running daily

### ITEM 1.5: Image Optimization
- [ ] Backend image size reduced by 50%+ (from 715MB)
- [ ] Frontend image size reduced by 50%+ (from 450MB)
- [ ] Images build successfully
- [ ] Containers start in <5 seconds

### ITEM 1.6: Documentation
- [ ] EMERGENCY_PROCEDURES.md created
- [ ] HEALTH_CHECK_TROUBLESHOOTING.md created
- [ ] All procedures documented with examples
- [ ] Team trained on procedures

---

## 🚀 Deployment Instructions

### To Deploy ITEM 1.1 (Log Rotation):
```bash
# SSH to server
ssh warungin@192.168.0.102

# Follow ITEM 1.1 checklist above
# Should take ~15 minutes
```

### To Deploy ITEM 1.2 (Resource Limits):
```bash
# On server, cd to app directory
cd /app

# Edit docker-compose.yml (or copy from updated version)
nano docker-compose.yml

# Follow ITEM 1.2 checklist above
# Should take ~2 hours
```

### To Deploy ITEM 1.5 (Image Optimization):
```bash
# LOCAL DEVELOPMENT (not on server)
# Update Dockerfile.backend and client/Dockerfile locally
# Build and test images locally

# Once tested, commit to git and merge to production branch
git add -A
git commit -m "perf: Optimize Docker images with multi-stage builds"

# Then on server: git pull and rebuild
cd /app
git pull origin main
docker compose build --no-cache
docker compose up -d
```

---

## 📝 Next Steps After PHASE 1

Once all 6 items in PHASE 1 are complete:
1. Commit all changes to git
2. Update status in this document
3. Proceed to PHASE 2: Security Hardening + Monitoring Setup (Week 2)
4. Review WEEK 2 tasks in TODO_5STAR.md

---

**Last Updated:** December 9, 2025  
**Next Review:** After PHASE 1 deployment  
**Owner:** DevOps Team

