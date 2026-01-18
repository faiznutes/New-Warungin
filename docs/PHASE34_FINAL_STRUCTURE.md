# PHASE 34: NEW PAGE STRUCTURE (FINAL)

**Target State**: 46 pages (down from 78)  
**Key Changes**: Clear role separation, consolidated management pages, consistent routing

---

## 📋 SUPER ADMIN STRUCTURE (Completely Separated)

### Route Group: `/super-admin/*`
**Access**: `SUPER_ADMIN` role ONLY  
**Layout**: SuperAdminLayout (new, dedicated)  
**Purpose**: System management, not operational

```
/super-admin
├── /dashboard
│   └── SuperDashboard.vue ✅ KEEP
│       Display: System health, tenant stats, key metrics
│
├── /tenants
│   └── TenantsManagement.vue 🔄 CONSOLIDATE
│       Current: /app/tenants + /app/tenants/:id + /app/tenants/support
│       New: Single page with sidebar detail view
│       Features:
│         - List with search/filter
│         - Sidebar: detail + edit + support tickets
│         - Modal: create/edit tenant
│
├── /subscriptions
│   └── SubscriptionPlans.vue ✅ KEEP & MOVE
│       Current: /app/subscription
│       Moved to: /super-admin/subscriptions
│
├── /system
│   ├── /info
│   │   └── SystemInfo.vue ✅ KEEP & MOVE
│   │       Display: Version, environment, build info
│   │
│   ├── /monitor
│   │   └── ServerMonitor.vue ✅ KEEP & MOVE
│   │       Display: CPU, memory, disk usage, active connections
│   │
│   ├── /settings
│   │   └── SystemSettings.vue 🔄 CONSOLIDATE
│   │       Current: /settings/system
│   │       Include:
│   │         - Global config
│   │         - Email settings
│   │         - SMS settings
│   │         - Webhook config
│   │
│   ├── /backups
│   │   └── BackupManagement.vue ✅ KEEP & MOVE
│   │       Display: Backup list, schedule, restore
│   │
│   ├── /messages
│   │   └── ContactMessages.vue ✅ KEEP & MOVE
│   │       Display: Contact form submissions
│   │
│   └── /audit-log
│       └── AuditLog.vue 🆕 CREATE (Placeholder)
│           Display: System activity log
│
└── /data-management
    ├── /retention
    │   └── RetentionManagement.vue ✅ KEEP & MOVE
    │       Current: /settings/retention
    │
    ├── /archive
    │   └── ArchiveManagement.vue ✅ KEEP & MOVE
    │       Current: /settings/archive
    │
    └── /gdpr
        └── GDPRSettings.vue 🔄 MOVE
            Current: /app/settings/gdpr (accessible by all)
            New: /super-admin/data-management/gdpr (SUPER_ADMIN oversight)

```

**Pages Summary**:
- Keep existing: 8 pages
- Move/restructure: 5 pages  
- Create new: 1 placeholder
- **Total Super Admin: 14 pages**

---

## 🏪 OPERATIONAL STRUCTURE (Admin + Supervisor + Cashier + Kitchen)

### Route Group: `/app/*`
**Access**: Based on role + permission
**Layout**: DynamicLayout (selected by role)
**Purpose**: Daily operations

```
/app
├── /dashboard 🔄 CONSOLIDATE
│   └── Dashboard.vue (Role-based conditional rendering)
│       Variants:
│         - ADMIN_TENANT: Overview, key metrics, store selection
│         - SUPERVISOR: Team view, all stores, performance
│         - CASHIER: Today's sales, shift status, quick actions
│         - KITCHEN: Pending orders ONLY
│
├── /pos-operations
│   ├── /pos
│   │   └── POS.vue ✅ KEEP (Fullscreen: /pos)
│   │       No layout, fullscreen mode for transaction entry
│   │
│   ├── /shift
│   │   ├── OpenShift.vue ✅ KEEP (Fullscreen: /open-shift)
│   │   │   No layout, fullscreen mode for shift opening
│   │   │
│   │   └── CashShift.vue ✅ KEEP
│   │       Current: /app/cashier/cash-shift
│   │       Moved to: /app/pos-operations/shift/management
│   │
│   └── /kitchen
│       ├── KitchenOrders.vue ✅ KEEP (Fullscreen: /kitchen)
│       │   No layout, fullscreen mode for order display
│       │
│       └── KitchenOrdersInApp.vue 🔄 MERGE
│           Current: /app/orders (with kitchen tab)
│           Merged into: /app/orders (with conditional tab)
│
├── /orders 🔄 CONSOLIDATE
│   └── OrdersManagement.vue (Unified)
│       Current pages merged:
│         - /app/orders (main)
│         - /app/orders/kitchen (separate tab)
│       Features:
│         - Tab: Sales Orders
│         - Tab: Kitchen Orders
│         - Modal: Edit order
│         - Modal: Failed sync review
│       Access:
│         - ADMIN_TENANT: All orders
│         - SUPERVISOR: All orders
│         - CASHIER: Own shift orders
│         - KITCHEN: Kitchen orders only (tab-only view)
│
├── /core-data
│   ├── /products
│   │   └── Products.vue ✅ KEEP
│   │       Features:
│   │         - List with search
│   │         - Modal: Create/Edit product
│   │         - Modal: Upload images
│   │       Access: ADMIN_TENANT, SUPERVISOR can manage
│   │
│   ├── /customers
│   │   └── Customers.vue ✅ KEEP
│   │       Features:
│   │         - List with search
│   │         - Modal: Create/Edit customer
│   │         - Detail panel: purchase history
│   │
│   ├── /inventory
│   │   ├── /suppliers
│   │   │   └── Suppliers.vue ✅ KEEP
│   │   │
│   │   ├── /purchase-orders
│   │   │   └── PurchaseOrders.vue ✅ KEEP
│   │   │
│   │   ├── /stock-alerts
│   │   │   └── StockAlerts.vue ✅ KEEP
│   │   │
│   │   ├── /restock-suggestions
│   │   │   └── RestockSuggestions.vue ✅ KEEP
│   │   │
│   │   ├── /transfers
│   │   │   └── StockTransfers.vue ✅ KEEP
│   │   │
│   │   ├── /adjustments
│   │   │   └── ProductAdjustments.vue ✅ KEEP
│   │   │
│   │   └── /receipts
│   │       └── ReceiptTemplates.vue ✅ KEEP
│   │
│   └── /rewards
│       ├── Rewards.vue ✅ KEEP
│       │   Display: Reward programs, setup
│       │
│       └── RewardView.vue ✅ KEEP
│           Display: Customer redemption interface
│
├── /finance 🔄 CONSOLIDATE
│   └── FinanceHub.vue (Unified dashboard)
│       Tabs:
│         - Tab: Dashboard (key metrics, cash flow)
│         - Tab: Transactions (ledger, filtering)
│         - Tab: Profit & Loss (P&L report)
│         - Tab: Accounting (chart of accounts) [conditional]
│         - Tab: Analytics (advanced) [if addon]
│       Current pages merged:
│         - /app/finance/management
│         - /app/finance/transactions
│         - /app/analytics
│         - /app/profit-loss
│         - /app/finance/accounting-finance
│
├── /reports 🔄 CONSOLIDATE
│   └── ReportingHub.vue (Unified reporting)
│       Report types:
│         - Sales Report
│         - Product Report
│         - Customer Report
│         - Inventory Report
│         - Advanced Report [if addon: BUSINESS_ANALYTICS]
│       Features:
│         - Date range selector
│         - Filter options
│         - Export (PDF, Excel)
│       Current pages merged:
│         - /app/reports
│         - /app/reports/advanced
│         - /app/reports/stores
│
├── /admin
│   ├── /users
│   │   └── Users.vue ✅ KEEP
│   │       Current: /app/users
│   │       Access: ADMIN_TENANT, SUPERVISOR (limited)
│   │
│   ├── /stores
│   │   └── StoresManagement.vue 🔄 CONSOLIDATE
│   │       Current pages merged:
│   │         - /app/stores (list)
│   │         - /app/stores/:id (detail)
│   │         - /app/stores/:id/edit
│   │       New structure:
│   │         - List with search
│   │         - Sidebar: Detail view
│   │         - Modal: Create/Edit store
│   │         - Toolbar: Actions
│   │
│   └── /discounts
│       └── Discounts.vue ✅ KEEP
│           Display: Discount programs, setup
│
├── /account 🔄 CONSOLIDATE
│   └── AccountSettings.vue (Unified user settings)
│       Sections (tabs or collapsible):
│         - Tab: Profile (name, email)
│         - Tab: Password
│         - Tab: Two-Factor Auth
│         - Tab: Sessions
│         - Tab: Preferences
│         - Tab: GDPR Data (for user own data)
│       Current pages merged:
│         - /app/settings/preferences
│         - /app/settings/password
│         - /app/settings/2fa
│         - /app/settings/sessions
│         - /app/settings/gdpr
│
├── /store-config
│   └── StoreConfiguration.vue (Unified store admin settings)
│       Sections (tabs or collapsible):
│         - Tab: Store Info
│         - Tab: Webhooks
│         - Tab: Webhooks Tester
│         - Tab: Addons
│         - Tab: Store Settings
│       Current pages merged:
│         - /app/settings/store
│         - /app/settings/webhooks
│         - /app/settings/webhooks/tester
│         - /app/addons
│
└── /marketing [ADDON-GATED: Requires addon]
    ├── /campaigns
    │   └── MarketingCampaigns.vue ✅ KEEP & MOVE
    │       Current: /app/marketing/campaigns
    │
    ├── /email
    │   ├── /templates
    │   │   └── EmailTemplates.vue ✅ KEEP & MOVE
    │   │
    │   ├── /analytics
    │   │   └── EmailAnalytics.vue ✅ KEEP & MOVE
    │   │
    │   └── /scheduler
    │       └── EmailScheduler.vue ✅ KEEP & MOVE
    │
    └── /engagement
        └── CustomerEngagement.vue ✅ KEEP & MOVE

```

**Pages Summary**:
- Marketing addon group: 6 pages

---

## 🚚 ADDON-BASED ROUTES (Feature Gated)

```
/app/delivery [Requires: DELIVERY_MARKETING addon]
└── DeliveryOrders.vue ✅ KEEP & MOVE
    Current: addon route under /app
    Organized: Cleaner sub-route
```

---

## ✅ PAGES TO DELETE (Not Routed)

```
🗑️ FormStyleGuide.vue → REMOVE or move to /dev
🗑️ TableStyleGuide.vue → REMOVE or move to /dev
🗑️ LoadingStatesGuide.vue → REMOVE or move to /dev
🗑️ AdvancedComponentsGuide.vue → REMOVE or move to /dev
🗑️ AdditionalComponentsGuide.vue → REMOVE or move to /dev

These are development utilities, not production pages.
```

---

## ⚠️ PLACEHOLDER PAGES (Incomplete Backend)

```
🆕 /super-admin/system/audit-log (AuditLog.vue)
   Status: PLACEHOLDER
   Message: "Fitur sedang dikembangkan"
   TODO: Implement backend audit logging

```

---

## 📊 FINAL PAGE STRUCTURE SUMMARY

| Category | Pages | Notes |
|----------|-------|-------|
| **PUBLIC** | 16 | Marketing + Auth + Payment + Error |
| **SUPER ADMIN** | 14 | Completely separated from operational |
| **OPERATIONAL** | 35 | Consolidated POS + Orders + Finance + Reports |
| **ADDON-BASED** | 1 | Delivery orders (gated) |
| **DELETED** | 5 | Style guides (dev only) |
| **PLACEHOLDER** | 1 | Audit log (WIP) |
| **TOTAL ACTIVE** | 46 | ✅ Down from 78 |

---

## ✅ STRUCTURE QUALITY CHECKLIST

- ✅ Clear role separation (Super Admin vs Operational)
- ✅ No duplicate functions (consolidated Orders, Finance, Reports)
- ✅ Consistent routing (logical grouping with prefixes)
- ✅ Clear purpose (every page has defined function)
- ✅ No dead links (all routes mapped to components)
- ✅ Modular design (tabs/modals for sub-features)
- ✅ Role-based access (clear permission matrix)
- ✅ Scalable structure (easy to add new features)
- ✅ Production ready (removed dev utilities)

