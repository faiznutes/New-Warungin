<template>
  <div class="flex flex-col gap-6">
    <!-- Tenant Selector for Super Admin -->
    <TenantSelector @tenant-changed="handleTenantChange" />

    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-[#0d141b] dark:text-white text-2xl sm:text-3xl font-bold leading-tight tracking-tight">Users</h1>
        <p class="text-[#4c739a] dark:text-slate-400">Manage users and access permissions.</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg shadow-lg shadow-blue-500/30 transition-all font-medium text-sm"
      >
        <span class="material-symbols-outlined text-[20px]">person_add</span>
        <span>Add User</span>
      </button>
    </div>

    <!-- User Limit Info with Progress Bar -->
    <div v-if="userLimit && userLimit.limit !== undefined && userLimit.limit !== -1" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
      <div class="flex items-center justify-between mb-3">
        <div>
          <p class="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
            <span class="material-symbols-outlined text-[20px]">group</span>
            User Limit
          </p>
          <p class="text-sm text-blue-700 dark:text-blue-300">
            {{ userLimit.currentUsage || 0 }} / {{ userLimit.limit }} active users
            <span class="font-bold" :class="(userLimit.currentUsage || 0) >= userLimit.limit ? 'text-red-600' : 'text-green-600'">
              ({{ userLimit.limit - (userLimit.currentUsage || 0) }} available)
            </span>
          </p>
        </div>
      </div>
      <div class="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
        <div
          class="h-2 rounded-full transition-all"
          :class="(userLimit.currentUsage || 0) >= userLimit.limit ? 'bg-red-500' : (userLimit.currentUsage || 0) >= (userLimit.limit * 0.8) ? 'bg-yellow-500' : 'bg-blue-600'"
          :style="{ width: `${Math.min(100, ((userLimit.currentUsage || 0) / userLimit.limit) * 100)}%` }"
        ></div>
      </div>
    </div>

    <!-- Tenant Selection Message -->
    <div v-if="needsTenantSelection" class="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
      <span class="material-symbols-outlined text-[64px] text-slate-300 mb-4">apartment</span>
      <h3 class="text-lg font-bold text-[#0d141b] dark:text-white mb-2">Select a Tenant First</h3>
      <p class="text-[#4c739a] text-center max-w-md">{{ tenantMessage }}</p>
    </div>

    <!-- Loading -->
    <div v-else-if="loading" class="flex items-center justify-center py-16">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p class="text-slate-500 font-medium">Loading users...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="users.length === 0" class="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
      <span class="material-symbols-outlined text-[64px] text-slate-300 mb-4">group</span>
      <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">No Users Yet</h3>
      <p class="text-slate-500 text-center max-w-md mb-4">Add your first user to get started.</p>
      <button
        @click="showCreateModal = true"
        class="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg shadow-lg shadow-primary/30 transition-all font-medium text-sm"
      >
        <span class="material-symbols-outlined text-[20px]">person_add</span>
        Add First User
      </button>
    </div>

    <!-- Users Table -->
    <div v-else class="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-900/50">
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Last Login</th>
              <th class="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
            <tr v-for="user in users" :key="user.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span class="material-symbols-outlined text-primary text-[20px]">person</span>
                  </div>
                  <span class="text-sm font-medium text-slate-900 dark:text-white">{{ user.name }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-slate-500">{{ user.email }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full"
                  :class="getRoleClass(user.role)"
                >
                  {{ getRoleLabel(user.role) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full"
                  :class="user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                >
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-slate-500">
                  {{ user.lastLogin ? formatDateTime(user.lastLogin) : 'Never' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="editUser(user)"
                    class="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition flex items-center gap-1"
                  >
                    <span class="material-symbols-outlined text-[16px]">edit</span>
                    Edit
                  </button>
                  <button
                    v-if="user.role !== 'ADMIN_TENANT'"
                    @click="deleteUser(user.id)"
                    class="px-3 py-1.5 text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition flex items-center gap-1"
                  >
                    <span class="material-symbols-outlined text-[16px]">delete</span>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <span class="text-sm text-slate-500">
          Page {{ pagination.page }} of {{ pagination.totalPages }}
        </span>
        <div class="flex gap-2">
          <button
            @click="loadUsers(pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-600 transition font-medium text-sm"
          >
            Previous
          </button>
          <button
            @click="loadUsers(pagination.page + 1)"
            :disabled="pagination.page === pagination.totalPages"
            class="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-600 transition font-medium text-sm"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- User Edit/Create Modal -->
  <UserEditModal
    :show="showEditModal || showCreateModal"
    :user="editingUser"
    @close="showEditModal = false; showCreateModal = false; editingUser = null"
    @save="handleSaveUser"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
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
const { error: showError, success: showSuccess, confirm: showConfirm } = useNotification();

const users = ref<any[]>([]);
const loading = ref(false);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const editingUser = ref<any>(null);
const userLimit = ref<any>(null);
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
});

const loadUsers = async (page = 1) => {
  if (needsTenantSelection.value) {
    return;
  }
  
  if (!authStore.isSuperAdmin && !authStore.user?.tenantId) {
    console.error('Tenant ID not available for non-super-admin user');
    await showError('Tenant ID not available. Please login again.');
    return;
  }
  
  loading.value = true;
  try {
    const params: any = { page, limit: pagination.value.limit };
    
    if (authStore.isSuperAdmin && authStore.selectedTenantId) {
      params.tenantId = authStore.selectedTenantId;
    }
    
    const response = await api.get('/users', { params });
    users.value = response.data.data;
    pagination.value = response.data.pagination;

    try {
      const limitRes = await api.get('/addons/check-limit/ADD_USERS');
      userLimit.value = limitRes.data;
    } catch (e) {
      // Ignore if no addon
    }
  } catch (error: any) {
    console.error('Error loading users:', error);
    await showError(error.response?.data?.message || 'Failed to load users');
  } finally {
    loading.value = false;
  }
};

const getRoleClass = (role: string) => {
  const classes: Record<string, string> = {
    ADMIN_TENANT: 'bg-purple-100 text-purple-700',
    SUPERVISOR: 'bg-blue-100 text-blue-700',
    CASHIER: 'bg-green-100 text-green-700',
    KITCHEN: 'bg-orange-100 text-orange-700',
  };
  return classes[role] || 'bg-slate-100 text-slate-600';
};

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    ADMIN_TENANT: 'Admin',
    SUPERVISOR: 'Supervisor',
    CASHIER: 'Cashier',
    KITCHEN: 'Kitchen',
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
      await api.put(`/users/${editingUser.value.id}`, userData);
      await showSuccess('User updated successfully');
    } else {
      await api.post('/users', userData);
      await showSuccess('User added successfully');
    }
    showEditModal.value = false;
    showCreateModal.value = false;
    editingUser.value = null;
    await new Promise(resolve => setTimeout(resolve, 100));
    await loadUsers(pagination.value.page);
  } catch (error: any) {
    console.error('Error saving user:', error);
    showEditModal.value = false;
    showCreateModal.value = false;
    editingUser.value = null;
    await new Promise(resolve => setTimeout(resolve, 100));
    await showError(error.response?.data?.message || 'Failed to save user');
  }
};

const deleteUser = async (id: string) => {
  const confirmed = await showConfirm('Are you sure you want to delete this user?');
  if (!confirmed) return;
  try {
    await api.delete(`/users/${id}`);
    await loadUsers(pagination.value.page);
  } catch (error: any) {
    await showError(error.response?.data?.message || 'Failed to delete user');
  }
};

const handleTenantChange = (tenantId: string | null) => {
  if (tenantId && !needsTenantSelection.value) {
    if (userRole === 'ADMIN_TENANT' || userRole === 'SUPER_ADMIN') {
      loadUsers();
    }
  }
};

watch(() => authStore.currentTenantId, (newTenantId, oldTenantId) => {
  if (newTenantId && newTenantId !== oldTenantId && !needsTenantSelection.value) {
    if (userRole === 'ADMIN_TENANT' || userRole === 'SUPER_ADMIN') {
      loadUsers();
    }
  }
});

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  if (authStore.isSuperAdmin) {
    const storedTenantId = localStorage.getItem('selectedTenantId');
    if (storedTenantId && storedTenantId !== authStore.selectedTenantId) {
      authStore.setSelectedTenant(storedTenantId);
    }
  }
  
  if (userRole === 'ADMIN_TENANT' || userRole === 'SUPER_ADMIN') {
    if (!needsTenantSelection.value) {
      loadUsers();
    }
  }
});
</script>
