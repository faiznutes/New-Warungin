/**
 * Common Type Definitions
 * Shared types across the application
 */

/**
 * Paginated response type
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * API Response type
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}

/**
 * Error response type
 */
export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  code?: string;
  statusCode?: number;
  context?: Record<string, any>;
}

/**
 * Sort order type
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Common query parameters
 */
export interface CommonQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
}

/**
 * Date range filter
 */
export interface DateRangeFilter {
  startDate: Date;
  endDate: Date;
}

/**
 * Safe array wrapper to ensure array type
 */
export function ensureArray<T>(value: T | T[] | null | undefined): T[] {
  if (Array.isArray(value)) {
    return value;
  }
  if (value === null || value === undefined) {
    return [];
  }
  return [value];
}

/**
 * Safe array operation: some
 */
export function safeSome<T>(
  array: T[] | null | undefined,
  predicate: (value: T, index: number, array: T[]) => boolean
): boolean {
  if (!Array.isArray(array)) {
    return false;
  }
  return array.some(predicate);
}

/**
 * Safe array operation: map
 */
export function safeMap<T, U>(
  array: T[] | null | undefined,
  callback: (value: T, index: number, array: T[]) => U
): U[] {
  if (!Array.isArray(array)) {
    return [];
  }
  return array.map(callback);
}

/**
 * Safe array operation: filter
 */
export function safeFilter<T>(
  array: T[] | null | undefined,
  predicate: (value: T, index: number, array: T[]) => boolean
): T[] {
  if (!Array.isArray(array)) {
    return [];
  }
  return array.filter(predicate);
}

/**
 * Safe array operation: find
 */
export function safeFind<T>(
  array: T[] | null | undefined,
  predicate: (value: T, index: number, array: T[]) => boolean
): T | undefined {
  if (!Array.isArray(array)) {
    return undefined;
  }
  return array.find(predicate);
}
