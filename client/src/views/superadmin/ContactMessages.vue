<template>
  <div class="flex flex-col h-full">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Kelola Pesan Kontak</h2>
        <p class="text-sm text-gray-600 mt-1">Kelola semua pesan dari formulir kontak Warungin</p>
      </div>
      <div class="flex items-center gap-3">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari pesan..."
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          @input="loadMessages"
        />
        <select
          v-model="filterRead"
          @change="loadMessages"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Semua Status</option>
          <option value="false">Belum Dibaca</option>
          <option value="true">Sudah Dibaca</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="messages.length === 0" class="text-center py-20">
      <p class="text-gray-500">Tidak ada pesan kontak</p>
    </div>

    <div v-else class="bg-white rounded-lg shadow-lg overflow-hidden">
      <!-- Bulk Actions -->
      <div v-if="selectedMessages.length > 0" class="px-6 py-3 bg-blue-50 border-b border-gray-200 flex items-center justify-between">
        <div class="text-sm font-medium text-gray-700">
          {{ selectedMessages.length }} pesan dipilih
        </div>
        <div class="flex gap-2">
          <button
            @click="bulkMarkAsRead"
            class="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Tandai Dibaca
          </button>
          <button
            @click="bulkMarkAsUnread"
            class="px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
          >
            Tandai Belum Dibaca
          </button>
          <button
            @click="bulkDelete"
            class="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Hapus Terpilih
          </button>
          <button
            @click="selectedMessages = []"
            class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Batal
          </button>
        </div>
      </div>

      <!-- Messages Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  :checked="selectedMessages.length === messages.length && messages.length > 0"
                  @change="toggleSelectAll"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Telepon</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subjek</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="message in messages"
              :key="message.id"
              class="hover:bg-gray-50"
              :class="{ 'bg-blue-50': !message.isRead }"
            >
              <td class="px-6 py-4">
                <input
                  type="checkbox"
                  :value="message.id"
                  v-model="selectedMessages"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ message.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-600">{{ message.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-600">{{ message.phone || '-' }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900 max-w-xs truncate">{{ message.subject }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-600">{{ formatDate(message.createdAt) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2 py-1 text-xs font-semibold rounded-full',
                    message.isRead ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  ]"
                >
                  {{ message.isRead ? 'Sudah Dibaca' : 'Belum Dibaca' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <button
                    @click="viewMessage(message)"
                    class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Lihat Detail"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    @click="toggleReadStatus(message)"
                    class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                    :title="message.isRead ? 'Tandai Belum Dibaca' : 'Tandai Dibaca'"
                  >
                    <svg v-if="!message.isRead" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <button
                    @click="deleteMessage(message)"
                    class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Hapus"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div v-if="pagination.totalPages > 1" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div class="text-sm text-gray-700">
          Menampilkan {{ (pagination.page - 1) * pagination.limit + 1 }} - {{ Math.min(pagination.page * pagination.limit, pagination.total) }} dari {{ pagination.total }}
        </div>
        <div class="flex gap-2">
          <button
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sebelumnya
          </button>
          <button
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page === pagination.totalPages"
            class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Selanjutnya
          </button>
        </div>
      </div>
    </div>

    <!-- Message Detail Modal -->
    <div
      v-if="showDetailModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showDetailModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-2xl font-bold text-gray-900">Detail Pesan</h3>
            <button
              @click="showDetailModal = false"
              class="text-gray-400 hover:text-gray-600 transition"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div v-if="selectedMessage" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Nama</label>
                <p class="mt-1 text-sm text-gray-900 font-semibold">{{ selectedMessage.name }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <p class="mt-1 text-sm text-gray-900">{{ selectedMessage.email }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">No. Telepon</label>
                <p class="mt-1 text-sm text-gray-900">{{ selectedMessage.phone || '-' }}</p>
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700">Subjek</label>
                <p class="mt-1 text-sm text-gray-900 font-semibold">{{ selectedMessage.subject }}</p>
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700">Pesan</label>
                <p class="mt-1 text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">{{ selectedMessage.message }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Tanggal</label>
                <p class="mt-1 text-sm text-gray-900">{{ formatDate(selectedMessage.createdAt) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Status</label>
                <span
                  :class="[
                    'mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    selectedMessage.isRead ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  ]"
                >
                  {{ selectedMessage.isRead ? 'Sudah Dibaca' : 'Belum Dibaca' }}
                </span>
              </div>
            </div>
            
            <div class="flex justify-end space-x-3 pt-4 border-t">
              <button
                @click="toggleReadStatus(selectedMessage)"
                class="px-4 py-2 text-white rounded-lg transition"
                :class="selectedMessage.isRead ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'"
              >
                {{ selectedMessage.isRead ? 'Tandai Belum Dibaca' : 'Tandai Dibaca' }}
              </button>
              <button
                @click="deleteMessage(selectedMessage)"
                class="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
              >
                Hapus
              </button>
              <button
                @click="showDetailModal = false"
                class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';

const { success: showSuccess, error: showError, confirm: showConfirm } = useNotification();

const loading = ref(false);
const messages = ref<any[]>([]);
const selectedMessages = ref<string[]>([]);
const selectedMessage = ref<any>(null);
const showDetailModal = ref(false);
const searchQuery = ref('');
const filterRead = ref('');
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
});

const loadMessages = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: pagination.value.page,
      limit: pagination.value.limit,
    };
    if (searchQuery.value) {
      params.search = searchQuery.value;
    }
    if (filterRead.value !== '') {
      params.isRead = filterRead.value;
    }

    const response = await api.get('/contact', { params });
    // Handle response format - check if data exists
    if (response.data && response.data.data) {
    messages.value = response.data.data;
      pagination.value = response.data.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      };
    } else {
      messages.value = [];
      pagination.value = {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      };
    }
  } catch (error: any) {
    console.error('Error loading messages:', error);
    await showError('Gagal memuat pesan kontak');
  } finally {
    loading.value = false;
  }
};

const toggleSelectAll = () => {
  if (selectedMessages.value.length === messages.value.length) {
    selectedMessages.value = [];
  } else {
    selectedMessages.value = messages.value.map(m => m.id);
  }
};

const viewMessage = (message: any) => {
  selectedMessage.value = message;
  showDetailModal.value = true;
  
  // Auto mark as read when viewing
  if (!message.isRead) {
    toggleReadStatus(message);
  }
};

const toggleReadStatus = async (message: any) => {
  try {
    await api.put(`/contact/${message.id}/read`, {
      isRead: !message.isRead,
    });
    message.isRead = !message.isRead;
    message.readAt = message.isRead ? new Date() : null;
    await showSuccess(message.isRead ? 'Pesan ditandai sebagai sudah dibaca' : 'Pesan ditandai sebagai belum dibaca');
  } catch (error: any) {
    console.error('Error updating read status:', error);
    await showError('Gagal memperbarui status pesan');
  }
};

const deleteMessage = async (message: any) => {
  const confirmed = await showConfirm(
    'Apakah Anda yakin ingin menghapus pesan ini?',
    'Hapus Pesan'
  );
  
  if (!confirmed) return;

  try {
    await api.delete(`/contact/${message.id}`);
    await showSuccess('Pesan berhasil dihapus');
    if (showDetailModal.value && selectedMessage.value?.id === message.id) {
      showDetailModal.value = false;
    }
    await loadMessages();
  } catch (error: any) {
    console.error('Error deleting message:', error);
    await showError('Gagal menghapus pesan');
  }
};

const bulkMarkAsRead = async () => {
  if (selectedMessages.value.length === 0) return;

  try {
    await api.post('/contact/bulk', {
      action: 'mark-read',
      ids: selectedMessages.value,
    });
    await showSuccess(`${selectedMessages.value.length} pesan ditandai sebagai sudah dibaca`);
    selectedMessages.value = [];
    await loadMessages();
  } catch (error: any) {
    console.error('Error bulk marking as read:', error);
    await showError('Gagal menandai pesan');
  }
};

const bulkMarkAsUnread = async () => {
  if (selectedMessages.value.length === 0) return;

  try {
    await api.post('/contact/bulk', {
      action: 'mark-unread',
      ids: selectedMessages.value,
    });
    await showSuccess(`${selectedMessages.value.length} pesan ditandai sebagai belum dibaca`);
    selectedMessages.value = [];
    await loadMessages();
  } catch (error: any) {
    console.error('Error bulk marking as unread:', error);
    await showError('Gagal menandai pesan');
  }
};

const bulkDelete = async () => {
  if (selectedMessages.value.length === 0) return;

  const confirmed = await showConfirm(
    `Apakah Anda yakin ingin menghapus ${selectedMessages.value.length} pesan?`,
    'Hapus Pesan'
  );
  
  if (!confirmed) return;

  try {
    await api.post('/contact/bulk', {
      action: 'delete',
      ids: selectedMessages.value,
    });
    await showSuccess(`${selectedMessages.value.length} pesan berhasil dihapus`);
    selectedMessages.value = [];
    await loadMessages();
  } catch (error: any) {
    console.error('Error bulk deleting:', error);
    await showError('Gagal menghapus pesan');
  }
};

const changePage = (page: number) => {
  pagination.value.page = page;
  loadMessages();
};

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Auto-refresh untuk pesan baru
let refreshInterval: NodeJS.Timeout | null = null;

const startAutoRefresh = () => {
  // Refresh setiap 30 detik untuk mengecek pesan baru
  refreshInterval = setInterval(() => {
    loadMessages();
  }, 30000); // 30 detik
};

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

onMounted(() => {
  loadMessages();
  startAutoRefresh();
});

// Cleanup interval saat component unmount
import { onUnmounted } from 'vue';
onUnmounted(() => {
  stopAutoRefresh();
});
</script>
