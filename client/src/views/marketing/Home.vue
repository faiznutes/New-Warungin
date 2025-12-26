<template>
  <div class="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-display">
    
    <!-- Hero Section -->
    <section class="relative pt-20 pb-32 overflow-hidden">
      <!-- Background Gradients -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50"></div>
        <div class="absolute top-1/2 -left-24 w-72 h-72 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div class="container mx-auto px-4 relative z-10">
        <div class="flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-primary text-xs font-bold uppercase tracking-wider mb-6">
            <span class="material-symbols-outlined text-sm">rocket_launch</span>
            Sistem Kasir v3.0
          </div>
          
          <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.1]">
            Kelola Warung & Toko <br/>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Lebih Mudah & Modern</span>
          </h1>
          
          <p class="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Sistem kasir lengkap untuk UMKM. Transaksi, inventori, dan laporan penjualan dalam satu dashboard. Tanpa ribet, langsung jalan.
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <router-link
              to="/pricing"
              class="px-8 py-4 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-500/20 transition-all transform hover:scale-105"
            >
              Mulai Gratis 14 Hari
            </router-link>
            <router-link
              to="/demo"
              class="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <span class="material-symbols-outlined">play_circle</span>
              Lihat Demo
            </router-link>
          </div>
          
          <div class="mt-8 flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-green-500 text-[18px]">check_circle</span>
              Tanpa Kartu Kredit
            </div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-green-500 text-[18px]">check_circle</span>
              Setup Instan
            </div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-green-500 text-[18px]">check_circle</span>
              Support 24/7
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="py-20 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Kenapa Warungin?</h2>
          <p class="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
            Fitur lengkap yang didesain khusus untuk kebutuhan warung, toko kelontong, dan UMKM makanan.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <!-- Feature 1 -->
          <div class="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all group">
            <div class="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined text-primary text-3xl">point_of_sale</span>
            </div>
            <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-3">Kasir Cepat</h3>
            <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
              Proses transaksi hitungan detik. Scan barcode, pilih item, cetak struk. Mendukung pembayaran cash & QRIS.
            </p>
          </div>

          <!-- Feature 2 -->
          <div class="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all group">
            <div class="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined text-purple-500 text-3xl">inventory_2</span>
            </div>
            <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-3">Stok Otomatis</h3>
            <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
              Stok berkurang otomatis saat terjual. Dapatkan notifikasi saat barang hampir habis. Atur HPP dan harga jual mudah.
            </p>
          </div>

          <!-- Feature 3 -->
          <div class="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all group">
            <div class="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined text-green-500 text-3xl">monitoring</span>
            </div>
            <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-3">Laporan Lengkap</h3>
            <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
              Pantau omzet, laba rugi, dan produk terlaris dari HP di mana saja. Data tersaji real-time dan akurat.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Simple CTA -->
    <section class="py-20 container mx-auto px-4">
      <div class="bg-primary rounded-3xl p-12 text-center text-white relative overflow-hidden">
        <div class="relative z-10 max-w-2xl mx-auto">
          <h2 class="text-3xl md:text-4xl font-bold mb-6">Mulai Transformasi Digital Warung Anda</h2>
          <p class="text-blue-100 text-lg mb-8">
            Gabung dengan ribuan UMKM lain yang sudah beralih ke Warungin.
          </p>
          <router-link
            to="/pricing"
            class="inline-flex items-center justify-center px-8 py-4 bg-white text-primary rounded-xl font-bold text-lg hover:bg-blue-50 transition shadow-lg"
          >
            Lihat Paket Harga
          </router-link>
        </div>
        
        <!-- Decoration circles -->
        <div class="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useSEO } from '../../composables/useSEO';

useSEO({
  title: 'Warungin - Sistem Kasir Modern untuk UMKM',
  description: 'Kelola warung dan toko Anda dengan mudah. Sistem kasir, inventori, dan laporan dalam satu aplikasi.',
  keywords: 'kasir warung, aplikasi toko, pos indonesia, umkm digital',
});

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
</script>
