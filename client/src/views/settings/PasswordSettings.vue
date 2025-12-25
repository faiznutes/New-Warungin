<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col gap-1">
      <h1 class="text-[#0d141b] dark:text-white text-2xl sm:text-3xl font-bold leading-tight tracking-tight">Password Settings</h1>
      <p class="text-[#4c739a] dark:text-slate-400">Change your password and manage password policies.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Change Password Card -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 bg-blue-50 dark:bg-blue-900/20 text-primary rounded-xl">
            <span class="material-symbols-outlined">lock</span>
          </div>
          <h3 class="text-lg font-bold text-[#0d141b] dark:text-white">Change Password</h3>
        </div>

        <form @submit.prevent="updatePassword" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-[#0d141b] uppercase tracking-wider mb-2">Current Password *</label>
            <input
              v-model="passwordForm.currentPassword"
              type="password"
              required
              placeholder="Enter current password"
              class="w-full px-4 py-3 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-[#0d141b] dark:text-white"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-[#0d141b] uppercase tracking-wider mb-2">New Password *</label>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              required
              placeholder="Enter new password"
              class="w-full px-4 py-3 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-[#0d141b] dark:text-white"
            />
            <p class="text-xs text-[#4c739a] mt-1.5">
              Min 8 characters with uppercase, lowercase, number, and symbol
            </p>
          </div>

          <div>
            <label class="block text-xs font-bold text-[#0d141b] uppercase tracking-wider mb-2">Confirm New Password *</label>
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              required
              placeholder="Confirm new password"
              class="w-full px-4 py-3 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-[#0d141b] dark:text-white"
            />
            <p v-if="passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword" class="text-xs text-red-600 mt-1">
              Passwords do not match
            </p>
          </div>

          <div v-if="passwordError" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-red-600 text-[20px]">error</span>
            <p class="text-sm text-red-800 dark:text-red-200">{{ passwordError }}</p>
          </div>

          <div v-if="passwordSuccess" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
            <p class="text-sm text-green-800 dark:text-green-200">{{ passwordSuccess }}</p>
          </div>

          <button
            type="submit"
            :disabled="updating || passwordForm.newPassword !== passwordForm.confirmPassword"
            class="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-95 font-medium disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <span class="material-symbols-outlined text-[20px]">lock_reset</span>
            {{ updating ? 'Updating...' : 'Update Password' }}
          </button>
        </form>
      </div>

      <!-- Password Policy Info Card -->
      <div class="bg-[#eef2ff] dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
            <span class="material-symbols-outlined">policy</span>
          </div>
          <h3 class="text-lg font-bold text-indigo-900 dark:text-indigo-100">Password Policy</h3>
        </div>
        <ul class="space-y-3 text-sm text-indigo-800 dark:text-indigo-200">
          <li class="flex items-center gap-2">
            <span class="material-symbols-outlined text-indigo-600 text-[18px]">check_circle</span>
            <span>Minimum 8 characters</span>
          </li>
          <li class="flex items-center gap-2">
            <span class="material-symbols-outlined text-indigo-600 text-[18px]">check_circle</span>
            <span>Must contain uppercase letter (A-Z)</span>
          </li>
          <li class="flex items-center gap-2">
            <span class="material-symbols-outlined text-indigo-600 text-[18px]">check_circle</span>
            <span>Must contain lowercase letter (a-z)</span>
          </li>
          <li class="flex items-center gap-2">
            <span class="material-symbols-outlined text-indigo-600 text-[18px]">check_circle</span>
            <span>Must contain number (0-9)</span>
          </li>
          <li class="flex items-center gap-2">
            <span class="material-symbols-outlined text-indigo-600 text-[18px]">check_circle</span>
            <span>Must contain symbol (!@#$%^&*)</span>
          </li>
          <li class="flex items-center gap-2">
            <span class="material-symbols-outlined text-indigo-600 text-[18px]">check_circle</span>
            <span>Cannot reuse previously used passwords</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import api from '../../api';

const updating = ref(false);
const passwordError = ref('');
const passwordSuccess = ref('');

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const updatePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = 'Passwords do not match';
    return;
  }

  updating.value = true;
  passwordError.value = '';
  passwordSuccess.value = '';

  try {
    await api.post('/password/update', {
      oldPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
      confirmPassword: passwordForm.value.confirmPassword,
    });

    passwordSuccess.value = 'Password updated successfully';
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
  } catch (error: any) {
    console.error('Error updating password:', error);
    passwordError.value = error.response?.data?.message || 'Failed to update password';
  } finally {
    updating.value = false;
  }
};
</script>
