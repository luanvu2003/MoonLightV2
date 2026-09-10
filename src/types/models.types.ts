import { Role, OrderStatus, PaymentMethod, CustomerTier, ShiftType, ShiftStatus, GenderCategory } from './enums.js';

export interface IUser {
  _id?: any;
  name: string;
  username: string;
  email?: string;
  phone?: string;
  address?: string;
  province?: string;
  district?: string;
  ward?: string;
  street?: string;
  isEmailVerified?: boolean;
  googleId?: string;
  password?: string;
  role: Role;
  avatar?: string;
  cart?: any[];
  wishlist?: string[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IVariantSize {
  size: string;
  name?: string;
  stock: number;
}

export interface IVariant {
  color: string;
  colorCode: string;
  img: string;
  images?: string[];
  price: number;
  sizes: IVariantSize[];
}

export interface IProduct {
  _id?: any;
  name: string;
  description?: string;
  category: string;
  gender: GenderCategory | string;
  price?: number; // legacy fallback
  image?: string; // legacy fallback
  images?: string[];
  type?: string;  // legacy fallback
  variants: IVariant[];
  rating: number;
  sold: number;
  salePercent?: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrderItem {
  productId: any;
  productName: string;
  variant: string;
  img: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface IOrderCustomer {
  name: string;
  phone: string;
  address: string;
  note?: string;
}

export interface IOrder {
  _id?: any;
  orderCode: string;
  customer: IOrderCustomer;
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  isPaid?: boolean;
  customerTransferConfirmed?: boolean;
  processedBy?: any;
  cancelReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICustomer {
  _id?: any;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalSpent: number;
  orderCount: number;
  tier: CustomerTier;
  lastOrderDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IReview {
  _id?: any;
  productId: any;
  productName: string;
  name: string;
  rating: number;
  content: string;
  status: 'approved';
  shopReply?: string;
  shopReplyBy?: string;
  shopReplyRole?: string;
  shopReplyDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISchedule {
  _id?: any;
  staffId: any;
  staffName: string;
  date: string;
  shiftType: ShiftType;
  shiftName: string;
  startTime: string;
  endTime: string;
  role: string;
  status: ShiftStatus;
  note?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILog {
  _id?: any;
  time: string;
  user: string;
  action: string;
  details: string;
  createdAt?: Date;
}
