import { Request, Response, NextFunction } from 'express';
export declare class CustomerController {
    static getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    static exportCsv(req: Request, res: Response, next: NextFunction): Promise<void>;
}
