<template>
  <div class="flex flex-col h-full p-4 sm:p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Uang Modal & Rekap Fisik</h1>
      <p class="text-sm sm:text-base text-gray-600">Kelola shift kasir dan rekap uang fisik</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- No Active Store Shift - Show Open Store Shift Form -->
    <div v-else-if="!currentStoreShift" class="max-w-2xl mx-auto">
      <div class="bg-white rounded-xl shadow-lg p-6 sm:p-8 border-2 border-dashed border-gray-300">
        <div class="text-center mb-6">
          <svg class="w-20 h-20 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Belum Ada Shift Toko Aktif</h2>
          <p class="text-gray-600">Silakan buka shift toko terlebih dahulu untuk memulai transaksi</p>
        </div>

        <form @submit.prevent="handleOpenStoreShift" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Shift Type <span class="text-red-500">*</span>
            </label>
            <select
              v-model="openStoreShiftForm.shiftType"
              required
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg font-semibold"
            >
              <option value="">Pilih Shift</option>
              <option value="pagi">Pagi (06:00 - 12:00)</option>
              <option value="siang">Siang (12:00 - 18:00)</option>
              <option value="sore">Sore (18:00 - 24:00)</option>
              <option value="malam">Malam (00:00 - 06:00)</option>
            </select>
            <p class="text-xs text-gray-500 mt-1">Pilih shift yang akan dibuka untuk toko ini</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Modal Awal (Opsional)
            </label>
            <input
              v-model.number="openStoreShiftForm.modalAwal"
              type="number"
              step="0.01"
              min="0"
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg font-semibold"
              placeholder="0"
            />
            <p class="text-xs text-gray-500 mt-1">Modal awal shift (opsional, bisa diisi saat buka cash shift kasir)</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Catatan (Opsional)
            </label>
            <textarea
              v-model="openStoreShiftForm.catatan"
              rows="3"
              class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Catatan tambahan..."
            ></textarea>
          </div>

          <button
            type="submit"
            :disabled="openingStoreShift || !openStoreShiftForm.shiftType"
            class="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg v-if="openingStoreShift" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ openingStoreShift ? 'Membuka Shift...' : 'Buka Shift Toko' }}</span>
          </button>
        </form>
      </div>
    </div>

    <!-- Active Store Shift - Show Store Shift Info and Cash Shift Form -->
    <div v-else-if="currentStoreShift && !currentShift" class="space-y-6">
      <!-- Store Shift Info Card -->
      <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 sm:p-8 border-2 border-blue-200">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Shift Toko Aktif</h2>
            <p class="text-sm text-gray-600">
              Shift: <span class="font-semibold capitalize">{{ currentStoreShift.shiftType }}</span> | 
              Dibuka: {{ formatDateTime(currentStoreShift.openedAt) }}
            </p>
            <p class="text-xs text-gray-500 mt-1" v-if="currentStoreShift.opener">
              Dibuka oleh: {{ currentStoreShift.opener.name }}
            </p>
          </div>
          <span class="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold capitalize">
            {{ currentStoreShift.shiftType }}
          </span>
        </div>
      </div>

      <!-- Cash Shift Form -->
      <div class="bg-white rounded-xl shadow-lg p-6 sm:p-8 border-2 border-dashed border-gray-300">
        <div class="text-center mb-6">
          <svg class="w-20 h-20 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Buka Cash Shift</h2>
          <p class="text-gray-600">Silakan buka cash shift untuk memulai transaksi</p>
        </div>

        <form @submit.prevent="handleOpenShift" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Modal Awal <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="openShiftForm.modalAwal"
              type="number"
              step="0.01"
              min="0.01"
              required
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg font-semibold"
              placeholder="0"
            />
            <p class="text-xs text-gray-500 mt-1">Masukkan jumlah uang modal yang tersedia di kasir</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Catatan (Opsional)
            </label>
            <textarea
              v-model="openShiftForm.catatan"
              rows="3"
              class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Catatan tambahan..."
            ></textarea>
          </div>

          <button
            type="submit"
            :disabled="openingShift || !openShiftForm.modalAwal || openShiftForm.modalAwal <= 0"
            class="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg v-if="openingShift" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ openingShift ? 'Membuka Shift...' : 'Buka Cash Shift' }}</span>
          </button>
        </form>
      </div>
    </div>

    <!-- Active Shift - Show Current Shift Info -->
    <div v-else class="space-y-6">
      <!-- Store Shift Info Card -->
      <div v-if="currentStoreShift" class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 sm:p-8 border-2 border-blue-200">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-bold text-gray-900 mb-1">Shift Toko</h3>
            <p class="text-sm text-gray-600">
              Shift: <span class="font-semibold capitalize">{{ currentStoreShift.shiftType }}</span> | 
              Dibuka: {{ formatDateTime(currentStoreShift.openedAt) }}
            </p>
            <p class="text-xs text-gray-500 mt-1" v-if="currentStoreShift.opener">
              Dibuka oleh: {{ currentStoreShift.opener.name }}
            </p>
          </div>
          <span class="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold capitalize">
            {{ currentStoreShift.shiftType }}
          </span>
        </div>
      </div>

      <!-- Current Cash Shift Card -->
      <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 sm:p-8 border-2 border-green-200">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Cash Shift Aktif</h2>
            <p class="text-sm text-gray-600">
              Dibuka: {{ formatDateTime(currentShift.shiftStart) }}
            </p>
          </div>
          <span class="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-semibold">
            BUKA
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <p class="text-sm text-gray-600 mb-1">Modal Awal</p>
            <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(currentShift.modalAwal) }}</p>
          </div>
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <p class="text-sm text-gray-600 mb-1">Total Penjualan</p>
            <p class="text-2xl font-bold text-blue-600">{{ formatCurrency(currentShift.totalPenjualan || 0) }}</p>
          </div>
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <p class="text-sm text-gray-600 mb-1">Saldo Seharusnya</p>
            <p class="text-2xl font-bold text-green-600">
              {{ formatCurrency((currentShift.modalAwal || 0) + (currentShift.totalPenjualan || 0)) }}
            </p>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="showCloseModal = true"
            class="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Tutup Shift
          </button>
          <button
            @click="loadCurrentShift"
            class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold"
          >
            Refresh
          </button>
        </div>
      </div>

      <!-- Shift History -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h3 class="text-xl font-bold text-gray-900 mb-4">Riwayat Shift</h3>
        <div v-if="historyLoading" class="text-center py-8">
          <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
        <div v-else-if="shiftHistory.length === 0" class="text-center py-8 text-gray-500">
          Belum ada riwayat shift
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modal Awal</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Penjualan</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uang Fisik</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Selisih</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="shift in shiftHistory"
                :key="shift.id"
                class="hover:bg-gray-50"
              >
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDateTime(shift.shiftStart) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {{ formatCurrency(shift.modalAwal) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {{ formatCurrency(shift.totalPenjualan || 0) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {{ shift.uangFisikTutup ? formatCurrency(shift.uangFisikTutup) : '-' }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold" :class="getSelisihClass(shift.selisih)">
                  {{ shift.selisih !== null ? formatCurrency(shift.selisih) : '-' }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-semibold rounded-full',
                      shift.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    ]"
                  >
                    {{ shift.status === 'open' ? 'Buka' : 'Tutup' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="historyPagination.totalPages > 1" class="mt-4 flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Halaman {{ historyPagination.page }} dari {{ historyPagination.totalPages }}
          </div>
          <div class="flex gap-2">
            <button
              @click="changeHistoryPage(historyPagination.page - 1)"
              :disabled="historyPagination.page === 1"
              class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Sebelumnya
            </button>
            <button
              @click="changeHistoryPage(historyPagination.page + 1)"
              :disabled="historyPagination.page === historyPagination.totalPages"
              class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Close Shift Modal -->
    <div
      v-if="showCloseModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="showCloseModal = false"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold text-gray-900 mb-4">Tutup Shift</h3>
        
        <div class="mb-4 space-y-2">
          <div class="bg-blue-50 rounded-lg p-3">
            <p class="text-sm text-gray-600">Modal Awal</p>
            <p class="text-lg font-bold text-gray-900">{{ formatCurrency(currentShift?.modalAwal || 0) }}</p>
          </div>
          <div class="bg-green-50 rounded-lg p-3">
            <p class="text-sm text-gray-600">Total Penjualan</p>
            <p class="text-lg font-bold text-green-600">{{ formatCurrency(currentShift?.totalPenjualan || 0) }}</p>
          </div>
          <div class="bg-purple-50 rounded-lg p-3">
            <p class="text-sm text-gray-600">Saldo Seharusnya</p>
            <p class="text-lg font-bold text-purple-600">
              {{ formatCurrency((currentShift?.modalAwal || 0) + (currentShift?.totalPenjualan || 0)) }}
            </p>
          </div>
        </div>

        <form @submit.prevent="handleCloseShift" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Uang Fisik di Kasir <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="closeShiftForm.uangFisikTutup"
              type="number"
              step="0.01"
              min="0"
              required
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg font-semibold"
              placeholder="0"
            />
            <p class="text-xs text-gray-500 mt-1">Masukkan jumlah uang fisik yang ada di kasir saat ini</p>
          </div>

          <div v-if="closeShiftForm.uangFisikTutup && currentShift">
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p class="text-sm text-gray-600 mb-1">Selisih</p>
              <p
                class="text-lg font-bold"
                :class="getSelisihClass(calculateSelisih())"
              >
                {{ formatCurrency(calculateSelisih()) }}
              </p>
              <p class="text-xs text-gray-500 mt-1">
                {{ calculateSelisih() > 0 ? 'Lebih' : calculateSelisih() < 0 ? 'Kurang' : 'Pas' }}
              </p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Catatan (Opsional)
            </label>
            <textarea
              v-model="closeShiftForm.catatan"
              rows="3"
              class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Catatan tambahan..."
            ></textarea>
          </div>

          <div class="flex gap-3">
            <button
              type="button"
              @click="showCloseModal = false"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="closingShift || !closeShiftForm.uangFisikTutup"
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ closingShift ? 'Menutup...' : 'Tutup Shift' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';
import { formatCurrency } from '../../utils/formatters';
import { useAuthStore } from '../../stores/auth';

const { success: showSuccess, error: showError } = useNotification();
const authStore = useAuthStore();

const loading = ref(true);
const currentShift = ref<any>(null);
const currentStoreShift = ref<any>(null);
const openingShift = ref(false);
const openingStoreShift = ref(false);
const closingShift = ref(false);
const showCloseModal = ref(false);

const openShiftForm = ref({
  modalAwal: 0,
  catatan: '',
});

const openStoreShiftForm = ref({
  shiftType: '',
  modalAwal: 0,
  catatan: '',
});

const closeShiftForm = ref({
  uangFisikTutup: 0,
  catatan: '',
});

const shiftHistory = ref<any[]>([]);
const historyLoading = ref(false);
const historyPagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
});

const loadCurrentStoreShift = async () => {
  try {
    const selectedStoreId = authStore.selectedStoreId || localStorage.getItem('selectedStoreId');
    if (!selectedStoreId) {
      currentStoreShift.value = null;
      return;
    }
    const response = await api.get('/store-shift/current', {
      params: { outletId: selectedStoreId },
    });
    currentStoreShift.value = response.data.data;
  } catch (error: any) {
    if (error.response?.status === 404 || !error.response?.data?.data) {
      currentStoreShift.value = null;
    } else {
      console.error('Error loading current store shift:', error);
    }
  }
};

const loadCurrentShift = async () => {
  try {
    const response = await api.get('/cash-shift/current');
    currentShift.value = response.data.data;
  } catch (error: any) {
    if (error.response?.status === 404 || !error.response?.data?.data) {
      currentShift.value = null;
    } else {
      console.error('Error loading current shift:', error);
    }
  }
};

const loadShiftHistory = async () => {
  historyLoading.value = true;
  try {
    const response = await api.get('/cash-shift/history', {
      params: {
        page: historyPagination.value.page,
        limit: historyPagination.value.limit,
      },
    });
    shiftHistory.value = response.data.data || [];
    historyPagination.value = response.data.pagination || {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    };
  } catch (error: any) {
    console.error('Error loading shift history:', error);
    shiftHistory.value = [];
  } finally {
    historyLoading.value = false;
  }
};

const handleOpenStoreShift = async () => {
  if (!openStoreShiftForm.value.shiftType) {
    await showError('Shift type wajib dipilih');
    return;
  }

  const selectedStoreId = authStore.selectedStoreId || localStorage.getItem('selectedStoreId');
  if (!selectedStoreId) {
    await showError('Store belum dipilih');
    return;
  }

  openingStoreShift.value = true;
  try {
    await api.post('/store-shift/open', {
      outletId: selectedStoreId,
      shiftType: openStoreShiftForm.value.shiftType,
      modalAwal: openStoreShiftForm.value.modalAwal || undefined,
      catatan: openStoreShiftForm.value.catatan || undefined,
    });

    await showSuccess(`Shift ${openStoreShiftForm.value.shiftType} berhasil dibuka`);
    openStoreShiftForm.value = { shiftType: '', modalAwal: 0, catatan: '' };
    await loadCurrentStoreShift();
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Gagal membuka shift toko';
    await showError(errorMessage);
  } finally {
    openingStoreShift.value = false;
  }
};

const handleOpenShift = async () => {
  if (!openShiftForm.value.modalAwal || openShiftForm.value.modalAwal <= 0) {
    await showError('Modal awal harus lebih besar dari 0');
    return;
  }

  openingShift.value = true;
  try {
    await api.post('/cash-shift/open', {
      modalAwal: openShiftForm.value.modalAwal,
      catatan: openShiftForm.value.catatan || undefined,
    });

    await showSuccess('Cash shift berhasil dibuka');
    openShiftForm.value = { modalAwal: 0, catatan: '' };
    await loadCurrentShift();
    await loadShiftHistory();
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Gagal membuka cash shift';
    await showError(errorMessage);
  } finally {
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
    await api.post('/cash-shift/close', {
      uangFisikTutup: closeShiftForm.value.uangFisikTutup,
      catatan: closeShiftForm.value.catatan || undefined,
    });

    await showSuccess('Shift berhasil ditutup');
    showCloseModal.value = false;
    closeShiftForm.value = { uangFisikTutup: 0, catatan: '' };
    await loadCurrentShift();
    await loadShiftHistory();
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Gagal menutup shift';
    await showError(errorMessage);
  } finally {
    closingShift.value = false;
  }
};

const calculateSelisih = (): number => {
  if (!currentShift.value || !closeShiftForm.value.uangFisikTutup) return 0;
  const saldoSeharusnya = (currentShift.value.modalAwal || 0) + (currentShift.value.totalPenjualan || 0);
  return closeShiftForm.value.uangFisikTutup - saldoSeharusnya;
};

const getSelisihClass = (selisih: number | null): string => {
  if (selisih === null) return 'text-gray-600';
  if (selisih > 0) return 'text-green-600';
  if (selisih < 0) return 'text-red-600';
  return 'text-gray-600';
};

const formatDateTime = (date: string | Date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const changeHistoryPage = (page: number) => {
  historyPagination.value.page = page;
  loadShiftHistory();
};

onMounted(async () => {
  loading.value = true;
  await Promise.all([loadCurrentStoreShift(), loadCurrentShift(), loadShiftHistory()]);
  loading.value = false;
});
</script>
