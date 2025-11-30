<template>
  <div class="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
    <!-- Tab Navigation -->
    <div class="border-b border-gray-200 bg-gray-50">
      <div class="flex overflow-x-auto scrollbar-hide scroll-smooth" role="tablist" aria-label="Fitur demo Warungin">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          type="button"
          :aria-label="`Buka tab ${tab.label}`"
          :aria-selected="activeTab === tab.id"
          role="tab"
          :class="[
            'px-3 sm:px-4 md:px-6 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 sm:gap-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            activeTab === tab.id
              ? 'border-primary-600 text-primary-600 bg-white'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          <component :is="tab.icon" class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span class="hidden sm:inline">{{ tab.label }}</span>
          <span class="sm:hidden">{{ tab.labelShort || tab.label }}</span>
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="p-4 sm:p-6 min-h-[400px] sm:min-h-[500px] bg-gray-50">
      <!-- Dashboard Tab -->
      <div v-if="activeTab === 'dashboard'" class="space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-600">Total Penjualan</span>
              <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p class="text-2xl font-bold text-gray-900">Rp 12.450.000</p>
            <p class="text-xs text-gray-500 mt-1">Bulan ini</p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-600">Total Transaksi</span>
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <p class="text-2xl font-bold text-gray-900">342</p>
            <p class="text-xs text-gray-500 mt-1">Bulan ini</p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-600">Total Produk</span>
              <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <p class="text-2xl font-bold text-gray-900">156</p>
            <p class="text-xs text-gray-500 mt-1">Aktif</p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-600">Total Pelanggan</span>
              <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p class="text-2xl font-bold text-gray-900">89</p>
            <p class="text-xs text-gray-500 mt-1">Terdaftar</p>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Grafik Penjualan (Demo)</h3>
          <div class="h-64 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg flex items-center justify-center">
            <div class="text-center">
              <svg class="w-16 h-16 text-primary-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p class="text-gray-600 font-medium">Grafik Penjualan Real-time</p>
              <p class="text-sm text-gray-500 mt-1">Tersedia di versi lengkap</p>
            </div>
          </div>
        </div>
      </div>

      <!-- POS Tab -->
      <div v-if="activeTab === 'pos'" class="space-y-4">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <!-- Product Grid -->
          <div class="lg:col-span-2 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Pilih Produk</h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <button
                v-for="product in demoProducts"
                :key="product.id"
                @click="addToCart(product)"
                type="button"
                :aria-label="`Tambahkan ${product.name} ke keranjang`"
                class="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-primary-50 hover:border-primary-300 border-2 border-gray-200 transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                :class="{ 'border-primary-500 bg-primary-50': isInCart(product.id) }"
              >
                <div class="text-center">
                  <div class="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <span class="text-2xl">{{ product.emoji }}</span>
                  </div>
                  <h4 class="font-medium text-sm text-gray-900 mb-1">{{ product.name }}</h4>
                  <p class="text-sm font-semibold text-primary-600">{{ formatCurrency(product.price) }}</p>
                </div>
              </button>
            </div>
          </div>
          <!-- Cart -->
          <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Keranjang</h3>
            <div v-if="cart.length === 0" class="text-center py-8 text-gray-400">
              <svg class="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p class="text-sm">Klik produk untuk menambah ke keranjang</p>
              <p class="text-xs mt-1 text-gray-400">Demo Mode - Login untuk transaksi penuh</p>
            </div>
            <div v-else class="space-y-2 mb-4 max-h-64 overflow-y-auto scrollbar-thin">
              <div
                v-for="item in cart"
                :key="item.id"
                class="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">{{ item.name }}</p>
                  <p class="text-xs text-gray-600">{{ formatCurrency(item.price) }} × {{ item.quantity }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-semibold text-gray-900">{{ formatCurrency(item.price * item.quantity) }}</p>
                  <button
                    @click="removeFromCart(item.id)"
                    type="button"
                    :aria-label="`Hapus ${item.name} dari keranjang`"
                    class="text-xs text-red-600 hover:text-red-800 mt-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
            <div v-if="cart.length > 0" class="border-t border-gray-200 pt-4 space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Subtotal:</span>
                <span class="font-semibold text-gray-900">{{ formatCurrency(cartTotal) }}</span>
              </div>
              <button
                class="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold opacity-75 cursor-not-allowed"
                disabled
                title="Demo Mode - Login untuk transaksi penuh"
              >
                Bayar (Demo Mode)
              </button>
              <p class="text-xs text-center text-gray-500 mt-1">Login untuk transaksi penuh</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Products Tab -->
      <div v-if="activeTab === 'products'" class="space-y-4">
        <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Daftar Produk</h3>
            <button 
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium opacity-75 cursor-not-allowed" 
              disabled
              title="Demo Mode - Login untuk fitur penuh"
            >
              + Tambah Produk
            </button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="product in demoProducts"
              :key="product.id"
              class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div class="text-center mb-3">
                <div class="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <span class="text-3xl">{{ product.emoji }}</span>
                </div>
                <h4 class="font-semibold text-gray-900 mb-1">{{ product.name }}</h4>
                <p class="text-lg font-bold text-primary-600 mb-2">{{ formatCurrency(product.price) }}</p>
                <div class="flex items-center justify-center gap-4 text-sm text-gray-600">
                  <span>Stok: {{ product.stock }}</span>
                  <span>Kategori: {{ product.category }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Reports Tab -->
      <div v-if="activeTab === 'reports'" class="space-y-4">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div class="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Laporan Penjualan</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p class="font-medium text-gray-900">Hari Ini</p>
                  <p class="text-sm text-gray-600">15 transaksi</p>
                </div>
                <p class="text-lg font-bold text-primary-600">Rp 1.250.000</p>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p class="font-medium text-gray-900">Minggu Ini</p>
                  <p class="text-sm text-gray-600">98 transaksi</p>
                </div>
                <p class="text-lg font-bold text-primary-600">Rp 8.450.000</p>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p class="font-medium text-gray-900">Bulan Ini</p>
                  <p class="text-sm text-gray-600">342 transaksi</p>
                </div>
                <p class="text-lg font-bold text-primary-600">Rp 12.450.000</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Produk Terlaris</h3>
            <div class="space-y-3">
              <div
                v-for="(item, index) in topProducts"
                :key="index"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span class="text-xl">{{ item.emoji }}</span>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ item.name }}</p>
                    <p class="text-sm text-gray-600">{{ item.sold }} terjual</p>
                  </div>
                </div>
                <p class="text-lg font-bold text-primary-600">{{ formatCurrency(item.revenue) }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Export Laporan</h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button 
              class="px-4 py-3 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition text-sm font-medium text-green-700 opacity-75 cursor-not-allowed" 
              disabled
              title="Demo Mode - Login untuk export"
            >
              Export Excel
            </button>
            <button 
              class="px-4 py-3 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 transition text-sm font-medium text-red-700 opacity-75 cursor-not-allowed" 
              disabled
              title="Demo Mode - Login untuk export"
            >
              Export PDF
            </button>
            <button 
              class="px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition text-sm font-medium text-blue-700 opacity-75 cursor-not-allowed" 
              disabled
              title="Demo Mode - Login untuk export"
            >
              Export CSV
            </button>
          </div>
          <p class="text-xs text-center text-gray-500 mt-3">Login untuk export laporan penuh</p>
        </div>
      </div>

      <!-- Customers Tab -->
      <div v-if="activeTab === 'customers'" class="space-y-4">
        <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Daftar Pelanggan</h3>
            <button 
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium opacity-75 cursor-not-allowed" 
              disabled
              title="Demo Mode - Login untuk fitur penuh"
            >
              + Tambah Pelanggan
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200" aria-label="Daftar pelanggan demo">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telepon</th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Belanja</th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Points</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="customer in demoCustomers" :key="customer.id" class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ customer.name }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ customer.email }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ customer.phone }}</td>
                  <td class="px-4 py-3 text-sm text-gray-900">{{ formatCurrency(customer.totalSpent) }}</td>
                  <td class="px-4 py-3 text-sm text-primary-600 font-semibold">{{ customer.points }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue';
import { formatCurrency } from '../utils/formatters';

const activeTab = ref('dashboard');

interface DemoProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  emoji: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  emoji: string;
}

interface DemoCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSpent: number;
  points: number;
}

const demoProducts: DemoProduct[] = [
  { id: '1', name: 'Nasi Goreng', price: 15000, stock: 45, category: 'Makanan', emoji: '🍛' },
  { id: '2', name: 'Mie Ayam', price: 12000, stock: 32, category: 'Makanan', emoji: '🍜' },
  { id: '3', name: 'Es Teh Manis', price: 5000, stock: 100, category: 'Minuman', emoji: '🧋' },
  { id: '4', name: 'Kopi Hitam', price: 8000, stock: 75, category: 'Minuman', emoji: '☕' },
  { id: '5', name: 'Gado-gado', price: 18000, stock: 25, category: 'Makanan', emoji: '🥗' },
  { id: '6', name: 'Sate Ayam', price: 25000, stock: 20, category: 'Makanan', emoji: '🍢' },
];

const demoCustomers: DemoCustomer[] = [
  { id: '1', name: 'Budi Santoso', email: 'budi@example.com', phone: '081234567890', totalSpent: 450000, points: 450 },
  { id: '2', name: 'Siti Nurhaliza', email: 'siti@example.com', phone: '081234567891', totalSpent: 320000, points: 320 },
  { id: '3', name: 'Ahmad Fauzi', email: 'ahmad@example.com', phone: '081234567892', totalSpent: 280000, points: 280 },
  { id: '4', name: 'Dewi Sartika', email: 'dewi@example.com', phone: '081234567893', totalSpent: 195000, points: 195 },
];

const topProducts = [
  { name: 'Nasi Goreng', emoji: '🍛', sold: 125, revenue: 1875000 },
  { name: 'Mie Ayam', emoji: '🍜', sold: 98, revenue: 1176000 },
  { name: 'Es Teh Manis', emoji: '🧋', sold: 245, revenue: 1225000 },
  { name: 'Kopi Hitam', emoji: '☕', sold: 156, revenue: 1248000 },
];

const cart = ref<CartItem[]>([]);

const tabs = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    labelShort: 'Dashboard',
    icon: () => h('svg', { class: 'w-4 h-4 sm:w-5 sm:h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' })
    ])
  },
  {
    id: 'pos',
    label: 'POS',
    labelShort: 'POS',
    icon: () => h('svg', { class: 'w-4 h-4 sm:w-5 sm:h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' })
    ])
  },
  {
    id: 'products',
    label: 'Produk',
    labelShort: 'Produk',
    icon: () => h('svg', { class: 'w-4 h-4 sm:w-5 sm:h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' })
    ])
  },
  {
    id: 'reports',
    label: 'Laporan',
    labelShort: 'Laporan',
    icon: () => h('svg', { class: 'w-4 h-4 sm:w-5 sm:h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' })
    ])
  },
  {
    id: 'customers',
    label: 'Pelanggan',
    labelShort: 'Customer',
    icon: () => h('svg', { class: 'w-4 h-4 sm:w-5 sm:h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' })
    ])
  },
];

const isInCart = (productId: string) => {
  return cart.value.some(item => item.id === productId);
};

const addToCart = (product: DemoProduct) => {
  const existingItem = cart.value.find(item => item.id === product.id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.value.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      emoji: product.emoji,
    });
  }
};

const removeFromCart = (productId: string) => {
  const index = cart.value.findIndex(item => item.id === productId);
  if (index > -1) {
    cart.value.splice(index, 1);
  }
};

const cartTotal = computed(() => {
  return cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 transparent;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background-color: #a0aec0;
}
</style>

