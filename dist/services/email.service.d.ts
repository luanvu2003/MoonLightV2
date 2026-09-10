declare class EmailServiceClass {
    private transporter;
    private getTransporter;
    /**
     * Gửi mã OTP xác thực đăng ký tài khoản khách hàng
     */
    sendOtpEmail(toEmail: string, otp: string, username?: string): Promise<boolean>;
}
export declare const EmailService: EmailServiceClass;
export {};
