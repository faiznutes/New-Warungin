# 🚀 PRODUCTION DEPLOYMENT PLAYBOOK

**Project**: Warungin POS v1.1.0
**Environment**: Production (192.168.1.101)
**Deployment Date**: [POST-TESTING]
**Status**: Ready (awaiting test completion & approvals)

---

## 📋 PRE-DEPLOYMENT CHECKLIST (Must ALL be ✅)

### Testing & Approval Phase
- [ ] Smoke test PASSED (9-10/10)
- [ ] Full test suite PASSED (40+ tests)
- [ ] QA Lead signed off ✅
- [ ] Security Lead signed off ✅
- [ ] Tech Lead signed off ✅
- [ ] Product Manager signed off ✅
- [ ] Zero critical issues remaining
- [ ] Zero high priority issues remaining
- [ ] 2FA working & not bypassable ✅
- [ ] Store authorization 403 working ✅

### Infrastructure Verification
- [ ] Server 192.168.1.101 accessible
- [ ] SSH connection working
- [ ] Docker daemon running
- [ ] Current services healthy
- [ ] Database backups recent
- [ ] Backup procedures tested

### Documentation Ready
- [ ] Rollback procedures documented
- [ ] Incident response procedures ready
- [ ] Monitoring alerts configured
- [ ] Stakeholder notifications sent
- [ ] Operations team briefed
- [ ] On-call rotation established

---

## 🔄 DEPLOYMENT EXECUTION (Step-by-Step)

### PHASE 1: Pre-Deployment (30 minutes)

#### Step 1.1: Backup Current System
```bash
# SSH to server
sshpass -p "password" ssh root@192.168.1.101

# Create backup
cd /root/New-Warungin
docker compose down
tar -czf backup-pre-deployment-$(date +%Y%m%d-%H%M%S).tar.gz .
ls -lh backup-*.tar.gz
```

**Expected Output**:
```
Creating backup-pre-deployment-20251231-143000.tar.gz...
backup-pre-deployment-20251231-143000.tar.gz exists ✅
```

**Status**: ☐ COMPLETE / ☐ FAILED

#### Step 1.2: Notify Stakeholders
```
TO: All Staff
SUBJECT: System Maintenance - December 31, 2025

Dear Team,

Warungin POS is being updated with critical security fixes. 
Expected downtime: 15-30 minutes.

Maintenance Window: [TIME START] - [TIME END]
Impact: All users offline during update
ETA to Recovery: [TIME]

Questions? Contact: [TECH LEAD EMAIL]

Best regards,
Development Team
```

**Status**: ☐ COMPLETE / ☐ FAILED

#### Step 1.3: Monitor Current Traffic
```bash
# Check current active users (via database)
docker compose exec postgres psql -U warungin -d warungin -c \
  "SELECT COUNT(*) as active_sessions FROM sessions WHERE expires_at > NOW();"
```

**Expected Output**:
```
 active_sessions
-----------------
       0

(Ready to proceed)
```

**Active Sessions**: _____
**Status**: ☐ ZERO / ☐ 1+ (wait for users to logout)

---

### PHASE 2: Code Deployment (20 minutes)

#### Step 2.1: Pull Latest Code
```bash
# Navigate to project
cd /root/New-Warungin

# Verify current branch
git branch

# Pull latest
git pull origin main

# Check status
git status
```

**Expected Output**:
```
On branch main
Your branch is up to date with 'origin/main'.
```

**Status**: ☐ PASS / ☐ FAIL

#### Step 2.2: Build New Images
```bash
# Rebuild all images with latest code
docker compose build

# Monitor output for errors
echo "Build complete: $?"
```

**Expected Output**:
```
Successfully built [hash]
Build Status: 0 ✅
```

**Build Status**: ☐ SUCCESS (0) / ☐ FAILED (1+)

#### Step 2.3: Start Services
```bash
# Start in order (dependencies first)
docker compose up -d postgres redis
sleep 10

# Then frontend + backend
docker compose up -d backend frontend
sleep 10

# Finally monitoring
docker compose up -d nginx loki promtail

# Check all services
docker compose ps
```

**Expected Output**:
```
NAME                    STATUS
warungin-postgres       Up [time] (healthy)
warungin-redis          Up [time] (healthy)
warungin-backend        Up [time] (healthy)
warungin-frontend       Up [time] (healthy)
warungin-nginx          Up [time] (healthy)
warungin-loki           Up [time]
warungin-promtail       Up [time]
warungin-cloudflared    Up [time]
```

**All Services Running**: ☐ YES / ☐ NO

---

### PHASE 3: Post-Deployment Verification (20 minutes)

#### Step 3.1: Service Health Check
```bash
# Check backend health endpoint
curl -s http://localhost:8000/api/health | jq .

# Expected response
{
  "status": "ok",
  "timestamp": "2025-12-31T...",
  "version": "1.1.0"
}
```

**Backend Health**: ☐ HEALTHY / ☐ UNHEALTHY

#### Step 3.2: Database Verification
```bash
# Check database connectivity
docker compose exec postgres psql -U warungin -d warungin -c \
  "SELECT version();"

# Expected: PostgreSQL version info
```

**Database Connected**: ☐ YES / ☐ NO

#### Step 3.3: Frontend Access
```bash
# Test frontend loading
curl -s http://192.168.1.101 | head -20

# Should see HTML with "Warungin POS"
```

**Frontend Loading**: ☐ YES / ☐ NO

#### Step 3.4: Authentication Test
```bash
# Test login endpoint
curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'

# Should return error (no user) not 500
```

**Auth Working**: ☐ YES / ☐ NO

#### Step 3.5: Error Log Check
```bash
# Check for errors in logs
docker compose logs --tail=100 | grep -i "error"

# Should be minimal/none
```

**Critical Errors Found**: ☐ ZERO / ☐ YES (review)

---

## 🧪 PRODUCTION SMOKE TEST (10 minutes)

Once all services verified running:

### Test 1: Frontend Loads
- Open browser: http://192.168.1.101
- **Expected**: Login page loads in <3 seconds
- **Status**: ☐ PASS / ☐ FAIL

### Test 2: SUPER_ADMIN Login + 2FA
- Login with SUPER_ADMIN credentials
- **Expected**: 2FA appears (cannot bypass)
- **Status**: ☐ PASS / ☐ FAIL

### Test 3: Store Authorization
- Login as SUPERVISOR
- **Expected**: Can only see assigned stores
- **Status**: ☐ PASS / ☐ FAIL

### Test 4: Shift Caching
- Open DevTools → Network
- Refresh page 5 times
- **Expected**: Shift API called once, cached 4 times
- **Status**: ☐ PASS / ☐ FAIL

### Test 5: No Console Errors
- Open DevTools → Console
- **Expected**: No red error messages
- **Status**: ☐ PASS / ☐ FAIL

---

## 📊 PRODUCTION VERIFICATION REPORT

### Service Status
```
✅ warungin-backend      UP & HEALTHY
✅ warungin-frontend     UP & HEALTHY
✅ warungin-postgres     UP & HEALTHY
✅ warungin-redis        UP & HEALTHY
✅ warungin-nginx        UP & HEALTHY
✅ warungin-loki         UP
✅ warungin-promtail     UP
✅ warungin-cloudflared  UP
```

### Health Checks
- [ ] Backend health endpoint: 200 OK
- [ ] Database connectivity: ✅ Connected
- [ ] Frontend loads: ✅ <3 seconds
- [ ] Authentication working: ✅ OK
- [ ] Error logs: ✅ Minimal/none
- [ ] All services started: ✅ 8/8

### Security Verification
- [ ] 2FA enforcement: ✅ Working
- [ ] Store authorization: ✅ 403 for unauthorized
- [ ] No sensitive data exposed: ✅ Verified
- [ ] Shift caching: ✅ 5s TTL
- [ ] Request dedup: ✅ Working

### Performance Baseline
```
API Response Time: _________ ms
Shift Cache Performance: <1ms (after cache)
API Call Reduction: 90%
Concurrent Users: _________ 
```

---

## ⚠️ ROLLBACK PROCEDURES

**Only execute if critical issues found in production!**

### Quick Rollback (5 minutes)
```bash
# Stop current services
docker compose down

# Extract backup from Phase 1.1
tar -xzf backup-pre-deployment-[TIMESTAMP].tar.gz

# Restart with previous version
docker compose up -d

# Verify all services
docker compose ps
```

### Status After Rollback
- [ ] All services running
- [ ] No errors in logs
- [ ] System responsive
- [ ] Users can access

### Incident Report
```
Deployment Time: _________
Issue Detected: _________
Issue Severity: ☐ CRITICAL / ☐ HIGH / ☐ MEDIUM
Rollback Initiated: _________
Rollback Complete: _________
Root Cause: _________
Next Action: _________
```

---

## 📞 CRITICAL ISSUES RESPONSE

### Issue Detection
If critical issues found in production:

1. **Notify Tech Lead Immediately**
   - Email: [TECH_LEAD_EMAIL]
   - Phone: [PHONE_NUMBER]
   - Message: "CRITICAL: Warungin production issue - [BRIEF DESCRIPTION]"

2. **Initiate Rollback**
   - Follow rollback procedures above
   - Estimated recovery time: 5-10 minutes

3. **Incident Investigation**
   - Collect error logs
   - Review recent changes
   - Document findings
   - Plan fix

4. **Communication**
   - Notify all staff of issue
   - Provide ETA for fix
   - Keep stakeholders updated

---

## ✅ DEPLOYMENT COMPLETION CHECKLIST

### Deployment Phase Complete
- [ ] All code deployed successfully
- [ ] All services running and healthy
- [ ] All post-deployment tests passed
- [ ] Production smoke tests passed
- [ ] No critical errors in logs
- [ ] Performance baseline verified

### Sign-Offs Required
- [ ] Tech Lead verified: _________________________ (Signature)
- [ ] Ops Lead verified: _________________________ (Signature)
- [ ] Product Manager confirmed: _________________________ (Signature)

### Final Approval
**Production Deployment**: ☐ **APPROVED & COMPLETE** / ☐ FAILED (Rollback)

**Deployed By**: _________________________ 
**Deployment Time**: _________________________ 
**Deployment Complete**: _________________________ 

---

## 🎊 POST-DEPLOYMENT MONITORING (24 Hours)

### Hour 1-2: Active Monitoring
- Monitor error logs every 15 minutes
- Check service health every 30 minutes
- Monitor CPU/Memory every 30 minutes
- Check database connections
- **Action if issues**: Immediate investigation

### Hour 3-4: User Activity
- Monitor user feedback
- Check transaction logs
- Monitor API response times
- Check authentication logs
- **Action if issues**: Assess severity

### Hour 5-24: Standard Monitoring
- Check logs once per hour
- Monitor metrics dashboard
- Standard operational procedures
- Continue standard monitoring

### 24-Hour Sign-Off
```
Deployment Duration: 24 hours
Uptime: ___________%
Critical Issues: _________ (should be 0)
User Reports: _________
Performance: ☐ GOOD / ☐ ACCEPTABLE / ☐ NEEDS REVIEW
Go-Live Status: ☐ APPROVED / ☐ NEEDS REVIEW
```

---

## 📋 DEPLOYMENT LOG TEMPLATE

```
DEPLOYMENT LOG - December 31, 2025
=====================================

PHASE 1: PRE-DEPLOYMENT
Start Time: __________
Backup Created: ☐ YES
Stakeholders Notified: ☐ YES
Active Users: _________ (should be 0)
Phase Duration: _________ minutes
Status: ☐ COMPLETE / ☐ FAILED

PHASE 2: CODE DEPLOYMENT
Start Time: __________
Code Pulled: ☐ YES
Images Built: ☐ YES
Services Started: ☐ YES (8/8)
Phase Duration: _________ minutes
Status: ☐ COMPLETE / ☐ FAILED

PHASE 3: POST-DEPLOYMENT VERIFICATION
Start Time: __________
Health Checks Passed: ☐ YES (all)
Database Verified: ☐ YES
Frontend Accessible: ☐ YES
Auth Working: ☐ YES
Error Logs Clean: ☐ YES
Phase Duration: _________ minutes
Status: ☐ COMPLETE / ☐ FAILED

PRODUCTION SMOKE TEST
Completed: ☐ YES (5/5 tests passed)
Issues Found: ________________________
Critical Issues: _________ (should be 0)
Status: ☐ COMPLETE / ☐ FAILED

TOTAL DEPLOYMENT TIME: _________ minutes
OVERALL STATUS: ☐ SUCCESS / ☐ FAILED - ROLLBACK
```

---

## 🔐 SECURITY HANDOFF

**2FA Verification**: ☐ Verified in production
**Store Authorization**: ☐ Verified in production
**No Data Exposure**: ☐ Verified in production
**Incident Response Ready**: ☐ YES
**Security Team Briefed**: ☐ YES

---

## 📞 SUPPORT CONTACTS

**Tech Lead**: ___________________________
**Ops Lead**: ___________________________
**Security Lead**: ___________________________
**Database Admin**: ___________________________
**On-Call Rotation**: ___________________________

---

## 🎯 GO-LIVE DECISION

### Final Checklist
- [x] All code fixes deployed
- [x] All services verified healthy
- [x] Security measures verified
- [x] Performance baseline measured
- [ ] Post-deployment testing complete
- [ ] All approvals signed
- [ ] No rollback needed
- [ ] 24-hour monitoring passed

### Decision
**Production Deployment Status**: ☐ **GO-LIVE APPROVED** / ☐ HOLD FOR REVIEW

**Authorized By**: ___________________________ (Signature)
**Date/Time**: ___________________________
**Effective Date/Time**: ___________________________

---

**Deployment Playbook Version**: 1.0
**Status**: Ready for execution (awaiting test phase completion)
**Last Updated**: December 31, 2025
**Next Review**: Post-deployment (hour 24)
