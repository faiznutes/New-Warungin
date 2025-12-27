<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-display">
    <!-- Header -->
    <header class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 sticky top-0 z-30 shadow-sm">
      <div class="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="h-10 w-10 shrink-0 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <span class="material-symbols-outlined text-[24px]">point_of_sale</span>
          </div>
          <div>
            <h1 class="text-xl font-bold text-slate-900 dark:text-white leading-tight">Shift Kasir</h1>
            <p class="text-sm text-slate-500 dark:text-slate-400">Kelola shift dan kas operasional</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
           <button
            v-if="currentShift && !currentShift.shiftEnd"
            @click="goToDashboard"
            class="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all font-bold text-sm"
          >
            <span class="material-symbols-outlined text-[20px]">dashboard</span>
            Dashboard
          </button>
          
          <button 
            @click="handleLogout"
            class="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all font-bold text-sm border border-red-200"
          >
            <span class="material-symbols-outlined text-[20px]">logout</span>
            Logout
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 p-6 overflow-y-auto">
      <div class="max-w-3xl mx-auto w-full pb-10">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <!-- 1. No Active Store Shift -->
        <div v-else-if="!currentStoreShift" class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
            <div class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span class="material-symbols-outlined text-[40px] text-blue-500">storefront</span>
            </div>
            <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Shift Toko Belum Dibuka</h2>
            <p class="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
                Shift toko (outlet) harus dibuka terlebih dahulu sebelum Anda bisa membuka shift kasir.
                Silakan hubungi Supervisor atau Manager Anda.
            </p>
            <div class="p-4 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-200 inline-block text-left text-sm">
                <strong>Catatan:</strong><br>
                Jika Anda memiliki akses Supervisor, silakan login ke Dashboard untuk membuka shift toko.
            </div>
        </div>

        <!-- 2. Active Store Shift BUT No Cash Shift -->
        <div v-else-if="currentStoreShift && (!currentShift || currentShift.shiftEnd)" class="space-y-6">
            <!-- Active Store Info -->
            <div class="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-6 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
                <div>
                    <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">Shift Toko: AKTIF</h3>
                    <p class="text-sm text-slate-500 dark:text-slate-400">
                        Shift: <span class="font-bold capitalize text-blue-700">{{ currentStoreShift.shiftType }}</span> • 
                        Dibuka: {{ formatDateTime(currentStoreShift.openedAt) }}
                    </p>
                </div>
                <div class="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <span class="material-symbols-outlined">check</span>
                </div>
            </div>

            <!-- Open Cash Shift Form -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
                <div class="text-center mb-8">
                    <div class="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span class="material-symbols-outlined text-[40px] text-emerald-500">payments</span>
                    </div>
                    <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Buka Shift Kasir</h2>
                    <p class="text-slate-500 dark:text-slate-400">Masukkan modal awal di laci kasir (cash drawer) Anda.</p>
                </div>

                <form @submit.prevent="handleOpenShift" class="space-y-6 max-w-md mx-auto">
                    <div>
                        <label class="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                             Modal Awal (Cash) <span class="text-red-500">*</span>
                        </label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                            <input
                                v-model.number="openShiftForm.modalAwal"
                                type="number"
                                min="0"
                                required
                                class="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-bold text-lg"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                             Catatan (Opsional)
                        </label>
                        <textarea
                            v-model="openShiftForm.catatan"
                            rows="2"
                            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                            placeholder="Catatan tambahan..."
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        :disabled="openingShift"
                        class="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-500/30 transition-all font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <span v-if="openingShift" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>{{ openingShift ? 'Membuka Shift...' : 'Buka Shift & Masuk POS' }}</span>
                    </button>
                </form>
            </div>
        </div>

        <!-- 3. Active Shift Detail (Summary) -->
        <div v-else class="space-y-6">
            <div class="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
                <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                
                <div class="relative z-10">
                    <div class="flex items-center gap-3 mb-6">
                        <span class="px-3 py-1 bg-white/20 rounded-lg text-sm font-bold backdrop-blur-sm border border-white/20">
                            SHIFT AKTIF
                        </span>
                        <span class="text-emerald-100 text-sm">
                            Dibuka: {{ formatDateTime(currentShift.shiftStart) }}
                        </span>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div>
                            <p class="text-emerald-100 text-sm font-medium mb-1">Modal Awal</p>
                            <p class="text-3xl font-bold">{{ formatCurrency(currentShift.modalAwal) }}</p>
                        </div>
                        <div>
                            <p class="text-emerald-100 text-sm font-medium mb-1">Total Penjualan</p>
                            <p class="text-3xl font-bold">{{ formatCurrency(currentShift.totalPenjualan || 0) }}</p>
                        </div>
                        <div>
                             <p class="text-emerald-100 text-sm font-medium mb-1">Total Kas Sistem</p>
                             <p class="text-3xl font-bold">{{ formatCurrency((currentShift.modalAwal || 0) + (currentShift.totalPenjualan || 0)) }}</p>
                        </div>
                    </div>

                    <div class="flex flex-col sm:flex-row gap-4">
                        <button
                            @click="goToPOS"
                            class="flex-1 py-4 px-6 bg-white text-emerald-600 hover:bg-emerald-50 rounded-xl font-bold shadow-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <span class="material-symbols-outlined">point_of_sale</span>
                            Lanjut ke POS
                        </button>
                        <button
                            @click="showCloseModal = true"
                            class="sm:w-auto py-4 px-6 bg-emerald-700/50 hover:bg-emerald-700 text-white rounded-xl font-bold border border-emerald-400/30 transition-colors flex items-center justify-center gap-2"
                        >
                            <span class="material-symbols-outlined">lock</span>
                            Tutup Shift
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Recent Activity / History Placeholder if needed -->
            <!-- For now strict requirements: Fullscreen, Header, Shift Detail -->
        </div>

      </div>
    </main>

    <!-- Close Shift Modal -->
    <div v-if="showCloseModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in-up">
            <h3 class="text-xl font-bold text-slate-900 mb-6">Tutup Shift Kasir</h3>
            
            <form @submit.prevent="handleCloseShift" class="space-y-4">
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">
                         Uang Fisik di Laci <span class="text-red-500">*</span>
                    </label>
                    <input
                        v-model.number="closeShiftForm.uangFisikTutup"
                        type="number"
                        min="0"
                        required
                        class="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg font-bold"
                    />
                </div>
                
                <div v-if="currentShift && closeShiftForm.uangFisikTutup" class="p-4 bg-slate-50 rounded-xl border border-slate-100">
                     <div class="flex justify-between items-center text-sm mb-1">
                         <span class="text-slate-500">Sistem:</span>
                         <span class="font-bold">{{ formatCurrency((currentShift.modalAwal || 0) + (currentShift.totalPenjualan || 0)) }}</span>
                     </div>
                     <div class="flex justify-between items-center">
                         <span class="text-slate-500 font-bold">Selisih:</span>
                         <span :class="['font-bold', calculateSelisih() < 0 ? 'text-red-500' : 'text-green-500']">
                             {{ formatCurrency(calculateSelisih()) }}
                         </span>
                     </div>
                </div>

                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Catatan</label>
                    <textarea v-model="closeShiftForm.catatan" rows="2" class="w-full px-4 py-2 border border-slate-200 rounded-xl"></textarea>
                </div>

                <div class="flex gap-3 pt-2">
                    <button type="button" @click="showCloseModal = false" class="flex-1 py-3 px-4 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">Batal</button>
                    <button type="submit" :disabled="closingShift" class="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-500/30">
                        {{ closingShift ? 'Proses...' : 'Tutup Shift' }}
                    </button>
                </div>
            </form>
        </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useNotification } from '../../composables/useNotification';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import api from '../../api';

const router = useRouter();
const authStore = useAuthStore();
const { showSuccess, showError } = useNotification();

// State
const loading = ref(true);
const currentStoreShift = ref<any>(null);
const currentShift = ref<any>(null); // Cash Shift
const openingShift = ref(false);
const closingShift = ref(false);
const showCloseModal = ref(false);

const openShiftForm = ref({
  modalAwal: 0,
  catatan: '',
});

const closeShiftForm = ref({
  uangFisikTutup: 0,
  catatan: '',
});

// Methods
const goToDashboard = () => router.push('/app/dashboard');
const goToPOS = () => router.push('/pos');
const handleLogout = () => {
    authStore.clearAuth();
    window.location.replace('/login');
};

const calculateSelisih = () => {
    if (!currentShift.value) return 0;
    const systemTotal = (currentShift.value.modalAwal || 0) + (currentShift.value.totalPenjualan || 0);
    return closeShiftForm.value.uangFisikTutup - systemTotal;
};

const loadData = async () => {
    loading.value = true;
    try {
        const selectedStoreId = authStore.selectedStoreId || localStorage.getItem('selectedStoreId');
        
        // 1. Load Store Shift
        if (selectedStoreId) {
            try {
                const res = await api.get('/store-shift/current', { params: { outletId: selectedStoreId } });
                currentStoreShift.value = res.data?.data || res.data || null;
            } catch (e) { currentStoreShift.value = null; }
        }

        // 2. Load Cash Shift
        try {
             // Ensure we check exactly the same endpoint as POS to avoid loop
             const res = await api.get('/cash-shift/current');
             const shift = res.data?.data || res.data;
             // STRICT CHECK: If shiftEnd is set, it's closed.
             if (shift && !shift.shiftEnd) {
                 currentShift.value = shift;
             } else {
                 currentShift.value = null;
             }
        } catch (e) { currentShift.value = null; }

    } finally {
        loading.value = false;
    }
};

const handleOpenShift = async () => {
    if (openShiftForm.value.modalAwal <= 0) return showError('Modal awal harus lebih dari 0');
    
    openingShift.value = true;
    try {
        await api.post('/cash-shift/open', {
            modalAwal: openShiftForm.value.modalAwal,
            catatan: openShiftForm.value.catatan
        });
        showSuccess('Shift berhasil dibuka! Mengalihkan ke POS...');
        await loadData(); // Reload to update UI state
        // Add a small delay to ensure backend update propagates if needed
        setTimeout(() => router.push('/pos'), 1000);
    } catch (e: any) {
        showError(e.response?.data?.message || 'Gagal membuka shift');
    } finally {
        openingShift.value = false;
    }
};

const handleCloseShift = async () => {
    if (!closeShiftForm.value.uangFisikTutup && closeShiftForm.value.uangFisikTutup !== 0) return showError('Masukkan jumlah uang fisik');
    
    closingShift.value = true;
    try {
        await api.post('/cash-shift/close', {
            uangFisikTutup: closeShiftForm.value.uangFisikTutup,
            catatan: closeShiftForm.value.catatan
        });
        showSuccess('Shift ditutup.');
        showCloseModal.value = false;
        await loadData();
    } catch (e: any) {
        showError(e.response?.data?.message || 'Gagal menutup shift');
    } finally {
        closingShift.value = false;
    }
};

onMounted(() => {
    loadData();
});
</script>
