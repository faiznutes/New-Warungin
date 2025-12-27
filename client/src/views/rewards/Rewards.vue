<template>
  <div class="flex flex-col gap-8">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Free Points</h1>
        <p class="text-slate-500 text-base">Redeem points for subscriptions or add-ons.</p>
      </div>
      <div class="flex gap-3">
        <button class="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-primary hover:border-primary/30 transition-all shadow-sm">
          <span class="material-symbols-outlined text-[20px]">description</span>
          <span>Panduan</span>
        </button>
        <button 
          @click="claimReward"
          :disabled="loading || dailyLimit.remaining === 0"
          class="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary text-white text-sm font-bold hover:bg-emerald-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors shadow-lg shadow-emerald-500/20"
        >
          <div v-if="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span v-else class="material-symbols-outlined text-[20px]">play_circle</span>
          <span>{{ loading ? 'Processing...' : `Watch Ads (${dailyLimit.remaining})` }}</span>
        </button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Card 1: Total Points -->
      <div class="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2">
        <div class="flex justify-between items-start">
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Your Total Points</p>
          <div class="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <span class="material-symbols-outlined text-primary text-[20px]">stars</span>
          </div>
        </div>
        <p class="text-slate-900 dark:text-white text-2xl font-bold">{{ balance.currentPoints || 0 }}</p>
        <div class="flex items-center gap-1 text-emerald-600 text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 w-fit px-2 py-0.5 rounded-full">
          <span class="material-symbols-outlined text-[16px]">verified</span>
          <span>Active Balance</span>
        </div>
      </div>

      <!-- Card 2: Total Earned -->
      <div class="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2">
        <div class="flex justify-between items-start">
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Earned</p>
          <div class="p-1.5 bg-orange-50 dark:bg-orange-900/20 rounded-md">
            <span class="material-symbols-outlined text-orange-500 text-[20px]">trending_up</span>
          </div>
        </div>
        <p class="text-slate-900 dark:text-white text-2xl font-bold">{{ balance.totalEarned || 0 }}</p>
        <div class="flex items-center gap-1 text-emerald-600 text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 w-fit px-2 py-0.5 rounded-full">
          <span class="material-symbols-outlined text-[16px]">history</span>
          <span>Lifetime</span>
        </div>
      </div>

      <!-- Card 3: Total Used -->
      <div class="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2">
        <div class="flex justify-between items-start">
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Points Used</p>
          <div class="p-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-md">
            <span class="material-symbols-outlined text-purple-500 text-[20px]">shopping_bag</span>
          </div>
        </div>
        <p class="text-slate-900 dark:text-white text-2xl font-bold">{{ balance.totalSpent || 0 }}</p>
        <div class="flex items-center gap-1 text-slate-500 text-xs font-medium bg-slate-100 dark:bg-slate-700 w-fit px-2 py-0.5 rounded-full">
          <span class="material-symbols-outlined text-[16px]">redeem</span>
          <span>Redeemed</span>
        </div>
      </div>

      <!-- Card 4: Expiring Soon -->
      <div class="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2">
        <div class="flex justify-between items-start">
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Expiring Soon</p>
          <div class="p-1.5 bg-red-50 dark:bg-red-900/20 rounded-md">
            <span class="material-symbols-outlined text-red-500 text-[20px]">warning</span>
          </div>
        </div>
        <p class="text-slate-900 dark:text-white text-2xl font-bold">{{ balance.expiringSoon || 0 }}</p>
        <div class="flex items-center gap-1 text-red-600 text-xs font-medium bg-red-50 dark:bg-red-900/20 w-fit px-2 py-0.5 rounded-full">
          <span class="material-symbols-outlined text-[16px]">schedule</span>
          <span>In 30 days</span>
        </div>
      </div>
    </div>

    <!-- Filter & Search (Visual Only for now) -->
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="relative group">
          <span class="absolute left-3 top-2.5 text-slate-400 material-symbols-outlined text-[20px] group-focus-within:text-primary transition-colors">search</span>
          <input 
            class="h-10 pl-10 pr-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 w-full sm:w-64 transition-all shadow-sm" 
            placeholder="Search rewards..." 
            type="text"
          />
        </div>
        <div class="flex gap-2">
          <button 
            @click="activeTab = 'redeem'"
            :class="[
              'h-10 px-4 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2 shadow-sm',
              activeTab === 'redeem' ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-50'
            ]"
          >
            <span class="material-symbols-outlined text-[18px]">redeem</span>
            Redeem
          </button>
           <button 
            @click="activeTab = 'history'"
            :class="[
              'h-10 px-4 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2 shadow-sm',
              activeTab === 'history' ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-50'
            ]"
          >
            <span class="material-symbols-outlined text-[18px]">history</span>
            History
          </button>
        </div>
      </div>

      <!-- Rewards Grid -->
      <div v-if="activeTab === 'redeem'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <!-- Watch Ads Card (Special) -->
        <div class="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
          <div class="aspect-[4/3] w-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center relative overflow-hidden">
             <!-- Background Pattern -->
             <div class="absolute inset-0 opacity-10 flex flex-wrap gap-4 p-4 transform rotate-12">
                <span class="material-symbols-outlined text-6xl">play_circle</span>
                <span class="material-symbols-outlined text-6xl">ad_units</span>
                <span class="material-symbols-outlined text-6xl">currency_exchange</span>
             </div>
             <span class="material-symbols-outlined text-[64px] text-primary relative z-10">play_circle</span>
             <div v-if="dailyLimit.remaining > 0" class="absolute top-3 right-3 px-2 py-1 rounded bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-emerald-600 text-xs font-bold border border-emerald-200 shadow-sm z-10">
                Earn Points
             </div>
             <div v-else class="absolute top-3 right-3 px-2 py-1 rounded bg-slate-800/90 text-white text-xs font-bold z-10">
                Limit Reached
             </div>
          </div>
          <div class="p-4 flex flex-col gap-2 flex-1">
            <h3 class="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Watch Daily Ads</h3>
            <p class="text-xs text-slate-500 line-clamp-2">Watch short videos to earn free points. Limit 5 per day.</p>
            <div class="mt-auto pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-700">
              <span class="text-primary font-bold text-lg">Free</span>
              <span class="text-xs text-slate-400 bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded-full">Left: {{ dailyLimit.remaining }}/5</span>
            </div>
          </div>
          <div class="absolute inset-0 bg-white/60 dark:bg-slate-900/60 items-center justify-center gap-2 hidden group-hover:flex backdrop-blur-[2px] transition-all">
             <button 
              @click="claimReward"
              :disabled="loading || dailyLimit.remaining === 0"
              class="px-4 py-2 rounded-lg bg-primary text-white font-bold shadow-lg hover:scale-105 transition-transform"
            >
              Watch Now
            </button>
          </div>
        </div>

        <!-- Subscription Plans -->
        <div 
          v-for="plan in subscriptionPlans"
          :key="plan.id"
          class="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
        >
          <div class="aspect-[4/3] w-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
             <span class="material-symbols-outlined text-[64px] text-slate-400 group-hover:text-primary transition-colors">card_membership</span>
             <div class="absolute top-3 right-3 px-2 py-1 rounded bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-600 shadow-sm">
                Subscription
             </div>
          </div>
          <div class="p-4 flex flex-col gap-2 flex-1">
            <h3 class="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{{ plan.name }}</h3>
            <p class="text-xs text-slate-500 line-clamp-2">Redeem points for 1 month of {{ plan.name }} subscription.</p>
            <div class="mt-auto pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-700">
              <span class="text-primary font-bold text-lg">{{ plan.pointsRequired }} Pts</span>
              <span class="text-xs text-slate-400 bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded-full">Available</span>
            </div>
          </div>
           <div class="absolute inset-0 bg-white/60 dark:bg-slate-900/60 items-center justify-center gap-2 hidden group-hover:flex backdrop-blur-[2px] transition-all">
             <button 
              @click="redeemSubscription(plan)"
              :disabled="balance.currentPoints < plan.pointsRequired || redeeming"
              class="px-4 py-2 rounded-lg bg-primary text-white font-bold shadow-lg hover:scale-105 transition-transform disabled:bg-slate-400"
            >
              {{ balance.currentPoints >= plan.pointsRequired ? 'Redeem' : 'Not Enough Pts' }}
            </button>
          </div>
        </div>

        <!-- Addons -->
        <div 
          v-for="addon in availableAddons"
          :key="addon.id"
          class="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
        >
          <!-- Using a different icon/style for addons -->
          <div class="aspect-[4/3] w-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
             <span class="material-symbols-outlined text-[64px] text-emerald-400 group-hover:text-emerald-500 transition-colors">extension</span>
             <div class="absolute top-3 right-3 px-2 py-1 rounded bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-600 shadow-sm">
                Add-on
             </div>
          </div>
          <div class="p-4 flex flex-col gap-2 flex-1">
            <h3 class="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{{ addon.name }}</h3>
            <p class="text-xs text-slate-500 line-clamp-2">Activate {{ addon.name }} feature for your store.</p>
            <div class="mt-auto pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-700">
              <span class="text-emerald-600 dark:text-emerald-400 font-bold text-lg">{{ addon.pointsRequired }} Pts</span>
              <span class="text-xs text-slate-400 bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded-full">Available</span>
            </div>
          </div>
           <div class="absolute inset-0 bg-white/60 dark:bg-slate-900/60 items-center justify-center gap-2 hidden group-hover:flex backdrop-blur-[2px] transition-all">
             <button 
              @click="redeemAddon(addon)"
              :disabled="balance.currentPoints < addon.pointsRequired || redeeming"
              class="px-4 py-2 rounded-lg bg-emerald-500 text-white font-bold shadow-lg hover:scale-105 transition-transform disabled:bg-slate-400"
            >
              {{ balance.currentPoints >= addon.pointsRequired ? 'Redeem' : 'Not Enough Pts' }}
            </button>
          </div>
        </div>
      </div>

      <!-- History Table -->
      <div v-if="activeTab === 'history'" class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
        </div>
        <div class="w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
          <table class="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead class="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th class="px-6 py-4" scope="col">Description</th>
                <th class="px-6 py-4" scope="col">Type</th>
                <th class="px-6 py-4" scope="col">Date</th>
                <th class="px-6 py-4" scope="col">Status</th>
                <th class="px-6 py-4 text-right" scope="col">Points</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
              <tr 
                v-for="transaction in transactions" 
                :key="transaction.id"
                class="hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <td class="px-6 py-4 font-bold text-slate-900 dark:text-white">
                  {{ transaction.description }}
                </td>
                <td class="px-6 py-4 text-slate-500">
                  <span 
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase"
                    :class="transaction.amount > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'"
                  >
                    {{ transaction.amount > 0 ? 'Earned' : 'Spent' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-slate-500">
                   {{ formatDate(transaction.createdAt) }}
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
                    <span class="size-1.5 rounded-full bg-emerald-500"></span>
                    Completed
                  </span>
                </td>
                <td 
                  class="px-6 py-4 text-right font-bold"
                  :class="transaction.amount > 0 ? 'text-emerald-600' : 'text-red-500'"
                >
                  {{ transaction.amount > 0 ? '+' : '' }}{{ transaction.amount }}
                </td>
              </tr>
              <tr v-if="transactions.length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-slate-500">
                  No transactions yet
                </td>
              </tr>
            </tbody>
          </table>
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
