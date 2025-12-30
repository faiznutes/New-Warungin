# 🚨 INCIDENT RESPONSE & TROUBLESHOOTING GUIDE

**Project**: Warungin POS v1.1.0
**Status**: Production Deployment Ready
**Last Updated**: December 31, 2025

---

## 🆘 CRITICAL ISSUES RESPONSE MATRIX

### Issue 1: Backend Service Down (Status 500/Connection Refused)

**Severity**: 🔴 CRITICAL
**Impact**: All users unable to access system
**ETA to Resolution**: 5-15 minutes

#### Detection
```
Symptom: Browser shows "Cannot connect to server" or "500 Error"
Verification: curl -s http://localhost:8000/api/health returns error
```

#### Step-by-Step Resolution

**Step 1: Check Service Status** (1 minute)
```bash
# SSH to server
sshpass -p "password" ssh root@192.168.1.101

# Check container status
docker compose ps | grep backend

# Expected: warungin-backend   Up X minutes (healthy)
# If DOWN: proceed to Step 2
```

**Step 2: Check Logs for Errors** (2 minutes)
```bash
# Get last 50 lines of logs
docker compose logs --tail=50 backend | tail -30

# Look for:
# - Database connection errors
# - Memory/CPU errors
# - Application crash messages
```

**Step 3: Restart Service** (1 minute)
```bash
# Restart only backend service
docker compose restart backend

# Wait for health check
sleep 15

# Verify
curl -s http://localhost:8000/api/health | jq .
```

**Step 4: If Still Fails - Check Database** (2 minutes)
```bash
# Verify database is running
docker compose ps | grep postgres

# Test connection
docker compose exec backend \
  npm run db:health

# Expected: Database connected ✅
```

**Step 5: Full Recovery** (5 minutes)
```bash
# If all else fails, restart all services
docker compose down
sleep 5
docker compose up -d

# Monitor logs
docker compose logs -f --tail=20
```

**Status Restored**: ☐ YES / ☐ NO (escalate to Tech Lead)

---

### Issue 2: 2FA Not Appearing (CRITICAL Security Issue)

**Severity**: 🔴 CRITICAL (Security Vulnerability)
**Impact**: Unauthorized access possible (SUPER_ADMIN/ADMIN_TENANT bypass)
**ETA to Resolution**: Immediate rollback required

#### Detection
```
Symptom: SUPER_ADMIN or ADMIN_TENANT login bypasses 2FA
Verification: Login test shows dashboard without 2FA code prompt
```

#### Immediate Response

**STOP - DO NOT CONTINUE DEPLOYMENT**

**Step 1: Immediate Rollback** (5 minutes)
```bash
# SSH to server
sshpass -p "password" ssh root@192.168.1.101
cd /root/New-Warungin

# Find most recent backup
ls -lt backup-pre-deployment-*.tar.gz | head -1

# Extract backup
docker compose down
tar -xzf backup-pre-deployment-[TIMESTAMP].tar.gz

# Restart with previous version
docker compose up -d

# Verify 2FA works
# ... perform login test ...
```

**Step 2: Incident Report** (immediately)
```
TO: Security Lead, Tech Lead
SUBJECT: CRITICAL - 2FA Bypass Detected - Rollback Executed

Details:
- Issue: 2FA not appearing for admin roles
- Detection Time: [TIME]
- Rollback Time: [TIME]
- Status: System reverted to previous version
- Next Steps: Investigation required before re-deployment

Action Required: 
1. Security review required
2. Code review of 2FA implementation
3. Root cause analysis
4. Remediation plan
5. Re-testing before re-deployment
```

**Step 3: Investigation** (ongoing)
```bash
# Review recent code changes
git log --oneline -10

# Check specific file: src/middlewares/require2fa.ts
git show HEAD:src/middlewares/require2fa.ts | grep ADMIN_ROLES_REQUIRING_2FA

# Should show both roles:
# ADMIN_ROLES_REQUIRING_2FA = ['ADMIN_TENANT', 'SUPER_ADMIN']

# If different: identify who changed it
git log -p src/middlewares/require2fa.ts
```

**Resolution**: ☐ Root cause identified / ☐ Fix implemented / ☐ Re-testing scheduled

---

### Issue 3: Store Authorization Not Working (403 Not Returned)

**Severity**: 🔴 CRITICAL (Security Vulnerability)
**Impact**: Users can access unauthorized stores (data leak)
**ETA to Resolution**: Immediate rollback required

#### Detection
```
Symptom: SUPERVISOR can access stores not in allowedStoreIds
Verification: API returns 200 OK for unauthorized store access
```

#### Immediate Response

**STOP - DO NOT CONTINUE DEPLOYMENT**

**Step 1: Verify Issue** (2 minutes)
```bash
# Test store authorization
SUPERVISOR_TOKEN="[token_from_login]"
SUPERVISOR_ID="[supervisor_id]"
UNAUTH_STORE_ID="[store_not_assigned_to_supervisor]"

curl -s -X GET \
  "http://localhost:8000/api/stores/$UNAUTH_STORE_ID/analytics" \
  -H "Authorization: Bearer $SUPERVISOR_TOKEN" | jq .

# Expected: 403 Forbidden
# If 200 OK: CRITICAL ISSUE - ROLLBACK
```

**Step 2: Immediate Rollback** (5 minutes)
```bash
# SSH to server
sshpass -p "password" ssh root@192.168.1.101
cd /root/New-Warungin

# Rollback
docker compose down
tar -xzf backup-pre-deployment-[TIMESTAMP].tar.gz
docker compose up -d
```

**Step 3: Incident Report** (immediately)
```
TO: Security Lead, Tech Lead
SUBJECT: CRITICAL - Store Authorization Bypass - Rollback Executed

Issue: Users can access unauthorized stores (data leak)
Time: [DETECTED_TIME]
Rollback: [ROLLBACK_TIME]
Status: Previous version restored
Impact: [NUMBER_OF_POTENTIALLY_AFFECTED_USERS]

Required Investigation:
1. Supervisor store guard verification
2. Role-based access control audit
3. Database review for unauthorized access
4. Affected users notification
```

**Step 4: Investigation** (ongoing)
```bash
# Check supervisor store guard
git show HEAD:src/middlewares/supervisor-store-guard.ts

# Should contain:
# - checkSupervisorStores()
# - 403 Forbidden returns
# - allowedStoreIds validation

# Verify all route files have imports
grep -r "supervisorStoresGuard" src/routes/*.ts

# Should show in all relevant endpoints
```

**Resolution**: ☐ Rollback complete / ☐ Issue identified / ☐ Fix implemented

---

### Issue 4: Database Connection Lost

**Severity**: 🔴 CRITICAL
**Impact**: Cannot save data, system non-functional
**ETA to Resolution**: 10-20 minutes

#### Detection
```
Symptom: "Database connection error" in logs
Verification: docker compose ps shows postgres as unhealthy
```

#### Step-by-Step Resolution

**Step 1: Check Database Status** (1 minute)
```bash
# Check container status
docker compose ps | grep postgres

# Expected: warungin-postgres   Up X hours (healthy)

# If unhealthy or down:
docker compose logs --tail=20 postgres
```

**Step 2: Check Disk Space** (1 minute)
```bash
# Check if disk is full (common cause)
df -h /root/New-Warungin

# If ~100% used:
# - Find large log files
# - Delete old backups
# - Clean Docker volumes
```

**Step 3: Check Database File Integrity** (2 minutes)
```bash
# Run database check
docker compose exec postgres \
  pg_dump warungin > /tmp/test-dump.sql

# If succeeds: database is OK
# If fails: database corruption suspected

echo $?  # 0 = success, 1 = failure
```

**Step 4: Restart Database** (1 minute)
```bash
# Restart database service
docker compose restart postgres

# Wait for health check
sleep 30

# Verify connection
docker compose exec postgres \
  psql -U warungin -d warungin -c "SELECT COUNT(*) FROM users;"

# Should return a number (users count)
```

**Step 5: Reconnect Backend** (2 minutes)
```bash
# Restart backend to reconnect
docker compose restart backend

# Verify
curl -s http://localhost:8000/api/health | jq .

# Expected: {"status":"ok"}
```

**Step 6: Verify No Data Loss** (5 minutes)
```bash
# Check recent data
docker compose exec postgres psql -U warungin -d warungin << EOF
-- Check last 10 transactions
SELECT id, created_at FROM transactions ORDER BY created_at DESC LIMIT 10;
-- Check user count
SELECT COUNT(*) as user_count FROM users;
-- Check order count  
SELECT COUNT(*) as order_count FROM orders;
EOF
```

**Status Restored**: ☐ YES / ☐ NO (escalate to Database Admin)

---

### Issue 5: High Error Rate / Slow Performance

**Severity**: 🟠 HIGH
**Impact**: Users report slow system or intermittent errors
**ETA to Resolution**: 15-30 minutes

#### Detection
```
Symptom: "Slow loading" reports or frequent API 500 errors
Verification: Backend logs show >10 errors/minute OR API >5000ms
```

#### Investigation Steps

**Step 1: Check System Resources** (2 minutes)
```bash
# Check CPU and Memory
docker stats

# Look for high usage:
# - CPU >80% = resource constraint
# - Memory >80% = memory leak possible
```

**Step 2: Review Error Logs** (5 minutes)
```bash
# Get errors from last 10 minutes
docker compose logs --since 10m backend | grep -i error | tail -50

# Analyze patterns:
# - Database timeouts?
# - Memory errors?
# - Network errors?
# - Application errors?
```

**Step 3: Check Database Queries** (5 minutes)
```bash
# Find slow queries (>1000ms)
docker compose exec postgres psql -U warungin -d warungin << EOF
SELECT query, mean_exec_time FROM pg_stat_statements 
WHERE mean_exec_time > 1000 
ORDER BY mean_exec_time DESC 
LIMIT 10;
EOF
```

**Step 4: Clear Cache** (1 minute)
```bash
# Restart Redis to clear cache
docker compose restart redis

# Wait for restart
sleep 10
```

**Step 5: Monitor Performance** (5 minutes)
```bash
# Watch logs for errors
docker compose logs -f --tail=20 backend

# Monitor error rate
# Expected: <1 error/minute in normal operation
```

**Step 6: If Issues Persist** (escalate)
```bash
# Capture diagnostic information
docker compose logs --tail=100 > /tmp/diagnostic-logs.txt
docker stats --no-stream > /tmp/system-stats.txt
docker compose ps > /tmp/service-status.txt

# Email to Tech Lead for analysis
```

**Status Resolved**: ☐ YES / ☐ NO (escalate to Tech Lead)

---

### Issue 6: Session/Token Problems (Users Keep Getting Logged Out)

**Severity**: 🟡 MEDIUM
**Impact**: Users frustrated, workflow interrupted
**ETA to Resolution**: 10-15 minutes

#### Detection
```
Symptom: "Session expired" messages, frequent logouts
Verification: Users report being logged out randomly
```

#### Investigation Steps

**Step 1: Check Redis Status** (1 minute)
```bash
# Verify Redis is running
docker compose ps | grep redis

# Test connection
docker compose exec redis redis-cli PING

# Expected: PONG
```

**Step 2: Check Session Store** (2 minutes)
```bash
# Count sessions in Redis
docker compose exec redis redis-cli DBSIZE

# Get session details
docker compose exec redis redis-cli KEYS "session:*" | head -20

# If very few sessions: tokens might not be storing
```

**Step 3: Review Token Configuration** (3 minutes)
```bash
# Check backend environment
docker compose exec backend env | grep -i jwt

# Check client localStorage/sessionStorage
# Open browser DevTools → Application → Storage
# Look for: auth_token, refresh_token, shift_cache

# If missing: check auth.ts implementation
```

**Step 4: Check Refresh Token Endpoint** (2 minutes)
```bash
# Test refresh token
curl -s -X POST http://localhost:8000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"[token]"}' | jq .

# Should return new access token
```

**Step 5: Clear and Recache** (2 minutes)
```bash
# Restart Redis
docker compose restart redis

# Clear client cache
# Browser: DevTools → Application → Clear Site Data

# Test login again
# User should stay logged in
```

**Step 6: Monitor Session Behavior** (5 minutes)
```bash
# Watch for session errors
docker compose logs -f --tail=20 backend | grep -i session

# Should see healthy session creation/refresh
```

**Status Resolved**: ☐ YES / ☐ NO (check client implementation)

---

## ⚡ QUICK RESTART PROCEDURES

### Quick Fix #1: Full Service Restart (5 minutes)
```bash
# When unsure what's wrong, try full restart
docker compose down
sleep 5
docker compose up -d

# Monitor
docker compose logs -f --tail=20
```

### Quick Fix #2: Clear All Caches
```bash
# Redis cache
docker compose exec redis redis-cli FLUSHALL

# Browser cache (instruct user)
# DevTools → Application → Clear Site Data
```

### Quick Fix #3: Database Recovery
```bash
# Create fresh backup
docker compose exec postgres \
  pg_dump warungin > /tmp/backup-$(date +%s).sql

# Verify integrity
docker compose exec postgres psql -U warungin -d warungin -c \
  "SELECT COUNT(*) FROM users;"
```

### Quick Fix #4: Check All Services
```bash
# Comprehensive status check
echo "=== Service Status ===" && docker compose ps
echo -e "\n=== Backend Health ===" && curl -s http://localhost:8000/api/health | jq .
echo -e "\n=== Database ===" && docker compose exec postgres psql -U warungin -d warungin -c "SELECT NOW();"
echo -e "\n=== Redis ===" && docker compose exec redis redis-cli PING
echo -e "\n=== Frontend ===" && curl -s http://192.168.1.101 | head -5
```

---

## 🔍 MONITORING COMMANDS

### Real-Time Service Monitoring
```bash
# Watch services continuously
watch -n 5 'docker compose ps'

# Watch logs in real-time
docker compose logs -f --tail=50

# Watch specific service
docker compose logs -f backend
```

### Error Detection
```bash
# Find all errors in last hour
docker compose logs --since 1h | grep -i "error\|exception\|fail" | wc -l

# Get errors with context
docker compose logs --since 1h | grep -i "error" -A 2 -B 2
```

### Performance Monitoring
```bash
# CPU and Memory usage
docker stats --no-stream

# Watch in real-time
docker stats

# Database connections
docker compose exec postgres psql -U warungin -d warungin -c \
  "SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;"
```

### User Activity
```bash
# Active sessions
docker compose exec postgres psql -U warungin -d warungin -c \
  "SELECT COUNT(*) as active_sessions FROM sessions WHERE expires_at > NOW();"

# Recent logins
docker compose exec postgres psql -U warungin -d warungin -c \
  "SELECT user_id, email, created_at FROM activity_logs WHERE action='LOGIN' ORDER BY created_at DESC LIMIT 10;"
```

---

## 📞 ESCALATION PROCEDURE

### Level 1: Self Resolution (10 minutes)
Try quick fixes listed above. If issue persists → escalate.

### Level 2: Tech Lead Notification (immediate if not resolved)
```
Email: [TECH_LEAD_EMAIL]
Phone: [PHONE_NUMBER]

Subject: Production Issue - [SERVICE NAME] - [SEVERITY]

Details:
- Service affected: [NAME]
- Issue: [DESCRIPTION]
- Duration: [TIME_STARTED]
- Error messages: [COPY_FROM_LOGS]
- Steps taken: [QUICK_FIXES_TRIED]
- Status: [UNRESOLVED]

Please advise on next steps.
```

### Level 3: Emergency Rollback (if not resolved in 15 min)
```bash
# Execute rollback procedures from Issue #1
docker compose down
tar -xzf backup-pre-deployment-[TIMESTAMP].tar.gz
docker compose up -d
```

### Level 4: Post-Incident Review (after resolution)
- What went wrong
- When was it detected
- How was it fixed
- How to prevent recurrence
- Documentation updates needed

---

## 📋 INCIDENT LOG TEMPLATE

```
INCIDENT REPORT
=====================================

Incident ID: [AUTO_GENERATED]
Date/Time: __________________________
Severity: ☐ CRITICAL / ☐ HIGH / ☐ MEDIUM
Status: ☐ DETECTED / ☐ IN_PROGRESS / ☐ RESOLVED

Symptoms:
________________________________________________________________________
________________________________________________________________________

Root Cause:
________________________________________________________________________
________________________________________________________________________

Impact:
- Users affected: _________
- Duration: _________
- Data loss: ☐ NONE / ☐ YES
- Security impact: ☐ NO / ☐ YES

Resolution Steps:
1. ________________________________________________________________________
2. ________________________________________________________________________
3. ________________________________________________________________________

Time to Resolution: _________ minutes

Prevention:
________________________________________________________________________
________________________________________________________________________

Lessons Learned:
________________________________________________________________________
________________________________________________________________________

Follow-up Actions:
- [ ] Code review
- [ ] Update documentation
- [ ] Team training
- [ ] Monitoring improvement
- [ ] Other: _________________________

Reviewed By: _________________________ Date: ___________
```

---

## ✅ PREVENTION CHECKLIST

- [x] All 15 security issues fixed
- [x] 2FA working & not bypassable
- [x] Store authorization verified
- [x] Shift caching working
- [ ] Monitoring configured
- [ ] Alerts set up
- [ ] Backup procedures tested
- [ ] Incident response trained
- [ ] Escalation contacts ready
- [ ] Documentation complete

---

**Incident Response Guide Version**: 1.0
**Status**: Ready for production use
**Last Updated**: December 31, 2025
**Next Review**: Monthly or after incident
