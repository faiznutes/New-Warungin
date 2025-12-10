# Receipt & Report Redesign TODO

## 🎯 Tujuan
Redesign 4 template receipt dan template laporan menjadi lebih modern, responsif, dan informatif dengan menambahkan informasi shift dan kasir.

---

## 📋 RECEIPT REDESIGN

### Phase 1: Analisis & Persiapan
- [x] Analisis struktur receipt saat ini
- [x] Identifikasi field yang perlu ditambahkan (shift, kasir)
- [x] Buat dokumentasi redesign plan
- [ ] Cek apakah order sudah include storeShift dan user info
- [ ] Update receipt service untuk fetch shift dan cashier info
- [ ] Update ReceiptData interface untuk include shiftType dan cashierName

### Phase 2: Backend Updates
- [ ] Update `src/services/receipt.service.ts`:
  - [ ] Include `storeShift` dan `user` di order query
  - [ ] Extract `shiftType` dari `order.storeShift.shiftType`
  - [ ] Extract `cashierName` dari `order.user.name` atau `order.storeShift.opener.name`
  - [ ] Tambahkan `shiftType` dan `cashierName` ke `receiptData`
- [ ] Update `RECEIPT_TEMPLATE_DEFINITIONS`:
  - [ ] Ganti 5 template menjadi 4 template baru (CLASSIC, MODERN, MINIMAL, PROFESSIONAL)
  - [ ] Update field definitions untuk include shift dan cashier
  - [ ] Update paperSize support (50mm, 80mm, A4, Bluetooth)
- [ ] Test backend API untuk memastikan data shift dan kasir terkirim

### Phase 3: Frontend Receipt Component
- [ ] Update `client/src/components/ReceiptPrinter.vue`:
  - [ ] Tambahkan display untuk shift type (Pagi/Siang/Sore/Malam)
  - [ ] Tambahkan display untuk nama kasir
  - [ ] Update template rendering untuk 4 template baru
  - [ ] Implement responsive styles untuk semua ukuran kertas
- [ ] Update `client/src/utils/receipt-template-styles.ts`:
  - [ ] Tambahkan styles untuk CLASSIC template
  - [ ] Tambahkan styles untuk MODERN template
  - [ ] Tambahkan styles untuk MINIMAL template
  - [ ] Tambahkan styles untuk PROFESSIONAL template
  - [ ] Implement responsive font sizes dan spacing
- [ ] Update print styles untuk thermal 50mm, 80mm, A4, Bluetooth

### Phase 4: Template Implementation

#### Template 1: CLASSIC
- [ ] Design mockup (border, layout klasik)
- [ ] Implement header dengan logo/nama toko
- [ ] Implement order info (no. nota, tanggal, waktu)
- [ ] Implement shift & cashier info dengan styling jelas
- [ ] Implement items list dengan border
- [ ] Implement summary (subtotal, diskon, total)
- [ ] Implement footer dengan terima kasih
- [ ] Test untuk 50mm, 80mm, A4, Bluetooth

#### Template 2: MODERN
- [ ] Design mockup (clean, minimalis, modern)
- [ ] Implement header tanpa border, dengan gradient subtle
- [ ] Implement order info dengan icon (opsional untuk A4)
- [ ] Implement shift & cashier info dengan icon
- [ ] Implement items list dengan spacing nyaman
- [ ] Implement summary dengan card style
- [ ] Implement footer modern
- [ ] Test untuk 50mm, 80mm, A4, Bluetooth

#### Template 3: MINIMAL
- [ ] Design mockup (sangat minimalis, fokus esensial)
- [ ] Implement header minimal (hanya nama toko)
- [ ] Implement order info compact
- [ ] Implement shift & cashier info compact
- [ ] Implement items list minimal
- [ ] Implement summary minimal (hanya total)
- [ ] Implement footer minimal
- [ ] Test untuk 50mm, 80mm (utama), A4 (opsional)

#### Template 4: PROFESSIONAL
- [ ] Design mockup (profesional, terstruktur)
- [ ] Implement header lengkap dengan logo dan info
- [ ] Implement order info detail
- [ ] Implement shift & cashier info dengan section jelas
- [ ] Implement items list dengan breakdown detail
- [ ] Implement summary lengkap (subtotal, diskon, pajak, total)
- [ ] Implement footer dengan kontak dan website
- [ ] Test untuk A4 (utama), 80mm (opsional)

### Phase 5: Responsive Design
- [ ] Implement media queries untuk 50mm thermal
- [ ] Implement media queries untuk 80mm thermal
- [ ] Implement media queries untuk A4
- [ ] Implement auto-detect untuk Bluetooth printer
- [ ] Test print preview untuk semua ukuran
- [ ] Verify font sizes sesuai untuk setiap ukuran
- [ ] Verify spacing dan padding sesuai

### Phase 6: Testing
- [ ] Test print untuk thermal 50mm
- [ ] Test print untuk thermal 80mm
- [ ] Test print untuk A4
- [ ] Test print untuk Bluetooth printer
- [ ] Test dengan data real (order dengan shift dan kasir)
- [ ] Test dengan berbagai jumlah items
- [ ] Test dengan diskon dan tanpa diskon
- [ ] Verify semua informasi wajib muncul

---

## 📊 REPORT REDESIGN

### Phase 1: Analisis Template Saat Ini
- [x] Identifikasi template laporan yang ada
- [ ] Analisis struktur HTML/CSS saat ini
- [ ] Identifikasi improvements yang diperlukan
- [ ] Buat mockup untuk setiap template

### Phase 2: Template Renaming & Updates

#### Template 1: MINIMALIST → CLEAN
- [ ] Rename template dari "Minimalist" ke "Clean & Simple"
- [ ] Update design: Bersih, fokus data, tanpa dekorasi
- [ ] Update color scheme: Hitam, abu-abu, putih
- [ ] Update typography: Inter, sans-serif
- [ ] Implement responsive design
- [ ] Test export PDF, Excel, CSV

#### Template 2: MODERN → CONTEMPORARY
- [ ] Rename template dari "Modern" ke "Contemporary"
- [ ] Update design: Modern dengan accent color, cards untuk stats
- [ ] Update color scheme: Biru (#3B82F6) primary, abu-abu secondary
- [ ] Update typography: Inter, sans-serif
- [ ] Implement responsive design
- [ ] Test export PDF, Excel, CSV

#### Template 3: COLORFUL → VIBRANT
- [ ] Rename template dari "Colorful" ke "Vibrant"
- [ ] Update design: Berwarna dengan gradient, cards berwarna
- [ ] Update color scheme: Multi-color gradient
- [ ] Update typography: Inter, sans-serif (bold untuk emphasis)
- [ ] Implement responsive design
- [ ] Test export PDF, Excel, CSV

#### Template 4: ELEGANT → PROFESSIONAL
- [ ] Rename template dari "Elegant" ke "Professional"
- [ ] Update design: Elegan dengan border dan spacing baik
- [ ] Update color scheme: Hijau gelap (#059669) primary
- [ ] Update typography: Playfair Display untuk heading, Inter untuk body
- [ ] Implement responsive design
- [ ] Test export PDF, Excel, CSV

#### Template 5: NEW - EXECUTIVE
- [ ] Create new template "Executive"
- [ ] Design: Sangat profesional untuk presentasi eksekutif
- [ ] Color scheme: Hitam, abu-abu, emas (#F59E0B) untuk accent
- [ ] Typography: Georgia untuk heading, Arial untuk body
- [ ] Implement responsive design
- [ ] Test export PDF, Excel, CSV

### Phase 3: Report Components Updates
- [ ] Update `client/src/utils/report-templates.ts`:
  - [ ] Update semua template functions dengan design baru
  - [ ] Implement responsive styles
  - [ ] Add charts/graphs integration (opsional)
- [ ] Update `client/src/utils/export-templates.ts`:
  - [ ] Update template functions
  - [ ] Implement improvements
- [ ] Update `client/src/components/ReportExportModal.vue`:
  - [ ] Update template options dengan nama baru
  - [ ] Update preview untuk setiap template
- [ ] Update `client/src/components/TenantReportExportModal.vue`:
  - [ ] Update template options
  - [ ] Update preview

### Phase 4: Report Features
- [ ] Implement header dengan logo dan nama perusahaan
- [ ] Implement summary statistics dengan cards/charts
- [ ] Implement detail data dalam tabel yang rapi
- [ ] Implement footer dengan metadata (tanggal generate, user)
- [ ] Implement page breaks untuk print
- [ ] Implement responsive design untuk mobile preview

### Phase 5: Testing
- [ ] Test export PDF untuk semua template
- [ ] Test export Excel untuk semua template
- [ ] Test export CSV untuk semua template
- [ ] Test print preview untuk semua template
- [ ] Test dengan data real
- [ ] Test responsive design di berbagai device
- [ ] Verify semua informasi lengkap muncul

---

## 🔧 Technical Tasks

### Backend
- [ ] Update Prisma query untuk include storeShift dan user
- [ ] Update receipt service untuk extract shift dan cashier
- [ ] Update receipt template definitions
- [ ] Test API endpoints

### Frontend
- [ ] Update ReceiptData interface
- [ ] Update ReceiptPrinter component
- [ ] Update receipt template styles
- [ ] Update report template functions
- [ ] Update export templates
- [ ] Update modal components

### Styling
- [ ] Create responsive CSS untuk receipt
- [ ] Create responsive CSS untuk report
- [ ] Implement print styles
- [ ] Test di berbagai browser

---

## 📝 Documentation
- [x] Buat redesign plan document
- [x] Buat TODO list
- [ ] Update user guide untuk template baru
- [ ] Create mockup images (opsional)
- [ ] Document responsive breakpoints

---

## ✅ Acceptance Criteria

### Receipt
- ✅ Semua 4 template terimplementasi
- ✅ Responsif untuk 50mm, 80mm, A4, Bluetooth
- ✅ Menampilkan logo/nama toko
- ✅ Menampilkan tanggal & waktu
- ✅ Menampilkan nomor nota
- ✅ Menampilkan shift (Pagi/Siang/Sore/Malam)
- ✅ Menampilkan nama kasir
- ✅ Menampilkan produk & jumlah
- ✅ Menampilkan total
- ✅ Menampilkan terima kasih
- ✅ Design modern dan menarik
- ✅ Warna polos (hitam putih dengan accent minimal)

### Report
- ✅ Semua template ter-rename dan ter-update
- ✅ Design modern dan responsif
- ✅ Menampilkan informasi lengkap
- ✅ Export berfungsi untuk PDF, Excel, CSV
- ✅ Print-friendly dengan page breaks
- ✅ Mobile-friendly untuk preview

---

**Last Updated**: December 10, 2025
**Status**: Planning & Analysis Phase

