<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark font-display flex w-full">
    <!-- Sidebar - Clean White/Slate theme matching Design Contract -->
    <aside
      class="w-72 bg-surface-light dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 flex flex-col h-full fixed z-50 shadow-sm transition-transform duration-300 ease-in-out"
      :class="{ 
        '-translate-x-full lg:translate-x-0': !sidebarOpen && windowWidth < 1024,
        'translate-x-0': sidebarOpen || windowWidth >= 1024
      }"
    >
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div class="p-6 flex items-center gap-3">
          <div class="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <span class="material-symbols-outlined text-2xl">restaurant</span>
          </div>
          <div class="flex flex-col">
            <router-link to="/app/dashboard" class="text-lg font-bold text-slate-900 dark:text-white leading-tight hover:text-emerald-600 transition-colors">Warungin</router-link>
            <p class="text-xs font-medium text-[#4c739a] dark:text-slate-400 tracking-wide uppercase">Kitchen Display</p>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-4 py-4 gap-2 flex flex-col overflow-y-auto">
          <router-link
            to="/app/dashboard"
            class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
            :class="[$route.path === '/app/dashboard' ? 'bg-emerald-50 text-emerald-600 font-bold' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200']"
            @click="closeSidebarOnMobile"
          >
            <span class="material-symbols-outlined" :class="{ 'filled': $route.path === '/app/dashboard' }">dashboard</span>
            <span>Dashboard</span>
          </router-link>

          <router-link
            to="/app/orders/kitchen"
            class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
            :class="[$route.path === '/app/orders/kitchen' ? 'bg-emerald-50 text-emerald-600 font-bold' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200']"
            @click="closeSidebarOnMobile"
          >
            <span class="material-symbols-outlined" :class="{ 'filled': $route.path === '/app/orders/kitchen' }">restaurant_menu</span>
            <span>Incoming Orders</span>
            <span v-if="pendingOrdersCount > 0" class="ml-auto bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {{ pendingOrdersCount }}
            </span>
          </router-link>
        </nav>

        <!-- User Section -->
        <div class="p-4 border-t border-slate-200 dark:border-slate-800">
          <div class="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
            <div class="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-sm">
              {{ userInitials }}
            </div>
            <div class="flex flex-col overflow-hidden flex-1">
              <p class="text-sm font-semibold text-[#0d141b] dark:text-white truncate">{{ userName }}</p>
              <p class="text-xs text-[#4c739a] dark:text-slate-400 truncate">{{ tenantName }}</p>
            </div>
          </div>
          <button
            @click="handleLogout"
            class="w-full mt-2 px-4 py-2.5 text-sm text-[#4c739a] dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
          >
            <span class="material-symbols-outlined text-[20px]">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Overlay for mobile/tablet -->
    <div
      v-if="sidebarOpen && windowWidth < 1024"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
      @click="sidebarOpen = false"
    ></div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col lg:ml-72 w-full">
      <!-- Top Bar -->
      <header class="h-20 shrink-0 px-8 flex items-center justify-between z-10 bg-surface-light dark:bg-surface-dark border-b border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-4">
          <button
            @click="sidebarOpen = !sidebarOpen"
            class="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            <span class="material-symbols-outlined text-[#4c739a] dark:text-slate-400">menu</span>
          </button>
          <div class="flex items-center gap-2 text-sm">
            <router-link to="/app/dashboard" class="text-slate-500 hover:text-emerald-600 transition-colors">Home</router-link>
            <span class="text-slate-400">/</span>
            <span class="text-[#0d141b] dark:text-white font-medium">{{ pageTitle }}</span>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <button class="relative p-2.5 bg-white dark:bg-slate-800 rounded-full shadow-sm text-slate-500 hover:text-emerald-600 transition-colors border border-slate-100 dark:border-slate-700">
            <span class="material-symbols-outlined">notifications</span>
            <span v-if="pendingOrdersCount > 0" class="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto px-8 pb-8 pt-6">
        <div class="max-w-7xl mx-auto">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const sidebarOpen = ref(false);
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024);
const pendingOrdersCount = ref(0);

const userName = computed(() => authStore.user?.name || 'Kitchen');
const tenantName = computed(() => authStore.user?.tenantName || 'Toko');
const userInitials = computed(() => {
  const name = userName.value;
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
});

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/app/dashboard': 'Dashboard',
    '/app/orders/kitchen': 'Incoming Orders',
  };
  return titles[route.path] || 'Kitchen Display';
});

const closeSidebarOnMobile = () => {
  if (windowWidth.value < 1024) {
    sidebarOpen.value = false;
  }
};

const handleResize = () => {
  windowWidth.value = window.innerWidth;
  if (windowWidth.value >= 1024) {
    sidebarOpen.value = true;
  } else {
    sidebarOpen.value = false;
  }
};

const handleLogout = () => {
  // Clear auth synchronously to prevent any flash
  authStore.clearAuth();
  // Use replace instead of href to avoid history entry and flash
  window.location.replace('/login');
};

onMounted(() => {
  windowWidth.value = window.innerWidth;
  if (windowWidth.value >= 1024) {
    sidebarOpen.value = true;
  }
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
nav {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

nav::-webkit-scrollbar {
  width: 6px;
}

nav::-webkit-scrollbar-track {
  background: transparent;
}

nav::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 3px;
}

nav::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}
</style>
