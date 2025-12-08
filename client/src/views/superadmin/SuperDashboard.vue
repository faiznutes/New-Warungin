<template>
  <div class="flex flex-col h-full bg-gradient-to-br from-gray-50 to-white">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-6 px-4 sm:px-6">
      <div class="flex flex-col gap-2">
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Super Admin</h2>
        <p class="text-sm sm:text-base text-gray-600">Kelola penjualan addon dan langganan dengan mudah</p>
      </div>
      <div class="w-full sm:w-auto flex items-center gap-2 sm:gap-4">
        <select
          v-model="superAdminDateRange"
          @change="loadSuperAdminStats"
          class="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white font-medium shadow-sm hover:shadow-md transition"
        >
          <option value="today">Hari Ini</option>
          <option value="week">Minggu Ini</option>
          <option value="month">Bulan Ini</option>
          <option value="year">Tahun Ini</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <div class="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <div class="text-gray-600 font-medium">Memuat data...</div>
    </div>

    <!-- Super Admin Dashboard -->
    <div v-else class="flex flex-col gap-6 sm:gap-8 px-4 sm:px-6 pb-6 sm:pb-8">
      <!-- Hero Section with Gradient -->
      <div class="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 sm:p-12 text-white overflow-hidden">
        <div class="absolute inset-0 bg-black opacity-10"></div>
        <div class="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
        <div class="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div class="flex-1">
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 drop-shadow-lg">Selamat Datang, Super Admin! 👋</h2>
            <p class="text-indigo-100 text-lg sm:text-xl mb-4">Kelola penjualan addon dan langganan dengan mudah</p>
            <div class="flex flex-wrap gap-3 mt-4">
              <div class="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2">
                <p class="text-xs text-indigo-100">Total Pendapatan</p>
                <p class="text-xl font-bold">{{ formatCurrency(globalReportData?.summary?.totalGlobalRevenue || 0) }}</p>
              </div>
              <div class="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2">
                <p class="text-xs text-indigo-100">Active Subscriptions</p>
                <p class="text-xl font-bold">{{ stats?.overview?.activeSubscriptions || 0 }}</p>
              </div>
            </div>
          </div>
          <div class="hidden lg:block flex-shrink-0">
            <div class="w-40 h-40 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <svg class="w-24 h-24 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Date Range Filter -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <label class="text-sm font-medium text-gray-700">Periode:</label>
            <select
              v-model="superAdminDateRange"
              @change="loadSuperAdminStats"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="today">Hari Ini</option>
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan Ini</option>
              <option value="year">Tahun Ini</option>
            </select>
          </div>
          <div class="text-sm text-gray-600">
            {{ getDateRangeLabel() }}
          </div>
        </div>
      </div>

      <!-- Revenue Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <router-link
          to="/app/reports/global"
          class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg hover:shadow-xl transition-all p-4 sm:p-6 border border-green-200 hover:border-green-300"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">Total Pendapatan Global</span>
            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-md">
              <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{{ formatCurrency(globalReportData?.summary?.totalGlobalRevenue || stats?.overview?.totalRevenue || 0) }}</p>
          <p class="text-xs sm:text-sm text-gray-600">Subscriptions + Addons</p>
        </router-link>

        <router-link
          to="/app/reports/global"
          class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg hover:shadow-xl transition-all p-4 sm:p-6 border border-purple-200 hover:border-purple-300"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">Pendapatan Subscription</span>
            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{{ formatCurrency(globalReportData?.summary?.totalSubscriptionRevenue || stats?.overview?.totalSubscriptionRevenue || 0) }}</p>
          <p class="text-xs sm:text-sm text-gray-600">{{ stats?.overview?.activeSubscriptions || 0 }} langganan aktif</p>
        </router-link>

        <router-link
          to="/app/reports/global"
          class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg hover:shadow-xl transition-all p-4 sm:p-6 border border-blue-200 hover:border-blue-300"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">Pendapatan Addons</span>
            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <p class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{{ formatCurrency(globalReportData?.summary?.totalAddonRevenue || stats?.overview?.totalAddonRevenue || 0) }}</p>
          <p class="text-xs sm:text-sm text-gray-600">{{ stats?.overview?.totalAddons || 0 }} addon terjual</p>
        </router-link>

        <router-link
          to="/app/tenants"
          class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-lg hover:shadow-xl transition-all p-4 sm:p-6 border border-orange-200 hover:border-orange-300"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">Total Tenant</span>
            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
              <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <p class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{{ stats?.overview?.totalTenants || superAdminStats?.totalTenants || 0 }}</p>
          <p class="text-xs sm:text-sm text-gray-600">{{ stats?.overview?.activeTenants || superAdminStats?.activeTenants || 0 }} tenant aktif</p>
        </router-link>
      </div>

      <!-- Overview Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div class="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg hover:shadow-xl transition-all p-6 border-2 border-blue-200 hover:border-blue-300">
          <div class="flex items-center justify-between mb-4">
            <p class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Total Tenant</p>
            <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <p class="text-3xl sm:text-4xl font-bold text-gray-900">{{ stats?.overview?.totalTenants || 0 }}</p>
          <p class="text-xs text-gray-600 mt-1">Semua tenant terdaftar</p>
        </div>

        <div class="group bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg hover:shadow-xl transition-all p-6 border-2 border-green-200 hover:border-green-300">
          <div class="flex items-center justify-between mb-4">
            <p class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Tenant Aktif</p>
            <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p class="text-3xl sm:text-4xl font-bold text-gray-900">{{ stats?.overview?.activeTenants || 0 }}</p>
          <p class="text-xs text-gray-600 mt-1">Dengan langganan aktif</p>
        </div>

        <div class="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg hover:shadow-xl transition-all p-6 border-2 border-purple-200 hover:border-purple-300">
          <div class="flex items-center justify-between mb-4">
            <p class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Total Pengguna</p>
            <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <p class="text-3xl sm:text-4xl font-bold text-gray-900">{{ stats?.overview?.totalUsers || 0 }}</p>
          <p class="text-xs text-gray-600 mt-1">Semua pengguna sistem</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200">
        <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Aksi Cepat</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <router-link
            to="/app/reports/global"
            class="group relative flex flex-col p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-white overflow-hidden"
          >
            <div class="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div class="relative z-10">
              <div class="w-14 h-14 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 class="font-bold text-lg mb-1">Laporan Global</h4>
              <p class="text-blue-100 text-sm">Lihat laporan addon & langganan</p>
            </div>
          </router-link>

          <router-link
            to="/app/reports/global"
            class="group relative flex flex-col p-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-white overflow-hidden"
          >
            <div class="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div class="relative z-10">
              <div class="w-14 h-14 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 class="font-bold text-lg mb-1">Laporan Subscription</h4>
              <p class="text-purple-100 text-sm">Lihat laporan subscription</p>
            </div>
          </router-link>

          <router-link
            to="/app/addons"
            class="group relative flex flex-col p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-white overflow-hidden"
          >
            <div class="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div class="relative z-10">
              <div class="w-14 h-14 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h4 class="font-bold text-lg mb-1">Kelola Addon</h4>
              <p class="text-green-100 text-sm">Lihat penjualan addon</p>
            </div>
          </router-link>

          <router-link
            to="/app/tenants"
            class="group relative flex flex-col p-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-white overflow-hidden"
          >
            <div class="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div class="relative z-10">
              <div class="w-14 h-14 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h4 class="font-bold text-lg mb-1">Kelola Tenant</h4>
              <p class="text-orange-100 text-sm">Lihat dan kelola semua tenant</p>
            </div>
          </router-link>
        </div>
      </div>

      <!-- Top Subscriptions & Subscription Breakdown -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <!-- Top Subscription Plans -->
        <div class="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200 hover:shadow-xl transition-shadow">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl sm:text-2xl font-bold text-gray-900">Paket Subscription Terlaris</h3>
            <router-link to="/app/reports/global" class="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
              Lihat Semua
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
          </div>
          <div v-if="!stats?.subscriptionBreakdown || stats.subscriptionBreakdown.length === 0" class="text-center py-12 text-gray-500">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Belum ada subscription</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="(plan, index) in stats.subscriptionBreakdown.sort((a: any, b: any) => b.count - a.count).slice(0, 5)"
              :key="plan.plan"
              class="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:from-purple-50 hover:to-pink-50 transition-all border border-gray-100 hover:border-purple-200 hover:shadow-md"
            >
              <div class="flex items-center space-x-4 flex-1">
                <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                  <span class="text-white font-bold text-lg">{{ index + 1 }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-bold text-gray-900 text-base truncate">{{ getPlanName(plan.plan) }}</p>
                  <p class="text-sm text-gray-600">{{ plan.count }} pembelian</p>
                </div>
              </div>
              <div class="text-right ml-4">
                <p class="font-bold text-primary-600 text-lg">{{ formatCurrency(getPlanPrice(plan.plan) * plan.count) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Subscription by Status -->
        <div class="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200 hover:shadow-xl transition-shadow">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl sm:text-2xl font-bold text-gray-900">Subscription Berdasarkan Status</h3>
            <router-link to="/app/reports/global" class="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
              Lihat Semua
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
          </div>
          <div v-if="!globalReportData?.subscriptions || globalReportData.subscriptions.length === 0" class="text-center py-12 text-gray-500">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>Belum ada data subscription</p>
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="statusGroup in getSubscriptionStatusGroups()"
              :key="statusGroup.status"
              class="group"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="px-4 py-2 text-sm font-semibold rounded-full" :class="getSubscriptionStatusClass(statusGroup.status)">
                  {{ getSubscriptionStatusLabel(statusGroup.status) }}
                </span>
                <span class="text-lg font-bold text-gray-900">{{ statusGroup.count }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  class="h-3 rounded-full transition-all duration-500"
                  :class="getSubscriptionStatusColor(statusGroup.status)"
                  :style="{ width: `${(statusGroup.count / (globalReportData.subscriptions.length || 1)) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Addon Purchases -->
      <div class="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200 hover:shadow-xl transition-shadow">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl sm:text-2xl font-bold text-gray-900">Pembelian Addon Terbaru</h3>
          <router-link to="/app/addons" class="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
            Lihat Semua
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </router-link>
        </div>
        <div v-if="!stats?.recentAddons || stats.recentAddons.length === 0" class="text-center py-12 text-gray-500">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p>Belum ada pembelian addon</p>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="addon in stats.recentAddons.slice(0, 5)"
            :key="addon.id"
            class="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:from-purple-50 hover:to-pink-50 transition-all border border-gray-100 hover:border-purple-200 hover:shadow-md"
          >
            <div class="flex-1 min-w-0">
              <p class="font-bold text-gray-900 text-base truncate">{{ addon.tenantName }}</p>
              <p class="text-sm text-gray-600">{{ addon.addonName }} • {{ formatDateTime(addon.subscribedAt) }}</p>
            </div>
            <div class="text-right ml-4 flex-shrink-0">
              <span :class="[
                'px-3 py-1 rounded-full text-xs font-semibold',
                addon.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              ]">
                {{ addon.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { useAuthStore } from '../../stores/auth';
import { useNotification } from '../../composables/useNotification';

const authStore = useAuthStore();
const { error: showError } = useNotification();
const loading = ref(false);
const superAdminDateRange = ref('month');
const stats = ref<any>(null);
const globalReportData = ref<any>(null);
const superAdminStats = ref({
  totalTenants: 0,
  activeTenants: 0,
  totalRevenue: 0,
});

const getSuperAdminDateRange = () => {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;
  
  switch (superAdminDateRange.value) {
    case 'today':
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
  }
  
  return { startDate, endDate };
};

const getDateRangeLabel = () => {
  const { startDate, endDate } = getSuperAdminDateRange();
  return `${startDate.toLocaleDateString('id-ID')} - ${endDate.toLocaleDateString('id-ID')}`;
};

const getPlanName = (plan: string) => {
  const planNames: Record<string, string> = {
    BASIC: 'Starter',
    PRO: 'Boost',
    ENTERPRISE: 'Max',
    STARTER: 'Starter',
    BOOST: 'Boost',
    MAX: 'Max',
  };
  return planNames[plan] || plan;
};

const getPlanPrice = (plan: string) => {
  const prices: Record<string, number> = {
    BASIC: 200000,
    PRO: 350000,
    ENTERPRISE: 500000,
  };
  return prices[plan] || 0;
};

const getSubscriptionStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    EXPIRED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getSubscriptionStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    ACTIVE: 'Aktif',
    EXPIRED: 'Kedaluwarsa',
    CANCELLED: 'Dibatalkan',
  };
  return labels[status] || status;
};

const getSubscriptionStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    ACTIVE: 'bg-green-500',
    EXPIRED: 'bg-red-500',
    CANCELLED: 'bg-gray-500',
  };
  return colors[status] || 'bg-gray-500';
};

const getSubscriptionStatusGroups = () => {
  if (!globalReportData.value?.subscriptions) return [];
  
  const statusMap = new Map<string, number>();
  globalReportData.value.subscriptions.forEach((sub: any) => {
    const status = sub.status || 'UNKNOWN';
    statusMap.set(status, (statusMap.get(status) || 0) + 1);
  });
  
  return Array.from(statusMap.entries()).map(([status, count]) => ({
    status,
    count,
  }));
};

const loadSuperAdminStats = async () => {
  loading.value = true;
  try {
    const response = await api.get('/dashboard/stats');
    stats.value = response.data;
    superAdminStats.value = {
      totalTenants: stats.value?.overview?.totalTenants || 0,
      activeTenants: stats.value?.overview?.activeTenants || 0,
      totalRevenue: stats.value?.overview?.totalRevenue || 0,
    };
  } catch (error: any) {
    if (!authStore.isAuthenticated) {
      return;
    }
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      return;
    }
    
    if (error.response?.status === 503) {
      console.error('Database connection error:', error.response?.data?.message);
      await showError('Koneksi database terputus. Silakan periksa konfigurasi database atau hubungi administrator.');
      stats.value = { overview: {} };
      superAdminStats.value = { totalTenants: 0, activeTenants: 0, totalRevenue: 0 };
      return;
    }
    
    console.error('Error loading super admin stats:', error);
    const errorMessage = error.response?.data?.message || 'Gagal memuat statistik super admin';
    await showError(errorMessage);
    if (!stats.value) {
      stats.value = { overview: {} };
    }
    if (!superAdminStats.value || Object.keys(superAdminStats.value).length === 0) {
      superAdminStats.value = { totalTenants: 0, activeTenants: 0, totalRevenue: 0 };
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (authStore.isAuthenticated) {
    loadSuperAdminStats();
  }
});
</script>
