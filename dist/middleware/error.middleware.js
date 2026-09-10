import { sendError } from '../utils/response.js';
export const notFoundHandler = (req, res) => {
    if (req.accepts('html') && !req.path.startsWith('/api/')) {
        res.status(404).send('Trang không tồn tại - MoonLight');
        return;
    }
    sendError(res, `Không tìm thấy đường dẫn: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND');
};
export const errorHandler = (err, req, res, next) => {
    console.error('🔥 Lỗi hệ thống:', err);
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e) => e.message);
        sendError(res, `Dữ liệu không hợp lệ: ${messages.join(', ')}`, 400, 'VALIDATION_ERROR', err.errors);
        return;
    }
    // Mongoose duplicate key error (11000)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || 'Trường';
        sendError(res, `${field} này đã tồn tại trong hệ thống`, 409, 'DUPLICATE_KEY');
        return;
    }
    // CastError (invalid ObjectId)
    if (err.name === 'CastError') {
        sendError(res, 'ID không đúng định dạng', 400, 'INVALID_ID');
        return;
    }
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Lỗi máy chủ nội bộ';
    sendError(res, message, statusCode, 'SERVER_ERROR');
};
//# sourceMappingURL=error.middleware.js.map