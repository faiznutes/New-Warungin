<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col">
        <h2 class="text-3xl font-bold text-[#0d141b] dark:text-white tracking-tight">Store Reports</h2>
        <p class="text-[#4c739a] dark:text-[#4c739a] mt-1">Sales and stock reports per store/branch.</p>
      </div>
    </div>

    <!-- Date Filter -->
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Start Date</label>
          <input
            v-model="startDate"
            type="date"
            class="w-full px-4 py-3 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-[#10b981]"
          />
        </div>
        <div>
          <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">End Date</label>
          <input
            v-model="endDate"
            type="date"
            class="w-full px-4 py-3 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-[#10b981]"
          />
        </div>
        <div class="flex items-end">
          <button
            @click="loadReport"
            :disabled="loading"
            class="w-full flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#10b981]-hover text-white px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/30 transition-all active:scale-95 font-medium text-sm disabled:opacity-50"
          >
            <span class="material-symbols-outlined text-[20px]" v-if="!loading">bar_chart</span>
            <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {{ loading ? 'Loading...' : 'Generate Report' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-16">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin"></div>
        <p class="text-[#4c739a] font-medium">Loading report...</p>
      </div>
    </div>

    <!-- Report Content -->
    <div v-else-if="report" class="space-y-6">
      <!-- Combined Summary -->
      <div class="bg-gradient-to-br bg-[#10b981]/5 to-[#10b981]/10 dark:bg-[#10b981]/10 dark:to-[#10b981]/20 rounded-xl shadow-sm border border-[#10b981]/20 p-6">
        <h3 class="text-xl font-bold text-[#0d141b] dark:text-white mb-4 flex items-center gap-2">
          <span class="material-symbols-outlined text-[#10b981]">analytics</span>
          Combined Summary - All Stores
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm">
            <p class="text-sm text-[#4c739a] mb-1">Total Revenue</p>
            <p class="text-2xl font-bold text-[#10b981]">{{ formatCurrency(report.combined.revenue) }}</p>
          </div>
          <div class="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm">
            <p class="text-sm text-[#4c739a] mb-1">Total Orders</p>
            <p class="text-2xl font-bold text-[#0d141b] dark:text-white">{{ report.combined.orders }}</p>
          </div>
          <div class="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm">
            <p class="text-sm text-[#4c739a] mb-1">Total Items Sold</p>
            <p class="text-2xl font-bold text-[#0d141b] dark:text-white">{{ report.combined.items }}</p>
          </div>
        </div>
      </div>

      <!-- Sales Per Store -->
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 class="text-lg font-bold text-[#0d141b] dark:text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-[#10b981]">attach_money</span>
            Sales Per Store
          </h3>
        </div>
        <div v-if="report.salesByOutlet.length === 0" class="text-center py-12">
          <span class="material-symbols-outlined text-[48px] text-slate-300 mb-4">trending_flat</span>
          <p class="text-[#4c739a]">No sales data for this period</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
            <thead>
              <tr class="bg-[#f6f7f8] dark:bg-slate-900/50">
                <th class="px-6 py-3 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Store</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Revenue</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Orders</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Items Sold</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Avg per Order</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
              <tr
                v-for="store in report.salesByOutlet"
                :key="store.outlet.id"
                class="hover:bg-[#f6f7f8] dark:hover:bg-slate-700/50 transition"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-[#0d141b] dark:text-white">{{ store.outlet.name }}</div>
                  <div v-if="store.outlet.address" class="text-xs text-[#4c739a]">{{ store.outlet.address }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#10b981]">
                  {{ formatCurrency(store.revenue) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-[#0d141b] dark:text-white">
                  {{ store.orders }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-[#0d141b] dark:text-white">
                  {{ store.items }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-[#4c739a]">
                  {{ formatCurrency(store.orders > 0 ? store.revenue / store.orders : 0) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Stock Per Store -->
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 class="text-lg font-bold text-[#0d141b] dark:text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-[#10b981]">inventory_2</span>
            Stock Per Store
          </h3>
        </div>
        <div v-if="report.stockByOutlet.length === 0" class="text-center py-12">
          <span class="material-symbols-outlined text-[48px] text-slate-300 mb-4">inventory</span>
          <p class="text-[#4c739a]">No stock data available</p>
        </div>
        <div v-else class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="store in report.stockByOutlet"
            :key="store.outlet.id"
            class="border-2 rounded-xl p-4"
            :class="store.lowStockCount > 0 ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'"
          >
            <h4 class="font-bold text-[#0d141b] dark:text-white mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-[#10b981] text-[20px]">store</span>
              {{ store.outlet.name }}
            </h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-[#4c739a]">Total Products:</span>
                <span class="font-semibold text-[#0d141b] dark:text-white">{{ store.totalProducts }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[#4c739a]">Total Stock:</span>
                <span class="font-semibold text-[#0d141b] dark:text-white">{{ store.totalStock }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[#4c739a]">Low Stock:</span>
                <span
                  class="font-semibold flex items-center gap-1"
                  :class="store.lowStockCount > 0 ? 'text-yellow-600' : 'text-green-600'"
                >
                  <span v-if="store.lowStockCount > 0" class="material-symbols-outlined text-[16px]">warning</span>
                  {{ store.lowStockCount }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
      <span class="material-symbols-outlined text-[64px] text-slate-300 mb-4">bar_chart</span>
      <h3 class="text-lg font-bold text-[#0d141b] dark:text-white mb-2">No Report Yet</h3>
      <p class="text-[#4c739a] text-center max-w-md">Select dates and click "Generate Report" to view data.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';
import { formatCurrency } from '../../utils/formatters';
import { useNotification } from '../../composables/useNotification';

const { error: showError } = useNotification();

const loading = ref(false);
const report = ref<any>(null);
const startDate = ref('');
const endDate = ref('');

const loadReport = async () => {
  if (!startDate.value || !endDate.value) {
    showError('Please select start and end dates');
    return;
  }

  loading.value = true;
  try {
    const response = await api.get('/reports/multi', {
      params: {
        startDate: startDate.value,
        endDate: endDate.value,
      },
    });
    report.value = response.data;
  } catch (error: any) {
    showError(error.response?.data?.message || 'Failed to load report');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);

  endDate.value = end.toISOString().split('T')[0];
  startDate.value = start.toISOString().split('T')[0];

  loadReport();
});
</script>
