<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col">
        <h2 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Failed Sync Orders</h2>
        <p class="text-slate-500 dark:text-slate-400 mt-1">Manage offline orders that failed to sync with server.</p>
      </div>
      <button
        @click="refreshList"
        class="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg shadow-lg shadow-primary/30 transition-all active:scale-95 font-medium text-sm"
      >
        <span class="material-symbols-outlined text-[20px]">refresh</span>
        <span>Refresh</span>
      </button>
    </div>

    <!-- Alert Boxes -->
    <div class="space-y-4">
      <!-- No Failed Orders -->
      <div v-if="failedOrders.length === 0 && !loading" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-green-600 dark:text-green-400 text-[32px]">check_circle</span>
          <div>
            <h3 class="font-bold text-green-800 dark:text-green-200">All orders synced!</h3>
            <p class="text-sm text-green-700 dark:text-green-300">No orders failed to synchronize.</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <div class="flex items-center gap-3">
          <div class="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div>
            <h3 class="font-bold text-blue-800 dark:text-blue-200">Loading data...</h3>
            <p class="text-sm text-blue-700 dark:text-blue-300">Fetching list of failed sync orders</p>
          </div>
        </div>
      </div>

      <!-- Error Alert -->
      <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <div class="flex items-start gap-3">
          <span class="material-symbols-outlined text-red-600 dark:text-red-400 text-[24px] flex-shrink-0">error</span>
          <div>
            <h3 class="font-bold text-red-800 dark:text-red-200">An error occurred</h3>
            <p class="text-sm text-red-700 dark:text-red-300">{{ error }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Failed Orders List -->
    <div class="space-y-4">
      <div
        v-for="order in failedOrders"
        :key="order.id"
        class="bg-white dark:bg-slate-800 rounded-2xl shadow-card overflow-hidden border-l-4 border-red-500 hover:shadow-lg transition"
      >
        <!-- Order Header -->
        <div class="p-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Order #{{ order.id.slice(0, 8) }}</h3>
              <p class="text-sm text-slate-500 mt-1">
                {{ new Date(order.timestamp).toLocaleString('en-US') }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-medium">
                <span class="material-symbols-outlined text-[16px]">replay</span>
                {{ order.retryCount || 0 }} attempts
              </span>
            </div>
          </div>
        </div>

        <!-- Order Details -->
        <div class="p-6 space-y-4">
          <!-- Error Message -->
          <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <h4 class="font-bold text-red-900 dark:text-red-200 mb-2 flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px]">warning</span>
              Failure Reason:
            </h4>
            <p class="text-red-800 dark:text-red-300 text-sm">{{ order.syncError }}</p>
          </div>

          <!-- Order Items -->
          <div>
            <h4 class="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px] text-slate-500">receipt</span>
              Items:
            </h4>
            <div v-if="order.orderData?.items" class="space-y-2">
              <div
                v-for="(item, idx) in order.orderData.items"
                :key="idx"
                class="flex justify-between items-center text-sm bg-slate-50 dark:bg-slate-900 p-3 rounded-lg"
              >
                <span class="text-slate-700 dark:text-slate-300">{{ item.productId }} ({{ item.quantity }}x)</span>
                <span class="font-bold text-slate-900 dark:text-white">{{ formatCurrency(item.price * item.quantity) }}</span>
              </div>
            </div>
          </div>

          <!-- Order Total -->
          <div class="border-t border-slate-100 dark:border-slate-700 pt-4">
            <div class="flex justify-between items-center">
              <span class="font-bold text-slate-900 dark:text-white">Total:</span>
              <span class="text-xl font-bold text-primary">
                {{ formatCurrency(order.orderData?.discount ? 
                  (calculateSubtotal(order.orderData.items) - order.orderData.discount) :
                  calculateSubtotal(order.orderData.items)) }}
              </span>
            </div>
          </div>

          <!-- Discount Info -->
          <div v-if="order.orderData?.discount && order.orderData.discount > 0" class="text-sm text-slate-500">
            Discount: {{ formatCurrency(order.orderData.discount) }}
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
            <button
              @click="retrySync(order.id)"
              :disabled="retrying === order.id || retryOrder?.id === order.id"
              class="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-lg shadow-green-500/30"
            >
              <span v-if="retrying === order.id" class="material-symbols-outlined animate-spin text-[20px]">refresh</span>
              <span v-else class="material-symbols-outlined text-[20px]">replay</span>
              {{ retrying === order.id ? 'Retrying...' : 'Retry' }}
            </button>
            <button
              @click="discardOrder(order.id)"
              :disabled="discarding === order.id"
              class="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-[20px]">delete</span>
              {{ discarding === order.id ? 'Deleting...' : 'Discard' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Troubleshooting Tips -->
    <div v-if="failedOrders.length > 0" class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
      <h3 class="font-bold text-yellow-900 dark:text-yellow-200 mb-3 flex items-center gap-2">
        <span class="material-symbols-outlined text-[20px]">lightbulb</span>
        Troubleshooting Tips
      </h3>
      <ul class="text-sm text-yellow-800 dark:text-yellow-300 space-y-2 list-disc list-inside">
        <li>If error "Insufficient stock", check stock levels on the products page.</li>
        <li>If error "Transaction amount mismatch", price may have changed. Retry or discard order.</li>
        <li>For network errors, retry after connection is stable.</li>
        <li>If many orders fail, there may be a server issue. Contact admin.</li>
      </ul>
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
    error.value = `Failed to load orders: ${err.message}`;
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
    
    // Show success message
    alert('✅ Order synced successfully!');
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
    alert(`❌ Sync failed: ${errorMsg}`);
    error.value = errorMsg;
  } finally {
    retrying.value = '';
    retryOrder.value = null;
  }
};

const discardOrder = async (orderId: string) => {
  if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
    return;
  }

  discarding.value = orderId;
  try {
    await offlineStorage.deleteOrder(orderId);
    await loadFailedOrders();
    alert('✅ Order deleted successfully');
  } catch (err: any) {
    alert(`❌ Failed to delete order: ${err.message}`);
    error.value = err.message;
  } finally {
    discarding.value = '';
  }
};

onMounted(async () => {
  await loadFailedOrders();
});
</script>
