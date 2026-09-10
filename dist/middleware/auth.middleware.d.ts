import { Request, Response, NextFunction } from 'express';
import { Role } from '../types/enums.js';
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => void;
export declare const optionalAuthenticate: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireRole: (...roles: (Role | string)[]) => (req: Request, res: Response, next: NextFunction) => void;
