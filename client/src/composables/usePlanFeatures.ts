import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '../stores/auth';
import api from '../api';

export interface PlanFeatures {
  plan: 'BASIC' | 'PRO' | 'CUSTOM';
  features: {
    products: boolean;
    inventory: boolean;
    orders: boolean;
    pos: boolean;
    delivery: boolean;
    customers: boolean;
    members: boolean;
    reports: boolean;
    advancedReporting: boolean;
    advancedAnalytics: boolean;
    financialManagement: boolean;
    profitLoss: boolean;
    marketing: boolean;
    emailMarketing: boolean;
    stores: boolean;
    rewards: boolean;
    discounts: boolean;
    receiptTemplates: boolean;
    userManagement: boolean;
    subscription: boolean;
    addons: boolean;
    settings: boolean;
    webhooks: boolean;
    sessions: boolean;
    passwordSettings: boolean;
    gdpr: boolean;
    twoFactor: boolean;
  };
  activeAddons: Array<{
    id: string;
    type: string;
    name: string;
  }>;
}

const planFeatures = ref<PlanFeatures | null>(null);
const loading = ref(false);

export function usePlanFeatures() {
  const authStore = useAuthStore();

  const fetchPlanFeatures = async () => {
    if (!authStore.isAuthenticated || !authStore.user?.tenantId) {
      planFeatures.value = null;
      return;
    }

    loading.value = true;
    try {
      const response = await api.get('/subscriptions/plan-features');
      planFeatures.value = response.data;
    } catch (error: any) {
      console.error('Error fetching plan features:', error);
      // Default to BASIC if error
      planFeatures.value = {
        plan: 'BASIC',
        features: {
          products: true,
          inventory: false,
          orders: true,
          pos: true,
          delivery: false,
          customers: true,
          members: true,
          reports: true,
          advancedReporting: false,
          advancedAnalytics: false,
          financialManagement: false,
          profitLoss: false,
          marketing: false,
          emailMarketing: false,
          stores: false,
          rewards: false,
          discounts: false,
          receiptTemplates: true,
          userManagement: false,
          subscription: false,
          addons: false,
          settings: true,
          webhooks: false,
          sessions: false,
          passwordSettings: true,
          gdpr: true,
          twoFactor: false,
        },
        activeAddons: [],
      };
    } finally {
      loading.value = false;
    }
  };

  const currentPlan = computed(() => planFeatures.value?.plan || 'BASIC');
  const features = computed(() => planFeatures.value?.features || null);
  const activeAddons = computed(() => planFeatures.value?.activeAddons || []);

  // Check if feature is available
  const hasFeature = (feature: keyof PlanFeatures['features']): boolean => {
    if (!features.value) return false;
    return features.value[feature] === true;
  };

  // Check if addon is active
  const hasAddon = (addonType: string): boolean => {
    return activeAddons.value.some(addon => addon.type === addonType);
  };

  // Check if addon is coming soon (hardcoded list of addons that require external API)
  const isAddonComingSoon = (addonType: string): boolean => {
    const comingSoonAddons = [
      'DELIVERY_MARKETING',
      'FINANCIAL_MANAGEMENT',
      'INVENTORY_MANAGEMENT',
      'AI_ML_FEATURES',
    ];
    return comingSoonAddons.includes(addonType);
  };

  // Computed properties for common checks
  // Hide menu if addon is coming soon (even if active)
  const hasInventory = computed(() => hasFeature('inventory'));
  const hasDeliveryMarketing = computed(() => {
    if (isAddonComingSoon('DELIVERY_MARKETING')) return false;
    return hasAddon('DELIVERY_MARKETING') || hasFeature('delivery');
  });
  const hasBusinessAnalytics = computed(() => hasAddon('BUSINESS_ANALYTICS') || hasFeature('advancedAnalytics'));
  const hasAdvancedReporting = computed(() => hasAddon('ADVANCED_REPORTING') || hasFeature('advancedReporting'));
  const hasFinancialManagement = computed(() => {
    if (isAddonComingSoon('FINANCIAL_MANAGEMENT')) return false;
    return hasAddon('FINANCIAL_MANAGEMENT') || hasFeature('financialManagement');
  });
  const hasInventoryManagement = computed(() => {
    if (isAddonComingSoon('INVENTORY_MANAGEMENT')) return false;
    return hasAddon('INVENTORY_MANAGEMENT') || hasFeature('inventory');
  });
  const hasAIMLFeatures = computed(() => {
    if (isAddonComingSoon('AI_ML_FEATURES')) return false;
    return hasAddon('AI_ML_FEATURES');
  });
  const hasMultiOutlet = computed(() => hasFeature('stores'));
  const hasRewards = computed(() => hasFeature('rewards'));
  const hasDiscounts = computed(() => hasFeature('discounts'));

  // Watch for tenantId changes and refetch
  watch(() => authStore.user?.tenantId, (newTenantId, oldTenantId) => {
    if (newTenantId && newTenantId !== oldTenantId) {
      fetchPlanFeatures();
    } else if (!newTenantId) {
      planFeatures.value = null;
    }
  }, { immediate: true });

  onMounted(() => {
    fetchPlanFeatures();
  });

  return {
    planFeatures,
    currentPlan,
    features,
    activeAddons,
    loading,
    hasFeature,
    hasAddon,
    hasInventory,
    hasDeliveryMarketing,
    hasBusinessAnalytics,
    hasAdvancedReporting,
    hasFinancialManagement,
    hasInventoryManagement,
    hasAIMLFeatures,
    hasMultiOutlet,
    hasRewards,
    hasDiscounts,
    fetchPlanFeatures,
  };
}

