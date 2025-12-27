<template>
  <div class="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-sans">
    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col h-full overflow-y-auto scroll-smooth relative">
      <!-- Mobile Header -->
      <div class="md:hidden flex items-center justify-between p-4 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary">store</span>
          <span class="font-bold text-lg">Store Detail</span>
        </div>
      </div>

      <!-- Content Container -->
      <div class="flex-1 w-full max-w-[1200px] mx-auto p-4 md:p-8 flex flex-col gap-8" v-if="store">
        <!-- Breadcrumbs -->
        <nav class="flex text-sm font-medium text-slate-500 dark:text-slate-400 items-center gap-2">
          <router-link to="/app/dashboard" class="hover:text-primary transition-colors">Home</router-link>
          <span class="material-symbols-outlined text-[16px]">chevron_right</span>
          <router-link to="/app/stores" class="hover:text-primary transition-colors">All Stores</router-link>
          <span class="material-symbols-outlined text-[16px]">chevron_right</span>
          <span class="text-slate-800 dark:text-slate-200">{{ store.name }}</span>
        </nav>

        <!-- Page Header & Actions -->
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div class="flex items-start gap-4">
            <!-- Store Logo Placeholder -->
            <div class="h-20 w-20 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm flex items-center justify-center flex-shrink-0 bg-slate-100 dark:bg-slate-800">
               <span class="material-symbols-outlined text-4xl text-slate-400">storefront</span>
            </div>
            <div class="flex flex-col gap-1">
              <h1 class="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">{{ store.name }}</h1>
              <div class="flex items-center gap-2 text-sm">
                <span class="text-slate-500 dark:text-slate-400">ID: {{ store.id.substring(0, 8) }}</span>
                <span class="w-1 h-1 rounded-full bg-slate-300"></span>
                <span 
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border"
                  :class="store.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'"
                >
                  <span class="w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse" :class="store.isActive ? 'bg-emerald-500' : 'bg-red-500'"></span>
                  {{ store.isActive ? 'Operational' : 'Inactive' }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button class="px-4 py-2 bg-white dark:bg-slate-800 border border-border-light dark:border-border-dark rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px]">visibility</span>
              View as User
            </button>
            <router-link :to="`/app/stores/${store.id}/edit`" class="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg text-sm font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px]">edit</span>
              Edit Profile
            </router-link>
          </div>
        </div>

        <!-- Stats Overview (Placeholder Data for now) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-2">
              <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Total Shifts</p>
              <span class="material-symbols-outlined text-primary bg-primary/10 p-1 rounded-md text-[20px]">schedule</span>
            </div>
            <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ store.storeShifts?.length || 0 }}</p>
          </div>
           <!-- Add more real stats as available -->
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left Column: Details -->
          <div class="lg:col-span-2 flex flex-col gap-6">
            <!-- General Info Card -->
            <div class="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm overflow-hidden">
              <div class="px-6 py-4 border-b border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                <h3 class="font-bold text-slate-900 dark:text-white text-lg">General Information</h3>
              </div>
              <div class="p-6 flex flex-col gap-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Establishment Date</label>
                    <p class="text-sm font-medium text-slate-900 dark:text-white">{{ formatDate(store.createdAt) }}</p>
                  </div>
                  <div>
                    <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Address</label>
                    <p class="text-sm font-medium text-slate-900 dark:text-white">{{ store.address || '-' }}</p>
                  </div>
                   <div>
                    <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Phone</label>
                    <p class="text-sm font-medium text-slate-900 dark:text-white">{{ store.phone || '-' }}</p>
                  </div>
                </div>
              </div>
            </div>

             <!-- Shift Configuration Card -->
            <div class="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm overflow-hidden">
              <div class="px-6 py-4 border-b border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                <h3 class="font-bold text-slate-900 dark:text-white text-lg">Shift Configuration</h3>
              </div>
              <div class="p-6">
                  <div v-if="store.shiftConfig && store.shiftConfig.length > 0" class="flex flex-col gap-3">
                      <div v-for="(shift, index) in store.shiftConfig" :key="index" class="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                          <span class="font-medium text-slate-900 dark:text-white">{{ shift.name }}</span>
                          <span class="text-sm text-slate-500">{{ shift.startTime }} - {{ shift.endTime }}</span>
                      </div>
                  </div>
                  <p v-else class="text-sm text-slate-500 italic">No custom shifts configured.</p>
              </div>
            </div>

          </div>

          <!-- Right Column: Operations -->
          <div class="flex flex-col gap-6">
            <!-- Operating Hours -->
            <div class="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm overflow-hidden">
              <div class="px-6 py-4 border-b border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-slate-500 text-[20px]">schedule</span>
                  <h3 class="font-bold text-slate-900 dark:text-white text-lg">Operating Hours</h3>
                </div>
              </div>
              <div class="p-4">
                <ul class="flex flex-col gap-3" v-if="store.operatingHours">
                  <li v-for="(hours, day) in store.operatingHours" :key="day" class="flex justify-between items-center text-sm py-1 border-b border-dashed border-slate-100 dark:border-slate-800 pb-2 capitalize">
                    <span class="text-slate-500">{{ day }}</span>
                    <span class="font-medium text-slate-900 dark:text-white" v-if="hours.isOpen">{{ hours.open }} - {{ hours.close }}</span>
                    <span class="font-medium text-red-500" v-else>Closed</span>
                  </li>
                </ul>
                 <p v-else class="text-sm text-slate-500 italic text-center py-4">Operating hours not set.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="flex items-center justify-center h-full">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import axios from '../../utils/axios';

const route = useRoute();
const authStore = useAuthStore();
const store = ref<any>(null);

const fetchStore = async () => {
    try {
        const response = await axios.get(`/outlets/${route.params.id}`);
        store.value = response.data.data;
    } catch (error) {
        console.error('Failed to fetch store details', error);
    }
};

const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: id });
}

onMounted(() => {
    fetchStore();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

.font-sans {
    font-family: 'Inter', sans-serif;
}
</style>
