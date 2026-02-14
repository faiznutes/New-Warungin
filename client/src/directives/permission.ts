import { Directive } from 'vue';
import { useAuthStore } from '../stores/auth';

// Examples:
// v-permission="'manage_products'"  (Checks permission)
// v-role="'SUPER_ADMIN'"          (Checks role)
// v-role="['SUPER_ADMIN', 'ADMIN_TENANT']"

export const permission: Directive = {
    mounted(el, binding) {
        const { value } = binding;
        const authStore = useAuthStore();

        if (!value) return;

        const hasPermission = () => {
            if (!authStore.user) return false;
            if (authStore.user.role === 'SUPER_ADMIN') return true;
            if (authStore.user.role === 'ADMIN_TENANT') return true;

            const permissions = (authStore.user as any).permissions || {};
            return permissions[value] === true;
        };

        if (!hasPermission()) {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            } else {
                el.style.display = 'none';
            }
        }
    }
};

export const role: Directive = {
    mounted(el, binding) {
        const { value } = binding;
        const authStore = useAuthStore();

        if (!value) return;

        const hasRole = () => {
            if (!authStore.user) return false;
            const userRole = authStore.user.role;

            if (Array.isArray(value)) {
                return value.includes(userRole);
            }
            return userRole === value;
        };

        if (!hasRole()) {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            } else {
                el.style.display = 'none';
            }
        }
    }
};
