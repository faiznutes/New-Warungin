/**
 * Date formatter utilities for Indonesian format (dd/mm/yyyy)
 */

/**
 * Format date to Indonesian format (dd/mm/yyyy) for display
 */
export const formatDateInput = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';
    
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    return '';
  }
};

/**
 * Parse Indonesian format (dd/mm/yyyy) to Date object
 */
export const parseDateInput = (dateString: string): Date | null => {
  if (!dateString) return null;
  
  try {
    // Support both dd/mm/yyyy and yyyy-mm-dd formats
    let day: number, month: number, year: number;
    
    if (dateString.includes('/')) {
      // Format: dd/mm/yyyy
      const parts = dateString.split('/');
      if (parts.length !== 3) return null;
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      year = parseInt(parts[2], 10);
    } else if (dateString.includes('-')) {
      // Format: yyyy-mm-dd (ISO format from HTML5 date input)
      const parts = dateString.split('-');
      if (parts.length !== 3) return null;
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      day = parseInt(parts[2], 10);
    } else {
      return null;
    }
    
    const date = new Date(year, month, day);
    if (isNaN(date.getTime())) return null;
    
    return date;
  } catch (error) {
    return null;
  }
};

/**
 * Convert Date to HTML5 date input format (YYYY-MM-DD)
 */
export const toHtml5Date = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    return '';
  }
};

/**
 * Get first day of month
 */
export const getFirstDayOfMonth = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

/**
 * Get last day of month
 */
export const getLastDayOfMonth = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

/**
 * Get date range for current month (day 1 to last day)
 */
export const getCurrentMonthRange = (): { from: Date; to: Date } => {
  const now = new Date();
  return {
    from: getFirstDayOfMonth(now),
    to: getLastDayOfMonth(now),
  };
};
