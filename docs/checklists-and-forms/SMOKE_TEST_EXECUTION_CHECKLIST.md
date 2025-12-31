# 🧪 PHASE 5.1 SMOKE TEST - EXECUTION CHECKLIST

**Date**: December 31, 2025
**Timeline**: 15 minutes
**Target Score**: 9-10/10 items PASS ✅

---

## 🔧 STEP 1: PRE-TEST SETUP (Do This First)

### Verify All Services Running (2 minutes)

**Option A: Using PowerShell (RECOMMENDED for Windows)**
1. Open PowerShell on your PC
2. Run the command below:

```powershell
# Test SSH connection first
ssh -i "C:\Users\Iz\.ssh\id_rsa" root@192.168.1.101 "docker compose -f /root/New-Warungin/docker-compose.yml ps"
```

**Option B: Direct Web Check**
1. Open browser: `http://192.168.1.101:8000/api/health`
2. Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-31T...",
  "version": "1.1.0"
}
```

**Verification Checkbox:**
- [ ] Services verified as running
- [ ] Backend responding at `/api/health`
- [ ] Frontend accessible at `http://192.168.1.101`

---

## 🧪 SMOKE TEST EXECUTION - 10 ITEMS

### ✅ TEST 1: Frontend Loading (1 minute)

**Steps:**
1. Open new browser tab/window
2. Navigate to: `http://192.168.1.101`
3. Wait for page to fully load
4. Open DevTools: Press `F12`
5. Click "Console" tab
6. Look for RED error messages

**Checklist:**
- [ ] Page loads successfully
- [ ] Load time: _____ seconds (target: <3 seconds)
- [ ] Login form visible
- [ ] No RED errors in console
- [ ] No 403/500 errors in Network tab

**RESULT**: 
- [ ] **PASS** ✅ (Page loads, no red errors)
- [ ] **FAIL** ❌ (Errors found)

---

### 🔴 TEST 2: SUPER_ADMIN Login + 2FA (CRITICAL) (2 minutes)

**Test Credentials:**
- Email: `admin@warungin.local`
- Password: (ask your team)

**Steps:**
1. Go to login page: `http://192.168.1.101`
2. Enter SUPER_ADMIN email
3. Enter SUPER_ADMIN password
4. Click Login
5. **CRITICAL**: Check if 2FA form appears
6. Try clicking "Dashboard" or other buttons WITHOUT entering 2FA code
7. Check: Does it prevent access? (should stay on 2FA form)
8. Enter valid 2FA code (from authenticator app)
9. Check: Dashboard loads

**Critical Checks:**
- [ ] 2FA form **MUST appear** (if not → FAIL)
- [ ] **CANNOT bypass** 2FA without entering code (if can → FAIL)
- [ ] Dashboard loads after valid 2FA code

**RESULT**: 
- [ ] **PASS** ✅ (2FA enforced, cannot bypass)
- [ ] **FAIL** ❌ (2FA missing or bypassable)

---

### 🔴 TEST 3: ADMIN_TENANT Login + 2FA (CRITICAL) (2 minutes)

**Test Credentials:**
- Email: `admin-tenant@warungin.local`
- Password: (ask your team)

**Steps:**
1. Logout from SUPER_ADMIN (click Profile → Logout)
2. Enter ADMIN_TENANT email
3. Enter ADMIN_TENANT password
4. Click Login
5. **CRITICAL**: Check if 2FA form appears
6. Try clicking buttons WITHOUT 2FA code
7. Check: Does it prevent access?
8. Enter valid 2FA code
9. Check: Store selector or dashboard appears

**Critical Checks:**
- [ ] 2FA form **MUST appear** (if not → FAIL)
- [ ] **CANNOT bypass** without 2FA code (if can → FAIL)
- [ ] Dashboard/store selector loads after 2FA

**RESULT**: 
- [ ] **PASS** ✅ (2FA enforced)
- [ ] **FAIL** ❌ (2FA missing or bypassable)

---

### TEST 4: SUPERVISOR Login (NO 2FA) (1.5 minutes)

**Test Credentials:**
- Email: `supervisor@warungin.local`
- Password: (ask your team)

**Steps:**
1. Logout
2. Enter SUPERVISOR email
3. Enter SUPERVISOR password
4. Click Login
5. Check: **2FA form should NOT appear**
6. Check: Can access store selector
7. Select one assigned store
8. Check: Dashboard opens

**Expected Behavior:**
- [ ] NO 2FA form appears (correct!)
- [ ] Store selector shows only assigned stores
- [ ] Can access assigned store
- [ ] Cannot access other stores (403 error if try)

**RESULT**: 
- [ ] **PASS** ✅ (No 2FA, proper store access)
- [ ] **FAIL** ❌ (2FA appeared or access control broken)

---

### TEST 5: CASHIER Login (1.5 minutes)

**Test Credentials:**
- Email: `cashier@warungin.local`
- Password: (ask your team)

**Steps:**
1. Logout
2. Enter CASHIER email
3. Enter CASHIER password
4. Click Login
5. Check: Auto-assigned to store (no selector)
6. Check: Shift status visible
7. Check: Dashboard accessible
8. Check: Cannot manually select different store

**Expected Behavior:**
- [ ] Auto-assigned to correct store
- [ ] Shift information loaded
- [ ] Dashboard accessible
- [ ] Store access restricted to assigned only

**RESULT**: 
- [ ] **PASS** ✅ (Proper role access)
- [ ] **FAIL** ❌ (Access control issue)

---

### 🔴 TEST 6: Shift Caching (5s TTL - CRITICAL) (2 minutes)

**Steps:**
1. Login as CASHIER (from Test 5) or any user
2. Open DevTools: Press `F12`
3. Click "Network" tab
4. Scroll down to see network requests
5. Filter by: Type "shift" in search box (top of Network tab)
6. Note: First shift API call - check response time (e.g., 250ms)
7. Close DevTools with F12
8. Press `F5` to refresh page
9. Press `F5` again (4 more times, total 5 refreshes)
10. Open DevTools → Network again
11. Filter by "shift"
12. **Count**: How many "shift" API calls do you see?

**Expected Result:**
- [ ] **1st call**: ~250-500ms (fresh from server)
- [ ] **Calls 2-5**: Not in Network tab (cached in browser)
- [ ] **Total API calls**: **Only 1** out of 5 refreshes
- [ ] **Cache hit rate**: 4 out of 5 = **80%** (target: 90%+)

**CRITICAL**: If you see "shift" API called more than once → **FAIL**

**RESULT**: 
- [ ] **PASS** ✅ (Called only once, 90%+ cache hit)
- [ ] **FAIL** ❌ (Called multiple times, caching broken)

---

### TEST 7: 2FA Security Verification (1 minute)

**Steps:**
1. Check code file: [src/middlewares/require2fa.ts](src/middlewares/require2fa.ts)
2. Verify it contains role-based 2FA logic
3. From previous tests, verify:

**Security Checks:**
- [ ] SUPER_ADMIN requires 2FA ✅
- [ ] ADMIN_TENANT requires 2FA ✅
- [ ] SUPERVISOR does NOT require 2FA ✅
- [ ] CASHIER does NOT require 2FA ✅
- [ ] Cannot bypass 2FA (tested in Test 2 & 3) ✅

**RESULT**: 
- [ ] **PASS** ✅ (2FA rules correct)
- [ ] **FAIL** ❌ (Rules not enforced)

---

### 🔴 TEST 8: Store Authorization 403 Check (CRITICAL) (2 minutes)

**Option A: Using Postman (if you have it)**

1. Login as SUPERVISOR (from Test 4)
2. Open DevTools → Network tab
3. Perform any action (click store, load page)
4. Find a request with "Authorization" header
5. Copy the token (format: `Bearer eyJhbGc...`)
6. Open Postman
7. Create GET request to: `http://192.168.1.101:8000/api/stores/[WRONG_STORE_ID]/analytics`
8. Add header: `Authorization: Bearer [YOUR_TOKEN]`
9. Replace `[WRONG_STORE_ID]` with a store you DON'T have access to
10. Send request
11. **Expected**: Response code **403 Forbidden**

**Option B: Using curl in PowerShell**

```powershell
# Get your token first (from DevTools → Network tab)
$token = "Bearer eyJhbGc..." # Replace with actual token

# Test unauthorized store (replace with actual ID)
$response = Invoke-WebRequest -Uri "http://192.168.1.101:8000/api/stores/999/analytics" `
  -Headers @{"Authorization" = $token} -ErrorAction SilentlyContinue

# Check status code
Write-Host "Response Code: $($response.StatusCode)"
```

**Expected Results:**
- [ ] Authorized store (your store): **200 OK**
- [ ] Unauthorized store (other store): **403 Forbidden**
- [ ] Cannot access other stores' data

**CRITICAL**: If you get **200** for unauthorized store → **FAIL**

**RESULT**: 
- [ ] **PASS** ✅ (403 for unauthorized access)
- [ ] **FAIL** ❌ (Can access unauthorized stores)

---

### TEST 9: Console Errors Check (1 minute)

**Steps:**
1. Login to application
2. Navigate through different pages (Dashboard, Transactions, etc.)
3. Open DevTools: `F12`
4. Click "Console" tab
5. Look for RED error messages
6. Look for "Uncaught" or "Promise rejection" messages
7. Count total number of red errors

**Acceptable Console State:**
- [ ] **0 RED errors** (Excellent!)
- [ ] 1-2 warnings (OK, not errors)
- [ ] No "Uncaught" or "Promise rejection"

**Red Flags (FAIL):**
- [ ] 3+ RED errors
- [ ] "Uncaught" exception
- [ ] "Unhandled Promise rejection"
- [ ] 403/404/500 errors

**Checklist:**
- [ ] Console clean (0 red errors)
- [ ] All interactions work
- [ ] No popup error messages

**RESULT**: 
- [ ] **PASS** ✅ (Console clean)
- [ ] **FAIL** ❌ (Errors found)

---

### TEST 10: Backend Health Check (1 minute)

**Steps:**
1. Open new browser tab
2. Go to: `http://192.168.1.101:8000/api/health`
3. You should see JSON response

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-31T12:34:56.789Z",
  "version": "1.1.0"
}
```

**Verification Checklist:**
- [ ] Response HTTP status: **200**
- [ ] `status` field: **"ok"**
- [ ] `timestamp` field: **present**
- [ ] `version` field: **1.1.0** or higher

**If Response is:**
- 200 + "ok" status = **PASS** ✅
- 500 or error = **FAIL** ❌
- Cannot reach = **FAIL** ❌

**RESULT**: 
- [ ] **PASS** ✅ (Health check OK)
- [ ] **FAIL** ❌ (Health check failed)

---

## 📊 FINAL SCORING

Count your PASS results above:

```
Total Tests: 10
Tests Passed: _____ / 10
Tests Failed: _____ / 10
```

### Score Interpretation:

**9-10 PASS** 🟢
- Status: **EXCELLENT**
- Action: Proceed to Phase 5.2 (Full Test Suite)
- Next: Open `COMPREHENSIVE_TEST_PLAN.md`
- Timeline: 2-4 hours

**6-8 PASS** 🟡
- Status: **ACCEPTABLE**
- Action: Review failed tests, contact tech team
- Decision: Fix issues and retest or proceed with caution

**0-5 PASS** 🔴
- Status: **FAIL**
- Action: STOP - Critical issues found
- Next: Contact tech lead immediately
- Cannot proceed to Phase 5.2 until issues fixed

---

## 📝 RECORD YOUR RESULTS

After completing smoke test, fill in EXACTLY what you found:

**File to update**: `COMPLETE_TEST_RESULTS_AND_APPROVALS.md`

Copy and paste this into that file:

```
## SMOKE TEST RESULTS - [DATE]

**Tester**: _________________
**Date**: December 31, 2025
**Time**: ___ : ___ (AM/PM)

### Test Results

- Test 1 (Frontend): [ ] PASS [ ] FAIL
- Test 2 (SUPER_ADMIN 2FA): [ ] PASS [ ] FAIL
- Test 3 (ADMIN 2FA): [ ] PASS [ ] FAIL
- Test 4 (SUPERVISOR): [ ] PASS [ ] FAIL
- Test 5 (CASHIER): [ ] PASS [ ] FAIL
- Test 6 (Shift Cache): [ ] PASS [ ] FAIL
- Test 7 (2FA Security): [ ] PASS [ ] FAIL
- Test 8 (Store Auth 403): [ ] PASS [ ] FAIL
- Test 9 (Console Errors): [ ] PASS [ ] FAIL
- Test 10 (Backend Health): [ ] PASS [ ] FAIL

### Summary
- Passed: ____ / 10
- Failed: ____ / 10
- **Final Score**: ____ / 10

### Issues Found (if any):
[List any failures or errors]

### Recommendation:
[ ] Proceed to Phase 5.2 (9-10 PASS)
[ ] Review and retest (6-8 PASS)
[ ] STOP - Fix issues first (0-5 PASS)
```

---

## ✅ EXECUTION CHECKLIST

- [ ] Step 1: Pre-test setup completed
- [ ] Test 1: Frontend loading - Result: PASS / FAIL
- [ ] Test 2: SUPER_ADMIN 2FA - Result: PASS / FAIL
- [ ] Test 3: ADMIN_TENANT 2FA - Result: PASS / FAIL
- [ ] Test 4: SUPERVISOR (no 2FA) - Result: PASS / FAIL
- [ ] Test 5: CASHIER login - Result: PASS / FAIL
- [ ] Test 6: Shift caching - Result: PASS / FAIL
- [ ] Test 7: 2FA security - Result: PASS / FAIL
- [ ] Test 8: Store authorization - Result: PASS / FAIL
- [ ] Test 9: Console errors - Result: PASS / FAIL
- [ ] Test 10: Backend health - Result: PASS / FAIL
- [ ] Final score recorded: ____ / 10
- [ ] Results saved to `COMPLETE_TEST_RESULTS_AND_APPROVALS.md`
- [ ] Decision made: Proceed / Review / Stop

---

## 🎯 NEXT STEPS

### If You Scored 9-10/10 ✅
1. Update `COMPLETE_TEST_RESULTS_AND_APPROVALS.md`
2. Mark Phase 5.1 as **COMPLETE**
3. Open `COMPREHENSIVE_TEST_PLAN.md`
4. Start Phase 5.2 (Full Test Suite) - 2-4 hours

### If You Scored 6-8/10 🟡
1. Identify which tests failed
2. Contact tech team to investigate
3. Decide: retest or proceed with caution
4. Document findings

### If You Scored 0-5/10 🔴
1. STOP - Do NOT proceed
2. Document all failures
3. Contact tech lead immediately
4. Fix issues before retesting

---

**Status**: Ready to Execute
**Date**: December 31, 2025
**Phase**: 5.1 Smoke Test Execution Checklist
**Estimated Time**: 15 minutes

