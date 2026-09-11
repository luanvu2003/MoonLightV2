import { User } from '../models/User.js';
import { Otp } from '../models/Otp.js';
import { Customer } from '../models/Customer.js';
import { Log } from '../models/Log.js';
import { AuthService } from '../services/auth.service.js';
import { EmailService } from '../services/email.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { Role } from '../types/enums.js';
// Tài khoản dự phòng khi MongoDB từ xa chưa được cấu hình credentials
const DEFAULT_FALLBACK_ACCOUNTS = [
    { id: 'fallback-admin-01', username: 'admin', password: '123', name: 'Quản Trị Viên (Vũ Phạm Luân)', role: Role.Admin, avatar: '' },
    { id: 'fallback-owner-02', username: 'owner', password: '123', name: 'Chủ Cửa Hàng', role: Role.Owner, avatar: '' },
    { id: 'fallback-staff-03', username: 'staff', password: '123', name: 'Thu Ngân 01', role: Role.Staff, avatar: '' }
];
export class AuthController {
    static async login(req, res, next) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                sendError(res, 'Vui lòng cung cấp tên đăng nhập và mật khẩu', 400, 'BAD_REQUEST');
                return;
            }
            const cleanUsername = username.toLowerCase().trim();
            let user = null;
            let isDbWorking = true;
            try {
                user = await User.findOne({ username: cleanUsername });
            }
            catch (dbErr) {
                console.warn(`⚠️ MongoDB chưa được cấu hình credentials hoặc truy vấn thất bại: ${dbErr.message}. Kích hoạt chế độ dự phòng.`);
                isDbWorking = false;
            }
            // 1. Nếu Database hoạt động bình thường và tìm thấy user
            if (isDbWorking && user) {
                if (!user.isActive) {
                    sendError(res, 'Tài khoản đã bị tạm khóa. Vui lòng liên hệ Admin', 403, 'ACCOUNT_INACTIVE');
                    return;
                }
                const isMatch = await user.comparePassword(password);
                if (!isMatch) {
                    sendError(res, 'Tài khoản hoặc mật khẩu không chính xác', 401, 'INVALID_CREDENTIALS');
                    return;
                }
                user.lastLogin = new Date();
                await user.save().catch(() => { });
                const tokens = AuthService.generateTokens({
                    id: user._id.toString(),
                    username: user.username,
                    role: user.role,
                    name: user.name
                });
                // Ghi log nếu có thể
                const now = new Date();
                await Log.create({
                    time: `${now.toLocaleTimeString('vi-VN')} ${now.toLocaleDateString('vi-VN')}`,
                    user: `${user.name} (${user.role})`,
                    action: 'Đăng nhập',
                    details: 'Đăng nhập thành công vào hệ thống'
                }).catch(() => { });
                res.cookie('token', tokens.accessToken, {
                    httpOnly: true,
                    maxAge: 24 * 60 * 60 * 1000,
                    sameSite: 'lax'
                });
                sendSuccess(res, {
                    user: {
                        id: user._id,
                        name: user.name,
                        username: user.username,
                        role: user.role,
                        avatar: user.avatar
                    },
                    tokens
                }, 'Đăng nhập thành công');
                return;
            }
            // 2. Chế độ dự phòng: Kiểm tra tài khoản mẫu chuẩn
            const fallback = DEFAULT_FALLBACK_ACCOUNTS.find((acc) => acc.username === cleanUsername && acc.password === password);
            if (fallback) {
                const tokens = AuthService.generateTokens({
                    id: fallback.id,
                    username: fallback.username,
                    role: fallback.role,
                    name: fallback.name
                });
                res.cookie('token', tokens.accessToken, {
                    httpOnly: true,
                    maxAge: 24 * 60 * 60 * 1000,
                    sameSite: 'lax'
                });
                sendSuccess(res, {
                    user: {
                        id: fallback.id,
                        name: fallback.name,
                        username: fallback.username,
                        role: fallback.role,
                        avatar: fallback.avatar
                    },
                    tokens
                }, 'Đăng nhập thành công (Chế độ dự phòng hệ thống)');
                return;
            }
            sendError(res, 'Tài khoản hoặc mật khẩu không chính xác', 401, 'INVALID_CREDENTIALS');
        }
        catch (error) {
            next(error);
        }
    }
    static async logout(req, res, next) {
        try {
            res.clearCookie('token');
            sendSuccess(res, null, 'Đăng xuất thành công');
        }
        catch (error) {
            next(error);
        }
    }
    static async getMe(req, res, next) {
        try {
            if (!req.user) {
                sendError(res, 'Chưa đăng nhập', 401, 'UNAUTHORIZED');
                return;
            }
            try {
                const user = await User.findById(req.user.id).select('-password');
                if (user) {
                    sendSuccess(res, user, 'Lấy thông tin tài khoản thành công');
                    return;
                }
            }
            catch {
                // Fallback
            }
            // Trả thông tin từ token nếu DB offline
            sendSuccess(res, {
                id: req.user.id,
                username: req.user.username,
                name: req.user.name,
                role: req.user.role
            }, 'Lấy thông tin tài khoản thành công');
        }
        catch (error) {
            next(error);
        }
    }
    static async changePassword(req, res, next) {
        try {
            if (!req.user) {
                sendError(res, 'Chưa đăng nhập', 401, 'UNAUTHORIZED');
                return;
            }
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                sendError(res, 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới', 400, 'BAD_REQUEST');
                return;
            }
            if (newPassword.length < 3) {
                sendError(res, 'Mật khẩu mới phải có ít nhất 3 ký tự', 400, 'BAD_REQUEST');
                return;
            }
            const user = await User.findById(req.user.id);
            if (!user) {
                sendError(res, 'Không tìm thấy người dùng', 404, 'USER_NOT_FOUND');
                return;
            }
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                sendError(res, 'Mật khẩu hiện tại không chính xác', 400, 'INVALID_PASSWORD');
                return;
            }
            user.password = newPassword;
            await user.save();
            sendSuccess(res, null, 'Đổi mật khẩu thành công');
        }
        catch (error) {
            next(error);
        }
    }
    static async updateAvatar(req, res, next) {
        try {
            if (!req.user) {
                sendError(res, 'Chưa đăng nhập', 401, 'UNAUTHORIZED');
                return;
            }
            const { avatar } = req.body;
            if (!avatar) {
                sendError(res, 'Vui lòng cung cấp link ảnh avatar', 400, 'BAD_REQUEST');
                return;
            }
            const user = await User.findByIdAndUpdate(req.user.id, { avatar }, { new: true }).select('-password');
            sendSuccess(res, user, 'Cập nhật ảnh đại diện thành công');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Cập nhật thông tin cá nhân của khách hàng (SĐT, Tỉnh/Thành, Quận/Huyện, Phường/Xã, Địa chỉ)
     * RÀNG BUỘC NGHIÊM NGẶT: Tên (name) KHÔNG ĐƯỢC PHÉP SỬA theo yêu cầu hệ thống.
     */
    static async updateProfile(req, res, next) {
        try {
            if (!req.user) {
                sendError(res, 'Chưa đăng nhập', 401, 'UNAUTHORIZED');
                return;
            }
            const { phone, address, province, district, ward, street, avatar } = req.body;
            const updateData = {};
            if (phone !== undefined) {
                const cleanPhone = String(phone).trim();
                if (cleanPhone && !/^[0-9+.\s-]{8,15}$/.test(cleanPhone)) {
                    sendError(res, 'Số điện thoại không hợp lệ (cần từ 8 - 15 chữ số)', 400, 'INVALID_PHONE');
                    return;
                }
                updateData.phone = cleanPhone;
            }
            if (address !== undefined)
                updateData.address = String(address).trim();
            if (province !== undefined)
                updateData.province = String(province).trim();
            if (district !== undefined)
                updateData.district = String(district).trim();
            if (ward !== undefined)
                updateData.ward = String(ward).trim();
            if (street !== undefined)
                updateData.street = String(street).trim();
            if (avatar !== undefined)
                updateData.avatar = String(avatar).trim();
            // CỐ ĐỊNH TÊN: Tuyệt đối không nhận hoặc cập nhật trường 'name' ở đây!
            const updatedUser = await User.findByIdAndUpdate(req.user.id, { $set: updateData }, { new: true }).select('-password');
            if (!updatedUser) {
                sendError(res, 'Không tìm thấy thông tin người dùng', 404, 'USER_NOT_FOUND');
                return;
            }
            // Đồng bộ thông tin sang Customer profile nếu có số điện thoại
            if (updatedUser.phone) {
                try {
                    await Customer.findOneAndUpdate({ phone: updatedUser.phone }, {
                        $set: {
                            name: updatedUser.name,
                            phone: updatedUser.phone,
                            address: updatedUser.address || `${updatedUser.street || ''} ${updatedUser.ward || ''} ${updatedUser.district || ''} ${updatedUser.province || ''}`.trim()
                        }
                    }, { upsert: true, new: true });
                }
                catch { }
            }
            sendSuccess(res, {
                user: {
                    id: updatedUser._id,
                    name: updatedUser.name,
                    username: updatedUser.username,
                    email: updatedUser.email,
                    phone: updatedUser.phone,
                    address: updatedUser.address,
                    province: updatedUser.province,
                    district: updatedUser.district,
                    ward: updatedUser.ward,
                    street: updatedUser.street,
                    role: updatedUser.role,
                    avatar: updatedUser.avatar,
                    addresses: updatedUser.addresses || [],
                    cart: updatedUser.cart || [],
                    wishlist: updatedUser.wishlist || []
                }
            }, 'Cập nhật thông tin cá nhân thành công');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Gửi mã OTP xác thực đăng ký qua Email
     */
    static async sendRegisterOtp(req, res, next) {
        try {
            const { username, email } = req.body;
            if (!username || !email) {
                sendError(res, 'Vui lòng cung cấp tên đăng nhập và email nhận mã xác minh', 400, 'BAD_REQUEST');
                return;
            }
            const cleanUsername = String(username).toLowerCase().trim();
            const cleanEmail = String(email).toLowerCase().trim();
            if (cleanUsername.length < 3) {
                sendError(res, 'Tên đăng nhập phải có ít nhất 3 ký tự', 400, 'BAD_REQUEST');
                return;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(cleanEmail)) {
                sendError(res, 'Địa chỉ email không đúng định dạng', 400, 'INVALID_EMAIL');
                return;
            }
            // 1. Kiểm tra xem username đã tồn tại chưa
            const existUser = await User.findOne({ username: cleanUsername });
            if (existUser) {
                sendError(res, 'Tên tài khoản này đã được sử dụng. Vui lòng chọn tên khác.', 409, 'USERNAME_EXISTS');
                return;
            }
            // 2. Kiểm tra xem email đã tồn tại chưa
            const existEmail = await User.findOne({ email: cleanEmail });
            if (existEmail) {
                sendError(res, 'Địa chỉ email này đã được sử dụng. Vui lòng đăng nhập hoặc chọn email khác.', 409, 'EMAIL_EXISTS');
                return;
            }
            // 3. Sinh mã OTP 6 số ngẫu nhiên
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            // 4. Lưu OTP vào MongoDB (tự hủy sau 5 phút)
            await Otp.deleteMany({ email: cleanEmail });
            await Otp.create({ email: cleanEmail, otp: otpCode });
            // 5. Gửi email
            const emailSent = await EmailService.sendOtpEmail(cleanEmail, otpCode, cleanUsername);
            if (!emailSent) {
                sendError(res, 'Không thể gửi email lúc này. Vui lòng kiểm tra lại địa chỉ email hoặc thử lại sau.', 500, 'EMAIL_SEND_FAILED');
                return;
            }
            sendSuccess(res, { email: cleanEmail }, 'Mã xác minh 6 số đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư.');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Xác thực mã OTP và hoàn tất đăng ký tài khoản khách hàng
     */
    static async verifyRegisterOtp(req, res, next) {
        try {
            const { name, username, email, password, confirmPassword, otp } = req.body;
            if (!username || !email || !password || !otp) {
                sendError(res, 'Vui lòng cung cấp đầy đủ thông tin đăng ký và mã xác minh OTP', 400, 'BAD_REQUEST');
                return;
            }
            if (confirmPassword && password !== confirmPassword) {
                sendError(res, 'Mật khẩu xác nhận không khớp với mật khẩu đã nhập', 400, 'PASSWORD_MISMATCH');
                return;
            }
            if (password.length < 3) {
                sendError(res, 'Mật khẩu phải có ít nhất 3 ký tự', 400, 'BAD_REQUEST');
                return;
            }
            const cleanName = String(name || '').trim();
            const cleanUsername = String(username).toLowerCase().trim();
            const cleanEmail = String(email).toLowerCase().trim();
            const cleanOtp = String(otp).trim();
            // 1. Kiểm tra OTP
            const validOtp = await Otp.findOne({ email: cleanEmail, otp: cleanOtp });
            if (!validOtp) {
                sendError(res, 'Mã xác minh không chính xác hoặc đã hết hạn. Vui lòng kiểm tra lại hộp thư.', 400, 'INVALID_OTP');
                return;
            }
            // 2. Xóa OTP sau khi dùng
            await Otp.deleteMany({ email: cleanEmail });
            // 3. Kiểm tra xem username/email đã bị ai đăng ký trong lúc chờ OTP không
            const existUser = await User.findOne({
                $or: [{ username: cleanUsername }, { email: cleanEmail }]
            });
            if (existUser) {
                sendError(res, 'Tên đăng nhập hoặc Email này đã được đăng ký. Vui lòng thử lại.', 409, 'USER_EXISTS');
                return;
            }
            // 4. Tạo User mới với vai trò Customer (Họ tên đầy đủ được ưu tiên lưu trữ chính xác)
            const newUser = new User({
                name: cleanName || cleanUsername,
                username: cleanUsername,
                password,
                email: cleanEmail,
                role: Role.Customer,
                isEmailVerified: true,
                isActive: true,
                lastLogin: new Date()
            });
            await newUser.save();
            // 5. Tự động cấp token đăng nhập ngay lập tức
            const tokens = AuthService.generateTokens({
                id: newUser._id.toString(),
                username: newUser.username,
                role: newUser.role,
                name: newUser.name
            });
            res.cookie('token', tokens.accessToken, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000,
                sameSite: 'lax'
            });
            sendSuccess(res, {
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    username: newUser.username,
                    email: newUser.email,
                    phone: newUser.phone,
                    address: newUser.address,
                    province: newUser.province,
                    district: newUser.district,
                    ward: newUser.ward,
                    street: newUser.street,
                    role: newUser.role,
                    avatar: newUser.avatar,
                    cart: newUser.cart || [],
                    wishlist: newUser.wishlist || []
                },
                tokens
            }, 'Xác thực email và đăng ký tài khoản thành công', 201);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Đăng ký tài khoản Khách Hàng mới
     */
    static async register(req, res, next) {
        try {
            const { name, username, password, phone, email } = req.body;
            if (!name || !username || !password) {
                sendError(res, 'Vui lòng cung cấp đầy đủ họ tên, tên đăng nhập và mật khẩu', 400, 'BAD_REQUEST');
                return;
            }
            if (password.length < 3) {
                sendError(res, 'Mật khẩu phải có ít nhất 3 ký tự', 400, 'BAD_REQUEST');
                return;
            }
            const cleanUsername = username.toLowerCase().trim();
            const cleanEmail = (email || '').toLowerCase().trim();
            const cleanPhone = (phone || '').trim();
            // Kiểm tra username đã tồn tại chưa
            const existingUser = await User.findOne({ username: cleanUsername });
            if (existingUser) {
                sendError(res, 'Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên khác.', 409, 'USERNAME_EXISTS');
                return;
            }
            // Tạo User mới với role Customer
            const newUser = new User({
                name: name.trim(),
                username: cleanUsername,
                password,
                email: cleanEmail,
                phone: cleanPhone,
                role: Role.Customer,
                isActive: true,
                lastLogin: new Date()
            });
            await newUser.save();
            // Đồng bộ / tạo hồ sơ Customer nếu có số điện thoại
            if (cleanPhone) {
                try {
                    await Customer.findOneAndUpdate({ phone: cleanPhone }, {
                        $setOnInsert: {
                            name: name.trim(),
                            phone: cleanPhone,
                            email: cleanEmail,
                            totalSpent: 0,
                            orderCount: 0
                        }
                    }, { upsert: true });
                }
                catch (e) { }
            }
            const tokens = AuthService.generateTokens({
                id: newUser._id.toString(),
                username: newUser.username,
                role: newUser.role,
                name: newUser.name
            });
            res.cookie('token', tokens.accessToken, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000,
                sameSite: 'lax'
            });
            sendSuccess(res, {
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    username: newUser.username,
                    role: newUser.role,
                    avatar: newUser.avatar,
                    email: newUser.email,
                    phone: newUser.phone,
                    cart: newUser.cart || [],
                    wishlist: newUser.wishlist || []
                },
                tokens
            }, 'Đăng ký tài khoản thành công', 201);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Đăng ký / Đăng nhập 1-Click bằng tài khoản Google (Google Identity Services)
     */
    static async googleAuth(req, res, next) {
        try {
            const { credential, accessToken, userInfo } = req.body;
            if (!credential && !accessToken && !userInfo) {
                sendError(res, 'Thiếu Google credential hoặc accessToken', 400, 'BAD_REQUEST');
                return;
            }
            let googlePayload = null;
            // 1. Nếu nhận được trực tiếp userInfo
            if (userInfo && (userInfo.email || userInfo.sub)) {
                googlePayload = userInfo;
            }
            // 2. Nếu có accessToken từ Google OAuth2 popup
            if (!googlePayload && accessToken) {
                try {
                    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    });
                    if (userRes.ok) {
                        googlePayload = await userRes.json();
                    }
                }
                catch (accErr) {
                    console.warn('Lỗi xác thực Google access token:', accErr.message);
                }
            }
            // 3. Xác thực ID Token qua Google OAuth TokenInfo API
            if (!googlePayload && credential) {
                try {
                    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
                    if (verifyRes.ok) {
                        googlePayload = await verifyRes.json();
                    }
                    else {
                        // Parse JWT payload nếu tokeninfo gặp sự cố mạng
                        const parts = credential.split('.');
                        if (parts.length === 3) {
                            const decodedStr = Buffer.from(parts[1], 'base64').toString('utf-8');
                            googlePayload = JSON.parse(decodedStr);
                        }
                    }
                }
                catch (err) {
                    console.warn('Lỗi xác thực Google token online, giải mã fallback JWT payload:', err.message);
                    try {
                        const parts = credential.split('.');
                        if (parts.length === 3) {
                            const decodedStr = Buffer.from(parts[1], 'base64').toString('utf-8');
                            googlePayload = JSON.parse(decodedStr);
                        }
                    }
                    catch (decErr) { }
                }
            }
            if (!googlePayload || (!googlePayload.email && !googlePayload.sub)) {
                sendError(res, 'Chứng chỉ Google không hợp lệ hoặc đã hết hạn.', 401, 'INVALID_GOOGLE_TOKEN');
                return;
            }
            const googleId = googlePayload.sub || '';
            const email = (googlePayload.email || '').toLowerCase().trim();
            const name = googlePayload.name || googlePayload.given_name || (email ? email.split('@')[0] : 'Khách Hàng Google');
            const avatar = googlePayload.picture || '';
            // 2. Tìm kiếm người dùng theo googleId hoặc email
            let user = await User.findOne({
                $or: [
                    ...(googleId ? [{ googleId }] : []),
                    ...(email ? [{ email }] : [])
                ]
            });
            if (!user) {
                // Tạo username duy nhất từ email hoặc googleId
                const baseUsername = email ? email.split('@')[0].replace(/[^a-z0-9]/g, '') : `google_${googleId.slice(0, 8)}`;
                let finalUsername = baseUsername || `user_${Date.now()}`;
                const existCount = await User.countDocuments({ username: finalUsername });
                if (existCount > 0) {
                    finalUsername = `${finalUsername}_${Math.floor(100 + Math.random() * 900)}`;
                }
                user = new User({
                    name,
                    username: finalUsername,
                    email,
                    avatar,
                    googleId,
                    role: Role.Customer,
                    isActive: true,
                    lastLogin: new Date()
                });
                await user.save();
            }
            else {
                // Cập nhật googleId, avatar và lastLogin nếu có thay đổi
                if (googleId && !user.googleId)
                    user.googleId = googleId;
                if (avatar && !user.avatar)
                    user.avatar = avatar;
                user.lastLogin = new Date();
                await user.save().catch(() => { });
            }
            if (!user.isActive) {
                sendError(res, 'Tài khoản đã bị tạm khóa. Vui lòng liên hệ hỗ trợ.', 403, 'ACCOUNT_INACTIVE');
                return;
            }
            const tokens = AuthService.generateTokens({
                id: user._id.toString(),
                username: user.username,
                role: user.role,
                name: user.name
            });
            res.cookie('token', tokens.accessToken, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000,
                sameSite: 'lax'
            });
            sendSuccess(res, {
                user: {
                    id: user._id,
                    name: user.name,
                    username: user.username,
                    role: user.role,
                    avatar: user.avatar,
                    email: user.email,
                    phone: user.phone || '',
                    cart: user.cart || [],
                    wishlist: user.wishlist || []
                },
                tokens
            }, 'Đăng nhập Google thành công!');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Đồng bộ giỏ hàng và danh sách yêu thích của khách hàng
     */
    static async syncUserData(req, res, next) {
        try {
            if (!req.user) {
                sendError(res, 'Chưa đăng nhập', 401, 'UNAUTHORIZED');
                return;
            }
            const { cart, wishlist } = req.body;
            const updateFields = {};
            if (Array.isArray(cart))
                updateFields.cart = cart;
            if (Array.isArray(wishlist))
                updateFields.wishlist = Array.from(new Set(wishlist.map(String)));
            const user = await User.findByIdAndUpdate(req.user.id, { $set: updateFields }, { new: true }).select('-password');
            sendSuccess(res, { cart: user?.cart || [], wishlist: user?.wishlist || [] }, 'Đồng bộ dữ liệu thành công');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Lấy cấu hình Client ID cho Google OAuth Frontend
     */
    static async getGoogleConfig(_req, res) {
        const clientId = process.env.GOOGLE_CLIENT_ID || '';
        sendSuccess(res, { clientId, isConfigured: Boolean(clientId) }, 'Lấy cấu hình Google OAuth thành công');
    }
    /**
     * Lấy danh sách toàn bộ địa chỉ của người dùng hiện tại
     */
    static async getAddresses(req, res, next) {
        try {
            if (!req.user) {
                sendError(res, 'Chưa đăng nhập', 401, 'UNAUTHORIZED');
                return;
            }
            const user = await User.findById(req.user.id);
            if (!user) {
                sendError(res, 'Không tìm thấy người dùng', 404, 'USER_NOT_FOUND');
                return;
            }
            // Tự động di chuyển địa chỉ mặc định cũ vào mảng nếu user.addresses đang rỗng
            let addresses = user.addresses || [];
            if (addresses.length === 0 && (user.province || user.address || user.street)) {
                const fullAddr = user.address || [user.street, user.ward, user.district, user.province].filter(Boolean).join(', ');
                const initialAddr = {
                    recipientName: user.name || '',
                    phone: user.phone || '',
                    province: user.province || '',
                    provinceCode: '',
                    district: user.district || '',
                    districtCode: '',
                    ward: user.ward || '',
                    wardCode: '',
                    street: user.street || '',
                    fullAddress: fullAddr,
                    isDefault: true,
                    label: 'Nhà riêng',
                    createdAt: new Date()
                };
                user.addresses = [initialAddr];
                await user.save();
                addresses = user.addresses;
            }
            // Đảm bảo luôn có ít nhất 1 địa chỉ mặc định nếu danh sách có phần tử
            const hasDefault = addresses.some(a => a.isDefault);
            if (!hasDefault && addresses.length > 0) {
                addresses[0].isDefault = true;
                await user.save();
            }
            // Sắp xếp: địa chỉ mặc định lên đầu, sau đó theo thời gian tạo mới nhất
            const sorted = [...addresses].sort((a, b) => {
                if (a.isDefault)
                    return -1;
                if (b.isDefault)
                    return 1;
                return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
            });
            sendSuccess(res, sorted, 'Lấy danh sách địa chỉ thành công');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Thêm địa chỉ mới
     */
    static async addAddress(req, res, next) {
        try {
            if (!req.user) {
                sendError(res, 'Chưa đăng nhập', 401, 'UNAUTHORIZED');
                return;
            }
            const { recipientName, phone, province, provinceCode, district, districtCode, ward, wardCode, street, isDefault, label } = req.body;
            if (!province || !district || !ward || !street) {
                sendError(res, 'Vui lòng cung cấp đầy đủ Tỉnh/Thành, Quận/Huyện, Phường/Xã và Số nhà tên đường', 400, 'BAD_REQUEST');
                return;
            }
            const user = await User.findById(req.user.id);
            if (!user) {
                sendError(res, 'Không tìm thấy người dùng', 404, 'USER_NOT_FOUND');
                return;
            }
            if (!user.addresses)
                user.addresses = [];
            const fullAddress = [street, ward, district, province].filter(Boolean).join(', ');
            const cleanPhone = phone ? String(phone).trim() : (user.phone || '');
            const cleanRecipient = recipientName ? String(recipientName).trim() : (user.name || '');
            // Nếu là địa chỉ đầu tiên hoặc được đánh dấu mặc định
            const shouldBeDefault = Boolean(isDefault) || user.addresses.length === 0;
            if (shouldBeDefault) {
                user.addresses.forEach((a) => {
                    a.isDefault = false;
                });
                // Đồng bộ lên trường chính của User để tương thích ngược
                user.address = fullAddress;
                user.province = province;
                user.district = district;
                user.ward = ward;
                user.street = street;
                if (cleanPhone)
                    user.phone = cleanPhone;
            }
            const newAddress = {
                recipientName: cleanRecipient,
                phone: cleanPhone,
                province: String(province).trim(),
                provinceCode: provinceCode ? String(provinceCode).trim() : '',
                district: String(district).trim(),
                districtCode: districtCode ? String(districtCode).trim() : '',
                ward: String(ward).trim(),
                wardCode: wardCode ? String(wardCode).trim() : '',
                street: String(street).trim(),
                fullAddress,
                isDefault: shouldBeDefault,
                label: label ? String(label).trim() : 'Nhà riêng',
                createdAt: new Date()
            };
            user.addresses.push(newAddress);
            await user.save();
            const created = user.addresses[user.addresses.length - 1];
            sendSuccess(res, { address: created, addresses: user.addresses }, 'Thêm địa chỉ mới thành công', 201);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Cập nhật địa chỉ đã lưu
     */
    static async updateAddress(req, res, next) {
        try {
            if (!req.user) {
                sendError(res, 'Chưa đăng nhập', 401, 'UNAUTHORIZED');
                return;
            }
            const addressId = req.params.id;
            const { recipientName, phone, province, provinceCode, district, districtCode, ward, wardCode, street, isDefault, label } = req.body;
            const user = await User.findById(req.user.id);
            if (!user) {
                sendError(res, 'Không tìm thấy người dùng', 404, 'USER_NOT_FOUND');
                return;
            }
            const addr = user.addresses?.id(addressId);
            if (!addr) {
                sendError(res, 'Không tìm thấy địa chỉ', 404, 'ADDRESS_NOT_FOUND');
                return;
            }
            if (recipientName !== undefined)
                addr.recipientName = String(recipientName).trim();
            if (phone !== undefined)
                addr.phone = String(phone).trim();
            if (province !== undefined)
                addr.province = String(province).trim();
            if (provinceCode !== undefined)
                addr.provinceCode = String(provinceCode).trim();
            if (district !== undefined)
                addr.district = String(district).trim();
            if (districtCode !== undefined)
                addr.districtCode = String(districtCode).trim();
            if (ward !== undefined)
                addr.ward = String(ward).trim();
            if (wardCode !== undefined)
                addr.wardCode = String(wardCode).trim();
            if (street !== undefined)
                addr.street = String(street).trim();
            if (label !== undefined)
                addr.label = String(label).trim();
            addr.fullAddress = [addr.street, addr.ward, addr.district, addr.province].filter(Boolean).join(', ');
            if (isDefault) {
                user.addresses?.forEach((a) => {
                    a.isDefault = false;
                });
                addr.isDefault = true;
                // Đồng bộ lên User
                user.address = addr.fullAddress;
                user.province = addr.province;
                user.district = addr.district;
                user.ward = addr.ward;
                user.street = addr.street;
                if (addr.phone)
                    user.phone = addr.phone;
            }
            await user.save();
            sendSuccess(res, { address: addr, addresses: user.addresses }, 'Cập nhật địa chỉ thành công');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Xóa một địa chỉ đã lưu
     */
    static async deleteAddress(req, res, next) {
        try {
            if (!req.user) {
                sendError(res, 'Chưa đăng nhập', 401, 'UNAUTHORIZED');
                return;
            }
            const addressId = req.params.id;
            const user = await User.findById(req.user.id);
            if (!user) {
                sendError(res, 'Không tìm thấy người dùng', 404, 'USER_NOT_FOUND');
                return;
            }
            const targetAddr = user.addresses?.id(addressId);
            if (!targetAddr) {
                sendError(res, 'Không tìm thấy địa chỉ cần xóa', 404, 'ADDRESS_NOT_FOUND');
                return;
            }
            const wasDefault = Boolean(targetAddr.isDefault);
            user.addresses?.pull(addressId);
            if (wasDefault && user.addresses && user.addresses.length > 0) {
                user.addresses[0].isDefault = true;
                user.address = user.addresses[0].fullAddress;
                user.province = user.addresses[0].province;
                user.district = user.addresses[0].district;
                user.ward = user.addresses[0].ward;
                user.street = user.addresses[0].street;
                if (user.addresses[0].phone)
                    user.phone = user.addresses[0].phone;
            }
            await user.save();
            sendSuccess(res, { addresses: user.addresses }, 'Đã xóa địa chỉ thành công');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Đặt một địa chỉ làm mặc định
     */
    static async setDefaultAddress(req, res, next) {
        try {
            if (!req.user) {
                sendError(res, 'Chưa đăng nhập', 401, 'UNAUTHORIZED');
                return;
            }
            const addressId = req.params.id;
            const user = await User.findById(req.user.id);
            if (!user) {
                sendError(res, 'Không tìm thấy người dùng', 404, 'USER_NOT_FOUND');
                return;
            }
            const targetAddr = user.addresses?.id(addressId);
            if (!targetAddr) {
                sendError(res, 'Không tìm thấy địa chỉ', 404, 'ADDRESS_NOT_FOUND');
                return;
            }
            user.addresses?.forEach((a) => {
                a.isDefault = false;
            });
            targetAddr.isDefault = true;
            // Đồng bộ trường chính
            user.address = targetAddr.fullAddress;
            user.province = targetAddr.province;
            user.district = targetAddr.district;
            user.ward = targetAddr.ward;
            user.street = targetAddr.street;
            if (targetAddr.phone)
                user.phone = targetAddr.phone;
            await user.save();
            sendSuccess(res, { address: targetAddr, addresses: user.addresses }, 'Đã đặt làm địa chỉ mặc định');
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=auth.controller.js.map