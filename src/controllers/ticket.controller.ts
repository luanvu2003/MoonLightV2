import { Request, Response } from 'express';
import { Ticket } from '../models/Ticket.js';
import { User } from '../models/User.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';

interface ITypingUser {
  isTyping: boolean;
  name: string;
  updatedAt: number;
}

// Lưu trữ trạng thái đang soạn tin (typing) trong RAM theo từng ticket
const typingState: Record<string, {
  customer?: ITypingUser;
  admin?: ITypingUser;
}> = {};

/**
 * Đảm bảo ticket có mảng messages và tính toán trạng thái tin nhắn (đang gửi, đã gửi, đã nhận, đã xem)
 */
export const ensureTicketMessages = (ticket: any): void => {
  const adminSeenTime = ticket.adminLastSeenAt ? new Date(ticket.adminLastSeenAt).getTime() : 0;
  const custSeenTime = ticket.customerLastSeenAt ? new Date(ticket.customerLastSeenAt).getTime() : 0;

  if (!ticket.messages || ticket.messages.length === 0) {
    const list: any[] = [];
    if (ticket.message) {
      const msgTime = ticket.createdAt ? new Date(ticket.createdAt).getTime() : Date.now();
      list.push({
        senderRole: 'customer',
        senderName: ticket.customerName || 'Khách hàng',
        senderId: ticket.userId,
        message: ticket.message,
        status: adminSeenTime >= msgTime ? 'seen' : 'delivered',
        seenAt: adminSeenTime >= msgTime ? ticket.adminLastSeenAt : null,
        createdAt: ticket.createdAt || new Date()
      });
    }
    if (ticket.reply && ticket.reply.message) {
      const repTime = ticket.reply.repliedAt ? new Date(ticket.reply.repliedAt).getTime() : Date.now();
      list.push({
        senderRole: 'admin',
        senderName: ticket.reply.repliedBy || 'CSKH MoonLight',
        message: ticket.reply.message,
        status: custSeenTime >= repTime ? 'seen' : 'delivered',
        seenAt: custSeenTime >= repTime ? ticket.customerLastSeenAt : null,
        createdAt: ticket.reply.repliedAt || new Date()
      });
    }
    ticket.messages = list;
  } else {
    // Cập nhật trạng thái từng tin nhắn theo thời gian đối phương đã xem
    ticket.messages.forEach((m: any) => {
      const mTime = m.createdAt ? new Date(m.createdAt).getTime() : Date.now();
      if (m.senderRole === 'customer') {
        if (adminSeenTime >= mTime) {
          m.status = 'seen';
          m.seenAt = ticket.adminLastSeenAt;
        } else if (!m.status || m.status === 'sending') {
          m.status = 'delivered';
        }
      } else {
        if (custSeenTime >= mTime) {
          m.status = 'seen';
          m.seenAt = ticket.customerLastSeenAt;
        } else if (!m.status || m.status === 'sending') {
          m.status = 'delivered';
        }
      }
    });
  }
};

export const createTicket = async (req: Request, res: Response): Promise<void> => {
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
    const customerEmail = user?.email || (req.user as any)?.email || '';
    const customerPhone = user?.phone || '';
    const now = new Date();

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
          status: 'delivered',
          createdAt: now
        }
      ],
      customerLastSeenAt: now,
      adminLastSeenAt: null,
      priority: priority === 'urgent' ? 'urgent' : 'normal',
      status: 'pending'
    });

    sendSuccess(res, newTicket, 'Gửi yêu cầu hỗ trợ thành công. Đội ngũ CSKH sẽ phản hồi sớm nhất!', 201);
  } catch (err: any) {
    sendError(res, `Lỗi khi tạo yêu cầu hỗ trợ: ${err.message}`, 500, 'CREATE_TICKET_ERROR');
  }
};

export const getMyTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      sendError(res, 'Vui lòng đăng nhập để xem yêu cầu hỗ trợ', 401, 'UNAUTHORIZED');
      return;
    }

    const tickets = await Ticket.find({ userId }).sort({ createdAt: -1 });
    tickets.forEach(t => ensureTicketMessages(t));
    sendSuccess(res, tickets, 'Lấy danh sách yêu cầu hỗ trợ thành công');
  } catch (err: any) {
    sendError(res, `Lỗi khi tải yêu cầu hỗ trợ: ${err.message}`, 500, 'GET_MY_TICKETS_ERROR');
  }
};

export const getTicketById = async (req: Request, res: Response): Promise<void> => {
  try {
    const ticketId = req.params.id as string;
    const userId = req.user?.id;
    const userRole = (req.user?.role as string) || 'Customer';

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
  } catch (err: any) {
    sendError(res, `Lỗi khi tải thông tin ticket: ${err.message}`, 500, 'GET_TICKET_ERROR');
  }
};

/**
 * Cập nhật trạng thái người dùng đang gõ tin nhắn (Typing indicator)
 */
export const setTypingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const ticketId = req.params.id as string;
    const userRole = (req.user?.role as string) || 'Customer';
    const isTyping = Boolean(req.body.isTyping);
    const isAdminOrStaff = ['Admin', 'Staff', 'Owner'].includes(userRole);

    if (!typingState[ticketId]) {
      typingState[ticketId] = {};
    }

    const senderName = isAdminOrStaff
      ? (req.user?.name || req.user?.username || 'CSKH MoonLight')
      : (req.user?.name || 'Khách hàng');

    if (isAdminOrStaff) {
      typingState[ticketId].admin = {
        isTyping,
        name: senderName,
        updatedAt: Date.now()
      };
    } else {
      typingState[ticketId].customer = {
        isTyping,
        name: senderName,
        updatedAt: Date.now()
      };
    }

    sendSuccess(res, { ok: true }, 'Cập nhật trạng thái đang nhập');
  } catch (err: any) {
    sendError(res, `Lỗi khi cập nhật typing: ${err.message}`, 500, 'TYPING_ERROR');
  }
};

/**
 * Đánh dấu đã xem toàn bộ tin nhắn trong cuộc trò chuyện (Mark as seen)
 */
export const markTicketSeen = async (req: Request, res: Response): Promise<void> => {
  try {
    const ticketId = req.params.id as string;
    const userId = req.user?.id;
    const userRole = (req.user?.role as string) || 'Customer';

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      sendError(res, 'Không tìm thấy ticket', 404, 'NOT_FOUND');
      return;
    }

    const isAdminOrStaff = ['Admin', 'Staff', 'Owner'].includes(userRole);
    const isOwner = ticket.userId.toString() === userId;

    if (!isOwner && !isAdminOrStaff) {
      sendError(res, 'Bạn không có quyền', 403, 'FORBIDDEN');
      return;
    }

    const now = new Date();
    if (isAdminOrStaff) {
      ticket.adminLastSeenAt = now;
    } else {
      ticket.customerLastSeenAt = now;
    }

    await ticket.save();
    sendSuccess(res, {
      customerLastSeenAt: ticket.customerLastSeenAt,
      adminLastSeenAt: ticket.adminLastSeenAt
    }, 'Đã cập nhật trạng thái đã xem');
  } catch (err: any) {
    sendError(res, `Lỗi khi cập nhật đã xem: ${err.message}`, 500, 'SEEN_ERROR');
  }
};

/**
 * Lấy dữ liệu live thời gian thực của ticket (Tin nhắn, Typing, Đã xem)
 */
export const getTicketLive = async (req: Request, res: Response): Promise<void> => {
  try {
    const ticketId = req.params.id as string;
    const userId = req.user?.id;
    const userRole = (req.user?.role as string) || 'Customer';

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      sendError(res, 'Không tìm thấy ticket', 404, 'NOT_FOUND');
      return;
    }

    const isAdminOrStaff = ['Admin', 'Staff', 'Owner'].includes(userRole);
    const isOwner = ticket.userId.toString() === userId;

    if (!isOwner && !isAdminOrStaff) {
      sendError(res, 'Bạn không có quyền', 403, 'FORBIDDEN');
      return;
    }

    // Tự động đánh dấu đã xem khi mở poll live
    const now = new Date();
    if (isAdminOrStaff) {
      ticket.adminLastSeenAt = now;
      await ticket.save();
    } else {
      ticket.customerLastSeenAt = now;
      await ticket.save();
    }

    ensureTicketMessages(ticket);

    // Lọc trạng thái typing (chỉ giữ nếu < 3500ms)
    const tState = typingState[ticketId] || {};
    const nowMs = Date.now();
    const isCustTyping = !!(tState.customer?.isTyping && nowMs - tState.customer.updatedAt < 3500);
    const isAdminTyping = !!(tState.admin?.isTyping && nowMs - tState.admin.updatedAt < 3500);

    sendSuccess(res, {
      ticket,
      typing: {
        customer: { isTyping: isCustTyping, name: tState.customer?.name || 'Khách hàng' },
        admin: { isTyping: isAdminTyping, name: tState.admin?.name || 'CSKH MoonLight' }
      },
      customerLastSeenAt: ticket.customerLastSeenAt,
      adminLastSeenAt: ticket.adminLastSeenAt
    }, 'Lấy thông tin trực tiếp thành công');
  } catch (err: any) {
    sendError(res, `Lỗi khi lấy live ticket: ${err.message}`, 500, 'LIVE_ERROR');
  }
};

export const addTicketMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const ticketId = req.params.id as string;
    const userId = req.user?.id;
    const userRole = (req.user?.role as string) || 'Customer';
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

    const senderRole: 'customer' | 'admin' | 'staff' = isAdminOrStaff
      ? (userRole === 'Staff' ? 'staff' : 'admin')
      : 'customer';

    const senderName = isAdminOrStaff
      ? (req.user?.name || req.user?.username || 'CSKH MoonLight')
      : (ticket.customerName || req.user?.name || 'Khách hàng');

    const now = new Date();

    // Tin nhắn mới tạo sẽ có trạng thái 'delivered' (đã nhận vào hệ thống)
    ticket.messages.push({
      senderId: userId,
      senderRole,
      senderName,
      message: text,
      status: 'delivered',
      createdAt: now
    } as any);

    // Xóa trạng thái typing khi đã gửi
    if (typingState[ticketId]) {
      if (isAdminOrStaff && typingState[ticketId].admin) {
        typingState[ticketId].admin!.isTyping = false;
      } else if (!isAdminOrStaff && typingState[ticketId].customer) {
        typingState[ticketId].customer!.isTyping = false;
      }
    }

    if (isAdminOrStaff) {
      ticket.adminLastSeenAt = now;
      ticket.reply = {
        message: text,
        repliedBy: senderName,
        repliedAt: now
      };
      if (status) {
        ticket.status = status;
      } else if (ticket.status === 'pending') {
        ticket.status = 'replied';
      }
    } else {
      ticket.customerLastSeenAt = now;
      // Khi khách nhắn tin thêm -> tự động chuyển thành 'pending' để bên Admin biết có tin nhắn mới
      ticket.status = 'pending';
    }

    await ticket.save();
    ensureTicketMessages(ticket);

    sendSuccess(res, ticket, 'Gửi tin nhắn phản hồi thành công');
  } catch (err: any) {
    sendError(res, `Lỗi khi gửi tin nhắn: ${err.message}`, 500, 'ADD_MESSAGE_ERROR');
  }
};

export const closeCustomerTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const ticketId = req.params.id as string;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      sendError(res, 'Không tìm thấy yêu cầu hỗ trợ này', 404, 'NOT_FOUND');
      return;
    }

    // Kiểm tra quyền: Chủ sở hữu ticket hoặc Admin/Staff
    const isAdminOrStaff = ['Admin', 'Staff', 'Owner'].includes(req.user?.role as string);
    if (ticket.userId.toString() !== userId && !isAdminOrStaff) {
      sendError(res, 'Bạn không có quyền thao tác trên ticket này', 403, 'FORBIDDEN');
      return;
    }

    ticket.status = 'closed';
    await ticket.save();

    sendSuccess(res, ticket, 'Đã đóng yêu cầu hỗ trợ thành công');
  } catch (err: any) {
    sendError(res, `Lỗi khi đóng ticket: ${err.message}`, 500, 'CLOSE_TICKET_ERROR');
  }
};

export const reopenCustomerTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const ticketId = req.params.id as string;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      sendError(res, 'Không tìm thấy yêu cầu hỗ trợ này', 404, 'NOT_FOUND');
      return;
    }

    const isAdminOrStaff = ['Admin', 'Staff', 'Owner'].includes(req.user?.role as string);
    if (ticket.userId.toString() !== userId && !isAdminOrStaff) {
      sendError(res, 'Bạn không có quyền thao tác trên ticket này', 403, 'FORBIDDEN');
      return;
    }

    ticket.status = 'pending';
    await ticket.save();

    sendSuccess(res, ticket, 'Đã mở lại yêu cầu hỗ trợ thành công');
  } catch (err: any) {
    sendError(res, `Lỗi khi mở lại ticket: ${err.message}`, 500, 'REOPEN_TICKET_ERROR');
  }
};

// ================= ADMIN & STAFF APIS =================

export const getAllTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const status = req.query.status as string;
    const category = req.query.category as string;
    const search = req.query.search as string;

    const filter: any = {};
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
  } catch (err: any) {
    sendError(res, `Lỗi khi lấy danh sách ticket: ${err.message}`, 500, 'GET_ALL_TICKETS_ERROR');
  }
};

export const replyTicket = async (req: Request, res: Response): Promise<void> => {
  await addTicketMessage(req, res);
};
