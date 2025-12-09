# 📋 Manual Test Checklist

Checklist untuk testing manual semua fitur utama.

---

## 1. ✅ Test Offline Transaction Sync

### Prerequisites
- [ ] Aplikasi sudah terinstall dan berjalan
- [ ] Ada produk dengan stok > 0
- [ ] User sudah login sebagai kasir/admin

### Test Steps
1. **Persiapan**
   - [ ] Buka aplikasi di browser
   - [ ] Login sebagai kasir
   - [ ] Buka halaman POS
   - [ ] Pastikan ada koneksi internet

2. **Test Offline Mode**
   - [ ] Matikan koneksi internet (airplane mode / disable network)
   - [ ] Verifikasi muncul notifikasi "Anda offline — transaksi aman"
   - [ ] Tambahkan produk ke cart
   - [ ] Buat transaksi baru
   - [ ] Verifikasi transaksi tersimpan di IndexedDB (cek di DevTools > Application > IndexedDB)
   - [ ] Verifikasi stok berkurang secara lokal

3. **Test Sync ke Server**
   - [ ] Nyalakan kembali koneksi internet
   - [ ] Verifikasi muncul notifikasi "Sedang sync…"
   - [ ] Tunggu hingga muncul "Sync berhasil"
   - [ ] Verifikasi transaksi muncul di halaman Orders
   - [ ] Verifikasi stok di server sudah terupdate (cek di halaman Products)

### Expected Results
- ✅ Transaksi bisa dibuat saat offline
- ✅ Stok berkurang secara lokal saat offline
- ✅ Transaksi otomatis sync ke server saat online
- ✅ Stok di server terupdate setelah sync

### Issues Found
- [ ] Issue 1: ________________
- [ ] Issue 2: ________________

---

## 2. ✅ Test Stok Update di Mode Offline → Online

### Prerequisites
- [ ] Ada produk dengan stok > 0
- [ ] User sudah login sebagai admin

### Test Steps
1. **Persiapan**
   - [ ] Buka halaman Products
   - [ ] Catat stok awal produk A (misal: 100)
   - [ ] Buka halaman POS

2. **Test Update Stok Offline**
   - [ ] Matikan koneksi internet
   - [ ] Buat transaksi dengan produk A (qty: 5)
   - [ ] Verifikasi stok lokal berkurang menjadi 95
   - [ ] Buat transaksi lagi dengan produk A (qty: 3)
   - [ ] Verifikasi stok lokal berkurang menjadi 92

3. **Test Sync Stok ke Server**
   - [ ] Nyalakan kembali koneksi internet
   - [ ] Tunggu sync selesai
   - [ ] Buka halaman Products
   - [ ] Verifikasi stok produk A di server = 92 (100 - 5 - 3)

4. **Test Konflik Stok**
   - [ ] Matikan koneksi internet
   - [ ] Buat transaksi dengan produk A (qty: 2) di device 1
   - [ ] Di device 2 (online), update stok produk A menjadi 90
   - [ ] Nyalakan koneksi device 1
   - [ ] Verifikasi sync terjadi dan stok final = 88 (90 - 2, server menang)

### Expected Results
- ✅ Stok berkurang secara lokal saat offline
- ✅ Stok ter-sync ke server saat online
- ✅ Konflik stok ditangani dengan benar (server menang)

### Issues Found
- [ ] Issue 1: ________________
- [ ] Issue 2: ________________

---

## 3. ✅ Test Popup Reminder Stok Habis

### Prerequisites
- [ ] Ada produk dengan stok = 0 atau stok < minimal
- [ ] User sudah login sebagai kasir/admin

### Test Steps
1. **Persiapan**
   - [ ] Buat produk dengan stok = 0
   - [ ] Buat produk dengan stok < minimal (misal: minimal = 10, stok = 5)
   - [ ] Logout dan login kembali

2. **Test Popup Muncul**
   - [ ] Buka halaman POS
   - [ ] Verifikasi popup reminder muncul otomatis
   - [ ] Verifikasi menampilkan list 5 produk paling kritikal
   - [ ] Verifikasi menampilkan produk dengan stok = 0
   - [ ] Verifikasi menampilkan produk dengan stok < minimal

3. **Test Tombol "Tambah Stok Cepat"**
   - [ ] Klik tombol "Tambah Stok Cepat"
   - [ ] Verifikasi redirect ke halaman Products atau Inventory
   - [ ] Verifikasi produk yang dipilih sudah ter-highlight

4. **Test Tombol "Abaikan Hari Ini"**
   - [ ] Klik tombol "Abaikan Hari Ini"
   - [ ] Verifikasi popup tertutup
   - [ ] Refresh halaman POS
   - [ ] Verifikasi popup tidak muncul lagi (cek localStorage)
   - [ ] Tunggu hingga hari berikutnya atau clear localStorage
   - [ ] Refresh halaman POS
   - [ ] Verifikasi popup muncul lagi

### Expected Results
- ✅ Popup muncul otomatis saat ada produk stok habis/kritis
- ✅ Menampilkan 5 produk paling kritikal
- ✅ Tombol "Tambah Stok Cepat" berfungsi
- ✅ Tombol "Abaikan Hari Ini" men-suppress popup untuk hari itu

### Issues Found
- [ ] Issue 1: ________________
- [ ] Issue 2: ________________

---

## 4. ✅ Test Simple POS Mode Buttons

### Prerequisites
- [ ] User sudah login sebagai kasir
- [ ] Ada produk dengan kategori
- [ ] Simple POS Mode sudah diaktifkan di settings

### Test Steps
1. **Persiapan**
   - [ ] Buka halaman Settings
   - [ ] Aktifkan "Simple POS Mode"
   - [ ] Buka halaman POS
   - [ ] Verifikasi tampilan Simple POS Mode aktif

2. **Test Tampilan Minimalis**
   - [ ] Verifikasi hanya menampilkan 3-5 kategori besar
   - [ ] Verifikasi tombol produk ukuran besar
   - [ ] Verifikasi tidak ada popup panjang
   - [ ] Verifikasi warna kontras tinggi

3. **Test Mode Pembayaran Cepat**
   - [ ] Tambahkan produk ke cart
   - [ ] Klik tombol "Tunai"
   - [ ] Input angka pembayaran
   - [ ] Verifikasi kembalian dihitung otomatis
   - [ ] Klik tombol "Non-tunai"
   - [ ] Verifikasi transaksi langsung selesai (single click)

4. **Test Quick Actions**
   - [ ] Tambahkan produk ke cart
   - [ ] Test "Void item" - hapus item dari cart
   - [ ] Test "Tambah qty" - tambah quantity item
   - [ ] Test "Diskon cepat" - tambah diskon nilai/%

5. **Test Auto Landscape**
   - [ ] Buka POS di mobile/tablet
   - [ ] Rotate ke portrait
   - [ ] Verifikasi muncul pesan pop-up untuk rotate ke landscape
   - [ ] Rotate ke landscape
   - [ ] Verifikasi pesan hilang dan tampilan optimal

### Expected Results
- ✅ Tampilan minimalis dengan tombol besar
- ✅ Pembayaran cepat (tunai/non-tunai)
- ✅ Quick actions berfungsi
- ✅ Auto landscape lock berfungsi

### Issues Found
- [ ] Issue 1: ________________
- [ ] Issue 2: ________________

---

## 5. ✅ Test Price Suggestion Endpoint

### Prerequisites
- [ ] User sudah login sebagai admin
- [ ] Ada produk dengan HPP (cost)
- [ ] Ada produk dengan kategori untuk perbandingan harga pasar

### Test Steps
1. **Test Endpoint `/product/price-suggestion`**
   - [ ] Buka halaman Products
   - [ ] Pilih produk yang sudah ada
   - [ ] Klik "Price Suggestion"
   - [ ] Verifikasi muncul rekomendasi:
     - [ ] Harga jual 20% margin
     - [ ] Harga jual 30% margin
     - [ ] Harga jual "ramai pasaran"
   - [ ] Verifikasi perhitungan margin benar (HPP * 1.2, HPP * 1.3)

2. **Test Endpoint `/product/price-suggestion/by-cost`**
   - [ ] Buka form tambah produk baru
   - [ ] Input HPP (cost) produk
   - [ ] Verifikasi muncul rekomendasi harga otomatis
   - [ ] Klik "Gunakan harga ini" untuk salah satu rekomendasi
   - [ ] Verifikasi harga produk ter-update

3. **Test Harga Pasaran**
   - [ ] Buat produk dengan kategori "Makanan"
   - [ ] Pastikan ada produk lain di kategori "Makanan" dengan harga
   - [ ] Request price suggestion
   - [ ] Verifikasi "harga ramai pasaran" menggunakan median harga kategori

4. **Test Error Handling**
   - [ ] Request price suggestion tanpa HPP
   - [ ] Verifikasi error message yang jelas
   - [ ] Request price suggestion untuk kategori tanpa produk lain
   - [ ] Verifikasi fallback ke margin default

### Expected Results
- ✅ Rekomendasi harga 20% dan 30% margin benar
- ✅ Harga pasaran menggunakan median kategori
- ✅ Bisa langsung update produk dengan rekomendasi
- ✅ Error handling yang jelas

### Issues Found
- [ ] Issue 1: ________________
- [ ] Issue 2: ________________

---

## 6. ✅ Test Daily Email Backup Cron

### Prerequisites
- [ ] Server sudah running dengan BullMQ
- [ ] Redis sudah terhubung
- [ ] Email service sudah dikonfigurasi
- [ ] Ada tenant dengan `email_backup_enabled: true`

### Test Steps
1. **Test Cron Job Berjalan**
   - [ ] Cek log server untuk cron job "daily-backup-email"
   - [ ] Verifikasi cron job ter-schedule untuk 23:59
   - [ ] Tunggu hingga 23:59 atau trigger manual
   - [ ] Verifikasi cron job berjalan

2. **Test Generate Laporan**
   - [ ] Verifikasi laporan harian di-generate dengan data:
     - [ ] Penjualan harian
     - [ ] Kas masuk
     - [ ] Kas keluar
     - [ ] Hutang/piutang
     - [ ] Stok habis/mau habis
   - [ ] Verifikasi format PDF atau HTML

3. **Test Kirim Email**
   - [ ] Verifikasi email terkirim ke email pemilik tenant
   - [ ] Verifikasi email berisi attachment laporan
   - [ ] Verifikasi email berisi ringkasan data

4. **Test BackupLog**
   - [ ] Cek tabel BackupLog di database
   - [ ] Verifikasi ada record baru dengan:
     - [ ] status: success
     - [ ] generatedAt: timestamp hari ini
     - [ ] emailSentAt: timestamp hari ini
     - [ ] size: ukuran file
   - [ ] Verifikasi file backup tersimpan di `/storage/backups/`

5. **Test Toggle Fitur**
   - [ ] Set `email_backup_enabled: false` untuk tenant
   - [ ] Tunggu cron job berjalan
   - [ ] Verifikasi email tidak terkirim untuk tenant tersebut
   - [ ] Set kembali `email_backup_enabled: true`
   - [ ] Verifikasi email terkirim lagi

6. **Test Error Handling**
   - [ ] Simulasikan error saat generate laporan
   - [ ] Verifikasi BackupLog mencatat status: failed
   - [ ] Verifikasi errorMessage tersimpan
   - [ ] Verifikasi tidak ada email terkirim jika gagal

### Expected Results
- ✅ Cron job berjalan setiap hari jam 23:59
- ✅ Laporan harian di-generate dengan lengkap
- ✅ Email terkirim ke pemilik tenant
- ✅ BackupLog mencatat semua backup
- ✅ Toggle fitur berfungsi
- ✅ Error handling yang baik

### Issues Found
- [ ] Issue 1: ________________
- [ ] Issue 2: ________________

---

## 7. ✅ Test Multi-Store Features

### Prerequisites
- [ ] User sudah login sebagai admin tenant
- [ ] Tenant memiliki paket PRO atau MAX
- [ ] Ada minimal 2 outlet/store

### Test Steps
1. **Test Transfer Stok Antar Store**
   - [ ] Buka halaman Stock Transfers
   - [ ] Klik "Buat Transfer Baru"
   - [ ] Pilih store asal dan store tujuan
   - [ ] Pilih produk dan quantity
   - [ ] Verifikasi validasi stok cukup
   - [ ] Submit transfer
   - [ ] Verifikasi stok store asal berkurang
   - [ ] Verifikasi stok store tujuan bertambah (setelah receive)

2. **Test Laporan Multi-Store**
   - [ ] Buka halaman Store Reports
   - [ ] Pilih periode tanggal
   - [ ] Verifikasi menampilkan:
     - [ ] Penjualan harian per store
     - [ ] Penjualan gabungan semua store
     - [ ] Stok per store

3. **Test Supervisor Role**
   - [ ] Buat user dengan role SUPERVISOR
   - [ ] Assign store ke supervisor
   - [ ] Login sebagai supervisor
   - [ ] Verifikasi hanya melihat data store yang di-assign
   - [ ] Verifikasi tidak bisa edit store lain

### Expected Results
- ✅ Transfer stok berfungsi dengan validasi
- ✅ Laporan multi-store menampilkan data lengkap
- ✅ Supervisor hanya melihat store yang di-assign

### Issues Found
- [ ] Issue 1: ________________
- [ ] Issue 2: ________________

---

## 8. ✅ Test Addons System

### Prerequisites
- [ ] User sudah login sebagai admin tenant
- [ ] Ada payment gateway yang dikonfigurasi

### Test Steps
1. **Test Marketplace Addons**
   - [ ] Buka halaman Addons
   - [ ] Verifikasi menampilkan semua addon tersedia
   - [ ] Verifikasi menampilkan addon aktif
   - [ ] Verifikasi menampilkan harga dan deskripsi

2. **Test Aktivasi Addon**
   - [ ] Pilih addon yang belum aktif
   - [ ] Klik "Berlangganan"
   - [ ] Verifikasi redirect ke payment page
   - [ ] Complete payment (atau mock payment)
   - [ ] Verifikasi addon menjadi aktif
   - [ ] Verifikasi fitur addon bisa digunakan

3. **Test Expired Addon**
   - [ ] Set addon dengan expiresAt hari ini
   - [ ] Tunggu cron job "check-expired-addons" berjalan (04:00)
   - [ ] Verifikasi addon status menjadi inactive
   - [ ] Verifikasi fitur addon tidak bisa digunakan

4. **Test Addon Guard**
   - [ ] Nonaktifkan addon EXPORT_REPORTS
   - [ ] Coba akses fitur export laporan
   - [ ] Verifikasi muncul error "Export Laporan addon is required"
   - [ ] Verifikasi redirect ke halaman addons atau unauthorized

### Expected Results
- ✅ Marketplace addons menampilkan semua addon
- ✅ Aktivasi addon melalui payment flow
- ✅ Expired addon otomatis dinonaktifkan
- ✅ Addon guard mencegah akses tanpa addon aktif

### Issues Found
- [ ] Issue 1: ________________
- [ ] Issue 2: ________________

---

## 9. ✅ Test Subscription Plans

### Prerequisites
- [ ] User sudah login sebagai admin tenant
- [ ] Ada payment gateway yang dikonfigurasi

### Test Steps
1. **Test Upgrade Plan**
   - [ ] Buka halaman Subscription Plans
   - [ ] Pilih plan PRO atau MAX
   - [ ] Klik "Upgrade"
   - [ ] Complete payment
   - [ ] Verifikasi plan ter-update
   - [ ] Verifikasi limit ter-update (store, user, product)

2. **Test Limit Enforcement**
   - [ ] Set plan BASIC (1 store, 4 user, 25 product)
   - [ ] Coba tambah store ke-2
   - [ ] Verifikasi muncul error "Limit tercapai"
   - [ ] Verifikasi muncul CTA untuk upgrade

3. **Test Downgrade Plan**
   - [ ] Set plan PRO dengan 3 store aktif
   - [ ] Downgrade ke BASIC
   - [ ] Verifikasi store ke-2 dan ke-3 otomatis dinonaktifkan
   - [ ] Verifikasi hanya store pertama yang aktif

### Expected Results
- ✅ Upgrade plan berfungsi
- ✅ Limit enforcement bekerja
- ✅ Downgrade plan menonaktifkan resource yang melebihi limit

### Issues Found
- [ ] Issue 1: ________________
- [ ] Issue 2: ________________

---

## Summary

### Test Execution Date
- Date: _______________
- Tester: _______________
- Environment: _______________

### Overall Results
- Total Test Cases: 9
- Passed: _______
- Failed: _______
- Blocked: _______

### Critical Issues
1. ________________
2. ________________
3. ________________

### Notes
________________
________________
________________
