/**
 * Restock Suggestion Routes
 */

import { Router, Request, Response } from 'express';
import { authGuard } from '../middlewares/auth';
import { AuthRequest } from '../middlewares/auth';
import { requireTenantId } from '../utils/tenant';
import restockSuggestionService from '../services/restock-suggestion.service';
import { handleRouteError } from '../utils/route-error-handler';

const router = Router();

/**
 * @swagger
 * /api/inventory/restock-suggestions:
 *   get:
 *     summary: Get restock suggestions
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/',
  authGuard,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const tenantId = requireTenantId(req);
      const suggestions = await restockSuggestionService.getRestockSuggestions(tenantId);
      res.json(suggestions);
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to get restock suggestions', 'RESTOCK');
    }
  }
);

/**
 * @swagger
 * /api/inventory/restock-suggestions/critical:
 *   get:
 *     summary: Get critical restock suggestions (for popup/reminder)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/critical',
  authGuard,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const tenantId = requireTenantId(req);
      const limit = parseInt(req.query.limit as string, 10) || 5;
      const suggestions = await restockSuggestionService.getCriticalRestockSuggestions(tenantId, limit);
      res.json(suggestions);
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to get critical restock suggestions', 'RESTOCK');
    }
  }
);

export default router;
