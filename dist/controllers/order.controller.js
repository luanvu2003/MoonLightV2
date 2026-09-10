import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { CustomerService } from '../services/customer.service.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';
import { OrderStatus } from '../types/enums.js';
async function restoreOrderStock(items) {
    if (!Array.isArray(items))
        return;
    for (const item of items) {
        try {
            const prodId = String(item.id || item._id);
            const qty = Number(item.quantity) || 1;
            const color = String(item.color || '').trim();
            const size = String(item.size || '').trim();
            if (mongoose.Types.ObjectId.isValid(prodId)) {
                await Product.findOneAndUpdate({
                    _id: prodId,
                    variants: {
                        $elemMatch: {
                            color: color,
                            sizes: { $elemMatch: { $or: [{ size: size }, { name: size }] } }
                        }
                    }
                }, {
                    $inc: {
                        "variants.$[v].sizes.$[s].stock": qty,
                        sold: -qty
                    }
                }, {
                    arrayFilters: [
                        { "v.color": color },
                        { $or: [{ "s.size": size }, { "s.name": size }] }
                    ]
                });
            }
        }
        catch (err) {
            console.warn('⚠️ Lỗi hoàn kho đơn hàng:', err);
        }
    }
}
export class OrderController {
    static async getAll(req, res, next) {
        try {
            const { status, search, page, limit, sort, order } = req.query;
            const filter = {};
            if (status && status !== 'all') {
                filter.status = String(status);
            }
            if (search) {
                const s = String(search).trim();
                filter.$or = [
                    { orderCode: { $regex: s, $options: 'i' } },
                    { 'customer.name': { $regex: s, $options: 'i' } },
                    { 'customer.phone': { $regex: s, $options: 'i' } }
                ];
            }
            const sortOrder = order === 'asc' ? 1 : -1;
            const sortField = sort ? String(sort) : 'createdAt';
            const sortObj = { [sortField]: sortOrder };
            if (page && limit) {
                const pageNum = Math.max(1, parseInt(String(page), 10));
                const limitNum = Math.max(1, parseInt(String(limit), 10));
                const skip = (pageNum - 1) * limitNum;
                const [orders, total] = await Promise.all([
                    Order.find(filter).sort(sortObj).skip(skip).limit(limitNum),
                    Order.countDocuments(filter)
                ]);
                sendPaginated(res, orders, {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum)
                }, 'Lấy danh sách đơn hàng thành công');
                return;
            }
            const orders = await Order.find(filter).sort(sortObj);
            sendSuccess(res, orders, 'Lấy danh sách đơn hàng thành công');
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const order = await Order.findById(id);
            if (!order) {
                sendError(res, 'Không tìm thấy đơn hàng', 404, 'ORDER_NOT_FOUND');
                return;
            }
            sendSuccess(res, order, 'Lấy chi tiết đơn hàng thành công');
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const orderData = req.body;
            if (!orderData.customer || !orderData.customer.name || !orderData.customer.phone || !orderData.customer.address) {
                sendError(res, 'Vui lòng cung cấp đầy đủ thông tin người nhận (Tên, SĐT, Địa chỉ)', 400, 'BAD_REQUEST');
                return;
            }
            if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
                sendError(res, 'Giỏ hàng không có sản phẩm nào', 400, 'EMPTY_CART');
                return;
            }
            // 1. Trừ kho nguyên tử (Atomic Operations) chống Race Condition khi đặt cùng lúc
            const decrementedItems = [];
            for (const item of orderData.items) {
                const prodId = String(item.id || item._id);
                const qty = Number(item.quantity) || 1;
                const color = String(item.color || '').trim();
                const size = String(item.size || '').trim();
                if (mongoose.Types.ObjectId.isValid(prodId)) {
                    // Điều kiện tiên quyết: tồn kho hiện tại PHẢI >= qty
                    const updatedProduct = await Product.findOneAndUpdate({
                        _id: prodId,
                        variants: {
                            $elemMatch: {
                                color: color,
                                sizes: {
                                    $elemMatch: {
                                        $or: [{ size: size }, { name: size }],
                                        stock: { $gte: qty }
                                    }
                                }
                            }
                        }
                    }, {
                        $inc: {
                            "variants.$[v].sizes.$[s].stock": -qty,
                            sold: qty
                        }
                    }, {
                        arrayFilters: [
                            { "v.color": color },
                            { $or: [{ "s.size": size }, { "s.name": size }] }
                        ],
                        new: true
                    });
                    if (!updatedProduct) {
                        // Tồn kho không đủ hoặc vừa có khách khác mua trước trong tích tắc!
                        // Rollback lại các món đã trừ trước đó trong đơn này
                        await restoreOrderStock(decrementedItems);
                        let currentRemaining = 0;
                        try {
                            const currentProd = await Product.findById(prodId);
                            const curVar = currentProd?.variants?.find((v) => v.color === color);
                            const curSz = curVar?.sizes?.find((s) => (s.size || s.name) === size);
                            currentRemaining = curSz ? (curSz.stock || 0) : 0;
                        }
                        catch { }
                        sendError(res, `Sản phẩm "${item.name}" (${color} - Size ${size}) vừa có khách đặt trước! Hiện trong kho chỉ còn ${currentRemaining} cái (bạn đang đặt ${qty} cái). Vui lòng cập nhật lại giỏ hàng.`, 400, 'CONCURRENT_STOCK_EXCEEDED');
                        return;
                    }
                    decrementedItems.push({ prodId, color, size, quantity: qty });
                }
            }
            // Chuẩn hóa toàn bộ danh sách mặt hàng để khớp schema OrderItem
            orderData.items = orderData.items.map((item) => {
                const pId = item.productId || item.id || item._id || 'prod_' + Date.now();
                const pName = item.productName || item.name || 'Sản phẩm';
                const pPrice = Number(item.price) || 0;
                const pQty = Number(item.quantity) || 1;
                const pSubtotal = (item.subtotal !== undefined && !isNaN(Number(item.subtotal)))
                    ? Number(item.subtotal)
                    : pPrice * pQty;
                const pVariant = item.variant || [item.color, item.size].filter(Boolean).join(' - ') || 'Tiêu chuẩn';
                const pImg = item.img || item.image || '';
                return {
                    productId: pId,
                    id: pId,
                    productName: pName,
                    name: pName,
                    variant: pVariant,
                    color: item.color || '',
                    size: item.size || '',
                    img: pImg,
                    price: pPrice,
                    quantity: pQty,
                    subtotal: pSubtotal
                };
            });
            // Tự sinh mã đơn hàng nếu chưa có
            if (!orderData.orderCode) {
                const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
                const randomNum = Math.floor(1000 + Math.random() * 9000);
                orderData.orderCode = `ML-${today}-${randomNum}`;
            }
            // Tính tổng nếu chưa tính
            if (orderData.subtotal === undefined) {
                orderData.subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            }
            if (orderData.discount === undefined)
                orderData.discount = 0;
            if (orderData.shippingFee === undefined)
                orderData.shippingFee = 0; // Mặc định miễn phí vận chuyển theo checkout
            if (orderData.total === undefined) {
                orderData.total = Math.max(0, orderData.subtotal - orderData.discount + orderData.shippingFee);
            }
            if (!orderData.status) {
                orderData.status = OrderStatus.Pending;
            }
            if (!orderData.customerId && req.user?.id) {
                orderData.customerId = req.user.id;
            }
            const newOrder = new Order(orderData);
            const savedOrder = await newOrder.save();
            // Tự động lưu thông tin khách hàng (SĐT, Địa chỉ) vào tài khoản User nếu có liên kết
            try {
                const updateUserData = {};
                if (savedOrder.customer.name && savedOrder.customer.name.trim() && !/^[0-9+.\s-]{8,15}$/.test(savedOrder.customer.name.trim())) {
                    updateUserData.name = savedOrder.customer.name.trim();
                }
                if (savedOrder.customer.phone)
                    updateUserData.phone = savedOrder.customer.phone;
                if (savedOrder.customer.address)
                    updateUserData.address = savedOrder.customer.address;
                const custData = orderData.customer || {};
                if (custData.province)
                    updateUserData.province = custData.province;
                if (custData.district)
                    updateUserData.district = custData.district;
                if (custData.ward)
                    updateUserData.ward = custData.ward;
                if (custData.street)
                    updateUserData.street = custData.street;
                let userQuery = null;
                if (orderData.customerId && mongoose.Types.ObjectId.isValid(orderData.customerId)) {
                    userQuery = { _id: orderData.customerId };
                }
                else if (orderData.customer?.email) {
                    userQuery = { email: String(orderData.customer.email).toLowerCase().trim() };
                }
                else if (savedOrder.customer.phone) {
                    userQuery = { phone: savedOrder.customer.phone };
                }
                if (userQuery && Object.keys(updateUserData).length > 0) {
                    const updatedUser = await User.findOneAndUpdate(userQuery, { $set: updateUserData }, { new: true }).select('-password');
                    if (updatedUser) {
                        savedOrder._doc = {
                            ...savedOrder._doc,
                            updatedCustomerUser: {
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
                                avatar: updatedUser.avatar
                            }
                        };
                    }
                }
            }
            catch (uErr) {
                console.warn('⚠️ Cập nhật thông tin tài khoản sau khi đặt hàng thất bại:', uErr.message);
            }
            // Nếu đơn là POS hoàn thành ngay, cập nhật khách hàng
            if (savedOrder.status === OrderStatus.Completed && savedOrder.customer.phone) {
                await CustomerService.syncCustomerStatsByPhone(savedOrder.customer.phone, savedOrder.customer.name, savedOrder.customer.address);
            }
            sendSuccess(res, savedOrder, 'Đặt đơn hàng thành công', 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateStatus(req, res, next) {
        try {
            const idStr = String(req.params.id || '').trim();
            const { status, cancelReason } = req.body;
            if (!Object.values(OrderStatus).includes(status)) {
                sendError(res, 'Trạng thái đơn hàng không hợp lệ', 400, 'INVALID_STATUS');
                return;
            }
            const isObjectId = mongoose.Types.ObjectId.isValid(idStr);
            const query = isObjectId ? { $or: [{ _id: idStr }, { orderCode: idStr }] } : { orderCode: idStr };
            const oldOrder = await Order.findOne(query);
            if (!oldOrder) {
                sendError(res, 'Không tìm thấy đơn hàng để cập nhật', 404, 'ORDER_NOT_FOUND');
                return;
            }
            const wasCancelled = oldOrder.status === OrderStatus.Cancelled;
            oldOrder.status = status;
            if (status === OrderStatus.Completed) {
                oldOrder.isPaid = true;
            }
            if (cancelReason)
                oldOrder.cancelReason = cancelReason;
            if (req.user)
                oldOrder.processedBy = req.user.id;
            const updatedOrder = await oldOrder.save();
            // Nếu hủy đơn -> Tự động hoàn lại tồn kho cho các sản phẩm
            if (status === OrderStatus.Cancelled && !wasCancelled && oldOrder.items) {
                await restoreOrderStock(oldOrder.items);
            }
            // Khi đơn hoàn thành hoặc thay đổi trạng thái, đồng bộ điểm chi tiêu khách hàng
            if (updatedOrder.customer?.phone) {
                await CustomerService.syncCustomerStatsByPhone(updatedOrder.customer.phone, updatedOrder.customer.name, updatedOrder.customer.address);
            }
            sendSuccess(res, updatedOrder, 'Cập nhật trạng thái đơn hàng thành công');
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const idStr = String(req.params.id || '').trim();
            const isObjectId = mongoose.Types.ObjectId.isValid(idStr);
            const query = isObjectId ? { $or: [{ _id: idStr }, { orderCode: idStr }] } : { orderCode: idStr };
            const deletedOrder = await Order.findOneAndDelete(query);
            if (!deletedOrder) {
                sendError(res, 'Không tìm thấy đơn hàng để xóa', 404, 'ORDER_NOT_FOUND');
                return;
            }
            // Nếu đơn chưa hủy mà bị xóa -> hoàn trả tồn kho
            if (deletedOrder.status !== OrderStatus.Cancelled && deletedOrder.items) {
                await restoreOrderStock(deletedOrder.items);
            }
            // Đồng bộ lại chi tiêu của khách hàng sau khi xóa đơn
            if (deletedOrder.customer?.phone) {
                await CustomerService.syncCustomerStatsByPhone(deletedOrder.customer.phone);
            }
            sendSuccess(res, null, 'Đã xóa đơn hàng thành công');
        }
        catch (error) {
            next(error);
        }
    }
    static async confirmTransfer(req, res, next) {
        try {
            const orderCode = String(req.params.orderCode || '').trim();
            const isObjectId = mongoose.Types.ObjectId.isValid(orderCode);
            const query = isObjectId
                ? { $or: [{ orderCode }, { _id: orderCode }] }
                : { orderCode };
            const order = await Order.findOne(query);
            if (!order) {
                sendError(res, 'Không tìm thấy đơn hàng cần xác nhận chuyển khoản', 404, 'ORDER_NOT_FOUND');
                return;
            }
            order.isPaid = true;
            order.customerTransferConfirmed = true;
            const nowStr = new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN');
            const transferNote = `[Khách xác nhận đã chuyển khoản TPBank lúc ${nowStr}]`;
            if (order.customer) {
                order.customer.note = order.customer.note ? `${order.customer.note} | ${transferNote}` : transferNote;
            }
            await order.save();
            // Đồng bộ thông tin khách hàng nếu cần
            if (order.customer?.phone) {
                await CustomerService.syncCustomerStatsByPhone(order.customer.phone, order.customer.name, order.customer.address);
            }
            sendSuccess(res, order, 'Xác nhận chuyển khoản ngân hàng thành công!');
        }
        catch (error) {
            next(error);
        }
    }
    static async handleWebhook(req, res, next) {
        try {
            const data = req.body || {};
            console.log('💳 [Banking Webhook Received]:', JSON.stringify(data));
            // Hỗ trợ cả SePay, Casso, PayOS và định dạng Webhook ngân hàng chuẩn
            const content = String(data.content || data.description || data.addInfo || data.transactionContent || (data.data && data.data[0]?.description) || '');
            const codeField = String(data.code || data.orderCode || '');
            const amount = Number(data.transferAmount || data.amount || (data.data && data.data[0]?.amount) || 0);
            const refCode = String(data.referenceCode || data.id || (data.data && data.data[0]?.tid) || '');
            // Gom toàn bộ nội dung để tìm kiếm mã đơn hàng linh hoạt
            const fullText = `${content} ${codeField} ${data.description || ''} ${data.addInfo || ''}`.trim();
            // 1. Tìm định dạng chuẩn ML-YYYYMMDD-XXXX (hỗ trợ cả dấu cách, gạch nối, gạch dưới do app ngân hàng thay thế)
            // Ví dụ: ML-20260906-6136, ML 20260906 6136, ML202609066136, ML_20260906_6136
            const fullMatch = fullText.match(/ML[-_\s]*(\d{8})[-_\s]*(\d{4})/i);
            let orderCode = '';
            if (fullMatch) {
                orderCode = `ML-${fullMatch[1]}-${fullMatch[2]}`;
            }
            else if (data.orderCode) {
                orderCode = String(data.orderCode);
            }
            else if (data.code && String(data.code).startsWith('ML')) {
                orderCode = String(data.code);
            }
            else {
                const shortMatch = fullText.match(/ML[-_\s]*(\d{4,12})/i);
                if (shortMatch) {
                    orderCode = shortMatch[0].toUpperCase().replace(/\s+/g, '-');
                }
                else if (data.code) {
                    orderCode = String(data.code);
                }
            }
            if (!orderCode) {
                sendSuccess(res, null, 'Webhook nhận thành công (Không có mã đơn hàng trong nội dung)');
                return;
            }
            const normalizedCode = orderCode.toUpperCase();
            const last4 = normalizedCode.match(/\d{4}$/)?.[0] || '';
            const dateDigits = normalizedCode.match(/\d{8}/)?.[0] || '';
            const queryOr = [
                { orderCode: normalizedCode },
                { orderCode: normalizedCode.replace(/[-_\s]/g, '') },
                { orderCode: new RegExp(normalizedCode.replace(/[-_]/g, '[-_\\s]?'), 'i') }
            ];
            if (last4 && dateDigits) {
                queryOr.push({ orderCode: new RegExp(`ML[-_\\s]?${dateDigits}[-_\\s]?${last4}`, 'i') });
            }
            else if (last4) {
                queryOr.push({ orderCode: new RegExp(last4 + '$', 'i') });
            }
            const order = await Order.findOne({ $or: queryOr });
            if (!order) {
                sendSuccess(res, null, `Không tìm thấy đơn hàng ${orderCode} trong hệ thống`);
                return;
            }
            // Kiểm tra số tiền chuyển khoản nếu có
            if (amount > 0 && amount < order.total) {
                const warnNote = `[Khách chuyển thiếu tiền: nhận ${amount.toLocaleString('vi-VN')}₫ / cần ${order.total.toLocaleString('vi-VN')}₫. Ref: ${refCode}]`;
                order.customer.note = order.customer.note ? `${order.customer.note} | ${warnNote}` : warnNote;
                await order.save();
                sendSuccess(res, order, 'Đã ghi nhận chuyển khoản nhưng số tiền chưa đủ');
                return;
            }
            // Khớp lệnh thành công 100%!
            order.isPaid = true;
            order.customerTransferConfirmed = true;
            const nowStr = new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN');
            const autoNote = `[Tự động khớp Webhook Ngân hàng (+${amount > 0 ? amount.toLocaleString('vi-VN') + '₫' : 'Đủ'}) lúc ${nowStr}, Ref: ${refCode || 'N/A'}]`;
            order.customer.note = order.customer.note ? `${order.customer.note} | ${autoNote}` : autoNote;
            await order.save();
            // Đồng bộ thông tin khách hàng
            if (order.customer?.phone) {
                await CustomerService.syncCustomerStatsByPhone(order.customer.phone, order.customer.name, order.customer.address);
            }
            sendSuccess(res, { orderCode: order.orderCode, isPaid: true }, 'Khớp lệnh chuyển khoản tự động thành công!');
        }
        catch (error) {
            next(error);
        }
    }
    static async checkPaymentStatus(req, res, next) {
        try {
            const orderCode = String(req.params.orderCode || '').trim();
            const isObjectId = mongoose.Types.ObjectId.isValid(orderCode);
            const query = isObjectId
                ? { $or: [{ orderCode }, { _id: orderCode }] }
                : { orderCode };
            const order = await Order.findOne(query).select('orderCode isPaid customerTransferConfirmed status total');
            if (!order) {
                sendError(res, 'Không tìm thấy đơn hàng', 404, 'ORDER_NOT_FOUND');
                return;
            }
            sendSuccess(res, {
                orderCode: order.orderCode,
                isPaid: Boolean(order.isPaid),
                customerTransferConfirmed: Boolean(order.customerTransferConfirmed),
                status: order.status,
                total: order.total
            }, 'Lấy trạng thái thanh toán thành công');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Lấy toàn bộ đơn hàng của khách hàng đang đăng nhập kèm trạng thái chi tiết
     */
    static async getMyOrders(req, res, next) {
        try {
            if (!req.user) {
                sendError(res, 'Chưa đăng nhập', 401, 'UNAUTHORIZED');
                return;
            }
            const user = await User.findById(req.user.id);
            const orConditions = [{ customerId: req.user.id }];
            if (user?.phone) {
                orConditions.push({ 'customer.phone': user.phone });
            }
            if (user?.email) {
                orConditions.push({ 'customer.email': user.email });
            }
            if (req.user.username) {
                orConditions.push({ 'customer.phone': req.user.username });
            }
            const orders = await Order.find({ $or: orConditions })
                .sort({ createdAt: -1 })
                .lean();
            sendSuccess(res, orders, 'Lấy danh sách đơn hàng thành công');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Khách hàng tự hủy đơn hàng của mình khi đơn còn ở trạng thái Chờ tiếp nhận (Pending)
     */
    static async cancelMyOrder(req, res, next) {
        try {
            if (!req.user) {
                sendError(res, 'Chưa đăng nhập', 401, 'UNAUTHORIZED');
                return;
            }
            const idStr = String(req.params.id || '').trim();
            const { reason } = req.body;
            const isObjectId = mongoose.Types.ObjectId.isValid(idStr);
            const query = isObjectId ? { $or: [{ _id: idStr }, { orderCode: idStr }] } : { orderCode: idStr };
            const order = await Order.findOne(query);
            if (!order) {
                sendError(res, 'Không tìm thấy đơn hàng cần hủy', 404, 'ORDER_NOT_FOUND');
                return;
            }
            // Xác thực quyền sở hữu đơn hàng
            const user = await User.findById(req.user.id);
            const isOwner = (order.customerId && String(order.customerId) === String(req.user.id)) ||
                (user?.phone && order.customer?.phone === user.phone) ||
                (user?.email && order.customer?.email === user.email);
            if (!isOwner) {
                sendError(res, 'Bạn không có quyền thao tác trên đơn hàng này', 403, 'FORBIDDEN');
                return;
            }
            if (order.status !== OrderStatus.Pending) {
                sendError(res, `Đơn hàng đang ở trạng thái "${order.status === OrderStatus.Confirmed ? 'Đã xác nhận' : 'Đang xử lý / Đang giao'}", không thể tự hủy. Quý khách vui lòng liên hệ hotline/zalo để được hỗ trợ.`, 400, 'ORDER_CANNOT_BE_CANCELLED');
                return;
            }
            order.status = OrderStatus.Cancelled;
            order.cancelReason = reason || 'Khách hàng yêu cầu hủy đơn qua trang quản lý cá nhân';
            await order.save();
            // Hoàn kho nguyên tử
            if (order.items) {
                await restoreOrderStock(order.items);
            }
            if (order.customer?.phone) {
                await CustomerService.syncCustomerStatsByPhone(order.customer.phone);
            }
            sendSuccess(res, order, 'Đã hủy đơn hàng thành công');
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=order.controller.js.map