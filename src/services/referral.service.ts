/**
 * Referral Program Service
 * Handles customer referral program with rewards
 */

import { randomBytes } from 'crypto';
import prisma from '../config/database';
import logger from '../utils/logger';
import rewardPointService from './reward-point.service';

interface ReferralRewards {
  referrerPoints: number; // Points untuk yang mengajak
  refereeDiscount: number; // Diskon untuk yang diajak (%)
  refereePoints: number; // Points bonus untuk yang diajak
}

const REFERRAL_CONFIG: ReferralRewards = {
  referrerPoints: 100, // Referrer dapat 100 points
  refereeDiscount: 10, // Referee dapat 10% diskon di order pertama
  refereePoints: 50, // Referee dapat 50 points bonus
};

interface ReferralCode {
  code: string;
  customerId: string;
  customerName: string;
  totalReferrals: number;
  totalRewards: number;
  createdAt: Date;
}

interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number; // Referrals yang sudah melakukan order
  totalPointsEarned: number;
  pendingReferrals: number; // Referrals yang belum order
  referralRate: number; // Success rate dalam %
}

class ReferralService {
  /**
   * Generate unique referral code untuk customer
   */
  generateReferralCode(customerName: string): string {
    // Ambil 3 huruf pertama dari nama, uppercase
    const namePrefix = customerName
      .replace(/[^a-zA-Z]/g, '')
      .substring(0, 3)
      .toUpperCase()
      .padEnd(3, 'X');

    // Tambahkan 4 digit random
    const randomDigits = randomBytes(2).toString('hex').substring(0, 4).toUpperCase();

    return `${namePrefix}${randomDigits}`;
  }

  /**
   * Get atau create referral code untuk customer
   */
  async getOrCreateReferralCode(tenantId: string, customerId: string): Promise<ReferralCode> {
    try {
      // Check if customer already has referral code (stored in address field as JSON)
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: {
          id: true,
          name: true,
          address: true,
          createdAt: true,
        },
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      // Parse address field to check for referral data
      let referralData: any = {};
      try {
        if (customer.address) {
          referralData = JSON.parse(customer.address);
        }
      } catch {
        // Address is just plain text, not JSON
      }

      let referralCode = referralData.referralCode;

      // Generate new code if doesn't exist
      if (!referralCode) {
        referralCode = this.generateReferralCode(customer.name);

        // Ensure uniqueness
        let isUnique = false;
        let attempts = 0;
        while (!isUnique && attempts < 10) {
          const existing = await prisma.customer.findFirst({
            where: {
              tenantId,
              address: {
                contains: `"referralCode":"${referralCode}"`,
              },
            },
          });

          if (!existing) {
            isUnique = true;
          } else {
            referralCode = this.generateReferralCode(customer.name);
            attempts++;
          }
        }

        // Save referral code
        referralData.referralCode = referralCode;
        referralData.referralCreatedAt = new Date().toISOString();

        await prisma.customer.update({
          where: { id: customerId },
          data: {
            address: JSON.stringify(referralData),
          },
        });
      }

      // Get referral stats
      const stats = await this.getReferralStats(tenantId, customerId);

      return {
        code: referralCode,
        customerId: customer.id,
        customerName: customer.name,
        totalReferrals: stats.totalReferrals,
        totalRewards: stats.totalPointsEarned,
        createdAt: referralData.referralCreatedAt
          ? new Date(referralData.referralCreatedAt)
          : customer.createdAt,
      };
    } catch (error: any) {
      logger.error('Error getting/creating referral code:', error);
      throw error;
    }
  }

  /**
   * Apply referral code saat customer baru register
   */
  async applyReferralCode(
    tenantId: string,
    newCustomerId: string,
    referralCode: string
  ): Promise<{ success: boolean; referrerId?: string; referrerName?: string; message: string }> {
    try {
      // Find referrer by code
      const referrer = await prisma.customer.findFirst({
        where: {
          tenantId,
          address: {
            contains: `"referralCode":"${referralCode}"`,
          },
        },
        select: {
          id: true,
          name: true,
          address: true,
        },
      });

      if (!referrer) {
        return {
          success: false,
          message: 'Kode referral tidak valid',
        };
      }

      // Cannot refer yourself
      if (referrer.id === newCustomerId) {
        return {
          success: false,
          message: 'Tidak dapat menggunakan kode referral sendiri',
        };
      }

      // Check if new customer already used a referral code
      const newCustomer = await prisma.customer.findUnique({
        where: { id: newCustomerId },
        select: { address: true },
      });

      if (!newCustomer) {
        return {
          success: false,
          message: 'Customer tidak ditemukan',
        };
      }

      let newCustomerData: any = {};
      try {
        if (newCustomer.address) {
          newCustomerData = JSON.parse(newCustomer.address);
        }
      } catch {
        // Address is plain text
      }

      if (newCustomerData.referredBy) {
        return {
          success: false,
          message: 'Sudah pernah menggunakan kode referral',
        };
      }

      // Save referral relationship
      newCustomerData.referredBy = referrer.id;
      newCustomerData.referredByCode = referralCode;
      newCustomerData.referredAt = new Date().toISOString();

      await prisma.customer.update({
        where: { id: newCustomerId },
        data: {
          address: JSON.stringify(newCustomerData),
          loyaltyPoints: {
            increment: REFERRAL_CONFIG.refereePoints,
          },
        },
      });

      // Track referral in referrer's data
      let referrerData: any = {};
      try {
        if (referrer.address) {
          referrerData = JSON.parse(referrer.address);
        }
      } catch {
        // Address is plain text
      }

      if (!referrerData.referrals) {
        referrerData.referrals = [];
      }

      referrerData.referrals.push({
        customerId: newCustomerId,
        referredAt: new Date().toISOString(),
        rewarded: false, // Will be set to true after first order
      });

      await prisma.customer.update({
        where: { id: referrer.id },
        data: {
          address: JSON.stringify(referrerData),
        },
      });

      logger.info(`Referral applied: ${referrer.name} referred new customer ${newCustomerId}`);

      return {
        success: true,
        referrerId: referrer.id,
        referrerName: referrer.name,
        message: `Selamat! Anda mendapat ${REFERRAL_CONFIG.refereePoints} bonus points dan ${REFERRAL_CONFIG.refereeDiscount}% diskon di order pertama!`,
      };
    } catch (error: any) {
      logger.error('Error applying referral code:', error);
      throw error;
    }
  }

  /**
   * Process referral reward setelah referee melakukan order pertama
   */
  async processReferralReward(tenantId: string, customerId: string): Promise<void> {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: { address: true },
      });

      if (!customer) {
        return;
      }

      let customerData: any = {};
      try {
        if (customer.address) {
          customerData = JSON.parse(customer.address);
        }
      } catch {
        return;
      }

      // Check if customer was referred and reward not yet given
      if (!customerData.referredBy || customerData.referralRewardGiven) {
        return;
      }

      const referrerId = customerData.referredBy;

      // Award points to referrer
      await prisma.customer.update({
        where: { id: referrerId },
        data: {
          loyaltyPoints: {
            increment: REFERRAL_CONFIG.referrerPoints,
          },
        },
      });

      // Mark reward as given
      customerData.referralRewardGiven = true;
      customerData.referralRewardAt = new Date().toISOString();

      await prisma.customer.update({
        where: { id: customerId },
        data: {
          address: JSON.stringify(customerData),
        },
      });

      // Update referrer's referral data
      const referrer = await prisma.customer.findUnique({
        where: { id: referrerId },
        select: { address: true },
      });

      if (referrer) {
        let referrerData: any = {};
        try {
          if (referrer.address) {
            referrerData = JSON.parse(referrer.address);
          }
        } catch {
          return;
        }

        if (referrerData.referrals && Array.isArray(referrerData.referrals)) {
          const referralIndex = referrerData.referrals.findIndex(
            (r: any) => r.customerId === customerId
          );

          if (referralIndex !== -1) {
            referrerData.referrals[referralIndex].rewarded = true;
            referrerData.referrals[referralIndex].rewardedAt = new Date().toISOString();

            await prisma.customer.update({
              where: { id: referrerId },
              data: {
                address: JSON.stringify(referrerData),
              },
            });
          }
        }
      }

      logger.info(`Referral reward processed: Referrer ${referrerId} earned ${REFERRAL_CONFIG.referrerPoints} points`);
    } catch (error: any) {
      logger.error('Error processing referral reward:', error);
    }
  }

  /**
   * Get referral stats untuk customer
   */
  async getReferralStats(tenantId: string, customerId: string): Promise<ReferralStats> {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: { address: true, loyaltyPoints: true },
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      let customerData: any = {};
      try {
        if (customer.address) {
          customerData = JSON.parse(customer.address);
        }
      } catch {
        // No referral data
      }

      const referrals = customerData.referrals || [];
      const totalReferrals = referrals.length;
      const successfulReferrals = referrals.filter((r: any) => r.rewarded).length;
      const pendingReferrals = totalReferrals - successfulReferrals;
      const totalPointsEarned = successfulReferrals * REFERRAL_CONFIG.referrerPoints;
      const referralRate = totalReferrals > 0 ? (successfulReferrals / totalReferrals) * 100 : 0;

      return {
        totalReferrals,
        successfulReferrals,
        totalPointsEarned,
        pendingReferrals,
        referralRate,
      };
    } catch (error: any) {
      logger.error('Error getting referral stats:', error);
      throw error;
    }
  }

  /**
   * Get referral discount untuk first order
   */
  async getReferralDiscount(customerId: string): Promise<number> {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: { address: true },
      });

      if (!customer) {
        return 0;
      }

      let customerData: any = {};
      try {
        if (customer.address) {
          customerData = JSON.parse(customer.address);
        }
      } catch {
        return 0;
      }

      // Check if referred and hasn't used discount yet
      if (customerData.referredBy && !customerData.referralRewardGiven) {
        return REFERRAL_CONFIG.refereeDiscount;
      }

      return 0;
    } catch (error: any) {
      logger.error('Error getting referral discount:', error);
      return 0;
    }
  }

  /**
   * Get referral leaderboard
   */
  async getReferralLeaderboard(tenantId: string, limit: number = 10) {
    try {
      // Get all customers with referrals
      const customers = await prisma.customer.findMany({
        where: {
          tenantId,
          address: {
            contains: '"referrals"',
          },
        },
        select: {
          id: true,
          name: true,
          address: true,
          loyaltyPoints: true,
        },
      });

      const leaderboard = customers
        .map(customer => {
          let customerData: any = {};
          try {
            if (customer.address) {
              customerData = JSON.parse(customer.address);
            }
          } catch {
            return null;
          }

          const referrals = customerData.referrals || [];
          const successfulReferrals = referrals.filter((r: any) => r.rewarded).length;

          return {
            customerId: customer.id,
            customerName: customer.name,
            referralCode: customerData.referralCode || '',
            totalReferrals: referrals.length,
            successfulReferrals,
            totalPoints: customer.loyaltyPoints,
            referralPoints: successfulReferrals * REFERRAL_CONFIG.referrerPoints,
          };
        })
        .filter(item => item !== null)
        .sort((a, b) => b!.successfulReferrals - a!.successfulReferrals)
        .slice(0, limit);

      return leaderboard;
    } catch (error: any) {
      logger.error('Error getting referral leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get referral config
   */
  getReferralConfig(): ReferralRewards {
    return REFERRAL_CONFIG;
  }
}

export default new ReferralService();
