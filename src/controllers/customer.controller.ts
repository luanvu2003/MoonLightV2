import { Request, Response, NextFunction } from 'express';
import { Customer } from '../models/Customer.js';
import { Order } from '../models/Order.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';

export class CustomerController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, tier, page, limit, sort, order } = req.query;

      const filter: any = {};
      if (tier && tier !== 'all') {
        filter.tier = String(tier);
      }

      if (search) {
        const s = String(search).trim();
        filter.$or = [
          { name: { $regex: s, $options: 'i' } },
          { phone: { $regex: s, $options: 'i' } },
          { email: { $regex: s, $options: 'i' } }
        ];
      }

      const sortField = sort ? String(sort) : 'totalSpent';
      const sortOrder = order === 'asc' ? 1 : -1;
      const sortObj: any = { [sortField]: sortOrder };

      if (page && limit) {
        const pageNum = Math.max(1, parseInt(String(page), 10));
        const limitNum = Math.max(1, parseInt(String(limit), 10));
        const skip = (pageNum - 1) * limitNum;

        const [customers, total] = await Promise.all([
          Customer.find(filter).sort(sortObj).skip(skip).limit(limitNum),
          Customer.countDocuments(filter)
        ]);

        sendPaginated(
          res,
          customers,
          {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
          },
          'Lấy danh sách khách hàng thành công'
        );
        return;
      }

      const customers = await Customer.find(filter).sort(sortObj);
      sendSuccess(res, customers, 'Lấy danh sách khách hàng thành công');
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const customer = await Customer.findById(id);
      if (!customer) {
        sendError(res, 'Không tìm thấy khách hàng', 404, 'CUSTOMER_NOT_FOUND');
        return;
      }

      const orders = await Order.find({ 'customer.phone': customer.phone }).sort({ createdAt: -1 });

      sendSuccess(res, { customer, orders }, 'Lấy chi tiết khách hàng thành công');
    } catch (error) {
      next(error);
    }
  }

  static async exportCsv(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customers = await Customer.find().sort({ totalSpent: -1 });

      let csv = '\uFEFF'; // BOM UTF-8 for Excel
      csv += 'Họ và tên,Số điện thoại,Email,Địa chỉ,Tổng chi tiêu (VNĐ),Số đơn,Phân hạng,Lần mua cuối\n';

      customers.forEach((c) => {
        const name = `"${(c.name || '').replace(/"/g, '""')}"`;
        const phone = `"${(c.phone || '').replace(/"/g, '""')}"`;
        const email = `"${(c.email || '').replace(/"/g, '""')}"`;
        const address = `"${(c.address || '').replace(/"/g, '""')}"`;
        const spent = c.totalSpent || 0;
        const count = c.orderCount || 0;
        const tier = `"${c.tier}"`;
        const lastOrder = c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString('vi-VN') : '';

        csv += `${name},${phone},${email},${address},${spent},${count},${tier},${lastOrder}\n`;
      });

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=MoonLight_KhachHang_${new Date().toISOString().slice(0, 10)}.csv`);
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }
}
