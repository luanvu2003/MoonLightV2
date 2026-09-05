import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Review } from '../models/Review.js';
import { Schedule } from '../models/Schedule.js';
import { Role, GenderCategory, ShiftType, ShiftStatus } from '../types/enums.js';

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

  // 2. Seed Sản phẩm nếu chưa có sản phẩm nào
  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    console.log('📦 Đang khởi tạo danh sách sản phẩm thời trang mẫu...');
    const sampleProducts = [
      {
        name: 'Áo Vest Luxury Slim Fit Hoàng Gia',
        description: 'Chất liệu len Ý dệt thủ công cao cấp, form dáng tôn vẻ lịch lãm và quý phái.',
        category: 'vest',
        gender: GenderCategory.Nam,
        price: 2450000,
        image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80',
        rating: 5.0,
        sold: 48,
        variants: [
          {
            color: 'Đen Hoàng Gia',
            colorCode: '#000000',
            img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80',
            price: 2450000,
            sizes: [
              { size: 'M', stock: 15 },
              { size: 'L', stock: 20 },
              { size: 'XL', stock: 10 }
            ]
          },
          {
            color: 'Xanh Navy Đêm',
            colorCode: '#1a2a3a',
            img: 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=800&auto=format&fit=crop&q=80',
            price: 2450000,
            sizes: [
              { size: 'M', stock: 12 },
              { size: 'L', stock: 18 }
            ]
          }
        ]
      },
      {
        name: 'Áo Sơ Mi Lụa Mulberry MoonLight',
        description: 'Vải lụa tơ tằm Mulberry 100%, bóng nhẹ tinh tế, mềm mượt thoáng khí tối đa.',
        category: 'somi',
        gender: GenderCategory.Nam,
        price: 890000,
        image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
        rating: 4.9,
        sold: 125,
        variants: [
          {
            color: 'Trắng Ngọc Trai',
            colorCode: '#f8f8f8',
            img: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
            price: 890000,
            sizes: [
              { size: 'S', stock: 25 },
              { size: 'M', stock: 35 },
              { size: 'L', stock: 30 }
            ]
          }
        ]
      },
      {
        name: 'Áo Polo Dệt Kim Diamond Knit',
        description: 'Dệt kim sợi cotton Pima cao cấp, họa tiết kim cương dập chìm sang trọng.',
        category: 'polo',
        gender: GenderCategory.Nam,
        price: 650000,
        image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
        rating: 4.8,
        sold: 210,
        variants: [
          {
            color: 'Be Ánh Kim',
            colorCode: '#d2b48c',
            img: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
            price: 650000,
            sizes: [
              { size: 'M', stock: 40 },
              { size: 'L', stock: 50 }
            ]
          }
        ]
      },
      {
        name: 'Quần Âu May Đo Sartorial Cao Cấp',
        description: 'Vải dệt chéo chống nhăn, cạp đai Gurkha mang đậm phong cách quý ông cổ điển.',
        category: 'quanau',
        gender: GenderCategory.Nam,
        price: 950000,
        image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
        rating: 4.9,
        sold: 95,
        variants: [
          {
            color: 'Xám Tro',
            colorCode: '#708090',
            img: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
            price: 950000,
            sizes: [
              { size: '30', stock: 20 },
              { size: '31', stock: 25 },
              { size: '32', stock: 22 }
            ]
          }
        ]
      }
    ];

    await Product.insertMany(sampleProducts);
    console.log(`✅ Đã seed thành công ${sampleProducts.length} sản phẩm mẫu`);
  } else {
    console.log(`ℹ️ Database đã có ${productCount} sản phẩm, bỏ qua seed sản phẩm`);
  }

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
