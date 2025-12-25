<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex flex-col">
      <h2 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Store Settings</h2>
      <p class="text-slate-500 dark:text-slate-400 mt-1">Manage your store information and settings.</p>
    </div>

    <!-- Store Information Card -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 p-6">
      <div class="flex items-center gap-3 mb-6">
        <div class="p-2 bg-primary/10 text-primary rounded-lg">
          <span class="material-symbols-outlined">store</span>
        </div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">Store Information</h3>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Store Name</label>
          <input
            v-model="storeInfo.name"
            type="text"
            class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone</label>
          <input
            v-model="storeInfo.phone"
            type="tel"
            class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
          <input
            v-model="storeInfo.email"
            type="email"
            class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div class="md:col-span-2">
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Address</label>
          <textarea
            v-model="storeInfo.address"
            rows="3"
            class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Feature Toggles Card -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 p-6">
      <div class="flex items-center gap-3 mb-6">
        <div class="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <span class="material-symbols-outlined">toggle_on</span>
        </div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">Additional Features</h3>
      </div>
      <div class="space-y-4">
        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-slate-400">touch_app</span>
            <div>
              <label class="text-sm font-medium text-slate-900 dark:text-white">Simple POS Mode</label>
              <p class="text-xs text-slate-500">Enable simplified cashier mode with large buttons</p>
            </div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              v-model="features.simplePosMode"
              type="checkbox"
              class="sr-only peer"
              @change="updateFeatures"
            />
            <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-slate-400">mail</span>
            <div>
              <label class="text-sm font-medium text-slate-900 dark:text-white">Daily Email Backup</label>
              <p class="text-xs text-slate-500">Send daily reports automatically via email</p>
            </div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              v-model="features.email_backup_enabled"
              type="checkbox"
              class="sr-only peer"
              @change="updateFeatures"
            />
            <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>
    </div>

    <!-- Receipt Template Management Card -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 p-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-green-50 text-green-600 rounded-lg">
            <span class="material-symbols-outlined">receipt_long</span>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Receipt Templates</h3>
            <p class="text-sm text-slate-500">Manage receipt templates for different paper sizes</p>
          </div>
        </div>
        <button
          @click="showTemplateManager = true"
          class="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg shadow-lg shadow-primary/30 transition-all font-medium text-sm"
        >
          <span class="material-symbols-outlined text-[20px]">settings</span>
          <span>Manage Templates</span>
        </button>
      </div>
      <div class="text-sm text-slate-500 space-y-1 pl-11">
        <p class="flex items-center gap-2"><span class="material-symbols-outlined text-[16px]">check_circle</span> Templates for A4, Thermal 58mm, or Thermal 80mm</p>
        <p class="flex items-center gap-2"><span class="material-symbols-outlined text-[16px]">check_circle</span> Customize header, footer, and displayed fields</p>
        <p class="flex items-center gap-2"><span class="material-symbols-outlined text-[16px]">check_circle</span> Support for Browser, Thermal, and Bluetooth printing</p>
      </div>
    </div>

    <!-- Save Button -->
    <div class="flex justify-end">
      <button
        @click="saveSettings"
        class="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg shadow-lg shadow-primary/30 transition-all active:scale-95 font-medium"
      >
        <span class="material-symbols-outlined text-[20px]">save</span>
        Save Settings
      </button>
    </div>

    <!-- Receipt Template Manager -->
    <ReceiptTemplateManager
      :show="showTemplateManager"
      @close="showTemplateManager = false"
      @updated="loadSettings"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';
import { useAuthStore } from '../../stores/auth';
import ReceiptTemplateManager from '../../components/ReceiptTemplateManager.vue';
import { useNotification } from '../../composables/useNotification';

const authStore = useAuthStore();
const { success: showSuccess, error: showError } = useNotification();

const storeInfo = ref({
  name: '',
  address: '',
  phone: '',
  email: '',
});

const receiptSettings = ref({
  header: '',
  footer: '',
});
const showTemplateManager = ref(false);
const features = ref({
  simplePosMode: false,
  email_backup_enabled: true,
});

const loadSettings = async () => {
  if (!authStore.isAuthenticated) return;
  
  try {
    const response = await api.get('/tenant/profile');
    storeInfo.value = {
      name: response.data.name || '',
      address: response.data.address || '',
      phone: response.data.phone || '',
      email: response.data.email || '',
    };
    receiptSettings.value = {
      header: response.data.receiptHeader || '',
      footer: response.data.receiptFooter || '',
    };
    
    // Load features
    const tenantFeatures = response.data.features || {};
    features.value = {
      simplePosMode: tenantFeatures.simplePosMode === true,
      email_backup_enabled: tenantFeatures.email_backup_enabled !== false, // Default true
    };
  } catch (error: any) {
    // Suppress errors during logout (401/403)
    if (error.response?.status === 401 || error.response?.status === 403) {
      return;
    }
    console.error('Error loading settings:', error);
    if (authStore.isAuthenticated && error.response?.status !== 404) {
      await showError('Failed to load store settings');
    }
  }
};

const updateFeatures = async () => {
  if (!authStore.isAuthenticated) return;
  
  try {
    await api.put('/tenant/profile', {
      features: features.value,
    });
    await showSuccess('Features updated successfully');
  } catch (error: any) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      return;
    }
    console.error('Error updating features:', error);
    const errorMessage = error.response?.data?.message || 'Failed to update features';
    await showError(errorMessage);
    // Revert on error
    await loadSettings();
  }
};

const saveSettings = async () => {
  if (!authStore.isAuthenticated) return;
  
  try {
    await api.put('/tenant/profile', {
      ...storeInfo.value,
      receiptHeader: receiptSettings.value.header,
      receiptFooter: receiptSettings.value.footer,
      features: features.value,
    });
    await showSuccess('Settings saved successfully');
    // Reload settings to get updated data
    await loadSettings();
  } catch (error: any) {
    // Suppress errors during logout (401/403)
    if (error.response?.status === 401 || error.response?.status === 403) {
      return;
    }
    console.error('Error saving settings:', error);
    const errorMessage = error.response?.data?.message || 'Failed to save settings';
    await showError(errorMessage);
  }
};

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  loadSettings();
});
</script>
