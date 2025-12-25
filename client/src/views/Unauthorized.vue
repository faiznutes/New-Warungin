<template>
  <div class="min-h-screen flex items-center justify-center bg-[#f6f7f8] px-4">
    <div class="text-center max-w-2xl">
      <!-- Icon -->
      <div class="mb-6">
        <div class="w-24 h-24 mx-auto bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center">
          <span class="material-symbols-outlined text-red-500 text-[48px]">block</span>
        </div>
      </div>

      <h1 class="text-4xl font-bold text-slate-900 dark:text-white mb-4">Access Denied</h1>

      <!-- Addon Required -->
      <div v-if="reason === 'addon'" class="mb-8">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-6 border border-slate-100 dark:border-slate-700/50 mb-6">
          <p class="text-lg text-slate-700 dark:text-slate-300 mb-4">
            This feature requires the <strong class="text-primary">{{ getAddonName(addonType) }}</strong> add-on to be active.
          </p>
          <p class="text-slate-500 mb-6">
            Please subscribe to the add-on first to access this feature.
          </p>
          <router-link
            to="/app/addons"
            class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition font-medium shadow-lg shadow-primary/30"
          >
            <span class="material-symbols-outlined text-[20px]">extension</span>
            View Available Add-ons
          </router-link>
        </div>
      </div>

      <!-- General Access Denied -->
      <div v-else class="mb-8">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-6 border border-slate-100 dark:border-slate-700/50 mb-6">
          <p class="text-lg text-slate-600 dark:text-slate-400 mb-6">
            {{ route.query.message || 'You do not have permission to access this page.' }}
          </p>
          <router-link
            to="/app"
            class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition font-medium shadow-lg shadow-primary/30"
          >
            <span class="material-symbols-outlined text-[20px]">arrow_back</span>
            Back to Dashboard
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();

const reason = computed(() => route.query.reason as string);
const addonType = computed(() => route.query.addon as string);

const getAddonName = (type: string | undefined) => {
  const addonNames: Record<string, string> = {
    'BUSINESS_ANALYTICS': 'Business Analytics & Insight',
    'EXPORT_REPORTS': 'Export Reports',
    'RESTOCK_SUGGESTION': 'Restock Suggestion',
    'STOCK_TRANSFER': 'Stock Transfer Between Stores',
    'SUPERVISOR_ROLE': 'Supervisor Role',
    'PRICE_RECOMMENDATION_PLUS': 'Price Recommendation Plus',
    'BULK_IMPORT': 'Bulk Import',
    'RECEIPT_EDITOR': 'Simple Receipt Editor',
    'DELIVERY_MARKETING': 'Delivery & Marketing',
  };
  return addonNames[type || ''] || type || 'Add-on';
};
</script>
