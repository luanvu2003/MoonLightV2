import { Request, Response } from 'express';
export declare const createTicket: (req: Request, res: Response) => Promise<void>;
export declare const getMyTickets: (req: Request, res: Response) => Promise<void>;
export declare const closeCustomerTicket: (req: Request, res: Response) => Promise<void>;
export declare const getAllTickets: (req: Request, res: Response) => Promise<void>;
export declare const replyTicket: (req: Request, res: Response) => Promise<void>;
