// Test script xác thực logic đăng xuất và thêm kích cỡ inline
const fs = require('fs');
const path = require('path');

const adminJs = fs.readFileSync(path.join(__dirname, '../public/js/admin.js'), 'utf8');

console.log("=== KIỂM TRA 1: KHÔNG CÒN PROMPT KÍCH CỠ ===");
const hasSizePrompt = adminJs.includes('Nhập tên kích cỡ mới');
console.log("Prompt kích cỡ còn trong code:", hasSizePrompt ? "CÓ (LỖI)" : "KHÔNG (ĐÃ XÓA THÀNH CÔNG)");

console.log("\n=== KIỂM TRA 2: TỒN TẠI HÀM addCustomSizeInline ===");
console.log("Hàm addCustomSizeInline:", adminJs.includes('function addCustomSizeInline') ? "✅ ĐÃ CÓ" : "❌ THIẾU");
console.log("Khung nhập inline custom-size-inline-wrapper:", adminJs.includes('custom-size-inline-wrapper') ? "✅ ĐÃ CÓ" : "❌ THIẾU");

console.log("\n=== KIỂM TRA 3: FIX BUG CALLBACK TRONG showConfirmDialog ===");
// Kiểm tra acceptBtn.onclick có lưu callback trước khi closeConfirmModal không
const hasCallbackFix = adminJs.includes('const callback = pendingConfirmCallback;\n        closeConfirmModal();\n        if (typeof callback === \'function\') {') || 
                       adminJs.includes('const callback = pendingConfirmCallback;') && adminJs.includes('callback();');
console.log("Fix lỗi nuốt callback trong confirm modal:", hasCallbackFix ? "✅ ĐÃ FIX CHUẨN XÁC" : "❌ CHƯA FIX");

console.log("\n=== KIỂM TRA 4: LOGIC ĐĂNG XUẤT handleLogout VÀ checkAuth ===");
const hasCheckAuthRedirect = adminJs.includes("if (!user) {\n        window.location.href = 'login.html';\n        return;\n    }");
console.log("checkAuth chuyển hướng login khi chưa đăng nhập:", hasCheckAuthRedirect ? "✅ ĐÃ CÓ" : "❌ THIẾU");
console.log("handleLogout xóa moonlight_user:", adminJs.includes("localStorage.removeItem('moonlight_user')") ? "✅ ĐÃ CÓ" : "❌ THIẾU");
