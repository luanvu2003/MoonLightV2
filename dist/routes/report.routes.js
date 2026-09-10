import { Router } from 'express';
import { ReportController } from '../controllers/report.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { Role } from '../types/enums.js';
const router = Router();
router.use(authenticate, requireRole(Role.Admin, Role.Owner));
router.get('/overview', ReportController.getOverview);
router.get('/revenue', ReportController.getRevenueChart);
router.get('/top-products', ReportController.getTopProducts);
export default router;
//# sourceMappingURL=report.routes.js.map