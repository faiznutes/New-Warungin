import { Router, Request, Response } from 'express';
import { authGuard } from '../middlewares/auth';
import { subscriptionGuard } from '../middlewares/subscription-guard';
import { checkAddProductsAddon } from '../middlewares/addon-guard';
import productService from '../services/product.service';
import productAdjustmentService, { createProductAdjustmentSchema } from '../services/product-adjustment.service';
import { createProductSchema, updateProductSchema, getProductsQuerySchema } from '../validators/product.validator';
import { validate } from '../middlewares/validator';
import { requireTenantId } from '../utils/tenant';
import { AuthRequest } from '../middlewares/auth';
import { logAction } from '../middlewares/audit-logger';
import { validateImageUpload } from '../middlewares/file-upload-validator';
import { handleRouteError } from '../utils/route-error-handler';
import prisma from '../config/database';

const router = Router();

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
  validate({ query: getProductsQuerySchema }),
  async (req: Request, res: Response) => {
    try {
      const tenantId = requireTenantId(req);
      const result = await productService.getProducts(tenantId, req.query as any);
      
      // Get product limit info
      const { getTenantPlanFeatures } = await import('../services/plan-features.service');
      const features = await getTenantPlanFeatures(tenantId);
      const productLimit = features.limits.products;
      
      // Get total active products count (always get from database for accuracy)
      const totalActiveProducts = await prisma.product.count({
        where: { tenantId, isActive: true },
      });
      
      res.json({ 
        ...result,
        limit: {
          max: productLimit,
          current: totalActiveProducts,
          remaining: productLimit === -1 ? -1 : Math.max(0, productLimit - totalActiveProducts),
          isUnlimited: productLimit === -1,
        }
      });
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to process request', 'PRODUCT');
    }
  }
);

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
  subscriptionGuard,
  validateImageUpload, // Validate image upload security
  validate({ body: createProductSchema }),
  async (req: AuthRequest, res: Response) => {
    try {
      const tenantId = requireTenantId(req);
      const product = await productService.createProduct(req.body, tenantId);
      
      // Log audit
      await logAction(req, 'CREATE', 'products', product.id, { name: product.name, price: product.price }, 'SUCCESS');
      
      res.status(201).json(product);
    } catch (error: unknown) {
      await logAction(req, 'CREATE', 'products', null, { error: (error as Error).message }, 'FAILED', (error as Error).message);
      handleRouteError(res, error, 'Failed to create product', 'CREATE_PRODUCT');
    }
  }
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
  async (req: Request, res: Response) => {
    try {
      const tenantId = requireTenantId(req);
      const { quantity, operation } = req.body;
      const product = await productService.updateStock(
        req.params.id,
        quantity,
        tenantId,
        operation || 'set'
      );
      res.json(product);
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to process request', 'PRODUCT');
    }
  }
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
  async (req: Request, res: Response) => {
    try {
      const tenantId = requireTenantId(req);
      const products = await productService.getLowStockProducts(tenantId);
      res.json(products);
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to process request', 'PRODUCT');
    }
  }
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
  async (req: Request, res: Response) => {
    try {
      const tenantId = requireTenantId(req);
      const query = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        productId: req.query.productId as string | undefined,
        search: req.query.search as string | undefined,
        type: req.query.type as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        reason: req.query.reason as string | undefined,
      };
      const result = await productAdjustmentService.getAdjustments(tenantId, query);
      res.json(result);
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to process request', 'PRODUCT');
    }
  }
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
  subscriptionGuard,
  validate({ body: createProductAdjustmentSchema }),
  async (req: AuthRequest, res: Response) => {
    try {
      const tenantId = requireTenantId(req);
      const userId = req.userId!;
      const adjustment = await productAdjustmentService.createAdjustment(
        req.body,
        tenantId,
        userId
      );
      
      // Log audit
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
        },
        'SUCCESS'
      );
      
      res.status(201).json(adjustment);
    } catch (error: any) {
      await logAction(req, 'CREATE', 'product_adjustments', null, { error: error.message }, 'FAILED', error.message);
      handleRouteError(res, error, 'Failed to create product adjustment', 'CREATE_PRODUCT_ADJUSTMENT');
    }
  }
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
  async (req: Request, res: Response) => {
    try {
      const tenantId = requireTenantId(req);
      const adjustment = await productAdjustmentService.getAdjustmentById(
        req.params.id,
        tenantId
      );
      if (!adjustment) {
        return res.status(404).json({ message: 'Adjustment not found' });
      }
      res.json(adjustment);
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to process request', 'PRODUCT');
    }
  }
);

/**
 * @swagger
 * /api/products/bulk-import:
 *   post:
 *     summary: Bulk import products from CSV/Excel file
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV or Excel file containing products
 *     responses:
 *       200:
 *         description: Products imported successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/bulk-import',
  authGuard,
  subscriptionGuard,
  checkAddProductsAddon,
  async (req: AuthRequest, res: Response) => {
    try {
      const tenantId = requireTenantId(req);
      const userId = req.userId!;

      // Bulk import implementation - accepts JSON array of products
      // Request body: { products: [{ name, price, stock, ... }] }
      const { products } = req.body;

      if (!Array.isArray(products) || products.length === 0) {
        const error = new Error('Products array is required and must not be empty');
        (error as any).statusCode = 400;
        handleRouteError(res, error, 'Products array is required and must not be empty', 'BULK_IMPORT_PRODUCTS');
        return;
      }

      const createdProducts = [];
      const errors = [];

      for (let i = 0; i < products.length; i++) {
        const row = products[i];
        try {
          const productData = {
            name: row.name?.trim(),
            sku: row.sku?.trim() || undefined,
            barcode: row.barcode?.trim() || undefined,
            price: parseFloat(row.price) || 0,
            cost: row.cost ? parseFloat(row.cost) : undefined,
            stock: parseInt(row.stock) || 0,
            minStock: row.minStock ? parseInt(row.minStock) : undefined,
            category: row.category?.trim() || undefined,
            description: row.description?.trim() || undefined,
            isActive: row.isActive !== false && row.isActive !== 'false',
          };

          if (!productData.name) {
            errors.push({ index: i, row, error: 'Name is required' });
            continue;
          }

          if (productData.price <= 0) {
            errors.push({ index: i, row, error: 'Price must be greater than 0' });
            continue;
          }

          const product = await productService.createProduct(productData, tenantId);
          createdProducts.push({ id: product.id, name: product.name });
        } catch (error: any) {
          errors.push({ index: i, row, error: error.message || 'Failed to create product' });
        }
      }

      // Log audit
      await logAction(req, 'BULK_IMPORT', 'products', null, { 
        created: createdProducts.length, 
        errors: errors.length,
        total: products.length 
      }, createdProducts.length > 0 ? 'SUCCESS' : 'FAILED');

      res.json({
        message: `Bulk import completed: ${createdProducts.length} products created, ${errors.length} errors`,
        created: createdProducts.length,
        errors: errors.length,
        total: products.length,
        createdProducts: createdProducts,
        errorDetails: errors.length > 0 ? errors : undefined,
      });
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to import products', 'BULK_IMPORT_PRODUCTS');
    }
  }
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
  async (req: Request, res: Response) => {
    try {
      const tenantId = requireTenantId(req);
      const product = await productService.getProductById(req.params.id, tenantId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to process request', 'PRODUCT');
    }
  }
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
  validateImageUpload, // Validate image upload security
  validate({ body: updateProductSchema }),
  async (req: AuthRequest, res: Response) => {
    try {
      const tenantId = requireTenantId(req);
      const product = await productService.updateProduct(req.params.id, req.body, tenantId);
      
      // Log audit
      await logAction(req, 'UPDATE', 'products', product.id, { changes: req.body }, 'SUCCESS');
      
      res.json(product);
    } catch (error: unknown) {
      await logAction(req, 'UPDATE', 'products', req.params.id, { error: (error as Error).message }, 'FAILED', (error as Error).message);
      handleRouteError(res, error, 'Failed to update product', 'UPDATE_PRODUCT');
    }
  }
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
  async (req: AuthRequest, res: Response) => {
    try {
      const tenantId = requireTenantId(req);
      const product = await productService.getProductById(req.params.id, tenantId);
      await productService.deleteProduct(req.params.id, tenantId);
      
      // Log audit
      if (product) {
        await logAction(req, 'DELETE', 'products', req.params.id, { name: product.name }, 'SUCCESS');
      }
      
      res.status(204).send();
    } catch (error: unknown) {
      await logAction(req, 'DELETE', 'products', req.params.id, { error: (error as Error).message }, 'FAILED', (error as Error).message);
      handleRouteError(res, error, 'Failed to delete product', 'DELETE_PRODUCT');
    }
  }
);

export default router;

