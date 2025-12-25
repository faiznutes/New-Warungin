<template>
  <div class="min-h-screen bg-[#f6f7f8] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <!-- Logo Section -->
      <div class="text-center mb-8">
        <router-link to="/" class="inline-flex flex-col items-center hover:opacity-90 transition-opacity">
          <div class="w-16 h-16 bg-gradient-to-br from-[#3f68e4] to-[#5b7fe8] rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-primary/30">
            <span class="material-symbols-outlined text-white text-[32px]">store</span>
          </div>
          <h1 class="text-3xl font-bold text-[#3f68e4]">Warungin</h1>
          <p class="text-slate-500 mt-1">Modern System for SMEs</p>
        </router-link>
      </div>

      <!-- Register Card -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-8 border border-slate-100 dark:border-slate-700/50">
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center">Register Tenant</h2>
        <p class="text-slate-500 text-center mb-6 text-sm">Create your business account</p>

        <form @submit.prevent="handleRegister" class="space-y-5">
          <!-- Tenant Name -->
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tenant Name</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="material-symbols-outlined text-slate-400 text-[20px]">storefront</span>
              </div>
              <input
                v-model="form.tenantName"
                type="text"
                required
                class="block w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-slate-900 dark:text-white placeholder-slate-400"
                placeholder="Your business name"
              />
            </div>
          </div>

          <!-- Tenant Email -->
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tenant Email</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="material-symbols-outlined text-slate-400 text-[20px]">mail</span>
              </div>
              <input
                v-model="form.tenantEmail"
                type="email"
                required
                class="block w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-slate-900 dark:text-white placeholder-slate-400"
                placeholder="business@email.com"
              />
            </div>
          </div>

          <!-- Admin Name -->
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Admin Name</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="material-symbols-outlined text-slate-400 text-[20px]">person</span>
              </div>
              <input
                v-model="form.userName"
                type="text"
                required
                class="block w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-slate-900 dark:text-white placeholder-slate-400"
                placeholder="Your full name"
              />
            </div>
          </div>

          <!-- Admin Email -->
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Admin Email</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="material-symbols-outlined text-slate-400 text-[20px]">alternate_email</span>
              </div>
              <input
                v-model="form.userEmail"
                type="email"
                required
                class="block w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-slate-900 dark:text-white placeholder-slate-400"
                placeholder="admin@email.com"
              />
            </div>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="material-symbols-outlined text-slate-400 text-[20px]">lock</span>
              </div>
              <input
                v-model="form.userPassword"
                type="password"
                required
                class="block w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-slate-900 dark:text-white placeholder-slate-400"
                placeholder="Create a secure password"
              />
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 px-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
          >
            <span v-if="!loading">Register</span>
            <span v-else class="flex items-center gap-2">
              <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Registering...
            </span>
          </button>
        </form>

        <!-- Footer Link -->
        <div class="mt-6 text-center">
          <p class="text-sm text-slate-600 dark:text-slate-400">
            Already have an account?
            <router-link to="/login" class="text-primary hover:text-primary-hover font-medium">
              Sign In
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useNotification } from '../../composables/useNotification';

const router = useRouter();
const authStore = useAuthStore();
const { error: showError } = useNotification();

const form = ref({
  tenantName: '',
  tenantEmail: '',
  userName: '',
  userEmail: '',
  userPassword: '',
});

const loading = ref(false);

const handleRegister = async () => {
  loading.value = true;
  try {
    await authStore.register(form.value);
    router.push('/app');
  } catch (error: any) {
    await showError(error.response?.data?.error || 'Registration failed');
  } finally {
    loading.value = false;
  }
};
</script>
