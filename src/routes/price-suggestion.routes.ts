/**
 * Price Suggestion Routes
 */

import { Router, Request, Response } from 'express';
import { authGuard } from '../middlewares/auth';
import { AuthRequest } from '../middlewares/auth';
import { requireTenantId } from '../utils/tenant';
import priceSuggestionService from '../services/price-suggestion.service';
import { handleRouteError } from '../utils/route-error-handler';

const router = Router();

/**
 * @swagger
 * /api/product/price-suggestion/:productId:
 *   get:
 *     summary: Get price suggestions for a product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:productId',
  authGuard,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const tenantId = requireTenantId(req);
      const { productId } = req.params;
      const suggestions = await priceSuggestionService.getPriceSuggestions(tenantId, productId);
      res.json(suggestions);
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to get price suggestions', 'PRICE_SUGGESTION');
    }
  }
);

/**
 * @swagger
 * /api/product/price-suggestion/by-cost:
 *   get:
 *     summary: Get price suggestions based on cost and category (for new products)
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/by-cost',
  authGuard,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const tenantId = requireTenantId(req);
      const cost = parseFloat(req.query.cost as string);
      const category = req.query.category as string | undefined;

      if (!cost || cost <= 0) {
        res.status(400).json({ message: 'Cost must be greater than 0' });
        return;
      }

      const suggestions = await priceSuggestionService.getPriceSuggestionsByCost(tenantId, cost, category);
      res.json(suggestions);
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to get price suggestions by cost', 'PRICE_SUGGESTION');
    }
  }
);

/**
 * @swagger
 * /api/product/price-suggestion/bulk:
 *   post:
 *     summary: Get price suggestions for multiple products
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/bulk',
  authGuard,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const tenantId = requireTenantId(req);
      const { productIds } = req.body;
      
      if (!Array.isArray(productIds)) {
        res.status(400).json({ message: 'productIds must be an array' });
        return;
      }

      const suggestions = await priceSuggestionService.getBulkPriceSuggestions(tenantId, productIds);
      res.json(suggestions);
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to get bulk price suggestions', 'PRICE_SUGGESTION');
    }
  }
);

export default router;
