<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col">
        <h2 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Stock Transfers</h2>
        <p class="text-slate-500 dark:text-slate-400 mt-1">Manage stock transfers between stores/branches.</p>
      </div>
      <button
        @click="showTransferModal = true"
        class="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg shadow-lg shadow-primary/30 transition-all active:scale-95 font-medium text-sm"
      >
        <span class="material-symbols-outlined text-[20px]">add</span>
        <span>Add Transfer</span>
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Source Store</label>
          <select
            v-model="filters.fromStore"
            class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">All Stores</option>
            <option v-for="store in stores" :key="store.id" :value="store.id">
              {{ store.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Destination Store</label>
          <select
            v-model="filters.toStore"
            class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">All Stores</option>
            <option v-for="store in stores" :key="store.id" :value="store.id">
              {{ store.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
          <select
            v-model="filters.status"
            class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
          <input
            v-model="filters.date"
            type="date"
            class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>
    </div>

    <!-- Transfers Table -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-900/50">
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Transfer ID</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Source Store</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Destination Store</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Quantity</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
            <tr v-if="loading">
              <td colspan="8" class="px-6 py-12 text-center">
                <div class="flex items-center justify-center gap-3">
                  <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span class="text-slate-500">Loading data...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="transfers.length === 0">
              <td colspan="8" class="px-6 py-16 text-center">
                <span class="material-symbols-outlined text-[48px] text-slate-300 mb-4">swap_horiz</span>
                <p class="text-slate-500">No transfer data</p>
              </td>
            </tr>
            <tr v-else v-for="transfer in transfers" :key="transfer.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-mono font-bold text-slate-900 dark:text-white">{{ transfer.id.substring(0, 8) }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-slate-900 dark:text-white">{{ transfer.fromStore?.name || 'N/A' }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-slate-900 dark:text-white">{{ transfer.toStore?.name || 'N/A' }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-slate-900 dark:text-white">{{ transfer.product?.name || 'N/A' }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-bold text-slate-900 dark:text-white">{{ transfer.quantity }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full"
                  :class="{
                    'bg-yellow-100 text-yellow-700': transfer.status === 'PENDING',
                    'bg-blue-100 text-blue-700': transfer.status === 'APPROVED',
                    'bg-green-100 text-green-700': transfer.status === 'COMPLETED',
                    'bg-red-100 text-red-700': transfer.status === 'CANCELLED',
                  }"
                >
                  {{ getStatusLabel(transfer.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-slate-500">{{ formatDate(transfer.createdAt) }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="viewTransfer(transfer)"
                    class="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition flex items-center gap-1"
                  >
                    <span class="material-symbols-outlined text-[16px]">visibility</span>
                    Details
                  </button>
                  <button
                    v-if="transfer.status === 'PENDING'"
                    @click="cancelTransfer(transfer.id)"
                    class="px-3 py-1.5 text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition flex items-center gap-1"
                  >
                    <span class="material-symbols-outlined text-[16px]">close</span>
                    Cancel
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <div class="text-sm text-slate-500">
          Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to
          {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of
          {{ pagination.total }} transfers
        </div>
        <div class="flex gap-2">
          <button
            @click="loadTransfers(pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-600 transition font-medium text-sm"
          >
            Previous
          </button>
          <button
            @click="loadTransfers(pagination.page + 1)"
            :disabled="pagination.page === pagination.totalPages"
            class="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-600 transition font-medium text-sm"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Transfer Modal -->
    <Teleport to="body">
      <div
        v-if="showTransferModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="showTransferModal = false"
      >
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-primary/10 text-primary rounded-lg">
              <span class="material-symbols-outlined">swap_horiz</span>
            </div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">Add Stock Transfer</h2>
          </div>
          <form @submit.prevent="createTransfer" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Source Store</label>
              <select
                v-model="transferForm.fromStoreId"
                required
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Select Source Store</option>
                <option v-for="store in stores" :key="store.id" :value="store.id">
                  {{ store.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Destination Store</label>
              <select
                v-model="transferForm.toStoreId"
                required
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Select Destination Store</option>
                <option v-for="store in stores" :key="store.id" :value="store.id">
                  {{ store.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Product</label>
              <select
                v-model="transferForm.productId"
                required
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Select Product</option>
                <option v-for="product in products" :key="product.id" :value="product.id">
                  {{ product.name }} (Stock: {{ product.stock }})
                </option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quantity</label>
              <input
                v-model.number="transferForm.quantity"
                type="number"
                min="1"
                required
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Notes</label>
              <textarea
                v-model="transferForm.notes"
                rows="3"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              ></textarea>
            </div>
            <div class="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                @click="showTransferModal = false"
                class="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition font-medium shadow-lg shadow-primary/30"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';
import { format } from 'date-fns';

const { success, error } = useNotification();

const loading = ref(false);
const transfers = ref<any[]>([]);
const stores = ref<any[]>([]);
const products = ref<any[]>([]);
const showTransferModal = ref(false);
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
});

const filters = ref({
  fromStore: '',
  toStore: '',
  status: '',
  date: '',
});

const transferForm = ref({
  fromOutletId: '',
  toOutletId: '',
  items: [{ productId: '', quantity: 1 }],
  notes: '',
});

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  };
  return labels[status] || status;
};

const formatDate = (date: string | Date) => {
  if (!date) return '-';
  return format(new Date(date), 'dd/MM/yyyy HH:mm');
};

const loadStores = async () => {
  try {
    const response = await api.get('/outlets');
    stores.value = Array.isArray(response.data?.data) ? response.data.data : [];
  } catch (err) {
    console.error('Failed to load stores:', err);
  }
};

const loadProducts = async () => {
  try {
    const response = await api.get('/products?limit=1000');
    products.value = Array.isArray(response.data?.data) ? response.data.data : [];
  } catch (err) {
    console.error('Failed to load products:', err);
  }
};

const loadTransfers = async (page: number = 1) => {
  loading.value = true;
  try {
    const params: any = {
      page,
      limit: pagination.value.limit,
    };
    // Note: Backend uses outletId for filtering, we can filter by from or to outlet
    if (filters.value.fromStore) params.outletId = filters.value.fromStore;
    if (filters.value.status) params.status = filters.value.status;
    if (filters.value.date) params.date = filters.value.date;

    const response = await api.get('/stock-transfers', { params });
    transfers.value = Array.isArray(response.data?.data) ? response.data.data : [];
    if (response.data?.pagination) {
      pagination.value = {
        page: response.data.pagination.page || page,
        limit: response.data.pagination.limit || 10,
        total: response.data.pagination.total || 0,
        totalPages: response.data.pagination.totalPages || 0,
      };
    }
  } catch (err: any) {
    console.error('Failed to load transfers:', err);
    await error(err.response?.data?.message || 'Failed to load transfer data');
  } finally {
    loading.value = false;
  }
};

const createTransfer = async () => {
  try {
    await api.post('/stock-transfers', transferForm.value);
    await success('Stock transfer created successfully');
    showTransferModal.value = false;
    transferForm.value = {
      fromOutletId: '',
      toOutletId: '',
      items: [{ productId: '', quantity: 1 }],
      notes: '',
    };
    await loadTransfers(pagination.value.page);
  } catch (err: any) {
    console.error('Failed to create transfer:', err);
    await error(err.response?.data?.message || 'Failed to create stock transfer');
  }
};

const cancelTransfer = async (id: string) => {
  try {
    await api.put(`/stock-transfers/${id}/cancel`);
    await success('Stock transfer cancelled successfully');
    await loadTransfers(pagination.value.page);
  } catch (err: any) {
    console.error('Failed to cancel transfer:', err);
    await error(err.response?.data?.message || 'Failed to cancel stock transfer');
  }
};

const viewTransfer = (transfer: any) => {
  // TODO: Implement view transfer detail modal
  console.log('View transfer:', transfer);
};

onMounted(async () => {
  await loadStores();
  await loadProducts();
  await loadTransfers();
});
</script>
