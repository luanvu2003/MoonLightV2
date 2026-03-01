const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/db');
const Product = require('./src/models/Product'); // Gọi model vào để dùng

// 1. Cấu hình
dotenv.config(); // Đọc file .env
const app = express();
const PORT = process.env.PORT || 3000;

// 2. Kết nối Database
connectDB();

// 3. Middleware (Bộ lọc)
app.use(cors());
app.use(express.json()); // Để đọc được dữ liệu JSON gửi lên
app.use(express.static(path.join(__dirname, 'public'))); // Cho phép truy cập thư mục public

// 4. API Routes (Đường dẫn lấy dữ liệu)

// API: Lấy danh sách tất cả sản phẩm
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find(); // Lệnh lấy toàn bộ từ MongoDB
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
});

// API: Lấy sản phẩm theo loại (Ví dụ: /api/products/ao-thun)
app.get('/api/products/:type', async (req, res) => {
    try {
        const type = req.params.type;
        const products = await Product.find({ type: type });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
});

// 5. Route cho Frontend (Trang chủ)
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 6. Khởi động Server
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});