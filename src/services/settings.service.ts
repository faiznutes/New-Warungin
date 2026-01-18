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
      // Get settings from database
      const dbSettings = await prisma.systemSettings.findFirst();
      
      if (dbSettings) {
        return {
          appName: dbSettings.appName,
          version: dbSettings.version,
          maintenanceMode: dbSettings.maintenanceMode,
          allowRegistration: dbSettings.allowRegistration,
          maxTenants: dbSettings.maxTenants,
          maxUsersPerTenant: dbSettings.maxUsersPerTenant,
          features: {
            multiOutlet: dbSettings.multiOutletEnabled,
            delivery: dbSettings.deliveryEnabled,
            accounting: dbSettings.accountingEnabled,
          },
        };
      }

      // If no settings in database, create defaults
      const newSettings = await prisma.systemSettings.create({
        data: {
          appName: DEFAULT_SETTINGS.appName,
          version: DEFAULT_SETTINGS.version,
          maintenanceMode: DEFAULT_SETTINGS.maintenanceMode,
          allowRegistration: DEFAULT_SETTINGS.allowRegistration,
          maxTenants: DEFAULT_SETTINGS.maxTenants,
          maxUsersPerTenant: DEFAULT_SETTINGS.maxUsersPerTenant,
          multiOutletEnabled: DEFAULT_SETTINGS.features.multiOutlet,
          deliveryEnabled: DEFAULT_SETTINGS.features.delivery,
          accountingEnabled: DEFAULT_SETTINGS.features.accounting,
        },
      });

      return {
        appName: newSettings.appName,
        version: newSettings.version,
        maintenanceMode: newSettings.maintenanceMode,
        allowRegistration: newSettings.allowRegistration,
        maxTenants: newSettings.maxTenants,
        maxUsersPerTenant: newSettings.maxUsersPerTenant,
        features: {
          multiOutlet: newSettings.multiOutletEnabled,
          delivery: newSettings.deliveryEnabled,
          accounting: newSettings.accountingEnabled,
        },
      };
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Error loading system settings:', { error: err.message, stack: err.stack });
      return DEFAULT_SETTINGS;
    }
  }

  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    try {
      // Get current settings
      let dbSettings = await prisma.systemSettings.findFirst();

      // If no settings exist, create defaults first
      if (!dbSettings) {
        dbSettings = await prisma.systemSettings.create({
          data: {
            appName: DEFAULT_SETTINGS.appName,
            version: DEFAULT_SETTINGS.version,
            maintenanceMode: DEFAULT_SETTINGS.maintenanceMode,
            allowRegistration: DEFAULT_SETTINGS.allowRegistration,
            maxTenants: DEFAULT_SETTINGS.maxTenants,
            maxUsersPerTenant: DEFAULT_SETTINGS.maxUsersPerTenant,
            multiOutletEnabled: DEFAULT_SETTINGS.features.multiOutlet,
            deliveryEnabled: DEFAULT_SETTINGS.features.delivery,
            accountingEnabled: DEFAULT_SETTINGS.features.accounting,
          },
        });
      }

      // Validate settings before updating
      if (settings.maxTenants !== undefined && settings.maxTenants < 1) {
        throw new Error('maxTenants must be at least 1');
      }
      if (settings.maxUsersPerTenant !== undefined && settings.maxUsersPerTenant < 1) {
        throw new Error('maxUsersPerTenant must be at least 1');
      }

      // Prepare update data
      const updateData: any = {};
      if (settings.appName !== undefined) updateData.appName = settings.appName;
      if (settings.version !== undefined) updateData.version = settings.version;
      if (settings.maintenanceMode !== undefined) updateData.maintenanceMode = settings.maintenanceMode;
      if (settings.allowRegistration !== undefined) updateData.allowRegistration = settings.allowRegistration;
      if (settings.maxTenants !== undefined) updateData.maxTenants = settings.maxTenants;
      if (settings.maxUsersPerTenant !== undefined) updateData.maxUsersPerTenant = settings.maxUsersPerTenant;
      if (settings.features?.multiOutlet !== undefined) updateData.multiOutletEnabled = settings.features.multiOutlet;
      if (settings.features?.delivery !== undefined) updateData.deliveryEnabled = settings.features.delivery;
      if (settings.features?.accounting !== undefined) updateData.accountingEnabled = settings.features.accounting;

      // Update in database
      const updatedSettings = await prisma.systemSettings.update({
        where: { id: dbSettings.id },
        data: updateData,
      });

      logger.info('System settings updated:', { appName: updatedSettings.appName, version: updatedSettings.version });

      return {
        appName: updatedSettings.appName,
        version: updatedSettings.version,
        maintenanceMode: updatedSettings.maintenanceMode,
        allowRegistration: updatedSettings.allowRegistration,
        maxTenants: updatedSettings.maxTenants,
        maxUsersPerTenant: updatedSettings.maxUsersPerTenant,
        features: {
          multiOutlet: updatedSettings.multiOutletEnabled,
          delivery: updatedSettings.deliveryEnabled,
          accounting: updatedSettings.accountingEnabled,
        },
      };
    } catch (error: any) {
      logger.error('Error updating system settings:', { error: error.message, stack: error.stack });
      throw new Error(error.message || 'Failed to update system settings');
    }
  }
}

export default new SettingsService();

