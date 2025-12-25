<template>
  <div class="flex h-screen bg-background-light dark:bg-background-dark font-display overflow-hidden">
    <!-- Sidebar - Main Tenant -->
    <aside
      class="w-64 bg-slate-50 dark:bg-[#1e293b] border-r border-[#e7edf3] dark:border-slate-700 flex flex-col h-full shrink-0 transition-all duration-300 fixed lg:relative z-50"
      :class="{ 
        '-translate-x-full lg:translate-x-0': !sidebarOpen && windowWidth < 1024,
        'translate-x-0': sidebarOpen || windowWidth >= 1024,
        'shadow-xl lg:shadow-none': sidebarOpen && windowWidth < 1024
      }"
    >
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div class="p-6 pb-2 shrink-0">
          <router-link to="/app/dashboard" class="flex flex-col gap-1 group">
            <h1 class="text-primary text-xl font-bold leading-normal flex items-center gap-2">
               <span class="material-symbols-outlined icon-filled">storefront</span>
               {{ outletName }}
            </h1>
            <div class="flex items-center gap-2 pl-8">
               <span class="text-[#4c739a] dark:text-slate-400 text-xs font-bold leading-normal truncate max-w-[150px]" :title="branchName">{{ branchName }}</span>
               <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase">Owner</span>
            </div>
          </router-link>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar flex flex-col gap-1">
          <!-- Operasional Section -->
          <div class="mb-1">
            <button
              @click="toggleMenu('operasional')"
              class="w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#94a3b8] hover:text-primary transition-colors mb-1"
            >
              <span>Operasional</span>
              <span 
                class="material-symbols-outlined text-[16px] transition-transform duration-200"
                :class="{ 'rotate-180': expandedMenus.operasional }"
              >expand_more</span>
            </button>
            <div
              v-show="expandedMenus.operasional"
              class="space-y-1 transition-all duration-200"
            >
            <router-link
              to="/app/dashboard"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
              active-class="bg-primary/10 text-primary"
              exact-active-class="bg-primary/10 text-primary"
              :class="[$route.path === '/app/dashboard' ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
              @click="closeSidebarOnMobile"
            >
              <span class="material-symbols-outlined text-[20px]" :class="{ 'icon-filled': $route.path === '/app/dashboard' }">dashboard</span>
              <span class="text-sm font-medium leading-normal">Dashboard</span>
            </router-link>

            <router-link
              to="/app/dashboard-new"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
              active-class="bg-primary/10 text-primary"
              exact-active-class="bg-primary/10 text-primary"
              :class="[$route.path === '/app/dashboard-new' ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
              @click="closeSidebarOnMobile"
            >
               <span class="material-symbols-outlined text-[20px]" :class="{ 'icon-filled': $route.path === '/app/dashboard-new' }">grid_view</span>
               <div class="flex flex-col leading-tight">
                  <span class="text-sm font-medium">Dashboard (New)</span>
               </div>
            </router-link>

            <router-link
              to="/app/products"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
              active-class="bg-primary/10 text-primary"
              :class="[$route.path.startsWith('/app/products') && !$route.path.includes('adjustments') ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
              @click="closeSidebarOnMobile"
            >
              <span class="material-symbols-outlined text-[20px]" :class="{ 'icon-filled': $route.path.startsWith('/app/products') }">inventory_2</span>
              <span class="text-sm font-medium leading-normal">Produk</span>
            </router-link>

            <router-link
              v-if="authStore.user?.role === 'ADMIN_TENANT'"
              to="/app/products/adjustments"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
              active-class="bg-[#137fec]/10 text-[#137fec]"
              :class="[$route.path === '/app/products/adjustments' ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
              @click="closeSidebarOnMobile"
            >
              <span class="material-symbols-outlined text-[20px]">tune</span>
              <span class="text-sm font-medium leading-normal">Penyesuaian</span>
            </router-link>

            <router-link
              to="/app/orders"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
              active-class="bg-[#137fec]/10 text-[#137fec]"
              :class="[$route.path.startsWith('/app/orders') ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
              @click="closeSidebarOnMobile"
            >
              <span class="material-symbols-outlined text-[20px]">shopping_cart</span>
              <span class="text-sm font-medium leading-normal">Pesanan</span>
            </router-link>

            <router-link
              to="/app/customers"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
              active-class="bg-[#137fec]/10 text-[#137fec]"
              :class="[$route.path.startsWith('/app/customers') ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
              @click="closeSidebarOnMobile"
            >
              <span class="material-symbols-outlined text-[20px]">group</span>
              <span class="text-sm font-medium leading-normal">Pelanggan</span>
            </router-link>
            </div>
          </div>

          <div class="my-1 border-t border-slate-200 dark:border-slate-700"></div>

          <!-- Laporan & Analitik Section -->
          <div v-if="authStore.user?.role === 'ADMIN_TENANT'" class="mb-1">
            <button
              @click="toggleMenu('laporan')"
              class="w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#94a3b8] hover:text-[#137fec] transition-colors mb-1"
            >
              <span>Laporan & Analitik</span>
              <span 
                class="material-symbols-outlined text-[16px] transition-transform duration-200"
                :class="{ 'rotate-180': expandedMenus.laporan }"
              >expand_more</span>
            </button>
            <div
              v-show="expandedMenus.laporan"
              class="space-y-1 transition-all duration-200"
            >
              <router-link
                to="/app/reports"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
                active-class="bg-[#137fec]/10 text-[#137fec]"
                exact-active-class="bg-[#137fec]/10 text-[#137fec]"
                :class="[$route.path === '/app/reports' ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
                @click="closeSidebarOnMobile"
              >
                <span class="material-symbols-outlined text-[20px]">summarize</span>
                <span class="text-sm font-medium leading-normal">Laporan</span>
              </router-link>

              <!-- Business Analytics Submenu -->
              <div v-if="hasBusinessAnalytics" class="space-y-1">
                <router-link
                  to="/app/analytics"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
                  active-class="bg-[#137fec]/10 text-[#137fec]"
                  :class="[$route.path === '/app/analytics' ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
                  @click="closeSidebarOnMobile"
                >
                  <span class="material-symbols-outlined text-[20px]">analytics</span>
                  <span class="text-sm font-medium leading-normal">Advanced Analytics</span>
                </router-link>

                <router-link
                  to="/app/finance"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
                  active-class="bg-[#137fec]/10 text-[#137fec]"
                  :class="[$route.path === '/app/finance' ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
                  @click="closeSidebarOnMobile"
                >
                  <span class="material-symbols-outlined text-[20px]">payments</span>
                  <span class="text-sm font-medium leading-normal">Keuangan</span>
                </router-link>

                <router-link
                  to="/app/profit-loss"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
                  active-class="bg-[#137fec]/10 text-[#137fec]"
                  :class="[$route.path === '/app/profit-loss' ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
                  @click="closeSidebarOnMobile"
                >
                   <span class="material-symbols-outlined text-[20px]">trending_up</span>
                   <span class="text-sm font-medium leading-normal">Laba Rugi</span>
                </router-link>

                <router-link
                  to="/app/reports/advanced"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
                  active-class="bg-[#137fec]/10 text-[#137fec]"
                  :class="[$route.path === '/app/reports/advanced' ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
                  @click="closeSidebarOnMobile"
                >
                  <span class="material-symbols-outlined text-[20px]">bar_chart</span>
                  <span class="text-sm font-medium leading-normal">Advanced Reporting</span>
                </router-link>

                <router-link
                  to="/app/finance/management"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
                  active-class="bg-[#137fec]/10 text-[#137fec]"
                  :class="[$route.path === '/app/finance/management' ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
                  @click="closeSidebarOnMobile"
                >
                  <span class="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                  <span class="text-sm font-medium leading-normal">Financial Mgmt</span>
                </router-link>
              </div>
            </div>
          </div>
          
          <div v-if="authStore.user?.role === 'ADMIN_TENANT'" class="my-1 border-t border-slate-200 dark:border-slate-700"></div>

          <!-- Marketing & Delivery Section -->
          <div v-if="authStore.user?.role === 'ADMIN_TENANT' && hasDeliveryMarketing" class="mb-1">
            <button
              @click="toggleMenu('marketing')"
              class="w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#94a3b8] hover:text-[#137fec] transition-colors mb-1"
            >
              <span>Marketing & Delivery</span>
               <span 
                class="material-symbols-outlined text-[16px] transition-transform duration-200"
                :class="{ 'rotate-180': expandedMenus.marketing }"
              >expand_more</span>
            </button>
            <div
              v-show="expandedMenus.marketing"
              class="space-y-1 transition-all duration-200"
            >
              <router-link
                to="/app/marketing"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
                active-class="bg-[#137fec]/10 text-[#137fec]"
                :class="[$route.path === '/app/marketing' ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
                @click="closeSidebarOnMobile"
              >
                <span class="material-symbols-outlined text-[20px]">campaign</span>
                <span class="text-sm font-medium leading-normal">Campaigns</span>
              </router-link>

              <router-link
                to="/app/marketing/email-templates"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
                active-class="bg-[#137fec]/10 text-[#137fec]"
                :class="[$route.path === '/app/marketing/email-templates' ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
                @click="closeSidebarOnMobile"
              >
                <span class="material-symbols-outlined text-[20px]">mail</span>
                <span class="text-sm font-medium leading-normal">Email Templates</span>
              </router-link>

              <router-link
                to="/app/marketing/email-analytics"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
                active-class="bg-[#137fec]/10 text-[#137fec]"
                :class="[$route.path === '/app/marketing/email-analytics' ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
                @click="closeSidebarOnMobile"
              >
                <span class="material-symbols-outlined text-[20px]">insights</span>
                <span class="text-sm font-medium leading-normal">Email Analytics</span>
              </router-link>

              <router-link
                to="/app/marketing/email-scheduler"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
                active-class="bg-[#137fec]/10 text-[#137fec]"
                :class="[$route.path === '/app/marketing/email-scheduler' ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
                @click="closeSidebarOnMobile"
              >
                <span class="material-symbols-outlined text-[20px]">schedule_send</span>
                <span class="text-sm font-medium leading-normal">Email Scheduler</span>
              </router-link>

              <router-link
                to="/app/marketing/customer-engagement"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
                active-class="bg-[#137fec]/10 text-[#137fec]"
                :class="[$route.path === '/app/marketing/customer-engagement' ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
                @click="closeSidebarOnMobile"
              >
                <span class="material-symbols-outlined text-[20px]">loyalty</span>
                <span class="text-sm font-medium leading-normal">Engagement</span>
              </router-link>

              <router-link
                to="/app/delivery"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
                active-class="bg-[#137fec]/10 text-[#137fec]"
                :class="[$route.path === '/app/delivery' ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
                @click="closeSidebarOnMobile"
              >
                <span class="material-symbols-outlined text-[20px]">local_shipping</span>
                <span class="text-sm font-medium leading-normal">Delivery Orders</span>
              </router-link>
            </div>
          </div>

          <div v-if="authStore.user?.role === 'ADMIN_TENANT' && hasInventoryAccess" class="my-1 border-t border-slate-200 dark:border-slate-700"></div>

          <!-- Inventory Management Section -->
          <div v-if="authStore.user?.role === 'ADMIN_TENANT' && hasInventoryAccess" class="mb-1">
             <button
              @click="toggleMenu('inventory')"
              class="w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#94a3b8] hover:text-[#137fec] transition-colors mb-1"
            >
              <span>Inventory</span>
               <span 
                class="material-symbols-outlined text-[16px] transition-transform duration-200"
                :class="{ 'rotate-180': expandedMenus.inventory }"
              >expand_more</span>
            </button>
            <div
              v-show="expandedMenus.inventory"
              class="space-y-1 transition-all duration-200"
            >
              <router-link
                to="/app/inventory/suppliers"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
                active-class="bg-[#137fec]/10 text-[#137fec]"
                :class="[$route.path === '/app/inventory/suppliers' ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
                @click="closeSidebarOnMobile"
              >
                <span class="material-symbols-outlined text-[20px]">factory</span>
                <span class="text-sm font-medium leading-normal">Suppliers</span>
              </router-link>

              <router-link
                to="/app/inventory/purchase-orders"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
                 active-class="bg-[#137fec]/10 text-[#137fec]"
                :class="[$route.path === '/app/inventory/purchase-orders' ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
                @click="closeSidebarOnMobile"
              >
                <span class="material-symbols-outlined text-[20px]">shopping_bag</span>
                <span class="text-sm font-medium leading-normal">Purchase Orders</span>
              </router-link>

              <router-link
                to="/app/inventory/stock-transfers"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
                 active-class="bg-[#137fec]/10 text-[#137fec]"
                :class="[$route.path === '/app/inventory/stock-transfers' ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
                @click="closeSidebarOnMobile"
              >
                <span class="material-symbols-outlined text-[20px]">move_down</span>
                <span class="text-sm font-medium leading-normal">Stock Transfers</span>
              </router-link>

              <router-link
                to="/app/inventory/stock-alerts"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
                 active-class="bg-[#137fec]/10 text-[#137fec]"
                :class="[$route.path === '/app/inventory/stock-alerts' ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
                @click="closeSidebarOnMobile"
              >
                <span class="material-symbols-outlined text-[20px]">notification_important</span>
                <span class="text-sm font-medium leading-normal">Stock Alerts</span>
              </router-link>
            </div>
          </div>
          
           <div v-if="authStore.user?.role === 'ADMIN_TENANT'" class="my-1 border-t border-slate-200 dark:border-slate-700"></div>

          <!-- Manajemen Section -->
          <div v-if="authStore.user?.role === 'ADMIN_TENANT'" class="mb-1">
             <button
              @click="toggleMenu('manajemen')"
              class="w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#94a3b8] hover:text-[#137fec] transition-colors mb-1"
            >
              <span>Manajemen</span>
               <span 
                class="material-symbols-outlined text-[16px] transition-transform duration-200"
                :class="{ 'rotate-180': expandedMenus.manajemen }"
              >expand_more</span>
            </button>
            <div
              v-show="expandedMenus.manajemen"
              class="space-y-1 transition-all duration-200"
            >
              <router-link
                to="/app/users"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
                active-class="bg-[#137fec]/10 text-[#137fec]"
                :class="[$route.path.startsWith('/app/users') ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
                @click="closeSidebarOnMobile"
              >
                <span class="material-symbols-outlined text-[20px]">badge</span>
                <span class="text-sm font-medium leading-normal">Pengguna</span>
              </router-link>

              <router-link
                to="/app/stores"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
                active-class="bg-[#137fec]/10 text-[#137fec]"
                :class="[$route.path.startsWith('/app/stores') ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
                @click="closeSidebarOnMobile"
              >
                 <span class="material-symbols-outlined text-[20px]">store</span>
                 <span class="text-sm font-medium leading-normal">Kelola Store</span>
              </router-link>

              <router-link
                to="/app/discounts"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
                active-class="bg-[#137fec]/10 text-[#137fec]"
                :class="[$route.path.startsWith('/app/discounts') ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
                @click="closeSidebarOnMobile"
              >
                <span class="material-symbols-outlined text-[20px]">percent</span>
                <span class="text-sm font-medium leading-normal">Diskon</span>
              </router-link>
            </div>
          </div>
          
           <div v-if="authStore.user?.role === 'ADMIN_TENANT'" class="my-1 border-t border-slate-200 dark:border-slate-700"></div>

          <!-- Pengaturan Section -->
          <div v-if="authStore.user?.role === 'ADMIN_TENANT'" class="mb-1">
             <button
              @click="toggleMenu('pengaturan')"
              class="w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#94a3b8] hover:text-[#137fec] transition-colors mb-1"
            >
              <span>Pengaturan</span>
               <span 
                class="material-symbols-outlined text-[16px] transition-transform duration-200"
                :class="{ 'rotate-180': expandedMenus.pengaturan }"
              >expand_more</span>
            </button>
            <div
              v-show="expandedMenus.pengaturan"
              class="space-y-1 transition-all duration-200"
            >
              <router-link
                to="/app/subscription"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
                active-class="bg-[#137fec]/10 text-[#137fec]"
                :class="[$route.path.startsWith('/app/subscription') ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
                @click="closeSidebarOnMobile"
              >
                <span class="material-symbols-outlined text-[20px]">card_membership</span>
                <span class="text-sm font-medium leading-normal">Berlangganan</span>
              </router-link>

              <router-link
                to="/app/addons"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
                active-class="bg-[#137fec]/10 text-[#137fec]"
                :class="[$route.path.startsWith('/app/addons') ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
                @click="closeSidebarOnMobile"
              >
                <span class="material-symbols-outlined text-[20px]">extension</span>
                <span class="text-sm font-medium leading-normal">Addon</span>
              </router-link>

              <router-link
                to="/app/tenants/support"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
                active-class="bg-[#137fec]/10 text-[#137fec]"
                :class="[$route.path === '/app/tenants/support' ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
                @click="closeSidebarOnMobile"
              >
                <span class="material-symbols-outlined text-[20px]">support_agent</span>
                <span class="text-sm font-medium leading-normal">Bantuan</span>
              </router-link>

              <router-link
                to="/app/rewards"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
                active-class="bg-[#137fec]/10 text-[#137fec]"
                :class="[$route.path.startsWith('/app/rewards') ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
                @click="closeSidebarOnMobile"
              >
                 <span class="material-symbols-outlined text-[20px]">stars</span>
                 <span class="text-sm font-medium leading-normal">Point Gratis</span>
              </router-link>

              <router-link
                to="/app/settings/store"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
                active-class="bg-[#137fec]/10 text-[#137fec]"
                :class="[$route.path === '/app/settings/store' ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
                @click="closeSidebarOnMobile"
              >
                 <span class="material-symbols-outlined text-[20px]">storefront</span>
                 <span class="text-sm font-medium leading-normal">Pengaturan Toko</span>
              </router-link>

              <router-link
                to="/app/receipts/templates"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
                active-class="bg-[#137fec]/10 text-[#137fec]"
                :class="[$route.path === '/app/receipts/templates' ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
                @click="closeSidebarOnMobile"
              >
                <span class="material-symbols-outlined text-[20px]">receipt</span>
                <span class="text-sm font-medium leading-normal">Template Struk</span>
              </router-link>

              <router-link
                v-if="authStore.isSuperAdmin"
                to="/app/settings/archive"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
                active-class="bg-[#137fec]/10 text-[#137fec]"
                :class="[$route.path.startsWith('/app/settings/archive') ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
                @click="closeSidebarOnMobile"
              >
                 <span class="material-symbols-outlined text-[20px]">archive</span>
                 <span class="text-sm font-medium leading-normal">Archive Management</span>
              </router-link>

              <router-link
                v-if="authStore.isSuperAdmin"
                to="/app/settings/retention"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
                active-class="bg-[#137fec]/10 text-[#137fec]"
                :class="[$route.path.startsWith('/app/settings/retention') ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
                @click="closeSidebarOnMobile"
              >
                 <span class="material-symbols-outlined text-[20px]">auto_delete</span>
                 <span class="text-sm font-medium leading-normal">Retention Management</span>
              </router-link>
            </div>
          </div>
        </nav>

        <!-- User Section -->
        <div class="p-4 border-t border-[#e7edf3] dark:border-slate-700 shrink-0">
          <div class="flex items-center gap-3 mb-3">
            <div class="size-10 rounded-full bg-cover bg-center border-2 border-white dark:border-slate-600 shadow-sm bg-slate-200 flex items-center justify-center text-[#137fec] font-bold">
               {{ userInitials }}
            </div>
            <div class="flex flex-col min-w-0">
              <p class="text-sm font-bold text-[#0d141b] dark:text-white truncate">{{ userName }}</p>
              <p class="text-xs text-[#4c739a] dark:text-slate-400 truncate">{{ tenantName }}</p>
            </div>
          </div>
          <button
            @click="handleLogout"
            class="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-[#4c739a] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors w-full border border-transparent hover:border-red-100"
          >
            <span class="material-symbols-outlined text-[18px]">logout</span>
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Overlay for mobile/tablet -->
    <div
      v-if="sidebarOpen && windowWidth < 1024"
      class="fixed inset-0 bg-[#0d141b]/50 z-40 transition-opacity duration-300 backdrop-blur-sm"
      @click="sidebarOpen = false"
    ></div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 w-full bg-background-light dark:bg-background-dark">
      <!-- Top Bar -->
      <header class="bg-slate-50 dark:bg-[#1e293b] border-b border-[#e7edf3] dark:border-slate-700 shadow-sm sticky top-0 z-30 shrink-0">
        <div class="flex items-center justify-between px-6 py-4">
           <div class="flex items-center gap-4">
              <button
                @click="sidebarOpen = !sidebarOpen"
                class="lg:hidden p-2 text-[#4c739a] hover:bg-slate-100 rounded-xl transition-colors"
                aria-label="Toggle menu"
              >
                <span class="material-symbols-outlined">menu</span>
              </button>
              <div>
                <nav class="flex items-center gap-2 text-sm text-[#4c739a] dark:text-slate-400 mb-1">
                  <span class="hover:text-primary transition-colors cursor-pointer">App</span>
                  <span class="text-xs">/</span>
                  <span class="text-[#0d141b] dark:text-white font-medium">{{ pageTitle }}</span>
                </nav>
                <h1 class="text-lg font-bold text-[#0d141b] dark:text-white leading-tight">{{ pageTitle }}</h1>
              </div>
           </div>
           
          <div class="flex items-center gap-4">
             <!-- System Status -->
             <div class="hidden lg:flex items-center gap-4 mr-2">
               <div class="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                 <div class="w-2 h-2 rounded-full transition-colors duration-300" :class="isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'"></div>
                 <span class="text-xs font-bold text-[#4c739a] dark:text-slate-400 capitalize">{{ isOnline ? 'Online' : 'Offline' }}</span>
               </div>
               <div class="px-3 py-1.5 bg-[#0d141b] dark:bg-white text-white dark:text-[#0d141b] rounded-xl shadow-md font-mono text-sm font-bold tracking-wider border border-[#2a3036] dark:border-slate-200">
                 {{ currentTime }}
               </div>
             </div>
             <!-- Search (Optional) -->
             <div class="hidden md:flex items-center bg-[#e7edf3] dark:bg-slate-700 rounded-xl px-3 py-2 w-64 focus-within:ring-2 ring-primary/50 transition-all">
                <span class="material-symbols-outlined text-[#4c739a] dark:text-slate-400 text-[20px]">search</span>
                <input 
                  v-model="searchQuery"
                  @keyup.enter="handleGlobalSearch"
                  class="bg-transparent border-none text-sm w-full focus:ring-0 text-[#0d141b] dark:text-white placeholder:text-[#4c739a] dark:placeholder:text-slate-400" 
                  placeholder="Search products, orders..." 
                  type="text"
                />
              </div>

            <!-- Notification Button for Admin Tenant -->
            <button
              v-if="authStore.user?.role === 'ADMIN_TENANT'"
              @click="showInfoModal = true"
              class="relative p-2 text-[#4c739a] hover:text-[#137fec] hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
              title="Informasi Penting"
            >
              <span class="material-symbols-outlined">notifications</span>
              <span
                v-if="hasUnreadInfo"
                class="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border border-white dark:border-[#1e293b]"
              ></span>
            </button>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-6 md:p-8 w-full scroll-smooth">
         <div class="max-w-[1600px] mx-auto h-full flex flex-col">
            <router-view />
            <!-- Spacing footer -->
            <div class="h-8 shrink-0"></div>
         </div>
      </main>
    </div>
    
    <!-- Admin Info Modal -->
    <AdminInfoModal
      :show="showInfoModal"
      @close="handleInfoModalClose"
      @dont-show-today="handleDontShowToday"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { safeArrayMethod } from '../utils/array-helpers';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useSystemStatus } from '../composables/useSystemStatus';
import AdminInfoModal from '../components/AdminInfoModal.vue';
import api from '../api';

const route = useRoute();
const authStore = useAuthStore();
const { isOnline, currentTime, outletName, branchName } = useSystemStatus();

const sidebarOpen = ref(false);
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024);
const showInfoModal = ref(false);
const hasUnreadInfo = ref(false);
// Use internal ref that we control, and expose via computed property that always returns array
const _activeAddons = ref<any[]>([]);

// Helper function to always get a valid array from activeAddons
// GUARD CLAUSE: Triple-check untuk memastikan selalu array
const getActiveAddons = (): any[] => {
  try {
    const value = _activeAddons.value;
    
    // LOGGING: Log untuk debugging jika value tidak valid
    if (value !== null && value !== undefined && !Array.isArray(value)) {
      console.warn('[TenantLayout] getActiveAddons: Value is not array, type:', typeof value, 'value:', value);
    }
    
    if (value === null || value === undefined || !Array.isArray(value)) {
      // AUTO-FIX: Auto-fix if not array
      _activeAddons.value = [];
      return [];
    }
    // Double-check: ensure it's really an array
    if (!Array.isArray(value)) {
      _activeAddons.value = [];
      return [];
    }
    return value;
  } catch (error) {
    console.error('[TenantLayout] Error in getActiveAddons:', error);
    _activeAddons.value = [];
    return [];
  }
};

// Helper function to safely set activeAddons (always ensures it's an array)
// NORMALISASI DATA: Setiap data yang masuk akan dinormalisasi menjadi array
const setActiveAddons = (value: any): void => {
  try {
    // LOGGING untuk debugging - log tipe dan isi data yang masuk
    console.log('[TenantLayout] setActiveAddons called with:', {
      type: typeof value,
      isArray: Array.isArray(value),
      value: value,
      hasData: value?.data ? 'yes' : 'no',
      hasAddons: value?.addons ? 'yes' : 'no'
    });
    
    // NORMALISASI: Pastikan selalu array
    if (Array.isArray(value)) {
      _activeAddons.value = value;
      console.log('[TenantLayout] setActiveAddons: Set as array, length:', value.length);
      return;
    }
    if (value && typeof value === 'object') {
      if (Array.isArray(value.data)) {
        _activeAddons.value = value.data;
        console.log('[TenantLayout] setActiveAddons: Extracted from value.data, length:', value.data.length);
        return;
      }
      if (Array.isArray(value.addons)) {
        _activeAddons.value = value.addons;
        console.log('[TenantLayout] setActiveAddons: Extracted from value.addons, length:', value.addons.length);
        return;
      }
    }
    // FALLBACK: Jika tidak valid, set ke array kosong
    _activeAddons.value = [];
    console.log('[TenantLayout] setActiveAddons: Invalid data, set to empty array');
  } catch (error) {
    console.error('[TenantLayout] Error in setActiveAddons:', error);
    _activeAddons.value = [];
  }
};


// Computed property that always returns an array (safer than direct ref access)
const activeAddons = computed({
  get: (): any[] => {
    const result = getActiveAddons();
    // Triple-check: ensure computed property always returns array
    if (!Array.isArray(result)) {
      _activeAddons.value = [];
      return [];
    }
    return result;
  },
  set: (value: any) => setActiveAddons(value)
});

const currentSubscription = ref<any>(null);

const hasBusinessAnalytics = computed(() => {
  try {
    // TRIPLE GUARD: Check directly on value before calling any methods
    const addonsToCheck = activeAddons.value;
    if (!addonsToCheck || !Array.isArray(addonsToCheck)) {
      console.warn('[TenantLayout hasBusinessAnalytics] activeAddons is not valid:', {
        type: typeof addonsToCheck,
        isArray: Array.isArray(addonsToCheck),
        value: addonsToCheck
      });
      return false;
    }
    
    // Use safe wrapper as additional layer
    return safeArrayMethod(
      addonsToCheck,
      (addons) => {
        try {
          // Final check inside
          if (!Array.isArray(addons)) return false;
          return addons.some(
            (addon: any) => addon && addon.addonType === 'BUSINESS_ANALYTICS' && addon.status === 'active'
          );
        } catch (error) {
          console.error('Error in hasBusinessAnalytics .some():', error);
          return false;
        }
      },
      false
    );
  } catch (error) {
    console.error('[TenantLayout hasBusinessAnalytics] Outer error:', error);
    return false;
  }
});

const hasDeliveryMarketing = computed(() => {
  try {
    // TRIPLE GUARD: Check directly on value before calling any methods
    const addonsToCheck = activeAddons.value;
    if (!addonsToCheck || !Array.isArray(addonsToCheck)) {
      console.warn('[TenantLayout hasDeliveryMarketing] activeAddons is not valid:', {
        type: typeof addonsToCheck,
        isArray: Array.isArray(addonsToCheck),
        value: addonsToCheck
      });
      return false;
    }
    
    // Use safe wrapper as additional layer
    return safeArrayMethod(
      addonsToCheck,
      (addons) => {
        try {
          // Final check inside
          if (!Array.isArray(addons)) return false;
          return addons.some(
            (addon: any) => addon && addon.addonType === 'DELIVERY_MARKETING' && addon.status === 'active'
          );
        } catch (error) {
          console.error('Error in hasDeliveryMarketing .some():', error);
          return false;
        }
      },
      false
    );
  } catch (error) {
    console.error('[TenantLayout hasDeliveryMarketing] Outer error:', error);
    return false;
  }
});

// Check if user has access to Inventory Management (PRO/ENTERPRISE only)
const hasInventoryAccess = computed(() => {
  if (!authStore.user || authStore.user.role !== 'ADMIN_TENANT') {
    return false;
  }
  
  const plan = currentSubscription.value?.plan || 'BASIC';
  // PRO and ENTERPRISE have access to 'manajemen-stok'
  return plan === 'PRO' || plan === 'ENTERPRISE';
});

// Menu expand/collapse state - semua tertutup saat login
const expandedMenus = ref({
  operasional: false,
  laporan: false,
  marketing: false,
  inventory: false,
  manajemen: false,
  pengaturan: false,
});

// Toggle menu section - close other menus when opening one
const toggleMenu = (menuKey: keyof typeof expandedMenus.value) => {
  const isCurrentlyOpen = expandedMenus.value[menuKey];
  
  // If clicking to open, close all other menus first
  if (!isCurrentlyOpen) {
    Object.keys(expandedMenus.value).forEach(key => {
      if (key !== menuKey) {
        expandedMenus.value[key as keyof typeof expandedMenus.value] = false;
      }
    });
  }
  
  // Toggle the clicked menu
  expandedMenus.value[menuKey] = !isCurrentlyOpen;
  
  // Save to localStorage
  localStorage.setItem('expandedMenus', JSON.stringify(expandedMenus.value));
};

// Auto-expand menu based on current route
const autoExpandMenu = () => {
  const currentPath = route.path;
  
  // Check which section contains the current route
  if (currentPath.includes('/dashboard') || currentPath.includes('/products') || 
      currentPath.includes('/orders') || currentPath.includes('/customers')) {
    expandedMenus.value.operasional = true;
  }
  
  if (currentPath.includes('/reports') || currentPath.includes('/analytics') || 
      currentPath.includes('/finance') || currentPath.includes('/profit-loss')) {
    expandedMenus.value.laporan = true;
  }
  
  if (currentPath.includes('/marketing') || currentPath.includes('/delivery')) {
    expandedMenus.value.marketing = true;
  }
  
  if (currentPath.includes('/inventory')) {
    expandedMenus.value.inventory = true;
  }
  
  if (currentPath.includes('/users') || currentPath.includes('/stores') || 
      currentPath.includes('/discounts')) {
    expandedMenus.value.manajemen = true;
  }
  
  if (currentPath.includes('/subscription') || currentPath.includes('/addons') || 
      currentPath.includes('/settings')) {
    expandedMenus.value.pengaturan = true;
  }
};

// Load saved menu state from localStorage
const loadMenuState = () => {
  // Jangan load dari localStorage - selalu mulai dengan semua tertutup
  // Auto-expand based on current route (hanya untuk menu yang sesuai route)
  autoExpandMenu();
};

// Check if info modal should be shown (once per day)
const checkShouldShowInfo = () => {
  if (authStore.user?.role !== 'ADMIN_TENANT') {
    return false;
  }
  
  const lastShownDate = localStorage.getItem('adminInfoLastShown');
  const today = new Date().toDateString();
  
  if (lastShownDate !== today) {
    return true;
  }
  
  return false;
};

// Check for unread info (show badge if not shown today)
const checkUnreadInfo = () => {
  if (authStore.user?.role !== 'ADMIN_TENANT') {
    hasUnreadInfo.value = false;
    return;
  }
  
  const lastShownDate = localStorage.getItem('adminInfoLastShown');
  const today = new Date().toDateString();
  
  hasUnreadInfo.value = lastShownDate !== today;
};

const handleInfoModalClose = () => {
  // Save today's date when modal is closed (so it won't show again today)
  const today = new Date().toDateString();
  localStorage.setItem('adminInfoLastShown', today);
  hasUnreadInfo.value = false;
  showInfoModal.value = false;
};

const handleDontShowToday = () => {
  // Same as close - save today's date
  handleInfoModalClose();
};

// Load active addons
const loadAddons = async () => {
  if (authStore.user?.role === 'ADMIN_TENANT') {
    try {
      const response = await api.get('/addons');
      
      // LOGGING: Log response structure untuk debugging
      console.log('[TenantLayout] loadAddons - API Response:', {
        type: typeof response?.data,
        isArray: Array.isArray(response?.data),
        hasData: response?.data?.data ? 'yes' : 'no',
        hasAddons: response?.data?.addons ? 'yes' : 'no',
        data: response?.data
      });
      
      // NORMALISASI: Use helper function to safely set (always ensures array)
      setActiveAddons(response.data);
    } catch (error) {
      console.error('[TenantLayout] Failed to load addons:', error);
      // FALLBACK: Set ke array kosong jika error
      setActiveAddons([]);
    }
    
    // GUARD CLAUSE: Final validation using helper function
    getActiveAddons(); // This will auto-fix if needed
  }
};

// Load current subscription to check plan features
const loadSubscription = async () => {
  if (authStore.user?.role === 'ADMIN_TENANT') {
    try {
      const response = await api.get('/subscriptions/current');
      if (response.data) {
        currentSubscription.value = response.data;
        // Use plan from subscription response
        if (response.data.plan) {
          currentSubscription.value.plan = response.data.plan;
        } else if (response.data.subscription?.plan) {
          currentSubscription.value.plan = response.data.subscription.plan;
        } else if (response.data.subscriptionPlan) {
          currentSubscription.value.plan = response.data.subscriptionPlan;
        } else {
          // Fallback to tenant subscriptionPlan if available
          if ((authStore.user as any).tenantSubscriptionPlan) {
            currentSubscription.value.plan = (authStore.user as any).tenantSubscriptionPlan;
          } else {
            currentSubscription.value.plan = 'BASIC';
          }
        }
      }
    } catch (error) {
      console.error('Failed to load subscription:', error);
      // Default to BASIC if subscription load fails
      currentSubscription.value = { plan: 'BASIC' };
    }
  }
};

// Watch for role changes to check info status
watch(() => authStore.user?.role, () => {
  checkUnreadInfo();
  if (checkShouldShowInfo()) {
    showInfoModal.value = true;
  }
  loadAddons();
  loadSubscription();
}, { immediate: true });

// Watch route changes to auto-expand menu
watch(() => route.path, () => {
  autoExpandMenu();
}, { immediate: true });

// Watch activeAddons to ensure it's always valid array
// This prevents "B.value.some is not a function" error when data is loading
watch(
  () => _activeAddons.value,
  (newVal) => {
    // GUARD: Ensure value is always an array
    if (!Array.isArray(newVal)) {
      console.warn('[TenantLayout Watch] activeAddons is not array, fixing:', {
        type: typeof newVal,
        value: newVal
      });
      _activeAddons.value = [];
    }
  },
  { deep: true, immediate: true }
);

// Load menu state on mount
onMounted(() => {
  loadMenuState();
});

const userName = computed(() => authStore.user?.name || 'Tenant');
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
    '/app/products': 'Produk',
    '/app/orders': 'Pesanan',
    '/app/customers': 'Pelanggan',
    '/app/reports': 'Laporan',
    '/app/users': 'Pengguna',
    '/app/subscription': 'Berlangganan',
    '/app/addons': 'Addon',
    '/app/discounts': 'Diskon',
    '/app/settings/store': 'Pengaturan Toko',
    '/app/analytics': 'Advanced Analytics',
    '/app/finance': 'Keuangan',
    '/app/profit-loss': 'Laporan Laba Rugi',
    '/app/reports/advanced': 'Advanced Reporting',
    '/app/finance/management': 'Financial Management',
  };
  return titles[route.path] || 'Dashboard';
});

// Search functionality
const searchQuery = ref('');
const handleGlobalSearch = () => {
  if (!searchQuery.value) return;
  // TODO: Implement global search navigation or filtered view
  console.log('Searching for:', searchQuery.value);
  // For now, redirect to relevant page based on keyword if possible
  if (searchQuery.value.toLowerCase().includes('produk') || searchQuery.value.toLowerCase().includes('product')) {
    router.push('/app/products');
  } else if (searchQuery.value.toLowerCase().includes('order') || searchQuery.value.toLowerCase().includes('pesan')) {
    router.push('/app/orders');
  } else if (searchQuery.value.toLowerCase().includes('cust') || searchQuery.value.toLowerCase().includes('pelanggan')) {
    router.push('/app/customers');
  }
};

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
  authStore.clearAuth();
  window.location.replace('/login');
};

onMounted(() => {
  windowWidth.value = window.innerWidth;
  // Initialize responsive state correctly
  if (windowWidth.value >= 1024) {
    sidebarOpen.value = true;
  } else {
    sidebarOpen.value = false;
  }
  
  if (checkShouldShowInfo()) {
    showInfoModal.value = true;
  }
  checkUnreadInfo();
  
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
/* Custom Scrollbar */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
.icon-filled {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
