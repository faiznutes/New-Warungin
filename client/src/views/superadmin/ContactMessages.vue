<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col">
        <h2 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Contact Messages</h2>
        <p class="text-slate-500 dark:text-slate-400 mt-1">Manage messages and inquiries from users.</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div class="relative w-full sm:w-80">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">search</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search messages..."
          class="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white placeholder:text-slate-400"
          @input="loadMessages"
        />
      </div>
      <select
        v-model="filterRead"
        @change="loadMessages"
        class="w-full sm:w-auto px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
      >
        <option value="">All Status</option>
        <option value="false">Unread</option>
        <option value="true">Read</option>
      </select>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50">
       <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
       <div class="text-slate-500 font-medium text-sm">Loading messages...</div>
    </div>

    <div v-else-if="messages.length === 0" class="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
       <div class="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-full mb-3">
          <span class="material-symbols-outlined text-slate-400 text-3xl">inbox</span>
       </div>
       <p class="text-slate-900 dark:text-white font-bold">No Contact Messages</p>
       <p class="text-slate-500 text-sm">No incoming messages found.</p>
    </div>

    <div v-else class="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 overflow-hidden flex flex-col min-h-0">
      <!-- Bulk Actions Bar -->
      <div v-if="selectedMessages.length > 0" class="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-2 text-sm font-bold text-primary">
          <span class="material-symbols-outlined text-[20px]">check_circle</span>
          {{ selectedMessages.length }} messages selected
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button
            @click="bulkMarkAsRead"
            class="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg text-xs font-bold transition flex items-center gap-1"
          >
            <span class="material-symbols-outlined text-[16px]">mark_email_read</span>
            Mark as Read
          </button>
          <button
            @click="bulkMarkAsUnread"
            class="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg text-xs font-bold transition flex items-center gap-1"
          >
           <span class="material-symbols-outlined text-[16px]">mark_email_unread</span>
            Tandai Belum Dibaca
          </button>
          <button
            @click="bulkDelete"
            class="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold transition flex items-center gap-1"
          >
            <span class="material-symbols-outlined text-[16px]">delete</span>
            Hapus
          </button>
          <button
            @click="selectedMessages = []"
            class="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-[#4c739a] rounded-lg text-xs font-medium transition"
          >
            Batal
          </button>
        </div>
      </div>

      <!-- Messages Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
          <thead class="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th class="px-6 py-4 text-left w-10">
                <input
                  type="checkbox"
                  :checked="selectedMessages.length === messages.length && messages.length > 0"
                  @change="toggleSelectAll"
                  class="rounded border-slate-300 text-[#137fec] focus:ring-[#137fec]"
                />
              </th>
              <th class="px-6 py-4 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Pengirim</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Subjek</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Tanggal</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 text-right text-xs font-bold text-[#4c739a] uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
            <tr
              v-for="message in messages"
              :key="message.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group cursor-pointer"
              :class="{ 'bg-blue-50/30 dark:bg-blue-900/10': !message.isRead }"
              @click.stop="viewMessage(message)"
            >
              <td class="px-6 py-4" @click.stop>
                <input
                  type="checkbox"
                  :value="message.id"
                  v-model="selectedMessages"
                  class="rounded border-slate-300 text-[#137fec] focus:ring-[#137fec]"
                />
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-col">
                   <div class="text-sm font-bold text-[#0d141b] dark:text-white">{{ message.name }}</div>
                   <div class="text-xs text-[#4c739a]">{{ message.email }}</div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-[#0d141b] dark:text-gray-300 max-w-sm truncate font-medium">
                   {{ message.subject }}
                </div>
                <!-- Preview message content slightly - optional -->
                 <p class="text-xs text-[#4c739a] truncate max-w-xs mt-0.5">{{ message.message }}</p>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-xs font-medium text-[#4c739a]">{{ formatDate(message.createdAt) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border"
                  :class="message.isRead 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                    : 'bg-amber-50 text-amber-700 border-amber-100'"
                >
                  {{ message.isRead ? 'Sudah Dibaca' : 'Belum Dibaca' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right" @click.stop>
                <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    @click="viewMessage(message)"
                    class="p-2 text-[#4c739a] hover:text-[#137fec] hover:bg-blue-50 rounded-lg transition"
                    title="Lihat Detail"
                  >
                    <span class="material-symbols-outlined text-[20px]">visibility</span>
                  </button>
                  <button
                    @click="toggleReadStatus(message)"
                    class="p-2 text-[#4c739a] hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                    :title="message.isRead ? 'Tandai Belum Dibaca' : 'Tandai Dibaca'"
                  >
                    <span class="material-symbols-outlined text-[20px]">{{ message.isRead ? 'mark_email_unread' : 'mark_email_read' }}</span>
                  </button>
                  <button
                    @click="deleteMessage(message)"
                    class="p-2 text-[#4c739a] hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Hapus"
                  >
                    <span class="material-symbols-outlined text-[20px]">delete</span>
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
          Menampilkan <span class="font-bold text-[#0d141b] dark:text-white">{{ (pagination.page - 1) * pagination.limit + 1 }}</span> - <span class="font-bold text-[#0d141b] dark:text-white">{{ Math.min(pagination.page * pagination.limit, pagination.total) }}</span> dari <span class="font-bold text-[#0d141b] dark:text-white">{{ pagination.total }}</span>
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

    <!-- Message Detail Modal -->
    <Teleport to="body">
      <div
        v-if="showDetailModal"
        class="fixed inset-0 bg-[#0d141b]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
        @click.self="showDetailModal = false"
      >
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
          <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 class="text-xl font-bold text-[#0d141b] dark:text-white">Detail Pesan</h3>
            <button
              @click="showDetailModal = false"
              class="text-[#4c739a] hover:text-[#0d141b] transition-colors"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div v-if="selectedMessage" class="p-6 overflow-y-auto space-y-6">
            <!-- Header Info -->
            <div class="flex items-start justify-between gap-4">
               <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-full bg-[#137fec]/10 flex items-center justify-center text-[#137fec] text-xl font-bold uppercase">
                     {{ selectedMessage.name.charAt(0) }}
                  </div>
                  <div>
                     <h4 class="font-bold text-[#0d141b] dark:text-white text-lg">{{ selectedMessage.name }}</h4>
                     <p class="text-sm text-[#4c739a]">{{ selectedMessage.email }}</p>
                  </div>
               </div>
               <div class="text-right">
                  <p class="text-xs font-bold text-[#4c739a] mb-1">Diterima pada</p>
                  <p class="text-sm font-medium text-[#0d141b] dark:text-white">{{ formatDate(selectedMessage.createdAt) }}</p>
               </div>
            </div>

            <!-- Subject & Content -->
            <div class="space-y-2">
               <label class="text-xs font-bold text-[#4c739a] uppercase tracking-wider">Subjek</label>
               <div class="text-base font-bold text-[#0d141b] dark:text-white">{{ selectedMessage.subject }}</div>
            </div>

            <div class="space-y-2">
               <label class="text-xs font-bold text-[#4c739a] uppercase tracking-wider">Pesan</label>
               <div class="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-100 dark:border-slate-700 text-[#0d141b] dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {{ selectedMessage.message }}
               </div>
            </div>

            <!-- Additional Info -->
            <div class="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
               <div>
                  <label class="text-xs font-bold text-[#4c739a] uppercase tracking-wider">No. Telepon</label>
                  <p class="text-sm font-medium text-[#0d141b] dark:text-white mt-1">{{ selectedMessage.phone || '-' }}</p>
               </div>
               <div>
                  <label class="text-xs font-bold text-[#4c739a] uppercase tracking-wider">Status</label>
                  <div class="mt-1">
                     <span
                        class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border inline-block"
                        :class="selectedMessage.isRead 
                           ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                           : 'bg-amber-50 text-amber-700 border-amber-100'"
                     >
                        {{ selectedMessage.isRead ? 'Sudah Dibaca' : 'Belum Dibaca' }}
                     </span>
                  </div>
               </div>
            </div>
          </div>
          
          <div class="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/10">
            <button
              @click="toggleReadStatus(selectedMessage)"
              class="px-4 py-2 border border-slate-300 hover:bg-white text-[#4c739a] hover:text-[#137fec] rounded-xl text-sm font-bold transition flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-[18px]">{{ selectedMessage.isRead ? 'mark_email_unread' : 'mark_email_read' }}</span>
              <span>{{ selectedMessage.isRead ? 'Tandai Belum Dibaca' : 'Tandai Dibaca' }}</span>
            </button>
            <button
              @click="deleteMessage(selectedMessage)"
              class="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-sm font-bold transition flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-[18px]">delete</span>
              <span>Hapus</span>
            </button>
            <button
              @click="showDetailModal = false"
              class="px-4 py-2 bg-[#137fec] hover:bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Teleport>
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
      // Update unread count setelah load messages
      previousUnreadCount.value = messages.value.filter((m: any) => !m.isRead).length;
    } else {
      messages.value = [];
      pagination.value = {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      };
      previousUnreadCount.value = 0;
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

// Auto-refresh untuk pesan baru - hanya refresh jika ada pesan baru
let refreshInterval: NodeJS.Timeout | null = null;
let previousUnreadCount = ref(0);

const checkForNewMessages = async () => {
  try {
    // Cek jumlah pesan belum dibaca
    const response = await api.get('/contact', {
      params: {
        page: 1,
        limit: 1,
        isRead: 'false',
      },
    });
    
    const currentUnreadCount = response.data?.pagination?.total || 0;
    
    // Jika jumlah pesan belum dibaca bertambah, refresh halaman
    if (currentUnreadCount > previousUnreadCount.value) {
      await loadMessages();
      // Tampilkan notifikasi jika ada pesan baru
      if (currentUnreadCount > previousUnreadCount.value && previousUnreadCount.value > 0) {
        await showSuccess(`Ada ${currentUnreadCount - previousUnreadCount.value} pesan baru!`);
      }
    }
    
    previousUnreadCount.value = currentUnreadCount;
  } catch (error: any) {
    // Silent fail untuk polling
    console.error('Error checking for new messages:', error);
  }
};

const startAutoRefresh = () => {
  // Cek setiap 10 detik untuk pesan baru (lebih efisien)
  refreshInterval = setInterval(() => {
    checkForNewMessages();
  }, 10000); // 10 detik
};

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

onMounted(async () => {
  await loadMessages();
  // Set initial unread count
  previousUnreadCount.value = messages.value.filter((m: any) => !m.isRead).length;
  startAutoRefresh();
});

// Cleanup interval saat component unmount
onUnmounted(() => {
  stopAutoRefresh();
});
</script>
