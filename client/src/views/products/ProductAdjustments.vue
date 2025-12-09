<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Product Adjustments</h1>
        <p class="text-gray-600">Riwayat penyesuaian stok produk</p>
      </div>
      <div class="flex gap-2">
        <button
          @click="showAdjustmentModal = true"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Penyesuaian
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-md p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Periode</label>
          <select
            v-model="dateFilter"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            @change="applyDateFilter"
          >
            <option value="">Semua</option>
            <option value="today">Hari Ini</option>
            <option value="week">Minggu Ini</option>
            <option value="month">Bulan Ini</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div v-if="dateFilter === 'custom'">
          <label class="block text-sm font-medium text-gray-700 mb-2">Dari Tanggal</label>
          <input
            v-model="filters.startDate"
            type="date"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            @change="loadAdjustments"
          />
        </div>
        <div v-if="dateFilter === 'custom'">
          <label class="block text-sm font-medium text-gray-700 mb-2">Sampai Tanggal</label>
          <input
            v-model="filters.endDate"
            type="date"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            @change="loadAdjustments"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Cari Produk</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Nama produk atau SKU"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            @input="loadAdjustments"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tipe</label>
          <select
            v-model="filters.type"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            @change="loadAdjustments"
          >
            <option value="">Semua</option>
            <option value="INCREASE">Penambahan</option>
            <option value="DECREASE">Pengurangan</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Adjustments List -->
    <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alasan</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Oleh</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="adjustment in adjustments" :key="adjustment.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDateTime(adjustment.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="flex flex-col">
                  <span class="font-medium">{{ adjustment.product?.name || 'N/A' }}</span>
                  <span v-if="adjustment.product?.sku" class="text-xs text-gray-500">{{ adjustment.product.sku }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    adjustment.type === 'INCREASE'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ adjustment.type === 'INCREASE' ? 'Penambahan' : 'Pengurangan' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium" :class="adjustment.type === 'INCREASE' ? 'text-green-600' : 'text-red-600'">
                {{ adjustment.type === 'INCREASE' ? '+' : '-' }}{{ adjustment.quantity }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="flex flex-col">
                  <span class="text-xs text-gray-500">Sebelum: {{ adjustment.stockBefore }}</span>
                  <span class="font-medium">→ Sesudah: {{ adjustment.stockAfter }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" :title="adjustment.reason">
                {{ adjustment.reason }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ adjustment.user?.name || 'N/A' }}
              </td>
            </tr>
            <tr v-if="adjustments.length === 0">
              <td colspan="7" class="px-6 py-8 text-center text-sm text-gray-500">
                Belum ada penyesuaian produk
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
        <div class="text-sm text-gray-700">
          Menampilkan {{ (pagination.page - 1) * pagination.limit + 1 }} sampai
          {{ Math.min(pagination.page * pagination.limit, pagination.total) }} dari
          {{ pagination.total }} hasil
        </div>
        <div class="flex space-x-2">
          <button
            @click="loadAdjustments(pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            @click="loadAdjustments(pagination.page + 1)"
            :disabled="pagination.page === pagination.totalPages"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Adjustment Modal -->
    <div
      v-if="showAdjustmentModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="showAdjustmentModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Tambah Penyesuaian Produk</h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="saveAdjustment" class="space-y-4">
            <!-- Alasan Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Alasan *</label>
              <select
                v-model="adjustmentForm.reasonType"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                @change="handleReasonChange"
              >
                <option value="">Pilih Alasan</option>
                <option value="STOCK_OPNAME">Stok opname / Stocktaking</option>
                <option value="RETUR_SUPPLIER">Retur ke supplier</option>
                <option value="BARANG_RUSAK">Barang rusak / Expired</option>
                <option value="PENYESUAIAN_SISTEM">Penyesuaian sistem</option>
                <option value="KOREKSI_DATA">Koreksi data</option>
                <option value="BARANG_HILANG">Barang hilang / Theft</option>
                <option value="SAMPLE_PROMOSI">Sample / Promosi</option>
                <option value="TRANSFER_STOK">Transfer stok</option>
                <option value="CUSTOM">Isi sendiri</option>
              </select>
            </div>

            <!-- Supplier Selection (for Retur Supplier) -->
            <div v-if="adjustmentForm.reasonType === 'RETUR_SUPPLIER'">
              <label class="block text-sm font-medium text-gray-700 mb-2">Supplier *</label>
              <select
                v-model="adjustmentForm.supplierId"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                @change="handleSupplierChange"
              >
                <option value="">Pilih Supplier</option>
                <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                  {{ supplier.name }}
                </option>
              </select>
            </div>

            <!-- Transfer Stok Form -->
            <div v-if="adjustmentForm.reasonType === 'TRANSFER_STOK'" class="space-y-4 border-t pt-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Dari Store *</label>
                  <select
                    v-model="transferForm.fromOutletId"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Pilih Store</option>
                    <option v-for="outlet in outlets" :key="outlet.id" :value="outlet.id">
                      {{ outlet.name }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Ke Store *</label>
                  <select
                    v-model="transferForm.toOutletId"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Pilih Store</option>
                    <option v-for="outlet in outlets" :key="outlet.id" :value="outlet.id">
                      {{ outlet.name }}
                    </option>
                  </select>
                </div>
              </div>
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="block text-sm font-medium text-gray-700">Produk & Jumlah *</label>
                  <button
                    type="button"
                    @click="addTransferItem"
                    class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                  >
                    + Tambah Produk
                  </button>
                </div>
                <div class="space-y-2">
                  <div
                    v-for="(item, index) in transferForm.items"
                    :key="index"
                    class="grid grid-cols-12 gap-2 items-end p-3 bg-gray-50 rounded"
                  >
                    <div class="col-span-8">
                      <select
                        v-model="item.productId"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                      >
                        <option value="">Pilih Produk</option>
                        <option v-for="product in products" :key="product.id" :value="product.id">
                          {{ product.name }} (Stok: {{ product.stock }})
                        </option>
                      </select>
                    </div>
                    <div class="col-span-3">
                      <input
                        v-model.number="item.quantity"
                        type="number"
                        min="1"
                        required
                        placeholder="Qty"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                      />
                    </div>
                    <div class="col-span-1 flex items-center justify-end">
                      <button
                        type="button"
                        @click="removeTransferItem(index)"
                        class="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Product Selection (for non-transfer) -->
            <div v-if="adjustmentForm.reasonType !== 'TRANSFER_STOK' && adjustmentForm.reasonType !== ''">
              <label class="block text-sm font-medium text-gray-700 mb-2">Produk *</label>
              <select
                v-model="adjustmentForm.productId"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Pilih Produk</option>
                <option v-for="product in products" :key="product.id" :value="product.id">
                  {{ product.name }} (Stok: {{ product.stock }})
                </option>
              </select>
            </div>

            <!-- Adjustment Type (only for CUSTOM reason) -->
            <div v-if="adjustmentForm.reasonType === 'CUSTOM'">
              <label class="block text-sm font-medium text-gray-700 mb-2">Tipe Penyesuaian *</label>
              <select
                v-model="adjustmentForm.type"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="INCREASE">Penambahan Stok</option>
                <option value="DECREASE">Pengurangan Stok</option>
              </select>
            </div>

            <!-- Quantity (for non-transfer) -->
            <div v-if="adjustmentForm.reasonType !== 'TRANSFER_STOK' && adjustmentForm.reasonType !== ''">
              <label class="block text-sm font-medium text-gray-700 mb-2">Jumlah *</label>
              <input
                v-model.number="adjustmentForm.quantity"
                type="number"
                required
                min="1"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <!-- Custom Reason Input (only for CUSTOM) -->
            <div v-if="adjustmentForm.reasonType === 'CUSTOM'">
              <label class="block text-sm font-medium text-gray-700 mb-2">Alasan Detail *</label>
              <textarea
                v-model="adjustmentForm.reason"
                required
                rows="3"
                placeholder="Jelaskan alasan penyesuaian stok secara detail"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              ></textarea>
            </div>

            <div class="flex space-x-3 pt-4">
              <button
                type="submit"
                :disabled="saving || !isFormValid"
                class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                {{ saving ? 'Menyimpan...' : 'Simpan' }}
              </button>
              <button
                type="button"
                @click="closeModal"
                class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api from '../../api';
import { formatDateTime } from '../../utils/formatters';
import { useNotification } from '../../composables/useNotification';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();
const { success: showSuccess, error: showError } = useNotification();

const loading = ref(false);
const saving = ref(false);
const adjustments = ref<any[]>([]);
const products = ref<any[]>([]);
const outlets = ref<any[]>([]);
const suppliers = ref<any[]>([]);
const showAdjustmentModal = ref(false);
const dateFilter = ref('');

const filters = ref({
  search: '',
  type: '',
  startDate: '',
  endDate: '',
});

const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
});

const adjustmentForm = ref({
  reasonType: '',
  productId: '',
  supplierId: '',
  type: 'DECREASE' as 'INCREASE' | 'DECREASE',
  quantity: 1,
  reason: '',
});

const transferForm = ref({
  fromOutletId: '',
  toOutletId: '',
  items: [{ productId: '', quantity: 1 }],
});

const reasonMap: Record<string, string> = {
  'STOCK_OPNAME': 'Stok opname / Stocktaking',
  'RETUR_SUPPLIER': 'Retur ke supplier',
  'BARANG_RUSAK': 'Barang rusak / Expired',
  'PENYESUAIAN_SISTEM': 'Penyesuaian sistem',
  'KOREKSI_DATA': 'Koreksi data',
  'BARANG_HILANG': 'Barang hilang / Theft',
  'SAMPLE_PROMOSI': 'Sample / Promosi',
  'TRANSFER_STOK': 'Transfer stok',
  'CUSTOM': '',
};

const isFormValid = computed(() => {
  if (!adjustmentForm.value.reasonType) return false;
  
  if (adjustmentForm.value.reasonType === 'TRANSFER_STOK') {
    return transferForm.value.fromOutletId && 
           transferForm.value.toOutletId && 
           transferForm.value.items.length > 0 &&
           transferForm.value.items.every(item => item.productId && item.quantity > 0);
  }
  
  if (adjustmentForm.value.reasonType === 'RETUR_SUPPLIER') {
    return adjustmentForm.value.supplierId && 
           adjustmentForm.value.productId && 
           adjustmentForm.value.quantity > 0;
  }
  
  if (adjustmentForm.value.reasonType === 'CUSTOM') {
    return adjustmentForm.value.productId && 
           adjustmentForm.value.quantity > 0 && 
           adjustmentForm.value.reason.trim() !== '';
  }
  
  return adjustmentForm.value.productId && adjustmentForm.value.quantity > 0;
});

const applyDateFilter = () => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  switch (dateFilter.value) {
    case 'today':
      filters.value.startDate = today.toISOString().split('T')[0];
      filters.value.endDate = today.toISOString().split('T')[0];
      break;
    case 'week':
      filters.value.startDate = startOfWeek.toISOString().split('T')[0];
      filters.value.endDate = today.toISOString().split('T')[0];
      break;
    case 'month':
      filters.value.startDate = startOfMonth.toISOString().split('T')[0];
      filters.value.endDate = today.toISOString().split('T')[0];
      break;
    case 'custom':
      // User will set dates manually
      break;
    default:
      filters.value.startDate = '';
      filters.value.endDate = '';
  }
  loadAdjustments();
};

const handleReasonChange = () => {
  // Auto-set type based on reason
  if (adjustmentForm.value.reasonType === 'BARANG_RUSAK' || 
      adjustmentForm.value.reasonType === 'BARANG_HILANG' || 
      adjustmentForm.value.reasonType === 'SAMPLE_PROMOSI') {
    adjustmentForm.value.type = 'DECREASE';
  } else if (adjustmentForm.value.reasonType === 'RETUR_SUPPLIER') {
    adjustmentForm.value.type = 'DECREASE';
  }
  
  // Reset form fields
  adjustmentForm.value.productId = '';
  adjustmentForm.value.supplierId = '';
  adjustmentForm.value.quantity = 1;
  adjustmentForm.value.reason = '';
  transferForm.value = {
    fromOutletId: '',
    toOutletId: '',
    items: [{ productId: '', quantity: 1 }],
  };
};

const handleSupplierChange = () => {
  // Load products when supplier is selected (if needed)
};

const loadAdjustments = async (page = 1) => {
  loading.value = true;
  try {
    const params: any = {
      page,
      limit: pagination.value.limit,
    };

    if (filters.value.search) params.search = filters.value.search;
    if (filters.value.type) params.type = filters.value.type;
    if (filters.value.startDate) params.startDate = filters.value.startDate;
    if (filters.value.endDate) params.endDate = filters.value.endDate;
    
    if (authStore.isSuperAdmin && authStore.selectedTenantId) {
      params.tenantId = authStore.selectedTenantId;
    }

    const response = await api.get('/products/adjustments', { params });
    
    // Handle null products (deleted products) and ensure all fields exist
    adjustments.value = (response.data.data || []).map((adj: any) => ({
      ...adj,
      product: adj.product || { 
        id: adj.productId || '', 
        name: 'Produk Dihapus', 
        sku: null 
      },
      user: adj.user || {
        id: '',
        name: 'Unknown',
        email: ''
      },
    }));
    
    pagination.value = response.data.pagination || pagination.value;
    pagination.value.page = page;
  } catch (error: any) {
    console.error('Error loading adjustments:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Gagal memuat data penyesuaian';
    
    // If it's a 404 or "Product not found" error, still show empty list instead of error
    if (error.response?.status === 404 || errorMessage.includes('Product not found')) {
      adjustments.value = [];
      pagination.value = { page: 1, limit: 20, total: 0, totalPages: 0 };
      console.warn('Product not found error, showing empty list');
    } else {
      await showError(errorMessage);
    }
  } finally {
    loading.value = false;
  }
};

const loadProducts = async () => {
  try {
    const params: any = { limit: 1000 };
    
    if (authStore.isSuperAdmin && authStore.selectedTenantId) {
      params.tenantId = authStore.selectedTenantId;
    }
    
    const response = await api.get('/products', { params });
    products.value = response.data.data || [];
  } catch (error: any) {
    console.error('Error loading products:', error);
  }
};

const loadOutlets = async () => {
  try {
    const params: any = { limit: 100 };
    
    if (authStore.isSuperAdmin && authStore.selectedTenantId) {
      params.tenantId = authStore.selectedTenantId;
    }
    
    const response = await api.get('/outlets', { params });
    outlets.value = response.data.data || response.data || [];
  } catch (error: any) {
    console.error('Error loading outlets:', error);
  }
};

const loadSuppliers = async () => {
  try {
    const params: any = { limit: 100 };
    
    if (authStore.isSuperAdmin && authStore.selectedTenantId) {
      params.tenantId = authStore.selectedTenantId;
    }
    
    const response = await api.get('/suppliers', { params });
    suppliers.value = response.data.data || [];
  } catch (error: any) {
    console.error('Error loading suppliers:', error);
  }
};

const addTransferItem = () => {
  transferForm.value.items.push({ productId: '', quantity: 1 });
};

const removeTransferItem = (index: number) => {
  transferForm.value.items.splice(index, 1);
};

const saveAdjustment = async () => {
  // Validate form before submitting
  if (!isFormValid.value) {
    await showError('Mohon lengkapi semua field yang wajib diisi');
    return;
  }
  
  // Validate product exists before submitting
  if (adjustmentForm.value.reasonType !== 'TRANSFER_STOK' && adjustmentForm.value.productId) {
    const productExists = products.value.some(p => p.id === adjustmentForm.value.productId);
    if (!productExists) {
      await showError('Produk yang dipilih tidak ditemukan. Silakan pilih produk lain.');
      return;
    }
  }
  
  // Validate transfer items
  if (adjustmentForm.value.reasonType === 'TRANSFER_STOK') {
    for (const item of transferForm.value.items) {
      const productExists = products.value.some(p => p.id === item.productId);
      if (!productExists) {
        await showError(`Produk dengan ID ${item.productId} tidak ditemukan. Silakan pilih produk lain.`);
        return;
      }
    }
  }
  
  saving.value = true;
  try {
    if (adjustmentForm.value.reasonType === 'TRANSFER_STOK') {
      // Handle stock transfer
      const data = {
        type: 'TRANSFER',
        reason: 'Transfer stok',
        fromOutletId: transferForm.value.fromOutletId,
        toOutletId: transferForm.value.toOutletId,
        transferItems: transferForm.value.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };
      await api.post('/products/adjustments', data);
      await showSuccess('Stock transfer berhasil dibuat');
    } else {
      // Handle regular adjustment
      let reason = reasonMap[adjustmentForm.value.reasonType] || adjustmentForm.value.reason;
      
      if (adjustmentForm.value.reasonType === 'RETUR_SUPPLIER') {
        const supplier = suppliers.value.find(s => s.id === adjustmentForm.value.supplierId);
        reason = `Retur ke supplier: ${supplier?.name || ''}`;
      }
      
      const data = {
        productId: adjustmentForm.value.productId,
        type: adjustmentForm.value.type,
        quantity: adjustmentForm.value.quantity,
        reason: reason,
      };
      
      await api.post('/products/adjustments', data);
      await showSuccess('Penyesuaian produk berhasil disimpan');
    }
    
    closeModal();
    await loadAdjustments(pagination.value.page);
    await loadProducts();
  } catch (error: any) {
    console.error('Error saving adjustment:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Gagal menyimpan penyesuaian';
    
    // Better error messages
    if (errorMessage.includes('Product not found') || errorMessage.includes('not found')) {
      await showError('Produk tidak ditemukan. Pastikan produk masih ada dan aktif.');
    } else if (errorMessage.includes('Insufficient stock')) {
      await showError('Stok tidak mencukupi untuk penyesuaian ini.');
    } else {
      await showError(errorMessage);
    }
  } finally {
    saving.value = false;
  }
};

const closeModal = () => {
  showAdjustmentModal.value = false;
  adjustmentForm.value = {
    reasonType: '',
    productId: '',
    supplierId: '',
    type: 'DECREASE',
    quantity: 1,
    reason: '',
  };
  transferForm.value = {
    fromOutletId: '',
    toOutletId: '',
    items: [{ productId: '', quantity: 1 }],
  };
};

onMounted(() => {
  loadAdjustments();
  loadProducts();
  loadOutlets();
  loadSuppliers();
});
</script>
