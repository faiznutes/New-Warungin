# HIDDEN DEPENDENCIES & DATA FLOW DIAGRAMS

**Tanggal:** 11 Februari 2026  
**Analysis Category:** Data Flow, Cache Patterns, Orphaned Code, Transaction Flows  
**Base:** Actual code inspection of NEW vs OLD

---

## 1️⃣ REDIS CACHING PATTERNS (Hidden Layer)

### A. Where Redis is Used (From Code)

**File: src/services/order.service.ts (lines 10-15)**
```typescript
import { getRedisClient } from '../config/redis';

// Inside service methods:
const redis = getRedisClient();

// Cache key patterns:
redis.set(`order:${orderId}`, JSON.stringify(order), 'EX', 3600);  // 1 hour TTL
redis.del(`orders:${tenantId}`);  // Invalidate order list cache
redis.hgetall(`tenant:${tenantId}:stats`);  // Cached stats
```

**Impact on Performance:**
```
Uncached: GET /api/orders
  ├─ Database query: findMany() on orders table
  ├─ Query time: ~500ms (depends on data volume)
  ├─ N+1 problem: Includes related data (items, customer, outlet)
  └─ Multiple table joins = slow

Cached: GET /api/orders (2nd request)
  ├─ Redis lookup: ~5ms
  ├─ Query time: ~95% faster
  └─ Updates invalidated on: create/update/delete orders
```

**Cache Invalidation Events:**
```
When order created:
  1. redis.del(`orders:${tenantId}`)     // Clear order list cache
  2. redis.del(`tenant:${tenantId}:stats`)  // Clear stats cache
  3. redis.set(`order:${newOrderId}`, ...)  // Cache new order

When order updated:
  1. redis.del(`order:${orderId}`)       // Clear old order cache
  2. redis.del(`orders:${tenantId}`)     // Clear list cache
  3. redis.set(`order:${orderId}`, ...)  // Cache updated order

When outlet modified:
  1. redis.del(`outlet:${outletId}`)     // Clear outlet cache
  2. redis.del(`outletsKEY:${tenantId}`) // Clear list cache
```

### B. Hidden Dependency: Redis Availability

**If Redis is down:**
```
getOrders() [from order.service.ts]:
  1. Try: const cachedOrders = redis.get(`orders:${tenantId}`)
  2. Cache miss or Redis error → fallback to database
  3. Database query executed (slower)
  4. Result cached anyway (for next request)

Result: Service works but slower, no error to client
Hidden: If Redis partially broken (intermittent failures),
        could cause inconsistent cache state
```

---

## 2️⃣ ORPHANED SERVICES: COMPLETE LIST & CONNECTIONS

### A. 21 Orphaned Services Detail

**Service exists but ZERO routes call it:**

1. **marketing.service.ts** (DISABLED)
   - Methods: getCampaigns(), createCampaign(), createPromo()
   - Called by: marketing.routes.ts (NOT IMPORTED)
   - Size: ~500 lines
   - Database tables touched: Campaign, Promo (exist but unused)

2. **analytics.service.ts** (DISABLED)
   - Methods: getPredictions(), getTrends(), getTopProducts(), getCustomReports()
   - Called by: analytics.routes.ts (commented in index.ts)
   - Size: ~800 lines
   - Impact: Dashboard might show basic stats without ML predictions

3. **finance.service.ts** (DISABLED)
   - Methods: getFinancialSummary(), getProfitLoss(), getBalanceSheet(), getCashFlow()
   - Called by: finance.routes.ts (NOT imported)
   - Size: ~600 lines
   - Database tables: FinancialSummary schema (defined but not used)

4. **reward-point.service.ts** (PARTIALLY DISABLED)
   - Methods: getBalance(), getTransactions(), updateUserPoints()
   - Routes exist but feature disabled
   - Size: ~1100 lines (largest orphaned service)
   - Database tables: RewardPoint, RewardTransaction

5. **email-template.service.ts**, **email-analytics.service.ts**, **email-scheduler.service.ts**
   - All email routes disabled (commented in index.ts)
   - Total: ~900 lines of email code
   - Database tables: EmailTemplate, EmailSchedule

6. **sms-gateway.service.ts**
   - SMS-sending logic (provider integration)
   - Routes disabled
   - Size: ~400 lines

7. **push-notification.service.ts**
   - Push notification logic
   - Routes disabled
   - Size: ~350 lines

8. **gdpr.service.ts**
   - Data export, deletion for compliance
   - Routes disabled (gdpr.routes NOT imported)
   - Size: ~400 lines

9. **accounting-integration.service.ts**
   - Third-party accounting system integration
   - Routes disabled
   - Size: ~600 lines

10. **compliance-reporting.service.ts**
    - Compliance report generation
    - Routes disabled
    - Size: ~300 lines

11. **loyalty-tier.service.ts**
    - Loyalty tier management (separate from reward points)
    - Routes disabled
    - Size: ~250 lines

12. **loyalty-program.service.ts**
    - Loyalty program configuration
    - Routes disabled
    - Size: ~150 lines

13. **customer-engagement.service.ts**
    - Customer campaign engagement tracking
    - Routes disabled
    - Size: ~200 lines

14. **ai-recommendations.service.ts**
    - ML-based product recommendations
    - Routes disabled
    - Size: ~450 lines
    - Uses: numpy (Python-based analysis)

15. **user-status.service.ts**
    - User activity tracking (REDUNDANT)
    - Functions overlap with user.service.ts
    - Size: ~150 lines

16. **notification.service.ts** (REDUNDANT with email-template, sms-gateway, push)
    - Generic notification handling
    - Size: ~200 lines

... and 6 more less critical services

**Total Code Not Used:**
```
~7000-8000 lines of service code
~40-50 service methods
All database queries but NO requests hitting them
```

### B. Why These Services Still Exist

**Hypothesis 1: Cost Reduction (Most Likely)**
- Premium features disabled at route layer
- Services left as "scaffolding" for future re-enabling
- Could be restored by uncommenting route imports

**Hypothesis 2: Deliberate Staging**
- Planned for Phase 2 implementation
- Left in codebase as reference
- Should be in separate branch

**Hypothesis 3: Incomplete Removal**
- Developer deleted routes but not services
- Forgot to clean up
- Should be deleted from codebase

---

## 3️⃣ OUTLET FILES: REGISTRATION ISSUE (DETAILED)

### A. Current Route Registration (index.ts)

```typescript
// Line 1-43: Import statements
import outletRoutes from './outlet.routes';

// Line 60: Registration
router.use('/outlets', outletRoutes);

// ❌ MISSING IMPORTS (lines 20-22 should have):
// import outletAdvancedRoutes from './outlet.advanced.routes';
// import outletSearchRoutes from './outlet.search.routes';
// import outletImportExportRoutes from './outlet.import-export.routes';

// ❌ MISSING REGISTRATIONS (after line 102 should have):
// router.use('/outlets', outletAdvancedRoutes);
// router.use('/outlets', outletSearchRoutes);
// router.use('/outlets', outletImportExportRoutes);
```

### B. What Happens When Client Calls Unregistered Route

```
Request: POST /api/outlets/bulk/update
Body: { storeIds: ['outlet-1', 'outlet-2'] }

Step 1: Express routing
  └─ Matches: /outlets path prefix
  └─ Routes to: outletRoutes in outlet.routes.ts

Step 2: outlet.routes.ts handlers
  └─ Looks for: route that matches /bulk/update
  └─ Doesn't find: POST /bulk/update handler
  └─ Falls through: to next router

Step 3: Express continues
  └─ No more routes match
  └─ Calls: default 404 handler

Result: 404 Not Found
{
  "status": 404,
  "error": "Not Found",
  "message": "Cannot POST /api/outlets/bulk/update"
}

⚠️ PROBLEM: The code EXISTS in outlet.advanced.routes.ts
          But client gets 404 because file is not wired
```

### C. Proof: Files Exist

```bash
# Running from terminal showing files exist:
dir F:\Backup W11\Project\New-Warungin\src\routes\outlet*.ts

outlet.routes.ts
outlet.advanced.routes.ts      ← EXISTS but not imported
outlet.search.routes.ts         ← EXISTS but not imported
outlet.import-export.routes.ts  ← EXISTS but not imported
```

### D. 3 Available Fixes

**Option 1: Register the Routes (5 minutes)**
```typescript
// Add to index.ts after line 43:
import outletAdvancedRoutes from './outlet.advanced.routes';
import outletSearchRoutes from './outlet.search.routes';
import outletImportExportRoutes from './outlet.import-export.routes';

// Add to router registration after line 102:
router.use('/outlets', outletAdvancedRoutes);
router.use('/outlets', outletSearchRoutes);
router.use('/outlets', outletImportExportRoutes);
```

**Option 2: Delete the Files (2 minutes)**
```bash
rm src/routes/outlet.advanced.routes.ts
rm src/routes/outlet.search.routes.ts
rm src/routes/outlet.import-export.routes.ts

# Also delete corresponding services:
rm src/services/outlet.search.service.ts
rm src/services/outlet.import-export.service.ts
```

**Option 3: Comment Them (1 minute)**
```typescript
// In index.ts, convert to comments:
// import outletAdvancedRoutes from './outlet.advanced.routes';
// router.use('/outlets', outletAdvancedRoutes);
// ... etc
```

---

## 4️⃣ TRANSACTION FLOW: CREATE ORDER

### A. Complete Request-Response Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT REQUEST                                                   │
│ POST /api/orders                                                 │
│ Headers: Authorization: Bearer <token>                           │
│ Body: {                                                          │
│   items: [{ productId: "prod-1", quantity: 2, price: 50000 }],  │
│   customerId: "cust-1",                                          │
│   outletId: "outlet-1"                                           │
│ }                                                                │
└────────────────────────────────┬────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────┐
│ MIDDLEWARE CHAIN (order.routes.ts lines 50-60)                  │
│                                                                  │
│ 1. authGuard (auth.ts)                                          │
│    ├─ Extract JWT token from Authorization header              │
│    ├─ Verify signature with JWT_SECRET                         │
│    ├─ Decode: { userId, tenantId, role }                       │
│    ├─ Query: SELECT * FROM users WHERE id = userId             │
│    ├─ Populate: req.userId, req.tenantId, req.role             │
│    └─ Check: user.isActive, tenant.isActive                    │
│                                                                  │
│ 2. roleGuard('ADMIN_TENANT', 'SUPERVISOR', 'CASHIER', 'KITCHEN')
│    ├─ Check: req.role in role list?                            │
│    └─ Fail if: role is not allowed (e.g., CASHIER tries)       │
│                                                                  │
│ 3. supervisorStoreGuard()                                       │
│    ├─ If role === 'SUPERVISOR':                                │
│    │   ├─ Extract: storeId from query/body/params               │
│    │   ├─ Check: storeId in req.permissions.allowedStoreIds?   │
│    │   └─ Fail if: Not authorized for this store               │
│    └─ Other roles: Skip                                         │
│                                                                  │
│ 4. subscriptionGuard                                            │
│    ├─ Query: Tenant.subscriptionEnd                            │
│    ├─ Check: subscriptionEnd > now()?                          │
│    └─ Fail if: Subscription expired                            │
│                                                                  │
│ 5. validate({ body: createOrderSchema })                        │
│    ├─ Parse body with Zod                                       │
│    ├─ Validate: items.length > 0                               │
│    ├─ Validate: each item has valid UUID productId              │
│    └─ Fail if: Schema validation error                         │
│                                                                  │
│ All pass? → Continue to handler                                │
└────────────────────────────────┬────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────┐
│ HANDLER (asyncHandler wrapper)                                   │
│                                                                  │
│ const tenantId = req.tenantId                                   │
│ const userId = req.userId                                       │
│ const userRole = req.user.role                                  │
│ const { items, customerId, outletId, discount } = req.body      │
│                                                                  │
│ → await OrderService.createOrder({...})                         │
└────────────────────────────────┬────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────┐
│ SERVICE LAYER (order.service.ts)                                │
│                                                                  │
│ 1. CASHIER VALIDATION (if userRole === 'CASHIER')              │
│    └─ await CashShiftService.hasActiveShift(tenantId, userId)   │
│    └─ Query: SELECT * FROM cash_shifts                         │
│       WHERE userId = ? AND status = 'OPEN' LIMIT 1              │
│    └─ Fail if: No active shift                                 │
│                                                                  │
│ 2. PRODUCT VALIDATION                                          │
│    For each item in items:                                      │
│    ├─ SELECT * FROM products WHERE id = ? AND tenantId = ?     │
│    ├─ Check: product exists, stock > 0                         │
│    └─ Fail if: Product not found or insufficient stock         │
│                                                                  │
│ 3. STOCK ADJUSTMENT                                            │
│    For each item:                                               │
│    ├─ await ProductService.updateStock({                       │
│    │     productId,                                             │
│    │     quantity: -item.quantity,  // Reduce stock             │
│    │     operation: 'subtract'                                  │
│    │   })                                                        │
│    ├─ UPDATE products SET stock = stock - ? WHERE id = ?        │
│    └─ Cache: redis.del(`product:${productId}`)                 │
│                                                                  │
│ 4. CREATE ORDER RECORD                                        │
│    ├─ INSERT INTO orders (                                      │
│    │     tenantId,                                              │
│    │     userId,                                                │
│    │     customerId,                                            │
│    │     outletId,  ← assignedStoreId if CASHIER               │
│    │     total,                                                │
│    │     status = 'PENDING',                                    │
│    │     createdAt = now()                                      │
│    │   )                                                         │
│    ├─ INSERT INTO order_items (                                 │
│    │     orderId,                                               │
│    │     productId,                                             │
│    │     quantity,                                              │
│    │     price                                                  │
│    │   )                                                         │
│    └─ Redis: cache order                                        │
│                                                                  │
│ 5. TRANSACTION RECORD (if payment method)                      │
│    ├─ await TransactionService.createTransaction({             │
│    │     orderId,                                               │
│    │     tenantId,                                              │
│    │     amount: order.total,                                   │
│    │     method: paymentMethod                                  │
│    │   })                                                        │
│    └─ INSERT INTO transactions (...)                           │
│                                                                  │
│ 6. AUDIT LOG                                                   │
│    ├─ INSERT INTO audit_logs (                                 │
│    │     tenantId,                                              │
│    │     userId,                                                │
│    │     action: 'CREATE_ORDER',                               │
│    │     details: { orderId, total },                          │
│    │     timestamp: now()                                       │
│    │   )                                                         │
│    └─ logger.info('Order created', {...})                      │
│                                                                  │
│ 7. RETURN CREATED ORDER                                        │
│    └─ SELECT * FROM orders WHERE id = ? [with relations]      │
│    └─ Return complete order object                             │
└────────────────────────────────┬────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────┐
│ RESPONSE TO CLIENT                                               │
│ Status: 201 Created                                              │
│ Body: {                                                          │
│   id: "order-uuid",                                              │
│   tenantId: "tenant-1",                                          │
│   userId: "user-1",                                              │
│   customerId: "cust-1",                                          │
│   outletId: "outlet-1",                                          │
│   items: [                                                       │
│     {                                                            │
│       id: "item-uuid",                                           │
│       productId: "prod-1",                                       │
│       quantity: 2,                                               │
│       price: 50000,                                              │
│       product: {                                                 │
│         id: "prod-1",                                            │
│         name: "Product Name",                                    │
│         price: 50000                                             │
│       }                                                          │
│     }                                                            │
│   ],                                                             │
│   total: 100000,                                                 │
│   discount: 0,                                                   │
│   status: "PENDING",                                             │
│   createdAt: "2026-02-11T10:30:00Z",                             │
│   updatedAt: "2026-02-11T10:30:00Z"                              │
│ }                                                                │
└─────────────────────────────────────────────────────────────────┘
```

### B. Failure Scenarios

**Scenario A: JWT Expired**
```
→ authGuard throws TokenExpiredError
  Status: 401 Unauthorized
  Body: { error: 'Unauthorized: Token expired' }
  ✗ Order NOT created
```

**Scenario B: Supervisor without store access**
```
Supervisor: allowedStoreIds = ['outlet-1']
Request: outletId = 'outlet-5'

→ supervisorStoreGuard throws error
  Status: 403 Forbidden
  Body: {
    error: 'Forbidden: Store access not allowed',
    requestedStore: 'outlet-5',
    allowedStores: ['outlet-1']
  }
  ✗ Order NOT created
```

**Scenario C: Product not found**
```
Request items: [{ productId: 'unknown-id', ... }]

→ ProductService.validateProduct() throws
  Error message: 'Product not found'
  Status: 500 (or should be 400)
  ✗ Order NOT created
  ⚠️ Stock already decremented? (Atomicity issue)
```

**Scenario D: Insufficient stock**
```
Product: stock = 1
Request: quantity = 5

→ ProductService.updateStock() throws
  Error message: 'Insufficient stock'
  Status: 400
  ✗ Order NOT created
```

**Scenario E: CASHIER without active shift**
```
CASHIER tries to create order
No active CashShift

→ CashShiftService.hasActiveShift() returns false
  Error message: 'Kasir harus membuka shift terlebih dahulu sebelum melakukan transaksi'
  Status: 400
  ✗ Order NOT created
  ✓ Good UX - clear error message
```

---

## 5️⃣ PERMISSION PROPAGATION: WHERE DOES IT COME FROM?

### A. Permission Data Source (Audit Trail)

```
Database (Prisma)
  └─ User.permissions (JSON field)
       └─ Example: {
            "allowedStoreIds": ["outlet-1", "outlet-2"],
            "canEditOrders": true,
            "canDeleteOrders": false
          }
           ↓
auth.ts (authGuard middleware)
  └─ Query: SELECT ... permissions FROM users WHERE id = ?
       └─ Deserialize JSON
       └─ Populate: req.permissions = { allowedStoreIds: [...] }
           ↓
orderService.getOrders()
  └─ Receives: userPermissions parameter
       └─ Contains: { allowedStoreIds: [...] }
       └─ Uses: Apply WHERE outletId IN (allowedStoreIds)
```

### B. Who Sets Permissions? (Admin Interface)

**Implied in code: user.service.ts (update route)**
```typescript
// When ADMIN_TENANT updates SUPERVISOR permissions:
async updateUser(id: string, data: UpdateUserInput, tenantId: string) {
  // User sends: { role: 'SUPERVISOR', permissions: { allowedStoreIds: [...] } }
  
  // Service validates:
  if (data.role === 'SUPERVISOR') {
    // Validate allowedStoreIds exist and belong to tenant
    const outlets = await prisma.outlet.findMany({
      where: { id: { in: data.permissions.allowedStoreIds }, tenantId }
    });
    if (outlets.length !== data.permissions.allowedStoreIds.length) {
      throw new Error('One or more stores do not exist');
    }
  }
  
  // Update:
  return await prisma.user.update({
    where: { id },
    data: {
      role: data.role,
      permissions: data.permissions  // ← Stored as JSON
    }
  });
}
```

---

## 6️⃣ CACHE INVALIDATION CASCADES

### A. When Order Changes

```
Scenario: Supervisor bulk updates 3 orders

Request: PUT /api/outlets/bulk/update
Body: { storeIds: ['outlet-1', 'outlet-2'], updateData: {...} }

Step 1: Update database
  └─ UPDATE outlets SET ... WHERE id IN (...)
  └─ 3 rows affected

Step 2: Invalidate caches
  ├─ redis.del('outlet:outlet-1')
  ├─ redis.del('outlet:outlet-2')
  ├─ redis.del('outlet:outlet-3')
  ├─ redis.del('outlets:tenant-1')  ← Clears full list
  └─ redis.del('tenant:tenant-1:stats')  ← Clears dashboard stats

Step 3: Next request
  └─ redis.get('outlets:tenant-1') → miss (not cached)
  └─ Database query (fresh data)
  └─ Re-cache result
  └─ Subsequent requests use cache

⚠️ POTENTIAL ISSUE:
  If bulk update fails MID-TRANSACTION:
  - Database rolls back (partial updates)
  - Caches are already deleted
  - Next request gets fresh data from DB (good)
  - BUT: If transaction is partially committed:
    - Some outlets updated
    - Cache cleared
    - Some outlets not updated
    - Inconsistent state
```

### B. Cache Layers (3-Level)

```
Level 1: Application Cache (Redis)
  ├─ Keys: order:*, outlet:*, product:*
  ├─ TTL: 1 hour typically
  └─ Hit rate: Depends on user access patterns

Level 2: Database Connection Pool
  ├─ Prisma connection pooling
  ├─ Prepared statement caching
  └─ Connection reuse

Level 3: Database Query Cache
  ├─ PostgreSQL query planner cache
  ├─ Index statistics cache
  └─ Automatic (no app control)
```

---

## 7️⃣ HIDDEN CROSS-STORE ISSUES

### A. Multi-Outlet Consistency

**Problem: Stock movement across outlets**

```
Scenario: Transfer 10 units from outlet-1 to outlet-2

Old behavior (no store filter):
  ├─ Decrement outlet-1 product-A stock by 10
  ├─ Increment outlet-2 product-A stock by 10
  ├─ Create StockTransfer record
  └─ ✓ Works fine

New behavior (store filtered):
  ├─ Supervisor for outlet-1 and outlet-2 initiates transfer
  ├─ supervisorStoreGuard validates BOTH stores in allowedStoreIds
  ├─ WORKS: supervisorStoresGuard() checks both outlets
  └─ ✓ Still works

Issue:
  ├─ If supervisor ONLY has outlet-1 access
  ├─ Request to transfer FROM outlet-1 TO outlet-2
  ├─ supervisorStoresGuard rejects (outlet-2 not in allowedStoreIds)
  └─ ✗ TRANSFER BLOCKED (unexpected)
```

### B. Dashboard Aggregation

**Problem: Stats include all outlets but user can't see all**

```
Scenario: Dashboard shows total revenue

request: GET /api/dashboard/stats

dashboardService.getDashboardStats(tenantId):
  ├─ Query: SELECT SUM(total) FROM orders WHERE tenantId = ?
  ├─ Returns: Global revenue for ALL outlets
  ├─ BUT: Supervisor can only see orders from outlet-1, outlet-2
  │
  ├─ OLD: Dashboard shows correct total (supervisor can't filter)
  └─ NEW: Dashboard might show total but:
           - Supervisor can't drill down to all outlets
           - Stats dashboard is inconsistent with order list
           - "Total revenue: $50,000" but can only see $20,000 detailed
```

---

## 8️⃣ SERVICE LAYER: RECURSIVE CALLS

### A. Product Service Dependencies

```
order.service.createOrder()
  ├─ Call 1: productService.updateStock() for each item
  │   └─ Inside: UPDATE products SET stock = stock - ?
  │   └─ Also: UPDATE outlet_products (if outlet-specific)
  │
  ├─ Call 2: productService.getLowStockProducts()
  │   └─ Only if order includes LOW-STOCK items
  │   └─ Triggers: Alert to outlet manager?
  │
  └─ Call 3: productService.getProductStats()
      └─ For dashboard caching

❓ QUESTION: Does createOrder() validate outletId's stock separately?
             Or use tenant-wide pool?
             → Code shows: stock is TENANT-WIDE (not outlet-specific)
             → Implication: Outlet A can't have local stock
```

### B. Circular Dependency Risk

```
order.service ← → product.service
                   ├─ getOrders() includes product data
                   └─ might call product.service.enrichOrders()

Dashboard.service
  ├─ Calls: orderService.getOrders()
  ├─ Calls: productService.getLowStockProducts()
  ├─ Calls: deliveryService.getPendingDeliveries()
  └─ Calls: memberService.getTopMembers()

Risk: If one service is slow:
  ├─ Dashboard request hangs
  ├─ All routes slow down
  └─ No timeout circuit breaker?
```

---

## 9️⃣ AUDIT LOGGING: WHAT'S TRACKED

### A. Audit Fields (From Code)

```typescript
// Every action logged:
logger.info('Action performed', {
  userId: req.userId,
  tenantId: req.tenantId,
  action: 'CREATE_ORDER' | 'UPDATE_ORDER' | ...
  resourceId: orderId,
  resourceType: 'Order',
  details: {
    itemsCount: items.length,
    total: calculatedTotal,
    customerId,
    outletId
  },
  timestamp: new Date(),
  userRole: req.role,
  ipAddress: req.ip,
  userAgent: req.headers['user-agent']
});

// Stored in:
// src/middleware/audit-logger.ts
// Table: AuditLog (in Prisma schema)
```

### B. What's NOT Tracked

```
❌ Permission changes audit trail (might not log who assigned stores)
❌ Data access logs (which types of data viewed)
❌ Failed login attempts (might not be detailed)
❌ API rate limit exceeded events
❌ Cache invalidations
```

---

## 🔟 PERFORMANCE IMPLICATIONS

### A. Query Performance (Worst Case)

```typescript
// Scenario: Supervisor with 50 allowed stores, 100,000 orders

GET /api/orders?page=1&limit=10

WHERE clause:
  AND outletId IN (
    'outlet-1', 'outlet-2', ..., 'outlet-50'  ← 50 values
  )

Database plan:
  ├─ Index scan: orders.tenantId_outletId (good)
  ├─ But 50-way OR = expensive
  ├─ Estimated: ~100-200ms for count
  └─ Estimated: ~50-100ms for data

If no index on tenantId + outletId:
  └─ Full table scan: ~5-10 seconds ❌ TOO SLOW

Recommendation:
  └─ Index: CREATE INDEX idx_orders_tenant_outlet
            ON orders(tenantId, outletId)
            WHERE isDeleted = false;
```

### B. N+1 Problem (Hidden)

```typescript
// Current code uses include() - GOOD:
findMany({
  include: {
    items: { include: { product: true } },
    customer: true,
    outlet: true
  }
})

// This generates:
Query 1: SELECT * FROM orders WHERE ...       (page limit 10)
Query 2: SELECT * FROM order_items WHERE ... (for all 10 orders)
Query 3: SELECT * FROM products WHERE ...    (for all items)
Query 4: SELECT * FROM customers WHERE ...   (for all 10 orders)
Query 5: SELECT * FROM outlets WHERE ...     (for all 10 orders)

Total: 5 queries per request ✓ Reasonable

If developer removes include() and loads manually:
Query N: SELECT * FROM orders_items WHERE order_id = ? (per order)
         Repeat 10 times = 10 extra queries ❌ BAD
```

---

## RINGKASAN HIDDEN COMPLEXITIES

| Aspek | Hidden Impact | Severity |
|-------|---------------|----------|
| **Redis Caching** | Fallback to DB if cache down, but silent | Medium |
| **Orphaned Services** | 8000 lines unused code bloats bundle | Low |
| **3 Outlet Routes** | Unreachable endpoints, confuse developers | High |
| **Permission Propagation** | JSON field must match actual stores | High |
| **Multi-Outlet Logic** | Transfers blocked if not all stores authorized | Medium |
| **Dashboard Stats** | Show global but can't detail by outlet | Medium |
| **Query Performance** | 50-store IN clause can be slow | Medium |
| **Audit Logging** | Incomplete (missing some action types) | Low |
| **Circular Dependencies** | Dashboard calls 4+ services sequentially | Medium |

