/**
 * Loyalty Tier Service
 * Handles tiered loyalty program (Bronze, Silver, Gold, Platinum)
 * with personalized offers and benefits
 */

import prisma from '../config/database';
import logger from '../utils/logger';

export enum LoyaltyTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
}

interface TierBenefits {
  tier: LoyaltyTier;
  pointsMultiplier: number; // Bonus multiplier untuk points earned
  discountPercentage: number; // Diskon otomatis
  freeDeliveryThreshold: number; // Minimum order untuk free delivery
  prioritySupport: boolean;
  birthdayBonus: number; // Extra points di ulang tahun
  exclusiveOffers: boolean;
  earlyAccess: boolean; // Early access to new products/features
}

// Tier requirements dan benefits
const TIER_CONFIG: Record<LoyaltyTier, {
  minSpending: number; // Minimum total spending untuk tier ini
  minOrders: number; // Minimum jumlah order
  benefits: TierBenefits;
}> = {
  [LoyaltyTier.BRONZE]: {
    minSpending: 0,
    minOrders: 0,
    benefits: {
      tier: LoyaltyTier.BRONZE,
      pointsMultiplier: 1.0,
      discountPercentage: 0,
      freeDeliveryThreshold: 100000,
      prioritySupport: false,
      birthdayBonus: 50,
      exclusiveOffers: false,
      earlyAccess: false,
    },
  },
  [LoyaltyTier.SILVER]: {
    minSpending: 1000000, // 1 juta
    minOrders: 10,
    benefits: {
      tier: LoyaltyTier.SILVER,
      pointsMultiplier: 1.2, // 20% bonus points
      discountPercentage: 5, // 5% diskon otomatis
      freeDeliveryThreshold: 75000,
      prioritySupport: false,
      birthdayBonus: 100,
      exclusiveOffers: true,
      earlyAccess: false,
    },
  },
  [LoyaltyTier.GOLD]: {
    minSpending: 5000000, // 5 juta
    minOrders: 50,
    benefits: {
      tier: LoyaltyTier.GOLD,
      pointsMultiplier: 1.5, // 50% bonus points
      discountPercentage: 10, // 10% diskon otomatis
      freeDeliveryThreshold: 50000,
      prioritySupport: true,
      birthdayBonus: 200,
      exclusiveOffers: true,
      earlyAccess: true,
    },
  },
  [LoyaltyTier.PLATINUM]: {
    minSpending: 20000000, // 20 juta
    minOrders: 200,
    benefits: {
      tier: LoyaltyTier.PLATINUM,
      pointsMultiplier: 2.0, // 100% bonus points
      discountPercentage: 15, // 15% diskon otomatis
      freeDeliveryThreshold: 0, // Always free delivery
      prioritySupport: true,
      birthdayBonus: 500,
      exclusiveOffers: true,
      earlyAccess: true,
    },
  },
};

interface CustomerTierInfo {
  customerId: string;
  currentTier: LoyaltyTier;
  totalSpending: number;
  totalOrders: number;
  benefits: TierBenefits;
  nextTier?: LoyaltyTier;
  progressToNextTier?: {
    spendingNeeded: number;
    ordersNeeded: number;
    percentComplete: number;
  };
}

class LoyaltyTierService {
  /**
   * Calculate customer's loyalty tier based on spending and orders
   */
  async calculateCustomerTier(tenantId: string, customerId: string): Promise<CustomerTierInfo> {
    try {
      // Get customer's completed orders
      const orders = await prisma.order.findMany({
        where: {
          tenantId,
          customerId,
          status: 'COMPLETED',
        },
        select: {
          total: true,
        },
      });

      const totalOrders = orders.length;
      const totalSpending = orders.reduce((sum, order) => sum + Number(order.total), 0);

      // Determine tier
      let currentTier = LoyaltyTier.BRONZE;
      
      if (
        totalSpending >= TIER_CONFIG[LoyaltyTier.PLATINUM].minSpending &&
        totalOrders >= TIER_CONFIG[LoyaltyTier.PLATINUM].minOrders
      ) {
        currentTier = LoyaltyTier.PLATINUM;
      } else if (
        totalSpending >= TIER_CONFIG[LoyaltyTier.GOLD].minSpending &&
        totalOrders >= TIER_CONFIG[LoyaltyTier.GOLD].minOrders
      ) {
        currentTier = LoyaltyTier.GOLD;
      } else if (
        totalSpending >= TIER_CONFIG[LoyaltyTier.SILVER].minSpending &&
        totalOrders >= TIER_CONFIG[LoyaltyTier.SILVER].minOrders
      ) {
        currentTier = LoyaltyTier.SILVER;
      }

      const benefits = TIER_CONFIG[currentTier].benefits;

      // Calculate progress to next tier
      const tierOrder = [LoyaltyTier.BRONZE, LoyaltyTier.SILVER, LoyaltyTier.GOLD, LoyaltyTier.PLATINUM];
      const currentTierIndex = tierOrder.indexOf(currentTier);
      
      let nextTier: LoyaltyTier | undefined;
      let progressToNextTier: CustomerTierInfo['progressToNextTier'];

      if (currentTierIndex < tierOrder.length - 1) {
        nextTier = tierOrder[currentTierIndex + 1];
        const nextTierConfig = TIER_CONFIG[nextTier];
        
        const spendingNeeded = Math.max(0, nextTierConfig.minSpending - totalSpending);
        const ordersNeeded = Math.max(0, nextTierConfig.minOrders - totalOrders);
        
        // Calculate percent complete (average of spending and orders progress)
        const spendingProgress = (totalSpending / nextTierConfig.minSpending) * 100;
        const ordersProgress = (totalOrders / nextTierConfig.minOrders) * 100;
        const percentComplete = Math.min(100, (spendingProgress + ordersProgress) / 2);

        progressToNextTier = {
          spendingNeeded,
          ordersNeeded,
          percentComplete,
        };
      }

      // Update customer's loyaltyPoints field with tier info
      await prisma.customer.update({
        where: { id: customerId },
        data: {
          loyaltyPoints: totalOrders * 10, // Simple loyalty points calculation
        },
      });

      return {
        customerId,
        currentTier,
        totalSpending,
        totalOrders,
        benefits,
        nextTier,
        progressToNextTier,
      };
    } catch (error: any) {
      logger.error('Error calculating customer tier:', error);
      throw error;
    }
  }

  /**
   * Get tier benefits for a specific tier
   */
  getTierBenefits(tier: LoyaltyTier): TierBenefits {
    return TIER_CONFIG[tier].benefits;
  }

  /**
   * Get all tier configurations
   */
  getAllTierConfigs() {
    return TIER_CONFIG;
  }

  /**
   * Apply tier discount to order
   */
  async applyTierDiscount(
    tenantId: string,
    customerId: string,
    orderTotal: number
  ): Promise<{ discount: number; finalTotal: number; tierApplied: LoyaltyTier }> {
    try {
      const tierInfo = await this.calculateCustomerTier(tenantId, customerId);
      const discountPercentage = tierInfo.benefits.discountPercentage;
      const discount = (orderTotal * discountPercentage) / 100;
      const finalTotal = orderTotal - discount;

      return {
        discount,
        finalTotal,
        tierApplied: tierInfo.currentTier,
      };
    } catch (error: any) {
      logger.error('Error applying tier discount:', error);
      throw error;
    }
  }

  /**
   * Check if customer qualifies for free delivery based on tier
   */
  async checkFreeDelivery(
    tenantId: string,
    customerId: string,
    orderTotal: number
  ): Promise<{ isFreeDelivery: boolean; threshold: number; tier: LoyaltyTier }> {
    try {
      const tierInfo = await this.calculateCustomerTier(tenantId, customerId);
      const threshold = tierInfo.benefits.freeDeliveryThreshold;
      const isFreeDelivery = orderTotal >= threshold;

      return {
        isFreeDelivery,
        threshold,
        tier: tierInfo.currentTier,
      };
    } catch (error: any) {
      logger.error('Error checking free delivery:', error);
      throw error;
    }
  }

  /**
   * Get personalized offers for customer based on tier
   */
  async getPersonalizedOffers(tenantId: string, customerId: string) {
    try {
      const tierInfo = await this.calculateCustomerTier(tenantId, customerId);

      if (!tierInfo.benefits.exclusiveOffers) {
        return [];
      }

      // Get active discounts for this tier
      const offers = await prisma.discount.findMany({
        where: {
          tenantId,
          isActive: true,
          validFrom: {
            lte: new Date(),
          },
          validUntil: {
            gte: new Date(),
          },
        },
        orderBy: {
          discountValue: 'desc',
        },
        take: 5,
      });

      return offers.map(offer => ({
        ...offer,
        tierBonus: tierInfo.benefits.pointsMultiplier,
        isEarlyAccess: tierInfo.benefits.earlyAccess,
      }));
    } catch (error: any) {
      logger.error('Error getting personalized offers:', error);
      throw error;
    }
  }

  /**
   * Award birthday bonus points based on tier
   */
  async awardBirthdayBonus(tenantId: string, customerId: string): Promise<number> {
    try {
      const tierInfo = await this.calculateCustomerTier(tenantId, customerId);
      const bonusPoints = tierInfo.benefits.birthdayBonus;

      // Update customer's loyalty points
      await prisma.customer.update({
        where: { id: customerId },
        data: {
          loyaltyPoints: {
            increment: bonusPoints,
          },
        },
      });

      logger.info(`Awarded ${bonusPoints} birthday bonus points to customer ${customerId} (${tierInfo.currentTier} tier)`);

      return bonusPoints;
    } catch (error: any) {
      logger.error('Error awarding birthday bonus:', error);
      throw error;
    }
  }

  /**
   * Get tier upgrade notifications
   */
  async checkTierUpgrade(
    tenantId: string,
    customerId: string,
    previousTier: LoyaltyTier
  ): Promise<{ upgraded: boolean; newTier?: LoyaltyTier; message?: string }> {
    try {
      const tierInfo = await this.calculateCustomerTier(tenantId, customerId);

      const tierOrder = [LoyaltyTier.BRONZE, LoyaltyTier.SILVER, LoyaltyTier.GOLD, LoyaltyTier.PLATINUM];
      const previousIndex = tierOrder.indexOf(previousTier);
      const currentIndex = tierOrder.indexOf(tierInfo.currentTier);

      if (currentIndex > previousIndex) {
        const message = `Selamat! Anda telah naik ke tier ${tierInfo.currentTier}! Nikmati benefit: ${tierInfo.benefits.discountPercentage}% diskon, ${tierInfo.benefits.pointsMultiplier}x bonus points, dan lebih banyak keuntungan!`;
        
        return {
          upgraded: true,
          newTier: tierInfo.currentTier,
          message,
        };
      }

      return { upgraded: false };
    } catch (error: any) {
      logger.error('Error checking tier upgrade:', error);
      throw error;
    }
  }
}

export default new LoyaltyTierService();
