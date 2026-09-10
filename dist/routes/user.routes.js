import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { Role } from '../types/enums.js';
const router = Router();
// Endpoint danh sách người dùng & thống kê đơn hàng (Admin, Owner, Staff đều có quyền xem)
router.get('/customers-stats', authenticate, requireRole(Role.Admin, Role.Owner, Role.Staff), UserController.getCustomersWithStats);
router.get('/:id/orders', authenticate, requireRole(Role.Admin, Role.Owner, Role.Staff), UserController.getUserOrderHistory);
// Toàn bộ module quản lý tài khoản nhân sự hệ thống (Chỉ Admin)
router.get('/', authenticate, requireRole(Role.Admin), UserController.getAll);
router.post('/', authenticate, requireRole(Role.Admin), UserController.create);
router.put('/:id', authenticate, requireRole(Role.Admin), UserController.update);
router.delete('/:id', authenticate, requireRole(Role.Admin), UserController.delete);
export default router;
//# sourceMappingURL=user.routes.js.map