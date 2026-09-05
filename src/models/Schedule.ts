import mongoose, { Schema } from 'mongoose';
import { ISchedule } from '../types/models.types.js';
import { ShiftType, ShiftStatus } from '../types/enums.js';

const ScheduleSchema = new Schema<ISchedule>(
  {
    staffId: {
      type: Schema.Types.Mixed,
      required: true,
      index: true
    },
    staffName: {
      type: String,
      required: true
    },
    date: {
      type: String,
      required: true,
      index: true
    },
    shiftType: {
      type: String,
      enum: Object.values(ShiftType),
      required: true
    },
    shiftName: {
      type: String,
      default: 'Ca Làm'
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: 'Nhân viên bán hàng'
    },
    status: {
      type: String,
      enum: Object.values(ShiftStatus),
      default: ShiftStatus.Scheduled
    },
    note: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export const Schedule = mongoose.model<ISchedule>('Schedule', ScheduleSchema);
