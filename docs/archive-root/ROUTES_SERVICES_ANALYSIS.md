# Warungin Project - Routes & Services Comprehensive Mapping

**Analysis Date:** February 11, 2026  
**Scope:** Comparison between NEW-Warungin (Current) and BACKUP LAST versions

---

## Executive Summary

| Metric | NEW-Warungin | BACKUP LAST | Difference |
|--------|--------------|-------------|-----------|
| Total Route Files | 43 | 57 | -14 routes disabled |
| Service Files | 47 | N/A | Core services |
| Enabled Routes | 43 | 57 | All enabled |
| Disabled Routes | 22 | 0 | Experimental features |
| New Additions | 3 outlet-related | 0 | Bulk ops, import/export, search |

---

## Part 1: NEW-WARUNGIN VERSION (Current)

### A. Enabled Routes (43 Total)

#### 1. **Authentication & Authorization** (5 routes)
```
auth.routes.ts          → /auth
  - POST /login
  - POST /register
  - POST /logout
  - POST /refresh-token
  Service: auth.service
  Middleware: authLimiter, authGuard, logAction
```

#### 2. **Tenant Management** (1 route)
```
tenant.routes.ts        → /tenants
  - POST /tenants (create - SUPER_ADMIN only)
  - GET /tenants (list - SUPER_ADMIN only)
  - GET /tenants/:id
  - GET /tenants/:id/stores
  - GET /tenants/:id/users
  - GET /tenants/:id/subscription
  - PUT /tenants/:id
  - DELETE /tenants/:id
  Service: tenant.service
  Middleware: authGuard, require2FA, auditLogger
```

#### 3. **Product Management** (1 route)
```
product.routes.ts       → /products
  - GET /products (with search, category filter)
  - GET /products/low-stock/all
  - GET /products/:id
  - POST /products
  - PUT /products/:id
  - DELETE /products/:id
  - POST /products/bulk/upload
  Service: product.service, product-adjustment.service
  Middleware: authGuard, subscriptionGuard, supervisorStoresGuard, validate
```

#### 4. **Order Management** (1 route)
```
order.routes.ts         → /orders
  - GET /orders (with status filter)
  - GET /orders/:id
  - POST /orders
  - PUT /orders/:id
  - PUT /orders/:id/status
  - PUT /orders/bulk-update-kitchen
  - DELETE /orders/:id
  Service: order.service
  Middleware: authGuard, roleGuard, subscriptionGuard, supervisorStoreGuard
  Roles: ADMIN_TENANT, SUPERVISOR, CASHIER, KITCHEN
```

#### 5. **Dashboard & Analytics** (1 route)
```
dashboard.routes.ts     → /dashboard
  - GET /dashboard/stats (with optional tenant selection)
  - GET /dashboard/stats/cashier (CASHIER-specific)
  - GET /dashboard/revenue
  - GET /dashboard/top-products
  - GET /dashboard/recent-orders
  Service: dashboard.service
  Middleware: authGuard, subscriptionGuard, supervisorStoresGuard
```

#### 6. **Customer Management** (1 route)
```
customer.routes.ts      → /customers
  - GET /customers (with pagination, search)
  - GET /customers/:id
  - POST /customers
  - PUT /customers/:id
  - DELETE /customers/:id
  Service: customer.service
  Middleware: authGuard, roleGuard, subscriptionGuard, supervisorStoresGuard
  Roles: SUPER_ADMIN, ADMIN_TENANT, SUPERVISOR, CASHIER
```

#### 7. **Member Management** (1 route)
```
member.routes.ts        → /members
  - GET /members (with search, filter by active status)
  - GET /members/code/:code
  - GET /members/:id
  - POST /members
  - PUT /members/:id
  - DELETE /members/:id
  Service: member.service
  Middleware: authGuard, asyncHandler
```

#### 8. **Subscription Management** (1 route)
```
subscription.routes.ts  → /subscriptions
  - GET /subscriptions/current
  - POST /subscriptions/extend (with plan selection)
  - POST /subscriptions/upgrade
  - POST /subscriptions/reduce (SUPER_ADMIN only)
  - GET /subscriptions/history
  Service: subscription.service
  Middleware: authGuard, roleGuard
  Roles: SUPER_ADMIN, ADMIN_TENANT
```

#### 9. **Addon Management** (1 route)
```
addon.routes.ts         → /addons
  - GET /addons/available
  - GET /addons (with pagination - default 50 items)
  - GET /addons/:id
  - POST /addons/:id/subscribe
  - POST /addons/:id/unsubscribe
  Service: addon.service
  Middleware: authGuard, asyncHandler
```

#### 10. **Receipt/Template Management** (1 route)
```
receipt.routes.ts       → /receipts
  - GET /receipts/templates
  - GET /receipts/templates/default
  - GET /receipts/templates/:id
  - POST /receipts/templates
  - PUT /receipts/templates/:id
  - DELETE /receipts/templates/:id
  Service: receipt.service
  Middleware: authGuard, checkReceiptEditorAddon (addon guard), roleGuard
  Roles: SUPER_ADMIN, ADMIN_TENANT
```

#### 11. **User Management** (1 route)
```
user.routes.ts          → /users
  - GET /users (with pagination)
  - GET /users/:id
  - POST /users (create with role-based access)
  - PUT /users/:id
  - DELETE /users/:id
  Service: user.service
  Middleware: authGuard, subscriptionGuard
  Allowed Roles: ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN
```

#### 12. **Reports & Analytics** (1 route)
```
report.routes.ts        → /reports
  - GET /reports/global (SUPER_ADMIN only)
  - GET /reports/tenant (with date range, report type)
  - GET /reports/sales
  - GET /reports/products
  - GET /reports/customers
  Service: report.service
  Middleware: authGuard, roleGuard, subscriptionGuard
  Export Formats: CSV, PDF, EXCEL (requires PRO/MAX plan or addon)
```

#### 13. **Payment Processing** (1 route)
```
payment.routes.ts       → /payment
  - POST /payment/create (via Midtrans)
  - GET /payment/status/:orderId
  - POST /payment/webhook (from Midtrans)
  - POST /payment/webhook/n8n (internal n8n validation)
  - POST /payment/cancel/:orderId
  Service: payment.service
  Integration: Midtrans payment gateway
  Middleware: authGuard, validate
```

#### 14. **Outlet Management** (3 routes)
```
outlet.routes.ts        → /outlets
  - GET /outlets
  - GET /outlets/:id
  - POST /outlets
  - PUT /outlets/:id
  - DELETE /outlets/:id
  Service: outlet.service
  Middleware: authGuard, roleGuard, subscriptionGuard

outlet.advanced.routes.ts → /outlets
  - POST /outlets/bulk/update (max 100 items)
  - POST /outlets/bulk/delete (max 100 items)
  Service: OutletService
  Middleware: authGuard, roleGuard, subscriptionGuard
  NEW ADDITION in New-Warungin

outlet.import-export.routes.ts → /outlets
  - GET /outlets/export/csv
  - POST /outlets/import/csv
  - GET /outlets/export/json
  - POST /outlets/import/json
  Service: outlet.import-export.service
  Middleware: authGuard, roleGuard, createRateLimiter, sanitizeInput
  NEW ADDITION in New-Warungin

outlet.search.routes.ts → /outlets
  - POST /outlets/search/advanced
  - GET /outlets/search/statistics
  - GET /outlets/search/fulltext
  Service: outlet.search.service
  Middleware: authGuard, roleGuard, subscriptionGuard
  NEW ADDITION in New-Warungin
```

#### 15. **Discount Management** (1 route)
```
discount.routes.ts      → /discounts
  - GET /discounts
  - GET /discounts/:id
  - POST /discounts (with multiple discount types)
  - PUT /discounts/:id
  - DELETE /discounts/:id
  Types: AMOUNT_BASED, BUNDLE, PRODUCT_BASED, QUANTITY_BASED
  Service: discount.service
  Middleware: authGuard, subscriptionGuard
```

#### 16. **Delivery Management** (1 route)
```
delivery.routes.ts      → /delivery
  - GET /delivery/orders
  - GET /delivery/orders/:id
  - POST /delivery/orders
  - PUT /delivery/orders/:id/status
  Service: delivery.service
  Middleware: authGuard
```

#### 17. **Employee Management** (1 route)
```
employee.routes.ts      → /employees
  - GET /employees (with pagination, search, filter)
  - GET /employees/stats
  - GET /employees/:id
  - POST /employees
  - PUT /employees/:id
  - DELETE /employees/:id
  Service: employee.service
  Middleware: authGuard, auditLogger
```

#### 18. **Stock Transfer Management** (1 route)
```
stock-transfer.routes.ts → /stock-transfers
  - GET /stock-transfers (with status, outletId filter)
  - GET /stock-transfers/:id
  - POST /stock-transfers
  - PUT /stock-transfers/:id/status
  - PUT /stock-transfers/:id/cancel
  Service: stock-transfer.service
  Middleware: authGuard, subscriptionGuard, supervisorStoresGuard, checkInventoryAccess
```

#### 19. **Stock Alert Management** (1 route)
```
stock-alert.routes.ts   → /stock-alerts
  - GET /stock-alerts
  - POST /stock-alerts
  - PUT /stock-alerts/:id
  - DELETE /stock-alerts/:id
  Service: stock-alert.service
  Middleware: authGuard
```

#### 20. **Transaction Management** (1 route)
```
transaction.routes.ts   → /transactions
  - GET /transactions
  - GET /transactions/:id
  - POST /transactions
  - PUT /transactions/:id
  Service: transaction.service
  Middleware: authGuard
```

#### 21. **Settings Management** (1 route)
```
settings.routes.ts      → /settings
  - GET /settings
  - GET /settings/:key
  - PUT /settings/:key
  - PUT /settings/bulk
  Service: settings.service
  Middleware: authGuard
```

#### 22. **Password Management** (1 route)
```
password.routes.ts      → /password
  - POST /password/change
  - POST /password/reset-request
  - POST /password/reset-verify
  Service: password.service
  Middleware: authGuard, asyncHandler
```

#### 23. **Session Management** (1 route)
```
session.routes.ts       → /sessions
  - GET /sessions
  - POST /sessions/logout
  - POST /sessions/logout-all
  - DELETE /sessions/:id
  Service: session.service
  Middleware: authGuard
```

#### 24. **Two-Factor Authentication** (1 route)
```
2fa.routes.ts           → /2fa
  - POST /2fa/setup
  - POST /2fa/verify
  - POST /2fa/disable
  - GET /2fa/status
  Service: 2fa.service
  Middleware: authGuard
```

#### 25. **Webhook Management** (1 route)
```
webhook.routes.ts       → /webhooks
  - GET /webhooks
  - POST /webhooks
  - PUT /webhooks/:id
  - DELETE /webhooks/:id
  Service: webhook.service
  Middleware: authGuard
```

#### 26. **Audit Log Viewer** (1 route)
```
audit-log.routes.ts     → /audit-logs
  - GET /audit-logs
  - GET /audit-logs/:id
  - GET /audit-logs/user/:userId
  - GET /audit-logs/action/:action
  Service: audit-log.service
  Middleware: authGuard
```

#### 27. **Contact Form** (1 route)
```
contact.routes.ts       → /contact
  - POST /contact/submit
  - GET /contact/submissions (admin)
  - GET /contact/submissions/:id
  Service: contact.service
  Middleware: asyncHandler
```

#### 28. **Tenant Profile** (1 route)
```
tenant-profile.routes.ts → /tenant
  - GET /tenant/profile
  - PUT /tenant/profile
  - GET /tenant/stats
  Service: tenant.service
  Middleware: authGuard
```

#### 29. **Subscription Receipts** (1 route)
```
subscription-receipt.routes.ts → /subscription-receipts
  - GET /subscription-receipts
  - GET /subscription-receipts/:id
  - POST /subscription-receipts/download/:id
  Service: subscription-receipt.service
  Middleware: authGuard
```

#### 30. **Archive Management** (1 route)
```
archive.routes.ts       → /archives
  - GET /archives
  - GET /archives/:id
  - POST /archives/restore/:id
  Service: archive.service
  Middleware: authGuard
```

#### 31. **PDF Generation** (1 route)
```
pdf.routes.ts           → /pdf
  - POST /pdf/generate
  - POST /pdf/receipt/:orderId
  - POST /pdf/invoice/:invoiceId
  Service: pdf.service
  Middleware: authGuard
```

#### 32. **Internal API (n8n Integration)** (1 route)
```
internal.routes.ts      → /internal
  - POST /internal/n8n/webhook
  - POST /internal/sync
  Service: various (internal only)
  Middleware: asyncHandler
  Purpose: n8n webhook integration, internal synchronization
```

#### 33. **Supplier Management** (1 route)
```
supplier.routes.ts      → /suppliers
  - GET /suppliers
  - GET /suppliers/:id
  - POST /suppliers
  - PUT /suppliers/:id
  - DELETE /suppliers/:id
  Service: supplier.service
  Middleware: authGuard
```

#### 34. **Purchase Order Management** (1 route)
```
purchase-order.routes.ts → /purchase-orders
  - GET /purchase-orders
  - GET /purchase-orders/:id
  - POST /purchase-orders
  - PUT /purchase-orders/:id
  - PUT /purchase-orders/:id/status
  Service: purchase-order.service
  Middleware: authGuard
```

#### 35. **Admin Monitor** (1 route)
```
admin-monitor.routes.ts → /admin
  - GET /admin/system-stats
  - GET /admin/tenant-stats
  - GET /admin/user-activity
  Service: admin-monitor.service
  Middleware: authGuard, roleGuard
```

#### 36. **Superadmin Backup** (1 route)
```
superadmin-backup.routes.ts → /superadmin/backups
  - GET /superadmin/backups
  - POST /superadmin/backups/create
  - POST /superadmin/backups/:id/restore
  Service: superadmin-backup.service
  Middleware: authGuard, roleGuard
  Access: SUPER_ADMIN only
```

#### 37. **Tenant Backup** (1 route)
```
tenant-backup.routes.ts → /tenant/backup
  - GET /tenant/backup/status
  - POST /tenant/backup/create
  - GET /tenant/backup/history
  Service: tenant-backup.service
  Middleware: authGuard
```

#### 38. **Cash Shift Management** (1 route)
```
cash-shift.routes.ts    → /cash-shift
  - GET /cash-shift/current
  - POST /cash-shift/open
  - POST /cash-shift/close
  - GET /cash-shift/history
  Service: cash-shift.service
  Middleware: authGuard
```

#### 39. **Store Shift Management** (1 route)
```
store-shift.routes.ts   → /store-shift
  - GET /store-shift
  - POST /store-shift/open
  - POST /store-shift/close
  Service: store-shift.service
  Middleware: authGuard
```

---

### B. Disabled Routes (22 Total)

These routes are **commented out** in `src/routes/index.ts` and not available:

| # | Route File | Expected Path | Service | Status |
|---|------------|---------------|---------|--------|
| 1 | marketing.routes.ts | /marketing | marketing.service | ❌ DISABLED |
| 2 | analytics.routes.ts | /analytics | analytics.service | ❌ DISABLED |
| 3 | finance.routes.ts | /finance | finance.service | ❌ DISABLED |
| 4 | quick-insight.routes.ts | /quick-insight | quick-insight.service | ❌ DISABLED |
| 5 | reward.routes.ts | /rewards | reward-point.service | ❌ DISABLED |
| 6 | metrics.routes.ts | /metrics | metrics.service | ❌ DISABLED |
| 7 | gdpr.routes.ts | /gdpr | gdpr.service | ❌ DISABLED |
| 8 | retention.routes.ts | /retention | retention.service | ❌ DISABLED |
| 9 | email-template.routes.ts | /email-templates | email-template.service | ❌ DISABLED |
| 10 | email-analytics.routes.ts | /email-analytics | email-analytics.service | ❌ DISABLED |
| 11 | email-scheduler.routes.ts | /email-scheduler | email-scheduler.service | ❌ DISABLED |
| 12 | customer-engagement.routes.ts | /customer-engagement | customer-engagement.service | ❌ DISABLED |
| 13 | sms-gateway.routes.ts | /sms-gateway | sms-gateway.service | ❌ DISABLED |
| 14 | push-notification.routes.ts | /push-notifications | push-notification.service | ❌ DISABLED |
| 15 | customer-engagement-enhancement.routes.ts | /customer-engagement | customer-engagement-enhancement.service | ❌ DISABLED |
| 16 | advanced-reporting.routes.ts | /advanced-reporting | advanced-reporting.service | ❌ DISABLED |
| 17 | financial-management-enhancement.routes.ts | /financial-management | financial-management-enhancement.service | ❌ DISABLED |
| 18 | advanced-audit.routes.ts | /advanced-audit | advanced-audit.service | ❌ DISABLED |
| 19 | accounting-integration.routes.ts | /accounting | accounting-integration.service | ❌ DISABLED |
| 20 | payment-gateway-integration.routes.ts | /payment-gateway | payment-gateway-integration.service | ❌ DISABLED |
| 21 | restock-suggestion.routes.ts | /inventory/restock-suggestions | restock-suggestion.service | ❌ DISABLED |
| 22 | price-suggestion.routes.ts | /product/price-suggestion | price-suggestion.service | ❌ DISABLED |

---

### C. Complete Services List (47 Services)

**Core Authentication & User Management (4 services)**
- `auth.service.ts` - Authentication logic
- `user.service.ts` - User management
- `session.service.ts` - Session handling
- `password.service.ts` - Password reset/change

**Business Management (9 services)**
- `tenant.service.ts` - Tenant management
- `product.service.ts` - Product catalog
- `order.service.ts` - Order processing
- `customer.service.ts` - Customer data
- `member.service.ts` - Member management
- `employee.service.ts` - Employee records
- `supplier.service.ts` - Supplier data
- `outlet.service.ts` - Outlet/store management
- `delivery.service.ts` - Delivery tracking

**Financial & Subscription (5 services)**
- `subscription.service.ts` - Subscription management
- `payment.service.ts` - Payment processing
- `addon.service.ts` - Add-on features
- `transaction.service.ts` - Transaction logging
- `payment-gateway-integration.service.ts` - Payment gateway

**Reporting & Analytics (3 services)**
- `dashboard.service.ts` - Dashboard statistics
- `report.service.ts` - Report generation
- `business-metrics.service.ts` - Business metrics

**Inventory (3 services)**
- `stock-transfer.service.ts` - Stock transfers
- `stock-alert.service.ts` - Stock alerts
- `purchase-order.service.ts` - PO management

**Sales & Marketing (2 services)**
- `discount.service.ts` - Discount management
- `receipt.service.ts` - Receipt templates

**Operations (3 services)**
- `cash-shift.service.ts` - Cash register shifts
- `store-shift.service.ts` - Store opening/closing
- `audit-log.service.ts` - Audit logging

**Product Enhancement (2 services)**
- `product-adjustment.service.ts` - Stock adjustments
- `product-cache.service.ts` - Product caching

**Security & Settings (5 services)**
- `2fa.service.ts` - Two-factor auth
- `webhook.service.ts` - Webhook management
- `data-encryption.service.ts` - Data encryption
- `settings.service.ts` - System settings
- `plan-features.service.ts` - Feature checking

**Communication (2 services)**
- `telegram.service.ts` - Telegram integration
- `whatsapp.service.ts` - WhatsApp integration

**Advanced Features (3 services)**
- `loyalty-tier.service.ts` - Loyalty program
- `compliance-reporting.service.ts` - Compliance reports
- `daily-backup.service.ts` - Automated backups

**Support & Integration (2 services)**
- `contact.service.ts` - Contact form handling
- `pdf.service.ts` - PDF generation
- `subscription-receipt.service.ts` - Receipt generation
- `archive.service.ts` - Data archiving
- `multi-location-intelligence.service.ts` - Multi-outlet analytics
- `user-status.service.ts` - User status tracking
- `courier.service.ts` - Courier integration

**Outlet Advanced (2 services)**
- `outlet.import-export.service.ts` - CSV/JSON handling
- `outlet.search.service.ts` - Advanced search

---

## Part 2: BACKUP LAST VERSION (Complete)

### Route Comparison

**BACKUP LAST** has **all 57 routes enabled**, including:

All 43 from NEW-Warungin PLUS these 14 additional routes:

1. `accounting-integration.routes.ts` - Accounting software sync
2. `advanced-audit.routes.ts` - Advanced audit trails
3. `advanced-reporting.routes.ts` - Enhanced reporting
4. `analytics.routes.ts` - Analytics data
5. `customer-engagement.routes.ts` - Customer engagement
6. `customer-engagement-enhancement.routes.ts` - Enhanced engagement
7. `email-analytics.routes.ts` - Email tracking
8. `email-scheduler.routes.ts` - Email campaigns
9. `email-template.routes.ts` - Email templates
10. `finance.routes.ts` - Financial reports
11. `financial-management-enhancement.routes.ts` - Enhanced finances
12. `gdpr.routes.ts` - GDPR compliance
13. `marketing.routes.ts` - Marketing campaigns
14. `metrics.routes.ts` - System metrics
15. `price-suggestion.routes.ts` - AI price suggestions
16. `push-notification.routes.ts` - Push notifications
17. `quick-insight.routes.ts` - Quick analytics
18. `retention.routes.ts` - Customer retention
19. `restock-suggestion.routes.ts` - AI restock
20. `reward.routes.ts` - Reward points
21. `sms-gateway.routes.ts` - SMS integration
22. `payment-gateway-integration.routes.ts` - Payment gateways

---

## Part 3: Key Middleware Components

### Standard Middleware Stack

```typescript
// Authentication
authGuard                   // Verifies JWT token
roleGuard(roles...)        // Checks user role
require2FA                 // Requires 2FA setup for critical operations
authLimiter                // Rate limiting on auth endpoints

// Validation
validate({ body, query, params })  // Zod schema validation
validator                  // Input validation middleware

// Business Logic
subscriptionGuard          // Checks active subscription
supervisorStoresGuard      // Filters by assigned stores
checkInventoryAccess       // Feature-based access
checkReceiptEditorAddon    // Addon-based access
planFeatureGuard           // Plan-based feature access

// Audit & Logging
auditLogger(action, resource)  // Logs actions for audit trail
logAction                      // Records action logs

// Error Handling
asyncHandler               // Wraps async functions for error handling (try-catch)
handleRouteError           // Generic error handler

// Rate Limiting & Security
createRateLimiter(type)    // Rate limiting by type
sanitizeInput              // XSS/injection prevention
```

---

## Part 4: API Response Patterns

All endpoints use consistent response patterns:

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "errors": [{ "field": "error message" }]
}
```

---

## Part 5: Authentication & Authorization Model

### User Roles
```
SUPER_ADMIN              // Full system access
  ├─ Can manage all tenants
  ├─ Can create/manage users
  ├─ Can manage subscriptions
  └─ Can access global reports

ADMIN_TENANT             // Tenant-level admin
  ├─ Can manage tenant users
  ├─ Can manage products, orders, customers
  ├─ Can manage subscription (for own tenant)
  └─ Can access tenant reports

SUPERVISOR              // Store/outlet manager
  ├─ Can manage multiple assigned stores
  ├─ Can manage products, orders, customers (in assigned stores)
  ├─ Can view reports (for assigned stores)
  └─ Can manage staff in assigned stores

CASHIER                 // Point of sale operator
  ├─ Can create orders
  ├─ Can process payments
  ├─ Can view customers
  └─ Can access assigned store only

KITCHEN                 // Kitchen staff
  ├─ Can view orders (for cooking)
  ├─ Can update order status
  └─ Can access assigned outlet only
```

### Token Management
- JWT tokens with refresh mechanism
- Token stored in HTTP-only cookies
- Refresh tokens for extended sessions
- 2FA optional but enforced for sensitive operations

---

## Part 6: Database ORM & Validation

### ORM
- **Prisma** - Primary ORM for database operations
- PostgreSQL - Primary database

### Validation
- **Zod** - Schema validation library
- Validates request bodies, query parameters, and path parameters

### Example Validation Schema
```typescript
const createProductSchema = z.object({
  name: z.string().min(1),
  sku: z.string().unique(),
  price: z.number().positive(),
  category: z.enum(['FOOD', 'BEVERAGE', 'MERCHANDISE']),
  quantity: z.number().int().nonnegative(),
});
```

---

## Part 7: New Features in Current Version (New-Warungin)

### 1. Outlet Advanced Operations
```typescript
// outlet.advanced.routes.ts
POST /outlets/bulk/update   // Update up to 100 outlets simultaneously
POST /outlets/bulk/delete   // Delete up to 100 outlets simultaneously
```

**Purpose:** Improve bulk operation efficiency for large outlet networks

### 2. Outlet Import/Export
```typescript
// outlet.import-export.routes.ts
GET /outlets/export/csv     // Export outlets to CSV
POST /outlets/import/csv    // Import outlets from CSV
GET /outlets/export/json    // Export outlets to JSON
POST /outlets/import/json   // Import outlets from JSON
```

**Service:** `outlet.import-export.service`  
**Middleware:** Rate limiting, input sanitization  
**Max Items:** Validated per operation

### 3. Outlet Advanced Search
```typescript
// outlet.search.routes.ts
POST /outlets/search/advanced      // Advanced filtering
GET /outlets/search/statistics     // Outlet statistics
GET /outlets/search/fulltext       // Full-text search
```

**Service:** `outlet.search.service`  
**Features:** Complex filtering, full-text indexing

---

## Part 8: Disabled Routes Analysis

### Why Disabled?
These 22 routes are disabled in the new version likely because they are:

1. **Premium/Enterprise Features** (requiring separate billing)
   - accounting-integration
   - financial-management-enhancement
   - advanced-reporting

2. **Communication Features** (requiring external API keys)
   - sms-gateway
   - email-scheduler
   - email-template
   - email-analytics
   - push-notification

3. **Advanced Features** (requiring additional setup)
   - gdpr (compliance module)
   - metrics (system monitoring)
   - retention (requires CRM integration)
   - customer-engagement (requires external tools)

4. **AI/ML Features** (experimental)
   - price-suggestion
   - restock-suggestion
   - quick-insight

5. **Financial Features** (requires accounting integration)
   - finance
   - accounting-integration
   - financial-management-enhancement

6. **Analytics** (premium feature)
   - advanced-audit
   - advanced-reporting
   - analytics

7. **Payment Integration** (requires additional setup)
   - payment-gateway-integration (beyond Midtrans)

---

## Part 9: Common Patterns & Best Practices

### 1. Pagination Pattern
```typescript
const page = parseInt(req.query.page as string) || 1;
const limit = parseInt(req.query.limit as string) || 10;
const skip = (page - 1) * limit;

const [data, total] = await Promise.all([
  prisma.model.findMany({ skip, take: limit }),
  prisma.model.count(),
]);

res.json({
  data,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
});
```

### 2. Tenant Isolation
```typescript
// Every query includes tenantId filter
const result = await prisma.order.findMany({
  where: { tenantId },
});

// Multi-tenant route access control
const tenantId = requireTenantId(req);
if (!tenantId) {
  return res.status(400).json({ message: 'Tenant ID required' });
}
```

### 3. Role-Based Access Control
```typescript
router.get(
  '/admin-only',
  authGuard,
  roleGuard('ADMIN_TENANT', 'SUPER_ADMIN'),
  asyncHandler(async (req, res) => {
    // Only admins reach here
  })
);
```

### 4. Feature Gating via Subscription
```typescript
router.get(
  '/export',
  authGuard,
  subscriptionGuard,  // Checks active subscription
  roleGuard('ADMIN_TENANT', 'SUPERVISOR'),
  asyncHandler(async (req, res) => {
    // Check plan level for exports
  })
);
```

---

## Part 10: Development Recommendations

### When Enabling Disabled Routes

1. **Remove comment** from `src/routes/index.ts`
2. **Import statement** must be uncommented
3. **Route registration** must be uncommented
4. **Verify service exists** in `src/services/`
5. **Test all endpoints** in the route file

### Example:
```typescript
// Before (disabled)
// import marketingRoutes from './marketing.routes';
// router.use('/marketing', marketingRoutes);

// After (enabled)
import marketingRoutes from './marketing.routes';
router.use('/marketing', marketingRoutes);
```

---

## Summary Table

| Aspect | NEW-Warungin | BACKUP LAST |
|--------|--------------|------------|
| **Enabled Routes** | 43 | 57 |
| **Disabled Routes** | 22 | 0 |
| **Service Files** | 47 | 50+ |
| **Auth System** | JWT + Optional 2FA | JWT + Optional 2FA |
| **Database** | PostgreSQL + Prisma | PostgreSQL + Prisma |
| **Validation** | Zod | Zod |
| **API Style** | RESTful + Middleware | RESTful + Middleware |
| **Outlet Features** | Basic + Advanced + Import/Export + Search | Basic only |
| **Focus** | Core features | All experimental features |

---

**End of Comprehensive Mapping Analysis**  
**Generated:** 2026-02-11  
**Status:** COMPLETE ✓
