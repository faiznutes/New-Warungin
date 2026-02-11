
/**
 * Standardizes error messages for user display (Indonesian)
 */
export const getFriendlyErrorMessage = (error: any): string => {
    // 1. Check for specific error codes/types
    const code = error?.code || error?.response?.data?.code;
    const status = error?.response?.status;
    const message = error?.response?.data?.message || error?.message || '';

    // Network Errors
    if (code === 'ERR_NETWORK' || code === 'ERR_INTERNET_DISCONNECTED' || message.includes('Network Error')) {
        return 'Gagal terhubung ke server. Periksa koneksi internet Anda.';
    }

    // Timeout
    if (code === 'ECONNABORTED' || message.includes('timeout')) {
        return 'Waktu permintaan habis. Silakan coba lagi.';
    }

    // Auth Errors
    if (status === 401 || message.includes('Unauthorized') || message.includes('token')) {
        return 'Sesi Anda telah berakhir. Silakan login kembali.';
    }

    if (status === 403) {
        return 'Anda tidak memiliki akses untuk melakukan tindakan ini.';
    }

    // Database/Prisma Errors (if exposed)
    if (code === 'P2002') {
        return 'Data sudah ada (duplikat). Mohon periksa kembali input Anda.';
    }

    if (code === 'P2025') {
        return 'Data tidak ditemukan.';
    }

    // Custom Application Errors
    if (message.includes('Insufficient stock') || message.includes('Stok tidak mencukupi')) {
        return 'Stok produk tidak mencukupi.';
    }

    // Validation Errors
    if (status === 400) {
        // If it's a validation array
        if (Array.isArray(error?.response?.data?.errors)) {
            return error.response.data.errors.map((e: any) => e.msg || e.message).join(', ');
        }
        return message || 'Permintaan tidak valid. Periksa input Anda.';
    }

    // Server Errors
    if (status >= 500) {
        return 'Terjadi kesalahan pada server. Silakan hubungi admin.';
    }

    // Default fallback
    return message || 'Terjadi kesalahan yang tidak diketahui.';
};
