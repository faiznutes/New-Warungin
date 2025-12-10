# Receipt & Report Redesign Plan

## 📋 Overview

Dokumen ini berisi rencana redesign untuk:
1. **4 Template Receipt Baru** - Optimal dan responsif untuk semua ukuran kertas
2. **Template Laporan Modern** - Design yang lebih menarik dan responsif

---

## 🧾 RECEIPT TEMPLATES REDESIGN

### Informasi Wajib di Receipt

Berdasarkan requirement, setiap receipt harus menampilkan:
- ✅ Logo atau Nama Toko
- ✅ Tanggal & Waktu Pembelian/Nota
- ✅ Nomor Nota
- ✅ Shift (Pagi/Siang/Sore/Malam)
- ✅ Nama Kasir di Shift yang Melayani
- ✅ Nama Produk & Jumlah
- ✅ Total
- ✅ Terima Kasih
- ➕ Tambahan: Design modern, warna polos, menarik

### 4 Template Receipt Baru

#### 1. **CLASSIC** (Struk Klasik)
- **Deskripsi**: Design klasik dengan border dan layout tradisional
- **Target**: Semua ukuran kertas (50mm, 80mm, A4, Bluetooth)
- **Ciri Khas**:
  - Border tebal di sekeliling
  - Header dengan logo/nama toko center
  - Informasi shift dan kasir jelas
  - Footer dengan terima kasih
  - Font: Arial/Courier New
  - Warna: Hitam putih dengan accent abu-abu

#### 2. **MODERN** (Struk Modern)
- **Deskripsi**: Design modern minimalis dengan tipografi rapi
- **Target**: Semua ukuran kertas
- **Ciri Khas**:
  - Tanpa border, clean design
  - Header dengan gradient subtle (untuk A4)
  - Informasi shift dan kasir dengan icon
  - Spacing yang nyaman
  - Font: Inter/Roboto
  - Warna: Hitam dengan accent biru muda

#### 3. **MINIMAL** (Struk Minimalis)
- **Deskripsi**: Design sangat minimalis, fokus pada informasi penting
- **Target**: Thermal 50mm & 80mm (utama), A4 (opsional)
- **Ciri Khas**:
  - Hanya informasi esensial
  - Tanpa dekorasi
  - Font monospace untuk thermal
  - Spacing minimal
  - Warna: Hitam putih murni

#### 4. **PROFESSIONAL** (Struk Profesional)
- **Deskripsi**: Design profesional untuk bisnis formal
- **Target**: A4 (utama), 80mm (opsional)
- **Ciri Khas**:
  - Layout terstruktur dengan section jelas
  - Header dengan logo dan informasi lengkap
  - Breakdown detail (subtotal, diskon, pajak, total)
  - Footer dengan kontak dan website
  - Font: Arial/Helvetica
  - Warna: Hitam dengan accent abu-abu gelap

### Responsive Design Strategy

#### Thermal 50mm (Lebar: 48mm)
- Font size: 8-9px
- Padding: 2-4px
- Max characters per line: 24-26
- Layout: Single column, minimal spacing
- Font: Monospace (Courier New)

#### Thermal 80mm (Lebar: 72mm)
- Font size: 10-11px
- Padding: 4-6px
- Max characters per line: 40-42
- Layout: Single column, comfortable spacing
- Font: Monospace atau Sans-serif kecil

#### A4 (210mm x 297mm)
- Font size: 11-12px
- Padding: 15-20mm
- Max width: 170mm (dengan margin)
- Layout: Centered, dengan ruang untuk logo besar
- Font: Sans-serif modern (Inter, Roboto)

#### Bluetooth Printer
- Mengikuti ukuran kertas yang dikonfigurasi
- Support untuk 50mm, 80mm, dan A4
- Auto-detect paper size dari printer settings

### Mockup Structure (Setiap Template)

```
┌─────────────────────────────────┐
│        [LOGO/NAMA TOKO]         │  ← Header
│      Alamat & Telepon (opsional)│
├─────────────────────────────────┤
│ No. Nota: INV-2025-001234      │  ← Order Info
│ Tanggal: 10 Des 2025, 14:30    │
│ Shift: Pagi | Kasir: Budi      │  ← Shift & Cashier
├─────────────────────────────────┤
│ PRODUK              QTY   TOTAL │  ← Items Header
│─────────────────────────────────│
│ Nasi Goreng         2x   40.000│  ← Item List
│ Es Teh Manis        1x    5.000│
│─────────────────────────────────│
│ Subtotal                 45.000│  ← Summary
│ Diskon                  -5.000│
│ Total                  40.000│
│ Tunai                  50.000│
│ Kembali                10.000│
├─────────────────────────────────┤
│     Terima Kasih                │  ← Footer
│   Atas Kunjungan Anda            │
└─────────────────────────────────┘
```

---

## 📊 REPORT TEMPLATES REDESIGN

### Template Laporan yang Ada

Saat ini ada 4 template:
1. **Minimalist** - Bersih dan sederhana
2. **Modern** - Kontemporer dengan header biru
3. **Colorful** - Berwarna dengan striped rows
4. **Elegant** - Elegan dengan tema hijau

### Improvements yang Diperlukan

#### 1. **Responsive Design**
- ✅ Support untuk berbagai ukuran kertas (A4, Letter, Legal)
- ✅ Auto-adjust layout untuk landscape/portrait
- ✅ Print-friendly dengan proper page breaks
- ✅ Mobile-friendly untuk preview

#### 2. **Modern Design Elements**
- ✅ Typography yang lebih baik (font hierarchy)
- ✅ Color scheme yang konsisten
- ✅ Spacing yang lebih baik
- ✅ Icons dan visual elements
- ✅ Charts dan graphs integration

#### 3. **Informasi Lengkap**
- ✅ Header dengan logo dan nama perusahaan
- ✅ Periode laporan jelas
- ✅ Summary statistics (cards/charts)
- ✅ Detail data dalam tabel yang rapi
- ✅ Footer dengan metadata (tanggal generate, user, dll)

#### 4. **Template Naming & Design**

**Template 1: MINIMALIST → CLEAN**
- Nama baru: "Clean & Simple"
- Design: Bersih, fokus pada data, tanpa dekorasi berlebihan
- Warna: Hitam, abu-abu, putih
- Font: Inter, sans-serif

**Template 2: MODERN → CONTEMPORARY**
- Nama baru: "Contemporary"
- Design: Modern dengan accent color, cards untuk stats
- Warna: Biru (#3B82F6) sebagai primary, abu-abu untuk secondary
- Font: Inter, sans-serif

**Template 3: COLORFUL → VIBRANT**
- Nama baru: "Vibrant"
- Design: Berwarna dengan gradient, cards berwarna untuk stats
- Warna: Multi-color gradient (biru, ungu, pink, hijau)
- Font: Inter, sans-serif (bold untuk emphasis)

**Template 4: ELEGANT → PROFESSIONAL**
- Nama baru: "Professional"
- Design: Elegan dengan border dan spacing yang baik
- Warna: Hijau gelap (#059669) sebagai primary, abu-abu untuk secondary
- Font: Playfair Display untuk heading, Inter untuk body

**Template 5: NEW - EXECUTIVE** (Tambahan)
- Nama: "Executive"
- Design: Sangat profesional untuk presentasi eksekutif
- Warna: Hitam, abu-abu, emas (#F59E0B) untuk accent
- Font: Georgia untuk heading, Arial untuk body

### Mockup Structure (Setiap Template)

```
┌─────────────────────────────────────────┐
│  [LOGO]  NAMA PERUSAHAAN                │  ← Header
│  Laporan Penjualan                      │
│  Periode: 1-31 Des 2025                 │
├─────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐│  ← Stats Cards
│  │Total │  │Total │  │Total │  │Total ││
│  │Sales │  │Orders│  │Items │  │Profit││
│  └──────┘  └──────┘  └──────┘  └──────┘│
├─────────────────────────────────────────┤
│  DETAIL LAPORAN                         │  ← Table/Chart
│  ┌───────────────────────────────────┐ │
│  │ Tanggal │ Produk │ Qty │ Total    │ │
│  ├───────────────────────────────────┤ │
│  │ 10 Des  │ Item 1 │  5  │ 100.000  │ │
│  │ 10 Des  │ Item 2 │  3  │  75.000  │ │
│  └───────────────────────────────────┘ │
├─────────────────────────────────────────┤
│  Generated: 10 Des 2025, 15:30         │  ← Footer
│  By: Admin Name                         │
└─────────────────────────────────────────┘
```

---

## 🎨 Design Guidelines

### Color Palette (Receipt)
- **Primary**: Hitam (#000000) untuk text
- **Secondary**: Abu-abu (#6B7280) untuk secondary text
- **Accent**: Biru muda (#3B82F6) untuk highlight (opsional, untuk A4)
- **Background**: Putih (#FFFFFF)
- **Border**: Abu-abu (#E5E7EB) untuk separator

### Color Palette (Report)
- **Primary Colors**: 
  - Blue: #3B82F6 (Contemporary)
  - Purple: #8B5CF6 (Vibrant)
  - Green: #059669 (Professional)
  - Gold: #F59E0B (Executive)
- **Neutral**: 
  - Black: #000000
  - Gray Dark: #1F2937
  - Gray: #6B7280
  - Gray Light: #E5E7EB
  - White: #FFFFFF

### Typography
- **Receipt**: 
  - Thermal: Courier New (monospace)
  - A4: Inter, Arial, sans-serif
- **Report**:
  - Heading: Inter Bold, Playfair Display (Professional), Georgia (Executive)
  - Body: Inter Regular
  - Monospace: Untuk angka dan kode

### Spacing
- **Receipt**: 
  - 50mm: 2-4px padding, 1-2px margin
  - 80mm: 4-6px padding, 2-3px margin
  - A4: 15-20mm padding, 5-10mm margin
- **Report**:
  - Section spacing: 20-30px
  - Card padding: 20-25px
  - Table cell padding: 10-15px

---

## 📝 Implementation Checklist

### Receipt Templates
- [x] Update `RECEIPT_TEMPLATE_DEFINITIONS` dengan 4 template baru
- [x] Tambahkan field `shiftType` dan `cashierName` ke receipt data
- [x] Update `ReceiptPrinter.vue` untuk render shift dan kasir
- [x] Implement responsive styles untuk 50mm, 80mm, A4, Bluetooth
- [ ] Test print untuk setiap ukuran kertas (PENDING - Perlu testing manual)
- [x] Update `receipt-template-styles.ts` dengan styles baru
- [x] Update backend service untuk include shift dan cashier info

### Report Templates
- [x] Rename template sesuai naming baru (Clean, Contemporary, Vibrant, Professional, Executive)
- [x] Update `report-templates.ts` dengan design baru
- [x] Update `export-templates.ts` dengan improvements
- [x] Implement responsive design untuk berbagai ukuran
- [ ] Add charts/graphs integration (OPTIONAL - Future enhancement)
- [ ] Test export untuk PDF, Excel, CSV (PENDING - Perlu testing manual)
- [x] Update component untuk preview template (ReportExportModal, TenantReportExportModal, GlobalReportExportModal)

### Testing
- [ ] Test receipt print untuk semua ukuran (PENDING - Perlu testing manual)
- [ ] Test report export untuk semua format (PENDING - Perlu testing manual)
- [ ] Test responsive design di berbagai device (PENDING - Perlu testing manual)
- [ ] Test dengan data real (PENDING - Perlu testing manual)
- [ ] Verify semua informasi wajib muncul (PENDING - Perlu testing manual)

---

## 🚀 Next Steps

1. **Phase 1**: Analisis dan mockup design
2. **Phase 2**: Implementasi receipt templates
3. **Phase 3**: Implementasi report templates
4. **Phase 4**: Testing dan refinement
5. **Phase 5**: Documentation dan deployment

---

**Last Updated**: December 10, 2025  
**Status**: ✅ Implementation 100% Complete - Ready for Manual Testing  
**Progress**: 100% Implementation | 0% Manual Testing (16 tasks pending)

## ✅ Completed Implementation Summary

### Receipt Templates (100% Complete)
- ✅ 4 template baru: CLASSIC, MODERN, MINIMAL, PROFESSIONAL
- ✅ Support semua ukuran: 50mm, 80mm, A4, Bluetooth
- ✅ Informasi shift dan kasir terintegrasi
- ✅ Responsive print styles untuk semua ukuran
- ✅ Template-specific font sizes dan spacing

### Report Templates (100% Complete)
- ✅ Template renaming: Clean, Contemporary, Vibrant, Professional, Executive
- ✅ Backward compatibility dengan template lama
- ✅ Design improvements untuk semua template
- ✅ Semua components updated (ReportExportModal, TenantReportExportModal, GlobalReportExportModal)
- ✅ Executive template baru ditambahkan

### Next Phase: Manual Testing Required
- Test receipt printing untuk semua ukuran kertas
- Test report export untuk semua format
- Verify informasi lengkap di receipt
- Test responsive design di berbagai device

