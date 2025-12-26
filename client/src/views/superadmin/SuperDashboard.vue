<template>
  <div class="flex flex-col gap-8">
    <!-- Welcome Section -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <div class="w-16 h-16 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin mb-4"></div>
      <div class="text-[#4c739a] font-medium">Loading data...</div>
    </div>

    <template v-else>
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 class="text-[#0d141b] dark:text-white text-3xl font-bold leading-tight tracking-tight">Welcome back, {{ authStore.user?.name || 'Admin' }} 👋</h1>
          <p class="text-[#4c739a] dark:text-slate-400 mt-2">Here's what's happening with your platform today.</p>
        </div>
        <div class="flex gap-3">
          <router-link
            to="/app/reports/global"
            class="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 text-[#0d141b] dark:text-white flex items-center gap-2 transition-colors"
          >
            <span class="material-symbols-outlined text-[18px]">download</span>
            Export Report
          </router-link>
          <router-link
            to="/app/tenants"
            class="px-4 py-2 bg-[#10b981] hover:bg-blue-600 rounded-xl text-sm font-medium text-white shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-colors"
          >
            <span class="material-symbols-outlined text-[18px]">add</span>
            New Tenant
          </router-link>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <!-- Stat 1 -->
        <div class="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start">
            <div class="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <span class="material-symbols-outlined text-[#10b981]">payments</span>
            </div>
            <span class="flex items-center text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded text-xs font-semibold">
              <span class="material-symbols-outlined text-[14px] mr-0.5">trending_up</span> 12%
            </span>
          </div>
          <div>
            <p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Total Revenue</p>
            <p class="text-[#0d141b] dark:text-white text-xl font-bold mt-1">
              {{ formatCurrency(globalReportData?.summary?.totalGlobalRevenue || stats?.overview?.totalRevenue || 0) }}
            </p>
          </div>
        </div>

        <!-- Stat 2 -->
        <div class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start">
            <div class="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <span class="material-symbols-outlined text-purple-600">stars</span>
            </div>
            <span class="flex items-center text-[#078838] bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded text-xs font-semibold">
              +8%
            </span>
          </div>
          <div>
            <p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Subscription</p>
            <p class="text-[#0d141b] dark:text-white text-xl font-bold mt-1">
              {{ formatCurrency(globalReportData?.summary?.totalSubscriptionRevenue || stats?.overview?.totalSubscriptionRevenue || 0) }}
            </p>
          </div>
        </div>

        <!-- Stat 3 -->
        <div class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start">
            <div class="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
              <span class="material-symbols-outlined text-orange-600">extension</span>
            </div>
            <span class="flex items-center text-[#078838] bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded text-xs font-semibold">
              +4%
            </span>
          </div>
          <div>
            <p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Addons</p>
            <p class="text-[#0d141b] dark:text-white text-xl font-bold mt-1">
              {{ formatCurrency(globalReportData?.summary?.totalAddonRevenue || stats?.overview?.totalAddonRevenue || 0) }}
            </p>
          </div>
        </div>

        <!-- Stat 4 -->
        <div class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start">
            <div class="p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl">
              <span class="material-symbols-outlined text-cyan-600">store</span>
            </div>
            <span class="flex items-center text-[#078838] bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded text-xs font-semibold">
              +2%
            </span>
          </div>
          <div>
            <p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Total Tenant</p>
            <p class="text-[#0d141b] dark:text-white text-xl font-bold mt-1">
              {{ stats?.overview?.totalTenants || superAdminStats?.totalTenants || 0 }}
            </p>
          </div>
        </div>

        <!-- Stat 5 -->
        <div class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start">
            <div class="p-2 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
              <span class="material-symbols-outlined text-pink-600">group</span>
            </div>
            <span class="flex items-center text-[#078838] bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded text-xs font-semibold">
              +5%
            </span>
          </div>
          <div>
            <p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Total Pengguna</p>
            <p class="text-[#0d141b] dark:text-white text-xl font-bold mt-1">
              {{ stats?.overview?.totalUsers || 0 }}
            </p>
          </div>
        </div>
      </div>

      <!-- Main Layout Area: 2 Columns -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <!-- Left Column (Larger) -->
        <div class="xl:col-span-2 flex flex-col gap-8">
          <!-- Quick Actions (Aksi Cepat) -->
          <div class="flex flex-col gap-4">
            <h3 class="text-[#0d141b] dark:text-white text-lg font-bold">Aksi Cepat</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <router-link to="/app/tenants" class="flex flex-col items-center justify-center gap-3 p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl hover:border-[#10b981]/50 hover:shadow-md transition-all group">
                <div class="bg-blue-50 dark:bg-slate-700 p-3 rounded-full group-hover:bg-[#10b981] group-hover:text-white transition-colors text-[#10b981]">
                  <span class="material-symbols-outlined">add_business</span>
                </div>
                <span class="text-sm font-semibold text-[#0d141b] dark:text-white">Tambah Tenant</span>
              </router-link>
              <router-link to="/app/reports/global" class="flex flex-col items-center justify-center gap-3 p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl hover:border-[#10b981]/50 hover:shadow-md transition-all group">
                <div class="bg-blue-50 dark:bg-slate-700 p-3 rounded-full group-hover:bg-[#10b981] group-hover:text-white transition-colors text-[#10b981]">
                  <span class="material-symbols-outlined">post_add</span>
                </div>
                <!-- Kept route to global reports, but label matches HTML if visually relevant, but user said not to change route functions -->
                <span class="text-sm font-semibold text-[#0d141b] dark:text-white">Global Reports</span> 
              </router-link>
              <router-link to="/app/tenants/support" class="flex flex-col items-center justify-center gap-3 p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl hover:border-[#10b981]/50 hover:shadow-md transition-all group">
                <div class="bg-blue-50 dark:bg-slate-700 p-3 rounded-full group-hover:bg-[#10b981] group-hover:text-white transition-colors text-[#10b981]">
                  <span class="material-symbols-outlined">support_agent</span>
                </div>
                <span class="text-sm font-semibold text-[#0d141b] dark:text-white">Tiket Support</span>
              </router-link>
              <router-link to="/app/users" class="flex flex-col items-center justify-center gap-3 p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl hover:border-[#10b981]/50 hover:shadow-md transition-all group">
                <div class="bg-blue-50 dark:bg-slate-700 p-3 rounded-full group-hover:bg-[#10b981] group-hover:text-white transition-colors text-[#10b981]">
                  <span class="material-symbols-outlined">settings_account_box</span>
                </div>
                <span class="text-sm font-semibold text-[#0d141b] dark:text-white">Manage User</span>
              </router-link>
            </div>
          </div>

          <!-- Latest Addon Purchases Table -->
          <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
            <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 class="text-[#0d141b] dark:text-white text-lg font-bold">Pembelian Addon Terbaru</h3>
              <router-link to="/app/addons" class="text-sm text-[#10b981] font-medium hover:underline">View All</router-link>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead class="bg-slate-50 dark:bg-slate-900/50 text-[#4c739a] dark:text-slate-400 text-xs uppercase font-semibold">
                  <tr>
                    <th class="px-6 py-4">Tenant</th>
                    <th class="px-6 py-4">Addon</th>
                    <th class="px-6 py-4">Date</th>
                    <th class="px-6 py-4">Amount</th>
                    <th class="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                  <tr v-for="addon in stats?.recentAddons?.slice(0, 5) || []" :key="addon.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="size-8 rounded bg-gray-100 dark:bg-slate-700 bg-cover bg-center flex items-center justify-center text-[#4c739a] font-bold text-xs uppercase">
                           {{ addon.tenantName?.charAt(0) }}
                        </div>
                        <div>
                          <p class="text-sm font-medium text-[#0d141b] dark:text-white">{{ addon.tenantName }}</p>
                          <p class="text-xs text-[#4c739a] dark:text-slate-500">ID: #{{ addon.id?.toString().substring(0, 6) }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-sm text-[#0d141b] dark:text-white">{{ addon.addonName }}</td>
                    <td class="px-6 py-4 text-sm text-[#4c739a] dark:text-slate-400">{{ formatDateTime(addon.subscribedAt) }}</td>
                    <td class="px-6 py-4 text-sm font-medium text-[#0d141b] dark:text-white">{{ formatCurrency(addon.price || 0) }}</td>
                    <td class="px-6 py-4">
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" 
                        :class="addon.status === 'active' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-slate-50 text-slate-500 border border-slate-100'">
                        <span class="size-1.5 rounded-full" :class="addon.status === 'active' ? 'bg-green-500' : 'bg-slate-400'"></span>
                        {{ addon.status }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="!stats?.recentAddons?.length">
                    <td colspan="5" class="px-6 py-8 text-center text-[#4c739a] text-sm">No recent addon purchases found.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right Column (Smaller) -->
        <div class="flex flex-col gap-8">
          <!-- Best Selling Packages -->
          <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 flex flex-col gap-6">
            <h3 class="text-[#0d141b] dark:text-white text-lg font-bold">Paket Subscription Terlaris</h3>
            <div class="flex flex-col gap-5">
              <div v-for="plan in stats?.subscriptionBreakdown?.sort((a: any, b: any) => b.count - a.count).slice(0, 5) || []" :key="plan.plan" class="flex flex-col gap-2">
                <div class="flex justify-between items-end">
                  <span class="text-sm font-medium text-[#0d141b] dark:text-white">{{ getPlanName(plan.plan) }}</span>
                  <span class="text-xs font-semibold text-[#4c739a] dark:text-slate-400">{{ plan.count }} Tenants</span>
                </div>
                <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                  <div class="bg-[#10b981] h-2 rounded-full" :style="{ width: `${(plan.count / (stats?.overview?.activeSubscriptions || 1)) * 100}%` }"></div>
                </div>
                <p class="text-xs text-[#4c739a]">{{ Math.round((plan.count / (stats?.overview?.activeSubscriptions || 1)) * 100) }}% of subscriptions</p>
              </div>
               <div v-if="!stats?.subscriptionBreakdown?.length" class="text-center py-6 text-[#4c739a] text-sm">
                No subscription data available.
              </div>
            </div>
          </div>

          <!-- Subscriptions by Status -->
          <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 flex flex-col gap-6">
            <h3 class="text-[#0d141b] dark:text-white text-lg font-bold">Subscription Status</h3>
            <div class="flex items-center gap-6">
              <!-- Simple CSS Donut representation using conic gradient or fall back to simple circle -->
              <div class="relative size-32 shrink-0 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                 <!-- Gradient approximation based on active count vs total -->
                 <div class="absolute inset-0 rounded-full" :style="`background: conic-gradient(#10b981 0% ${stats?.overview?.activeSubscriptions ? Math.round((stats.overview.activeSubscriptions / (stats.overview.totalTenants || 1)) * 100) : 0}%, #f59e0b ${stats?.overview?.activeSubscriptions ? Math.round((stats.overview.activeSubscriptions / (stats.overview.totalTenants || 1)) * 100) : 0}% 100%); opacity: 0.1`"></div>
                <div class="absolute inset-0 rounded-full border-[8px] border-[#10b981]" style="clip-path: circle(100%);"></div>
                
                <div class="absolute inset-4 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center flex-col z-10">
                  <span class="text-2xl font-bold text-[#0d141b] dark:text-white">{{ stats?.overview?.activeSubscriptions || 0 }}</span>
                  <span class="text-[10px] text-[#4c739a] uppercase">Active</span>
                </div>
              </div>
              <div class="flex flex-col gap-3 flex-1">
                 <div v-for="statusGroup in getSubscriptionStatusGroups()" :key="statusGroup.status" class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="size-3 rounded-full" :class="getSubscriptionStatusColor(statusGroup.status)"></span>
                    <span class="text-sm text-[#4c739a] dark:text-slate-400">{{ getSubscriptionStatusLabel(statusGroup.status) }}</span>
                  </div>
                  <span class="text-sm font-semibold text-[#0d141b] dark:text-white">{{ statusGroup.count }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
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
  return `${startDate.toLocaleDateString('en-US')} - ${endDate.toLocaleDateString('en-US')}`;
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
    BASIC: 149000, // Starter: Rp 149.000
    PRO: 299000, // Boost: Rp 299.000
    ENTERPRISE: 499000, // Pro: Rp 499.000
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
    ACTIVE: 'Active',
    EXPIRED: 'Expired',
    CANCELLED: 'Cancelled',
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
      await showError('Database connection lost. Please check your database configuration or contact the administrator.');
      stats.value = { overview: {} };
      superAdminStats.value = { totalTenants: 0, activeTenants: 0, totalRevenue: 0 };
      return;
    }
    
    console.error('Error loading super admin stats:', error);
    const errorMessage = error.response?.data?.message || 'Failed to load super admin statistics';
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
