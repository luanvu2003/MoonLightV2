import { User } from '../models/User.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { Role } from '../types/enums.js';
export class UserController {
    static async getAll(req, res, next) {
        try {
            const users = await User.find().select('-password').sort({ createdAt: -1 });
            sendSuccess(res, users, 'Lấy danh sách nhân sự thành công');
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const { name, username, password, role, avatar } = req.body;
            if (!name || !username || !password) {
                sendError(res, 'Vui lòng cung cấp đầy đủ Tên, Tên đăng nhập và Mật khẩu', 400, 'BAD_REQUEST');
                return;
            }
            const existing = await User.findOne({ username: username.toLowerCase().trim() });
            if (existing) {
                sendError(res, 'Tên đăng nhập này đã tồn tại', 409, 'USERNAME_EXISTS');
                return;
            }
            const newUser = new User({
                name: name.trim(),
                username: username.toLowerCase().trim(),
                password,
                role: role || Role.Staff,
                avatar: avatar || '',
                isActive: true
            });
            await newUser.save();
            const userRes = await User.findById(newUser._id).select('-password');
            sendSuccess(res, userRes, 'Thêm nhân sự mới thành công', 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const { name, role, isActive, avatar, password } = req.body;
            const user = await User.findById(id);
            if (!user) {
                sendError(res, 'Không tìm thấy tài khoản nhân viên', 404, 'USER_NOT_FOUND');
                return;
            }
            if (name)
                user.name = name.trim();
            if (role && Object.values(Role).includes(role))
                user.role = role;
            if (isActive !== undefined)
                user.isActive = Boolean(isActive);
            if (avatar !== undefined)
                user.avatar = avatar;
            if (password)
                user.password = password; // pre-save will hash
            await user.save();
            const updatedUser = await User.findById(id).select('-password');
            sendSuccess(res, updatedUser, 'Cập nhật thông tin nhân sự thành công');
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            if (req.user && req.user.id === id) {
                sendError(res, 'Không thể tự xóa tài khoản của chính mình', 400, 'CANNOT_DELETE_SELF');
                return;
            }
            const deleted = await User.findByIdAndDelete(id);
            if (!deleted) {
                sendError(res, 'Không tìm thấy tài khoản để xóa', 404, 'USER_NOT_FOUND');
                return;
            }
            sendSuccess(res, null, 'Đã xóa tài khoản nhân sự thành công');
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=user.controller.js.map