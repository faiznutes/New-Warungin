# 🚨 Pre-Deployment Audit Report - Warungin POS

**Date:** December 30, 2025  
**Status:** CRITICAL ISSUES FOUND  
**Deployment Readiness:** ⛔ NOT READY

---

## Executive Summary

Based on comprehensive code audit of auth/role/permission systems, UI handlers, and routing logic, **multiple critical and high-priority issues were identified** that MUST be fixed before production deployment.

### Issues by Severity:
- 🔴 **CRITICAL (3)**: Authentication/Authorization bypass risks, Session handling, Deployment blocking
- 🟠 **HIGH (7)**: Role enforcement, Store assignment validation, Error handling
- 🟡 **MEDIUM (5)**: UI/UX edge cases, Missing handlers, Notifications

---

## 🔴 CRITICAL ISSUES

### C-1: SuperAdmin 2FA Bypass - Security Vulnerability
**File:** [src/middlewares/require2fa.ts](src/middlewares/require2fa.ts#L11)  
**Severity:** CRITICAL - SECURITY RISK  
**Status:** ❌ BROKEN

**Problem:**
```typescript
const ADMIN_ROLES_REQUIRING_2FA = ['ADMIN_TENANT']; // SUPER_ADMIN removed - can bypass 2FA
```

SuperAdmin can completely bypass 2FA requirement. This is a **SECURITY VULNERABILITY** for production.

**Impact:**
- SuperAdmin platform access has NO secondary authentication requirement
- If SuperAdmin credentials are compromised, attacker has full access
- Violates security best practices for admin accounts
- Multi-tenant data exposure risk

**Fix Required:**
Add SuperAdmin to 2FA enforcement OR implement conditional 2FA based on environment/configuration.

**Acceptance Criteria:**
- SuperAdmin must complete 2FA before accessing admin functions
- First login flow should prompt 2FA setup if not enabled
- 2FA verification must be enforced on each sensitive operation

---

### C-2: Role Guard Store Assignment Logic Has Missing Validation
**File:** [src/middlewares/auth.ts](src/middlewares/auth.ts#L141-L230)  
**Severity:** CRITICAL - Auth Bypass  
**Status:** ⚠️ PARTIALLY IMPLEMENTED

**Problem:**
- CASHIER/KITCHEN roles check `assignedStoreId` in auth guard
- But the validation logic doesn't properly handle **null/undefined cases**
- Line 233: `autoStoreId = permissions?.assignedStoreId || null;` - if permissions is undefined, this becomes null without validation
- No explicit error thrown if store validation fails during guard execution

**Impact:**
- Cashiers WITHOUT proper store assignment might get through
- Silent failures could allow unauthorized access
- Store segregation (multi-store security boundary) is compromised

**Fix Required:**
Add explicit validation with clear error messages and proper permission checks.

---

### C-3: Frontend Store Selector Logic Has Race Condition
**File:** [client/src/router/index.ts](client/src/router/index.ts#L750-L810)  
**Severity:** CRITICAL - Auth Flow Broken  
**Status:** ⚠️ PARTIALLY WORKING

**Problem:**
```typescript
// CASHIER FORCED TO OPEN SHIFT - BUT...
if (hasToken && authStore.user?.role === 'CASHIER') {
  if (to.name !== 'open-shift' && to.name !== 'login') {
    try {
      const cashResponse = await api.get('/cash-shift/current');
      // ...infinite loop risk if check keeps failing
    }
  }
}
```

Issues:
- **Race condition:** Multiple simultaneous route guards checking shift status
- **API chatty:** Every navigation triggers `/cash-shift/current` check
- **Loop risk:** If shift check fails, redirect to open-shift, then check again
- **No caching:** Shift status not cached, causing repeated API calls

**Impact:**
- Cashiers experience hanging/slow navigation
- Shift status goes out of sync with UI
- API overload if multiple cashiers navigate simultaneously
- Potential infinite redirect loop

---

## 🟠 HIGH PRIORITY ISSUES

### H-1: SUPERVISOR Role Store Assignment Incomplete
**File:** [src/services/auth.service.ts](src/services/auth.service.ts#L176-L210)  
**Severity:** HIGH - Missing Validation  
**Status:** ⚠️ PARTIALLY IMPLEMENTED

**Problem:**
- SUPERVISOR has `allowedStoreIds` array validation
- But doesn't enforce that SUPERVISOR can ONLY access assigned stores
- Backend doesn't validate store-specific API calls against `allowedStoreIds`

**Impact:**
- Supervisors might access data from stores they're not assigned to
- No per-store access control enforcement
- Data leakage across stores in multi-store setup

---

### H-2: Missing Error Handler for Inactive Store During Login
**File:** [src/services/auth.service.ts](src/services/auth.service.ts#L160-L200)  
**Severity:** HIGH - UX/Security  
**Status:** ⚠️ INCOMPLETE

**Problem:**
- Proper error message for inactive store exists
- But NO corresponding notification/UI component on frontend to display it properly
- User gets error but unclear remediation path

**Fix:** Frontend must catch and display store-related auth errors with clear action items.

---

### H-3: Auth Token Storage Inconsistency
**File:** [client/src/stores/auth.ts](client/src/stores/auth.ts#L22-L31)  
**Severity:** HIGH - Session Management Bug  
**Status:** ❌ BROKEN BEHAVIOR

**Problem:**
```typescript
const token = ref<string | null>(localStorage.getItem('token'));
const isAuthenticated = computed(() => {
  const hasToken = token.value || localStorage.getItem('token') || sessionStorage.getItem('token');
  // Dual storage without clear strategy
});
```

Issues:
- Token can be in: `token.ref`, `localStorage`, OR `sessionStorage`
- No clear rule for which takes precedence
- Remember Me checkbox uses localStorage but no conditional logic
- Multiple storage locations = potential desync

**Impact:**
- Logout might not clear all storage locations
- User appears logged in on one storage but not another
- Session hijacking/reuse risks if not properly cleared

---

### H-4: Router Guard Addon Check Has Bypass
**File:** [client/src/router/index.ts](client/src/router/index.ts#L865-L895)  
**Severity:** HIGH - Feature Enforcement  
**Status:** ⚠️ IMPLEMENTATION ISSUE

**Problem:**
```typescript
// Admin Tenant bypass addon check for BUSINESS_ANALYTICS
if (userRole === 'ADMIN_TENANT' && requiredAddon === 'BUSINESS_ANALYTICS') {
  next(); // Just bypass!
  return;
}
```

Admin Tenant can access BUSINESS_ANALYTICS features without subscription. This might be intentional but:
- Other addons DON'T have similar bypass
- Inconsistent feature enforcement
- Could lead to revenue leakage if not intentional

---

### H-5: Kitchen Display and POS Missing Role in Nav Guards
**File:** [client/src/router/index.ts](client/src/router/index.ts#L133-L140)  
**Severity:** HIGH - Unauthorized Access  
**Status:** ⚠️ INCOMPLETE

**Problem:**
Kitchen and POS routes allow: `['KITCHEN', 'SUPERVISOR', 'SUPER_ADMIN']`

But SUPER_ADMIN shouldn't access KITCHEN display directly (should go to super-dashboard).

Missing role validation creates confusion in navigation flow.

---

### H-6: Store Selector Modal Has No Fallback
**File:** [client/src/router/index.ts](client/src/router/index.ts#L790-L810)  
**Severity:** HIGH - UX Breaking  
**Status:** ⚠️ FAILS SILENTLY

**Problem:**
```typescript
if (requiresStore && !hasStore && to.name !== 'login' && to.name !== 'unauthorized') {
  try {
    const outletsResponse = await api.get('/outlets');
    // WHAT IF API FAILS?
    // WHAT IF USER HAS ZERO OUTLETS?
  }
}
```

If:
- API fails → User stuck
- User has no outlets → Confusing error message
- Modal closes without selection → Falls through to unauthorized

---

### H-7: Shift Status Not Validated in Session Initialize
**File:** [client/src/stores/auth.ts](client/src/stores/auth.ts)  
**Severity:** HIGH - Operational Bug  
**Status:** ⚠️ MISSING FEATURE

**Problem:**
- On page refresh, authStore restores user but NOT their shift status
- Cashier could be shown "Open Shift" button but shift is already open
- OR shown POS but shift is closed (stale data)

---

## 🟡 MEDIUM PRIORITY ISSUES

### M-1: LoginPage Store Selector Modal Missing Error States
**File:** [client/src/views/auth/Login.vue](client/src/views/auth/Login.vue#L200-L250)  
**Severity:** MEDIUM - UX  
**Status:** ⚠️ INCOMPLETE

**Problem:**
- `StoreSelectorModal` is called with `required="true"`
- But no error handling if modal closes without selection
- User could click outside modal and login without store selection

**Fix:** Make modal non-dismissible if required, or handle close properly.

---

### M-2: ForgotPassword Route Missing Auth State Check
**File:** [client/src/router/index.ts](client/src/router/index.ts#L75-L78)  
**Severity:** MEDIUM - UX  
**Status:** ⚠️ INCOMPLETE

**Problem:**
- `/forgot-password` is public (no `requiresAuth`)
- But if user is already authenticated, should redirect to dashboard
- Creates weird UX if authenticated user tries to access

---

### M-3: Notification/Toast System Missing for Auth Errors
**File:** [src/routes/auth.routes.ts](src/routes/auth.routes.ts)  
**Severity:** MEDIUM - UX  
**Status:** ⚠️ INCOMPLETE

**Problem:**
- Error messages from backend are generic (e.g., "User not found", "Store inactive")
- Frontend login page doesn't have rich error UI
- User gets cryptic messages instead of clear remediation

**Required:**
- Toast/notification system for each auth error type
- Specific error codes from backend
- User-friendly error messages

---

### M-4: No Logout Across All Storage Locations
**File:** [client/src/stores/auth.ts](client/src/stores/auth.ts)  
**Severity:** MEDIUM - Security  
**Status:** ⚠️ INCOMPLETE

**Problem:**
Missing comprehensive logout that clears:
- `localStorage`
- `sessionStorage`
- All auth state
- Backend session (if any)

Current implementation likely only clears one location.

---

### M-5: User Profile Sync Missing During Route Changes
**File:** [client/src/router/index.ts](client/src/router/index.ts#L700-L730)  
**Severity:** MEDIUM - Data Consistency  
**Status:** ⚠️ RACE CONDITION

**Problem:**
- Multiple async calls to `fetchMe()` without request deduplication
- If user navigates quickly, multiple profile fetches happen simultaneously
- Could cause state conflicts

**Fix:** Implement request deduplication/caching for `fetchMe()`.

---

## ✅ What's Working Well

- ✅ Basic JWT token validation and expiration checking
- ✅ Role-based route meta configuration exists
- ✅ Permission interface for extensibility
- ✅ CORS headers properly set in auth guard
- ✅ Error logging is comprehensive
- ✅ Password validation uses bcrypt (not plaintext)

---

## 📋 REQUIRED FIXES BEFORE DEPLOYMENT

### Phase 1: CRITICAL (MUST FIX - Blocks Deployment)

| # | Issue | File | Fix Type | Est. Time |
|---|-------|------|----------|-----------|
| 1 | SuperAdmin 2FA Bypass | require2fa.ts | Add enforcement | 2h |
| 2 | Store Assignment Race Condition | auth.ts, router/index.ts | Redesign logic | 4h |
| 3 | Token Storage Consistency | auth.ts | Refactor storage | 3h |
| 4 | Shift Status Caching | router/index.ts, auth.ts | Add cache layer | 3h |
| 5 | Role Guard Validation | auth.ts | Add explicit checks | 2h |

**Total: ~14 hours**

### Phase 2: HIGH (Should Fix Before Launch)

| # | Issue | File | Fix Type | Est. Time |
|---|-------|------|----------|-----------|
| 6 | Store Selector Fallback | router/index.ts | Add error handling | 2h |
| 7 | Supervisor Store Enforcement | auth service | Add API validation | 3h |
| 8 | Store Inactive Error Display | Login.vue | Add error UI | 2h |
| 9 | Addon Consistency | router/index.ts | Fix bypass logic | 1h |
| 10 | Logout Completeness | auth.ts | Full cleanup | 1h |

**Total: ~9 hours**

### Phase 3: MEDIUM (Nice to Have Before Launch)

| # | Issue | File | Fix Type | Est. Time |
|---|-------|------|----------|-----------|
| 11 | Modal Required State | Login.vue, StoreSelectorModal | UX fix | 1h |
| 12 | ForgotPassword Redirect | router/index.ts | Add redirect | 0.5h |
| 13 | Request Deduplication | auth.ts | Add caching | 1.5h |
| 14 | Auth Error Notifications | Login.vue | Add toast UI | 2h |

**Total: ~4.5 hours**

---

## 🔧 Implementation Checklist

- [ ] C-1: Enforce 2FA for SuperAdmin
- [ ] C-2: Add explicit store validation in auth guard
- [ ] C-3: Implement shift status caching in auth store
- [ ] H-1: Add store-level API authorization check
- [ ] H-2: Display store-related login errors properly
- [ ] H-3: Standardize token storage strategy
- [ ] H-4: Fix addon bypass logic consistency
- [ ] H-5: Remove SUPER_ADMIN from kitchen/POS routes
- [ ] H-6: Add fallback handling for outlet check failures
- [ ] H-7: Load shift status on auth restore
- [ ] M-1: Make store selector modal non-dismissible when required
- [ ] M-2: Add redirect for authenticated users accessing forgot-password
- [ ] M-3: Implement auth error notification system
- [ ] M-4: Complete logout cleanup in all storage
- [ ] M-5: Add request deduplication for fetchMe()

---

## 📊 Testing Requirements

After fixes, verify:

### Authentication Tests
- [ ] Login with each role (SuperAdmin, AdminTenant, Supervisor, Cashier, Kitchen)
- [ ] Login fails with inactive account
- [ ] Login fails with inactive tenant (non-SuperAdmin)
- [ ] Login fails with inactive store (Cashier/Kitchen without active store)
- [ ] 2FA is enforced for AdminTenant (MUST be enabled)
- [ ] 2FA is enforced for SuperAdmin (MUST be enabled)

### Authorization Tests
- [ ] CASHIER cannot access routes outside their store
- [ ] SUPERVISOR can only access assigned stores
- [ ] SUPER_ADMIN can access all routes
- [ ] Inactive users cannot login
- [ ] Tokens expire and force re-login
- [ ] Logout clears all sessions/storage

### Session Tests
- [ ] Page refresh maintains session
- [ ] Multiple tabs stay in sync
- [ ] Remember Me works correctly
- [ ] Shift status updates in real-time

### Edge Cases
- [ ] User with no stores gets proper error
- [ ] Store becomes inactive after login (next request fails)
- [ ] Tenant becomes inactive after login (next request fails)
- [ ] User account disabled during session (next request fails)

---

## 🚀 Deployment Recommendation

**DO NOT DEPLOY** until all CRITICAL issues (C-1, C-2, C-3) are fixed.

**Ready for staging** once all CRITICAL + HIGH issues are fixed.

**Ready for production** once all CRITICAL + HIGH + MEDIUM issues are fixed.

---

**Report Generated:** December 30, 2025  
**Audit Scope:** Auth, Roles, Permission enforcement, Route guards, UI Handlers  
**Next Review:** After implementation of Phase 1 fixes
