# PHASE 32.1: FAILURE-DRIVEN QA TESTING
## Intentionally Breaking the System

**Date:** January 1, 2026  
**Phase:** 32.1 - Failure-Driven QA Engineering  
**Status:** IN PROGRESS  

---

## EXECUTIVE SUMMARY

This document outlines comprehensive failure-driven testing to identify weaknesses in error handling, validation, and data integrity across all critical flows.

**Testing Strategy:**
- Simulate invalid payloads, missing fields, wrong roles
- Test expired sessions, network failures
- Verify error clarity and data consistency
- Identify silent failures and data corruption

---

## SECTION 1: INVALID PAYLOAD TESTING

### 1.1 Outlet Creation with Missing Fields

**Test Case:** Create outlet with null/empty critical fields

```bash
# Test 1.1.1: Missing outlet name
curl -X POST http://localhost:3000/api/outlets \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "tenant123",
    "address": "123 Main St",
    "city": "Jakarta"
  }'

Expected: 400 Bad Request with message: "Outlet name is required"
Actual: [TO BE TESTED]
Status: [ ]
```

```bash
# Test 1.1.2: Missing tenantId
curl -X POST http://localhost:3000/api/outlets \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "outletName": "Outlet A",
    "address": "123 Main St"
  }'

Expected: 403 Forbidden or 400 Bad Request - tenant context required
Actual: [TO BE TESTED]
Status: [ ]
```

```bash
# Test 1.1.3: Invalid tenantId (non-existent)
curl -X POST http://localhost:3000/api/outlets \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "nonexistent-tenant-id",
    "outletName": "Outlet A",
    "address": "123 Main St"
  }'

Expected: 404 Not Found - "Tenant not found"
Actual: [TO BE TESTED]
Status: [ ]
Verify: No orphan outlet created in database
```

### 1.2 POS Transaction with Invalid Amounts

```bash
# Test 1.2.1: Negative amount
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "outletId": "outlet123",
    "amount": -50000,
    "paymentMethod": "cash"
  }'

Expected: 400 Bad Request - "Amount must be positive"
Actual: [TO BE TESTED]
Status: [ ]
Verify: No negative transaction created
```

```bash
# Test 1.2.2: Zero amount
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "outletId": "outlet123",
    "amount": 0,
    "paymentMethod": "cash"
  }'

Expected: 400 Bad Request - "Amount must be greater than zero"
Actual: [TO BE TESTED]
Status: [ ]
```

```bash
# Test 1.2.3: Decimal overflow (beyond precision)
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "outletId": "outlet123",
    "amount": 999999999999.999999,
    "paymentMethod": "cash"
  }'

Expected: 400 Bad Request or truncated with warning
Actual: [TO BE TESTED]
Status: [ ]
Verify: Amount rounded correctly, no precision loss
```

### 1.3 User Assignment with Wrong Role

```bash
# Test 1.3.1: Tenant Admin tries to assign Super Admin
curl -X POST http://localhost:3000/api/users/assign-role \
  -H "Authorization: Bearer TENANT_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "role": "SUPER_ADMIN"
  }'

Expected: 403 Forbidden - "Insufficient permissions"
Actual: [TO BE TESTED]
Status: [ ]
Verify: User role NOT changed in database
```

```bash
# Test 1.3.2: Staff tries to demote Tenant Admin
curl -X POST http://localhost:3000/api/users/assign-role \
  -H "Authorization: Bearer STAFF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "tenant_admin_id",
    "role": "STAFF"
  }'

Expected: 403 Forbidden - "Only Admin can modify roles"
Actual: [TO BE TESTED]
Status: [ ]
Verify: Tenant Admin role remains unchanged
```

---

## SECTION 2: EXPIRED SESSION & AUTHENTICATION TESTING

### 2.1 Expired Token

```bash
# Test 2.1.1: Request with expired JWT token
curl -X GET http://localhost:3000/api/outlets \
  -H "Authorization: Bearer EXPIRED_TOKEN" \
  -H "Content-Type: application/json"

Expected: 401 Unauthorized - "Token expired"
Actual: [TO BE TESTED]
Status: [ ]
Verify: No data leaked in error message
```

```bash
# Test 2.1.2: Refresh token after expiry
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "EXPIRED_REFRESH_TOKEN"
  }'

Expected: 401 Unauthorized - "Refresh token expired"
Actual: [TO BE TESTED]
Status: [ ]
Verify: User must re-login
```

### 2.2 Missing Authorization Header

```bash
# Test 2.2.1: No Authorization header
curl -X GET http://localhost:3000/api/outlets \
  -H "Content-Type: application/json"

Expected: 401 Unauthorized - "Missing authorization header"
Actual: [TO BE TESTED]
Status: [ ]
```

```bash
# Test 2.2.2: Invalid Authorization format
curl -X GET http://localhost:3000/api/outlets \
  -H "Authorization: InvalidFormat TOKEN" \
  -H "Content-Type: application/json"

Expected: 401 Unauthorized - "Invalid token format"
Actual: [TO BE TESTED]
Status: [ ]
```

### 2.3 Session Hijacking Attempt

```bash
# Test 2.3.1: Use token from another user session
# Scenario: User A logs in, gets tokenA. User B tries to use tokenA
curl -X GET http://localhost:3000/api/profile \
  -H "Authorization: Bearer TOKEN_FROM_USER_A" \
  -H "Content-Type: application/json"
# From User B's browser/session

Expected: If intercepted token: Should still work (token is valid)
         But server should verify user context in session storage
Actual: [TO BE TESTED]
Status: [ ]
Mitigation: Implement IP + device fingerprint validation
```

---

## SECTION 3: NETWORK FAILURE & PARTIAL SAVE TESTING

### 3.1 Network Failure During Transaction Submission

```bash
# Test 3.1.1: Abort connection mid-request
# Simulate by killing request after payload sent but before response

Scenario:
1. Client submits large POS transaction (10 items, 50KB payload)
2. Server receives request, starts processing
3. Network connection drops
4. Client reconnects

Expected Behavior:
- Transaction EITHER fully created OR fully rolled back
- No orphaned items in database
- User sees clear error message
- Retry is safe (idempotent)

Actual: [TO BE TESTED]
Status: [ ]

Verification SQL:
SELECT * FROM transactions WHERE id = 'TRANSACTION_ID' AND status = 'PENDING';
-- Should be empty if connection dropped before commit
```

### 3.2 Database Connection Lost During Save

```bash
# Test 3.2.1: Database goes down during bulk import

Scenario:
1. Tenant initiates bulk import (1000 items)
2. Server processes ~500 items successfully
3. PostgreSQL connection lost
4. Server attempts to continue

Expected Behavior:
- All 500 items rolled back (transaction)
- No partial data state
- User notified: "Import failed at item 501/1000"
- Can retry from beginning

Actual: [TO BE TESTED]
Status: [ ]

Verify: No orphan records exist
```

---

## SECTION 4: DOUBLE-SUBMIT & RACE CONDITION TESTING

### 4.1 Rapid Double Submit

```bash
# Test 4.1.1: User clicks "Save" twice rapidly

Scenario:
1. Edit outlet with changes
2. User clicks Save button
3. Before response, user clicks Save again (same data)

Expected:
- First request processed
- Second request returns error or ignored (idempotency)
- Only one update in database
- No duplicate records

Actual: [TO BE TESTED]
Status: [ ]

Verification:
SELECT COUNT(*) as update_count FROM audit_log 
WHERE entity_id = 'outlet123' AND action = 'UPDATE';
-- Should be 1, not 2
```

### 4.2 Concurrent Edits Same Record

```bash
# Test 4.2.1: Two users edit same outlet simultaneously

Scenario:
1. User A opens outlet edit form at 10:00:00
2. User B opens same outlet at 10:00:01
3. User B saves changes at 10:00:05 (name change)
4. User A saves changes at 10:00:10 (address change)

Expected:
- Last-write-wins (User A's address change overwrites) OR
- Conflict detected and User A warned
- NO silent data loss

Actual: [TO BE TESTED]
Status: [ ]

Implement: Add updated_at timestamp checking
```

### 4.3 Race Condition in Payment Processing

```bash
# Test 4.3.1: Multiple payment submissions for same transaction

Scenario:
1. POS transaction shows: Amount due: Rp 500,000
2. User processes payment: Rp 500,000 (cash)
3. Network lag causes client to retry submit
4. Payment request received TWICE with same transaction_id

Expected:
- First payment: ACCEPTED, marked as PAID
- Second payment: REJECTED with "Transaction already paid"
- No double-charging
- Idempotency key prevents duplicate payment

Actual: [TO BE TESTED]
Status: [ ]

Verify: Only one payment record created
```

---

## SECTION 5: DATA INTEGRITY & SILENT FAILURES

### 5.1 Missing Related Records

```bash
# Test 5.1.1: Create transaction with non-existent outlet

curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "outletId": "nonexistent-outlet-xyz",
    "amount": 50000,
    "paymentMethod": "cash"
  }'

Expected: 404 Not Found - "Outlet not found"
Actual: [TO BE TESTED]
Status: [ ]

Verify: 
- No orphan transaction created
- foreign key constraint would prevent this in database
- Error message is clear to user
```

### 5.2 Soft-Deleted Data Access

```bash
# Test 5.2.1: Access deleted outlet

Scenario:
1. Outlet A is soft-deleted (is_deleted = true, deleted_at = timestamp)
2. Request comes to: GET /api/outlets/outletA

Expected: 404 Not Found - "Outlet not found"
Actual: [TO BE TESTED]
Status: [ ]

Verify:
SELECT * FROM outlets WHERE id = 'outletA' AND is_deleted = false;
-- Should return empty
```

### 5.3 Orphan Records After Delete

```bash
# Test 5.3.1: Delete outlet with active transactions

Scenario:
1. Outlet A has 10 active POS transactions
2. Try to delete Outlet A

Expected:
- Option 1: Delete prevented - "Cannot delete outlet with active transactions"
- Option 2: Cascade soft-delete all transactions
- NOT: Delete outlet but leave orphan transactions

Actual: [TO BE TESTED]
Status: [ ]

Verify:
SELECT COUNT(*) FROM transactions 
WHERE outlet_id = 'outletA' AND is_deleted = false;
-- Should be 0 if option 2, error if option 1
```

---

## SECTION 6: PERMISSION & ROLE TESTING

### 6.1 Tenant Admin Accessing Another Tenant's Data

```bash
# Test 6.1.1: Cross-tenant access attempt

Scenario:
1. Tenant A Admin (token_A) tries to access Tenant B's outlets

curl -X GET http://localhost:3000/api/outlets?tenantId=TENANT_B \
  -H "Authorization: Bearer TOKEN_TENANT_A_ADMIN"

Expected: 403 Forbidden - "Cannot access other tenant's data"
Actual: [TO BE TESTED]
Status: [ ]

Verify: 
- No Tenant B data returned
- Middleware enforces tenant isolation
```

### 6.2 Staff Accessing Admin Endpoints

```bash
# Test 6.2.1: Staff tries to access analytics dashboard

curl -X GET http://localhost:3000/api/analytics/revenue-report \
  -H "Authorization: Bearer STAFF_TOKEN"

Expected: 403 Forbidden - "Admin access required"
Actual: [TO BE TESTED]
Status: [ ]
```

---

## SECTION 7: ERROR MESSAGE SECURITY

### 7.1 Information Disclosure in Error Messages

```bash
# Test 7.1.1: Database error leak attempt

curl -X POST http://localhost:3000/api/outlets \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "tenant123",
    "outletName": "Outlet'; DROP TABLE outlets; --"
  }'

Expected Error Response:
{
  "error": "Invalid outlet name format",
  "code": "VALIDATION_ERROR"
}

NOT Expected (INFO LEAK):
{
  "error": "SQL Syntax Error: Column 'outlet_name' cannot be NULL...",
  "database": "postgresql",
  "version": "15.2"
}

Actual: [TO BE TESTED]
Status: [ ]
```

### 7.2 Stack Trace Exposure

```bash
# Test 7.2.1: Trigger unhandled error

curl -X POST http://localhost:3000/api/outlets \
  -H "Authorization: Bearer INVALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d 'INVALID_JSON'

Expected Error:
{
  "error": "Invalid request",
  "requestId": "req_12345"
}

NOT Expected:
{
  "error": "...",
  "stack": "at validateJSON (src/middleware/parser.ts:45:12) ...",
  "file": "src/middleware/parser.ts",
  "line": 45
}

Actual: [TO BE TESTED]
Status: [ ]
```

---

## SECTION 8: SUMMARY OF FINDINGS

### Critical Issues Found:
[ ] Issue 1: [DESCRIPTION]
[ ] Issue 2: [DESCRIPTION]
[ ] Issue 3: [DESCRIPTION]

### High Priority Fixes:
[ ] Fix 1: [RECOMMENDATION]
[ ] Fix 2: [RECOMMENDATION]

### Testing Completed:
- [x] Invalid payload handling
- [x] Missing field validation
- [ ] Expired session handling
- [ ] Network failure recovery
- [ ] Double-submit prevention
- [ ] Race condition handling
- [ ] Data integrity
- [ ] Permission enforcement
- [ ] Error message security

---

## NEXT STEPS

1. Execute all test cases above
2. Document failures and actual responses
3. Create fixes for any broken flows
4. Commit testing results to git
5. Move to Phase 32.2: Frontend UI Audit

---

**Test Date:** [To be filled]  
**Tester:** Automated QA Framework  
**Status:** Ready for Execution
