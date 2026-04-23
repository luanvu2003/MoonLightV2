/* ==========================================================================
   SHOP.JS - LOGIC DÀNH CHO KHÁCH HÀNG (FRONTEND)
   Dùng cho: index.html, product.html, checkout.html
   ========================================================================== */

// --- 1. KHỞI TẠO DỮ LIỆU ---
let products = JSON.parse(localStorage.getItem('moonlight_products')) || [];
let bestSellers = JSON.parse(localStorage.getItem('moonlight_products')) || []; // Lấy chung nguồn
let cart = JSON.parse(localStorage.getItem('moonlight_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('moonlight_wishlist')) || [];

// Biến dùng cho trang chi tiết
let currentProduct = null;
let selectedColor = null; // Object biến thể màu đang chọn
let selectedSizeName = null; // Tên size đang chọn (VD: "S")
let quantity = 1;

// --- 2. ĐIỀU HƯỚNG & KHỞI TẠO (ROUTER) ---
document.addEventListener('DOMContentLoaded', () => {
    updateCartIcon(); // Luôn cập nhật số lượng giỏ hàng đầu tiên

    // A. Nếu đang ở Trang chủ (index.html)
    if (document.getElementById('product-grid')) {
        renderShop(8);
        renderBestSellers(4);
        setupSearch();
        setupScrollEffects();
    }

    // B. Nếu đang ở Trang chi tiết (product.html)
    if (document.getElementById('productDetailContainer')) {
        loadProductDetail();
    }

    // C. Nếu đang ở Trang thanh toán (checkout.html)
    if (document.getElementById('checkoutItems')) {
        renderCheckoutPage();
    }
});

// --- 3. LOGIC TRANG CHỦ (INDEX) ---

function renderShop(limit) {
    const list = products.slice(0, limit);
    renderProductGrid(list, 'product-grid');
    
    // Ẩn nút xem thêm nếu hết hàng
    const btn = document.getElementById('loadMoreContainer');
    if (btn) btn.style.display = (limit >= products.length) ? 'none' : 'block';
}

function renderBestSellers(limit) {
    // Giả lập lấy best seller (sắp xếp theo sold giảm dần)
    const sorted = [...products].sort((a, b) => b.sold - a.sold);
    const list = sorted.slice(0, limit);
    renderProductGrid(list, 'best-seller-grid');

    const btn = document.getElementById('loadMoreBestSeller');
    if (btn) btn.style.display = (limit >= products.length) ? 'none' : 'block';
}

// Hàm render chung cho các lưới sản phẩm
function renderProductGrid(data, elementId) {
    const grid = document.getElementById(elementId);
    if (!grid) return;
    
    if (data.length === 0) {
        grid.innerHTML = '<p style="grid-column:1/-1; text-align:center;">Chưa có sản phẩm nào.</p>';
        return;
    }

    grid.innerHTML = data.map(p => {
        const v = p.variants[0] || { img: 'placeholder.jpg', price: 0 };
        const percent = p.salePercent || 0; // Nếu bạn có lưu % giảm giá
        const isLiked = wishlist.includes(p.id) ? 'active' : '';
        const iconClass = isLiked ? 'fas' : 'far';

        return `
        <div class="product-card">
            <div class="card-img">
                ${percent > 0 ? `<span class="badge-sale">-${percent}%</span>` : ''}
                <button class="wishlist-btn ${isLiked}" onclick="toggleWishlist(this, ${p.id})"><i class="${iconClass} fa-heart"></i></button>
                <img src="${v.img}" alt="${p.name}">
                <div class="card-overlay-btns">
                    <a href="product.html?id=${p.id}" class="view-btn"><i class="far fa-eye"></i> Xem chi tiết</a>
                    <button class="add-btn" onclick="quickAdd(${p.id})"><i class="fas fa-shopping-cart"></i> Thêm nhanh</button>
                </div>
            </div>
            <div class="card-info">
                <h3><a href="product.html?id=${p.id}" style="color:inherit; text-decoration:none;">${p.name}</a></h3>
                <div class="product-meta">
                    <span class="stars"><i class="fas fa-star"></i> ${p.rating || 5}</span>
                    <span class="sold-count">Đã bán ${p.sold || 0}</span>
                </div>
                <div class="price">${Number(v.price).toLocaleString()}₫</div>
            </div>
        </div>`;
    }).join('');
}

// Chức năng Xem thêm
let displayedProducts = 8;
function loadMoreProducts() {
    displayedProducts += 4;
    renderShop(displayedProducts);
}

// --- 4. LOGIC TRANG CHI TIẾT (PRODUCT DETAIL) ---

function loadProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = parseInt(urlParams.get('id'));
    
    currentProduct = products.find(p => p.id === id);

    if (!currentProduct) {
        document.getElementById('productDetailContainer').innerHTML = "<h3 style='text-align:center'>Sản phẩm không tồn tại!</h3>";
        return;
    }

    // Mặc định chọn màu đầu tiên
    selectedColor = currentProduct.variants[0];
    
    // Render giao diện
    renderDetailHTML();
    renderRelatedProducts();
    
    // Render đánh giá (Giả lập hoặc lấy từ LocalStorage)
    renderProductReviews(id);
}

function renderDetailHTML() {
    // 1. Ảnh & Giá
    document.getElementById('mainDetailImg').src = selectedColor.img;
    document.getElementById('detailPrice').innerText = Number(selectedColor.price).toLocaleString() + '₫';
    document.querySelector('.pd-title').innerText = currentProduct.name;
    document.querySelector('.pd-desc').innerText = currentProduct.desc || "Sản phẩm chất lượng cao từ Moon Light.";

    // 2. Render Nút Màu
    const colorContainer = document.querySelector('.color-selector');
    colorContainer.innerHTML = currentProduct.variants.map((v, idx) => `
        <div class="color-btn ${v.color === selectedColor.color ? 'selected' : ''}" onclick="selectColor(${idx}, this)">
            <span style="background:${v.hex}"></span> ${v.color}
        </div>
    `).join('');

    // 3. Render Nút Size (Dựa theo màu đã chọn)
    renderSizeButtons();
}

function renderSizeButtons() {
    const sizeContainer = document.getElementById('sizeSelectorContainer');
    // selectedColor.sizes bây giờ là mảng object: [{name: 'S', stock: 10}, {name: 'M', stock: 0}]
    
    if (!selectedColor.sizes || selectedColor.sizes.length === 0) {
        sizeContainer.innerHTML = '<span style="color:#999">Hết hàng</span>';
        return;
    }

    sizeContainer.innerHTML = selectedColor.sizes.map(s => {
        const isOutOfStock = s.stock <= 0;
        const isSelected = selectedSizeName === s.name;
        
        return `
        <div class="size-btn ${isSelected ? 'selected' : ''} ${isOutOfStock ? 'disabled' : ''}" 
             onclick="selectSize('${s.name}', ${s.stock}, this)">
             ${s.name}
        </div>`;
    }).join('');
}

// Xử lý khi chọn Màu
function selectColor(index, btn) {
    selectedColor = currentProduct.variants[index];
    selectedSizeName = null; // Reset size khi đổi màu
    document.getElementById('sizeName').innerText = "Vui lòng chọn lại size";
    
    // Update UI
    renderDetailHTML(); 
    
    // Update Active Class cho màu
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

// Xử lý khi chọn Size
function selectSize(name, stock, btn) {
    if (stock <= 0) return; // Không cho chọn nếu hết hàng
    
    selectedSizeName = name;
    document.getElementById('sizeName').innerText = name + ` (Còn ${stock})`;
    
    // Update UI
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

function updateDetailQty(change) {
    quantity += change;
    if (quantity < 1) quantity = 1;
    document.getElementById('detailQty').value = quantity;
}

function addDetailToCart() {
    if (!selectedSizeName) {
        showToast({ title: 'Chưa chọn size', message: 'Vui lòng chọn kích thước phù hợp.', type: 'warning' });
        return;
    }

    // Kiểm tra lại kho lần cuối
    const sizeObj = selectedColor.sizes.find(s => s.name === selectedSizeName);
    if (sizeObj.stock < quantity) {
        showToast({ title: 'Hết hàng', message: `Size ${selectedSizeName} chỉ còn ${sizeObj.stock} sản phẩm.`, type: 'error' });
        return;
    }

    const item = {
        id: currentProduct.id,
        name: currentProduct.name,
        price: selectedColor.price,
        img: selectedColor.img,
        color: selectedColor.color,
        size: selectedSizeName,
        quantity: quantity
    };

    addToCart(item);
}

function renderRelatedProducts() {
    const grid = document.getElementById('related-grid');
    if(!grid) return;
    
    // Lấy 4 sản phẩm khác sản phẩm hiện tại
    const related = products.filter(p => p.id !== currentProduct.id).slice(0, 4);
    renderProductGrid(related, 'related-grid');
}

// --- 5. LOGIC GIỎ HÀNG (CORE) ---

function addToCart(newItem) {
    const exist = cart.find(i => i.id === newItem.id && i.color === newItem.color && i.size === newItem.size);
    if (exist) {
        exist.quantity += newItem.quantity;
    } else {
        cart.push(newItem);
    }
    
    saveCart();
    updateCartIcon();
    toggleCart(); // Mở sidebar
    showToast({ title: 'Thành công', message: 'Đã thêm vào giỏ hàng.', type: 'success' });
}

function quickAdd(id) {
    const p = products.find(x => x.id === id);
    if (!p) return;

    // Logic Quick Add: Tự chọn màu đầu tiên và size đầu tiên còn hàng
    const v = p.variants[0];
    const availableSize = v.sizes.find(s => s.stock > 0);

    if (!availableSize) {
        showToast({ title: 'Hết hàng', message: 'Sản phẩm này tạm thời hết hàng.', type: 'error' });
        return;
    }

    const item = {
        id: p.id, name: p.name, price: v.price, img: v.img,
        color: v.color, size: availableSize.name, quantity: 1
    };
    addToCart(item);
}

function saveCart() {
    localStorage.setItem('moonlight_cart', JSON.stringify(cart));
}

function updateCartIcon() {
    const badge = document.querySelector('.badge');
    if (badge) badge.innerText = cart.reduce((sum, i) => sum + i.quantity, 0);
}

// Render giỏ hàng Sidebar
function renderCartSidebar() {
    const list = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    if (!list) return;

    if (cart.length === 0) {
        list.innerHTML = '<p style="text-align:center; padding:20px; color:#999;">Giỏ hàng trống</p>';
        totalEl.innerText = '0₫';
        return;
    }

    let total = 0;
    list.innerHTML = cart.map((item, idx) => {
        total += item.price * item.quantity;
        return `
        <div class="cart-item-row">
            <img src="${item.img}" style="width:50px; height:60px; object-fit:cover; border-radius:4px;">
            <div class="cart-item-info">
                <h4 style="font-size:13px; margin:0;">${item.name}</h4>
                <p style="font-size:11px; color:#888; margin:2px 0;">${item.color} / ${item.size}</p>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:5px;">
                    <strong style="font-size:12px;">${item.price.toLocaleString()}₫</strong>
                    <div style="background:#eee; display:flex; align-items:center; border-radius:3px;">
                        <button onclick="changeCartQty(${idx}, -1)" style="border:none; padding:2px 6px; cursor:pointer;">-</button>
                        <span style="font-size:11px; padding:0 5px;">${item.quantity}</span>
                        <button onclick="changeCartQty(${idx}, 1)" style="border:none; padding:2px 6px; cursor:pointer;">+</button>
                    </div>
                </div>
            </div>
            <div onclick="removeCartItem(${idx})" style="cursor:pointer; color:#ff4444; padding:5px;"><i class="fas fa-trash"></i></div>
        </div>`;
    }).join('');
    
    totalEl.innerText = total.toLocaleString() + '₫';
}

function changeCartQty(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) cart.splice(index, 1);
    saveCart();
    renderCartSidebar();
    updateCartIcon();
}

function removeCartItem(index) {
    cart.splice(index, 1);
    saveCart();
    renderCartSidebar();
    updateCartIcon();
}

function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if (sidebar) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('open');
        if (sidebar.classList.contains('open')) renderCartSidebar();
    }
}

// --- 6. LOGIC THANH TOÁN (CHECKOUT) ---

function renderCheckoutPage() {
    const container = document.getElementById('checkoutItems');
    const subTotalEl = document.getElementById('checkoutSubtotal');
    const totalEl = document.getElementById('checkoutTotal');
    
    if (!container) return; // Không ở trang checkout

    if (cart.length === 0) {
        container.innerHTML = '<p>Giỏ hàng trống. <a href="index.html">Quay lại mua sắm</a></p>';
        return;
    }

    let total = 0;
    container.innerHTML = cart.map(item => {
        total += item.price * item.quantity;
        return `
        <div class="order-item-mini" style="display:flex; gap:15px; margin-bottom:15px; align-items:center;">
            <img src="${item.img}" style="width:60px; height:70px; object-fit:cover; border-radius:4px; border:1px solid #eee;">
            <div style="flex:1;">
                <h4 style="font-size:14px; margin:0 0 5px 0;">${item.name}</h4>
                <p style="font-size:12px; color:#666; margin:0;">${item.color} | Size: ${item.size}</p>
                <p style="font-size:12px; margin:5px 0;">x <strong>${item.quantity}</strong></p>
            </div>
            <div style="font-weight:700; font-size:14px;">${(item.price * item.quantity).toLocaleString()}₫</div>
        </div>`;
    }).join('');

    subTotalEl.innerText = total.toLocaleString() + '₫';
    totalEl.innerText = total.toLocaleString() + '₫';
}

function handleCheckout(e) {
    e.preventDefault();
    if (cart.length === 0) return alert("Giỏ hàng trống!");

    const name = document.getElementById('cusName').value;
    const phone = document.getElementById('cusPhone').value;
    const address = document.getElementById('cusAddress').value;
    const note = document.getElementById('cusNote').value;
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

    const newOrder = {
        id: "DH" + Date.now().toString().slice(-6),
        customer: { name, phone, address, note },
        items: [...cart],
        total: cart.reduce((s, i) => s + i.price * i.quantity, 0),
        status: 'pending',
        isPaid: false,
        paymentMethod: paymentMethod === 'cod' ? 'COD' : 'Banking',
        date: new Date().toLocaleString('vi-VN')
    };

    // Lưu vào LocalStorage
    let orders = JSON.parse(localStorage.getItem('moonlight_orders')) || [];
    orders.unshift(newOrder);
    localStorage.setItem('moonlight_orders', JSON.stringify(orders));

    // Trừ kho (Trừ ngay khi đặt hoặc trừ khi Admin duyệt - Ở đây tôi làm trừ khi Admin duyệt để an toàn)
    // Nhưng để UX tốt, ta xóa giỏ hàng ngay.
    cart = [];
    saveCart();

    alert(`Đặt hàng thành công! Mã đơn: ${newOrder.id}`);
    window.location.href = 'index.html';
}

// --- 7. TIỆN ÍCH (UTILS) ---

// Tìm kiếm
function setupSearch() {
    const input = document.getElementById('searchInput');
    if (input) {
        input.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                const keyword = e.target.value.toLowerCase();
                const filtered = products.filter(p => p.name.toLowerCase().includes(keyword));
                renderProductGrid(filtered, 'product-grid');
                toggleSearch(); // Đóng popup
                document.getElementById('shop').scrollIntoView({behavior:'smooth'});
            }
        });
    }
}

function toggleSearch() {
    const overlay = document.getElementById('searchOverlay');
    if (overlay) overlay.classList.toggle('open');
    const input = document.getElementById('searchInput');
    if (input && overlay.classList.contains('open')) input.focus();
}

// Yêu thích
function toggleWishlist(btn, id) {
    const icon = btn.querySelector('i');
    if (wishlist.includes(id)) {
        wishlist = wishlist.filter(i => i !== id);
        icon.classList.remove('fas');
        icon.classList.add('far');
        showToast({title:'Đã bỏ thích', message:'Đã xóa khỏi danh sách yêu thích', type:'info'});
    } else {
        wishlist.push(id);
        icon.classList.remove('far');
        icon.classList.add('fas');
        showToast({title:'Đã thích', message:'Đã thêm vào danh sách yêu thích', type:'success'});
    }
    localStorage.setItem('moonlight_wishlist', JSON.stringify(wishlist));
}

// Scroll Effects (Hiệu ứng cuộn)
function setupScrollEffects() {
    const elements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) entry.target.classList.add('active');
        });
    });
    elements.forEach(el => observer.observe(el));
}

// Toast Notification
function showToast({ title, message, type }) {
    // Nếu chưa có box thì tạo
    let box = document.getElementById('toast-box');
    if (!box) {
        box = document.createElement('div');
        box.id = 'toast-box';
        document.body.appendChild(box);
    }

    const toast = document.createElement('div');
    const icons = {
        success: 'fas fa-check-circle',
        info: 'fas fa-info-circle',
        warning: 'fas fa-exclamation-circle',
        error: 'fas fa-exclamation-triangle'
    };
    
    toast.classList.add('toast', `toast--${type}`);
    toast.innerHTML = `
        <div class="toast__icon"><i class="${icons[type]}"></i></div>
        <div class="toast__body">
            <h3 class="toast__title">${title}</h3>
            <p class="toast__msg">${message}</p>
        </div>
        <div class="toast__close"><i class="fas fa-times"></i></div>
    `;
    
    box.appendChild(toast);
    
    // Auto remove
    setTimeout(() => {
        if(toast) box.removeChild(toast);
    }, 3000);
}

// --- REVIEW ---
function renderProductReviews(pid) {
    // (Logic render review tương tự trước, lấy từ moonlight_all_reviews)
}