# PHASE 32.4: STATE MACHINE & TRANSACTION AUDIT
## User Flow State Verification & Race Condition Testing

**Date:** January 1, 2026  
**Phase:** 32.4 - Frontend-State and Backend-Transaction Auditor  
**Status:** READY FOR EXECUTION

---

## EXECUTIVE SUMMARY

This document audits ALL critical user flows as state machines:
1. **Create Store (Outlet)** - Multi-step form submission
2. **Edit Outlet** - Concurrent edit handling
3. **Assign Staff to Outlet** - Permission-gated operation
4. **POS Transaction** - Payment & settlement
5. **Logout & Session Refresh** - State cleanup

For each flow, verify:
- Initial state → Intermediate states → Final state
- Abort/failure states
- Double-submit safety (idempotency)
- Refresh after submit behavior
- Back button behavior
- Race conditions
- Partial saves

---

## FLOW 1: CREATE OUTLET (Store)

### 1.1 State Machine Diagram

```
┌─────────────────┐
│  INITIAL STATE  │
│  (Form Empty)   │
└────────┬────────┘
         │ User opens /outlets/new
         ▼
┌─────────────────────────────────┐
│  STATE 1: FORM READY            │
│  - All fields empty             │
│  - Submit button DISABLED       │
│  - Validation errors: NONE      │
└────────┬────────────────────────┘
         │ User fills: outlet_name
         ▼
┌─────────────────────────────────┐
│  STATE 2: PARTIAL DATA          │
│  - outlet_name: FILLED          │
│  - address: EMPTY               │
│  - Submit button: DISABLED      │
│  - Error: "Address required"    │
└────────┬────────────────────────┘
         │ User fills: address, city, phone
         ▼
┌─────────────────────────────────┐
│  STATE 3: VALID FORM            │
│  - All required fields: FILLED  │
│  - Submit button: ENABLED       │
│  - Validation errors: NONE      │
└────────┬────────────────────────┘
         │ User clicks SUBMIT
         │ API Request Starts
         ▼
┌─────────────────────────────────┐
│  STATE 4: SUBMITTING            │
│  - Submit button: DISABLED      │
│  - Spinner: VISIBLE             │
│  - Form fields: DISABLED        │
│  - Loading message: "Creating..."│
└────────┬────────────────────────┘
         │ Server processes
         │ (Validations)
         │
         ├──────────────────────┬──────────────────────┐
         │ VALIDATION PASS      │ VALIDATION FAIL      │
         ▼                      ▼                      ▼
  ┌──────────────┐      ┌──────────────────┐
  │ DB INSERT    │      │ STATE 5A: ERROR  │
  │ Success      │      │ - Form restored  │
  │              │      │ - Errors shown   │
  ▼              │      │ - Submit: ENABLED│
┌──────────────┐ │      └──────────────────┘
│STATE 6:      │ │             ▲
│SUCCESS       │ │             │
│- Show outlet │ │      User fixes errors
│- Navigate to │◄┼──────────────┘
│/outlets/{id} │ │
│- Toast:      │ │
│"Created!"    │ │
└──────────────┘ │
                 │
         ┌───────┴────────────────────┐
         │ OR Network Timeout/Error    │
         │ Or Server Error             │
         ▼
    ┌─────────────────────┐
    │ STATE 5B: NETWORK   │
    │ ERROR               │
    │ - Form preserved    │
    │ - Error toast shown │
    │ - Submit: ENABLED   │
    │ - "Retry" button    │
    └─────────────────────┘
```

### 1.2 State Transition Tests

#### Test Case 1.2.1: Form Initially Empty
```bash
GET /outlets/new

Expected State:
{
  outlet_name: "",
  address: "",
  city: null,
  phone: "",
  status: "active",
  open_time: null,
  close_time: null,
  errors: {},
  isSubmitting: false,
  submitDisabled: true
}

Actual: [ ]
Status: [ ]
```

#### Test Case 1.2.2: Partial Fill + Validation
```javascript
// Action: User types "Main Outlet" in outlet_name field

Expected State:
{
  outlet_name: "Main Outlet",
  address: "",
  city: null,
  errors: {
    address: "Address is required",
    city: "City is required",
    phone: "Phone is required"
  },
  submitDisabled: true
}

Verify: No API call made while typing (should validate client-side only)

Actual: [ ]
Status: [ ]
```

#### Test Case 1.2.3: All Fields Filled + Valid
```javascript
// Action: User fills all required fields with valid data

Expected State:
{
  outlet_name: "Main Outlet",
  address: "123 Main St",
  city: "Jakarta",
  phone: "+62812345678",
  errors: {},
  submitDisabled: false,
  submitButton: "Create Outlet"
}

Actual: [ ]
Status: [ ]
```

#### Test Case 1.2.4: Submit Click → Submitting State
```javascript
// Action: User clicks Submit button

Expected State IMMEDIATELY:
{
  isSubmitting: true,
  submitDisabled: true,
  formFieldsDisabled: true,
  loadingSpinner: true,
  loadingText: "Creating outlet..."
}

API Call Initiated: POST /api/outlets with form data

Actual: [ ]
Status: [ ]
```

#### Test Case 1.2.5: Server Success → Success State
```javascript
// Server responds: 201 Created

Expected Final State:
{
  isSubmitting: false,
  success: true,
  successMessage: "Outlet created successfully",
  redirectToUrl: "/outlets/outlet_id_123"
}

Browser Action: Navigate to /outlets/outlet_id_123

Verify: Form data NOT retained (should clear after success)

Actual: [ ]
Status: [ ]
```

#### Test Case 1.2.6: Server Validation Error → Error State
```javascript
// Server responds: 400 Bad Request
// Error: {code: 'VALIDATION_ERROR', message: 'Phone format invalid'}

Expected State:
{
  isSubmitting: false,
  submitDisabled: false,
  formFieldsDisabled: false,
  errors: {
    phone: "Phone must be in format +62XXXXXXXXXX"
  },
  globalError: null,
  showErrorToast: true,
  errorToastMessage: "Validation error - check fields below"
}

Verify: Form data retained (user can fix and retry)

Actual: [ ]
Status: [ ]
```

#### Test Case 1.2.7: Network Error → Error State
```javascript
// Network fails during submission (timeout or connection lost)

Expected State:
{
  isSubmitting: false,
  submitDisabled: false,
  globalError: "Network error - please check your connection",
  showErrorToast: true,
  errorToastMessage: "Failed to create outlet",
  retryButton: true,
  retryData: {/* form data preserved */}
}

Verify: User can click "Retry" to re-submit with same data

Actual: [ ]
Status: [ ]
```

### 1.3 Double-Submit & Refresh Tests

#### Test Case 1.3.1: Rapid Double Click Submit
```javascript
// User clicks Submit → Network slow (5s response time)
// User clicks Submit again at 0.5s

Expected:
- First click: Submit button disabled, API call #1 sent
- Second click: Button already disabled, NO second API call sent
- Server receives: Only 1 request (first click)
- Database: Only 1 outlet created

Verify: No duplicate outlet in database

Actual: [ ]
Status: [ ]

Implementation Check:
<button disabled={isSubmitting} onClick={handleSubmit}>
  Create Outlet
</button>
// If button disabled while submitting, second click can't fire
```

#### Test Case 1.3.2: Form Refresh During Submission
```javascript
// Scenario:
// 1. User submits form (isSubmitting = true)
// 2. User presses F5 (page refresh)
// 3. Server is still processing (5s)

Expected After Refresh:
- Form returns to INITIAL STATE (empty)
- No pending request visible
- Submit button: ENABLED (ready for new submission)

Actual: [ ]
Status: [ ]

Database Impact:
- If server already saved (before refresh): 1 outlet exists
- If server not saved (after refresh): 0 outlets exist
- NO PARTIAL DATA should exist
```

#### Test Case 1.3.3: Back Button After Submit
```javascript
// Scenario:
// 1. User fills form, clicks Submit
// 2. State: SUBMITTING (spinner visible)
// 3. User clicks browser Back button

Expected:
- Page navigates back (to /outlets)
- Pending API request might still be in-flight
- If server eventually creates outlet: GOOD (idempotent)
- If server creates outlet: Verify database consistency

Actual: [ ]
Status: [ ]

Critical: 
- Back button should NOT prevent outlet creation
- Background process completes even if user navigates away
```

### 1.4 Idempotency & Retry Tests

#### Test Case 1.4.1: Idempotency Key Implementation
```javascript
// Implementation should use idempotency key to prevent duplicates

Expected Submission:
POST /api/outlets
Headers: {
  'Idempotency-Key': 'outlet_create_<timestamp>_<random>'
}
Body: { outlet_name, address, city, ... }

Server Behavior:
- First request: Creates outlet, stores idempotency key
- Retry with same key: Returns existing outlet (201 or 200)
- Never creates duplicate

Test:
POST /api/outlets with Idempotency-Key: "key123"
  → 201 Created, outlet_id: "out123"
  
POST /api/outlets with Idempotency-Key: "key123" (same key)
  → 200 OK, outlet_id: "out123" (same outlet, no new creation)

Actual: [ ]
Status: [ ]
```

---

## FLOW 2: EDIT OUTLET

### 2.1 State Machine Diagram

```
┌────────────────────┐
│  INITIAL STATE     │
│  GET /outlets/{id} │
└────────┬───────────┘
         │ Load outlet data
         ▼
┌────────────────────────────────┐
│  STATE 1: LOADED               │
│  - Form populated with data    │
│  - Original values stored      │
│  - Submit button: DISABLED     │
│  - (No changes yet)            │
└────────┬───────────────────────┘
         │ User edits: name = "New Name"
         ▼
┌────────────────────────────────┐
│  STATE 2: DIRTY (Changes Made) │
│  - Current name: "New Name"    │
│  - Original name: "Old Name"   │
│  - Submit button: ENABLED      │
│  - Unsaved indicator: "*"      │
└────────┬───────────────────────┘
         │ User clicks Submit
         ▼
┌────────────────────────────────┐
│  STATE 3: SUBMITTING           │
│  - Submit button: DISABLED     │
│  - Loading spinner: VISIBLE    │
└────────┬───────────────────────┘
         │
         ├─────────────────────┬──────────────────────┐
         │ Success             │ Conflict (Race)      │
         ▼                     ▼                      ▼
    ┌──────────────┐    ┌─────────────────┐
    │ SUCCESS      │    │ CONFLICT STATE  │
    │ - Updated ✓  │    │ - Show conflict │
    │              │    │ - Offer:        │
    └──────────────┘    │   - Keep local  │
                        │   - Use server  │
                        │   - Reload page │
                        └─────────────────┘
```

### 2.2 Concurrent Edit Test

#### Test Case 2.2.1: Two Admins Edit Same Outlet
```
Timeline:
T0: Admin A opens /outlets/123/edit
    - Outlet state: {name: "Main", address: "123 Main"}
    - Loads original_data stored in component

T1: Admin B opens /outlets/123/edit
    - Same outlet, same initial state

T2: Admin B changes name → "New Name B"
    Admin B clicks Submit

T3: Server processes Admin B's request
    - Validates: outlet still exists
    - Updates: name = "New Name B"
    - Returns: updated_at = T3_timestamp

T4: Admin A (still editing) changes address → "456 New St"
    Admin A clicks Submit

T5: Server processes Admin A's request
    - Validates: outlet still exists
    - Checks: updated_at in request vs DB updated_at
    
    If DB updated_at > request updated_at:
      → CONFLICT (someone else edited)
      → Return 409 Conflict

Expected Response:
{
  statusCode: 409,
  error: "CONFLICT",
  message: "Outlet was modified by another user",
  serverData: {name: "New Name B", address: "123 Main", updated_at: T3},
  clientData: {name: "Main", address: "456 New St"}
}

Frontend Handling:
- Show modal: "This record was edited by [Admin B] at [T3]"
- Options:
  1. "Keep my changes" (overwrite)
  2. "Use their changes" (reload from server)
  3. "See Diff" (show changes)
  
Actual: [ ]
Status: [ ]
```

#### Test Case 2.2.2: Lost Update Prevention
```
Implementation Method: Last-Write-Wins with Timestamp

In database update query:
UPDATE outlets 
SET name = ?, address = ?, updated_at = NOW()
WHERE id = ?
AND updated_at = ? -- The timestamp from request

If rows_updated = 0:
  → Conflict (someone else updated between read and write)
  
Expected:
- Admin A's changes: APPLIED
- Admin B's changes: REJECTED with conflict warning
- OR: Merge conflict resolution UI shown

Actual: [ ]
Status: [ ]
```

### 2.3 Form State Tests

#### Test Case 2.3.1: Unsaved Changes Warning
```javascript
// User loads form, makes changes, tries to leave without saving

Expected:
- User changes outlet name
- User clicks Back button
- Modal appears: "You have unsaved changes. Leave anyway?"
- Options: "Leave" or "Continue Editing"

If user clicks "Leave":
- Changes discarded
- Navigate back

If user clicks "Continue Editing":
- Stay on form
- Changes preserved

Actual: [ ]
Status: [ ]
```

#### Test Case 2.3.2: Save Button Disabled When No Changes
```javascript
// User opens form, makes no changes

Expected:
- Submit button: DISABLED
- Button text: "Save Changes" (grayed out)
- reason: "No changes made"

User makes change:
- Submit button: ENABLED immediately

User reverts change (back to original):
- Submit button: DISABLED again (no net change)

Actual: [ ]
Status: [ ]
```

---

## FLOW 3: ASSIGN STAFF TO OUTLET

### 3.1 State Machine & Permission Gate

```
┌──────────────────────────────────┐
│  INITIAL REQUEST                 │
│  POST /api/staff/assign          │
│  Payload: {staffId, outletId}    │
└──────┬───────────────────────────┘
       │
       ├─────────────────┬─────────────────┐
       │                 │                 │
   ADMIN             STAFF            SUPER_ADMIN
       │                 │                 │
       ▼                 ▼                 ▼
  ┌────────┐       ┌──────────┐     ┌──────────┐
  │ ALLOWED│       │ FORBIDDEN│     │ FORBIDDEN│
  │ (403)  │       │ (403)    │     │ (403)    │
  └────┬───┘       └──────────┘     └──────────┘
       │
       ▼
┌──────────────────────────────────┐
│  VALIDATE: Tenant Ownership      │
│  - staff.tenant_id = outlet.     │
│    tenant_id                     │
└──────┬───────────────────────────┘
       │
       ├─── PASS ──────────────────┬──── FAIL ───────────┐
       │                           │                     │
       ▼                           ▼                     ▼
  ┌──────────┐           ┌──────────────┐      ┌─────────────┐
  │ PROCEED  │           │ CROSS-TENANT │      │ NOT_FOUND   │
  │          │           │ ERROR (403)  │      │ ERROR (404) │
  └────┬─────┘           └──────────────┘      └─────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  INSERT staff_outlet_assignments │
│  Set: assigned_at = NOW()        │
│  Set: unassigned_at = NULL       │
└──────┬───────────────────────────┘
       │
       ├──── UNIQUE ────────┬──── DUPLICATE ──────┐
       │ CONSTRAINT         │                      │
       │                    │                      │
       ▼                    ▼                      ▼
  ┌──────────────┐  ┌─────────────────┐
  │ SUCCESS      │  │ ALREADY ASSIGNED│
  │ 201 Created  │  │ 409 Conflict    │
  └──────────────┘  └─────────────────┘
```

### 3.2 Tests

#### Test Case 3.2.1: Tenant Admin Assigning Staff
```bash
POST /api/staff/assign
Authorization: Bearer TENANT_ADMIN_TOKEN
Content-Type: application/json

{
  "staffId": "staff_123",
  "outletId": "outlet_456"
}

Pre-Conditions:
- TENANT_ADMIN belongs to Tenant A
- staff_123 belongs to Tenant A
- outlet_456 belongs to Tenant A

Expected: 201 Created
{
  "id": "assignment_123",
  "staffId": "staff_123",
  "outletId": "outlet_456",
  "assignedAt": "2026-01-01T10:00:00Z",
  "unassignedAt": null
}

Verify: Record created in staff_outlet_assignments table

Actual: [ ]
Status: [ ]
```

#### Test Case 3.2.2: Cross-Tenant Assignment (Security)
```bash
POST /api/staff/assign
Authorization: Bearer TENANT_A_ADMIN_TOKEN

{
  "staffId": "staff_from_tenant_b",
  "outletId": "outlet_a"
}

Expected: 403 Forbidden
{
  "error": "Cannot assign staff from different tenant",
  "code": "PERMISSION_DENIED"
}

Verify: No record created in database

Actual: [ ]
Status: [ ]
```

#### Test Case 3.2.3: Duplicate Assignment
```bash
# First assignment
POST /api/staff/assign
{
  "staffId": "staff_123",
  "outletId": "outlet_456"
}
→ 201 Created

# Attempt duplicate
POST /api/staff/assign
{
  "staffId": "staff_123",
  "outletId": "outlet_456"
}

Expected: 409 Conflict
{
  "error": "Staff already assigned to outlet",
  "code": "DUPLICATE_ASSIGNMENT"
}

Verify: Only 1 record in staff_outlet_assignments for this pair

Actual: [ ]
Status: [ ]
```

---

## FLOW 4: POS TRANSACTION (Complex Multi-Step)

### 4.1 State Machine Diagram

```
┌──────────────────────────┐
│  INITIAL STATE           │
│  /pos/new                │
│  - Cart: EMPTY           │
│  - Outlet: SELECT        │
└──────┬───────────────────┘
       │ User selects outlet
       ▼
┌──────────────────────────┐
│  STATE 1: OUTLET_SELECT  │
│  - Outlet: SELECTED      │
│  - Items: VISIBLE        │
│  - Cart: EMPTY           │
│  - Subtotal: 0           │
└──────┬───────────────────┘
       │ User clicks "Add to Cart" (Item A × 2)
       ▼
┌──────────────────────────┐
│  STATE 2: CART_LOADED    │
│  - Item A: qty=2         │
│  - Subtotal: 100k        │
│  - Tax: 10k              │
│  - Total: 110k           │
│  - Submit button: ENABLED│
└──────┬───────────────────┘
       │ User clicks "Proceed to Payment"
       ▼
┌──────────────────────────┐
│  STATE 3: PAYMENT_FORM   │
│  - Amount Due: 110k      │
│  - Payment Method: SELECT│
│  - Amount Paid: null     │
│  - Change: -110k         │
│  - Pay button: DISABLED  │
└──────┬───────────────────┘
       │ User selects "Cash", enters 150k
       ▼
┌──────────────────────────┐
│  STATE 4: PAYMENT_READY  │
│  - Amount Paid: 150k     │
│  - Change: +40k          │
│  - Pay button: ENABLED   │
└──────┬───────────────────┘
       │ User clicks "Complete Payment"
       │ API POST /api/transactions
       ▼
┌──────────────────────────┐
│  STATE 5: PROCESSING     │
│  - Form: DISABLED        │
│  - Loading: VISIBLE      │
│  - Button: DISABLED      │
└──────┬───────────────────┘
       │
       ├──── SUCCESS ───────────┬───── FAILURE ────────┐
       │                        │                      │
       ▼                        ▼                      ▼
  ┌──────────────┐         ┌──────────────┐
  │ SUCCESS      │         │ ERROR        │
  │ - Receipt    │         │ - Error msg  │
  │ - Print      │         │ - Retry btn  │
  │ - New Trans  │         │ - Cart saved │
  │ - Reset cart │         │              │
  └──────────────┘         └──────────────┘
```

### 4.2 Transaction Tests

#### Test Case 4.2.1: Empty Cart Submit
```javascript
// Scenario: User tries to complete payment with empty cart

State Before:
{
  cart: [],
  subtotal: 0,
  total: 0,
  payButton: disabled
}

Expected:
- "Complete Payment" button: DISABLED (can't click)
- Error message: "Cart is empty"
- No API call when clicked

Actual: [ ]
Status: [ ]
```

#### Test Case 4.2.2: Amount Validation
```javascript
// Scenario: Total = 100k, User enters Amount Paid = 50k

Expected:
{
  amountPaid: 50000,
  change: -50000,
  payButton: disabled,
  errorMessage: "Amount must be ≥ total"
}

User enters 100k:
{
  amountPaid: 100000,
  change: 0,
  payButton: enabled
}

Actual: [ ]
Status: [ ]
```

#### Test Case 4.2.3: Payment Processing
```javascript
// Scenario: User submits transaction

Step 1: Frontend validates form
- All items in cart
- Amount Paid ≥ Total
- Payment method selected

Step 2: Backend processing
POST /api/transactions
{
  outletId: "outlet_123",
  items: [
    {itemId: "item_a", quantity: 2, unitPrice: 50000}
  ],
  amount: 100000,
  discount: 0,
  tax: 10000,
  total: 110000,
  amountPaid: 150000,
  change: 40000,
  paymentMethod: "CASH"
}

Step 3: Server validation
- Outlet exists and belongs to user's tenant
- Items exist and belong to same tenant
- No quantity < 1
- Amount > 0

Step 4: Database transaction
BEGIN TRANSACTION
  1. INSERT transaction record
  2. INSERT transaction_items (for each cart item)
  3. UPDATE items (decrease quantity)
  4. INSERT payment record
  5. INSERT audit_log
COMMIT

Expected: 201 Created
{
  "transactionId": "trans_123",
  "receiptNumber": "RCP-20260101-001",
  "total": 110000,
  "change": 40000,
  "createdAt": "2026-01-01T10:30:00Z"
}

Frontend: 
- Show receipt
- Navigate to receipt view
- Clear cart

Actual: [ ]
Status: [ ]
```

#### Test Case 4.2.4: Inventory Update
```javascript
// Scenario: Item A has qty=10 before transaction

Transaction:
- Item A × 2

Expected After:
- Item A qty in DB: 10 - 2 = 8

Verify:
SELECT quantity FROM items WHERE id = 'item_a';
-- Should be 8

Actual: [ ]
Status: [ ]
```

#### Test Case 4.2.5: Payment Idempotency
```javascript
// Scenario: Network timeout during payment completion

Request 1: POST /api/transactions with Idempotency-Key: "pay_123"
- In-flight, no response yet
- User clicks "Complete Payment" again

Request 2: POST /api/transactions with Idempotency-Key: "pay_123"
- Same key as request 1

Expected:
- Server receives both requests
- First request: Creates transaction, stores idempotency key
- Second request: Returns existing transaction (no duplicate)
- Database: Only 1 transaction created
- Inventory: Only decreased once

Actual: [ ]
Status: [ ]
```

---

## FLOW 5: LOGOUT & SESSION MANAGEMENT

### 5.1 State Machine Diagram

```
┌──────────────────────┐
│  LOGGED IN STATE     │
│  - JWT in storage    │
│  - User context set  │
│  - Navbar: User name │
└──────┬───────────────┘
       │ User clicks "Logout"
       ▼
┌──────────────────────┐
│  LOGOUT_INITIATED    │
│  - API call: POST    │
│    /auth/logout      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  BACKEND LOGOUT      │
│  - Invalidate token  │
│  - Clear session     │
│  - DB record update  │
│    last_logout = NOW│
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  FRONTEND CLEANUP    │
│  - Remove JWT token  │
│  - Clear user context│
│  - Clear local store │
│  - Navigate to /auth │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  LOGGED OUT STATE    │
│  - User context:null │
│  - /dashboard →      │
│    redirect to /auth │
└──────────────────────┘
```

### 5.2 Session Tests

#### Test Case 5.2.1: Logout Clears State
```javascript
// Before logout
{
  isAuthenticated: true,
  user: {
    id: "user_123",
    email: "user@test.com",
    role: "STAFF"
  },
  token: "eyJhbGciOi...",
  tenant_id: "tenant_a"
}

// User clicks Logout
POST /api/auth/logout
Authorization: Bearer eyJhbGciOi...

// After logout
{
  isAuthenticated: false,
  user: null,
  token: null,
  tenant_id: null,
  redirectUrl: "/auth/login"
}

Verify:
- localStorage.getItem('token') → null
- sessionStorage.getItem('user') → null
- Redux store: auth state = null
- Page navigates to /auth/login

Actual: [ ]
Status: [ ]
```

#### Test Case 5.2.2: Session Refresh
```javascript
// User is logged in, access token expires (15min)
// User tries to access /dashboard

Expected:
1. GET /api/dashboard → 401 Unauthorized
   Headers: {"Authorization": "Bearer EXPIRED_TOKEN"}
   Response: {"error": "Token expired"}

2. Frontend catches 401, calls:
   POST /api/auth/refresh
   Body: {"refreshToken": "REFRESH_TOKEN_VALUE"}

3. Server validates refresh token
   - Is it valid?
   - Has it expired?
   - Does it match user's last issued?

4. If valid: Return new access token
   {
     "accessToken": "NEW_JWT_TOKEN",
     "expiresIn": 900 // 15 min
   }

5. Frontend updates:
   - localStorage['token'] = NEW_JWT_TOKEN
   - Retries original request with new token

6. GET /api/dashboard (RETRY with new token)
   - Returns 200 OK with data

Expected: Seamless refresh, user unaware

Actual: [ ]
Status: [ ]
```

#### Test Case 5.2.3: Refresh Token Expired
```javascript
// User was inactive for 30 days
// Access token expired (15 min)
// User tries to access /dashboard

1. GET /api/dashboard → 401 Unauthorized

2. Frontend calls:
   POST /api/auth/refresh
   Body: {"refreshToken": "OLD_EXPIRED_REFRESH_TOKEN"}

3. Server response:
   401 Unauthorized
   {
     "error": "Refresh token expired",
     "code": "REFRESH_TOKEN_EXPIRED"
   }

Expected:
- Frontend catches 401 from refresh attempt
- Clears all auth state
- Redirects to /auth/login with message: "Session expired, please login again"
- User must enter credentials again

Actual: [ ]
Status: [ ]
```

#### Test Case 5.2.4: Concurrent Requests During Session Refresh
```javascript
// Scenario: Multiple tabs/requests while token expired

Timeline:
T0: Tab 1 tries API call → 401 (token expired)
T0: Tab 2 tries API call → 401 (token expired)

T1: Tab 1 starts refresh request
T1: Tab 2 also starts refresh request (race condition)

Expected:
- Tab 1 refresh: Response with new token
- Tab 2 refresh: Also gets response with new token
  (Both should be valid, or one returns same token as other)

OR (Better approach with refresh token locking):
- Tab 1 refresh: Acquires lock, gets new token
- Tab 2 refresh: Waits for Tab 1, uses same new token
- Both tabs continue with same valid token

Database state: Only one new token issued

Actual: [ ]
Status: [ ]
```

---

## SECTION 6: RACE CONDITION CHECKLIST

### 6.1 Critical Race Conditions

- [ ] **Double-Submit**: Submit button clicked twice
  - Test: Disable button while submitting
  - Status: [ ] PASS / [ ] FAIL

- [ ] **Concurrent Edits**: Two users edit same record
  - Test: Conflict detection with updated_at timestamp
  - Status: [ ] PASS / [ ] FAIL

- [ ] **Lost Update**: Edit overwrites changes by another user
  - Test: Use optimistic locking (updated_at in WHERE clause)
  - Status: [ ] PASS / [ ] FAIL

- [ ] **Inventory Race**: Two transactions reduce qty simultaneously
  - Test: Lock row during decrement or use atomic operation
  - Status: [ ] PASS / [ ] FAIL

- [ ] **Session Refresh Race**: Multiple refresh requests in-flight
  - Test: Use mutex/lock or idempotency
  - Status: [ ] PASS / [ ] FAIL

- [ ] **Payment Double-Charge**: Payment submitted twice
  - Test: Use Idempotency-Key header
  - Status: [ ] PASS / [ ] FAIL

---

## SECTION 7: PARTIAL SAVE & DATA CONSISTENCY

### 7.1 Transaction Atomicity Tests

#### Test Case 7.1.1: All-or-Nothing Principle
```javascript
// Scenario: Create transaction with 3 items

Transaction Steps:
1. INSERT transaction record ✓
2. INSERT transaction_items[0] ✓
3. INSERT transaction_items[1] ✓
4. INSERT transaction_items[2] ← FAILS (item_id invalid)
5. UPDATE items qty ← NEVER REACHED

Expected: ROLLBACK all steps 1-4
Result: No transaction, no items, inventory unchanged

Verify:
SELECT COUNT(*) FROM transactions WHERE id = 'trans_new';
-- Should be 0 (rolled back)

SELECT COUNT(*) FROM transaction_items WHERE transaction_id = 'trans_new';
-- Should be 0 (rolled back)

Actual: [ ]
Status: [ ]
```

#### Test Case 7.1.2: Inventory Consistency
```javascript
// Scenario: Concurrent purchases of last item

Item A: qty = 1 (only 1 left)

Transaction 1: Buy 1 × Item A
Transaction 2: Buy 1 × Item A (same moment)

Expected (with pessimistic locking):
- Transaction 1: COMMITS
  - Item A qty: 1 → 0
- Transaction 2: ROLLS BACK
  - Item A qty: remains 0
  - Error: "Item out of stock"

Verify: Only 1 transaction succeeded, only 1 decrement

Actual: [ ]
Status: [ ]
```

---

## SECTION 8: SUMMARY & FINDINGS

### State Machine Issues Found:
- [ ] Issue 1: [Flow Name] - [Description]
- [ ] Issue 2: [Description]
- [ ] Issue 3: [Description]

### Race Condition Vulnerabilities:
- [ ] Issue 1: Double-submit possible
- [ ] Issue 2: Lost update possible
- [ ] Issue 3: Payment double-charge possible

### Data Consistency Problems:
- [ ] Issue 1: Partial saves possible
- [ ] Issue 2: Inventory desync possible
- [ ] Issue 3: Transaction rollback not working

### Recommendations:
1. [Fix 1: Implement idempotency keys]
2. [Fix 2: Add optimistic locking]
3. [Fix 3: Use database transactions]
4. [Fix 4: Implement queue-based payment processing]

---

**Audit Date:** [To be filled]  
**Status:** Ready for Execution  
**Auditor:** Backend Transaction Tracing + Frontend State Inspection
