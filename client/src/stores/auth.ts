import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  tenantName: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  email?: string;
}

export const useAuthStore = defineStore('auth', () => {
  // Token storage strategy:
  // - rememberMe=true: localStorage (persists across browser restarts)
  // - rememberMe=false: sessionStorage (cleared on tab close)
  // - On init: try both, prioritize localStorage then sessionStorage
  
  // Initialize token - try localStorage first, then sessionStorage
  let initialToken: string | null = localStorage.getItem('token');
  if (!initialToken) {
    initialToken = sessionStorage.getItem('token');
  }
  
  const token = ref<string | null>(initialToken);
  const rememberMe = ref<boolean>(localStorage.getItem('rememberMe') === 'true');
  const user = ref<User | null>(null);
  const tenants = ref<Tenant[]>([]);
  const selectedTenantId = ref<string | null>(localStorage.getItem('selectedTenantId'));
  const selectedStoreId = ref<string | null>(localStorage.getItem('selectedStoreId'));
  
  // Shift status caching for CASHIER role - prevents excessive API calls
  const shiftStatus = ref<{ shiftId: string; shiftEnd: null | string; storeName: string } | null>(null);
  const shiftStatusCheckedAt = ref<number>(0);
  const SHIFT_CACHE_DURATION = 5000; // Cache shift status for 5 seconds

  // M-5 FIX: Request deduplication for fetchMe() calls
  // Prevents multiple simultaneous /auth/me requests
  let pendingFetchMePromise: Promise<any> | null = null;

  const isAuthenticated = computed(() => {
    // Check if token exists
    const hasToken = token.value;
    // Return false immediately if no token to avoid flash
    if (!hasToken) {
      return false;
    }
    // Also check user object exists
    return !!user.value;
  });
  const isSuperAdmin = computed(() => user.value?.role === 'SUPER_ADMIN');
  const currentTenantId = computed(() => {
    if (isSuperAdmin.value && selectedTenantId.value) {
      return selectedTenantId.value;
    }
    return user.value?.tenantId || null;
  });

  const currentStoreId = computed(() => selectedStoreId.value);
  
  // Check if shift status cache is still valid
  const isShiftCacheValid = computed(() => {
    return shiftStatus.value !== null && (Date.now() - shiftStatusCheckedAt.value) < SHIFT_CACHE_DURATION;
  });

  /**
   * Set authentication with token and user data
   * respects rememberMe preference for token persistence
   */
  const setAuth = (newToken: string, userData: User, remember: boolean = false) => {
    token.value = newToken;
    user.value = userData;
    rememberMe.value = remember;
    
    // Clear all storage first to ensure clean state
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('rememberMe');
    
    // Store token based on remember me preference
    if (remember) {
      // Persist across sessions
      localStorage.setItem('token', newToken);
      localStorage.setItem('rememberMe', 'true');
    } else {
      // Clear on session end (tab close)
      sessionStorage.setItem('token', newToken);
      localStorage.setItem('rememberMe', 'false');
    }
    
    // Always store user data in localStorage for faster access
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Clear shift status cache on new auth
    shiftStatus.value = null;
    shiftStatusCheckedAt.value = 0;
  };

  /**
   * Clear all authentication data from both storage locations
   * Ensures complete logout
   */
  const clearAuth = () => {
    token.value = null;
    user.value = null;
    rememberMe.value = false;
    
    // Clear from BOTH storage locations to ensure complete cleanup
    localStorage.removeItem('token');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    
    tenants.value = [];
    selectedTenantId.value = null;
    localStorage.removeItem('selectedTenantId');
    selectedStoreId.value = null;
    localStorage.removeItem('selectedStoreId');
    
    // Clear shift status on logout
    shiftStatus.value = null;
    shiftStatusCheckedAt.value = 0;
  };
  
  // Restore user from localStorage on init
  const restoreUser = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        user.value = JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Failed to restore user:', error);
    }
  };
  
  // Initialize user from localStorage
  restoreUser();

  const login = async (email: string, password: string, remember: boolean = false) => {
    const response = await api.post('/auth/login', { email, password });
    // Ensure permissions are included in user object
    const userData = response.data.user;
    const token = response.data.token;
    
    // IMPORTANT: Set token FIRST before calling /auth/me
    // This ensures the Authorization header is included in the request
    setAuth(token, userData, remember);
    
    // Always fetch fresh user data including permissions from /auth/me
    // This ensures we have the latest permissions and all user data
    try {
      const meResponse = await api.get('/auth/me');
      if (meResponse.data.user) {
        // Merge permissions from /auth/me into userData
        userData.permissions = meResponse.data.user.permissions || null;
        // Also update other fields that might be more up-to-date
        userData.tenantName = meResponse.data.user.tenantName || userData.tenantName;
        userData.isActive = meResponse.data.user.isActive !== undefined ? meResponse.data.user.isActive : userData.isActive;
        // Update stored user data with fresh data from /auth/me
        user.value = meResponse.data.user;
        localStorage.setItem('user', JSON.stringify(meResponse.data.user));
      }
    } catch (error) {
      console.warn('Failed to fetch user permissions after login:', error);
      // If /auth/me fails, use permissions from login response if available
      if (!userData.permissions) {
        userData.permissions = null;
      }
    }
    
    return response.data;
  };

  // Register removed - only super admin can create tenants

  const logout = () => {
    clearAuth();
    tenants.value = [];
    selectedTenantId.value = null;
    localStorage.removeItem('selectedTenantId');
    // Clear any pending requests by redirecting immediately
    // This prevents any pending API calls from showing error messages
  };

  const fetchTenants = async () => {
    try {
      const response = await api.get('/tenants');
      // Handle different response formats
      let tenantList: any[] = [];
      if (Array.isArray(response.data)) {
        tenantList = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        tenantList = response.data.data;
      }
      
      // Filter out System tenant (double check, backend already filters)
      // Use safe filter to ensure array
      tenants.value = safeFilter(tenantList, (tenant: any) => tenant && tenant.name !== 'System');
      return tenants.value;
    } catch (error) {
      console.error('Error fetching tenants:', error);
      tenants.value = [];
      return [];
    }
  };

  const setSelectedTenant = (tenantId: string | null) => {
    selectedTenantId.value = tenantId;
    if (tenantId) {
      localStorage.setItem('selectedTenantId', tenantId);
    } else {
      localStorage.removeItem('selectedTenantId');
    }
    // Clear store selection when tenant changes
    selectedStoreId.value = null;
    localStorage.removeItem('selectedStoreId');
  };

  const setSelectedStore = (storeId: string | null) => {
    selectedStoreId.value = storeId;
    if (storeId) {
      localStorage.setItem('selectedStoreId', storeId);
    } else {
      localStorage.removeItem('selectedStoreId');
    }
  };

  const fetchMe = async () => {
    // M-5 FIX: Return pending promise if fetchMe is already in progress
    // This prevents duplicate /auth/me requests on rapid reconnects
    if (pendingFetchMePromise) {
      console.log('[Auth] FetchMe already in progress, reusing pending promise');
      return pendingFetchMePromise;
    }

    // Create the promise and store it while request is pending
    pendingFetchMePromise = (async () => {
      try {
        // Ensure token is available
        const currentToken = token.value || localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!currentToken) {
          throw new Error('No token available');
        }
        
        // Set token in store if not already set
        if (!token.value && currentToken) {
          token.value = currentToken;
        }
        
        const response = await api.get('/auth/me');
        user.value = response.data.user;
        
        // Update stored user data
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Auto-set store for cashier/kitchen from permissions
        if (user.value && (user.value.role === 'CASHIER' || user.value.role === 'KITCHEN')) {
          const permissions = (user.value as any).permissions;
          if (permissions?.assignedStoreId) {
            setSelectedStore(permissions.assignedStoreId);
          }
          
          // H-7 FIX: Load shift status on session restore
          // This ensures cashiers see the correct shift state after page refresh
          try {
            await getShiftStatus();
            console.log('[Auth] Shift status loaded on session restore');
          } catch (shiftError) {
            console.warn('[Auth] Could not load shift status during session restore:', shiftError);
            // Don't block on shift status load - it's not critical for auth
          }
        }
        
        return response.data;
      } catch (error) {
        // Only clear auth if it's a real authentication error (401 or 404)
        // Don't clear if it's just a network error or server error (500)
        if (error && typeof error === 'object' && 'response' in error) {
          const httpError = error as { response?: { status?: number } };
          const status = httpError.response?.status;
          if (status === 401 || status === 404) {
            clearAuth();
          }
          // For 500 errors, log but don't clear auth (might be temporary server issue)
          if (status === 500) {
            console.error('Server error in /auth/me:', error);
          }
        }
        throw error;
      } finally {
        // Clear pending promise when request completes (success or error)
        pendingFetchMePromise = null;
      }
    })();

    return pendingFetchMePromise;
  };

  /**
   * Get current shift status for CASHIER role
   * Implements caching to prevent excessive API calls
   * Returns cached status if available and fresh, otherwise fetches from API
   */
  const getShiftStatus = async () => {
    // Use cache if valid
    if (isShiftCacheValid.value) {
      return shiftStatus.value;
    }

    // Only CASHIER and KITCHEN should check shift status
    if (user.value?.role !== 'CASHIER' && user.value?.role !== 'KITCHEN') {
      return null;
    }

    try {
      const response = await api.get('/cash-shift/current');
      const shift = response.data?.data || response.data;
      
      // Update cache
      shiftStatus.value = shift || null;
      shiftStatusCheckedAt.value = Date.now();
      
      return shift;
    } catch (error: any) {
      // 404 means no active shift - this is normal and expected
      if (error.response?.status === 404) {
        shiftStatus.value = null;
        shiftStatusCheckedAt.value = Date.now();
        return null;
      }
      
      // For other errors, clear cache but don't throw
      // This prevents blocking navigation on API failures
      shiftStatus.value = null;
      shiftStatusCheckedAt.value = 0;
      console.warn('Failed to fetch shift status:', error);
      return null;
    }
  };

  /**
   * Clear shift cache when needed (e.g., after opening/closing shift)
   */
  const invalidateShiftCache = () => {
    shiftStatus.value = null;
    shiftStatusCheckedAt.value = 0;
  };

  return {
    token,
    user,
    tenants,
    selectedTenantId,
    selectedStoreId,
    isAuthenticated,
    isSuperAdmin,
    currentTenantId,
    currentStoreId,
    shiftStatus,
    isShiftCacheValid,
    login,
    logout,
    fetchMe,
    fetchTenants,
    setSelectedTenant,
    setSelectedStore,
    clearAuth, // Export clearAuth for use in App.vue
    getShiftStatus,
    invalidateShiftCache,
  };
});

