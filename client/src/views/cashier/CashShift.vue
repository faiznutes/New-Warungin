<template>
  <div class="flex flex-col h-full gap-6 p-6">
    <!-- Header -->
    <div class="flex flex-col gap-1">
      <h1 class="text-[#0d141b] dark:text-white text-2xl sm:text-3xl font-bold leading-tight tracking-tight">Cash & Physical Recap</h1>
      <p class="text-[#4c739a] dark:text-slate-400">Manage cashier shifts and physical cash recap</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- No Active Store Shift - Show Open Store Shift Form -->
    <div v-else-if="!currentStoreShift" class="max-w-2xl mx-auto w-full">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border-2 border-dashed border-slate-200 dark:border-slate-700 p-8">
        <div class="text-center mb-8">
          <div class="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="material-symbols-outlined text-[40px] text-slate-400">store_front</span>
          </div>
          <h2 class="text-xl font-bold text-[#0d141b] dark:text-white mb-2">No Active Store Shift</h2>
          <p class="text-[#4c739a] dark:text-slate-400">Please open a store shift first to start transactions</p>
        </div>

        <form @submit.prevent="handleOpenStoreShift" class="space-y-6">
          <div class="space-y-2">
            <label class="block text-sm font-bold text-[#0d141b] dark:text-white">
              Shift Type <span class="text-red-500">*</span>
            </label>
            <select
              v-model="openStoreShiftForm.shiftType"
              required
              class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-[#0d141b] dark:text-white font-medium transition-all"
            >
              <option value="">Select Shift</option>
              <option value="pagi">Morning (06:00 - 12:00)</option>
              <option value="siang">Afternoon (12:00 - 18:00)</option>
              <option value="sore">Evening (18:00 - 24:00)</option>
              <option value="malam">Night (00:00 - 06:00)</option>
            </select>
            <p class="text-xs text-[#4c739a]">Select the shift to open for this store</p>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-bold text-[#0d141b] dark:text-white">
              Initial Cash (Optional)
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[#4c739a] font-bold">Rp</span>
              <input
                v-model.number="openStoreShiftForm.modalAwal"
                type="number"
                class="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-[#0d141b] dark:text-white font-medium transition-all"
                placeholder="0"
              />
            </div>              step="0.01"
              min="0"
              class="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg font-semibold"
              placeholder="0"
            />
            <p class="text-xs text-[#4c739a] mt-1">Initial cash for the shift (optional, can be filled when opening cashier cash shift)</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-[#0d141b] mb-2">
              Notes (Optional)
            </label>
            <textarea
              v-model="openStoreShiftForm.catatan"
              rows="3"
              class="w-full px-4 py-2 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Additional notes..."
            ></textarea>
          </div>

          <button
            type="submit"
            :disabled="openingStoreShift || !openStoreShiftForm.shiftType"
            class="w-full px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg v-if="openingStoreShift" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ openingStoreShift ? 'Opening Shift...' : 'Open Store Shift' }}</span>
          </button>
        </form>
      </div>
    </div>

    <!-- Active Store Shift - Show Store Shift Info and Cash Shift Form -->
    <div v-else-if="currentStoreShift && !currentShift" class="space-y-6 max-w-2xl mx-auto w-full">
      <!-- Store Shift Info Card -->
      <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-[#0d141b] dark:text-white mb-2">Active Store Shift</h2>
            <div class="space-y-1">
              <p class="text-sm text-[#4c739a] dark:text-slate-300">
                Shift: <span class="font-bold capitalize text-[#0d141b] dark:text-white">{{ currentStoreShift.shiftType }}</span>
              </p>
              <p class="text-sm text-[#4c739a] dark:text-slate-300">
                Opened: <span class="font-medium">{{ formatDateTime(currentStoreShift.openedAt) }}</span>
              </p>
              <p class="text-xs text-[#4c739a] dark:text-slate-400 mt-2" v-if="currentStoreShift.opener">
                Opened by: <span class="font-medium">{{ currentStoreShift.opener.name }}</span>
              </p>
            </div>
          </div>
          <div class="px-4 py-2 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-xl text-sm font-bold capitalize shadow-sm">
            {{ currentStoreShift.shiftType }}
          </div>
        </div>
      </div>

      <!-- Cash Shift Form -->
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border-2 border-dashed border-slate-200 dark:border-slate-700 p-8">
        <div class="text-center mb-8">
          <div class="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="material-symbols-outlined text-[40px] text-emerald-500">payments</span>
          </div>
          <h2 class="text-xl font-bold text-[#0d141b] dark:text-white mb-2">Open Cash Shift</h2>
          <p class="text-[#4c739a] dark:text-slate-400">Please open a cash shift to start transactions</p>
        </div>

        <form @submit.prevent="handleOpenShift" class="space-y-6">
          <div class="space-y-2">
            <label class="block text-sm font-bold text-[#0d141b] dark:text-white">
              Initial Cash <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[#4c739a] font-bold">Rp</span>
              <input
                v-model.number="openShiftForm.modalAwal"
                type="number"
                step="0.01"
                min="0.01"
                required
                class="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-[#0d141b] dark:text-white font-medium transition-all"
                placeholder="0"
              />
            </div>
            <p class="text-xs text-[#4c739a]">Enter the amount of cash available at the cashier</p>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-bold text-[#0d141b] dark:text-white">
              Notes (Optional)
            </label>
            <textarea
              v-model="openShiftForm.catatan"
              rows="3"
              class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-[#0d141b] dark:text-white font-medium transition-all"
              placeholder="Additional notes..."
            ></textarea>
          </div>

          <button
            type="submit"
            :disabled="openingShift || !openShiftForm.modalAwal || openShiftForm.modalAwal <= 0"
            class="w-full px-6 py-3 bg-primary hover:bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <div v-if="openingShift" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>{{ openingShift ? 'Opening Shift...' : 'Open Cash Shift' }}</span>
          </button>
        </form>
      </div>
    </div>

    <!-- Active Shift - Show Current Shift Info with Tabs -->
    <div v-else class="space-y-6">
      <!-- Tabs Navigation -->
      <div class="bg-white rounded-xl shadow-lg border border-slate-200">
        <div class="border-b border-slate-200">
          <nav class="flex -mb-px">
            <button
              @click="activeTab = 'today'"
              :class="[
                'px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'today'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-[#4c739a] hover:text-[#0d141b] hover:border-slate-300'
              ]"
            >
              Today's Shifts
            </button>
            <button
              @click="activeTab = 'history'"
              :class="[
                'px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'history'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-[#4c739a] hover:text-[#0d141b] hover:border-slate-300'
              ]"
            >
              Shift History
            </button>
          </nav>
        </div>
      </div>

      <!-- Tab Content: Shift Hari Ini -->
      <div v-if="activeTab === 'today'" class="space-y-6">
        <!-- Store Shift Info Card -->
        <div v-if="currentStoreShift" class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 sm:p-8 border-2 border-blue-200">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-bold text-[#0d141b] mb-1">Active Store Shift</h3>
              <p class="text-sm text-[#4c739a]">
                Shift: <span class="font-semibold capitalize">{{ currentStoreShift.shiftType }}</span> | 
                Opened: {{ formatDateTime(currentStoreShift.openedAt) }}
              </p>
              <p class="text-xs text-[#4c739a] mt-1" v-if="currentStoreShift.opener">
                Opened by: {{ currentStoreShift.opener.name }}
              </p>
            </div>
            <div class="flex gap-2">
              <button
                @click="viewShiftDetails(currentStoreShift.id)"
                class="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-semibold"
              >
                View Details
              </button>
              <span class="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold capitalize">
                {{ currentStoreShift.shiftType }}
              </span>
            </div>
          </div>
        </div>

        <!-- Today's Shifts List -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h3 class="text-xl font-bold text-[#0d141b] mb-4">Today's Shifts</h3>
          <div v-if="todayShiftsLoading" class="text-center py-8">
            <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
          <div v-else-if="todayShifts.length === 0" class="text-center py-8 text-[#4c739a]">
            No shifts today yet
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="shift in todayShifts"
              :key="shift.id"
              class="border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition cursor-pointer"
              @click="viewShiftDetails(shift.id)"
            >
              <div class="flex items-center justify-between">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold capitalize">
                      {{ shift.shiftType }}
                    </span>
                    <span
                      :class="[
                        'px-3 py-1 rounded-full text-xs font-semibold',
                        shift.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      ]"
                    >
                      {{ shift.status === 'open' ? 'Open' : 'Closed' }}
                    </span>
                  </div>
                  <p class="text-sm text-[#4c739a]">
                    Opened: {{ formatDateTime(shift.openedAt) }}
                    <span v-if="shift.closedAt"> | Closed: {{ formatDateTime(shift.closedAt) }}</span>
                  </p>
                  <p class="text-xs text-[#4c739a] mt-1" v-if="shift.opener">
                    Opened by: {{ shift.opener.name }}
                  </p>
                </div>
                <button
                  @click.stop="viewShiftDetails(shift.id)"
                  class="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition text-sm font-semibold"
                >
                  Detail
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Content: Riwayat Shift -->
      <div v-if="activeTab === 'history'" class="space-y-6">
        <!-- Current Cash Shift Card (if active) -->
        <div v-if="currentShift" class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 sm:p-8 border-2 border-green-200">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-xl sm:text-2xl font-bold text-[#0d141b] mb-2">Active Cash Shift</h2>
              <p class="text-sm text-[#4c739a]">
                Opened: {{ formatDateTime(currentShift.shiftStart) }}
              </p>
            </div>
            <span class="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-semibold">
              OPEN
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-white rounded-xl p-4 border border-slate-200">
              <p class="text-sm text-[#4c739a] mb-1">Initial Cash</p>
              <p class="text-2xl font-bold text-[#0d141b]">{{ formatCurrency(currentShift.modalAwal) }}</p>
            </div>
            <div class="bg-white rounded-xl p-4 border border-slate-200">
              <p class="text-sm text-[#4c739a] mb-1">Total Sales</p>
              <p class="text-2xl font-bold text-blue-600">{{ formatCurrency(currentShift.totalPenjualan || 0) }}</p>
            </div>
            <div class="bg-white rounded-xl p-4 border border-slate-200">
              <p class="text-sm text-[#4c739a] mb-1">Expected Balance</p>
              <p class="text-2xl font-bold text-green-600">
                {{ formatCurrency((currentShift.modalAwal || 0) + (currentShift.totalPenjualan || 0)) }}
              </p>
            </div>
          </div>

          <div class="flex gap-3">
            <button
              @click="showCloseModal = true"
              class="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close Shift
            </button>
            <button
              @click="loadCurrentShift"
              class="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition font-semibold"
            >
              Refresh
            </button>
          </div>
        </div>

        <!-- Store Shift History -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h3 class="text-xl font-bold text-[#0d141b] mb-4">Store Shift History</h3>
          <div v-if="storeShiftHistoryLoading" class="text-center py-8">
            <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
          <div v-else-if="storeShiftHistory.length === 0" class="text-center py-8 text-[#4c739a]">
            No shift history yet
          </div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200">
              <thead class="bg-slate-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-[#4c739a] uppercase">Shift</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-[#4c739a] uppercase">Opened</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-[#4c739a] uppercase">Closed</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-[#4c739a] uppercase">Opened By</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-[#4c739a] uppercase">Status</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-[#4c739a] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-slate-200">
                <tr
                  v-for="shift in storeShiftHistory"
                  :key="shift.id"
                  class="hover:bg-slate-50"
                >
                  <td class="px-4 py-3 whitespace-nowrap">
                    <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold capitalize">
                      {{ shift.shiftType }}
                    </span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-[#0d141b]">
                    {{ formatDateTime(shift.openedAt) }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-[#0d141b]">
                    {{ shift.closedAt ? formatDateTime(shift.closedAt) : '-' }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-[#0d141b]">
                    {{ shift.opener?.name || '-' }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <span
                      :class="[
                        'px-2 py-1 text-xs font-semibold rounded-full',
                        shift.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      ]"
                    >
                      {{ shift.status === 'open' ? 'Open' : 'Closed' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <button
                      @click="viewShiftDetails(shift.id)"
                      class="px-3 py-1 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition text-xs font-semibold"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="storeShiftHistoryPagination.totalPages > 1" class="mt-4 flex items-center justify-between">
            <div class="text-sm text-[#0d141b]">
              Page {{ storeShiftHistoryPagination.page }} of {{ storeShiftHistoryPagination.totalPages }}
            </div>
            <div class="flex gap-2">
              <button
                @click="changeStoreShiftHistoryPage(storeShiftHistoryPagination.page - 1)"
                :disabled="storeShiftHistoryPagination.page === 1"
                class="px-4 py-2 border border-slate-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                @click="changeStoreShiftHistoryPage(storeShiftHistoryPagination.page + 1)"
                :disabled="storeShiftHistoryPagination.page === storeShiftHistoryPagination.totalPages"
                class="px-4 py-2 border border-slate-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Shift Detail Modal -->
    <div
      v-if="showShiftDetailModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      @click.self="showShiftDetailModal = false"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-6xl w-full p-6 my-8">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-[#0d141b]">Shift Details</h3>
          <button
            @click="showShiftDetailModal = false"
            class="text-slate-400 hover:text-[#4c739a]"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Shift Info -->
        <div v-if="shiftDetail" class="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p class="text-xs text-[#4c739a] mb-1">Shift Type</p>
              <p class="text-sm font-semibold text-[#0d141b] capitalize">{{ shiftDetail.shift.shiftType }}</p>
            </div>
            <div>
              <p class="text-xs text-[#4c739a] mb-1">Opened</p>
              <p class="text-sm font-semibold text-[#0d141b]">{{ formatDateTime(shiftDetail.shift.openedAt) }}</p>
            </div>
            <div>
              <p class="text-xs text-[#4c739a] mb-1">Closed</p>
              <p class="text-sm font-semibold text-[#0d141b]">{{ shiftDetail.shift.closedAt ? formatDateTime(shiftDetail.shift.closedAt) : 'Still Open' }}</p>
            </div>
            <div>
              <p class="text-xs text-[#4c739a] mb-1">Opened By</p>
              <p class="text-sm font-semibold text-[#0d141b]">{{ shiftDetail.shift.opener?.name || '-' }}</p>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="mb-6 bg-slate-50 rounded-xl p-4">
          <p class="text-sm font-semibold text-[#0d141b] mb-3">Filter Details:</p>
          <div class="flex flex-wrap gap-3">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                v-model="shiftDetailFilters.includeOrders"
                @change="loadShiftDetails(selectedShiftId)"
                class="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
              />
              <span class="text-sm text-[#0d141b]">Sales</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                v-model="shiftDetailFilters.includeStockTransfers"
                @change="loadShiftDetails(selectedShiftId)"
                class="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
              />
              <span class="text-sm text-[#0d141b]">Stock Transfers</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                v-model="shiftDetailFilters.includeProductAdjustments"
                @change="loadShiftDetails(selectedShiftId)"
                class="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
              />
              <span class="text-sm text-[#0d141b]">Stock Adjustments</span>
            </label>
          </div>
        </div>

        <!-- Summary -->
        <div v-if="shiftDetail" class="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl p-4 border border-slate-200">
            <p class="text-xs text-[#4c739a] mb-1">Total Revenue</p>
            <p class="text-lg font-bold text-green-600">{{ formatCurrency(shiftDetail.summary.totalRevenue) }}</p>
          </div>
          <div class="bg-white rounded-xl p-4 border border-slate-200">
            <p class="text-xs text-[#4c739a] mb-1">Total Orders</p>
            <p class="text-lg font-bold text-blue-600">{{ shiftDetail.summary.totalOrders }}</p>
          </div>
          <div class="bg-white rounded-xl p-4 border border-slate-200">
            <p class="text-xs text-[#4c739a] mb-1">Stock Transfers</p>
            <p class="text-lg font-bold text-purple-600">{{ shiftDetail.summary.totalStockTransfers }}</p>
          </div>
          <div class="bg-white rounded-xl p-4 border border-slate-200">
            <p class="text-xs text-[#4c739a] mb-1">Stock Adjustments</p>
            <p class="text-lg font-bold text-orange-600">{{ shiftDetail.summary.totalProductAdjustments }}</p>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="shiftDetailLoading" class="text-center py-12">
          <div class="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>

        <!-- Orders -->
        <div v-else-if="shiftDetail && shiftDetailFilters.includeOrders && shiftDetail.orders.length > 0" class="mb-6">
          <h4 class="text-lg font-bold text-[#0d141b] mb-4">Sales ({{ shiftDetail.orders.length }})</h4>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200">
              <thead class="bg-slate-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-[#4c739a] uppercase">Order #</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-[#4c739a] uppercase">Customer</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-[#4c739a] uppercase">Cashier</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-[#4c739a] uppercase">Total</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-[#4c739a] uppercase">Time</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-slate-200">
                <tr v-for="order in shiftDetail.orders" :key="order.id" class="hover:bg-slate-50">
                  <td class="px-4 py-3 text-sm text-[#0d141b]">{{ order.orderNumber }}</td>
                  <td class="px-4 py-3 text-sm text-[#0d141b]">{{ order.customer?.name || 'Walk-in Customer' }}</td>
                  <td class="px-4 py-3 text-sm text-[#0d141b]">{{ order.user?.name || '-' }}</td>
                  <td class="px-4 py-3 text-sm font-semibold text-[#0d141b]">{{ formatCurrency(order.total) }}</td>
                  <td class="px-4 py-3 text-sm text-[#0d141b]">{{ formatDateTime(order.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Stock Transfers -->
        <div v-if="shiftDetail && shiftDetailFilters.includeStockTransfers && shiftDetail.stockTransfers.length > 0" class="mb-6">
          <h4 class="text-lg font-bold text-[#0d141b] mb-4">Stock Transfers ({{ shiftDetail.stockTransfers.length }})</h4>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200">
              <thead class="bg-slate-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-[#4c739a] uppercase">Transfer #</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-[#4c739a] uppercase">From</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-[#4c739a] uppercase">To</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-[#4c739a] uppercase">Status</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-[#4c739a] uppercase">Time</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-slate-200">
                <tr v-for="transfer in shiftDetail.stockTransfers" :key="transfer.id" class="hover:bg-slate-50">
                  <td class="px-4 py-3 text-sm text-[#0d141b]">{{ transfer.transferNumber }}</td>
                  <td class="px-4 py-3 text-sm text-[#0d141b]">{{ transfer.fromOutletId }}</td>
                  <td class="px-4 py-3 text-sm text-[#0d141b]">{{ transfer.toOutletId }}</td>
                  <td class="px-4 py-3 text-sm">
                    <span :class="[
                      'px-2 py-1 text-xs font-semibold rounded-full',
                      transfer.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    ]">
                      {{ transfer.status }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-[#0d141b]">{{ formatDateTime(transfer.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Product Adjustments -->
        <div v-if="shiftDetail && shiftDetailFilters.includeProductAdjustments && shiftDetail.productAdjustments.length > 0" class="mb-6">
          <h4 class="text-lg font-bold text-[#0d141b] mb-4">Stock Adjustments ({{ shiftDetail.productAdjustments.length }})</h4>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200">
              <thead class="bg-slate-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-[#4c739a] uppercase">Product</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-[#4c739a] uppercase">Type</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-[#4c739a] uppercase">Qty</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-[#4c739a] uppercase">Before</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-[#4c739a] uppercase">After</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-[#4c739a] uppercase">By</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-[#4c739a] uppercase">Time</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-slate-200">
                <tr v-for="adjustment in shiftDetail.productAdjustments" :key="adjustment.id" class="hover:bg-slate-50">
                  <td class="px-4 py-3 text-sm text-[#0d141b]">{{ adjustment.product?.name || '-' }}</td>
                  <td class="px-4 py-3 text-sm">
                    <span :class="[
                      'px-2 py-1 text-xs font-semibold rounded-full',
                      adjustment.type === 'INCREASE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    ]">
                      {{ adjustment.type === 'INCREASE' ? 'Add' : 'Subtract' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-[#0d141b]">{{ adjustment.quantity }}</td>
                  <td class="px-4 py-3 text-sm text-[#0d141b]">{{ adjustment.stockBefore }}</td>
                  <td class="px-4 py-3 text-sm text-[#0d141b]">{{ adjustment.stockAfter }}</td>
                  <td class="px-4 py-3 text-sm text-[#0d141b]">{{ adjustment.user?.name || '-' }}</td>
                  <td class="px-4 py-3 text-sm text-[#0d141b]">{{ formatDateTime(adjustment.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="shiftDetail && !shiftDetailLoading && 
          (!shiftDetailFilters.includeOrders || shiftDetail.orders.length === 0) &&
          (!shiftDetailFilters.includeStockTransfers || shiftDetail.stockTransfers.length === 0) &&
          (!shiftDetailFilters.includeProductAdjustments || shiftDetail.productAdjustments.length === 0)"
          class="text-center py-12 text-[#4c739a]"
        >
          No data for selected filters
        </div>
      </div>
    </div>

    <!-- Close Shift Modal -->
    <div
      v-if="showCloseModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="showCloseModal = false"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold text-[#0d141b] mb-4">Close Shift</h3>
        
        <div class="mb-4 space-y-2">
          <div class="bg-blue-50 rounded-xl p-3">
            <p class="text-sm text-[#4c739a]">Initial Cash</p>
            <p class="text-lg font-bold text-[#0d141b]">{{ formatCurrency(currentShift?.modalAwal || 0) }}</p>
          </div>
          <div class="bg-green-50 rounded-xl p-3">
            <p class="text-sm text-[#4c739a]">Total Sales</p>
            <p class="text-lg font-bold text-green-600">{{ formatCurrency(currentShift?.totalPenjualan || 0) }}</p>
          </div>
          <div class="bg-purple-50 rounded-xl p-3">
            <p class="text-sm text-[#4c739a]">Expected Balance</p>
            <p class="text-lg font-bold text-purple-600">
              {{ formatCurrency((currentShift?.modalAwal || 0) + (currentShift?.totalPenjualan || 0)) }}
            </p>
          </div>
        </div>

        <form @submit.prevent="handleCloseShift" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-[#0d141b] mb-2">
              Physical Cash at Register <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="closeShiftForm.uangFisikTutup"
              type="number"
              step="0.01"
              min="0"
              required
              class="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg font-semibold"
              placeholder="0"
            />
            <p class="text-xs text-[#4c739a] mt-1">Enter the physical cash amount currently in the register</p>
          </div>

          <div v-if="closeShiftForm.uangFisikTutup && currentShift">
            <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
              <p class="text-sm text-[#4c739a] mb-1">Difference</p>
              <p
                class="text-lg font-bold"
                :class="getSelisihClass(calculateSelisih())"
              >
                {{ formatCurrency(calculateSelisih()) }}
              </p>
              <p class="text-xs text-[#4c739a] mt-1">
                {{ calculateSelisih() > 0 ? 'Over' : calculateSelisih() < 0 ? 'Short' : 'Exact' }}
              </p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-[#0d141b] mb-2">
              Notes (Optional)
            </label>
            <textarea
              v-model="closeShiftForm.catatan"
              rows="3"
              class="w-full px-4 py-2 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Additional notes..."
            ></textarea>
          </div>

          <div class="flex gap-3">
            <button
              type="button"
              @click="showCloseModal = false"
              class="flex-1 px-4 py-2 border border-slate-300 rounded-xl hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="closingShift || !closeShiftForm.uangFisikTutup"
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ closingShift ? 'Closing...' : 'Close Shift' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';
import { formatCurrency } from '../../utils/formatters';
import { useAuthStore } from '../../stores/auth';

const { success: showSuccess, error: showError } = useNotification();
const authStore = useAuthStore();

const loading = ref(true);
const currentShift = ref<any>(null);
const currentStoreShift = ref<any>(null);
const openingShift = ref(false);
const openingStoreShift = ref(false);
const closingShift = ref(false);
const showCloseModal = ref(false);
const activeTab = ref<'today' | 'history'>('today');
const todayShifts = ref<any[]>([]);
const todayShiftsLoading = ref(false);
const storeShiftHistory = ref<any[]>([]);
const storeShiftHistoryLoading = ref(false);
const storeShiftHistoryPagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
});
const showShiftDetailModal = ref(false);
const shiftDetail = ref<any>(null);
const shiftDetailLoading = ref(false);
const selectedShiftId = ref<string>('');
const shiftDetailFilters = ref({
  includeOrders: true,
  includeStockTransfers: true,
  includeProductAdjustments: true,
});

const openShiftForm = ref({
  modalAwal: 0,
  catatan: '',
});

const openStoreShiftForm = ref({
  shiftType: '',
  modalAwal: 0,
  catatan: '',
});

const closeShiftForm = ref({
  uangFisikTutup: 0,
  catatan: '',
});

const shiftHistory = ref<any[]>([]);
const historyLoading = ref(false);
const historyPagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
});

const loadCurrentStoreShift = async () => {
  try {
    const selectedStoreId = authStore.selectedStoreId || localStorage.getItem('selectedStoreId');
    if (!selectedStoreId) {
      currentStoreShift.value = null;
      return;
    }
    const response = await api.get('/store-shift/current', {
      params: { outletId: selectedStoreId },
    });
    currentStoreShift.value = response.data.data;
  } catch (error: any) {
    if (error.response?.status === 404 || !error.response?.data?.data) {
      currentStoreShift.value = null;
    } else {
      console.error('Error loading current store shift:', error);
    }
  }
};

const loadCurrentShift = async () => {
  try {
    const response = await api.get('/cash-shift/current');
    currentShift.value = response.data.data;
  } catch (error: any) {
    if (error.response?.status === 404 || !error.response?.data?.data) {
      currentShift.value = null;
    } else {
      console.error('Error loading current shift:', error);
    }
  }
};

const loadShiftHistory = async () => {
  historyLoading.value = true;
  try {
    const response = await api.get('/cash-shift/history', {
      params: {
        page: historyPagination.value.page,
        limit: historyPagination.value.limit,
      },
    });
    shiftHistory.value = response.data.data || [];
    historyPagination.value = response.data.pagination || {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    };
  } catch (error: any) {
    console.error('Error loading shift history:', error);
    shiftHistory.value = [];
  } finally {
    historyLoading.value = false;
  }
};

const handleOpenStoreShift = async () => {
  if (!openStoreShiftForm.value.shiftType) {
    await showError('Shift type wajib dipilih');
    return;
  }

  const selectedStoreId = authStore.selectedStoreId || localStorage.getItem('selectedStoreId');
  if (!selectedStoreId) {
    await showError('Store belum dipilih');
    return;
  }

  openingStoreShift.value = true;
  try {
    await api.post('/store-shift/open', {
      outletId: selectedStoreId,
      shiftType: openStoreShiftForm.value.shiftType,
      modalAwal: openStoreShiftForm.value.modalAwal || undefined,
      catatan: openStoreShiftForm.value.catatan || undefined,
    });

    await showSuccess(`Shift ${openStoreShiftForm.value.shiftType} berhasil dibuka`);
    openStoreShiftForm.value = { shiftType: '', modalAwal: 0, catatan: '' };
    await loadCurrentStoreShift();
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Gagal membuka shift toko';
    await showError(errorMessage);
  } finally {
    openingStoreShift.value = false;
  }
};

const handleOpenShift = async () => {
  if (!openShiftForm.value.modalAwal || openShiftForm.value.modalAwal <= 0) {
    await showError('Modal awal harus lebih besar dari 0');
    return;
  }

  openingShift.value = true;
  try {
    await api.post('/cash-shift/open', {
      modalAwal: openShiftForm.value.modalAwal,
      catatan: openShiftForm.value.catatan || undefined,
    });

    await showSuccess('Cash shift berhasil dibuka');
    openShiftForm.value = { modalAwal: 0, catatan: '' };
    await loadCurrentShift();
    await loadShiftHistory();
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Gagal membuka cash shift';
    await showError(errorMessage);
  } finally {
    openingShift.value = false;
  }
};

const handleCloseShift = async () => {
  if (!closeShiftForm.value.uangFisikTutup && closeShiftForm.value.uangFisikTutup !== 0) {
    await showError('Uang fisik tutup wajib diisi');
    return;
  }

  closingShift.value = true;
  try {
    await api.post('/cash-shift/close', {
      uangFisikTutup: closeShiftForm.value.uangFisikTutup,
      catatan: closeShiftForm.value.catatan || undefined,
    });

    await showSuccess('Shift berhasil ditutup');
    showCloseModal.value = false;
    closeShiftForm.value = { uangFisikTutup: 0, catatan: '' };
    await loadCurrentShift();
    await loadShiftHistory();
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Gagal menutup shift';
    await showError(errorMessage);
  } finally {
    closingShift.value = false;
  }
};

const calculateSelisih = (): number => {
  if (!currentShift.value || !closeShiftForm.value.uangFisikTutup) return 0;
  const saldoSeharusnya = (currentShift.value.modalAwal || 0) + (currentShift.value.totalPenjualan || 0);
  return closeShiftForm.value.uangFisikTutup - saldoSeharusnya;
};

const getSelisihClass = (selisih: number | null): string => {
  if (selisih === null) return 'text-[#4c739a]';
  if (selisih > 0) return 'text-green-600';
  if (selisih < 0) return 'text-red-600';
  return 'text-[#4c739a]';
};

const formatDateTime = (date: string | Date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const changeHistoryPage = (page: number) => {
  historyPagination.value.page = page;
  loadShiftHistory();
};

const loadTodayShifts = async () => {
  todayShiftsLoading.value = true;
  try {
    const selectedStoreId = authStore.selectedStoreId || localStorage.getItem('selectedStoreId');
    if (!selectedStoreId) {
      todayShifts.value = [];
      return;
    }
    const response = await api.get('/store-shift/today', {
      params: { outletId: selectedStoreId },
    });
    todayShifts.value = response.data.data || [];
  } catch (error: any) {
    console.error('Error loading today shifts:', error);
    todayShifts.value = [];
  } finally {
    todayShiftsLoading.value = false;
  }
};

const loadStoreShiftHistory = async () => {
  storeShiftHistoryLoading.value = true;
  try {
    const selectedStoreId = authStore.selectedStoreId || localStorage.getItem('selectedStoreId');
    if (!selectedStoreId) {
      storeShiftHistory.value = [];
      return;
    }
    const response = await api.get('/store-shift/history', {
      params: {
        outletId: selectedStoreId,
        page: storeShiftHistoryPagination.value.page,
        limit: storeShiftHistoryPagination.value.limit,
      },
    });
    storeShiftHistory.value = response.data.data || [];
    storeShiftHistoryPagination.value = response.data.pagination || {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    };
  } catch (error: any) {
    console.error('Error loading store shift history:', error);
    storeShiftHistory.value = [];
  } finally {
    storeShiftHistoryLoading.value = false;
  }
};

const changeStoreShiftHistoryPage = (page: number) => {
  storeShiftHistoryPagination.value.page = page;
  loadStoreShiftHistory();
};

const viewShiftDetails = async (shiftId: string) => {
  selectedShiftId.value = shiftId;
  showShiftDetailModal.value = true;
  await loadShiftDetails(shiftId);
};

const loadShiftDetails = async (shiftId: string) => {
  shiftDetailLoading.value = true;
  try {
    const response = await api.get(`/store-shift/${shiftId}/details`, {
      params: {
        includeOrders: shiftDetailFilters.value.includeOrders,
        includeStockTransfers: shiftDetailFilters.value.includeStockTransfers,
        includeProductAdjustments: shiftDetailFilters.value.includeProductAdjustments,
      },
    });
    shiftDetail.value = response.data.data;
  } catch (error: any) {
    console.error('Error loading shift details:', error);
    await showError('Gagal memuat detail shift');
  } finally {
    shiftDetailLoading.value = false;
  }
};

// Watch activeTab to load data when tab changes
watch(activeTab, (newTab) => {
  if (newTab === 'today') {
    loadTodayShifts();
  } else if (newTab === 'history') {
    loadStoreShiftHistory();
  }
});

onMounted(async () => {
  loading.value = true;
  await Promise.all([
    loadCurrentStoreShift(),
    loadCurrentShift(),
    loadShiftHistory(),
    loadTodayShifts(),
  ]);
  loading.value = false;
});
</script>
