# PHASE 32.3: MULTI-TENANT DATA INTEGRITY AUDIT
## Database Tenant Isolation & Orphan Data Detection

**Date:** January 1, 2026  
**Phase:** 32.3 - Multi-Tenant SaaS Data Integrity Auditor  
**Status:** READY FOR EXECUTION

---

## EXECUTIVE SUMMARY

This document systematically audits ALL database tables to ensure:
1. **Tenant Isolation:** Every multi-tenant table has proper tenant_id enforcement
2. **Data Integrity:** No orphan records or cross-tenant joins
3. **Constraint Enforcement:** Foreign keys and unique constraints working correctly
4. **Query Safety:** No queries bypass tenant isolation

---

## TABLE AUDIT TEMPLATE

For each table, verify:
```
TABLE: [table_name]
├── Is Multi-Tenant? [YES/NO]
├── Tenant Column: [tenant_id / parent_id]
├── Isolation Points:
│   ├── Query Level: [WITH tenant filter]
│   ├── ORM Level: [Prisma.table.findMany({where: {tenant_id}})]
│   └── Middleware: [authMiddleware enforces context]
├── Constraints:
│   ├── Primary Key: [id]
│   ├── Foreign Keys: [references]
│   └── Unique: [columns]
├── Verification Queries: [SQL to verify isolation]
└── Status: [PASS/FAIL]
```

---

## SECTION 1: CORE ENTITIES

### 1.1 TABLE: `tenants`

```
TABLE: tenants (GLOBAL - No tenant_id needed)
├── Is Multi-Tenant? NO (this is the tenant record itself)
├── Primary Key: id
├── Columns:
│   ├── id (UUID)
│   ├── name (VARCHAR 255)
│   ├── tax_id (VARCHAR 50) [UNIQUE]
│   ├── phone (VARCHAR 20)
│   ├── address (TEXT)
│   ├── is_active (BOOLEAN)
│   ├── created_at (TIMESTAMP)
│   └── updated_at (TIMESTAMP)
├── Foreign Keys: NONE
├── Unique Constraints:
│   └── UNIQUE(tax_id)
├── Verification Query:
SELECT COUNT(*) FROM tenants WHERE tax_id IS NOT NULL;
-- All non-null tax_ids should be unique

├── Test Case 1.1.1: Duplicate tax_id
curl -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tenant B",
    "taxId": "TAX123" -- Same as existing Tenant A
  }'
Expected: 409 Conflict - "Tax ID already registered"
Status: [ ]

├── Test Case 1.1.2: Create tenant with same name
Expected: ALLOWED (names can be same, tax_id is unique)
Status: [ ]

└── Status: [ ] PASS / [ ] FAIL
```

### 1.2 TABLE: `users`

```
TABLE: users (MULTI-TENANT)
├── Is Multi-Tenant? YES
├── Tenant Column: tenant_id (NULLABLE for Super Admin)
├── Columns:
│   ├── id (UUID)
│   ├── email (VARCHAR 255) [UNIQUE]
│   ├── password_hash (VARCHAR 255)
│   ├── name (VARCHAR 255)
│   ├── role (ENUM: SUPER_ADMIN, ADMIN, STAFF)
│   ├── tenant_id (UUID) [FK → tenants.id, NULLABLE]
│   ├── is_active (BOOLEAN)
│   ├── last_login (TIMESTAMP)
│   ├── created_at (TIMESTAMP)
│   └── updated_at (TIMESTAMP)
├── Foreign Keys:
│   └── tenant_id → tenants.id (OPTIONAL for SUPER_ADMIN)
├── Unique Constraints:
│   └── UNIQUE(email) -- Global uniqueness
├── Indexes:
│   ├── tenant_id (for fast filtering)
│   └── email (for login)

├── CRITICAL RULES:
│   ├── SUPER_ADMIN: tenant_id = NULL
│   ├── ADMIN: tenant_id = NOT NULL
│   └── STAFF: tenant_id = NOT NULL

├── Verification Queries:
-- 1. Check for orphan users (tenant_id references non-existent tenant)
SELECT u.id, u.email, u.tenant_id 
FROM users u 
LEFT JOIN tenants t ON u.tenant_id = t.id 
WHERE u.tenant_id IS NOT NULL AND t.id IS NULL;
-- Expected: Empty result set

-- 2. Check admins without tenant_id
SELECT id, email, role 
FROM users 
WHERE role IN ('ADMIN', 'STAFF') AND tenant_id IS NULL;
-- Expected: Empty result set (only SUPER_ADMIN can be null)

-- 3. Check all queries enforce tenant isolation in ORM
SELECT COUNT(*) FROM users WHERE tenant_id = 'tenant123';
-- Every query should include this filter

├── Test Case 1.2.1: Create user with non-existent tenant_id
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "name": "Test User",
    "role": "STAFF",
    "tenantId": "nonexistent-tenant-id"
  }'
Expected: 404 Not Found - "Tenant not found"
OR: Foreign key constraint violation
Status: [ ]

├── Test Case 1.2.2: Admin A creates user, should belong to Admin A's tenant
Expected: user.tenant_id = Admin A's tenant_id
Status: [ ]

├── Test Case 1.2.3: Staff tries to create user (outside own outlet)
Expected: 403 Forbidden - "Only admins can create users"
Status: [ ]

├── Test Case 1.2.4: Query all users (should be tenant-scoped)
GET /api/users
Expected: Returns only users in current user's tenant
If Super Admin: Returns all users
Status: [ ]

└── Status: [ ] PASS / [ ] FAIL
```

### 1.3 TABLE: `outlets`

```
TABLE: outlets (MULTI-TENANT)
├── Is Multi-Tenant? YES
├── Tenant Column: tenant_id (NOT NULL, FK)
├── Columns:
│   ├── id (UUID)
│   ├── tenant_id (UUID) [FK → tenants.id, NOT NULL]
│   ├── name (VARCHAR 255)
│   ├── address (TEXT)
│   ├── city (VARCHAR 100)
│   ├── phone (VARCHAR 20)
│   ├── email (VARCHAR 255)
│   ├── open_time (TIME)
│   ├── close_time (TIME)
│   ├── is_active (BOOLEAN)
│   ├── is_deleted (BOOLEAN)
│   ├── deleted_at (TIMESTAMP)
│   ├── created_at (TIMESTAMP)
│   └── updated_at (TIMESTAMP)
├── Foreign Keys:
│   └── tenant_id → tenants.id (NOT NULL, CASCADE DELETE if needed)
├── Indexes:
│   ├── tenant_id (critical for filtering)
│   └── (tenant_id, is_deleted) [composite for queries]
├── Unique Constraints:
│   └── UNIQUE(tenant_id, name) -- Name unique per tenant only

├── Verification Queries:
-- 1. Orphan outlets
SELECT o.id, o.tenant_id 
FROM outlets o 
LEFT JOIN tenants t ON o.tenant_id = t.id 
WHERE t.id IS NULL;
-- Expected: Empty

-- 2. Outlets with NULL tenant_id
SELECT id FROM outlets WHERE tenant_id IS NULL;
-- Expected: Empty

-- 3. Verify soft-delete pattern
SELECT COUNT(*) FROM outlets WHERE is_deleted = true;
-- All soft-deleted should have deleted_at timestamp

-- 4. Cross-tenant isolation
SELECT COUNT(*) FROM outlets 
WHERE tenant_id = 'tenant_a' AND id IN (
  SELECT outlet_id FROM transactions 
  WHERE EXISTS (
    SELECT 1 FROM outlets o2 
    WHERE o2.id = outlet_id AND o2.tenant_id != 'tenant_a'
  )
);
-- Expected: 0 (no cross-tenant relationships)

├── Test Case 1.3.1: Soft-delete outlet
DELETE FROM outlets WHERE id = 'outlet123';
-- Should be soft-delete: is_deleted=true, deleted_at=NOW()
SELECT * FROM outlets WHERE id = 'outlet123';
Expected: Record exists with is_deleted=true, not actually deleted
Status: [ ]

├── Test Case 1.3.2: Staff A accesses Outlet from different tenant
GET /api/outlets/outlet_tenant_b
Expected: 404 Not Found or 403 Forbidden
Actual outlet still exists in DB, but staff shouldn't see it
Status: [ ]

├── Test Case 1.3.3: Unique name per tenant
Tenant A: Create "Main Outlet"
Tenant B: Create "Main Outlet" (same name)
Expected: ALLOWED (names are unique per tenant, not globally)
Status: [ ]

└── Status: [ ] PASS / [ ] FAIL
```

---

## SECTION 2: TRANSACTION ENTITIES

### 2.1 TABLE: `transactions`

```
TABLE: transactions (MULTI-TENANT)
├── Is Multi-Tenant? YES
├── Tenant Column: tenant_id (NOT NULL, FK)
├── Columns:
│   ├── id (UUID)
│   ├── tenant_id (UUID) [FK → tenants.id, NOT NULL]
│   ├── outlet_id (UUID) [FK → outlets.id, NOT NULL]
│   ├── user_id (UUID) [FK → users.id, NULLABLE]
│   ├── amount (DECIMAL 10,2)
│   ├── discount (DECIMAL 10,2)
│   ├── tax (DECIMAL 10,2)
│   ├── payment_method (ENUM: CASH, CARD, TRANSFER, CHECK)
│   ├── status (ENUM: PENDING, COMPLETED, CANCELLED)
│   ├── notes (TEXT)
│   ├── created_at (TIMESTAMP)
│   └── updated_at (TIMESTAMP)
├── Foreign Keys:
│   ├── tenant_id → tenants.id (NOT NULL)
│   ├── outlet_id → outlets.id (NOT NULL)
│   └── user_id → users.id (NULLABLE)
├── Indexes:
│   ├── tenant_id
│   ├── outlet_id
│   ├── (tenant_id, created_at) [for analytics]
│   └── (outlet_id, status)

├── CRITICAL RULES:
│   ├── outlet_id MUST belong to tenant_id
│   ├── user_id (if present) MUST belong to tenant_id
│   └── Every query MUST filter by tenant_id

├── Verification Queries:
-- 1. Transactions with invalid outlet (outlet belongs to different tenant)
SELECT t.id, t.tenant_id, o.tenant_id as outlet_tenant
FROM transactions t 
JOIN outlets o ON t.outlet_id = o.id 
WHERE t.tenant_id != o.tenant_id;
-- Expected: Empty

-- 2. Transactions with user from different tenant
SELECT t.id, t.tenant_id, u.tenant_id as user_tenant
FROM transactions t 
JOIN users u ON t.user_id = u.id 
WHERE t.tenant_id != u.tenant_id AND u.role != 'SUPER_ADMIN';
-- Expected: Empty

-- 3. Orphan transactions (outlet deleted)
SELECT t.id FROM transactions t 
WHERE outlet_id IN (
  SELECT id FROM outlets WHERE is_deleted = true
);
-- Expected: Define behavior (cascade soft-delete or restrict)

├── Test Case 2.1.1: Create transaction with outlet from different tenant
Tenant A Admin, outlet = Outlet B (from Tenant B)
Expected: 403 Forbidden or 404 Not Found
Status: [ ]

├── Test Case 2.1.2: Transaction.outlet_id constraint
INSERT INTO transactions (tenant_id, outlet_id, amount, ...) 
VALUES ('tenant_a', 'outlet_b', 100000, ...)
Where outlet_b.tenant_id = 'tenant_b'
Expected: Foreign key constraint violation OR app-level validation error
Status: [ ]

├── Test Case 2.1.3: Query transactions list (should be tenant-scoped)
GET /api/transactions
Expected: Returns only transactions for current user's tenant
Status: [ ]

└── Status: [ ] PASS / [ ] FAIL
```

### 2.2 TABLE: `transaction_items`

```
TABLE: transaction_items (MULTI-TENANT through transactions)
├── Is Multi-Tenant? YES (via transaction_id → tenant_id)
├── Tenant Column: DERIVED from transaction.tenant_id
├── Columns:
│   ├── id (UUID)
│   ├── transaction_id (UUID) [FK → transactions.id, NOT NULL]
│   ├── item_id (UUID) [FK → items.id, NOT NULL]
│   ├── quantity (INT)
│   ├── unit_price (DECIMAL 10,2)
│   ├── discount_percentage (DECIMAL 5,2)
│   ├── line_total (DECIMAL 10,2)
│   ├── created_at (TIMESTAMP)
│   └── updated_at (TIMESTAMP)
├── Foreign Keys:
│   ├── transaction_id → transactions.id (CASCADE DELETE)
│   └── item_id → items.id (NOT NULL)

├── Verification Queries:
-- 1. Orphan transaction items (transaction deleted)
SELECT ti.id FROM transaction_items ti 
WHERE transaction_id NOT IN (
  SELECT id FROM transactions
);
-- Expected: Empty (CASCADE DELETE should handle)

-- 2. Items from different tenant
SELECT ti.id, t.tenant_id, i.tenant_id
FROM transaction_items ti 
JOIN transactions t ON ti.transaction_id = t.id 
JOIN items i ON ti.item_id = i.id 
WHERE t.tenant_id != i.tenant_id;
-- Expected: Empty

├── Test Case 2.2.1: Add item from different tenant to transaction
transaction.tenant_id = 'tenant_a'
item.tenant_id = 'tenant_b'
Expected: 403 Forbidden or constraint violation
Status: [ ]

├── Test Case 2.2.2: Delete transaction → items should cascade delete
DELETE FROM transactions WHERE id = 'trans123';
SELECT * FROM transaction_items WHERE transaction_id = 'trans123';
Expected: Empty (all items deleted)
Status: [ ]

└── Status: [ ] PASS / [ ] FAIL
```

---

## SECTION 3: INVENTORY ENTITIES

### 3.1 TABLE: `items`

```
TABLE: items (MULTI-TENANT)
├── Is Multi-Tenant? YES
├── Tenant Column: tenant_id (NOT NULL, FK)
├── Columns:
│   ├── id (UUID)
│   ├── tenant_id (UUID) [FK → tenants.id, NOT NULL]
│   ├── sku (VARCHAR 100)
│   ├── name (VARCHAR 255)
│   ├── description (TEXT)
│   ├── category_id (UUID) [FK → item_categories.id]
│   ├── base_price (DECIMAL 10,2)
│   ├── cost_price (DECIMAL 10,2)
│   ├── quantity (INT)
│   ├── reorder_level (INT)
│   ├── is_active (BOOLEAN)
│   ├── created_at (TIMESTAMP)
│   └── updated_at (TIMESTAMP)
├── Foreign Keys:
│   ├── tenant_id → tenants.id (NOT NULL)
│   └── category_id → item_categories.id (NULLABLE, RESTRICT DELETE)
├── Unique Constraints:
│   └── UNIQUE(tenant_id, sku)

├── Verification Queries:
-- 1. Items with non-existent tenant
SELECT i.id FROM items i 
WHERE tenant_id NOT IN (SELECT id FROM tenants);
-- Expected: Empty

-- 2. Items from different tenant in same transaction
SELECT COUNT(*) FROM (
  SELECT DISTINCT ti.item_id, t.tenant_id 
  FROM transaction_items ti 
  JOIN transactions t ON ti.transaction_id = t.id 
  JOIN items i ON ti.item_id = i.id 
  WHERE t.tenant_id != i.tenant_id
);
-- Expected: 0

├── Test Case 3.1.1: Create item with category from different tenant
item.tenant_id = 'tenant_a'
category.tenant_id = 'tenant_b'
Expected: 403 Forbidden or constraint violation
Status: [ ]

├── Test Case 3.1.2: Duplicate SKU within same tenant
Tenant A: Item 1 SKU = "SKU001"
Tenant A: Create Item 2 SKU = "SKU001" (same)
Expected: 409 Conflict - "SKU already exists"
Status: [ ]

├── Test Case 3.1.3: Same SKU in different tenants is ALLOWED
Tenant A: Item SKU = "SKU001"
Tenant B: Item SKU = "SKU001"
Expected: ALLOWED (unique per tenant, not global)
Status: [ ]

└── Status: [ ] PASS / [ ] FAIL
```

### 3.2 TABLE: `item_categories`

```
TABLE: item_categories (MULTI-TENANT)
├── Is Multi-Tenant? YES
├── Tenant Column: tenant_id (NOT NULL, FK)
├── Columns:
│   ├── id (UUID)
│   ├── tenant_id (UUID) [FK → tenants.id, NOT NULL]
│   ├── name (VARCHAR 255)
│   ├── description (TEXT)
│   ├── is_active (BOOLEAN)
│   ├── created_at (TIMESTAMP)
│   └── updated_at (TIMESTAMP)
├── Foreign Keys:
│   └── tenant_id → tenants.id (NOT NULL)
├── Unique Constraints:
│   └── UNIQUE(tenant_id, name)

├── Verification Queries:
-- 1. Items referencing category from different tenant
SELECT it.id FROM items it 
WHERE it.category_id IN (
  SELECT ic.id FROM item_categories ic 
  WHERE ic.tenant_id != it.tenant_id
);
-- Expected: Empty

├── Test Case 3.2.1: Delete category with active items
DELETE FROM item_categories WHERE id = 'cat123';
Expected: 
- Option 1: RESTRICT - "Cannot delete, has items"
- Option 2: PARENT DELETE must also cascade items
Status: [ ]

└── Status: [ ] PASS / [ ] FAIL
```

---

## SECTION 4: STAFF & OUTLET ASSIGNMENT

### 4.1 TABLE: `staff_outlet_assignments`

```
TABLE: staff_outlet_assignments (MULTI-TENANT through both sides)
├── Is Multi-Tenant? YES (via staff_id and outlet_id)
├── Columns:
│   ├── id (UUID)
│   ├── staff_id (UUID) [FK → users.id, NOT NULL]
│   ├── outlet_id (UUID) [FK → outlets.id, NOT NULL]
│   ├── assigned_at (TIMESTAMP)
│   └── unassigned_at (TIMESTAMP, NULLABLE)
├── Foreign Keys:
│   ├── staff_id → users.id (CASCADE DELETE)
│   └── outlet_id → outlets.id (CASCADE DELETE)
├── Unique Constraints:
│   └── UNIQUE(staff_id, outlet_id)

├── CRITICAL RULES:
│   ├── user (staff_id).tenant_id MUST = outlet.tenant_id
│   └── Unassigned staff cannot work at outlet

├── Verification Queries:
-- 1. Cross-tenant assignments
SELECT sa.id, u.tenant_id as staff_tenant, o.tenant_id as outlet_tenant
FROM staff_outlet_assignments sa 
JOIN users u ON sa.staff_id = u.id 
JOIN outlets o ON sa.outlet_id = o.id 
WHERE u.tenant_id != o.tenant_id;
-- Expected: Empty

-- 2. Unassigned staff with recent transactions
SELECT DISTINCT sa.staff_id 
FROM transactions t 
WHERE t.user_id = sa.staff_id 
AND sa.unassigned_at < t.created_at;
-- Expected: Empty (transaction after unassignment)

├── Test Case 4.1.1: Assign staff from different tenant to outlet
staff.tenant_id = 'tenant_a'
outlet.tenant_id = 'tenant_b'
Expected: 403 Forbidden or constraint violation
Status: [ ]

├── Test Case 4.1.2: Unassign staff, try to create transaction at that outlet
unassigned_at = BEFORE transaction.created_at
Expected: 403 Forbidden - "Staff not assigned"
OR: Transaction succeeds (depends on business logic)
Status: [ ]

└── Status: [ ] PASS / [ ] FAIL
```

---

## SECTION 5: SYSTEM ENTITIES (Non-Multi-Tenant)

### 5.1 TABLE: `audit_logs`

```
TABLE: audit_logs (GLOBAL - for system auditing)
├── Is Multi-Tenant? SEMI - logs all actions but filtered by tenant
├── Columns:
│   ├── id (UUID)
│   ├── tenant_id (UUID) [FK → tenants.id, NULLABLE for system events]
│   ├── user_id (UUID) [FK → users.id, NULLABLE]
│   ├── entity_type (VARCHAR 50) [outlets, users, transactions]
│   ├── entity_id (UUID)
│   ├── action (ENUM: CREATE, UPDATE, DELETE, VIEW)
│   ├── old_values (JSONB, NULLABLE)
│   ├── new_values (JSONB)
│   ├── ip_address (VARCHAR 50)
│   ├── user_agent (TEXT)
│   ├── created_at (TIMESTAMP)
│   └── [more audit columns]
├── Foreign Keys:
│   ├── tenant_id → tenants.id (OPTIONAL for system events)
│   └── user_id → users.id (OPTIONAL for background jobs)

├── Verification Queries:
-- 1. Ensure audit logs capture all entity changes
SELECT COUNT(*) FROM audit_logs 
WHERE entity_type = 'outlets' AND tenant_id IS NULL;
-- Outlet changes should always have tenant_id

-- 2. Verify sensitive data not logged in plain text
SELECT COUNT(*) FROM audit_logs 
WHERE new_values LIKE '%password%' 
OR new_values LIKE '%token%';
-- Expected: 0 (passwords/tokens should be hashed/redacted)

├── Test Case 5.1.1: Create transaction, verify audit log
CREATE transaction → Check audit_logs table
Expected:
- action = 'CREATE'
- entity_type = 'transactions'
- new_values contains transaction data
- old_values is NULL
Status: [ ]

├── Test Case 5.1.2: Update outlet, check before/after in audit
UPDATE outlet name → Check audit_logs
Expected:
- old_values = {name: "Old Name", ...}
- new_values = {name: "New Name", ...}
- Allows rollback if needed
Status: [ ]

└── Status: [ ] PASS / [ ] FAIL
```

---

## SECTION 6: ORPHAN DATA DETECTION

### 6.1 Query Orphan Records Script

```sql
-- RUN THIS QUERY TO FIND ALL ORPHAN DATA

-- 1. Users with non-existent tenant
SELECT 'USER' as entity_type, u.id, u.tenant_id 
FROM users u 
LEFT JOIN tenants t ON u.tenant_id = t.id 
WHERE u.tenant_id IS NOT NULL AND t.id IS NULL;

-- 2. Outlets with non-existent tenant
SELECT 'OUTLET', o.id, o.tenant_id 
FROM outlets o 
LEFT JOIN tenants t ON o.tenant_id = t.id 
WHERE t.id IS NULL;

-- 3. Transactions with non-existent outlet
SELECT 'TRANSACTION', t.id, t.outlet_id 
FROM transactions t 
LEFT JOIN outlets o ON t.outlet_id = o.id 
WHERE o.id IS NULL;

-- 4. Transaction items with non-existent transaction
SELECT 'TRANSACTION_ITEM', ti.id, ti.transaction_id 
FROM transaction_items ti 
LEFT JOIN transactions t ON ti.transaction_id = t.id 
WHERE t.id IS NULL;

-- 5. Items with non-existent tenant
SELECT 'ITEM', i.id, i.tenant_id 
FROM items i 
LEFT JOIN tenants t ON i.tenant_id = t.id 
WHERE t.id IS NULL;

-- 6. Items with category from different tenant
SELECT 'ITEM_CATEGORY_MISMATCH', i.id, i.tenant_id, ic.tenant_id 
FROM items i 
JOIN item_categories ic ON i.category_id = ic.id 
WHERE i.tenant_id != ic.tenant_id;

-- 7. Staff assignments cross-tenant
SELECT 'STAFF_OUTLET_MISMATCH', sa.id, u.tenant_id, o.tenant_id 
FROM staff_outlet_assignments sa 
JOIN users u ON sa.staff_id = u.id 
JOIN outlets o ON sa.outlet_id = o.id 
WHERE u.tenant_id != o.tenant_id;

-- 8. Transactions with items from different tenant
SELECT 'TRANSACTION_ITEM_TENANT', ti.id, t.tenant_id, i.tenant_id 
FROM transaction_items ti 
JOIN transactions t ON ti.transaction_id = t.id 
JOIN items i ON ti.item_id = i.id 
WHERE t.tenant_id != i.tenant_id;
```

**Test Case 6.1.1: Run orphan detection script**
```bash
# Execute the orphan detection query above
Expected: All result sets are EMPTY
Actual: [TO BE TESTED]
Status: [ ]

If any orphans found:
- Document which entity types have orphans
- Determine cause (cascade delete failure, etc.)
- Fix with appropriate DELETE or UPDATE statement
```

---

## SECTION 7: CONSTRAINT VERIFICATION

### 7.1 Test Foreign Key Constraints

```bash
# Test Case 7.1.1: Violate outlet.tenant_id constraint
INSERT INTO outlets (id, tenant_id, name, address) 
VALUES ('out123', 'nonexistent-tenant', 'Test', 'Addr');

Expected: 
FOREIGN KEY constraint violation
Error: "invalid tenant_id"

Actual: [ ]
Status: [ ]
```

### 7.2 Test Unique Constraints

```bash
# Test Case 7.2.1: Duplicate tax_id
INSERT INTO tenants (id, name, tax_id) 
VALUES ('t2', 'Tenant 2', 'TAX001');
-- Where 'TAX001' already exists in another tenant

Expected: UNIQUE constraint violation
Error: "duplicate key value violates unique constraint"

Actual: [ ]
Status: [ ]
```

---

## SECTION 8: ISOLATION VERIFICATION (Code Level)

### 8.1 Check All Queries Use Tenant Filter

**Search codebase for:**
```typescript
// BAD - No tenant filter
const outlets = await prisma.outlets.findMany();

// GOOD - Tenant filter enforced
const outlets = await prisma.outlets.findMany({
  where: {
    tenant_id: userContext.tenant_id
  }
});

// GOOD - Middleware enforces tenant context
@UseGuards(AuthGuard, TenantGuard)
async getOutlets(@TenantContext() tenant_id) {
  // tenant_id comes from middleware
}
```

**Test Case 8.1.1: Code audit for missing tenant filters**
```bash
# Search for unfiltered queries
grep -r "findMany()" src/ | grep -v "tenant"
grep -r "findUnique()" src/ | grep -v "tenant"
grep -r "findFirst()" src/ | grep -v "tenant"

Expected: Very few results, all should be legitimate (Super Admin operations)
Actual: [ ]
Status: [ ]
```

---

## SECTION 9: SUMMARY & FINDINGS

### Critical Issues Found:
- [ ] Issue 1: Orphan records in [table_name]
  - Type: [Missing FK, Missing tenant_id, etc.]
  - Impact: [Data integrity risk]
  - Fix: [SQL/ORM fix]

- [ ] Issue 2: [Description]
- [ ] Issue 3: [Description]

### High Priority Violations:
- [ ] Cross-tenant join detected in [table_name]
- [ ] Query without tenant filter in [file.ts]
- [ ] Soft-delete not properly handled

### Data Integrity Status:
- [ ] Orphan records: PASS / FAIL
- [ ] Cross-tenant isolation: PASS / FAIL
- [ ] Foreign key constraints: PASS / FAIL
- [ ] Unique constraints: PASS / FAIL
- [ ] Cascade delete behavior: PASS / FAIL
- [ ] Query-level tenant filtering: PASS / FAIL

### Recommendations:
1. [Fix 1]
2. [Fix 2]
3. [Fix 3]

---

**Audit Date:** [To be filled]  
**Status:** Ready for Execution  
**Auditor:** Automated Prisma + SQL Verification
