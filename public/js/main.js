// --- 1. DỮ LIỆU SẢN PHẨM MẪU (DATABASE) ---
let products = JSON.parse(localStorage.getItem('moonlight_products')) || [];
let accounts = JSON.parse(localStorage.getItem('moonlight_accounts')) || [
    { id: 1, username: "admin", password: "123", name: "Admin", role: "Admin" }
];
let bestSellers = JSON.parse(localStorage.getItem('moonlight_products')) || [];


let revenueChartInstance = null;
let statusChartInstance = null;
let currentOrderFilter = 'all'; // all, store, online

function saveAccountsToLocal() {
    localStorage.setItem('moonlight_accounts', JSON.stringify(accounts));
}

// --- 2. KHỞI TẠO BIẾN TOÀN CỤC ---
let cart = JSON.parse(localStorage.getItem('moonlight_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('moonlight_wishlist')) || [];
let displayedProducts = 8;
let displayedBestSellers = 4;

// Biến cho trang Chi Tiết
let currentProduct = null;
let selectedColor = null;
let selectedSize = null;
let quantity = 1; // Mặc định số lượng là 1

let posCart = [];
let currentPosSelection = {
    product: null,
    variantIndex: 0,
    size: ''
};

// --- 3. SỰ KIỆN KHI WEB LOAD ---
document.addEventListener('DOMContentLoaded', () => {

    // Nếu đang ở trang chủ (có lưới sản phẩm)
    if (document.getElementById('product-grid')) {
        renderShop(displayedProducts);
        renderBestSellers(displayedBestSellers);
    }

    // Nếu đang ở trang chi tiết
    if (document.getElementById('productDetailContainer')) {
        loadProductDetail();
    }

    // Nếu đang ở trang thanh toán
    if (document.getElementById('checkoutItems')) {
        renderCheckoutPage();
    }

    // Khởi tạo các tính năng chung
    setupSearch();
    setupScrollEffects();
    updateCartUI(); // Cập nhật icon giỏ hàng ngay khi vào web

    // Bắt sự kiện toàn cục cho nút Checkout (Fix lỗi click)
    document.addEventListener('click', function (e) {
        if (e.target && e.target.classList.contains('checkout-btn')) {
            goToCheckout();
        }
    });
});

function saveProductsToLocal() {
    localStorage.setItem('moonlight_products', JSON.stringify(products));
}
// --- 4. LOGIC TRANG CHI TIẾT (QUAN TRỌNG: FIX LỖI THÊM GIỎ HÀNG) ---
function loadProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = parseInt(urlParams.get('id'));
    const allProducts = [...products, ...bestSellers];

    currentProduct = allProducts.find(p => p.id === id);

    if (!currentProduct) {
        document.getElementById('productDetailContainer').innerHTML = "<h3>Sản phẩm không tồn tại!</h3>";
        return;
    }

    // RESET DỮ LIỆU MỖI KHI VÀO TRANG MỚI (FIX LỖI)
    quantity = 1;
    selectedColor = currentProduct.variants[0]; // Mặc định chọn màu đầu tiên
    selectedSize = currentProduct.sizes[0];     // Mặc định chọn size đầu tiên

    renderDetailHTML();
    renderRelatedProducts(allProducts);
}

function renderDetailHTML() {
    const container = document.getElementById('productDetailContainer');

    // Tính % giảm giá thực tế để hiển thị
    const percent = selectedColor.oldPrice ? Math.round(((selectedColor.oldPrice - selectedColor.price) / selectedColor.oldPrice) * 100) : 0;
    const isLiked = wishlist.includes(currentProduct.id) ? 'active' : '';
    const iconClass = wishlist.includes(currentProduct.id) ? 'fas' : 'far';

    container.innerHTML = `
        <div class="pd-image-col">
            <div class="main-img-wrapper">
                <button class="wishlist-btn ${isLiked}" style="opacity:1; transform:none; top:20px; right:20px; width:45px; height:45px; font-size:20px;" onclick="toggleWishlist(this, ${currentProduct.id})"><i class="${iconClass} fa-heart"></i></button>
                <img src="${selectedColor.img}" id="mainDetailImg" alt="${currentProduct.name}">
            </div>
        </div>
        <div class="pd-info-col">
            <h1 class="pd-title">${currentProduct.name}</h1>
            
            <div class="pd-rating">
                <i class="fas fa-star"></i> <span>${currentProduct.rating}/5 (${currentProduct.reviews} đánh giá)</span>
                <span style="margin:0 10px; color:#ddd;">|</span>
                <span>Đã bán ${formatSold(currentProduct.sold)}</span>
            </div>

            <div class="pd-price-box">
                <span class="pd-price" id="detailPrice">${selectedColor.price.toLocaleString()}₫</span>
                ${percent > 0 ? `<span class="pd-old-price" id="detailOldPrice">${selectedColor.oldPrice.toLocaleString()}₫</span>` : ''}
                ${percent > 0 ? `<span class="pd-discount-tag" id="detailSaleTag">Giảm ${percent}%</span>` : ''}
            </div>
            
            <p class="pd-desc">${currentProduct.desc || 'Chưa có mô tả.'}</p>
            
            <div class="pd-option-group">
                <span class="option-label">Màu sắc: <span id="colorName" style="font-weight:400">${selectedColor.color}</span></span>
                <div class="color-selector">
                    ${currentProduct.variants.map((v, idx) => `
                        <div class="color-btn ${idx === 0 ? 'selected' : ''}" onclick="selectVariant(${idx}, this)">
                            <span class="color-dot" style="background:${v.hex}"></span> ${v.color}
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="pd-option-group">
                <span class="option-label">Kích thước: <span id="sizeName" style="font-weight:400">Chọn size</span></span>
                <div class="size-selector" id="sizeSelectorContainer">
                    ${renderSizeButtons(selectedColor.sizes)}
                </div>
            </div>

            <div class="pd-actions">
                <div class="qty-input-group">
                    <button class="qty-nav-btn" onclick="updateDetailQty(-1)">-</button>
                    <input type="text" class="qty-val" id="detailQty" value="1" readonly>
                    <button class="qty-nav-btn" onclick="updateDetailQty(1)">+</button>
                </div>
                <button class="btn-add-cart-lg" onclick="addDetailToCart()">THÊM VÀO GIỎ HÀNG</button>
            </div>
        </div>
    `;

    // Reset chọn size khi mới vào
    selectedSize = null;
}

function renderSizeButtons(sizes) {
    if (!sizes || sizes.length === 0) return '<span style="color:#999; font-style:italic">Freesize / Hết size</span>';
    return sizes.map(s => `
        <div class="size-btn" onclick="selectSize('${s}', this)">${s}</div>
    `).join('');
}

// Logic chọn biến thể
function selectVariant(index, btn) {
    selectedColor = currentProduct.variants[index];

    // 1. Cập nhật Ảnh & Giá
    document.getElementById('mainDetailImg').src = selectedColor.img;
    document.getElementById('detailPrice').innerText = selectedColor.price.toLocaleString() + '₫';

    // 2. Cập nhật Giá cũ (nếu có sale)
    const oldPriceEl = document.getElementById('detailOldPrice');
    const saleTagEl = document.getElementById('detailSaleTag');
    if (selectedColor.oldPrice && selectedColor.oldPrice > selectedColor.price) {
        const percent = Math.round(((selectedColor.oldPrice - selectedColor.price) / selectedColor.oldPrice) * 100);
        if (oldPriceEl) { oldPriceEl.innerText = selectedColor.oldPrice.toLocaleString() + '₫'; oldPriceEl.style.display = 'inline'; }
        if (saleTagEl) { saleTagEl.innerText = `Giảm ${percent}%`; saleTagEl.style.display = 'inline-block'; }
    } else {
        if (oldPriceEl) oldPriceEl.style.display = 'none';
        if (saleTagEl) saleTagEl.style.display = 'none';
    }

    // 3. CẬP NHẬT DANH SÁCH SIZE (QUAN TRỌNG)
    document.getElementById('sizeSelectorContainer').innerHTML = renderSizeButtons(selectedColor.sizes);
    selectedSize = null; // Reset size đã chọn vì màu mới có thể không có size cũ
    document.getElementById('sizeName').innerText = "Vui lòng chọn lại size";

    // 4. UI Active
    document.getElementById('colorName').innerText = selectedColor.color;
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

function selectSize(size, btn) {
    selectedSize = size;
    document.getElementById('sizeName').innerText = size;
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

function updateDetailQty(change) {
    quantity += change;
    if (quantity < 1) quantity = 1;
    document.getElementById('detailQty').value = quantity;
}

// HÀM QUAN TRỌNG: THÊM VÀO GIỎ TỪ TRANG CHI TIẾT
function addDetailToCart() {
    if (!currentProduct || !selectedColor || !selectedSize) {
        showToast({ title: 'Lỗi', message: 'Dữ liệu sản phẩm chưa tải xong.', type: 'error' });
        return;
    }

    const item = {
        id: currentProduct.id,
        name: currentProduct.name,
        price: selectedColor.price, // Giá theo màu đã chọn
        img: selectedColor.img,     // Ảnh theo màu đã chọn
        color: selectedColor.color, // Màu đã chọn
        size: selectedSize,         // Size đã chọn
        quantity: quantity          // Số lượng từ input
    };

    pushToCart(item);
}

// --- 5. LOGIC GIỎ HÀNG (CORE) ---
function pushToCart(newItem) {
    // Kiểm tra trùng sản phẩm (ID + Màu + Size giống nhau)
    const exist = cart.find(i => i.id === newItem.id && i.color === newItem.color && i.size === newItem.size);

    if (exist) {
        exist.quantity += newItem.quantity;
    } else {
        cart.push(newItem);
    }

    saveCart();
    updateCartUI();
    toggleCart(); // Mở sidebar giỏ hàng để khách thấy
    showToast({ title: 'Thành công!', message: `Đã thêm ${newItem.name} vào giỏ.`, type: 'success', duration: 3000 });
}

function saveCart() {
    localStorage.setItem('moonlight_cart', JSON.stringify(cart));
    updateCartIcon();
}

function updateCartIcon() {
    const badge = document.querySelector('.badge');
    if (badge) {
        const totalQty = cart.reduce((sum, i) => sum + i.quantity, 0);
        badge.innerText = totalQty;
    }
}

function updateCartUI() {
    const list = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');

    if (!list) return;

    let total = 0;
    list.innerHTML = '';

    if (cart.length === 0) {
        list.innerHTML = '<p style="text-align:center; margin-top:50px; color:#999;">Giỏ hàng trống.</p>';
        if (totalEl) totalEl.innerText = '0₫';
        return;
    }

    cart.forEach((item, index) => {
        total += item.price * item.quantity;

        // Tìm dữ liệu gốc của sản phẩm để lấy danh sách size/màu đầy đủ
        const allProducts = [...products, ...bestSellers];
        const originalProduct = allProducts.find(p => p.id === item.id);

        list.innerHTML += `
            <div class="cart-item-row">
                <img src="${item.img}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    
                    <div class="cart-mini-options">
                        <p>Màu: </p>
                        <div class="mini-color-list">
                            ${originalProduct.variants.map(v => `
                                <span class="mini-color-dot ${v.color === item.color ? 'active' : ''}" 
                                      style="background: ${v.hex}" 
                                      title="${v.color}"
                                      onclick="updateCartItemProperty(${index}, 'color', '${v.color}')">
                                </span>
                            `).join('')}
                        </div>
                    </div>

                    <div class="cart-mini-options">
                        <p>Size: </p>
                        <div class="mini-size-list">
                            ${originalProduct.sizes.map(s => `
                                <span class="mini-size-tag ${s === item.size ? 'active' : ''}" 
                                      onclick="updateCartItemProperty(${index}, 'size', '${s}')">
                                    ${s}
                                </span>
                            `).join('')}
                        </div>
                    </div>

                    <div class="cart-item-price">${item.price.toLocaleString()}₫</div>
                    
                    <div class="cart-qty-control">
                        <button class="qty-btn-mini" onclick="cartChangeQty(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn-mini" onclick="cartChangeQty(${index}, 1)">+</button>
                    </div>
                </div>
                <div class="trash-btn" onclick="cartRemove(${index})"><i class="fas fa-trash"></i></div>
            </div>
        `;
    });

    if (totalEl) totalEl.innerText = total.toLocaleString() + '₫';
}

// Hàm cập nhật Size hoặc Màu trực tiếp từ giỏ hàng
function updateCartItemProperty(index, property, value) {
    const item = cart[index];
    const allProducts = [...products, ...bestSellers];
    const originalProduct = allProducts.find(p => p.id === item.id);

    if (property === 'color') {
        const variant = originalProduct.variants.find(v => v.color === value);
        item.color = value;
        item.img = variant.img; // Cập nhật lại ảnh theo màu mới
        item.price = variant.price; // Cập nhật lại giá nếu màu khác có giá khác
    } else if (property === 'size') {
        item.size = value;
    }

    // Sau khi cập nhật, kiểm tra xem có bị trùng với sản phẩm nào khác trong giỏ không
    // (Ví dụ: Đổi màu đen thành màu xám, mà trong giỏ đã có sẵn màu xám)
    for (let i = 0; i < cart.length; i++) {
        if (i !== index &&
            cart[i].id === item.id &&
            cart[i].color === item.color &&
            cart[i].size === item.size) {

            cart[i].quantity += item.quantity; // Gộp số lượng
            cart.splice(index, 1); // Xóa item hiện tại
            break;
        }
    }

    saveCart();
    updateCartUI();
}

function cartChangeQty(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        // Nếu giảm về 0 thì hỏi xóa
        cart.splice(index, 1);
    }
    saveCart();
    updateCartUI();
}

function cartRemove(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

// --- 6. CÁC TÍNH NĂNG KHÁC ---

// Toggle Sidebar
function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if (sidebar && overlay) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('open');
        // Nếu mở ra thì update lại cho chắc
        if (sidebar.classList.contains('open')) updateCartUI();
    }
}

// Quick Add từ Trang Chủ
function quickAdd(id) {
    const allProducts = [...products, ...bestSellers];
    const p = allProducts.find(x => x.id === id);
    if (p) {
        // Lấy biến thể đầu tiên làm mặc định
        const v = p.variants[0];
        pushToCart({
            id: p.id,
            name: p.name,
            price: v.price,
            img: v.img,
            color: v.color,
            size: p.sizes[0],
            quantity: 1
        });
    }
}

// Yêu thích
function toggleWishlist(btn, id) {
    btn.classList.toggle('active');
    const icon = btn.querySelector('i');
    if (btn.classList.contains('active')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        if (!wishlist.includes(id)) wishlist.push(id);
    } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        wishlist = wishlist.filter(item => item !== id);
    }
    localStorage.setItem('moonlight_wishlist', JSON.stringify(wishlist));
}

// Helper Format số đã bán
function formatSold(num) {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num;
}

// Search
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            const keyword = e.target.value.toLowerCase();
            const allProducts = [...products, ...bestSellers];
            const filtered = allProducts.filter(p => p.name.toLowerCase().includes(keyword));

            if (document.getElementById('product-grid')) {
                renderProductsHTML(filtered, 'product-grid');
                if (filtered.length > 0) document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
            } else {
                window.location.href = `index.html?search=${keyword}`;
            }
        });
    }
}
function toggleSearch() {
    const overlay = document.getElementById('searchOverlay');
    const input = document.getElementById('searchInput');
    if (overlay) {
        overlay.classList.toggle('open');
        if (overlay.classList.contains('open') && input) input.focus();
    }
}

// Render HTML Trang Chủ (Dùng chung cho Search, Load more)
function renderProductsHTML(data, elementId) {
    const grid = document.getElementById(elementId);
    if (!grid) return;
    if (data.length === 0) { grid.innerHTML = '<p style="text-align:center; grid-column:1/-1;">Không tìm thấy sản phẩm.</p>'; return; }

    grid.innerHTML = data.map(p => {
        const percent = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
        const v = p.variants && p.variants[0] ? p.variants[0] : { img: p.img };
        const isLiked = wishlist.includes(p.id) ? 'active' : '';
        const iconClass = wishlist.includes(p.id) ? 'fas' : 'far';

        return `
        <div class="product-card">
            <div class="card-img">
                <span class="badge-sale">-${percent}%</span>
                <button class="wishlist-btn ${isLiked}" onclick="toggleWishlist(this, ${p.id})"><i class="${iconClass} fa-heart"></i></button>
                <img src="${v.img}" alt="${p.name}">
                <div class="card-overlay-btns">
                    <a href="product.html?id=${p.id}" class="view-btn"><i class="far fa-eye"></i> Xem chi tiết</a>
                    <button class="add-btn" onclick="quickAdd(${p.id})"><i class="fas fa-shopping-cart"></i> Thêm nhanh</button>
                </div>
            </div>
            <div class="card-info">
                <h3>${p.name}</h3>
                <div class="product-meta"><span class="stars"><i class="fas fa-star"></i> ${p.rating}</span><span class="sold-count">Đã bán ${formatSold(p.sold)}</span></div>
                <div class="price">
                    <span class="new-price">${p.price.toLocaleString()}₫</span>
                    <span class="old-price" style="color:#999; text-decoration:line-through; font-size:13px; margin-left:5px;">${p.oldPrice.toLocaleString()}₫</span>
                </div>
            </div>
        </div>`;
    }).join('');
}

// Logic Hiển Thị & Load More
function renderShop(limit) {
    const list = products.slice(0, limit);
    renderProductsHTML(list, 'product-grid');
    const btn = document.getElementById('loadMoreContainer');
    if (btn) btn.style.display = (limit >= products.length) ? 'none' : 'block';
}
function loadMoreProducts() { displayedProducts += 4; renderShop(displayedProducts); }

function renderBestSellers(limit) {
    const list = bestSellers.slice(0, limit);
    renderProductsHTML(list, 'best-seller-grid');
    const btn = document.getElementById('loadMoreBestSeller');
    if (btn) btn.style.display = (limit >= bestSellers.length) ? 'none' : 'block';
}
function loadMoreBestSellers() { displayedBestSellers += 4; renderBestSellers(displayedBestSellers); }

function renderRelatedProducts(allProducts) {
    const grid = document.getElementById('related-grid');
    if (!grid) return;
    const related = allProducts.filter(p => p.id !== currentProduct.id).slice(0, 4);
    grid.innerHTML = related.map(p => `
        <div class="product-card">
            <div class="card-img"><img src="${p.img}"><div class="card-overlay-btns"><a href="product.html?id=${p.id}" class="view-btn">Xem ngay</a></div></div>
            <div class="card-info"><h3>${p.name}</h3><div class="price">${p.price.toLocaleString()}₫</div></div>
        </div>`).join('');
}

// --- 7. CHECKOUT LOGIC ---
function goToCheckout() {
    if (cart.length === 0) {
        showToast({ title: 'Giỏ hàng trống!', message: 'Vui lòng chọn sản phẩm trước.', type: 'error' });
    } else {
        window.location.href = 'checkout.html';
    }
}

function renderCheckoutPage() {
    const container = document.getElementById('checkoutItems');
    const subtotalEl = document.getElementById('checkoutSubtotal');
    const totalEl = document.getElementById('checkoutTotal');
    if (!container) return;
    if (cart.length === 0) { container.innerHTML = '<p style="text-align:center; color:#999;">Giỏ hàng trống.</p>'; return; }
    let total = 0;
    container.innerHTML = cart.map(item => {
        total += item.price * item.quantity;
        return `<div class="order-item-mini"><img src="${item.img}"><div class="order-info"><h4>${item.name}</h4><p>${item.color} / ${item.size} x <strong>${item.quantity}</strong></p><p style="font-weight:700; color:var(--gold)">${(item.price * item.quantity).toLocaleString()}₫</p></div></div>`;
    }).join('');
    subtotalEl.innerText = total.toLocaleString() + '₫'; totalEl.innerText = total.toLocaleString() + '₫';
}

function handleCheckout(e) {
    e.preventDefault();
    if (cart.length === 0) {
        showToast({ title: 'Giỏ hàng trống!', message: 'Vui lòng chọn sản phẩm.', type: 'error' });
        return;
    }

    const name = document.getElementById('cusName').value.trim();
    const phone = document.getElementById('cusPhone').value.trim();
    const address = document.getElementById('cusAddress').value.trim();
    const note = document.getElementById('cusNote').value.trim();
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

    // Tạo đối tượng đơn hàng mới
    const newOrder = {
        id: "DH" + Date.now(), // Mã đơn hàng duy nhất
        customer: { name, phone, address, note },
        items: [...cart], // Lưu lại danh sách sản phẩm lúc mua
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'pending', // Trạng thái: pending (Chờ duyệt), completed (Đã giao), cancelled (Đã hủy)
        date: new Date().toLocaleString('vi-VN'),
        paymentMethod: paymentMethod === 'cod' ? 'Thanh toán COD' : 'Chuyển khoản'
    };

    // Lưu vào danh sách đơn hàng tổng trong localStorage
    let allOrders = JSON.parse(localStorage.getItem('moonlight_orders')) || [];
    allOrders.unshift(newOrder);
    localStorage.setItem('moonlight_orders', JSON.stringify(allOrders));

    // Thông báo và chuyển hướng
    showToast({ title: 'Đặt hàng thành công! 🎉', message: `Cảm ơn ${name}. Đơn hàng của bạn đang được xử lý.`, type: 'success', duration: 4000 });

    setTimeout(() => {
        cart = []; // Xóa giỏ hàng sau khi đặt thành công
        saveCart();
        window.location.href = 'index.html';
    }, 2000);
}

// Toast
function showToast({ title = '', message = '', type = 'info', duration = 3000 }) {
    const main = document.getElementById('toast-box');
    if (!main) { const box = document.createElement('div'); box.id = 'toast-box'; document.body.appendChild(box); }
    const toastBox = document.getElementById('toast-box');
    const toast = document.createElement('div');
    const icons = { success: 'fas fa-check-circle', info: 'fas fa-info-circle', warning: 'fas fa-exclamation-circle', error: 'fas fa-exclamation-triangle' };
    const icon = icons[type];
    const delay = (duration / 1000).toFixed(2);
    toast.classList.add('toast', `toast--${type}`);
    toast.style.animation = `slideInLeft 0.5s ease, fadeOut linear 1s ${delay}s forwards`;
    toast.innerHTML = `<div class="toast__icon"><i class="${icon}"></i></div><div class="toast__body"><h3 class="toast__title">${title}</h3><p class="toast__msg">${message}</p></div><div class="toast__close"><i class="fas fa-times"></i></div>`;
    toastBox.appendChild(toast);
    const autoRemoveId = setTimeout(() => { if (toast.parentNode) toastBox.removeChild(toast); }, duration + 1000);
    toast.onclick = (e) => { if (e.target.closest('.toast__close')) { toastBox.removeChild(toast); clearTimeout(autoRemoveId); } };
}

// Review
let selectedRating = 0;
function rateStar(star) {
    selectedRating = star; document.getElementById('ratingValue').value = star;
    const stars = document.querySelectorAll('.star-rating-input i');
    stars.forEach((s, index) => { if (index < star) { s.classList.remove('far'); s.classList.add('fas'); } else { s.classList.remove('fas'); s.classList.add('far'); } });
}
function submitReview(e) {
    e.preventDefault();
    if (selectedRating === 0) { showToast({ title: 'Chưa chọn sao!', message: 'Vui lòng chấm điểm sản phẩm.', type: 'warning' }); return; }

    const name = document.getElementById('reviewerName').value;
    const content = document.getElementById('reviewContent').value;
    const date = new Date().toLocaleDateString('vi-VN');
    const productId = currentProduct.id; // Lưu ID sản phẩm được đánh giá

    // Đối tượng review mới
    const newReviewData = {
        id: Date.now(), // ID định danh duy nhất cho review
        productId: productId,
        productName: currentProduct.name,
        name: name,
        rating: selectedRating,
        content: content,
        date: date,
        status: 'approved' // Mặc định là hiện
    };

    // Lưu vào danh sách tổng trong localStorage
    let allReviews = JSON.parse(localStorage.getItem('moonlight_all_reviews')) || [];
    allReviews.unshift(newReviewData);
    localStorage.setItem('moonlight_all_reviews', JSON.stringify(allReviews));

    // Reset Form và thông báo
    document.getElementById('reviewForm').reset();
    selectedRating = 0;
    rateStar(0);
    showToast({ title: 'Đánh giá thành công!', message: 'Cảm ơn bạn đã nhận xét.', type: 'success' });

    // Cập nhật lại danh sách hiển thị ở trang product
    renderProductReviews(productId);
}

function renderAdminReviews() {
    const container = document.querySelector('.admin-content');
    let allReviews = JSON.parse(localStorage.getItem('moonlight_all_reviews')) || [];

    container.innerHTML = `
        <header class="admin-header"><h2>QUẢN LÝ ĐÁNH GIÁ</h2></header>
        <div class="data-table-container">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Khách hàng</th>
                        <th>Sản phẩm</th>
                        <th>Đánh giá</th>
                        <th>Nội dung</th>
                        <th>Ngày</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${allReviews.map((rev, index) => `
                        <tr>
                            <td><strong>${rev.name}</strong></td>
                            <td><small>${rev.productName}</small></td>
                            <td><span style="color:#f1c40f">${'★'.repeat(rev.rating)}</span></td>
                            <td><p style="font-size:12px; max-width:250px;">${rev.content}</p></td>
                            <td>${rev.date}</td>
                            <td>
                                <button class="btn-delete" onclick="deleteReview(${rev.id})" style="color:red; border:none; background:none; cursor:pointer;">
                                    <i class="fas fa-trash"></i> Xóa
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function deleteReview(reviewId) {
    if (confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
        let allReviews = JSON.parse(localStorage.getItem('moonlight_all_reviews')) || [];
        allReviews = allReviews.filter(r => r.id !== reviewId);
        localStorage.setItem('moonlight_all_reviews', JSON.stringify(allReviews));
        renderAdminReviews(); // Load lại bảng
        showToast({ title: 'Đã xóa', message: 'Đánh giá đã được loại bỏ.', type: 'info' });
    }
}

// --- FIX LỖI CHUYỂN TAB ---
function switchTab(tabName) {
    const menuItems = document.querySelectorAll('.admin-menu a');
    menuItems.forEach(item => item.classList.remove('active'));

    const activeItem = document.querySelector(`.admin-menu a[onclick*="'${tabName}'"]`);
    if (activeItem) activeItem.classList.add('active');

    if (tabName === 'dashboard') {
        location.reload();
    } else if (tabName === 'products') {
        renderAdminProducts();
    } else if (tabName === 'orders') {
        renderAdminOrders();
    } else if (tabName === 'reviews') {
        renderAdminReviews();
    } else if (tabName === 'staff') {
        renderAdminStaff();
    }
}
function deleteReview(reviewId) {
    if (confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
        let allReviews = JSON.parse(localStorage.getItem('moonlight_all_reviews')) || [];
        allReviews = allReviews.filter(r => r.id !== reviewId);
        localStorage.setItem('moonlight_all_reviews', JSON.stringify(allReviews));
        renderAdminReviews(); // Load lại bảng
        showToast({ title: 'Đã xóa', message: 'Đánh giá đã được loại bỏ.', type: 'info' });
    }
}

// Scroll Effect
function setupScrollEffects() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// Thêm nút mở wishlist vào Navbar (nếu muốn) hoặc dùng icon đã có
function toggleWishlistSidebar() {
    const sidebar = document.getElementById('wishlistSidebar');
    const overlay = document.getElementById('wishlistOverlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
    if (sidebar.classList.contains('open')) renderWishlistUI();
}

// Cập nhật lại hàm toggleWishlist hiện có của bạn
function toggleWishlist(btn, id) {
    btn.classList.toggle('active');
    const icon = btn.querySelector('i');
    if (btn.classList.contains('active')) {
        icon.classList.remove('far'); icon.classList.add('fas');
        if (!wishlist.includes(id)) wishlist.push(id);
        showToast({ title: 'Đã yêu thích!', message: 'Sản phẩm đã được lưu vào danh sách.', type: 'info' });
    } else {
        icon.classList.remove('fas'); icon.classList.add('far');
        wishlist = wishlist.filter(item => item !== id);
    }
    localStorage.setItem('moonlight_wishlist', JSON.stringify(wishlist));
    // Nếu đang mở sidebar yêu thích thì cập nhật luôn
    if (document.getElementById('wishlistSidebar').classList.contains('open')) renderWishlistUI();
}

// Hàm hiển thị sản phẩm yêu thích
function renderWishlistUI() {
    const list = document.getElementById('wishlistItems');
    if (!list) return;

    const allProducts = [...products, ...bestSellers];
    const likedProducts = allProducts.filter(p => wishlist.includes(p.id));

    list.innerHTML = '';
    if (likedProducts.length === 0) {
        list.innerHTML = '<p style="text-align:center; margin-top:50px;">Bạn chưa yêu thích sản phẩm nào.</p>';
        return;
    }

    list.innerHTML = likedProducts.map(p => `
        <div class="cart-item-row">
            <img src="${p.variants[0].img}">
            <div class="cart-item-info">
                <h4>${p.name}</h4>
                <div class="cart-item-price">${p.price.toLocaleString()}₫</div>
                <button class="add-btn" style="padding: 5px 10px; font-size: 10px; margin-top: 5px;" onclick="quickAdd(${p.id})">MUA NGAY</button>
            </div>
            <div class="trash-btn" onclick="removeFromWishlist(${p.id})"><i class="fas fa-trash"></i></div>
        </div>
    `).join('');
}

function removeFromWishlist(id) {
    wishlist = wishlist.filter(item => item !== id);
    localStorage.setItem('moonlight_wishlist', JSON.stringify(wishlist));
    renderWishlistUI();
    // Cập nhật lại icon trên thẻ sản phẩm nếu đang ở trang chủ
    renderShop(displayedProducts);
}

// Xử lý đăng nhập
function handleLogin() {
    const userInp = document.getElementById('username').value;
    const passInp = document.getElementById('password').value;

    const user = accounts.find(acc => acc.username === userInp && acc.password === passInp);

    if (user) {
        localStorage.setItem('moonlight_user', JSON.stringify(user));
        window.location.href = 'admin.html';
    } else {
        showToast({ title: 'Thất bại', message: 'Tài khoản hoặc mật khẩu sai!', type: 'error' });
    }
}

// Kiểm tra quyền truy cập (Dùng ở admin.html)
function checkAuth() {
    const loggedUser = JSON.parse(localStorage.getItem('moonlight_user'));
    if (!loggedUser) {
        window.location.href = 'login.html';
        return;
    }

    // Hiển thị thông tin user
    if (document.getElementById('adminName')) {
        document.getElementById('adminName').innerText = loggedUser.name;
        document.getElementById('adminRole').innerText = `Quyền hạn: ${loggedUser.role}`;
    }

    // Xử lý ẩn/hiện menu theo quyền
    if (loggedUser.role !== 'Admin') {
        // Ẩn tab nhân sự nếu không phải Admin
        const staffMenu = document.querySelector('[onclick="switchTab(\'staff\')"]');
        if (staffMenu) staffMenu.style.display = 'none';
    }

    // Nếu là Staff thì không được vào mục quản lý nhân sự (bảo vệ thêm bằng logic)
    if (loggedUser.role === 'Staff' && window.location.pathname.includes('admin.html')) {
        // Có thể ẩn thêm các nút Xóa sản phẩm...
    }
}

function handleLogout() {
    localStorage.removeItem('moonlight_user');
    window.location.href = 'login.html';
}

function renderAdminStats() {
    const container = document.querySelector('.admin-content');
    if (!container) return;

    // Lấy dữ liệu thực tế
    const products = JSON.parse(localStorage.getItem('moonlight_products')) || [];
    const orders = JSON.parse(localStorage.getItem('moonlight_orders')) || [];
    const logs = JSON.parse(localStorage.getItem('moonlight_logs')) || [];

    // Tính toán số liệu thống kê
    const totalRevenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total, 0);
    const newOrders = orders.filter(o => o.status === 'pending').length;

    // Kiểm tra hàng sắp hết (Tổng kho < 10)
    const lowStockProducts = products.filter(p => (p.stock || 0) < 10);

    container.innerHTML = `
        <header class="admin-header">
            <h2>DASHBOARD</h2>
            <div style="font-size:12px; color:#888;">Cập nhật: ${new Date().toLocaleString('vi-VN')}</div>
        </header>

        <div class="dashboard-stats">
            <div class="stat-card">
                <h3>Doanh thu tổng</h3>
                <p style="color:var(--gold)">${totalRevenue.toLocaleString()}₫</p>
            </div>
            <div class="stat-card">
                <h3>Đơn hàng chờ xử lý</h3>
                <p>${newOrders}</p>
            </div>
            <div class="stat-card">
                <h3>Tổng sản phẩm</h3>
                <p>${products.length}</p>
            </div>
            <div class="stat-card">
                <h3>Khách hàng</h3>
                <p>${Math.floor(orders.length * 1.2) + 20}</p> </div>
        </div>

        ${lowStockProducts.length > 0 ? `
            <div class="low-stock-alert">
                <i class="fas fa-exclamation-triangle"></i>
                <div class="low-stock-content">
                    <strong>CẢNH BÁO: ${lowStockProducts.length} sản phẩm sắp hết hàng!</strong>
                    <p>Vui lòng kiểm tra kho: ${lowStockProducts.map(p => p.name).slice(0, 3).join(', ')}...</p>
                </div>
                <button onclick="switchTab('products')" style="margin-left:auto; background:transparent; border:1px solid #ff4444; color:#ff4444; padding:5px 15px; border-radius:4px; cursor:pointer;">Kiểm tra</button>
            </div>
        ` : ''}

        <div class="charts-section">
            <div class="charts-grid">
                <div class="chart-box">
                    <div class="chart-header">
                        <h3>Biểu đồ Doanh Thu</h3>
                        <div class="chart-filters">
                            <button class="chart-btn active" onclick="updateCharts('7days', this)">7 Ngày</button>
                            <button class="chart-btn" onclick="updateCharts('30days', this)">30 Ngày</button>
                            <button class="chart-btn" onclick="updateCharts('month', this)">Tháng</button>
                            <button class="chart-btn" onclick="updateCharts('year', this)">Năm</button>
                        </div>
                    </div>
                    <canvas id="revenueChart" height="250"></canvas>
                </div>

                <div class="chart-box">
                    <div class="chart-header">
                        <h3>Hàng Đã Bán</h3>
                    </div>
                    <canvas id="soldChart" height="250"></canvas>
                </div>
            </div>
        </div>

        <div class="data-table-container">
            <h3 style="padding: 20px; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.1); margin: 0; font-size:14px; text-transform:uppercase;">
                Nhật Ký Hệ Thống Gần Đây
            </h3>
            <table class="admin-table">
                <thead>
                    <tr><th>Thời gian</th><th>Nhân sự</th><th>Hành động</th><th>Chi tiết</th></tr>
                </thead>
                <tbody id="auditLogTable">
                    ${logs.length > 0 ? logs.slice(0, 5).map(log => `
                        <tr>
                            <td><span class="log-time">${log.time}</span></td>
                            <td><span class="log-user"><i class="fas fa-user-shield"></i> ${log.user}</span></td>
                            <td><span class="log-action-badge ${log.action.includes('Xóa') ? 'delete' : (log.action.includes('Thêm') ? 'add' : 'edit')}">${log.action}</span></td>
                            <td><span class="log-details">${log.details}</span></td>
                        </tr>
                    `).join('') : '<tr><td colspan="4" style="text-align:center; padding:20px; color:#666">Chưa có dữ liệu</td></tr>'}
                </tbody>
            </table>
        </div>
    `;

    // Khởi tạo biểu đồ mặc định (7 ngày)
    initCharts();
}

// --- HÀM KHỞI TẠO BIỂU ĐỒ (FIX LỖI TRƯỢT DÀI) ---
function initCharts() {
    // Dữ liệu giả lập (Giữ nguyên phần data của bạn)
    const chartData = {
        '7days': {
            labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
            revenue: [1500000, 2200000, 1800000, 3500000, 2100000, 4600000, 3900000],
            sold: [5, 8, 6, 12, 7, 15, 10]
        },
        '30days': {
            labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
            revenue: [12000000, 15000000, 11000000, 18000000],
            sold: [40, 55, 38, 60]
        },
        'month': {
            labels: ['1-10', '11-20', '21-30'],
            revenue: [45000000, 52000000, 48000000],
            sold: [150, 180, 160]
        },
        'year': {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            revenue: [150000000, 200000000, 180000000, 250000000],
            sold: [500, 650, 600, 850]
        }
    };

    // 1. Biểu đồ Doanh thu
    const ctxRev = document.getElementById('revenueChart').getContext('2d');
    revenueChartInstance = new Chart(ctxRev, {
        type: 'line',
        data: {
            labels: chartData['7days'].labels,
            datasets: [{
                label: 'Doanh thu (VNĐ)',
                data: chartData['7days'].revenue,
                borderColor: '#d4af37',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#000',
                pointBorderColor: '#d4af37',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, /* <--- QUAN TRỌNG: Thêm dòng này để fix lỗi trượt dài */
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#888' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#888' }
                }
            }
        }
    });

    // 2. Biểu đồ Hàng bán
    const ctxSold = document.getElementById('soldChart').getContext('2d');
    soldChartInstance = new Chart(ctxSold, {
        type: 'bar',
        data: {
            labels: chartData['7days'].labels,
            datasets: [{
                label: 'Sản phẩm',
                data: chartData['7days'].sold,
                backgroundColor: '#3498db',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, /* <--- QUAN TRỌNG: Thêm dòng này */
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#888' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#888' }
                }
            }
        }
    });

    window.chartMockData = chartData;
}

// Hàm cập nhật biểu đồ khi bấm nút lọc
function updateCharts(period, btn) {
    // 1. Cập nhật UI nút bấm
    document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // 2. Lấy dữ liệu tương ứng
    const data = window.chartMockData[period];

    // 3. Cập nhật biểu đồ Doanh thu
    revenueChartInstance.data.labels = data.labels;
    revenueChartInstance.data.datasets[0].data = data.revenue;
    revenueChartInstance.update();

    // 4. Cập nhật biểu đồ Hàng bán
    soldChartInstance.data.labels = data.labels;
    soldChartInstance.data.datasets[0].data = data.sold;
    soldChartInstance.update();
}

document.addEventListener('keydown', function (e) {
    if (e.altKey && e.shiftKey && e.code === 'KeyA') {
        window.location.href = 'login.html';
    }
});

// --- RENDER BẢNG SẢN PHẨM (VARIANTS & STOCK FIX) ---
function renderAdminProducts() {
    const container = document.querySelector('.admin-content');
    if (!container) return;

    container.innerHTML = `
        <header class="admin-header">
            <h2>QUẢN LÝ SẢN PHẨM</h2>
            <button class="btn-primary" onclick="showAddProductForm()">+ THÊM SẢN PHẨM</button>
        </header>

        <div class="data-table-container">
            <table class="admin-table product-table">
                <thead>
                    <tr>
                        <th>Ảnh</th>
                        <th>Tên sản phẩm</th>
                        <th>Cấu hình (Màu - Giá - Kho)</th>
                        <th>Đã bán</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${products.map(p => {
        const variants = Array.isArray(p.variants) ? p.variants : [];
        const prices = variants.map(v => v.price || 0);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const priceDisplay = minPrice === maxPrice ? `${minPrice.toLocaleString()}₫` : `${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}₫`;
        const totalStock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);

        return `
                        <tr>
                            <td><img src="${p.img}" onerror="this.src='https://via.placeholder.com/50'"></td>
                            <td>
                                <strong style="color:#fff">${p.name}</strong>
                                <div style="font-size:12px; color:var(--gold); font-weight:700; margin-top:4px;">${priceDisplay}</div>
                                <div style="font-size:11px; color:#888; margin-top:2px;">Tổng kho: <span style="color:${totalStock < 10 ? '#ff4444' : '#47d864'}">${totalStock}</span></div>
                            </td>
                            <td>
                                <div style="font-size:12px; line-height:1.6;">
                                    ${variants.map(v => `
                                        <div class="variant-info-line">
                                            <span class="v-dot" style="background:${v.hex}"></span>
                                            <span style="color:#eee; width:50px; display:inline-block;">${v.color}</span>
                                            <span style="color:var(--gold); width:80px; display:inline-block;">${Number(v.price).toLocaleString()}₫</span>
                                            <span>Kho: <strong style="color:${v.stock < 5 ? '#ff4444' : '#fff'}">${v.stock}</strong></span>
                                        </div>
                                    `).join('')}
                                </div>
                            </td>
                            <td><strong>${p.sold || 0}</strong></td>
                            <td style="text-align:center">
                                <button class="adm-btn" onclick="editProduct(${p.id})" title="Sửa"><i class="fas fa-edit"></i></button>
                                <button class="adm-btn" onclick="deleteProduct(${p.id})" title="Xóa"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>`;
    }).join('')}
                </tbody>
            </table>
        </div>

        <div id="productModal">
            <div class="modal-content">
                <h3 id="modalTitle">Cấu hình sản phẩm</h3>
                <form id="productForm" onsubmit="handleSaveProduct(event)">
                    <input type="hidden" id="editId">
                    <div class="form-row-split">
                        <div class="form-group"><label>Tên sản phẩm</label><input type="text" id="pName" required placeholder="Tên sản phẩm..."></div>
                        <div class="form-group"><label>Giảm giá (%)</label><input type="number" id="pSale" placeholder="0"></div>
                    </div>
                    <div class="variant-section">
                        <div class="variant-header">
                            <span>DANH SÁCH BIẾN THỂ</span>
                            <button type="button" class="btn-primary" onclick="addVariantRow()" style="padding:5px 15px; font-size:11px;">+ THÊM MÀU</button>
                        </div>
                        <div id="variantContainer"></div>
                    </div>
                    <div class="modal-btns">
                        <button type="submit" class="btn-confirm">LƯU DỮ LIỆU</button>
                        <button type="button" class="btn-cancel" onclick="closeModal()">ĐÓNG</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// --- 1. HÀM THÊM DÒNG BIẾN THỂ (CÓ Ô NHẬP GIÁ RIÊNG) ---
function addVariantRow(color = '', hex = '#000000', img = '', price = '', stock = '', sizes = '') {
    const container = document.getElementById('variantContainer');
    const div = document.createElement('div');
    div.className = 'variant-row';
    div.innerHTML = `
        <input type="text" placeholder="Màu" class="v-color" value="${color}" required title="Tên màu">
        <input type="color" class="v-hex" value="${hex}" title="Mã màu">
        <input type="text" placeholder="Link ảnh" class="v-img" value="${img}" required title="Link ảnh">
        <input type="number" placeholder="Giá" class="v-price" value="${price}" required title="Giá bán">
        <input type="number" placeholder="Kho" class="v-stock" value="${stock}" required title="Số lượng trong kho">
        <input type="text" placeholder="Sizes" class="v-sizes" value="${sizes}" required title="Ví dụ: S, M, L">
        <button type="button" onclick="this.parentElement.remove()" class="v-del-btn"><i class="fas fa-times"></i></button>
    `;
    container.appendChild(div);
}
// --- LOGIC XỬ LÝ (FIX LỖI) ---
// --- LOGIC: THÊM / SỬA ---
function showAddProductForm() {
    document.getElementById('productForm').reset();
    document.getElementById('editId').value = '';
    document.getElementById('variantContainer').innerHTML = '';
    addVariantRow(); // Thêm sẵn 1 dòng trống
    document.getElementById('modalTitle').innerText = 'Thêm sản phẩm mới';
    document.getElementById('productModal').classList.add('open');
}

function closeModal() {
    document.getElementById('productModal').classList.remove('open');
}

function handleSaveProduct(e) {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    const name = document.getElementById('pName').value;
    const salePercent = parseInt(document.getElementById('pSale').value) || 0;

    const variantRows = document.querySelectorAll('.variant-row');
    const variants = [];
    let totalStock = 0;

    variantRows.forEach(row => {
        const vPrice = parseInt(row.querySelector('.v-price').value);
        const vStock = parseInt(row.querySelector('.v-stock').value) || 0;
        const vSizes = row.querySelector('.v-sizes').value.split(',').map(s => s.trim()).filter(s => s !== '');

        totalStock += vStock;

        let vOldPrice = vPrice;
        if (salePercent > 0) {
            vOldPrice = Math.round(vPrice / (1 - salePercent / 100));
        }

        variants.push({
            color: row.querySelector('.v-color').value,
            hex: row.querySelector('.v-hex').value,
            img: row.querySelector('.v-img').value,
            price: vPrice,
            oldPrice: vOldPrice,
            stock: vStock,
            sizes: vSizes
        });
    });

    if (variants.length === 0) return alert("Vui lòng thêm ít nhất 1 biến thể!");

    const productData = {
        name, salePercent, variants,
        stock: totalStock, // Lưu tổng kho để hiển thị nhanh bên ngoài
        img: variants[0].img,
        price: variants[0].price,
        oldPrice: variants[0].oldPrice,
        rating: 5.0, reviews: 0, sold: 0
    };

    if (id) {
        const idx = products.findIndex(p => p.id == id);
        if (idx !== -1) products[idx] = { ...products[idx], ...productData, id: parseInt(id) };
    } else {
        productData.id = Date.now();
        products.unshift(productData);
    }

    saveProductsToLocal();
    closeModal();
    renderAdminProducts();
    showToast({ title: 'Thành công', message: 'Sản phẩm đã được cập nhật kho và giá.', type: 'success' });
}

function editProduct(id) {
    const p = products.find(prod => prod.id === id);
    if (!p) return;

    document.getElementById('editId').value = p.id;
    document.getElementById('pName').value = p.name;
    document.getElementById('pSale').value = p.salePercent || 0;

    const vContainer = document.getElementById('variantContainer');
    vContainer.innerHTML = '';

    if (p.variants && p.variants.length > 0) {
        p.variants.forEach(v => {
            const sizeStr = Array.isArray(v.sizes) ? v.sizes.join(', ') : '';
            addVariantRow(v.color, v.hex, v.img, v.price, v.stock, sizeStr);
        });
    }

    document.getElementById('modalTitle').innerText = 'Chỉnh sửa sản phẩm';
    document.getElementById('productModal').classList.add('open');
}

function deleteProduct(id) {
    if (confirm('Bạn muốn xóa sản phẩm này khỏi hệ thống?')) {
        products = products.filter(p => p.id !== id);
        saveProductsToLocal();
        renderAdminProducts();
        logActivity('Xóa sản phẩm', `Đã xóa sản phẩm ID: ${id}`); // Thêm dòng này
        showToast({ title: 'Đã xóa', message: 'Sản phẩm đã biến mất khỏi kho.', type: 'info' });
    }
}

// --- FIX LỖI LỆCH BẢNG ĐƠN HÀNG ---
// --- QUẢN LÝ ĐƠN HÀNG (PHÂN LOẠI ONLINE/TẠI QUẦY & HIGHLIGHT) ---
function renderAdminOrders() {
    const container = document.querySelector('.admin-content');
    if (!container) return;

    let allOrders = JSON.parse(localStorage.getItem('moonlight_orders')) || [];

    // Lọc dữ liệu theo tab đang chọn
    const filteredOrders = allOrders.filter(order => {
        const address = (order.customer.address || '').toLowerCase();
        const isStore = address.includes('tại cửa hàng') || address === '';

        if (currentOrderFilter === 'store') return isStore;
        if (currentOrderFilter === 'online') return !isStore;
        return true; // 'all'
    });

    container.innerHTML = `
        <header class="admin-header">
            <h2>QUẢN LÝ ĐƠN HÀNG</h2>
        </header>

        <div class="data-table-container">
            <div style="padding: 20px 20px 0 20px;">
                <div class="order-filter-bar">
                    <button class="filter-btn ${currentOrderFilter === 'all' ? 'active' : ''}" onclick="setOrderFilter('all')">Tất cả (${allOrders.length})</button>
                    <button class="filter-btn ${currentOrderFilter === 'store' ? 'active' : ''}" onclick="setOrderFilter('store')">Tại cửa hàng</button>
                    <button class="filter-btn ${currentOrderFilter === 'online' ? 'active' : ''}" onclick="setOrderFilter('online')">Đặt Online</button>
                </div>
            </div>

            <table class="admin-table order-table">
                <thead>
                    <tr>
                        <th class="col-id">Mã đơn</th>
                        <th class="col-customer">Khách hàng</th>
                        <th class="col-product">Sản phẩm</th>
                        <th class="col-payment">Thanh toán</th>
                        <th class="col-total">Tổng tiền</th>
                        <th class="col-status">Trạng thái</th>
                        <th class="col-action">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredOrders.length === 0 ? '<tr><td colspan="7" style="text-align:center; padding:50px; color:#666;">Không có đơn hàng nào.</td></tr>' :
            filteredOrders.map((order) => {
                // Xác định loại đơn
                const address = order.customer.address || '';
                const isStoreOrder = address.toLowerCase().includes('tại cửa hàng') || address === '';
                let orderTypeDisplay = isStoreOrder
                    ? `<div class="order-type store"><i class="fas fa-store"></i> Tại quầy</div>`
                    : `<div class="order-type online"><i class="fas fa-shipping-fast"></i> Online</div>`;

                // Xác định trạng thái thanh toán Banking
                const isBanking = (order.paymentMethod || '').includes('Banking') || (order.paymentMethod || '').includes('Chuyển khoản');
                // Nếu là Banking mà chưa có cờ isPaid -> coi như chưa thanh toán
                const isPaid = order.isPaid || false;

                let paymentDisplay = '';
                let actionButtons = '';

                // LOGIC THANH TOÁN & NÚT BẤM
                if (order.status === 'completed' || order.status === 'cancelled') {
                    // Đơn đã xong/hủy -> Chỉ hiện nút Xóa
                    actionButtons = `<button class="adm-btn" onclick="deleteOrder('${order.id}')" title="Xóa lịch sử" style="color:#888"><i class="fas fa-trash"></i></button>`;
                    paymentDisplay = isBanking ? '<span class="adm-badge success">Đã thanh toán</span>' : '<span class="adm-badge dark">COD</span>';
                } else {
                    // Đơn đang xử lý (Pending)
                    if (isBanking) {
                        if (isPaid) {
                            // Banking + Đã nhận tiền -> Cho phép Duyệt
                            paymentDisplay = `<div>Banking <span class="payment-status-badge payment-paid">Đã nhận</span></div>`;
                            actionButtons = `
                                        <button class="adm-btn" onclick="approveOrder('${order.id}')" title="Hoàn tất đơn" style="color:#2ecc71"><i class="fas fa-check"></i></button>
                                        <button class="adm-btn" onclick="cancelOrder('${order.id}')" title="Hủy đơn" style="color:#e74c3c"><i class="fas fa-times"></i></button>
                                    `;
                        } else {
                            // Banking + Chưa nhận tiền -> Hiện nút xác nhận tiền, Ẩn nút duyệt
                            paymentDisplay = `<div>Banking <span class="payment-status-badge payment-unpaid">Chờ tiền</span></div>`;
                            actionButtons = `
                                        <button class="btn-confirm-payment" onclick="confirmPayment('${order.id}')">Xác nhận tiền về</button>
                                        <div style="margin-top:5px; text-align:center;">
                                            <button class="adm-btn" onclick="cancelOrder('${order.id}')" style="color:#e74c3c"><i class="fas fa-times"></i></button>
                                        </div>
                                    `;
                        }
                    } else {
                        // COD -> Cho phép Duyệt luôn
                        paymentDisplay = '<span class="adm-badge dark">COD</span>';
                        actionButtons = `
                                    <button class="adm-btn" onclick="approveOrder('${order.id}')" title="Hoàn tất đơn" style="color:#2ecc71"><i class="fas fa-check"></i></button>
                                    <button class="adm-btn" onclick="cancelOrder('${order.id}')" title="Hủy đơn" style="color:#e74c3c"><i class="fas fa-times"></i></button>
                                `;
                    }
                }

                // Badge trạng thái đơn
                let statusBadge = '';
                if (order.status === 'completed') statusBadge = '<span class="adm-badge success">Hoàn tất</span>';
                else if (order.status === 'cancelled') statusBadge = '<span class="adm-badge danger">Đã hủy</span>';
                else statusBadge = '<span class="adm-badge warning">Chờ xử lý</span>';

                return `
                        <tr>
                            <td class="col-id">
                                <strong>#${order.id.toString().slice(-4)}</strong>
                                ${orderTypeDisplay}
                            </td>
                            <td class="col-customer">
                                <div class="cus-name">${order.customer.name || 'Khách lẻ'}</div>
                                <div class="cus-phone">${order.customer.phone || ''}</div>
                                <div style="font-size:10px; color:#666; margin-top:3px;">${isStoreOrder ? '' : (order.customer.address || '')}</div>
                            </td>
                            <td class="col-product">
                                ${order.items.map(i => `
                                    <div class="order-item-row">• ${i.name} <span class="item-meta">(${i.size}/${i.color})</span> x<strong>${i.quantity}</strong></div>
                                `).join('')}
                            </td>
                            <td class="col-payment">${paymentDisplay}</td>
                            <td class="col-total">${order.total.toLocaleString()}₫</td>
                            <td class="col-status">${statusBadge}</td>
                            <td class="col-action">${actionButtons}</td>
                        </tr>
                        `;
            }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// --- 2. HÀM LỌC ĐƠN HÀNG ---
function setOrderFilter(filterType) {
    currentOrderFilter = filterType;
    renderAdminOrders(); // Vẽ lại bảng với dữ liệu đã lọc
}
function confirmPayment(orderId) {
    if (confirm('Bạn xác nhận đã nhận được tiền chuyển khoản cho đơn hàng này?')) {
        let allOrders = JSON.parse(localStorage.getItem('moonlight_orders')) || [];
        const index = allOrders.findIndex(o => o.id === orderId);

        if (index !== -1) {
            allOrders[index].isPaid = true; // Đánh dấu đã trả tiền
            localStorage.setItem('moonlight_orders', JSON.stringify(allOrders));

            showToast({ title: 'Đã xác nhận', message: 'Trạng thái thanh toán đã cập nhật. Bạn có thể duyệt đơn ngay.', type: 'success' });
            renderAdminOrders(); // Vẽ lại để hiện nút Duyệt
        }
    }
}

// --- 4. HÀM DUYỆT ĐƠN (GIỮ NGUYÊN LOGIC TRỪ KHO) ---
function approveOrder(orderId) {
    let allOrders = JSON.parse(localStorage.getItem('moonlight_orders')) || [];
    const orderIndex = allOrders.findIndex(o => o.id === orderId);

    if (orderIndex !== -1) {
        const order = allOrders[orderIndex];

        // Trừ kho
        order.items.forEach(item => {
            const pIdx = products.findIndex(p => p.id === item.id);
            if (pIdx !== -1) {
                // Trừ kho tổng
                products[pIdx].stock = Math.max(0, (products[pIdx].stock || 0) - item.quantity);
                products[pIdx].sold = (products[pIdx].sold || 0) + item.quantity;

                // Trừ kho biến thể (Nâng cao)
                const vIdx = products[pIdx].variants.findIndex(v => v.color === item.color);
                if (vIdx !== -1) {
                    products[pIdx].variants[vIdx].stock = Math.max(0, (products[pIdx].variants[vIdx].stock || 0) - item.quantity);
                }
            }
        });

        allOrders[orderIndex].status = 'completed';

        // Nếu là COD thì duyệt xong coi như đã trả tiền luôn
        if (!allOrders[orderIndex].isPaid) allOrders[orderIndex].isPaid = true;

        saveProductsToLocal();
        localStorage.setItem('moonlight_orders', JSON.stringify(allOrders));

        renderAdminOrders();
        logActivity('Duyệt đơn', `Hoàn tất đơn hàng #${orderId}`);
        showToast({ title: 'Thành công', message: 'Đơn hàng đã hoàn tất & trừ kho.', type: 'success' });
    }
}

function cancelOrder(orderId) {
    if (confirm('Hủy đơn hàng này?')) {
        let allOrders = JSON.parse(localStorage.getItem('moonlight_orders')) || [];
        const index = allOrders.findIndex(o => o.id === orderId);
        if (index !== -1) {
            allOrders[index].status = 'cancelled';
            localStorage.setItem('moonlight_orders', JSON.stringify(allOrders));
            renderAdminOrders();
            showToast({ title: 'Đã hủy', message: 'Đơn hàng đã bị hủy.', type: 'info' });
        }
    }
}

function deleteOrder(orderId) {
    if (confirm('Xóa vĩnh viễn khỏi lịch sử?')) {
        let allOrders = JSON.parse(localStorage.getItem('moonlight_orders')) || [];
        allOrders = allOrders.filter(o => o.id !== orderId);
        localStorage.setItem('moonlight_orders', JSON.stringify(allOrders));
        renderAdminOrders();
    }
}
function renderAdminStaff() {
    const container = document.querySelector('.admin-content');
    if (!container) return;

    const loggedUser = JSON.parse(localStorage.getItem('moonlight_user'));

    container.innerHTML = `
        <header class="admin-header">
            <h2>QUẢN LÝ NHÂN SỰ</h2>
            <button class="btn-primary" onclick="showAddStaffForm()"><i class="fas fa-user-plus"></i> THÊM NHÂN VIÊN</button>
        </header>

        <div class="data-table-container">
            <table class="admin-table staff-table">
                <thead>
                    <tr>
                        <th>Nhân sự</th>
                        <th>Tên đăng nhập</th>
                        <th>Quyền hạn</th>
                        <th style="text-align:center">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${accounts.map(acc => {
        // Xác định class cho từng vai trò
        const roleClass = acc.role.toLowerCase();
        return `
                        <tr>
                            <td>
                                <div class="staff-info-cell">
                                    <div class="staff-avatar">${acc.name.charAt(0)}</div>
                                    <div class="staff-name-box">
                                        <strong style="color:#fff">${acc.name}</strong>
                                        <small style="color:#666">ID: #${acc.id.toString().slice(-4)}</small>
                                    </div>
                                </div>
                            </td>
                            <td><code style="color:var(--gold)">${acc.username}</code></td>
                            <td><span class="role-badge ${roleClass}">${acc.role}</span></td>
                            <td style="text-align:center">
                                ${acc.username !== loggedUser.username && acc.role !== 'Admin' ? `
                                    <button class="adm-btn" onclick="deleteStaff(${acc.id})" style="color:#e74c3c" title="Xóa tài khoản">
                                        <i class="fas fa-user-minus"></i>
                                    </button>
                                ` : '<small style="color:#444"><i class="fas fa-lock"></i> Hệ thống</small>'}
                            </td>
                        </tr>
                    `}).join('')}
                </tbody>
            </table>
        </div>

        <div id="staffModal">
            <div class="modal-content" style="max-width: 500px;">
                <h3>Thêm nhân sự mới</h3>
                <form id="staffForm" onsubmit="handleSaveStaff(event)">
                    <div class="form-group">
                        <label>Họ và tên</label>
                        <input type="text" id="sName" required placeholder="Ví dụ: Nguyễn Văn A">
                    </div>
                    <div class="form-group">
                        <label>Tên đăng nhập</label>
                        <input type="text" id="sUser" required placeholder="Viết liền không dấu">
                    </div>
                    <div class="form-group">
                        <label>Mật khẩu</label>
                        <input type="password" id="sPass" required placeholder="******">
                    </div>
                    <div class="form-group">
                        <label>Vai trò</label>
                        <select id="sRole">
                            <option value="Staff">Nhân viên (Staff)</option>
                            <option value="Owner">Chủ doanh nghiệp (Owner)</option>
                        </select>
                    </div>
                    <div class="modal-btns">
                        <button type="submit" class="btn-confirm">TẠO TÀI KHOẢN</button>
                        <button type="button" class="btn-cancel" onclick="closeStaffModal()">HỦY BỎ</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}
function showAddStaffForm() {
    document.getElementById('staffModal').classList.add('open');
}

function closeStaffModal() {
    document.getElementById('staffModal').classList.remove('open');
}

// Cập nhật luôn cho Modal Sản Phẩm (Nếu chưa có)
function showAddProductForm() {
    document.getElementById('productForm').reset();
    document.getElementById('editId').value = '';
    document.getElementById('modalTitle').innerText = 'Thêm sản phẩm mới';
    document.getElementById('productModal').classList.add('open');
}

function closeModal() {
    document.getElementById('productModal').classList.remove('open');
}

function handleSaveStaff(e) {
    e.preventDefault();
    const name = document.getElementById('sName').value;
    const username = document.getElementById('sUser').value;
    const password = document.getElementById('sPass').value;
    const role = document.getElementById('sRole').value;

    // Kiểm tra trùng lặp tài khoản
    if (accounts.some(acc => acc.username === username)) {
        showToast({ title: 'Lỗi', message: 'Tên tài khoản đã tồn tại!', type: 'error' });
        return;
    }

    const newStaff = { id: Date.now(), username, password, name, role };
    accounts.push(newStaff);

    saveAccountsToLocal();
    closeStaffModal();
    renderAdminStaff();
    showToast({ title: 'Thành công', message: 'Đã tạo tài khoản nhân sự mới.', type: 'success' });
}

function deleteStaff(id) {
    if (confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
        accounts = accounts.filter(acc => acc.id !== id);
        saveAccountsToLocal();
        renderAdminStaff();
        showToast({ title: 'Đã xóa', message: 'Tài khoản nhân sự đã bị hủy.', type: 'info' });
    }
}

// Hàm ghi lại hoạt động
function logActivity(action, details) {
    const user = JSON.parse(localStorage.getItem('moonlight_user')) || { name: 'Unknown', username: 'guest' };
    const newLog = {
        time: new Date().toLocaleString('vi-VN'),
        user: user.name + ` (${user.username})`,
        action: action,
        details: details
    };

    let logs = JSON.parse(localStorage.getItem('moonlight_logs')) || [];
    logs.unshift(newLog); // Thêm vào đầu mảng
    if (logs.length > 50) logs.pop(); // Chỉ giữ 50 log gần nhất
    localStorage.setItem('moonlight_logs', JSON.stringify(logs));
}

// Hàm render bảng Log ra Dashboard
function renderAuditLogs() {
    const tbody = document.getElementById('auditLogTable');
    if (!tbody) return;

    let logs = JSON.parse(localStorage.getItem('moonlight_logs')) || [];
    if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:30px; color:#666;">Chưa có hoạt động nào ghi nhận.</td></tr>';
        return;
    }

    tbody.innerHTML = logs.map(log => {
        // Tự động gán class màu sắc dựa trên từ khóa hành động
        let actionClass = '';
        if (log.action.includes('Xóa')) actionClass = 'delete';
        else if (log.action.includes('Thêm')) actionClass = 'add';
        else if (log.action.includes('Sửa') || log.action.includes('Cập nhật')) actionClass = 'edit';

        return `
        <tr>
            <td><span class="log-time">${log.time}</span></td>
            <td><span class="log-user"><i class="fas fa-user-shield"></i> ${log.user}</span></td>
            <td><span class="log-action-badge ${actionClass}">${log.action}</span></td>
            <td><span class="log-details">${log.details}</span></td>
        </tr>
        `;
    }).join('');
}

function renderCharts() {
    // 1. Biểu đồ Doanh thu (Giả lập dữ liệu hoặc lấy thật nếu có cấu trúc ngày tháng)
    const ctxRev = document.getElementById('revenueChart');
    if (ctxRev) {
        if (revenueChartInstance) revenueChartInstance.destroy(); // Xóa biểu đồ cũ nếu có
        revenueChartInstance = new Chart(ctxRev, {
            type: 'line',
            data: {
                labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'],
                datasets: [{
                    label: 'Doanh thu (VNĐ)',
                    data: [1500000, 3200000, 1800000, 4500000, 2100000, 5600000, 3900000], // Dữ liệu mẫu
                    borderColor: '#d4af37',
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { labels: { color: '#fff' } } },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#aaa' } },
                    x: { grid: { display: false }, ticks: { color: '#aaa' } }
                }
            }
        });
    }

    // 2. Biểu đồ Trạng thái Đơn hàng
    const ctxStatus = document.getElementById('orderStatusChart');
    if (ctxStatus) {
        const orders = JSON.parse(localStorage.getItem('moonlight_orders')) || [];
        const pending = orders.filter(o => o.status === 'pending').length;
        const completed = orders.filter(o => o.status === 'completed').length;
        const cancelled = orders.filter(o => o.status === 'cancelled').length;

        if (statusChartInstance) statusChartInstance.destroy();
        statusChartInstance = new Chart(ctxStatus, {
            type: 'doughnut',
            data: {
                labels: ['Chờ duyệt', 'Hoàn thành', 'Đã hủy'],
                datasets: [{
                    data: [pending, completed, cancelled],
                    backgroundColor: ['#f1c40f', '#47d864', '#ff4444'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom', labels: { color: '#fff' } } }
            }
        });
    }
}

/* ==========================================================================
   HÀM TẠO DỮ LIỆU MẪU (CHẠY 1 LẦN ĐỂ TEST ADMIN)
   ========================================================================== */
function initSampleData() {
    // Chỉ tạo dữ liệu nếu localStorage chưa có đơn hàng nào
    if (localStorage.getItem('moonlight_orders')) return;

    console.log("Đang khởi tạo dữ liệu mẫu...");

    // 1. DỮ LIỆU SẢN PHẨM (Cập nhật Stock & Sold cho hợp lý)
    const sampleProducts = [
        { id: 1, name: "Áo Vest Italian Cut", price: 1500000, oldPrice: 2000000, rating: 4.8, reviews: 12, sold: 154, stock: 12, img: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=500", sizes: ["S", "M", "L", "XL"], variants: [{ color: "Đen", hex: "#000", price: 1500000, img: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800" }], desc: "Thiết kế Ý lịch lãm." },
        { id: 2, name: "Sơ Mi Lụa Premium", price: 550000, oldPrice: 750000, rating: 4.9, reviews: 8, sold: 342, stock: 8, img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500", sizes: ["M", "L", "XL"], variants: [{ color: "Trắng", hex: "#fff", price: 550000, img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800" }], desc: "Sơ mi lụa mềm mại." },
        { id: 3, name: "Quần Âu Slimfit", price: 650000, oldPrice: 800000, rating: 4.5, reviews: 5, sold: 89, stock: 45, img: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500", sizes: ["29", "30", "31", "32"], variants: [{ color: "Đen", hex: "#000", price: 650000, img: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800" }], desc: "Quần âu form chuẩn." },
        { id: 4, name: "Đồng Hồ Cổ Điển", price: 2500000, oldPrice: 3000000, rating: 5.0, reviews: 20, sold: 12, stock: 5, img: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500", sizes: ["Free"], variants: [{ color: "Đen", hex: "#000", price: 2500000, img: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800" }], desc: "Đồng hồ cơ tự động." }
    ];
    localStorage.setItem('moonlight_products', JSON.stringify(sampleProducts));

    // 2. DỮ LIỆU ĐƠN HÀNG (Đủ trạng thái để vẽ biểu đồ)
    const sampleOrders = [
        {
            id: "DH17092301", customer: { name: "Nguyễn Văn An", phone: "0901234567" },
            items: [{ name: "Áo Vest Italian Cut", quantity: 1, price: 1500000, color: "Đen", size: "L" }],
            total: 1500000, status: "completed", date: "20/02/2026", paymentMethod: "COD"
        },
        {
            id: "DH17092302", customer: { name: "Trần Thị Bích", phone: "0912345678" },
            items: [{ name: "Sơ Mi Lụa Premium", quantity: 2, price: 550000, color: "Trắng", size: "M" }],
            total: 1100000, status: "pending", date: "28/02/2026", paymentMethod: "Banking"
        },
        {
            id: "DH17092303", customer: { name: "Lê Hoàng Nam", phone: "0987654321" },
            items: [{ name: "Đồng Hồ Cổ Điển", quantity: 1, price: 2500000, color: "Đen", size: "Free" }],
            total: 2500000, status: "completed", date: "25/02/2026", paymentMethod: "Banking"
        },
        {
            id: "DH17092304", customer: { name: "Phạm Minh Tú", phone: "0933445566" },
            items: [{ name: "Quần Âu Slimfit", quantity: 1, price: 650000, color: "Đen", size: "30" }],
            total: 650000, status: "cancelled", date: "26/02/2026", paymentMethod: "COD"
        },
        {
            id: "DH17092305", customer: { name: "Hoàng Gia Bảo", phone: "0944556677" },
            items: [{ name: "Áo Vest Italian Cut", quantity: 1, price: 1500000, color: "Đen", size: "XL" }],
            total: 1500000, status: "pending", date: "01/03/2026", paymentMethod: "Banking"
        }
    ];
    localStorage.setItem('moonlight_orders', JSON.stringify(sampleOrders));

    // 3. DỮ LIỆU NHẬT KÝ HOẠT ĐỘNG (AUDIT LOG)
    const sampleLogs = [
        { time: "01/03/2026 09:30", user: "Vũ Phạm Luân (Admin)", action: "Đăng nhập", details: "Truy cập hệ thống quản trị" },
        { time: "01/03/2026 09:35", user: "Vũ Phạm Luân (Admin)", action: "Sửa sản phẩm", details: "Cập nhật giá Áo Vest Italian Cut" },
        { time: "28/02/2026 14:20", user: "Nhân viên kho (Staff)", action: "Duyệt đơn hàng", details: "Đã duyệt đơn hàng #DH17092301" },
        { time: "28/02/2026 10:15", user: "Chủ doanh nghiệp (Owner)", action: "Thêm nhân sự", details: "Tạo tài khoản cho NV mới" },
        { time: "28/02/2026 08:00", user: "Hệ thống", action: "Sao lưu", details: "Sao lưu dữ liệu tự động" }
    ];
    localStorage.setItem('moonlight_logs', JSON.stringify(sampleLogs));

    // 4. DỮ LIỆU ĐÁNH GIÁ (REVIEWS)
    const sampleReviews = [
        { id: 1, productId: 1, productName: "Áo Vest Italian Cut", name: "Nguyễn Văn A", rating: 5, content: "Áo đẹp, vải xịn, giao hàng nhanh.", date: "20/02/2026", status: "approved" },
        { id: 2, productId: 2, productName: "Sơ Mi Lụa Premium", name: "Trần B", rating: 4, content: "Mặc mát nhưng size hơi rộng một chút.", date: "22/02/2026", status: "approved" },
        { id: 3, productId: 4, productName: "Đồng Hồ Cổ Điển", name: "Lê C", rating: 5, content: "Đẳng cấp, rất đáng tiền.", date: "25/02/2026", status: "approved" }
    ];
    localStorage.setItem('moonlight_all_reviews', JSON.stringify(sampleReviews));

    console.log("Đã nạp dữ liệu mẫu thành công!");
    location.reload(); // Tải lại trang để hiện dữ liệu
}

// Gọi hàm này 1 lần duy nhất khi file JS chạy
// Sau khi chạy xong lần đầu, bạn có thể comment dòng này lại
initSampleData();

// 1. Khởi tạo POS và Đồng bộ dữ liệu
function initPosSystem() {
    const user = JSON.parse(localStorage.getItem('moonlight_user'));
    if (user && document.getElementById('staffName')) {
        document.getElementById('staffName').innerText = user.name;
    }
    
    // Reset và load lại sản phẩm mới nhất từ LocalStorage
    renderPosProducts();
    renderPosCart();
}

// 2. Render danh sách sản phẩm
function renderPosProducts(keyword = '') {
    const grid = document.getElementById('posProductGrid');
    if (!grid) return;

    let allProducts = JSON.parse(localStorage.getItem('moonlight_products')) || [];
    
    if (keyword) {
        allProducts = allProducts.filter(p => p.name.toLowerCase().includes(keyword.toLowerCase()));
    }

    grid.innerHTML = allProducts.map(p => {
        // Lấy thông tin hiển thị đại diện (biến thể đầu tiên)
        const firstVar = p.variants[0] || { img: '', price: 0, stock: 0 };
        const totalStock = p.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
        
        return `
        <div class="pos-product-card" onclick="openPosVariantModal(${p.id})">
            <span class="pos-stock-badge" style="background:${totalStock > 0 ? 'rgba(0,0,0,0.6)' : '#ff4444'}">Kho: ${totalStock}</span>
            <img src="${firstVar.img}" class="pos-card-img" onerror="this.src='https://via.placeholder.com/150'">
            <div class="pos-card-info">
                <div class="pos-card-name">${p.name}</div>
                <div class="pos-card-price">${Number(firstVar.price).toLocaleString()}₫</div>
            </div>
        </div>
        `;
    }).join('');
}

function searchPosProduct() {
    const keyword = document.getElementById('posSearchInput').value;
    renderPosProducts(keyword);
}

// 3. Mở Modal & Render Option (Màu/Size) - LOGIC MỚI
function openPosVariantModal(id) {
    const allProducts = JSON.parse(localStorage.getItem('moonlight_products')) || [];
    const product = allProducts.find(p => p.id === id);
    if (!product) return;

    // Lưu vào biến tạm
    currentPosSelection.product = product;
    currentPosSelection.variantIndex = 0; // Mặc định chọn màu đầu tiên
    currentPosSelection.size = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Free';

    // Render HTML
    const container = document.getElementById('posVariantContainer');
    
    // A. Render danh sách Màu (Variants)
    let html = `<div class="pos-v-section-title">Chọn Phiên Bản & Màu Sắc</div>
                <div class="pos-v-options" id="posColorOptions">`;
    
    product.variants.forEach((v, idx) => {
        html += `
            <div class="pos-v-btn ${idx === 0 ? 'selected' : ''}" onclick="setPosVariant(${idx})">
                <span style="display:inline-block;width:10px;height:10px;background:${v.hex};border-radius:50%;border:1px solid #fff;"></span>
                ${v.color} 
                <span class="pos-v-stock">| Giá: ${Number(v.price).toLocaleString()}₫ | Kho: ${v.stock}</span>
            </div>
        `;
    });
    html += `</div>`;

    // B. Render danh sách Size
    html += `<div class="pos-v-section-title">Chọn Kích Thước</div>
             <div class="pos-v-options" id="posSizeOptions">`;
    
    if (product.sizes && product.sizes.length > 0) {
        product.sizes.forEach((s, idx) => {
            html += `<div class="pos-v-btn ${idx === 0 ? 'selected' : ''}" onclick="setPosSize('${s}')">${s}</div>`;
        });
    } else {
        html += `<div class="pos-v-btn selected" onclick="setPosSize('Free')">Free Size</div>`;
    }
    html += `</div>`;

    container.innerHTML = html;
    document.getElementById('posVariantModal').classList.add('open');
}

// 4. Hàm chọn Màu (Update UI + Logic)
function setPosVariant(index) {
    currentPosSelection.variantIndex = index;
    
    // Update UI (Xóa class selected cũ, thêm vào cái mới)
    const btns = document.querySelectorAll('#posColorOptions .pos-v-btn');
    btns.forEach(b => b.classList.remove('selected'));
    btns[index].classList.add('selected');
}

// 5. Hàm chọn Size (Update UI + Logic)
function setPosSize(sizeStr) {
    currentPosSelection.size = sizeStr;

    // Update UI (Tìm button có text khớp với size chọn)
    const btns = document.querySelectorAll('#posSizeOptions .pos-v-btn');
    btns.forEach(b => {
        if (b.innerText === sizeStr || (sizeStr === 'Free' && b.innerText === 'Free Size')) {
            b.classList.add('selected');
        } else {
            b.classList.remove('selected');
        }
    });
}

function closePosModal() {
    document.getElementById('posVariantModal').classList.remove('open');
}

// 6. Xác nhận thêm vào giỏ (Dựa trên biến currentPosSelection)
function confirmPosAddToCart() {
    const { product, variantIndex, size } = currentPosSelection;
    if (!product) return;

    const selectedVar = product.variants[variantIndex];

    // Check kho
    if ((selectedVar.stock || 0) <= 0) {
        alert("Màu này đã hết hàng trong kho!");
        return;
    }

    const cartItem = {
        id: product.id,
        name: product.name,
        price: Number(selectedVar.price),
        img: selectedVar.img,
        color: selectedVar.color,
        size: size,
        quantity: 1,
        maxStock: selectedVar.stock // Lưu max để chặn nhập quá
    };

    // Check trùng trong giỏ
    const exist = posCart.find(i => i.id === cartItem.id && i.color === cartItem.color && i.size === cartItem.size);
    if (exist) {
        if (exist.quantity < exist.maxStock) {
            exist.quantity++;
        } else {
            alert(`Kho chỉ còn ${exist.maxStock} sản phẩm này!`);
        }
    } else {
        posCart.push(cartItem);
    }

    renderPosCart();
    closePosModal();
}

// 7. Render Giỏ hàng POS
function renderPosCart() {
    const container = document.getElementById('posCartItems');
    if (!container) return;

    let total = 0;
    let count = 0;

    container.innerHTML = posCart.map((item, index) => {
        total += item.price * item.quantity;
        count += item.quantity;
        return `
        <div class="pos-item">
            <img src="${item.img}">
            <div class="pos-item-info">
                <span class="pos-item-name">${item.name}</span>
                <span class="pos-item-meta">${item.color} | Size: ${item.size}</span>
                <div class="pos-item-price">${item.price.toLocaleString()}₫</div>
            </div>
            <div class="pos-qty-ctrl">
                <button class="pos-qty-btn" onclick="updatePosQty(${index}, -1)">-</button>
                <input type="text" class="pos-qty-val" value="${item.quantity}" readonly>
                <button class="pos-qty-btn" onclick="updatePosQty(${index}, 1)">+</button>
            </div>
            <button class="pos-qty-btn" style="background:transparent; color:#ff4444; margin-left:5px;" onclick="removePosItem(${index})"><i class="fas fa-trash"></i></button>
        </div>`;
    }).join('');

    document.getElementById('posTotalPrice').innerText = total.toLocaleString() + '₫';
    document.getElementById('posTotalQty').innerText = count;
}

function updatePosQty(index, change) {
    const item = posCart[index];
    const newQty = item.quantity + change;
    
    if (newQty > item.maxStock) {
        alert("Đã đạt giới hạn tồn kho!");
        return;
    }
    if (newQty <= 0) {
        if (confirm("Xóa sản phẩm này khỏi đơn?")) posCart.splice(index, 1);
    } else {
        item.quantity = newQty;
    }
    renderPosCart();
}

function removePosItem(index) {
    posCart.splice(index, 1);
    renderPosCart();
}

// 8. Thanh toán POS (Trừ kho ngay lập tức)
function processPosCheckout() {
    if (posCart.length === 0) {
        alert("Giỏ hàng đang trống!");
        return;
    }

    const cusName = document.getElementById('posCusName').value || "Khách lẻ";
    const cusPhone = document.getElementById('posCusPhone').value || "";
    // Lấy radio button được check
    const paymentEl = document.querySelector('input[name="posPayment"]:checked');
    const paymentMethod = paymentEl ? paymentEl.value : 'Tiền mặt';
    
    const total = posCart.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    if (confirm(`Xác nhận thanh toán ${total.toLocaleString()}₫ ?`)) {
        
        // A. Tạo đơn hàng mới
        const newOrder = {
            id: "POS" + Date.now().toString().slice(-6),
            customer: { name: cusName, phone: cusPhone, address: "Tại cửa hàng" },
            items: [...posCart],
            total: total,
            status: 'completed', // Đơn POS coi như xong luôn
            paymentMethod: paymentMethod,
            isPaid: true,
            date: new Date().toLocaleString('vi-VN')
        };

        // B. Lưu đơn hàng
        let allOrders = JSON.parse(localStorage.getItem('moonlight_orders')) || [];
        allOrders.unshift(newOrder);
        localStorage.setItem('moonlight_orders', JSON.stringify(allOrders));

        // C. Trừ kho (Đồng bộ dữ liệu)
        let products = JSON.parse(localStorage.getItem('moonlight_products')) || [];
        
        posCart.forEach(cartItem => {
            const pIndex = products.findIndex(p => p.id === cartItem.id);
            if (pIndex !== -1) {
                // Trừ kho biến thể
                const vIndex = products[pIndex].variants.findIndex(v => v.color === cartItem.color);
                if (vIndex !== -1) {
                    products[pIndex].variants[vIndex].stock = Math.max(0, products[pIndex].variants[vIndex].stock - cartItem.quantity);
                }
                // Trừ kho tổng & Tăng lượt bán
                products[pIndex].stock = Math.max(0, products[pIndex].stock - cartItem.quantity);
                products[pIndex].sold += cartItem.quantity;
            }
        });
        localStorage.setItem('moonlight_products', JSON.stringify(products));

        // D. Ghi log
        const user = JSON.parse(localStorage.getItem('moonlight_user')) || { name: 'Staff' };
        let logs = JSON.parse(localStorage.getItem('moonlight_logs')) || [];
        logs.unshift({
            time: new Date().toLocaleString('vi-VN'),
            user: user.name,
            action: 'Bán hàng POS',
            details: `Đơn ${newOrder.id} - ${total.toLocaleString()}₫`
        });
        localStorage.setItem('moonlight_logs', JSON.stringify(logs));

        // E. Reset & Thông báo
        alert("Thanh toán thành công!");
        posCart = [];
        renderPosCart();
        renderPosProducts(); // Refresh lại lưới sản phẩm để cập nhật số kho mới
        
        // Reset form
        document.getElementById('posCusName').value = "";
        document.getElementById('posCusPhone').value = "";
    }
}