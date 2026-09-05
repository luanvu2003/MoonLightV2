import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { Role } from '../types/enums.js';

const router = Router();

router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);
router.post('/', authenticate, requireRole(Role.Admin, Role.Owner), ProductController.create);
router.put('/:id', authenticate, requireRole(Role.Admin, Role.Owner), ProductController.update);
router.delete('/:id', authenticate, requireRole(Role.Admin), ProductController.delete);

export default router;
