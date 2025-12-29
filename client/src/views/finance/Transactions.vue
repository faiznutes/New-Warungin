<template>
  <div class="flex flex-col gap-6">
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-2">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Total Transactions</p>
            <h3 class="text-[#0d141b] dark:text-white text-2xl font-bold mt-1">14,205</h3>
          </div>
          <div class="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-primary">
            <span class="material-symbols-outlined icon-filled">receipt_long</span>
          </div>
        </div>
        <div class="flex items-center gap-2 mt-2">
          <span class="flex items-center text-[#078838] bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded text-xs font-semibold">
            <span class="material-symbols-outlined text-[14px] mr-0.5">trending_up</span> +8.2%
          </span>
          <span class="text-xs text-[#4c739a] dark:text-slate-500">vs last month</span>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-2">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Total Volume</p>
            <h3 class="text-[#0d141b] dark:text-white text-2xl font-bold mt-1">Rp 4.5B</h3>
          </div>
          <div class="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600">
            <span class="material-symbols-outlined icon-filled">payments</span>
          </div>
        </div>
        <div class="flex items-center gap-2 mt-2">
          <span class="flex items-center text-[#078838] bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded text-xs font-semibold">
            <span class="material-symbols-outlined text-[14px] mr-0.5">trending_up</span> +12%
          </span>
          <span class="text-xs text-[#4c739a] dark:text-slate-500">vs last month</span>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-2">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Success Rate</p>
            <h3 class="text-[#0d141b] dark:text-white text-2xl font-bold mt-1">98.5%</h3>
          </div>
          <div class="p-2 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600">
            <span class="material-symbols-outlined icon-filled">check_circle</span>
          </div>
        </div>
        <div class="flex items-center gap-2 mt-2">
          <span class="flex items-center text-[#078838] bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded text-xs font-semibold">
            <span class="material-symbols-outlined text-[14px] mr-0.5">trending_up</span> +0.5%
          </span>
          <span class="text-xs text-[#4c739a] dark:text-slate-500">vs last month</span>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-2">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Refunded</p>
            <h3 class="text-[#0d141b] dark:text-white text-2xl font-bold mt-1">Rp 12.5M</h3>
          </div>
          <div class="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600">
            <span class="material-symbols-outlined icon-filled">published_with_changes</span>
          </div>
        </div>
        <div class="flex items-center gap-2 mt-2">
          <span class="flex items-center text-red-600 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded text-xs font-semibold">
            <span class="material-symbols-outlined text-[14px] mr-0.5">trending_up</span> +1.2%
          </span>
          <span class="text-xs text-[#4c739a] dark:text-slate-500">vs last month</span>
        </div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-4 flex flex-col md:flex-row gap-4 justify-between items-center z-20">
      <div class="relative w-full md:w-80">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c739a]">search</span>
        <input 
          v-model="searchQuery"
          class="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-[#0d141b] dark:text-white" 
          placeholder="Search tenant, ID, or amount..." 
          type="text"
        />
      </div>
      <div class="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
        <div class="relative">
          <select class="pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-[#0d141b] dark:text-white cursor-pointer appearance-none">
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>This Month</option>
            <option>Last Month</option>
            <option>Custom Range</option>
          </select>
          <span class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#4c739a] pointer-events-none text-[18px]">calendar_today</span>
        </div>
        <select v-model="methodFilter" class="pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-[#0d141b] dark:text-white cursor-pointer">
          <option value="">All Methods</option>
          <option value="cc">Credit Card</option>
          <option value="bank">Bank Transfer</option>
          <option value="ewallet">E-Wallet</option>
          <option value="qris">QRIS</option>
        </select>
        <select v-model="statusFilter" class="pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-[#0d141b] dark:text-white cursor-pointer">
          <option value="">All Statuses</option>
          <option value="success">Successful</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
          <option value="pending">Pending</option>
        </select>
        <div class="h-8 w-px bg-slate-200 dark:bg-slate-600 mx-1 hidden md:block"></div>
        <button @click="handleExport" class="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 text-[#0d141b] dark:text-white flex items-center gap-2 transition-colors">
          <span class="material-symbols-outlined text-[18px]">download</span>
          Export Data
        </button>
      </div>
    </div>

    <!-- Transaction Table -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
      <div class="overflow-x-auto min-h-[400px]">
        <table class="w-full text-left border-collapse">
          <thead class="bg-slate-50 dark:bg-slate-900/50 text-[#4c739a] dark:text-slate-400 text-xs uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th class="px-6 py-4">Transaction ID</th>
              <th class="px-6 py-4">Tenant</th>
              <th class="px-6 py-4">Date & Time</th>
              <th class="px-6 py-4">Payment Method</th>
              <th class="px-6 py-4">Amount</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
            <tr v-for="trx in transactions" :key="trx.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <td class="px-6 py-4 text-sm font-medium text-[#0d141b] dark:text-white">
                {{ trx.id }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="size-8 rounded bg-gray-100 dark:bg-slate-700 bg-cover bg-center" :style="{ backgroundImage: `url(${trx.logo})` }"></div>
                  <div>
                    <p class="text-sm font-medium text-[#0d141b] dark:text-white">{{ trx.tenantName }}</p>
                    <p class="text-xs text-[#4c739a] dark:text-slate-500">{{ trx.location }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <p class="text-sm text-[#0d141b] dark:text-white">{{ trx.date }}</p>
                <p class="text-xs text-[#4c739a]">{{ trx.time }}</p>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <div class="p-1 rounded" :class="{
                    'bg-blue-50 dark:bg-blue-900/30 text-primary': trx.method === 'Credit Card',
                    'bg-purple-50 dark:bg-purple-900/30 text-purple-600': trx.method === 'Bank Transfer',
                    'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600': trx.method === 'QRIS'
                  }">
                    <span class="material-symbols-outlined text-[16px]">
                       {{ trx.method === 'Credit Card' ? 'credit_card' : (trx.method === 'Bank Transfer' ? 'account_balance' : 'qr_code_2') }}
                    </span>
                  </div>
                  <span class="text-sm text-[#0d141b] dark:text-white">{{ trx.method }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm font-medium text-[#0d141b] dark:text-white">{{ trx.amount }}</td>
              <td class="px-6 py-4">
                <span 
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
                  :class="{
                    'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800': trx.status === 'Successful',
                    'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800': trx.status === 'Failed',
                    'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800': trx.status === 'Refunded'
                  }"
                >
                  <span class="size-1.5 rounded-full" :class="{
                    'bg-green-500': trx.status === 'Successful',
                    'bg-red-500': trx.status === 'Failed',
                    'bg-orange-500': trx.status === 'Refunded'
                  }"></span>
                  {{ trx.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <button @click="handleViewTransaction(trx)" class="text-[#4c739a] hover:text-primary transition-colors">
                  <span class="material-symbols-outlined">visibility</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useNotification } from '../../composables/useNotification';

const { success: showSuccess } = useNotification();
const searchQuery = ref('');
const methodFilter = ref('');
const statusFilter = ref('');

const handleExport = () => {
  showSuccess('Fitur export data akan segera tersedia.');
};

const handleViewTransaction = (_trx: any) => {
  showSuccess('Detail transaksi akan segera tersedia.');
};

// Mock Data
const transactions = ref([
  {
    id: '#TRX-9924',
    tenantName: 'Kopi Kenangan',
    location: 'Jakarta Selatan',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBW34Qr2K16nTwloJ60rHOhPvOb2wH4AJbb2bMwWjJa8VrGwoWCmSnWA5twu7Pvna8kPnB8vr6jK5NOVq-OqCKp0rdb4LAo-TEHTavUT1-sGBYQ8pDRgH5dBEVluSUcQGHBAxVoVAUbcR_SaCjNtEItpsAzcdLDMNv1rvMGQ2gGS83ZHslnXPPxZPdD1v9-jth3JMhkcBa7HxIh5aizg_TuuFBlTRhRYHmeHQKGqLJjQDkdqw5vOjY3lX5hKLvaT-r4lmqTqTFel9E',
    date: 'Oct 24, 2023',
    time: '14:30 PM',
    method: 'Credit Card',
    amount: 'Rp 2.500.000',
    status: 'Successful'
  },
  {
    id: '#TRX-9923',
    tenantName: 'Warung Tegal',
    location: 'Bandung',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApANFzBjP8sTuNydpVbB9hgb7QqggzIZMl57kvKf00hMkTYyymPV_H9F-V5m3RJsLc9ldhvbuY30BYIN_i1HDLpQyQ0IdLY8jHcQuMX-_zOY2rZFtWMxO3iIWvcSuD7eNGMBO9zVNxVWLe0xH4pge50yiH43M3RduOvexjDojoa1iA-kCfim9oSlDUn3Xx785QH_Rq8r5ukr3J5ZCo5BydXnpJLzSe5iEZ12DpXcln6HNbGgWSDhIG-pMuLeRtl5-sBfYV53HYVVY',
    date: 'Oct 24, 2023',
    time: '11:15 AM',
    method: 'Bank Transfer',
    amount: 'Rp 150.000',
    status: 'Failed'
  },
  {
    id: '#TRX-9922',
    tenantName: 'Bakso Boedjangan',
    location: 'Surabaya',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpRm9iKnU9CC-MnWKPq9ZEaf86wjpCVWduh0HYUYf-vPiShY_MZZtTDDW0hJlii3JZ50Ku8FGZN98yP_MrksGq8_1xaC5friuyQjww-Vj86HK249VPx1AbWG_t2_B4dvHcnBw6q28HRd5ARgv3QhKtxZODXvkeCi94_v7_xZ95bbyPhhkQ8Gz-aHLVyY3OZ2IkDlYpJupchrnUW3osXYGJ8-d2A-TaqcPvigkHzcTUEWy0A6-Sc6vCQc27VoHaydKe4a6LdPUbP3Q',
    date: 'Oct 23, 2023',
    time: '09:45 AM',
    method: 'QRIS',
    amount: 'Rp 75.000',
    status: 'Successful'
  }
]);
</script>
