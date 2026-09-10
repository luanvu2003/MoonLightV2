import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITicketReply {
  message: string;
  repliedBy: string;
  repliedAt: Date;
}

export interface ITicket extends Document {
  ticketCode: string;
  userId: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  category: 'order' | 'return' | 'size' | 'payment' | 'other';
  orderCode?: string;
  subject: string;
  message: string;
  priority: 'normal' | 'urgent';
  status: 'pending' | 'processing' | 'replied' | 'resolved' | 'closed';
  reply?: ITicketReply;
  createdAt: Date;
  updatedAt: Date;
}

const TicketReplySchema = new Schema<ITicketReply>(
  {
    message: { type: String, required: true, trim: true },
    repliedBy: { type: String, default: 'Chuyên viên MoonLight' },
    repliedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const TicketSchema = new Schema<ITicket>(
  {
    ticketCode: {
      type: String,
      unique: true,
      required: true,
      index: true,
      default: () => `TK-${Math.floor(100000 + Math.random() * 900000)}`
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    customerPhone: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      enum: ['order', 'return', 'size', 'payment', 'other'],
      default: 'order'
    },
    orderCode: {
      type: String,
      trim: true,
      default: ''
    },
    subject: {
      type: String,
      required: [true, 'Tiêu đề yêu cầu không được để trống'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Nội dung chi tiết yêu cầu không được để trống'],
      trim: true
    },
    priority: {
      type: String,
      enum: ['normal', 'urgent'],
      default: 'normal'
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'replied', 'resolved', 'closed'],
      default: 'pending',
      index: true
    },
    reply: {
      type: TicketReplySchema,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const Ticket: Model<ITicket> = mongoose.model<ITicket>('Ticket', TicketSchema);
