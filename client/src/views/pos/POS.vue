<template>
  <div class="flex flex-col h-full bg-gray-50">
    <!-- Store Selector (only for Admin/Supervisor) -->
    <div
      v-if="authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN' || authStore.user?.role === 'SUPERVISOR'"
      class="px-3 pt-3"
    >
      <StoreSelector @store-changed="handleStoreChange" />
    </div>
    
    <!-- Header Section - Compact -->
    <div class="px-3 pt-3 pb-2 border-b border-gray-200 bg-white">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">
            Point of Sale
          </h2>
          <p class="text-xs text-gray-500 mt-0.5">
            Pilih produk dan lakukan transaksi
          </p>
        </div>
        <div class="text-right">
          <div class="text-xs text-gray-500">
            Total Item
          </div>
          <div class="text-sm font-semibold text-gray-900">
            {{ cart.length }}
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-3 h-full px-3 py-3 overflow-hidden">
      <!-- Product Grid - Optimized for Tablet/PC -->
      <div class="flex-1 bg-white rounded-lg border border-gray-200 p-3 overflow-y-auto">
        <!-- Search Section - Compact -->
        <div class="mb-3">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <svg
                class="h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari produk..."
              class="block w-full pl-8 pr-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-white transition"
            />
          </div>
        </div>

        <div
          v-if="loading"
          class="flex items-center justify-center py-12"
        >
          <div class="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div
          v-else-if="filteredProducts.length === 0"
          class="text-center py-12 text-gray-500"
        >
          <p class="text-sm">
            Tidak ada produk ditemukan
          </p>
        </div>

        <!-- Product Grid - Optimized Grid -->
        <div
          v-else
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5"
        >
          <div
            v-for="product in filteredProducts"
            :key="product.id"
            class="bg-white border rounded-lg p-2.5 cursor-pointer hover:border-primary-400 hover:shadow-sm transition-all active:scale-[0.98] group"
            :class="{ 'border-primary-500 bg-primary-50/50 shadow-sm': isInCart(product.id), 'border-gray-200': !isInCart(product.id) }"
            @click="addToCart(product)"
          >
            <div class="text-center">
              <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-lg mx-auto mb-2 flex items-center justify-center overflow-hidden">
                <img
                  v-if="product.image"
                  :src="product.image"
                  :alt="product.name"
                  class="w-full h-full object-cover"
                />
                <span
                  v-else-if="product.emoji"
                  class="text-2xl sm:text-3xl"
                >{{ product.emoji }}</span>
                <span
                  v-else
                  class="text-xl"
                >📦</span>
              </div>
              <h3 class="font-medium text-xs text-gray-900 mb-1 line-clamp-2 leading-tight min-h-[2.5rem]">
                {{ product.name }}
              </h3>
              <p class="text-sm font-semibold text-primary-600 mb-1">
                {{ formatCurrency(product.price) }}
              </p>
              <p class="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded inline-block">
                Stok: {{ product.stock }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Cart Sidebar - Compact & Efficient -->
      <div class="w-full lg:w-80 xl:w-96 bg-white rounded-lg border border-gray-200 p-3 flex flex-col overflow-hidden">
        <div class="mb-3 pb-2 border-b border-gray-200">
          <h2 class="text-base font-semibold text-gray-900">
            Keranjang
          </h2>
          <p class="text-xs text-gray-500 mt-0.5">
            {{ cart.length }} item
          </p>
        </div>

        <div class="flex-1 overflow-y-auto mb-3 space-y-2">
          <div
            v-if="cart.length === 0"
            class="text-center py-8 text-gray-400"
          >
            <svg
              class="w-12 h-12 mx-auto mb-2 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <p class="text-sm">
              Keranjang kosong
            </p>
          </div>

          <div
            v-for="item in cart"
            :key="item.id"
            class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-300 transition"
          >
            <div class="w-10 h-10 bg-gray-200 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img
                v-if="item.image"
                :src="item.image"
                :alt="item.name"
                class="w-full h-full object-cover"
              />
              <span
                v-else-if="item.emoji"
                class="text-lg"
              >{{ item.emoji }}</span>
              <span
                v-else
                class="text-sm"
              >📦</span>
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-medium text-sm text-gray-900 truncate">
                {{ item.name }}
              </h4>
              <p class="text-xs text-gray-600">
                {{ formatCurrency(item.price) }} × {{ item.quantity }}
              </p>
            </div>
            <div class="flex items-center gap-1">
              <button
                class="w-6 h-6 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 transition text-xs font-semibold text-gray-700"
                @click="decreaseQuantity(item.id)"
              >
                −
              </button>
              <span class="w-8 text-center text-xs font-semibold text-gray-900">{{ item.quantity }}</span>
              <button
                class="w-6 h-6 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 transition text-xs font-semibold text-gray-700"
                @click="increaseQuantity(item.id)"
              >
                +
              </button>
              <button
                class="ml-1 p-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                @click="removeFromCart(item.id)"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Customer/Member Info - Compact -->
        <div class="mb-3 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
          <p class="text-xs font-medium text-gray-700 mb-2">
            Tipe Pelanggan
          </p>
          <div class="flex gap-1.5 mb-2">
            <button
              :class="[
                'flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-all',
                customerType === 'customer'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-primary-300'
              ]"
              @click="switchCustomerType('customer')"
            >
              Pelanggan
            </button>
            <button
              :class="[
                'flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-all',
                customerType === 'member'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-primary-300'
              ]"
              @click="switchCustomerType('member')"
            >
              Member
            </button>
          </div>
          
          <!-- Customer Input -->
          <div
            v-if="customerType === 'customer'"
            class="flex gap-1.5"
          >
            <input
              v-model="customerInput"
              type="text"
              placeholder="Nama pelanggan (opsional)"
              class="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-white"
              @blur="handleCustomerInput"
            />
            <button
              v-if="customerInput"
              class="px-2 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition text-xs font-medium"
              @click="clearCustomer"
            >
              ✕
            </button>
          </div>

          <!-- Member Select -->
          <div
            v-else
            class="flex gap-1.5"
          >
            <select
              v-model="selectedMemberId"
              class="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-white"
              @change="handleMemberSelect"
            >
              <option value="">
                -- Pilih Member --
              </option>
              <option
                v-for="member in members"
                :key="member.id"
                :value="member.id"
              >
                {{ member.name }} ({{ member.phone }}){{ member.discountType && member.discountValue ? ` - ${member.discountType === 'PERCENTAGE' ? member.discountValue + '%' : formatCurrency(member.discountValue)}` : '' }}
              </option>
            </select>
            <button
              v-if="selectedMember"
              class="px-2 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition text-xs font-medium"
              @click="clearCustomer"
            >
              ✕
            </button>
          </div>

          <div
            v-if="selectedMember"
            class="mt-2 p-2 bg-green-50 rounded border border-green-200"
          >
            <div class="flex items-center gap-1.5 text-xs text-green-800">
              <svg
                class="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span class="font-medium">Member: {{ selectedMember.name }}</span>
              <span
                v-if="selectedMember.discountType && selectedMember.discountValue"
                class="text-green-700"
              >
                ({{ selectedMember.discountType === 'PERCENTAGE' ? selectedMember.discountValue + '%' : formatCurrency(selectedMember.discountValue) }})
              </span>
            </div>
          </div>
          <div
            v-else-if="customerType === 'customer' && customerName"
            class="mt-2 p-2 bg-blue-50 rounded border border-blue-200"
          >
            <div class="flex items-center gap-1.5 text-xs text-blue-800">
              <svg
                class="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span class="font-medium">Pelanggan: {{ customerName }}</span>
            </div>
          </div>
        </div>

        <!-- Send to Kitchen - Compact -->
        <div class="mb-3">
          <label class="flex items-center space-x-2 cursor-pointer">
            <input
              v-model="sendToKitchen"
              type="checkbox"
              class="w-3.5 h-3.5 text-primary-600 rounded focus:ring-primary-500"
            />
            <span class="text-xs text-gray-700">Kirim ke dapur</span>
          </label>
        </div>

        <!-- Total - Compact -->
        <div class="mb-3 p-2.5 bg-primary-50 rounded-lg border border-primary-200">
          <div class="flex justify-between items-center mb-1.5 pb-1.5 border-b border-primary-200">
            <span class="text-xs text-gray-700 font-medium">Subtotal:</span>
            <span class="text-xs font-semibold text-gray-900">{{ formatCurrency(subtotal) }}</span>
          </div>
          <div
            v-if="estimatedDiscount > 0"
            class="flex justify-between items-center mb-1.5 pb-1.5 border-b border-primary-200"
          >
            <span class="text-xs text-green-700 font-medium">Diskon:</span>
            <span class="text-xs font-semibold text-green-700">-{{ formatCurrency(estimatedDiscount) }}</span>
          </div>
          <div class="flex justify-between items-center pt-1.5">
            <span class="text-sm font-bold text-gray-900">Total:</span>
            <span class="text-base font-bold text-primary-600">{{ formatCurrency(total) }}</span>
          </div>
        </div>

        <!-- Actions - Compact Buttons -->
        <div class="space-y-2">
          <button
            :disabled="cart.length === 0 || processing"
            class="w-full px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
            @click="showPaymentModal = true"
          >
            <svg
              v-if="!processing"
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span
              v-if="processing"
              class="flex items-center gap-2"
            >
              <div class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Memproses...
            </span>
            <span v-else>Bayar</span>
          </button>
          <button
            :disabled="cart.length === 0"
            class="w-full px-3 py-1.5 text-xs bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            @click="clearCart"
          >
            Hapus Semua
          </button>
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <PaymentModal
      :show="showPaymentModal"
      :total="total"
      :discount="estimatedDiscount"
      :processing="processing"
      @close="showPaymentModal = false"
      @confirm="handlePaymentConfirm"
    />

    <!-- Receipt Printer -->
    <ReceiptPrinter
      :show="showReceiptModal"
      :order-id="lastOrderId"
      :receipt-data="lastOrderReceipt"
      @close="showReceiptModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import api from '../../api';
import { formatCurrency } from '../../utils/formatters';
import { useAuthStore } from '../../stores/auth';
import { useSocket } from '../../composables/useSocket';
import { useNotification } from '../../composables/useNotification';
import PaymentModal from '../../components/PaymentModal.vue';
import ReceiptPrinter from '../../components/ReceiptPrinter.vue';
import StoreSelector from '../../components/StoreSelector.vue';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  emoji?: string;
}

const authStore = useAuthStore();
const { socket } = useSocket();
const { error: showError, warning: showWarning, confirm: showConfirm } = useNotification();
const products = ref<any[]>([]);
const cart = ref<CartItem[]>([]);
const loading = ref(false);
const processing = ref(false);
const searchQuery = ref('');
const customerType = ref<'customer' | 'member'>('customer');
const customerInput = ref('');
const customerName = ref('');
const selectedMember = ref<any>(null);
const selectedMemberId = ref<string>('');
const members = ref<any[]>([]);
const sendToKitchen = ref(false);
const showPaymentModal = ref(false);
const showReceiptModal = ref(false);
const selectedPaymentMethod = ref<string>('CASH');
const lastOrderReceipt = ref<any>(null);
const lastOrderId = ref<string | undefined>(undefined);
const estimatedDiscount = ref(0);

const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value.filter(p => p.isActive && p.stock > 0);
  const query = searchQuery.value.toLowerCase();
  return products.value.filter(
    p => p.isActive && p.stock > 0 && (p.name.toLowerCase().includes(query) || p.category?.toLowerCase().includes(query))
  );
});

const subtotal = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

const total = computed(() => {
  return Math.max(0, subtotal.value - estimatedDiscount.value);
});

const isInCart = (productId: string) => {
  return cart.value.some(item => item.id === productId);
};

const addToCart = async (product: any) => {
  // Refresh product stock dari database sebelum add to cart
  try {
    const response = await api.get(`/products/${product.id}`);
    const updatedProduct = response.data;
    
    if (updatedProduct.stock <= 0) {
      showError('Stok produk habis', 'Stok Tidak Tersedia');
      // Update local product data
      const productIndex = products.value.findIndex(p => p.id === product.id);
      if (productIndex !== -1) {
        products.value[productIndex].stock = updatedProduct.stock;
      }
      return;
    }

    const existingItem = cart.value.find(item => item.id === product.id);
    if (existingItem) {
      // Check stock dari database
      if (existingItem.quantity >= updatedProduct.stock) {
        await showWarning('Stok tidak mencukupi');
        // Update local product data
        const productIndex = products.value.findIndex(p => p.id === product.id);
        if (productIndex !== -1) {
          products.value[productIndex].stock = updatedProduct.stock;
        }
        return;
      }
      existingItem.quantity++;
    } else {
      cart.value.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
        emoji: product.emoji,
      });
    }
    
    // Update local product stock setelah add to cart
    const productIndex = products.value.findIndex(p => p.id === product.id);
    if (productIndex !== -1) {
      products.value[productIndex].stock = updatedProduct.stock;
    }
  } catch (error: any) {
    // Fallback to local check if API fails
    if (product.stock <= 0) {
      await showWarning('Stok produk habis');
      return;
    }
    const existingItem = cart.value.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        await showWarning('Stok tidak mencukupi');
        return;
      }
      existingItem.quantity++;
    } else {
      cart.value.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
        emoji: product.emoji,
      });
    }
  }
};

const increaseQuantity = async (productId: string) => {
  const item = cart.value.find(item => item.id === productId);
  if (item) {
    // Check stock dari database
    try {
      const response = await api.get(`/products/${productId}`);
      const updatedProduct = response.data;
      
      if (item.quantity >= updatedProduct.stock) {
        showError('Stok tidak mencukupi', 'Stok Tidak Tersedia');
        // Update local product data
        const productIndex = products.value.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
          products.value[productIndex].stock = updatedProduct.stock;
        }
        return;
      }
      item.quantity++;
      
      // Update local product stock
      const productIndex = products.value.findIndex(p => p.id === productId);
      if (productIndex !== -1) {
        products.value[productIndex].stock = updatedProduct.stock;
      }
    } catch (error: any) {
      // Fallback to local check
      const product = products.value.find(p => p.id === productId);
      if (product && item.quantity >= product.stock) {
        showError('Stok tidak mencukupi', 'Stok Tidak Tersedia');
        return;
      }
      item.quantity++;
    }
  }
};

const decreaseQuantity = (productId: string) => {
  const item = cart.value.find(item => item.id === productId);
  if (item) {
    if (item.quantity > 1) {
      item.quantity--;
    } else {
      removeFromCart(productId);
    }
  }
};

const removeFromCart = (productId: string) => {
  cart.value = cart.value.filter(item => item.id !== productId);
};

const clearCart = async () => {
  const confirmed = await showConfirm('Hapus semua item dari keranjang?');
  if (confirmed) {
    clearCartSilent();
  }
};

const clearCartSilent = () => {
  cart.value = [];
  customerInput.value = '';
  customerName.value = '';
  selectedMember.value = null;
  selectedMemberId.value = '';
  estimatedDiscount.value = 0;
  customerType.value = 'customer';
  sendToKitchen.value = false;
};

const handleCustomerInput = async () => {
  if (!customerInput.value.trim()) {
    customerName.value = '';
    return;
  }
  // Set as regular customer name
  customerName.value = customerInput.value.trim();
  selectedMember.value = null;
  estimatedDiscount.value = 0;
};

const handleMemberSelect = () => {
  if (!selectedMemberId.value) {
    selectedMember.value = null;
    estimatedDiscount.value = 0;
    return;
  }

  const member = members.value.find(m => m.id === selectedMemberId.value);
  if (member) {
    selectedMember.value = member;
    customerName.value = ''; // Clear customer name when member is selected
    // Calculate estimated member discount
    if (member.discountType === 'PERCENTAGE') {
      estimatedDiscount.value = (subtotal.value * Number(member.discountValue)) / 100;
    } else {
      estimatedDiscount.value = Number(member.discountValue);
    }
  } else {
    selectedMember.value = null;
    estimatedDiscount.value = 0;
  }
};

const switchCustomerType = (type: 'customer' | 'member') => {
  if (customerType.value === type) return;
  
  // Clear previous data when switching
  customerInput.value = '';
  customerName.value = '';
  selectedMember.value = null;
  selectedMemberId.value = '';
  estimatedDiscount.value = 0;
  customerType.value = type;
};

const clearCustomer = () => {
  customerInput.value = '';
  customerName.value = '';
  selectedMember.value = null;
  selectedMemberId.value = '';
  estimatedDiscount.value = 0;
};

const handleStoreChange = (_storeId: string | null) => {
  // Reload products when store changes
  loadProducts();
  loadMembers();
};

const loadProducts = async () => {
  // For Super Admin, wait for tenantId to be available
  if (authStore.isSuperAdmin && !authStore.selectedTenantId) {
    const selectedTenantId = localStorage.getItem('selectedTenantId');
    if (!selectedTenantId) {
    // Waiting for tenant selection
    return;
    }
    // Ensure authStore has the selected tenant
    authStore.setSelectedTenant(selectedTenantId);
  }

  loading.value = true;
  try {
    const response = await api.get('/products', {
      params: { isActive: true },
    });
    products.value = response.data.data || response.data;
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || 'Gagal memuat produk';
    showError(errorMessage, 'Terjadi Kesalahan');
  } finally {
    loading.value = false;
  }
};

const loadMembers = async () => {
  try {
    const response = await api.get('/members', {
      params: { limit: 100, isActive: 'true' },
    });
    const result = response.data.data || response.data;
    members.value = Array.isArray(result) ? result : [];
  } catch (error: any) {
    members.value = [];
  }
};

const handlePaymentConfirm = async (paymentData: { paymentMethod: string; cashAmount?: number; qrCode?: string }) => {
  selectedPaymentMethod.value = paymentData.paymentMethod;
  showPaymentModal.value = false;
  await processPayment(paymentData);
};

const processPayment = async (paymentData: { paymentMethod: string; cashAmount?: number; qrCode?: string }) => {
  if (cart.value.length === 0) return;

  processing.value = true;
  try {
    // Create order first
    const orderData: any = {
      items: cart.value.map(item => ({
        productId: item.id,
        quantity: Number(item.quantity),
        price: Number(item.price),
      })),
      sendToKitchen: Boolean(sendToKitchen.value),
      discount: 0,
    };

    // Add outletId if selected
    if (authStore.selectedStoreId) {
      orderData.outletId = authStore.selectedStoreId;
    }

    // Add customer/member info only if provided
    if (customerType.value === 'customer' && customerName.value?.trim()) {
      orderData.temporaryCustomerName = customerName.value.trim();
    }
    
    if (customerType.value === 'member' && selectedMember.value?.id) {
      orderData.memberId = selectedMember.value.id;
    }

    const orderResponse = await api.post('/orders', orderData);
    const order = orderResponse.data;
    
    // Update estimated discount from order response
    const orderDiscount = parseFloat(order.discount || 0);
    estimatedDiscount.value = orderDiscount;

    // Process payment
    const finalTotal = parseFloat(order.total);
    
    // Create transaction for all payment methods (CASH, QRIS, BANK_TRANSFER, SHOPEEPAY, DANA)
    const transactionData: any = {
      orderId: order.id,
      amount: finalTotal,
      paymentMethod: paymentData.paymentMethod,
      status: 'COMPLETED',
      servedBy: authStore.user?.name || 'Unknown',
    };
    
    if (paymentData.paymentMethod === 'QRIS' && paymentData.qrCode) {
      transactionData.qrCode = paymentData.qrCode;
    }
    
    const transactionResponse = await api.post('/transactions', transactionData);
    const transaction = transactionResponse.data;

    // Prepare receipt data
    const receiptData = {
      orderNumber: order.orderNumber,
      date: order.createdAt,
      customerName: customerName.value || null,
      memberName: selectedMember.value?.name || null,
      items: cart.value.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      })),
      subtotal: parseFloat(order.subtotal),
      discount: orderDiscount,
      total: finalTotal,
      paymentMethod: paymentData.paymentMethod,
      cashAmount: paymentData.cashAmount,
      change: paymentData.paymentMethod === 'CASH' && paymentData.cashAmount 
        ? paymentData.cashAmount - finalTotal 
        : 0,
      servedBy: transaction?.servedBy || authStore.user?.name || 'Unknown',
    };

    lastOrderId.value = order.id;
    lastOrderReceipt.value = receiptData;

    // Emit socket event for kitchen if needed
    if (sendToKitchen.value && socket?.connected) {
      socket.emit('order:new', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        items: cart.value,
      });
    }

    // Show receipt printer
    showReceiptModal.value = true;
    
    // Auto clear cart tanpa confirm
    clearCartSilent();
    
    // Refresh products untuk update stock
    await loadProducts();
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Gagal memproses pembayaran';
    showError(errorMessage, 'Gagal Memproses Pembayaran');
  } finally {
    processing.value = false;
  }
};

// Watch for tenantId changes (for Super Admin using Tenant Support)
watch(
  () => {
    // Get tenantId from multiple sources
    const fromStore = authStore.selectedTenantId;
    const fromStorage = localStorage.getItem('selectedTenantId');
    return fromStore || fromStorage;
  },
  (newTenantId, oldTenantId) => {
    // Only reload if tenantId actually changed and is not empty
    if (authStore.isSuperAdmin && newTenantId && newTenantId !== oldTenantId) {
      // Ensure authStore has the selected tenant
      if (!authStore.selectedTenantId) {
        authStore.setSelectedTenant(newTenantId);
      }
      
      // Reload products when tenant changes
      loadProducts();
      loadMembers();
      
      // Join tenant room for socket updates
      if (socket?.connected) {
        socket.emit('join-tenant', newTenantId);
      }
    }
  },
  { immediate: false }
);

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // For Super Admin, check if tenantId is available
  if (authStore.isSuperAdmin) {
    const selectedTenantId = localStorage.getItem('selectedTenantId');
    if (selectedTenantId) {
      authStore.setSelectedTenant(selectedTenantId);
      // Small delay to ensure tenantId is set in interceptor
      setTimeout(() => {
        loadProducts();
        loadMembers();
      }, 100);
    } else {
      // Wait a bit and try again (in case TenantPOS is setting it)
      setTimeout(() => {
        const tenantId = localStorage.getItem('selectedTenantId');
        if (tenantId) {
          authStore.setSelectedTenant(tenantId);
          loadProducts();
          loadMembers();
        }
      }, 500);
    }
  } else {
    // For non-Super Admin, load immediately
    loadProducts();
    loadMembers();
  }
  
  // Join tenant room for socket updates
  // For SUPER_ADMIN, use selectedTenantId; for others, use user.tenantId
  const tenantIdForSocket = authStore.isSuperAdmin 
    ? authStore.selectedTenantId || localStorage.getItem('selectedTenantId') || authStore.user?.tenantId
    : authStore.user?.tenantId;
  if (socket && tenantIdForSocket) {
    socket.emit('join-tenant', tenantIdForSocket);
  }
  
  // Listen for stock updates via socket
  if (socket) {
    socket.on('product:stock-update', (data: { productId: string; stock: number }) => {
      const productIndex = products.value.findIndex(p => p.id === data.productId);
      if (productIndex !== -1) {
        products.value[productIndex].stock = data.stock;
      }
    });
    
    socket.on('order:created', (data: any) => {
      // Only update stock for affected products, don't reload all products
      if (data.orderId && data.items) {
        // Update stock for products in the order
        data.items.forEach((item: any) => {
          const productIndex = products.value.findIndex(p => p.id === item.id || p.id === item.productId);
          if (productIndex !== -1 && item.stock !== undefined) {
            products.value[productIndex].stock = item.stock;
          }
        });
      }
      // Don't reload all products to avoid auto-refresh
    });
  }
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
