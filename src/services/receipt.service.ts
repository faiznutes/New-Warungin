import { PrismaClient } from '@prisma/client';
import prisma from '../config/database';

// 4 Template Receipt Optimal - Redesigned
export const RECEIPT_TEMPLATE_DEFINITIONS = [
  {
    type: 'CLASSIC',
    name: 'Struk Klasik',
    paperSize: 'A4',
    description: 'Design klasik dengan border dan layout tradisional, responsif untuk semua ukuran kertas',
    header: {
      showLogo: true,
      showName: true,
      showAddress: true,
      showPhone: true,
    },
    footer: {
      showThankYou: true,
      showContact: true,
      showSocialMedia: false,
    },
    fields: {
      showOrderNumber: true,
      showDate: true,
      showTime: true,
      showShift: true, // WAJIB - Menampilkan shift (Pagi/Siang/Sore/Malam)
      showCashier: true, // WAJIB - Menampilkan nama kasir
      showCustomer: true,
      showItems: true,
      showSubtotal: true,
      showDiscount: true,
      showTax: false,
      showTotal: true,
      showPaymentMethod: true,
      showChange: true,
    },
    styles: {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      headerAlign: 'center',
      showBorders: true,
      borderStyle: 'thick', // Border tebal untuk classic
    },
    supportedSizes: ['50mm', '80mm', 'A4', 'Bluetooth'], // Support semua ukuran
  },
  {
    type: 'MODERN',
    name: 'Struk Modern',
    paperSize: 'A4',
    description: 'Design modern minimalis dengan tipografi rapi, clean tanpa border tebal',
    header: {
      showLogo: true,
      showName: true,
      showAddress: true,
      showPhone: true,
      showQRCode: false,
    },
    footer: {
      showThankYou: true,
      showContact: true,
      showSocialMedia: true,
      showWebsite: true,
    },
    fields: {
      showOrderNumber: true,
      showDate: true,
      showTime: true,
      showShift: true, // WAJIB
      showCashier: true, // WAJIB
      showCustomer: true,
      showItems: true,
      showSubtotal: true,
      showDiscount: true,
      showTax: false,
      showTotal: true,
      showPaymentMethod: true,
      showChange: true,
      showBarcode: false,
    },
    styles: {
      fontSize: '11px',
      fontFamily: 'Inter, sans-serif',
      headerAlign: 'center',
      showBorders: false,
      useGradient: true, // Gradient subtle untuk A4
      useIcons: true, // Icon untuk shift dan kasir (opsional untuk A4)
    },
    supportedSizes: ['50mm', '80mm', 'A4', 'Bluetooth'],
  },
  {
    type: 'MINIMAL',
    name: 'Struk Minimalis',
    paperSize: 'THERMAL_50',
    description: 'Design sangat minimalis, fokus pada informasi esensial, optimal untuk thermal 50mm dan 80mm',
    header: {
      showLogo: false,
      showName: true,
      showAddress: false,
      showPhone: false,
    },
    footer: {
      showThankYou: true,
      showContact: false,
      showSocialMedia: false,
    },
    fields: {
      showOrderNumber: true,
      showDate: true,
      showTime: true,
      showShift: true, // WAJIB - Compact format
      showCashier: true, // WAJIB - Compact format
      showCustomer: false,
      showItems: true,
      showSubtotal: false,
      showDiscount: false,
      showTax: false,
      showTotal: true,
      showPaymentMethod: true,
      showChange: true,
    },
    styles: {
      fontSize: '9px', // Kecil untuk thermal
      fontFamily: 'Courier New, monospace',
      headerAlign: 'center',
      showBorders: false,
      spacing: 'minimal', // Spacing minimal
    },
    supportedSizes: ['50mm', '80mm'], // Utama untuk thermal, A4 opsional
  },
  {
    type: 'PROFESSIONAL',
    name: 'Struk Profesional',
    paperSize: 'A4',
    description: 'Design profesional untuk bisnis formal, layout terstruktur dengan section jelas',
    header: {
      showLogo: true,
      showName: true,
      showAddress: true,
      showPhone: true,
      showEmail: true,
      showTaxId: false,
    },
    footer: {
      showThankYou: true,
      showContact: true,
      showSocialMedia: true,
      showWebsite: true,
      showTerms: false,
    },
    fields: {
      showOrderNumber: true,
      showDate: true,
      showTime: true,
      showShift: true, // WAJIB - Dengan section jelas
      showCashier: true, // WAJIB - Dengan section jelas
      showCustomer: true,
      showCustomerAddress: false,
      showItems: true,
      showItemDescription: false,
      showSubtotal: true,
      showDiscount: true,
      showTax: false,
      showServiceCharge: false,
      showTotal: true,
      showPaymentMethod: true,
      showChange: true,
      showBarcode: false,
      showQRCode: false,
    },
    styles: {
      fontSize: '11px',
      fontFamily: 'Arial, sans-serif',
      headerAlign: 'center',
      showBorders: true,
      showShadows: false,
      sectionStyle: 'structured', // Section terstruktur
    },
    supportedSizes: ['A4', '80mm'], // Utama A4, 80mm opsional
  },
];

export class ReceiptService {
  async getReceiptTemplates(tenantId: string) {
    const templates = await prisma.receiptTemplate.findMany({
      where: { tenantId },
      orderBy: { isDefault: 'desc' },
    });

    // If no templates, create default templates
    if (templates.length === 0) {
      await this.initializeDefaultTemplates(tenantId);
      return await prisma.receiptTemplate.findMany({
        where: { tenantId },
        orderBy: { isDefault: 'desc' },
      });
    }

    return templates;
  }

  async initializeDefaultTemplates(tenantId: string) {
    const defaultTemplate = RECEIPT_TEMPLATE_DEFINITIONS.find(t => t.type === 'DEFAULT');
    if (defaultTemplate) {
      await prisma.receiptTemplate.create({
        data: {
          tenantId,
          name: defaultTemplate.name,
          templateType: defaultTemplate.type,
          isDefault: true,
          paperSize: defaultTemplate.paperSize,
          header: defaultTemplate.header,
          footer: defaultTemplate.footer,
          fields: defaultTemplate.fields,
          styles: defaultTemplate.styles,
        },
      });
    }
  }

  async getDefaultTemplate(tenantId: string) {
    const template = await prisma.receiptTemplate.findFirst({
      where: {
        tenantId,
        isDefault: true,
      },
    });

    if (!template) {
      // Initialize and return default
      await this.initializeDefaultTemplates(tenantId);
      return await prisma.receiptTemplate.findFirst({
        where: { tenantId, isDefault: true },
      });
    }

    return template;
  }

  async createTemplate(tenantId: string, data: {
    name: string;
    templateType: string;
    paperSize: string;
    header?: any;
    footer?: any;
    fields?: any;
    styles?: any;
  }) {
    // Check if tenant has receipt templates addon
    const hasAddon = await prisma.tenantAddon.findFirst({
      where: {
        tenantId,
        addonType: 'RECEIPT_TEMPLATES',
        status: 'active',
      },
    });

    // If no addon, only allow 1 template (default)
    if (!hasAddon) {
      const existingCount = await prisma.receiptTemplate.count({
        where: { tenantId },
      });
      if (existingCount >= 1) {
        throw new Error('Only 1 receipt template allowed without addon. Subscribe to Receipt Templates addon for more templates.');
      }
    } else {
      // Check limit
      const limit = hasAddon.limit || 5;
      const currentCount = await prisma.receiptTemplate.count({
        where: { tenantId },
      });
      if (currentCount >= limit) {
        throw new Error(`Receipt template limit reached (${limit}). Upgrade your addon for more templates.`);
      }
    }

    // If this is set as default, unset other defaults
    if (data.templateType === 'DEFAULT' || data.name.toLowerCase().includes('default')) {
      await prisma.receiptTemplate.updateMany({
        where: { tenantId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.receiptTemplate.create({
      data: {
        tenantId,
        name: data.name,
        templateType: data.templateType,
        paperSize: data.paperSize,
        isDefault: data.templateType === 'DEFAULT',
        header: data.header || {},
        footer: data.footer || {},
        fields: data.fields || {},
        styles: data.styles || {},
      },
    });
  }

  async updateTemplate(id: string, tenantId: string, data: any) {
    const template = await prisma.receiptTemplate.findFirst({
      where: { id, tenantId },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    return prisma.receiptTemplate.update({
      where: { id },
      data,
    });
  }

  async setDefaultTemplate(id: string, tenantId: string) {
    const template = await prisma.receiptTemplate.findFirst({
      where: { id, tenantId },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    // Unset all defaults
    await prisma.receiptTemplate.updateMany({
      where: { tenantId, isDefault: true },
      data: { isDefault: false },
    });

    // Set this as default
    return prisma.receiptTemplate.update({
      where: { id },
      data: { isDefault: true },
    });
  }

  async deleteTemplate(id: string, tenantId: string) {
    const template = await prisma.receiptTemplate.findFirst({
      where: { id, tenantId },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    if (template.isDefault) {
      throw new Error('Cannot delete default template. Set another template as default first.');
    }

    return prisma.receiptTemplate.delete({
      where: { id },
    });
  }

  async generateReceipt(orderId: string, tenantId: string, templateId?: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, tenantId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
        member: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        storeShift: {
          select: {
            id: true,
            shiftType: true,
            openedBy: true,
            opener: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        tenant: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Get transaction separately
    const transaction = await prisma.transaction.findFirst({
      where: { orderId: order.id },
      orderBy: { createdAt: 'desc' },
    });

    const template = templateId
      ? await prisma.receiptTemplate.findFirst({
          where: { id: templateId, tenantId },
        })
      : await this.getDefaultTemplate(tenantId);

    // Ensure template has default fields if not set
    const templateWithDefaults = {
      ...template,
      header: template?.header || {
        showName: true,
        showAddress: true,
      },
      footer: template?.footer || {
        showThankYou: true,
        showContact: true,
      },
      fields: template?.fields || {
        showOrderNumber: true,
        showDate: true,
        showItems: true,
        showSubtotal: true,
        showDiscount: true,
        showTotal: true,
        showPaymentMethod: true,
      },
    };

    return {
      order: {
        ...order,
        transaction,
      },
      template: templateWithDefaults,
      receiptData: {
        orderNumber: order.orderNumber,
        date: order.createdAt,
        customerName: order.member?.name || order.customer?.name || order.temporaryCustomerName || 'Walk-in',
        shiftType: order.storeShift?.shiftType || null, // Pagi, Siang, Sore, Malam
        cashierName: order.user?.name || order.storeShift?.opener?.name || 'Kasir', // Nama kasir yang melayani
        items: order.items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: Number(item.price),
          subtotal: Number(item.subtotal),
        })),
        subtotal: Number(order.subtotal),
        discount: Number(order.discount),
        total: Number(order.total),
        paymentMethod: transaction?.paymentMethod || 'CASH',
        change: transaction?.amount ? Number(transaction.amount) - Number(order.total) : 0,
      },
    };
  }
}

export default new ReceiptService();
