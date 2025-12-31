# 🧪 PHASE 5.1 - SMOKE TEST EXECUTION

**Status**: Ready to Execute
**Timeline**: 15 minutes
**Goal**: Score 9-10/10 items to PASS ✅

---

## 📋 PRE-TEST SETUP (Do This First)

### Step 1: Verify All Services Running (2 min)

Open WSL Terminal and check:

```bash
# Open WSL
wsl

# SSH to server
sshpass -p "your_password" ssh root@192.168.1.101

# Check all 8 services
docker compose -f /root/New-Warungin/docker-compose.yml ps
```

**Expected Output:**
```
NAME                    STATUS              
warungin-backend        Up X hours (healthy)
warungin-frontend       Up X hours (healthy)
warungin-postgres       Up X hours (healthy)
warungin-redis          Up X hours (healthy)
warungin-nginx          Up X hours (healthy)
warungin-loki           Up X hours
warungin-promtail       Up X hours
warungin-cloudflared    Up X hours
```

**Verification**: ☐ All 8 services UP and HEALTHY

---

## 🧪 SMOKE TEST - 10 ITEMS (15 Minutes)

### Test 1: Frontend Loading (1 min)

```
ACTION:
1. Open browser: http://192.168.1.101
2. Wait for page load (measure time)
3. Check: Login form visible?
4. Check: No console red errors?

RESULTS:
- Load time: _________ seconds (target: <3)
- Login form visible: ☐ YES / ☐ NO
- Console errors: ☐ NONE / ☐ HAS ERRORS

RESULT: ☐ PASS / ☐ FAIL
```

---

### Test 2: SUPER_ADMIN Login + 2FA (CRITICAL) (2 min)

```
ACTION:
1. Input SUPER_ADMIN email & password (ask if need credentials)
2. Check: 2FA form MUST appear
3. Try to bypass 2FA (click dashboard without 2FA code)
4. Check: Cannot bypass, stays on 2FA form
5. Input valid 2FA code
6. Check: Dashboard loads

CRITICAL CHECKS:
- 2FA form appeared: ☐ YES / ☐ NO
- Cannot bypass 2FA: ☐ CORRECT / ☐ CAN BYPASS (FAIL!)
- Dashboard loaded: ☐ YES / ☐ NO

RESULT: ☐ PASS / ☐ FAIL
```

---

### Test 3: ADMIN_TENANT Login + 2FA (CRITICAL) (2 min)

```
ACTION:
1. Logout from SUPER_ADMIN
2. Input ADMIN_TENANT email & password
3. Check: 2FA form MUST appear
4. Try to bypass (click dashboard without code)
5. Check: Cannot bypass
6. Input 2FA code
7. Check: Dashboard / store selector appears

CRITICAL CHECKS:
- 2FA form appeared: ☐ YES / ☐ NO
- Cannot bypass: ☐ CORRECT / ☐ CAN BYPASS (FAIL!)
- Dashboard loaded: ☐ YES / ☐ NO

RESULT: ☐ PASS / ☐ FAIL
```

---

### Test 4: SUPERVISOR Login (NO 2FA) (1.5 min)

```
ACTION:
1. Logout
2. Input SUPERVISOR email & password
3. Check: 2FA form should NOT appear
4. Check: Store selector shows ONLY assigned stores
5. Try to access: Select one assigned store
6. Check: Dashboard opens

EXPECTED:
- 2FA form: ☐ DOES NOT APPEAR / ☐ APPEARS (should NOT)
- Stores shown: ☐ ONLY ASSIGNED / ☐ ALL STORES (wrong!)
- Can access assigned store: ☐ YES / ☐ NO

RESULT: ☐ PASS / ☐ FAIL
```

---

### Test 5: CASHIER Login (1.5 min)

```
ACTION:
1. Logout
2. Input CASHIER email & password (ask for credentials)
3. Check: Auto-assigned to store
4. Check: Shift status loaded
5. Check: Dashboard accessible
6. Check: Cannot access other stores

EXPECTED:
- Auto-assigned: ☐ YES / ☐ NO
- Shift loaded: ☐ YES / ☐ NO
- Dashboard accessible: ☐ YES / ☐ NO
- Cannot access other stores: ☐ CORRECT / ☐ CAN ACCESS (wrong!)

RESULT: ☐ PASS / ☐ FAIL
```

---

### Test 6: Shift Caching (5s TTL - CRITICAL) (2 min)

```
ACTION:
1. Open DevTools: F12 → Network tab
2. Filter by: "shift" or "store-shift"
3. Clear Network tab
4. Logout and login again
5. Check 1st shift API call - note response time (e.g., 250ms)
6. Refresh page 4 times (F5)
7. Check: Shift API called only 1 time (cached 4 times)
8. Calculate API reduction: (1 out of 5) = 80% reduction (target: 90%+)

MEASUREMENTS:
- 1st shift API call time: _________ ms
- Subsequent calls: CACHED (not shown in Network)
- Total calls out of 5: _________ calls
- API reduction: _________ %

CRITICAL CHECKS:
- Called only once: ☐ YES / ☐ NO (if >1 = FAIL!)
- Reduction 90%+: ☐ YES / ☐ NO
- Cache working: ☐ YES / ☐ NO

RESULT: ☐ PASS / ☐ FAIL
```

---

### Test 7: 2FA Security Verification (CRITICAL) (1 min)

```
CHECK CODE (or test behavior):
File: src/middlewares/require2fa.ts

VERIFICATION:
- SUPER_ADMIN requires 2FA: ☐ YES / ☐ NO (should be YES)
- ADMIN_TENANT requires 2FA: ☐ YES / ☐ NO (should be YES)
- SUPERVISOR requires 2FA: ☐ NO / ☐ YES (should be NO)
- CASHIER requires 2FA: ☐ NO / ☐ YES (should be NO)
- Cannot bypass 2FA: ☐ CORRECT / ☐ BYPASSABLE (checked in tests 2 & 3)

RESULT: ☐ PASS / ☐ FAIL
```

---

### Test 8: Store Authorization (403 for Unauthorized - CRITICAL) (2 min)

```
SETUP:
1. Login as SUPERVISOR (from Test 4)
2. Open DevTools → Application/Storage → Cookies or LocalStorage
3. Find and copy Authorization token (usually under Authorization header)
4. Get list of stores - note one UNAUTHORIZED store ID

TEST:
Using Postman or curl, make this request:

curl -X GET \
  http://192.168.1.101:8000/api/stores/[UNAUTHORIZED_STORE_ID]/analytics \
  -H "Authorization: Bearer [YOUR_TOKEN_HERE]"

EXPECTED RESPONSES:
- For assigned store (should be 200 OK):
  curl -X GET \
    http://192.168.1.101:8000/api/stores/[ASSIGNED_STORE_ID]/analytics \
    -H "Authorization: Bearer [YOUR_TOKEN_HERE]"

RESULTS:
- Authorized store response: _________ (should be 200)
- Unauthorized store response: _________ (should be 403)

CRITICAL CHECK:
- Unauthorized returns 403: ☐ YES / ☐ NO (if not 403 = FAIL!)
- Assigned returns 200: ☐ YES / ☐ NO

RESULT: ☐ PASS / ☐ FAIL
```

---

### Test 9: Console Errors Check (1 min)

```
ACTION:
1. Open DevTools: F12 → Console tab
2. Look for RED error messages
3. Check for "unhandled promise rejection"
4. Count total errors

OBSERVATION:
- Red error messages: ☐ NONE / ☐ 1 / ☐ 2+ 
- Promise rejections: ☐ NONE / ☐ HAS
- Overall console status: ☐ CLEAN / ☐ HAS ERRORS

TARGET: 0 errors

RESULT: ☐ PASS (0 errors) / ☐ FAIL
```

---

### Test 10: Backend Health Check (1 min)

```
ACTION:
1. Open new browser tab
2. Visit: http://192.168.1.101:8000/api/health
3. Check response

EXPECTED RESPONSE:
{
  "status": "ok",
  "timestamp": "2025-12-31T...",
  "version": "1.1.0"
}

OR USE CURL:
curl -s http://192.168.1.101:8000/api/health | jq .

RESULTS:
- Response status: _________ (should be 200)
- Status field: _________ (should be "ok")
- Timestamp: ☐ PRESENT / ☐ MISSING
- Version: _________ (should be 1.1.0)

RESULT: ☐ PASS / ☐ FAIL
```

---

## 📊 SMOKE TEST SCORING

```
Total Tests: 10
Passed: _____ / 10
Failed: _____ / 10

SCORING INTERPRETATION:
9-10 PASS  🟢 EXCELLENT  → Proceed to Phase 5.2 (Full Test Suite)
6-8 PASS   🟡 ACCEPTABLE → Review failed items, decide on proceed
0-5 PASS   🔴 FAIL       → Must fix issues, retest before Phase 5.2
```

---

## ✅ SMOKE TEST CHECKLIST

- [ ] Services verified running
- [ ] Test 1: Frontend loading - ☐ PASS
- [ ] Test 2: SUPER_ADMIN + 2FA - ☐ PASS
- [ ] Test 3: ADMIN_TENANT + 2FA - ☐ PASS
- [ ] Test 4: SUPERVISOR (no 2FA) - ☐ PASS
- [ ] Test 5: CASHIER login - ☐ PASS
- [ ] Test 6: Shift caching 90%+ - ☐ PASS
- [ ] Test 7: 2FA security verification - ☐ PASS
- [ ] Test 8: Store authorization 403 - ☐ PASS
- [ ] Test 9: Console errors (0 found) - ☐ PASS
- [ ] Test 10: Backend health check - ☐ PASS
- [ ] Final Score: _____ / 10

---

## 📝 RESULTS DOCUMENTATION

After completing all 10 tests:

**File to save results:**
`COMPLETE_TEST_RESULTS_AND_APPROVALS.md`

Fill in:
- Each test result (PASS/FAIL)
- Any error messages found
- Screenshots if applicable
- Overall scoring

---

## 🎯 NEXT STEPS (Based on Score)

### If 9-10/10 PASS ✅
→ Proceed to **Phase 5.2: Full Test Suite**
→ Open: `COMPREHENSIVE_TEST_PLAN.md`
→ Timeline: 2-4 hours
→ 40+ additional test cases

### If 6-8/10 PASS 🟡
→ Review failed items
→ Contact tech team for issues
→ Retest after fixes

### If 0-5/10 PASS 🔴
→ Critical issues found
→ Contact tech lead immediately
→ Fix and retest

---

## 🚀 START NOW!

1. Open WSL Terminal
2. SSH to server
3. Verify services running
4. Open browser to http://192.168.1.101
5. Start with Test 1 (Frontend Loading)
6. Complete all 10 tests
7. Record all results
8. Save to COMPLETE_TEST_RESULTS_AND_APPROVALS.md

**Time Required**: 15 minutes
**Expected Result**: 9-10/10 PASS ✅

---

**Status**: Ready to Execute
**Date**: December 31, 2025
**Phase**: 5.1 Smoke Test
