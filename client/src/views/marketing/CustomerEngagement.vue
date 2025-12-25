<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex flex-col">
      <h2 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Customer Engagement</h2>
      <p class="text-slate-500 dark:text-slate-400 mt-1">Analyze customer engagement levels.</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Content -->
    <div v-else class="space-y-8">
      <!-- Overall Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">High Engagement</p>
              <p class="text-3xl font-bold text-green-600">{{ overallStats.high || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-green-600">star</span>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Medium Engagement</p>
              <p class="text-3xl font-bold text-blue-600">{{ overallStats.medium || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-blue-600">trending_up</span>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Low Engagement</p>
              <p class="text-3xl font-bold text-yellow-600">{{ overallStats.low || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-yellow-600">trending_down</span>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Inactive</p>
              <p class="text-3xl font-bold text-slate-600">{{ overallStats.inactive || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-slate-600">do_not_disturb</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters & Customer List -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 overflow-hidden">
        <div class="p-6 border-b border-slate-100 dark:border-slate-700">
          <div class="flex flex-col sm:flex-row gap-4">
            <select
              v-model="selectedLevel"
              @change="loadCustomers"
              class="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">All Levels</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <div class="flex-1 relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search customers..."
                class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                @input="loadCustomers"
              />
            </div>
          </div>
        </div>

        <!-- Customers List -->
        <div v-if="customersLoading" class="text-center py-12">
          <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>

        <div v-else-if="customers.length === 0" class="text-center py-16">
          <span class="material-symbols-outlined text-[48px] text-slate-300 mb-4">groups</span>
          <p class="text-slate-500">No customers found</p>
        </div>

        <div v-else class="divide-y divide-slate-100 dark:divide-slate-700">
          <div
            v-for="customer in customers"
            :key="customer.customerId"
            class="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
          >
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span class="material-symbols-outlined text-primary">person</span>
                  </div>
                  <div>
                    <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ customer.customerName || 'Unknown' }}</h3>
                  </div>
                  <span
                    class="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full"
                    :class="getEngagementLevelClass(customer.engagementLevel)"
                  >
                    {{ customer.engagementLevel }}
                  </span>
                  <span class="text-sm text-slate-500">Score: {{ customer.engagementScore }}/100</span>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div class="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                    <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Orders</p>
                    <p class="font-bold text-slate-900 dark:text-white">{{ customer.totalOrders || 0 }}</p>
                  </div>
                  <div class="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                    <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Spent</p>
                    <p class="font-bold text-slate-900 dark:text-white">Rp {{ formatCurrency(customer.totalSpent || 0) }}</p>
                  </div>
                  <div class="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                    <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Order Frequency</p>
                    <p class="font-bold text-slate-900 dark:text-white">{{ customer.orderFrequency || 0 }}x</p>
                  </div>
                  <div class="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                    <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Engagement</p>
                    <p class="font-bold text-slate-900 dark:text-white">{{ formatPercentage(customer.emailEngagement || 0) }}%</p>
                  </div>
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
import { ref, onMounted } from 'vue';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';

const { error: showError } = useNotification();

interface CustomerEngagement {
  customerId: string;
  customerName?: string;
  engagementScore: number;
  engagementLevel: string;
  totalOrders: number;
  totalSpent: number;
  orderFrequency: number;
  emailEngagement: number;
}

const loading = ref(false);
const customersLoading = ref(false);
const overallStats = ref<any>({});
const customers = ref<CustomerEngagement[]>([]);
const selectedLevel = ref('');
const searchQuery = ref('');

const loadOverallStats = async () => {
  loading.value = true;
  try {
    const response = await api.get('/customer-engagement/stats/overall');
    overallStats.value = response.data.distribution || {};
  } catch (error: any) {
    console.error('Error loading overall stats:', error);
    await showError('Failed to load overall stats');
  } finally {
    loading.value = false;
  }
};

const loadCustomers = async () => {
  customersLoading.value = true;
  try {
    const params: any = {};
    if (selectedLevel.value) {
      params.level = selectedLevel.value;
    }
    if (searchQuery.value) {
      params.search = searchQuery.value;
    }
    const response = await api.get('/customer-engagement', { params });
    customers.value = response.data || [];
  } catch (error: any) {
    console.error('Error loading customers:', error);
    await showError('Failed to load customers');
  } finally {
    customersLoading.value = false;
  }
};

const getEngagementLevelClass = (level: string): string => {
  const classes: Record<string, string> = {
    HIGH: 'bg-green-100 text-green-700',
    MEDIUM: 'bg-blue-100 text-blue-700',
    LOW: 'bg-yellow-100 text-yellow-700',
    INACTIVE: 'bg-slate-100 text-slate-600',
  };
  return classes[level] || 'bg-slate-100 text-slate-600';
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID').format(value);
};

const formatPercentage = (value: number): string => {
  return value.toFixed(2);
};

onMounted(() => {
  loadOverallStats();
  loadCustomers();
});
</script>
