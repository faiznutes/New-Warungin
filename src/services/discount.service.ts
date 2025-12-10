import prisma from '../config/database';

export interface DiscountResult {
  discountAmount: number;
  discountDetails: Array<{
    discountId: string;
    discountName: string;
    discountAmount: number;
    appliedTo: string[]; // Product IDs yang mendapat diskon
  }>;
}

export class DiscountService {
  /**
   * Apply automatic discounts based on order items
   */
  async applyDiscounts(
    tenantId: string,
    items: Array<{ productId: string; quantity: number; price: number }>,
    subtotal: number
  ): Promise<DiscountResult> {
    const discounts = await prisma.discount.findMany({
      where: {
        tenantId,
        isActive: true,
        OR: [
          { startDate: null },
          { startDate: { lte: new Date() } },
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: new Date() } },
            ],
          },
        ],
      },
    });

    let totalDiscount = 0;
    const discountDetails: DiscountResult['discountDetails'] = [];
    // Track products that already have discount applied (to prevent double discount across different discount rules)
    const globalProductsWithDiscount = new Set<string>();

    for (const discount of discounts) {
      let discountAmount = 0;
      const appliedTo: string[] = [];

      if (discount.discountType === 'AMOUNT_BASED') {
        // Diskon berdasarkan total pembelian (contoh: beli 1 50rb disc 20%)
        const minAmount = discount.minAmount ? Number(discount.minAmount) : 0;
        const minQuantity = discount.minQuantity || 1;

        // Check if order meets minimum requirements
        if (subtotal >= minAmount && items.length >= minQuantity) {
          const applicableProductIds = discount.applicableProducts 
            ? (discount.applicableProducts as string[])
            : items.map(item => item.productId);

          // Calculate discount for applicable products
          for (const item of items) {
            if (applicableProductIds.includes(item.productId)) {
              const itemSubtotal = item.price * item.quantity;
              
              if (discount.discountValueType === 'PERCENTAGE') {
                discountAmount += (itemSubtotal * Number(discount.discountValue)) / 100;
              } else {
                discountAmount += Number(discount.discountValue);
              }
              
              appliedTo.push(item.productId);
            }
          }
        }
      } else if (discount.discountType === 'BUNDLE') {
        // Diskon bundle (contoh: beli produk A + B, diskon 20% hanya untuk produk A)
        const bundleProductIds = discount.bundleProducts 
          ? (discount.bundleProducts as string[])
          : [];
        const discountProductId = discount.bundleDiscountProduct;

        // Check if all bundle products are in the order
        const orderProductIds = items.map(item => item.productId);
        const hasAllBundleProducts = bundleProductIds.every(id => orderProductIds.includes(id));

        if (hasAllBundleProducts && discountProductId) {
          // Find the product that gets the discount
          const discountItem = items.find(item => item.productId === discountProductId);
          
          if (discountItem) {
            const itemSubtotal = discountItem.price * discountItem.quantity;
            
            if (discount.discountValueType === 'PERCENTAGE') {
              discountAmount = (itemSubtotal * Number(discount.discountValue)) / 100;
            } else {
              discountAmount = Number(discount.discountValue);
            }
            
            appliedTo.push(discountProductId);
          }
        }
      } else if (discount.discountType === 'PRODUCT_BASED') {
        // Diskon berdasarkan produk tertentu
        // Beli 1 per satu juga langsung dapat diskon
        // Tapi jika produk A dan B sama-sama dapat diskon 20%, tetap 20% bukan 40%
        // Setiap produk hanya dapat diskon dari 1 discount rule (tidak double)
        const applicableProductIds = discount.applicableProducts 
          ? (discount.applicableProducts as string[])
          : [];

        for (const item of items) {
          // If applicableProducts is empty/null, apply to all products
          // Otherwise, only apply if product is in the list
          // Check if this product already has discount from previous discount rules
          if ((applicableProductIds.length === 0 || applicableProductIds.includes(item.productId)) 
              && !globalProductsWithDiscount.has(item.productId)) {
            const itemSubtotal = item.price * item.quantity;
            
            if (discount.discountValueType === 'PERCENTAGE') {
              discountAmount += (itemSubtotal * Number(discount.discountValue)) / 100;
            } else {
              // For FIXED, apply discount per item
              discountAmount += Number(discount.discountValue) * item.quantity;
            }
            
            appliedTo.push(item.productId);
            globalProductsWithDiscount.add(item.productId); // Mark as discounted globally
          }
        }
      } else if (discount.discountType === 'QUANTITY_BASED') {
        // Diskon berdasarkan jumlah item per produk
        // Harus salah 1 produk mencapai min quantity, bukan total item
        // Contoh: jika produk A di beli 3x diskon 20%, tapi jika produk A dibeli 2x dan produk B 1x tidak dapat diskon
        // Jika produk A dan B diskon 20% jika membeli 3x, lalu user beli produk A 2x dan produk B 2x tetap tidak dapat diskon
        // karena harus salah 1 produk 3x pembelian
        const minQuantity = discount.minQuantity || 1;
        const applicableProductIds = discount.applicableProducts 
          ? (discount.applicableProducts as string[])
          : [];

        // Check each product individually - must meet minQuantity for that specific product
        for (const item of items) {
          // If applicableProducts is empty/null, apply to all products
          // Otherwise, only check if product is in the list
          if (applicableProductIds.length === 0 || applicableProductIds.includes(item.productId)) {
            // Check if THIS SPECIFIC PRODUCT meets the minimum quantity requirement
            if (item.quantity >= minQuantity) {
              const itemSubtotal = item.price * item.quantity;
              
              if (discount.discountValueType === 'PERCENTAGE') {
                discountAmount += (itemSubtotal * Number(discount.discountValue)) / 100;
              } else {
                // For FIXED, apply discount per item that meets quantity requirement
                discountAmount += Number(discount.discountValue) * item.quantity;
              }
              
              appliedTo.push(item.productId);
            }
          }
        }
      }

      if (discountAmount > 0) {
        totalDiscount += discountAmount;
        discountDetails.push({
          discountId: discount.id,
          discountName: discount.name,
          discountAmount,
          appliedTo, // Product IDs yang mendapat diskon dari discount rule ini
        });
      }
    }

    return {
      discountAmount: totalDiscount,
      discountDetails,
    };
  }

  /**
   * Get all discounts for tenant (active and inactive)
   */
  async getDiscounts(tenantId: string, isActive?: boolean) {
    const where: any = {
      tenantId,
    };
    
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return prisma.discount.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

export default new DiscountService();

