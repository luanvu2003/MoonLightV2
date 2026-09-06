import mongoose, { Schema } from 'mongoose';
import { IProduct, IVariant, IVariantSize } from '../types/models.types.js';
import { GenderCategory } from '../types/enums.js';

const VariantSizeSchema = new Schema<IVariantSize>(
  {
    size: { type: String, required: true },
    name: { type: String },
    stock: { type: Number, required: true, default: 0 }
  },
  {
    _id: false,
    toJSON: {
      transform: function (_doc: any, ret: any) {
        ret.name = ret.name || ret.size;
        ret.size = ret.size || ret.name;
        return ret;
      }
    },
    toObject: {
      transform: function (_doc: any, ret: any) {
        ret.name = ret.name || ret.size;
        ret.size = ret.size || ret.name;
        return ret;
      }
    }
  }
);

VariantSizeSchema.pre('validate', function () {
  const self = this as any;
  if (!self.size && self.name) {
    self.size = self.name;
  }
  if (!self.name && self.size) {
    self.name = self.size;
  }
});

const VariantSchema = new Schema<IVariant>(
  {
    color: { type: String, required: true },
    colorCode: { type: String, default: '#000000' },
    img: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    sizes: [VariantSizeSchema]
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Tên sản phẩm không được để trống'],
      trim: true,
      index: true
    },
    description: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      default: 'ao-thun',
      index: true
    },
    gender: {
      type: String,
      enum: Object.values(GenderCategory),
      default: GenderCategory.Nam
    },
    price: {
      type: Number,
      default: 0
    },
    image: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'ao-thun'
    },
    variants: {
      type: [VariantSchema],
      default: []
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5
    },
    sold: {
      type: Number,
      default: 0
    },
    salePercent: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook: tự động gán giá và ảnh đại diện nếu có variants
ProductSchema.pre('save', function () {
  if (this.variants && this.variants.length > 0) {
    if (!this.price && this.variants[0].price) {
      this.price = this.variants[0].price;
    }
    if (!this.image && this.variants[0].img) {
      this.image = this.variants[0].img;
    }
  }
  if (!this.category && this.type) {
    this.category = this.type;
  }
  if (!this.type && this.category) {
    this.type = this.category;
  }
});

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
