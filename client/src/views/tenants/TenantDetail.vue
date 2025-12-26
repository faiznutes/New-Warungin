<template>
    <div class="bg-[#f6f7f8] dark:bg-[#101922] min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-display">
    <div class="max-w-[1600px] mx-auto space-y-6">
      
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#137fec]"></div>
        <p class="mt-4 text-[#4c739a] dark:text-slate-400 font-medium">Memuat detail tenant...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="hasError" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
        <span class="material-symbols-outlined text-4xl text-red-500 mb-2">error</span>
        <h3 class="text-lg font-bold text-red-800 dark:text-red-200 mb-2">Terjadi Kesalahan</h3>
        <p class="text-red-600 dark:text-red-300 mb-4">{{ errorMessage }}</p>
        <button 
          @click="retryLoad" 
          class="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium flex items-center gap-2 mx-auto"
        >
          <span class="material-symbols-outlined text-[18px]">refresh</span>
          Coba Lagi
        </button>
      </div>

      <div v-else class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <button 
              @click="handleBackToTenants" 
              class="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-[#137fec] text-[#4c739a] dark:text-slate-400 hover:text-[#137fec] transition-all shadow-sm group"
            >
              <span class="material-symbols-outlined group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
            </button>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
                  {{ tenant?.subscriptionPlan || 'UNKNOWN' }}
                </span>
                <span 
                  class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                  :class="tenant?.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'"
                >
                  <span class="material-symbols-outlined text-[10px] icon-filled">{{ tenant?.isActive ? 'check_circle' : 'cancel' }}</span>
                  {{ tenant?.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <h1 class="text-2xl font-bold text-[#0d141b] dark:text-white leading-tight flex items-center gap-2">
                {{ tenant?.name }}
                <span class="material-symbols-outlined text-blue-500 icon-filled text-[20px]" v-if="tenant?.isActive">verified</span>
              </h1>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
             <button 
                @click="loadTenantDetail"
                class="px-4 py-2 bg-white dark:bg-slate-800 text-[#4c739a] dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition font-bold text-sm flex items-center gap-2"
              >
                <span class="material-symbols-outlined text-[18px]">refresh</span>
                Refresh
              </button>
          </div>
        </div>

        <!-- Info Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Tenant Profile -->
          <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 lg:col-span-1">
             <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold text-[#0d141b] dark:text-white flex items-center gap-2">
                   <span class="material-symbols-outlined text-[#137fec]">store</span>
                   Profil Tenant
                </h3>
             </div>
             
             <div class="space-y-4">
                <div class="flex items-start gap-4 p-3 bg-[#f8fafc] dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700/50">
                   <div class="bg-white dark:bg-slate-700 p-2 rounded-xl shadow-sm text-blue-600">
                      <span class="material-symbols-outlined">person</span>
                   </div>
                   <div>
                      <p class="text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-0.5">Owner Name</p>
                      <p class="font-bold text-[#0d141b] dark:text-white">{{ tenant?.name }}</p>
                   </div>
                </div>
                
                <div class="flex items-start gap-4 p-3 bg-[#f8fafc] dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700/50">
                   <div class="bg-white dark:bg-slate-700 p-2 rounded-xl shadow-sm text-blue-600">
                      <span class="material-symbols-outlined">mail</span>
                   </div>
                   <div>
                      <p class="text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-0.5">Email</p>
                      <p class="font-bold text-[#0d141b] dark:text-white break-all">{{ tenant?.email }}</p>
                   </div>
                </div>

                <div class="flex items-start gap-4 p-3 bg-[#f8fafc] dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700/50">
                   <div class="bg-white dark:bg-slate-700 p-2 rounded-xl shadow-sm text-blue-600">
                      <span class="material-symbols-outlined">call</span>
                   </div>
                   <div>
                      <p class="text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-0.5">Phone</p>
                      <p class="font-bold text-[#0d141b] dark:text-white">{{ tenant?.phone || '-' }}</p>
                   </div>
                </div>
             </div>
          </div>

          <!-- Subscription Status -->
          <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 lg:col-span-2 flex flex-col">
             <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-bold text-[#0d141b] dark:text-white flex items-center gap-2">
                   <span class="material-symbols-outlined text-[#137fec]">card_membership</span>
                   Langganan Aktif
                </h3>
                <div class="flex items-center gap-2">
                   <div class="flex items-start flex-col gap-1">
                      <div class="flex items-center gap-2">
                         <span class="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs uppercase border border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                           {{ getPlanName(subscription?.plan || tenant?.subscriptionPlan || 'basic') }}
                         </span>
                         <span class="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs border border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600">
                           {{ subscription ? getSubscriptionDuration(subscription) : 0 }} Hari
                         </span>
                      </div>
                      <div class="flex text-xs gap-3 mt-1 text-[#4c739a] dark:text-slate-400 font-medium">
                         <span>Mulai: {{ subscription?.startDate ? formatDate(subscription.startDate) : '-' }}</span>
                         <span>•</span>
                         <span>Berakhir: {{ subscription?.endDate ? formatDate(subscription.endDate) : '-' }}</span>
                      </div>
                   </div>
                </div>
              <p v-if="(subscription as any)?.isTemporaryUpgrade && !subscription?.isExpired && (tenant?.subscriptionPlan || subscription?.plan || 'BASIC') !== 'BASIC'" class="text-xs text-[#4c739a] mt-2">
                ⏰ Upgrade sementara - akan kembali ke BASIC setelah durasi berakhir
              </p>
            </div>
          </div>

          <!-- Active Addons Card -->
          <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-bold text-[#0d141b] dark:text-white flex items-center gap-2">
                 <span class="material-symbols-outlined text-[#137fec]">extension</span>
                 Addon Aktif
              </h3>
              <button
                @click="showAddAddonModal = true"
                class="px-4 py-2 bg-[#137fec] text-white rounded-xl hover:bg-blue-600 transition font-bold text-sm shadow-lg shadow-blue-500/30 flex items-center gap-2"
              >
                <span class="material-symbols-outlined text-[18px]">add</span>
                Tambah Addon
              </button>
            </div>
            
            <div v-if="activeAddons.length === 0" class="text-center py-12 bg-slate-50 dark:bg-slate-700/30 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
              <span class="material-symbols-outlined text-4xl text-slate-300 mb-2">extension_off</span>
              <p class="text-[#4c739a] dark:text-slate-400 font-medium">No active addons</p>
            </div>
            
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="addon in filteredActiveAddons"
                :key="addon.id"
                class="bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-blue-300 dark:hover:border-blue-700 transition group"
              >
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <h4 class="font-bold text-[#0d141b] dark:text-white mb-1">{{ addon.addonName }}</h4>
                    <p class="text-xs text-[#4c739a] dark:text-slate-400 line-clamp-2">{{ getAddonDescription(addon) || 'No description' }}</p>
                  </div>
                  <span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100 rounded">Active</span>
                </div>

                <div v-if="addon.limit" class="mb-4 bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                  <div class="flex items-center justify-between text-xs mb-1.5">
                    <span class="text-[#4c739a] font-bold">Penggunaan</span>
                    <span class="font-bold" :class="addon.isLimitReached ? 'text-red-500' : 'text-[#0d141b] dark:text-white'">
                      {{ addon.currentUsage }} / {{ addon.limit }}
                    </span>
                  </div>
                  <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      class="h-1.5 rounded-full transition-all duration-500"
                      :class="addon.isLimitReached ? 'bg-red-500' : 'bg-blue-500'"
                      :style="{ width: `${Math.min(100, ((addon.currentUsage || 0) / (addon.limit || 1)) * 100)}%` }"
                    ></div>
                  </div>
                </div>

                <div class="flex items-center justify-between text-xs mb-4 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                   <div>
                      <p class="text-[10px] text-[#4c739a] uppercase font-bold tracking-wider">Berakhir</p>
                      <p class="font-bold text-[#0d141b] dark:text-white">{{ addon.expiresAt ? formatDate(addon.expiresAt) : '-' }}</p>
                   </div>
                   <div class="text-right">
                      <p class="text-[10px] text-[#4c739a] uppercase font-bold tracking-wider">Sisa</p>
                      <p 
                        class="font-bold"
                        :class="getAddonDaysRemaining(addon) <= 7 ? 'text-red-500' : getAddonDaysRemaining(addon) <= 30 ? 'text-amber-500' : 'text-emerald-500'"
                      >
                         {{ getAddonDaysRemaining(addon) }} hari
                      </p>
                   </div>
                </div>

                <div class="flex gap-2">
                  <button
                    @click="reduceAddon(addon)"
                     class="flex-1 px-3 py-2 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-xl transition border border-amber-100"
                  >
                    Kurangi
                  </button>
                  <button
                    @click="extendAddon(addon)"
                    class="flex-1 px-3 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition border border-blue-100"
                  >
                    Perpanjang
                  </button>
                  <button
                    @click="unsubscribeAddon(addon)"
                    class="px-3 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition border border-red-100"
                    title="Nonaktifkan"
                  >
                    <span class="material-symbols-outlined text-[16px]">power_settings_new</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <!-- Reward Points Card -->
          <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-bold text-[#0d141b] dark:text-white flex items-center gap-2">
                 <span class="material-symbols-outlined text-[#137fec]">stars</span>
                 Reward Points
              </h3>
              <button
                @click="showEditPointsModal = true"
                class="px-4 py-2 bg-slate-100 text-[#4c739a] border border-slate-200 rounded-xl hover:bg-slate-200 transition font-bold text-sm flex items-center gap-2"
              >
                <span class="material-symbols-outlined text-[18px]">edit</span>
                Edit Point
              </button>
            </div>
            
            <div v-if="loadingPoints" class="flex items-center justify-center py-12">
               <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#137fec]"></div>
            </div>
            
            <div v-else class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                  <label class="block text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Point Saat Ini</label>
                  <p class="text-2xl font-extrabold text-blue-700 dark:text-blue-300">{{ tenantPoints?.currentPoints || 0 }}</p>
                </div>
                <div class="bg-emerald-50 dark:bg-emerald-900/10 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800">
                  <label class="block text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Total Diperoleh</label>
                  <p class="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">{{ tenantPoints?.totalEarned || 0 }}</p>
                </div>
                <div class="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-100 dark:border-amber-800">
                  <label class="block text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Total Digunakan</label>
                  <p class="text-2xl font-extrabold text-amber-700 dark:text-amber-300">{{ tenantPoints?.totalSpent || 0 }}</p>
                </div>
              </div>
              
              <div>
                <h4 class="text-sm font-bold text-[#0d141b] dark:text-white mb-3">Riwayat Point</h4>
                <div v-if="pointTransactions.length === 0" class="text-center py-8 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p class="text-[#4c739a] dark:text-slate-400 font-medium">Belum ada transaksi point</p>
                </div>
                <div v-else class="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                  <div
                    v-for="transaction in pointTransactions"
                    :key="transaction.id"
                    class="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl hover:border-blue-200 dark:hover:border-blue-700 transition"
                  >
                    <div class="flex-1">
                      <p class="font-bold text-[#0d141b] dark:text-white text-sm line-clamp-1">{{ transaction.description }}</p>
                      <p class="text-xs text-[#4c739a] mt-0.5">{{ formatDate(transaction.createdAt) }}</p>
                    </div>
                    <span
                      class="font-bold text-sm ml-4 px-2 py-1 rounded-md"
                      :class="[
                        transaction.amount > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                      ]"
                    >
                      {{ transaction.amount > 0 ? '+' : '' }}{{ transaction.amount }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Users Card -->
          <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h3 class="text-lg font-bold text-[#0d141b] dark:text-white flex items-center gap-2">
                   <span class="material-symbols-outlined text-[#137fec]">group</span>
                   Pengguna Tenant
                </h3>
                <p v-if="userUsage" class="text-xs text-[#4c739a] dark:text-slate-400 mt-1 font-medium">
                  Used: {{ userUsage.currentUsage }} / {{ userUsage.limit === -1 ? 'Unlimited' : userUsage.limit }}
                  <span v-if="userUsage.limit !== -1" :class="userUsage.currentUsage >= userUsage.limit ? 'text-red-500' : 'text-emerald-500'">
                    ({{ userUsage.limit - userUsage.currentUsage }} available)
                  </span>
                </p>
              </div>
              <button
                @click="showCreateUserModal = true"
                class="px-4 py-2 bg-[#137fec] text-white rounded-xl hover:bg-blue-600 transition font-bold text-sm shadow-lg shadow-blue-500/30 flex items-center gap-2"
              >
                <span class="material-symbols-outlined text-[18px]">person_add</span>
                User Baru
              </button>
            </div>
            
            <div v-if="loadingUsers" class="flex items-center justify-center py-12">
               <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#137fec]"></div>
            </div>
            
            <div v-else-if="tenantUsers.length === 0" class="text-center py-12 bg-slate-50 dark:bg-slate-700/30 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
               <span class="material-symbols-outlined text-4xl text-slate-300 mb-2">group_off</span>
               <p class="text-[#4c739a] dark:text-slate-400 font-medium">Belum ada pengguna</p>
            </div>
            
            <template v-else>
              <!-- Bulk Actions -->
              <div v-if="Array.isArray(selectedUsers) && selectedUsers.length > 0" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 mb-4 flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <span class="text-sm font-bold text-blue-700 dark:text-blue-300">
                    {{ selectedUsers.length }} terpilih
                  </span>
                  <div class="flex gap-2">
                     <button
                       v-if="selectedUsers.some(u => !u.isActive)"
                       @click="bulkActivateUsers"
                       class="px-3 py-1.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition text-xs font-bold shadow-sm"
                     >
                       Aktifkan ({{ selectedUsers.filter(u => !u.isActive).length }})
                     </button>
                     <button
                       v-if="selectedUsers.some(u => u.isActive)"
                       @click="bulkDeactivateUsers"
                       class="px-3 py-1.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition text-xs font-bold shadow-sm"
                     >
                       Nonaktifkan ({{ selectedUsers.filter(u => u.isActive).length }})
                     </button>
                  </div>
                </div>
                <button
                  @click="selectedUsers = []"
                  class="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Batal
                </button>
              </div>
              
              <div class="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl">
                 <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead class="bg-slate-50 dark:bg-slate-800">
                       <tr>
                          <th class="px-4 py-3 text-left w-10">
                             <input
                               type="checkbox"
                               :checked="Array.isArray(selectedUsers) && Array.isArray(tenantUsers) && selectedUsers.length === tenantUsers.length && tenantUsers.length > 0"
                               @change="toggleSelectAllUsers"
                               class="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                             />
                          </th>
                          <th class="px-4 py-3 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Nama</th>
                          <th class="px-4 py-3 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Email</th>
                          <th class="px-4 py-3 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Role</th>
                          <th class="px-4 py-3 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Status</th>
                          <th class="px-4 py-3 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Last Login</th>
                          <th class="px-4 py-3 text-right text-xs font-bold text-[#4c739a] uppercase tracking-wider">Aksi</th>
                       </tr>
                    </thead>
                    <tbody class="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                       <tr v-for="user in tenantUsers" :key="user.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors" :class="{ 'bg-blue-50/50 dark:bg-blue-900/10': isUserSelected(user.id) }">
                          <td class="px-4 py-3">
                             <input
                               type="checkbox"
                               :checked="isUserSelected(user.id)"
                               @change="toggleUserSelection(user)"
                               class="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                             />
                          </td>
                          <td class="px-4 py-3">
                             <div class="text-sm font-bold text-[#0d141b] dark:text-white">{{ user.name }}</div>
                          </td>
                          <td class="px-4 py-3">
                             <div class="text-sm text-[#4c739a] dark:text-slate-400">{{ user.email }}</div>
                          </td>
                          <td class="px-4 py-3">
                             <span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border" :class="getRoleClass(user.role)">
                                {{ getRoleLabel(user.role) }}
                             </span>
                          </td>
                          <td class="px-4 py-3">
                             <span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border" :class="user.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'">
                                {{ user.isActive ? 'Aktif' : 'Nonaktif' }}
                             </span>
                          </td>
                          <td class="px-4 py-3">
                             <div class="text-xs text-[#4c739a] dark:text-slate-400">{{ user.lastLogin ? formatDate(user.lastLogin) : '-' }}</div>
                          </td>
                          <td class="px-4 py-3 text-right">
                             <button @click="editUser(user)" class="p-1 text-[#4c739a] hover:text-[#137fec] transition rounded group">
                                <span class="material-symbols-outlined text-[20px] group-hover:scale-110">edit</span>
                             </button>
                          </td>
                       </tr>
                    </tbody>
                 </table>
              </div>
            </template>
          </div>
          <!-- Stores Card -->
          <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h3 class="text-lg font-bold text-[#0d141b] dark:text-white flex items-center gap-2">
                   <span class="material-symbols-outlined text-[#137fec]">storefront</span>
                   Store / Outlet
                </h3>
                <p v-if="outletUsage" class="text-xs text-[#4c739a] dark:text-slate-400 mt-1 font-medium">
                  Used: {{ outletUsage.currentUsage }} / {{ outletUsage.limit === -1 ? 'Unlimited' : outletUsage.limit }}
                  <span v-if="outletUsage.limit !== -1" :class="outletUsage.currentUsage >= outletUsage.limit ? 'text-red-500' : 'text-emerald-500'">
                    ({{ outletUsage.limit - outletUsage.currentUsage }} available)
                  </span>
                </p>
              </div>
              <button
                @click="showCreateStoreModal = true"
                class="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-bold text-sm shadow-lg shadow-emerald-500/30 flex items-center gap-2"
              >
                <span class="material-symbols-outlined text-[18px]">add_business</span>
                Buat Toko
              </button>
            </div>

            <div v-if="outletUsage && outletUsage.limit !== undefined && outletUsage.limit !== -1" class="mb-6 bg-blue-50 dark:bg-slate-700/30 border border-blue-100 dark:border-slate-600 rounded-xl p-4">
              <div class="flex items-center justify-between mb-2">
                 <p class="font-bold text-blue-800 dark:text-blue-300 text-sm">Limit Outlet Usage</p>
                 <span class="text-blue-600 dark:text-blue-400 text-xs font-bold">{{ Math.round(((outletUsage.currentUsage || 0) / outletUsage.limit) * 100) }}%</span>
              </div>
              <div class="w-full bg-blue-200 dark:bg-slate-600 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-500"
                  :class="(outletUsage.currentUsage || 0) >= outletUsage.limit ? 'bg-red-500' : (outletUsage.currentUsage || 0) >= (outletUsage.limit * 0.8) ? 'bg-amber-500' : 'bg-blue-600'"
                  :style="{ width: `${Math.min(100, ((outletUsage.currentUsage || 0) / outletUsage.limit) * 100)}%` }"
                ></div>
              </div>
            </div>

            <div v-if="loadingStores" class="flex items-center justify-center py-12">
               <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#137fec]"></div>
            </div>
            
            <div v-else-if="tenantStores.length === 0" class="text-center py-12 bg-slate-50 dark:bg-slate-700/30 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
               <span class="material-symbols-outlined text-4xl text-slate-300 mb-2">store_off</span>
               <p class="text-[#4c739a] dark:text-slate-400 font-medium">Belum ada store</p>
            </div>
            
            <div v-else class="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl">
               <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead class="bg-slate-50 dark:bg-slate-800">
                     <tr>
                        <th class="px-4 py-3 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Nama</th>
                        <th class="px-4 py-3 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Alamat</th>
                        <th class="px-4 py-3 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Telepon</th>
                        <th class="px-4 py-3 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Status</th>
                        <th class="px-4 py-3 text-right text-xs font-bold text-[#4c739a] uppercase tracking-wider">Aksi</th>
                     </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                     <tr v-for="store in tenantStores" :key="store.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td class="px-4 py-3">
                           <div class="text-sm font-bold text-[#0d141b] dark:text-white">{{ store.name }}</div>
                        </td>
                        <td class="px-4 py-3">
                           <div class="text-sm text-[#4c739a] dark:text-slate-400 line-clamp-1">{{ store.address || '-' }}</div>
                        </td>
                        <td class="px-4 py-3">
                           <div class="text-sm text-[#4c739a] dark:text-slate-400">{{ store.phone || '-' }}</div>
                        </td>
                        <td class="px-4 py-3">
                           <span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border" :class="store.isActive !== false ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'">
                              {{ store.isActive !== false ? 'Aktif' : 'Nonaktif' }}
                           </span>
                        </td>
                        <td class="px-4 py-3 text-right">
                           <button 
                             @click="toggleStoreStatus(store)" 
                             class="text-xs font-bold hover:underline transition"
                             :class="store.isActive !== false ? 'text-orange-600' : 'text-emerald-600'"
                           >
                             {{ store.isActive !== false ? 'Nonaktifkan' : 'Aktifkan' }}
                           </button>
                        </td>
                     </tr>
                  </tbody>
               </table>
            </div>
          </div>

          <!-- Available Addons Card -->
          <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 lg:col-span-3">
             <h3 class="text-lg font-bold text-[#0d141b] dark:text-white mb-6 flex items-center gap-2">
                <span class="material-symbols-outlined text-[#137fec]">shopping_bag</span>
                Addon Tersedia
             </h3>
             
            <div v-if="filteredAvailableAddons.length === 0" class="text-center py-12 bg-slate-50 dark:bg-slate-700/30 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
               <span class="material-symbols-outlined text-4xl text-slate-300 mb-2">check_circle</span>
               <p class="text-[#4c739a] dark:text-slate-400 font-medium">Semua addon sudah aktif</p>
            </div>
            
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="addon in filteredAvailableAddons"
                :key="addon.id"
                class="border rounded-xl p-5 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all group flex flex-col h-full bg-white dark:bg-slate-800"
                :class="addon.comingSoon || addon.requiresApi ? 'border-slate-200 bg-slate-50 opacity-75' : 'border-slate-200 dark:border-slate-700'"
              >
                <div class="flex items-start justify-between mb-2">
                   <div class="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform mb-2">
                      <span class="material-symbols-outlined">{{ addon.comingSoon ? 'hourglass_top' : 'extension' }}</span>
                   </div>
                   <span v-if="addon.comingSoon || addon.requiresApi" class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100 rounded">Coming Soon</span>
                </div>
                
                <h4 class="font-bold text-[#0d141b] dark:text-white text-lg mb-1">{{ addon.name }}</h4>
                <p class="text-sm text-[#4c739a] dark:text-slate-400 mb-4 flex-1">{{ addon.description }}</p>
                
                <div class="mt-auto">
                   <div class="flex items-end gap-1 mb-4">
                      <span class="text-xl font-extrabold text-[#137fec]">{{ formatCurrency(addon.price) }}</span>
                      <span class="text-xs text-[#4c739a] mb-1 font-medium">/bulan</span>
                   </div>
                   
                   <button
                     v-if="!addon.comingSoon && !addon.requiresApi"
                     @click="subscribeAddon(addon)"
                     class="w-full px-4 py-2.5 bg-[#137fec] text-white rounded-xl hover:bg-blue-600 transition font-bold text-sm shadow-md shadow-blue-500/20"
                   >
                     Berlangganan
                   </button>
                   <button
                     v-else
                     disabled
                     class="w-full px-4 py-2.5 bg-slate-200 text-slate-500 rounded-xl cursor-not-allowed font-bold text-sm"
                   >
                     Segera Hadir
                   </button>
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
    <!-- Edit Plan Modal -->
    <Teleport to="body">
      <div v-if="showEditPlanModal" class="fixed inset-0 bg-[#0d141b]/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" @click.self="showEditPlanModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
           <h3 class="text-xl font-bold text-[#0d141b] dark:text-white mb-4">Edit Paket Langganan</h3>
           <div class="space-y-4">
              <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                 <p class="text-sm font-medium text-blue-900 dark:text-blue-100">Packet Saat Ini: {{ getPlanName(subscription?.plan || tenant?.subscriptionPlan || 'BASIC') }}</p>
              </div>
              <div>
                 <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Pilih Paket Baru</label>
                 <select v-model="planForm.subscriptionPlan" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#137fec] outline-none font-medium">
                    <option value="BASIC">Starter (BASIC)</option>
                    <option value="PRO">Boost (PRO)</option>
                    <option value="ENTERPRISE">Max (ENTERPRISE)</option>
                 </select>
              </div>
              <div>
                 <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Durasi (Hari)</label>
                 <input v-model.number="planForm.durationDays" type="number" min="1" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#137fec] outline-none font-medium" />
              </div>
              <div class="flex gap-3 pt-2">
                 <button @click="showEditPlanModal = false" class="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition">Batal</button>
                 <button @click="handleEditPlan" class="flex-1 px-4 py-2.5 bg-[#137fec] text-white rounded-xl font-bold hover:bg-blue-600 transition shadow-lg shadow-blue-500/30">Simpan</button>
              </div>
           </div>
        </div>
      </div>
    </Teleport>
    <!-- Reduce Subscription Modal -->
    <Teleport to="body">
       <div v-if="showReduceSubscriptionModal" class="fixed inset-0 bg-[#0d141b]/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" @click.self="showReduceSubscriptionModal = false">
          <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-700">
             <h3 class="text-xl font-bold text-[#0d141b] dark:text-white mb-4">Kurangi Durasi Langganan</h3>
             <div class="space-y-4">
                <div>
                   <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Potong Durasi (Hari)</label>
                   <input v-model.number="reduceSubscriptionDays" type="number" min="1" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium" />
                </div>
                <div class="flex gap-3 pt-2">
                   <button @click="showReduceSubscriptionModal = false" class="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition">Batal</button>
                   <button @click="handleReduceSubscription" :disabled="reducing" class="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-500/30">
                      {{ reducing ? 'Memproses...' : 'Kurangi' }}
                   </button>
                </div>
             </div>
          </div>
       </div>
    </Teleport>

    <!-- Extend Subscription Modal -->
    <Teleport to="body">
       <div v-if="showExtendSubscriptionModal" class="fixed inset-0 bg-[#0d141b]/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" @click.self="showExtendSubscriptionModal = false">
          <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-700">
             <h3 class="text-xl font-bold text-[#0d141b] dark:text-white mb-4">Perpanjang Langganan</h3>
             <div class="space-y-4">
                <div>
                   <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Durasi (Hari)</label>
                   <input v-model.number="extendSubscriptionDays" type="number" min="1" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#137fec] outline-none font-medium" />
                </div>
                <div class="flex gap-3 pt-2">
                   <button @click="showExtendSubscriptionModal = false" class="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition">Batal</button>
                   <button @click="handleExtendSubscription" :disabled="extending" class="flex-1 px-4 py-2.5 bg-[#137fec] text-white rounded-xl font-bold hover:bg-blue-600 transition shadow-lg shadow-blue-500/30">
                      {{ extending ? 'Memproses...' : 'Perpanjang' }}
                   </button>
                </div>
             </div>
          </div>
       </div>
    </Teleport>
    <!-- Reduce Addon Modal -->
    <Teleport to="body">
      <div
        v-if="showReduceAddonModal"
        class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        @click.self="showReduceAddonModal = false"
      >
        <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <h3 class="text-xl font-bold text-[#0d141b] mb-4">Kurangi Durasi Addon</h3>
          <div class="mb-4">
            <p class="text-sm text-[#4c739a] mb-2">Addon: <span class="font-semibold">{{ selectedAddon?.addonName }}</span></p>
            <p class="text-sm text-[#4c739a]">Sisa waktu: <span class="font-semibold">{{ selectedAddon ? getAddonDaysRemaining(selectedAddon) : 0 }} hari</span></p>
          </div>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Durasi untuk dikurangi (hari)</label>
              <input
                v-model.number="reduceAddonDays"
                type="number"
                min="1"
                class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500"
                placeholder="Masukkan jumlah hari"
              />
            </div>
            <div class="flex space-x-3">
              <button
                @click="showReduceAddonModal = false"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                @click="handleReduceAddon"
                :disabled="!reduceAddonDays || reduceAddonDays < 1 || reducing"
                class="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ reducing ? 'Memproses...' : 'Kurangi' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Extend Addon Modal -->
    <div
      v-if="showExtendAddonModal"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      @click.self="showExtendAddonModal = false"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold text-[#0d141b] mb-4">Perpanjang Addon</h3>
        <div class="mb-4">
          <p class="text-sm text-[#4c739a] mb-2">Addon: <span class="font-semibold">{{ selectedAddon?.addonName }}</span></p>
          <p class="text-sm text-[#4c739a]">Sisa waktu: <span class="font-semibold">{{ selectedAddon ? getAddonDaysRemaining(selectedAddon) : 0 }} hari</span></p>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Durasi (hari)</label>
            <input
              v-model.number="extendAddonDays"
              type="number"
              min="1"
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan jumlah hari"
            />
          </div>
          <div class="flex space-x-3">
            <button
              @click="showExtendAddonModal = false"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button
              @click="handleExtendAddon"
              :disabled="!extendAddonDays || extendAddonDays < 1 || extending"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ extending ? 'Memproses...' : 'Perpanjang' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Addon Modal (Subscribe) -->
    <Teleport to="body">
       <div v-if="showAddAddonModal" class="fixed inset-0 bg-[#0d141b]/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" @click.self="showAddAddonModal = false">
          <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 border border-slate-200 dark:border-slate-700">
             <h3 class="text-xl font-bold text-[#0d141b] dark:text-white mb-4">Tambah Addon</h3>
             <div class="space-y-4">
                <div 
                  v-for="addon in filteredAvailableAddons" 
                  :key="addon.id"
                  @click="handleSelectAddon(addon)"
                  class="border rounded-xl p-4 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  :class="[
                     addon.comingSoon || addon.requiresApi ? 'opacity-60 cursor-not-allowed bg-slate-50' : 'hover:border-blue-400',
                     selectedAddonForSubscribe?.id === addon.id && !addon.comingSoon ? 'border-[#137fec] ring-1 ring-[#137fec] bg-blue-50/50' : 'border-slate-200 dark:border-slate-700'
                  ]"
                >
                   <div class="flex justify-between items-start">
                      <div>
                         <h4 class="font-bold text-[#0d141b] dark:text-white flex items-center gap-2">
                            {{ addon.name }}
                            <span v-if="addon.comingSoon" class="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase">Coming Soon</span>
                         </h4>
                         <p class="text-xs text-[#4c739a] dark:text-slate-400 mt-1">{{ addon.description }}</p>
                      </div>
                      <div class="text-right">
                         <span class="font-bold text-[#137fec]">{{ formatCurrency(addon.price) }}</span>
                         <span class="text-xs text-[#4c739a]">/bln</span>
                      </div>
                   </div>
                </div>
             </div>
             <div class="flex gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button @click="showAddAddonModal = false" class="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition">Batal</button>
                <button 
                  @click="handleSubscribeAddon" 
                  :disabled="!selectedAddonForSubscribe || selectedAddonForSubscribe?.comingSoon" 
                  class="flex-1 px-4 py-2.5 bg-[#137fec] text-white rounded-xl font-bold hover:bg-blue-600 transition shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none"
                >
                   Berlangganan
                </button>
             </div>
          </div>
       </div>
    </Teleport>
    
    <!-- Create Store Modal -->
    <Teleport to="body">
       <div v-if="showCreateStoreModal" class="fixed inset-0 bg-[#0d141b]/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" @click.self="showCreateStoreModal = false">
          <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
             <h3 class="text-xl font-bold text-[#0d141b] dark:text-white mb-4">Buat Toko Baru</h3>
             <form @submit.prevent="handleCreateStore" class="space-y-4">
                <div>
                   <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Nama Toko</label>
                   <input v-model="createStoreForm.name" type="text" required class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#137fec] outline-none font-medium" />
                </div>
                <div>
                   <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Alamat</label>
                   <input v-model="createStoreForm.address" type="text" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#137fec] outline-none font-medium" />
                </div>
                <div>
                   <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Telepon</label>
                   <input v-model="createStoreForm.phone" type="text" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#137fec] outline-none font-medium" />
                </div>
                <div class="flex gap-3 pt-2">
                   <button type="button" @click="showCreateStoreModal = false" class="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition">Batal</button>
                   <button type="submit" :disabled="creatingStore" class="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/30">
                      {{ creatingStore ? 'Membuat...' : 'Buat Toko' }}
                   </button>
                </div>
             </form>
          </div>
       </div>
    </Teleport>
    
    <!-- Create User Modal -->
    <Teleport to="body">
       <div v-if="showCreateUserModal" class="fixed inset-0 bg-[#0d141b]/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" @click.self="showCreateUserModal = false">
          <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
             <h3 class="text-xl font-bold text-[#0d141b] dark:text-white mb-4">Tambah Pengguna Baru</h3>
             <form @submit.prevent="handleCreateUser" class="space-y-4">
                <div>
                   <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Nama</label>
                   <input v-model="createUserForm.name" type="text" required class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#137fec] outline-none font-medium" />
                </div>
                <div>
                   <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Email</label>
                   <input v-model="createUserForm.email" type="email" required class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#137fec] outline-none font-medium" />
                </div>
                <div>
                   <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Role</label>
                   <select v-model="createUserForm.role" required class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#137fec] outline-none font-medium">
                      <option value="ADMIN_TENANT">Admin</option>
                      <option value="SUPERVISOR">Supervisor</option>
                      <option value="CASHIER">Kasir</option>
                      <option value="KITCHEN">Dapur</option>
                   </select>
                </div>
                <div>
                   <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Password (Opsional)</label>
                   <input v-model="createUserForm.password" type="password" placeholder="Auto-generate jika kosong" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#137fec] outline-none font-medium" />
                </div>
                <div class="flex gap-3 pt-2">
                   <button type="button" @click="showCreateUserModal = false" class="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition">Batal</button>
                   <button type="submit" :disabled="creatingUser" class="flex-1 px-4 py-2.5 bg-[#137fec] text-white rounded-xl font-bold hover:bg-blue-600 transition shadow-lg shadow-blue-500/30">
                      {{ creatingUser ? 'Membuat...' : 'Buat Pengguna' }}
                   </button>
                </div>
             </form>
          </div>
       </div>
    </Teleport>
    <!-- Edit User Modal -->
    <Teleport to="body">
       <div v-if="showEditUserModal" class="fixed inset-0 bg-[#0d141b]/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" @click.self="showEditUserModal = false">
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
             <h3 class="text-xl font-bold text-[#0d141b] dark:text-white mb-4">Edit Pengguna</h3>
             <div class="space-y-4">
                <div>
                   <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Nama</label>
                   <input v-model="editUserForm.name" type="text" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#137fec] outline-none font-medium" />
                </div>
                <div>
                   <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Email</label>
                   <input v-model="editUserForm.email" type="email" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#137fec] outline-none font-medium" />
                </div>
                <div>
                   <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Role</label>
                   <select v-model="editUserForm.role" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#137fec] outline-none font-medium">
                      <option value="OWNER">Owner</option>
                      <option value="ADMIN_TENANT">Admin</option>
                      <option value="SUPERVISOR">Supervisor</option>
                      <option value="CASHIER">Kasir</option>
                      <option value="KITCHEN">Dapur</option>
                   </select>
                </div>
                <div>
                   <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Status</label>
                   <select v-model="editUserForm.isActive" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#137fec] outline-none font-medium">
                      <option :value="true">Aktif</option>
                      <option :value="false">Tidak Aktif</option>
                   </select>
                </div>
                <div>
                   <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Password Baru (Opsional)</label>
                   <input v-model="editUserForm.password" type="password" placeholder="Kosongkan jika tidak ingin mengubah" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#137fec] outline-none font-medium" />
                </div>
                <div class="flex gap-3 pt-2">
                   <button @click="showEditUserModal = false" class="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition">Batal</button>
                   <button @click="handleUpdateUser" :disabled="updatingUser || !editUserForm.name || !editUserForm.email" class="flex-1 px-4 py-2.5 bg-[#137fec] text-white rounded-xl font-bold hover:bg-blue-600 transition shadow-lg shadow-blue-500/30">
                      {{ updatingUser ? 'Menyimpan...' : 'Simpan' }}
                   </button>
                </div>
             </div>
          </div>
       </div>
    </Teleport>

    <!-- Deactivate Subscription Modal -->
    <Teleport to="body">
       <div v-if="showDeactivateSubscriptionModal" class="fixed inset-0 bg-[#0d141b]/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" @click.self="showDeactivateSubscriptionModal = false">
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
             <h3 class="text-xl font-bold text-[#0d141b] dark:text-white mb-4">Nonaktifkan Langganan</h3>
             <div class="space-y-4">
                <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                   <p class="text-sm text-amber-800 dark:text-amber-200 font-bold mb-2 flex items-center gap-2">
                      <span class="material-symbols-outlined text-[18px]">warning</span>
                      Peringatan
                   </p>
                   <p class="text-sm text-amber-700 dark:text-amber-300">
                      Dengan menonaktifkan langganan, semua fitur yang memerlukan langganan aktif akan dinonaktifkan.
                   </p>
                   <ul class="text-xs text-amber-700 dark:text-amber-300 mt-2 list-disc list-inside space-y-1 font-medium ml-1">
                      <li>POS (Point of Sale)</li>
                      <li>Kitchen Orders</li>
                      <li>Manajemen Produk</li>
                      <li>Laporan dan Analytics</li>
                   </ul>
                </div>
                <div class="flex gap-3 pt-2">
                   <button @click="showDeactivateSubscriptionModal = false" class="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition">Batal</button>
                   <button @click="handleDeactivateSubscription" :disabled="deactivatingSubscription" class="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-lg shadow-red-500/30">
                      {{ deactivatingSubscription ? 'Memproses...' : 'Nonaktifkan' }}
                   </button>
                </div>
             </div>
          </div>
       </div>
    </Teleport>

    <!-- Edit Points Modal -->
    <Teleport to="body">
       <div v-if="showEditPointsModal" class="fixed inset-0 bg-[#0d141b]/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" @click.self="showEditPointsModal = false">
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
             <h3 class="text-xl font-bold text-[#0d141b] dark:text-white mb-4">Edit Point Tenant</h3>
             <div class="space-y-4">
                <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                   <p class="text-xs text-[#4c739a] dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Saldo Point Saat Ini</p>
                   <p class="text-2xl font-black text-[#137fec]">{{ tenantPoints?.currentPoints || 0 }}</p>
                </div>
                <div>
                   <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Penyesuaian Point (+/-)</label>
                   <input v-model.number="editPointsForm.points" type="number" step="1" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#137fec] outline-none font-medium" placeholder="Contoh: 100 atau -50" />
                </div>
                <div>
                   <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Alasan</label>
                   <textarea v-model="editPointsForm.reason" rows="3" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#137fec] outline-none font-medium" placeholder="Wajib diisi..."></textarea>
                </div>
                <div class="flex gap-3 pt-2">
                   <button @click="showEditPointsModal = false; editPointsForm = { points: 0, reason: '' };" class="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition">Batal</button>
                   <button @click="handleUpdatePoints" :disabled="updatingPoints" class="flex-1 px-4 py-2.5 bg-[#137fec] text-white rounded-xl font-bold hover:bg-blue-600 transition shadow-lg shadow-blue-500/30">
                      {{ updatingPoints ? 'Memproses...' : 'Simpan' }}
                   </button>
                </div>
             </div>
          </div>
       </div>
    </Teleport>
    </div>
    </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import api from '../../api';
import { formatCurrency, formatDate, formatRemainingTime } from '../../utils/formatters';
import { useAuthStore } from '../../stores/auth';
import { useNotification } from '../../composables/useNotification';
import { safeArrayMethod, safeFilter, safeMap, safeFind } from '../../utils/array-helpers';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const { success: showSuccess, error: showError, confirm: showConfirm } = useNotification();

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  subscriptionPlan?: string;
  subscriptionStart?: string;
  subscriptionEnd?: string;
}

interface Subscription {
  plan?: string;
  daysRemaining: number;
  hoursRemaining?: number;
  minutesRemaining?: number;
  secondsRemaining?: number;
  isExpired: boolean;
  isTemporaryUpgrade?: boolean;
  status: string;
  subscription?: {
    temporaryUpgrade?: boolean;
    previousPlan?: string;
    plan?: string;
  };
}

interface Addon {
  id: string;
  addonId: string;
  addonName: string;
  addonType: string;
  status?: string;
  limit?: number;
  currentUsage?: number;
  isLimitReached?: boolean;
  expiresAt?: string;
  subscribedAt?: string;
}

interface AvailableAddon {
  id: string;
  name: string;
  type: string;
  description: string;
  price: number;
  defaultLimit?: number;
}

const tenant = ref<Tenant | null>(null);
const subscription = ref<Subscription | null>(null);
const activeAddons = ref<Addon[]>([]);
const availableAddons = ref<AvailableAddon[]>([]);
const loading = ref(true); // Start with true to show loading state immediately
const isReloadingTenant = ref(false); // Flag to prevent multiple reloads
const currentTime = ref(new Date());
let countdownInterval: ReturnType<typeof setInterval> | null = null;
let pointsUpdateInterval: ReturnType<typeof setInterval> | null = null;
const extending = ref(false);
const reducing = ref(false);
const hasError = ref(false);
const errorMessage = ref<string>('');

const showExtendSubscriptionModal = ref(false);
const showReduceSubscriptionModal = ref(false);
const showEditPlanModal = ref(false);
const showExtendAddonModal = ref(false);
const showReduceAddonModal = ref(false);
const showAddAddonModal = ref(false);
const showEditUserModal = ref(false);
const showCreateUserModal = ref(false);
const showCreateStoreModal = ref(false);
const showDeactivateSubscriptionModal = ref(false);
const deactivatingSubscription = ref(false);
const loadingUsers = ref(false);
const tenantUsers = ref<any[]>([]);
const updatingUser = ref(false);
const selectedUser = ref<any>(null);
const userUsage = ref<{ currentUsage: number; limit: number } | null>(null);
const showEditPointsModal = ref(false);
const loadingPoints = ref(false);
const tenantPoints = ref<{ currentPoints: number; totalEarned: number; totalSpent: number } | null>(null);
const pointTransactions = ref<any[]>([]);
const updatingPoints = ref(false);
const editPointsForm = ref({
  points: 0,
  reason: '',
});
const loadingStores = ref(false);
const tenantStores = ref<any[]>([]);
const outletUsage = ref<{ currentUsage: number; limit: number } | null>(null);
const selectedUsers = ref<any[]>([]);
const creatingUser = ref(false);
const createUserForm = ref({
  name: '',
  email: '',
  password: '',
  role: 'CASHIER' as 'ADMIN_TENANT' | 'SUPERVISOR' | 'CASHIER' | 'KITCHEN',
});
const editUserForm = ref({
  name: '',
  email: '',
  role: 'CASHIER' as 'ADMIN_TENANT' | 'SUPERVISOR' | 'CASHIER' | 'KITCHEN',
  isActive: true,
  password: '',
});
const createStoreForm = ref({
  name: '',
  address: '',
  phone: '',
});
const creatingStore = ref(false);
const planForm = ref({
  subscriptionPlan: 'BASIC' as 'BASIC' | 'PRO' | 'ENTERPRISE',
  durationDays: 30, // Default 30 hari
});
const extendSubscriptionDays = ref<number>(30);
const reduceSubscriptionDays = ref<number>(30);
const extendAddonDays = ref<number>(30);
const reduceAddonDays = ref<number>(30);
const selectedAddon = ref<Addon | null>(null);
const selectedAddonForSubscribe = ref<AvailableAddon | null>(null);

const getAddonDaysRemaining = (addon: Addon) => {
  if (!addon.expiresAt) return 0;
  const now = new Date();
  const expiresAt = new Date(addon.expiresAt);
  // Check if addon is expired
  if (expiresAt <= now) return 0;
  const diffTime = expiresAt.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};


// Helper to calculate subscription duration
const getSubscriptionDuration = (sub: any) => {
  if (!sub?.startDate || !sub?.endDate) return 0;
  const start = new Date(sub.startDate);
  const end = new Date(sub.endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
};

// Filtered active addons
const filteredActiveAddons = computed(() => {
  return safeArrayMethod(
    activeAddons.value,
    (addons) => {
      try {
        if (!Array.isArray(addons)) return [];
        const now = new Date();
        return addons.filter(a => {
          if (!a) return false;
          // Filter: only show addons that are actually active (status === 'active' or no status but not expired)
          if (a.status && a.status !== 'active') return false;
          if (a.expiresAt) {
            const expiresAt = new Date(a.expiresAt);
            return expiresAt > now;
          }
          return true;
        });
      } catch (error) {
        console.error('Error filtering active addons:', error);
        return [];
      }
    },
    []
  );
});

// Removed unused isAddonActive function
const _isAddonActive = (addonId: string) => {
  const now = new Date();
  return safeArrayMethod(
    activeAddons.value,
    (addons) => {
      try {
        if (!Array.isArray(addons)) return false;
        return addons.some(a => {
          if (!a || a.addonId !== addonId) return false;
          // Check if addon is active (status === 'active' and not expired)
          if (a.status !== 'active') return false;
          // Check if expired
          if (a.expiresAt) {
            const expiresAt = new Date(a.expiresAt);
            return expiresAt > now;
          }
          // If no expiry date, consider it active if status is active
          return true;
        });
      } catch (error) {
        console.error('Error checking addon active status:', error);
        return false;
      }
    },
    false
  );
};

// Check if addon has defaultLimit (Tambah Outlet, Pengguna, Produk - bisa beli berapapun = Unlimited)
const hasDefaultLimit = (addon: any) => {
  return addon.defaultLimit !== null && addon.defaultLimit !== undefined;
};

// Filter available addons: semua addon selalu ditampilkan (bisa dibeli berkali-kali)
// Sort: aktif di depan, coming soon di belakang
const filteredAvailableAddons = computed(() => {
  // Remove duplicates based on id first
  const uniqueAddons = Array.isArray(availableAddons.value) 
    ? availableAddons.value.filter((addon, index, self) => 
        addon && index === self.findIndex(a => a && addon && a.id === addon.id)
      )
    : [];
  
  // All addons are shown (can be purchased multiple times)
  const filtered = safeFilter(uniqueAddons, (addon: any) => {
    // Semua addon selalu ditampilkan (bisa dibeli berkali-kali)
    return true;
  });
  
  // Sort: 
  // 1. Unlimited (defaultLimit !== null - Tambah Outlet, Pengguna, Produk) di atas
  // 2. Limited (defaultLimit === null - Business Analytics, dll) di tengah
  // 3. Coming soon (comingSoon === true) di bawah
  return filtered.sort((a, b) => {
    const aIsComingSoon = a?.comingSoon === true || a?.requiresApi === true;
    const bIsComingSoon = b?.comingSoon === true || b?.requiresApi === true;
    const aHasDefaultLimit = hasDefaultLimit(a);
    const bHasDefaultLimit = hasDefaultLimit(b);
    
    // Coming soon selalu di bawah
    if (aIsComingSoon && !bIsComingSoon) return 1;
    if (!aIsComingSoon && bIsComingSoon) return -1;
    
    // Jika keduanya coming soon, urutkan seperti biasa
    if (aIsComingSoon && bIsComingSoon) return 0;
    
    // Unlimited (dengan defaultLimit) di atas, Limited (tanpa defaultLimit) di bawah
    if (aHasDefaultLimit && !bHasDefaultLimit) return -1;
    if (!aHasDefaultLimit && bHasDefaultLimit) return 1;
    
    return 0;
  });
});

const getAddonDescription = (activeAddon: any) => {
  // Find matching addon from available addons by addonId or addonType
  if (!Array.isArray(availableAddons.value)) return '';
  const matchedAddon = availableAddons.value.find(
    a => a.id === activeAddon.addonId || a.type === activeAddon.addonType
  );
  return matchedAddon?.description || activeAddon.addonType || 'Tidak ada deskripsi';
};

const getPlanName = (plan: string) => {
  const planNames: Record<string, string> = {
    BASIC: 'Starter',
    PRO: 'Boost',
    ENTERPRISE: 'Max',
  };
  return planNames[plan] || plan;
};

const getPlanBadgeClass = (plan: string) => {
  const classes: Record<string, string> = {
    BASIC: 'bg-[#f6f7f8] text-gray-700',
    PRO: 'bg-blue-100 text-blue-700',
    ENTERPRISE: 'bg-purple-100 text-purple-700',
  };
  return classes[plan] || 'bg-[#f6f7f8] text-gray-700';
};


const loadActiveAddons = async () => {
  if (!tenant.value?.id) return;
  
  try {
    // tenantId will be added automatically by API interceptor for SUPER_ADMIN
    const response = await api.get('/addons');
    // Handle paginated response (response.data.data) or direct array (response.data)
    const addonsData = response.data?.data || response.data || [];
    // Filter to only show active addons (status === 'active' and not expired)
    const now = new Date();
    let filteredAddons = (Array.isArray(addonsData) ? addonsData : []).filter((addon: any) => {
      // Ensure status exists and is 'active'
      if (addon.status && addon.status !== 'active') return false;
      // If no status field, assume active if not expired
      if (addon.expiresAt) {
        const expiresAt = new Date(addon.expiresAt);
        return expiresAt > now;
      }
      return true;
    });
    
    // For addons with limits (ADD_OUTLETS, ADD_USERS, ADD_PRODUCTS), get total limit from check-limit API
    // This ensures we show total limit (subscription + all addons) instead of individual addon limit
    const limitAddonTypes = ['ADD_OUTLETS', 'ADD_USERS', 'ADD_PRODUCTS'];
    const limitPromises: Record<string, Promise<any>> = {};
    
    // Get total limits for each addon type
    for (const addonType of limitAddonTypes) {
      const hasAddonType = safeArrayMethod(
        filteredAddons,
        (addons) => {
          if (!Array.isArray(addons)) return false;
          return addons.some((a: any) => a && a.addonType === addonType);
        },
        false
      );
      if (hasAddonType) {
        limitPromises[addonType] = api.get(`/addons/check-limit/${addonType}`).catch(() => ({ data: { limit: -1, currentUsage: 0 } }));
      }
    }
    
    // Wait for all limit checks
    const limitResults = await Promise.all(Object.values(limitPromises).filter((p: any) => p instanceof Promise));
    const limitMap: Record<string, { limit: number; currentUsage: number }> = {};
    let limitIndex = 0;
    for (const addonType of limitAddonTypes) {
      if (limitPromises[addonType]) {
        limitMap[addonType] = limitResults[limitIndex].data;
        limitIndex++;
      }
    }
    
    // Update addons with total limit and currentUsage
    activeAddons.value = filteredAddons.map((addon: any) => {
      if (limitMap[addon.addonType]) {
        return {
          ...addon,
          limit: limitMap[addon.addonType].limit,
          currentUsage: limitMap[addon.addonType].currentUsage,
          isLimitReached: limitMap[addon.addonType].limit !== -1 && limitMap[addon.addonType].currentUsage >= limitMap[addon.addonType].limit,
        };
      }
      return addon;
    });
  } catch (error: any) {
    console.error('Error loading active addons:', error);
    // Don't show error for addons, just set empty array
    activeAddons.value = [];
  }
};

const loadAvailableAddons = async () => {
  try {
    // Available addons are the same for all tenants
    // tenantId will be added automatically by API interceptor for SUPER_ADMIN
    const response = await api.get('/addons/available');
    availableAddons.value = response.data || [];
  } catch (error: any) {
    console.error('Error loading available addons:', error);
    // Don't show error for addons, just set empty array
    availableAddons.value = [];
  }
};

const loadTenantUsers = async () => {
  if (!tenant.value?.id) return;
  loadingUsers.value = true;
  try {
    const response = await api.get('/users', {
      params: { limit: 1000 },
    });
    tenantUsers.value = response.data.data || [];
    
    // Get user usage
    const usageResponse = await api.get('/users/usage');
    userUsage.value = usageResponse.data;
  } catch (error: any) {
    console.error('Error loading users:', error);
    tenantUsers.value = [];
  } finally {
    loadingUsers.value = false;
  }
};

const loadUsers = async () => {
  if (!tenant.value?.id) return;
  
  loadingUsers.value = true;
  try {
    // tenantId will be added automatically by API interceptor for SUPER_ADMIN
    const response = await api.get('/users', {
      params: {
        page: 1,
        limit: 100, // Get all users for this tenant
      },
    });
    tenantUsers.value = response.data.data || [];
    
    // Load user usage limit
    try {
      const usageResponse = await api.get('/addons/check-limit/ADD_USERS');
      userUsage.value = {
        currentUsage: usageResponse.data.currentUsage || 0,
        limit: usageResponse.data.limit === undefined ? -1 : usageResponse.data.limit,
      };
    } catch (error: any) {
      console.error('Error loading user usage:', error);
      // Set default if error
      userUsage.value = {
        currentUsage: tenantUsers.value.length,
        limit: -1,
      };
    }
  } catch (error: any) {
    console.error('Error loading users:', error);
    showError(error.response?.data?.message || 'Gagal memuat daftar pengguna');
  } finally {
    loadingUsers.value = false;
  }
};

const loadStores = async () => {
  if (!tenant.value?.id) return;
  
  loadingStores.value = true;
  try {
    // tenantId will be added automatically by API interceptor for SUPER_ADMIN
    const response = await api.get('/outlets');
    tenantStores.value = response.data.data || [];
    
    // Load outlet usage limit
    try {
      const usageResponse = await api.get('/addons/check-limit/ADD_OUTLETS');
      outletUsage.value = {
        currentUsage: usageResponse.data.currentUsage || 0,
        limit: usageResponse.data.limit === undefined ? -1 : usageResponse.data.limit,
      };
    } catch (error: any) {
      console.error('Error loading outlet usage:', error);
      // Set default if error
      outletUsage.value = {
        currentUsage: Array.isArray(tenantStores.value) ? tenantStores.value.filter((s: any) => s.isActive !== false).length : 0,
        limit: -1,
      };
    }
  } catch (error: any) {
    console.error('Error loading stores:', error);
    showError(error.response?.data?.message || 'Gagal memuat daftar store');
  } finally {
    loadingStores.value = false;
  }
};

const loadTenantPoints = async () => {
  if (!tenant.value?.id || !authStore.isSuperAdmin) return;
  
  loadingPoints.value = true;
  try {
    const balanceRes = await api.get(`/rewards/tenant/${tenant.value.id}/balance`);
    tenantPoints.value = balanceRes.data;
    
    const transactionsRes = await api.get(`/rewards/tenant/${tenant.value.id}/transactions`, {
      params: { limit: 20 },
    });
    pointTransactions.value = transactionsRes.data;
  } catch (error: any) {
    console.error('Error loading tenant points:', error);
    // Don't show error, just set defaults
    tenantPoints.value = { currentPoints: 0, totalEarned: 0, totalSpent: 0 };
    pointTransactions.value = [];
  } finally {
    loadingPoints.value = false;
  }
};

const handleUpdatePoints = async () => {
  if (!tenant.value?.id) return;
  
  if (!editPointsForm.value.reason.trim()) {
    await showError('Alasan wajib diisi');
    return;
  }
  
  if (editPointsForm.value.points === 0) {
    await showError('Point harus lebih dari 0');
    return;
  }
  
  updatingPoints.value = true;
  try {
    const response = await api.post(`/rewards/tenant/${tenant.value.id}/update`, {
      points: Math.floor(editPointsForm.value.points), // Ensure integer
      reason: editPointsForm.value.reason,
    });
    
    if (response.data.success) {
      await showSuccess(response.data.message);
      showEditPointsModal.value = false;
      editPointsForm.value = { points: 0, reason: '' };
      await loadTenantPoints();
    } else {
      await showError(response.data.message || 'Gagal mengupdate point');
    }
  } catch (error: any) {
    console.error('Error updating points:', error);
    await showError(error.response?.data?.message || 'Gagal mengupdate point');
  } finally {
    updatingPoints.value = false;
  }
};

const toggleStoreStatus = async (store: any) => {
  const action = store.isActive !== false ? 'nonaktifkan' : 'aktifkan';
  const confirmed = await showConfirm(`Apakah Anda yakin ingin ${action} store "${store.name}"?`);
  if (!confirmed) return;
  
  try {
    await api.put(`/outlets/${store.id}`, {
      isActive: !store.isActive,
    });
    await showSuccess(`Store berhasil di${action}`);
    await loadStores();
  } catch (error: any) {
    await showError(error.response?.data?.message || `Gagal ${action} store`);
  }
};

// Bulk user operations
const isUserSelected = (userId: string) => {
  if (!Array.isArray(selectedUsers.value)) return false;
  return selectedUsers.value.some(u => u.id === userId);
};

const toggleUserSelection = (user: any) => {
  if (!Array.isArray(selectedUsers.value)) selectedUsers.value = [];
  const index = selectedUsers.value.findIndex(u => u.id === user.id);
  if (index > -1) {
    selectedUsers.value.splice(index, 1);
  } else {
    selectedUsers.value.push(user);
  }
};

const toggleSelectAllUsers = () => {
  if (!Array.isArray(selectedUsers.value)) selectedUsers.value = [];
  if (!Array.isArray(tenantUsers.value)) return;
  
  if (selectedUsers.value.length === tenantUsers.value.length) {
    selectedUsers.value = [];
  } else {
    selectedUsers.value = [...tenantUsers.value];
  }
};

const bulkActivateUsers = async () => {
  if (!Array.isArray(selectedUsers.value)) return;
  const inactiveUsers = selectedUsers.value.filter(u => !u.isActive);
  if (inactiveUsers.length === 0) return;
  
  const confirmed = await showConfirm(
    `Apakah Anda yakin ingin mengaktifkan ${inactiveUsers.length} pengguna?`,
    'Aktifkan Pengguna'
  );
  if (!confirmed) return;

  try {
    const userIds = inactiveUsers.map(u => u.id);
    const response = await api.post('/users/bulk-update-status', {
      userIds,
      isActive: true,
    });
    
    if (response.data.updated > 0) {
      await showSuccess(`${response.data.updated} pengguna berhasil diaktifkan`);
    }
    if (response.data.failed > 0) {
      await showError(`${response.data.failed} pengguna gagal diaktifkan. ${response.data.errors.join(', ')}`);
    }
    
    selectedUsers.value = [];
    await loadUsers();
  } catch (error: any) {
    await showError(error.response?.data?.message || 'Gagal mengaktifkan pengguna');
  }
};

const bulkDeactivateUsers = async () => {
  if (!Array.isArray(selectedUsers.value)) return;
  const activeUsers = selectedUsers.value.filter(u => u.isActive);
  if (activeUsers.length === 0) return;
  
  const confirmed = await showConfirm(
    `Apakah Anda yakin ingin menonaktifkan ${activeUsers.length} pengguna?`,
    'Nonaktifkan Pengguna'
  );
  if (!confirmed) return;

  try {
    const userIds = activeUsers.map(u => u.id);
    const response = await api.post('/users/bulk-update-status', {
      userIds,
      isActive: false,
    });
    
    if (response.data.updated > 0) {
      await showSuccess(`${response.data.updated} pengguna berhasil dinonaktifkan`);
    }
    if (response.data.failed > 0) {
      await showError(`${response.data.failed} pengguna gagal dinonaktifkan. ${response.data.errors.join(', ')}`);
    }
    
    selectedUsers.value = [];
    await loadUsers();
  } catch (error: any) {
    await showError(error.response?.data?.message || 'Gagal menonaktifkan pengguna');
  }
};

const getRoleClass = (role: string) => {
  const classes: Record<string, string> = {
    ADMIN_TENANT: 'bg-purple-100 text-purple-800',
    SUPERVISOR: 'bg-blue-100 text-blue-800',
    CASHIER: 'bg-green-100 text-green-800',
    KITCHEN: 'bg-orange-100 text-orange-800',
  };
  return classes[role] || 'bg-[#f6f7f8] text-gray-800';
};

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    ADMIN_TENANT: 'Admin',
    SUPERVISOR: 'Supervisor',
    CASHIER: 'Kasir',
    KITCHEN: 'Dapur',
  };
  return labels[role] || role;
};

const editUser = (user: any) => {
  selectedUser.value = user;
  editUserForm.value = {
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    password: '',
  };
  showEditUserModal.value = true;
};

const handleUpdateUser = async () => {
  if (!selectedUser.value) return;
  
  updatingUser.value = true;
  try {
    const updateData: any = {
      name: editUserForm.value.name,
      email: editUserForm.value.email,
      role: editUserForm.value.role,
      isActive: editUserForm.value.isActive,
    };
    
    // Only include password if provided
    if (editUserForm.value.password && editUserForm.value.password.trim() !== '') {
      updateData.password = editUserForm.value.password;
    }
    
    await api.put(`/users/${selectedUser.value.id}`, updateData);
    
    // Close modal first
    showEditUserModal.value = false;
    selectedUser.value = null;
    editUserForm.value = {
      name: '',
      email: '',
      role: 'CASHIER',
      isActive: true,
      password: '',
    };
    // Wait a bit for modal to close, then show success
    await new Promise(resolve => setTimeout(resolve, 100));
    await showSuccess('Pengguna berhasil diperbarui');
    await loadUsers(); // Auto-reload users after update
  } catch (error: any) {
    console.error('Error updating user:', error);
    await showError(error.response?.data?.message || 'Gagal memperbarui pengguna');
  } finally {
    updatingUser.value = false;
  }
};

const handleBackToTenants = () => {
  // Clear selectedTenantId when going back to tenants list
  if (authStore.isSuperAdmin) {
    authStore.setSelectedTenant(null);
    localStorage.removeItem('selectedTenantId');
  }
  router.push('/app/tenants');
};

const retryLoad = () => {
  hasError.value = false;
  errorMessage.value = '';
  loadTenantDetail();
};

const loadTenantDetail = async () => {
  // Check if user is still authenticated before making API calls
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }

  const tenantId = route.params.id as string;
  if (!tenantId) {
    // Clear selectedTenantId when no tenant ID
    if (authStore.isSuperAdmin) {
      authStore.setSelectedTenant(null);
      localStorage.removeItem('selectedTenantId');
    }
    router.push('/app/tenants');
    return;
  }

  // Set selectedTenantId for Super Admin before loading data
  if (authStore.isSuperAdmin) {
    authStore.setSelectedTenant(tenantId);
    localStorage.setItem('selectedTenantId', tenantId);
  }

  // Reset state
  loading.value = true;
  hasError.value = false;
  errorMessage.value = '';
  tenant.value = null; // Reset tenant to show loading state
  
  try {
    // Load tenant info
    const tenantRes = await api.get(`/tenants/${tenantId}`);
    
    // Check if tenant data is null or undefined
    if (!tenantRes?.data) {
      throw new Error('Tenant data is null or undefined');
    }
    
    tenant.value = tenantRes.data;

    // Load subscription
    // tenantId will be added automatically by API interceptor for SUPER_ADMIN
    let subRes: any = null;
    try {
      subRes = await api.get('/subscriptions/current');
      subscription.value = subRes?.data || null;
      
      // IMPORTANT: Use isExpired from backend response directly
      // Don't recalculate isExpired based on subscriptionEnd to avoid flash to expired
      // Backend already calculated isExpired correctly after revert
      if (subRes?.data && subRes.data.isExpired !== undefined && subscription.value) {
        // Use isExpired from backend
        subscription.value.isExpired = subRes.data.isExpired;
      }
    } catch (subError: any) {
      console.error('Error loading subscription:', subError);
      // Set default subscription if error
      subscription.value = {
        plan: tenant.value?.subscriptionPlan || 'BASIC',
        daysRemaining: 0,
        isExpired: true,
        status: 'EXPIRED',
      };
    }
    
    // Set initial plan form value
    planForm.value.subscriptionPlan = (subscription.value?.plan || tenant.value?.subscriptionPlan || 'BASIC') as 'BASIC' | 'PRO' | 'ENTERPRISE';
    planForm.value.durationDays = 30; // Reset durasi ke default

    // Use daysRemaining, hoursRemaining, minutesRemaining, secondsRemaining from backend if available
    // Only calculate if backend didn't provide these values
    if (subRes?.data?.daysRemaining === undefined) {
      // Calculate remaining time for countdown only if backend didn't provide
      // Use tenant.subscriptionEnd as fallback if subscription.subscription.endDate is not available
      const subscriptionEndDate = (subscription.value as any)?.subscription?.endDate || tenant.value?.subscriptionEnd;
      if (subscription.value && subscriptionEndDate) {
        const endDate = new Date(subscriptionEndDate);
        const now = new Date();
        const diffTime = endDate.getTime() - now.getTime();
        
        if (diffTime > 0) {
          const totalSeconds = Math.floor(diffTime / 1000);
          const totalMinutes = Math.floor(totalSeconds / 60);
          const totalHours = Math.floor(totalMinutes / 60);
          const days = Math.floor(totalHours / 24);
          
          subscription.value.daysRemaining = days;
          subscription.value.hoursRemaining = totalHours % 24;
          subscription.value.minutesRemaining = totalMinutes % 60;
          subscription.value.secondsRemaining = totalSeconds % 60;
        } else {
          subscription.value.daysRemaining = 0;
          subscription.value.hoursRemaining = 0;
          subscription.value.minutesRemaining = 0;
          subscription.value.secondsRemaining = 0;
        }
      }
    }
    
    // Start countdown if subscription exists and has endDate
    // Always start countdown if subscription exists and has endDate
    // The countdown will handle expired state internally
    const subscriptionEndDateForCountdown = (subscription.value as any)?.subscription?.endDate || tenant.value?.subscriptionEnd;
    if (subscription.value && subscriptionEndDateForCountdown) {
      // Initialize countdown values from backend response
      if (subscription.value.daysRemaining !== undefined) {
        // Backend already calculated, use those values
        startCountdown();
      } else {
        // Calculate from endDate if backend didn't provide
        const endDate = new Date(subscriptionEndDateForCountdown);
        const now = new Date();
        const diffTime = endDate.getTime() - now.getTime();
        
        if (diffTime > 0) {
          const totalSeconds = Math.floor(diffTime / 1000);
          const totalMinutes = Math.floor(totalSeconds / 60);
          const totalHours = Math.floor(totalMinutes / 60);
          const days = Math.floor(totalHours / 24);
          
          subscription.value.daysRemaining = days;
          subscription.value.hoursRemaining = totalHours % 24;
          subscription.value.minutesRemaining = totalMinutes % 60;
          subscription.value.secondsRemaining = totalSeconds % 60;
          // Don't set isExpired here - use from backend
        } else {
          // Only set isExpired if backend didn't provide it
          if (subscription.value.isExpired === undefined) {
            subscription.value.isExpired = true;
          }
          subscription.value.daysRemaining = 0;
          subscription.value.hoursRemaining = 0;
          subscription.value.minutesRemaining = 0;
          subscription.value.secondsRemaining = 0;
        }
        
        startCountdown();
      }
    }

    // Load active addons (don't fail if error)
    try {
      await loadActiveAddons();
    } catch (error) {
      console.error('Error loading active addons:', error);
    }
    
    // Load available addons (don't fail if error)
    try {
      await loadAvailableAddons();
    } catch (error) {
      console.error('Error loading available addons:', error);
    }
    
    // Load users and stores for this tenant (don't fail if error)
    try {
      await loadUsers();
    } catch (error) {
      console.error('Error loading users:', error);
    }
    
    try {
      await loadStores();
    } catch (error) {
      console.error('Error loading stores:', error);
    }
    
    // Load tenant points (for super admin) (don't fail if error)
    try {
      await loadTenantPoints();
    } catch (error) {
      console.error('Error loading tenant points:', error);
    }
  } catch (error: any) {
    console.error('Error in onMounted:', error);
    
    // If 401 Unauthorized, redirect to login
    if (error?.response?.status === 401) {
      authStore.clearAuth();
      router.push('/login');
      return;
    }
    
    // Clear selectedTenantId on error to prevent dashboard showing wrong view
    if (authStore.isSuperAdmin) {
      authStore.setSelectedTenant(null);
      localStorage.removeItem('selectedTenantId');
    }
    
    // Set error state for error boundary
    hasError.value = true;
    errorMessage.value = error?.response?.data?.message || error?.message || 'Terjadi kesalahan saat memuat halaman';
    
    // Ensure tenant is null to show error state
    tenant.value = null;
    loading.value = false;
    
    // Only show error notification if it's not a navigation error
    if (error.response?.status !== 401 && error.response?.status !== 404) {
      await showError(error.response?.data?.message || 'Gagal memuat detail tenant');
    }
    // Don't redirect on error - let user see the error state
    // Only redirect on 404 (not found)
    if (error.response?.status === 404) {
      errorMessage.value = 'Tenant tidak ditemukan';
      await showError('Tenant tidak ditemukan');
      // Clear selectedTenantId before redirect
      if (authStore.isSuperAdmin) {
        authStore.setSelectedTenant(null);
        localStorage.removeItem('selectedTenantId');
      }
      // Small delay before redirect to show error message
      setTimeout(() => {
        // Clear selectedTenantId before redirect
        if (authStore.isSuperAdmin) {
          authStore.setSelectedTenant(null);
          localStorage.removeItem('selectedTenantId');
        }
        router.push('/app/tenants');
      }, 1500);
    }
  } finally {
    loading.value = false;
  }
};

const handleExtendSubscription = async () => {
  if (!extendSubscriptionDays.value || extendSubscriptionDays.value < 1) return;

  extending.value = true;
  try {
    // Super Admin can extend without plan, just duration
    // tenantId will be added automatically by API interceptor for SUPER_ADMIN
    await api.post('/subscriptions/extend', {
      duration: extendSubscriptionDays.value,
    });
    // Close modal first
    showExtendSubscriptionModal.value = false;
    extendSubscriptionDays.value = 30;
    // Wait a bit for modal to close, then show success
    await new Promise(resolve => setTimeout(resolve, 100));
    await showSuccess('Langganan berhasil diperpanjang');
    await loadTenantDetail();
  } catch (error: any) {
    console.error('Error extending subscription:', error);
    await showError(error.response?.data?.message || 'Gagal memperpanjang langganan');
  } finally {
    extending.value = false;
  }
};

const handleReduceSubscription = async () => {
  // Validate input
  if (!reduceSubscriptionDays.value) {
    await showError('Durasi harus diisi');
    return;
  }

  // Convert to number and validate
  const durationValue = Number(reduceSubscriptionDays.value);
  if (isNaN(durationValue) || durationValue < 1 || !Number.isInteger(durationValue)) {
    await showError('Durasi harus berupa angka bulat positif');
    return;
  }

  const duration = Math.floor(durationValue);

  reducing.value = true;
  try {
    // tenantId will be added automatically by API interceptor for SUPER_ADMIN
    await api.post('/subscriptions/reduce', {
      duration: duration, // Send as integer
    });
    
    // Close modal first
    showReduceSubscriptionModal.value = false;
    reduceSubscriptionDays.value = 30;
    // Wait a bit for modal to close, then show success
    await new Promise(resolve => setTimeout(resolve, 100));
    await showSuccess('Durasi langganan berhasil dikurangi');
    await loadTenantDetail();
  } catch (error: any) {
    console.error('Error reducing subscription:', error);
    const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.message || error.message || 'Gagal mengurangi durasi langganan';
    await showError(errorMessage);
  } finally {
    reducing.value = false;
  }
};

const handleEditPlan = async () => {
  if (!planForm.value.subscriptionPlan || !tenant.value?.id || !planForm.value.durationDays || planForm.value.durationDays < 1) {
    await showError('Mohon lengkapi semua field');
    return;
  }
  
  try {
    await api.put(`/tenants/${tenant.value.id}/upgrade-plan`, {
      subscriptionPlan: planForm.value.subscriptionPlan,
      durationDays: planForm.value.durationDays,
    });
    // Close modal first
    showEditPlanModal.value = false;
    // Wait a bit for modal to close, then show success
    await new Promise(resolve => setTimeout(resolve, 100));
    await showSuccess('Paket berhasil diupdate (temporary upgrade)');
    await loadTenantDetail();
  } catch (error: any) {
    console.error('Error updating plan:', error);
    await showError(error.response?.data?.message || 'Gagal mengupdate paket');
  }
};

const extendAddon = (addon: Addon) => {
  selectedAddon.value = addon;
  extendAddonDays.value = 30;
  showExtendAddonModal.value = true;
};

const reduceAddon = (addon: Addon) => {
  selectedAddon.value = addon;
  reduceAddonDays.value = 30;
  showReduceAddonModal.value = true;
};

const handleExtendAddon = async () => {
  if (!selectedAddon.value || !extendAddonDays.value || extendAddonDays.value < 1) return;

  extending.value = true;
  try {
    // Ensure we have the correct addon data from database
    if (!selectedAddon.value.addonId) {
      await showError('Data addon tidak valid');
      return;
    }
    
    // tenantId will be added automatically by API interceptor for SUPER_ADMIN
    await api.post('/addons/extend', {
      addonId: selectedAddon.value.addonId,
      duration: extendAddonDays.value,
    });
    // Close modal first
    showExtendAddonModal.value = false;
    selectedAddon.value = null;
    extendAddonDays.value = 30;
    // Wait a bit for modal to close, then show success
    await new Promise(resolve => setTimeout(resolve, 100));
    await showSuccess('Addon berhasil diperpanjang');
    // Reload addons to show updated list
    await loadActiveAddons();
  } catch (error: any) {
    console.error('Error extending addon:', error);
    await showError(error.response?.data?.message || 'Gagal memperpanjang addon');
  } finally {
    extending.value = false;
  }
};

const handleReduceAddon = async () => {
  if (!selectedAddon.value || !reduceAddonDays.value || reduceAddonDays.value < 1) return;

  reducing.value = true;
  try {
    // Ensure we have the correct addon data from database
    if (!selectedAddon.value.addonId) {
      await showError('Data addon tidak valid');
      return;
    }
    
    // tenantId will be added automatically by API interceptor for SUPER_ADMIN
    await api.post('/addons/reduce', {
      addonId: selectedAddon.value.addonId,
      duration: reduceAddonDays.value,
    });
    // Close modal first
    showReduceAddonModal.value = false;
    selectedAddon.value = null;
    reduceAddonDays.value = 30;
    // Wait a bit for modal to close, then show success
    await new Promise(resolve => setTimeout(resolve, 100));
    await showSuccess('Durasi addon berhasil dikurangi');
    // Reload addons to show updated list
    await loadActiveAddons();
  } catch (error: any) {
    console.error('Error reducing addon:', error);
    await showError(error.response?.data?.message || 'Gagal mengurangi durasi addon');
  } finally {
    reducing.value = false;
  }
};

const subscribeAddon = async (addon: AvailableAddon) => {
  // Block subscription for API-based addons (coming soon)
  if (addon.comingSoon || addon.requiresApi) {
    await showError('Addon ini belum tersedia (Coming Soon)');
    return;
  }
  
  try {
    // If Super Admin, directly subscribe addon without payment
    if (authStore.isSuperAdmin) {
      await api.post('/addons/subscribe', {
        addonId: addon.id,
        addonName: addon.name,
        addonType: addon.type,
        limit: addon.defaultLimit ?? undefined,
        duration: 30, // Default 30 days
      });
      
      await showSuccess('Addon berhasil ditambahkan');
      // Reload addons to show updated list
      await loadActiveAddons();
      await loadAvailableAddons();
      return;
    }

    // For non-Super Admin, use payment flow
    const response = await api.post('/payment/addon', {
      itemName: addon.name,
      amount: addon.price,
      itemId: addon.id,
      itemType: 'addon',
    });

    if (response.data.success && response.data.paymentUrl) {
      // Redirect to Midtrans payment page
      window.location.href = response.data.paymentUrl;
    } else {
      await showError(response.data.message || 'Gagal membuat pembayaran');
    }
  } catch (error: any) {
    console.error('Error subscribing addon:', error);
    await showError(error.response?.data?.message || 'Gagal menambahkan addon');
  }
};

const handleCreateUser = async () => {
  if (!createUserForm.value.name || !createUserForm.value.email || !createUserForm.value.role) {
    await showError('Nama, email, dan role wajib diisi');
    return;
  }

  if (!tenant.value?.id) {
    await showError('Tenant ID tidak ditemukan');
    return;
  }

  creatingUser.value = true;
  try {
    const response = await api.post('/users', {
      name: createUserForm.value.name,
      email: createUserForm.value.email,
      password: createUserForm.value.password || undefined,
      role: createUserForm.value.role,
      tenantId: tenant.value.id,
    });

    showCreateUserModal.value = false;
    createUserForm.value = {
      name: '',
      email: '',
      password: '',
      role: 'CASHIER',
    };

    const defaultPassword = response.data?.password || response.data?.defaultPassword;
    if (defaultPassword) {
      await showSuccess(`Pengguna berhasil dibuat! Password: ${defaultPassword}`);
    } else {
      await showSuccess('Pengguna berhasil dibuat!');
    }

    await loadTenantUsers();
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Gagal membuat pengguna';
    await showError(errorMessage);
  } finally {
    creatingUser.value = false;
  }
};

const handleCreateStore = async () => {
  if (!createStoreForm.value.name) {
    await showError('Nama toko wajib diisi');
    return;
  }

  if (!tenant.value?.id) {
    await showError('Tenant ID tidak ditemukan');
    return;
  }

  creatingStore.value = true;
  try {
    await api.post('/outlets', {
      name: createStoreForm.value.name,
      address: createStoreForm.value.address || undefined,
      phone: createStoreForm.value.phone || undefined,
    });

    showCreateStoreModal.value = false;
    createStoreForm.value = {
      name: '',
      address: '',
      phone: '',
    };

    await showSuccess('Toko berhasil dibuat!');
    await loadStores();
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Gagal membuat toko';
    await showError(errorMessage);
  } finally {
    creatingStore.value = false;
  }
};

const handleSelectAddon = (addon: any) => {
  if (!addon.comingSoon && !addon.requiresApi) {
    selectedAddonForSubscribe.value = addon;
  }
};

const handleSubscribeAddon = async () => {
  if (!selectedAddonForSubscribe.value) return;

  // Block subscription for API-based addons (coming soon)
  if (selectedAddonForSubscribe.value.comingSoon || selectedAddonForSubscribe.value.requiresApi) {
    await showError('Addon ini belum tersedia (Coming Soon)');
    return;
  }

  try {
    // If Super Admin, directly subscribe addon without payment
    if (authStore.isSuperAdmin) {
      const addon = selectedAddonForSubscribe.value;
      await api.post('/addons/subscribe', {
        addonId: addon.id,
        addonName: addon.name,
        addonType: addon.type,
        limit: addon.defaultLimit ?? undefined,
        duration: 30, // Default 30 days
      });
      
      // Close modal first
      showAddAddonModal.value = false;
      selectedAddonForSubscribe.value = null;
      // Wait a bit for modal to close, then show success
      await new Promise(resolve => setTimeout(resolve, 100));
      await showSuccess('Addon berhasil ditambahkan');
      // Reload addons to show updated list
      await loadActiveAddons();
      await loadAvailableAddons();
      return;
    }

    // For non-Super Admin, use payment flow
    const response = await api.post('/payment/addon', {
      itemName: selectedAddonForSubscribe.value.name,
      amount: selectedAddonForSubscribe.value.price,
      itemId: selectedAddonForSubscribe.value.id,
      itemType: 'addon',
    });

    if (response.data.success && response.data.paymentUrl) {
      // Redirect to Midtrans payment page
      window.location.href = response.data.paymentUrl;
    } else {
      await showError(response.data.message || 'Gagal membuat pembayaran');
    }
  } catch (error: any) {
    console.error('Error subscribing addon:', error);
    await showError(error.response?.data?.message || 'Gagal menambahkan addon');
  }
};

const unsubscribeAddon = async (addon: Addon) => {
  const confirmed = await showConfirm('Apakah Anda yakin ingin menonaktifkan addon ini?');
  if (!confirmed) return;

  try {
    // Use addon.id (database ID) instead of addonId for unsubscribe
    // tenantId will be added automatically by API interceptor for SUPER_ADMIN
    await api.post(`/addons/unsubscribe/${addon.addonId}`);
    await showSuccess('Addon berhasil dinonaktifkan');
    // Reload addons to show updated list
    await loadActiveAddons();
    await loadAvailableAddons();
  } catch (error: any) {
    console.error('Error unsubscribing addon:', error);
    await showError(error.response?.data?.message || 'Gagal menonaktifkan addon');
  }
};

const handleDeactivateSubscription = async () => {
  if (!tenant.value?.id) return;
  
  deactivatingSubscription.value = true;
  try {
    await api.put(`/tenants/${tenant.value.id}/deactivate-subscription`);
    
    showSuccess('Langganan berhasil dinonaktifkan');
    showDeactivateSubscriptionModal.value = false;
    await loadTenantDetail();
  } catch (error: any) {
    console.error('Error deactivating subscription:', error);
    showError(error.response?.data?.message || 'Gagal menonaktifkan langganan');
  } finally {
    deactivatingSubscription.value = false;
  }
};

// Watch for route changes to update selectedTenantId
// Watch for route changes to update selectedTenantId and reload data
// Watch for route param changes (but not on initial mount to avoid double loading)
let isInitialMount = true;
watch(() => route.params.id, (newTenantId, oldTenantId) => {
  // Skip on initial mount - onMounted will handle it
  if (isInitialMount) {
    isInitialMount = false;
    return;
  }
  
  if (newTenantId) {
    if (authStore.isSuperAdmin) {
      authStore.setSelectedTenant(newTenantId as string);
      localStorage.setItem('selectedTenantId', newTenantId as string);
    }
    // Reload tenant detail when route param changes
    if (authStore.isAuthenticated && newTenantId !== oldTenantId) {
      // Reset state to show loading state
      tenant.value = null;
      subscription.value = null;
      activeAddons.value = [];
      tenantUsers.value = [];
      tenantStores.value = [];
      hasError.value = false;
      errorMessage.value = '';
      loading.value = true;
      loadTenantDetail();
    }
  } else {
    // If no tenant ID, clear state and redirect
    if (authStore.isSuperAdmin) {
      authStore.setSelectedTenant(null);
      localStorage.removeItem('selectedTenantId');
    }
    router.push('/app/tenants');
  }
});

// Countdown real-time
const startCountdown = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  
  countdownInterval = setInterval(() => {
    currentTime.value = new Date();
    
    // Update subscription remaining time if subscription exists
    // Use tenant.subscriptionEnd as fallback if subscription.subscription.endDate is not available
    // IMPORTANT: Skip if subscriptionEnd is null (already deactivated, don't reload)
    const subscriptionEndDate = (subscription.value as any)?.subscription?.endDate || tenant.value?.subscriptionEnd;
    if (subscription.value && subscriptionEndDate) {
      const endDate = new Date(subscriptionEndDate);
      const diffTime = endDate.getTime() - currentTime.value.getTime();
      
      // Only update if there's still time remaining (diffTime > 0)
      // If diffTime <= 0, mark as expired but don't stop countdown immediately
      // This allows the UI to show "0 hari" or "Kadaluwarsa" properly
      if (diffTime > 0) {
        const totalSeconds = Math.floor(diffTime / 1000);
        const totalMinutes = Math.floor(totalSeconds / 60);
        const totalHours = Math.floor(totalMinutes / 60);
        const days = Math.floor(totalHours / 24);
        
        subscription.value.daysRemaining = days;
        subscription.value.hoursRemaining = totalHours % 24;
        subscription.value.minutesRemaining = totalMinutes % 60;
        subscription.value.secondsRemaining = totalSeconds % 60;
        subscription.value.isExpired = false;
      } else {
        // Time has expired
        subscription.value.isExpired = true;
        subscription.value.daysRemaining = 0;
        subscription.value.hoursRemaining = 0;
        subscription.value.minutesRemaining = 0;
        subscription.value.secondsRemaining = 0;
        
        // Stop countdown
        if (countdownInterval) {
          clearInterval(countdownInterval);
          countdownInterval = null;
        }
        
        // IMPORTANT: Only auto refresh if current plan is BOOST (PRO/ENTERPRISE) and expired
        // If current plan is BASIC and expired, don't auto refresh (just show expired state)
        // This prevents unnecessary page refresh for BASIC plan
        const currentPlan = subscription.value?.plan || tenant.value?.subscriptionPlan || 'BASIC';
        const subscriptionEnd = (subscription.value as any)?.subscription?.endDate || tenant.value?.subscriptionEnd;
        
        // Only reload if:
        // 1. Current plan is PRO or ENTERPRISE (boost) and expired
        // 2. SubscriptionEnd is not null (might be temporary upgrade that needs revert)
        // 3. Not already reloading
        if ((currentPlan === 'PRO' || currentPlan === 'ENTERPRISE') && subscriptionEnd && !isReloadingTenant.value) {
          // Boost plan expired - reload to get reverted BASIC plan with remaining time
          isReloadingTenant.value = true;
          loadTenantDetail().finally(() => {
            isReloadingTenant.value = false;
          });
        } else if (currentPlan === 'BASIC' || !subscriptionEnd) {
          // BASIC plan expired or subscriptionEnd is null - don't reload to prevent page refresh
          // Just stop countdown and show expired state
        }
      }
    }
  }, 1000); // Update every second
};

const stopCountdown = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
};

onMounted(async () => {
  try {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Check authentication first
    if (!authStore.isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // Check if tenant ID exists in route
    const tenantId = route.params.id as string;
    if (!tenantId) {
      if (authStore.isSuperAdmin) {
        authStore.setSelectedTenant(null);
        localStorage.removeItem('selectedTenantId');
      }
      router.push('/app/tenants');
      return;
    }
    
    // Set selectedTenantId for Super Admin
    if (authStore.isSuperAdmin) {
      authStore.setSelectedTenant(tenantId);
      localStorage.setItem('selectedTenantId', tenantId);
    }
    
    // Initialize state - set loading to true first
    hasError.value = false;
    errorMessage.value = '';
    tenant.value = null;
    loading.value = true;
    
    // Load tenant detail
    await loadTenantDetail();
    
    // Load points once for Super Admin (no auto-refresh)
    if (authStore.isSuperAdmin && tenant.value) {
      try {
        await loadTenantPoints();
      } catch (error) {
        console.error('Error loading tenant points:', error);
        // Don't fail the whole page if points loading fails
      }
    }
  } catch (error: any) {
    console.error('Error in onMounted:', error);
    hasError.value = true;
    errorMessage.value = error?.message || 'Terjadi kesalahan saat memuat halaman';
    loading.value = false;
  }
});

// Clear selectedTenantId when leaving tenant detail
onBeforeRouteLeave((to: any, from: any, next: any) => {
  // If super admin is navigating to dashboard, super-dashboard, or tenant list, clear selectedTenantId
  if (authStore.isSuperAdmin && (to.name === 'dashboard' || to.name === 'super-dashboard' || to.name === 'tenants')) {
    authStore.setSelectedTenant(null);
    localStorage.removeItem('selectedTenantId');
  }
  next();
});

onUnmounted(() => {
  stopCountdown();
  // Clear points update interval
  if (pointsUpdateInterval) {
    clearInterval(pointsUpdateInterval);
    pointsUpdateInterval = null;
  }
});
</script>

