/**
 * Payment Gateway Integration Service
 * Handles integration with payment gateways (OVO, DANA, LinkAja)
 */

import axios from 'axios';
import logger from '../utils/logger';
import crypto from 'crypto';
import dataEncryptionService from './data-encryption.service';

interface PaymentGatewayConfig {
  provider: 'OVO' | 'DANA' | 'LINKAJA';
  merchantId: string;
  apiKey: string;
  apiSecret: string;
  baseUrl?: string;
}

interface PaymentRequest {
  amount: number;
  orderId: string;
  customerPhone?: string;
  customerEmail?: string;
  description?: string;
  callbackUrl?: string;
}

interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  qrCode?: string;
  deepLink?: string;
  status?: string;
  error?: string;
}

interface PaymentStatus {
  paymentId: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED';
  amount: number;
  paidAt?: Date;
  error?: string;
}

class PaymentGatewayIntegrationService {
  /**
   * Create payment via OVO
   */
  async createOVOPayment(
    config: PaymentGatewayConfig,
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    logger.info(`Creating OVO payment for order ${request.orderId}`);

    if (!config.merchantId || !config.apiKey || !config.apiSecret) {
      logger.error('OVO API credentials not configured', { orderId: request.orderId });
      return {
        success: false,
        error: 'OVO API credentials not configured',
      };
    }

    const ovoApiUrl = config.baseUrl || 'https://api.ovo.id/v1/payments';
    const timestamp = Date.now().toString();
    const signature = this.generateOVOSignature(config, request, timestamp);
    const ovoRequest = {
      merchant_id: config.merchantId,
      amount: request.amount,
      order_id: request.orderId,
      customer_phone: request.customerPhone,
      description: request.description || `Payment for order ${request.orderId}`,
      callback_url: request.callbackUrl,
      timestamp,
      signature,
    };

    let lastError: any = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await axios.post(ovoApiUrl, ovoRequest, {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': config.apiKey,
          },
          timeout: 10000,
        });
        if (response.data && response.data.payment_id) {
          return {
            success: true,
            paymentId: response.data.payment_id,
            qrCode: response.data.qr_code,
            deepLink: response.data.deep_link,
            status: 'PENDING',
          };
        } else {
          logger.error('Invalid OVO API response', { orderId: request.orderId, response: response.data });
          lastError = new Error('Invalid OVO API response');
        }
      } catch (error: any) {
        logger.error('OVO API error', { orderId: request.orderId, attempt, error: error.message });
        lastError = error;
        // Retry only on network or 5xx errors
        if (error.response && error.response.status < 500) break;
      }
    }
    return {
      success: false,
      error: lastError?.message || 'Failed to create OVO payment',
    };
  }

  /**
   * Create payment via DANA
   */
  async createDANAPayment(
    config: PaymentGatewayConfig,
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    logger.info(`Creating DANA payment for order ${request.orderId}`);

    if (!config.merchantId || !config.apiKey || !config.apiSecret) {
      logger.error('DANA API credentials not configured', { orderId: request.orderId });
      return {
        success: false,
        error: 'DANA API credentials not configured',
      };
    }

    const danaApiUrl = config.baseUrl || 'https://api.dana.id/v1/payments';
    const timestamp = Date.now().toString();
    const signature = this.generateDANASignature(config, request, timestamp);
    const danaRequest = {
      merchant_id: config.merchantId,
      amount: request.amount,
      order_id: request.orderId,
      customer_phone: request.customerPhone,
      description: request.description || `Payment for order ${request.orderId}`,
      callback_url: request.callbackUrl,
      timestamp,
      signature,
    };

    let lastError: any = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await axios.post(danaApiUrl, danaRequest, {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': config.apiKey,
          },
          timeout: 10000,
        });
        if (response.data && response.data.payment_id) {
          return {
            success: true,
            paymentId: response.data.payment_id,
            qrCode: response.data.qr_code,
            deepLink: response.data.deep_link,
            status: 'PENDING',
          };
        } else {
          logger.error('Invalid DANA API response', { orderId: request.orderId, response: response.data });
          lastError = new Error('Invalid DANA API response');
        }
      } catch (error: any) {
        logger.error('DANA API error', { orderId: request.orderId, attempt, error: error.message });
        lastError = error;
        if (error.response && error.response.status < 500) break;
      }
    }
    return {
      success: false,
      error: lastError?.message || 'Failed to create DANA payment',
    };
  }

  /**
   * Create payment via LinkAja
   */
  async createLinkAjaPayment(
    config: PaymentGatewayConfig,
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    logger.info(`Creating LinkAja payment for order ${request.orderId}`);

    if (!config.merchantId || !config.apiKey || !config.apiSecret) {
      logger.error('LinkAja API credentials not configured', { orderId: request.orderId });
      return {
        success: false,
        error: 'LinkAja API credentials not configured',
      };
    }

    const linkajaApiUrl = config.baseUrl || 'https://api.linkaja.id/v1/payments';
    const timestamp = Date.now().toString();
    const signature = this.generateLinkAjaSignature(config, request, timestamp);
    const linkajaRequest = {
      merchant_id: config.merchantId,
      amount: request.amount,
      order_id: request.orderId,
      customer_phone: request.customerPhone,
      description: request.description || `Payment for order ${request.orderId}`,
      callback_url: request.callbackUrl,
      timestamp,
      signature,
    };

    let lastError: any = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await axios.post(linkajaApiUrl, linkajaRequest, {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': config.apiKey,
          },
          timeout: 10000,
        });
        if (response.data && response.data.payment_id) {
          return {
            success: true,
            paymentId: response.data.payment_id,
            qrCode: response.data.qr_code,
            deepLink: response.data.deep_link,
            status: 'PENDING',
          };
        } else {
          logger.error('Invalid LinkAja API response', { orderId: request.orderId, response: response.data });
          lastError = new Error('Invalid LinkAja API response');
        }
      } catch (error: any) {
        logger.error('LinkAja API error', { orderId: request.orderId, attempt, error: error.message });
        lastError = error;
        if (error.response && error.response.status < 500) break;
      }
    }
    return {
      success: false,
      error: lastError?.message || 'Failed to create LinkAja payment',
    };
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(
    config: PaymentGatewayConfig,
    paymentId: string
  ): Promise<PaymentStatus> {
    try {
      let response: any;

      switch (config.provider) {
        case 'OVO':
          response = await this.checkOVOStatus(config, paymentId);
          break;
        case 'DANA':
          response = await this.checkDANAStatus(config, paymentId);
          break;
        case 'LINKAJA':
          response = await this.checkLinkAjaStatus(config, paymentId);
          break;
        default:
          throw new Error(`Unsupported provider: ${config.provider}`);
      }

      return response;
    } catch (error: any) {
      logger.error('Error checking payment status:', error);
      throw error;
    }
  }

  /**
   * Generate OVO signature
   */
  private generateOVOSignature(
    config: PaymentGatewayConfig,
    requestOrPaymentId: PaymentRequest | string,
    timestamp: string
  ): string {
    let data: string;
    if (typeof requestOrPaymentId === 'string') {
      // For status check
      data = `${config.merchantId}${requestOrPaymentId}${timestamp}${config.apiSecret}`;
    } else {
      // For payment creation
      data = `${config.merchantId}${requestOrPaymentId.amount}${requestOrPaymentId.orderId}${timestamp}${config.apiSecret}`;
    }
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate DANA signature
   */
  private generateDANASignature(
    config: PaymentGatewayConfig,
    requestOrPaymentId: PaymentRequest | string,
    timestamp: string
  ): string {
    let data: string;
    if (typeof requestOrPaymentId === 'string') {
      // For status check
      data = `${config.merchantId}${requestOrPaymentId}${timestamp}${config.apiSecret}`;
    } else {
      // For payment creation
      data = `${config.merchantId}${requestOrPaymentId.amount}${requestOrPaymentId.orderId}${timestamp}${config.apiSecret}`;
    }
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate LinkAja signature
   */
  private generateLinkAjaSignature(
    config: PaymentGatewayConfig,
    request: PaymentRequest,
    timestamp: string
  ): string {
    const data = `${config.merchantId}${request.amount}${request.orderId}${timestamp}${config.apiSecret}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Check OVO payment status
   */
  private async checkOVOStatus(config: PaymentGatewayConfig, paymentId: string): Promise<PaymentStatus> {
    try {
      // OVO Status Check API endpoint
      const timestamp = new Date().toISOString();
      const signature = this.generateOVOSignature(config, paymentId, timestamp);
      
      const response = await axios.post(
        `https://api.ovo.id/v2.0/payment/status`,
        {
          partnerReferenceNo: paymentId,
          merchantId: config.merchantId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-TIMESTAMP': timestamp,
            'X-SIGNATURE': signature,
            'X-PARTNER-ID': config.merchantId,
            'Authorization': `Bearer ${config.apiKey}`,
          },
          timeout: 10000,
        }
      );

      const data = response.data;
      let status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED' = 'PENDING';
      
      if (data.latestTransactionStatus === '00') {
        status = 'SUCCESS';
      } else if (data.latestTransactionStatus === '03') {
        status = 'EXPIRED';
      } else if (data.latestTransactionStatus && data.latestTransactionStatus !== '01') {
        status = 'FAILED';
      }

      return {
        paymentId,
        status,
        amount: data.amount?.value || 0,
        paidAt: data.transactionDate ? new Date(data.transactionDate) : undefined,
      };
    } catch (error: any) {
      logger.error('OVO status check failed', { 
        error: error.message, 
        paymentId,
        merchantId: config.merchantId 
      });
      
      // Return last known status or PENDING if API fails
    return {
      paymentId,
      status: 'PENDING',
      amount: 0,
        error: 'Unable to check payment status at this time',
    };
    }
  }

  /**
   * Check DANA payment status
   */
  private async checkDANAStatus(config: PaymentGatewayConfig, paymentId: string): Promise<PaymentStatus> {
    try {
      // DANA Status Check API endpoint
      const timestamp = Date.now().toString();
      const signature = this.generateDANASignature(config, paymentId, timestamp);
      
      const response = await axios.get(
        `https://api.dana.id/v1/payment/query`,
        {
          params: {
            merchantId: config.merchantId,
            orderId: paymentId,
          },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`,
            'X-DANA-SIGNATURE': signature,
            'X-DANA-TIMESTAMP': timestamp,
          },
          timeout: 10000,
        }
      );

      const data = response.data;
      let status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED' = 'PENDING';
      
      if (data.paymentStatus === 'SUCCESS' || data.status === 'PAID') {
        status = 'SUCCESS';
      } else if (data.paymentStatus === 'EXPIRED' || data.status === 'EXPIRED') {
        status = 'EXPIRED';
      } else if (data.paymentStatus === 'FAILED' || data.status === 'FAILED') {
        status = 'FAILED';
      }

      return {
        paymentId,
        status,
        amount: data.amount || 0,
        paidAt: data.paidAt || data.createdAt ? new Date(data.paidAt || data.createdAt) : undefined,
      };
    } catch (error: any) {
      logger.error('DANA status check failed', { 
        error: error.message, 
        paymentId,
        merchantId: config.merchantId 
      });
      
    return {
      paymentId,
      status: 'PENDING',
      amount: 0,
        error: 'Unable to check payment status at this time',
    };
    }
  }

  /**
   * Check LinkAja payment status
   */
  private async checkLinkAjaStatus(config: PaymentGatewayConfig, paymentId: string): Promise<PaymentStatus> {
    try {
      // LinkAja Status Check API endpoint
      const timestamp = new Date().toISOString();
      const signature = this.generateLinkAjaStatusSignature(config, paymentId, timestamp);
      
      const response = await axios.get(
        `https://api.linkaja.id/v1/transaction/status/${paymentId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-LINKAJA-MERCHANT-ID': config.merchantId,
            'X-LINKAJA-TIMESTAMP': timestamp,
            'X-LINKAJA-SIGNATURE': signature,
            'Authorization': `Bearer ${config.apiKey}`,
          },
          timeout: 10000,
        }
      );

      const data = response.data;
      let status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED' = 'PENDING';
      
      if (data.status === 'SUCCESS' || data.transactionStatus === 'COMPLETED') {
        status = 'SUCCESS';
      } else if (data.status === 'EXPIRED' || data.transactionStatus === 'EXPIRED') {
        status = 'EXPIRED';
      } else if (data.status === 'FAILED' || data.transactionStatus === 'FAILED' || data.transactionStatus === 'CANCELLED') {
        status = 'FAILED';
      }

      return {
        paymentId,
        status,
        amount: data.amount || 0,
        paidAt: data.transactionTime ? new Date(data.transactionTime) : undefined,
      };
    } catch (error: any) {
      logger.error('LinkAja status check failed', { 
        error: error.message, 
        paymentId,
        merchantId: config.merchantId 
      });
      
    return {
      paymentId,
      status: 'PENDING',
      amount: 0,
        error: 'Unable to check payment status at this time',
      };
    }
  }

  /**
   * Generate signature for LinkAja status check
   */
  private generateLinkAjaStatusSignature(
    config: PaymentGatewayConfig,
    paymentId: string,
    timestamp: string
  ): string {
    const data = `${config.merchantId}${paymentId}${timestamp}${config.apiSecret}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

export default new PaymentGatewayIntegrationService();

