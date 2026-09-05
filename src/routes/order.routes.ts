import { Router } from 'express';
import { OrderController } from '../controllers/order.controller.js';
import { authenticate, requireRole, optionalAuthenticate } from '../middleware/auth.middleware.js';
import { Role } from '../types/enums.js';

const router = Router();

router.get('/', authenticate, requireRole(Role.Admin, Role.Owner, Role.Staff), OrderController.getAll);
router.get('/:id', authenticate, requireRole(Role.Admin, Role.Owner, Role.Staff), OrderController.getById);
router.post('/', optionalAuthenticate, OrderController.create);
router.put('/:id/status', authenticate, requireRole(Role.Admin, Role.Owner, Role.Staff), OrderController.updateStatus);
router.delete('/:id', authenticate, requireRole(Role.Admin, Role.Owner), OrderController.delete);

export default router;
