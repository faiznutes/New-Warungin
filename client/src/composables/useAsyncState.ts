/**
 * Composable for managing async state (loading, saving, error)
 * Reduces code duplication across components
 */

import { ref, type Ref } from 'vue';

export interface UseAsyncStateReturn<T = any> {
  loading: Ref<boolean>;
  saving: Ref<boolean>;
  error: Ref<string | null>;
  data: Ref<T | null>;
  execute: (asyncFn: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
}

export function useAsyncState<T = any>(initialData: T | null = null): UseAsyncStateReturn<T> {
  const loading = ref(false);
  const saving = ref(false);
  const error = ref<string | null>(null);
  const data = ref<T | null>(initialData) as Ref<T | null>;

  const execute = async (asyncFn: () => Promise<T>): Promise<T | null> => {
    try {
      loading.value = true;
      error.value = null;
      const result = await asyncFn();
      data.value = result;
      return result;
    } catch (err: any) {
      error.value = err?.message || 'An error occurred';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const reset = () => {
    loading.value = false;
    saving.value = false;
    error.value = null;
    data.value = initialData;
  };

  return {
    loading,
    saving,
    error,
    data,
    execute,
    reset,
  };
}

