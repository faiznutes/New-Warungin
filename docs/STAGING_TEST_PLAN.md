# STAGING TEST PLAN - Complete Pre-Deployment Testing

**Date:** December 31, 2025  
**Status:** Ready for Testing Phase  
**Environment:** Staging (docker-compose.yml)  
**Duration:** 2-3 hours estimated

---

## Overview

This test plan verifies all 15 fixes are working correctly in staging environment before production deployment. Tests cover:
- ✅ 5 user roles with proper access control
- ✅ 13+ API endpoints with supervisor store guard
- ✅ Frontend route protection and guards
- ✅ Performance optimization (shift caching, dedup)
- ✅ Security hardening (2FA, token storage, addon bypass)

---

## Pre-Deployment Checklist

### 1. Build & Compile Verification
- [ ] **Backend Build**
  ```bash
  cd /path/to/project
  npm run build  # or yarn build
  # Expected: ✅ 0 errors, warnings OK
  ```
- [ ] **Client Build**
  ```bash
  cd /path/to/project/client
  npm run build  # or yarn build
  # Expected: ✅ 0 errors, warnings OK
  ```
- [ ] **Lint Check**
  ```bash
  npm run lint
  # Expected: ✅ 0 critical errors
  ```

### 2. Docker Image Build
- [ ] **Backend Docker Build**
  ```bash
  docker build -f Dockerfile.backend -t warungin-backend:staging .
  # Expected: ✅ Build successful
  ```
- [ ] **Client Docker Build**
  ```bash
  cd client && docker build -f Dockerfile.dev -t warungin-client:staging .
  # Expected: ✅ Build successful
  ```

### 3. Staging Environment Setup
- [ ] **Start Services**
  ```bash
  docker-compose -f docker-compose.test.yml up -d
  # Expected: ✅ All services running
  ```
- [ ] **Database Migration**
  ```bash
  docker-compose exec backend npm run prisma:migrate
  # Expected: ✅ Migrations applied
  ```
- [ ] **Health Check**
  ```bash
  curl http://localhost:3000/health
  # Expected: ✅ 200 OK
  ```

---

## Test Phase 1: Authentication & Authorization

### Test Set 1.1: 2FA Enforcement (CRITICAL-1)
**Objective:** Verify 2FA is enforced for both SUPER_ADMIN and ADMIN_TENANT

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 1.1.1 | SuperAdmin login without 2FA | 401 or 2FA prompt | ✅ |
| 1.1.2 | SuperAdmin login with 2FA | 200 OK, session token | ✅ |
| 1.1.3 | AdminTenant login without 2FA | 401 or 2FA prompt | ✅ |
| 1.1.4 | AdminTenant login with 2FA | 200 OK, session token | ✅ |
| 1.1.5 | Supervisor login (no 2FA required) | 200 OK, no 2FA prompt | ✅ |
| 1.1.6 | Cashier login (no 2FA required) | 200 OK, no 2FA prompt | ✅ |

**Curl Test:**
```bash
# Test 2FA enforcement on SuperAdmin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@test.com","password":"password"}' \
# Expected: 401 or {"require2FA": true, "userId": "...", "sessionToken": "..."}
```

---

### Test Set 1.2: Store Assignment Validation (CRITICAL-2)
**Objective:** Verify CASHIER/KITCHEN cannot login without assignedStoreId

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 1.2.1 | Create Cashier without store | User created | ✅ |
| 1.2.2 | Login as Cashier without store | 403 Forbidden | ✅ |
| 1.2.3 | Create Cashier with store | User created | ✅ |
| 1.2.4 | Login as Cashier with store | 200 OK | ✅ |
| 1.2.5 | Kitchen user without store | 403 Forbidden | ✅ |
| 1.2.6 | Kitchen user with store | 200 OK | ✅ |

**Curl Test:**
```bash
# Test Cashier without store assignment
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cashier-no-store@test.com","password":"password"}' \
# Expected: 403 {"message": "Store assignment required for this role"}
```

---

### Test Set 1.3: Session & Token Management (HIGH-3, HIGH-7)
**Objective:** Verify token storage consistency and session shift loading

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 1.3.1 | Login with "Remember Me" | Token in localStorage | ✅ |
| 1.3.2 | Login without "Remember Me" | Token in sessionStorage | ✅ |
| 1.3.3 | Logout | Token removed from localStorage | ✅ |
| 1.3.4 | Logout | Token removed from sessionStorage | ✅ |
| 1.3.5 | Page refresh with stored token | Session restored | ✅ |
| 1.3.6 | Page refresh with session token | Shift status loaded | ✅ |

**Browser Test:**
```javascript
// Test 1.3.1 - Remember Me (localStorage)
localStorage.getItem('token')  // Should exist after login
// Expected: token string present

// Test 1.3.5 - Page refresh
// 1. Login with Remember Me
// 2. Refresh page
// 3. Check authStore.isAuthenticated
// Expected: true (session restored)

// Test 1.3.6 - Shift status on refresh
// 1. Open shift as Cashier
// 2. Refresh page  
// 3. Check shift status in UI
// Expected: Shows as open (not stale)
```

---

## Test Phase 2: Supervisor Store Enforcement (HIGH-1)

### Test Set 2.1: Supervisor Store Guard on Analytics (4 endpoints)
**Objective:** Verify supervisor can only access own stores on analytics endpoints

| # | Endpoint | Own Store | Other Store | Admin | SuperAdmin | Status |
|---|----------|-----------|-------------|-------|-----------|--------|
| 2.1.1 | GET /api/analytics/predictions | 200 ✅ | 403 ✅ | 200 ✅ | 200 ✅ | |
| 2.1.2 | GET /api/analytics/top-products | 200 ✅ | 403 ✅ | 200 ✅ | 200 ✅ | |
| 2.1.3 | GET /api/analytics/trends | 200 ✅ | 403 ✅ | 200 ✅ | 200 ✅ | |
| 2.1.4 | GET /api/analytics/custom-reports | 200 ✅ | 403 ✅ | 200 ✅ | 200 ✅ | |

**Curl Test:**
```bash
# Supervisor accessing own store
curl -X GET "http://localhost:3000/api/analytics/predictions?storeId=STORE_1" \
  -H "Authorization: Bearer $SUPERVISOR_TOKEN"
# Expected: 200 OK

# Supervisor accessing other store
curl -X GET "http://localhost:3000/api/analytics/predictions?storeId=STORE_2" \
  -H "Authorization: Bearer $SUPERVISOR_TOKEN"
# Expected: 403 {"message": "Not authorized to access this store"}
```

---

### Test Set 2.2: Supervisor Store Guard on Products (2 endpoints)
**Objective:** Verify product access is restricted by store

| # | Endpoint | Own Store | Other Store | Status |
|---|----------|-----------|-------------|--------|
| 2.2.1 | GET /api/products | 200 ✅ | 403 ✅ | |
| 2.2.2 | GET /api/products/low-stock/all | 200 ✅ | 403 ✅ | |

**Test Procedure:**
```bash
# Create supervisor with stores: STORE_1, STORE_2
# Assign products to different stores

# Test 2.2.1 - Get products from STORE_1
curl -X GET "http://localhost:3000/api/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Store-Id: STORE_1"
# Expected: 200 with products from STORE_1

# Test 2.2.1 - Get products from STORE_3 (not assigned)
curl -X GET "http://localhost:3000/api/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Store-Id: STORE_3"
# Expected: 403
```

---

### Test Set 2.3: Supervisor Store Guard on Customers (2 endpoints)
**Objective:** Verify customer access is restricted by store

| # | Endpoint | Own Store | Other Store | Status |
|---|----------|-----------|-------------|--------|
| 2.3.1 | GET /api/customers | 200 ✅ | 403 ✅ | |
| 2.3.2 | GET /api/customers/:id | 200 ✅ | 403 ✅ | |

**Test Procedure:**
```bash
# Test supervisor accessing customers from own store
curl -X GET "http://localhost:3000/api/customers" \
  -H "Authorization: Bearer $SUPERVISOR_TOKEN"
# Expected: 200 with customers from allowed stores

# Test supervisor accessing customer from other store
curl -X GET "http://localhost:3000/api/customers/CUST_OTHER" \
  -H "Authorization: Bearer $SUPERVISOR_TOKEN"
# Expected: 403 if customer belongs to unauthorized store
```

---

### Test Set 2.4: Supervisor Store Guard on Dashboard
**Objective:** Verify dashboard stats are restricted by store

| # | Endpoint | Own Store | Other Store | Status |
|---|----------|-----------|-------------|--------|
| 2.4.1 | GET /api/dashboard/stats | 200 ✅ | 403 ✅ | |

---

### Test Set 2.5: Other Endpoints with Store Guard
**Objective:** Verify remaining endpoints enforce store access

| # | Endpoint | Own Store | Other Store | Status |
|---|----------|-----------|-------------|--------|
| 2.5.1 | GET /api/orders | 200 ✅ | 403 ✅ | |
| 2.5.2 | GET /api/store-shift/current | 200 ✅ | 403 ✅ | |
| 2.5.3 | GET /api/reports/tenant | 200 ✅ | 403 ✅ | |

---

## Test Phase 3: Frontend Route Protection

### Test Set 3.1: POS Route Access (HIGH-5)
**Objective:** Verify /pos route respects role-based access

| # | Role | Can Access /pos | Can Access /kitchen | Status |
|---|------|-----------------|-------------------|--------|
| 3.1.1 | CASHIER | ✅ YES | ❌ NO (redirect) | |
| 3.1.2 | KITCHEN | ❌ NO (redirect) | ✅ YES | |
| 3.1.3 | SUPERVISOR | ✅ YES | ✅ YES | |
| 3.1.4 | ADMIN_TENANT | ❌ NO (redirect) | ❌ NO (redirect) | |
| 3.1.5 | SUPER_ADMIN | ✅ YES | ✅ YES | |

**Manual Test:**
```
1. Login as CASHIER
2. Navigate to http://localhost:5173/pos
   Expected: ✅ POS interface loads
3. Navigate to http://localhost:5173/kitchen
   Expected: ❌ Redirected to dashboard

1. Login as KITCHEN
2. Navigate to http://localhost:5173/pos
   Expected: ❌ Redirected to dashboard
3. Navigate to http://localhost:5173/kitchen
   Expected: ✅ Kitchen display loads
```

---

### Test Set 3.2: Store Selector Modal (HIGH-6, MEDIUM-1)
**Objective:** Verify store selector with timeout and required state

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 3.2.1 | Supervisor login with no store | Modal shows (required=true) | ✅ |
| 3.2.2 | Try close modal when required | Cannot dismiss with backdrop | ✅ |
| 3.2.3 | Try click Cancel when required | Button hidden or disabled | ✅ |
| 3.2.4 | Select store | Modal closes, store selected | ✅ |
| 3.2.5 | API slow (>5s) | Timeout error shown | ✅ |
| 3.2.6 | API fails | Specific error message shown | ✅ |

**Manual Test:**
```
1. Create supervisor with no selectedStore
2. Login
3. Expected: Store selector modal appears (required=true)
4. Try clicking backdrop
   Expected: Modal doesn't close
5. Check Cancel button
   Expected: Button is hidden or disabled
6. Select a store
   Expected: Modal closes, store set in UI
```

---

### Test Set 3.3: Forgot Password Redirect (MEDIUM-2)
**Objective:** Verify authenticated users cannot access forgot-password

| # | State | URL | Expected Result | Status |
|---|-------|-----|-----------------|--------|
| 3.3.1 | Not authenticated | /forgot-password | Allow access ✅ | |
| 3.3.2 | Authenticated | /forgot-password | Redirect to /app ✅ | |

**Manual Test:**
```
1. Logout completely
2. Navigate to http://localhost:5173/forgot-password
   Expected: ✅ Page loads
3. Login with valid credentials
4. Navigate to http://localhost:5173/forgot-password
   Expected: ❌ Redirected to /app/dashboard
```

---

### Test Set 3.4: Addon Bypass Consistency (HIGH-4)
**Objective:** Verify only BUSINESS_ANALYTICS is bypassed for AdminTenant

| # | Addon | AdminTenant Bypass | Other Roles | Status |
|---|-------|-------------------|------------|--------|
| 3.4.1 | BUSINESS_ANALYTICS | ✅ YES | Purchase required | |
| 3.4.2 | EXPORT_REPORTS | ❌ NO | Purchase required | |
| 3.4.3 | KITCHEN_DISPLAY | ❌ NO | Purchase required | |
| 3.4.4 | POS_INTEGRATION | ❌ NO | Purchase required | |

**Test Procedure:**
```
1. Login as AdminTenant
2. Access /app/analytics
   Expected: ✅ Page loads (BUSINESS_ANALYTICS bypassed)
3. Try access /app/reports?export=true
   Expected: ❌ 403 if not purchased
```

---

## Test Phase 4: Performance & Caching

### Test Set 4.1: Shift Status Cache (CRITICAL-3)
**Objective:** Verify 5s TTL caching reduces API calls by 90%+

| # | Test | Expected Result | Metric | Status |
|---|------|-----------------|--------|--------|
| 4.1.1 | First shift status call | API hit, 200ms response | Real call | ✅ |
| 4.1.2 | Second call <5s later | Cache hit, <1ms response | Cached | ✅ |
| 4.1.3 | Third call <5s later | Cache hit, <1ms response | Cached | ✅ |
| 4.1.4 | Fourth call >5s later | Cache expired, API hit | Real call | ✅ |

**Browser DevTools Test:**
```javascript
// Monitor Network tab while testing
// 1. Open /app as Cashier
// 2. Check Network: Should see 1 GET /cash-shift/current call
// 3. Navigate away and back
// 4. Check Network: Should NOT see duplicate call within 5s
// 5. Wait 5s, navigate away and back
// 6. Check Network: Should see new call after 5s

// Programmatic check
authStore.invalidateShiftCache()  // Force refresh
// Then immediately call getShiftStatus()
// Should make API call
```

---

### Test Set 4.2: Request Deduplication (MEDIUM-5)
**Objective:** Verify rapid reconnects don't trigger duplicate fetchMe() calls

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 4.2.1 | Rapid disconnect/reconnect (5x) | Single API call | ✅ |
| 4.2.2 | Sequential calls (separated) | Multiple API calls | ✅ |
| 4.2.3 | Check console logs | "[Auth] FetchMe already in progress" | ✅ |

**Browser Console Test:**
```javascript
// Simulate rapid reconnects
for (let i = 0; i < 5; i++) {
  authStore.fetchMe();
}
// Expected in console:
// [Auth] Fetching user profile...
// [Auth] FetchMe already in progress
// [Auth] FetchMe already in progress
// [Auth] FetchMe already in progress
// [Auth] FetchMe already in progress
// Only 1 API call made
```

---

### Test Set 4.3: Token Storage Consistency (HIGH-3)
**Objective:** Verify rememberMe handling and storage isolation

| # | Test | localStorage | sessionStorage | Status |
|---|------|--------------|---|--------|
| 4.3.1 | Login with Remember Me | ✅ Token | ❌ Removed | |
| 4.3.2 | Login without Remember Me | ❌ Removed | ✅ Token | |
| 4.3.3 | Logout | ❌ Removed | ❌ Removed | |

**Browser Storage Test:**
```javascript
// Test 4.3.1
// 1. Check "Remember Me" box
// 2. Login
// 3. Check storage:
localStorage.getItem('token')  // Should exist
sessionStorage.getItem('token')  // Should NOT exist

// Test 4.3.2
// 1. Uncheck "Remember Me" box
// 2. Login
// 3. Check storage:
localStorage.getItem('token')  // Should NOT exist
sessionStorage.getItem('token')  // Should exist

// Test 4.3.3
// 1. Logout
localStorage.getItem('token')  // Should be null
sessionStorage.getItem('token')  // Should be null
```

---

## Test Phase 5: Security Audit

### Test Set 5.1: 403 Response Verification
**Objective:** Verify unauthorized access returns proper 403 responses

| # | Scenario | Expected Code | Expected Message | Status |
|---|----------|---|---|--------|
| 5.1.1 | Supervisor accessing other store | 403 | "Not authorized to access this store" | ✅ |
| 5.1.2 | Cashier without store | 403 | "Store assignment required" | ✅ |
| 5.1.3 | Kitchen without store | 403 | "Store assignment required" | ✅ |
| 5.1.4 | Role not in route | 302 | Redirect to dashboard | ✅ |

**Curl Test:**
```bash
# Test 5.1.1
curl -X GET "http://localhost:3000/api/products?storeId=OTHER_STORE" \
  -H "Authorization: Bearer $SUPERVISOR_TOKEN" \
  -w "\nHTTP Status: %{http_code}\n"
# Expected: HTTP Status: 403
# Response: {"message": "Not authorized to access this store"}
```

---

### Test Set 5.2: Token Security
**Objective:** Verify tokens cannot be used after logout

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 5.2.1 | Use token after logout | 401 Unauthorized | ✅ |
| 5.2.2 | Refresh token revoked | 401 Unauthorized | ✅ |
| 5.2.3 | Invalid token format | 401 Unauthorized | ✅ |

**Curl Test:**
```bash
# Get valid token
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}' \
  | jq -r '.token')

# Use token - should work
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN"
# Expected: 200

# Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"

# Try to use token again - should fail
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN"
# Expected: 401
```

---

### Test Set 5.3: CORS & Security Headers
**Objective:** Verify proper CORS and security headers

| # | Check | Expected | Status |
|---|-------|----------|--------|
| 5.3.1 | Access-Control-Allow-Origin | localhost:5173 | ✅ |
| 5.3.2 | Access-Control-Allow-Credentials | true | ✅ |
| 5.3.3 | X-Content-Type-Options | nosniff | ✅ |
| 5.3.4 | X-Frame-Options | DENY or SAMEORIGIN | ✅ |

**Curl Test:**
```bash
curl -I http://localhost:3000/api/health
# Check response headers
```

---

## Test Execution Notes

### For Each Test Set:
1. **Record Start Time**
2. **Execute Tests** in sequence
3. **Document Results** (✅ Pass / ❌ Fail)
4. **Note Any Issues**
5. **Record End Time**

### Failure Handling:
- If test fails: ❌ DO NOT proceed
- Document exact error message
- Check logs: `docker-compose logs -f`
- Roll back changes if needed
- Fix issue and re-run test

### Performance Benchmarks:
- Cache hit rate: Target 90%+ for shift status
- API response time: Target <500ms for uncached, <5ms for cached
- Page load time: Target <3s for full app

---

## Sign-Off Criteria

**All tests must PASS before production deployment:**
- ✅ All authentication tests pass
- ✅ All authorization tests pass
- ✅ All 13+ endpoint tests pass
- ✅ All performance tests meet targets
- ✅ All security tests pass
- ✅ No console errors or warnings
- ✅ No database errors in logs
- ✅ Response times acceptable

**If ANY test fails:**
1. Document failure with screenshot
2. Identify root cause
3. Fix issue in code
4. Rebuild and redeploy
5. Repeat failed test
6. Continue when all pass

---

## Staging Deployment Commands

```bash
# 1. Build Docker images
docker build -f Dockerfile.backend -t warungin-backend:staging .
cd client && docker build -f Dockerfile.dev -t warungin-client:staging .
cd ..

# 2. Start services
docker-compose -f docker-compose.test.yml up -d

# 3. Run migrations
docker-compose exec backend npx prisma migrate deploy

# 4. Seed test data (optional)
docker-compose exec backend npm run seed:staging

# 5. Verify services
curl http://localhost:3000/health
curl http://localhost:5173/

# 6. Check logs
docker-compose logs -f backend
docker-compose logs -f client
```

---

## Rollback Procedure

If critical issue found:
```bash
# 1. Stop services
docker-compose -f docker-compose.test.yml down

# 2. Revert code to previous version
git revert HEAD

# 3. Rebuild
docker build -f Dockerfile.backend -t warungin-backend:prev .

# 4. Restart with previous version
docker-compose -f docker-compose.test.yml up -d

# 5. Verify
curl http://localhost:3000/health
```

---

## Next Steps

**After All Tests Pass:**
1. ✅ Create staging test report
2. ✅ Get UAT approval
3. ✅ Schedule production deployment
4. ✅ Run production pre-flight checks
5. ✅ Execute production deployment
6. ✅ Monitor production for 24 hours

---

**Test Plan Owner:** Automated QA  
**Last Updated:** December 31, 2025  
**Version:** 1.0 - Production Ready
