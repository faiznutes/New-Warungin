<template>
  <div class="flex flex-col gap-6">
    <!-- Tenant Selector for Super Admin -->
    <TenantSelector @tenant-changed="handleTenantChange" />

    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-[#0d141b] dark:text-white text-2xl sm:text-3xl font-bold leading-tight tracking-tight">Customers</h1>
        <p class="text-[#4c739a] dark:text-slate-400">Manage your customer database.</p>
      </div>
      <button
        v-if="canManageCustomers || authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'"
        @click="showCreateModal = true"
        class="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg shadow-lg shadow-blue-500/30 transition-all font-medium text-sm"
      >
        <span class="material-symbols-outlined text-[20px]">person_add</span>
        <span>Add Customer</span>
      </button>
    </div>

    <!-- Search Filter -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-4">
      <div class="relative">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
        <input
          v-model="filters.search"
          @focus="handleSearchFocus"
          @input="handleSearchInput"
          type="text"
          placeholder="Search customers..."
          class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="customers.length === 0" class="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
      <span class="material-symbols-outlined text-[64px] text-slate-300 mb-4">group</span>
      <h3 class="text-lg font-bold text-[#0d141b] dark:text-white mb-2">No Customers Yet</h3>
      <p class="text-[#4c739a] text-center max-w-md mb-4">Start by adding your first customer.</p>
      <button
        v-if="canManageCustomers || authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'"
        @click="showCreateModal = true"
        class="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg shadow-lg shadow-blue-500/30 transition-all font-medium text-sm"
      >
        <span class="material-symbols-outlined text-[20px]">person_add</span>
        Add First Customer
      </button>
    </div>

    <!-- Customer Cards Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="customer in customers"
        :key="customer.id"
        class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 hover:shadow-md transition-shadow group"
      >
        <div class="flex items-start gap-3 mb-4">
          <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
            {{ customer.name.charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-slate-900 dark:text-white truncate">{{ customer.name }}</h3>
            <p v-if="customer.email" class="text-sm text-slate-500 truncate">{{ customer.email }}</p>
            <p v-if="customer.phone" class="text-sm text-slate-500">{{ customer.phone }}</p>
          </div>
        </div>
        
        <div class="space-y-2 mb-4">
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-500 flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">shopping_bag</span>
              Orders
            </span>
            <span class="font-bold text-slate-900 dark:text-white">{{ customer.totalOrders || 0 }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-500 flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">payments</span>
              Total Spent
            </span>
            <span class="font-bold text-primary">{{ formatCurrency(customer.totalSpent || 0) }}</span>
          </div>
        </div>
        
        <div class="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
          <button
            v-if="canManageCustomers || authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'"
            @click="editCustomer(customer)"
            class="flex-1 px-3 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition flex items-center justify-center gap-1"
          >
            <span class="material-symbols-outlined text-[16px]">edit</span>
            Edit
          </button>
          <button
            @click="viewCustomer(customer)"
            class="flex-1 px-3 py-2 text-xs font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition flex items-center justify-center gap-1"
          >
            <span class="material-symbols-outlined text-[16px]">visibility</span>
            View
          </button>
          <button
            v-if="canManageCustomers || authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'"
            @click="deleteCustomer(customer.id)"
            class="px-3 py-2 text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition"
          >
            <span class="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="flex items-center justify-center gap-2 mt-4">
      <button
        @click="loadCustomers(pagination.page - 1)"
        :disabled="pagination.page === 1"
        class="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1 font-medium text-sm"
      >
        <span class="material-symbols-outlined text-[18px]">chevron_left</span>
        Previous
      </button>
      <span class="px-4 py-2 text-slate-600 dark:text-slate-400 text-sm">
        Page {{ pagination.page }} of {{ pagination.totalPages }}
      </span>
      <button
        @click="loadCustomers(pagination.page + 1)"
        :disabled="pagination.page === pagination.totalPages"
        class="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1 font-medium text-sm"
      >
        Next
        <span class="material-symbols-outlined text-[18px]">chevron_right</span>
      </button>
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
