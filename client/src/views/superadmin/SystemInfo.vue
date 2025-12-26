<template>
  <div class="w-full bg-gradient-to-br from-[#f8f9fa] via-[#eef2f6] to-[#dce5f2] dark:from-[#101822] dark:via-[#15202e] dark:to-[#0f151e] min-h-screen py-12 px-4 md:px-8">
    <div class="max-w-[1200px] mx-auto space-y-12">
      
      <!-- Premium Header Section -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-slate-200/60 dark:border-slate-700/60">
        <div class="space-y-4 max-w-2xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <span class="material-symbols-outlined text-base">verified</span>
            Platform Status: Active & Optimized
          </div>
          <h1 class="text-[#0d131b] dark:text-white tracking-tight text-4xl lg:text-5xl font-black leading-[1.1]">
            Informasi <span class="text-emerald-600 bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500">Sistem & Ekosistem</span>
          </h1>
          <p class="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
            Dibalik layar teknologi Warungin yang dirancang untuk kecepatan, keamanan, dan skalabilitas bisnis Anda. 
            Pelajari spesifikasi teknis dan fitur eksklusif tiap paket kami.
          </p>
        </div>
        
        <!-- Live Monitor Widget (Aesthetic) -->
        <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/20 dark:shadow-none flex items-center gap-5">
          <div class="relative">
            <div class="size-16 rounded-full border-4 border-emerald-500/20 flex items-center justify-center">
              <span class="material-symbols-outlined text-emerald-500 text-3xl animate-pulse">speed</span>
            </div>
            <div class="absolute -top-1 -right-1 size-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800"></div>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Uptime Rate</p>
            <p class="text-2xl font-black text-[#0d131b] dark:text-white">99.99%</p>
            <p class="text-[10px] text-emerald-500 font-bold">Real-time Optimization</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Left Sidebar: Categories -->
        <div class="lg:col-span-4 space-y-6">
          <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm overflow-hidden sticky top-8">
            <h2 class="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Navigasi Teknis</h2>
            <div class="flex flex-col gap-2">
              <button 
                v-for="(label, key) in menuLabels" 
                :key="key"
                @click="activeCategory = key"
                :class="[
                  'flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group text-left',
                  activeCategory === key 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 translate-x-2' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300'
                ]"
              >
                <div :class="[
                  'size-10 rounded-lg flex items-center justify-center transition-colors',
                  activeCategory === key ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700 group-hover:bg-emerald-50'
                ]">
                  <span class="material-symbols-outlined text-[20px]">{{ menuIcons[key] }}</span>
                </div>
                <span class="font-bold flex-1">{{ label }}</span>
                <span v-if="activeCategory === key" class="material-symbols-outlined text-[18px]">arrow_forward_ios</span>
              </button>
            </div>

            <!-- Promotion Card -->
            <div class="mt-8 p-5 rounded-2xl bg-gradient-to-br from-indigo-900 to-blue-800 text-white relative overflow-hidden group">
              <div class="absolute -right-4 -bottom-4 size-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <p class="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-1">Upgrade Info</p>
              <h4 class="font-bold text-sm mb-3 leading-snug">Butuh fitur kustom untuk perusahaan Anda?</h4>
              <button class="w-full py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-xs font-bold transition-colors">
                Konsultasi Enterprise
              </button>
            </div>
          </div>
        </div>

        <!-- Right Content Area -->
        <div class="lg:col-span-8">
          <Transition name="fade-slide" mode="out-in">
            <div :key="activeCategory" class="space-y-8">
              
              <!-- CATEGORY: TECHNOLOGIES -->
              <div v-if="activeCategory === 'tech'" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Frontend Section -->
                  <div class="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative group overflow-hidden">
                    <div class="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
                      <span class="material-symbols-outlined text-[100px]">web</span>
                    </div>
                    <div class="flex items-center gap-4 mb-6">
                      <div class="size-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                        <span class="material-symbols-outlined">layers</span>
                      </div>
                      <div>
                        <h3 class="font-black text-slate-800 dark:text-white uppercase tracking-wider text-xs">Modern UI Engine</h3>
                        <p class="text-xl font-bold">Frontend Stack</p>
                      </div>
                    </div>
                    <ul class="space-y-4">
                      <li v-for="item in techStack.frontend" :key="item.name" class="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0 pb-3">
                        <span class="text-sm font-semibold text-slate-500">{{ item.name }}</span>
                        <span class="text-sm font-bold text-slate-800 dark:text-slate-300">{{ item.version }}</span>
                      </li>
                    </ul>
                  </div>

                  <!-- Backend Section -->
                  <div class="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative group overflow-hidden">
                    <div class="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
                      <span class="material-symbols-outlined text-[100px]">dns</span>
                    </div>
                    <div class="flex items-center gap-4 mb-6">
                      <div class="size-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                        <span class="material-symbols-outlined">terminal</span>
                      </div>
                      <div>
                        <h3 class="font-black text-slate-800 dark:text-white uppercase tracking-wider text-xs">High Performance</h3>
                        <p class="text-xl font-bold">Backend Core</p>
                      </div>
                    </div>
                    <ul class="space-y-4">
                      <li v-for="item in techStack.backend" :key="item.name" class="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0 pb-3">
                        <span class="text-sm font-semibold text-slate-500">{{ item.name }}</span>
                        <span class="text-sm font-bold text-slate-800 dark:text-slate-300">{{ item.version }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- CATEGORY: SERVICES -->
              <div v-if="activeCategory === 'docker'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div v-for="service in services" :key="service.name" class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm group hover:-translate-y-1 transition-all">
                  <div class="flex items-start justify-between mb-4">
                    <div :class="['size-12 rounded-xl flex items-center justify-center', service.bg]">
                      <span :class="['material-symbols-outlined', service.color]">{{ service.icon }}</span>
                    </div>
                    <div class="flex flex-col items-end">
                      <span class="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                      <div class="flex gap-0.5 mt-1">
                        <div class="size-1 bg-emerald-500 rounded-full"></div>
                        <div class="size-1 bg-emerald-500 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  <h3 class="text-lg font-bold text-[#0d141b] dark:text-white mb-2">{{ service.name }}</h3>
                  <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{{ service.description }}</p>
                  <div class="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div class="flex items-center justify-between text-[10px] font-bold text-slate-400">
                      <span>LOAD CAPACITY</span>
                      <span>{{ service.load }}%</span>
                    </div>
                    <div class="mt-2 h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div class="h-full bg-emerald-500 rounded-full transition-all duration-1000" :style="{ width: service.load + '%' }"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- CATEGORY: ROLES -->
              <div v-if="activeCategory === 'features'" class="space-y-6">
                <div v-for="role in roles" :key="role.name" class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden group">
                  <div :class="['p-6 flex items-center gap-4 border-b border-slate-100 dark:border-slate-700 transition-colors', role.headerBg]">
                    <div :class="['size-14 rounded-2xl flex items-center justify-center text-white shadow-lg', role.iconBg]">
                      <span class="material-symbols-outlined text-[32px]">{{ role.icon }}</span>
                    </div>
                    <div>
                      <div class="flex items-center gap-3">
                        <h3 class="text-2xl font-black text-slate-800 dark:text-white">{{ role.name }}</h3>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/50 dark:bg-slate-700/50 text-slate-500 uppercase">Role Access</span>
                      </div>
                      <p class="text-sm text-slate-500 dark:text-slate-400 italic">"{{ role.tagline }}"</p>
                    </div>
                  </div>
                  <div class="p-8">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                      <div v-for="feature in role.features" :key="feature" class="flex items-center gap-3 group/item">
                        <div :class="['size-2 rounded-full transition-all group-hover/item:scale-150', role.bulletColor]"></div>
                        <span class="text-sm font-semibold text-slate-600 dark:text-slate-300">{{ feature }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- CATEGORY: SUBSCRIPTIONS -->
              <div v-if="activeCategory === 'plans'" class="space-y-8">
                <!-- Plans Comparison -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div v-for="plan in subscriptionPlans" :key="plan.id" 
                    :class="[
                      'relative p-8 rounded-3xl border-2 transition-all duration-500 flex flex-col',
                      plan.popular 
                        ? 'bg-emerald-950 border-emerald-500 shadow-2xl shadow-emerald-500/20 scale-105 z-10' 
                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-emerald-500/50'
                    ]">
                    <div v-if="plan.popular" class="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg shadow-emerald-500/40 uppercase tracking-widest">Paling Populer</div>
                    <div class="mb-8">
                      <h3 :class="['text-sm font-black uppercase tracking-[0.2em] mb-4', plan.popular ? 'text-emerald-400' : 'text-slate-400']">{{ plan.name }}</h3>
                      <div class="flex items-baseline gap-1">
                        <span :class="['text-3xl font-black', plan.popular ? 'text-white' : 'text-slate-900 dark:text-white']">{{ plan.price }}</span>
                        <span :class="['text-xs font-bold opacity-60', plan.popular ? 'text-white' : 'text-slate-900 dark:text-white']">/bulan</span>
                      </div>
                      <p :class="['text-xs mt-3 leading-relaxed', plan.popular ? 'text-emerald-100/60' : 'text-slate-500']">{{ plan.description }}</p>
                    </div>
                    <div class="flex-1 space-y-4">
                       <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700 pb-2">Fitur Utama</p>
                       <div v-for="f in plan.points" :key="f" class="flex items-center gap-3">
                         <span :class="['material-symbols-outlined text-[18px]', plan.popular ? 'text-emerald-400' : 'text-emerald-500']">check_circle</span>
                         <span :class="['text-xs font-bold', plan.popular ? 'text-white' : 'text-slate-700 dark:text-slate-300']">{{ f }}</span>
                       </div>
                    </div>
                    <button :class="['mt-8 w-full py-3 rounded-xl font-black text-xs transition-all', plan.popular ? 'bg-emerald-500 text-white hover:bg-emerald-400' : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 dark:text-white']">
                      Pilih Paket
                    </button>
                  </div>
                </div>

                <!-- Addons Section -->
                <div class="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm mt-12">
                  <div class="flex items-center justify-between mb-8">
                    <div>
                      <h3 class="text-2xl font-black text-slate-800 dark:text-white">Ekstensi & Addons</h3>
                      <p class="text-sm text-slate-500 dark:text-slate-400">Optimalkan fungsi Warungin sesuai kebutuhan spesifik bisnis Anda.</p>
                    </div>
                    <div class="hidden sm:block">
                      <span class="material-symbols-outlined text-4xl text-slate-200 dark:text-slate-700">extension</span>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div v-for="addon in addons" :key="addon.name" class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-700/50 hover:border-emerald-500/30 transition-all group">
                      <div class="flex items-center gap-4 mb-4">
                        <div class="size-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                          <span class="material-symbols-outlined text-[20px]">{{ addon.icon }}</span>
                        </div>
                        <h4 class="font-bold text-slate-800 dark:text-white">{{ addon.name }}</h4>
                      </div>
                      <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{{ addon.description }}</p>
                      <div class="mt-4 flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                        <span class="text-[10px] font-black text-emerald-600 dark:text-emerald-400">{{ addon.price }}</span>
                        <span class="material-symbols-outlined text-slate-300 group-hover:text-emerald-500 transition-colors">add_circle</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const activeCategory = ref('tech');

const menuLabels = {
  tech: 'Teknologi Inti',
  docker: 'Layanan Mikro',
  features: 'Akses Per Role',
  plans: 'Paket & Addons'
};

const menuIcons = {
  tech: 'code_blocks',
  docker: 'hub',
  features: 'groups',
  plans: 'loyalty'
};

const techStack = {
  frontend: [
    { name: 'UI Library', version: 'Vue.js 3.3.4 (Composition API)' },
    { name: 'Core Engine', version: 'Vite 6.4.1 (Next-gen bundling)' },
    { name: 'Logic Flow', version: 'Pinia 2.1.7 (Modular State)' },
    { name: 'Styling', version: 'Tailwind CSS 3.4.0 (Atomic Design)' },
    { name: 'Interactivity', version: 'Headless UI / Material Icons' },
    { name: 'Visualization', version: 'Chart.js 4.4.0 (Interactive Graphics)' }
  ],
  backend: [
    { name: 'Runtime', version: 'Node.js 18 (LTS Optimized)' },
    { name: 'Framework', version: 'Express.js 4.18.2 (Fast/Minimalist)' },
    { name: 'Database', version: 'PostgreSQL 15 (Relational Power)' },
    { name: 'ORM', version: 'Prisma 6.19.0 (Type-safe Queries)' },
    { name: 'Caching', version: 'Redis 7 (Sub-millisecond latency)' },
    { name: 'Job Queues', version: 'BullMQ 5.0.0 (Reliable Dispatch)' }
  ]
};

const services = [
  { 
    name: 'PostgreSQL Database', 
    icon: 'database', 
    bg: 'bg-blue-50 dark:bg-blue-900/20', 
    color: 'text-blue-500',
    description: 'Pusat penyimpanan data transaksional terenkripsi dengan proteksi ACID penuh.',
    load: 18
  },
  { 
    name: 'Redis Cache Layer', 
    icon: 'bolt', 
    bg: 'bg-red-50 dark:bg-red-900/20', 
    color: 'text-red-500',
    description: 'Mempercepat respons API hingga 300% melalui caching strategis dan manajemen session.',
    load: 12
  },
  { 
    name: 'Backend API Service', 
    icon: 'api', 
    bg: 'bg-emerald-50 dark:bg-emerald-900/20', 
    color: 'text-emerald-500',
    description: 'Core logic menangani integrasi pembayaran, notifikasi, dan kalkulasi inventory.',
    load: 45
  },
  { 
    name: 'Edge Nginx Gateway', 
    icon: 'web_traffic', 
    bg: 'bg-indigo-50 dark:bg-indigo-900/20', 
    color: 'text-indigo-500',
    description: 'Gerbang utama keamanan dengan SSL otomatis, Load Balancing, dan Gzip compression.',
    load: 22
  }
];

const roles = [
  {
    name: 'Super Admin',
    tagline: 'Orkestrator Kendali Utama Platform',
    icon: 'security',
    iconBg: 'bg-indigo-600',
    headerBg: 'bg-indigo-50/50 dark:bg-indigo-950/20',
    bulletColor: 'bg-indigo-400',
    features: [
      'Manajemen Ekosistem Tenant',
      'Kontrol Lisensi & Billing Global',
      'Audit Trail & System Integrity Logs',
      'Konfigurasi Addon Platform',
      'Global Revenue & Growth Analytics',
      'Platform Health Monitoring'
    ]
  },
  {
    name: 'Admin Tenant (Owner)',
    tagline: 'Nahkoda Bisnis & Strategi Produk',
    icon: 'real_estate_agent',
    iconBg: 'bg-emerald-600',
    headerBg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
    bulletColor: 'bg-emerald-400',
    features: [
      'Inventory & Procurement Management',
      'Pengaturan Harga & Smart Discount',
      'Manajemen Staf & Hak Akses',
      'Laporan Laba/Rugi Komprehensif',
      'Konfigurasi Outlet & Hardware',
      'Analisis Tren Market & Pelanggan'
    ]
  },
  {
    name: 'Supervisor',
    tagline: 'Penjaga Operasional & Integritas Shift',
    icon: 'verified_user',
    iconBg: 'bg-blue-600',
    headerBg: 'bg-blue-50/50 dark:bg-blue-950/20',
    bulletColor: 'bg-blue-400',
    features: [
      'Otorisasi Void & Refund Transaksi',
      'Manajemen Cashbox & Tutup Shift',
      'Approval Stock Adjustment',
      'Monitoring Performa Kasir Real-time',
      'Laporan Penjualan Per Shift',
      'Resolusi Konflik Pesanan'
    ]
  },
  {
    name: 'Kasir (Cashier)',
    tagline: 'Garda Depan Pelayanan Transaksi',
    icon: 'point_of_sale',
    iconBg: 'bg-amber-500',
    headerBg: 'bg-amber-50/50 dark:bg-amber-950/20',
    bulletColor: 'bg-amber-400',
    features: [
      'Smart POS Interface (Fast Checkout)',
      'Manajemen Keranjang & Hold Order',
      'Pencarian Produk Instan',
      'Metode Pembayaran Multi-Channel',
      'Cetak Struk Digital & Fisik',
      'Manajemen Member & Poin'
    ]
  },
  {
    name: 'Kitchen (Dapur)',
    tagline: 'Maestro Eksekusi Hidangan',
    icon: 'soup_kitchen',
    iconBg: 'bg-rose-500',
    headerBg: 'bg-rose-50/50 dark:bg-rose-950/20',
    bulletColor: 'bg-rose-400',
    features: [
      'Kitchen Display System (KDS)',
      'Update Status Pesanan Real-time',
      'Antrian Pesanan Berdasarkan Prioritas',
      'Notifikasi Bahan Baku Menipis',
      'Integrasi Printer Order',
      'Tracking Waktu Persiapan (Lead Time)'
    ]
  }
];

const subscriptionPlans = [
  {
    id: 'basic',
    name: 'BASIC (Starter)',
    price: 'Rp 99rb',
    description: 'Opsi terbaik untuk UMKM yang baru memulai digitalisasi bisnis.',
    points: [
      'Hingga 50 Produk Aktif',
      'Maksimal 3 User Staf',
      '1 Outlet Operasional',
      'Cloud Backup Harian',
      'Laporan Penjualan Dasar',
      'Support Email 24 Jam'
    ],
    popular: false
  },
  {
    id: 'pro',
    name: 'PRO (Growth)',
    price: 'Rp 249rb',
    description: 'Solusi lengkap untuk akselerasi bisnis dengan fitur manajemen stok lanjut.',
    points: [
      'Unlimited Produk & Kategori',
      'Hingga 10 User Staf',
      '3 Outlet Terintegrasi',
      'Advanced Inventory System',
      'Manajemen Supplier & PO',
      'Prioritas Chat Support'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'ENTERPRISE',
    price: 'Rp 599rb',
    description: 'Kendali penuh untuk skema bisnis besar (Franchise/Chain) tanpa batas.',
    points: [
      'Unlimited User & Outlet',
      'Custom Domain Branding',
      'API Access & Integration',
      'Account Manager Khusus',
      'Fitur Loyalty & CRM Lanjut',
      'Service Level Agreement (SLA)'
    ],
    popular: false
  }
];

const addons = [
  {
    name: 'WhatsApp Integration',
    icon: 'message',
    description: 'Kirim struk otomatis dan notifikasi promo langsung ke WhatsApp pelanggan.',
    price: '+ Rp 50rb/bln'
  },
  {
    name: 'Custom Mobile App',
    icon: 'smartphone',
    description: 'Aplikasi Android khusus dengan brand toko Anda untuk pesanan online.',
    price: 'Mulai Rp 150rb/bln'
  },
  {
    name: 'Advanced Analytics',
    icon: 'query_stats',
    description: 'Visualisasi data AI-powered untuk prediksi stok dan tren penjualan.',
    price: '+ Rp 75rb/bln'
  },
  {
    name: 'Hardware Sync',
    icon: 'print',
    description: 'Dukungan penuh tim teknis untuk sinkronisasi printer & cash drawer.',
    price: '+ Rp 25rb/bln'
  },
  {
    name: 'Loyalty Engine',
    icon: 'redeem',
    description: 'Sistem poin, kupon, dan tier membership untuk retensi pelanggan.',
    price: '+ Rp 40rb/bln'
  },
  {
    name: 'Offline Sync Pro',
    icon: 'cloud_off',
    description: 'Jaminan transaksi tetap berjalan meski koneksi internet padam total.',
    price: 'GRATIS (Pro+)'
  }
];
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

/* Custom scrollbar for better UX */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(16, 185, 129, 0.2);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(16, 185, 129, 0.4);
}
</style>
