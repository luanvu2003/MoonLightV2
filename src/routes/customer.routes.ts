import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { Role } from '../types/enums.js';

const router = Router();

router.get('/export/csv', authenticate, requireRole(Role.Admin, Role.Owner), CustomerController.exportCsv);
router.get('/', authenticate, requireRole(Role.Admin, Role.Owner, Role.Staff), CustomerController.getAll);
router.get('/:id', authenticate, requireRole(Role.Admin, Role.Owner, Role.Staff), CustomerController.getById);

export default router;
