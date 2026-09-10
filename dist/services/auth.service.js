import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { ENV } from '../config/env.js';
export class AuthService {
    static generateTokens(payload) {
        const accessToken = jwt.sign({
            id: payload.id,
            username: payload.username,
            role: payload.role,
            name: payload.name
        }, ENV.JWT_SECRET, { expiresIn: '24h' });
        const refreshToken = jwt.sign({
            id: payload.id,
            username: payload.username
        }, ENV.JWT_REFRESH_SECRET, { expiresIn: '7d' });
        return { accessToken, refreshToken };
    }
    static verifyAccessToken(token) {
        try {
            const decoded = jwt.verify(token, ENV.JWT_SECRET);
            return decoded;
        }
        catch {
            return null;
        }
    }
    static verifyRefreshToken(token) {
        try {
            const decoded = jwt.verify(token, ENV.JWT_REFRESH_SECRET);
            return decoded;
        }
        catch {
            return null;
        }
    }
    static async hashPassword(password) {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }
    static async comparePassword(password, hash) {
        return bcrypt.compare(password, hash);
    }
}
//# sourceMappingURL=auth.service.js.map