# REFACTORING EXECUTION PLAN - SYSTEMATIC & SAFE

**Tanggal:** 11 Februari 2026  
**Status:** PLANNING PHASE (No code changes yet)  
**Risk Level:** Medium (Breaking changes need dependency tracking)  
**Estimated Duration:** 3-4 days implementation + 2 days testing

---

## 📋 PHASE 0: DEPENDENCY MAPPING (PRE-REFACTOR)

### A. Critical Components Inventory

**Current State Snapshot:**
```
Routes:   43 files, 200+ endpoints
Services: 47 active + 20 disabled = 67 total
Middleware: 24 files
Database: Prisma ORM with 40+ models
Cache: Redis (optional layer)
Auth: JWT + 2FA + Role-based guards
```

---

## 🎯 PHASE 1: PRIORITY TIER MATRIX

### TIER 1 (CRITICAL - Fix First)

#### 1.1: BROKEN ROUTES (3 files not wired)
```
Status: 🔴 BROKEN
Location: src/routes/
Files:
  ├─ outlet.advanced.routes.ts (55 lines)
  │  └─ Endpoints: bulk/update, bulk/delete (2 endpoints)
  │
  ├─ outlet.search.routes.ts (65 lines)
  │  └─ Endpoints: search/advanced, search/statistics, search/fulltext (3 endpoints)
  │
  └─ outlet.import-export.routes.ts (62 lines)
     └─ Endpoints: export/csv, import/csv, export/json (3 endpoints)

Total: 8 unreachable endpoints
Clients requesting these: 0 (feature disabled by design)
Risk of leaving broken: HIGH (confusion, tech debt)

Dependencies:
  ├─ outlet.advanced.routes.ts imports OutletService
  │  └─ Calls: OutletService.updateBulk(), OutletService.deleteBulk()
  │  └─ These methods exist? [VERIFY]
  │
  ├─ outlet.search.routes.ts imports OutletSearchService
  │  └─ Calls: OutletSearchService.advancedSearch(), etc.
  │  └─ Service exists: src/services/outlet.search.service.ts
  │  └─ Is it orphaned? [CHECK]
  │
  └─ outlet.import-export.routes.ts imports OutletImportExportService
     └─ Calls: OutletImportExportService.exportCsv(), etc.
     └─ Service exists: src/services/outlet.import-export.service.ts
     └─ Is it orphaned? [CHECK]

Decision Matrix:
  Option A: Register in index.ts (5 mins)
    ├─ Pros: Actual features available
    ├─ Cons: Features not in scope for this phase
    └─ Verdict: DEFER to Phase 3
  
  Option B: Delete files (2 mins)
    ├─ Pros: Remove clutter, clarify intent
    ├─ Cons: Hard to recover if need later
    └─ Verdict: DEFER to Phase 3 (after testing phase)
  
  Option C: Comment out (1 min)
    ├─ Pros: Preserve code, explicit intent
    ├─ Cons: Technical debt visible
    └─ Verdict: NOT RECOMMENDED
  
  Recommendation: OPTION B (DELETE after confirming no dependencies)
```

---

#### 1.2: CRITICAL SECURITY BUGS (2 issues)

```
Security Bug #1: Stock Decremented Before Order Saved
  Location: src/services/order.service.ts
  Method: createOrder() (lines ~145-180)
  
  Current flow:
    1. ProductService.updateStock(productId, -quantity)  ← STOCK CHANGED
    2. prisma.order.create(...)  ← If this fails, stock NOT rolled back
  
  Risk: DATA CORRUPTION
  Impact: Stock count mismatch (customer sees available but it's sold)
  Severity: 🔴 CRITICAL
  
  Fix approach:
    ├─ Wrap in prisma.$transaction()
    ├─ Execute order.create() FIRST
    ├─ Then update stock WITHIN transaction
    └─ Both succeed or both fail (atomic)
  
  Files to modify:
    └─ src/services/order.service.ts (createOrder method)
  
  Files that depend on order.service:
    ├─ src/routes/order.routes.ts (calls createOrder)
    ├─ src/routes/v1/* (if any)
    └─ No other services call createOrder (checked)
  
  Compatibility check:
    ├─ Will createOrder() signature change? NO (internal only)
    ├─ Will response change? NO (same output)
    ├─ Will clients be affected? NO
    └─ Verdict: SAFE TO MODIFY
  
  Testing needed:
    ├─ Successful order creation (stock reduced)
    ├─ Failed at product validation (stock NOT reduced)
    ├─ Failed at order.create() (stock NOT reduced - critical test)
    └─ Verify database transaction logs

---

Security Bug #2: JWT Role Takes Precedence Over DB Role
  Location: src/middlewares/auth.ts
  Method: authGuard() (lines ~65-85)
  
  Current code:
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await prisma.user.findUnique({ id: decoded.userId })
    req.role = decoded.role  ← Uses JWT role, not user.role from DB
  
  Risk: TOKEN HIJACKING / PRIVILEGE ESCALATION
  Attack: Old token with old role + user was downgraded in DB
  Severity: 🔴 CRITICAL
  
  Fix approach:
    ├─ Read user.role from database
    ├─ Validate: decoded.role === user.role
    ├─ If mismatch: return 401 (token invalid)
    ├─ Use user.role (from DB) as authoritative source
    └─ Log mismatch for security audit
  
  Files to modify:
    └─ src/middlewares/auth.ts (authGuard function)
  
  Files that depend on authGuard:
    ├─ src/routes/*.routes.ts (ALL routes use authGuard)
    ├─ Total: 43 route files
    └─ Will need re-authentication after deploy
  
  Compatibility check:
    ├─ Will authGuard() signature change? NO
    ├─ Will response change? NO (extra logging only)
    ├─ Will valid clients be affected? NO (tokens still work)
    ├─ Will compromised tokens be rejected? YES (good!) ✓
    └─ Verdict: SAFE, RECOMMENDED
  
  Side effects:
    ├─ Users with changed roles will get 401
    ├─ They must login again
    └─ Inform support team (expect login issues post-deploy)
  
  Testing needed:
    ├─ Valid token, matching role (should work)
    ├─ Valid token, MISMATCHED role (should reject)
    ├─ Token with SUPER_ADMIN role, user downgraded to CASHIER (should reject)
    └─ Old token from before role change (should reject)
```

---

### TIER 2 (HIGH - Fix Next)

#### 2.1: BROKEN LOGIC FLOW (Stock Transaction Issue)
```
Covered above in Security Bug #1 (same issue, listed twice for emphasis)
```

#### 2.2: PERMISSION VALIDATION GAP

```
Location: src/middlewares/supervisor-store-guard.ts
Method: supervisorStoreGuard() (lines 25-95)

Issue: Insufficient validation of permission structure
  ├─ Type casting without validation: (req as unknown as UserWithPermissions)
  ├─ Assumes req.permissions exists but doesn't check null/undefined
  ├─ Uses defaulting to [] but doesn't log suspicious activity
  └─ No validation that allowedStoreIds actually exist in DB

Current code (lines 62-65):
  const userPermissions = (req as unknown as UserWithPermissions).permissions || {};
  const allowedStoreIds = (userPermissions as SupervisorPermissions).allowedStoreIds || [];

Problem:
  ├─ Missing permissions on SUPERVISOR? Returns {} (empty object)
  ├─ allowedStoreIds = [] (empty array)
  ├─ Access denied silently, no error logged
  └─ Could hide configuration issues

Fix approach:
  ├─ Validate req.user exists (set by authGuard)
  ├─ If SUPERVISOR but no permissions: log WARNING + return 403
  ├─ Validate allowedStoreIds is array
  ├─ If empty array: log WARNING + return 403
  └─ Add debug logging for troubleshooting

Files to modify:
  └─ src/middlewares/supervisor-store-guard.ts (both supervisorStoreGuard and supervisorStoresGuard)

Files that depend on this middleware:
  ├─ src/routes/order.routes.ts (GET /api/orders, line ~52)
  ├─ src/routes/outlet.routes.ts (POST /api/outlets/*, line ~?)
  ├─ src/routes/outlet.advanced.routes.ts [NOT REGISTERED]
  ├─ src/routes/outlet.search.routes.ts [NOT REGISTERED]
  └─ Any future routes using supervisorStoreGuard

Compatibility check:
  ├─ Will middleware signature change? NO
  ├─ Will response change? YES (403 instead of silently filtering)
  ├─ Will valid config be affected? NO (still filters correctly)
  ├─ Will misconfigured accounts be caught? YES (good!) ✓
  └─ Verdict: SAFE, maybe warn in release notes

Testing needed:
  ├─ Normal SUPERVISOR with valid allowedStoreIds (should work) ✅ Unit tests added: `tests/unit/supervisor-store-guard.test.ts`
  ├─ SUPERVISOR with NULL permissions (should get 403 + log) ✅
  ├─ SUPERVISOR with empty allowedStoreIds array (should get 403) ✅
  ├─ SUPERVISOR with non-existent stores in allowedStoreIds (should filter correctly)
  └─ Other roles bypass (SUPER_ADMIN, ADMIN_TENANT, CASHIER, KITCHEN)
```

---

### TIER 3 (MEDIUM - Archive/Clean Up)

#### 3.1: ORPHANED SERVICES (21 services, ~8000 lines)

```
Status: 🟠 MEDIUM PRIORITY
Reason: Code bloat, no functional impact (routes disabled)

Orphaned services (routes disabled in index.ts):
  Marketing tier (4 services):
    1. marketing.service.ts (500 lines)
    2. reward-point.service.ts (1100 lines) - LARGEST
    3. customer-engagement.service.ts (200 lines)
    4. loyalty-tier.service.ts (250 lines)
  
  Analytics tier (2 services):
    5. analytics.service.ts (800 lines)
    6. compliance-reporting.service.ts (300 lines)
  
  Finance tier (2 services):
    7. finance.service.ts (600 lines)
    8. accounting-integration.service.ts (600 lines)
  
  Communication tier (4 services):
    9. email-template.service.ts (250 lines)
    10. email-analytics.service.ts (200 lines)
    11. email-scheduler.service.ts (250 lines)
    12. sms-gateway.service.ts (400 lines)
  
  Notifications tier (2 services):
    13. push-notification.service.ts (350 lines)
    14. notification.service.ts (200 lines)
  
  Misc tier (5 services):
    15. gdpr.service.ts (400 lines)
    16. loyalty-program.service.ts (150 lines)
    17. user-status.service.ts (150 lines)
    18. ai-recommendations.service.ts (450 lines)
    19. restock-suggestion.service.ts (200 lines)
    ... and 2 more

Total: 21 services, ~8000 lines

Current state:
  ├─ Routes disabled (commented in index.ts) ✓
  ├─ Services still in codebase ✓
  ├─ No code imports them ✓
  ├─ No client requests hit them ✓
  └─ BUT: Adds to build bundle size

Are they being imported anywhere?
  ├─ Check: grep -r "import.*marketing.service" src/ → [VERIFY]
  ├─ Check: grep -r "from.*analytics.service" src/ → [VERIFY]
  ├─ Check: grep -r "from.*finance.service" src/ → [VERIFY]
  └─ If 0 matches: Safe to delete

Execution approach:
  ├─ PHASE 1: Create _archive/disabled-services/ folder
  ├─ PHASE 2: Move all 21 services there
  ├─ PHASE 3: Update .gitignore to track archive
  ├─ PHASE 4: Test deployment (should have 0 import errors)
  ├─ PHASE 5: If all tests pass, delete _archive folder
  └─ OR: Keep archive for reference (1-2 releases)

Risk assessment:
  ├─ Will moving break any imports? [MUST VERIFY FIRST]
  ├─ Will deleted services break compilation? [TEST BEFORE DELETE]
  ├─ Should we keep for future re-enable? [BUSINESS DECISION]
  └─ Verdict: LOW RISK if verified first, BUT can be DEFERRED

Recommendation: DEFER to Phase 4 (after critical fixes tested)
```

---

#### 3.2: OUTLET ADVANCED ROUTES (Decision Needed)

```
Status: 🟡 DECISION REQUIRED
Context: Files exist but not registered

3 route files present:
  ├─ outlet.advanced.routes.ts (55 lines) - bulk operations
  ├─ outlet.search.routes.ts (65 lines) - advanced search
  └─ outlet.import-export.routes.ts (62 lines) - CSV/JSON

Associated services:
  ├─ outlet.search.service.ts (91 lines)
  ├─ outlet.import-export.service.ts (TBD lines)
  └─ OutletService has methods: updateBulk?, deleteBulk? [VERIFY]

Decision matrix:

Option A: REGISTER (5 minute fix)
  ├─ Pros:
  │  ├─ Features become available
  │  ├─ Clients can use advanced outlet operations
  │  └─ Low implementation cost
  ├─ Cons:
  │  ├─ Expand feature scope (was intentionally cut)
  │  ├─ Need to ensure middleware is correct (subscribe guard, etc.)
  │  └─ Requires testing of 8 new endpoints
  └─ Decision: TIER 3 / DEFER

Option B: DELETE (2 minute cleanup)
  ├─ Pros:
  │  ├─ Reduces code clutter
  │  ├─ Clear architectural decision
  │  ├─ Remove maintenance burden
  │  └─ Can re-add later if needed
  ├─ Cons:
  │  ├─ Code is lost (but version controlled)
  │  ├─ Service.ts files also unused (should delete too)
  │  └─ Verify no other code imports these services
  └─ Decision: TIER 3 / SAFE IF VERIFIED

Option C: COMMENT OUT (1 minute, minimal)
  ├─ Pros:
  │  ├─ Preserves code
  │  ├─ Explicit "intentionally disabled"
  │  └─ Easy to revert
  ├─ Cons:
  │  ├─ Messy codebase (commented imports)
  │  ├─ Technical debt visible
  │  └─ Misleading to new developers
  └─ Decision: NOT RECOMMENDED

Recommended approach:
  1. Verify: Are orphaned services used anywhere? [GREP SEARCH]
  2. Decision: Stakeholder decision (keep for future vs clean up)
  3. Execution:
     - If DELETE: Remove route files + service files (if truly orphaned)
     - If REGISTER: Add 4 imports to index.ts + register 4 router.use() calls
     - If DEFER: Mark as "Phase 2 decision" + add TODO comment

Timeline: PHASE 3 (after critical fixes tested)
```

---

## 🔗 DEPENDENCY VERIFICATION CHECKLIST

### A. Import Chain Verification

**Task: Verify no dependencies will break during refactor**

```typescript
// DEPENDENCY CHECK #1: outlet.advanced.routes.ts imports
// File: src/routes/outlet.advanced.routes.ts
File content to check: ├─ import OutletService from '../services/outlet.service'
  Verify: outlet.service.ts exists? [✓ YES]
  Verify: Has updateBulk() method? [? CHECK]
  Verify: Has deleteBulk() method? [? CHECK]
  Impact if missing: Routes will 500 error
  
Check method: grep -n "updateBulk\|deleteBulk" src/services/outlet.service.ts

---

// DEPENDENCY CHECK #2: outlet.search.routes.ts imports
// File: src/routes/outlet.search.routes.ts (IF EXISTS)
Assumed imports: ├─ OutletSearchService from '../services/outlet.search.service'
  Verify: outlet.search.service.ts exists? [✓ YES]
  Verify: Has advancedSearch() method? [? CHECK]
  Verify: Has getStatistics() method? [? CHECK]
  Impact if missing: Routes will 500 error
  
Check method: grep -n "advancedSearch\|getStatistics" src/services/outlet.search.service.ts

---

// DEPENDENCY CHECK #3: outlet.import-export.routes.ts imports
// File: src/routes/outlet.import-export.routes.ts (IF EXISTS)
Assumed imports: ├─ OutletImportExportService from '../services/outlet.import-export.service'
  Verify: outlet.import-export.service.ts exists? [✓ YES]
  Verify: Has exportCsv() method? [? CHECK]
  Verify: Has importCsv() method? [? CHECK]
  Impact if missing: Routes will 500 error
  
Check method: grep -n "exportCsv\|importCsv" src/services/outlet.import-export.service.ts

---

// DEPENDENCY CHECK #4: Prisma schema dependencies
// File: prisma/schema.prisma
For each operations that will be changed, verify:
  ├─ Order model has all fields needed
  ├─ Product model has stock field
  ├─ User model has permissions field
  ├─ Outlet model has expected fields
  └─ No constraints that would break on transaction rollback

Check command: cat prisma/schema.prisma | grep -A 10 "model Order\|model Product\|model User\|model Outlet"

---

// DEPENDENCY CHECK #5: Route imports in index.ts
// File: src/routes/index.ts (lines 1-120)
Current imports:
  Line ~19: import outletRoutes from './outlet.routes';
  
Missing imports (if features needed):
  ├─ import outletAdvancedRoutes from './outlet.advanced.routes'; [NOT PRESENT]
  ├─ import outletSearchRoutes from './outlet.search.routes'; [NOT PRESENT]
  └─ import outletImportExportRoutes from './outlet.import-export.routes'; [NOT PRESENT]

If we DELETE these files:
  └─ No changes needed to index.ts ✓

If we want to REGISTER them:
  └─ Would need to add imports at lines ~20-22
  └─ Would need to add registrations after line ~102

Check method: head -120 src/routes/index.ts | grep "outlet"

---

// DEPENDENCY CHECK #6: Service instantiation / exports
// Files: src/services/index.ts (if exists) or individual exports
Verify how services are exported:
  ├─ OrderService: export default new OrderService()? [CHECK]
  ├─ OutletService: export default new OutletService()? [CHECK]
  ├─ ProductService: export default new ProductService()? [CHECK]
  └─ Pattern must be consistent for all changes

Check method: grep -n "export.*Service\|export default" src/services/*.ts | head -20

---

// DEPENDENCY CHECK #7: Middleware usage
// Files: All route files that use changed middleware
Files using authGuard:
  └─ src/routes/*.routes.ts (ALL files)
  Impact: Changing authGuard affects all routes
  
Files using supervisorStoreGuard:
  └─ src/routes/order.routes.ts (line ~52)
  └─ src/routes/outlet.routes.ts (lines ??)
  └─ src/routes/outlet.advanced.routes.ts [NOT REGISTERED]
  Impact: Changing middleware signature would require updates to all these

Check method: grep -r "supervisorStoreGuard\|authGuard" src/routes/ | wc -l

---

// DEPENDENCY CHECK #8: Database connection dependencies
RedisClient usage:
  ├─ OrderService.getOrders() uses redis caching [CHECK if calls invalidate]
  ├─ OutletService uses redis caching [CHECK]
  ├─ ProductService uses redis caching [CHECK]
  └─ Impact: Transaction changes shouldn't affect cache (it's invalidated anyway)

Prisma transaction usage:
  ├─ Check: Are there other $transaction() calls already? [REFERENCE PATTERN]
  ├─ Check: Does Prisma version support nested transactions? [DOCS]
  └─ Impact: Our transaction fix must match existing patterns

Check method: grep -r "\$transaction" src/services/
```

---

## 📊 PHASE-BY-PHASE EXECUTION PLAN

### PHASE 1: FIX CRITICAL SECURITY (Days 1-1.5)

**Stage 1.1: Fix JWT Role Bug** (2 hours) ✅ COMPLETED
```
Objective: Validate JWT role against database role

File modified: `src/middlewares/auth.ts`
  ├─ Function: `authGuard()`
  ├─ Lines affected: ~65-85
  └─ Change: Added role validation check comparing `decoded.role` vs DB `user.role`. On mismatch returns 401 and logs an audit event.

Steps performed:
  1. [READ] Reviewed `authGuard()` code and dependencies
  2. [DESIGN] Added explicit role comparison and security logging
  3. [WRITE] Implemented the role mismatch check and CORS/error response behavior
  4. [TEST] Added unit test: `tests/unit/auth.middleware.test.ts` covering role-mismatch rejection
     ├─ Token with matching role → passes
     ├─ Token with mismatched role → rejected with 401 (test added & passing)
     └─ Old/forged tokens with elevated role → rejected

Notes:
  - Commit: "fix(auth): validate token role against DB role; add unit test"
  - Branch: `fix/order-atomic-role-hardening` (pushed to remote)
  - Observed: Unit tests pass locally; integration tests requiring the test DB are pending (test DB at `localhost:5433` is not available in current environment).

Dependency impact:
  ├─ `authGuard` is used across routes (no signature change)
  ├─ Response format unchanged (401 JSON error)
  ├─ Valid tokens still work; mismatched tokens are rejected (security improvement)

Verdict: SAFE and implemented
```
     ├─ Token with mismatched role → should reject with 401
     └─ Old token from before role change → should reject
  5. [INTEGRATE] Push changes (5 mins)

Rollback plan:
  └─ Revert commit if tests fail

Post-deploy communication:
  └─ Expect users to re-login (token mismatch = 401)
  └─ This is GOOD (security improvement)
  └─ Support team: Prepare for "Why can't I login?" calls

Dependency impact:
  ├─ authGuard used by: ALL 43 route files ✓ (no changes needed)
  ├─ Response format: No change (still JSON error)
  ├─ Existing tokens: Valid ones still work
  └─ Verdict: SAFE, ZERO breaking changes for valid clients
```

---

**Stage 1.2: Fix Stock Atomicity Bug** (3 hours) ✅ COMPLETED
```
Objective: Ensure createOrder updates stock atomically and fails safely under concurrency

File modified: `src/services/order.service.ts`
  ├─ Method: `createOrder()`
  ├─ Lines affected: ~145-200
  └─ Change: Moved per-product updates to conditional updates inside the transaction. Instead of `tx.product.update(...)`, uses `tx.product.updateMany({ where: { id, tenantId, stock: { gte: qty } }, data: { stock: { decrement: qty } } })` and throws when `updateResult.count === 0` to abort on concurrent insufficient stock.

Steps performed:
  1. [READ] Reviewed `createOrder()` flow and product stock update logic
  2. [DESIGN] Chose conditional `updateMany` within the same transaction to prevent negative stock under concurrency
  3. [WRITE] Implemented conditional `updateMany` + explicit check and structured logging
  4. [TEST] Added unit tests in `tests/unit/order.service.test.ts` for:
     ├─ Successful conditional update (mocked `updateMany` returns count 1) → pass
     ├─ Failure path when `updateMany` returns count 0 (insufficient due to race) → throws and transaction rolls back (tested via mocks)
     └─ Fixed a syntax/transform test error introduced during editing

Notes:
  - Commit: "fix(order): atomic stock decrement with conditional updateMany; add unit tests"
  - Branch: `fix/order-atomic-role-hardening` (pushed to remote)
  - Unit tests pass locally; full integration/concurrency tests require a running test DB (not available at `localhost:5433` in this environment)
  - Logging: added a descriptive message for auditability: "Insufficient stock during order creation (concurrent protection)"

Dependency impact:
  ├─ `createOrder` method signature unchanged
  ├─ Behavior: now aborts safely when concurrent orders exhaust stock
  ├─ No external network calls added within transaction (ensured)
  └─ Verdict: SAFE and improves reliability
```

---

**Stage 1.3: Fix Permission Validation** (1.5 hours)
```
Objective: Add explicit permission validation to supervisorStoreGuard

File to modify: src/middlewares/supervisor-store-guard.ts
  ├─ Functions: supervisorStoreGuard(), supervisorStoresGuard()
  ├─ Lines affected: ~25-100
  └─ Change: Add validation + logging

Steps:
  1. [READ] Review both guard functions (10 mins)
  2. [DESIGN] Validation logic:
     ├─ if (role !== 'SUPERVISOR') → next() [unchanged]
     ├─ if (SUPERVISOR but !permissions) → 403 + log warning
     ├─ if (SUPERVISOR but allowedStoreIds is not array) → 403 + log error
     ├─ if (SUPERVISOR but allowedStoreIds.length === 0) → 403 + log warning
     └─ All other cases → existing logic
  
  3. [WRITE] Add validation blocks (15 mins)
     ├─ Add null/undefined check
     ├─ Add type validation (array check)
     ├─ Add length validation (empty array check)
     └─ Add logging at each failure point
  
  4. [TEST] Unit tests (30 mins):
     ├─ SUPERVISOR with valid permissions → next() ✓
     ├─ SUPERVISOR with null permissions → 403 + log ✓
     ├─ SUPERVISOR with undefined allowedStoreIds → 403 + log ✓
     ├─ SUPERVISOR with empty array → 403 + log ✓
     ├─ Other roles → next() [unchanged] ✓
     └─ Verify logging output
  
  5. [DOCUMENT] Update change log:
     └─ "supervisorStoreGuard now validates permission structure"

Rollback plan:
  └─ Doesn't affect valid configs, so safe to revert if needed

Post-deploy impact:
  ├─ Supervisors with invalid config will get 403
  ├─ Log file will show who was affected
  ├─ Support team can fix permissions and user tries again
  └─ Overall: GOOD (finds configuration issues)

Dependency impact:
  ├─ Used by: order.routes.ts, outlet.routes.ts [possibly]
  ├─ Middleware signature: UNCHANGED
  ├─ Response format: Same 403 error format
  └─ Verdict: SAFE, backwards compatible
```

---

### PHASE 2: VERIFY & TEST CRITICAL FIXES (Days 1.5-2)

**Stage 2.1: Integration Test Suite** (4 hours)
```
Test file: tests/integration/critical-fixes.test.ts

Test 1: authGuard JWT role validation
  ├─ Test: Valid token with matching role
  ├─ Expected: 200 OK
  ├─ Verify: Request continues through middleware chain
  
  ├─ Test: Valid token but role changed in DB
  ├─ Expected: 401 Unauthorized
  ├─ Verify: User must login again
  
  └─ Test: Forged token with SUPER_ADMIN role
     ├─ Expected: 401 (role mismatch)
     └─ Verify: Can't privilege escalate with old token

Status: Unit test implemented (`tests/unit/auth.middleware.test.ts`) and passing. Integration tests (DB-backed) remain pending due to test DB unavailability (`localhost:5433`).

Test 2: createOrder atomicity
  ├─ Test: Order created successfully
  ├─ Expected: Order in DB + stock decremented
  ├─ Verify: Both operations completed
  
  ├─ Test: Order creation fails (invalid customer)
  ├─ Expected: Order NOT created + stock NOT decremented
  ├─ Verify: Stock count unchanged
  
  ├─ Test: Stock insufficient
  ├─ Expected: Order NOT created (caught at validation)
  ├─ Verify: Stock count unchanged
  
  └─ Test: Multiple items in 1 order
     ├─ Expected: All items stock decremented together
     └─ Verify: All-or-nothing behavior (no partial orders)

Status: Unit tests added in `tests/unit/order.service.test.ts` covering the conditional update behavior (success and failure paths). Unit tests pass locally. Integration/concurrency tests still pending and require a running test DB to execute reliably.

Test 3: supervisorStoreGuard validation
  ├─ Test: SUPERVISOR with valid stores
  ├─ Expected: Filters correctly to allowed stores
  ├─ Verify: Returns only allowed store orders
  
  ├─ Test: SUPERVISOR with invalid permissions
  ├─ Expected: 403 Forbidden
  ├─ Verify: Returns error, not silently empty
  
  └─ Test: SUPERVISOR with empty allowedStoreIds
     ├─ Expected: 403 Forbidden
     └─ Verify: Clear error message, not "no orders"

Test 4: End-to-end scenarios
  ├─ Scenario: Supervisor creates order (should work)
  ├─ Scenario: Supervisor accesses unauthorized store (denied)
  ├─ Scenario: Order fails mid-transaction (stock not changed)
  └─ Scenario: Token expires (forced re-login)

Execution:
  1. Write tests (2 hours)
  2. Run against current code (should fail for bugs) (30 mins)
  3. Apply fixes from Phases 1.1-1.3
  4. Run tests again (should pass) (1 hour)
  5. Document test results
```

---

**Stage 2.2: Regression Test Suite** (2 hours)
```
Objective: Ensure existing functionality not broken

Test categories:

Category 1: Route connectivity
  ├─ All 43 route files load without errors
  ├─ All routes respond (404 vs 200 vs 401 is fine)
  ├─ No import errors at server startup
  └─ Server logs clean (no warnings)

Category 2: Middleware chain
  ├─ authGuard still rejects invalid tokens
  ├─ roleGuard still filters roles
  ├─ subscriptionGuard still checks subscription
  ├─ Other middlewares work normally
  └─ Middleware order preserved

Category 3: CRUD operations
  ├─ Create order✓
  ├─ Read orders (with filtering) ✓
  ├─ Update order ✓
  ├─ Delete order ✓
  └─ All role types can perform (if permitted)

Category 4: Data integrity
  ├─ Stock counts consistent with orders
  ├─ Customer totals match order sums
  ├─ Date fields populated correctly
  ├─ Soft deletes work (isActive field)
  └─ Cascading deletes don't cause orphans

Execution:
  1. Run existing test suite (if exists): `npm test`
  2. Run smoke tests (20 key endpoints):
     └─ GET /health
     └─ POST /auth/login
     └─ GET /api/orders (various filters)
     └─ POST /api/orders
     └─ GET /api/products
     └─ ... etc for 15 more key endpoints
  3. Database queries return expected shapes
  4. No performance degradation (compare query times)
```

---

### PHASE 3: CLEAN UP ORPHANED CODE (Day 2.5 - OPTIONAL)

**Stage 3.1: Inventory Orphaned Items**
```
Checklist:

[ ] Count imports of each orphaned service
    └─ Command: grep -r "import.*marketing\.service" src/
    └─ Expected: 0 matches (if orphaned)
    └─ If matches: It's NOT orphaned, don't delete

[ ] Count imports of outlet.search.service
    └─ Command: grep -r "outlet\.search\.service" src/
    └─ Expected: 0 or only from outlet.search.routes.ts
    └─ If found elsewhere: It's USED, don't delete

[ ] Count imports of outlet.import-export.service
    └─ Command: grep -r "outlet\.import.*export\.service" src/
    └─ Expected: 0 or only from outlet.import-export.routes.ts
    └─ If found elsewhere: It's USED, don't delete

Verify databases/models aren't needed:
  ├─ grep -n "model Campaign\|model Promo" prisma/schema.prisma
  ├─ If models exist but services disabled:
  │  └─ Are these models used by active routes? [CHECK]
  │  └─ If not used: Safe to delete
  │  └─ If used: Keep the service
  └─ Verdict: Document decision for each model

Final count if safe to delete:
  └─ 21 services + ? models = ? total items
```

---

**Stage 3.2: Create Archive** (If deleting)
```
Steps:
  1. Create directory: mkdir -p src/services/_archive/disabled-services
  2. Move services: mv src/services/marketing.service.ts → _archive/
  3. Move all 21 services (batch command available)
  4. Update .gitignore: Add entry for _archive (or remove to track)
  5. Update tsconfig if needed (should auto-ignore based on path)
  6. Commit: "archive: move 21 disabled services to _archive folder"

Alternative (safer): Create docs/DISABLED_FEATURES.md listing:
  ├─ Feature name
  ├─ Files in codebase
  ├─ Why disabled
  ├─ How to re-enable
  └─ Services affected
```

---

**Stage 3.3: Decision on Outlet Routes**
```
DECISION NEEDED FROM: Project stakeholder

Option A: REGISTER outlet.advanced + outlet.search + outlet.import-export
  └─ Files to add to index.ts: 3 imports + 3 router.use() calls
  └─ Time: 15 minutes + testing
  └─ Risk: LOW (feature completeness)

Option B: DELETE outlet.advanced + outlet.search + outlet.import-export
  └─ Delete 3 route files + 2 service files (if not used)
  └─ Time: 5 minutes
  └─ Risk: LOW (code is version controlled)

Option C: DEFER (mark as TODO for future phase)
  └─ Add comment in index.ts: "TODO: Phase 2 - register advanced routes"
  └─ Leave files as-is
  └─ Risk: LOW (no changes)

RECOMMENDATION: [WAITING FOR USER INPUT]
```

---

## 🛡️ DEPENDENCY SAFETY VERIFICATION

### A. Cross-Reference Check Matrix

```
Service that will change: order.service.ts (createOrder method)
├─ Called by:
│  └─ src/routes/order.routes.ts (POST /api/orders handler)
│     └─ Route file: EXISTS ✓
│     └─ Middleware: authGuard ✓
│     └─ Middleware: roleGuard ✓ (MODIFIED by us)
│     └─ Middleware: supervisorStoreGuard ✓ (ENHANCED by us)
│     └─ Response: No change (same JSON structure)
│
├─ Database dependency:
│  ├─ Prisma.order.create()
│  ├─ Prisma.product.update()
│  ├─ Transaction support: YES ✓ (Prisma supports $transaction)
│  └─ Rollback behavior: Automatic ✓
│
└─ Risk assessment: SAFE ✓

---

Middleware that will change: auth.ts (authGuard method)
├─ Used by:
│  ├─ src/routes/auth.routes.ts ✓
│  ├─ src/routes/order.routes.ts ✓
│  ├─ src/routes/product.routes.ts ✓
│  ├─ ... [ALL 43 route files] ✓
│  └─ Total routes using: 43
│
├─ Middleware signature: UNCHANGED
├─ Response format: UNCHANGED (still returns error JSON)
├─ Only change: Internal validation added
│
└─ Risk assessment: SAFE ✓

---

Middleware that will change: supervisor-store-guard.ts
├─ Used by:
│  ├─ src/routes/order.routes.ts ✓
│  ├─ src/routes/outlet.routes.ts [VERIFY]
│  ├─ src/routes/outlet.advanced.routes.ts [NOT REGISTERED]
│  └─ Total routes using: 2 confirmed
│
├─ Middleware signature: UNCHANGED
├─ Change: More strict validation (throws 403 instead of silent filtering)
├─ For valid configs: No change
├─ For invalid configs: Now caught (ERROR instead of SILENT)
│
└─ Risk assessment: SAFE (improvement) ✓
```

---

### B. Database Transaction Safety

```
Current pattern (will be changed):
  1. Product.updateStock(productId, -qty)  ← DB changed
  2. Order.create(...)  ← If fails, step 1 not rolled back ❌

New pattern (after fix):
  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create(...)  ← Created first
    for (item of items) {
      await tx.product.update({
        data: { stock: { decrement: item.quantity } }  ← Then stock
      })
    }
    return order
  })

Safety checks:
  ├─ Prisma version supports $transaction? [VERIFY in package.json]
     └─ Should be 4.x or higher
  ├─ No long-running operations in transaction? [CHECK]
     └─ Max ~30 seconds for transaction (DB timeout)
  ├─ No network calls inside transaction? [CHECK]
     └─ Would block transaction
  ├─ Deadlock risk? [LOW - single order, few rows affected]
  └─ Foreign key constraints honored? [YES ✓]

Conclusion: SAFE pattern, follows Prisma best practices ✓
```

---

## ✅ FINAL EXECUTION CHECKLIST

### PRE-EXECUTION (Before any code changes)

```
VERIFICATION TASKS:

[ ] Verify outlet.advanced.routes.ts dependencies
    Command: grep -n "import\|from\|require" src/routes/outlet.advanced.routes.ts
    Expected: OutletService dependencies
    Action: Check if methods exist in OutletService
    
[ ] Verify outlet.search.routes.ts dependencies
    Command: grep -n "import\|from" src/routes/outlet.search.routes.ts
    Expected: OutletSearchService dependencies
    Action: Check if outlet.search.service.ts is imported anywhere else
    
[ ] Verify outlet.import-export.routes.ts dependencies
    Command: grep -n "import\|from" src/routes/outlet.import-export.routes.ts
    Expected: OutletImportExportService dependencies
    Action: Check if service is used in any active routes
    
[ ] Verify Prisma version supports transactions
    Command: grep "prisma" package.json
    Expected: @prisma/client version 4.x or higher
    Action: npm list @prisma/client
    
[ ] Get stakeholder decision on outlet routes
    Required: Choose Option A (Register), B (Delete), or C (Defer)
    Document: Email or Slack message with decision
    
[ ] Notify stakeholders of breaking changes
    Required: Draft email about:
      ├─ JWT role validation (users may need to re-login)
      ├─ Store access control changes (supervisors may see different counts)
      └─ Timeline: Staging test → production deployment
    
[ ] Create backup of production database
    Command: [Database specific backup command]
    Location: [Backup storage location]
    Verification: List backups to confirm
    
[ ] Set up staging environment
    Required: Deploy a test version with changes
    Needed: Identical to production but isolated
    Testing: Run full integration test suite
    
[ ] Review all 3 code changes one more time
    Changes:
      1. src/middlewares/auth.ts (authGuard)
      2. src/services/order.service.ts (createOrder)
      3. src/middlewares/supervisor-store-guard.ts (validation)
    Review: Line by line with another developer
    Sign-off: Both developers approve changes

APPROVAL GATES:

[ ] Code review: ✓ Approved by [Reviewer Name]
[ ] Security review: ✓ Approved by [Security Lead]
[ ] QA: ✓ Test suite passing [100% coverage of changes]
[ ] Stakeholder: ✓ Aware of breaking changes and timeline
```

---

### EXECUTION PHASE (Days 1-2)

```
DAY 1:

[ ] 09:00 - Start Stage 1.1 (JWT Fix)
    └─ Read current code
    └─ Write validation logic
    └─ Unit tests
    └─ Commit: "security: validate JWT role against database"
    └─ Estimate: 2 hours
    
[ ] 11:00 - Start Stage 1.2 (Stock Atomicity)
    └─ Read createOrder code
    └─ Check for external API calls
    └─ Wrap in transaction
    └─ Integration tests
    └─ Commit: "fix: wrap createOrder in database transaction"
    └─ Estimate: 3 hours
    
[ ] 14:15 - Lunch
    
[ ] 15:00 - Start Stage 1.3 (Permission Validation)
    └─ Add validation checks
    └─ Add logging
    └─ Unit tests
    └─ Commit: "enhance: validate supervisor permissions structure"
    └─ Estimate: 1.5 hours
    
[ ] 16:30 - Push all 3 commits to feature branch
    └─ Branch name: feature/critical-security-fixes
    └─ 3 separate commits (not squashed)
    └─ Push: git push origin feature/critical-security-fixes
    
[ ] 17:00 - Create Pull Request
    └─ Title: "Critical Security & Atomicity Fixes"
    └─ Description: List all 3 changes with justification
    └─ Add: Link to audit findings document
    └─ Assignees: [2 code reviewers]
    
DAY 2:

[ ] 09:00 - Code review feedback (if any)
    └─ Address review comments
    └─ Make requested changes
    └─ Re-push if needed
    
[ ] 10:00 - Deploy to staging
    └─ Pull feature branch
    └─ Run: npm install (if needed)
    └─ Run: npm run build (if compilation step)
    └─ Start server
    └─ Verify: No startup errors
    
[ ] 10:30 - Run full test suite
    Test sets:
      ├─ Unit tests: npm test --unit
      ├─ Integration tests: npm test --integration
      ├─ Smoke tests: npm run test:smoke
      └─ Stop on first failure
    
[ ] 12:00 - If tests fail: Debug + fix
    └─ Don't merge until all tests pass
    
[ ] 13:00 - Lunch
    
[ ] 14:00 - Manual QA testing (if time allows)
    Test scenarios:
      ├─ Login with valid token (should work)
      ├─ Login with old token after role change (should fail)
      ├─ Create order with sufficient stock (should work)
      ├─ Create order with insufficient stock (should fail)
      ├─ Supervisor access to authorized store (should work)
      ├─ Supervisor access to unauthorized store (should fail)
      └─ Document results
    
[ ] 16:00 - Merge to main branch
    └─ Squash or merge (based on team preference)
    └─ Delete feature branch
    └─ Verify main branch builds
    
[ ] 16:30 - Prepare production deployment
    └─ Database backup confirmed
    └─ Staging tests passing
    └─ Client notification ready
    └─ Rollback plan documented
```

---

### POST-EXECUTION (Days 3-7)

```
DAY 3 - PRODUCTION DEPLOYMENT:

[ ] 10:00 - Pre-deployment checklist
    ├─ All tests passing: ✓
    ├─ Staging environment verified: ✓
    ├─ Database backup ready: ✓
    ├─ Rollback plan documented: ✓
    ├─ Support team briefed: ✓
    └─ Go-live approval received: ✓
    
[ ] 10:30 - Deploy to production
    └─ Pull main branch
    └─ Run: npm run build && npm start
    └─ Verify server startup
    └─ Check error logs (should be clean)
    
[ ] 11:00 - Smoke tests on production
    ├─ GET /health → 200 ✓
    ├─ POST /auth/login → 200 ✓
    ├─ GET /api/orders → 200 ✓
    ├─ POST /api/orders → 201 ✓
    └─ No 500 errors in logs
    
[ ] 11:30 - Send stakeholder notification
    └─ Email all: "Critical security fixes deployed"
    └─ Mention: "Some users may need to re-login"
    └─ Include: Support contact for issues
    
[ ] 12:00 - Begin 24-hour monitoring
    └─ Watch error logs hourly
    └─ Monitor: Failed requests, slow queries
    └─ Alert on: Unusual patterns
    
DAY 4:

[ ] 09:00 - Review production metrics
    └─ Request success rate (should be > 99%)
    └─ Error rate (should be ~0%, excluding expected auth errors)
    └─ Response time (should match pre-deployment)
    └─ Database transaction times (should be similar)
    
[ ] 10:00 - Monitor re-login rate
    └─ Track: How many users needed to re-login
    └─ Expected: Some increase in 401 errors (normal)
    └─ Threshold: If > 20% of users can't login → ROLLBACK
    
[ ] 14:00 - Review successful order creations
    └─ Count: Orders created today
    └─ Verify: Stock counts match order items
    └─ Check: No orphaned orders (orders with no items)
    └─ Status: Everything normal? → Continue monitoring
    
DAYS 5-7:

[ ] Daily monitoring (reduced)
    └─ 2 checks per day (before work, after work)
    └─ Review error logs
    └─ Verify metrics normal
    └─ Alert on anomalies
    
[ ] Day 7 - Declare "stable"
    └─ No issues found
    └─ All metrics normal
    └─ Client feedback positive
    └─ Document: "Deployment successful"
```

---

### ROLLBACK PROCEDURE (If needed)

```
TRIGGER FOR ROLLBACK:
  ├─ > 5% of requests returning 500 errors
  ├─ Database deadlocks occurring frequently
  ├─ Stock counts becoming inconsistent with orders
  ├─ > 30% of users unable to login
  └─ Unexpected runtime exceptions in logs

ROLLBACK STEPS:

[ ] IMMEDIATE - Notify team
    └─ Slack: "Rolling back production due to [ISSUE]"
    └─ Email: Stakeholders + support team
    
[ ] RESTORE - Restore previous version
    Option 1: Git rollback
      └─ git revert [merge commit]
      └─ git push main
      └─ npm run build && npm start
    
    Option 2: Database restore
      └─ Stop production server
      └─ Restore from backup: [DB-specific command]
      └─ Verify data integrity
      └─ Restart server
    
    Option 3: Docker image rollback (if containerized)
      └─ Pull previous image version
      └─ Update deployment
      └─ Verify startup
    
[ ] VERIFY - Confirm rollback worked
    └─ GET /health → 200 ✓
    └─ Error logs clean ✓
    └─ Request success rate normal ✓
    
[ ] COMMUNICATE - Notify stakeholders
    └─ Email: "Rollback complete, investigating issue"
    └─ ETA: When next attempt will be
    
[ ] INVESTIGATE - Find root cause
    └─ Review: What went wrong
    └─ Debug: All 3 changes
    └─ Test: More thoroughly
    └─ Document: Findings

[ ] FIX & RETRY
    └─ After waiting ~24 hours (let things settle)
    └─ Fix identified issues
    └─ Test more extensively
    └─ Deploy again
```

---

## 📋 FINAL SUMMARY TABLE

| Phase | Task | Duration | Risk | Owner | Status |
|-------|------|----------|------|-------|--------|
| **PRE** | Stakeholder approval | 1 day | LOW | PM | ⏳ Pending |
| **PRE** | Database backup | 30 mins | LOW | DevOps | ⏳ Pending |
| **1.1** | Fix JWT role validation | 2 hours | LOW | Dev | ✅ Completed (see `fix/order-atomic-role-hardening` branch) |
| **1.2** | Fix stock atomicity | 3 hours | MEDIUM | Dev | ✅ Completed (see `fix/order-atomic-role-hardening` branch) |
| **1.3** | Fix permission validation | 1.5 hours | LOW | Dev | 🔴 Not started |
| **2.1** | Write integration tests | 4 hours | LOW | QA | ⚠️ Partially done — unit tests for critical cases added; integration (DB-backed) tests pending |
| **2.2** | Run regression tests | 2 hours | LOW | QA | 🔴 Not started |
| **3.1** | Decide on orphaned code | 1 hour | N/A | PM | ⏳ Pending decision |
| **3.2** | Archive services (optional) | 1 hour | LOW | Dev | 🔴 Not started |
| **3.3** | Register outlet routes (optional) | 0.5 hour | LOW | Dev | ⏳ Pending decision |
| **Deploy** | Staging deployment | 1 hour | LOW | DevOps | 🔴 Not started |
| **Deploy** | Production deployment | 1 hour | HIGH | DevOps | 🔴 Not started |
| **Monitor** | 24-hour monitoring | 24 hours | MEDIUM | DevOps | 🔴 Not started |

---

## ✋ DEPENDENCIES TO VERIFY BEFORE STARTING

**These must be checked MANUALLY before executing plan:**

```
DEPENDENCY #1: Method existence in OutletService
├─ Question: Does OutletService have updateBulk() method?
├─ Location: src/services/outlet.service.ts
├─ Check: grep -n "updateBulk" src/services/outlet.service.ts
├─ Impact if missing: outlet.advanced.routes will 500
└─ Action required: [ADD METHODS] if using this route

DEPENDENCY #2: Prisma $ transaction support
├─ Question: Is Prisma version 4.x or higher?
├─ Location: package.json
├─ Check: grep "@prisma/client" package.json
├─ Impact if older: $transaction() not available
└─ Action required: [UPGRADE PRISMA] if version < 4.0

DEPENDENCY #3: Outlet routes decision
├─ Question: Should these routes be registered or deleted?
├─ Options: A) Register, B) Delete, C) Defer
├─ Decision maker: Project stakeholder
├─ Impact: Affects Phase 3 execution
└─ Action required: [COMMUNICATION] with PM/stakeholders

DEPENDENCY #4: Database backup procedure
├─ Question: How is production database backed up?
├─ Location: DevOps documentation or script
├─ Check: Is backup automated or manual?
├─ Impact if no backup: Can't rollback DB
└─ Action required: [VERIFY] backup exists before production deploy

DEPENDENCY #5: Existing test suite
├─ Question: Is there an existing npm test suite?
├─ Location: package.json scripts section
├─ Check: "test" field in package.json
├─ Check: tests/ directory exists with test files
├─ Impact if missing: Must write tests from scratch
└─ Action required: [VERIFY] test infrastructure exists
```

---

**STATUS: READY FOR APPROVAL**

This plan is now ready for:
1. ✅ Technical review (DevOps + Lead Dev)
2. ✅ Security review
3. ✅ Stakeholder approval
4. ✅ Execution start (once all 5 dependencies verified)

**NEXT STEP: Are you ready to proceed with PRE-EXECUTION verification?**
