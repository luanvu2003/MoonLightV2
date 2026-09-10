import { Request, Response, NextFunction } from 'express';
export declare class OrderController {
    static getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    static create(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updateStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    static delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    static confirmTransfer(req: Request, res: Response, next: NextFunction): Promise<void>;
    static handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void>;
    static checkPaymentStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
}
