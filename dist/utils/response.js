export const sendSuccess = (res, data, message = 'Thành công', statusCode = 200) => {
    const responseBody = {
        success: true,
        message,
        data
    };
    return res.status(statusCode).json(responseBody);
};
export const sendPaginated = (res, data, pagination, message = 'Lấy dữ liệu thành công') => {
    const responseBody = {
        success: true,
        message,
        data,
        pagination
    };
    return res.status(200).json(responseBody);
};
export const sendError = (res, message = 'Đã có lỗi xảy ra', statusCode = 500, errorCode = 'INTERNAL_ERROR', details) => {
    const responseBody = {
        success: false,
        message,
        error: {
            code: errorCode,
            status: statusCode,
            details
        }
    };
    return res.status(statusCode).json(responseBody);
};
//# sourceMappingURL=response.js.map