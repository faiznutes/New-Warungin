import { Router, Response } from 'express';
import { authGuard, AuthRequest } from '../middlewares/auth';
import employeeService from '../services/employee.service';
import { validate } from '../middlewares/validator';
import { z } from 'zod';
import { requireTenantId } from '../utils/tenant';
import { auditLogger } from '../middlewares/audit-logger';
import { asyncHandler } from '../utils/route-error-handler';

const router = Router();

const createEmployeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  position: z.string().min(1, 'Position is required'),
});

const updateEmployeeSchema = createEmployeeSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// Get all employees
router.get(
  '/',
  authGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;
    const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;

    const result = await employeeService.getEmployees(tenantId, page, limit, search, isActive);
    res.json(result);
  })
);

// Get employee statistics
router.get(
  '/stats',
  authGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const stats = await employeeService.getEmployeeStats(tenantId);
    res.json(stats);
  })
);

// Get employee by ID
router.get(
  '/:id',
  authGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const employee = await employeeService.getEmployeeById(req.params.id, tenantId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  })
);

// Create employee
router.post(
  '/',
  authGuard,
  validate({ body: createEmployeeSchema }),
  auditLogger('CREATE', 'employees'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const employee = await employeeService.createEmployee(req.body, tenantId);
    res.status(201).json(employee);
  })
);

// Update employee
router.put(
  '/:id',
  authGuard,
  validate({ body: updateEmployeeSchema }),
  auditLogger('UPDATE', 'employees'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const employee = await employeeService.updateEmployee(req.params.id, req.body, tenantId);
    res.json(employee);
  })
);

// Delete employee
router.delete(
  '/:id',
  authGuard,
  auditLogger('DELETE', 'employees'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    await employeeService.deleteEmployee(req.params.id, tenantId);
    res.status(204).send();
  })
);

export default router;

