import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

export const useTenantCheck = () => {
  const authStore = useAuthStore();
  const router = useRouter();
  const showTenantModal = ref(false);

  const needsTenantSelection = computed(() => {
    return authStore.isSuperAdmin && !authStore.selectedTenantId;
  });

  const checkTenantBeforeAction = (callback: () => void) => {
    if (needsTenantSelection.value) {
      showTenantModal.value = true;
    } else {
      callback();
    }
  };

  const handleTenantSelected = async (tenantId?: string) => {
    if (tenantId) {
      authStore.setSelectedTenant(tenantId);
      showTenantModal.value = false;
      // Force reload to refresh data with new tenant
      window.location.reload();
    }
  };

  // Watch for Super Admin login and fetch tenants (defer to onMounted to avoid initialization issues)
  // Don't watch immediately - handle in onMounted instead

  // Watch for selectedTenantId changes and auto-close modal
  watch(
    () => authStore.selectedTenantId,
    (newTenantId) => {
      if (newTenantId && showTenantModal.value) {
        showTenantModal.value = false;
      }
    }
  );

  // Set up watch for Super Admin after mount
  onMounted(async () => {
    await nextTick();
    
    // Watch for Super Admin login and fetch tenants
    watch(
      () => authStore.isSuperAdmin,
      async (isSuperAdmin) => {
        if (isSuperAdmin && authStore.tenants.length === 0) {
          try {
            await authStore.fetchTenants();
          } catch (error) {
            // Silently fail - tenant selection is optional
          }
        }
      }
    );
  });

  return {
    needsTenantSelection,
    showTenantModal,
    checkTenantBeforeAction,
    handleTenantSelected,
  };
};

