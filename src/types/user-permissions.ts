/**
 * User Permissions Type Definitions
 * Ensures type safety for permissions across the application
 */

export interface SupervisorPermissions {
  allowedStoreIds: string[];
  role: 'SUPERVISOR';
}

export interface CashierPermissions {
  assignedStoreId: string;
  role: 'CASHIER';
}

export interface KitchenPermissions {
  assignedStoreId: string;
  role: 'KITCHEN';
}

export type UserPermissions = SupervisorPermissions | CashierPermissions | KitchenPermissions | null;

/**
 * Type guard to check if permissions are for Supervisor
 */
export function isSupervisorPermissions(permissions: UserPermissions): permissions is SupervisorPermissions {
  return permissions !== null && 'allowedStoreIds' in permissions && Array.isArray(permissions.allowedStoreIds);
}

/**
 * Type guard to check if permissions are for Cashier
 */
export function isCashierPermissions(permissions: UserPermissions): permissions is CashierPermissions {
  return permissions !== null && 'assignedStoreId' in permissions && permissions.role === 'CASHIER';
}

/**
 * Type guard to check if permissions are for Kitchen
 */
export function isKitchenPermissions(permissions: UserPermissions): permissions is KitchenPermissions {
  return permissions !== null && 'assignedStoreId' in permissions && permissions.role === 'KITCHEN';
}

/**
 * Safe getter for allowedStoreIds with type safety
 */
export function getAllowedStoreIds(permissions: UserPermissions): string[] {
  if (isSupervisorPermissions(permissions)) {
    return permissions.allowedStoreIds;
  }
  return [];
}

/**
 * Safe getter for assignedStoreId with type safety
 */
export function getAssignedStoreId(permissions: UserPermissions): string | null {
  if (isCashierPermissions(permissions) || isKitchenPermissions(permissions)) {
    return permissions.assignedStoreId;
  }
  return null;
}
