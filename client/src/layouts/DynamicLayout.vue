<template>
  <div v-if="!layoutComponent && loading" class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-gray-600">Memuat...</p>
    </div>
  </div>
  <component
    v-else-if="layoutComponent"
    :is="layoutComponent"
  />
  <div v-else class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <p class="text-red-600 mb-2">Gagal memuat layout</p>
      <button
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        @click="retryLoadLayout"
      >
        Coba Lagi
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, shallowRef, watch, onMounted, nextTick } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

// Use shallowRef to avoid deep reactivity issues with component references
const layoutComponent = shallowRef<any>(null);
const loading = shallowRef<boolean>(true);

// Load layout component based on role
const loadLayout = async (role: string | undefined) => {
  if (!role) {
    layoutComponent.value = null;
    loading.value = false;
    return;
  }

  loading.value = true;
  try {
    switch (role) {
      case 'SUPER_ADMIN':
        layoutComponent.value = (await import('./SuperAdminLayout.vue')).default;
        break;
      case 'ADMIN_TENANT':
        // ADMIN_TENANT uses AppLayout for full menu access
        layoutComponent.value = (await import('./AppLayout.vue')).default;
        break;
      case 'SUPERVISOR':
        layoutComponent.value = (await import('./TenantLayout.vue')).default;
        break;
      case 'CASHIER':
        layoutComponent.value = (await import('./KasirLayout.vue')).default;
        break;
      case 'KITCHEN':
        layoutComponent.value = (await import('./KitchenLayout.vue')).default;
        break;
      default:
        layoutComponent.value = (await import('./AppLayout.vue')).default;
        break;
    }
  } catch (error) {
    // Silently handle error and fallback to AppLayout
    try {
      layoutComponent.value = (await import('./AppLayout.vue')).default;
    } catch (fallbackError) {
      // If AppLayout also fails, try one more time with different import syntax
      try {
        const AppLayoutModule = await import('./AppLayout.vue');
        layoutComponent.value = AppLayoutModule.default || AppLayoutModule;
      } catch (lastResortError) {
        // Even if all imports fail, we should still have AppLayout available
        // This should never happen in production, but set to null as last resort
        layoutComponent.value = null;
      }
    }
  } finally {
    // Final safety check: if we still don't have a layout, try AppLayout one last time
    if (!layoutComponent.value) {
      try {
        const AppLayoutModule = await import('./AppLayout.vue');
        layoutComponent.value = AppLayoutModule.default || AppLayoutModule;
      } catch (finalError) {
        // If this also fails, we'll show the error UI (this should be extremely rare)
        // But don't set loading to false yet - let the error UI show
      }
    }
    loading.value = false;
  }
};

// Retry loading layout
const retryLoadLayout = () => {
  if (authStore.user?.role) {
    loadLayout(authStore.user.role);
  }
};

// Watch for user changes and load appropriate layout (defer to onMounted to avoid initialization issues)
// Don't watch immediately - handle in onMounted instead

onMounted(async () => {
  // Use nextTick to ensure all reactive dependencies are ready
  await nextTick();
  
  // Initial load
  if (authStore.user?.role) {
    loadLayout(authStore.user.role);
  }
  
  // Watch for role changes after mount (safe to do now)
  watch(() => authStore.user?.role, (role) => {
    if (!authStore.user || !authStore.isAuthenticated) {
      layoutComponent.value = null;
      return;
    }
    loadLayout(role);
  });
});
</script>

