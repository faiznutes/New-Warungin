<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
    <!-- Orientation Warning (Portrait) -->
    <div
      v-if="isPortrait"
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-8 text-center max-w-md mx-4">
        <svg class="w-16 h-16 mx-auto mb-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Putar Perangkat</h2>
        <p class="text-gray-600 mb-4">Mode Kasir Sederhana memerlukan orientasi landscape (mendatar)</p>
        <p class="text-sm text-gray-500">Silakan putar perangkat Anda ke posisi landscape</p>
      </div>
    </div>

    <!-- Main Content (only visible in landscape) -->
    <div v-if="!isPortrait" class="h-screen flex flex-col">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-md p-4 mb-4">
        <h1 class="text-3xl font-bold text-gray-900 text-center">KASIR SEDERHANA</h1>
        <p class="text-center text-gray-600 mt-1">{{ new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
      </div>

      <div class="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
        <!-- Left: Categories (3-5 besar) -->
        <div class="bg-white rounded-lg shadow-md p-4 overflow-y-auto">
          <h2 class="text-xl font-bold text-gray-900 mb-4 text-center">KATEGORI</h2>
          <div class="space-y-3">
            <button
              v-for="category in categories"
              :key="category"
              @click="selectedCategory = category"
              class="w-full py-6 px-4 text-lg font-bold rounded-lg transition-all"
              :class="selectedCategory === category 
                ? 'bg-blue-600 text-white shadow-lg scale-105' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'"
            >
              {{ category || 'SEMUA' }}
            </button>
          </div>
        </div>

        <!-- Center: Products (Big Buttons) -->
        <div class="bg-white rounded-lg shadow-md p-4 overflow-y-auto">
          <h2 class="text-xl font-bold text-gray-900 mb-4 text-center">PRODUK</h2>
          <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div v-else-if="filteredProducts.length === 0" class="text-center py-12 text-gray-500">
            <p>Tidak ada produk</p>
          </div>
          <div v-else class="grid grid-cols-2 gap-3">
            <button
              v-for="product in filteredProducts"
              :key="product.id"
              @click="addToCart(product)"
              :disabled="product.stock <= 0"
              class="py-8 px-4 text-lg font-bold rounded-lg transition-all active:scale-95"
              :class="product.stock <= 0 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : isInCart(product.id)
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md'"
            >
              <div class="text-3xl mb-2">{{ product.emoji || '📦' }}</div>
              <div class="text-sm font-semibold">{{ product.name }}</div>
              <div class="text-xs mt-1 opacity-90">{{ formatCurrency(product.price) }}</div>
              <div v-if="product.stock <= 0" class="text-xs mt-1 text-red-200">HABIS</div>
            </button>
          </div>
        </div>

        <!-- Right: Cart & Payment -->
        <div class="bg-white rounded-lg shadow-md p-4 flex flex-col">
          <h2 class="text-xl font-bold text-gray-900 mb-4 text-center">KERANJANG</h2>
          
          <!-- Cart Items -->
          <div class="flex-1 overflow-y-auto mb-4 space-y-2">
            <div
              v-for="item in cart"
              :key="item.id"
              class="bg-gray-50 rounded-lg p-3 flex items-center justify-between"
            >
              <div class="flex-1">
                <p class="font-semibold text-gray-900">{{ item.name }}</p>
                <p class="text-sm text-gray-600">{{ formatCurrency(item.price) }} x {{ item.quantity }}</p>
              </div>
              <div class="flex items-center space-x-2">
                <button
                  @click="decreaseQuantity(item.id)"
                  class="w-8 h-8 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600"
                >
                  -
                </button>
                <span class="w-8 text-center font-bold">{{ item.quantity }}</span>
                <button
                  @click="increaseQuantity(item.id)"
                  class="w-8 h-8 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600"
                >
                  +
                </button>
                <button
                  @click="removeFromCart(item.id)"
                  class="w-8 h-8 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 ml-2"
                  title="Hapus"
                >
                  ×
                </button>
              </div>
            </div>
            <div v-if="cart.length === 0" class="text-center py-12 text-gray-400">
              <p>Keranjang kosong</p>
            </div>
          </div>

          <!-- Total -->
          <div class="border-t-2 border-gray-300 pt-4 mb-4">
            <div class="flex justify-between items-center mb-2">
              <span class="text-xl font-bold text-gray-700">TOTAL:</span>
              <span class="text-2xl font-bold text-blue-600">{{ formatCurrency(total) }}</span>
            </div>
          </div>

          <!-- Quick Discount -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Diskon Cepat</label>
            <div class="flex space-x-2">
              <input
                v-model.number="quickDiscount"
                type="number"
                min="0"
                placeholder="0"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-lg"
              />
              <select
                v-model="discountType"
                class="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="amount">Rp</option>
                <option value="percent">%</option>
              </select>
            </div>
          </div>

          <!-- Payment Buttons -->
          <div class="space-y-3">
            <button
              @click="processPayment('CASH')"
              :disabled="cart.length === 0 || processing"
              class="w-full py-6 bg-green-600 text-white rounded-lg font-bold text-xl hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              💵 TUNAI
            </button>
            <button
              @click="processPayment('QRIS')"
              :disabled="cart.length === 0 || processing"
              class="w-full py-6 bg-blue-600 text-white rounded-lg font-bold text-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📱 QRIS
            </button>
            <button
              @click="clearCart"
              :disabled="cart.length === 0"
              class="w-full py-4 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              HAPUS SEMUA
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import api from '../../api';
import { formatCurrency } from '../../utils/formatters';
import { useAuthStore } from '../../stores/auth';
import { useNotification } from '../../composables/useNotification';

const authStore = useAuthStore();
const { success: showSuccess, error: showError } = useNotification();

const isPortrait = ref(false);
const products = ref<any[]>([]);
const cart = ref<Array<{ id: string; name: string; price: number; quantity: number }>>([]);
const loading = ref(false);
const processing = ref(false);
const selectedCategory = ref<string>('');
const quickDiscount = ref<number>(0);
const discountType = ref<'amount' | 'percent'>('amount');

const categories = computed(() => {
  const cats = new Set(products.value.map(p => p.category).filter(Boolean));
  return ['SEMUA', ...Array.from(cats)];
});

const filteredProducts = computed(() => {
  let filtered = products.value.filter(p => p.isActive && p.stock > 0);
  if (selectedCategory.value && selectedCategory.value !== 'SEMUA') {
    filtered = filtered.filter(p => p.category === selectedCategory.value);
  }
  return filtered;
});

const subtotal = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

const discount = computed(() => {
  if (quickDiscount.value <= 0) return 0;
  if (discountType.value === 'percent') {
    return (subtotal.value * quickDiscount.value) / 100;
  }
  return Math.min(quickDiscount.value, subtotal.value);
});

const total = computed(() => {
  return Math.max(0, subtotal.value - discount.value);
});

const checkOrientation = () => {
  isPortrait.value = window.innerHeight > window.innerWidth;
};

const loadProducts = async () => {
  if (authStore.isSuperAdmin && !authStore.selectedTenantId) {
    const selectedTenantId = localStorage.getItem('selectedTenantId');
    if (!selectedTenantId) return;
    authStore.setSelectedTenant(selectedTenantId);
  }

  loading.value = true;
  try {
    const response = await api.get('/products', {
      params: { isActive: true },
    });
    products.value = response.data.data || response.data;
  } catch (error: any) {
    showError('Gagal memuat produk');
  } finally {
    loading.value = false;
  }
};

const isInCart = (productId: string) => {
  return cart.value.some(item => item.id === productId);
};

const addToCart = async (product: any) => {
  if (product.stock <= 0) return;

  try {
    const response = await api.get(`/products/${product.id}`);
    const updatedProduct = response.data;
    
    if (updatedProduct.stock <= 0) {
      showError('Stok produk habis');
      return;
    }

    const existingItem = cart.value.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity >= updatedProduct.stock) {
        showError('Stok tidak mencukupi');
        return;
      }
      existingItem.quantity++;
    } else {
      cart.value.push({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: 1,
      });
    }
  } catch (error: any) {
    showError('Gagal menambahkan produk');
  }
};

const increaseQuantity = (productId: string) => {
  const item = cart.value.find(item => item.id === productId);
  if (item) {
    const product = products.value.find(p => p.id === productId);
    if (product && item.quantity < product.stock) {
      item.quantity++;
    } else {
      showError('Stok tidak mencukupi');
    }
  }
};

const decreaseQuantity = (productId: string) => {
  const item = cart.value.find(item => item.id === productId);
  if (item && item.quantity > 1) {
    item.quantity--;
  } else if (item) {
    removeFromCart(productId);
  }
};

const removeFromCart = (productId: string) => {
  cart.value = cart.value.filter(item => item.id !== productId);
};

const clearCart = () => {
  cart.value = [];
  quickDiscount.value = 0;
};

const processPayment = async (paymentMethod: string) => {
  if (cart.value.length === 0) return;

  processing.value = true;
  try {
    // Create order
    const orderData: any = {
      items: cart.value.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
      discount: discount.value,
    };

    if (authStore.selectedStoreId) {
      orderData.outletId = authStore.selectedStoreId;
    }

    const orderResponse = await api.post('/orders', orderData);
    const order = orderResponse.data;

    // Create transaction
    const transactionData: any = {
      orderId: order.id,
      amount: total.value,
      paymentMethod,
      status: 'COMPLETED',
      servedBy: authStore.user?.name || 'Kasir',
    };

    await api.post('/transactions', transactionData);

    showSuccess('Pembayaran berhasil!');
    clearCart();
    await loadProducts();
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal memproses pembayaran');
  } finally {
    processing.value = false;
  }
};

onMounted(() => {
  checkOrientation();
  window.addEventListener('resize', checkOrientation);
  window.addEventListener('orientationchange', checkOrientation);
  loadProducts();
});

onUnmounted(() => {
  window.removeEventListener('resize', checkOrientation);
  window.removeEventListener('orientationchange', checkOrientation);
});
</script>

<style scoped>
/* Force landscape orientation */
@media (orientation: portrait) {
  body {
    overflow: hidden;
  }
}
</style>
