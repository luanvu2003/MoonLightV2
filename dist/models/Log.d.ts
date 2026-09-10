import mongoose from 'mongoose';
import { ILog } from '../types/models.types.js';
export declare const Log: mongoose.Model<ILog, {}, {}, {}, mongoose.Document<unknown, {}, ILog, {}, mongoose.DefaultSchemaOptions> & ILog & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, ILog>;
