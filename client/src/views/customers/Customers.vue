<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 font-display">
    <!-- Decorative Background -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
    </div>

    <div class="relative z-10 p-6 lg:p-8 flex flex-col gap-8 max-w-7xl mx-auto">
      <!-- Tenant Selector for Super Admin -->
      <TenantSelector @tenant-changed="handleTenantChange" />

      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div class="flex flex-col gap-2 animate-fade-in-down">
          <h1 class="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
            Pelanggan
          </h1>
          <p class="text-slate-500 dark:text-slate-400 font-medium text-lg">
            Kelola data dan riwayat pembelian pelanggan Anda
          </p>
        </div>
        
        <button
          v-if="canManageCustomers || authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'"
          @click="showCreateModal = true"
          class="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white px-6 py-3 rounded-2xl shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] font-bold text-sm tracking-wide flex items-center gap-2"
        >
          <span class="material-symbols-outlined text-[20px] group-hover:rotate-12 transition-transform duration-300">person_add</span>
          <span>Tambah Pelanggan</span>
        </button>
      </div>

      <!-- Search & Filters -->
      <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 p-4 animate-fade-in-up" style="animation-delay: 100ms">
        <div class="relative group">
          <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-300 text-[22px]">search</span>
          <input
            v-model="filters.search"
            @focus="handleSearchFocus"
            @input="handleSearchInput"
            type="text"
            placeholder="Cari pelanggan berdasarkan nama, email, atau no. telepon..."
            class="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-300 font-medium"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div class="relative w-16 h-16">
          <div class="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-full"></div>
          <div class="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p class="mt-4 text-slate-500 font-medium animate-pulse">Memuat data pelanggan...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="customers.length === 0" class="flex flex-col items-center justify-center py-24 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 animate-scale-in">
        <div class="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <span class="material-symbols-outlined text-[48px] text-slate-400">group_off</span>
        </div>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Belum Ada Pelanggan</h3>
        <p class="text-slate-500 dark:text-slate-400 text-center max-w-md mb-8 leading-relaxed">
          Database pelanggan Anda masih kosong. Mulai tambahkan pelanggan untuk melacak riwayat pesanan mereka.
        </p>
        <button
          v-if="canManageCustomers || authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'"
          @click="showCreateModal = true"
          class="px-6 py-3 bg-white dark:bg-slate-800 border-2 border-dashed border-emerald-500 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all font-bold flex items-center gap-2"
        >
          <span class="material-symbols-outlined">add_circle</span>
          Tambah Pelanggan Pertama
        </button>
      </div>

      <!-- Customer Cards Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="(customer, index) in customers"
          :key="customer.id"
          class="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all duration-300 p-6 flex flex-col animate-scale-in"
          :style="{ animationDelay: `${index * 50}ms` }"
        >
          <div class="flex items-start gap-4 mb-6">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-2xl shadow-inner border border-white/50 dark:border-white/10 group-hover:scale-110 transition-transform duration-300">
              {{ customer.name.charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0 pt-1">
              <h3 class="font-bold text-lg text-slate-900 dark:text-white truncate mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {{ customer.name }}
              </h3>
              <div class="flex flex-col gap-0.5">
                <p v-if="customer.email" class="text-sm text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[14px]">mail</span>
                  {{ customer.email }}
                </p>
                <p v-if="customer.phone" class="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[14px]">call</span>
                  {{ customer.phone }}
                </p>
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-3 mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
            <div class="flex flex-col gap-1">
              <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">shopping_bag</span>
                Pesanan
              </span>
              <span class="font-black text-slate-800 dark:text-white text-lg">{{ customer.totalOrders || 0 }}</span>
            </div>
            <div class="flex flex-col gap-1 text-right">
              <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 justify-end">
                <span class="material-symbols-outlined text-[14px]">payments</span>
                Total
              </span>
              <span class="font-black text-emerald-600 dark:text-emerald-400 text-lg">{{ formatCurrency(customer.totalSpent || 0) }}</span>
            </div>
          </div>
          
          <div class="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              v-if="canManageCustomers || authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'"
              @click="editCustomer(customer)"
              class="flex-1 py-2.5 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
            >
              <span class="material-symbols-outlined text-[18px]">edit_square</span>
              Edit
            </button>
            <button
              @click="viewCustomer(customer)"
              class="flex-1 py-2.5 rounded-xl text-sm font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors flex items-center justify-center gap-2"
            >
              <span class="material-symbols-outlined text-[18px]">visibility</span>
              Detail
            </button>
            <button
              v-if="canManageCustomers || authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'"
              @click="deleteCustomer(customer.id)"
              class="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Hapus Pelanggan"
            >
              <span class="material-symbols-outlined text-[20px]">delete</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="flex items-center justify-center gap-3 mt-8 pb-8 animate-fade-in">
        <button
          @click="loadCustomers(pagination.page - 1)"
          :disabled="pagination.page === 1"
          class="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm hover:shadow"
        >
          <span class="material-symbols-outlined text-[20px]">chevron_left</span>
        </button>
        
        <span class="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-bold text-slate-600 dark:text-slate-300 shadow-sm">
          Hal. {{ pagination.page }} dari {{ pagination.totalPages }}
        </span>
        
        <button
          @click="loadCustomers(pagination.page + 1)"
          :disabled="pagination.page === pagination.totalPages"
          class="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm hover:shadow"
        >
          <span class="material-symbols-outlined text-[20px]">chevron_right</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Customer Modal -->
  <CustomerModal
    :show="showCreateModal"
    :customer="editingCustomer"
    @close="closeModal"
    @save="handleSaveCustomer"
  />

  <!-- Tenant Selector Modal -->
  <TenantSelectorModal
    :show="showTenantModal"
    @close="showTenantModal = false"
    @select="handleTenantSelected"
  />

  <!-- Customer Detail Modal -->
  <CustomerDetailModal
    :show="showDetailModal"
    :customer="viewingCustomer"
    @close="showDetailModal = false"
    @edit="handleEditFromDetail"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import api from '../../api';
import { formatCurrency } from '../../utils/formatters';
import { useAuthStore } from '../../stores/auth';
import TenantSelectorModal from '../../components/TenantSelectorModal.vue';
import TenantSelector from '../../components/TenantSelector.vue';
import CustomerModal from '../../components/CustomerModal.vue';
import CustomerDetailModal from '../../components/CustomerDetailModal.vue';
import { useTenantCheck } from '../../composables/useTenantCheck';
import { useNotification } from '../../composables/useNotification';
import { usePermissions } from '../../composables/usePermissions';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  totalOrders?: number;
  totalSpent?: number;
}

const authStore = useAuthStore();
const { needsTenantSelection, showTenantModal, handleTenantSelected } = useTenantCheck();
const { success: showSuccess, error: showError, confirm: showConfirm } = useNotification();
const { canManageCustomers } = usePermissions();

const customers = ref<Customer[]>([]);
const loading = ref(false);
const showCreateModal = ref(false);
const showDetailModal = ref(false);
const editingCustomer = ref<Customer | null>(null);
const viewingCustomer = ref<Customer | null>(null);
const filters = ref({
  search: '',
});
const pagination = ref({
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 0,
});

// Debounce to prevent rate limiting
let loadCustomersTimeout: ReturnType<typeof setTimeout> | null = null;

const loadCustomers = async (page = 1) => {
  // Check if tenant selection is needed (modal as fallback)
  if (needsTenantSelection.value) {
    if (page === 1) {
      showTenantModal.value = true;
    }
    return;
  }
  
  // For non-super-admin, ensure tenantId is available
  if (!authStore.isSuperAdmin && !authStore.user?.tenantId) {
    console.error('Tenant ID not available for non-super-admin user');
    await showError('Tenant ID not available. Please login again.');
    return;
  }
  
  // Clear existing timeout
  if (loadCustomersTimeout) clearTimeout(loadCustomersTimeout);
  
  // Debounce API call
  loadCustomersTimeout = setTimeout(async () => {
    // For non-super-admin, ensure tenantId is available
    if (!authStore.isSuperAdmin && !authStore.user?.tenantId) {
      console.error('Tenant ID not available for non-super-admin user');
      await showError('Tenant ID not available. Please login again.');
      return;
    }
    
    loading.value = true;
    try {
      const params: any = {
        page,
        limit: pagination.value.limit,
        ...(filters.value.search && { search: filters.value.search }),
      };
      
      // Ensure tenantId is set in params for SUPER_ADMIN
      if (authStore.isSuperAdmin && authStore.selectedTenantId) {
        params.tenantId = authStore.selectedTenantId;
      }
      
      const response = await api.get('/customers', { params });
      customers.value = response.data.data;
      pagination.value = response.data.pagination;
    } catch (error: any) {
      console.error('Error loading customers:', error);
      if (error.response?.status !== 429) { // Don't show error for rate limiting
        await showError(error.response?.data?.message || 'Failed to load customers');
      }
    } finally {
      loading.value = false;
    }
  }, page === 1 ? 100 : 0); // Only debounce on first load
};

const editCustomer = (customer: Customer) => {
  editingCustomer.value = customer;
  showCreateModal.value = true;
};

const closeModal = () => {
  showCreateModal.value = false;
  editingCustomer.value = null;
};

const handleSaveCustomer = async (customerData: Partial<Customer>) => {
  try {
    if (editingCustomer.value) {
      // Update existing customer
      await api.put(`/customers/${editingCustomer.value.id}`, customerData);
      await showSuccess('Customer updated successfully');
    } else {
      // Create new customer
      await api.post('/customers', customerData);
      await showSuccess('Customer added successfully');
    }
    closeModal();
    await loadCustomers(pagination.value.page);
  } catch (error: any) {
    console.error('Error saving customer:', error);
    await showError(error.response?.data?.message || 'Failed to save customer');
  }
};

const viewCustomer = (customer: Customer) => {
  viewingCustomer.value = customer;
  showDetailModal.value = true;
};

const handleEditFromDetail = (customer: Customer) => {
  showDetailModal.value = false;
  editingCustomer.value = customer;
  showCreateModal.value = true;
};

const deleteCustomer = async (id: string) => {
  const confirmed = await showConfirm('Are you sure you want to delete this customer?');
  if (!confirmed) return;
  try {
    await api.delete(`/customers/${id}`);
    await loadCustomers(pagination.value.page);
    await showSuccess('Customer deleted successfully');
  } catch (error: any) {
    await showError(error.response?.data?.message || 'Failed to delete customer');
  }
};

watch(() => filters.value.search, () => {
  loadCustomers(1);
});

const handleTenantChange = (tenantId: string | null) => {
  // Reload customers when tenant changes
  if (tenantId && !needsTenantSelection.value) {
    loadCustomers();
  }
};

watch(() => authStore.selectedTenantId, () => {
  if (authStore.selectedTenantId && !needsTenantSelection.value) {
    loadCustomers();
  }
});

const handleSearchFocus = () => {
  // No-op, just for compatibility
};

const handleSearchInput = () => {
  loadCustomers(1);
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
  
  if (!needsTenantSelection.value) {
    loadCustomers();
  }
});
</script>
