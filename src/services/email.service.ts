import nodemailer, { type Transporter } from 'nodemailer';
import { ENV } from '../config/env.js';

class EmailServiceClass {
  private transporter: Transporter | null = null;

  private getTransporter(): Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: ENV.EMAIL_USER,
          pass: ENV.EMAIL_PASS
        }
      });
    }
    return this.transporter;
  }

  /**
   * Gửi mã OTP xác thực đăng ký tài khoản khách hàng
   */
  async sendOtpEmail(toEmail: string, otp: string, username: string = ''): Promise<boolean> {
    try {
      const transporter = this.getTransporter();
      const mailOptions = {
        from: `"MoonLight Luxury Fashion" <${ENV.EMAIL_USER}>`,
        to: toEmail,
        subject: `[MoonLight] Mã xác minh đăng ký tài khoản: ${otp}`,
        html: `
          <!DOCTYPE html>
          <html lang="vi">
          <head>
            <meta charset="UTF-8">
            <style>
              body { margin: 0; padding: 0; background-color: #0b0f19; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #e2e8f0; }
              .container { max-width: 540px; margin: 30px auto; background: #131b2e; border: 1px solid rgba(223, 186, 115, 0.25); border-radius: 12px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
              .header { background: linear-gradient(135deg, #090d16, #162035); padding: 32px 24px; text-align: center; border-bottom: 1px solid rgba(223, 186, 115, 0.2); }
              .logo { font-size: 26px; font-weight: 800; letter-spacing: 4px; color: #ffffff; text-transform: uppercase; }
              .logo span { color: #dfba73; }
              .tagline { font-size: 11px; letter-spacing: 2px; color: #94a3b8; margin-top: 6px; text-transform: uppercase; }
              .content { padding: 36px 32px; text-align: center; }
              .title { font-size: 19px; font-weight: 700; color: #ffffff; margin: 0 0 12px; }
              .subtitle { font-size: 13.5px; line-height: 1.6; color: #94a3b8; margin: 0 0 28px; }
              .otp-card { background: rgba(223, 186, 115, 0.08); border: 1.5px dashed #dfba73; border-radius: 10px; padding: 20px 24px; margin: 0 auto 28px; display: inline-block; }
              .otp-code { font-size: 38px; font-weight: 900; letter-spacing: 12px; color: #dfba73; font-family: 'Courier New', Courier, monospace; margin: 0; padding-left: 12px; }
              .otp-note { font-size: 12px; color: #64748b; margin-top: 10px; }
              .security-notice { background: rgba(255,255,255,0.03); border-radius: 6px; padding: 12px; font-size: 12px; color: #64748b; text-align: left; line-height: 1.5; margin-bottom: 24px; }
              .footer { background: #090d16; padding: 20px; text-align: center; font-size: 11px; color: #475569; border-top: 1px solid rgba(255,255,255,0.05); }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">MOON<span>LIGHT</span>.</div>
                <div class="tagline">LUXURY BOUTIQUE & MENSWEAR</div>
              </div>
              <div class="content">
                <h2 class="title">XÁC MINH ĐĂNG KÝ TÀI KHOẢN</h2>
                <p class="subtitle">
                  Xin chào <strong>${username || 'quý khách'}</strong>,<br>
                  Cảm ơn bạn đã lựa chọn MoonLight. Vui lòng sử dụng mã xác minh dưới đây để hoàn tất đăng ký tài khoản khách hàng:
                </p>
                
                <div class="otp-card">
                  <div class="otp-code">${otp}</div>
                  <div class="otp-note">Mã xác thực có hiệu lực trong vòng <strong>5 phút</strong></div>
                </div>

                <div class="security-notice">
                  🛡️ <strong>Lưu ý bảo mật:</strong> Tuyệt đối không chia sẻ mã này cho bất kỳ ai. Nhân viên MoonLight sẽ không bao giờ yêu cầu bạn cung cấp mã xác minh.
                </div>
              </div>
              <div class="footer">
                &copy; 2026 MoonLight Luxury Fashion. All rights reserved.<br>
                Email tự động được gửi từ hệ thống chăm sóc khách hàng MoonLight.
              </div>
            </div>
          </body>
          </html>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ [EmailService] Đã gửi mã OTP (${otp}) thành công đến: ${toEmail}`);
      return true;
    } catch (error: any) {
      console.error(`❌ [EmailService] Lỗi gửi email OTP đến ${toEmail}:`, error.message);
      return false;
    }
  }
}

export const EmailService = new EmailServiceClass();
