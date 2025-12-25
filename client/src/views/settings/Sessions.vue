<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col gap-1">
      <h1 class="text-[#0d141b] dark:text-white text-2xl sm:text-3xl font-bold leading-tight tracking-tight">Active Sessions</h1>
      <p class="text-[#4c739a] dark:text-slate-400">Manage your active sessions across devices.</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Sessions List -->
    <div v-else class="space-y-4">
      <!-- Empty State -->
      <div v-if="sessions.length === 0" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-12 text-center">
        <span class="material-symbols-outlined text-[64px] text-slate-300 mb-4">devices</span>
        <p class="text-[#4c739a]">No active sessions</p>
      </div>

      <!-- Session Cards -->
      <div
        v-for="session in sessions"
        :key="session.id"
        class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 hover:shadow-md transition group"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-3">
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center"
                :class="session.isCurrent ? 'bg-primary/10 text-primary' : 'bg-[#f8fafc] dark:bg-slate-700 text-[#4c739a]'"
              >
                <span class="material-symbols-outlined">computer</span>
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <h3 class="text-lg font-bold text-[#0d141b] dark:text-white">{{ session.deviceInfo || 'Unknown Device' }}</h3>
                  <span
                    v-if="session.isCurrent"
                    class="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-bold"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Current
                  </span>
                </div>
                <p class="text-sm text-[#4c739a] mt-0.5">{{ session.ipAddress || 'Unknown IP' }}</p>
              </div>
            </div>

            <div class="flex flex-wrap gap-4 text-sm text-[#4c739a]">
              <div class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]">schedule</span>
                <span>Last active: {{ formatDate(session.lastActivityAt) }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]">calendar_today</span>
                <span>Created: {{ formatDate(session.createdAt) }}</span>
              </div>
            </div>
          </div>

          <button
            v-if="!session.isCurrent"
            @click="revokeSession(session.id)"
            class="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 text-sm font-medium flex items-center gap-1"
          >
            <span class="material-symbols-outlined text-[16px]">logout</span>
            Revoke
          </button>
        </div>
      </div>

      <!-- Actions Card -->
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2 bg-red-50 text-red-600 rounded-xl">
            <span class="material-symbols-outlined">security</span>
          </div>
          <div>
            <h3 class="text-lg font-bold text-[#0d141b] dark:text-white">Security Actions</h3>
            <p class="text-sm text-[#4c739a]">End all sessions except current</p>
          </div>
        </div>
        <button
          @click="revokeAllSessions"
          class="w-full px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium flex items-center justify-center gap-2"
        >
          <span class="material-symbols-outlined text-[20px]">logout</span>
          Revoke All Other Sessions
        </button>
        <p class="text-xs text-[#4c739a] mt-2 text-center">
          This will end all active sessions except your current one.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';

const { confirm, success, error } = useNotification();

const loading = ref(true);
const sessions = ref<any[]>([]);

const loadSessions = async () => {
  try {
      const response = await api.get('/sessions');
      const sessionsData = response.data.sessions || [];
      
      // Mark current session (if we have sessionId from JWT or localStorage)
      const currentSessionId = localStorage.getItem('sessionId') || sessionStorage.getItem('sessionId');
      sessions.value = sessionsData.map((session: any) => ({
        ...session,
        isCurrent: session.id === currentSessionId || (!currentSessionId && sessionsData.indexOf(session) === 0),
        lastActivityAt: session.lastActivity || session.lastActivityAt || session.createdAt,
      }));
  } catch (error: any) {
    console.error('Error loading sessions:', error);
  } finally {
    loading.value = false;
  }
};

const revokeSession = async (sessionId: string) => {
  const confirmed = await confirm(
    'Are you sure you want to end this session?',
    'End Session',
    'Yes, End',
    'Cancel'
  );
  
  if (!confirmed) return;

  try {
    await api.delete(`/sessions/${sessionId}`);
    await loadSessions();
    await success('Session ended successfully', 'Success');
  } catch (err: any) {
    console.error('Error revoking session:', err);
    await error(err.response?.data?.message || 'Failed to end session', 'Error');
  }
};

const revokeAllSessions = async () => {
  const confirmed = await confirm(
    'Are you sure you want to end all other sessions? You will remain logged in on this device.',
    'End All Sessions',
    'Yes, End All',
    'Cancel'
  );
  
  if (!confirmed) return;

  try {
    await api.post('/sessions/revoke-all');
    await loadSessions();
    await success('All other sessions ended successfully', 'Success');
  } catch (err: any) {
    console.error('Error revoking all sessions:', err);
    await error(err.response?.data?.message || 'Failed to end sessions', 'Error');
  }
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
  loadSessions();
});
</script>
