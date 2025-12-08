/**
 * Safe wrapper for array methods
 * Ensures we always have a valid array before calling array methods
 * This prevents "B.value.some is not a function" errors
 */
export const safeArrayMethod = <T>(
  arr: any,
  method: (arr: any[]) => T,
  fallback: T
): T => {
  try {
    if (!arr) return fallback;
    if (!Array.isArray(arr)) return fallback;
    return method(arr);
  } catch (error) {
    console.error('Error in safeArrayMethod:', error);
    return fallback;
  }
};

/**
 * Ensure value is always an array
 * Auto-fixes if value is not an array
 */
export const ensureArray = <T>(value: any, defaultValue: T[] = []): T[] => {
  try {
    if (value === null || value === undefined) return defaultValue;
    if (Array.isArray(value)) return value;
    
    // Try to extract array from object
    if (value && typeof value === 'object') {
      if (Array.isArray(value.data)) return value.data;
      if (Array.isArray(value.addons)) return value.addons;
      if (Array.isArray(value.items)) return value.items;
      if (Array.isArray(value.results)) return value.results;
    }
    
    return defaultValue;
  } catch (error) {
    console.error('Error in ensureArray:', error);
    return defaultValue;
  }
};

/**
 * Safe .some() method
 */
export const safeSome = <T>(
  arr: any,
  predicate: (item: T, index: number, array: T[]) => boolean
): boolean => {
  return safeArrayMethod(
    arr,
    (array) => array.some(predicate),
    false
  );
};

/**
 * Safe .filter() method
 */
export const safeFilter = <T>(
  arr: any,
  predicate: (item: T, index: number, array: T[]) => boolean
): T[] => {
  return safeArrayMethod(
    arr,
    (array) => array.filter(predicate),
    []
  );
};

/**
 * Safe .map() method
 */
export const safeMap = <T, R>(
  arr: any,
  mapper: (item: T, index: number, array: T[]) => R
): R[] => {
  return safeArrayMethod(
    arr,
    (array) => array.map(mapper),
    []
  );
};

/**
 * Safe .find() method
 */
export const safeFind = <T>(
  arr: any,
  predicate: (item: T, index: number, array: T[]) => boolean
): T | undefined => {
  return safeArrayMethod(
    arr,
    (array) => array.find(predicate),
    undefined
  );
};

/**
 * Safe .reduce() method
 */
export const safeReduce = <T, R>(
  arr: any,
  reducer: (accumulator: R, currentValue: T, currentIndex: number, array: T[]) => R,
  initialValue: R
): R => {
  return safeArrayMethod(
    arr,
    (array) => array.reduce(reducer, initialValue),
    initialValue
  );
};

/**
 * Safe .findIndex() method
 */
export const safeFindIndex = <T>(
  arr: any,
  predicate: (item: T, index: number, array: T[]) => boolean
): number => {
  return safeArrayMethod(
    arr,
    (array) => array.findIndex(predicate),
    -1
  );
};

/**
 * Safe .every() method
 */
export const safeEvery = <T>(
  arr: any,
  predicate: (item: T, index: number, array: T[]) => boolean
): boolean => {
  return safeArrayMethod(
    arr,
    (array) => array.every(predicate),
    false
  );
};
