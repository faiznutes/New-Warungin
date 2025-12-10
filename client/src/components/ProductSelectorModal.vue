<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    @click.self="handleCancel"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
        <div>
          <h3 class="text-xl font-bold text-gray-900">{{ title }}</h3>
          <p class="text-sm text-gray-500 mt-1">{{ subtitle }}</p>
        </div>
        <button
          @click="handleCancel"
          class="text-gray-400 hover:text-gray-600 transition p-2"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Filters -->
      <div class="p-4 border-b border-gray-200 bg-gray-50">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search -->
          <div class="md:col-span-2">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                v-model="filters.search"
                type="text"
                placeholder="Cari produk..."
                class="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <!-- Category Filter -->
          <div>
            <select
              v-model="filters.category"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Semua Kategori</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>

          <!-- Sort Filter -->
          <div>
            <select
              v-model="filters.sortBy"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="name">Nama A-Z</option>
              <option value="name-desc">Nama Z-A</option>
              <option value="price-asc">Harga: Murah ke Mahal</option>
              <option value="price-desc">Harga: Mahal ke Murah</option>
              <option value="stock">Stok: Banyak ke Sedikit</option>
            </select>
          </div>
        </div>

        <!-- Selected Count -->
        <div class="mt-3 flex items-center justify-between">
          <div class="text-sm text-gray-600">
            <span class="font-medium">{{ selectedProducts.length }}</span> produk dipilih
            <span v-if="filteredProducts.length > 0" class="text-gray-400">
              dari {{ filteredProducts.length }} produk tersedia
            </span>
          </div>
          <button
            v-if="selectedProducts.length > 0"
            @click="clearSelection"
            class="text-sm text-red-600 hover:text-red-700"
          >
            Hapus Semua Pilihan
          </button>
        </div>
      </div>

      <!-- Product List -->
      <div class="flex-1 overflow-y-auto p-4">
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="flex flex-col items-center">
            <div class="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <div class="text-gray-600 font-medium">Memuat produk...</div>
          </div>
        </div>

        <div v-else-if="filteredProducts.length === 0" class="flex flex-col items-center justify-center py-12">
          <svg class="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p class="text-gray-500">Tidak ada produk ditemukan</p>
        </div>

        <div v-else class="space-y-2">
          <label
            v-for="product in filteredProducts"
            :key="product.id"
            class="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-transparent hover:border-gray-200 transition"
            :class="{ 'bg-primary-50 border-primary-200': isSelected(product.id) }"
          >
            <input
              type="checkbox"
              :checked="isSelected(product.id)"
              @change="toggleProduct(product.id)"
              class="mt-1 w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">{{ product.name }}</p>
                  <div class="mt-1 flex items-center gap-3 text-xs text-gray-500">
                    <span v-if="product.category">{{ product.category }}</span>
                    <span class="font-semibold text-primary-600">{{ formatCurrency(product.price) }}</span>
                    <span :class="product.stock > 0 ? 'text-green-600' : 'text-red-600'">
                      Stok: {{ product.stock }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
        <div class="text-sm text-gray-600">
          <span class="font-medium">{{ selectedProducts.length }}</span> produk dipilih
        </div>
        <div class="flex space-x-3">
          <button
            @click="handleCancel"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Batal
          </button>
          <button
            @click="handleConfirm"
            :disabled="selectedProducts.length === 0"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Konfirmasi ({{ selectedProducts.length }})
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import api from '../api';
import { formatCurrency } from '../utils/formatters';

interface Product {
  id: string;
  name: string;
  category?: string;
  price: number;
  stock: number;
}

interface Props {
  show: boolean;
  title?: string;
  subtitle?: string;
  selectedProductIds?: string[];
  allowMultiple?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Pilih Produk',
  subtitle: 'Pilih produk yang ingin ditambahkan',
  selectedProductIds: () => [],
  allowMultiple: true,
});

const emit = defineEmits<{
  confirm: [productIds: string[]];
  cancel: [];
}>();

const products = ref<Product[]>([]);
const loading = ref(false);
const selectedProducts = ref<string[]>([]);

const filters = ref({
  search: '',
  category: '',
  sortBy: 'name',
});

// Initialize selected products from props
watch(() => props.selectedProductIds, (newIds) => {
  selectedProducts.value = [...newIds];
}, { immediate: true });

watch(() => props.show, (newShow) => {
  if (newShow) {
    selectedProducts.value = [...props.selectedProductIds];
    loadProducts();
  }
});

const categories = computed(() => {
  const cats = new Set<string>();
  products.value.forEach(p => {
    if (p.category) cats.add(p.category);
  });
  return Array.from(cats).sort();
});

const filteredProducts = computed(() => {
  let filtered = [...products.value];

  // Search filter
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(search) ||
      (p.category && p.category.toLowerCase().includes(search))
    );
  }

  // Category filter
  if (filters.value.category) {
    filtered = filtered.filter(p => p.category === filters.value.category);
  }

  // Sort
  switch (filters.value.sortBy) {
    case 'name':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      filtered.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'price-asc':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'stock':
      filtered.sort((a, b) => b.stock - a.stock);
      break;
  }

  return filtered;
});

const isSelected = (productId: string): boolean => {
  return selectedProducts.value.includes(productId);
};

const toggleProduct = (productId: string) => {
  if (props.allowMultiple) {
    const index = selectedProducts.value.indexOf(productId);
    if (index > -1) {
      selectedProducts.value.splice(index, 1);
    } else {
      selectedProducts.value.push(productId);
    }
  } else {
    selectedProducts.value = [productId];
  }
};

const clearSelection = () => {
  selectedProducts.value = [];
};

const loadProducts = async () => {
  loading.value = true;
  try {
    const response = await api.get('/products', { params: { limit: 1000, isActive: true } });
    const productsData = response.data.data || response.data;
    products.value = Array.isArray(productsData) ? productsData : [];
  } catch (error: any) {
    console.error('Error loading products:', error);
    products.value = [];
  } finally {
    loading.value = false;
  }
};

const handleConfirm = () => {
  emit('confirm', [...selectedProducts.value]);
};

const handleCancel = () => {
  emit('cancel');
};

onMounted(() => {
  if (props.show) {
    loadProducts();
  }
});
</script>

