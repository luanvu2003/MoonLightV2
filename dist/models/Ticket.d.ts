import mongoose, { Document, Model } from 'mongoose';
export interface ITicketAttachment {
    type: 'image' | 'video' | 'file';
    url: string;
    name: string;
    size?: number;
}
export interface ITicketMessage {
    _id?: mongoose.Types.ObjectId;
    senderId?: mongoose.Types.ObjectId;
    senderRole: 'customer' | 'admin' | 'staff';
    senderName: string;
    message: string;
    attachments?: ITicketAttachment[];
    status?: 'sending' | 'sent' | 'delivered' | 'seen';
    seenAt?: Date;
    createdAt: Date;
}
export interface ITicketReply {
    message: string;
    repliedBy: string;
    repliedAt: Date;
}
export interface ITicketRating {
    score: number;
    comment?: string;
    createdAt: Date;
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
    messages: ITicketMessage[];
    customerLastSeenAt?: Date | null;
    adminLastSeenAt?: Date | null;
    priority: 'normal' | 'urgent';
    status: 'pending' | 'processing' | 'replied' | 'resolved' | 'closed';
    reply?: ITicketReply;
    rating?: ITicketRating;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Ticket: Model<ITicket>;
