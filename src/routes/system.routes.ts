import { Router } from 'express';
import { SystemController } from '../controllers/system.controller.js';
import { authenticate, requireRole, optionalAuthenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Lấy thông số CPU, RAM, Uptime, Database Ping
router.get('/health', optionalAuthenticate, SystemController.getHealth);

// 1-Click Cập nhật Git & Reload PM2 (Chỉ Admin / Owner)
router.post('/deploy', authenticate, requireRole('Admin', 'Owner'), SystemController.deploy);

export default router;
