<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col">
        <h2 class="text-3xl font-bold text-[#0d141b] dark:text-white tracking-tight">Webhook Tester</h2>
        <p class="text-[#4c739a] dark:text-slate-400 mt-1">Test, preview, and replay webhook deliveries</p>
      </div>
      <router-link
        to="/app/settings/webhooks"
        class="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-[#0d141b] rounded-xl hover:bg-slate-200 transition font-medium"
      >
        <span class="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to Webhooks
      </router-link>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left: Webhook Selection & Testing -->
      <div class="space-y-6">
        <!-- Webhook Selection -->
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-6">
          <h3 class="text-lg font-bold text-[#0d141b] dark:text-white mb-4">Select Webhook</h3>
          <select
            v-model="selectedWebhookId"
            @change="loadWebhookDetails"
            class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">Select Webhook</option>
            <option v-for="webhook in webhooks" :key="webhook.id" :value="webhook.id">
              {{ webhook.url }} ({{ webhook.events.length }} events)
            </option>
          </select>

          <div v-if="selectedWebhook" class="mt-4 space-y-3 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-[#4c739a]">URL:</span>
              <span class="font-medium text-[#0d141b] dark:text-white">{{ selectedWebhook.url }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[#4c739a]">Status:</span>
              <span
                :class="[
                  'px-2.5 py-1 rounded-xl text-xs font-bold',
                  selectedWebhook.isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-[#4c739a]'
                ]"
              >
                {{ selectedWebhook.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Events:</span>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="event in selectedWebhook.events"
                  :key="event"
                  class="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                >
                  {{ event }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Test Webhook -->
        <div v-if="selectedWebhook" class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-6">
          <h3 class="text-lg font-bold text-[#0d141b] dark:text-white mb-4">Test Webhook</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
              <select
                v-model="testForm.event"
                class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              >
                <option value="test.event">Test Event</option>
                <option
                  v-for="event in selectedWebhook.events"
                  :key="event"
                  :value="event"
                >
                  {{ event }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Custom Payload (JSON)</label>
              <textarea
                v-model="testForm.payload"
                rows="8"
                placeholder='{"test": true, "message": "Custom test payload"}'
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
              ></textarea>
              <p class="text-xs text-[#4c739a] mt-1.5">Leave empty to use default test payload</p>
            </div>

            <button
              @click="testWebhook"
              :disabled="testing"
              class="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/30 transition-all active:scale-95 font-medium disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <span class="material-symbols-outlined text-[20px]">send</span>
              {{ testing ? 'Testing...' : 'Test Webhook' }}
            </button>
          </div>
        </div>

        <!-- Preview Payload -->
        <div v-if="selectedWebhook" class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Preview Payload</h2>
          <div class="bg-gray-50 rounded-xl p-4">
            <pre class="text-xs overflow-x-auto">{{ previewPayload }}</pre>
          </div>
          <button
            @click="copyPayload"
            class="mt-3 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition text-sm"
          >
            Copy Payload
          </button>
        </div>
      </div>

      <!-- Right: Delivery History -->
      <div class="space-y-6">
        <div class="bg-white rounded-xl shadow-md p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900">Delivery History</h2>
            <button
              v-if="selectedWebhookId"
              @click="loadDeliveries"
              class="px-3 py-1 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition text-sm"
            >
              Refresh
            </button>
          </div>

          <div v-if="!selectedWebhookId" class="flex flex-col items-center justify-center py-16 text-center">
            <span class="material-symbols-outlined text-slate-300 text-4xl mb-3">webhook</span>
            <p class="text-[#4c739a]">Select a webhook to view delivery history</p>
          </div>

          <div v-else>
            <!-- Filters -->
            <div class="mb-4 flex gap-2">
              <select
                v-model="deliveryFilter.status"
                @change="loadDeliveries"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm"
              >
                <option value="">All Status</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILED">Failed</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>

            <!-- Loading State -->
            <div v-if="loadingDeliveries" class="flex items-center justify-center py-12">
              <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>

            <!-- Deliveries List -->
            <div v-else class="space-y-3">
              <div
                v-for="delivery in deliveries"
                :key="delivery.id"
                class="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition"
              >
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="font-medium text-gray-900">{{ delivery.event }}</span>
                      <span
                        :class="[
                          'px-2 py-1 rounded text-xs font-semibold',
                          delivery.status === 'SUCCESS'
                            ? 'bg-green-100 text-green-800'
                            : delivery.status === 'FAILED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        ]"
                      >
                        {{ delivery.status }}
                      </span>
                    </div>
                    <p class="text-xs text-gray-500">
                      {{ formatDateTime(delivery.createdAt) }}
                    </p>
                    <p v-if="delivery.responseCode" class="text-xs text-gray-600 mt-1">
                      Response: {{ delivery.responseCode }}
                    </p>
                    <p v-if="delivery.attempts > 0" class="text-xs text-gray-600">
                      Attempts: {{ delivery.attempts }}
                    </p>
                  </div>
                  <button
                    v-if="delivery.status === 'FAILED'"
                    @click="replayDelivery(delivery.id)"
                    :disabled="replaying"
                    class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition text-sm"
                    title="Replay"
                  >
                    Replay
                  </button>
                </div>

                <!-- Payload Preview -->
                <details class="mt-2">
                  <summary class="text-xs text-gray-600 cursor-pointer hover:text-gray-900">
                    View Payload
                  </summary>
                  <div class="mt-2 bg-gray-50 rounded p-2">
                    <pre class="text-xs overflow-x-auto">{{ JSON.stringify(delivery.payload, null, 2) }}</pre>
                  </div>
                </details>

                <!-- Response Preview -->
                <details v-if="delivery.responseBody" class="mt-2">
                  <summary class="text-xs text-gray-600 cursor-pointer hover:text-gray-900">
                    View Response
                  </summary>
                  <div class="mt-2 bg-gray-50 rounded p-2">
                    <pre class="text-xs overflow-x-auto">{{ delivery.responseBody }}</pre>
                  </div>
                </details>
              </div>

              <div v-if="deliveries.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
                <span class="material-symbols-outlined text-slate-300 text-4xl mb-3">inbox</span>
                <p class="text-[#4c739a]">No delivery history yet</p>
              </div>
            </div>

            <!-- Pagination -->
            <div
              v-if="deliveryPagination.totalPages > 1"
              class="mt-4 flex items-center justify-between border-t pt-4"
            >
              <div class="text-sm text-gray-700">
                Page {{ deliveryPagination.page }} of {{ deliveryPagination.totalPages }}
              </div>
              <div class="flex gap-2">
                <button
                  @click="loadDeliveries(deliveryPagination.page - 1)"
                  :disabled="deliveryPagination.page === 1"
                  class="px-3 py-1 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Previous
                </button>
                <button
                  @click="loadDeliveries(deliveryPagination.page + 1)"
                  :disabled="deliveryPagination.page === deliveryPagination.totalPages"
                  class="px-3 py-1 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../../api';
import { formatDateTime } from '../../utils/formatters';
import { useNotification } from '../../composables/useNotification';

const route = useRoute();

const { success: showSuccess, error: showError } = useNotification();

const webhooks = ref<any[]>([]);
const selectedWebhookId = ref('');
const selectedWebhook = ref<any>(null);
const deliveries = ref<any[]>([]);
const loadingDeliveries = ref(false);
const testing = ref(false);
const replaying = ref(false);

const testForm = ref({
  event: 'test.event',
  payload: '',
});

const deliveryFilter = ref({
  status: '',
});

const deliveryPagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
});

const previewPayload = computed(() => {
  try {
    const payload = testForm.value.payload
      ? JSON.parse(testForm.value.payload)
      : {
          test: true,
          message: 'This is a test webhook',
          timestamp: new Date().toISOString(),
          webhookId: selectedWebhookId.value,
        };

    return JSON.stringify(
      {
        event: testForm.value.event,
        payload,
        timestamp: new Date().toISOString(),
      },
      null,
      2
    );
  } catch (e) {
    return 'Invalid JSON';
  }
});

const loadWebhooks = async () => {
  try {
    const response = await api.get('/webhooks?includeInactive=true');
    webhooks.value = response.data.webhooks || [];
  } catch (error: any) {
    console.error('Error loading webhooks:', error);
    await showError('Gagal memuat webhooks');
  }
};

const loadWebhookDetails = async () => {
  if (!selectedWebhookId.value) {
    selectedWebhook.value = null;
    deliveries.value = [];
    return;
  }

  selectedWebhook.value = webhooks.value.find((w) => w.id === selectedWebhookId.value);
  await loadDeliveries();
};

const loadDeliveries = async (page = 1) => {
  if (!selectedWebhookId.value) return;

  loadingDeliveries.value = true;
  try {
    const params: any = {
      page,
      limit: deliveryPagination.value.limit,
    };

    if (deliveryFilter.value.status) {
      params.status = deliveryFilter.value.status;
    }

    const response = await api.get(`/webhooks/${selectedWebhookId.value}/deliveries`, { params });
    deliveries.value = response.data.data || [];
    deliveryPagination.value = response.data.pagination || deliveryPagination.value;
    deliveryPagination.value.page = page;
  } catch (error: any) {
    console.error('Error loading deliveries:', error);
    await showError('Gagal memuat delivery history');
  } finally {
    loadingDeliveries.value = false;
  }
};

const testWebhook = async () => {
  if (!selectedWebhookId.value) {
    await showError('Pilih webhook terlebih dahulu');
    return;
  }

  testing.value = true;
  try {
    const payload: any = {
      event: testForm.value.event,
    };

    if (testForm.value.payload) {
      try {
        payload.payload = JSON.parse(testForm.value.payload);
      } catch (e) {
        await showError('Invalid JSON payload');
        testing.value = false;
        return;
      }
    }

    await api.post(`/webhooks/${selectedWebhookId.value}/test`, payload);
    await showSuccess('Test webhook berhasil dikirim!');
    await loadDeliveries(deliveryPagination.value.page);
  } catch (error: any) {
    console.error('Error testing webhook:', error);
    await showError(error.response?.data?.message || 'Gagal mengirim test webhook');
  } finally {
    testing.value = false;
  }
};

const replayDelivery = async (deliveryId: string) => {
  if (!selectedWebhookId.value) return;

  replaying.value = true;
  try {
    await api.post(`/webhooks/${selectedWebhookId.value}/replay/${deliveryId}`);
    await showSuccess('Webhook delivery berhasil di-replay!');
    await loadDeliveries(deliveryPagination.value.page);
  } catch (error: any) {
    console.error('Error replaying delivery:', error);
    await showError(error.response?.data?.message || 'Gagal replay delivery');
  } finally {
    replaying.value = false;
  }
};

const copyPayload = async () => {
  try {
    await navigator.clipboard.writeText(previewPayload.value);
    await showSuccess('Payload berhasil di-copy!');
  } catch (error) {
    await showError('Gagal copy payload');
  }
};

watch(selectedWebhookId, () => {
  loadWebhookDetails();
});

onMounted(async () => {
  await loadWebhooks();
  
  // If webhookId is provided in query, select it
  const webhookId = route.query.webhookId as string;
  if (webhookId) {
    selectedWebhookId.value = webhookId;
    await loadWebhookDetails();
  }
});
</script>

