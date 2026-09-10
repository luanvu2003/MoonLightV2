import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { Role, OrderStatus } from '../types/enums.js';
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
    /**
     * Lấy danh sách người dùng kèm đầy đủ: SĐT, Email, Địa chỉ, Tổng đơn, Tổng tiền và trạng thái giao hàng
     */
    static async getCustomersWithStats(req, res, next) {
        try {
            // 1. Lấy tất cả tài khoản người dùng mua hàng (không bao gồm tài khoản quản trị Admin/Staff/Owner)
            const users = await User.find({
                role: { $nin: [Role.Admin, Role.Staff, Role.Owner] }
            })
                .select('-password')
                .sort({ createdAt: -1 });
            // Lấy danh sách tất cả đơn hàng để tổng hợp thống kê thời gian thực
            const orders = await Order.find().sort({ createdAt: -1 });
            const userList = users.map((user) => {
                const uId = user._id.toString();
                const uPhone = user.phone ? user.phone.replace(/[\s.-]/g, '').trim() : '';
                const uEmail = user.email ? user.email.toLowerCase().trim() : '';
                // Lọc các đơn hàng thuộc về user này
                const userOrders = orders.filter((o) => {
                    const orderCustId = o.customerId ? o.customerId.toString() : '';
                    const orderPhone = o.customer?.phone ? o.customer.phone.replace(/[\s.-]/g, '').trim() : '';
                    const orderEmail = o.customer?.email ? o.customer.email.toLowerCase().trim() : '';
                    if (orderCustId && orderCustId === uId)
                        return true;
                    if (uPhone && orderPhone && uPhone === orderPhone)
                        return true;
                    if (uEmail && orderEmail && uEmail === orderEmail)
                        return true;
                    return false;
                });
                const totalOrders = userOrders.length;
                const completedOrders = userOrders.filter((o) => o.status === OrderStatus.Completed).length;
                const cancelledOrders = userOrders.filter((o) => o.status === OrderStatus.Cancelled).length;
                const shippingOrders = userOrders.filter((o) => o.status === OrderStatus.Shipping).length;
                const pendingOrders = userOrders.filter((o) => o.status === OrderStatus.Pending || o.status === OrderStatus.Confirmed).length;
                const totalSpent = userOrders
                    .filter((o) => o.status === OrderStatus.Completed)
                    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
                const totalOrderValue = userOrders
                    .filter((o) => o.status !== OrderStatus.Cancelled)
                    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
                const formattedAddress = user.address ||
                    [user.street, user.ward, user.district, user.province].filter(Boolean).join(', ') ||
                    'Chưa cập nhật';
                // Lấy tên thật từ đơn hàng nếu user.name là số điện thoại hoặc chưa chuẩn
                const orderWithName = userOrders.find((o) => o.customer?.name && o.customer.name.trim() && !/^[0-9+.\s-]{8,15}$/.test(o.customer.name.trim()));
                const actualNameFromOrder = orderWithName?.customer?.name?.trim();
                const isPhoneLikeName = /^[0-9+.\s-]{8,15}$/.test(user.name || '');
                let resolvedUserName = actualNameFromOrder;
                if (!resolvedUserName) {
                    if (user.name && !isPhoneLikeName) {
                        resolvedUserName = user.name;
                    }
                    else if (user.name && isPhoneLikeName) {
                        resolvedUserName = `Khách hàng (${user.name})`;
                    }
                    else {
                        resolvedUserName = user.username || 'Khách hàng';
                    }
                }
                return {
                    id: user._id,
                    name: resolvedUserName,
                    username: user.username,
                    email: user.email || 'Chưa cập nhật',
                    phone: user.phone || 'Chưa cập nhật',
                    address: formattedAddress,
                    province: user.province || '',
                    district: user.district || '',
                    ward: user.ward || '',
                    street: user.street || '',
                    avatar: user.avatar || '',
                    role: user.role,
                    isGoogleAuth: Boolean(user.googleId),
                    isRegistered: true,
                    isActive: user.isActive,
                    createdAt: user.createdAt,
                    lastLogin: user.lastLogin,
                    stats: {
                        totalOrders,
                        completedOrders,
                        cancelledOrders,
                        shippingOrders,
                        pendingOrders,
                        totalSpent,
                        totalOrderValue,
                        lastOrderDate: userOrders[0]?.createdAt || null
                    }
                };
            });
            // 2. Tổng hợp thêm đơn hàng từ khách vãng lai (khách POS / đặt nhanh chưa tạo tài khoản)
            const registeredPhones = new Set(users.map((u) => (u.phone ? u.phone.replace(/[\s.-]/g, '').trim() : '')).filter(Boolean));
            const registeredEmails = new Set(users.map((u) => (u.email ? u.email.toLowerCase().trim() : '')).filter(Boolean));
            const guestMap = new Map();
            orders.forEach((o) => {
                const oPhone = o.customer?.phone ? o.customer.phone.replace(/[\s.-]/g, '').trim() : '';
                const oEmail = o.customer?.email ? o.customer.email.toLowerCase().trim() : '';
                const oCustId = o.customerId ? o.customerId.toString() : '';
                if (oCustId && users.some((u) => u._id.toString() === oCustId))
                    return;
                if (oPhone && registeredPhones.has(oPhone))
                    return;
                if (oEmail && registeredEmails.has(oEmail))
                    return;
                const key = oPhone || o.customer?.name || 'guest_' + o._id;
                const orderCustName = (o.customer?.name && o.customer.name.trim() && !/^[0-9+.\s-]{8,15}$/.test(o.customer.name.trim())) ? o.customer.name.trim() : '';
                const initialGuestName = orderCustName || (oPhone ? `Khách hàng (${oPhone})` : 'Khách vãng lai');
                if (!guestMap.has(key)) {
                    guestMap.set(key, {
                        id: 'guest_' + (oPhone || o._id),
                        name: initialGuestName,
                        username: oPhone ? `guest_${oPhone}` : 'guest',
                        email: o.customer?.email || 'Chưa cập nhật',
                        phone: o.customer?.phone || 'Chưa cập nhật',
                        address: o.customer?.address || 'Tại showroom MoonLight',
                        avatar: '',
                        role: 'Guest',
                        isGoogleAuth: false,
                        isRegistered: false,
                        isActive: true,
                        createdAt: o.createdAt,
                        stats: {
                            totalOrders: 0,
                            completedOrders: 0,
                            cancelledOrders: 0,
                            shippingOrders: 0,
                            pendingOrders: 0,
                            totalSpent: 0,
                            totalOrderValue: 0,
                            lastOrderDate: o.createdAt
                        }
                    });
                }
                const g = guestMap.get(key);
                if (orderCustName && (!g.name || g.name.startsWith('Khách hàng (') || g.name === 'Khách vãng lai')) {
                    g.name = orderCustName;
                }
                if (g.address === 'Tại showroom MoonLight' && o.customer?.address) {
                    g.address = o.customer.address;
                }
                if (g.email === 'Chưa cập nhật' && o.customer?.email) {
                    g.email = o.customer.email;
                }
                g.stats.totalOrders += 1;
                if (o.status === OrderStatus.Completed) {
                    g.stats.completedOrders += 1;
                    g.stats.totalSpent += Number(o.total) || 0;
                    g.stats.totalOrderValue += Number(o.total) || 0;
                }
                else if (o.status === OrderStatus.Cancelled) {
                    g.stats.cancelledOrders += 1;
                }
                else if (o.status === OrderStatus.Shipping) {
                    g.stats.shippingOrders += 1;
                    g.stats.totalOrderValue += Number(o.total) || 0;
                }
                else {
                    g.stats.pendingOrders += 1;
                    g.stats.totalOrderValue += Number(o.total) || 0;
                }
            });
            const combinedList = [...userList, ...Array.from(guestMap.values())];
            sendSuccess(res, combinedList, 'Lấy danh sách người dùng và thống kê đơn hàng thành công');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Lấy chi tiết lịch sử đặt hàng của một người dùng và trạng thái giao hàng
     */
    static async getUserOrderHistory(req, res, next) {
        try {
            const id = String(req.params.id || '').trim();
            let targetUser = null;
            let orderQuery = {};
            if (id.startsWith('guest_')) {
                const searchKey = id.replace('guest_', '');
                orderQuery = {
                    $or: [{ 'customer.phone': searchKey }, { 'customer.name': searchKey }]
                };
                targetUser = {
                    id,
                    name: /^[0-9+.\s-]{8,15}$/.test(searchKey) ? `Khách hàng (${searchKey})` : searchKey,
                    phone: searchKey,
                    email: 'Chưa cập nhật',
                    address: 'Tại showroom MoonLight',
                    isRegistered: false
                };
            }
            else if (mongoose.Types.ObjectId.isValid(id)) {
                targetUser = await User.findById(id).select('-password');
                if (!targetUser) {
                    sendError(res, 'Không tìm thấy người dùng này trong hệ thống', 404, 'USER_NOT_FOUND');
                    return;
                }
                const orConditions = [{ customerId: targetUser._id }];
                if (targetUser.phone) {
                    orConditions.push({ 'customer.phone': targetUser.phone });
                }
                if (targetUser.email) {
                    orConditions.push({ 'customer.email': targetUser.email.toLowerCase().trim() });
                }
                orderQuery = { $or: orConditions };
            }
            else {
                orderQuery = { 'customer.phone': id };
                targetUser = {
                    id,
                    name: /^[0-9+.\s-]{8,15}$/.test(id) ? `Khách hàng (${id})` : id,
                    phone: id,
                    address: 'Chưa cập nhật',
                    isRegistered: false
                };
            }
            const orders = await Order.find(orderQuery).sort({ createdAt: -1 });
            // Lấy tên, sđt, email, địa chỉ chuẩn xác nhất từ các đơn hàng thực tế
            const orderWithName = orders.find((o) => o.customer?.name && o.customer.name.trim() && !/^[0-9+.\s-]{8,15}$/.test(o.customer.name.trim()));
            const actualCustomerName = orderWithName?.customer?.name?.trim();
            const orderWithAddress = orders.find((o) => o.customer?.address && o.customer.address.trim() && o.customer.address !== 'Tại showroom MoonLight');
            const actualCustomerAddress = orderWithAddress?.customer?.address?.trim();
            const orderWithEmail = orders.find((o) => o.customer?.email && o.customer.email.trim() && o.customer.email !== 'Chưa cập nhật');
            const actualCustomerEmail = orderWithEmail?.customer?.email?.trim();
            let resolvedName = actualCustomerName;
            if (!resolvedName) {
                if (targetUser?.name && !/^[0-9+.\s-]{8,15}$/.test(targetUser.name.trim())) {
                    resolvedName = targetUser.name.trim();
                }
                else if (targetUser?.name && /^[0-9+.\s-]{8,15}$/.test(targetUser.name.trim())) {
                    resolvedName = `Khách hàng (${targetUser.name.trim()})`;
                }
                else if (targetUser?.phone && targetUser.phone !== 'Chưa cập nhật') {
                    resolvedName = `Khách hàng (${targetUser.phone})`;
                }
                else {
                    resolvedName = 'Khách hàng';
                }
            }
            const finalUser = {
                ...(targetUser?._doc || targetUser || {}),
                name: resolvedName,
                phone: targetUser?.phone && targetUser.phone !== 'Chưa cập nhật' ? targetUser.phone : (orders[0]?.customer?.phone || 'Chưa cập nhật'),
                email: targetUser?.email && targetUser.email !== 'Chưa cập nhật' ? targetUser.email : (actualCustomerEmail || 'Chưa cập nhật'),
                address: targetUser?.address && targetUser.address !== 'Chưa cập nhật' && targetUser.address !== 'Tại showroom MoonLight' ? targetUser.address : (actualCustomerAddress || 'Tại showroom MoonLight')
            };
            const totalOrders = orders.length;
            const completedOrders = orders.filter((o) => o.status === OrderStatus.Completed).length;
            const cancelledOrders = orders.filter((o) => o.status === OrderStatus.Cancelled).length;
            const shippingOrders = orders.filter((o) => o.status === OrderStatus.Shipping).length;
            const pendingOrders = orders.filter((o) => o.status === OrderStatus.Pending || o.status === OrderStatus.Confirmed).length;
            const totalSpent = orders
                .filter((o) => o.status === OrderStatus.Completed)
                .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
            sendSuccess(res, {
                user: finalUser,
                orders,
                stats: {
                    totalOrders,
                    completedOrders,
                    cancelledOrders,
                    shippingOrders,
                    pendingOrders,
                    totalSpent
                }
            }, 'Lấy chi tiết lịch sử đơn hàng của người dùng thành công');
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