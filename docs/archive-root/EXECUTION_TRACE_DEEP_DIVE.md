# EXECUTION TRACE & BEHAVIORAL ANALYSIS

**Tanggal:** 11 Februari 2026  
**Level:** ULTRA-DEEP (Line-by-line execution paths)  
**Format:** ASCII Sequence Diagrams + Code Snippets + Decision Trees

---

## 1️⃣ EXACT EXECUTION TRACE: GET /api/orders (SUPERVISOR)

### A. Complete Request-Response Sequence (Step-by-Step)

```
┌─────────────────────────────────────────────────────────────────┐
│ T=0ms: CLIENT                                                   │
│ POST /api/orders                                                │
│ Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  │
│ Body: { items: [{ productId: "prod-123", quantity: 2, ... }] }│
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTP Request
                       ↓
┌──────────────────────────────────────────────────────────────────┐
│ T=5ms: EXPRESS ROUTER MATCHING                                  │
│                                                                  │
│ url: /api/orders                                                │
│ method: POST                                                     │
│ Match checks:                                                    │
│   ✓ /api path exists                                            │
│   ✓ /orders path exists                                         │
│   ✓ POST method handler exists                                 │
│ Result: ROUTE FOUND                                             │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓
┌──────────────────────────────────────────────────────────────────┐
│ T=10ms: MIDDLEWARE #1 - authGuard (src/middlewares/auth.ts)     │
│                                                                  │
│ Code (line ~50):                                                 │
│   const authHeader = req.headers.authorization;                 │
│   if (!authHeader || !authHeader.startsWith('Bearer ')) {       │
│     res.status(401).json({ error: 'No token' });               │
│     return;  // ← IF FAILS, STOPS HERE                          │
│   }                                                              │
│                                                                  │
│ State BEFORE:                                                    │
│   req.headers.authorization = "Bearer eyJ..."                   │
│                                                                  │
│ Action:                                                          │
│   token = authHeader.split(' ')[1]                              │
│   token = "eyJ..."                                              │
│                                                                  │
│ Code (line ~60):                                                 │
│   const decoded = jwt.verify(token, env.JWT_SECRET)             │
│   // If error: res.status(401), return                          │
│   // If ok: decoded = { userId: "user-123", tenantId: "...",   │
│   //                    role: "SUPERVISOR" }                     │
│                                                                  │
│ Database Query (line ~73):                                       │
│   const user = await prisma.user.findUnique({                   │
│     where: { id: decoded.userId },       // "user-123"          │
│     include: { tenant: true }                                   │
│   });                                                            │
│   // SQL: SELECT * FROM users WHERE id = $1                    │
│   // PARAMS: ["user-123"]                                      │
│   // RESULT: {                                                  │
│   //   id: "user-123",                                          │
│   //   email: "supervisor@warungin.com",                        │
│   //   role: "SUPERVISOR",                                      │
│   //   permissions: {                                           │
│   //     allowedStoreIds: ["outlet-1", "outlet-2"]              │
│   //   },                                                        │
│   //   isActive: true,                                          │
│   //   tenant: {                                                │
│   //     id: "tenant-123",                                      │
│   //     isActive: true                                         │
│   //   }                                                         │
│   // }                                                           │
│                                                                  │
│ Validations (lines 100-150):                                    │
│   ✓ user exists? YES                                            │
│   ✓ user.isActive? YES                                          │
│   ✓ tenant exists (for non-SUPER_ADMIN)? YES                   │
│   ✓ tenant.isActive? YES                                        │
│                                                                  │
│ For SUPERVISOR role (lines 165-180):                            │
│   ├─ const permissions = user.permissions                       │
│   ├─ const allowedStoreIds = permissions.allowedStoreIds        │
│   ├─ Database Query:                                            │
│   │   SELECT * FROM outlets                                     │
│   │   WHERE id IN ($1, $2) AND tenantId = $3                   │
│   │   PARAMS: ["outlet-1", "outlet-2", "tenant-123"]           │
│   │   RESULT: 2 rows (both outlets, both isActive = true)       │
│   │                                                              │
│   └─ All checks pass                                            │
│                                                                  │
│ State AFTER (req object modified):                              │
│   req.userId = "user-123"                                       │
│   req.tenantId = "tenant-123"                                   │
│   req.role = "SUPERVISOR"                                       │
│   req.user = {                                                  │
│     id: "user-123",                                             │
│     tenantId: "tenant-123",                                     │
│     role: "SUPERVISOR",                                         │
│     email: "supervisor@warungin.com",                           │
│     permissions: { allowedStoreIds: ["outlet-1", "outlet-2"] }  │
│   }                                                              │
│                                                                  │
│ Result: PASS → next()                                           │
└──────────────────────┬──────────────────────────────────────────┘
                       │ T=50ms
                       ↓
┌──────────────────────────────────────────────────────────────────┐
│ T=55ms: MIDDLEWARE #2 - roleGuard (src/middlewares/auth.ts)     │
│                                                                  │
│ Code (line ~200):                                                │
│   export const roleGuard = (...roles: string[]) => {            │
│     return (req, res, next) => {                                │
│       if (!req.role || !roles.includes(req.role)) {             │
│         res.status(403).json({ error: 'Forbidden' });           │
│         return;                                                  │
│       }                                                          │
│       next();                                                    │
│     };                                                           │
│   };                                                             │
│                                                                  │
│ Called as:                                                       │
│   roleGuard('ADMIN_TENANT', 'SUPERVISOR', 'CASHIER', 'KITCHEN') │
│                                                                  │
│ Check:                                                           │
│   req.role = "SUPERVISOR"                                       │
│   allowed roles = ["ADMIN_TENANT", "SUPERVISOR", "CASHIER",    │
│                    "KITCHEN"]                                    │
│   "SUPERVISOR" in list? YES ✓                                   │
│                                                                  │
│ Result: PASS → next()                                           │
└──────────────────────┬──────────────────────────────────────────┘
                       │ T=60ms
                       ↓
┌──────────────────────────────────────────────────────────────────┐
│ T=65ms: MIDDLEWARE #3 - supervisorStoreGuard()                  │
│         (src/middlewares/supervisor-store-guard.ts, lines 25-95)│
│                                                                  │
│ Code (line 28):                                                  │
│   if (req.role !== 'SUPERVISOR') {                              │
│     return next();  // SKIP for other roles                     │
│   }                                                              │
│                                                                  │
│ Check: req.role === 'SUPERVISOR'? YES                           │
│ → Continue processing                                            │
│                                                                  │
│ Extract storeId (lines 35-60):                                  │
│   Priority 1: req.query.storeId                                 │
│   Priority 2: req.body.storeId                                  │
│   Priority 3: req.params.storeId                                │
│                                                                  │
│ Current request: GET /api/orders (no storeId in request)        │
│   req.query.storeId = undefined                                 │
│   req.body = {} (GET request = no body)                         │
│   req.params = {} (no URL params)                               │
│   storeId = null                                                │
│                                                                  │
│ Code (line 62):                                                  │
│   if (!storeId) {                                               │
│     return next();  // No store filtering needed                │
│   }                                                              │
│                                                                  │
│ → SKIP store validation, continue to next middleware            │
│                                                                  │
│ Result: PASS → next()                                           │
└──────────────────────┬──────────────────────────────────────────┘
                       │ T=70ms
                       ↓
┌──────────────────────────────────────────────────────────────────┐
│ T=75ms: MIDDLEWARE #4 - subscriptionGuard                        │
│         (src/middlewares/subscription-guard.ts)                  │
│                                                                  │
│ Code:                                                            │
│   const tenant = await Subscription.findFirst({                 │
│     where: { tenantId: req.tenantId }                           │
│   });                                                            │
│                                                                  │
│ Database Query:                                                  │
│   SELECT * FROM subscriptions                                   │
│   WHERE tenantId = $1 AND status = 'ACTIVE'                    │
│   LIMIT 1                                                       │
│   PARAMS: ["tenant-123"]                                        │
│   RESULT: {                                                      │
│     id: "sub-123",                                              │
│     tenantId: "tenant-123",                                     │
│     plan: "PRO",                                                │
│     subscriptionEnd: "2026-12-31T23:59:59Z",                   │
│     isActive: true                                              │
│   }                                                              │
│                                                                  │
│ Checks:                                                          │
│   ✓ subscription exists? YES                                    │
│   ✓ subscriptionEnd > now()? YES (2026-12-31 > 2026-02-11)     │
│   ✓ isActive = true? YES                                        │
│                                                                  │
│ Result: PASS → next()                                           │
└──────────────────────┬──────────────────────────────────────────┘
                       │ T=90ms
                       ↓
┌──────────────────────────────────────────────────────────────────┐
│ T=95ms: MIDDLEWARE #5 - validate (Zod schema)                   │
│         (src/middlewares/validator.ts)                           │
│                                                                  │
│ Schema:                                                          │
│   getOrdersQuerySchema.parseAsync(req.query)                    │
│                                                                  │
│ Input data:                                                      │
│   req.query = { page: "1", limit: "10" }                        │
│                                                                  │
│ Zod parsing:                                                     │
│   page: "1" → transform(Number) → 1 → z.number().positive()    │
│   limit: "10" → transform(Number) → 10 → z.number().max(100)   │
│   status: undefined ← optional, OK                              │
│   customerId: undefined ← optional, OK                          │
│   outletId: undefined ← optional, OK                            │
│   ...other fields                                               │
│                                                                  │
│ Result: {                                                        │
│   page: 1,                                                       │
│   limit: 10,                                                     │
│   status: undefined,                                             │
│   customerId: undefined,                                         │
│   outletId: undefined,                                           │
│   sortBy: "createdAt",  ← default                               │
│   sortOrder: "desc"     ← default                               │
│ }                                                                │
│                                                                  │
│ All validations pass                                             │
│ Result: PASS → next()                                           │
└──────────────────────┬──────────────────────────────────────────┘
                       │ T=100ms
                       ↓
┌──────────────────────────────────────────────────────────────────┐
│ T=105ms: ROUTE HANDLER (asyncHandler wrapper)                   │
│          (src/routes/order.routes.ts, lines 50-60)              │
│                                                                  │
│ Handler Code:                                                    │
│   asyncHandler(async (req: AuthRequest, res: Response) => {     │
│     const tenantId = requireTenantId(req);  // "tenant-123"     │
│     const userRole = req.user!.role;        // "SUPERVISOR"     │
│     const userPermissions = req.user!.permissions;              │
│     // { allowedStoreIds: ["outlet-1", "outlet-2"] }            │
│                                                                  │
│     const result = await orderService.getOrders(               │
│       tenantId,                          // "tenant-123"        │
│       req.query as any,                  // { page: 1, ... }   │
│       userRole,                          // "SUPERVISOR"        │
│       userPermissions                    // { allowedStoreIds }  │
│     );                                                           │
│                                                                  │
│     res.json(result);                                           │
│   })                                                             │
│                                                                  │
│ → Call orderService.getOrders()                                 │
└──────────────────────┬──────────────────────────────────────────┘
                       │ T=110ms
                       ↓
┌──────────────────────────────────────────────────────────────────┐
│ T=115ms: SERVICE LAYER (order.service.ts)                       │
│          getOrders() method                                      │
│                                                                  │
│ Parameters received:                                             │
│   tenantId = "tenant-123"                                       │
│   query = { page: 1, limit: 10, status: undefined, ... }        │
│   userRole = "SUPERVISOR"                                       │
│   userPermissions = { allowedStoreIds: ["outlet-1", ...] }      │
│                                                                  │
│ Code execution (lines 10-40):                                   │
│   const { page, limit, status, customerId, outletId, ...}       │
│     = query;                                                     │
│   const skip = (page - 1) * limit;                              │
│   // skip = (1 - 1) * 10 = 0                                    │
│                                                                  │
│   let outletFilter: any = outletId ? { outletId } : {};         │
│   // outletId = undefined → outletFilter = {}                   │
│                                                                  │
│ CRITICAL: SUPERVISOR filtering logic (lines 42-61):             │
│   else if (userRole === 'SUPERVISOR' &&                         │
│            userPermissions?.allowedStoreIds) {                  │
│     const allowedStoreIds = userPermissions.allowedStoreIds;    │
│     // ["outlet-1", "outlet-2"]                                 │
│                                                                  │
│     if (allowedStoreIds.length > 0) {                           │
│       if (outletId) {                                           │
│         // Not applicable (outletId is undefined)               │
│       } else {                                                   │
│         // Apply filter to ALL orders from allowed stores       │
│         outletFilter = { outletId: { in: allowedStoreIds } };   │
│         // { outletId: { in: ["outlet-1", "outlet-2"] } }       │
│       }                                                          │
│     }                                                            │
│   }                                                              │
│                                                                  │
│ Build Prisma WHERE clause (lines 65-80):                        │
│   const where: Prisma.OrderWhereInput = {                       │
│     tenantId: "tenant-123",                                     │
│     ...(status && { status }),           // Not applied          │
│     ...(customerId && { customerId }),   // Not applied          │
│     ...outletFilter,  // ← SPREAD: { outletId: { in: [...] } } │
│     // Other filters...                                         │
│   };                                                             │
│                                                                  │
│ Final WHERE object:                                              │
│   {                                                              │
│     tenantId: "tenant-123",                                     │
│     outletId: {                                                 │
│       in: ["outlet-1", "outlet-2"]                              │
│     }                                                            │
│   }                                                              │
│                                                                  │
│ Database Query (lines 83-105):                                  │
│   prisma.order.findMany({                                       │
│     where: {                                                     │
│       tenantId: "tenant-123",                                   │
│       outletId: { in: ["outlet-1", "outlet-2"] }                │
│     },                                                           │
│     skip: 0,                                                     │
│     take: 10,                                                    │
│     orderBy: { createdAt: "desc" },                             │
│     include: {                                                   │
│       items: { include: { product: true } },                    │
│       customer: true,                                           │
│       outlet: true,                                             │
│       user: { select: { id, name, email } }                    │
│     }                                                            │
│   })                                                             │
│                                                                  │
│ GENERATED SQL:                                                   │
│   SELECT o.*,                                                    │
│          oi.*, p.*,                                             │
│          c.*, u.id, u.name, u.email,                           │
│          ol.*                                                     │
│   FROM orders o                                                  │
│   LEFT JOIN order_items oi ON o.id = oi.order_id                │
│   LEFT JOIN products p ON oi.product_id = p.id                  │
│   LEFT JOIN customers c ON o.customer_id = c.id                 │
│   LEFT JOIN users u ON o.user_id = u.id                         │
│   LEFT JOIN outlets ol ON o.outlet_id = ol.id                   │
│   WHERE o.tenant_id = $1                                        │
│     AND o.outlet_id IN ($2, $3)                                 │
│   ORDER BY o.created_at DESC                                    │
│   LIMIT 10 OFFSET 0                                             │
│   PARAMS: ["tenant-123", "outlet-1", "outlet-2"]               │
│                                                                  │
│ Database Execution Time: ~150ms                                 │
│ Rows returned: 8 orders (fewer than 10 available)               │
│                                                                  │
│ Result object:                                                   │
│   {                                                              │
│     data: [                                                      │
│       {                                                          │
│         id: "order-1",                                          │
│         tenantId: "tenant-123",                                 │
│         outletId: "outlet-1",                                   │
│         customerId: "cust-123",                                 │
│         total: 150000,                                          │
│         status: "COMPLETED",                                    │
│         items: [...],                                           │
│         customer: {...},                                        │
│         outlet: {...}                                           │
│       },                                                         │
│       ... 7 more orders                                         │
│     ],                                                           │
│     pagination: {                                               │
│       page: 1,                                                  │
│       limit: 10,                                                │
│       total: 8,        ← CRITICAL: Total only from allowed      │
│       totalPages: 1    stores (not global)                      │
│     }                                                            │
│   }                                                              │
│                                                                  │
│ Return: result object                                           │
└──────────────────────┬──────────────────────────────────────────┘
                       │ T=260ms
                       ↓
┌──────────────────────────────────────────────────────────────────┐
│ T=265ms: RESPONSE (Back to handler)                             │
│                                                                  │
│ Code:                                                            │
│   res.json(result);                                             │
│                                                                  │
│ Response headers:                                                │
│   HTTP/1.1 200 OK                                               │
│   Content-Type: application/json                                │
│   Content-Length: 2547                                          │
│                                                                  │
│ Response body (JSON):                                            │
│ {                                                                │
│   "data": [                                                      │
│     {                                                            │
│       "id": "order-1",                                          │
│       "tenantId": "tenant-123",                                 │
│       "outletId": "outlet-1",                                   │
│       "customerId": "cust-123",                                 │
│       "total": 150000,                                          │
│       "status": "COMPLETED",                                    │
│       "items": [                                                │
│         {                                                        │
│           "id": "item-1",                                       │
│           "productId": "prod-123",                              │
│           "quantity": 2,                                        │
│           "price": 75000,                                       │
│           "product": {                                          │
│             "id": "prod-123",                                   │
│             "name": "Nasi Goreng",                              │
│             "price": 75000,                                     │
│             "stock": 45                                         │
│           }                                                      │
│         },                                                       │
│         ... 1 more item                                         │
│       ],                                                         │
│       "customer": {                                             │
│         "id": "cust-123",                                       │
│         "name": "Budi Santoso",                                 │
│         "phone": "08123456789"                                  │
│       },                                                         │
│       "outlet": {                                               │
│         "id": "outlet-1",                                       │
│         "name": "Outlet Pusat",                                 │
│         "address": "Jl. Raya No. 1"                             │
│       },                                                         │
│       "createdAt": "2026-02-10T10:30:00Z"                       │
│     },                                                           │
│     ... 7 more orders                                           │
│   ],                                                             │
│   "pagination": {                                               │
│     "page": 1,                                                  │
│     "limit": 10,                                                │
│     "total": 8,                                                 │
│     "totalPages": 1                                             │
│   }                                                              │
│ }                                                                │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTP Response
                       ↓
┌──────────────────────────────────────────────────────────────────┐
│ T=270ms: CLIENT receives response                                │
│ Status: 200 OK                                                   │
│ Body: JSON data with 8 orders from outlets 1 & 2                │
└──────────────────────────────────────────────────────────────────┘

TOTAL REQUEST TIME: 270ms
- Middleware chain: 100ms
- Service + DB: 150ms
- Response serialization: 20ms
```

---

## 2️⃣ DECISION TREE: GET /api/orders BY ROLE

### A. Different Role Behaviors (Same Endpoint)

```
GET /api/orders
│
├─── Role Check (roleGuard)
│    │
│    ├─ SUPER_ADMIN
│    │  │
│    │  ├─ supervisorStoreGuard: SKIP (next())
│    │  │
│    │  └─ orderService.getOrders()
│    │     └─ outletFilter: {} (EMPTY)
│    │     └─ WHERE tenantId = "tenant-123"
│    │     └─ Result: ALL orders from ALL outlets for tenant
│    │        (Assume 250 orders exist)
│    │        Returns: Orders 1-10 (paginated)
│    │        Total: 250
│    │
│    ├─ ADMIN_TENANT
│    │  │
│    │  ├─ supervisorStoreGuard: SKIP (next())
│    │  │
│    │  └─ orderService.getOrders()
│    │     └─ userRole !== 'SUPERVISOR' → No filtering
│    │     └─ WHERE tenantId = "tenant-123"
│    │     └─ Result: ALL orders from ALL outlets
│    │        Returns: Orders 1-10
│    │        Total: 250
│    │
│    ├─ SUPERVISOR
│    │  │
│    │  ├─ supervisorStoreGuard: CHECK (request has storeId?)
│    │  │  │
│    │  │  ├─ storeId in request? NO
│    │  │  │  └─ storeFilter = {}
│    │  │  │  └─ SKIP validation, next()
│    │  │  │
│    │  │  └─ storeId in request? YES ("outlet-3")
│    │  │     ├─ Check: "outlet-3" in allowedStoreIds?
│    │  │     │  ├─ YES → next(), allow
│    │  │     │  └─ NO → 403 Forbidden, STOP
│    │  │
│    │  └─ orderService.getOrders()
│    │     ├─ userRole === 'SUPERVISOR'? YES
│    │     ├─ allowedStoreIds: ["outlet-1", "outlet-2"]
│    │     ├─ outletFilter: { outletId: { in: ["outlet-1", "outlet-2"] } }
│    │     └─ WHERE tenantId = "tenant-123"
│    │        AND outletId IN ("outlet-1", "outlet-2")
│    │     └─ Result: Orders from outlet-1 & outlet-2 only
│    │        Returns: Orders 1-8
│    │        Total: 8 (not 250!)
│    │
│    ├─ CASHIER
│    │  │
│    │  ├─ supervisorStoreGuard: SKIP (role != 'SUPERVISOR')
│    │  │
│    │  └─ orderService.getOrders()
│    │     ├─ userRole === 'CASHIER'? YES
│    │     ├─ assignedStoreId: "outlet-1" (from permissions)
│    │     ├─ outletFilter: { outletId: "outlet-1" }  ← OVERRIDES request
│    │     └─ WHERE tenantId = "tenant-123"
│    │        AND outletId = "outlet-1"
│    │        AND sendToKitchen = (not forced)
│    │     └─ Result: Orders from outlet-1 ONLY
│    │        (Even if request asked for outlet-2)
│    │        Returns: Orders 1-10
│    │        Total: 42
│    │
│    └─ KITCHEN
│       │
│       ├─ supervisorStoreGuard: SKIP (role != 'SUPERVISOR')
│       │
│       └─ orderService.getOrders()
│          ├─ userRole === 'KITCHEN'? YES
│          ├─ assignedStoreId: "outlet-1"
│          ├─ outletFilter: { outletId: "outlet-1" }
│          ├─ ADDITIONAL: Add sendToKitchen = true filter
│          │  (line 93: ...(userRole === 'KITCHEN' && { sendToKitchen: true }))
│          └─ WHERE tenantId = "tenant-123"
│             AND outletId = "outlet-1"
│             AND sendToKitchen = true
│          └─ Result: Only orders marked for kitchen
│             Returns: Orders 1-5
│             Total: 15 (out of 42 in outlet-1)

KEY INSIGHT:
Same endpoint URL returns DIFFERENT DATA based on user role
SUPERVISOR: 8 orders (filtered)
CASHIER: 42 orders (assigned store)
KITCHEN: 15 orders (assigned store + kitchen only)
SUPER_ADMIN: 250 orders (all)
```

---

## 3️⃣ CREATE ORDER: Failure Decision Tree

### A. All Possible Failure Points

```
POST /api/orders
Body: { items: [...], outletId: "outlet-3" }
│
├─ MIDDLEWARE #1: authGuard
│  ├─ NO Authorization header?
│  │  └─ 401 UNAUTHORIZED: 'No token provided'
│  │     Status: 401
│  │     Stop execution
│  │
│  ├─ Invalid JWT signature?
│  │  └─ 401 UNAUTHORIZED: 'Invalid token'
│  │     Stop execution
│  │
│  ├─ Token expired?
│  │  └─ 401 UNAUTHORIZED: 'Token expired'
│  │     Stop execution
│  │
│  ├─ User doesn't exist in DB?
│  │  └─ 401 UNAUTHORIZED: 'User not found'
│  │     Stop execution
│  │
│  ├─ User.isActive = false?
│  │  └─ 401 UNAUTHORIZED: 'User account is inactive'
│  │     Stop execution
│  │
│  ├─ Tenant doesn't exist?
│  │  └─ 403 FORBIDDEN: 'Tenant not found'
│  │     Stop execution
│  │
│  └─ Tenant.isActive = false?
│     └─ 403 FORBIDDEN: 'Tenant is inactive'
│        Stop execution
│
├─ MIDDLEWARE #2: roleGuard('ADMIN_TENANT', 'SUPERVISOR', 'CASHIER', 'KITCHEN')
│  ├─ req.role is SUPER_ADMIN?
│  │  └─ 403 FORBIDDEN: 'Insufficient permissions'
│  │     Stop execution
│  │
│  └─ (If role check passes)
│
├─ MIDDLEWARE #3: supervisorStoreGuard()
│  ├─ (Only applies to SUPERVISOR role)
│  ├─ outletId = "outlet-3" in request
│  ├─ Check: "outlet-3" in allowedStoreIds ["outlet-1", "outlet-2"]?
│  │  ├─ NO → 403 FORBIDDEN: 'Store access not allowed'
│  │  │       Detail: { requestedStore: "outlet-3", 
│  │  │                 allowedStores: ["outlet-1", "outlet-2"] }
│  │  │       Stop execution
│  │  │
│  │  └─ YES → Continue
│  │
│  └─ (Other roles bypass this check)
│
├─ MIDDLEWARE #4: subscriptionGuard
│  ├─ No active subscription?
│  │  └─ 403 FORBIDDEN: 'Subscription expired'
│  │     Stop execution
│  │
│  └─ Subscription.subscriptionEnd < now()?
│     └─ 403 FORBIDDEN: 'Subscription has expired'
│        Stop execution
│
├─ MIDDLEWARE #5: validate
│  ├─ items is missing?
│  │  └─ 400 BAD REQUEST: 'items: Required'
│  │     Stop execution
│  │
│  ├─ items.length === 0?
│  │  └─ 400 BAD REQUEST: 'items: Array must contain at least 1 item'
│  │     Stop execution
│  │
│  ├─ productId is not valid UUID?
│  │  └─ 400 BAD REQUEST: 'items[0].productId: Invalid UUID'
│  │     Stop execution
│  │
│  ├─ quantity is not positive integer?
│  │  └─ 400 BAD REQUEST: 'items[0].quantity: Must be positive'
│  │     Stop execution
│  │
│  └─ (If validation passes)
│
├─ HANDLER: orderService.createOrder()
│  │
│  ├─ CASHIER user check:
│  │  ├─ Is CASHIER?
│  │  │  ├─ Check: active CashShift exists?
│  │  │  │  └─ NO → 400 BAD REQUEST:
│  │  │  │         'Kasir harus membuka shift terlebih dahulu...'
│  │  │  │         Stop execution
│  │  │  │
│  │  │  └─ YES → Continue
│  │  │
│  │  └─ Not CASHIER → Skip check
│  │
│  ├─ Product validation:
│  │  ├─ For each item:
│  │  │  ├─ Product doesn't exist?
│  │  │  │  └─ 400 BAD REQUEST: 'Product not found'
│  │  │  │     Stop execution
│  │  │  │
│  │  │  ├─ Product.stock < quantity?
│  │  │  │  └─ 400 BAD REQUEST: 'Insufficient stock'
│  │  │  │     ⚠️ ISSUE: Do items before this get created?
│  │  │  │     (Potential transaction rollback)
│  │  │  │     Stop execution
│  │  │  │
│  │  │  └─ (Product valid, continue)
│  │  │
│  │  └─ All items valid → Continue
│  │
│  ├─ Stock update:
│  │  ├─ For each item:
│  │  │  ├─ UPDATE products SET stock = stock - quantity
│  │  │  └─ (If error) → 500 INTERNAL SERVER ERROR
│  │  │
│  │  └─ All stock updates successful → Continue
│  │
│  ├─ Order creation:
│  │  ├─ Database INSERT fails (FK constraint)?
│  │  │  └─ 500 INTERNAL SERVER ERROR: 'Database error'
│  │  │     ⚠️ CRITICAL: Stock already decremented!
│  │  │     (Atomic transaction issue)
│  │  │
│  │  └─ INSERT successful → Continue
│  │
│  └─ ✅ Order created successfully
│     Return: { id, items, total, customer, outlet, ... }
│
└─ RESPONSE
   Status: 201 Created
   Body: Complete order object


## CRITICAL ISSUES IDENTIFIED:

1. Stock Decrement Before Order Save
   ├─ Stock updated BEFORE order.create() call
   ├─ If order creation fails → Stock already reduced
   └─ Recommendation: Use database transaction

2. Multiple Validation Layers
   ├─ Middleware validates outletId (supervisor guard)
   ├─ Service doesn't validate outletId ownership
   ├─ Implicit assumption: supervisorStoreGuard did the check
   └─ Risk: If middleware bypassed, validation skipped

3. Error Message Inconsistency
   ├─ Some 400 errors, some 403
   ├─ Some JSON key is "error", some "message"
   └─ Recommendation: Standardize error response format
```

---

## 4️⃣ DATABASE QUERY ANALYSIS

### A. Query for getOrders with SUPERVISOR

```sql
-- Request: GET /api/orders?page=1&limit=10
-- User: SUPERVISOR with allowedStoreIds = ["outlet-1", "outlet-2"]

-- GENERATED SQL:
SELECT 
  o.id,
  o.tenant_id,
  o.outlet_id,
  o.customer_id,
  o.user_id,
  o.status,
  o.total,
  o.created_at,
  o.updated_at,
  -- ORDER_ITEMS JOIN
  oi.id as order_item_id,
  oi.order_id,
  oi.product_id,
  oi.quantity,
  oi.price,
  -- PRODUCTS JOIN
  p.id as product_id,
  p.name,
  p.price,
  p.stock,
  -- CUSTOMERS JOIN
  c.id as customer_id,
  c.name,
  c.phone,
  -- OUTLETS JOIN
  ol.id as outlet_id,
  ol.name as outlet_name,
  ol.address
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.id
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN outlets ol ON o.outlet_id = ol.id
WHERE o.tenant_id = 'tenant-123'
  AND o.outlet_id IN ('outlet-1', 'outlet-2')
ORDER BY o.created_at DESC
LIMIT 10
OFFSET 0;

-- BREAKDOWN:
-- 1. Main table: orders (filtered by tenantId)
-- 2. Join order_items (1:N relationship - can multiply rows)
-- 3. Join products (via order_items)
-- 4. Join customers (N:1 relationship)
-- 5. Join outlets (N:1 relationship)
-- 6. WHERE clause: tenantId + outlet_id IN (2 values)
-- 7. ORDER BY + LIMIT 10

-- PERFORMANCE ANALYSIS:
-- Indexes needed:
--   ✓ orders(tenant_id) - may exist
--   ✓ orders(tenant_id, outlet_id) - RECOMMENDED
--   ✓ order_items(order_id) - should exist (FK)
--   ✓ products(id) - should exist (PK)
--   ✗ customers(id) - may be missing
--   ✗ outlets(id) - may be missing

-- ESTIMATED COSTS:
-- Without indexes: ~5-10 seconds (full table scan with many joins)
-- With proper indexes: ~150ms (reasonable)

-- EXECUTION PLAN (estimated):
-- 1. Index Scan on orders(tenant_id, outlet_id)
--    └─ Finds ~8 rows matching WHERE clause
--
-- 2. Nested Loop Join with order_items
--    └─ For each order, seek in order_items(order_id)
--    └─ Finds ~15 items total (8 orders × ~2 items/order average)
--
-- 3. Nested Loop Join with products
--    └─ For each item, seek in products(id)
--    └─ Finds product details
--
-- 4. Hash Join with customers
--    └─ Build hash of 8 customers
--    └─ Probe on customer_id
--
-- 5. Hash Join with outlets
--    └─ Only 2 outlets, so cache friendly
--
-- Total rows returned: ~15 rows
-- (Each order has multiple item rows due to LEFT JOIN multiplication)

-- CLIENT-SIDE PARSING:
-- Prisma will receive 15 rows and reconstruct:
// {
//   data: [
//     {
//       id: "order-1",
//       items: [
//         { productId: "prod-1", quantity: 2, product: {...} },
//         { productId: "prod-2", quantity: 1, product: {...} }
//       ],
//       customer: {...}
//       outlet: {...}
//     },
//     ... 7 more orders reconstructed from duplicate rows
//   ],
//   pagination: { ... }
// }
```

---

## 5️⃣ PERMISSION CHECK BYPASS SCENARIOS

### A. Can Supervisor Bypass Store Guard?

```typescript
// SCENARIO 1: Direct service call (if authenticated)
// Code:
const orders = await orderService.getOrders(
  tenantId: "tenant-123",
  query: { outletId: "outlet-999" },  // Not in allowedStoreIds
  userRole: "SUPERVISOR",
  userPermissions: { allowedStoreIds: ["outlet-1", "outlet-2"] }
);

// Flow:
// 1. supervisorStoreGuard middleware is BYPASSED (direct call)
// 2. Service checks: outletId in allowedStoreIds?
//    Line 45: if (outletId && !allowedStoreIds.includes(outletId))
//    → true (outlet-999 not in list)
//    → Returns empty result silently
//    → No error thrown
//
// Result: ✓ SAFE - Silent filtering prevents access

// SCENARIO 2: Can middleware be bypassed?
// Question: What if developer writes code like:
router.post('/orders/admin-bypass', async (req, res) => {
  // NO middleware applied
  const orders = await orderService.getOrders(...)
});

// Answer: ✓ VULNERABLE
// - Supervisor can call this endpoint
// - Service-layer filtering still applies (but secondary)
// - Risk: Developer forgets to add roleGuard
//
// Mitigation: Service layer includes fallback checks
//              If middleware bypassed, service still filters

// SCENARIO 3: Forged JWT token
// Attacker creates token: { role: "SUPER_ADMIN", ... }
// But uses stolen CASHIER user's userId
//
// Flow:
// 1. authGuard verifies JWT signature (checks with secret)
// 2. Loads user from DB: SELECT * FROM users WHERE id = cashier_id
// 3. User has role = "CASHIER" (in DB)
// 4. But JWT token says role = "SUPER_ADMIN"
//
// Question: Which role is used?
// Answer: req.role is copied from JWT (not from DB user)
//
// Line 210: req.role = decoded.role  // From JWT
// NOT: req.role = user.role           // From DB
//
// ⚠️ VULNERABILITY: Role in JWT takes precedence!
//
// Mitigation: Should validate JWT.role === user.role
```

---

## 6️⃣ RESPONSE SIZE & NETWORK IMPACT

### A. JSON Response Estimation

```javascript
// GET /api/orders response

BASE OBJECTS:
├─ Pagination metadata: ~150 bytes
│  { "page": 1, "limit": 10, "total": 8, "totalPages": 1 }
│
└─ Data array with 8 orders:
   ├─ Per order (with relations):
   │  {
   │    "id": "uuid",                           // 36 bytes
   │    "tenantId": "uuid",                    // 36 bytes
   │    "customerId": "uuid",                  // 36 bytes
   │    "total": 175000,                       // 6 bytes
   │    "status": "COMPLETED",                 // 15 bytes
   │    "items": [
   │      {
   │        "id": "uuid",                      // 36 bytes
   │        "productId": "uuid",               // 36 bytes
   │        "quantity": 2,                     // 1 byte
   │        "price": 75000,                    // 5 bytes
   │        "product": {
   │          "id": "uuid",                    // 36 bytes
   │          "name": "Nasi Goreng",           // 12 bytes
   │          "price": 75000,                  // 5 bytes
   │          "stock": 45,                     // 2 bytes
   │          "category": "food"               // 8 bytes
   │        }                                  // ~100 bytes
   │      },
   │      {
   │        "id": "uuid",                      // 36 bytes
   │        "productId": "uuid",               // 36 bytes
   │        ...second item...
   │      }                                    // ~100 bytes
   │    ],                                     // ~200 bytes (2 items)
   │    "customer": {
   │      "id": "uuid",                        // 36 bytes
   │      "name": "Budi Santoso",              // 14 bytes
   │      "phone": "08123456789"               // 11 bytes
   │    },                                     // ~100 bytes
   │    "outlet": {
   │      "id": "uuid",                        // 36 bytes
   │      "name": "Outlet Pusat",              // 14 bytes
   │      "address": "Jl. Raya No. 1"          // 15 bytes
   │    },                                     // ~100 bytes
   │    "createdAt": "2026-02-10T10:30:00Z"    // 24 bytes
   │  }                                        // ~500 bytes per order
   │
   └─ × 8 orders = ~4000 bytes

TOTAL RESPONSE SIZE:
├─ Base structure: ~150 bytes
├─ Data (8 orders × ~500 bytes): ~4000 bytes
├─ JSON formatting (brackets, quotes): ~300 bytes
└─ Total: ~4450 bytes

WITH GZIP COMPRESSION:
├─ Typically 60-70% reduction for JSON
├─ Compressed size: ~1335 bytes
└─ Transfer time (4G): ~5ms

NETWORK IMPACT:
✓ Acceptable for most use cases
✓ Mobile-friendly (< 5KB)
✓ Minimal bandwidth usage even for 4G

WITHOUT GZIP:
✗ ~4.5 KB per request
✗ 100 requests/second = 450 KB/s
✗ If 1000 supervisors checking orders = 4.5 MB/s
```

---

## KESIMPULAN ANALISIS

| Layer | Finding | Impact |
|-------|---------|--------|
| **Middleware** | 5 layers, ordered correctly | ✅ Secure |
| **Store Guard** | Only runs for SUPERVISOR | ⚠️ Other roles need DB filtering |
| **Service** | Replicates store filtering | ✅ Defense in depth |
| **Database** | Needs proper indexes | 🟠 Without = slow queries |
| **Permissions** | JSON field in User table | ⚠️ Scaling complexity |
| **Atomicity** | Stock decremented before order save | 🔴 **CRITICAL BUG** |
| **Error Handling** | Inconsistent status codes | 🟠 Client confusion |
| **JWT Role** | Takes precedence over DB role | 🔴 **SECURITY ISSUE** |

