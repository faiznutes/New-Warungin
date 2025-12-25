<template>
  <div class="flex flex-col gap-8">
    <!-- Store Selector (only for Admin/Supervisor) -->
    <div v-if="authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN' || authStore.user?.role === 'SUPERVISOR'">
      <StoreSelector @store-changed="handleStoreChange" />
    </div>
    
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col">
        <h2 class="text-3xl font-bold text-[#0d141b] dark:text-white tracking-tight">Kitchen Orders</h2>
        <p class="text-[#4c739a] dark:text-[#4c739a] mt-1">Manage orders sent from the cashier.</p>
      </div>
      <div v-if="selectedOrders.length > 0" class="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-card">
        <span class="text-sm font-medium bg-[#137fec]/10 text-[#137fec] px-3 py-1.5 rounded-xl">
          {{ selectedOrders.length }} orders selected
        </span>
        <select
          v-model="bulkStatus"
          class="px-3 py-2 bg-[#f6f7f8] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] font-medium"
        >
          <option value="">Select Status</option>
          <option value="COOKING">Cooking</option>
          <option value="READY">Ready</option>
          <option value="SERVED">Served</option>
        </select>
        <button
          @click="bulkUpdateStatus"
          :disabled="!bulkStatus || bulkUpdating"
          class="px-4 py-2 bg-[#137fec] text-white rounded-xl hover:bg-[#137fec]-hover transition shadow-lg shadow-primary/30 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span v-if="!bulkUpdating" class="material-symbols-outlined text-[18px]">check</span>
          <div v-else class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          {{ bulkUpdating ? 'Processing...' : 'Update All' }}
        </button>
        <button
          @click="clearSelection"
          class="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-[#0d141b] dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <div class="w-16 h-16 border-4 border-[#137fec] border-t-transparent rounded-full animate-spin mb-4"></div>
      <div class="text-[#4c739a] font-medium">Loading orders...</div>
    </div>

    <!-- Empty State -->
    <div v-else-if="orders.length === 0" class="flex flex-col items-center justify-center py-20">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-card border border-slate-100 dark:border-slate-700/50 p-12 text-center">
        <span class="material-symbols-outlined text-[64px] text-slate-300 mb-4">receipt_long</span>
        <p class="text-lg font-medium text-[#0d141b] dark:text-white mb-2">No incoming orders</p>
        <p class="text-[#4c739a] text-sm">Orders from the cashier will appear here.</p>
      </div>
    </div>

    <!-- Orders Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="order in orders"
        :key="order.id"
        class="bg-white dark:bg-slate-800 rounded-xl shadow-card p-6 border-2 transition-all hover:shadow-lg"
        :class="[
          getStatusClass(order.kitchenStatus),
          selectedOrders.includes(order.id) ? 'ring-2 ring-[#137fec] ring-offset-2 scale-[1.02]' : ''
        ]"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-start gap-3 flex-1">
            <input
              type="checkbox"
              :checked="selectedOrders.includes(order.id)"
              @change="toggleOrderSelection(order.id)"
              class="mt-1.5 w-5 h-5 text-[#137fec] border-2 border-slate-300 rounded focus:ring-[#137fec] cursor-pointer"
            />
            <div class="flex-1">
              <h3 class="text-lg font-bold text-[#0d141b] dark:text-white mb-1">Order #{{ order.orderNumber }}</h3>
              <p class="text-xs text-[#4c739a] flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">schedule</span>
                {{ formatDateTime(order.createdAt) }}
              </p>
            </div>
          </div>
          <span
            class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-full"
            :class="getStatusBadgeClass(order.kitchenStatus)"
          >
            <span class="material-symbols-outlined text-[14px]">{{ getStatusIcon(order.kitchenStatus) }}</span>
            {{ getStatusLabel(order.kitchenStatus) }}
          </span>
        </div>

        <div class="mb-4 p-3 bg-[#f6f7f8] dark:bg-slate-900 rounded-xl">
          <p class="text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[14px]">person</span>
            Customer
          </p>
          <p class="text-sm font-medium text-[#0d141b] dark:text-white">{{ order.customerName || order.temporaryCustomerName || 'Walk-in Customer' }}</p>
        </div>

        <!-- Shift Info -->
        <div v-if="order.storeShift" class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <p class="text-xs font-bold text-blue-700 dark:text-blue-300 mb-1.5 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[14px]">schedule</span>
            Shift {{ order.storeShift.shiftType?.charAt(0).toUpperCase() + order.storeShift.shiftType?.slice(1) }}
          </p>
          <p class="text-xs text-blue-600 dark:text-blue-400">
            Opened by: {{ order.storeShift.opener?.name || 'Unknown' }}
          </p>
          <p class="text-xs text-blue-600 dark:text-blue-400">
            Time: {{ formatDateTime(order.storeShift.openedAt) }}
          </p>
        </div>

        <div class="mb-4">
          <p class="text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[14px]">receipt</span>
            Items
          </p>
          <div class="space-y-2">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="flex justify-between items-center p-2 bg-[#f6f7f8] dark:bg-slate-900 rounded-xl"
            >
              <span class="text-sm text-[#0d141b] dark:text-slate-300 font-medium">{{ item.product?.name || item.productName }} × {{ item.quantity }}</span>
              <span class="text-sm text-[#0d141b] dark:text-white font-bold">{{ formatCurrency(Number(item.price || item.subtotal) * item.quantity) }}</span>
            </div>
          </div>
        </div>

        <div class="mb-4 p-3 bg-[#137fec]/10 rounded-xl">
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium text-[#0d141b] dark:text-slate-300">Total:</span>
            <span class="text-lg font-bold text-[#137fec]">{{ formatCurrency(order.total) }}</span>
          </div>
        </div>

        <div class="flex gap-2">
          <button
            v-if="order.kitchenStatus === 'PENDING'"
            @click="updateStatus(order.id, 'COOKING')"
            class="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition shadow-lg shadow-orange-500/30 font-semibold text-sm flex items-center justify-center gap-2"
          >
            <span class="material-symbols-outlined text-[18px]">skillet</span>
            Start Cooking
          </button>
          <button
            v-if="order.kitchenStatus === 'COOKING'"
            @click="updateStatus(order.id, 'READY')"
            class="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-500/30 font-semibold text-sm flex items-center justify-center gap-2"
          >
            <span class="material-symbols-outlined text-[18px]">check</span>
            Ready
          </button>
          <button
            v-if="order.kitchenStatus === 'READY'"
            @click="updateStatus(order.id, 'SERVED')"
            class="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 font-semibold text-sm flex items-center justify-center gap-2"
          >
            <span class="material-symbols-outlined text-[18px]">local_shipping</span>
            Served
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import api from '../../api';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { useAuthStore } from '../../stores/auth';
import { useSocket } from '../../composables/useSocket';
import { useNotification } from '../../composables/useNotification';
import StoreSelector from '../../components/StoreSelector.vue';

const authStore = useAuthStore();
const { socket, connected } = useSocket();
const { success, error, confirm: confirmDialog } = useNotification();
const orders = ref<any[]>([]);
const loading = ref(false);
const selectedOrders = ref<string[]>([]);
const bulkStatus = ref<string>('');
const bulkUpdating = ref(false);

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    PENDING: 'border-red-300 dark:border-red-800',
    COOKING: 'border-orange-300 dark:border-orange-800',
    READY: 'border-green-300 dark:border-green-800',
    SERVED: 'border-blue-300 dark:border-blue-800',
  };
  return classes[status] || 'border-slate-200 dark:border-slate-700';
};

const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    PENDING: 'bg-red-100 text-red-700',
    COOKING: 'bg-orange-100 text-orange-700',
    READY: 'bg-green-100 text-green-700',
    SERVED: 'bg-blue-100 text-blue-700',
  };
  return classes[status] || 'bg-slate-100 text-[#0d141b]';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: 'Pending',
    COOKING: 'Cooking',
    READY: 'Ready',
    SERVED: 'Served',
  };
  return labels[status] || status;
};

const getStatusIcon = (status: string) => {
  const icons: Record<string, string> = {
    PENDING: 'pending',
    COOKING: 'local_fire_department',
    READY: 'check_circle',
    SERVED: 'local_shipping',
  };
  return icons[status] || 'help';
};

const handleStoreChange = () => {
  // Reload orders when store changes
  loadOrders();
};

const loadOrders = async () => {
  if (!authStore.isAuthenticated) return; // Don't load if not authenticated
  
  loading.value = true;
  try {
    const response = await api.get('/orders', {
      params: {
        sendToKitchen: true, // Only get orders sent from POS
        kitchenStatus: ['PENDING', 'COOKING', 'READY'], // Only incomplete orders
      },
    });
    orders.value = response.data.data || response.data;
    // Clear selection when orders reload
    selectedOrders.value = [];
  } catch (err: any) {
    // Suppress errors during logout (401/403)
    if (err.response?.status === 401 || err.response?.status === 403) {
      return;
    }
    console.error('Error loading orders:', err);
    if (authStore.isAuthenticated) {
      error('Failed to load orders', 'Error');
    }
  } finally {
    loading.value = false;
  }
};

const updateStatus = async (orderId: string, status: string) => {
  try {
    await api.put(`/orders/${orderId}/kitchen-status`, { status });
    await loadOrders();
    
    // Emit socket event for realtime update
    if (socket?.connected) {
      socket.emit('order:update', { orderId, status });
    }
    
    success(`Order status updated to "${getStatusLabel(status)}"`, 'Success');
  } catch (err: any) {
    console.error('Error updating status:', err);
    error(err.response?.data?.message || 'Failed to update status', 'Error');
  }
};

const toggleOrderSelection = (orderId: string) => {
  const index = selectedOrders.value.indexOf(orderId);
  if (index > -1) {
    selectedOrders.value.splice(index, 1);
  } else {
    selectedOrders.value.push(orderId);
  }
};

const clearSelection = () => {
  selectedOrders.value = [];
  bulkStatus.value = '';
};

const bulkUpdateStatus = async () => {
  if (!bulkStatus.value || selectedOrders.value.length === 0) {
    return;
  }

  const confirmed = await confirmDialog(
    `Are you sure you want to update ${selectedOrders.value.length} orders to "${getStatusLabel(bulkStatus.value)}"?`,
    'Confirm Status Update',
    'Yes, Update',
    'Cancel'
  );

  if (!confirmed) {
    return;
  }

  bulkUpdating.value = true;
  try {
    const response = await api.put('/orders/bulk-update-kitchen', {
      orderIds: selectedOrders.value,
      status: bulkStatus.value,
    });

    success(
      `Successfully updated ${response.data.updated} orders to "${getStatusLabel(bulkStatus.value)}"`,
      'Update Successful'
    );
    clearSelection();
    await loadOrders();

    // Emit socket events for realtime update
    if (socket?.connected) {
      selectedOrders.value.forEach(orderId => {
        socket.emit('order:update', { orderId, kitchenStatus: bulkStatus.value });
      });
    }
  } catch (err: any) {
    console.error('Error bulk updating status:', err);
    error(err.response?.data?.message || 'Failed to update status', 'Error');
  } finally {
    bulkUpdating.value = false;
  }
};

// Socket.IO event listeners
const setupSocketListeners = () => {
  if (!socket) return;

  socket.on('order:new', () => {
    // Reload orders when new order comes in
    loadOrders();
  });

  socket.on('order:update', (data: any) => {
    // Update specific order if it exists
    const index = orders.value.findIndex(o => o.id === data.orderId);
    if (index !== -1) {
      orders.value[index] = { ...orders.value[index], ...data };
    } else {
      // Reload all orders if order not found
      loadOrders();
    }
  });
};

// Polling fallback if socket not connected
// Disabled for Super Admin in Tenant Support to prevent auto-refresh
let pollInterval: number | null = null;

const startPolling = () => {
  if (connected.value) return; // Don't poll if socket is connected
  
  // Don't poll for Super Admin in Tenant Support mode
  const authStore = useAuthStore();
  const isSuperAdminInTenantSupport = authStore.isSuperAdmin && localStorage.getItem('selectedTenantId');
  if (isSuperAdminInTenantSupport) {
    return; // Disable polling to prevent auto-refresh
  }
  
  pollInterval = window.setInterval(() => {
    loadOrders();
  }, 30000); // Poll every 30 seconds (reduced from 5 seconds)
};

const stopPolling = () => {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
};

watch(connected, (isConnected) => {
  if (isConnected) {
    stopPolling();
    setupSocketListeners();
  } else {
    startPolling();
  }
});

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // For super admin, ensure selectedTenantId is synced with localStorage
  if (authStore.isSuperAdmin) {
    const storedTenantId = localStorage.getItem('selectedTenantId');
    if (storedTenantId && storedTenantId !== authStore.selectedTenantId) {
      authStore.setSelectedTenant(storedTenantId);
    }
  }
  
  loadOrders();
  
  if (connected.value) {
    setupSocketListeners();
  } else {
    startPolling();
  }
});

onUnmounted(() => {
  stopPolling();
});
</script>
