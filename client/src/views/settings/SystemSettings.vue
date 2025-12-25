<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-[#0d141b] dark:text-white text-2xl sm:text-3xl font-bold leading-tight tracking-tight">System Settings</h1>
        <p class="text-[#4c739a] dark:text-slate-400">Configure global system and security preferences.</p>
      </div>
      <button
        @click="saveSettings"
        class="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all font-medium text-sm"
      >
        <span class="material-symbols-outlined text-[20px]">save</span>
        <span>Save Changes</span>
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Forms -->
      <div class="lg:col-span-2 space-y-6">
        <!-- General Settings -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
          <div class="flex items-center gap-3 mb-6">
             <div class="p-2 bg-blue-50 dark:bg-blue-900/20 text-primary rounded-xl">
                <span class="material-symbols-outlined">tune</span>
             </div>
             <div>
                <h3 class="text-lg font-bold text-[#0d141b] dark:text-white">General Settings</h3>
                <p class="text-xs text-[#4c739a]">Basic system application information</p>
             </div>
          </div>
          
          <div class="space-y-5">
            <div>
              <label class="block text-xs font-bold text-[#0d141b] uppercase tracking-wider mb-2">System Name</label>
              <input
                v-model="settings.systemName"
                type="text"
                class="w-full px-4 py-3 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-[#0d141b] dark:text-white"
                placeholder="Enter system name"
              />
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
               <div>
                 <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Email Support</label>
                 <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#94a3b8] text-[20px]">mail</span>
                    <input
                      v-model="settings.supportEmail"
                      type="email"
                      class="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/50 text-[#0d141b] dark:text-white placeholder:text-[#94a3b8] transition-all"
                      placeholder="support@example.com"
                    />
                 </div>
               </div>
               <div>
                 <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Timezone</label>
                 <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#94a3b8] text-[20px]">schedule</span>
                    <select
                      v-model="settings.timezone"
                      class="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/50 text-[#0d141b] dark:text-white appearance-none cursor-pointer"
                    >
                      <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                      <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                      <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                    </select>
                    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#94a3b8]">
                       <span class="material-symbols-outlined">expand_more</span>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>

        <!-- Security Settings -->
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-6">
          <div class="flex items-center gap-3 mb-6">
             <div class="p-2 bg-green-50 text-green-600 rounded-xl">
                <span class="material-symbols-outlined">security</span>
             </div>
             <div>
                <h3 class="text-lg font-bold text-[#0d141b] dark:text-white">Security</h3>
                <p class="text-xs text-[#4c739a]">Password and authentication policies</p>
             </div>
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-[#f8fafc] dark:bg-slate-900 rounded-xl">
              <div class="flex items-center gap-3">
                 <span class="material-symbols-outlined text-[#4c739a]">lock_clock</span>
                 <div>
                    <label class="block text-sm font-medium text-[#0d141b] dark:text-white">Require Strong Password</label>
                    <p class="text-xs text-[#4c739a]">Require combination of letters, numbers, and symbols</p>
                 </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="settings.requireStrongPassword" class="sr-only peer">
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div class="flex items-center justify-between p-4 bg-[#f8fafc] dark:bg-slate-900 rounded-xl">
              <div class="flex items-center gap-3">
                 <span class="material-symbols-outlined text-[#4c739a]">phonelink_lock</span>
                 <div>
                    <label class="block text-sm font-medium text-[#0d141b] dark:text-white">Two-Factor Authentication (2FA)</label>
                    <p class="text-xs text-[#4c739a]">Enable global 2FA for Super Admin</p>
                 </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="settings.enable2FA" class="sr-only peer">
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        <!-- Subscription Receipt Template -->
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-6">
           <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                 <div class="p-2 bg-purple-50 text-purple-600 rounded-xl">
                    <span class="material-symbols-outlined">receipt_long</span>
                 </div>
                 <div>
                    <h3 class="text-lg font-bold text-[#0d141b] dark:text-white">Subscription Receipt Template</h3>
                    <p class="text-sm text-[#4c739a]">Manage tenant payment receipt design and layout.</p>
                 </div>
              </div>
              <button
                @click="showTemplateManager = true"
                class="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl shadow-lg shadow-primary/30 transition-all font-medium text-sm"
              >
                <span class="material-symbols-outlined text-[20px]">settings</span>
                <span>Manage Template</span>
              </button>
           </div>
           <div class="mt-4 text-sm text-[#4c739a] space-y-1 pl-11">
              <p class="flex items-center gap-2"><span class="material-symbols-outlined text-[16px]">check_circle</span> Supports A4 & Thermal (58mm/80mm) formats</p>
              <p class="flex items-center gap-2"><span class="material-symbols-outlined text-[16px]">check_circle</span> Customize header & footer</p>
           </div>
        </div>
      </div>

      <!-- Right Column: Quick Links -->
      <div class="space-y-6">
         <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 class="font-bold text-[#0d141b] dark:text-white mb-4 flex items-center gap-2">
               <span class="material-symbols-outlined text-[#4c739a]">link</span>
               Quick Actions
            </h3>
            
            <div class="space-y-3">
               <router-link
                 to="/app/settings/2fa"
                 class="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group"
               >
                 <div class="bg-violet-50 dark:bg-violet-900/30 text-violet-600 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined">verified_user</span>
                 </div>
                 <div>
                    <h4 class="text-sm font-bold text-[#0d141b] dark:text-white group-hover:text-[#137fec] transition-colors">My 2FA</h4>
                    <p class="text-xs text-[#4c739a]">Kelola otentikasi 2 faktor Anda</p>
                 </div>
               </router-link>

               <router-link
                 to="/app/settings/webhooks"
                 class="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group"
               >
                 <div class="bg-amber-50 dark:bg-amber-900/30 text-amber-600 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined">webhook</span>
                 </div>
                 <div>
                    <h4 class="text-sm font-bold text-[#0d141b] dark:text-white group-hover:text-[#137fec] transition-colors">Webhooks</h4>
                    <p class="text-xs text-[#4c739a]">Integrasi pihak ketiga</p>
                 </div>
               </router-link>

               <router-link
                 to="/app/settings/sessions"
                 class="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group"
               >
                 <div class="bg-pink-50 dark:bg-pink-900/30 text-pink-600 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined">devices</span>
                 </div>
                 <div>
                    <h4 class="text-sm font-bold text-[#0d141b] dark:text-white group-hover:text-[#137fec] transition-colors">Active Sessions</h4>
                    <p class="text-xs text-[#4c739a]">Monitor login aktif</p>
                 </div>
               </router-link>

               <router-link
                 to="/app/settings/password"
                 class="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group"
               >
                 <div class="bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined">password</span>
                 </div>
                 <div>
                    <h4 class="text-sm font-bold text-[#0d141b] dark:text-white group-hover:text-[#137fec] transition-colors">Change Password</h4>
                    <p class="text-xs text-[#4c739a]">Update kata sandi akun</p>
                 </div>
               </router-link>
               
               <router-link
                 to="/app/settings/gdpr"
                 class="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group"
               >
                 <div class="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined">policy</span>
                 </div>
                 <div>
                    <h4 class="text-sm font-bold text-[#0d141b] dark:text-white group-hover:text-[#137fec] transition-colors">GDPR / Data</h4>
                    <p class="text-xs text-[#4c739a]">Ekspor dan privasi data</p>
                 </div>
               </router-link>
            </div>
         </div>
      </div>
    </div>

    <!-- Subscription Receipt Template Manager -->
    <SubscriptionReceiptTemplateManager
      :show="showTemplateManager"
      @close="showTemplateManager = false"
      @updated="() => {}"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';
import SubscriptionReceiptTemplateManager from '../../components/SubscriptionReceiptTemplateManager.vue';

const { success: showSuccess, error: showError } = useNotification();

const settings = ref({
  systemName: 'Warungin',
  supportEmail: 'support@warungin.com',
  timezone: 'Asia/Jakarta',
  requireStrongPassword: true,
  enable2FA: false,
});

const showTemplateManager = ref(false);

const loadSettings = async () => {
  try {
    const response = await api.get('/settings/system');
    settings.value = { ...settings.value, ...response.data };
  } catch (error: any) {
    console.error('Error loading settings:', error);
  }
};

const saveSettings = async () => {
  try {
    await api.put('/settings/system', settings.value);
    await showSuccess('Pengaturan berhasil disimpan');
  } catch (error: any) {
    await showError('Gagal menyimpan pengaturan');
  }
};

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  loadSettings();
});
</script>
