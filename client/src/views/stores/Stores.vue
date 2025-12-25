<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col">
        <h2 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Store Management</h2>
        <p class="text-slate-500 dark:text-slate-400 mt-1">Manage your stores and outlets.</p>
      </div>
      <button
        v-if="canManageStores"
        @click="showCreateModal = true"
        class="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg shadow-lg shadow-primary/30 transition-all active:scale-95 font-medium text-sm"
      >
        <span class="material-symbols-outlined text-[20px]">add</span>
        <span>Add Store</span>
      </button>
    </div>

    <!-- Outlet Limit Info with Progress Bar -->
    <div v-if="outletLimit && outletLimit.limit !== undefined && outletLimit.limit !== -1" class="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <span class="material-symbols-outlined">storefront</span>
          </div>
          <div>
            <p class="font-bold text-slate-900 dark:text-white">Outlet Limit</p>
            <p class="text-sm text-slate-500">
              {{ outletLimit.currentUsage || 0 }} / {{ outletLimit.limit }} outlets
              <span class="font-semibold" :class="(outletLimit.currentUsage || 0) >= outletLimit.limit ? 'text-red-600' : 'text-green-600'">
                ({{ outletLimit.limit - (outletLimit.currentUsage || 0) }} available)
              </span>
            </p>
          </div>
        </div>
      </div>
      <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
        <div
          class="h-2 rounded-full transition-all"
          :class="(outletLimit.currentUsage || 0) >= outletLimit.limit ? 'bg-red-500' : (outletLimit.currentUsage || 0) >= (outletLimit.limit * 0.8) ? 'bg-yellow-500' : 'bg-primary'"
          :style="{ width: `${Math.min(100, ((outletLimit.currentUsage || 0) / outletLimit.limit) * 100)}%` }"
        ></div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="flex flex-col items-center">
        <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <div class="text-slate-500 font-medium">Loading stores...</div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="stores.length === 0" class="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
      <span class="material-symbols-outlined text-[80px] text-slate-300 mb-4">store</span>
      <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">No Stores Yet</h3>
      <p class="text-slate-500 text-center max-w-md mb-4">Start by adding your first store.</p>
      <button
        v-if="canManageStores"
        @click="showCreateModal = true"
        class="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg shadow-lg shadow-primary/30 transition-all font-medium text-sm"
      >
        <span class="material-symbols-outlined text-[20px]">add</span>
        Add First Store
      </button>
    </div>

    <!-- Store Cards Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="store in stores"
        :key="store.id"
        class="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 p-6 hover:shadow-lg transition-shadow group"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">{{ store.name }}</h3>
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
              :class="store.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="store.isActive ? 'bg-green-500' : 'bg-red-500'"></span>
              {{ store.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <div v-if="canManageStores" class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              @click="editStore(store)"
              class="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition"
              title="Edit Store"
            >
              <span class="material-symbols-outlined text-[20px]">edit</span>
            </button>
            <button
              @click="deleteStore(store)"
              class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Delete Store"
            >
              <span class="material-symbols-outlined text-[20px]">delete</span>
            </button>
          </div>
        </div>
        
        <div class="space-y-2 text-sm text-slate-500">
          <div v-if="store.address" class="flex items-start gap-2">
            <span class="material-symbols-outlined text-[18px] text-slate-400 mt-0.5">location_on</span>
            <span class="flex-1">{{ store.address }}</span>
          </div>
          <div v-if="store.phone" class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px] text-slate-400">call</span>
            <span>{{ store.phone }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div
        v-if="showCreateModal || editingStore"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="closeModal"
      >
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-bold text-slate-900 dark:text-white">
                {{ editingStore ? 'Edit Store' : 'Add New Store' }}
              </h3>
              <button
                @click="closeModal"
                class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <form @submit.prevent="handleSubmit" class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Store Name <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="storeForm.name"
                  type="text"
                  required
                  placeholder="e.g. Branch A"
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Address
                </label>
                <textarea
                  v-model="storeForm.address"
                  rows="3"
                  placeholder="Full store address"
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                ></textarea>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <input
                  v-model="storeForm.phone"
                  type="tel"
                  placeholder="081234567890"
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div v-if="editingStore" class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <input
                  v-model="storeForm.isActive"
                  type="checkbox"
                  id="isActive"
                  class="w-5 h-5 text-primary border-slate-300 rounded focus:ring-primary"
                />
                <label for="isActive" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Store is Active
                </label>
              </div>

              <div class="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  @click="closeModal"
                  class="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="processing"
                  class="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-primary/30"
                >
                  {{ processing ? 'Saving...' : editingStore ? 'Update' : 'Save' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';
import { useAuthStore } from '../../stores/auth';

const { success: showSuccess, error: showError, confirm: showConfirm } = useNotification();
const authStore = useAuthStore();

const canManageStores = computed(() => {
  return authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN';
});

interface Store {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const stores = ref<Store[]>([]);
const loading = ref(false);
const processing = ref(false);
const showCreateModal = ref(false);
const editingStore = ref<Store | null>(null);
const outletLimit = ref<any>(null);

const storeForm = ref({
  name: '',
  address: '',
  phone: '',
  isActive: true,
});

const loadStores = async () => {
  // For non-super-admin, ensure tenantId is available
  if (!authStore.isSuperAdmin && !authStore.user?.tenantId) {
    console.error('Tenant ID not available for non-super-admin user');
    await showError('Tenant ID not available. Please login again.');
    return;
  }
  
  loading.value = true;
  try {
    const params: any = {};
    
    // Ensure tenantId is set in params for SUPER_ADMIN
    if (authStore.isSuperAdmin && authStore.selectedTenantId) {
      params.tenantId = authStore.selectedTenantId;
    }
    
    const response = await api.get('/outlets', { params });
    stores.value = response.data.data || [];
    
    // Load outlet limit
    try {
      const limitRes = await api.get('/addons/check-limit/ADD_OUTLETS');
      outletLimit.value = limitRes.data;
    } catch (e) {
      // Ignore if no addon
      outletLimit.value = null;
    }
  } catch (error: any) {
    await showError(error.response?.data?.message || 'Failed to load stores');
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  processing.value = true;
  try {
    if (editingStore.value) {
      await api.put(`/outlets/${editingStore.value.id}`, storeForm.value);
      await showSuccess('Store updated successfully');
    } else {
      await api.post('/outlets', storeForm.value);
      await showSuccess('Store added successfully');
    }
    closeModal();
    await loadStores();
  } catch (error: any) {
    await showError(error.response?.data?.message || 'Failed to save store');
  } finally {
    processing.value = false;
  }
};

const editStore = (store: Store) => {
  editingStore.value = store;
  storeForm.value = {
    name: store.name,
    address: store.address || '',
    phone: store.phone || '',
    isActive: store.isActive,
  };
  showCreateModal.value = true;
};

const deleteStore = async (store: Store) => {
  const confirmed = await showConfirm(
    `Delete store "${store.name}"?`,
    'This action cannot be undone. The store will be deactivated if it has orders.'
  );
  
  if (!confirmed) return;

  try {
    await api.delete(`/outlets/${store.id}`);
    await showSuccess('Store deleted successfully');
    await loadStores();
  } catch (error: any) {
    await showError(error.response?.data?.message || 'Failed to delete store');
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  editingStore.value = null;
  storeForm.value = {
    name: '',
    address: '',
    phone: '',
    isActive: true,
  };
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
  
  loadStores();
});
</script>
