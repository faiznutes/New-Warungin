# Warungin POS - Project Documentation

> Dokumentasi lengkap fitur, alur, halaman, dan fungsi yang sudah diterapkan di project Warungin POS.

---

## 📋 Table of Contents

1. [User Roles & Access](#user-roles--access)
2. [Public Pages](#public-pages)
3. [Authentication](#authentication)
4. [Dashboard](#dashboard)
5. [POS (Point of Sale)](#pos-point-of-sale)
6. [Kitchen Display](#kitchen-display)
7. [Cash & Shift Management](#cash--shift-management)
8. [Product Management](#product-management)
9. [Order Management](#order-management)
10. [Customer Management](#customer-management)
11. [Store Management](#store-management)
12. [Inventory Management](#inventory-management)
13. [Financial Management](#financial-management)
14. [Reports](#reports)
15. [Subscription & Addons](#subscription--addons)
16. [Rewards & Discounts](#rewards--discounts)
17. [Marketing](#marketing)
18. [Settings](#settings)
19. [Super Admin Panel](#super-admin-panel)

---

## User Roles & Access

| Role | Description | Access Level |
|------|-------------|--------------|
| `SUPER_ADMIN` | Platform owner | Full access, multi-tenant management |
| `ADMIN_TENANT` | Business owner | Manages their own business/tenant |
| `SUPERVISOR` | Store manager | Manages assigned stores, staff |
| `CASHIER` | Cashier staff | POS, basic operations |
| `KITCHEN` | Kitchen staff | Kitchen display only |

---

## Public Pages

### Home (`/`)
- Landing page marketing website
- Hero section, feature highlights, pricing CTA

### Demo (`/demo`)
- Interactive demo showcase

### Contact (`/contact`)
- Contact form for inquiries
- **Button:** `Kirim Pesan` - Submit contact form

### Pricing (`/pricing`)
- Subscription plan comparison

### Help Center (`/help`)
- Help articles and FAQ
- Category navigation
- Search functionality

### Terms (`/terms`)
- Terms of service page

---

## Authentication

### Login (`/login`)
- **Fields:** Email, Password, Remember Me checkbox
- **Buttons:**
  - `Masuk Dashboard` - Login action
  - `Forgot Password` - Navigate to password recovery
  - `Back to Home` - Return to landing page
- **Flow:**
  - SUPER_ADMIN → `/app/super-dashboard`
  - CASHIER/KITCHEN → `/open-shift`
  - Others → `/app/dashboard`

### Forgot Password (`/forgot-password`)
- Email input for password reset link

---

## Dashboard

### Main Dashboard (`/app/dashboard`)
**Access:** ADMIN_TENANT, SUPERVISOR, CASHIER, KITCHEN

**Features:**
- Sales summary cards (Today, Week, Month)
- Revenue trend chart
- Recent orders table
- Quick action buttons
- Store selector (for multi-store tenants)

**Buttons:**
- `Open POS` - Navigate to POS
- `View Reports` - Navigate to reports
- `Refresh` - Reload dashboard data

---

## POS (Point of Sale)

### Fullscreen POS (`/pos`)
**Access:** CASHIER, SUPERVISOR, SUPER_ADMIN

**Layout:** Two columns - Product grid + Cart

**Product Grid Features:**
- Category tabs for filtering
- Search box for product search
- Product cards with image, name, price
- Click to add to cart
- Quantity adjustment (+/-)
- Out of stock indicator

**Cart Features:**
- Item list with quantity, price, subtotal
- Remove item button (trash icon)
- Quantity stepper (+/- buttons)
- Cart summary (subtotal, tax, total)
- Customer selection dropdown
- Discount input field
- Notes textarea

**Buttons:**
- `Tambah Customer` - Open customer selection modal
- `Apply Discount` - Apply percentage/fixed discount
- `Clear Cart` - Empty cart
- `Process Payment` - Open payment modal
- `Hold Order` - Save order for later
- `Buka Shift` - Redirect to open shift if no active shift

**Payment Modal:**
- Payment method selection (Cash, QRIS, Card)
- Amount received input (for cash)
- Change calculation
- **Button:** `Complete Payment` - Finalize transaction
- **Button:** `Print Receipt` - Print thermal receipt

**Keyboard Shortcuts:**
- `F2` - Focus search
- `Esc` - Clear selection

---

## Kitchen Display

### Kitchen Display (`/kitchen`)
**Access:** KITCHEN, SUPERVISOR, SUPER_ADMIN

**Layout:** Full screen, card-based order queue

**Features:**
- Real-time order updates (WebSocket)
- Order cards showing items to prepare
- Color-coded status (New, Preparing, Ready)
- Order timer (time since order placed)

**Buttons per Order Card:**
- `Mulai Masak` - Mark as preparing
- `Selesai` - Mark as ready
- `Lihat Detail` - Expand order details

**Header Buttons:**
- `Logout` - Sign out from kitchen display

---

## Cash & Shift Management

### Open Shift (`/open-shift`)
**Access:** CASHIER, SUPERVISOR, SUPER_ADMIN

**Fullscreen page (no sidebar)**

**Scenario 1: Store Shift Closed**
- Message: "Shift Toko Belum Dibuka"
- Shift type dropdown (Pagi/Siang/Malam - from store config)
- **Button:** `Buka Shift Toko` - Open store shift

**Scenario 2: Cash Shift Closed**
- Form: Modal Awal (initial cash) input
- Notes textarea (optional)
- **Button:** `Buka Shift Sekarang` - Open cash shift
- **Button:** `Kembali ke Login` - Logout

**Scenario 3: Shift Active**
- Dashboard showing:
  - Modal Awal (stat card)
  - Total Penjualan (stat card)
  - Saldo Seharusnya (stat card)
- **Buttons:**
  - `Masuk ke POS` - Go to POS
  - `Tutup Shift` - Open close shift modal
  - `Dashboard` - Go to main dashboard
  - `Refresh` - Reload data

**Close Shift Modal:**
- Summary: Modal Awal, Total Penjualan, Saldo Seharusnya
- Input: Uang Fisik di Laci (physical cash)
- Difference indicator (colored: green/red/gray)
- Notes textarea
- **Buttons:**
  - `Batal` - Cancel close
  - `Tutup Shift` - Confirm close shift
- **After close:** Auto-generate PDF shift report

---

## Product Management

### Products (`/app/products`)
**Access:** ADMIN_TENANT, SUPERVISOR, CASHIER (with permission), SUPER_ADMIN

**Features:**
- Product list with search & filters
- Category filter tabs
- Grid/List view toggle
- Stock quantity display
- Low stock warning

**Buttons:**
- `+ Tambah Produk` - Open add product modal
- `Import` - Bulk import from Excel
- `Export` - Export to Excel
- Per product:
  - `Edit` - Open edit modal
  - `Delete` - Delete confirmation
  - `Adjust Stock` - Stock adjustment modal

**Add/Edit Product Modal:**
- Name, SKU, Category, Price, Cost fields
- Description textarea
- Image upload
- Stock quantity
- Active/Inactive toggle
- **Buttons:** `Simpan`, `Batal`

### Product Adjustments (`/app/products/adjustments`)
**Access:** ADMIN_TENANT, SUPER_ADMIN

- Adjustment history table
- Filter by date, product, type
- **Button:** `+ New Adjustment` - Open adjustment form

---

## Order Management

### Orders (`/app/orders`)
**Access:** ADMIN_TENANT, SUPERVISOR, CASHIER, KITCHEN, SUPER_ADMIN

**Features:**
- Orders table with pagination
- Status filter tabs (All, Pending, Completed, Cancelled)
- Date range filter
- Search by order number

**Per order buttons:**
- `View` - Open order detail modal
- `Print` - Print receipt
- `Edit` (if pending) - Modify order
- `Cancel` (if pending) - Cancel order

**Order Detail Modal:**
- Customer info
- Order items list
- Payment info
- Timeline/status history

---

## Customer Management

### Customers (`/app/customers`)
**Access:** ADMIN_TENANT, SUPERVISOR, CASHIER (with permission), SUPER_ADMIN

**Features:**
- Customer list with search
- Points/reward balance display
- Order history per customer

**Buttons:**
- `+ Tambah Customer` - Add customer modal
- Per customer:
  - `Edit` - Edit customer info
  - `View History` - Order history
  - `Delete` - Remove customer

**Add/Edit Customer Modal:**
- Name, Phone, Email fields
- Address textarea
- Notes field
- **Buttons:** `Simpan`, `Batal`

---

## Store Management

### Stores List (`/app/stores`)
**Access:** ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN

**Features:**
- Store cards with basic info
- Status indicator (Active/Inactive)

**Buttons:**
- `+ Add Store` - Create new store
- Per store card:
  - Click title → Store Detail
  - `Edit` → Edit Store page
  - `Delete` → Delete confirmation

### Store Detail (`/app/stores/:id`)
**Access:** ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN

**Sections:**
- General Information (name, address, phone)
- Operating Hours (per day)
- Shift Configuration (custom shifts)
- Stats (total shifts, etc.)

**Buttons:**
- `Edit Profile` → Edit Store page
- `View as User`

### Edit Store (`/app/stores/:id/edit`)
**Access:** ADMIN_TENANT, SUPER_ADMIN

**Form Sections:**
- Basic Info (Name, Phone)
- Location (Address)
- Operating Hours (per day: open checkbox, time inputs)
- Status toggle (Active/Inactive)

**Buttons:**
- `Save Changes` - Submit form
- `Cancel` - Return to detail

---

## Inventory Management

### Suppliers (`/app/inventory/suppliers`)
- Supplier list with contact info
- **Buttons:** Add, Edit, Delete supplier

### Purchase Orders (`/app/inventory/purchase-orders`)
- PO list with status
- **Buttons:** Create PO, View, Mark Received

### Stock Alerts (`/app/inventory/stock-alerts`)
- Low stock product alerts
- Reorder threshold settings

### Restock Suggestions (`/app/inventory/restock-suggestions`)
- AI-suggested restock quantities
- **Button:** Create PO from suggestion

### Stock Transfers (`/app/inventory/stock-transfers`)
- Transfer stock between stores
- **Buttons:** Create Transfer, Approve, Reject

---

## Financial Management

### Finance Dashboard (`/app/finance`)
**Access:** ADMIN_TENANT, SUPER_ADMIN (requires BUSINESS_ANALYTICS addon)

- Revenue/expense summary
- Cash flow charts
- Account balances

### Transactions (`/app/finance/transactions`)
- Transaction history
- Filter by type, date

### Profit & Loss (`/app/profit-loss`)
- P&L report
- Period selection
- **Button:** Export PDF

### Financial Management (`/app/finance/management`)
- Budget planning
- Expense categories

---

## Reports

### Reports Dashboard (`/app/reports`)
**Access:** ADMIN_TENANT, SUPERVISOR, CASHIER (with permission), SUPER_ADMIN

- Sales report
- Product performance
- Date range selector
- **Button:** Export to Excel/PDF

### Store Reports (`/app/reports/stores`)
- Per-store performance comparison

### Advanced Reporting (`/app/reports/advanced`)
**Requires:** BUSINESS_ANALYTICS addon
- Custom report builder
- Advanced filters
- Scheduled reports

### Global Reports (`/app/reports/global`)
**Access:** SUPER_ADMIN only
- Cross-tenant analytics
- Platform-wide metrics

---

## Subscription & Addons

### Subscription (`/app/subscription`)
**Access:** ADMIN_TENANT, SUPER_ADMIN

- Current plan display
- Days remaining countdown
- Plan features list
- **Buttons:**
  - `Upgrade Plan`
  - `Extend Subscription`
  - `View Payment History`

### Addons (`/app/addons`)
- Available addons list
- Active addons
- **Buttons:** Purchase, Activate, Deactivate

---

## Rewards & Discounts

### Rewards (`/app/rewards`)
**Access:** ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN

- Points balance management
- Reward catalog
- **Buttons:**
  - `+ Add Reward`
  - `Add Points` to customer
  - `Redeem` reward

### Reward View (`/app/reward-view`)
- Customer-facing reward catalog

### Discounts (`/app/discounts`)
**Access:** ADMIN_TENANT, SUPER_ADMIN

- Discount rules list
- Coupon codes
- **Buttons:**
  - `+ Create Discount`
  - `Edit` / `Delete` / `Toggle Active`

---

## Marketing

**Requires:** DELIVERY_MARKETING addon

### Marketing Campaigns (`/app/marketing`)
- Campaign list
- **Buttons:** Create, Edit, Send, Analytics

### Email Templates (`/app/marketing/email-templates`)
- Template editor
- Drag-drop builder

### Email Scheduler (`/app/marketing/email-scheduler`)
- Schedule campaigns
- Automation triggers

### Email Analytics (`/app/marketing/email-analytics`)
- Open rates, click rates
- Delivery metrics

### Customer Engagement (`/app/marketing/customer-engagement`)
- Engagement scoring
- Segmentation tools

### Delivery Orders (`/app/delivery`)
- Delivery order management
- Driver assignment
- Tracking status

---

## Settings

### Store Settings (`/app/settings/store`)
- Store profile configuration
- Receipt customization

### Password Settings (`/app/settings/password`)
- Change password form
- **Button:** `Update Password`

### Two-Factor Auth (`/app/settings/2fa`)
- Enable/disable 2FA
- QR code for authenticator

### Sessions (`/app/settings/sessions`)
- Active sessions list
- **Button:** `Terminate` session

### Webhooks (`/app/settings/webhooks`)
- Webhook endpoints
- Event subscriptions

### Webhook Tester (`/app/settings/webhooks/tester`)
- Test webhook delivery

### GDPR Settings (`/app/settings/gdpr`)
- Data privacy settings
- Export personal data
- Delete account request

### Receipt Templates (`/app/receipts/templates`)
- Receipt layout customization
- Logo upload
- Footer text

### Subscription Plans (`/app/settings/subscription`)
- Plan management

---

## Super Admin Panel

**Access:** SUPER_ADMIN only

### Super Dashboard (`/app/super-dashboard`)
- Platform-wide stats
- Active tenants count
- Revenue overview
- System health

### Tenants (`/app/tenants`)
- All tenants list
- **Buttons:**
  - `+ Add Tenant`
  - `View Detail`
  - `Activate/Deactivate`

### Tenant Detail (`/app/tenants/:id`)
- Tenant information
- Subscription status countdown
- User list
- Store list
- **Buttons:**
  - `Upgrade Plan`
  - `Extend Subscription`
  - `Add Balance`
  - `Edit Tenant`

### Contact Messages (`/app/superadmin/contact-messages`)
- Received contact form submissions
- Reply/archive messages

### Server Monitor (`/app/superadmin/server-monitor`)
- Server metrics
- CPU, Memory, Disk usage

### System Info (`/app/superadmin/system-info`)
- System configuration
- Version info

### Backup Management (`/app/superadmin/backups`)
- Database backup list
- **Button:** `Create Backup`, `Restore`

### Archive Management (`/app/settings/archive`)
- Archived data management

### Retention Management (`/app/settings/retention`)
- Data retention policies

### System Settings (`/app/settings/system`)
- Platform-wide settings

---

## Error Pages

### Unauthorized (`/unauthorized`)
- Access denied message
- **Button:** `Back to Dashboard`

### Not Found (`/*`)
- 404 page
- **Button:** `Go Home`

---

## API Integration

All frontend pages interact with backend via `/api` endpoints:
- JWT-based authentication
- Automatic token refresh
- CSRF protection for mutations
- Tenant isolation via tenantId param
- Store filtering via outletId param

---

*Last updated: 2025-12-28*
