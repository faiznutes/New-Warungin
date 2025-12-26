<template>
  <div class="flex flex-col h-full bg-slate-50">
    <!-- Tenant Selector for Super Admin -->
    <TenantSelector @tenant-changed="handleTenantChange" />
    
    <!-- Store Selector (Only for SUPERVISOR) -->
    <div v-if="authStore.user?.role === 'SUPERVISOR'" class="px-6 pt-6">
      <StoreSelector @store-changed="handleStoreChange" />
    </div>

    <!-- Main Content Section -->
    <section class="flex flex-col flex-1 overflow-hidden px-6 pt-6 pb-6">
      <!-- Error Boundary -->
      <div v-if="hasError" class="flex flex-col items-center justify-center py-20">
        <div class="p-4 bg-red-50 text-red-500 rounded-xl mb-4">
          <span class="material-symbols-outlined text-5xl">error</span>
        </div>
        <h3 class="text-lg font-bold text-[#0d141b] mb-2">Something went wrong</h3>
        <p class="text-[#4c739a] text-center max-w-md mb-6">{{ errorMessage || 'Failed to load page. Please try again.' }}</p>
        <button
          @click="retryLoad"
          class="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors font-medium shadow-lg shadow-emerald-500/30"
        >
          Try Again
        </button>
      </div>

      <!-- Main Content -->
      <div v-else class="flex flex-col flex-1">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div class="flex flex-col gap-1">
            <h1 class="text-text-primary dark:text-white text-2xl sm:text-3xl font-bold leading-tight tracking-tight">Products</h1>
            <p class="text-text-secondary dark:text-slate-400">Manage your product catalog and inventory</p>
          </div>
          <div class="flex items-center gap-3 flex-wrap">
             <!-- Margin Display Format Selector (Admin Tenant & Super Admin only) -->
            <div
              v-if="authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'"
              class="relative group"
            >
              <select
                v-model="marginDisplayFormat"
                @change="saveMarginFormat"
                class="appearance-none pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <option value="percentage">Margin %</option>
                <option value="amount">Margin $</option>
              </select>
              <span class="absolute right-2 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px] pointer-events-none">expand_more</span>
            </div>

            <!-- Action Buttons Group -->
            <div v-if="canManageProducts || authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'" class="flex items-center gap-2">
               <button
                @click="downloadTemplate"
                class="p-2.5 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                title="Download Template"
              >
                <span class="material-symbols-outlined text-[20px]">download</span>
              </button>
              
              <button
                @click="triggerFileInput"
                class="p-2.5 text-green-700 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors"
                title="Import CSV"
              >
                <span class="material-symbols-outlined text-[20px]">upload_file</span>
              </button>
            </div>

            <input
              ref="fileInput"
              type="file"
              accept=".csv"
              @change="handleFileImport"
              class="hidden"
            />
            
            <!-- Export Button (Component needs update too, but wrapper here) -->
            <div v-if="products.length > 0">
               <ExportButton
                :data="products"
                filename="produk"
                title="Product List"
                :headers="['Nama', 'Kategori', 'Harga', 'Stok', 'Status']"
                @export="handleExport"
              />
            </div>

            <!-- Add Product Button -->
            <button
              v-if="canManageProducts || authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'"
              @click="showCreateModal = true"
              class="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/30 transition-all active:scale-95 font-medium text-sm"
            >
              <span class="material-symbols-outlined text-[20px]">add</span>
              <span>Add Product</span>
            </button>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 mb-8">
          <div class="flex flex-col lg:flex-row gap-6">
            <!-- Search -->
            <div class="flex-1">
              <label class="block text-xs font-bold text-text-secondary dark:text-slate-400 uppercase tracking-wider mb-2">Search</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
                <input
                  v-model="filters.search"
                  @focus="handleSearchFocus"
                  type="text"
                  placeholder="Search products..."
                  class="block w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 dark:bg-slate-900 text-text-primary dark:text-white focus:bg-white dark:focus:bg-slate-800 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <!-- Category Filter -->
            <div class="flex-1">
              <label class="block text-xs font-bold text-text-secondary dark:text-slate-400 uppercase tracking-wider mb-2">Category</label>
              <div class="flex flex-wrap gap-2">
                <button
                  @click="filters.category = ''"
                  :class="!filters.category 
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                    : 'bg-white dark:bg-slate-800 text-text-secondary dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'"
                  class="px-4 py-2 text-sm font-bold rounded-xl transition-all"
                >
                  All
                </button>
                <button
                  v-for="cat in categories"
                  :key="cat"
                  @click="filters.category = cat"
                  :class="filters.category === cat 
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                    : 'bg-white dark:bg-slate-800 text-text-secondary dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'"
                  class="px-4 py-2 text-sm font-bold rounded-xl transition-all"
                >
                  {{ cat }}
                </button>
              </div>
            </div>

             <!-- Status Filter -->
            <div class="flex-none">
              <label class="block text-xs font-bold text-text-secondary dark:text-slate-400 uppercase tracking-wider mb-2">Status</label>
              <div class="flex flex-wrap gap-2">
                <button
                  @click="filters.isActive = ''"
                  :class="filters.isActive === '' 
                    ? 'bg-slate-800 text-white shadow-md' 
                    : 'bg-white dark:bg-slate-800 text-text-secondary dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'"
                  class="px-4 py-2 text-sm font-bold rounded-xl transition-all"
                >
                  All
                </button>
                <button
                  @click="filters.isActive = 'true'"
                  :class="filters.isActive === 'true' 
                    ? 'bg-green-600 text-white shadow-md shadow-green-600/20' 
                    : 'bg-white dark:bg-slate-800 text-text-secondary dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'"
                  class="px-4 py-2 text-sm font-bold rounded-xl transition-all"
                >
                  Active
                </button>
                <button
                  @click="filters.isActive = 'false'"
                  :class="filters.isActive === 'false' 
                    ? 'bg-red-500 text-white shadow-md shadow-red-500/20' 
                    : 'bg-white dark:bg-slate-800 text-text-secondary dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'"
                  class="px-4 py-2 text-sm font-bold rounded-xl transition-all"
                >
                  Inactive
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Product Limit Info with Progress Bar -->
        <div v-if="productLimit && productLimit.limit !== undefined && productLimit.limit !== -1" class="mb-8 bg-blue-50/50 border border-blue-100 rounded-2xl p-6">
          <div class="flex items-center justify-between mb-3">
            <div>
              <p class="font-bold text-blue-900">Product Limit</p>
              <p class="text-sm text-blue-600 mt-0.5">
                {{ productLimit.currentUsage || 0 }} / {{ productLimit.limit }} products used
                <span class="font-semibold ml-1" :class="(productLimit.currentUsage || 0) >= productLimit.limit ? 'text-red-500' : 'text-green-600'">
                  ({{ productLimit.limit - (productLimit.currentUsage || 0) }} remaining)
                </span>
              </p>
            </div>
          </div>
          <div class="w-full bg-blue-100 rounded-full h-2.5 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500 ease-out"
              :class="(productLimit.currentUsage || 0) >= productLimit.limit ? 'bg-red-500' : (productLimit.currentUsage || 0) >= (productLimit.limit * 0.8) ? 'bg-yellow-500' : 'bg-emerald-500'"
              :style="{ width: `${Math.min(100, ((productLimit.currentUsage || 0) / productLimit.limit) * 100)}%` }"
            ></div>
          </div>
        </div>

        <!-- Tenant Selection Message -->
        <div v-if="needsTenantSelection" class="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <div class="p-4 bg-slate-50 rounded-full mb-4">
             <span class="material-symbols-outlined text-4xl text-slate-400">store</span>
          </div>
          <h3 class="text-lg font-bold text-slate-900 mb-2">Select a Tenant</h3>
          <p class="text-slate-500 text-center max-w-md">Please select a tenant from the dropdown above to view products.</p>
        </div>

        <!-- Products Grid -->
        <div v-else-if="loading" class="flex items-center justify-center py-24">
          <div class="flex flex-col items-center">
            <div class="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <div class="text-slate-500 font-medium animate-pulse">Loading products...</div>
          </div>
        </div>

        <div v-else-if="products.length === 0" class="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border-2 border-dashed border-slate-100">
           <div class="p-6 bg-slate-50 rounded-full mb-4">
             <span class="material-symbols-outlined text-5xl text-slate-300">inventory_2</span>
           </div>
          <h3 class="text-lg font-bold text-slate-900 mb-2">No Products Found</h3>
          <p class="text-slate-500 mb-6">Get started by adding your first product.</p>
          <button
              v-if="canManageProducts || authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'"
              @click="showCreateModal = true"
              class="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/30 transition-all active:scale-95 font-medium text-sm"
            >
              <span class="material-symbols-outlined text-[20px]">add</span>
              <span>Add Product</span>
            </button>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div
            v-for="product in products"
            :key="product.id"
            class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-700 transition-all duration-300 group overflow-hidden flex flex-col"
          >
            <!-- Image Area -->
            <div class="aspect-w-4 aspect-h-3 bg-slate-100 relative overflow-hidden">
              <img
                v-if="product.image"
                :src="product.image"
                :alt="product.name"
                class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div v-else-if="product.emoji" class="w-full h-full flex items-center justify-center text-7xl bg-slate-50 dark:bg-slate-900">
                {{ product.emoji }}
              </div>
              <div v-else class="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <span class="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">image</span>
              </div>
              
              <!-- Badges Overlay -->
              <div class="absolute top-3 right-3 flex flex-col gap-2 items-end">
                <span
                   v-if="product.isConsignment"
                   class="px-2 py-1 text-[10px] font-bold uppercase tracking-wide bg-purple-100 text-purple-700 rounded-full shadow-sm backdrop-blur-sm bg-opacity-90"
                 >
                   Consignment
                 </span>
                 <span
                    v-if="!product.isActive"
                    class="px-2 py-1 text-[10px] font-bold uppercase tracking-wide bg-slate-800 text-white rounded-full shadow-sm"
                  >
                    Inactive
                  </span>
              </div>
            </div>

            <!-- Content -->
            <div class="p-5 flex flex-col flex-1">
              <div class="mb-4">
                 <div class="flex justify-between items-start gap-2 mb-1">
                    <p class="text-xs font-semibold text-emerald-600 uppercase tracking-wider line-clamp-1">{{ product.category || 'Uncategorized' }}</p>
                    <span
                      class="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full"
                      :class="getStockStatusClass(product.stock, product.minStock)"
                    >
                      {{ getStockStatusLabel(product.stock, product.minStock) }}
                    </span>
                 </div>
                 <h3 class="font-bold text-lg text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-2 md:h-14">{{ product.name }}</h3>
              </div>
              
              <div class="mt-auto">
                 <div class="flex items-end justify-between mb-4">
                    <div class="flex flex-col">
                       <span class="text-sm text-slate-400 font-medium">Price</span>
                       <span class="text-xl font-bold text-slate-900">{{ formatCurrency(typeof product.price === 'number' ? product.price : Number(product.price) || 0) }}</span>
                    </div>
                    
                    <div v-if="(authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN') && product.cost && product.cost > 0" class="flex flex-col items-end">
                       <span class="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Margin</span>
                       <span class="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
                         {{ formatMargin(product.price, product.cost) }}
                       </span>
                    </div>
                 </div>

                 <!-- Actions -->
                 <div class="flex items-center gap-2 pt-4 border-t border-slate-100">
                    <!-- Cashier Action -->
                    <button
                      v-if="authStore.user?.role === 'CASHIER'"
                      @click="addToPOS(product)"
                      :disabled="product.stock <= 0 || !product.isActive"
                      class="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-bold text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-500/20"
                    >
                      <span class="material-symbols-outlined text-[18px]">shopping_cart</span>
                      Add to Cart
                    </button>

                    <!-- Admin Actions -->
                    <template v-else-if="canManageProducts || authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'">
                      <button
                        @click="editProduct(product)"
                        class="flex-1 px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-white hover:border-emerald-500 hover:text-emerald-600 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        @click="deleteProduct(product.id)"
                        class="px-3 py-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        title="Delete Product"
                      >
                        <span class="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </template>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="flex items-center justify-center space-x-2 mt-8 pb-8">
          <button
            @click="loadProducts(pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:text-emerald-600 transition-colors flex items-center gap-2 font-medium"
          >
            <span class="material-symbols-outlined text-[20px]">chevron_left</span>
            Previous
          </button>
          <span class="px-4 py-2 text-slate-600 font-medium bg-slate-50 rounded-xl border border-slate-100">
            Page {{ pagination.page }} of {{ pagination.totalPages }}
          </span>
          <button
            @click="loadProducts(pagination.page + 1)"
            :disabled="pagination.page === pagination.totalPages"
            class="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:text-emerald-600 transition-colors flex items-center gap-2 font-medium"
          >
            Next
            <span class="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Product Modal -->
    <ProductModal
      :show="showCreateModal"
      :product="editingProduct"
      @close="closeModal"
      @save="handleSaveProduct"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
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
import { safeMap } from '../../utils/array-helpers';

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
const hasError = ref(false);
const errorMessage = ref<string>('');

const retryLoad = () => {
  hasError.value = false;
  errorMessage.value = '';
  loadProducts(1);
};

const categories = ref<string[]>([]);
const productLimit = ref<any>(null);
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
  
  // For non-super-admin, ensure tenantId is available
  if (!authStore.isSuperAdmin && !authStore.user?.tenantId) {
    console.error('Tenant ID not available for non-super-admin user');
    hasError.value = true;
    errorMessage.value = 'Tenant ID unavailable. Please login again.';
    return;
  }
  
  loading.value = true;
  hasError.value = false;
  errorMessage.value = '';
  try {
    const params: any = {
      page,
      limit: pagination.value.limit,
      ...(filters.value.search && { search: filters.value.search }),
      ...(filters.value.category && { category: filters.value.category }),
      ...(filters.value.isActive && { isActive: filters.value.isActive }),
    };
    
    // Ensure tenantId is set in params for SUPER_ADMIN
    if (authStore.isSuperAdmin && authStore.selectedTenantId) {
      params.tenantId = authStore.selectedTenantId;
    }
    
    const response = await api.get('/products', { params });
    products.value = Array.isArray(response.data.data) ? response.data.data : [];
    pagination.value = response.data.pagination || { page: 1, limit: 12, total: 0, totalPages: 0 };

    // Extract unique categories
    const uniqueCategories = new Set<string>();
    if (Array.isArray(products.value)) {
    products.value.forEach(p => {
      if (p.category) uniqueCategories.add(p.category);
    });
    }
    categories.value = Array.from(uniqueCategories);

    // Load product limit
    try {
      const limitRes = await api.get('/addons/check-limit/ADD_PRODUCTS');
      productLimit.value = limitRes.data;
    } catch (e) {
      // Ignore if no addon
    }
  } catch (error: any) {
    console.error('Error loading products:', error);
    
    // Set error state for error boundary
    hasError.value = true;
    errorMessage.value = error?.response?.data?.message || error?.message || 'Failed to load products';
    
    // If 401 Unauthorized, redirect to login
    if (error?.response?.status === 401) {
      authStore.clearAuth();
      router.push('/login');
      return;
    }
    
    // Clear selectedTenantId on error for Super Admin
    if (authStore.isSuperAdmin) {
      authStore.setSelectedTenant(null);
      localStorage.removeItem('selectedTenantId');
    }
    
    if (error.response?.status !== 429 && error.response?.status !== 401) { // Don't show error for rate limiting or auth
      await showError(error.response?.data?.message || 'Failed to load products');
    }
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
      await showSuccess('Product updated successfully');
    } else {
      // Create new product
      await api.post('/products', productData);
      await showSuccess('Product added successfully');
    }
    closeModal();
    await loadProducts(pagination.value.page);
  } catch (error: any) {
    console.error('Error saving product:', error);
    await showError(error.response?.data?.message || 'Failed to save product');
  }
};

const deleteProduct = async (id: string) => {
  const confirmed = await showConfirm('Are you sure you want to delete this product?');
  if (!confirmed) return;
  try {
    await api.delete(`/products/${id}`);
    await loadProducts(pagination.value.page);
    await showSuccess('Product deleted successfully');
  } catch (error: any) {
    await showError(error.response?.data?.message || 'Failed to delete product');
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
    name: 'Name',
    category: 'Category',
    price: 'Price',
    cost: 'Cost',
    stock: 'Stock',
    minStock: 'Min Stock',
    description: 'Description',
    isConsignment: 'Consignment',
    isActive: 'Status',
  });

  // Format data based on export format
  if (format === 'csv') {
    // For CSV, use raw numbers (no currency formatting)
    // GUARD CLAUSE: Pastikan exportData selalu array
    const safeExportData = Array.isArray(exportData) ? exportData : [];
    
    // Use mapped english headers
    const csvData = safeMap(safeExportData, (item: any) => ({
      Name: item.Name || '',
      Category: item.Category || '',
      'Price': typeof item.Price === 'string' ? item.Price.replace(/[^\d]/g, '') : (item.Price || 0),
      'Cost': typeof item['Cost'] === 'string' ? item['Cost'].replace(/[^\d]/g, '') : (item['Cost'] || ''),
      Stock: item.Stock || 0,
      'Min Stock': item['Min Stock'] || 0,
      'Stock Status': getStockStatusLabel(item.Stock || 0, item['Min Stock'] || 0),
      Description: item.Description || '',
      'Consignment': item['Consignment'] === 'true' || item['Consignment'] === true ? 'Yes' : 'No',
      Status: item.Status === 'true' || item.Status === true ? 'Active' : 'Inactive',
    }));
    exportToCSV(csvData, 'products', ['Name', 'Category', 'Price', 'Cost', 'Stock', 'Min Stock', 'Stock Status', 'Description', 'Consignment', 'Status']);
  } else {
    // For Excel/PDF, format with currency
    // GUARD CLAUSE: Pastikan exportData selalu array
    const safeExportData = Array.isArray(exportData) ? exportData : [];
    
    const formattedData = safeMap(safeExportData, (item: any) => ({
      ...item,
      'Price': formatCurrency(Number(item['Price'] || 0)),
      'Cost': item['Cost'] ? formatCurrency(Number(item['Cost'])) : '-',
      'Stock Status': getStockStatusLabel(item.Stock || 0, item['Min Stock'] || 0),
      'Consignment': item['Consignment'] === 'true' || item['Consignment'] === true ? 'Yes' : 'No',
      Status: item.Status === 'true' || item.Status === true ? 'Active' : 'Inactive',
    }));
    if (format === 'excel') {
      exportToExcel(formattedData, 'products', ['Name', 'Category', 'Price', 'Cost', 'Stock', 'Min Stock', 'Stock Status', 'Description', 'Consignment', 'Status']);
    } else if (format === 'pdf') {
      exportToPDF(formattedData, 'products', 'Product List', ['Name', 'Category', 'Price', 'Cost', 'Stock', 'Min Stock', 'Stock Status', 'Description', 'Consignment', 'Status']);
    }
  }
};

const downloadTemplate = () => {
  // Create template CSV with headers and example row
  const templateData = [
    {
      Name: 'Example Product',
      Category: 'Food',
      'Price': '12000',
      'Cost': '10000',
      Stock: '100',
      'Min Stock': '10',
      'Stock Status': 'In Stock',
      Description: 'Example product description',
      'Consignment': 'No',
      Status: 'Active',
    },
  ];
  
  exportToCSV(templateData, 'product_import_template', ['Name', 'Category', 'Price', 'Cost', 'Stock', 'Min Stock', 'Stock Status', 'Description', 'Consignment', 'Status']);
  showSuccess('CSV template downloaded successfully');
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileImport = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;
  
  if (!file.name.endsWith('.csv')) {
    await showError('File must be in CSV format');
    return;
  }
  
  importing.value = true;
  
  try {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      await showError('Invalid CSV file. Must have header and at least 1 data row.');
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
    // Allow both English and Indonesian headers for backward compatibility or ease of use
    // But we map them to our internal field names
    
    const requiredHeaders = ['Name', 'Price', 'Stock']; // simplified for English
    
    // Check if headers match (we'll do a simple check for now mainly focusing on standard template)
    const headerMap: Record<string, number> = {};
    headers.forEach((h, i) => {
      headerMap[h.trim()] = i;
    });
    
    // Map of expected headers (EN/ID) to index
    const getIndex = (keys: string[]) => {
      for (const key of keys) {
        if (headerMap[key] !== undefined) return headerMap[key];
      }
      return -1;
    };
    
    const nameIdx = getIndex(['Name', 'Nama']);
    const priceIdx = getIndex(['Price', 'Harga Jual', 'Harga']);
    const stockIdx = getIndex(['Stock', 'Stok']);
    
    if (nameIdx === -1 || priceIdx === -1 || stockIdx === -1) {
       await showError('Incomplete CSV headers. Required: Name, Price, Stock');
       return;
    }
    
    // Parse data rows
    const productsToImport: any[] = [];
    const errors: string[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length < headers.length) {
        errors.push(`Row ${i + 1}: Column count mismatch`);
        continue;
      }
      
      const nama = values[nameIdx]?.trim();
      if (!nama) {
        errors.push(`Row ${i + 1}: Name is required`);
        continue;
      }
      
      const harga = values[priceIdx]?.trim().replace(/[^\d]/g, '');
      if (!harga || isNaN(Number(harga)) || Number(harga) < 0) {
        errors.push(`Row ${i + 1}: Invalid Price`);
        continue;
      }
      
      const costIdx = getIndex(['Cost', 'Harga Pokok']);
      const cost = costIdx !== -1 ? values[costIdx]?.trim().replace(/[^\d]/g, '') : undefined;
      
      const stok = values[stockIdx]?.trim();
      if (stok && (isNaN(Number(stok)) || Number(stok) < 0)) {
        errors.push(`Row ${i + 1}: Invalid Stock`);
        continue;
      }
      
      const minStockIdx = getIndex(['Min Stock', 'Stok Minimum']);
      const minStock = minStockIdx !== -1 ? values[minStockIdx]?.trim() : '0';
      
      const statusIdx = getIndex(['Status']);
      const status = statusIdx !== -1 ? values[statusIdx]?.trim().toLowerCase() : 'active';
      const isActive = status === 'active' || status === 'aktif' || status === 'true' || status === '1' || status === '';
      
      const consignmentIdx = getIndex(['Consignment', 'Produk Titipan']);
      const isConsignment = consignmentIdx !== -1 ? values[consignmentIdx]?.trim().toLowerCase() : 'no';
      const isConsignmentValue = isConsignment === 'yes' || isConsignment === 'ya' || isConsignment === 'true' || isConsignment === '1';
      
      const categoryIdx = getIndex(['Category', 'Kategori']);
      const descriptionIdx = getIndex(['Description', 'Deskripsi']);
      
      productsToImport.push({
        name: nama,
        category: categoryIdx !== -1 ? values[categoryIdx]?.trim() || '' : '',
        price: Number(harga),
        cost: cost ? Number(cost) : undefined,
        stock: Number(stok || 0),
        minStock: Number(minStock || 0),
        description: descriptionIdx !== -1 ? values[descriptionIdx]?.trim() || '' : '',
        isActive,
        isConsignment: isConsignmentValue,
      });
    }
    
    if (errors.length > 0) {
      await showError(`Found ${errors.length} errors:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n...' : ''}`);
      return;
    }
    
    if (productsToImport.length === 0) {
      await showError('No valid products to import');
      return;
    }
    
    // Import products via API
    const confirmed = await showConfirm(
      `Are you sure you want to import ${productsToImport.length} products?`,
      'Import Products'
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
      await showSuccess(`Successfully imported ${successCount} products`);
    } else {
      await showError(`Imported ${successCount} products, ${failCount} failed`);
    }
    
    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  } catch (error: any) {
    console.error('Error importing CSV:', error);
    await showError('Failed to read CSV file. Please ensure valid format.');
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

const getStockStatusLabel = (stock: number, minStock: number): string => {
  if (stock === 0) {
    return 'Out of Stock';
  } else if (stock <= minStock) {
    return 'Low Stock';
  } else {
    return 'In Stock';
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

onMounted(async () => {
  try {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // For super admin, ensure selectedTenantId is synced with localStorage
    if (authStore.isSuperAdmin) {
      const storedTenantId = localStorage.getItem('selectedTenantId');
      if (storedTenantId && storedTenantId !== authStore.selectedTenantId) {
        authStore.setSelectedTenant(storedTenantId);
      }
    }
    
    // Always load products on mount (if tenant is selected)
    if (!needsTenantSelection.value) {
      await loadProducts(1);
    }
  } catch (error: any) {
    console.error('Error in onMounted:', error);
    hasError.value = true;
    errorMessage.value = error?.message || 'Terjadi kesalahan saat memuat halaman';
  }
});
</script>

