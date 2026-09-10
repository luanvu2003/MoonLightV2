import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { Role } from '../types/enums.js';
const router = Router();
router.get('/export/csv', authenticate, requireRole(Role.Admin, Role.Owner), ReviewController.exportCsv);
router.get('/product/:productId', ReviewController.getByProduct);
router.get('/', authenticate, requireRole(Role.Admin, Role.Owner, Role.Staff), ReviewController.getAll);
router.post('/', ReviewController.create);
router.put('/:id/reply', authenticate, requireRole(Role.Admin, Role.Owner, Role.Staff), ReviewController.reply);
export default router;
//# sourceMappingURL=review.routes.js.map