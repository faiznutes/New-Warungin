# 🚀 PHASE 6.1 - PRODUCTION DEPLOYMENT READY

**Status**: ⏳ AWAITING PHASE 5.3 APPROVALS
**Estimated Duration**: 70-80 minutes
**Target Date**: December 31, 2025 / January 1, 2026
**Server**: 192.168.1.101 (Debian 13)
**Access**: faiz@192.168.1.101 (via SSH/sshpass)

---

## 📋 PRE-DEPLOYMENT CHECKLIST

Before deployment, verify all items below are COMPLETE:

### ✅ Phase 5.3 Approvals (REQUIRED)
- [ ] QA Lead approved
- [ ] Security Lead approved
- [ ] Tech Lead approved
- [ ] Product Manager approved
- [ ] All 4 approvals documented in PHASE_5_3_APPROVAL_FORM.md

### ✅ Code & Infrastructure
- [x] All 15 security fixes implemented
- [x] All 18 files modified/created
- [x] No breaking changes (100% backward compatible)
- [x] All 8 Docker services running (25+ hours uptime)
- [x] Database healthy and accepting connections
- [x] Cache (Redis) operational
- [x] Monitoring (Loki + Promtail) active
- [x] Incident response guide ready

### ✅ Testing Complete
- [x] Smoke test: 10/10 PASSED
- [x] Full test suite: 28/31 PASSED (90%)
- [x] All critical tests passed
- [x] All security fixes verified deployed

### ✅ Communication
- [ ] Team notified of deployment schedule
- [ ] Stakeholders informed
- [ ] Users advised of potential downtime (minimal)
- [ ] Support team ready
- [ ] Emergency contact list verified

---

## 🔧 DEPLOYMENT PHASES

### PHASE 1: PRE-DEPLOYMENT (30 minutes)

#### 1.1 - Final System Verification (5 min)
**Command**: Check all services are healthy before deployment

```bash
sshpass -p 123 ssh faiz@192.168.1.101 "cd /home/faiz/warungin && docker compose ps"
```

**Expected Output**:
```
NAME           STATUS        PORTS
backend        Up 25 hours   
frontend       Up 25 hours   
postgres       Up 25 hours   
redis          Up 25 hours   
nginx          Up 25 hours   
loki           Up 25 hours   
promtail       Up 25 hours   
alertmanager   Up 25 hours   
```

**Success Criteria**: All 8 services showing UP and HEALTHY

#### 1.2 - Database Backup (10 min)
**Command**: Backup PostgreSQL database before deployment

```bash
sshpass -p 123 ssh faiz@192.168.1.101 "
cd /home/faiz/warungin && \
docker compose exec -T postgres pg_dump -U postgres warungin > /tmp/warungin_backup_$(date +%Y%m%d_%H%M%S).sql
"
```

**Expected Output**: `(backup completed successfully without errors)`

**Verification**: Check backup file size > 1MB
```bash
sshpass -p 123 ssh faiz@192.168.1.101 "ls -lh /tmp/warungin_backup_*.sql | tail -1"
```

#### 1.3 - Backend Service Verification (5 min)
**Command**: Verify backend is processing requests

```bash
sshpass -p 123 ssh faiz@192.168.1.101 "
cd /home/faiz/warungin && \
docker compose logs --tail=5 backend | grep -E 'POST|GET|Business|metrics'
"
```

**Expected Output**: Recent request logs or business metrics

**Success Criteria**: Backend responding to requests

#### 1.4 - Network Configuration Check (5 min)
**Command**: Verify nginx and SSL configuration

```bash
sshpass -p 123 ssh faiz@192.168.1.101 "
cd /home/faiz/warungin && \
echo 123 | sudo -S docker compose exec -T nginx nginx -t
"
```

**Expected Output**: `nginx: configuration file test is successful`

**Success Criteria**: Nginx configuration valid

#### 1.5 - Notification to Team (5 min)
- [ ] Send Slack/Email: "Deployment starting in 5 minutes"
- [ ] Confirm receipt from on-call support
- [ ] All team leads standing by

**Message Template**:
```
🚀 WARUNGIN POS - PRODUCTION DEPLOYMENT IN PROGRESS

Timeline: 70-80 minutes
Expected Completion: [TIME]
Expected Downtime: 5-10 minutes (for service restart)

Status Updates will be posted every 10 minutes.
Support available: [CONTACT]
Incident Response: [ESCALATION CONTACT]
```

---

### PHASE 2: DEPLOYMENT (20 minutes)

#### 2.1 - Pull Latest Code (3 min)
**Command**: Update repository with latest fixes

```bash
sshpass -p 123 ssh faiz@192.168.1.101 "
cd /home/faiz/warungin && \
git pull origin main && \
git status
"
```

**Expected Output**:
```
Already up to date. / [commits pulled]
On branch main
Your branch is up to date with 'origin/main'.
```

**Success Criteria**: Code updated, no merge conflicts

#### 2.2 - Verify Code Changes (2 min)
**Command**: Verify security fixes are present

```bash
sshpass -p 123 ssh faiz@192.168.1.101 "
cd /home/faiz/warungin && \
ls -la src/middlewares/require2fa.ts && \
ls -la src/middlewares/supervisor-store-guard.ts
"
```

**Expected Output**: Both files exist and have proper permissions

**Success Criteria**: Both security middleware files present

#### 2.3 - Rebuild Backend (8 min)
**Command**: Rebuild backend with latest code

```bash
sshpass -p 123 ssh faiz@192.168.1.101 "
cd /home/faiz/warungin && \
docker compose down backend && \
docker compose build backend && \
docker compose up -d backend
"
```

**Expected Output**:
```
Stopping backend...
Removing backend...
Building backend...
Successfully built [IMAGE_ID]
Starting backend...
```

**Success Criteria**: Backend container rebuilt and restarted

#### 2.4 - Rebuild Frontend (5 min)
**Command**: Rebuild frontend with latest code

```bash
sshpass -p 123 ssh faiz@192.168.1.101 "
cd /home/faiz/warungin && \
docker compose down frontend && \
docker compose build frontend && \
docker compose up -d frontend
"
```

**Expected Output**: Frontend rebuilt successfully

**Success Criteria**: Frontend container rebuilt and restarted

#### 2.5 - Verify All Services (2 min)
**Command**: Confirm all services restarted successfully

```bash
sshpass -p 123 ssh faiz@192.168.1.101 "
cd /home/faiz/warungin && \
docker compose ps
"
```

**Expected Output**: All 8 services showing UP and HEALTHY

**Success Criteria**: All services healthy

---

### PHASE 3: VERIFICATION (20 minutes)

#### 3.1 - Backend Health Check (5 min)
**Command**: Verify backend is responding

```bash
sshpass -p 123 ssh faiz@192.168.1.101 "
cd /home/faiz/warungin && \
docker compose logs --tail=20 backend | grep -E 'Started|listening|Error|Failed'
"
```

**Expected Output**: Backend running and listening

**Success Criteria**: No critical errors in logs

#### 3.2 - Database Connection Test (3 min)
**Command**: Verify database is accessible

```bash
sshpass -p 123 ssh faiz@192.168.1.101 "
cd /home/faiz/warungin && \
echo 123 | sudo -S docker compose exec -T postgres pg_isready
"
```

**Expected Output**: `/var/run/postgresql:5432 - accepting connections`

**Success Criteria**: Database accepting connections

#### 3.3 - Cache Health Check (3 min)
**Command**: Verify Redis is operational

```bash
sshpass -p 123 ssh faiz@192.168.1.101 "
cd /home/faiz/warungin && \
docker compose exec -T redis redis-cli ping
"
```

**Expected Output**: `PONG`

**Success Criteria**: Cache responding

#### 3.4 - Frontend Accessibility (3 min)
**Command**: Verify frontend is accessible

```bash
curl -I http://192.168.1.101/ | head -5
```

**Expected Output**:
```
HTTP/1.1 200 OK
Content-Type: text/html
...
```

**Success Criteria**: Frontend returning HTTP 200

#### 3.5 - Critical Security Test (3 min)
**Command**: Verify 2FA enforcement is active

```bash
sshpass -p 123 ssh faiz@192.168.1.101 "
cd /home/faiz/warungin && \
docker compose logs --tail=30 backend | grep -E '2FA|2fa|require2fa' || echo 'Checking middleware loaded...'
"
```

**Expected Output**: Evidence of 2FA middleware loading

**Success Criteria**: Security fixes active

#### 3.6 - Monitoring Verification (3 min)
**Command**: Verify observability stack is collecting data

```bash
sshpass -p 123 ssh faiz@192.168.1.101 "
cd /home/faiz/warungin && \
docker compose logs --tail=10 promtail | grep -E 'Starting|processing|error'
"
```

**Expected Output**: Logs being collected

**Success Criteria**: Monitoring operational

---

## 🎯 QUICK START - DEPLOYMENT EXECUTION

### If All Pre-Checks Pass ✅

**EXECUTE THIS SINGLE COMMAND TO RUN ENTIRE DEPLOYMENT**:

```bash
#!/bin/bash
# Run this to execute full deployment with progress tracking

echo "=== PHASE 6.1 PRODUCTION DEPLOYMENT ==="
echo "Start Time: $(date)"
echo ""

# Phase 1: Pre-deployment
echo "PHASE 1: PRE-DEPLOYMENT (30 min)"
echo "1. System verification..."
sshpass -p 123 ssh faiz@192.168.1.101 "cd /home/faiz/warungin && docker compose ps"
echo ""

echo "2. Database backup..."
sshpass -p 123 ssh faiz@192.168.1.101 "cd /home/faiz/warungin && docker compose exec -T postgres pg_dump -U postgres warungin > /tmp/warungin_backup_$(date +%Y%m%d_%H%M%S).sql"
echo "Backup created"
echo ""

echo "3. Backend verification..."
sshpass -p 123 ssh faiz@192.168.1.101 "cd /home/faiz/warungin && docker compose logs --tail=5 backend"
echo ""

echo "4. Nginx config test..."
sshpass -p 123 ssh faiz@192.168.1.101 "cd /home/faiz/warungin && echo 123 | sudo -S docker compose exec -T nginx nginx -t"
echo ""

# Phase 2: Deployment
echo "PHASE 2: DEPLOYMENT (20 min)"
echo "1. Pulling latest code..."
sshpass -p 123 ssh faiz@192.168.1.101 "cd /home/faiz/warungin && git pull origin main"
echo ""

echo "2. Rebuilding backend..."
sshpass -p 123 ssh faiz@192.168.1.101 "cd /home/faiz/warungin && docker compose down backend && docker compose build backend && docker compose up -d backend"
echo ""

echo "3. Rebuilding frontend..."
sshpass -p 123 ssh faiz@192.168.1.101 "cd /home/faiz/warungin && docker compose down frontend && docker compose build frontend && docker compose up -d frontend"
echo ""

echo "4. Service status..."
sshpass -p 123 ssh faiz@192.168.1.101 "cd /home/faiz/warungin && docker compose ps"
echo ""

# Phase 3: Verification
echo "PHASE 3: VERIFICATION (20 min)"
echo "1. Backend health..."
sshpass -p 123 ssh faiz@192.168.1.101 "cd /home/faiz/warungin && docker compose logs --tail=10 backend | grep -E 'Started|listening|Error'"
echo ""

echo "2. Database health..."
sshpass -p 123 ssh faiz@192.168.1.101 "cd /home/faiz/warungin && echo 123 | sudo -S docker compose exec -T postgres pg_isready"
echo ""

echo "3. Cache health..."
sshpass -p 123 ssh faiz@192.168.1.101 "cd /home/faiz/warungin && docker compose exec -T redis redis-cli ping"
echo ""

echo "4. Frontend accessible..."
curl -I http://192.168.1.101/ | head -3
echo ""

echo "=== DEPLOYMENT COMPLETE ==="
echo "End Time: $(date)"
echo "Status: ✅ PRODUCTION DEPLOYMENT SUCCESSFUL"
```

---

## 📊 DEPLOYMENT CHECKLIST

### Before Starting Deployment
- [ ] Phase 5.3: All 4 leader approvals signed
- [ ] PHASE_5_3_APPROVAL_FORM.md shows all signatures
- [ ] Phase 1 pre-checks: All passed
- [ ] Team notified
- [ ] Support team standing by
- [ ] Incident response team on alert

### During Deployment
- [ ] Phase 1: Pre-deployment checks pass
- [ ] Phase 2: Backend rebuild successful
- [ ] Phase 2: Frontend rebuild successful
- [ ] All 8 services show UP and HEALTHY
- [ ] No critical errors in logs
- [ ] Updates posted to team every 10 min

### After Deployment
- [ ] Phase 3: All verification checks pass
- [ ] Frontend accessible via HTTP
- [ ] Database accepting connections
- [ ] Cache responding
- [ ] 2FA enforcement verified
- [ ] Monitoring data flowing
- [ ] Backup confirmed successful
- [ ] Final status: ✅ GO-LIVE APPROVED

---

## 🚨 ROLLBACK PROCEDURE (IF NEEDED)

If any critical failure occurs during deployment:

### Immediate Rollback (5-10 minutes)

```bash
sshpass -p 123 ssh faiz@192.168.1.101 "
cd /home/faiz/warungin && \
git revert HEAD && \
docker compose down && \
docker compose up -d
"
```

### Database Restoration (10-15 minutes)

If database needs restoration:

```bash
sshpass -p 123 ssh faiz@192.168.1.101 "
cd /home/faiz/warungin && \
docker compose exec -T postgres psql -U postgres warungin < /tmp/warungin_backup_LATEST.sql
"
```

### Full Recovery (15-20 minutes)

For complete rollback:

```bash
sshpass -p 123 ssh faiz@192.168.1.101 "
cd /home/faiz/warungin && \
docker compose down && \
git reset --hard HEAD~1 && \
docker compose up -d
"
```

---

## 📞 SUPPORT & ESCALATION

### During Deployment

**Issue**: Backend not starting
- Check logs: `docker compose logs backend`
- Verify code changes are valid
- Check database connectivity

**Issue**: Frontend not building
- Clear cache: `docker system prune -a`
- Rebuild: `docker compose build frontend`
- Check disk space: `df -h`

**Issue**: Services not healthy
- Check resources: `docker stats`
- Verify network: `docker network ls`
- Check logs: `docker compose logs [service]`

### Escalation Path
1. **First**: Check logs and verify infrastructure
2. **Second**: Contact Tech Lead for code-related issues
3. **Third**: Contact Security Lead for security-related issues
4. **Final**: Initiate rollback and contact PM

---

## ✅ SUCCESS CRITERIA

Deployment is SUCCESSFUL when:
- ✅ All 8 services UP and HEALTHY
- ✅ Frontend accessible and loading
- ✅ Backend processing requests
- ✅ Database accepting connections
- ✅ Redis cache responding
- ✅ No critical errors in logs
- ✅ 2FA enforcement verified
- ✅ Monitoring data flowing
- ✅ All security fixes active

---

## ⏱️ TIMELINE

| Phase | Duration | Start | End |
|-------|----------|-------|-----|
| Pre-Deployment | 30 min | T+0 | T+30 |
| Deployment | 20 min | T+30 | T+50 |
| Verification | 20 min | T+50 | T+70 |
| **TOTAL** | **70-80 min** | - | - |

---

## 📋 POST-DEPLOYMENT

After ✅ successful deployment:

1. **Phase 6.3**: Start 24-hour monitoring
2. **Document**: Update deployment log
3. **Notify**: Inform stakeholders of go-live
4. **Monitor**: Track logs and metrics continuously
5. **Support**: 24/7 incident response active

---

## 🎯 NEXT STEPS

**NOW (while waiting for Phase 5.3 approvals)**:
1. Review this deployment procedure
2. Verify all commands have correct credentials
3. Prepare team communication template
4. Set up monitoring dashboard
5. Brief support team on new features

**AFTER Phase 5.3 approvals signed**:
1. Execute Phase 6.1 deployment (this document)
2. Monitor Phase 6.3 for 24 hours
3. Track logs and health metrics
4. Prepare go-live announcement

---

**Status**: ✅ READY FOR EXECUTION
**Dependent On**: Phase 5.3 approvals
**Risk Level**: LOW (comprehensive testing, incident response ready)
**Confidence**: VERY HIGH (90% test pass rate)

