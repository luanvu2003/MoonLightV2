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
    /**
     * Lấy toàn bộ đơn hàng của khách hàng đang đăng nhập kèm trạng thái chi tiết
     */
    static getMyOrders(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Khách hàng tự hủy đơn hàng của mình khi đơn còn ở trạng thái Chờ tiếp nhận (Pending)
     */
    static cancelMyOrder(req: Request, res: Response, next: NextFunction): Promise<void>;
}
