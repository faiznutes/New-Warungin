<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex flex-col">
      <h2 class="text-3xl font-bold text-[#0d141b] dark:text-white tracking-tight">Subscription Plans</h2>
      <p class="text-[#4c739a] dark:text-slate-400 mt-1">Choose the plan that fits your business needs</p>
    </div>

    <!-- Current Plan Banner -->
    <div
      v-if="currentPlan"
      class="p-5 rounded-xl border-l-4"
      :class="getPlanBannerClass(currentPlan.plan)"
    >
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 class="font-bold text-lg mb-1">Current Plan: {{ getPlanName(currentPlan.plan) }}</h3>
          <p class="text-sm" v-if="currentPlan.daysRemaining > 0">
            Valid until {{ formatDate(currentPlan.subscriptionEnd) }} 
            ({{ currentPlan.daysRemaining }} days remaining)
          </p>
          <p class="text-sm text-red-600 font-semibold" v-else>
            Plan has expired. Please renew or upgrade.
          </p>
        </div>
        <div class="text-right">
          <p class="text-2xl font-bold" :class="getPlanTextClass(currentPlan.plan)">
            {{ getPlanPrice(currentPlan.plan) }}
          </p>
          <p class="text-sm text-[#4c739a]">per month</p>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/50">
      <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-[#4c739a]">Loading plans...</p>
    </div>

    <!-- Plans Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- BASIC Plan -->
      <div
        class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border-2 p-6"
        :class="currentPlan?.plan === 'BASIC' ? 'border-primary ring-2 ring-primary/20' : 'border-slate-100 dark:border-slate-700'"
      >
        <div class="text-center mb-6">
          <h3 class="text-2xl font-bold text-[#0d141b] dark:text-white mb-2">🎟️ BASIC</h3>
          <p class="text-[#4c739a] mb-4">Small Business</p>
          <div class="mb-4">
            <span class="text-3xl font-bold text-[#0d141b] dark:text-white">Rp 149k</span>
            <span class="text-[#4c739a]">/month</span>
          </div>
        </div>
        <ul class="space-y-3 mb-6">
          <li class="flex items-start">
            <svg class="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="text-sm text-gray-700">1 store</span>
          </li>
          <li class="flex items-start">
            <svg class="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="text-sm text-gray-700">4 user (1 admin + 2 kasir + 1 kitchen)</span>
          </li>
          <li class="flex items-start">
            <svg class="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="text-sm text-gray-700">Simple POS Mode</span>
          </li>
          <li class="flex items-start">
            <svg class="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="text-sm text-gray-700">Offline-first</span>
          </li>
          <li class="flex items-start">
            <svg class="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="text-sm text-gray-700">Reminder stok habis</span>
          </li>
          <li class="flex items-start">
            <svg class="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="text-sm text-gray-700">Auto-backup email</span>
          </li>
          <li class="flex items-start">
            <svg class="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="text-sm text-gray-700">Price suggestion</span>
          </li>
          <li class="flex items-start">
            <svg class="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="text-sm text-gray-700">PWA + Auto landscape</span>
          </li>
        </ul>
        <button
          @click="handleUpgrade('BASIC')"
          :disabled="currentPlan?.plan === 'BASIC' || upgrading"
          class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition"
          :class="currentPlan?.plan === 'BASIC' 
            ? 'bg-slate-100 text-[#4c739a] cursor-not-allowed' 
            : 'bg-slate-600 text-white hover:bg-slate-700'"
        >
          <span class="material-symbols-outlined text-[20px]">check_circle</span>
          {{ currentPlan?.plan === 'BASIC' ? 'Current Plan' : 'Choose BASIC' }}
        </button>
      </div>

      <!-- PRO Plan -->
      <div
        class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border-2 p-6 relative"
        :class="currentPlan?.plan === 'PRO' ? 'border-primary ring-2 ring-primary/20' : 'border-primary/30'"
      >
        <div
          v-if="currentPlan?.plan !== 'PRO'"
          class="absolute top-0 right-0 bg-primary text-white px-3 py-1 rounded-bl-lg rounded-tr-2xl text-xs font-bold"
        >
          POPULAR
        </div>
        <div class="text-center mb-6">
          <h3 class="text-2xl font-bold text-[#0d141b] dark:text-white mb-2">⚡ PRO</h3>
          <p class="text-[#4c739a] mb-4">Medium-Large Business</p>
          <div class="mb-4">
            <span class="text-3xl font-bold text-primary">Rp 299k</span>
            <span class="text-[#4c739a]">/month</span>
          </div>
        </div>
        <ul class="space-y-3 mb-6">
          <li class="flex items-start">
            <svg class="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="text-sm text-gray-700">Maksimal 3 store</span>
          </li>
          <li class="flex items-start">
            <svg class="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="text-sm text-gray-700">10 user</span>
          </li>
          <li class="flex items-start">
            <svg class="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="text-sm text-gray-700"><strong>Semua fitur BASIC</strong></span>
          </li>
          <li class="flex items-start">
            <svg class="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="text-sm text-gray-700">Multi-store sederhana</span>
          </li>
          <li class="flex items-start">
            <svg class="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="text-sm text-gray-700">Transfer stok antar store</span>
          </li>
          <li class="flex items-start">
            <svg class="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="text-sm text-gray-700">Laporan per store + gabungan</span>
          </li>
          <li class="flex items-start">
            <svg class="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="text-sm text-gray-700">Restock suggestion otomatis</span>
          </li>
          <li class="flex items-start">
            <svg class="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="text-sm text-gray-700">Supervisor cabang role</span>
          </li>
        </ul>
        <button
          @click="handleUpgrade('PRO')"
          :disabled="currentPlan?.plan === 'PRO' || upgrading"
          class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition"
          :class="currentPlan?.plan === 'PRO' 
            ? 'bg-primary/20 text-primary cursor-not-allowed' 
            : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'"
        >
          <span class="material-symbols-outlined text-[20px]">rocket_launch</span>
          {{ currentPlan?.plan === 'PRO' ? 'Current Plan' : 'Choose PRO' }}
        </button>
      </div>

      <!-- MAX Plan -->
      <div
        class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border-2 p-6"
        :class="currentPlan?.plan === 'ENTERPRISE' ? 'border-purple-500 ring-2 ring-purple-200' : 'border-slate-100 dark:border-slate-700'"
      >
        <div class="text-center mb-6">
          <h3 class="text-2xl font-bold text-[#0d141b] dark:text-white mb-2">🔴 MAX</h3>
          <p class="text-[#4c739a] mb-4">Large Business / Semi Enterprise</p>
          <div class="mb-4">
            <span class="text-3xl font-bold text-purple-600">Custom</span>
            <span class="text-[#4c739a] block text-sm mt-1">Contact sales</span>
          </div>
        </div>
        <ul class="space-y-3 mb-6">
          <li class="flex items-start">
            <svg class="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="text-sm text-gray-700">Unlimited store</span>
          </li>
          <li class="flex items-start">
            <svg class="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="text-sm text-gray-700">Unlimited user</span>
          </li>
          <li class="flex items-start">
            <svg class="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="text-sm text-gray-700"><strong>Semua fitur PRO</strong></span>
          </li>
          <li class="flex items-start">
            <svg class="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="text-sm text-gray-700">Custom fitur</span>
          </li>
          <li class="flex items-start">
            <svg class="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="text-sm text-gray-700">Prioritas support</span>
          </li>
          <li class="flex items-start">
            <svg class="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="text-sm text-gray-700">Import massal produk & stok</span>
          </li>
          <li class="flex items-start">
            <svg class="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="text-sm text-gray-700">Custom laporan sederhana</span>
          </li>
          <li class="flex items-start">
            <svg class="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="text-sm text-gray-700">API internal terbatas</span>
          </li>
        </ul>
        <button
          @click="handleUpgrade('ENTERPRISE')"
          :disabled="currentPlan?.plan === 'ENTERPRISE' || upgrading"
          class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition"
          :class="currentPlan?.plan === 'ENTERPRISE' 
            ? 'bg-purple-100 text-purple-700 cursor-not-allowed' 
            : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-500/30'"
        >
          <span class="material-symbols-outlined text-[20px]">support_agent</span>
          {{ currentPlan?.plan === 'ENTERPRISE' ? 'Current Plan' : 'Contact Sales' }}
        </button>
      </div>
    </div>

    <!-- Limit Warning Banner -->
    <div
      v-if="limitWarning"
      class="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-5 rounded-xl"
    >
      <div class="flex items-start gap-3">
        <span class="material-symbols-outlined text-amber-600">warning</span>
        <div class="flex-1">
          <h3 class="font-bold text-amber-800 dark:text-amber-200 mb-1">Limit Almost Reached</h3>
          <p class="text-sm text-amber-700 dark:text-amber-300">{{ limitWarning }}</p>
          <button
            @click="$router.push('/app/settings/subscription')"
            class="mt-2 text-sm text-amber-800 dark:text-amber-200 underline hover:text-amber-900 dark:hover:text-amber-100 font-medium"
          >
            Upgrade now →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';
import { useRouter } from 'vue-router';

const { success: showSuccess, error: showError, confirm: showConfirm } = useNotification();
const router = useRouter();

const loading = ref(true);
const upgrading = ref(false);
const currentPlan = ref<any>(null);
const limitWarning = ref<string>('');

const getPlanName = (plan: string) => {
  const names: Record<string, string> = {
    BASIC: 'BASIC',
    PRO: 'PRO',
    ENTERPRISE: 'MAX',
  };
  return names[plan] || plan;
};

const getPlanPrice = (plan: string) => {
  const prices: Record<string, string> = {
    BASIC: 'Rp 149rb',
    PRO: 'Rp 299rb',
    ENTERPRISE: 'Rp 499rb',
  };
  return prices[plan] || '-';
};

const getPlanBannerClass = (plan: string) => {
  const classes: Record<string, string> = {
    BASIC: 'bg-gray-50 border-gray-400',
    PRO: 'bg-primary-50 border-primary-400',
    ENTERPRISE: 'bg-purple-50 border-purple-400',
  };
  return classes[plan] || 'bg-gray-50 border-gray-400';
};

const getPlanTextClass = (plan: string) => {
  const classes: Record<string, string> = {
    BASIC: 'text-gray-900',
    PRO: 'text-primary-600',
    ENTERPRISE: 'text-purple-600',
  };
  return classes[plan] || 'text-gray-900';
};

const formatDate = (date: string | Date) => {
  if (!date) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

const loadCurrentPlan = async () => {
  loading.value = true;
  try {
    const response = await api.get('/subscriptions/current');
    currentPlan.value = response.data;
    
    // Check for limit warnings
    await checkLimits();
  } catch (error: any) {
    console.error('Error loading current plan:', error);
  } finally {
    loading.value = false;
  }
};

const checkLimits = async () => {
  try {
    // Use check-limit API to get actual limits (subscription + addons)
    const [outletsLimitRes, usersLimitRes] = await Promise.all([
      api.get('/addons/check-limit/ADD_OUTLETS').catch(() => ({ data: { limit: -1, currentUsage: 0 } })),
      api.get('/addons/check-limit/ADD_USERS').catch(() => ({ data: { limit: -1, currentUsage: 0 } })),
    ]);
    
    const outletsLimit = outletsLimitRes.data;
    const usersLimit = usersLimitRes.data;
    
    // Check if any limit is approaching (>= 80%)
    if (outletsLimit.limit !== undefined && outletsLimit.limit !== -1) {
      const usagePercent = (outletsLimit.currentUsage || 0) / outletsLimit.limit;
      if (usagePercent >= 0.8) {
        limitWarning.value = `Anda telah menggunakan ${outletsLimit.currentUsage || 0}/${outletsLimit.limit} store. Pertimbangkan untuk upgrade ke paket yang lebih tinggi atau beli addon tambahan.`;
      }
    } else if (usersLimit.limit !== undefined && usersLimit.limit !== -1) {
      const usagePercent = (usersLimit.currentUsage || 0) / usersLimit.limit;
      if (usagePercent >= 0.8) {
        limitWarning.value = `Anda telah menggunakan ${usersLimit.currentUsage || 0}/${usersLimit.limit} pengguna. Pertimbangkan untuk upgrade ke paket yang lebih tinggi atau beli addon tambahan.`;
      }
    }
  } catch (error: any) {
    console.error('Error checking limits:', error);
  }
};

const handleUpgrade = async (newPlan: string) => {
  if (newPlan === 'ENTERPRISE') {
    showError('Untuk paket MAX, silakan hubungi tim sales kami');
    return;
  }

  const confirmed = await showConfirm(
    `Upgrade ke Paket ${getPlanName(newPlan)}?`,
    `Anda akan mengupgrade dari ${getPlanName(currentPlan.value?.plan || 'BASIC')} ke ${getPlanName(newPlan)}.`,
    'Upgrade',
    'Batal'
  );

  if (!confirmed) return;

  upgrading.value = true;
  try {
    await api.post('/subscriptions/upgrade', {
      newPlan,
      upgradeType: 'custom',
      customDuration: 30, // 30 days
    });
    showSuccess('Paket berhasil diupgrade!');
    await loadCurrentPlan();
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal mengupgrade paket');
  } finally {
    upgrading.value = false;
  }
};

onMounted(() => {
  loadCurrentPlan();
});
</script>
