<template>
  <div class="flex flex-col h-full">
    <!-- Tenant Selector for Super Admin -->
    <TenantSelector @tenant-changed="handleTenantChange" />

    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-6 px-4 sm:px-6">
      <div class="flex flex-col gap-2">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-900">Diskon</h2>
        <p class="text-sm sm:text-base text-gray-600">Kelola diskon dan promo</p>
      </div>
      <button
        v-if="authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'"
        @click="showCreateModal = true"
        class="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm sm:text-base bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center justify-center space-x-2"
      >
        <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span class="hidden sm:inline">Tambah Diskon</span>
        <span class="sm:hidden">Tambah</span>
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm p-4 sm:p-5 mb-4 sm:mb-6 mx-4 sm:mx-6">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          v-model="filters.search"
          @focus="handleSearchFocus"
          @input="handleSearchInput"
          type="text"
          placeholder="Cari diskon..."
          class="block w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
        />
      </div>
    </div>

    <!-- Discounts Table -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-gray-500">Memuat...</div>
    </div>

    <div v-else-if="discounts.length === 0" class="flex flex-col items-center justify-center py-12 bg-white rounded-lg mx-4 sm:mx-6">
      <svg class="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-gray-500">Belum ada diskon</p>
    </div>

    <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden mx-4 sm:mx-6">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama Diskon
              </th>
              <th class="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipe
              </th>
              <th class="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nilai Diskon
              </th>
              <th class="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Periode
              </th>
              <th class="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="discount in filteredDiscounts" :key="discount.id" class="hover:bg-gray-50">
              <td class="px-4 lg:px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ discount.name }}</div>
              </td>
              <td class="px-4 lg:px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ getDiscountTypeLabel(discount.discountType) }}</div>
              </td>
              <td class="px-4 lg:px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ discount.discountValueType === 'PERCENTAGE' 
                    ? `${discount.discountValue}%` 
                    : formatCurrency(Number(discount.discountValue)) }}
                </div>
              </td>
              <td class="px-4 lg:px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">
                  <div v-if="discount.startDate || discount.endDate">
                    {{ discount.startDate ? formatDate(discount.startDate) : '-' }} - 
                    {{ discount.endDate ? formatDate(discount.endDate) : 'Tidak terbatas' }}
                  </div>
                  <div v-else class="text-gray-400">Tidak terbatas</div>
                </div>
              </td>
              <td class="px-4 lg:px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 py-1 text-xs font-semibold rounded-full"
                  :class="discount.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                >
                  {{ discount.isActive ? 'Aktif' : 'Tidak Aktif' }}
                </span>
              </td>
              <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button
                    @click="editDiscount(discount)"
                    class="px-2 sm:px-3 py-1 text-xs sm:text-sm text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded"
                  >
                    Edit
                  </button>
                  <button
                    @click="deleteDiscount(discount.id)"
                    class="px-2 sm:px-3 py-1 text-xs sm:text-sm text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                  >
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 class="text-lg sm:text-xl font-semibold text-gray-900">
            {{ editingDiscount ? 'Edit Diskon' : 'Tambah Diskon' }}
          </h3>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600 transition p-2"
          >
            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveDiscount" class="p-4 sm:p-6">
          <div class="space-y-4">
            <!-- Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nama Diskon</label>
              <input
                v-model="discountForm.name"
                type="text"
                required
                placeholder="Contoh: Diskon Lebaran 20%"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <!-- Discount Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tipe Diskon</label>
              <select
                v-model="discountForm.discountType"
                required
                @change="handleDiscountTypeChange"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="AMOUNT_BASED">Berdasarkan Total Pembelian</option>
                <option value="BUNDLE">Bundle (Beli Bersama)</option>
                <option value="PRODUCT_BASED">Berdasarkan Produk Tertentu</option>
                <option value="QUANTITY_BASED">Berdasarkan Jumlah Item (Beli X dapat diskon)</option>
              </select>
            </div>

            <!-- Product Selection for BUNDLE - Direct Popup -->
            <div v-if="discountForm.discountType === 'BUNDLE'">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Pilih Produk untuk Bundle <span class="text-red-500">*</span>
              </label>
              <button
                type="button"
                @click="showProductSelector = true; productSelectorType = 'BUNDLE'"
                class="w-full px-4 py-2 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-between"
              >
                <span class="text-sm text-gray-700">
                  <span v-if="discountForm.bundleProducts.length === 0" class="text-gray-400">
                    Klik untuk memilih produk bundle
                  </span>
                  <span v-else>
                    {{ discountForm.bundleProducts.length }} produk dipilih
                  </span>
                </span>
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <p class="mt-1 text-xs text-gray-500">
                Semua produk yang dipilih harus dibeli bersama untuk mendapatkan diskon
              </p>
            </div>

            <!-- Product Selection for PRODUCT_BASED - Popup -->
            <div v-if="discountForm.discountType === 'PRODUCT_BASED'">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Pilih Produk yang Mendapat Diskon <span class="text-red-500">*</span>
              </label>
              <button
                type="button"
                @click="showProductSelector = true; productSelectorType = 'PRODUCT_BASED'"
                class="w-full px-4 py-2 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-between"
              >
                <span class="text-sm text-gray-700">
                  <span v-if="discountForm.applicableProducts.length === 0" class="text-gray-400">
                    Klik untuk memilih produk
                  </span>
                  <span v-else>
                    {{ discountForm.applicableProducts.length }} produk dipilih
                  </span>
                </span>
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <p class="mt-1 text-xs text-gray-500">
                Produk yang dipilih akan mendapat diskon saat dibeli (bisa 1 per satu atau bersama)
              </p>
            </div>

            <!-- Product Selection for QUANTITY_BASED - Popup with Category Option -->
            <div v-if="discountForm.discountType === 'QUANTITY_BASED'">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Pilih Produk <span class="text-red-500">*</span>
              </label>
              <div class="space-y-3">
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-2">Pilihan Produk</label>
                  <select
                    v-model="productSelectionType"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="CATEGORY">Berdasarkan Kategori</option>
                    <option value="PRODUCTS">Pilih Produk Tertentu</option>
                  </select>
                </div>

                <!-- Category Selection -->
                <div v-if="productSelectionType === 'CATEGORY'">
                  <label class="block text-xs font-medium text-gray-600 mb-2">Pilih Kategori</label>
                  <select
                    v-model="selectedCategory"
                    @change="handleCategoryChange"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Pilih Kategori</option>
                    <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                  </select>
                </div>

                <!-- Product Selection Button -->
                <div v-if="productSelectionType === 'PRODUCTS'">
                  <button
                    type="button"
                    @click="showProductSelector = true; productSelectorType = 'QUANTITY_BASED'"
                    class="w-full px-4 py-2 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-between"
                  >
                    <span class="text-sm text-gray-700">
                      <span v-if="discountForm.applicableProducts.length === 0" class="text-gray-400">
                        Klik untuk memilih produk
                      </span>
                      <span v-else>
                        {{ discountForm.applicableProducts.length }} produk dipilih
                      </span>
                    </span>
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              <p class="mt-1 text-xs text-gray-500">
                Produk harus dibeli dalam jumlah minimum yang ditentukan untuk mendapatkan diskon
              </p>
            </div>

            <!-- Bundle Discount Product Selection (for BUNDLE) -->
            <div v-if="discountForm.discountType === 'BUNDLE' && discountForm.bundleProducts.length > 0">
              <label class="block text-sm font-medium text-gray-700 mb-2">Produk yang Mendapat Diskon</label>
              <select
                v-model="discountForm.bundleDiscountProduct"
                required
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Pilih Produk</option>
                <option
                  v-for="productId in discountForm.bundleProducts"
                  :key="productId"
                  :value="productId"
                >
                  {{ getProductName(productId) }}
                </option>
              </select>
              <p class="mt-1 text-xs text-gray-500">
                Pilih produk yang akan mendapat diskon ketika semua produk bundle dibeli bersama
              </p>
            </div>

            <!-- Quantity Based Settings (for QUANTITY_BASED) -->
            <div v-if="discountForm.discountType === 'QUANTITY_BASED'">
              <label class="block text-sm font-medium text-gray-700 mb-2">Minimum Jumlah Item yang Harus Dibeli</label>
              <input
                v-model.number="discountForm.minQuantity"
                type="number"
                required
                min="1"
                placeholder="Contoh: 3 (beli 3 item dapat diskon)"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <p class="mt-1 text-xs text-gray-500">
                Contoh: Beli 3 item ayam (20rb) = 60rb, dapat diskon sesuai nilai diskon yang diatur
              </p>
            </div>

            <!-- Discount Value Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Jenis Nilai Diskon</label>
              <select
                v-model="discountForm.discountValueType"
                required
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="PERCENTAGE">Persentase (%)</option>
                <option value="FIXED">Nominal (Rp)</option>
              </select>
            </div>

            <!-- Discount Value -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nilai Diskon {{ discountForm.discountValueType === 'PERCENTAGE' ? '(%)' : '(Rp)' }}
              </label>
              <input
                v-model.number="discountForm.discountValue"
                type="number"
                required
                min="0"
                :step="discountForm.discountValueType === 'PERCENTAGE' ? '1' : '1000'"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <!-- Min Amount (for AMOUNT_BASED) -->
            <div v-if="discountForm.discountType === 'AMOUNT_BASED'">
              <label class="block text-sm font-medium text-gray-700 mb-2">Minimum Total Pembelian (Rp)</label>
              <input
                v-model.number="discountForm.minAmount"
                type="number"
                min="0"
                step="1000"
                placeholder="0 = tidak ada minimum"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <!-- Min Quantity (for AMOUNT_BASED) -->
            <div v-if="discountForm.discountType === 'AMOUNT_BASED'">
              <label class="block text-sm font-medium text-gray-700 mb-2">Minimum Jumlah Item</label>
              <input
                v-model.number="discountForm.minQuantity"
                type="number"
                min="1"
                placeholder="1"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <!-- Start Date -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai (Opsional)</label>
              <input
                v-model="discountForm.startDate"
                type="datetime-local"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <!-- End Date -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal Berakhir (Opsional)</label>
              <input
                v-model="discountForm.endDate"
                type="datetime-local"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <!-- Applicable To -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Berlaku Untuk</label>
              <select
                v-model="discountForm.applicableTo"
                required
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="ALL">Semua Orang</option>
                <option value="MEMBER_ONLY">Hanya Member</option>
              </select>
            </div>

            <!-- Is Active -->
            <div class="flex items-center space-x-2">
              <input
                v-model="discountForm.isActive"
                type="checkbox"
                id="isActive"
                class="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <label for="isActive" class="text-sm text-gray-700">Aktif</label>
            </div>
          </div>

          <div class="flex space-x-3 pt-4 mt-6 border-t border-gray-200">
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              {{ editingDiscount ? 'Update' : 'Simpan' }}
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

    <!-- Product Selector Modal -->
    <ProductSelectorModal
      :show="showProductSelector"
      :title="getProductSelectorTitle()"
      :subtitle="getProductSelectorSubtitle()"
      :selected-product-ids="getSelectedProductIds()"
      @confirm="handleProductSelectorConfirm"
      @cancel="showProductSelector = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuthStore } from '../../stores/auth';
import TenantSelector from '../../components/TenantSelector.vue';
import ProductSelectorModal from '../../components/ProductSelectorModal.vue';
import { useTenantCheck } from '../../composables/useTenantCheck';
import { useNotification } from '../../composables/useNotification';

const authStore = useAuthStore();
const { needsTenantSelection } = useTenantCheck();
const { success: showSuccess, error: showError, confirm: showConfirm } = useNotification();

const discounts = ref<any[]>([]);
const loading = ref(false);
const showCreateModal = ref(false);
const editingDiscount = ref<any>(null);
const filters = ref({
  search: '',
});

const discountForm = ref({
  name: '',
  discountType: 'AMOUNT_BASED' as 'AMOUNT_BASED' | 'BUNDLE' | 'PRODUCT_BASED' | 'QUANTITY_BASED',
  discountValue: 0,
  discountValueType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
  minAmount: undefined as number | undefined,
  minQuantity: undefined as number | undefined,
  applicableProducts: [] as string[],
  bundleProducts: [] as string[],
  bundleDiscountProduct: '',
  applicableTo: 'ALL' as 'ALL' | 'MEMBER_ONLY',
  isActive: true,
  startDate: '',
  endDate: '',
});

const productSelectionType = ref<'CATEGORY' | 'PRODUCTS'>('PRODUCTS');
const selectedCategory = ref<string>('');
const categories = ref<string[]>([]);
const availableProducts = ref<any[]>([]);
const loadingProducts = ref(false);
const showProductSelector = ref(false);
const productSelectorType = ref<'BUNDLE' | 'PRODUCT_BASED' | 'QUANTITY_BASED'>('BUNDLE');

const filteredDiscounts = computed(() => {
  let result = discounts.value;
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase();
    result = result.filter(d =>
      d.name.toLowerCase().includes(search) ||
      d.discountType.toLowerCase().includes(search)
    );
  }
  return result;
});

const getDiscountTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    AMOUNT_BASED: 'Berdasarkan Total',
    BUNDLE: 'Bundle',
    PRODUCT_BASED: 'Berdasarkan Produk',
    QUANTITY_BASED: 'Berdasarkan Jumlah Item',
  };
  return labels[type] || type;
};

const loadProducts = async () => {
  if (needsTenantSelection.value) {
    return;
  }

  loadingProducts.value = true;
  try {
    const response = await api.get('/products', { params: { limit: 1000 } });
    const productsData = response.data.data || response.data;
    availableProducts.value = Array.isArray(productsData) ? productsData : [];
    
    // Extract unique categories
    const uniqueCategories = new Set<string>();
    availableProducts.value.forEach((p: any) => {
      if (p.category) uniqueCategories.add(p.category);
    });
    categories.value = Array.from(uniqueCategories);
  } catch (error: any) {
    console.error('Error loading products:', error);
  } finally {
    loadingProducts.value = false;
  }
};

const getProductName = (productId: string): string => {
  const product = availableProducts.value.find((p: any) => p.id === productId);
  return product ? product.name : productId;
};

const handleDiscountTypeChange = () => {
  // Reset product selections when discount type changes
  discountForm.value.applicableProducts = [];
  discountForm.value.bundleProducts = [];
  discountForm.value.bundleDiscountProduct = '';
  productSelectionType.value = 'PRODUCTS';
  selectedCategory.value = '';
};

const getProductSelectorTitle = (): string => {
  switch (productSelectorType.value) {
    case 'BUNDLE':
      return 'Pilih Produk untuk Bundle';
    case 'PRODUCT_BASED':
      return 'Pilih Produk yang Mendapat Diskon';
    case 'QUANTITY_BASED':
      return 'Pilih Produk untuk Quantity Based';
    default:
      return 'Pilih Produk';
  }
};

const getProductSelectorSubtitle = (): string => {
  switch (productSelectorType.value) {
    case 'BUNDLE':
      return 'Semua produk yang dipilih harus dibeli bersama untuk mendapatkan diskon';
    case 'PRODUCT_BASED':
      return 'Produk yang dipilih akan mendapat diskon saat dibeli (bisa 1 per satu atau bersama)';
    case 'QUANTITY_BASED':
      return 'Produk harus dibeli dalam jumlah minimum yang ditentukan untuk mendapatkan diskon';
    default:
      return 'Pilih produk yang ingin ditambahkan';
  }
};

const getSelectedProductIds = (): string[] => {
  switch (productSelectorType.value) {
    case 'BUNDLE':
      return discountForm.value.bundleProducts;
    case 'PRODUCT_BASED':
    case 'QUANTITY_BASED':
      return discountForm.value.applicableProducts;
    default:
      return [];
  }
};

const handleProductSelectorConfirm = (productIds: string[]) => {
  switch (productSelectorType.value) {
    case 'BUNDLE':
      discountForm.value.bundleProducts = productIds;
      // Reset bundle discount product if not in selected products
      if (discountForm.value.bundleDiscountProduct && !productIds.includes(discountForm.value.bundleDiscountProduct)) {
        discountForm.value.bundleDiscountProduct = '';
      }
      break;
    case 'PRODUCT_BASED':
    case 'QUANTITY_BASED':
      discountForm.value.applicableProducts = productIds;
      break;
  }
  showProductSelector.value = false;
};

const handleProductSelectionTypeChange = () => {
  // Reset selections when selection type changes
  if (productSelectionType.value === 'CATEGORY') {
    discountForm.value.applicableProducts = [];
    selectedCategory.value = '';
  }
};

const handleCategoryChange = () => {
  // For QUANTITY_BASED with category, load products and filter by category
  if (selectedCategory.value && discountForm.value.discountType === 'QUANTITY_BASED') {
    if (availableProducts.value.length === 0) {
      loadProducts();
    }
    // Wait for products to load, then filter
    setTimeout(() => {
      const categoryProducts = availableProducts.value
        .filter((p: any) => p.category === selectedCategory.value)
        .map((p: any) => p.id);
      discountForm.value.applicableProducts = categoryProducts;
    }, 100);
  } else if (!selectedCategory.value) {
    discountForm.value.applicableProducts = [];
  }
};

const loadDiscounts = async () => {
  if (needsTenantSelection.value) {
    return;
  }

  loading.value = true;
  try {
    const response = await api.get('/discounts');
    discounts.value = response.data.data || [];
  } catch (error: any) {
    console.error('Error loading discounts:', error);
    await showError(error.response?.data?.message || 'Gagal memuat diskon');
  } finally {
    loading.value = false;
  }
};

const editDiscount = async (discount: any) => {
  editingDiscount.value = discount;
  discountForm.value = {
    name: discount.name,
    discountType: discount.discountType,
    discountValue: Number(discount.discountValue),
    discountValueType: discount.discountValueType,
    minAmount: discount.minAmount ? Number(discount.minAmount) : undefined,
    minQuantity: discount.minQuantity || undefined,
    applicableProducts: Array.isArray(discount.applicableProducts) ? discount.applicableProducts : [],
    bundleProducts: Array.isArray(discount.bundleProducts) ? discount.bundleProducts : [],
    bundleDiscountProduct: discount.bundleDiscountProduct || '',
    applicableTo: discount.applicableTo || 'ALL',
    isActive: discount.isActive,
    startDate: discount.startDate ? new Date(discount.startDate).toISOString().slice(0, 16) : '',
    endDate: discount.endDate ? new Date(discount.endDate).toISOString().slice(0, 16) : '',
  };
  
  // Determine product selection type based on existing data
  if (discount.discountType === 'BUNDLE' || discount.discountType === 'PRODUCT_BASED' || discount.discountType === 'QUANTITY_BASED') {
    if (discount.discountType === 'BUNDLE' && discount.bundleProducts && discount.bundleProducts.length > 0) {
      productSelectionType.value = 'PRODUCTS';
    } else if (discount.applicableProducts && discount.applicableProducts.length > 0) {
      productSelectionType.value = 'PRODUCTS';
    } else {
      productSelectionType.value = 'ALL';
    }
  }
  
  // Load products if needed for editing
  if (productSelectionType.value === 'PRODUCTS' && availableProducts.value.length === 0) {
    await loadProducts();
  }
  
  showCreateModal.value = true;
};

const saveDiscount = async () => {
  try {
    // Prepare data based on product selection type
    let applicableProductsData: string[] | null = null;
    let bundleProductsData: string[] | null = null;
    
    if (discountForm.value.discountType === 'BUNDLE') {
      if (productSelectionType.value === 'ALL') {
        bundleProductsData = null; // All products
      } else if (productSelectionType.value === 'CATEGORY' && selectedCategory.value) {
        bundleProductsData = discountForm.value.bundleProducts;
      } else if (productSelectionType.value === 'PRODUCTS') {
        bundleProductsData = discountForm.value.bundleProducts.length > 0 ? discountForm.value.bundleProducts : null;
      }
    } else if (discountForm.value.discountType === 'PRODUCT_BASED' || discountForm.value.discountType === 'QUANTITY_BASED') {
      if (productSelectionType.value === 'ALL') {
        applicableProductsData = null; // All products
      } else if (productSelectionType.value === 'CATEGORY' && selectedCategory.value) {
        applicableProductsData = discountForm.value.applicableProducts;
      } else if (productSelectionType.value === 'PRODUCTS') {
        applicableProductsData = discountForm.value.applicableProducts.length > 0 ? discountForm.value.applicableProducts : null;
      }
    }
    
    const data = {
      ...discountForm.value,
      applicableProducts: applicableProductsData,
      bundleProducts: bundleProductsData,
      startDate: discountForm.value.startDate || undefined,
      endDate: discountForm.value.endDate || undefined,
    };

    if (editingDiscount.value) {
      await api.put(`/discounts/${editingDiscount.value.id}`, data);
      await showSuccess('Diskon berhasil diupdate');
    } else {
      await api.post('/discounts', data);
      await showSuccess('Diskon berhasil ditambahkan');
    }

    closeModal();
    await loadDiscounts();
  } catch (error: any) {
    console.error('Error saving discount:', error);
    await showError(error.response?.data?.message || 'Gagal menyimpan diskon');
  }
};

const deleteDiscount = async (id: string) => {
  const confirmed = await showConfirm('Apakah Anda yakin ingin menghapus diskon ini?', 'Hapus Diskon');
  if (!confirmed) return;

  try {
    await api.delete(`/discounts/${id}`);
    await showSuccess('Diskon berhasil dihapus');
    await loadDiscounts();
  } catch (error: any) {
    console.error('Error deleting discount:', error);
    await showError(error.response?.data?.message || 'Gagal menghapus diskon');
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  editingDiscount.value = null;
  discountForm.value = {
    name: '',
    discountType: 'AMOUNT_BASED',
    discountValue: 0,
    discountValueType: 'PERCENTAGE',
    minAmount: undefined,
    minQuantity: undefined,
    applicableProducts: [],
    bundleProducts: [],
    bundleDiscountProduct: '',
    isActive: true,
    startDate: '',
    endDate: '',
  };
  productSelectionType.value = 'ALL';
  selectedCategory.value = '';
};

const handleTenantChange = (tenantId: string | null) => {
  if (tenantId && !needsTenantSelection.value) {
    loadDiscounts();
  }
};

const handleSearchFocus = () => {
  // No-op, just for compatibility
};

const handleSearchInput = () => {
  // Search is handled by computed property
};

onMounted(async () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // For super admin, ensure selectedTenantId is synced with localStorage
  if (authStore.isSuperAdmin) {
    const storedTenantId = localStorage.getItem('selectedTenantId');
    if (storedTenantId && storedTenantId !== authStore.selectedTenantId) {
      authStore.setSelectedTenant(storedTenantId);
    }
  }
  
  if (!needsTenantSelection.value) {
    await loadDiscounts();
    // Preload products for discount form
    await loadProducts();
  }
});
</script>

