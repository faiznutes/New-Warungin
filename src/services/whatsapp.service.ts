/**
 * WhatsApp Service
 * Handles WhatsApp messaging via WhatsApp Business API (Twilio, WABA, or other providers)
 */

import axios from 'axios';
import logger from '../utils/logger';

interface WhatsAppConfig {
  provider: 'TWILIO' | 'WABA' | 'FONNTE' | 'MOCK';
  accountSid?: string; // For Twilio
  authToken?: string; // For Twilio
  phoneNumberId?: string; // For WABA (WhatsApp Business API)
  accessToken?: string; // For WABA
  apiKey?: string; // For Fonnte or other providers
  fromNumber: string; // WhatsApp Business Number
}

interface SendWhatsAppInput {
  to: string; // Phone number with country code (e.g., +6281234567890)
  message: string;
  type?: 'text' | 'template' | 'media';
  templateName?: string;
  templateParams?: Record<string, string>;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'document';
}

interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  status?: string;
  error?: string;
}

class WhatsAppService {
  private config: WhatsAppConfig;

  constructor() {
    // Load config from environment variables - must explicitly set WHATSAPP_PROVIDER
    const provider = process.env.WHATSAPP_PROVIDER as 'TWILIO' | 'WABA' | 'FONNTE' | 'MOCK' | undefined;
    
    // If no provider is set, validate required credentials based on what we detect
    if (!provider) {
      // Check which credentials are available and auto-detect provider
      if (process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
        // Auto-detect WABA (WhatsApp Business API)
        logger.warn('Auto-detecting WhatsApp provider as WABA. Set WHATSAPP_PROVIDER env var explicitly to avoid auto-detection.');
      } else if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        logger.warn('Auto-detecting WhatsApp provider as TWILIO. Set WHATSAPP_PROVIDER env var explicitly to avoid auto-detection.');
      } else if (process.env.WHATSAPP_API_KEY) {
        logger.warn('Auto-detecting WhatsApp provider as FONNTE. Set WHATSAPP_PROVIDER env var explicitly to avoid auto-detection.');
      }
    }
    
    this.config = {
      provider: provider || 'MOCK',
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
      apiKey: process.env.WHATSAPP_API_KEY,
      fromNumber: process.env.WHATSAPP_FROM_NUMBER || '+6281234567890',
    };
  }

  /**
   * Send WhatsApp message via configured provider
   */
  async sendMessage(input: SendWhatsAppInput): Promise<WhatsAppResponse> {
    try {
      switch (this.config.provider) {
        case 'TWILIO':
          return await this.sendViaTwilio(input);
        case 'WABA':
          return await this.sendViaWABA(input);
        case 'FONNTE':
          return await this.sendViaFonnte(input);
        case 'MOCK':
          return await this.sendViaMock(input);
        default:
          throw new Error(`Unsupported WhatsApp provider: ${this.config.provider}`);
      }
    } catch (error: any) {
      logger.error('WhatsApp send failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to send WhatsApp message',
      };
    }
  }

  /**
   * Send via Twilio
   */
  private async sendViaTwilio(input: SendWhatsAppInput): Promise<WhatsAppResponse> {
    if (!this.config.accountSid || !this.config.authToken) {
      throw new Error('Twilio credentials not configured');
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.config.accountSid}/Messages.json`;
    
    const data = new URLSearchParams();
    data.append('From', `whatsapp:${this.config.fromNumber}`);
    data.append('To', `whatsapp:${input.to}`);
    data.append('Body', input.message);

    if (input.mediaUrl) {
      data.append('MediaUrl', input.mediaUrl);
    }

    const response = await axios.post(url, data, {
      auth: {
        username: this.config.accountSid,
        password: this.config.authToken,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return {
      success: true,
      messageId: response.data.sid,
      status: response.data.status,
    };
  }

  /**
   * Send via WhatsApp Business API (Meta)
   */
  private async sendViaWABA(input: SendWhatsAppInput): Promise<WhatsAppResponse> {
    if (!this.config.phoneNumberId || !this.config.accessToken) {
      throw new Error('WhatsApp Business API credentials not configured');
    }

    const url = `https://graph.facebook.com/v18.0/${this.config.phoneNumberId}/messages`;

    const payload: any = {
      messaging_product: 'whatsapp',
      to: input.to.replace(/[^0-9]/g, ''), // Remove non-numeric characters
      type: input.type || 'text',
    };

    if (input.type === 'template' && input.templateName) {
      payload.template = {
        name: input.templateName,
        language: {
          code: 'id', // Indonesian
        },
        components: input.templateParams
          ? [
              {
                type: 'body',
                parameters: Object.values(input.templateParams).map(value => ({
                  type: 'text',
                  text: value,
                })),
              },
            ]
          : [],
      };
    } else {
      payload.text = {
        body: input.message,
      };
    }

    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      messageId: response.data.messages?.[0]?.id,
      status: 'sent',
    };
  }

  /**
   * Send via Fonnte (Indonesian WhatsApp Gateway)
   */
  private async sendViaFonnte(input: SendWhatsAppInput): Promise<WhatsAppResponse> {
    if (!this.config.apiKey) {
      throw new Error('Fonnte API key not configured');
    }

    const url = 'https://api.fonnte.com/send';

    const payload = {
      target: input.to,
      message: input.message,
      countryCode: '62', // Indonesia
    };

    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': this.config.apiKey,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: response.data.status === 'success',
      messageId: response.data.id,
      status: response.data.status,
    };
  }

  /**
   * Mock send for testing
   */
  private async sendViaMock(input: SendWhatsAppInput): Promise<WhatsAppResponse> {
    logger.info(`[MOCK] WhatsApp message to ${input.to}: ${input.message}`);
    
    return {
      success: true,
      messageId: `mock_${Date.now()}`,
      status: 'sent',
    };
  }

  /**
   * Send order notification
   */
  async sendOrderNotification(
    to: string,
    orderNumber: string,
    customerName: string,
    total: number,
    status: string
  ): Promise<WhatsAppResponse> {
    const message = `Halo ${customerName}! 👋\n\n` +
      `Order Anda #${orderNumber} telah ${status}.\n` +
      `Total: Rp ${total.toLocaleString('id-ID')}\n\n` +
      `Terima kasih telah berbelanja! 🙏`;

    return await this.sendMessage({
      to,
      message,
      type: 'text',
    });
  }

  /**
   * Send delivery notification
   */
  async sendDeliveryNotification(
    to: string,
    orderNumber: string,
    trackingUrl?: string
  ): Promise<WhatsAppResponse> {
    let message = `Pesanan Anda #${orderNumber} sedang dalam perjalanan! 🚚\n\n`;
    
    if (trackingUrl) {
      message += `Lacak pesanan Anda: ${trackingUrl}\n\n`;
    }
    
    message += `Terima kasih telah menunggu! 😊`;

    return await this.sendMessage({
      to,
      message,
      type: 'text',
    });
  }

  /**
   * Send promotion notification
   */
  async sendPromotion(
    to: string,
    customerName: string,
    promoTitle: string,
    promoDescription: string,
    discountCode?: string
  ): Promise<WhatsAppResponse> {
    let message = `Halo ${customerName}! 🎉\n\n` +
      `${promoTitle}\n\n` +
      `${promoDescription}\n\n`;
    
    if (discountCode) {
      message += `Gunakan kode: *${discountCode}*\n\n`;
    }
    
    message += `Jangan lewatkan kesempatan ini! 🛍️`;

    return await this.sendMessage({
      to,
      message,
      type: 'text',
    });
  }

  /**
   * Send loyalty tier upgrade notification
   */
  async sendTierUpgradeNotification(
    to: string,
    customerName: string,
    newTier: string,
    benefits: string
  ): Promise<WhatsAppResponse> {
    const message = `Selamat ${customerName}! 🎊\n\n` +
      `Anda telah naik ke tier *${newTier}*!\n\n` +
      `Benefit yang Anda dapatkan:\n${benefits}\n\n` +
      `Terima kasih atas loyalitas Anda! 🙏`;

    return await this.sendMessage({
      to,
      message,
      type: 'text',
    });
  }

  /**
   * Send referral invitation
   */
  async sendReferralInvitation(
    to: string,
    referrerName: string,
    referralCode: string,
    benefits: string
  ): Promise<WhatsAppResponse> {
    const message = `Halo! 👋\n\n` +
      `${referrerName} mengajak Anda bergabung!\n\n` +
      `Gunakan kode referral: *${referralCode}*\n\n` +
      `Dapatkan:\n${benefits}\n\n` +
      `Daftar sekarang dan nikmati benefitnya! 🎁`;

    return await this.sendMessage({
      to,
      message,
      type: 'text',
    });
  }

  /**
   * Check WhatsApp service health
   */
  async checkHealth(): Promise<{ healthy: boolean; provider: string }> {
    return {
      healthy: true,
      provider: this.config.provider,
    };
  }
}

export default new WhatsAppService();
