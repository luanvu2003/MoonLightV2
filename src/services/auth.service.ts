import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { ENV } from '../config/env.js';
import { AuthUserPayload } from '../types/api.types.js';

export class AuthService {
  static generateTokens(payload: AuthUserPayload) {
    const accessToken = jwt.sign(
      {
        id: payload.id,
        username: payload.username,
        role: payload.role,
        name: payload.name
      },
      ENV.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      {
        id: payload.id,
        username: payload.username
      },
      ENV.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  static verifyAccessToken(token: string): AuthUserPayload | null {
    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET) as AuthUserPayload;
      return decoded;
    } catch {
      return null;
    }
  }

  static verifyRefreshToken(token: string): { id: string; username: string } | null {
    try {
      const decoded = jwt.verify(token, ENV.JWT_REFRESH_SECRET) as { id: string; username: string };
      return decoded;
    } catch {
      return null;
    }
  }

  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
