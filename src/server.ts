import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';

// Import Routes
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import customerRoutes from './routes/customer.routes.js';
import reviewRoutes from './routes/review.routes.js';
import userRoutes from './routes/user.routes.js';
import scheduleRoutes from './routes/schedule.routes.js';
import reportRoutes from './routes/report.routes.js';
import systemRoutes from './routes/system.routes.js';
import aiRoutes from './routes/ai.routes.js';

import { Product } from './models/Product.js';
import { LUXURY_PRODUCTS } from './config/defaultProducts.js';

// Middlewares
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '../public');

const app = express();

// 1. Kết nối Database & Tự động đồng bộ sản phẩm mẫu chuẩn Luxury
connectDB().then(async () => {
  try {
    for (const p of LUXURY_PRODUCTS) {
      await Product.findOneAndUpdate(
        { name: p.name },
        { $set: { image: p.image, variants: p.variants } },
        { upsert: true, new: true }
      );
    }
    const updatedCount = await Product.countDocuments();
    console.log(`✅ Đã đồng bộ thành công ${updatedCount} sản phẩm vào MongoDB.`);
  } catch (err: any) {
    console.warn(`⚠️ Cảnh báo tự động seed sản phẩm: ${err.message}`);
  }
});

// 2. Middlewares bảo mật & phân tích dữ liệu
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// 3. Phục vụ tài nguyên tĩnh Frontend
app.use(express.static(publicDir));

// 4. API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/schedules', scheduleRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/system', systemRoutes);
app.use('/api/v1/ai', aiRoutes);

// 5. Tương thích ngược: Mount /api/products trỏ tới productRoutes
app.use('/api/products', productRoutes);

// 6. Định tuyến trang chuyên biệt Frontend
app.get('/try-on', (_req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'try-on.html'));
});

app.get('/admin', (_req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'admin.html'));
});

app.get('/staff', (_req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'staff.html'));
});

app.get('/login', (_req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'login.html'));
});

app.get('/checkout', (_req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'checkout.html'));
});

app.get('/product', (_req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'product.html'));
});

// Trang chủ và client-side routing
app.get('/', (_req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// 7. Xử lý lỗi tập trung
app.use(notFoundHandler);
app.use(errorHandler);

// 8. Khởi chạy máy chủ
const PORT = ENV.PORT;
app.listen(PORT, () => {
  console.log(`🌙 MoonLight V2 Server đang chạy tại http://localhost:${PORT}`);
  console.log(`✨ Chế độ: TypeScript ESM · Node.js ${process.version}`);
  console.log(`📡 API Base: http://localhost:${PORT}/api/v1`);
});

export default app;
