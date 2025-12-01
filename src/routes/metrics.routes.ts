/**
 * Metrics Routes
 * Prometheus metrics endpoint
 */

import { Router, Request, Response } from 'express';
import { register } from '../utils/metrics';
import { handleRouteError } from '../utils/route-error-handler';

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
      const error = new Error('Metrics not available. Please install prom-client: npm install prom-client');
      (error as any).statusCode = 503;
      handleRouteError(res, error, 'Metrics not available', 'GET_METRICS');
      return;
    }
    
    res.set('Content-Type', register.contentType || 'text/plain');
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error: unknown) {
    handleRouteError(res, error, 'Error generating metrics', 'GET_METRICS');
  }
});

export default router;

