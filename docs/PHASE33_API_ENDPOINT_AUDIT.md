# PHASE 33 - API ENDPOINT AUDIT & VERIFICATION

**Date**: January 17, 2026  
**Purpose**: Map all API endpoints used in frontend vs. available in backend

---

## 🔗 BACKEND ROUTE FILES FOUND

Total backend route files: 129+

Sample routes structure:
- `src/routes/auth.routes.ts`
- `src/routes/addon.routes.ts`
- `src/routes/analytics.routes.ts`
- `src/routes/archive.routes.ts`
- `src/routes/audit-log.routes.ts`
- ... (120+ more)

---

## 📋 FRONTEND API CALLS INVENTORY

### Authentication APIs
- [ ] POST `/auth/login`
- [ ] POST `/auth/logout`
- [ ] GET `/auth/me` (fetch current user)
- [ ] POST `/auth/forgot-password`
- [ ] POST `/auth/reset-password`
- [ ] POST `/auth/2fa/setup`
- [ ] POST `/auth/2fa/verify`

### Dashboard APIs
- [ ] GET `/dashboard/stats`
- [ ] GET `/dashboard/charts`
- [ ] GET `/dashboard/analytics`

### Orders APIs
- [ ] GET `/orders` (list)
- [ ] GET `/orders/:id` (detail)
- [ ] POST `/orders` (create)
- [ ] PUT `/orders/:id` (update)
- [ ] DELETE `/orders/:id` (delete)
- [ ] POST `/orders/:id/print` (receipt)
- [ ] POST `/orders/:id/status` (change status)

### Products APIs
- [ ] GET `/products` (list)
- [ ] GET `/products/:id` (detail)
- [ ] POST `/products` (create)
- [ ] PUT `/products/:id` (update)
- [ ] DELETE `/products/:id` (delete)
- [ ] POST `/products/upload-image` (image upload)
- [ ] GET `/categories` (product categories)

### Customers APIs
- [ ] GET `/customers` (list)
- [ ] GET `/customers/:id` (detail)
- [ ] POST `/customers` (create)
- [ ] PUT `/customers/:id` (update)
- [ ] DELETE `/customers/:id` (delete)
- [ ] GET `/customers/:id/orders` (customer orders)
- [ ] POST `/customers/:id/loyalty-points` (add points)

### Users APIs
- [ ] GET `/users` (list)
- [ ] GET `/users/:id` (detail)
- [ ] POST `/users` (create)
- [ ] PUT `/users/:id` (update)
- [ ] DELETE `/users/:id` (delete)
- [ ] POST `/users/:id/roles` (update roles)
- [ ] POST `/users/:id/permissions` (update permissions)

### Stores APIs
- [ ] GET `/stores` (list)
- [ ] GET `/stores/:id` (detail)
- [ ] POST `/stores` (create)
- [ ] PUT `/stores/:id` (update)
- [ ] DELETE `/stores/:id` (delete)

### Reports APIs
- [ ] GET `/reports` (list available reports)
- [ ] GET `/reports/sales`
- [ ] GET `/reports/products`
- [ ] GET `/reports/customers`
- [ ] GET `/reports/analytics`
- [ ] POST `/reports/export` (export to PDF/Excel)

### Inventory APIs
- [ ] GET `/suppliers` (list)
- [ ] POST `/suppliers` (create)
- [ ] PUT `/suppliers/:id` (update)
- [ ] DELETE `/suppliers/:id` (delete)
- [ ] GET `/purchase-orders`
- [ ] POST `/purchase-orders` (create)
- [ ] PUT `/purchase-orders/:id` (update)
- [ ] GET `/stock-alerts`
- [ ] POST `/stock-alerts` (set alert)
- [ ] GET `/restock-suggestions`
- [ ] GET `/stock-transfers`
- [ ] POST `/stock-transfers` (create)

### Payment APIs
- [ ] GET `/payments` (list)
- [ ] GET `/payment/status/:id` (check status)
- [ ] POST `/payment/callback` (payment webhook)

### Finance APIs
- [ ] GET `/finance/transactions`
- [ ] GET `/finance/accounting`
- [ ] GET `/finance/profit-loss`
- [ ] GET `/finance/cash-flow`

### Analytics APIs
- [ ] GET `/analytics/dashboard`
- [ ] GET `/analytics/sales`
- [ ] GET `/analytics/customers`
- [ ] GET `/analytics/products`

### Subscription APIs
- [ ] GET `/subscription` (get current plan)
- [ ] POST `/subscription/upgrade` (upgrade plan)
- [ ] POST `/subscription/downgrade` (downgrade plan)
- [ ] GET `/invoices` (billing history)

### Addons APIs
- [ ] GET `/addons` (list addons)
- [ ] GET `/addons/active` (active addons)
- [ ] POST `/addons/:id/activate` (activate addon)
- [ ] POST `/addons/:id/deactivate` (deactivate addon)

### Settings APIs
- [ ] GET `/settings` (get all settings)
- [ ] PUT `/settings` (update settings)
- [ ] GET `/settings/preferences`
- [ ] PUT `/settings/preferences`
- [ ] POST `/settings/2fa/enable`
- [ ] POST `/settings/2fa/disable`
- [ ] GET `/sessions` (list sessions)
- [ ] DELETE `/sessions/:id` (delete session)
- [ ] POST `/password/change` (change password)

### Tenant APIs (Super Admin)
- [ ] GET `/tenants` (list)
- [ ] GET `/tenants/:id` (detail)
- [ ] POST `/tenants` (create)
- [ ] PUT `/tenants/:id` (update)
- [ ] DELETE `/tenants/:id` (delete)

### Support APIs
- [ ] GET `/support/tickets` (list)
- [ ] POST `/support/tickets` (create)
- [ ] PUT `/support/tickets/:id` (update)
- [ ] GET `/contact/messages` (super admin contact)

### System APIs (Super Admin)
- [ ] GET `/system/info` (system information)
- [ ] GET `/system/health` (health check)
- [ ] GET `/system/monitor` (resource monitoring)
- [ ] GET `/backup/list` (list backups)
- [ ] POST `/backup/create` (create backup)
- [ ] POST `/backup/restore` (restore backup)

### POS APIs
- [ ] POST `/pos/shift/open` (open cash shift)
- [ ] POST `/pos/shift/close` (close shift)
- [ ] GET `/pos/shift/status` (get shift status)
- [ ] POST `/pos/sync` (sync offline orders)
- [ ] GET `/pos/failed-syncs` (get failed syncs)

---

## 🔴 CRITICAL CHECKS NEEDED

### 1. Route Guard Issues
- [ ] Verify `/app` redirect logic
- [ ] Verify role-based access control
- [ ] Verify addon requirement checks
- [ ] Verify permission checks for CASHIER role
- [ ] Verify shift requirement for CASHIER

### 2. Dead Routes (Routing but no API)
- [ ] Check each route for working backend API
- [ ] Identify missing endpoints
- [ ] Mark as "PENDING API" if needed

### 3. Unused Functions
- [ ] Check for unused methods in each component
- [ ] Check for unused computed properties
- [ ] Check for unused watchers
- [ ] Check for unused API calls

### 4. Broken Imports
- [ ] Verify all component imports resolve
- [ ] Check for circular dependencies
- [ ] Verify all API endpoints exist

### 5. Data Leakage Risks
- [ ] Verify tenant_id isolation in all queries
- [ ] Check for data access without proper filters
- [ ] Verify role-based data access
- [ ] Check for information disclosure vulnerabilities

---

## ✅ VERIFICATION CHECKLIST

For EACH page:

```
┌─ Frontend Verification
│  ├─ [ ] Component file exists
│  ├─ [ ] Route defined in router
│  ├─ [ ] Component imports correctly
│  ├─ [ ] No circular dependencies
│  └─ [ ] No console errors
│
├─ Backend Verification
│  ├─ [ ] API endpoints exist
│  ├─ [ ] Methods match (GET/POST/PUT/DELETE)
│  ├─ [ ] Auth middleware applied
│  ├─ [ ] Role-based access working
│  └─ [ ] Response format matches
│
├─ Database Verification
│  ├─ [ ] Query returns correct data
│  ├─ [ ] Tenant isolation enforced
│  ├─ [ ] No N+1 queries
│  ├─ [ ] Indexes on filtered fields
│  └─ [ ] Foreign keys maintained
│
└─ Routing Verification
   ├─ [ ] No dead links
   ├─ [ ] No orphaned pages
   ├─ [ ] Redirects working
   ├─ [ ] Guard conditions met
   └─ [ ] Navigation working
```

---

## 🎯 NEXT STEPS

1. ✅ Inventory created (78 pages mapped)
2. ⏳ Verify each page's API connections
3. ⏳ Check for unused functions
4. ⏳ Validate all routes
5. ⏳ Generate final report

**Status**: API INVENTORY CREATED - Ready for verification phase

