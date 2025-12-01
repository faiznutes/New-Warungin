<template>
  <div class="flex flex-col h-full bg-gradient-to-br from-gray-50 to-white">
    <!-- Header -->
    <div class="mb-6 px-4 sm:px-6">
      <div class="flex flex-col gap-2">
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">System Information</h2>
        <p class="text-sm sm:text-base text-gray-600">Informasi lengkap tentang fitur dan kemampuan sistem</p>
      </div>
    </div>

    <div class="px-4 sm:px-6 pb-6 space-y-6">
      <!-- Super Admin Features -->
      <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900">Super Admin</h3>
            <p class="text-sm text-gray-600">Akses penuh ke semua fitur sistem</p>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 class="font-semibold text-gray-900 mb-2">Tenant Management</h4>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• Kelola semua tenant</li>
              <li>• Tenant Support</li>
              <li>• Detail tenant</li>
            </ul>
          </div>
          <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 class="font-semibold text-gray-900 mb-2">System Settings</h4>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• System Settings</li>
              <li>• Archive Management</li>
              <li>• Retention Management</li>
              <li>• System Info</li>
            </ul>
          </div>
          <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 class="font-semibold text-gray-900 mb-2">Addon Management</h4>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• Kelola addon</li>
              <li>• Aktivasi/deaktivasi</li>
            </ul>
          </div>
          <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 class="font-semibold text-gray-900 mb-2">Reports</h4>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• Global Reports</li>
              <li>• Advanced Analytics</li>
            </ul>
          </div>
          <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 class="font-semibold text-gray-900 mb-2">Business Analytics</h4>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• Analitik Lanjutan</li>
              <li>• Manajemen Keuangan</li>
              <li>• Laporan Laba Rugi</li>
              <li>• Fitur AI/ML</li>
            </ul>
          </div>
          <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 class="font-semibold text-gray-900 mb-2">Semua Fitur Tenant</h4>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• Akses ke semua fitur tenant</li>
              <li>• Semua fitur kasir</li>
              <li>• Semua fitur dapur</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Subscription Tiers -->
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg border-2 border-blue-200 p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900">Paket Langganan</h3>
            <p class="text-sm text-gray-600">Paket langganan yang tersedia</p>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div class="p-4 bg-white rounded-lg border-2 border-gray-200">
            <h4 class="font-bold text-gray-900 mb-2">Basic</h4>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• 1 Outlet</li>
              <li>• 4 Pengguna (1 Admin + 2 Kasir + 1 Kitchen)</li>
              <li>• 25 Produk</li>
              <li>• Fitur dasar: Produk, Pesanan, Pelanggan, POS, Laporan Dasar</li>
            </ul>
          </div>
          <div class="p-4 bg-white rounded-lg border-2 border-primary-400">
            <h4 class="font-bold text-gray-900 mb-2">Pro ⭐</h4>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• 2 Outlet</li>
              <li>• 10 Pengguna (1 Admin + 1 Supervisor + 6 Kasir + 2 Kitchen)</li>
              <li>• 100 Produk</li>
              <li>• Semua fitur Basic + Inventory Management, Product Adjustments, Rewards & Discounts, User Management, Subscription & Addon Management, Advanced Receipt Templates</li>
            </ul>
          </div>
          <div class="p-4 bg-white rounded-lg border-2 border-indigo-400">
            <h4 class="font-bold text-gray-900 mb-2">Custom/Max 🔥</h4>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• Unlimited Outlet, Pengguna & Produk</li>
              <li>• Semua fitur Pro</li>
              <li>• Semua 9 Addons Premium</li>
              <li>• Dedicated Account Manager & Support 24/7</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Available Addons -->
      <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-lg border-2 border-purple-200 p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900">Addon Tersedia</h3>
            <p class="text-sm text-gray-600">9 addons premium yang dapat ditambahkan ke paket</p>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <div class="p-4 bg-white rounded-lg border border-purple-200">
            <h4 class="font-semibold text-gray-900 mb-2">Addon Sumber Daya</h4>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• Tambah Outlet (Rp 120rb/bulan)</li>
              <li>• Tambah Pengguna (Rp 50rb/5 user/bulan)</li>
              <li>• Tambah Produk (Rp 30rb/100 produk/bulan)</li>
            </ul>
          </div>
          <div class="p-4 bg-white rounded-lg border border-purple-200">
            <h4 class="font-semibold text-gray-900 mb-2">Pemasaran & Pengiriman <span class="text-xs text-yellow-600 font-normal">(Coming Soon)</span></h4>
              <ul class="text-sm text-gray-700 space-y-1">
                <li>• Pemasaran & Pengiriman (Rp 180rb/bulan)</li>
                <li>• Template Email, Analitik & Penjadwal</li>
                <li>• Alat Interaksi Pelanggan</li>
              </ul>
          </div>
          <div class="p-4 bg-white rounded-lg border border-purple-200">
            <h4 class="font-semibold text-gray-900 mb-2">Analitik & Laporan</h4>
              <ul class="text-sm text-gray-700 space-y-1">
                <li>• Analitik Bisnis & Wawasan (Rp 250rb/bulan)</li>
                <li>• Laporan Lanjutan (Rp 75rb/bulan)</li>
              </ul>
          </div>
          <div class="p-4 bg-white rounded-lg border border-purple-200">
            <h4 class="font-semibold text-gray-900 mb-2">Keuangan & Inventori</h4>
              <ul class="text-sm text-gray-700 space-y-1">
                <li>• Manajemen Keuangan (Rp 150rb/bulan) <span class="text-xs text-yellow-600">(Coming Soon)</span></li>
                <li>• Manajemen Inventori (Rp 100rb/bulan) <span class="text-xs text-yellow-600">(Coming Soon)</span></li>
              </ul>
          </div>
          <div class="p-4 bg-white rounded-lg border border-purple-200">
            <h4 class="font-semibold text-gray-900 mb-2">AI/ML & Lanjutan</h4>
              <ul class="text-sm text-gray-700 space-y-1">
                <li>• Fitur AI/ML (Rp 200rb/bulan) <span class="text-xs text-yellow-600">(Coming Soon)</span></li>
                <li>• Editor Struk Lanjutan (Rp 60rb/bulan)</li>
                <li>• Multi-Outlet Lanjutan (Rp 150rb/bulan)</li>
              </ul>
          </div>
        </div>
      </div>

      <!-- Admin Tenant Features -->
      <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900">Admin Tenant</h3>
            <p class="text-sm text-gray-600">Mengelola toko dan operasional (berdasarkan tier & addons)</p>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <div class="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 class="font-semibold text-gray-900 mb-2">Produk & Inventory</h4>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• Kelola produk (Semua tier)</li>
              <li>• Product Adjustments (Pro, Custom/Max)</li>
              <li>• Pemasok (Pro, Custom/Max, atau Addon Manajemen Inventori) <span class="text-xs text-yellow-600">(Coming Soon)</span></li>
              <li>• Pesanan Pembelian (Pro, Custom/Max, atau Addon Manajemen Inventori) <span class="text-xs text-yellow-600">(Coming Soon)</span></li>
              <li>• Transfer Stok (Pro, Custom/Max, atau Addon Manajemen Inventori) <span class="text-xs text-yellow-600">(Coming Soon)</span></li>
              <li>• Peringatan Stok (Pro, Custom/Max, atau Addon Manajemen Inventori) <span class="text-xs text-yellow-600">(Coming Soon)</span></li>
            </ul>
          </div>
          <div class="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 class="font-semibold text-gray-900 mb-2">Orders & POS</h4>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• Kelola pesanan (Semua tier)</li>
              <li>• Point of Sale (POS) (Semua tier)</li>
              <li>• Pesanan Pengiriman (Pro, Custom/Max, atau Addon Pemasaran & Pengiriman) <span class="text-xs text-yellow-600">(Coming Soon)</span></li>
            </ul>
          </div>
          <div class="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 class="font-semibold text-gray-900 mb-2">Pelanggan & Member</h4>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• Kelola pelanggan</li>
              <li>• Manajemen member</li>
            </ul>
          </div>
          <div class="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 class="font-semibold text-gray-900 mb-2">Laporan & Analitik</h4>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• Laporan penjualan (Semua tier)</li>
              <li>• Laporan Lanjutan (Pro, Custom/Max, atau Addon Laporan Lanjutan)</li>
              <li>• Analitik Lanjutan (Pro, Custom/Max, atau Addon Analitik Bisnis)</li>
              <li>• Manajemen Keuangan (Pro, Custom/Max, atau Addon Manajemen Keuangan) <span class="text-xs text-yellow-600">(Coming Soon)</span></li>
              <li>• Laba Rugi (Pro, Custom/Max, atau Addon Analitik Bisnis)</li>
              <li>• Fitur AI/ML (Custom/Max, atau Addon Fitur AI/ML) <span class="text-xs text-yellow-600">(Coming Soon)</span></li>
            </ul>
          </div>
          <div class="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 class="font-semibold text-gray-900 mb-2">Pemasaran <span class="text-xs text-yellow-600 font-normal">(Coming Soon)</span></h4>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• Kampanye Pemasaran (Pro, Custom/Max, atau Addon Pemasaran & Pengiriman)</li>
              <li>• Template Email (Pro, Custom/Max, atau Addon Pemasaran & Pengiriman)</li>
              <li>• Analitik Email (Pro, Custom/Max, atau Addon Pemasaran & Pengiriman)</li>
              <li>• Penjadwal Email (Pro, Custom/Max, atau Addon Pemasaran & Pengiriman)</li>
              <li>• Interaksi Pelanggan (Pro, Custom/Max, atau Addon Pemasaran & Pengiriman)</li>
            </ul>
          </div>
          <div class="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 class="font-semibold text-gray-900 mb-2">Pengaturan & Manajemen</h4>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• Store Settings (Semua tier)</li>
              <li>• User Management (Pro, Custom/Max, atau User Management Addon)</li>
              <li>• Subscription (Pro, Custom/Max, atau Subscription Management Addon)</li>
              <li>• Addons (Pro, Custom/Max, atau Addon Management Addon)</li>
              <li>• Rewards (Pro, Custom/Max, atau Rewards Management Addon)</li>
              <li>• Discounts (Pro, Custom/Max, atau Discount Management Addon)</li>
              <li>• Receipt Templates (Pro, Custom/Max, atau Advanced Receipt Editor Addon)</li>
              <li>• Stores (Multi-outlet) (Pro, Custom/Max, atau Multi-Outlet Advanced Addon)</li>
              <li>• 2FA Settings (Semua tier)</li>
              <li>• Webhooks (Pro, Custom/Max)</li>
              <li>• Sessions (Semua tier)</li>
              <li>• Password Settings (Semua tier)</li>
              <li>• GDPR Settings (Semua tier)</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Kasir Features -->
      <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900">Kasir (CASHIER)</h3>
            <p class="text-sm text-gray-600">Operasional kasir dan transaksi</p>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <div class="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h4 class="font-semibold text-gray-900 mb-2">Point of Sale</h4>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• Transaksi penjualan</li>
              <li>• Pilih produk</li>
              <li>• Keranjang belanja</li>
              <li>• Pembayaran (Cash/QRIS/Transfer)</li>
              <li>• Cetak struk</li>
              <li>• Kirim ke dapur</li>
            </ul>
          </div>
          <div class="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h4 class="font-semibold text-gray-900 mb-2">Produk (Conditional)</h4>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• Lihat produk (jika ada permission)</li>
              <li>• Kelola produk (jika ada permission)</li>
            </ul>
          </div>
          <div class="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h4 class="font-semibold text-gray-900 mb-2">Pesanan (Conditional)</h4>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• Lihat pesanan (jika ada permission)</li>
              <li>• Edit pesanan (jika ada permission)</li>
            </ul>
          </div>
          <div class="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h4 class="font-semibold text-gray-900 mb-2">Pelanggan (Conditional)</h4>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• Lihat pelanggan (jika ada permission)</li>
              <li>• Kelola pelanggan (jika ada permission)</li>
            </ul>
          </div>
          <div class="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h4 class="font-semibold text-gray-900 mb-2">Laporan (Conditional)</h4>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• Lihat laporan (jika ada permission)</li>
            </ul>
          </div>
          <div class="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h4 class="font-semibold text-gray-900 mb-2">Dashboard</h4>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• Dashboard kasir</li>
              <li>• Statistik penjualan</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Kitchen Features -->
      <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900">Dapur (KITCHEN)</h3>
            <p class="text-sm text-gray-600">Kelola pesanan dari kasir</p>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div class="p-4 bg-red-50 rounded-lg border border-red-200">
            <h4 class="font-semibold text-gray-900 mb-2">Pesanan Masuk</h4>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• Lihat pesanan dari kasir</li>
              <li>• Update status pesanan</li>
              <li>• Bulk update status</li>
              <li>• Status: PENDING → COOKING → READY → SERVED</li>
            </ul>
          </div>
          <div class="p-4 bg-red-50 rounded-lg border border-red-200">
            <h4 class="font-semibold text-gray-900 mb-2">Dashboard</h4>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• Dashboard kitchen</li>
              <li>• Notifikasi pesanan baru</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Data Retention Info -->
      <div class="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl shadow-lg border-2 border-purple-200 p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900">Data Retention Policy</h3>
            <p class="text-sm text-gray-600">Kebijakan penyimpanan data</p>
          </div>
        </div>
        <div class="mt-4 space-y-3">
          <div class="p-4 bg-white rounded-lg border border-purple-200">
            <h4 class="font-semibold text-gray-900 mb-2">Masa Penyimpanan Data</h4>
            <p class="text-sm text-gray-700">Data disimpan maksimal <span class="font-bold text-purple-600">2 tahun</span> ke belakang dari tanggal saat ini.</p>
          </div>
          <div class="p-4 bg-white rounded-lg border border-purple-200">
            <h4 class="font-semibold text-gray-900 mb-2">Laporan Per Tahun</h4>
            <p class="text-sm text-gray-700">Sistem mendukung laporan per tahun untuk memudahkan analisis data historis.</p>
          </div>
          <div class="p-4 bg-yellow-50 rounded-lg border border-yellow-300">
            <h4 class="font-semibold text-gray-900 mb-2">⚠️ Archive Management</h4>
            <p class="text-sm text-gray-700">Fitur Archive Management saat ini <span class="font-bold text-yellow-700">tidak diaktifkan</span>. Hanya Super Admin yang dapat mengakses fitur ini.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// System Info view - no additional logic needed
</script>

