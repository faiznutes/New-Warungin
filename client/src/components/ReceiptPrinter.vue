<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4"
      @click.self="$emit('close')"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-4 sm:p-6">
          <div class="flex items-center justify-between mb-4 sm:mb-6">
            <h3 class="text-xl sm:text-2xl font-bold text-gray-900">Print Receipt</h3>
            <button
              @click="$emit('close')"
              class="text-gray-400 hover:text-gray-600 transition p-2"
            >
              <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Paper Size Selection -->
          <div class="mb-4 sm:mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Ukuran Kertas</label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                @click="selectedPaperSize = '50mm'"
                class="px-4 py-3 rounded-lg border-2 transition flex flex-col items-center space-y-2"
                :class="selectedPaperSize === '50mm' 
                  ? 'border-primary-600 bg-primary-50 text-primary-700 font-semibold' 
                  : 'border-gray-300 hover:border-primary-300'"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span class="text-sm font-medium">50mm</span>
                <span class="text-xs text-gray-500">Thermal Kecil</span>
              </button>
              <button
                type="button"
                @click="selectedPaperSize = '85mm'"
                class="px-4 py-3 rounded-lg border-2 transition flex flex-col items-center space-y-2"
                :class="selectedPaperSize === '85mm' 
                  ? 'border-primary-600 bg-primary-50 text-primary-700 font-semibold' 
                  : 'border-gray-300 hover:border-primary-300'"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span class="text-sm font-medium">85mm</span>
                <span class="text-xs text-gray-500">Thermal Standar</span>
              </button>
            </div>
          </div>

          <!-- Template Selection -->
          <div class="mb-4 sm:mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Pilih Template</label>
            <select
              v-model="selectedTemplate"
              @change="loadTemplate(selectedTemplate)"
              class="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option v-for="template in templates" :key="template.id" :value="template.id">
                {{ template.name }}
              </option>
            </select>
          </div>

          <!-- Receipt Preview -->
          <div
            ref="receiptContent"
            class="bg-white p-4 sm:p-6 receipt-print-container"
            :class="selectedPaperSize === '50mm' ? 'receipt-50mm' : 'receipt-85mm'"
          >
            <!-- Receipt Content -->
            <div v-if="receiptData && template" 
                 class="receipt-content"
                 :style="{ fontFamily: getTemplateFontFamily(template.templateType, template.styles), fontSize: getTemplateFontSize(template.templateType, template.styles) }">
              <!-- Header -->
              <div v-if="template?.header?.showName || template?.header?.showAddress" 
                   :class="getTemplateHeaderStyle(template.templateType, template.styles)">
                <h1 v-if="template?.header?.showName" 
                    :class="getTemplateTitleStyle(template.templateType)">
                  {{ props.tenantName || tenantInfo?.name || 'Warungin' }}
                </h1>
                <p v-if="template?.header?.showAddress" 
                   class="text-xs sm:text-sm text-gray-600">
                  {{ props.tenantAddress || tenantInfo?.address || 'Jl. Contoh No. 123' }}
                </p>
                <p v-if="template?.header?.showPhone" 
                   class="text-xs sm:text-sm text-gray-600 mt-1">
                  {{ props.tenantPhone || tenantInfo?.phone || 'Telp: 085155043133' }}
                </p>
              </div>

              <!-- Order Info -->
              <div v-if="template?.fields?.showOrderNumber || template?.fields?.showDate || template?.fields?.showTime || (template?.fields?.showCustomer && receiptData.customerName)" 
                   :class="getTemplateOrderInfoStyle(template.templateType) + ' space-y-1 sm:space-y-2'">
                <div v-if="template?.fields?.showOrderNumber" class="flex justify-between text-xs sm:text-sm">
                  <span class="text-gray-600">No. Pesanan:</span>
                  <span class="font-semibold">{{ receiptData.orderNumber }}</span>
                </div>
                <div v-if="template?.fields?.showDate" class="flex justify-between text-xs sm:text-sm">
                  <span class="text-gray-600">Tanggal:</span>
                  <span>{{ formatDateTime(receiptData.date) }}</span>
                </div>
                <div v-if="template?.fields?.showTime" class="flex justify-between text-xs sm:text-sm">
                  <span class="text-gray-600">Waktu:</span>
                  <span>{{ formatTime(receiptData.date) }}</span>
                </div>
                <div v-if="template?.fields?.showCustomer && receiptData.customerName" class="flex justify-between text-xs sm:text-sm">
                  <span class="text-gray-600">Pelanggan:</span>
                  <span>{{ receiptData.customerName }}</span>
                </div>
              </div>

              <!-- Items -->
              <div v-if="template?.fields?.showItems" 
                   class="mb-3 sm:mb-4 py-3 sm:py-4"
                   :class="getTemplateContentStyle(template.templateType)">
                <div class="space-y-2">
                  <div v-for="item in receiptData.items" 
                       :key="item.name" 
                       :class="getTemplateItemStyle(template.templateType) + ' last:border-0'">
                    <div class="flex justify-between items-start mb-1">
                      <div class="flex-1">
                        <div class="font-semibold text-sm">{{ item.name }}</div>
                        <div v-if="item.discount && item.discount > 0" class="text-xs text-red-600 mt-0.5">
                          Diskon: -{{ formatCurrency(item.discount) }}
                        </div>
                      </div>
                      <div class="text-right ml-2">
                        <div class="text-sm font-semibold">{{ formatCurrency(item.subtotal) }}</div>
                        <div class="text-xs text-gray-500">{{ item.quantity }} x {{ formatCurrency(item.price) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Totals -->
              <div class="mb-3 sm:mb-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <div v-if="template?.fields?.showSubtotal || (template?.fields?.showDiscount && receiptData.discount > 0) || template?.fields?.showTax" class="space-y-1">
                  <div v-if="template?.fields?.showSubtotal" class="flex justify-between mb-1">
                    <span class="font-medium">Subtotal:</span>
                    <span class="font-semibold">{{ formatCurrency(receiptData.subtotal) }}</span>
                  </div>
                  <div v-if="template?.fields?.showDiscount && receiptData.discount > 0" class="flex justify-between mb-1 text-red-600">
                    <span class="font-medium">Diskon Total:</span>
                    <span class="font-semibold">-{{ formatCurrency(receiptData.discount) }}</span>
                  </div>
                  <div v-if="template?.fields?.showTax" class="flex justify-between mb-1">
                    <span>Pajak:</span>
                    <span>{{ formatCurrency(0) }}</span>
                  </div>
                </div>
                <div v-if="template?.fields?.showTotal" 
                     :class="getTemplateTotalStyle(template.templateType)">
                  <span>TOTAL:</span>
                  <span>{{ formatCurrency(receiptData.total) }}</span>
                </div>
                <div v-if="template?.fields?.showPaymentMethod || (template?.fields?.showChange && receiptData.change && receiptData.change > 0) || receiptData.servedBy" 
                     :class="getTemplatePaymentStyle(template.templateType) + ' space-y-1'">
                  <div v-if="template?.fields?.showPaymentMethod" class="flex justify-between text-xs sm:text-sm">
                    <span class="font-medium">Pembayaran:</span>
                    <span class="font-semibold">{{ getPaymentMethodLabel(receiptData.paymentMethod) }}</span>
                  </div>
                  <div v-if="template?.fields?.showChange && receiptData.change && receiptData.change > 0" class="flex justify-between text-xs sm:text-sm">
                    <span class="font-medium">Kembalian:</span>
                    <span class="font-semibold text-green-600">{{ formatCurrency(receiptData.change) }}</span>
                  </div>
                  <div v-if="receiptData.servedBy" class="flex justify-between text-xs sm:text-sm mt-2 pt-2">
                    <span class="font-medium">Dilayani oleh:</span>
                    <span class="font-semibold">{{ receiptData.servedBy }}</span>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div v-if="template?.footer?.showThankYou || template?.footer?.showContact" 
                   :class="getTemplateFooterStyle(template.templateType)">
                <p v-if="template?.footer?.showThankYou" class="mb-1 sm:mb-2 font-semibold text-sm sm:text-base">Terima Kasih!</p>
                <p v-if="template?.footer?.showContact" class="text-xs sm:text-sm text-gray-600">
                  {{ props.tenantPhone || tenantInfo?.phone || 'Telp: 085155043133' }}
                </p>
              </div>
            </div>

            <div v-else class="text-center py-8 sm:py-12 text-gray-500">
              <p>Memuat data receipt...</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-6">
            <button
              @click="$emit('close')"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm sm:text-base"
            >
              Tutup
            </button>
            <button
              @click="handlePrint"
              :disabled="!receiptData || !template"
              class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue';
import { Teleport } from 'vue';
import api from '../api';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { useNotification } from '../composables/useNotification';
import { 
  getTemplateHeaderStyle, 
  getTemplateTitleStyle, 
  getTemplateContentStyle, 
  getTemplateItemStyle, 
  getTemplateTotalStyle, 
  getTemplateFooterStyle,
  getTemplateOrderInfoStyle,
  getTemplatePaymentStyle
} from '../utils/receipt-template-styles';

const { warning } = useNotification();

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  discount?: number;
}

interface ReceiptData {
  orderNumber: string;
  date: string;
  customerName?: string;
  memberName?: string;
  items: ReceiptItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  change?: number;
  servedBy?: string; // Nama kasir/admin yang melayani
}

interface ReceiptTemplate {
  id: string;
  name: string;
  templateType: string;
  paperSize: string;
  isDefault?: boolean;
  header?: any;
  footer?: any;
  fields?: any;
  styles?: any;
}

interface Props {
  show: boolean;
  orderId?: string;
  receiptData?: ReceiptData | null;
  tenantName?: string;
  tenantAddress?: string;
  tenantPhone?: string;
}

const props = withDefaults(defineProps<Props>(), {
  orderId: undefined,
  receiptData: null,
  tenantName: '',
  tenantAddress: '',
  tenantPhone: '',
});

const emit = defineEmits<{
  close: [];
}>();

const templates = ref<ReceiptTemplate[]>([]);
const selectedTemplate = ref<string>('');
const selectedPaperSize = ref<'50mm' | '85mm'>('85mm');
const template = ref<ReceiptTemplate | null>(null);
const receiptContent = ref<HTMLElement | null>(null);
const loading = ref(false);

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const getPaymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    CASH: 'Cash',
    CARD: 'Kartu',
    E_WALLET: 'E-Wallet',
    QRIS: 'QRIS',
    BANK_TRANSFER: 'Bank',
    SHOPEEPAY: 'ShopeePay',
    DANA: 'Dana',
    MIDTRANS: 'Midtrans',
  };
  return labels[method] || method;
};

const getTemplateFontFamily = (templateType: string, styles?: any): string => {
  const fontMap: Record<string, string> = {
    DEFAULT: styles?.fontFamily || 'Arial, sans-serif',
    MODERN: styles?.fontFamily || 'Inter, sans-serif',
    MINIMAL: styles?.fontFamily || 'Courier New, monospace',
    DETAILED: styles?.fontFamily || 'Arial, sans-serif',
    COMPACT: styles?.fontFamily || 'Courier New, monospace',
  };
  return fontMap[templateType] || 'Arial, sans-serif';
};

const getTemplateFontSize = (templateType: string, styles?: any): string => {
  return styles?.fontSize || '12px';
};

const loadTemplates = async () => {
  try {
    const response = await api.get('/receipts/templates');
    templates.value = response.data;
    if (templates.value.length > 0) {
      const defaultTemplate = templates.value.find(t => t.isDefault) || templates.value[0];
      selectedTemplate.value = defaultTemplate.id;
      await loadTemplate(defaultTemplate.id);
    }
  } catch (error: any) {
    console.error('Error loading templates:', error);
  }
};

const loadTemplate = async (templateId: string) => {
  try {
    const response = await api.get(`/receipts/templates/${templateId}`);
    template.value = response.data;
    
    // Set default fields if not present
    if (template.value) {
      if (!template.value.fields) {
        template.value.fields = {
          showOrderNumber: true,
          showDate: true,
          showItems: true,
          showSubtotal: true,
          showDiscount: true,
          showTotal: true,
          showPaymentMethod: true,
        };
      }
      if (!template.value.header) {
        template.value.header = {
          showName: true,
          showAddress: true,
        };
      }
      if (!template.value.footer) {
        template.value.footer = {
          showThankYou: true,
          showContact: true,
        };
      }
    }
  } catch (error: any) {
    console.error('Error loading template:', error);
    // Use default template config
    template.value = {
      id: 'default',
      name: 'Default Receipt',
      templateType: 'DEFAULT',
      paperSize: 'A4',
      header: {
        showName: true,
        showAddress: true,
      },
      footer: {
        showThankYou: true,
        showContact: true,
      },
      fields: {
        showOrderNumber: true,
        showDate: true,
        showItems: true,
        showSubtotal: true,
        showDiscount: true,
        showTotal: true,
        showPaymentMethod: true,
      },
    };
  }
};

const receiptData = ref<ReceiptData | null>(props.receiptData || null);
const tenantInfo = ref<any>(null);

const loadReceiptData = async () => {
  if (!props.orderId) {
    receiptData.value = props.receiptData;
    return;
  }
  
  loading.value = true;
  try {
    const response = await api.get(`/receipts/generate/${props.orderId}?templateId=${selectedTemplate.value}`);
    if (response.data) {
      receiptData.value = response.data.receiptData;
      template.value = response.data.template;
      if (response.data.order?.tenant) {
        tenantInfo.value = response.data.order.tenant;
      }
    }
  } catch (error: any) {
    console.error('Error loading receipt data:', error);
    receiptData.value = props.receiptData;
  } finally {
    loading.value = false;
  }
};

const handlePrint = () => {
  if (!receiptContent.value) return;
  printBrowser();
};

const printBrowser = async () => {
  if (!receiptContent.value) return;

  const paperSize = selectedPaperSize.value === '50mm' ? 'THERMAL_50' : 'THERMAL_85';
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    await warning('Popup blocker terdeteksi. Silakan izinkan popup untuk mencetak struk.');
    return;
  }
  
  // Wait untuk memastikan DOM ready
  await new Promise(resolve => setTimeout(resolve, 100));

  // Clone element dan convert computed styles to inline styles dengan lebih detail
  const cloneElement = receiptContent.value.cloneNode(true) as HTMLElement;
  const receiptElement = cloneElement.querySelector('.receipt-content') as HTMLElement;
  
  // Function to convert computed styles to inline styles dengan lebih lengkap
  const applyComputedStyles = (element: HTMLElement) => {
    const computed = window.getComputedStyle(element);
    const htmlEl = element;
    
    // Font styles
    if (computed.fontFamily) htmlEl.style.fontFamily = computed.fontFamily;
    if (computed.fontSize) htmlEl.style.fontSize = computed.fontSize;
    if (computed.fontWeight) htmlEl.style.fontWeight = computed.fontWeight;
    if (computed.fontStyle) htmlEl.style.fontStyle = computed.fontStyle;
    if (computed.lineHeight) htmlEl.style.lineHeight = computed.lineHeight;
    
    // Text styles
    if (computed.color) htmlEl.style.color = computed.color;
    if (computed.textAlign) htmlEl.style.textAlign = computed.textAlign;
    if (computed.textTransform) htmlEl.style.textTransform = computed.textTransform;
    if (computed.letterSpacing) htmlEl.style.letterSpacing = computed.letterSpacing;
    
    // Spacing
    if (computed.padding && computed.padding !== '0px') htmlEl.style.padding = computed.padding;
    if (computed.paddingTop && computed.paddingTop !== '0px') htmlEl.style.paddingTop = computed.paddingTop;
    if (computed.paddingBottom && computed.paddingBottom !== '0px') htmlEl.style.paddingBottom = computed.paddingBottom;
    if (computed.paddingLeft && computed.paddingLeft !== '0px') htmlEl.style.paddingLeft = computed.paddingLeft;
    if (computed.paddingRight && computed.paddingRight !== '0px') htmlEl.style.paddingRight = computed.paddingRight;
    
    if (computed.margin && computed.margin !== '0px') htmlEl.style.margin = computed.margin;
    if (computed.marginTop && computed.marginTop !== '0px') htmlEl.style.marginTop = computed.marginTop;
    if (computed.marginBottom && computed.marginBottom !== '0px') htmlEl.style.marginBottom = computed.marginBottom;
    if (computed.marginLeft && computed.marginLeft !== '0px') htmlEl.style.marginLeft = computed.marginLeft;
    if (computed.marginRight && computed.marginRight !== '0px') htmlEl.style.marginRight = computed.marginRight;
    
    // Border - sangat penting untuk garis pemisah
    if (computed.borderTopWidth && computed.borderTopWidth !== '0px') {
      htmlEl.style.borderTop = `${computed.borderTopWidth} ${computed.borderTopStyle || 'solid'} ${computed.borderTopColor || '#000'}`;
    }
    if (computed.borderBottomWidth && computed.borderBottomWidth !== '0px') {
      htmlEl.style.borderBottom = `${computed.borderBottomWidth} ${computed.borderBottomStyle || 'solid'} ${computed.borderBottomColor || '#000'}`;
    }
    if (computed.borderLeftWidth && computed.borderLeftWidth !== '0px') {
      htmlEl.style.borderLeft = `${computed.borderLeftWidth} ${computed.borderLeftStyle || 'solid'} ${computed.borderLeftColor || '#000'}`;
    }
    if (computed.borderRightWidth && computed.borderRightWidth !== '0px') {
      htmlEl.style.borderRight = `${computed.borderRightWidth} ${computed.borderRightStyle || 'solid'} ${computed.borderRightColor || '#000'}`;
    }
    if (computed.border && computed.border !== '0px none rgb(0, 0, 0)') {
      htmlEl.style.border = computed.border;
    }
    
    // Background
    if (computed.backgroundColor && computed.backgroundColor !== 'rgba(0, 0, 0, 0)' && computed.backgroundColor !== 'transparent') {
      htmlEl.style.backgroundColor = computed.backgroundColor;
    }
    if (computed.background && computed.background !== 'none') {
      htmlEl.style.background = computed.background;
    }
    
    // Layout
    if (computed.display) htmlEl.style.display = computed.display;
    if (computed.flexDirection) htmlEl.style.flexDirection = computed.flexDirection;
    if (computed.justifyContent) htmlEl.style.justifyContent = computed.justifyContent;
    if (computed.alignItems) htmlEl.style.alignItems = computed.alignItems;
    if (computed.gap) htmlEl.style.gap = computed.gap;
    
    // Width/Height
    if (computed.width && computed.width !== 'auto') htmlEl.style.width = computed.width;
    if (computed.maxWidth && computed.maxWidth !== 'none') htmlEl.style.maxWidth = computed.maxWidth;
    if (computed.minWidth && computed.minWidth !== '0px') htmlEl.style.minWidth = computed.minWidth;
    
    // Additional important styles
    if (computed.borderRadius) htmlEl.style.borderRadius = computed.borderRadius;
    if (computed.boxShadow) htmlEl.style.boxShadow = computed.boxShadow;
  };
  
  if (receiptElement) {
    // Apply styles to receipt content
    applyComputedStyles(receiptElement);
    
    // Apply styles to all child elements - langsung tanpa setTimeout
    const allElements = receiptElement.querySelectorAll('*');
    allElements.forEach((el) => {
      applyComputedStyles(el as HTMLElement);
    });
  }

  const printContent = cloneElement.innerHTML;
  
  // Responsive print styles based on paper size
  const getPageSize = () => {
    switch (paperSize) {
      case 'THERMAL_50':
        return '50mm';
      case 'THERMAL_85':
        return '85mm';
      default:
        return '85mm';
    }
  };

  const getMaxWidth = () => {
    switch (paperSize) {
      case 'THERMAL_50':
        return '50mm';
      case 'THERMAL_85':
        return '85mm';
      default:
        return '85mm';
    }
  };

  const getFontSize = () => {
    // Use template font size if available, otherwise use paper size default
    if (template.value?.styles?.fontSize) {
      return template.value.styles.fontSize;
    }
    switch (paperSize) {
      case 'THERMAL_50':
        return '9px';
      case 'THERMAL_85':
        return '11px';
      default:
        return '11px';
    }
  };

  const getFontFamily = () => {
    // Use template font family if available
    if (template.value?.styles?.fontFamily) {
      return template.value.styles.fontFamily;
    }
    // Fallback to template type default
    const fontMap: Record<string, string> = {
      DEFAULT: 'Arial, sans-serif',
      MODERN: 'Inter, sans-serif',
      MINIMAL: 'Courier New, monospace',
      DETAILED: 'Arial, sans-serif',
      COMPACT: 'Courier New, monospace',
    };
    return fontMap[template.value?.templateType || 'DEFAULT'] || 'Courier New, monospace';
  };

  // Get template-specific print styles dengan Tailwind classes support
  const getTemplatePrintStyles = () => {
    const templateType = template.value?.templateType || 'DEFAULT';
    
    // Base Tailwind utility classes untuk print - SANGAT PENTING untuk text-align, border, font-size
    const tailwindPrintStyles = `
      /* Text alignment - PENTING untuk center header */
      .text-center { text-align: center !important; }
      .text-left { text-align: left !important; }
      .text-right { text-align: right !important; }
      
      /* Font sizes - PENTING untuk variasi font size */
      .text-xs { font-size: 0.75rem !important; line-height: 1rem !important; }
      .text-sm { font-size: 0.875rem !important; line-height: 1.25rem !important; }
      .text-base { font-size: 1rem !important; line-height: 1.5rem !important; }
      .text-lg { font-size: 1.125rem !important; line-height: 1.75rem !important; }
      .text-xl { font-size: 1.25rem !important; line-height: 1.75rem !important; }
      .text-2xl { font-size: 1.5rem !important; line-height: 2rem !important; }
      .text-3xl { font-size: 1.875rem !important; line-height: 2.25rem !important; }
      
      /* Font weights */
      .font-normal { font-weight: 400 !important; }
      .font-medium { font-weight: 500 !important; }
      .font-semibold { font-weight: 600 !important; }
      .font-bold { font-weight: 700 !important; }
      
      /* Borders - PENTING untuk garis pemisah */
      .border { border-width: 1px !important; border-style: solid !important; border-color: #000 !important; }
      .border-t { border-top-width: 1px !important; border-top-style: solid !important; border-top-color: #000 !important; }
      .border-b { border-bottom-width: 1px !important; border-bottom-style: solid !important; border-bottom-color: #000 !important; }
      .border-t-2 { border-top-width: 2px !important; border-top-style: solid !important; border-top-color: #000 !important; }
      .border-b-2 { border-bottom-width: 2px !important; border-bottom-style: solid !important; border-bottom-color: #000 !important; }
      .border-dashed { border-style: dashed !important; }
      .border-dotted { border-style: dotted !important; }
      .border-gray-200 { border-color: #e5e7eb !important; }
      .border-gray-300 { border-color: #d1d5db !important; }
      .border-gray-400 { border-color: #9ca3af !important; }
      .border-primary-200 { border-color: #bfdbfe !important; }
      .border-primary-300 { border-color: #93c5fd !important; }
      
      /* Spacing */
      .mb-1 { margin-bottom: 0.25rem !important; }
      .mb-2 { margin-bottom: 0.5rem !important; }
      .mb-3 { margin-bottom: 0.75rem !important; }
      .mb-4 { margin-bottom: 1rem !important; }
      .mb-5 { margin-bottom: 1.25rem !important; }
      .mt-1 { margin-top: 0.25rem !important; }
      .mt-2 { margin-top: 0.5rem !important; }
      .mt-3 { margin-top: 0.75rem !important; }
      .pb-1 { padding-bottom: 0.25rem !important; }
      .pb-2 { padding-bottom: 0.5rem !important; }
      .pb-2\\.5 { padding-bottom: 0.625rem !important; }
      .pb-3 { padding-bottom: 0.75rem !important; }
      .pb-4 { padding-bottom: 1rem !important; }
      .pt-2 { padding-top: 0.5rem !important; }
      .pt-3 { padding-top: 0.75rem !important; }
      .pt-4 { padding-top: 1rem !important; }
      .px-2 { padding-left: 0.5rem !important; padding-right: 0.5rem !important; }
      .px-3 { padding-left: 0.75rem !important; padding-right: 0.75rem !important; }
      .px-4 { padding-left: 1rem !important; padding-right: 1rem !important; }
      .py-2 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
      .py-3 { padding-top: 0.75rem !important; padding-bottom: 0.75rem !important; }
      .py-4 { padding-top: 1rem !important; padding-bottom: 1rem !important; }
      .py-1\\.5 { padding-top: 0.375rem !important; padding-bottom: 0.375rem !important; }
      
      /* Flexbox */
      .flex { display: flex !important; }
      .justify-between { justify-content: space-between !important; }
      .items-center { align-items: center !important; }
      .items-start { align-items: flex-start !important; }
      .flex-1 { flex: 1 1 0% !important; }
      
      /* Colors */
      .text-gray-500 { color: #6b7280 !important; }
      .text-gray-600 { color: #4b5563 !important; }
      .text-gray-700 { color: #374151 !important; }
      .text-gray-900 { color: #111827 !important; }
      .text-primary-600 { color: #2563eb !important; }
      .text-primary-700 { color: #1d4ed8 !important; }
      .text-green-600 { color: #059669 !important; }
      .text-red-600 { color: #dc2626 !important; }
      
      /* Backgrounds */
      .bg-gray-50 { background-color: #f9fafb !important; }
      .bg-gray-100 { background-color: #f3f4f6 !important; }
      .bg-primary-50 { background-color: #eff6ff !important; }
      
      /* Space between */
      .space-y-1 > * + * { margin-top: 0.25rem !important; }
      .space-y-2 > * + * { margin-top: 0.5rem !important; }
    `;
    
    return `
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        body {
          margin: 0;
          padding: 0;
          font-family: ${getFontFamily()};
          font-size: ${getFontSize()};
          line-height: 1.4;
          color: #000;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .receipt-print-container {
          max-width: ${getMaxWidth()};
          width: ${getMaxWidth()};
          margin: 0 auto;
          padding: 8px;
        }
        .receipt-content {
          width: 100%;
          font-family: ${getFontFamily()};
          font-size: ${getFontSize()};
        }
        .receipt-content * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        ${tailwindPrintStyles}
        @media print {
          @page {
            size: ${getPageSize()};
            margin: 0;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: ${getFontFamily()};
            font-size: ${getFontSize()};
            line-height: 1.4;
            color: #000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .receipt-print-container {
            max-width: ${getMaxWidth()};
            width: ${getMaxWidth()};
            margin: 0 auto;
            padding: 8px;
          }
          .receipt-content {
            width: 100%;
            color: #000 !important;
          }
          .receipt-content * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Preserve all inline styles - highest priority */
          [style] {
            /* Inline styles override everything */
          }
          /* Ensure borders are always visible - PENTING untuk garis pemisah */
          .border, .border-t, .border-b, .border-t-2, .border-b-2 {
            border-color: #000 !important;
            border-style: solid !important;
          }
          .border-dashed {
            border-style: dashed !important;
          }
          .border-dotted {
            border-style: dotted !important;
          }
          /* Ensure text-align works - PENTING untuk center header */
          .text-center {
            text-align: center !important;
          }
          .text-left {
            text-align: left !important;
          }
          .text-right {
            text-align: right !important;
          }
        }
        @media screen {
          .receipt-print-container {
            max-width: ${getMaxWidth()};
            margin: 0 auto;
          }
        }
      </style>
    `;
  };

  const printStyles = getTemplatePrintStyles();

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt - ${receiptData.value?.orderNumber || ''}</title>
        <meta charset="UTF-8">
        ${printStyles}
      </head>
      <body>
        <div class="receipt-print-container">
          ${printContent}
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};


watch(() => props.show, (newShow) => {
  if (newShow) {
    loadTemplates();
    if (props.orderId) {
      loadReceiptData();
    } else {
      receiptData.value = props.receiptData;
    }
  }
});

// Watch for receiptData prop changes (defer immediate to avoid initialization issues)
// Don't watch immediately - handle in onMounted instead

watch(() => selectedTemplate.value, (newTemplateId) => {
  if (newTemplateId) {
    loadTemplate(newTemplateId);
  }
});

onMounted(() => {
  if (props.show) {
    loadTemplates();
  }
});
</script>

<style scoped>
.receipt-content {
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.receipt-print-container {
  width: 100%;
  max-width: 100%;
}

/* Responsive styles for different paper sizes */
.receipt-50mm {
  max-width: 50mm;
  width: 50mm;
  font-size: 9px;
}

.receipt-85mm {
  max-width: 85mm;
  width: 85mm;
  font-size: 11px;
}

.receipt-content {
  font-family: 'Courier New', monospace;
}

.receipt-50mm .receipt-content {
  font-size: 9px;
}

.receipt-85mm .receipt-content {
  font-size: 11px;
}

/* Ensure template styles are visible in preview */
.receipt-content h1 {
  margin-bottom: 0.5em;
}

.receipt-content .border-t-2 {
  border-top-width: 2px;
}

.receipt-content .border-b {
  border-bottom-width: 1px;
}

@media print {
  .receipt-content {
    font-size: inherit;
  }
  
  /* Ensure print preserves template styling */
  * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
