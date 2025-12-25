<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Free Points</h1>
      <p class="text-slate-500 dark:text-slate-400">Redeem points for subscriptions or add-ons.</p>
    </div>

    <!-- Balance Card -->
    <div class="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
      <div class="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
      <div class="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
      <div class="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p class="text-amber-100 text-sm mb-1 flex items-center gap-1">
            <span class="material-symbols-outlined text-[18px]">stars</span>
            Your Total Points
          </p>
          <p class="text-4xl font-bold">{{ balance.currentPoints || 0 }}</p>
          <p class="text-amber-100 text-sm mt-2">
            Total earned: {{ balance.totalEarned || 0 }} • Used: {{ balance.totalSpent || 0 }}
          </p>
          <p v-if="balance.expirationDays" class="text-amber-100 text-xs mt-1 flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">schedule</span>
            Points valid for {{ balance.expirationDays }} days (6 months)
          </p>
        </div>
        <div class="flex flex-col gap-3">
          <div class="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3">
            <p class="text-xs text-amber-100">Remaining today</p>
            <p class="text-2xl font-bold">{{ dailyLimit.remaining || 0 }}/5</p>
          </div>
          <div v-if="balance.expiringSoon > 0" class="bg-red-500/80 backdrop-blur-sm rounded-xl px-4 py-3">
            <p class="text-xs text-white">Expiring soon</p>
            <p class="text-xl font-bold">{{ balance.expiringSoon }} pts</p>
            <p class="text-xs text-white">(within 30 days)</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Expiration Warning -->
    <div v-if="balance.expiringSoon > 0" class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex items-start gap-3">
      <span class="material-symbols-outlined text-yellow-600 text-[24px] flex-shrink-0">warning</span>
      <div>
        <p class="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Warning:</strong> You have {{ balance.expiringSoon }} points expiring in the next 30 days. Use them before they expire!
        </p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-slate-200 dark:border-slate-700">
      <div class="flex gap-6">
        <button
          @click="activeTab = 'earn'"
          :class="[
            'pb-3 px-1 border-b-2 font-medium transition flex items-center gap-2',
            activeTab === 'earn'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          ]"
        >
          <span class="material-symbols-outlined text-[20px]">add_circle</span>
          Earn Points
        </button>
        <button
          @click="activeTab = 'redeem'"
          :class="[
            'pb-3 px-1 border-b-2 font-medium transition flex items-center gap-2',
            activeTab === 'redeem'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          ]"
        >
          <span class="material-symbols-outlined text-[20px]">redeem</span>
          Redeem Points
        </button>
        <button
          @click="activeTab = 'history'"
          :class="[
            'pb-3 px-1 border-b-2 font-medium transition flex items-center gap-2',
            activeTab === 'history'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          ]"
        >
          <span class="material-symbols-outlined text-[20px]">history</span>
          History
        </button>
      </div>
    </div>

    <!-- Tab: Earn Points -->
    <div v-if="activeTab === 'earn'" class="space-y-6">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 p-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 bg-amber-100 dark:bg-amber-900/20 text-amber-600 rounded-lg">
            <span class="material-symbols-outlined">videocam</span>
          </div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">Watch Ads to Earn Points</h2>
        </div>
        
        <div v-if="dailyLimit.remaining > 0" class="space-y-4">
          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <p class="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px]">info</span>
              <strong>Info:</strong> You can watch up to 5 ads per day. Each ad gives random points.
            </p>
          </div>

          <div class="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 text-center">
            <span class="material-symbols-outlined text-[48px] text-primary mb-3">play_circle</span>
            <p class="text-slate-900 dark:text-white font-medium mb-1">Click "Claim Reward" to watch an ad</p>
            <p class="text-sm text-slate-500">IronSource ad will appear on a dedicated page</p>
          </div>

          <button
            @click="claimReward"
            :disabled="loading || dailyLimit.remaining === 0"
            class="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-hover disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
          >
            <div v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span class="material-symbols-outlined text-[20px]" v-else>play_arrow</span>
            {{ loading ? 'Processing...' : `Claim Reward (${dailyLimit.remaining} remaining)` }}
          </button>
        </div>

        <div v-else class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 text-center">
          <span class="material-symbols-outlined text-[48px] text-yellow-600 mb-3">schedule</span>
          <p class="text-yellow-800 dark:text-yellow-200 font-semibold">
            Daily limit reached. Come back tomorrow to watch more ads!
          </p>
        </div>
      </div>
    </div>

    <!-- Tab: Redeem Points -->
    <div v-if="activeTab === 'redeem'" class="space-y-6">
      <!-- Subscription Redeem -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 p-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 bg-primary/10 text-primary rounded-lg">
            <span class="material-symbols-outlined">card_membership</span>
          </div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">Redeem Points for Subscription</h2>
        </div>
        <div v-if="loading" class="text-center py-8">
          <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-slate-500">Loading data...</p>
        </div>
        <div v-else-if="subscriptionPlans.length === 0" class="text-center py-8">
          <span class="material-symbols-outlined text-[48px] text-slate-300 mb-4">inventory_2</span>
          <p class="text-slate-500">No subscription packages available at this time.</p>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            v-for="plan in subscriptionPlans"
            :key="plan.id"
            class="rounded-xl p-4 border-2 hover:shadow-lg transition"
            :class="{
              'border-primary bg-primary/5': balance.currentPoints >= plan.pointsRequired,
              'border-slate-200 dark:border-slate-700 opacity-60': balance.currentPoints < plan.pointsRequired
            }"
          >
            <h3 class="font-bold text-lg mb-2 text-slate-900 dark:text-white">{{ plan.name }}</h3>
            <p class="text-slate-500 text-sm mb-4">{{ plan.description }}</p>
            <div class="flex items-center justify-between">
              <span class="text-2xl font-bold text-primary">{{ plan.pointsRequired }} pts</span>
              <button
                @click="redeemSubscription(plan)"
                :disabled="balance.currentPoints < plan.pointsRequired || redeeming"
                class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-sm font-semibold transition"
              >
                {{ redeeming ? 'Processing...' : 'Redeem' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Addon Redeem -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 p-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-lg">
            <span class="material-symbols-outlined">extension</span>
          </div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">Redeem Points for Add-ons</h2>
        </div>
        <div v-if="loading" class="text-center py-8">
          <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-slate-500">Loading data...</p>
        </div>
        <div v-else-if="availableAddons.length === 0" class="text-center py-8">
          <span class="material-symbols-outlined text-[48px] text-slate-300 mb-4">extension_off</span>
          <p class="text-slate-500">No add-ons available at this time.</p>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="addon in availableAddons"
            :key="addon.id"
            class="rounded-xl p-4 border-2 hover:shadow-lg transition"
            :class="{
              'border-green-500 bg-green-50 dark:bg-green-900/10': balance.currentPoints >= addon.pointsRequired,
              'border-slate-200 dark:border-slate-700 opacity-60': balance.currentPoints < addon.pointsRequired
            }"
          >
            <h3 class="font-bold text-lg mb-2 text-slate-900 dark:text-white">{{ addon.name }}</h3>
            <p class="text-slate-500 text-sm mb-4">{{ addon.description }}</p>
            <div class="flex items-center justify-between">
              <span class="text-xl font-bold text-green-600">{{ addon.pointsRequired }} pts</span>
              <button
                @click="redeemAddon(addon)"
                :disabled="balance.currentPoints < addon.pointsRequired || redeeming"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-sm font-semibold transition"
              >
                {{ redeeming ? 'Processing...' : 'Redeem' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: History -->
    <div v-if="activeTab === 'history'">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 overflow-hidden">
        <div class="p-6 border-b border-slate-100 dark:border-slate-700">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg">
              <span class="material-symbols-outlined">history</span>
            </div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">Points Transaction History</h2>
          </div>
        </div>
        <div v-if="loading" class="text-center py-12">
          <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-slate-500">Loading history...</p>
        </div>
        <div v-else-if="transactions.length === 0" class="text-center py-16">
          <span class="material-symbols-outlined text-[48px] text-slate-300 mb-4">receipt_long</span>
          <p class="text-slate-500">No transactions yet</p>
        </div>
        <div v-else class="divide-y divide-slate-100 dark:divide-slate-700">
          <div
            v-for="transaction in transactions"
            :key="transaction.id"
            class="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <p class="font-semibold text-slate-900 dark:text-white">{{ transaction.description }}</p>
                <p class="text-sm text-slate-500">{{ formatDate(transaction.createdAt) }}</p>
                <p v-if="transaction.type === 'EARNED' && transaction.metadata?.expirationDate" class="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">schedule</span>
                  Expires: {{ formatDate(transaction.metadata.expirationDate) }}
                  <span v-if="getDaysUntilExpiration(transaction.metadata.expirationDate) <= 30" class="text-yellow-600 font-semibold ml-1">
                    ({{ getDaysUntilExpiration(transaction.metadata.expirationDate) }} days left)
                  </span>
                </p>
                <p v-if="transaction.type === 'EXPIRED'" class="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">warning</span>
                  Points have expired
                </p>
              </div>
              <span
                :class="[
                  'font-bold text-lg',
                  transaction.amount > 0 ? 'text-green-600' : transaction.type === 'EXPIRED' ? 'text-red-600' : 'text-red-600'
                ]"
              >
                {{ transaction.amount > 0 ? '+' : '' }}{{ transaction.amount }} pts
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useNotification } from '../../composables/useNotification';
import api from '../../api';

const router = useRouter();
const { confirm, success, error } = useNotification();
const activeTab = ref<'earn' | 'redeem' | 'history'>('earn');
const loading = ref(false);
const redeeming = ref(false);
const balance = ref({
  currentPoints: 0,
  totalEarned: 0,
  totalSpent: 0,
  expirationDays: 180,
  expiringSoon: 0,
});
const dailyLimit = ref({
  remaining: 5,
  todayViews: 0,
});
const transactions = ref<any[]>([]);
const subscriptionPlans = ref<any[]>([]);
const availableAddons = ref<any[]>([]);

const loadBalance = async () => {
  try {
    const response = await api.get('/rewards/balance');
    balance.value = response.data;
  } catch (error) {
    console.error('Error loading balance:', error);
  }
};

const loadDailyLimit = async () => {
  try {
    const response = await api.get('/rewards/daily-limit');
    dailyLimit.value = response.data;
  } catch (error) {
    console.error('Error loading daily limit:', error);
  }
};

const loadTransactions = async () => {
  try {
    const response = await api.get('/rewards/transactions');
    transactions.value = response.data;
  } catch (error) {
    console.error('Error loading transactions:', error);
  }
};

const loadConfig = async () => {
  try {
    const response = await api.get('/rewards/config');
    console.log('Rewards config response:', response.data);
    
    const { redemptions } = response.data;
    
    if (!redemptions) {
      console.error('No redemptions data in response');
      return;
    }
    
    // Format subscription plans
    if (redemptions.subscriptions && Array.isArray(redemptions.subscriptions)) {
      subscriptionPlans.value = redemptions.subscriptions.map((sub: any) => ({
        id: sub.id,
        name: sub.name,
        description: `${sub.name} package for 1 month`,
        pointsRequired: sub.pointsRequired,
      }));
      console.log('Loaded subscription plans:', subscriptionPlans.value);
    } else {
      console.warn('No subscriptions in redemptions');
      subscriptionPlans.value = [];
    }
    
    // Format addons
    if (redemptions.addons && Array.isArray(redemptions.addons)) {
      // Remove duplicates based on id
      const uniqueAddons = redemptions.addons.filter((addon: any, index: number, self: any[]) => 
        index === self.findIndex(a => a.id === addon.id)
      );
      availableAddons.value = uniqueAddons.map((addon: any) => ({
        id: addon.id,
        name: addon.name,
        description: `Activate ${addon.name} add-on`,
        pointsRequired: addon.pointsRequired,
      }));
      console.log('Loaded addons:', availableAddons.value);
    } else {
      console.warn('No addons in redemptions');
      availableAddons.value = [];
    }
  } catch (err: any) {
    console.error('Error loading config:', err);
    console.error('Error details:', err.response?.data);
    const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
    console.error('Error message:', errorMessage);
    
    // Show detailed error message using popup
    if (errorMessage.includes('Tenant ID')) {
      await error('Error: ' + errorMessage + '\n\nMake sure you have selected a tenant (for Super Admin) or are logged in correctly.', 'Error Loading Data');
    } else {
      await error('Failed to load subscription and add-on data.\n\nError: ' + errorMessage + '\n\nPlease refresh the page or contact administrator.', 'Error Loading Data');
    }
  }
};

const claimReward = () => {
  // Generate session ID
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Redirect to reward view page
  router.push({
    name: 'reward-view',
    query: { session: sessionId },
  });
};

const redeemSubscription = async (plan: any) => {
  const confirmed = await confirm(
    `Redeem ${plan.pointsRequired} points for ${plan.name}?`,
    'Confirm Redemption',
    'Yes, Redeem',
    'Cancel'
  );
  
  if (!confirmed) return;
  
  redeeming.value = true;
  try {
    await api.post('/rewards/redeem/subscription', {
      planId: plan.id,
      pointsRequired: plan.pointsRequired,
    });
    
    await success('Success! Your subscription has been extended.', 'Redemption Successful');
    await loadBalance();
    await loadTransactions();
  } catch (err: any) {
    await error(err.response?.data?.message || 'Error redeeming points', 'Redemption Failed');
  } finally {
    redeeming.value = false;
  }
};

const redeemAddon = async (addon: any) => {
  const confirmed = await confirm(
    `Redeem ${addon.pointsRequired} points for ${addon.name}?`,
    'Confirm Redemption',
    'Yes, Redeem',
    'Cancel'
  );
  
  if (!confirmed) return;
  
  redeeming.value = true;
  try {
    await api.post('/rewards/redeem/addon', {
      addonId: addon.id,
      addonName: addon.name,
      pointsRequired: addon.pointsRequired,
    });
    
    await success('Success! Add-on has been activated.', 'Redemption Successful');
    await loadBalance();
    await loadTransactions();
  } catch (err: any) {
    await error(err.response?.data?.message || 'Error redeeming points', 'Redemption Failed');
  } finally {
    redeeming.value = false;
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getDaysUntilExpiration = (expirationDate: string): number => {
  const expDate = new Date(expirationDate);
  const now = new Date();
  const diffTime = expDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

onMounted(async () => {
  loading.value = true;
  await Promise.all([
    loadBalance(),
    loadDailyLimit(),
    loadTransactions(),
    loadConfig(),
  ]);
  loading.value = false;
});
</script>
