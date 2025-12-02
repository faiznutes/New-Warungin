import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import addonService from '../services/addon.service';
import { requireTenantId } from '../utils/tenant';

/**
 * Middleware to check if tenant has specific addon active
 * Super Admin and Admin Tenant bypass addon check for basic features
 */
export const checkAddon = (addonType: string) => {
  return async (req: Request | AuthRequest, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const userRole = authReq.user?.role || authReq.role;
      
      // Super Admin bypass addon check
      if (userRole === 'SUPER_ADMIN') {
        return next();
      }
      
      // Admin Tenant bypass addon check for basic analytics (predictions, top-products)
      // This allows admin tenant to access basic reports without addon
      if (userRole === 'ADMIN_TENANT' && (addonType === 'BUSINESS_ANALYTICS')) {
        // Allow basic analytics access for admin tenant
        return next();
      }
      
      const tenantId = requireTenantId(req);
      const addons = await addonService.getTenantAddons(tenantId);
      
      const hasAddon = addons.some(
        (addon) => addon.addonType === addonType && addon.status === 'active'
      );
      
      if (!hasAddon) {
        const addonNames: Record<string, string> = {
          'BUSINESS_ANALYTICS': 'Business Analytics & Insight',
          'ADVANCED_REPORTING': 'Advanced Reporting',
          'EXPORT_REPORTS': 'Export Laporan',
          'FINANCIAL_MANAGEMENT': 'Financial Management',
          'INVENTORY_MANAGEMENT': 'Inventory Management',
          'AI_ML_FEATURES': 'AI/ML Features',
          'DELIVERY_MARKETING': 'Delivery & Marketing',
          'RECEIPT_EDITOR': 'Advanced Receipt Editor',
          'MULTI_OUTLET_ADVANCED': 'Multi-Outlet Advanced',
          'ADD_PRODUCTS': 'Tambah Produk',
        };
        
        const addonName = addonNames[addonType] || addonType;
        return res.status(403).json({ 
          message: `${addonName} addon is required to access this feature` 
        });
      }
      
      next();
    } catch (error: any) {
      next(error);
    }
  };
};

/**
 * Middleware specifically for Business Analytics addon
 */
export const checkBusinessAnalyticsAddon = checkAddon('BUSINESS_ANALYTICS');

/**
 * Middleware specifically for Advanced Reporting addon
 */
export const checkAdvancedReportingAddon = checkAddon('ADVANCED_REPORTING');

/**
 * Middleware specifically for Export Reports addon
 */
export const checkExportReportsAddon = checkAddon('EXPORT_REPORTS');

/**
 * Middleware specifically for Financial Management addon
 */
export const checkFinancialManagementAddon = checkAddon('FINANCIAL_MANAGEMENT');

/**
 * Middleware specifically for Inventory Management addon
 */
export const checkInventoryManagementAddon = checkAddon('INVENTORY_MANAGEMENT');

/**
 * Middleware specifically for AI/ML Features addon
 */
export const checkAIMLFeaturesAddon = checkAddon('AI_ML_FEATURES');

/**
 * Middleware specifically for Delivery & Marketing addon
 */
export const checkDeliveryMarketingAddon = checkAddon('DELIVERY_MARKETING');

/**
 * Middleware specifically for Receipt Editor addon
 */
export const checkReceiptEditorAddon = checkAddon('RECEIPT_EDITOR');

/**
 * Middleware specifically for Multi-Outlet Advanced addon
 */
export const checkMultiOutletAdvancedAddon = checkAddon('MULTI_OUTLET_ADVANCED');

/**
 * Middleware specifically for Add Products addon
 */
export const checkAddProductsAddon = checkAddon('ADD_PRODUCTS');

