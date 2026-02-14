import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';

export const usePermissions = () => {
  const authStore = useAuthStore();

  const hasRole = (roles: string | string[]) => {
    if (!authStore.user) return false;
    const userRole = authStore.user.role;

    if (Array.isArray(roles)) {
      return roles.includes(userRole);
    }
    return userRole === roles;
  };

  const hasPermission = (permission: string) => {
    if (!authStore.user) return false;
    // Super Admin has all permissions
    if (authStore.user.role === 'SUPER_ADMIN') return true;

    // Admin Tenant has all permissions within tenant (usually)
    // But for granular checks, we might want to be specific
    if (authStore.user.role === 'ADMIN_TENANT') return true;

    const permissions = (authStore.user as any).permissions || {};
    return permissions[permission] === true;
  };

  const can = (action: string, subject?: string) => {
    // Legacy support or specific format support
    return hasPermission(action);
  };

  const canManageProducts = computed(() => hasPermission('canManageProducts'));
  const canViewReports = computed(() => hasPermission('canViewReports'));
  const canEditOrders = computed(() => hasPermission('canEditOrders'));
  const canManageCustomers = computed(() => hasPermission('canManageCustomers'));

  return {
    hasRole,
    hasPermission,
    can,
    canManageProducts,
    canViewReports,
    canEditOrders,
    canManageCustomers
  };
};
