import { Router } from 'express';
import { SystemController } from '../controllers/system.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { Role } from '../types/enums.js';

const router = Router();

// Lấy thông số CPU, RAM, Uptime, Database Ping (Chỉ Admin)
router.get('/health', authenticate, requireRole(Role.Admin), SystemController.getHealth);

// 1-Click Cập nhật Git & Reload PM2 (Chỉ Admin)
router.post('/deploy', authenticate, requireRole(Role.Admin), SystemController.deploy);

export default router;
