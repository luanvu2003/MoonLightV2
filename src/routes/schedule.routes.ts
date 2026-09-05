import { Router } from 'express';
import { ScheduleController } from '../controllers/schedule.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { Role } from '../types/enums.js';

const router = Router();

router.use(authenticate);

// Tất cả tài khoản đã đăng nhập (Admin, Owner, Staff) đều xem được lịch trực
router.get('/', ScheduleController.getAll);

// Thao tác sửa đổi lịch trực: chỉ Admin và Owner
router.post('/', requireRole(Role.Admin, Role.Owner), ScheduleController.create);
router.post('/auto-generate', requireRole(Role.Admin, Role.Owner), ScheduleController.autoGenerate);
router.put('/:id', requireRole(Role.Admin, Role.Owner), ScheduleController.update);
router.delete('/:id', requireRole(Role.Admin, Role.Owner), ScheduleController.delete);

export default router;
