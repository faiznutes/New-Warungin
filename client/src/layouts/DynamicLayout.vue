<template>
  <component v-if="layoutComponent" :is="layoutComponent" />
</template>

<script setup lang="ts">
import { computed, shallowRef, watch, onMounted, nextTick } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

// Use shallowRef to avoid deep reactivity issues with component references
const layoutComponent = shallowRef<any>(null);

// Load layout component based on role
const loadLayout = async (role: string | undefined) => {
  if (!role) {
    layoutComponent.value = null;
    return;
  }

  try {
    switch (role) {
      case 'SUPER_ADMIN':
        layoutComponent.value = (await import('./SuperAdminLayout.vue')).default;
        break;
      case 'ADMIN_TENANT':
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
    console.error('Error loading layout:', error);
    // Fallback to AppLayout
    layoutComponent.value = (await import('./AppLayout.vue')).default;
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

