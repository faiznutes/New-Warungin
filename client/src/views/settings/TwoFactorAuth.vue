<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col gap-1">
      <h1 class="text-[#0d141b] dark:text-white text-2xl sm:text-3xl font-bold leading-tight tracking-tight">Two-Factor Authentication</h1>
      <p class="text-[#4c739a] dark:text-slate-400">Enhance your account security with 2FA.</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- 2FA Status Card -->
    <div v-else class="space-y-6">
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-xl" :class="status.enabled ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'">
              <span class="material-symbols-outlined">{{ status.enabled ? 'verified_user' : 'security' }}</span>
            </div>
            <div>
              <h3 class="text-lg font-bold text-[#0d141b] dark:text-white">2FA Status</h3>
              <p class="text-sm text-[#4c739a]">Your two-factor authentication status</p>
            </div>
          </div>
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            :class="status.enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="status.enabled ? 'bg-green-500' : 'bg-slate-400'"></span>
            {{ status.enabled ? 'Enabled' : 'Disabled' }}
          </span>
        </div>

        <div v-if="status.enabled" class="mt-4 space-y-4">
          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-blue-600 text-[20px]">key</span>
              <div>
                <p class="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Backup Codes Remaining: {{ status.remainingBackupCodes }}
                </p>
                <p class="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                  Keep backup codes safe. Use them if you lose access to your authenticator app.
                </p>
              </div>
            </div>
          </div>

          <button
            @click="showDisableModal = true"
            class="w-full px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium flex items-center justify-center gap-2"
          >
            <span class="material-symbols-outlined text-[20px]">shield_off</span>
            Disable 2FA
          </button>
        </div>

        <div v-else class="mt-4">
          <button
            @click="startSetup"
            class="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/30 transition-all active:scale-95 font-medium"
          >
            <span class="material-symbols-outlined text-[20px]">shield</span>
            Enable 2FA
          </button>
        </div>
      </div>

      <!-- Setup Flow -->
      <div v-if="setupStep === 'generate'" class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2 bg-primary/10 text-primary rounded-xl">
            <span class="material-symbols-outlined">qr_code_scanner</span>
          </div>
          <div>
            <h3 class="text-lg font-bold text-[#0d141b] dark:text-white">Step 1: Scan QR Code</h3>
            <p class="text-sm text-[#4c739a]">Scan with Google Authenticator or Authy</p>
          </div>
        </div>

        <div v-if="generating" class="text-center py-8">
          <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-[#4c739a]">Generating QR code...</p>
        </div>

        <div v-else-if="qrData" class="space-y-4">
          <!-- QR Code -->
          <div class="flex justify-center">
            <img :src="qrData.qrCode" alt="2FA QR Code" class="border-2 border-slate-200 dark:border-slate-600 rounded-xl p-4 bg-white" />
          </div>

          <!-- Manual Entry -->
          <div class="bg-[#f8fafc] dark:bg-slate-900 rounded-xl p-4">
            <p class="text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Or enter manually:</p>
            <div class="flex items-center gap-2">
              <code class="flex-1 bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-mono text-[#0d141b] dark:text-white">{{ qrData.secret }}</code>
              <button
                @click="copySecret"
                class="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition text-sm font-medium flex items-center gap-1"
              >
                <span class="material-symbols-outlined text-[16px]">content_copy</span>
                Copy
              </button>
            </div>
          </div>

          <!-- Backup Codes -->
          <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <div class="flex items-center gap-2 mb-3">
              <span class="material-symbols-outlined text-yellow-600 text-[20px]">warning</span>
              <p class="text-sm font-bold text-yellow-800 dark:text-yellow-200">Backup Codes (Save these!)</p>
            </div>
            <div class="grid grid-cols-2 gap-2 mb-3">
              <code
                v-for="(code, index) in qrData.backupCodes"
                :key="index"
                class="bg-white dark:bg-slate-800 px-2 py-1.5 rounded-xl text-xs font-mono text-center border border-yellow-200 dark:border-yellow-800"
              >
                {{ code }}
              </code>
            </div>
            <button
              @click="copyBackupCodes"
              class="w-full px-3 py-2 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition text-sm font-medium flex items-center justify-center gap-2"
            >
              <span class="material-symbols-outlined text-[18px]">content_copy</span>
              Copy All Backup Codes
            </button>
          </div>

          <!-- Verify Token -->
          <div class="space-y-2">
            <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider">Enter 6-digit code from authenticator:</label>
            <input
              v-model="verificationToken"
              type="text"
              maxlength="6"
              placeholder="000000"
              class="w-full px-4 py-3 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-center text-2xl tracking-widest font-mono text-[#0d141b] dark:text-white"
              @input="verificationToken = verificationToken.replace(/\D/g, '')"
            />
            <p v-if="verifyError" class="text-sm text-red-600">{{ verifyError }}</p>
          </div>

          <div class="flex gap-3">
            <button
              @click="cancelSetup"
              class="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition font-medium"
            >
              Cancel
            </button>
            <button
              @click="enable2FA"
              :disabled="verificationToken.length !== 6 || enabling"
              class="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition font-medium shadow-lg shadow-emerald-500/30"
            >
              {{ enabling ? 'Enabling...' : 'Enable 2FA' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Disable Modal -->
    <Teleport to="body">
      <div
        v-if="showDisableModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="showDisableModal = false"
      >
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 bg-red-50 text-red-600 rounded-xl">
              <span class="material-symbols-outlined">shield_off</span>
            </div>
            <h3 class="text-xl font-bold text-slate-900 dark:text-white">Disable 2FA</h3>
          </div>
          <p class="text-slate-500 mb-4">
            To disable 2FA, please enter your password.
          </p>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
              <input
                v-model="disablePassword"
                type="password"
                placeholder="Enter your password"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <p v-if="disableError" class="text-sm text-red-600 mt-1">{{ disableError }}</p>
            </div>

            <div class="flex gap-3">
              <button
                @click="showDisableModal = false"
                class="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition font-medium"
              >
                Cancel
              </button>
              <button
                @click="disable2FA"
                :disabled="!disablePassword || disabling"
                class="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition font-medium"
              >
                {{ disabling ? 'Disabling...' : 'Disable' }}
              </button>
            </div>
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

const { success, error } = useNotification();

const loading = ref(true);
const status = ref({
  enabled: false,
  remainingBackupCodes: 0,
});

const setupStep = ref<'idle' | 'generate'>('idle');
const generating = ref(false);
const qrData = ref<{
  secret: string;
  qrCode: string;
  backupCodes: string[];
} | null>(null);
const verificationToken = ref('');
const verifyError = ref('');
const enabling = ref(false);

const showDisableModal = ref(false);
const disablePassword = ref('');
const disableError = ref('');
const disabling = ref(false);

const loadStatus = async () => {
  try {
    const response = await api.get('/2fa/status');
    status.value = response.data;
  } catch (error: any) {
    console.error('Error loading 2FA status:', error);
  } finally {
    loading.value = false;
  }
};

const startSetup = async () => {
  setupStep.value = 'generate';
  generating.value = true;
  verifyError.value = '';
  verificationToken.value = '';

  try {
    const response = await api.post('/2fa/generate');
    qrData.value = response.data;
  } catch (error: any) {
    console.error('Error generating 2FA secret:', error);
    verifyError.value = error.response?.data?.message || 'Failed to generate QR code';
  } finally {
    generating.value = false;
  }
};

const enable2FA = async () => {
  if (verificationToken.value.length !== 6) {
    verifyError.value = 'Token must be 6 digits';
    return;
  }

  enabling.value = true;
  verifyError.value = '';

  try {
    await api.post('/2fa/enable', { token: verificationToken.value });
    await loadStatus();
    setupStep.value = 'idle';
    qrData.value = null;
    verificationToken.value = '';
    
    await success('2FA enabled successfully!', 'Success');
  } catch (err: any) {
    console.error('Error enabling 2FA:', err);
    verifyError.value = err.response?.data?.message || 'Invalid token';
  } finally {
    enabling.value = false;
  }
};

const cancelSetup = () => {
  setupStep.value = 'idle';
  qrData.value = null;
  verificationToken.value = '';
  verifyError.value = '';
};

const disable2FA = async () => {
  if (!disablePassword.value) {
    disableError.value = 'Password is required';
    return;
  }

  disabling.value = true;
  disableError.value = '';

  try {
    await api.post('/2fa/disable', { password: disablePassword.value });
    await loadStatus();
    showDisableModal.value = false;
    disablePassword.value = '';
    
    await success('2FA disabled successfully', 'Success');
  } catch (err: any) {
    console.error('Error disabling 2FA:', err);
    disableError.value = err.response?.data?.message || 'Invalid password';
  } finally {
    disabling.value = false;
  }
};

const copySecret = async () => {
  if (qrData.value) {
    navigator.clipboard.writeText(qrData.value.secret);
    await success('Secret copied!', 'Success');
  }
};

const copyBackupCodes = async () => {
  if (qrData.value) {
    navigator.clipboard.writeText(qrData.value.backupCodes.join('\n'));
    await success('Backup codes copied!', 'Success');
  }
};

onMounted(() => {
  loadStatus();
});
</script>
