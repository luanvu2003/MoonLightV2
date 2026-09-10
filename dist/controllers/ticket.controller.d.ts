import { Request, Response } from 'express';
/**
 * Đảm bảo ticket có mảng messages để hiển thị chat dạng tin nhắn qua lại (hỗ trợ dữ liệu cũ)
 */
export declare const ensureTicketMessages: (ticket: any) => void;
export declare const createTicket: (req: Request, res: Response) => Promise<void>;
export declare const getMyTickets: (req: Request, res: Response) => Promise<void>;
export declare const getTicketById: (req: Request, res: Response) => Promise<void>;
export declare const addTicketMessage: (req: Request, res: Response) => Promise<void>;
export declare const closeCustomerTicket: (req: Request, res: Response) => Promise<void>;
export declare const reopenCustomerTicket: (req: Request, res: Response) => Promise<void>;
export declare const getAllTickets: (req: Request, res: Response) => Promise<void>;
export declare const replyTicket: (req: Request, res: Response) => Promise<void>;
