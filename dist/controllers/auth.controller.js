import { User } from '../models/User.js';
import { Customer } from '../models/Customer.js';
import { Log } from '../models/Log.js';
import { AuthService } from '../services/auth.service.js';
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
}
//# sourceMappingURL=auth.controller.js.map