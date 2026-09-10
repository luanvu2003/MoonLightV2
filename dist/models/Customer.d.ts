import mongoose from 'mongoose';
import { ICustomer } from '../types/models.types.js';
export declare const Customer: mongoose.Model<ICustomer, {}, {}, {}, mongoose.Document<unknown, {}, ICustomer, {}, mongoose.DefaultSchemaOptions> & ICustomer & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, ICustomer>;
