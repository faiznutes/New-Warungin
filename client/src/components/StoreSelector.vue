<template>
  <div
    v-if="shouldShow"
    class="mb-4 sm:mb-6"
  >
    <div class="flex items-center gap-3 flex-wrap">
      <label
        for="store-select"
        class="text-sm font-medium text-gray-700 whitespace-nowrap"
      >
        Pilih Store:
      </label>
      <div class="flex-1 max-w-xs relative">
        <select
          id="store-select"
          :value="selectedStoreId || ''"
          :disabled="loading"
          class="w-full px-4 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 shadow-sm hover:shadow-md transition-all duration-200 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          @change="handleStoreChange"
        >
          <option value="">
            Semua Store
          </option>
          <option 
            v-for="store in stores" 
            :key="store.id" 
            :value="store.id"
          >
            {{ store.name }}
          </option>
        </select>
        <!-- Custom dropdown arrow -->
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg 
            class="w-5 h-5 text-gray-400"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
        <!-- Loading indicator -->
        <div
          v-if="loading"
          class="absolute inset-y-0 right-0 flex items-center pr-10"
        >
          <div class="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
      <!-- Clear button (only show when store is selected) -->
      <button
        v-if="selectedStoreId && !loading"
        type="button"
        class="px-3 py-2.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 border border-gray-300 hover:border-red-300"
        title="Tampilkan semua store"
        @click="clearSelection"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
    <!-- Selected store info -->
    <div
      v-if="selectedStoreId && selectedStoreName"
      class="mt-2 flex items-center gap-2 text-xs text-gray-600"
    >
      <svg
        class="w-4 h-4 text-green-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>Menampilkan data: <strong class="text-gray-900">{{ selectedStoreName }}</strong></span>
    </div>
    <!-- No stores message -->
    <div
      v-if="!loading && stores.length === 0 && shouldShow"
      class="mt-2 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200"
    >
      <svg
        class="w-4 h-4 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <span>Belum ada store/outlet. Silakan buat store terlebih dahulu.</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useAuthStore } from '../stores/auth';
import api from '../api';

interface Props {
  placeholder?: string;
  showInfo?: boolean;
  autoLoad?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Pilih Store',
  showInfo: true,
  autoLoad: true,
});

const emit = defineEmits<{
  'store-changed': [storeId: string | null];
}>();

const authStore = useAuthStore();
const stores = ref<any[]>([]);
const loading = ref(false);
const selectedStoreId = ref<string | null>(
  localStorage.getItem('selectedStoreId')
);

const shouldShow = computed(() => {
  // Show if user is not super admin, or if super admin has selected a tenant
  if (authStore.isSuperAdmin) {
    return !!authStore.selectedTenantId;
  }
  return true;
});

const selectedStoreName = computed(() => {
  if (!selectedStoreId.value) return '';
  const store = stores.value.find(s => s.id === selectedStoreId.value);
  return store?.name || '';
});

const loadStores = async () => {
  // Early return if should not show
  if (!shouldShow.value) {
    stores.value = [];
    loading.value = false;
    return;
  }
  
  // For super admin, ensure tenant is selected first
  if (authStore.isSuperAdmin && !authStore.selectedTenantId) {
    stores.value = [];
    loading.value = false;
    return;
  }
  
  // For admin tenant, they already have tenantId in JWT token, no need to wait
  // Only set localStorage for super admin
  if (authStore.isSuperAdmin && authStore.selectedTenantId) {
    localStorage.setItem('selectedTenantId', authStore.selectedTenantId);
  }
  
  // Set loading state
  loading.value = true;
  
  // Add timeout to prevent infinite loading
  const timeoutId = setTimeout(() => {
    if (loading.value) {
      loading.value = false;
      stores.value = [];
    }
  }, 15000); // 15 seconds timeout
  
  try {
    const response = await api.get('/outlets');
    
    // Clear timeout on success
    clearTimeout(timeoutId);
    
    // Parse response - backend returns { data: [], limit: {} }
    // Axios wraps in .data, so response.data = { data: [], limit: {} }
    let storeList = response?.data?.data;
    
    // Handle different response formats
    if (Array.isArray(storeList)) {
      // Correct format: { data: [...] } - already extracted
    } else if (Array.isArray(response?.data)) {
      // Direct array response (unlikely for /outlets but handle it)
      storeList = response.data;
    } else if (response?.data && typeof response.data === 'object') {
      // Try to extract from response.data if it's an object
      storeList = response.data.data || response.data.outlets || [];
    } else {
      storeList = [];
    }
    
    // Filter only active stores if needed, or show all stores
    // For now, show all stores (both active and inactive)
    stores.value = Array.isArray(storeList) ? storeList : [];
    
    // Debug log to help troubleshoot
    if (process.env.NODE_ENV === 'development') {
      console.log('StoreSelector: Loaded stores', {
        count: stores.value.length,
        stores: stores.value.map(s => ({ id: s.id, name: s.name, isActive: s.isActive }))
      });
    }
    
    // If no store selected but stores exist, select first one if only one store
    if (!selectedStoreId.value && stores.value.length === 1) {
      handleStoreChange({ target: { value: stores.value[0].id } } as any);
    }
  } catch (error: any) {
    // Clear timeout on error
    clearTimeout(timeoutId);
    
    // Log error for debugging (always log, not just in development)
    console.error('StoreSelector: Error loading stores', {
      error: error?.message || error,
      response: error?.response?.data,
      status: error?.response?.status,
      url: error?.config?.url
    });
    
    // Try to extract error message for user feedback
    const errorMessage = error?.response?.data?.error || error?.message || 'Gagal memuat daftar store';
    
    // Silently handle error - stores will be empty
    // Error details can be checked in browser dev tools if needed
    stores.value = [];
  } finally {
    // Always ensure loading is set to false
    loading.value = false;
  }
};

const handleStoreChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const storeId = target.value || null;
  selectedStoreId.value = storeId;
  
  if (storeId) {
    localStorage.setItem('selectedStoreId', storeId);
    authStore.setSelectedStore(storeId);
  } else {
    localStorage.removeItem('selectedStoreId');
    authStore.setSelectedStore(null);
  }
  
  emit('store-changed', storeId);
};

const clearSelection = () => {
  selectedStoreId.value = null;
  localStorage.removeItem('selectedStoreId');
  authStore.setSelectedStore(null);
  emit('store-changed', null);
};

watch(() => authStore.selectedTenantId, async (newTenantId, oldTenantId) => {
  if (newTenantId && authStore.isSuperAdmin && newTenantId !== oldTenantId) {
    // Clear store selection when tenant changes
    clearSelection();
    
    // Ensure tenantId is in localStorage
    localStorage.setItem('selectedTenantId', newTenantId);
    
    // Load stores immediately (no delay needed)
    await loadStores();
  } else if (!newTenantId && authStore.isSuperAdmin) {
    // Clear stores if tenant is deselected
    stores.value = [];
    clearSelection();
  }
});

// Watch for shouldShow changes (defer immediate to avoid initialization issues)
// Don't watch immediately - handle in onMounted instead

onMounted(async () => {
  await nextTick();
  
  // Initial load if needed
  if (props.autoLoad && shouldShow.value) {
    // Load immediately - no delays needed
    // Admin tenant already has tenantId in JWT token
    // Super admin will wait for tenant selection automatically via shouldShow computed
    await loadStores();
  }
  
  // Watch for shouldShow changes after mount
  watch(() => shouldShow.value, async (show) => {
    if (show && props.autoLoad) {
      // Load immediately when shouldShow becomes true
      await loadStores();
    } else if (!show) {
      // Clear stores and reset loading when shouldShow becomes false
      stores.value = [];
      loading.value = false;
    }
  });
});
</script>

