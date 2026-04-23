/* ==========================================================================
   ADMIN.JS - QUẢN TRỊ VIÊN (DASHBOARD & MANAGEMENT)
   ========================================================================== */

// --- 1. DỮ LIỆU & BIẾN TOÀN CỤC ---
let products = JSON.parse(localStorage.getItem('moonlight_products')) || [];
let accounts = JSON.parse(localStorage.getItem('moonlight_accounts')) || [{ id: 1, username: "admin", password: "123", name: "Admin", role: "Admin" }];
let orders = JSON.parse(localStorage.getItem('moonlight_orders')) || [];
let logs = JSON.parse(localStorage.getItem('moonlight_logs')) || [];

let revenueChartInstance = null;
let soldChartInstance = null;
let currentOrderFilter = 'all';

// Dữ liệu mẫu cho biểu đồ (Mock Data)
const chartDataMock = {
    '7days': { labels: ['T2','T3','T4','T5','T6','T7','CN'], revenue: [1.5, 2.2, 1.8, 3.5, 2.1, 4.6, 3.9], sold: [5,8,6,12,7,15,10] },
    '30days': { labels: ['W1','W2','W3','W4'], revenue: [12, 15, 11, 18], sold: [40, 55, 38, 60] },
    'month': { labels: ['Jan','Feb','Mar','Apr','May','Jun'], revenue: [45, 52, 48, 60, 55, 70], sold: [150, 180, 160, 200, 190, 220] },
    'year': { labels: ['Q1','Q2','Q3','Q4'], revenue: [150, 200, 180, 250], sold: [500, 650, 600, 850] }
};

// --- 2. KHỞI TẠO ---
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    renderAdminStats(); // Mặc định vào Dashboard
});

function checkAuth() {
    const user = JSON.parse(localStorage.getItem('moonlight_user'));
    if (!user || (user.role !== 'Admin' && user.role !== 'Owner')) {
        alert("Không có quyền truy cập!");
        window.location.href = 'login.html';
    }
    if(document.getElementById('adminName')) document.getElementById('adminName').innerText = user.name;
    if(document.getElementById('adminRole')) document.getElementById('adminRole').innerText = user.role;
    if (user.role !== 'Admin') document.querySelector('.admin-only')?.style.setProperty('display', 'none');
}

function handleLogout() { localStorage.removeItem('moonlight_user'); window.location.href = 'login.html'; }

function switchTab(tabName) {
    document.querySelectorAll('.admin-menu a').forEach(a => a.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    if (tabName === 'dashboard') renderAdminStats();
    else if (tabName === 'products') renderAdminProducts();
    else if (tabName === 'orders') renderAdminOrders();
    else if (tabName === 'reviews') renderAdminReviews();
    else if (tabName === 'staff') renderAdminStaff();
}

// --- 3. QUẢN LÝ SẢN PHẨM (SIZE & STOCK LOGIC) ---
function parseSizeInput(str) {
    if (!str) return [];
    return str.split(',').map(item => {
        const [name, stock] = item.trim().split(':');
        return { name: name?.trim().toUpperCase() || '?', stock: stock ? parseInt(stock) : 0 };
    }).filter(s => s.name !== '?');
}

function formatSizeInput(sizes) {
    if (!Array.isArray(sizes)) return '';
    return sizes.map(s => typeof s === 'string' ? `${s}:0` : `${s.name}:${s.stock}`).join(', ');
}

function calculateVariantStock(sizes) {
    if (!Array.isArray(sizes)) return 0;
    return sizes.reduce((sum, s) => sum + (s.stock || 0), 0);
}

function renderAdminProducts() {
    const container = document.querySelector('.admin-content');
    container.innerHTML = `
        <header class="admin-header"><h2>QUẢN LÝ SẢN PHẨM</h2><button class="btn-primary" onclick="showAddProductForm()">+ THÊM MỚI</button></header>
        <div class="data-table-container">
            <table class="admin-table product-table">
                <thead><tr><th>Ảnh</th><th>Tên SP</th><th>Cấu hình (Màu | Giá | Size:Kho)</th><th>Đã bán</th><th>Thao tác</th></tr></thead>
                <tbody>${products.map(p => {
                    const totalStock = p.variants.reduce((sum, v) => sum + calculateVariantStock(v.sizes), 0);
                    return `<tr>
                        <td><img src="${p.variants[0]?.img || ''}" onerror="this.src='https://via.placeholder.com/50'"></td>
                        <td><strong>${p.name}</strong><br><small style="color:${totalStock<10?'#ff4444':'#47d864'}">Tổng kho: ${totalStock}</small></td>
                        <td>${p.variants.map(v => `
                            <div class="variant-info-line">
                                <span class="v-dot" style="background:${v.hex}"></span> ${v.color} | 
                                <b style="color:var(--gold)">${Number(v.price).toLocaleString()}₫</b> | 
                                <span style="color:#888">${Array.isArray(v.sizes) ? v.sizes.map(s => `<span class="size-badge ${s.stock<5?'out-stock':''}">${s.name}:<b>${s.stock}</b></span>`).join('') : ''}</span>
                            </div>`).join('')}
                        </td>
                        <td style="text-align:center">${p.sold}</td>
                        <td style="text-align:center">
                            <button class="adm-btn" onclick="editProduct(${p.id})"><i class="fas fa-edit" style="color:#3498db"></i></button>
                            <button class="adm-btn" onclick="deleteProduct(${p.id})"><i class="fas fa-trash" style="color:#e74c3c"></i></button>
                        </td>
                    </tr>`;
                }).join('')}</tbody>
            </table>
        </div>
        <div id="productModal"><div class="modal-content">
            <h3 id="modalTitle">Cấu hình sản phẩm</h3>
            <form id="productForm" onsubmit="handleSaveProduct(event)">
                <input type="hidden" id="editId">
                <div class="form-row-split"><div class="form-group"><label>Tên sản phẩm</label><input type="text" id="pName" required></div><div class="form-group"><label>Giảm giá (%)</label><input type="number" id="pSale" placeholder="0"></div></div>
                <div class="variant-section">
                    <div class="variant-header"><span>BIẾN THỂ</span><button type="button" class="btn-primary" style="padding:5px 10px;font-size:11px" onclick="addVariantRow()">+ MÀU</button></div>
                    <div style="font-size:11px;color:#888;margin-bottom:10px"><i>* Nhập size: <b>S:10, M:20</b> (Size S có 10 cái, M có 20 cái)</i></div>
                    <div id="variantContainer"></div>
                </div>
                <div class="modal-btns"><button type="submit" class="btn-confirm">LƯU DỮ LIỆU</button><button type="button" class="btn-cancel" onclick="closeModal()">ĐÓNG</button></div>
            </form>
        </div></div>`;
}

function addVariantRow(color='', hex='#000', img='', price='', sizeStr='') {
    const div = document.createElement('div'); div.className = 'variant-row';
    div.innerHTML = `<input class="v-color" value="${color}" placeholder="Màu" required><input type="color" class="v-hex" value="${hex}"><input class="v-img" value="${img}" placeholder="Link ảnh" required><input type="number" class="v-price" value="${price}" placeholder="Giá" required><input class="v-sizes" value="${sizeStr}" placeholder="S:10, M:5" required><button type="button" class="v-del-btn" onclick="this.parentElement.remove()">x</button>`;
    document.getElementById('variantContainer').appendChild(div);
}

function handleSaveProduct(e) {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    const variants = Array.from(document.querySelectorAll('.variant-row')).map(row => {
        const sizes = parseSizeInput(row.querySelector('.v-sizes').value);
        return {
            color: row.querySelector('.v-color').value,
            hex: row.querySelector('.v-hex').value,
            img: row.querySelector('.v-img').value,
            price: parseInt(row.querySelector('.v-price').value),
            sizes: sizes,
            stock: calculateVariantStock(sizes)
        };
    });

    if(variants.length === 0) return alert("Cần ít nhất 1 biến thể!");

    const pData = {
        id: id ? parseInt(id) : Date.now(),
        name: document.getElementById('pName').value,
        salePercent: parseInt(document.getElementById('pSale').value)||0,
        variants, 
        stock: variants.reduce((s,v)=>s+v.stock,0),
        sold: 0,
        img: variants[0].img, 
        price: variants[0].price
    };

    if(id) {
        const idx = products.findIndex(p=>p.id==id);
        if(idx!==-1) products[idx] = {...products[idx], ...pData, sold: products[idx].sold};
    } else products.unshift(pData);

    localStorage.setItem('moonlight_products', JSON.stringify(products));
    closeModal(); renderAdminProducts();
}

function editProduct(id) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    document.getElementById('editId').value = p.id;
    document.getElementById('pName').value = p.name;
    document.getElementById('pSale').value = p.salePercent || 0;
    document.getElementById('variantContainer').innerHTML = '';
    p.variants.forEach(v => addVariantRow(v.color, v.hex, v.img, v.price, formatSizeInput(v.sizes)));
    document.getElementById('modalTitle').innerText = 'Chỉnh sửa sản phẩm';
    document.getElementById('productModal').classList.add('open');
}

function deleteProduct(id) {
    if(confirm("Xóa sản phẩm này?")) {
        products = products.filter(p => p.id !== id);
        localStorage.setItem('moonlight_products', JSON.stringify(products));
        renderAdminProducts();
    }
}
function closeModal() { document.getElementById('productModal').classList.remove('open'); document.getElementById('staffModal')?.classList.remove('open'); }
function showAddProductForm() { document.getElementById('productForm').reset(); document.getElementById('editId').value=''; document.getElementById('variantContainer').innerHTML=''; addVariantRow(); document.getElementById('modalTitle').innerText='Thêm sản phẩm mới'; document.getElementById('productModal').classList.add('open'); }

// --- 4. DASHBOARD & CHARTS ---
function renderAdminStats() {
    const container = document.querySelector('.admin-content');
    const totalRev = orders.filter(o => o.status === 'completed').reduce((s,o) => s + o.total, 0);
    const lowStock = products.filter(p => p.stock < 10);

    container.innerHTML = `
        <header class="admin-header"><h2>DASHBOARD</h2><div style="font-size:12px;color:#888">${new Date().toLocaleDateString('vi-VN')}</div></header>
        <div class="dashboard-stats">
            <div class="stat-card"><h3>DOANH THU</h3><p style="color:var(--gold)">${totalRev.toLocaleString()}₫</p></div>
            <div class="stat-card"><h3>ĐƠN HÀNG</h3><p>${orders.length}</p></div>
            <div class="stat-card"><h3>SẢN PHẨM</h3><p>${products.length}</p></div>
            <div class="stat-card"><h3>KHÁCH HÀNG</h3><p>${new Set(orders.map(o=>o.customer.phone)).size}</p></div>
        </div>
        ${lowStock.length > 0 ? `<div class="low-stock-alert"><i class="fas fa-exclamation-triangle"></i> <strong>Cảnh báo:</strong> ${lowStock.length} sản phẩm sắp hết hàng!</div>` : ''}
        
        <div class="charts-section">
            <div class="charts-grid">
                <div class="chart-box">
                    <div class="chart-header">
                        <h3>Doanh Thu</h3>
                        <div class="chart-filters">
                            <button class="chart-btn active" onclick="updateCharts('7days', this)">7 Ngày</button>
                            <button class="chart-btn" onclick="updateCharts('30days', this)">30 Ngày</button>
                            <button class="chart-btn" onclick="updateCharts('month', this)">Tháng</button>
                            <button class="chart-btn" onclick="updateCharts('year', this)">Năm</button>
                        </div>
                    </div>
                    <canvas id="revenueChart"></canvas>
                </div>
                <div class="chart-box">
                    <div class="chart-header"><h3>Hàng Bán Ra</h3></div>
                    <canvas id="soldChart"></canvas>
                </div>
            </div>
        </div>
        
        <div class="data-table-container">
            <h3 style="padding:20px;border-bottom:1px solid #333;margin:0">NHẬT KÝ HỆ THỐNG</h3>
            <table class="admin-table"><thead><tr><th>Thời gian</th><th>User</th><th>Hành động</th><th>Chi tiết</th></tr></thead>
            <tbody>${logs.slice(0,5).map(l=>`<tr><td>${l.time}</td><td>${l.user}</td><td>${l.action}</td><td>${l.details}</td></tr>`).join('')}</tbody>
            </table>
        </div>
    `;
    initCharts();
}

function initCharts() {
    const ctxRev = document.getElementById('revenueChart');
    const ctxSold = document.getElementById('soldChart');
    if(!ctxRev || !ctxSold) return;

    revenueChartInstance = new Chart(ctxRev, {
        type: 'line',
        data: {
            labels: chartDataMock['7days'].labels,
            datasets: [{ label: 'Doanh thu (Triệu)', data: chartDataMock['7days'].revenue, borderColor: '#d4af37', backgroundColor: 'rgba(212,175,55,0.1)', tension: 0.4, fill: true }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    soldChartInstance = new Chart(ctxSold, {
        type: 'bar',
        data: {
            labels: chartDataMock['7days'].labels,
            datasets: [{ label: 'Sản phẩm', data: chartDataMock['7days'].sold, backgroundColor: '#3498db' }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function updateCharts(period, btn) {
    document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const data = chartDataMock[period];
    revenueChartInstance.data.labels = data.labels;
    revenueChartInstance.data.datasets[0].data = data.revenue;
    revenueChartInstance.update();
    
    soldChartInstance.data.labels = data.labels;
    soldChartInstance.data.datasets[0].data = data.sold;
    soldChartInstance.update();
}

// --- 5. QUẢN LÝ ĐƠN HÀNG (FULL LOGIC) ---
function renderAdminOrders() {
    const container = document.querySelector('.admin-content');
    let list = orders;
    if(currentOrderFilter === 'store') list = list.filter(o => o.customer.address.includes('Tại cửa hàng'));
    if(currentOrderFilter === 'online') list = list.filter(o => !o.customer.address.includes('Tại cửa hàng'));

    container.innerHTML = `
        <header class="admin-header"><h2>QUẢN LÝ ĐƠN HÀNG</h2></header>
        <div class="data-table-container">
            <div style="padding:20px; display:flex; gap:10px;">
                <button class="chart-btn ${currentOrderFilter==='all'?'active':''}" onclick="filterOrder('all')">Tất cả</button>
                <button class="chart-btn ${currentOrderFilter==='store'?'active':''}" onclick="filterOrder('store')">Tại quầy</button>
                <button class="chart-btn ${currentOrderFilter==='online'?'active':''}" onclick="filterOrder('online')">Online</button>
            </div>
            <table class="admin-table order-table">
                <thead><tr><th>Mã</th><th>Khách hàng</th><th>Tổng</th><th>TT Tiền</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                <tbody>${list.map(o => {
                    const isBanking = o.paymentMethod.includes('Banking') || o.paymentMethod.includes('Chuyển khoản');
                    let actions = '';
                    if(o.status === 'completed' || o.status === 'cancelled') {
                        actions = `<button class="adm-btn" onclick="deleteOrder('${o.id}')"><i class="fas fa-trash" style="color:#888"></i></button>`;
                    } else if(isBanking && !o.isPaid) {
                        actions = `<button class="chart-btn active" onclick="confirmPayment('${o.id}')">Xác nhận tiền</button>`;
                    } else {
                        actions = `<button class="adm-btn" onclick="approveOrder('${o.id}')"><i class="fas fa-check" style="color:#2ecc71"></i></button><button class="adm-btn" onclick="cancelOrder('${o.id}')"><i class="fas fa-times" style="color:red"></i></button>`;
                    }
                    return `<tr>
                        <td>#${o.id.toString().slice(-4)}</td>
                        <td>${o.customer.name}<br><small>${o.customer.address}</small></td>
                        <td style="color:var(--gold);font-weight:bold">${o.total.toLocaleString()}₫</td>
                        <td>${o.isPaid ? '<span class="adm-badge success">Đã nhận</span>' : (isBanking ? '<span class="adm-badge danger">Chờ tiền</span>' : '<span class="adm-badge dark">COD</span>')}</td>
                        <td>${o.status==='completed'?'<span class="adm-badge success">Xong</span>':(o.status==='cancelled'?'<span class="adm-badge danger">Hủy</span>':'<span class="adm-badge warning">Chờ</span>')}</td>
                        <td style="text-align:center">${actions}</td>
                    </tr>`;
                }).join('')}</tbody>
            </table>
        </div>
    `;
}

function filterOrder(type) { currentOrderFilter = type; renderAdminOrders(); }
function confirmPayment(id) {
    if(confirm("Đã nhận được tiền?")) {
        const idx = orders.findIndex(o => o.id === id);
        if(idx!==-1) { orders[idx].isPaid = true; localStorage.setItem('moonlight_orders', JSON.stringify(orders)); renderAdminOrders(); }
    }
}
function approveOrder(id) {
    const idx = orders.findIndex(o => o.id === id);
    if(idx!==-1) {
        // Trừ kho chi tiết size
        orders[idx].items.forEach(item => {
            const pIdx = products.findIndex(p => p.id === item.id);
            if(pIdx !== -1) {
                const vIdx = products[pIdx].variants.findIndex(v => v.color === item.color);
                if(vIdx !== -1) {
                    const sIdx = products[pIdx].variants[vIdx].sizes.findIndex(s => s.name === item.size);
                    if(sIdx !== -1) products[pIdx].variants[vIdx].sizes[sIdx].stock = Math.max(0, products[pIdx].variants[vIdx].sizes[sIdx].stock - item.quantity);
                }
                products[pIdx].stock = Math.max(0, products[pIdx].stock - item.quantity);
                products[pIdx].sold += item.quantity;
            }
        });
        orders[idx].status = 'completed'; orders[idx].isPaid = true;
        localStorage.setItem('moonlight_orders', JSON.stringify(orders));
        localStorage.setItem('moonlight_products', JSON.stringify(products));
        renderAdminOrders();
    }
}
function cancelOrder(id) { /* Giữ nguyên logic hủy */ }
function deleteOrder(id) { /* Giữ nguyên logic xóa */ }

// --- 6. NHÂN SỰ ---
function renderAdminStaff() { /* Copy lại hàm renderAdminStaff từ phần trước */ }