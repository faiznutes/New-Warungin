# Phase 32: QA Test Execution Runner

**Status**: EXECUTION START  
**Date**: 2024  
**Target**: Production-ready validation via failure-driven testing framework

---

## 1. QA Test Execution Overview

### 1.1 Test Categories (5 Main)
```
┌─────────────────────────────────────────────────────────┐
│          PHASE 32 QA TESTING FRAMEWORK                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. FAILURE-DRIVEN TESTING                              │
│     • Invalid payloads                                  │
│     • Missing required fields                           │
│     • Type mismatches                                   │
│     • Expired sessions                                  │
│     • Network failures                                  │
│                                                          │
│  2. UI INTERACTION AUDIT                                │
│     • Button functionality mapping                      │
│     • Dead element detection                            │
│     • Role-based visibility                             │
│     • Form validation                                   │
│     • Tab accessibility                                 │
│                                                          │
│  3. MULTI-TENANT DATA INTEGRITY                         │
│     • Tenant-id enforcement                             │
│     • Cross-tenant isolation                            │
│     • Orphan data detection                             │
│     • Query-level scoping                               │
│     • API-level validation                              │
│                                                          │
│  4. STATE MACHINE AUDIT                                 │
│     • Store CRUD state transitions                      │
│     • Tenant assignment workflows                       │
│     • POS transaction flows                             │
│     • User authentication states                        │
│     • Session management                                │
│                                                          │
│  5. SECURITY EXPLOITS MATRIX                            │
│     • Permission matrix validation                      │
│     • Privilege escalation attempts                     │
│     • Role bypass detection                             │
│     • API endpoint security                             │
│     • Data isolation verification                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Execution Prerequisites
```bash
# Required:
✅ Backend running on 192.168.1.101:3000
✅ PostgreSQL connected and running
✅ Redis cache operational
✅ Test database seeded with sample data
✅ Admin account created for authentication
✅ All endpoints accessible
```

---

## 2. Test Execution Matrix

### 2.1 Failure-Driven Testing Scenarios

#### Test Set F-001: Invalid Payload Tests
```
TEST: F-001-01 - Create Store with Empty Payload
├─ Endpoint: POST /api/stores
├─ Payload: {}
├─ Expected Response: 400 Bad Request
├─ Error Message: "Store name is required"
├─ Database State: No store created
├─ Status: [ ] PASS [ ] FAIL

TEST: F-001-02 - Create Store with Invalid Type
├─ Endpoint: POST /api/stores
├─ Payload: { name: 123 }
├─ Expected Response: 400 Bad Request
├─ Error Message: "Store name must be string"
├─ Database State: No store created
├─ Status: [ ] PASS [ ] FAIL

TEST: F-001-03 - Update Store with Invalid Phone
├─ Endpoint: PATCH /api/stores/{id}
├─ Payload: { phone: "invalid-phone" }
├─ Expected Response: 400 Bad Request
├─ Error Message: "Invalid phone format"
├─ Status: [ ] PASS [ ] FAIL

TEST: F-001-04 - Create Product with Negative Price
├─ Endpoint: POST /api/stores/{id}/products
├─ Payload: { name: "Product", price: -100 }
├─ Expected Response: 400 Bad Request
├─ Error Message: "Price must be positive"
├─ Status: [ ] PASS [ ] FAIL

TEST: F-001-05 - Create Transaction with Missing Items
├─ Endpoint: POST /api/transactions
├─ Payload: { storeId: "123", items: [] }
├─ Expected Response: 400 Bad Request
├─ Error Message: "Transaction must contain at least 1 item"
├─ Status: [ ] PASS [ ] FAIL
```

#### Test Set F-002: Missing Fields Tests
```
TEST: F-002-01 - Create Tenant Missing Name
├─ Endpoint: POST /api/tenants
├─ Payload: { email: "test@test.com", phone: "08123" }
├─ Expected Response: 400 Bad Request
├─ Error Message: "name is required"
├─ Status: [ ] PASS [ ] FAIL

TEST: F-002-02 - Create User Missing Email
├─ Endpoint: POST /api/users
├─ Payload: { name: "John", role: "admin" }
├─ Expected Response: 400 Bad Request
├─ Error Message: "email is required"
├─ Status: [ ] PASS [ ] FAIL

TEST: F-002-03 - Assign Store Missing Reason
├─ Endpoint: POST /api/stores/{id}/assign
├─ Payload: { tenantId: "123" }
├─ Expected Response: 400 Bad Request (if required)
├─ Error Message: Optional
├─ Status: [ ] PASS [ ] FAIL

TEST: F-002-04 - Create Category Missing Store Reference
├─ Endpoint: POST /api/categories
├─ Payload: { name: "Beverage", description: "Drinks" }
├─ Expected Response: 400 Bad Request
├─ Error Message: "storeId is required"
├─ Status: [ ] PASS [ ] FAIL

TEST: F-002-05 - Process Payment Missing Amount
├─ Endpoint: POST /api/transactions/{id}/payment
├─ Payload: { method: "cash" }
├─ Expected Response: 400 Bad Request
├─ Error Message: "amount is required"
├─ Status: [ ] PASS [ ] FAIL
```

#### Test Set F-003: Session Failure Tests
```
TEST: F-003-01 - Request with Expired Token
├─ Endpoint: GET /api/stores
├─ Headers: Authorization: Bearer {expired_token}
├─ Expected Response: 401 Unauthorized
├─ Error Message: "Token expired"
├─ Status: [ ] PASS [ ] FAIL

TEST: F-003-02 - Request with Invalid Token Format
├─ Endpoint: GET /api/stores
├─ Headers: Authorization: Bearer invalid_token
├─ Expected Response: 401 Unauthorized
├─ Error Message: "Invalid token"
├─ Status: [ ] PASS [ ] FAIL

TEST: F-003-03 - Request with Missing Token
├─ Endpoint: GET /api/stores
├─ Headers: (No Authorization header)
├─ Expected Response: 401 Unauthorized
├─ Error Message: "No token provided"
├─ Status: [ ] PASS [ ] FAIL

TEST: F-003-04 - Concurrent Session with Same User
├─ Scenario: Log in twice simultaneously
├─ Expected: Either new session invalidates old OR both valid
├─ Status: [ ] PASS [ ] FAIL

TEST: F-003-05 - Request After Session Logout
├─ Scenario: Log out, then make API call
├─ Expected Response: 401 Unauthorized
├─ Status: [ ] PASS [ ] FAIL
```

#### Test Set F-004: Network & Timeout Failures
```
TEST: F-004-01 - Slow Network - Form Submission
├─ Scenario: Simulate 10s latency on POST /api/stores
├─ Expected: Request completes OR graceful timeout (30s default)
├─ Data State: Saved once, not duplicated
├─ Status: [ ] PASS [ ] FAIL

TEST: F-004-02 - Network Interruption Mid-Transfer
├─ Scenario: Kill connection during POST payload upload
├─ Expected Response: Error or timeout (not partial save)
├─ Database State: Either complete or nothing
├─ Status: [ ] PASS [ ] FAIL

TEST: F-004-03 - Slow Database Query (>5s)
├─ Scenario: Complex search query on large dataset
├─ Expected: Completes or times out cleanly (no hanging)
├─ Status: [ ] PASS [ ] FAIL

TEST: F-004-04 - Multiple Simultaneous Requests (Stress)
├─ Scenario: 100 concurrent POST /api/transactions
├─ Expected: All succeed or fail gracefully
├─ Expected Throughput: >50 req/s
├─ Status: [ ] PASS [ ] FAIL

TEST: F-004-05 - Database Connection Lost
├─ Scenario: Kill DB connection during request
├─ Expected Response: 503 Service Unavailable
├─ Error Message: "Database connection failed"
├─ Status: [ ] PASS [ ] FAIL
```

#### Test Set F-005: Wrong Role/Permission Tests
```
TEST: F-005-01 - Cashier Delete Store
├─ Endpoint: DELETE /api/stores/{id}
├─ Role: cashier
├─ Expected Response: 403 Forbidden
├─ Error Message: "Insufficient permissions"
├─ Status: [ ] PASS [ ] FAIL

TEST: F-005-02 - Manager Create Tenant
├─ Endpoint: POST /api/tenants
├─ Role: manager
├─ Expected Response: 403 Forbidden
├─ Status: [ ] PASS [ ] FAIL

TEST: F-005-03 - Operator Access Other Store's Data
├─ Endpoint: GET /api/stores/{other_store_id}/transactions
├─ Role: operator (assigned to different store)
├─ Expected Response: 403 Forbidden
├─ Status: [ ] PASS [ ] FAIL

TEST: F-005-04 - SuperAdmin Verify They Can Delete Store
├─ Endpoint: DELETE /api/stores/{id}
├─ Role: super_admin
├─ Expected Response: 200 OK
├─ Status: [ ] PASS [ ] FAIL

TEST: F-005-05 - Tenant Manager Cannot Access Other Tenant
├─ Endpoint: GET /api/tenants/{other_tenant_id}
├─ Role: tenant_manager (different tenant)
├─ Expected Response: 403 Forbidden
├─ Status: [ ] PASS [ ] FAIL
```

### 2.2 UI Interaction Audit Tests

#### Test Set U-001: Dashboard Page
```
TEST: U-001-01 - Dashboard Buttons Visibility
├─ Page: /dashboard
├─ As Role: super_admin
├─ Elements: [Create Store] [Manage Users] [Analytics]
├─ Expected: All visible and clickable
├─ Status: [ ] PASS [ ] FAIL

TEST: U-001-02 - Dashboard as Cashier
├─ Page: /dashboard
├─ As Role: cashier
├─ Buttons Expected Visible: Only transaction-related
├─ Buttons Expected Hidden: [Create Store] [Manage Users]
├─ Status: [ ] PASS [ ] FAIL

TEST: U-001-03 - Analytics Chart Rendering
├─ Page: /dashboard
├─ Element: Revenue chart, Transaction chart
├─ Expected: Charts render without errors
├─ Data: Shows last 30 days
├─ Status: [ ] PASS [ ] FAIL

TEST: U-001-04 - Real-time Data Update
├─ Page: /dashboard
├─ Action: Create transaction in another tab
├─ Expected: Dashboard auto-updates within 5s
├─ Status: [ ] PASS [ ] FAIL

TEST: U-001-05 - Export Dashboard Report
├─ Element: [Export PDF] button
├─ Expected: Downloads valid PDF with data
├─ Status: [ ] PASS [ ] FAIL
```

#### Test Set U-002: Store Management Page
```
TEST: U-002-01 - Store Create Button
├─ Page: /stores
├─ Role: super_admin
├─ Button: [Create Store]
├─ Expected: Visible, clickable, opens modal
├─ Status: [ ] PASS [ ] FAIL

TEST: U-002-02 - Store List Pagination
├─ Page: /stores
├─ Data: >50 stores in database
├─ Expected: Shows 10 per page, pagination controls visible
├─ Controls: [< Previous] [1] [2] [3] [Next >]
├─ Status: [ ] PASS [ ] FAIL

TEST: U-002-03 - Store Edit Button Access
├─ Page: /stores
├─ Role: manager
├─ Action: Try to edit store
├─ Expected: Either allowed OR disabled with tooltip
├─ Status: [ ] PASS [ ] FAIL

TEST: U-002-04 - Store Delete Confirmation
├─ Page: /stores
├─ Action: Click [Delete] on store
├─ Expected: Modal appears asking confirmation
├─ Buttons: [Cancel] [Confirm Delete]
├─ Status: [ ] PASS [ ] FAIL

TEST: U-002-05 - Store Search Filter
├─ Page: /stores
├─ Action: Type in search box
├─ Expected: Results filter in real-time
├─ Status: [ ] PASS [ ] FAIL
```

#### Test Set U-003: Transaction/POS Page
```
TEST: U-003-01 - Add Item to Transaction
├─ Page: /pos
├─ Action: Click [Add Item] button
├─ Expected: Product selection modal appears
├─ Status: [ ] PASS [ ] FAIL

TEST: U-003-02 - Quantity Increment/Decrement
├─ Page: /pos
├─ Action: Use +/- buttons on item quantity
├─ Expected: Quantity updates, total recalculates
├─ Status: [ ] PASS [ ] FAIL

TEST: U-003-03 - Remove Item from Cart
├─ Page: /pos
├─ Action: Click [X] or [Remove] on cart item
├─ Expected: Item removed, total recalculates
├─ Status: [ ] PASS [ ] FAIL

TEST: U-003-04 - Payment Method Selection
├─ Page: /pos (at checkout)
├─ Options: [Cash] [Card] [Check]
├─ Expected: Can select, shows amount to pay
├─ Status: [ ] PASS [ ] FAIL

TEST: U-003-05 - Transaction Void/Cancel
├─ Page: /pos
├─ Action: Click [Cancel Transaction]
├─ Expected: Confirmation modal, cart clears if confirmed
├─ Status: [ ] PASS [ ] FAIL
```

#### Test Set U-004: User Management Page
```
TEST: U-004-01 - Create User Form
├─ Page: /users
├─ Action: Click [Create User]
├─ Expected: Form appears with fields
├─ Fields: [Name] [Email] [Role] [Phone]
├─ Status: [ ] PASS [ ] FAIL

TEST: U-004-02 - Role Selection Dropdown
├─ Page: /users (create form)
├─ Action: Click role dropdown
├─ Expected: Shows available roles based on current user
├─ Status: [ ] PASS [ ] FAIL

TEST: U-004-03 - User Status Toggle
├─ Page: /users (list)
├─ Action: Toggle user active/inactive
├─ Expected: Status updates, user can/cannot login
├─ Status: [ ] PASS [ ] FAIL

TEST: U-004-04 - User Email Verification
├─ Page: /users
├─ Status: Verify email shown in user row
├─ Expected: Email displayed correctly
├─ Status: [ ] PASS [ ] FAIL

TEST: U-004-05 - User Delete with Confirmation
├─ Page: /users
├─ Action: Delete user
├─ Expected: Confirmation modal, optional: reassign data
├─ Status: [ ] PASS [ ] FAIL
```

#### Test Set U-005: Tenant Management Page
```
TEST: U-005-01 - Tenant Create Form
├─ Page: /tenants
├─ Action: Click [Create Tenant]
├─ Expected: Form appears with fields
├─ Fields: [Name] [Email] [Phone] [Address]
├─ Status: [ ] PASS [ ] FAIL

TEST: U-005-02 - Tenant Store Assignment
├─ Page: /tenants/{id}/stores
├─ Action: Click [Add Store]
├─ Expected: Modal shows available stores
├─ Can select/unselect stores
├─ Status: [ ] PASS [ ] FAIL

TEST: U-005-03 - Tenant User Assignment
├─ Page: /tenants/{id}/users
├─ Action: Click [Assign User]
├─ Expected: Modal shows available users
├─ Can assign with role
├─ Status: [ ] PASS [ ] FAIL

TEST: U-005-04 - Tenant Settings Tab
├─ Page: /tenants/{id}
├─ Tabs: [General] [Stores] [Users] [Settings]
├─ Expected: All tabs accessible and render correctly
├─ Status: [ ] PASS [ ] FAIL

TEST: U-005-05 - Tenant Deactivation
├─ Page: /tenants
├─ Action: Deactivate tenant
├─ Expected: Confirmation, shows impact
├─ Users cannot login after deactivation
├─ Status: [ ] PASS [ ] FAIL
```

### 2.3 Multi-Tenant Data Integrity Tests

#### Test Set M-001: Query-Level Tenant Scoping
```
TEST: M-001-01 - GET /api/stores (Tenant Operator)
├─ User: operator@tenant1.com
├─ Query: GET /api/stores
├─ Database Filter Applied: WHERE tenant_id = '{tenant1_id}'
├─ Expected Result: Only tenant1 stores returned
├─ Stores from Other Tenant: NOT visible
├─ Status: [ ] PASS [ ] FAIL

TEST: M-001-02 - GET /api/transactions (Tenant Manager)
├─ User: manager@tenant2.com
├─ Query: GET /api/transactions
├─ Database Filter: WHERE tenant_id = '{tenant2_id}'
├─ Expected Result: Only tenant2 transactions
├─ Status: [ ] PASS [ ] FAIL

TEST: M-001-03 - GET /api/users (SuperAdmin)
├─ User: superadmin
├─ Query: GET /api/users
├─ Can See: All users from all tenants
├─ Can Filter: By tenant_id parameter
├─ Status: [ ] PASS [ ] FAIL

TEST: M-001-04 - GET /api/products (Store Filter)
├─ User: operator@store1
├─ Query: GET /api/products?storeId={store1_id}
├─ Expected Result: Only store1 products
├─ Cross-Store Products: NOT visible
├─ Status: [ ] PASS [ ] FAIL

TEST: M-001-05 - Search Results Respects Tenant
├─ Query: GET /api/search?q="product"
├─ Expected: Only returns tenant's products
├─ Status: [ ] PASS [ ] FAIL
```

#### Test Set M-002: Cross-Tenant Isolation Tests
```
TEST: M-002-01 - Cannot Access Other Tenant's Store
├─ User: operator@tenant1.com
├─ Attempt: GET /api/stores/{tenant2_store_id}
├─ Expected Response: 403 Forbidden OR 404 Not Found
├─ Error: "Access denied" or "Store not found"
├─ Status: [ ] PASS [ ] FAIL

TEST: M-002-02 - Cannot Update Other Tenant's Data
├─ User: operator@tenant1.com
├─ Attempt: PATCH /api/stores/{tenant2_store_id} { name: "Hacked" }
├─ Expected Response: 403 Forbidden
├─ Data Unchanged: Store name NOT changed
├─ Status: [ ] PASS [ ] FAIL

TEST: M-002-03 - Cannot Delete Other Tenant's Transaction
├─ User: manager@tenant1.com
├─ Attempt: DELETE /api/transactions/{tenant2_transaction_id}
├─ Expected Response: 403 Forbidden
├─ Data Unchanged: Transaction still exists
├─ Status: [ ] PASS [ ] FAIL

TEST: M-002-04 - Cannot Create Data for Other Tenant
├─ User: operator@tenant1.com
├─ Attempt: POST /api/stores { name: "Store", tenantId: "{tenant2_id}" }
├─ Expected: Either ignored OR 403 error
├─ Actual Store Created: In tenant1 (not tenant2)
├─ Status: [ ] PASS [ ] FAIL

TEST: M-002-05 - Joined Tables Respect Tenant Boundary
├─ Query: GET /api/stores/{store_id}/transactions
├─ User: operator@tenant1.com, store is in tenant1
├─ Transactions: All from that store
├─ Cross-tenant: NOT visible
├─ Status: [ ] PASS [ ] FAIL
```

#### Test Set M-003: Orphan Data Detection
```
TEST: M-003-01 - Find Products Without Store
├─ Query: SELECT * FROM products WHERE store_id IS NULL
├─ Expected Result: 0 rows
├─ Action: Investigate and clean up if found
├─ Status: [ ] PASS [ ] FAIL

TEST: M-003-02 - Find Transactions Without Tenant
├─ Query: SELECT * FROM transactions WHERE tenant_id IS NULL
├─ Expected Result: 0 rows
├─ Action: Investigate and clean up if found
├─ Status: [ ] PASS [ ] FAIL

TEST: M-003-03 - Find Users Without Assigned Role
├─ Query: SELECT * FROM users WHERE role IS NULL OR role = ''
├─ Expected Result: 0 rows
├─ Action: Assign default role or delete user
├─ Status: [ ] PASS [ ] FAIL

TEST: M-003-04 - Find Categories with Invalid Store References
├─ Query: SELECT c.* FROM categories c LEFT JOIN stores s ON c.store_id = s.id WHERE s.id IS NULL AND c.store_id IS NOT NULL
├─ Expected Result: 0 rows
├─ Action: Investigate store deletion cascade
├─ Status: [ ] PASS [ ] FAIL

TEST: M-003-05 - Verify Cascade Delete Works
├─ Action: Delete a store with products and transactions
├─ Expected: All related data deleted (products, transactions)
├─ Orphan Check: No orphaned records remain
├─ Status: [ ] PASS [ ] FAIL
```

### 2.4 State Machine Audit Tests

#### Test Set S-001: Store CRUD State Machine
```
State Diagram:
┌────────────┐
│   NEW      │──[Save]──┐
└────────────┘           │
                         ▼
                    ┌─────────────┐
                    │   EXISTS    │
                    └─────────────┘
                     ▲    │    │
         [Edit]──────┘    │    └──[Delete]──┐
                          │                  │
                       [Details]          ┌──────────┐
                          │               │ DELETED  │
                          ▼               └──────────┘
                   [View/Edit Page]

TEST: S-001-01 - Create Store Transitions to EXISTS
├─ Action 1: POST /api/stores { name: "New Store" }
├─ Expected: Store created with status = "EXISTS"
├─ Action 2: GET /api/stores/{id}
├─ Expected: Store retrieval works
├─ Status: [ ] PASS [ ] FAIL

TEST: S-001-02 - Edit Store Stays in EXISTS
├─ Action: PATCH /api/stores/{id} { name: "Updated" }
├─ Before State: EXISTS
├─ After State: EXISTS (no change)
├─ Database: Name updated
├─ Status: [ ] PASS [ ] FAIL

TEST: S-001-03 - Delete Store Transitions to DELETED
├─ Before: GET /api/stores/{id} ✓ exists
├─ Action: DELETE /api/stores/{id}
├─ After: GET /api/stores/{id} ✗ not found (404)
├─ Status: [ ] PASS [ ] FAIL

TEST: S-001-04 - Cannot Re-delete Store
├─ Action: DELETE /api/stores/{deleted_id}
├─ Expected Response: 404 Not Found
├─ Error: "Store not found"
├─ Status: [ ] PASS [ ] FAIL

TEST: S-001-05 - Cannot Edit Deleted Store
├─ Action: PATCH /api/stores/{deleted_id} { name: "Hack" }
├─ Expected Response: 404 Not Found
├─ Status: [ ] PASS [ ] FAIL
```

#### Test Set S-002: Transaction State Machine
```
State Diagram:
┌──────────┐
│  DRAFT   │ (Items added but not finalized)
└──────────┘
     │
   [Finalize]
     │
     ▼
┌──────────┐
│ PENDING  │ (Ready for payment)
└──────────┘
     │
  [Pay]│[Cancel]
     │   └──────────┐
     ▼              ▼
┌──────────┐   ┌──────────────┐
│  PAID    │   │  CANCELLED   │
└──────────┘   └──────────────┘

TEST: S-002-01 - Transaction Starts in DRAFT
├─ Action: POST /api/transactions { storeId: "1", items: [] }
├─ Expected State: DRAFT
├─ Can Still Modify: Yes (add/remove items)
├─ Status: [ ] PASS [ ] FAIL

TEST: S-002-02 - Add Items to DRAFT Transaction
├─ State: DRAFT
├─ Action: POST /api/transactions/{id}/items { productId: "1", qty: 2 }
├─ Expected: Item added, state stays DRAFT
├─ Status: [ ] PASS [ ] FAIL

TEST: S-002-03 - Finalize Transaction DRAFT → PENDING
├─ State: DRAFT (with items)
├─ Action: POST /api/transactions/{id}/finalize
├─ Expected State: PENDING
├─ Cannot Add Items: After finalize
├─ Status: [ ] PASS [ ] FAIL

TEST: S-002-04 - Process Payment PENDING → PAID
├─ State: PENDING
├─ Action: POST /api/transactions/{id}/payment { amount: 100, method: "cash" }
├─ Expected State: PAID
├─ Cannot Cancel: After paid
├─ Status: [ ] PASS [ ] FAIL

TEST: S-002-05 - Cancel Transaction (Any State)
├─ State: PENDING or DRAFT
├─ Action: DELETE /api/transactions/{id}
├─ Expected State: CANCELLED
├─ Can Restore: No (permanent)
├─ Status: [ ] PASS [ ] FAIL
```

#### Test Set S-003: Tenant Assignment Workflow
```
TEST: S-003-01 - Assign Store to Tenant
├─ Action: POST /api/stores/{store_id}/assign { tenantId: "tenant1" }
├─ Expected: store.tenant_id = "tenant1"
├─ Store Becomes: Part of tenant1
├─ Status: [ ] PASS [ ] FAIL

TEST: S-003-02 - Reassign Store to Different Tenant
├─ Before: store.tenant_id = "tenant1"
├─ Action: POST /api/stores/{store_id}/assign { tenantId: "tenant2" }
├─ After: store.tenant_id = "tenant2"
├─ Status: [ ] PASS [ ] FAIL

TEST: S-003-03 - Cannot Assign to Invalid Tenant
├─ Action: POST /api/stores/{store_id}/assign { tenantId: "nonexistent" }
├─ Expected Response: 400 Bad Request or 404 Not Found
├─ Store Assignment: Unchanged
├─ Status: [ ] PASS [ ] FAIL

TEST: S-003-04 - Verify Store Data After Assignment
├─ After Assign: GET /api/stores/{store_id}
├─ Expected: Tenant data visible in response
├─ Tenant Name: Shown correctly
├─ Status: [ ] PASS [ ] FAIL

TEST: S-003-05 - Filter Stores by Tenant After Assignment
├─ After Assign: GET /api/tenants/{tenantId}/stores
├─ Expected: Store appears in tenant's store list
├─ Status: [ ] PASS [ ] FAIL
```

### 2.5 Security Exploits Matrix Tests

#### Test Set SEC-001: Permission Matrix Validation
```
PERMISSION MATRIX TEST:

                    | SuperAdmin | Manager | Operator | Cashier
────────────────────┼────────────┼─────────┼──────────┼────────
GET /api/tenants    |     ✓      |    ✓    |    ✗     |   ✗
POST /api/tenants   |     ✓      |    ✗    |    ✗     |   ✗
DELETE /api/tenants |     ✓      |    ✗    |    ✗     |   ✗
────────────────────┼────────────┼─────────┼──────────┼────────
GET /api/stores     |     ✓      |    ✓    |    ✓     |   ✓
POST /api/stores    |     ✓      |    ✓    |    ✗     |   ✗
DELETE /api/stores  |     ✓      |    ✓    |    ✗     |   ✗
────────────────────┼────────────┼─────────┼──────────┼────────
GET /api/users      |     ✓      |    ✓    |    ✓     |   ✗
POST /api/users     |     ✓      |    ✓    |    ✗     |   ✗
DELETE /api/users   |     ✓      |    ✗    |    ✗     |   ✗
────────────────────┼────────────┼─────────┼──────────┼────────
GET /api/trans      |     ✓      |    ✓    |    ✓     |   ✓
POST /api/trans     |     ✓      |    ✓    |    ✓     |   ✓
DELETE /api/trans   |     ✓      |    ✓    |    ✓     |   ✗
────────────────────┼────────────┼─────────┼──────────┼────────
GET /api/products   |     ✓      |    ✓    |    ✓     |   ✓
POST /api/products  |     ✓      |    ✓    |    ✗     |   ✗
DELETE /api/products|     ✓      |    ✓    |    ✗     |   ✗
────────────────────┼────────────┼─────────┼──────────┼────────

TEST: SEC-001-01 - Verify Permission Denial for Unauthorized Role
├─ Role: cashier
├─ Endpoint: DELETE /api/stores/{id}
├─ Expected: 403 Forbidden
├─ Count Failures: [ ] 0 [ ] 1-3 [ ] 4+
├─ Status: [ ] PASS [ ] FAIL

TEST: SEC-001-02 - Verify Permission Grant for Authorized Role
├─ Role: manager
├─ Endpoint: POST /api/stores
├─ Expected: 200 OK or created
├─ Status: [ ] PASS [ ] FAIL

TEST: SEC-001-03 - Random Role-Endpoint Test (N=50)
├─ Test 50 random role-endpoint combinations
├─ Verify against matrix
├─ Failures: [ ] 0 [ ] 1-5 [ ] 6+
├─ Status: [ ] PASS [ ] FAIL
```

#### Test Set SEC-002: Privilege Escalation Attempts
```
TEST: SEC-002-01 - Change Own Role to SuperAdmin
├─ User: manager
├─ Attempt: PATCH /api/users/self { role: "super_admin" }
├─ Expected Response: 403 Forbidden
├─ Role Unchanged: Still "manager"
├─ Status: [ ] PASS [ ] FAIL

TEST: SEC-002-02 - Attempt to Promote Another User to SuperAdmin
├─ User: manager
├─ Attempt: PATCH /api/users/{other_id} { role: "super_admin" }
├─ Expected Response: 403 Forbidden
├─ User Role: Unchanged
├─ Status: [ ] PASS [ ] FAIL

TEST: SEC-002-03 - Attempt SQL Injection in Role Field
├─ User: operator
├─ Attempt: PATCH /api/users/self { role: "' OR '1'='1" }
├─ Expected: Either sanitized or error
├─ Role: Unchanged (not injected)
├─ Status: [ ] PASS [ ] FAIL

TEST: SEC-002-04 - Attempt to Bypass Rate Limiting
├─ Method: Make >100 requests in 1 minute
├─ Expected Response: 429 Too Many Requests (after limit)
├─ IP Blocked: Temporarily
├─ Status: [ ] PASS [ ] FAIL

TEST: SEC-002-05 - Attempt Token Replay Attack
├─ Scenario: Copy valid token, use in another session
├─ Expected: Either works (stateless) OR fails (session validation)
├─ Status: [ ] PASS [ ] FAIL
```

#### Test Set SEC-003: API Endpoint Security
```
TEST: SEC-003-01 - All Endpoints Require Authentication
├─ Action: Call each endpoint without token
├─ Expected Response: 401 Unauthorized for all protected endpoints
├─ Public Endpoints: /login, /register (if applicable)
├─ Status: [ ] PASS [ ] FAIL

TEST: SEC-003-02 - CORS Headers Present
├─ Request: OPTIONS /api/stores
├─ Expected Headers:
│   - Access-Control-Allow-Origin: configured_domain
│   - Access-Control-Allow-Methods: GET, POST, ...
│   - Access-Control-Allow-Credentials: true
├─ Status: [ ] PASS [ ] FAIL

TEST: SEC-003-03 - Sensitive Headers Set
├─ Response Headers Should Include:
│   - X-Content-Type-Options: nosniff
│   - X-Frame-Options: DENY
│   - X-XSS-Protection: 1; mode=block
│   - Strict-Transport-Security: (HTTPS)
├─ Status: [ ] PASS [ ] FAIL

TEST: SEC-003-04 - Request Body Size Limit
├─ Attempt: POST with 50MB payload
├─ Expected: 413 Payload Too Large
├─ Status: [ ] PASS [ ] FAIL

TEST: SEC-003-05 - Input Sanitization on All Text Fields
├─ Inject: <script>alert('xss')</script>
├─ Expected: Either encoded or stripped
├─ Database: Never contains raw HTML
├─ Status: [ ] PASS [ ] FAIL
```

---

## 3. Test Execution Commands

### 3.1 Run All Failure-Driven Tests
```bash
#!/bin/bash
# RUN ALL FAILURE-DRIVEN TESTS (F-001 to F-005)

echo "=== PHASE 32: FAILURE-DRIVEN TESTING ==="
echo "Starting: $(date)"

# F-001: Invalid Payloads
echo -e "\n=== TEST SET F-001: Invalid Payloads ==="
curl -X POST http://localhost:3000/api/stores -H "Content-Type: application/json" -d '{}'
curl -X POST http://localhost:3000/api/stores -H "Content-Type: application/json" -d '{"name": 123}'
curl -X POST http://localhost:3000/api/stores/1/products -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"name":"P","price":-100}'

# F-002: Missing Fields
echo -e "\n=== TEST SET F-002: Missing Fields ==="
curl -X POST http://localhost:3000/api/tenants -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"email":"test@test.com"}'
curl -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"name":"John"}'

# F-003: Session Failures
echo -e "\n=== TEST SET F-003: Session Failures ==="
curl -X GET http://localhost:3000/api/stores -H "Authorization: Bearer expired_token_here"
curl -X GET http://localhost:3000/api/stores

# F-004: Network Failures (simulate with timeout)
echo -e "\n=== TEST SET F-004: Network Failures ==="
timeout 2 curl -X GET http://localhost:3000/api/stores?delay=10 -H "Authorization: Bearer $TOKEN"

# F-005: Wrong Role Tests
echo -e "\n=== TEST SET F-005: Wrong Role Tests ==="
curl -X DELETE http://localhost:3000/api/stores/1 -H "Authorization: Bearer $CASHIER_TOKEN"

echo -e "\nCompleted: $(date)"
```

### 3.2 Run All UI Interaction Tests
```bash
#!/bin/bash
# RUN ALL UI INTERACTION AUDIT TESTS (E2E with Cypress/Playwright)

echo "=== PHASE 32: UI INTERACTION AUDIT ==="

# Run Cypress tests for UI
cd client/
npm run cypress:run -- --spec "cypress/e2e/phase32/**/*.cy.ts"

# Or with Playwright
npx playwright test tests/phase32/

echo "UI tests completed"
```

### 3.3 Run Multi-Tenant Data Integrity Tests
```bash
#!/bin/bash
# RUN MULTI-TENANT DATA INTEGRITY TESTS (Direct DB queries)

echo "=== PHASE 32: MULTI-TENANT DATA INTEGRITY ==="

# Connect to PostgreSQL
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME <<EOF

-- M-001: Query-Level Tenant Scoping
\echo '=== M-001: Query-Level Tenant Scoping ==='
SELECT user_id, tenant_id FROM stores WHERE tenant_id != (SELECT tenant_id FROM stores LIMIT 1);

-- M-002: Cross-Tenant Isolation
\echo '=== M-002: Cross-Tenant Isolation ==='
SELECT COUNT(*) as orphan_stores FROM stores WHERE tenant_id IS NULL;

-- M-003: Orphan Data Detection
\echo '=== M-003: Orphan Data Detection ==='
SELECT COUNT(*) as orphan_products FROM products WHERE store_id IS NULL;
SELECT COUNT(*) as orphan_transactions FROM transactions WHERE tenant_id IS NULL;

-- Data Integrity Report
\echo '=== DATA INTEGRITY SUMMARY ==='
SELECT 'Total Stores' as metric, COUNT(*) as count FROM stores
UNION ALL
SELECT 'Total Products', COUNT(*) FROM products
UNION ALL
SELECT 'Total Transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'Orphan Records', COUNT(*) FROM (
  SELECT id FROM products WHERE store_id IS NULL
  UNION ALL
  SELECT id FROM transactions WHERE tenant_id IS NULL
) orphans;

EOF
```

### 3.4 Run State Machine Tests
```bash
#!/bin/bash
# RUN STATE MACHINE AUDIT TESTS

echo "=== PHASE 32: STATE MACHINE AUDIT ==="

TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@warungin.com","password":"AdminPassword123"}' | jq -r '.token')

# S-001: Store State Transitions
echo -e "\n=== TEST S-001: Store CRUD State Machine ==="
STORE=$(curl -s -X POST http://localhost:3000/api/stores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test Store","phone":"081234567890","address":"Test Address"}' | jq -r '.id')
echo "Created store: $STORE"

# Verify store exists
curl -s -X GET http://localhost:3000/api/stores/$STORE \
  -H "Authorization: Bearer $TOKEN" | jq '.status'

# S-002: Transaction State Transitions
echo -e "\n=== TEST S-002: Transaction State Machine ==="
TRANS=$(curl -s -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"storeId\":\"$STORE\",\"items\":[]}" | jq -r '.id')
echo "Created transaction: $TRANS"

# Add item
curl -s -X POST http://localhost:3000/api/transactions/$TRANS/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"productId":"prod1","quantity":2}' | jq '.status'

echo -e "\nState machine tests completed"
```

### 3.5 Run Security Exploit Tests
```bash
#!/bin/bash
# RUN SECURITY EXPLOIT MATRIX TESTS

echo "=== PHASE 32: SECURITY EXPLOITS MATRIX ==="

TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@warungin.com","password":"AdminPassword123"}' | jq -r '.token')

CASHIER_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cashier@warungin.com","password":"CashierPassword123"}' | jq -r '.token')

# SEC-001: Permission Matrix
echo -e "\n=== TEST SEC-001: Permission Matrix ==="
echo "Cashier attempting DELETE /api/stores/1 (should fail):"
curl -i -X DELETE http://localhost:3000/api/stores/1 \
  -H "Authorization: Bearer $CASHIER_TOKEN"

# SEC-002: Privilege Escalation
echo -e "\n=== TEST SEC-002: Privilege Escalation ==="
echo "Attempting to change role to super_admin:"
curl -i -X PATCH http://localhost:3000/api/users/self \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CASHIER_TOKEN" \
  -d '{"role":"super_admin"}'

# SEC-003: API Security
echo -e "\n=== TEST SEC-003: API Security ==="
echo "Request without token (should fail):"
curl -i -X GET http://localhost:3000/api/stores

echo "Request with invalid token (should fail):"
curl -i -X GET http://localhost:3000/api/stores \
  -H "Authorization: Bearer invalid_token"

echo -e "\nSecurity tests completed"
```

---

## 4. Test Results Summary Template

### 4.1 Failure-Driven Testing Results
```
FAILURE-DRIVEN TESTING SUMMARY
├─ F-001: Invalid Payloads
│  ├─ F-001-01: [ ] PASS / [ ] FAIL
│  ├─ F-001-02: [ ] PASS / [ ] FAIL
│  ├─ F-001-03: [ ] PASS / [ ] FAIL
│  ├─ F-001-04: [ ] PASS / [ ] FAIL
│  └─ F-001-05: [ ] PASS / [ ] FAIL
│
├─ F-002: Missing Fields
│  ├─ F-002-01: [ ] PASS / [ ] FAIL
│  ├─ F-002-02: [ ] PASS / [ ] FAIL
│  ├─ F-002-03: [ ] PASS / [ ] FAIL
│  ├─ F-002-04: [ ] PASS / [ ] FAIL
│  └─ F-002-05: [ ] PASS / [ ] FAIL
│
├─ F-003: Session Failures
│  ├─ F-003-01: [ ] PASS / [ ] FAIL
│  ├─ F-003-02: [ ] PASS / [ ] FAIL
│  ├─ F-003-03: [ ] PASS / [ ] FAIL
│  ├─ F-003-04: [ ] PASS / [ ] FAIL
│  └─ F-003-05: [ ] PASS / [ ] FAIL
│
├─ F-004: Network Failures
│  ├─ F-004-01: [ ] PASS / [ ] FAIL
│  ├─ F-004-02: [ ] PASS / [ ] FAIL
│  ├─ F-004-03: [ ] PASS / [ ] FAIL
│  ├─ F-004-04: [ ] PASS / [ ] FAIL
│  └─ F-004-05: [ ] PASS / [ ] FAIL
│
└─ F-005: Wrong Role/Permission
   ├─ F-005-01: [ ] PASS / [ ] FAIL
   ├─ F-005-02: [ ] PASS / [ ] FAIL
   ├─ F-005-03: [ ] PASS / [ ] FAIL
   ├─ F-005-04: [ ] PASS / [ ] FAIL
   └─ F-005-05: [ ] PASS / [ ] FAIL

TOTAL: __/25 PASSED
PASS RATE: ___%
CRITICAL FAILURES: __
```

### 4.2 UI Interaction Results
```
UI INTERACTION AUDIT SUMMARY
├─ U-001: Dashboard Page (5 tests)
│  Pass: [ ] 5 [ ] 4 [ ] 3 [ ] 2 [ ] 1 [ ] 0
│
├─ U-002: Store Management (5 tests)
│  Pass: [ ] 5 [ ] 4 [ ] 3 [ ] 2 [ ] 1 [ ] 0
│
├─ U-003: Transaction/POS (5 tests)
│  Pass: [ ] 5 [ ] 4 [ ] 3 [ ] 2 [ ] 1 [ ] 0
│
├─ U-004: User Management (5 tests)
│  Pass: [ ] 5 [ ] 4 [ ] 3 [ ] 2 [ ] 1 [ ] 0
│
└─ U-005: Tenant Management (5 tests)
   Pass: [ ] 5 [ ] 4 [ ] 3 [ ] 2 [ ] 1 [ ] 0

TOTAL: __/25 PASSED
PASS RATE: ___%
```

### 4.3 Multi-Tenant Data Integrity Results
```
MULTI-TENANT DATA INTEGRITY SUMMARY
├─ M-001: Query-Level Tenant Scoping (5 tests)
│  Pass: [ ] 5 [ ] 4 [ ] 3 [ ] 2 [ ] 1 [ ] 0
│
├─ M-002: Cross-Tenant Isolation (5 tests)
│  Pass: [ ] 5 [ ] 4 [ ] 3 [ ] 2 [ ] 1 [ ] 0
│
└─ M-003: Orphan Data Detection (5 tests)
   Pass: [ ] 5 [ ] 4 [ ] 3 [ ] 2 [ ] 1 [ ] 0

TOTAL: __/15 PASSED
PASS RATE: ___%
ORPHAN RECORDS FOUND: __
```

### 4.4 State Machine Audit Results
```
STATE MACHINE AUDIT SUMMARY
├─ S-001: Store CRUD (5 tests)
│  Pass: [ ] 5 [ ] 4 [ ] 3 [ ] 2 [ ] 1 [ ] 0
│
├─ S-002: Transaction State (5 tests)
│  Pass: [ ] 5 [ ] 4 [ ] 3 [ ] 2 [ ] 1 [ ] 0
│
└─ S-003: Tenant Assignment (5 tests)
   Pass: [ ] 5 [ ] 4 [ ] 3 [ ] 2 [ ] 1 [ ] 0

TOTAL: __/15 PASSED
PASS RATE: ___%
STATE VIOLATIONS: __
```

### 4.5 Security Exploits Matrix Results
```
SECURITY EXPLOITS MATRIX SUMMARY
├─ SEC-001: Permission Matrix (3 tests)
│  Pass: [ ] 3 [ ] 2 [ ] 1 [ ] 0
│  Failed Checks: __
│
├─ SEC-002: Privilege Escalation (5 tests)
│  Pass: [ ] 5 [ ] 4 [ ] 3 [ ] 2 [ ] 1 [ ] 0
│
└─ SEC-003: API Endpoint Security (5 tests)
   Pass: [ ] 5 [ ] 4 [ ] 3 [ ] 2 [ ] 1 [ ] 0

TOTAL: __/13 PASSED
PASS RATE: ___%
PERMISSION VIOLATIONS: __
```

---

## 5. Critical Issues Found

### Found Issues (Template)
```
CRITICAL ISSUE #1: [Description]
├─ Severity: [ ] CRITICAL [ ] HIGH [ ] MEDIUM [ ] LOW
├─ Test Case: [Which test found this]
├─ Affected Endpoint: [API endpoint]
├─ Expected Behavior: [What should happen]
├─ Actual Behavior: [What actually happened]
├─ Impact: [Business impact]
├─ Fix Priority: [ ] IMMEDIATE [ ] URGENT [ ] SOON
└─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] FIXED [ ] VERIFIED
```

---

## 6. Next Steps

After QA Test Execution:

1. ✅ **Document Failures** - Record all failed tests
2. ✅ **Prioritize Issues** - Sort by severity (Critical > High > Medium > Low)
3. ✅ **Fix Issues** - Resolve critical and high-priority items
4. ✅ **Re-test** - Verify fixes with same test suite
5. ⏳ **Phase 33** - Proceed to Final Production Deployment

---

## 7. Sign-off

**QA Testing Framework**: READY FOR EXECUTION ✅
**Test Coverage**: 73 test cases across 5 domains
**Expected Duration**: 4-6 hours for full execution
**Next Phase**: Phase 33 - Final Production Deployment

**Authorized By**: Phase 32 QA Framework  
**Date Created**: 2024  
**Version**: 1.0 - Execution Ready
