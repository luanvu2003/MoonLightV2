import { AuthUserPayload } from '../types/api.types.js';
export declare class AuthService {
    static generateTokens(payload: AuthUserPayload): {
        accessToken: string;
        refreshToken: string;
    };
    static verifyAccessToken(token: string): AuthUserPayload | null;
    static verifyRefreshToken(token: string): {
        id: string;
        username: string;
    } | null;
    static hashPassword(password: string): Promise<string>;
    static comparePassword(password: string, hash: string): Promise<boolean>;
}
