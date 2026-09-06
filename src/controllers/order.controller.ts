import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { CustomerService } from '../services/customer.service.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';
import { OrderStatus, PaymentMethod } from '../types/enums.js';

async function restoreOrderStock(items: any[]): Promise<void> {
  if (!Array.isArray(items)) return;
  for (const item of items) {
    try {
      const prodId = String(item.id || item._id);
      const qty = Number(item.quantity) || 1;
      const color = String(item.color || '').trim();
      const size = String(item.size || '').trim();

      if (mongoose.Types.ObjectId.isValid(prodId)) {
        await Product.findOneAndUpdate(
          {
            _id: prodId,
            variants: {
              $elemMatch: {
                color: color,
                sizes: { $elemMatch: { $or: [{ size: size }, { name: size }] } }
              }
            }
          },
          {
            $inc: {
              "variants.$[v].sizes.$[s].stock": qty,
              sold: -qty
            }
          },
          {
            arrayFilters: [
              { "v.color": color },
              { $or: [{ "s.size": size }, { "s.name": size }] }
            ]
          }
        );
      }
    } catch (err) {
      console.warn('⚠️ Lỗi hoàn kho đơn hàng:', err);
    }
  }
}

export class OrderController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, search, page, limit, sort, order } = req.query;

      const filter: any = {};
      if (status && status !== 'all') {
        filter.status = String(status);
      }

      if (search) {
        const s = String(search).trim();
        filter.$or = [
          { orderCode: { $regex: s, $options: 'i' } },
          { 'customer.name': { $regex: s, $options: 'i' } },
          { 'customer.phone': { $regex: s, $options: 'i' } }
        ];
      }

      const sortOrder = order === 'asc' ? 1 : -1;
      const sortField = sort ? String(sort) : 'createdAt';
      const sortObj: any = { [sortField]: sortOrder };

      if (page && limit) {
        const pageNum = Math.max(1, parseInt(String(page), 10));
        const limitNum = Math.max(1, parseInt(String(limit), 10));
        const skip = (pageNum - 1) * limitNum;

        const [orders, total] = await Promise.all([
          Order.find(filter).sort(sortObj).skip(skip).limit(limitNum),
          Order.countDocuments(filter)
        ]);

        sendPaginated(
          res,
          orders,
          {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
          },
          'Lấy danh sách đơn hàng thành công'
        );
        return;
      }

      const orders = await Order.find(filter).sort(sortObj);
      sendSuccess(res, orders, 'Lấy danh sách đơn hàng thành công');
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const order = await Order.findById(id);
      if (!order) {
        sendError(res, 'Không tìm thấy đơn hàng', 404, 'ORDER_NOT_FOUND');
        return;
      }
      sendSuccess(res, order, 'Lấy chi tiết đơn hàng thành công');
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orderData = req.body;

      if (!orderData.customer || !orderData.customer.name || !orderData.customer.phone || !orderData.customer.address) {
        sendError(res, 'Vui lòng cung cấp đầy đủ thông tin người nhận (Tên, SĐT, Địa chỉ)', 400, 'BAD_REQUEST');
        return;
      }

      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        sendError(res, 'Giỏ hàng không có sản phẩm nào', 400, 'EMPTY_CART');
        return;
      }

      // 1. Trừ kho nguyên tử (Atomic Operations) chống Race Condition khi đặt cùng lúc
      const decrementedItems: Array<{ prodId: string; color: string; size: string; quantity: number }> = [];

      for (const item of orderData.items) {
        const prodId = String(item.id || item._id);
        const qty = Number(item.quantity) || 1;
        const color = String(item.color || '').trim();
        const size = String(item.size || '').trim();

        if (mongoose.Types.ObjectId.isValid(prodId)) {
          // Điều kiện tiên quyết: tồn kho hiện tại PHẢI >= qty
          const updatedProduct = await Product.findOneAndUpdate(
            {
              _id: prodId,
              variants: {
                $elemMatch: {
                  color: color,
                  sizes: {
                    $elemMatch: {
                      $or: [{ size: size }, { name: size }],
                      stock: { $gte: qty }
                    }
                  }
                }
              }
            },
            {
              $inc: {
                "variants.$[v].sizes.$[s].stock": -qty,
                sold: qty
              }
            },
            {
              arrayFilters: [
                { "v.color": color },
                { $or: [{ "s.size": size }, { "s.name": size }] }
              ],
              new: true
            }
          );

          if (!updatedProduct) {
            // Tồn kho không đủ hoặc vừa có khách khác mua trước trong tích tắc!
            // Rollback lại các món đã trừ trước đó trong đơn này
            await restoreOrderStock(decrementedItems);

            let currentRemaining = 0;
            try {
              const currentProd = await Product.findById(prodId);
              const curVar = currentProd?.variants?.find((v: any) => v.color === color);
              const curSz = curVar?.sizes?.find((s: any) => (s.size || s.name) === size);
              currentRemaining = curSz ? (curSz.stock || 0) : 0;
            } catch {}

            sendError(
              res,
              `Sản phẩm "${item.name}" (${color} - Size ${size}) vừa có khách đặt trước! Hiện trong kho chỉ còn ${currentRemaining} cái (bạn đang đặt ${qty} cái). Vui lòng cập nhật lại giỏ hàng.`,
              400,
              'CONCURRENT_STOCK_EXCEEDED'
            );
            return;
          }

          decrementedItems.push({ prodId, color, size, quantity: qty });
        }
      }

      // Chuẩn hóa toàn bộ danh sách mặt hàng để khớp schema OrderItem
      orderData.items = orderData.items.map((item: any) => {
        const pId = item.productId || item.id || item._id || 'prod_' + Date.now();
        const pName = item.productName || item.name || 'Sản phẩm';
        const pPrice = Number(item.price) || 0;
        const pQty = Number(item.quantity) || 1;
        const pSubtotal = (item.subtotal !== undefined && !isNaN(Number(item.subtotal)))
          ? Number(item.subtotal)
          : pPrice * pQty;
        const pVariant = item.variant || [item.color, item.size].filter(Boolean).join(' - ') || 'Tiêu chuẩn';
        const pImg = item.img || item.image || '';

        return {
          productId: pId,
          id: pId,
          productName: pName,
          name: pName,
          variant: pVariant,
          color: item.color || '',
          size: item.size || '',
          img: pImg,
          price: pPrice,
          quantity: pQty,
          subtotal: pSubtotal
        };
      });

      // Tự sinh mã đơn hàng nếu chưa có
      if (!orderData.orderCode) {
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        orderData.orderCode = `ML-${today}-${randomNum}`;
      }

      // Tính tổng nếu chưa tính
      if (orderData.subtotal === undefined) {
        orderData.subtotal = orderData.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      }
      if (orderData.discount === undefined) orderData.discount = 0;
      if (orderData.shippingFee === undefined) orderData.shippingFee = 0; // Mặc định miễn phí vận chuyển theo checkout
      if (orderData.total === undefined) {
        orderData.total = Math.max(0, orderData.subtotal - orderData.discount + orderData.shippingFee);
      }

      if (!orderData.status) {
        orderData.status = OrderStatus.Pending;
      }

      const newOrder = new Order(orderData);
      const savedOrder = await newOrder.save();

      // Nếu đơn là POS hoàn thành ngay, cập nhật khách hàng
      if (savedOrder.status === OrderStatus.Completed && savedOrder.customer.phone) {
        await CustomerService.syncCustomerStatsByPhone(
          savedOrder.customer.phone,
          savedOrder.customer.name,
          savedOrder.customer.address
        );
      }

      sendSuccess(res, savedOrder, 'Đặt đơn hàng thành công', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, cancelReason } = req.body;

      if (!Object.values(OrderStatus).includes(status)) {
        sendError(res, 'Trạng thái đơn hàng không hợp lệ', 400, 'INVALID_STATUS');
        return;
      }

      const oldOrder = await Order.findById(id);
      if (!oldOrder) {
        sendError(res, 'Không tìm thấy đơn hàng để cập nhật', 404, 'ORDER_NOT_FOUND');
        return;
      }

      const updateData: any = { status };
      if (cancelReason) updateData.cancelReason = cancelReason;
      if (req.user) updateData.processedBy = req.user.id;

      const updatedOrder = await Order.findByIdAndUpdate(id, updateData, { new: true });
      if (!updatedOrder) {
        sendError(res, 'Không tìm thấy đơn hàng để cập nhật', 404, 'ORDER_NOT_FOUND');
        return;
      }

      // Nếu hủy đơn -> Tự động hoàn lại tồn kho cho các sản phẩm
      if (status === OrderStatus.Cancelled && oldOrder.status !== OrderStatus.Cancelled) {
        await restoreOrderStock(oldOrder.items);
      }

      // Khi đơn hoàn thành hoặc thay đổi trạng thái, đồng bộ điểm chi tiêu khách hàng
      if (updatedOrder.customer?.phone) {
        await CustomerService.syncCustomerStatsByPhone(
          updatedOrder.customer.phone,
          updatedOrder.customer.name,
          updatedOrder.customer.address
        );
      }

      sendSuccess(res, updatedOrder, 'Cập nhật trạng thái đơn hàng thành công');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const deletedOrder = await Order.findByIdAndDelete(id);
      if (!deletedOrder) {
        sendError(res, 'Không tìm thấy đơn hàng để xóa', 404, 'ORDER_NOT_FOUND');
        return;
      }

      // Nếu đơn chưa hủy mà bị xóa -> hoàn trả tồn kho
      if (deletedOrder.status !== OrderStatus.Cancelled && deletedOrder.items) {
        await restoreOrderStock(deletedOrder.items);
      }

      // Đồng bộ lại chi tiêu của khách hàng sau khi xóa đơn
      if (deletedOrder.customer?.phone) {
        await CustomerService.syncCustomerStatsByPhone(deletedOrder.customer.phone);
      }

      sendSuccess(res, null, 'Đã xóa đơn hàng thành công');
    } catch (error) {
      next(error);
    }
  }
}
