import mongoose, { Document, Model } from 'mongoose';
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
export declare const Ticket: Model<ITicket>;
