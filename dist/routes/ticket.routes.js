import { Router } from 'express';
import { createTicket, getMyTickets, closeCustomerTicket, getAllTickets, replyTicket } from '../controllers/ticket.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { Role } from '../types/enums.js';
const router = Router();
// Routes dành cho Khách hàng (yêu cầu đăng nhập)
router.post('/', authenticate, createTicket);
router.get('/my-tickets', authenticate, getMyTickets);
router.put('/:id/close', authenticate, closeCustomerTicket);
// Routes dành cho Quản trị viên & Nhân viên CSKH
router.get('/', authenticate, requireRole(Role.Admin, Role.Staff, Role.Owner), getAllTickets);
router.put('/:id/reply', authenticate, requireRole(Role.Admin, Role.Staff, Role.Owner), replyTicket);
export default router;
//# sourceMappingURL=ticket.routes.js.map