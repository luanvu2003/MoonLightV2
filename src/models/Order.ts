import mongoose, { Schema } from 'mongoose';
import { IOrder, IOrderItem, IOrderCustomer } from '../types/models.types.js';
import { OrderStatus, PaymentMethod } from '../types/enums.js';

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.Mixed, required: true },
    productName: { type: String, required: true },
    variant: { type: String, default: '' },
    img: { type: String, default: '' },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true }
  },
  { _id: false }
);

const OrderCustomerSchema = new Schema<IOrderCustomer>(
  {
    name: { type: String, required: [true, 'Tên người nhận không được để trống'] },
    phone: { type: String, required: [true, 'Số điện thoại không được để trống'] },
    address: { type: String, required: [true, 'Địa chỉ giao hàng không được để trống'] },
    note: { type: String, default: '' }
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderCode: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    customer: {
      type: OrderCustomerSchema,
      required: true
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: [(val: IOrderItem[]) => val.length > 0, 'Đơn hàng phải có ít nhất 1 sản phẩm']
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      default: PaymentMethod.COD
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Pending,
      index: true
    },
    processedBy: {
      type: Schema.Types.Mixed,
      default: null
    },
    cancelReason: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
