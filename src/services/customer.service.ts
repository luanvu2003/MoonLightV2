import { Customer } from '../models/Customer.js';
import { Order } from '../models/Order.js';
import { OrderStatus, CustomerTier } from '../types/enums.js';

export class CustomerService {
  /**
   * Tính toán lại tổng chi tiêu và phân hạng khách hàng dựa trên lịch sử đơn hàng hoàn thành
   */
  static async syncCustomerStatsByPhone(phone: string, customerName?: string, address?: string): Promise<void> {
    if (!phone) return;

    // Tìm tất cả đơn hàng đã hoàn thành của SĐT này
    const completedOrders = await Order.find({
      'customer.phone': phone,
      status: OrderStatus.Completed
    });

    const totalSpent = completedOrders.reduce((sum, ord) => sum + (ord.total || 0), 0);
    const orderCount = completedOrders.length;
    const lastOrder = completedOrders.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })[0];

    let tier = CustomerTier.New;
    if (totalSpent >= 10000000) {
      tier = CustomerTier.VIP;
    } else if (totalSpent >= 5000000) {
      tier = CustomerTier.Loyal;
    }

    let customer = await Customer.findOne({ phone });
    if (!customer) {
      customer = new Customer({
        name: customerName || 'Khách hàng',
        phone,
        address: address || '',
        totalSpent,
        orderCount,
        tier,
        lastOrderDate: lastOrder?.createdAt || new Date()
      });
    } else {
      customer.totalSpent = totalSpent;
      customer.orderCount = orderCount;
      customer.tier = tier;
      if (lastOrder?.createdAt) {
        customer.lastOrderDate = lastOrder.createdAt;
      }
      if (customerName && !customer.name) {
        customer.name = customerName;
      }
      if (address && !customer.address) {
        customer.address = address;
      }
    }

    await customer.save();
  }
}
