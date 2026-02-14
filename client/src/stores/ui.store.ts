import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUIStore = defineStore('ui', () => {
    // Global Modals
    const showOpenShiftModal = ref(false);
    const showSubscriptionExpiredModal = ref(false);
    const subscriptionExpiredMessage = ref('');
    const subscriptionExpiredDate = ref<string | null>(null);

    // Actions
    function openShiftModal() {
        showOpenShiftModal.value = true;
    }

    function closeShiftModal() {
        showOpenShiftModal.value = false;
    }

    function openSubscriptionExpiredModal(message: string, date?: string) {
        subscriptionExpiredMessage.value = message;
        if (date) subscriptionExpiredDate.value = date;
        showSubscriptionExpiredModal.value = true;
    }

    function closeSubscriptionExpiredModal() {
        showSubscriptionExpiredModal.value = false;
        subscriptionExpiredMessage.value = '';
        subscriptionExpiredDate.value = null;
    }

    return {
        showOpenShiftModal,
        showSubscriptionExpiredModal,
        subscriptionExpiredMessage,
        subscriptionExpiredDate,
        openShiftModal,
        closeShiftModal,
        openSubscriptionExpiredModal,
        closeSubscriptionExpiredModal,
    };
});
