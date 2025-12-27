<template>
  <div class="flex flex-col gap-6">
    <!-- Page Header (Adapted from Design) -->
    <div class="flex items-center justify-between py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-6 shadow-sm">
        <div>
           <nav class="flex items-center gap-2 text-sm text-[#4c739a] dark:text-slate-400 mb-1">
              <span class="hover:text-emerald-600 transition-colors cursor-pointer">Home</span>
              <span class="text-xs">/</span>
              <span class="text-[#0d141b] dark:text-white font-medium">System Monitor</span>
           </nav>
           <h2 class="text-[#0d141b] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">System Health Monitor</h2>
        </div>
        <div class="flex items-center gap-4">
           <div class="hidden md:flex items-center bg-[#f6f7f8] dark:bg-slate-700 rounded-lg px-3 py-2 w-64 focus-within:ring-2 ring-emerald-500/50 transition-all border border-transparent focus-within:border-emerald-500/50">
              <span class="material-symbols-outlined text-[#4c739a] dark:text-slate-400 text-[20px]">search</span>
              <input class="bg-transparent border-none text-sm w-full focus:ring-0 text-[#0d141b] dark:text-white placeholder:text-[#4c739a] dark:placeholder:text-slate-400 !p-0 !pl-2" placeholder="Search logs, errors..." type="text"/>
           </div>
           <button class="relative p-2 text-[#4c739a] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <span class="material-symbols-outlined">notifications_active</span>
              <span class="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white dark:border-[#1e293b] animate-pulse"></span>
           </button>
        </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
      <div class="flex items-center p-2 gap-2 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.value"
          class="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all whitespace-nowrap"
          :class="activeTab === tab.value 
            ? 'bg-[#10b981] text-white shadow-lg shadow-emerald-500/30' 
            : 'text-[#4c739a] hover:bg-[#f6f7f8] dark:hover:bg-slate-700'"
        >
          <span class="material-symbols-outlined text-[20px]">{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !serverResources.uptime" class="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div class="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <div class="text-[#4c739a] font-medium text-sm animate-pulse">Establishing secure connection...</div>
    </div>

    <div v-else class="flex-1 min-h-0">
       
       <!-- OVERVIEW DASHBOARD (New Design) -->
       <div v-if="activeTab === 'overview'" class="flex flex-col gap-6">
          <!-- Operational Status Header -->
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
             <div>
                <div class="flex items-center gap-3">
                   <div class="live-dot size-3 bg-green-500 rounded-full relative">
                      <div class="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                   </div>
                   <h1 class="text-[#0d141b] dark:text-white text-3xl font-bold leading-tight tracking-tight">System Operational</h1>
                </div>
                <p class="text-[#4c739a] dark:text-slate-400 mt-2">All core services are running within expected parameters. Last updated: Just now.</p>
             </div>
             <div class="flex gap-3">
                <button class="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 text-[#0d141b] dark:text-white flex items-center gap-2 transition-colors">
                   <span class="material-symbols-outlined text-[18px]">history</span>
                   View History
                </button>
                <button @click="loadAllData" class="px-4 py-2 bg-slate-800 dark:bg-slate-600 hover:bg-slate-900 dark:hover:bg-slate-500 rounded-lg text-sm font-medium text-white shadow-lg flex items-center gap-2 transition-colors">
                   <span class="material-symbols-outlined text-[18px]">refresh</span>
                   Run Diagnostics
                </button>
             </div>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
             <!-- Uptime -->
             <div class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-shadow group">
                <div class="flex justify-between items-start">
                   <div class="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg group-hover:scale-110 transition-transform">
                      <span class="material-symbols-outlined text-green-600">check_circle</span>
                   </div>
                   <span class="flex items-center text-[#078838] bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded text-xs font-semibold">
                      Stable
                   </span>
                </div>
                <div>
                   <p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Server Uptime</p>
                   <p class="text-[#0d141b] dark:text-white text-xl font-bold mt-1 truncate">{{ serverResources.uptime || '99.99%' }}</p>
                </div>
             </div>
             <!-- API Latency -->
             <div class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-shadow group">
                <div class="flex justify-between items-start">
                   <div class="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:scale-110 transition-transform">
                      <span class="material-symbols-outlined text-blue-600">speed</span>
                   </div>
                   <span class="flex items-center text-[#078838] bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded text-xs font-semibold">
                      <span class="material-symbols-outlined text-[14px] mr-0.5">arrow_downward</span> 5ms
                   </span>
                </div>
                <div>
                   <p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium uppercase tracking-wide">API Latency (Avg)</p>
                   <p class="text-[#0d141b] dark:text-white text-xl font-bold mt-1">45ms</p>
                </div>
             </div>
             <!-- DB Connections -->
             <div class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-shadow group">
                <div class="flex justify-between items-start">
                   <div class="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg group-hover:scale-110 transition-transform">
                      <span class="material-symbols-outlined text-purple-600">database</span>
                   </div>
                   <span class="flex items-center text-[#078838] bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded text-xs font-semibold">
                       Normal
                   </span>
                </div>
                <div>
                   <p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium uppercase tracking-wide">DB Connections</p>
                   <p class="text-[#0d141b] dark:text-white text-xl font-bold mt-1">482 / 1000</p>
                </div>
             </div>
             <!-- Error Rate -->
             <div class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-shadow group">
                <div class="flex justify-between items-start">
                   <div class="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg group-hover:scale-110 transition-transform">
                      <span class="material-symbols-outlined text-orange-600">bug_report</span>
                   </div>
                   <span class="flex items-center text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded text-xs font-semibold">
                       0.02%
                   </span>
                </div>
                <div>
                   <p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Error Rate</p>
                   <p class="text-[#0d141b] dark:text-white text-xl font-bold mt-1">24 Errors</p>
                </div>
             </div>
             <!-- CPU Usage -->
             <div class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-shadow group">
                <div class="flex justify-between items-start">
                   <div class="p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg group-hover:scale-110 transition-transform">
                      <span class="material-symbols-outlined text-cyan-600">memory</span>
                   </div>
                   <span class="flex items-center text-[#078838] bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded text-xs font-semibold">
                      Low Load
                   </span>
                </div>
                <div>
                   <p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium uppercase tracking-wide">CPU Usage</p>
                   <p class="text-[#0d141b] dark:text-white text-xl font-bold mt-1">{{ serverResources.cpu || '0' }}%</p>
                </div>
             </div>
          </div>

          <!-- Charts & Logs Split -->
          <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
             <!-- Left Column: Chart & Logs (Span 2) -->
             <div class="xl:col-span-2 flex flex-col gap-6">
                <!-- Traffic Chart -->
                <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col gap-6">
                   <div class="flex items-center justify-between">
                      <h3 class="text-[#0d141b] dark:text-white text-lg font-bold">API Traffic & Latency (Last 24h)</h3>
                      <div class="flex items-center gap-2">
                         <span class="flex items-center gap-1 text-xs text-[#4c739a]"><div class="w-3 h-3 bg-emerald-500 rounded-sm"></div> Requests</span>
                         <span class="flex items-center gap-1 text-xs text-[#4c739a]"><div class="w-3 h-3 bg-red-400 rounded-sm"></div> Latency > 200ms</span>
                      </div>
                   </div>
                   <!-- CSS Bar Chart Implementation -->
                   <div class="h-64 w-full flex items-end justify-between gap-1 overflow-hidden pt-4">
                      <div v-for="(bar, index) in mockChartBars" :key="index" class="w-full rounded-t transition-all relative group" :class="bar.color" :style="{ height: bar.height }"></div>
                   </div>
                   <div class="flex justify-between text-xs text-[#4c739a] border-t border-slate-100 dark:border-slate-700 pt-2 font-mono">
                      <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
                   </div>
                </div>

                <!-- Recent Logs Table -->
                <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
                   <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                      <div class="flex items-center gap-2">
                         <h3 class="text-[#0d141b] dark:text-white text-lg font-bold">Recent System Logs</h3>
                         <span class="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Live</span>
                      </div>
                      <button @click="activeTab = 'logs'" class="text-sm text-emerald-600 font-bold hover:underline flex items-center gap-1">
                         Open Log Explorer <span class="material-symbols-outlined text-[16px]">open_in_new</span>
                      </button>
                   </div>
                   <div class="overflow-x-auto">
                      <table class="w-full text-left border-collapse">
                         <thead class="bg-slate-50 dark:bg-slate-900/50 text-[#4c739a] dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                            <tr>
                               <th class="px-6 py-4">Timestamp</th>
                               <th class="px-6 py-4">Severity</th>
                               <th class="px-6 py-4">Service</th>
                               <th class="px-6 py-4">Message</th>
                               <th class="px-6 py-4">Node</th>
                            </tr>
                         </thead>
                         <tbody class="divide-y divide-slate-100 dark:divide-slate-700 font-mono text-xs">
                            <tr v-for="(log, idx) in recentLogs" :key="idx" class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                               <td class="px-6 py-4 text-[#4c739a] dark:text-slate-400">{{ log.time }}</td>
                               <td class="px-6 py-4">
                                  <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase" :class="getSeverityClass(log.severity)">
                                     {{ log.severity }}
                                  </span>
                               </td>
                               <td class="px-6 py-4 text-[#0d141b] dark:text-white font-medium">{{ log.service }}</td>
                               <td class="px-6 py-4 text-[#4c739a] dark:text-slate-400 truncate max-w-xs">{{ log.message }}</td>
                               <td class="px-6 py-4 text-[#4c739a] dark:text-slate-400">{{ log.node }}</td>
                            </tr>
                         </tbody>
                      </table>
                   </div>
                </div>
             </div>

             <!-- Right Column: Alerts & Resources -->
             <div class="flex flex-col gap-6">
                <!-- Alerts Panel -->
                <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col gap-6">
                   <div class="flex items-center justify-between">
                      <h3 class="text-[#0d141b] dark:text-white text-lg font-bold">Active Alerts</h3>
                      <span class="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">2 Critical</span>
                   </div>
                   <div class="flex flex-col gap-4">
                      <div class="flex gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg">
                         <span class="material-symbols-outlined text-red-600 mt-0.5">warning</span>
                         <div>
                            <p class="text-sm font-bold text-red-700 dark:text-red-400">High Memory Usage</p>
                            <p class="text-xs text-red-600/80 dark:text-red-300/70 mt-1">Node <span class="font-mono">worker-03</span> is running at 92% RAM capacity.</p>
                            <div class="mt-2 flex gap-2">
                               <button class="text-xs font-bold underline text-red-700 hover:text-red-900">Restart Node</button>
                               <button class="text-xs font-semibold text-red-700/70 hover:text-red-900">Dismiss</button>
                            </div>
                         </div>
                      </div>
                      <div class="flex gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-lg">
                         <span class="material-symbols-outlined text-amber-600 mt-0.5">schedule</span>
                         <div>
                            <p class="text-sm font-bold text-amber-700 dark:text-amber-400">Backup Delayed</p>
                            <p class="text-xs text-amber-600/80 dark:text-amber-300/70 mt-1">Daily DB backup is running 15 minutes longer than average.</p>
                         </div>
                      </div>
                   </div>
                </div>

                <!-- Cluster Resources Panel -->
                <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col gap-6">
                   <h3 class="text-[#0d141b] dark:text-white text-lg font-bold">Cluster Resources</h3>
                   <div class="flex flex-col gap-5">
                      <div class="flex flex-col gap-2">
                         <div class="flex justify-between items-end">
                            <div class="flex items-center gap-2">
                               <span class="material-symbols-outlined text-xs text-[#4c739a]">memory</span>
                               <span class="text-sm font-medium text-[#0d141b] dark:text-white">CPU Aggregate</span>
                            </div>
                            <span class="text-xs font-semibold text-[#0d141b] dark:text-white">{{ serverResources.cpu || '45' }}%</span>
                         </div>
                         <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                            <div class="bg-emerald-500 h-2 rounded-full transition-all duration-500" :style="{ width: (serverResources.cpu || '45') + '%' }"></div>
                         </div>
                      </div>
                      <div class="flex flex-col gap-2">
                         <div class="flex justify-between items-end">
                            <div class="flex items-center gap-2">
                               <span class="material-symbols-outlined text-xs text-[#4c739a]">sd_card</span>
                               <span class="text-sm font-medium text-[#0d141b] dark:text-white">RAM Usage</span>
                            </div>
                            <span class="text-xs font-semibold text-[#0d141b] dark:text-white">{{ serverResources.memory || '68' }}%</span>
                         </div>
                         <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                            <div class="bg-blue-400 h-2 rounded-full transition-all duration-500" :style="{ width: (serverResources.memory || '68') + '%' }"></div>
                         </div>
                      </div>
                      <div class="flex flex-col gap-2">
                         <div class="flex justify-between items-end">
                            <div class="flex items-center gap-2">
                               <span class="material-symbols-outlined text-xs text-[#4c739a]">hard_drive</span>
                               <span class="text-sm font-medium text-[#0d141b] dark:text-white">Storage</span>
                            </div>
                            <span class="text-xs font-semibold text-[#0d141b] dark:text-white">22%</span>
                         </div>
                         <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                            <div class="bg-green-500 h-2 rounded-full transition-all duration-500" style="width: 22%"></div>
                         </div>
                      </div>
                      <div class="flex flex-col gap-2">
                         <div class="flex justify-between items-end">
                            <div class="flex items-center gap-2">
                               <span class="material-symbols-outlined text-xs text-[#4c739a]">cloud_queue</span>
                               <span class="text-sm font-medium text-[#0d141b] dark:text-white">S3 Bandwidth</span>
                            </div>
                            <span class="text-xs font-semibold text-[#0d141b] dark:text-white">85%</span>
                         </div>
                         <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                            <div class="bg-amber-400 h-2 rounded-full transition-all duration-500" style="width: 85%"></div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </div>

       <!-- DOCKER TAB (Restyled) -->
       <div v-if="activeTab === 'docker'" class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
          <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/30">
             <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-emerald-600">layers</span>
                <h3 class="text-lg font-bold text-[#0d141b] dark:text-white">Docker Containers</h3>
             </div>
             <button @click="loadContainers" class="p-2 text-[#4c739a] hover:text-emerald-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-all">
                <span class="material-symbols-outlined">refresh</span>
             </button>
          </div>
          
          <div v-if="containers.length === 0" class="flex flex-col items-center justify-center py-16">
             <span class="material-symbols-outlined text-slate-300 text-5xl mb-2">layers_clear</span>
             <p class="text-[#4c739a] font-medium">No containers found</p>
          </div>

          <div v-else class="overflow-x-auto">
             <table class="w-full text-left border-collapse">
                <thead class="bg-slate-50 dark:bg-slate-900/50 text-[#4c739a] dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                   <tr>
                      <th class="px-6 py-4">Name</th>
                      <th class="px-6 py-4">Image</th>
                      <th class="px-6 py-4">Status</th>
                      <th class="px-6 py-4">CPU</th>
                      <th class="px-6 py-4">Memory</th>
                      <th class="px-6 py-4 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                   <tr v-for="container in containers" :key="container.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td class="px-6 py-4"><span class="font-bold text-[#0d141b] dark:text-white">{{ container.name }}</span></td>
                      <td class="px-6 py-4"><span class="font-mono text-xs text-[#4c739a]">{{ container.image }}</span></td>
                      <td class="px-6 py-4">
                         <span class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border" 
                           :class="container.status === 'running' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                              : 'bg-red-50 text-red-700 border-red-100'">
                            {{ container.status }}
                         </span>
                      </td>
                      <td class="px-6 py-4 font-mono text-xs">{{ container.cpu || '-' }}</td>
                      <td class="px-6 py-4 font-mono text-xs">{{ container.memory || '-' }}</td>
                      <td class="px-6 py-4 text-right">
                         <div class="flex items-center justify-end gap-1">
                            <button @click="viewLogs(container.name)" class="p-2 text-[#4c739a] hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition" title="View Logs"><span class="material-symbols-outlined text-[18px]">terminal</span></button>
                            <button v-if="container.status === 'running'" @click="restartContainer(container.name)" class="p-2 text-[#4c739a] hover:text-amber-600 hover:bg-amber-50 rounded-lg transition" title="Restart"><span class="material-symbols-outlined text-[18px]">restart_alt</span></button>
                            <button v-if="container.status === 'running'" @click="stopContainer(container.name)" class="p-2 text-[#4c739a] hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Stop"><span class="material-symbols-outlined text-[18px]">stop_circle</span></button>
                         </div>
                      </td>
                   </tr>
                </tbody>
             </table>
          </div>
       </div>

       <!-- HEALTH TAB (Restyled) -->
       <div v-if="activeTab === 'health'" class="flex flex-col gap-6">
          <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
             <h3 class="font-bold text-[#0d141b] dark:text-white mb-6 text-lg">Service Network Health</h3>
             <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-for="service in healthChecks" :key="service.name" 
                   class="flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-md"
                   :class="service.status === 'healthy' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'">
                   <div class="flex items-center gap-3">
                      <div class="relative">
                         <div class="w-3 h-3 rounded-full" :class="service.status === 'healthy' ? 'bg-emerald-500' : 'bg-red-500'"></div>
                         <div class="absolute inset-0 rounded-full animate-ping opacity-50" :class="service.status === 'healthy' ? 'bg-emerald-500' : 'bg-red-500'"></div>
                      </div>
                      <div>
                         <div class="font-bold text-[#0d141b] dark:text-white text-sm">{{ service.name }}</div>
                         <div v-if="service.message" class="text-xs text-[#4c739a]">{{ service.message }}</div>
                      </div>
                   </div>
                   <span class="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider" 
                      :class="service.status === 'healthy' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'">
                      {{ service.status }}
                   </span>
                </div>
             </div>
          </div>
       </div>

       <!-- LOGS TAB (Restyled) -->
       <div v-if="activeTab === 'logs'" class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-[calc(100vh-250px)]">
          <div class="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/30">
             <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-emerald-600">terminal</span>
                <h3 class="font-bold text-[#0d141b] dark:text-white text-lg">System Logs Explorer</h3>
             </div>
             <div class="flex items-center gap-2">
                <select v-model="selectedLogType" @change="loadLogs" class="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500">
                   <option value="backend">Backend Service</option>
                   <option value="frontend">Frontend Client</option>
                   <option value="nginx">Nginx Proxy</option>
                   <option value="postgres">PostgreSQL DB</option>
                   <option value="redis">Redis Cache</option>
                </select>
                <button @click="loadLogs" class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 transition">
                   Refresh Stream
                </button>
             </div>
          </div>
          <div class="flex-1 overflow-hidden bg-[#1e1e1e] relative rounded-b-xl">
             <div class="absolute inset-0 overflow-auto p-4 font-mono text-xs leading-relaxed text-emerald-200/90 tracking-wide">
                <pre v-if="logs">{{ logs }}</pre>
                <div v-else class="text-slate-500 italic p-4">No logs available for this service stream.</div>
             </div>
          </div>
       </div>
    </div>

    <!-- Logs Modal for Docker -->
    <Teleport to="body">
       <div v-if="showLogsModal" class="fixed inset-0 bg-[#0d141b]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all" @click.self="showLogsModal = false">
          <div class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-5xl w-full h-[80vh] flex flex-col overflow-hidden animate-scale-in border border-slate-700">
             <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
                <div class="flex items-center gap-3">
                   <div class="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                      <span class="material-symbols-outlined text-emerald-600">terminal</span>
                   </div>
                   <div>
                      <h3 class="font-bold text-[#0d141b] dark:text-white">Container Logs</h3>
                      <p class="text-xs text-[#4c739a] font-mono mt-0.5">{{ selectedContainerName }}</p>
                   </div>
                </div>
                <button @click="showLogsModal = false" class="p-2 text-[#4c739a] hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                   <span class="material-symbols-outlined">close</span>
                </button>
             </div>
             <div class="flex-1 bg-[#1e1e1e] overflow-hidden relative">
                <div class="absolute inset-0 overflow-auto p-6 font-mono text-xs leading-relaxed text-emerald-200/90 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                   <pre v-if="containerLogs">{{ containerLogs }}</pre>
                   <div v-else class="text-slate-500 italic flex items-center gap-2">
                      <span class="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></span>
                      Fetching log stream...
                   </div>
                </div>
             </div>
          </div>
       </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';

const { confirm, success, error } = useNotification();

const loading = ref(true);
const activeTab = ref('overview');
const tabs = [
  { value: 'overview', label: 'Overview', icon: 'dashboard' },
  { value: 'docker', label: 'Docker Containers', icon: 'layers' },
  { value: 'health', label: 'Health Status', icon: 'monitor_heart' },
  { value: 'logs', label: 'System Logs', icon: 'terminal' },
];

const containers = ref<any[]>([]);
const serverResources = ref<any>({});
const healthChecks = ref<any[]>([]);
const logs = ref('');
const selectedLogType = ref('backend');
const showLogsModal = ref(false);
const selectedContainerName = ref('');
const containerLogs = ref('');

// Mock Data for Visuals
const recentLogs = [
   { time: '14:23:01', severity: 'INFO', service: 'auth-service', message: 'Token rotation successful for user_pool_1', node: 'worker-01' },
   { time: '14:22:45', severity: 'WARN', service: 'database-proxy', message: 'Slow query detected (205ms) in table table_users', node: 'db-read-02' },
   { time: '14:21:12', severity: 'ERROR', service: 'payment-gateway', message: 'Connection timeout to external provider API', node: 'worker-03' },
   { time: '14:20:55', severity: 'INFO', service: 'cron-job', message: 'Daily reconciliation job completed successfully', node: 'master-01' },
];

const mockChartBars = [
    { height: '45%', color: 'bg-emerald-500/20 hover:bg-emerald-500/40' },
    { height: '35%', color: 'bg-emerald-500/30 hover:bg-emerald-500/50' },
    { height: '60%', color: 'bg-emerald-500/40 hover:bg-emerald-500/60' },
    { height: '75%', color: 'bg-emerald-500 hover:bg-blue-600' },
    { height: '50%', color: 'bg-emerald-500 hover:bg-blue-600' },
    { height: '65%', color: 'bg-emerald-500/80 hover:bg-emerald-500' },
    { height: '40%', color: 'bg-emerald-500/60 hover:bg-emerald-500/80' },
    { height: '30%', color: 'bg-emerald-500/40 hover:bg-emerald-500/60' },
    { height: '90%', color: 'bg-red-400 hover:bg-red-500 animate-pulse' }, // Spike
    { height: '55%', color: 'bg-emerald-500 hover:bg-blue-600' },
    { height: '45%', color: 'bg-emerald-500 hover:bg-blue-600' },
    { height: '60%', color: 'bg-emerald-500/70 hover:bg-emerald-500' },
    { height: '35%', color: 'bg-emerald-500/50 hover:bg-emerald-500/70' },
    { height: '25%', color: 'bg-emerald-500/30 hover:bg-emerald-500/50' },
    { height: '50%', color: 'bg-emerald-500 hover:bg-blue-600' },
    { height: '65%', color: 'bg-emerald-500 hover:bg-blue-600' },
    { height: '70%', color: 'bg-emerald-500 hover:bg-blue-600' },
    { height: '55%', color: 'bg-emerald-500/80 hover:bg-emerald-500' },
    { height: '40%', color: 'bg-emerald-500/60 hover:bg-emerald-500/80' },
    { height: '30%', color: 'bg-emerald-500/40 hover:bg-emerald-500/60' },
    { height: '45%', color: 'bg-emerald-500 hover:bg-blue-600' },
    { height: '55%', color: 'bg-emerald-500 hover:bg-blue-600' },
    { height: '50%', color: 'bg-emerald-500 hover:bg-blue-600' },
    { height: '40%', color: 'bg-emerald-500 hover:bg-blue-600' }
];

const getSeverityClass = (sev: string) => {
   if (sev === 'INFO') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
   if (sev === 'WARN') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
   if (sev === 'ERROR') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
   return 'bg-slate-100 text-slate-700';
};

let refreshInterval: any = null;

const loadContainers = async () => {
  try {
    const response = await api.get('/admin/docker/containers', { timeout: 15000 });
    containers.value = response.data?.containers || [];
  } catch (err: any) {
    if (err.code !== 'ECONNABORTED' && !err.message?.includes('timeout')) {
      console.error('Error loading containers:', err);
    }
    containers.value = [];
  }
};

const loadServerResources = async () => {
  try {
    const response = await api.get('/admin/server/resources', { timeout: 10000 });
    serverResources.value = response.data || {};
  } catch (err) {
    console.error('Error loading resources', err);
    serverResources.value = {};
  }
};

const loadHealthChecks = async () => {
  try {
    const response = await api.get('/admin/health', { timeout: 10000 });
    healthChecks.value = response.data?.services || [];
  } catch (err) {
    console.error('Error loading health', err);
    healthChecks.value = [];
  }
};

const loadLogs = async () => {
  try {
    const response = await api.get(`/admin/logs/${selectedLogType.value}?tail=200`);
    logs.value = response.data.logs || '';
  } catch (err) {
    console.error('Error loading logs', err);
  }
};

const viewLogs = async (containerName: string) => {
  selectedContainerName.value = containerName;
  showLogsModal.value = true;
  containerLogs.value = ''; 
  try {
    const response = await api.get(`/admin/docker/logs/${containerName}?tail=500`);
    containerLogs.value = response.data.logs || '';
  } catch (err) {
    console.error('Error loading container logs', err);
    containerLogs.value = 'Failed to load logs.';
  }
};

const restartContainer = async (containerName: string) => {
  const confirmed = await confirm(`Restart "${containerName}"?`, 'Confirm Restart', 'Restart', 'Cancel');
  if (!confirmed) return;
  try {
    await api.post(`/admin/docker/restart/${containerName}`);
    await success('Container restarted', 'Success');
    await loadContainers();
  } catch (err) {
    await error('Failed to restart container', 'Error');
  }
};

const stopContainer = async (containerName: string) => {
  const confirmed = await confirm(`Stop "${containerName}"?`, 'Confirm Stop', 'Stop', 'Cancel');
  if (!confirmed) return;
  try {
    await api.post(`/admin/docker/stop/${containerName}`);
    await success('Container stopped', 'Success');
    await loadContainers();
  } catch (err) {
    await error('Failed to stop container', 'Error');
  }
};

const loadAllData = async () => {
  loading.value = true;
  await Promise.all([loadContainers(), loadServerResources(), loadHealthChecks(), loadLogs()]);
  loading.value = false;
};

onMounted(() => {
  loadAllData();
  refreshInterval = setInterval(() => {
    if (activeTab.value === 'docker') loadContainers();
    else if (activeTab.value === 'overview') {
        loadServerResources(); // Refresh stats on overview
        loadHealthChecks();
    }
    else if (activeTab.value === 'health') loadHealthChecks();
  }, 10000);
});

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval);
});
</script>

<style scoped>
/* Custom animations */
@keyframes pulse-dot {
    0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
    70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
    100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}
.live-dot {
    animation: pulse-dot 2s infinite;
}
</style>
