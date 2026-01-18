# PHASE 34: PAGE & ROUTE RESTRUCTURING ANALYSIS

**Date**: January 17, 2026  
**Status**: Analysis in progress

---

## 1️⃣ PROBLEMATIC PAGES IDENTIFIED

### 🔴 CRITICAL ISSUES (Must Fix)

#### A. Page Dengan Fungsi Tidak Jelas
| Page | Path | Issue | Root Cause |
|------|------|-------|-----------|
| **Dashboard** | `/app/dashboard` | Dipakai semua role (ADMIN, KASIR, SPV, DAPUR) | Tidak ada differensiasi |
| **Reports** | `/app/reports` | Generik, tidak spesifik | Tidak jelas untuk siapa |
| **Settings** | Multiple: `/app/settings/*` | Terlalu banyak sub-page (12 halaman!) | Tidak ada grouping logis |
| **Stores** | `/app/stores` | Multi-purpose (list, detail, edit semua jadi satu) | Redundant routing |

#### B. Page Yang Overlap (Duplikasi Fungsi)
| Primary | Secondary | Issue | Solusi |
|---------|-----------|-------|--------|
| **Orders** | Kitchen Orders (fullscreen) | Sama-sama manage orders | Gabung jadi 1 page, 2 view |
| **Reports** | Global Reports | Report tapi level berbeda | Buat unified reporting |
| **Stores** | Store Detail + Edit Store | Data management page | Gabung jadi 1 page |
| **Tenants** | Tenant Detail | Management interface | Gabung dengan parent |
| **Users** | Session Management | User management | Buat sub-section |

#### C. Page Dengan Role Tidak Sesuai
| Page | Current Roles | Issue | Should Be |
|------|---------------|-------|-----------|
| **Dashboard** | ADMIN, SUPERVISOR, CASHIER, KITCHEN | Sama layout | Buat role-based dashboard |
| **Orders** | Semua role | Kasir/Kitchen lihat berbeda | Buat conditional view |
| **Reports** | ADMIN, SUPERVISOR, CASHIER | Kasir tidak perlu report | Restrict untuk SUPERVISOR |

---

## 🔍 PAGE INVENTORY & CATEGORIZATION

### Group A: Marketing (Public - NO AUTH)
```
✅ Home, Demo, Contact, Terms, Pricing
✅ Help, Help Article, Help Category
✅ Contact Success
Status: OK (tidak perlu perubahan)
```

### Group B: Authentication (Public - NO AUTH)
```
✅ Login, Forgot Password
Status: OK
```

### Group C: Payment (Callback - Public)
```
⚠️ Payment Success/Error/Pending (single component, 3 routes)
Rekomendasi: KEEP (sudah efisien)
```

### Group D: SUPER ADMIN ONLY 🔴 NEEDS RESTRUCTURE
**Current**:
```
/app/tenants (list) → /app/tenants/:id (detail) → /app/tenants/support (tickets)
/app/super-dashboard
/superadmin/contact-messages
/superadmin/server-monitor
/superadmin/system-info
/superadmin/backups
/settings/system
/settings/archive
/settings/retention
```

**Problems**:
- Routes tidak konsisten: `/app/tenants` vs `/superadmin/*` vs `/settings/*`
- Terlalu banyak sub-page terpisah
- Management tenant tercampur dengan operasional

**Solusi**:
Buat struktur `/super-admin/*` yang konsisten dan terpusat

---

### Group E: OPERASIONAL (ADMIN + SUPERVISOR + CASHIER + KITCHEN) 🔴 NEEDS RESTRUCTURE
**Current Mixed Routes**:
```
POS:
- /pos (fullscreen)
- /app/orders
- /app/orders/kitchen (separate)

Management:
- /app/products
- /app/customers
- /app/orders (again)

Inventory:
- /app/inventory/suppliers
- /app/inventory/purchase-orders
- /app/inventory/stock-alerts
- /app/inventory/restock-suggestions
- /app/inventory/stock-transfers

Finance:
- /app/finance/management
- /app/analytics
- /app/finance/transactions
- /app/profit-loss

Reports:
- /app/reports
- /app/reports/advanced
- /app/reports/stores

Other:
- /app/cashier/cash-shift
- /app/pos/failed-syncs
- /app/products/adjustments
- /app/receipts/templates
- /app/rewards
- /app/discounts
- /app/delivery (addon)
```

**Problems**:
1. **POS Management split**:
   - `/pos` (fullscreen) vs `/app/orders` vs `/app/orders/kitchen`
   - Semua manage orders tapi route berbeda

2. **Inventory scattered**:
   - 5 page inventory di `/app/inventory/*`
   - Tidak ada parent view

3. **Finance scattered**:
   - `/app/finance/*` vs `/app/analytics` vs `/app/profit-loss`
   - Tidak konsisten

4. **Reports scattered**:
   - `/app/reports` vs `/app/reports/advanced` vs `/app/reports/stores`
   - Redundant

---

### Group F: ADMIN TENANT ONLY 🟡 NEEDS MINOR FIX
**Current**:
```
/app/users
/app/stores
/app/subscription
/app/addons
/app/support
```

**Status**: Mostly OK, but needs role validation

---

### Group G: SHARED SETTINGS 🟡 NEEDS CLEANUP
**Current** (12 separate pages!):
```
/app/settings/preferences
/app/settings/store
/app/settings/2fa
/app/settings/webhooks
/app/settings/webhooks/tester
/app/settings/sessions
/app/settings/password
/app/settings/gdpr
/app/settings/system (SUPER_ADMIN)
/app/settings/archive (SUPER_ADMIN)
/app/settings/retention (SUPER_ADMIN)
/app/settings/subscription
```

**Plus 5 style guides** (shouldn't be in production)

**Problem**: Too many separate pages

**Solution**: Consolidate to 3-4 logical sections

---

## 📊 CONSOLIDATION OPPORTUNITIES

### To Merge (Same Function)
1. **Orders Management**:
   - `/app/orders` + `/app/orders/kitchen` → **ONE page** with conditional views
   - `/pos` (fullscreen) → Still separate (different UX)
   - `/app/pos/failed-syncs` → Modal in orders

2. **Store Management**:
   - `/app/stores` + `/app/stores/:id` + `/app/stores/:id/edit` → **ONE page** with edit modal

3. **Reports**:
   - `/app/reports` + `/app/reports/advanced` + `/app/reports/stores` → **Unified reporting** with tabs

4. **Finance**:
   - `/app/finance/*` + `/app/analytics` → **Consolidated** under `/app/finance`

5. **Settings**:
   - 12 separate → **Group to 4-5 logical sections**

6. **Tenant Management**:
   - `/app/tenants/:id` detail pages → **Embed in list view** with sidebar/modal

### To Separate (Currently Mixed)
1. **POS vs Orders**:
   - `/pos` (fullscreen) = Point of Sale transaction
   - `/app/orders` = Order management (keep separate - different purpose)

2. **Subscriptions**:
   - Currently mixed in settings
   - Should be **standalone** for ADMIN_TENANT

---

## 🎯 NEW STRUCTURE PROPOSAL

### PROPOSED ARCHITECTURE

```
PUBLIC (No Auth Required)
├── Marketing Layout
│   ├── / (home)
│   ├── /demo
│   ├── /contact
│   ├── /contact/success
│   ├── /pricing
│   ├── /terms
│   ├── /help
│   ├── /help/:slug
│   └── /help/category/:categoryId
├── Auth
│   ├── /login
│   ├── /forgot-password
│   └── /payment/{success|error|pending}
└── Error Pages
    ├── /unauthorized
    └── /:pathMatch(.*)*  (404)

═══════════════════════════════════════

SUPER ADMIN (New Separated Group)
├── Base: /super-admin/
├── Dashboard: /super-admin/dashboard
├── Tenants: /super-admin/tenants
├── System:
│   ├── /super-admin/system/info
│   ├── /super-admin/system/monitor
│   ├── /super-admin/system/settings
│   ├── /super-admin/system/backups
│   ├── /super-admin/system/messages
│   └── /super-admin/system/retention
├── Paket & Subscription: /super-admin/subscriptions
└── Global Settings:
    ├── /super-admin/settings/archive
    └── /super-admin/settings/retention

═══════════════════════════════════════

OPERASIONAL (Admin + Supervisor + Cashier + Kitchen)
├── Base: /app/
├── Dashboard: /app/dashboard
├── POS Module:
│   ├── Fullscreen: /pos (no layout)
│   ├── Open Shift: /open-shift (no layout)
│   ├── Kitchen: /kitchen (no layout - fullscreen)
│   └── Management:
│       ├── /app/orders (unified)
│       ├── /app/pos/shift (manage shifts)
│       └── /app/pos/receipts
├── Core Data:
│   ├── /app/products
│   ├── /app/customers
│   ├── /app/inventory (consolidated view)
│   └── /app/rewards
├── Finance & Reports:
│   ├── /app/finance (consolidated)
│   └── /app/reports (unified reporting)
├── Admin Functions (ADMIN/SUPERVISOR):
│   ├── /app/users
│   ├── /app/stores
│   └── /app/subscriptions
└── Settings:
    ├── /app/account (user settings)
    └── /app/store-config (store settings)

═══════════════════════════════════════

ADDON-BASED (Feature Gated)
├── /app/delivery (requires DELIVERY_MARKETING)
├── /app/marketing/campaigns
├── /app/marketing/email
└── /app/marketing/engagement

═══════════════════════════════════════

UTILITIES (Embedded, Not Routes)
├── Modals:
│   ├── Create/Edit Product
│   ├── Create/Edit Customer
│   ├── Create/Edit Order
│   ├── Create/Edit Store
│   └── Failed Sync Review
├── Popups:
│   └── Placeholder: "Fitur sedang dikembangkan"
└── Tabs (in single page):
    ├── Orders with Kitchen tab
    ├── Finance with sub-tabs
    └── Reports with view options
```

---

## 📋 CONSOLIDATION PLAN

### PAGES TO MERGE (Reduce from 78 to ~45)

#### 1. Orders Management (Merge 2 pages → 1)
```
Current:
- /app/orders (list orders)
- /app/orders/kitchen (kitchen view)

Future:
- /app/orders (unified)
  ├── Tab: Orders (for Admin/Supervisor/Cashier)
  └── Tab: Kitchen Display (for Kitchen/Supervisor)
```

#### 2. Stores Management (Merge 3 pages → 1)
```
Current:
- /app/stores (list)
- /app/stores/:id (detail)
- /app/stores/:id/edit

Future:
- /app/stores (list with sidebar detail/edit modal)
```

#### 3. Reports (Merge 3 pages → 1)
```
Current:
- /app/reports (main)
- /app/reports/advanced
- /app/reports/stores

Future:
- /app/reports (unified with report type selector)
  ├── Tab: Sales Report
  ├── Tab: Product Report
  ├── Tab: Customer Report
  └── Tab: Advanced (if addon enabled)
```

#### 4. Finance (Merge 5 pages → 1-2)
```
Current:
- /app/finance (accounting)
- /app/finance/management
- /app/finance/transactions
- /app/analytics
- /app/profit-loss

Future:
- /app/finance (main)
  ├── Tab: Dashboard
  ├── Tab: Transactions
  ├── Tab: Profit & Loss
  ├── Tab: Analytics (if addon)
  └── Tab: Cash Management
```

#### 5. Inventory (Keep but consolidate view)
```
Current:
- /app/inventory/suppliers
- /app/inventory/purchase-orders
- /app/inventory/stock-alerts
- /app/inventory/restock-suggestions
- /app/inventory/stock-transfers

Future:
- /app/inventory (keep same but add parent navigation)
  ├── /app/inventory/suppliers
  ├── /app/inventory/purchase-orders
  ├── /app/inventory/stock-alerts
  ├── /app/inventory/restock-suggestions
  └── /app/inventory/stock-transfers
```

#### 6. Settings (Merge 12 pages → 4)
```
Current: 12 separate pages
Future: 
- /app/account (user settings)
  ├── Password
  ├── 2FA
  ├── Sessions
  ├── GDPR
  └── Preferences
  
- /app/store-config (admin settings)
  ├── Store info
  ├── Webhooks
  ├── Subscription
  └── Addon management

- /super-admin/settings (system settings - moved to super admin)
```

#### 7. Tenant Management (Merge → Single)
```
Current:
- /super-admin/tenants (list)
- /super-admin/tenants/:id (detail)
- /super-admin/tenants/support

Future:
- /super-admin/tenants (list with detail sidebar)
  └── Click to view detail/manage
```

#### 8. Super Admin System (Consolidate)
```
Current: Scattered under /app, /superadmin, /settings
Future: All under /super-admin/system
```

---

## 🗑️ PAGES TO REMOVE

### 1. Style Guides (Production Cleanup)
```
- FormStyleGuide.vue (REMOVE - only for dev)
- TableStyleGuide.vue (REMOVE)
- LoadingStatesGuide.vue (REMOVE)
- AdvancedComponentsGuide.vue (REMOVE)
- AdditionalComponentsGuide.vue (REMOVE)

Action: Delete or move to /docs route (not production)
```

### 2. Redundant Pages
```
- /app/stores/:id/edit (merge into /app/stores)
- /app/orders/kitchen (merge into /app/orders)
- /super-admin/tenants/support (merge or move)
```

---

## ✅ PAGES TO KEEP (Unchanged)

```
✅ Marketing (Home, Demo, Contact, Pricing, Terms, Help)
✅ Auth (Login, Forgot Password)
✅ Payment Callback
✅ Error Pages (404, 401)
✅ POS Fullscreen (/pos)
✅ Open Shift (/open-shift)
✅ Kitchen Display (/kitchen)
✅ Delivery (addon - keep if enabled)
```

---

## 📊 PAGE COUNT SUMMARY

| Category | Current | Target | Change |
|----------|---------|--------|--------|
| Marketing | 9 | 9 | - |
| Auth | 2 | 2 | - |
| Payment | 3 | 3 | - |
| POS/Operational | 15 | 8 | ✅ -7 |
| Finance/Reports | 8 | 2 | ✅ -6 |
| Inventory | 5 | 1 | ✅ -4 |
| Admin | 5 | 5 | - |
| Settings | 12 | 4 | ✅ -8 |
| Super Admin | 10 | 7 | ✅ -3 |
| Other | 9 | 3 | ✅ -6 |
| Error | 2 | 2 | - |
| **TOTAL** | **78** | **46** | **✅ -32 pages** |

---

## 🎯 ISSUES & SOLUTIONS

### Issue #1: Role Mixing in Dashboard
**Current**: Single dashboard for ADMIN/SUPERVISOR/CASHIER/KITCHEN
**Solution**: 
- Create role-specific dashboard (stored as condition in single component)
- ADMIN: Overview, key metrics, quick actions
- SUPERVISOR: Team view, performance, all stores
- CASHIER: Today's sales, shift info, quick actions
- KITCHEN: Pending orders, nothing else

### Issue #2: POS Flow Confusing
**Current**: /pos (fullscreen) + /app/orders (list) both manage orders
**Solution**:
- `/pos` = Point of Sale (transaction entry, simplified for speed)
- `/app/orders` = Order Management (tracking, editing, status change)
- Keep both but clarify purpose

### Issue #3: Too Many Settings Pages
**Current**: 12 separate pages in settings
**Solution**: Group logically
- User Account Settings (password, 2FA, sessions)
- Store Configuration (store info, webhooks)
- System Settings (Super Admin only, move to /super-admin)

### Issue #4: Reports Not Unified
**Current**: reports, advanced-reporting, store-reports (different pages)
**Solution**: Single unified report page with:
- Report type selector
- Time range
- Filter options
- Export options

### Issue #5: Super Admin Mixed with Operational
**Current**: /app/super-dashboard + various /superadmin + various /settings
**Solution**: Create dedicated /super-admin route group (clean separation)

---

## ✅ STATUS: Analysis Complete

Ready for implementation phase.

**Next Steps**:
1. Generate final routing structure
2. Create component consolidation map
3. Generate backend API consolidation (if needed)
4. Plan migration

