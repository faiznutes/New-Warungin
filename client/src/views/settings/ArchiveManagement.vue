<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex flex-col">
      <h2 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Archive Management</h2>
      <p class="text-slate-500 dark:text-slate-400 mt-1">Manage legacy data archives for database optimization.</p>
    </div>

    <div v-if="loading && stats.ordersCount === 0" class="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50">
      <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
      <div class="text-slate-500 font-medium text-sm">Loading archive data...</div>
    </div>

    <div v-else class="space-y-6 animate-fade-in">
      <!-- Archive Statistics -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
           <div class="text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Orders Archived</div>
           <div class="flex items-end gap-2">
              <span class="text-3xl font-extrabold text-[#137fec]">{{ stats.ordersCount || 0 }}</span>
              <span class="material-symbols-outlined text-slate-300 text-3xl ml-auto">shopping_cart</span>
           </div>
        </div>
        <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
           <div class="text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Transactions Archived</div>
           <div class="flex items-end gap-2">
              <span class="text-3xl font-extrabold text-emerald-500">{{ stats.transactionsCount || 0 }}</span>
              <span class="material-symbols-outlined text-slate-300 text-3xl ml-auto">receipt_long</span>
           </div>
        </div>
        <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
           <div class="text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Reports Archived</div>
           <div class="flex items-end gap-2">
              <span class="text-3xl font-extrabold text-violet-500">{{ stats.reportsCount || 0 }}</span>
              <span class="material-symbols-outlined text-slate-300 text-3xl ml-auto">description</span>
           </div>
        </div>
        <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
           <div class="text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Total Size</div>
           <div class="flex items-end gap-2">
              <span class="text-3xl font-extrabold text-[#0d141b] dark:text-white">{{ formatFileSize(stats.totalSize || 0) }}</span>
              <span class="material-symbols-outlined text-slate-300 text-3xl ml-auto">hard_drive</span>
           </div>
        </div>
      </div>

      <!-- Archive Actions -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 p-6">
        <div class="flex items-center gap-3 mb-6">
           <div class="p-2 bg-primary/10 text-primary rounded-lg">
              <span class="material-symbols-outlined">inventory_2</span>
           </div>
           <div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Archive Data Operations</h3>
              <p class="text-xs text-slate-500">Move old data to JSON archives to reduce database load.</p>
           </div>
        </div>

        <!-- Archive Link Configuration -->
        <div class="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-xl p-5 mb-6">
          <div class="flex items-start gap-4">
             <div class="bg-blue-100 dark:bg-blue-800 text-primary dark:text-blue-100 p-2 rounded-lg shrink-0">
                <span class="material-symbols-outlined">link</span>
             </div>
             <div class="flex-1">
                <h4 class="text-sm font-bold text-slate-900 dark:text-white mb-2">Google Drive / External Storage Link</h4>
                <p class="text-xs text-slate-500 mb-3">
                  Specify an external storage location (e.g., Google Drive Folder) for quick reference to downloaded archive files.
                </p>
                <div class="flex flex-col sm:flex-row gap-3">
                   <input
                     v-model="archiveLink"
                     type="url"
                     class="flex-1 px-4 py-2 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/50 text-[#0d141b] dark:text-white placeholder:text-[#94a3b8]"
                     placeholder="https://drive.google.com/..."
                     @blur="saveArchiveLink"
                   />
                   <a
                     v-if="archiveLink"
                     :href="archiveLink"
                     target="_blank"
                     rel="noopener noreferrer"
                     class="px-4 py-2 bg-white dark:bg-slate-800 text-primary border border-blue-200 dark:border-blue-800 rounded-lg text-sm font-bold hover:bg-blue-50 dark:hover:bg-blue-900/50 transition flex items-center justify-center gap-2"
                   >
                     <span class="material-symbols-outlined text-[18px]">open_in_new</span>
                     Open
                   </a>
                </div>
             </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <!-- Archive Orders -->
          <button
            @click="showArchiveOrdersModal = true"
            class="flex items-center p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#137fec] hover:shadow-md hover:bg-blue-50/30 transition-all text-left bg-white dark:bg-slate-800 group"
          >
             <div class="bg-blue-50 dark:bg-blue-900/30 text-blue-600 p-3 rounded-lg mr-4 group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined">shopping_bag</span>
             </div>
             <div>
                <h4 class="font-bold text-[#0d141b] dark:text-white text-sm group-hover:text-[#137fec] transition-colors">Archive Orders</h4>
                <p class="text-xs text-[#4c739a]">Completed/Cancelled</p>
             </div>
          </button>

          <!-- Archive Transactions -->
          <button
            @click="showArchiveTransactionsModal = true"
            class="flex items-center p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:shadow-md hover:bg-emerald-50/30 transition-all text-left bg-white dark:bg-slate-800 group"
          >
             <div class="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 p-3 rounded-lg mr-4 group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined">payments</span>
             </div>
             <div>
                <h4 class="font-bold text-[#0d141b] dark:text-white text-sm group-hover:text-emerald-600 transition-colors">Archive Transactions</h4>
                <p class="text-xs text-[#4c739a]">Finished/Failed</p>
             </div>
          </button>

          <!-- Archive Reports -->
          <button
            @click="showArchiveReportsModal = true"
            class="flex items-center p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-violet-500 hover:shadow-md hover:bg-violet-50/30 transition-all text-left bg-white dark:bg-slate-800 group"
          >
             <div class="bg-violet-50 dark:bg-violet-900/30 text-violet-600 p-3 rounded-lg mr-4 group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined">summarize</span>
             </div>
             <div>
                <h4 class="font-bold text-[#0d141b] dark:text-white text-sm group-hover:text-violet-600 transition-colors">Archive Reports</h4>
                <p class="text-xs text-[#4c739a]">Generated Reports</p>
             </div>
          </button>

          <!-- Archive All -->
          <button
            @click="showArchiveAllModal = true"
            class="flex items-center p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10 hover:border-amber-500 hover:shadow-md hover:bg-amber-100/50 transition-all text-left group"
          >
             <div class="bg-amber-100 dark:bg-amber-800 text-amber-600 p-3 rounded-lg mr-4 group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined">folder_zip</span>
             </div>
             <div>
                <h4 class="font-bold text-amber-900 dark:text-amber-100 text-sm group-hover:text-amber-700 transition-colors">Archive All</h4>
                <p class="text-xs text-amber-700/80 dark:text-amber-300/80">Everything at once</p>
             </div>
          </button>
        </div>
      </div>

      <!-- Archive Files List -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col min-h-0">
        <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h2 class="text-lg font-bold text-[#0d141b] dark:text-white">Archive Files</h2>
          <button
            @click="loadArchiveFiles"
            class="p-2 text-[#4c739a] hover:text-[#137fec] rounded-lg hover:bg-slate-50 transition"
            title="Refresh"
          >
            <span class="material-symbols-outlined">refresh</span>
          </button>
        </div>

        <div v-if="archiveFiles.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
           <div class="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-full mb-3">
               <span class="material-symbols-outlined text-slate-300 text-4xl">folder_off</span>
           </div>
           <p class="text-slate-900 dark:text-white font-bold">No archive files yet</p>
           <p class="text-slate-500 text-sm mt-1">Run an archive process to see files here.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
            <thead class="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">File Name</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Type</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Size</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Created</th>
                <th class="px-6 py-4 text-right text-xs font-bold text-[#4c739a] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
              <tr v-for="file in archiveFiles" :key="file.path" class="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                   <div class="flex items-center gap-3">
                      <span class="material-symbols-outlined text-slate-400">description</span>
                      <span class="text-sm font-bold text-[#0d141b] dark:text-white">{{ file.name }}</span>
                   </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border"
                    :class="[
                      file.type === 'orders' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      file.type === 'transactions' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      'bg-violet-50 text-violet-700 border-violet-100'
                    ]"
                  >
                    {{ file.type }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-[#0d141b] dark:text-white">{{ formatFileSize(file.size) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-[#4c739a]">{{ formatDate(file.createdAt) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    @click="restoreArchive(file.path)"
                    class="px-3 py-1.5 bg-white border border-slate-200 text-[#4c739a] hover:text-[#137fec] hover:border-[#137fec] rounded-lg text-xs font-bold transition flex items-center gap-1 ml-auto shadow-sm"
                  >
                    <span class="material-symbols-outlined text-[16px]">history</span>
                    Restore
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Reusable Modal (Orders) -->
    <Teleport to="body">
      <div v-if="showArchiveOrdersModal" class="fixed inset-0 bg-[#0d141b]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showArchiveOrdersModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in">
           <div class="text-center mb-6">
              <div class="bg-blue-50 dark:bg-blue-900/30 text-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                 <span class="material-symbols-outlined text-3xl">shopping_bag</span>
              </div>
              <h3 class="text-xl font-bold text-[#0d141b] dark:text-white">Archive Orders</h3>
              <p class="text-sm text-[#4c739a] mt-1">Pindahkan order lama ke file arsip.</p>
           </div>
           
           <div class="space-y-4">
             <div>
                <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Lebih lama dari (hari)</label>
                <input
                  v-model.number="archiveOrdersDays"
                  type="number"
                  min="30"
                  max="730"
                  class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/50 text-center font-bold text-lg"
                />
                <p class="text-xs text-[#4c739a] mt-2 text-center">Rekomendasi: 730 hari (2 tahun)</p>
             </div>
             
             <div class="flex gap-3 pt-2">
                <button @click="showArchiveOrdersModal = false" class="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-[#4c739a] hover:bg-slate-50 transition">Batal</button>
                <button 
                  @click="archiveOrders" 
                  :disabled="archiving"
                  class="flex-1 px-4 py-2.5 bg-[#137fec] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition disabled:opacity-50"
                >
                  {{ archiving ? 'Memproses...' : 'Mulai Archive' }}
                </button>
             </div>
           </div>
        </div>
      </div>
    </Teleport>

    <!-- Reusable Modal (Transactions) -->
    <Teleport to="body">
      <div v-if="showArchiveTransactionsModal" class="fixed inset-0 bg-[#0d141b]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showArchiveTransactionsModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in">
           <div class="text-center mb-6">
              <div class="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                 <span class="material-symbols-outlined text-3xl">payments</span>
              </div>
              <h3 class="text-xl font-bold text-[#0d141b] dark:text-white">Archive Transactions</h3>
              <p class="text-sm text-[#4c739a] mt-1">Pindahkan transaksi lama ke file arsip.</p>
           </div>
           
           <div class="space-y-4">
             <div>
                <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Lebih lama dari (hari)</label>
                <input
                  v-model.number="archiveTransactionsDays"
                  type="number"
                  min="30"
                  max="730"
                  class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-center font-bold text-lg"
                />
             </div>
             
             <div class="flex gap-3 pt-2">
                <button @click="showArchiveTransactionsModal = false" class="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-[#4c739a] hover:bg-slate-50 transition">Batal</button>
                <button 
                  @click="archiveTransactions" 
                  :disabled="archiving"
                  class="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition disabled:opacity-50"
                >
                  {{ archiving ? 'Memproses...' : 'Mulai Archive' }}
                </button>
             </div>
           </div>
        </div>
      </div>
    </Teleport>

    <!-- Reusable Modal (Reports) -->
    <Teleport to="body">
      <div v-if="showArchiveReportsModal" class="fixed inset-0 bg-[#0d141b]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showArchiveReportsModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in">
           <div class="text-center mb-6">
              <div class="bg-violet-50 dark:bg-violet-900/30 text-violet-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                 <span class="material-symbols-outlined text-3xl">summarize</span>
              </div>
              <h3 class="text-xl font-bold text-[#0d141b] dark:text-white">Archive Reports</h3>
              <p class="text-sm text-[#4c739a] mt-1">Pindahkan laporan lama ke file arsip.</p>
           </div>
           
           <div class="space-y-4">
             <div>
                <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Lebih lama dari (hari)</label>
                <input
                  v-model.number="archiveReportsDays"
                  type="number"
                  min="30"
                  max="730"
                  class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-center font-bold text-lg"
                />
             </div>
             
             <div class="flex gap-3 pt-2">
                <button @click="showArchiveReportsModal = false" class="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-[#4c739a] hover:bg-slate-50 transition">Batal</button>
                <button 
                  @click="archiveReports" 
                  :disabled="archiving"
                  class="flex-1 px-4 py-2.5 bg-violet-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-500/30 hover:bg-violet-600 transition disabled:opacity-50"
                >
                  {{ archiving ? 'Memproses...' : 'Mulai Archive' }}
                </button>
             </div>
           </div>
        </div>
      </div>
    </Teleport>

    <!-- Archive All Modal -->
    <Teleport to="body">
      <div v-if="showArchiveAllModal" class="fixed inset-0 bg-[#0d141b]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showArchiveAllModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full p-6 animate-scale-in border-t-4 border-amber-500">
           <div class="flex items-start gap-4 mb-6">
              <div class="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full text-amber-600 shrink-0">
                 <span class="material-symbols-outlined text-3xl">warning</span>
              </div>
              <div>
                 <h3 class="text-xl font-bold text-[#0d141b] dark:text-white">Archive All Data</h3>
                 <p class="text-sm text-[#4c739a] mt-1">Tindakan ini akan mengarsipkan semua data lama sekaligus (Orders, Transactions, Reports). Proses ini mungkin memakan waktu.</p>
              </div>
           </div>

           <div class="space-y-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl mb-6">
             <div class="flex items-center justify-between">
                <label class="text-sm font-bold text-[#0d141b] dark:text-white">Orders older than (days)</label>
                <input v-model.number="archiveAllConfig.ordersOlderThanDays" type="number" class="w-20 px-2 py-1 bg-white border border-slate-200 rounded text-center text-sm font-bold">
             </div>
             <div class="flex items-center justify-between">
                <label class="text-sm font-bold text-[#0d141b] dark:text-white">Transactions older than (days)</label>
                <input v-model.number="archiveAllConfig.transactionsOlderThanDays" type="number" class="w-20 px-2 py-1 bg-white border border-slate-200 rounded text-center text-sm font-bold">
             </div>
             <div class="flex items-center justify-between">
                <label class="text-sm font-bold text-[#0d141b] dark:text-white">Reports older than (days)</label>
                <input v-model.number="archiveAllConfig.reportsOlderThanDays" type="number" class="w-20 px-2 py-1 bg-white border border-slate-200 rounded text-center text-sm font-bold">
             </div>
           </div>
           
           <div class="flex gap-3">
              <button @click="showArchiveAllModal = false" class="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-[#4c739a] hover:bg-slate-50 transition">Batal</button>
              <button 
                @click="archiveAll" 
                :disabled="archiving"
                class="flex-1 px-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-500/30 hover:bg-amber-600 transition disabled:opacity-50"
              >
                {{ archiving ? 'Processing...' : 'Confirm Archive All' }}
              </button>
           </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';
import { formatDateTime } from '../../utils/formatters';
import { useNotification } from '../../composables/useNotification';

const { success: showSuccess, error: showError, confirm: showConfirm } = useNotification();

const loading = ref(true);
const archiving = ref(false);
const stats = ref({
  ordersCount: 0,
  transactionsCount: 0,
  reportsCount: 0,
  totalSize: 0,
});
const archiveFiles = ref<any[]>([]);
const archiveLink = ref<string>('');

const showArchiveOrdersModal = ref(false);
const showArchiveTransactionsModal = ref(false);
const showArchiveReportsModal = ref(false);
const showArchiveAllModal = ref(false);

const archiveOrdersDays = ref(730); // 2 years default
const archiveTransactionsDays = ref(730); // 2 years default
const archiveReportsDays = ref(730); // 2 years default
const archiveAllConfig = ref({
  ordersOlderThanDays: 730, // 2 years
  transactionsOlderThanDays: 730, // 2 years
  reportsOlderThanDays: 730, // 2 years
});

const loadStats = async () => {
  try {
    const response = await api.get('/archives/stats');
    stats.value = response.data;
  } catch (error: any) {
    console.error('Error loading archive stats:', error);
    if (error.response?.status === 403) {
      showError('Anda tidak memiliki akses untuk melihat statistik archive. Hanya Super Admin yang bisa mengakses.');
    } else {
      showError(error.response?.data?.message || 'Gagal memuat statistik archive');
    }
  }
};

const loadArchiveFiles = async () => {
  try {
    const response = await api.get('/archives/files');
    archiveFiles.value = response.data.files || [];
  } catch (error: any) {
    console.error('Error loading archive files:', error);
    if (error.response?.status === 403) {
      showError('Anda tidak memiliki akses untuk melihat file archive. Hanya Super Admin yang bisa mengakses.');
    } else {
      showError(error.response?.data?.message || 'Gagal memuat daftar file archive');
    }
  }
};

const archiveOrders = async () => {
  archiving.value = true;
  try {
    const response = await api.post('/archives/orders', {
      olderThanDays: archiveOrdersDays.value || 730,
    });
    showSuccess(`Berhasil meng-archive ${response.data.count} orders`);
    showArchiveOrdersModal.value = false;
    await Promise.all([loadStats(), loadArchiveFiles()]);
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal meng-archive orders');
  } finally {
    archiving.value = false;
  }
};

const archiveTransactions = async () => {
  archiving.value = true;
  try {
    const response = await api.post('/archives/transactions', {
      olderThanDays: archiveTransactionsDays.value || 730,
    });
    showSuccess(`Berhasil meng-archive ${response.data.count} transactions`);
    showArchiveTransactionsModal.value = false;
    await Promise.all([loadStats(), loadArchiveFiles()]);
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal meng-archive transactions');
  } finally {
    archiving.value = false;
  }
};

const archiveReports = async () => {
  archiving.value = true;
  try {
    const response = await api.post('/archives/reports', {
      olderThanDays: archiveReportsDays.value || 730,
    });
    showSuccess(`Berhasil meng-archive ${response.data.count} reports`);
    showArchiveReportsModal.value = false;
    await Promise.all([loadStats(), loadArchiveFiles()]);
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal meng-archive reports');
  } finally {
    archiving.value = false;
  }
};

const archiveAll = async () => {
  const confirmed = await showConfirm(
    'Archive All Data',
    'Apakah Anda yakin ingin meng-archive semua data lama? Tindakan ini tidak dapat dibatalkan.',
    'Archive',
    'Cancel'
  );
  
  if (!confirmed) return;

  archiving.value = true;
  try {
    const response = await api.post('/archives/all', archiveAllConfig.value);
    showSuccess(
      `Berhasil meng-archive: ${response.data.orders} orders, ${response.data.transactions} transactions, ${response.data.reports} reports`
    );
    showArchiveAllModal.value = false;
    await Promise.all([loadStats(), loadArchiveFiles()]);
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal meng-archive data');
  } finally {
    archiving.value = false;
  }
};

const restoreArchive = async (archiveFile: string) => {
  const confirmed = await showConfirm(
    'Restore Archive',
    'Apakah Anda yakin ingin restore data dari archive ini?',
    'Restore',
    'Cancel'
  );
  
  if (!confirmed) return;

  try {
    await api.post('/archives/restore', { archiveFile });
    showSuccess('Berhasil restore data dari archive');
    await Promise.all([loadStats(), loadArchiveFiles()]);
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal restore archive');
  }
};

const formatDate = (date: string | Date) => {
  if (!date) return '-';
  return formatDateTime(date);
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const loadArchiveLink = () => {
  const savedLink = localStorage.getItem('archiveLink');
  if (savedLink) {
    archiveLink.value = savedLink;
  }
};

const saveArchiveLink = () => {
  if (archiveLink.value) {
    localStorage.setItem('archiveLink', archiveLink.value);
    showSuccess('Link archive berhasil disimpan');
  } else {
    localStorage.removeItem('archiveLink');
  }
};

onMounted(async () => {
  loading.value = true;
  loadArchiveLink();
  await Promise.all([loadStats(), loadArchiveFiles()]);
  loading.value = false;
});
</script>
