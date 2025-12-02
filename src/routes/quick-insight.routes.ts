import { Router, Request, Response } from 'express';
import { authGuard, AuthRequest } from '../middlewares/auth';
import { requireTenantId } from '../utils/tenant';
import quickInsightService from '../services/quick-insight.service';
import addonService from '../services/addon.service';
import { handleRouteError } from '../utils/route-error-handler';

const router = Router();

// Middleware to check Business Analytics addon (Super Admin bypass)
const checkBusinessAnalyticsAddon = async (req: AuthRequest, res: Response, next: Function) => {
  try {
    const userRole = req.user?.role || req.role;
    
    // Super Admin bypass addon check
    if (userRole === 'SUPER_ADMIN') {
      return next();
    }
    
    const tenantId = requireTenantId(req);
    const addons = await addonService.getTenantAddons(tenantId);
    const hasBusinessAnalytics = addons.some(
      (addon) => addon.addonType === 'BUSINESS_ANALYTICS' && addon.status === 'active'
    );
    
    if (!hasBusinessAnalytics) {
      const error = new Error('Business Analytics & Insight addon is required to access this feature');
      (error as any).statusCode = 403;
      handleRouteError(res, error, 'Business Analytics & Insight addon is required to access this feature', 'CHECK_BUSINESS_ANALYTICS_ADDON');
      return;
    }
    
    next();
  } catch (error: unknown) {
    handleRouteError(res, error, 'Failed to check Business Analytics addon', 'CHECK_BUSINESS_ANALYTICS_ADDON');
  }
};

router.get(
  '/',
  authGuard,
  checkBusinessAnalyticsAddon,
  async (req: AuthRequest, res: Response) => {
    try {
      const userRole = req.user?.role || req.role;
      const period = (req.query.period as string) || (userRole === 'SUPER_ADMIN' ? 'monthly' : 'daily');
      
      // For Super Admin, use global stats (all tenants)
      if (userRole === 'SUPER_ADMIN') {
        const insight = await quickInsightService.getGlobalQuickInsight(period as 'daily' | 'weekly' | 'monthly');
        return res.json(insight);
      }
      
      const tenantId = requireTenantId(req);
      const insight = await quickInsightService.getQuickInsight(tenantId, period as 'daily' | 'weekly' | 'monthly');
      res.json(insight);
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to get quick insight', 'GET_QUICK_INSIGHT');
    }
  }
);

export default router;


