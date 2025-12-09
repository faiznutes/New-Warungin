/**
 * Telegram Service
 * Handles Telegram Bot messaging for customer notifications and engagement
 */

import axios from 'axios';
import logger from '../utils/logger';

interface TelegramConfig {
  botToken: string;
  enabled: boolean;
}

interface SendTelegramInput {
  chatId: string | number; // Telegram chat ID
  message: string;
  parseMode?: 'Markdown' | 'HTML';
  disableNotification?: boolean;
  replyMarkup?: any; // Inline keyboard or reply keyboard
}

interface TelegramResponse {
  success: boolean;
  messageId?: number;
  error?: string;
}

interface TelegramUser {
  chatId: number;
  firstName: string;
  lastName?: string;
  username?: string;
}

class TelegramService {
  private config: TelegramConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      botToken: process.env.TELEGRAM_BOT_TOKEN || '',
      enabled: process.env.TELEGRAM_ENABLED === 'true',
    };

    this.baseUrl = this.config.botToken
      ? `https://api.telegram.org/bot${this.config.botToken}`
      : '';
  }

  /**
   * Check if Telegram is properly configured
   */
  isConfigured(): boolean {
    return this.config.enabled && this.config.botToken !== '';
  }

  /**
   * Send message via Telegram Bot API
   */
  async sendMessage(input: SendTelegramInput): Promise<TelegramResponse> {
    if (!this.isConfigured()) {
      logger.warn('Telegram not configured, skipping message send');
      return {
        success: false,
        error: 'Telegram not configured',
      };
    }

    try {
      const url = `${this.baseUrl}/sendMessage`;

      const payload: any = {
        chat_id: input.chatId,
        text: input.message,
        parse_mode: input.parseMode || 'Markdown',
      };

      if (input.disableNotification) {
        payload.disable_notification = true;
      }

      if (input.replyMarkup) {
        payload.reply_markup = JSON.stringify(input.replyMarkup);
      }

      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      if (response.data.ok) {
        return {
          success: true,
          messageId: response.data.result.message_id,
        };
      } else {
        throw new Error(response.data.description || 'Failed to send message');
      }
    } catch (error: any) {
      logger.error('Telegram send failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to send Telegram message',
      };
    }
  }

  /**
   * Send order notification
   */
  async sendOrderNotification(
    chatId: string | number,
    orderNumber: string,
    customerName: string,
    total: number,
    status: string
  ): Promise<TelegramResponse> {
    const statusEmoji = status === 'confirmed' ? '✅' : status === 'processing' ? '⏳' : '📦';
    
    const message = `${statusEmoji} *Notifikasi Order*\n\n` +
      `Halo ${customerName}!\n\n` +
      `Order Anda *#${orderNumber}* telah ${status}.\n` +
      `Total: *Rp ${total.toLocaleString('id-ID')}*\n\n` +
      `Terima kasih telah berbelanja! 🙏`;

    return await this.sendMessage({
      chatId,
      message,
      parseMode: 'Markdown',
    });
  }

  /**
   * Send delivery notification
   */
  async sendDeliveryNotification(
    chatId: string | number,
    orderNumber: string,
    trackingUrl?: string
  ): Promise<TelegramResponse> {
    let message = `🚚 *Pesanan Dalam Perjalanan*\n\n` +
      `Pesanan Anda *#${orderNumber}* sedang dalam perjalanan!\n\n`;
    
    if (trackingUrl) {
      message += `[Lacak Pesanan](${trackingUrl})\n\n`;
    }
    
    message += `Terima kasih telah menunggu! 😊`;

    const replyMarkup = trackingUrl ? {
      inline_keyboard: [
        [
          {
            text: '📍 Lacak Pesanan',
            url: trackingUrl,
          },
        ],
      ],
    } : undefined;

    return await this.sendMessage({
      chatId,
      message,
      parseMode: 'Markdown',
      replyMarkup,
    });
  }

  /**
   * Send promotion notification
   */
  async sendPromotion(
    chatId: string | number,
    customerName: string,
    promoTitle: string,
    promoDescription: string,
    discountCode?: string,
    ctaUrl?: string
  ): Promise<TelegramResponse> {
    let message = `🎉 *Promo Spesial untuk ${customerName}!*\n\n` +
      `*${promoTitle}*\n\n` +
      `${promoDescription}\n\n`;
    
    if (discountCode) {
      message += `Gunakan kode: \`${discountCode}\`\n\n`;
    }
    
    message += `Jangan lewatkan kesempatan ini! 🛍️`;

    const replyMarkup = ctaUrl ? {
      inline_keyboard: [
        [
          {
            text: '🛒 Belanja Sekarang',
            url: ctaUrl,
          },
        ],
      ],
    } : undefined;

    return await this.sendMessage({
      chatId,
      message,
      parseMode: 'Markdown',
      replyMarkup,
    });
  }

  /**
   * Send loyalty tier upgrade notification
   */
  async sendTierUpgradeNotification(
    chatId: string | number,
    customerName: string,
    newTier: string,
    benefits: string[]
  ): Promise<TelegramResponse> {
    const benefitsList = benefits.map(b => `• ${b}`).join('\n');
    
    const message = `🎊 *Selamat ${customerName}!*\n\n` +
      `Anda telah naik ke tier *${newTier}*!\n\n` +
      `*Benefit yang Anda dapatkan:*\n${benefitsList}\n\n` +
      `Terima kasih atas loyalitas Anda! 🙏`;

    return await this.sendMessage({
      chatId,
      message,
      parseMode: 'Markdown',
    });
  }

  /**
   * Send referral invitation
   */
  async sendReferralInvitation(
    chatId: string | number,
    referrerName: string,
    referralCode: string,
    benefits: string[],
    registrationUrl?: string
  ): Promise<TelegramResponse> {
    const benefitsList = benefits.map(b => `• ${b}`).join('\n');
    
    const message = `👋 *Undangan dari ${referrerName}!*\n\n` +
      `Bergabunglah menggunakan kode referral: \`${referralCode}\`\n\n` +
      `*Dapatkan:*\n${benefitsList}\n\n` +
      `Daftar sekarang dan nikmati benefitnya! 🎁`;

    const replyMarkup = registrationUrl ? {
      inline_keyboard: [
        [
          {
            text: '📝 Daftar Sekarang',
            url: registrationUrl,
          },
        ],
      ],
    } : undefined;

    return await this.sendMessage({
      chatId,
      message,
      parseMode: 'Markdown',
      replyMarkup,
    });
  }

  /**
   * Send points balance update
   */
  async sendPointsUpdate(
    chatId: string | number,
    customerName: string,
    pointsEarned: number,
    totalPoints: number,
    reason: string
  ): Promise<TelegramResponse> {
    const message = `💎 *Update Points*\n\n` +
      `Halo ${customerName}!\n\n` +
      `Anda mendapat *+${pointsEarned} points* ${reason}\n\n` +
      `Total points Anda: *${totalPoints} points*\n\n` +
      `Tukarkan points Anda dengan reward menarik! 🎁`;

    return await this.sendMessage({
      chatId,
      message,
      parseMode: 'Markdown',
    });
  }

  /**
   * Send birthday greeting
   */
  async sendBirthdayGreeting(
    chatId: string | number,
    customerName: string,
    bonusPoints?: number,
    discountCode?: string
  ): Promise<TelegramResponse> {
    let message = `🎂 *Selamat Ulang Tahun ${customerName}!*\n\n` +
      `Semoga hari Anda penuh kebahagiaan! 🎉\n\n`;
    
    if (bonusPoints) {
      message += `Kami berikan bonus *${bonusPoints} points* untuk Anda!\n\n`;
    }
    
    if (discountCode) {
      message += `Plus diskon spesial dengan kode: \`${discountCode}\`\n\n`;
    }
    
    message += `Terima kasih sudah menjadi bagian dari keluarga kami! 💙`;

    return await this.sendMessage({
      chatId,
      message,
      parseMode: 'Markdown',
    });
  }

  /**
   * Send feedback request
   */
  async sendFeedbackRequest(
    chatId: string | number,
    orderNumber: string,
    feedbackUrl?: string
  ): Promise<TelegramResponse> {
    const message = `⭐ *Bagaimana Pengalaman Anda?*\n\n` +
      `Terima kasih sudah berbelanja (Order #${orderNumber})!\n\n` +
      `Kami sangat menghargai feedback Anda untuk meningkatkan layanan kami. 🙏`;

    const replyMarkup = feedbackUrl ? {
      inline_keyboard: [
        [
          { text: '⭐⭐⭐⭐⭐', callback_data: `rate_5_${orderNumber}` },
        ],
        [
          { text: '⭐⭐⭐⭐', callback_data: `rate_4_${orderNumber}` },
          { text: '⭐⭐⭐', callback_data: `rate_3_${orderNumber}` },
        ],
        [
          { text: '⭐⭐', callback_data: `rate_2_${orderNumber}` },
          { text: '⭐', callback_data: `rate_1_${orderNumber}` },
        ],
        [
          {
            text: '📝 Tulis Review',
            url: feedbackUrl,
          },
        ],
      ],
    } : {
      inline_keyboard: [
        [
          { text: '⭐⭐⭐⭐⭐', callback_data: `rate_5_${orderNumber}` },
        ],
        [
          { text: '⭐⭐⭐⭐', callback_data: `rate_4_${orderNumber}` },
          { text: '⭐⭐⭐', callback_data: `rate_3_${orderNumber}` },
        ],
        [
          { text: '⭐⭐', callback_data: `rate_2_${orderNumber}` },
          { text: '⭐', callback_data: `rate_1_${orderNumber}` },
        ],
      ],
    };

    return await this.sendMessage({
      chatId,
      message,
      parseMode: 'Markdown',
      replyMarkup,
    });
  }

  /**
   * Get bot info
   */
  async getBotInfo(): Promise<{ success: boolean; botInfo?: any; error?: string }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Telegram not configured',
      };
    }

    try {
      const url = `${this.baseUrl}/getMe`;
      const response = await axios.get(url);

      if (response.data.ok) {
        return {
          success: true,
          botInfo: response.data.result,
        };
      } else {
        throw new Error(response.data.description || 'Failed to get bot info');
      }
    } catch (error: any) {
      logger.error('Failed to get Telegram bot info:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Check Telegram service health
   */
  async checkHealth(): Promise<{ healthy: boolean; configured: boolean; botInfo?: any }> {
    if (!this.isConfigured()) {
      return {
        healthy: false,
        configured: false,
      };
    }

    const botInfo = await this.getBotInfo();
    
    return {
      healthy: botInfo.success,
      configured: true,
      botInfo: botInfo.botInfo,
    };
  }
}

export default new TelegramService();
