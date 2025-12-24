# 📚 Warungin SaaS POS - Feature Documentation

**Version:** 1.1.0  
**Last Updated:** 2024-12-24  
**Status:** Production Ready (90-95%)

---

## 🏗️ Architecture Overview

### Tech Stack
| Layer | Technology |
|-------|------------|
| **Backend** | Node.js + Express + TypeScript |
| **Frontend** | Vue 3 + TypeScript + Vite |
| **Database** | PostgreSQL + Prisma ORM |
| **Cache** | Redis + ioredis |
| **Queue** | BullMQ |
| **Auth** | JWT + 2FA (OTP) |
| **Monitoring** | Prometheus + Grafana + Loki |
| **Deployment** | Docker + Docker Compose |

### Multi-Tenant Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    SUPER ADMIN                          │
│  - Manage all tenants                                   │
│  - System-wide settings                                 │
│  - Global reports & monitoring                          │
└─────────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  Tenant A   │   │  Tenant B   │   │  Tenant C   │
│  (Toko X)   │   │  (Toko Y)   │   │  (Toko Z)   │
└─────────────┘   └─────────────┘   └─────────────┘
```

---

## 👤 User Roles & Permissions

| Role | Description | Access Level |
|------|-------------|--------------|
| **SUPER_ADMIN** | System administrator | Full system access |
| **ADMIN_TENANT** | Business owner | Full tenant access |
| **SUPERVISOR** | Store manager | Reports, stock, limited settings |
| **CASHIER** | Kasir/Cashier | POS, transactions only |
| **KITCHEN** | Kitchen staff | Kitchen display only |

---

## 🖥️ Frontend Pages (Detail)

### 🏠 Public Pages (No Auth Required)

#### 1. Home Page
- **Route:** `/`
- **File:** `views/marketing/Home.vue`
- **Description:** Landing page dengan informasi produk
- **Features:**
  - Hero section
  - Feature highlights
  - Pricing preview
  - Call-to-action buttons

#### 2. Demo Page
- **Route:** `/demo`
- **File:** `views/marketing/Demo.vue`
- **Description:** Demo request form
- **Features:**
  - Demo video preview
  - Request demo form
  - Feature showcase

#### 3. Pricing Page
- **Route:** `/pricing`
- **File:** `views/marketing/Pricing.vue`
- **Description:** Subscription plans & pricing
- **Features:**
  - Plan comparison table
  - Feature list per plan
  - Add-ons pricing

#### 4. Contact Page
- **Route:** `/contact`
- **File:** `views/marketing/Contact.vue`
- **Description:** Contact form
- **Features:**
  - Contact form submission
  - FAQ section
  - Support information

#### 5. Terms & Conditions
- **Route:** `/terms`
- **File:** `views/marketing/Terms.vue`
- **Description:** Legal terms

#### 6. Help Center
- **Route:** `/help`
- **File:** `views/marketing/Help.vue`
- **Description:** Help documentation

---

### 🔐 Authentication

#### 7. Login Page
- **Route:** `/login`
- **File:** `views/auth/Login.vue`
- **Description:** User authentication
- **Features:**
  - Email/password login
  - Remember me option
  - 2FA support
  - Store selector (for Cashier/Supervisor)
  - Forgot password link

---

### 📊 Dashboard Pages

#### 8. Tenant Dashboard
- **Route:** `/app/dashboard`
- **File:** `views/dashboard/Dashboard.vue`
- **Roles:** ADMIN_TENANT, SUPERVISOR, CASHIER
- **Description:** Main dashboard untuk tenant
- **Features:**
  - Sales summary (today, week, month)
  - Revenue charts
  - Top products
  - Recent orders
  - Quick stats widgets
  - Low stock alerts

#### 9. Super Admin Dashboard
- **Route:** `/app/super-dashboard`
- **File:** `views/superadmin/SuperDashboard.vue`
- **Roles:** SUPER_ADMIN only
- **Description:** System-wide overview
- **Features:**
  - Total tenants count
  - Active subscriptions
  - Revenue overview
  - System health status
  - Recent registrations

---

### 🛒 POS (Point of Sale)

#### 10. POS Main
- **Route:** `/app/pos`
- **File:** `views/pos/POS.vue`
- **Roles:** CASHIER, ADMIN_TENANT, SUPERVISOR
- **Description:** Main cashier interface
- **Features:**
  - Product grid/list view
  - Category filter
  - Search products
  - Cart management
  - Quantity adjustment
  - **Discount types:**
    - Auto discount (system)
    - Member discount
    - Manual discount (%, Rp)
  - **Payment methods:**
    - CASH
    - QRIS
    - E-Wallet (DANA, ShopeePay)
    - Card
    - Bank Transfer
  - Print receipt
  - **Offline Mode:**
    - Continue transactions without internet
    - Auto-sync when online
    - Failed sync notification

#### 11. Failed Sync Review
- **Route:** `/app/pos/failed-syncs`
- **File:** `views/pos/FailedSyncReview.vue`
- **Roles:** CASHIER, ADMIN_TENANT, SUPERVISOR
- **Description:** Review failed offline transactions
- **Features:**
  - List of failed syncs
  - Retry sync button
  - Discard option
  - Error details
  - Troubleshooting tips

---

### 📦 Product Management

#### 12. Products
- **Route:** `/app/products`
- **File:** `views/products/Products.vue`
- **Roles:** ADMIN_TENANT, SUPERVISOR, CASHIER*
- **Description:** Product catalog management
- **Features:**
  - Product list (table/grid)
  - Add/Edit/Delete products
  - Categories management
  - SKU management
  - Price settings
  - Stock quantity
  - Product images
  - Active/Inactive toggle
  - Bulk import/export
  - Consignment products

#### 13. Product Adjustments
- **Route:** `/app/products/adjustments`
- **File:** `views/products/ProductAdjustments.vue`
- **Roles:** ADMIN_TENANT
- **Description:** Stock adjustment history
- **Features:**
  - Adjustment history log
  - Filter by date/product
  - Adjustment reasons
  - User tracking

---

### 📋 Order Management

#### 14. Orders
- **Route:** `/app/orders`
- **File:** `views/orders/Orders.vue`
- **Roles:** All roles
- **Description:** Order history & management
- **Features:**
  - Order list with filters
  - Status filter (Pending, Processing, Completed, Cancelled)
  - Date range filter
  - Order details modal
  - Receipt reprint
  - Cancel/refund orders
  - Send to kitchen

#### 15. Kitchen Orders
- **Route:** `/app/orders/kitchen`
- **File:** `views/kitchen/KitchenOrders.vue`
- **Roles:** KITCHEN only
- **Description:** Kitchen display system
- **Features:**
  - Incoming orders queue
  - Mark as prepared
  - Order timer
  - Priority display
  - Sound notification

---

### 👥 Customer & Member

#### 16. Customers
- **Route:** `/app/customers`
- **File:** `views/customers/Customers.vue`
- **Roles:** ADMIN_TENANT, SUPERVISOR, CASHIER*
- **Description:** Customer database
- **Features:**
  - Customer list
  - Add/Edit customers
  - Customer details
  - Purchase history
  - Member registration
  - Birthday tracking
  - Contact information

---

### 🎁 Loyalty & Rewards

#### 17. Rewards Management
- **Route:** `/app/rewards`
- **File:** `views/rewards/Rewards.vue`
- **Roles:** ADMIN_TENANT, SUPERVISOR
- **Description:** Reward points configuration
- **Features:**
  - Point earning rules
  - Point redemption settings
  - Reward tiers
  - Point history
  - Member rewards

#### 18. Reward View
- **Route:** `/app/reward-view`
- **File:** `views/rewards/RewardView.vue`
- **Description:** Customer reward view

---

### 💰 Discounts & Promotions

#### 19. Discounts
- **Route:** `/app/discounts`
- **File:** `views/discounts/Discounts.vue`
- **Roles:** ADMIN_TENANT
- **Description:** Discount management
- **Features:**
  - Create discount rules
  - Discount types:
    - Percentage (%)
    - Fixed amount (Rp)
    - Buy X Get Y
  - Validity period
  - Min purchase amount
  - Product-specific discounts
  - Member-only discounts
  - Active/Inactive toggle

---

### 📊 Reports

#### 20. Reports
- **Route:** `/app/reports`
- **File:** `views/reports/Reports.vue`
- **Roles:** ADMIN_TENANT, SUPERVISOR, CASHIER*
- **Description:** Sales & business reports
- **Features:**
  - Daily sales report
  - Product sales report
  - Category report
  - Payment method breakdown
  - Date range filter
  - Export to PDF/Excel

#### 21. Store Reports
- **Route:** `/app/reports/stores`
- **File:** `views/reports/StoreReports.vue`
- **Roles:** ADMIN_TENANT, SUPERVISOR
- **Description:** Multi-store reports
- **Features:**
  - Per-store comparison
  - Store performance
  - Cross-store metrics

#### 22. Advanced Reporting
- **Route:** `/app/reports/advanced`
- **File:** `views/reports/AdvancedReporting.vue`
- **Roles:** ADMIN_TENANT, SUPERVISOR
- **Requires Addon:** BUSINESS_ANALYTICS
- **Features:**
  - Custom report builder
  - Advanced filters
  - Scheduled reports
  - Data visualization

#### 23. Global Reports (Super Admin)
- **Route:** `/app/reports/global`
- **File:** `views/reports/GlobalReports.vue`
- **Roles:** SUPER_ADMIN
- **Description:** System-wide reports
- **Features:**
  - All tenants overview
  - Subscription revenue
  - System metrics

---

### 💵 Finance

#### 24. Finance Overview
- **Route:** `/app/finance`
- **File:** `views/finance/AccountingFinance.vue`
- **Roles:** ADMIN_TENANT
- **Requires Addon:** BUSINESS_ANALYTICS
- **Features:**
  - Cash flow overview
  - Income/expense tracking
  - Bank reconciliation

#### 25. Financial Management
- **Route:** `/app/finance/management`
- **File:** `views/finance/FinancialManagement.vue`
- **Roles:** ADMIN_TENANT, SUPERVISOR
- **Features:**
  - Budget management
  - Financial forecasting

#### 26. Profit & Loss Report
- **Route:** `/app/profit-loss`
- **File:** `views/finance/ProfitLossReport.vue`
- **Roles:** ADMIN_TENANT
- **Features:**
  - P&L statement
  - Period comparison
  - Category breakdown

---

### 💼 Store Shift Management

#### 27. Cash Shift (Kasir)
- **Route:** `/app/cashier/cash-shift`
- **File:** `views/cashier/CashShift.vue`
- **Roles:** CASHIER
- **Description:** Individual cashier shift
- **Features:**
  - Open shift with cash modal
  - Close shift with reconciliation
  - Cash count
  - Shift summary

---

### 📦 Inventory Management

#### 28. Suppliers
- **Route:** `/app/inventory/suppliers`
- **File:** `views/inventory/Suppliers.vue`
- **Roles:** ADMIN_TENANT
- **Features:**
  - Supplier list
  - Contact information
  - Product associations

#### 29. Purchase Orders
- **Route:** `/app/inventory/purchase-orders`
- **File:** `views/inventory/PurchaseOrders.vue`
- **Roles:** ADMIN_TENANT
- **Features:**
  - Create PO
  - PO status tracking
  - Receive goods
  - PO history

#### 30. Stock Alerts
- **Route:** `/app/inventory/stock-alerts`
- **File:** `views/inventory/StockAlerts.vue`
- **Roles:** ADMIN_TENANT
- **Features:**
  - Low stock notifications
  - Alert thresholds
  - Auto-reorder suggestions

#### 31. Restock Suggestions
- **Route:** `/app/inventory/restock-suggestions`
- **File:** `views/inventory/RestockSuggestions.vue`
- **Roles:** ADMIN_TENANT
- **Features:**
  - AI-based suggestions
  - Sales velocity analysis
  - Optimal stock levels

#### 32. Stock Transfers
- **Route:** `/app/inventory/stock-transfers`
- **File:** `views/inventory/StockTransfers.vue`
- **Roles:** ADMIN_TENANT
- **Features:**
  - Transfer between outlets
  - Transfer history
  - Approval workflow

---

### 🚚 Delivery

#### 33. Delivery Orders
- **Route:** `/app/delivery`
- **File:** `views/delivery/DeliveryOrders.vue`
- **Roles:** ADMIN_TENANT, SUPERVISOR
- **Requires Addon:** DELIVERY_MARKETING
- **Features:**
  - Delivery queue
  - Driver assignment
  - Status tracking
  - Delivery zones

---

### 📧 Marketing

#### 34. Marketing Campaigns
- **Route:** `/app/marketing`
- **File:** `views/marketing/MarketingCampaigns.vue`
- **Roles:** ADMIN_TENANT
- **Requires Addon:** DELIVERY_MARKETING
- **Features:**
  - Campaign management
  - Email campaigns
  - SMS campaigns
  - Push notifications

#### 35. Email Templates
- **Route:** `/app/marketing/email-templates`
- **File:** `views/marketing/EmailTemplates.vue`
- **Features:**
  - Template editor
  - Pre-built templates
  - Variable placeholders

#### 36. Email Analytics
- **Route:** `/app/marketing/email-analytics`
- **File:** `views/marketing/EmailAnalytics.vue`
- **Features:**
  - Open rates
  - Click rates
  - Campaign performance

#### 37. Email Scheduler
- **Route:** `/app/marketing/email-scheduler`
- **File:** `views/marketing/EmailScheduler.vue`
- **Features:**
  - Schedule emails
  - Recurring campaigns
  - Audience targeting

#### 38. Customer Engagement
- **Route:** `/app/marketing/customer-engagement`
- **File:** `views/marketing/CustomerEngagement.vue`
- **Features:**
  - Engagement metrics
  - Customer segments
  - Automated workflows

---

### 📈 Analytics

#### 39. Advanced Analytics
- **Route:** `/app/analytics`
- **File:** `views/analytics/AdvancedAnalytics.vue`
- **Roles:** ADMIN_TENANT
- **Requires Addon:** BUSINESS_ANALYTICS
- **Features:**
  - Sales trends
  - Customer insights
  - Product performance
  - Forecasting
  - Custom metrics

---

### 👥 User Management

#### 40. Users
- **Route:** `/app/users`
- **File:** `views/users/Users.vue`
- **Roles:** ADMIN_TENANT, SUPERVISOR
- **Features:**
  - User list
  - Add/Edit users
  - Role assignment
  - Permissions (for Cashier)
  - Active/Inactive toggle
  - Password reset

---

### 🏪 Store/Outlet Management

#### 41. Stores
- **Route:** `/app/stores`
- **File:** `views/stores/Stores.vue`
- **Roles:** ADMIN_TENANT
- **Features:**
  - Multi-outlet support
  - Store details
  - Operating hours
  - Location settings

---

### 🧾 Receipts

#### 42. Receipt Templates
- **Route:** `/app/receipts/templates`
- **File:** `views/receipts/ReceiptTemplates.vue`
- **Roles:** ADMIN_TENANT
- **Features:**
  - Receipt customization
  - Logo upload
  - Footer text
  - QR code settings
  - Print settings

---

### 💳 Subscription

#### 43. Subscription
- **Route:** `/app/subscription`
- **File:** `views/subscription/Subscription.vue`
- **Roles:** ADMIN_TENANT
- **Features:**
  - Current plan details
  - Plan upgrade/downgrade
  - Payment history
  - Invoice download

#### 44. Subscription Plans (Settings)
- **Route:** `/app/settings/subscription`
- **File:** `views/settings/SubscriptionPlans.vue`
- **Features:**
  - Plan comparison
  - Feature details

---

### 🔌 Add-ons

#### 45. Add-ons
- **Route:** `/app/addons`
- **File:** `views/addons/Addons.vue`
- **Roles:** ADMIN_TENANT
- **Features:**
  - Available add-ons
  - Active add-ons
  - Purchase add-ons
  - Add-on settings

---

### ⚙️ Settings

#### 46. Store Settings
- **Route:** `/app/settings/store`
- **File:** `views/settings/StoreSettings.vue`
- **Roles:** ADMIN_TENANT
- **Features:**
  - Business information
  - Tax settings
  - Currency settings
  - Receipt settings

#### 47. Two-Factor Auth
- **Route:** `/app/settings/2fa`
- **File:** `views/settings/TwoFactorAuth.vue`
- **Roles:** All roles
- **Features:**
  - Enable/disable 2FA
  - QR code setup
  - Backup codes

#### 48. Sessions
- **Route:** `/app/settings/sessions`
- **File:** `views/settings/Sessions.vue`
- **Features:**
  - Active sessions
  - Logout all devices
  - Session history

#### 49. Password Settings
- **Route:** `/app/settings/password`
- **File:** `views/settings/PasswordSettings.vue`
- **Features:**
  - Change password
  - Password requirements

#### 50. GDPR Settings
- **Route:** `/app/settings/gdpr`
- **File:** `views/settings/GDPRSettings.vue`
- **Features:**
  - Data export
  - Account deletion
  - Privacy settings

#### 51. Webhooks
- **Route:** `/app/settings/webhooks`
- **File:** `views/settings/Webhooks.vue`
- **Roles:** ADMIN_TENANT
- **Features:**
  - Webhook endpoints
  - Event subscriptions
  - Webhook logs

#### 52. Webhook Tester
- **Route:** `/app/settings/webhooks/tester`
- **File:** `views/settings/WebhookTester.vue`
- **Features:**
  - Test webhook delivery
  - Payload preview

#### 53. System Settings (Super Admin)
- **Route:** `/app/settings/system`
- **File:** `views/settings/SystemSettings.vue`
- **Roles:** SUPER_ADMIN
- **Features:**
  - Global settings
  - Email configuration
  - Payment gateway settings

---

### 🔧 Super Admin Pages

#### 54. Tenants Management
- **Route:** `/app/tenants`
- **File:** `views/tenants/Tenants.vue`
- **Roles:** SUPER_ADMIN
- **Features:**
  - All tenants list
  - Tenant status
  - Subscription info
  - Quick actions

#### 55. Tenant Detail
- **Route:** `/app/tenants/:id`
- **File:** `views/tenants/TenantDetail.vue`
- **Features:**
  - Tenant information
  - Users list
  - Subscription history
  - Usage metrics

#### 56. Tenant Support
- **Route:** `/app/tenants/support`
- **File:** `views/tenants/TenantSupport.vue`
- **Features:**
  - Support tickets
  - Communication history

#### 57. Contact Messages
- **Route:** `/app/superadmin/contact-messages`
- **File:** `views/superadmin/ContactMessages.vue`
- **Roles:** SUPER_ADMIN
- **Features:**
  - Contact form submissions
  - Reply functionality
  - Status tracking

#### 58. Server Monitor
- **Route:** `/app/superadmin/server-monitor`
- **File:** `views/superadmin/ServerMonitor.vue`
- **Roles:** SUPER_ADMIN
- **Features:**
  - CPU/Memory usage
  - Disk space
  - Database status
  - Redis status
  - API health
  - Docker containers status

#### 59. System Info
- **Route:** `/app/superadmin/system-info`
- **File:** `views/superadmin/SystemInfo.vue`
- **Roles:** SUPER_ADMIN
- **Features:**
  - System version
  - Dependencies
  - Configuration
  - Logs viewer

#### 60. Backup Management
- **Route:** `/app/superadmin/backups`
- **File:** `views/superadmin/BackupManagement.vue`
- **Roles:** SUPER_ADMIN
- **Features:**
  - Manual backup
  - Backup history
  - Restore options
  - Scheduled backups

#### 61. Archive Management
- **Route:** `/app/settings/archive`
- **File:** `views/settings/ArchiveManagement.vue`
- **Roles:** SUPER_ADMIN
- **Features:**
  - Archived data
  - Archive policies

#### 62. Retention Management
- **Route:** `/app/settings/retention`
- **File:** `views/settings/RetentionManagement.vue`
- **Roles:** SUPER_ADMIN
- **Features:**
  - Data retention policies
  - Auto-cleanup settings

---

## 🔌 Backend API Routes

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | User login |
| POST | `/logout` | User logout |
| POST | `/refresh` | Refresh token |
| GET | `/me` | Get current user |
| POST | `/register` | Register new tenant |

### Products (`/api/products`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List products |
| POST | `/` | Create product |
| GET | `/:id` | Get product |
| PUT | `/:id` | Update product |
| DELETE | `/:id` | Delete product |
| POST | `/bulk` | Bulk import |
| GET | `/export` | Export products |

### Orders (`/api/orders`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List orders |
| POST | `/` | Create order |
| GET | `/:id` | Get order |
| PUT | `/:id` | Update order |
| POST | `/:id/cancel` | Cancel order |
| POST | `/:id/refund` | Refund order |
| POST | `/offline-sync` | Sync offline orders |

### Dashboard (`/api/dashboard`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Get dashboard stats |
| GET | `/sales` | Sales summary |
| GET | `/top-products` | Top selling products |
| GET | `/recent-orders` | Recent orders |

### Customers (`/api/customers`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List customers |
| POST | `/` | Create customer |
| GET | `/:id` | Get customer |
| PUT | `/:id` | Update customer |
| DELETE | `/:id` | Delete customer |

### Members (`/api/members`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List members |
| POST | `/` | Register member |
| GET | `/:id` | Get member |
| GET | `/:id/points` | Get member points |

### Discounts (`/api/discounts`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List discounts |
| POST | `/` | Create discount |
| PUT | `/:id` | Update discount |
| DELETE | `/:id` | Delete discount |
| GET | `/check` | Check applicable discounts |

### Reports (`/api/reports`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sales` | Sales report |
| GET | `/products` | Product report |
| GET | `/customers` | Customer report |
| GET | `/export/:type` | Export report |

### Finance (`/api/finance`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cash-flow` | Cash flow report |
| GET | `/profit-loss` | P&L report |
| POST | `/expense` | Record expense |

### Store Shift (`/api/store-shift`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/open` | Open store shift |
| POST | `/close` | Close store shift |
| GET | `/current` | Get current shift |
| GET | `/history` | Shift history |

### Users (`/api/users`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List users |
| POST | `/` | Create user |
| PUT | `/:id` | Update user |
| DELETE | `/:id` | Delete user |
| PUT | `/:id/permissions` | Update permissions |

### Subscriptions (`/api/subscriptions`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get subscription |
| GET | `/plans` | List plans |
| POST | `/upgrade` | Upgrade plan |
| POST | `/downgrade` | Downgrade plan |

### Admin Monitor (`/api/admin`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | System health |
| GET | `/metrics` | System metrics |
| GET | `/docker` | Docker status |
| GET | `/database` | Database status |

---

## 🔄 Business Flow

### 1. Daily Store Operation Flow
```
1. OPENING
   └─> Supervisor/Kasir login
   └─> Store Shift: Open with cash modal
   └─> System ready for transactions

2. TRANSACTIONS
   └─> Customer arrives
   └─> Scan/select products
   └─> Apply discounts (if any)
   └─> Select payment method
   └─> Process payment
   └─> Print receipt
   └─> Stock automatically updated

3. CLOSING
   └─> Store Shift: Close
   └─> Count cash in drawer
   └─> System calculates difference
   └─> Generate daily report
   └─> Reconciliation complete
```

### 2. Offline Transaction Flow
```
1. Internet disconnected
2. POS enters Offline Mode
3. Transactions stored locally (IndexedDB)
4. When online:
   └─> Auto-sync starts
   └─> Orders pushed to server
   └─> Stock updated
   └─> If sync fails → appears in Failed Sync Review
```

### 3. Member Registration Flow
```
1. Customer at POS
2. Kasir clicks "Daftar Member"
3. Enter customer info
4. Generate member code
5. Points start accumulating
6. Member discounts apply automatically
```

---

## 📱 Add-ons Available

| Add-on | Features |
|--------|----------|
| **DELIVERY_MARKETING** | Delivery management, Email campaigns, SMS, Push notifications |
| **BUSINESS_ANALYTICS** | Advanced reports, Financial management, Forecasting |
| **MULTI_OUTLET** | Multiple stores, Stock transfers, Inter-store reports |
| **LOYALTY_ADVANCED** | Tier-based rewards, Referral program |

---

## 🐳 Docker Services

| Container | Port | Description |
|-----------|------|-------------|
| `warungin-backend` | 3000 | Node.js API |
| `warungin-frontend` | 80 | Vue.js SPA |
| `warungin-nginx` | 80, 443 | Reverse proxy |
| `warungin-postgres` | 5432 | Database |
| `warungin-redis` | 6379 | Cache |
| `warungin-grafana` | 3001 | Monitoring UI |
| `warungin-prometheus` | 9090 | Metrics |
| `warungin-loki` | 3100 | Logs |
| `warungin-promtail` | - | Log collector |
| `warungin-alertmanager` | 9093 | Alerts |
| `warungin-cloudflared` | - | Tunnel |

---

## 📞 API Base URLs

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:3000/api` |
| Production | `https://api.warungin.com/api` |

---

**Document Version:** 1.0  
**Generated:** 2024-12-24  
**Maintained by:** Development Team
