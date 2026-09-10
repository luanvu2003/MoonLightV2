import { Request, Response, NextFunction } from 'express';
export declare class UserController {
    static getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Lấy danh sách người dùng kèm đầy đủ: SĐT, Email, Địa chỉ, Tổng đơn, Tổng tiền và trạng thái giao hàng
     */
    static getCustomersWithStats(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Lấy chi tiết lịch sử đặt hàng của một người dùng và trạng thái giao hàng
     */
    static getUserOrderHistory(req: Request, res: Response, next: NextFunction): Promise<void>;
    static create(req: Request, res: Response, next: NextFunction): Promise<void>;
    static update(req: Request, res: Response, next: NextFunction): Promise<void>;
    static delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}
