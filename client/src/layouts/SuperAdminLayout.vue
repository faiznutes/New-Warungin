<template>
  <div class="flex h-screen bg-[#f6f7f8] dark:bg-[#101922] font-display overflow-hidden">
    <!-- Sidebar -->
    <aside class="w-64 bg-slate-50 dark:bg-[#1e293b] border-r border-[#e7edf3] dark:border-slate-700 flex flex-col h-full shrink-0 transition-all duration-300">
      <div class="p-6 pb-2">
        <div class="flex flex-col gap-1">
          <h1 class="text-[#137fec] text-xl font-bold leading-normal flex items-center gap-2">
            <span class="material-symbols-outlined icon-filled">storefront</span>
            Warungin
          </h1>
          <p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium leading-normal pl-8">Super Admin Panel</p>
        </div>
      </div>

      <nav class="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
        <router-link 
          to="/app/super-dashboard" 
          class="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group"
          active-class="bg-[#137fec]/10 text-[#137fec]"
          :class="[$route.path === '/app/super-dashboard' ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
        >
          <span class="material-symbols-outlined" :class="{ 'icon-filled': $route.path === '/app/super-dashboard' }">dashboard</span>
          <p class="text-sm font-semibold leading-normal">Dashboard</p>
        </router-link>

        <router-link 
          to="/app/tenants" 
          class="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group"
          active-class="bg-[#137fec]/10 text-[#137fec]"
          :class="[$route.path.startsWith('/app/tenants') ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
        >
          <span class="material-symbols-outlined" :class="{ 'icon-filled': $route.path.startsWith('/app/tenants') }">store</span>
          <p class="text-sm font-medium leading-normal">Tenants</p>
        </router-link>

        <router-link 
          to="/app/subscription" 
          class="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group"
          active-class="bg-[#137fec]/10 text-[#137fec]"
          :class="[$route.path.startsWith('/app/subscription') ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
        >
          <span class="material-symbols-outlined">receipt_long</span>
          <p class="text-sm font-medium leading-normal">Subscriptions</p>
        </router-link>

        <router-link 
          to="/app/addons" 
          class="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group"
          active-class="bg-[#137fec]/10 text-[#137fec]"
          :class="[$route.path.startsWith('/app/addons') ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
        >
          <span class="material-symbols-outlined">extension</span>
          <p class="text-sm font-medium leading-normal">Addons</p>
        </router-link>

        <div class="my-2 border-t border-slate-200 dark:border-slate-700"></div>
        <p class="px-3 text-xs font-bold text-[#4c739a]/70 uppercase tracking-wider mb-1">Business</p>

        <router-link 
          to="/app/finance" 
          class="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group"
          active-class="bg-[#137fec]/10 text-[#137fec]"
          :class="[$route.path.startsWith('/app/finance') ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
        >
          <span class="material-symbols-outlined">payments</span>
          <p class="text-sm font-medium leading-normal">Finance</p>
        </router-link>

        <router-link 
          to="/app/analytics" 
          class="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group"
          active-class="bg-[#137fec]/10 text-[#137fec]"
          :class="[$route.path.startsWith('/app/analytics') ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
        >
          <span class="material-symbols-outlined">analytics</span>
          <p class="text-sm font-medium leading-normal">Analytics</p>
        </router-link>

        <div class="my-2 border-t border-slate-200 dark:border-slate-700"></div>
        <p class="px-3 text-xs font-bold text-[#4c739a]/70 uppercase tracking-wider mb-1">System</p>
        
        <router-link 
          to="/app/superadmin/server-monitor" 
          class="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group"
          active-class="bg-[#137fec]/10 text-[#137fec]"
          :class="[$route.path.startsWith('/app/superadmin/server-monitor') ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
        >
          <span class="material-symbols-outlined">dns</span>
          <p class="text-sm font-medium leading-normal">Monitor</p>
        </router-link>

        <router-link 
          to="/app/superadmin/system-info" 
          class="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group"
          active-class="bg-[#137fec]/10 text-[#137fec]"
          :class="[$route.path.startsWith('/app/superadmin/system-info') ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
        >
          <span class="material-symbols-outlined">info</span>
          <p class="text-sm font-medium leading-normal">System Info</p>
        </router-link>

        <router-link 
          to="/app/settings/system" 
          class="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group"
          active-class="bg-[#137fec]/10 text-[#137fec]"
          :class="[$route.path === '/app/settings/system' ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
        >
          <span class="material-symbols-outlined">settings</span>
          <p class="text-sm font-medium leading-normal">Settings</p>
        </router-link>

        <div class="my-2 border-t border-slate-200 dark:border-slate-700"></div>
        <p class="px-3 text-xs font-bold text-[#4c739a]/70 uppercase tracking-wider mb-1">Maintenance</p>

        <router-link 
          to="/app/superadmin/backups" 
          class="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group"
          active-class="bg-[#137fec]/10 text-[#137fec]"
          :class="[$route.path.startsWith('/app/superadmin/backups') ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
        >
          <span class="material-symbols-outlined">backup</span>
          <p class="text-sm font-medium leading-normal">Backups</p>
        </router-link>
        
        <router-link 
          to="/app/settings/archive" 
          class="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group"
          active-class="bg-[#137fec]/10 text-[#137fec]"
          :class="[$route.path.startsWith('/app/settings/archive') ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
        >
          <span class="material-symbols-outlined">inventory_2</span>
          <p class="text-sm font-medium leading-normal">Archives</p>
        </router-link>

        <router-link 
          to="/app/settings/retention" 
          class="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group"
          active-class="bg-[#137fec]/10 text-[#137fec]"
          :class="[$route.path.startsWith('/app/settings/retention') ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
        >
          <span class="material-symbols-outlined">delete_sweep</span>
          <p class="text-sm font-medium leading-normal">Retention</p>
        </router-link>

        <button 
          @click="handleLogout" 
          class="flex items-center gap-3 px-3 py-3 rounded-lg text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors w-full text-left"
        >
          <span class="material-symbols-outlined">logout</span>
          <p class="text-sm font-medium leading-normal">Logout</p>
        </button>
      </nav>

      <div class="p-4 border-t border-[#e7edf3] dark:border-slate-700">
        <div class="flex items-center gap-3">
          <div class="size-10 rounded-full bg-cover bg-center border-2 border-white dark:border-slate-600 shadow-sm bg-slate-200 flex items-center justify-center text-[#4c739a]">
             <span class="material-symbols-outlined">person</span>
          </div>
          <div class="flex flex-col">
            <p class="text-sm font-bold text-[#0d141b] dark:text-white">{{ user?.name || 'Admin User' }}</p>
            <p class="text-xs text-[#4c739a] dark:text-slate-400">{{ user?.email || 'admin@warungin.com' }}</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col min-w-0 bg-[#f6f7f8] dark:bg-[#101922] overflow-hidden">
      <!-- Header -->
      <header class="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-[#1e293b] border-b border-[#e7edf3] dark:border-slate-700 shrink-0 z-10">
        <div class="flex items-center gap-4">
          <button class="lg:hidden text-[#4c739a]">
            <span class="material-symbols-outlined">menu</span>
          </button>
          <div>
            <nav class="flex items-center gap-2 text-sm text-[#4c739a] dark:text-slate-400 mb-1">
              <span class="hover:text-[#137fec] transition-colors cursor-pointer">Home</span>
              <span class="text-xs">/</span>
              <span class="text-[#0d141b] dark:text-white font-medium">{{ pageTitle }}</span>
            </nav>
            <h2 class="text-[#0d141b] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">{{ pageTitle }}</h2>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <!-- Search -->
          <div class="hidden md:flex items-center bg-[#e7edf3] dark:bg-slate-700 rounded-lg px-3 py-2 w-64 focus-within:ring-2 ring-[#137fec]/50 transition-all">
            <span class="material-symbols-outlined text-[#4c739a] dark:text-slate-400 text-[20px]">search</span>
            <input class="bg-transparent border-none text-sm w-full focus:ring-0 text-[#0d141b] dark:text-white placeholder:text-[#4c739a] dark:placeholder:text-slate-400" placeholder="Search tenants, orders..." type="text"/>
          </div>
          <!-- Notifications -->
          <button class="relative p-2 text-[#4c739a] dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <span class="material-symbols-outlined">notifications</span>
            <span class="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white dark:border-[#1e293b]"></span>
          </button>
        </div>
      </header>

      <!-- Scrollable Dashboard Content -->
      <div class="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
        <div class="max-w-[1400px] mx-auto flex flex-col gap-8 h-full">
           <router-view></router-view>
           <!-- Footer spacing -->
           <div class="h-8 shrink-0"></div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const authStore = useAuthStore();

const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024);

const user = computed(() => authStore.user);

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/app/super-dashboard': 'Super Admin Dashboard',
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
  // Fallback for dynamic routes or sub-routes
  if (route.path.startsWith('/app/tenants/')) return 'Tenant Details';
  
  return titles[route.path] || 'Super Admin Dashboard';
});

const handleLogout = () => {
  authStore.clearAuth();
  window.location.replace('/login');
};

const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  windowWidth.value = window.innerWidth;
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style>
/* Custom scrollbar for better aesthetics */
::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}
::-webkit-scrollbar-track {
    background: transparent;
}
::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
.icon-filled {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>

