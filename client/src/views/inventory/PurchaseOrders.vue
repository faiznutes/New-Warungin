<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">
          Pesanan Pembelian
        </h2>
        <p class="text-gray-600">
          Kelola pesanan pembelian untuk restok produk
        </p>
      </div>
      <button
        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-2"
        @click="showCreateModal = true"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span>Buat Pesanan Pembelian</span>
      </button>
    </div>

    <!-- Filters -->
    <div class="mb-4 flex items-center space-x-4">
      <select
        v-model="statusFilter"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        @change="loadPurchaseOrders"
      >
        <option value="">
          Semua Status
        </option>
        <option value="PENDING">
          Menunggu
        </option>
        <option value="APPROVED">
          Disetujui
        </option>
        <option value="ORDERED">
          Dipesan
        </option>
        <option value="RECEIVED">
          Diterima
        </option>
        <option value="CANCELLED">
          Dibatalkan
        </option>
      </select>
      <select
        v-model="supplierFilter"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        @change="loadPurchaseOrders"
      >
        <option value="">
          Semua Pemasok
        </option>
        <option
          v-for="supplier in suppliers"
          :key="supplier.id"
          :value="supplier.id"
        >
          {{ supplier.name }}
        </option>
      </select>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="flex items-center justify-center py-12"
    >
      <div class="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Purchase Orders List -->
    <div
      v-else
      class="space-y-4"
    >
      <div
        v-for="po in purchaseOrders"
        :key="po.id"
        class="bg-white rounded-lg shadow-lg p-6 border-l-4"
        :class="getStatusBorderClass(po.status)"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <h3 class="text-lg font-semibold text-gray-900">
                {{ po.orderNumber }}
              </h3>
              <span
                class="px-2 py-1 text-xs font-semibold rounded-full"
                :class="getStatusClass(po.status)"
              >
                {{ po.status }}
              </span>
            </div>
            <p class="text-sm text-gray-600 mb-4">
              Supplier: <span class="font-semibold">{{ po.supplier.name }}</span>
            </p>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
              <div>
                <p class="text-gray-500">
                  Tanggal Pesanan
                </p>
                <p class="font-semibold text-gray-900">
                  {{ formatDate(po.orderDate) }}
                </p>
              </div>
              <div>
                <p class="text-gray-500">
                  Tanggal Diharapkan
                </p>
                <p class="font-semibold text-gray-900">
                  {{ po.expectedDate ? formatDate(po.expectedDate) : '-' }}
                </p>
              </div>
              <div>
                <p class="text-gray-500">
                  Total Jumlah
                </p>
                <p class="font-semibold text-gray-900">
                  Rp {{ formatCurrency(po.totalAmount) }}
                </p>
              </div>
              <div>
                <p class="text-gray-500">
                  Item
                </p>
                <p class="font-semibold text-gray-900">
                  {{ po.items.length }} item
                </p>
              </div>
            </div>
            <div class="border-t pt-4">
              <p class="text-sm font-semibold text-gray-700 mb-2">
                Item:
              </p>
              <div class="space-y-2">
                <div
                  v-for="item in po.items"
                  :key="item.id"
                  class="flex items-center justify-between text-sm bg-gray-50 p-2 rounded"
                >
                  <div>
                    <span class="font-medium">{{ item.product.name }}</span>
                    <span class="text-gray-500 ml-2">({{ item.quantity }}x @ Rp {{ formatCurrency(item.unitPrice) }})</span>
                  </div>
                  <span class="font-semibold">Rp {{ formatCurrency(item.totalPrice) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="flex flex-col items-end space-y-2 ml-4">
            <button
              v-if="po.status === 'PENDING'"
              class="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded transition"
              @click="approvePurchaseOrder(po)"
            >
              Approve
            </button>
            <button
              v-if="po.status === 'ORDERED' || po.status === 'APPROVED'"
              class="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition"
              @click="receivePurchaseOrder(po)"
            >
              Receive
            </button>
            <button
              v-if="po.status !== 'RECEIVED' && po.status !== 'CANCELLED'"
              class="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition"
              @click="cancelPurchaseOrder(po)"
            >
              Cancel
            </button>
            <button
              class="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded transition"
              @click="viewPurchaseOrder(po)"
            >
              View
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-gray-900">
              Buat Purchase Order
            </h3>
            <button
              class="text-gray-400 hover:text-gray-600 transition"
              @click="closeModal"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form
            class="space-y-4"
            @submit.prevent="savePurchaseOrder"
          >
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
                <select
                  v-model="poForm.supplierId"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">
                    Pilih Supplier
                  </option>
                  <option
                    v-for="supplier in suppliers"
                    :key="supplier.id"
                    :value="supplier.id"
                  >
                    {{ supplier.name }}
                  </option>
                </select>
                <p class="text-xs text-gray-500 mt-1">
                  Pilih supplier yang akan mengirim produk
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Diharapkan (Opsional)</label>
                <input
                  v-model="poForm.expectedDate"
                  type="date"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <p class="text-xs text-gray-500 mt-1">
                  Tanggal kapan produk diharapkan tiba (opsional)
                </p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
              <textarea
                v-model="poForm.notes"
                rows="3"
                placeholder="Contoh: Mohon kirim sebelum tanggal yang ditentukan, atau catatan khusus lainnya"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              ></textarea>
              <p class="text-xs text-gray-500 mt-1">
                Tambahkan catatan atau instruksi khusus untuk supplier (opsional)
              </p>
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Item Produk *</label>
                  <p class="text-xs text-gray-500">
                    Tambahkan produk yang akan dibeli dari supplier
                  </p>
                </div>
                <button
                  type="button"
                  class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                  @click="addItem"
                >
                  + Tambah Item
                </button>
              </div>
              <div class="space-y-2">
                <div
                  v-for="(item, index) in poForm.items"
                  :key="index"
                  class="grid grid-cols-12 gap-2 items-end p-3 bg-gray-50 rounded"
                >
                  <div class="col-span-5">
                    <label class="block text-xs font-medium text-gray-600 mb-1">Produk *</label>
                    <select
                      v-model="item.productId"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    >
                      <option value="">
                        Pilih Produk
                      </option>
                      <option
                        v-for="product in products"
                        :key="product.id"
                        :value="product.id"
                      >
                        {{ product.name }} (Stok: {{ product.stock }})
                      </option>
                    </select>
                    <p class="text-xs text-gray-500 mt-1">
                      Pilih produk yang akan dibeli
                    </p>
                  </div>
                  <div class="col-span-2">
                    <label class="block text-xs font-medium text-gray-600 mb-1">Jumlah *</label>
                    <input
                      v-model.number="item.quantity"
                      type="number"
                      min="1"
                      step="1"
                      required
                      placeholder="Contoh: 10"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    />
                    <p class="text-xs text-gray-500 mt-1">
                      Jumlah unit produk
                    </p>
                  </div>
                  <div class="col-span-3">
                    <label class="block text-xs font-medium text-gray-600 mb-1">Harga per Produk *</label>
                    <input
                      v-model.number="item.unitPrice"
                      type="number"
                      min="0.01"
                      step="0.01"
                      required
                      placeholder="Contoh: 50000"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    />
                    <p class="text-xs text-gray-500 mt-1">
                      Harga satuan produk (Rp)
                    </p>
                  </div>
                  <div class="col-span-2 flex items-center justify-end">
                    <button
                      type="button"
                      class="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                      @click="removeItem(index)"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between pt-4 border-t">
              <span class="text-lg font-semibold text-gray-900">Total: Rp {{ formatCurrency(calculateTotal) }}</span>
              <div class="flex space-x-3">
                <button
                  type="button"
                  class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  @click="closeModal"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  :disabled="saving || poForm.items.length === 0"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {{ saving ? 'Menyimpan...' : 'Buat PO' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div
      v-if="showDetailModal && viewingPO"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      @click.self="showDetailModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-gray-900">
              Detail Purchase Order
            </h3>
            <button
              class="text-gray-400 hover:text-gray-600 transition"
              @click="showDetailModal = false"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500">
                  Order Number
                </p>
                <p class="font-semibold text-gray-900">
                  {{ viewingPO.orderNumber }}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500">
                  Status
                </p>
                <span
                  class="px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getStatusClass(viewingPO.status)"
                >
                  {{ viewingPO.status }}
                </span>
              </div>
              <div>
                <p class="text-sm text-gray-500">
                  Supplier
                </p>
                <p class="font-semibold text-gray-900">
                  {{ viewingPO.supplier.name }}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500">
                  Order Date
                </p>
                <p class="font-semibold text-gray-900">
                  {{ formatDate(viewingPO.orderDate) }}
                </p>
              </div>
              <div v-if="viewingPO.expectedDate">
                <p class="text-sm text-gray-500">
                  Expected Date
                </p>
                <p class="font-semibold text-gray-900">
                  {{ formatDate(viewingPO.expectedDate) }}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500">
                  Total Amount
                </p>
                <p class="font-semibold text-gray-900">
                  Rp {{ formatCurrency(viewingPO.totalAmount) }}
                </p>
              </div>
            </div>

            <div class="border-t pt-4">
              <p class="text-sm font-semibold text-gray-700 mb-2">
                Items:
              </p>
              <div class="space-y-2">
                <div
                  v-for="item in viewingPO.items"
                  :key="item.id"
                  class="flex items-center justify-between text-sm bg-gray-50 p-3 rounded"
                >
                  <div>
                    <span class="font-medium">{{ item.product.name }}</span>
                    <span class="text-gray-500 ml-2">({{ item.quantity }}x @ Rp {{ formatCurrency(item.unitPrice) }})</span>
                  </div>
                  <span class="font-semibold">Rp {{ formatCurrency(item.totalPrice) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';
import { formatDate, formatCurrency } from '../../utils/formatters';

const { success: showSuccess, error: showError, confirm: showConfirm } = useNotification();

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: { id: string; name: string };
  status: string;
  orderDate: string;
  expectedDate?: string;
  totalAmount: number;
  items: Array<{
    id: string;
    product: { id: string; name: string };
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

const purchaseOrders = ref<PurchaseOrder[]>([]);
const suppliers = ref<any[]>([]);
const products = ref<any[]>([]);
const loading = ref(false);
const statusFilter = ref('');
const supplierFilter = ref('');
const showCreateModal = ref(false);
const saving = ref(false);

const poForm = ref({
  supplierId: '',
  expectedDate: '',
  notes: '',
  items: [{ productId: '', quantity: 1, unitPrice: 0 }],
});

const calculateTotal = computed(() => {
  return poForm.value.items.reduce((sum, item) => {
    return sum + (item.quantity * item.unitPrice);
  }, 0);
});

const loadPurchaseOrders = async () => {
  loading.value = true;
  try {
    const params: any = {};
    if (statusFilter.value) params.status = statusFilter.value;
    if (supplierFilter.value) params.supplierId = supplierFilter.value;
    const response = await api.get('/purchase-orders', { params });
    purchaseOrders.value = response.data.data;
  } catch (error: any) {
    await showError(error.response?.data?.message || 'Gagal memuat purchase orders');
  } finally {
    loading.value = false;
  }
};

const loadSuppliers = async () => {
  try {
    const response = await api.get('/suppliers', { params: { limit: 100 } });
    suppliers.value = response.data.data;
  } catch (error: any) {
    // Silently fail - suppliers will be empty
  }
};

const loadProducts = async () => {
  try {
    const response = await api.get('/products', { params: { limit: 100, isActive: true } });
    products.value = response.data.data;
  } catch (error: any) {
    // Silently fail - products are optional
  }
};

const addItem = () => {
  poForm.value.items.push({ productId: '', quantity: 1, unitPrice: 0 });
};

const removeItem = (index: number) => {
  poForm.value.items.splice(index, 1);
};

const savePurchaseOrder = async () => {
  // Client-side validation
  if (!poForm.value.supplierId || poForm.value.supplierId === '') {
    await showError('Supplier wajib dipilih');
    return;
  }
  
  if (!poForm.value.items || poForm.value.items.length === 0) {
    await showError('Minimal harus ada 1 item produk');
    return;
  }
  
  // Validate each item
  for (let i = 0; i < poForm.value.items.length; i++) {
    const item = poForm.value.items[i];
    if (!item.productId || item.productId === '') {
      await showError(`Item ke-${i + 1}: Produk wajib dipilih`);
      return;
    }
    if (!item.quantity || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
      await showError(`Item ke-${i + 1}: Jumlah harus bilangan bulat lebih dari 0`);
      return;
    }
    if (!item.unitPrice || item.unitPrice <= 0 || isNaN(item.unitPrice)) {
      await showError(`Item ke-${i + 1}: Harga per produk harus lebih dari 0`);
      return;
    }
  }
  
  saving.value = true;
  try {
    // Format expectedDate to ISO datetime string if provided
    let expectedDate: string | undefined = undefined;
    if (poForm.value.expectedDate) {
      const date = new Date(poForm.value.expectedDate);
      if (isNaN(date.getTime())) {
        await showError('Format tanggal tidak valid');
        saving.value = false;
        return;
      }
      expectedDate = date.toISOString();
    }
    
    const data = {
      supplierId: poForm.value.supplierId,
      expectedDate: expectedDate,
      notes: poForm.value.notes?.trim() || undefined,
      items: poForm.value.items.map(item => ({
        productId: item.productId,
        quantity: Math.floor(Number(item.quantity)), // Ensure integer
        unitPrice: Number(item.unitPrice), // Ensure number
      })),
    };
    
    await api.post('/purchase-orders', data);
    await showSuccess('Purchase order berhasil dibuat');
    closeModal();
    await loadPurchaseOrders();
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Gagal menyimpan purchase order';
    await showError(errorMessage);
  } finally {
    saving.value = false;
  }
};

const approvePurchaseOrder = async (po: PurchaseOrder) => {
  try {
    await api.put(`/purchase-orders/${po.id}`, { status: 'APPROVED' });
    await showSuccess('Purchase order berhasil diapprove');
    await loadPurchaseOrders();
  } catch (error: any) {
    await showError(error.response?.data?.message || 'Gagal approve purchase order');
  }
};

const receivePurchaseOrder = async (po: PurchaseOrder) => {
  const confirmed = await showConfirm(
    'Receive Purchase Order',
    'Apakah Anda yakin ingin receive purchase order ini? Stock akan diupdate.'
  );
  if (!confirmed) return;

  try {
    await api.post(`/purchase-orders/${po.id}/receive`);
    await showSuccess('Purchase order berhasil di-receive, stock telah diupdate');
    await loadPurchaseOrders();
  } catch (error: any) {
    await showError(error.response?.data?.message || 'Gagal receive purchase order');
  }
};

const cancelPurchaseOrder = async (po: PurchaseOrder) => {
  const confirmed = await showConfirm(
    'Cancel Purchase Order',
    'Apakah Anda yakin ingin membatalkan purchase order ini?'
  );
  if (!confirmed) return;

  try {
    await api.post(`/purchase-orders/${po.id}/cancel`);
    await showSuccess('Purchase order berhasil dibatalkan');
    await loadPurchaseOrders();
  } catch (error: any) {
    await showError(error.response?.data?.message || 'Gagal membatalkan purchase order');
  }
};

const viewingPO = ref<PurchaseOrder | null>(null);
const showDetailModal = ref(false);

const viewPurchaseOrder = (po: PurchaseOrder) => {
  viewingPO.value = po;
  showDetailModal.value = true;
};

const getStatusClass = (status: string): string => {
  const classes: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-blue-100 text-blue-800',
    ORDERED: 'bg-purple-100 text-purple-800',
    RECEIVED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getStatusBorderClass = (status: string): string => {
  const classes: Record<string, string> = {
    PENDING: 'border-yellow-500',
    APPROVED: 'border-blue-500',
    ORDERED: 'border-purple-500',
    RECEIVED: 'border-green-500',
    CANCELLED: 'border-gray-500',
  };
  return classes[status] || 'border-gray-500';
};

// formatDate and formatCurrency are imported from formatters utility

const closeModal = () => {
  showCreateModal.value = false;
  poForm.value = {
    supplierId: '',
    expectedDate: '',
    notes: '',
    items: [{ productId: '', quantity: 1, unitPrice: 0 }],
  };
};

onMounted(() => {
  loadPurchaseOrders();
  loadSuppliers();
  loadProducts();
});
</script>

