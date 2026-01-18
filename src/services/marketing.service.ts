import prisma from '../config/database';
import { sendEmail } from '../config/email';
import logger from '../utils/logger';
import smsGatewayService from './sms-gateway.service';
import pushNotificationService from './push-notification.service';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  targetCount: number;
  sentCount?: number;
  opens?: number;
  clicks?: number;
  conversions?: number;
  createdAt?: Date;
  sentAt?: Date;
}

interface CreateCampaignInput {
  name: string;
  type: 'SMS' | 'EMAIL' | 'WHATSAPP' | 'PROMO' | 'PUSH';
  target: 'ALL' | 'MEMBERS' | 'ACTIVE' | 'INACTIVE';
  content: string;
  promoCode?: string;
  subject?: string; // For email campaigns
  campaignId?: string; // Optional campaign ID
}

interface CreatePromoInput {
  name: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  code: string;
  startDate: string;
  endDate: string;
}

class MarketingService {
  async getCampaigns(tenantId: string): Promise<Campaign[]> {
    try {
      const campaigns = await prisma.marketingCampaign.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
      });

      return campaigns;
    } catch (error: any) {
      logger.error('Error fetching campaigns:', error);
      return [];
    }
  }

  async createCampaign(tenantId: string, data: CreateCampaignInput): Promise<Campaign> {
    try {
      const targetCount = await this.getTargetCount(tenantId, data.target);

      const campaign = await prisma.marketingCampaign.create({
        data: {
          tenantId,
          name: data.name,
          type: data.type,
          status: 'DRAFT',
          targetCount,
          sentCount: 0,
          targetCriteria: data.target ? JSON.stringify(data.target) : undefined,
        },
      });

      return campaign;
    } catch (error: any) {
      logger.error('Error creating campaign:', error);
      throw error;
    }
  }

  async sendCampaign(
    tenantId: string,
    campaignId: string,
    campaignData?: CreateCampaignInput
  ): Promise<any> {
    try {
      let data = campaignData;

      // If campaignData not provided, fetch from database
      if (!data) {
        const campaign = await prisma.marketingCampaign.findUnique({
          where: { id: campaignId },
        });

        if (!campaign) {
          logger.warn(`Campaign ${campaignId} not found`);
          return {
            campaignId,
            status: 'FAILED',
            sentAt: new Date(),
            sentCount: 0,
            failedCount: 0,
          };
        }

        data = {
          name: campaign.name,
          type: campaign.type as any,
          content: campaign.content || '',
          subject: campaign.subject || undefined,
          target: campaign.targetCriteria ? JSON.parse(String(campaign.targetCriteria)) : 'ALL',
        };
      }

      if (!data) {
        logger.error(`Campaign data not found for ${campaignId}`);
        return {
          campaignId,
          status: 'FAILED',
          sentAt: new Date(),
          sentCount: 0,
          failedCount: 0,
        };
      }

      let result: { sent: number; failed: number };

      switch (data.type) {
        case 'EMAIL':
          result = await this.sendEmailCampaign(tenantId, {
            name: data.name,
            content: data.content,
            subject: data.subject || data.name,
            target: data.target,
          });
          break;

        case 'SMS':
          result = await this.sendSMSCampaign(tenantId, {
            name: data.name,
            content: data.content,
            target: data.target,
          });
          break;

        case 'WHATSAPP':
          // WhatsApp integration - similar to SMS
          result = await this.sendSMSCampaign(tenantId, {
            name: data.name,
            content: data.content,
            target: data.target,
          });
          break;

        case 'PUSH':
          // Push notification campaigns via push notification service
          result = await this.sendPushNotificationCampaign(tenantId, {
            name: data.name,
            content: data.content,
            title: data.subject || data.name,
            target: data.target,
          });
          break;

        case 'PROMO':
          // Promo campaigns can be sent via email or SMS
          // Default to email for now
          result = await this.sendEmailCampaign(tenantId, {
            name: data.name,
            content: data.content,
            subject: data.subject || data.name,
            target: data.target,
          });
          break;

        default:
          logger.error(`Unsupported campaign type: ${data.type}`);
          return {
            campaignId,
            status: 'FAILED',
            sentAt: new Date(),
            sentCount: 0,
            failedCount: 0,
          };
      }

      // Update campaign status in database
      await prisma.marketingCampaign.update({
        where: { id: campaignId },
        data: {
          status: 'SENT',
          sentCount: result.sent,
        },
      });

      logger.info(`Campaign ${campaignId} (${data.type}) sent: ${result.sent} sent, ${result.failed} failed`);

      return {
        campaignId,
        status: 'SENT',
        sentAt: new Date(),
        sentCount: result.sent,
        failedCount: result.failed,
      };
    } catch (error: any) {
      logger.error('Error sending campaign:', error);
      throw error;
    }
  }

  /**
   * Send SMS campaign to target customers
   */
  async sendSMSCampaign(
    tenantId: string,
    campaign: { name: string; content: string; target: string }
  ): Promise<{ sent: number; failed: number }> {
    const customers = await this.getTargetCustomers(tenantId, campaign.target);
    let sent = 0;
    let failed = 0;

    // In production, integrate with SMS gateway (Twilio, etc.)
    // For now, this is a placeholder structure
    logger.info(`SMS Campaign: ${campaign.name} - Target: ${customers.length} customers`);

    // Send SMS in batches to avoid overwhelming the SMS gateway
    const batchSize = 10;
    for (let i = 0; i < customers.length; i += batchSize) {
      const batch = customers.slice(i, i + batchSize);

      await Promise.allSettled(
        batch.map(async (customer: { id: string; email?: string | null; name: string; phone?: string | null }) => {
          try {
            if (customer.phone) {
              // Format phone number (remove +, spaces, etc.)
              const phoneNumber = customer.phone.replace(/[+\s-]/g, '');

              // Add country code if not present (assume Indonesia +62)
              const formattedPhone = phoneNumber.startsWith('62')
                ? `+${phoneNumber}`
                : phoneNumber.startsWith('0')
                  ? `+62${phoneNumber.substring(1)}`
                  : `+62${phoneNumber}`;

              const result = await smsGatewayService.sendSMS({
                to: formattedPhone,
                message: campaign.content,
              });

              if (result.success) {
                sent++;
                logger.info(`SMS sent to ${formattedPhone} for campaign: ${campaign.name}`, {
                  messageId: result.messageId,
                });
              } else {
                failed++;
                logger.error(`Failed to send SMS to ${formattedPhone}:`, result.error);
              }
            }
          } catch (error: any) {
            failed++;
            logger.error(`Failed to send SMS to ${customer.phone}:`, error);
          }
        })
      );

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < customers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return { sent, failed };
  }

  /**
   * Send push notification to target customers
   */
  async sendPushNotificationCampaign(
    tenantId: string,
    campaign: { name: string; content: string; target: string; title?: string }
  ): Promise<{ sent: number; failed: number }> {
    const customers = await this.getTargetCustomers(tenantId, campaign.target);
    let sent = 0;
    let failed = 0;

    logger.info(`Push Notification Campaign: ${campaign.name} - Target: ${customers.length} customers`);

    // Send push notifications in batches
    const batchSize = 10;
    for (let i = 0; i < customers.length; i += batchSize) {
      const batch = customers.slice(i, i + batchSize);

      await Promise.allSettled(
        batch.map(async (customer: { id: string; email?: string | null; name: string; phone?: string | null }) => {
          try {
            const result = await pushNotificationService.sendPush({
              to: customer.id,
              title: campaign.title || campaign.name,
              message: campaign.content,
            });

            if (result.success) {
              sent++;
              logger.info(`Push notification sent to customer ${customer.id} for campaign: ${campaign.name}`, {
                messageId: result.messageId,
              });
            } else {
              failed++;
              logger.error(`Failed to send push notification to customer ${customer.id}:`, result.error);
            }
          } catch (error: any) {
            failed++;
            logger.error(`Failed to send push notification to customer ${customer.id}:`, error);
          }
        })
      );

      // Small delay between batches to avoid overwhelming push service
      if (i + batchSize < customers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return { sent, failed };
  }

  /**
   * Send email campaign to target customers
   */
  async sendEmailCampaign(
    tenantId: string,
    campaign: { name: string; content: string; subject?: string; target: string }
  ): Promise<{ sent: number; failed: number }> {
    const customers = await this.getTargetCustomers(tenantId, campaign.target);
    let sent = 0;
    let failed = 0;

    // Convert content to HTML if it's plain text
    const htmlContent = campaign.content.includes('<html>')
      ? campaign.content
      : `<html><body><p>${campaign.content.replace(/\n/g, '<br>')}</p></body></html>`;

    const subject = campaign.subject || campaign.name;

    // Send emails in batches to avoid overwhelming the email server
    const batchSize = 10;
    for (let i = 0; i < customers.length; i += batchSize) {
      const batch = customers.slice(i, i + batchSize);

      await Promise.allSettled(
        batch.map(async (customer: { id: string; email?: string | null; name: string; phone?: string | null }) => {
          try {
            if (customer.email) {
              await sendEmail(customer.email, subject, htmlContent);
              sent++;
              logger.info(`Email sent to ${customer.email} for campaign: ${campaign.name}`);
            }
          } catch (error: any) {
            failed++;
            logger.error(`Failed to send email to ${customer.email}:`, error);
          }
        })
      );

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < customers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return { sent, failed };
  }

  /**
   * Get target customers based on target type
   */
  private async getTargetCustomers(tenantId: string, target: string) {
    switch (target) {
      case 'ALL':
        return await prisma.customer.findMany({
          where: { tenantId },
          select: { id: true, email: true, name: true, phone: true },
        });
      case 'MEMBERS':
        return await prisma.member.findMany({
          where: { tenantId, isActive: true },
        }).then((members: Array<{ id: string; email?: string | null; name: string; phone?: string | null }>) =>
          members.map((m: { id: string; email?: string | null; name: string; phone?: string | null }) => ({
            id: m.id,
            email: m.email || null,
            name: m.name,
            phone: m.phone,
          }))
        );
      case 'ACTIVE': {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const activeOrderCustomers = await prisma.order.findMany({
          where: {
            tenantId,
            createdAt: { gte: thirtyDaysAgo },
          },
          distinct: ['customerId'],
          select: { customerId: true },
        });
        const activeCustomerIds = activeOrderCustomers
          .map((o: { customerId: string | null }) => o.customerId)
          .filter((id: string | null): id is string => id !== null);

        return await prisma.customer.findMany({
          where: {
            tenantId,
            id: { in: activeCustomerIds },
          },
          select: { id: true, email: true, name: true, phone: true },
        });
      }
      case 'INACTIVE': {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        const recentOrderCustomers = await prisma.order.findMany({
          where: {
            tenantId,
            createdAt: { gte: ninetyDaysAgo },
          },
          distinct: ['customerId'],
          select: { customerId: true },
        });
        const recentCustomerIds = recentOrderCustomers
          .map((o: { customerId: string | null }) => o.customerId)
          .filter((id: string | null): id is string => id !== null);

        return await prisma.customer.findMany({
          where: {
            tenantId,
            id: { notIn: recentCustomerIds },
          },
          select: { id: true, email: true, name: true, phone: true },
        });
      }
      default:
        return [];
    }
  }

  async createPromo(tenantId: string, data: CreatePromoInput): Promise<any> {
    try {
      const promo = await prisma.promotion.create({
        data: {
          tenantId,
          ...data,
        },
      });

      logger.info('Promotion created:', { id: promo.id, name: data.name });
      return promo;
    } catch (error: any) {
      logger.error('Error creating promotion:', error);
      throw error;
    }
  }

  /**
   * Get campaign analytics/performance
   */
  async getCampaignAnalytics(tenantId: string, campaignId?: string): Promise<any> {
    try {
      if (campaignId) {
        // Get analytics for specific campaign
        const campaign = await prisma.marketingCampaign.findUnique({
          where: { id: campaignId },
        });

        if (!campaign) {
          return {
            campaignId,
            error: 'Campaign not found',
          };
        }

        return {
          campaignId,
          name: campaign.name,
          type: campaign.type,
          sentCount: campaign.sentCount || 0,
          status: campaign.status,
          createdAt: campaign.createdAt,
        };
      }

      // Get overall campaign analytics
      const campaigns = await this.getCampaigns(tenantId);

      const totalSent = campaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0);

      return {
        totalCampaigns: campaigns.length,
        totalSent,
        campaigns: campaigns.map(c => ({
          id: c.id,
          name: c.name,
          type: c.type,
          sentCount: c.sentCount || 0,
          opens: (c as any).opens || 0,
          clicks: (c as any).clicks || 0,
          conversions: (c as any).conversions || 0,
          openRate: (c.sentCount || 0) > 0 ? (((c as any).opens || 0) / (c.sentCount || 0)) * 100 : 0,
          clickRate: (c.sentCount || 0) > 0 ? (((c as any).clicks || 0) / (c.sentCount || 0)) * 100 : 0,
        })),
      };
    } catch (error: any) {
      logger.error('Error getting campaign analytics:', error);
      throw error;
    }
  }

  /**
   * Calculate ROI for a campaign
   * ROI = (Revenue Generated - Campaign Cost) / Campaign Cost * 100
   */
  async calculateCampaignROI(tenantId: string, campaignId: string): Promise<number> {
    try {
      const campaigns = await this.getCampaigns(tenantId);
      const campaign = campaigns.find(c => c.id === campaignId);

      if (!campaign) {
        return 0;
      }

      // Campaign cost calculation (SMS: 100/msg, Email: 0 cost, others: 100 base)
      let campaignCost = 0;
      if (campaign.type === 'SMS') {
        campaignCost = (campaign.sentCount || 0) * 100; // 100 per SMS
      } else if (campaign.type === 'EMAIL') {
        campaignCost = 0; // No per-email cost (flat rate)
      } else {
        campaignCost = 1000; // Base cost for other campaigns
      }

      // Estimate revenue from campaign (0.5% conversion rate * average order value)
      // This is a conservative estimate without actual tracking
      const averageOrderValue = 100000; // 100k average order value
      const estimatedConversionRate = 0.005; // 0.5% conservative estimate
      const estimatedRevenue = (campaign.sentCount || 0) * estimatedConversionRate * averageOrderValue;

      if (campaignCost === 0) {
        // For free channels, ROI is calculated as revenue / 1000 base cost
        return (estimatedRevenue / 1000) * 100;
      }

      return ((estimatedRevenue - campaignCost) / campaignCost) * 100;
    } catch (error: any) {
      logger.error('Error calculating campaign ROI:', error);
      return 0;
    }
  }

  private async getTargetCount(tenantId: string, target: string): Promise<number> {
    switch (target) {
      case 'ALL':
        return await prisma.customer.count({ where: { tenantId } });
      case 'MEMBERS':
        return await prisma.member.count({ where: { tenantId, isActive: true } });
      case 'ACTIVE': {
        // Customers with orders in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const activeCustomers = await prisma.order.findMany({
          where: {
            tenantId,
            createdAt: { gte: thirtyDaysAgo },
          },
          distinct: ['customerId'],
        });
        return activeCustomers.length;
      }
      case 'INACTIVE': {
        // Customers without orders in last 90 days
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        const allCustomers = await prisma.customer.count({ where: { tenantId } });
        const inactiveCustomers = await prisma.order.findMany({
          where: {
            tenantId,
            createdAt: { gte: ninetyDaysAgo },
          },
          distinct: ['customerId'],
        });
        return allCustomers - inactiveCustomers.length;
      }
      default:
        return 0;
    }
  }
}

export default new MarketingService();

