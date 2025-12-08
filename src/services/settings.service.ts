import prisma from '../config/database';
import logger from '../utils/logger';

export interface SystemSettings {
  appName: string;
  version: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  maxTenants: number;
  maxUsersPerTenant: number;
  features: {
    multiOutlet: boolean;
    delivery: boolean;
    accounting: boolean;
  };
}

const DEFAULT_SETTINGS: SystemSettings = {
  appName: 'Warungin',
  version: '1.3.0',
  maintenanceMode: false,
  allowRegistration: false,
  maxTenants: 1000,
  maxUsersPerTenant: 50,
  features: {
    multiOutlet: true,
    delivery: false,
    accounting: false,
  },
};

export class SettingsService {
  private static readonly SETTINGS_KEY = 'system_settings';

  async getSystemSettings(): Promise<SystemSettings> {
    try {
      // Try to get settings from database (using a simple key-value approach)
      // For now, we'll use a JSON file or environment variables
      // In production, you might want to create a Settings table
      
      // Check if settings exist in environment
      const envSettings = process.env.SYSTEM_SETTINGS;
      if (envSettings) {
        try {
          return JSON.parse(envSettings);
        } catch {
          // Invalid JSON, use defaults
        }
      }

      // Return default settings
      return DEFAULT_SETTINGS;
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Error loading system settings:', { error: err.message, stack: err.stack });
      return DEFAULT_SETTINGS;
    }
  }

  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    try {
      // Get current settings
      const currentSettings = await this.getSystemSettings();
      
      // Merge with new settings
      const updatedSettings: SystemSettings = {
        ...currentSettings,
        ...settings,
        features: {
          ...currentSettings.features,
          ...(settings.features || {}),
        },
      };

      // In production, save to database or config file
      // For now, we'll just validate and return
      // You can implement actual persistence later

      // Validate settings
      if (updatedSettings.maxTenants < 1) {
        throw new Error('maxTenants must be at least 1');
      }
      if (updatedSettings.maxUsersPerTenant < 1) {
        throw new Error('maxUsersPerTenant must be at least 1');
      }

      // Log settings update (in production, save to database)
      logger.info('System settings updated:', updatedSettings);

      return updatedSettings;
    } catch (error: any) {
      logger.error('Error updating system settings:', { error: error.message, stack: error.stack });
      throw new Error(error.message || 'Failed to update system settings');
    }
  }
}

export default new SettingsService();

