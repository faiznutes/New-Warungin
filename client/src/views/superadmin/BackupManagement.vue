<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col">
        <h2 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Backup Management</h2>
        <p class="text-slate-500 dark:text-slate-400 mt-1">Monitor and manage daily backups for all tenants.</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50">
      <div class="flex items-center gap-2 mb-4">
         <span class="material-symbols-outlined text-primary">filter_list</span>
         <h3 class="font-bold text-slate-900 dark:text-white">Filter Backups</h3>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tenant</label>
          <div class="relative">
             <select
               v-model="filters.tenantId"
               class="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white appearance-none cursor-pointer"
             >
               <option value="">All Tenants</option>
               <option v-for="tenant in tenants" :key="tenant.id" :value="tenant.id">
                 {{ tenant.name }}
               </option>
             </select>
             <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                <span class="material-symbols-outlined">expand_more</span>
             </div>
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
          <div class="relative">
             <select
               v-model="filters.status"
               class="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white appearance-none cursor-pointer"
             >
               <option value="">All Status</option>
               <option value="success">Success</option>
               <option value="failed">Failed</option>
               <option value="email_failed">Email Failed</option>
             </select>
             <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                <span class="material-symbols-outlined">expand_more</span>
             </div>
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start Date</label>
          <input
            v-model="filters.startDate"
            type="date"
            class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Tanggal Akhir</label>
          <input
            v-model="filters.endDate"
            type="date"
            class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/50 text-[#0d141b] dark:text-white"
          />
        </div>
      </div>
      <div class="mt-6 flex justify-end gap-3">
        <button
          @click="resetFilters"
          class="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-[#4c739a] rounded-xl text-sm font-bold transition"
        >
          Reset
        </button>
        <button
          @click="loadBackups"
          class="px-6 py-2 bg-[#137fec] hover:bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 transition flex items-center gap-2"
        >
          <span class="material-symbols-outlined text-[18px]">search</span>
          Filter
        </button>
      </div>
    </div>

    <!-- Backup Logs Table -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col min-h-0">
      <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
        <h2 class="text-lg font-bold text-[#0d141b] dark:text-white">Backup Logs</h2>
        <button
          @click="loadBackups"
          class="p-2 text-[#4c739a] hover:text-[#137fec] rounded-lg hover:bg-slate-50 transition"
          title="Refresh"
        >
          <span class="material-symbols-outlined text-[20px]">refresh</span>
        </button>
      </div>

      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
         <div class="w-12 h-12 border-4 border-[#137fec] border-t-transparent rounded-full animate-spin mb-4"></div>
         <div class="text-[#4c739a] font-medium text-sm">Memuat data backup...</div>
      </div>

      <div v-else-if="backupLogs.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
        <div class="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-full mb-3">
            <span class="material-symbols-outlined text-slate-300 text-4xl">backup_table</span>
        </div>
        <p class="text-[#0d141b] dark:text-white font-bold">No backup logs yet</p>
        <p class="text-[#4c739a] text-sm mt-1">No backup data available with this filter.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
          <thead class="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Tenant</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Last Backup</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Email Sent</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Size</th>
              <th class="px-6 py-4 text-right text-xs font-bold text-[#4c739a] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
            <tr
              v-for="log in backupLogs"
              :key="log.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
              :class="{
                'bg-red-50/50': criticalTenants.has(log.tenantId) || (log.status === 'failed' && !criticalTenants.has(log.tenantId)),
                'bg-amber-50/50': log.status === 'email_failed' && !criticalTenants.has(log.tenantId),
              }"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div>
                    <div class="text-sm font-bold text-[#0d141b] dark:text-white">{{ log.tenant.name }}</div>
                    <div class="text-xs text-[#4c739a]">{{ log.tenant.email }}</div>
                  </div>
                  <span
                    v-if="criticalTenants.has(log.tenantId)"
                    class="px-2 py-0.5 text-[10px] font-bold rounded-md bg-red-100 text-red-700 border border-red-200 flex items-center gap-1"
                    title="Backup gagal 3+ hari berturut-turut"
                  >
                    <span class="material-symbols-outlined text-[12px]">warning</span>
                    KRITIS
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-[#0d141b] dark:text-white font-medium">
                {{ formatDate(log.generatedAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border"
                  :class="[
                    log.status === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    log.status === 'email_failed' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                    'bg-red-50 text-red-700 border-red-100'
                  ]"
                  :title="log.errorMessage || ''"
                >
                  {{ log.status === 'success' ? 'Success' : log.status === 'email_failed' ? 'Email Failed' : 'Failed' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-[#4c739a]">
                {{ log.emailSentAt ? formatDate(log.emailSentAt) : '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-[#0d141b] dark:text-white">
                {{ formatFileSize(log.size || 0) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="flex items-center justify-end gap-1 opacity-0 hover:opacity-100 transition-opacity">
                  <button
                    @click="viewBackup(log.id)"
                    class="p-2 text-[#4c739a] hover:text-[#137fec] hover:bg-blue-50 rounded-lg transition"
                    title="View Backup"
                  >
                    <span class="material-symbols-outlined text-[20px]">visibility</span>
                  </button>
                  <button
                    @click="downloadBackup(log.id)"
                    class="p-2 text-[#4c739a] hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                    title="Download"
                  >
                    <span class="material-symbols-outlined text-[20px]">download</span>
                  </button>
                  <button
                    v-if="log.status === 'email_failed' || !log.emailSentAt"
                    @click="resendEmail(log.id)"
                    class="p-2 text-[#4c739a] hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                    title="Resend Email"
                  >
                   <span class="material-symbols-outlined text-[20px]">send</span>
                  </button>
                  <button
                    @click="regenerateBackup(log.tenantId)"
                    class="p-2 text-[#4c739a] hover:text-violet-600 hover:bg-violet-50 rounded-lg transition"
                    title="Regenerate Backup"
                  >
                    <span class="material-symbols-outlined text-[20px]">autorenew</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <div class="text-sm text-[#4c739a]">
          Menampilkan <span class="font-bold text-[#0d141b] dark:text-white">{{ (pagination.page - 1) * pagination.limit + 1 }}</span> - <span class="font-bold text-[#0d141b] dark:text-white">{{ Math.min(pagination.page * pagination.limit, pagination.total) }}</span> dari <span class="font-bold text-[#0d141b] dark:text-white">{{ pagination.total }}</span> entries
        </div>
        <div class="flex gap-2">
          <button
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="px-4 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition text-[#0d141b] dark:text-white"
          >
            Sebelumnya
          </button>
          <button
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page === pagination.totalPages"
            class="px-4 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition text-[#0d141b] dark:text-white"
          >
            Selanjutnya
          </button>
        </div>
      </div>
    </div>

    <!-- View Backup Modal -->
    <Teleport to="body">
      <div
        v-if="showViewModal"
        class="fixed inset-0 bg-[#0d141b]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
        @click.self="showViewModal = false"
      >
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
          <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
            <div class="flex items-center gap-3">
               <div class="bg-white p-2 rounded-lg border border-slate-200 shadow-sm text-[#137fec]">
                  <span class="material-symbols-outlined">description</span>
               </div>
               <h3 class="text-xl font-bold text-[#0d141b] dark:text-white">View Backup</h3>
            </div>
            <button
              @click="showViewModal = false"
              class="text-[#4c739a] hover:text-[#0d141b] transition-colors"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="flex-1 overflow-auto bg-white p-8">
            <div v-if="viewingBackup" v-html="viewingBackup" class="backup-content prose max-w-none"></div>
            <div v-else class="flex flex-col items-center justify-center h-full text-[#4c739a]">
               <div class="w-10 h-10 border-4 border-[#137fec] border-t-transparent rounded-full animate-spin mb-4"></div>
               <p>Memuat konten backup...</p>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';

const { success: showSuccess, error: showError, confirm: showConfirm } = useNotification();

const loading = ref(true);
const backupLogs = ref<any[]>([]);
const tenants = ref<any[]>([]);
const criticalTenants = ref<Set<string>>(new Set());
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
});

const filters = ref({
  tenantId: '',
  status: '',
  startDate: '',
  endDate: '',
});

const showViewModal = ref(false);
const viewingBackup = ref<string | null>(null);

const loadTenants = async () => {
  try {
    const response = await api.get('/tenants', { 
      params: { limit: 1000 },
      timeout: 5000, // 5 second timeout
    });
    tenants.value = response.data?.data || [];
  } catch (error: any) {
    console.error('Error loading tenants:', error);
    tenants.value = []; // Set empty array on error
  }
};

const loadCriticalTenants = async () => {
  try {
    const response = await api.get('/superadmin/backups/critical', {
      timeout: 5000, // 5 second timeout
    });
    const critical = response.data?.criticalTenants || [];
    criticalTenants.value = new Set(critical.map((t: any) => t.tenantId));
    
    if (critical.length > 0) {
      showError(
        `⚠️ Peringatan: ${critical.length} tenant memiliki backup gagal 3+ hari berturut-turut!`,
        'Tenant Bermasalah'
      );
    }
  } catch (error: any) {
    console.error('Error loading critical tenants:', error);
    criticalTenants.value = new Set(); // Set empty set on error
  }
};

const loadBackups = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: pagination.value.page,
      limit: pagination.value.limit,
    };

    if (filters.value.tenantId) {
      params.tenantId = filters.value.tenantId;
    }
    if (filters.value.status) {
      params.status = filters.value.status;
    }
    if (filters.value.startDate) {
      params.startDate = filters.value.startDate;
    }
    if (filters.value.endDate) {
      params.endDate = filters.value.endDate;
    }

    const response = await api.get('/superadmin/backups', { 
      params,
      timeout: 10000, // 10 second timeout
    });
    
    // Handle response format
    if (response.data && response.data.data) {
      backupLogs.value = response.data.data || [];
      pagination.value = response.data.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      };
    } else {
      backupLogs.value = [];
      pagination.value = {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      };
    }
  } catch (error: any) {
    console.error('Error loading backups:', error);
    
    // Handle different error types
    const errorMessage = error.response?.data?.message || error.message || 'Gagal memuat backup';
    const errorCode = error.response?.data?.error || '';
    
    // Only show error if it's not a database connection error or empty result
    if (errorCode === 'DATABASE_CONNECTION_ERROR') {
      await showError('Koneksi database gagal. Silakan coba lagi nanti.', 'Koneksi Error');
    } else if (errorCode === 'DATABASE_ERROR') {
      await showError('Terjadi kesalahan pada database. Silakan hubungi administrator.', 'Database Error');
    } else if (error.response?.status === 403) {
      await showError('Anda tidak memiliki akses untuk melihat backup logs.', 'Akses Ditolak');
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      await showError('Request timeout. Silakan coba lagi.', 'Timeout');
    } else if (error.response?.status !== 404 && !errorMessage.includes('Network')) {
      await showError(errorMessage || 'Gagal memuat backup. Silakan coba lagi.', 'Error');
    }
    
    // Set empty state
    backupLogs.value = [];
    pagination.value = {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    };
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.value = {
    tenantId: '',
    status: '',
    startDate: '',
    endDate: '',
  };
  pagination.value.page = 1;
  loadBackups();
};

const changePage = (page: number) => {
  pagination.value.page = page;
  loadBackups();
};

const formatDate = (date: string | Date) => {
  if (!date) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const viewBackup = async (backupId: string) => {
  try {
    showViewModal.value = true;
    viewingBackup.value = null;
    const response = await api.get(`/superadmin/backups/${backupId}/view`, {
      responseType: 'text',
    });
    if (response.data) {
      viewingBackup.value = response.data;
    } else {
      throw new Error('Backup content is empty');
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Gagal memuat backup';
    await showError(errorMessage);
    showViewModal.value = false;
    viewingBackup.value = null;
  }
};

const downloadBackup = async (backupId: string) => {
  try {
    const response = await api.get(`/superadmin/backups/${backupId}/download`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-${backupId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    showSuccess('Backup berhasil diunduh');
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal mengunduh backup');
  }
};

const resendEmail = async (backupId: string) => {
  const confirmed = await showConfirm(
    'Resend Email',
    'Apakah Anda yakin ingin mengirim ulang email backup ini?',
    'Kirim',
    'Batal'
  );

  if (!confirmed) return;

  try {
    await api.post(`/superadmin/backups/${backupId}/resend-email`);
    showSuccess('Email backup berhasil dikirim ulang');
    await loadBackups();
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal mengirim ulang email');
  }
};

const regenerateBackup = async (tenantId: string) => {
  const confirmed = await showConfirm(
    'Regenerate Backup',
    'Apakah Anda yakin ingin membuat ulang backup untuk tenant ini?',
    'Regenerate',
    'Batal'
  );

  if (!confirmed) return;

  try {
    await api.post(`/superadmin/backups/${tenantId}/regenerate`);
    showSuccess('Backup berhasil dibuat ulang');
    await loadBackups();
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal membuat ulang backup');
  }
};

onMounted(async () => {
  // Load data independently with timeout to prevent hanging
  // Don't wait for all to complete - load them in parallel but independently
  loadTenants().catch(err => {
    console.error('Failed to load tenants:', err);
  });
  
  loadBackups().catch(err => {
    console.error('Failed to load backups:', err);
    // Ensure loading is reset even on error
    loading.value = false;
  });
  
  loadCriticalTenants().catch(err => {
    console.error('Failed to load critical tenants:', err);
  });
});
</script>

<style scoped>
.backup-content {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>
