<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex flex-col">
      <h2 class="text-3xl font-bold text-[#0d141b] dark:text-white tracking-tight">GDPR Compliance</h2>
      <p class="text-[#4c739a] dark:text-slate-400 mt-1">Manage your personal data in accordance with GDPR</p>
    </div>

    <div class="space-y-6">
      <!-- Data Export -->
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2 bg-primary/10 text-primary rounded-xl">
            <span class="material-symbols-outlined">download</span>
          </div>
          <div>
            <h3 class="text-lg font-bold text-[#0d141b] dark:text-white">Export Data (Right to Data Portability)</h3>
            <p class="text-sm text-[#4c739a]">Download all your personal data in JSON format.</p>
          </div>
        </div>
        <p class="text-[#4c739a] dark:text-slate-300 mb-4 text-sm">
          This data includes all information associated with your account. You have the right to obtain a copy of your personal data in a structured, machine-readable format.
        </p>
        <button
          @click="exportData"
          :disabled="exporting"
          class="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/30 transition-all active:scale-95 font-medium disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <span class="material-symbols-outlined text-[20px]">download</span>
          {{ exporting ? 'Exporting...' : 'Export My Data' }}
        </button>
      </div>

      <!-- Data Deletion -->
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border-l-4 border-l-red-500 border border-slate-100 dark:border-slate-700/50 p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2 bg-red-50 text-red-600 rounded-xl">
            <span class="material-symbols-outlined">delete_forever</span>
          </div>
          <div>
            <h3 class="text-lg font-bold text-[#0d141b] dark:text-white">Delete Data (Right to be Forgotten)</h3>
            <p class="text-sm text-[#4c739a]">Permanently delete all your personal data.</p>
          </div>
        </div>
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
          <p class="text-sm text-red-800 dark:text-red-200">
            <strong class="text-red-600">Warning:</strong> This action will delete all your personal data and deactivate your account. This action cannot be undone.
          </p>
        </div>
        
        <div v-if="!showDeleteConfirm" class="space-y-4">
          <button
            @click="showDeleteConfirm = true"
            class="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl transition-all font-medium"
          >
            <span class="material-symbols-outlined text-[20px]">delete_forever</span>
            Delete My Data
          </button>
        </div>

        <div v-else class="space-y-4">
          <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p class="text-sm text-red-800 dark:text-red-200 mb-2">
              <strong>Confirm Deletion:</strong>
            </p>
            <p class="text-sm text-red-700 dark:text-red-300 mb-4">
              Type <strong>"DELETE_MY_DATA"</strong> below to confirm deletion of your data.
            </p>
            <input
              v-model="deleteConfirmText"
              type="text"
              placeholder="Type DELETE_MY_DATA"
              class="w-full px-4 py-3 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-[#0d141b] dark:text-white"
            />
          </div>
          <div class="flex gap-3">
            <button
              @click="deleteData"
              :disabled="deleteConfirmText !== 'DELETE_MY_DATA' || deleting"
              class="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl transition-all font-medium disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              <span class="material-symbols-outlined text-[20px]">delete_forever</span>
              {{ deleting ? 'Deleting...' : 'Confirm Delete Data' }}
            </button>
            <button
              @click="showDeleteConfirm = false; deleteConfirmText = ''"
              class="px-5 py-2.5 bg-slate-100 dark:bg-slate-700 text-[#0d141b] dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- Tenant Data Export (Admin Only) -->
      <div v-if="authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'" class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2 bg-purple-50 text-purple-600 rounded-xl">
            <span class="material-symbols-outlined">folder_zip</span>
          </div>
          <div>
            <h3 class="text-lg font-bold text-[#0d141b] dark:text-white">Export Tenant Data</h3>
            <p class="text-sm text-[#4c739a]">Export all tenant data including products, orders, transactions, and customers.</p>
          </div>
        </div>
        <button
          @click="exportTenantData"
          :disabled="exportingTenant"
          class="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-purple-500/30 transition-all active:scale-95 font-medium disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <span class="material-symbols-outlined text-[20px]">folder_zip</span>
          {{ exportingTenant ? 'Exporting...' : 'Export Tenant Data' }}
        </button>
      </div>

      <!-- Info -->
      <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2 bg-blue-100 text-blue-600 rounded-xl">
            <span class="material-symbols-outlined">info</span>
          </div>
          <h3 class="text-lg font-bold text-blue-900 dark:text-blue-100">About GDPR</h3>
        </div>
        <ul class="space-y-3 text-sm text-blue-800 dark:text-blue-200">
          <li class="flex items-start gap-3">
            <span class="material-symbols-outlined text-blue-600 text-[20px] shrink-0 mt-0.5">check_circle</span>
            <span><strong>Right to Data Portability:</strong> You have the right to obtain a copy of your personal data in a structured, machine-readable format.</span>
          </li>
          <li class="flex items-start gap-3">
            <span class="material-symbols-outlined text-blue-600 text-[20px] shrink-0 mt-0.5">check_circle</span>
            <span><strong>Right to be Forgotten:</strong> You have the right to request deletion of your personal data, with some exceptions for legitimate legal or business purposes.</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import api from '../../api';
import { useAuthStore } from '../../stores/auth';
import { useNotification } from '../../composables/useNotification';

const { confirm, success, error } = useNotification();

const authStore = useAuthStore();

const exporting = ref(false);
const exportingTenant = ref(false);
const deleting = ref(false);
const showDeleteConfirm = ref(false);
const deleteConfirmText = ref('');

const exportData = async () => {
  exporting.value = true;
  try {
    const response = await api.get('/gdpr/export', {
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `warungin-data-export-${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    await success('Data exported successfully', 'Success');
  } catch (err: any) {
    console.error('Error exporting data:', err);
    await error(err.response?.data?.message || 'Failed to export data', 'Error');
  } finally {
    exporting.value = false;
  }
};

const exportTenantData = async () => {
  exportingTenant.value = true;
  try {
    const response = await api.get('/gdpr/export-tenant', {
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `warungin-tenant-export-${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    await success('Tenant data exported successfully', 'Success');
  } catch (err: any) {
    console.error('Error exporting tenant data:', err);
    await error(err.response?.data?.message || 'Failed to export tenant data', 'Error');
  } finally {
    exportingTenant.value = false;
  }
};

const deleteData = async () => {
  if (deleteConfirmText.value !== 'DELETE_MY_DATA') {
    return;
  }

  const confirmed = await confirm(
    'Are you sure you want to delete all your personal data? This action cannot be undone and your account will be deactivated.',
    'Confirm Data Deletion',
    'Yes, Delete',
    'Cancel'
  );
  
  if (!confirmed) return;

  deleting.value = true;
  try {
    await api.post('/gdpr/delete', {
      confirm: 'DELETE_MY_DATA',
    });

    await success('Your data has been deleted. You will be redirected to the login page.', 'Data Deleted');
    
    // Clear auth and redirect to login
    authStore.clearAuth();
    window.location.href = '/login';
  } catch (err: any) {
    console.error('Error deleting data:', err);
    await error(err.response?.data?.message || 'Failed to delete data', 'Error');
  } finally {
    deleting.value = false;
  }
};
</script>

