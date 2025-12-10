<template>
  <div class="flex flex-col h-full p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Server Monitor</h1>
      <p class="text-gray-600">Monitor kesehatan server, Docker stack, dan resource usage secara realtime</p>
    </div>

    <!-- Tabs -->
    <div class="bg-white rounded-lg shadow-md mb-6">
      <div class="flex border-b border-gray-200">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-6 py-3 font-semibold border-b-2 transition',
            activeTab === tab.id
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Docker Containers Tab -->
    <div v-else-if="activeTab === 'docker'" class="space-y-4">
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-gray-900">Docker Containers</h2>
          <button
            @click="loadContainers"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
          >
            Refresh
          </button>
        </div>

        <div v-if="containers.length === 0" class="text-center py-8 text-gray-500">
          Tidak ada container yang ditemukan
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th class="text-left py-3 px-4 font-semibold text-gray-700">Image</th>
                <th class="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th class="text-left py-3 px-4 font-semibold text-gray-700">Health</th>
                <th class="text-left py-3 px-4 font-semibold text-gray-700">CPU</th>
                <th class="text-left py-3 px-4 font-semibold text-gray-700">Memory</th>
                <th class="text-left py-3 px-4 font-semibold text-gray-700">Ports</th>
                <th class="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="container in containers"
                :key="container.id"
                class="border-b border-gray-100 hover:bg-gray-50"
              >
                <td class="py-3 px-4">{{ container.name }}</td>
                <td class="py-3 px-4 text-sm text-gray-600">{{ container.image }}</td>
                <td class="py-3 px-4">
                  <span
                    :class="[
                      'px-2 py-1 rounded text-xs font-semibold',
                      container.status === 'running'
                        ? 'bg-green-100 text-green-800'
                        : container.status === 'restarting'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ container.status }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <span
                    v-if="container.health"
                    :class="[
                      'px-2 py-1 rounded text-xs font-semibold',
                      container.health === 'healthy'
                        ? 'bg-green-100 text-green-800'
                        : container.health === 'unhealthy'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    ]"
                  >
                    {{ container.health }}
                  </span>
                  <span v-else class="text-gray-400 text-xs">-</span>
                </td>
                <td class="py-3 px-4 text-sm">{{ container.cpu || 'N/A' }}</td>
                <td class="py-3 px-4 text-sm">{{ container.memory || 'N/A' }}</td>
                <td class="py-3 px-4 text-sm text-gray-600">{{ container.ports || '-' }}</td>
                <td class="py-3 px-4">
                  <div class="flex space-x-2">
                    <button
                      @click="viewLogs(container.name)"
                      class="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs"
                    >
                      Logs
                    </button>
                    <button
                      v-if="container.status === 'running'"
                      @click="restartContainer(container.name)"
                      class="px-2 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition text-xs"
                    >
                      Restart
                    </button>
                    <button
                      v-if="container.status === 'running'"
                      @click="stopContainer(container.name)"
                      class="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-xs"
                    >
                      Stop
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Server Resources Tab -->
    <div v-else-if="activeTab === 'resources'" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">CPU Usage</h3>
          <div class="text-3xl font-bold text-primary-600">{{ serverResources.cpu || 'N/A' }}%</div>
          <div class="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              :class="[
                'h-full transition-all',
                (parseFloat(serverResources.cpu) || 0) > 80
                  ? 'bg-red-500'
                  : (parseFloat(serverResources.cpu) || 0) > 60
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              ]"
              :style="{ width: (serverResources.cpu || 0) + '%' }"
            ></div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Memory Usage</h3>
          <div class="text-3xl font-bold text-primary-600">{{ serverResources.memory || 'N/A' }}%</div>
          <div class="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              :class="[
                'h-full transition-all',
                (parseFloat(serverResources.memory) || 0) > 80
                  ? 'bg-red-500'
                  : (parseFloat(serverResources.memory) || 0) > 60
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              ]"
              :style="{ width: (serverResources.memory || 0) + '%' }"
            ></div>
          </div>
          <div class="mt-2 text-sm text-gray-600">
            {{ serverResources.memoryUsed || 'N/A' }} / {{ serverResources.memoryTotal || 'N/A' }}
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Disk Usage</h3>
          <div v-if="!serverResources.disks || serverResources.disks.length === 0" class="text-sm text-gray-500">
            <div class="flex items-center space-x-2">
              <svg class="w-5 h-5 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Memuat data disk...</span>
            </div>
          </div>
          <div v-else>
            <div v-for="disk in serverResources.disks" :key="disk.mount || disk.device" class="mb-4">
              <div class="flex justify-between text-sm mb-1">
                <span class="font-medium">{{ disk.mount || disk.device || 'Unknown' }}</span>
                <span>{{ disk.usage || '0' }}%</span>
              </div>
              <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  :class="[
                    'h-full transition-all',
                    parseFloat(disk.usage || '0') > 85
                      ? 'bg-red-500'
                      : parseFloat(disk.usage || '0') > 70
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  ]"
                  :style="{ width: (disk.usage || '0') + '%' }"
                ></div>
              </div>
              <div class="text-xs text-gray-600 mt-1">
                {{ disk.used || '0' }} / {{ disk.total || '0' }}
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">System Info</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Uptime:</span>
              <span class="font-medium">{{ serverResources.uptime || 'N/A' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Load Average:</span>
              <span class="font-medium">{{ serverResources.loadAverage || 'N/A' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Health Check Tab -->
    <div v-else-if="activeTab === 'health'" class="space-y-4">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Service Health</h2>
        <div class="space-y-3">
          <div
            v-for="service in healthChecks"
            :key="service.name"
            class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <div
                :class="[
                  'w-3 h-3 rounded-full',
                  service.status === 'healthy'
                    ? 'bg-green-500'
                    : service.status === 'unhealthy'
                    ? 'bg-red-500'
                    : 'bg-yellow-500'
                ]"
              ></div>
              <div>
                <div class="font-semibold text-gray-900">{{ service.name }}</div>
                <div v-if="service.message" class="text-sm text-gray-600">{{ service.message }}</div>
              </div>
            </div>
            <span
              :class="[
                'px-3 py-1 rounded text-xs font-semibold',
                service.status === 'healthy'
                  ? 'bg-green-100 text-green-800'
                  : service.status === 'unhealthy'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              ]"
            >
              {{ service.status }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Logs Tab -->
    <div v-else-if="activeTab === 'logs'" class="space-y-4">
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-gray-900">Logs Viewer</h2>
          <div class="flex space-x-2">
            <select
              v-model="selectedLogType"
              @change="loadLogs"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="backend">Backend</option>
              <option value="frontend">Frontend</option>
              <option value="nginx">Nginx</option>
              <option value="postgres">PostgreSQL</option>
              <option value="redis">Redis</option>
            </select>
            <button
              @click="loadLogs"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
            >
              Refresh
            </button>
          </div>
        </div>

        <div class="bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-lg max-h-96 overflow-y-auto">
          <pre v-if="logs">{{ logs }}</pre>
          <div v-else class="text-gray-500">Tidak ada log tersedia</div>
        </div>
      </div>
    </div>

    <!-- Logs Modal -->
    <div
      v-if="showLogsModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="showLogsModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div class="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-xl font-bold text-gray-900">Logs: {{ selectedContainerName }}</h3>
          <button
            @click="showLogsModal = false"
            class="text-gray-400 hover:text-gray-600 transition"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto bg-gray-900 text-green-400 font-mono text-sm p-4">
          <pre v-if="containerLogs">{{ containerLogs }}</pre>
          <div v-else class="text-gray-500">Memuat logs...</div>
        </div>
      </div>
    </div>
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
  { id: 'docker', label: 'Docker Containers' },
  { id: 'resources', label: 'Server Resources' },
  { id: 'health', label: 'Health Check' },
  { id: 'logs', label: 'Logs' },
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
    const response = await api.get('/admin/docker/containers');
    containers.value = response.data.containers || [];
  } catch (err: any) {
    console.error('Error loading containers:', err);
    await error(err.response?.data?.message || 'Gagal memuat containers', 'Error');
  }
};

const loadServerResources = async () => {
  try {
    const response = await api.get('/admin/server/resources');
    serverResources.value = response.data || {};
  } catch (err: any) {
    console.error('Error loading server resources:', err);
    // Don't show error popup for resources to avoid spam during auto-refresh
    // Only log to console
  }
};

const loadHealthChecks = async () => {
  try {
    const response = await api.get('/admin/health');
    healthChecks.value = response.data.services || [];
  } catch (err: any) {
    console.error('Error loading health checks:', err);
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

