# Staging Test Plan & Execution Guide

**Status**: ✅ Ready to Execute
**Services**: All Deployed & Healthy
**Timeline**: 2-4 hours for complete testing
**Date**: December 31, 2025

---

## Quick Status

✅ **8 Services Deployed & Healthy**
✅ **Frontend**: HTTP 200 OK
✅ **Backend**: Processing metrics, no errors
✅ **Database**: Connected & healthy
✅ **Ready for Testing**: YES

---

## Test Execution Roadmap

### Phase 1: Smoke Tests (15 mins) - QUICK
- Basic connectivity
- API endpoints responding
- Frontend loading

### Phase 2: Authentication Tests (45 mins)
- Login flows for all 5 user roles
- 2FA enforcement
- Token management
- Logout & session cleanup

### Phase 3: Authorization Tests (45 mins)
- Supervisor store access control
- Role-based endpoint access
- CASHIER/KITCHEN store assignment
- Store selector functionality

### Phase 4: Feature Tests (60 mins)
- Dashboard loading
- Data filtering by store
- Report generation
- Analytics processing

### Phase 5: Performance Tests (30 mins)
- Shift status caching (5s TTL)
- Request deduplication
- API response times
- Concurrent user handling

---

## Test Suite A: Smoke Tests (15 minutes)

### Test A1: Frontend Accessibility
```
⏱️ Expected Time: 2 min

Steps:
1. Open http://192.168.1.101 in browser
2. Verify page loads
3. Check for console errors
4. Verify login page displays

Expected Results:
✅ Page loads within 3 seconds
✅ No 404 errors
✅ No console JavaScript errors
✅ Login form visible and interactive
```

### Test A2: API Connectivity
```
⏱️ Expected Time: 3 min

Command:
wsl.exe -d Ubuntu -- bash -c "sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 'echo 123 | sudo -S docker logs warungin-backend --tail 5'"

Expected Results:
✅ Backend processing metrics (no errors)
✅ Last log entry shows recent activity
✅ No ERROR or CRITICAL entries
```

### Test A3: Database Connectivity
```
⏱️ Expected Time: 3 min

Verify database is responding via backend logs

Expected Results:
✅ Backend not showing database connection errors
✅ Metrics updating successfully every 5 minutes
✅ No timeout or connection refused errors
```

### Test A4: Service Status
```
⏱️ Expected Time: 2 min

Command:
wsl.exe -d Ubuntu -- bash -c "sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 'echo 123 | sudo -S docker compose -f /root/New-Warungin/docker-compose.yml ps'"

Expected Results:
✅ All 8 services showing "Up" status
✅ All health checks showing "healthy" where applicable
✅ No containers in "Exited" or "Restarting" state
✅ All expected ports mapped correctly
```

### Test A5: Reverse Proxy
```
⏱️ Expected Time: 2 min

Command:
Test that Nginx is routing traffic correctly:
- Frontend on port 80 → backend
- SSL/TLS on port 443 (if applicable)

Expected Results:
✅ Frontend loads via HTTP
✅ API requests route through Nginx
✅ Response headers show Nginx
✅ No 502 Bad Gateway errors
```

---

## Test Suite B: Authentication Tests (45 minutes)

### Test B1: SUPER_ADMIN Login
```
⏱️ Expected Time: 5 min

Steps:
1. Go to http://192.168.1.101
2. Login with SUPER_ADMIN credentials
3. Verify 2FA prompt appears
4. Complete 2FA
5. Verify dashboard loads

Expected Results:
✅ Login accepted
✅ 2FA required (not bypassed) - CRITICAL
✅ After 2FA, dashboard loads
✅ Can see all supervisors/stores
✅ Session token stored (check DevTools Application → Cookies/LocalStorage)
✅ JWT token present in localStorage (or sessionStorage if remember-me unchecked)
```

### Test B2: ADMIN_TENANT Login
```
⏱️ Expected Time: 5 min

Steps:
1. Logout previous user
2. Login with ADMIN_TENANT credentials
3. Verify 2FA prompt appears
4. Complete 2FA
5. Verify dashboard loads
6. Check store selector

Expected Results:
✅ Login accepted
✅ 2FA required (not bypassed) - CRITICAL
✅ Dashboard loads with tenant data
✅ Store selector shows assigned store
✅ BUSINESS_ANALYTICS addon accessible (bypass verification)
✅ Other addons require purchase/subscription
```

### Test B3: SUPERVISOR Login
```
⏱️ Expected Time: 5 min

Steps:
1. Logout and login with SUPERVISOR credentials
2. Verify no 2FA required
3. Check store selector
4. Verify can access assigned stores only

Expected Results:
✅ Login accepted
✅ No 2FA required (correct behavior)
✅ Store selector shows assigned stores (e.g., 3-5 stores)
✅ Can select between assigned stores
✅ Cannot see stores not assigned
```

### Test B4: CASHIER Login
```
⏱️ Expected Time: 5 min

Steps:
1. Logout and login with CASHIER credentials
2. Verify auto-assigned to store
3. Check shift status loads
4. Open and close a shift

Expected Results:
✅ Login accepted
✅ Automatically assigned to correct store (no selector)
✅ Shift status loads quickly (<2 seconds)
✅ Can open shift if closed
✅ Can close shift if open
✅ Shift updates persist on page refresh
```

### Test B5: KITCHEN Login
```
⏱️ Expected Time: 5 min

Steps:
1. Logout and login with KITCHEN credentials
2. Verify auto-assigned to store
3. Check can view orders
4. Verify cannot access other stores

Expected Results:
✅ Login accepted
✅ Automatically assigned to store
✅ Orders displayed for assigned store only
✅ Cannot access other store orders/data
✅ No store selector visible
```

### Test B6: Logout & Session Cleanup
```
⏱️ Expected Time: 3 min

Steps:
1. Login with any user
2. Click Logout
3. Verify redirected to login
4. Try to access protected routes (e.g., /dashboard)
5. Check localStorage/sessionStorage cleared

Expected Results:
✅ Logout succeeds
✅ Redirected to login page
✅ Protected routes not accessible (redirected to login)
✅ Tokens cleared from storage
✅ Session completely cleaned
✅ revokeAllRefreshTokens called (check backend logs for this)
```

### Test B7: Remember Me Functionality
```
⏱️ Expected Time: 3 min

Steps:
1. Login and check "Remember Me"
2. Close browser completely
3. Reopen and navigate to http://192.168.1.101
4. Verify still logged in
5. Logout and login WITHOUT checking "Remember Me"
6. Close browser
7. Reopen browser
8. Verify redirected to login

Expected Results:
✅ With "Remember Me": Login persists after browser close
✅ Without "Remember Me": Must login again
✅ Token strategy (localStorage vs sessionStorage) working correctly
```

### Test B8: Invalid Login Attempts
```
⏱️ Expected Time: 3 min

Steps:
1. Go to login page
2. Try invalid email/password combinations
3. Observe error messages

Expected Results:
✅ Clear error message for wrong credentials
✅ No information leakage (don't say "email not found" vs "password wrong")
✅ Rate limiting working (optional but recommended)
✅ After N failed attempts, show timeout/warning
```

### Test B9: 2FA Verification - CRITICAL
```
⏱️ Expected Time: 5 min

Steps:
1. Login with SUPER_ADMIN
2. Verify 2FA prompt appears
3. Complete 2FA with code
4. Verify access granted
5. Try accessing endpoints without 2FA
6. Verify 401/403 response

Expected Results:
✅ 2FA mandatory for SUPER_ADMIN
✅ 2FA mandatory for ADMIN_TENANT
✅ 2FA NOT required for SUPERVISOR
✅ Cannot bypass 2FA (critical security fix)
✅ Invalid 2FA code shows error
✅ Valid 2FA code grants access
```

---

## Test Suite C: Authorization Tests (45 minutes)

### Test C1: Supervisor Store Guard
```
⏱️ Expected Time: 10 min

Steps:
1. Login as SUPERVISOR
2. Get list of assigned stores (e.g., [1, 2, 3])
3. Access /api/analytics/trends?storeId=1 ✅
4. Access /api/analytics/trends?storeId=99 (not assigned) ❌
5. Verify 403 Forbidden response

Expected Results:
✅ Can access assigned store: 200 OK
✅ Cannot access unassigned store: 403 Forbidden
✅ Error message indicates permission denied
✅ No data leak for unauthorized stores
```

### Test C2: CASHIER Store Assignment
```
⏱️ Expected Time: 10 min

Steps:
1. Login as CASHIER
2. Check assignedStoreId in profile
3. Try accessing /api/orders?storeId=[assignedStore] ✅
4. Try accessing /api/orders?storeId=[otherStore] ❌
5. Try accessing /api/shifts/current ✅

Expected Results:
✅ Can only see data from assigned store
✅ Cannot access other store data: 403 Forbidden
✅ Shift status loads for assigned store
✅ Cannot manipulate store assignment via API (protected)
```

### Test C3: KITCHEN Store Assignment
```
⏱️ Expected Time: 10 min

Steps:
1. Login as KITCHEN
2. Check assignedStoreId
3. Try accessing kitchen orders for assigned store ✅
4. Try accessing kitchen orders for other store ❌

Expected Results:
✅ Can access assigned store kitchen display
✅ Cannot access other store kitchen display: 403 Forbidden
✅ Store assignment not modifiable by user
```

### Test C4: Role-Based Endpoint Access
```
⏱️ Expected Time: 10 min

Matrix Testing:
┌─────────────────┬────────┬──────────┬────────────┬─────────┬─────────┐
│ Endpoint        │ SUPER  │ ADMIN_T  │ SUPERVISOR │ CASHIER │ KITCHEN │
├─────────────────┼────────┼──────────┼────────────┼─────────┼─────────┤
│ /analytics/*    │ ✅ Yes │ ✅ Yes   │ ✅ Limited │ ❌ No   │ ❌ No   │
│ /dashboard/*    │ ✅ Yes │ ✅ Yes   │ ✅ Limited │ ❌ No   │ ❌ No   │
│ /orders/*       │ ✅ Yes │ ✅ Yes   │ ✅ Limited │ ✅ Yes  │ ✅ Yes  │
│ /shifts/current │ ✅ Yes │ ✅ Yes   │ ✅ Yes     │ ✅ Yes  │ ✅ Yes  │
│ /reports/*      │ ✅ Yes │ ✅ Yes   │ ✅ Limited │ ❌ No   │ ❌ No   │
│ /users/*        │ ✅ Yes │ ✅ Yes   │ ❌ No      │ ❌ No   │ ❌ No   │
│ /stores/*       │ ✅ Yes │ ✅ Yes   │ ✅ Limited │ ❌ No   │ ❌ No   │
└─────────────────┴────────┴──────────┴────────────┴─────────┴─────────┘

Expected Results:
✅ All endpoint access matches role expectations
✅ Unauthorized access returns 403
✅ No privilege escalation possible
```

### Test C5: Addon Authorization
```
⏱️ Expected Time: 5 min

Steps:
1. Login as ADMIN_TENANT
2. Access BUSINESS_ANALYTICS features
3. Try accessing other premium addons
4. Check if purchase required message shows

Expected Results:
✅ BUSINESS_ANALYTICS accessible without purchase (bypass)
✅ Other addons require subscription
✅ Clear UI indicating subscription status
✅ Cannot access restricted addon features
```

---

## Test Suite D: Feature Tests (60 minutes)

### Test D1: Dashboard Display
```
⏱️ Expected Time: 10 min

Steps:
1. Login with ADMIN_TENANT
2. Navigate to dashboard
3. Verify metrics display: revenue, orders, customers
4. Check store selector working
5. Switch stores and verify data updates

Expected Results:
✅ Dashboard loads in <3 seconds
✅ All widgets display data
✅ Store selector shows assigned stores
✅ Data updates when changing store
✅ No console errors
```

### Test D2: Orders Report
```
⏱️ Expected Time: 10 min

Steps:
1. Login with SUPERVISOR
2. Navigate to Orders report
3. Filter by assigned stores
4. Try filtering by unassigned store
5. Generate report for date range

Expected Results:
✅ Orders display for assigned stores only
✅ Cannot see unassigned store orders
✅ Filtering works correctly
✅ Report generation succeeds
✅ Download works if available
```

### Test D3: Analytics Report
```
⏱️ Expected Time: 10 min

Steps:
1. Login with ADMIN_TENANT
2. Navigate to Analytics
3. Check top-products report
4. Check trends analysis
5. Try custom report

Expected Results:
✅ Analytics load without errors
✅ Reports show correct data
✅ Charts render properly
✅ Export functionality works
```

### Test D4: Store Management
```
⏱️ Expected Time: 10 min

Steps:
1. Login with SUPER_ADMIN
2. Navigate to Store Management
3. View all stores
4. Update a store configuration
5. Verify changes persist

Expected Results:
✅ Can view all stores
✅ Can edit store settings
✅ Changes saved correctly
✅ Changes reflected in UI
```

### Test D5: User Management
```
⏱️ Expected Time: 10 min

Steps:
1. Login with SUPER_ADMIN
2. Navigate to User Management
3. Create new user (CASHIER role)
4. Assign to store
5. Verify user can login

Expected Results:
✅ Can create user
✅ Can assign role and store
✅ User receives credentials
✅ New user can login successfully
✅ User has correct permissions
```

### Test D6: Shift Management
```
⏱️ Expected Time: 10 min

Steps:
1. Login as CASHIER
2. Open shift (if not already open)
3. Perform transactions
4. View shift summary
5. Close shift
6. Verify closed shift persists on refresh

Expected Results:
✅ Can open/close shifts
✅ Shift status displays correctly
✅ Shift balancing works
✅ Closed shifts are read-only
✅ Shift history accessible
```

---

## Test Suite E: Performance Tests (30 minutes)

### Test E1: Shift Status Caching (CRITICAL FIX VERIFICATION)
```
⏱️ Expected Time: 10 min

Steps:
1. Open DevTools → Network tab
2. Login as CASHIER
3. Navigate to different pages (5-6 times)
4. Watch /cash-shift/current API calls
5. Expected: First call fetches (200-500ms), subsequent calls use cache (<1ms)

Expected Results:
✅ First call to /cash-shift/current: Network request
✅ Next 4 calls within 5 seconds: No network request (cached)
✅ After 5 seconds: New network request triggered
✅ ~90% reduction in API calls
✅ <1ms response time for cached data
✅ No duplicate concurrent requests
```

### Test E2: Request Deduplication
```
⏱️ Expected Time: 10 min

Steps:
1. Open DevTools → Network tab
2. Simulate network lag (DevTools → Network → set throttle)
3. Refresh page rapidly
4. Monitor /auth/me endpoint
5. Expected: Single request despite rapid refresh attempts

Expected Results:
✅ /auth/me called only once even if page refreshed while request pending
✅ Subsequent requests reuse pending promise
✅ No duplicate /auth/me requests in network tab
✅ Proper deduplication working
```

### Test E3: API Response Times
```
⏱️ Expected Time: 5 min

Measure response times for key endpoints:
- /api/auth/me: <200ms
- /api/orders: <300ms
- /api/analytics/trends: <500ms (first call), <1ms (cached)
- /api/dashboard/stats: <300ms

Expected Results:
✅ Most endpoints: <300ms response time
✅ Complex analytics: <500ms acceptable
✅ Cached data: <5ms
✅ No timeouts or 504 errors
```

### Test E4: Concurrent Users
```
⏱️ Expected Time: 5 min

Steps:
1. Simulate 5 concurrent users logging in
2. Monitor API response times
3. Check for any 429 (rate limit) or 503 (overload) errors

Expected Results:
✅ 5 concurrent users can login
✅ Response times remain acceptable
✅ No rate limiting or overload
✅ All requests process successfully
```

---

## Test Execution Checklist

### Before Testing
- [ ] Server confirmed running (docker compose ps)
- [ ] All 8 services healthy
- [ ] Frontend accessible at http://192.168.1.101
- [ ] Test user accounts ready
- [ ] DevTools open in browser
- [ ] Network throttling available if needed

### During Testing
- [ ] Document any failures or unexpected behavior
- [ ] Take screenshots of any errors
- [ ] Note response times
- [ ] Monitor for console errors
- [ ] Check backend logs for issues

### After Testing
- [ ] Compile all test results
- [ ] Identify any bugs or issues
- [ ] Create bug reports with reproduction steps
- [ ] Get QA team sign-off
- [ ] Get security team sign-off
- [ ] Proceed to production only if all tests pass

---

## Test Data & Credentials

### Sample User Accounts
```
SUPER_ADMIN:
- Email: super@warungin.local
- Password: test123
- 2FA: Required

ADMIN_TENANT:
- Email: admin@warungin.local
- Password: test123
- 2FA: Required

SUPERVISOR:
- Email: supervisor@warungin.local
- Password: test123
- Assigned Stores: [1, 2, 3]

CASHIER:
- Email: cashier@warungin.local
- Password: test123
- Assigned Store: 1

KITCHEN:
- Email: kitchen@warungin.local
- Password: test123
- Assigned Store: 1
```

---

## Success Criteria

### Must Pass
- [x] All 8 services running & healthy
- [ ] Authentication working for all 5 roles
- [ ] 2FA mandatory for SUPER_ADMIN & ADMIN_TENANT
- [ ] 2FA NOT required for SUPERVISOR, CASHIER, KITCHEN
- [ ] Authorization working (403 for unauthorized access)
- [ ] Supervisor store guard protecting all endpoints
- [ ] CASHIER/KITCHEN cannot access other stores
- [ ] Frontend loads without errors
- [ ] API responses normal (<500ms typical)
- [ ] Shift caching working (5s TTL, 90% reduction)
- [ ] No console JavaScript errors
- [ ] No unhandled API errors

### Nice to Have
- [ ] Performance under load
- [ ] Multi-tab session sync
- [ ] Advanced reporting features
- [ ] Export functionality

---

## Approval Sign-Off

After all tests pass:

**QA Lead**: _______________  Date: _______
**Security Lead**: _______________  Date: _______
**Tech Lead**: _______________  Date: _______
**Product Manager**: _______________  Date: _______

---

## Document Information

| Info | Value |
|------|-------|
| **Version** | 1.0 |
| **Created** | December 31, 2025 |
| **Status** | Ready for Execution |
| **Total Test Cases** | 40+ |
| **Estimated Time** | 2-4 hours |
| **Next Phase** | Production Deployment |

---

**Ready to Execute Tests** ✅
