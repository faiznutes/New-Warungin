# 🏗️ WARUNGIN SYSTEM BLUEPRINT
**Complete System Architecture & Documentation**
Generated: January 20, 2026 | Project: New-Warungin (v1.1.0)

---

## 📋 TABLE OF CONTENTS
1. [Project Overview](#project-overview)
2. [Architecture & Stack](#architecture--stack)
3. [Directory & File Inventory](#directory--file-inventory)
4. [Database Schema](#database-schema)
5. [Backend Routes Map](#backend-routes-map)
6. [Frontend Routes Map](#frontend-routes-map)
7. [Role & Permission Matrix](#role--permission-matrix)
8. [Workflow Diagrams](#workflow-diagrams)
9. [Dependency Analysis](#dependency-analysis)
10. [Gap & Issue Report](#gap--issue-report)

---

## PROJECT OVERVIEW

### Project Description
**Warungin** - Multi-Tenant Business Management System for UMKM (Micro, Small & Medium Enterprises)

### Key Features
- ✅ Multi-tenant architecture with role-based access control (RBAC)
- ✅ Point of Sale (POS) system with real-time kitchen display
- ✅ Subscription & addon management
- ✅ Order management with payment integration (Midtrans)
- ✅ Inventory & stock management
- ✅ Email marketing & customer engagement
- ✅ Advanced reporting & analytics
- ✅ 2FA (Two-Factor Authentication)
- ✅ Audit logging & compliance (GDPR)
- ✅ Multi-location support (outlets/stores)

### Tech Stack Version
```
Frontend:  Vue 3.3.4 + Vite 6.4.1 + TailwindCSS
Backend:   Node.js + Express 4.18.2 + TypeScript 5.3.3
Database:  PostgreSQL (Prisma ORM)
Auth:      JWT + 2FA (otplib)
Payment:   Midtrans integration
Caching:   Redis (ioredis)
Jobs:      BullMQ for async tasks
Messaging: Socket.io 4.8.1
```

### Environment
- **Production DB**: PostgreSQL (Supabase)
- **Local Dev DB**: PostgreSQL
- **Docker**: Supported (docker-compose.yml)
- **Current Status**: Phase 36 Complete (per documentation)

---

## ARCHITECTURE & STACK

### Architecture Pattern
```
┌─────────────────────────────────────────────┐
│          FRONTEND (Vue 3 + Vite)            │
│  ┌──────────────────────────────────────┐   │
│  │ Views (Role-based Layouts)           │   │
│  │ - SuperAdminLayout                   │   │
│  │ - TenantLayout                       │   │
│  │ - KasirLayout                        │   │
│  │ - KitchenLayout                      │   │
│  └──────────────────────────────────────┘   │
└──────────────────┬──────────────────────────┘
                   │ (HTTP + WebSocket)
        ┌──────────▼──────────┐
        │   API Gateway       │
        │ (Express Router)    │
        └──────────┬──────────┘
        ┌──────────▼──────────────────────────┐
        │      BACKEND (Express + TS)         │
        │  ┌────────────────────────────────┐ │
        │  │ Routes (60+ route files)       │ │
        │  │ Middleware (Auth, Guard, etc)  │ │
        │  │ Services (Business Logic)      │ │
        │  │ Controllers (implicit)         │ │
        │  └────────────────────────────────┘ │
        └──────────┬──────────────────────────┘
        ┌──────────▼──────────────────────────┐
        │    DATA LAYER (Prisma ORM)         │
        │  PostgreSQL / Supabase             │
        └────────────────────────────────────┘
```

### Multi-Tenancy Model
- **Type**: Schema isolation (or database isolation)
- **Tenant Identification**: Via JWT token + `tenantId` field
- **Outlet/Store**: Each tenant can have multiple outlets
- **User Roles**: Per tenant assignment
- **Middleware**: `requireTenantId()` on all protected routes

### Authentication Flow
```
1. User Login (POST /api/auth/login)
   ├─ Email + Password validation
   ├─ Generate JWT token (includes tenantId + role)
   └─ Return token + user profile

2. Token Verification (authGuard middleware)
   ├─ Extract JWT from header
   ├─ Verify signature
   └─ Attach user info to request

3. Role-Based Access Control
   ├─ roleGuard middleware
   └─ Check user.role against allowed roles

4. Shift Check (for CASHIER/KITCHEN)
   ├─ requireShift middleware
   └─ Verify shift open before access
```

---

## DIRECTORY & FILE INVENTORY

### Root Directory Structure
```
f:\Backup W11\Project\New-Warungin\
├── 📁 src/                    ← BACKEND SOURCE
├── 📁 client/                 ← FRONTEND SOURCE
├── 📁 prisma/                 ← DATABASE SCHEMA & MIGRATIONS
├── 📁 scripts/                ← Utility & setup scripts
├── 📁 config/                 ← Configuration files
├── 📁 docs/                   ← Documentation (70+ files)
├── 📁 tests/                  ← Test files
├── 📁 nginx/                  ← Nginx configuration
├── 📁 monitoring/             ← Monitoring setup
├── 📁 observability/          ← Observability tools
├── 📁 logs/                   ← Application logs
├── 📁 security-audit-reports/ ← Audit reports
├── 📁 .gemini/                ← AI config (Cursor)
├── Dockerfile.backend         ← Docker image for backend
├── docker-compose.yml         ← Local development setup
├── docker-compose.test.yml    ← Test environment
├── docker-compose.monitoring.yml ← Monitoring stack
├── package.json               ← Backend dependencies (v1.1.0)
├── tsconfig.json              ← TypeScript config
├── vitest.config.ts           ← Test runner config
├── .env                       ← Environment variables (local)
├── .env.example               ← Environment template
└── [DEPLOYMENT & PHASE FILES] ← Deployment documentation
```

### Backend Source (src/)
```
src/
├── 📄 app.ts                  ← Express app initialization
├── 📁 routes/                 ← 60+ API route files (detailed below)
├── 📁 services/               ← 70+ business logic services
├── 📁 middlewares/            ← Auth, role guard, shift check, etc.
├── 📁 middleware/             ← [Alternative location]
├── 📁 types/                  ← TypeScript type definitions
├── 📁 utils/                  ← Helper functions & utilities
├── 📁 config/                 ← Application configuration
├── 📁 constants/              ← Constants (roles, addons, etc)
├── 📁 validators/             ← Input validation schemas (Zod)
├── 📁 jobs/                   ← BullMQ job queues
├── 📁 queues/                 ← Queue configurations
├── 📁 scheduler/              ← Scheduled tasks & crons
├── 📁 socket/                 ← Socket.io event handlers
└── 📁 jobs/                   ← ♻️ Background job processing
```

### Frontend Source (client/src/)
```
client/src/
├── 📄 App.vue                 ← Root Vue component
├── 📄 main.ts                 ← Entry point
├── 📁 views/                  ← Page components (role-based)
│   ├── marketing/             ← Public pages (Home, Pricing, etc)
│   ├── auth/                  ← Login, ForgotPassword
│   ├── superadmin/            ← Super Admin dashboard & views
│   ├── tenants/               ← Tenant management
│   ├── dashboard/             ← Role-based dashboards
│   ├── cashier/               ← Cashier views (OpenShift, CashShift)
│   ├── kitchen/               ← Kitchen display system
│   ├── orders/                ← Order management
│   ├── products/              ← Product management & adjustments
│   ├── customers/             ← Customer management
│   ├── users/                 ← User management
│   ├── stores/                ← Store/outlet management
│   ├── payment/               ← Payment callbacks
│   ├── reports/               ← Reporting & analytics
│   ├── finance/               ← Financial management
│   ├── inventory/             ← Stock management
│   ├── addons/                ← Add-on features
│   ├── discounts/             ← Discount management
│   ├── rewards/               ← Loyalty program
│   ├── receipts/              ← Receipt templates
│   ├── settings/              ← User & system settings
│   └── support/               ← Support & help
├── 📁 components/             ← Reusable UI components
├── 📁 layouts/                ← Layout wrappers (role-specific)
│   ├── SuperAdminLayout.vue
│   ├── TenantLayout.vue
│   ├── KasirLayout.vue
│   ├── KitchenLayout.vue
│   └── DynamicLayout.vue
├── 📁 router/                 ← Vue Router configuration
│   ├── index.ts               ← Main route definition
│   ├── addon.routes.ts        ← Addon-specific routes
│   └── supervisor-store-guard.ts ← Store access guard
├── 📁 stores/                 ← Pinia state management
│   └── auth.ts                ← Auth store
├── 📁 composables/            ← Vue composables (reusable logic)
├── 📁 utils/                  ← Utility functions
├── 📁 api/                    ← API client setup
├── 📁 plugins/                ← Vue plugins
├── 📁 styles/                 ← Global CSS/TailwindCSS
└── 📁 data/                   ← Static data (constants, enums)
```

### Database (prisma/)
```
prisma/
├── schema.prisma              ← 1415 lines | Database schema definition
└── migrations/                ← Database migration history
```

### Configuration Files
```
config/
├── security.config            ← Security settings

Root level:
├── .env.example               ← Template for environment variables
├── tsconfig.json              ← TypeScript compiler options
├── vitest.config.ts           ← Vitest unit test config
├── client/tsconfig.json       ← Frontend TypeScript config
├── client/vite.config.js      ← Vite bundler config
├── client/tailwind.config.js  ← Tailwind CSS config
├── client/postcss.config.js   ← PostCSS config
└── client/eslint.config.js    ← ESLint rules
```

### Key Script Files
```
scripts/
├── create-super-admin.ts      ← Initialize Super Admin user
├── create-super-admin-docker.js ← Docker-safe super admin creation
├── setup-super-admin-supabase.js ← Supabase setup
├── migrate-database.js        ← Safe migration runner
├── quick-migrate.js           ← Fast migration
├── test-login.js              ← Auth test utility
├── check-db.js                ← Database health check
├── create-tenant-user.js      ← Create test tenant users
├── test-addon-api.js          ← Test addon endpoints
└── [40+ other utilities]
```

### Documentation (docs/)
```
docs/
├── 00_READ_ME_FIRST.md        ← Quick start guide
├── COMPLETE_FILE_INDEX.md     ← This file index
├── EXECUTIVE_SUMMARY.md       ← High-level overview
├── CASHIER_SHIFT_MASTER_INDEX.md ← Cashier shift workflow
├── CRITICAL_PERMISSION_AUDIT.md ← Detailed permission audit
├── IMPLEMENTATION_COMPLETE.md ← Phase implementation status
├── DEPLOYMENT_CHECKLIST.md    ← Deployment procedures
├── BUILD_VERIFICATION.md      ← Build process docs
└── [60+ detailed docs]
```

---

## DATABASE SCHEMA

### Core Models (Entities)
```typescript
1. TENANT
   ├─ Multi-tenant isolatio
   ├─ Subscription management (BASIC, PRO, ENTERPRISE)
   ├─ Features cache (JSON)
   └─ Relations: users, products, orders, outlets, etc.

2. USER
   ├─ Role: SUPER_ADMIN | ADMIN_TENANT | SUPERVISOR | CASHIER | KITCHEN
   ├─ 2FA enabled/secret
   ├─ Password history tracking
   ├─ Permissions (JSON field)
   └─ Relations: tenant, orders, cashShifts, etc.

3. OUTLET (Store/Location)
   ├─ Multi-store per tenant
   ├─ Operating hours configuration
   ├─ Shift configuration (JSON)
   └─ Relations: orders, storeShifts

4. PRODUCT
   ├─ Stock tracking (minStock, current)
   ├─ Consignment support (isConsignment)
   ├─ Pricing (price, cost for COGS)
   ├─ Category & barcode
   └─ Relations: orderItems, adjustments, stockTransfers

5. ORDER
   ├─ Order number (unique)
   ├─ Status: PENDING | PROCESSING | COMPLETED | CANCELLED | REFUNDED
   ├─ Kitchen display integration (kitchenStatus)
   ├─ Store shift linking (storeShiftId)
   ├─ Member support (memberId)
   └─ Relations: items, transaction, outlet, storeShift

6. ORDER ITEM
   ├─ Product quantity & pricing
   ├─ Profit tracking (price - cost)
   └─ Relations: order, product

7. TRANSACTION
   ├─ Payment methods: CASH | QRIS | CARD | E_WALLET | BANK_TRANSFER | SHOPEEPAY | DANA
   ├─ Status: PENDING | COMPLETED | FAILED | REFUNDED
   ├─ QRIS code storage
   └─ Relations: order, user

8. STORE SHIFT (Global Store Shift)
   ├─ Open/close shift globally per outlet
   ├─ Opener user tracking
   ├─ Status: OPEN | CLOSED
   └─ Relations: products (adjustments), orders, cashier

9. CASH SHIFT (Cashier Shift)
   ├─ Per-cashier shift (not explicitly in schema, via order/transaction linking)
   ├─ Cash-in/out tracking
   └─ Session management

10. MEMBER
    ├─ Loyalty program
    ├─ Member code & discount
    ├─ Loyalty points
    └─ Relations: orders

11. CUSTOMER
    ├─ Walk-in customer
    ├─ Loyalty points
    ├─ Birthday tracking
    └─ Relations: orders, feedbacks, reviews

12. SUBSCRIPTION
    ├─ Plan: BASIC | PRO | ENTERPRISE
    ├─ Temporary upgrade support
    ├─ Purchase tracking (purchased by admin/self)
    └─ Relations: tenant, history

13. TENANT ADDON
    ├─ Premium features (DELIVERY_MARKETING, BUSINESS_ANALYTICS, etc)
    ├─ Usage tracking (currentUsage vs limit)
    ├─ Expiration dates
    └─ Relations: tenant

14. AUDIT LOG
    ├─ All user actions & system changes
    ├─ IP & user agent logging
    ├─ Success/failure tracking
    └─ Relations: tenant, user

15. WEBHOOK
    ├─ Event delivery system
    ├─ Retry mechanism
    ├─ Secret-based signature verification
    └─ Relations: deliveries

16. EMAIL TEMPLATE & EVENTS
    ├─ Marketing email templates
    ├─ Event tracking (SENT, OPENED, CLICKED, BOUNCED)
    └─ Campaign integration

17. PAYMENT MAPPING
    ├─ Midtrans order_id → tenant/item mapping
    ├─ Addon/subscription purchase tracking
    └─ Relations: tenant
```

### Key Enum Values
```typescript
UserRole:
  - SUPER_ADMIN (全权 - Platform admin)
  - ADMIN_TENANT (租户管理员 - Tenant owner)
  - SUPERVISOR (监管员 - Multiple store supervisor)
  - CASHIER (收银员 - POS cashier)
  - KITCHEN (厨房 - Kitchen staff)

OrderStatus:
  - PENDING (新建)
  - PROCESSING (处理中)
  - COMPLETED (完成)
  - CANCELLED (取消)
  - REFUNDED (退款)

PaymentMethod:
  - CASH (现金)
  - QRIS (扫码)
  - CARD (卡)
  - E_WALLET (电子钱包)
  - BANK_TRANSFER (银行转账)
  - SHOPEEPAY
  - DANA

TransactionStatus:
  - PENDING
  - COMPLETED
  - FAILED
  - REFUNDED

SubscriptionPlan:
  - BASIC
  - PRO
  - ENTERPRISE

TenantAddonType:
  - ADD_USERS
  - ADD_PRODUCTS
  - ADD_OUTLETS
  - E_COMMERCE
  - DELIVERY_MARKETING
  - BUSINESS_ANALYTICS
  - [others...]
```

### Database Indices (Performance)
- Multi-column indices on: (tenantId, status), (tenantId, createdAt)
- Search indices: tenantId, email, phone, name, barcode, sku
- Time-series indices: createdAt with DESC sort

---

## BACKEND ROUTES MAP

### Route Organization (60+ route files)
```
src/routes/
├── 🔐 AUTH & SECURITY
│   ├── auth.routes.ts              ← Login, logout, token refresh
│   ├── password.routes.ts          ← Password reset, change
│   ├── 2fa.routes.ts               ← Two-factor authentication
│   ├── session.routes.ts           ← Session management
│   └── user.routes.ts              ← User CRUD & profile
│
├── 🏪 CORE BUSINESS
│   ├── order.routes.ts             ← Order CRUD & management
│   ├── product.routes.ts           ← Product CRUD & management
│   ├── customer.routes.ts          ← Customer management
│   ├── discount.routes.ts          ← Discount rules
│   ├── payment.routes.ts           ← Payment processing
│   ├── cash-shift.routes.ts        ← Cashier shift opening
│   ├── store-shift.routes.ts       ← Store-level shift management
│   ├── receipt.routes.ts           ← Receipt generation & templates
│   └── transaction.routes.ts       ← Transaction history & tracking
│
├── 🏢 MULTI-LOCATION
│   ├── outlet.routes.ts            ← Store/outlet CRUD
│   ├── outlet.advanced.routes.ts   ← Advanced outlet features
│   ├── outlet.search.routes.ts     ← Outlet search/filter
│   ├── outlet.import-export.routes.ts ← Bulk operations
│   └── store-shift.routes.ts       ← Store shift (global)
│
├── 👥 TENANT & SUPERADMIN
│   ├── tenant.routes.ts            ← Tenant management (SA only)
│   ├── tenant-profile.routes.ts    ← Tenant profile & settings
│   ├── tenant-backup.routes.ts     ← Tenant data backup
│   ├── superadmin-backup.routes.ts ← Super admin backup ops
│   ├── admin-monitor.routes.ts     ← Admin monitoring dashboard
│   └── internal.routes.ts          ← Internal operations
│
├── 💰 SUBSCRIPTIONS & ADDONS
│   ├── subscription.routes.ts      ← Subscription management
│   ├── subscription-receipt.routes.ts ← Receipt generation
│   ├── addon.routes.ts             ← Add-on features (premium)
│   └── plan-features.routes.ts     ← Feature flag management
│
├── 📊 ANALYTICS & REPORTS
│   ├── analytics.routes.ts         ← Real-time analytics
│   ├── dashboard.routes.ts         ← Dashboard data endpoints
│   ├── report.routes.ts            ← Report generation
│   ├── advanced-reporting.routes.ts ← Advanced reports (addon)
│   ├── quick-insight.routes.ts     ← Quick metrics
│   ├── price-suggestion.routes.ts  ← AI price recommendations
│   ├── financial-management-enhancement.routes.ts ← Finance module
│   ├── business-metrics.routes.ts  ← KPI tracking
│   ├── accounting-integration.routes.ts ← Accounting sync
│   └── advanced-audit.routes.ts    ← Detailed audit reports
│
├── 📦 INVENTORY
│   ├── supplier.routes.ts          ← Supplier management
│   ├── purchase-order.routes.ts    ← PO creation & tracking
│   ├── stock-transfer.routes.ts    ← Inter-store transfers
│   ├── stock-alert.routes.ts       ← Low stock alerts
│   ├── restock-suggestion.routes.ts ← AI restock recommendations
│   └── employee.routes.ts          ← Employee management
│
├── 💌 MARKETING & ENGAGEMENT
│   ├── email-template.routes.ts    ← Email template CRUD
│   ├── email-scheduler.routes.ts   ← Scheduled email sending
│   ├── email-analytics.routes.ts   ← Email campaign analytics
│   ├── customer-engagement.routes.ts ← Engagement features
│   ├── customer-engagement-enhancement.routes.ts ← Enhanced engagement
│   ├── marketing.routes.ts         ← Marketing campaigns
│   ├── sms-gateway.routes.ts       ← SMS sending
│   ├── push-notification.routes.ts ← Push notifications
│   ├── reward.routes.ts            ← Reward points
│   ├── member.routes.ts            ← Member management
│   ├── contact.routes.ts           ← Contact form submissions
│   └── retention.routes.ts         ← Customer retention
│
├── 🔧 SETTINGS & CONFIGURATION
│   ├── settings.routes.ts          ← Global settings
│   ├── payment-gateway-integration.routes.ts ← Payment gateway config
│   ├── delivery.routes.ts          ← Delivery configuration
│   ├── archive.routes.ts           ← Data archival
│   ├── retention.routes.ts         ← Data retention policies
│   ├── gdpr.routes.ts              ← GDPR data management
│   └── compliance-reporting.routes.ts ← Compliance reports
│
├── 📡 INTEGRATION
│   ├── webhook.routes.ts           ← Webhook management
│   ├── pdf.routes.ts               ← PDF generation
│   ├── metrics.routes.ts           ← Prometheus metrics
│   ├── audit-log.routes.ts         ← Audit log retrieval
│   └── data-encryption.routes.ts   ← Encryption management
│
└── 🔌 MISCELLANEOUS
    ├── finance.routes.ts           ← Finance operations
    ├── v1/                         ← Legacy v1 API routes
    └── [other specialized routes]
```

### Authentication & Authorization Middleware Chain
```typescript
// Standard Protected Route Pattern:
router.post(
  '/endpoint',
  authGuard,                    // 1. Verify JWT token
  roleGuard('ADMIN_TENANT', 'SUPER_ADMIN'),  // 2. Check role
  supervisorStoresGuard,        // 3. Check store access (if needed)
  subscriptionGuard,            // 4. Check subscription level
  addonGuard('BUSINESS_ANALYTICS'),  // 5. Check addon (if needed)
  validate({ body: schema }),   // 6. Validate input
  shiftGuard,                   // 7. Check shift (if cashier)
  async (req, res) => { ... }   // 8. Handle request
);

// Middleware Functions:
- authGuard: Verify JWT, extract user info
- roleGuard(...roles): Check if user.role in roles
- supervisorStoresGuard: Check allowedStoreIds for SUPERVISOR
- storeAccessGuard: Verify access to specific store
- requireShift: Ensure shift open for CASHIER/KITCHEN
- requireSuperAdmin: Short for roleGuard('SUPER_ADMIN')
- subscriptionGuard: Check subscription active & not expired
- planFeatureGuard: Check feature enabled in plan
- addonGuard(addon): Check addon enabled
- rateLimiter: Prevent abuse
- validate(schema): Validate request body/params/query
- csrfProtection: CSRF token validation
- auditLogger: Log actions for compliance
```

### Key API Endpoints (Sample)

#### Authentication
```
POST   /api/auth/login              ← User login
POST   /api/auth/logout             ← User logout
POST   /api/auth/refresh            ← Refresh JWT token
POST   /api/password/reset-request  ← Request password reset
POST   /api/password/reset          ← Perform password reset
POST   /api/password/change         ← Change password (authenticated)
POST   /api/2fa/enable              ← Enable 2FA
POST   /api/2fa/verify              ← Verify 2FA code
POST   /api/2fa/backup-codes        ← Get backup codes
```

#### Orders & POS
```
GET    /api/orders                  ← List orders
POST   /api/orders                  ← Create order
GET    /api/orders/:id              ← Get order details
PATCH  /api/orders/:id              ← Update order
DELETE /api/orders/:id              ← Cancel order
POST   /api/orders/:id/payment      ← Add payment
POST   /api/orders/:id/send-kitchen ← Send to kitchen
GET    /api/orders/:id/kitchen-status ← Check kitchen status
```

#### Products
```
GET    /api/products                ← List products
POST   /api/products                ← Create product
GET    /api/products/:id            ← Get product
PATCH  /api/products/:id            ← Update product
DELETE /api/products/:id            ← Delete product
POST   /api/products/bulk/import    ← Bulk import products
GET    /api/products/search         ← Search products
POST   /api/products/:id/adjustments ← Adjust stock
```

#### Stores/Outlets
```
GET    /api/outlets                 ← List outlets
POST   /api/outlets                 ← Create outlet
GET    /api/outlets/:id             ← Get outlet details
PATCH  /api/outlets/:id             ← Update outlet
DELETE /api/outlets/:id             ← Delete outlet
GET    /api/outlets/:id/shift-status ← Get shift status
POST   /api/outlets/:id/shift/open  ← Open store shift
POST   /api/outlets/:id/shift/close ← Close store shift
```

#### Cashier/Shift
```
GET    /api/cash-shift/current      ← Get current cashier shift
POST   /api/cash-shift/open         ← Open cashier shift
POST   /api/cash-shift/close        ← Close cashier shift
GET    /api/cash-shift/history      ← Shift history
POST   /api/store-shift/:id/open    ← Open global store shift
```

#### Users & Tenants
```
GET    /api/users                   ← List users (tenant admin only)
POST   /api/users                   ← Create user
GET    /api/users/:id               ← Get user
PATCH  /api/users/:id               ← Update user
DELETE /api/users/:id               ← Delete user
GET    /api/tenants                 ← List tenants (super admin only)
POST   /api/tenants                 ← Create tenant
GET    /api/tenants/:id             ← Get tenant
PATCH  /api/tenants/:id             ← Update tenant
```

#### Analytics & Reports
```
GET    /api/analytics/dashboard     ← Dashboard metrics
GET    /api/analytics/sales         ← Sales report
GET    /api/analytics/products      ← Product analytics
GET    /api/analytics/customers     ← Customer analytics
GET    /api/reports/generate        ← Generate custom report
GET    /api/insights/quick          ← Quick insights
```

#### Subscriptions & Addons
```
GET    /api/subscription/current    ← Current subscription
POST   /api/subscription/upgrade    ← Upgrade plan
POST   /api/subscription/downgrade  ← Downgrade plan
GET    /api/addons                  ← Available addons
POST   /api/addons/purchase         ← Purchase addon
DELETE /api/addons/:id              ← Cancel addon
```

#### Marketing & Engagement
```
GET    /api/email-templates        ← List email templates
POST   /api/email-templates        ← Create template
POST   /api/email-scheduler        ← Schedule email campaign
GET    /api/campaigns              ← Campaign analytics
POST   /api/rewards/earn           ← Award points to customer
GET    /api/members                ← List members
POST   /api/members                ← Register member
```

---

## FRONTEND ROUTES MAP

### Route Structure (Vue Router)
```
Frontend Routes (client/src/router/index.ts)

1. PUBLIC ROUTES (No Auth)
   ├─ /                       ← Home page (marketing layout)
   ├─ /demo                   ← Demo/sandbox page
   ├─ /contact                ← Contact form
   ├─ /pricing                ← Pricing page
   ├─ /terms                  ← Terms & conditions
   ├─ /help                   ← Help center
   ├─ /help/:slug             ← Help article
   ├─ /help/category/:id      ← Help category
   └─ /contact/success        ← Contact success page

2. AUTH ROUTES (No Layout)
   ├─ /login                  ← Login page
   ├─ /forgot-password        ← Password recovery
   ├─ /payment/success        ← Payment callback (success)
   ├─ /payment/error          ← Payment callback (error)
   └─ /payment/pending        ← Payment callback (pending)

3. FULLSCREEN ROUTES (No Layout Wrapper)
   ├─ /pos                    ← POS fullscreen (CASHIER, SUPERVISOR, SUPER_ADMIN)
   ├─ /open-shift             ← Open shift page (CASHIER, SUPERVISOR, SUPER_ADMIN)
   └─ /kitchen                ← Kitchen display (KITCHEN, SUPERVISOR, SUPER_ADMIN)

4. DYNAMIC APP ROUTES (Role-based layouts)
   ├─ /app
   │  ├─ dashboard            ← Role-specific dashboard
   │  │
   │  ├─ SUPER_ADMIN ONLY
   │  │  ├─ super-dashboard   ← Super admin dashboard
   │  │  ├─ tenants           ← Tenant management list
   │  │  ├─ tenants/:id       ← Tenant detail & management
   │  │  ├─ tenants/support   ← Tenant support tickets
   │  │  ├─ reports/global    ← Global cross-tenant reports
   │  │  ├─ superadmin/contact-messages ← Contact submissions
   │  │  ├─ superadmin/server-monitor ← Server monitoring
   │  │  ├─ superadmin/system-info ← System information
   │  │  ├─ superadmin/backups ← Backup management
   │  │  ├─ settings/system   ← System settings
   │  │  ├─ settings/style-guide ← UI style guide
   │  │  ├─ settings/table-style-guide ← Table styles
   │  │  └─ settings/archive  ← Data archival
   │  │
   │  ├─ CASHIER ONLY
   │  │  └─ cashier/cash-shift ← Cash shift management
   │  │
   │  ├─ ADMIN_TENANT, SUPERVISOR, CASHIER, KITCHEN
   │  │  └─ dashboard         ← Role-specific dashboard
   │  │
   │  ├─ TENANT ADMIN & ABOVE (ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN)
   │  │  ├─ products          ← Product catalog
   │  │  ├─ orders            ← Order management
   │  │  ├─ customers         ← Customer management
   │  │  ├─ users             ← User management (admin-level)
   │  │  ├─ stores            ← Store/outlet management
   │  │  ├─ stores/:id        ← Store detail
   │  │  ├─ stores/:id/edit   ← Edit store
   │  │  ├─ subscription      ← Subscription management
   │  │  ├─ addons            ← Add-ons & premium features
   │  │  ├─ rewards           ← Rewards program
   │  │  ├─ discounts         ← Discount rules
   │  │  ├─ reports           ← Report generation
   │  │  ├─ finance           ← Financial management
   │  │  ├─ finance/transactions ← Transaction history
   │  │  ├─ profit-loss       ← P&L reports
   │  │  ├─ analytics         ← Advanced analytics (with addon)
   │  │  │
   │  │  ├─ INVENTORY MANAGEMENT
   │  │  ├─ inventory/suppliers ← Supplier list
   │  │  ├─ inventory/purchase-orders ← Purchase order management
   │  │  ├─ inventory/stock-alerts ← Stock alerts
   │  │  ├─ inventory/restock-suggestions ← Restock AI
   │  │  └─ inventory/stock-transfers ← Inter-store transfers
   │  │
   │  ├─ ALL AUTHENTICATED USERS
   │  │  ├─ settings/preferences ← Personal preferences
   │  │  ├─ settings/password ← Password management
   │  │  ├─ settings/2fa ← Two-factor auth setup
   │  │  ├─ settings/gdpr ← GDPR data management
   │  │  ├─ settings/sessions ← Active sessions
   │  │  └─ support ← Client support tickets
   │  │
   │  ├─ MARKETING & ENGAGEMENT (with addon)
   │  │  ├─ delivery           ← Delivery management
   │  │  ├─ marketing          ← Email marketing
   │  │  ├─ marketing/email-templates ← Template CRUD
   │  │  ├─ marketing/email-analytics ← Campaign analytics
   │  │  ├─ marketing/email-scheduler ← Schedule campaigns
   │  │  ├─ marketing/customer-engagement ← Engagement features
   │  │  ├─ retention          ← Retention strategies
   │  │  ├─ receipts/templates ← Receipt template design
   │  │  └─ receipt-view       ← View receipts
   │  │
   │  ├─ SETTINGS (Role-specific)
   │  │  ├─ settings/store    ← Store settings (ADMIN_TENANT)
   │  │  ├─ settings/webhooks ← Webhook configuration
   │  │  └─ settings/webhooks/tester ← Webhook test tool
   │  │
   │  └─ PRODUCTS & ADJUSTMENTS
   │     └─ products/adjustments ← Stock adjustment history
   │
   └─ 404 Routes
      ├─ /Unauthorized.vue        ← 403 Unauthorized
      └─ /NotFound.vue            ← 404 Not Found
```

### Frontend Route Guards
```typescript
// Route-level protection (meta field)
{
  path: 'dashboard',
  meta: {
    requiresAuth: true,
    roles: ['ADMIN_TENANT', 'SUPERVISOR', 'CASHIER', 'KITCHEN'],
    requiresAddon: 'BUSINESS_ANALYTICS',  // Optional addon check
    fullscreen: false                      // Is fullscreen mode
  }
}

// Global router.beforeEach checks:
1. Authentication guard
   - Check if route requires auth
   - Verify JWT token exists & valid
   - Redirect to /login if not authenticated

2. Role authorization guard
   - Extract user role from auth store
   - Check if user.role in route.meta.roles
   - Redirect to /unauthorized if not authorized

3. Addon requirement check
   - If meta.requiresAddon specified
   - Check if tenant has addon enabled
   - Redirect or show upgrade prompt

4. Store access guard (for SUPERVISOR & CASHIER)
   - Check if user can access requested store
   - Use supervisorStoresGuard for store validation
   - Ensure store is in user's allowedStoreIds

5. Layout determination
   - Use getLayoutForRole() to select appropriate layout
   - Different layouts for different roles
```

### Frontend Layouts (Role-Specific)
```
layouts/
├─ SuperAdminLayout.vue          ← Global navigation, super admin menu
├─ TenantLayout.vue              ← Tenant admin navigation
├─ KasirLayout.vue               ← Cashier-specific layout
├─ KitchenLayout.vue             ← Kitchen display layout
├─ AppLayout.vue                 ← Generic authenticated layout
├─ DynamicLayout.vue             ← Selects layout based on role
└─ MarketingLayout.vue           ← Public/marketing pages
```

---

## ROLE & PERMISSION MATRIX

### Role Hierarchy
```
SUPER_ADMIN (Platform Owner)
    ↓
    ADMIN_TENANT (per Tenant)
    ↓
    SUPERVISOR (multiple stores)
    ↓
    CASHIER / KITCHEN (single store)
```

### Detailed Permission Matrix

#### SUPER_ADMIN (Full Platform Access)
```
Global Access:
├─ Tenant management (CRUD all tenants)
├─ User management across all tenants
├─ Subscription management & upgrades
├─ Add-on management
├─ System settings & monitoring
├─ Global reporting & analytics
├─ Data backup & recovery
├─ Support ticket management
├─ Audit log viewing
└─ Server monitoring

Bypass Capabilities:
├─ No shift requirement
├─ No store access restrictions
├─ Can access all outlets
├─ Can assign supervisors
└─ Can manually upgrade/downgrade subscriptions
```

#### ADMIN_TENANT (Tenant Owner)
```
Tenant-Level Access:
├─ User management (create/edit/delete users in tenant)
├─ Store/outlet management (create/edit/delete outlets)
├─ Product catalog management
├─ Order management
├─ Financial management & reports
├─ Subscription management
├─ Add-on purchasing
├─ Email marketing & campaigns
├─ Customer management
├─ Analytics & reporting
└─ Settings for tenant

Store Access:
├─ Full access to all outlets in tenant
├─ No shift requirement
├─ Can view all orders/transactions
└─ Can manage supervisors & staff

Cannot Do:
├─ Access other tenants' data
├─ Manage subscriptions (for another tenant)
├─ Create new tenants
└─ Access super admin panel
```

#### SUPERVISOR (Multiple Store Manager)
```
Store-Level Access:
├─ Assigned to specific stores (allowedStoreIds)
├─ Can only view/manage orders in allowed stores
├─ Can manage staff in assigned stores
├─ Can view analytics for assigned stores
├─ Can process refunds & discounts
├─ Can assign cashiers to outlets
└─ Can view reports for assigned stores

Shift Management:
├─ No shift requirement (can access anytime)
├─ Can open/close store shifts
├─ Can override cashier actions
└─ Can verify transactions

Cannot Do:
├─ Create new outlets
├─ Manage products across stores
├─ Access system settings
├─ Manage other supervisors
├─ Access tenant admin panel
└─ Manage subscriptions
```

#### CASHIER (Point of Sale)
```
POS Operations:
├─ Create orders
├─ Process payments
├─ Apply discounts (with permission)
├─ Reprint receipts
├─ View customer information
├─ Manage customer loyalty points
└─ Process refunds (limited)

Required Actions:
├─ Must open shift before accessing POS
├─ Can only access assigned store
├─ Must close shift to end day
└─ Shift-locked access

View Access:
├─ Can view today's orders
├─ Can see sales summary
├─ Can view stock levels
└─ Cannot view historical reports

Cannot Do:
├─ Create/edit products
├─ Delete orders
├─ Access admin panel
├─ Manage users
├─ Access other stores
├─ Override supervisor actions
└─ Access settings
```

#### KITCHEN (Kitchen Display System)
```
Kitchen Operations:
├─ View pending orders
├─ Mark orders as processing/ready
├─ View order details & items
├─ Print kitchen labels
├─ See preparation notes
└─ Communicate via kitchen notes

Required Actions:
├─ Must open shift before working
├─ Can only access assigned store
├─ Cannot close shift (supervisor does)
└─ Shift-locked access

Cannot Do:
├─ Create orders
├─ Process payments
├─ Delete orders
├─ Access admin panel
├─ Manage products
├─ Access reports
├─ Modify customer info
└─ Access other stores
```

### Feature Access by Role

| Feature | Super Admin | Admin Tenant | Supervisor | Cashier | Kitchen |
|---------|------------|-------------|-----------|---------|---------|
| **Orders** | ✅ All | ✅ All | ✅ Assigned Stores | ✅ Single Store | ✅ View Only |
| **Products** | ✅ All | ✅ All | ❌ | ❌ View | ❌ View |
| **Customers** | ✅ All | ✅ All | ✅ Assigned Stores | ✅ Limited | ❌ |
| **Users** | ✅ All | ✅ Tenant | ❌ | ❌ | ❌ |
| **Stores** | ✅ All | ✅ All | ✅ Assigned | ❌ | ❌ View |
| **Reports** | ✅ Global | ✅ Tenant | ✅ Assigned | ❌ | ❌ |
| **Subscriptions** | ✅ Manage | ✅ View/Upgrade | ❌ | ❌ | ❌ |
| **Add-ons** | ✅ Manage | ✅ Purchase | ❌ | ❌ | ❌ |
| **Settings** | ✅ System | ✅ Tenant | ❌ | ❌ View | ❌ View |
| **Audit Logs** | ✅ All | ✅ Tenant | ❌ | ❌ | ❌ |
| **Shift Opening** | ❌ Bypass | ❌ Bypass | ✅ | ✅ | ✅ |
| **Email Marketing** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Analytics** | ✅ Global | ✅ Tenant | ✅ Assigned | ❌ | ❌ |
| **Refunds** | ✅ | ✅ | ✅ | ❌ Limited | ❌ |

### Data Isolation by Role
```
SUPER_ADMIN:
  └─ Can see: ALL tenants → ALL stores → ALL orders/products/users

ADMIN_TENANT (TenantA):
  └─ Can see: TenantA only → ALL stores in TenantA → ALL data in TenantA

SUPERVISOR (TenantA, Store1,2):
  └─ Can see: TenantA only → Store1,2 only → Orders in Store1,2 only

CASHIER (TenantA, Store1):
  └─ Can see: TenantA only → Store1 only → Orders in Store1 only

KITCHEN (TenantA, Store1):
  └─ Can see: TenantA only → Store1 only → Orders in Store1 only (kitchen view)
```

### Permission Implementation
```typescript
// Backend Enforcement (src/middlewares/)
- authGuard: Verify token + extract tenantId
- roleGuard(...roles): Check if role in allowed list
- supervisorStoresGuard: Verify store access for SUPERVISOR
- storeAccessGuard: Verify single store access
- requireShift: Verify shift open for CASHIER/KITCHEN
- subscriptionGuard: Verify subscription active

// Frontend Enforcement (client/src/router/)
- meta.roles: Declare allowed roles
- meta.requiresAddon: Declare required addons
- Pinia auth store: Check user role
- Route guards: beforeEach for global checks
- Component-level: v-if directives for role checks
```

---

## WORKFLOW DIAGRAMS

### 1. USER LOGIN WORKFLOW
```
┌─────────────────────────────────────────┐
│ User Enters Email & Password            │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ POST /api/auth/login                    │
│ - Validate email format                 │
│ - Check user exists in tenant           │
│ - Verify password (bcryptjs)            │
└────────┬────────────────────────────────┘
         │
    ┌────┴─────┐
    │           │
    ▼           ▼
  ✅ Success   ❌ Failed
    │           └─► Return 401
    │           Unauthorized
    ▼
┌─────────────────────────────────────────┐
│ 2FA Enabled?                            │
└────────┬────────────────────────────────┘
         │
    ┌────┴─────┐
   YES        NO
    │          │
    ▼          ▼
┌───┐       ┌────────────────┐
│2FA│       │Generate JWT    │
│ & │       │ + Refresh      │
│ │ │       │ Token          │
│Co│       │ + Return to    │
│ de│       │ Client         │
└───┘       └────────────────┘
    │              │
    └──────┬───────┘
           ▼
    ┌──────────────────┐
    │ Store in Auth    │
    │ Store + Redirect │
    │ to Dashboard     │
    └──────────────────┘
```

### 2. POS ORDER WORKFLOW
```
┌──────────────────────────────────────────────┐
│ Cashier Opens Shift (POST /api/cash-shift)   │
│ - Verify no open shift exists                │
│ - Record shift opening balance               │
│ - Create CashShift record                    │
└────────┬─────────────────────────────────────┘
         ▼
┌──────────────────────────────────────────────┐
│ Cashier Creates Order (POST /api/orders)     │
│ - Scan/select products                       │
│ - Add items to order                         │
│ - Apply discounts/member benefits            │
│ - Calculate total                            │
└────────┬─────────────────────────────────────┘
         ▼
┌──────────────────────────────────────────────┐
│ Send to Kitchen? (optional)                  │
│ - Mark sendToKitchen = true                  │
│ - Kitchen display shows order                │
│ - Kitchen marks as READY when done           │
└────────┬─────────────────────────────────────┘
         ▼
┌──────────────────────────────────────────────┐
│ Process Payment (POST /api/orders/:id/payment)
│ - Select payment method                      │
│ - Process payment (cash/card/QRIS/e-wallet)  │
│ - Call payment gateway if needed             │
└────────┬─────────────────────────────────────┘
         │
    ┌────┴─────┐
    │           │
    ▼           ▼
  ✅ OK       ❌ Failed
    │       Refund & Show Error
    ▼
┌──────────────────────────────────────────────┐
│ Transaction Completed                       │
│ - Update order status to COMPLETED          │
│ - Deduct stock from inventory               │
│ - Award loyalty points (if member)          │
│ - Generate receipt                          │
│ - Log transaction for reporting             │
└────────┬─────────────────────────────────────┘
         ▼
┌──────────────────────────────────────────────┐
│ Cashier Closes Shift (POST /api/cash-shift/close)
│ - Verify all orders processed               │
│ - Count cash received                       │
│ - Reconcile transactions                    │
│ - Record shift closing balance              │
│ - Print shift summary report                │
└──────────────────────────────────────────────┘
```

### 3. SUBSCRIPTION UPGRADE WORKFLOW
```
┌─────────────────────────────────────────────┐
│ Tenant Admin Views Subscription Page        │
│ GET /api/subscription/current               │
└────────┬────────────────────────────────────┘
         ▼
┌─────────────────────────────────────────────┐
│ Display Current Plan + Available Upgrades   │
│ Show add-ons marketplace                    │
└────────┬────────────────────────────────────┘
         ▼
┌─────────────────────────────────────────────┐
│ User Selects Upgrade Option                 │
└────────┬────────────────────────────────────┘
         ▼
┌─────────────────────────────────────────────┐
│ POST /api/subscription/upgrade              │
│ - Verify new plan > current plan            │
│ - Calculate pro-rata pricing                │
└────────┬────────────────────────────────────┘
         ▼
┌─────────────────────────────────────────────┐
│ Redirect to Payment (Midtrans)              │
│ - Create payment mapping entry              │
│ - Generate Midtrans snap token              │
│ - Show payment page                         │
└────────┬────────────────────────────────────┘
         │
    ┌────┴─────┐
    │           │
    ▼           ▼
  ✅ Paid    ❌ Failed/Cancelled
    │           │
    │           └─► Cancel upgrade
    ▼
┌─────────────────────────────────────────────┐
│ Webhook: /api/webhook/payment               │
│ - Verify payment settled                    │
│ - Update subscription plan                  │
│ - Update features cache                     │
│ - Log in subscription history               │
└────────┬────────────────────────────────────┘
         ▼
┌─────────────────────────────────────────────┐
│ Redirect to Success Page                    │
│ - Show new plan details                     │
│ - Display new features enabled              │
└─────────────────────────────────────────────┘
```

### 4. STORE SHIFT WORKFLOW
```
┌──────────────────────────────────────────────┐
│ Store Opening (by ADMIN/SUPERVISOR)         │
│ POST /api/store-shift/:outletId/open        │
└────────┬─────────────────────────────────────┘
         ▼
┌──────────────────────────────────────────────┐
│ Check no active shift exists                │
│ Create StoreShift record                    │
│ Status = OPEN                               │
│ Notify all users in store                   │
└────────┬─────────────────────────────────────┘
         ▼
┌──────────────────────────────────────────────┐
│ Cashier & Kitchen open individual shifts    │
│ (linked to StoreShift.id)                   │
│ Can now access POS & kitchen                │
└────────┬─────────────────────────────────────┘
         ▼
┌──────────────────────────────────────────────┐
│ Orders Created & Processed                  │
│ storeShiftId tracked on each order          │
└────────┬─────────────────────────────────────┘
         ▼
┌──────────────────────────────────────────────┐
│ Store Closing (by ADMIN/SUPERVISOR)         │
│ POST /api/store-shift/:id/close             │
└────────┬─────────────────────────────────────┘
         ▼
┌──────────────────────────────────────────────┐
│ Verify all cashier shifts closed            │
│ Generate shift report (revenue, orders)     │
│ Status = CLOSED                             │
│ Archive orders for reporting                │
└──────────────────────────────────────────────┘
```

### 5. INVENTORY STOCK TRANSFER WORKFLOW
```
┌─────────────────────────────────────────────┐
│ Admin/Supervisor Initiates Stock Transfer   │
│ POST /api/stock-transfers                   │
└────────┬────────────────────────────────────┘
         ▼
┌─────────────────────────────────────────────┐
│ Select:                                     │
│ - Source store                              │
│ - Destination store                         │
│ - Products & quantities                     │
└────────┬────────────────────────────────────┘
         ▼
┌─────────────────────────────────────────────┐
│ Verify source store has sufficient stock    │
│ Create StockTransfer record                 │
│ Status = PENDING                            │
└────────┬────────────────────────────────────┘
         ▼
┌─────────────────────────────────────────────┐
│ Source Store Confirms (Package items)       │
│ PATCH /api/stock-transfers/:id              │
│ Status = IN_TRANSIT                         │
└────────┬────────────────────────────────────┘
         ▼
┌─────────────────────────────────────────────┐
│ Destination Store Receives                  │
│ PATCH /api/stock-transfers/:id/receive      │
│ - Update stock balances                     │
│ - Create ProductAdjustment records          │
│ - Status = COMPLETED                        │
└────────┬────────────────────────────────────┘
         ▼
┌─────────────────────────────────────────────┐
│ Inventory Updated Across System             │
│ - Product stock levels refreshed            │
│ - Stock alerts recalculated                 │
│ - Audit log created                         │
└─────────────────────────────────────────────┘
```

### 6. EMAIL MARKETING CAMPAIGN WORKFLOW
```
┌────────────────────────────────────────────┐
│ Admin Creates Email Template                │
│ POST /api/email-templates                   │
│ - Add subject, content, variables           │
└────────┬───────────────────────────────────┘
         ▼
┌────────────────────────────────────────────┐
│ Admin Schedules Campaign                    │
│ POST /api/email-scheduler                   │
│ - Select template                           │
│ - Choose recipients (ALL/MEMBERS/ACTIVE)    │
│ - Set send time                             │
└────────┬───────────────────────────────────┘
         ▼
┌────────────────────────────────────────────┐
│ Campaign Queued (BullMQ Job)               │
│ Status = PENDING                            │
│ Scheduler watches for send time             │
└────────┬───────────────────────────────────┘
         ▼
┌────────────────────────────────────────────┐
│ Send Time Reached                           │
│ BullMQ Job Triggers                         │
└────────┬───────────────────────────────────┘
         ▼
┌────────────────────────────────────────────┐
│ Fetch Recipients (customers/members)       │
│ For each recipient:                         │
│ - Personalize email (merge variables)       │
│ - Send via email provider (Nodemailer)      │
│ - Create EmailEvent record (SENT)           │
│ - Update EmailLog                           │
└────────┬───────────────────────────────────┘
         ▼
┌────────────────────────────────────────────┐
│ Campaign Status = SENT                      │
│ Admin can view analytics:                   │
│ - Sent count                                │
│ - Open count                                │
│ - Click count                               │
│ - Bounce count                              │
└────────────────────────────────────────────┘
```

---

## DEPENDENCY ANALYSIS

### Frontend Dependencies (client/package.json)

#### Core Framework
```json
"vue": "^3.3.4"              ← Vue.js 3 - Progressive framework
"vite": "^6.4.1"             ← Build tool (extremely fast)
"vue-router": "^4.2.5"       ← Client-side routing
"pinia": "^2.1.7"            ← State management (replaces Vuex)
```

#### UI & Styling
```json
"@headlessui/vue": "^1.7.17" ← Unstyled, accessible components
"@heroicons/vue": "^2.1.1"   ← Icon library (from Tailwind Labs)
"tailwindcss": "^3.4.0"      ← Utility-first CSS framework
"postcss": "^8.4.32"         ← CSS transformation
"autoprefixer": "^10.4.16"   ← Add vendor prefixes
```

#### Data Visualization & UI Logic
```json
"chart.js": "^4.4.0"         ← Chart library
"vue-chartjs": "^5.2.0"      ← Chart.js wrapper for Vue
"date-fns": "^3.0.6"         ← Date manipulation
"cropperjs": "^2.1.0"        ← Image cropping
"html2canvas": "^1.4.1"      ← Convert HTML to canvas/image
"jspdf": "^3.0.3"            ← PDF generation
"marked": "^17.0.1"          ← Markdown parser
```

#### Network & Security
```json
"axios": "^1.6.2"            ← HTTP client
"socket.io-client": "^4.7.2" ← WebSocket client
"dompurify": "^3.3.0"        ← XSS protection (sanitize HTML)
```

#### Development Tools
```json
"@vitejs/plugin-vue": "^5.0.0" ← Vite plugin for Vue
"eslint": "^9.39.2"          ← Code linter
"@vue/eslint-config-typescript": "^14.6.0"
"@vue/eslint-config-prettier": "^10.2.0"
"typescript": "^5.3.3"       ← TypeScript compiler
"vue-tsc": "^2.0.0"          ← TypeScript type checking for Vue
"cypress": "^15.8.1"         ← E2E testing
```

### Backend Dependencies (package.json)

#### Core Framework
```json
"express": "^4.18.2"         ← Web framework
"typescript": "^5.3.3"       ← TypeScript compiler
```

#### Database & ORM
```json
"@prisma/client": "^6.19.0"  ← Prisma ORM client
"prisma": "^6.19.0"          ← Prisma CLI (dev dependency)
```

#### Authentication & Security
```json
"jsonwebtoken": "^9.0.2"     ← JWT generation & verification
"bcryptjs": "^2.4.3"         ← Password hashing
"otplib": "^12.0.1"          ← 2FA code generation (TOTP)
"express-validator": "^7.0.1" ← Request validation
"helmet": "^7.1.0"           ← Security headers
"express-mongo-sanitize": "^2.2.0" ← Sanitize inputs (MongoDB injections)
"mongo-sanitize": "^1.1.0"   ← Additional sanitization
"cors": "^2.8.5"             ← CORS handling
"csrf": "^3.1.0"             ← CSRF tokens
"cookie-parser": "^1.4.7"    ← Parse cookies
"compression": "^1.7.4"      ← Gzip compression
```

#### Validation & Parsing
```json
"zod": "^3.22.4"             ← Schema validation library
"dompurify": "^3.3.0"        ← Sanitize HTML
"isomorphic-dompurify": "^2.35.0"
```

#### Job Queue & Caching
```json
"bullmq": "^5.0.0"           ← Job queue (Redis-backed)
"ioredis": "^5.3.2"          ← Redis client
```

#### External Services
```json
"midtrans-client": "^1.4.3"  ← Payment gateway SDK
"nodemailer": "^6.9.7"       ← Email sending
"socket.io": "^4.8.1"        ← Real-time WebSocket
"sharp": "^0.33.0"           ← Image processing & optimization
"qrcode": "^1.5.4"           ← QR code generation
"pdfkit": "^0.17.2"          ← PDF generation (backend)
"pdfmake": "^0.2.20"         ← PDF building
```

#### Monitoring & Logging
```json
"winston": "^3.11.0"         ← Logging library
"prom-client": "^15.1.0"     ← Prometheus metrics
"swagger-jsdoc": "^6.2.8"    ← API documentation generation
"swagger-ui-express": "^5.0.0" ← Swagger UI server
"express-rate-limit": "^7.5.1" ← Rate limiting
```

#### Utilities
```json
"dotenv": "^16.3.1"          ← Environment variable loading
```

### Dependency Summary by Purpose

| Purpose | Library | Version | Active? |
|---------|---------|---------|---------|
| **Frontend Framework** | Vue + Vite | 3.3.4 + 6.4.1 | ✅ |
| **State Management** | Pinia | 2.1.7 | ✅ |
| **Routing** | Vue Router | 4.2.5 | ✅ |
| **Backend Framework** | Express | 4.18.2 | ✅ |
| **Database ORM** | Prisma | 6.19.0 | ✅ |
| **Authentication** | JWT + 2FA | 9.0.2 + 12.0.1 | ✅ |
| **Password Hashing** | bcryptjs | 2.4.3 | ✅ |
| **Validation** | Zod | 3.22.4 | ✅ |
| **Job Queue** | BullMQ + Redis | 5.0.0 + 5.3.2 | ✅ |
| **Real-time** | Socket.io | 4.8.1 | ✅ |
| **Payment** | Midtrans | 1.4.3 | ✅ |
| **Email** | Nodemailer | 6.9.7 | ✅ |
| **Logging** | Winston | 3.11.0 | ✅ |
| **Charts** | Chart.js | 4.4.0 | ✅ |
| **CSS Framework** | Tailwind CSS | 3.4.0 | ✅ |
| **Testing** | Vitest + Cypress | 1.0.0 + 15.8.1 | ⚠️ Limited |
| **Linting** | ESLint | 9.39.2 | ✅ |

---

## GAP & ISSUE REPORT

### 🔴 CRITICAL ISSUES

#### 1. Shift Management Inconsistency
**Status**: BLOCKING
**Description**: 
- CashShift is tracked implicitly through orders/transactions
- No explicit CashShift table in schema
- Shift closing logic might not be comprehensive

**Files Affected**:
- `src/services/cash-shift.service.ts`
- `src/routes/cash-shift.routes.ts`

**Implications**:
- Cashiers may not be properly tracked
- Shift reconciliation may fail
- Audit trail incomplete

**Recommended Fix**:
- Add explicit CashShift model to Prisma schema
- Track opening/closing with balances
- Link all transactions to CashShift

---

#### 2. Store Shift vs Outlet Confusion
**Status**: BLOCKING
**Description**:
- Two concepts: `outlet` (store location) and `storeShift` (daily shift)
- Not clear how they interact
- Schema shows storeShifts linked to outlets, but no explicit shift-opening flow

**Files Affected**:
- `src/routes/store-shift.routes.ts`
- `src/middlewares/shift-guard.ts`

**Implications**:
- Complex shift management
- Potential data isolation issues
- Supervisors may bypass shift checks

**Recommended Fix**:
- Document shift lifecycle clearly
- Ensure all operations require active shift
- Add comprehensive logging

---

#### 3. Permission System Fragmentation
**Status**: MAJOR
**Description**:
- Permissions stored as JSON in User model
- No schema/validation for permission structure
- Multiple permission checks scattered across code
- No centralized permission resolver

**Files Affected**:
- `src/types/user-permissions.ts`
- `src/middlewares/auth.ts`
- Multiple route files

**Implications**:
- Permission escalation vulnerability
- Inconsistent access control
- Difficult to audit

**Recommended Fix**:
- Create dedicated UserPermission/UserRole table
- Centralize permission checks via service
- Implement permission validation middleware

---

#### 4. Missing Backend Route Protection
**Status**: MAJOR
**Description**:
- Some routes (60+) may not have complete guard coverage
- Addon guards may not be enforced uniformly
- Store access guards inconsistent

**Files Affected**:
- All files in `src/routes/`

**Implications**:
- CASHIER might access ADMIN_TENANT data
- SUPERVISOR might access other supervisors' stores
- Addons may be accessible without payment

**Recommended Fix**:
- Audit all 60+ route files
- Add comprehensive guards to each route
- Create test suite for authorization

---

### 🟠 MAJOR ISSUES

#### 5. Kitchen Display System Integration
**Status**: INCOMPLETE
**Description**:
- Kitchen view exists but integration with ordering is loose
- No explicit kitchen workflow enforcement
- Kitchen staff can potentially create orders

**Files Affected**:
- `client/src/views/kitchen/KitchenOrders.vue`
- `src/routes/order.routes.ts`
- Kitchen-related services

**Implications**:
- Kitchen might interfere with POS workflow
- Order prep time not tracked
- Kitchen can access other stores

**Recommended Fix**:
- Restrict kitchen to view-only operations
- Add explicit order-to-kitchen flow
- Track preparation times

---

#### 6. Payment Gateway Integration Gaps
**Status**: INCOMPLETE
**Description**:
- Midtrans integration present
- Webhook payment handling exists
- But payment failure recovery unclear
- Partial payment/refund logic may be incomplete

**Files Affected**:
- `src/services/payment-gateway-integration.service.ts`
- `src/routes/webhook.routes.ts`
- `src/routes/payment.routes.ts`

**Implications**:
- Orphaned payment records
- Inconsistent transaction status
- Customer refund requests unhandled

**Recommended Fix**:
- Document complete payment lifecycle
- Implement payment reconciliation job
- Add retry/recovery mechanisms

---

#### 7. Addon Purchase & Feature Activation
**Status**: INCOMPLETE
**Description**:
- TenantAddon model exists
- But feature activation flow unclear
- No clear upgrade/downgrade process
- Feature flag checks scattered

**Files Affected**:
- `src/services/addon.service.ts`
- `src/routes/addon.routes.ts`
- `src/middlewares/addon-guard.ts`

**Implications**:
- Users might access disabled features
- Addon expiration not handled
- Refunds/cancellations unclear

**Recommended Fix**:
- Centralize feature activation logic
- Implement addon lifecycle management
- Add auto-expiration job

---

#### 8. Data Encryption & Privacy
**Status**: INCOMPLETE
**Description**:
- Passwords hashed (bcryptjs) ✅
- Some PII fields not encrypted
- No field-level encryption
- GDPR compliance unclear

**Files Affected**:
- `src/routes/gdpr.routes.ts`
- Database fields (email, phone, address)

**Implications**:
- GDPR data deletion not comprehensive
- Customer data exposure risk
- Regulatory non-compliance

**Recommended Fix**:
- Implement field-level encryption for PII
- Add data anonymization features
- Complete GDPR deletion workflow

---

### 🟡 MODERATE ISSUES

#### 9. Audit Logging Incompleteness
**Status**: INCOMPLETE
**Description**:
- AuditLog model exists
- But not all user actions logged
- Some system changes not tracked
- No immutable audit table

**Files Affected**:
- `src/middlewares/audit-logger.ts`
- `src/services/audit-log.service.ts`

**Implications**:
- Incomplete compliance trail
- Difficult forensics
- May fail audits

**Recommended Fix**:
- Audit all modifying operations
- Add immutable audit table
- Implement audit retention policy

---

#### 10. Test Coverage Low
**Status**: INCOMPLETE
**Description**:
- Vitest config exists
- Few tests actually written
- No integration test suite
- E2E tests (Cypress) minimal

**Files Affected**:
- `vitest.config.ts`
- `tests/` directory (mostly empty)

**Implications**:
- Regressions not caught
- Refactoring risky
- Production bugs likely

**Recommended Fix**:
- Write unit tests for services
- Add integration tests for workflows
- Increase E2E test coverage

---

#### 11. Frontend Route Guard Completeness
**Status**: INCOMPLETE
**Description**:
- Routes have meta.roles but enforcement inconsistent
- Some addon checks missing
- Store access guard not on all routes needing it

**Files Affected**:
- `client/src/router/index.ts`
- `client/src/router/addon.routes.ts`

**Implications**:
- Users see 403 errors (poor UX)
- Potential XSS via route bypass
- Addon ads showing without payment

**Recommended Fix**:
- Add guards to all protected routes
- Test role/addon/store access combinations
- Improve error messages

---

#### 12. Error Handling & User Feedback
**Status**: INCONSISTENT
**Description**:
- Some endpoints return 403, others return 400
- Error messages not user-friendly (some in Indonesian, some English)
- Frontend error handling varies by page

**Files Affected**:
- All route files
- All view components

**Implications**:
- Poor user experience
- Hard to debug
- Inconsistent API contract

**Recommended Fix**:
- Standardize error response format
- Use consistent HTTP status codes
- Improve error messages

---

### 🔵 MINOR ISSUES

#### 13. Documentation Maintenance
**Status**: OUTDATED
**Description**:
- 70+ documentation files
- Many marked "COMPLETE" but may be stale
- Phase 36 docs exist, but unclear what latest version is

**Files Affected**:
- `docs/` directory (extensive)

**Implications**:
- New developers confused
- Implementation deviates from docs
- Knowledge silos

**Recommended Fix**:
- Consolidate documentation
- Mark version/date on key docs
- Add "currently implemented" section

---

#### 14. Logging Consistency
**Status**: INCONSISTENT
**Description**:
- Winston logger used but configuration inconsistent
- Some modules use console.log
- Different log levels/formats

**Files Affected**:
- `src/utils/logger.ts`
- Various service files

**Implications**:
- Hard to debug production issues
- Performance monitoring difficult
- Log analysis challenging

**Recommended Fix**:
- Standardize logger setup across codebase
- Use structured logging (JSON)
- Add correlation IDs to requests

---

#### 15. Type Safety Issues
**Status**: INCOMPLETE
**Description**:
- TypeScript strict mode may not be enabled
- Any types used in some places
- Prisma types not fully utilized

**Files Affected**:
- `tsconfig.json`
- Various service/route files

**Implications**:
- Runtime type errors possible
- Refactoring risky
- IDE intellisense limited

**Recommended Fix**:
- Enable TypeScript strict mode
- Remove all `any` types
- Use Zod validation for runtime types

---

### 📋 FEATURE COMPLETION STATUS

| Feature | Status | Notes |
|---------|--------|-------|
| **POS System** | ✅ Active | Core functionality working, shift management OK |
| **Multi-tenant** | ✅ Active | Isolation working, tenant switching OK |
| **Authentication** | ✅ Active | JWT + 2FA implemented, password reset working |
| **RBAC** | ⚠️ Partial | Roles defined, but permission system fragmented |
| **Payment** | ⚠️ Partial | Midtrans integrated, but failure recovery incomplete |
| **Inventory** | ✅ Active | Stock tracking, transfers, adjustments working |
| **Reporting** | ✅ Active | Basic + advanced reports available |
| **Email Marketing** | ✅ Active | Templates, scheduling, analytics working |
| **Subscriptions** | ⚠️ Partial | Basic management works, addon integration incomplete |
| **Kitchen Display** | ⚠️ Partial | View shows orders, but workflow loose |
| **Analytics** | ⚠️ Partial | Dashboard working, advanced analytics tied to addon |
| **Audit Logging** | ⚠️ Partial | Table exists, but not all operations logged |
| **Testing** | ❌ Missing | Config exists, tests not written |
| **Documentation** | ⚠️ Outdated | Extensive but possibly stale |
| **Error Handling** | ⚠️ Inconsistent | Works but messages not standardized |
| **Performance** | ⚠️ Unknown | No monitoring/benchmarks documented |

---

### 🎯 RECOMMENDED PRIORITY FIXES

**WEEK 1 (Critical)**:
1. Fix permission system fragmentation (centralize checks)
2. Audit & complete route protection (60+ routes)
3. Add explicit CashShift model & lifecycle

**WEEK 2 (Major)**:
4. Complete payment failure recovery
5. Clarify & document shift workflows
6. Enhance kitchen display integration

**WEEK 3 (Important)**:
7. Implement addon lifecycle management
8. Add field-level encryption for PII
9. Complete audit logging coverage

**WEEK 4+ (Nice-to-have)**:
10. Increase test coverage
11. Standardize error handling
12. Consolidate documentation

---

## SUMMARY

### System Status Overview
```
✅ PRODUCTION-READY COMPONENTS:
   ├─ Multi-tenant core architecture
   ├─ POS with order management
   ├─ Authentication & basic RBAC
   ├─ Inventory tracking
   ├─ Payment integration (Midtrans)
   ├─ Email marketing
   ├─ Subscription management
   ├─ Reporting & analytics
   └─ Audit logging (partial)

⚠️ NEEDS ATTENTION:
   ├─ Permission system (fragmented)
   ├─ Route authorization (incomplete)
   ├─ Shift management (implicit)
   ├─ Kitchen integration (loose)
   ├─ Payment recovery (incomplete)
   ├─ Addon lifecycle (incomplete)
   ├─ Data encryption (partial)
   └─ Error handling (inconsistent)

❌ MISSING/NOT TESTED:
   ├─ Comprehensive unit tests
   ├─ Integration test suite
   ├─ E2E test coverage
   ├─ Performance benchmarks
   ├─ Load testing
   └─ Disaster recovery procedures
```

### Recommended Next Steps
1. **Use this blueprint as audit baseline** - Compare actual implementation against documented structure
2. **Fix critical security issues** - Especially permission & route authorization
3. **Complete incomplete features** - Shift management, addon lifecycle, payment recovery
4. **Add test coverage** - Especially for authentication & authorization
5. **Document current state** - Update docs to reflect actual implementation
6. **Establish monitoring** - Add observability for production
7. **Create runbook** - Deployment, scaling, disaster recovery procedures

---

**End of System Blueprint**
**Date Generated**: January 20, 2026
**Project Version**: 1.1.0
**Status**: Phase 36 Complete (per documentation)
