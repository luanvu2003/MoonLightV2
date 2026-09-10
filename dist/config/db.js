import mongoose from 'mongoose';
import { ENV } from './env.js';
export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(ENV.MONGO_URI);
        console.log(`✅ MongoDB đã kết nối thành công: ${conn.connection.host}`);
    }
    catch (error) {
        console.error(`❌ Kết nối MongoDB thất bại: ${error.message}`);
        console.log(`⚠️ Hệ thống chuyển sang chế độ dự phòng bộ nhớ dữ liệu.`);
    }
};
mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB đã ngắt kết nối');
});
mongoose.connection.on('error', (err) => {
    console.error('❌ Lỗi kết nối MongoDB:', err);
});
//# sourceMappingURL=db.js.map