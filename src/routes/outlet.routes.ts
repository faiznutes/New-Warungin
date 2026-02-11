import { Router, Response } from 'express';
import { authGuard, roleGuard, AuthRequest } from '../middlewares/auth';
import { subscriptionGuard } from '../middlewares/subscription-guard';
// import { supervisorStoresGuard } from '../middlewares/supervisor-store-guard';
import outletService from '../services/outlet.service';
import { validate } from '../middlewares/validator';
import { requireTenantId } from '../utils/tenant';
import { z } from 'zod';
import { asyncHandler, handleRouteError } from '../utils/route-error-handler';

const router = Router();

const createOutletSchema = z.object({
  name: z.string().min(1, 'Nama outlet wajib diisi'),
  address: z.string().optional(),
  phone: z.string().optional(),
});

const updateOutletSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
  shiftConfig: z.array(z.object({
    name: z.string(),
    startTime: z.string(),
    endTime: z.string()
  })).optional(),
  operatingHours: z.record(z.string(), z.object({
    open: z.string(),
    close: z.string(),
    isOpen: z.boolean()
  })).optional(),
});

/**
 * @swagger
 * /api/outlets:
 *   get:
 *     summary: Get all outlets for current tenant
 *     tags: [Outlets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of outlets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Outlet'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/',
  authGuard,
  subscriptionGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50; // Default 50 for outlets
    const userRole = req.role;
    const userPermissions = (req as any).user?.permissions;
    const result = await outletService.getOutlets(tenantId, page, limit, userRole, userPermissions);
    res.json(result);
  })
);

/**
 * @swagger
 * /api/outlets/{id}:
 *   get:
 *     summary: Get outlet by ID
 *     tags: [Outlets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Outlet ID
 *     responses:
 *       200:
 *         description: Outlet details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Outlet'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/:id',
  authGuard,
  subscriptionGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const outlet = await outletService.getOutlet(tenantId, req.params.id);
    res.json({ data: outlet });
  })
);

/**
 * @swagger
 * /api/outlets:
 *   post:
 *     summary: Create new outlet
 *     tags: [Outlets]
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: Outlet Pusat
 *               address:
 *                 type: string
 *                 example: "Jl. Raya No. 123"
 *               phone:
 *                 type: string
 *                 example: "081234567890"
 *     responses:
 *       201:
 *         description: Outlet created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Outlet'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/',
  authGuard,
  roleGuard('ADMIN_TENANT', 'SUPER_ADMIN'),
  subscriptionGuard,
  validate({ body: createOutletSchema }),
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
    const outlet = await outletService.createOutlet(tenantId, req.body);
    res.status(201).json({ data: outlet });
  })
);

/**
 * @swagger
 * /api/outlets/{id}:
 *   put:
 *     summary: Update outlet
 *     tags: [Outlets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Outlet ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Outlet updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Outlet'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put(
  '/:id',
  authGuard,
  roleGuard('ADMIN_TENANT', 'SUPER_ADMIN'),
  subscriptionGuard,
  validate({ body: updateOutletSchema }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const userRole = req.role;
    const userPermissions = (req as any).user?.permissions;
    const outlet = await outletService.updateOutlet(tenantId, req.params.id, req.body, userRole, userPermissions);
    res.json({ data: outlet });
  })
);

/**
 * @swagger
 * /api/outlets/{id}:
 *   delete:
 *     summary: Delete outlet (soft delete if has orders)
 *     tags: [Outlets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Outlet ID
 *     responses:
 *       200:
 *         description: Outlet deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Outlet berhasil dihapus"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.delete(
  '/:id',
  authGuard,
  roleGuard('ADMIN_TENANT', 'SUPER_ADMIN'),
  subscriptionGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    await outletService.deleteOutlet(tenantId, req.params.id);
    res.json({ message: 'Outlet berhasil dihapus' });
  })
);

/**
 * @swagger
 * /api/outlets/{id}/duplicate:
 *   post:
 *     summary: Duplicate an outlet with new name
 *     tags: [Outlets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Outlet ID to duplicate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newName
 *             properties:
 *               newName:
 *                 type: string
 *                 example: "Outlet Cabang Baru"
 *     responses:
 *       201:
 *         description: Outlet duplicated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Outlet'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/:id/duplicate',
  authGuard,
  roleGuard('ADMIN_TENANT', 'SUPER_ADMIN'),
  subscriptionGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const { newName } = req.body;

    if (!newName) {
      return res.status(400).json({ message: 'Nama outlet baru harus diisi' });
    }

    const originalOutlet = await outletService.getOutlet(tenantId, req.params.id);

    const duplicatedOutlet = await outletService.createOutlet(tenantId, {
      name: newName,
      address: (originalOutlet as any).address || undefined,
      phone: (originalOutlet as any).phone || undefined,
      shiftConfig: (originalOutlet as any).shiftConfig || undefined,
      operatingHours: (originalOutlet as any).operatingHours || undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Outlet duplicated successfully',
      data: duplicatedOutlet
    });
  })
);

export default router;

