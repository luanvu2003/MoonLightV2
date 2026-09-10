import { Request, Response, NextFunction } from 'express';
export declare class ReportController {
    static getOverview(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getRevenueChart(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getTopProducts(req: Request, res: Response, next: NextFunction): Promise<void>;
}
