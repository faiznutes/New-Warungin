/**
 * Unit Tests: Discount Calculation Edge Cases
 * 
 * Test suite untuk validasi semua scenario discount calculation
 * Run: npm test tests/unit/discount-calculation.test.ts
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Mock data interface
interface OrderData {
  items: Array<{ productId: string; quantity: number; price: number }>;
  memberId?: string;
  discount?: number;
  autoDiscount?: number;
  memberDiscount?: number;
}

interface Member {
  id: string;
  isActive: boolean;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
}

/**
 * Helper function to calculate order total (mimics backend logic)
 */
function calculateOrderTotal(order: OrderData, member?: Member): { total: number; error?: string } {
  // Calculate subtotal
  const subtotal = order.items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  // Apply auto discount (if provided)
  const autoDiscount = order.autoDiscount || 0;
  const subtotalAfterAutoDiscount = subtotal - autoDiscount;

  // Apply member discount
  let memberDiscount = 0;
  if (order.memberId && member && member.isActive) {
    if (member.discountType === 'PERCENTAGE') {
      memberDiscount = (subtotalAfterAutoDiscount * member.discountValue) / 100;
    } else {
      memberDiscount = member.discountValue;
    }
  }

  // Apply manual discount
  const manualDiscount = order.discount || 0;

  // Calculate final total
  const total = subtotalAfterAutoDiscount - memberDiscount - manualDiscount;

  // Validation
  if (total < 0) {
    return {
      total: 0,
      error: `Total cannot be negative after discounts. Subtotal: ${subtotal}, Auto: ${autoDiscount}, Member: ${memberDiscount}, Manual: ${manualDiscount}, Final: ${total}`,
    };
  }

  const totalDiscount = autoDiscount + memberDiscount + manualDiscount;
  if (totalDiscount > subtotal) {
    return {
      total: 0,
      error: `Total discount (${totalDiscount}) cannot exceed subtotal (${subtotal})`,
    };
  }

  return { total };
}

describe('Discount Calculation', () => {
  describe('No Discount Scenarios', () => {
    it('should calculate correct total with no discounts', () => {
      const order: OrderData = {
        items: [
          { productId: 'prod-1', quantity: 2, price: 10000 },
          { productId: 'prod-2', quantity: 1, price: 5000 },
        ],
      };

      const result = calculateOrderTotal(order);
      expect(result.total).toBe(25000); // (2 * 10000) + (1 * 5000)
      expect(result.error).toBeUndefined();
    });

    it('should calculate zero total for zero quantity items', () => {
      const order: OrderData = {
        items: [
          { productId: 'prod-1', quantity: 0, price: 10000 },
        ],
      };

      const result = calculateOrderTotal(order);
      expect(result.total).toBe(0);
      expect(result.error).toBeUndefined();
    });

    it('should handle multiple items correctly', () => {
      const order: OrderData = {
        items: [
          { productId: 'prod-1', quantity: 1, price: 5000 },
          { productId: 'prod-2', quantity: 1, price: 10000 },
          { productId: 'prod-3', quantity: 2, price: 7500 },
        ],
      };

      const result = calculateOrderTotal(order);
      expect(result.total).toBe(30000); // 5000 + 10000 + (2 * 7500)
      expect(result.error).toBeUndefined();
    });
  });

  describe('Auto Discount Scenarios', () => {
    it('should apply auto discount correctly', () => {
      const order: OrderData = {
        items: [{ productId: 'prod-1', quantity: 1, price: 100000 }],
        autoDiscount: 10000, // Rp 10k discount
      };

      const result = calculateOrderTotal(order);
      expect(result.total).toBe(90000);
      expect(result.error).toBeUndefined();
    });

    it('should handle 100% auto discount (free order)', () => {
      const order: OrderData = {
        items: [{ productId: 'prod-1', quantity: 1, price: 10000 }],
        autoDiscount: 10000,
      };

      const result = calculateOrderTotal(order);
      expect(result.total).toBe(0);
      expect(result.error).toBeUndefined();
    });

    it('should reject auto discount exceeding subtotal', () => {
      const order: OrderData = {
        items: [{ productId: 'prod-1', quantity: 1, price: 10000 }],
        autoDiscount: 15000, // More than subtotal
      };

      const result = calculateOrderTotal(order);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Total cannot be negative');
    });
  });

  describe('Member Discount Scenarios', () => {
    const activeMember: Member = {
      id: 'member-1',
      isActive: true,
      discountType: 'PERCENTAGE',
      discountValue: 10, // 10% discount
    };

    const inactiveMember: Member = {
      id: 'member-2',
      isActive: false,
      discountType: 'PERCENTAGE',
      discountValue: 10,
    };

    it('should apply percentage member discount correctly', () => {
      const order: OrderData = {
        items: [{ productId: 'prod-1', quantity: 1, price: 100000 }],
        memberId: 'member-1',
      };

      const result = calculateOrderTotal(order, activeMember);
      expect(result.total).toBe(90000); // 100000 - (100000 * 10%)
      expect(result.error).toBeUndefined();
    });

    it('should not apply discount for inactive member', () => {
      const order: OrderData = {
        items: [{ productId: 'prod-1', quantity: 1, price: 100000 }],
        memberId: 'member-2',
      };

      const result = calculateOrderTotal(order, inactiveMember);
      expect(result.total).toBe(100000); // No discount applied
      expect(result.error).toBeUndefined();
    });

    it('should apply fixed amount member discount correctly', () => {
      const fixedMember: Member = {
        id: 'member-3',
        isActive: true,
        discountType: 'FIXED',
        discountValue: 25000, // Fixed Rp 25k
      };

      const order: OrderData = {
        items: [{ productId: 'prod-1', quantity: 1, price: 100000 }],
        memberId: 'member-3',
      };

      const result = calculateOrderTotal(order, fixedMember);
      expect(result.total).toBe(75000); // 100000 - 25000
      expect(result.error).toBeUndefined();
    });

    it('should handle member discount greater than or equal to total', () => {
      const memberWithBigDiscount: Member = {
        id: 'member-big',
        isActive: true,
        discountType: 'FIXED',
        discountValue: 150000, // More than subtotal
      };

      const order: OrderData = {
        items: [{ productId: 'prod-1', quantity: 1, price: 100000 }],
        memberId: 'member-big',
      };

      const result = calculateOrderTotal(order, memberWithBigDiscount);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Total cannot be negative');
    });

    it('should apply member percentage discount after auto discount', () => {
      // This tests the order: auto discount first, then member discount on remaining amount
      const order: OrderData = {
        items: [{ productId: 'prod-1', quantity: 1, price: 100000 }],
        autoDiscount: 10000, // First: 100k - 10k = 90k
        memberId: 'member-1', // Then: 90k - (90k * 10%) = 81k
      };

      const result = calculateOrderTotal(order, activeMember);
      expect(result.total).toBe(81000); // 100000 - 10000 - (90000 * 10%)
      expect(result.error).toBeUndefined();
    });
  });

  describe('Manual Discount Scenarios', () => {
    it('should apply manual discount correctly', () => {
      const order: OrderData = {
        items: [{ productId: 'prod-1', quantity: 1, price: 100000 }],
        discount: 15000, // Manual Rp 15k discount
      };

      const result = calculateOrderTotal(order);
      expect(result.total).toBe(85000);
      expect(result.error).toBeUndefined();
    });

    it('should apply zero manual discount', () => {
      const order: OrderData = {
        items: [{ productId: 'prod-1', quantity: 1, price: 100000 }],
        discount: 0,
      };

      const result = calculateOrderTotal(order);
      expect(result.total).toBe(100000);
      expect(result.error).toBeUndefined();
    });

    it('should reject manual discount exceeding remaining amount', () => {
      const order: OrderData = {
        items: [{ productId: 'prod-1', quantity: 1, price: 50000 }],
        discount: 100000, // More than subtotal
      };

      const result = calculateOrderTotal(order);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Total cannot be negative');
    });
  });

  describe('Combined Discount Scenarios', () => {
    const activeMember: Member = {
      id: 'member-1',
      isActive: true,
      discountType: 'PERCENTAGE',
      discountValue: 10,
    };

    it('should apply all three discount types in correct order', () => {
      // Order: auto → member → manual
      const order: OrderData = {
        items: [{ productId: 'prod-1', quantity: 1, price: 100000 }],
        autoDiscount: 10000, // 100k - 10k = 90k
        memberId: 'member-1', // 90k - (90k * 10%) = 81k
        discount: 6000, // 81k - 6k = 75k
      };

      const result = calculateOrderTotal(order, activeMember);
      expect(result.total).toBe(75000);
      expect(result.error).toBeUndefined();
    });

    it('should handle maximum realistic discounts', () => {
      // Realistic scenario: auto 5% + member 10% + manual 5k
      const order: OrderData = {
        items: [
          { productId: 'prod-1', quantity: 2, price: 50000 },
          { productId: 'prod-2', quantity: 1, price: 30000 },
        ], // Subtotal: 130000
        autoDiscount: 6500, // 5% auto discount = 6.5k
        memberId: 'member-1', // Member 10% on 123.5k = 12.35k
        discount: 5000, // Manual 5k
      };

      const result = calculateOrderTotal(order, activeMember);
      // 130000 - 6500 = 123500
      // 123500 - (123500 * 10%) = 111150
      // 111150 - 5000 = 106150
      expect(result.total).toBe(106150);
      expect(result.error).toBeUndefined();
    });

    it('should reject when combined discounts exceed subtotal', () => {
      const order: OrderData = {
        items: [{ productId: 'prod-1', quantity: 1, price: 100000 }],
        autoDiscount: 40000,
        memberId: 'member-1', // This would try to discount from reduced amount
        discount: 70000, // Manual part that pushes over
      };

      const result = calculateOrderTotal(order, activeMember);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Total cannot be negative');
    });
  });

  describe('Edge Cases with Floating Point', () => {
    it('should handle small fractional amounts', () => {
      const order: OrderData = {
        items: [
          { productId: 'prod-1', quantity: 3, price: 3333 }, // 9999
        ],
      };

      const result = calculateOrderTotal(order);
      expect(result.total).toBe(9999);
      expect(result.error).toBeUndefined();
    });

    it('should handle very large amounts', () => {
      const order: OrderData = {
        items: [
          { productId: 'prod-1', quantity: 100, price: 1000000 }, // 100M
        ],
      };

      const result = calculateOrderTotal(order);
      expect(result.total).toBe(100000000);
      expect(result.error).toBeUndefined();
    });

    it('should handle percentage discount resulting in fractional amounts', () => {
      // 100000 * 33% = 33000, result should be 67000
      const member: Member = {
        id: 'member-33',
        isActive: true,
        discountType: 'PERCENTAGE',
        discountValue: 33,
      };

      const order: OrderData = {
        items: [{ productId: 'prod-1', quantity: 1, price: 100000 }],
        memberId: 'member-33',
      };

      const result = calculateOrderTotal(order, member);
      expect(result.total).toBe(67000);
      expect(result.error).toBeUndefined();
    });
  });

  describe('Error Cases', () => {
    it('should reject negative total explicitly', () => {
      const order: OrderData = {
        items: [{ productId: 'prod-1', quantity: 1, price: 10000 }],
        discount: 15000, // More than subtotal
      };

      const result = calculateOrderTotal(order);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('cannot be negative');
    });

    it('should reject zero amount order with high discount', () => {
      const order: OrderData = {
        items: [], // No items
        discount: 5000,
      };

      const result = calculateOrderTotal(order);
      expect(result.total).toBe(0);
    });

    it('should handle missing member gracefully', () => {
      const order: OrderData = {
        items: [{ productId: 'prod-1', quantity: 1, price: 100000 }],
        memberId: 'non-existent-member',
      };

      // No member provided, should calculate without member discount
      const result = calculateOrderTotal(order, undefined);
      expect(result.total).toBe(100000);
      expect(result.error).toBeUndefined();
    });
  });

  describe('Precision Tests', () => {
    it('should maintain precision with multiple decimal calculations', () => {
      const member: Member = {
        id: 'member-10',
        isActive: true,
        discountType: 'PERCENTAGE',
        discountValue: 10,
      };

      const order: OrderData = {
        items: [
          { productId: 'prod-1', quantity: 3, price: 33333.33 }, // 99999.99
          { productId: 'prod-2', quantity: 2, price: 50000.005 }, // 100000.01
        ], // Total: 200000
        autoDiscount: 10000,
        memberId: 'member-10',
      };

      const result = calculateOrderTotal(order, member);
      // 200000 - 10000 = 190000
      // 190000 - (190000 * 10%) = 171000
      expect(result.total).toBe(171000);
      expect(result.error).toBeUndefined();
    });
  });
});
