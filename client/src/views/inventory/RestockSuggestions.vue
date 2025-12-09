<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-6 px-4 sm:px-6">
      <div>
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">Saran Restock Otomatis</h2>
        <p class="text-sm sm:text-base text-gray-600 mt-1">Rekomendasi pembelian berdasarkan pola penjualan</p>
      </div>
      <button
        @click="loadSuggestions"
        :disabled="loading"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
      >
        <span v-if="loading" class="flex items-center gap-2">
          <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Memuat...
        </span>
        <span v-else>Refresh</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="suggestions.length === 0" class="flex flex-col items-center justify-center py-16 px-4">
      <svg class="w-20 h-20 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">Tidak Ada Saran Restock</h3>
      <p class="text-gray-600 text-center max-w-md">Semua produk memiliki stok yang cukup atau belum ada data penjualan.</p>
    </div>

    <!-- Suggestions List -->
    <div v-else class="flex flex-col gap-4 px-4 sm:px-6 pb-6">
      <!-- Filter by Urgency -->
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="urgencyOption in urgencyOptions"
          :key="urgencyOption.value"
          @click="selectedUrgency = urgencyOption.value"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition',
            selectedUrgency === urgencyOption.value
              ? urgencyOption.class
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          {{ urgencyOption.label }}
        </button>
      </div>

      <!-- Suggestions Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          v-for="suggestion in filteredSuggestions"
          :key="suggestion.productId"
          class="bg-white rounded-lg shadow-lg border-2 p-6"
          :class="getUrgencyBorderClass(suggestion.urgency)"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="text-lg font-bold text-gray-900 mb-1">{{ suggestion.productName }}</h3>
              <span
                class="px-2 py-1 text-xs font-semibold rounded-full"
                :class="getUrgencyBadgeClass(suggestion.urgency)"
              >
                {{ getUrgencyLabel(suggestion.urgency) }}
              </span>
            </div>
            <button
              @click="goToProduct(suggestion.productId)"
              class="px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Lihat Produk
            </button>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Stok Saat Ini</label>
              <p class="text-lg font-bold" :class="suggestion.currentStock === 0 ? 'text-red-600' : 'text-gray-900'">
                {{ suggestion.currentStock }}
              </p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Stok Minimal</label>
              <p class="text-lg font-bold text-gray-900">{{ suggestion.minStock }}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Rata-rata Penjualan/Hari</label>
              <p class="text-lg font-bold text-gray-900">{{ suggestion.avgDailySales.toFixed(2) }}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Estimasi Habis</label>
              <p class="text-lg font-bold" :class="suggestion.daysLeft < 1 ? 'text-red-600' : 'text-yellow-600'">
                {{ formatDaysLeft(suggestion.daysLeft) }}
              </p>
            </div>
          </div>

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div>
                <label class="block text-xs font-medium text-blue-700 mb-1">Saran Pembelian</label>
                <p class="text-xl font-bold text-blue-900">{{ suggestion.suggestedQuantity }} unit</p>
                <p class="text-xs text-blue-600 mt-1">Cukup untuk ~7 hari + buffer</p>
              </div>
              <button
                @click="applySuggestion(suggestion)"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Gunakan Saran
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
import { useRouter } from 'vue-router';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';

interface RestockSuggestion {
  productId: string;
  productName: string;
  currentStock: number;
  minStock: number;
  avgDailySales: number;
  daysLeft: number;
  suggestedQuantity: number;
  urgency: 'critical' | 'warning' | 'normal';
}

const router = useRouter();
const { success: showSuccess, error: showError } = useNotification();

const suggestions = ref<RestockSuggestion[]>([]);
const loading = ref(false);
const selectedUrgency = ref<'all' | 'critical' | 'warning' | 'normal'>('all');

const urgencyOptions = [
  { value: 'all', label: 'Semua' },
  { value: 'critical', label: 'Kritis', class: 'bg-red-600 text-white' },
  { value: 'warning', label: 'Peringatan', class: 'bg-yellow-600 text-white' },
  { value: 'normal', label: 'Normal', class: 'bg-blue-600 text-white' },
];

const filteredSuggestions = computed(() => {
  if (selectedUrgency.value === 'all') {
    return suggestions.value;
  }
  return suggestions.value.filter(s => s.urgency === selectedUrgency.value);
});

const getUrgencyBadgeClass = (urgency: string) => {
  const classes: Record<string, string> = {
    critical: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    normal: 'bg-blue-100 text-blue-800',
  };
  return classes[urgency] || 'bg-gray-100 text-gray-800';
};

const getUrgencyBorderClass = (urgency: string) => {
  const classes: Record<string, string> = {
    critical: 'border-red-300',
    warning: 'border-yellow-300',
    normal: 'border-blue-300',
  };
  return classes[urgency] || 'border-gray-200';
};

const getUrgencyLabel = (urgency: string) => {
  const labels: Record<string, string> = {
    critical: 'Kritis',
    warning: 'Peringatan',
    normal: 'Normal',
  };
  return labels[urgency] || urgency;
};

const formatDaysLeft = (days: number): string => {
  if (days === Infinity || days > 365) {
    return '> 1 tahun';
  }
  if (days < 1) {
    return '< 1 hari';
  }
  if (days < 7) {
    return `${Math.ceil(days)} hari`;
  }
  if (days < 30) {
    return `${Math.ceil(days / 7)} minggu`;
  }
  return `${Math.ceil(days / 30)} bulan`;
};

const loadSuggestions = async () => {
  loading.value = true;
  try {
    const response = await api.get('/inventory/restock-suggestions');
    suggestions.value = response.data || [];
  } catch (error: any) {
    console.error('Error loading restock suggestions:', error);
    showError(error.response?.data?.message || 'Gagal memuat saran restock');
  } finally {
    loading.value = false;
  }
};

const goToProduct = (productId: string) => {
  router.push(`/app/products?highlight=${productId}`);
};

const applySuggestion = async (suggestion: RestockSuggestion) => {
  try {
    // Navigate to purchase order with pre-filled data
    router.push({
      path: '/app/inventory/purchase-orders',
      query: {
        productId: suggestion.productId,
        quantity: suggestion.suggestedQuantity.toString(),
      },
    });
    showSuccess('Arahkan ke halaman Purchase Order');
  } catch (error: any) {
    showError('Gagal menerapkan saran');
  }
};

onMounted(() => {
  loadSuggestions();
});
</script>
