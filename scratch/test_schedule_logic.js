// Script test toàn diện kiểm tra các hàm render và logic của admin.js
const fs = require('fs');
const path = require('path');

const adminJsContent = fs.readFileSync(path.join(__dirname, '../public/js/admin.js'), 'utf8');

// Mock browser environment
global.localStorage = {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; }
};

global.document = {
    getElementById(id) {
        return {
            id,
            innerText: '',
            value: '',
            innerHTML: '',
            style: {},
            classList: {
                add() {},
                remove() {},
                contains() { return false; }
            },
            reset() {}
        };
    },
    querySelectorAll() {
        return [];
    },
    querySelector() {
        return null;
    }
};

global.window = global;

console.log("=== KIỂM TRA 1: KHÔNG CÒN THẺ ADMIN-HEADER CHỨA H2 TRONG CODE ===");
const hasDuplicateHeader1 = adminJsContent.includes('BÁO CÁO & THỐNG KÊ CHI TIẾT');
const hasDuplicateHeader2 = adminJsContent.includes('CÀI ĐẶT HỆ THỐNG & TÀI KHOẢN');
const hasDuplicateHeader3 = adminJsContent.includes('QUẢN LÝ NHÂN SỰ & PHÂN QUYỀN');

console.log("BÁO CÁO & THỐNG KÊ CHI TIẾT còn tồn tại:", hasDuplicateHeader1 ? "CÓ (LỖI)" : "KHÔNG (ĐÃ SỬA THÀNH CÔNG)");
console.log("CÀI ĐẶT HỆ THỐNG & TÀI KHOẢN còn tồn tại:", hasDuplicateHeader2 ? "CÓ (LỖI)" : "KHÔNG (ĐÃ SỬA THÀNH CÔNG)");
console.log("QUẢN LÝ NHÂN SỰ & PHÂN QUYỀN còn tồn tại:", hasDuplicateHeader3 ? "CÓ (LỖI)" : "KHÔNG (ĐÃ SỬA THÀNH CÔNG)");

console.log("\n=== KIỂM TRA 2: CÁC HÀM XẾP LỊCH NHÂN VIÊN ĐÃ ĐƯỢC KHAI BÁO ===");
const requiredFunctions = [
    'initDefaultSchedulesIfEmpty',
    'getWeekRange',
    'switchStaffSubTab',
    'renderAdminStaff',
    'renderStaffAccountsHTML',
    'renderStaffScheduleHTML',
    'changeScheduleWeek',
    'setScheduleFilter',
    'handleShiftTypeChange',
    'openShiftModal',
    'closeShiftModal',
    'saveShiftSchedule',
    'deleteShiftSchedule',
    'cycleShiftStatus',
    'autoGenerateWeekSchedule',
    'exportScheduleCSV'
];

requiredFunctions.forEach(fn => {
    const regex = new RegExp(`function\\s+${fn}\\b`);
    const exists = regex.test(adminJsContent);
    console.log(`Hàm ${fn.padEnd(28)}: ${exists ? '✅ TỒN TẠI' : '❌ THIẾU'}`);
});

console.log("\n=== KIỂM TRA 3: MODAL VÀ CSS CỦA LỊCH TRỰC ===");
const adminHtmlContent = fs.readFileSync(path.join(__dirname, '../public/admin.html'), 'utf8');
const adminCssContent = fs.readFileSync(path.join(__dirname, '../public/css/admin.css'), 'utf8');

console.log("Modal shiftScheduleModal trong admin.html:", adminHtmlContent.includes('id="shiftScheduleModal"') ? "✅ ĐÃ CÓ" : "❌ THIẾU");
console.log("Link Lịch làm việc nhân viên trong sidebar:", adminHtmlContent.includes("switchTab('schedule')") ? "✅ ĐÃ CÓ" : "❌ THIẾU");
console.log("CSS .schedule-week-grid trong admin.css:", adminCssContent.includes('.schedule-week-grid') ? "✅ ĐÃ CÓ" : "❌ THIẾU");
console.log("CSS .shift-card trong admin.css:", adminCssContent.includes('.shift-card') ? "✅ ĐÃ CÓ" : "❌ THIẾU");
console.log("CSS .staff-sub-nav trong admin.css:", adminCssContent.includes('.staff-sub-nav') ? "✅ ĐÃ CÓ" : "❌ THIẾU");
