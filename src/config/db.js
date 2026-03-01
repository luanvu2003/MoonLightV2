const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Kết nối bằng chuỗi connection string trong file .env
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB đã kết nối: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Lỗi kết nối MongoDB: ${error.message}`);
        process.exit(1); // Dừng chương trình nếu lỗi
    }
};

module.exports = connectDB;