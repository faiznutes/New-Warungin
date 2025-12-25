<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50">
    <!-- Hero Section -->
    <section class="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div class="flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
        <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 px-2">
          Paket Harga Kasir Warungin - Mulai dari Rp 149rb/bulan
        </h1>
        <p class="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl px-4">
          Pilih paket yang sesuai dengan kebutuhan bisnis UMKM Anda. Mulai dari Rp 149rb/bulan,
          dapatkan semua fitur yang Anda butuhkan untuk mengembangkan bisnis.
        </p>
      </div>
    </section>

    <!-- Pricing Cards -->
    <section class="container mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-12 sm:pb-20">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
        <!-- Starter Plan -->
        <div class="flex flex-col bg-white rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-100">
          <div class="flex flex-col p-5 sm:p-6 md:p-8">
            <div class="mb-4 sm:mb-6">
              <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Paket Warungin Starter</h2>
              <p class="text-sm sm:text-base text-gray-600">Perfect untuk warung baru mulai 🚀</p>
            </div>
            <div class="mb-4 sm:mb-6">
              <div class="flex items-baseline flex-wrap">
                <span class="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">Rp 149</span>
                <span class="text-lg sm:text-xl text-gray-600 ml-2">rb</span>
                <span class="text-sm sm:text-base text-gray-500 ml-2">/bulan</span>
              </div>
              <p class="text-xs sm:text-sm text-gray-500 mt-2">Harga ideal untuk UMKM</p>
            </div>
            <ul class="space-y-2 sm:space-y-3 mb-6 sm:mb-8 flex-1">
              <li class="flex items-start">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-700 text-xs sm:text-sm leading-relaxed">1 Outlet</span>
              </li>
              <li class="flex items-start">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-700 text-xs sm:text-sm leading-relaxed">3-4 User</span>
              </li>
              <li class="flex items-start">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-700 text-xs sm:text-sm leading-relaxed">Limit produk 30</span>
              </li>
              <li class="flex items-start">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-700 text-xs sm:text-sm leading-relaxed">Sistem Dasar</span>
              </li>
              <li class="flex items-start">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-700 text-xs sm:text-sm leading-relaxed">Laporan Penjualan</span>
              </li>
              <li class="flex items-start">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-700 text-xs sm:text-sm leading-relaxed">Dashboard Real-time</span>
              </li>
              <li class="flex items-start">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-700 text-xs sm:text-sm leading-relaxed">Support Email</span>
              </li>
            </ul>
            <router-link
              to="/contact"
              class="w-full px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-semibold text-center"
            >
            Mulai Sekarang
            </router-link>
          </div>
        </div>

        <!-- Boost Plan (Popular) -->
        <div class="flex flex-col bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-2xl transition-all duration-300 transform lg:scale-105 border-4 border-primary-400 relative">
          <div class="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
            <span class="bg-yellow-400 text-gray-900 px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg">
              ⭐ PALING DIPILIH
            </span>
          </div>
          <div class="flex flex-col p-5 sm:p-6 md:p-8">
            <div class="mb-4 sm:mb-6">
              <h2 class="text-xl sm:text-2xl font-bold text-white mb-2">Paket Warungin Boost - Paling Populer</h2>
              <p class="text-sm sm:text-base text-primary-100">Level up bisnis kamu! 💪</p>
            </div>
            <div class="mb-4 sm:mb-6">
              <div class="flex items-baseline flex-wrap gap-2">
                <div class="flex items-baseline">
                  <span class="text-3xl sm:text-4xl md:text-5xl font-bold text-white">Rp 299</span>
                  <span class="text-lg sm:text-xl text-primary-100 ml-2">rb</span>
                  <span class="text-sm sm:text-base text-primary-200 ml-2">/bulan</span>
                </div>
              </div>
              <div class="mt-2">
                <span class="inline-block bg-yellow-400 text-gray-900 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                  Recommended
                </span>
              </div>
              <p class="text-xs sm:text-sm text-primary-100 mt-2">Harga ideal untuk UMKM mid-range</p>
            </div>
            <ul class="space-y-2 sm:space-y-3 mb-6 sm:mb-8 flex-1">
              <li class="flex items-start">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-white text-xs sm:text-sm leading-relaxed">2 Outlet</span>
              </li>
              <li class="flex items-start">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-white text-xs sm:text-sm leading-relaxed">10 User</span>
              </li>
              <li class="flex items-start">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-white text-xs sm:text-sm leading-relaxed">Limit produk 200</span>
              </li>
              <li class="flex items-start">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-white text-xs sm:text-sm leading-relaxed">Sistem lengkap</span>
              </li>
              <li class="flex items-start">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-white text-xs sm:text-sm leading-relaxed">E-menu</span>
              </li>
              <li class="flex items-start">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-white text-xs sm:text-sm leading-relaxed">Member & diskon</span>
              </li>
              <li class="flex items-start">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-white text-xs sm:text-sm leading-relaxed">Analitik standar</span>
              </li>
              <li class="flex items-start">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-white text-xs sm:text-sm leading-relaxed">Support prioritas</span>
              </li>
              <li class="flex items-start">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-white text-xs sm:text-sm leading-relaxed">Import produk dasar</span>
              </li>
            </ul>
            <router-link
              to="/contact"
              class="w-full px-4 sm:px-6 py-2 sm:py-3 bg-white text-primary-600 rounded-xl hover:bg-gray-50 transition font-bold text-center shadow-lg text-sm sm:text-base"
            >
              Mulai Sekarang
            </router-link>
          </div>
        </div>

        <!-- Pro Plan -->
        <div class="flex flex-col bg-white rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-100">
          <div class="flex flex-col p-5 sm:p-6 md:p-8">
            <div class="mb-4 sm:mb-6">
              <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Paket Warungin Pro</h2>
              <p class="text-sm sm:text-base text-gray-600">Untuk bisnis yang lebih besar</p>
            </div>
            <div class="mb-4 sm:mb-6">
              <div class="flex items-baseline">
                <span class="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">Rp 499</span>
                <span class="text-lg sm:text-xl text-gray-600 ml-2">rb</span>
                <span class="text-sm sm:text-base text-gray-500 ml-2">/bulan</span>
              </div>
              <p class="text-xs sm:text-sm text-gray-500 mt-2">Cocok untuk bisnis jadi, lebih murah dari kompetitor</p>
            </div>
            <ul class="space-y-2 sm:space-y-3 mb-6 sm:mb-8 flex-1">
              <li class="flex items-start">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-700 text-xs sm:text-sm leading-relaxed">3 Outlet</span>
              </li>
              <li class="flex items-start">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-700 text-xs sm:text-sm leading-relaxed">20 User</span>
              </li>
              <li class="flex items-start">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-700 text-xs sm:text-sm leading-relaxed">Produk 1000</span>
              </li>
              <li class="flex items-start">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-700 text-xs sm:text-sm leading-relaxed">Analitik lengkap (Laba-rugi, tren)</span>
              </li>
              <li class="flex items-start">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-700 text-xs sm:text-sm leading-relaxed">Import massal</span>
              </li>
              <li class="flex items-start">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-700 text-xs sm:text-sm leading-relaxed">Auto-backup</span>
              </li>
              <li class="flex items-start">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-700 text-xs sm:text-sm leading-relaxed">Multi-store tools</span>
              </li>
              <li class="flex items-start">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-700 text-xs sm:text-sm leading-relaxed">API dasar</span>
              </li>
              <li class="flex items-start">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-700 text-xs sm:text-sm leading-relaxed">Support 24/7 & Training</span>
              </li>
            </ul>
            <router-link
              to="/contact"
              class="w-full px-4 sm:px-6 py-2 sm:py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-semibold text-center text-sm sm:text-base"
            >
              Chat Sales untuk Custom 🔥
            </router-link>
          </div>
        </div>
      </div>

      <!-- Addons Section -->
      <div class="mt-12 sm:mt-16 md:mt-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
            Tambah Fitur dengan <span class="text-primary-600">Addons Premium</span>
          </h2>
          <p class="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Tingkatkan bisnis dengan addon premium. Tambah sesuai kebutuhan, bayar sesuai pakai!
          </p>
        </div>

        <div v-if="loadingAddons" class="text-center py-12">
          <div class="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-gray-600">Memuat addon...</p>
        </div>
        <div v-else>
          <!-- Unlimited Addons (defaultLimit !== null - Tambah Outlet, Pengguna, Produk) -->
          <div v-if="unlimitedAddons.length > 0" class="mb-8">
            <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">Addon Unlimited</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 max-w-5xl mx-auto">
              <div
                v-for="addon in unlimitedAddons"
                :key="addon.id"
                class="bg-gradient-to-br rounded-xl sm:rounded-xl shadow-lg hover:shadow-xl transition p-4 sm:p-5 md:p-6 border from-white to-blue-50 border-blue-100"
              >
                <div class="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 class="text-base sm:text-lg font-bold text-gray-900">{{ addon.name }}</h3>
                </div>
                <p class="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">{{ addon.description }}</p>
                <div class="flex items-baseline mb-3 sm:mb-4 flex-wrap">
                  <span class="text-2xl sm:text-3xl font-bold text-gray-900">Rp {{ formatAddonPrice(addon.price) }}</span>
                  <span class="text-gray-600 ml-2 text-sm sm:text-base">rb</span>
                  <span class="text-gray-500 text-xs sm:text-sm ml-2">/bulan</span>
                </div>
                <ul v-if="addon.details && addon.details.length > 0" class="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600 mb-4">
                  <li v-for="(detail, idx) in addon.details.slice(0, 3)" :key="idx" class="flex items-start">
                    <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span class="leading-relaxed">{{ detail }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Limited Addons (defaultLimit === null - Business Analytics, Export Laporan, dll) -->
          <div v-if="limitedAddons.length > 0" class="mb-8">
            <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">Addon dengan Limit</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 max-w-5xl mx-auto">
              <div
                v-for="addon in limitedAddons"
                :key="addon.id"
                class="bg-gradient-to-br rounded-xl sm:rounded-xl shadow-lg hover:shadow-xl transition p-4 sm:p-5 md:p-6 border from-white to-blue-50 border-blue-100"
              >
                <div class="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 class="text-base sm:text-lg font-bold text-gray-900">{{ addon.name }}</h3>
                </div>
                <p class="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">{{ addon.description }}</p>
                <div class="flex items-baseline mb-3 sm:mb-4 flex-wrap">
                  <span class="text-2xl sm:text-3xl font-bold text-gray-900">Rp {{ formatAddonPrice(addon.price) }}</span>
                  <span class="text-gray-600 ml-2 text-sm sm:text-base">rb</span>
                  <span class="text-gray-500 text-xs sm:text-sm ml-2">/bulan</span>
                </div>
                <div v-if="addon.defaultLimit" class="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                  <span class="font-semibold">Limit:</span> {{ addon.defaultLimit }}
                </div>
                <ul v-if="addon.details && addon.details.length > 0" class="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600 mb-4">
                  <li v-for="(detail, idx) in addon.details.slice(0, 3)" :key="idx" class="flex items-start">
                    <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span class="leading-relaxed">{{ detail }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Coming Soon Addons -->
          <div v-if="comingSoonAddons.length > 0">
            <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">Coming Soon</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 max-w-5xl mx-auto">
              <div
                v-for="addon in comingSoonAddons"
                :key="addon.id"
                class="bg-gradient-to-br rounded-xl sm:rounded-xl shadow-lg hover:shadow-xl transition p-4 sm:p-5 md:p-6 border from-gray-50 to-gray-100 border-gray-200 opacity-75"
              >
                <div class="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 class="text-base sm:text-lg font-bold text-gray-900">{{ addon.name }}</h3>
                  <span class="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded">
                    Coming Soon
                  </span>
                </div>
                <p class="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">{{ addon.description }}</p>
                <div class="flex items-baseline mb-3 sm:mb-4 flex-wrap">
                  <span class="text-2xl sm:text-3xl font-bold text-gray-900">Rp {{ formatAddonPrice(addon.price) }}</span>
                  <span class="text-gray-600 ml-2 text-sm sm:text-base">rb</span>
                  <span class="text-gray-500 text-xs sm:text-sm ml-2">/bulan</span>
                </div>
                <ul v-if="addon.details && addon.details.length > 0" class="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600 mb-4">
                  <li v-for="(detail, idx) in addon.details.slice(0, 3)" :key="idx" class="flex items-start">
                    <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span class="leading-relaxed">{{ detail }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8 text-center">
          <p class="text-gray-600 mb-4">💡 <strong>Tip:</strong> Kombinasi addon bisa dapat diskon hingga 20%!</p>
          <router-link
            to="/contact"
            class="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-semibold"
          >
            Tanya Paket Addon Terbaik
          </router-link>
        </div>
      </div>

      <!-- FAQ Section -->
      <div class="mt-12 sm:mt-16 md:mt-20 max-w-4xl mx-auto px-4 sm:px-6">
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center mb-8 sm:mb-10 md:mb-12 px-2">
          FAQ - Pertanyaan yang Sering Diajukan tentang Paket Warungin
        </h2>
        <div class="space-y-4 sm:space-y-5 md:space-y-6">
          <div class="bg-white rounded-xl shadow-lg p-4 sm:p-5 md:p-6">
            <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Apakah ada trial gratis?</h3>
            <p class="text-sm sm:text-base text-gray-600 leading-relaxed">
              Ya! Semua paket mendapatkan trial gratis 14 hari tanpa perlu kartu kredit. Coba semua fitur tanpa batasan.
            </p>
          </div>
          <div class="bg-white rounded-xl shadow-lg p-4 sm:p-5 md:p-6">
            <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Bisakah saya upgrade paket nanti?</h3>
            <p class="text-sm sm:text-base text-gray-600 leading-relaxed">
              Tentu! Anda bisa upgrade kapan saja. Selisih pembayaran akan dihitung secara proporsional.
            </p>
          </div>
          <div class="bg-white rounded-xl shadow-lg p-4 sm:p-5 md:p-6">
            <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Metode pembayaran apa saja yang diterima?</h3>
            <p class="text-sm sm:text-base text-gray-600 leading-relaxed">
              Kami menerima transfer bank, kartu kredit/debit, dan e-wallet (OVO, GoPay, DANA, LinkAja).
            </p>
          </div>
          <div class="bg-white rounded-xl shadow-lg p-4 sm:p-5 md:p-6">
            <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Apakah data saya aman?</h3>
            <p class="text-sm sm:text-base text-gray-600 leading-relaxed">
              Sangat aman! Data Anda dienkripsi dengan standar industri dan tersimpan di server lokal Indonesia. Backup otomatis setiap hari.
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
import { formatCurrency } from '../../utils/formatters';

useSEO({
  title: 'Paket Harga Sistem Kasir Warungin - Mulai dari Rp 149rb/bulan | Sistem Kasir UMKM',
  description: 'Pilih paket sistem kasir yang sesuai dengan kebutuhan bisnis UMKM Anda. Mulai dari Rp 149rb/bulan, dapatkan semua fitur sistem kasir yang Anda butuhkan untuk mengembangkan bisnis warung dan toko.',
  keywords: 'harga warungin, paket warungin, harga sistem kasir, paket UMKM, sistem kasir murah, aplikasi kasir warung, software toko, sistem kasir online',
});

const availableAddons = ref<any[]>([]);
const loadingAddons = ref(false);

// Check if addon has defaultLimit (Tambah Outlet, Pengguna, Produk - bisa beli berapapun = Unlimited)
const hasDefaultLimit = (addon: any) => {
  return addon.defaultLimit !== null && addon.defaultLimit !== undefined;
};

// Check if addon is coming soon
const isComingSoon = (addon: any) => {
  return addon?.comingSoon === true || addon?.requiresApi === true;
};

// Separate addons into categories
// SWAPPED: Addon dengan defaultLimit (Tambah Outlet, Pengguna, Produk) = Unlimited (bisa beli berapapun)
//          Addon tanpa defaultLimit (Business Analytics, dll) = Limited
const unlimitedAddons = computed(() => {
  return filteredAvailableAddons.value.filter(addon => hasDefaultLimit(addon) && !isComingSoon(addon));
});

const limitedAddons = computed(() => {
  return filteredAvailableAddons.value.filter(addon => !hasDefaultLimit(addon) && !isComingSoon(addon));
});

const comingSoonAddons = computed(() => {
  return filteredAvailableAddons.value.filter(addon => isComingSoon(addon));
});

const filteredAvailableAddons = computed(() => {
  // Remove duplicates based on id first
  const uniqueAddons = availableAddons.value.filter((addon, index, self) => 
    index === self.findIndex(a => a.id === addon.id)
  );
  
  // Sort: 
  // 1. Unlimited (defaultLimit !== null - Tambah Outlet, Pengguna, Produk) di atas
  // 2. Limited (defaultLimit === null - Business Analytics, dll) di tengah
  // 3. Coming soon (comingSoon === true) di bawah
  return uniqueAddons.sort((a, b) => {
    const aIsComingSoon = isComingSoon(a);
    const bIsComingSoon = isComingSoon(b);
    const aHasDefaultLimit = hasDefaultLimit(a);
    const bHasDefaultLimit = hasDefaultLimit(b);
    
    // Coming soon selalu di bawah
    if (aIsComingSoon && !bIsComingSoon) return 1;
    if (!aIsComingSoon && bIsComingSoon) return -1;
    
    // Jika keduanya coming soon, urutkan seperti biasa
    if (aIsComingSoon && bIsComingSoon) return 0;
    
    // Unlimited (dengan defaultLimit) di atas, Limited (tanpa defaultLimit) di bawah
    if (aHasDefaultLimit && !bHasDefaultLimit) return -1;
    if (!aHasDefaultLimit && bHasDefaultLimit) return 1;
    
    return 0;
  });
});

const loadAddons = async () => {
  loadingAddons.value = true;
  try {
    const response = await api.get('/addons/available');
    availableAddons.value = response.data || [];
  } catch (error: any) {
    console.error('Error loading addons:', error);
    availableAddons.value = [];
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

