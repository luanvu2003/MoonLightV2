import { Response } from 'express';
export declare const sendSuccess: <T>(res: Response, data: T, message?: string, statusCode?: number) => Response;
export declare const sendPaginated: <T>(res: Response, data: T[], pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}, message?: string) => Response;
export declare const sendError: (res: Response, message?: string, statusCode?: number, errorCode?: string, details?: any) => Response;
