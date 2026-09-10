import { Request, Response, NextFunction } from 'express';
export declare class ReviewController {
    static getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getByProduct(req: Request, res: Response, next: NextFunction): Promise<void>;
    static create(req: Request, res: Response, next: NextFunction): Promise<void>;
    static reply(req: Request, res: Response, next: NextFunction): Promise<void>;
    static exportCsv(req: Request, res: Response, next: NextFunction): Promise<void>;
}
