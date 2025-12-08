/**
 * Safe wrapper for array methods
 * Ensures we always have a valid array before calling array methods
 * This prevents "B.value.some is not a function" errors
 * 
 * DOKUMENTASI STRUKTUR DATA:
 * - activeAddons.value: SELALU array of Addon objects
 *   Struktur: [{ addonId: string, addonType: string, status: string, ... }]
 * - availableAddons.value: SELALU array of AvailableAddon objects
 *   Struktur: [{ id: string, name: string, type: string, price: number, ... }]
 * 
 * NORMALISASI: Semua data dari API akan dinormalisasi menjadi array sebelum digunakan
 * FALLBACK: Jika data tidak valid, akan dikembalikan ke array kosong []
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
 * 
 * NORMALISASI: Mencoba extract array dari berbagai struktur object
 * - value.data (jika array)
 * - value.addons (jika array)
 * - value.items (jika array)
 * - value.results (jika array)
 * 
 * FALLBACK: Mengembalikan defaultValue (default: []) jika tidak valid
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
 * GUARD CLAUSE: Memastikan array sebelum memanggil .some()
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
 * GUARD CLAUSE: Memastikan array sebelum memanggil .filter()
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
 * GUARD CLAUSE: Memastikan array sebelum memanggil .map()
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
 * GUARD CLAUSE: Memastikan array sebelum memanggil .find()
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
 * GUARD CLAUSE: Memastikan array sebelum memanggil .reduce()
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
 * GUARD CLAUSE: Memastikan array sebelum memanggil .findIndex()
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
 * GUARD CLAUSE: Memastikan array sebelum memanggil .every()
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
