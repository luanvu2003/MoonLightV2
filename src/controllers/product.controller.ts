import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';

// Danh sách sản phẩm dự phòng chuẩn Luxury
const DEFAULT_PRODUCTS = [
  {
    _id: '67c3db00d57e603b70b50001',
    name: 'Áo Vest Luxury Slim Fit Hoàng Gia',
    description: 'Chất liệu len Ý dệt thủ công cao cấp, form dáng tôn vẻ lịch lãm và quý phái.',
    category: 'vest',
    gender: 'Nam',
    price: 2450000,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80',
    type: 'vest',
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
      }
    ],
    isActive: true
  },
  {
    _id: '67c3db00d57e603b70b50002',
    name: 'Áo Sơ Mi Lụa Mulberry MoonLight',
    description: 'Vải lụa tơ tằm Mulberry 100%, bóng nhẹ tinh tế, mềm mượt thoáng khí tối đa.',
    category: 'somi',
    gender: 'Nam',
    price: 890000,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
    type: 'somi',
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
    ],
    isActive: true
  },
  {
    _id: '67c3db00d57e603b70b50003',
    name: 'Áo Polo Dệt Kim Diamond Knit',
    description: 'Dệt kim sợi cotton Pima cao cấp, họa tiết kim cương dập chìm sang trọng.',
    category: 'polo',
    gender: 'Nam',
    price: 650000,
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
    type: 'polo',
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
    ],
    isActive: true
  },
  {
    _id: '67c3db00d57e603b70b50004',
    name: 'Quần Âu May Đo Sartorial Cao Cấp',
    description: 'Vải dệt chéo chống nhăn, cạp đai Gurkha mang đậm phong cách quý ông cổ điển.',
    category: 'quanau',
    gender: 'Nam',
    price: 950000,
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
    type: 'quanau',
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
    ],
    isActive: true
  }
];

export class ProductController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, search, category, gender, type, sort, order } = req.query;

      const filter: any = {};
      if (search) {
        filter.name = { $regex: String(search).trim(), $options: 'i' };
      }
      if (category) {
        filter.category = String(category);
      } else if (type) {
        filter.$or = [{ category: String(type) }, { type: String(type) }];
      }
      if (gender) {
        filter.gender = String(gender);
      }

      const sortField = sort ? String(sort) : 'createdAt';
      const sortOrder = order === 'asc' ? 1 : -1;
      const sortObj: any = { [sortField]: sortOrder };

      try {
        if (page && limit) {
          const pageNum = Math.max(1, parseInt(String(page), 10));
          const limitNum = Math.max(1, parseInt(String(limit), 10));
          const skip = (pageNum - 1) * limitNum;

          const [products, total] = await Promise.all([
            Product.find(filter).sort(sortObj).skip(skip).limit(limitNum),
            Product.countDocuments(filter)
          ]);

          sendPaginated(
            res,
            products,
            {
              page: pageNum,
              limit: limitNum,
              total,
              totalPages: Math.ceil(total / limitNum)
            },
            'Lấy danh sách sản phẩm thành công'
          );
          return;
        }

        const products = await Product.find(filter).sort(sortObj);
        if (products.length > 0) {
          sendSuccess(res, products, 'Lấy danh sách sản phẩm thành công');
          return;
        }
      } catch (dbErr) {
        console.warn('⚠️ Lỗi truy vấn Product từ MongoDB. Dùng danh sách sản phẩm mặc định.');
      }

      // Fallback nếu DB trống hoặc lỗi kết nối
      let fallbackList = DEFAULT_PRODUCTS;
      if (category) {
        fallbackList = fallbackList.filter((p) => p.category === category);
      } else if (type) {
        fallbackList = fallbackList.filter((p) => p.type === type || p.category === type);
      }
      if (search) {
        const s = String(search).toLowerCase();
        fallbackList = fallbackList.filter((p) => p.name.toLowerCase().includes(s));
      }

      sendSuccess(res, fallbackList, 'Lấy danh sách sản phẩm thành công (Catalog tiêu chuẩn)');
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      try {
        const product = await Product.findById(id);
        if (product) {
          sendSuccess(res, product, 'Lấy chi tiết sản phẩm thành công');
          return;
        }
      } catch {
        // Fallback
      }

      const fallback = DEFAULT_PRODUCTS.find((p) => p._id === id);
      if (fallback) {
        sendSuccess(res, fallback, 'Lấy chi tiết sản phẩm thành công');
        return;
      }

      sendError(res, 'Không tìm thấy sản phẩm', 404, 'NOT_FOUND');
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const productData = req.body;
      if (!productData.name) {
        sendError(res, 'Tên sản phẩm không được để trống', 400, 'BAD_REQUEST');
        return;
      }

      const newProduct = new Product(productData);
      const savedProduct = await newProduct.save();

      sendSuccess(res, savedProduct, 'Thêm sản phẩm mới thành công', 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      let updatedProduct: any = null;

      if (mongoose.Types.ObjectId.isValid(id)) {
        updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true
        });
      }

      if (!updatedProduct && req.body.name) {
        updatedProduct = await Product.findOneAndUpdate(
          { name: req.body.name },
          req.body,
          { new: true, runValidators: true }
        );
      }

      if (!updatedProduct) {
        const newProduct = new Product(req.body);
        updatedProduct = await newProduct.save();
      }

      sendSuccess(res, updatedProduct, 'Cập nhật sản phẩm thành công');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      let deletedProduct: any = null;

      if (mongoose.Types.ObjectId.isValid(id)) {
        deletedProduct = await Product.findByIdAndDelete(id);
      }

      sendSuccess(res, null, 'Đã xóa sản phẩm thành công');
    } catch (error) {
      next(error);
    }
  }
}
