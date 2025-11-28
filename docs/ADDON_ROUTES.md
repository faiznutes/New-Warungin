# Dokumentasi Route Addon

Dokumentasi lengkap semua route untuk setiap addon sesuai dengan deskripsi fitur.

## 1. ADD_OUTLETS - Tambah Outlet

**Deskripsi:** Tambahkan outlet/cabang tambahan untuk operasi multi-lokasi

**Routes:**
- `GET /api/outlets` - Get all outlets
- `GET /api/outlets/:id` - Get outlet by ID
- `POST /api/outlets` - Create new outlet
- `PUT /api/outlets/:id` - Update outlet
- `DELETE /api/outlets/:id` - Delete outlet

---

## 2. ADD_USERS - Tambah Pengguna

**Deskripsi:** Tambahkan user, kasir, atau supervisor tambahan dengan role preset (Admin, Kasir, Supervisor) dan log aktivitas

**Routes:**
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/audit-logs` - Get audit logs (log aktivitas)

---

## 3. ADD_PRODUCTS - Tambah Produk

**Deskripsi:** Tambahkan limit produk dengan fitur bulk import CSV/Excel dan dukungan varian produk (warna, ukuran, rasa)

**Routes:**
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/bulk-import` - **Bulk import CSV/Excel** (NEW)

---

## 4. DELIVERY_MARKETING - Delivery & Marketing

**Deskripsi:** Fitur delivery orders dan marketing campaigns lengkap dengan email templates, email analytics, email scheduler, dan customer engagement

**Routes:**

### Delivery:
- `GET /api/delivery` - Get all delivery orders
- `POST /api/delivery` - Create delivery order
- `GET /api/delivery/:id` - Get delivery by ID
- `PUT /api/delivery/:id` - Update delivery status

### Marketing:
- `GET /api/marketing/campaigns` - Get all campaigns
- `POST /api/marketing/campaigns` - Create campaign
- `GET /api/marketing/campaigns/:id` - Get campaign by ID

### Email Templates:
- `GET /api/email-templates` - Get all email templates
- `POST /api/email-templates` - Create email template
- `PUT /api/email-templates/:id` - Update email template
- `DELETE /api/email-templates/:id` - Delete email template

### Email Analytics:
- `GET /api/email-analytics/stats` - Get email statistics
- `POST /api/email-analytics/track` - Track email event

### Email Scheduler:
- `GET /api/email-scheduler` - Get scheduled campaigns
- `POST /api/email-scheduler` - Schedule email campaign
- `PUT /api/email-scheduler/:id` - Update schedule

### Customer Engagement:
- `GET /api/customer-engagement` - Get engagement metrics
- `POST /api/customer-engagement/segment` - Create customer segment

---

## 5. BUSINESS_ANALYTICS - Business Analytics & Insight

**Deskripsi:** Laporan Laba Rugi dengan Revenue, COGS, Gross Profit, Operating Expenses, dan Net Profit. Prediksi penjualan, analisis tren, dan custom report builder. Ringkasan harian transaksi dan produk terlaris.

**Routes:**
- `GET /api/analytics/predictions` - Get sales predictions
- `GET /api/analytics/top-products` - Get top selling products
- `GET /api/analytics/trends` - Get sales trends
- `POST /api/analytics/custom-report` - Create custom report
- `GET /api/finance/profit-loss` - **Profit & Loss Report** (Revenue, COGS, Gross Profit, Operating Expenses, Net Profit)
- `GET /api/quick-insight` - Get daily transaction summary

---

## 6. ADVANCED_REPORTING - Advanced Reporting

**Deskripsi:** Laporan lanjutan dengan export Excel, PDF, CSV. Custom report builder, scheduled reports, dan tanda tangan digital untuk keperluan legal.

**Routes:**
- `GET /api/advanced-reporting/templates` - Get all report templates
- `POST /api/advanced-reporting/templates` - Create custom report template
- `POST /api/advanced-reporting/generate` - Generate custom report
- `GET /api/advanced-reporting/scheduled` - Get scheduled reports
- `POST /api/advanced-reporting/scheduled` - Create scheduled report (format: PDF, EXCEL, CSV, HTML)
- `POST /api/advanced-reporting/export` - **Export report directly** (PDF/Excel/CSV) (NEW)
- `POST /api/advanced-reporting/digital-signature` - **Add digital signature** (NEW)
- `GET /api/advanced-reporting/dashboard-settings` - Get dashboard settings
- `PUT /api/advanced-reporting/dashboard-settings` - Save dashboard settings

---

## 7. FINANCIAL_MANAGEMENT - Financial Management

**Deskripsi:** Manajemen keuangan lengkap: accounting, profit & loss report, cash flow, expenses, tax calculations, financial forecasts, dan bank reconciliations

**Routes:**
- `POST /api/financial-management/cash-flow` - Record cash flow entry
- `GET /api/financial-management/cash-flow/summary` - Get cash flow summary
- `POST /api/financial-management/expenses` - Record expense
- `GET /api/financial-management/expenses/by-category` - Get expenses by category
- `POST /api/financial-management/tax/calculate` - Calculate tax
- `GET /api/financial-management/forecast` - Get financial forecast
- `POST /api/financial-management/bank-reconciliation` - Reconcile bank statement
- `GET /api/finance/profit-loss` - Profit & Loss report

---

## 8. INVENTORY_MANAGEMENT - Inventory Management

**Deskripsi:** Manajemen inventory lengkap: suppliers, purchase orders, stock transfers, stock alerts, stock valuations, dan product adjustments

**Routes:**
- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Create supplier
- `GET /api/purchase-orders` - Get all purchase orders
- `POST /api/purchase-orders` - Create purchase order
- `GET /api/stock-transfers` - Get all stock transfers
- `POST /api/stock-transfers` - Create stock transfer
- `GET /api/stock-alerts` - Get stock alerts
- `POST /api/stock-alerts` - Create stock alert
- `GET /api/products/adjustments` - Get product adjustments
- `POST /api/products/adjustments` - Create product adjustment

---

## 9. AI_ML_FEATURES - AI/ML Features

**Deskripsi:** Fitur AI dan Machine Learning: prediksi penjualan, rekomendasi produk, analisis tren otomatis, dan insights berbasis AI

**Routes:**
- `GET /api/ai-ml/forecast-sales` - Get sales forecast
- `GET /api/ai-ml/recommendations` - Get product recommendations
- `GET /api/ai-ml/customer-segments` - Get customer segments
- `GET /api/ai-ml/trend-analysis` - Get automatic trend analysis
- `GET /api/ai-ml/insights` - Get AI-based insights

---

## 10. RECEIPT_EDITOR - Advanced Receipt Editor

**Deskripsi:** Kustomisasi tampilan nota: nama toko, pesan promo, logo. Preview real-time sebelum cetak untuk memastikan hasil. Edit header, footer, dan layout struk sesuai brand.

**Routes:**
- `GET /api/receipts/templates` - Get all receipt templates
- `GET /api/receipts/templates/default` - Get default template
- `GET /api/receipts/templates/:id` - Get template by ID
- `POST /api/receipts/templates` - Create receipt template (with addon check)
- `PUT /api/receipts/templates/:id` - Update receipt template (with addon check)
- `DELETE /api/receipts/templates/:id` - Delete receipt template
- `POST /api/receipts/preview` - Preview receipt before print

---

## 11. MULTI_OUTLET_ADVANCED - Multi-Outlet Advanced

**Deskripsi:** Fitur multi-outlet lanjutan: manajemen stok antar outlet, transfer otomatis, laporan per outlet, dan sinkronisasi real-time

**Routes:**
- `GET /api/outlets` - Get all outlets
- `GET /api/outlets/:id` - Get outlet by ID
- `POST /api/outlets` - Create outlet
- `PUT /api/outlets/:id` - Update outlet
- `DELETE /api/outlets/:id` - Delete outlet
- `GET /api/outlets/:id/reports` - **Get reports for specific outlet** (NEW)
- `POST /api/outlets/auto-transfer` - **Setup automatic stock transfer** (NEW)
- `POST /api/outlets/sync` - **Sync stock across all outlets** (NEW)

---

## Catatan Penting

1. **Addon Guard:** Semua route yang memerlukan addon sudah dilindungi dengan middleware `check[AddonName]Addon` atau pengecekan manual di dalam route handler.

2. **Format Export:** 
   - Advanced Reporting mendukung export dalam format: PDF, EXCEL, CSV, HTML
   - Export langsung tersedia via `/api/advanced-reporting/export`

3. **Bulk Import:**
   - ADD_PRODUCTS addon diperlukan untuk bulk import
   - Format yang didukung: CSV, Excel
   - Mendukung varian produk (warna, ukuran, rasa)

4. **Digital Signature:**
   - Tersedia untuk Advanced Reporting
   - Posisi: HEADER atau FOOTER
   - Format: Base64 encoded image

5. **Multi-Outlet Advanced:**
   - Transfer otomatis berdasarkan threshold stock
   - Sinkronisasi real-time antar outlet
   - Laporan per outlet dengan filter tanggal

---

## Status Implementasi

✅ Semua route sudah terimplementasi dan siap digunakan
✅ Addon guards sudah diterapkan
✅ Dokumentasi Swagger sudah tersedia untuk semua route
✅ Error handling sudah lengkap

