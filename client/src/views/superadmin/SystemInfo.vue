<template>
  <div class="max-w-7xl mx-auto flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-[#0d141b] dark:text-white text-2xl sm:text-3xl font-bold leading-tight tracking-tight">System Information</h1>
        <p class="text-[#4c739a] dark:text-[#4c739a]">Technical details about the platform, running services, and feature specifications.</p>
      </div>
    </div>

    <!-- Main Content Card -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 md:p-8">
      
      <!-- Accordion Groups -->
      <div class="space-y-4">
        <!-- Frontend & Backend Info -->
        <div class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden transition-all hover:border-[#10b981]/30">
          <button
            @click="toggleAccordion('tech')"
            class="w-full px-6 py-4 bg-[#f6f7f8] dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-between group"
          >
            <div class="flex items-center gap-3">
               <span class="material-symbols-outlined text-[#10b981] group-hover:scale-110 transition-transform">code</span>
               <span class="font-bold text-[#0d141b] dark:text-white">Installed Technologies</span>
            </div>
            <span class="material-symbols-outlined text-[#4c739a] transition-transform duration-300" :class="{ 'rotate-180': openAccordion === 'tech' }">expand_more</span>
          </button>
          <div v-show="openAccordion === 'tech'" class="px-6 py-6 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 class="font-bold text-[#0d141b] dark:text-white mb-4 flex items-center gap-2">
                   <div class="size-2 rounded-full bg-blue-500"></div> Frontend
                </h3>
                <ul class="space-y-3 text-sm text-[#4c739a] dark:text-[#4c739a]">
                  <li class="flex justify-between border-b border-dashed border-slate-100 dark:border-slate-700 pb-1"><span>Framework</span> <span class="font-medium text-[#0d141b] dark:text-slate-300">Vue.js 3.3.4</span></li>
                  <li class="flex justify-between border-b border-dashed border-slate-100 dark:border-slate-700 pb-1"><span>Router</span> <span class="font-medium text-[#0d141b] dark:text-slate-300">Vue Router 4.2.5</span></li>
                  <li class="flex justify-between border-b border-dashed border-slate-100 dark:border-slate-700 pb-1"><span>State Management</span> <span class="font-medium text-[#0d141b] dark:text-slate-300">Pinia 2.1.7</span></li>
                  <li class="flex justify-between border-b border-dashed border-slate-100 dark:border-slate-700 pb-1"><span>UI Components</span> <span class="font-medium text-[#0d141b] dark:text-slate-300">Headless UI, Heroicons</span></li>
                  <li class="flex justify-between border-b border-dashed border-slate-100 dark:border-slate-700 pb-1"><span>Charts</span> <span class="font-medium text-[#0d141b] dark:text-slate-300">Chart.js 4.4.0</span></li>
                  <li class="flex justify-between border-b border-dashed border-slate-100 dark:border-slate-700 pb-1"><span>Build Tool</span> <span class="font-medium text-[#0d141b] dark:text-slate-300">Vite 6.4.1</span></li>
                  <li class="flex justify-between border-b border-dashed border-slate-100 dark:border-slate-700 pb-1"><span>Styling</span> <span class="font-medium text-[#0d141b] dark:text-slate-300">Tailwind CSS 3.4.0</span></li>
                </ul>
              </div>
              <div>
                <h3 class="font-bold text-[#0d141b] dark:text-white mb-4 flex items-center gap-2">
                   <div class="size-2 rounded-full bg-green-500"></div> Backend
                </h3>
                <ul class="space-y-3 text-sm text-[#4c739a] dark:text-[#4c739a]">
                  <li class="flex justify-between border-b border-dashed border-slate-100 dark:border-slate-700 pb-1"><span>Runtime</span> <span class="font-medium text-[#0d141b] dark:text-slate-300">Node.js 18</span></li>
                  <li class="flex justify-between border-b border-dashed border-slate-100 dark:border-slate-700 pb-1"><span>Framework</span> <span class="font-medium text-[#0d141b] dark:text-slate-300">Express.js 4.18.2</span></li>
                  <li class="flex justify-between border-b border-dashed border-slate-100 dark:border-slate-700 pb-1"><span>Database</span> <span class="font-medium text-[#0d141b] dark:text-slate-300">PostgreSQL 15</span></li>
                  <li class="flex justify-between border-b border-dashed border-slate-100 dark:border-slate-700 pb-1"><span>ORM</span> <span class="font-medium text-[#0d141b] dark:text-slate-300">Prisma 6.19.0</span></li>
                  <li class="flex justify-between border-b border-dashed border-slate-100 dark:border-slate-700 pb-1"><span>Cache</span> <span class="font-medium text-[#0d141b] dark:text-slate-300">Redis 7</span></li>
                  <li class="flex justify-between border-b border-dashed border-slate-100 dark:border-slate-700 pb-1"><span>Payment</span> <span class="font-medium text-[#0d141b] dark:text-slate-300">Midtrans Client</span></li>
                  <li class="flex justify-between border-b border-dashed border-slate-100 dark:border-slate-700 pb-1"><span>Queue</span> <span class="font-medium text-[#0d141b] dark:text-slate-300">BullMQ 5.0.0</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Docker Services -->
        <div class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden transition-all hover:border-[#10b981]/30">
          <button
            @click="toggleAccordion('docker')"
            class="w-full px-6 py-4 bg-[#f6f7f8] dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-between group"
          >
            <div class="flex items-center gap-3">
               <span class="material-symbols-outlined text-[#10b981] group-hover:scale-110 transition-transform">dns</span>
               <span class="font-bold text-[#0d141b] dark:text-white">Docker Services & Penggunaan</span>
            </div>
            <span class="material-symbols-outlined text-[#4c739a] transition-transform duration-300" :class="{ 'rotate-180': openAccordion === 'docker' }">expand_more</span>
          </button>
          <div v-show="openAccordion === 'docker'" class="px-6 py-6 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
             <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div class="p-4 rounded-xl bg-[#f6f7f8] dark:bg-slate-900/30 border border-slate-100 dark:border-slate-700">
                  <h3 class="font-bold text-[#0d141b] dark:text-white mb-2 text-sm flex items-center gap-2">
                    <span class="material-symbols-outlined text-[#10b981] text-[18px]">database</span> PostgreSQL Database
                  </h3>
                  <p class="text-xs text-[#4c739a]">Database utama untuk menyimpan semua data aplikasi. Menggunakan Prisma ORM untuk manajemen schema dan migrasi.</p>
               </div>
               <div class="p-4 rounded-xl bg-[#f6f7f8] dark:bg-slate-900/30 border border-slate-100 dark:border-slate-700">
                  <h3 class="font-bold text-[#0d141b] dark:text-white mb-2 text-sm flex items-center gap-2">
                    <span class="material-symbols-outlined text-red-500 text-[18px]">bolt</span> Redis Cache
                  </h3>
                  <p class="text-xs text-[#4c739a]">Cache layer untuk session, rate limiting, dan data frequent. Meningkatkan throughput aplikasi.</p>
               </div>
               <div class="p-4 rounded-xl bg-[#f6f7f8] dark:bg-slate-900/30 border border-slate-100 dark:border-slate-700">
                  <h3 class="font-bold text-[#0d141b] dark:text-white mb-2 text-sm flex items-center gap-2">
                    <span class="material-symbols-outlined text-green-500 text-[18px]">api</span> Backend Service
                  </h3>
                  <p class="text-xs text-[#4c739a]">Node.js API server. Limit: 4 CPU, 4GB RAM. Menangani semua business logic dan background jobs.</p>
               </div>
               <div class="p-4 rounded-xl bg-[#f6f7f8] dark:bg-slate-900/30 border border-slate-100 dark:border-slate-700">
                  <h3 class="font-bold text-[#0d141b] dark:text-white mb-2 text-sm flex items-center gap-2">
                    <span class="material-symbols-outlined text-purple-500 text-[18px]">web</span> Nginx & Frontend
                  </h3>
                  <p class="text-xs text-[#4c739a]">Reverse proxy dengan Nginx, melayani static files Vue.js. SSL termination dan load balancing.</p>
               </div>
             </div>
          </div>
        </div>

        <!-- Features by Role -->
        <div class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden transition-all hover:border-[#10b981]/30">
          <button
            @click="toggleAccordion('features')"
            class="w-full px-6 py-4 bg-[#f6f7f8] dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-between group"
          >
            <div class="flex items-center gap-3">
               <span class="material-symbols-outlined text-[#10b981] group-hover:scale-110 transition-transform">admin_panel_settings</span>
               <span class="font-bold text-[#0d141b] dark:text-white">Fitur per Role</span>
            </div>
            <span class="material-symbols-outlined text-[#4c739a] transition-transform duration-300" :class="{ 'rotate-180': openAccordion === 'features' }">expand_more</span>
          </button>
          <div v-show="openAccordion === 'features'" class="px-6 py-6 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div class="space-y-6">
              <div>
                <h3 class="font-bold text-blue-700 mb-3 bg-blue-50 px-3 py-1 rounded-xl w-fit text-sm">Super Admin</h3>
                <ul class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-[#4c739a]">
                  <li class="flex items-start gap-2"><span class="text-blue-500">•</span> Dashboard Super Admin</li>
                  <li class="flex items-start gap-2"><span class="text-blue-500">•</span> Manajemen Tenant</li>
                  <li class="flex items-start gap-2"><span class="text-blue-500">•</span> Manajemen Addon Global</li>
                  <li class="flex items-start gap-2"><span class="text-blue-500">•</span> Laporan Global</li>
                  <li class="flex items-start gap-2"><span class="text-blue-500">•</span> System Settings & Logs</li>
                  <li class="flex items-start gap-2"><span class="text-blue-500">•</span> Server Monitor</li>
                </ul>
              </div>
              <div class="border-t border-dashed border-slate-100 dark:border-slate-700 pt-4">
                <h3 class="font-bold text-green-700 mb-3 bg-green-50 px-3 py-1 rounded-xl w-fit text-sm">Admin Tenant</h3>
                 <ul class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-[#4c739a]">
                  <li class="flex items-start gap-2"><span class="text-green-500">•</span> Dashboard Toko</li>
                  <li class="flex items-start gap-2"><span class="text-green-500">•</span> Manajemen Produk & Stok</li>
                  <li class="flex items-start gap-2"><span class="text-green-500">•</span> POS & Transaksi</li>
                  <li class="flex items-start gap-2"><span class="text-green-500">•</span> Laporan Penjualan</li>
                   <li class="flex items-start gap-2"><span class="text-green-500">•</span> Manajemen User & Role</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Subscription Plans -->
        <div class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden transition-all hover:border-[#10b981]/30">
          <button
            @click="toggleAccordion('plans')"
             class="w-full px-6 py-4 bg-[#f6f7f8] dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-between group"
          >
            <div class="flex items-center gap-3">
               <span class="material-symbols-outlined text-[#10b981] group-hover:scale-110 transition-transform">card_membership</span>
               <span class="font-bold text-[#0d141b] dark:text-white">Paket Subscription</span>
            </div>
            <span class="material-symbols-outlined text-[#4c739a] transition-transform duration-300" :class="{ 'rotate-180': openAccordion === 'plans' }">expand_more</span>
          </button>
          <div v-show="openAccordion === 'plans'" class="px-6 py-6 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="border border-slate-100 dark:border-slate-700 rounded-xl p-5 hover:shadow-md transition-shadow">
                <h3 class="font-bold text-[#0d141b] dark:text-white mb-2">BASIC (Starter)</h3>
                <div class="text-xs text-[#4c739a] space-y-2">
                   <p><strong>30</strong> Produk</p>
                   <p><strong>4</strong> User</p>
                   <p><strong>1</strong> Outlet</p>
                   <p class="text-green-600 font-medium">+ Receipt Basic</p>
                </div>
              </div>
              <div class="border-2 border-[#10b981] rounded-xl p-5 shadow-lg shadow-[#10b981]/10 relative overflow-hidden">
                <div class="absolute top-0 right-0 bg-[#10b981] text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">POPULAR</div>
                <h3 class="font-bold text-[#10b981] mb-2">PRO (Boost)</h3>
                <div class="text-xs text-[#4c739a] dark:text-slate-300 space-y-2">
                   <p><strong>200</strong> Produk</p>
                   <p><strong>10</strong> User</p>
                   <p><strong>2</strong> Outlet</p>
                   <p class="text-[#10b981] font-medium">+ Multi-Outlet & Stock</p>
                </div>
              </div>
              <div class="border border-slate-100 dark:border-slate-700 rounded-xl p-5 hover:shadow-md transition-shadow bg-purple-50 dark:bg-purple-900/10">
                <h3 class="font-bold text-purple-700 dark:text-purple-300 mb-2">ENTERPRISE</h3>
                <div class="text-xs text-[#4c739a] dark:text-slate-300 space-y-2">
                   <p><strong>1000</strong> Produk</p>
                   <p><strong>20</strong> User</p>
                   <p><strong>3</strong> Outlet</p>
                   <p class="text-purple-600 font-medium">+ All Features</p>
                </div>
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

