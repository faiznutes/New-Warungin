<template>
  <div class="flex flex-col gap-8">
    <!-- Welcome Section -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <div class="w-16 h-16 border-4 border-[#137fec] border-t-transparent rounded-full animate-spin mb-4"></div>
      <div class="text-slate-500 font-medium">Loading data...</div>
    </div>

    <template v-else>
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 class="text-slate-900 text-3xl font-bold leading-tight tracking-tight">Welcome back, Admin 👋</h1>
          <p class="text-slate-500 mt-2">Here's what's happening with your platform today.</p>
        </div>
        <div class="flex gap-3">
          <router-link
            to="/app/reports/global"
            class="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-all shadow-sm"
          >
            <span class="material-symbols-outlined text-[18px]">download</span>
            Export Report
          </router-link>
          <router-link
            to="/app/tenants"
            class="px-4 py-2 bg-[#137fec] hover:bg-[#137fec]/90 rounded-xl text-sm font-semibold text-white shadow-lg shadow-[#137fec]/20 flex items-center gap-2 transition-all"
          >
            <span class="material-symbols-outlined text-[18px]">add</span>
            New Tenant
          </router-link>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <!-- Stat 1: Total Revenue -->
        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-card flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start">
            <div class="p-2 bg-blue-50 rounded-lg">
              <span class="material-symbols-outlined text-[#137fec]">payments</span>
            </div>
            <span class="flex items-center text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-bold">
              <span class="material-symbols-outlined text-[14px] mr-1">trending_up</span> 12%
            </span>
          </div>
          <div>
            <p class="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Revenue</p>
            <p class="text-slate-900 text-xl font-bold mt-1">
              {{ formatCurrency(globalReportData?.summary?.totalGlobalRevenue || stats?.overview?.totalRevenue || 0) }}
            </p>
          </div>
        </div>

        <!-- Stat 2: Subscriptions -->
        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-card flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start">
            <div class="p-2 bg-purple-50 rounded-lg">
              <span class="material-symbols-outlined text-purple-600">stars</span>
            </div>
            <span class="flex items-center text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-bold">+8%</span>
          </div>
          <div>
            <p class="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Subscriptions</p>
            <p class="text-slate-900 text-xl font-bold mt-1">
              {{ formatCurrency(globalReportData?.summary?.totalSubscriptionRevenue || stats?.overview?.totalSubscriptionRevenue || 0) }}
            </p>
          </div>
        </div>

        <!-- Stat 3: Addons -->
        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-card flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start">
            <div class="p-2 bg-orange-50 rounded-lg">
              <span class="material-symbols-outlined text-orange-600">extension</span>
            </div>
            <span class="flex items-center text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-bold">+4%</span>
          </div>
          <div>
            <p class="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Addons Revenue</p>
            <p class="text-slate-900 text-xl font-bold mt-1">
              {{ formatCurrency(globalReportData?.summary?.totalAddonRevenue || stats?.overview?.totalAddonRevenue || 0) }}
            </p>
          </div>
        </div>

        <!-- Stat 4: Total Tenants -->
        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-card flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start">
            <div class="p-2 bg-cyan-50 rounded-lg">
              <span class="material-symbols-outlined text-cyan-600">store</span>
            </div>
            <span class="flex items-center text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-bold">+2%</span>
          </div>
          <div>
            <p class="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Tenants</p>
            <p class="text-slate-900 text-xl font-bold mt-1">
              {{ stats?.overview?.totalTenants || superAdminStats?.totalTenants || 0 }}
            </p>
          </div>
        </div>

        <!-- Stat 5: Total Users -->
        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-card flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start">
            <div class="p-2 bg-pink-50 rounded-lg">
              <span class="material-symbols-outlined text-pink-600">group</span>
            </div>
            <span class="flex items-center text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-bold">+5%</span>
          </div>
          <div>
            <p class="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Users</p>
            <p class="text-slate-900 text-xl font-bold mt-1">
              {{ stats?.overview?.totalUsers || 0 }}
            </p>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <!-- Left Column -->
        <div class="xl:col-span-2 flex flex-col gap-8">
          <!-- Quick Actions -->
          <div class="flex flex-col gap-4">
            <h3 class="text-slate-900 text-lg font-bold">Quick Actions</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <router-link
                to="/app/tenants"
                class="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-slate-100 rounded-2xl hover:border-[#137fec]/50 shadow-sm hover:shadow-md transition-all group"
              >
                <div class="bg-blue-50 p-3 rounded-full group-hover:bg-[#137fec] group-hover:text-white transition-colors text-[#137fec]">
                  <span class="material-symbols-outlined">add_business</span>
                </div>
                <span class="text-sm font-semibold text-slate-900">Manage Tenants</span>
              </router-link>
              <router-link
                to="/app/reports/global"
                class="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-slate-100 rounded-2xl hover:border-[#137fec]/50 shadow-sm hover:shadow-md transition-all group"
              >
                <div class="bg-blue-50 p-3 rounded-full group-hover:bg-[#137fec] group-hover:text-white transition-colors text-[#137fec]">
                  <span class="material-symbols-outlined">post_add</span>
                </div>
                <span class="text-sm font-semibold text-slate-900">Global Reports</span>
              </router-link>
              <router-link
                to="/app/tenants/support"
                class="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-slate-100 rounded-2xl hover:border-[#137fec]/50 shadow-sm hover:shadow-md transition-all group"
              >
                <div class="bg-blue-50 p-3 rounded-full group-hover:bg-[#137fec] group-hover:text-white transition-colors text-[#137fec]">
                  <span class="material-symbols-outlined">support_agent</span>
                </div>
                <span class="text-sm font-semibold text-slate-900">Support Tickets</span>
              </router-link>
              <router-link
                to="/app/users"
                class="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-slate-100 rounded-2xl hover:border-[#137fec]/50 shadow-sm hover:shadow-md transition-all group"
              >
                <div class="bg-blue-50 p-3 rounded-full group-hover:bg-[#137fec] group-hover:text-white transition-colors text-[#137fec]">
                  <span class="material-symbols-outlined">settings_account_box</span>
                </div>
                <span class="text-sm font-semibold text-slate-900">Manage Users</span>
              </router-link>
            </div>
          </div>

          <!-- Addon Purchases Table -->
          <div class="bg-white rounded-2xl border border-slate-100 shadow-card flex flex-col overflow-hidden">
            <div class="p-6 border-b border-slate-50 flex justify-between items-center">
              <h3 class="text-slate-900 text-lg font-bold">Recent Addon Purchases</h3>
              <router-link to="/app/addons" class="text-sm text-[#137fec] font-bold hover:underline">View All</router-link>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead class="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                  <tr>
                    <th class="px-6 py-4">Tenant</th>
                    <th class="px-6 py-4">Addon</th>
                    <th class="px-6 py-4">Date</th>
                    <th class="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr
                    v-for="addon in stats?.recentAddons?.slice(0, 5) || []"
                    :key="addon.id"
                    class="hover:bg-slate-50 transition-colors"
                  >
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="size-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#137fec] font-bold text-xs uppercase">
                          {{ addon.tenantName?.charAt(0) }}
                        </div>
                        <div>
                          <p class="text-sm font-semibold text-slate-900">{{ addon.tenantName }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-sm font-medium text-slate-700">{{ addon.addonName }}</td>
                    <td class="px-6 py-4 text-sm text-slate-500">{{ formatDateTime(addon.subscribedAt) }}</td>
                    <td class="px-6 py-4">
                      <span
                        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-colors"
                        :class="addon.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-500'"
                      >
                        <span class="size-1.5 rounded-full" :class="addon.status === 'active' ? 'bg-green-500' : 'bg-slate-400'"></span>
                        {{ addon.status }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="!stats?.recentAddons?.length">
                    <td colspan="4" class="px-6 py-8 text-center text-slate-400 text-sm">No recent addon purchases found.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="flex flex-col gap-8">
          <!-- Popular Subscription Plans -->
          <div class="bg-white rounded-2xl border border-slate-100 shadow-card p-6 flex flex-col gap-6">
            <h3 class="text-slate-900 text-lg font-bold">Popular Plans</h3>
            <div class="flex flex-col gap-5">
              <div
                v-for="plan in stats?.subscriptionBreakdown?.sort((a: any, b: any) => b.count - a.count).slice(0, 5) || []"
                :key="plan.plan"
                class="flex flex-col gap-2"
              >
                <div class="flex justify-between items-end">
                  <span class="text-sm font-semibold text-slate-900">{{ getPlanName(plan.plan) }}</span>
                  <span class="text-[10px] font-bold text-slate-400">{{ plan.count }} Tenants</span>
                </div>
                <div class="w-full bg-slate-50 rounded-full h-2 overflow-hidden">
                  <div
                    class="bg-[#137fec] h-2 rounded-full transition-all duration-500"
                    :style="{ width: `${(plan.count / (stats?.overview?.activeSubscriptions || 1)) * 100}%` }"
                  ></div>
                </div>
              </div>
              <div v-if="!stats?.subscriptionBreakdown?.length" class="text-center py-6 text-slate-400 text-sm">
                No subscription data available.
              </div>
            </div>
          </div>

          <!-- Subscription Breakdown (Donut approximation) -->
          <div class="bg-white rounded-2xl border border-slate-100 shadow-card p-6 flex flex-col gap-6">
            <h3 class="text-slate-900 text-lg font-bold">Subscription Status</h3>
            <div class="flex items-center gap-6">
              <!-- Visual indicator -->
              <div class="relative size-24 shrink-0 rounded-full flex items-center justify-center bg-slate-50">
                <div class="absolute inset-0 rounded-full border-[6px] border-green-500 border-t-transparent border-r-transparent -rotate-45"></div>
                <div class="flex flex-col items-center">
                  <span class="text-xl font-bold text-slate-900">{{ stats?.overview?.activeSubscriptions || 0 }}</span>
                  <span class="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Active</span>
                </div>
              </div>
              <div class="flex flex-col gap-3 flex-1">
                <div
                  v-for="statusGroup in getSubscriptionStatusGroups()"
                  :key="statusGroup.status"
                  class="flex items-center justify-between"
                >
                  <div class="flex items-center gap-2">
                    <span class="size-2 rounded-full" :class="getSubscriptionStatusColor(statusGroup.status)"></span>
                    <span class="text-xs font-medium text-slate-600 truncate">{{ getSubscriptionStatusLabel(statusGroup.status) }}</span>
                  </div>
                  <span class="text-xs font-bold text-slate-900">{{ statusGroup.count }}</span>
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
