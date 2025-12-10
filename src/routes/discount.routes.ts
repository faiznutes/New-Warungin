import { Router, Request, Response } from 'express';
import { authGuard } from '../middlewares/auth';
import { subscriptionGuard } from '../middlewares/subscription-guard';
import discountService from '../services/discount.service';
import { validate } from '../middlewares/validator';
import { z } from 'zod';
import { requireTenantId } from '../utils/tenant';
import prisma from '../config/database';
import { getRedisClient } from '../config/redis';
import logger from '../utils/logger';
import { Decimal } from '@prisma/client/runtime/library';

const router = Router();

const createDiscountSchema = z.object({
  name: z.string().min(1, 'Nama diskon harus diisi'),
  discountType: z.enum(['AMOUNT_BASED', 'BUNDLE', 'PRODUCT_BASED', 'QUANTITY_BASED'], {
    errorMap: () => ({ message: 'Tipe diskon tidak valid' })
  }),
  discountValue: z.number({ errorMap: () => ({ message: 'Nilai diskon harus berupa angka' }) })
    .positive('Nilai diskon harus lebih dari 0'),
  discountValueType: z.enum(['PERCENTAGE', 'FIXED'], {
    errorMap: () => ({ message: 'Jenis nilai diskon tidak valid' })
  }),
  minAmount: z.union([z.number().nonnegative(), z.null()]).optional(),
  minQuantity: z.union([z.number().int().positive(), z.null()]).optional(),
  applicableProducts: z.union([
    z.array(z.string()).min(1),
    z.null(),
    z.literal('')
  ]).optional().transform(val => {
    if (!val || val === '' || (Array.isArray(val) && val.length === 0)) {
      return null;
    }
    return Array.isArray(val) ? val : null;
  }),
  bundleProducts: z.union([
    z.array(z.string()).min(1),
    z.null(),
    z.literal('')
  ]).optional().transform(val => {
    if (!val || val === '' || (Array.isArray(val) && val.length === 0)) {
      return null;
    }
    return Array.isArray(val) ? val : null;
  }),
  bundleDiscountProduct: z.union([z.string(), z.null()]).optional(),
  applicableTo: z.enum(['ALL', 'MEMBER_ONLY']).optional().default('ALL'),
  isActive: z.boolean().optional().default(true),
  startDate: z.union([
    z.string().min(1).transform(str => {
      // Accept ISO format, datetime-local format (2024-12-11T10:30), or regular date format
      try {
        const date = new Date(str);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date');
        }
        return date.toISOString();
      } catch {
        throw new Error('Tanggal mulai tidak valid');
      }
    }),
    z.null(),
    z.literal('')
  ]).optional().transform(val => val === '' ? null : val),
  endDate: z.union([
    z.string().min(1).transform(str => {
      // Accept ISO format, datetime-local format (2024-12-11T10:30), or regular date format
      try {
        const date = new Date(str);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date');
        }
        return date.toISOString();
      } catch {
        throw new Error('Tanggal berakhir tidak valid');
      }
    }),
    z.null(),
    z.literal('')
  ]).optional().transform(val => val === '' ? null : val),
}).strict();

const updateDiscountSchema = createDiscountSchema.partial().strict();

/**
 * @swagger
 * /api/discounts:
 *   get:
 *     summary: Get all discounts for tenant
 *     tags: [Discounts]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/',
  authGuard,
  subscriptionGuard,
  async (req: Request, res: Response) => {
    try {
      const tenantId = requireTenantId(req);
      const discounts = await discountService.getDiscounts(tenantId);
      res.json({ data: discounts });
    } catch (error: any) {
      logger.error('Error fetching discounts', {
        error: error.message,
        stack: error.stack,
        tenantId: req.headers['x-tenant-id'] || 'unknown',
      });
      res.status(500).json({
        error: 'SERVER_ERROR',
        message: error.message || 'Gagal memuat diskon. Silakan coba lagi.',
      });
    }
  }
);

/**
 * @swagger
 * /api/discounts/:id:
 *   get:
 *     summary: Get discount by ID
 *     tags: [Discounts]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id',
  authGuard,
  subscriptionGuard,
  async (req: Request, res: Response) => {
    try {
      const tenantId = requireTenantId(req);
      const discount = await prisma.discount.findFirst({
        where: {
          id: req.params.id,
          tenantId,
        },
      });

      if (!discount) {
        return res.status(404).json({ 
          error: 'NOT_FOUND',
          message: 'Diskon tidak ditemukan' 
        });
      }

      res.json({ data: discount });
    } catch (error: any) {
      logger.error('Error fetching discount', {
        error: error.message,
        stack: error.stack,
        discountId: req.params.id,
      });
      res.status(500).json({
        error: 'SERVER_ERROR',
        message: error.message || 'Gagal memuat diskon. Silakan coba lagi.',
      });
    }
  }
);

/**
 * @swagger
 * /api/discounts:
 *   post:
 *     summary: Create a new discount
 *     tags: [Discounts]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  authGuard,
  subscriptionGuard,
  validate({ body: createDiscountSchema }),
  async (req: Request, res: Response) => {
    const tenantId = requireTenantId(req);
    try {
      const userRole = (req as any).user.role;

      // Only ADMIN_TENANT and SUPER_ADMIN can create discounts
      if (userRole !== 'ADMIN_TENANT' && userRole !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Forbidden: Only admin can create discounts' });
      }

      // Log received data for debugging
      logger.info('Creating discount', {
        tenantId,
        discountType: req.body.discountType,
        hasApplicableProducts: !!req.body.applicableProducts,
        hasBundleProducts: !!req.body.bundleProducts,
        hasBundleDiscountProduct: !!req.body.bundleDiscountProduct,
      });

      // Prepare discount data with proper type conversions
      const discountData: any = {
        tenantId,
        name: String(req.body.name).trim(),
        discountType: req.body.discountType,
        discountValue: new Decimal(req.body.discountValue),
        discountValueType: req.body.discountValueType,
        applicableTo: req.body.applicableTo || 'ALL',
        isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : true,
      };
      
      // Handle minAmount
      if (req.body.minAmount !== undefined && req.body.minAmount !== null) {
        discountData.minAmount = new Decimal(req.body.minAmount);
      }
      
      // Handle minQuantity
      if (req.body.minQuantity !== undefined && req.body.minQuantity !== null) {
        discountData.minQuantity = Number(req.body.minQuantity);
      }
      
      // Handle applicableProducts - null if not provided or empty
      if (req.body.applicableProducts !== undefined) {
        discountData.applicableProducts = Array.isArray(req.body.applicableProducts) && req.body.applicableProducts.length > 0
          ? req.body.applicableProducts
          : null;
      }
      
      // Handle bundleProducts - null if not provided or empty
      if (req.body.bundleProducts !== undefined) {
        discountData.bundleProducts = Array.isArray(req.body.bundleProducts) && req.body.bundleProducts.length > 0
          ? req.body.bundleProducts
          : null;
      }
      
      // Handle bundleDiscountProduct - only if bundleProducts exist and product ID is provided
      if (req.body.bundleDiscountProduct && typeof req.body.bundleDiscountProduct === 'string' && req.body.bundleDiscountProduct.trim() !== '') {
        discountData.bundleDiscountProduct = req.body.bundleDiscountProduct.trim();
      } else {
        discountData.bundleDiscountProduct = null;
      }
      
      // Handle dates
      if (req.body.startDate && req.body.startDate !== '') {
        discountData.startDate = new Date(req.body.startDate);
      }
      
      if (req.body.endDate && req.body.endDate !== '') {
        discountData.endDate = new Date(req.body.endDate);
      }

      // Validate: BUNDLE type requires bundleProducts and bundleDiscountProduct
      if (discountData.discountType === 'BUNDLE') {
        if (!discountData.bundleProducts || discountData.bundleProducts.length === 0) {
          return res.status(400).json({
            error: 'VALIDATION_ERROR',
            message: 'Bundle discount memerlukan minimal satu produk bundle yang dipilih',
          });
        }
        if (!discountData.bundleDiscountProduct) {
          return res.status(400).json({
            error: 'VALIDATION_ERROR',
            message: 'Bundle discount memerlukan produk yang akan mendapat diskon',
          });
        }
      }

      const discount = await prisma.discount.create({
        data: discountData,
      });

      // Invalidate analytics cache after discount creation
      await invalidateAnalyticsCache(tenantId);

      logger.info('Discount created successfully', { discountId: discount.id, tenantId });
      res.status(201).json({ data: discount });
    } catch (error: any) {
      logger.error('Error creating discount', {
        error: error.message,
        stack: error.stack,
        tenantId,
        body: req.body,
      });
      
      // Check if it's a Prisma validation error
      if (error.code === 'P2002') {
        return res.status(400).json({ 
          error: 'VALIDATION_ERROR',
          message: 'Data tidak valid. Field yang diisi mungkin duplikat atau tidak valid.',
        });
      }
      
      if (error.code === 'P2003') {
        return res.status(400).json({
          error: 'VALIDATION_ERROR', 
          message: 'Field referensi tidak valid. Pastikan tenant ID dan product ID valid.',
        });
      }
      
      res.status(500).json({ 
        error: 'SERVER_ERROR',
        message: error.message || 'Gagal membuat diskon. Silakan coba lagi.',
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      });
    }
  }
);

/**
 * @swagger
 * /api/discounts/:id:
 *   put:
 *     summary: Update a discount
 *     tags: [Discounts]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/:id',
  authGuard,
  subscriptionGuard,
  validate({ body: updateDiscountSchema }),
  async (req: Request, res: Response) => {
    try {
      const tenantId = requireTenantId(req);
      const userRole = (req as any).user.role;

      // Only ADMIN_TENANT and SUPER_ADMIN can update discounts
      if (userRole !== 'ADMIN_TENANT' && userRole !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Forbidden: Only admin can update discounts' });
      }

      const existingDiscount = await prisma.discount.findFirst({
        where: {
          id: req.params.id,
          tenantId,
        },
      });

      if (!existingDiscount) {
        return res.status(404).json({ message: 'Discount not found' });
      }

      // Prepare update data with proper type conversions
      const updateData: any = {};
      
      if (req.body.name !== undefined) {
        updateData.name = String(req.body.name).trim();
      }
      if (req.body.discountType !== undefined) {
        updateData.discountType = req.body.discountType;
      }
      if (req.body.discountValue !== undefined) {
        updateData.discountValue = new Decimal(req.body.discountValue);
      }
      if (req.body.discountValueType !== undefined) {
        updateData.discountValueType = req.body.discountValueType;
      }
      if (req.body.applicableTo !== undefined) {
        updateData.applicableTo = req.body.applicableTo;
      }
      if (req.body.isActive !== undefined) {
        updateData.isActive = Boolean(req.body.isActive);
      }
      
      // Handle optional fields
      if (req.body.minAmount !== undefined) {
        updateData.minAmount = req.body.minAmount !== null ? new Decimal(req.body.minAmount) : null;
      }
      
      if (req.body.minQuantity !== undefined) {
        updateData.minQuantity = req.body.minQuantity !== null ? Number(req.body.minQuantity) : null;
      }
      
      if (req.body.applicableProducts !== undefined) {
        updateData.applicableProducts = Array.isArray(req.body.applicableProducts) && req.body.applicableProducts.length > 0
          ? req.body.applicableProducts
          : null;
      }
      
      if (req.body.bundleProducts !== undefined) {
        updateData.bundleProducts = Array.isArray(req.body.bundleProducts) && req.body.bundleProducts.length > 0
          ? req.body.bundleProducts
          : null;
      }
      
      // Handle bundleDiscountProduct
      if (req.body.bundleDiscountProduct !== undefined) {
        if (req.body.bundleDiscountProduct && typeof req.body.bundleDiscountProduct === 'string' && req.body.bundleDiscountProduct.trim() !== '') {
          updateData.bundleDiscountProduct = req.body.bundleDiscountProduct.trim();
        } else {
          updateData.bundleDiscountProduct = null;
        }
      }
      
      if (req.body.startDate !== undefined) {
        updateData.startDate = req.body.startDate && req.body.startDate !== '' ? new Date(req.body.startDate) : null;
      }
      
      if (req.body.endDate !== undefined) {
        updateData.endDate = req.body.endDate && req.body.endDate !== '' ? new Date(req.body.endDate) : null;
      }

      const discount = await prisma.discount.update({
        where: { id: req.params.id },
        data: updateData,
      });

      // Invalidate analytics cache after discount update
      await invalidateAnalyticsCache(tenantId);

      logger.info('Discount updated successfully', { discountId: discount.id, tenantId });
      res.json({ data: discount });
    } catch (error: any) {
      logger.error('Error updating discount', {
        error: error.message,
        stack: error.stack,
        tenantId,
        discountId: req.params.id,
      });

      if (error.code === 'P2002') {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Data tidak valid. Field yang diisi mungkin duplikat atau tidak valid.',
        });
      }

      if (error.code === 'P2003') {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Field referensi tidak valid. Pastikan tenant ID dan product ID valid.',
        });
      }

      res.status(500).json({
        error: 'SERVER_ERROR',
        message: error.message || 'Gagal mengupdate diskon. Silakan coba lagi.',
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      });
    }
  }
);

/**
 * @swagger
 * /api/discounts/:id:
 *   delete:
 *     summary: Delete a discount
 *     tags: [Discounts]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:id',
  authGuard,
  subscriptionGuard,
  async (req: Request, res: Response) => {
    try {
      const tenantId = requireTenantId(req);
      const userRole = (req as any).user.role;

      // Only ADMIN_TENANT and SUPER_ADMIN can delete discounts
      if (userRole !== 'ADMIN_TENANT' && userRole !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Forbidden: Only admin can delete discounts' });
      }

      const existingDiscount = await prisma.discount.findFirst({
        where: {
          id: req.params.id,
          tenantId,
        },
      });

      if (!existingDiscount) {
        return res.status(404).json({ message: 'Discount not found' });
      }

      await prisma.discount.delete({
        where: { id: req.params.id },
      });

      // Invalidate analytics cache after discount deletion
      await invalidateAnalyticsCache(tenantId);

      logger.info('Discount deleted successfully', { discountId: req.params.id, tenantId });
      res.json({ data: { message: 'Discount deleted successfully' } });
    } catch (error: any) {
      logger.error('Error deleting discount', {
        error: error.message,
        stack: error.stack,
        tenantId,
        discountId: req.params.id,
      });

      res.status(500).json({
        error: 'SERVER_ERROR',
        message: error.message || 'Gagal menghapus diskon. Silakan coba lagi.',
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      });
    }
  }
);

/**
 * Helper function to invalidate analytics cache
 */
async function invalidateAnalyticsCache(tenantId: string): Promise<void> {
  try {
    const redis = getRedisClient();
    if (redis) {
      // Delete all analytics cache keys for this tenant
      const keys = await redis.keys(`analytics:*:${tenantId}`);
      const keys2 = await redis.keys(`analytics:${tenantId}:*`);
      const allKeys = [...keys, ...keys2];
      if (allKeys.length > 0) {
        await redis.del(...allKeys);
        logger.info('Invalidated analytics cache after discount operation', {
          tenantId,
          cacheKeysDeleted: allKeys.length
        });
      }
    }
  } catch (error: any) {
    logger.warn('Failed to invalidate analytics cache', {
      error: error.message,
      tenantId
    });
  }
}

export default router;

