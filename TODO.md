# 🧩 TODO – Fitur Khusus UMKM (Low-Margin, Simple, Practical)

Dokumen ini khusus berisi fitur **praktis & bernilai langsung** untuk UMKM kecil (laba 50–150 ribu/hari).
Semua fitur fokus ke: **kemudahan**, **kecepatan**, **keamanan data**, dan **tidak membebani biaya**.

---

# 🎯 1. MODE "KASIR SEDERHANA" (Simple POS Mode)

> Target: Kasir yang tidak tech-savvy — UI harus seperti kalkulator + tombol besar.

## Fitur

* [ ] Tampilan POS minimalis:

  * [ ] 3–5 kategori besar saja
  * [ ] Tombol produk ukuran besar
  * [ ] Hanya 1–2 aksi per langkah
  * [ ] Tidak ada popup panjang
  * [ ] Warna kontras tinggi (mudah terlihat)
* [ ] Mode pembayaran cepat:

  * [ ] Tunai → input angka → hitung otomatis
  * [ ] Non-tunai → single click selesai
* [ ] Quick actions:

  * [ ] Void item
  * [ ] Tambah qty
  * [ ] Diskon cepat (nilai/%)
* [ ] Auto landscape (wajib untuk tablet/HP kasir):

  * [ ] Deteksi orientation → paksa landscape
  * [ ] Pesan pop-up jika portrait
* [ ] Setting untuk toggle "Mode Sederhana" di Tenant Settings.

## Technical

* [ ] Layout baru: `/pos-simple`
* [ ] Komponen tombol besar reusable
* [ ] Gunakan local state untuk performa
* [ ] Cache produk di IndexedDB
* [ ] Disable animasi yang berat

---

# 🔋 2. OFFLINE-FIRST POS MODE

> UMKM jaringan internetnya lemah. POS harus tetap jalan tanpa internet.

## Fitur Utama

* [ ] Transaksi tetap bisa dibuat saat offline
* [ ] Stok berkurang secara lokal
* [ ] Queue transaksi lokal (IndexedDB)
* [ ] Auto-sync saat kembali online:

  * [ ] Upload transaksi tertunda
  * [ ] Reconcile stok ke server
* [ ] Notifikasi status:

  * [ ] "Anda offline — transaksi aman"
  * [ ] "Sedang sync…"
  * [ ] "Sync berhasil"
* [ ] Offline fallback untuk halaman POS:

  * [ ] Pre-cache assets
  * [ ] Pre-cache daftar produk

## Technical

* [ ] Service Worker advanced caching
* [ ] IndexedDB wrapper (Dexie.js lebih simpel)
* [ ] Sync manager (retry setiap 10 detik)
* [ ] UUID untuk transaksi offline
* [ ] Mekanisme konflik: server menang + kirim diff

---

# 📦 3. SARAN RESTOCK OTOMATIS (AUTO RESTOCK SUGGESTION)

> UMKM suka fitur ini karena membantu mereka menentukan belanja harian.

## Fitur

* [ ] Sistem membaca pola penjualan:

  * [ ] Produk yang stoknya < minimal
  * [ ] Produk paling laku mingguan
  * [ ] Rekomendasi jumlah pembelian
* [ ] Halaman Restock Suggestion:

  * [ ] List produk mendekati habis
  * [ ] Perkiraan kapan habis berdasarkan kecepatan jual
  * [ ] Saran qty beli
* [ ] Reminder otomatis (popup) ketika:

  * [ ] stok < minimal
  * [ ] stok habis
* [ ] Reminder email setiap jam 8 malam untuk pemilik

## Technical

* [ ] Endpoint `/inventory/restock-suggestions`
* [ ] Algoritma sederhana:

  * `avg_daily_sales = penjualan 14 hari / 14`
  * `days_left = stok / avg_daily_sales`
  * `jika days_left < 2 → rekomendasi beli`
* [ ] Cron job harian untuk mengirim reminder

---

# 📧 4. AUTO-BACKUP EMAIL HARIAN UNTUK PEMILIK (Tanpa API WhatsApp)

> Fitur ini *sangat bernilai* bagi UMKM karena memberi rasa aman.

## Fitur

* [ ] Generate laporan harian jam 23:59:

  * [ ] Penjualan harian
  * [ ] Kas masuk
  * [ ] Kas keluar
  * [ ] Hutang/piutang
  * [ ] Stok habis/mau habis
* [ ] Format PDF atau HTML
* [ ] Kirim otomatis ke email pemilik tenant
* [ ] Tenant bisa toggle fitur ini (on/off)

## Technical

* [ ] Buat cron job di server (node-cron atau sistem scheduler)
* [ ] Template email HTML
* [ ] PDF generator (puppeteer / pdfkit)
* [ ] Endpoint untuk preview laporan
* [ ] Setting baru: `email_backup_enabled: boolean`
* [ ] Tambahkan record log pengiriman

---

# 🏢 5. SUPER ADMIN — BACKUP STATUS PAGE

> Untuk monitoring dan troubleshooting.

## Fitur

* [ ] Halaman baru: `/superadmin/backups`
* [ ] Daftar backup harian tiap tenant:

  * [ ] Tenant name
  * [ ] Last backup date
  * [ ] Status (success/failed)
  * [ ] Jumlah email terkirim
* [ ] Bisa lihat laporan terakhir tiap tenant
* [ ] Filter berdasarkan tanggal
* [ ] Notifikasi error jika backup gagal 3 hari berturut-turut

## Technical

* [ ] Tabel database baru: `BackupLog`

  * id
  * tenantId
  * sentAt
  * status
  * size
* [ ] API endpoints: GET logs, resync, regenerate

---

# 🧮 6. PRODUK REKOMENDASI HARGA (Price Suggestion)

> UMKM sering bingung kasih harga. Bantu mereka ambil keputusan.

## Fitur

* [ ] Input HPP produk (bahan pokok)
* [ ] Sistem memberi rekomendasi:

  * [ ] Harga jual 20% margin
  * [ ] Harga jual 30% margin
  * [ ] Harga jual "ramai pasaran"
* [ ] Bisa klik "Gunakan harga ini" → update produk
* [ ] Tampilkan rekomendasi langsung di form tambah produk

## Technical

* [ ] Field baru: `hpp` (cost)
* [ ] Endpoint `/product/price-suggestion`
* [ ] Cara menentukan harga pasaran:

  * [ ] Ambil median penjualan rata-rata kategori (internal tenant)
  * [ ] Simple analytics — tidak perlu AI dulu

---

# 🚨 7. REMINDER STOK HABIS OTOMATIS (POP-UP)

> Pop-up sederhana tapi sangat berguna.

## Fitur

* [ ] Pop-up otomatis ketika masuk POS jika ada produk:

  * stok = 0
  * stok < minimal
* [ ] Tampilkan list 5 produk paling kritikal
* [ ] Tombol "Tambah Stok Cepat"
* [ ] Tombol "Abaikan Hari Ini"

## Technical

* [ ] Endpoint `/inventory/low-stock`
* [ ] Popup global component
* [ ] Local suppression (per hari)

---

# 📋 8. TESTING (WAJIB UNTUK FASE INI)

> Supaya fitur-fitur UMKM tidak gampang rusak.

* [ ] Test offline transaction sync
* [ ] Test stok update di mode offline → online
* [ ] Test popup reminder
* [ ] Test simple POS mode buttons
* [ ] Test price suggestion endpoint
* [ ] Test daily email backup cron

---

# 🔧 9. PWA OPTIMIZATION UNTUK UMKM

* [ ] Cache foto produk
* [ ] Cache layout POS Simple
* [ ] Auto landscape lock
* [ ] Splash screen custom
* [ ] Icon besar untuk akses cepat

---

# 🏬 10. MULTI-STORE SIMPLE MODE (Untuk UMKM Omzet Besar)

> Fitur untuk tenant dengan omzet 2–5 juta per hari. Tetap sederhana, tidak seperti ERP.

## Fitur Inti

* [ ] Multi store basic (maks. 3 cabang bawaan)
* [ ] Halaman "Pilih Toko" saat login super admin tenant
* [ ] Transfer stok antar store:

  * [ ] Store A → Store B
  * [ ] Store A → Store C
  * [ ] Form transfer sederhana: pilih produk + qty
  * [ ] Riwayat transfer antar cabang
* [ ] Laporan gabungan antar store:

  * [ ] Penjualan harian per store
  * [ ] Penjualan gabungan semua store
  * [ ] Stok per store
* [ ] Role khusus "Supervisor Cabang":

  * [ ] Bisa melihat stok & penjualan cabangnya saja
  * [ ] Tidak bisa edit cabang lain

## Technical

* [ ] Tambahkan table `Store` (linked ke tenant)
* [ ] Field baru `storeId` untuk produk, transaksi, stok
* [ ] Endpoint `/store/transfer`
* [ ] Mekanisme pengurangan stok cabang asal → penambahan cabang tujuan
* [ ] Validasi stok cukup saat transfer
* [ ] Laporan multi-store di endpoint `/reports/multi`

## Alur UI Sederhana

* [ ] Menu baru: **Manajemen Cabang**

  * [ ] Tambah cabang (max 3 default)
  * [ ] Edit cabang
* [ ] Menu: **Transfer Stok**
* [ ] Menu: **Laporan Cabang**

---

# 🧾 11. PAKET LANGGANAN (BASIC / PRO / MAX)

> Struktur paket sederhana yang scalable tanpa bikin sistem jadi ERP.

## 🎟️ BASIC – UMKM kecil

* [ ] 1 store
* [ ] 1 user kasir
* [ ] Simple POS Mode
* [ ] Offline-first
* [ ] Reminder stok habis
* [ ] Auto-backup email
* [ ] Price suggestion (margin 20–30%)
* [ ] Laporan harian basic
* [ ] PWA + Auto landscape
* [ ] Tanpa multi-store

## ⚡ PRO – UMKM sedang–besar

* [ ] Maksimal 3 store
* [ ] 5 user
* [ ] Semua fitur BASIC
* [ ] Multi-store sederhana
* [ ] Transfer stok antar store
* [ ] Laporan per store + gabungan
* [ ] Restock suggestion otomatis
* [ ] Supervisor cabang role
* [ ] Export laporan PDF/Excel

## 🔴 MAX – Paket untuk UMKM besar / semi enterprise

* [ ] Unlimited store
* [ ] Unlimited user
* [ ] Semua fitur PRO
* [ ] Custom fitur (dari fitur yang tersedia)
* [ ] Prioritas support
* [ ] Import massal produk & stok
* [ ] Custom laporan sederhana
* [ ] API internal terbatas

## Technical

* [ ] Table `SubscriptionPlan`
* [ ] Field baru pada tenant:

  * [ ] `plan: basic | pro | max`
  * [ ] `storeLimit`
  * [ ] `userLimit`
* [ ] Middleware limit fitur Berdasarkan paket
* [ ] Endpoint `/tenant/upgrade`
* [ ] Page baru: **Paket Langganan**
* [ ] Halaman upgrade/downgrade tenant
* [ ] Banner pengingat jika limit tercapai

---

# 🧩 12. ADDONS SYSTEM (Untuk Tenant Tanpa Langganan & Tenant Pro/Max)

> Addons = fitur tambahan berbayar satuan. Cocok untuk tenant yang tidak ingin langganan paket.

## Fitur Addons Utama (Hanya yang bernilai & tidak bikin sistem berat)

* [ ] Addon: **Export Laporan (PDF/Excel)**
* [ ] Addon: **Restock Suggestion** (jika tidak langganan PRO)
* [ ] Addon: **Transfer Stok Antar Store** (jika tenant punya >1 store manual)
* [ ] Addon: **Supervisor Role**
* [ ] Addon: **Price Recommendation Plus** (margin custom)
* [ ] Addon: **Import Massal** (produk, stok, pelanggan)

> Addons ini adalah versi modular dari fitur PRO/MAX tanpa perlu paket penuh.

---

## Checklist Cek Route & Error Prevention

* [ ] Validasi semua route addons:

  * [ ] `/addons/list`
  * [ ] `/addons/activate`
  * [ ] `/addons/deactivate`
  * [ ] `/addons/status`
* [ ] Middleware addons-permission:

  * [ ] Jika route butuh addon → cek tenant aktif
  * [ ] Jika tidak aktif → return error simple + CTA beli addon
* [ ] Audit 404 route untuk addons lama yang dihapus
* [ ] Hapus route addons yang sudah dipangkas sebelumnya
* [ ] Pastikan semua komponen yang memanggil addon memiliki guard:

  * [ ] UI tampil → hanya jika addon aktif
  * [ ] Button disable → jika addon tidak aktif

---

## Tambah ke TODO: Sistem Pengelolaan Addons

* [ ] Table `Addon` (nama, slug, deskripsi, harga)
* [ ] Table `TenantAddon` (tenantId, addonId, activeAt, expiredAt)
* [ ] Backend logic aktivasi addon
* [ ] Expired addons checker (cron job harian)
* [ ] Page di tenant settings:

  * [ ] "Marketplace Addons"
  * [ ] Tombol aktifkan → pembayaran manual di awal
* [ ] Notifikasi jika addon mendekati masa habis (3 hari sebelumnya)

---

## Addons Lama yang Sudah Dipangkas (DIPASTIKAN TERHAPUS)

*(Ini sudah tidak dimasukkan agar project kamu tidak kacau)*

* ❌ AI Analytics Addon
* ❌ Integrasi marketplace eksternal
* ❌ FCM Notifications
* ❌ Automasi Webhooks (N8N)
* ❌ Multi-gudang tingkat ERP
* ❌ Audit log enterprise

Semua *sudah dibuang* dan **tidak muncul lagi di TODO**.
Jika kamu butuh mengembalikan salah satu, tinggal bilang.

---

# ✔️ Completed akan tinggal ditandai nanti.

Dokumen ini bisa digabung ke roadmap besar atau dieksekusi terpisah untuk fase UMKM-focused.


# 🛡️ SUPER ADMIN BACKUP SYSTEM — TODO FINAL (TEKNIS & TERPISAH)

Dokumen ini khusus untuk modul **Backup Tenant & Backup Database** agar tidak bercampur dengan fitur lain.

---

# 🎯 1. TUJUAN MODUL

* Monitoring stabilitas backup harian semua tenant
* Debugging cepat jika laporan gagal dikirim
* Kontrol penuh oleh super admin
* Transparansi status backup file & email

---

# 📄 2. HALAMAN: `/superadmin/backups`

## Komponen UI

* [ ] Tabel list backup tenant
* [ ] Filter: tenant, tanggal, status
* [ ] Aksi cepat:

  * [ ] Resend Email
  * [ ] Regenerate Backup
  * [ ] Download
  * [ ] View HTML
* [ ] Highlight tenant bermasalah > 1 hari
* [ ] Badge status: success / warning / failed

## Kolom Tabel

* Tenant
* Last Backup Time
* Status
* Email Sent
* Size
* Actions

---

# 🔧 3. BACKEND – DATABASE

## Tabel: `BackupLog`

* id (UUID)
* tenantId
* status: success | failed | email_failed
* generatedAt (datetime)
* emailSentAt (datetime, nullable)
* size (int)
* filePath (string)
* errorMessage (string, nullable)

---

# 🔌 4. API ENDPOINTS

### GET `/superadmin/backups`

List backup + filter.

### POST `/superadmin/backups/:tenantId/regenerate`

Generate file ulang + update BackupLog.

### POST `/superadmin/backups/:tenantId/resend-email`

Kirim ulang email laporan + update emailSentAt.

### GET `/superadmin/backups/:backupId/download`

File download by superadmin only.

### GET `/superadmin/backups/:backupId/view`

Return isi laporan dalam HTML.

---

# 🕒 5. CRON JOB

### Cron Harian (23:59)

* Generate laporan semua tenant.
* Simpan file.
* Kirim email.
* Insert BackupLog.

### Cron Monitoring (08:00)

* Scan backup gagal > 1 hari.
* Tandai warning.
* Jika gagal ≥3 hari → notif internal superadmin.

---

# 🔐 6. SECURITY

* Endpoint hanya untuk `role: superadmin`.
* Path file tidak boleh di-expose langsung.
* Backup tidak boleh berisi data sensitif (password, API, token).
* Folder backup harus isolated: `/storage/backups/...`.
* Semua file download harus signed URL sementara.

---

# 🎨 7. UI/UX DETAIL

* Status warna:

  * Hijau → success
  * Kuning → warning
  * Merah → failed
* Tooltip errorMessage di status merah
* Modal khusus untuk "View Backup"
* Pagination
* Loading state setiap aksi

---

# 🧪 8. TEST WAJIB

* Test cron berjalan
* Test regenerate
* Test resend email
* Test permission superadmin
* Test error handling
* Test download view
* Test backup failed scenario

---

# 📦 9. OPTIONAL IMPROVEMENT

* Notifikasi Telegram internal untuk superadmin jika backup gagal ≥ 3 hari
* Export log backup untuk audit internal
* Toggle backup per tenant

---

# ✔️ READY FOR DEVELOPMENT
