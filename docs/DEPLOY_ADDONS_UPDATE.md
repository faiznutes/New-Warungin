# Update Addons & Optimasi untuk 500 Users - Deployment Guide

## ✅ Status: Code sudah di-push ke GitHub!

## Perubahan yang Di-deploy:

### 1. Addons Update (9 Addons)
- ✅ ADD_OUTLETS - Tambah Outlet (limit addon)
- ✅ ADD_USERS - Tambah Pengguna (limit addon)
- ✅ ADD_PRODUCTS - Tambah Produk (limit addon)
- ✅ BUSINESS_ANALYTICS - Business Analytics & Insight (feature addon)
- ✅ EXPORT_REPORTS - Export Laporan (feature addon)
- ✅ RECEIPT_EDITOR - Simple Nota Editor (feature addon)
- ✅ DELIVERY_MARKETING - Delivery & Marketing (feature addon)
- ⏳ E_COMMERCE - Integrasi E-commerce (API addon - COMING SOON)
- ⏳ PAYMENT_ACCOUNTING - Integrasi Payment & Accounting (API addon - COMING SOON)

### 2. Archive & Retention - Hanya SUPER_ADMIN
- ✅ Archive routes: hanya SUPER_ADMIN, bisa archive data 2 tahun ke belakang (730 hari)
- ✅ Retention routes: hanya SUPER_ADMIN, bisa delete data 2 tahun ke belakang (730 hari)
- ✅ Menu archive/retention: hanya muncul untuk SUPER_ADMIN
- ✅ Tambahkan menu di SuperAdminLayout

### 3. Optimasi untuk 500 Users
- ✅ Database: connection pool 200 base, 500 max
- ✅ Nginx: worker_connections 4096
- ✅ Docker: resources backend (4 CPU, 4GB RAM), nginx (2 CPU, 1GB RAM)

## Deployment di SSH Server:

```bash
ssh root@192.168.1.101
cd /root/New-Warungin
git pull origin main
docker compose down
docker compose build --no-cache
docker compose up -d
docker compose ps
```

## Verifikasi Setelah Deploy:

1. **Test Addons:**
   - Login sebagai ADMIN_TENANT
   - Buka halaman Addons
   - Verify: 9 addons ditampilkan
   - Verify: API addons di akhir dengan badge "Coming Soon"
   - Verify: Button "Detail" dan "Berlangganan" working
   - Verify: Coming soon addons tidak bisa dibeli

2. **Test Archive/Retention:**
   - Login sebagai SUPER_ADMIN
   - Verify: Menu Archive & Retention muncul di SuperAdminLayout
   - Verify: Bisa archive data 2 tahun ke belakang
   - Login sebagai ADMIN_TENANT
   - Verify: Menu Archive & Retention TIDAK muncul

3. **Test Performance:**
   - Monitor database connections
   - Monitor nginx connections
   - Verify: Tidak ada connection timeout untuk 500 users
