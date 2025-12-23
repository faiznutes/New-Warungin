<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-6">
    <!-- Header -->
    <div class="max-w-4xl mx-auto mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Pesanan Gagal Sync</h1>
          <p class="text-gray-600 mt-2">Kelola pesanan offline yang gagal sinkronisasi ke server</p>
        </div>
        <button
          @click="refreshList"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
    </div>

    <!-- Alert Boxes -->
    <div class="max-w-4xl mx-auto mb-6 space-y-3">
      <!-- No Failed Orders -->
      <div v-if="failedOrders.length === 0 && !loading" class="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
        <div class="flex items-center gap-3">
          <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 class="font-semibold text-green-800">Semua pesanan tersinkronisasi!</h3>
            <p class="text-sm text-green-700">Tidak ada pesanan yang gagal sinkronisasi.</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
        <div class="flex items-center gap-3">
          <div class="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div>
            <h3 class="font-semibold text-blue-800">Memuat data...</h3>
            <p class="text-sm text-blue-700">Mengambil daftar pesanan yang gagal sinkronisasi</p>
          </div>
        </div>
      </div>

      <!-- Error Alert -->
      <div v-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
        <div class="flex items-start gap-3">
          <svg class="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 class="font-semibold text-red-800">Terjadi kesalahan</h3>
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Failed Orders List -->
    <div class="max-w-4xl mx-auto space-y-4">
      <div
        v-for="order in failedOrders"
        :key="order.id"
        class="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-red-500 hover:shadow-lg transition"
      >
        <!-- Order Header -->
        <div class="p-4 sm:p-6 bg-gray-50 border-b border-gray-200">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Pesanan #{{ order.id.slice(0, 8) }}</h3>
              <p class="text-sm text-gray-600 mt-1">
                {{ new Date(order.timestamp).toLocaleString('id-ID') }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                {{ order.retryCount || 0 }} percobaan
              </span>
            </div>
          </div>
        </div>

        <!-- Order Details -->
        <div class="p-4 sm:p-6 space-y-4">
          <!-- Error Message -->
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 class="font-semibold text-red-900 mb-2">Alasan Gagal:</h4>
            <p class="text-red-800 text-sm">{{ order.syncError }}</p>
          </div>

          <!-- Order Items -->
          <div>
            <h4 class="font-semibold text-gray-900 mb-2">Barang:</h4>
            <div v-if="order.orderData?.items" class="space-y-2">
              <div
                v-for="(item, idx) in order.orderData.items"
                :key="idx"
                class="flex justify-between items-center text-sm bg-gray-50 p-3 rounded"
              >
                <span class="text-gray-700">{{ item.productId }} ({{ item.quantity }}x)</span>
                <span class="font-medium text-gray-900">{{ formatCurrency(item.price * item.quantity) }}</span>
              </div>
            </div>
          </div>

          <!-- Order Total -->
          <div class="border-t border-gray-200 pt-4">
            <div class="flex justify-between items-center">
              <span class="font-semibold text-gray-900">Total:</span>
              <span class="text-xl font-bold text-gray-900">
                {{ formatCurrency(order.orderData?.discount ? 
                  (calculateSubtotal(order.orderData.items) - order.orderData.discount) :
                  calculateSubtotal(order.orderData.items)) }}
              </span>
            </div>
          </div>

          <!-- Discount Info -->
          <div v-if="order.orderData?.discount && order.orderData.discount > 0" class="text-sm text-gray-600">
            Diskon: {{ formatCurrency(order.orderData.discount) }}
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 pt-4 border-t border-gray-200">
            <button
              @click="retrySync(order.id)"
              :disabled="retrying === order.id || retryOrder?.id === order.id"
              class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg v-if="retrying === order.id" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span v-if="retrying === order.id">Mencoba ulang...</span>
              <span v-else>Coba Ulang</span>
            </button>
            <button
              @click="discardOrder(order.id)"
              :disabled="discarding === order.id"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="discarding === order.id">Menghapus...</span>
              <span v-else>Buang</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Manual Sync Section -->
    <div v-if="failedOrders.length > 0" class="max-w-4xl mx-auto mt-8 pt-8 border-t border-gray-200">
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 class="font-semibold text-yellow-900 mb-2">💡 Tips Troubleshooting</h3>
        <ul class="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li>Jika error "Insufficient stock", berarti stok di server tidak cukup. Periksa stok di halaman produk.</li>
          <li>Jika error "Transaction amount mismatch", berarti ada perubahan harga. Coba ulang atau buang pesanan.</li>
          <li>Untuk network error, coba ulang setelah koneksi stabil.</li>
          <li>Jika banyak pesanan gagal, ada kemungkinan issue di server. Hubungi admin.</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { offlineStorage } from '../../utils/offline-storage';
import api from '../../api';

interface OfflineOrder {
  id: string;
  orderData: any;
  timestamp: number;
  syncFailed?: boolean;
  syncError?: string;
  retryCount?: number;
}

const failedOrders = ref<OfflineOrder[]>([]);
const loading = ref(true);
const error = ref('');
const retrying = ref('');
const discarding = ref('');
const retryOrder = ref<OfflineOrder | null>(null);

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

const calculateSubtotal = (items: any[]): number => {
  return items?.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0) || 0;
};

const loadFailedOrders = async () => {
  loading.value = true;
  error.value = '';
  try {
    failedOrders.value = await offlineStorage.getFailedSyncOrders();
  } catch (err: any) {
    error.value = `Gagal memuat pesanan yang gagal: ${err.message}`;
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const refreshList = async () => {
  await loadFailedOrders();
};

const retrySync = async (orderId: string) => {
  retrying.value = orderId;
  try {
    const order = failedOrders.value.find(o => o.id === orderId);
    if (!order) return;

    retryOrder.value = order;

    // Try to sync this specific order
    const orderResponse = await api.post('/orders', order.orderData);
    const serverOrder = orderResponse.data;

    // Create transaction if needed
    if (order.orderData.transactionData) {
      const transactionData = {
        ...order.orderData.transactionData,
        orderId: serverOrder.id,
      };
      await api.post('/transactions', transactionData);
    }

    // Mark as synced and delete from failed list
    await offlineStorage.markOrderAsSynced(orderId, serverOrder.id);
    await offlineStorage.deleteOrder(orderId);

    // Reload list
    await loadFailedOrders();
    
    // Show success message (you can add a toast notification here)
    alert(`✅ Pesanan berhasil disinkronisasi!`);
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
    alert(`❌ Gagal menyinkronisasi: ${errorMsg}`);
    error.value = errorMsg;
  } finally {
    retrying.value = '';
    retryOrder.value = null;
  }
};

const discardOrder = async (orderId: string) => {
  if (!confirm('Apakah Anda yakin ingin menghapus pesanan ini? Tindakan ini tidak dapat dibatalkan.')) {
    return;
  }

  discarding.value = orderId;
  try {
    await offlineStorage.deleteOrder(orderId);
    await loadFailedOrders();
    alert('✅ Pesanan berhasil dihapus');
  } catch (err: any) {
    alert(`❌ Gagal menghapus pesanan: ${err.message}`);
    error.value = err.message;
  } finally {
    discarding.value = '';
  }
};

onMounted(async () => {
  await loadFailedOrders();
});
</script>

<style scoped>
/* Animations */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
