import { Router, Response, Request } from 'express';
import { authGuard, roleGuard } from '../middlewares/auth';
import { subscriptionGuard } from '../middlewares/subscription-guard';
import { supervisorStoresGuard } from '../middlewares/supervisor-store-guard';
import productService from '../services/product.service';
import productAdjustmentService, { createProductAdjustmentSchema } from '../services/product-adjustment.service';
import { createProductSchema, updateProductSchema, getProductsQuerySchema } from '../validators/product.validator';
import { validate } from '../middlewares/validator';
import { requireTenantId } from '../utils/tenant';
import { AuthRequest } from '../middlewares/auth';
import { logAction } from '../middlewares/audit-logger';
import { validateImageUpload } from '../middlewares/file-upload-validator';
import { asyncHandler, handleRouteError } from '../utils/route-error-handler';

const router = Router();

// ==========================================
// 1. Static Routes & Collection Routes
// ==========================================

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/',
  authGuard,
  subscriptionGuard,
  supervisorStoresGuard,
  validate({ query: getProductsQuerySchema }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const user = req.user;
    const userRole = user?.role;

    const result = await productService.getProducts(tenantId, req.query as any);
    res.json(result);
  })
);

/**
 * @swagger
 * /api/products/low-stock:
 *   get:
 *     summary: Get low stock products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/low-stock/all',
  authGuard,
  supervisorStoresGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const products = await productService.getLowStockProducts(tenantId);
    res.json(products);
  })
);

/**
 * @swagger
 * /api/products/adjustments:
 *   get:
 *     summary: Get all product adjustments
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/adjustments',
  authGuard,
  subscriptionGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const query = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
      productId: req.query.productId as string | undefined,
      search: req.query.search as string | undefined,
      type: req.query.type as string | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
    };
    const result = await productAdjustmentService.getAdjustments(tenantId, query);
    res.json(result);
  })
);

/**
 * @swagger
 * /api/products/adjustments:
 *   post:
 *     summary: Create product adjustment
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/adjustments',
  authGuard,
  roleGuard('SUPER_ADMIN', 'ADMIN_TENANT', 'SUPERVISOR'),
  subscriptionGuard,
  validate({ body: createProductAdjustmentSchema as any }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const userId = req.userId!;
    const result = await productAdjustmentService.createAdjustment(
      req.body,
      tenantId,
      userId
    );

    // Handle array response for stock transfer
    const adjustments = Array.isArray(result) ? result : [result];

    // Log audit for each adjustment
    for (const adjustment of adjustments) {
      await logAction(
        req,
        'CREATE',
        'product_adjustments',
        adjustment.id,
        {
          productId: adjustment.productId,
          type: adjustment.type,
          quantity: adjustment.quantity,
          reason: adjustment.reason,
          stockUpdate: {
            before: adjustment.stockBefore,
            after: adjustment.stockAfter
          }
        },
        'SUCCESS'
      );
    }

    // Return array for transfer, single object for regular adjustment
    res.status(201).json(Array.isArray(result) ? { data: result, type: 'TRANSFER' } : result);
  })
);

/**
 * @swagger
 * /api/products/adjustments/{id}:
 *   get:
 *     summary: Get product adjustment by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/adjustments/:id',
  authGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const adjustment = await productAdjustmentService.getAdjustmentById(
      req.params.id,
      tenantId
    );
    if (!adjustment) {
      return res.status(404).json({ message: 'Adjustment not found' });
    }
    res.json(adjustment);
  })
);

// ==========================================
// 2. Dynamic Routes (Must be after Static)
// ==========================================

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: Product Name
 *               price:
 *                 type: number
 *                 example: 10000
 *               stock:
 *                 type: integer
 *                 example: 100
 *               category:
 *                 type: string
 *                 example: Category Name
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/',
  authGuard,
  roleGuard('SUPER_ADMIN', 'ADMIN_TENANT', 'SUPERVISOR'),
  subscriptionGuard,
  validateImageUpload, // Validate image upload security
  validate({ body: createProductSchema }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userRole = req.role;
    let tenantId: string;
    if (userRole === 'SUPER_ADMIN') {
      tenantId = req.body.tenantId || req.query.tenantId as string;
      if (!tenantId) {
        return res.status(400).json({ message: 'tenantId is required for super admin' });
      }
    } else {
      tenantId = requireTenantId(req);
    }
    const product = await productService.createProduct(req.body, tenantId, userRole);

    // Log audit
    await logAction(req, 'CREATE', 'products', product.id, { name: product.name, price: product.price }, 'SUCCESS');

    res.status(201).json(product);
  })
);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 price:
 *                   type: number
 *                 stock:
 *                   type: integer
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/:id',
  authGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const product = await productService.getProductById(req.params.id, tenantId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  })
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductRequest'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put(
  '/:id',
  authGuard,
  roleGuard('SUPER_ADMIN', 'ADMIN_TENANT', 'SUPERVISOR'),
  validateImageUpload, // Validate image upload security
  validate({ body: updateProductSchema }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const product = await productService.updateProduct(req.params.id, req.body, tenantId);

    // Log audit
    await logAction(req, 'UPDATE', 'products', product.id, { changes: req.body }, 'SUCCESS');

    res.json(product);
  })
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: Product ID
 *     responses:
 *       204:
 *         description: Product deleted successfully
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.delete(
  '/:id',
  authGuard,
  roleGuard('SUPER_ADMIN', 'ADMIN_TENANT', 'SUPERVISOR'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const product = await productService.getProductById(req.params.id, tenantId);
    await productService.deleteProduct(req.params.id, tenantId);

    // Log audit
    if (product) {
      await logAction(req, 'DELETE', 'products', req.params.id, { name: product.name }, 'SUCCESS');
    }

    res.status(204).send();
  })
);

/**
 * @swagger
 * /api/products/{id}/stock:
 *   put:
 *     summary: Update product stock
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 description: Stock quantity
 *               operation:
 *                 type: string
 *                 enum: [set, add, subtract]
 *                 default: set
 *                 description: Operation type (set, add, or subtract)
 *     responses:
 *       200:
 *         description: Stock updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put(
  '/:id/stock',
  authGuard,
  roleGuard('SUPER_ADMIN', 'ADMIN_TENANT', 'SUPERVISOR'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const { quantity, operation } = req.body;
    const product = await productService.updateStock(
      req.params.id,
      quantity,
      tenantId,
      operation || 'set'
    );
    res.json(product);
  })
);

export default router;
