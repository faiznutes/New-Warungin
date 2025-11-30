<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Pesan Formulir</h2>
          <p class="text-gray-600">Kelola pesan yang masuk dari formulir kontak</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="handleCleanup"
            :disabled="loading || cleaningUp"
            class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Hapus Pesan Lama (>1 Bulan)</span>
          </button>
          <button
            @click="loadSubmissions"
            :disabled="loading"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow-sm p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Total Pesan</p>
            <p class="text-2xl font-bold text-gray-900">{{ submissions.length }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Pesan Bulan Ini</p>
            <p class="text-2xl font-bold text-gray-900">{{ thisMonthCount }}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Pesan >1 Bulan</p>
            <p class="text-2xl font-bold text-gray-900">{{ oldSubmissionsCount }}</p>
          </div>
          <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Submissions Table -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden flex-1 flex flex-col">
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Daftar Pesan</h3>
          <div class="flex items-center gap-2">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari nama, email, telepon, atau subjek..."
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      <div v-if="loading" class="flex-1 flex items-center justify-center p-8">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-600">Memuat data...</p>
        </div>
      </div>

      <div v-else-if="filteredSubmissions.length === 0" class="flex-1 flex items-center justify-center p-8">
        <div class="text-center">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p class="text-gray-600 text-lg font-medium">Tidak ada pesan formulir</p>
          <p class="text-gray-500 text-sm mt-1">Belum ada pesan yang masuk dari formulir kontak</p>
        </div>
      </div>

      <div v-else class="flex-1 overflow-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50 sticky top-0">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telepon</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjek</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pesan</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="submission in paginatedSubmissions" :key="submission.id" :class="['hover:bg-gray-50 transition', submission.isProcessed ? 'bg-green-50' : 'bg-white']">
              <td class="px-6 py-4 whitespace-nowrap">
                <label class="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    :checked="submission.isProcessed"
                    @change="toggleProcessed(submission.id, $event)"
                    class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span class="ml-2 text-xs font-medium" :class="submission.isProcessed ? 'text-green-700' : 'text-gray-600'">
                    {{ submission.isProcessed ? 'Sudah Diproses' : 'Belum Diproses' }}
                  </span>
                </label>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ submission.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ submission.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ submission.phone || '-' }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900 max-w-xs truncate" :title="submission.subject">
                  {{ submission.subject }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-600 max-w-md truncate" :title="submission.message">
                  {{ submission.message }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ formatDate(submission.createdAt) }}</div>
                <div class="text-xs text-gray-400">{{ formatTime(submission.createdAt) }}</div>
                <div v-if="isOldSubmission(submission.createdAt)" class="mt-1">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                    >1 Bulan
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="viewSubmission(submission)"
                    class="text-blue-600 hover:text-blue-900 transition"
                    title="Lihat Detail"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    @click="deleteSubmission(submission.id)"
                    class="text-red-600 hover:text-red-900 transition"
                    title="Hapus"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="filteredSubmissions.length > 0" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div class="text-sm text-gray-700">
          Menampilkan {{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, filteredSubmissions.length) }} dari {{ filteredSubmissions.length }} pesan
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sebelumnya
          </button>
          <span class="px-4 py-2 text-sm text-gray-700">
            Halaman {{ currentPage }} dari {{ totalPages }}
          </span>
          <button
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Selanjutnya
          </button>
        </div>
      </div>
    </div>

    <!-- View Modal -->
    <div
      v-if="viewingSubmission"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      @click.self="viewingSubmission = null"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900">Detail Pesan</h3>
            <button
              @click="viewingSubmission = null"
              class="text-gray-400 hover:text-gray-600 transition"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nama</label>
            <p class="text-gray-900">{{ viewingSubmission.name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <a :href="`mailto:${viewingSubmission.email}`" class="text-blue-600 hover:text-blue-800">
              {{ viewingSubmission.email }}
            </a>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
            <p class="text-gray-900">{{ viewingSubmission.phone || '-' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Subjek</label>
            <p class="text-gray-900">{{ viewingSubmission.subject }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Pesan</label>
            <p class="text-gray-900 whitespace-pre-wrap">{{ viewingSubmission.message }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                :checked="viewingSubmission.isProcessed"
                @change="toggleProcessed(viewingSubmission.id, $event)"
                class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span class="text-sm font-medium" :class="viewingSubmission.isProcessed ? 'text-green-700' : 'text-gray-600'">
                {{ viewingSubmission.isProcessed ? 'Sudah Diproses' : 'Belum Diproses' }}
              </span>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
            <p class="text-gray-900">{{ formatDate(viewingSubmission.createdAt) }} {{ formatTime(viewingSubmission.createdAt) }}</p>
          </div>
        </div>
        <div class="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            @click="viewingSubmission = null"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Tutup
          </button>
          <button
            @click="deleteSubmission(viewingSubmission.id)"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Hapus Pesan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';

const { success: showSuccess, error: showError } = useNotification();

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

const submissions = ref<ContactSubmission[]>([]);
const loading = ref(false);
const cleaningUp = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const viewingSubmission = ref<ContactSubmission | null>(null);

const loadSubmissions = async () => {
  loading.value = true;
  try {
    const response = await api.get('/contact/submissions');
    submissions.value = response.data.data || [];
  } catch (error: any) {
    console.error('Error loading submissions:', error);
    showError(error.response?.data?.message || 'Gagal memuat pesan formulir.');
  } finally {
    loading.value = false;
  }
};

const deleteSubmission = async (id: string) => {
  if (!confirm('Apakah Anda yakin ingin menghapus pesan ini?')) {
    return;
  }

  try {
    await api.delete(`/contact/submissions/${id}`);
    showSuccess('Pesan berhasil dihapus.');
    await loadSubmissions();
    if (viewingSubmission?.id === id) {
      viewingSubmission.value = null;
    }
  } catch (error: any) {
    console.error('Error deleting submission:', error);
    showError(error.response?.data?.message || 'Gagal menghapus pesan.');
  }
};

const handleCleanup = async () => {
  if (!confirm('Apakah Anda yakin ingin menghapus semua pesan yang lebih dari 1 bulan?')) {
    return;
  }

  cleaningUp.value = true;
  try {
    const response = await api.post('/contact/submissions/cleanup');
    showSuccess(response.data.message || 'Pesan lama berhasil dihapus.');
    await loadSubmissions();
  } catch (error: any) {
    console.error('Error cleaning up submissions:', error);
    showError(error.response?.data?.message || 'Gagal membersihkan pesan lama.');
  } finally {
    cleaningUp.value = false;
  }
};

const viewSubmission = (submission: ContactSubmission) => {
  viewingSubmission.value = submission;
};

const toggleProcessed = async (id: string, event: Event) => {
  const target = event.target as HTMLInputElement;
  const isProcessed = target.checked;

  try {
    await api.patch(`/contact/submissions/${id}`, { isProcessed });
    await loadSubmissions();
    
    // Update viewingSubmission jika sedang dibuka
    if (viewingSubmission.value && viewingSubmission.value.id === id) {
      viewingSubmission.value.isProcessed = isProcessed;
    }
    
    showSuccess(isProcessed ? 'Pesan ditandai sebagai sudah diproses.' : 'Pesan ditandai sebagai belum diproses.');
  } catch (error: any) {
    console.error('Error updating submission status:', error);
    showError(error.response?.data?.message || 'Gagal mengupdate status pesan.');
    // Revert checkbox
    target.checked = !isProcessed;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const isOldSubmission = (dateString: string) => {
  const date = new Date(dateString);
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  return date < oneMonthAgo;
};

const filteredSubmissions = computed(() => {
  if (!searchQuery.value) {
    return submissions.value;
  }
  const query = searchQuery.value.toLowerCase();
  return submissions.value.filter(
    (s) =>
      s.name.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query) ||
      (s.phone && s.phone.toLowerCase().includes(query)) ||
      s.subject.toLowerCase().includes(query) ||
      s.message.toLowerCase().includes(query)
  );
});

const thisMonthCount = computed(() => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return submissions.value.filter((s) => new Date(s.createdAt) >= startOfMonth).length;
});

const oldSubmissionsCount = computed(() => {
  return submissions.value.filter((s) => isOldSubmission(s.createdAt)).length;
});

const totalPages = computed(() => {
  return Math.ceil(filteredSubmissions.value.length / itemsPerPage.value);
});

const paginatedSubmissions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredSubmissions.value.slice(start, end);
});

onMounted(() => {
  loadSubmissions();
});
</script>

