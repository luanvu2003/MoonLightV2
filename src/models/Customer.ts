import mongoose, { Schema } from 'mongoose';
import { ICustomer } from '../types/models.types.js';
import { CustomerTier } from '../types/enums.js';

const CustomerSchema = new Schema<ICustomer>(
  {
    name: {
      type: String,
      required: [true, 'Tên khách hàng không được để trống'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Số điện thoại khách hàng không được để trống'],
      unique: true,
      trim: true,
      index: true
    },
    email: {
      type: String,
      trim: true,
      default: ''
    },
    address: {
      type: String,
      default: ''
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
      index: true
    },
    orderCount: {
      type: Number,
      default: 0,
      min: 0
    },
    tier: {
      type: String,
      enum: Object.values(CustomerTier),
      default: CustomerTier.New,
      index: true
    },
    lastOrderDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Tự động tính hạng khách hàng trước khi lưu
CustomerSchema.pre('save', function () {
  if (this.totalSpent >= 10000000) {
    this.tier = CustomerTier.VIP;
  } else if (this.totalSpent >= 5000000) {
    this.tier = CustomerTier.Loyal;
  } else {
    this.tier = CustomerTier.New;
  }
});

export const Customer = mongoose.model<ICustomer>('Customer', CustomerSchema);
