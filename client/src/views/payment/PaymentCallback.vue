<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center px-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-card p-8 text-center">
      <!-- Success State -->
      <div v-if="status === 'success'" class="space-y-4">
        <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <span class="material-symbols-outlined text-green-600 text-3xl">check_circle</span>
        </div>
        <h1 class="text-2xl font-bold text-slate-900">Payment Successful!</h1>
        <p class="text-slate-600">
          Your payment has been successfully processed. Your addon or subscription will be activated shortly.
        </p>
        <div v-if="orderId" class="mt-4 p-3 bg-slate-50 rounded-lg">
          <p class="text-sm text-slate-500">Order ID:</p>
          <p class="text-sm font-mono text-slate-700">{{ orderId }}</p>
        </div>
        <div v-if="activationStatus === 'checking'" class="mt-4 p-3 bg-blue-50 rounded-lg">
          <div class="flex items-center justify-center gap-2">
            <div class="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-sm text-blue-600">Verifying and activating addon/subscription...</p>
          </div>
        </div>
        <div v-else-if="activationStatus === 'success'" class="mt-4 p-3 bg-green-50 rounded-lg">
          <p class="text-sm text-green-600">✅ Addon/subscription activated successfully!</p>
        </div>
        <div class="mt-6 space-y-3">
          <button
            @click="goToPaymentPage"
            class="w-full px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition font-medium"
          >
            {{ isSubscriptionPayment ? 'Back to Subscription' : 'Back to Addons' }}
          </button>
          <button
            @click="goToDashboard"
            class="w-full px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="status === 'error'" class="space-y-4">
        <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <span class="material-symbols-outlined text-red-600 text-3xl">cancel</span>
        </div>
        <h1 class="text-2xl font-bold text-slate-900">Payment Failed</h1>
        <p class="text-slate-600">
          Sorry, your payment could not be processed. Please try again or contact support if the problem persists.
        </p>
        <div v-if="orderId" class="mt-4 p-3 bg-slate-50 rounded-lg">
          <p class="text-sm text-slate-500">Order ID:</p>
          <p class="text-sm font-mono text-slate-700">{{ orderId }}</p>
        </div>
        <div class="mt-6 space-y-3">
          <button
            @click="goToPaymentPage"
            class="w-full px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition font-medium"
          >
            Try Again
          </button>
          <button
            @click="goToDashboard"
            class="w-full px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>

      <!-- Pending State -->
      <div v-else-if="status === 'pending'" class="space-y-4">
        <div class="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
          <span class="material-symbols-outlined text-yellow-600 text-3xl animate-spin">sync</span>
        </div>
        <h1 class="text-2xl font-bold text-slate-900">Payment Pending</h1>
        <p class="text-slate-600">
          Your payment is being processed. We will send a notification once the payment is confirmed.
        </p>
        <div v-if="orderId" class="mt-4 p-3 bg-slate-50 rounded-lg">
          <p class="text-sm text-slate-500">Order ID:</p>
          <p class="text-sm font-mono text-slate-700">{{ orderId }}</p>
        </div>
        <div class="mt-6 space-y-3">
          <button
            @click="goToPaymentPage"
            class="w-full px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition font-medium"
          >
            {{ isSubscriptionPayment ? 'Back to Subscription' : 'Back to Addons' }}
          </button>
          <button
            @click="goToDashboard"
            class="w-full px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import api from '../../api';

interface Props {
  status: 'success' | 'error' | 'pending';
  order_id?: string;
  transaction_status?: string;
  status_code?: string;
}

const props = defineProps<Props>();
const router = useRouter();
const authStore = useAuthStore();

const orderId = computed(() => props.order_id);
const checking = ref(false);
const activationStatus = ref<'checking' | 'success' | 'error' | null>(null);

// Determine if this is a subscription payment based on order_id format
// New format: SUB-{hash}-{timestamp} or ADD-{hash}-{timestamp}
// Old format: subscription-{plan}-{duration}-{timestamp} or addon-{addonType}-{timestamp}
const isSubscriptionPayment = computed(() => {
  const id = props.order_id || '';
  return id.startsWith('SUB-') || id.startsWith('subscription-') || id.startsWith('upgrade-');
});

const goToPaymentPage = () => {
  if (authStore.isAuthenticated) {
    if (isSubscriptionPayment.value) {
      router.push('/app/subscription');
    } else {
      router.push('/app/addons');
    }
  } else {
    router.push('/login');
  }
};

const goToDashboard = () => {
  if (authStore.isAuthenticated) {
    // Router guard will redirect to appropriate dashboard based on role
    router.push('/app');
  } else {
    router.push('/login');
  }
};

// Check payment status and trigger activation if needed
const checkAndActivate = async () => {
  if (!orderId.value) {
    return;
  }

  // Only check if payment is successful or pending
  if (props.status !== 'success' && props.status !== 'pending') {
    return;
  }

  checking.value = true;
  activationStatus.value = 'checking';

  try {
    // Check payment status (this will also trigger activation if payment is settled)
    const response = await api.get(`/payment/status/${orderId.value}`);
    
    console.log('Payment status check result:', response.data);

    if (response.data.status === 'settlement' || response.data.status === 'capture') {
      activationStatus.value = 'success';
      console.log('Payment is settled, addon/subscription should be activated');
      
      // Wait a bit for activation to complete, then reload if needed
      setTimeout(() => {
        // Optionally reload addons/subscription data
        if (authStore.isAuthenticated) {
          // The page will redirect, so no need to reload here
        }
      }, 2000);
    } else if (response.data.status === 'pending') {
      // Payment is still pending, poll again after a delay
      activationStatus.value = null;
      setTimeout(() => {
        checkAndActivate();
      }, 3000); // Check again in 3 seconds
    } else {
      activationStatus.value = 'error';
    }
  } catch (error: any) {
    console.error('Error checking payment status:', error);
    activationStatus.value = 'error';
    // Don't show error to user, webhook might still process it
  } finally {
    checking.value = false;
  }
};

onMounted(() => {
  console.log('Payment callback:', {
    status: props.status,
    orderId: props.order_id,
    transactionStatus: props.transaction_status,
    statusCode: props.status_code,
  });

  // If payment is successful or pending, check status and trigger activation
  // This ensures addon is activated even if webhook is delayed or not called
  if (props.status === 'success' || props.status === 'pending') {
    // Wait a bit for webhook to process first, then check status as fallback
    setTimeout(() => {
      checkAndActivate();
    }, 2000); // Wait 2 seconds for webhook to process
  }
});
</script>

