<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col">
        <h2 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Data Retention</h2>
        <p class="text-slate-500 dark:text-slate-400 mt-1">Manage retention policies and automatic deletion of legacy data.</p>
      </div>
      <button
        @click="loadStats"
        class="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 hover:text-primary rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-900 transition"
      >
        <span class="material-symbols-outlined text-[18px]">refresh</span>
        Refresh Stats
      </button>
    </div>

    <div v-if="loading && stats.ordersToDelete === 0" class="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50">
      <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
      <div class="text-slate-500 font-medium text-sm">Calculating retention data...</div>
    </div>

    <div v-else class="space-y-6 animate-fade-in">
      <!-- Retention Statistics -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 p-6">
        <div class="flex items-center gap-3 mb-6">
           <div class="p-2 bg-red-50 text-red-600 rounded-lg">
              <span class="material-symbols-outlined">delete_sweep</span>
           </div>
           <div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Data to be Deleted</h3>
              <p class="text-xs text-slate-500">Estimated data to be deleted based on current policy.</p>
           </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 text-center">
            <div class="text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Orders</div>
            <div class="text-2xl font-extrabold text-[#0d141b] dark:text-white">{{ stats.ordersToDelete || 0 }}</div>
          </div>
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 text-center">
            <div class="text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Transactions</div>
            <div class="text-2xl font-extrabold text-[#0d141b] dark:text-white">{{ stats.transactionsToDelete || 0 }}</div>
          </div>
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 text-center">
            <div class="text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Reports</div>
            <div class="text-2xl font-extrabold text-[#0d141b] dark:text-white">{{ stats.reportsToDelete || 0 }}</div>
          </div>
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 text-center">
            <div class="text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Audit Logs</div>
            <div class="text-2xl font-extrabold text-[#0d141b] dark:text-white">{{ stats.auditLogsToDelete || 0 }}</div>
          </div>
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 text-center">
            <div class="text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Contacts</div>
            <div class="text-2xl font-extrabold text-[#0d141b] dark:text-white">{{ stats.contactSubmissionsToDelete || 0 }}</div>
          </div>
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 text-center">
            <div class="text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Demo Req</div>
            <div class="text-2xl font-extrabold text-[#0d141b] dark:text-white">{{ stats.demoRequestsToDelete || 0 }}</div>
          </div>
        </div>
      </div>

      <!-- Retention Policy Configuration -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 p-6">
        <div class="flex items-center gap-3 mb-6">
           <div class="p-2 bg-primary/10 text-primary rounded-lg">
              <span class="material-symbols-outlined">tune</span>
           </div>
           <div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Retention Policy (Days)</h3>
              <p class="text-xs text-slate-500">Configure data retention period before permanent deletion.</p>
           </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Orders (Default: 730)</label>
            <input
              v-model.number="retentionPolicy.orders"
              type="number"
              min="30"
              max="730"
              class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/50 text-[#0d141b] dark:text-white"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Transactions (Default: 730)</label>
            <input
              v-model.number="retentionPolicy.transactions"
              type="number"
              min="30"
              max="730"
              class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/50 text-[#0d141b] dark:text-white"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Reports (Default: 730)</label>
            <input
              v-model.number="retentionPolicy.reports"
              type="number"
              min="30"
              max="730"
              class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/50 text-[#0d141b] dark:text-white"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Audit Logs (Default: 730)</label>
            <input
              v-model.number="retentionPolicy.auditLogs"
              type="number"
              min="30"
              max="730"
              class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/50 text-[#0d141b] dark:text-white"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Contact Submissions (Default: 730)</label>
            <input
              v-model.number="retentionPolicy.contactSubmissions"
              type="number"
              min="30"
              max="730"
              class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/50 text-[#0d141b] dark:text-white"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Demo Requests (Default: 730)</label>
            <input
              v-model.number="retentionPolicy.demoRequests"
              type="number"
              min="30"
              max="730"
              class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/50 text-[#0d141b] dark:text-white"
            />
          </div>
        </div>
      </div>

      <!-- Apply Retention Actions -->
      <div class="space-y-4">
        <h3 class="font-bold text-[#0d141b] dark:text-white px-1">Actions</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
           <!-- Action Buttons -->
           <button @click="showApplyOrdersModal = true" class="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-red-300 hover:shadow-md transition group text-left">
              <div class="flex items-center justify-between mb-2">
                 <span class="font-bold text-[#0d141b] dark:text-white group-hover:text-red-600 transition-colors">Cleanup Orders</span>
                 <span class="material-symbols-outlined text-slate-300 group-hover:text-red-500">shopping_cart</span>
              </div>
              <p class="text-xs text-[#4c739a]">Hapus order lama</p>
           </button>

           <button @click="showApplyTransactionsModal = true" class="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-red-300 hover:shadow-md transition group text-left">
              <div class="flex items-center justify-between mb-2">
                 <span class="font-bold text-[#0d141b] dark:text-white group-hover:text-red-600 transition-colors">Cleanup Transactions</span>
                 <span class="material-symbols-outlined text-slate-300 group-hover:text-red-500">payments</span>
              </div>
              <p class="text-xs text-[#4c739a]">Hapus transaksi lama</p>
           </button>

           <button @click="showApplyReportsModal = true" class="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-red-300 hover:shadow-md transition group text-left">
              <div class="flex items-center justify-between mb-2">
                 <span class="font-bold text-[#0d141b] dark:text-white group-hover:text-red-600 transition-colors">Cleanup Reports</span>
                 <span class="material-symbols-outlined text-slate-300 group-hover:text-red-500">description</span>
              </div>
              <p class="text-xs text-[#4c739a]">Hapus laporan lama</p>
           </button>
           
           <button @click="showApplyAuditLogsModal = true" class="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-red-300 hover:shadow-md transition group text-left">
              <div class="flex items-center justify-between mb-2">
                 <span class="font-bold text-[#0d141b] dark:text-white group-hover:text-red-600 transition-colors">Cleanup Logs</span>
                 <span class="material-symbols-outlined text-slate-300 group-hover:text-red-500">history</span>
              </div>
              <p class="text-xs text-[#4c739a]">Hapus audit logs lama</p>
           </button>

           <button @click="showApplyContactSubmissionsModal = true" class="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-red-300 hover:shadow-md transition group text-left">
              <div class="flex items-center justify-between mb-2">
                 <span class="font-bold text-[#0d141b] dark:text-white group-hover:text-red-600 transition-colors">Cleanup Contacts</span>
                 <span class="material-symbols-outlined text-slate-300 group-hover:text-red-500">contact_mail</span>
              </div>
              <p class="text-xs text-[#4c739a]">Hapus submission lama</p>
           </button>
           
           <button @click="showApplyDemoRequestsModal = true" class="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-red-300 hover:shadow-md transition group text-left">
              <div class="flex items-center justify-between mb-2">
                 <span class="font-bold text-[#0d141b] dark:text-white group-hover:text-red-600 transition-colors">Cleanup Demo Req</span>
                 <span class="material-symbols-outlined text-slate-300 group-hover:text-red-500">co_present</span>
              </div>
              <p class="text-xs text-[#4c739a]">Hapus request lama</p>
           </button>

           <!-- Apply All -->
           <button @click="showApplyAllModal = true" class="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 hover:shadow-md transition group text-left lg:col-span-2 xl:col-span-2">
              <div class="flex items-center gap-3">
                 <div class="bg-red-100 dark:bg-red-800 text-red-600 p-2 rounded-lg">
                    <span class="material-symbols-outlined">delete_forever</span>
                 </div>
                 <div>
                    <h4 class="font-bold text-red-700 dark:text-red-300 group-hover:text-red-800 dark:group-hover:text-red-200 transition-colors">Apply All Policies</h4>
                    <p class="text-xs text-red-600/80">Jalankan SEMUA pembersihan sekaligus</p>
                 </div>
              </div>
           </button>
        </div>
      </div>
    </div>

    <!-- Reusable Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showApplyOrdersModal" class="fixed inset-0 bg-[#0d141b]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showApplyOrdersModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in border-t-4 border-red-500">
          <div class="flex items-start gap-4 mb-4">
             <div class="bg-red-100 dark:bg-red-900/30 p-2 rounded-full text-red-600 shrink-0">
                <span class="material-symbols-outlined text-2xl">warning</span>
             </div>
             <div>
                <h3 class="text-lg font-bold text-[#0d141b] dark:text-white">Konfirmasi Penghapusan</h3>
                <p class="text-sm text-[#4c739a]">Tindakan ini akan menghapus <strong class="text-red-600">{{ stats.ordersToDelete || 0 }} orders</strong> secara PERMANEN.</p>
             </div>
          </div>
          
          <div class="mb-4">
            <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Lebih lama dari (hari)</label>
            <input
              v-model.number="applyOrdersDays"
              type="number"
              class="w-full px-4 py-2 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold"
            />
          </div>

          <div class="flex gap-3">
            <button @click="showApplyOrdersModal = false" class="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-[#4c739a] hover:bg-slate-50 transition">Batal</button>
            <button 
              @click="applyOrdersRetention" 
              :disabled="applying"
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-500/30 hover:bg-red-700 transition disabled:opacity-50"
            >
              {{ applying ? 'Menghapus...' : 'Hapus Permanen' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Generic Modal template - reusing structure for others... -->
    <!-- Transactions Modal -->
    <Teleport to="body">
      <div v-if="showApplyTransactionsModal" class="fixed inset-0 bg-[#0d141b]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showApplyTransactionsModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in border-t-4 border-red-500">
          <div class="flex items-start gap-4 mb-4">
             <div class="bg-red-100 dark:bg-red-900/30 p-2 rounded-full text-red-600 shrink-0">
                <span class="material-symbols-outlined text-2xl">warning</span>
             </div>
             <div>
                <h3 class="text-lg font-bold text-[#0d141b] dark:text-white">Hapus Transactions</h3>
                <p class="text-sm text-[#4c739a]">Hapus <strong class="text-red-600">{{ stats.transactionsToDelete || 0 }} transactions</strong> permanen.</p>
             </div>
          </div>
          <div class="mb-4">
            <input v-model.number="applyTransactionsDays" type="number" class="w-full px-4 py-2 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 rounded-xl text-sm font-bold" />
          </div>
          <div class="flex gap-3">
            <button @click="showApplyTransactionsModal = false" class="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-[#4c739a]">Batal</button>
            <button @click="applyTransactionsRetention" :disabled="applying" class="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700">{{ applying ? '...' : 'Hapus' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Reports Modal -->
    <Teleport to="body">
      <div v-if="showApplyReportsModal" class="fixed inset-0 bg-[#0d141b]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showApplyReportsModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in border-t-4 border-red-500">
          <div class="flex items-start gap-4 mb-4">
             <div class="bg-red-100 dark:bg-red-900/30 p-2 rounded-full text-red-600 shrink-0">
                <span class="material-symbols-outlined text-2xl">warning</span>
             </div>
             <div>
                <h3 class="text-lg font-bold text-[#0d141b] dark:text-white">Hapus Reports</h3>
                <p class="text-sm text-[#4c739a]">Hapus <strong class="text-red-600">{{ stats.reportsToDelete || 0 }} reports</strong> permanen.</p>
             </div>
          </div>
          <div class="mb-4">
            <input v-model.number="applyReportsDays" type="number" class="w-full px-4 py-2 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 rounded-xl text-sm font-bold" />
          </div>
          <div class="flex gap-3">
            <button @click="showApplyReportsModal = false" class="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-[#4c739a]">Batal</button>
            <button @click="applyReportsRetention" :disabled="applying" class="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700">{{ applying ? '...' : 'Hapus' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Audit Logs Modal -->
    <Teleport to="body">
      <div v-if="showApplyAuditLogsModal" class="fixed inset-0 bg-[#0d141b]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showApplyAuditLogsModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in border-t-4 border-red-500">
          <div class="flex items-start gap-4 mb-4">
             <div class="bg-red-100 dark:bg-red-900/30 p-2 rounded-full text-red-600 shrink-0">
                <span class="material-symbols-outlined text-2xl">warning</span>
             </div>
             <div>
                <h3 class="text-lg font-bold text-[#0d141b] dark:text-white">Hapus Audit Logs</h3>
                <p class="text-sm text-[#4c739a]">Hapus <strong class="text-red-600">{{ stats.auditLogsToDelete || 0 }} logs</strong> permanen.</p>
             </div>
          </div>
          <div class="mb-4">
            <input v-model.number="applyAuditLogsDays" type="number" class="w-full px-4 py-2 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 rounded-xl text-sm font-bold" />
          </div>
          <div class="flex gap-3">
            <button @click="showApplyAuditLogsModal = false" class="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-[#4c739a]">Batal</button>
            <button @click="applyAuditLogsRetention" :disabled="applying" class="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700">{{ applying ? '...' : 'Hapus' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Contact Submissions Modal -->
    <Teleport to="body">
      <div v-if="showApplyContactSubmissionsModal" class="fixed inset-0 bg-[#0d141b]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showApplyContactSubmissionsModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in border-t-4 border-red-500">
           <div class="flex items-start gap-4 mb-4">
             <div class="bg-red-100 dark:bg-red-900/30 p-2 rounded-full text-red-600 shrink-0">
                <span class="material-symbols-outlined text-2xl">warning</span>
             </div>
             <div>
                <h3 class="text-lg font-bold text-[#0d141b] dark:text-white">Hapus Contact Subs</h3>
                <p class="text-sm text-[#4c739a]">Hapus <strong class="text-red-600">{{ stats.contactSubmissionsToDelete || 0 }} contacts</strong> permanen.</p>
             </div>
          </div>
          <div class="mb-4">
            <input v-model.number="applyContactSubmissionsDays" type="number" class="w-full px-4 py-2 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 rounded-xl text-sm font-bold" />
          </div>
          <div class="flex gap-3">
            <button @click="showApplyContactSubmissionsModal = false" class="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-[#4c739a]">Batal</button>
            <button @click="applyContactSubmissionsRetention" :disabled="applying" class="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700">{{ applying ? '...' : 'Hapus' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Demo Requests Modal -->
    <Teleport to="body">
      <div v-if="showApplyDemoRequestsModal" class="fixed inset-0 bg-[#0d141b]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showApplyDemoRequestsModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in border-t-4 border-red-500">
           <div class="flex items-start gap-4 mb-4">
             <div class="bg-red-100 dark:bg-red-900/30 p-2 rounded-full text-red-600 shrink-0">
                <span class="material-symbols-outlined text-2xl">warning</span>
             </div>
             <div>
                <h3 class="text-lg font-bold text-[#0d141b] dark:text-white">Hapus Demo Requests</h3>
                <p class="text-sm text-[#4c739a]">Hapus <strong class="text-red-600">{{ stats.demoRequestsToDelete || 0 }} demo requests</strong> permanen.</p>
             </div>
          </div>
          <div class="mb-4">
            <input v-model.number="applyDemoRequestsDays" type="number" class="w-full px-4 py-2 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 rounded-xl text-sm font-bold" />
          </div>
          <div class="flex gap-3">
            <button @click="showApplyDemoRequestsModal = false" class="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-[#4c739a]">Batal</button>
            <button @click="applyDemoRequestsRetention" :disabled="applying" class="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700">{{ applying ? '...' : 'Hapus' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Apply All Modal -->
    <Teleport to="body">
      <div v-if="showApplyAllModal" class="fixed inset-0 bg-[#0d141b]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showApplyAllModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full p-6 animate-scale-in border-t-4 border-red-500">
           <div class="flex items-start gap-4 mb-6">
              <div class="bg-red-100 dark:bg-red-900/30 p-3 rounded-full text-red-600 shrink-0">
                 <span class="material-symbols-outlined text-3xl">delete_forever</span>
              </div>
              <div>
                 <h3 class="text-2xl font-bold text-[#0d141b] dark:text-white">Pembersihan Total</h3>
                 <p class="text-sm text-[#4c739a] mt-1">
                   Tindakan ini akan menghapus <strong>SEMUA</strong> data lama (Orders, Transactions, Reports, Logs, Contacts) yang melewati batas waktu retensi. 
                 </p>
                 <div class="mt-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl">
                   <p class="text-xs font-bold text-red-800 dark:text-red-200 uppercase tracking-wider mb-2">Ringkasan Penghapusan</p>
                   <ul class="grid grid-cols-2 gap-2 text-sm text-red-700 dark:text-red-300">
                     <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>{{ stats.ordersToDelete || 0 }} Orders</li>
                     <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>{{ stats.transactionsToDelete || 0 }} Trans</li>
                     <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>{{ stats.reportsToDelete || 0 }} Reports</li>
                     <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>{{ stats.auditLogsToDelete || 0 }} Logs</li>
                   </ul>
                 </div>
              </div>
           </div>
           
           <div class="flex gap-3">
              <button @click="showApplyAllModal = false" class="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-[#4c739a] hover:bg-slate-50 transition">Batalkan</button>
              <button 
                @click="applyAllRetention" 
                :disabled="applying"
                class="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-500/30 hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span v-if="applying" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                {{ applying ? 'Memproses...' : 'Ya, Hapus Semua' }}
              </button>
           </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';
import { useTenantCheck } from '../../composables/useTenantCheck';

const { needsTenantSelection } = useTenantCheck();
const { success: showSuccess, error: showError, confirm: showConfirm } = useNotification();

const loading = ref(true);
const applying = ref(false);
const stats = ref({
  ordersToDelete: 0,
  transactionsToDelete: 0,
  reportsToDelete: 0,
  auditLogsToDelete: 0,
  contactSubmissionsToDelete: 0,
  demoRequestsToDelete: 0,
});

const retentionPolicy = ref({
  orders: 730, // 2 years default
  transactions: 730, // 2 years default
  reports: 730, // 2 years default
  auditLogs: 730, // 2 years default
  contactSubmissions: 730, // 2 years default
  demoRequests: 730, // 2 years default
});

const showApplyOrdersModal = ref(false);
const showApplyTransactionsModal = ref(false);
const showApplyReportsModal = ref(false);
const showApplyAuditLogsModal = ref(false);
const showApplyContactSubmissionsModal = ref(false);
const showApplyDemoRequestsModal = ref(false);
const showApplyAllModal = ref(false);

const applyOrdersDays = ref(730); // 2 years default
const applyTransactionsDays = ref(730); // 2 years default
const applyReportsDays = ref(730); // 2 years default
const applyAuditLogsDays = ref(730); // 2 years default
const applyContactSubmissionsDays = ref(730); // 2 years default
const applyDemoRequestsDays = ref(730); // 2 years default

const loadStats = async () => {
  // SUPER_ADMIN can view stats for all tenants without selecting tenant
  try {
    const policy = {
      orders: retentionPolicy.value.orders,
      transactions: retentionPolicy.value.transactions,
      reports: retentionPolicy.value.reports,
      auditLogs: retentionPolicy.value.auditLogs,
      contactSubmissions: retentionPolicy.value.contactSubmissions,
      demoRequests: retentionPolicy.value.demoRequests,
    };
    const response = await api.get('/retention/stats', {
      params: { policy: JSON.stringify(policy) },
    });
    stats.value = response.data;
  } catch (error: any) {
    console.error('Error loading retention stats:', error);
    if (error.response?.status === 403) {
      showError('Anda tidak memiliki akses untuk melihat statistik retensi. Hanya Super Admin yang bisa mengakses.');
    } else {
      showError(error.response?.data?.message || 'Gagal memuat statistik retensi');
    }
  }
};

const applyOrdersRetention = async () => {
  const confirmed = await showConfirm(
    'Hapus Orders Lama',
    `Apakah Anda yakin ingin menghapus ${stats.value.ordersToDelete || 0} orders? Tindakan ini tidak dapat dibatalkan.`,
    'Hapus',
    'Cancel'
  );
  
  if (!confirmed) {
    showApplyOrdersModal.value = false;
    return;
  }

  applying.value = true;
  try {
    const response = await api.post('/retention/orders', {
      days: applyOrdersDays.value || retentionPolicy.value.orders || 730,
    });
    showSuccess(`Berhasil menghapus ${response.data.deletedCount} orders`);
    showApplyOrdersModal.value = false;
    await loadStats();
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal menghapus orders');
  } finally {
    applying.value = false;
  }
};

const applyTransactionsRetention = async () => {
  const confirmed = await showConfirm(
    'Hapus Transactions Lama',
    `Apakah Anda yakin ingin menghapus ${stats.value.transactionsToDelete || 0} transactions? Tindakan ini tidak dapat dibatalkan.`,
    'Hapus',
    'Cancel'
  );
  
  if (!confirmed) {
    showApplyTransactionsModal.value = false;
    return;
  }

  applying.value = true;
  try {
    const response = await api.post('/retention/transactions', {
      days: applyTransactionsDays.value || retentionPolicy.value.transactions || 730,
    });
    showSuccess(`Berhasil menghapus ${response.data.deletedCount} transactions`);
    showApplyTransactionsModal.value = false;
    await loadStats();
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal menghapus transactions');
  } finally {
    applying.value = false;
  }
};

const applyReportsRetention = async () => {
  const confirmed = await showConfirm(
    'Hapus Reports Lama',
    `Apakah Anda yakin ingin menghapus ${stats.value.reportsToDelete || 0} reports? Tindakan ini tidak dapat dibatalkan.`,
    'Hapus',
    'Cancel'
  );
  
  if (!confirmed) {
    showApplyReportsModal.value = false;
    return;
  }

  applying.value = true;
  try {
    const response = await api.post('/retention/reports', {
      days: applyReportsDays.value || retentionPolicy.value.reports || 730,
    });
    showSuccess(`Berhasil menghapus ${response.data.deletedCount} reports`);
    showApplyReportsModal.value = false;
    await loadStats();
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal menghapus reports');
  } finally {
    applying.value = false;
  }
};

const applyAuditLogsRetention = async () => {
  const confirmed = await showConfirm(
    'Hapus Audit Logs Lama',
    `Apakah Anda yakin ingin menghapus ${stats.value.auditLogsToDelete || 0} audit logs? Tindakan ini tidak dapat dibatalkan.`,
    'Hapus',
    'Cancel'
  );
  
  if (!confirmed) {
    showApplyAuditLogsModal.value = false;
    return;
  }

  applying.value = true;
  try {
    const response = await api.post('/retention/audit-logs', {
      days: applyAuditLogsDays.value || retentionPolicy.value.auditLogs || 730,
    });
    showSuccess(`Berhasil menghapus ${response.data.deletedCount} audit logs`);
    showApplyAuditLogsModal.value = false;
    await loadStats();
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal menghapus audit logs');
  } finally {
    applying.value = false;
  }
};

const applyContactSubmissionsRetention = async () => {
  const confirmed = await showConfirm(
    'Hapus Contact Submissions Lama',
    `Apakah Anda yakin ingin menghapus ${stats.value.contactSubmissionsToDelete || 0} contact submissions? Tindakan ini tidak dapat dibatalkan.`,
    'Hapus',
    'Cancel'
  );
  
  if (!confirmed) {
    showApplyContactSubmissionsModal.value = false;
    return;
  }

  applying.value = true;
  try {
    const response = await api.post('/retention/contact-submissions', {
      days: applyContactSubmissionsDays.value || retentionPolicy.value.contactSubmissions || 730,
    });
    showSuccess(`Berhasil menghapus ${response.data.deletedCount} contact submissions`);
    showApplyContactSubmissionsModal.value = false;
    await loadStats();
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal menghapus contact submissions');
  } finally {
    applying.value = false;
  }
};

const applyDemoRequestsRetention = async () => {
  const confirmed = await showConfirm(
    'Hapus Demo Requests Lama',
    `Apakah Anda yakin ingin menghapus ${stats.value.demoRequestsToDelete || 0} demo requests? Tindakan ini tidak dapat dibatalkan.`,
    'Hapus',
    'Cancel'
  );
  
  if (!confirmed) {
    showApplyDemoRequestsModal.value = false;
    return;
  }

  applying.value = true;
  try {
    const response = await api.post('/retention/demo-requests', {
      days: applyDemoRequestsDays.value || retentionPolicy.value.demoRequests || 730,
    });
    showSuccess(`Berhasil menghapus ${response.data.deletedCount} demo requests`);
    showApplyDemoRequestsModal.value = false;
    await loadStats();
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal menghapus demo requests');
  } finally {
    applying.value = false;
  }
};

const applyAllRetention = async () => {
  const confirmed = await showConfirm(
    'Terapkan Semua Kebijakan Retensi',
    'APAKAH ANDA YAKIN? Tindakan ini akan menghapus semua data lama yang memenuhi kriteria retensi. Data yang dihapus TIDAK DAPAT DIKEMBALIKAN.',
    'YA, HAPUS SEMUA',
    'Batal'
  );
  
  if (!confirmed) return;

  applying.value = true;
  try {
    const response = await api.post('/retention/apply-all', {
      policy: retentionPolicy.value
    });
    
    let message = 'Penghapusan selesai: ';
    const results = response.data.results || {};
    message += `${results.orders || 0} orders, ${results.transactions || 0} transactions, ${results.reports || 0} reports`;
    
    showSuccess(message);
    showApplyAllModal.value = false;
    await loadStats();
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal menerapkan kebijakan retensi');
  } finally {
    applying.value = false;
  }
};

onMounted(async () => {
  loading.value = true;
  await loadStats();
  loading.value = false;
});
</script>
