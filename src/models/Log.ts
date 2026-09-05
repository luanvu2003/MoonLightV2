import mongoose, { Schema } from 'mongoose';
import { ILog } from '../types/models.types.js';

const LogSchema = new Schema<ILog>(
  {
    time: {
      type: String,
      required: true
    },
    user: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    details: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export const Log = mongoose.model<ILog>('Log', LogSchema);
