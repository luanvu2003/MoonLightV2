import { Request, Response, NextFunction } from 'express';
export declare class SystemController {
    /**
     * Lấy thông số phần cứng, mạng và trạng thái kết nối Database thời gian thực
     */
    static getHealth(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Tự động kéo mã nguồn mới nhất từ GitHub, biên dịch và reload lại ứng dụng (Zero-Downtime)
     */
    static deploy(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Lấy nhật ký PM2 phục vụ chẩn đoán hệ thống
     */
    static getLogs(req: Request, res: Response, next: NextFunction): Promise<void>;
}
