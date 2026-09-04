const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Kết nối bằng chuỗi connection string trong file .env
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB đã kết nối: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Cảnh báo kết nối MongoDB thất bại: ${error.message}`);
        console.log(`⚠️ Hệ thống chuyển sang chế độ phục vụ Frontend và bộ nhớ dữ liệu Client.`);
    }
};

module.exports = connectDB;