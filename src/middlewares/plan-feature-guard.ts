import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { checkPlanFeature } from '../services/plan-features.service';
import { requireTenantId } from '../utils/tenant';
import logger from '../utils/logger';

/**
 * Middleware to check if tenant has access to a specific plan feature
 * @param featureName - Name of the feature to check (e.g., 'manajemen-stok')
 */
export const checkPlanFeatureGuard = (featureName: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Super Admin bypass all plan feature checks
      if (req.role === 'SUPER_ADMIN') {
        return next();
      }

      const tenantId = requireTenantId(req);
      const hasFeature = await checkPlanFeature(tenantId, featureName);

      if (!hasFeature) {
        const featureNames: Record<string, string> = {
          'manajemen-stok': 'Manajemen Stok & Inventory',
          'kasir': 'Fitur Kasir',
          'laporan': 'Fitur Laporan',
          'addon-management': 'Manajemen Addon',
        };

        const featureDisplayName = featureNames[featureName] || featureName;
        res.status(403).json({
          error: 'Forbidden: Feature not available in your plan',
          message: `Fitur ${featureDisplayName} hanya tersedia untuk paket PRO atau ENTERPRISE. Silakan upgrade paket untuk mengakses fitur ini.`,
          code: 'FEATURE_NOT_AVAILABLE',
          requiredFeature: featureName,
        });
        return;
      }

      next();
    } catch (error: any) {
      logger.error('Plan feature guard error:', { error: error.message, stack: error.stack });
      next(error);
    }
  };
};

/**
 * Middleware specifically for Inventory Management feature
 */
export const checkInventoryAccess = checkPlanFeatureGuard('manajemen-stok');

/**
 * Middleware for Delivery & Marketing addon
 */
export const checkDeliveryMarketingAddon = checkPlanFeatureGuard('Delivery & Marketing');
