<template>
  <div class="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-display">
    <!-- Hero Section -->
    <section class="container mx-auto px-4 sm:px-6 py-12 sm:py-16 relative overflow-hidden">
      <!-- Background Gradients -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50"></div>
        <div class="absolute top-1/2 -left-24 w-72 h-72 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div class="flex flex-col items-center justify-center text-center max-w-4xl mx-auto relative z-10">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-6">
          <span class="material-symbols-outlined text-sm">payments</span>
          Paket Hemat
        </div>
        <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 px-2 leading-tight">
          Investasi Terbaik untuk <br/><span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Pertumbuhan Bisnis</span>
        </h1>
        <p class="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl px-4 leading-relaxed">
          Pilih paket yang sesuai dengan fase bisnis Anda. Mulai dari Rp 149rb/bulan, 
          tanpa biaya tersembunyi. Upgrade kapan saja.
        </p>
      </div>
    </section>

    <!-- Pricing Cards -->
    <section class="container mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-12 sm:pb-20 relative z-10">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
        <!-- Starter Plan -->
        <div class="flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 group">
          <div class="flex flex-col p-6 sm:p-8">
            <div class="mb-6">
              <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">Starter</h2>
              <p class="text-sm text-slate-500 dark:text-slate-400">Perfect untuk warung baru mulai 🚀</p>
            </div>
            <div class="mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
              <div class="flex items-baseline flex-wrap">
                <span class="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white">Rp 149</span>
                <span class="text-xl text-slate-500 ml-1">rb</span>
                <span class="text-sm text-slate-400 ml-2">/bulan</span>
              </div>
              <p class="text-xs text-slate-400 mt-2">Harga terjangkau untuk memulai</p>
            </div>
            <ul class="space-y-4 mb-8 flex-1">
              <li class="flex items-start gap-3">
                <span class="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
                <span class="text-slate-600 dark:text-slate-300 text-sm">1 Outlet</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
                <span class="text-slate-600 dark:text-slate-300 text-sm">3-4 User</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
                <span class="text-slate-600 dark:text-slate-300 text-sm">Limit produk 30</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
                <span class="text-slate-600 dark:text-slate-300 text-sm">Laporan Penjualan Dasar</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
                <span class="text-slate-600 dark:text-slate-300 text-sm">Support Email</span>
              </li>
            </ul>
            <router-link
              to="/contact"
              class="w-full px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition font-bold text-center"
            >
              Mulai Starter
            </router-link>
          </div>
        </div>

        <!-- Boost Plan (Popular) -->
        <div class="flex flex-col bg-slate-900 dark:bg-emerald-500 rounded-2xl shadow-2xl hover:shadow-2xl transition-all duration-300 transform lg:scale-105 border-4 border-slate-900 dark:border-blue-500 relative">
          <div class="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-t-xl"></div>
          <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
            <span class="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg uppercase tracking-wider">
              Paling Populer
            </span>
          </div>
          <div class="flex flex-col p-6 sm:p-8 relative z-10 h-full">
            <div class="mb-6">
              <h2 class="text-xl sm:text-2xl font-bold text-white mb-2">Boost</h2>
              <p class="text-sm text-slate-400 dark:text-blue-100">Level up bisnis kamu! 💪</p>
            </div>
            <div class="mb-6 pb-6 border-b border-slate-800 dark:border-blue-500/30">
              <div class="flex items-baseline flex-wrap">
                <span class="text-4xl sm:text-5xl font-bold text-white">Rp 299</span>
                <span class="text-xl text-slate-400 dark:text-blue-200 ml-1">rb</span>
                <span class="text-sm text-slate-500 dark:text-blue-300 ml-2">/bulan</span>
              </div>
              <p class="text-xs text-slate-500 dark:text-blue-200 mt-2">Best value untuk UMKM berkembang</p>
            </div>
            <ul class="space-y-4 mb-8 flex-1">
               <li class="flex items-start gap-3">
                <span class="material-symbols-outlined text-green-400 text-[20px]">check_circle</span>
                <span class="text-slate-300 dark:text-blue-50 text-sm">2 Outlet</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="material-symbols-outlined text-green-400 text-[20px]">check_circle</span>
                <span class="text-slate-300 dark:text-blue-50 text-sm">10 User</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="material-symbols-outlined text-green-400 text-[20px]">check_circle</span>
                <span class="text-slate-300 dark:text-blue-50 text-sm">Limit produk 200</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="material-symbols-outlined text-green-400 text-[20px]">check_circle</span>
                <span class="text-slate-300 dark:text-blue-50 text-sm">Manajemen Inventori</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="material-symbols-outlined text-green-400 text-[20px]">check_circle</span>
                <span class="text-slate-300 dark:text-blue-50 text-sm">Member & Diskon</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="material-symbols-outlined text-green-400 text-[20px]">check_circle</span>
                <span class="text-slate-300 dark:text-blue-50 text-sm">Support Prioritas</span>
              </li>
            </ul>
            <router-link
              to="/contact"
              class="w-full px-6 py-4 bg-emerald-500 text-white rounded-xl hover:bg-emerald-500 transition font-bold text-center shadow-lg shadow-blue-500/25"
            >
              Pilih Paket Boost
            </router-link>
          </div>
        </div>

        <!-- Pro Plan -->
        <div class="flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 group">
          <div class="flex flex-col p-6 sm:p-8">
            <div class="mb-6">
              <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">Pro Max</h2>
              <p class="text-sm text-slate-500 dark:text-slate-400">Untuk bisnis skala besar 🏢</p>
            </div>
            <div class="mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
              <div class="flex items-baseline flex-wrap">
                <span class="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white">Rp 499</span>
                <span class="text-xl text-slate-500 ml-1">rb</span>
                <span class="text-sm text-slate-400 ml-2">/bulan</span>
              </div>
              <p class="text-xs text-slate-400 mt-2">Solusi lengkap tanpa batas</p>
            </div>
            <ul class="space-y-4 mb-8 flex-1">
              <li class="flex items-start gap-3">
                <span class="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
                <span class="text-slate-600 dark:text-slate-300 text-sm">3 Outlet</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
                <span class="text-slate-600 dark:text-slate-300 text-sm">20 User</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
                <span class="text-slate-600 dark:text-slate-300 text-sm">Produk 1000+</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
                <span class="text-slate-600 dark:text-slate-300 text-sm">Analitik Lengkap & Laba Rugi</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
                <span class="text-slate-600 dark:text-slate-300 text-sm">Import/Export Massal</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
                <span class="text-slate-600 dark:text-slate-300 text-sm">API Access</span>
              </li>
            </ul>
            <router-link
              to="/contact"
              class="w-full px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition font-bold text-center"
            >
              Hubungi Sales
            </router-link>
          </div>
        </div>
      </div>

      <!-- Addons Section -->
      <div class="mt-24 max-w-6xl mx-auto px-4">
        <div class="text-center mb-16">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-4">
            <span class="material-symbols-outlined text-sm">extension</span>
            Modular
          </div>
          <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">
             Addons Premium
          </h2>
          <p class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Tambah fitur sesuai kebutuhan, bayar pay-as-you-go.
          </p>
        </div>

        <div v-if="loadingAddons" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
        
        <div v-else>
           <!-- Addon grid would go here, reusing similar structure but with V3 classes -->
           <!-- For brevity, I'll use a simplified list or the existing logic if I can rely on list rendering, 
                but I'll reimplement the grid for consistency using the computed props -->
            
            <div v-if="unlimitedAddons.length > 0" class="mb-12">
               <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <span class="material-symbols-outlined text-emerald-600">all_inclusive</span>
                  Addon Unlimited
               </h3>
               <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div
                    v-for="addon in unlimitedAddons"
                    :key="addon.id"
                    class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 transition shadow-sm"
                  >
                     <h4 class="font-bold text-slate-900 dark:text-white mb-2">{{ addon.name }}</h4>
                     <p class="text-sm text-slate-500 dark:text-slate-400 mb-4 h-10 line-clamp-2">{{ addon.description }}</p>
                     <div class="flex items-baseline gap-1 mb-4">
                        <span class="text-2xl font-bold text-slate-900 dark:text-white">Rp {{ formatAddonPrice(addon.price) }}</span>
                        <span class="text-xs text-slate-500">rb/bulan</span>
                     </div>
                     <ul class="space-y-2 mb-0">
                        <li v-for="(detail, idx) in addon.details?.slice(0, 3) || []" :key="idx" class="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                           <span class="material-symbols-outlined text-green-500 text-[16px]">check</span>
                           {{ detail }}
                        </li>
                     </ul>
                  </div>
               </div>
            </div>
            
            <!-- Limited Addons -->
            <div v-if="limitedAddons.length > 0" class="mb-12">
               <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <span class="material-symbols-outlined text-emerald-600">bolt</span>
                  Addon Fitur
               </h3>
               <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div
                    v-for="addon in limitedAddons"
                    :key="addon.id"
                    class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 transition shadow-sm"
                  >
                     <h4 class="font-bold text-slate-900 dark:text-white mb-2">{{ addon.name }}</h4>
                     <p class="text-sm text-slate-500 dark:text-slate-400 mb-4 h-10 line-clamp-2">{{ addon.description }}</p>
                     <div class="flex items-baseline gap-1 mb-4">
                        <span class="text-2xl font-bold text-slate-900 dark:text-white">Rp {{ formatAddonPrice(addon.price) }}</span>
                        <span class="text-xs text-slate-500">rb/bulan</span>
                     </div>
                      <div v-if="addon.defaultLimit" class="text-xs bg-slate-100 dark:bg-slate-700 rounded px-2 py-1 inline-block mb-3 text-slate-600 dark:text-slate-300">
                         <strong>Limit:</strong> {{ addon.defaultLimit }}
                      </div>
                  </div>
               </div>
            </div>

             <!-- Coming Soon Addons -->
            <div v-if="comingSoonAddons.length > 0">
               <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <span class="material-symbols-outlined text-amber-500">hourglass_top</span>
                  Segera Hadir
               </h3>
               <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div
                    v-for="addon in comingSoonAddons"
                    :key="addon.id"
                    class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 opacity-75"
                  >
                     <div class="flex justify-between items-start mb-2">
                        <h4 class="font-bold text-slate-900 dark:text-white">{{ addon.name }}</h4>
                        <span class="text-[10px] uppercase font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Soon</span>
                     </div>
                     <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">{{ addon.description }}</p>
                     <div class="flex items-baseline gap-1">
                        <span class="text-2xl font-bold text-slate-900 dark:text-white">Rp {{ formatAddonPrice(addon.price) }}</span>
                        <span class="text-xs text-slate-500">rb/bulan</span>
                     </div>
                  </div>
               </div>
            </div>
        </div>
      </div>

       <!-- FAQ Section -->
      <div class="mt-20 max-w-3xl mx-auto px-4">
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">
          FAQ
        </h2>
        <div class="space-y-4">
          <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 class="font-bold text-slate-900 dark:text-white mb-2">Apakah ada trial gratis?</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Ya! Semua paket mendapatkan trial gratis 14 hari tanpa perlu kartu kredit.
            </p>
          </div>
          <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 class="font-bold text-slate-900 dark:text-white mb-2">Bisakah saya upgrade paket nanti?</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Tentu! Anda bisa upgrade kapan saja secara mandiri melalui dashboard.
            </p>
          </div>
           <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 class="font-bold text-slate-900 dark:text-white mb-2">Metode pembayaran?</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
               Transfer bank (Virtual Account) dan QRIS (GoPay, OVO, DANA).
            </p>
          </div>
        </div>
      </div>

    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useSEO } from '../../composables/useSEO';
import api from '../../api';

useSEO({
  title: 'Paket Harga Sistem Kasir Warungin',
  description: 'Pilih paket sistem kasir yang sesuai dengan kebutuhan bisnis UMKM Anda.',
  keywords: 'harga warungin, paket warungin',
});

const availableAddons = ref<any[]>([]);
const loadingAddons = ref(false);

const hasDefaultLimit = (addon: any) => {
  return addon.defaultLimit !== null && addon.defaultLimit !== undefined;
};

const isComingSoon = (addon: any) => {
  return addon?.comingSoon === true || addon?.requiresApi === true;
};

const filteredAvailableAddons = computed(() => {
  const uniqueAddons = availableAddons.value.filter((addon, index, self) => 
    index === self.findIndex(a => a.id === addon.id)
  );
  return uniqueAddons.sort((a, b) => {
    // Sort logic preserved
   if (isComingSoon(a) && !isComingSoon(b)) return 1;
   if (!isComingSoon(a) && isComingSoon(b)) return -1;
   if (hasDefaultLimit(a) && !hasDefaultLimit(b)) return -1;
   if (!hasDefaultLimit(a) && hasDefaultLimit(b)) return 1;
   return 0;
  });
});

const unlimitedAddons = computed(() => filteredAvailableAddons.value.filter(a => hasDefaultLimit(a) && !isComingSoon(a)));
const limitedAddons = computed(() => filteredAvailableAddons.value.filter(a => !hasDefaultLimit(a) && !isComingSoon(a)));
const comingSoonAddons = computed(() => filteredAvailableAddons.value.filter(a => isComingSoon(a)));

const loadAddons = async () => {
  loadingAddons.value = true;
  try {
    const response = await api.get('/addons/available');
    availableAddons.value = response.data || [];
  } catch (error: any) {
    console.error('Error loading addons:', error);
  } finally {
    loadingAddons.value = false;
  }
};

const formatAddonPrice = (price: number) => {
  return (price / 1000).toFixed(0);
};

onMounted(async () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  await loadAddons();
});
</script>
