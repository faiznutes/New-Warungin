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
              <li>• Advanced Analytics</li>
              <li>• Financial Management</li>
              <li>• Profit & Loss Report</li>
              <li>• AI/ML Features</li>
            </ul>
          </div>
          <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 class="font-semibold text-gray-900 mb-2">All Tenant Features</h4>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• Akses ke semua fitur tenant</li>
              <li>• Semua fitur kasir</li>
              <li>• Semua fitur dapur</li>
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
            <p class="text-sm text-gray-600">Mengelola toko dan operasional</p>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <div class="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 class="font-semibold text-gray-900 mb-2">Produk & Inventory</h4>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• Kelola produk</li>
              <li>• Product Adjustments</li>
              <li>• Suppliers</li>
              <li>• Purchase Orders</li>
              <li>• Stock Transfers</li>
              <li>• Stock Alerts</li>
            </ul>
          </div>
          <div class="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 class="font-semibold text-gray-900 mb-2">Orders & POS</h4>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• Kelola pesanan</li>
              <li>• Point of Sale (POS)</li>
              <li>• Delivery Orders</li>
            </ul>
          </div>
          <div class="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 class="font-semibold text-gray-900 mb-2">Customers & Members</h4>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• Kelola pelanggan</li>
              <li>• Member management</li>
            </ul>
          </div>
          <div class="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 class="font-semibold text-gray-900 mb-2">Reports & Analytics</h4>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• Laporan penjualan</li>
              <li>• Advanced Reporting (Addon)</li>
              <li>• Advanced Analytics (Addon)</li>
              <li>• Financial Management (Addon)</li>
              <li>• Profit & Loss (Addon)</li>
            </ul>
          </div>
          <div class="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 class="font-semibold text-gray-900 mb-2">Marketing</h4>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• Marketing Campaigns (Addon)</li>
              <li>• Email Templates (Addon)</li>
              <li>• Email Analytics (Addon)</li>
              <li>• Email Scheduler (Addon)</li>
              <li>• Customer Engagement (Addon)</li>
            </ul>
          </div>
          <div class="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 class="font-semibold text-gray-900 mb-2">Settings & Management</h4>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• Store Settings</li>
              <li>• User Management</li>
              <li>• Subscription</li>
              <li>• Addons</li>
              <li>• Rewards</li>
              <li>• Discounts</li>
              <li>• Receipt Templates</li>
              <li>• Stores (Multi-outlet)</li>
              <li>• 2FA Settings</li>
              <li>• Webhooks</li>
              <li>• Sessions</li>
              <li>• Password Settings</li>
              <li>• GDPR Settings</li>
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

