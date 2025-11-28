/**
 * Utility functions untuk styling receipt template berdasarkan tipe
 */

export interface TemplateStyles {
  containerClass: string;
  headerClass: string;
  titleClass: string;
  contentClass: string;
  itemClass: string;
  totalClass: string;
  footerClass: string;
  fontFamily: string;
  fontSize: string;
}

export function getTemplateStyles(templateType: string, styles?: any): TemplateStyles {
  const baseStyles = {
    DEFAULT: {
      containerClass: 'border-2 border-gray-400',
      headerClass: 'border-b-2 border-gray-400 bg-gray-50',
      titleClass: 'text-gray-900',
      contentClass: 'border-gray-300',
      itemClass: 'border-b border-dashed border-gray-300',
      totalClass: 'border-t-2 border-gray-900 bg-gray-100',
      footerClass: 'border-t border-gray-400 bg-gray-50',
      fontFamily: 'Arial, sans-serif',
      fontSize: styles?.fontSize || '12px',
    },
    MODERN: {
      containerClass: 'border-0 shadow-lg',
      headerClass: 'bg-gradient-to-r from-primary-50 via-primary-100 to-primary-50 border-b-2 border-primary-300',
      titleClass: 'text-primary-700',
      contentClass: 'border-primary-200',
      itemClass: 'border-b border-dotted border-primary-200 hover:bg-primary-50',
      totalClass: 'border-t-2 border-primary-600 bg-gradient-to-r from-primary-50 to-primary-100',
      footerClass: 'border-t border-primary-200 bg-primary-50',
      fontFamily: 'Inter, sans-serif',
      fontSize: styles?.fontSize || '11px',
    },
    MINIMAL: {
      containerClass: 'border-0',
      headerClass: 'border-b border-gray-300',
      titleClass: 'text-gray-900',
      contentClass: 'border-gray-200',
      itemClass: 'border-b border-gray-200',
      totalClass: 'border-t border-gray-900',
      footerClass: 'border-t border-gray-300',
      fontFamily: 'Courier New, monospace',
      fontSize: styles?.fontSize || '10px',
    },
    DETAILED: {
      containerClass: 'border-2 border-gray-500 shadow-md',
      headerClass: 'border-b-2 border-gray-500 bg-gray-100 shadow-sm',
      titleClass: 'text-gray-900',
      contentClass: 'border-gray-400',
      itemClass: 'border-b border-solid border-gray-300 bg-gray-50',
      totalClass: 'border-t-2 border-gray-900 bg-gray-200 shadow-inner',
      footerClass: 'border-t-2 border-gray-500 bg-gray-100 shadow-sm',
      fontFamily: 'Arial, sans-serif',
      fontSize: styles?.fontSize || '11px',
    },
    COMPACT: {
      containerClass: 'border border-gray-400',
      headerClass: 'border-b border-gray-400 bg-gray-50',
      titleClass: 'text-gray-900',
      contentClass: 'border-gray-300',
      itemClass: 'border-b border-dashed border-gray-300',
      totalClass: 'border-t border-gray-900 bg-gray-100',
      footerClass: 'border-t border-gray-400',
      fontFamily: 'Courier New, monospace',
      fontSize: styles?.fontSize || '11px',
    },
  };

  return baseStyles[templateType as keyof typeof baseStyles] || baseStyles.DEFAULT;
}

export function getTemplateHeaderStyle(templateType: string, styles?: any): string {
  const styleMap: Record<string, string> = {
    DEFAULT: 'text-center mb-5 pb-4 border-b border-gray-200',
    MODERN: 'text-center mb-5 pb-4 border-b border-primary-200 bg-gradient-to-br from-primary-50/50 to-transparent rounded-t-lg px-4 py-4',
    MINIMAL: 'text-center mb-3 pb-2 border-b border-gray-200',
    DETAILED: 'text-center mb-5 pb-4 border-b-2 border-gray-300 bg-gray-50/50 px-4 py-4 rounded-t-lg',
    COMPACT: 'text-center mb-3 pb-2 border-b border-gray-200',
  };
  return styleMap[templateType] || styleMap.DEFAULT;
}

export function getTemplateTitleStyle(templateType: string): string {
  const styleMap: Record<string, string> = {
    DEFAULT: 'text-2xl sm:text-3xl font-semibold mb-2 text-gray-900 tracking-tight',
    MODERN: 'text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent',
    MINIMAL: 'text-lg sm:text-xl font-semibold mb-1 text-gray-900',
    DETAILED: 'text-2xl sm:text-3xl font-bold mb-2 text-gray-900 tracking-tight',
    COMPACT: 'text-lg sm:text-xl font-semibold mb-1 text-gray-900',
  };
  return styleMap[templateType] || styleMap.DEFAULT;
}

export function getTemplateContentStyle(templateType: string): string {
  const styleMap: Record<string, string> = {
    DEFAULT: 'space-y-2',
    MODERN: 'space-y-2',
    MINIMAL: 'space-y-1',
    DETAILED: 'space-y-2 bg-white',
    COMPACT: 'space-y-1',
  };
  return styleMap[templateType] || styleMap.DEFAULT;
}

export function getTemplateItemStyle(templateType: string): string {
  const styleMap: Record<string, string> = {
    DEFAULT: 'border-b border-gray-100 pb-2.5',
    MODERN: 'border-b border-primary-100 pb-2.5',
    MINIMAL: 'border-b border-gray-100 pb-1.5',
    DETAILED: 'border-b border-gray-200 pb-2.5 bg-gray-50/30 px-2 py-1.5 rounded',
    COMPACT: 'border-b border-gray-100 pb-1.5',
  };
  return styleMap[templateType] || styleMap.DEFAULT;
}

export function getTemplateTotalStyle(templateType: string): string {
  const styleMap: Record<string, string> = {
    DEFAULT: 'flex justify-between text-lg sm:text-xl font-bold border-t-2 border-gray-300 pt-3 mt-3 text-gray-900',
    MODERN: 'flex justify-between text-lg sm:text-xl font-bold border-t-2 border-primary-300 pt-3 mt-3 bg-gradient-to-r from-primary-50/50 to-transparent px-3 py-2 rounded-lg text-primary-700',
    MINIMAL: 'flex justify-between text-base font-bold border-t-2 border-gray-300 pt-2 mt-2 text-gray-900',
    DETAILED: 'flex justify-between text-lg sm:text-xl font-bold border-t-2 border-gray-300 pt-3 mt-3 bg-gray-50 px-3 py-2 rounded-lg text-gray-900',
    COMPACT: 'flex justify-between text-base font-bold border-t-2 border-gray-300 pt-2 mt-2 text-gray-900',
  };
  return styleMap[templateType] || styleMap.DEFAULT;
}

export function getTemplateFooterStyle(templateType: string): string {
  const styleMap: Record<string, string> = {
    DEFAULT: 'text-center mt-5 pt-4 border-t border-gray-200 text-gray-600',
    MODERN: 'text-center mt-5 pt-4 border-t border-primary-200 bg-gradient-to-br from-primary-50/30 to-transparent rounded-b-lg px-4 py-3 text-primary-700',
    MINIMAL: 'text-center mt-3 pt-3 border-t border-gray-200 text-gray-600',
    DETAILED: 'text-center mt-5 pt-4 border-t-2 border-gray-300 bg-gray-50/50 px-4 py-3 rounded-b-lg text-gray-700',
    COMPACT: 'text-center mt-3 pt-3 border-t border-gray-200 text-gray-600',
  };
  return styleMap[templateType] || styleMap.DEFAULT;
}

