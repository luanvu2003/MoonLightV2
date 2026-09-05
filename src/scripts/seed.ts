import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Review } from '../models/Review.js';
import { Schedule } from '../models/Schedule.js';
import { Role, GenderCategory, ShiftType, ShiftStatus } from '../types/enums.js';
import { LUXURY_PRODUCTS } from '../config/defaultProducts.js';

async function seed() {
  console.log('🌱 Bắt đầu quá trình seed dữ liệu cho MoonLight V2...');
  await connectDB();

  // 1. Seed Accounts (Admin, Owner, Staff)
  const accounts = [
    { username: 'admin', name: 'Quản Trị Viên (Vũ Phạm Luân)', password: '123', role: Role.Admin },
    { username: 'owner', name: 'Chủ Cửa Hàng (Owner)', password: '123', role: Role.Owner },
    { username: 'staff', name: 'Thu Ngân 01 (Staff)', password: '123', role: Role.Staff }
  ];

  for (const acc of accounts) {
    const existing = await User.findOne({ username: acc.username });
    if (!existing) {
      const user = new User({
        username: acc.username,
        name: acc.name,
        password: acc.password, // Hook pre-save sẽ tự động hash bằng bcrypt
        role: acc.role,
        isActive: true
      });
      await user.save();
      console.log(`✅ Đã tạo tài khoản: ${acc.username} (${acc.role})`);
    } else {
      console.log(`ℹ️ Tài khoản ${acc.username} đã tồn tại, bỏ qua`);
    }
  }

  // 2. Seed Sản phẩm nếu chưa có hoặc bổ sung danh mục đầy đủ
  console.log('📦 Đang đồng bộ danh mục 18 sản phẩm thời trang mẫu chuẩn Luxury...');
  for (const p of LUXURY_PRODUCTS) {
    await Product.findOneAndUpdate(
      { name: p.name },
      { $setOnInsert: p },
      { upsert: true, new: true }
    );
  }
  const productCount = await Product.countDocuments();
  console.log(`✅ Đã đồng bộ thành công ${productCount} sản phẩm trong database`);

  // 3. Seed Đánh giá mẫu nếu chưa có
  const reviewCount = await Review.countDocuments();
  if (reviewCount === 0) {
    const firstProduct = await Product.findOne();
    if (firstProduct) {
      await Review.create([
        {
          productId: firstProduct._id,
          productName: firstProduct.name,
          name: 'Trần Minh Quang',
          rating: 5,
          content: 'Chất vải vest cực kỳ ưng ý, đường kim mũi chỉ chuẩn may đo cao cấp. Rất hài lòng!',
          status: 'approved',
          shopReply: 'Cảm ơn quý khách đã tin chọn MoonLight Luxury. Chúc quý khách luôn thành công và lịch lãm!',
          shopReplyBy: 'Quản Trị Viên (Vũ Phạm Luân)',
          shopReplyRole: 'Admin',
          shopReplyDate: new Date()
        }
      ]);
      console.log('✅ Đã tạo đánh giá mẫu liêm khiết');
    }
  }

  console.log('🎉 Hoàn tất seed dữ liệu cho MoonLight V2!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Lỗi khi seed dữ liệu:', err);
  process.exit(1);
});
