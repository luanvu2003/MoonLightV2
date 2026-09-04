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

// API: Thêm sản phẩm mới vào MongoDB (nếu có kết nối)
app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        const saved = await newProduct.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(400).json({ message: "Lỗi lưu sản phẩm", error: error.message });
    }
});

// API: Cập nhật sản phẩm
app.put('/api/products/:id', async (req, res) => {
    try {
        const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: "Lỗi cập nhật sản phẩm", error: error.message });
    }
});

// API: Xóa sản phẩm
app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Đã xóa sản phẩm thành công" });
    } catch (error) {
        res.status(400).json({ message: "Lỗi xóa sản phẩm", error: error.message });
    }
});

// 5. Routes cho Frontend chuyên biệt
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});
app.get('/staff', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'staff.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'checkout.html'));
});

// Catch-all route cho Frontend (Trang chủ)
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 6. Khởi động Server
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});