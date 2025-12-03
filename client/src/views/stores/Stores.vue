<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-6 px-4 sm:px-6">
      <div class="flex flex-col gap-2">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-900">
          Kelola Store
        </h2>
        <p class="text-sm sm:text-base text-gray-600">
          Kelola store/outlet untuk bisnis Anda
        </p>
      </div>
      <button
        :disabled="!canAddStore"
        class="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        @click="showCreateModal = true"
      >
        <svg
          class="w-4 h-4 sm:w-5 sm:h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span>Tambah Store</span>
      </button>
    </div>

    <!-- Store Limit Progress Bar -->
    <div
      v-if="storeLimit"
      class="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 mx-4 sm:mx-6"
    >
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-blue-100 rounded-lg">
            <svg
              class="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-gray-900">
              Limit Store
            </h3>
            <p class="text-xs text-gray-600">
              <span class="font-medium text-gray-900">{{ storeLimit.current }}</span>
              <span v-if="!storeLimit.isUnlimited"> / {{ storeLimit.max }}</span>
              <span v-else> / Unlimited</span>
              <span v-if="!storeLimit.isUnlimited"> store digunakan</span>
              <span v-else> store aktif</span>
            </p>
          </div>
        </div>
        <div class="text-right">
          <div
            class="text-lg font-bold"
            :class="getLimitColorClass()"
          >
            <span v-if="!storeLimit.isUnlimited">
              {{ storeLimit.remaining }} tersisa
            </span>
            <span
              v-else
              class="text-green-600"
            >Unlimited</span>
          </div>
        </div>
      </div>
      
      <!-- Progress Bar -->
      <div
        v-if="!storeLimit.isUnlimited"
        class="w-full bg-gray-200 rounded-full h-3 overflow-hidden"
      >
        <div
          class="h-full rounded-full transition-all duration-300"
          :class="getProgressBarColorClass()"
          :style="{ width: `${getProgressPercentage()}%` }"
        ></div>
      </div>
      <div
        v-else
        class="w-full bg-gray-200 rounded-full h-3"
      >
        <div
          class="h-full bg-green-500 rounded-full"
          style="width: 100%"
        ></div>
      </div>
      
      <!-- Warning message if limit reached -->
      <div
        v-if="!storeLimit.isUnlimited && storeLimit.remaining === 0"
        class="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
      >
        <div class="flex items-start gap-2">
          <svg
            class="w-5 h-5 text-yellow-600 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div class="flex-1">
            <p class="text-sm font-medium text-yellow-800">
              Limit store telah tercapai
            </p>
            <p class="text-xs text-yellow-700 mt-1">
              Beli addon "Tambah Outlet" untuk menambah slot store, atau upgrade ke plan yang lebih tinggi.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Stores List -->
    <div
      v-if="loading"
      class="flex items-center justify-center py-12"
    >
      <div class="flex flex-col items-center">
        <div class="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div class="text-gray-600 font-medium">
          Memuat data store...
        </div>
      </div>
    </div>

    <div
      v-else-if="stores.length === 0"
      class="flex flex-col items-center justify-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300 mx-4 sm:mx-6"
    >
      <svg
        class="w-20 h-20 text-gray-400 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">
        Belum Ada Store
      </h3>
      <p class="text-gray-600 text-center max-w-md mb-4">
        Mulai dengan menambahkan store pertama Anda
      </p>
      <button
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        @click="showCreateModal = true"
      >
        Tambah Store Pertama
      </button>
    </div>

    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-6"
    >
      <div
        v-for="store in stores"
        :key="store.id"
        class="bg-white rounded-xl shadow-lg p-5 sm:p-6 border border-gray-200 hover:shadow-xl transition-shadow"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-1">
              {{ store.name }}
            </h3>
            <div class="flex items-center gap-2 mb-2">
              <span
                class="px-2 py-1 text-xs font-semibold rounded-full"
                :class="store.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              >
                {{ store.isActive ? 'Aktif' : 'Nonaktif' }}
              </span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
              title="Edit Store"
              @click="editStore(store)"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              class="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Hapus Store"
              @click="deleteStore(store)"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
        
        <div class="space-y-2 text-sm text-gray-600">
          <div
            v-if="store.address"
            class="flex items-start gap-2"
          >
            <svg
              class="w-5 h-5 text-gray-400 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span class="flex-1">{{ store.address }}</span>
          </div>
          <div
            v-if="store.phone"
            class="flex items-center gap-2"
          >
            <svg
              class="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <span>{{ store.phone }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showCreateModal || editingStore"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-900">
              {{ editingStore ? 'Edit Store' : 'Tambah Store Baru' }}
            </h3>
            <button
              class="text-gray-400 hover:text-gray-600 transition"
              @click="closeModal"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form
            class="space-y-4"
            @submit.prevent="handleSubmit"
          >
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nama Store <span class="text-red-500">*</span>
              </label>
              <input
                v-model="storeForm.name"
                type="text"
                required
                placeholder="Contoh: Store Cabang A"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Alamat
              </label>
              <textarea
                v-model="storeForm.address"
                rows="3"
                placeholder="Alamat lengkap store"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nomor Telepon
              </label>
              <input
                v-model="storeForm.phone"
                type="tel"
                placeholder="085155043133"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div
              v-if="editingStore"
              class="flex items-center gap-2"
            >
              <input
                id="isActive"
                v-model="storeForm.isActive"
                type="checkbox"
                class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label
                for="isActive"
                class="text-sm font-medium text-gray-700"
              >
                Store Aktif
              </label>
            </div>

            <div class="flex space-x-3 pt-4 border-t">
              <button
                type="button"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                @click="closeModal"
              >
                Batal
              </button>
              <button
                type="submit"
                :disabled="processing"
                class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ processing ? 'Menyimpan...' : editingStore ? 'Update' : 'Simpan' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';

const { success: showSuccess, error: showError, confirm: showConfirm } = useNotification();

interface Store {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const stores = ref<Store[]>([]);
const loading = ref(false);
const processing = ref(false);
const showCreateModal = ref(false);
const editingStore = ref<Store | null>(null);
const storeLimit = ref<{
  max: number;
  current: number;
  remaining: number;
  isUnlimited: boolean;
} | null>(null);

const storeForm = ref({
  name: '',
  address: '',
  phone: '',
  isActive: true,
});

const loadStores = async () => {
  loading.value = true;
  try {
    const response = await api.get('/outlets');
    stores.value = response.data.data || [];
    
    // Get store limit info
    if (response.data.limit) {
      storeLimit.value = response.data.limit;
    }
  } catch (error: any) {
    await showError(error.response?.data?.message || 'Gagal memuat data store');
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  // Client-side validation
  if (!storeForm.value.name || storeForm.value.name.trim() === '') {
    await showError('Nama store wajib diisi');
    return;
  }
  
  processing.value = true;
  try {
    if (editingStore.value) {
      await api.put(`/outlets/${editingStore.value.id}`, storeForm.value);
      await showSuccess('Store berhasil diupdate');
    } else {
      await api.post('/outlets', storeForm.value);
      await showSuccess('Store berhasil ditambahkan');
    }
    closeModal();
    await loadStores();
  } catch (error: any) {
    await showError(error.response?.data?.message || 'Gagal menyimpan store');
  } finally {
    processing.value = false;
  }
};

const editStore = (store: Store) => {
  editingStore.value = store;
  storeForm.value = {
    name: store.name,
    address: store.address || '',
    phone: store.phone || '',
    isActive: store.isActive,
  };
  showCreateModal.value = true;
};

const deleteStore = async (store: Store) => {
  const confirmed = await showConfirm(
    `Hapus store "${store.name}"?`,
    'Tindakan ini tidak dapat dibatalkan. Store akan dinonaktifkan jika memiliki pesanan.'
  );
  
  if (!confirmed) return;

  try {
    await api.delete(`/outlets/${store.id}`);
    await showSuccess('Store berhasil dihapus');
    await loadStores();
  } catch (error: any) {
    await showError(error.response?.data?.message || 'Gagal menghapus store');
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  editingStore.value = null;
  storeForm.value = {
    name: '',
    address: '',
    phone: '',
    isActive: true,
  };
};

const canAddStore = computed(() => {
  if (!storeLimit.value) return true;
  if (storeLimit.value.isUnlimited) return true;
  return storeLimit.value.remaining > 0;
});

const getProgressPercentage = () => {
  if (!storeLimit.value || storeLimit.value.isUnlimited) return 0;
  if (storeLimit.value.max === 0) return 0;
  return Math.min(100, (storeLimit.value.current / storeLimit.value.max) * 100);
};

const getProgressBarColorClass = () => {
  if (!storeLimit.value) return 'bg-gray-400';
  const percentage = getProgressPercentage();
  if (percentage >= 100) return 'bg-red-500';
  if (percentage >= 80) return 'bg-yellow-500';
  return 'bg-green-500';
};

const getLimitColorClass = () => {
  if (!storeLimit.value || storeLimit.value.isUnlimited) return 'text-green-600';
  if (storeLimit.value.remaining === 0) return 'text-red-600';
  if (storeLimit.value.remaining <= 2) return 'text-yellow-600';
  return 'text-green-600';
};

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  loadStores();
});
</script>

