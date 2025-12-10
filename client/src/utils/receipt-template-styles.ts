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
    CLASSIC: {
      containerClass: 'border-2 border-gray-900',
      headerClass: 'border-b-2 border-gray-900 bg-gray-50',
      titleClass: 'text-gray-900',
      contentClass: 'border-gray-400',
      itemClass: 'border-b border-dashed border-gray-400',
      totalClass: 'border-t-2 border-gray-900 bg-gray-100',
      footerClass: 'border-t border-gray-900 bg-gray-50',
      fontFamily: 'Arial, sans-serif',
      fontSize: styles?.fontSize || '12px',
    },
    MODERN: {
      containerClass: 'border-0',
      headerClass: 'border-b border-gray-200',
      titleClass: 'text-gray-900',
      contentClass: 'border-gray-100',
      itemClass: 'border-b border-dotted border-gray-200',
      totalClass: 'border-t-2 border-gray-900',
      footerClass: 'border-t border-gray-200',
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
      fontSize: styles?.fontSize || '9px',
    },
    PROFESSIONAL: {
      containerClass: 'border border-gray-400',
      headerClass: 'border-b border-gray-400 bg-gray-50',
      titleClass: 'text-gray-900',
      contentClass: 'border-gray-300',
      itemClass: 'border-b border-solid border-gray-300',
      totalClass: 'border-t-2 border-gray-900 bg-gray-100',
      footerClass: 'border-t border-gray-400 bg-gray-50',
      fontFamily: 'Arial, sans-serif',
      fontSize: styles?.fontSize || '11px',
    },
    // Legacy support
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
  };

  return baseStyles[templateType as keyof typeof baseStyles] || baseStyles.CLASSIC;
}

export function getTemplateHeaderStyle(templateType: string, styles?: any): string {
  const styleMap: Record<string, string> = {
    CLASSIC: 'text-center mb-4 border-b-2 border-gray-900 pb-4 bg-gray-50',
    MODERN: 'text-center mb-4 border-b border-gray-200 pb-4',
    MINIMAL: 'text-center mb-2 border-b border-gray-300 pb-2',
    PROFESSIONAL: 'text-center mb-4 border-b border-gray-400 pb-4 bg-gray-50',
    // Legacy support
    DEFAULT: 'text-center mb-4 border-b-2 border-gray-400 pb-4 bg-gray-50',
  };
  return styleMap[templateType] || styleMap.CLASSIC;
}

export function getTemplateTitleStyle(templateType: string): string {
  const styleMap: Record<string, string> = {
    CLASSIC: 'text-xl sm:text-2xl font-bold mb-2 text-gray-900',
    MODERN: 'text-xl sm:text-2xl font-bold mb-2 text-gray-900',
    MINIMAL: 'text-base sm:text-lg font-bold mb-1 text-gray-900',
    PROFESSIONAL: 'text-xl sm:text-2xl font-bold mb-2 text-gray-900',
    // Legacy support
    DEFAULT: 'text-xl sm:text-2xl font-bold mb-2 text-gray-900',
  };
  return styleMap[templateType] || styleMap.CLASSIC;
}

export function getTemplateContentStyle(templateType: string): string {
  const styleMap: Record<string, string> = {
    CLASSIC: 'space-y-2 border-gray-400',
    MODERN: 'space-y-2 border-gray-100',
    MINIMAL: 'space-y-1 border-gray-200',
    PROFESSIONAL: 'space-y-2 border-gray-300',
    // Legacy support
    DEFAULT: 'space-y-2 border-gray-300',
  };
  return styleMap[templateType] || styleMap.CLASSIC;
}

export function getTemplateItemStyle(templateType: string): string {
  const styleMap: Record<string, string> = {
    CLASSIC: 'border-b border-dashed border-gray-400 pb-2',
    MODERN: 'border-b border-dotted border-gray-200 pb-2',
    MINIMAL: 'border-b border-gray-200 pb-1',
    PROFESSIONAL: 'border-b border-solid border-gray-300 pb-2',
    // Legacy support
    DEFAULT: 'border-b border-dashed border-gray-300 pb-2',
  };
  return styleMap[templateType] || styleMap.CLASSIC;
}

export function getTemplateTotalStyle(templateType: string): string {
  const styleMap: Record<string, string> = {
    CLASSIC: 'flex justify-between text-base sm:text-lg font-bold border-t-2 border-gray-900 pt-2 mt-2 bg-gray-100 px-2 py-1',
    MODERN: 'flex justify-between text-base sm:text-lg font-bold border-t-2 border-gray-900 pt-2 mt-2',
    MINIMAL: 'flex justify-between text-sm font-bold border-t border-gray-900 pt-1 mt-1',
    PROFESSIONAL: 'flex justify-between text-base sm:text-lg font-bold border-t-2 border-gray-900 pt-2 mt-2 bg-gray-100 px-2 py-1',
    // Legacy support
    DEFAULT: 'flex justify-between text-base sm:text-lg font-bold border-t-2 border-gray-900 pt-2 mt-2 bg-gray-100 px-2 py-1',
  };
  return styleMap[templateType] || styleMap.CLASSIC;
}

export function getTemplateFooterStyle(templateType: string): string {
  const styleMap: Record<string, string> = {
    CLASSIC: 'text-center mt-4 pt-4 border-t border-gray-900 bg-gray-50',
    MODERN: 'text-center mt-4 pt-4 border-t border-gray-200',
    MINIMAL: 'text-center mt-2 pt-2 border-t border-gray-300',
    PROFESSIONAL: 'text-center mt-4 pt-4 border-t border-gray-400 bg-gray-50',
    // Legacy support
    DEFAULT: 'text-center mt-4 pt-4 border-t border-gray-400 bg-gray-50',
  };
  return styleMap[templateType] || styleMap.CLASSIC;
}

