import { Request, Response, NextFunction } from 'express';
export declare const SAMPLE_MODELS: {
    id: string;
    name: string;
    gender: string;
    height: string;
    weight: string;
    avatar: string;
    fullBodyImage: string;
    description: string;
}[];
export declare class AIController {
    /**
     * Lấy danh sách người mẫu ảo mẫu có sẵn
     */
    static getSampleModels(req: Request, res: Response): Promise<void>;
    /**
     * AI Virtual Try-On API: Nhận ảnh người dùng + sản phẩm -> Tạo ảnh người mặc trang phục
     */
    static tryOn(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Lấy danh sách các Workflows may đo chuyên biệt trong hệ thống
     */
    static getWorkflows(req: Request, res: Response): Promise<void>;
}
