import mongoose, { Document } from 'mongoose';
export interface IOtp extends Document {
    email: string;
    otp: string;
    createdAt: Date;
}
export declare const Otp: mongoose.Model<IOtp, {}, {}, {}, Document<unknown, {}, IOtp, {}, mongoose.DefaultSchemaOptions> & IOtp & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IOtp>;
