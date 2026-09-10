import mongoose from 'mongoose';
import { ISchedule } from '../types/models.types.js';
export declare const Schedule: mongoose.Model<ISchedule, {}, {}, {}, mongoose.Document<unknown, {}, ISchedule, {}, mongoose.DefaultSchemaOptions> & ISchedule & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, ISchedule>;
