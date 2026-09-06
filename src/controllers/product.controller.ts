import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';

import { LUXURY_PRODUCTS } from '../config/defaultProducts.js';

// Danh sách sản phẩm dự phòng chuẩn Luxury (18 sản phẩm)
const DEFAULT_PRODUCTS = LUXURY_PRODUCTS;

function normalizeProductVariants(variants: any[]) {
  if (!Array.isArray(variants)) return variants;
  return variants.map((v) => {
    if (v && Array.isArray(v.sizes)) {
      v.sizes = v.sizes.map((s: any) => {
        const val = typeof s === 'string' ? s : (s.size || s.name || 'FREE');
        const stock = (typeof s === 'object' && s !== null) ? (Number(s.stock) || 0) : 0;
        return {
          size: val,
          name: val,
          stock: stock
        };
      });
    }
    return v;
  });
}

function sanitizeProductData(p: any) {
  if (!p) return p;
  const obj = p.toObject ? p.toObject() : p;
  if (Array.isArray(obj.variants)) {
    obj.variants.forEach((v: any) => {
      if (Array.isArray(v.sizes)) {
        v.sizes = v.sizes.map((s: any) => {
          const val = typeof s === 'string' ? s : (s.size || s.name || 'FREE');
          const stock = (typeof s === 'object' && s !== null) ? (Number(s.stock) || 0) : 0;
          return {
            size: val,
            name: val,
            stock: stock
          };
        });
      }
    });
  }
  return obj;
}

export class ProductController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, search, category, gender, type, sort, order, minPrice, maxPrice, size, style } = req.query;

      const filter: any = {};
      if (search) {
        filter.name = { $regex: String(search).trim(), $options: 'i' };
      }
      if (category && category !== 'all') {
        filter.category = String(category);
      } else if (type && type !== 'all') {
        filter.$or = [{ category: String(type) }, { type: String(type) }];
      }
      if (gender && gender !== 'all') {
        const gStr = String(gender).trim().toLowerCase();
        if (gStr === 'nu' || gStr === 'nữ') {
          filter.gender = { $in: ['Nu', 'Nữ'] };
        } else if (gStr === 'nam') {
          filter.gender = 'Nam';
        } else if (gStr === 'unisex') {
          filter.gender = 'Unisex';
        } else {
          filter.gender = String(gender);
        }
      }
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
      }
      if (size) {
        const sizeList = Array.isArray(size) ? size : String(size).split(',').map(s => s.trim());
        filter['variants.sizes'] = {
          $elemMatch: {
            size: { $in: sizeList },
            stock: { $gt: 0 }
          }
        };
      }
      if (style) {
        const styleRegex = { $regex: String(style).trim(), $options: 'i' };
        filter.$or = [
          { description: styleRegex },
          { name: styleRegex },
          { type: styleRegex }
        ];
      }

      const sortField = sort ? String(sort) : 'createdAt';
      const sortOrder = order === 'asc' ? 1 : -1;
      const sortObj: any = { [sortField]: sortOrder };

      try {
        if (mongoose.connection.readyState === 1) {
          const totalInDb = await Product.countDocuments();
          if (totalInDb > 0) {
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
                products.map(sanitizeProductData),
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
            sendSuccess(res, products.map(sanitizeProductData), 'Lấy danh sách sản phẩm thành công');
            return;
          }
        }
      } catch (dbErr: any) {
        console.warn('⚠️ Lỗi truy vấn Product từ MongoDB:', dbErr.message);
      }

      // Fallback nếu DB trống hoặc lỗi kết nối
      let fallbackList = [...DEFAULT_PRODUCTS];
      if (category && category !== 'all') {
        fallbackList = fallbackList.filter((p) => p.category === category);
      } else if (type && type !== 'all') {
        fallbackList = fallbackList.filter((p) => p.type === type || p.category === type);
      }
      if (gender && gender !== 'all') {
        const gStr = String(gender).trim().toLowerCase();
        fallbackList = fallbackList.filter((p) => {
          const pgStr = String(p.gender).trim().toLowerCase();
          if (gStr === 'nu' || gStr === 'nữ') {
            return pgStr === 'nu' || pgStr === 'nữ' || pgStr === 'unisex';
          }
          if (gStr === 'nam') {
            return pgStr === 'nam' || pgStr === 'unisex';
          }
          return pgStr === gStr || pgStr === 'unisex';
        });
      }
      if (minPrice) {
        fallbackList = fallbackList.filter((p) => p.price >= Number(minPrice));
      }
      if (maxPrice) {
        fallbackList = fallbackList.filter((p) => p.price <= Number(maxPrice));
      }
      if (size) {
        const sizeList = Array.isArray(size) ? size : String(size).split(',').map(s => s.trim());
        fallbackList = fallbackList.filter((p) =>
          p.variants?.some((v) => v.sizes?.some((s) => sizeList.includes(s.size) && s.stock > 0))
        );
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
          sendSuccess(res, sanitizeProductData(product), 'Lấy chi tiết sản phẩm thành công');
          return;
        }
      } catch {
        // Fallback
      }

      const fallback = DEFAULT_PRODUCTS.find((p) => String(p._id) === String(id) || String(p.id) === String(id));
      if (fallback) {
        sendSuccess(res, sanitizeProductData(fallback), 'Lấy chi tiết sản phẩm thành công');
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

      if (productData.variants) {
        productData.variants = normalizeProductVariants(productData.variants);
      }

      const newProduct = new Product(productData);
      const savedProduct = await newProduct.save();

      sendSuccess(res, sanitizeProductData(savedProduct), 'Thêm sản phẩm mới thành công', 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      let updatedProduct: any = null;

      if (req.body && req.body.variants) {
        req.body.variants = normalizeProductVariants(req.body.variants);
      }

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

      sendSuccess(res, sanitizeProductData(updatedProduct), 'Cập nhật sản phẩm thành công');
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
