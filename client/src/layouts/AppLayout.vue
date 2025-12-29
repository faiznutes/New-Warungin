<template>
  <div class="min-h-screen bg-gray-50 flex w-full">
    <!-- Skip to Content Link -->
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[60] bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg">Skip to content</a>
    <!-- Sidebar -->
    <aside
      class="w-64 bg-white shadow-xl fixed h-full z-50 transition-transform duration-300 ease-in-out print:hidden"
      :class="{ 
        '-translate-x-full lg:translate-x-0': !sidebarOpen && windowWidth < 1024,
        'translate-x-0': sidebarOpen || windowWidth >= 1024
      }"
    >
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div class="p-6 border-b border-gray-200 flex-shrink-0">
          <router-link to="/app/dashboard" class="flex items-center hover:opacity-90 transition-opacity group">
            <span class="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Warungin</span>
          </router-link>
        </div>

        <!-- Menu Search -->
        <div class="px-4 py-3 border-b border-gray-200 flex-shrink-0">
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">search</span>
            <input
              v-model="menuSearchQuery"
              type="text"
              placeholder="Cari menu..."
              class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            <button
              v-if="menuSearchQuery"
              @click="menuSearchQuery = ''"
              class="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <span class="material-symbols-outlined text-slate-400 text-[16px]">close</span>
            </button>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-4 py-4 space-y-1 overflow-y-auto overscroll-contain">
          <!-- Search Results (when searching) -->
          <div v-if="menuSearchQuery.trim()" class="mb-4">
            <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
              Hasil Pencarian ({{ filteredMenuItems.length }})
            </div>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredMenuItems"
                :key="item.path"
                :to="item.path"
                class="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 group"
                active-class="bg-blue-50 text-blue-600 font-semibold"
                @click="closeSidebarOnMobile(); menuSearchQuery = ''"
              >
                <span class="material-symbols-outlined text-[20px] text-slate-400 group-hover:text-blue-600">
                  {{ getMenuIcon(item.path) }}
                </span>
                <span class="font-medium flex-1" v-html="highlightMatch(item.label, menuSearchQuery)"></span>
                <span class="ml-auto text-xs text-slate-400 font-medium capitalize">{{ item.section }}</span>
              </router-link>
            </div>
            <div v-if="filteredMenuItems.length === 0" class="text-center py-8 text-slate-400">
              <span class="material-symbols-outlined text-[32px] mb-2 block">search_off</span>
              <p class="text-sm font-medium">Tidak ada menu ditemukan</p>
            </div>
          </div>

          <!-- Regular Menu (when not searching) -->
          <template v-else>
          <!-- Operasional Section -->
          <div class="mb-2">
            <button
              @click="toggleMenu('operasional')"
              class="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
            >
              <span>Operasional</span>
              <svg
                class="w-4 h-4 transition-transform duration-200"
                :class="{ 'rotate-180': expandedMenus.operasional }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              v-show="expandedMenus.operasional"
              class="mt-1 space-y-1 transition-all duration-200"
            >
              <router-link
                to="/app/dashboard"
                class="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 group"
                active-class="bg-blue-50 text-blue-600 font-semibold"
                exact-active-class="bg-blue-50 text-blue-600 font-semibold"
                @click="closeSidebarOnMobile"
              >
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span class="font-medium">Dashboard</span>
              </router-link>

              <router-link
                v-if="userRole === 'ADMIN_TENANT' || userRole === 'SUPER_ADMIN' || (userRole === 'SUPERVISOR' && canManageProducts) || (userRole === 'CASHIER' && canManageProducts)"
                to="/app/products"
                class="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 group"
                active-class="bg-blue-50 text-blue-600 font-semibold"
                @click="closeSidebarOnMobile"
              >
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span class="font-medium">Produk</span>
                <span v-if="criticalStockCount > 0" class="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm shadow-red-500/20 animate-pulse">{{ criticalStockCount }}</span>
              </router-link>

              <router-link
                v-if="userRole === 'ADMIN_TENANT' || userRole === 'SUPER_ADMIN' || userRole === 'SUPERVISOR'"
                to="/app/products/adjustments"
                class="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 group"
                active-class="bg-blue-50 text-blue-600 font-semibold"
                @click="closeSidebarOnMobile"
              >
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span class="font-medium">Penyesuaian Stok</span>
              </router-link>

              <router-link
                v-if="userRole === 'ADMIN_TENANT' || userRole === 'SUPER_ADMIN' || (userRole === 'SUPERVISOR' && canEditOrders) || userRole === 'CASHIER'"
                to="/app/orders"
                class="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 group"
                active-class="bg-blue-50 text-blue-600 font-semibold"
                @click="closeSidebarOnMobile"
              >
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span class="font-medium">Pesanan & Transaksi</span>
                <span v-if="pendingOrdersCount > 0" class="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm shadow-red-500/20 animate-pulse">{{ pendingOrdersCount }}</span>
              </router-link>

              <router-link
                v-if="userRole === 'ADMIN_TENANT' || userRole === 'SUPER_ADMIN' || (userRole === 'SUPERVISOR' && canManageCustomers) || (userRole === 'CASHIER' && canManageCustomers)"
                to="/app/customers"
                class="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 group"
                active-class="bg-blue-50 text-blue-600 font-semibold"
                @click="closeSidebarOnMobile"
              >
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span class="font-medium">Pelanggan</span>
              </router-link>
            </div>
          </div>

          <!-- Laporan & Analitik Section -->
          <div v-if="(userRole === 'ADMIN_TENANT' || userRole === 'SUPER_ADMIN' || (userRole === 'SUPERVISOR' && canViewReports) || (userRole === 'CASHIER' && canViewReports)) && userRole !== 'KITCHEN'" class="pt-4 mt-4 border-t border-gray-200">
            <button
              @click="toggleMenu('laporan')"
              class="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
            >
              <span>Laporan & Analitik</span>
              <svg
                class="w-4 h-4 transition-transform duration-200"
                :class="{ 'rotate-180': expandedMenus.laporan }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              v-show="expandedMenus.laporan"
              class="mt-1 space-y-1 transition-all duration-200"
            >
              <router-link
                to="/app/reports"
                class="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 group"
                active-class="bg-blue-50 text-blue-600 font-semibold"
                @click="closeSidebarOnMobile"
              >
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span class="font-medium">Laporan</span>
              </router-link>

              <!-- Business Analytics Submenu -->
              <div v-if="hasBusinessAnalytics" class="ml-4 mt-1 space-y-1">
                <router-link
                  to="/app/analytics"
                  class="flex items-center space-x-3 px-4 py-2 rounded-xl transition-all duration-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 group text-sm"
                  active-class="bg-blue-50 text-blue-600 font-semibold"
                  @click="closeSidebarOnMobile"
                >
                  <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span class="font-medium">Advanced Analytics</span>
                </router-link>

                <router-link
                  to="/app/finance"
                  class="flex items-center space-x-3 px-4 py-2 rounded-xl transition-all duration-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 group text-sm"
                  active-class="bg-blue-50 text-blue-600 font-semibold"
                  @click="closeSidebarOnMobile"
                >
                  <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="font-medium">Keuangan</span>
                </router-link>

                <router-link
                  to="/app/profit-loss"
                  class="flex items-center space-x-3 px-4 py-2 rounded-xl transition-all duration-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 group text-sm"
                  active-class="bg-blue-50 text-blue-600 font-semibold"
                  @click="closeSidebarOnMobile"
                >
                  <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span class="font-medium">Laporan Laba Rugi</span>
                </router-link>
              </div>
            </div>
          </div>

          <!-- Manajemen Section -->
          <div v-if="userRole === 'ADMIN_TENANT' || userRole === 'SUPER_ADMIN'" class="pt-4 mt-4 border-t border-gray-200">
            <button
              @click="toggleMenu('manajemen')"
              class="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
            >
              <span>Manajemen</span>
              <svg
                class="w-4 h-4 transition-transform duration-200"
                :class="{ 'rotate-180': expandedMenus.manajemen }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              v-show="expandedMenus.manajemen"
              class="mt-1 space-y-1 transition-all duration-200"
            >
              <router-link
                to="/app/users"
                class="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 group"
                active-class="bg-blue-50 text-blue-600 font-semibold"
                @click="closeSidebarOnMobile"
              >
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span class="font-medium">Pengguna</span>
              </router-link>

              <router-link
                v-if="userRole === 'ADMIN_TENANT'"
                to="/app/stores"
                class="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 group"
                active-class="bg-blue-50 text-blue-600 font-semibold"
                @click="closeSidebarOnMobile"
              >
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span class="font-medium">Kelola Store</span>
              </router-link>
            </div>
          </div>

          <!-- Pengaturan Section -->
          <div v-if="userRole === 'ADMIN_TENANT' || userRole === 'SUPER_ADMIN'" class="pt-4 mt-4 border-t border-gray-200">
            <button
              @click="toggleMenu('pengaturan')"
              class="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
            >
              <span>Pengaturan</span>
              <svg
                class="w-4 h-4 transition-transform duration-200"
                :class="{ 'rotate-180': expandedMenus.pengaturan }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              v-show="expandedMenus.pengaturan"
              class="mt-1 space-y-1 transition-all duration-200"
            >
              <router-link
                to="/app/subscription"
                class="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 group"
                active-class="bg-blue-50 text-blue-600 font-semibold"
                @click="closeSidebarOnMobile"
              >
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="font-medium">Berlangganan</span>
              </router-link>

              <router-link
                v-if="userRole === 'ADMIN_TENANT'"
                to="/app/addons"
                class="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 group"
                active-class="bg-blue-50 text-blue-600 font-semibold"
                @click="closeSidebarOnMobile"
              >
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <span class="font-medium">Addon</span>
              </router-link>

              <router-link
                v-if="userRole === 'ADMIN_TENANT' || userRole === 'SUPERVISOR' || userRole === 'SUPER_ADMIN'"
                to="/app/rewards"
                class="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 group"
                active-class="bg-blue-50 text-blue-600 font-semibold"
                @click="closeSidebarOnMobile"
              >
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="font-medium">Point Gratis</span>
              </router-link>
            </div>
          </div>
          </template>
        </nav>

        <!-- Recent Items / Quick Links -->
        <div v-if="recentItems.length > 0" class="px-4 py-3 border-t border-gray-200 flex-shrink-0">
          <div class="mb-2">
            <div class="flex items-center justify-between px-2 mb-2">
              <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Akses Cepat</span>
              <button
                @click="clearRecentItems"
                class="text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
                title="Hapus semua"
              >
                Hapus
              </button>
            </div>
            <div class="space-y-1">
              <router-link
                v-for="item in recentItems"
                :key="item.path"
                :to="item.path"
                class="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600 group text-sm"
                active-class="bg-blue-50 text-blue-600"
                @click="closeSidebarOnMobile"
              >
                <span class="material-symbols-outlined text-[18px] flex-shrink-0">{{ item.icon }}</span>
                <span class="font-medium truncate flex-1">{{ item.name }}</span>
              </router-link>
            </div>
          </div>
        </div>

        <!-- User Section -->
        <div class="p-4 border-t border-gray-200 flex-shrink-0">
          <div class="flex items-center space-x-3 mb-3">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-blue-700 font-semibold text-sm">{{ userInitials }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ userName }}</p>
              <p class="text-xs text-gray-500 truncate">{{ userEmail }}</p>
            </div>
            <router-link to="/app/settings/preferences" class="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors" title="Preferensi">
               <span class="material-symbols-outlined text-[20px]">settings</span>
            </router-link>
          </div>
          <button
            @click="handleLogout"
            class="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium flex items-center justify-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Overlay for mobile/tablet -->
    <div
      v-if="sidebarOpen && windowWidth < 1024"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
      @click="sidebarOpen = false"
    ></div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col lg:ml-64 w-full">
      <!-- Top Bar -->
      <header class="bg-white shadow-sm sticky top-0 z-30 print:hidden">
        <div class="flex items-center justify-between px-4 py-4">
          <button
            @click="sidebarOpen = !sidebarOpen"
            class="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 touch-manipulation"
            aria-label="Toggle menu"
          >
            <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div class="flex items-center space-x-4 flex-1 lg:flex-none">
            <h1 class="text-xl font-semibold" :class="pageTitle === 'Warungin' ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 bg-clip-text text-transparent' : 'text-gray-900'">
              {{ pageTitle }}
            </h1>
          </div>
          <div class="flex items-center space-x-2">
            <!-- Global Search Trigger -->
            <button
               @click="openGlobalSearch"
               class="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all group"
               title="Cari (Ctrl+K)"
            >
               <span class="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">search</span>
               <span class="hidden md:inline text-xs font-bold text-slate-400 group-hover:text-blue-600">Cari <span class="bg-slate-100 px-1 rounded ml-1 text-[9px]">Ctrl+K</span></span>
            </button>

            <!-- Help Button -->
            <button
              @click="showHelpModal = true"
              class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all group"
              title="Bantuan"
            >
              <span class="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">help</span>
            </button>

            <!-- Notification Button for Admin Tenant -->
            <button
              v-if="userRole === 'ADMIN_TENANT'"
              @click="showInfoModal = true"
              class="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              title="Informasi Penting"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span
                v-if="hasUnreadInfo"
                class="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"
              ></span>
            </button>
          </div>
          <!-- Tenant Selector for Super Admin -->
          <div v-if="authStore.isSuperAdmin && authStore.tenants.length > 0" class="hidden md:flex items-center space-x-2">
            <select
              v-model="selectedTenant"
              @change="handleTenantChange"
              class="px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white min-w-[150px]"
            >
              <option value="">Pilih Tenant</option>
              <option v-for="tenant in authStore.tenants" :key="tenant.id" :value="tenant.id">
                {{ tenant.name }}
              </option>
            </select>
          </div>

          <!-- Store Selector (for Admin Tenant & Supervisor) -->
          <div v-if="shouldShowStoreSelector" class="hidden md:flex items-center space-x-2 animate-in fade-in duration-300">
             <div class="relative">
                <select
                  v-model="selectedStoreId"
                  @change="handleStoreChange"
                  class="pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[160px] appearance-none cursor-pointer font-bold text-slate-700"
                >
                  <option value="">Semua Store</option>
                  <option v-for="store in stores" :key="store.id" :value="store.id">
                    {{ store.name }}
                  </option>
                </select>
                <div class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-blue-600">
                   <span class="material-symbols-outlined text-[18px]">storefront</span>
                </div>
                <div class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                   <span class="material-symbols-outlined text-[18px]">expand_more</span>
                </div>
             </div>
          </div>
          
          <!-- Store Indicator (for Cashier / Kitchen / Staff) -->
          <div v-if="!shouldShowStoreSelector && currentStoreName" class="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600">
             <span class="material-symbols-outlined text-[18px] text-blue-600">store</span>
             <span>{{ currentStoreName }}</span>
          </div>

          <div class="w-8 lg:hidden"></div>
        </div>
      </header>

      <!-- Page Content -->
      <main 
        id="main-content" 
        ref="mainContentRef"
        class="flex-1 w-full overflow-x-hidden pb-24 lg:pb-6 focus:outline-none touch-pan-y" 
        tabindex="-1"
      >
        <router-view />
      </main>

      <!-- Mobile Bottom Navigation -->
      <div class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 flex justify-around items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] text-[10px] font-medium safe-area-bottom print:hidden">
        <router-link to="/app/dashboard" active-class="text-blue-600" class="flex flex-col items-center gap-1 p-2 text-slate-400 min-w-[60px]">
          <span class="material-symbols-outlined text-2xl">dashboard</span>
          <span>Home</span>
        </router-link>
        
        <router-link to="/app/orders" active-class="text-blue-600" class="flex flex-col items-center gap-1 p-2 text-slate-400 min-w-[60px]">
          <span class="material-symbols-outlined text-2xl">receipt_long</span>
          <span>Pesanan</span>
        </router-link>
        
        <router-link to="/app/pos" active-class="text-blue-600" class="flex flex-col items-center gap-1 p-2 text-slate-400 min-w-[60px] -mt-8">
           <div class="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/30 border-4 border-gray-50">
              <span class="material-symbols-outlined text-3xl">point_of_sale</span>
           </div>
           <span class="font-bold text-blue-600 mt-1">POS</span>
        </router-link>

        <router-link to="/app/products" active-class="text-blue-600" class="flex flex-col items-center gap-1 p-2 text-slate-400 min-w-[60px]">
          <span class="material-symbols-outlined text-2xl">inventory_2</span>
          <span>Produk</span>
        </router-link>

        <button @click="sidebarOpen = true" class="flex flex-col items-center gap-1 p-2 text-slate-400 min-w-[60px]">
           <span class="material-symbols-outlined text-2xl">menu</span>
           <span>Menu</span>
        </button>
      </div>
    </div>
    
    <!-- Admin Info Modal -->
    <AdminInfoModal
      :show="showInfoModal"
      @close="handleInfoModalClose"
      @dont-show-today="handleDontShowToday"
    />
    
    <!-- Keyboard Shortcuts Modal -->
    <KeyboardShortcutsModal
      :show="showShortcutsModal"
      @close="showShortcutsModal = false"
    />

    <!-- Global Search Modal -->
    <GlobalSearch ref="globalSearchRef" />
    
    <!-- Help Modal -->
    <HelpModal
      :show="showHelpModal"
      :help-content="currentHelp"
      @close="showHelpModal = false"
    />
    
    <!-- Offline Indicator -->
    <OfflineIndicator />
    
    <!-- Welcome Tour -->
    <WelcomeTour />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { usePermissions } from '../composables/usePermissions';
import api from '../api';
import AdminInfoModal from '../components/AdminInfoModal.vue';
import KeyboardShortcutsModal from '../components/KeyboardShortcutsModal.vue';
import GlobalSearch from '../components/GlobalSearch.vue';
import HelpModal from '../components/HelpModal.vue';
import OfflineIndicator from '../components/OfflineIndicator.vue';
import WelcomeTour from '../components/WelcomeTour.vue';
import { useStockAlerts } from '../composables/useStockAlerts';
import { useHelp } from '../composables/useHelp';
import { useRecentItems } from '../composables/useRecentItems';

const router = useRouter();
const route = useRoute();
const { recentItems, addRecentItem } = useRecentItems();
const authStore = useAuthStore();
const { canManageProducts, canViewReports, canEditOrders, canManageCustomers } = usePermissions();
const { criticalStockCount, fetchCriticalStock } = useStockAlerts();

// Pending orders count for badge (Kitchen role)
const pendingOrdersCount = ref(0);
let pendingOrdersInterval: ReturnType<typeof setInterval> | null = null;

const fetchPendingOrdersCount = async () => {
  // Only fetch for KITCHEN role or if user has kitchen access
  if (userRole.value !== 'KITCHEN' && userRole.value !== 'ADMIN_TENANT' && userRole.value !== 'SUPERVISOR') {
    return;
  }
  
  try {
    const response = await api.get('/orders', {
      params: {
        status: 'PENDING',
        limit: 1,
        page: 1,
      }
    });
    
    // Get total count from pagination or data length
    if (response.data.pagination?.total !== undefined) {
      pendingOrdersCount.value = response.data.pagination.total;
    } else if (Array.isArray(response.data.data)) {
      pendingOrdersCount.value = response.data.data.length;
    } else {
      pendingOrdersCount.value = 0;
    }
  } catch (error) {
    console.error('Failed to fetch pending orders count:', error);
    pendingOrdersCount.value = 0;
  }
};

// Watch for permission changes to update menu visibility
watch(() => authStore.user, (newUser) => {
  if (newUser) {
    // Force reactivity update when user/permissions change
    console.log('User permissions updated:', (newUser as any).permissions);
  }
}, { deep: true, immediate: true });

const sidebarOpen = ref(false);
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024);
const selectedTenant = ref<string>('');
const openSubmenus = ref<Record<string, boolean>>({});
// Use internal ref that we control, and expose via computed property that always returns array
const _activeAddons = ref<any[]>([]);

// Helper function to always get a valid array from activeAddons
// GUARD CLAUSE: Triple-check untuk memastikan selalu array
const getActiveAddons = (): any[] => {
  try {
    const value = _activeAddons.value;
    
    // LOGGING: Log untuk debugging jika value tidak valid
    if (value !== null && value !== undefined && !Array.isArray(value)) {
      console.warn('[AppLayout] getActiveAddons: Value is not array, type:', typeof value, 'value:', value);
    }
    
    if (value === null || value === undefined || !Array.isArray(value)) {
      // AUTO-FIX: Auto-fix if not array
      _activeAddons.value = [];
      return [];
    }
    // Double-check: ensure it's really an array
    if (!Array.isArray(value)) {
      _activeAddons.value = [];
      return [];
    }
    return value;
  } catch (error) {
    console.error('[AppLayout] Error in getActiveAddons:', error);
    _activeAddons.value = [];
    return [];
  }
};

// Helper function to safely set activeAddons (always ensures it's an array)
// NORMALISASI DATA: Setiap data yang masuk akan dinormalisasi menjadi array
const setActiveAddons = (value: any): void => {
  try {
    // LOGGING untuk debugging - log tipe dan isi data yang masuk
    console.log('[AppLayout] setActiveAddons called with:', {
      type: typeof value,
      isArray: Array.isArray(value),
      value: value,
      hasData: value?.data ? 'yes' : 'no',
      hasAddons: value?.addons ? 'yes' : 'no'
    });
    
    // NORMALISASI: Pastikan selalu array
    if (Array.isArray(value)) {
      _activeAddons.value = value;
      console.log('[AppLayout] setActiveAddons: Set as array, length:', value.length);
      return;
    }
    if (value && typeof value === 'object') {
      if (Array.isArray(value.data)) {
        _activeAddons.value = value.data;
        console.log('[AppLayout] setActiveAddons: Extracted from value.data, length:', value.data.length);
        return;
      }
      if (Array.isArray(value.addons)) {
        _activeAddons.value = value.addons;
        console.log('[AppLayout] setActiveAddons: Extracted from value.addons, length:', value.addons.length);
        return;
      }
    }
    // FALLBACK: Jika tidak valid, set ke array kosong
    _activeAddons.value = [];
    console.log('[AppLayout] setActiveAddons: Invalid data, set to empty array');
  } catch (error) {
    console.error('[AppLayout] Error in setActiveAddons:', error);
    _activeAddons.value = [];
  }
};

// Helper function to safely call array methods (prevents runtime errors if not array)
const safeArrayMethod = <T, R>(arr: T[] | any, method: (arr: T[]) => R, fallback: R): R => {
  try {
    if (!arr || !Array.isArray(arr)) {
      return fallback;
    }
    return method(arr);
  } catch (error) {
    console.error('[AppLayout] safeArrayMethod error:', error);
    return fallback;
  }
};

// Computed property that always returns an array (safer than direct ref access)
const activeAddons = computed({
  get: (): any[] => {
    const result = getActiveAddons();
    // Triple-check: ensure computed property always returns array
    if (!Array.isArray(result)) {
      return [];
    }
    return result;
  },
  set: (value: any) => setActiveAddons(value)
});

const userRole = computed(() => authStore.user?.role || '');
const showInfoModal = ref(false);
const showShortcutsModal = ref(false);
const showHelpModal = ref(false);
const hasUnreadInfo = ref(false);
const menuSearchQuery = ref('');
const { currentHelp } = useHelp();
const mainContentRef = ref<HTMLElement | null>(null);

// Menu items structure for search
const menuItems = computed(() => {
  const items: Array<{ path: string; label: string; section: string; icon?: string }> = [];
  
  // Operasional
  items.push({ path: '/app/dashboard', label: 'Dashboard', section: 'operasional' });
  if (userRole.value === 'ADMIN_TENANT' || userRole.value === 'SUPER_ADMIN' || (userRole.value === 'SUPERVISOR' && canManageProducts.value) || (userRole.value === 'CASHIER' && canManageProducts.value)) {
    items.push({ path: '/app/products', label: 'Produk', section: 'operasional' });
  }
  if (userRole.value === 'ADMIN_TENANT' || userRole.value === 'SUPER_ADMIN' || userRole.value === 'SUPERVISOR') {
    items.push({ path: '/app/products/adjustments', label: 'Penyesuaian Stok', section: 'operasional' });
  }
  if (userRole.value === 'ADMIN_TENANT' || userRole.value === 'SUPER_ADMIN' || (userRole.value === 'SUPERVISOR' && canEditOrders.value) || userRole.value === 'CASHIER') {
    items.push({ path: '/app/orders', label: 'Pesanan & Transaksi', section: 'operasional' });
  }
  if (userRole.value === 'ADMIN_TENANT' || userRole.value === 'SUPER_ADMIN' || (userRole.value === 'SUPERVISOR' && canManageCustomers.value) || (userRole.value === 'CASHIER' && canManageCustomers.value)) {
    items.push({ path: '/app/customers', label: 'Pelanggan', section: 'operasional' });
  }
  
  // Laporan
  if ((userRole.value === 'ADMIN_TENANT' || userRole.value === 'SUPER_ADMIN' || (userRole.value === 'SUPERVISOR' && canViewReports.value) || (userRole.value === 'CASHIER' && canViewReports.value)) && userRole.value !== 'KITCHEN') {
    items.push({ path: '/app/reports', label: 'Laporan', section: 'laporan' });
    items.push({ path: '/app/reports/global', label: 'Laporan Global', section: 'laporan' });
    items.push({ path: '/app/reports/advanced', label: 'Laporan Lanjutan', section: 'laporan' });
  }
  
  // Manajemen
  if (userRole.value === 'ADMIN_TENANT' || userRole.value === 'SUPER_ADMIN' || userRole.value === 'SUPERVISOR') {
    items.push({ path: '/app/users', label: 'Pengguna', section: 'manajemen' });
  }
  if (userRole.value === 'ADMIN_TENANT') {
    items.push({ path: '/app/stores', label: 'Kelola Store', section: 'manajemen' });
  }
  
  // Pengaturan
  if (userRole.value === 'ADMIN_TENANT' || userRole.value === 'SUPER_ADMIN') {
    items.push({ path: '/app/settings/preferences', label: 'Preferensi', section: 'pengaturan' });
    items.push({ path: '/app/settings/system', label: 'Pengaturan Sistem', section: 'pengaturan' });
  }
  
  return items;
});

// Filter menu items based on search query
const filteredMenuItems = computed(() => {
  if (!menuSearchQuery.value.trim()) {
    return menuItems.value;
  }
  
  const query = menuSearchQuery.value.toLowerCase().trim();
  return menuItems.value.filter(item => 
    item.label.toLowerCase().includes(query) ||
    item.path.toLowerCase().includes(query) ||
    item.section.toLowerCase().includes(query)
  );
});

// Auto-expand sections when searching
watch(menuSearchQuery, (query) => {
  if (query.trim()) {
    const matchedSections = new Set(filteredMenuItems.value.map(item => item.section));
    Object.keys(expandedMenus.value).forEach(key => {
      expandedMenus.value[key as keyof typeof expandedMenus.value] = matchedSections.has(key);
    });
  }
});

// Global Search
const globalSearchRef = ref<any>(null);
const openGlobalSearch = () => {
  globalSearchRef.value?.open();
};

// Menu expand/collapse state - all closed by default
const expandedMenus = ref({
  operasional: false,
  laporan: false,
  manajemen: false,
  pengaturan: false,
});

// Toggle menu section
const toggleMenu = (menuKey: keyof typeof expandedMenus.value) => {
  const isCurrentlyOpen = expandedMenus.value[menuKey];
  
  // If clicking to open, close all other menus first
  if (!isCurrentlyOpen) {
    Object.keys(expandedMenus.value).forEach(key => {
      if (key !== menuKey) {
        expandedMenus.value[key as keyof typeof expandedMenus.value] = false;
      }
    });
  }
  
  // Toggle the clicked menu
  expandedMenus.value[menuKey] = !isCurrentlyOpen;
  
  // Save to localStorage
  localStorage.setItem('expandedMenus', JSON.stringify(expandedMenus.value));
};

// Get menu icon based on path
const getMenuIcon = (path: string): string => {
  const iconMap: Record<string, string> = {
    '/app/dashboard': 'dashboard',
    '/app/products': 'inventory_2',
    '/app/products/adjustments': 'inventory',
    '/app/orders': 'receipt_long',
    '/app/customers': 'person',
    '/app/reports': 'assessment',
    '/app/reports/global': 'bar_chart',
    '/app/reports/advanced': 'analytics',
    '/app/users': 'group',
    '/app/stores': 'store',
    '/app/settings/preferences': 'settings',
    '/app/settings/system': 'tune',
  };
  return iconMap[path] || 'link';
};

// Highlight matched text in search results
const highlightMatch = (text: string, query: string): string => {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-emerald-200 dark:bg-blue-900/50 text-blue-900 dark:text-emerald-200 rounded px-0.5">$1</mark>');
};

// Auto-expand menu based on current route
// Only expand the relevant menu section, close others
const autoExpandMenu = () => {
  const currentPath = route.path;
  
  // Close all menus first
  expandedMenus.value.operasional = false;
  expandedMenus.value.laporan = false;
  expandedMenus.value.manajemen = false;
  expandedMenus.value.pengaturan = false;
  
  // Open only the relevant menu section based on current route
  if (currentPath.includes('/dashboard') || currentPath.includes('/products') || 
      currentPath.includes('/orders') || currentPath.includes('/customers')) {
    expandedMenus.value.operasional = true;
  } else if (currentPath.includes('/reports') || currentPath.includes('/analytics') || 
      currentPath.includes('/finance') || currentPath.includes('/profit-loss')) {
    expandedMenus.value.laporan = true;
  } else if (currentPath.includes('/users')) {
    expandedMenus.value.manajemen = true;
  } else if (currentPath.includes('/subscription') || currentPath.includes('/addons') || 
      currentPath.includes('/settings')) {
    expandedMenus.value.pengaturan = true;
  } else {
    // Default: if on dashboard route, open operasional menu
    if (currentPath === '/app/dashboard' || currentPath === '/app') {
      expandedMenus.value.operasional = true;
    }
  }
};

// Load saved menu state from localStorage (but don't override auto-expand for current route)
const loadMenuState = () => {
  // Don't load saved state - always start fresh
  // Auto-expand based on current route (will open dashboard menu if on dashboard)
  autoExpandMenu();
};

// Check if info modal should be shown (once per day)
const checkShouldShowInfo = () => {
  if (userRole.value !== 'ADMIN_TENANT') {
    return false;
  }
  
  const lastShownDate = localStorage.getItem('adminInfoLastShown');
  const today = new Date().toDateString();
  
  if (lastShownDate !== today) {
    return true;
  }
  
  return false;
};

// Check for unread info (show badge if not shown today)
const checkUnreadInfo = () => {
  if (userRole.value !== 'ADMIN_TENANT') {
    hasUnreadInfo.value = false;
    return;
  }
  
  const lastShownDate = localStorage.getItem('adminInfoLastShown');
  const today = new Date().toDateString();
  
  hasUnreadInfo.value = lastShownDate !== today;
};

const handleInfoModalClose = () => {
  // Save today's date when modal is closed (so it won't show again today)
  const today = new Date().toDateString();
  localStorage.setItem('adminInfoLastShown', today);
  hasUnreadInfo.value = false;
  showInfoModal.value = false;
};

const handleDontShowToday = () => {
  // Same as close - save today's date
  handleInfoModalClose();
};

// Load active addons
const loadAddons = async () => {
  if (userRole.value === 'ADMIN_TENANT' || userRole.value === 'SUPER_ADMIN') {
    try {
      const response = await api.get('/addons');
      
      // LOGGING: Log response structure untuk debugging
      console.log('[AppLayout] loadAddons - API Response:', {
        type: typeof response?.data,
        isArray: Array.isArray(response?.data),
        hasData: response?.data?.data ? 'yes' : 'no',
        hasAddons: response?.data?.addons ? 'yes' : 'no',
        data: response?.data
      });
      
      // NORMALISASI: Use helper function to safely set (always ensures array)
      setActiveAddons(response.data);
    } catch (error) {
      console.error('[AppLayout] Failed to load addons:', error);
      // FALLBACK: Set ke array kosong jika error
      setActiveAddons([]);
    }
    
    // GUARD CLAUSE: Final validation using helper function
    getActiveAddons(); // This will auto-fix if needed
  }
};

// Watch for role changes to check info status
watch(() => userRole.value, () => {
  checkUnreadInfo();
  if (checkShouldShowInfo()) {
    showInfoModal.value = true;
  }
  loadAddons();
}, { immediate: true });

const hasBusinessAnalytics = computed(() => {
  try {
    // TRIPLE GUARD: Check directly on value before calling any methods
    const addonsToCheck = activeAddons.value;
    if (!addonsToCheck || !Array.isArray(addonsToCheck)) {
      console.warn('[AppLayout hasBusinessAnalytics] activeAddons is not valid:', {
        type: typeof addonsToCheck,
        isArray: Array.isArray(addonsToCheck),
        value: addonsToCheck
      });
      return false;
    }
    
    // Use safe wrapper as additional layer
    return safeArrayMethod(
      addonsToCheck,
      (addons) => {
        try {
          // Final check inside
          if (!Array.isArray(addons)) return false;
          return addons.some(
            (addon) => addon && addon.addonType === 'BUSINESS_ANALYTICS' && addon.status === 'active'
          );
        } catch (error) {
          console.error('Error in hasBusinessAnalytics .some():', error);
          return false;
        }
      },
      false
    );
  } catch (error) {
    console.error('[AppLayout hasBusinessAnalytics] Outer error:', error);
    return false;
  }
});

const hasDeliveryMarketing = computed(() => {
  try {
    // TRIPLE GUARD: Check directly on value before calling any methods
    const addonsToCheck = activeAddons.value;
    if (!addonsToCheck || !Array.isArray(addonsToCheck)) {
      console.warn('[AppLayout hasDeliveryMarketing] activeAddons is not valid:', {
        type: typeof addonsToCheck,
        isArray: Array.isArray(addonsToCheck),
        value: addonsToCheck
      });
      return false;
    }
    
    // Use safe wrapper as additional layer
    return safeArrayMethod(
      addonsToCheck,
      (addons) => {
        try {
          // Final check inside
          if (!Array.isArray(addons)) return false;
          return addons.some(
            (addon) => addon && addon.addonType === 'DELIVERY_MARKETING' && addon.status === 'active'
          );
        } catch (error) {
          console.error('Error in hasDeliveryMarketing .some():', error);
          return false;
        }
      },
      false
    );
  } catch (error) {
    console.error('[AppLayout hasDeliveryMarketing] Outer error:', error);
    return false;
  }
});

const userName = computed(() => authStore.user?.name || 'User');
const userEmail = computed(() => authStore.user?.email || '');
const userInitials = computed(() => {
  const name = userName.value;
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
});

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/app/dashboard': 'Dashboard',
    '/app/products': 'Produk',
    '/app/orders': 'Pesanan & Transaksi',
    '/app/customers': 'Pelanggan',
    '/app/reports': 'Laporan',
    '/app/subscription': 'Berlangganan',
    '/app/addons': 'Addon',
    '/app/users': 'Pengguna',
    '/app/analytics': 'Advanced Analytics',
    '/app/finance': 'Keuangan',
    '/app/profit-loss': 'Laporan Laba Rugi',
  };
  return titles[route.path] || 'Warungin';
});

const closeSidebarOnMobile = () => {
  if (windowWidth.value < 1024) {
    sidebarOpen.value = false;
  }
};

const handleResize = () => {
  windowWidth.value = window.innerWidth;
  // Auto-close sidebar on mobile when resizing to desktop
  if (windowWidth.value >= 1024) {
    sidebarOpen.value = true;
  } else {
    sidebarOpen.value = false;
  }
};

const handleTenantChange = () => {
  authStore.setSelectedTenant(selectedTenant.value || null);
  // Reload current page to refresh data with new tenant
  window.location.reload();
};

const toggleSubmenu = (menu: string) => {
  openSubmenus.value[menu as keyof typeof openSubmenus.value] = !openSubmenus.value[menu as keyof typeof openSubmenus.value];
};

       const selectTenantAndNavigate = async (path: string, tenantId: string) => {
         // Ensure user is still authenticated before navigating
         if (!authStore.isAuthenticated) {
           // Try to restore session
           const token = localStorage.getItem('token') || sessionStorage.getItem('token');
           if (token) {
             try {
               await authStore.fetchMe();
             } catch (error) {
               console.error('Session expired, redirecting to login');
               router.push('/login');
               return;
             }
           } else {
             router.push('/login');
             return;
           }
         }
         
         authStore.setSelectedTenant(tenantId);
         closeSidebarOnMobile();
         
         // Use router.push instead of window.location.reload to maintain session
         await router.push(path);
         
         // Force reload only if needed (to refresh data)
         // But ensure we don't lose auth state
         setTimeout(() => {
           if (authStore.isAuthenticated) {
             window.location.reload();
           }
         }, 100);
};

const handleKeydown = (e: KeyboardEvent) => {
  // Show Shortcuts Modal: Shift + ?
  if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey && !(e.target instanceof HTMLInputElement)) {
    e.preventDefault();
    showShortcutsModal.value = !showShortcutsModal.value;
  }
  
  // Close Modal: Esc
  if (e.key === 'Escape') {
    if (showShortcutsModal.value) {
      showShortcutsModal.value = false;
    }
  }
  
  // Internal Focus Search: Ctrl + K
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('focus-search'));
  }
};

// Store Selection Logic
const stores = ref<any[]>([]);
const selectedStoreId = ref<string>(localStorage.getItem('selectedStoreId') || '');

const shouldShowStoreSelector = computed(() => {
  if (userRole.value === 'ADMIN_TENANT') return true;
  if (userRole.value === 'SUPERVISOR') return true;
  if (userRole.value === 'SUPER_ADMIN' && selectedTenant.value) return true;
  return false;
});

const currentStoreName = computed(() => {
   if (selectedStoreId.value) {
      const s = stores.value.find(st => st.id === selectedStoreId.value);
      if (s) return s.name;
   }
   // Fallback for cashier/kitchen if assignedStoreId is available in permissions
   const perms = (authStore.user as any)?.permissions;
   if (perms?.assignedStoreId && stores.value.length > 0) {
      const s = stores.value.find(st => st.id === perms.assignedStoreId);
      if (s) return s.name;
   }
   return '';
});

const loadStores = async () => {
  try {
    const response = await api.get('/outlets'); 
    const allStores = response.data.data || [];

    stores.value = allStores.filter((s: any) => s.isActive !== false);

    if (userRole.value === 'SUPERVISOR') {
       const permissions = authStore.user?.permissions as any;
       const allowedStoreIds = permissions?.allowedStoreIds || [];
       if (allowedStoreIds.length > 0) {
          stores.value = stores.value.filter(s => allowedStoreIds.includes(s.id));
       }
    }
    
    // Validate selectedStoreId
    if (shouldShowStoreSelector.value) {
        if (selectedStoreId.value && !stores.value.find(s => s.id === selectedStoreId.value)) {
           selectedStoreId.value = '';
           localStorage.removeItem('selectedStoreId');
        }
    } else {
        // For cashier/kitchen, ensure we have the store name
        // No action needed as stores are loaded and computed will find name
    }
  } catch (error) {
    console.error('Error loading stores:', error);
  }
};

const handleStoreChange = () => {
  if (selectedStoreId.value) {
    localStorage.setItem('selectedStoreId', selectedStoreId.value);
  } else {
    localStorage.removeItem('selectedStoreId');
  }
  window.location.reload(); 
};

watch(selectedTenant, () => {
   if (authStore.isSuperAdmin) {
      loadStores();
   }
});

onMounted(async () => {
  window.addEventListener('keydown', handleKeydown);
  windowWidth.value = window.innerWidth;
  
  if (authStore.isSuperAdmin) {
    await authStore.fetchTenants();
    selectedTenant.value = authStore.selectedTenantId || '';
  }
  
  // Load stores for all users to support indicator or selector
  await loadStores();

  if (canManageProducts.value) {
      fetchCriticalStock();
  }
  
  // Fetch pending orders count for badge
  fetchPendingOrdersCount();
  // Poll every 30 seconds for new orders
  pendingOrdersInterval = setInterval(() => {
    fetchPendingOrdersCount();
  }, 30000);
  
  // Load menu state
  loadMenuState();
  
  // Check and show info modal for Admin Tenant (once per day)
  if (checkShouldShowInfo()) {
    showInfoModal.value = true;
  }
  checkUnreadInfo();
  
  // Auto-open sidebar on desktop
  if (windowWidth.value >= 1024) {
    sidebarOpen.value = true;
  }
  
  // Load addons for menu visibility
  await loadAddons();
  window.addEventListener('resize', handleResize);
  
  // Setup swipe to go back (mobile only) - disabled, useSwipe not available
  // If you want swipe-to-go-back, install @vueuse/core and import useSwipe
  
  // Fetch tenants if super admin
  if (authStore.isSuperAdmin) {
    await authStore.fetchTenants();
    // Initialize selectedTenant from authStore
    selectedTenant.value = authStore.selectedTenantId || '';
  }
});

// Watch route changes to auto-expand menu
// Watch route changes to add to recent items and auto-expand menu
watch(() => route.path, (newPath) => {
  // Add to recent items
  if (newPath && !newPath.includes('/login')) {
    addRecentItem(newPath);
  }
  // Auto-expand menu
  autoExpandMenu();
}, { immediate: true });

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('keydown', handleKeydown);
  if (pendingOrdersInterval) {
    clearInterval(pendingOrdersInterval);
    pendingOrdersInterval = null;
  }
  // syncManager.cleanup(); // If applicable
});

const handleLogout = () => {
  // Clear auth synchronously to prevent any flash
  authStore.clearAuth();
  // Use replace instead of href to avoid history entry and flash
  window.location.replace('/login');
};
</script>

<style scoped>
/* Touch-friendly for mobile */
.touch-manipulation {
  touch-action: manipulation;
}

/* Smooth scrolling for nav */
nav {
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}

nav::-webkit-scrollbar {
  width: 6px;
}

nav::-webkit-scrollbar-track {
  background: transparent;
}

nav::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 3px;
}

nav::-webkit-scrollbar-thumb:hover {
  background-color: #d1d5db;
}
</style>
