<template>
  <div class="flex flex-col gap-8 animate-fade-in font-display">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col">
        <h2 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Pesan Masuk</h2>
        <p class="text-slate-500 dark:text-slate-400 mt-1 font-medium">Kelola pertanyaan, masukan, dan pesan dari pengguna ekosistem.</p>
      </div>
      <div class="flex items-center gap-3">
         <div class="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Pesan: <span class="text-slate-900 dark:text-white">{{ pagination.total }}</span></span>
         </div>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-5 items-center justify-between">
      <div class="relative w-full sm:w-96 group">
        <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-blue-500 transition-colors text-[20px]">search</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari pengirim, subjek, atau isi pesan..."
          class="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all shadow-sm hover:bg-white dark:hover:bg-slate-800"
          @input="loadMessages"
        />
      </div>
      <div class="w-full sm:w-auto relative group">
         <select
           v-model="filterRead"
           @change="loadMessages"
           class="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white appearance-none cursor-pointer shadow-sm hover:bg-white dark:hover:bg-slate-800 transition-colors"
         >
           <option value="">Semua Status</option>
           <option value="false">Belum Dibaca</option>
           <option value="true">Sudah Dibaca</option>
         </select>
         <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 group-hover:text-blue-500 transition-colors">
            <span class="material-symbols-outlined">expand_more</span>
         </div>
      </div>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-24 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm backdrop-blur-sm">
       <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
       <div class="text-slate-500 font-bold text-sm animate-pulse">Menyingkronkan kotak masuk...</div>
    </div>

    <div v-else-if="messages.length === 0" class="flex flex-col items-center justify-center py-24 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 backdrop-blur-sm">
       <div class="bg-slate-100 dark:bg-slate-700/50 p-6 rounded-full mb-4">
          <span class="material-symbols-outlined text-slate-400 text-4xl">inbox</span>
       </div>
       <p class="text-slate-900 dark:text-white font-black text-lg">Kotak Masuk Kosong</p>
       <p class="text-slate-500 text-sm font-medium mt-1">Belum ada pesan masuk yang ditemukan.</p>
    </div>

    <div v-else class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col min-h-0 animate-fade-in-up">
      <!-- Bulk Actions Bar -->
      <div v-if="selectedMessages.length > 0" class="px-6 py-4 bg-blue-50/80 dark:bg-blue-900/40 border-b border-blue-100 dark:border-blue-800 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-sm">
        <div class="flex items-center gap-2 text-sm font-black text-blue-700 dark:text-blue-400">
          <span class="material-symbols-outlined text-[20px]">check_circle</span>
          {{ selectedMessages.length }} pesan dipilih
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button
            @click="bulkMarkAsRead"
            class="px-4 py-2 bg-blue-100 hover:bg-emerald-200 text-blue-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-sm"
          >
            <span class="material-symbols-outlined text-[18px]">mark_email_read</span>
            Tandai Dibaca
          </button>
          <button
            @click="bulkMarkAsUnread"
            class="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-sm"
          >
           <span class="material-symbols-outlined text-[18px]">mark_email_unread</span>
            Tandai Belum Dibaca
          </button>
          <button
            @click="bulkDelete"
            class="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-sm"
          >
            <span class="material-symbols-outlined text-[18px]">delete</span>
            Hapus Permanen
          </button>
          <button
            @click="selectedMessages = []"
            class="px-4 py-2 border border-slate-300 hover:bg-white text-slate-500 rounded-xl text-xs font-bold transition-all"
          >
            Batal
          </button>
        </div>
      </div>

      <!-- Messages Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead class="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th class="px-6 py-4 w-10">
                <div class="flex items-center justify-center">
                  <input
                    type="checkbox"
                    :checked="selectedMessages.length === messages.length && messages.length > 0"
                    @change="toggleSelectAll"
                    class="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer size-4"
                  />
                </div>
              </th>
              <th class="px-6 py-4">Pengirim</th>
              <th class="px-6 py-4">Subjek & Cuplikan</th>
              <th class="px-6 py-4">Waktu</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700 mix-blend-multiply dark:mix-blend-normal">
            <tr
              v-for="message in messages"
              :key="message.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group cursor-pointer"
              :class="{ 'bg-blue-50/60 dark:bg-blue-900/20': !message.isRead }"
              @click.stop="viewMessage(message)"
            >
              <td class="px-6 py-4" @click.stop>
                <div class="flex items-center justify-center">
                  <input
                    type="checkbox"
                    :value="message.id"
                    v-model="selectedMessages"
                    class="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer size-4"
                  />
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-col">
                   <div :class="['text-sm text-slate-900 dark:text-white mb-0.5', !message.isRead ? 'font-black' : 'font-bold']">{{ message.name }}</div>
                   <div class="text-xs text-slate-500 font-medium">{{ message.email }}</div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div :class="['text-sm text-slate-800 dark:text-slate-200 max-w-sm truncate mb-0.5', !message.isRead ? 'font-bold' : 'font-medium']">
                   {{ message.subject }}
                </div>
                 <p class="text-xs text-slate-500 truncate max-w-xs">{{ message.message }}</p>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-xs font-bold text-slate-500 flex items-center gap-1">
                   {{ formatDate(message.createdAt) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border shadow-sm"
                  :class="message.isRead 
                    ? 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' 
                    : 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'"
                >
                  <span class="size-1.5 rounded-full" :class="message.isRead ? 'bg-slate-400' : 'bg-blue-500 animate-pulse'"></span>
                  {{ message.isRead ? 'Dibaca' : 'Baru' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right" @click.stop>
                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    @click="viewMessage(message)"
                    class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                    title="Baca Pesan"
                  >
                    <span class="material-symbols-outlined text-[18px]">visibility</span>
                  </button>
                  <button
                    @click="toggleReadStatus(message)"
                    class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                    :title="message.isRead ? 'Tandai Belum Dibaca' : 'Tandai Dibaca'"
                  >
                    <span class="material-symbols-outlined text-[18px]">{{ message.isRead ? 'mark_email_unread' : 'mark_email_read' }}</span>
                  </button>
                  <button
                    @click="deleteMessage(message)"
                    class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-red-100"
                    title="Hapus Pesan"
                  >
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
        <div class="text-xs font-bold text-slate-500">
          Menampilkan <span class="text-slate-900 dark:text-white">{{ (pagination.page - 1) * pagination.limit + 1 }}</span> - <span class="text-slate-900 dark:text-white">{{ Math.min(pagination.page * pagination.limit, pagination.total) }}</span> dari <span class="text-slate-900 dark:text-white">{{ pagination.total }}</span> entries
        </div>
        <div class="flex gap-2">
          <button
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="px-4 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition text-slate-600 dark:text-slate-300 shadow-sm"
          >
            Sebelumnya
          </button>
          <button
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page === pagination.totalPages"
            class="px-4 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition text-slate-600 dark:text-slate-300 shadow-sm"
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
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
        @click.self="showDetailModal = false"
      >
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col animate-scale-in border border-slate-200 dark:border-slate-700">
          <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
            <div class="flex items-center gap-3">
               <div class="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                  <span class="material-symbols-outlined">mail</span>
               </div>
               <h3 class="text-lg font-black text-slate-900 dark:text-white">Detail Pesan</h3>
            </div>
            <button
              @click="showDetailModal = false"
              class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
            >
              <span class="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>
          
          <div v-if="selectedMessage" class="p-8 overflow-y-auto space-y-6 custom-scrollbar bg-slate-50/30 dark:bg-slate-900/20">
            <!-- Header Info -->
            <div class="flex items-start justify-between gap-4">
               <div class="flex items-center gap-4">
                  <div class="size-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-black uppercase shadow-md">
                     {{ selectedMessage.name.charAt(0) }}
                  </div>
                  <div>
                     <h4 class="font-bold text-slate-900 dark:text-white text-lg">{{ selectedMessage.name }}</h4>
                     <p class="text-sm text-slate-500 font-medium">{{ selectedMessage.email }}</p>
                  </div>
               </div>
               <div class="text-right">
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Diterima pada</p>
                  <p class="text-sm font-bold text-slate-700 dark:text-slate-300">{{ formatDate(selectedMessage.createdAt) }}</p>
               </div>
            </div>

            <!-- Subject & Content -->
            <div class="space-y-2">
               <label class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Subjek Pesan</label>
               <div class="text-lg font-bold text-slate-900 dark:text-white leading-normal">{{ selectedMessage.subject }}</div>
            </div>

            <div class="space-y-2">
               <label class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Isi Pesan</label>
               <div class="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed shadow-sm font-medium">
                  {{ selectedMessage.message }}
               </div>
            </div>

            <!-- Additional Info -->
            <div class="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-slate-700">
               <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-wider">No. Telepon</label>
                  <p class="text-sm font-bold text-slate-900 dark:text-white mt-1 font-mono">{{ selectedMessage.phone || '-' }}</p>
               </div>
               <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Status Pesan</label>
                  <div class="mt-1">
                     <span
                        class="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border shadow-sm"
                        :class="selectedMessage.isRead 
                           ? 'bg-blue-50 text-blue-700 border-emerald-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' 
                           : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'"
                     >
                        <span class="size-1.5 rounded-full" :class="selectedMessage.isRead ? 'bg-blue-500' : 'bg-blue-500'"></span>
                        {{ selectedMessage.isRead ? 'Sudah Dibaca' : 'Belum Dibaca' }}
                     </span>
                  </div>
               </div>
            </div>
          </div>
          
          <div class="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900">
            <button
              @click="toggleReadStatus(selectedMessage)"
              class="px-4 py-2.5 border border-slate-200 hover:bg-white text-slate-500 hover:text-blue-600 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-[18px]">{{ selectedMessage.isRead ? 'mark_email_unread' : 'mark_email_read' }}</span>
              <span>{{ selectedMessage.isRead ? 'Tandai Belum' : 'Tandai Dibaca' }}</span>
            </button>
            <button
              @click="deleteMessage(selectedMessage)"
              class="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-100 rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-[18px]">delete</span>
              <span>Hapus Pesan</span>
            </button>
            <button
              @click="showDetailModal = false"
              class="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-lg transition-all"
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
    if (searchQuery.value) params.search = searchQuery.value;
    if (filterRead.value !== '') params.isRead = filterRead.value;

    const response = await api.get('/contact', { params });
    if (response.data && response.data.data) {
      messages.value = response.data.data;
      pagination.value = response.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 };
      previousUnreadCount.value = messages.value.filter((m: any) => !m.isRead).length;
    } else {
      messages.value = [];
      pagination.value = { page: 1, limit: 20, total: 0, totalPages: 0 };
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
  if (!message.isRead) toggleReadStatus(message);
};

const toggleReadStatus = async (message: any) => {
  try {
    await api.put(`/contact/${message.id}/read`, {
      isRead: !message.isRead,
    });
    message.isRead = !message.isRead;
    message.readAt = message.isRead ? new Date() : null;
    await showSuccess(message.isRead ? 'Pesan ditandai sudah dibaca' : 'Pesan ditandai belum dibaca');
  } catch (error: any) {
    console.error('Error updating read status:', error);
    await showError('Gagal memperbarui status pesan');
  }
};

const deleteMessage = async (message: any) => {
  const confirmed = await showConfirm(
    'Hapus Pesan?',
    'Apakah Anda yakin ingin menghapus pesan ini secara permanen?',
    'Hapus',
    'Batal'
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
    await api.post('/contact/bulk', { action: 'mark-read', ids: selectedMessages.value });
    await showSuccess(`${selectedMessages.value.length} pesan ditandai sudah dibaca`);
    selectedMessages.value = [];
    await loadMessages();
  } catch (error: any) {
    await showError('Gagal menandai pesan');
  }
};

const bulkMarkAsUnread = async () => {
  if (selectedMessages.value.length === 0) return;
  try {
    await api.post('/contact/bulk', { action: 'mark-unread', ids: selectedMessages.value });
    await showSuccess(`${selectedMessages.value.length} pesan ditandai belum dibaca`);
    selectedMessages.value = [];
    await loadMessages();
  } catch (error: any) {
    await showError('Gagal menandai pesan');
  }
};

const bulkDelete = async () => {
  if (selectedMessages.value.length === 0) return;
  const confirmed = await showConfirm(`Hapus ${selectedMessages.value.length} pesan?`, 'Konfirmasi Hapus Massal', 'Hapus', 'Batal');
  if (!confirmed) return;

  try {
    await api.post('/contact/bulk', { action: 'delete', ids: selectedMessages.value });
    await showSuccess(`${selectedMessages.value.length} pesan berhasil dihapus`);
    selectedMessages.value = [];
    await loadMessages();
  } catch (error: any) {
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

let refreshInterval: any = null;
const previousUnreadCount = ref(0);

const checkForNewMessages = async () => {
  try {
    const response = await api.get('/contact', {
      params: { page: 1, limit: 1, isRead: 'false' },
    });
    
    const currentUnreadCount = response.data?.pagination?.total || 0;
    
    if (currentUnreadCount > previousUnreadCount.value) {
      await loadMessages();
      if (currentUnreadCount > previousUnreadCount.value && previousUnreadCount.value > 0) {
        await showSuccess(`Ada ${currentUnreadCount - previousUnreadCount.value} pesan baru!`);
      }
    }
    previousUnreadCount.value = currentUnreadCount;
  } catch (error: any) {
    // Silent fail
  }
};

const startAutoRefresh = () => {
  refreshInterval = setInterval(() => {
    checkForNewMessages();
  }, 10000);
};

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

onMounted(async () => {
  await loadMessages();
  startAutoRefresh();
});

onUnmounted(() => {
  stopAutoRefresh();
});
</script>
