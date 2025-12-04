<template>
  <div class="flex flex-col h-full">
    <!-- Tenant Selector for Super Admin -->
    <TenantSelector @tenant-changed="handleTenantChange" />

    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-6 px-4 sm:px-6">
      <div class="flex flex-col gap-2">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-900">
          Pengguna
        </h2>
        <p class="text-sm sm:text-base text-gray-600">
          Kelola pengguna dan akses
        </p>
      </div>
      <div class="flex gap-2">
        <button
          class="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm sm:text-base bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center justify-center gap-2"
          @click="showCreateModal = true"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Tambah Pengguna</span>
        </button>
      </div>
    </div>

    <!-- User Limit Progress Bar -->
    <div
      v-if="userLimit"
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-gray-900">
              Limit Pengguna
            </h3>
            <p class="text-xs text-gray-600">
              <span class="font-medium text-gray-900">{{ userLimit.currentUsage }}</span>
              <span v-if="!userLimit.isUnlimited"> / {{ userLimit.limit }}</span>
              <span v-else> / Unlimited</span>
              <span v-if="!userLimit.isUnlimited"> pengguna digunakan</span>
              <span v-else> pengguna aktif</span>
            </p>
          </div>
        </div>
        <div class="text-right">
          <div
            class="text-lg font-bold"
            :class="getLimitColorClass()"
          >
            <span v-if="!userLimit.isUnlimited">
              {{ userLimit.remaining }} tersisa
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
        v-if="!userLimit.isUnlimited"
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
        v-if="!userLimit.isUnlimited && userLimit.remaining === 0"
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
              Limit pengguna telah tercapai
            </p>
            <p class="text-xs text-yellow-700 mt-1">
              Beli addon "Tambah Pengguna" untuk menambah slot pengguna, atau upgrade ke plan yang lebih tinggi.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tenant Selection Message -->
    <div
      v-if="needsTenantSelection"
      class="flex flex-col items-center justify-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300"
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
        Pilih Tenant Terlebih Dahulu
      </h3>
      <p class="text-gray-600 text-center max-w-md">
        {{ tenantMessage }}
      </p>
    </div>

    <!-- Users Table -->
    <div
      v-else-if="loading"
      class="flex items-center justify-center py-12"
    >
      <div class="flex flex-col items-center">
        <div class="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div class="text-gray-600 font-medium">
          Memuat pengguna...
        </div>
      </div>
    </div>

    <div
      v-else-if="users.length === 0"
      class="flex flex-col items-center justify-center py-12 bg-white rounded-lg"
    >
      <svg
        class="w-16 h-16 text-gray-400 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      <p class="text-gray-500">
        Belum ada pengguna
      </p>
    </div>

    <div
      v-else
      class="bg-white rounded-lg shadow-sm overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="user in users"
              :key="user.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ user.name }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-600">
                  {{ user.email }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getRoleClass(user.role)"
                >
                  {{ getRoleLabel(user.role) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 py-1 text-xs font-semibold rounded-full"
                  :class="user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                >
                  {{ user.isActive ? 'Aktif' : 'Tidak Aktif' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">
                  {{ user.lastLogin ? formatDateTime(user.lastLogin) : 'Belum pernah' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button
                    class="px-3 py-1 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded"
                    @click="editUser(user)"
                  >
                    Edit
                  </button>
                  <button
                    v-if="user.role !== 'ADMIN_TENANT'"
                    class="px-3 py-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                    @click="deleteUser(user.id)"
                  >
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="pagination.totalPages > 1"
      class="flex items-center justify-center space-x-2 mt-6"
    >
      <button
        :disabled="pagination.page === 1"
        class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        @click="loadUsers(pagination.page - 1)"
      >
        Sebelumnya
      </button>
      <span class="px-4 py-2 text-gray-700">
        Halaman {{ pagination.page }} dari {{ pagination.totalPages }}
      </span>
      <button
        :disabled="pagination.page === pagination.totalPages"
        class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        @click="loadUsers(pagination.page + 1)"
      >
        Selanjutnya
      </button>
    </div>
  </div>

  <!-- User Create/Edit Modal -->
  <UserEditModal
    :show="showCreateModal || showEditModal"
    :user="editingUser"
    @close="showCreateModal = false; showEditModal = false; editingUser = null"
    @save="handleSaveUser"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import api from '../../api';
import { formatDateTime } from '../../utils/formatters';
import { useAuthStore } from '../../stores/auth';
import TenantSelector from '../../components/TenantSelector.vue';
import UserEditModal from '../../components/UserEditModal.vue';
import { useTenantCheck } from '../../composables/useTenantCheck';
import { useNotification } from '../../composables/useNotification';

const authStore = useAuthStore();
const userRole = authStore.user?.role || '';
const { needsTenantSelection, tenantMessage } = useTenantCheck();
const { error: showError, success: showSuccess, info: showInfo, confirm: showConfirm } = useNotification();

const users = ref<any[]>([]);
const loading = ref(false);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const editingUser = ref<any>(null);
const userLimit = ref<{
  limit: number;
  currentUsage: number;
  remaining: number;
  isUnlimited: boolean;
} | null>(null);
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
});

const loadUsers = async (page = 1) => {
  // Only check tenant selection for SUPER_ADMIN
  if (needsTenantSelection.value) {
    users.value = [];
    return; // Don't load if tenant not selected
  }
  
  // For ADMIN_TENANT, tenantId is already in JWT token, no need to check
  // Only SUPER_ADMIN needs tenant selection
  
  loading.value = true;
  try {
    // For SUPER_ADMIN, ensure tenantId is set in localStorage for API interceptor
    if (authStore.isSuperAdmin && authStore.selectedTenantId) {
      localStorage.setItem('selectedTenantId', authStore.selectedTenantId);
      // Wait a bit to ensure localStorage is updated
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const response = await api.get('/users', {
      params: { page, limit: pagination.value.limit },
    });
    
    const userData = response.data?.data || [];
    users.value = Array.isArray(userData) ? userData : [];
    
    const paginationData = response.data?.pagination || {};
    pagination.value = {
      page: paginationData.page || page,
      limit: paginationData.limit || pagination.value.limit,
      total: paginationData.total || 0,
      totalPages: paginationData.totalPages || 1,
    };

    // Get user limit info from response
    if (response.data?.limit) {
      userLimit.value = {
        limit: response.data.limit.max || 0,
        currentUsage: response.data.limit.current || 0,
        remaining: response.data.limit.remaining || 0,
        isUnlimited: response.data.limit.isUnlimited || false,
      };
    } else {
      userLimit.value = null;
    }
  } catch (error: any) {
    users.value = [];
    await showError(error.response?.data?.message || 'Gagal memuat pengguna');
  } finally {
    loading.value = false;
  }
};

const getRoleClass = (role: string) => {
  const classes: Record<string, string> = {
    ADMIN_TENANT: 'bg-purple-100 text-purple-800',
    SUPERVISOR: 'bg-blue-100 text-blue-800',
    CASHIER: 'bg-green-100 text-green-800',
    KITCHEN: 'bg-orange-100 text-orange-800',
  };
  return classes[role] || 'bg-gray-100 text-gray-800';
};

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    ADMIN_TENANT: 'Admin',
    SUPERVISOR: 'Supervisor',
    CASHIER: 'Kasir',
    KITCHEN: 'Dapur',
  };
  return labels[role] || role;
};

const editUser = (user: any) => {
  editingUser.value = user;
  showEditModal.value = true;
};

const handleSaveUser = async (userData: any) => {
  try {
    if (editingUser.value) {
      // Update existing user
      await api.put(`/users/${editingUser.value.id}`, userData);
      await showSuccess('Pengguna berhasil diupdate');
    } else {
      // Create new user
      await api.post('/users', userData);
      await showSuccess('Pengguna berhasil ditambahkan');
    }
    // Close modal first
    showCreateModal.value = false;
    showEditModal.value = false;
    editingUser.value = null;
    // Wait a bit for modal to close, then reload
    await new Promise(resolve => setTimeout(resolve, 100));
    await loadUsers(pagination.value.page);
  } catch (error: any) {
    // Close modal first even on error
    showCreateModal.value = false;
    showEditModal.value = false;
    editingUser.value = null;
    // Wait a bit for modal to close, then show error
    await new Promise(resolve => setTimeout(resolve, 100));
    await showError(error.response?.data?.message || 'Gagal menyimpan pengguna');
  }
};

const deleteUser = async (id: string) => {
  const confirmed = await showConfirm('Apakah Anda yakin ingin menghapus pengguna ini?');
  if (!confirmed) return;
  try {
    await api.delete(`/users/${id}`);
    await loadUsers(pagination.value.page);
  } catch (error: any) {
    await showError(error.response?.data?.message || 'Gagal menghapus pengguna');
  }
};

const handleTenantChange = (tenantId: string | null) => {
  // Auto-refetch users when tenant changes
  if (tenantId && !needsTenantSelection.value) {
    if (userRole === 'ADMIN_TENANT' || userRole === 'SUPER_ADMIN') {
      loadUsers();
    }
  }
};

const canAddUser = computed(() => {
  if (!userLimit.value) return true;
  if (userLimit.value.isUnlimited) return true;
  return userLimit.value.remaining > 0;
});

const getProgressPercentage = () => {
  if (!userLimit.value || userLimit.value.isUnlimited) return 0;
  if (userLimit.value.limit === 0) return 0;
  return Math.min(100, (userLimit.value.currentUsage / userLimit.value.limit) * 100);
};

const getProgressBarColorClass = () => {
  if (!userLimit.value) return 'bg-gray-400';
  const percentage = getProgressPercentage();
  if (percentage >= 100) return 'bg-red-500';
  if (percentage >= 80) return 'bg-yellow-500';
  return 'bg-green-500';
};

const getLimitColorClass = () => {
  if (!userLimit.value || userLimit.value.isUnlimited) return 'text-green-600';
  if (userLimit.value.remaining === 0) return 'text-red-600';
  if (userLimit.value.remaining <= 2) return 'text-yellow-600';
  return 'text-green-600';
};

// Watch for tenant changes and auto-refetch (only for SUPER_ADMIN)
watch(() => authStore.selectedTenantId, (newTenantId, oldTenantId) => {
  if (authStore.isSuperAdmin && newTenantId && newTenantId !== oldTenantId && !needsTenantSelection.value) {
    loadUsers();
  }
});

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // Load users for ADMIN_TENANT and SUPER_ADMIN (if tenant selected)
  if (userRole === 'ADMIN_TENANT' || (userRole === 'SUPER_ADMIN' && !needsTenantSelection.value)) {
    loadUsers();
  }
});
</script>

