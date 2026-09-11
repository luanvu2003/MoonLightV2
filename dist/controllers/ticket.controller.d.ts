import { Request, Response } from 'express';
/**
 * Đảm bảo ticket có mảng messages và tính toán trạng thái tin nhắn (đang gửi, đã gửi, đã nhận, đã xem)
 */
export declare const ensureTicketMessages: (ticket: any) => void;
export declare const createTicket: (req: Request, res: Response) => Promise<void>;
export declare const getMyTickets: (req: Request, res: Response) => Promise<void>;
export declare const getTicketById: (req: Request, res: Response) => Promise<void>;
/**
 * Cập nhật trạng thái người dùng đang gõ tin nhắn (Typing indicator)
 */
export declare const setTypingStatus: (req: Request, res: Response) => Promise<void>;
/**
 * Đánh dấu đã xem toàn bộ tin nhắn trong cuộc trò chuyện (Mark as seen)
 */
export declare const markTicketSeen: (req: Request, res: Response) => Promise<void>;
/**
 * Lấy dữ liệu live thời gian thực của ticket (Tin nhắn, Typing, Đã xem)
 */
export declare const getTicketLive: (req: Request, res: Response) => Promise<void>;
export declare const uploadTicketAttachment: (req: Request, res: Response) => Promise<void>;
export declare const addTicketMessage: (req: Request, res: Response) => Promise<void>;
export declare const closeCustomerTicket: (req: Request, res: Response) => Promise<void>;
export declare const reopenCustomerTicket: (req: Request, res: Response) => Promise<void>;
export declare const getAllTickets: (req: Request, res: Response) => Promise<void>;
export declare const replyTicket: (req: Request, res: Response) => Promise<void>;
