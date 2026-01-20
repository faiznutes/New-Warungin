/**
 * CENTRALIZED ENUM DEFINITIONS
 * Single source of truth for all enum values across the application
 * CRITICAL: All hardcoded enum strings must be replaced with values from this file
 * 
 * This file ensures:
 * 1. Type safety - TypeScript enums caught at compile time
 * 2. Consistency - No mismatches between frontend/backend/database
 * 3. Maintainability - One place to update all enum values
 * 4. Documentation - Clear list of all valid values for each enum
 */

/**
 * USER ROLES - Controls access level and permissions
 * @enum {string}
 */
export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',       // System administrator - full access across all tenants
  ADMIN_TENANT: 'ADMIN_TENANT',     // Tenant administrator - full access within tenant
  SUPERVISOR: 'SUPERVISOR',         // Store supervisor - manages multiple outlets
  CASHIER: 'CASHIER',               // Cashier - handles transactions at specific outlet
  KITCHEN: 'KITCHEN',               // Kitchen staff - manages kitchen orders
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

/**
 * All valid USER ROLES for type safety
 */
export const VALID_USER_ROLES: UserRole[] = [
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.ADMIN_TENANT,
  USER_ROLES.SUPERVISOR,
  USER_ROLES.CASHIER,
  USER_ROLES.KITCHEN,
];

/**
 * ORDER STATUSES - Tracks order lifecycle
 * @enum {string}
 */
export const ORDER_STATUSES = {
  PENDING: 'PENDING',           // Order created, waiting to be processed
  PROCESSING: 'PROCESSING',     // Order is being prepared
  COMPLETED: 'COMPLETED',       // Order completed and ready for pickup/delivery
  CANCELLED: 'CANCELLED',       // Order cancelled by user or system
  REFUNDED: 'REFUNDED',         // Order refunded
} as const;

export type OrderStatus = typeof ORDER_STATUSES[keyof typeof ORDER_STATUSES];

/**
 * All valid ORDER STATUSES for type safety
 */
export const VALID_ORDER_STATUSES: OrderStatus[] = [
  ORDER_STATUSES.PENDING,
  ORDER_STATUSES.PROCESSING,
  ORDER_STATUSES.COMPLETED,
  ORDER_STATUSES.CANCELLED,
  ORDER_STATUSES.REFUNDED,
];

/**
 * PAYMENT METHODS - Payment options available
 * @enum {string}
 */
export const PAYMENT_METHODS = {
  CASH: 'CASH',                 // Direct cash payment
  QRIS: 'QRIS',                 // Indonesian QR code standard
  CARD: 'CARD',                 // Credit/debit card (via Midtrans)
  E_WALLET: 'E_WALLET',         // Digital wallet (via Midtrans)
  BANK_TRANSFER: 'BANK_TRANSFER', // Bank transfer
  SHOPEEPAY: 'SHOPEEPAY',       // Shopee payment gateway
  DANA: 'DANA',                 // DANA e-wallet
} as const;

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];

/**
 * All valid PAYMENT METHODS for type safety
 */
export const VALID_PAYMENT_METHODS: PaymentMethod[] = [
  PAYMENT_METHODS.CASH,
  PAYMENT_METHODS.QRIS,
  PAYMENT_METHODS.CARD,
  PAYMENT_METHODS.E_WALLET,
  PAYMENT_METHODS.BANK_TRANSFER,
  PAYMENT_METHODS.SHOPEEPAY,
  PAYMENT_METHODS.DANA,
];

/**
 * TRANSACTION STATUSES - Tracks payment transaction state
 * @enum {string}
 */
export const TRANSACTION_STATUSES = {
  PENDING: 'PENDING',           // Transaction awaiting payment
  COMPLETED: 'COMPLETED',       // Payment received
  FAILED: 'FAILED',             // Payment failed
  REFUNDED: 'REFUNDED',         // Payment refunded
} as const;

export type TransactionStatus = typeof TRANSACTION_STATUSES[keyof typeof TRANSACTION_STATUSES];

/**
 * All valid TRANSACTION STATUSES for type safety
 */
export const VALID_TRANSACTION_STATUSES: TransactionStatus[] = [
  TRANSACTION_STATUSES.PENDING,
  TRANSACTION_STATUSES.COMPLETED,
  TRANSACTION_STATUSES.FAILED,
  TRANSACTION_STATUSES.REFUNDED,
];

/**
 * KITCHEN STATUSES - Kitchen order workflow
 * @enum {string}
 */
export const KITCHEN_STATUSES = {
  PENDING: 'PENDING',           // New order in kitchen queue
  PROCESSING: 'PROCESSING',     // Being prepared
  READY: 'READY',               // Ready for pickup
  COMPLETED: 'COMPLETED',       // Completed and picked up
} as const;

export type KitchenStatus = typeof KITCHEN_STATUSES[keyof typeof KITCHEN_STATUSES];

/**
 * All valid KITCHEN STATUSES for type safety
 */
export const VALID_KITCHEN_STATUSES: KitchenStatus[] = [
  KITCHEN_STATUSES.PENDING,
  KITCHEN_STATUSES.PROCESSING,
  KITCHEN_STATUSES.READY,
  KITCHEN_STATUSES.COMPLETED,
];

/**
 * PRODUCT ADJUSTMENT TYPES - Stock adjustment categories
 * @enum {string}
 */
export const PRODUCT_ADJUSTMENT_TYPES = {
  INCREASE: 'INCREASE',         // Increase stock (purchase, correction)
  DECREASE: 'DECREASE',         // Decrease stock (damage, loss, correction)
} as const;

export type ProductAdjustmentType = typeof PRODUCT_ADJUSTMENT_TYPES[keyof typeof PRODUCT_ADJUSTMENT_TYPES];

/**
 * All valid PRODUCT ADJUSTMENT TYPES for type safety
 */
export const VALID_PRODUCT_ADJUSTMENT_TYPES: ProductAdjustmentType[] = [
  PRODUCT_ADJUSTMENT_TYPES.INCREASE,
  PRODUCT_ADJUSTMENT_TYPES.DECREASE,
];

/**
 * ADDON TYPES - Subscription add-on categories
 * @enum {string}
 */
export const ADDON_TYPES = {
  SUPERVISOR_ROLE: 'SUPERVISOR_ROLE',     // Enable supervisor role feature
  KITCHEN_DISPLAY: 'KITCHEN_DISPLAY',     // Kitchen display system
  ADVANCED_REPORTS: 'ADVANCED_REPORTS',   // Advanced reporting features
  CUSTOMER_LOYALTY: 'CUSTOMER_LOYALTY',   // Loyalty program features
  MULTI_OUTLET: 'MULTI_OUTLET',           // Multiple outlet support
} as const;

export type AddonType = typeof ADDON_TYPES[keyof typeof ADDON_TYPES];

/**
 * All valid ADDON TYPES for type safety
 */
export const VALID_ADDON_TYPES: AddonType[] = [
  ADDON_TYPES.SUPERVISOR_ROLE,
  ADDON_TYPES.KITCHEN_DISPLAY,
  ADDON_TYPES.ADVANCED_REPORTS,
  ADDON_TYPES.CUSTOMER_LOYALTY,
  ADDON_TYPES.MULTI_OUTLET,
];

/**
 * ADDON STATUSES - Current status of an addon subscription
 * @enum {string}
 */
export const ADDON_STATUSES = {
  ACTIVE: 'ACTIVE',             // Currently active and available
  INACTIVE: 'INACTIVE',         // Not currently active
  EXPIRED: 'EXPIRED',           // Subscription has expired
  CANCELLED: 'CANCELLED',       // Cancelled by user
} as const;

export type AddonStatus = typeof ADDON_STATUSES[keyof typeof ADDON_STATUSES];

/**
 * All valid ADDON STATUSES for type safety
 * NOTE: Database uses 'active' (lowercase), ensure comparisons use both 'active' and 'ACTIVE'
 */
export const VALID_ADDON_STATUSES: (typeof ADDON_STATUSES[keyof typeof ADDON_STATUSES] | 'active' | 'inactive')[] = [
  ADDON_STATUSES.ACTIVE,
  ADDON_STATUSES.INACTIVE,
  ADDON_STATUSES.EXPIRED,
  ADDON_STATUSES.CANCELLED,
  'active',   // Lowercase variant used in some places
  'inactive',
];

/**
 * SUBSCRIPTION PLANS - Available pricing plans
 * @enum {string}
 */
export const SUBSCRIPTION_PLANS = {
  BASIC: 'BASIC',               // Basic plan with core features
  PRO: 'PRO',                   // Professional plan with advanced features
  ENTERPRISE: 'ENTERPRISE',     // Enterprise plan with all features
} as const;

export type SubscriptionPlan = typeof SUBSCRIPTION_PLANS[keyof typeof SUBSCRIPTION_PLANS];

/**
 * All valid SUBSCRIPTION PLANS for type safety
 */
export const VALID_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  SUBSCRIPTION_PLANS.BASIC,
  SUBSCRIPTION_PLANS.PRO,
  SUBSCRIPTION_PLANS.ENTERPRISE,
];

/**
 * TENANT STATUSES - Multi-tenant account statuses
 * @enum {string}
 */
export const TENANT_STATUSES = {
  ACTIVE: 'ACTIVE',             // Active tenant
  INACTIVE: 'INACTIVE',         // Inactive tenant
  SUSPENDED: 'SUSPENDED',       // Suspended tenant (e.g., non-payment)
  CANCELLED: 'CANCELLED',       // Cancelled tenant
} as const;

export type TenantStatus = typeof TENANT_STATUSES[keyof typeof TENANT_STATUSES];

/**
 * All valid TENANT STATUSES for type safety
 */
export const VALID_TENANT_STATUSES: TenantStatus[] = [
  TENANT_STATUSES.ACTIVE,
  TENANT_STATUSES.INACTIVE,
  TENANT_STATUSES.SUSPENDED,
  TENANT_STATUSES.CANCELLED,
];

/**
 * DISCOUNT TYPES - How discounts are applied
 * @enum {string}
 */
export const DISCOUNT_TYPES = {
  FIXED: 'FIXED',               // Fixed amount discount (e.g., -50000)
  PERCENTAGE: 'PERCENTAGE',     // Percentage discount (e.g., 10%)
  PRODUCT_BASED: 'PRODUCT_BASED', // Discount on specific products
  QUANTITY_BASED: 'QUANTITY_BASED', // Discount based on quantity purchased
  BUNDLE: 'BUNDLE',             // Bundle discount (buy X get Y)
} as const;

export type DiscountType = typeof DISCOUNT_TYPES[keyof typeof DISCOUNT_TYPES];

/**
 * All valid DISCOUNT TYPES for type safety
 */
export const VALID_DISCOUNT_TYPES: DiscountType[] = [
  DISCOUNT_TYPES.FIXED,
  DISCOUNT_TYPES.PERCENTAGE,
  DISCOUNT_TYPES.PRODUCT_BASED,
  DISCOUNT_TYPES.QUANTITY_BASED,
  DISCOUNT_TYPES.BUNDLE,
];

/**
 * UTILITY FUNCTIONS - For validation and safe access
 */

/**
 * Check if a value is a valid UserRole
 */
export function isValidUserRole(value: any): value is UserRole {
  return Object.values(USER_ROLES).includes(value);
}

/**
 * Check if a value is a valid OrderStatus
 */
export function isValidOrderStatus(value: any): value is OrderStatus {
  return Object.values(ORDER_STATUSES).includes(value);
}

/**
 * Check if a value is a valid PaymentMethod
 */
export function isValidPaymentMethod(value: any): value is PaymentMethod {
  return Object.values(PAYMENT_METHODS).includes(value);
}

/**
 * Check if a value is a valid TransactionStatus
 */
export function isValidTransactionStatus(value: any): value is TransactionStatus {
  return Object.values(TRANSACTION_STATUSES).includes(value);
}

/**
 * Check if a value is a valid KitchenStatus
 */
export function isValidKitchenStatus(value: any): value is KitchenStatus {
  return Object.values(KITCHEN_STATUSES).includes(value);
}

/**
 * Check if a value is a valid AddonStatus (handles both cases)
 */
export function isValidAddonStatus(value: any): boolean {
  return (
    Object.values(ADDON_STATUSES).includes(value) ||
    value === 'active' ||
    value === 'inactive'
  );
}

/**
 * Check if a value is a valid SubscriptionPlan
 */
export function isValidSubscriptionPlan(value: any): value is SubscriptionPlan {
  return Object.values(SUBSCRIPTION_PLANS).includes(value);
}

/**
 * Check if a value is a valid DiscountType
 */
export function isValidDiscountType(value: any): value is DiscountType {
  return Object.values(DISCOUNT_TYPES).includes(value);
}

/**
 * Get human-readable label for UserRole
 */
export function getUserRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    [USER_ROLES.SUPER_ADMIN]: 'Super Administrator',
    [USER_ROLES.ADMIN_TENANT]: 'Tenant Administrator',
    [USER_ROLES.SUPERVISOR]: 'Supervisor',
    [USER_ROLES.CASHIER]: 'Cashier',
    [USER_ROLES.KITCHEN]: 'Kitchen Staff',
  };
  return labels[role] || role;
}

/**
 * Get human-readable label for OrderStatus
 */
export function getOrderStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    [ORDER_STATUSES.PENDING]: 'Pending',
    [ORDER_STATUSES.PROCESSING]: 'Processing',
    [ORDER_STATUSES.COMPLETED]: 'Completed',
    [ORDER_STATUSES.CANCELLED]: 'Cancelled',
    [ORDER_STATUSES.REFUNDED]: 'Refunded',
  };
  return labels[status] || status;
}

/**
 * Get human-readable label for PaymentMethod
 */
export function getPaymentMethodLabel(method: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    [PAYMENT_METHODS.CASH]: 'Cash',
    [PAYMENT_METHODS.QRIS]: 'QRIS',
    [PAYMENT_METHODS.CARD]: 'Card',
    [PAYMENT_METHODS.E_WALLET]: 'E-Wallet',
    [PAYMENT_METHODS.BANK_TRANSFER]: 'Bank Transfer',
    [PAYMENT_METHODS.SHOPEEPAY]: 'Shopee Pay',
    [PAYMENT_METHODS.DANA]: 'DANA',
  };
  return labels[method] || method;
}

/**
 * Get human-readable label for TransactionStatus
 */
export function getTransactionStatusLabel(status: TransactionStatus): string {
  const labels: Record<TransactionStatus, string> = {
    [TRANSACTION_STATUSES.PENDING]: 'Pending',
    [TRANSACTION_STATUSES.COMPLETED]: 'Completed',
    [TRANSACTION_STATUSES.FAILED]: 'Failed',
    [TRANSACTION_STATUSES.REFUNDED]: 'Refunded',
  };
  return labels[status] || status;
}

/**
 * Get human-readable label for KitchenStatus
 */
export function getKitchenStatusLabel(status: KitchenStatus): string {
  const labels: Record<KitchenStatus, string> = {
    [KITCHEN_STATUSES.PENDING]: 'Pending',
    [KITCHEN_STATUSES.PROCESSING]: 'Processing',
    [KITCHEN_STATUSES.READY]: 'Ready',
    [KITCHEN_STATUSES.COMPLETED]: 'Completed',
  };
  return labels[status] || status;
}
