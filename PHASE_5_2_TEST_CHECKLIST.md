# 📋 PHASE 5.2 FULL TEST EXECUTION CHECKLIST

**Quick Start**: Copy-paste each section below and follow steps

---

## ✅ PHASE A: SMOKE TESTS (Already Verified in Phase 5.1)

- [x] A1: Frontend loads <3 seconds
- [x] A2: Backend processing metrics
- [x] A3: Database operational
- [x] A4: All 8 services running
- [x] A5: Nginx routing working

**Phase A Score**: 5/5 ✅

---

## 🔐 PHASE B: AUTHENTICATION TESTS

### Test B1: SUPER_ADMIN Login [5 min]

**Instructions**:
1. Open browser: `http://192.168.1.101`
2. Email: `admin@warungin.local` (or ask team)
3. Password: (ask team)
4. **CRITICAL**: Check if 2FA form appears
5. Enter 2FA code from authenticator app
6. Verify dashboard shows "Super Admin Dashboard"

**Checklist**:
- [ ] Login accepted
- [ ] 2FA form APPEARED (critical)
- [ ] 2FA code accepted
- [ ] Dashboard loaded with all stores visible
- [ ] No console errors

**Result**: [ ] PASS / [ ] FAIL

---

### Test B2: ADMIN_TENANT Login [5 min]

**Instructions**:
1. Logout from previous test (Profile → Logout)
2. Email: `admin-tenant@warungin.local`
3. Password: (ask team)
4. **CRITICAL**: Verify 2FA required
5. Enter 2FA code
6. Check store selector visible

**Checklist**:
- [ ] Login accepted
- [ ] 2FA appeared (required)
- [ ] 2FA code worked
- [ ] Store selector visible
- [ ] Can see BUSINESS_ANALYTICS addon (bypass test)
- [ ] Other addons show as "Locked"

**Result**: [ ] PASS / [ ] FAIL

---

### Test B3: SUPERVISOR Login [5 min]

**Instructions**:
1. Logout
2. Email: `supervisor@warungin.local`
3. Password: (ask team)
4. **IMPORTANT**: NO 2FA should appear (this is correct!)
5. Store selector should show 3-5 assigned stores
6. Click each store → data should change

**Checklist**:
- [ ] Login succeeded
- [ ] NO 2FA form (correct)
- [ ] Store selector visible
- [ ] Can see 3-5 stores
- [ ] Cannot see other stores
- [ ] Selecting different store updates dashboard

**Result**: [ ] PASS / [ ] FAIL

---

### Test B4: CASHIER Login [5 min]

**Instructions**:
1. Logout
2. Email: `cashier@warungin.local`
3. Password: (ask team)
4. **IMPORTANT**: NO store selector (auto-assigned)
5. Check "Current Shift" status visible
6. Try opening/closing shift

**Checklist**:
- [ ] Login succeeded
- [ ] NO store selector (auto-assigned)
- [ ] Shift status loads in <2 seconds
- [ ] Can see assigned store name
- [ ] Shift open/close buttons working
- [ ] Shift status persists on F5 refresh

**Result**: [ ] PASS / [ ] FAIL

---

### Test B5: KITCHEN Login [5 min]

**Instructions**:
1. Logout
2. Email: `kitchen@warungin.local`
3. Password: (ask team)
4. Should auto-assign to store
5. Should show orders/tasks for that store

**Checklist**:
- [ ] Login succeeded
- [ ] Auto-assigned to store
- [ ] Orders/tasks visible
- [ ] NO other store data visible
- [ ] Can view orders for assigned store only

**Result**: [ ] PASS / [ ] FAIL

---

### Test B6: Logout & Session Cleanup [3 min]

**Instructions**:
1. Login with any user (SUPER_ADMIN)
2. Click Profile menu → Logout
3. Should redirect to login page
4. Try accessing http://192.168.1.101/dashboard
5. Should redirect back to login
6. Open DevTools → Application → LocalStorage/Cookies

**Checklist**:
- [ ] Logout clicked
- [ ] Redirected to login page
- [ ] Protected routes inaccessible (redirect to login)
- [ ] Authorization token removed
- [ ] localStorage/sessionStorage cleared
- [ ] No residual auth data

**Result**: [ ] PASS / [ ] FAIL

---

### Test B7: Remember Me [3 min]

**Instructions**:
1. Go to login page
2. Login with SUPER_ADMIN
3. **CHECK "Remember Me"** checkbox
4. **Close browser completely** (use File → Exit or Ctrl+Shift+Q)
5. Reopen browser and go to http://192.168.1.101
6. Should still be logged in

Then test WITHOUT Remember Me:
7. Logout
8. Login WITHOUT checking "Remember Me"
9. Close browser completely
10. Reopen → should need to login again

**Checklist**:
- [ ] With Remember Me: Still logged in after browser close
- [ ] Without Remember Me: Requires login again
- [ ] Token strategy working correctly
- [ ] Persistent login working

**Result**: [ ] PASS / [ ] FAIL

---

### Test B8: Invalid Login [3 min]

**Instructions**:
1. Go to login page
2. Try these combinations:
   - Wrong email + correct password
   - Correct email + wrong password
   - Both wrong
3. Check error message

**Checklist**:
- [ ] Clear error message shown
- [ ] No leaking info ("email not found" vs "wrong password")
- [ ] Error doesn't reveal which field was wrong
- [ ] Same generic message for all failures

**Result**: [ ] PASS / [ ] FAIL

---

### Test B9: 2FA Security (CRITICAL) [5 min]

**Instructions**:
1. Login as SUPER_ADMIN
2. 2FA form appears
3. **TRY TO BYPASS**: Click on menu/buttons without entering 2FA code
4. Should NOT bypass - stay on 2FA form
5. Now enter correct 2FA code
6. Should unlock and go to dashboard

**Checklist**:
- [ ] SUPER_ADMIN requires 2FA (critical)
- [ ] Cannot bypass by clicking elsewhere (critical)
- [ ] 2FA form stays focused until valid code
- [ ] Valid code grants access
- [ ] Invalid code shows error
- [ ] SUPERVISOR does NOT see 2FA (correct)
- [ ] CASHIER does NOT see 2FA (correct)

**Result**: [ ] PASS / [ ] FAIL

---

**Phase B Summary**:
- Total tests: 9
- Passed: ___ / 9
- Failed: ___ / 9

---

## 🔒 PHASE C: AUTHORIZATION TESTS

### Test C1: Store Guard [10 min]

**Instructions**:
1. Login as SUPERVISOR
2. Note your assigned stores (check profile)
3. Open DevTools → Network tab
4. Go to Analytics page
5. Check: Access your store → should work ✅
6. Now try accessing another store:
   - Use URL like: `http://192.168.1.101?storeId=999`
   - Or if there's a dropdown, try selecting another store
7. Should get 403 Forbidden (check Network tab)

**Checklist**:
- [ ] Can access assigned store data
- [ ] Cannot access unassigned store (403)
- [ ] Error message shows "Forbidden" or "Unauthorized"
- [ ] No data leaked from other stores

**Result**: [ ] PASS / [ ] FAIL

---

### Test C2: CASHIER Store Assignment [10 min]

**Instructions**:
1. Login as CASHIER
2. Check what store you're assigned
3. Try accessing orders/data → should work
4. Try changing URL to access another store
5. Should get 403

**Checklist**:
- [ ] Only assigned store accessible
- [ ] Other stores return 403
- [ ] Cannot change assignment via URL
- [ ] Shift loading works for assigned store

**Result**: [ ] PASS / [ ] FAIL

---

### Test C3: KITCHEN Store Assignment [10 min]

**Instructions**:
1. Login as KITCHEN
2. Check assigned store
3. Try accessing kitchen orders → should work
4. Try accessing another store's orders
5. Should be blocked

**Checklist**:
- [ ] Kitchen can only see assigned store
- [ ] Other stores blocked (403)
- [ ] Orders isolated by store
- [ ] No cross-store data visible

**Result**: [ ] PASS / [ ] FAIL

---

### Test C4: Role-Based Access [10 min]

**Instructions**:
1. Try these as each role:

**SUPER_ADMIN**:
- Can access: Users list, Tenants, System settings
- Result: [ ] PASS / [ ] FAIL

**ADMIN_TENANT**:
- Cannot access: Users list, System settings (403)
- Can access: Tenant dashboard, Store management
- Result: [ ] PASS / [ ] FAIL

**SUPERVISOR**:
- Cannot access: User management, Tenant settings (403)
- Can access: Store analytics
- Result: [ ] PASS / [ ] FAIL

**CASHIER**:
- Can only access: Orders, Shift management for own store
- Result: [ ] PASS / [ ] FAIL

---

### Test C5: Store Selector [5 min]

**Instructions**:
1. Login as ADMIN_TENANT
2. Store selector should be visible
3. Click dropdown and select different store
4. Dashboard should update with that store's data
5. CASHIER: No store selector (auto-assigned)

**Checklist**:
- [ ] ADMIN_TENANT: Store selector visible
- [ ] ADMIN_TENANT: Can select different stores
- [ ] Data changes when store selected
- [ ] CASHIER: No selector (correct)
- [ ] SUPERVISOR: Selector works correctly

**Result**: [ ] PASS / [ ] FAIL

---

**Phase C Summary**:
- Total tests: 5
- Passed: ___ / 5
- Failed: ___ / 5

---

## ⚡ PHASE D: FEATURE TESTS

### Test D1: Dashboard Loading [10 min]

**Instructions**:
1. Login as any user
2. Dashboard should load in <3 seconds
3. Check: All widgets visible
4. Check: Numbers displayed correctly
5. Open DevTools → Console
6. Should have NO red errors

**Checklist**:
- [ ] Loads in <3 seconds
- [ ] All widgets render
- [ ] Data displays correctly
- [ ] Console clean (no red errors)
- [ ] Charts render correctly

**Result**: [ ] PASS / [ ] FAIL

---

### Test D2: Store Filtering [10 min]

**Instructions**:
1. Login as SUPERVISOR (has multiple stores)
2. Click store selector (dropdown)
3. Select Store A → data shows Store A
4. Select Store B → data shows Store B
5. F5 refresh → should remember Store B selection
6. Logout and login again → should reset to default

**Checklist**:
- [ ] Selecting store updates dashboard
- [ ] Correct data shown for each store
- [ ] Filter persists on page refresh
- [ ] Filter resets on logout/login

**Result**: [ ] PASS / [ ] FAIL

---

### Test D3: Report Generation [10 min]

**Instructions**:
1. Navigate to Reports section
2. Try:
   - Daily report
   - Weekly report
   - Custom date range
3. Check data looks correct
4. Try exporting to PDF/Excel (if available)

**Checklist**:
- [ ] Daily report generates
- [ ] Weekly report generates
- [ ] Custom date range works
- [ ] Data looks accurate
- [ ] Export works (if available)

**Result**: [ ] PASS / [ ] FAIL

---

### Test D4: Analytics [10 min]

**Instructions**:
1. Go to Analytics section
2. Check charts display data
3. Try date filter
4. Try store filter (if available)
5. Verify numbers make sense

**Checklist**:
- [ ] Charts render without errors
- [ ] Data looks reasonable
- [ ] Filters work (date, store)
- [ ] No calculation errors
- [ ] Updates are timely

**Result**: [ ] PASS / [ ] FAIL

---

### Test D5: Data Consistency [10 min]

**Instructions**:
1. Make a transaction (if allowed for your role)
2. Check if it appears in:
   - Dashboard
   - Reports
   - Analytics
3. Verify same number across all views

**Checklist**:
- [ ] New data appears everywhere quickly
- [ ] Numbers consistent across views
- [ ] No data duplication
- [ ] Real-time updates working

**Result**: [ ] PASS / [ ] FAIL

---

### Test D6: Multi-Store Workflow [10 min]

**Instructions**:
1. SUPERVISOR: Switch between multiple stores
2. Perform actions in each (if applicable)
3. Verify isolation (Store A data ≠ Store B data)
4. Check performance acceptable when switching

**Checklist**:
- [ ] Can switch between stores
- [ ] Data isolated by store
- [ ] No cross-store contamination
- [ ] Switching is fast (<1s)

**Result**: [ ] PASS / [ ] FAIL

---

**Phase D Summary**:
- Total tests: 6
- Passed: ___ / 6
- Failed: ___ / 6

---

## 🚀 PHASE E: PERFORMANCE & CACHING

### Test E1: Shift Caching (CRITICAL) [5 min]

**Instructions**:
1. Login as CASHIER
2. Open DevTools: Press F12
3. Click "Network" tab
4. Scroll down to "Shift Status" area to trigger request
5. Clear Network tab (circle icon with line through it)
6. Press F5 to refresh page
7. Press F5 four more times (total 5 refreshes)
8. Check Network tab

**What to Look For**:
- Count how many times "shift" or "store-shift" API appears
- Should appear **ONLY 1-2 times** out of 5 refreshes
- Others are cached (not in Network tab)

**Checklist**:
- [ ] Shift API called 1-2 times (not 5)
- [ ] Other calls are cached (90%+ hit rate)
- [ ] Caching working correctly
- [ ] Performance improved

**Calculation**:
- If called 5/5 times: 0% cache = FAIL ❌
- If called 2/5 times: 60% cache = MODERATE 🟡
- If called 1/5 times: 80% cache = GOOD ✅
- Target: 90%+ cache = EXCELLENT 🌟

**Result**: Cache hit rate: ___ % [ ] PASS / [ ] FAIL

---

### Test E2: Request Deduplication [5 min]

**Instructions**:
1. Open 2-3 tabs to http://192.168.1.101
2. ALL tabs at the same time:
   - Type email
   - Type password
   - Click "Login"
3. Check Network tab in one tab
4. Should see only 1 login request
5. All tabs should login simultaneously

**Checklist**:
- [ ] Only 1 login request sent (deduplication working)
- [ ] All tabs logged in at same time
- [ ] No duplicate API calls
- [ ] Performance improved

**Result**: [ ] PASS / [ ] FAIL

---

### Test E3: API Response Times [5 min]

**Instructions**:
1. Open DevTools → Network
2. Login and monitor times:
   - **Login**: Should be <500ms (target: <300ms)
   - **Dashboard load**: Should be <1000ms
   - **Store data fetch**: Should be <200ms
   - **Reports**: Should be <2000ms

**Checklist**:
- [ ] Login: <500ms ✅
- [ ] Dashboard: <1000ms ✅
- [ ] Store data: <200ms ✅
- [ ] Reports: <2000ms ✅

**Average Response Time**: ___ ms

**Result**: [ ] PASS (all under limits) / [ ] FAIL

---

### Test E4: Concurrent Users [5 min]

**Instructions**:
1. Open 5 tabs of http://192.168.1.101
2. In each tab, login as different users:
   - Tab 1: SUPER_ADMIN
   - Tab 2: ADMIN_TENANT
   - Tab 3: SUPERVISOR
   - Tab 4: CASHIER
   - Tab 5: KITCHEN
3. In each tab, perform actions:
   - Select store (if available)
   - Load reports
   - Check dashboard
4. No errors or race conditions

**Checklist**:
- [ ] All 5 logins succeed
- [ ] No race conditions
- [ ] Data consistency maintained
- [ ] No crashes or timeouts

**Result**: [ ] PASS / [ ] FAIL

---

### Test E5: Large Data Load [5 min]

**Instructions**:
1. Login to account with lots of data
2. Load a report with 1000+ records
3. Check pagination works
4. Scroll through pages
5. Verify no timeouts

**Checklist**:
- [ ] Large dataset loads
- [ ] Pagination functional
- [ ] No timeout errors
- [ ] Performance acceptable
- [ ] Can scroll/navigate smoothly

**Result**: [ ] PASS / [ ] FAIL

---

### Test E6: Throttled Network [5 min]

**Instructions**:
1. Open DevTools → Network tab
2. Click dropdown showing "No throttling"
3. Select "Slow 3G" or "Slow 4G"
4. Login and navigate
5. Check for graceful error handling

**Checklist**:
- [ ] Application still works on slow network
- [ ] Error messages show (not just hanging)
- [ ] Timeout messages appear (if applicable)
- [ ] No crash on slow network

**Result**: [ ] PASS / [ ] FAIL

---

**Phase E Summary**:
- Total tests: 6
- Passed: ___ / 6
- Failed: ___ / 6

---

## 📊 FINAL RESULTS SUMMARY

| Phase | Tests | Passed | Failed | Rate |
|-------|-------|--------|--------|------|
| A: Smoke | 5 | 5 | 0 | 100% ✅ |
| B: Auth | 9 | ___ | ___ | ___% |
| C: Authz | 5 | ___ | ___ | ___% |
| D: Features | 6 | ___ | ___ | ___% |
| E: Performance | 6 | ___ | ___ | ___% |
| **TOTAL** | **31** | **___** | **___** | **___%** |

---

## ✅ SIGN-OFF

**Total Score**: ___ / 31 (___ %)

### Decision:
- [ ] **PASS** (25+/31 = 80%+) → Proceed to Phase 5.3
- [ ] **REVIEW** (20-24/31 = 65-79%) → Fix failures and retest
- [ ] **FAIL** (0-19/31 = <65%) → Stop, major issues

**Tester Name**: ____________________
**Test Date**: December 31, 2025
**Test Duration**: ___ hours

---

This checklist should take 2-4 hours to complete all 31 tests.

