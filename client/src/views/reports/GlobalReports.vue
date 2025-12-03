<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">
          Laporan Global
        </h2>
        <p class="text-gray-600">
          Analisis keseluruhan semua tenant
        </p>
      </div>
      <div class="flex space-x-2">
        <button
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center space-x-2"
          @click="showExportModal = true"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>Export Laporan</span>
        </button>
      </div>
    </div>

    <!-- Date Range Filter -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Periode</label>
          <select
            v-model="periodFilter"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            @change="applyPeriodFilter"
          >
            <option value="custom">
              Custom
            </option>
            <option value="daily">
              Harian (Hari Ini)
            </option>
            <option value="weekly">
              Mingguan (Minggu Ini)
            </option>
            <option value="monthly">
              Bulanan (Bulan Ini)
            </option>
            <option value="yearly">
              Tahunan (Tahun Ini)
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Dari Tanggal</label>
          <input
            v-model="dateRange.from"
            type="date"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            @change="periodFilter = 'custom'"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Sampai Tanggal</label>
          <input
            v-model="dateRange.to"
            type="date"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            @change="periodFilter = 'custom'"
          />
        </div>
        <div class="flex items-end">
          <button
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            @click="shouldLoadReport = true; loadReport()"
          >
            {{ reportData ? 'Refresh' : 'Generate' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Report Content -->
    <div
      v-if="loading"
      class="flex items-center justify-center py-12"
    >
      <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div
      v-else-if="reportData"
      class="space-y-6"
    >
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg shadow-lg p-6">
          <p class="text-sm text-gray-600 mb-2">
            Total Pendapatan
          </p>
          <p class="text-3xl font-bold text-gray-900">
            {{ formatCurrency(reportData.summary?.totalGlobalRevenue || 0) }}
          </p>
          <p class="text-xs text-gray-500 mt-1">
            Subscription + Addons
          </p>
        </div>
        <div class="bg-white rounded-lg shadow-lg p-6">
          <p class="text-sm text-gray-600 mb-2">
            Pendapatan Subscription
          </p>
          <p class="text-3xl font-bold text-green-600">
            {{ formatCurrency(reportData.summary?.totalSubscriptionRevenue || 0) }}
          </p>
        </div>
        <div class="bg-white rounded-lg shadow-lg p-6">
          <p class="text-sm text-gray-600 mb-2">
            Pendapatan Addons
          </p>
          <p class="text-3xl font-bold text-blue-600">
            {{ formatCurrency(reportData.summary?.totalAddonRevenue || 0) }}
          </p>
        </div>
        <div class="bg-white rounded-lg shadow-lg p-6">
          <p class="text-sm text-gray-600 mb-2">
            Total Tenant Aktif
          </p>
          <p class="text-3xl font-bold text-gray-900">
            {{ reportData.summary?.activeTenants || 0 }}
          </p>
        </div>
      </div>

      <!-- Subscription Data -->
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">
            Penjualan Subscription
          </h3>
          <div class="flex items-center gap-3">
            <select
              v-model="subscriptionFilter"
              class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              @change="subscriptionPage = 1"
            >
              <option value="all">
                Semua Status
              </option>
              <option value="ACTIVE">
                Aktif
              </option>
              <option value="EXPIRED">
                Expired
              </option>
            </select>
            <select
              v-model="subscriptionInfoFilter"
              class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              @change="subscriptionPage = 1"
            >
              <option value="all">
                Semua Info
              </option>
              <option value="superadmin">
                Ditambahkan Super Admin
              </option>
              <option value="self">
                Dibeli Sendiri
              </option>
            </select>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    :checked="selectedSubscriptions.length === paginatedSubscriptions.length && paginatedSubscriptions.length > 0"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    @change="toggleSelectAllSubscriptions"
                  />
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paket
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Info
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="!reportData || !reportData.subscriptions || filteredSubscriptions.length === 0">
                <td
                  colspan="8"
                  class="px-6 py-4 text-center text-sm text-gray-500"
                >
                  Tidak ada data subscription
                </td>
              </tr>
              <tr
                v-for="sub in paginatedSubscriptions"
                v-else
                :key="sub.id"
                class="hover:bg-gray-50"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <input
                    v-model="selectedSubscriptions"
                    type="checkbox"
                    :value="sub.id"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ sub.tenantName }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ sub.plan }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ formatCurrency(sub.amount) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ new Date(sub.createdAt).toLocaleDateString('id-ID') }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 py-1 text-xs font-semibold rounded-full"
                    :class="sub.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                  >
                    {{ sub.status === 'ACTIVE' ? 'Aktif' : 'Expired' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    v-if="sub.addedBySuperAdmin"
                    class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                  >
                    Ditambahkan oleh Super Admin
                  </span>
                  <span
                    v-else
                    class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600"
                  >
                    Dibeli sendiri
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <button
                      class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit"
                      @click="editSubscription(sub)"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                      title="Print"
                      @click="printSubscription(sub)"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Bulk Actions for Subscriptions -->
        <div
          v-if="selectedSubscriptions.length > 0"
          class="px-6 py-3 border-t border-gray-200 bg-blue-50 flex items-center justify-between"
        >
          <div class="text-sm text-gray-700 font-medium">
            {{ selectedSubscriptions.length }} subscription dipilih
          </div>
          <div class="flex gap-2">
            <button
              class="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              @click="bulkDeleteSubscriptions"
            >
              Hapus Terpilih
            </button>
            <button
              class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              @click="selectedSubscriptions = []"
            >
              Batal
            </button>
          </div>
        </div>
        <!-- Pagination for Subscriptions -->
        <div
          v-if="filteredSubscriptions.length > 0"
          class="px-6 py-4 border-t border-gray-200 flex items-center justify-between"
        >
          <div class="text-sm text-gray-700">
            Menampilkan {{ (subscriptionPage - 1) * 7 + 1 }} - {{ Math.min(subscriptionPage * 7, filteredSubscriptions.length) }} dari {{ filteredSubscriptions.length }} subscription
          </div>
          <div class="flex gap-2">
            <button
              :disabled="subscriptionPage === 1"
              class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="subscriptionPage = Math.max(1, subscriptionPage - 1)"
            >
              Sebelumnya
            </button>
            <button
              :disabled="subscriptionPage === totalSubscriptionPages"
              class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="subscriptionPage = Math.min(totalSubscriptionPages, subscriptionPage + 1)"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      <!-- Addon Data -->
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">
            Penjualan Addons
          </h3>
          <div class="flex items-center gap-3">
            <select
              v-model="addonFilter"
              class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              @change="addonPage = 1"
            >
              <option value="all">
                Semua Status
              </option>
              <option value="active">
                Aktif
              </option>
              <option value="expired">
                Expired
              </option>
            </select>
            <select
              v-model="addonInfoFilter"
              class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              @change="addonPage = 1"
            >
              <option value="all">
                Semua Info
              </option>
              <option value="superadmin">
                Ditambahkan Super Admin
              </option>
              <option value="self">
                Dibeli Sendiri
              </option>
            </select>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    :checked="selectedAddons.length === paginatedAddons.length && paginatedAddons.length > 0"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    @change="toggleSelectAllAddons"
                  />
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Addon
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Info
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="!reportData || !reportData.addons || filteredAddons.length === 0">
                <td
                  colspan="8"
                  class="px-6 py-4 text-center text-sm text-gray-500"
                >
                  Tidak ada data addon
                </td>
              </tr>
              <tr
                v-for="addon in paginatedAddons"
                v-else
                :key="addon.id"
                class="hover:bg-gray-50"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <input
                    v-model="selectedAddons"
                    type="checkbox"
                    :value="addon.id"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ addon.tenantName }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ addon.addonName }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ formatCurrency(addon.amount) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ new Date(addon.subscribedAt).toLocaleDateString('id-ID') }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 py-1 text-xs font-semibold rounded-full"
                    :class="addon.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                  >
                    {{ addon.status === 'active' ? 'Aktif' : 'Expired' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    v-if="addon.addedBySuperAdmin"
                    class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                  >
                    Ditambahkan oleh Super Admin
                  </span>
                  <span
                    v-else
                    class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600"
                  >
                    Dibeli sendiri
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <button
                      class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit"
                      @click="editAddon(addon)"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                      title="Print"
                      @click="printAddon(addon)"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Bulk Actions for Addons -->
        <div
          v-if="selectedAddons.length > 0"
          class="px-6 py-3 border-t border-gray-200 bg-blue-50 flex items-center justify-between"
        >
          <div class="text-sm text-gray-700 font-medium">
            {{ selectedAddons.length }} addon dipilih
          </div>
          <div class="flex gap-2">
            <button
              class="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              @click="bulkDeleteAddons"
            >
              Hapus Terpilih
            </button>
            <button
              class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              @click="selectedAddons = []"
            >
              Batal
            </button>
          </div>
        </div>
        <!-- Pagination for Addons -->
        <div
          v-if="filteredAddons.length > 0"
          class="px-6 py-4 border-t border-gray-200 flex items-center justify-between"
        >
          <div class="text-sm text-gray-700">
            Menampilkan {{ (addonPage - 1) * 7 + 1 }} - {{ Math.min(addonPage * 7, filteredAddons.length) }} dari {{ filteredAddons.length }} addon
          </div>
          <div class="flex gap-2">
            <button
              :disabled="addonPage === 1"
              class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="addonPage = Math.max(1, addonPage - 1)"
            >
              Sebelumnya
            </button>
            <button
              :disabled="addonPage === totalAddonPages"
              class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="addonPage = Math.min(totalAddonPages, addonPage + 1)"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      <!-- Tenant Performance -->
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            Performa per Tenant (Orders)
          </h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pendapatan
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaksi
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="!reportData.tenantReports || reportData.tenantReports.length === 0">
                <td
                  colspan="3"
                  class="px-6 py-4 text-center text-sm text-gray-500"
                >
                  Tidak ada data tenant
                </td>
              </tr>
              <tr
                v-for="tenant in reportData.tenantReports"
                :key="tenant.tenantId"
                class="hover:bg-gray-50"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ tenant.tenantName }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ formatCurrency(tenant.totalRevenue) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ tenant.totalOrders }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Export Modal -->
    <GlobalReportExportModal
      :show="showExportModal"
      :default-start-date="dateRange.from"
      :default-end-date="dateRange.to"
      :report-data="reportData"
      @close="showExportModal = false"
      @exported="loadReport"
    />

    <!-- Subscription Detail Modal -->
    <div
      v-if="showSubscriptionModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showSubscriptionModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-2xl font-bold text-gray-900">
              Detail Subscription
            </h3>
            <button
              class="text-gray-400 hover:text-gray-600 transition"
              @click="showSubscriptionModal = false"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          
          <div
            v-if="selectedSubscription"
            class="space-y-4"
          >
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Tenant</label>
                <p class="mt-1 text-sm text-gray-900">
                  {{ selectedSubscription.tenantName }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Paket</label>
                <p class="mt-1 text-sm text-gray-900">
                  {{ selectedSubscription.plan }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Jumlah</label>
                <p class="mt-1 text-sm text-gray-900 font-semibold">
                  {{ formatCurrency(selectedSubscription.amount) }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Status</label>
                <span
                  :class="[
                    'mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    selectedSubscription.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ selectedSubscription.status === 'ACTIVE' ? 'Aktif' : 'Expired' }}
                </span>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Tanggal Mulai</label>
                <p class="mt-1 text-sm text-gray-900">
                  {{ selectedSubscription.startDate ? new Date(selectedSubscription.startDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-' }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Tanggal Berakhir</label>
                <p class="mt-1 text-sm text-gray-900">
                  {{ selectedSubscription.endDate ? new Date(selectedSubscription.endDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-' }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Durasi Pemakaian</label>
                <p class="mt-1 text-sm text-gray-900 font-semibold">
                  <span v-if="selectedSubscription.startDate && selectedSubscription.endDate">
                    {{ formatDuration(selectedSubscription.startDate, selectedSubscription.endDate) }}
                  </span>
                  <span
                    v-else
                    class="text-gray-500"
                  >-</span>
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Tanggal Dibuat</label>
                <p class="mt-1 text-sm text-gray-900">
                  {{ new Date(selectedSubscription.createdAt).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">ID Subscription</label>
                <p class="mt-1 text-sm text-gray-500 font-mono">
                  {{ selectedSubscription.id }}
                </p>
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Ditambahkan oleh Super Admin?</label>
                <select
                  v-model="editingSubscription.addedBySuperAdmin"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option :value="true">
                    Ya, Ditambahkan oleh Super Admin
                  </option>
                  <option :value="false">
                    Tidak, Dibeli sendiri
                  </option>
                </select>
              </div>
            </div>
            
            <div class="flex justify-end space-x-3 pt-4 border-t">
              <button
                class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                @click="showSubscriptionModal = false"
              >
                Batal
              </button>
              <button
                class="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                @click="updateSubscription"
              >
                Simpan Perubahan
              </button>
              <button
                class="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                @click="deleteSubscription(selectedSubscription)"
              >
                Hapus Subscription
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Addon Detail Modal -->
    <div
      v-if="showAddonModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showAddonModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-2xl font-bold text-gray-900">
              Detail Addon
            </h3>
            <button
              class="text-gray-400 hover:text-gray-600 transition"
              @click="showAddonModal = false"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          
          <div
            v-if="selectedAddon"
            class="space-y-4"
          >
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Tenant</label>
                <p class="mt-1 text-sm text-gray-900">
                  {{ selectedAddon.tenantName }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Nama Addon</label>
                <p class="mt-1 text-sm text-gray-900">
                  {{ selectedAddon.addonName }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Jumlah</label>
                <p class="mt-1 text-sm text-gray-900 font-semibold">
                  {{ formatCurrency(selectedAddon.amount || selectedAddon.price || 0) }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Status</label>
                <span
                  :class="[
                    'mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    selectedAddon.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ selectedAddon.status === 'active' ? 'Aktif' : 'Tidak Aktif' }}
                </span>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Tanggal Mulai</label>
                <p class="mt-1 text-sm text-gray-900">
                  {{ selectedAddon.subscribedAt ? new Date(selectedAddon.subscribedAt).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-' }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Tanggal Berakhir</label>
                <p class="mt-1 text-sm text-gray-900">
                  {{ selectedAddon.expiresAt ? new Date(selectedAddon.expiresAt).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Tidak ada batas waktu' }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Durasi Pemakaian</label>
                <p class="mt-1 text-sm text-gray-900 font-semibold">
                  <span v-if="selectedAddon.subscribedAt && selectedAddon.expiresAt">
                    {{ formatDuration(selectedAddon.subscribedAt, selectedAddon.expiresAt) }}
                  </span>
                  <span
                    v-else-if="selectedAddon.subscribedAt"
                    class="text-gray-500"
                  >Berlangsung hingga sekarang</span>
                  <span
                    v-else
                    class="text-gray-500"
                  >-</span>
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">ID Addon</label>
                <p class="mt-1 text-sm text-gray-500 font-mono">
                  {{ selectedAddon.id }}
                </p>
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Ditambahkan oleh Super Admin?</label>
                <select
                  v-model="editingAddon.addedBySuperAdmin"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option :value="true">
                    Ya, Ditambahkan oleh Super Admin
                  </option>
                  <option :value="false">
                    Tidak, Dibeli sendiri
                  </option>
                </select>
              </div>
            </div>
            
            <div class="flex justify-end space-x-3 pt-4 border-t">
              <button
                class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                @click="showAddonModal = false"
              >
                Batal
              </button>
              <button
                class="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                @click="updateAddon"
              >
                Simpan Perubahan
              </button>
              <button
                class="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                @click="deleteAddon(selectedAddon)"
              >
                Hapus Addon
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api';
import { formatCurrency } from '../../utils/formatters';
import { useNotification } from '../../composables/useNotification';
import GlobalReportExportModal from '../../components/GlobalReportExportModal.vue';

const { error: showError, success: showSuccess, confirm: showConfirm } = useNotification();
const loading = ref(false);
const reportData = ref<any>(null);
const showExportModal = ref(false);
const showSubscriptionModal = ref(false);
const showAddonModal = ref(false);
const selectedSubscription = ref<any>(null);
const selectedAddon = ref<any>(null);
const selectedSubscriptions = ref<string[]>([]);
const selectedAddons = ref<string[]>([]);
const shouldLoadReport = ref(false);
const editingSubscription = ref<any>({ addedBySuperAdmin: false });
const editingAddon = ref<any>({ addedBySuperAdmin: false });

// Subscription pagination and filter
const subscriptionPage = ref(1);
const subscriptionFilter = ref<'all' | 'ACTIVE' | 'EXPIRED'>('all');
const subscriptionInfoFilter = ref<'all' | 'superadmin' | 'self'>('all');
const itemsPerPage = 7;

// Addon pagination and filter
const addonPage = ref(1);
const addonFilter = ref<'all' | 'active' | 'expired'>('all');
const addonInfoFilter = ref<'all' | 'superadmin' | 'self'>('all');

// Period filter
const periodFilter = ref<'custom' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

// Set default date range: bulan ini (month)
const now = new Date();
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
const endOfMonth = new Date(now);

const dateRange = ref({
  from: startOfMonth.toISOString().split('T')[0],
  to: endOfMonth.toISOString().split('T')[0],
});

// Apply period filter
const applyPeriodFilter = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let startDate: Date;
  let endDate: Date = new Date(today);
  endDate.setHours(23, 59, 59, 999);
  
  switch (periodFilter.value) {
    case 'daily':
      // Hari ini
      startDate = new Date(today);
      break;
      
    case 'weekly': {
      // Minggu ini (Senin - Minggu)
      const dayOfWeek = today.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Jika hari Minggu, mundur 6 hari
      startDate = new Date(today);
      startDate.setDate(today.getDate() + diffToMonday);
      break;
    }
      
    case 'monthly':
      // Bulan ini
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
      
    case 'yearly':
      // Tahun ini
      startDate = new Date(today.getFullYear(), 0, 1);
      break;
      
    default:
      // Custom - tidak ubah tanggal
      return;
  }
  
  dateRange.value = {
    from: startDate.toISOString().split('T')[0],
    to: endDate.toISOString().split('T')[0],
  };
  
  // Auto load report when period changes
  if (shouldLoadReport.value || reportData.value) {
    loadReport();
  }
};

// Filtered subscriptions
const filteredSubscriptions = computed(() => {
  if (!reportData.value || !reportData.value.subscriptions) return [];
  
  let filtered = [...reportData.value.subscriptions];
  
  if (subscriptionFilter.value !== 'all') {
    filtered = filtered.filter((sub: any) => sub.status === subscriptionFilter.value);
  }
  
  // Filter by addedBySuperAdmin
  if (subscriptionInfoFilter.value !== 'all') {
    if (subscriptionInfoFilter.value === 'superadmin') {
      filtered = filtered.filter((sub: any) => sub.addedBySuperAdmin === true);
    } else if (subscriptionInfoFilter.value === 'self') {
      filtered = filtered.filter((sub: any) => sub.addedBySuperAdmin === false);
    }
  }
  
  return filtered;
});

// Paginated subscriptions
const paginatedSubscriptions = computed(() => {
  if (!filteredSubscriptions.value || filteredSubscriptions.value.length === 0) return [];
  const start = (subscriptionPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredSubscriptions.value.slice(start, end);
});

const totalSubscriptionPages = computed(() => {
  if (!filteredSubscriptions.value || filteredSubscriptions.value.length === 0) return 1;
  return Math.ceil(filteredSubscriptions.value.length / itemsPerPage);
});

// Filtered addons
const filteredAddons = computed(() => {
  if (!reportData.value || !reportData.value.addons) {
    console.log('filteredAddons: No reportData or addons', {
      hasReportData: !!reportData.value,
      hasAddons: !!reportData.value?.addons,
      addonsType: typeof reportData.value?.addons,
      addonsIsArray: Array.isArray(reportData.value?.addons),
    });
    return [];
  }
  
  let filtered = [...reportData.value.addons];
  console.log('filteredAddons: Before filter', {
    totalAddons: filtered.length,
    addonFilter: addonFilter.value,
    addonInfoFilter: addonInfoFilter.value,
    firstThree: filtered.slice(0, 3),
  });
  
  if (addonFilter.value !== 'all') {
    filtered = filtered.filter((addon: any) => addon.status === addonFilter.value);
  }
  
  // Filter by addedBySuperAdmin
  if (addonInfoFilter.value !== 'all') {
    if (addonInfoFilter.value === 'superadmin') {
      filtered = filtered.filter((addon: any) => addon.addedBySuperAdmin === true);
    } else if (addonInfoFilter.value === 'self') {
      filtered = filtered.filter((addon: any) => addon.addedBySuperAdmin === false);
    }
  }
  
  console.log('filteredAddons: After filter', {
    filteredCount: filtered.length,
    firstThree: filtered.slice(0, 3),
  });
  
  return filtered;
});

// Paginated addons
const paginatedAddons = computed(() => {
  if (!filteredAddons.value || filteredAddons.value.length === 0) return [];
  const start = (addonPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredAddons.value.slice(start, end);
});

const totalAddonPages = computed(() => {
  if (!filteredAddons.value || filteredAddons.value.length === 0) return 1;
  return Math.ceil(filteredAddons.value.length / itemsPerPage);
});

const loadReport = async () => {
  loading.value = true;
  try {
    const params: any = {};
    
    // Only add date range if both dates are provided
    if (dateRange.value.from && dateRange.value.to) {
      params.startDate = dateRange.value.from;
      params.endDate = dateRange.value.to;
    }
    
    const response = await api.get('/reports/global', { params });
    reportData.value = response.data;
    
    // Log for debugging
    if (!reportData.value) {
      console.warn('Global report data is null or empty', { params });
    } else {
      console.log('Global report data loaded:', {
        summary: reportData.value.summary,
        tenantsCount: reportData.value.tenants?.length || 0,
        subscriptionsCount: reportData.value.subscriptions?.length || 0,
        addonsCount: reportData.value.addons?.length || 0,
        hasAddons: !!reportData.value.addons,
        addonsIsArray: Array.isArray(reportData.value.addons),
        firstThreeAddons: reportData.value.addons?.slice(0, 3),
        fullResponse: response.data,
      });
    }
    
    // Ensure reportData has proper structure even if empty
    if (!reportData.value) {
      reportData.value = {
        summary: {
          totalGlobalRevenue: 0,
          totalSubscriptionRevenue: 0,
          totalAddonRevenue: 0,
          totalSalesRevenue: 0,
          totalTenants: 0,
          activeTenants: 0,
          totalUsers: 0,
          totalOrders: 0,
        },
        tenants: [],
        subscriptions: [],
        addons: [],
      };
    }
    
    // Reset pagination when data changes
    subscriptionPage.value = 1;
    addonPage.value = 1;
  } catch (error: any) {
    console.error('Error loading global report:', error);
    if (error.response?.status !== 401 && error.response?.status !== 403) {
      await showError('Gagal memuat laporan global');
    }
  } finally {
    loading.value = false;
  }
};

const toggleSelectAllSubscriptions = () => {
  if (selectedSubscriptions.value.length === paginatedSubscriptions.value.length) {
    selectedSubscriptions.value = [];
  } else {
    selectedSubscriptions.value = paginatedSubscriptions.value.map((sub: any) => sub.id);
  }
};

const toggleSelectAllAddons = () => {
  if (selectedAddons.value.length === paginatedAddons.value.length) {
    selectedAddons.value = [];
  } else {
    selectedAddons.value = paginatedAddons.value.map((addon: any) => addon.id);
  }
};

const bulkDeleteSubscriptions = async () => {
  if (selectedSubscriptions.value.length === 0) return;
  
  const confirmed = await showConfirm(
    `Apakah Anda yakin ingin menghapus ${selectedSubscriptions.value.length} subscription?`,
    'Hapus Subscription'
  );
  
  if (!confirmed) return;
  
  try {
    await api.post('/subscriptions/bulk-delete', {
      ids: selectedSubscriptions.value,
    });
    
    await showSuccess(`${selectedSubscriptions.value.length} subscription berhasil dihapus`);
    selectedSubscriptions.value = [];
    await loadReport();
  } catch (error: any) {
    console.error('Error bulk deleting subscriptions:', error);
    await showError(error.response?.data?.message || 'Gagal menghapus subscription');
  }
};

const bulkDeleteAddons = async () => {
  if (selectedAddons.value.length === 0) return;
  
  const confirmed = await showConfirm(
    `Apakah Anda yakin ingin menghapus ${selectedAddons.value.length} addon?`,
    'Hapus Addon'
  );
  
  if (!confirmed) return;
  
  try {
    await api.post('/addons/bulk-delete', {
      ids: selectedAddons.value,
    });
    
    await showSuccess(`${selectedAddons.value.length} addon berhasil dihapus`);
    selectedAddons.value = [];
    await loadReport();
  } catch (error: any) {
    console.error('Error bulk deleting addons:', error);
    await showError(error.response?.data?.message || 'Gagal menghapus addon');
  }
};

const editSubscription = async (subscription: any) => {
  selectedSubscription.value = subscription;
  editingSubscription.value = {
    addedBySuperAdmin: subscription.addedBySuperAdmin || false,
  };
  showSubscriptionModal.value = true;
};

const updateSubscription = async () => {
  if (!selectedSubscription.value) return;
  
  try {
    await api.patch(`/subscriptions/${selectedSubscription.value.id}`, {
      addedBySuperAdmin: editingSubscription.value.addedBySuperAdmin,
    });
    
    await showSuccess('Subscription berhasil diperbarui');
    showSubscriptionModal.value = false;
    await loadReport();
  } catch (error: any) {
    console.error('Error updating subscription:', error);
    await showError(error.response?.data?.message || 'Gagal memperbarui subscription');
  }
};

const deleteSubscription = async (subscription: any) => {
  const confirmed = await showConfirm(`Apakah Anda yakin ingin menghapus subscription untuk ${subscription.tenantName}?`, 'Hapus Subscription');
  if (!confirmed) {
    return;
  }
  
  try {
    await api.delete(`/subscriptions/${subscription.id}`);
    await showSuccess('Subscription berhasil dihapus');
    showSubscriptionModal.value = false;
    await loadReport();
  } catch (error: any) {
    console.error('Error deleting subscription:', error);
    await showError(error.response?.data?.message || 'Gagal menghapus subscription');
  }
};

const printSubscription = async (subscription: any) => {
  try {
    // Generate print content for subscription
    const printContent = `
      <html>
        <head>
          <title>Subscription Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            .info { margin: 10px 0; }
            .label { font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Subscription Receipt</h1>
          <div class="info"><span class="label">Tenant:</span> ${subscription.tenantName}</div>
          <div class="info"><span class="label">Paket:</span> ${subscription.plan}</div>
          <div class="info"><span class="label">Jumlah:</span> ${formatCurrency(subscription.amount)}</div>
          <div class="info"><span class="label">Tanggal:</span> ${new Date(subscription.createdAt).toLocaleDateString('id-ID')}</div>
          <div class="info"><span class="label">Status:</span> ${subscription.status === 'ACTIVE' ? 'Aktif' : 'Expired'}</div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  } catch (error: any) {
    console.error('Error printing subscription:', error);
    await showError('Gagal mencetak subscription');
  }
};

// Format duration helper
const formatDuration = (startDate: string | Date, endDate: string | Date) => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} hari`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      const days = diffDays % 30;
      return days > 0 ? `${months} bulan ${days} hari` : `${months} bulan`;
    } else {
      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);
      if (months > 0) {
        return `${years} tahun ${months} bulan`;
      }
      return `${years} tahun`;
    }
  } catch (error) {
    return '-';
  }
};

const editAddon = async (addon: any) => {
  selectedAddon.value = addon;
  editingAddon.value = {
    addedBySuperAdmin: addon.addedBySuperAdmin || false,
  };
  showAddonModal.value = true;
};

const updateAddon = async () => {
  if (!selectedAddon.value) return;
  
  try {
    await api.patch(`/addons/${selectedAddon.value.id}`, {
      addedBySuperAdmin: editingAddon.value.addedBySuperAdmin,
    });
    
    await showSuccess('Addon berhasil diperbarui');
    showAddonModal.value = false;
    await loadReport();
  } catch (error: any) {
    console.error('Error updating addon:', error);
    await showError(error.response?.data?.message || 'Gagal memperbarui addon');
  }
};

const deleteAddon = async (addon: any) => {
  const confirmed = await showConfirm(`Apakah Anda yakin ingin menghapus addon ${addon.addonName} untuk ${addon.tenantName}?`, 'Hapus Addon');
  if (!confirmed) {
    return;
  }
  
  try {
    await api.delete(`/addons/${addon.id}`);
    await showSuccess('Addon berhasil dihapus');
    showAddonModal.value = false;
    await loadReport();
  } catch (error: any) {
    console.error('Error deleting addon:', error);
    await showError(error.response?.data?.message || 'Gagal menghapus addon');
  }
};

const printAddon = async (addon: any) => {
  try {
    // Generate print content for addon
    const printContent = `
      <html>
        <head>
          <title>Addon Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            .info { margin: 10px 0; }
            .label { font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Addon Receipt</h1>
          <div class="info"><span class="label">Tenant:</span> ${addon.tenantName}</div>
          <div class="info"><span class="label">Nama Addon:</span> ${addon.addonName}</div>
          <div class="info"><span class="label">Jumlah:</span> ${formatCurrency(addon.amount)}</div>
          <div class="info"><span class="label">Tanggal:</span> ${new Date(addon.subscribedAt).toLocaleDateString('id-ID')}</div>
          <div class="info"><span class="label">Status:</span> ${addon.status === 'active' ? 'Aktif' : 'Expired'}</div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  } catch (error: any) {
    console.error('Error printing addon:', error);
    await showError('Gagal mencetak addon');
  }
};

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // Apply default monthly filter
  applyPeriodFilter();
  loadReport();
});
</script>

