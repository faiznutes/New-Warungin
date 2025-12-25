<template>
  <div class="flex flex-col gap-8">
    <!-- Tenant Selector for Super Admin -->
    <TenantSelector @tenant-changed="handleTenantChange" />
    
    <!-- Store Selector (Only for SUPERVISOR) -->
    <div v-if="authStore.user?.role === 'SUPERVISOR'">
      <StoreSelector @store-changed="handleStoreChange" />
    </div>

    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col">
        <h2 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Reports</h2>
        <p class="text-slate-500 dark:text-slate-400 mt-1">Sales analysis and store performance.</p>
      </div>
      <button
        v-if="canExportReports || authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN' || authStore.user?.role === 'SUPERVISOR'"
        @click="showExportModal = true"
        class="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg shadow-lg shadow-primary/30 transition-all active:scale-95 font-medium text-sm"
      >
        <span class="material-symbols-outlined text-[20px]">download</span>
        <span>Export Report</span>
      </button>
    </div>

    <!-- Report Type & Period Filter -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Report Type</label>
          <select
            v-model="reportType"
            @change="handleReportTypeChange"
            class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="sales">Sales Report</option>
            <option value="financial">Financial Report</option>
          </select>
        </div>
        <div v-if="authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'">
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">View Type</label>
          <select
            v-model="reportViewType"
            @change="handleReportViewTypeChange"
            class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="full">Full (Revenue + Cost)</option>
            <option value="revenue">Revenue Only</option>
            <option value="profit">Profit Only</option>
          </select>
        </div>
        <div v-if="authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'">
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Margin Format</label>
          <select
            v-model="marginDisplayFormat"
            @change="saveMarginFormat"
            class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="amount">Amount</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Period</label>
          <select
            v-model="period"
            @change="setPeriod(period)"
            class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="all">All Time</option>
          </select>
        </div>
        <div v-if="period !== 'all'">
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date Range</label>
          <div class="flex gap-2">
            <input
              v-model="dateRange.from"
              type="date"
              @change="handleDateRangeChange"
              class="flex-1 px-3 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <input
              v-model="dateRange.to"
              type="date"
              @change="handleDateRangeChange"
              class="flex-1 px-3 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Analytics Section -->
    <div v-if="analyticsData && !loading" class="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span class="material-symbols-outlined text-primary">insights</span>
          Analytics
        </h3>
        <button
          @click="loadAnalytics"
          class="text-sm text-primary hover:text-primary-hover transition flex items-center gap-1"
        >
          <span class="material-symbols-outlined text-[18px]">refresh</span>
          Refresh
        </button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <p class="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Next Month Prediction</p>
          <p class="text-2xl font-bold text-blue-900 dark:text-blue-200">
            {{ formatCurrency(analyticsData.predictions?.nextMonth || 0) }}
          </p>
        </div>
        <div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <p class="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Sales Trend</p>
          <p 
            class="text-2xl font-bold"
            :class="(analyticsData.predictions?.trend || 0) >= 0 ? 'text-green-700' : 'text-red-700'"
          >
            {{ (analyticsData.predictions?.trend || 0) >= 0 ? '+' : '' }}{{ (analyticsData.predictions?.trend || 0).toFixed(2) }}%
          </p>
        </div>
        <div class="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
          <p class="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Prediction Accuracy</p>
          <p class="text-2xl font-bold text-purple-900 dark:text-purple-200">
            {{ analyticsData.predictions?.accuracy || 0 }}%
          </p>
        </div>
      </div>
      
      <div v-if="analyticsData.topProducts && analyticsData.topProducts.length > 0" class="mt-6">
        <h4 class="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[18px]">trending_up</span>
          Top Products
        </h4>
        <div class="space-y-2">
          <div
            v-for="(product, index) in analyticsData.topProducts.slice(0, 5)"
            :key="product.id"
            class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg"
          >
            <div class="flex items-center gap-3">
              <span class="w-6 h-6 flex items-center justify-center text-xs font-bold bg-primary/10 text-primary rounded">#{{ index + 1 }}</span>
              <span class="text-sm font-medium text-slate-900 dark:text-white">{{ product.name }}</span>
            </div>
            <span class="text-sm font-bold text-primary">{{ product.sales || 0 }} sold</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-16">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p class="text-slate-500 font-medium">Loading report...</p>
      </div>
    </div>

    <!-- Report Content -->
    <div v-else-if="reportData" class="space-y-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="(stat, index) in summaryStats"
          :key="index"
          class="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 p-6"
        >
          <div class="flex items-center justify-between mb-2">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">{{ stat.label }}</p>
            <span class="text-2xl">{{ stat.icon || '📊' }}</span>
          </div>
          <p :class="['text-3xl font-bold', stat.color || 'text-slate-900 dark:text-white']">{{ stat.value }}</p>
        </div>
      </div>

      <!-- Report Details Table -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Report Details</h3>
              <p class="text-sm text-slate-500 mt-1">
                Period: {{ getPeriodLabel(period) }} 
                <span v-if="period !== 'all'">
                  ({{ formatDate(dateRange.from) }} - {{ formatDate(dateRange.to) }})
                </span>
              </p>
            </div>
            <button
              v-if="reportType === 'sales' && (authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN')"
              @click="showProductDetails = !showProductDetails"
              class="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-hover transition font-medium"
            >
              <span class="material-symbols-outlined text-[18px]">{{ showProductDetails ? 'visibility_off' : 'visibility' }}</span>
              {{ showProductDetails ? 'Hide' : 'Show' }} Product Details
            </button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-900/50">
                <th
                  v-for="header in reportHeaders"
                  :key="header"
                  class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider"
                >
                  {{ header }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
              <template v-for="(row, index) in reportRows" :key="index">
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                  <td
                    v-for="(cell, cellIndex) in row"
                    :key="cellIndex"
                    class="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white"
                  >
                    {{ cell }}
                  </td>
                </tr>
                <!-- Shift Info Row -->
                <tr
                  v-if="reportType === 'sales' && byDate[index]?.orders && byDate[index].orders.length > 0 && byDate[index].orders[0]?.storeShift"
                  class="bg-blue-50 dark:bg-blue-900/20"
                >
                  <td :colspan="reportHeaders.length" class="px-6 py-3">
                    <div class="flex flex-wrap items-center gap-4 text-sm">
                      <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-blue-600 text-[18px]">schedule</span>
                        <span class="text-slate-600">Shift:</span>
                        <span class="font-semibold text-slate-900 dark:text-white capitalize">{{ byDate[index].orders[0].storeShift.shiftType || 'N/A' }}</span>
                      </div>
                      <div v-if="byDate[index].orders[0].storeShift.opener" class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-blue-600 text-[18px]">person</span>
                        <span class="text-slate-600">Opened by:</span>
                        <span class="font-semibold text-slate-900 dark:text-white">{{ byDate[index].orders[0].storeShift.opener.name || 'N/A' }}</span>
                      </div>
                      <div v-if="byDate[index].orders[0].storeShift.openedAt" class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-blue-600 text-[18px]">calendar_today</span>
                        <span class="text-slate-600">Opened:</span>
                        <span class="font-semibold text-slate-900 dark:text-white">{{ formatDateTime(byDate[index].orders[0].storeShift.openedAt) }}</span>
                      </div>
                    </div>
                  </td>
                </tr>
                <!-- Product Details Row -->
                <tr
                  v-if="showProductDetails && reportType === 'sales' && (authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN') && productDetails[index]"
                  class="bg-slate-50 dark:bg-slate-900/50"
                >
                  <td :colspan="reportHeaders.length" class="px-6 py-4">
                    <div class="space-y-3">
                      <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <span class="material-symbols-outlined text-[16px]">inventory_2</span>
                        Product Details:
                      </h4>
                      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div
                          v-for="product in productDetails[index]"
                          :key="product.id"
                          class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary cursor-pointer transition"
                          @click="showProductDetailModal(product)"
                        >
                          <div class="flex justify-between items-start mb-2">
                            <span class="text-sm font-bold text-slate-900 dark:text-white">{{ product.name }}</span>
                            <span class="text-xs font-bold bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">x{{ product.quantity }}</span>
                          </div>
                          <div class="space-y-1 text-xs">
                            <div class="flex justify-between">
                              <span class="text-slate-500">Selling Price:</span>
                              <span class="font-medium text-slate-900 dark:text-white">{{ formatCurrency(product.sellingPrice) }}</span>
                            </div>
                            <div v-if="product.cost && product.cost > 0" class="flex justify-between">
                              <span class="text-slate-500">Cost:</span>
                              <span class="font-medium text-red-600">{{ formatCurrency(product.cost) }}</span>
                            </div>
                            <div v-if="product.cost && product.cost > 0" class="flex justify-between">
                              <span class="text-slate-500">Profit:</span>
                              <span class="font-medium text-green-600">{{ formatCurrency(product.profit) }}</span>
                            </div>
                            <div v-if="product.cost && product.cost > 0" class="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                              <span class="text-slate-500">Margin:</span>
                              <span class="font-bold text-green-600">{{ formatProductMargin(product.sellingPrice, product.cost, product.profit) }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Product Detail Modal -->
      <div
        v-if="selectedProductDetail"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="selectedProductDetail = null"
      >
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ selectedProductDetail.name }}</h3>
            <button
              @click="selectedProductDetail = null"
              class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
            >
              <span class="material-symbols-outlined text-slate-500">close</span>
            </button>
          </div>
          <div class="space-y-4">
            <div class="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Quantity Sold</p>
              <p class="text-xl font-bold text-slate-900 dark:text-white">{{ selectedProductDetail.quantity }} units</p>
            </div>
            <div class="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Price per Unit</p>
              <p class="text-xl font-bold text-primary">{{ formatCurrency(selectedProductDetail.sellingPrice / selectedProductDetail.quantity) }}</p>
            </div>
            <div class="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Revenue</p>
              <p class="text-xl font-bold text-slate-900 dark:text-white">{{ formatCurrency(selectedProductDetail.sellingPrice) }}</p>
            </div>
            <div
              v-if="selectedProductDetail.cost && selectedProductDetail.cost > 0"
              class="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-4"
            >
              <div class="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <p class="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Cost per Unit</p>
                <p class="text-xl font-bold text-red-600">{{ formatCurrency(selectedProductDetail.cost / selectedProductDetail.quantity) }}</p>
              </div>
              <div class="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <p class="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Total Cost</p>
                <p class="text-xl font-bold text-red-600">{{ formatCurrency(selectedProductDetail.cost) }}</p>
              </div>
              <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <p class="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Total Profit</p>
                <p class="text-2xl font-bold text-green-600">{{ formatCurrency(selectedProductDetail.profit) }}</p>
              </div>
              <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <p class="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Margin</p>
                <p class="text-2xl font-bold text-green-600">
                  {{ formatProductMargin(
                    selectedProductDetail.sellingPrice,
                    selectedProductDetail.cost,
                    selectedProductDetail.profit
                  ) }}
                </p>
              </div>
            </div>
            <div
              v-else
              class="border-t border-slate-200 dark:border-slate-700 pt-4"
            >
              <p class="text-sm text-slate-500 italic text-center">No cost data available for this product</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Reports Permission Check -->
    <div v-else-if="canViewReports || authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'" class="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50">
      <span class="material-symbols-outlined text-[64px] text-slate-300 mb-4">bar_chart</span>
      <p class="text-slate-500 font-medium">Loading reports...</p>
    </div>

    <!-- Access Denied -->
    <div v-else class="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50">
      <span class="material-symbols-outlined text-[64px] text-slate-300 mb-4">lock</span>
      <p class="text-slate-900 dark:text-white font-bold">Access Denied</p>
      <p class="text-slate-500 text-sm mt-2">You don't have permission to view reports</p>
    </div>

    <!-- Export Modal -->
    <ReportExportModal
      :show="showExportModal"
      :report-type="reportType"
      :default-period="period"
      :report-data="reportData"
      :analytics-data="analyticsData"
      @close="showExportModal = false"
      @exported="loadReport"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import { useAuthStore } from '../../stores/auth';
import TenantSelector from '../../components/TenantSelector.vue';
import StoreSelector from '../../components/StoreSelector.vue';
import ReportExportModal from '../../components/ReportExportModal.vue';
import { getPeriodLabel } from '../../utils/export';
import { useNotification } from '../../composables/useNotification';
import { usePermissions } from '../../composables/usePermissions';
import { safeMap } from '../../utils/array-helpers';

const authStore = useAuthStore();
const { showError } = useNotification();
const { canViewReports, canExportReports } = usePermissions();

const needsTenantSelection = computed(() => {
  return authStore.isSuperAdmin && !authStore.selectedTenantId;
});

const byDate = computed(() => {
  if (!reportData.value || !Array.isArray(reportData.value.byDate)) {
    return [];
  }
  return reportData.value.byDate;
});

const loading = ref(false);
const reportData = ref<any>(null);
const analyticsData = ref<any>(null);
const reportType = ref('sales');
const period = ref('monthly');
const showExportModal = ref(false);
const reportViewType = ref('full');
const showProductDetails = ref(false);
const selectedProductDetail = ref<any>(null);
const productDetails = ref<Record<number, any[]>>({});
const isLoadingReport = ref(false);

const marginDisplayFormat = ref<'percentage' | 'amount'>(
  (localStorage.getItem('marginDisplayFormat') as 'percentage' | 'amount') || 'percentage'
);

const now = new Date();
const twoWeeksBack = new Date(now);
twoWeeksBack.setDate(now.getDate() - 14);
const twoWeeksForward = new Date(now);
twoWeeksForward.setDate(now.getDate() + 14);

const dateRange = ref({
  from: twoWeeksBack.toISOString().split('T')[0],
  to: twoWeeksForward.toISOString().split('T')[0],
});

const setPeriod = (p: string) => {
  period.value = p;
  handlePeriodChange();
};

let loadReportTimeout: ReturnType<typeof setTimeout> | null = null;
let loadAnalyticsTimeout: ReturnType<typeof setTimeout> | null = null;

const handleReportTypeChange = () => {
  if (loadReportTimeout) clearTimeout(loadReportTimeout);
  loadReportTimeout = setTimeout(() => {
    loadReport();
  }, 100);
};

const handleReportViewTypeChange = () => {
  if (loadReportTimeout) clearTimeout(loadReportTimeout);
  loadReportTimeout = setTimeout(() => {
    loadReport();
  }, 100);
};

const handlePeriodChange = () => {
  if (loadReportTimeout) clearTimeout(loadReportTimeout);
  loadReportTimeout = setTimeout(() => {
    loadReport();
  }, 100);
};

const handleDateRangeChange = () => {
  if (loadReportTimeout) clearTimeout(loadReportTimeout);
  loadReportTimeout = setTimeout(() => {
    loadReport();
  }, 300);
};

const summaryStats = computed(() => {
  if (!reportData.value) return [];
  
  switch (reportType.value) {
    case 'sales':
      return [
        { label: 'Total Revenue', value: formatCurrency(reportData.value.summary?.totalRevenue || 0), icon: '💰', color: 'text-green-600' },
        { label: 'Total Orders', value: reportData.value.summary?.totalOrders || 0, icon: '📦', color: 'text-blue-600' },
        { label: 'Avg per Order', value: formatCurrency(reportData.value.summary?.averageOrderValue || 0), icon: '📊', color: 'text-purple-600' },
        { label: 'Total Items Sold', value: reportData.value.summary?.totalItems || 0, icon: '🛒', color: 'text-orange-600' },
      ];
    case 'financial':
      return [
        { label: 'Revenue', value: formatCurrency(reportData.value.revenue || 0), icon: '💵', color: 'text-green-600' },
        { label: 'Cost of Goods', value: formatCurrency(reportData.value.costOfGoods || 0), icon: '💸', color: 'text-red-600' },
        { label: 'Gross Profit', value: formatCurrency(reportData.value.grossProfit || 0), icon: '📈', color: 'text-blue-600' },
        { label: 'Profit Margin', value: `${reportData.value.profitMargin?.toFixed(2) || 0}%`, icon: '📊', color: 'text-purple-600' },
      ];
    default:
      return [];
  }
});

const reportHeaders = computed(() => {
  switch (reportType.value) {
    case 'sales':
      return ['Date', 'Total Revenue', 'Transactions', 'Avg per Transaction'];
    case 'financial':
      return ['Date', 'Revenue', 'Cost of Goods', 'Gross Profit', 'Profit Margin'];
    default:
      return [];
  }
});

const reportRows = computed(() => {
  if (!reportData.value) return [];
  
  const byDateData = Array.isArray(reportData.value?.byDate) 
    ? reportData.value.byDate 
    : [];
  
  switch (reportType.value) {
    case 'sales':
      return safeMap(byDateData, (item: any, index: number) => {
        let revenue = item?.revenue || 0;
        let costOfGoods = 0;
        
        if (item?.products && Array.isArray(item.products)) {
          costOfGoods = item.products.reduce((sum: number, p: any) => sum + (p?.cost || 0), 0);
        } else if (item?.costOfGoods) {
          costOfGoods = item.costOfGoods;
        }
        
        if (reportViewType.value === 'revenue') {
          revenue = item?.revenue || 0;
        } else if (reportViewType.value === 'profit') {
          revenue = (item?.revenue || 0) - costOfGoods;
        } else {
          revenue = item?.revenue || 0;
        }
        
        if (item?.products && Array.isArray(item.products)) {
          productDetails.value[index] = item.products;
        }
        
        return [
          formatDate(item?.date),
          formatCurrency(revenue),
          item?.count || 0,
          formatCurrency(revenue / (item?.count || 1)),
        ];
      });
    case 'financial':
      if (byDateData && byDateData.length > 0) {
        return safeMap(byDateData, (item: any) => {
          let revenue = item?.revenue || reportData.value?.revenue || 0;
          let costOfGoods = item?.costOfGoods || reportData.value?.costOfGoods || 0;
          let grossProfit = item?.grossProfit || reportData.value?.grossProfit || 0;
          
          if (reportViewType.value === 'revenue') {
            costOfGoods = 0;
            grossProfit = revenue;
          } else if (reportViewType.value === 'profit') {
            revenue = grossProfit;
            costOfGoods = 0;
          }
          
          return [
            formatDate(item?.date),
            formatCurrency(revenue),
            formatCurrency(costOfGoods),
            formatCurrency(grossProfit),
            `${(item?.profitMargin || reportData.value?.profitMargin || 0).toFixed(2)}%`,
          ];
        });
      } else {
        let revenue = reportData.value.revenue || 0;
        let costOfGoods = reportData.value.costOfGoods || 0;
        let grossProfit = reportData.value.grossProfit || 0;
        
        if (reportViewType.value === 'revenue') {
          costOfGoods = 0;
          grossProfit = revenue;
        } else if (reportViewType.value === 'profit') {
          revenue = grossProfit;
          costOfGoods = 0;
        }
        
        return [[
          'Summary',
          formatCurrency(revenue),
          formatCurrency(costOfGoods),
          formatCurrency(grossProfit),
          `${(reportData.value.profitMargin || 0).toFixed(2)}%`,
        ]];
      }
    default:
      return [];
  }
});

const formatProductMargin = (sellingPrice: number, cost: number, profit: number): string => {
  if (marginDisplayFormat.value === 'amount') {
    return formatCurrency(profit);
  } else {
    const margin = sellingPrice > 0 ? ((profit / sellingPrice) * 100).toFixed(2) : '0.00';
    return `${margin}%`;
  }
};

const saveMarginFormat = () => {
  localStorage.setItem('marginDisplayFormat', marginDisplayFormat.value);
};

const showProductDetailModal = (product: any) => {
  selectedProductDetail.value = product;
};

const loadReport = async () => {
  if (needsTenantSelection.value) return;
  
  if (!authStore.isSuperAdmin && !authStore.user?.tenantId) {
    console.error('Tenant ID not available');
    await showError('Tenant ID not available. Please log in again.');
    return;
  }
  
  loading.value = true;
  productDetails.value = {};
  try {
    const params: any = {
      reportType: reportType.value,
      period: period.value,
      includeProducts: (authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN') ? 'true' : 'false',
    };
    
    if (period.value !== 'all') {
      params.startDate = dateRange.value.from;
      params.endDate = dateRange.value.to;
    }
    
    if (authStore.isSuperAdmin && authStore.selectedTenantId) {
      params.tenantId = authStore.selectedTenantId;
    }

    const reportResponse = await api.get('/reports/tenant', { params }).catch(() => ({ data: null }));
    reportData.value = reportResponse.data;
    
    if (reportData.value?.byDate && Array.isArray(reportData.value.byDate)) {
      reportData.value.byDate.forEach((item: any, index: number) => {
        if (item.orders && Array.isArray(item.orders)) {
          const productsList: any[] = [];
          item.orders.forEach((order: any) => {
            if (order.storeShift && !item.storeShift) {
              item.storeShift = order.storeShift;
            }
            
            if (order.items && Array.isArray(order.items)) {
              order.items.forEach((orderItem: any) => {
                const productId = orderItem.productId || orderItem.product?.id;
                const productName = orderItem.product?.name || 'Unknown';
                const price = Number(orderItem.price || 0);
                const quantity = Number(orderItem.quantity || 0);
                const cost = Number(orderItem.cost || orderItem.product?.cost || 0);
                
                const sellingPrice = price * quantity;
                const totalCost = cost * quantity;
                const profit = sellingPrice - totalCost;
                const margin = sellingPrice > 0 ? ((profit / sellingPrice) * 100).toFixed(2) : '0.00';
                
                productsList.push({
                  id: `${productId}-${order.id}-${orderItem.id || Date.now()}`,
                  productId,
                  name: productName,
                  quantity,
                  sellingPrice,
                  cost: totalCost,
                  profit,
                  margin,
                  orderId: order.id,
                });
              });
            }
          });
          item.products = productsList;
        }
      });
    }
    
    if (!reportData.value?.byDate && reportData.value?.orders && Array.isArray(reportData.value.orders)) {
      const ordersByDate: Record<string, any> = {};
      reportData.value.orders.forEach((order: any) => {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        if (!ordersByDate[orderDate]) {
          ordersByDate[orderDate] = {
            date: orderDate,
            revenue: 0,
            count: 0,
            orders: [],
          };
        }
        ordersByDate[orderDate].revenue += Number(order.total || 0);
        ordersByDate[orderDate].count += 1;
        ordersByDate[orderDate].orders.push(order);
      });
      
      reportData.value.byDate = Object.values(ordersByDate).sort((a: any, b: any) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    }
  } catch (error: any) {
    console.error('Error loading report:', error);
    if (error.response?.status !== 401 && error.response?.status !== 403) {
      await showError('Failed to load report');
    }
  } finally {
    loading.value = false;
    isLoadingReport.value = false;
  }
};

const loadAnalytics = async () => {
  if (needsTenantSelection.value) return;
  
  try {
    const params: any = { limit: 10 };
    
    if (authStore.isSuperAdmin && authStore.selectedTenantId) {
      params.tenantId = authStore.selectedTenantId;
    }
    
    const [predictionsRes, topProductsRes] = await Promise.all([
      api.get('/analytics/predictions', { params: authStore.isSuperAdmin && authStore.selectedTenantId ? { tenantId: authStore.selectedTenantId } : {} }).catch(() => ({ data: null })),
      api.get('/analytics/top-products', { params }).catch(() => ({ data: [] })),
    ]);
    
    analyticsData.value = {
      predictions: predictionsRes.data,
      topProducts: topProductsRes.data || [],
    };
  } catch (error: any) {
    console.error('Error loading analytics:', error);
    analyticsData.value = null;
  }
};

const handleTenantChange = (tenantId: string | null) => {
  if (tenantId) {
    if (loadReportTimeout) clearTimeout(loadReportTimeout);
    if (loadAnalyticsTimeout) clearTimeout(loadAnalyticsTimeout);
    
    loadReportTimeout = setTimeout(() => {
      loadReport();
    }, 300);
    
    loadAnalyticsTimeout = setTimeout(() => {
      loadAnalytics();
    }, 500);
  }
};

const handleStoreChange = () => {
  if (loadReportTimeout) clearTimeout(loadReportTimeout);
  if (loadAnalyticsTimeout) clearTimeout(loadAnalyticsTimeout);
  
  loadReportTimeout = setTimeout(() => {
    loadReport();
  }, 300);
  
  loadAnalyticsTimeout = setTimeout(() => {
    loadAnalytics();
  }, 500);
};

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  if (authStore.isSuperAdmin) {
    const storedTenantId = localStorage.getItem('selectedTenantId');
    if (storedTenantId && storedTenantId !== authStore.selectedTenantId) {
      authStore.setSelectedTenant(storedTenantId);
    }
  }
  
  if (!isLoadingReport.value && !needsTenantSelection.value) {
    loadReport();
    loadAnalytics();
  }
});
</script>
