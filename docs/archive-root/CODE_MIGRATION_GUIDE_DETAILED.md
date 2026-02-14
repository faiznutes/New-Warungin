# CODE COMPARISON & CLIENT MIGRATION GUIDE

**Tanggal:** 11 Februari 2026  
**Focus:** Side-by-side code, migration issues, testing scenarios  
**Audience:** Developers integrating with NEW version

---

## 1️⃣ ORDER ROUTE: OLD vs NEW COMPARISON

### A. Route Definition

**OLD Version (from BACKUP LAST):**
```typescript
// src/routes/order.routes.ts
router.get(
  '/',
  authGuard,
  subscriptionGuard,
  validate({ query: getOrdersQuerySchema }),
  async (req: AuthRequest, res: Response) => {
    try {
      const tenantId = requireTenantId(req);
      const result = await orderService.getOrders(tenantId, req.query as any);
      res.json(result);
    } catch (error) {
      handleRouteError(res, error, 'Failed to fetch orders', 'GET_ORDERS');
    }
  }
);
```

**NEW Version:**
```typescript
// src/routes/order.routes.ts
router.get(
  '/',
  authGuard,
  roleGuard('ADMIN_TENANT', 'SUPERVISOR', 'CASHIER', 'KITCHEN'),
  supervisorStoreGuard(),
  subscriptionGuard,
  validate({ query: getOrdersQuerySchema }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const userRole = req.user!.role;
    const userPermissions = req.user!.permissions;
    const result = await orderService.getOrders(tenantId, req.query as any, userRole, userPermissions);
    res.json(result);
  })
);
```

**Differences:**

| Aspect | OLD | NEW | Impact |
|--------|-----|-----|--------|
| **Middleware #1** | authGuard | authGuard | Same |
| **Middleware #2** | subscriptionGuard | roleGuard + supervisorStoreGuard + subscriptionGuard | ⚠️ MORE CHECKS |
| **Role Restriction** | None | ADMIN_TENANT, SUPERVISOR, CASHIER, KITCHEN only | 🔴 BREAKING |
| **Store Filtering** | None in middleware | supervisorStoreGuard | 🔴 BREAKING |
| **Service Parameters** | tenantId, query | tenantId, query, userRole, userPermissions | ⚠️ MORE DATA |
| **Error Handling** | try-catch + handleRouteError | asyncHandler wrapper | ✅ Better |

### B. Service Layer - getOrders()

**OLD Version (Simplified):**
```typescript
async getOrders(tenantId: string, query: GetOrdersQuery) {
  const { page, limit, status, customerId, outletId, ... } = query;
  const skip = (page - 1) * limit;
  
  const where: Prisma.OrderWhereInput = {
    tenantId,
    ...(status && { status }),
    ...(customerId && { customerId }),
    ...(outletId && { outletId }),  // ← Only filter if provided
    // ... other filters
  };
  
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      include: { items: true, customer: true, member: true, outlet: true }
    }),
    prisma.order.count({ where })
  ]);
  
  return { data: orders, pagination: { page, limit, total, totalPages } };
}
```

**NEW Version:**
```typescript
async getOrders(
  tenantId: string,
  query: GetOrdersQuery,
  userRole?: string,           // ← NEW PARAMETER
  userPermissions?: any        // ← NEW PARAMETER
) {
  const { page, limit, status, customerId, outletId, ... } = query;
  const skip = (page - 1) * limit;
  
  let outletFilter: any = outletId ? { outletId } : {};
  
  // ← NEW: ROLE-BASED FILTERING
  if ((userRole === 'CASHIER' || userRole === 'KITCHEN') && userPermissions?.assignedStoreId) {
    const assignedStoreId = userPermissions.assignedStoreId;
    outletFilter = { outletId: assignedStoreId };  // OVERRIDE
  }
  else if (userRole === 'SUPERVISOR' && userPermissions?.allowedStoreIds) {
    const allowedStoreIds = userPermissions.allowedStoreIds;
    if (allowedStoreIds.length > 0) {
      if (outletId) {
        if (!allowedStoreIds.includes(outletId)) {
          return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
        }
        outletFilter = { outletId };
      } else {
        outletFilter = { outletId: { in: allowedStoreIds } };
      }
    } else {
      return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
    }
  }
  
  // ← NEW: Also filter by sendToKitchen for KITCHEN role
  const where: Prisma.OrderWhereInput = {
    tenantId,
    ...(status && { status }),
    ...(customerId && { customerId }),
    ...outletFilter,  // ← STORE FILTER APPLIED
    ...(userRole === 'KITCHEN' && { sendToKitchen: true }),  // ← NEW
    // ... other filters
  };
  
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },  // ← DYNAMIC
      include: {
        items: { include: { product: true } },
        customer: true,
        member: true,
        outlet: true,
        storeShift: true,  // ← NEW
        user: { select: { id, name, email } }  // ← NEW
      }
    }),
    prisma.order.count({ where })
  ]);
  
  return { data: orders, pagination: { page, limit, total, totalPages } };
}
```

**Code Diff Summary:**
```diff
- async getOrders(tenantId: string, query: GetOrdersQuery) {
+ async getOrders(tenantId: string, query: GetOrdersQuery, userRole?: string, userPermissions?: any) {
    const { page, limit, status, customerId, outletId, ... } = query;
    const skip = (page - 1) * limit;
    
+   let outletFilter: any = outletId ? { outletId } : {};
+   
+   if ((userRole === 'CASHIER' || userRole === 'KITCHEN') && userPermissions?.assignedStoreId) {
+     outletFilter = { outletId: userPermissions.assignedStoreId };
+   }
+   else if (userRole === 'SUPERVISOR' && userPermissions?.allowedStoreIds) {
+     // Complex filtering logic (50+ lines)
+   }
    
    const where: Prisma.OrderWhereInput = {
      tenantId,
      ...(status && { status }),
      ...(customerId && { customerId }),
-     ...(outletId && { outletId }),
+     ...outletFilter,
+     ...(userRole === 'KITCHEN' && { sendToKitchen: true }),
    };
```

---

## 2️⃣ CLIENT MIGRATION SCENARIOS

### A. Scenario 1: Supervisor Client App (BREAKING)

**Old Behavior:**
```javascript
// Client code (v1.0)
const response = await fetch('/api/orders', {
  headers: { Authorization: `Bearer ${token}` }
});
const data = await response.json();
console.log(`Total orders: ${data.pagination.total}`);  // 250

if (data.pagination.total > 0) {
  // Dashboard shows: 250 orders
  // User can filter to any outlet
}
```

**NEW Behavior:**
```javascript
// Same code runs against NEW API
const response = await fetch('/api/orders', {
  headers: { Authorization: `Bearer ${token}` }
});
const data = await response.json();
console.log(`Total orders: ${data.pagination.total}`);  // 8 (not 250!)

if (data.pagination.total > 0) {
  // Dashboard shows: 8 orders (only from assigned stores)
  // User CANNOT filter to other outlets
  // ❌ UI shows less data → Supervisor confused
}
```

**Migration Steps for Supervisor Clients:**

```typescript
// 1. Accept changed behavior
//    Update expectations: Supervisors can only see assigned stores

// 2. Update dashboard queries
const response = await fetch('/api/orders', {
  headers: { Authorization: `Bearer ${token}` }
  // Don't assume 'total' is company-wide anymore
});

// 3. Show only assigned stores in filters
const allowedStores = req.user.permissions.allowedStoreIds;
const storeOptions = stores.filter(s => allowedStores.includes(s.id));

// 4. Update reports
// OLD: Total revenue = SUM of all orders
// NEW: Total revenue = SUM of my accessible orders
//      (Might be different from actual total)
```

### B. Scenario 2: Cashier Client App (BREAKING)

**Old Behavior:**
```javascript
// Cashier tries to view orders from multiple outlets
const response = await fetch('/api/orders?outletId=outlet-2', {
  headers: { Authorization: `Bearer ${token}` }
});
const data = await response.json();
console.log(data.data.length);  // 50 orders from outlet-2

// Cashier can see orders from assigned outlet AND other outlets
```

**NEW Behavior:**
```javascript
// Same code against NEW API
const response = await fetch('/api/orders?outletId=outlet-2', {
  headers: { Authorization: `Bearer ${token}` }
  // NOTE: User is assigned to outlet-1 only
});
const data = await response.json();
console.log(data.data.length);  // 0 (EMPTY! Not 50)

// ❌ Cashier sees no data even though they requested it
// ❌ No 403 error (silent filtering)
// ❌ App might show "No orders" instead of "Access denied"
```

**Why Silent Filtering (not error)?**
```typescript
// From order.service.ts, line 45:
if (outletId && !allowedStoreIds.includes(outletId)) {
  return {
    data: [],  // ← EMPTY, not error
    pagination: { page, limit, total: 0, totalPages: 0 }
  };
}

// Developer reasoning:
// - Prevents 403 errors for UI
// - Returns empty dataset instead
// - But confuses clients who don't know about the filter!
```

**Migration Steps for Cashier Clients:**

```typescript
// 1. Remove store selection UI
//    Cashiers can only see their assigned store

// 2. Hard-code assigned store ID
const assignedStoreId = req.user.permissions.assignedStoreId;
const response = await fetch(`/api/orders?storeId=${assignedStoreId}`, {
  headers: { Authorization: `Bearer ${token}` }
});

// 3. Update error handling
if (response.status === 200) {
  const data = response.json();
  if (data.data.length === 0) {
    // Could be: no orders, OR no access to requested store
    // Add logging to distinguish cases
  }
}

// 4. Test: Try accessing other stores
//    Expect: Empty result (not error)
```

### C. Scenario 3: Kitchen Staff Client App (BREAKING)

**Old Behavior:**
```javascript
// Kitchen staff sees all orders
const response = await fetch('/api/orders', {
  headers: { Authorization: `Bearer ${token}` }
});
const data = await response.json();
console.log(data.data.length);  // 150 orders from outlet-1

// Display ALL orders in kitchen display system
setOrders(data.data);
```

**NEW Behavior:**
```javascript
// Same code against NEW API
const response = await fetch('/api/orders', {
  headers: { Authorization: `Bearer ${token}` }
});
const data = await response.json();
console.log(data.data.length);  // 45 orders (only sendToKitchen=true)

// Display only kitchen orders
// ✓ This is actually GOOD behavior (less visual clutter)
// ✓ But might surprise kitchen staff seeing fewer orders
```

**Migration Steps for Kitchen Clients:**

```typescript
// 1. This is actually beneficial
//    Kitchen display now shows ONLY kitchen orders

// 2. Ensure sendToKitchen is set when creating orders
const response = await fetch('/api/orders', {
  method: 'POST',
  body: JSON.stringify({
    items: [...],
    sendToKitchen: true  // ← REQUIRED for kitchen to see
  })
});

// 3. Staff training
//    "Kitchen now auto-filters to show only your orders"
//    "Regular orders won't clutter the display anymore"
```

---

## 3️⃣ CRITICAL BUGS & SECURITY ISSUES

### A. Bug #1: Stock Decremented Before Order Saved

**Location:** orderService.createOrder() (lines 120-180)

```typescript
async createOrder(data: CreateOrderInput, userId: string, tenantId: string) {
  // ... validation ...
  
  // Step 1: For each item, DECREMENT stock
  for (const item of items) {
    await ProductService.updateStock(
      id: item.productId,
      quantity: -item.quantity,  // ← STOCK CHANGED
      operation: 'subtract'
    );
    // SQL: UPDATE products SET stock = stock - 10 WHERE id = ?
  }
  
  // Step 2: Create order
  try {
    const order = await prisma.order.create({
      data: {
        tenantId,
        userId,
        items: { create: [...] },
        total: calculateTotal(items),
        createdAt: new Date()
      }
    });
  } catch (error) {
    // ❌ IF ORDER CREATION FAILS:
    // Stock is ALREADY decremented (not rolled back)
    // Result: Stock count is wrong!
    throw error;
  }
  
  return order;
}
```

**Fix:**

```typescript
async createOrder(data: CreateOrderInput, userId: string, tenantId: string) {
  // Step 1: Use database transaction
  const order = await prisma.$transaction(async (tx) => {
    // Step 2: Create order FIRST (in transaction)
    const newOrder = await tx.order.create({
      data: {
        tenantId,
        userId,
        items: { create: [...] },
        total: calculateTotal(items),
        createdAt: new Date()
      }
    });
    
    // Step 3: THEN decrement stock (within same transaction)
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      });
    }
    
    return newOrder;
  });
  
  // Both succeed or both fail (atomic)
  return order;
}
```

### B. Security Issue #1: JWT Role vs Database Role

**Location:** authGuard middleware (auth.ts, lines 50-100)

```typescript
// Current code:
const decoded = jwt.verify(token, env.JWT_SECRET);
// decoded = { userId, tenantId, role: "SUPER_ADMIN" }

const user = await prisma.user.findUnique({
  where: { id: decoded.userId }
});
// user = { id, role: "CASHIER" }  // ← Different!

// Problem:
req.role = decoded.role;  // "SUPER_ADMIN" (from JWT)
// NOT: req.role = user.role = "CASHIER" (from DB)

// Attack scenario:
// 1. Attacker steals JWT token from previous session
// 2. User who had that token is now inactive/downgraded
// 3. Token still valid with old role
// 4. Attacker uses token with escalated privileges
```

**Fix:**

```typescript
const decoded = jwt.verify(token, env.JWT_SECRET);

const user = await prisma.user.findUnique({
  where: { id: decoded.userId }
});

// Validate: roles must match
if (decoded.role !== user.role) {
  logger.warn('Role mismatch', {
    userId: decoded.userId,
    jwtRole: decoded.role,
    dbRole: user.role
  });
  res.status(401).json({
    error: 'Unauthorized: Token invalid',
    message: 'User role has changed. Please login again.'
  });
  return;
}

req.role = user.role;  // Use database role (authoritative)
```

### C. Security Issue #2: Permission Validation Gap

**Location:** supervisorStoreGuard() (lines 62-80)

```typescript
// Current code:
const userPermissions = (req as unknown as UserWithPermissions).permissions || {};
const allowedStoreIds = (userPermissions as SupervisorPermissions).allowedStoreIds || [];

// Problem 1: Type casting without validation
(req as unknown as UserWithPermissions)
// ^ Assumes request has permissions, but doesn't validate

// Problem 2: Null/undefined handling
const allowedStoreIds = (userPermissions as SupervisorPermissions).allowedStoreIds || [];
// ^ If permissions is null or malformed, defaults to []
// This causes "access denied" but doesn't log suspicious activity

// Problem 3: No validation that allowedStoreIds actually exist
// If permissions contain "outlet-999" but outlet doesn't exist:
// Client gets silently denied but no error logged
```

**Fix:**

```typescript
if (req.role !== 'SUPERVISOR') {
  return next();
}

// Validate permissions exist
if (!req.user?.permissions || typeof req.user.permissions !== 'object') {
  logger.warn('Missing permissions for SUPERVISOR', {
    userId: req.userId,
    path: req.path
  });
  res.status(403).json({
    error: 'Access control misconfiguration',
    message: 'Your account is missing required permissions'
  });
  return;
}

const allowedStoreIds = Array.isArray(req.user.permissions.allowedStoreIds)
  ? req.user.permissions.allowedStoreIds
  : [];

if (allowedStoreIds.length === 0) {
  logger.warn('SUPERVISOR with no stores assigned', {
    userId: req.userId,
    path: req.path
  });
  res.status(403).json({
    error: 'Access denied',
    message: 'You have not been assigned any stores'
  });
  return;
}

// ... rest of validation
```

---

## 4️⃣ TESTING CHECKLIST

### A. Unit Tests Needed

```typescript
// Test: Supervisor can see assigned stores only
test('SUPERVISOR sees only authorized stores', async () => {
  const supervisor = {
    role: 'SUPERVISOR',
    permissions: { allowedStoreIds: ['outlet-1', 'outlet-2'] }
  };
  
  const result = await orderService.getOrders(
    'tenant-123',
    { page: 1, limit: 10 },
    'SUPERVISOR',
    supervisor.permissions
  );
  
  // All orders should be from outlet-1 or outlet-2
  for (const order of result.data) {
    expect(['outlet-1', 'outlet-2']).toContain(order.outletId);
  }
});

// Test: Supervisor denied access to unauthorized store
test('SUPERVISOR denied unauthorized store', async () => {
  const supervisor = {
    role: 'SUPERVISOR',
    permissions: { allowedStoreIds: ['outlet-1'] }
  };
  
  const result = await orderService.getOrders(
    'tenant-123',
    { page: 1, limit: 10, outletId: 'outlet-999' },  // Not authorized
    'SUPERVISOR',
    supervisor.permissions
  );
  
  expect(result.data).toEqual([]);
  expect(result.pagination.total).toBe(0);
});

// Test: CASHIER overrides outletId in request
test('CASHIER forced to assigned store', async () => {
  const cashier = {
    role: 'CASHIER',
    permissions: { assignedStoreId: 'outlet-1' }
  };
  
  const result = await orderService.getOrders(
    'tenant-123',
    { page: 1, limit: 10, outletId: 'outlet-2' },  // Requested different store
    'CASHIER',
    cashier.permissions
  );
  
  // All orders should be from outlet-1 (assigned), NOT outlet-2
  for (const order of result.data) {
    expect(order.outletId).toBe('outlet-1');
  }
});

// Test: Middleware #1 rejects invalid JWT
test('Invalid JWT rejected', async () => {
  const response = await request(app)
    .get('/api/orders')
    .set('Authorization', 'Bearer invalid.token.here');
  
  expect(response.status).toBe(401);
  expect(response.body.error).toContain('Invalid token');
});

// Test: supervisorStoreGuard prevents unauthorized store
test('supervisorStoreGuard blocks unauthorized store', async () => {
  const middleware = supervisorStoreGuard();
  
  const req = {
    role: 'SUPERVISOR',
    query: { storeId: 'outlet-999' },
    permissions: { allowedStoreIds: ['outlet-1', 'outlet-2'] }
  };
  
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
  
  const next = jest.fn();
  
  await middleware(req as any, res as any, next);
  
  expect(res.status).toHaveBeenCalledWith(403);
  expect(next).not.toHaveBeenCalled();
});
```

### B. Integration Tests

```typescript
// Test: End-to-end supervisor workflow
test('E2E: Supervisor retrieves orders', async () => {
  // 1. Login as supervisor
  const loginResp = await request(app)
    .post('/api/auth/login')
    .send({ email: 'supervisor@warungin.com', password: 'password' });
  
  const { token } = loginResp.body;
  
  // 2. Get orders
  const ordersResp = await request(app)
    .get('/api/orders')
    .set('Authorization', `Bearer ${token}`);
  
  expect(ordersResp.status).toBe(200);
  expect(ordersResp.body.data[0].outletId).toMatch(/outlet-[12]/);  // Only 1 or 2
});

// Test: Cashier blocked from unauthorized store
test('E2E: Cashier blocked from unauthorized store', async () => {
  const token = generateToken({ userId: 'cashier-1', role: 'CASHIER' });
  
  const response = await request(app)
    .get('/api/orders?outletId=outlet-2')  // Not assigned
    .set('Authorization', `Bearer ${token}`);
  
  expect(response.status).toBe(200);
  expect(response.body.data).toEqual([]);  // Silent filter
});
```

---

## 5️⃣ DEPLOYMENT CHECKLIST

```
Pre-Deployment:
  ☐ Backup production database
  ☐ Run full test suite
  ☐ Manual testing of each role (ADMIN, SUPERVISOR, CASHIER, KITCHEN)
  ☐ Verify outlet routes are NOT registered (if not needed)
  ☐ Check orphaned services won't cause import errors

Deployment:
  ☐ Deploy to staging environment first
  ☐ Run smoke tests against staging
  ☐ Verify Supervisor access works
  ☐ Verify Cashier access is restricted
  ☐ Monitor error logs for permission errors

Post-Deployment (Day 1):
  ☐ Notify clients of breaking changes
  ☐ Monitor dashboard for "0 orders" issues
  ☐ Check error logs for 403 Forbidden increases
  ☐ Verify cache invalidation works
  ☐ Monitor database query times

Client Communication:
  ☐ Email: "Breaking changes in API access control"
  ☐ Include: Migration guide for each role type
  ☐ Include: Code examples for adapted clients
  ☐ FAQ: "Why do I see fewer orders?", "Why are some stores blocked?"

Rollback Plan:
  ☐ If >5% request errors: Rollback
  ☐ Restore database from backup
  ☐ Run previous stable version
  ☐ Investigate root cause before re-deploying
```

---

## RINGKASAN: MIGRATION ROADMAP

| Step | Action | Timeline | Owner |
|------|--------|----------|-------|
| **1** | Review this document | Day 1 | Dev Team |
| **2** | Fix critical bugs (stock atomicity, JWT role) | Day 2-3 | Lead Dev |
| **3** | Write additional tests | Day 3-4 | QA Team |
| **4** | Deploy to staging | Day 4 | DevOps |
| **5** | Client testing (provide sandbox) | Day 5-6 | Clients |
| **6** | Notify clients of changes | Day 6 | Product/Support |
| **7** | Deploy to production | Day 7 | DevOps |
| **8** | Monitor + support | Day 7+ | 24/7 Support |

