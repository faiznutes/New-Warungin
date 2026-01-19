import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import api from '../api';

export const checkStoreAccess = async (
    to: RouteLocationNormalized,
    next: NavigationGuardNext
) => {
    const authStore = useAuthStore();
    const hasToken = localStorage.getItem('token') || sessionStorage.getItem('token');

    if (hasToken && authStore.user && authStore.isAuthenticated) {
        const userRole = authStore.user.role;
        // ADMIN_TENANT tidak perlu toko - skip check
        const requiresStore = ['CASHIER', 'SUPERVISOR', 'KITCHEN'].includes(userRole);
        const hasStore = authStore.selectedStoreId || localStorage.getItem('selectedStoreId');

        if (requiresStore && !hasStore && to.name !== 'login' && to.name !== 'unauthorized') {
            // H-6 FIX: Better error handling for store selector
            // Check if user has any stores available with improved error handling
            try {
                // Add timeout to prevent hanging (5 seconds)
                const timeoutPromise = new Promise<any>((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout')), 5000)
                );

                const outletsPromise = api.get('/outlets');
                const outletsResponse = await Promise.race([outletsPromise, timeoutPromise]);

                const outletsData = outletsResponse.data?.data || outletsResponse.data || [];
                // NORMALISASI: Pastikan outlets selalu array
                const outlets = Array.isArray(outletsData) ? outletsData : [];

                // LOGGING: Log untuk debugging
                console.log('[Router] Checking outlets for role guard:', {
                    outletsType: typeof outlets,
                    outletsIsArray: Array.isArray(outlets),
                    outletsLength: outlets.length
                });

                // GUARD CLAUSE: Safe filter dengan check
                const activeOutlets = Array.isArray(outlets)
                    ? outlets.filter((o: any) => o && o.isActive !== false)
                    : [];

                if (!Array.isArray(activeOutlets) || activeOutlets.length === 0) {
                    // No stores available - show warning for SPV/kasir/dapur
                    const warning = 'Tidak ada toko yang aktif tersedia. Silakan hubungi admin untuk membuat atau mengaktifkan toko terlebih dahulu.';
                    next({
                        name: 'unauthorized',
                        query: { message: warning }
                    });
                    return true; // Stop navigation
                } else {
                    // Has stores but not selected - redirect to login to show store selector
                    next({ name: 'login', query: { redirect: to.fullPath } });
                    return true; // Stop navigation
                }
            } catch (error: any) {
                console.error('Error checking stores:', error);

                // Timeout or network error
                if (error.message === 'Timeout' || !error.response) {
                    const timeoutMessage = 'Toko tidak dapat dimuat. Silakan periksa koneksi internet Anda dan coba lagi.';
                    next({
                        name: 'unauthorized',
                        query: { message: timeoutMessage }
                    });
                    return true; // Stop navigation
                }

                // Other API error
                const warning = 'Tidak dapat memverifikasi akses toko. Silakan hubungi admin untuk bantuan.';
                next({
                    name: 'unauthorized',
                    query: { message: warning }
                });
                return true; // Stop navigation
            }
        }
    }
    return false; // Proceed to next checks
};
