<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-display overflow-hidden relative">
    <!-- Blurred Background (Simulated) -->
    <div class="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8 flex flex-col gap-6 filter blur-[6px] opacity-60 pointer-events-none select-none">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-32"></div>
            <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-32"></div>
            <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-32"></div>
        </div>
        <div class="flex-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm"></div>
    </div>

    <!-- Top Navigation Bar (Floating) -->
    <header class="flex-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-50 relative px-6 py-3">
      <div class="w-full max-w-7xl mx-auto flex items-center justify-between">
        <!-- Left: Logo & Branding -->
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <span class="material-symbols-outlined text-xl">storefront</span>
          </div>
          <div>
            <h2 class="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">Warungin POS</h2>
            <p class="text-xs text-slate-500 font-medium">{{ currentOutlet?.name || 'Loading Store...' }}</p>
          </div>
        </div>

        <!-- Center: Date & Time Display -->
        <div class="hidden md:flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-1.5 rounded-full border border-slate-100 dark:border-slate-700">
             <span class="material-symbols-outlined text-slate-400 text-sm">schedule</span>
             <span class="text-slate-600 dark:text-slate-300 text-sm font-medium">{{ formattedDate }}</span>
        </div>

        <!-- Right: User Profile -->
        <div class="flex items-center gap-4">
             <div class="flex flex-col items-end mr-2">
                 <span class="text-sm font-bold text-slate-800 dark:text-white">{{ authStore.user?.name }}</span>
                 <span class="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full capitalize">{{ authStore.user?.role?.replace('_', ' ').toLowerCase() }}</span>
             </div>
             <div class="h-10 w-10 rounded-full bg-slate-200 overflow-hidden ring-2 ring-emerald-500/20 flex items-center justify-center text-slate-500">
                 <span class="material-symbols-outlined">person</span>
             </div>
             <button 
                @click="handleLogout"
                class="ml-2 p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                title="Logout"
            >
                <span class="material-symbols-outlined">logout</span>
            </button>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1 relative w-full h-full flex items-center justify-center p-4 z-40">
        
        <!-- Loading State -->
        <div v-if="loading" class="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl flex flex-col items-center">
             <div class="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
             <p class="text-slate-500 font-medium">Memuat data shift...</p>
        </div>

        <!-- SCENARIO 1: Store Shift Closed -->
        <div v-else-if="!currentStoreShift" class="max-w-2xl mx-auto w-full animate-fade-in-up">
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-700 p-8 relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            <div class="text-center mb-8">
              <div class="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <span class="material-symbols-outlined text-[40px] text-blue-600 dark:text-blue-400">storefront</span>
              </div>
              <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Buka Shift Toko</h2>
              <p class="text-slate-500 dark:text-slate-400">
                Shift toko belum aktif.
                <span v-if="canOpenStoreShift">Silakan buka shift toko terlebih dahulu.</span>
                <span v-else>Hubungi Supervisor untuk membuka operasional toko.</span>
              </p>
            </div>

             <!-- Open Store Shift Form (If allowed) -->
             <div v-if="canOpenStoreShift">
                 <form @submit.prevent="handleOpenStoreShift" class="space-y-6">
                    <div class="space-y-2">
                        <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Pilih Shift Toko <span class="text-red-500">*</span></label>
                        <select 
                            v-model="storeShiftForm.shiftType" 
                            required
                            class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 dark:text-white font-medium transition-all appearance-none"
                        >
                            <option value="" disabled>Pilih Shift</option>
                            <option 
                                v-for="shift in availableShifts" 
                                :key="shift.name" 
                                :value="shift.name"
                            >
                                {{ shift.label }}
                            </option>
                        </select>
                    </div>

                    <button type="submit" :disabled="processingStore || !storeShiftForm.shiftType" class="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform active:scale-[0.98]">
                        <span v-if="processingStore" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>{{ processingStore ? 'Membuka...' : 'Buka Shift Toko' }}</span>
                    </button>
                 </form>
             </div>
             
             <div v-else>
                 <div class="p-4 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-200 text-sm text-center">
                     Anda tidak memiliki akses untuk membuka shift toko.
                 </div>
                 <button @click="handleLogout" class="w-full mt-4 text-sm font-medium text-slate-500 hover:text-slate-700 py-2 transition-colors">
                     Logout
                 </button>
             </div>
        </div>
        </div>

        <!-- SCENARIO 2: Store Open, Cash Shift Closed -->
        <div v-else-if="currentStoreShift && (!currentShift || currentShift.shiftEnd)" class="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-dashed border-slate-300 dark:border-slate-700 p-8 relative overflow-hidden animate-fade-in-up">
            <!-- Modal Header -->
            <div class="text-center mb-8">
                <div class="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100 dark:border-emerald-800/50 shadow-inner">
                    <span class="material-symbols-outlined text-[32px] text-emerald-600 dark:text-emerald-500">point_of_sale</span>
                </div>
                <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Buka Shift Kasir</h2>
                <p class="text-slate-500 dark:text-slate-400 text-sm">
                    Halo, <span class="font-bold text-slate-800 dark:text-slate-200">{{ authStore.user?.name }}!</span> Pastikan saldo laci uang tunai sesuai.
                </p>
            </div>

            <!-- Form Content -->
            <div>
                <form @submit.prevent="handleOpenShift" class="space-y-6">
                    <!-- Input Group: Saldo Awal -->
                    <div class="space-y-2">
                        <label class="block text-sm font-bold text-slate-900 dark:text-white ml-1">
                            Modal Awal <span class="text-red-500">*</span>
                        </label>
                        <div class="relative group">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-emerald-600 transition-colors">Rp</span>
                            <input
                                v-model.number="openShiftForm.modalAwal"
                                type="number"
                                step="0.01"
                                min="0.01"
                                required
                                class="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 dark:text-white font-bold transition-all text-lg"
                                placeholder="0"
                            />
                        </div>
                        <p class="text-xs text-slate-500 ml-1">Masukkan jumlah uang tunai yang tersedia di kasir</p>
                    </div>

                    <!-- Notes Field -->
                    <div class="space-y-2">
                        <label class="block text-sm font-bold text-slate-900 dark:text-white ml-1">
                            Catatan (Opsional)
                        </label>
                        <textarea 
                            v-model="openShiftForm.catatan"
                            rows="2" 
                            placeholder="Contoh: Pecahan 50rb kurang..." 
                            class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 dark:text-white text-sm transition-all resize-none"
                        ></textarea>
                    </div>

                    <!-- Action Buttons -->
                    <div class="pt-2 flex flex-col gap-3">
                        <button 
                            type="submit" 
                            :disabled="openingShift"
                            class="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl shadow-lg shadow-emerald-500/30 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform active:scale-[0.98]"
                        >
                            <span v-if="openingShift" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            <span>{{ openingShift ? 'Membuka...' : 'Buka Shift Kasir' }}</span>
                        </button>
                        <button 
                            type="button" 
                            @click="handleLogout"
                            class="w-full text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 py-2 transition-colors"
                        >
                            Kembali ke Login
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- SCENARIO 3: Shift Already Active - Show Dashboard -->
        <div v-else class="w-full max-w-3xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in-up">
             <!-- Header -->
             <div class="px-8 pt-8 pb-4">
                 <div class="flex items-center justify-between">
                     <div class="flex items-center gap-4">
                         <div class="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <span class="material-symbols-outlined text-[32px] text-white">check_circle</span>
                         </div>
                         <div>
                             <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Shift Aktif</h2>
                             <p class="text-slate-500 text-sm flex items-center gap-2">
                                <span class="material-symbols-outlined text-[16px]">schedule</span>
                                Dibuka: {{ formatDateTime(currentShift.shiftStart) }}
                             </p>
                         </div>
                     </div>
                     <span class="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-xl text-sm font-bold border border-emerald-200 shadow-sm animate-pulse-slow">AKTIF</span>
                 </div>
             </div>

             <!-- Stats Cards -->
             <div class="px-8 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-100 dark:border-blue-800">
                     <p class="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-1">Modal Awal</p>
                     <p class="text-xl font-bold text-slate-900 dark:text-white">{{ formatCurrency(currentShift.modalAwal) }}</p>
                 </div>
                 <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-5 border border-emerald-100 dark:border-emerald-800">
                     <p class="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mb-1">Total Penjualan</p>
                     <p class="text-xl font-bold text-blue-600 dark:text-blue-400">{{ formatCurrency(currentShift.totalPenjualan || 0) }}</p>
                 </div>
                 <div class="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-5 border border-purple-100 dark:border-purple-800">
                     <p class="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider mb-1">Saldo Seharusnya</p>
                     <p class="text-xl font-bold text-emerald-600 dark:text-emerald-400">{{ formatCurrency((currentShift.modalAwal || 0) + (currentShift.totalPenjualan || 0)) }}</p>
                 </div>
             </div>

             <!-- Action Buttons -->
             <div class="px-8 py-6 grid grid-cols-2 gap-4">
                 <button @click="goToPOS" class="py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]">
                    <span class="material-symbols-outlined">point_of_sale</span>
                    Masuk ke POS
                 </button>
                 <button @click="showCloseModal = true" class="py-4 bg-white border border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-xl font-bold shadow-sm transition-all flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined">lock</span>
                    Tutup Shift
                 </button>
             </div>

             <!-- Quick Nav -->
             <div class="px-8 pb-8 flex gap-3">
                  <button @click="goToDashboard" class="flex-1 py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-sm">
                    <span class="material-symbols-outlined text-lg">dashboard</span>
                    Dashboard
                  </button>
                  <button @click="loadData" class="py-3 px-4 bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-sm">
                    <span class="material-symbols-outlined text-lg">refresh</span>
                  </button>
             </div>
        </div>
    </main>

    <!-- Close Shift Modal -->
    <div
      v-if="showCloseModal"
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-all duration-300"
      @click.self="showCloseModal = false"
    >
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up border border-slate-200 dark:border-slate-700">
        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center">Tutup Shift Kasir</h3>
        
        <div class="mb-4 space-y-2">
          <div class="bg-blue-50 rounded-xl p-3">
             <div class="flex justify-between items-center text-sm">
                 <span class="text-blue-700 font-medium">Modal Awal</span>
                 <span class="font-bold text-blue-900">{{ formatCurrency(currentShift?.modalAwal || 0) }}</span>
             </div>
          </div>
          <div class="bg-emerald-50 rounded-xl p-3">
             <div class="flex justify-between items-center text-sm">
                 <span class="text-emerald-700 font-medium">Total Penjualan</span>
                 <span class="font-bold text-emerald-900">{{ formatCurrency(currentShift?.totalPenjualan || 0) }}</span>
             </div>
          </div>
          <div class="bg-slate-100 rounded-xl p-3 border border-dashed border-slate-300">
             <div class="flex justify-between items-center text-sm">
                 <span class="text-slate-600 font-medium">Total Cash (System)</span>
                 <span class="font-bold text-slate-900">{{ formatCurrency((currentShift?.modalAwal || 0) + (currentShift?.totalPenjualan || 0)) }}</span>
             </div>
          </div>
        </div>

        <form @submit.prevent="handleCloseShift" class="space-y-6">
          <div class="space-y-2">
            <label class="block text-sm font-bold text-slate-900 dark:text-white ml-1">
              Uang Fisik di Laci <span class="text-red-500">*</span>
            </label>
            <div class="relative group">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-emerald-600 transition-colors">Rp</span>
              <input
                v-model.number="closeShiftForm.uangFisikTutup"
                type="number"
                step="0.01"
                min="0"
                required
                class="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 dark:text-white font-bold transition-all text-lg"
                placeholder="0"
              />
            </div>
            <p class="text-xs text-slate-500 ml-1">Masukkan total uang tunai yang ada di laci kasir</p>
          </div>

          <!-- Difference Indicator -->
          <div v-if="closeShiftForm.uangFisikTutup && currentShift" class="animate-fade-in-up">
            <div 
                class="rounded-xl p-4 text-center border cursor-help transition-all duration-300"
                :class="{
                    'bg-green-50 border-green-200 text-green-700 shadow-sm': calculateSelisih() > 0,
                    'bg-red-50 border-red-200 text-red-700 shadow-sm': calculateSelisih() < 0,
                    'bg-slate-50 border-slate-200 text-slate-700': calculateSelisih() === 0
                }"
            >
              <p class="text-xs font-bold uppercase tracking-wider mb-1 opacity-80">Selisih</p>
              <p class="text-2xl font-bold flex items-center justify-center gap-2">
                {{ formatCurrency(Math.abs(calculateSelisih())) }}
                <span class="text-sm font-bold px-2 py-0.5 rounded-md bg-white/50 border border-current shadow-sm h-fit">
                    {{ calculateSelisih() > 0 ? 'LEBIH' : calculateSelisih() < 0 ? 'KURANG' : 'PAS' }}
                </span>
              </p>
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-bold text-slate-900 dark:text-white ml-1">
              Catatan (Opsional)
            </label>
            <textarea
              v-model="closeShiftForm.catatan"
              rows="2"
              class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 dark:text-white text-sm transition-all resize-none"
              placeholder="Tambahkan catatan..."
            ></textarea>
          </div>

          <div class="flex gap-3 pt-2">
            <button
              type="button"
              @click="showCloseModal = false"
              class="flex-1 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition font-bold text-slate-600"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="closingShift || !closeShiftForm.uangFisikTutup"
              class="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 active:scale-[0.98]"
            >
              <span v-if="closingShift" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ closingShift ? 'Menutup...' : 'Tutup Shift' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useNotification } from '../../composables/useNotification';
import { formatCurrency } from '../../utils/formatters';
import api from '../../api';

const router = useRouter();
const authStore = useAuthStore();
const { showSuccess, showError } = useNotification();

// State
const loading = ref(true);
const currentStoreShift = ref<any>(null);
const currentShift = ref<any>(null); // Cash Shift
const currentOutlet = ref<any>(null); // Store Config
const openingShift = ref(false);
const processingStore = ref(false);
const closingShift = ref(false);
const showCloseModal = ref(false);
const currentTime = ref('');

const openShiftForm = ref({
  modalAwal: 0,
  catatan: '',
});

const storeShiftForm = ref({
    shiftType: '',
    modalAwal: 0
});

const closeShiftForm = ref({
  uangFisikTutup: 0,
  catatan: '',
});

// Computed
const canOpenStoreShift = computed(() => {
    return ['SUPER_ADMIN', 'ADMIN_TENANT', 'SUPERVISOR', 'CASHIER'].includes(authStore.user?.role || '');
});

const availableShifts = computed(() => {
    const defaultShifts = [
        { name: 'pagi', label: 'Pagi (06:00 - 14:00)' },
        { name: 'siang', label: 'Siang (14:00 - 22:00)' },
        { name: 'malam', label: 'Malam (22:00 - 06:00)' }
    ];

    if (currentOutlet.value && Array.isArray(currentOutlet.value.shiftConfig) && currentOutlet.value.shiftConfig.length > 0) {
        return currentOutlet.value.shiftConfig.map((s: any) => ({
            name: s.name,
            label: `${s.name} (${s.startTime} - ${s.endTime})`
        }));
    }
    
    return defaultShifts;
});

const formattedDate = computed(() => {
    const now = new Date();
    return now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }) + ' • ' + currentTime.value + ' WIB';
});

// Methods
const getShiftLabel = (shiftName: string) => {
    const found = availableShifts.value.find(s => s.name === shiftName || s.name.toLowerCase() === shiftName.toLowerCase());
    return found ? found.label : shiftName;
};

const goToDashboard = () => router.push('/app/dashboard');
const goToPOS = () => router.push('/pos');
const handleLogout = () => {
    authStore.clearAuth();
    window.location.replace('/login');
};

const updateClock = () => {
    const now = new Date();
    currentTime.value = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

const formatDateTime = (date: string | Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const calculateSelisih = (): number => {
    if (!currentShift.value || !closeShiftForm.value.uangFisikTutup) return 0;
    const saldoSeharusnya = (currentShift.value.modalAwal || 0) + (currentShift.value.totalPenjualan || 0);
    return closeShiftForm.value.uangFisikTutup - saldoSeharusnya;
};

const loadData = async () => {
    loading.value = true;
    try {
        const selectedStoreId = authStore.selectedStoreId || localStorage.getItem('selectedStoreId') || authStore.user?.tenantId;
        
        // 0. Load Outlet Config
        if (selectedStoreId) {
            try {
                const res = await api.get(`/outlets/${selectedStoreId}`);
                currentOutlet.value = res.data?.data || res.data;
            } catch (e) {
                console.warn('Could not load specific outlet details', e);
            }
        }

        // 1. Load Store Shift
        if (selectedStoreId) {
            try {
                const res = await api.get('/store-shift/current', { params: { outletId: selectedStoreId } });
                currentStoreShift.value = res.data?.data || res.data || null;
            } catch (e) { currentStoreShift.value = null; }
        }

        // 2. Load Cash Shift
        try {
             const res = await api.get('/cash-shift/current');
             const shift = res.data?.data || res.data;
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

const handleOpenStoreShift = async () => {
  if (!storeShiftForm.value.shiftType) return;
  processingStore.value = true;
  try {
    const selectedStoreId = authStore.selectedStoreId || localStorage.getItem('selectedStoreId');
    await api.post('/store-shift', {
      outletId: selectedStoreId,
      shiftType: storeShiftForm.value.shiftType,
    });
    await showSuccess('Shift toko berhasil dibuka');
    await loadData();
  } catch (error: any) {
    await showError(error.response?.data?.message || 'Gagal membuka shift toko');
  } finally {
    processingStore.value = false;
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
        setTimeout(() => router.push('/pos'), 800);
    } catch (e: any) {
        showError(e.response?.data?.message || 'Gagal membuka shift');
        openingShift.value = false;
    }
};

const handleCloseShift = async () => {
    if (!closeShiftForm.value.uangFisikTutup && closeShiftForm.value.uangFisikTutup !== 0) {
        await showError('Uang fisik tutup wajib diisi');
        return;
    }

    closingShift.value = true;
    try {
        const response = await api.post('/cash-shift/close', {
            uangFisikTutup: closeShiftForm.value.uangFisikTutup,
            catatan: closeShiftForm.value.catatan || undefined,
        });

        await showSuccess('Shift berhasil ditutup');
        
        // Generate and show PDF report
        const shiftData = response.data || currentShift.value;
        generateShiftReport(shiftData);
        
        showCloseModal.value = false;
        closeShiftForm.value = { uangFisikTutup: 0, catatan: '' };
        await loadData();
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Gagal menutup shift';
        await showError(errorMessage);
    } finally {
        closingShift.value = false;
    }
};

const generateShiftReport = (shiftData: any) => {
    const modalAwal = shiftData?.modalAwal || currentShift.value?.modalAwal || 0;
    const totalSales = shiftData?.totalPenjualan || currentShift.value?.totalPenjualan || 0;
    const physicalCash = closeShiftForm.value.uangFisikTutup;
    const expectedBalance = modalAwal + totalSales;
    const difference = physicalCash - expectedBalance;
    const now = new Date();
    const storeName = authStore.user?.tenantName || 'Store';
    const cashierName = authStore.user?.name || 'Cashier';
    
    const reportHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Shift Report - ${now.toLocaleDateString('id-ID')}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; background: #f8f9fa; }
        .report { max-width: 400px; margin: 0 auto; background: white; padding: 24px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px dashed #e0e0e0; padding-bottom: 16px; margin-bottom: 16px; }
        .header h1 { font-size: 20px; font-weight: bold; color: #1a1a1a; }
        .header p { font-size: 12px; color: #666; margin-top: 4px; }
        .section { margin-bottom: 16px; }
        .section-title { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
        .row:last-child { border-bottom: none; }
        .row .label { color: #555; font-size: 13px; }
        .row .value { font-weight: 600; color: #1a1a1a; font-size: 13px; }
        .total-row { background: #f8f9fa; margin: 0 -24px; padding: 12px 24px; border-top: 2px solid #e0e0e0; }
        .total-row .value { font-size: 18px; color: #10b981; }
        .difference { padding: 12px; border-radius: 8px; text-align: center; margin-top: 16px; }
        .difference.positive { background: #d1fae5; color: #065f46; }
        .difference.negative { background: #fee2e2; color: #991b1b; }
        .difference.zero { background: #f3f4f6; color: #374151; }
        .footer { text-align: center; margin-top: 20px; padding-top: 16px; border-top: 2px dashed #e0e0e0; }
        .footer p { font-size: 11px; color: #888; }
        .print-btn { display: block; width: 100%; padding: 12px; margin-top: 20px; background: #10b981; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
        .print-btn:hover { background: #059669; }
        @media print { .print-btn { display: none; } body { background: white; } .report { box-shadow: none; } }
      </style>
    </head>
    <body>
      <div class="report">
        <div class="header">
          <h1>LAPORAN TUTUP SHIFT</h1>
          <p>${storeName}</p>
          <p>${now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p>${now.toLocaleTimeString('id-ID')}</p>
        </div>
        
        <div class="section">
          <div class="section-title">Informasi Kasir</div>
          <div class="row">
            <span class="label">Nama Kasir</span>
            <span class="value">${cashierName}</span>
          </div>
          <div class="row">
            <span class="label">Waktu Buka</span>
            <span class="value">${shiftData?.shiftStart ? new Date(shiftData.shiftStart).toLocaleTimeString('id-ID') : '-'}</span>
          </div>
          <div class="row">
            <span class="label">Waktu Tutup</span>
            <span class="value">${now.toLocaleTimeString('id-ID')}</span>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Ringkasan Kas</div>
          <div class="row">
            <span class="label">Modal Awal</span>
            <span class="value">Rp ${modalAwal.toLocaleString('id-ID')}</span>
          </div>
          <div class="row">
            <span class="label">Total Penjualan</span>
            <span class="value">Rp ${totalSales.toLocaleString('id-ID')}</span>
          </div>
          <div class="row total-row">
            <span class="label">Saldo Seharusnya</span>
            <span class="value">Rp ${expectedBalance.toLocaleString('id-ID')}</span>
          </div>
          <div class="row">
            <span class="label">Uang Fisik</span>
            <span class="value">Rp ${physicalCash.toLocaleString('id-ID')}</span>
          </div>
        </div>
        
        <div class="difference ${difference > 0 ? 'positive' : difference < 0 ? 'negative' : 'zero'}">
          <strong>Selisih: Rp ${Math.abs(difference).toLocaleString('id-ID')} ${difference > 0 ? '(Lebih)' : difference < 0 ? '(Kurang)' : '(Pas)'}</strong>
        </div>
        
        <div class="footer">
          <p>Laporan ini dicetak secara otomatis</p>
          <p>Warungin POS System</p>
        </div>
        
        <button class="print-btn" onclick="window.print()">🖨️ Cetak Laporan</button>
      </div>
    </body>
    </html>
  `;
  
    const printWindow = window.open('', '_blank', 'width=500,height=700');
    if (printWindow) {
        printWindow.document.write(reportHtml);
        printWindow.document.close();
    }
};

let clockInterval: any;
onMounted(() => {
    updateClock();
    clockInterval = setInterval(updateClock, 1000);
    loadData();
});

onUnmounted(() => {
    if (clockInterval) clearInterval(clockInterval);
});
</script>
