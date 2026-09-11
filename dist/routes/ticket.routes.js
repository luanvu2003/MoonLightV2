import { Router } from 'express';
import { createTicket, getMyTickets, getTicketById, getTicketLive, setTypingStatus, markTicketSeen, uploadTicketAttachment, addTicketMessage, closeCustomerTicket, reopenCustomerTicket, rateCustomerTicket, getAllTickets, replyTicket } from '../controllers/ticket.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { Role } from '../types/enums.js';
const router = Router();
// Routes dành cho Khách hàng & Người dùng tham gia ticket
router.post('/upload', authenticate, uploadTicketAttachment);
router.post('/', authenticate, createTicket);
router.get('/my-tickets', authenticate, getMyTickets);
router.get('/:id', authenticate, getTicketById);
router.get('/:id/live', authenticate, getTicketLive);
router.post('/:id/typing', authenticate, setTypingStatus);
router.put('/:id/seen', authenticate, markTicketSeen);
router.post('/:id/messages', authenticate, addTicketMessage);
router.put('/:id/close', authenticate, closeCustomerTicket);
router.put('/:id/reopen', authenticate, reopenCustomerTicket);
router.post('/:id/rating', authenticate, rateCustomerTicket);
// Routes dành cho Quản trị viên & Nhân viên CSKH
router.get('/', authenticate, requireRole(Role.Admin, Role.Staff, Role.Owner), getAllTickets);
router.put('/:id/reply', authenticate, requireRole(Role.Admin, Role.Staff, Role.Owner), replyTicket);
export default router;
//# sourceMappingURL=ticket.routes.js.map