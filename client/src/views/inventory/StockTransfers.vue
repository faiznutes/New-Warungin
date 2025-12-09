<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Transfer Stok Antar Store</h1>
          <p class="text-sm text-gray-600 mt-1">Kelola transfer stok antar store/cabang</p>
        </div>
        <button
          @click="showTransferModal = true"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Tambah Transfer</span>
        </button>
      </div>

      <!-- Filters -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Store Asal</label>
          <select
            v-model="filters.fromStore"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Semua Store</option>
            <option v-for="store in stores" :key="store.id" :value="store.id">
              {{ store.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Store Tujuan</label>
          <select
            v-model="filters.toStore"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Semua Store</option>
            <option v-for="store in stores" :key="store.id" :value="store.id">
              {{ store.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            v-model="filters.status"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Semua Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
          <input
            v-model="filters.date"
            type="date"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <!-- Transfers Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID Transfer
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Store Asal
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Store Tujuan
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produk
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jumlah
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="loading">
              <td colspan="8" class="px-6 py-4 text-center text-gray-500">
                Memuat data...
              </td>
            </tr>
            <tr v-else-if="transfers.length === 0">
              <td colspan="8" class="px-6 py-4 text-center text-gray-500">
                Tidak ada data transfer
              </td>
            </tr>
            <tr v-else v-for="transfer in transfers" :key="transfer.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ transfer.id.substring(0, 8) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ transfer.fromStore?.name || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ transfer.toStore?.name || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ transfer.product?.name || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ transfer.quantity }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 py-1 text-xs font-semibold rounded-full"
                  :class="{
                    'bg-yellow-100 text-yellow-800': transfer.status === 'PENDING',
                    'bg-blue-100 text-blue-800': transfer.status === 'APPROVED',
                    'bg-green-100 text-green-800': transfer.status === 'COMPLETED',
                    'bg-red-100 text-red-800': transfer.status === 'CANCELLED',
                  }"
                >
                  {{ getStatusLabel(transfer.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(transfer.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  @click="viewTransfer(transfer)"
                  class="text-primary-600 hover:text-primary-900 mr-3"
                >
                  Detail
                </button>
                <button
                  v-if="transfer.status === 'PENDING'"
                  @click="cancelTransfer(transfer.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  Batal
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="mt-6 flex items-center justify-between">
        <div class="text-sm text-gray-700">
          Menampilkan {{ (pagination.page - 1) * pagination.limit + 1 }} sampai
          {{ Math.min(pagination.page * pagination.limit, pagination.total) }} dari
          {{ pagination.total }} transfer
        </div>
        <div class="flex space-x-2">
          <button
            @click="loadTransfers(pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Sebelumnya
          </button>
          <button
            @click="loadTransfers(pagination.page + 1)"
            :disabled="pagination.page === pagination.totalPages"
            class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Selanjutnya
          </button>
        </div>
      </div>
    </div>

    <!-- Transfer Modal -->
    <div
      v-if="showTransferModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showTransferModal = false"
    >
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Tambah Transfer Stok</h2>
        <form @submit.prevent="createTransfer" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Store Asal</label>
            <select
              v-model="transferForm.fromStoreId"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Pilih Store Asal</option>
              <option v-for="store in stores" :key="store.id" :value="store.id">
                {{ store.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Store Tujuan</label>
            <select
              v-model="transferForm.toStoreId"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Pilih Store Tujuan</option>
              <option v-for="store in stores" :key="store.id" :value="store.id">
                {{ store.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Produk</label>
            <select
              v-model="transferForm.productId"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Pilih Produk</option>
              <option v-for="product in products" :key="product.id" :value="product.id">
                {{ product.name }} (Stok: {{ product.stock }})
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Jumlah</label>
            <input
              v-model.number="transferForm.quantity"
              type="number"
              min="1"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Catatan</label>
            <textarea
              v-model="transferForm.notes"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            ></textarea>
          </div>
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="showTransferModal = false"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
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
    APPROVED: 'Disetujui',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan',
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
    await error(err.response?.data?.message || 'Gagal memuat data transfer');
  } finally {
    loading.value = false;
  }
};

const createTransfer = async () => {
  try {
    await api.post('/stock-transfers', transferForm.value);
    await success('Transfer stok berhasil dibuat');
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
    await error(err.response?.data?.message || 'Gagal membuat transfer stok');
  }
};

const cancelTransfer = async (id: string) => {
  try {
    await api.put(`/stock-transfers/${id}/cancel`);
    await success('Transfer stok berhasil dibatalkan');
    await loadTransfers(pagination.value.page);
  } catch (err: any) {
    console.error('Failed to cancel transfer:', err);
    await error(err.response?.data?.message || 'Gagal membatalkan transfer stok');
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

