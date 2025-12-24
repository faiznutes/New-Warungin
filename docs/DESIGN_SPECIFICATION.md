# 🎨 Warungin SaaS POS - Design Specification & Page Details

**Target Aesthetic:** Premium, Professional, Modern.
**Dominant Theme:** **Silver & Blue** (Glassmorphism, clean gradients, metallic accents).
**Core Concept:** **Role-Based Visual Identity** - The UI accents change based on the logged-in user's role to prevent confusion and enhance usability.

---

## 🎨 1. Design System & Color Palette

### 🔷 Base Theme (Global)
*   **Backgrounds:** Light Silver/Grey Gradients (`#F8F9FA` to `#E9ECEF`), subtle mesh gradients.
*   **Cards/Panels:** White with slight transparency (Glassmorphism), border-radius `12px` or `16px`, soft shadows.
*   **Typography:** Modern Sans-Serif (Inter/Roboto). Dark Grey (`#212529`) for headings, Slate Grey (`#6C757D`) for body text.
*   **Silver Accents:** Metallic gradients on borders or headers to give a "Premium" feel.

### 🎭 Role-Based Dominant Colors (Accents)
Every page should inherit its primary accent color from the user's role.

| Role | Primary Color | Aesthetic/Vibe | Used For |
|------|--------------|----------------|----------|
| **ADMIN (Tenant)** | **🔵 Royal Blue** (`#0056b3`) | Professional, Trust, Stability | Sidebar, Primary Buttons, Active States |
| **CASHIER** | **🟢 Emerald Green** (`#10b981`) | Fast, Money, Success | Pay Buttons, Total Amount, Positive Actions |
| **KITCHEN** | **🟠 Burnt Orange** (`#f97316`) | Urgency, Heat, Food | Order Cards, Timers, Alerts |
| **SUPERVISOR** | **💠 Teal/Cyan** (`#06b6d4`) | Analysis, Oversight, Calm | Reports Charts, Data Highlights |
| **SUPER ADMIN** | **🟣 Deep Purple** (`#7c3aed`) | Power, System, Global | System Settings, Master Data |

---

## 📄 2. Detailed Page Specifications

### 🌐 Public Website (Marketing)

#### 0. Home Page (`/`)
*   **Theme:** **Silver & Blue Gradient** (Modern SaaS).
*   **Sections:** Hero (Value Prop), Features Grid, Testimonials, CTA.
*   **Nav:** Sticky glassmorphism header.
*   **Features:**
    *   Responsive Landing Page.
    *   Feature Highlights with animation.
    *   Testimonial Carousel.
    *   Direct "Free Trial" signup links.

#### 0.1 Pricing Page (`/pricing`)
*   **Layout:** 3-Column Pricing Table.
*   **Highlight:** "Recommended" plan with distinct shadow/border.
*   **Elements:** Plan comparison checklist, FAQ section.
*   **Features:**
    *   Monthly/Yearly toggle.
    *   Detailed Feature Comparison Table.
    *   FAQ Accordion.

#### 0.2 Other Public Pages
*   **Demo Request (`/demo`):** Lead generation form.
*   **Contact (`/contact`):** Contact form + Location info.
*   **Help Center (`/help`):** Searchable FAQ/Knowledge Base.
*   **Terms (`/terms`):** Text-heavy legal document.

---

### 🔐 Authentication Module

#### A. Login Page (`/login`)
*   **Role:** Neutral / Public.
*   **Theme:** **Silver & Blue** (Modern SaaS look).
*   **Layout:** Split screen. Left: High-quality illustration/branding with Silver-Blue gradient. Right: Clean Login Form.
*   **Key Elements:**
    *   **Logo:** Centered, prominent.
    *   **Inputs:** Floating labels, soft borders.
    *   **Button:** Full-width gradient blue button.
    *   **Store Selector:** (If applicable) Dropdown with glass effect.
*   **Features:**
    *   Email/Password Authentication.
    *   Password Visibility Toggle.
    *   Forgot Password flow.
    *   Tenant/Store Selection (if user belongs to multiple).
*   **Animation:** Form slides in from right.

---

### 🖥️ Dashboard Module

#### B. Main Dashboard (`/app/dashboard`)
*   **Adaptive View:** Content changes based on user role.
*   **1. Admin Tenant (🔵 Blue):**
    *   **Header:** Welcome & Date Range Picker.
    *   **Widgets:** Subscription Status, Net Revenue, Growth Charts, Top Products.
    *   **Features:** Real-time financial overview, low stock alerts, subscription management shortcut.
*   **2. Cashier (🟢 Green/Orange):**
    *   **Header:** "Selamat Datang, Kasir!".
    *   **Widgets:** Today's Transactions, Cash In Hand.
    *   **Quick Actions:** Open POS, Cash Shift.
    *   **Features:** Shortcut to New Order, Shift Summary view, recent transaction quick access.
*   **3. Kitchen (🔴 Red):**
    *   **Header:** "Selamat Datang, Kitchen!".
    *   **Widgets:** Pending Orders, Cooking Status, Ready to Serve.
    *   **Quick Action:** Go to Kitchen Display.
    *   **Features:** Overview of kitchen load, urgent order count.
*   **Design Note:** Use the specific Role Color for the dashboard background accents/gradients.

#### C. Super Admin Dashboard (`/app/super-dashboard`)
*   **Role:** **🟣 SUPER ADMIN**
*   **Theme:** Silver & **Purple**.
*   **Key Widgets:**
    *   **Tenant Counter:** Big number cards.
    *   **System Health:** Circular progress bars (CPU, RAM).
    *   **Revenue Map:** Global subscription stats.
*   **Features:**
    *   Monitor total active tenants.
    *   View system resource usage (real-time).
    *   Track MRR (Monthly Recurring Revenue).
*   **Design Note:** More data-dense than tenant dashboard. Use Purple accents.

---

### 🛒 Point of Sale (POS) Module

#### D. POS Main Interface (`/app/pos`)
*   **Role:** **🟢 CASHIER**
*   **Theme:** Silver & **Green** (Optimized for eyes/speed).
*   **Layout:** Three columns (Category Sidebar | Product Grid | Cart Panel).
*   **1. Category Sidebar (Left):**
    *   Icons for Food, Drink, Snack.
    *   Active category gets **Green** highlight/border.
*   **2. Product Grid (Center):**
    *   **Cards:** Product Image, bold Name, Price.
    *   **Hover:** slight lift effect, shadow increases.
    *   **Action:** Click adds to cart with subtle animation.
*   **3. Cart Panel (Right):**
    *   **Look:** White background, anchored to right.
    *   **Items List:** Compact rows (Qty, Name, Price, Delete Icon).
    *   **Summary Section:** Subtotal, Tax, Discount (Accordion).
    *   **PAY BUTTON:** **Massive Green Gradient Button**. Fixed at bottom. Text: "Total: Rp XX.XXX".
*   **Features:**
    *   **Barcode Scanning** support.
    *   **Hold Order** (Park) and Retrieve.
    *   **Custom Note** per item.
    *   **Discount** application (Item or Total).
    *   **Customer Selection** (Member points).
    *   **Split Bill** capability.
*   **Modals:** Payment Success Modal with "Print Receipt" (Big icon).

#### E. Failed Sync Review (`/app/pos/failed-syncs`)
*   **Role:** **🟢 CASHIER** / Admin.
*   **Theme:** Silver & **Amber/Red** (Attention needed).
*   **Layout:** List view of failed transactions.
*   **Elements:**
    *   **Status Badge:** "Failed" (Red).
    *   **Retry Button:** Prominent.
    *   **Error Detail:** Collapsible text area.
*   **Features:**
    *   Offline data persistence check.
    *   Manual retry trigger.
    *   Bulk sync option.

---

### 📦 Kitchen Display System (KDS)

#### F. Kitchen Orders (`/app/orders/kitchen`)
*   **Role:** **🟠 KITCHEN**
*   **Theme:** Dark Mode or High Contrast Silver & **Orange**.
*   **Layout:** Kanban/Grid board.
*   **Order Card:**
    *   **Header:** Table # / Order # (Bold, Orange background).
    *   **Timer:** Counting up (Green < 10m, Orange < 20m, Red > 20m).
    *   **Items:** Checkbox list. Large text for readability from distance.
    *   **Action:** "Done/Serve" button (Big).
*   **Features:**
    *   Real-time order arrival (Socket.io).
    *   Item-level completion toggle.
    *   "Cook Time" tracking.
    *   Sound notification on new order.
*   **Design Note:** Must be readable on tablets/screens in a smoky/busy kitchen.

---

### 📊 Reports & Analytics

#### G. Sales Reports (`/app/reports`)
*   **Role:** **💠 SUPERVISOR** / Admin.
*   **Theme:** Silver & **Teal**.
*   **Layout:** Filter Bar (Top) + Charts + Data Table.
*   **Components:**
    *   **Date Picker:** Range selector.
    *   **Charts:** Bar/Pie charts using **Teal/Cyan** palette.
    *   **Table:** Striped rows, dense data.
    *   **Export:** Buttons with icon (PDF/Excel) top right.
*   **Features:**
    *   Revenue vs Profit analysis.
    *   Best Selling Products ranking.
    *   Payment Method breakdown.
    *   Export to PDF/Excel/CSV.
    *   Comparisons (This Month vs Last Month).

---

### 📦 Industry/Product Management

#### H. Product List (`/app/products`)
*   **Role:** **🔵 ADMIN TENANT**
*   **Theme:** Silver & **Blue**.
*   **Components:**
    *   **Data Table:** Image thumbnail, Name, SKU, Category, Price, Stock, Active Toggle.
    *   **Filters:** Search bar, Category dropdown.
    *   **Add Button:** Floating Action Button (FAB) or Top Right Primary Button.
*   **Features:**
    *   Bulk upload/import via CSV.
    *   Stock monitoring with visual indicators.
    *   Variant management (Size, Color).
    *   One-click status toggle.
*   **Design Note:** Clean, table rows should have hover effect (light blue tint).

#### I. Add/Edit Product Modal/Page
*   **Layout:** Two columns.
    *   **Left:** Image Upload (Drag & Drop area), Basic Info.
    *   **Right:** Pricing, Variants, Stock, Options.
*   **Features:**
    *   Drag-and-drop Image Upload.
    *   Auto-SKU generation.
    *   Unlimited variant combinations.
    *   COGS (Cost of Goods Sold) input.
*   **Design Note:** Use distinct section headers.

---

### 👥 Customer Management

#### J. Customer List (`/app/customers`)
*   **Role:** **🔵 ADMIN TENANT** / Cashier.
*   **Components:**
    *   **Member Card:** Virtual card design showing points and tier.
    *   **Table:** Name, Phone, Points, Member Since.
*   **Features:**
    *   Member point history.
    *   Tier upgrade tracking.
    *   Export customer data.
    *   Direct WhatsApp link.

---

### ⚙️ Settings

#### K. Store Settings (`/app/settings/store`)
*   **Role:** **🔵 ADMIN TENANT**
*   **Layout:** Tabs (General, Tax, Receipt, Payment).
*   **Forms:** Clean, grouped inputs.
*   **Receipt Preview:** Live preview of receipt on the right side.
*   **Features:**
    *   Store Profile (Logo, Address).
    *   Tax & Service Charge configuration.
    *   Payment Gateway toggle (Midtrans/Xendit).
    *   Table Management setup.

---

### 📄 Receipt Templates (`/app/receipts/templates`)
*   **Role:** **🔵 ADMIN TENANT**
*   **Layout:** WYSIWYG Editor style.
*   **Left Panel:** Controls (Logo upload, Header text, Footer text).
*   **Center Panel:** The Receipt paper visualization (White shadow on grey background).
*   **Features:**
    *   Custom Header/Footer message.
    *   Show/Hide Logo toggle.
    *   Social Media links on receipt.
    *   Thermal Printer size selector (58mm/80mm).

---

### 🛒 Add-on Marketplace (`/app/addons`)
*   **Role:** **🔵 ADMIN TENANT**
*   **Layout:** Catalog / Marketplace grid.
*   **Item Card:**
    *   **Icon:** Creative illustration.
    *   **Title:** e.g., "Advanced Analytics".
    *   **Status badge:** "Active" (Blue) or "Available" (Grey).
    *   **Action:** "Install" / "Configure" button.
*   **Features:**
    *   One-click installation/activation.
    *   Trial period management.
    *   Usage limits display.
    *   Subscription integration.


---

### 🚚 Delivery & Logistics

#### L. Delivery Orders (`/app/delivery`)
*   **Role:** **🔵 ADMIN TENANT**
*   **Theme:** Silver & **Blue**.
*   **Layout:** Kanban/List.
*   **Key Elements:** Order Cards (Driver Info, Status), Map Placeholder.
*   **Features:**
    *   Driver Assignment.
    *   Delivery Status Tracking (Prepared -> Picked Up -> Delivered).
    *   Integration with 3rd Party Logistics (Grab/Gojek mock).
    *   Delivery Fee calculation.

---

### 📧 Marketing Suite

#### M. Marketing Dashboard & Campaigns (`/app/marketing`)
*   **Role:** **🔵 ADMIN TENANT**
*   **Sub-pages:**
    *   **Campaigns (`/app/marketing`):** List of active/past campaigns.
    *   **Email Templates (`/app/marketing/email-templates`):** Visual builder/gallery.
    *   **Email Analytics (`/app/marketing/email-analytics`):** Charts (Open rates, Clicks).
    *   **Email Scheduler (`/app/marketing/email-scheduler`):** Calendar view of scheduled blasts.
    *   **Customer Engagement (`/app/marketing/customer-engagement`):** Logic flows for automated engagement.
*   **Features:**
    *   Drag-and-drop Email Builder.
    *   Scheduled blasting.
    *   Customer Segmentation (Active, Dormant, New).
    *   ROI Analytics (Sales generated from campaign).

---

### 📦 Advanced Inventory

#### P. Suppliers (`/app/inventory/suppliers`)
*   **Role:** **🔵 ADMIN TENANT**
*   **Layout:** List view.

#### Q. Purchase Orders (`/app/inventory/purchase-orders`)
*   **Role:** **🔵 ADMIN TENANT**
*   **Layout:** Pipeline state (Draft -> Ordered -> Received).

#### R. Stock Management (`/app/inventory/stock-transfers`, `/stock-alerts`)
*   **Role:** **🔵 ADMIN TENANT**
*   **Stock Transfers:** Form to move stock between outlets + History.
*   **Stock Alerts:** Urgent list of low-stock items.
*   **Restock Suggestions:** AI-driven reorder recommendations.
*   **Features:**
    *   Inter-outlet stock transfer with approval flow.
    *   Low stock threshold configuration.
    *   Automated Purchase Order generation from alerts.
    *   Stock auditing/adjustment logs.

---

### 💰 Finance & Accounting

#### S. Financial Suite
*   **Role:** **🔵 ADMIN TENANT**
*   **Sub-pages:**
    *   **Overview (`/app/finance`):** Cash flow charts, Expense tracking.
    *   **Laba Rugi (`/app/profit-loss`):** P&L Statement generator.
    *   **Financial Management (`/app/finance/management`):** Budgeting & Planning tools.
*   **Features:**
    *   Automated Daily/Monthly Bookkeeping.
    *   Expense Categorization.
    *   Net Profit calculation (Revenue - COGS - Expenses).
    *   Export financial reports to Excel/PDF.

---

### 🔧 Super Admin & System

#### T. Super Admin Navigation (Sidebar)
*   **Role:** **🟣 SUPER ADMIN**
*   **Theme:** **Deep Purple** (Primary Accent).
*   **Categories & Items:**
    1.  **Main:**
        *   Dashboard (`/app/super-dashboard`)
        *   Tenant Management (`/app/tenants`)
        *   Tenant Support (`/app/tenants/support`)
        *   Addon Management (`/app/addons`)
        *   Laporan Global (`/app/reports/global`)
        *   Kelola Pesan (`/app/superadmin/contact-messages`)
        *   System Settings (`/app/settings/system`)
    2.  **Data Management:** (`Border Separated Group`)
        *   Archive Management (`/app/settings/archive`)
        *   Retention Management (`/app/settings/retention`)
        *   Backup Management (`/app/superadmin/backups`)
        *   Server Monitor (`/app/superadmin/server-monitor`)
        *   Informasi Sistem (`/app/superadmin/system-info`)
    3.  **Business Analytics:** (`Border Separated Group`)
        *   Advanced Analytics (`/app/analytics`)
        *   Keuangan (`/app/finance`)
        *   Laporan Laba Rugi (`/app/profit-loss`)

#### U. Tenants Management (`/app/tenants` & Detail)
*   **Role:** **🟣 SUPER ADMIN**
*   **Layout:** List of tenants with status badges, Subscription info, Action buttons (Login as Tenant, Suspend).

#### V. System Health & Monitor (`/app/superadmin/server-monitor`)
*   **Role:** **🟣 SUPER ADMIN**
*   **Theme:** Dark technical dashboard.
*   **Widgets:** CPU/RAM Gauges, Disk Usage, Database Connection Status, Docker Container Status.
*   **Features:**
    *   Real-time server metrics (WebSocket).
    *   Service status indicators (Redis, Postgres, API).
    *   Error log stream.
    *   Restart service triggers.

#### W. Backup & Data Management
*   **Role:** **🟣 SUPER ADMIN**
*   **Elements:** Backup history table, "Create Backup" massive button, Restore modal.
*   **Features:**
    *   One-click database backup.
    *   Scheduled backup configuration (Cron).
    *   Download backup files.
    *   System-wide Restore (with confirmation).

---

### ⚙️ Extended Settings

#### W. User Management (`/app/users`)
*   **Role:** **🔵 ADMIN TENANT**
*   **Layout:** User cards with role badges.

#### X. 2FA & Security (`/app/settings/2fa`, `/sessions`, `/password`)
*   **Role:** General.
*   **Layout:** Focused forms for security settings.

#### Y. Webhooks (`/app/settings/webhooks`)
*   **Role:** Developer/Admin.
*   **Layout:** Technical configuration forms.
*   **Features:**
    *   Register Webhook endpoints.
    *   Test/Ping Webhook events.
    *   View failed delivery logs.

---

## 📱 Mobile Responsiveness
All designs **MUST** be responsive.
*   **POS:** Collapses sidebar to bottom nav on mobile/tablet vertical.
*   **Tables:** Horizontal scroll or card view on mobile.
*   **Dashboard:** Widgets stack vertically.
