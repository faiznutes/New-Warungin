<template>
  <div class="flex flex-col h-full p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Backup Management</h1>
      <p class="text-gray-600">Monitoring dan manajemen backup harian semua tenant</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Content -->
    <div v-else class="space-y-6">
      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Filter</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tenant</label>
            <select
              v-model="filters.tenantId"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Semua Tenant</option>
              <option v-for="tenant in tenants" :key="tenant.id" :value="tenant.id">
                {{ tenant.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              v-model="filters.status"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Semua Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="email_failed">Email Failed</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
            <input
              v-model="filters.startDate"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal Akhir</label>
            <input
              v-model="filters.endDate"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <div class="mt-4 flex space-x-3">
          <button
            @click="loadBackups"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Filter
          </button>
          <button
            @click="resetFilters"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Reset
          </button>
        </div>
      </div>

      <!-- Backup Logs Table -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-gray-900">Backup Logs</h2>
          <button
            @click="loadBackups"
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
          >
            Refresh
          </button>
        </div>

        <div v-if="backupLogs.length === 0" class="text-center py-12 text-gray-500">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>Belum ada backup log</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Backup</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email Sent</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="log in backupLogs"
                :key="log.id"
                class="hover:bg-gray-50"
                :class="{
                  'bg-red-100 border-l-4 border-red-500': criticalTenants.has(log.tenantId),
                  'bg-red-50': log.status === 'failed' && !criticalTenants.has(log.tenantId),
                  'bg-yellow-50': log.status === 'email_failed' && !criticalTenants.has(log.tenantId),
                  'bg-green-50': log.status === 'success' && isOldBackup(log.generatedAt),
                }"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ log.tenant.name }}</div>
                      <div class="text-sm text-gray-500">{{ log.tenant.email }}</div>
                    </div>
                    <span
                      v-if="criticalTenants.has(log.tenantId)"
                      class="px-2 py-1 text-xs font-bold rounded-full bg-red-600 text-white"
                      title="Backup gagal 3+ hari berturut-turut"
                    >
                      ⚠️ KRITIS
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(log.generatedAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded-full',
                      log.status === 'success' ? 'bg-green-100 text-green-800' :
                      log.status === 'email_failed' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    ]"
                    :title="log.errorMessage || ''"
                  >
                    {{ log.status === 'success' ? 'Success' : log.status === 'email_failed' ? 'Email Failed' : 'Failed' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ log.emailSentAt ? formatDate(log.emailSentAt) : '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatFileSize(log.size || 0) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button
                      @click="viewBackup(log.id)"
                      class="text-blue-600 hover:text-blue-800"
                      title="View Backup"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      @click="downloadBackup(log.id)"
                      class="text-green-600 hover:text-green-800"
                      title="Download"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                    <button
                      v-if="log.status === 'email_failed' || !log.emailSentAt"
                      @click="resendEmail(log.id)"
                      class="text-orange-600 hover:text-orange-800"
                      title="Resend Email"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      @click="regenerateBackup(log.tenantId)"
                      class="text-purple-600 hover:text-purple-800"
                      title="Regenerate Backup"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="mt-4 flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Menampilkan {{ (pagination.page - 1) * pagination.limit + 1 }} sampai
            {{ Math.min(pagination.page * pagination.limit, pagination.total) }} dari
            {{ pagination.total }} backup logs
          </div>
          <div class="flex space-x-2">
            <button
              @click="changePage(pagination.page - 1)"
              :disabled="pagination.page === 1"
              class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              @click="changePage(pagination.page + 1)"
              :disabled="pagination.page === pagination.totalPages"
              class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- View Backup Modal -->
    <div
      v-if="showViewModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="showViewModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div class="p-6 border-b border-gray-200 flex-shrink-0">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900">View Backup</h3>
            <button
              @click="showViewModal = false"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div class="flex-1 overflow-auto p-6">
          <div v-if="viewingBackup" v-html="viewingBackup" class="backup-content"></div>
          <div v-else class="text-center py-12">
            <div class="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
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
    const response = await api.get('/tenants', { params: { limit: 1000 } });
    tenants.value = response.data.data || [];
  } catch (error: any) {
    console.error('Error loading tenants:', error);
  }
};

const loadCriticalTenants = async () => {
  try {
    const response = await api.get('/superadmin/backups/critical');
    const critical = response.data.criticalTenants || [];
    criticalTenants.value = new Set(critical.map((t: any) => t.tenantId));
    
    if (critical.length > 0) {
      showError(
        `⚠️ Peringatan: ${critical.length} tenant memiliki backup gagal 3+ hari berturut-turut!`,
        'Tenant Bermasalah'
      );
    }
  } catch (error: any) {
    console.error('Error loading critical tenants:', error);
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

    const response = await api.get('/superadmin/backups', { params });
    backupLogs.value = response.data.data || [];
    pagination.value = response.data.pagination || pagination.value;
  } catch (error: any) {
    console.error('Error loading backups:', error);
    showError(error.response?.data?.message || 'Gagal memuat backup logs');
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
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const isOldBackup = (date: string | Date): boolean => {
  const backupDate = new Date(date);
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  return backupDate < oneDayAgo;
};

const viewBackup = async (backupId: string) => {
  try {
    showViewModal.value = true;
    viewingBackup.value = null;
    const response = await api.get(`/superadmin/backups/${backupId}/view`, {
      responseType: 'text',
    });
    viewingBackup.value = response.data;
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal memuat backup');
    showViewModal.value = false;
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
  await Promise.all([loadTenants(), loadBackups(), loadCriticalTenants()]);
});
</script>

<style scoped>
.backup-content {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>
