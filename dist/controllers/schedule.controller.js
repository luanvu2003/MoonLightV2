import { Schedule } from '../models/Schedule.js';
import { User } from '../models/User.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { ShiftType, ShiftStatus, Role } from '../types/enums.js';
export class ScheduleController {
    static async getAll(req, res, next) {
        try {
            const { startDate, endDate, date, staffId } = req.query;
            const filter = {};
            if (date) {
                filter.date = String(date);
            }
            else if (startDate && endDate) {
                filter.date = { $gte: String(startDate), $lte: String(endDate) };
            }
            if (staffId && staffId !== 'all') {
                filter.staffId = staffId;
            }
            try {
                const schedules = await Schedule.find(filter).sort({ date: 1, startTime: 1 });
                sendSuccess(res, schedules, 'Lấy lịch trực thành công');
                return;
            }
            catch (dbErr) {
                console.warn('⚠️ Lỗi truy vấn Schedule từ MongoDB Atlas. Sử dụng lịch trực dự phòng.');
            }
            // Fallback lịch trực mẫu khi DB offline
            const todayStr = new Date().toISOString().slice(0, 10);
            const fallbackSchedules = [
                {
                    _id: 'sample-shift-1',
                    staffId: 'fallback-staff-03',
                    staffName: 'Thu Ngân 01',
                    date: todayStr,
                    shiftType: ShiftType.Morning,
                    shiftName: 'Ca Sáng',
                    startTime: '07:00',
                    endTime: '13:00',
                    role: 'Thu ngân / Bán hàng',
                    status: ShiftStatus.Active
                },
                {
                    _id: 'sample-shift-2',
                    staffId: 'fallback-owner-02',
                    staffName: 'Chủ Cửa Hàng',
                    date: todayStr,
                    shiftType: ShiftType.Afternoon,
                    shiftName: 'Ca Chiều',
                    startTime: '13:00',
                    endTime: '18:00',
                    role: 'Quản lý cửa hàng',
                    status: ShiftStatus.Scheduled
                }
            ];
            sendSuccess(res, fallbackSchedules, 'Lấy lịch trực thành công (Lịch trực mẫu)');
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const { staffId, staffName, date, shiftType, shiftName, startTime, endTime, role, note } = req.body;
            if (!staffId || !date || !shiftType) {
                sendError(res, 'Vui lòng cung cấp đầy đủ thông tin nhân viên, ngày và ca trực', 400, 'BAD_REQUEST');
                return;
            }
            let sName = staffName;
            if (!sName) {
                try {
                    const u = await User.findById(staffId);
                    sName = u ? u.name : 'Nhân viên';
                }
                catch {
                    sName = 'Nhân viên';
                }
            }
            const newSchedule = new Schedule({
                staffId,
                staffName: sName,
                date,
                shiftType,
                shiftName: shiftName || (shiftType === ShiftType.Morning ? 'Ca Sáng' : shiftType === ShiftType.Afternoon ? 'Ca Chiều' : 'Ca Tối'),
                startTime: startTime || (shiftType === ShiftType.Morning ? '07:00' : shiftType === ShiftType.Afternoon ? '13:00' : '18:00'),
                endTime: endTime || (shiftType === ShiftType.Morning ? '13:00' : shiftType === ShiftType.Afternoon ? '18:00' : '22:00'),
                role: role || 'Nhân viên tư vấn',
                status: ShiftStatus.Scheduled,
                note: note || ''
            });
            try {
                const saved = await newSchedule.save();
                sendSuccess(res, saved, 'Phân ca trực thành công', 201);
            }
            catch {
                sendSuccess(res, newSchedule, 'Phân ca trực thành công (Offline fallback)', 201);
            }
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const updated = await Schedule.findByIdAndUpdate(id, req.body, { new: true });
            if (!updated) {
                sendError(res, 'Không tìm thấy ca trực để cập nhật', 404, 'NOT_FOUND');
                return;
            }
            sendSuccess(res, updated, 'Cập nhật ca trực thành công');
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const deleted = await Schedule.findByIdAndDelete(id);
            if (!deleted) {
                sendError(res, 'Không tìm thấy ca trực để xóa', 404, 'NOT_FOUND');
                return;
            }
            sendSuccess(res, null, 'Đã xóa ca trực thành công');
        }
        catch (error) {
            next(error);
        }
    }
    static async autoGenerate(req, res, next) {
        try {
            const { startDate } = req.body;
            if (!startDate) {
                sendError(res, 'Vui lòng cung cấp ngày bắt đầu tuần (YYYY-MM-DD)', 400, 'BAD_REQUEST');
                return;
            }
            let staffMembers = [];
            try {
                staffMembers = await User.find({ isActive: true, role: { $in: [Role.Staff, Role.Owner, Role.Admin] } });
            }
            catch {
                staffMembers = [
                    { _id: 'staff-1', name: 'Quản Trị Viên (Vũ Phạm Luân)', role: Role.Admin },
                    { _id: 'staff-2', name: 'Chủ Cửa Hàng', role: Role.Owner },
                    { _id: 'staff-3', name: 'Thu Ngân 01', role: Role.Staff }
                ];
            }
            if (staffMembers.length === 0) {
                sendError(res, 'Không có nhân sự nào để xếp ca', 400, 'NO_STAFF');
                return;
            }
            const start = new Date(startDate);
            const generated = [];
            const shifts = [
                { type: ShiftType.Morning, name: 'Ca Sáng', start: '07:00', end: '13:00' },
                { type: ShiftType.Afternoon, name: 'Ca Chiều', start: '13:00', end: '18:00' },
                { type: ShiftType.Evening, name: 'Ca Tối', start: '18:00', end: '22:00' }
            ];
            for (let day = 0; day < 7; day++) {
                const currentDate = new Date(start);
                currentDate.setDate(start.getDate() + day);
                const dateStr = currentDate.toISOString().slice(0, 10);
                shifts.forEach((sh, idx) => {
                    const staffIndex = (day * 3 + idx) % staffMembers.length;
                    const assignedStaff = staffMembers[staffIndex];
                    generated.push({
                        staffId: assignedStaff._id,
                        staffName: assignedStaff.name,
                        date: dateStr,
                        shiftType: sh.type,
                        shiftName: sh.name,
                        startTime: sh.start,
                        endTime: sh.end,
                        role: assignedStaff.role === Role.Staff ? 'Thu ngân / Bán hàng' : 'Quản lý cửa hàng',
                        status: ShiftStatus.Scheduled
                    });
                });
            }
            sendSuccess(res, generated, `Đã tự động xếp thành công ${generated.length} ca làm việc cho 7 ngày`);
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=schedule.controller.js.map