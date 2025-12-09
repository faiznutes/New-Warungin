<template>
  <div class="flex flex-col h-full p-4 sm:p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Laporan Cabang</h1>
      <p class="text-gray-600">Laporan penjualan dan stok per cabang</p>
    </div>

    <!-- Date Filter -->
    <div class="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
          <input
            v-model="startDate"
            type="date"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal Akhir</label>
          <input
            v-model="endDate"
            type="date"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div class="flex items-end">
          <button
            @click="loadReport"
            :disabled="loading"
            class="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
          >
            {{ loading ? 'Memuat...' : 'Tampilkan Laporan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Report Content -->
    <div v-else-if="report" class="space-y-6">
      <!-- Combined Summary -->
      <div class="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Ringkasan Gabungan Semua Cabang</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-white rounded-lg p-4 shadow-sm">
            <p class="text-sm text-gray-600 mb-1">Total Pendapatan</p>
            <p class="text-2xl font-bold text-primary-600">{{ formatCurrency(report.combined.revenue) }}</p>
          </div>
          <div class="bg-white rounded-lg p-4 shadow-sm">
            <p class="text-sm text-gray-600 mb-1">Total Pesanan</p>
            <p class="text-2xl font-bold text-gray-900">{{ report.combined.orders }}</p>
          </div>
          <div class="bg-white rounded-lg p-4 shadow-sm">
            <p class="text-sm text-gray-600 mb-1">Total Item Terjual</p>
            <p class="text-2xl font-bold text-gray-900">{{ report.combined.items }}</p>
          </div>
        </div>
      </div>

      <!-- Sales Per Store -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Penjualan Per Cabang</h2>
        <div v-if="report.salesByOutlet.length === 0" class="text-center py-8 text-gray-500">
          <p>Tidak ada data penjualan untuk periode ini</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cabang</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pendapatan</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pesanan</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Terjual</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rata-rata per Pesanan</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="store in report.salesByOutlet"
                :key="store.outlet.id"
                class="hover:bg-gray-50"
              >
                <td class="px-4 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ store.outlet.name }}</div>
                  <div v-if="store.outlet.address" class="text-xs text-gray-500">{{ store.outlet.address }}</div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm font-semibold text-primary-600">
                  {{ formatCurrency(store.revenue) }}
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ store.orders }}
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ store.items }}
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatCurrency(store.orders > 0 ? store.revenue / store.orders : 0) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Stock Per Store -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Stok Per Cabang</h2>
        <div v-if="report.stockByOutlet.length === 0" class="text-center py-8 text-gray-500">
          <p>Tidak ada data stok</p>
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="store in report.stockByOutlet"
            :key="store.outlet.id"
            class="border-2 rounded-lg p-4"
            :class="store.lowStockCount > 0 ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-white'"
          >
            <h3 class="font-bold text-gray-900 mb-3">{{ store.outlet.name }}</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Total Produk:</span>
                <span class="font-semibold text-gray-900">{{ store.totalProducts }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Total Stok:</span>
                <span class="font-semibold text-gray-900">{{ store.totalStock }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Stok Rendah:</span>
                <span
                  class="font-semibold"
                  :class="store.lowStockCount > 0 ? 'text-yellow-600' : 'text-green-600'"
                >
                  {{ store.lowStockCount }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex flex-col items-center justify-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
      <svg class="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="text-gray-600 mb-2">Belum ada laporan</p>
      <p class="text-sm text-gray-500">Pilih tanggal dan klik "Tampilkan Laporan"</p>
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
    showError('Harap pilih tanggal mulai dan tanggal akhir');
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
    showError(error.response?.data?.message || 'Gagal memuat laporan');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  // Set default dates (last 30 days)
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);

  endDate.value = end.toISOString().split('T')[0];
  startDate.value = start.toISOString().split('T')[0];

  // Auto load report
  loadReport();
});
</script>
