/**
 * Metrics Routes
 * Prometheus metrics endpoint
 */

import { Router, Request, Response } from 'express';
import { register } from '../utils/metrics';
import businessMetricsService from '../services/business-metrics.service';
import { authGuard } from '../middlewares/auth';
import { requireSuperAdmin } from '../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /api/metrics:
 *   get:
 *     summary: Get Prometheus metrics
 *     tags: [Metrics]
 *     description: Returns metrics in Prometheus format
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!register || typeof register.metrics !== 'function') {
      return res.status(503).json({ 
        message: 'Metrics not available. Please install prom-client: npm install prom-client' 
      });
    }
    
    res.set('Content-Type', register.contentType || 'text/plain');
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error: any) {
    res.status(500).json({ message: 'Error generating metrics', error: error.message });
  }
});

/**
 * @swagger
 * /api/metrics/refresh:
 *   post:
 *     summary: Refresh business metrics
 *     tags: [Metrics]
 *     description: Manually trigger update of all business metrics
 *     security:
 *       - bearerAuth: []
 */
router.post('/refresh', authGuard, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    await businessMetricsService.updateAllMetrics();
    res.json({ message: 'Business metrics refreshed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error refreshing metrics', error: error.message });
  }
});

export default router;

