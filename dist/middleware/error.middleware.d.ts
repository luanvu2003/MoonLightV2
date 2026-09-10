import { Request, Response, NextFunction } from 'express';
export declare const notFoundHandler: (req: Request, res: Response) => void;
export declare const errorHandler: (err: any, req: Request, res: Response, next: NextFunction) => void;
