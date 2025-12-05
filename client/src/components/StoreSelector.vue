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
  // Show for all roles except SUPER_ADMIN (unless tenant selected)
  // ADMIN_TENANT, SUPERVISOR, CASHIER, KITCHEN should always show
  if (authStore.isSuperAdmin) {
    return !!authStore.selectedTenantId;
  }
  // For ADMIN_TENANT and other roles, always show
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
  
  // Add timeout to prevent infinite loading (reduced to 10 seconds)
  let timeoutId: NodeJS.Timeout | null = null;
  timeoutId = setTimeout(() => {
    if (loading.value) {
      console.error('StoreSelector: Timeout loading stores after 10 seconds - API may be slow or failing');
      loading.value = false;
      stores.value = [];
      // Don't show error message - just stop loading
    }
  }, 10000); // 10 seconds timeout (reduced from 15s)
  
  try {
    // For ADMIN_TENANT, ensure tenantId is available in request
    // The API interceptor should handle this, but we can also ensure it here
    // For ADMIN_TENANT, tenantId is in JWT token, so no need to add it manually
    
    // Log before request for debugging
    console.log('StoreSelector: Loading stores', {
      userRole: authStore.user?.role,
      isSuperAdmin: authStore.isSuperAdmin,
      selectedTenantId: authStore.selectedTenantId,
      currentTenantId: authStore.currentTenantId,
      shouldShow: shouldShow.value,
    });
    
    const response = await api.get('/outlets');
    
    // Clear timeout on success
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    
    // Parse response - backend returns { data: [], limit: {} }
    // Axios wraps in .data, so response.data = { data: [], limit: {} }
    let storeList = response?.data?.data;
    
    // Log raw response for debugging
    console.log('StoreSelector: Raw API response', {
      responseData: response?.data,
      responseDataType: typeof response?.data,
      isArray: Array.isArray(response?.data),
      hasData: !!response?.data?.data,
      dataIsArray: Array.isArray(response?.data?.data),
      dataLength: Array.isArray(response?.data?.data) ? response?.data?.data.length : 'not array',
    });
    
    // Handle different response formats
    if (Array.isArray(storeList)) {
      // Correct format: { data: [...] } - already extracted
      console.log('StoreSelector: Using response.data.data (correct format)', {
        count: storeList.length,
      });
    } else if (Array.isArray(response?.data)) {
      // Direct array response (unlikely for /outlets but handle it)
      console.log('StoreSelector: Using response.data directly (array format)', {
        count: response.data.length,
      });
      storeList = response.data;
    } else if (response?.data && typeof response.data === 'object') {
      // Try to extract from response.data if it's an object
      console.log('StoreSelector: Trying to extract from response.data object', {
        hasData: !!response.data.data,
        hasOutlets: !!response.data.outlets,
        hasStores: !!response.data.stores,
      });
      storeList = response.data.data || response.data.outlets || response.data.stores || [];
    } else {
      console.warn('StoreSelector: No valid store list found in response', {
        responseData: response?.data,
      });
      storeList = [];
    }
    
    // Ensure storeList is an array
    if (!Array.isArray(storeList)) {
      console.error('StoreSelector: storeList is not an array', {
        storeList,
        type: typeof storeList,
      });
      storeList = [];
    }
    
    // Filter only active stores if needed, or show all stores
    // For now, show all stores (both active and inactive)
    stores.value = storeList;
    
    // Log final stores
    console.log('StoreSelector: Final stores array', {
      count: stores.value.length,
      stores: stores.value.map(s => ({ id: s.id, name: s.name, isActive: s.isActive })),
    });
    
    // Debug log to help troubleshoot
    console.log('StoreSelector: Loaded stores successfully', {
      count: stores.value.length,
      userRole: authStore.user?.role,
      isSuperAdmin: authStore.isSuperAdmin,
      selectedTenantId: authStore.selectedTenantId,
      currentTenantId: authStore.currentTenantId,
      responseData: response?.data,
      stores: stores.value.map(s => ({ id: s.id, name: s.name, isActive: s.isActive }))
    });
    
    // If no store selected but stores exist, select first one if only one store
    if (!selectedStoreId.value && stores.value.length === 1) {
      handleStoreChange({ target: { value: stores.value[0].id } } as any);
    }
  } catch (error: any) {
    // Clear timeout on error
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    
    // Log error for debugging (always log, not just in development)
    console.error('StoreSelector: Error loading stores', {
      error: error?.message || error,
      response: error?.response?.data,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      url: error?.config?.url,
      method: error?.config?.method,
      userRole: authStore.user?.role,
      isSuperAdmin: authStore.isSuperAdmin,
      selectedTenantId: authStore.selectedTenantId,
      currentTenantId: authStore.currentTenantId,
      token: authStore.user ? 'exists' : 'missing',
      fullError: error,
    });
    
    // Try to extract error message for user feedback
    const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Gagal memuat daftar store';
    
    // Show error message in console for debugging
    if (error?.response?.status === 400 || error?.response?.status === 403) {
      console.error('StoreSelector: Tenant ID or permission error', {
        status: error?.response?.status,
        message: errorMessage,
        data: error?.response?.data,
      });
    }
    
    // For network errors or 502/503/504, try to retry once after 2 seconds
    const isNetworkError = !error?.response || 
                          error?.response?.status >= 500 || 
                          error?.code === 'ECONNABORTED' ||
                          error?.code === 'ERR_NETWORK';
    
    if (isNetworkError && !timeoutId) {
      console.warn('StoreSelector: Network error detected, will retry once after 2 seconds');
      setTimeout(async () => {
        // Only retry if still should show and not already loading
        if (shouldShow.value && !loading.value) {
          console.log('StoreSelector: Retrying loadStores after network error');
          await loadStores();
        }
      }, 2000);
    }
    
    // Silently handle error - stores will be empty
    // Error details can be checked in browser dev tools if needed
    stores.value = [];
  } finally {
    // Always ensure loading is set to false (critical!)
    // This must be in finally block to ensure it always runs
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
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
    // Add small delay to ensure authStore is fully initialized
    await new Promise(resolve => setTimeout(resolve, 200)); // Increased to 200ms
    
    // Only load if still should show and not already loading
    if (shouldShow.value && !loading.value) {
      await loadStores();
    }
  }
  
  // Watch for shouldShow changes after mount
  watch(() => shouldShow.value, async (show) => {
    if (show && props.autoLoad && !loading.value) {
      // Load immediately when shouldShow becomes true
      await new Promise(resolve => setTimeout(resolve, 200)); // Increased to 200ms
      if (shouldShow.value && !loading.value) {
        await loadStores();
      }
    } else if (!show) {
      // Clear stores and reset loading when shouldShow becomes false
      stores.value = [];
      loading.value = false;
    }
  });
  
  // Also watch for authStore.user changes (for ADMIN_TENANT login)
  watch(() => authStore.user?.role, async (newRole, oldRole) => {
    if (newRole && newRole !== oldRole && props.autoLoad && shouldShow.value && !loading.value) {
      // User role changed, reload stores
      await new Promise(resolve => setTimeout(resolve, 200)); // Increased to 200ms
      if (shouldShow.value && !loading.value) {
        await loadStores();
      }
    }
  });
  
  // Watch for authStore.isAuthenticated to reload when user logs in
  watch(() => authStore.isAuthenticated, async (isAuth, wasAuth) => {
    if (isAuth && !wasAuth && props.autoLoad && shouldShow.value && !loading.value) {
      // User just logged in, load stores
      await new Promise(resolve => setTimeout(resolve, 300)); // Wait a bit longer after login
      if (shouldShow.value && !loading.value) {
        await loadStores();
      }
    }
  });
});
</script>

