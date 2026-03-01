const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String, // Link ảnh
        required: true
    },
    type: {
        type: String, // Ví dụ: 'ao-thun', 'quan-jean'
        required: true
    },
    description: {
        type: String
    }
    // Bạn có thể thêm các trường khác nếu DB cũ có
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);