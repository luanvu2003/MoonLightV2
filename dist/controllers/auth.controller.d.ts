import { Request, Response, NextFunction } from 'express';
export declare class AuthController {
    static login(req: Request, res: Response, next: NextFunction): Promise<void>;
    static logout(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getMe(req: Request, res: Response, next: NextFunction): Promise<void>;
    static changePassword(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updateAvatar(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Cập nhật thông tin cá nhân của khách hàng (SĐT, Tỉnh/Thành, Quận/Huyện, Phường/Xã, Địa chỉ)
     * RÀNG BUỘC NGHIÊM NGẶT: Tên (name) KHÔNG ĐƯỢC PHÉP SỬA theo yêu cầu hệ thống.
     */
    static updateProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Gửi mã OTP xác thực đăng ký qua Email
     */
    static sendRegisterOtp(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Xác thực mã OTP và hoàn tất đăng ký tài khoản khách hàng
     */
    static verifyRegisterOtp(req: Request, res: Response, next: NextFunction): Promise<void>;
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
    /**
     * Lấy danh sách toàn bộ địa chỉ của người dùng hiện tại
     */
    static getAddresses(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Thêm địa chỉ mới
     */
    static addAddress(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Cập nhật địa chỉ đã lưu
     */
    static updateAddress(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Xóa một địa chỉ đã lưu
     */
    static deleteAddress(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Đặt một địa chỉ làm mặc định
     */
    static setDefaultAddress(req: Request, res: Response, next: NextFunction): Promise<void>;
}
