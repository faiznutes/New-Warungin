<template>
  <div class="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-display">
    <!-- Hero Section -->
    <section class="container mx-auto px-4 py-16 relative overflow-hidden">
      <!-- Background Gradients -->
      <div class="absolute inset-0 pointer-events-none">
         <div class="absolute -top-40 -left-40 w-96 h-96 bg-blue-100 dark:bg-blue-900/10 rounded-full blur-3xl opacity-50"></div>
      </div>
      
      <div class="flex flex-col items-center justify-center text-center max-w-4xl mx-auto relative z-10">
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 px-2">
           Pusat Bantuan <span class="text-primary">Warungin</span>
        </h1>
        <p class="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl px-4">
          Temukan jawaban, panduan, dan tips untuk memaksimalkan bisnis Anda.
        </p>
        <div class="w-full max-w-2xl">
          <div class="relative group">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari artikel bantuan... (Contoh: 'Cara tambah produk')"
              class="w-full px-6 py-4 pl-14 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition text-lg shadow-sm group-hover:shadow-md"
            />
            <span class="material-symbols-outlined absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition">search</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="container mx-auto px-4 py-12 pb-20">
      <div class="max-w-6xl mx-auto">
        <!-- Categories -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 hover:shadow-xl hover:border-primary/50 transition cursor-pointer group" @click="selectedCategory = 'getting-started'">
            <div class="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
               <span class="material-symbols-outlined text-primary text-3xl group-hover:text-white transition-colors">rocket_launch</span>
            </div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Panduan Memulai</h2>
            <p class="text-slate-500 dark:text-slate-400 text-sm">Setup akun, outlet pertama, dan onboarding.</p>
          </div>

          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 hover:shadow-xl hover:border-primary/50 transition cursor-pointer group" @click="selectedCategory = 'features'">
            <div class="w-14 h-14 bg-purple-50 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
              <span class="material-symbols-outlined text-purple-600 dark:text-purple-400 text-3xl group-hover:text-white transition-colors">featured_play_list</span>
            </div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Fitur Sistem</h2>
            <p class="text-slate-500 dark:text-slate-400 text-sm">Panduan lengkap manajemen produk, stok, dan kasir.</p>
          </div>

          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 hover:shadow-xl hover:border-primary/50 transition cursor-pointer group" @click="selectedCategory = 'billing'">
            <div class="w-14 h-14 bg-green-50 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
               <span class="material-symbols-outlined text-green-600 dark:text-green-400 text-3xl group-hover:text-white transition-colors">receipt_long</span>
            </div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Tagihan & Paket</h2>
            <p class="text-slate-500 dark:text-slate-400 text-sm">Info paket langganan, upgrade, dan invoice.</p>
          </div>

          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 hover:shadow-xl hover:border-primary/50 transition cursor-pointer group" @click="selectedCategory = 'troubleshooting'">
             <div class="w-14 h-14 bg-orange-50 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
               <span class="material-symbols-outlined text-orange-600 dark:text-orange-400 text-3xl group-hover:text-white transition-colors">build</span>
            </div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Troubleshooting</h2>
            <p class="text-slate-500 dark:text-slate-400 text-sm">Solusi kendala teknis dan cara mengatasinya.</p>
          </div>

          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 hover:shadow-xl hover:border-primary/50 transition cursor-pointer group" @click="selectedCategory = 'api'">
            <div class="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-slate-600 group-hover:text-white transition-colors duration-300">
               <span class="material-symbols-outlined text-slate-600 dark:text-slate-300 text-3xl group-hover:text-white transition-colors">api</span>
            </div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">API & Integrasi</h2>
            <p class="text-slate-500 dark:text-slate-400 text-sm">Dokumentasi teknis untuk developer.</p>
          </div>

          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 hover:shadow-xl hover:border-primary/50 transition cursor-pointer group" @click="selectedCategory = 'security'">
             <div class="w-14 h-14 bg-red-50 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
               <span class="material-symbols-outlined text-red-600 dark:text-red-400 text-3xl group-hover:text-white transition-colors">security</span>
            </div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Keamanan & Privasi</h2>
            <p class="text-slate-500 dark:text-slate-400 text-sm">Standar keamanan data dan kebijakan privasi.</p>
          </div>
        </div>

        <!-- Popular Articles -->
        <div class="mb-16">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
             <span class="material-symbols-outlined text-primary">trending_up</span>
             Panduan Populer
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-primary transition group cursor-pointer">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition">Cara Setup Awal Warungin</h3>
              <p class="text-slate-500 dark:text-slate-400 text-sm mb-4">Langkah demi langkah menyiapkan outlet pertama Anda.</p>
              <span class="text-primary text-sm font-bold flex items-center gap-1">Baca Selengkapnya <span class="material-symbols-outlined text-sm">arrow_forward</span></span>
            </div>

            <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-primary transition group cursor-pointer">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition">Cara Menambah Produk</h3>
              <p class="text-slate-500 dark:text-slate-400 text-sm mb-4">Panduan input produk, varian, dan manajemen stok.</p>
              <span class="text-primary text-sm font-bold flex items-center gap-1">Baca Selengkapnya <span class="material-symbols-outlined text-sm">arrow_forward</span></span>
            </div>

            <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-primary transition group cursor-pointer">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition">Konfigurasi Printer Struk</h3>
              <p class="text-slate-500 dark:text-slate-400 text-sm mb-4">Cara menghubungkan printer thermal bluetooth/USB.</p>
              <span class="text-primary text-sm font-bold flex items-center gap-1">Baca Selengkapnya <span class="material-symbols-outlined text-sm">arrow_forward</span></span>
            </div>

            <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-primary transition group cursor-pointer">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition">Download Laporan Bulanan</h3>
              <p class="text-slate-500 dark:text-slate-400 text-sm mb-4">Export laporan penjualan ke Excel/PDF.</p>
              <span class="text-primary text-sm font-bold flex items-center gap-1">Baca Selengkapnya <span class="material-symbols-outlined text-sm">arrow_forward</span></span>
            </div>
          </div>
        </div>

        <!-- Contact Support -->
        <div class="bg-primary rounded-3xl p-8 sm:p-12 text-white text-center relative overflow-hidden">
           <div class="absolute inset-0 bg-gradient-to-r from-blue-600 to-primary opacity-50"></div>
           <div class="relative z-10">
             <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                <span class="material-symbols-outlined text-4xl">support_agent</span>
             </div>
             <h2 class="text-2xl sm:text-3xl font-bold mb-4">Masih Butuh Bantuan?</h2>
             <p class="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
               Tim support kami siap membantu Anda menyelesaikan masalah secepat mungkin.
             </p>
             <div class="flex flex-col sm:flex-row gap-4 justify-center">
               <router-link
                 to="/contact"
                 class="px-8 py-4 bg-white text-primary rounded-xl hover:bg-slate-100 transition font-bold shadow-lg"
               >
                 Hubungi Support
               </router-link>
               <a
                 href="mailto:support@warungin.com"
                 class="px-8 py-4 bg-transparent border-2 border-white/30 text-white rounded-xl hover:bg-white/10 transition font-bold"
               >
                 Kirim Email
               </a>
             </div>
           </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSEO } from '../../composables/useSEO';

useSEO({
  title: 'Pusat Bantuan Warungin',
  description: 'FAQ dan panduan penggunaan sistem kasir Warungin.',
});

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

const searchQuery = ref('');
const selectedCategory = ref('');
</script>
