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

// --- REVIEW CHO TỪNG SẢN PHẨM RIÊNG BIỆT (LIÊM KHIẾT - TỰ ĐỘNG HIỂN THỊ) ---
let selectedRating = 0;

function rateStar(star) {
    selectedRating = star;
    const ratingInput = document.getElementById('ratingValue');
    if (ratingInput) ratingInput.value = star;

    const stars = document.querySelectorAll('.star-rating-input i');
    stars.forEach((s, index) => {
        if (index < star) {
            s.classList.remove('far');
            s.classList.add('fas');
            s.style.color = '#f59e0b';
        } else {
            s.classList.remove('fas');
            s.classList.add('far');
            s.style.color = '';
        }
    });
}

function renderProductReviews(pid) {
    const listContainer = document.getElementById('reviewsList');
    if (!listContainer) return;

    let allReviews = JSON.parse(localStorage.getItem('moonlight_all_reviews')) || [];
    
    // LỌC ĐÁNH GIÁ RIÊNG CỦA SẢN PHẨM NÀY
    const productReviews = allReviews.filter(r => String(r.productId) === String(pid));

    // Cập nhật số sao trung bình và số lượng đánh giá của riêng sản phẩm này
    const avgScore = productReviews.length > 0
        ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
        : (currentProduct && currentProduct.rating ? currentProduct.rating : '5.0');
    
    const count = productReviews.length;

    const avgEl = document.querySelector('.average-rating');
    if (avgEl) avgEl.innerText = avgScore;

    const totalEl = document.querySelector('.total-reviews');
    if (totalEl) totalEl.innerText = `(${count} đánh giá thực tế)`;

    const starsStatic = document.querySelector('.stars-static');
    if (starsStatic) {
        const rounded = Math.round(Number(avgScore) || 5);
        starsStatic.innerHTML = '★'.repeat(Math.min(5, rounded)) + '☆'.repeat(Math.max(0, 5 - rounded));
    }

    if (productReviews.length === 0) {
        listContainer.innerHTML = `
            <div style="text-align:center; padding:35px 20px; color:#888;">
                <i class="far fa-comment-dots" style="font-size:32px; margin-bottom:10px; opacity:0.5; display:block;"></i>
                Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên chia sẻ cảm nhận của bạn!
            </div>
        `;
        return;
    }

    listContainer.innerHTML = productReviews.map(rev => {
        const initials = (rev.name || 'K').split(' ').map(w => w[0]).filter(Boolean).slice(-2).join('').toUpperCase();
        return `
            <div class="review-item" style="margin-bottom:20px; padding-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.06); display:flex; gap:14px; align-items:flex-start;">
                <div class="review-avatar" style="width:40px; height:40px; border-radius:50%; background:linear-gradient(135deg, rgba(91, 80, 246, 0.4), rgba(212, 175, 55, 0.4)); display:flex; align-items:center; justify-content:center; font-weight:700; color:#fff; flex-shrink:0;">
                    ${initials}
                </div>
                <div class="review-content" style="flex:1;">
                    <div class="review-top" style="display:flex; justify-content:space-between; align-items:center;">
                        <strong style="color:#fff; font-size:14px;">${rev.name}</strong>
                        <span class="review-date" style="font-size:12px; color:#888;">${rev.date || 'Gần đây'}</span>
                    </div>
                    <div class="stars-display" style="color:#f59e0b; font-size:12px; margin:4px 0;">
                        ${'★'.repeat(rev.rating)}${'☆'.repeat(Math.max(0, 5 - rev.rating))}
                        <span style="font-size:11px; color:#10b981; margin-left:8px; font-weight:600;">
                            <i class="fas fa-check-circle"></i> Đánh giá thực tế
                        </span>
                    </div>
                    <p style="margin:6px 0; color:#e2e8f0; line-height:1.45; font-size:13.5px;">${rev.content}</p>
                    ${rev.shopReply ? `
                        <div class="shop-reply-customer-view" style="margin-top:10px; background:rgba(91, 80, 246, 0.08); border-left:3px solid #5b50f6; border-radius:0 10px 10px 0; padding:10px 14px; font-size:13px;">
                            <div class="customer-reply-header" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
                                <span class="customer-reply-brand" style="color:#818cf8; font-weight:700; font-size:11.5px; text-transform:uppercase; letter-spacing:0.5px; display:inline-flex; align-items:center; gap:5px;">
                                    <i class="fas fa-shield-halved" style="color:#fbbf24;"></i> Phản Hồi Từ MoonLight
                                </span>
                                <small style="color:#94a3b8; font-size:11px;">${rev.shopReplyDate || ''}</small>
                            </div>
                            <p class="customer-reply-content" style="margin:0; color:#e2e8f0; line-height:1.5; font-size:13px;">${rev.shopReply}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function submitReview(e) {
    e.preventDefault();
    if (selectedRating === 0) {
        showToast('Chưa chọn số sao!', 'Vui lòng chọn số sao đánh giá sản phẩm.', 'warning');
        return;
    }

    const nameInput = document.getElementById('reviewerName');
    const contentInput = document.getElementById('reviewContent');
    const name = nameInput ? nameInput.value.trim() : 'Khách hàng';
    const content = contentInput ? contentInput.value.trim() : '';

    if (!content) {
        showToast('Nội dung trống', 'Vui lòng viết đôi lời cảm nhận về sản phẩm.', 'warning');
        return;
    }

    const pid = currentProduct ? currentProduct.id : 1;
    const pName = currentProduct ? currentProduct.name : 'Sản phẩm';

    // Đánh giá mới - Liêm khiết: Luôn hiển thị công khai ngay lập tức
    const newReview = {
        id: Date.now(),
        productId: pid,
        productName: pName,
        name: name,
        rating: selectedRating,
        content: content,
        date: new Date().toLocaleDateString('vi-VN'),
        status: 'approved' // Luôn hiển thị thực tế không qua kiểm duyệt
    };

    let allReviews = JSON.parse(localStorage.getItem('moonlight_all_reviews')) || [];
    allReviews.unshift(newReview);
    localStorage.setItem('moonlight_all_reviews', JSON.stringify(allReviews));

    // Reset Form
    const form = document.getElementById('reviewForm');
    if (form) form.reset();
    rateStar(0);

    showToast('Cảm ơn quý khách!', 'Đánh giá thực tế của bạn đã được hiển thị công khai.', 'success');
    renderProductReviews(pid);
}