import dotenv from 'dotenv';
dotenv.config();
export const ENV = {
    PORT: parseInt(process.env.PORT || '10000', 10),
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/Moonlight',
    JWT_SECRET: process.env.JWT_SECRET || 'MOONLIGHT_JWT_SECRET_KEY_2026',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'MOONLIGHT_REFRESH_SECRET_KEY_2026',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    EMAIL_USER: process.env.EMAIL_USER || '',
    EMAIL_PASS: process.env.EMAIL_PASS || '',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
    NODE_ENV: process.env.NODE_ENV || 'development'
};
//# sourceMappingURL=env.js.map