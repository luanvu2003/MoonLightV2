// --- 1. DỮ LIỆU SẢN PHẨM MẪU (DATABASE) ---
const products = [
    { id: 1, name: "Áo Vest Italian Cut", price: 1500000, oldPrice: 2000000, rating: 4.8, reviews: 120, sold: 500, img: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=500", sizes: ["S", "M", "L", "XL"], variants: [{ color: "Đen", hex: "#000", price: 1500000, img: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800" }, { color: "Xám", hex: "#7f8c8d", price: 1600000, img: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800" }], desc: "Thiết kế Ý lịch lãm, chất liệu vải Wool cao cấp chống nhăn." },
    { id: 2, name: "Sơ Mi Lụa Premium", price: 550000, oldPrice: 750000, rating: 4.9, reviews: 85, sold: 1200, img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500", sizes: ["M", "L", "XL"], variants: [{ color: "Trắng", hex: "#fff", price: 550000, img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800" }, { color: "Vàng", hex: "#f39c12", price: 580000, img: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800" }], desc: "Sơ mi lụa mềm mại, thoáng mát, form Slimfit tôn dáng." },
    { id: 3, name: "Quần Âu Slimfit", price: 650000, oldPrice: 800000, rating: 4.5, reviews: 40, sold: 300, img: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500", sizes: ["29", "30", "31", "32"], variants: [{color:"Đen", hex:"#000", price: 650000, img: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800" }], desc: "Quần âu form chuẩn, co giãn nhẹ." },
    { id: 4, name: "Áo Thun Basic", price: 320000, oldPrice: 400000, rating: 5.0, reviews: 200, sold: 5000, img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500", sizes: ["S", "M", "L"], variants: [{color:"Đen", hex:"#000", price: 320000, img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800" }], desc: "Áo thun cotton 100%, thấm hút mồ hôi." },
    { id: 13, name: "Áo Polo Signature", price: 450000, oldPrice: 600000, rating: 4.7, reviews: 50, sold: 600, img: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=500", sizes: ["M", "L"], variants: [{color:"Đen", hex:"#000", price: 450000, img: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800" }], desc: "Áo Polo cổ điển, lịch sự." },
    { id: 14, name: "Quần Short Kaki", price: 350000, oldPrice: 500000, rating: 4.6, reviews: 30, sold: 150, img: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500", sizes: ["29", "30", "31"], variants: [{color:"Be", hex:"#f5f5dc", price: 350000, img: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800" }], desc: "Quần short thoải mái cho mùa hè." },
    { id: 15, name: "Áo Khoác Jean", price: 850000, oldPrice: 1200000, rating: 4.8, reviews: 10, sold: 80, img: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=500", sizes: ["L", "XL"], variants: [{color:"Xanh", hex:"#3498db", price: 850000, img: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800" }], desc: "Áo khoác Jean bụi bặm, cá tính." },
    { id: 16, name: "Áo Hoodie Street", price: 550000, oldPrice: 800000, rating: 4.9, reviews: 90, sold: 400, img: "https://images.unsplash.com/photo-1556906781-9a412961d28c?w=500", sizes: ["Free"], variants: [{color:"Đen", hex:"#000", price: 550000, img: "https://images.unsplash.com/photo-1556906781-9a412961d28c?w=800" }], desc: "Hoodie phong cách đường phố." },
    { id: 17, name: "Kính Mát Phi Công", price: 250000, oldPrice: 400000, rating: 4.7, reviews: 20, sold: 200, img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500", sizes: ["Free"], variants: [{color:"Đen", hex:"#000", price: 250000, img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800" }], desc: "Kính mát thời trang." },
    { id: 18, name: "Thắt Lưng Da", price: 300000, oldPrice: 450000, rating: 4.5, reviews: 15, sold: 100, img: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=500", sizes: ["Free"], variants: [{color:"Nâu", hex:"#8b4513", price: 300000, img: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800" }], desc: "Thắt lưng da bò thật." },
    { id: 19, name: "Ví Da Nam", price: 400000, oldPrice: 600000, rating: 4.8, reviews: 45, sold: 320, img: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500", sizes: ["Free"], variants: [{color:"Đen", hex:"#000", price: 400000, img: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800" }], desc: "Ví da nam nhỏ gọn." },
    { id: 20, name: "Cà Vạt Lụa", price: 150000, oldPrice: 250000, rating: 4.6, reviews: 12, sold: 50, img: "https://images.unsplash.com/photo-1589756823695-278bc923f962?w=500", sizes: ["Free"], variants: [{color:"Đỏ", hex:"#e74c3c", price: 150000, img: "https://images.unsplash.com/photo-1589756823695-278bc923f962?w=800" }], desc: "Cà vạt lụa cao cấp." }
];

const bestSellers = [
    { id: 5, name: "Đồng Hồ Cổ Điển", price: 2500000, oldPrice: 3000000, rating: 5.0, reviews: 300, sold: 1500, img: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500", sizes: ["Free"], variants: [{color:"Đen", hex:"#000", price: 2500000, img: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800" }], desc: "Đồng hồ cơ tự động, mặt kính sapphire." },
    { id: 6, name: "Túi Da Công Sở", price: 1800000, oldPrice: 2200000, rating: 4.9, reviews: 150, sold: 800, img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500", sizes: ["Free"], variants: [{color:"Nâu", hex:"#8b4513", price: 1800000, img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800" }], desc: "Da bò thật 100%, đựng vừa laptop 14inch." },
    { id: 7, name: "Áo Khoác Dạ", price: 3200000, oldPrice: 4000000, rating: 4.8, reviews: 80, sold: 400, img: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=500", sizes: ["L", "XL"], variants: [{color:"Xám", hex:"#333", price: 3200000, img: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800" }], desc: "Áo khoác dạ dáng dài phong cách Hàn Quốc." },
    { id: 8, name: "Giày Sneaker White", price: 950000, oldPrice: 1200000, rating: 4.7, reviews: 210, sold: 3000, img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500", sizes: ["40", "41", "42"], variants: [{color:"Trắng", hex:"#fff", price: 950000, img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800" }], desc: "Sneaker da thật, đế cao su êm ái." },
    { id: 21, name: "Giày Chelsea Black", price: 1250000, oldPrice: 1600000, rating: 4.6, reviews: 60, sold: 350, img: "https://images.unsplash.com/photo-1638361623861-1d70d7eb595e?w=500", sizes: ["39", "40", "41"], variants: [{color:"Đen", hex:"#000", price: 1250000, img: "https://images.unsplash.com/photo-1638361623861-1d70d7eb595e?w=800" }], desc: "Giày Chelsea Boots da lộn." },
    { id: 22, name: "Balo Du Lịch", price: 650000, oldPrice: 900000, rating: 4.8, reviews: 90, sold: 600, img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500", sizes: ["Free"], variants: [{color:"Xám", hex:"#7f8c8d", price: 650000, img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800" }], desc: "Balo chống nước cao cấp." },
    { id: 23, name: "Mũ Fedora", price: 300000, oldPrice: 500000, rating: 4.5, reviews: 20, sold: 90, img: "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=500", sizes: ["Free"], variants: [{color:"Be", hex:"#f5f5dc", price: 300000, img: "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=800" }], desc: "Mũ Fedora phong cách cổ điển." },
    { id: 24, name: "Vòng Tay Da", price: 150000, oldPrice: 200000, rating: 4.4, reviews: 10, sold: 200, img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500", sizes: ["Free"], variants: [{color:"Đen", hex:"#000", price: 150000, img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800" }], desc: "Vòng tay da cá tính." }
];

const accounts = [
    { username: "admin", password: "123", name: "Vũ Phạm Luân", role: "Admin" },
    { username: "owner", password: "123", name: "Chủ Doanh Nghiệp", role: "Owner" },
    { username: "staff", password: "123", name: "Nhân viên Bán hàng", role: "Staff" }
];

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

// --- 3. SỰ KIỆN KHI WEB LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    
    // Nếu đang ở trang chủ (có lưới sản phẩm)
    if(document.getElementById('product-grid')) {
        renderShop(displayedProducts); 
        renderBestSellers(displayedBestSellers);
    }
    
    // Nếu đang ở trang chi tiết
    if(document.getElementById('productDetailContainer')) {
        loadProductDetail();
    }

    // Nếu đang ở trang thanh toán
    if(document.getElementById('checkoutItems')) {
        renderCheckoutPage();
    }
    
    // Khởi tạo các tính năng chung
    setupSearch();
    setupScrollEffects();
    updateCartUI(); // Cập nhật icon giỏ hàng ngay khi vào web
    
    // Bắt sự kiện toàn cục cho nút Checkout (Fix lỗi click)
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('checkout-btn')) {
            goToCheckout();
        }
    });
});

// --- 4. LOGIC TRANG CHI TIẾT (QUAN TRỌNG: FIX LỖI THÊM GIỎ HÀNG) ---
function loadProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = parseInt(urlParams.get('id'));
    const allProducts = [...products, ...bestSellers];
    
    currentProduct = allProducts.find(p => p.id === id);

    if(!currentProduct) {
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
    const percent = Math.round(((currentProduct.oldPrice - selectedColor.price) / currentProduct.oldPrice) * 100);
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
                <span class="pd-old-price">${currentProduct.oldPrice.toLocaleString()}₫</span>
                <span class="pd-discount-tag">Giảm ${percent}%</span>
            </div>
            <p class="pd-desc">${currentProduct.desc}</p>
            
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
                <span class="option-label">Kích thước: <span id="sizeName" style="font-weight:400">${selectedSize}</span></span>
                <div class="size-selector">
                    ${currentProduct.sizes.map((s, idx) => `
                        <div class="size-btn ${idx === 0 ? 'selected' : ''}" onclick="selectSize('${s}', this)">${s}</div>
                    `).join('')}
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
}

// Logic chọn biến thể
function selectVariant(index, btn) {
    selectedColor = currentProduct.variants[index];
    // Update giao diện ngay lập tức
    document.getElementById('mainDetailImg').src = selectedColor.img;
    document.getElementById('detailPrice').innerText = selectedColor.price.toLocaleString() + '₫';
    document.getElementById('colorName').innerText = selectedColor.color;
    
    // Đổi class active
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
    if(quantity < 1) quantity = 1;
    document.getElementById('detailQty').value = quantity;
}

// HÀM QUAN TRỌNG: THÊM VÀO GIỎ TỪ TRANG CHI TIẾT
function addDetailToCart() {
    if(!currentProduct || !selectedColor || !selectedSize) {
        showToast({title: 'Lỗi', message: 'Dữ liệu sản phẩm chưa tải xong.', type: 'error'});
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
    
    if(exist) {
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
    if(badge) {
        const totalQty = cart.reduce((sum, i) => sum + i.quantity, 0);
        badge.innerText = totalQty;
    }
}

function updateCartUI() {
    const list = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    
    if(!list) return;

    let total = 0;
    list.innerHTML = '';

    if(cart.length === 0) {
        list.innerHTML = '<p style="text-align:center; margin-top:50px; color:#999;">Giỏ hàng trống.</p>';
        if(totalEl) totalEl.innerText = '0₫';
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

    if(totalEl) totalEl.innerText = total.toLocaleString() + '₫';
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
    if(cart[index].quantity <= 0) {
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
    if(sidebar && overlay) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('open');
        // Nếu mở ra thì update lại cho chắc
        if(sidebar.classList.contains('open')) updateCartUI();
    }
}

// Quick Add từ Trang Chủ
function quickAdd(id) {
    const allProducts = [...products, ...bestSellers];
    const p = allProducts.find(x => x.id === id);
    if(p) {
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
    if(btn.classList.contains('active')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        if(!wishlist.includes(id)) wishlist.push(id);
    } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        wishlist = wishlist.filter(item => item !== id);
    }
    localStorage.setItem('moonlight_wishlist', JSON.stringify(wishlist));
}

// Helper Format số đã bán
function formatSold(num) {
    if(num >= 1000) return (num/1000).toFixed(1) + 'k';
    return num;
}

// Search
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if(searchInput) {
        searchInput.addEventListener('input', function(e) {
            const keyword = e.target.value.toLowerCase();
            const allProducts = [...products, ...bestSellers];
            const filtered = allProducts.filter(p => p.name.toLowerCase().includes(keyword));
            
            if(document.getElementById('product-grid')) {
                renderProductsHTML(filtered, 'product-grid');
                if(filtered.length > 0) document.getElementById('shop').scrollIntoView({behavior:'smooth'});
            } else {
                window.location.href = `index.html?search=${keyword}`;
            }
        });
    }
}
function toggleSearch() {
    const overlay = document.getElementById('searchOverlay');
    const input = document.getElementById('searchInput');
    if(overlay) {
        overlay.classList.toggle('open');
        if(overlay.classList.contains('open') && input) input.focus();
    }
}

// Render HTML Trang Chủ (Dùng chung cho Search, Load more)
function renderProductsHTML(data, elementId) {
    const grid = document.getElementById(elementId);
    if(!grid) return;
    if(data.length === 0) { grid.innerHTML = '<p style="text-align:center; grid-column:1/-1;">Không tìm thấy sản phẩm.</p>'; return; }

    grid.innerHTML = data.map(p => {
        const percent = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
        const v = p.variants && p.variants[0] ? p.variants[0] : {img: p.img}; 
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
    if(btn) btn.style.display = (limit >= products.length) ? 'none' : 'block';
}
function loadMoreProducts() { displayedProducts += 4; renderShop(displayedProducts); }

function renderBestSellers(limit) {
    const list = bestSellers.slice(0, limit);
    renderProductsHTML(list, 'best-seller-grid');
    const btn = document.getElementById('loadMoreBestSeller');
    if(btn) btn.style.display = (limit >= bestSellers.length) ? 'none' : 'block';
}
function loadMoreBestSellers() { displayedBestSellers += 4; renderBestSellers(displayedBestSellers); }

function renderRelatedProducts(allProducts) {
    const grid = document.getElementById('related-grid');
    if(!grid) return;
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
    if(!container) return;
    if(cart.length === 0) { container.innerHTML = '<p style="text-align:center; color:#999;">Giỏ hàng trống.</p>'; return; }
    let total = 0;
    container.innerHTML = cart.map(item => {
        total += item.price * item.quantity;
        return `<div class="order-item-mini"><img src="${item.img}"><div class="order-info"><h4>${item.name}</h4><p>${item.color} / ${item.size} x <strong>${item.quantity}</strong></p><p style="font-weight:700; color:var(--gold)">${(item.price * item.quantity).toLocaleString()}₫</p></div></div>`;
    }).join('');
    subtotalEl.innerText = total.toLocaleString() + '₫'; totalEl.innerText = total.toLocaleString() + '₫';
}

function handleCheckout(e) {
    e.preventDefault(); 
    if(cart.length === 0) { showToast({ title: 'Giỏ hàng trống!', message: 'Vui lòng chọn sản phẩm.', type: 'error' }); return; }
    const name = document.getElementById('cusName').value.trim();
    if(name.length < 2) { showToast({ title: 'Thiếu thông tin!', message: 'Vui lòng kiểm tra lại họ tên.', type: 'error' }); return; }
    
    showToast({ title: 'Đặt hàng thành công! 🎉', message: `Cảm ơn ${name}. Đơn hàng đang được xử lý.`, type: 'success', duration: 4000 });
    setTimeout(() => { cart = []; saveCart(); window.location.href = 'index.html'; }, 2000);
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
    const autoRemoveId = setTimeout(() => { if(toast.parentNode) toastBox.removeChild(toast); }, duration + 1000);
    toast.onclick = (e) => { if (e.target.closest('.toast__close')) { toastBox.removeChild(toast); clearTimeout(autoRemoveId); } };
}

// Review
let selectedRating = 0;
function rateStar(star) {
    selectedRating = star; document.getElementById('ratingValue').value = star;
    const stars = document.querySelectorAll('.star-rating-input i');
    stars.forEach((s, index) => { if(index < star) { s.classList.remove('far'); s.classList.add('fas'); } else { s.classList.remove('fas'); s.classList.add('far'); } });
}
function submitReview(e) {
    e.preventDefault();
    if(selectedRating === 0) { showToast({title:'Chưa chọn sao!', message:'Vui lòng chấm điểm sản phẩm.', type:'warning'}); return; }
    const name = document.getElementById('reviewerName').value;
    const content = document.getElementById('reviewContent').value;
    const date = new Date().toLocaleDateString('vi-VN');
    const newReview = `<div class="review-item" style="animation: fadeIn 0.5s"><div class="review-avatar" style="background:#27ae60">${name.charAt(0).toUpperCase()}</div><div class="review-content"><div class="review-top"><strong>${name}</strong><span class="review-date">${date}</span></div><div class="stars-display">${'<i class="fas fa-star"></i>'.repeat(selectedRating)}${'<i class="far fa-star"></i>'.repeat(5-selectedRating)}</div><p>${content}</p></div></div>`;
    const list = document.getElementById('reviewsList');
    if(list) list.innerHTML = newReview + list.innerHTML;
    document.getElementById('reviewForm').reset(); selectedRating = 0; rateStar(0);
    showToast({ title: 'Đánh giá thành công!', message: 'Cảm ơn bạn đã nhận xét.', type: 'success' });
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
    if(sidebar.classList.contains('open')) renderWishlistUI();
}

// Cập nhật lại hàm toggleWishlist hiện có của bạn
function toggleWishlist(btn, id) {
    btn.classList.toggle('active');
    const icon = btn.querySelector('i');
    if(btn.classList.contains('active')) {
        icon.classList.remove('far'); icon.classList.add('fas');
        if(!wishlist.includes(id)) wishlist.push(id);
        showToast({ title: 'Đã yêu thích!', message: 'Sản phẩm đã được lưu vào danh sách.', type: 'info' });
    } else {
        icon.classList.remove('fas'); icon.classList.add('far');
        wishlist = wishlist.filter(item => item !== id);
    }
    localStorage.setItem('moonlight_wishlist', JSON.stringify(wishlist));
    // Nếu đang mở sidebar yêu thích thì cập nhật luôn
    if(document.getElementById('wishlistSidebar').classList.contains('open')) renderWishlistUI();
}

// Hàm hiển thị sản phẩm yêu thích
function renderWishlistUI() {
    const list = document.getElementById('wishlistItems');
    if(!list) return;
    
    const allProducts = [...products, ...bestSellers];
    const likedProducts = allProducts.filter(p => wishlist.includes(p.id));
    
    list.innerHTML = '';
    if(likedProducts.length === 0) {
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
    if (loggedUser.role === 'Admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
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
    // Thống kê đơn giản từ dữ liệu có sẵn
    if (document.getElementById('prodCount')) {
        document.getElementById('prodCount').innerText = products.length;
        document.getElementById('orderCount').innerText = "12"; // Giả lập
        document.getElementById('totalRev').innerText = "45.000.000₫"; // Giả lập
    }
}

document.addEventListener('keydown', function(e) {
    if (e.altKey && e.shiftKey && e.code === 'KeyA') {
        window.location.href = 'login.html';
    }
});