<template>
  <div class="flex flex-col h-full p-4 sm:p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Paket Langganan</h1>
      <p class="text-gray-600">Pilih paket yang sesuai dengan kebutuhan bisnis Anda</p>
    </div>

    <!-- Current Plan Banner -->
    <div
      v-if="currentPlan"
      class="mb-6 p-4 rounded-lg border-l-4"
      :class="getPlanBannerClass(currentPlan.plan)"
    >
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-bold text-lg mb-1">Paket Saat Ini: {{ getPlanName(currentPlan.plan) }}</h3>
          <p class="text-sm" v-if="currentPlan.daysRemaining > 0">
            Berlaku hingga {{ formatDate(currentPlan.subscriptionEnd) }} 
            ({{ currentPlan.daysRemaining }} hari tersisa)
          </p>
          <p class="text-sm text-red-600 font-semibold" v-else>
            Paket telah berakhir. Silakan perpanjang atau upgrade.
          </p>
        </div>
        <div class="text-right">
          <p class="text-2xl font-bold" :class="getPlanTextClass(currentPlan.plan)">
            {{ getPlanPrice(currentPlan.plan) }}
          </p>
          <p class="text-sm text-gray-600">per bulan</p>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Plans Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <!-- BASIC Plan -->
      <div
        class="bg-white rounded-lg shadow-lg border-2 p-6"
        :class="currentPlan?.plan === 'BASIC' ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200'"
      >
        <div class="text-center mb-6">
          <h3 class="text-2xl font-bold text-gray-900 mb-2">🎟️ BASIC</h3>
          <p class="text-gray-600 mb-4">UMKM Kecil</p>
          <div class="mb-4">
            <span class="text-3xl font-bold text-gray-900">Rp 200rb</span>
            <span class="text-gray-600">/bulan</span>
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
          class="w-full px-4 py-2 rounded-lg font-semibold transition"
          :class="currentPlan?.plan === 'BASIC' 
            ? 'bg-gray-200 text-gray-600 cursor-not-allowed' 
            : 'bg-gray-600 text-white hover:bg-gray-700'"
        >
          {{ currentPlan?.plan === 'BASIC' ? 'Paket Saat Ini' : 'Pilih BASIC' }}
        </button>
      </div>

      <!-- PRO Plan -->
      <div
        class="bg-white rounded-lg shadow-lg border-2 p-6 relative"
        :class="currentPlan?.plan === 'PRO' ? 'border-primary-500 ring-2 ring-primary-200' : 'border-primary-300'"
      >
        <div
          v-if="currentPlan?.plan !== 'PRO'"
          class="absolute top-0 right-0 bg-primary-600 text-white px-3 py-1 rounded-bl-lg text-xs font-bold"
        >
          POPULER
        </div>
        <div class="text-center mb-6">
          <h3 class="text-2xl font-bold text-gray-900 mb-2">⚡ PRO</h3>
          <p class="text-gray-600 mb-4">UMKM Sedang-Besar</p>
          <div class="mb-4">
            <span class="text-3xl font-bold text-primary-600">Rp 500rb</span>
            <span class="text-gray-600">/bulan</span>
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
          class="w-full px-4 py-2 rounded-lg font-semibold transition"
          :class="currentPlan?.plan === 'PRO' 
            ? 'bg-primary-200 text-primary-800 cursor-not-allowed' 
            : 'bg-primary-600 text-white hover:bg-primary-700'"
        >
          {{ currentPlan?.plan === 'PRO' ? 'Paket Saat Ini' : 'Pilih PRO' }}
        </button>
      </div>

      <!-- MAX Plan -->
      <div
        class="bg-white rounded-lg shadow-lg border-2 p-6"
        :class="currentPlan?.plan === 'ENTERPRISE' ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200'"
      >
        <div class="text-center mb-6">
          <h3 class="text-2xl font-bold text-gray-900 mb-2">🔴 MAX</h3>
          <p class="text-gray-600 mb-4">UMKM Besar / Semi Enterprise</p>
          <div class="mb-4">
            <span class="text-3xl font-bold text-purple-600">Custom</span>
            <span class="text-gray-600 block text-sm mt-1">Hubungi sales</span>
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
          class="w-full px-4 py-2 rounded-lg font-semibold transition"
          :class="currentPlan?.plan === 'ENTERPRISE' 
            ? 'bg-purple-200 text-purple-800 cursor-not-allowed' 
            : 'bg-purple-600 text-white hover:bg-purple-700'"
        >
          {{ currentPlan?.plan === 'ENTERPRISE' ? 'Paket Saat Ini' : 'Hubungi Sales' }}
        </button>
      </div>
    </div>

    <!-- Limit Warning Banner -->
    <div
      v-if="limitWarning"
      class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-6"
    >
      <div class="flex items-start">
        <svg class="w-5 h-5 text-yellow-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div class="flex-1">
          <h3 class="font-semibold text-yellow-800 mb-1">Limit Hampir Tercapai</h3>
          <p class="text-sm text-yellow-700">{{ limitWarning }}</p>
          <button
            @click="$router.push('/app/settings/subscription')"
            class="mt-2 text-sm text-yellow-800 underline hover:text-yellow-900"
          >
            Upgrade paket sekarang →
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
    BASIC: 'Rp 200rb',
    PRO: 'Rp 500rb',
    ENTERPRISE: 'Custom',
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
    // Get tenant profile to check limits
    const profileResponse = await api.get('/tenant/profile');
    const features = profileResponse.data.features || {};
    
    // Check outlet limit
    const outletsResponse = await api.get('/outlets');
    const outlets = outletsResponse.data.data || [];
    const activeOutlets = outlets.filter((o: any) => o.isActive).length;
    
    // Get plan features to check limits
    const plan = currentPlan.value?.plan || 'BASIC';
    const limits: Record<string, { outlets: number; users: number }> = {
      BASIC: { outlets: 1, users: 4 },
      PRO: { outlets: 3, users: 10 },
      ENTERPRISE: { outlets: -1, users: -1 },
    };
    
    const planLimits = limits[plan] || limits.BASIC;
    
    if (planLimits.outlets !== -1 && activeOutlets >= planLimits.outlets * 0.8) {
      limitWarning.value = `Anda telah menggunakan ${activeOutlets}/${planLimits.outlets} store. Pertimbangkan untuk upgrade ke paket yang lebih tinggi.`;
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
