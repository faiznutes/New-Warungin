<template>
  <div class="flex flex-col h-full">
    <!-- Tenant Selector for Super Admin -->
    <TenantSelector @tenant-changed="handleTenantChange" />
    
    <!-- Store Selector -->
    <div class="px-4 sm:px-6 pt-4 sm:pt-6">
      <StoreSelector @store-changed="handleStoreChange" />
    </div>

    <!-- Products Content -->
    <div class="flex flex-col h-full">
    <!-- Product Limit Progress Bar - Moved to top -->
    <div v-if="productLimit" class="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6 mx-4 sm:mx-6">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-blue-100 rounded-lg">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-gray-900">Limit Produk</h3>
            <p class="text-xs text-gray-600">
              <span class="font-medium text-gray-900">{{ productLimit.current }}</span>
              <span v-if="!productLimit.isUnlimited"> / {{ productLimit.max }}</span>
              <span v-else> / Unlimited</span>
              <span v-if="!productLimit.isUnlimited"> produk digunakan</span>
              <span v-else> produk aktif</span>
            </p>
          </div>
        </div>
        <div class="text-right">
          <div class="text-lg font-bold" :class="getLimitColorClass()">
            <span v-if="!productLimit.isUnlimited">
              {{ productLimit.remaining }} tersisa
            </span>
            <span v-else class="text-green-600">Unlimited</span>
          </div>
        </div>
      </div>
      
      <!-- Progress Bar -->
      <div v-if="!productLimit.isUnlimited" class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-300"
          :class="getProgressBarColorClass()"
          :style="{ width: `${getProgressPercentage()}%` }"
        ></div>
      </div>
      <div v-else class="w-full bg-gray-200 rounded-full h-3">
        <div class="h-full bg-green-500 rounded-full" style="width: 100%"></div>
      </div>
      
      <!-- Warning message if limit reached -->
      <div v-if="!productLimit.isUnlimited && productLimit.remaining === 0" class="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div class="flex items-start gap-2">
          <svg class="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div class="flex-1">
            <p class="text-sm font-medium text-yellow-800">Limit produk telah tercapai</p>
            <p class="text-xs text-yellow-700 mt-1">Beli addon "Tambah Produk" untuk menambah slot produk, atau upgrade ke plan yang lebih tinggi.</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-6 px-4 sm:px-6">
      <div class="flex flex-col gap-2">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-900">Produk</h2>
        <p class="text-sm sm:text-base text-gray-600">Kelola produk dan stok</p>
      </div>
      
      <div class="w-full sm:w-auto flex items-center gap-2 sm:gap-4 flex-wrap">
        <!-- Margin Display Format Selector (Admin Tenant & Super Admin only) -->
        <div
          v-if="authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'"
          class="flex items-center gap-2"
        >
          <label class="text-xs sm:text-sm text-gray-600">Format Margin:</label>
          <select
            v-model="marginDisplayFormat"
            @change="saveMarginFormat"
            class="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="percentage">Persen (%)</option>
            <option value="amount">Jumlah Uang</option>
          </select>
        </div>
        <!-- Download Template Button -->
        <button
          v-if="canManageProducts || authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'"
          @click="downloadTemplate"
          class="px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center justify-center space-x-2"
        >
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="hidden sm:inline">Template CSV</span>
          <span class="sm:hidden">Template</span>
        </button>
        <!-- Import CSV Button -->
        <button
          v-if="canManageProducts || authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'"
          @click="triggerFileInput"
          class="px-3 sm:px-4 py-2 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center space-x-2"
        >
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span class="hidden sm:inline">Import CSV</span>
          <span class="sm:hidden">Import</span>
        </button>
        <input
          ref="fileInput"
          type="file"
          accept=".csv"
          @change="handleFileImport"
          class="hidden"
        />
        <!-- Export Button -->
        <ExportButton
          v-if="products.length > 0"
          :data="products"
          filename="produk"
          title="Daftar Produk"
          :headers="['Nama', 'Kategori', 'Harga', 'Stok', 'Status']"
          @export="handleExport"
        />
        <!-- Add Product Button (conditional based on permissions) -->
        <button
          v-if="canManageProducts || authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'"
          @click="showCreateModal = true"
          :disabled="!canAddProduct"
          class="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span class="hidden sm:inline">Tambah Produk</span>
          <span class="sm:hidden">Tambah</span>
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm p-4 sm:p-5 mb-4 sm:mb-6 mx-4 sm:mx-6">
      <!-- Search Bar -->
      <div class="mb-4">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            v-model="filters.search"
            @focus="handleSearchFocus"
            type="text"
            placeholder="Cari produk..."
            class="block w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
          />
        </div>
      </div>

      <!-- Category & Status Filters -->
      <div class="flex flex-col sm:flex-row gap-4">
        <!-- Category Filter -->
        <div class="flex-1">
          <label class="block text-xs font-medium text-gray-700 mb-2">Kategori</label>
          <div class="flex flex-wrap gap-2">
            <button
              @click="filters.category = ''"
              :class="!filters.category 
                ? 'bg-primary-600 text-white border-primary-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
              class="px-3 py-1.5 text-sm font-medium border rounded-lg transition-all"
            >
              Semua
            </button>
            <button
              v-for="cat in categories"
              :key="cat"
              @click="filters.category = cat"
              :class="filters.category === cat 
                ? 'bg-primary-600 text-white border-primary-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
              class="px-3 py-1.5 text-sm font-medium border rounded-lg transition-all"
            >
              {{ cat }}
            </button>
          </div>
        </div>

        <!-- Status Filter -->
        <div class="flex-1">
          <label class="block text-xs font-medium text-gray-700 mb-2">Status</label>
          <div class="flex flex-wrap gap-2">
            <button
              @click="filters.isActive = ''"
              :class="filters.isActive === '' 
                ? 'bg-primary-600 text-white border-primary-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
              class="px-3 py-1.5 text-sm font-medium border rounded-lg transition-all"
            >
              Semua
            </button>
            <button
              @click="filters.isActive = 'true'"
              :class="filters.isActive === 'true' 
                ? 'bg-green-600 text-white border-green-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
              class="px-3 py-1.5 text-sm font-medium border rounded-lg transition-all"
            >
              Aktif
            </button>
            <button
              @click="filters.isActive = 'false'"
              :class="filters.isActive === 'false' 
                ? 'bg-red-600 text-white border-red-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
              class="px-3 py-1.5 text-sm font-medium border rounded-lg transition-all"
            >
              Tidak Aktif
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tenant Selection Message -->
    <div v-if="needsTenantSelection" class="flex flex-col items-center justify-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
      <svg class="w-20 h-20 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">Pilih Tenant Terlebih Dahulu</h3>
      <p class="text-gray-600 text-center max-w-md">Silakan pilih tenant terlebih dahulu untuk melihat produk</p>
    </div>

    <!-- Products Grid -->
    <div v-else-if="loading" class="flex items-center justify-center py-12">
      <div class="flex flex-col items-center">
        <div class="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div class="text-gray-600 font-medium">Memuat produk...</div>
      </div>
    </div>

    <div v-else-if="products.length === 0" class="flex flex-col items-center justify-center py-12 bg-white rounded-lg">
      <svg class="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
      <p class="text-gray-500">Belum ada produk</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-2 sm:px-0">
      <div
        v-for="product in products"
        :key="product.id"
        class="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
      >
        <div class="aspect-w-16 aspect-h-9 bg-gray-200 flex items-center justify-center overflow-hidden">
          <!-- Priority: Image → Emoji → Default icon -->
          <img
            v-if="product.image"
            :src="product.image"
            :alt="product.name"
            class="w-full h-48 object-cover"
          />
          <span v-else-if="product.emoji" class="text-6xl sm:text-7xl">{{ product.emoji }}</span>
          <div v-else class="w-full h-48 bg-gray-200 flex items-center justify-center">
            <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <div class="p-3 sm:p-4">
          <h3 class="font-semibold text-base sm:text-lg text-gray-900 mb-1 sm:mb-2 line-clamp-2">{{ product.name }}</h3>
          <p class="text-xs sm:text-sm text-gray-600 mb-2">{{ product.category || 'Tidak ada kategori' }}</p>
          <div class="flex items-center justify-between mb-2">
            <div class="flex flex-col">
            <span class="text-lg sm:text-xl md:text-2xl font-bold text-primary-600">{{ formatCurrency(typeof product.price === 'number' ? product.price : Number(product.price) || 0) }}</span>
              <!-- Margin untuk Admin Tenant -->
              <span
                v-if="(authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN') && product.cost && product.cost > 0"
                class="text-xs sm:text-sm text-green-600 font-medium mt-1"
              >
                Margin: {{ formatMargin(product.price, product.cost) }}
              </span>
            </div>
            <div class="flex flex-col items-end gap-1">
              <span
                class="px-2 py-1 text-xs rounded font-medium"
                :class="getStockStatusClass(product.stock, product.minStock)"
              >
                {{ getStockStatusLabel(product.stock, product.minStock) }}
              </span>
              <span
                v-if="product.isConsignment"
                class="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded"
              >
                Titipan
              </span>
              <span
                v-if="productLimit && productLimit.currentUsage >= productLimit.limit"
                class="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded"
              >
                Limit: {{ productLimit.currentUsage }}/{{ productLimit.limit }}
              </span>
            </div>
          </div>
          <div class="flex items-center space-x-2 mt-3 sm:mt-4">
            <!-- For Cashier: Add to POS button -->
            <button
              v-if="authStore.user?.role === 'CASHIER'"
              @click="addToPOS(product)"
              :disabled="product.stock <= 0 || !product.isActive"
              class="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="hidden sm:inline">Tambah ke Kasir</span>
              <span class="sm:hidden">Tambah</span>
            </button>
            <!-- For Admin/Tenant/Supervisor: Edit and Delete (conditional based on permissions) -->
            <template v-else-if="canManageProducts || authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'">
              <button
                @click="editProduct(product)"
                class="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
              >
                Edit
              </button>
              <button
                @click="deleteProduct(product.id)"
                class="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
              >
                Hapus
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="flex items-center justify-center space-x-2 mt-6">
      <button
        @click="loadProducts(pagination.page - 1)"
        :disabled="pagination.page === 1"
        class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Sebelumnya
      </button>
      <span class="px-4 py-2 text-gray-700">
        Halaman {{ pagination.page }} dari {{ pagination.totalPages }}
      </span>
      <button
        @click="loadProducts(pagination.page + 1)"
        :disabled="pagination.page === pagination.totalPages"
        class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Selanjutnya
      </button>
    </div>
    </div>
  </div>

  <!-- Product Modal -->
  <ProductModal
    :show="showCreateModal"
    :product="editingProduct"
    @close="closeModal"
    @save="handleSaveProduct"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../api';
import { formatCurrency } from '../../utils/formatters';
import { useAuthStore } from '../../stores/auth';
import TenantSelector from '../../components/TenantSelector.vue';
import StoreSelector from '../../components/StoreSelector.vue';
import ExportButton from '../../components/ExportButton.vue';
import ProductModal from '../../components/ProductModal.vue';
import { useTenantCheck } from '../../composables/useTenantCheck';
import { exportToCSV, exportToExcel, exportToPDF, formatDataForExport } from '../../utils/export';
import { useNotification } from '../../composables/useNotification';
import { usePermissions } from '../../composables/usePermissions';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  stock: number;
  minStock: number;
  category?: string;
  image?: string;
  emoji?: string;
  isActive: boolean;
  isConsignment?: boolean;
}

const authStore = useAuthStore();
const router = useRouter();
const { needsTenantSelection } = useTenantCheck();
const { success: showSuccess, error: showError, confirm: showConfirm } = useNotification();
const { canManageProducts } = usePermissions();

const products = ref<Product[]>([]);
const loading = ref(false);
const showCreateModal = ref(false);
const editingProduct = ref<Product | null>(null);
const categories = ref<string[]>([]);
const productLimit = ref<{
  max: number;
  current: number;
  remaining: number;
  isUnlimited: boolean;
} | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const importing = ref(false);
const filters = ref({
  search: '',
  category: '',
  isActive: '',
});
const pagination = ref({
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 0,
});

// Margin display format (percentage or amount)
const marginDisplayFormat = ref<'percentage' | 'amount'>(
  (localStorage.getItem('marginDisplayFormat') as 'percentage' | 'amount') || 'percentage'
);

const loadProducts = async (page = 1) => {
  // Check if tenant selection is needed
  if (needsTenantSelection.value) {
    return; // Don't load if tenant not selected
  }
  
  loading.value = true;
  try {
    const params: any = {
      page,
      limit: pagination.value.limit,
      ...(filters.value.search && { search: filters.value.search }),
      ...(filters.value.category && { category: filters.value.category }),
      ...(filters.value.isActive && { isActive: filters.value.isActive }),
    };
    const response = await api.get('/products', { params });
    products.value = response.data.data;
    pagination.value = response.data.pagination;

    // Extract unique categories
    const uniqueCategories = new Set<string>();
    products.value.forEach(p => {
      if (p.category) uniqueCategories.add(p.category);
    });
    categories.value = Array.from(uniqueCategories);

    // Get product limit info from response
    if (response.data.limit) {
      productLimit.value = response.data.limit;
    }
  } catch (error: any) {
    console.error('Error loading products:', error);
    await showError(error.response?.data?.message || 'Gagal memuat produk');
  } finally {
    loading.value = false;
  }
};

const editProduct = (product: Product) => {
  editingProduct.value = product;
  showCreateModal.value = true;
};

const closeModal = () => {
  showCreateModal.value = false;
  editingProduct.value = null;
};

const handleSaveProduct = async (productData: Partial<Product>) => {
  try {
    if (editingProduct.value) {
      // Update existing product
      await api.put(`/products/${editingProduct.value.id}`, productData);
      await showSuccess('Produk berhasil diupdate');
    } else {
      // Create new product
      await api.post('/products', productData);
      await showSuccess('Produk berhasil ditambahkan');
    }
    closeModal();
    await loadProducts(pagination.value.page);
  } catch (error: any) {
    console.error('Error saving product:', error);
    await showError(error.response?.data?.message || 'Gagal menyimpan produk');
  }
};

const deleteProduct = async (id: string) => {
  const confirmed = await showConfirm('Apakah Anda yakin ingin menghapus produk ini?');
  if (!confirmed) return;
  try {
    await api.delete(`/products/${id}`);
    await loadProducts(pagination.value.page);
    await showSuccess('Produk berhasil dihapus');
  } catch (error: any) {
    await showError(error.response?.data?.message || 'Gagal menghapus produk');
  }
};

const addToPOS = (_product: Product) => {
  // Navigate to Kasir page
  router.push('/app/pos');
  // You could also emit an event or use a global store to add product to cart
  // For now, just navigate to Kasir
};

const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
  const exportData = formatDataForExport(products.value, {
    name: 'Nama',
    category: 'Kategori',
    price: 'Harga Jual',
    cost: 'Harga Pokok',
    stock: 'Stok',
    minStock: 'Stok Minimum',
    description: 'Deskripsi',
    isConsignment: 'Produk Titipan',
    isActive: 'Status',
  });

  // Format data based on export format
  if (format === 'csv') {
    // For CSV, use raw numbers (no currency formatting)
    const csvData = exportData.map(item => ({
      Nama: item.Nama || '',
      Kategori: item.Kategori || '',
      'Harga Jual': typeof item.Harga === 'string' ? item.Harga.replace(/[^\d]/g, '') : (item.Harga || 0),
      'Harga Pokok': typeof item['Harga Pokok'] === 'string' ? item['Harga Pokok'].replace(/[^\d]/g, '') : (item['Harga Pokok'] || ''),
      Stok: item.Stok || 0,
      'Stok Minimum': item['Stok Minimum'] || 0,
      'Status Stok': getStockStatusLabel(item.Stok || 0, item['Stok Minimum'] || 0),
      Deskripsi: item.Deskripsi || '',
      'Produk Titipan': item['Produk Titipan'] === 'true' || item['Produk Titipan'] === true ? 'Ya' : 'Tidak',
      Status: item.Status === 'true' || item.Status === true ? 'Aktif' : 'Tidak Aktif',
    }));
    exportToCSV(csvData, 'produk', ['Nama', 'Kategori', 'Harga Jual', 'Harga Pokok', 'Stok', 'Stok Minimum', 'Status Stok', 'Deskripsi', 'Produk Titipan', 'Status']);
  } else {
    // For Excel/PDF, format with currency
    const formattedData = exportData.map(item => ({
      ...item,
      'Harga Jual': formatCurrency(Number(item['Harga Jual'] || 0)),
      'Harga Pokok': item['Harga Pokok'] ? formatCurrency(Number(item['Harga Pokok'])) : '-',
      'Status Stok': getStockStatusLabel(item.Stok || 0, item['Stok Minimum'] || 0),
      'Produk Titipan': item['Produk Titipan'] === 'true' || item['Produk Titipan'] === true ? 'Ya' : 'Tidak',
      Status: item.Status === 'true' || item.Status === true ? 'Aktif' : 'Tidak Aktif',
    }));
    if (format === 'excel') {
      exportToExcel(formattedData, 'produk', ['Nama', 'Kategori', 'Harga Jual', 'Harga Pokok', 'Stok', 'Stok Minimum', 'Status Stok', 'Deskripsi', 'Produk Titipan', 'Status']);
    } else if (format === 'pdf') {
      exportToPDF(formattedData, 'produk', 'Daftar Produk', ['Nama', 'Kategori', 'Harga Jual', 'Harga Pokok', 'Stok', 'Stok Minimum', 'Status Stok', 'Deskripsi', 'Produk Titipan', 'Status']);
    }
  }
};

const downloadTemplate = () => {
  // Create template CSV with headers and example row
  const templateData = [
    {
      Nama: 'Contoh Produk',
      Kategori: 'Makanan',
      'Harga Jual': '12000',
      'Harga Pokok': '10000',
      Stok: '100',
      'Stok Minimum': '10',
      'Status Stok': 'Stok Banyak',
      Deskripsi: 'Deskripsi produk contoh',
      'Produk Titipan': 'Tidak',
      Status: 'Aktif',
    },
  ];
  
  exportToCSV(templateData, 'template_import_produk', ['Nama', 'Kategori', 'Harga Jual', 'Harga Pokok', 'Stok', 'Stok Minimum', 'Status Stok', 'Deskripsi', 'Produk Titipan', 'Status']);
  await showSuccess('Template CSV berhasil diunduh');
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileImport = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;
  
  if (!file.name.endsWith('.csv')) {
    await showError('File harus berformat CSV');
    return;
  }
  
  importing.value = true;
  
  try {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      await showError('File CSV tidak valid. Minimal harus ada header dan 1 baris data.');
      return;
    }
    
    // Parse CSV (handle quoted values)
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++; // Skip next quote
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };
    
    const headers = parseCSVLine(lines[0]);
    const requiredHeaders = ['Nama', 'Harga Jual', 'Stok'];
    
    // Check if headers match
    const headerMap: Record<string, number> = {};
    headers.forEach((h, i) => {
      headerMap[h.trim()] = i;
    });
    
    const missingRequiredHeaders = requiredHeaders.filter(h => !headerMap[h]);
    if (missingRequiredHeaders.length > 0) {
      await showError(`Header CSV tidak lengkap. Header wajib: ${requiredHeaders.join(', ')}`);
      return;
    }
    
    // Parse data rows
    const productsToImport: any[] = [];
    const errors: string[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length < headers.length) {
        errors.push(`Baris ${i + 1}: Jumlah kolom tidak sesuai`);
        continue;
      }
      
      const nama = values[headerMap['Nama']]?.trim();
      if (!nama) {
        errors.push(`Baris ${i + 1}: Nama produk wajib diisi`);
        continue;
      }
      
      const harga = values[headerMap['Harga Jual']]?.trim().replace(/[^\d]/g, '');
      if (!harga || isNaN(Number(harga)) || Number(harga) < 0) {
        errors.push(`Baris ${i + 1}: Harga Jual tidak valid`);
        continue;
      }
      
      const cost = values[headerMap['Harga Pokok']]?.trim().replace(/[^\d]/g, '');
      if (cost && (isNaN(Number(cost)) || Number(cost) < 0)) {
        errors.push(`Baris ${i + 1}: Harga Pokok tidak valid`);
        continue;
      }
      
      const stok = values[headerMap['Stok']]?.trim();
      if (stok && (isNaN(Number(stok)) || Number(stok) < 0)) {
        errors.push(`Baris ${i + 1}: Stok tidak valid`);
        continue;
      }
      
      const minStock = values[headerMap['Stok Minimum']]?.trim();
      if (minStock && (isNaN(Number(minStock)) || Number(minStock) < 0)) {
        errors.push(`Baris ${i + 1}: Stok Minimum tidak valid`);
        continue;
      }
      
      const status = values[headerMap['Status']]?.trim().toLowerCase();
      const isActive = status === 'aktif' || status === 'true' || status === '1' || status === '';
      
      const isConsignment = values[headerMap['Produk Titipan']]?.trim().toLowerCase();
      const isConsignmentValue = isConsignment === 'ya' || isConsignment === 'true' || isConsignment === '1' || isConsignment === 'yes';
      
      productsToImport.push({
        name: nama,
        category: values[headerMap['Kategori']]?.trim() || '',
        price: Number(harga),
        cost: cost ? Number(cost) : undefined,
        stock: Number(stok || 0),
        minStock: Number(minStock || 0),
        description: values[headerMap['Deskripsi']]?.trim() || '',
        isActive,
        isConsignment: isConsignmentValue,
      });
    }
    
    if (errors.length > 0) {
      await showError(`Terdapat ${errors.length} error:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n...' : ''}`);
      return;
    }
    
    if (productsToImport.length === 0) {
      await showError('Tidak ada produk yang valid untuk diimport');
      return;
    }
    
    // Import products via API
    const confirmed = await showConfirm(
      `Apakah Anda yakin ingin mengimport ${productsToImport.length} produk?`,
      'Import Produk'
    );
    
    if (!confirmed) return;
    
    // Import products in batches
    const batchSize = 10;
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < productsToImport.length; i += batchSize) {
      const batch = productsToImport.slice(i, i + batchSize);
      
      await Promise.allSettled(
        batch.map(async (product) => {
          try {
            await api.post('/products', product);
            successCount++;
          } catch (error: any) {
            console.error('Error importing product:', product.name, error);
            failCount++;
          }
        })
      );
    }
    
    // Reload products
    await loadProducts(1);
    
    if (failCount === 0) {
      await showSuccess(`Berhasil mengimport ${successCount} produk`);
    } else {
      await showError(`Berhasil mengimport ${successCount} produk, ${failCount} gagal`);
    }
    
    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  } catch (error: any) {
    console.error('Error importing CSV:', error);
    await showError('Gagal membaca file CSV. Pastikan format file benar.');
  } finally {
    importing.value = false;
  }
};

watch([() => filters.value.search, () => filters.value.category, () => filters.value.isActive], () => {
  loadProducts(1);
});

const handleTenantChange = (tenantId: string | null) => {
  // Auto-refetch products when tenant changes
  if (tenantId && !needsTenantSelection.value) {
    loadProducts(1); // Reset to page 1
  }
};

const handleStoreChange = () => {
  // Reload products when store changes
  loadProducts(1);
};

const canAddProduct = computed(() => {
  if (!productLimit.value) return true;
  if (productLimit.value.isUnlimited) return true;
  return productLimit.value.remaining > 0;
});

const getProgressPercentage = () => {
  if (!productLimit.value || productLimit.value.isUnlimited) return 0;
  if (productLimit.value.max === 0) return 0;
  return Math.min(100, (productLimit.value.current / productLimit.value.max) * 100);
};

const getProgressBarColorClass = () => {
  if (!productLimit.value) return 'bg-gray-400';
  const percentage = getProgressPercentage();
  if (percentage >= 100) return 'bg-red-500';
  if (percentage >= 80) return 'bg-yellow-500';
  return 'bg-green-500';
};

const getLimitColorClass = () => {
  if (!productLimit.value || productLimit.value.isUnlimited) return 'text-green-600';
  if (productLimit.value.remaining === 0) return 'text-red-600';
  if (productLimit.value.remaining <= 5) return 'text-yellow-600';
  return 'text-green-600';
};

const getStockStatusLabel = (stock: number, minStock: number): string => {
  if (stock === 0) {
    return 'Stok Habis';
  } else if (stock <= minStock) {
    return 'Stok Menipis';
  } else {
    return 'Stok Banyak';
  }
};

const calculateMargin = (price: number, cost: number): string => {
  if (!cost || cost <= 0 || !price || price <= 0) return '0.00';
  const margin = ((price - cost) / price) * 100;
  return margin.toFixed(2);
};

const formatMargin = (price: number, cost: number): string => {
  if (!cost || cost <= 0 || !price || price <= 0) {
    return marginDisplayFormat.value === 'percentage' ? '0.00%' : formatCurrency(0);
  }
  
  if (marginDisplayFormat.value === 'amount') {
    // Tampilkan margin dalam jumlah uang (harga jual - harga pokok)
    const marginAmount = price - cost;
    return formatCurrency(marginAmount);
  } else {
    // Tampilkan margin dalam persen
    const margin = ((price - cost) / price) * 100;
    return `${margin.toFixed(2)}%`;
  }
};

const saveMarginFormat = () => {
  localStorage.setItem('marginDisplayFormat', marginDisplayFormat.value);
};

const getStockStatusClass = (stock: number, minStock: number): string => {
  if (stock === 0) {
    return 'bg-red-100 text-red-800';
  } else if (stock <= minStock) {
    return 'bg-yellow-100 text-yellow-800';
  } else {
    return 'bg-green-100 text-green-800';
  }
};

// Watch for tenant changes and auto-refetch
// Only reload if tenant actually changed (not on every render)
watch(() => authStore.currentTenantId, (newTenantId, oldTenantId) => {
  // Only reload if tenant actually changed and is not empty
  if (newTenantId && newTenantId !== oldTenantId && !needsTenantSelection.value) {
    loadProducts(1);
  }
}, { immediate: false });

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // Always load products on mount (if tenant is selected)
  if (!needsTenantSelection.value) {
    loadProducts(1);
  }
});
</script>

