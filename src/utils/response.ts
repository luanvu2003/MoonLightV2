import { Response } from 'express';
import { ApiResponse } from '../types/api.types.js';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Thành công',
  statusCode = 200
): Response => {
  const responseBody: ApiResponse<T> = {
    success: true,
    message,
    data
  };
  return res.status(statusCode).json(responseBody);
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  pagination: { page: number; limit: number; total: number; totalPages: number },
  message = 'Lấy dữ liệu thành công'
): Response => {
  const responseBody: ApiResponse<T[]> = {
    success: true,
    message,
    data,
    pagination
  };
  return res.status(200).json(responseBody);
};

export const sendError = (
  res: Response,
  message = 'Đã có lỗi xảy ra',
  statusCode = 500,
  errorCode = 'INTERNAL_ERROR',
  details?: any
): Response => {
  const responseBody: ApiResponse = {
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
