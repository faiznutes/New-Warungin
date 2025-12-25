<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-[#0d141b] dark:text-white text-2xl sm:text-3xl font-bold leading-tight tracking-tight">Webhooks</h1>
        <p class="text-[#4c739a] dark:text-slate-400">Manage webhooks for external integrations.</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg shadow-lg shadow-blue-500/30 transition-all font-medium text-sm"
      >
        <span class="material-symbols-outlined text-[20px]">add</span>
        <span>Create Webhook</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Webhooks List -->
    <div v-else class="space-y-4">
      <!-- Empty State -->
      <div v-if="webhooks.length === 0" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-12 text-center">
        <span class="material-symbols-outlined text-[64px] text-slate-300 mb-4">webhook</span>
        <p class="text-[#4c739a] mb-4">No webhooks created yet</p>
        <button
          @click="showCreateModal = true"
          class="flex items-center gap-2 mx-auto bg-primary hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg shadow-lg shadow-blue-500/30 transition-all font-medium text-sm"
        >
          <span class="material-symbols-outlined text-[20px]">add</span>
          Create First Webhook
        </button>
      </div>

      <!-- Webhook Cards -->
      <div
        v-for="webhook in webhooks"
        :key="webhook.id"
        class="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 p-6 hover:shadow-lg transition group"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-3">
              <div class="p-2 bg-primary/10 text-primary rounded-lg">
                <span class="material-symbols-outlined">webhook</span>
              </div>
              <div class="flex-1">
                <h3 class="text-sm font-bold text-slate-900 dark:text-white break-all">{{ webhook.url }}</h3>
                <span
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold mt-1"
                  :class="webhook.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="webhook.isActive ? 'bg-green-500' : 'bg-slate-400'"></span>
                  {{ webhook.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>

            <div class="space-y-3 text-sm">
              <div>
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Events</p>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="event in webhook.events"
                    :key="event"
                    class="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium"
                  >
                    {{ event }}
                  </span>
                </div>
              </div>

              <div class="flex gap-4 text-slate-500 text-xs">
                <span class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">replay</span>
                  Retries: {{ webhook.retryCount || 3 }}
                </span>
                <span class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">timer</span>
                  Timeout: {{ webhook.timeout || 5000 }}ms
                </span>
              </div>

              <p v-if="webhook.lastDeliveryAt" class="text-xs text-slate-400">
                Last delivery: {{ formatDate(webhook.lastDeliveryAt) }}
              </p>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 ml-4">
            <router-link
              :to="`/app/settings/webhooks/tester?webhookId=${webhook.id}`"
              class="px-3 py-1.5 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition text-xs font-medium flex items-center gap-1"
            >
              <span class="material-symbols-outlined text-[16px]">science</span>
              Tester
            </router-link>
            <button
              @click="testWebhook(webhook.id)"
              class="px-3 py-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition text-xs font-medium flex items-center gap-1"
            >
              <span class="material-symbols-outlined text-[16px]">send</span>
              Test
            </button>
            <button
              @click="editWebhook(webhook)"
              class="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition text-xs font-medium flex items-center gap-1"
            >
              <span class="material-symbols-outlined text-[16px]">edit</span>
              Edit
            </button>
            <button
              @click="deleteWebhook(webhook.id)"
              class="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition text-xs font-medium flex items-center gap-1"
            >
              <span class="material-symbols-outlined text-[16px]">delete</span>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div
        v-if="showCreateModal || editingWebhook"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="closeModal"
      >
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
          <div class="p-6">
            <div class="flex items-center gap-3 mb-6">
              <div class="p-2 bg-primary/10 text-primary rounded-lg">
                <span class="material-symbols-outlined">webhook</span>
              </div>
              <h3 class="text-xl font-bold text-slate-900 dark:text-white">
                {{ editingWebhook ? 'Edit Webhook' : 'Create New Webhook' }}
              </h3>
            </div>

            <form @submit.prevent="saveWebhook" class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">URL *</label>
                <input
                  v-model="webhookForm.url"
                  type="url"
                  required
                  placeholder="https://example.com/webhook"
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Events *</label>
                <div class="grid grid-cols-2 gap-2">
                  <label
                    v-for="event in availableEvents"
                    :key="event"
                    class="flex items-center gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition"
                  >
                    <input
                      type="checkbox"
                      :value="event"
                      v-model="webhookForm.events"
                      class="rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span class="text-sm text-slate-700 dark:text-slate-300">{{ event }}</span>
                  </label>
                </div>
                <p v-if="webhookForm.events.length === 0" class="text-sm text-red-600 mt-1">
                  Select at least 1 event
                </p>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Retry Count</label>
                  <input
                    v-model.number="webhookForm.retryCount"
                    type="number"
                    min="1"
                    max="10"
                    class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Timeout (ms)</label>
                  <input
                    v-model.number="webhookForm.timeout"
                    type="number"
                    min="1000"
                    max="30000"
                    step="1000"
                    class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <input
                  type="checkbox"
                  v-model="webhookForm.isActive"
                  id="isActive"
                  class="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <label for="isActive" class="text-sm font-medium text-slate-700 dark:text-slate-300">Active</label>
              </div>

              <div class="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  @click="closeModal"
                  class="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="saving || webhookForm.events.length === 0"
                  class="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:bg-slate-300 disabled:cursor-not-allowed transition font-medium shadow-lg shadow-primary/30"
                >
                  {{ saving ? 'Saving...' : 'Save' }}
                </button>
              </div>
            </form>
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

const { confirm, success, error } = useNotification();

const loading = ref(true);
const webhooks = ref<any[]>([]);

const showCreateModal = ref(false);
const editingWebhook = ref<any>(null);
const saving = ref(false);

const availableEvents = [
  'order.created',
  'order.updated',
  'order.completed',
  'order.cancelled',
  'payment.completed',
  'payment.failed',
  'product.created',
  'product.updated',
  'product.deleted',
  'customer.created',
  'customer.updated',
  'subscription.created',
  'subscription.updated',
  'subscription.expired',
];

const webhookForm = ref({
  url: '',
  events: [] as string[],
  isActive: true,
  retryCount: 3,
  timeout: 5000,
});

const loadWebhooks = async () => {
  try {
    const response = await api.get('/webhooks?includeInactive=true');
    webhooks.value = response.data.webhooks || [];
  } catch (error: any) {
    console.error('Error loading webhooks:', error);
  } finally {
    loading.value = false;
  }
};

const saveWebhook = async () => {
  if (webhookForm.value.events.length === 0) {
    return;
  }

  saving.value = true;

  try {
    if (editingWebhook.value) {
      await api.put(`/webhooks/${editingWebhook.value.id}`, webhookForm.value);
    } else {
      await api.post('/webhooks', webhookForm.value);
    }

    await loadWebhooks();
    closeModal();
    await success('Webhook saved successfully', 'Success');
  } catch (err: any) {
    console.error('Error saving webhook:', err);
    await error(err.response?.data?.message || 'Failed to save webhook', 'Error');
  } finally {
    saving.value = false;
  }
};

const editWebhook = (webhook: any) => {
  editingWebhook.value = webhook;
  webhookForm.value = {
    url: webhook.url,
    events: [...webhook.events],
    isActive: webhook.isActive,
    retryCount: webhook.retryCount || 3,
    timeout: webhook.timeout || 5000,
  };
  showCreateModal.value = true;
};

const deleteWebhook = async (id: string) => {
  const confirmed = await confirm(
    'Are you sure you want to delete this webhook?',
    'Delete Webhook',
    'Yes, Delete',
    'Cancel'
  );
  
  if (!confirmed) return;

  try {
    await api.delete(`/webhooks/${id}`);
    await loadWebhooks();
    await success('Webhook deleted successfully', 'Success');
  } catch (err: any) {
    console.error('Error deleting webhook:', err);
    await error(err.response?.data?.message || 'Failed to delete webhook', 'Error');
  }
};

const testWebhook = async (id: string) => {
  try {
    await api.post(`/webhooks/${id}/test`);
    await success('Test webhook sent successfully!', 'Success');
  } catch (err: any) {
    console.error('Error testing webhook:', err);
    await error(err.response?.data?.message || 'Failed to send test webhook', 'Error');
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  editingWebhook.value = null;
  webhookForm.value = {
    url: '',
    events: [],
    isActive: true,
    retryCount: 3,
    timeout: 5000,
  };
};

const formatDate = (date: string) => {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(() => {
  loadWebhooks();
});
</script>
