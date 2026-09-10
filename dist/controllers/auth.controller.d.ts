import { Request, Response, NextFunction } from 'express';
export declare class AuthController {
    static login(req: Request, res: Response, next: NextFunction): Promise<void>;
    static logout(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getMe(req: Request, res: Response, next: NextFunction): Promise<void>;
    static changePassword(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updateAvatar(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Đăng ký tài khoản Khách Hàng mới
     */
    static register(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Đăng ký / Đăng nhập 1-Click bằng tài khoản Google (Google Identity Services)
     */
    static googleAuth(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Đồng bộ giỏ hàng và danh sách yêu thích của khách hàng
     */
    static syncUserData(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Lấy cấu hình Client ID cho Google OAuth Frontend
     */
    static getGoogleConfig(_req: Request, res: Response): Promise<void>;
}
