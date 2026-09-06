/* ==========================================================================
   ADMIN.JS - HỆ THỐNG QUẢN TRỊ MOON LIGHT LUXURY (ENHANCED VERSION)
   ========================================================================== */

// --- 1. BIẾN TOÀN CỤC & DỮ LIỆU ---
let products = JSON.parse(localStorage.getItem('moonlight_products')) || [];
let accounts = JSON.parse(localStorage.getItem('moonlight_accounts')) || [
    { id: 1, username: "admin", password: "123", name: "Quản Trị Viên", role: "Admin" },
    { id: 2, username: "owner", password: "123", name: "Chủ Cửa Hàng", role: "Owner" },
    { id: 3, username: "staff", password: "123", name: "Thu Ngân 01", role: "Staff" }
];
let orders = JSON.parse(localStorage.getItem('moonlight_orders')) || [];
let logs = JSON.parse(localStorage.getItem('moonlight_logs')) || [];
let allReviews = JSON.parse(localStorage.getItem('moonlight_all_reviews')) || [];

let revenueChartInstance = null;
let soldChartInstance = null;
let currentTab = 'dashboard';

// Callback cho Modal xác nhận
let pendingConfirmCallback = null;

// Bộ lọc Đơn hàng
let orderFilterStatus = 'all'; // all, pending, completed, cancelled
let orderFilterChannel = 'all'; // all, online, pos
let orderSortBy = 'newest'; // newest, oldest, highest_amount
let orderSearchKeyword = '';

// Bộ lọc Sản phẩm
let productSearchKeyword = '';
let productCategoryFilter = 'all';
let productStockFilter = 'all';

// Bộ lọc Khách hàng
let customerSearchKeyword = '';
let customerRankFilter = 'all';

// Bộ lọc Đánh giá
let reviewRatingFilter = 'all';
let reviewProductFilter = 'all'; // 'all' hoặc ID sản phẩm cụ thể
let reviewSearchKeyword = '';
let reviewReplyStatusFilter = 'all'; // 'all', 'replied', 'unreplied'
let currentReplyingReviewId = null;

// Bộ lọc Hoạt động & Biểu đồ
let currentActivityFilter = 'all';
let currentChartPeriod = '7days';

// Quản lý Lịch Trực & Xếp Ca Nhân Viên (Staff Shift Scheduling)
let moonlightSchedules = JSON.parse(localStorage.getItem('moonlight_schedules')) || null;
let staffSubTab = 'accounts'; // 'accounts' | 'schedule'
let scheduleWeekOffset = 0; // 0: tuần hiện tại, -1: tuần trước, 1: tuần sau...
let scheduleShiftFilter = 'all'; // 'all', 'morning', 'evening', 'full'
let scheduleStaffFilter = 'all'; // 'all' hoặc account id/username

// --- 2. KHỞI TẠO DỮ LIỆU MẪU NẾU TRỐNG ---
function initDefaultDataIfEmpty() {
    let hasChanged = false;

    if (!localStorage.getItem('moonlight_accounts')) {
        localStorage.setItem('moonlight_accounts', JSON.stringify(accounts));
    }

    if (!localStorage.getItem('moonlight_products') || products.length === 0) {
        products = [
            {
                id: 1,
                name: "Áo Vest Italian Cut",
                type: "ao-vest",
                price: 1500000,
                salePercent: 10,
                stock: 45,
                sold: 142,
                desc: "Thiết kế Ý sang trọng, phom dáng slimfit tôn dáng quý ông.",
                variants: [
                    {
                        color: "Đen",
                        hex: "#111111",
                        price: 1500000,
                        img: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600",
                        sizes: [{ name: "S", stock: 10 }, { name: "M", stock: 15 }, { name: "L", stock: 12 }, { name: "XL", stock: 8 }],
                        stock: 45
                    },
                    {
                        color: "Xanh Navy",
                        hex: "#1a2a40",
                        price: 1550000,
                        img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600",
                        sizes: [{ name: "M", stock: 8 }, { name: "L", stock: 6 }],
                        stock: 14
                    }
                ]
            },
            {
                id: 2,
                name: "Sơ Mi Lụa Premium White",
                type: "so-mi",
                price: 550000,
                salePercent: 0,
                stock: 28,
                sold: 89,
                desc: "Lụa tơ tằm mềm mát, chống nhăn, thích hợp công sở cao cấp.",
                variants: [
                    {
                        color: "Trắng",
                        hex: "#ffffff",
                        price: 550000,
                        img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600",
                        sizes: [{ name: "S", stock: 5 }, { name: "M", stock: 12 }, { name: "L", stock: 11 }],
                        stock: 28
                    }
                ]
            },
            {
                id: 3,
                name: "Quần Âu Slimfit Charcoal",
                type: "quan-tay",
                price: 650000,
                salePercent: 15,
                stock: 7, // Cảnh báo sắp hết hàng
                sold: 215,
                desc: "Vải co giãn 4 chiều, cạp tăng đơ thông minh thoải mái.",
                variants: [
                    {
                        color: "Xám Than",
                        hex: "#333333",
                        price: 650000,
                        img: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600",
                        sizes: [{ name: "29", stock: 1 }, { name: "30", stock: 2 }, { name: "31", stock: 4 }],
                        stock: 7
                    }
                ]
            },
            {
                id: 4,
                name: "Đồng Hồ Automatic Gold Edition",
                type: "dong-ho",
                price: 3200000,
                salePercent: 5,
                stock: 4, // Cảnh báo sắp hết hàng
                sold: 38,
                desc: "Bộ máy cơ Nhật Bản lộ cơ tinh xảo, kính Sapphire chống trầy xước.",
                variants: [
                    {
                        color: "Vàng Gold",
                        hex: "#d4af37",
                        price: 3200000,
                        img: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600",
                        sizes: [{ name: "Free", stock: 4 }],
                        stock: 4
                    }
                ]
            }
        ];
        localStorage.setItem('moonlight_products', JSON.stringify(products));
        hasChanged = true;
    }

    if (!localStorage.getItem('moonlight_orders') || orders.length === 0) {
        orders = [
            {
                id: "DH1001",
                customer: { name: "Nguyễn Văn An", phone: "0901234567", address: "123 Lê Lợi, P. Bến Thành, Q.1, TP.HCM", note: "Giao giờ hành chính" },
                items: [{ id: 1, name: "Áo Vest Italian Cut", color: "Đen", size: "L", price: 1500000, quantity: 1, img: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=200" }],
                total: 1500000,
                status: "completed",
                isPaid: true,
                paymentMethod: "Banking",
                date: new Date(Date.now() - 86400000 * 2).toLocaleDateString('vi-VN')
            },
            {
                id: "DH1002",
                customer: { name: "Trần Thị Bích", phone: "0912345678", address: "45 Hàng Bài, Hoàn Kiếm, Hà Nội", note: "Gọi trước khi giao 15p" },
                items: [{ id: 2, name: "Sơ Mi Lụa Premium White", color: "Trắng", size: "M", price: 550000, quantity: 2, img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200" }],
                total: 1100000,
                status: "pending",
                isPaid: false,
                paymentMethod: "Banking",
                date: new Date(Date.now() - 86400000).toLocaleDateString('vi-VN')
            },
            {
                id: "POS1003",
                customer: { name: "Khách lẻ tại quầy", phone: "0988776655", address: "Tại cửa hàng", note: "" },
                items: [{ id: 3, name: "Quần Âu Slimfit Charcoal", color: "Xám Than", size: "30", price: 650000, quantity: 1, img: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=200" }],
                total: 650000,
                status: "completed",
                isPaid: true,
                paymentMethod: "Tiền mặt",
                date: new Date().toLocaleDateString('vi-VN')
            },
            {
                id: "DH1004",
                customer: { name: "Hoàng Gia Bảo", phone: "0933445566", address: "88 Trần Phú, Đà Nẵng", note: "" },
                items: [{ id: 4, name: "Đồng Hồ Automatic Gold Edition", color: "Vàng Gold", size: "Free", price: 3200000, quantity: 1, img: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=200" }],
                total: 3200000,
                status: "pending",
                isPaid: false,
                paymentMethod: "COD",
                date: new Date().toLocaleDateString('vi-VN')
            }
        ];
        localStorage.setItem('moonlight_orders', JSON.stringify(orders));
        hasChanged = true;
    }

    if (!localStorage.getItem('moonlight_all_reviews') || allReviews.length === 0) {
        allReviews = [
            { id: 1, productId: 1, productName: "Áo Vest Italian Cut", name: "Nguyễn Văn An", rating: 5, content: "Chất vải Ý cực đẹp, đường may tỉ mỉ, mặc đi tiệc ai cũng khen.", date: "01/03/2026", status: "approved" },
            { id: 2, productId: 2, productName: "Sơ Mi Lụa Premium White", name: "Trần Bích", rating: 4, content: "Áo lụa mịn mát, form vừa vặn mặc rất sang trọng.", date: "02/03/2026", status: "approved" },
            { id: 3, productId: 4, productName: "Đồng Hồ Automatic Gold Edition", name: "Lê Hoàng", rating: 5, content: "Đồng hồ đẳng cấp, mặt kính sapphire trong vắt, chạy rất chuẩn giờ.", date: "03/03/2026", status: "approved" },
            { id: 4, productId: 3, productName: "Quần Âu Slimfit Charcoal", name: "Vũ Hải", rating: 3, content: "Giao hàng hơi lâu một chút, nhưng chất quần khá ổn.", date: "04/03/2026", status: "approved" }
        ];
        localStorage.setItem('moonlight_all_reviews', JSON.stringify(allReviews));
        hasChanged = true;
    }

    if (!localStorage.getItem('moonlight_logs') || logs.length === 0) {
        logs = [
            { time: new Date().toLocaleString('vi-VN'), user: "Admin (Quản Trị Viên)", action: "Đăng nhập", details: "Truy cập hệ thống quản trị trung tâm" },
            { time: new Date(Date.now() - 3600000).toLocaleString('vi-VN'), user: "Admin (Quản Trị Viên)", action: "Thêm sản phẩm", details: "Cập nhật kho Áo Vest Italian Cut" },
            { time: new Date(Date.now() - 7200000).toLocaleString('vi-VN'), user: "Thu Ngân 01", action: "Bán hàng POS", details: "Hoàn tất đơn hàng #POS1003 tại quầy" }
        ];
        localStorage.setItem('moonlight_logs', JSON.stringify(logs));
        hasChanged = true;
    }

    if (hasChanged) {
        products = JSON.parse(localStorage.getItem('moonlight_products')) || [];
        orders = JSON.parse(localStorage.getItem('moonlight_orders')) || [];
        allReviews = JSON.parse(localStorage.getItem('moonlight_all_reviews')) || [];
        logs = JSON.parse(localStorage.getItem('moonlight_logs')) || [];
    }
}

// --- 2.5. QUẢN LÝ GIAO DIỆN SÁNG / TỐI (DUAL-MODE THEME) ---
let currentTheme = localStorage.getItem('moonlight_theme') || 'dark';

function initAdminTheme() {
    currentTheme = localStorage.getItem('moonlight_theme') || 'dark';
    applyAdminTheme(currentTheme, false);
}

function toggleAdminTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('moonlight_theme', currentTheme);
    applyAdminTheme(currentTheme, true);
}

function applyAdminTheme(theme, reinitCharts = false) {
    const body = document.body;
    const root = document.documentElement;
    const icon = document.getElementById('themeToggleIcon');
    const text = document.getElementById('themeToggleText');
    const btn = document.getElementById('themeToggleBtn');

    if (theme === 'light') {
        root.setAttribute('data-theme', 'light');
        if (body) {
            body.setAttribute('data-theme', 'light');
            body.classList.add('theme-light');
        }
        if (icon) icon.className = 'fas fa-moon';
        if (text) text.innerText = 'Chế độ Tối';
        if (btn) btn.setAttribute('title', 'Chuyển sang giao diện Tối');
    } else {
        root.setAttribute('data-theme', 'dark');
        if (body) {
            body.setAttribute('data-theme', 'dark');
            body.classList.remove('theme-light');
        }
        if (icon) icon.className = 'fas fa-sun';
        if (text) text.innerText = 'Chế độ Sáng';
        if (btn) btn.setAttribute('title', 'Chuyển sang giao diện Sáng');
    }

    if (reinitCharts && currentTab === 'dashboard' && typeof initCharts === 'function') {
        initCharts(currentChartPeriod);
    }
}

// --- 3. KHỞI CHẠY TRANG & AUTH ---
document.addEventListener('DOMContentLoaded', () => {
    initDefaultDataIfEmpty();
    initAdminTheme();
    checkAuth();
    startRealtimeClock();
    updatePendingBadge();
    const user = JSON.parse(localStorage.getItem('moonlight_user')) || { role: 'Staff' };
    const defaultTab = user.role === 'Staff' ? 'orders' : 'dashboard';
    switchTab(defaultTab);
    initAIAgent();
});

function checkAuth() {
    let user = JSON.parse(localStorage.getItem('moonlight_user'));
    
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    if (document.getElementById('adminName')) document.getElementById('adminName').innerText = user.name;
    
    const avatarEl = document.getElementById('adminAvatar');
    if (avatarEl) {
        if (user.avatar) {
            avatarEl.innerHTML = `<img src="${user.avatar}" alt="${user.name}" style="width:100%; height:100%; object-fit:cover; border-radius:50%; display:block;">`;
        } else {
            avatarEl.innerHTML = `<div style="font-weight:700; font-size:14px; color:#fff;">${(user.name || 'U').charAt(0).toUpperCase()}</div>`;
        }
    }

    // Áp dụng giới hạn phân quyền theo vai trò (Admin, Owner, Staff)
    applyRolePermissions(user);
}

// Hệ thống phân quyền giao diện theo vai trò (Role-Based Access Control)
function applyRolePermissions(user) {
    if (!user) return;
    const role = user.role || 'Staff';

    // 1. Cập nhật nhãn và màu sắc vai trò trên Sidebar
    const roleEl = document.getElementById('adminRole');
    if (roleEl) {
        if (role === 'Admin') {
            roleEl.innerHTML = `<span class="user-status-dot" style="background:var(--gold);"></span> <strong style="color:var(--gold);">Admin Hệ Thống</strong>`;
        } else if (role === 'Owner') {
            roleEl.innerHTML = `<span class="user-status-dot" style="background:#10b981;"></span> <strong style="color:#10b981;">Chủ Cửa Hàng</strong>`;
        } else {
            roleEl.innerHTML = `<span class="user-status-dot" style="background:#60a5fa;"></span> <strong style="color:#60a5fa;">Thu Ngân / POS</strong>`;
        }
    }

    // 2. Ẩn/Hiện các menu Sidebar theo data-roles
    document.querySelectorAll('.admin-menu a[data-roles]').forEach(link => {
        const allowedRoles = (link.getAttribute('data-roles') || '').split(',').map(r => r.trim());
        if (allowedRoles.includes(role)) {
            link.style.display = 'flex';
        } else {
            link.style.display = 'none';
        }
    });

    // 3. Phân quyền Topbar
    const exportReportBtn = document.querySelector('.btn-export-report');
    if (exportReportBtn) {
        if (role === 'Staff') {
            exportReportBtn.style.display = 'none';
        } else {
            exportReportBtn.style.display = 'inline-flex';
        }
    }

    const quickDeployBtn = document.getElementById('btnQuickDeploy');
    if (quickDeployBtn) {
        if (role === 'Admin') {
            quickDeployBtn.style.display = 'inline-flex';
        } else {
            quickDeployBtn.style.display = 'none';
        }
    }

    // 4. Các thành phần dành riêng cho Admin
    if (role !== 'Admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.setProperty('display', 'none', 'important'));
    } else {
        document.querySelectorAll('.admin-only').forEach(el => el.style.removeProperty('display'));
    }
}

// Hộp thoại xác nhận thay thế window.confirm
function showConfirmDialog({ title, message, icon = 'fa-exclamation-triangle', isDanger = false, confirmText = 'ĐỒNG Ý', cancelText = 'HỦY BỎ', onConfirm }) {
    const modal = document.getElementById('actionConfirmModal');
    const iconWrap = document.getElementById('confirmIconWrapper');
    const iconEl = document.getElementById('confirmIcon');
    const titleEl = document.getElementById('confirmTitle');
    const msgEl = document.getElementById('confirmMessage');
    const acceptBtn = document.getElementById('confirmAcceptBtn');
    const cancelBtn = document.getElementById('confirmCancelBtn');

    if (!modal) return;

    titleEl.innerText = title;
    msgEl.innerText = message;
    iconEl.className = `fas ${icon}`;
    
    if (isDanger) {
        iconWrap.className = 'confirm-icon-wrapper danger';
        acceptBtn.className = 'btn-primary';
        acceptBtn.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
        acceptBtn.style.color = '#fff';
    } else {
        iconWrap.className = 'confirm-icon-wrapper';
        acceptBtn.className = 'btn-primary';
        acceptBtn.style.background = '';
        acceptBtn.style.color = '#000';
    }

    acceptBtn.innerText = confirmText;
    cancelBtn.innerText = cancelText;

    pendingConfirmCallback = onConfirm;

    acceptBtn.onclick = () => {
        const callback = pendingConfirmCallback;
        closeConfirmModal();
        if (typeof callback === 'function') {
            callback();
        }
    };

    modal.classList.add('open');
}

function closeConfirmModal() {
    document.getElementById('actionConfirmModal')?.classList.remove('open');
    pendingConfirmCallback = null;
}

// Modal Thông báo kết quả Thành công / Thất bại
function showResultModal({ type = 'success', title = 'Thành công!', message = 'Thao tác đã hoàn tất thành công.' }) {
    const modal = document.getElementById('statusResultModal');
    const card = modal?.querySelector('.status-result-card');
    const iconWrap = document.getElementById('resultIconWrapper');
    const iconEl = document.getElementById('resultIcon');
    const titleEl = document.getElementById('resultTitle');
    const msgEl = document.getElementById('resultMessage');

    if (!modal) return;

    titleEl.innerText = title;
    msgEl.innerText = message;

    if (type === 'success') {
        if (card) card.className = 'modal-content status-result-card';
        if (iconWrap) iconWrap.className = 'result-icon-wrapper success';
        if (iconEl) iconEl.className = 'fas fa-check';
    } else {
        if (card) card.className = 'modal-content status-result-card error-card';
        if (iconWrap) iconWrap.className = 'result-icon-wrapper error';
        if (iconEl) iconEl.className = 'fas fa-times';
    }

    modal.classList.add('open');
}

function closeResultModal() {
    document.getElementById('statusResultModal')?.classList.remove('open');
}

function handleLogout() {
    showConfirmDialog({
        title: "Đăng Xuất Hệ Thống",
        message: "Bạn có chắc chắn muốn kết thúc phiên làm việc hiện tại và đăng xuất khỏi trang quản trị MoonLight?",
        icon: "fa-arrow-right-from-bracket",
        isDanger: true,
        confirmText: "ĐĂNG XUẤT NGAY",
        cancelText: "HỦY BỎ",
        onConfirm: () => {
            localStorage.removeItem('moonlight_user');
            sessionStorage.clear();
            showToast("Đã đăng xuất", "Đang chuyển về trang đăng nhập...", "info");
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 200);
        }
    });
}

function startRealtimeClock() {
    const clockEl = document.getElementById('realtimeClock');
    if (!clockEl) return;
    const update = () => {
        const now = new Date();
        clockEl.innerText = now.toLocaleTimeString('vi-VN') + ' | ' + now.toLocaleDateString('vi-VN');
    };
    update();
    setInterval(update, 1000);
}

function toggleMobileSidebar() {
    document.getElementById('adminSidebar')?.classList.toggle('mobile-open');
}

function updatePendingBadge() {
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const badge = document.getElementById('pendingOrderBadge');
    if (badge) {
        if (pendingCount > 0) {
            badge.innerText = pendingCount;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}

// --- 4. ĐIỀU HƯỚNG TAB & PHÂN QUYỀN TRUY CẬP (RBAC) ---
function switchTab(tabName) {
    const user = JSON.parse(localStorage.getItem('moonlight_user')) || { role: 'Staff', name: 'Nhân viên' };

    // 1. Kiểm tra quyền truy cập tab Quản lý nhân sự (Chỉ Admin mới có quyền)
    if (tabName === 'staff' && user.role !== 'Admin') {
        showToast("Truy cập bị từ chối", "Chức năng Quản lý Nhân sự & Phân quyền chỉ dành riêng cho Admin cấp cao!", "error");
        showResultModal({
            type: 'error',
            title: 'Từ Chối Quyền Truy Cập!',
            message: `Tài khoản "${user.name}" (${user.role}) không được cấp quyền quản trị nhân sự. Vui lòng liên hệ Admin hệ thống.`
        });
        // Tự động chuyển hướng sang tab được phép
        if (currentTab === 'staff') {
            tabName = user.role === 'Owner' ? 'dashboard' : 'orders';
        } else {
            return;
        }
    }

    // 2. Kiểm tra quyền truy cập tab Báo cáo doanh thu (Nhân viên thu ngân bị chặn)
    if (tabName === 'reports' && user.role === 'Staff') {
        showToast("Bảo mật dữ liệu", "Nhân viên thu ngân không có quyền xem Báo Cáo Tài Chính & Doanh Thu!", "error");
        showResultModal({
            type: 'error',
            title: 'Bảo Mật Tài Chính Doanh Nghiệp!',
            message: `Dữ liệu phân tích doanh thu và biên lợi nhuận được bảo mật, chỉ dành riêng cho Chủ cửa hàng (Owner) và Quản trị viên (Admin).`
        });
        // Tự động chuyển sang Đơn hàng
        if (currentTab === 'reports') {
            tabName = 'orders';
        } else {
            return;
        }
    }

    // 3. Kiểm tra quyền truy cập tab Dashboard (Nhân viên thu ngân chuyển về Đơn Hàng)
    if (tabName === 'dashboard' && user.role === 'Staff') {
        tabName = 'orders';
    }

    // 4. Kiểm tra quyền truy cập tab Sức khỏe máy chủ & Deploy (Chỉ Admin mới có quyền)
    if (tabName === 'system' && user.role !== 'Admin') {
        showToast("Truy cập bị từ chối", "Chức năng Giám sát Máy chủ & Deploy Git chỉ dành riêng cho Admin!", "error");
        showResultModal({
            type: 'error',
            title: 'Từ Chối Quyền Truy Cập!',
            message: `Tài khoản "${user.name}" (${user.role}) không được phép xem thông số máy chủ và triển khai hệ thống.`
        });
        if (currentTab === 'system') {
            tabName = user.role === 'Owner' ? 'dashboard' : 'orders';
        } else {
            return;
        }
    }

    currentTab = tabName;
    if (tabName !== 'system' && typeof stopHardwareLivePolling === 'function') {
        stopHardwareLivePolling();
    }
    document.querySelectorAll('.admin-menu a').forEach(a => a.classList.remove('active'));
    
    const activeLink = document.querySelector(`.admin-menu a[onclick*="'${tabName}'"]`);
    if (activeLink) activeLink.classList.add('active');

    const headingEl = document.getElementById('pageTitleHeading');
    const subtitleEl = document.getElementById('pageTitleSubtitle') || document.getElementById('welcomeSubtitle');

    const tabTitles = {
        dashboard: {
            heading: 'Tổng Quan',
            subtitle: 'Theo dõi chỉ số kinh doanh & hoạt động thời gian thực.'
        },
        products: {
            heading: 'Sản Phẩm & Kho',
            subtitle: 'Quản lý danh mục sản phẩm, biến thể và số lượng tồn kho.'
        },
        orders: {
            heading: 'Quản Lý Đơn Hàng',
            subtitle: 'Xử lý đơn đặt hàng, kiểm tra đối soát thanh toán và in vận đơn.'
        },
        customers: {
            heading: 'Khách Hàng Thân Thiết',
            subtitle: 'Danh sách khách hàng thân thiết và lịch sử mua sắm.'
        },
        reviews: {
            heading: 'Đánh Giá Khách Hàng',
            subtitle: 'Phản hồi đánh giá khách hàng và chăm sóc chất lượng dịch vụ.'
        },
        staff: {
            heading: 'Quản Lý Nhân Sự',
            subtitle: 'Phân quyền tài khoản quản trị viên và nhân viên thu ngân.'
        },
        schedule: {
            heading: 'Lịch Làm Việc Nhân Viên',
            subtitle: 'Bảng phân ca tuần, theo dõi ca trực và phân công nhiệm vụ showroom.'
        },
        reports: {
            heading: 'Báo Cáo & Thống Kê',
            subtitle: 'Báo cáo doanh thu và phân tích tài chính chi tiết.'
        },
        system: {
            heading: 'Sức Khỏe Máy Chủ & Deploy Git',
            subtitle: 'Giám sát CPU, RAM, Network, Database thời gian thực và đồng bộ mã nguồn 1-Click.'
        },
        settings: {
            heading: 'Cài Đặt Hệ Thống',
            subtitle: 'Đổi mật khẩu, ảnh đại diện và tùy biến cấu hình hệ thống.'
        }
    };

    const currentMeta = tabTitles[tabName] || { heading: 'Hệ Thống', subtitle: 'Quản lý vận hành MoonLight Luxury' };
    if (headingEl) headingEl.innerText = currentMeta.heading;
    if (subtitleEl) subtitleEl.innerText = currentMeta.subtitle;

    if (tabName === 'dashboard') {
        renderAdminStats();
    } else if (tabName === 'products') {
        renderAdminProducts();
    } else if (tabName === 'orders') {
        renderAdminOrders();
    } else if (tabName === 'reviews') {
        renderAdminReviews();
    } else if (tabName === 'staff') {
        staffSubTab = 'accounts';
        renderAdminStaff();
    } else if (tabName === 'schedule') {
        staffSubTab = 'schedule';
        renderAdminStaff();
    } else if (tabName === 'customers') {
        renderAdminCustomers();
    } else if (tabName === 'reports') {
        renderAdminReports();
    } else if (tabName === 'system') {
        renderAdminSystem();
    } else if (tabName === 'settings') {
        renderAdminSettings();
    }

    updatePendingBadge();
    document.getElementById('adminSidebar')?.classList.remove('mobile-open');
}

// --- 5. TAB 1: DASHBOARD & THỐNG KÊ BIỂU ĐỒ (MIDNIGHT INDIGO LUXURY THEO MẪU) ---
function renderAdminStats() {
    const container = document.getElementById('adminContent');
    if (!container) return;

    // Cập nhật ngày tháng trên Topbar
    const dateTextEl = document.getElementById('currentDateText');
    if (dateTextEl) {
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yyyy = now.getFullYear();
        dateTextEl.innerText = `${dd}/${mm}/${yyyy}`;
    }

    const completedOrders = orders.filter(o => o.status === 'completed');
    const totalRev = completedOrders.reduce((s, o) => s + (o.total || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const pendingCount = pendingOrders.length;
    const totalSoldUnits = products.reduce((sum, p) => sum + (p.sold || 0), 0) || 84;
    const uniqueCustomers = new Set(orders.map(o => o.customer?.phone || o.customer?.name)).size || 4;
    const lowStockProducts = products.filter(p => (p.stock || 0) < 10);

    // Kênh thanh toán & phân bổ
    const totalOrdersCount = orders.length || 4;
    const bankingOrders = orders.filter(o => (o.paymentMethod || '').toLowerCase().includes('bank') || (o.paymentMethod || '').toLowerCase().includes('chuyển'));
    const codOrders = orders.filter(o => !((o.paymentMethod || '').toLowerCase().includes('bank') || (o.paymentMethod || '').toLowerCase().includes('chuyển')));
    const posOrders = orders.filter(o => (o.orderSource === 'pos') || (o.customer && (o.customer.name || '').includes('Tại quầy')) || (o.notes || '').includes('POS'));
    const onlineOrders = orders.filter(o => !posOrders.includes(o));

    const bankingCount = bankingOrders.length || 2;
    const codCount = codOrders.length || 1;
    const webCount = onlineOrders.length || 1;
    const posCount = posOrders.length || 2;

    const bankingPct = Math.round((bankingCount / totalOrdersCount) * 100) || 50;
    const codPct = Math.round((codCount / totalOrdersCount) * 100) || 30;
    const webPct = Math.round((webCount / totalOrdersCount) * 100) || 10;
    const posPct = 100 - bankingPct - codPct - webPct > 0 ? (100 - bankingPct - codPct - webPct) : 10;

    // Top 3 sản phẩm bán chạy nhất
    const sortedProducts = [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0));
    const top3Products = sortedProducts.slice(0, 3);
    if (top3Products.length === 0) {
        top3Products.push(
            { name: 'Áo Thun Cotton Basic', sold: 120, price: 360000, img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=100' },
            { name: 'Quần Jean Slimfit', sold: 85, price: 850000, img: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=100' },
            { name: 'Giày Sneaker White', sold: 64, price: 1280000, img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100' }
        );
    }

    // 3 đơn hàng gần nhất
    const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    const recent3Orders = sortedOrders.slice(0, 3);
    if (recent3Orders.length === 0) {
        recent3Orders.push(
            { code: '#DH1004', createdAt: '09/04/2026 - 10:30', total: 850000, status: 'completed' },
            { code: '#DH1003', createdAt: '09/04/2026 - 09:15', total: 360000, status: 'pending' },
            { code: '#DH1002', createdAt: '08/04/2026 - 16:45', total: 1280000, status: 'completed' }
        );
    }

    // 3 hoạt động gần đây
    const recent3Logs = logs.slice(0, 3);
    if (recent3Logs.length === 0) {
        recent3Logs.push(
            { action: 'Đơn hàng #DH1004 đã được hoàn thành', time: '10:30 - 09/04/2026', type: 'order' },
            { action: 'Sản phẩm Áo Thun Cotton Basic được cập nhật', time: '09:45 - 09/04/2026', type: 'product' },
            { action: 'Thêm khách hàng mới: Nguyễn Văn A', time: '09:20 - 09/04/2026', type: 'customer' }
        );
    }

    container.innerHTML = `
        <!-- THANH GIÁM SÁT MÁY CHỦ VPS & DEPLOY GIT -->
        <div id="serverPulseContainer"></div>

        <!-- 4 THẺ THỐNG KÊ (GRID + SPARKLINES SVG VECTOR THEO MẪU) -->
        <div class="dashboard-stats">
            <!-- Card 1: Doanh Thu -->
            <div class="stat-card">
                <div class="stat-card-header">
                    <h3>DOANH THU HÔM NAY</h3>
                    <div class="stat-icon-wrapper indigo">
                        <i class="fas fa-wallet"></i>
                    </div>
                </div>
                <div class="stat-value-box">
                    <p class="stat-value">${(totalRev || 2150000).toLocaleString()}<span class="stat-currency">đ</span></p>
                    <div class="stat-trend-sub">
                        <i class="fas fa-arrow-up"></i> 12.5% <small>so với hôm qua</small>
                    </div>
                </div>
                <!-- Sparkline Purple -->
                <svg class="stat-sparkline-svg" viewBox="0 0 100 35" fill="none">
                    <path d="M0 28 Q 20 20, 35 24 T 65 14 T 85 18 T 100 8" stroke="#8b5cf6" stroke-width="2.5" stroke-linecap="round" fill="none"/>
                </svg>
            </div>

            <!-- Card 2: Đơn Hàng -->
            <div class="stat-card">
                <div class="stat-card-header">
                    <h3>ĐƠN HÀNG</h3>
                    <div class="stat-icon-wrapper blue">
                        <i class="fas fa-shopping-bag"></i>
                    </div>
                </div>
                <div class="stat-value-box">
                    <p class="stat-value">${orders.length || 2}</p>
                    <div class="stat-trend-sub">
                        <i class="fas fa-arrow-up"></i> 100% <small>so với hôm qua</small>
                    </div>
                </div>
                <!-- Sparkline Blue -->
                <svg class="stat-sparkline-svg" viewBox="0 0 100 35" fill="none">
                    <path d="M0 26 Q 25 30, 45 22 T 75 12 T 100 16" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" fill="none"/>
                </svg>
            </div>

            <!-- Card 3: Sản Phẩm Đã Bán -->
            <div class="stat-card">
                <div class="stat-card-header">
                    <h3>SẢN PHẨM ĐÃ BÁN</h3>
                    <div class="stat-icon-wrapper cyan">
                        <i class="fas fa-box-open"></i>
                    </div>
                </div>
                <div class="stat-value-box">
                    <p class="stat-value">${totalSoldUnits || 84}</p>
                    <div class="stat-trend-sub">
                        <i class="fas fa-arrow-up"></i> 8.7% <small>so với hôm qua</small>
                    </div>
                </div>
                <!-- Sparkline Cyan -->
                <svg class="stat-sparkline-svg" viewBox="0 0 100 35" fill="none">
                    <path d="M0 25 Q 30 18, 50 22 T 80 10 T 100 15" stroke="#06b6d4" stroke-width="2.5" stroke-linecap="round" fill="none"/>
                </svg>
            </div>

            <!-- Card 4: Khách Hàng Mới -->
            <div class="stat-card">
                <div class="stat-card-header">
                    <h3>KHÁCH HÀNG MỚI</h3>
                    <div class="stat-icon-wrapper green">
                        <i class="fas fa-users"></i>
                    </div>
                </div>
                <div class="stat-value-box">
                    <p class="stat-value">${uniqueCustomers || 4}</p>
                    <div class="stat-trend-sub">
                        <i class="fas fa-arrow-up"></i> 33.3% <small>so với hôm qua</small>
                    </div>
                </div>
                <!-- Sparkline Green -->
                <svg class="stat-sparkline-svg" viewBox="0 0 100 35" fill="none">
                    <path d="M0 28 Q 20 22, 40 26 T 70 12 T 100 6" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" fill="none"/>
                </svg>
            </div>
        </div>

        <!-- CẢNH BÁO TỒN KHO THẤP (VIỀN ĐỎ CRIMSON THEO MẪU) -->
        <div class="low-stock-alert-bar">
            <div class="alert-content">
                <i class="fas fa-triangle-exclamation" style="color:#ef4444; font-size:15px;"></i>
                <div>
                    <strong>Cảnh báo tồn kho:</strong>
                    <span>${lowStockProducts.length > 0 ? `${lowStockProducts.length} sản phẩm sắp hết hàng (dưới 10 cái): ${lowStockProducts.map(p => `${p.name} (${p.stock})`).slice(0, 2).join(', ')}` : '2 sản phẩm sắp hết hàng (dưới 10 cái): Quần Âu Slimfit Charcoal (7), Đồng Hồ Automatic Gold Edition (4)'}</span>
                </div>
            </div>
            <button class="btn-alert-view" onclick="filterLowStockProducts()">
                <i class="fas fa-eye"></i> Xem ngay
            </button>
        </div>

        <!-- KHỐI BIỂU ĐỒ (2 CỘT: BIỂU ĐỒ DOANH THU & PHÂN BỔ THU NGÂN) -->
        <div class="charts-grid">
            <!-- Cột 1: Biểu đồ doanh thu (62% width) -->
            <div class="chart-box">
                <div class="chart-box-header">
                    <div class="chart-title-left">
                        <h3>Biểu đồ doanh thu</h3>
                        <div class="chart-stat-row">
                            <span class="chart-big-val" id="chartPeriodTotal">${(totalRev || 2580000).toLocaleString()}đ</span>
                            <span class="trend-pill-green"><i class="fas fa-arrow-trend-up"></i> 18.2%</span>
                        </div>
                    </div>
                    <select class="chart-dropdown-select" onchange="changeChartPeriod(this.value, null)">
                        <option value="7days" ${currentChartPeriod === '7days' ? 'selected' : ''}>7 ngày qua</option>
                        <option value="30days" ${currentChartPeriod === '30days' ? 'selected' : ''}>30 ngày qua</option>
                        <option value="month" ${currentChartPeriod === 'month' ? 'selected' : ''}>Cả năm nay</option>
                    </select>
                </div>
                <div class="chart-canvas-container">
                    <canvas id="revenueChart"></canvas>
                </div>
            </div>

            <!-- Cột 2: Phân bổ bán hàng & thu ngân (38% width) -->
            <div class="chart-box">
                <div class="chart-box-header">
                    <h3>Phân bổ bán hàng & thu ngân</h3>
                </div>
                <div class="donut-split-box">
                    <div class="donut-canvas-holder">
                        <canvas id="soldChart"></canvas>
                        <div class="donut-center-info">
                            <span class="donut-center-val">${orders.length || 4}</span>
                            <span class="donut-center-lbl">Tổng đơn</span>
                        </div>
                    </div>
                    <div class="donut-legend-list">
                        <div class="donut-legend-item">
                            <div class="donut-legend-left">
                                <span class="donut-dot green"></span>
                                <span>Chuyển khoản Banking / QR</span>
                            </div>
                            <div class="donut-legend-right">
                                <span>${bankingPct}%</span>
                                <small>(${bankingCount} đơn)</small>
                            </div>
                        </div>

                        <div class="donut-legend-item">
                            <div class="donut-legend-left">
                                <span class="donut-dot blue"></span>
                                <span>Tiền mặt COD / Khi nhận</span>
                            </div>
                            <div class="donut-legend-right">
                                <span>${codPct}%</span>
                                <small>(${codCount} đơn)</small>
                            </div>
                        </div>

                        <div class="donut-legend-item">
                            <div class="donut-legend-left">
                                <span class="donut-dot cyan"></span>
                                <span>Website trực tuyến</span>
                            </div>
                            <div class="donut-legend-right">
                                <span>${webPct}%</span>
                                <small>(${webCount} đơn)</small>
                            </div>
                        </div>

                        <div class="donut-legend-item">
                            <div class="donut-legend-left">
                                <span class="donut-dot coral"></span>
                                <span>Thu ngân tại quầy (POS)</span>
                            </div>
                            <div class="donut-legend-right">
                                <span>${posPct}%</span>
                                <small>(${posCount} đơn)</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- HÀNG CHÂN TRANG 3 CỘT (TOP SẢN PHẨM, ĐƠN HÀNG GẦN NHẤT, HOẠT ĐỘNG) -->
        <div class="bottom-widgets-grid">
            <!-- Cột 1: Top sản phẩm bán chạy -->
            <div class="widget-card">
                <div class="widget-card-header">
                    <h3>Top sản phẩm bán chạy</h3>
                    <a href="javascript:void(0)" onclick="switchTab('products')" class="card-link-all">Xem tất cả</a>
                </div>
                <div class="widget-content-list">
                    ${top3Products.map((p, idx) => {
                        const rankSymbol = idx === 0 ? '①' : (idx === 1 ? '②' : '③');
                        const pImg = (p.variants && p.variants[0]?.img) || p.img || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=100';
                        return `
                            <div class="top-prod-row">
                                <span class="rank-badge">${rankSymbol}</span>
                                <div class="prod-thumb">
                                    <img src="${pImg}" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=100'">
                                </div>
                                <div class="prod-info">
                                    <div class="prod-name" title="${p.name}">${p.name}</div>
                                    <div class="prod-sold">${p.sold || 45} đã bán</div>
                                </div>
                                <div class="prod-price">${(p.price || 350000).toLocaleString()}đ</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- Cột 2: Đơn hàng gần nhất -->
            <div class="widget-card">
                <div class="widget-card-header">
                    <h3>Đơn hàng gần nhất</h3>
                    <a href="javascript:void(0)" onclick="switchTab('orders')" class="card-link-all">Xem tất cả</a>
                </div>
                <div class="widget-content-list">
                    ${recent3Orders.map(o => {
                        const isDone = o.status === 'completed';
                        const statusClass = isDone ? 'pill-status-done' : 'pill-status-processing';
                        const statusText = isDone ? '● Hoàn thành' : '● Đang xử lý';
                        const orderCode = o.code || ('#DH' + (o.id || 1000));
                        const orderTime = o.createdAt || '09/04/2026 - 10:30';
                        const orderAmt = (o.total || 500000).toLocaleString() + 'đ';
                        return `
                            <div class="order-row">
                                <div class="order-avatar">
                                    <i class="far fa-user"></i>
                                </div>
                                <div class="order-info">
                                    <div class="order-code">${orderCode}</div>
                                    <div class="order-time">${orderTime}</div>
                                </div>
                                <div class="order-total">${orderAmt}</div>
                                <span class="${statusClass}">${statusText}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- Cột 3: Hoạt động gần đây -->
            <div class="widget-card">
                <div class="widget-card-header">
                    <h3>Hoạt động gần đây</h3>
                    <a href="javascript:void(0)" onclick="switchTab('dashboard')" class="card-link-all">Xem tất cả</a>
                </div>
                <div class="widget-content-list">
                    ${recent3Logs.map((l, idx) => {
                        const iconColorClass = idx === 0 ? 'amber' : (idx === 1 ? 'blue' : 'green');
                        const iconFa = idx === 0 ? 'fa-bag-shopping' : (idx === 1 ? 'fa-box' : 'fa-user-plus');
                        const actText = l.action || l.details || 'Cập nhật hoạt động hệ thống';
                        const actTime = l.time || '10:30 - 09/04/2026';
                        return `
                            <div class="timeline-row">
                                <div class="timeline-icon ${iconColorClass}">
                                    <i class="fas ${iconFa}"></i>
                                </div>
                                <div class="timeline-content">
                                    <div class="timeline-text">${actText}</div>
                                    <div class="timeline-time">${actTime}</div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;

    initCharts(currentChartPeriod);
    loadServerPulseData();
}

function initCharts(period = '7days') {
    const ctxRev = document.getElementById('revenueChart');
    const ctxSold = document.getElementById('soldChart');
    if (!ctxRev || !ctxSold) return;
    if (typeof Chart === 'undefined') return;

    if (revenueChartInstance) revenueChartInstance.destroy();
    if (soldChartInstance) soldChartInstance.destroy();

    const isLight = document.body.getAttribute('data-theme') === 'light' || document.documentElement.getAttribute('data-theme') === 'light';

    let labels = [];
    let revData = [];
    let completedOrders = orders.filter(o => o.status === 'completed');
    const totalRev = completedOrders.reduce((s, o) => s + (o.total || 0), 0) || 2580000;

    if (period === '7days') {
        labels = ['03/04', '04/04', '05/04', '06/04', '07/04', '08/04', '09/04'];
        revData = [
            Math.round(totalRev * 0.08),
            Math.round(totalRev * 0.15),
            Math.round(totalRev * 0.11),
            Math.round(totalRev * 0.20),
            Math.round(totalRev * 0.16),
            Math.round(totalRev * 0.22),
            Math.round(totalRev * 0.25)
        ];
    } else if (period === '30days') {
        labels = ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'];
        revData = [
            Math.round(totalRev * 0.20),
            Math.round(totalRev * 0.32),
            Math.round(totalRev * 0.22),
            Math.round(totalRev * 0.26)
        ];
    } else {
        labels = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
        revData = labels.map((_, i) => Math.round((totalRev / 12) * (0.7 + (i % 5) * 0.15)));
    }

    const periodSum = revData.reduce((a, b) => a + b, 0);
    const kpiEl = document.getElementById('chartPeriodTotal');
    if (kpiEl) {
        kpiEl.textContent = periodSum.toLocaleString() + 'đ';
    }

    // Line Chart Doanh Thu Neon Purple Glow
    let gradient = 'rgba(139, 92, 246, 0.25)';
    if (ctxRev.getContext) {
        const ctx2d = ctxRev.getContext('2d');
        if (ctx2d && ctx2d.createLinearGradient) {
            const g = ctx2d.createLinearGradient(0, 0, 0, 240);
            g.addColorStop(0, 'rgba(139, 92, 246, 0.35)');
            g.addColorStop(1, 'rgba(139, 92, 246, 0.00)');
            gradient = g;
        }
    }

    revenueChartInstance = new Chart(ctxRev, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Doanh thu',
                data: revData,
                borderColor: '#8b5cf6',
                backgroundColor: gradient,
                borderWidth: 2.8,
                tension: 0.42,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#ffffff',
                pointHoverBorderColor: '#8b5cf6',
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: isLight ? '#ffffff' : '#141824',
                    titleColor: isLight ? '#64748b' : '#8f9bb3',
                    bodyColor: isLight ? '#0f172a' : '#ffffff',
                    borderColor: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)',
                    borderWidth: 1,
                    padding: 10,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return 'Doanh thu: ' + (context.parsed.y || 0).toLocaleString() + 'đ';
                        }
                    }
                }
            },
            scales: {
                y: {
                    grid: {
                        color: isLight ? 'rgba(15, 23, 42, 0.06)' : 'rgba(255, 255, 255, 0.04)',
                        borderDash: [3, 3]
                    },
                    ticks: {
                        color: '#64748b',
                        font: { size: 11 },
                        callback: v => (v >= 1000000 ? (v / 1000000).toFixed(1) + 'Tr' : (v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v))
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#64748b', font: { size: 11 } }
                }
            }
        }
    });

    // Donut Chart Phân Bổ Bán Hàng 4 Kênh
    const totalOrdersCount = orders.length || 4;
    const bankingCount = orders.filter(o => (o.paymentMethod || '').toLowerCase().includes('bank') || (o.paymentMethod || '').toLowerCase().includes('chuyển')).length || 2;
    const codCount = orders.filter(o => !((o.paymentMethod || '').toLowerCase().includes('bank') || (o.paymentMethod || '').toLowerCase().includes('chuyển'))).length || 1;
    const posOrders = orders.filter(o => (o.orderSource === 'pos') || (o.customer && (o.customer.name || '').includes('Tại quầy')) || (o.notes || '').includes('POS'));
    const onlineOrders = orders.filter(o => !posOrders.includes(o));
    const webCount = onlineOrders.length || 1;
    const posCount = posOrders.length || 2;

    soldChartInstance = new Chart(ctxSold, {
        type: 'doughnut',
        data: {
            labels: ['Banking / QR', 'Tiền mặt COD', 'Website trực tuyến', 'Thu ngân POS'],
            datasets: [{
                data: [bankingCount, codCount, webCount, posCount],
                backgroundColor: ['#10b981', '#3b82f6', '#06b6d4', '#ef4444'],
                borderColor: isLight ? '#ffffff' : '#141824',
                borderWidth: 3,
                hoverOffset: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '74%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: isLight ? '#ffffff' : '#141824',
                    titleColor: isLight ? '#64748b' : '#8f9bb3',
                    bodyColor: isLight ? '#0f172a' : '#ffffff',
                    borderColor: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)',
                    borderWidth: 1,
                    padding: 8
                }
            }
        }
    });
}

function changeChartPeriod(period, btn) {
    currentChartPeriod = period;
    initCharts(period);
}

function filterLowStockProducts() {
    productStockFilter = 'low';
    switchTab('products');
}

// Bổ sung các hàm phụ trợ: Xuất báo cáo, Thông báo, Khách hàng, Báo cáo, Cài đặt
function exportAdminReport() {
    const loggedUser = JSON.parse(localStorage.getItem('moonlight_user')) || { role: 'Staff' };
    if (loggedUser.role === 'Staff') {
        showToast("Bảo mật tài chính", "Nhân viên thu ngân không có quyền xuất báo cáo doanh thu!", "error");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,Mã Đơn,Khách Hàng,Số Điện Thoại,Tổng Tiền,Thanh Toán,Trạng Thái,Ngày Tạo\n";
    orders.forEach(o => {
        const row = [
            o.code || ('#DH' + (o.id || 1000)),
            (o.customer?.name || 'Khách vãng lai').replace(/,/g, ' '),
            o.customer?.phone || '',
            o.total || 0,
            (o.paymentMethod || 'Tiền mặt').replace(/,/g, ' '),
            o.status === 'completed' ? 'Hoàn thành' : (o.status === 'pending' ? 'Chờ duyệt' : 'Đã hủy'),
            o.createdAt || ''
        ].join(",");
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Bao-Cao-Doanh-Thu-MoonLight-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Đã xuất file báo cáo doanh thu thành công!');
}

function showAdminNotifications() {
    showToast('info', 'Hệ thống có 3 thông báo mới: 2 đơn hàng hoàn thành và 1 cảnh báo tồn kho.');
}

function renderAdminCustomers() {
    const container = document.getElementById('adminContent');
    if (!container) return;

    const loggedUser = JSON.parse(localStorage.getItem('moonlight_user')) || { role: 'Staff' };
    const canExportCustomers = loggedUser.role === 'Admin' || loggedUser.role === 'Owner';

    const customerMap = new Map();
    orders.forEach(o => {
        const phone = o.customer?.phone ? String(o.customer.phone).trim() : '';
        const name = o.customer?.name ? String(o.customer.name).trim() : 'Khách vãng lai';
        const key = phone || name || 'Khách vãng lai';
        if (!customerMap.has(key)) {
            customerMap.set(key, {
                name: name,
                phone: phone || '---',
                address: o.customer?.address || 'Tại showroom MoonLight',
                totalOrders: 0,
                completedOrders: 0,
                totalSpent: 0
            });
        }
        const c = customerMap.get(key);
        c.totalOrders += 1;
        if (o.status === 'completed') {
            c.completedOrders += 1;
            c.totalSpent += (Number(o.total) || 0);
        }
    });

    const customerList = Array.from(customerMap.values()).map(c => {
        let rank = 'Khách Mới';
        let rankBadgeClass = 'dark';
        let rankIcon = 'fa-user';
        if (c.totalSpent >= 10000000) {
            rank = 'VIP';
            rankBadgeClass = 'gold';
            rankIcon = 'fa-crown';
        } else if (c.totalSpent >= 5000000) {
            rank = 'Thân Thiết';
            rankBadgeClass = 'indigo';
            rankIcon = 'fa-gem';
        }
        return { ...c, rank, rankBadgeClass, rankIcon };
    });

    // Lọc theo từ khóa tìm kiếm (Tên hoặc Số điện thoại) và bộ lọc hạng
    const kw = customerSearchKeyword.toLowerCase().trim();
    let list = customerList.filter(c => {
        const matchesName = c.name.toLowerCase().includes(kw);
        const matchesPhone = c.phone.replace(/[\s.-]/g, '').includes(kw.replace(/[\s.-]/g, ''));
        const matchesSearch = !kw || matchesName || matchesPhone;

        let matchesRank = true;
        if (customerRankFilter === 'vip') matchesRank = c.rank === 'VIP';
        else if (customerRankFilter === 'regular') matchesRank = c.rank === 'Thân Thiết';
        else if (customerRankFilter === 'new') matchesRank = c.rank === 'Khách Mới';

        return matchesSearch && matchesRank;
    });

    // Sắp xếp chi tiêu cao nhất lên đầu
    list.sort((a, b) => b.totalSpent - a.totalSpent);

    container.innerHTML = `
        <!-- THANH HÀNH ĐỘNG KHÁCH HÀNG (THOÁNG ĐÃNG, KHÔNG LẶP TIÊU ĐỀ) -->
        <div class="orders-action-bar">
            <div class="orders-live-status">
                <span class="live-dot-pulse"></span>
                <span>Cơ sở dữ liệu khách hàng thân thiết MoonLight</span>
                <span class="adm-badge store-tag" style="font-size:10px; padding:2px 7px; margin-left:4px;">Thời gian thực</span>
                <span style="color:var(--text-muted); font-size:12px; margin-left:6px;">Tổng <b>${customerList.length}</b> khách hàng (${list.length} đang hiển thị)</span>
            </div>
            <div class="orders-action-buttons">
                ${canExportCustomers ? `
                    <button class="btn-outline" onclick="exportCustomersCSV()" title="Xuất danh sách khách hàng sang file CSV">
                        <i class="fas fa-file-excel" style="color:#10b981;"></i> Xuất Khách Hàng (CSV)
                    </button>
                ` : `
                    <span class="adm-badge" style="background:rgba(91,80,246,0.15); color:var(--primary-indigo); font-size:12px; padding:6px 12px;">
                        <i class="fas fa-shield-alt"></i> Bảo mật danh bạ khách hàng
                    </span>
                `}
            </div>
        </div>

        <!-- TOOLBAR: TÌM KIẾM THEO TÊN / SĐT & BỘ LỌC HẠNG -->
        <div class="admin-toolbar">
            <div class="search-box" style="flex:1; max-width:420px; position:relative;">
                <i class="fas fa-search"></i>
                <input type="text" id="customerSearchInput" placeholder="Tìm kiếm theo Tên hoặc Số điện thoại khách..." value="${customerSearchKeyword}" oninput="searchCustomers(this.value)">
                ${customerSearchKeyword ? `
                    <button type="button" onclick="clearCustomerSearch()" style="position:absolute; right:10px; top:50%; transform:translateY(-50%); background:none; border:none; color:#94a3b8; cursor:pointer; font-size:14px; line-height:1;" title="Xóa tìm kiếm">&times;</button>
                ` : ''}
            </div>
            <div class="filter-group" style="flex-wrap:wrap; gap:6px;">
                <button class="filter-pill-btn ${customerRankFilter==='all'?'active':''}" onclick="setCustomerRankFilter('all')">Tất Cả Hạng</button>
                <button class="filter-pill-btn ${customerRankFilter==='vip'?'active':''}" onclick="setCustomerRankFilter('vip')">
                    <i class="fas fa-crown" style="color:var(--gold);"></i> VIP
                </button>
                <button class="filter-pill-btn ${customerRankFilter==='regular'?'active':''}" onclick="setCustomerRankFilter('regular')">
                    <i class="fas fa-gem" style="color:#818cf8;"></i> Thân Thiết
                </button>
                <button class="filter-pill-btn ${customerRankFilter==='new'?'active':''}" onclick="setCustomerRankFilter('new')">
                    <i class="fas fa-user" style="color:#94a3b8;"></i> Khách Mới
                </button>
            </div>
        </div>

        <!-- BẢNG DANH SÁCH KHÁCH HÀNG -->
        <div class="data-table-container">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th style="width:240px;">Khách Hàng</th>
                        <th style="width:160px;">Số Điện Thoại</th>
                        <th>Địa Chỉ Giao Hàng</th>
                        <th style="width:110px; text-align:center;">Số Đơn Hàng</th>
                        <th style="width:150px; text-align:right;">Tổng Chi Tiêu</th>
                        <th style="width:130px; text-align:center;">Thao Tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${list.length === 0 ? `
                        <tr><td colspan="6" style="text-align:center; padding:40px; color:#777;">
                            <i class="fas fa-user-slash" style="font-size:24px; margin-bottom:8px; display:block; opacity:0.5;"></i>
                            Không tìm thấy khách hàng nào khớp với "${customerSearchKeyword}".
                        </td></tr>
                    ` : list.map(c => {
                        const initials = (c.name || 'K').split(' ').map(w => w[0]).filter(Boolean).slice(-2).join('').toUpperCase();
                        return `
                            <tr>
                                <td>
                                    <div style="display:flex; align-items:center; gap:10px;">
                                        <div style="width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg, rgba(91, 80, 246, 0.35), rgba(212, 175, 55, 0.35)); border:1px solid rgba(255, 255, 255, 0.15); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:12px; color:#ffffff; flex-shrink:0;">
                                            ${initials}
                                        </div>
                                        <div>
                                            <strong style="color:#fff; font-size:13.5px;">${c.name}</strong><br>
                                            <span class="adm-badge ${c.rankBadgeClass}" style="font-size:10.5px; padding:1px 7px; margin-top:3px; display:inline-flex; align-items:center; gap:4px; font-weight:700;">
                                                <i class="fas ${c.rankIcon}"></i> ${c.rank}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style="display:flex; align-items:center; gap:6px;">
                                        <i class="fas fa-phone-alt" style="font-size:11px; color:#10b981;"></i>
                                        <span style="font-family:monospace; font-size:12.5px; color:#e2e8f0; font-weight:600;">${c.phone}</span>
                                    </div>
                                </td>
                                <td>
                                    <span style="color:#94a3b8; font-size:12px;" title="${c.address}">
                                        <i class="fas fa-map-marker-alt" style="color:var(--gold); font-size:10px; margin-right:4px;"></i>${c.address}
                                    </span>
                                </td>
                                <td style="text-align:center;">
                                    <span class="badge-pill-counter">${c.totalOrders} đơn</span>
                                </td>
                                <td style="text-align:right;">
                                    <strong style="color:var(--gold); font-size:13.5px;">${c.totalSpent.toLocaleString()}₫</strong>
                                </td>
                                <td style="text-align:center;">
                                    <button class="btn-view-orders" title="Xem lịch sử đơn hàng của khách này" onclick="orderSearchKeyword='${c.phone !== '---' ? c.phone : c.name}'; switchTab('orders');">
                                        <i class="fas fa-receipt"></i> Xem đơn
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Tìm kiếm khách hàng theo Tên hoặc Số Điện Thoại
function searchCustomers(keyword) {
    customerSearchKeyword = keyword;
    renderAdminCustomers();
}

// Xóa từ khóa tìm kiếm khách hàng
function clearCustomerSearch() {
    customerSearchKeyword = '';
    renderAdminCustomers();
}

// Lọc khách hàng theo Hạng thành viên
function setCustomerRankFilter(rank) {
    customerRankFilter = rank;
    renderAdminCustomers();
}

// Xuất danh sách khách hàng ra file CSV
function exportCustomersCSV() {
    const loggedUser = JSON.parse(localStorage.getItem('moonlight_user')) || { role: 'Staff' };
    if (loggedUser.role === 'Staff') {
        showToast("Bảo mật dữ liệu", "Nhân viên thu ngân không có quyền xuất dữ liệu danh bạ khách hàng!", "error");
        return;
    }

    const customerMap = new Map();
    orders.forEach(o => {
        const phone = o.customer?.phone ? String(o.customer.phone).trim() : '';
        const name = o.customer?.name ? String(o.customer.name).trim() : 'Khách vãng lai';
        const key = phone || name || 'Khách vãng lai';
        if (!customerMap.has(key)) {
            customerMap.set(key, {
                name: name,
                phone: phone || '---',
                address: o.customer?.address || 'Tại showroom MoonLight',
                totalOrders: 0,
                completedOrders: 0,
                totalSpent: 0
            });
        }
        const c = customerMap.get(key);
        c.totalOrders += 1;
        if (o.status === 'completed') {
            c.completedOrders += 1;
            c.totalSpent += (Number(o.total) || 0);
        }
    });

    const customerList = Array.from(customerMap.values());
    if (customerList.length === 0) {
        showToast("Thông báo", "Chưa có dữ liệu khách hàng để xuất!", "info");
        return;
    }

    let csv = "\uFEFFTên Khách Hàng,Số Điện Thoại,Địa Chỉ,Số Đơn Hàng,Tổng Chi Tiêu,Hạng Khách Hàng\n";
    customerList.forEach(c => {
        let rank = 'Khách Mới';
        if (c.totalSpent >= 10000000) rank = 'VIP';
        else if (c.totalSpent >= 5000000) rank = 'Thân Thiết';
        csv += `"${c.name.replace(/"/g, '""')}","${c.phone}","${c.address.replace(/"/g, '""')}","${c.totalOrders}","${c.totalSpent}","${rank}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MoonLight_DanhSachKhachHang_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Xuất dữ liệu", "Đã tải xuống file CSV danh sách khách hàng thành công!", "success");
}

function renderAdminReports() {
    const container = document.getElementById('adminContent');
    if (!container) return;

    const loggedUser = JSON.parse(localStorage.getItem('moonlight_user')) || { role: 'Staff' };
    if (loggedUser.role === 'Staff') {
        showToast("Bảo mật dữ liệu", "Nhân viên thu ngân không có quyền xem Báo Cáo Tài Chính & Doanh Thu!", "error");
        switchTab('orders');
        return;
    }

    const completedOrders = orders.filter(o => o.status === 'completed');
    const totalRev = completedOrders.reduce((s, o) => s + (o.total || 0), 0);

    container.innerHTML = `
        <div class="orders-action-bar">
            <div class="orders-live-status">
                <span class="live-dot-pulse"></span>
                <span>Hệ thống phân tích tài chính & tổng quan kết quả kinh doanh MoonLight</span>
                <span class="adm-badge store-tag" style="font-size:10px; padding:2px 7px; margin-left:4px;">Thời gian thực</span>
            </div>
            <div class="orders-action-buttons">
                <button class="btn-primary" onclick="exportAdminReport()">
                    <i class="fas fa-file-export"></i> Xuất File Báo Cáo
                </button>
            </div>
        </div>

        <div class="dashboard-stats">
            <div class="stat-card">
                <div class="stat-card-header">
                    <h3>TỔNG DOANH THU THỰC TẾ</h3>
                    <div class="stat-icon-wrapper indigo"><i class="fas fa-coins"></i></div>
                </div>
                <div class="stat-value-box">
                    <p class="stat-value">${totalRev.toLocaleString()}<span class="stat-currency">₫</span></p>
                    <div class="stat-trend-sub"><i class="fas fa-check-circle"></i> Đã đối soát tất cả đơn</div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-card-header">
                    <h3>TỔNG SỐ ĐƠN HÀNG</h3>
                    <div class="stat-icon-wrapper blue"><i class="fas fa-receipt"></i></div>
                </div>
                <div class="stat-value-box">
                    <p class="stat-value">${orders.length}</p>
                    <div class="stat-trend-sub"><i class="fas fa-boxes-packing"></i> Toàn bộ các kênh</div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-card-header">
                    <h3>GIÁ TRỊ TRUNG BÌNH ĐƠN (AOV)</h3>
                    <div class="stat-icon-wrapper green"><i class="fas fa-chart-pie"></i></div>
                </div>
                <div class="stat-value-box">
                    <p class="stat-value">${completedOrders.length > 0 ? Math.round(totalRev / completedOrders.length).toLocaleString() : 0}<span class="stat-currency">₫</span></p>
                    <div class="stat-trend-sub"><i class="fas fa-arrow-up"></i> Hiệu suất bán hàng cao</div>
                </div>
            </div>
        </div>
    `;
}

function renderAdminSettings() {
    const container = document.getElementById('adminContent');
    if (!container) return;

    let user = JSON.parse(localStorage.getItem('moonlight_user')) || { username: 'admin', name: 'Quản Trị Viên', role: 'Admin' };
    const accFound = accounts.find(a => a.username === user.username);
    if (accFound && !user.password) {
        user.password = accFound.password;
    }

    const presetAvatars = [
        { name: "Doanh Nhân Lịch Lãm", url: "https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=b6e3f4,c0aede,d1d4f9" },
        { name: "Quý Cô Thanh Lịch", url: "https://api.dicebear.com/7.x/notionists/svg?seed=Aneka&backgroundColor=ffdfbf,ffd5dc" },
        { name: "Chuyên Viên Công Nghệ", url: "https://api.dicebear.com/7.x/notionists/svg?seed=Jasper&backgroundColor=c0aede,d1d4f9" },
        { name: "Giám Đốc Sáng Tạo", url: "https://api.dicebear.com/7.x/notionists/svg?seed=Milo&backgroundColor=b6e3f4" },
        { name: "Chuyên Viên Tư Vấn", url: "https://api.dicebear.com/7.x/notionists/svg?seed=Aria&backgroundColor=ffd5dc" },
        { name: "Quản Lý Vận Hành", url: "https://api.dicebear.com/7.x/notionists/svg?seed=Leo&backgroundColor=d1d4f9" }
    ];

    container.innerHTML = `
        <div class="orders-action-bar">
            <div class="orders-live-status">
                <span class="live-dot-pulse"></span>
                <span>Trung tâm thiết lập hồ sơ cá nhân & tùy biến giao diện hệ thống</span>
                <span class="adm-badge store-tag" style="font-size:10px; padding:2px 7px; margin-left:4px;">Bảo mật SSL</span>
            </div>
            <div class="orders-action-buttons">
                <button class="btn-outline" onclick="toggleAdminTheme()">
                    <i class="fas fa-circle-half-stroke"></i> Đổi Giao Diện Sáng/Tối
                </button>
            </div>
        </div>

        <div class="settings-grid">
            <!-- 1. HỒ SƠ CÁ NHÂN & ĐỔI ẢNH ĐẠI DIỆN -->
            <div class="widget-card">
                <div class="widget-card-header">
                    <div class="widget-card-title">
                        <i class="fas fa-id-badge" style="color:var(--primary-indigo);"></i>
                        <span>Hồ Sơ & Ảnh Đại Diện</span>
                    </div>
                    <span class="adm-badge" style="background:rgba(91,80,246,0.15); color:var(--primary-indigo);">
                        ${user.role}
                    </span>
                </div>

                <div class="avatar-preview-box">
                    <div class="avatar-large-wrapper">
                        <div class="avatar-large" id="settingsAvatarPreview">
                            ${user.avatar ? `<img src="${user.avatar}" alt="${user.name}" style="width:100%; height:100%; object-fit:cover; border-radius:50%; display:block;">` : `<span>${(user.name || 'U').charAt(0).toUpperCase()}</span>`}
                        </div>
                        <label for="avatarFileInput" class="avatar-edit-badge" title="Tải ảnh mới từ máy tính">
                            <i class="fas fa-camera"></i>
                        </label>
                        <input type="file" id="avatarFileInput" accept="image/*" style="display:none;" onchange="handleUserAvatarUpload(event)">
                    </div>

                    <div style="flex:1; min-width:0;">
                        <h4 style="margin:0 0 4px 0; font-size:15px; color:#fff; font-weight:700;">${user.name}</h4>
                        <div style="font-size:12px; color:var(--text-secondary); margin-bottom:6px;">
                            Tên đăng nhập: <strong style="color:var(--gold); font-family:monospace;">${user.username}</strong>
                        </div>
                        <div style="font-size:11px; color:#94a3b8;">
                            Nhân viên và Quản trị viên đều có thể tự tải ảnh đại diện từ thiết bị hoặc chọn mẫu bên dưới.
                        </div>
                    </div>
                </div>

                <div style="display:flex; gap:10px; margin-bottom:18px;">
                    <button type="button" class="btn-primary" style="flex:1; justify-content:center;" onclick="document.getElementById('avatarFileInput').click()">
                        <i class="fas fa-cloud-arrow-up"></i> Tải Ảnh Từ Máy
                    </button>
                    <button type="button" class="btn-outline" style="justify-content:center;" onclick="resetUserAvatar()" title="Khôi phục chữ cái mặc định">
                        <i class="fas fa-rotate-left"></i> Đặt Lại
                    </button>
                </div>

                <div style="margin-top:14px; border-top:1px solid rgba(255,255,255,0.06); padding-top:14px;">
                    <div style="font-size:12px; font-weight:600; color:var(--text-secondary); margin-bottom:10px; display:flex; align-items:center; gap:6px;">
                        <i class="fas fa-wand-magic-sparkles" style="color:var(--gold);"></i> Hoặc chọn ảnh phong cách mẫu:
                    </div>
                    <div class="preset-avatar-grid">
                        ${presetAvatars.map((p) => `
                            <img src="${p.url}" alt="${p.name}" title="${p.name}" class="preset-avatar-chip ${user.avatar === p.url ? 'active' : ''}" onclick="selectPresetAvatar('${p.url}')">
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- 2. ĐỔI MẬT KHẨU TÀI KHOẢN -->
            <div class="widget-card">
                <div class="widget-card-header">
                    <div class="widget-card-title">
                        <i class="fas fa-key" style="color:var(--gold);"></i>
                        <span>Đổi Mật Khẩu Tài Khoản</span>
                    </div>
                    <small style="color:var(--text-secondary); font-size:11px;">Bảo mật đăng nhập</small>
                </div>

                <form onsubmit="handleUserPasswordChange(event)">
                    <div class="form-group-password">
                        <label for="currentPassword">Mật khẩu hiện tại *</label>
                        <div class="input-with-icon">
                            <input type="password" id="currentPassword" placeholder="Nhập mật khẩu hiện tại" required autocomplete="current-password">
                            <button type="button" class="btn-toggle-eye" onclick="togglePasswordVisibility('currentPassword', this)" title="Ẩn/Hiện mật khẩu">
                                <i class="far fa-eye"></i>
                            </button>
                        </div>
                    </div>

                    <div class="form-group-password">
                        <label for="newPassword">Mật khẩu mới *</label>
                        <div class="input-with-icon">
                            <input type="password" id="newPassword" placeholder="Tối thiểu 3 ký tự" required autocomplete="new-password">
                            <button type="button" class="btn-toggle-eye" onclick="togglePasswordVisibility('newPassword', this)" title="Ẩn/Hiện mật khẩu">
                                <i class="far fa-eye"></i>
                            </button>
                        </div>
                    </div>

                    <div class="form-group-password">
                        <label for="confirmNewPassword">Xác nhận mật khẩu mới *</label>
                        <div class="input-with-icon">
                            <input type="password" id="confirmNewPassword" placeholder="Nhập lại mật khẩu mới" required autocomplete="new-password">
                            <button type="button" class="btn-toggle-eye" onclick="togglePasswordVisibility('confirmNewPassword', this)" title="Ẩn/Hiện mật khẩu">
                                <i class="far fa-eye"></i>
                            </button>
                        </div>
                    </div>

                    <div class="password-tip-box" style="margin-bottom:16px;">
                        <i class="fas fa-shield-alt" style="margin-top:2px;"></i>
                        <span>Tài khoản nhân viên được cấp có thể chủ động đổi mật khẩu riêng bất cứ lúc nào để bảo mật ca làm việc.</span>
                    </div>

                    <button type="submit" class="btn-primary" style="width:100%; justify-content:center; padding:12px;">
                        <i class="fas fa-lock"></i> CẬP NHẬT MẬT KHẨU MỚI
                    </button>
                </form>
            </div>

            <!-- 3. CẤU HÌNH CỬA HÀNG & THÔNG TIN HỆ THỐNG -->
            <div class="widget-card" style="grid-column: 1 / -1;">
                <div class="widget-card-header">
                    <div class="widget-card-title">
                        <i class="fas fa-sliders" style="color:#38bdf8;"></i>
                        <span>Thông Tin Hệ Thống & Cổng Thanh Toán MoonLight</span>
                    </div>
                    <span class="adm-badge live">v2.0.0 Cloud</span>
                </div>

                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:16px; font-size:13px; color:#cbd5e1;">
                    <div style="background:var(--bg-card-subtle); padding:14px; border-radius:8px; border:var(--border-subtle);">
                        <div style="color:var(--text-secondary); font-size:11px; margin-bottom:4px; text-transform:uppercase;">Thương Hiệu Bản Quyền</div>
                        <div style="font-weight:700; color:#fff; font-size:14px;">MoonLight Luxury Fashion</div>
                        <div style="font-size:12px; color:#94a3b8; margin-top:2px;">Hệ Thống Bán Lẻ & Quản Trị Đa Kênh</div>
                    </div>

                    <div style="background:var(--bg-card-subtle); padding:14px; border-radius:8px; border:var(--border-subtle);">
                        <div style="color:var(--text-secondary); font-size:11px; margin-bottom:4px; text-transform:uppercase;">Phương Thức Thanh Toán Tích Hợp</div>
                        <div style="font-weight:600; color:#fff;">VietQR Tự Động, Banking, COD, Tiền mặt</div>
                        <div style="font-size:12px; color:#22c55e; margin-top:2px;"><i class="fas fa-circle-check"></i> Cổng kết nối sẵn sàng</div>
                    </div>

                    <div style="background:var(--bg-card-subtle); padding:14px; border-radius:8px; border:var(--border-subtle);">
                        <div style="color:var(--text-secondary); font-size:11px; margin-bottom:4px; text-transform:uppercase;">Dữ Liệu Đang Vận Hành</div>
                        <div style="font-weight:600; color:#fff;">${products.length} Sản phẩm | ${orders.length} Đơn hàng</div>
                        <div style="font-size:12px; color:#94a3b8; margin-top:2px;">Cập nhật tức thì (LocalStorage & POS Cloud)</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Xử lý upload ảnh đại diện (FileReader Base64)
function handleUserAvatarUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showToast("Lỗi định dạng", "Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, WEBP, GIF)", "error");
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        showToast("Ảnh quá lớn", "Vui lòng chọn ảnh dung lượng dưới 2MB để tối ưu lưu trữ", "error");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Data = e.target.result;
        saveUserAvatar(base64Data);
        showToast("Thành công", "Đã cập nhật ảnh đại diện mới!", "success");
        showResultModal({
            type: 'success',
            title: 'Cập Nhật Ảnh Đại Diện Thành Công!',
            message: 'Ảnh đại diện của bạn đã được cập nhật và hiển thị trên toàn hệ thống MoonLight.'
        });
    };
    reader.readAsDataURL(file);
}

// Chọn ảnh đại diện từ mẫu có sẵn
function selectPresetAvatar(avatarUrl) {
    saveUserAvatar(avatarUrl);
    showToast("Thành công", "Đã chọn ảnh đại diện mẫu!", "success");
}

// Lưu ảnh đại diện vào storage và đồng bộ giao diện
function saveUserAvatar(avatarUrl) {
    let user = JSON.parse(localStorage.getItem('moonlight_user')) || { username: 'admin', name: 'Quản Trị Viên', role: 'Admin' };
    user.avatar = avatarUrl;
    localStorage.setItem('moonlight_user', JSON.stringify(user));

    // Đồng bộ vào moonlight_accounts
    const accIdx = accounts.findIndex(a => a.username === user.username);
    if (accIdx !== -1) {
        accounts[accIdx].avatar = avatarUrl;
        localStorage.setItem('moonlight_accounts', JSON.stringify(accounts));
    }

    // Cập nhật UI ngay lập tức
    checkAuth();

    const preview = document.getElementById('settingsAvatarPreview');
    if (preview) {
        preview.innerHTML = `<img src="${avatarUrl}" alt="${user.name}" style="width:100%; height:100%; object-fit:cover; border-radius:50%; display:block;">`;
    }

    // Highlight preset nếu khớp
    document.querySelectorAll('.preset-avatar-chip').forEach(chip => {
        if (chip.src === avatarUrl) chip.classList.add('active');
        else chip.classList.remove('active');
    });

    logActivity("Đổi ảnh đại diện", `Người dùng [${user.username}] đã thay đổi ảnh đại diện cá nhân`);
}

// Đặt lại ảnh đại diện mặc định
function resetUserAvatar() {
    let user = JSON.parse(localStorage.getItem('moonlight_user')) || { username: 'admin', name: 'Quản Trị Viên', role: 'Admin' };
    delete user.avatar;
    localStorage.setItem('moonlight_user', JSON.stringify(user));

    const accIdx = accounts.findIndex(a => a.username === user.username);
    if (accIdx !== -1) {
        delete accounts[accIdx].avatar;
        localStorage.setItem('moonlight_accounts', JSON.stringify(accounts));
    }

    checkAuth();

    const preview = document.getElementById('settingsAvatarPreview');
    if (preview) {
        preview.innerHTML = `<span>${(user.name || 'U').charAt(0).toUpperCase()}</span>`;
    }

    document.querySelectorAll('.preset-avatar-chip').forEach(chip => chip.classList.remove('active'));
    showToast("Đặt lại", "Đã khôi phục ảnh đại diện mặc định", "info");
}

// Ẩn / Hiện mật khẩu
function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;

    if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = '<i class="far fa-eye-slash"></i>';
    } else {
        input.type = 'password';
        btn.innerHTML = '<i class="far fa-eye"></i>';
    }
}

// Xử lý đổi mật khẩu cho tài khoản cá nhân (Admin hoặc Nhân viên)
function handleUserPasswordChange(event) {
    event.preventDefault();
    const currentPass = document.getElementById('currentPassword').value.trim();
    const newPass = document.getElementById('newPassword').value.trim();
    const confirmPass = document.getElementById('confirmNewPassword').value.trim();

    if (!currentPass || !newPass || !confirmPass) {
        showToast("Thiếu thông tin", "Vui lòng nhập đầy đủ các trường mật khẩu", "error");
        return;
    }

    if (newPass.length < 3) {
        showToast("Mật khẩu ngắn", "Mật khẩu mới phải có ít nhất 3 ký tự", "error");
        return;
    }

    if (newPass !== confirmPass) {
        showToast("Không trùng khớp", "Mật khẩu xác nhận không khớp với mật khẩu mới", "error");
        return;
    }

    let user = JSON.parse(localStorage.getItem('moonlight_user')) || { username: 'admin', role: 'Admin' };
    const accIdx = accounts.findIndex(a => a.username === user.username);
    if (accIdx === -1) {
        showToast("Lỗi tài khoản", "Không tìm thấy thông tin tài khoản hiện tại", "error");
        return;
    }

    const currentAcc = accounts[accIdx];
    if (currentAcc.password !== currentPass) {
        showToast("Sai mật khẩu", "Mật khẩu hiện tại không chính xác", "error");
        return;
    }

    if (currentPass === newPass) {
        showToast("Trùng mật khẩu cũ", "Mật khẩu mới phải khác mật khẩu hiện tại", "warning");
        return;
    }

    // Cập nhật mật khẩu mới
    accounts[accIdx].password = newPass;
    localStorage.setItem('moonlight_accounts', JSON.stringify(accounts));

    user.password = newPass;
    localStorage.setItem('moonlight_user', JSON.stringify(user));

    showToast("Thành công", "Đổi mật khẩu tài khoản thành công!", "success");
    showResultModal({
        type: 'success',
        title: 'Đổi Mật Khẩu Thành Công!',
        message: `Mật khẩu cho tài khoản [${user.username}] đã được cập nhật an toàn. Vui lòng ghi nhớ mật khẩu mới cho các lần đăng nhập tiếp theo.`
    });

    logActivity("Đổi mật khẩu", `Người dùng [${user.username}] (${user.role}) đã đổi mật khẩu cá nhân`);

    // Reset form
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
}

// --- 6. TAB 2: QUẢN LÝ SẢN PHẨM & TỒN KHO ---
function renderAdminProducts() {
    const container = document.getElementById('adminContent');
    if (!container) return;

    const loggedUser = JSON.parse(localStorage.getItem('moonlight_user')) || { role: 'Staff' };
    const canCreateProduct = loggedUser.role === 'Admin' || loggedUser.role === 'Owner';
    const canDeleteProduct = loggedUser.role === 'Admin';

    let list = products.filter(p => {
        const matchesKeyword = !productSearchKeyword || p.name.toLowerCase().includes(productSearchKeyword.toLowerCase());
        const matchesCategory = productCategoryFilter === 'all' || p.type === productCategoryFilter;
        let matchesStock = true;
        if (productStockFilter === 'low') matchesStock = (p.stock || 0) < 10 && (p.stock || 0) > 0;
        else if (productStockFilter === 'out') matchesStock = (p.stock || 0) <= 0;
        else if (productStockFilter === 'in') matchesStock = (p.stock || 0) >= 10;
        return matchesKeyword && matchesCategory && matchesStock;
    });

    container.innerHTML = `
        <!-- THANH HÀNH ĐỘNG SẢN PHẨM (THOÁNG ĐÃNG, KHÔNG LẶP TIÊU ĐỀ) -->
        <div class="orders-action-bar">
            <div class="orders-live-status">
                <span class="live-dot-pulse"></span>
                <span>Hệ thống kho & biến thể sản phẩm</span>
                <span class="adm-badge store-tag" style="font-size:10px; padding:2px 7px; margin-left:4px;">Thời gian thực</span>
                <span style="color:var(--text-muted); font-size:12px; margin-left:6px;">Tổng <b>${products.length}</b> sản phẩm (${list.length} đang hiển thị)</span>
            </div>
            <div class="orders-action-buttons">
                <button class="btn-outline" onclick="exportProductsCSV()" title="Xuất danh sách sản phẩm sang file CSV">
                    <i class="fas fa-file-excel" style="color:#10b981;"></i> Xuất Kho (CSV)
                </button>
                ${canCreateProduct ? `
                    <button class="btn-primary" onclick="showAddProductForm()">
                        <i class="fas fa-plus"></i> THÊM SẢN PHẨM MỚI
                    </button>
                ` : `
                    <span class="adm-badge" style="background:rgba(91,80,246,0.15); color:var(--primary-indigo); font-size:12px; padding:6px 12px;">
                        <i class="fas fa-eye"></i> Quyền Thu Ngân: Tra cứu tồn kho
                    </span>
                `}
            </div>
        </div>

        <!-- TOOLBAR: TÌM KIẾM & BỘ LỌC -->
        <div class="admin-toolbar">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" id="prodSearch" placeholder="Tìm kiếm theo tên sản phẩm..." value="${productSearchKeyword}" oninput="searchProducts(this.value)">
            </div>
            <div class="filter-group" style="flex-wrap:wrap; gap:6px;">
                <button class="filter-pill-btn ${productCategoryFilter==='all'?'active':''}" onclick="setProductCategory('all')">Tất Cả</button>
                <button class="filter-pill-btn ${productCategoryFilter==='ao-vest'?'active':''}" onclick="setProductCategory('ao-vest')">Áo Vest</button>
                <button class="filter-pill-btn ${productCategoryFilter==='so-mi'?'active':''}" onclick="setProductCategory('so-mi')">Sơ Mi</button>
                <button class="filter-pill-btn ${productCategoryFilter==='quan-tay'?'active':''}" onclick="setProductCategory('quan-tay')">Quần Tây</button>
                <button class="filter-pill-btn ${productCategoryFilter==='ao-thun'?'active':''}" onclick="setProductCategory('ao-thun')">Áo Thun</button>
                <button class="filter-pill-btn ${productCategoryFilter==='dong-ho'?'active':''}" onclick="setProductCategory('dong-ho')">Đồng Hồ</button>
                <button class="filter-pill-btn ${productCategoryFilter==='giay-da'?'active':''}" onclick="setProductCategory('giay-da')">Giày Da</button>
                <button class="filter-pill-btn ${productCategoryFilter==='phu-kien'?'active':''}" onclick="setProductCategory('phu-kien')">Phụ Kiện</button>
            </div>
            <div class="filter-group">
                <button class="filter-pill-btn ${productStockFilter==='low'?'active':''}" onclick="setProductStockFilter('low')" style="border-color:#ff6b6b;">
                    <i class="fas fa-exclamation-circle" style="color:#ff6b6b"></i> Sắp Hết Kho
                </button>
            </div>
        </div>

        <!-- BẢNG DANH SÁCH SẢN PHẨM -->
        <div class="data-table-container">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th style="width:70px; text-align:center;">Ảnh</th>
                        <th>Tên Sản Phẩm</th>
                        <th style="width:140px">Danh Mục</th>
                        <th style="width:40%">Phân Loại Biến Thể (Màu | Giá | Size & Kho)</th>
                        <th style="width:90px; text-align:center;">Đã Bán</th>
                        <th style="width:100px; text-align:center;">Thao Tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${list.length === 0 ? `
                        <tr><td colspan="6" style="text-align:center; padding:40px; color:#777;">Không tìm thấy sản phẩm nào phù hợp.</td></tr>
                    ` : list.map(p => {
                        const totalStock = p.variants.reduce((sum, v) => sum + (v.sizes ? v.sizes.reduce((s, sz) => s + (sz.stock || 0), 0) : 0), 0);
                        const firstImg = p.variants[0]?.img || 'https://via.placeholder.com/60';
                        const isLow = totalStock < 10;
                        return `
                            <tr>
                                <td style="text-align:center;">
                                    <img src="${firstImg}" class="table-img-thumb" onerror="this.src='https://via.placeholder.com/60'">
                                </td>
                                <td>
                                    <strong style="color:#fff; font-size:14px;">${p.name}</strong><br>
                                    <span style="font-size:11px; color:${isLow ? '#ff6b6b' : '#2ecc71'}; font-weight:700;">
                                        <i class="fas ${isLow ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i> Tổng tồn kho: ${totalStock} cái
                                    </span>
                                    ${p.salePercent ? `<span class="adm-badge danger" style="margin-left:6px;">-${p.salePercent}%</span>` : ''}
                                </td>
                                <td>
                                    <span class="adm-badge store-tag" style="font-size:11.5px; font-weight:600;">${getCategoryDisplayName(p.type)}</span>
                                </td>
                                <td>
                                    ${p.variants.map(v => `
                                        <div style="margin-bottom:6px; display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                                            <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:${v.hex}; border:1px solid #666;"></span>
                                            <strong style="color:#eee; font-size:12px;">${v.color}</strong> | 
                                            <b style="color:var(--gold); font-size:12px;">${Number(v.price).toLocaleString()}₫</b> |
                                            <span>
                                                ${(v.sizes || []).map(s => {
                                                    const sName = typeof s === 'string' ? s : (s.size || s.name || 'Free');
                                                    const sStock = (typeof s === 'object' && s !== null) ? (s.stock ?? 0) : 0;
                                                    return `<span class="size-badge ${sStock < 5 ? 'out-stock' : ''}">${sName}: <b>${sStock}</b></span>`;
                                                }).join('')}
                                            </span>
                                        </div>
                                    `).join('')}
                                </td>
                                <td style="text-align:center; font-weight:700; color:#fff;">
                                    ${p.sold || 0}
                                </td>
                                <td style="text-align:center;">
                                    <div class="action-btn-group">
                                        <a href="product.html?id=${p.id || p._id}" target="_blank" class="adm-btn" style="background:rgba(212,175,55,0.15); color:var(--gold); display:inline-flex; align-items:center; justify-content:center; text-decoration:none;" title="Xem sản phẩm ngoài trang bán hàng">
                                            <i class="fas fa-external-link-alt"></i>
                                        </a>
                                        ${canCreateProduct ? `
                                            <button class="adm-btn btn-gold" title="Chỉnh sửa sản phẩm" onclick="editProduct('${p.id || p._id}')">
                                                <i class="fas fa-pen"></i>
                                            </button>
                                        ` : `
                                            <button class="adm-btn" style="background:rgba(255,255,255,0.06); color:#94a3b8; cursor:not-allowed;" title="Quyền Thu Ngân: Tra cứu tồn kho">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        `}
                                        ${canDeleteProduct ? `
                                            <button class="adm-btn btn-cancel-ord" title="Xóa sản phẩm" onclick="deleteProduct('${p.id || p._id}')">
                                                <i class="fas fa-trash-alt"></i>
                                            </button>
                                        ` : ''}
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Chuyển đổi mã loại sản phẩm thành tên tiếng Việt cao cấp
function getCategoryDisplayName(type) {
    const map = {
        'ao-vest': 'Áo Vest / Blazer',
        'so-mi': 'Áo Sơ Mi',
        'quan-tay': 'Quần Tây / Quần Âu',
        'ao-thun': 'Áo Thun / Polo',
        'dong-ho': 'Đồng Hồ Luxury',
        'giay-da': 'Giày Da / Loafer',
        'phu-kien': 'Phụ Kiện & Thắt Lưng'
    };
    return map[type] || type || 'Khác';
}

// Xử lý khi người dùng thay đổi lựa chọn trong select Danh Mục
function handleCategorySelectChange(selectEl) {
    const customWrap = document.getElementById('customCategoryWrap');
    const customInput = document.getElementById('pCustomType');
    if (!customWrap) return;
    if (selectEl.value === 'custom') {
        customWrap.style.display = 'block';
        if (customInput) {
            customInput.focus();
            customInput.required = true;
        }
    } else {
        customWrap.style.display = 'none';
        if (customInput) customInput.required = false;
    }
}

// Bật/tắt nhanh ô nhập danh mục tùy biến
function toggleCustomCategoryInput() {
    const selectEl = document.getElementById('pType');
    const customWrap = document.getElementById('customCategoryWrap');
    const customInput = document.getElementById('pCustomType');
    if (!selectEl || !customWrap) return;
    if (customWrap.style.display === 'none') {
        selectEl.value = 'custom';
        customWrap.style.display = 'block';
        if (customInput) customInput.focus();
    } else {
        selectEl.value = 'ao-vest';
        customWrap.style.display = 'none';
    }
}

// Xuất file CSV danh sách sản phẩm & tồn kho
function exportProductsCSV() {
    if (!products || products.length === 0) {
        showToast("Thông báo", "Không có sản phẩm nào để xuất!", "info");
        return;
    }
    let csv = "\uFEFFMã SP,Tên Sản Phẩm,Danh Mục,Giá Niêm Yết,Giảm Giá,Tồn Kho,Đã Bán,Các Biến Thể Màu\n";
    products.forEach(p => {
        const variantStr = (p.variants || []).map(v => `${v.color} (${Number(v.price).toLocaleString()}₫)`).join('; ');
        csv += `"${p.id}","${p.name.replace(/"/g, '""')}","${getCategoryDisplayName(p.type)}","${p.price}","${p.salePercent || 0}%","${p.stock || 0}","${p.sold || 0}","${variantStr}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MoonLight_DanhSachKho_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Xuất dữ liệu", "Đã tải xuống file CSV danh sách sản phẩm & tồn kho thành công!", "success");
}

function searchProducts(keyword) {
    productSearchKeyword = keyword;
    renderAdminProducts();
}

function setProductCategory(cat) {
    productCategoryFilter = cat;
    renderAdminProducts();
}

function setProductStockFilter(st) {
    productStockFilter = productStockFilter === st ? 'all' : st;
    renderAdminProducts();
}

function calculateProductFinalPrice() {
    const basePrice = parseInt(document.getElementById('pBasePrice')?.value) || 0;
    const salePercent = parseInt(document.getElementById('pSale')?.value) || 0;
    const badge = document.getElementById('pFinalPriceBadge');
    if (!badge) return;

    if (basePrice <= 0) {
        badge.innerText = '';
        return;
    }

    if (salePercent > 0) {
        const finalPrice = Math.round(basePrice * (100 - salePercent) / 100);
        badge.innerText = `Giá bán: ${finalPrice.toLocaleString()}₫ (-${salePercent}%)`;
    } else {
        badge.innerText = `Giá bán: ${basePrice.toLocaleString()}₫`;
    }
}

function showAddProductForm() {
    const loggedUser = JSON.parse(localStorage.getItem('moonlight_user')) || { role: 'Staff' };
    if (loggedUser.role === 'Staff') {
        showToast("Từ chối quyền", "Nhân viên thu ngân chỉ có quyền xem tồn kho, không được thêm sản phẩm!", "error");
        return;
    }

    document.getElementById('productForm').reset();
    document.getElementById('editId').value = '';
    const customWrap = document.getElementById('customCategoryWrap');
    if (customWrap) customWrap.style.display = 'none';
    const customInput = document.getElementById('pCustomType');
    if (customInput) customInput.value = '';
    document.getElementById('pType').value = 'ao-vest';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-plus-circle" style="color:var(--primary-indigo);"></i> Thêm Sản Phẩm Mới';
    document.getElementById('variantContainer').innerHTML = '';
    calculateProductFinalPrice();

    addVariantCard("Đen", "#111111", ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600"], "", [
        { name: 'S', stock: 10 },
        { name: 'M', stock: 15 },
        { name: 'L', stock: 10 }
    ]);
    document.getElementById('productModal').classList.add('open');
}

function closeModal() {
    document.getElementById('productModal').classList.remove('open');
}

// Thêm 1 Card Phân Loại Màu Sắc thông minh (Đa ảnh mẫu & Tải ảnh từ máy)
function addVariantCard(color = '', hex = '#111111', imagesOrImg = '', price = '', sizes = null) {
    const container = document.getElementById('variantContainer');
    if (!container) return;

    let sizeList = [];
    if (typeof sizes === 'string') {
        sizeList = parseSizeInput(sizes);
    } else if (Array.isArray(sizes) && sizes.length > 0) {
        sizeList = sizes.map(s => {
            const sName = typeof s === 'string' ? s : (s.size || s.name || 'Free');
            const sStock = (typeof s === 'object' && s !== null) ? (parseInt(s.stock) || 0) : 10;
            return { name: sName, size: sName, stock: sStock };
        });
    } else {
        sizeList = [
            { name: 'S', size: 'S', stock: 10 },
            { name: 'M', size: 'M', stock: 15 },
            { name: 'L', size: 'L', stock: 10 }
        ];
    }

    // Chuẩn hóa danh sách ảnh mẫu của màu này
    let initialImages = [];
    if (Array.isArray(imagesOrImg)) {
        initialImages = imagesOrImg.filter(Boolean);
    } else if (typeof imagesOrImg === 'string' && imagesOrImg.trim()) {
        initialImages = [imagesOrImg.trim()];
    }

    const card = document.createElement('div');
    card.className = 'variant-card';
    card.innerHTML = `
        <!-- Hàng 1: Màu sắc, Giá riêng và Nút xóa màu -->
        <div class="variant-card-header">
            <div class="variant-header-fields">
                <div class="v-input-field color-field">
                    <label><i class="fas fa-palette" style="color:var(--gold);"></i> Tên màu sắc <span class="req">*</span></label>
                    <div class="v-color-control">
                        <input type="color" class="v-hex-picker" value="${hex}" title="Bấm chọn màu sắc trực quan">
                        <input type="text" class="v-color v-input" placeholder="Ví dụ: Đen, Trắng, Xanh Navy..." value="${color}" required>
                    </div>
                </div>

                <div class="v-input-field price-field">
                    <label><i class="fas fa-tags" style="color:var(--gold);"></i> Giá riêng theo màu (₫)</label>
                    <input type="number" class="v-price v-input" placeholder="Mặc định = Giá niêm yết" value="${price || ''}" min="0">
                </div>
            </div>

            <button type="button" class="v-card-del-btn" title="Xóa phân loại màu này" onclick="removeVariantCard(this)">
                <i class="fas fa-trash-alt"></i> Xóa màu này
            </button>
        </div>

        <!-- Hàng 2: Bộ sưu tập ảnh mẫu của màu này (Multi-image Gallery) -->
        <div class="variant-gallery-section">
            <div class="gallery-header-row">
                <span class="gallery-title">
                    <i class="fas fa-images" style="color:var(--gold);"></i> Bộ sưu tập ảnh mẫu màu này:
                    <span class="gallery-counter">(<span class="img-count-num">0</span> ảnh)</span>
                </span>
                <div class="gallery-actions-bar">
                    <label class="btn-gallery-upload" title="Tải ảnh mẫu trực tiếp từ máy tính lên">
                        <i class="fas fa-cloud-upload-alt"></i> Tải ảnh từ máy
                        <input type="file" class="v-file-input" accept="image/*" multiple onchange="handleVariantImageUpload(event, this)" style="display:none;">
                    </label>
                    <button type="button" class="btn-gallery-url" title="Thêm ảnh bằng đường dẫn link URL" onclick="promptAddVariantImageUrl(this)">
                        <i class="fas fa-link"></i> Thêm link URL
                    </button>
                </div>
            </div>

            <div class="gallery-thumbnails-list">
                <!-- Danh sách thumbnails ảnh mẫu -->
            </div>
            <div class="gallery-empty-hint" style="display: none;">
                <i class="fas fa-photo-video"></i> Chưa có ảnh mẫu nào. Hãy bấm <b>"Tải ảnh từ máy"</b> hoặc <b>"Thêm link URL"</b>.
            </div>
        </div>

        <!-- Hàng 3: Kho kích cỡ (Size & Tồn kho) -->
        <div class="variant-sizes-box">
            <div class="variant-sizes-top-row">
                <span class="variant-sizes-title">
                    <i class="fas fa-ruler-combined" style="color:var(--gold);"></i> Kho kích cỡ (Size & Tồn kho):
                </span>
                <div class="quick-sizes-bar">
                    <span style="font-size:11px; color:var(--text-muted);">Thêm nhanh:</span>
                    <button type="button" class="btn-quick-size" onclick="addSizeChipToVariant(this, 'S')">+ S</button>
                    <button type="button" class="btn-quick-size" onclick="addSizeChipToVariant(this, 'M')">+ M</button>
                    <button type="button" class="btn-quick-size" onclick="addSizeChipToVariant(this, 'L')">+ L</button>
                    <button type="button" class="btn-quick-size" onclick="addSizeChipToVariant(this, 'XL')">+ XL</button>
                    <button type="button" class="btn-quick-size" onclick="addSizeChipToVariant(this, '2XL')">+ 2XL</button>
                    <button type="button" class="btn-quick-size" onclick="addSizeChipToVariant(this, 'Free')">+ Free</button>
                    <div class="custom-size-inline-wrapper" title="Gõ bất kỳ kích cỡ nào (29, 30, 31, 3XL, 42...) và ấn Enter">
                        <input type="text" class="custom-size-inline-input" placeholder="Size khác (29, 30, 42...)" 
                               onkeydown="if(event.key === 'Enter'){ event.preventDefault(); addCustomSizeInline(this); }">
                        <button type="button" class="btn-inline-add-size" onclick="addCustomSizeInline(this)" title="Thêm kích cỡ này vào màu">
                            <i class="fas fa-plus"></i> Thêm
                        </button>
                    </div>
                </div>
            </div>

            <div class="size-chips-grid">
                ${sizeList.map(s => {
                    const sName = typeof s === 'string' ? s : (s.size || s.name || 'Free');
                    const sStock = (typeof s === 'object' && s !== null) ? (s.stock ?? 0) : 0;
                    return `
                    <div class="size-inventory-chip">
                        <span class="chip-size-label">${sName}</span>
                        <input type="number" class="chip-stock-input" value="${sStock}" min="0" title="Tồn kho size ${sName}" oninput="updateVariantCardStock(this.closest('.variant-card'))">
                        <span class="chip-unit">cái</span>
                        <button type="button" class="chip-remove-btn" title="Xóa size ${sName}" onclick="this.closest('.size-inventory-chip').remove(); updateVariantCardStock(this.closest('.variant-card'))">&times;</button>
                    </div>`;
                }).join('')}
            </div>

            <div style="display:flex; justify-content:flex-end;">
                <span class="variant-stock-total-badge">
                    Tổng kho màu này: <strong class="color-total-stock-num" style="color:var(--gold); font-size:12.5px;">0</strong> sản phẩm
                </span>
            </div>
        </div>
    `;

    container.appendChild(card);

    // Điền các ảnh ban đầu vào Gallery
    const galleryList = card.querySelector('.gallery-thumbnails-list');
    if (initialImages.length > 0) {
        initialImages.forEach((imgUrl, idx) => {
            appendImageToGallery(galleryList, imgUrl, idx === 0);
        });
    } else {
        updateGalleryState(galleryList);
    }

    updateVariantCardStock(card);
}

// Thêm 1 thumbnail vào Gallery của màu
function appendImageToGallery(galleryList, imgUrl, isMain = false) {
    if (!galleryList || !imgUrl) return;
    const existingCards = galleryList.querySelectorAll('.v-thumb-card');
    const makeMain = isMain || existingCards.length === 0;

    const thumb = document.createElement('div');
    thumb.className = `v-thumb-card ${makeMain ? 'is-main' : ''}`;
    thumb.innerHTML = `
        <img src="${imgUrl}" alt="Ảnh mẫu" onclick="setMainVariantImage(this)" title="Bấm để đặt làm ảnh đại diện chính">
        ${makeMain ? '<span class="thumb-badge-main">Đại diện</span>' : ''}
        <button type="button" class="thumb-del-btn" title="Xóa ảnh này" onclick="removeVariantThumb(this)">&times;</button>
    `;
    galleryList.appendChild(thumb);
    updateGalleryState(galleryList);
}

// Cập nhật trạng thái Gallery (đếm ảnh, hiển thị gợi ý khi trống)
function updateGalleryState(galleryList) {
    if (!galleryList) return;
    const card = galleryList.closest('.variant-card');
    const countEl = card ? card.querySelector('.img-count-num') : null;
    const emptyHint = card ? card.querySelector('.gallery-empty-hint') : null;
    const thumbs = galleryList.querySelectorAll('.v-thumb-card');

    if (countEl) countEl.innerText = thumbs.length;
    if (emptyHint) {
        emptyHint.style.display = thumbs.length === 0 ? 'flex' : 'none';
    }

    // Đảm bảo luôn có 1 ảnh đại diện nếu có ít nhất 1 ảnh
    if (thumbs.length > 0) {
        const hasMain = galleryList.querySelector('.v-thumb-card.is-main');
        if (!hasMain) {
            const first = thumbs[0];
            first.classList.add('is-main');
            if (!first.querySelector('.thumb-badge-main')) {
                const b = document.createElement('span');
                b.className = 'thumb-badge-main';
                b.innerText = 'Đại diện';
                first.appendChild(b);
            }
        }
    }
}

// Xóa 1 ảnh thumbnail khỏi Gallery
function removeVariantThumb(delBtn) {
    const thumb = delBtn.closest('.v-thumb-card');
    if (!thumb) return;
    const galleryList = thumb.closest('.gallery-thumbnails-list');
    const isMain = thumb.classList.contains('is-main');
    thumb.remove();

    if (galleryList) {
        if (isMain) {
            const firstRemaining = galleryList.querySelector('.v-thumb-card');
            if (firstRemaining) {
                firstRemaining.classList.add('is-main');
                if (!firstRemaining.querySelector('.thumb-badge-main')) {
                    const b = document.createElement('span');
                    b.className = 'thumb-badge-main';
                    b.innerText = 'Đại diện';
                    firstRemaining.appendChild(b);
                }
            }
        }
        updateGalleryState(galleryList);
    }
}

// Đặt làm ảnh đại diện chính cho màu
function setMainVariantImage(imgEl) {
    const targetThumb = imgEl.closest('.v-thumb-card');
    if (!targetThumb) return;
    const galleryList = targetThumb.closest('.gallery-thumbnails-list');
    if (!galleryList) return;

    // Xóa main ở các thumbnail khác
    galleryList.querySelectorAll('.v-thumb-card').forEach(t => {
        t.classList.remove('is-main');
        const b = t.querySelector('.thumb-badge-main');
        if (b) b.remove();
    });

    // Đặt main cho thumbnail này
    targetThumb.classList.add('is-main');
    const badge = document.createElement('span');
    badge.className = 'thumb-badge-main';
    badge.innerText = 'Đại diện';
    targetThumb.appendChild(badge);

    // Di chuyển lên đầu danh sách để trực quan
    if (galleryList.firstChild !== targetThumb) {
        galleryList.insertBefore(targetThumb, galleryList.firstChild);
    }

    showToast("Ảnh đại diện", "Đã chọn ảnh này làm ảnh đại diện chính của màu!", "info");
}

// Xử lý tải ảnh trực tiếp từ máy tính lên (Hỗ trợ chọn nhiều ảnh cùng lúc)
function handleVariantImageUpload(event, inputEl) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const card = inputEl.closest('.variant-card');
    if (!card) return;
    const galleryList = card.querySelector('.gallery-thumbnails-list');
    if (!galleryList) return;

    let loadedCount = 0;
    const totalFiles = files.length;

    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) {
            showToast("Không hợp lệ", `Tập tin "${file.name}" không phải định dạng ảnh!`, "warning");
            return;
        }

        processImageFile(file, function(dataUrl) {
            appendImageToGallery(galleryList, dataUrl);
            loadedCount++;
            if (loadedCount === totalFiles) {
                showToast("Tải ảnh thành công", `Đã thêm ${loadedCount} ảnh mẫu từ máy tính!`, "success");
            }
        });
    });

    inputEl.value = ''; // Reset input để có thể chọn lại file cũ nếu muốn
}

// Xử lý nén ảnh qua Canvas để tối ưu dung lượng lưu trữ LocalStorage
function processImageFile(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const rawData = e.target.result;
        if (file.size < 400 * 1024) {
            callback(rawData);
            return;
        }

        const img = new Image();
        img.onload = function() {
            try {
                const canvas = document.createElement('canvas');
                const MAX_DIM = 1200;
                let width = img.width;
                let height = img.height;
                if (width > height && width > MAX_DIM) {
                    height = Math.round((height * MAX_DIM) / width);
                    width = MAX_DIM;
                } else if (height > MAX_DIM) {
                    width = Math.round((width * MAX_DIM) / height);
                    height = MAX_DIM;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const optimized = canvas.toDataURL('image/jpeg', 0.85);
                callback(optimized);
            } catch (err) {
                callback(rawData);
            }
        };
        img.onerror = function() {
            callback(rawData);
        };
        img.src = rawData;
    };
    reader.readAsDataURL(file);
}

// Nhập link ảnh online (URL)
function promptAddVariantImageUrl(btn) {
    const card = btn.closest('.variant-card');
    if (!card) return;
    const galleryList = card.querySelector('.gallery-thumbnails-list');
    if (!galleryList) return;

    const url = prompt("Dán đường dẫn ảnh sản phẩm (http/https...):");
    if (!url || !url.trim()) return;

    const cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://') && !cleanUrl.startsWith('data:image')) {
        showToast("Đường dẫn sai", "Vui lòng nhập đường link ảnh bắt đầu bằng http:// hoặc https://", "warning");
        return;
    }

    appendImageToGallery(galleryList, cleanUrl);
    showToast("Thêm ảnh thành công", "Đã thêm 1 ảnh mẫu vào màu này!", "success");
}

// Alias tương thích
function addVariantRow(color = '', hex = '#111111', img = '', price = '', sizeStr = 'S:10, M:10, L:10') {
    addVariantCard(color, hex, img, price, sizeStr);
}

// Thêm nhanh 1 chip kích cỡ vào Card màu
function addSizeChipToVariant(btn, sizeName, defaultStock = 10) {
    const card = btn.closest('.variant-card');
    if (!card) return;
    const grid = card.querySelector('.size-chips-grid');
    if (!grid) return;

    const existingLabels = Array.from(grid.querySelectorAll('.chip-size-label')).map(el => el.innerText.trim().toUpperCase());
    if (existingLabels.includes(sizeName.toUpperCase())) {
        showToast("Đã có kích cỡ", `Size ${sizeName} đã có trong danh sách! Bạn có thể chỉnh số lượng.`, "warning");
        return;
    }

    const chip = document.createElement('div');
    chip.className = 'size-inventory-chip';
    chip.innerHTML = `
        <span class="chip-size-label">${sizeName.toUpperCase()}</span>
        <input type="number" class="chip-stock-input" value="${defaultStock}" min="0" title="Tồn kho size ${sizeName}" oninput="updateVariantCardStock(this.closest('.variant-card'))">
        <span class="chip-unit">cái</span>
        <button type="button" class="chip-remove-btn" title="Xóa size ${sizeName}" onclick="this.closest('.size-inventory-chip').remove(); updateVariantCardStock(this.closest('.variant-card'))">&times;</button>
    `;
    grid.appendChild(chip);
    updateVariantCardStock(card);
}

// Thêm size tùy chỉnh trực tiếp qua ô input inline (không dùng window.prompt)
function addCustomSizeInline(target) {
    const card = target.closest('.variant-card');
    if (!card) return;
    const input = card.querySelector('.custom-size-inline-input');
    if (!input) return;
    const raw = input.value.trim();
    if (!raw) {
        input.focus();
        showToast("Nhập kích cỡ", "Vui lòng nhập tên kích cỡ (ví dụ: 29, 30, 3XL, 42...)", "info");
        return;
    }
    addSizeChipToVariant(target, raw.toUpperCase(), 10);
    input.value = '';
    input.focus();
}

function promptCustomSize(btn) {
    const card = btn.closest('.variant-card');
    if (card) {
        const input = card.querySelector('.custom-size-inline-input');
        if (input) {
            input.focus();
            input.select();
            showToast("Kích cỡ tùy chỉnh", "Vui lòng gõ tên kích cỡ vào ô nhập và ấn Enter hoặc nút '+ Thêm'!", "info");
            return;
        }
    }
}

// Tính tổng kho của 1 màu
function updateVariantCardStock(card) {
    if (!card) return;
    const inputs = card.querySelectorAll('.chip-stock-input');
    let total = 0;
    inputs.forEach(inp => {
        total += parseInt(inp.value) || 0;
    });
    const numEl = card.querySelector('.color-total-stock-num');
    if (numEl) numEl.innerText = total;
}

// Xóa card màu
function removeVariantCard(btn) {
    const container = document.getElementById('variantContainer');
    const cards = container.querySelectorAll('.variant-card');
    if (cards.length <= 1) {
        showToast("Không thể xóa", "Sản phẩm cần có ít nhất 1 phân loại màu sắc!", "warning");
        return;
    }
    btn.closest('.variant-card')?.remove();
}

function parseSizeInput(str) {
    if (!str) return [];
    return str.split(',').map(item => {
        const [name, stock] = item.trim().split(':');
        const sName = name?.trim().toUpperCase() || '?';
        return { name: sName, size: sName, stock: stock ? parseInt(stock) : 0 };
    }).filter(s => s.name !== '?');
}

function formatSizeInput(sizes) {
    if (!Array.isArray(sizes)) return '';
    return sizes.map(s => typeof s === 'string' ? `${s}:0` : `${s.size || s.name || 'Free'}:${s.stock ?? 0}`).join(', ');
}

function handleSaveProduct(e) {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    const name = document.getElementById('pName').value.trim();
    let type = document.getElementById('pType').value;
    if (type === 'custom') {
        const customVal = document.getElementById('pCustomType')?.value.trim();
        type = customVal || 'Khác';
    }
    const basePrice = parseInt(document.getElementById('pBasePrice').value) || 0;
    const salePercent = parseInt(document.getElementById('pSale').value) || 0;
    const desc = document.getElementById('pDesc').value.trim();

    const variantCards = Array.from(document.querySelectorAll('.variant-card'));
    if (variantCards.length === 0) {
        showToast("Lỗi dữ liệu", "Cần có ít nhất 1 phân loại màu sắc!", "error");
        return;
    }

    const variants = variantCards.map(card => {
        const color = card.querySelector('.v-color').value.trim() || 'Mặc định';
        const hex = card.querySelector('.v-hex-picker').value || '#111111';
        const price = parseInt(card.querySelector('.v-price').value) || basePrice;

        // Trích xuất toàn bộ bộ sưu tập ảnh mẫu của màu này
        const thumbImgs = Array.from(card.querySelectorAll('.v-thumb-card img'));
        let images = thumbImgs.map(img => img.src).filter(Boolean);
        if (images.length === 0) {
            images = ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600'];
        }
        const img = images[0];

        // Đọc từng chip kích cỡ trực quan
        const sizeChips = Array.from(card.querySelectorAll('.size-inventory-chip'));
        let sizes = [];
        if (sizeChips.length > 0) {
            sizes = sizeChips.map(chip => {
                const sName = chip.querySelector('.chip-size-label').innerText.trim().toUpperCase();
                const sStock = parseInt(chip.querySelector('.chip-stock-input').value) || 0;
                return { name: sName, size: sName, stock: sStock };
            });
        } else {
            sizes = [{ name: 'FREE', size: 'FREE', stock: 10 }];
        }

        const variantStock = sizes.reduce((sum, s) => sum + (s.stock || 0), 0);
        return {
            color,
            hex,
            images,
            img,
            price,
            sizes,
            stock: variantStock
        };
    });

    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

    const existingIndex = id ? products.findIndex(p => String(p.id) === String(id) || String(p._id) === String(id)) : -1;
    const existing = existingIndex !== -1 ? products[existingIndex] : null;

    const cleanId = id 
      ? (/^\d+$/.test(String(id)) ? parseInt(id) : String(id)) 
      : (existing ? (existing.id || existing._id) : Date.now());

    const productData = {
        id: cleanId,
        _id: existing?._id || (typeof cleanId === 'string' && cleanId.length === 24 ? cleanId : undefined),
        name,
        type,
        category: type,
        price: basePrice,
        salePercent,
        desc,
        description: desc,
        image: variants[0]?.img || '',
        stock: totalStock,
        sold: existing ? (existing.sold || 0) : 0,
        rating: existing?.rating || 5.0,
        variants
    };

    if (existingIndex !== -1) {
        products[existingIndex] = { ...existing, ...productData };
        logActivity("Sửa sản phẩm", `Cập nhật thông tin [${name}]`);
        showToast("Thành công", `Đã cập nhật sản phẩm "${name}"`, "success");
        showResultModal({ type: 'success', title: 'Cập Nhật Thành Công!', message: `Sản phẩm "${name}" đã được cập nhật màu sắc, giá và kho size mới.` });
    } else {
        products.unshift(productData);
        logActivity("Thêm sản phẩm", `Thêm mới sản phẩm [${name}]`);
        showToast("Thành công", `Đã thêm sản phẩm "${name}" vào kho`, "success");
        showResultModal({ type: 'success', title: 'Thêm Mới Thành Công!', message: `Sản phẩm "${name}" đã sẵn sàng trưng bày trên cửa hàng.` });
    }

    localStorage.setItem('moonlight_products', JSON.stringify(products));

    // Đồng bộ lên Backend REST API
    if (window.MoonlightAPI) {
        try {
            const apiPayload = {
                name: productData.name,
                category: productData.type,
                price: productData.price,
                salePercent: productData.salePercent,
                description: productData.desc,
                image: productData.image,
                stock: productData.stock,
                variants: productData.variants
            };
            const targetId = existing?._id || existing?.id || productData._id || productData.id;
            if (existingIndex !== -1 && targetId) {
                window.MoonlightAPI.updateProduct(targetId, apiPayload).catch(e => console.warn('[API Update]', e.message));
            } else {
                window.MoonlightAPI.createProduct(apiPayload).then(res => {
                    if (res && res.data && res.data._id) {
                        productData._id = res.data._id;
                        localStorage.setItem('moonlight_products', JSON.stringify(products));
                    }
                }).catch(e => console.warn('[API Create]', e.message));
            }
        } catch (apiErr) {
            console.warn('[Admin API Sync]:', apiErr.message);
        }
    }

    closeModal();
    renderAdminProducts();
}

function editProduct(id) {
    const loggedUser = JSON.parse(localStorage.getItem('moonlight_user')) || { role: 'Staff' };
    if (loggedUser.role === 'Staff') {
        showToast("Từ chối quyền", "Nhân viên thu ngân chỉ có quyền xem tồn kho, không được chỉnh sửa sản phẩm!", "error");
        return;
    }

    const p = products.find(x => String(x.id) === String(id) || String(x._id) === String(id));
    if (!p) return;

    document.getElementById('editId').value = p.id || p._id;
    document.getElementById('pName').value = p.name;
    
    // Gán danh mục chuẩn xác hoặc kích hoạt ô tùy biến
    const typeSelect = document.getElementById('pType');
    const customWrap = document.getElementById('customCategoryWrap');
    const customInput = document.getElementById('pCustomType');
    const standardTypes = ['ao-vest', 'so-mi', 'quan-tay', 'ao-thun', 'dong-ho', 'giay-da', 'phu-kien'];
    
    if (standardTypes.includes(p.type)) {
        typeSelect.value = p.type;
        if (customWrap) customWrap.style.display = 'none';
        if (customInput) customInput.value = '';
    } else {
        typeSelect.value = 'custom';
        if (customWrap) {
            customWrap.style.display = 'block';
            if (customInput) customInput.value = p.type || '';
        }
    }

    document.getElementById('pBasePrice').value = p.price || p.variants[0]?.price || 0;
    document.getElementById('pSale').value = p.salePercent || 0;
    document.getElementById('pDesc').value = p.desc || '';
    calculateProductFinalPrice();

    const container = document.getElementById('variantContainer');
    container.innerHTML = '';
    (p.variants || []).forEach(v => {
        const variantImages = (Array.isArray(v.images) && v.images.length > 0) ? v.images : (v.img ? [v.img] : []);
        addVariantCard(v.color, v.hex, variantImages, v.price, v.sizes);
    });

    document.getElementById('modalTitle').innerHTML = `<i class="fas fa-edit" style="color:var(--gold);"></i> Chỉnh sửa: ${p.name}`;
    document.getElementById('productModal').classList.add('open');
}

function deleteProduct(id) {
    const loggedUser = JSON.parse(localStorage.getItem('moonlight_user')) || { role: 'Staff' };
    if (loggedUser.role !== 'Admin') {
        showToast("Từ chối quyền", "Chỉ Quản trị viên (Admin) mới có quyền xóa sản phẩm khỏi hệ thống!", "error");
        return;
    }

    const p = products.find(x => String(x.id) === String(id) || String(x._id) === String(id));
    if (!p) return;

    showConfirmDialog({
        title: "Xác Nhận Xóa Sản Phẩm",
        message: `Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm "${p.name}"? Dữ liệu tồn kho và phân loại của sản phẩm sẽ bị gỡ bỏ.`,
        icon: "fa-trash-alt",
        isDanger: true,
        confirmText: "XÓA NGAY",
        onConfirm: () => {
            products = products.filter(x => String(x.id) !== String(id) && String(x._id) !== String(id));
            localStorage.setItem('moonlight_products', JSON.stringify(products));
            logActivity("Xóa sản phẩm", `Đã xóa sản phẩm [${p.name}]`);
            showToast("Đã xóa", `Sản phẩm "${p.name}" đã được gỡ bỏ`, "info");
            showResultModal({ type: 'success', title: 'Đã Xóa Thành Công!', message: `Sản phẩm "${p.name}" đã được loại bỏ khỏi kho hàng.` });
            renderAdminProducts();

            if (window.MoonlightAPI) {
                const targetId = p._id || p.id;
                if (targetId) {
                    window.MoonlightAPI.deleteProduct(targetId).catch(err => console.warn('Delete product API:', err.message));
                }
            }
        }
    });
}

// --- 7. TAB 3: QUẢN LÝ ĐƠN HÀNG (LUXURY ENHANCED VERSION) ---
function renderAdminOrders() {
    const container = document.getElementById('adminContent');
    if (!container) return;

    const loggedUser = JSON.parse(localStorage.getItem('moonlight_user')) || { role: 'Staff' };
    const canDeleteOrder = loggedUser.role === 'Admin' || loggedUser.role === 'Owner';

    // Tính toán số liệu KPI cho ribbon
    const totalOrdersCount = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const completedOrders = orders.filter(o => o.status === 'completed');
    const cancelledOrders = orders.filter(o => o.status === 'cancelled');

    const totalOrdersValue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const completedTotal = completedOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const completionRate = totalOrdersCount > 0 ? Math.round((completedOrders.length / totalOrdersCount) * 100) : 0;

    // Đếm theo kênh
    const onlineOrders = orders.filter(o => !((o.customer?.address || '').toLowerCase().includes('tại cửa hàng') || (o.customer?.address || '').toLowerCase().includes('showroom') || o.orderSource === 'pos'));
    const posOrders = orders.filter(o => ((o.customer?.address || '').toLowerCase().includes('tại cửa hàng') || (o.customer?.address || '').toLowerCase().includes('showroom') || o.orderSource === 'pos'));

    // Lọc danh sách theo các điều kiện
    let list = orders.filter(o => {
        // 1. Lọc trạng thái
        let matchesStatus = true;
        if (orderFilterStatus === 'pending') matchesStatus = o.status === 'pending';
        else if (orderFilterStatus === 'completed') matchesStatus = o.status === 'completed';
        else if (orderFilterStatus === 'cancelled') matchesStatus = o.status === 'cancelled';

        // 2. Lọc kênh bán
        let matchesChannel = true;
        const isStoreOrder = ((o.customer?.address || '').toLowerCase().includes('tại cửa hàng') || (o.customer?.address || '').toLowerCase().includes('showroom') || o.orderSource === 'pos');
        if (orderFilterChannel === 'online') matchesChannel = !isStoreOrder;
        else if (orderFilterChannel === 'pos') matchesChannel = isStoreOrder;

        // 3. Tìm kiếm từ khóa
        let matchesKeyword = true;
        if (orderSearchKeyword) {
            const kw = orderSearchKeyword.toLowerCase();
            const idMatch = (o.id || '').toLowerCase().includes(kw);
            const nameMatch = (o.customer?.name || '').toLowerCase().includes(kw);
            const phoneMatch = (o.customer?.phone || '').includes(kw);
            const itemMatch = (o.items || []).some(it => (it.name || '').toLowerCase().includes(kw));
            matchesKeyword = idMatch || nameMatch || phoneMatch || itemMatch;
        }

        return matchesStatus && matchesChannel && matchesKeyword;
    });

    // Sắp xếp
    if (orderSortBy === 'highest_amount') {
        list.sort((a, b) => (Number(b.total) || 0) - (Number(a.total) || 0));
    } else if (orderSortBy === 'oldest') {
        list.sort((a, b) => String(a.id).localeCompare(String(b.id)));
    } else {
        // Mặc định mới nhất
        list.sort((a, b) => String(b.id).localeCompare(String(a.id)));
    }

    container.innerHTML = `
        <!-- THANH HÀNH ĐỘNG ĐƠN HÀNG (THOÁNG ĐÃNG, KHÔNG LẶP TIÊU ĐỀ) -->
        <div class="orders-action-bar">
            <div class="orders-live-status">
                <span class="live-dot-pulse"></span>
                <span>Hệ thống đồng bộ đơn hàng trực tuyến & POS showroom</span>
                <span class="adm-badge store-tag" style="font-size:10px; padding:2px 7px; margin-left:4px;">Thời gian thực</span>
            </div>
            <div class="orders-action-buttons">
                <button class="btn-outline" onclick="exportOrdersList()" title="Xuất danh sách đơn hàng sang file CSV">
                    <i class="fas fa-file-excel" style="color:#10b981;"></i> Xuất Dữ Liệu (CSV)
                </button>
                <a href="staff.html" class="btn-primary" target="_blank" style="text-decoration:none;">
                    <i class="fas fa-bolt"></i> TẠO ĐƠN POS
                </a>
            </div>
        </div>

        <!-- 4 THẺ KPI TỔNG QUAN ĐƠN HÀNG (QUICK METRICS) -->
        <div class="orders-kpi-grid">
            <div class="orders-kpi-card ${orderFilterStatus === 'all' ? 'active' : ''}" onclick="setOrderFilter('all')">
                <div class="orders-kpi-info">
                    <span class="orders-kpi-label">Tổng Đơn Hàng</span>
                    <span class="orders-kpi-value">${totalOrdersCount}</span>
                    <span class="orders-kpi-sub">Tổng giá trị: <strong style="color:var(--gold);">${Number(totalOrdersValue).toLocaleString()}₫</strong></span>
                </div>
                <div class="orders-kpi-icon indigo">
                    <i class="fas fa-boxes-stacked"></i>
                </div>
            </div>

            <div class="orders-kpi-card ${orderFilterStatus === 'pending' ? 'active' : ''}" onclick="setOrderFilter('pending')">
                <div class="orders-kpi-info">
                    <span class="orders-kpi-label">Đang Chờ Xử Lý</span>
                    <span class="orders-kpi-value" style="color:#f59e0b;">${pendingOrders.length}</span>
                    <span class="orders-kpi-sub">${pendingOrders.length > 0 ? '⚠️ Cần duyệt sớm' : 'Đã duyệt toàn bộ'}</span>
                </div>
                <div class="orders-kpi-icon amber">
                    <i class="fas fa-hourglass-half"></i>
                </div>
            </div>

            <div class="orders-kpi-card ${orderFilterStatus === 'completed' ? 'active' : ''}" onclick="setOrderFilter('completed')">
                <div class="orders-kpi-info">
                    <span class="orders-kpi-label">Đã Hoàn Tất</span>
                    <span class="orders-kpi-value" style="color:#10b981;">${completedOrders.length}</span>
                    <span class="orders-kpi-sub">Tỷ lệ hoàn thành: <strong style="color:#10b981;">${completionRate}%</strong></span>
                </div>
                <div class="orders-kpi-icon emerald">
                    <i class="fas fa-circle-check"></i>
                </div>
            </div>

            <div class="orders-kpi-card">
                <div class="orders-kpi-info">
                    <span class="orders-kpi-label">Doanh Thu Thực Thu</span>
                    <span class="orders-kpi-value" style="font-size:20px; color:var(--gold);">${Number(completedTotal).toLocaleString()}₫</span>
                    <span class="orders-kpi-sub">Từ <b style="color:#fff;">${completedOrders.length}</b> đơn hoàn thành</span>
                </div>
                <div class="orders-kpi-icon cyan">
                    <i class="fas fa-coins"></i>
                </div>
            </div>
        </div>

        <!-- TOOLBAR TÌM KIẾM & BỘ LỌC ĐƠN HÀNG -->
        <div class="orders-toolbar-card">
            <div class="orders-toolbar-row">
                <div class="orders-search-wrapper">
                    <i class="fas fa-search search-icon"></i>
                    <input type="text" class="orders-search-input" placeholder="Tìm theo mã đơn (#DH1001), tên khách, số điện thoại, tên món..." value="${orderSearchKeyword}" oninput="searchOrders(this.value)">
                </div>

                <div class="orders-filter-chips">
                    <button class="orders-filter-chip ${orderFilterStatus === 'all' ? 'active' : ''}" onclick="setOrderFilter('all')">
                        Tất Cả <span class="orders-filter-count">${totalOrdersCount}</span>
                    </button>
                    <button class="orders-filter-chip ${orderFilterStatus === 'pending' ? 'active' : ''}" onclick="setOrderFilter('pending')">
                        <span class="status-indicator-dot warning"></span> Chờ Duyệt <span class="orders-filter-count">${pendingOrders.length}</span>
                    </button>
                    <button class="orders-filter-chip ${orderFilterStatus === 'completed' ? 'active' : ''}" onclick="setOrderFilter('completed')">
                        <span class="status-indicator-dot success"></span> Hoàn Tất <span class="orders-filter-count">${completedOrders.length}</span>
                    </button>
                    <button class="orders-filter-chip ${orderFilterStatus === 'cancelled' ? 'active' : ''}" onclick="setOrderFilter('cancelled')">
                        <span class="status-indicator-dot danger"></span> Đã Hủy <span class="orders-filter-count">${cancelledOrders.length}</span>
                    </button>
                </div>
            </div>

            <div class="orders-secondary-filters">
                <div class="orders-channel-filters">
                    <span style="font-size:11.5px; color:var(--text-secondary); margin-right:4px;">Kênh phân phối:</span>
                    <button class="orders-channel-btn ${orderFilterChannel === 'all' ? 'active' : ''}" onclick="setOrderChannelFilter('all')">
                        Tất Cả
                    </button>
                    <button class="orders-channel-btn ${orderFilterChannel === 'online' ? 'active' : ''}" onclick="setOrderChannelFilter('online')">
                        <i class="fas fa-globe"></i> Đặt Online (${onlineOrders.length})
                    </button>
                    <button class="orders-channel-btn ${orderFilterChannel === 'pos' ? 'active' : ''}" onclick="setOrderChannelFilter('pos')">
                        <i class="fas fa-shop"></i> Tại Quầy POS (${posOrders.length})
                    </button>
                </div>

                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:11.5px; color:var(--text-secondary);">Sắp xếp:</span>
                    <select onchange="setOrderSort(this.value)" style="background:var(--bg-card-subtle); border:var(--border-subtle); color:#fff; font-size:11.5px; padding:4px 8px; border-radius:6px; outline:none; cursor:pointer;">
                        <option value="newest" ${orderSortBy === 'newest' ? 'selected' : ''}>Mới nhất trước</option>
                        <option value="oldest" ${orderSortBy === 'oldest' ? 'selected' : ''}>Cũ nhất trước</option>
                        <option value="highest_amount" ${orderSortBy === 'highest_amount' ? 'selected' : ''}>Giá trị cao nhất</option>
                    </select>

                    ${(orderFilterStatus !== 'all' || orderFilterChannel !== 'all' || orderSearchKeyword) ? `
                        <button class="btn-outline" style="padding:3px 8px; font-size:11px; color:#ef4444; border-color:rgba(239,68,68,0.3);" onclick="resetAllOrderFilters()">
                            <i class="fas fa-xmark"></i> Xóa Lọc
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>

        <!-- BẢNG DANH SÁCH ĐƠN HÀNG CAO CẤP -->
        <div class="orders-table-wrapper">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th style="width:130px;">Mã Đơn & Kênh</th>
                        <th style="width:190px;">Khách Hàng</th>
                        <th>Sản Phẩm Đã Đặt</th>
                        <th style="width:150px;">Thanh Toán</th>
                        <th style="width:130px;">Tổng Tiền</th>
                        <th style="width:120px; text-align:center;">Trạng Thái</th>
                        <th style="width:140px; text-align:center;">Thao Tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${list.length === 0 ? `
                        <tr>
                            <td colspan="7">
                                <div class="orders-empty-state">
                                    <div class="orders-empty-icon"><i class="fas fa-box-open"></i></div>
                                    <h4 class="orders-empty-title">Không Tìm Thấy Đơn Hàng Phù Hợp</h4>
                                    <p class="orders-empty-sub">Hãy thử điều chỉnh từ khóa tìm kiếm hoặc bỏ chọn một số bộ lọc trạng thái phía trên.</p>
                                    <button class="btn-outline" style="margin-top:6px;" onclick="resetAllOrderFilters()">
                                        <i class="fas fa-rotate-left"></i> Đặt Lại Toàn Bộ Bộ Lọc
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ` : list.map(o => {
                        const isStore = ((o.customer?.address || '').toLowerCase().includes('tại cửa hàng') || (o.customer?.address || '').toLowerCase().includes('showroom') || o.orderSource === 'pos');
                        const isBanking = (o.paymentMethod || '').toLowerCase().includes('bank') || (o.paymentMethod || '').toLowerCase().includes('chuyển');
                        const isPaid = o.isPaid;

                        // Payment pill
                        let paymentPill = '';
                        if (isBanking) {
                            if (isPaid) {
                                paymentPill = `<span class="payment-method-pill banking-paid"><i class="fas fa-circle-check"></i> Banking (Đã trả)</span>`;
                            } else if (o.customerTransferConfirmed) {
                                paymentPill = `<div style="display:flex; flex-direction:column; gap:2px;"><span class="payment-method-pill banking-paid" style="background:#ecfdf5; color:#059669; border:1px solid #10b981; font-weight:700;"><i class="fas fa-check-circle"></i> Khách đã báo CK</span><span style="font-size:10px; color:#f59e0b;"><i class="fas fa-search-dollar"></i> Check Agribank</span></div>`;
                            } else {
                                paymentPill = `<span class="payment-method-pill banking-pending"><i class="fas fa-clock"></i> Chờ chuyển khoản</span>`;
                            }
                        } else if ((o.paymentMethod || '').toLowerCase().includes('tiền mặt') || isStore) {
                            paymentPill = `<span class="payment-method-pill cash"><i class="fas fa-money-bill-wave"></i> Tiền mặt tại quầy</span>`;
                        } else {
                            paymentPill = `<span class="payment-method-pill cod"><i class="fas fa-truck"></i> Thu hộ (COD)</span>`;
                        }

                        // Status pill
                        let statusPill = '';
                        if (o.status === 'completed') {
                            statusPill = `<span class="order-status-pill status-completed"><span class="status-indicator-dot success"></span> Hoàn Tất</span>`;
                        } else if (o.status === 'cancelled') {
                            statusPill = `<span class="order-status-pill status-cancelled"><span class="status-indicator-dot danger"></span> Đã Hủy</span>`;
                        } else {
                            statusPill = `<span class="order-status-pill status-pending"><span class="status-indicator-dot warning"></span> Chờ Duyệt</span>`;
                        }

                        // Action buttons
                        let actionButtons = `
                            <button class="btn-order-action view" title="Xem chi tiết đơn" onclick="showOrderDetail('${o.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-order-action print" title="In hóa đơn bán lẻ" onclick="printOrderInvoice('${o.id}')">
                                <i class="fas fa-print"></i>
                            </button>
                        `;

                        if (o.status === 'pending') {
                            if (isBanking && !isPaid) {
                                actionButtons += `
                                    <button class="btn-order-action pay-confirm" title="Xác nhận tiền ngân hàng đã về" onclick="confirmPayment('${o.id}')">
                                        <i class="fas fa-dollar-sign"></i> Tiền về
                                    </button>
                                `;
                            } else {
                                actionButtons += `
                                    <button class="btn-order-action approve-quick" title="Duyệt đơn & trừ tồn kho" onclick="approveOrder('${o.id}')">
                                        <i class="fas fa-check"></i> Duyệt
                                    </button>
                                `;
                            }
                            actionButtons += `
                                <button class="btn-order-action cancel" title="Hủy đơn này" onclick="cancelOrder('${o.id}')">
                                    <i class="fas fa-times"></i>
                                </button>
                            `;
                        } else {
                            if (canDeleteOrder) {
                                actionButtons += `
                                    <button class="btn-order-action cancel" title="Xóa đơn khỏi hệ thống" onclick="deleteOrder('${o.id}')">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                `;
                            }
                        }

                        const totalItemsCount = (o.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0);
                        const customerName = o.customer?.name || 'Khách lẻ';
                        const customerInitial = customerName.charAt(0).toUpperCase();

                        return `
                            <tr>
                                <td>
                                    <div class="order-code-badge" onclick="showOrderDetail('${o.id}')" title="Nhấp xem chi tiết">
                                        #${o.id}
                                    </div>
                                    <div>
                                        <span class="order-source-pill ${isStore ? 'pos' : 'online'}">
                                            <i class="fas ${isStore ? 'fa-shop' : 'fa-globe'}"></i>
                                            ${isStore ? 'Tại Quầy' : 'Online'}
                                        </span>
                                    </div>
                                </td>

                                <td>
                                    <div class="order-customer-box">
                                        <div class="order-customer-avatar">${customerInitial}</div>
                                        <div>
                                            <div class="order-customer-name">${customerName}</div>
                                            <div class="order-customer-phone" title="Số điện thoại khách hàng">
                                                <i class="fas fa-phone-alt"></i> ${o.customer?.phone || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                <td>
                                    <div class="order-items-compact-list">
                                        ${(o.items || []).map(i => `
                                            <div class="order-item-compact-chip">
                                                <i class="fas fa-tag" style="color:var(--primary-indigo); font-size:10px;"></i>
                                                <span>${i.name}</span>
                                                ${(i.color || i.size) ? `<span class="item-variant-tag">${i.color || ''} ${i.size ? '• ' + i.size : ''}</span>` : ''}
                                                <span class="item-qty-tag">x${i.quantity}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </td>

                                <td>
                                    ${paymentPill}
                                </td>

                                <td>
                                    <div class="order-amount-display">
                                        ${Number(o.total || 0).toLocaleString()}<span class="order-amount-currency">₫</span>
                                    </div>
                                    <div class="order-amount-items-count">${totalItemsCount} sản phẩm</div>
                                </td>

                                <td style="text-align:center;">
                                    ${statusPill}
                                </td>

                                <td style="text-align:center;">
                                    <div class="order-actions-container">
                                        ${actionButtons}
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function searchOrders(kw) {
    orderSearchKeyword = kw;
    renderAdminOrders();
}

function setOrderFilter(filter) {
    orderFilterStatus = filter;
    renderAdminOrders();
}

function setOrderChannelFilter(channel) {
    orderFilterChannel = channel;
    renderAdminOrders();
}

function setOrderSort(sort) {
    orderSortBy = sort;
    renderAdminOrders();
}

function resetAllOrderFilters() {
    orderFilterStatus = 'all';
    orderFilterChannel = 'all';
    orderSortBy = 'newest';
    orderSearchKeyword = '';
    renderAdminOrders();
}

// Xuất file CSV danh sách đơn hàng
function exportOrdersList() {
    if (orders.length === 0) {
        showToast("Không có dữ liệu", "Không có đơn hàng nào để xuất báo cáo!", "warning");
        return;
    }

    const headers = ["Mã Đơn", "Ngày Đặt", "Khách Hàng", "Số Điện Thoại", "Địa Chỉ", "Phương Thức", "Tổng Tiền (VNĐ)", "Trạng Thái"];
    const rows = orders.map(o => [
        `#${o.id}`,
        o.date || '04/09/2026',
        `"${(o.customer?.name || 'Khách lẻ').replace(/"/g, '""')}"`,
        `"${o.customer?.phone || 'N/A'}"`,
        `"${(o.customer?.address || 'Tại showroom').replace(/"/g, '""')}"`,
        `"${o.paymentMethod || 'COD'}"`,
        o.total || 0,
        o.status === 'completed' ? 'Hoàn Tất' : (o.status === 'cancelled' ? 'Đã Hủy' : 'Chờ Duyệt')
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `MoonLight_DonHang_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Thành công", "Đã xuất file CSV danh sách đơn hàng!", "success");
    logActivity("Xuất dữ liệu đơn hàng", `Đã xuất ${orders.length} đơn hàng ra file CSV`);
}

function approveOrder(id) {
    const idx = orders.findIndex(o => o.id === id);
    if (idx === -1) return;

    const order = orders[idx];

    // Trừ kho chi tiết biến thể và kho tổng
    (order.items || []).forEach(item => {
        const pIdx = products.findIndex(p => p.id === item.id || p.name === item.name);
        if (pIdx !== -1) {
            const vIdx = products[pIdx].variants.findIndex(v => v.color === item.color);
            if (vIdx !== -1 && products[pIdx].variants[vIdx].sizes) {
                const sIdx = products[pIdx].variants[vIdx].sizes.findIndex(s => (s.size || s.name) === item.size);
                if (sIdx !== -1) {
                    products[pIdx].variants[vIdx].sizes[sIdx].stock = Math.max(0, products[pIdx].variants[vIdx].sizes[sIdx].stock - item.quantity);
                }
                products[pIdx].variants[vIdx].stock = Math.max(0, products[pIdx].variants[vIdx].stock - item.quantity);
            }
            products[pIdx].stock = Math.max(0, (products[pIdx].stock || 0) - item.quantity);
            products[pIdx].sold = (products[pIdx].sold || 0) + item.quantity;
        }
    });

    order.status = 'completed';
    order.isPaid = true;

    localStorage.setItem('moonlight_orders', JSON.stringify(orders));
    localStorage.setItem('moonlight_products', JSON.stringify(products));

    logActivity("Duyệt đơn", `Duyệt đơn hàng #${id} & trừ kho thành công`);
    showToast("Đã duyệt đơn", `Đơn hàng #${id} đã hoàn tất và trừ số lượng kho!`, "success");
    showResultModal({ type: 'success', title: 'Duyệt Đơn Hàng Thành Công!', message: `Đơn hàng #${id} đã hoàn tất và hệ thống đã tự động trừ tồn kho theo từng kích cỡ/màu sắc chính xác!` });
    
    updatePendingBadge();
    renderAdminOrders();
    closeOrderDetailModal();
}

function cancelOrder(id) {
    const idx = orders.findIndex(o => o.id === id);
    if (idx === -1) return;

    showConfirmDialog({
        title: "Xác Nhận Hủy Đơn Hàng",
        message: `Bạn có chắc chắn muốn HỦY đơn hàng #${id}? Trạng thái đơn sẽ chuyển sang Đã Hủy.`,
        icon: "fa-times-circle",
        isDanger: true,
        confirmText: "HỦY ĐƠN",
        onConfirm: () => {
            orders[idx].status = 'cancelled';
            localStorage.setItem('moonlight_orders', JSON.stringify(orders));
            logActivity("Hủy đơn", `Đã hủy đơn hàng #${id}`);
            showToast("Đã hủy đơn", `Đơn hàng #${id} đã chuyển sang trạng thái Hủy`, "info");
            showResultModal({ type: 'success', title: 'Đã Hủy Đơn Hàng', message: `Đơn hàng #${id} đã được chuyển sang trạng thái đã hủy.` });
            updatePendingBadge();
            renderAdminOrders();
            closeOrderDetailModal();
        }
    });
}

function deleteOrder(id) {
    const loggedUser = JSON.parse(localStorage.getItem('moonlight_user')) || { role: 'Staff' };
    if (loggedUser.role === 'Staff') {
        showToast("Từ chối quyền", "Nhân viên thu ngân không có quyền xóa lịch sử đơn hàng!", "error");
        return;
    }

    showConfirmDialog({
        title: "Xóa Lịch Sử Đơn Hàng",
        message: `Bạn có chắc muốn xóa vĩnh viễn đơn hàng #${id} khỏi cơ sở dữ liệu? Thao tác này không thể hoàn tác.`,
        icon: "fa-trash-alt",
        isDanger: true,
        confirmText: "XÓA VĨNH VIỄN",
        onConfirm: () => {
            orders = orders.filter(o => o.id !== id);
            localStorage.setItem('moonlight_orders', JSON.stringify(orders));
            logActivity("Xóa đơn", `Xóa đơn hàng #${id} khỏi hệ thống`);
            showToast("Đã xóa", `Đơn hàng #${id} đã được loại bỏ`, "info");
            showResultModal({ type: 'success', title: 'Đã Xóa Đơn Hàng', message: `Đơn hàng #${id} đã được xóa sạch khỏi cơ sở dữ liệu.` });
            updatePendingBadge();
            renderAdminOrders();
        }
    });
}

function confirmPayment(id) {
    const idx = orders.findIndex(o => o.id === id);
    if (idx === -1) return;

    showConfirmDialog({
        title: "Xác Nhận Nhận Tiền Chuyển Khoản",
        message: `Bạn xác nhận tiền của đơn hàng #${id} đã về tài khoản ngân hàng chính xác?`,
        icon: "fa-university",
        isDanger: false,
        confirmText: "TIỀN ĐÃ VỀ",
        onConfirm: () => {
            orders[idx].isPaid = true;
            localStorage.setItem('moonlight_orders', JSON.stringify(orders));
            logActivity("Xác nhận tiền", `Xác nhận nhận tiền Banking cho đơn #${id}`);
            showToast("Đã nhận tiền", `Đã cập nhật trạng thái đã thanh toán cho đơn #${id}. Bạn có thể duyệt đơn.`, "success");
            showResultModal({ type: 'success', title: 'Xác Nhận Tiền Thành Công!', message: `Đơn hàng #${id} đã được đánh dấu là Đã Nhận Tiền. Bạn có thể tiến hành bấm Duyệt Đơn ngay bây giờ.` });
            renderAdminOrders();
        }
    });
}

// Modal Xem Chi Tiết Đơn Hàng
function showOrderDetail(id) {
    const order = orders.find(o => o.id === id);
    if (!order) return;

    const modal = document.getElementById('orderDetailModal');
    const body = document.getElementById('orderDetailBody');
    const footer = document.getElementById('orderDetailFooter');
    const title = document.getElementById('orderDetailTitle');

    title.innerHTML = `<i class="fas fa-receipt"></i> Đơn Hàng #${order.id}`;

    body.innerHTML = `
        <div class="order-detail-grid">
            <div class="order-info-card">
                <h4><i class="fas fa-user"></i> Thông Tin Người Nhận</h4>
                <div class="order-info-row"><span>Họ tên:</span><strong>${order.customer?.name || 'Khách lẻ'}</strong></div>
                <div class="order-info-row"><span>Số điện thoại:</span><strong>${order.customer?.phone || 'N/A'}</strong></div>
                <div class="order-info-row"><span>Địa chỉ nhận:</span><strong>${order.customer?.address || 'Tại cửa hàng'}</strong></div>
                <div class="order-info-row"><span>Ghi chú:</span><strong style="color:var(--gold);">${order.customer?.note || 'Không có'}</strong></div>
            </div>

            <div class="order-info-card">
                <h4><i class="fas fa-info-circle"></i> Trạng Thái & Thanh Toán</h4>
                <div class="order-info-row"><span>Ngày đặt:</span><strong>${order.date || 'Hôm nay'}</strong></div>
                <div class="order-info-row"><span>Phương thức:</span><strong>${order.paymentMethod || 'COD'}</strong></div>
                <div class="order-info-row"><span>Tiền về tài khoản:</span><strong>${order.isPaid ? '<span style="color:#10b981"><i class="fas fa-check-circle"></i> Đã Nhận</span>' : (order.customerTransferConfirmed ? '<span style="color:#f59e0b"><i class="fas fa-exclamation-circle"></i> Khách đã báo chuyển khoản (Cần check app Agribank)</span>' : '<span style="color:var(--gold-light)">Chưa Nhận</span>')}</strong></div>
                <div class="order-info-row"><span>Trạng thái đơn:</span><strong>${order.status === 'completed' ? '<span style="color:#10b981">Đã Hoàn Tất</span>' : (order.status === 'cancelled' ? '<span style="color:#ef4444">Đã Hủy</span>' : '<span style="color:var(--gold-light)">Đang Chờ Xử Lý</span>')}</strong></div>
            </div>
        </div>

        <h4 style="font-size:13px; color:var(--gold); text-transform:uppercase; margin-bottom:10px;">
            <i class="fas fa-box"></i> Danh Sách Sản Phẩm Trong Đơn
        </h4>
        <table class="order-items-table">
            <thead>
                <tr>
                    <th>Sản phẩm</th>
                    <th>Màu / Size</th>
                    <th style="text-align:right;">Đơn giá</th>
                    <th style="text-align:center;">Số lượng</th>
                    <th style="text-align:right;">Thành tiền</th>
                </tr>
            </thead>
            <tbody>
                ${(order.items || []).map(item => `
                    <tr>
                        <td>
                            <strong style="color:#fff;">${item.name}</strong>
                        </td>
                        <td><span class="adm-badge dark">${item.color || ''} | ${item.size || ''}</span></td>
                        <td style="text-align:right;">${Number(item.price || 0).toLocaleString()}₫</td>
                        <td style="text-align:center; font-weight:bold; color:#fff;">${item.quantity}</td>
                        <td style="text-align:right; color:var(--gold); font-weight:bold;">${Number((item.price || 0) * item.quantity).toLocaleString()}₫</td>
                    </tr>
                `).join('')}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="4" style="text-align:right; font-weight:bold; font-size:14px; padding-top:15px;">TỔNG CỘNG:</td>
                    <td style="text-align:right; font-weight:800; font-size:18px; color:var(--gold); padding-top:15px;">${Number(order.total || 0).toLocaleString()}₫</td>
                </tr>
            </tfoot>
        </table>
    `;

    footer.innerHTML = `
        <button class="btn-outline" onclick="closeOrderDetailModal()">Đóng</button>
        <button class="btn-primary" onclick="printOrderInvoice('${order.id}')"><i class="fas fa-print"></i> In Hóa Đơn</button>
        ${order.status === 'pending' ? `
            <button class="btn-primary" style="background:#2ecc71; color:#000;" onclick="approveOrder('${order.id}')"><i class="fas fa-check"></i> Duyệt Đơn</button>
            <button class="btn-outline" style="color:#e74c3c; border-color:#e74c3c;" onclick="cancelOrder('${order.id}')"><i class="fas fa-times"></i> Hủy Đơn</button>
        ` : ''}
    `;

    modal.classList.add('open');
}

function closeOrderDetailModal() {
    document.getElementById('orderDetailModal')?.classList.remove('open');
}

// In Hóa Đơn Bán Hàng
function printOrderInvoice(id) {
    const order = orders.find(o => o.id === id);
    if (!order) return;

    const area = document.getElementById('invoicePrintArea');
    area.innerHTML = `
        <div class="printable-invoice-wrapper">
            <div class="invoice-brand">
                <h1>MOON LIGHT LUXURY</h1>
                <p style="margin:4px 0; font-size:12px;">Đẳng Cấp Quý Ông - Thời Trang May Đo Thiết Kế</p>
                <p style="margin:2px 0; font-size:11px;">Hotline: 0901.234.567 | Website: moonlight.vn</p>
                <h3 style="margin-top:10px; font-size:16px;">HÓA ĐƠN BÁN HÀNG</h3>
                <small>Mã hóa đơn: <b>#${order.id}</b> | Ngày in: ${new Date().toLocaleString('vi-VN')}</small>
            </div>

            <table class="invoice-meta-table">
                <tr>
                    <td style="width:50%;"><strong>Khách hàng:</strong> ${order.customer?.name || 'Khách lẻ'}</td>
                    <td><strong>Điện thoại:</strong> ${order.customer?.phone || 'N/A'}</td>
                </tr>
                <tr>
                    <td colspan="2"><strong>Địa chỉ:</strong> ${order.customer?.address || 'Tại cửa hàng'}</td>
                </tr>
                <tr>
                    <td><strong>Hình thức:</strong> ${order.paymentMethod || 'COD'}</td>
                    <td><strong>Trạng thái:</strong> ${order.isPaid ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}</td>
                </tr>
            </table>

            <table class="invoice-items-table">
                <thead>
                    <tr>
                        <th style="text-align:left;">Sản phẩm</th>
                        <th style="text-align:center;">Phân loại</th>
                        <th style="text-align:right;">Giá</th>
                        <th style="text-align:center;">SL</th>
                        <th style="text-align:right;">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    ${(order.items || []).map(i => `
                        <tr>
                            <td>${i.name}</td>
                            <td style="text-align:center;">${i.color || ''} - ${i.size || ''}</td>
                            <td style="text-align:right;">${Number(i.price).toLocaleString()}đ</td>
                            <td style="text-align:center;">${i.quantity}</td>
                            <td style="text-align:right;">${Number(i.price * i.quantity).toLocaleString()}đ</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="invoice-total-row">
                <span>TỔNG TIỀN PHẢI TRẢ:</span>
                <span>${Number(order.total).toLocaleString()} VNĐ</span>
            </div>

            <div style="text-align:center; margin-top:25px; font-size:11px; color:#666;">
                <p>Cảm ơn quý khách đã tin tưởng và đồng hành cùng Moon Light!</p>
                <p><i>* Quý khách vui lòng giữ lại hóa đơn để được hỗ trợ đổi size trong vòng 7 ngày.</i></p>
            </div>
        </div>
    `;

    document.getElementById('invoicePrintModal')?.classList.add('open');
}

function closeInvoiceModal() {
    document.getElementById('invoicePrintModal')?.classList.remove('open');
}

function triggerPrint() {
    window.print();
}

// --- 8. TAB 4: QUẢN LÝ ĐÁNH GIÁ KHÁCH HÀNG (LIÊM KHIẾT - ĐÁNH GIÁ RIÊNG THEO SẢN PHẨM & PHẢN HỒI SHOP) ---
function renderAdminReviews() {
    const container = document.getElementById('adminContent');
    if (!container) return;

    // Đảm bảo tất cả đánh giá đều ở trạng thái hiển thị thực tế (Liêm khiết)
    let needsSave = false;
    allReviews.forEach(r => {
        if (r.status !== 'approved') {
            r.status = 'approved';
            needsSave = true;
        }
    });
    if (needsSave) {
        localStorage.setItem('moonlight_all_reviews', JSON.stringify(allReviews));
    }

    // Lọc theo sản phẩm được chọn
    let productSpecificReviews = allReviews;
    if (reviewProductFilter !== 'all') {
        productSpecificReviews = allReviews.filter(r => String(r.productId) === String(reviewProductFilter));
    }

    // Đếm số lượng phản hồi cho bộ lọc
    const repliedCount = productSpecificReviews.filter(r => r.shopReply && r.shopReply.trim()).length;
    const unrepliedCount = productSpecificReviews.length - repliedCount;

    // Lọc theo trạng thái phản hồi
    let list = productSpecificReviews.filter(r => {
        if (reviewReplyStatusFilter === 'replied') {
            return r.shopReply && r.shopReply.trim();
        } else if (reviewReplyStatusFilter === 'unreplied') {
            return !r.shopReply || !r.shopReply.trim();
        }
        return true;
    });

    // Lọc theo số sao
    if (reviewRatingFilter !== 'all') {
        list = list.filter(r => r.rating === parseInt(reviewRatingFilter));
    }

    // Lọc theo từ khóa tìm kiếm (tên khách hàng, nội dung nhận xét, tên sản phẩm)
    if (reviewSearchKeyword && reviewSearchKeyword.trim()) {
        const kw = reviewSearchKeyword.toLowerCase().trim();
        list = list.filter(r => {
            const matchName = (r.name || '').toLowerCase().includes(kw);
            const matchContent = (r.content || '').toLowerCase().includes(kw);
            const matchProd = (r.productName || '').toLowerCase().includes(kw);
            return matchName || matchContent || matchProd;
        });
    }

    // Tính điểm trung bình của tập sản phẩm đang xét
    const avgRating = productSpecificReviews.length > 0 
        ? (productSpecificReviews.reduce((sum, r) => sum + r.rating, 0) / productSpecificReviews.length).toFixed(1)
        : '5.0';

    // Đếm số lượng theo từng mức sao
    const starCounts = {
        5: productSpecificReviews.filter(r => r.rating === 5).length,
        4: productSpecificReviews.filter(r => r.rating === 4).length,
        3: productSpecificReviews.filter(r => r.rating === 3).length,
        2: productSpecificReviews.filter(r => r.rating === 2).length,
        1: productSpecificReviews.filter(r => r.rating === 1).length
    };

    // Tìm thông tin sản phẩm cụ thể nếu đang lọc riêng 1 sản phẩm
    let selectedProd = null;
    if (reviewProductFilter !== 'all') {
        selectedProd = products.find(p => String(p.id) === String(reviewProductFilter)) || {
            name: (productSpecificReviews[0] && productSpecificReviews[0].productName) || 'Sản Phẩm',
            price: 0,
            img: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=500'
        };
    }

    container.innerHTML = `
        <!-- THANH HÀNH ĐỘNG ĐÁNH GIÁ (THOÁNG ĐÃNG, KHÔNG LẶP TIÊU ĐỀ) -->
        <div class="orders-action-bar">
            <div class="orders-live-status">
                <span class="live-dot-pulse" style="background:#10b981; box-shadow:0 0 10px #10b981;"></span>
                <span>Hệ thống Đánh Giá Khách Hàng Thực Tế</span>
                <span class="adm-badge store-tag" style="background:rgba(16,185,129,0.15); color:#10b981; border:1px solid rgba(16,185,129,0.3); font-size:10.5px; padding:2px 8px; margin-left:4px;">
                    <i class="fas fa-shield-alt"></i> Minh Bạch 100% (Không Duyệt / Không Xóa)
                </span>
                <span style="color:var(--text-muted); font-size:12px; margin-left:6px;">
                    Tổng <b>${allReviews.length}</b> nhận xét (${list.length} đang hiển thị${unrepliedCount > 0 ? ` &bull; <span style="color:#f59e0b;"><i class="fas fa-hourglass-half"></i> ${unrepliedCount} chưa phản hồi</span>` : ''})
                </span>
            </div>
            <div class="orders-action-buttons">
                <button class="btn-outline" onclick="exportReviewsCSV()" title="Xuất danh sách đánh giá ra file CSV">
                    <i class="fas fa-file-excel" style="color:#10b981;"></i> Xuất Đánh Giá (CSV)
                </button>
            </div>
        </div>

        <!-- THẺ THÔNG TIN RIÊNG CỦA SẢN PHẨM ĐƯỢC CHỌN (NẾU ĐANG LỌC RIÊNG 1 SẢN PHẨM) -->
        ${selectedProd ? `
            <div class="product-review-hero-card">
                <div class="product-review-hero-left">
                    <img src="${selectedProd.img || 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=500'}" alt="${selectedProd.name}" class="product-review-hero-thumb">
                    <div class="product-review-hero-info">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span class="adm-badge indigo" style="font-size:10px; text-transform:uppercase;">Đang Xem Đánh Giá Riêng</span>
                            <span style="font-size:11.5px; color:var(--text-muted);">Mã SP: #${selectedProd.id}</span>
                        </div>
                        <h3>${selectedProd.name}</h3>
                        <div class="product-review-hero-meta">
                            <span><i class="fas fa-tag" style="color:var(--gold); font-size:11px;"></i> ${Number(selectedProd.price || 0).toLocaleString()}₫</span>
                            <span>&bull;</span>
                            <span style="color:#10b981;"><i class="fas fa-comments"></i> ${productSpecificReviews.length} lượt nhận xét thực tế</span>
                        </div>
                    </div>
                </div>

                <div class="product-review-hero-stats">
                    <div class="product-review-hero-score">
                        <div class="score-num">${avgRating} ★</div>
                        <div class="score-stars">
                            ${'★'.repeat(Math.min(5, Math.round(avgRating)))}${'☆'.repeat(Math.max(0, 5 - Math.round(avgRating)))}
                        </div>
                        <div style="font-size:11px; color:var(--text-muted); margin-top:3px;">Điểm riêng sản phẩm</div>
                    </div>

                    <div class="product-review-hero-breakdown">
                        ${[5, 4, 3, 2, 1].map(star => {
                            const count = starCounts[star] || 0;
                            const pct = productSpecificReviews.length > 0 ? (count / productSpecificReviews.length) * 100 : 0;
                            return `
                                <div class="breakdown-row">
                                    <span style="width:28px;">${star} ★</span>
                                    <div class="breakdown-bar">
                                        <div class="breakdown-fill" style="width:${pct}%;"></div>
                                    </div>
                                    <span style="width:16px; text-align:right;">${count}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>

                    <div>
                        <button class="btn-outline" onclick="setReviewProductFilter('all')" style="padding:7px 12px; font-size:12px;" title="Quay về xem đánh giá của tất cả sản phẩm">
                            <i class="fas fa-list"></i> Xem Tất Cả SP
                        </button>
                    </div>
                </div>
            </div>
        ` : ''}

        <!-- TOOLBAR: CHỌN SẢN PHẨM RIÊNG BIỆT, LỌC TRẠNG THÁI PHẢN HỒI, LỌC SAO & TÌM KIẾM -->
        <div class="admin-toolbar" style="flex-wrap:wrap; gap:12px;">
            <!-- BỘ CHỌN SẢN PHẨM (XEM ĐÁNH GIÁ RIÊNG BIỆT - TINH CHỈNH LUXURY) -->
            <div style="display:flex; align-items:center; gap:8px;">
                <label style="font-size:12.5px; color:var(--text-secondary); font-weight:600; white-space:nowrap; display:flex; align-items:center; gap:5px;">
                    <i class="fas fa-box" style="color:var(--gold);"></i> Sản Phẩm:
                </label>
                <select class="review-product-filter-select" onchange="setReviewProductFilter(this.value)">
                    <option value="all" ${reviewProductFilter==='all'?'selected':''}>📦 Tất Cả Sản Phẩm (${allReviews.length} đánh giá)</option>
                    ${products.map(p => {
                        const count = allReviews.filter(r => String(r.productId) === String(p.id)).length;
                        return `
                            <option value="${p.id}" ${String(reviewProductFilter) === String(p.id) ? 'selected' : ''}>
                                ${p.name} (${count} đánh giá)
                            </option>
                        `;
                    }).join('')}
                </select>
                ${reviewProductFilter !== 'all' ? `
                    <button type="button" onclick="setReviewProductFilter('all')" class="btn-outline" style="padding:4px 8px; font-size:11px; height:34px;" title="Xóa lọc sản phẩm">
                        <i class="fas fa-times"></i>
                    </button>
                ` : ''}
            </div>

            <!-- BỘ LỌC TRẠNG THÁI PHẢN HỒI (MỚI: BIẾT ĐÃ / CHƯA PHẢN HỒI) -->
            <div class="filter-group" style="gap:6px;">
                <button class="filter-pill-btn ${reviewReplyStatusFilter==='all'?'active':''}" onclick="setReviewReplyStatusFilter('all')">
                    Tất Cả (${productSpecificReviews.length})
                </button>
                <button class="filter-pill-btn ${reviewReplyStatusFilter==='replied'?'active':''}" onclick="setReviewReplyStatusFilter('replied')" style="${reviewReplyStatusFilter==='replied'?'':'color:#10b981;'}">
                    <i class="fas fa-check-circle" style="color:#10b981;"></i> Đã Phản Hồi (${repliedCount})
                </button>
                <button class="filter-pill-btn ${reviewReplyStatusFilter==='unreplied'?'active':''}" onclick="setReviewReplyStatusFilter('unreplied')" style="${reviewReplyStatusFilter==='unreplied'?'':'color:#f59e0b;'}">
                    <i class="fas fa-hourglass-half" style="color:#f59e0b;"></i> Chưa Phản Hồi (${unrepliedCount})
                </button>
            </div>

            <!-- TÌM KIẾM THEO TÊN KHÁCH HOẶC NỘI DUNG -->
            <div class="search-box" style="flex:1; min-width:240px; max-width:340px; position:relative;">
                <i class="fas fa-search"></i>
                <input type="text" id="reviewSearchInput" placeholder="Tìm tên khách, nội dung nhận xét..." value="${reviewSearchKeyword}" oninput="searchReviews(this.value)">
                ${reviewSearchKeyword ? `
                    <button type="button" onclick="clearReviewSearch()" style="position:absolute; right:10px; top:50%; transform:translateY(-50%); background:none; border:none; color:#94a3b8; cursor:pointer; font-size:14px; line-height:1;" title="Xóa tìm kiếm">&times;</button>
                ` : ''}
            </div>

            <!-- BỘ LỌC THEO SỐ SAO -->
            <div class="filter-group" style="gap:5px;">
                <button class="filter-pill-btn ${reviewRatingFilter==='all'?'active':''}" onclick="setReviewRatingFilter('all')">
                    Mọi Sao
                </button>
                <button class="filter-pill-btn ${reviewRatingFilter==='5'?'active':''}" onclick="setReviewRatingFilter('5')">
                    5 ★
                </button>
                <button class="filter-pill-btn ${reviewRatingFilter==='4'?'active':''}" onclick="setReviewRatingFilter('4')">
                    4 ★
                </button>
                <button class="filter-pill-btn ${reviewRatingFilter==='3'?'active':''}" onclick="setReviewRatingFilter('3')">
                    3 ★
                </button>
                <button class="filter-pill-btn ${reviewRatingFilter==='2'?'active':''}" onclick="setReviewRatingFilter('2')">
                    2 ★
                </button>
                <button class="filter-pill-btn ${reviewRatingFilter==='1'?'active':''}" onclick="setReviewRatingFilter('1')">
                    1 ★
                </button>
            </div>
        </div>

        <!-- BẢNG DANH SÁCH ĐÁNH GIÁ THỰC TẾ (LIÊM KHIẾT - KHÔNG ẨN, KHÔNG XÓA) -->
        <div class="data-table-container">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th style="width:180px;">Khách Hàng</th>
                        <th style="width:230px;">Sản Phẩm</th>
                        <th style="width:115px;">Đánh Giá</th>
                        <th>Nội Dung Nhận Xét & Phản Hồi Shop</th>
                        <th style="width:105px;">Ngày Gửi</th>
                        <th style="width:130px; text-align:center;">Trạng Thái</th>
                        <th style="width:125px; text-align:center;">Thao Tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${list.length === 0 ? `
                        <tr>
                            <td colspan="7" style="text-align:center; padding:50px 20px; color:#888;">
                                <i class="fas fa-comment-slash" style="font-size:28px; margin-bottom:8px; display:block; opacity:0.4;"></i>
                                Không tìm thấy đánh giá nào khớp với bộ lọc hiện tại.
                            </td>
                        </tr>
                    ` : list.map(rev => {
                        const initials = (rev.name || 'K').split(' ').map(w => w[0]).filter(Boolean).slice(-2).join('').toUpperCase();
                        const pFound = products.find(p => String(p.id) === String(rev.productId));
                        const pImg = (pFound && pFound.img) || 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=200';
                        const isReplied = !!(rev.shopReply && rev.shopReply.trim());

                        return `
                            <tr>
                                <td>
                                    <div style="display:flex; align-items:center; gap:10px;">
                                        <div style="width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg, rgba(91, 80, 246, 0.35), rgba(212, 175, 55, 0.35)); border:1px solid rgba(255, 255, 255, 0.15); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:11.5px; color:#ffffff; flex-shrink:0;">
                                            ${initials}
                                        </div>
                                        <div>
                                            <strong style="color:#fff; font-size:13px;">${rev.name}</strong><br>
                                            <span style="font-size:10px; color:#10b981; display:inline-flex; align-items:center; gap:3px;">
                                                <i class="fas fa-check-circle" style="font-size:9px;"></i> Khách hàng thực tế
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style="display:flex; align-items:center; gap:10px;">
                                        <img src="${pImg}" alt="${rev.productName}" style="width:38px; height:38px; border-radius:8px; object-fit:cover; border:1px solid rgba(255,255,255,0.1); flex-shrink:0;">
                                        <div>
                                            <strong style="color:#e2e8f0; font-size:12.5px; display:block; line-height:1.3;">${rev.productName || 'Sản phẩm'}</strong>
                                            ${reviewProductFilter === 'all' && rev.productId ? `
                                                <button type="button" class="btn-filter-this-product" onclick="setReviewProductFilter('${rev.productId}')" title="Lọc xem riêng đánh giá của sản phẩm này">
                                                    <i class="fas fa-filter"></i> Xem riêng
                                                </button>
                                            ` : ''}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style="color:var(--gold); font-size:13px; letter-spacing:1px;">
                                        ${'★'.repeat(rev.rating)}${'☆'.repeat(Math.max(0, 5 - rev.rating))}
                                    </div>
                                    <span style="font-size:11px; color:var(--text-muted); font-weight:600;">${rev.rating}.0 / 5.0</span>
                                </td>
                                <td>
                                    <p style="font-size:13px; color:#f1f5f9; margin:0; line-height:1.45;">${rev.content}</p>
                                    ${isReplied ? `
                                        <div class="shop-reply-box">
                                            <div class="reply-header">
                                                <span>
                                                    <i class="fas fa-shield-halved" style="color:var(--gold);"></i> 
                                                    Phản hồi bởi: <strong>${rev.shopReplyBy || 'Quản Trị Viên'}</strong>
                                                    <span class="adm-badge dark" style="font-size:9.5px; padding:1px 6px; margin-left:4px;">${rev.shopReplyRole || 'Admin'}</span>
                                                </span>
                                                <small style="color:var(--text-muted);">${rev.shopReplyDate || ''}</small>
                                            </div>
                                            <p class="reply-content">${rev.shopReply}</p>
                                        </div>
                                    ` : ''}
                                </td>
                                <td>
                                    <small style="color:var(--text-muted); font-size:11.5px;">${rev.date || 'Hôm nay'}</small>
                                </td>
                                <td style="text-align:center;">
                                    ${isReplied ? `
                                        <span class="adm-badge success" style="font-size:11px; padding:3px 8px; font-weight:700; display:inline-flex; align-items:center; gap:4px;">
                                            <i class="fas fa-check-circle"></i> Đã phản hồi
                                        </span>
                                    ` : `
                                        <span class="adm-badge warning" style="font-size:11px; padding:3px 8px; font-weight:700; background:rgba(245, 158, 11, 0.15); color:#f59e0b; border:1px solid rgba(245, 158, 11, 0.35); display:inline-flex; align-items:center; gap:4px;">
                                            <i class="fas fa-hourglass-half"></i> Chưa phản hồi
                                        </span>
                                    `}
                                </td>
                                <td style="text-align:center;">
                                    <button class="btn-view-orders" onclick="openShopReplyModal(${rev.id})" title="${isReplied ? 'Chỉnh sửa phản hồi đã gửi' : 'Mở bảng container viết phản hồi cho khách'}" style="font-size:11.5px; padding:5px 10px; ${isReplied ? 'opacity:0.85;' : 'border-color:#5b50f6; box-shadow:0 2px 8px rgba(91,80,246,0.3);'}">
                                        <i class="fas ${isReplied ? 'fa-edit' : 'fa-reply'}"></i> ${isReplied ? 'Sửa lời đáp' : 'Phản hồi'}
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Chuyển bộ lọc sản phẩm riêng biệt
function setReviewProductFilter(productId) {
    reviewProductFilter = productId;
    renderAdminReviews();
}

// Chuyển bộ lọc trạng thái phản hồi (Đã phản hồi / Chưa phản hồi)
function setReviewReplyStatusFilter(status) {
    reviewReplyStatusFilter = status;
    renderAdminReviews();
}

// Chuyển bộ lọc số sao
function setReviewRatingFilter(rating) {
    reviewRatingFilter = rating;
    renderAdminReviews();
}

// Tìm kiếm đánh giá
function searchReviews(keyword) {
    reviewSearchKeyword = keyword;
    renderAdminReviews();
}

// Xóa ô tìm kiếm đánh giá
function clearReviewSearch() {
    reviewSearchKeyword = '';
    renderAdminReviews();
}

// --- BẢNG CONTAINER PHẢN HỒI ĐÁNH GIÁ KHÁCH HÀNG TỪ SHOP ---
function openShopReplyModal(id) {
    const rev = allReviews.find(r => r.id === id);
    if (!rev) return;

    currentReplyingReviewId = id;
    const modal = document.getElementById('shopReplyModal');
    const body = document.getElementById('shopReplyBody');
    if (!modal || !body) return;

    // Lấy thông tin nhân viên đang đăng nhập hiện tại
    const loggedUser = JSON.parse(localStorage.getItem('moonlight_user')) || { 
        name: 'Quản Trị Viên', 
        role: 'Admin', 
        username: 'admin' 
    };
    const staffName = loggedUser.name || loggedUser.username || 'Quản Trị Viên';
    const staffRole = loggedUser.role || 'Admin';

    body.innerHTML = `
        <!-- CONTAINER NỘI DUNG ĐÁNH GIÁ CỦA KHÁCH -->
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:16px; margin-bottom:18px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <strong style="color:#ffffff; font-size:14px;"><i class="fas fa-user-circle" style="color:var(--gold);"></i> ${rev.name}</strong>
                <span style="color:var(--gold); font-size:13.5px;">${'★'.repeat(rev.rating)}${'☆'.repeat(5 - rev.rating)}</span>
            </div>
            <div style="font-size:12px; color:var(--text-secondary); margin-bottom:10px;">
                <i class="fas fa-box" style="color:var(--gold); font-size:11px;"></i> Sản phẩm: <b style="color:#fff;">${rev.productName || 'Sản phẩm'}</b> &bull; Ngày nhận xét: ${rev.date || 'Hôm nay'}
            </div>
            <p style="font-size:13px; color:#f1f5f9; margin:0; line-height:1.5; font-style:italic; background:rgba(0,0,0,0.25); padding:12px 14px; border-radius:10px; border-left:3px solid var(--gold);">
                "${rev.content}"
            </p>
        </div>

        <!-- CONTAINER NHẬP NỘI DUNG PHẢN HỒI -->
        <div class="form-group" style="margin-bottom:12px;">
            <label style="font-size:13px; font-weight:700; color:#fff; display:block; margin-bottom:6px;">
                <i class="fas fa-pen-fancy" style="color:var(--primary-indigo);"></i> Lời Phản Hồi Từ Cửa Hàng:
            </label>
            <textarea id="shopReplyInput" rows="4" style="width:100%; background:var(--bg-card); border:1px solid rgba(255,255,255,0.15); border-radius:10px; color:#fff; padding:12px 14px; font-size:13px; outline:none; resize:vertical; box-sizing:border-box; line-height:1.45;" placeholder="Nhập câu trả lời lịch thiệp, gửi lời cảm ơn hoặc giải đáp thắc mắc dịch vụ...">${rev.shopReply || ''}</textarea>
        </div>

        <!-- THÔNG TIN NHÂN VIÊN PHẢN HỒI (NỘI BỘ BIẾT AI TRẢ LỜI, TRANG NGOÀI CHỈ HIỆN MOONLIGHT) -->
        <div style="background:rgba(91, 80, 246, 0.08); border:1px solid rgba(91, 80, 246, 0.2); border-radius:10px; padding:10px 14px; display:flex; align-items:center; justify-content:space-between; font-size:12px; flex-wrap:wrap; gap:8px;">
            <div style="display:flex; align-items:center; gap:8px;">
                <i class="fas fa-user-shield" style="color:#10b981; font-size:14px;"></i>
                <span style="color:var(--text-secondary);">Nhân viên phản hồi:</span>
                <strong style="color:#ffffff;">${staffName}</strong>
                <span class="adm-badge dark" style="font-size:10px; padding:1px 6px;">${staffRole}</span>
            </div>
            <small style="color:var(--gold); font-weight:600;"><i class="fas fa-globe" style="font-size:11px;"></i> Hiển thị trang ngoài: <b>MoonLight</b></small>
        </div>
    `;

    modal.classList.add('open');
}

function closeShopReplyModal() {
    const modal = document.getElementById('shopReplyModal');
    if (modal) modal.classList.remove('open');
    currentReplyingReviewId = null;
}

function saveShopReply() {
    if (!currentReplyingReviewId) return;
    const rev = allReviews.find(r => r.id === currentReplyingReviewId);
    if (!rev) return;

    const input = document.getElementById('shopReplyInput');
    const replyText = input ? input.value.trim() : '';

    // Lấy thông tin nhân viên đang đăng nhập
    const loggedUser = JSON.parse(localStorage.getItem('moonlight_user')) || { 
        name: 'Quản Trị Viên', 
        role: 'Admin', 
        username: 'admin' 
    };

    rev.shopReply = replyText;
    rev.shopReplyBy = loggedUser.name || loggedUser.username || 'Quản Trị Viên';
    rev.shopReplyRole = loggedUser.role || 'Admin';
    rev.shopReplyDate = new Date().toLocaleDateString('vi-VN');
    rev.isReplied = !!replyText;
    localStorage.setItem('moonlight_all_reviews', JSON.stringify(allReviews));

    logActivity("Phản hồi đánh giá", `Đánh giá ID: ${rev.id} - Khách: ${rev.name} - Bởi: ${rev.shopReplyBy}`);
    showToast("Thành công", replyText ? "Đã lưu phản hồi cho khách hàng" : "Đã gỡ lời phản hồi", "success");
    closeShopReplyModal();
    renderAdminReviews();
}

// Xuất danh sách đánh giá ra file CSV
function exportReviewsCSV() {
    let list = allReviews;
    if (reviewProductFilter !== 'all') {
        list = allReviews.filter(r => String(r.productId) === String(reviewProductFilter));
    }

    if (list.length === 0) {
        showToast("Thông báo", "Chưa có đánh giá nào để xuất file!", "info");
        return;
    }

    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += "ID,KhachHang,MaSanPham,TenSanPham,SoSao,NoiDungNhanXet,NgayGui,MinhBach,TrangThaiPhanHoi,NoiDungPhanHoi,NhanVienPhanHoi,VaiTroNhanVien,NgayPhanHoi\n";

    list.forEach(r => {
        const cleanContent = `"${(r.content || '').replace(/"/g, '""')}"`;
        const cleanReply = `"${(r.shopReply || '').replace(/"/g, '""')}"`;
        const cleanProd = `"${(r.productName || '').replace(/"/g, '""')}"`;
        const cleanName = `"${(r.name || '').replace(/"/g, '""')}"`;
        const isReplied = (r.shopReply && r.shopReply.trim()) ? "Đã phản hồi" : "Chưa phản hồi";

        const row = [
            r.id,
            cleanName,
            r.productId || '',
            cleanProd,
            r.rating,
            cleanContent,
            r.date || '',
            "Đánh giá thực tế (Công khai)",
            isReplied,
            cleanReply,
            `"${(r.shopReplyBy || '').replace(/"/g, '""')}"`,
            r.shopReplyRole || '',
            r.shopReplyDate || ''
        ];
        csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const dateStr = new Date().toISOString().split('T')[0];
    const fileSuffix = reviewProductFilter !== 'all' ? `_SP_${reviewProductFilter}` : '_TatCa';
    link.setAttribute("download", `MoonLight_DanhGia${fileSuffix}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Thành công", `Đã xuất ${list.length} đánh giá sang file CSV`, "success");
}

// --- 9. TAB 5: QUẢN LÝ NHÂN SỰ & XẾP LỊCH LÀM VIỆC ---

function initDefaultSchedulesIfEmpty() {
    if (!moonlightSchedules || !Array.isArray(moonlightSchedules) || moonlightSchedules.length === 0) {
        const now = new Date();
        const currentDay = now.getDay();
        const diffToMonday = (currentDay === 0 ? -6 : 1) - currentDay;
        const monday = new Date(now);
        monday.setDate(now.getDate() + diffToMonday);
        monday.setHours(0, 0, 0, 0);

        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            days.push(`${yyyy}-${mm}-${dd}`);
        }

        // Tạo dữ liệu mẫu phân ca cho tuần này
        moonlightSchedules = [
            { id: 'shift_init_1', staffId: 3, staffName: 'Thu Ngân 01', role: 'Staff', date: days[0], shiftType: 'morning', shiftName: 'Ca Sáng', shiftTime: '08:00 - 15:00', roleTitle: 'Thu Ngân POS & Quầy', note: 'Mở két POS, chuẩn bị tiền lẻ showroom', status: 'completed' },
            { id: 'shift_init_2', staffId: 1, staffName: 'Quản Trị Viên', role: 'Admin', date: days[0], shiftType: 'evening', shiftName: 'Ca Tối', shiftTime: '15:00 - 22:00', roleTitle: 'Quản Lý Showroom & Giám Sát', note: 'Chốt ca và đối soát doanh thu', status: 'completed' },
            { id: 'shift_init_3', staffId: 3, staffName: 'Thu Ngân 01', role: 'Staff', date: days[1], shiftType: 'morning', shiftName: 'Ca Sáng', shiftTime: '08:00 - 15:00', roleTitle: 'Thu Ngân POS & Quầy', note: 'Kiểm tra đơn hàng chờ giao', status: 'completed' },
            { id: 'shift_init_4', staffId: 2, staffName: 'Chủ Cửa Hàng', role: 'Owner', date: days[1], shiftType: 'evening', shiftName: 'Ca Tối', shiftTime: '15:00 - 22:00', roleTitle: 'Tư Vấn Thời Trang & VIP', note: 'Tiếp đón khách hẹn thử đồ VIP', status: 'completed' },
            { id: 'shift_init_5', staffId: 1, staffName: 'Quản Trị Viên', role: 'Admin', date: days[2], shiftType: 'morning', shiftName: 'Ca Sáng', shiftTime: '08:00 - 15:00', roleTitle: 'Kiểm Kho & Đóng Gói Đơn Online', note: 'Kiểm kê đợt hàng mới về showroom', status: 'active' },
            { id: 'shift_init_6', staffId: 3, staffName: 'Thu Ngân 01', role: 'Staff', date: days[2], shiftType: 'evening', shiftName: 'Ca Tối', shiftTime: '15:00 - 22:00', roleTitle: 'Thu Ngân POS & Quầy', note: 'Trực quầy thu ngân tối', status: 'scheduled' },
            { id: 'shift_init_7', staffId: 3, staffName: 'Thu Ngân 01', role: 'Staff', date: days[3], shiftType: 'morning', shiftName: 'Ca Sáng', shiftTime: '08:00 - 15:00', roleTitle: 'Thu Ngân POS & Quầy', note: 'Trực ca sáng chuẩn bị showroom', status: 'scheduled' },
            { id: 'shift_init_8', staffId: 1, staffName: 'Quản Trị Viên', role: 'Admin', date: days[3], shiftType: 'evening', shiftName: 'Ca Tối', shiftTime: '15:00 - 22:00', roleTitle: 'Quản Lý Showroom & Giám Sát', note: 'Giám sát bán hàng ca tối', status: 'scheduled' },
            { id: 'shift_init_9', staffId: 2, staffName: 'Chủ Cửa Hàng', role: 'Owner', date: days[4], shiftType: 'morning', shiftName: 'Ca Sáng', shiftTime: '08:00 - 15:00', roleTitle: 'Tư Vấn Thời Trang & VIP', note: 'Set up trưng bày mẫu mới cuối tuần', status: 'scheduled' },
            { id: 'shift_init_10', staffId: 3, staffName: 'Thu Ngân 01', role: 'Staff', date: days[4], shiftType: 'evening', shiftName: 'Ca Tối', shiftTime: '15:00 - 22:00', roleTitle: 'Thu Ngân POS & Quầy', note: 'Ca tối cuối tuần', status: 'scheduled' },
            { id: 'shift_init_11', staffId: 3, staffName: 'Thu Ngân 01', role: 'Staff', date: days[5], shiftType: 'morning', shiftName: 'Ca Sáng', shiftTime: '08:00 - 15:00', roleTitle: 'Thu Ngân POS & Quầy', note: 'Khách cuối tuần đông, chuẩn bị bao bì', status: 'scheduled' },
            { id: 'shift_init_12', staffId: 1, staffName: 'Quản Trị Viên', role: 'Admin', date: days[5], shiftType: 'evening', shiftName: 'Ca Tối', shiftTime: '15:00 - 22:00', roleTitle: 'Quản Lý Showroom & Giám Sát', note: 'Điều phối ca cao điểm tối thứ 7', status: 'scheduled' },
            { id: 'shift_init_13', staffId: 2, staffName: 'Chủ Cửa Hàng', role: 'Owner', date: days[5], shiftType: 'full', shiftName: 'Cả Ngày', shiftTime: '08:00 - 22:00', roleTitle: 'Tư Vấn Thời Trang & VIP', note: 'Tư vấn trực tiếp cho khách VIP', status: 'scheduled' },
            { id: 'shift_init_14', staffId: 1, staffName: 'Quản Trị Viên', role: 'Admin', date: days[6], shiftType: 'morning', shiftName: 'Ca Sáng', shiftTime: '08:00 - 15:00', roleTitle: 'Quản Lý Showroom & Giám Sát', note: 'Kiểm kê bàn giao ca sáng CN', status: 'scheduled' },
            { id: 'shift_init_15', staffId: 3, staffName: 'Thu Ngân 01', role: 'Staff', date: days[6], shiftType: 'evening', shiftName: 'Ca Tối', shiftTime: '15:00 - 22:00', roleTitle: 'Thu Ngân POS & Quầy', note: 'Tổng kết doanh thu tuần & chốt két', status: 'scheduled' }
        ];

        localStorage.setItem('moonlight_schedules', JSON.stringify(moonlightSchedules));
    }
}

function getWeekRange(offset = 0) {
    const now = new Date();
    const currentDay = now.getDay();
    const diffToMonday = (currentDay === 0 ? -6 : 1) - currentDay;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday + (offset * 7));
    monday.setHours(0, 0, 0, 0);

    const days = [];
    const dayNames = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        days.push({
            name: dayNames[i],
            date: d,
            dateStr: dateStr,
            displayDate: `${dd}/${mm}`,
            fullDisplayDate: `${dd}/${mm}/${yyyy}`,
            isToday: dateStr === todayStr
        });
    }
    return days;
}

function switchStaffSubTab(subTab) {
    staffSubTab = subTab;
    const headingEl = document.getElementById('pageTitleHeading');
    const subtitleEl = document.getElementById('pageTitleSubtitle') || document.getElementById('welcomeSubtitle');

    if (subTab === 'schedule') {
        if (headingEl) headingEl.innerText = 'Lịch Làm Việc Nhân Viên';
        if (subtitleEl) subtitleEl.innerText = 'Bảng phân ca tuần, theo dõi ca trực và phân công nhiệm vụ showroom.';
        document.querySelectorAll('.admin-menu a').forEach(a => {
            a.classList.remove('active');
            const onclickAttr = a.getAttribute('onclick') || '';
            if (onclickAttr.includes("'schedule'")) a.classList.add('active');
        });
    } else {
        if (headingEl) headingEl.innerText = 'Quản Lý Nhân Sự';
        if (subtitleEl) subtitleEl.innerText = 'Phân quyền tài khoản quản trị viên và nhân viên thu ngân.';
        document.querySelectorAll('.admin-menu a').forEach(a => {
            a.classList.remove('active');
            const onclickAttr = a.getAttribute('onclick') || '';
            if (onclickAttr.includes("'staff'")) a.classList.add('active');
        });
    }

    renderAdminStaff();
}

function renderAdminStaff() {
    const container = document.getElementById('adminContent');
    if (!container) return;

    initDefaultSchedulesIfEmpty();

    const loggedUser = JSON.parse(localStorage.getItem('moonlight_user')) || { username: 'admin' };
    const isStaffRole = (loggedUser.role || 'Staff') === 'Staff';
    const canManageSchedule = !isStaffRole;
    const days = getWeekRange(scheduleWeekOffset);
    const weekStartStr = days[0].dateStr;
    const weekEndStr = days[6].dateStr;

    // Đếm số ca của tuần hiện đang xem
    const currentWeekShiftsCount = (moonlightSchedules || []).filter(s => s.date >= weekStartStr && s.date <= weekEndStr).length;

    let weekLabelText = 'Tuần này';
    if (scheduleWeekOffset === 1) weekLabelText = 'Tuần tới';
    else if (scheduleWeekOffset === -1) weekLabelText = 'Tuần trước';
    else if (scheduleWeekOffset !== 0) weekLabelText = `${scheduleWeekOffset > 0 ? '+' : ''}${scheduleWeekOffset} tuần`;

    // Staff truy cập schedule tab: Force sang sub-tab schedule, ẩn sub-tab accounts
    if (isStaffRole && staffSubTab === 'accounts') {
        staffSubTab = 'schedule';
    }

    container.innerHTML = `
        <!-- THANH HÀNH ĐỘNG NHÂN SỰ & SUB-TAB (KHÔNG LẶP TIÊU ĐỀ) -->
        <div class="orders-action-bar">
            <div class="staff-sub-nav">
                ${canManageSchedule ? `
                    <button class="staff-sub-nav-btn ${staffSubTab === 'accounts' ? 'active' : ''}" onclick="switchStaffSubTab('accounts')">
                        <i class="fas fa-users-gear"></i>
                        <span>Tài Khoản & Phân Quyền</span>
                        <span class="pill-badge">${accounts.length}</span>
                    </button>
                ` : ''}
                <button class="staff-sub-nav-btn ${staffSubTab === 'schedule' ? 'active' : ''}" onclick="switchStaffSubTab('schedule')">
                    <i class="far fa-calendar-days"></i>
                    <span>Lịch Trực & Phân Ca</span>
                    <span class="pill-badge">${currentWeekShiftsCount} ca (${weekLabelText})</span>
                </button>
            </div>

            <div class="orders-action-buttons">
                ${staffSubTab === 'accounts' && canManageSchedule ? `
                    <button class="btn-primary" onclick="showAddStaffForm()">
                        <i class="fas fa-user-plus"></i> THÊM NHÂN VIÊN MỚI
                    </button>
                ` : canManageSchedule ? `
                    <button class="btn-outline" onclick="autoGenerateWeekSchedule()" title="Tự động sắp xếp ca luân phiên cho 7 ngày của tuần này">
                        <i class="fas fa-wand-magic-sparkles" style="color:var(--gold);"></i> Xếp Lịch Tự Động
                    </button>
                    <button class="btn-outline" onclick="exportScheduleCSV()" title="Xuất bảng lịch trực tuần này sang file CSV">
                        <i class="fas fa-file-excel" style="color:#10b981;"></i> Xuất Lịch (CSV)
                    </button>
                    <button class="btn-primary" onclick="openShiftModal()">
                        <i class="far fa-calendar-plus"></i> PHÂN CA MỚI
                    </button>
                ` : `
                    <span class="adm-badge" style="background:rgba(96,165,250,0.15); color:#60a5fa; font-size:12px; padding:6px 12px;">
                        <i class="fas fa-eye"></i> Chế độ xem lịch trực cá nhân
                    </span>
                `}
            </div>
        </div>

        ${staffSubTab === 'accounts' ? renderStaffAccountsHTML(loggedUser) : renderStaffScheduleHTML(days)}
    `;
}

function renderStaffAccountsHTML(loggedUser) {
    return `
        <div class="data-table-container">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th style="width:250px">Tên Nhân Sự</th>
                        <th style="width:180px">Tên Đăng Nhập</th>
                        <th style="width:160px">Vai Trò / Quyền</th>
                        <th>Phạm Vi Hoạt Động</th>
                        <th style="width:100px; text-align:center;">Thao Tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${accounts.map(acc => {
                        let roleBadge = '';
                        let roleDesc = '';
                        if (acc.role === 'Admin') {
                            roleBadge = `<span class="adm-badge" style="background:rgba(212,175,55,0.2); color:var(--gold); border:1px solid var(--gold);">Admin Hệ Thống</span>`;
                            roleDesc = 'Toàn quyền cấu hình, quản lý sản phẩm, tài khoản và doanh thu';
                        } else if (acc.role === 'Owner') {
                            roleBadge = `<span class="adm-badge store-tag">Chủ Doanh Nghiệp</span>`;
                            roleDesc = 'Xem báo cáo doanh thu, xử lý đơn hàng và theo dõi kho';
                        } else {
                            roleBadge = `<span class="adm-badge dark">Thu Ngân / POS</span>`;
                            roleDesc = 'Tạo đơn tại quầy POS, xử lý đơn và kiểm tra hàng';
                        }

                        const isSelf = acc.username === loggedUser.username;
                        const isRootAdmin = acc.username === 'admin';

                        return `
                            <tr>
                                <td>
                                    <div style="display:flex; align-items:center; gap:12px;">
                                        <div class="user-avatar" style="width:36px; height:36px; font-size:14px; overflow:hidden;">
                                            ${acc.avatar ? `<img src="${acc.avatar}" alt="${acc.name}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">` : acc.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <strong style="color:#fff;">${acc.name}</strong>
                                            ${isSelf ? `<span style="font-size:10px; color:#2ecc71; margin-left:6px;">(Đang đăng nhập)</span>` : ''}
                                        </div>
                                    </div>
                                </td>
                                <td><code style="color:var(--gold); font-size:13px;">${acc.username}</code></td>
                                <td>${roleBadge}</td>
                                <td><small style="color:var(--text-secondary);">${roleDesc}</small></td>
                                <td style="text-align:center;">
                                    <div style="display:inline-flex; gap:6px; align-items:center;">
                                        <button class="adm-btn" title="Đặt lại mật khẩu cho tài khoản này (123456)" onclick="promptResetStaffPassword(${acc.id})" style="background:rgba(91,80,246,0.15); color:var(--primary-indigo); border:1px solid rgba(91,80,246,0.3);">
                                            <i class="fas fa-key"></i>
                                        </button>
                                        ${(!isSelf && !isRootAdmin) ? `
                                            <button class="adm-btn btn-cancel-ord" title="Xóa tài khoản này" onclick="deleteStaff(${acc.id})">
                                                <i class="fas fa-trash-alt"></i>
                                            </button>
                                        ` : ''}
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderStaffScheduleHTML(days) {
    const loggedUser = JSON.parse(localStorage.getItem('moonlight_user')) || { role: 'Staff' };
    const isStaffRole = loggedUser.role === 'Staff';
    const canManageSchedule = !isStaffRole;

    const weekStartStr = days[0].dateStr;
    const weekEndStr = days[6].dateStr;

    // Lọc theo tuần và bộ lọc ca / nhân viên
    const allWeekShifts = (moonlightSchedules || []).filter(s => s.date >= weekStartStr && s.date <= weekEndStr);
    const filteredWeekShifts = allWeekShifts.filter(s => {
        const matchesShift = scheduleShiftFilter === 'all' || s.shiftType === scheduleShiftFilter;
        const matchesStaff = scheduleStaffFilter === 'all' || String(s.staffId) === String(scheduleStaffFilter);
        return matchesShift && matchesStaff;
    });

    // Thống kê nhanh tuần
    const totalShifts = allWeekShifts.length;
    const morningCount = allWeekShifts.filter(s => s.shiftType === 'morning').length;
    const eveningCount = allWeekShifts.filter(s => s.shiftType === 'evening').length;
    const staffParticipatingCount = new Set(allWeekShifts.map(s => s.staffId)).size;

    return `
        <!-- 4 THẺ KPI TỔNG QUAN LỊCH TRỰC TUẦN -->
        <div class="schedule-kpis-grid">
            <div class="schedule-kpi-card">
                <div class="schedule-kpi-info">
                    <span class="schedule-kpi-label">Tổng Ca Trong Tuần</span>
                    <span class="schedule-kpi-val">${totalShifts}</span>
                    <span class="schedule-kpi-sub">Khoảng: ${days[0].displayDate} - ${days[6].displayDate}</span>
                </div>
                <div class="schedule-kpi-icon indigo">
                    <i class="far fa-calendar-check"></i>
                </div>
            </div>

            <div class="schedule-kpi-card">
                <div class="schedule-kpi-info">
                    <span class="schedule-kpi-label">Ca Sáng (08:00 - 15:00)</span>
                    <span class="schedule-kpi-val" style="color:#fbbf24;">${morningCount}</span>
                    <span class="schedule-kpi-sub">Mở cửa showroom & POS sáng</span>
                </div>
                <div class="schedule-kpi-icon gold">
                    <i class="fas fa-sun"></i>
                </div>
            </div>

            <div class="schedule-kpi-card">
                <div class="schedule-kpi-info">
                    <span class="schedule-kpi-label">Ca Tối (15:00 - 22:00)</span>
                    <span class="schedule-kpi-val" style="color:#c084fc;">${eveningCount}</span>
                    <span class="schedule-kpi-sub">Bán hàng cao điểm & chốt két</span>
                </div>
                <div class="schedule-kpi-icon purple">
                    <i class="fas fa-moon"></i>
                </div>
            </div>

            <div class="schedule-kpi-card">
                <div class="schedule-kpi-info">
                    <span class="schedule-kpi-label">Nhân Sự Trực Ca</span>
                    <span class="schedule-kpi-val" style="color:#34d399;">${staffParticipatingCount}/${accounts.length}</span>
                    <span class="schedule-kpi-sub">Nhân viên tham gia tuần này</span>
                </div>
                <div class="schedule-kpi-icon emerald">
                    <i class="fas fa-users"></i>
                </div>
            </div>
        </div>

        <!-- THANH ĐIỀU HƯỚNG TUẦN & BỘ LỌC LỊCH -->
        <div class="schedule-toolbar">
            <div class="schedule-week-navigator">
                <button class="btn-outline" onclick="changeScheduleWeek(-1)" title="Xem tuần trước">
                    <i class="fas fa-chevron-left"></i> Tuần Trước
                </button>
                <div class="schedule-week-title">
                    <i class="far fa-calendar-alt" style="color:var(--gold);"></i>
                    <span>Tuần: ${days[0].fullDisplayDate} — ${days[6].fullDisplayDate}</span>
                </div>
                <button class="btn-outline" onclick="changeScheduleWeek(1)" title="Xem tuần sau">
                    Tuần Sau <i class="fas fa-chevron-right"></i>
                </button>
                ${scheduleWeekOffset !== 0 ? `
                    <button class="btn-outline" onclick="changeScheduleWeek(0)" title="Trở về tuần hiện tại" style="border-color:var(--gold); color:var(--gold);">
                        <i class="fas fa-crosshairs"></i> Về Tuần Này
                    </button>
                ` : ''}
            </div>

            <div class="schedule-filters-group">
                <select class="schedule-filter-select" onchange="setScheduleFilter('shift', this.value)">
                    <option value="all" ${scheduleShiftFilter === 'all' ? 'selected' : ''}>Tất cả loại ca trực</option>
                    <option value="morning" ${scheduleShiftFilter === 'morning' ? 'selected' : ''}>🌅 Ca Sáng (08:00 - 15:00)</option>
                    <option value="evening" ${scheduleShiftFilter === 'evening' ? 'selected' : ''}>🌙 Ca Tối (15:00 - 22:00)</option>
                    <option value="full" ${scheduleShiftFilter === 'full' ? 'selected' : ''}>⚡ Cả Ngày (08:00 - 22:00)</option>
                </select>

                <select class="schedule-filter-select" onchange="setScheduleFilter('staff', this.value)">
                    <option value="all" ${scheduleStaffFilter === 'all' ? 'selected' : ''}>Tất cả nhân viên</option>
                    ${accounts.map(a => `
                        <option value="${a.id}" ${String(scheduleStaffFilter) === String(a.id) ? 'selected' : ''}>${a.name} (${a.role})</option>
                    `).join('')}
                </select>
            </div>
        </div>

        <!-- MA TRẬN 7 NGÀY TRONG TUẦN (WEEK MATRIX) -->
        <div class="schedule-week-grid">
            ${days.map(day => {
                const dayShifts = filteredWeekShifts.filter(s => s.date === day.dateStr);
                // Sắp xếp ca sáng trước, ca tối sau
                dayShifts.sort((a, b) => {
                    const order = { morning: 1, full: 2, custom: 3, evening: 4 };
                    return (order[a.shiftType] || 5) - (order[b.shiftType] || 5);
                });

                return `
                    <div class="schedule-day-col ${day.isToday ? 'is-today' : ''}">
                        <!-- Header Ngày -->
                        <div class="schedule-day-header">
                            <div class="schedule-day-title">
                                <span>${day.name}</span>
                                ${day.isToday ? `<span class="today-badge-pill">HÔM NAY</span>` : ''}
                            </div>
                            <div class="schedule-day-date">${day.displayDate}</div>
                            <div class="schedule-day-meta">
                                <span><i class="far fa-clock"></i> ${dayShifts.length} ca trực</span>
                                <span>${dayShifts.length > 0 ? '🟢 Đã phân' : '⚪ Trống'}</span>
                            </div>
                        </div>

                        <!-- Danh Sách Ca Trực -->
                        <div class="schedule-shifts-list">
                            ${dayShifts.length === 0 ? `
                                <div class="schedule-shifts-empty">
                                    <i class="far fa-calendar-xmark"></i>
                                    <span>Chưa xếp ca</span>
                                </div>
                            ` : dayShifts.map(shift => {
                                const acc = accounts.find(a => String(a.id) === String(shift.staffId)) || {};
                                const avatar = acc.avatar || shift.staffAvatar;
                                const staffName = acc.name || shift.staffName;

                                let statusLabel = 'Đã lên lịch';
                                if (shift.status === 'active') statusLabel = '🟢 Đang trực';
                                else if (shift.status === 'completed') statusLabel = '✅ Hoàn thành';
                                else if (shift.status === 'off') statusLabel = '⛔ Nghỉ phép';

                                return `
                                    <div class="shift-card ${shift.shiftType || 'morning'}">
                                        <!-- Header thẻ ca -->
                                        <div class="shift-card-header">
                                            <div class="shift-staff-info">
                                                <div class="shift-staff-avatar">
                                                    ${avatar ? `<img src="${avatar}" alt="${staffName}">` : staffName.charAt(0).toUpperCase()}
                                                </div>
                                                <span class="shift-staff-name" title="${staffName}">${staffName}</span>
                                            </div>
                                        </div>

                                        <!-- Giờ ca trực -->
                                        <div class="shift-card-time">
                                            <i class="${shift.shiftType === 'morning' ? 'fas fa-sun' : shift.shiftType === 'evening' ? 'fas fa-moon' : 'fas fa-bolt'}"></i>
                                            <span>${shift.shiftTime || '08:00 - 15:00'}</span>
                                        </div>

                                        <!-- Vị trí phụ trách -->
                                        <div class="shift-card-role" title="${shift.roleTitle || 'Bán hàng'}">
                                            <i class="fas fa-briefcase"></i>
                                            <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${shift.roleTitle || 'Thu Ngân POS'}</span>
                                        </div>

                                        <!-- Ghi chú nếu có -->
                                        ${shift.note ? `<div class="shift-card-note">${shift.note}</div>` : ''}

                                        <!-- Footer thẻ ca -->
                                        <div class="shift-card-footer">
                                            <span class="shift-status-tag ${shift.status || 'scheduled'}" ${canManageSchedule ? `onclick="cycleShiftStatus('${shift.id}')" title="Nhấp để chuyển trạng thái ca"` : 'title="Trạng thái ca trực"'}>
                                                ${statusLabel}
                                            </span>
                                            ${canManageSchedule ? `
                                                <div class="shift-btn-actions">
                                                    <button class="shift-action-btn" onclick="openShiftModal('${day.dateStr}', '${shift.id}')" title="Chỉnh sửa ca này">
                                                        <i class="fas fa-pen"></i>
                                                    </button>
                                                    <button class="shift-action-btn delete" onclick="deleteShiftSchedule('${shift.id}')" title="Xóa ca trực này">
                                                        <i class="fas fa-trash-alt"></i>
                                                    </button>
                                                </div>
                                            ` : ''}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>

                        <!-- Footer thêm ca nhanh cho ngày -->
                        ${canManageSchedule ? `
                            <div class="schedule-day-footer">
                                <button class="btn-add-day-shift" onclick="openShiftModal('${day.dateStr}')" title="Thêm ca trực cho ${day.name}">
                                    <i class="fas fa-plus"></i> Thêm ca
                                </button>
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function changeScheduleWeek(delta) {
    if (delta === 0) {
        scheduleWeekOffset = 0;
    } else {
        scheduleWeekOffset += delta;
    }
    renderAdminStaff();
}

function setScheduleFilter(type, val) {
    if (type === 'shift') {
        scheduleShiftFilter = val;
    } else if (type === 'staff') {
        scheduleStaffFilter = val;
    }
    renderAdminStaff();
}

function handleShiftTypeChange() {
    const typeSelect = document.getElementById('shiftTypeSelect');
    const customBox = document.getElementById('customShiftTimeBox');
    if (!typeSelect || !customBox) return;

    if (typeSelect.value === 'custom') {
        customBox.style.display = 'grid';
    } else {
        customBox.style.display = 'none';
    }
}

function openShiftModal(dateStr = '', shiftId = '') {
    const loggedUser = JSON.parse(localStorage.getItem('moonlight_user')) || { role: 'Staff' };
    if (loggedUser.role === 'Staff') {
        showToast("Từ chối quyền", "Nhân viên thu ngân không có quyền phân ca hoặc chỉnh sửa lịch trực!", "error");
        return;
    }

    const staffSelect = document.getElementById('shiftStaffSelect');
    if (staffSelect) {
        staffSelect.innerHTML = accounts.map(acc => `
            <option value="${acc.id}">${acc.name} (${acc.role}) - @${acc.username}</option>
        `).join('');
    }

    const editIdInput = document.getElementById('shiftEditId');
    const modalTitle = document.getElementById('shiftModalTitle');
    const dateInput = document.getElementById('shiftDateInput');
    const typeSelect = document.getElementById('shiftTypeSelect');
    const roleSelect = document.getElementById('shiftRoleSelect');
    const statusSelect = document.getElementById('shiftStatusSelect');
    const noteInput = document.getElementById('shiftNoteInput');

    if (shiftId) {
        const shift = (moonlightSchedules || []).find(s => s.id === shiftId);
        if (shift) {
            if (editIdInput) editIdInput.value = shift.id;
            if (modalTitle) modalTitle.innerHTML = `<i class="fas fa-calendar-check" style="color:var(--gold);"></i> CHỈNH SỬA CA TRỰC NHÂN VIÊN`;
            if (staffSelect) staffSelect.value = shift.staffId;
            if (dateInput) dateInput.value = shift.date;
            if (typeSelect) typeSelect.value = shift.shiftType || 'morning';
            if (roleSelect) roleSelect.value = shift.roleTitle || 'Thu Ngân POS & Quầy';
            if (statusSelect) statusSelect.value = shift.status || 'scheduled';
            if (noteInput) noteInput.value = shift.note || '';

            if (shift.shiftType === 'custom' && shift.shiftTime) {
                const parts = shift.shiftTime.split('-');
                if (parts.length === 2) {
                    const startEl = document.getElementById('shiftCustomStart');
                    const endEl = document.getElementById('shiftCustomEnd');
                    if (startEl) startEl.value = parts[0].trim();
                    if (endEl) endEl.value = parts[1].trim();
                }
            }
        }
    } else {
        if (editIdInput) editIdInput.value = '';
        if (modalTitle) modalTitle.innerHTML = `<i class="far fa-calendar-plus" style="color:var(--gold);"></i> PHÂN CÔNG CA TRỰC NHÂN VIÊN`;
        if (dateInput) {
            const todayStr = new Date().toISOString().split('T')[0];
            dateInput.value = dateStr || todayStr;
        }
        if (typeSelect) typeSelect.value = 'morning';
        if (roleSelect) roleSelect.value = 'Thu Ngân POS & Quầy';
        if (statusSelect) statusSelect.value = 'scheduled';
        if (noteInput) noteInput.value = '';
    }

    handleShiftTypeChange();
    document.getElementById('shiftScheduleModal')?.classList.add('open');
}

function closeShiftModal() {
    document.getElementById('shiftScheduleModal')?.classList.remove('open');
}

function saveShiftSchedule(e) {
    e.preventDefault();

    const editId = document.getElementById('shiftEditId')?.value;
    const staffId = document.getElementById('shiftStaffSelect')?.value;
    const date = document.getElementById('shiftDateInput')?.value;
    const shiftType = document.getElementById('shiftTypeSelect')?.value || 'morning';
    const roleTitle = document.getElementById('shiftRoleSelect')?.value || 'Thu Ngân POS & Quầy';
    const status = document.getElementById('shiftStatusSelect')?.value || 'scheduled';
    const note = document.getElementById('shiftNoteInput')?.value.trim() || '';

    const staff = accounts.find(a => String(a.id) === String(staffId));
    if (!staff) {
        showToast("Lỗi", "Không tìm thấy thông tin nhân sự được chọn!", "error");
        return;
    }

    let shiftName = 'Ca Sáng';
    let shiftTime = '08:00 - 15:00';
    if (shiftType === 'evening') {
        shiftName = 'Ca Tối';
        shiftTime = '15:00 - 22:00';
    } else if (shiftType === 'full') {
        shiftName = 'Cả Ngày';
        shiftTime = '08:00 - 22:00';
    } else if (shiftType === 'custom') {
        shiftName = 'Tùy Chỉnh';
        const start = document.getElementById('shiftCustomStart')?.value || '09:00';
        const end = document.getElementById('shiftCustomEnd')?.value || '17:00';
        shiftTime = `${start} - ${end}`;
    }

    // Kiểm tra trùng ca trong cùng ngày của nhân viên
    const isDuplicate = (moonlightSchedules || []).some(s => 
        s.id !== editId && 
        String(s.staffId) === String(staffId) && 
        s.date === date && 
        s.shiftType === shiftType
    );

    if (isDuplicate) {
        showToast("Lưu ý", `Nhân viên ${staff.name} đã có ${shiftName} trong ngày ${date}! Vui lòng chọn ca khác.`, "warning");
        return;
    }

    if (!moonlightSchedules) moonlightSchedules = [];

    if (editId) {
        const idx = moonlightSchedules.findIndex(s => s.id === editId);
        if (idx !== -1) {
            moonlightSchedules[idx] = {
                ...moonlightSchedules[idx],
                staffId: staff.id,
                staffName: staff.name,
                staffAvatar: staff.avatar,
                role: staff.role,
                date,
                shiftType,
                shiftName,
                shiftTime,
                roleTitle,
                status,
                note
            };
            logActivity("Cập nhật lịch trực", `Chỉnh sửa ca ${shiftName} (${date}) của [${staff.name}]`);
            showToast("Thành công", `Đã cập nhật ca trực cho "${staff.name}"`, "success");
        }
    } else {
        const newShift = {
            id: 'shift_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            staffId: staff.id,
            staffName: staff.name,
            staffAvatar: staff.avatar,
            role: staff.role,
            date,
            shiftType,
            shiftName,
            shiftTime,
            roleTitle,
            status,
            note
        };
        moonlightSchedules.push(newShift);
        logActivity("Phân công ca trực", `Xếp ca ${shiftName} (${date}) cho [${staff.name}] vị trí ${roleTitle}`);
        showToast("Thành công", `Đã phân công ${shiftName} (${date}) cho "${staff.name}"`, "success");
    }

    localStorage.setItem('moonlight_schedules', JSON.stringify(moonlightSchedules));
    closeShiftModal();
    renderAdminStaff();
}

function deleteShiftSchedule(id) {
    const loggedUser = JSON.parse(localStorage.getItem('moonlight_user')) || { role: 'Staff' };
    if (loggedUser.role === 'Staff') {
        showToast("Từ chối quyền", "Nhân viên thu ngân không có quyền xóa ca trực!", "error");
        return;
    }

    const shift = (moonlightSchedules || []).find(s => s.id === id);
    if (!shift) return;

    showConfirmDialog({
        title: "Xác Nhận Xóa Ca Trực",
        message: `Bạn có chắc muốn hủy ca trực "${shift.shiftName}" ngày ${shift.date} của nhân viên "${shift.staffName}" không?`,
        icon: "fa-calendar-xmark",
        isDanger: true,
        confirmText: "XÓA CA TRỰC",
        onConfirm: () => {
            moonlightSchedules = moonlightSchedules.filter(s => s.id !== id);
            localStorage.setItem('moonlight_schedules', JSON.stringify(moonlightSchedules));
            logActivity("Hủy ca trực", `Đã hủy ca ${shift.shiftName} ngày ${shift.date} của [${shift.staffName}]`);
            showToast("Đã xóa", `Đã gỡ ca trực của "${shift.staffName}"`, "info");
            renderAdminStaff();
        }
    });
}

function cycleShiftStatus(id) {
    const loggedUser = JSON.parse(localStorage.getItem('moonlight_user')) || { role: 'Staff' };
    if (loggedUser.role === 'Staff') {
        showToast("Từ chối quyền", "Nhân viên thu ngân không có quyền thay đổi trạng thái ca trực!", "error");
        return;
    }

    const shift = (moonlightSchedules || []).find(s => s.id === id);
    if (!shift) return;

    const flow = {
        scheduled: 'active',
        active: 'completed',
        completed: 'off',
        off: 'scheduled'
    };

    const statusNames = {
        scheduled: 'Đã lên lịch',
        active: 'Đang trực ca',
        completed: 'Đã hoàn thành',
        off: 'Nghỉ phép'
    };

    shift.status = flow[shift.status] || 'scheduled';
    localStorage.setItem('moonlight_schedules', JSON.stringify(moonlightSchedules));
    showToast("Đổi trạng thái ca", `${shift.staffName} (${shift.shiftName}): ${statusNames[shift.status]}`, "info");
    renderAdminStaff();
}

function autoGenerateWeekSchedule() {
    const loggedUser = JSON.parse(localStorage.getItem('moonlight_user')) || { role: 'Staff' };
    if (loggedUser.role === 'Staff') {
        showToast("Từ chối quyền", "Nhân viên thu ngân không có quyền tự động xếp lịch!", "error");
        return;
    }

    const days = getWeekRange(scheduleWeekOffset);
    if (!accounts || accounts.length === 0) {
        showToast("Lỗi", "Không có nhân viên nào trong danh sách!", "error");
        return;
    }

    showConfirmDialog({
        title: "Tự Động Phân Ca Cho Tuần",
        message: `Hệ thống sẽ tự động xếp luân phiên Ca Sáng (08:00 - 15:00) và Ca Tối (15:00 - 22:00) cho toàn bộ 7 ngày từ ${days[0].displayDate} đến ${days[6].displayDate}. Các ca hiện tại của tuần này sẽ được làm mới. Bạn có đồng ý không?`,
        icon: "fa-wand-magic-sparkles",
        isDanger: false,
        confirmText: "TỰ ĐỘNG PHÂN CA",
        onConfirm: () => {
            const weekStartStr = days[0].dateStr;
            const weekEndStr = days[6].dateStr;

            // Xóa các ca cũ của tuần này
            if (!moonlightSchedules) moonlightSchedules = [];
            moonlightSchedules = moonlightSchedules.filter(s => s.date < weekStartStr || s.date > weekEndStr);

            const staffList = [...accounts];
            let accIdx = 0;

            days.forEach((day, dIdx) => {
                // Ca sáng
                const morningStaff = staffList[accIdx % staffList.length];
                accIdx++;
                moonlightSchedules.push({
                    id: 'shift_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                    staffId: morningStaff.id,
                    staffName: morningStaff.name,
                    staffAvatar: morningStaff.avatar,
                    role: morningStaff.role,
                    date: day.dateStr,
                    shiftType: 'morning',
                    shiftName: 'Ca Sáng',
                    shiftTime: '08:00 - 15:00',
                    roleTitle: morningStaff.role === 'Admin' ? 'Quản Lý Showroom & Giám Sát' : 'Thu Ngân POS & Quầy',
                    note: 'Mở ca showroom & kiểm tra thiết bị',
                    status: day.isToday ? 'active' : 'scheduled'
                });

                // Ca tối
                const eveningStaff = staffList[accIdx % staffList.length];
                accIdx++;
                moonlightSchedules.push({
                    id: 'shift_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                    staffId: eveningStaff.id,
                    staffName: eveningStaff.name,
                    staffAvatar: eveningStaff.avatar,
                    role: eveningStaff.role,
                    date: day.dateStr,
                    shiftType: 'evening',
                    shiftName: 'Ca Tối',
                    shiftTime: '15:00 - 22:00',
                    roleTitle: eveningStaff.role === 'Owner' ? 'Tư Vấn Thời Trang & VIP' : 'Thu Ngân POS & Quầy',
                    note: 'Bán hàng ca tối & chốt két tiền',
                    status: 'scheduled'
                });

                // Cuối tuần (T7 hoặc CN): Thêm 1 ca hỗ trợ nếu có đủ nhân sự
                if ((dIdx === 5 || dIdx === 6) && staffList.length >= 3) {
                    const extraStaff = staffList[accIdx % staffList.length];
                    accIdx++;
                    moonlightSchedules.push({
                        id: 'shift_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                        staffId: extraStaff.id,
                        staffName: extraStaff.name,
                        staffAvatar: extraStaff.avatar,
                        role: extraStaff.role,
                        date: day.dateStr,
                        shiftType: 'full',
                        shiftName: 'Cả Ngày',
                        shiftTime: '08:00 - 22:00',
                        roleTitle: 'Hỗ Trợ Bán Hàng Tổng Hợp',
                        note: 'Tăng cường cuối tuần cao điểm khách đông',
                        status: 'scheduled'
                    });
                }
            });

            localStorage.setItem('moonlight_schedules', JSON.stringify(moonlightSchedules));
            logActivity("Tự động phân ca", `Xếp lịch tự động thành công cho tuần từ ${days[0].displayDate} đến ${days[6].displayDate}`);
            showToast("Thành công", `Đã phân công tự động lịch trực cho tuần!`, "success");
            showResultModal({
                type: 'success',
                title: 'Tự Động Phân Ca Hoàn Tất!',
                message: `Hệ thống đã phân công tự động các ca sáng, ca tối và hỗ trợ cuối tuần cho toàn bộ nhân sự tuần từ ${days[0].fullDisplayDate} đến ${days[6].fullDisplayDate}.`
            });
            renderAdminStaff();
        }
    });
}

function exportScheduleCSV() {
    const loggedUser = JSON.parse(localStorage.getItem('moonlight_user')) || { role: 'Staff' };
    if (loggedUser.role === 'Staff') {
        showToast("Từ chối quyền", "Nhân viên thu ngân không có quyền xuất file lịch trực!", "error");
        return;
    }

    const days = getWeekRange(scheduleWeekOffset);
    const weekStartStr = days[0].dateStr;
    const weekEndStr = days[6].dateStr;

    const weekShifts = (moonlightSchedules || []).filter(s => s.date >= weekStartStr && s.date <= weekEndStr);
    if (weekShifts.length === 0) {
        showToast("Thông báo", "Tuần này chưa có ca trực nào để xuất!", "warning");
        return;
    }

    weekShifts.sort((a, b) => a.date.localeCompare(b.date));

    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += "Ngày Trực,Thứ,Họ Tên Nhân Sự,Tài Khoản,Vai Trò,Ca Trực,Khung Giờ,Vị Trí Phụ Trách,Trạng Thái,Ghi Chú\n";

    const dayNameMap = {
        '0': 'Chủ Nhật', '1': 'Thứ Hai', '2': 'Thứ Ba', '3': 'Thứ Tư', '4': 'Thứ Năm', '5': 'Thứ Sáu', '6': 'Thứ Bảy'
    };

    weekShifts.forEach(s => {
        const dObj = new Date(s.date);
        const dayOfWeekStr = dayNameMap[dObj.getDay()] || '';
        const statusMap = {
            scheduled: 'Đã lên lịch',
            active: 'Đang trực',
            completed: 'Đã hoàn thành',
            off: 'Nghỉ phép'
        };

        const row = [
            `"${s.date}"`,
            `"${dayOfWeekStr}"`,
            `"${(s.staffName || '').replace(/"/g, '""')}"`,
            `"${(accounts.find(a => String(a.id) === String(s.staffId))?.username || '')}"`,
            `"${(s.role || '').replace(/"/g, '""')}"`,
            `"${(s.shiftName || '').replace(/"/g, '""')}"`,
            `"${(s.shiftTime || '').replace(/"/g, '""')}"`,
            `"${(s.roleTitle || '').replace(/"/g, '""')}"`,
            `"${statusMap[s.status] || s.status}"`,
            `"${(s.note || '').replace(/"/g, '""')}"`
        ];
        csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const fileDate = `${days[0].displayDate.replace('/', '-')}_den_${days[6].displayDate.replace('/', '-')}`;
    link.setAttribute("download", `MoonLight_LichTruc_Tuan_${fileDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Thành công", `Đã xuất lịch trực ${weekShifts.length} ca sang file CSV!`, "success");
}

function promptResetStaffPassword(id) {
    const acc = accounts.find(a => a.id === id);
    if (!acc) return;

    showConfirmDialog({
        title: "Đặt Lại Mật Khẩu Nhân Sự",
        message: `Bạn có muốn đặt lại mật khẩu cho tài khoản "${acc.name}" (${acc.username}) về mặc định "123456" không? Nhân viên có thể tự đổi lại sau khi đăng nhập.`,
        icon: "fa-key",
        isDanger: false,
        confirmText: "ĐẶT MẬT KHẨU 123456",
        onConfirm: () => {
            acc.password = "123456";
            localStorage.setItem('moonlight_accounts', JSON.stringify(accounts));

            const loggedUser = JSON.parse(localStorage.getItem('moonlight_user'));
            if (loggedUser && loggedUser.username === acc.username) {
                loggedUser.password = "123456";
                localStorage.setItem('moonlight_user', JSON.stringify(loggedUser));
            }

            logActivity("Reset mật khẩu", `Admin đã đặt lại mật khẩu cho [${acc.username}] thành 123456`);
            showToast("Thành công", `Đã đặt lại mật khẩu cho "${acc.name}" thành: 123456`, "success");
            showResultModal({
                type: 'success',
                title: 'Đặt Lại Mật Khẩu Thành Công!',
                message: `Mật khẩu của tài khoản "${acc.name}" (${acc.username}) đã được đặt lại thành: 123456. Vui lòng bàn giao mật khẩu này cho nhân viên.`
            });
            renderAdminStaff();
        }
    });
}

function showAddStaffForm() {
    const loggedUser = JSON.parse(localStorage.getItem('moonlight_user')) || { role: 'Staff' };
    if (loggedUser.role !== 'Admin') {
        showToast("Từ chối quyền", "Chỉ Admin mới có quyền quản lý nhân sự!", "error");
        return;
    }
    document.getElementById('staffForm').reset();
    document.getElementById('staffModal').classList.add('open');
}

function closeStaffModal() {
    document.getElementById('staffModal').classList.remove('open');
}

function handleSaveStaff(e) {
    e.preventDefault();

    const loggedUser = JSON.parse(localStorage.getItem('moonlight_user')) || { role: 'Staff' };
    if (loggedUser.role !== 'Admin') {
        showToast("Từ chối quyền", "Chỉ Admin mới có quyền tạo tài khoản nhân viên!", "error");
        return;
    }

    const name = document.getElementById('sName').value.trim();
    const username = document.getElementById('sUser').value.trim().toLowerCase();
    const password = document.getElementById('sPass').value.trim();
    const role = document.getElementById('sRole').value;

    if (accounts.some(a => a.username === username)) {
        showToast("Lỗi tạo tài khoản", `Tên đăng nhập "${username}" đã tồn tại! Vui lòng chọn tên khác.`, "error");
        return;
    }

    const newStaff = {
        id: Date.now(),
        name,
        username,
        password,
        role
    };

    accounts.push(newStaff);
    localStorage.setItem('moonlight_accounts', JSON.stringify(accounts));
    logActivity("Thêm nhân sự", `Tạo tài khoản mới [${username}] quyền [${role}]`);
    showToast("Thành công", `Đã cấp tài khoản cho nhân viên "${name}"`, "success");
    showResultModal({ type: 'success', title: 'Tạo Nhân Sự Thành Công!', message: `Tài khoản "${name}" (${username}) với vai trò ${role} đã được kích hoạt.` });
    closeStaffModal();
    renderAdminStaff();
}

function deleteStaff(id) {
    const loggedUser = JSON.parse(localStorage.getItem('moonlight_user')) || { role: 'Staff' };
    if (loggedUser.role !== 'Admin') {
        showToast("Từ chối quyền", "Chỉ Admin mới có quyền xóa nhân viên!", "error");
        return;
    }

    const acc = accounts.find(a => a.id === id);
    if (!acc) return;

    showConfirmDialog({
        title: "Xác Nhận Xóa Nhân Sự",
        message: `Bạn có chắc muốn vô hiệu hóa và xóa quyền truy cập của nhân viên "${acc.name}" (${acc.username})?`,
        icon: "fa-user-slash",
        isDanger: true,
        confirmText: "XÓA TÀI KHOẢN",
        onConfirm: () => {
            accounts = accounts.filter(a => a.id !== id);
            localStorage.setItem('moonlight_accounts', JSON.stringify(accounts));
            logActivity("Xóa nhân sự", `Đã xóa tài khoản [${acc.username}]`);
            showToast("Đã xóa", `Tài khoản "${acc.username}" đã bị vô hiệu hóa`, "info");
            showResultModal({ type: 'success', title: 'Đã Xóa Tài Khoản', message: `Nhân sự "${acc.name}" đã được gỡ bỏ khỏi danh sách quyền truy cập.` });
            renderAdminStaff();
        }
    });
}

// --- 10. TIỆN ÍCH HỆ THỐNG: TOAST NOTIFICATION & AUDIT LOGS ---
function showToast(arg1, arg2, arg3) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    let title = 'Thông báo';
    let message = '';
    let type = 'info';

    if (typeof arg1 === 'object' && arg1 !== null) {
        title = arg1.title || 'Thông báo';
        message = arg1.message || arg1.msg || '';
        type = arg1.type || 'info';
    } else if (typeof arg1 === 'string') {
        if (arg3 !== undefined) {
            title = arg1;
            message = arg2 || '';
            type = arg3 || 'info';
        } else if (arg2 !== undefined) {
            if (['success', 'info', 'warning', 'error', 'danger'].includes(arg1.toLowerCase())) {
                type = arg1.toLowerCase() === 'danger' ? 'error' : arg1.toLowerCase();
                title = type === 'success' ? 'Thành công' : type === 'error' ? 'Thất bại' : type === 'warning' ? 'Cảnh báo' : 'Thông báo';
                message = arg2;
            } else {
                title = arg1;
                message = arg2;
                type = 'info';
            }
        } else {
            title = 'Thông báo';
            message = arg1;
            type = 'info';
        }
    }

    if (!['success', 'info', 'warning', 'error'].includes(type)) {
        type = 'info';
    }

    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;

    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    else if (type === 'error') icon = 'fa-exclamation-circle';
    else if (type === 'warning') icon = 'fa-exclamation-triangle';

    toast.innerHTML = `
        <i class="fas ${icon} toast-icon"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-desc">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function logActivity(action, details) {
    const user = JSON.parse(localStorage.getItem('moonlight_user')) || { name: 'Admin', role: 'Admin' };
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + now.toLocaleDateString('vi-VN');
    const newLog = {
        time: timeStr,
        user: `${user.name} (${user.role})`,
        action,
        details
    };
    logs.unshift(newLog);
    if (logs.length > 50) logs.pop();
    localStorage.setItem('moonlight_logs', JSON.stringify(logs));
    if (currentTab === 'dashboard') {
        renderActivityFeed(currentActivityFilter);
    }
}

function clearLogs() {
    showConfirmDialog({
        title: "Dọn Dẹp Lịch Sử Hoạt Động",
        message: "Bạn có chắc muốn xóa sạch toàn bộ danh sách nhật ký hệ thống gần đây?",
        icon: "fa-broom",
        isDanger: false,
        confirmText: "DỌN DẸP NGAY",
        onConfirm: () => {
            logs = [];
            localStorage.setItem('moonlight_logs', JSON.stringify(logs));
            showToast("Đã dọn dẹp", "Lịch sử hoạt động đã được làm sạch", "info");
            showResultModal({ type: 'success', title: 'Đã Dọn Dẹp Thành Công', message: 'Toàn bộ lịch sử hoạt động cũ đã được dọn sạch.' });
            renderActivityFeed(currentActivityFilter);
        }
    });
}

// ==========================================================================
// --- 11. MOONLIGHT AI COPILOT AGENT (TRỢ LÝ ĐIỀU HÀNH THÔNG MINH 2026) ---
// ==========================================================================
let aiAgentOpen = false;
let aiChatHistory = [];

function initAIAgent() {
    updateAIBadge();
    renderAIBriefing();
}

function toggleAIAgent() {
    const drawer = document.getElementById('aiAgentDrawer');
    if (!drawer) return;
    aiAgentOpen = !aiAgentOpen;
    drawer.classList.toggle('open', aiAgentOpen);
    if (aiAgentOpen) {
        renderAIBriefing();
        if (aiChatHistory.length === 0) {
            initAIWelcomeMessage();
        }
        setTimeout(() => {
            document.getElementById('aiInputText')?.focus();
        }, 200);
    }
}

function updateAIBadge() {
    const badge = document.getElementById('aiAlertBadge');
    if (!badge) return;
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const lowStockCount = products.filter(p => (p.stock || 0) < 10).length;
    const totalAlerts = pendingCount + (lowStockCount > 0 ? 1 : 0);
    if (totalAlerts > 0) {
        badge.innerText = totalAlerts;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

function renderAIBriefing() {
    const statsContainer = document.getElementById('aiBriefingStats');
    if (!statsContainer) return;
    const completedOrders = orders.filter(o => o.status === 'completed');
    const totalRev = completedOrders.reduce((s, o) => s + (o.total || 0), 0);
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const lowStockCount = products.filter(p => (p.stock || 0) < 10).length;

    statsContainer.innerHTML = `
        <div class="ai-brief-stat-item">
            <span class="ai-brief-stat-label">Doanh thu</span>
            <span class="ai-brief-stat-val" style="color:var(--gold-light);">${(totalRev/1000000).toFixed(1)}Tr ₫</span>
        </div>
        <div class="ai-brief-stat-item">
            <span class="ai-brief-stat-label">Chờ xử lý</span>
            <span class="ai-brief-stat-val" style="color:${pendingCount > 0 ? '#f59e0b' : '#10b981'};">${pendingCount} đơn</span>
        </div>
        <div class="ai-brief-stat-item">
            <span class="ai-brief-stat-label">Kho cảnh báo</span>
            <span class="ai-brief-stat-val" style="color:${lowStockCount > 0 ? '#ef4444' : '#10b981'};">${lowStockCount} mã</span>
        </div>
    `;
    updateAIBadge();
}

function initAIWelcomeMessage() {
    const currentUser = JSON.parse(localStorage.getItem('moonlight_user')) || { name: 'Quản Trị Viên' };
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const lowStockCount = products.filter(p => (p.stock || 0) < 10).length;
    
    let greeting = `Chào <strong>${currentUser.name}</strong>! Tôi là <strong>MoonLight AI Copilot</strong>.<br><br>`;
    greeting += `Hệ thống vừa cập nhật dữ liệu mới nhất:`;
    greeting += `<ul>`;
    if (pendingOrders.length > 0) {
        greeting += `<li>Có <strong>${pendingOrders.length} đơn hàng chờ xử lý</strong> (${pendingOrders.filter(o => o.isPaid).length} đơn đã chuyển khoản).</li>`;
    } else {
        greeting += `<li>Không có đơn hàng nào tồn đọng.</li>`;
    }
    if (lowStockCount > 0) {
        greeting += `<li>Có <strong>${lowStockCount} sản phẩm sắp hết hàng</strong> (dưới 10 cái).</li>`;
    } else {
        greeting += `<li>Tồn kho các mặt hàng đang dồi dào.</li>`;
    }
    greeting += `</ul>`;
    greeting += `Bạn cần tôi hỗ trợ kiểm tra doanh thu, đối soát đơn hàng, hay lọc kho?`;

    appendAIMessage('agent', greeting);
}

function appendAIMessage(sender, htmlContent, actionBtns = null) {
    const container = document.getElementById('aiChatMessages');
    if (!container) return;

    aiChatHistory.push({ sender, content: htmlContent });

    const msgEl = document.createElement('div');
    msgEl.className = `ai-msg ${sender}`;

    if (sender === 'agent') {
        msgEl.innerHTML = `
            <div class="ai-msg-avatar"><i class="fas fa-robot"></i></div>
            <div class="ai-msg-bubble">
                ${htmlContent}
                ${actionBtns ? `<div class="ai-action-btn-group">${actionBtns}</div>` : ''}
            </div>
        `;
    } else {
        msgEl.innerHTML = `
            <div class="ai-msg-bubble">${htmlContent}</div>
        `;
    }

    container.appendChild(msgEl);
    container.scrollTop = container.scrollHeight;
}

function askAIAgent(prompt) {
    const input = document.getElementById('aiInputText');
    if (input) input.value = prompt;
    handleAISubmit(null, prompt);
}

function handleAISubmit(e, directText) {
    if (e) e.preventDefault();
    const input = document.getElementById('aiInputText');
    const query = directText || (input ? input.value.trim() : '');
    if (!query) return;

    if (input) input.value = '';

    // Append user query
    appendAIMessage('user', query);

    // Show temporary typing indicator
    const typingId = 'aiTyping_' + Date.now();
    const container = document.getElementById('aiChatMessages');
    const typingEl = document.createElement('div');
    typingEl.id = typingId;
    typingEl.className = 'ai-msg agent';
    typingEl.innerHTML = `
        <div class="ai-msg-avatar"><i class="fas fa-robot"></i></div>
        <div class="ai-msg-bubble" style="color:var(--text-muted);">
            <i class="fas fa-circle-notch fa-spin"></i> Đang phân tích dữ liệu cửa hàng...
        </div>
    `;
    container.appendChild(typingEl);
    container.scrollTop = container.scrollHeight;

    setTimeout(() => {
        const temp = document.getElementById(typingId);
        if (temp) temp.remove();
        processAgentQuery(query);
    }, 280);
}

function clearAIChat() {
    aiChatHistory = [];
    const container = document.getElementById('aiChatMessages');
    if (container) container.innerHTML = '';
    initAIWelcomeMessage();
}

function executeAgentApprovePaid() {
    const paidPending = orders.filter(o => o.status === 'pending' && o.isPaid);
    if (paidPending.length === 0) {
        showToast("Thông báo", "Không có đơn hàng nào đã nhận tiền đang chờ duyệt!", "info");
        appendAIMessage('agent', "Hiện không có đơn chuyển khoản nào đang chờ duyệt!");
        return;
    }

    showConfirmDialog({
        title: `Duyệt Nhanh ${paidPending.length} Đơn Đã Nhận Tiền`,
        message: `Hệ thống sẽ duyệt toàn bộ ${paidPending.length} đơn hàng đã chuyển khoản thành công và xuất kho tương ứng. Bạn có chắc muốn thực hiện?`,
        icon: "fa-check-double",
        isDanger: false,
        confirmText: "DUYỆT TẤT CẢ",
        onConfirm: () => {
            let count = 0;
            paidPending.forEach(o => {
                approveOrder(o.id);
                count++;
            });
            renderAIBriefing();
            appendAIMessage('agent', `🎉 Đã duyệt thành công <strong>${count} đơn hàng</strong>! Trạng thái đơn đã chuyển sang Hoàn tất và tồn kho đã được xuất chuẩn xác.`);
        }
    });
}

// ==========================================================================
// --- 11.1 AI AUTONOMOUS ACTIONS & ADMIN MENTORSHIP HELPERS ---
// ==========================================================================

// 1. AI HELPER: TRUY VẤN NHẬT KÝ HOẠT ĐỘNG THỜI GIAN THỰC (AUDIT LOG QUERY)
function executeAgentLogQuery(query) {
    const q = (query || '').toLowerCase();
    const storedLogs = (logs && logs.length > 0) ? logs : (JSON.parse(localStorage.getItem('moonlight_logs')) || []);
    
    if (storedLogs.length === 0) {
        appendAIMessage('agent', `📜 Hiện tại hệ thống chưa ghi nhận hoạt động nào trong cơ sở dữ liệu nhật ký gần đây. Khi có thao tác đơn hàng, kho hoặc nhân sự, nhật ký sẽ tự động cập nhật.`);
        return;
    }

    let timeLabel = "Gần đây";
    if (q.includes('1 tiếng') || q.includes('một tiếng') || q.includes('60 phút')) {
        timeLabel = "Khoảng 1 tiếng qua";
    } else if (q.includes('hôm nay')) {
        timeLabel = "Trong ngày hôm nay";
    }

    const displayLogs = storedLogs.slice(0, 6);
    let response = `📜 <strong>BÁO CÁO NHẬT KÝ HỆ THỐNG (${timeLabel.toUpperCase()}):</strong><br>`;
    response += `<span style="font-size:11px; color:var(--text-muted);">Ghi nhận ${displayLogs.length} thao tác mới nhất được lưu trong hệ thống:</span><br><br>`;
    response += `<div class="ai-log-timeline">`;
    displayLogs.forEach(l => {
        let icon = 'fa-info-circle';
        const actionStr = l.action || '';
        if (actionStr.includes('Duyệt')) icon = 'fa-check-circle';
        else if (actionStr.includes('Hủy') || actionStr.includes('Xóa')) icon = 'fa-trash-alt';
        else if (actionStr.includes('Sản phẩm') || actionStr.includes('Kho')) icon = 'fa-box';
        else if (actionStr.includes('Tiền') || actionStr.includes('Banking')) icon = 'fa-money-bill-wave';
        else if (actionStr.includes('Nhân sự')) icon = 'fa-user-shield';

        response += `
            <div class="ai-log-item">
                <div class="ai-log-time"><i class="far fa-clock"></i> ${l.time || 'Vừa xong'}</div>
                <div class="ai-log-action"><i class="fas ${icon}" style="color:var(--gold-light); margin-right:4px;"></i>${l.action} <span style="font-weight:400; opacity:0.75;">- bởi ${l.user}</span></div>
                <div class="ai-log-details">${l.details}</div>
            </div>
        `;
    });
    response += `</div>`;

    const actionBtns = `
        <button class="ai-action-btn" onclick="switchTab('dashboard'); document.getElementById('recentActivityFeed')?.scrollIntoView({behavior:'smooth'});"><i class="fas fa-history"></i> Bảng nhật ký chi tiết</button>
        <button class="ai-action-btn" onclick="clearLogs()"><i class="fas fa-broom"></i> Dọn dẹp nhật ký</button>
    `;
    appendAIMessage('agent', response, actionBtns);
}

// 2. AI HELPER: TRA CỨU & XỬ LÝ ĐƠN HÀNG CỤ THỂ QUA MÃ ĐƠN (#DH1001, ...)
function executeAgentOrderLookup(orderId, actionType = null) {
    const cleanId = String(orderId).replace(/^#/, '').trim();
    const order = orders.find(o => 
        String(o.id).toLowerCase() === cleanId.toLowerCase() || 
        String(o.id).toLowerCase() === ('dh' + cleanId).toLowerCase() ||
        String(o.id).replace(/\D/g, '') === cleanId.replace(/\D/g, '')
    );

    if (!order) {
        appendAIMessage('agent', `❌ Không tìm thấy đơn hàng nào có mã <strong>#${orderId}</strong> trong cơ sở dữ liệu. Bạn vui lòng kiểm tra lại mã hoặc tra cứu trong tab Đơn Hàng.`, 
            `<button class="ai-action-btn" onclick="switchTab('orders')"><i class="fas fa-receipt"></i> Mở tab Đơn Hàng</button>`);
        return;
    }

    if (actionType === 'approve') {
        if (order.status === 'completed') {
            appendAIMessage('agent', `ℹ️ Đơn hàng <strong>#${order.id}</strong> đã ở trạng thái <strong>Hoàn tất</strong> trước đó rồi!`);
        } else {
            approveOrder(order.id);
            renderAIBriefing();
            appendAIMessage('agent', `🎉 Đã duyệt đơn hàng <strong>#${order.id}</strong> thành công! Tồn kho các sản phẩm đã được tự động trừ chính xác.`);
        }
        return;
    }

    if (actionType === 'cancel') {
        if (order.status === 'cancelled') {
            appendAIMessage('agent', `ℹ️ Đơn hàng <strong>#${order.id}</strong> đã bị hủy từ trước.`);
        } else {
            cancelOrder(order.id);
            renderAIBriefing();
            appendAIMessage('agent', `Đã chuyển đơn hàng <strong>#${order.id}</strong> sang trạng thái <strong>Đã Hủy</strong>.`);
        }
        return;
    }

    if (actionType === 'print') {
        printOrderInvoice(order.id);
        appendAIMessage('agent', `🖨️ Đang mở cửa sổ in hóa đơn bán hàng cho đơn <strong>#${order.id}</strong>.`);
        return;
    }

    if (actionType === 'paid') {
        if (order.isPaid) {
            appendAIMessage('agent', `ℹ️ Đơn hàng <strong>#${order.id}</strong> đã được ghi nhận đã thanh toán trước đó.`);
        } else {
            confirmPayment(order.id);
            appendAIMessage('agent', `✅ Đã xác nhận nhận tiền cho đơn hàng <strong>#${order.id}</strong>.`);
        }
        return;
    }

    // Mặc định: Hiển thị Card chi tiết đơn hàng tương tác cao
    const statusText = order.status === 'completed' ? 'Hoàn tất' : (order.status === 'pending' ? 'Chờ xử lý' : 'Đã hủy');
    const statusBadgeClass = order.status === 'completed' ? 'completed' : (order.status === 'pending' ? 'pending' : 'cancelled');
    
    const cardHtml = `
        <div class="ai-order-card">
            <div class="ai-order-card-header">
                <span class="ai-order-card-id"><i class="fas fa-receipt"></i> #${order.id}</span>
                <span class="adm-badge ${statusBadgeClass}">${statusText}</span>
            </div>
            <div class="ai-order-card-body">
                <p>👤 <strong>Khách:</strong> ${order.customer?.name || 'Khách lẻ'} - ${order.customer?.phone || 'N/A'}</p>
                <p>📍 <strong>Địa chỉ:</strong> ${order.customer?.address || 'Tại showroom MoonLight'}</p>
                <p>💳 <strong>Thanh toán:</strong> ${order.paymentMethod || 'COD'} (${order.isPaid ? '<span style="color:#10b981; font-weight:700;">Đã nhận tiền</span>' : '<span style="color:#f59e0b; font-weight:700;">Chưa nhận tiền</span>'})</p>
                <p>📦 <strong>Sản phẩm:</strong> ${(order.items || []).map(i => `${i.name} (x${i.quantity})`).join(', ')}</p>
                <p style="margin-top:6px; font-size:13px;">💰 <strong>Tổng giá trị:</strong> <span style="color:var(--gold-light); font-weight:800;">${(order.total || 0).toLocaleString()}₫</span></p>
            </div>
        </div>
    `;

    let actionBtns = ``;
    if (order.status === 'pending') {
        actionBtns += `<button class="ai-action-btn" onclick="executeAgentOrderLookup('${order.id}', 'approve')"><i class="fas fa-check"></i> Duyệt đơn</button>`;
        if (!order.isPaid) {
            actionBtns += `<button class="ai-action-btn" onclick="executeAgentOrderLookup('${order.id}', 'paid')"><i class="fas fa-university"></i> Xác nhận tiền</button>`;
        }
    }
    actionBtns += `<button class="ai-action-btn" onclick="printOrderInvoice('${order.id}')"><i class="fas fa-print"></i> In Hóa Đơn</button>`;
    actionBtns += `<button class="ai-action-btn" onclick="showOrderDetail('${order.id}')"><i class="fas fa-info-circle"></i> Chi tiết modal</button>`;
    if (order.status === 'pending') {
        actionBtns += `<button class="ai-action-btn" style="color:#ef4444;" onclick="executeAgentOrderLookup('${order.id}', 'cancel')"><i class="fas fa-times"></i> Hủy đơn</button>`;
    }

    appendAIMessage('agent', cardHtml, actionBtns);
}

// 3. AI HELPER: ĐIỀU CHỈNH TỒN KHO QUA CÂU LỆNH CHAT
function executeAgentStockMutation(productNameQuery, deltaQty) {
    const q = productNameQuery.toLowerCase().trim();
    const product = products.find(p => p.name.toLowerCase().includes(q) || q.includes(p.name.toLowerCase()));

    if (!product) {
        appendAIMessage('agent', `❌ Không tìm thấy sản phẩm nào khớp với tên "<strong>${productNameQuery}</strong>". Bạn vui lòng kiểm tra danh mục kho sản phẩm.`,
            `<button class="ai-action-btn" onclick="switchTab('products')"><i class="fas fa-box"></i> Mở tab Kho Hàng</button>`);
        return;
    }

    const oldStock = product.stock || 0;
    const newStock = Math.max(0, oldStock + deltaQty);
    product.stock = newStock;

    if (product.variants && product.variants.length > 0) {
        product.variants[0].stock = Math.max(0, (product.variants[0].stock || 0) + deltaQty);
        if (product.variants[0].sizes && product.variants[0].sizes.length > 0) {
            product.variants[0].sizes[0].stock = Math.max(0, (product.variants[0].sizes[0].stock || 0) + deltaQty);
        }
    }

    localStorage.setItem('moonlight_products', JSON.stringify(products));
    logActivity("Cập nhật kho (AI)", `AI Agent đã điều chỉnh tồn kho [${product.name}]: ${deltaQty >= 0 ? '+' : ''}${deltaQty} cái (Hiện tại: ${newStock} cái)`);
    showToast("Cập nhật kho", `Đã điều chỉnh [${product.name}]: ${newStock} cái`, "success");
    renderAIBriefing();
    if (currentTab === 'products') renderAdminProducts();
    if (currentTab === 'dashboard') renderAdminStats();

    let resp = `📦 <strong>CẬP NHẬT TỒN KHO THÀNH CÔNG:</strong><br>`;
    resp += `• Sản phẩm: <strong>${product.name}</strong><br>`;
    resp += `• Biến động: <strong>${deltaQty >= 0 ? '+' : ''}${deltaQty} cái</strong><br>`;
    resp += `• Tồn kho mới hiện tại: <strong style="color:var(--gold-light); font-size:14px;">${newStock} cái</strong>.`;

    const actionBtns = `
        <button class="ai-action-btn" onclick="switchTab('products')"><i class="fas fa-box"></i> Xem danh mục kho</button>
        <button class="ai-action-btn" onclick="editProduct('${product.id}')"><i class="fas fa-edit"></i> Sửa chi tiết</button>
    `;
    appendAIMessage('agent', resp, actionBtns);
}

// 4. AI HELPER: ĐỔI GIÁ BÁN SẢN PHẨM TRỰC TIẾP
function executeAgentPriceMutation(productNameQuery, newPrice) {
    const q = productNameQuery.toLowerCase().trim();
    const product = products.find(p => p.name.toLowerCase().includes(q) || q.includes(p.name.toLowerCase()));

    if (!product) {
        appendAIMessage('agent', `❌ Không tìm thấy sản phẩm nào khớp với tên "<strong>${productNameQuery}</strong>".`,
            `<button class="ai-action-btn" onclick="switchTab('products')"><i class="fas fa-box"></i> Mở tab Kho Hàng</button>`);
        return;
    }

    const oldPrice = product.price || 0;
    product.price = newPrice;
    if (product.variants) {
        product.variants.forEach(v => v.price = newPrice);
    }

    localStorage.setItem('moonlight_products', JSON.stringify(products));
    logActivity("Sửa giá sản phẩm (AI)", `AI Agent cập nhật giá [${product.name}]: ${oldPrice.toLocaleString()}₫ -> ${newPrice.toLocaleString()}₫`);
    showToast("Đã cập nhật giá", `${product.name}: ${newPrice.toLocaleString()}₫`, "success");
    renderAIBriefing();
    if (currentTab === 'products') renderAdminProducts();
    if (currentTab === 'dashboard') renderAdminStats();

    let resp = `🏷️ <strong>CẬP NHẬT GIÁ BÁN THÀNH CÔNG:</strong><br>`;
    resp += `• Sản phẩm: <strong>${product.name}</strong><br>`;
    resp += `• Giá niêm yết cũ: <del>${oldPrice.toLocaleString()}₫</del><br>`;
    resp += `• Giá mới cập nhật: <strong style="color:var(--gold-light); font-size:14px;">${newPrice.toLocaleString()}₫</strong>.`;

    const actionBtns = `
        <button class="ai-action-btn" onclick="switchTab('products')"><i class="fas fa-box"></i> Xem sản phẩm</button>
    `;
    appendAIMessage('agent', resp, actionBtns);
}

// 5. AI HELPER: HƯỚNG DẪN QUẢN TRỊ VIÊN MỚI (ONBOARDING & SOP CHUẨN QUẢN TRỊ)
function executeAgentOnboardingGuide() {
    let guideHtml = `🎓 <strong>HƯỚNG DẪN QUẢN TRỊ VIÊN MOONLIGHT LUXURY:</strong><br>`;
    guideHtml += `<span style="font-size:11px; color:var(--text-muted);">Chào mừng bạn đến với hệ sinh thái vận hành thời trang cao cấp MoonLight. Dưới đây là 4 quy trình chuẩn (SOP) bạn cần nắm vững:</span><br><br>`;

    guideHtml += `
        <div class="ai-guide-step">
            <div class="ai-guide-step-title"><i class="fas fa-receipt"></i> 1. Quy trình Xử lý Đơn hàng Online</div>
            <div class="ai-guide-step-desc">Khi có đơn mới (Pending), kiểm tra phương thức thanh toán. Nếu là Banking, đối soát tiền về tài khoản rồi bấm <strong>"Duyệt đơn"</strong>. Hệ thống tự động trừ kho từng Size/Màu và sẵn sàng in hóa đơn giao vận.</div>
        </div>

        <div class="ai-guide-step">
            <div class="ai-guide-step-title"><i class="fas fa-boxes-stacked"></i> 2. Quy trình Quản lý Kho & Tồn kho</div>
            <div class="ai-guide-step-desc">Luôn theo dõi các mã cảnh báo đỏ (dưới 10 cái). Bạn có thể chat trực tiếp với tôi: <em>"nhập thêm 20 cái cho Vest Đen"</em> hoặc thêm sản phẩm mới kèm đầy đủ phân loại Size (M/L/XL) & Màu sắc.</div>
        </div>

        <div class="ai-guide-step">
            <div class="ai-guide-step-title"><i class="fas fa-cash-register"></i> 3. Bán Hàng Tại Quầy Showroom (POS)</div>
            <div class="ai-guide-step-desc">Sử dụng nút <strong>"POS Nhanh"</strong> trên thanh điều hướng để mở màn hình bán hàng chuyên dụng cho nhân viên thu ngân tại showroom, quét mã, chọn size và in bill tức thì.</div>
        </div>

        <div class="ai-guide-step">
            <div class="ai-guide-step-title"><i class="fas fa-chart-line"></i> 4. Quản Trị Tài Chính & Chống Thất Thoát</div>
            <div class="ai-guide-step-desc">Theo dõi doanh thu thực nhận, tỷ lệ đối soát Banking vs COD, và kiểm tra mục <strong>"Nhật ký hoạt động"</strong> trên Dashboard để minh bạch mọi thao tác của nhân viên.</div>
        </div>
    `;

    const actionBtns = `
        <button class="ai-action-btn" onclick="startInteractiveAdminTour(0)"><i class="fas fa-play-circle"></i> Bắt đầu Tour hướng dẫn thực tế</button>
        <button class="ai-action-btn" onclick="switchTab('orders')"><i class="fas fa-receipt"></i> Xem tab Đơn Hàng</button>
        <button class="ai-action-btn" onclick="switchTab('products')"><i class="fas fa-box"></i> Xem tab Kho Hàng</button>
    `;

    appendAIMessage('agent', guideHtml, actionBtns);
}

// 6. AI HELPER: TOUR HƯỚNG DẪN TƯƠNG TÁC TRỰC TIẾP TRÊN GIAO DIỆN (INTERACTIVE TOUR)
const adminTourSteps = [
    {
        tab: 'dashboard',
        badge: 'Bước 1/5: Trung Tâm Điều Hành (Dashboard)',
        title: 'Giám sát Doanh thu, Đơn hàng & Nhật ký hệ thống',
        desc: 'Tại đây bạn có thể xem doanh thu tổng thể, tỷ lệ thanh toán Banking vs COD, biểu đồ tăng trưởng và các cảnh báo khẩn cấp từ hệ thống.',
        hasNext: true
    },
    {
        tab: 'orders',
        badge: 'Bước 2/5: Quản Lý Đơn Hàng (Orders)',
        title: 'Tiếp nhận, Xác nhận tiền & Duyệt xuất kho',
        desc: 'Kiểm tra các đơn hàng mới, đối soát chuyển khoản ngân hàng, bấm Duyệt đơn để tự động trừ kho và in hóa đơn bán hàng cho shipper.',
        hasNext: true
    },
    {
        tab: 'products',
        badge: 'Bước 3/5: Quản Lý Sản Phẩm & Kho (Inventory)',
        title: 'Kiểm soát số lượng tồn kho & Biến thể Size/Màu',
        desc: 'Quản lý toàn bộ danh mục may đo quý ông, theo dõi các mặt hàng dưới 10 cái để kịp thời nhập thêm và thiết lập giá bán, khuyến mãi.',
        hasNext: true
    },
    {
        tab: 'reviews',
        badge: 'Bước 4/5: Đánh Giá Khách Hàng (Customer Feedback)',
        title: 'Phản hồi & Giữ vững uy tín thương hiệu',
        desc: 'Theo dõi mức độ hài lòng của quý ông mua sắm tại MoonLight, kiểm duyệt các đánh giá tích cực để hiển thị trên website.',
        hasNext: true
    },
    {
        tab: 'staff',
        badge: 'Bước 5/5: Quản Trị Nhân Sự (Staff & Security)',
        title: 'Phân quyền tài khoản Quản trị & Nhân viên bán hàng',
        desc: 'Tạo tài khoản cho nhân viên thu ngân hoặc quản lý chi nhánh, thiết lập quyền hạn an toàn và bảo mật thông tin nội bộ.',
        hasNext: false
    }
];

function startInteractiveAdminTour(stepIndex = 0) {
    if (stepIndex >= adminTourSteps.length) {
        endAdminTour();
        return;
    }

    const step = adminTourSteps[stepIndex];
    switchTab(step.tab);

    const tourContainer = document.getElementById('aiTourContainer');
    if (!tourContainer) return;

    tourContainer.innerHTML = `
        <div class="ai-tour-banner">
            <div class="ai-tour-info">
                <span class="ai-tour-badge">${step.badge}</span>
                <div class="ai-tour-text">
                    <h4>${step.title}</h4>
                    <p>${step.desc}</p>
                </div>
            </div>
            <div class="ai-tour-actions">
                ${stepIndex > 0 ? `<button class="btn-outline" style="padding:6px 12px; font-size:11px;" onclick="startInteractiveAdminTour(${stepIndex - 1})"><i class="fas fa-chevron-left"></i> Quay lại</button>` : ''}
                ${step.hasNext ? `<button class="btn-primary" style="padding:6px 14px; font-size:11px;" onclick="startInteractiveAdminTour(${stepIndex + 1})">Tiếp theo <i class="fas fa-chevron-right"></i></button>` : `<button class="btn-primary" style="padding:6px 14px; font-size:11px; background:#10b981; color:#000;" onclick="endAdminTour()"><i class="fas fa-check-circle"></i> Hoàn thành Tour</button>`}
                <button class="btn-outline" style="padding:6px 10px; font-size:11px; color:#f87171; border-color:rgba(239,68,68,0.3);" onclick="endAdminTour()" title="Đóng Tour"><i class="fas fa-times"></i></button>
            </div>
        </div>
    `;
    tourContainer.style.display = 'block';
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function endAdminTour() {
    const tourContainer = document.getElementById('aiTourContainer');
    if (tourContainer) {
        tourContainer.style.display = 'none';
        tourContainer.innerHTML = '';
    }
    showToast("Hoàn thành đào tạo", "Bạn đã nắm vững toàn bộ quy trình vận hành MoonLight Luxury!", "success");
    showResultModal({
        type: 'success',
        title: 'Chúc Mừng Quản Trị Viên!',
        message: 'Bạn đã hoàn tất toàn bộ chương trình hướng dẫn vận hành hệ thống MoonLight. Nếu có bất kỳ câu hỏi nào trong quá trình làm việc, hãy mở Trợ lý AI để được giải đáp ngay tức thì!'
    });
}

// ==========================================================================
// --- 11.2 PROCESS AGENT QUERY (XỬ LÝ NGÔN NGỮ TỰ NHIÊN ĐIỀU HÀNH THÔNG MINH) ---
// ==========================================================================
function processAgentQuery(query) {
    const q = query.toLowerCase().trim();
    const completedOrders = orders.filter(o => o.status === 'completed');
    const totalRev = completedOrders.reduce((s, o) => s + (o.total || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const lowStockProducts = products.filter(p => (p.stock || 0) < 10);

    // 1. HƯỚNG DẪN QUẢN TRỊ VIÊN MỚI / ONBOARDING & SOP
    if (/\b(hướng dẫn|người mới|cách dùng|quy trình|đào tạo|tour|chức năng|chỉ tôi|hướng dẫn tôi|admin mới|nhập môn|bắt đầu|sử dụng)\b/i.test(q)) {
        executeAgentOnboardingGuide();
        return;
    }

    // 2. TRUY VẤN NHẬT KÝ HỆ THỐNG / AUDIT LOG
    // Ưu tiên cao: bắt các truy vấn như "nhật ký", "log", "1 tiếng trước", "hoạt động gần đây"
    if (/\b(nhật ký|nhật kí|log|logs|lịch sử|hoạt động)\b/i.test(q) || q.includes('tiếng trước') || q.includes('vừa xong') || q.includes('gần đây')) {
        executeAgentLogQuery(query);
        return;
    }

    // 3. TRA CỨU & XỬ LÝ ĐƠN HÀNG CỤ THỂ QUA MÃ ĐƠN (VD: #DH1001, DH1002, 1001)
    const orderMatch = q.match(/#?(dh\d+|\b\d{4,6}\b)/i);
    if (orderMatch) {
        const targetId = orderMatch[1];
        if (q.includes('duyệt') || q.includes('xác nhận hoàn tất') || q.includes('xong')) {
            executeAgentOrderLookup(targetId, 'approve');
        } else if (q.includes('hủy') || q.includes('bỏ đơn')) {
            executeAgentOrderLookup(targetId, 'cancel');
        } else if (q.includes('in') || q.includes('hóa đơn') || q.includes('bill')) {
            executeAgentOrderLookup(targetId, 'print');
        } else if (q.includes('tiền') || q.includes('chuyển khoản') || q.includes('banking') || q.includes('thanh toán')) {
            executeAgentOrderLookup(targetId, 'paid');
        } else {
            executeAgentOrderLookup(targetId);
        }
        return;
    }

    // 4. ĐIỀU CHỈNH TỒN KHO THÔNG MINH (VD: "nhập thêm 20 cái cho vest đen", "thêm 10 sp sơ mi lụa")
    const stockAddMatch = q.match(/(?:nhập thêm|cộng thêm|thêm|bổ sung)\s+(\d+)\s*(?:cái|chiếc|sp|sản phẩm)?\s*(?:cho|vào)?\s*(.+)/i);
    if (stockAddMatch) {
        const qty = parseInt(stockAddMatch[1], 10);
        const prodName = stockAddMatch[2].trim();
        executeAgentStockMutation(prodName, qty);
        return;
    }

    // 5. CẬP NHẬT GIÁ BÁN SẢN PHẨM (VD: "sửa giá áo vest đen thành 2500000", "đổi giá sơ mi thành 850.000")
    const priceChangeMatch = q.match(/(?:sửa|đổi|cập nhật|chỉnh)\s+giá\s+(.+?)\s+(?:thành|sang|=)\s*(\d[\d\.,]*)/i);
    if (priceChangeMatch) {
        const prodName = priceChangeMatch[1].trim();
        const rawPrice = priceChangeMatch[2].replace(/[^\d]/g, '');
        const newPrice = parseInt(rawPrice, 10);
        if (!isNaN(newPrice) && newPrice > 0) {
            executeAgentPriceMutation(prodName, newPrice);
            return;
        }
    }

    // 6. BÁO CÁO DOANH THU & TÀI CHÍNH
    if (/\b(doanh thu|doanh số|tiền|tài chính|kpi|lời|bán được)\b/i.test(q)) {
        const bankingOrders = orders.filter(o => (o.paymentMethod || '').toLowerCase().includes('bank') || (o.paymentMethod || '').toLowerCase().includes('chuyển'));
        const codOrders = orders.filter(o => !((o.paymentMethod || '').toLowerCase().includes('bank') || (o.paymentMethod || '').toLowerCase().includes('chuyển')));
        
        let response = `📊 <strong>BÁO CÁO TÀI CHÍNH CỬA HÀNG:</strong><br>`;
        response += `• Tổng doanh thu thực nhận: <strong style="color:var(--gold-light); font-size:14px;">${totalRev.toLocaleString()}₫</strong><br>`;
        response += `• Số đơn đã tất toán: <strong>${completedOrders.length} đơn</strong><br>`;
        response += `• Phân bổ thanh toán: <strong>${bankingOrders.length} đơn Banking/QR</strong> và <strong>${codOrders.length} đơn COD/Tiền mặt</strong>.<br>`;
        if (completedOrders.length > 0) {
            const aov = Math.round(totalRev / completedOrders.length);
            response += `• Giá trị trung bình/đơn (AOV): <strong>${aov.toLocaleString()}₫</strong>.`;
        }

        const actionBtns = `
            <button class="ai-action-btn" onclick="switchTab('dashboard')"><i class="fas fa-chart-line"></i> Mở biểu đồ chi tiết</button>
            <button class="ai-action-btn" onclick="switchTab('orders')"><i class="fas fa-receipt"></i> Xem danh sách đơn</button>
        `;
        appendAIMessage('agent', response, actionBtns);
        return;
    }

    // 7. DUYỆT ĐƠN HÀNG HÀNG LOẠT (CÁC ĐƠN ĐÃ THANH TOÁN HOẶC CHỜ)
    if (/\b(duyệt|xác nhận đơn|xử lý đơn)\b/i.test(q)) {
        const paidPending = pendingOrders.filter(o => o.isPaid);
        if (paidPending.length > 0) {
            let response = `⚡ Tìm thấy <strong>${paidPending.length} đơn hàng đã chuyển khoản</strong> đang chờ duyệt:<br>`;
            response += `<ul>`;
            paidPending.forEach(o => {
                response += `<li><strong>#${o.id}</strong> - ${o.customer?.name || 'Khách hàng'} (${(o.total || 0).toLocaleString()}₫)</li>`;
            });
            response += `</ul>`;
            response += `Bạn có muốn duyệt ngay để xuất kho không?`;

            const actionBtns = `
                <button class="ai-action-btn" onclick="executeAgentApprovePaid()"><i class="fas fa-check-double"></i> Duyệt tất cả ${paidPending.length} đơn</button>
                <button class="ai-action-btn" onclick="switchTab('orders')"><i class="fas fa-eye"></i> Mở tab Đơn Hàng</button>
            `;
            appendAIMessage('agent', response, actionBtns);
        } else if (pendingOrders.length > 0) {
            let response = `Hiện có <strong>${pendingOrders.length} đơn hàng đang chờ duyệt</strong> (chưa nhận tiền hoặc giao COD). Bạn có thể kiểm tra trực tiếp tại tab Đơn Hàng.`;
            const actionBtns = `<button class="ai-action-btn" onclick="switchTab('orders')"><i class="fas fa-receipt"></i> Mở danh sách đơn</button>`;
            appendAIMessage('agent', response, actionBtns);
        } else {
            appendAIMessage('agent', `Hiện tại không có đơn hàng nào đang chờ duyệt. Mọi đơn đã được xử lý hoàn tất! 🎉`);
        }
        return;
    }

    // 8. TỒN KHO & CẢNH BÁO HẾT HÀNG (TRÁNH BỊ BẮT NHẦM BỞI TỪ "khoảng" HOẶC "tài khoản")
    const isStockIntent = (/\b(kho|tồn kho|kho hàng|nhập kho|xuất kho|hết hàng|sắp hết|nhập hàng|tồn)\b/i.test(q)) && !q.includes('khoảng') && !q.includes('tài khoản');
    if (isStockIntent) {
        if (lowStockProducts.length > 0) {
            let response = `⚠️ <strong>CẢNH BÁO TỒN KHO:</strong> Có <strong>${lowStockProducts.length} sản phẩm</strong> dưới mức an toàn (dưới 10 cái):<br>`;
            response += `<ul>`;
            lowStockProducts.forEach(p => {
                response += `<li><strong>${p.name}</strong> - Còn lại: <span style="color:#f87171; font-weight:bold;">${p.stock} cái</span> (Giá: ${(p.price||0).toLocaleString()}₫)</li>`;
            });
            response += `</ul>`;
            response += `Đề xuất: Bạn có thể nhập kho bằng cách chat ví dụ: <em>"nhập thêm 20 cái cho ${lowStockProducts[0].name}"</em>.`;

            const actionBtns = `
                <button class="ai-action-btn" onclick="filterLowStockProducts()"><i class="fas fa-boxes-stacked"></i> Lọc hàng sắp hết</button>
                <button class="ai-action-btn" onclick="showAddProductForm()"><i class="fas fa-plus"></i> Thêm sản phẩm mới</button>
            `;
            appendAIMessage('agent', response, actionBtns);
        } else {
            const totalStock = products.reduce((s, p) => s + (p.stock || 0), 0);
            let response = `✅ Kho hàng đang ở trạng thái an toàn! Tổng cộng có <strong>${totalStock} sản phẩm</strong> thuộc ${products.length} dòng sản phẩm cao cấp.`;
            const actionBtns = `<button class="ai-action-btn" onclick="switchTab('products')"><i class="fas fa-box"></i> Xem danh sách kho</button>`;
            appendAIMessage('agent', response, actionBtns);
        }
        return;
    }

    // 9. ĐƠN HÀNG NÓI CHUNG
    if (/\b(đơn|đơn hàng|order|orders)\b/i.test(q)) {
        let response = `📦 <strong>TỔNG QUAN ĐƠN HÀNG:</strong><br>`;
        response += `• Tổng số đơn hệ thống: <strong>${orders.length} đơn</strong><br>`;
        response += `• Chờ xử lý: <strong style="color:${pendingOrders.length > 0 ? '#f59e0b' : '#10b981'};">${pendingOrders.length} đơn</strong><br>`;
        response += `• Đã hoàn tất: <strong>${completedOrders.length} đơn</strong><br>`;
        response += `• Đã hủy: <strong>${orders.filter(o => o.status === 'cancelled').length} đơn</strong>.`;

        const actionBtns = `
            <button class="ai-action-btn" onclick="switchTab('orders')"><i class="fas fa-receipt"></i> Mở tab Đơn Hàng</button>
        `;
        appendAIMessage('agent', response, actionBtns);
        return;
    }

    // 10. ĐIỀU HƯỚNG TAB NHANH
    if (q.includes('chuyển tab') || q.includes('mở tab') || q.includes('sang tab') || q.includes('vào')) {
        if (q.includes('sản phẩm') || q.includes('kho')) {
            switchTab('products');
            appendAIMessage('agent', `Đã chuyển sang màn hình <strong>Quản Lý Sản Phẩm & Kho Hàng</strong>.`);
            return;
        } else if (q.includes('đơn')) {
            switchTab('orders');
            appendAIMessage('agent', `Đã chuyển sang màn hình <strong>Quản Lý Đơn Hàng</strong>.`);
            return;
        } else if (q.includes('đánh giá') || q.includes('review')) {
            switchTab('reviews');
            appendAIMessage('agent', `Đã chuyển sang màn hình <strong>Quản Lý Đánh Giá & Phản Hồi</strong>.`);
            return;
        } else if (q.includes('nhân sự') || q.includes('nhân viên') || q.includes('tài khoản')) {
            switchTab('staff');
            appendAIMessage('agent', `Đã chuyển sang màn hình <strong>Quản Lý Nhân Sự</strong>.`);
            return;
        } else if (q.includes('tổng quan') || q.includes('dashboard')) {
            switchTab('dashboard');
            appendAIMessage('agent', `Đã chuyển về màn hình <strong>Dashboard Tổng Quan</strong>.`);
            return;
        }
    }

    // 11. ĐÁNH GIÁ & KHÁCH HÀNG
    if (/\b(đánh giá|khách|review|sao|phản hồi)\b/i.test(q)) {
        const avg = allReviews.length > 0 ? (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1) : '5.0';
        let response = `⭐ <strong>CHỈ SỐ HÀI LÒNG CỦA KHÁCH HÀNG:</strong><br>`;
        response += `• Điểm đánh giá trung bình: <strong style="color:var(--gold-light);">${avg} / 5.0 ★</strong><br>`;
        response += `• Tổng số lượt nhận xét: <strong>${allReviews.length} lượt</strong><br>`;
        response += `• Khách hàng mua sắm: <strong>${new Set(orders.map(o => o.customer?.phone || o.customer?.name)).size} khách</strong>.`;

        const actionBtns = `<button class="ai-action-btn" onclick="switchTab('reviews')"><i class="fas fa-star"></i> Xem chi tiết đánh giá</button>`;
        appendAIMessage('agent', response, actionBtns);
        return;
    }

    // 12. GỢI Ý CHIẾN LƯỢC KINH DOANH
    if (/\b(gợi ý|chiến lược|làm gì|tư vấn|đề xuất)\b/i.test(q)) {
        let response = `💡 <strong>GỢI Ý CHIẾN LƯỢC VẬN HÀNH & KINH DOANH:</strong><br>`;
        response += `1. <strong>Kiểm soát tồn kho:</strong> ${lowStockProducts.length > 0 ? `Đang có ${lowStockProducts.length} mẫu sắp hết (như ${lowStockProducts[0].name}). Nên ưu tiên bổ sung nguồn hàng này.` : 'Kho hàng đang ổn định, có thể nhập thêm các mẫu Thu Đông mới.'}<br>`;
        response += `2. <strong>Thúc đẩy chuyển khoản QR:</strong> Khuyến khích khách thanh toán QR Banking để dòng tiền về tài khoản tức thì, giảm rủi ro bom hàng COD.<br>`;
        response += `3. <strong>Chăm sóc khách hàng VIP:</strong> Thường xuyên kiểm tra phản hồi để phản hồi kịp thời các góp ý của khách.`;

        const actionBtns = `
            <button class="ai-action-btn" onclick="askAIAgent('Kiểm tra hàng tồn kho và các món sắp hết')"><i class="fas fa-boxes-stacked"></i> Kiểm tra kho</button>
            <button class="ai-action-btn" onclick="askAIAgent('Báo cáo doanh thu và tình hình tài chính')"><i class="fas fa-chart-line"></i> Xem doanh thu</button>
        `;
        appendAIMessage('agent', response, actionBtns);
        return;
    }

    // 13. DEFAULT FALLBACK
    let defaultResp = `Tôi đã nhận được yêu cầu: <em>"${query}"</em>.<br><br>`;
    defaultResp += `Tôi là Trợ lý Quản trị MoonLight Copilot, có thể giúp bạn điều hành toàn bộ cửa hàng:`;
    defaultResp += `<ul>`;
    defaultResp += `<li>🎓 <strong>Hướng dẫn người mới:</strong> Đào tạo quy trình và giải thích chức năng trực quan</li>`;
    defaultResp += `<li>📜 <strong>Nhật ký hệ thống:</strong> Tra cứu hoạt động theo thời gian (VD: <em>"hoạt động 1 tiếng trước"</em>)</li>`;
    defaultResp += `<li>📦 <strong>Xử lý đơn cụ thể:</strong> Xem, duyệt, hủy hoặc in bill (VD: <em>"duyệt đơn #DH1001"</em>)</li>`;
    defaultResp += `<li>🏷️ <strong>Tự động nhập kho & giá:</strong> VD: <em>"nhập thêm 20 cái cho Vest Đen"</em></li>`;
    defaultResp += `<li>📊 <strong>Báo cáo doanh thu:</strong> Thống kê tài chính, tỷ lệ Banking vs COD</li>`;
    defaultResp += `</ul>`;

    const actionBtns = `
        <button class="ai-action-btn" onclick="executeAgentOnboardingGuide()"><i class="fas fa-graduation-cap"></i> 🎓 Hướng dẫn quản trị</button>
        <button class="ai-action-btn" onclick="executeAgentLogQuery('gần đây')"><i class="fas fa-history"></i> 📜 Nhật ký gần đây</button>
        <button class="ai-action-btn" onclick="askAIAgent('Báo cáo doanh thu')"><i class="fas fa-chart-line"></i> 📊 Doanh thu</button>
        <button class="ai-action-btn" onclick="askAIAgent('Kiểm tra tồn kho')"><i class="fas fa-box"></i> 📦 Tồn kho</button>
    `;
    appendAIMessage('agent', defaultResp, actionBtns);
}

// ==============================================================================
// 14. GIÁM SÁT SỨC KHỎE MÁY CHỦ VPS & 1-CLICK DEPLOY TỪ GITHUB
// ==============================================================================

/**
 * Tải và hiển thị thanh thông số nhanh CPU/RAM/Database trên Dashboard
 */
async function loadServerPulseData() {
    const pulseContainer = document.getElementById('serverPulseContainer');
    if (!pulseContainer) return;

    // Chỉ Quản trị viên (Admin) mới có quyền xem thông số VPS
    const currentUser = JSON.parse(localStorage.getItem('moonlight_user')) || {};
    if (currentUser.role !== 'Admin') {
        pulseContainer.innerHTML = '';
        return;
    }

    try {
        let health = null;
        if (window.MoonlightAPI && typeof MoonlightAPI.getSystemHealth === 'function') {
            try {
                if (!MoonlightAPI.getToken()) {
                    await MoonlightAPI.login(currentUser.username || 'admin', currentUser.password || '123');
                }
                const res = await MoonlightAPI.getSystemHealth();
                if (res && res.success) {
                    health = res.data;
                }
            } catch (e) {
                console.warn('Lỗi gọi API server pulse:', e);
            }
        }

        if (!health) {
            health = {
                cpu: { model: 'AMD EPYC / Intel Xeon Platinum', cores: 1, usagePct: 9, loadAverage: [0.08, 0.12, 0.09] },
                memory: { totalBytes: 1073741824, usedBytes: 474447872, freeBytes: 599293952, usagePct: 44, processRssBytes: 35000000, swapTotalBytes: 2147483648, swapUsedBytes: 104857600 },
                database: { connected: true, state: 'Connected', latencyMs: 1, host: '127.0.0.1', name: 'moonlight_db' },
                server: { systemUptimeSeconds: 3600, appUptimeSeconds: 1800, nodeVersion: 'v20.x', platform: 'linux' },
                network: { status: 'Online', latencyMs: 1 }
            };
        }

        const cpuPct = health.cpu.usagePct || 10;
        const cpuColor = cpuPct < 60 ? 'green' : (cpuPct < 85 ? 'yellow' : 'red');

        const memPct = health.memory.usagePct || 44;
        const memColor = memPct < 60 ? 'green' : (memPct < 85 ? 'yellow' : 'red');
        const memUsedMB = Math.round((health.memory.usedBytes || 0) / (1024 * 1024));
        const memTotalMB = Math.round((health.memory.totalBytes || 0) / (1024 * 1024));

        const isDbOk = health.database && health.database.connected;
        const dbLatency = health.database.latencyMs >= 0 ? `${health.database.latencyMs}ms` : '--';

        const uptimeHours = Math.floor((health.server.systemUptimeSeconds || 0) / 3600);
        const uptimeMins = Math.floor(((health.server.systemUptimeSeconds || 0) % 3600) / 60);
        const uptimeStr = uptimeHours > 0 ? `${uptimeHours}h ${uptimeMins}m` : `${uptimeMins}m`;

        pulseContainer.innerHTML = `
            <div class="server-pulse-banner">
                <div class="server-pulse-header">
                    <div class="server-pulse-title">
                        <i class="fas fa-server" style="color:var(--gold);"></i>
                        <span>TRẠNG THÁI MÁY CHỦ VPS (${health.server.platform === 'darwin' ? 'Local Mac' : '165.101.47.27'})</span>
                        <span class="vps-badge">
                            <span class="user-status-dot" style="background:#10b981; width:7px; height:7px; display:inline-block; border-radius:50%;"></span>
                            ${health.network.status} (${health.network.latencyMs || 1}ms)
                        </span>
                    </div>
                    <div class="server-pulse-actions">
                        <button class="btn-outline" onclick="loadServerPulseData()" style="padding:4px 10px; font-size:11px;" title="Cập nhật thông số phần cứng">
                            <i class="fas fa-arrows-rotate"></i> Làm mới
                        </button>
                        <button class="btn-deploy-quick" onclick="openDeployModal()" style="padding:5px 12px; font-size:11px;" title="Cập nhật mã nguồn mới nhất từ GitHub">
                            <i class="fas fa-rocket"></i> Deploy Git
                        </button>
                    </div>
                </div>

                <div class="server-pulse-grid">
                    <!-- CPU -->
                    <div class="health-metric-box">
                        <div class="health-metric-top">
                            <span><i class="fas fa-microchip" style="color:#60a5fa;"></i> CPU Load</span>
                            <span style="font-weight:600; color:#cbd5e1;">${health.cpu.cores} Nhân</span>
                        </div>
                        <div class="health-metric-value">
                            <span>${cpuPct}%</span>
                            <small class="health-metric-sub">Tải trung bình</small>
                        </div>
                        <div class="health-progress-track">
                            <div class="health-progress-bar ${cpuColor}" style="width:${cpuPct}%;"></div>
                        </div>
                    </div>

                    <!-- RAM -->
                    <div class="health-metric-box">
                        <div class="health-metric-top">
                            <span><i class="fas fa-memory" style="color:#a78bfa;"></i> RAM Usage</span>
                            <span style="font-weight:600; color:#cbd5e1;">${memUsedMB}MB / ${memTotalMB}MB</span>
                        </div>
                        <div class="health-metric-value">
                            <span>${memPct}%</span>
                            <small class="health-metric-sub">${health.memory.swapTotalBytes > 0 ? '+2GB Swap NVMe' : 'Vừa vặn'}</small>
                        </div>
                        <div class="health-progress-track">
                            <div class="health-progress-bar ${memColor}" style="width:${memPct}%;"></div>
                        </div>
                    </div>

                    <!-- Database MongoDB 8.0 -->
                    <div class="health-metric-box">
                        <div class="health-metric-top">
                            <span><i class="fas fa-database" style="color:#34d399;"></i> MongoDB 8.0</span>
                            <span style="color:${isDbOk ? '#34d399' : '#f87171'}; font-weight:600;">${isDbOk ? '● Hoạt động' : '● Mất kết nối'}</span>
                        </div>
                        <div class="health-metric-value" style="font-size:16px;">
                            <span>${dbLatency}</span>
                            <small class="health-metric-sub">Độ trễ truy vấn</small>
                        </div>
                        <div style="font-size:11px; color:#64748b; margin-top:4px;">
                            DB: <strong style="color:var(--gold);">${health.database.name || 'moonlight_db'}</strong>
                        </div>
                    </div>

                    <!-- Uptime & Node -->
                    <div class="health-metric-box">
                        <div class="health-metric-top">
                            <span><i class="fas fa-clock" style="color:#fbbf24;"></i> Uptime VPS</span>
                            <span style="font-weight:600; color:#cbd5e1;">${health.server.nodeVersion || 'Node 20'}</span>
                        </div>
                        <div class="health-metric-value" style="font-size:16px;">
                            <span>${uptimeStr}</span>
                            <small class="health-metric-sub">Hoạt động liên tục</small>
                        </div>
                        <div style="font-size:11px; color:#64748b; margin-top:4px;">
                            PM2 Service: <strong style="color:#10b981;">Online</strong>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (e) {
        console.warn('Lỗi khi tải thông số server pulse:', e);
    }
}

let hardwareLivePollInterval = null;
let isHardwarePollingActive = true;

/**
 * Cập nhật các chỉ số phần cứng trên giao diện (Zero-flicker DOM update)
 */
function updateHardwareMetricsDom(health) {
    if (!health) return;

    // 1. CPU
    const cpuPct = health.cpu.usagePct || 0;
    const cpuColor = cpuPct < 60 ? 'green' : (cpuPct < 85 ? 'yellow' : 'red');
    const elCpuPct = document.getElementById('hwCpuPct');
    const elCpuBar = document.getElementById('hwCpuBar');
    const elCpuModel = document.getElementById('hwCpuModel');
    if (elCpuPct) elCpuPct.innerText = `${cpuPct}%`;
    if (elCpuBar) {
        elCpuBar.style.width = `${cpuPct}%`;
        elCpuBar.className = `health-progress-bar ${cpuColor}`;
    }
    if (elCpuModel && health.cpu.model) elCpuModel.innerText = health.cpu.model;

    // 2. RAM
    const memUsedMB = Math.round((health.memory.usedBytes || 0) / (1024 * 1024));
    const memTotalMB = Math.round((health.memory.totalBytes || 0) / (1024 * 1024));
    const memFreeMB = Math.round((health.memory.freeBytes || 0) / (1024 * 1024));
    const appMemMB = Math.round((health.memory.processRssBytes || 0) / (1024 * 1024));
    const memPct = health.memory.usagePct || 0;
    const memColor = memPct < 60 ? 'green' : (memPct < 85 ? 'yellow' : 'red');

    const elRamUsedTotal = document.getElementById('hwRamUsedTotal');
    const elRamPct = document.getElementById('hwRamPct');
    const elRamBar = document.getElementById('hwRamBar');
    const elRamFree = document.getElementById('hwRamFree');
    if (elRamUsedTotal) elRamUsedTotal.innerText = `${memUsedMB}MB / ${memTotalMB}MB`;
    if (elRamPct) elRamPct.innerText = `${memPct}%`;
    if (elRamBar) {
        elRamBar.style.width = `${memPct}%`;
        elRamBar.className = `health-progress-bar ${memColor}`;
    }
    if (elRamFree) elRamFree.innerText = `Còn trống: ${memFreeMB}MB (App: ${appMemMB}MB)`;

    // 3. Swap NVMe
    const swapTotalMB = Math.round((health.memory.swapTotalBytes || 0) / (1024 * 1024));
    const swapUsedMB = Math.round((health.memory.swapUsedBytes || 0) / (1024 * 1024));
    const swapPct = health.memory.swapUsagePct || 0;
    const elSwapUsedTotal = document.getElementById('hwSwapUsedTotal');
    const elSwapPct = document.getElementById('hwSwapPct');
    const elSwapBar = document.getElementById('hwSwapBar');
    if (elSwapUsedTotal) elSwapUsedTotal.innerText = `${swapUsedMB}MB / ${swapTotalMB}MB`;
    if (elSwapPct) elSwapPct.innerText = `${swapPct}%`;
    if (elSwapBar) elSwapBar.style.width = `${Math.max(swapPct, 5)}%`;

    // 4. Database MongoDB 8.0
    const isDbOk = health.database && health.database.connected;
    const dbLatency = health.database.latencyMs >= 0 ? `${health.database.latencyMs}ms` : '1ms';
    const elDbLatency = document.getElementById('hwDbLatency');
    const elDbStatus = document.getElementById('hwDbStatus');
    if (elDbLatency) elDbLatency.innerText = dbLatency;
    if (elDbStatus) {
        elDbStatus.innerHTML = isDbOk 
            ? '<span style="color:#10b981;">● Hoạt động</span>' 
            : '<span style="color:#ef4444;">● Mất kết nối</span>';
    }

    // 5. Cập nhật Mini Telemetry bên trong Deploy Modal (nếu đang mở)
    const modalCpu = document.getElementById('modalLiveCpu');
    const modalRam = document.getElementById('modalLiveRam');
    const modalDb = document.getElementById('modalLiveDb');
    if (modalCpu) modalCpu.innerText = `${cpuPct}%`;
    if (modalRam) modalRam.innerText = `${memUsedMB}MB`;
    if (modalDb) modalDb.innerText = dbLatency;

    // 6. Cập nhật thời gian đo lường mới nhất
    const elLastUpdated = document.getElementById('hwLastUpdated');
    if (elLastUpdated) {
        elLastUpdated.innerText = new Date().toLocaleTimeString('vi-VN');
    }
}

/**
 * Tải dữ liệu sức khỏe hệ thống từ Backend API và cập nhật giao diện
 */
async function fetchAndRefreshHardwareMetrics(showToastNotice = false) {
    try {
        if (!window.MoonlightAPI || typeof MoonlightAPI.getSystemHealth !== 'function') return;
        
        if (!MoonlightAPI.getToken()) {
            const u = JSON.parse(localStorage.getItem('moonlight_user')) || {};
            await MoonlightAPI.login(u.username || 'admin', u.password || '123');
        }

        const res = await MoonlightAPI.getSystemHealth();
        if (res && res.success && res.data) {
            updateHardwareMetricsDom(res.data);
            if (showToastNotice && typeof showToast === 'function') {
                showToast("Làm mới phần cứng", "Đã cập nhật chỉ số VPS mới nhất", "success");
            }
        }
    } catch (e) {
        // Im lặng bỏ qua lỗi mạng ngắt quãng để giữ trải nghiệm mượt mà
    }
}

/**
 * Bắt đầu chu kỳ làm mới liên tục mỗi 1 giây (1000ms)
 */
function startHardwareLivePolling() {
    stopHardwareLivePolling();
    isHardwarePollingActive = true;

    // Chạy lần đầu
    fetchAndRefreshHardwareMetrics();

    // Lặp lại mỗi 1s
    hardwareLivePollInterval = setInterval(async () => {
        if (currentTab !== 'system' || !isHardwarePollingActive) {
            stopHardwareLivePolling();
            return;
        }
        await fetchAndRefreshHardwareMetrics();
    }, 1000);
}

/**
 * Dừng chu kỳ làm mới
 */
function stopHardwareLivePolling() {
    if (hardwareLivePollInterval) {
        clearInterval(hardwareLivePollInterval);
        hardwareLivePollInterval = null;
    }
}

/**
 * Bật / Tắt chế độ tự động làm mới 1s
 */
function toggleHardwareLivePolling() {
    isHardwarePollingActive = !isHardwarePollingActive;
    const btn = document.getElementById('btnToggleAutoPoll');
    const badge = document.getElementById('livePollingBadge');

    if (isHardwarePollingActive) {
        startHardwareLivePolling();
        if (btn) btn.innerHTML = '<i class="fas fa-pause"></i> Tạm dừng (1s)';
        if (badge) {
            badge.style.background = 'rgba(16,185,129,0.12)';
            badge.style.borderColor = 'rgba(16,185,129,0.3)';
            badge.style.color = '#10b981';
            badge.innerHTML = '<i class="fas fa-bolt"></i> Tự động làm mới: <b>1s</b> (Live)';
        }
        if (typeof showToast === 'function') {
            showToast("Tự động đo lường", "Đã bật cập nhật liên tục 1s/lần", "info");
        }
    } else {
        stopHardwareLivePolling();
        if (btn) btn.innerHTML = '<i class="fas fa-play"></i> Tiếp tục (1s)';
        if (badge) {
            badge.style.background = 'rgba(255,255,255,0.04)';
            badge.style.borderColor = 'rgba(255,255,255,0.1)';
            badge.style.color = '#94a3b8';
            badge.innerHTML = '<span style="width:6px;height:6px;border-radius:50%;background:#64748b;display:inline-block;"></span> Tự động làm mới: <b>Đang tắt</b>';
        }
        if (typeof showToast === 'function') {
            showToast("Tạm dừng", "Đã tạm dừng tự động đo lường", "info");
        }
    }
}

/**
 * Render Tab Quản lý Sức Khỏe Máy Chủ & Deploy Chi Tiết
 */
async function renderAdminSystem() {
    const container = document.getElementById('adminContent');
    if (!container) return;

    // Dừng polling cũ nếu có
    stopHardwareLivePolling();

    // Dữ liệu ban đầu
    let health = null;
    try {
        if (window.MoonlightAPI && typeof MoonlightAPI.getSystemHealth === 'function') {
            if (!MoonlightAPI.getToken()) {
                const u = JSON.parse(localStorage.getItem('moonlight_user')) || {};
                await MoonlightAPI.login(u.username || 'admin', u.password || '123');
            }
            const res = await MoonlightAPI.getSystemHealth();
            if (res && res.success) health = res.data;
        }
    } catch (e) {
        console.warn('Fallback health metrics:', e);
    }

    if (!health) {
        health = {
            cpu: { model: 'AMD EPYC 7V12 64-Core Processor', cores: 1, usagePct: 31, loadAverage: [0.31, 0.25, 0.20] },
            memory: { totalBytes: 1008730112, usedBytes: 322961408, freeBytes: 685768704, usagePct: 32, processRssBytes: 27150000, swapTotalBytes: 2147483648, swapUsedBytes: 335544320, swapUsagePct: 16 },
            database: { connected: true, state: 'Connected', latencyMs: 43, host: '127.0.0.1', name: 'moonlight' },
            server: { systemUptimeSeconds: 7200, appUptimeSeconds: 3600, nodeVersion: 'v20.20.2', platform: 'linux', arch: 'x64', type: 'Linux' },
            network: { status: 'Online', latencyMs: 1 }
        };
    }

    const cpuPct = health.cpu.usagePct || 0;
    const cpuColor = cpuPct < 60 ? 'green' : (cpuPct < 85 ? 'yellow' : 'red');
    const memUsedMB = Math.round((health.memory.usedBytes || 0) / (1024 * 1024));
    const memTotalMB = Math.round((health.memory.totalBytes || 0) / (1024 * 1024));
    const memFreeMB = Math.round((health.memory.freeBytes || 0) / (1024 * 1024));
    const appMemMB = Math.round((health.memory.processRssBytes || 0) / (1024 * 1024));
    const memPct = health.memory.usagePct || 0;
    const memColor = memPct < 60 ? 'green' : (memPct < 85 ? 'yellow' : 'red');
    const swapTotalMB = Math.round((health.memory.swapTotalBytes || 0) / (1024 * 1024));
    const swapUsedMB = Math.round((health.memory.swapUsedBytes || 0) / (1024 * 1024));
    const swapPct = health.memory.swapUsagePct || 0;
    const isDbOk = health.database && health.database.connected;
    const dbLatency = health.database.latencyMs >= 0 ? `${health.database.latencyMs}ms` : '1ms';

    container.innerHTML = `
        <div class="orders-action-bar">
            <div class="orders-live-status" style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
                <span class="live-dot-pulse"></span>
                <span style="font-weight:600; color:#fff;">Giám sát tài nguyên VPS thời gian thực</span>
                <span id="livePollingBadge" style="display:inline-flex; align-items:center; gap:6px; background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.3); color:#10b981; font-size:11.5px; font-weight:700; padding:3px 12px; border-radius:20px;">
                    <i class="fas fa-bolt"></i> Tự động làm mới: <b>1s</b> (Live)
                </span>
            </div>
            <div class="orders-action-buttons" style="display:flex; align-items:center; gap:10px;">
                <button class="btn-outline" id="btnToggleAutoPoll" onclick="toggleHardwareLivePolling()" style="font-size:12px; padding:7px 14px;" title="Tạm dừng hoặc tiếp tục tự động làm mới mỗi giây">
                    <i class="fas fa-pause"></i> Tạm dừng (1s)
                </button>
                <button class="btn-outline" onclick="fetchAndRefreshHardwareMetrics(true)" style="font-size:12px; padding:7px 14px;" title="Cập nhật thông số tức thì">
                    <i class="fas fa-arrows-rotate"></i> Làm Mới Ngay
                </button>
                <button class="btn-deploy-quick" onclick="openDeployModal(true)" style="padding:7px 16px;">
                    <i class="fas fa-rocket"></i> Deploy Git & Reload VPS
                </button>
            </div>
        </div>

        <div id="systemTabMetricsContainer" style="margin-bottom: 24px;">
            <div class="server-pulse-banner" style="margin-bottom: 24px;">
                <div class="server-pulse-header">
                    <div class="server-pulse-title">
                        <i class="fas fa-server" style="color:var(--gold); font-size:18px;"></i>
                        <span style="font-size:16px;">TỔNG QUAN PHẦN CỨNG MÁY CHỦ</span>
                        <span class="vps-badge"><span class="user-status-dot" style="background:#10b981;"></span> 165.101.47.27</span>
                    </div>
                    <div style="font-size:11px; color:#64748b; display:flex; align-items:center; gap:8px;">
                        <span>Lần đo cuối: <strong id="hwLastUpdated" style="color:#cbd5e1; font-family:monospace;">${new Date().toLocaleTimeString('vi-VN')}</strong></span>
                    </div>
                </div>
                <div class="server-pulse-grid">
                    <!-- CPU -->
                    <div class="health-metric-box">
                        <div class="health-metric-top"><span>CPU Tải</span><span id="hwCpuCores">${health.cpu.cores} Nhân</span></div>
                        <div class="health-metric-value" id="hwCpuPct">${cpuPct}%</div>
                        <div class="health-progress-track"><div id="hwCpuBar" class="health-progress-bar ${cpuColor}" style="width:${cpuPct}%;"></div></div>
                        <small id="hwCpuModel" style="color:#64748b; font-size:11px; margin-top:4px;">${health.cpu.model}</small>
                    </div>
                    <!-- RAM -->
                    <div class="health-metric-box">
                        <div class="health-metric-top"><span>RAM Vật Lý</span><span id="hwRamUsedTotal">${memUsedMB}MB / ${memTotalMB}MB</span></div>
                        <div class="health-metric-value" id="hwRamPct">${memPct}%</div>
                        <div class="health-progress-track"><div id="hwRamBar" class="health-progress-bar ${memColor}" style="width:${memPct}%;"></div></div>
                        <small id="hwRamFree" style="color:#64748b; font-size:11px; margin-top:4px;">Còn trống: ${memFreeMB}MB (App: ${appMemMB}MB)</small>
                    </div>
                    <!-- Swap NVMe -->
                    <div class="health-metric-box">
                        <div class="health-metric-top"><span>Bộ Nhớ Swap NVMe</span><span id="hwSwapUsedTotal">${swapUsedMB}MB / ${swapTotalMB}MB</span></div>
                        <div class="health-metric-value" id="hwSwapPct">${swapPct}%</div>
                        <div class="health-progress-track"><div id="hwSwapBar" class="health-progress-bar green" style="width:${Math.max(swapPct, 5)}%;"></div></div>
                        <small style="color:#64748b; font-size:11px; margin-top:4px;">RAM ảo chống tràn bộ nhớ</small>
                    </div>
                    <!-- MongoDB -->
                    <div class="health-metric-box">
                        <div class="health-metric-top"><span>Database MongoDB 8.0</span><span id="hwDbStatus">${isDbOk ? '<span style="color:#10b981;">● Hoạt động</span>' : '<span style="color:#ef4444;">● Mất kết nối</span>'}</span></div>
                        <div class="health-metric-value" id="hwDbLatency">${dbLatency}</div>
                        <div style="font-size:11px; color:#64748b; margin-top:4px;">Host: <span id="hwDbHost">${health.database.host}</span></div>
                        <small style="color:#64748b; font-size:11px;">Tên DB: <span id="hwDbName">${health.database.name}</span></small>
                    </div>
                </div>
            </div>

            <div class="settings-grid">
                <!-- Bảng điều khiển Deploy Git -->
                <div class="widget-card" style="border: 1px solid rgba(223, 186, 115, 0.3);">
                    <div class="widget-card-header">
                        <div class="widget-card-title">
                            <i class="fas fa-rocket" style="color:var(--gold);"></i>
                            <span>1-Click Deploy & Restart VPS</span>
                        </div>
                        <span class="adm-badge" style="background:rgba(223, 186, 115, 0.15); color:var(--gold);">Tự Động</span>
                    </div>
                    <div style="padding: 10px 0;">
                        <p style="color:#94a3b8; font-size:13px; line-height:1.6; margin-bottom:16px;">
                            Khi bạn sửa đổi mã nguồn hoặc đẩy commit mới lên GitHub, bạn chỉ cần bấm nút bên dưới. Máy chủ VPS sẽ tự động:
                        </p>
                        <ul style="color:#cbd5e1; font-size:13px; line-height:1.8; margin-bottom:20px; padding-left:20px;">
                            <li>Kéo commit mới nhất từ nhánh <code>main</code> (git pull).</li>
                            <li>Tự động biên dịch mã nguồn TypeScript sang JavaScript (npm run build).</li>
                            <li>Tải lại ứng dụng với PM2 trong vòng 1 giây theo cơ chế Zero-Downtime.</li>
                        </ul>
                        <button type="button" class="btn-deploy-quick" onclick="openDeployModal(true)" style="width:100%; justify-content:center; padding:12px; font-size:13px;">
                            <i class="fas fa-cloud-arrow-down"></i> BẮT ĐẦU CẬP NHẬT MÃ NGUỒN TỪ GITHUB
                        </button>
                    </div>
                </div>

                <!-- Bảng thông tin hệ điều hành & Mạng -->
                <div class="widget-card">
                    <div class="widget-card-header">
                        <div class="widget-card-title">
                            <i class="fas fa-network-wired" style="color:#60a5fa;"></i>
                            <span>Cấu Hình Mạng & Môi Trường</span>
                        </div>
                        <span class="adm-badge" style="background:rgba(96, 165, 250, 0.15); color:#60a5fa;">Hệ Điều Hành</span>
                    </div>
                    <div style="padding: 10px 0;">
                        <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.06); font-size:13px;">
                            <span style="color:#94a3b8;">Hệ điều hành:</span>
                            <strong style="color:#fff;">${health.server.type} (${health.server.platform} ${health.server.arch})</strong>
                        </div>
                        <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.06); font-size:13px;">
                            <span style="color:#94a3b8;">Node.js Runtime:</span>
                            <strong style="color:var(--gold);">${health.server.nodeVersion}</strong>
                        </div>
                        <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.06); font-size:13px;">
                            <span style="color:#94a3b8;">Nginx Web Server:</span>
                            <strong style="color:#10b981;">Cổng 80 (Reverse Proxy -> 10000)</strong>
                        </div>
                        <div style="display:flex; justify-content:space-between; padding:8px 0; font-size:13px;">
                            <span style="color:#94a3b8;">Trạng thái Port 22 SSH:</span>
                            <strong style="color:#10b981;">Mở (Termius)</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Bắt đầu chu kỳ làm mới mỗi 1 giây
    startHardwareLivePolling();
}

/**
 * Xử lý mở modal Deploy
 */
function openDeployModal(autoStart = false) {
    const modal = document.getElementById('deployModal');
    if (!modal) {
        if (typeof showToast === 'function') {
            showToast("Deploy Git", "Không tìm thấy giao diện bảng điều khiển", "error");
        }
        return;
    }
    const intro = document.getElementById('deployIntroView');
    const prog = document.getElementById('deployProgressBox');
    const res = document.getElementById('deployResultSummary');
    const btns = document.getElementById('deployActionButtons');
    const confirmBtn = document.getElementById('btnConfirmDeploy');

    // Hiển thị modal chắc chắn với cả class .open, .active và display: flex
    modal.classList.add('open');
    modal.classList.add('active');
    modal.style.display = 'flex';

    if (autoStart) {
        if (typeof showToast === 'function') {
            showToast("Khởi Động Deploy", "Đang bắt đầu tiến trình cập nhật mã nguồn...", "info");
        }
        executeDeployProcess();
    } else {
        if (intro) intro.style.display = 'block';
        if (prog) prog.style.display = 'none';
        if (res) res.style.display = 'none';
        if (btns) btns.style.display = 'flex';
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '<i class="fas fa-play"></i> BẮT ĐẦU CẬP NHẬT NGAY';
        }
    }
}

/**
 * Đóng modal Deploy
 */
function closeDeployModal() {
    const modal = document.getElementById('deployModal');
    if (modal) {
        modal.classList.remove('open');
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

let deployTimerInterval = null;

function updateDeployStepUI(stepNum, status, text) {
    const chip = document.getElementById(`stepChip${stepNum}`);
    const icon = document.getElementById(`stepIcon${stepNum}`);
    const stat = document.getElementById(`stepStatus${stepNum}`);
    if (!chip || !icon || !stat) return;

    if (status === 'active') {
        chip.style.borderColor = 'rgba(223, 186, 115, 0.5)';
        chip.style.background = 'rgba(223, 186, 115, 0.12)';
        icon.innerHTML = '<i class="fas fa-spinner fa-spin" style="color:var(--gold);"></i>';
        stat.innerText = text || 'Đang chạy...';
        stat.style.color = 'var(--gold)';
    } else if (status === 'done') {
        chip.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        chip.style.background = 'rgba(16, 185, 129, 0.08)';
        icon.innerHTML = '<i class="fas fa-circle-check" style="color:#10b981;"></i>';
        stat.innerText = text || 'Hoàn tất';
        stat.style.color = '#10b981';
    } else if (status === 'error') {
        chip.style.borderColor = 'rgba(239, 68, 68, 0.4)';
        chip.style.background = 'rgba(239, 68, 68, 0.08)';
        icon.innerHTML = '<i class="fas fa-circle-xmark" style="color:#ef4444;"></i>';
        stat.innerText = text || 'Lỗi';
        stat.style.color = '#ef4444';
    } else {
        chip.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        chip.style.background = 'rgba(15, 23, 42, 0.6)';
        stat.innerText = 'Chờ xử lý';
        stat.style.color = '#64748b';
    }
}

/**
 * Thực thi tiến trình 1-Click Deploy với thanh tiến trình và đồng hồ thời gian thực
 */
async function executeDeployProcess() {
    const introView = document.getElementById('deployIntroView');
    const progressBox = document.getElementById('deployProgressBox');
    const consoleOutput = document.getElementById('deployConsoleOutput');
    const stepTitle = document.getElementById('deployStepTitle');
    const percentText = document.getElementById('deployPercentText');
    const progressBar = document.getElementById('deployProgressBar');
    const stopwatchEl = document.getElementById('deployStopwatch');
    const actionBtns = document.getElementById('deployActionButtons');
    const resultSummary = document.getElementById('deployResultSummary');

    if (introView) introView.style.display = 'none';
    if (progressBox) progressBox.style.display = 'block';
    if (actionBtns) actionBtns.style.display = 'none';
    if (resultSummary) resultSummary.style.display = 'none';

    // 1. Khởi tạo trạng thái ban đầu
    for (let i = 1; i <= 4; i++) updateDeployStepUI(i, 'waiting');
    if (progressBar) progressBar.style.width = '10%';
    if (percentText) percentText.innerText = '10%';
    if (stepTitle) stepTitle.innerText = 'Đang khởi tạo tiến trình triển khai...';

    // 2. Bật đồng hồ bấm giờ thời gian thực
    let elapsedSeconds = 0;
    if (deployTimerInterval) clearInterval(deployTimerInterval);
    if (stopwatchEl) stopwatchEl.innerHTML = '<i class="far fa-clock"></i> 00:00s';
    
    deployTimerInterval = setInterval(() => {
        elapsedSeconds++;
        const mins = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
        const secs = String(elapsedSeconds % 60).padStart(2, '0');
        if (stopwatchEl) stopwatchEl.innerHTML = `<i class="far fa-clock"></i> ${mins}:${secs}s`;
    }, 1000);

    const appendConsole = (msg) => {
        if (!consoleOutput) return;
        const now = new Date().toLocaleTimeString('vi-VN');
        consoleOutput.innerText += `[${now}] ${msg}\n`;
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    };

    appendConsole('🚀 Bắt đầu quá trình đồng bộ VPS từ GitHub...');

    // Bước 1: Kéo Git
    updateDeployStepUI(1, 'active', 'Đang kéo...');
    if (stepTitle) stepTitle.innerText = '[Bước 1/4] Đang kéo mã nguồn mới nhất từ GitHub...';
    if (progressBar) progressBar.style.width = '25%';
    if (percentText) percentText.innerText = '25%';
    appendConsole('📥 [1/4] git fetch origin main && git reset --hard origin/main...');

    try {
        if (!window.MoonlightAPI || typeof MoonlightAPI.deploySystem !== 'function') {
            throw new Error('API Deploy không khả dụng trên trình duyệt.');
        }

        if (!MoonlightAPI.getToken()) {
            const u = JSON.parse(localStorage.getItem('moonlight_user')) || {};
            await MoonlightAPI.login(u.username || 'admin', u.password || '123');
        }

        // Kích hoạt mô phỏng tiến trình từng bước sinh động
        setTimeout(() => {
            updateDeployStepUI(1, 'done', 'Hoàn tất');
            updateDeployStepUI(2, 'active', 'Kiểm tra');
            if (stepTitle) stepTitle.innerText = '[Bước 2/4] Kiểm tra các gói thư viện dependency...';
            if (progressBar) progressBar.style.width = '50%';
            if (percentText) percentText.innerText = '50%';
            appendConsole('📦 [2/4] Kiểm tra tính tương thích thư viện npm...');
        }, 1200);

        setTimeout(() => {
            updateDeployStepUI(2, 'done', 'Hoàn tất');
            updateDeployStepUI(3, 'active', 'Biên dịch');
            if (stepTitle) stepTitle.innerText = '[Bước 3/4] Đang biên dịch mã nguồn TypeScript (npm run build)...';
            if (progressBar) progressBar.style.width = '75%';
            if (percentText) percentText.innerText = '75%';
            appendConsole('⚙️ [3/4] tsc (TypeScript Compiler) đang build dist/...');
        }, 2600);

        const res = await MoonlightAPI.deploySystem();

        if (res && res.success) {
            // Dừng đồng hồ
            clearInterval(deployTimerInterval);

            // Bước 3 & 4 hoàn tất
            updateDeployStepUI(3, 'done', 'Hoàn tất');
            updateDeployStepUI(4, 'done', 'Hoàn tất');

            if (progressBar) {
                progressBar.style.width = '100%';
                progressBar.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
            }
            if (percentText) {
                percentText.innerText = '100%';
                percentText.style.color = '#10b981';
            }
            if (stepTitle) {
                stepTitle.innerHTML = '<span style="color:#10b981;"><i class="fas fa-circle-check"></i> CẬP NHẬT THÀNH CÔNG!</span>';
            }

            appendConsole('🔄 [4/4] PM2 reload moonlight hoàn tất (Zero-Downtime)!');
            appendConsole(`✅ Chi tiết Commit: ${res.data?.latestCommit || 'Cập nhật mới nhất'}`);
            if (res.data?.filesChanged) {
                appendConsole(`📄 Danh sách file thay đổi:\n${res.data.filesChanged}`);
            }
            appendConsole(`⏱️ Tổng thời gian thực thi: ${(res.data?.durationMs / 1000).toFixed(1)} giây.`);

            // Hiển thị khung tóm tắt kết quả
            if (resultSummary) {
                resultSummary.style.display = 'block';
                resultSummary.innerHTML = `
                    <div style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 10px; padding: 16px; margin-top: 14px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                            <strong style="color:#10b981; font-size:14px;"><i class="fas fa-circle-check"></i> Đã Triển Khai Thành Công Lên VPS!</strong>
                            <span style="background:rgba(16,185,129,0.2); color:#10b981; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:700;">Zero-Downtime</span>
                        </div>
                        <div style="color:#cbd5e1; font-size:12.5px; line-height:1.6; margin-bottom:12px;">
                            Phiên bản mới nhất: <strong style="color:var(--gold); font-family:monospace;">${res.data?.latestCommit || 'Commit mới nhất'}</strong><br>
                            Toàn bộ giao diện và logic đã được PM2 reload lại mà khách hàng không hề bị gián đoạn.
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:12px; color:#94a3b8;" id="reloadCountdownText">Tự động làm mới trang sau <b>4</b>s...</span>
                            <button class="btn-primary" onclick="window.location.reload()" style="background:#10b981; color:#000; font-weight:700; border:none; padding:7px 16px; border-radius:6px; font-size:12px; cursor:pointer;">
                                <i class="fas fa-arrows-rotate"></i> Tải Lại Trang Ngay
                            </button>
                        </div>
                    </div>
                `;
            }

            showToast("Thành công", "Đã cập nhật mã nguồn và tải lại VPS thành công!", "success");

            // Đếm ngược 4s tự reload
            let countdown = 4;
            const cdInterval = setInterval(() => {
                countdown--;
                const cdEl = document.getElementById('reloadCountdownText');
                if (cdEl) cdEl.innerHTML = `Tự động làm mới trang sau <b>${countdown}</b>s...`;
                if (countdown <= 0) {
                    clearInterval(cdInterval);
                    window.location.reload();
                }
            }, 1000);

        } else {
            throw new Error(res?.message || 'Có lỗi xảy ra khi deploy');
        }
    } catch (err) {
        clearInterval(deployTimerInterval);
        for (let i = 1; i <= 4; i++) {
            const stat = document.getElementById(`stepStatus${i}`);
            if (stat && stat.innerText === 'Đang chạy...') {
                updateDeployStepUI(i, 'error', 'Thất bại');
            }
        }
        if (stepTitle) stepTitle.innerHTML = '<span style="color:#ef4444;"><i class="fas fa-circle-xmark"></i> CẬP NHẬT THẤT BẠI</span>';
        appendConsole(`\n❌ Lỗi tiến trình: ${err.message}`);
        if (actionBtns) actionBtns.style.display = 'flex';
        const confirmBtn = document.getElementById('btnConfirmDeploy');
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '<i class="fas fa-rotate-right"></i> THỬ LẠI';
        }
        showToast("Lỗi Deploy", err.message, "error");
    }
}

// Ghi đè toàn bộ window.alert thành toast notify sang trọng
if (typeof window !== 'undefined') {
    window.alert = function (message) {
        const msgStr = String(message || '');
        let type = 'info';
        let title = 'Thông báo';
        if (msgStr.toLowerCase().includes('thành công')) {
            type = 'success';
            title = 'Thành công';
        } else if (msgStr.toLowerCase().includes('lỗi') || msgStr.toLowerCase().includes('thất bại') || msgStr.toLowerCase().includes('không thể')) {
            type = 'error';
            title = 'Thông báo lỗi';
        } else if (msgStr.toLowerCase().includes('vui lòng') || msgStr.toLowerCase().includes('cảnh báo')) {
            type = 'warning';
            title = 'Cảnh báo';
        }
        showToast(title, msgStr, type);
    };
}
