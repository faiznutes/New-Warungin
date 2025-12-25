<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col">
        <h2 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Server Monitor</h2>
        <p class="text-slate-500 dark:text-slate-400 mt-1">Monitor server health, Docker stack, and resource usage.</p>
      </div>
      <div class="flex items-center gap-2">
         <span class="relative flex h-3 w-3">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
         </span>
         <span class="text-xs font-bold text-emerald-600 uppercase tracking-wider">Live Monitoring</span>
      </div>
    </div>

    <!-- Tabs -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50">
      <div class="flex items-center p-2 gap-2 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all whitespace-nowrap"
          :class="activeTab === tab.id 
            ? 'bg-primary text-white shadow-lg shadow-primary/30' 
            : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'"
        >
          <span class="material-symbols-outlined text-[20px]">{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Content Area -->
    <div v-if="loading && !containers.length && !serverResources.cpu" class="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50">
      <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
      <div class="text-slate-500 font-medium text-sm">Connecting to server...</div>
    </div>

    <div v-else class="flex-1 min-h-0">
      <!-- Docker Containers Tab -->
      <div v-if="activeTab === 'docker'" class="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 overflow-hidden flex flex-col h-full">
        <div class="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">Docker Containers</h3>
          <button
            @click="loadContainers"
            class="p-2 text-slate-500 hover:text-primary rounded-lg hover:bg-slate-50 transition"
            title="Refresh"
          >
            <span class="material-symbols-outlined">refresh</span>
          </button>
        </div>

        <div v-if="containers.length === 0" class="flex flex-col items-center justify-center py-16">
           <span class="material-symbols-outlined text-slate-300 text-5xl mb-2">layers_clear</span>
           <p class="text-slate-500 font-medium">No containers found</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
            <thead class="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Name</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Image</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Status</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">CPU</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Memory</th>
                <th class="px-6 py-4 text-right text-xs font-bold text-[#4c739a] uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
              <tr
                v-for="container in containers"
                :key="container.id"
                class="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
              >
                <td class="px-6 py-4">
                   <div class="font-bold text-[#0d141b] dark:text-white">{{ container.name }}</div>
                </td>
                <td class="px-6 py-4">
                   <div class="text-sm text-[#4c739a] font-mono">{{ container.image }}</div>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border"
                    :class="[
                      container.status === 'running'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : container.status === 'restarting'
                        ? 'bg-amber-50 text-amber-700 border-amber-100'
                        : 'bg-red-50 text-red-700 border-red-100'
                    ]"
                  >
                    {{ container.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm font-mono text-[#0d141b] dark:text-white">{{ container.cpu || '-' }}</td>
                <td class="px-6 py-4 text-sm font-mono text-[#0d141b] dark:text-white">{{ container.memory || '-' }}</td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button
                      @click="viewLogs(container.name)"
                      class="p-2 text-[#4c739a] hover:text-[#137fec] hover:bg-blue-50 rounded-lg transition"
                      title="View Logs"
                    >
                      <span class="material-symbols-outlined text-[18px]">terminal</span>
                    </button>
                    <button
                      v-if="container.status === 'running'"
                      @click="restartContainer(container.name)"
                      class="p-2 text-[#4c739a] hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                      title="Restart"
                    >
                      <span class="material-symbols-outlined text-[18px]">restart_alt</span>
                    </button>
                    <button
                      v-if="container.status === 'running'"
                      @click="stopContainer(container.name)"
                      class="p-2 text-[#4c739a] hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Stop"
                    >
                      <span class="material-symbols-outlined text-[18px]">stop_circle</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Server Resources Tab -->
      <div v-else-if="activeTab === 'resources'" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- CPU Card -->
          <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
             <div class="flex items-center justify-between mb-4">
                <h3 class="font-bold text-[#0d141b] dark:text-white">CPU Usage</h3>
                <span class="material-symbols-outlined text-slate-300 text-3xl">memory</span>
             </div>
             <div class="relative pt-2">
                <div class="flex items-end gap-2 mb-2">
                   <span class="text-4xl font-extrabold text-[#137fec]">{{ serverResources.cpu || '0' }}<span class="text-xl">%</span></span>
                </div>
                <div class="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                   <div 
                      class="h-full rounded-full transition-all duration-500"
                      :class="[
                         (parseFloat(serverResources.cpu) || 0) > 80 ? 'bg-red-500' : 
                         (parseFloat(serverResources.cpu) || 0) > 60 ? 'bg-amber-500' : 'bg-[#137fec]'
                      ]"
                      :style="{ width: (serverResources.cpu || 0) + '%' }"
                   ></div>
                </div>
                <div class="flex justify-between mt-2 text-xs font-bold text-[#4c739a] uppercase tracking-wider">
                  <span>Load Avg</span>
                  <span>{{ serverResources.loadAverage || 'N/A' }}</span>
                </div>
             </div>
          </div>

          <!-- Memory Card -->
          <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
             <div class="flex items-center justify-between mb-4">
                <h3 class="font-bold text-[#0d141b] dark:text-white">Memory Usage</h3>
                <span class="material-symbols-outlined text-slate-300 text-3xl">psychology</span>
             </div>
             <div class="relative pt-2">
                <div class="flex items-end gap-2 mb-2">
                   <span class="text-4xl font-extrabold text-violet-500">{{ serverResources.memory || '0' }}<span class="text-xl">%</span></span>
                </div>
                <div class="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                   <div 
                      class="h-full rounded-full transition-all duration-500"
                      :class="[
                         (parseFloat(serverResources.memory) || 0) > 80 ? 'bg-red-500' : 
                         (parseFloat(serverResources.memory) || 0) > 60 ? 'bg-amber-500' : 'bg-violet-500'
                      ]"
                      :style="{ width: (serverResources.memory || 0) + '%' }"
                   ></div>
                </div>
                <div class="flex justify-between mt-2 text-xs font-bold text-[#4c739a] uppercase tracking-wider">
                  <span>Usage</span>
                  <span>{{ serverResources.memoryUsed }} / {{ serverResources.memoryTotal }}</span>
                </div>
             </div>
          </div>

          <!-- System Info Card -->
          <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
             <div class="flex items-center justify-between mb-4">
                <h3 class="font-bold text-[#0d141b] dark:text-white">System Info</h3>
                <span class="material-symbols-outlined text-slate-300 text-3xl">dns</span>
             </div>
             <div class="space-y-4">
                <div>
                   <p class="text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-1">Uptime</p>
                   <p class="text-lg font-bold text-[#0d141b] dark:text-white font-mono">{{ serverResources.uptime || 'N/A' }}</p>
                </div>
                <div>
                   <p class="text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-1">Platform</p>
                   <p class="text-lg font-bold text-[#0d141b] dark:text-white font-mono">Linux / Docker</p>
                </div>
             </div>
          </div>
        </div>

        <!-- Disks Section -->
        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
           <h3 class="font-bold text-[#0d141b] dark:text-white mb-4 flex items-center gap-2">
              <span class="material-symbols-outlined text-[#4c739a]">hard_drive</span>
              Disk Usage
           </h3>
           <div v-if="!serverResources.disks || serverResources.disks.length === 0" class="text-center py-8 text-[#4c739a]">
              Memuat data disk...
           </div>
           <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div v-for="disk in serverResources.disks" :key="disk.mount || disk.device" class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                 <div class="flex justify-between mb-2">
                    <span class="font-bold text-[#0d141b] dark:text-white text-sm truncate" :title="disk.mount">{{ disk.mount || disk.device }}</span>
                    <span class="font-bold text-[#137fec] text-sm">{{ disk.usage || '0' }}%</span>
                 </div>
                 <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                    <div 
                       class="h-full rounded-full bg-[#137fec]"
                       :style="{ width: (disk.usage || '0') + '%' }"
                    ></div>
                 </div>
                 <div class="text-xs text-[#4c739a] flex justify-between">
                    <span>{{ disk.used }} Used</span>
                    <span>{{ disk.total }} Total</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <!-- Health Check Tab -->
      <div v-else-if="activeTab === 'health'" class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 class="font-bold text-[#0d141b] dark:text-white mb-6">Service Health</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           <div
             v-for="service in healthChecks"
             :key="service.name"
             class="flex items-center justify-between p-4 rounded-xl border transition-all"
             :class="service.status === 'healthy' 
                ? 'bg-emerald-50 border-emerald-100' 
                : 'bg-red-50 border-red-100'"
           >
             <div class="flex items-center gap-3">
               <div
                 class="w-3 h-3 rounded-full animate-pulse"
                 :class="service.status === 'healthy' ? 'bg-emerald-500' : 'bg-red-500'"
               ></div>
               <div>
                 <div class="font-bold text-[#0d141b] dark:text-white text-sm">{{ service.name }}</div>
                 <div v-if="service.message" class="text-xs text-[#4c739a]">{{ service.message }}</div>
               </div>
             </div>
             <span
               class="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
               :class="service.status === 'healthy' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'"
             >
               {{ service.status }}
             </span>
           </div>
        </div>
      </div>

      <!-- Logs Tab -->
      <div v-else-if="activeTab === 'logs'" class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-[calc(100vh-250px)]">
         <div class="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between gap-4">
            <h3 class="font-bold text-[#0d141b] dark:text-white">System Logs</h3>
            <div class="flex items-center gap-2">
               <select
                 v-model="selectedLogType"
                 @change="loadLogs"
                 class="px-3 py-2 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/50"
               >
                 <option value="backend">Backend</option>
                 <option value="frontend">Frontend</option>
                 <option value="nginx">Nginx</option>
                 <option value="postgres">PostgreSQL</option>
                 <option value="redis">Redis</option>
               </select>
               <button
                 @click="loadLogs"
                 class="px-4 py-2 bg-[#137fec] text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition"
               >
                 Refresh
               </button>
            </div>
         </div>
         <div class="flex-1 overflow-hidden bg-[#0d141b] relative">
            <div class="absolute inset-0 overflow-auto p-4 font-mono text-xs leading-relaxed text-emerald-400">
               <pre v-if="logs">{{ logs }}</pre>
               <div v-else class="text-slate-500 italic">No logs available for this service.</div>
            </div>
         </div>
      </div>
    </div>

    <!-- Logs Modal -->
    <Teleport to="body">
      <div
        v-if="showLogsModal"
        class="fixed inset-0 bg-[#0d141b]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
        @click.self="showLogsModal = false"
      >
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-5xl w-full h-[80vh] flex flex-col overflow-hidden animate-scale-in">
          <div class="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
            <div class="flex items-center gap-3">
               <span class="material-symbols-outlined text-[#137fec]">terminal</span>
               <div>
                  <h3 class="font-bold text-[#0d141b] dark:text-white">Container Logs</h3>
                  <p class="text-xs text-[#4c739a] font-mono">{{ selectedContainerName }}</p>
               </div>
            </div>
            <button
              @click="showLogsModal = false"
              class="text-[#4c739a] hover:text-[#0d141b] transition-colors"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="flex-1 bg-[#0d141b] overflow-hidden relative">
            <div class="absolute inset-0 overflow-auto p-6 font-mono text-xs leading-relaxed text-emerald-400 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              <pre v-if="containerLogs">{{ containerLogs }}</pre>
              <div v-else class="text-slate-500 italic flex items-center gap-2">
                 <span class="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></span>
                 Loading logs...
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
const activeTab = ref('docker');
const tabs = [
  { id: 'docker', label: 'Docker Containers', icon: 'layers' },
  { id: 'resources', label: 'Server Resources', icon: 'memory' },
  { id: 'health', label: 'Health Check', icon: 'monitor_heart' },
  { id: 'logs', label: 'Logs', icon: 'terminal' },
];

const containers = ref<any[]>([]);
const serverResources = ref<any>({});
const healthChecks = ref<any[]>([]);
const logs = ref('');
const selectedLogType = ref('backend');
const showLogsModal = ref(false);
const selectedContainerName = ref('');
const containerLogs = ref('');

let refreshInterval: any = null;

const loadContainers = async () => {
  try {
    const response = await api.get('/admin/docker/containers', { timeout: 15000 });
    containers.value = response.data?.containers || [];
  } catch (err: any) {
    console.error('Error loading containers:', err);
    // Set empty array to prevent display issues
    containers.value = [];
    // Only show error if it's not a timeout or network error
    if (err.code !== 'ECONNABORTED' && !err.message?.includes('timeout')) {
      await error(err.response?.data?.message || 'Gagal memuat containers', 'Error');
    }
  }
};

const loadServerResources = async () => {
  try {
    const response = await api.get('/admin/server/resources', { timeout: 10000 });
    serverResources.value = response.data || {
      cpu: '0',
      memory: '0',
      memoryUsed: '0',
      memoryTotal: '0',
      disks: [],
      uptime: 'N/A',
      loadAverage: 'N/A',
    };
  } catch (err: any) {
    console.error('Error loading server resources:', err);
    // Set default values to prevent N/A display issues
    serverResources.value = {
      cpu: '0',
      memory: '0',
      memoryUsed: '0',
      memoryTotal: '0',
      disks: [],
      uptime: 'N/A',
      loadAverage: 'N/A',
    };
    // Don't show error popup for resources to avoid spam during auto-refresh
    // Only log to console
  }
};

const loadHealthChecks = async () => {
  try {
    const response = await api.get('/admin/health', { timeout: 10000 });
    healthChecks.value = response.data?.services || [];
  } catch (err: any) {
    console.error('Error loading health checks:', err);
    // Set empty array to prevent display issues
    healthChecks.value = [];
    // Don't show error popup for health checks to avoid spam during auto-refresh
    // Only log to console
  }
};

const loadLogs = async () => {
  try {
    const response = await api.get(`/admin/logs/${selectedLogType.value}?tail=200`);
    logs.value = response.data.logs || '';
  } catch (err: any) {
    console.error('Error loading logs:', err);
    await error(err.response?.data?.message || 'Gagal memuat logs', 'Error');
  }
};

const viewLogs = async (containerName: string) => {
  selectedContainerName.value = containerName;
  showLogsModal.value = true;
  containerLogs.value = ''; // Reset logs before loading
  try {
    const response = await api.get(`/admin/docker/logs/${containerName}?tail=500`);
    containerLogs.value = response.data.logs || '';
  } catch (err: any) {
    console.error('Error loading container logs:', err);
    await error(err.response?.data?.message || 'Gagal memuat logs container', 'Error');
    containerLogs.value = 'Error loading logs';
  }
};

const restartContainer = async (containerName: string) => {
  const confirmed = await confirm(
    `Apakah Anda yakin ingin me-restart container "${containerName}"?`,
    'Konfirmasi Restart Container',
    'Ya, Restart',
    'Batal'
  );
  
  if (!confirmed) return;

  try {
    await api.post(`/admin/docker/restart/${containerName}`);
    await success('Container berhasil di-restart', 'Berhasil');
    await loadContainers();
  } catch (err: any) {
    console.error('Error restarting container:', err);
    await error(err.response?.data?.message || 'Gagal me-restart container', 'Error');
  }
};

const stopContainer = async (containerName: string) => {
  const confirmed = await confirm(
    `Apakah Anda yakin ingin menghentikan container "${containerName}"?`,
    'Konfirmasi Stop Container',
    'Ya, Stop',
    'Batal'
  );
  
  if (!confirmed) return;

  try {
    await api.post(`/admin/docker/stop/${containerName}`);
    await success('Container berhasil dihentikan', 'Berhasil');
    await loadContainers();
  } catch (err: any) {
    console.error('Error stopping container:', err);
    await error(err.response?.data?.message || 'Gagal menghentikan container', 'Error');
  }
};

const loadAllData = async () => {
  loading.value = true;
  try {
    await Promise.all([
      loadContainers(),
      loadServerResources(),
      loadHealthChecks(),
      loadLogs(),
    ]);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadAllData();
  
  // Auto-refresh every 10 seconds
  refreshInterval = setInterval(() => {
    if (activeTab.value === 'docker') {
      loadContainers();
    } else if (activeTab.value === 'resources') {
      loadServerResources();
    } else if (activeTab.value === 'health') {
      loadHealthChecks();
    }
  }, 10000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>
