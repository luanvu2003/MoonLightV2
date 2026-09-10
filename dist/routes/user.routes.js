import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { Role } from '../types/enums.js';
const router = Router();
// Toàn bộ module nhân sự chỉ Admin mới có quyền truy cập
router.use(authenticate, requireRole(Role.Admin));
router.get('/', UserController.getAll);
router.post('/', UserController.create);
router.put('/:id', UserController.update);
router.delete('/:id', UserController.delete);
export default router;
//# sourceMappingURL=user.routes.js.map