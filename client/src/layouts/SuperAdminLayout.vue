<template>
  <div class="h-screen flex bg-slate-50 overflow-hidden font-display">
    <!-- Sidebar -->
    <aside
      class="w-64 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 transition-all duration-300 z-50 fixed lg:static"
      :class="{ 
        '-translate-x-full lg:translate-x-0': !sidebarOpen && windowWidth < 1024,
        'translate-x-0 shadow-2xl lg:shadow-none': sidebarOpen || windowWidth >= 1024
      }"
    >
      <div class="p-6 pb-2">
        <div class="flex flex-col gap-1">
          <h1 class="text-[#137fec] text-xl font-bold leading-normal flex items-center gap-2">
            <span class="material-symbols-outlined fill-1">storefront</span>
            Warungin
          </h1>
          <p class="text-slate-500 text-xs font-medium leading-normal pl-8 uppercase tracking-wider">Super Admin Panel</p>
        </div>
      </div>

      <nav class="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1 custom-scrollbar">
        <!-- Dashboard -->
        <router-link
          to="/app/super-dashboard"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
          active-class="bg-[#137fec]/10 text-[#137fec] font-semibold"
          inactive-class="text-slate-600 hover:bg-slate-50"
          @click="closeSidebarOnMobile"
        >
          <span class="material-symbols-outlined" :class="{ 'fill-1': $route.path === '/app/super-dashboard' }">dashboard</span>
          <p class="text-sm leading-normal">Dashboard</p>
        </router-link>

        <div class="mt-4 mb-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Core Management</div>
        <router-link
          to="/app/tenants"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
          active-class="bg-[#137fec]/10 text-[#137fec] font-semibold"
          inactive-class="text-slate-600 hover:bg-slate-50"
          @click="closeSidebarOnMobile"
        >
          <span class="material-symbols-outlined" :class="{ 'fill-1': $route.path === '/app/tenants' }">store</span>
          <p class="text-sm leading-normal">Tenants</p>
        </router-link>
        <router-link
          to="/app/reports/global"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
          active-class="bg-[#137fec]/10 text-[#137fec] font-semibold"
          inactive-class="text-slate-600 hover:bg-slate-50"
          @click="closeSidebarOnMobile"
        >
          <span class="material-symbols-outlined" :class="{ 'fill-1': $route.path === '/app/reports/global' }">receipt_long</span>
          <p class="text-sm leading-normal">Subscriptions</p>
        </router-link>
        <router-link
          to="/app/addons"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
          active-class="bg-[#137fec]/10 text-[#137fec] font-semibold"
          inactive-class="text-slate-600 hover:bg-slate-50"
          @click="closeSidebarOnMobile"
        >
          <span class="material-symbols-outlined" :class="{ 'fill-1': $route.path === '/app/addons' }">extension</span>
          <p class="text-sm leading-normal">Addons</p>
        </router-link>

        <div class="mt-4 mb-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Business Ops</div>
        <router-link
          to="/app/finance"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-slate-600 hover:bg-slate-50"
          active-class="bg-[#137fec]/10 text-[#137fec] font-semibold"
          @click="closeSidebarOnMobile"
        >
          <span class="material-symbols-outlined">payments</span>
          <p class="text-sm leading-normal">Finance</p>
        </router-link>
        <router-link
          to="/app/profit-loss"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-slate-600 hover:bg-slate-50"
          active-class="bg-[#137fec]/10 text-[#137fec] font-semibold"
          @click="closeSidebarOnMobile"
        >
          <span class="material-symbols-outlined">analytics</span>
          <p class="text-sm leading-normal">Profit & Loss</p>
        </router-link>
        <router-link
          to="/app/analytics"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-slate-600 hover:bg-slate-50"
          active-class="bg-[#137fec]/10 text-[#137fec] font-semibold"
          @click="closeSidebarOnMobile"
        >
          <span class="material-symbols-outlined">monitoring</span>
          <p class="text-sm leading-normal">Advanced Analytics</p>
        </router-link>

        <div class="mt-4 mb-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Support & Communication</div>
        <router-link
          to="/app/tenants/support"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-slate-600 hover:bg-slate-50"
          active-class="bg-[#137fec]/10 text-[#137fec] font-semibold"
          @click="closeSidebarOnMobile"
        >
          <span class="material-symbols-outlined">support_agent</span>
          <p class="text-sm leading-normal">Tenant Support</p>
        </router-link>
        <router-link
          to="/app/superadmin/contact-messages"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-slate-600 hover:bg-slate-50"
          active-class="bg-[#137fec]/10 text-[#137fec] font-semibold"
          @click="closeSidebarOnMobile"
        >
          <span class="material-symbols-outlined">mail</span>
          <p class="text-sm leading-normal">Contact Messages</p>
        </router-link>

        <div class="mt-4 mb-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">System & Data</div>
        <router-link
          to="/app/superadmin/server-monitor"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-slate-600 hover:bg-slate-50"
          active-class="bg-[#137fec]/10 text-[#137fec] font-semibold"
          @click="closeSidebarOnMobile"
        >
          <span class="material-symbols-outlined">dns</span>
          <p class="text-sm leading-normal">Server Monitor</p>
        </router-link>
        <router-link
          to="/app/superadmin/system-info"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-slate-600 hover:bg-slate-50"
          active-class="bg-[#137fec]/10 text-[#137fec] font-semibold"
          @click="closeSidebarOnMobile"
        >
          <span class="material-symbols-outlined">info</span>
          <p class="text-sm leading-normal">System Info</p>
        </router-link>
        <router-link
          to="/app/settings/system"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-slate-600 hover:bg-slate-50"
          active-class="bg-[#137fec]/10 text-[#137fec] font-semibold"
          @click="closeSidebarOnMobile"
        >
          <span class="material-symbols-outlined">settings</span>
          <p class="text-sm leading-normal">System Settings</p>
        </router-link>
        
        <div class="mt-4 mb-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Maintenance</div>
        <router-link
          to="/app/superadmin/backups"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-slate-600 hover:bg-slate-50"
          active-class="bg-[#137fec]/10 text-[#137fec] font-semibold"
          @click="closeSidebarOnMobile"
        >
          <span class="material-symbols-outlined">backup</span>
          <p class="text-sm leading-normal">Backups</p>
        </router-link>
        <router-link
          to="/app/settings/archive"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-slate-600 hover:bg-slate-50"
          active-class="bg-[#137fec]/10 text-[#137fec] font-semibold"
          @click="closeSidebarOnMobile"
        >
          <span class="material-symbols-outlined">archive</span>
          <p class="text-sm leading-normal">Archives</p>
        </router-link>
        <router-link
          to="/app/settings/retention"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-slate-600 hover:bg-slate-50"
          active-class="bg-[#137fec]/10 text-[#137fec] font-semibold"
          @click="closeSidebarOnMobile"
        >
          <span class="material-symbols-outlined">delete_sweep</span>
          <p class="text-sm leading-normal">Retention</p>
        </router-link>
      </nav>

      <div class="p-4 border-t border-slate-100 bg-white">
        <div class="flex items-center gap-3 mb-4">
          <div class="size-10 rounded-full bg-[#137fec] text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {{ userInitials }}
          </div>
          <div class="flex flex-col min-w-0">
            <p class="text-sm font-bold text-slate-900 truncate">{{ userName }}</p>
            <p class="text-xs text-slate-500 truncate">{{ userEmail }}</p>
          </div>
        </div>
        <button
          @click="handleLogout"
          class="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
        >
          <span class="material-symbols-outlined text-[20px]">logout</span>
          Logout
        </button>
      </div>
    </aside>

    <!-- Overlay -->
    <div
      v-if="sidebarOpen && windowWidth < 1024"
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300"
      @click="sidebarOpen = false"
    ></div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
      <!-- Header -->
      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 z-10">
        <div class="flex items-center gap-4">
          <button
            @click="sidebarOpen = !sidebarOpen"
            class="lg:invisible p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <span class="material-symbols-outlined">menu</span>
          </button>
          <div>
            <nav class="flex items-center gap-2 text-xs text-slate-400 mb-0.5">
              <router-link to="/app/super-dashboard" class="hover:text-[#137fec] transition-colors">Home</router-link>
              <span class="text-[10px] text-slate-300">/</span>
              <span class="text-slate-600 font-medium">{{ pageTitle }}</span>
            </nav>
            <h2 class="text-slate-900 text-lg font-bold leading-tight">{{ pageTitle }}</h2>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <div class="hidden md:flex items-center bg-slate-100 rounded-lg px-3 py-1.5 w-64 focus-within:ring-2 ring-[#137fec]/20 transition-all border border-transparent focus-within:border-[#137fec]/30">
            <span class="material-symbols-outlined text-slate-400 text-[18px]">search</span>
            <input
              type="text"
              class="bg-transparent border-none text-sm w-full focus:ring-0 text-slate-900 placeholder:text-slate-400"
              placeholder="Search data..."
            />
          </div>
          <button class="relative p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
            <span class="material-symbols-outlined">notifications</span>
            <span class="absolute top-2.5 right-2.5 size-2 bg-red-500 rounded-full border border-white"></span>
          </button>
        </div>
      </header>

      <!-- Scrollable Content -->
      <main class="flex-1 overflow-y-auto custom-scrollbar">
        <div class="p-6 lg:p-8">
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

const userName = computed(() => authStore.user?.name || 'Super Admin');
const userEmail = computed(() => authStore.user?.email || '');
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
    '/app/super-dashboard': 'Dashboard',
    '/app/tenants': 'Tenant Management',
    '/app/tenants/support': 'Tenant Support',
    '/app/addons': 'Addon Management',
    '/app/reports/global': 'Laporan Global',
    '/app/settings/system': 'System Settings',
    '/app/settings/archive': 'Archive Management',
    '/app/settings/retention': 'Retention Management',
    '/app/superadmin/backups': 'Backup Management',
    '/app/superadmin/server-monitor': 'Server Monitor',
    '/app/superadmin/system-info': 'Informasi Sistem',
    '/app/superadmin/contact-messages': 'Kelola Pesan',
    '/app/analytics': 'Advanced Analytics',
    '/app/finance': 'Keuangan',
    '/app/profit-loss': 'Laporan Laba Rugi',
  };
  return titles[route.path] || 'Super Admin Dashboard';
});

const closeSidebarOnMobile = () => {
  if (windowWidth.value < 1024) {
    sidebarOpen.value = false;
  }
};

// Removed handleDashboardClick - no longer needed with separate super-dashboard route

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
  scrollbar-color: #1e40af transparent;
}

nav::-webkit-scrollbar {
  width: 6px;
}

nav::-webkit-scrollbar-track {
  background: transparent;
}

nav::-webkit-scrollbar-thumb {
  background-color: #1e40af;
  border-radius: 3px;
}

nav::-webkit-scrollbar-thumb:hover {
  background-color: #1e3a8a;
}
</style>

