<template>
  <div class="flex flex-col gap-6 font-display p-6 lg:p-8 bg-slate-50 min-h-screen">
    <!-- Tenant Selector for Super Admin -->
    <TenantSelector @tenant-changed="handleTenantChange" />
    
    <!-- Store Selector (Only for SUPERVISOR) -->
    <div v-if="authStore.user?.role === 'SUPERVISOR'">
      <StoreSelector @store-changed="handleStoreChange" />
    </div>

    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="flex flex-col gap-1">
        <h1 class="text-3xl font-bold text-slate-900 tracking-tight leading-tight">Orders & Transactions</h1>
        <p class="text-slate-500 font-medium">Manage and track all customer orders.</p>
      </div>
      <div class="flex gap-3">
        <button
          v-if="canDeleteOrders && deletableOrdersCount > 0"
          @click="deleteAllOrders"
          class="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 px-5 py-2.5 rounded-xl transition-all font-bold text-sm border border-red-200"
        >
          <span class="material-symbols-outlined text-[20px]">delete_sweep</span>
          <span>Clear Cancelled</span>
        </button>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-2 flex flex-col xl:flex-row gap-2">
       <!-- Search -->
       <div class="relative flex-1">
          <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            v-model="filters.search"
            @focus="handleSearchFocus"
            @input="handleSearchInput"
            type="text"
            placeholder="Search by Order #..."
            class="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent hover:bg-slate-100 focus:bg-white focus:border-emerald-500 hover:border-slate-200 rounded-xl transition-all outline-none font-medium placeholder:text-slate-400"
          />
       </div>

       <div class="w-px bg-slate-100 mx-2 hidden xl:block"></div>

       <!-- Status Filters -->
       <div class="flex gap-2 p-1 overflow-x-auto no-scrollbar">
          <button
            v-for="status in ['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED']"
            :key="status"
            @click="filters.status = status === 'ALL' ? '' : status"
            class="px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2"
            :class="
              (filters.status === status || (status === 'ALL' && !filters.status))
              ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
              : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-slate-200'
            "
          >
             <span v-if="status === 'PENDING'" class="w-2 h-2 rounded-full bg-yellow-400"></span>
             <span v-if="status === 'PROCESSING'" class="w-2 h-2 rounded-full bg-blue-500"></span>
             <span v-if="status === 'COMPLETED'" class="w-2 h-2 rounded-full bg-emerald-500"></span>
             <span v-if="status === 'CANCELLED'" class="w-2 h-2 rounded-full bg-red-500"></span>
             {{ status === 'ALL' ? 'All Orders' : status.charAt(0) + status.slice(1).toLowerCase() }}
          </button>
       </div>

       <div class="w-px bg-slate-100 mx-2 hidden xl:block"></div>
       
       <!-- Month Picker -->
       <div class="w-48">
          <input
            v-model="filters.month"
            type="month"
            @change="handleMonthChange"
            class="w-full px-4 py-3 bg-slate-50 border-transparent hover:bg-slate-100 focus:bg-white focus:border-emerald-500 rounded-xl text-sm font-medium transition-all outline-none"
          />
       </div>
    </div>

    <!-- Orders Table -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <div class="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-slate-500 font-medium animate-pulse">Loading orders...</p>
    </div>

    <div v-else-if="orders.length === 0" class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
      <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
        <span class="material-symbols-outlined text-[40px] text-slate-300">shopping_bag</span>
      </div>
      <h3 class="text-xl font-bold text-slate-900 mb-2">No Orders Found</h3>
      <p class="text-slate-500 text-center max-w-md">Try adjusting your filters or search criteria.</p>
    </div>

    <!-- Orders List -->
    <div v-else class="space-y-6">
      <!-- Mobile Card View -->
      <div class="block lg:hidden space-y-4">
        <div
          v-for="order in orders"
          :key="order.id"
          class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden"
          :class="{ 'ring-2 ring-emerald-500': isOrderSelected(order.id) }"
        >
          <!-- Selection Overlay -->
          <div 
            v-if="isOrderSelected(order.id)" 
            class="absolute top-0 right-0 p-2 bg-emerald-500 rounded-bl-2xl z-10"
          >
            <span class="material-symbols-outlined text-white text-sm">check</span>
          </div>

          <div class="flex justify-between items-start mb-4">
            <div class="flex items-center gap-3">
              <div 
                  @click="toggleOrderSelection(order)"
                  class="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                  :class="isOrderSelected(order.id) ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'"
              >
                  <span class="material-symbols-outlined text-[20px]">{{ isOrderSelected(order.id) ? 'check_circle' : 'circle' }}</span>
              </div>
              <div>
                <h3 class="font-bold text-slate-900">{{ order.orderNumber }}</h3>
                <p class="text-xs text-slate-500">{{ formatDateTime(order.createdAt) }}</p>
              </div>
            </div>
            <span
              class="px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider"
              :class="getStatusClass(order.status)"
            >
              {{ getStatusLabel(order.status) }}
            </span>
          </div>

          <div class="space-y-3 mb-4 bg-slate-50 rounded-xl p-4">
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">Customer</span>
              <span class="font-bold text-slate-900 truncate max-w-[150px]">
                {{ order.member?.name || order.customer?.name || order.temporaryCustomerName || 'Walk-in' }}
              </span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">Total</span>
              <span class="font-bold text-emerald-600">{{ formatCurrency(Number(order.total)) }}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <button @click="viewOrder(order)" class="py-2.5 px-4 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 transition">Detail</button>
            <button @click="printReceipt(order)" class="py-2.5 px-4 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs hover:bg-blue-100 transition">Print</button>
            
            <button 
              v-if="order.status === 'PENDING' || order.status === 'PROCESSING'"
              @click="updateStatus(order.id, 'COMPLETED')"
              class="col-span-2 py-2.5 px-4 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition"
            >
              Mark as Completed
            </button>
          </div>
        </div>
      </div>

      <!-- Bulk Actions Bar -->
      <div v-if="selectedOrders.length > 0" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-4 duration-200">
          <div class="flex items-center gap-3 pr-6 border-r border-slate-700">
             <div class="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-xs">{{ selectedOrders.length }}</div>
             <span class="font-medium text-sm">Selected</span>
          </div>
          <div class="flex items-center gap-2">
             <button 
               v-if="canDeleteOrders && canDeleteSelectedOrders"
               @click="bulkDelete"
               class="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl font-bold text-xs transition flex items-center gap-2"
             >
                <span class="material-symbols-outlined text-[18px]">delete</span>
                Delete
             </button>
             <button 
               v-if="canRefundOrders && canRefundSelectedOrders"
               @click="bulkRefund"
               class="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-xl font-bold text-xs transition flex items-center gap-2"
             >
                <span class="material-symbols-outlined text-[18px]">undo</span>
                Refund
             </button>
             <button @click="selectedOrders = []" class="px-4 py-2 hover:bg-slate-800 rounded-xl font-bold text-xs text-slate-400 transition">Cancel</button>
          </div>
      </div>

      <!-- Desktop Table View -->
      <div class="hidden lg:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="p-4 w-12">
                <input
                  type="checkbox"
                  :checked="selectedOrders.length === orders.length && orders.length > 0"
                  @change="toggleSelectAll"
                  class="w-5 h-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                />
              </th>
              <th class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Order Info</th>
              <th class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
              <th class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
              <th class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
              <th class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr 
              v-for="order in orders" 
              :key="order.id" 
              class="hover:bg-slate-50 transition-colors group"
              :class="{ 'bg-emerald-50/30': isOrderSelected(order.id) }"
            >
              <td class="p-4">
                <input
                  type="checkbox"
                  :checked="isOrderSelected(order.id)"
                  @change="toggleOrderSelection(order)"
                  class="w-5 h-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                />
              </td>
              <td class="p-4">
                <div class="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{{ order.orderNumber }}</div>
                <div v-if="order.sendToKitchen" class="text-xs text-blue-600 flex items-center gap-1 mt-1 font-medium">
                   <span class="material-symbols-outlined text-[14px]">soup_kitchen</span>
                   Kitchen
                </div>
              </td>
              <td class="p-4">
                 <div class="font-medium text-slate-700">
                    {{ order.member?.name || order.customer?.name || order.temporaryCustomerName || 'Walk-in' }}
                 </div>
              </td>
              <td class="p-4 font-bold text-slate-900">
                 {{ formatCurrency(Number(order.total)) }}
              </td>
              <td class="p-4">
                 <span
                    class="px-3 py-1 text-xs font-bold rounded-full border"
                    :class="getStatusClass(order.status)"
                  >
                    {{ getStatusLabel(order.status) }}
                  </span>
              </td>
              <td class="p-4 text-sm text-slate-500">
                 {{ formatDateTime(order.createdAt) }}
              </td>
              <td class="p-4 text-right">
                 <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click="viewOrder(order)" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-emerald-600 transition" title="View Details">
                       <span class="material-symbols-outlined text-[20px]">visibility</span>
                    </button>
                    <button @click="printReceipt(order)" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition" title="Print Receipt">
                       <span class="material-symbols-outlined text-[20px]">print</span>
                    </button>
                    <button 
                      v-if="canEditOrders && (order.status === 'PENDING' || order.status === 'PROCESSING')"
                      @click="editOrder(order)" 
                      class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-amber-600 transition" 
                      title="Edit"
                    >
                       <span class="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    <button 
                      v-if="canDeleteOrders"
                      @click="deleteOrder(order.id)" 
                      class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition" 
                      title="Delete"
                    >
                       <span class="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                 </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="flex items-center justify-between pt-4">
         <p class="text-sm text-slate-500">Showing page <span class="font-bold text-slate-900">{{ pagination.page }}</span> of {{ pagination.totalPages }}</p>
         <div class="flex gap-2">
            <button
              @click="loadOrders(pagination.page - 1)"
              :disabled="pagination.page === 1"
              class="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <button
              @click="loadOrders(pagination.page + 1)"
              :disabled="pagination.page === pagination.totalPages"
              class="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
         </div>
      </div>
    </div>
  </div>

  <!-- Tenant Selector Modal -->
  <TenantSelectorModal
    :show="showTenantModal"
    @close="showTenantModal = false"
    @select="handleTenantSelected"
  />

  <!-- Order Edit Modal -->
  <OrderEditModal
    :show="showEditModal"
    :order="(editingOrder as Order | null)"
    @close="showEditModal = false; editingOrder = null"
    @saved="handleOrderSaved"
  />

  <!-- V3 Order Detail Modal -->
  <div
    v-if="selectedOrder"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all"
    @click.self="selectedOrder = null"
  >
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
      <!-- Modal Header -->
      <div class="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div>
           <h3 class="text-xl font-bold text-slate-900">Order Details</h3>
           <p class="text-sm text-slate-500 font-medium">#{{ selectedOrder.orderNumber }}</p>
        </div>
        <button
          @click="selectedOrder = null"
          class="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition shadow-sm"
        >
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-6 overflow-y-auto custom-scrollbar">
        <!-- Status & Meta -->
        <div class="flex flex-wrap gap-4 mb-8">
           <div class="flex-1 min-w-[140px] bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
              <div class="flex items-center gap-2">
                 <span class="px-3 py-1 rounded-full text-xs font-bold border" :class="getStatusClass(selectedOrder.status)">
                    {{ getStatusLabel(selectedOrder.status) }}
                 </span>
              </div>
           </div>
           <div class="flex-1 min-w-[140px] bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
              <p class="font-bold text-slate-700 text-sm">{{ formatDateTime(selectedOrder.createdAt) }}</p>
           </div>
           <div class="flex-1 min-w-[140px] bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Customer</p>
              <p class="font-bold text-slate-700 text-sm">{{ (selectedOrder as any).member?.name || (selectedOrder as any).customer?.name || 'Walk-in' }}</p>
           </div>
        </div>

        <!-- Items Table -->
        <div class="mb-8">
           <h4 class="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span class="material-symbols-outlined text-emerald-500">shopping_cart</span>
              Items Purchased
           </h4>
           <div class="border rounded-xl border-slate-200 overflow-hidden">
              <table class="w-full text-sm text-left">
                 <thead class="bg-slate-50 border-b border-slate-200">
                    <tr>
                       <th class="p-3 font-bold text-slate-600">Product</th>
                       <th class="p-3 font-bold text-slate-600 text-center">Qty</th>
                       <th class="p-3 font-bold text-slate-600 text-right">Price</th>
                       <th class="p-3 font-bold text-slate-600 text-right">Total</th>
                    </tr>
                 </thead>
                 <tbody class="divide-y divide-slate-100">
                    <tr v-for="(item, index) in ((selectedOrder as any).items || [])" :key="index">
                       <td class="p-3 font-medium text-slate-900">{{ item.product?.name || item.name }}</td>
                       <td class="p-3 text-center text-slate-600">{{ item.quantity }}</td>
                       <td class="p-3 text-right text-slate-600">{{ formatCurrency(Number(item.price)) }}</td>
                       <td class="p-3 text-right font-bold text-slate-900">{{ formatCurrency(Number(item.subtotal)) }}</td>
                    </tr>
                 </tbody>
              </table>
           </div>
        </div>

        <!-- Totals -->
        <div class="flex flex-col items-end gap-2 border-t border-slate-100 pt-6">
           <div class="flex justify-between w-full max-w-xs text-sm">
              <span class="text-slate-500">Subtotal</span>
              <span class="font-bold text-slate-700">{{ formatCurrency(Number((selectedOrder as any).subtotal || selectedOrder.total)) }}</span>
           </div>
           <div v-if="(selectedOrder as any).discount > 0" class="flex justify-between w-full max-w-xs text-sm">
              <span class="text-slate-500">Discount</span>
              <span class="font-bold text-emerald-600">-{{ formatCurrency(Number((selectedOrder as any).discount)) }}</span>
           </div>
           <div class="flex justify-between w-full max-w-xs text-lg pt-2 mt-2 border-t border-slate-100">
              <span class="font-bold text-slate-900">Total Amount</span>
              <span class="font-black text-emerald-600">{{ formatCurrency(Number(selectedOrder.total)) }}</span>
           </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="p-6 bg-slate-50 border-t border-slate-100 grid grid-cols-2 sm:flex sm:justify-end gap-3">
         <button
            @click="deleteOrder(selectedOrder.id)"
            class="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 hover:border-red-300 transition"
         >
            Delete
         </button>
         <button
            @click="printReceipt(selectedOrder)"
            class="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
         >
            <span class="material-symbols-outlined text-[18px]">print</span>
            Print Receipt
         </button>
      </div>
    </div>
  </div>

  <!-- Receipt Printer -->
  <ReceiptPrinter
    v-if="selectedOrderForReceipt"
    :show="showReceiptModal"
    :order-id="selectedOrderForReceipt.id"
    :receipt-data="(selectedOrderForReceipt as any).receiptData"
    @close="showReceiptModal = false; selectedOrderForReceipt = null"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { safeSome, safeFilter, safeMap, safeFindIndex } from '../../utils/array-helpers';
import api from '../../api';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { useAuthStore } from '../../stores/auth';
import TenantSelectorModal from '../../components/TenantSelectorModal.vue';
import TenantSelector from '../../components/TenantSelector.vue';
import StoreSelector from '../../components/StoreSelector.vue';
import ReceiptPrinter from '../../components/ReceiptPrinter.vue';
import OrderEditModal from '../../components/OrderEditModal.vue';
import { useTenantCheck } from '../../composables/useTenantCheck';
import { useNotification } from '../../composables/useNotification';
import { usePermissions } from '../../composables/usePermissions';

interface OrderItem {
  id?: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    price: number;
  };
  name?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  id: string;
  orderNumber: string;
  total: string | number;
  subtotal: string | number;
  discount: string | number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  customer?: {
    name: string;
    email?: string;
  };
  member?: {
    name: string;
    email?: string;
  };
  temporaryCustomerName?: string;
  sendToKitchen?: boolean;
  transaction?: {
    paymentMethod: string;
  };
  receiptData?: any;
}

const authStore = useAuthStore();
const { needsTenantSelection, showTenantModal, handleTenantSelected } = useTenantCheck();
const { success: showSuccess, error: showError, confirm: showConfirm } = useNotification();
const { canEditOrders, canDeleteOrders, canCancelOrders, canRefundOrders } = usePermissions();
const selectedOrder = ref<Order | null>(null);
const showEditModal = ref(false);
const editingOrder = ref<Order | null>(null);

const orders = ref<Order[]>([]);
const loading = ref(false);
const showReceiptModal = ref(false);
const selectedOrderForReceipt = ref<Order | null>(null);
const selectedOrders = ref<Order[]>([]);
const filters = ref({
  search: '',
  status: '',
  month: '',
  startDate: '',
  endDate: '',
});
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
});

// Debounce to prevent rate limiting
let loadOrdersTimeout: ReturnType<typeof setTimeout> | null = null;

const loadOrders = async (page = 1) => {
  // Check if tenant selection is needed (modal as fallback)
  if (needsTenantSelection.value) {
    if (page === 1) {
      showTenantModal.value = true;
    }
    return;
  }
  
  // Clear existing timeout
  if (loadOrdersTimeout) clearTimeout(loadOrdersTimeout);
  
  // Debounce API call
  loadOrdersTimeout = setTimeout(async () => {
    // For non-super-admin, ensure tenantId is available
    if (!authStore.isSuperAdmin && !authStore.user?.tenantId) {
      console.error('Tenant ID not available for non-super-admin user');
      await showError('Tenant ID tidak tersedia. Silakan login ulang.');
      return;
    }
    
    loading.value = true;
    try {
      const params: any = {
        page,
        limit: pagination.value.limit,
        ...(filters.value.status && { status: filters.value.status }),
        ...(filters.value.startDate && { startDate: filters.value.startDate }),
        ...(filters.value.endDate && {
          // Set endDate to end of day (23:59:59)
          endDate: (() => {
            const dateTo = new Date(filters.value.endDate);
            dateTo.setHours(23, 59, 59, 999);
            return dateTo.toISOString();
          })(),
        }),
      };
      
      // Ensure tenantId is set in params for SUPER_ADMIN
      if (authStore.isSuperAdmin && authStore.selectedTenantId) {
        params.tenantId = authStore.selectedTenantId;
      }
      
      const response = await api.get('/orders', { params });
      orders.value = response.data.data;
      pagination.value = response.data.pagination;
    } catch (error: any) {
      console.error('Error loading orders:', error);
      if (error.response?.status !== 429) { // Don't show error for rate limiting
        await showError(error.response?.data?.message || 'Gagal memuat pesanan');
      }
    } finally {
      loading.value = false;
    }
  }, page === 1 ? 100 : 0); // Only debounce on first load
};

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-gray-100 text-gray-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan',
    REFUNDED: 'Refund',
  };
  return labels[status] || status;
};

const viewOrder = async (order: Order) => {
  try {
    // Load full order data
    const response = await api.get(`/orders/${order.id}`);
    const orderData = response.data;
    // Ensure required fields have default values
    selectedOrder.value = {
      ...orderData,
      subtotal: orderData.subtotal ?? orderData.total ?? 0,
      discount: orderData.discount ?? 0,
      items: orderData.items ?? [],
    };
  } catch (error: any) {
    console.error('Error loading order details:', error);
    await showError('Gagal memuat detail pesanan');
  }
};

const getPaymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    CASH: 'Cash',
    CARD: 'Kartu',
    E_WALLET: 'E-Wallet',
    QRIS: 'QRIS',
    BANK_TRANSFER: 'Bank',
    SHOPEEPAY: 'ShopeePay',
    DANA: 'Dana',
    MIDTRANS: 'Midtrans',
  };
  return labels[method] || method;
};

const printReceipt = async (order: Order) => {
  try {
    // Load full order data for receipt
    const response = await api.get(`/orders/${order.id}`);
    const fullOrder = response.data;
    
    // Prepare receipt data
    const receiptData = {
      orderNumber: fullOrder.orderNumber,
      date: fullOrder.createdAt,
      customerName: fullOrder.member?.name || fullOrder.customer?.name || fullOrder.temporaryCustomerName || null,
      memberName: fullOrder.member?.name || null,
      items: safeMap(fullOrder.items || [], (item: any) => ({
        name: item.product?.name || item.name,
        quantity: item.quantity,
        price: Number(item.price),
        subtotal: Number(item.subtotal),
      })) || [],
      subtotal: Number(fullOrder.subtotal || fullOrder.total),
      discount: Number(fullOrder.discount || 0),
      total: Number(fullOrder.total),
      paymentMethod: fullOrder.transaction?.paymentMethod || 'CASH',
      servedBy: fullOrder.transaction?.servedBy || null, // Nama kasir/admin yang melayani
    };
    
    selectedOrderForReceipt.value = { ...order, receiptData } as any;
    showReceiptModal.value = true;
  } catch (error: any) {
    console.error('Error loading order for receipt:', error);
    await showError('Gagal memuat data order untuk receipt');
  }
};

const updateStatus = async (id: string, status: string) => {
  try {
    await api.put(`/orders/${id}/status`, { status });
    await loadOrders(pagination.value.page);
    await showSuccess('Status pesanan berhasil diupdate');
  } catch (error: any) {
    console.error('Error updating order status:', error);
    let errorMessage = 'Gagal mengupdate status';
    
    if (error.response) {
      if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data?.error) {
        errorMessage = `Error: ${error.response.data.error}`;
      } else if (error.response.status === 404) {
        errorMessage = 'Pesanan tidak ditemukan';
      } else if (error.response.status === 403) {
        errorMessage = 'Anda tidak memiliki izin untuk mengupdate status pesanan';
      } else if (error.response.status === 400) {
        errorMessage = error.response.data?.message || 'Status pesanan tidak valid';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    await showError(errorMessage);
  }
};

const sendToKitchen = async (id: string) => {
  try {
    // Update order dengan sendToKitchen flag dan status
    await api.put(`/orders/${id}`, { 
      sendToKitchen: true,
    });
    await api.put(`/orders/${id}/status`, { status: 'PROCESSING' });
    await loadOrders(pagination.value.page);
    await showSuccess('Pesanan berhasil dikirim ke dapur');
  } catch (error: any) {
    console.error('Error sending order to kitchen:', error);
    let errorMessage = 'Gagal mengirim ke dapur';
    
    if (error.response) {
      if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data?.error) {
        errorMessage = `Error: ${error.response.data.error}`;
      } else if (error.response.status === 404) {
        errorMessage = 'Pesanan tidak ditemukan';
      } else if (error.response.status === 403) {
        errorMessage = 'Anda tidak memiliki izin untuk mengirim pesanan ke dapur';
      } else if (error.response.status === 400) {
        errorMessage = error.response.data?.message || 'Pesanan tidak dapat dikirim ke dapur';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    await showError(errorMessage);
  }
};

const editOrder = async (order: Order) => {
  try {
    // Load full order data
    const response = await api.get(`/orders/${order.id}`);
    const orderData = response.data;
    // Ensure required fields have default values
    editingOrder.value = {
      ...orderData,
      subtotal: orderData.subtotal ?? orderData.total ?? 0,
      discount: orderData.discount ?? 0,
      items: orderData.items ?? [],
    };
    showEditModal.value = true;
  } catch (error: any) {
    await showError('Gagal memuat data pesanan untuk edit');
  }
};

const cancelOrder = async (id: string) => {
  const confirmed = await showConfirm('Apakah Anda yakin ingin membatalkan pesanan ini?', 'Batalkan Pesanan');
  if (!confirmed) return;
  
  try {
    await api.put(`/orders/${id}/status`, { status: 'CANCELLED' });
    await loadOrders(pagination.value.page);
    if (selectedOrder.value?.id === id) {
      selectedOrder.value = null;
    }
    await showSuccess('Pesanan berhasil dibatalkan');
  } catch (error: any) {
    console.error('Error cancelling order:', error);
    let errorMessage = 'Gagal membatalkan pesanan';
    
    if (error.response) {
      if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data?.error) {
        errorMessage = `Error: ${error.response.data.error}`;
      } else if (error.response.status === 404) {
        errorMessage = 'Pesanan tidak ditemukan';
      } else if (error.response.status === 403) {
        errorMessage = 'Anda tidak memiliki izin untuk membatalkan pesanan';
      } else if (error.response.status === 400) {
        errorMessage = error.response.data?.message || 'Pesanan tidak dapat dibatalkan';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    await showError(errorMessage);
  }
};

const refundOrder = async (id: string) => {
  const confirmed = await showConfirm('Apakah Anda yakin ingin melakukan refund untuk pesanan ini?', 'Refund Pesanan');
  if (!confirmed) return;
  
  try {
    await api.put(`/orders/${id}/status`, { status: 'REFUNDED' });
    await loadOrders(pagination.value.page);
    if (selectedOrder.value?.id === id) {
      selectedOrder.value = null;
    }
    await showSuccess('Pesanan berhasil direfund');
  } catch (error: any) {
    console.error('Error refunding order:', error);
    let errorMessage = 'Gagal melakukan refund';
    
    if (error.response) {
      if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data?.error) {
        errorMessage = `Error: ${error.response.data.error}`;
      } else if (error.response.status === 404) {
        errorMessage = 'Pesanan tidak ditemukan';
      } else if (error.response.status === 403) {
        errorMessage = 'Anda tidak memiliki izin untuk melakukan refund';
      } else if (error.response.status === 400) {
        errorMessage = error.response.data?.message || 'Pesanan tidak dapat direfund. Pastikan status pesanan adalah COMPLETED.';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    await showError(errorMessage);
  }
};

const deleteOrder = async (id: string) => {
  const confirmed = await showConfirm('Apakah Anda yakin ingin menghapus pesanan ini? Tindakan ini tidak dapat dibatalkan.', 'Hapus Pesanan');
  if (!confirmed) return;
  
  try {
    await api.delete(`/orders/${id}`);
    await loadOrders(pagination.value.page);
    if (selectedOrder.value?.id === id) {
      selectedOrder.value = null;
    }
    await showSuccess('Pesanan berhasil dihapus');
  } catch (error: any) {
    console.error('Error deleting order:', error);
    let errorMessage = 'Gagal menghapus pesanan';
    
    if (error.response) {
      // Backend returned an error response
      if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data?.error) {
        errorMessage = `Error: ${error.response.data.error}`;
      } else if (error.response.status === 404) {
        errorMessage = 'Pesanan tidak ditemukan';
      } else if (error.response.status === 403) {
        errorMessage = 'Anda tidak memiliki izin untuk menghapus pesanan ini';
      } else if (error.response.status === 400) {
        errorMessage = error.response.data?.message || 'Pesanan tidak dapat dihapus. Pastikan status pesanan adalah CANCELLED atau REFUNDED.';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    await showError(errorMessage);
  }
};

const handleOrderSaved = async (order: Order) => {
  await loadOrders(pagination.value.page);
  if (selectedOrder.value?.id === order.id) {
    // Reload selected order
    await viewOrder(order);
  }
  await showSuccess('Pesanan berhasil diupdate');
  showEditModal.value = false;
  editingOrder.value = null;
};

// Bulk operations
const isOrderSelected = (orderId: string) => {
  return safeSome(selectedOrders.value, (o: any) => o && o.id === orderId);
};

const toggleOrderSelection = (order: Order) => {
  if (!Array.isArray(selectedOrders.value)) selectedOrders.value = [];
  // Use safeFindIndex with proper type checking
  const index = safeFindIndex<Order>(selectedOrders.value, (o: Order) => o && o.id === order.id);
  if (index > -1) {
    selectedOrders.value.splice(index, 1);
  } else {
    selectedOrders.value.push(order);
  }
};

const toggleSelectAll = () => {
  if (!Array.isArray(orders.value)) return;
  if (!Array.isArray(selectedOrders.value)) selectedOrders.value = [];
  if (selectedOrders.value.length === orders.value.length) {
    selectedOrders.value = [];
  } else {
    selectedOrders.value = [...orders.value];
  }
};

const canDeleteSelectedOrders = computed(() => {
  if (selectedOrders.value.length === 0) return false;
  return selectedOrders.value.every(o => o.status === 'CANCELLED' || o.status === 'REFUNDED');
});

const canRefundSelectedOrders = computed(() => {
  if (selectedOrders.value.length === 0) return false;
  return selectedOrders.value.every(o => o.status === 'COMPLETED');
});

const bulkDelete = async () => {
  if (!Array.isArray(selectedOrders.value) || selectedOrders.value.length === 0) return;
  
  const confirmed = await showConfirm(
    `Apakah Anda yakin ingin menghapus ${selectedOrders.value.length} pesanan? Tindakan ini tidak dapat dibatalkan.`,
    'Hapus Pesanan'
  );
  if (!confirmed) return;

  try {
    const orderIds = selectedOrders.value.map(o => o.id);
    const response = await api.post('/orders/bulk-delete', { orderIds });
    
    if (response.data.deleted > 0) {
      await showSuccess(`${response.data.deleted} pesanan berhasil dihapus`);
    }
    if (response.data.failed > 0) {
      const errorDetails = response.data.errors?.join(', ') || 'Beberapa pesanan gagal dihapus';
      await showError(`${response.data.failed} pesanan gagal dihapus. ${errorDetails}`);
    }
    
    selectedOrders.value = [];
    await loadOrders(pagination.value.page);
  } catch (error: any) {
    console.error('Error bulk deleting orders:', error);
    let errorMessage = 'Gagal menghapus pesanan';
    
    if (error.response) {
      if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data?.error) {
        errorMessage = `Error: ${error.response.data.error}`;
      } else if (error.response.status === 403) {
        errorMessage = 'Anda tidak memiliki izin untuk menghapus pesanan';
      } else if (error.response.status === 400) {
        errorMessage = error.response.data?.message || 'Beberapa pesanan tidak dapat dihapus. Pastikan status pesanan adalah CANCELLED atau REFUNDED.';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    await showError(errorMessage);
  }
};

const bulkRefund = async () => {
  if (!Array.isArray(selectedOrders.value) || selectedOrders.value.length === 0) return;
  
  const confirmed = await showConfirm(
    `Apakah Anda yakin ingin melakukan refund untuk ${selectedOrders.value.length} pesanan?`,
    'Refund Pesanan'
  );
  if (!confirmed) return;

  try {
    const orderIds = selectedOrders.value.map(o => o.id);
    const response = await api.post('/orders/bulk-refund', { orderIds });
    
    if (response.data.refunded > 0) {
      await showSuccess(`${response.data.refunded} pesanan berhasil direfund`);
    }
    if (response.data.failed > 0) {
      const errorDetails = response.data.errors?.join(', ') || 'Beberapa pesanan gagal direfund';
      await showError(`${response.data.failed} pesanan gagal direfund. ${errorDetails}`);
    }
    
    selectedOrders.value = [];
    await loadOrders(pagination.value.page);
  } catch (error: any) {
    console.error('Error bulk refunding orders:', error);
    let errorMessage = 'Gagal melakukan refund';
    
    if (error.response) {
      if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data?.error) {
        errorMessage = `Error: ${error.response.data.error}`;
      } else if (error.response.status === 403) {
        errorMessage = 'Anda tidak memiliki izin untuk melakukan refund';
      } else if (error.response.status === 400) {
        errorMessage = error.response.data?.message || 'Beberapa pesanan tidak dapat direfund. Pastikan status pesanan adalah COMPLETED.';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    await showError(errorMessage);
  }
};

// Computed property untuk menghitung jumlah order yang bisa dihapus
const deletableOrdersCount = computed(() => {
  if (!Array.isArray(orders.value)) return 0;
  return safeFilter(orders.value, (o: any) => o && (o.status === 'CANCELLED' || o.status === 'REFUNDED')).length;
});

// Hapus semua order yang bisa dihapus
const deleteAllOrders = async () => {
  if (!Array.isArray(orders.value)) return;
  const deletableOrders = orders.value.filter(o => o.status === 'CANCELLED' || o.status === 'REFUNDED');
  
  if (deletableOrders.length === 0) {
    await showError('Tidak ada pesanan yang bisa dihapus. Hanya pesanan dengan status Dibatalkan atau Direfund yang bisa dihapus.');
    return;
  }
  
  const confirmed = await showConfirm(
    `Apakah Anda yakin ingin menghapus ${deletableOrders.length} pesanan? Tindakan ini tidak dapat dibatalkan.`,
    'Hapus Semua Pesanan'
  );
  if (!confirmed) return;

  try {
    const orderIds = safeMap(deletableOrders, (o: any) => o?.id);
    const response = await api.post('/orders/bulk-delete', { orderIds });
    
    if (response.data.deleted > 0) {
      await showSuccess(`${response.data.deleted} pesanan berhasil dihapus`);
    }
    if (response.data.failed > 0) {
      await showError(`${response.data.failed} pesanan gagal dihapus. ${response.data.errors.join(', ')}`);
    }
    
    selectedOrders.value = [];
    await loadOrders(pagination.value.page);
  } catch (error: any) {
    await showError(error.response?.data?.message || 'Gagal menghapus pesanan');
  }
};


const handleMonthChange = () => {
  if (filters.value.month) {
    // Parse month (format: YYYY-MM)
    const [year, month] = filters.value.month.split('-');
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    
    // Set startDate to first day of month (format: YYYY-MM-DD)
    const firstDay = `${year}-${month.padStart(2, '0')}-01`;
    filters.value.startDate = firstDay;
    
    // Calculate last day of month correctly
    // new Date(year, month, 0) gives the last day of the previous month
    // So new Date(year, monthNum, 0) gives last day of (monthNum - 1)
    // We need last day of monthNum, so use new Date(year, monthNum, 0)
    const lastDayDate = new Date(yearNum, monthNum, 0);
    const lastDay = lastDayDate.getDate();
    
    // Format endDate as YYYY-MM-DD
    const endDate = `${year}-${month.padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    filters.value.endDate = endDate;
    
    // Load orders with new date range
    loadOrders(1);
  } else {
    // Clear date range if month is cleared
    filters.value.startDate = '';
    filters.value.endDate = '';
    loadOrders(1);
  }
};

watch([() => filters.value.status, () => filters.value.startDate, () => filters.value.endDate], () => {
  loadOrders(1);
});

const handleTenantChange = (tenantId: string | null) => {
  // Reload orders when tenant changes
  if (tenantId && !needsTenantSelection.value) {
    loadOrders();
  }
};

const handleStoreChange = (_storeId: string | null) => {
  // Reload orders when store changes
  if (!needsTenantSelection.value) {
    loadOrders(1);
  }
};

watch(() => authStore.selectedTenantId, (newTenantId, oldTenantId) => {
  // Only reload if tenantId actually changed
  if (newTenantId && newTenantId !== oldTenantId && !needsTenantSelection.value) {
    loadOrders();
  }
}, { immediate: false });

const handleSearchFocus = () => {
  // No-op, just for compatibility
};

const handleSearchInput = () => {
  loadOrders(1);
};

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // For super admin, ensure selectedTenantId is synced with localStorage
  if (authStore.isSuperAdmin) {
    const storedTenantId = localStorage.getItem('selectedTenantId');
    if (storedTenantId && storedTenantId !== authStore.selectedTenantId) {
      authStore.setSelectedTenant(storedTenantId);
    }
  }
  
  // Initialize month filter to current month
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  filters.value.month = `${year}-${month}`;
  
  // Set date range to current month (1st to last day)
  handleMonthChange();
  
  if (!needsTenantSelection.value) {
    loadOrders(1);
  }
});
</script>

