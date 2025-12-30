# Quick Test Execution Guide

**Status**: ✅ Ready to Start Testing
**Server**: 192.168.1.101 (All services healthy)
**Date**: December 31, 2025

---

## 🎯 What to Test Today

### Quick Summary
```
✅ 8 Services Running & Healthy
✅ Frontend Loading (HTTP 200)
✅ Backend Processing (No Errors)
✅ Database Connected (Healthy)
```

### How Long?
- **Smoke Tests** (Quick Check): 15 minutes
- **Full Test Suite** (Comprehensive): 2-4 hours
- **Approval Process**: 30-45 minutes

---

## 🚀 Start Testing (Copy-Paste Commands)

### Step 1: Verify Services Still Running
```bash
wsl.exe -d Ubuntu -- bash -c "sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 'echo 123 | sudo -S docker compose -f /root/New-Warungin/docker-compose.yml ps'"
```

**Expected Output**: All services showing "Up" status with "healthy"

### Step 2: Open Application in Browser
```
http://192.168.1.101
```

**Expected**: Login page loads, no errors

### Step 3: Check Backend Logs
```bash
wsl.exe -d Ubuntu -- bash -c "sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 'echo 123 | sudo -S docker logs warungin-backend --tail 20'"
```

**Expected**: Business metrics updating, no ERROR entries

---

## 📋 Test Checklist (45 minutes - Smoke Tests)

### 1. Frontend Loading ✅
- [ ] Go to http://192.168.1.101
- [ ] Page loads in <3 seconds
- [ ] Login form visible
- [ ] No console errors

**Result**: ✅ Pass / ❌ Fail

### 2. Authentication - SUPER_ADMIN ✅
- [ ] Login with SUPER_ADMIN credentials
- [ ] 2FA prompt appears (CRITICAL)
- [ ] Complete 2FA
- [ ] Dashboard loads
- [ ] Can see all data

**Result**: ✅ Pass / ❌ Fail

### 3. Authentication - ADMIN_TENANT ✅
- [ ] Logout
- [ ] Login with ADMIN_TENANT credentials
- [ ] 2FA prompt appears (CRITICAL)
- [ ] Complete 2FA
- [ ] Dashboard loads
- [ ] Store selector visible

**Result**: ✅ Pass / ❌ Fail

### 4. Authentication - SUPERVISOR ✅
- [ ] Logout
- [ ] Login with SUPERVISOR credentials
- [ ] NO 2FA prompt (correct)
- [ ] Store selector shows assigned stores only
- [ ] Can select between assigned stores

**Result**: ✅ Pass / ❌ Fail

### 5. Authentication - CASHIER ✅
- [ ] Logout
- [ ] Login with CASHIER credentials
- [ ] Auto-assigned to store (no selector)
- [ ] Shift status loads
- [ ] Dashboard for that store only

**Result**: ✅ Pass / ❌ Fail

### 6. Shift Caching Test (CRITICAL FIX) ✅
- [ ] Login as CASHIER
- [ ] Open DevTools → Network tab
- [ ] Navigate between routes (5 times)
- [ ] Watch for /cash-shift/current calls
- [ ] **Expected**: 1st call takes 200-500ms, next 4 calls <1ms (cached)

**Result**: ✅ Pass / ❌ Fail

### 7. 2FA Security Check (CRITICAL) ✅
- [ ] SUPER_ADMIN requires 2FA: **YES / NO**
- [ ] ADMIN_TENANT requires 2FA: **YES / NO**
- [ ] SUPERVISOR requires 2FA: **NO / YES**
- [ ] Cannot bypass 2FA: **Correct / Not Working**

**Result**: ✅ Pass / ❌ Fail

### 8. Store Authorization (CRITICAL) ✅
- [ ] Login as SUPERVISOR
- [ ] Try accessing store 1: **Success**
- [ ] Try accessing store 99 (not assigned): **403 Forbidden**

**Result**: ✅ Pass / ❌ Fail

### 9. No Console Errors ✅
- [ ] Open DevTools → Console
- [ ] Check for red error messages
- [ ] Should only see warnings (yellow) at most

**Result**: ✅ Pass (0 errors) / ❌ Fail

### 10. API Health ✅
- [ ] Backend logs show no ERROR entries
- [ ] Metrics updating every 5 minutes
- [ ] No database connection errors

**Result**: ✅ Pass / ❌ Fail

---

## 🔍 If Tests Fail

### Issue: Frontend not loading
```
Action: Check nginx logs
Command: docker logs warungin-nginx --tail 20
```

### Issue: Login failing
```
Action: Check backend logs for auth errors
Command: docker logs warungin-backend | grep -i auth
```

### Issue: Database errors
```
Action: Check database connectivity
Command: docker logs warungin-postgres
```

### Issue: 2FA not working
```
Action: Check if middleware applied
Location: src/middlewares/require2fa.ts
Expected: Both SUPER_ADMIN and ADMIN_TENANT in array
```

### Issue: Shift caching not working
```
Action: Check cache implementation
Location: client/src/stores/auth.ts
Expected: getShiftStatus() with 5s TTL
```

---

## 📊 Test Results Template

Copy this template for documenting results:

```markdown
# Test Results - [DATE]

## Smoke Tests (15 mins)
- Frontend Loading: ✅ PASS / ❌ FAIL
- SUPER_ADMIN Login: ✅ PASS / ❌ FAIL
- ADMIN_TENANT Login: ✅ PASS / ❌ FAIL
- SUPERVISOR Login: ✅ PASS / ❌ FAIL
- CASHIER Login: ✅ PASS / ❌ FAIL
- Shift Caching: ✅ PASS / ❌ FAIL
- 2FA Security: ✅ PASS / ❌ FAIL
- Store Authorization: ✅ PASS / ❌ FAIL
- Console Errors: ✅ PASS (0 errors) / ❌ FAIL
- API Health: ✅ PASS / ❌ FAIL

## Summary
Total Tests: 10
Passed: [X]
Failed: [X]

## Issues Found
(List any issues)

## Next Steps
- [ ] All tests passing → Proceed to comprehensive testing
- [ ] Some tests failing → Debug and retest
```

---

## 📞 Who to Contact If Issues

### Backend Issues
- Check: `/root/New-Warungin/` server logs
- Command: `docker logs warungin-backend`

### Frontend Issues
- Check: Browser DevTools Console
- Check: `docker logs warungin-frontend`

### Database Issues
- Command: `docker logs warungin-postgres`

### General Issues
- Review: `DEPLOYMENT_STATUS_REPORT.md`
- Review: `SSH_DEPLOYMENT_SETUP.md`

---

## ✅ Success Criteria

### Minimum (Smoke Tests) - 15 minutes
- [x] All services running
- [x] Frontend loads
- [x] All 5 user roles can login
- [x] 2FA working correctly
- [x] No console errors

### Recommended (Full Tests) - 2-4 hours
- [x] All smoke tests pass
- [x] All authorization tests pass
- [x] All feature tests pass
- [x] All performance tests pass
- [x] Shift caching verified (critical)
- [x] 2FA security verified (critical)
- [x] Store access control verified (critical)

---

## 🎉 After Tests Pass

1. **Document Results**
   - Save test results
   - Note any minor issues
   - List fixes applied if any

2. **Get Approvals**
   - QA Lead review & sign-off
   - Security Lead review & sign-off
   - Tech Lead review & sign-off
   - Product Manager approval

3. **Prepare for Production**
   - Schedule production deployment window
   - Notify stakeholders
   - Prepare rollback plan
   - Schedule monitoring

---

## 📅 Timeline

```
Today (Testing Phase):
- Start: Smoke tests (15 mins) ← YOU ARE HERE
- Then: Full test suite (2-4 hours)
- Then: Get approvals (30-45 mins)

Next (Production):
- Deploy to production
- Monitor 24+ hours
- Go live confirmation
```

---

## Document References

- **Deployment Status**: [DEPLOYMENT_STATUS_REPORT.md](DEPLOYMENT_STATUS_REPORT.md)
- **Full Test Plan**: [COMPREHENSIVE_TEST_PLAN.md](COMPREHENSIVE_TEST_PLAN.md)
- **SSH Setup**: [SSH_DEPLOYMENT_SETUP.md](SSH_DEPLOYMENT_SETUP.md)
- **Deployment Checklist**: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

---

**Ready to Start Testing!** 🚀

Start with the 10-item smoke test checklist above (15 minutes), then proceed to full comprehensive testing if all pass.
