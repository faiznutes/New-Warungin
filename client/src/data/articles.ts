// Help articles data with dummy content for popular guides
export interface HelpArticle {
    slug: string;
    title: string;
    description: string;
    category: 'getting-started' | 'features' | 'billing' | 'troubleshooting' | 'api' | 'security';
    icon: string;
    content: string;
    relatedArticles: string[];
    tags: string[];
}

export const helpArticles: HelpArticle[] = [
    // Getting Started
    {
        slug: 'cara-setup-awal',
        title: 'Cara Setup Awal Warungin',
        description: 'Langkah demi langkah menyiapkan outlet pertama Anda.',
        category: 'getting-started',
        icon: 'rocket_launch',
        tags: ['setup', 'outlet', 'awal', 'mulai', 'registrasi'],
        relatedArticles: ['cara-menambah-produk', 'konfigurasi-printer'],
        content: `
## Selamat Datang di Warungin!

Panduan ini akan membantu Anda menyiapkan outlet pertama dan mulai menggunakan sistem kasir Warungin.

### Langkah 1: Registrasi Akun

1. Kunjungi halaman [Registrasi](/register)
2. Masukkan email dan password Anda
3. Verifikasi email Anda melalui link yang dikirim

### Langkah 2: Setup Profil Bisnis

Setelah login, Anda akan diminta untuk mengisi informasi bisnis:
- **Nama Bisnis**: Nama warung atau toko Anda
- **Alamat**: Alamat lengkap outlet
- **Nomor Telepon**: Untuk kontak pelanggan
- **Logo**: Upload logo bisnis (opsional)

### Langkah 3: Tambah Outlet Pertama

1. Masuk ke menu **Pengaturan > Stores**
2. Klik tombol **Add Store**
3. Isi detail outlet:
   - Nama Outlet
   - Alamat
   - Nomor Telepon
4. Klik **Save**

### Langkah 4: Tambah Produk

Setelah outlet siap, Anda bisa mulai menambah produk:
1. Masuk ke menu **Produk**
2. Klik **Tambah Produk**
3. Isi detail produk (nama, harga, kategori)
4. Simpan

### Langkah 5: Mulai Berjualan!

Anda sudah siap menggunakan POS:
1. Buka menu **POS**
2. Pilih produk yang dibeli pelanggan
3. Proses pembayaran
4. Cetak struk

> **Tips**: Pastikan printer sudah dikonfigurasi sebelum mulai berjualan. Lihat panduan [Konfigurasi Printer](/help/konfigurasi-printer).

---

### FAQ Setup Awal

**Q: Apakah saya bisa memiliki lebih dari satu outlet?**
A: Ya! Dengan paket PRO atau ENTERPRISE, Anda bisa menambah multiple outlet.

**Q: Bagaimana cara menambah kasir?**
A: Masuk ke menu **Manajemen > Users** dan tambah user baru dengan role Kasir.

**Q: Apakah data saya aman?**
A: Ya, semua data terenkripsi dan disimpan di server yang aman.
    `
    },
    {
        slug: 'cara-menambah-produk',
        title: 'Cara Menambah Produk',
        description: 'Panduan input produk, varian, dan manajemen stok.',
        category: 'features',
        icon: 'inventory_2',
        tags: ['produk', 'stok', 'varian', 'kategori', 'harga'],
        relatedArticles: ['cara-setup-awal', 'stock-opname'],
        content: `
## Menambah dan Mengelola Produk

Panduan lengkap untuk menambah produk, mengatur varian, dan mengelola stok inventaris.

### Menambah Produk Baru

1. Buka menu **Produk** dari sidebar
2. Klik tombol **+ Tambah Produk**
3. Isi informasi produk:

| Field | Keterangan |
|-------|------------|
| Nama Produk | Nama yang akan muncul di struk |
| SKU | Kode unik produk (opsional) |
| Kategori | Kelompok produk |
| Harga Jual | Harga untuk pelanggan |
| Harga Modal | Untuk kalkulasi profit |
| Stok Awal | Jumlah stok saat ini |

4. Upload foto produk (opsional tapi direkomendasikan)
5. Klik **Simpan**

### Mengatur Varian Produk

Untuk produk dengan variasi (ukuran, warna, dll):

1. Aktifkan toggle **Ada Varian**
2. Tambah nama varian (contoh: "Ukuran")
3. Tambah opsi varian (contoh: "Kecil", "Sedang", "Besar")
4. Atur harga dan stok per varian

**Contoh:**
\`\`\`
Produk: Es Kopi Susu
├── Varian: Ukuran
│   ├── Regular - Rp 18.000 (Stok: 50)
│   ├── Medium - Rp 22.000 (Stok: 45)
│   └── Large - Rp 28.000 (Stok: 30)
\`\`\`

### Manajemen Stok

#### Update Stok Manual
1. Buka detail produk
2. Klik **Edit Stok**
3. Masukkan jumlah baru
4. Pilih alasan perubahan

#### Stock Opname
Untuk penyesuaian stok massal:
1. Buka menu **Produk > Adjustments**
2. Klik **New Adjustment**
3. Pilih alasan "Stock Opname"
4. Pilih produk dan masukkan jumlah penyesuaian
5. Simpan

### Import Produk Massal

Untuk menambah banyak produk sekaligus:
1. Download template Excel
2. Isi data produk
3. Upload file
4. Review dan konfirmasi

---

### Tips Mengelola Produk

> **Pro Tip**: Gunakan SKU yang konsisten untuk memudahkan pencarian. Contoh: KPI-001 (Kopi 001), MKN-001 (Makanan 001).

- Selalu update stok setelah menerima barang
- Set alert stok minimum untuk produk populer
- Arsipkan produk yang sudah tidak dijual daripada menghapusnya
    `
    },
    {
        slug: 'konfigurasi-printer',
        title: 'Konfigurasi Printer Struk',
        description: 'Cara menghubungkan printer thermal bluetooth/USB.',
        category: 'features',
        icon: 'print',
        tags: ['printer', 'thermal', 'bluetooth', 'usb', 'struk', 'receipt'],
        relatedArticles: ['cara-setup-awal', 'download-laporan'],
        content: `
## Konfigurasi Printer Struk

Panduan lengkap untuk menghubungkan printer thermal ke sistem Warungin.

### Jenis Printer yang Didukung

Warungin mendukung berbagai jenis printer thermal:

| Tipe | Koneksi | Kelebihan |
|------|---------|-----------|
| USB | Kabel USB | Stabil, tidak perlu charging |
| Bluetooth | Wireless | Fleksibel, portable |
| Network | LAN/WiFi | Bisa dipakai beberapa device |

### Setup Printer Bluetooth

#### Android
1. Nyalakan printer dan aktifkan Bluetooth
2. Buka **Settings > Bluetooth** di HP
3. Pair dengan printer (biasanya nama seperti "BT-Printer" atau "Thermal-58")
4. Di Warungin, buka **Pengaturan > Printer**
5. Pilih printer yang sudah di-pair
6. Test print untuk memastikan

#### iOS
1. Pastikan printer Anda mendukung iOS (MFi certified)
2. Buka **Settings > Bluetooth**
3. Connect ke printer
4. Di Warungin, pilih printer dari daftar

### Setup Printer USB

1. Hubungkan printer ke komputer dengan kabel USB
2. Install driver printer (biasanya otomatis di Windows 10/11)
3. Di Warungin web, buka **Pengaturan > Printer**
4. Pilih printer dari daftar
5. Test print

### Setup Printer Network

1. Hubungkan printer ke jaringan WiFi atau LAN
2. Catat IP address printer (biasanya ada di menu printer atau cetak network info)
3. Di Warungin, masukkan IP address printer
4. Test connection

### Troubleshooting

**Printer tidak ditemukan?**
- Pastikan printer menyala dan dalam mode pairing
- Restart Bluetooth di device Anda
- Pastikan jarak tidak lebih dari 10 meter

**Print buram atau tidak jelas?**
- Periksa kertas thermal - pastikan sisi glossy menghadap ke atas
- Bersihkan head printer dengan cotton bud + alkohol
- Ganti kertas jika sudah lama tersimpan

**Print terpotong?**
- Sesuaikan lebar kertas di pengaturan (58mm atau 80mm)
- Periksa margin di template struk

### Template Struk

Anda bisa mengkustomisasi struk di **Pengaturan > Receipt Templates**:
- Logo bisnis
- Informasi kontak
- Pesan promosi
- QR code untuk feedback

---

### Rekomendasi Printer

| Budget | Printer | Harga Kisaran |
|--------|---------|---------------|
| Entry | Epson TM-T82 | Rp 1.5 - 2 juta |
| Mid | Xprinter XP-58 | Rp 300 - 500 ribu |
| Premium | Epson TM-88 | Rp 3 - 5 juta |
    `
    },
    {
        slug: 'download-laporan',
        title: 'Download Laporan Bulanan',
        description: 'Export laporan penjualan ke Excel/PDF.',
        category: 'features',
        icon: 'download',
        tags: ['laporan', 'report', 'excel', 'pdf', 'export', 'penjualan'],
        relatedArticles: ['cara-setup-awal', 'analitik-penjualan'],
        content: `
## Export Laporan Penjualan

Panduan lengkap untuk mengunduh laporan penjualan dalam format Excel atau PDF.

### Jenis Laporan yang Tersedia

| Laporan | Keterangan |
|---------|------------|
| Laporan Penjualan | Ringkasan transaksi harian/mingguan/bulanan |
| Laporan Produk | Produk terlaris, stok, dll |
| Laporan Kasir | Performa per kasir |
| Laporan Keuangan | Profit & Loss, Cash Flow |
| Laporan Shift | Detail per shift kasir |

### Cara Download Laporan

#### Dari Menu Reports

1. Buka menu **Laporan** dari sidebar
2. Pilih jenis laporan yang diinginkan
3. Set filter tanggal (hari ini, minggu ini, bulan ini, atau custom)
4. Pilih outlet (jika multi-outlet)
5. Klik tombol **Export**
6. Pilih format: **Excel** atau **PDF**
7. File akan terdownload otomatis

#### Quick Export dari Dashboard

1. Di Dashboard, scroll ke bagian laporan
2. Klik ikon download di pojok kanan atas chart
3. File langsung terdownload

### Format File

**Excel (.xlsx)**
- Bisa diedit dan dimodifikasi
- Cocok untuk analisis lanjutan
- Bisa diimport ke software akuntansi

**PDF**
- Format fixed, tidak bisa diedit
- Cocok untuk arsip dan sharing
- Print-ready

### Penjadwalan Laporan Otomatis

Untuk paket PRO dan ENTERPRISE:

1. Buka **Pengaturan > Laporan Otomatis**
2. Klik **Tambah Jadwal**
3. Pilih jenis laporan
4. Set frekuensi (harian, mingguan, bulanan)
5. Masukkan email penerima
6. Simpan

Laporan akan dikirim otomatis ke email sesuai jadwal.

### Tips

> **Pro Tip**: Untuk analisis mendalam, export ke Excel lalu gunakan Pivot Table untuk memfilter data sesuai kebutuhan.

- Download laporan bulanan di awal bulan untuk arsip
- Bandingkan laporan antar periode untuk melihat trend
- Gunakan laporan profit/loss untuk evaluasi bisnis

---

### Contoh Laporan

**Laporan Penjualan Harian:**
\`\`\`
Tanggal: 26 Desember 2024
Outlet: Warungin Cabang 1

Total Transaksi: 156
Total Penjualan: Rp 4.850.000
Rata-rata per Transaksi: Rp 31.089

Top 5 Produk:
1. Es Kopi Susu - 45 pcs
2. Nasi Goreng - 32 pcs
3. Mie Ayam - 28 pcs
4. Es Teh Manis - 26 pcs
5. Roti Bakar - 21 pcs
\`\`\`
    `
    },
    // Troubleshooting Articles
    {
        slug: 'stock-opname',
        title: 'Cara Stock Opname',
        description: 'Panduan lengkap melakukan stock opname dan penyesuaian stok.',
        category: 'troubleshooting',
        icon: 'inventory',
        tags: ['stock', 'opname', 'inventaris', 'adjustment', 'stok'],
        relatedArticles: ['cara-menambah-produk'],
        content: `
## Stock Opname

Panduan lengkap melakukan stock opname / stocktaking untuk menyesuaikan stok fisik dengan sistem.

### Apa itu Stock Opname?

Stock opname adalah proses menghitung stok fisik barang dan mencocokkannya dengan data di sistem. Ini penting untuk:
- Memastikan akurasi data stok
- Mendeteksi kehilangan atau kerusakan barang
- Audit inventory

### Kapan Harus Stock Opname?

- **Harian**: Untuk produk fast-moving
- **Mingguan**: Untuk produk medium-moving
- **Bulanan**: Untuk seluruh inventaris
- **Sebelum tutup buku**: Akhir bulan/tahun

### Cara Melakukan Stock Opname

#### Langkah 1: Persiapan
1. Download **Stock List** dari menu Produk
2. Cetak atau buka di tablet
3. Siapkan alat hitung

#### Langkah 2: Hitung Stok Fisik
1. Hitung setiap produk secara fisik
2. Catat jumlah aktual di list
3. Tandai produk yang berbeda dengan sistem

#### Langkah 3: Input ke Sistem
1. Buka **Produk > Adjustments**
2. Klik **New Adjustment**
3. Pilih alasan **Stock Opname / Stocktaking**
4. Pilih produk yang perlu disesuaikan
5. Masukkan selisih (positif jika lebih, negatif jika kurang)
6. Klik **Save Adjustment**

### Contoh Penyesuaian

| Produk | Stok Sistem | Stok Fisik | Selisih | Tipe |
|--------|-------------|------------|---------|------|
| Kopi | 50 | 48 | -2 | DECREASE |
| Gula | 30 | 35 | +5 | INCREASE |
| Susu | 25 | 25 | 0 | - |

### Tips Stock Opname

> **Pro Tip**: Lakukan stock opname saat jam sepi atau setelah tutup untuk menghindari perubahan stok saat proses berlangsung.

- Libatkan minimal 2 orang untuk double-check
- Foto bukti jika ada produk rusak/expired
- Simpan laporan stock opname untuk audit
    `
    },
    {
        slug: 'lupa-password',
        title: 'Lupa Password',
        description: 'Cara reset password akun Warungin.',
        category: 'troubleshooting',
        icon: 'lock_reset',
        tags: ['password', 'lupa', 'reset', 'login'],
        relatedArticles: ['cara-setup-awal'],
        content: `
## Reset Password

Cara mengatasi lupa password akun Warungin.

### Reset via Email

1. Buka halaman [Login](/login)
2. Klik **Lupa Password?**
3. Masukkan email yang terdaftar
4. Cek inbox email (dan folder spam)
5. Klik link reset password
6. Buat password baru

### Tidak Menerima Email?

- Pastikan email yang dimasukkan benar
- Cek folder Spam/Junk
- Tunggu 5-10 menit
- Coba request ulang setelah 30 menit

### Hubungi Support

Jika masih tidak bisa:
- Email: support@warungin.com
- WhatsApp: +62 812-xxxx-xxxx

Siapkan informasi:
- Nama bisnis
- Email terdaftar
- Bukti kepemilikan akun (invoice, dll)
    `
    },
    // Billing Articles
    {
        slug: 'upgrade-paket',
        title: 'Cara Upgrade Paket',
        description: 'Panduan upgrade dari Starter ke PRO atau ENTERPRISE.',
        category: 'billing',
        icon: 'upgrade',
        tags: ['upgrade', 'paket', 'langganan', 'subscription', 'billing'],
        relatedArticles: ['download-laporan'],
        content: `
## Upgrade Paket Langganan

Panduan lengkap untuk upgrade paket Warungin.

### Perbandingan Paket

| Fitur | Starter | PRO | Enterprise |
|-------|---------|-----|------------|
| Produk | 100 | 500 | Unlimited |
| User | 3 | 10 | Unlimited |
| Outlet | 1 | 5 | Unlimited |
| Laporan | Basic | Advanced | Custom |
| Support | Email | Priority | Dedicated |

### Cara Upgrade

1. Buka **Pengaturan > Subscription**
2. Klik **Upgrade Plan**
3. Pilih paket yang diinginkan
4. Pilih durasi (Bulanan / Tahunan)
5. Lakukan pembayaran
6. Fitur aktif otomatis

### Metode Pembayaran

- Bank Transfer (BCA, Mandiri, BNI, BRI)
- E-Wallet (GoPay, OVO, DANA)
- QRIS
- Credit Card

### Prorate Billing

Jika upgrade di tengah periode:
- Sisa hari di paket lama akan dihitung
- Anda hanya bayar selisihnya
- Contoh: Starter ke PRO di hari ke-15, bayar 50% selisih
    `
    }
];

// Helper function to get article by slug
export const getArticleBySlug = (slug: string): HelpArticle | undefined => {
    return helpArticles.find(article => article.slug === slug);
};

// Helper function to search articles
export const searchArticles = (query: string): HelpArticle[] => {
    const lowerQuery = query.toLowerCase();
    return helpArticles.filter(article =>
        article.title.toLowerCase().includes(lowerQuery) ||
        article.description.toLowerCase().includes(lowerQuery) ||
        article.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
};

// Helper function to get articles by category
export const getArticlesByCategory = (category: HelpArticle['category']): HelpArticle[] => {
    return helpArticles.filter(article => article.category === category);
};

// Helper function to get related articles
export const getRelatedArticles = (slug: string): HelpArticle[] => {
    const article = getArticleBySlug(slug);
    if (!article) return [];
    return article.relatedArticles
        .map(relatedSlug => getArticleBySlug(relatedSlug))
        .filter((a): a is HelpArticle => a !== undefined);
};
