import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcrypt';
import { IUser } from '../types/models.types.js';
import { Role } from '../types/enums.js';

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export type UserModel = Model<IUser, {}, IUserMethods>;

const UserSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: {
      type: String,
      required: [true, 'Tên người dùng không được để trống'],
      trim: true
    },
    username: {
      type: String,
      required: [true, 'Tên đăng nhập không được để trống'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    password: {
      type: String,
      required: function (this: any) {
        return !this.googleId;
      },
      minlength: [3, 'Mật khẩu tối thiểu 3 ký tự']
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.Customer,
      index: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    province: {
      type: String,
      trim: true,
      default: ''
    },
    district: {
      type: String,
      trim: true,
      default: ''
    },
    ward: {
      type: String,
      trim: true,
      default: ''
    },
    street: {
      type: String,
      trim: true,
      default: ''
    },
    addresses: [
      {
        recipientName: { type: String, trim: true, default: '' },
        phone: { type: String, trim: true, default: '' },
        province: { type: String, trim: true, default: '' },
        provinceCode: { type: String, trim: true, default: '' },
        district: { type: String, trim: true, default: '' },
        districtCode: { type: String, trim: true, default: '' },
        ward: { type: String, trim: true, default: '' },
        wardCode: { type: String, trim: true, default: '' },
        street: { type: String, trim: true, default: '' },
        fullAddress: { type: String, trim: true, default: '' },
        isDefault: { type: Boolean, default: false },
        label: { type: String, trim: true, default: 'Nhà riêng' },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    googleId: {
      type: String,
      sparse: true,
      index: true
    },
    cart: {
      type: Array,
      default: []
    },
    wishlist: {
      type: [String],
      default: []
    },
    avatar: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Hash password trước khi lưu
UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Phương thức so sánh mật khẩu
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser, UserModel>('User', UserSchema);
