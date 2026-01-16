# PHASE 32.2: FRONTEND UI BEHAVIOR AUDIT
## Complete UI Interaction Map & Dead Element Detection

**Date:** January 1, 2026  
**Phase:** 32.2 - UX and Frontend Behavior Auditor  
**Status:** READY FOR EXECUTION

---

## EXECUTIVE SUMMARY

This document provides a comprehensive audit of ALL UI elements across the Warungin POS system, detecting:
- Buttons that do nothing or redirect incorrectly
- Elements visible but forbidden by role
- Broken navigation and state management
- Orphaned UI components
- Accessibility issues

---

## SECTION 1: DASHBOARD PAGE (/dashboard)

### Page Overview
- **Purpose:** Main entry point after login
- **Roles:** Super Admin, Tenant Admin, Staff
- **Expected Elements:** 8-12 interactive components

### 1.1 Dashboard Header Section

| Element | Type | Expected Behavior | Role Visibility | Status | Issue |
|---------|------|-------------------|------------------|--------|-------|
| Logo | Link | Navigate to /dashboard | All | [ ] | [ ] |
| User Dropdown | Button | Show profile, settings, logout | All | [ ] | [ ] |
| Notifications Bell | Button | Show unread notifications (0-N count) | All | [ ] | [ ] |
| Search Bar | Input | Global search across all entities | All | [ ] | [ ] |
| Theme Toggle | Button | Switch light/dark theme, persist to localStorage | All | [ ] | [ ] |
| Language Selector | Dropdown | Switch i18n locale (ID/EN) | All | [ ] | [ ] |

### 1.2 Dashboard Navigation/Sidebar

| Element | Type | Route | Roles | Expected | Issue |
|---------|------|-------|-------|----------|-------|
| Dashboard | Link | /dashboard | All | Always visible | [ ] |
| Outlets | Link | /outlets | Tenant Admin, Staff | HIDDEN for Super Admin | [ ] |
| Transactions | Link | /transactions | Staff | HIDDEN for Admin roles | [ ] |
| Analytics | Link | /analytics | Tenant Admin | HIDDEN for Staff/Super Admin | [ ] |
| Users | Link | /users | Tenant Admin | HIDDEN for Staff | [ ] |
| Settings | Link | /settings | Tenant Admin | HIDDEN for Super Admin/Staff | [ ] |
| Admin Console | Link | /admin | Super Admin | HIDDEN for others | [ ] |
| Logout | Button | POST /api/auth/logout | All | Visible for all | [ ] |

**Test Case 1.2.1:** Tenant Admin visits /admin
- Expected: Redirected to /dashboard with error message
- Actual: [ ]
- Status: [ ]

**Test Case 1.2.2:** Staff visits /analytics
- Expected: Redirected to /dashboard with 403 Forbidden
- Actual: [ ]
- Status: [ ]

### 1.3 Dashboard Statistics Cards

| Card | Data | Update | Role | Issue |
|------|------|--------|------|-------|
| Revenue (Today) | SUM transactions | Real-time (15s) | Tenant Admin+ | [ ] |
| Transactions (Today) | COUNT transactions | Real-time (15s) | Tenant Admin+ | [ ] |
| Active Outlets | COUNT outlets (is_active=true) | Real-time (15s) | Tenant Admin+ | [ ] |
| Pending Orders | COUNT orders (status=PENDING) | Real-time (15s) | Tenant Admin+ | [ ] |

**Test Case 1.3.1:** Data refresh rate
- Open dashboard, watch Revenue card
- Every 15s, value should update
- If >30s without update: BUG
- Actual: [ ]
- Status: [ ]

**Test Case 1.3.2:** Staff sees only their outlet's data
- Staff A should see only outlets they're assigned to
- Cross-tenant data should NOT appear
- Actual: [ ]
- Status: [ ]

### 1.4 Dashboard Action Buttons

| Button | Action | Requires | Expected Route | Status | Issue |
|--------|--------|----------|-----------------|--------|-------|
| + New Outlet | Create outlet form | Admin | /outlets/new | [ ] | [ ] |
| + New Transaction | POS interface | Staff | /pos/new | [ ] | [ ] |
| View All Analytics | Navigate | Admin | /analytics | [ ] | [ ] |
| Export Dashboard | CSV/PDF | Admin | Download | [ ] | [ ] |
| Settings | Navigate | Admin | /settings | [ ] | [ ] |

**Test Case 1.4.1:** Staff clicks "+ New Outlet" button
- Expected: Button NOT visible OR redirected with error
- Actual: [ ]
- Status: [ ]

**Test Case 1.4.2:** Click "Export Dashboard" with 0 transactions
- Expected: Download file or message "No data to export"
- NOT: Silent failure
- Actual: [ ]
- Status: [ ]

---

## SECTION 2: OUTLETS MANAGEMENT PAGE (/outlets)

### Page Overview
- **Purpose:** List and manage all outlets
- **Roles:** Tenant Admin (all), Staff (view only)
- **Expected Elements:** Table, filters, search, action buttons

### 2.1 Outlets Table

| Column | Sortable | Filterable | Type | Issue |
|--------|----------|------------|------|-------|
| Outlet Name | Yes | Yes (search) | Text | [ ] |
| Location | No | Yes (select) | Text | [ ] |
| Phone | No | No | Text | [ ] |
| Status | Yes | Yes (select: Active/Inactive) | Badge | [ ] |
| Transactions (Today) | Yes | No | Number | [ ] |
| Revenue (Today) | Yes | No | Currency | [ ] |
| Actions | N/A | No | Buttons | [ ] |

**Test Case 2.1.1:** Sort by Revenue (Today) - Click column header
- First click: Ascending (lowest to highest)
- Second click: Descending (highest to lowest)
- Third click: Back to default
- Actual: [ ]
- Status: [ ]

**Test Case 2.1.2:** Filter Status = Inactive
- Should show only outlets with is_active = false
- "Active" status rows should disappear
- Count should update
- Actual: [ ]
- Status: [ ]

### 2.2 Outlets Table Action Buttons

| Button | Text | Roles | Expected Action | Issue |
|--------|------|-------|-----------------|-------|
| View | Eye Icon | Tenant Admin, Staff | Navigate to /outlets/{id} | [ ] |
| Edit | Pencil Icon | Tenant Admin | Navigate to /outlets/{id}/edit | [ ] |
| Delete | Trash Icon | Tenant Admin | Show confirmation modal | [ ] |
| Assign Staff | Users Icon | Tenant Admin | Modal: Select staff → Save | [ ] |

**Test Case 2.2.1:** Staff clicks "Edit" button
- Expected: Button disabled OR no-op
- Actual: [ ]
- Status: [ ]

**Test Case 2.2.2:** Click Delete → Confirm Delete
- Scenario: Outlet has 50 active transactions
- Expected: "Cannot delete outlet with active transactions" error
- NOT: Delete succeeds silently
- Actual: [ ]
- Status: [ ]

**Test Case 2.2.3:** Assign Staff with Staff role
- Expected: Button disabled OR 403 error on API call
- Actual: [ ]
- Status: [ ]

### 2.3 Outlets Create/Edit Form (/outlets/new, /outlets/{id}/edit)

| Field | Type | Required | Rules | Issue |
|-------|------|----------|-------|-------|
| Outlet Name | Text | Yes | Max 100 chars, no special chars | [ ] |
| Address | Textarea | Yes | Max 500 chars | [ ] |
| City | Select | Yes | Dropdown of Indonesian cities | [ ] |
| Phone | Tel | Yes | 10-15 digits, format +62... | [ ] |
| Email | Email | No | Valid email format | [ ] |
| Status | Toggle | Yes | Active/Inactive | [ ] |
| Open Time | Time | No | HH:MM format | [ ] |
| Close Time | Time | No | HH:MM format, must be > Open Time | [ ] |

**Test Case 2.3.1:** Submit form with Outlet Name = "" (empty)
- Expected: Error message "Outlet name is required"
- Field should be highlighted red
- Submit button disabled/no API call
- Actual: [ ]
- Status: [ ]

**Test Case 2.3.2:** Enter Close Time < Open Time
- Open Time: 08:00
- Close Time: 07:00
- Expected: Error "Close time must be after open time"
- Actual: [ ]
- Status: [ ]

**Test Case 2.3.3:** Phone field with invalid format
- Input: "not-a-phone"
- Expected: Error "Phone must be valid (10-15 digits)"
- Actual: [ ]
- Status: [ ]

**Test Case 2.3.4:** Edit form pre-population
- Load /outlets/outlet123/edit
- All fields should pre-populate with current outlet data
- Verify data matches database
- Actual: [ ]
- Status: [ ]

---

## SECTION 3: TRANSACTIONS / POS PAGE (/pos/new)

### Page Overview
- **Purpose:** Create POS transactions
- **Roles:** Staff only
- **Expected Elements:** Item selector, cart, payment form

### 3.1 Item Selection Section

| Element | Type | Expected Behavior | Issue |
|---------|------|-------------------|-------|
| Outlet Selector | Dropdown | Show only assigned outlets | [ ] |
| Item Search | Input | Search by name/SKU | [ ] |
| Item Grid | Grid | Show items with image, name, price | [ ] |
| Add to Cart | Button | Click item → Add quantity to cart | [ ] |

**Test Case 3.1.1:** Staff A clicks outlet not assigned to them
- Expected: Outlet not in dropdown OR API returns 403
- Actual: [ ]
- Status: [ ]

**Test Case 3.1.2:** Search items with keyword "xyz" (no matches)
- Expected: Message "No items found"
- Grid should be empty
- Actual: [ ]
- Status: [ ]

**Test Case 3.1.3:** Item out of stock (quantity = 0)
- Expected: Item shown with "Out of Stock" label
- "Add to Cart" button disabled
- Actual: [ ]
- Status: [ ]

### 3.2 Shopping Cart Section

| Element | Behavior | Issue |
|---------|----------|-------|
| Item Row | Show name, qty, unit price, line total | [ ] |
| Qty Input | Editable text field | [ ] |
| Remove Button | Delete from cart | [ ] |
| Subtotal | SUM(qty × price) | [ ] |
| Discount Input | Percentage or amount | [ ] |
| Tax | SUM(subtotal × tax_rate) | [ ] |
| Total | Subtotal + Tax - Discount | [ ] |

**Test Case 3.2.1:** Edit item quantity in cart
- Add Item A (qty=1, price=50k)
- Change qty to 5
- Line total should show 250k
- Subtotal should update immediately
- Actual: [ ]
- Status: [ ]

**Test Case 3.2.2:** Enter discount = 0
- Expected: No discount applied
- Actual: [ ]
- Status: [ ]

**Test Case 3.2.3:** Enter discount = 50% with Subtotal = 100k
- Expected: Discount = 50k, Total = 50k (+ tax)
- Actual: [ ]
- Status: [ ]

**Test Case 3.2.4:** Qty field = -5
- Expected: Error or auto-correct to 1
- NOT: Allow negative quantity
- Actual: [ ]
- Status: [ ]

### 3.3 Payment Section

| Field | Type | Rules | Issue |
|-------|------|-------|-------|
| Payment Method | Select | Cash, Card, Transfer, Check | [ ] |
| Amount Paid | Number | Must be ≥ Total | [ ] |
| Change | Display | Amount Paid - Total | [ ] |
| Notes | Textarea | Optional | [ ] |
| Submit Button | Button | Disabled until valid | [ ] |

**Test Case 3.3.1:** Amount Paid < Total
- Total = 100k
- Amount Paid = 50k
- Expected: Error "Amount must be ≥ total" OR "Insufficient payment"
- Submit button disabled
- Actual: [ ]
- Status: [ ]

**Test Case 3.3.2:** Select payment method = Card
- Expected: Additional fields appear (Card last 4 digits, reference number)
- Actual: [ ]
- Status: [ ]

**Test Case 3.3.3:** Submit transaction with empty cart
- Expected: Error "Cart is empty"
- Transaction NOT created
- Actual: [ ]
- Status: [ ]

---

## SECTION 4: USERS MANAGEMENT PAGE (/users)

### Page Overview
- **Purpose:** Manage tenant staff
- **Roles:** Tenant Admin only
- **Expected Elements:** User table, create, edit, delete buttons

### 4.1 Users Table

| Column | Content | Sortable | Issue |
|--------|---------|----------|-------|
| Name | User full name | Yes | [ ] |
| Email | User email | No | [ ] |
| Role | STAFF/ADMIN | Yes | [ ] |
| Status | Active/Inactive | Yes | [ ] |
| Last Login | Timestamp | Yes | [ ] |
| Actions | Edit/Delete/Reset Password | N/A | [ ] |

**Test Case 4.1.1:** Staff logs in and navigates to /users
- Expected: 403 Forbidden OR redirected to /dashboard
- Users page should NOT load
- Actual: [ ]
- Status: [ ]

### 4.2 User Action Buttons

| Button | Expected | Role Check | Issue |
|--------|----------|-----------|-------|
| + New User | Navigate to /users/new form | Tenant Admin | [ ] |
| Edit | Navigate to /users/{id}/edit | Tenant Admin | [ ] |
| Delete | Confirmation modal, soft-delete | Tenant Admin | [ ] |
| Reset Password | Send email with link | Tenant Admin | [ ] |
| Deactivate | Toggle is_active = false | Tenant Admin | [ ] |

**Test Case 4.2.1:** Delete the last Tenant Admin user
- Expected: Error "Cannot delete last admin user"
- NOT: Delete succeeds
- Actual: [ ]
- Status: [ ]

**Test Case 4.2.2:** Deactivate own account
- Tenant Admin A deactivates their own user
- Expected: Logout immediately OR warning "You are deactivating your own account"
- Actual: [ ]
- Status: [ ]

### 4.3 Create/Edit User Form

| Field | Validation | Issue |
|-------|-----------|-------|
| Name | Required, max 100 chars | [ ] |
| Email | Required, unique per tenant, valid format | [ ] |
| Role | STAFF or ADMIN (dropdown) | [ ] |
| Status | Active/Inactive (toggle) | [ ] |
| Assign Outlets | Checkboxes of all outlets | [ ] |

**Test Case 4.3.1:** Create user with duplicate email (within same tenant)
- Email already exists for another user
- Expected: Error "Email already in use"
- User NOT created
- Actual: [ ]
- Status: [ ]

**Test Case 4.3.2:** Create staff user with no assigned outlets
- Leave "Assign Outlets" unchecked
- Expected: Warning "Staff must be assigned to at least one outlet"
- OR: Auto-skip this field for non-staff
- Actual: [ ]
- Status: [ ]

---

## SECTION 5: ANALYTICS PAGE (/analytics)

### Page Overview
- **Purpose:** Business intelligence & reporting
- **Roles:** Tenant Admin, Super Admin
- **Expected Elements:** Filters, date range, charts, export

### 5.1 Analytics Filters

| Filter | Type | Default | Issue |
|--------|------|---------|-------|
| Date Range | Date picker | Last 30 days | [ ] |
| Outlet | Multi-select | All | [ ] |
| Payment Method | Checkbox | All | [ ] |
| Status | Select | Completed | [ ] |

**Test Case 5.1.1:** Select invalid date range (Start > End)
- Start Date: Jan 31, 2026
- End Date: Jan 1, 2026
- Expected: Error or auto-correct
- Charts should NOT render with invalid data
- Actual: [ ]
- Status: [ ]

**Test Case 5.1.2:** Select future date range
- Start: Jan 1, 2027
- End: Dec 31, 2027
- Expected: "No data available" message
- Charts should be empty
- Actual: [ ]
- Status: [ ]

### 5.2 Analytics Charts & Metrics

| Chart | Type | Data Source | Update Frequency | Issue |
|-------|------|-------------|------------------|-------|
| Revenue Trend | Line Chart | SUM(amount) per day | Real-time | [ ] |
| Transaction Count | Bar Chart | COUNT(*) per outlet | Real-time | [ ] |
| Payment Methods Pie | Pie Chart | COUNT(*) per method | Real-time | [ ] |
| Top Items | Table | SUM(qty) per item | 15s | [ ] |

**Test Case 5.2.1:** Filter by single outlet
- Select Outlet A only
- All charts should show only Outlet A data
- Verify with manual calculation
- Actual: [ ]
- Status: [ ]

**Test Case 5.2.2:** Export analytics report as CSV
- Click "Export" button
- Expected: Download CSV file with data
- File should be properly formatted
- Actual: [ ]
- Status: [ ]

**Test Case 5.2.3:** Chart displays NaN or error
- If data fetch fails, chart should show error message
- NOT: Blank/empty chart with no explanation
- Actual: [ ]
- Status: [ ]

---

## SECTION 6: SETTINGS PAGE (/settings)

### Page Overview
- **Purpose:** Account and business settings
- **Roles:** Tenant Admin, Super Admin
- **Expected Elements:** Tabs for different settings sections

### 6.1 Settings Navigation Tabs

| Tab | Visibility | Expected Content | Issue |
|-----|-----------|------------------|-------|
| Business Info | Tenant Admin+ | Company name, tax ID, phone | [ ] |
| Security | All | Password, 2FA, API keys | [ ] |
| Notifications | All | Email preferences, notification channels | [ ] |
| Integrations | Tenant Admin+ | Third-party API keys | [ ] |
| Billing | Super Admin | Subscription, invoice history | [ ] |

**Test Case 6.1.1:** Staff clicks "Settings" in navigation
- Expected: "Settings not accessible" error OR navigation hidden
- Actual: [ ]
- Status: [ ]

### 6.2 Business Info Form

| Field | Validation | Issue |
|-------|-----------|-------|
| Company Name | Required, max 100 chars | [ ] |
| Tax ID | Required, unique, format validation | [ ] |
| Phone | Required, valid format | [ ] |
| Address | Optional, max 500 chars | [ ] |
| Save Button | Disabled until changes made | [ ] |

**Test Case 6.2.1:** Save without making changes
- Click Save directly
- Expected: Button disabled OR "No changes to save"
- No API call
- Actual: [ ]
- Status: [ ]

**Test Case 6.2.2:** Tax ID already in use by another tenant
- Expected: Error "Tax ID already registered"
- NOT: Duplicate tax ID allowed
- Actual: [ ]
- Status: [ ]

### 6.3 Security Settings

| Feature | Expected Behavior | Issue |
|---------|-------------------|-------|
| Change Password | Current password required, new ≠ old | [ ] |
| Two-Factor Auth | Toggle TOTP/SMS | [ ] |
| API Keys | Generate/revoke with expiry | [ ] |
| Session Management | List active sessions, logout all | [ ] |

**Test Case 6.3.1:** Change password with wrong current password
- Expected: Error "Current password is incorrect"
- Password NOT changed
- Actual: [ ]
- Status: [ ]

**Test Case 6.3.2:** Generate API key
- Expected: Key displayed once, can copy to clipboard
- Subsequent views should NOT show full key
- Only show last 4 characters
- Actual: [ ]
- Status: [ ]

---

## SECTION 7: LOGIN & AUTHENTICATION PAGES

### 7.1 Login Form (/auth/login)

| Field | Validation | Issue |
|-------|-----------|-------|
| Email | Required, valid format | [ ] |
| Password | Required, min 8 chars | [ ] |
| Remember Me | Checkbox | [ ] |
| Submit | Disabled until valid | [ ] |

**Test Case 7.1.1:** Submit with empty email
- Expected: Error "Email is required"
- Form should not submit
- Actual: [ ]
- Status: [ ]

**Test Case 7.1.2:** Submit with non-existent email
- Expected: Error "Email or password incorrect" (generic)
- NOT: "User not found" (security)
- Actual: [ ]
- Status: [ ]

**Test Case 7.1.3:** After 5 failed login attempts
- Expected: "Account locked. Try again in 30 minutes"
- OR: CAPTCHA appears
- Actual: [ ]
- Status: [ ]

### 7.2 Two-Factor Authentication (/auth/2fa)

| Element | Expected | Issue |
|---------|----------|-------|
| Code Input | 6-digit TOTP or SMS code | [ ] |
| Resend Button | Disabled first 30s | [ ] |
| Verify Button | Disabled until code entered | [ ] |

**Test Case 7.2.1:** Enter expired TOTP code
- Wait 30s after generating code
- Codes expire every 30s
- Expected: Error "Code expired"
- Actual: [ ]
- Status: [ ]

---

## SECTION 8: DEAD UI ELEMENTS CHECKLIST

### 8.1 Broken Buttons & Links

- [ ] Button that does nothing (click → no action)
- [ ] Link that 404s (broken route)
- [ ] Button visible but forbidden (should be hidden)
- [ ] Loading state that never completes
- [ ] Modal that won't close
- [ ] Form submit that silently fails

### 8.2 Role-Based Visibility

**Super Admin should NOT see:**
- [ ] "New Outlet" button
- [ ] "Assign Staff" button
- [ ] Individual outlet edit pages
- [ ] Personal staff management

**Staff should NOT see:**
- [ ] "Create User" button
- [ ] "Settings" menu
- [ ] "Analytics" page
- [ ] "Billing" tab
- [ ] "Edit Outlet" buttons

**Tenant Admin should NOT see:**
- [ ] "Admin Console" menu
- [ ] "System Settings" page
- [ ] Super Admin-only analytics

### 8.3 Accessibility Issues

- [ ] Form labels missing or not associated with inputs
- [ ] Images missing alt text
- [ ] Color-only indicators (no text)
- [ ] No keyboard navigation (tab through all elements)
- [ ] Buttons not distinguishable from text links

---

## SECTION 9: SUMMARY & FINDINGS

### Dead UI Elements Found:
[ ] Element 1: [Description]
[ ] Element 2: [Description]
[ ] Element 3: [Description]

### Role-Based Visibility Issues:
[ ] Issue 1: [Description]
[ ] Issue 2: [Description]

### Navigation & Routing Issues:
[ ] Issue 1: [Description]
[ ] Issue 2: [Description]

### Recommendations:
1. [Fix 1]
2. [Fix 2]
3. [Fix 3]

---

**Audit Date:** [To be filled]  
**Status:** Ready for Execution  
**Tester:** Manual UI Inspection + Automated Testing
