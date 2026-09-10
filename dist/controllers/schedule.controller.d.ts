import { Request, Response, NextFunction } from 'express';
export declare class ScheduleController {
    static getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    static create(req: Request, res: Response, next: NextFunction): Promise<void>;
    static update(req: Request, res: Response, next: NextFunction): Promise<void>;
    static delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    static autoGenerate(req: Request, res: Response, next: NextFunction): Promise<void>;
}
