import { Router, Response } from 'express';
import { authGuard, roleGuard, AuthRequest } from '../middlewares/auth';
import { subscriptionGuard } from '../middlewares/subscription-guard';
import { supervisorStoresGuard } from '../middlewares/supervisor-store-guard';
import customerService from '../services/customer.service';
import { createCustomerSchema, updateCustomerSchema, getCustomersQuerySchema } from '../validators/customer.validator';
import { validate } from '../middlewares/validator';
import { requireTenantId } from '../utils/tenant';
import { asyncHandler, handleRouteError } from '../utils/route-error-handler';

const router = Router();

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Get all customers
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of customers
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
  roleGuard('SUPER_ADMIN', 'ADMIN_TENANT', 'SUPERVISOR', 'CASHIER'),
  subscriptionGuard,
  supervisorStoresGuard,
  validate({ query: getCustomersQuerySchema }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const result = await customerService.getCustomers(tenantId, req.query as any);
    res.json(result);
  })
);

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Get customer by ID
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer details
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/:id',
  authGuard,
  roleGuard('SUPER_ADMIN', 'ADMIN_TENANT', 'SUPERVISOR', 'CASHIER'),
  subscriptionGuard,
  supervisorStoresGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const customer = await customerService.getCustomerById(req.params.id, tenantId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  })
);

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Create new customer
 *     tags: [Customers]
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
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Customer created successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/',
  authGuard,
  roleGuard('SUPER_ADMIN', 'ADMIN_TENANT', 'SUPERVISOR', 'CASHIER'),
  subscriptionGuard,
  validate({ body: createCustomerSchema }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const customer = await customerService.createCustomer(req.body, tenantId);
    res.status(201).json(customer);
  })
);

/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: Update customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: Customer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
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
  roleGuard('SUPER_ADMIN', 'ADMIN_TENANT', 'SUPERVISOR', 'CASHIER'),
  subscriptionGuard,
  validate({ body: updateCustomerSchema }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const customer = await customerService.updateCustomer(req.params.id, req.body, tenantId);
    res.json(customer);
  })
);

/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     summary: Delete customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: Customer ID
 *     responses:
 *       204:
 *         description: Customer deleted successfully
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.delete(
  '/:id',
  authGuard,
  roleGuard('SUPER_ADMIN', 'ADMIN_TENANT', 'SUPERVISOR'),
  subscriptionGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    await customerService.deleteCustomer(req.params.id, tenantId);
    res.status(204).send();
  })
);

export default router;

