import { Ticket } from '../models/Ticket.js';
import { User } from '../models/User.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';
export const createTicket = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            sendError(res, 'Vui lòng đăng nhập để gửi yêu cầu hỗ trợ', 401, 'UNAUTHORIZED');
            return;
        }
        const { category, orderCode, subject, message, priority } = req.body;
        if (!subject || !message) {
            sendError(res, 'Tiêu đề và nội dung yêu cầu là bắt buộc', 400, 'VALIDATION_ERROR');
            return;
        }
        const user = await User.findById(userId);
        const customerName = user?.name || user?.username || 'Khách hàng';
        const customerEmail = user?.email || req.user?.email || '';
        const customerPhone = user?.phone || '';
        const newTicket = await Ticket.create({
            userId,
            customerName,
            customerEmail,
            customerPhone,
            category: category || 'order',
            orderCode: orderCode ? orderCode.trim().toUpperCase() : '',
            subject: subject.trim(),
            message: message.trim(),
            priority: priority === 'urgent' ? 'urgent' : 'normal',
            status: 'pending'
        });
        sendSuccess(res, newTicket, 'Gửi yêu cầu hỗ trợ thành công. Đội ngũ CSKH sẽ phản hồi sớm nhất!', 201);
    }
    catch (err) {
        sendError(res, `Lỗi khi tạo yêu cầu hỗ trợ: ${err.message}`, 500, 'CREATE_TICKET_ERROR');
    }
};
export const getMyTickets = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            sendError(res, 'Vui lòng đăng nhập để xem yêu cầu hỗ trợ', 401, 'UNAUTHORIZED');
            return;
        }
        const tickets = await Ticket.find({ userId }).sort({ createdAt: -1 });
        sendSuccess(res, tickets, 'Lấy danh sách yêu cầu hỗ trợ thành công');
    }
    catch (err) {
        sendError(res, `Lỗi khi tải yêu cầu hỗ trợ: ${err.message}`, 500, 'GET_MY_TICKETS_ERROR');
    }
};
export const closeCustomerTicket = async (req, res) => {
    try {
        const userId = req.user?.id;
        const ticketId = req.params.id;
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            sendError(res, 'Không tìm thấy yêu cầu hỗ trợ này', 404, 'NOT_FOUND');
            return;
        }
        // Kiểm tra quyền: Chủ sở hữu ticket hoặc Admin/Staff
        const isAdminOrStaff = ['Admin', 'Staff', 'Owner'].includes(req.user?.role);
        if (ticket.userId.toString() !== userId && !isAdminOrStaff) {
            sendError(res, 'Bạn không có quyền thao tác trên ticket này', 403, 'FORBIDDEN');
            return;
        }
        ticket.status = 'closed';
        await ticket.save();
        sendSuccess(res, ticket, 'Đã đóng yêu cầu hỗ trợ thành công');
    }
    catch (err) {
        sendError(res, `Lỗi khi đóng ticket: ${err.message}`, 500, 'CLOSE_TICKET_ERROR');
    }
};
// ================= ADMIN & STAFF APIS =================
export const getAllTickets = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const status = req.query.status;
        const category = req.query.category;
        const search = req.query.search;
        const filter = {};
        if (status && status !== 'all') {
            filter.status = status;
        }
        if (category && category !== 'all') {
            filter.category = category;
        }
        if (search) {
            filter.$or = [
                { ticketCode: { $regex: search, $options: 'i' } },
                { customerName: { $regex: search, $options: 'i' } },
                { customerEmail: { $regex: search, $options: 'i' } },
                { orderCode: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } }
            ];
        }
        const total = await Ticket.countDocuments(filter);
        const tickets = await Ticket.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        sendPaginated(res, tickets, {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        });
    }
    catch (err) {
        sendError(res, `Lỗi khi lấy danh sách ticket: ${err.message}`, 500, 'GET_ALL_TICKETS_ERROR');
    }
};
export const replyTicket = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const { message, status } = req.body;
        if (!message || !message.trim()) {
            sendError(res, 'Nội dung phản hồi không được để trống', 400, 'VALIDATION_ERROR');
            return;
        }
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            sendError(res, 'Không tìm thấy ticket cần phản hồi', 404, 'NOT_FOUND');
            return;
        }
        const replierName = req.user?.name || req.user?.username || 'CSKH MoonLight';
        ticket.reply = {
            message: message.trim(),
            repliedBy: replierName,
            repliedAt: new Date()
        };
        ticket.status = status || 'replied';
        await ticket.save();
        sendSuccess(res, ticket, 'Đã gửi phản hồi cho khách hàng thành công');
    }
    catch (err) {
        sendError(res, `Lỗi khi phản hồi ticket: ${err.message}`, 500, 'REPLY_TICKET_ERROR');
    }
};
//# sourceMappingURL=ticket.controller.js.map