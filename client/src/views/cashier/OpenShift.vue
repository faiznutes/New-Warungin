<template>
  <div class="min-h-screen bg-gradient-to-br from-[#0f151e] via-[#15202e] to-[#1a2332] flex flex-col">
    <!-- Header -->
    <header class="bg-[#1a2332]/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
      <div class="max-w-2xl mx-auto flex items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <button
            v-if="hasActiveShift"
            @click="goBack"
            class="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all duration-300"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 class="text-xl font-bold text-white">Buka Shift</h1>
            <p class="text-sm text-white/50">Mulai shift untuk mengakses POS</p>
          </div>
        </div>
        
        <button 
          @click="handleLogout"
          class="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all font-medium text-sm"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex items-center justify-center p-6">
      <div class="w-full max-w-lg">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <!-- Step 1: Open Store Shift (if no store shift) -->
        <div v-else-if="!currentStoreShift" class="bg-[#1a2332] rounded-2xl border border-white/10 p-8">
          <div class="text-center mb-8">
            <div class="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-white mb-2">Buka Shift Toko</h2>
            <p class="text-white/50">Shift toko belum dibuka. Buka shift toko terlebih dahulu.</p>
          </div>

          <form @submit.prevent="handleOpenStoreShift" class="space-y-6">
            <div>
              <label class="block text-sm font-semibold text-white mb-2">
                Tipe Shift <span class="text-red-400">*</span>
              </label>
              <select
                v-model="storeShiftForm.shiftType"
                required
                class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              >
                <option value="">Pilih Shift</option>
                <option value="pagi">Pagi (06:00 - 12:00)</option>
                <option value="siang">Siang (12:00 - 18:00)</option>
                <option value="sore">Sore (18:00 - 24:00)</option>
                <option value="malam">Malam (00:00 - 06:00)</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-white mb-2">
                Modal Awal (Opsional)
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-bold">Rp</span>
                <input
                  v-model.number="storeShiftForm.modalAwal"
                  type="number"
                  min="0"
                  class="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  placeholder="0"
                />
              </div>
            </div>

            <button
              type="submit"
              :disabled="processingStore || !storeShiftForm.shiftType"
              class="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg v-if="processingStore" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ processingStore ? 'Membuka Shift...' : 'Buka Shift Toko' }}
            </button>
          </form>
        </div>

        <!-- Step 2: Open Cash Shift (if store shift exists but no cash shift) -->
        <div v-else-if="currentStoreShift && !currentCashShift" class="bg-[#1a2332] rounded-2xl border border-white/10 p-8">
          <!-- Store shift info -->
          <div class="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-sm text-white/50">Shift Toko Aktif</p>
                <p class="text-white font-semibold capitalize">{{ currentStoreShift.shiftType }}</p>
              </div>
            </div>
          </div>

          <div class="text-center mb-8">
            <div class="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-white mb-2">Buka Shift Kasir</h2>
            <p class="text-white/50">Masukkan modal awal untuk memulai shift kasir Anda.</p>
          </div>

          <form @submit.prevent="handleOpenCashShift" class="space-y-6">
            <div>
              <label class="block text-sm font-semibold text-white mb-2">
                Modal Awal <span class="text-red-400">*</span>
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-bold">Rp</span>
                <input
                  v-model.number="cashShiftForm.modalAwal"
                  type="number"
                  min="0"
                  required
                  class="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  placeholder="100000"
                />
              </div>
              <p class="text-xs text-white/30 mt-2">Jumlah uang tunai di laci kasir saat shift dimulai</p>
            </div>

            <div>
              <label class="block text-sm font-semibold text-white mb-2">
                Catatan (Opsional)
              </label>
              <textarea
                v-model="cashShiftForm.catatan"
                rows="2"
                class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none"
                placeholder="Catatan tambahan..."
              ></textarea>
            </div>

            <button
              type="submit"
              :disabled="processingCash || !cashShiftForm.modalAwal"
              class="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg v-if="processingCash" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ processingCash ? 'Membuka Shift...' : 'Buka Shift Kasir & Lanjut ke POS' }}
            </button>
          </form>
        </div>

        <!-- Step 3: Already has shift - redirect to POS -->
        <div v-else class="bg-[#1a2332] rounded-2xl border border-white/10 p-8 text-center">
          <div class="w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-white mb-2">Shift Sudah Aktif!</h2>
          <p class="text-white/50 mb-6">Anda sudah memiliki shift aktif.</p>
          
          <div class="space-y-3">
            <button
              @click="goToPOS"
              class="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Masuk ke POS
            </button>
            
            <button
              @click="goToDashboard"
              class="w-full py-4 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Ke Dashboard
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useNotification } from '../../composables/useNotification';
import api from '../../api';

const router = useRouter();
const authStore = useAuthStore();
const { showSuccess, showError } = useNotification();

// State
const loading = ref(true);
const currentStoreShift = ref<any>(null);
const currentCashShift = ref<any>(null);
const processingStore = ref(false);
const processingCash = ref(false);

const storeShiftForm = ref({
  shiftType: '',
  modalAwal: 0,
});

const cashShiftForm = ref({
  modalAwal: 0,
  catatan: '',
});

// Methods
const goBack = () => {
  router.back();
};

const goToPOS = () => {
  router.push('/pos');
};

const goToDashboard = () => {
  router.push('/app/dashboard');
};

const handleLogout = () => {
  authStore.clearAuth();
  window.location.replace('/login');
};

const hasActiveShift = computed(() => {
  return currentCashShift.value && !currentCashShift.value.shiftEnd;
});

const loadShiftStatus = async () => {
  loading.value = true;
  try {
    // Load store shift
    const selectedStoreId = authStore.selectedStoreId || localStorage.getItem('selectedStoreId');
    if (selectedStoreId) {
      try {
        const storeResponse = await api.get('/store-shift/current', {
          params: { outletId: selectedStoreId }
        });
        currentStoreShift.value = storeResponse.data?.data || storeResponse.data || null;
      } catch (e: any) {
        if (e.response?.status !== 404) {
          console.error('Error loading store shift:', e);
        }
        currentStoreShift.value = null;
      }
    }

    // Load cash shift
    try {
      const cashResponse = await api.get('/cash-shift/current');
      currentCashShift.value = cashResponse.data?.data || cashResponse.data || null;
      // Check if shift is actually active (no end time)
      if (currentCashShift.value?.shiftEnd) {
        currentCashShift.value = null;
      }
    } catch (e: any) {
      if (e.response?.status !== 404) {
        console.error('Error loading cash shift:', e);
      }
      currentCashShift.value = null;
    }
  } finally {
    loading.value = false;
  }
};

const handleOpenStoreShift = async () => {
  if (!storeShiftForm.value.shiftType) {
    await showError('Pilih tipe shift terlebih dahulu');
    return;
  }

  processingStore.value = true;
  try {
    const selectedStoreId = authStore.selectedStoreId || localStorage.getItem('selectedStoreId');
    await api.post('/store-shift', {
      outletId: selectedStoreId,
      shiftType: storeShiftForm.value.shiftType,
      modalAwal: storeShiftForm.value.modalAwal || undefined,
    });
    await showSuccess('Shift toko berhasil dibuka');
    await loadShiftStatus();
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Gagal membuka shift toko';
    await showError(msg);
  } finally {
    processingStore.value = false;
  }
};

const handleOpenCashShift = async () => {
  if (!cashShiftForm.value.modalAwal && cashShiftForm.value.modalAwal !== 0) {
    await showError('Modal awal wajib diisi');
    return;
  }

  processingCash.value = true;
  try {
    await api.post('/cash-shift/open', {
      modalAwal: cashShiftForm.value.modalAwal,
      catatan: cashShiftForm.value.catatan || undefined,
    });
    await showSuccess('Shift kasir berhasil dibuka! Menuju POS...');
    // Redirect to POS after successful open
    setTimeout(() => {
      router.push('/pos');
    }, 500);
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Gagal membuka shift kasir';
    await showError(msg);
    processingCash.value = false;
  }
};

// Lifecycle
onMounted(() => {
  loadShiftStatus();
});
</script>
