<template>
  <div class="flex flex-col gap-6">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 class="text-[#0d141b] dark:text-white text-3xl font-bold leading-tight tracking-tight">Support Tickets</h1>
        <p class="text-[#4c739a] dark:text-slate-400 mt-2">View and manage tenant support requests, track issues, and assign agents.</p>
      </div>
      <div class="flex gap-3">
        <div class="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
          <span class="flex h-2 w-2 relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <div class="flex flex-col">
            <span class="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">High Priority</span>
            <span class="text-sm font-bold text-[#0d141b] dark:text-white">5 Active</span>
          </div>
        </div>
        <div class="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
          <span class="flex h-2 w-2 rounded-full bg-blue-500"></span>
          <div class="flex flex-col">
            <span class="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">Open Tickets</span>
            <span class="text-sm font-bold text-[#0d141b] dark:text-white">24 Total</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col xl:flex-row gap-4 justify-between items-center z-20">
      <div class="flex flex-col md:flex-row gap-3 w-full xl:w-auto flex-1">
        <div class="relative w-full md:w-80">
          <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">search</span>
          <input 
            v-model="searchQuery" 
            class="pl-10 pr-4 py-2.5 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:text-white dark:placeholder:text-slate-500" 
            placeholder="Search by Ticket ID, Tenant, Subject..." 
            type="text"
          />
        </div>
        <div class="flex gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select v-model="statusFilter" class="form-select text-sm rounded-xl border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-primary min-w-[140px] py-2.5 cursor-pointer hover:border-slate-300 dark:hover:border-slate-500 transition-colors">
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <select v-model="priorityFilter" class="form-select text-sm rounded-xl border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-primary min-w-[140px] py-2.5 cursor-pointer hover:border-slate-300 dark:hover:border-slate-500 transition-colors">
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>
      <button class="w-full xl:w-auto px-5 py-2.5 bg-primary hover:bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 whitespace-nowrap">
        <span class="material-symbols-outlined text-[20px]">add_circle</span>
        Create New Ticket
      </button>
    </div>

    <!-- Ticket Table -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
      <div class="overflow-x-auto min-h-[400px]">
        <table class="w-full text-left border-collapse">
          <thead class="bg-slate-50 dark:bg-slate-900/50 text-[#4c739a] dark:text-slate-400 text-xs uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th class="px-6 py-4 w-[140px]">Ticket ID</th>
              <th class="px-6 py-4 w-[200px]">Tenant</th>
              <th class="px-6 py-4">Subject</th>
              <th class="px-6 py-4 w-[120px]">Priority</th>
              <th class="px-6 py-4 w-[140px]">Status</th>
              <th class="px-6 py-4 w-[160px]">Assigned To</th>
              <th class="px-6 py-4 w-[180px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
            <tr v-for="ticket in filteredTickets" :key="ticket.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
              <td class="px-6 py-4">
                <span class="text-sm font-mono font-medium text-[#0d141b] dark:text-white">{{ ticket.id }}</span>
                <div class="text-[10px] text-slate-400 mt-0.5">{{ ticket.timeAgo }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="size-8 rounded bg-gray-100 dark:bg-slate-700 bg-cover bg-center shrink-0 flex items-center justify-center font-bold text-xs text-gray-500">
                    {{ ticket.tenant.charAt(0) }}
                  </div>
                  <p class="text-sm font-medium text-[#0d141b] dark:text-white truncate max-w-[120px]">{{ ticket.tenant }}</p>
                </div>
              </td>
              <td class="px-6 py-4">
                <p class="text-sm font-medium text-[#0d141b] dark:text-white">{{ ticket.subject }}</p>
                <p class="text-xs text-[#4c739a] dark:text-slate-500 mt-0.5 truncate max-w-[250px]">{{ ticket.description }}</p>
              </td>
              <td class="px-6 py-4">
                <span 
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
                  :class="{
                    'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800': ticket.priority === 'High',
                    'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800': ticket.priority === 'Medium',
                    'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600': ticket.priority === 'Low'
                  }"
                >
                  <span class="size-1.5 rounded-full" :class="{
                    'bg-red-500': ticket.priority === 'High',
                    'bg-amber-500': ticket.priority === 'Medium',
                    'bg-slate-400': ticket.priority === 'Low'
                  }"></span>
                  {{ ticket.priority }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span 
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
                  :class="{
                    'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800': ticket.status === 'Open',
                    'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-purple-800': ticket.status === 'In Progress',
                    'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800': ticket.status === 'Resolved'
                  }"
                >
                  {{ ticket.status }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div v-if="ticket.assignedTo" class="flex items-center gap-2">
                  <div class="size-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">{{ ticket.assignedTo.initials }}</div>
                  <span class="text-sm text-[#0d141b] dark:text-white">{{ ticket.assignedTo.name }}</span>
                </div>
                <div v-else class="flex items-center gap-2 text-slate-400 text-sm italic">
                  <span class="material-symbols-outlined text-[18px]">person_off</span>
                  Unassigned
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button class="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors" title="View Details">
                    <span class="material-symbols-outlined text-[20px]">visibility</span>
                  </button>
                  <button class="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors" title="Assign Agent">
                    <span class="material-symbols-outlined text-[20px]">person_add</span>
                  </button>
                  <button class="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors" title="Add Note">
                    <span class="material-symbols-outlined text-[20px]">note_add</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-sm text-[#4c739a] dark:text-slate-400">Showing <span class="font-semibold text-[#0d141b] dark:text-white">1-5</span> of <span class="font-semibold text-[#0d141b] dark:text-white">128</span> tickets</p>
        <div class="flex items-center gap-2">
          <button class="px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50" disabled>Previous</button>
          <div class="flex gap-1">
            <button class="size-8 rounded border border-primary bg-primary text-white text-sm font-medium">1</button>
            <button class="size-8 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">2</button>
            <button class="size-8 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">3</button>
          </div>
          <button class="px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const searchQuery = ref('');
const statusFilter = ref('');
const priorityFilter = ref('');

// Mock Data matching prompt.md example
const tickets = ref([
  {
    id: '#TKT-2490',
    timeAgo: '2 hours ago',
    tenant: 'Kopi Kenangan',
    subject: 'Critical POS Sync Failure',
    description: 'Unable to sync inventory data with server...',
    priority: 'High',
    status: 'Open',
    assignedTo: null
  },
  {
    id: '#TKT-2489',
    timeAgo: '5 hours ago',
    tenant: 'Warung Tegal',
    subject: 'Billing Dashboard Access',
    description: 'Client cannot view invoice history for Oct...',
    priority: 'Medium',
    status: 'In Progress',
    assignedTo: { name: 'Sarah Jenkins', initials: 'SJ' }
  },
  {
    id: '#TKT-2485',
    timeAgo: '2 days ago',
    tenant: 'Sate Senayan',
    subject: 'Payment Gateway Error 500',
    description: 'Customers reporting failure during checkout...',
    priority: 'High',
    status: 'In Progress',
    assignedTo: { name: 'Tech Support', initials: 'TS' }
  },
  {
    id: '#TKT-2484',
    timeAgo: '3 days ago',
    tenant: 'Janji Jiwa',
    subject: 'Loyalty Points Not Accruing',
    description: 'Points system seems stuck for last 5 orders.',
    priority: 'Medium',
    status: 'Open',
    assignedTo: null
  },
  {
      id: '#TKT-2488',
      timeAgo: '1 day ago',
      tenant: 'Bakso Boedjangan',
      subject: 'Feature Request: Dark Mode',
      description: 'Requested dark mode for kitchen display system.',
      priority: 'Low',
      status: 'Resolved',
      assignedTo: { name: 'Mike T.', initials: 'MT' } 
  }
]);

const filteredTickets = computed(() => {
  return tickets.value.filter(ticket => {
    // Filter by Status
    if (statusFilter.value && ticket.status.toLowerCase().replace(' ', '-') !== statusFilter.value) {
      return false;
    }
    
    // Filter by Priority
    if (priorityFilter.value && ticket.priority.toLowerCase() !== priorityFilter.value) {
      return false;
    }
    
    // Filter by Search (ID, Tenant, Subject)
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      return (
        ticket.id.toLowerCase().includes(query) ||
        ticket.tenant.toLowerCase().includes(query) ||
        ticket.subject.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
});
</script>
