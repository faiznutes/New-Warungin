<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <div class="bg-white rounded-lg shadow-sm p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Informasi Sistem</h1>
      
      <!-- Accordion Groups -->
      <div class="space-y-4">
        <!-- Frontend & Backend Info -->
        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <button
            @click="toggleAccordion('tech')"
            class="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
          >
            <span class="font-semibold text-gray-900">Teknologi yang Terinstall</span>
            <svg
              class="w-5 h-5 transition-transform duration-200"
              :class="{ 'rotate-180': openAccordion === 'tech' }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-show="openAccordion === 'tech'" class="px-6 py-4 border-t border-gray-200">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 class="font-semibold text-gray-800 mb-3">Frontend</h3>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li><strong>Framework:</strong> Vue.js 3.3.4</li>
                  <li><strong>Router:</strong> Vue Router 4.2.5</li>
                  <li><strong>State Management:</strong> Pinia 2.1.7</li>
                  <li><strong>UI Components:</strong> Headless UI, Heroicons</li>
                  <li><strong>Charts:</strong> Chart.js 4.4.0, Vue Chart.js</li>
                  <li><strong>Build Tool:</strong> Vite 6.4.1</li>
                  <li><strong>Styling:</strong> Tailwind CSS 3.4.0</li>
                  <li><strong>PDF:</strong> jsPDF 3.0.3</li>
                  <li><strong>Date:</strong> date-fns 3.0.6</li>
                </ul>
              </div>
              <div>
                <h3 class="font-semibold text-gray-800 mb-3">Backend</h3>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li><strong>Runtime:</strong> Node.js 18</li>
                  <li><strong>Framework:</strong> Express.js 4.18.2</li>
                  <li><strong>Database:</strong> PostgreSQL 15 (Prisma ORM 6.19.0)</li>
                  <li><strong>Cache:</strong> Redis 7</li>
                  <li><strong>Authentication:</strong> JWT (jsonwebtoken 9.0.2)</li>
                  <li><strong>Validation:</strong> Zod 3.22.4, Express Validator</li>
                  <li><strong>Payment:</strong> Midtrans Client 1.4.3</li>
                  <li><strong>Email:</strong> Nodemailer 6.9.7</li>
                  <li><strong>Queue:</strong> BullMQ 5.0.0</li>
                  <li><strong>WebSocket:</strong> Socket.io 4.8.1</li>
                  <li><strong>Monitoring:</strong> Prometheus Client 15.1.0</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Docker Services -->
        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <button
            @click="toggleAccordion('docker')"
            class="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
          >
            <span class="font-semibold text-gray-900">Docker Services & Penggunaan</span>
            <svg
              class="w-5 h-5 transition-transform duration-200"
              :class="{ 'rotate-180': openAccordion === 'docker' }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-show="openAccordion === 'docker'" class="px-6 py-4 border-t border-gray-200">
            <div class="space-y-4">
              <div>
                <h3 class="font-semibold text-gray-800 mb-2">PostgreSQL Database</h3>
                <p class="text-sm text-gray-600">Database utama untuk menyimpan semua data aplikasi. Menggunakan Prisma ORM untuk manajemen schema dan migrasi.</p>
              </div>
              <div>
                <h3 class="font-semibold text-gray-800 mb-2">Redis Cache</h3>
                <p class="text-sm text-gray-600">Cache layer untuk meningkatkan performa. Digunakan untuk session management, rate limiting, dan caching data yang sering diakses.</p>
              </div>
              <div>
                <h3 class="font-semibold text-gray-800 mb-2">Backend Service</h3>
                <p class="text-sm text-gray-600">API server yang menangani semua logika bisnis. Resource limit: 4 CPU, 4GB RAM. Health check setiap 10 detik.</p>
              </div>
              <div>
                <h3 class="font-semibold text-gray-800 mb-2">Frontend Service</h3>
                <p class="text-sm text-gray-600">Web application yang di-build dengan Vite dan di-serve menggunakan Nginx. Health check setiap 30 detik.</p>
              </div>
              <div>
                <h3 class="font-semibold text-gray-800 mb-2">Nginx Reverse Proxy</h3>
                <p class="text-sm text-gray-600">Reverse proxy dan load balancer. Menangani routing, SSL termination, dan static file serving. Resource limit: 2 CPU, 1GB RAM.</p>
              </div>
              <div>
                <h3 class="font-semibold text-gray-800 mb-2">Cloudflared Tunnel</h3>
                <p class="text-sm text-gray-600">Cloudflare Tunnel untuk public access tanpa expose port langsung. Menggunakan Cloudflare Zero Trust untuk security.</p>
              </div>
              <div>
                <h3 class="font-semibold text-gray-800 mb-2">Monitoring Services (Optional)</h3>
                <p class="text-sm text-gray-600">Prometheus untuk metrics collection, Grafana untuk visualization, Loki untuk log aggregation, dan Promtail untuk log shipping.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Features by Role -->
        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <button
            @click="toggleAccordion('features')"
            class="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
          >
            <span class="font-semibold text-gray-900">Fitur per Role</span>
            <svg
              class="w-5 h-5 transition-transform duration-200"
              :class="{ 'rotate-180': openAccordion === 'features' }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-show="openAccordion === 'features'" class="px-6 py-4 border-t border-gray-200">
            <div class="space-y-6">
              <div>
                <h3 class="font-semibold text-blue-800 mb-3">Super Admin</h3>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li>• Dashboard Super Admin dengan statistik global</li>
                  <li>• Manajemen Tenant (tambah, edit, hapus, aktivasi)</li>
                  <li>• Manajemen Addon untuk semua tenant</li>
                  <li>• Laporan Global semua tenant</li>
                  <li>• Kelola Pesan dari contact form</li>
                  <li>• System Settings (konfigurasi aplikasi)</li>
                  <li>• Archive Management (arsip data)</li>
                  <li>• Retention Management (retensi data)</li>
                  <li>• Backup Management (backup database)</li>
                  <li>• Server Monitor (monitoring Docker containers & resources)</li>
                  <li>• Advanced Analytics (untuk semua tenant)</li>
                  <li>• Financial Management (untuk semua tenant)</li>
                </ul>
              </div>
              <div>
                <h3 class="font-semibold text-green-800 mb-3">Admin Tenant</h3>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li>• Dashboard dengan statistik toko</li>
                  <li>• Manajemen Produk (tambah, edit, hapus, import massal)</li>
                  <li>• Manajemen Pesanan (lihat, edit, cancel, complete)</li>
                  <li>• Manajemen Pelanggan</li>
                  <li>• Manajemen Pengguna (tambah, edit, hapus user)</li>
                  <li>• Manajemen Store/Outlet</li>
                  <li>• Manajemen Diskon</li>
                  <li>• Laporan Penjualan & Stok</li>
                  <li>• Berlangganan & Addon Management</li>
                  <li>• Point Gratis (reward points)</li>
                  <li>• Pengaturan Toko</li>
                  <li>• Template Struk</li>
                  <li>• Inventory Management (PRO/ENTERPRISE): Suppliers, Purchase Orders, Stock Transfers, Stock Alerts</li>
                  <li>• Marketing & Delivery (dengan addon): Campaigns, Email Templates, Email Analytics, Email Scheduler, Customer Engagement, Delivery Orders</li>
                  <li>• Business Analytics (dengan addon): Advanced Analytics, Financial Management, Profit & Loss Report</li>
                  <li>• Advanced Reporting (dengan addon)</li>
                  <li>• Export Reports (dengan addon): PDF, Excel, CSV</li>
                  <li>• Receipt Editor (dengan addon): Custom nota</li>
                </ul>
              </div>
              <div>
                <h3 class="font-semibold text-purple-800 mb-3">Supervisor</h3>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li>• Dashboard dengan statistik cabang yang ditugaskan</li>
                  <li>• Lihat Produk (hanya cabang yang ditugaskan)</li>
                  <li>• Lihat Pesanan (hanya cabang yang ditugaskan)</li>
                  <li>• Lihat Pelanggan</li>
                  <li>• Laporan (hanya cabang yang ditugaskan)</li>
                  <li>• Point Gratis (reward points)</li>
                  <li>• Business Analytics (dengan addon): Advanced Analytics, Financial Management</li>
                  <li>• Advanced Reporting (dengan addon)</li>
                  <li>• Marketing & Delivery (dengan addon): Delivery Orders</li>
                  <li><strong>Catatan:</strong> Supervisor memerlukan addon SUPERVISOR_ROLE untuk dapat dibuat/ditugaskan</li>
                </ul>
              </div>
              <div>
                <h3 class="font-semibold text-orange-800 mb-3">Kasir</h3>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li>• Dashboard dengan statistik penjualan</li>
                  <li>• Point of Sale (POS) - transaksi penjualan</li>
                  <li>• Cash Shift Management</li>
                  <li>• Lihat Pesanan (sesuai permission)</li>
                  <li>• Lihat Produk (sesuai permission)</li>
                  <li>• Lihat Pelanggan (sesuai permission)</li>
                  <li>• Lihat Laporan (sesuai permission)</li>
                </ul>
              </div>
              <div>
                <h3 class="font-semibold text-red-800 mb-3">Dapur</h3>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li>• Kitchen Orders - manajemen pesanan dapur</li>
                  <li>• Update status pesanan (preparing, ready, completed)</li>
                  <li>• Lihat detail pesanan</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Subscription Plans -->
        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <button
            @click="toggleAccordion('plans')"
            class="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
          >
            <span class="font-semibold text-gray-900">Paket Subscription</span>
            <svg
              class="w-5 h-5 transition-transform duration-200"
              :class="{ 'rotate-180': openAccordion === 'plans' }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-show="openAccordion === 'plans'" class="px-6 py-4 border-t border-gray-200">
            <div class="space-y-6">
              <div>
                <h3 class="font-semibold text-gray-800 mb-3">BASIC (Starter)</h3>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li>• <strong>Produk:</strong> 30 produk</li>
                  <li>• <strong>User:</strong> 4 user (1 admin + 2 kasir + 1 kitchen)</li>
                  <li>• <strong>Outlet:</strong> 1 outlet</li>
                  <li>• <strong>Akses:</strong> Kasir, Laporan</li>
                  <li>• <strong>Addon Included:</strong> Receipt Basic</li>
                </ul>
              </div>
              <div>
                <h3 class="font-semibold text-gray-800 mb-3">PRO (Boost)</h3>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li>• <strong>Produk:</strong> 200 produk</li>
                  <li>• <strong>User:</strong> 10 user (1 admin + 1 supervisor + 6 kasir + 2 kitchen)</li>
                  <li>• <strong>Outlet:</strong> 2 outlet</li>
                  <li>• <strong>Akses:</strong> Kasir, Laporan, Manajemen Stok, Addon Management</li>
                  <li>• <strong>Addon Included:</strong> Receipt Advanced, Multi-Outlet</li>
                </ul>
              </div>
              <div>
                <h3 class="font-semibold text-gray-800 mb-3">ENTERPRISE (Pro)</h3>
                <ul class="space-y-2 text-gray-600">
                  <li>• <strong>Produk:</strong> 1000 produk</li>
                  <li>• <strong>User:</strong> 20 user</li>
                  <li>• <strong>Outlet:</strong> 3 outlet</li>
                  <li>• <strong>Akses:</strong> Semua fitur</li>
                  <li>• <strong>Addon Included:</strong> Receipt Advanced, Multi-Outlet</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Addons -->
        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <button
            @click="toggleAccordion('addons')"
            class="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
          >
            <span class="font-semibold text-gray-900">Addons yang Tersedia</span>
            <svg
              class="w-5 h-5 transition-transform duration-200"
              :class="{ 'rotate-180': openAccordion === 'addons' }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-show="openAccordion === 'addons'" class="px-6 py-4 border-t border-gray-200">
            <div class="space-y-6">
              <div>
                <h3 class="font-semibold text-gray-800 mb-3">Addon dengan Limit (Unlimited Purchase)</h3>
                <ul class="space-y-3 text-sm text-gray-600">
                  <li>
                    <strong>Tambah Outlet</strong> - Rp 120.000<br>
                    Tambahkan 1 outlet/cabang baru. Dapat dibeli berulang kali.
                  </li>
                  <li>
                    <strong>Tambah Pengguna</strong> - Rp 50.000<br>
                    Tambahkan 5 pengguna baru. Dapat dibeli berulang kali.
                  </li>
                  <li>
                    <strong>Tambah Produk</strong> - Rp 30.000<br>
                    Tambahkan 100 produk baru. Dapat dibeli berulang kali.
                  </li>
                </ul>
              </div>
              <div>
                <h3 class="font-semibold text-gray-800 mb-3">Addon Feature (Limited Purchase)</h3>
                <ul class="space-y-3 text-sm text-gray-600">
                  <li>
                    <strong>Business Analytics & Insight</strong> - Rp 250.000<br>
                    Laporan Laba Rugi, Prediksi Penjualan, Advanced Analytics, Financial Management
                  </li>
                  <li>
                    <strong>Export Laporan</strong> - Rp 75.000<br>
                    Export laporan ke Excel, PDF, CSV dengan tanda tangan digital
                  </li>
                  <li>
                    <strong>Simple Nota Editor</strong> - Rp 50.000<br>
                    Kustomisasi tampilan nota dengan logo dan pesan custom
                  </li>
                  <li>
                    <strong>Delivery & Marketing</strong> - Rp 150.000<br>
                    Manajemen pesanan delivery, kampanye email, SMS marketing, customer engagement
                  </li>
                  <li>
                    <strong>Restock Suggestion</strong> - Rp 50.000<br>
                    Saran restock otomatis berdasarkan pola penjualan
                  </li>
                  <li>
                    <strong>Transfer Stok Antar Store</strong> - Rp 80.000<br>
                    Transfer stok antar store dengan validasi otomatis
                  </li>
                  <li>
                    <strong>Supervisor Role</strong> - Rp 60.000<br>
                    Role khusus supervisor cabang dengan akses terbatas
                  </li>
                  <li>
                    <strong>Price Recommendation Plus</strong> - Rp 40.000<br>
                    Rekomendasi harga dengan margin custom
                  </li>
                  <li>
                    <strong>Import Massal</strong> - Rp 100.000<br>
                    Import massal produk, stok, dan pelanggan dari Excel/CSV
                  </li>
                </ul>
              </div>
              <div>
                <h3 class="font-semibold text-gray-800 mb-3">Addon API (Coming Soon)</h3>
                <ul class="space-y-3 text-sm text-gray-600">
                  <li>
                    <strong>Integrasi E-commerce</strong> - Rp 200.000<br>
                    Integrasi dengan Shopee, Tokopedia, Bukalapak (Coming Soon)
                  </li>
                  <li>
                    <strong>Integrasi Payment & Accounting</strong> - Rp 250.000<br>
                    Integrasi payment gateway (OVO, DANA, LinkAja) dan software akuntansi (Coming Soon)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const openAccordion = ref<string | null>(null);

const toggleAccordion = (key: string) => {
  if (openAccordion.value === key) {
    openAccordion.value = null;
  } else {
    openAccordion.value = key;
  }
};
</script>

