# ANALISIS MENDALAM: IMPLEMENTASI TEKNIS & BUSINESS LOGIC

**Tanggal:** 11 Februari 2026  
**Scope:** 8 Dimensi Detail (Code Tracing + Database + Permissions + Error Flows)  
**Status:** 🔬 DEEP ANALYSIS - Based on Actual Code Reading

---

## 1️⃣ MIDDLEWARE CHAIN: SUPERVISOR-STORE-GUARD (DETAIL)

### A. Supervisor Store Guard Flow
```typescript
// ✅ Lokasi File: src/middlewares/supervisor-store-guard.ts (206 lines)
// Diimplementasikan untuk: ORDER, OUTLET management (stricter NEW version)

// =====================================================
// FLOW #1: Single Store Access (Primary)
// =====================================================
1. Request masuk: GET /api/orders?storeId=outlet-123
   ↓
2. supervisorStoreGuard() middleware:
   - Cek apakah req.role === 'SUPERVISOR'
   - Jika SUPER_ADMIN atau ADMIN_TENANT → SKIP middleware (next())
   - Jika CASHIER/KITCHEN → juga SKIP (mereka pakai assignedStoreId, bukan allowedStoreIds)
   ↓
3. Extract storeId dari 3 sumber (priority: query > body > params):
   - Query param: req.query.storeId ✓ (paling sering)
   - Body: req.body.storeId atau req.body.store_id
   - Route param: req.params.storeId (e.g., /api/outlets/:storeId)
   ↓
4. Jika ada storeId, validasi permissions:
   - Ambil permissions dari: req.permissions?.allowedStoreIds || []
   - Cek: allowedStoreIds.includes(storeId)
   ↓
5. HASIL:
   - ✅ ALLOW: next() → lanjut ke handler
   - ❌ DENY: res.status(403).json({ error: 'Forbidden: Store access not allowed' })

// =====================================================
// FLOW #2: Bulk Store Access (supervisorStoresGuard)
// =====================================================
1. Request: POST /api/outlets/bulk-update
   Body: { storeIds: ['outlet-1', 'outlet-2', 'outlet-3'] }
   ↓
2. supervisorStoresGuard() middleware:
   - Extract storeIds dari: req.body.storeIds || req.body.store_ids || []
   - Jika empty → ALLOW (no store filtering)
   ↓
3. Validasi SEMUA stores di list:
   const unauthorizedStores = storeIds.filter(id => !allowedStoreIds.includes(id))
   ↓
4. HASIL:
   - ✅ ALLOW: Jika ALL stores dalam allowedStoreIds
   - ❌ DENY: Jika ADA store NOT dalam allowedStoreIds
     → res.status(403).json({
         error: 'Forbidden',
         unauthorizedStores: ['outlet-5', 'outlet-9'],
         allowedStoreIds: [...]
       })

// =====================================================
// ERROR HANDLING
// =====================================================
if (error occurred during guard) {
  logger.error('Supervisor store guard error', { error, userId, path })
  res.status(403).json({
    error: 'Access control check failed',
    message: 'Could not verify store access permissions'
  })
}
```

### B. Where Supervisor-Store-Guard is APPLIED

**File: src/routes/order.routes.ts (line 50-60)**
```typescript
router.get(
  '/',
  authGuard,                              // 1st: JWT validation
  roleGuard('ADMIN_TENANT', 'SUPERVISOR', 'CASHIER', 'KITCHEN'),  // 2nd: Role check
  supervisorStoreGuard(),                 // 3rd: Store access check ← NEW
  subscriptionGuard,                      // 4th: Subscription check
  validate({ query: getOrdersQuerySchema }), // 5th: Data validation
  asyncHandler(async (req: AuthRequest, res: Response) => {
    // Handler executed if all guards pass
  })
);
```

**Middleware Stacking Order (CRITICAL for Security):**
1. `authGuard` - Verify JWT, load user data
2. `roleGuard` - Check user's role
3. `supervisorStoreGuard` - **NEW in reskin** - Restrict to assigned stores
4. `subscriptionGuard` - Verify tenant has active subscription
5. `validate` - Validate request schema
6. Handler function - Business logic

---

### C. Permission Data Structure

**Where permissions come from: `src/middlewares/auth.ts` (lines 80-150)**

```typescript
// After JWT validation, supervisor-specific checks:
if (decoded.role === 'SUPERVISOR') {
  const permissions = (user.permissions as UserPermissions) || {};
  const allowedStoreIds = permissions?.allowedStoreIds || [];
  
  // Validate all assigned stores ARE ACTIVE
  if (allowedStoreIds.length > 0) {
    const allowedStores = await prisma.outlet.findMany({
      where: {
        id: { in: allowedStoreIds },
        tenantId: user.tenantId || user.tenant?.id || '',
        isActive: true,  // ← MUST be active
      }
    });
    
    // If store is inactive, DENY access
    if (allowedStores.length < allowedStoreIds.length) {
      res.status(403).json({
        error: 'Store is inactive',
        message: 'One or more assigned stores are inactive'
      });
      return;
    }
  }
}
```

**Database Structure (src/prisma/schema.prisma):**
```prisma
model User {
  id        String    @id @default(uuid())
  tenantId  String
  email     String
  role      UserRole  @default(CASHIER)
  permissions Json?    // THIS stores: { allowedStoreIds: [...], assignedStoreId: ... }
  
  // Only SUPERVISOR punya allowedStoreIds: string[]
  // CASHIER/KITCHEN punya assignedStoreId: string (singular)
}
```

---

## 2️⃣ ORDER SERVICE: COMPLEX FILTERING LOGIC

### A. getOrders() Method Deep Dive

**File: src/services/order.service.ts (lines 7-92)**

```typescript
async getOrders(
  tenantId: string,
  query: GetOrdersQuery,
  userRole?: string,
  userPermissions?: any  // ← Permissions passed from route
) {
  // ================================================
  // STEP 1: Parse Query Parameters
  // ================================================
  const { page, limit, status, customerId, outletId, startDate, endDate, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;
  
  // ================================================
  // STEP 2: Filter Kitchen Users
  // ================================================
  let kitchenStatusWhere: any = undefined;
  if (kitchenStatus) {
    if (Array.isArray(kitchenStatus)) {
      kitchenStatusWhere = { in: kitchenStatus };  // Multiple statuses
    } else {
      kitchenStatusWhere = kitchenStatus;  // Single status
    }
  }
  
  // ================================================
  // STEP 3: CRITICAL STORE FILTERING LOGIC
  // ================================================
  let outletFilter: any = outletId ? { outletId } : {};
  
  // CASE 1: CASHIER or KITCHEN role
  //   → Auto-filter to THEIR assigned store ONLY
  if ((userRole === 'CASHIER' || userRole === 'KITCHEN') && userPermissions?.assignedStoreId) {
    const assignedStoreId = userPermissions.assignedStoreId;
    outletFilter = { outletId: assignedStoreId };  // ← OVERRIDE any other filter
  }
  
  // CASE 2: SUPERVISOR role
  //   → Filter to stores IN their allowedList
  else if (userRole === 'SUPERVISOR' && userPermissions?.allowedStoreIds) {
    const allowedStoreIds = userPermissions.allowedStoreIds;
    
    if (allowedStoreIds.length > 0) {
      if (outletId) {
        // If supervisor requests specific outlet
        if (!allowedStoreIds.includes(outletId)) {
          // NOT in their list → return EMPTY results silently
          return {
            data: [],
            pagination: { page, limit, total: 0, totalPages: 0 }
          };
        }
        outletFilter = { outletId };
      } else {
        // No specific outlet requested → show from ALL allowed stores
        outletFilter = { outletId: { in: allowedStoreIds } };
      }
    } else {
      // No stores assigned → return EMPTY
      return {
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 }
      };
    }
  }
  
  // CASE 3: ADMIN_TENANT or SUPER_ADMIN
  //   → Can see ALL orders (no filter applied)
  
  // ================================================
  // STEP 4: Build Prisma WHERE clause
  // ================================================
  const where: Prisma.OrderWhereInput = {
    tenantId,
    ...(status && { status }),                      // Filter by status
    ...(customerId && { customerId }),              // Filter by customer
    ...outletFilter,                                // ← STORE FILTER (from above)
    ...(startDate && endDate && {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)  // Adjusted for end-of-day
      }
    }),
    ...(sendToKitchen === true ? { sendToKitchen: true } : {}),
    // KITCHEN users: ONLY see orders sent to kitchen
    ...(userRole === 'KITCHEN' && { sendToKitchen: true }),
    ...(kitchenStatusWhere && { kitchenStatus: kitchenStatusWhere }),
  };
  
  // ================================================
  // STEP 5: Execute Query with Joins
  // ================================================
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: true,
        member: true,
        outlet: true,        // ← Include store data
        storeShift: {        // ← Include shift info
          select: {
            id: true,
            shiftType: true,
            openedAt: true,
            opener: { select: { id: true, name: true, email: true } }
          }
        },
        user: {              // ← Who created order
          select: { id: true, name: true, email: true }
        }
      }
    }),
    prisma.order.count({ where })  // Total count for pagination
  ]);
  
  return {
    data: orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}
```

### B. Orders: Breaking Change for Different Roles

| User Role | OLD Version | NEW Version | Breaking? |
|-----------|------------|-----------|-----------|
| **SUPER_ADMIN** | All orders | All orders | ❌ No |
| **ADMIN_TENANT** | All tenant orders | All tenant orders | ❌ No |
| **SUPERVISOR** | All orders (no filter) | *Only assigned stores* | ⚠️ **YES** |
| **CASHIER** | All orders | *Only assigned store* | ⚠️ **YES** |
| **KITCHEN** | All orders | *Only assigned store + sendToKitchen=true* | ⚠️ **YES** |

**Impact:** If OLD client sends request as CASHIER expecting to see orders from ALL stores, they will now get **empty result or 403 Forbidden**.

---

## 3️⃣ SERVICE LAYER DEPENDENCIES (CALL GRAPH)

### A. Service Initialization Chain

**File: src/services/index.ts (implicit from grep results)**

```
OrderService
├─ Depends on: ProductService (validate product exists)
├─ Depends on: CashShiftService (CASHIER must have active shift)
├─ Depends on: PrismaClient (database)
├─ Depends on: Redis (caching)
└─ Depends on: Logger (audit trail)

OutletService
├─ Depends on: PrismaClient
├─ Depends on: Redis (cache outlet list)
├─ Has validation: OutletValidation object (local)
└─ Validates: name, phone, address, shiftConfig, operatingHours

UserService
├─ Depends on: PrismaClient
├─ Creates/Updates: permissions JSON (role-specific)
│  └─ For SUPERVISOR: stores allowedStoreIds in User.permissions
│  └─ For CASHIER/KITCHEN: stores assignedStoreId in User.permissions
└─ Handles: password hashing, 2FA setup

SubscriptionService
├─ Depends on: PrismaClient (Tenant.subscriptionPlan)
├─ Checks: subscriptionEnd date
└─ Used by: subscriptionGuard (middleware)
```

### B. Inter-Service Calls (Which Services Call Which)

```
createOrder() route
  ↓
OrderService.createOrder()
  ├─ ProductService.updateStock() [for each item]
  ├─ CashShiftService.hasActiveShift() [CASHIER validation]
  ├─ PaymentService [if payment method provided]
  └─ prisma.order.create() with relations
  
updateOrder() route
  ↓
OrderService.updateOrder()
  ├─ ProductService.updateStock() [if items changed]
  ├─ Previous quantities rollback
  └─ prisma.order.update()
```

---

## 4️⃣ DATABASE SCHEMA: PERMISSION STORAGE

### A. User Permissions JSON Structure

**File: prisma/schema.prisma (User model)**

```prisma
model User {
  id           String    @id @default(uuid())
  email        String
  role         UserRole  @default(CASHIER)
  permissions  Json?     // ← This is where role-specific data lives
  tenantId     String
  
  // Relationships
  tenant       Tenant    @relation(fields: [tenantId], references: [id])
  orders       Order[]
  cashShifts   CashShift[]
}

enum UserRole {
  SUPER_ADMIN    // Platform admin
  ADMIN_TENANT   // Tenant owner
  SUPERVISOR     // Multi-store manager
  CASHIER        // Single store cashier
  KITCHEN        // Kitchen staff
}
```

**Real Example: Permissions JSON for Different Roles**

```json
// SUPERVISOR user (multi-store manager)
{
  "allowedStoreIds": ["outlet-1", "outlet-2", "outlet-5", "outlet-8"],
  "canApproveDiscounts": true,
  "canViewReports": true
}

// CASHIER user (single store)
{
  "assignedStoreId": "outlet-1",
  "canEditOrders": true,
  "canEditCustomers": false,
  "canViewReports": false
}

// KITCHEN user (single store, kitchen-only)
{
  "assignedStoreId": "outlet-1",
  "canSeeAllOrders": false,
  "canOnlySeeKitchenOrders": true
}

// ADMIN_TENANT user (full access within tenant)
{
  "allStoresAccess": true,
  "canManageUsers": true,
  "canManageOutlets": true,
  "canViewFinance": true
}
```

### B. Outlet Model (Store Configuration)

```prisma
model Outlet {
  id            String    @id @default(uuid())
  tenantId      String
  name          String    // e.g., "Outlet Pusat", "Outlet Cabang"
  address       String?
  phone         String?
  isActive      Boolean   @default(true)
  
  // NEW in reskin version:
  shiftConfig   Json?     // Array of { name, startTime, endTime }
  operatingHours Json?    // { senin: { open: "09:00", close: "21:00", isOpen: true }, ... }
  
  // Relations
  tenant        Tenant    @relation(fields: [tenantId], references: [id])
  orders        Order[]
  storeShifts   StoreShift[]
  
  @@index([tenantId])
  @@index([tenantId, isActive])
}
```

---

## 5️⃣ ERROR HANDLING PATTERNS (OLD vs NEW)

### A. Order Route Errors

**OLD Pattern (Manual try-catch):**
```typescript
// From OLD BACKUP:
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.tenantId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error('Error fetching order', { error: err.message });
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});
```

**NEW Pattern (asyncHandler wrapper):**
```typescript
// From NEW version:
router.get(
  '/:id',
  authGuard,
  roleGuard(...),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const order = await orderService.getOrderById(req.params.id, req.tenantId);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json(order);
    // Error automatically caught by asyncHandler
  })
);
```

**asyncHandler does:**
```typescript
// src/utils/route-error-handler.ts (implied)
export const asyncHandler = (fn: Function) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      logger.error('Route error', { error, path: req.path });
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
};
```

### B. Supervisor Store Guard Errors

**Scenario 1: Unauthorized Store Access**
```json
{
  "status": 403,
  "body": {
    "error": "Forbidden: Store access not allowed",
    "message": "You do not have access to store \"outlet-999\". Contact admin to get access to this store.",
    "code": "STORE_ACCESS_DENIED",
    "requestedStore": "outlet-999",
    "allowedStores": ["outlet-1", "outlet-2", "outlet-5"]
  }
}
```

**Scenario 2: Store Inactive (from authGuard)**
```json
{
  "status": 403,
  "body": {
    "error": "Store \"Outlet Cabang\" yang ditetapkan untuk akun Anda saat ini tidak aktif. Silakan hubungi administrator untuk memindahkan Anda ke store aktif terlebih dahulu.",
    "message": "..."
  }
}
```

**Scenario 3: Guard Execution Error**
```json
{
  "status": 403,
  "body": {
    "error": "Access control check failed",
    "message": "Could not verify store access permissions"
  }
}
```

---

## 6️⃣ OUTLET MANAGEMENT: 4-FILE REFACTORING

### A. Outlet Files Breakdown

**File 1: outlet.routes.ts (Main - REGISTERED ✓)**
```typescript
// Endpoint count: ~15 endpoints
GET  /api/outlets              // List all
GET  /api/outlets/:id          // Get one
POST /api/outlets              // Create
PUT  /api/outlets/:id          // Update
DELETE /api/outlets/:id        // Soft delete
GET  /api/outlets/low-stock/all

// Handler: OutletService
// Middleware: [authGuard, roleGuard('ADMIN_TENANT', 'SUPERVISOR')]
```

**File 2: outlet.advanced.routes.ts (NOT REGISTERED ❌)**
```typescript
// Endpoint count: ~3 endpoints
POST /api/outlets/bulk/update   // Bulk update multiple outlets
POST /api/outlets/bulk/delete   // Bulk delete
GET  /api/outlets/search/stats  // Outlet statistics

// Handler: OutletService
// Middleware: [authGuard, roleGuard(...), supervisorStoresGuard()]
// Status: CODE EXISTS but NOT CALLABLE - missing from index.ts
```

**File 3: outlet.search.routes.ts (NOT REGISTERED ❌)**
```typescript
// Endpoint count: ~3 endpoints
POST /api/outlets/search/advanced   // Advanced search with filters
GET  /api/outlets/search/statistics // Search statistics
GET  /api/outlets/search/fulltext   // Full-text search

// Handler: OutletService or new OutletSearchService
// Status: CODE EXISTS but NOT CALLABLE
```

**File 4: outlet.import-export.routes.ts (NOT REGISTERED ❌)**
```typescript
// Endpoint count: ~3 endpoints
GET  /api/outlets/export/csv    // Export outlets as CSV
POST /api/outlets/import/csv    // Import outlets from CSV
GET  /api/outlets/export/json   // Export as JSON

// Handler: OutletImportExportService or OutletService
// Status: CODE EXISTS but NOT CALLABLE
```

### B. Why 3 Files Are Orphaned

**Current index.ts (line 102):**
```typescript
import outletRoutes from './outlet.routes';
// ... later ...
router.use('/outlets', outletRoutes);

// ❌ MISSING:
// import outletAdvancedRoutes from './outlet.advanced.routes';
// router.use('/outlets', outletAdvancedRoutes);
// ... and similar for search and import-export
```

**Consequence:**
```
API Request Routing Behavior:

Request: POST /api/outlets/bulk/update
↓
Express matches /outlets path prefix
↓
Routes file: outlet.routes.ts is checked
↓
No route matches /bulk/update in outline.routes.ts
↓
Result: 404 Not Found
╰─ Even though the endpoint code EXISTS in outlet.advanced.routes.ts
```

---

## 7️⃣ VALIDATION SCHEMA: ZOD PATTERNS

### A. Order Validator Deep Dive

**File: src/validators/order.validator.ts**

```typescript
// ================================================
// Schema 1: Order Items (Line-by-line breakdown)
// ================================================
export const orderItemSchema = z.object({
  productId: z.string()
    .uuid('Product ID harus valid UUID'),           // Must be UUID format
  quantity: z.number()
    .int('Harus integer')
    .positive('Jumlah harus lebih dari 0'),         // Must be > 0
  price: z.number()
    .positive('Harga harus lebih dari 0'),          // Must be > 0
  discount: z.number()
    .min(0)
    .optional(),                                     // 0 or more, optional
});
// Type: { productId: string, quantity: number, price: number, discount?: number }

// ================================================
// Schema 2: Create Order (Incoming Request)
// ================================================
export const createOrderSchema = z.object({
  customerId: z.string()
    .uuid()
    .optional(),                                     // Can be anonymous
  memberId: z.string()
    .uuid()
    .optional(),                                     // Member discount
  temporaryCustomerName: z.string()
    .optional(),                                     // For walk-in customers
  outletId: z.string()
    .uuid()
    .optional(),                                     // Let service use req.permissions.assignedStoreId
  items: z.array(orderItemSchema)
    .min(1, 'Minimal 1 item diperlukan'),          // At least 1 item required
  discount: z.number()
    .min(0)
    .default(0),                                    // Rounding discount, default 0
  sendToKitchen: z.boolean()
    .default(false),                                // Only for restaurants
  notes: z.string()
    .optional(),                                    // Order notes
});

// ================================================
// Schema 3: Update Order Status
// ================================================
export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'CANCELLED',
    'REFUNDED'
  ]),
});
// Allowed transitions: PENDING → PROCESSING → COMPLETED

// ================================================
// Schema 4: Get Orders Query (Filtering)
// ================================================
export const getOrdersQuerySchema = z.object({
  page: z.string()
    .transform(Number)                              // Convert "1" to 1
    .pipe(z.number()
      .int()
      .positive())
    .default('1'),
  limit: z.string()
    .transform(Number)
    .pipe(z.number()
      .int()
      .positive()
      .max(100))                                    // Max 100 per page
    .default('10'),
  status: z.enum([...])
    .optional(),
  customerId: z.string()
    .uuid()
    .optional(),
  outletId: z.string()
    .uuid()
    .optional(),
  startDate: z.string()
    .optional(),                                    // YYYY-MM-DD or datetime
  endDate: z.string()
    .optional(),
  sortBy: z.enum(['createdAt', 'total', 'orderNumber'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc'])
    .default('desc'),
  tenantId: z.string()
    .optional(),                                    // For SUPER_ADMIN only
}).passthrough();                                   // Allow extra params (sendToKitchen, kitchenStatus)
```

### B. Outlet Validator

**File: src/validators/outlet.validator.ts (implied from service)**

```typescript
// Custom validation in OutletService itself (not Zod):
OutletValidation = {
  validateName(name): string {
    // 3-100 chars, required
  },
  
  validatePhone(phone): string | undefined {
    // Must match: /^[\d\s\-+()]+$/
    // Max 20 chars
  },
  
  validateAddress(address): string | undefined {
    // Max 500 chars
  },
  
  validateShiftConfig(config): Array<{ name, startTime, endTime }> {
    // Each shift:
    //   - name: 2-50 chars
    //   - startTime, endTime: HH:MM format
    //   - Max 24 shifts per day
  },
  
  validateOperatingHours(hours): Object {
    // Keys must be: senin, selasa, rabu, kamis, jumat, sabtu, minggu
    // Values: { open: "HH:MM", close: "HH:MM", isOpen: boolean }
    // If isOpen=false, time fields can be omitted
  }
}
```

---

## 8️⃣ CROSS-SERVICE DEPENDENCIES (Hidden Connections)

### A. Create Order - Complete Call Chain

```
POST /api/orders
  ↓
middleware: authGuard
  └─ Validates JWT, loads user data
     └─ Populates: req.userId, req.tenantId, req.role, req.user
  ↓
middleware: roleGuard('ADMIN_TENANT', 'SUPERVISOR', 'CASHIER', 'KITCHEN')
  └─ Checks: req.role in the allowed list
  ↓
middleware: supervisorStoreGuard()
  └─ If SUPERVISOR: validates storeId in allowedStoreIds
  ↓
middleware: subscriptionGuard
  └─ Checks: Tenant.subscriptionPlan is active + not expired
  ↓
middleware: validate({ body: createOrderSchema })
  └─ Validates: customerId (UUID), items[], discount ≥ 0, etc.
  ↓
handler: asyncHandler(async (req, res) => {
  const tenantId = requireTenantId(req)
  const { items, customerId, memberId, outletId, discount, sendToKitchen } = req.body
  
  ↓
  // Service call #1: Create order
  const order = await OrderService.createOrder(
    { items, customerId, memberId, outletId, discount, sendToKitchen },
    userId: req.userId,
    tenantId: req.tenantId
  )
  
  ↓
  // Inside OrderService.createOrder():
  
  // Check #1: CASHIER must have active shift
  if (userRole === 'CASHIER') {
    const hasActiveShift = await CashShiftService.hasActiveShift(tenantId, userId)
    if (!hasActiveShift) throw new Error('...')
  }
  
  // Check #2: Validate items exist
  for (const item of items) {
    const product = await prisma.product.findUnique({ id: item.productId })
    if (!product) throw new Error('Product not found')
  }
  
  // Update #1: Reduce stock for each product
  for (const item of items) {
    await ProductService.updateStock(
      productId: item.productId,
      quantity: -item.quantity,  // Subtract
      operation: 'subtract'
    )
  }
  
  // Update #2: Create transaction record if payment provided
  if (data.paymentMethod) {
    const transaction = await TransactionService.createTransaction({
      orderId: order.id,
      method: data.paymentMethod,
      amount: order.total
    })
  }
  
  // Create #1: Save order to database
  const savedOrder = await prisma.order.create({
    data: {
      tenantId,
      userId,
      customerId: customerId || null,
      memberId: memberId || null,
      outletId: outletId || req.permissions?.assignedStoreId,
      status: 'PENDING',
      items: { create: [...] },
      total: calculateTotal(items, discount),
      sendToKitchen,
      createdAt: new Date()
    },
    include: { items: { include: { product: true } }, customer: true }
  })
  
  ↓
  // Return to client
  res.json(savedOrder)
})
```

### B. Service Dependency Graph (Visual)

```
                         OrderService
                              |
                 ┌────────────┼────────────┐
                 ↓            ↓            ↓
           ProductService CashShiftService TransactionService
                           |               |
                 prisma.product          prisma.transaction


                    OutletService
                         |
                   prisma.outlet


                     UserService
                         |
                    prisma.user
                    (permissions JSON)


All Services → RedisClient (caching)
All Services → Logger (audit trail)
All Services → PrismaClient (database)
```

---

## 9️⃣ BREAKING CHANGES: DETAILED IMPACT ANALYSIS

### A. Store Access Control (HIGH IMPACT)

| Change | OLD Behavior | NEW Behavior | Impact |
|--------|-------------|-------------|--------|
| **SUPERVISOR** GET /orders | See all orders | See only from allowedStoreIds | 🔴 Breaking |
| **SUPERVISOR** GET /orders?storeId=X | See all | If storeId not in allowedStoreIds → 403 | 🔴 Breaking |
| **CASHIER** GET /orders | See all | See only assignedStoreId | 🔴 Breaking |
| **KITCHEN** GET /orders | See all | See only sendToKitchen=true + assignedStoreId | 🔴 Breaking |

### B. Client Affected Scenarios

**Scenario 1: Supervisor with 2 stores**
```
User: SUPERVISOR
allowedStoreIds: ['outlet-1', 'outlet-2']

OLD:
  GET /api/orders
  → Returns 500 orders from all outlets

NEW:
  GET /api/orders
  → Returns 120 orders from outlet-1 and outlet-2 only
  → Older integration expecting all orders BREAKS
```

**Scenario 2: Cashier trying cross-store**
```
User: CASHIER
assignedStoreId: 'outlet-1'

OLD:
  GET /api/orders?outletId=outlet-3
  → Returns 50 orders from outlet-3

NEW:
  GET /api/orders?outletId=outlet-3
  → Returns 403 Forbidden (outlet-3 not assigned)
  → Client app shows "Access Denied" to cashier
```

**Scenario 3: Kitchen staff**
```
User: KITCHEN
assignedStoreId: 'outlet-2'
sendToKitchen: true orders only

OLD:
  GET /api/orders
  → Returns ALL orders for outlet-2

NEW:
  GET /api/orders
  → Returns only orders with sendToKitchen=true from outlet-2
  → Kitchen display apps might break if they filter client-side
```

---

## 🔟 AUDIT & SECURITY IMPLICATIONS

### A. Permission Checking Locations

1. **JWT Decoding** (auth.ts)
   - Extracts: userId, tenantId, role
   - Loads user with permissions

2. **Role Guards** (auth.ts roleGuard)
   - Verifies user.role in specified list

3. **Supervisor Guard** (supervisor-store-guard.ts)
   - Validates storeId in allowedStoreIds

4. **Service Layer** (order.service.ts)
   - Replicates store filters in getOrders()
   - **CRITICAL:** Service layer ALSO filters even if middleware is bypassed

### B. Defense in Depth

```
Request with malicious intent:
  GET /api/orders?storeId=outlet-hacked&page=1

Layer 1: supervisorStoreGuard middleware
  └─ Checks: outlet-hacked in allowedStoreIds
  └─ Result: 403 Forbidden ✓

If middleware is bypassed (hypothetically):
Layer 2: OrderService.getOrders() method
  └─ Applies outletFilter = { outletId: { in: allowedStoreIds } }
  └─ Result: No orders from outlet-hacked returned ✓

If service is called directly:
Layer 3: Database query WHERE clause
  └─ Filters: WHERE tenantId = X and outletId in (allowed)
  └─ Result: Database physically enforces tenant isolation ✓
```

---

## RINGKASAN TEKNIS

| Aspek | Status | Detail |
|-------|--------|--------|
| **Store Access Control** | ⚠️ CRITICAL | 3 layers: Middleware + Service + Database |
| **Permission Storage** | User.permissions JSON | Role-specific: allowedStoreIds or assignedStoreId |
| **Outlet Routes** | 🚨 3 NOT REGISTERED | .advanced, .search, .import-export = orphaned |
| **Orphaned Services** | 21 services | marketing, analytics, finance, etc. = dead code |
| **Error Handling** | ✅ IMPROVED | asyncHandler wrapper vs manual try-catch |
| **Validation** | ✅ CONSISTENT | Zod schemas + custom outlet validation |
| **Breaking Changes** | 🔴 3 Identified | SUPERVISOR/CASHIER/KITCHEN store filtering |
| **Performance** | ✅ Good | Proper indexes, parallel queries with Promise.all |
| **Security** | ✅ Defense in Depth | 3 layers of store access control |

