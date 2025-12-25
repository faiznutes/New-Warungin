<template>
  <div class="min-h-screen bg-[#f6f7f8] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <!-- Logo Section -->
      <div class="text-center mb-8">
        <router-link to="/" class="inline-flex flex-col items-center hover:opacity-90 transition-opacity">
          <div class="w-16 h-16 bg-gradient-to-br from-[#3f68e4] to-[#5b7fe8] rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-primary/30">
            <span class="material-symbols-outlined text-white text-[32px]">store</span>
          </div>
          <h1 class="text-3xl font-bold text-[#3f68e4]">Warungin</h1>
          <p class="text-slate-500 mt-1">Modern System for SMEs</p>
        </router-link>
      </div>

      <!-- Login Card -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-8 border border-slate-100 dark:border-slate-700/50">
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center">Sign In to Your Account</h2>
        <p class="text-slate-500 text-center mb-6 text-sm">Manage your business with ease</p>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Email Input -->
          <div>
            <label for="email" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Email
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="material-symbols-outlined text-slate-400 text-[20px]">mail</span>
              </div>
              <input
                id="email"
                v-model="email"
                type="email"
                required
                class="block w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-slate-900 dark:text-white placeholder-slate-400"
                placeholder="name@email.com"
              />
            </div>
          </div>

          <!-- Password Input -->
          <div>
            <label for="password" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Password
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="material-symbols-outlined text-slate-400 text-[20px]">lock</span>
              </div>
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="block w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-slate-900 dark:text-white placeholder-slate-400"
                placeholder="Enter your password"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                tabindex="-1"
              >
                <span class="material-symbols-outlined text-[20px]">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
          </div>

          <!-- Remember Me Checkbox -->
          <div class="flex items-center">
            <input
              id="remember-me"
              v-model="rememberMe"
              type="checkbox"
              class="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
            />
            <label for="remember-me" class="ml-2 block text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
              Remember me
            </label>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 px-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
          >
            <span v-if="!loading">Sign In</span>
            <span v-else class="flex items-center gap-2">
              <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </span>
          </button>
        </form>

        <!-- Footer Links -->
        <div class="mt-6 text-center">
          <p class="text-sm text-slate-600 dark:text-slate-400">
            Don't have an account?
            <router-link to="/contact" class="text-primary hover:text-primary-hover font-medium">
              Contact us
            </router-link>
          </p>
        </div>
      </div>

      <!-- Additional Info -->
      <div class="mt-6 text-center">
        <p class="text-sm text-slate-500">
          Forgot your password?
          <router-link to="/contact" class="text-primary hover:text-primary-hover font-medium">
            Reset here
          </router-link>
        </p>
      </div>
    </div>
  </div>

  <!-- Store Selector Modal -->
  <StoreSelectorModal
    :show="showStoreSelector"
    :required="true"
    @close="handleStoreSelectorClose"
    @select="handleStoreSelected"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';
import StoreSelectorModal from '../../components/StoreSelectorModal.vue';

const router = useRouter();
const { error: showError, warning: showWarning } = useNotification();
const route = useRoute();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const loading = ref(false);
const showPassword = ref(false);
const rememberMe = ref(localStorage.getItem('rememberMe') === 'true');
const showStoreSelector = ref(false);

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  if (authStore.isAuthenticated) {
    const redirect = route.query.redirect as string;
    if (redirect) {
    router.push(redirect);
    } else {
      router.push('/app');
    }
    return;
  }
  
  if (rememberMe.value) {
    const storedEmail = localStorage.getItem('rememberedEmail');
    if (storedEmail) {
      email.value = storedEmail;
    }
  }
});

const handleLogin = async () => {
  loading.value = true;
  try {
    const trimmedEmail = email.value.trim();
    const trimmedPassword = password.value.trim();
    
    if (!trimmedEmail || !trimmedPassword) {
      await showWarning('Email and password are required');
      loading.value = false;
      return;
    }
    
    await authStore.login(trimmedEmail, trimmedPassword, rememberMe.value);
    
    let retries = 0;
    while (!authStore.user && retries < 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retries++;
    }
    
    if (!authStore.user) {
      try {
        await authStore.fetchMe();
      } catch (error) {
        console.error('Failed to fetch user after login:', error);
      }
    }
    
    if (rememberMe.value) {
      localStorage.setItem('rememberedEmail', trimmedEmail);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
    
    const user = authStore.user;
    
    if (user && ['SUPERVISOR', 'CASHIER', 'KITCHEN'].includes(user.role)) {
      const permissions = user.permissions as any;
      let storeToSelect: string | null = null;
      
      try {
        const outletsResponse = await api.get('/outlets');
        const allOutlets = outletsResponse.data?.data || [];
        const activeOutlets = allOutlets.filter((o: any) => o.isActive !== false);
        
        if (user.role === 'CASHIER' || user.role === 'KITCHEN') {
          const assignedStoreId = permissions?.assignedStoreId;
          if (assignedStoreId) {
            const assignedStore = activeOutlets.find((o: any) => o.id === assignedStoreId);
            if (assignedStore) {
              storeToSelect = assignedStoreId;
            }
          }
        } else if (user.role === 'SUPERVISOR') {
          const allowedStoreIds = Array.isArray(permissions?.allowedStoreIds) 
            ? permissions.allowedStoreIds 
            : [];
          
          if (allowedStoreIds.length > 0) {
            const allowedOutlets = activeOutlets.filter((o: any) => 
              allowedStoreIds.includes(o.id)
            );
            
            if (allowedOutlets.length === 1) {
              storeToSelect = allowedOutlets[0].id;
            } else if (allowedOutlets.length > 1) {
              const savedStoreId = localStorage.getItem('selectedStoreId');
              const savedStore = allowedOutlets.find((o: any) => o.id === savedStoreId);
              storeToSelect = savedStore ? savedStoreId : allowedOutlets[0].id;
            }
          }
        }
        
        if (storeToSelect) {
          authStore.setSelectedStore(storeToSelect);
          localStorage.setItem('selectedStoreId', storeToSelect);
        } else if (activeOutlets.length === 0) {
          await showWarning('No stores available. Please contact admin to create a store first.');
        } else if (user.role === 'SUPERVISOR' && Array.isArray(permissions?.allowedStoreIds) && permissions.allowedStoreIds.length > 1) {
          const allowedStoreIds = permissions.allowedStoreIds;
          const allowedOutlets = activeOutlets.filter((o: any) => allowedStoreIds.includes(o.id));
          if (allowedOutlets.length > 0) {
            const savedStoreId = localStorage.getItem('selectedStoreId');
            const savedStore = allowedOutlets.find((o: any) => o.id === savedStoreId);
            const storeId = savedStore ? savedStoreId : allowedOutlets[0].id;
            authStore.setSelectedStore(storeId);
            localStorage.setItem('selectedStoreId', storeId);
          }
        }
      } catch (error) {
        console.error('Error auto-selecting store:', error);
      }
    }
    
    const redirect = route.query.redirect as string;
    if (redirect) {
      router.push(redirect);
    } else {
      const userRole = authStore.user?.role;
      
      if (userRole === 'CASHIER') {
        try {
          const selectedStoreId = authStore.selectedStoreId || localStorage.getItem('selectedStoreId');
          if (selectedStoreId) {
            const storeShiftResponse = await api.get('/store-shift/current', {
              params: { outletId: selectedStoreId },
            });
            const storeShift = storeShiftResponse.data.data;
            
            if (!storeShift) {
              router.push({ name: 'cash-shift' });
              return;
            }
            
            try {
              const cashShiftResponse = await api.get('/cash-shift/current');
              const cashShift = cashShiftResponse.data.data;
              
              if (!cashShift) {
                router.push({ name: 'cash-shift' });
                return;
              }
            } catch (cashShiftError: any) {
              if (cashShiftError.response?.status === 404 || !cashShiftError.response?.data?.data) {
                router.push({ name: 'cash-shift' });
                return;
              }
            }
          } else {
            router.push({ name: 'cash-shift' });
            return;
          }
        } catch (error: any) {
          console.error('Error checking shift:', error);
          router.push({ name: 'cash-shift' });
          return;
        }
      }
      
      if (userRole === 'SUPER_ADMIN') {
        router.push({ name: 'super-dashboard' });
      } else {
        router.push({ name: 'dashboard' });
      }
    }
  } catch (error: any) {
    if (error.response?.status === 429) {
      const retryAfter = error.response?.data?.retryAfter;
      let message = error.response?.data?.message || error.response?.data?.error || 'Too many login attempts';
      
      if (retryAfter) {
        const minutes = Math.ceil(retryAfter / 60);
        message = `${message}. Please try again in ${minutes} minutes.`;
      } else {
        message = `${message}. Please wait before trying again.`;
      }
      
      await showError(message);
    } else if (error.response?.status === 403) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
      
      if (errorMessage && (
        errorMessage.includes('Store') || 
        errorMessage.includes('store') ||
        errorMessage.includes('tidak aktif') ||
        errorMessage.includes('memindahkan') ||
        errorMessage.includes('ditetapkan') ||
        errorMessage.includes('diizinkan')
      )) {
        await showWarning(errorMessage, 'Store Inactive');
      } else {
        await showError(errorMessage || 'Access denied');
      }
    } else {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
      
      if (errorMessage) {
        await showError(errorMessage);
      } else {
        await showError('Invalid email or password');
      }
    }
    console.error('Login error:', error);
  } finally {
    loading.value = false;
  }
};

const handleStoreSelectorClose = () => {
  showStoreSelector.value = false;
  const redirect = route.query.redirect as string;
  if (redirect) {
  router.push(redirect);
  } else {
    const userRole = authStore.user?.role;
    if (userRole === 'SUPER_ADMIN') {
      router.push({ name: 'super-dashboard' });
    } else {
      router.push({ name: 'dashboard' });
    }
  }
};

const handleStoreSelected = (storeId: string) => {
  showStoreSelector.value = false;
  const redirect = route.query.redirect as string;
  if (redirect) {
  router.push(redirect);
  } else {
    const userRole = authStore.user?.role;
    if (userRole === 'SUPER_ADMIN') {
      router.push({ name: 'super-dashboard' });
    } else {
      router.push({ name: 'dashboard' });
    }
  }
};
</script>
