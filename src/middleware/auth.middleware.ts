import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { sendError } from '../utils/response.js';
import { Role } from '../types/enums.js';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers['x-access-token']) {
    token = req.headers['x-access-token'] as string;
  }

  if (!token) {
    sendError(res, 'Yêu cầu đăng nhập để truy cập tài nguyên này', 401, 'UNAUTHORIZED');
    return;
  }

  const decoded = AuthService.verifyAccessToken(token);
  if (!decoded) {
    sendError(res, 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ', 401, 'INVALID_TOKEN');
    return;
  }

  req.user = decoded;
  next();
};

export const optionalAuthenticate = (req: Request, res: Response, next: NextFunction): void => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    const decoded = AuthService.verifyAccessToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }

  next();
};

export const requireRole = (...roles: (Role | string)[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Yêu cầu đăng nhập', 401, 'UNAUTHORIZED');
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(
        res,
        `Quyền truy cập bị từ chối. Vai trò của bạn (${req.user.role}) không có quyền thực hiện thao tác này.`,
        403,
        'FORBIDDEN'
      );
      return;
    }

    next();
  };
};
