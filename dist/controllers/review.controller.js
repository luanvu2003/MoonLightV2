import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';
export class ReviewController {
    static async getAll(req, res, next) {
        try {
            const { productId, rating, hasReply, page, limit, sort } = req.query;
            const filter = {};
            if (productId && productId !== 'all') {
                filter.productId = productId;
            }
            if (rating && rating !== 'all') {
                filter.rating = Number(rating);
            }
            if (hasReply === 'true') {
                filter.shopReply = { $exists: true, $ne: '' };
            }
            else if (hasReply === 'false') {
                filter.$or = [{ shopReply: { $exists: false } }, { shopReply: '' }];
            }
            const sortObj = { createdAt: -1 };
            if (page && limit) {
                const pageNum = Math.max(1, parseInt(String(page), 10));
                const limitNum = Math.max(1, parseInt(String(limit), 10));
                const skip = (pageNum - 1) * limitNum;
                const [reviews, total] = await Promise.all([
                    Review.find(filter).sort(sortObj).skip(skip).limit(limitNum),
                    Review.countDocuments(filter)
                ]);
                sendPaginated(res, reviews, {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum)
                }, 'Lấy danh sách đánh giá thành công');
                return;
            }
            const reviews = await Review.find(filter).sort(sortObj);
            sendSuccess(res, reviews, 'Lấy danh sách đánh giá thành công');
        }
        catch (error) {
            next(error);
        }
    }
    static async getByProduct(req, res, next) {
        try {
            const { productId } = req.params;
            const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
            // Đối với trang khách hàng công khai: ẩn tên nhân viên nội bộ, hiển thị thương hiệu "MoonLight"
            const publicReviews = reviews.map((r) => {
                const obj = r.toObject();
                if (obj.shopReply) {
                    obj.shopReplyBy = 'MoonLight';
                    obj.shopReplyRole = 'Thương hiệu';
                }
                return obj;
            });
            sendSuccess(res, publicReviews, 'Lấy đánh giá sản phẩm thành công');
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const { productId, productName, name, rating, content } = req.body;
            if (!productId || !name || !rating || !content) {
                sendError(res, 'Vui lòng cung cấp đầy đủ thông tin đánh giá', 400, 'BAD_REQUEST');
                return;
            }
            let pName = productName;
            if (!pName) {
                const prod = await Product.findById(productId);
                pName = prod ? prod.name : 'Sản phẩm MoonLight';
            }
            const review = new Review({
                productId,
                productName: pName,
                name: name.trim(),
                rating: Math.min(5, Math.max(1, Number(rating))),
                content: content.trim(),
                status: 'approved' // Liêm khiết: luôn approved ngay lập tức
            });
            const saved = await review.save();
            // Cập nhật điểm rating trung bình của sản phẩm
            const allProductReviews = await Review.find({ productId });
            if (allProductReviews.length > 0) {
                const avg = (allProductReviews.reduce((sum, r) => sum + r.rating, 0) / allProductReviews.length).toFixed(1);
                await Product.findByIdAndUpdate(productId, { rating: parseFloat(avg) });
            }
            sendSuccess(res, saved, 'Đánh giá đã được gửi và hiển thị thành công', 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async reply(req, res, next) {
        try {
            const { id } = req.params;
            const { reply } = req.body;
            if (!reply || !reply.trim()) {
                sendError(res, 'Nội dung phản hồi không được để trống', 400, 'BAD_REQUEST');
                return;
            }
            const staffName = req.user?.name || 'Nhân viên';
            const staffRole = req.user?.role || 'Staff';
            const updated = await Review.findByIdAndUpdate(id, {
                shopReply: reply.trim(),
                shopReplyBy: staffName,
                shopReplyRole: staffRole,
                shopReplyDate: new Date()
            }, { new: true });
            if (!updated) {
                sendError(res, 'Không tìm thấy đánh giá', 404, 'REVIEW_NOT_FOUND');
                return;
            }
            sendSuccess(res, updated, 'Đã gửi phản hồi đánh giá thành công');
        }
        catch (error) {
            next(error);
        }
    }
    static async exportCsv(req, res, next) {
        try {
            const reviews = await Review.find().sort({ createdAt: -1 });
            let csv = '\uFEFF';
            csv += 'Sản phẩm,Khách hàng,Số sao,Nội dung đánh giá,Thời gian,Phản hồi của Shop,Người phản hồi (Nội bộ),Thời gian phản hồi\n';
            reviews.forEach((r) => {
                const prod = `"${(r.productName || '').replace(/"/g, '""')}"`;
                const customer = `"${(r.name || '').replace(/"/g, '""')}"`;
                const star = r.rating;
                const content = `"${(r.content || '').replace(/"/g, '""')}"`;
                const time = r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : '';
                const reply = `"${(r.shopReply || '').replace(/"/g, '""')}"`;
                const replyBy = `"${(r.shopReplyBy ? `${r.shopReplyBy} (${r.shopReplyRole})` : '').replace(/"/g, '""')}"`;
                const replyDate = r.shopReplyDate ? new Date(r.shopReplyDate).toLocaleDateString('vi-VN') : '';
                csv += `${prod},${customer},${star},${content},${time},${reply},${replyBy},${replyDate}\n`;
            });
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename=MoonLight_DanhGia_${new Date().toISOString().slice(0, 10)}.csv`);
            res.status(200).send(csv);
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=review.controller.js.map