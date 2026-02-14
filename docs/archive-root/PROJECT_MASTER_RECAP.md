# WARUNGIN - PROJECT MASTER RECAP
*Dokumentasi Teknis & Bisnis Lengkap Sistem POS Multi-Tenant*

**Status:** Production Ready (v1.1.0) | Last Updated: February 2026

---

## 1. PROJECT OVERVIEW

### Identitas Project
- **Nama:** Warungin POS System
- **Versi:** 1.1.0
- **Tipe:** Multi-Tenant SaaS Platform
- **Target User:** Pemilik UMKM (Warung, Toko, Restoran, Kafe)
- **Lisensi:** MIT

### Tujuan Sistem
Warungin adalah sistem Point of Sale (POS) berbasis web yang dirancang untuk membantu Usaha Mikro, Kecil, dan Menengah (UMKM) mengelola:
- Transaksi penjualan real-time
- Manajemen inventori & stok produk
- Shift management & cash control
- Laporan penjualan & analytics
- Multi-outlet & multi-user access
- Offline → Online synchronization
- Subscription & add-on management

### Masalah yang Diselesaikan
1. **Efisiensi Operasional:** Automation checkout dan inventory tracking
2. **Transparansi Keuangan:** Real-time reporting & audit logs
3. **Scalability:** Mendukung multi-outlet tanpa maintenance rumit
4. **Aksesibilitas:** Web-based + mobile-ready (PWA/Capacitor)
5. **Reliability:** Offline mode untuk area dengan konektivitas lemah
6. **Security:** Multi-tenant isolation, role-based access, 2FA support

### Model Bisnis
- **Subscription Plans:** BASIC, PRO, ENTERPRISE
- **Add-ons:** Extra users, products, outlets, E-commerce, dst
- **Revenue:** Recurring subscriptions + one-time add-on purchases
- **Payment Gateway:** Integrated dengan Midtrans untuk payment processing

---

## 2. TECHNOLOGY STACK

### Backend Stack

| Komponen | Framework/Library | Versi | Fungsi | Status |
|----------|------------------|-------|--------|--------|
| **Runtime** | Node.js | 18-LTS | Menjalankan aplikasi backend | Aktif |
| **Language** | TypeScript | 5.3.3 | Type-safe backend code | Aktif |
| **Framework** | Express.js | 4.18.2 | HTTP server & routing | Aktif |
| **Database** | PostgreSQL | 15 | Primary relational database | Aktif |
| **ORM** | Prisma | 6.19.0 | Database abstraction & migrations | Aktif |
| **Cache** | Redis | 7 | Session cache & queue storage | Aktif |
| **Message Queue** | BullMQ | 5.0.0 | Background job processing | Aktif |
| **Authentication** | JWT (jsonwebtoken) | 9.0.2 | Token-based auth | Aktif |
| **2FA/OTP** | OTPLib | 12.0.1 | TOTP & backup codes | Aktif |
| **PDF Generation** | PDFKit + PDFMake | 0.17.2 + 0.2.20 | Receipt & report PDF | Aktif |
| **QR Code** | QRCode.js | 1.5.4 | Payment QR code generation | Aktif |
| **Image Processing** | Sharp | 0.33.0 | Product image optimization | Aktif |
| **Real-time** | Socket.io | 4.8.1 | WebSocket untuk live updates | Aktif |
| **Email** | Nodemailer | 6.9.7 | Transactional email service | Aktif |
| **Payment** | Midtrans Client | 1.4.3 | Payment gateway integration | Aktif |
| **Security** | Helmet | 7.1.0 | HTTP security headers | Aktif |
| **CSRF** | CSRF (csrf) | 3.1.0 | CSRF token generation & validation | Aktif |
| **XSS Protection** | DOMPurify | 3.3.0 | HTML sanitization | Aktif |
| **Password Hash** | bcryptjs | 2.4.3 | Secure password hashing | Aktif |
| **Validation** | express-validator + Zod | 7.0.1 + 3.22.4 | Input validation & sanitization | Aktif |
| **Rate Limiting** | express-rate-limit | 7.5.1 | DDoS protection | Aktif |
| **Compression** | compression | 1.7.4 | Gzip response compression | Aktif |
| **Monitoring** | prom-client | 15.1.0 | Prometheus metrics | Aktif |
| **Logging** | Winston | 3.11.0 | Structured logging | Aktif |
| **API Documentation** | Swagger (swagger-jsdoc + swagger-ui) | 6.2.8 + 5.0.0 | OpenAPI documentation | Aktif |
| **Testing** | Vitest | 1.0.0 | Unit & integration tests | Aktif |
| **Linting** | ESLint | 8.56.0 | Code quality | Aktif |
| **Formatting** | Prettier | 3.1.1 | Code formatting | Aktif |

### Frontend Stack

| Komponen | Framework/Library | Versi | Fungsi | Status |
|----------|------------------|-------|--------|--------|
| **Framework** | Vue.js | 3.3.4 | Progressive UI framework | Aktif |
| **Build Tool** | Vite | 6.4.1 | Next-gen build tooling | Aktif |
| **Router** | Vue Router | 4.2.5 | SPA routing | Aktif |
| **State Management** | Pinia | 2.1.7 | Vue state management | Aktif |
| **Styling** | Tailwind CSS | 3.4.0 | Utility-first CSS framework | Aktif |
| **UI Components** | Headless UI + Heroicons | 1.7.17 + 2.1.1 | Unstyled components + icons | Aktif |
| **HTTP Client** | Axios | 1.6.2 | HTTP request library | Aktif |
| **Real-time** | Socket.io Client | 4.7.2 | WebSocket client | Aktif |
| **Charts** | Chart.js + Vue ChartJS | 4.4.0 + 5.2.0 | Data visualization | Aktif |
| **Date Handling** | date-fns | 3.0.6 | Date manipulation | Aktif |
| **PDF Export** | jsPDF + html2canvas | 3.0.3 + 1.4.1 | Report PDF generation | Aktif |
| **Image Cropping** | CropperJS | 2.1.0 | Product image editor | Aktif |
| **Markdown** | Marked | 17.0.1 | Markdown parsing | Aktif |
| **XSS Protection** | DOMPurify | 3.3.0 | HTML sanitization | Aktif |
| **Composables** | VueUse | 10.7.0 | Utility composables | Aktif |
| **PWA** | vite-plugin-pwa | 1.2.0 | Progressive Web App support | Aktif |
| **Type Checking** | TypeScript + Vue TSC | 5.3.3 + 2.0.0 | Full type safety | Aktif |
| **Testing** | Cypress | 15.8.1 | E2E testing | Aktif |
| **Linting** | ESLint + Prettier | 9.39.2 + 3.1.1 | Code quality | Aktif |

### Infrastructure & DevOps

| Komponen | Tool/Service | Fungsi | Status |
|----------|--------------|--------|--------|
| **Containerization** | Docker | Application containerization | Aktif |
| **Orchestration** | Docker Compose (v2+) | Service orchestration | Aktif |
| **Web Server** | Nginx | Reverse proxy & static serving | Aktif |
| **Tunnel** | Cloudflare Tunnel | Secure remote access | Aktif |
| **DNS** | Cloudflare | DNS management & DDOS protection | Aktif |
| **Database Storage** | PostgreSQL (200GB) | Data persistence capacity | Aktif |
| **CI/CD** | GitHub Actions | Automated deployments | Aktif |
| **Monitoring** | Prometheus + Winston | Metrics & logging | Aktif |

---

## 3. DIRECTORY STRUCTURE SUMMARY

```
warungin/
├── src/                          # Backend source code
│   ├── app.ts                   # Main Express application entry
│   ├── config/                  # Configuration files
│   │   ├── env.ts              # Environment variables
│   │   ├── database.ts          # Database connection
│   │   ├── redis.ts             # Redis connection
│   │   ├── email.ts             # Email configuration
│   │   └── swagger.ts           # API documentation
│   ├── routes/                  # API endpoints (45+ route files)
│   │   ├── auth.routes.ts       # Authentication & login
│   │   ├── order.routes.ts      # Order management
│   │   ├── product.routes.ts    # Product management
│   │   ├── user.routes.ts       # User & role management
│   │   ├── tenant.routes.ts     # Tenant management
│   │   ├── cash-shift.routes.ts # Kasir shift management
│   │   ├── store-shift.routes.ts # Store-wide shift management
│   │   ├── report.routes.ts     # Analytics & reporting
│   │   ├── subscription.routes.ts # Subscription handling
│   │   └── ... 23+ more route files
│   ├── services/                # Business logic layer (42+ service files)
│   │   ├── auth.service.ts      # Authentication logic
│   │   ├── order.service.ts     # Order processing
│   │   ├── product.service.ts   # Product management
│   │   ├── report.service.ts    # Report generation
│   │   ├── subscription.service.ts # Subscription logic
│   │   ├── cash-shift.service.ts # Cash management
│   │   ├── store-shift.service.ts # Store shift logic
│   │   └── ... 35+ more services
│   ├── middlewares/             # Express middlewares
│   │   ├── auth.ts              # JWT authentication
│   │   ├── security.ts          # Security headers
│   │   ├── errorHandler.ts      # Error handling
│   │   ├── rateLimiter.ts       # Rate limiting
│   │   └── ... more middlewares
│   ├── jobs/                    # BullMQ job handlers
│   ├── queues/                  # Queue initialization
│   ├── scheduler/               # Cron jobs & scheduled tasks
│   ├── socket/                  # WebSocket handlers
│   ├── validators/              # Input validation rules
│   ├── types/                   # TypeScript type definitions
│   ├── utils/                   # Utility functions
│   └── constants/               # Application constants
│
├── client/                       # Frontend Vue.js application
│   ├── src/
│   │   ├── App.vue              # Root Vue component
│   │   ├── views/               # Page components
│   │   ├── components/          # Reusable components
│   │   ├── layouts/             # Layout wrappers
│   │   ├── router/              # Vue Router configuration
│   │   ├── stores/              # Pinia state management
│   │   ├── api/                 # API client functions
│   │   └── ... more directories
│   └── dist/                    # Production build output
│
├── prisma/                      # Database schema & migrations
│   ├── schema.prisma            # Database model definitions (923 lines)
│   ├── migrations/              # Database migration history
│   └── prisma.config.ts         # Prisma-specific configuration
│
├── scripts/                     # Utility & setup scripts (20+)
├── tests/                       # Test suites (unit, integration, e2e)
├── config/                      # Application configuration
├── docker-compose.yml           # Multi-container orchestration
├── Dockerfile.backend           # Backend container definition
├── nginx/                       # Nginx reverse proxy config
├── observability/               # Monitoring & logging configs
└── docs/                        # Documentation files
```

---

## 4. CORE MODULES & FUNGSI

### 4.1 POS Terminal Module
**Files:** `src/services/order.service.ts`, `src/routes/order.routes.ts`
- **Fungsi:** Interface utama kasir untuk membuat order, menambah items, memilih payment method
- **Dipakai oleh:** Kasir, Supervisor
- **Ketergantungan:** Product Service, Payment Service, Store Shift Service

### 4.2 Product & Inventory Management Module  
**Files:** `src/services/product.service.ts`, `src/routes/product.routes.ts`
- **Fungsi:** CRUD produk, kategori, stok tracking, barcode/SKU management, image optimization
- **Dipakai oleh:** Admin Tenant, Supervisor, Stock Team
- **Ketergantungan:** Product Cache Service, Sharp (image processing)

### 4.3 Shift Management Module
**Files:** `src/services/store-shift.service.ts`, `src/services/cash-shift.service.ts`
- **Fungsi:** Store-wide shift (toko dibuka/ditutup) + Per-kasir cash shift (modal awal/tutup dengan cek)
- **Dipakai oleh:** Manager, Kasir
- **Ketergantungan:** Order Service, Transaction Service

### 4.4 Authentication & Authorization Module
**Files:** `src/services/auth.service.ts`, `src/routes/auth.routes.ts`
- **Fungsi:** Login/logout, JWT token generation, 2FA (TOTP), password reset, session management
- **Dipakai oleh:** Semua users
- **Ketergantungan:** Redis (sessions), Nodemailer (email reset), OTPLib (2FA)

### 4.5 Tenant & Multi-Tenant Management Module
**Files:** `src/services/tenant.service.ts`, `src/routes/tenant.routes.ts`
- **Fungsi:** Create tenant, subscription plan management, add-on purchase, feature flags per subscription
- **Dipakai oleh:** Super Admin, Tenant Admin
- **Ketergantungan:** Subscription Service, Payment Gateway

### 4.6 Analytics & Reporting Module
**Files:** `src/services/report.service.ts`, `src/routes/report.routes.ts`
- **Fungsi:** Daily/weekly/monthly sales reports, product performance, profit margins, payment breakdown, PDF export
- **Dipakai oleh:** Manager, Tenant Admin
- **Ketergantungan:** Order Service, Transaction Service, PDF Service

### 4.7 Customer & Member Management Module
**Files:** `src/services/customer.service.ts`, `src/services/member.service.ts`
- **Fungsi:** Customer database, member loyalty program (discounts, points), birthday reminders
- **Dipakai oleh:** Kasir, Manager
- **Ketergantungan:** Discount Service, Order Service

### 4.8 Payment & Transaction Management Module  
**Files:** `src/services/payment.service.ts`, `src/services/transaction.service.ts`
- **Fungsi:** Payment method handling (Cash, QRIS, Card, E-wallet), Midtrans integration, QRIS code generation, refund processing
- **Dipakai oleh:** Kasir, Manager
- **Ketergantungan:** Midtrans Client, QR Code Service, Order Service

### 4.9 Subscription & Billing Module
**Files:** `src/services/subscription.service.ts`, `src/routes/subscription.routes.ts`
- **Fungsi:** Plan subscription (BASIC, PRO, ENTERPRISE), temporary upgrade, add-on purchase, renewal scheduler
- **Dipakai oleh:** Tenant Admin, Super Admin
- **Ketergantungan:** Payment Service (Midtrans), Email Service

### 4.10 Offline Sync Module  
**Mentioned in:** Offline mode support via IndexedDB, Service Workers
- **Fungsi:** Queue orders/transactions offline, sync when online, handle concurrent operations, idempotency
- **Dipakai oleh:** Mobile PWA/Capacitor users
- **Ketergantungan:** Service Workers, Order API endpoint

### 4.11 Stock Management Module
**Files:** `src/services/stock-transfer.service.ts`, `src/services/purchase-order.service.ts`, `src/services/stock-alert.service.ts`
- **Fungsi:** Inter-outlet stock transfers, low stock alerts, supplier purchasing, stock valuation (FIFO/LIFO/Average)
- **Dipakai oleh:** Store Manager, Warehouse, Supplier Team
- **Ketergantungan:** Product Service, Email Service

### 4.12 Audit Logging Module
**Files:** `src/services/audit-log.service.ts`, `src/routes/audit-log.routes.ts`
- **Fungsi:** Track all user actions (CREATE, UPDATE, DELETE, LOGIN), store IP/user agent, security compliance
- **Dipakai oleh:** Super Admin, Compliance Officer
- **Ketergantungan:** Middleware (automatic logging)

### 4.13 Backup & Data Integrity Module
**Files:** `src/services/daily-backup.service.ts`, `src/scheduler/backup.scheduler.ts`
- **Fungsi:** Automatic daily backups, tenant-specific backups, backup encryption, download & restore, email notification
- **Dipakai oleh:** Super Admin, Tenant
- **Ketergantungan:** BullMQ (scheduled jobs), Email Service, Data Encryption Service

### 4.14 User & Role Management Module
**Files:** `src/services/user.service.ts`, `src/routes/user.routes.ts`
- **Fungsi:** Create/edit users, role assignment (SUPER_ADMIN, ADMIN_TENANT, SUPERVISOR, CASHIER, KITCHEN), permissions per role
- **Dipakai oleh:** Super Admin, Tenant Admin
- **Ketergantungan:** Auth Service, Audit Log Service

### 4.15 Mobile Support (PWA & Capacitor)
**Files:** `client/vite.config.js`, `vite-plugin-pwa` configuration
- **Fungsi:** Progressive Web App (offline access, install as app), push notifications, mobile-optimized UI, local storage for offline queue
- **Dipakai oleh:** Mobile users (smartphone/tablet)
- **Ketergantungan:** Service Workers, Capacitor plugins

---

## 5. END-TO-END FLOW

### 5.1 Installation & Setup Flow

**INFRASTRUCTURE SETUP:**
- Deploy PostgreSQL database (15-alpine)
- Deploy Redis cache (7-alpine)
- Configure environment variables (.env)
- Set up Cloudflare tunnel for remote access
- Configure DNS records

**INITIAL CONFIGURATION:**
- Run docker-compose up (start all services)
- npm run prisma:migrate (database schema)
- npm run create:super-admin (create first admin)
- Verify database connection
- Test API at /api-docs

**APPLICATION STARTUP:**
- Backend starts on port 3000
- Frontend serves on port 3001
- Redis connects for caching
- Socket.io initializes for real-time updates
- Scheduler starts background jobs
- GET /health endpoint returns 200 OK

### 5.2 User Onboarding Flow (New Tenant)

**TENANT REGISTRATION:**
- Fill form: name, email, phone, address
- System generates unique slug
- Create Tenant record
- Initialize default subscription (BASIC)
- Send welcome email

**FIRST ADMIN ACCOUNT:**
- Create Admin user (ADMIN_TENANT role)
- Set password
- Enable/disable 2FA
- Admin receives welcome email

**INITIAL SETUP (Admin):**
- Login with admin credentials
- Create outlet(s) - lokasi toko
- Define shift config (pagi, siang, sore, malam)
- Add staff members (kasir, kitchen, supervisor)
- Set role & permissions
- Configure receipt template
- Setup subscription preferences

**PRODUCT CATALOG SETUP:**
- Bulk import products OR manual add
- Set categories, prices, stock levels
- Upload product images
- Assign barcode/SKU
- Set cost & selling prices

**READY FOR OPERATIONS:**
- System ready for first transaction
- Email notification sent to tenant admin

### 5.3 Daily Operations Flow - POS Transaction

**START OF DAY (08:00 AM):**
- Manager opens store: POST /store-shift/open → Create StoreShift record
- Kasir opens shift: POST /cash-shift/open → Input modal awal (e.g., 500,000)
- Create CashShift record

**NORMAL OPERATIONS (08:00 AM - 05:00 PM):**
- **TRANSACTION FLOW (setiap customer):**
  1. Create Order: POST /orders → Add items → Calculate total
  2. Send to Kitchen (optional): POST /orders/{id}/send-kitchen → Broadcast via Socket.io
  3. Confirm Ready: PUT /orders/{id} → Update kitchenStatus
  4. Process Payment: POST /transactions → Select method (CASH, QRIS, CARD, E-wallet)
  5. Print Receipt: GET /receipts/{orderId} → Generate PDF
  6. Order status = COMPLETED

**REAL-TIME MONITORING:**
- Dashboard live updates via Socket.io
- Total sales, payment breakdown, order count
- Staff activity log

**OFFLINE MODE (if internet down):**
- Order & transaction queued locally (IndexedDB)
- Auto-sync when online restored

**END OF DAY (05:00 PM):**
- Kasir closes shift: POST /cash-shift/close → Input physical cash count → Detect discrepancy
- Manager closes store: POST /store-shift/close → Aggregate data → Generate EOD report
- Email summary sent to tenant admin
- Background jobs: backup scheduled, subscription renewal check, stock alerts

### 5.4 Offline → Online Sync Flow (Mobile)

**OFFLINE MODE:**
- User creates order (IndexedDB storage)
- Transaction queued locally
- UI shows "OFFLINE MODE" indicator
- All changes stored in browser cache

**NETWORK RESTORED:**
- Service worker detects connectivity
- SYNC SERVICE triggered:
  1. Upload queued data: POST /sync/orders (batch) → Prevent duplicate via idempotencyKey
  2. Download updates: GET /sync/updates?since=lastSyncTime
  3. Verify consistency: Check conflicts, reconcile data
  4. Backup to server: All offline data synced
  5. UI returns to normal

**READY:** Continue operations in online mode

### 5.5 Reporting & Insights Flow

**MANAGER REQUESTS REPORT:**
- Select report type: Daily Sales, Weekly Summary, Monthly P&L, Product Performance, Staff Performance, Payment Breakdown

**REPORT GENERATION:**
- Query database: orders, transactions, orderItems, staffActivity, customers
- Calculate metrics: Revenue, COGS, Gross Profit, Tax, Net Profit, Margin %
- Aggregate by dimensions: product category, outlet, payment method, staff, hour/day/week
- Format output

**PRESENTATION OPTIONS:**
- View in dashboard (interactive charts via Chart.js)
- Export as PDF (PDFKit/jsPDF)
- Export as CSV (Excel)
- Email report schedule

**INSIGHTS EXAMPLES:**
- "Product A selling 40% faster this week"
- "Kasir B faster average transaction time"
- "Morning shift generates 60% of daily revenue"
- "Payment method trends: Cash 50%, QRIS 30%, Card 20%"

### 5.6 Subscription Upgrade Flow

**TENANT WANTS TO UPGRADE (BASIC → PRO):**
1. Click "Upgrade Plan" → Show comparison → Confirm details
2. Initiate Payment: POST /subscriptions/upgrade → Create record → Send to Midtrans
3. Customer Pays: Open payment link → Scan QRIS / Card / E-wallet → Midtrans processes
4. Webhook: Midtrans → /webhooks/payment → Verify signature → Update status = ACTIVE
5. Tenant Checks: GET /subscriptions/current → View new plan, features, renewal date, usage tracking
6. Auto-Renewal: Monthly check → Auto-charge if payment on file → Extend subscription OR send retry notifications

---

## 6. DATABASE FLOW

### 6.1 Core Entity Relationships

```
TENANT (Root, multi-tenant isolation)
  ↓
USER, OUTLET, SUBSCRIPTION
  ↓
STORE SHIFT (Daily opening)
  ↓
CASH SHIFT (Kasir modal) + ORDER (Customer transaction)
  ↓
ORDER ITEM (Line items) + TRANSACTION (Payment)
  ↓
CUSTOMER/MEMBER, PRODUCT
```

### 6.2 Key Data Paths

**Order Processing Path:**
- CREATE order → Query product stock
- Add items → Verify pricing → Check member discount → Calculate total
- Payment → Create transaction → Update order status
- Auto stock reduction → Update product.stock → Log adjustment

**Shift Flow:**
- Store Open → Link to outlet
- Cashier Open → Link to store_shift
- Orders auto-link to current store_shift & cash_shift
- Store Close → Aggregate all cash shifts → Calculate net sales → Archive data

**Payment Reconciliation:**
- Transaction (in-progress) → Payment processing (CASH direct / CARD/QRIS await webhook)
- Status → COMPLETED → Auto-trigger: stock reduction, profit calc, email receipt, dashboard update

### 6.3 Database Indexes for Performance
- `orders(tenantId, status, createdAt)` - Fast report queries
- `transactions(tenantId, paymentMethod, createdAt)` - Payment breakdown
- `products(tenantId, isActive, category)` - Product listing
- `users(tenantId, email)` - User lookup
- `store_shifts(tenantId, outletId, status, shiftType)` - Shift tracking
- `cash_shifts(tenantId, kasirId, status)` - Cashier tracking

---

## 7. ROLE & ACCESS MAP

| Role | Permissions |
|------|-------------|
| **SUPER_ADMIN** | Manage all tenants, view all data, manage plans, system settings, backups, monitoring |
| **ADMIN_TENANT** | Create/edit users, manage products, create outlets, view all reports, manage settings, subscriptions |
| **SUPERVISOR** | View all orders, generate reports, open/close store shift, override minor discounts, approve stock |
| **CASHIER** | Create orders, process payments, open/close cash shift, apply member discounts, print receipt |
| **KITCHEN** | View kitchen orders, update preparation status, mark completed, print tickets |

**Feature Access by Role:**
- POS Operations: ADMIN_TENANT ✓, SUPERVISOR ✓, CASHIER ✓
- Product Management: ADMIN_TENANT ✓, SUPERVISOR ✓
- User Management: ADMIN_TENANT ✓, SUPER_ADMIN ✓
- Reports: ADMIN_TENANT ✓, SUPERVISOR ✓
- Subscriptions: ADMIN_TENANT ✓, SUPER_ADMIN ✓

---

## 8. DEPENDENCY HEALTH CHECK

**All Active Dependencies:** 100% used in production
- **Backend Core:** express, typescript, prisma, jsonwebtoken, bcryptjs ✓
- **Real-time:** socket.io, nodemailer, bullmq, ioredis ✓
- **Payment:** midtrans-client, qrcode ✓
- **Security:** helmet, csrf, dompurify, rate-limit ✓
- **Frontend:** vue, vite, pinia, tailwindcss, axios ✓
- **Development:** vitest, eslint, prettier ✓

**Unused Dependencies:** None identified

**Architecture Risks & Mitigation:**
- Redis failures → Fallback to in-memory cache + health checks
- Midtrans API changes → Version pinning + API monitoring
- PostgreSQL pool exhaustion → Connection limit config + monitoring
- BullMQ dependencies → Redis must always be active for background jobs
- Security vulnerabilities → Regular npm audit + Dependabot checks

**Configuration Status:**
- ✓ .env properly configured
- ✓ Database migrations up-to-date
- ✓ Redis connected
- ✓ Email service configured
- ✓ Socket.io ports configured
- ✓ JWT secrets set
- ✓ Rate limiting thresholds configured
- ✓ CORS origins whitelisted

---

## 9. DEPLOYMENT FLOW

### 9.1 Development Setup
```bash
npm install && cd client && npm install && cd ..
cp env.example .env # Edit .env with local values
npm run prisma:migrate
npm run create:super-admin
npm run dev # Backend (Terminal 1)
cd client && npm run dev # Frontend (Terminal 2)
```

### 9.2 Build Process
```bash
npm run build # TypeScript compilation
npm run type-check # Full type checking
npm test # Run tests
cd client && npm run build # Frontend bundle
```

### 9.3 Docker Deployment
```bash
docker-compose up -d # Start all services
npm run prisma:migrate
npm run create:super-admin:docker
```

### 9.4 Production (via Cloudflare Tunnel)
- Deploy on VPS (Linux server)
- Install Docker & Docker Compose
- Clone repository
- Setup .env for production
- docker-compose -f docker-compose.yml up -d
- npm run prisma:migrate
- cloudflared tunnel create warungin
- Configure routing to backend:3000, frontend:3001
- Update DNS CNAME
- Health checks: curl https://api.warungin.com/health

### 9.5 Database Migration Strategy
```bash
npm run prisma:migrate:safe # Backup before migration
prisma migrate dev --name migration_name # Create migration
npm run test:integration # Test in staging
prisma migrate deploy # Apply in production
npm run check:db # Verify
```

### 9.6 CI/CD Pipeline (GitHub Actions)
- Run tests
- Build Docker images
- Push to registry
- Deploy to production server
- Run migrations
- Health check
- Slack notification

---

## 10. KNOWN LIMITATIONS

### 10.1 Offline Mode Limitations
- **Issue:** Offline inventory is local only (stock counts may differ from online)
- **Workaround:** Sync immediately upon reconnection; manager reconciles

- **Issue:** Can't access real-time pricing updates
- **Workaround:** Update prices before field ops in areas with spotty internet

- **Issue:** Member discounts may be outdated
- **Workaround:** Recommend online-only for high-value member sales

- **Issue:** Payment methods limited (cash only offline)
- **Workaround:** Record cash payment, sync payment later

### 10.2 Real-time Limitations
- **Issue:** Socket.io requires WebSocket support (some networks block)
- **Workaround:** Fallback to HTTP polling (slower)

- **Issue:** Maximum concurrent connections ~10,000 per server
- **Workaround:** Use Redis adapter + load balancing for scale

- **Issue:** Updates may lag 1-2 seconds on slow networks
- **Workaround:** Manual refresh available

### 10.3 Scalability Limitations
- **Single PostgreSQL:** Hits limit at > 10,000 concurrent users → Add read replicas
- **Single Redis:** Hits limit at > 100,000 cached items → Redis cluster/sentinel
- **Local file storage:** Hits limit at > 500GB → Move to S3/cloud storage
- **Monolithic architecture:** Multiple teams need microservices split (future)

### 10.4 Feature Limitations
- **Multi-currency:** No - Only IDR (Rupiah) supported
- **Multi-language:** No - Only Indonesian (Bahasa)
- **Accounting Integration:** Partial - Basic P&L only, no GL
- **E-commerce Integration:** No - POS-only, no online store
- **Advanced Analytics:** Basic - SQL reports only, no BI tool
- **Restaurant Features:** Basic - Simple kitchen display
- **Delivery Tracking:** Limited - Only JNE, JNT, POS
- **Point of Sale Hardware:** Limited - Thermal printer, barcode scanner only

### 10.5 Known Issues
- **Timezone handling:** UTC standardization needed
- **Large PDF generation:** Can timeout on reports > 1000 items
- **WebSocket reconnection:** Sometimes requires page refresh

### 10.6 Trade-offs & Architecture Decisions
| Decision | Trade-off | Why |
|----------|-----------|-----|
| **Monolithic Backend** | Not scalable extremely large | Simpler deploy, faster dev |
| **PostgreSQL Only** | No document storage | Relational fits POS well |
| **JWT Tokens** | No server-side session revocation | Stateless scaling |
| **Socket.io Real-time** | Requires persistent WebSocket | Better UX than polling |
| **Synchronous Orders** | No event streaming | Simpler consistency |
| **Single DB Instance** | Single point of failure | Backup strategy mitigates |

---

## CRITICAL SETUP CHECKLIST

- [ ] PostgreSQL 15 installed & running
- [ ] Redis 7 installed & running
- [ ] Node.js 18-LTS installed
- [ ] .env file created with all required variables
- [ ] DATABASE_URL configured
- [ ] REDIS_URL configured
- [ ] JWT_SECRET set to strong value
- [ ] Midtrans account setup & keys configured
- [ ] SMTP credentials configured
- [ ] File upload directory writable
- [ ] Network ports 3000, 5173 accessible (dev) / 443 (prod)
- [ ] SSL certificates configured (production)
- [ ] Docker installed (if using containers)
- [ ] Sufficient disk space: minimum 50GB
- [ ] Sufficient RAM: minimum 4GB dev, 8GB prod
- [ ] All services started successfully post-deployment
- [ ] Health check endpoint responding
- [ ] Database migrations applied
- [ ] Email service tested
- [ ] File upload tested
- [ ] Socket.io connection verified
- [ ] Cloudflare tunnel connected (production)
- [ ] Backup job scheduled & running

---

**PROJECT MASTER RECAP GENERATED – NO MORE GUESSING**
