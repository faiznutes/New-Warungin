/**
 * Courier Service
 * Handles integration with various courier APIs (JNE, J&T, POS Indonesia)
 */

// import axios from 'axios'; // Removed - using fetch instead
import logger from '../utils/logger';
import prisma from '../config/database';

// Declare process for TypeScript
declare const process: {
  env: {
    NODE_ENV?: string;
    [key: string]: string | undefined;
  };
};

export interface CourierConfig {
  courier: 'JNE' | 'JNT' | 'POS';
  apiKey: string;
  apiSecret?: string;
  username?: string;
  password?: string;
  baseUrl?: string;
}

export interface CreateShipmentRequest {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  customerPostalCode: string;
  weight: number; // in kg
  items: Array<{
    name: string;
    quantity: number;
    value: number;
  }>;
}

export interface ShipmentResponse {
  trackingNumber: string;
  courier: string;
  status: string;
  estimatedDelivery?: Date;
  cost?: number;
  airwayBill?: string;
}

export interface TrackingResponse {
  trackingNumber: string;
  status: string;
  currentLocation?: string;
  history: Array<{
    date: Date;
    status: string;
    location?: string;
    description?: string;
  }>;
  estimatedDelivery?: Date;
}

class CourierService {
  /**
   * Create shipment via JNE API
   */
  async createJNEShipment(
    config: CourierConfig,
    request: CreateShipmentRequest
  ): Promise<ShipmentResponse> {
    try {
      // JNE API integration
      // In production, implement actual JNE API call
      // Example structure:
      /*
      const response = await axios.post(
        config.baseUrl || 'https://api.jne.co.id/v1/shipment',
        {
          username: config.username,
          api_key: config.apiKey,
          from: {
            name: 'Warungin',
            address: '...',
            city: '...',
            postal_code: '...',
          },
          to: {
            name: request.customerName,
            address: request.customerAddress,
            city: request.customerCity,
            postal_code: request.customerPostalCode,
          },
          weight: request.weight,
          goods: request.items,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      */

      logger.info(`Creating JNE shipment for order ${request.orderId}`);

      // JNE API Production Integration
      // Note: This requires actual JNE API credentials and endpoint
      // JNE typically uses SOAP API or REST API with authentication

      if (!config.apiKey || !config.username) {
        throw new Error('JNE API credentials not configured');
      }

      try {
        // JNE API endpoint (example - actual endpoint may vary)
        const jneApiUrl = config.baseUrl || 'https://api.jne.co.id/v1/shipment';

        // JNE API request structure (adjust based on actual JNE API documentation)
        const jneRequest = {
          username: config.username,
          api_key: config.apiKey,
          from: {
            // Get from tenant settings or outlet
            name: 'Warungin',
            address: '...', // Should be configurable
            city: '...',
            postal_code: '...',
            phone: '...',
          },
          to: {
            name: request.customerName,
            address: request.customerAddress,
            city: request.customerCity,
            postal_code: request.customerPostalCode,
            phone: request.customerPhone,
          },
          weight: request.weight,
          goods: request.items.map(item => ({
            name: item.name,
            qty: item.quantity,
            value: item.value,
          })),
        };

        // Make API call to JNE using fetch
        const jneResponse = await fetch(jneApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify(jneRequest),
        });

        if (!jneResponse.ok) {
          throw new Error(`JNE API returned ${jneResponse.status}: ${jneResponse.statusText}`);
        }

        const response = await jneResponse.json() as any;

        // Parse JNE response
        if (response?.data?.trackingNumber) {
          return {
            trackingNumber: response.data.trackingNumber,
            courier: response.data.courier || 'JNE',
            status: response.data.status || 'CREATED',
            estimatedDelivery: response.data.estimatedDelivery,
            cost: response.data.cost,
            airwayBill: response.data.airwayBill || response.data.trackingNumber,
          };
        } else {
          throw new Error('Invalid JNE API response');
        }
      } catch (error: any) {
        logger.error('JNE API error:', error);
        // Fail-fast: Don't use mock fallback in production
        throw error;
      }
    } catch (error: any) {
      logger.error('JNE shipment creation failed:', error);
      throw new Error(`Failed to create JNE shipment: ${error.message}`);
    }
  }

  /**
   * Create shipment via J&T API
   */
  async createJNTShipment(
    config: CourierConfig,
    request: CreateShipmentRequest
  ): Promise<ShipmentResponse> {
    try {
      logger.info(`Creating J&T shipment for order ${request.orderId}`);

      // J&T API Production Integration
      if (!config.apiKey || !config.apiSecret) {
        throw new Error('J&T API credentials not configured');
      }

      try {
        // J&T API endpoint (example - actual endpoint may vary)
        const jntApiUrl = config.baseUrl || 'https://api.jnt.co.id/v1/shipment';

        // J&T API request structure
        const jntRequest = {
          api_key: config.apiKey,
          api_secret: config.apiSecret,
          from: {
            name: 'Warungin',
            address: '...',
            city: '...',
            postal_code: '...',
            phone: '...',
          },
          to: {
            name: request.customerName,
            address: request.customerAddress,
            city: request.customerCity,
            postal_code: request.customerPostalCode,
            phone: request.customerPhone,
          },
          weight: request.weight,
          items: request.items,
        };

        // Make API call to J&T using fetch
        const jntResponse = await fetch(jntApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify(jntRequest),
        });

        if (!jntResponse.ok) {
          throw new Error(`J&T API returned ${jntResponse.status}: ${jntResponse.statusText}`);
        }

        const response = (await jntResponse.json()) as { data?: any };

        // Parse J&T response
        if (response.data && response.data.trackingNumber) {
          return {
            trackingNumber: response.data.trackingNumber,
            courier: response.data.courier || 'JNT',
            status: response.data.status || 'CREATED',
            estimatedDelivery: response.data.estimatedDelivery,
            cost: response.data.cost,
            airwayBill: response.data.airwayBill || response.data.trackingNumber,
          };
        } else {
          throw new Error('Invalid J&T API response');
        }
      } catch (error: any) {
        logger.error('J&T API error:', error);
        // Fail-fast: Don't use mock fallback in production
        throw error;
      }
    } catch (error: any) {
      logger.error('J&T shipment creation failed:', error);
      throw new Error(`Failed to create J&T shipment: ${error.message}`);
    }
  }

  /**
   * Create shipment via POS Indonesia API
   */
  async createPOSShipment(
    config: CourierConfig,
    request: CreateShipmentRequest
  ): Promise<ShipmentResponse> {
    try {
      logger.info(`Creating POS shipment for order ${request.orderId}`);

      // POS Indonesia API credentials validation
      if (!config.apiKey || !config.apiSecret) {
        throw new Error('POS Indonesia API credentials not configured');
      }

      try {
        const posApiUrl = config.baseUrl || 'https://api.posindonesia.co.id/v1/shipment';

        const posRequest = {
          api_key: config.apiKey,
          api_secret: config.apiSecret,
          from: {
            name: 'Warungin',
            address: '...',
            city: '...',
            postal_code: '...',
            phone: '...',
          },
          to: {
            name: request.customerName,
            address: request.customerAddress,
            city: request.customerCity,
            postal_code: request.customerPostalCode,
            phone: request.customerPhone,
          },
          weight: request.weight,
          items: request.items,
        };

        const posResponse = await fetch(posApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify(posRequest),
        });

        if (!posResponse.ok) {
          throw new Error(`POS API returned ${posResponse.status}: ${posResponse.statusText}`);
        }

        const response = (await posResponse.json()) as { data?: any };

        if (response.data && response.data.trackingNumber) {
          return {
            trackingNumber: response.data.trackingNumber,
            courier: response.data.courier || 'POS',
            status: response.data.status || 'CREATED',
            estimatedDelivery: response.data.estimatedDelivery,
            cost: response.data.cost,
            airwayBill: response.data.airwayBill || response.data.trackingNumber,
          };
        } else {
          throw new Error('Invalid POS API response');
        }
      } catch (error: any) {
        logger.error('POS API error:', error);
        throw error;
      }
    } catch (error: any) {
      logger.error('POS shipment creation failed:', error);
      throw new Error(`Failed to create POS shipment: ${error.message}`);
    }
  }

  /**
   * Create shipment (auto-select courier based on config)
   */
  async createShipment(
    config: CourierConfig,
    request: CreateShipmentRequest
  ): Promise<ShipmentResponse> {
    switch (config.courier) {
      case 'JNE':
        return await this.createJNEShipment(config, request);
      case 'JNT':
        return await this.createJNTShipment(config, request);
      case 'POS':
        return await this.createPOSShipment(config, request);
      default:
        throw new Error(`Unsupported courier: ${config.courier}`);
    }
  }

  /**
   * Track JNE shipment
   */
  async trackJNE(trackingNumber: string, config: CourierConfig): Promise<TrackingResponse> {
    try {
      logger.info(`Tracking JNE shipment: ${trackingNumber}`);

      // JNE tracking API integration
      if (!config.apiKey) {
        throw new Error('JNE API credentials not configured');
      }

      const jneTrackingUrl = `${config.baseUrl || 'https://api.jne.co.id/v1'}/tracking/${trackingNumber}`;

      const trackingResponse = await fetch(jneTrackingUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
        },
      });

      if (!trackingResponse.ok) {
        throw new Error(`JNE tracking API returned ${trackingResponse.status}: ${trackingResponse.statusText}`);
      }

      const response = (await trackingResponse.json()) as { data?: any };

      if (response.data) {
        return {
          trackingNumber: response.data.trackingNumber || trackingNumber,
          status: response.data.status || 'IN_TRANSIT',
          currentLocation: response.data.currentLocation || 'In Transit',
          history: response.data.history || [],
          estimatedDelivery: response.data.estimatedDelivery || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        };
      }
      throw new Error('Invalid JNE tracking response');
    } catch (error: any) {
      logger.error('JNE tracking failed:', error);
      throw new Error(`Failed to track JNE shipment: ${error.message}`);
    }
  }

  /**
   * Track J&T shipment
   */
  async trackJNT(trackingNumber: string, config: CourierConfig): Promise<TrackingResponse> {
    try {
      logger.info(`Tracking J&T shipment: ${trackingNumber}`);

      // J&T tracking API integration
      if (!config.apiKey) {
        throw new Error('J&T API credentials not configured');
      }

      const jntTrackingUrl = `${config.baseUrl || 'https://api.jnt.co.id/v1'}/tracking/${trackingNumber}`;

      const trackingResponse = await fetch(jntTrackingUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
        },
      });

      if (!trackingResponse.ok) {
        throw new Error(`J&T tracking API returned ${trackingResponse.status}: ${trackingResponse.statusText}`);
      }

      const response = (await trackingResponse.json()) as { data?: any };

      if (response.data) {
        return {
          trackingNumber: response.data.trackingNumber || trackingNumber,
          status: response.data.status || 'IN_TRANSIT',
          currentLocation: response.data.currentLocation || 'In Transit',
          history: response.data.history || [],
          estimatedDelivery: response.data.estimatedDelivery || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        };
      }
      throw new Error('Invalid J&T tracking response');
    } catch (error: any) {
      logger.error('J&T tracking failed:', error);
      throw new Error(`Failed to track J&T shipment: ${error.message}`);
    }
  }

  /**
   * Track POS Indonesia shipment
   */
  async trackPOS(trackingNumber: string, config: CourierConfig): Promise<TrackingResponse> {
    try {
      logger.info(`Tracking POS shipment: ${trackingNumber}`);

      // POS Indonesia tracking API integration
      if (!config.apiKey) {
        throw new Error('POS Indonesia API credentials not configured');
      }

      const posTrackingUrl = `${config.baseUrl || 'https://api.posindonesia.co.id/v1'}/tracking/${trackingNumber}`;

      const trackingResponse = await fetch(posTrackingUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
        },
      });

      if (!trackingResponse.ok) {
        throw new Error(`POS tracking API returned ${trackingResponse.status}: ${trackingResponse.statusText}`);
      }

      const response = (await trackingResponse.json()) as { data?: any };

      if (response.data) {
        return {
          trackingNumber: response.data.trackingNumber || trackingNumber,
          status: response.data.status || 'IN_TRANSIT',
          currentLocation: response.data.currentLocation || 'In Transit',
          history: response.data.history || [],
          estimatedDelivery: response.data.estimatedDelivery || new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        };
      }
      throw new Error('Invalid POS tracking response');
    } catch (error: any) {
      logger.error('POS tracking failed:', error);
      throw new Error(`Failed to track POS shipment: ${error.message}`);
    }
  }

  /**
   * Track shipment (auto-select courier)
   */
  async trackShipment(
    trackingNumber: string,
    courier: 'JNE' | 'JNT' | 'POS',
    config: CourierConfig
  ): Promise<TrackingResponse> {
    switch (courier) {
      case 'JNE':
        return await this.trackJNE(trackingNumber, config);
      case 'JNT':
        return await this.trackJNT(trackingNumber, config);
      case 'POS':
        return await this.trackPOS(trackingNumber, config);
      default:
        throw new Error(`Unsupported courier: ${courier}`);
    }
  }

  /**
   * Get courier config from database
   */
  async getCourierConfig(tenantId: string, courier: string): Promise<CourierConfig | null> {
    try {
      const config = await prisma.courierConfig.findUnique({
        where: {
          tenantId_courier: {
            tenantId,
            courier,
          },
        },
      });

      if (!config) {
        logger.warn(`No courier config found for tenant ${tenantId}, courier ${courier}`);
        return null;
      }

      if (!config.isActive) {
        logger.warn(`Courier config is inactive for tenant ${tenantId}, courier ${courier}`);
        return null;
      }

      return config as CourierConfig;
    } catch (error: any) {
      logger.error(`Failed to get courier config: ${error.message}`);
      return null;
    }
  }

  /**
   * Save courier config to database
   */
  async saveCourierConfig(tenantId: string, config: CourierConfig): Promise<void> {
    try {
      await prisma.courierConfig.upsert({
        where: {
          tenantId_courier: {
            tenantId,
            courier: config.courier,
          },
        },
        update: {
          apiKey: config.apiKey,
          apiSecret: config.apiSecret,
          baseUrl: config.baseUrl,
          isActive: true,
        },
        create: {
          tenantId,
          courier: config.courier,
          apiKey: config.apiKey,
          apiSecret: config.apiSecret || '',
          baseUrl: config.baseUrl,
          isActive: true,
        },
      });

      logger.info(`Courier config saved for tenant ${tenantId}: ${config.courier}`);
    } catch (error: any) {
      logger.error(`Failed to save courier config: ${error.message}`);
      throw new Error(`Failed to save courier config: ${error.message}`);
    }
  }
}

export default new CourierService();

