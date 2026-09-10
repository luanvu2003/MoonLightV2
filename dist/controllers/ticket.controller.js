import { Ticket } from '../models/Ticket.js';
import { User } from '../models/User.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';
/**
 * Đảm bảo ticket có mảng messages để hiển thị chat dạng tin nhắn qua lại (hỗ trợ dữ liệu cũ)
 */
export const ensureTicketMessages = (ticket) => {
    if (!ticket.messages || ticket.messages.length === 0) {
        const list = [];
        if (ticket.message) {
            list.push({
                senderRole: 'customer',
                senderName: ticket.customerName || 'Khách hàng',
                senderId: ticket.userId,
                message: ticket.message,
                createdAt: ticket.createdAt || new Date()
            });
        }
        if (ticket.reply && ticket.reply.message) {
            list.push({
                senderRole: 'admin',
                senderName: ticket.reply.repliedBy || 'CSKH MoonLight',
                message: ticket.reply.message,
                createdAt: ticket.reply.repliedAt || new Date()
            });
        }
        ticket.messages = list;
    }
};
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
            messages: [
                {
                    senderId: userId,
                    senderRole: 'customer',
                    senderName: customerName,
                    message: message.trim(),
                    createdAt: new Date()
                }
            ],
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
        tickets.forEach(t => ensureTicketMessages(t));
        sendSuccess(res, tickets, 'Lấy danh sách yêu cầu hỗ trợ thành công');
    }
    catch (err) {
        sendError(res, `Lỗi khi tải yêu cầu hỗ trợ: ${err.message}`, 500, 'GET_MY_TICKETS_ERROR');
    }
};
export const getTicketById = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const userId = req.user?.id;
        const userRole = req.user?.role || 'Customer';
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            sendError(res, 'Không tìm thấy yêu cầu hỗ trợ này', 404, 'NOT_FOUND');
            return;
        }
        const isAdminOrStaff = ['Admin', 'Staff', 'Owner'].includes(userRole);
        if (ticket.userId.toString() !== userId && !isAdminOrStaff) {
            sendError(res, 'Bạn không có quyền xem ticket này', 403, 'FORBIDDEN');
            return;
        }
        ensureTicketMessages(ticket);
        sendSuccess(res, ticket, 'Lấy thông tin ticket thành công');
    }
    catch (err) {
        sendError(res, `Lỗi khi tải thông tin ticket: ${err.message}`, 500, 'GET_TICKET_ERROR');
    }
};
export const addTicketMessage = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const userId = req.user?.id;
        const userRole = req.user?.role || 'Customer';
        const { message, replyMessage, status } = req.body;
        const text = (message || replyMessage || '').trim();
        if (!text) {
            sendError(res, 'Nội dung tin nhắn không được để trống', 400, 'VALIDATION_ERROR');
            return;
        }
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            sendError(res, 'Không tìm thấy yêu cầu hỗ trợ', 404, 'NOT_FOUND');
            return;
        }
        const isAdminOrStaff = ['Admin', 'Staff', 'Owner'].includes(userRole);
        const isOwner = ticket.userId.toString() === userId;
        if (!isOwner && !isAdminOrStaff) {
            sendError(res, 'Bạn không có quyền gửi tin nhắn trong yêu cầu này', 403, 'FORBIDDEN');
            return;
        }
        ensureTicketMessages(ticket);
        const senderRole = isAdminOrStaff
            ? (userRole === 'Staff' ? 'staff' : 'admin')
            : 'customer';
        const senderName = isAdminOrStaff
            ? (req.user?.name || req.user?.username || 'CSKH MoonLight')
            : (ticket.customerName || req.user?.name || 'Khách hàng');
        ticket.messages.push({
            senderId: userId,
            senderRole,
            senderName,
            message: text,
            createdAt: new Date()
        });
        if (isAdminOrStaff) {
            ticket.reply = {
                message: text,
                repliedBy: senderName,
                repliedAt: new Date()
            };
            if (status) {
                ticket.status = status;
            }
            else if (ticket.status === 'pending') {
                ticket.status = 'replied';
            }
        }
        else {
            // Khi khách nhắn tin thêm -> tự động chuyển thành 'pending' để bên Admin biết có tin nhắn mới
            ticket.status = 'pending';
        }
        await ticket.save();
        sendSuccess(res, ticket, 'Gửi tin nhắn phản hồi thành công');
    }
    catch (err) {
        sendError(res, `Lỗi khi gửi tin nhắn: ${err.message}`, 500, 'ADD_MESSAGE_ERROR');
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
export const reopenCustomerTicket = async (req, res) => {
    try {
        const userId = req.user?.id;
        const ticketId = req.params.id;
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            sendError(res, 'Không tìm thấy yêu cầu hỗ trợ này', 404, 'NOT_FOUND');
            return;
        }
        const isAdminOrStaff = ['Admin', 'Staff', 'Owner'].includes(req.user?.role);
        if (ticket.userId.toString() !== userId && !isAdminOrStaff) {
            sendError(res, 'Bạn không có quyền thao tác trên ticket này', 403, 'FORBIDDEN');
            return;
        }
        ticket.status = 'pending';
        await ticket.save();
        sendSuccess(res, ticket, 'Đã mở lại yêu cầu hỗ trợ thành công');
    }
    catch (err) {
        sendError(res, `Lỗi khi mở lại ticket: ${err.message}`, 500, 'REOPEN_TICKET_ERROR');
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
        tickets.forEach(t => ensureTicketMessages(t));
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
    // replyTicket sử dụng chung logic tin nhắn addTicketMessage
    await addTicketMessage(req, res);
};
//# sourceMappingURL=ticket.controller.js.map