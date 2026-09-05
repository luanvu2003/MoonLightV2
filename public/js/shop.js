/* ==========================================================================
   SHOP.JS - LOGIC DÀNH CHO KHÁCH HÀNG (FRONTEND)
   Dùng cho: index.html, product.html, checkout.html
   Tích hợp toàn diện: MoonlightAPI, Wishlist Drawer, Lọc danh mục nhanh,
   Tra cứu đơn hàng, Bảng size, và Tương thích Responsive di động.
   ========================================================================== */

// --- 0. DANH MỤC SẢN PHẨM MẪU CHUẨN LUXURY (DỰ PHÒNG CỤC BỘ) ---
const SHOP_FALLBACK_PRODUCTS = [
  {
    id: 1,
    _id: '67c3db00d57e603b70b50001',
    name: 'Áo Vest Luxury Slim Fit Hoàng Gia',
    category: 'vest',
    type: 'vest',
    price: 2450000,
    sold: 48,
    rating: 5.0,
    salePercent: 10,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80',
    variants: [
      {
        color: 'Đen Hoàng Gia',
        hex: '#000000',
        img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80',
        price: 2450000,
        sizes: [
          { name: 'M', size: 'M', stock: 15 },
          { name: 'L', size: 'L', stock: 20 },
          { name: 'XL', size: 'XL', stock: 10 }
        ]
      },
      {
        color: 'Xanh Navy Đêm',
        hex: '#1a2a3a',
        img: 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=800&auto=format&fit=crop&q=80',
        price: 2450000,
        sizes: [
          { name: 'M', size: 'M', stock: 12 },
          { name: 'L', size: 'L', stock: 18 }
        ]
      }
    ]
  },
  {
    id: 2,
    _id: '67c3db00d57e603b70b50002',
    name: 'Áo Sơ Mi Lụa Mulberry MoonLight',
    category: 'somi',
    type: 'somi',
    price: 890000,
    sold: 125,
    rating: 4.9,
    salePercent: 0,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
    variants: [
      {
        color: 'Trắng Ngọc Trai',
        hex: '#f8fafc',
        img: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
        price: 890000,
        sizes: [
          { name: 'S', size: 'S', stock: 25 },
          { name: 'M', size: 'M', stock: 35 },
          { name: 'L', size: 'L', stock: 30 }
        ]
      }
    ]
  },
  {
    id: 3,
    _id: '67c3db00d57e603b70b50003',
    name: 'Áo Polo Dệt Kim Diamond Knit',
    category: 'polo',
    type: 'polo',
    price: 650000,
    sold: 210,
    rating: 4.8,
    salePercent: 15,
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
    variants: [
      {
        color: 'Be Ánh Kim',
        hex: '#d2b48c',
        img: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
        price: 650000,
        sizes: [
          { name: 'M', size: 'M', stock: 40 },
          { name: 'L', size: 'L', stock: 50 }
        ]
      }
    ]
  },
  {
    id: 4,
    _id: '67c3db00d57e603b70b50004',
    name: 'Quần Âu May Đo Sartorial Cao Cấp',
    category: 'quanau',
    type: 'quanau',
    price: 950000,
    sold: 95,
    rating: 4.9,
    salePercent: 0,
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
    variants: [
      {
        color: 'Xám Tro',
        hex: '#708090',
        img: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
        price: 950000,
        sizes: [
          { name: '30', size: '30', stock: 20 },
          { name: '31', size: '31', stock: 25 },
          { name: '32', size: '32', stock: 22 }
        ]
      }
    ]
  }
];

// --- 1. KHỞI TẠO DỮ LIỆU ---
let products = JSON.parse(localStorage.getItem('moonlight_products')) || [];
if (products.length === 0) {
  products = SHOP_FALLBACK_PRODUCTS;
  localStorage.setItem('moonlight_products', JSON.stringify(products));
}

let cart = JSON.parse(localStorage.getItem('moonlight_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('moonlight_wishlist')) || [];

// Biến dùng cho trang chi tiết
let currentProduct = null;
let selectedColor = null;
let selectedSizeName = null;
let quantity = 1;
let currentShopCategory = 'all';
let displayedProducts = 8;

// Quản lý Preloader Loading màn hình
function dismissPreloader() {
  const preloader = document.getElementById('pagePreloader');
  if (preloader) {
    preloader.classList.add('loaded');
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 550);
  }
}

window.showPageLoading = function() {
  const preloader = document.getElementById('pagePreloader');
  if (preloader) {
    preloader.style.display = 'flex';
    requestAnimationFrame(() => {
      preloader.classList.remove('loaded');
    });
  }
};

window.hidePageLoading = function() {
  dismissPreloader();
};

window.addEventListener('load', () => {
  setTimeout(dismissPreloader, 200);
});
setTimeout(dismissPreloader, 1200);

// --- 2. ĐIỀU HƯỚNG & KHỞI TẠO (ROUTER) ---
document.addEventListener('DOMContentLoaded', async () => {
  updateCartIcon();
  updateWishlistIcon();

  // Nạp dữ liệu sản phẩm từ API nếu có kết nối
  await initProductsData();

  // A. Nếu đang ở Trang chủ (index.html)
  if (document.getElementById('product-grid')) {
    renderShop(displayedProducts);
    renderBestSellers(4);
    setupSearch();
    setupScrollEffects();
    setupMobileMenu();
  }

  // B. Nếu đang ở Trang chi tiết (product.html)
  if (document.getElementById('productDetailContainer')) {
    await loadProductDetail();
  }

  // C. Nếu đang ở Trang thanh toán (checkout.html)
  if (document.getElementById('checkoutItems')) {
    renderCheckoutPage();
  }

  setTimeout(dismissPreloader, 350);
});

// Nạp dữ liệu sản phẩm từ Backend REST API
// Nạp dữ liệu sản phẩm từ Backend REST API & LocalStorage
async function initProductsData() {
  // 1. Luôn ưu tiên đọc dữ liệu mới nhất từ LocalStorage trước (nơi Admin vừa cập nhật)
  const localData = localStorage.getItem('moonlight_products');
  if (localData) {
    try {
      const parsed = JSON.parse(localData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        products = parsed;
      }
    } catch (e) {}
  }

  // 2. Bổ sung từ API nếu có kết nối
  try {
    if (window.MoonlightAPI) {
      const res = await window.MoonlightAPI.getProducts();
      if (res && res.data && res.data.length > 0) {
        if (!products || products.length === 0) {
          products = res.data.map((p, idx) => ({
            ...p,
            id: p.id || idx + 1,
            variants: (p.variants && p.variants.length > 0) ? p.variants : [
              {
                color: 'Tiêu chuẩn',
                hex: '#000000',
                img: p.image || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
                price: p.price || 500000,
                sizes: [{ name: 'M', stock: 20 }, { name: 'L', stock: 20 }]
              }
            ]
          }));
          localStorage.setItem('moonlight_products', JSON.stringify(products));
        } else {
          // Bổ sung các sản phẩm từ API mà local chưa có (không ghi đè màu sắc Admin vừa sửa)
          res.data.forEach((apiP) => {
            const exists = products.some((lp) => String(lp.id) === String(apiP.id) || String(lp._id) === String(apiP._id));
            if (!exists) {
              products.push(apiP);
            }
          });
        }
      }
    }
  } catch (err) {
    console.warn('[Shop] Sử dụng dữ liệu cục bộ:', err.message);
  }

  // 3. Fallback an toàn nếu chưa có gì
  if (!products || products.length === 0) {
    products = [...SHOP_FALLBACK_PRODUCTS];
    localStorage.setItem('moonlight_products', JSON.stringify(products));
  }

  if (document.getElementById('product-grid') && products.length > 0) {
    renderShop(displayedProducts);
    renderBestSellers(4);
  }
}

// Lắng nghe thay đổi từ Admin ở tab khác theo thời gian thực (Cross-tab Real-time Sync)
window.addEventListener('storage', (e) => {
  if (e.key === 'moonlight_products') {
    try {
      const updated = JSON.parse(e.newValue);
      if (Array.isArray(updated) && updated.length > 0) {
        products = updated;
        if (document.getElementById('productDetailContainer')) {
          loadProductDetail();
        }
        if (document.getElementById('product-grid')) {
          renderShop(displayedProducts);
          renderBestSellers(4);
        }
      }
    } catch (err) {}
  }
});

// --- 3. LOGIC TRANG CHỦ (INDEX) ---

function renderShop(limit) {
  let list = products;
  if (currentShopCategory !== 'all') {
    list = products.filter((p) => (p.category || p.type) === currentShopCategory);
  }
  const sliced = list.slice(0, limit);
  renderProductGrid(sliced, 'product-grid');

  const btn = document.getElementById('loadMoreContainer');
  if (btn) btn.style.display = limit >= list.length ? 'none' : 'block';
}

function renderBestSellers(limit) {
  const sorted = [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0));
  const list = sorted.slice(0, limit);
  renderProductGrid(list, 'best-seller-grid');

  const btn = document.getElementById('loadMoreBestSeller');
  if (btn) btn.style.display = limit >= sorted.length ? 'none' : 'block';
}

function renderProductGrid(data, elementId) {
  const grid = document.getElementById(elementId);
  if (!grid) return;

  if (data.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:40px 0; color:#888;">Chưa có sản phẩm nào trong danh mục này.</p>';
    return;
  }

  grid.innerHTML = data
    .map((p) => {
      const v = (p.variants && p.variants.length > 0) ? p.variants[0] : { img: p.image || '', price: p.price || 0 };
      const percent = p.salePercent || 0;
      const isLiked = wishlist.includes(p.id) || wishlist.includes(p._id);
      const iconClass = isLiked ? 'fas' : 'far';
      const prodId = p.id || p._id;

      return `
      <div class="product-card">
          <div class="card-img">
              ${percent > 0 ? `<span class="badge-sale">-${percent}%</span>` : ''}
              <button class="wishlist-btn ${isLiked ? 'active' : ''}" onclick="toggleWishlist(this, '${prodId}')" title="Thêm vào yêu thích">
                <i class="${iconClass} fa-heart"></i>
              </button>
              <img src="${v.img}" alt="${p.name}" loading="lazy">
              <div class="card-overlay-btns">
                  <a href="product.html?id=${prodId}" class="view-btn"><i class="far fa-eye"></i> Xem chi tiết</a>
                  <button class="add-btn" onclick="quickAdd('${prodId}')"><i class="fas fa-shopping-cart"></i> Thêm nhanh</button>
              </div>
          </div>
          <div class="card-info">
              <h3><a href="product.html?id=${prodId}" style="color:inherit; text-decoration:none;">${p.name}</a></h3>
              <div class="product-meta">
                  <span class="stars"><i class="fas fa-star" style="color:#f59e0b;"></i> ${p.rating || 5}</span>
                  <span class="sold-count">Đã bán ${p.sold || 0}</span>
              </div>
              <div class="price">${Number(v.price).toLocaleString('vi-VN')}₫</div>
          </div>
      </div>`;
    })
    .join('');
}

function loadMoreProducts() {
  displayedProducts += 4;
  renderShop(displayedProducts);
}

function loadMoreBestSellers() {
  renderBestSellers(products.length);
}

// Lọc sản phẩm theo danh mục từ thanh Filter Pills
function filterShopCategory(cat) {
  currentShopCategory = cat;
  document.querySelectorAll('.shop-filter-chip').forEach((chip) => {
    chip.classList.remove('active');
    if (chip.getAttribute('data-cat') === cat) chip.classList.add('active');
  });

  displayedProducts = 8;
  renderShop(displayedProducts);

  const shopSec = document.getElementById('shop');
  if (shopSec) shopSec.scrollIntoView({ behavior: 'smooth' });
}

// --- 4. LOGIC TRANG CHI TIẾT (PRODUCT DETAIL) ---

async function loadProductDetail() {
  const container = document.getElementById('productDetailContainer');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  let id = urlParams.get('id');

  // 1. Luôn nạp dữ liệu mới nhất từ LocalStorage trước (nơi Admin vừa cập nhật)
  const localData = localStorage.getItem('moonlight_products');
  if (localData) {
    try {
      const parsed = JSON.parse(localData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        products = parsed;
      }
    } catch (e) {}
  }

  // Đảm bảo có danh sách sản phẩm
  if (!products || products.length === 0) {
    products = [...SHOP_FALLBACK_PRODUCTS];
  }

  // Nếu không truyền id trên URL, mặc định hiển thị sản phẩm đầu tiên
  if (!id && products.length > 0) {
    id = products[0].id || products[0]._id;
  }

  // Tìm trong danh sách LocalStorage trước
  currentProduct = products.find((p) => String(p.id) === String(id) || String(p._id) === String(id));

  // Thử tải trực tiếp từ Backend API nếu chưa thấy
  if (!currentProduct && window.MoonlightAPI && id) {
    try {
      const apiRes = await window.MoonlightAPI.getProductById(id);
      if (apiRes && (apiRes.data || apiRes.product)) {
        currentProduct = apiRes.data || apiRes.product;
      }
    } catch (e) {
      console.warn('[Shop] Không tìm thấy sản phẩm qua API:', e.message);
    }
  }

  // Fallback nếu vẫn chưa tìm thấy
  if (!currentProduct) {
    currentProduct = SHOP_FALLBACK_PRODUCTS.find((p) => String(p.id) === String(id) || String(p._id) === String(id)) || products[0] || SHOP_FALLBACK_PRODUCTS[0];
  }

  if (!currentProduct) {
    container.innerHTML = `
      <div style="text-align:center; padding:60px 20px; width:100%;">
        <i class="fas fa-box-open" style="font-size:48px; color:#cbd5e1; margin-bottom:16px;"></i>
        <h3 style="margin:0 0 10px 0; color:#0f172a; font-size:22px;">Sản phẩm không tồn tại!</h3>
        <p style="color:#64748b; font-size:14px; margin-bottom:20px;">Sản phẩm bạn đang tìm kiếm có thể đã được cập nhật hoặc chuyển sang danh mục khác.</p>
        <a href="index.html#shop" class="btn-primary" style="display:inline-block; padding:12px 28px; text-decoration:none;">QUAY VỀ CỬA HÀNG</a>
      </div>
    `;
    return;
  }

  selectedColor = (currentProduct.variants && currentProduct.variants.length > 0)
    ? currentProduct.variants[0]
    : {
        color: 'Tiêu chuẩn',
        hex: '#000000',
        img: currentProduct.image || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
        price: currentProduct.price || 500000,
        sizes: [{ name: 'M', size: 'M', stock: 20 }, { name: 'L', size: 'L', stock: 20 }]
      };

  selectedSizeName = null;
  quantity = 1;

  renderDetailHTML();
  renderRelatedProducts();
  renderProductReviews(id || currentProduct.id || currentProduct._id);
}

function renderDetailHTML() {
  const container = document.getElementById('productDetailContainer');
  if (!container || !currentProduct) return;

  const percent = (selectedColor.oldPrice && selectedColor.oldPrice > selectedColor.price)
    ? Math.round(((selectedColor.oldPrice - selectedColor.price) / selectedColor.oldPrice) * 100)
    : (currentProduct.salePercent || 0);

  const oldPriceVal = selectedColor.oldPrice || (percent > 0 ? Math.round(selectedColor.price / (1 - percent / 100)) : 0);
  const currentId = currentProduct.id || currentProduct._id;
  const isLiked = wishlist.includes(currentId);
  const iconClass = isLiked ? 'fas' : 'far';

  const variants = (currentProduct.variants && currentProduct.variants.length > 0)
    ? currentProduct.variants
    : [selectedColor];

  container.innerHTML = `
    <div class="pd-image-col">
      <div class="main-img-wrapper">
        <button class="wishlist-btn ${isLiked ? 'active' : ''}" 
                style="opacity:1; transform:none; top:20px; right:20px; width:45px; height:45px; font-size:20px; z-index:10; background:rgba(255,255,255,0.9); box-shadow:0 4px 12px rgba(0,0,0,0.1);" 
                onclick="toggleWishlist(this, '${currentId}')" 
                title="Yêu thích">
          <i class="${iconClass} fa-heart"></i>
        </button>
        <img src="${selectedColor.img || currentProduct.image}" id="mainDetailImg" alt="${currentProduct.name}">
      </div>
      ${variants.length > 1 ? `
        <div style="display:flex; gap:10px; margin-top:14px; overflow-x:auto; padding-bottom:6px;">
          ${variants.map((v, idx) => `
            <img src="${v.img}" onclick="selectColor(${idx}, this)" 
                 style="width:68px; height:68px; object-fit:cover; border-radius:6px; cursor:pointer; border:2.5px solid ${v.color === selectedColor.color ? 'var(--gold, #dfba73)' : '#e2e8f0'}; transition:0.2s; box-shadow:0 2px 6px rgba(0,0,0,0.05);"
                 alt="${v.color}" title="${v.color}">
          `).join('')}
        </div>
      ` : ''}
    </div>

    <div class="pd-info-col">
      <h1 class="pd-title">${currentProduct.name}</h1>
      
      <div class="pd-rating">
        <div style="color:#f59e0b; display:inline-flex; gap:3px;">
          <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
        </div>
        <span style="font-weight:700; color:#0f172a; margin-left:6px;">${currentProduct.rating || '5.0'}</span> / 5
        <span style="margin:0 10px; color:#cbd5e1;">|</span>
        <span style="color:#64748b;">Đã bán ${(currentProduct.sold || 48).toLocaleString('vi-VN')}</span>
      </div>

      <div class="pd-price-box">
        <span class="pd-price" id="detailPrice">${Number(selectedColor.price).toLocaleString('vi-VN')}₫</span>
        ${oldPriceVal > selectedColor.price ? `<span class="pd-old-price" id="detailOldPrice">${Number(oldPriceVal).toLocaleString('vi-VN')}₫</span>` : ''}
        ${percent > 0 ? `<span class="pd-discount-tag" id="detailSaleTag">-${percent}%</span>` : ''}
      </div>
      
      <p class="pd-desc">${currentProduct.description || currentProduct.desc || 'Thiết kế tinh xảo từ chất liệu cao cấp, tôn vinh phong cách sang trọng và lịch lãm của quý ông hiện đại.'}</p>
      
      <div class="pd-option-group">
        <span class="option-label">Màu sắc: <strong id="colorName" style="color:var(--gold, #dfba73); font-weight:700;">${selectedColor.color}</strong></span>
        <div class="color-selector">
          ${variants.map((v, idx) => `
            <div class="color-btn ${v.color === selectedColor.color ? 'selected' : ''}" onclick="selectColor(${idx}, this)">
              <span class="color-dot" style="background:${v.hex || v.colorCode || '#c5a059'}"></span> ${v.color}
            </div>
          `).join('')}
        </div>
      </div>

      <div class="pd-option-group">
        <span class="option-label">Kích thước: <strong id="sizeName" style="color:var(--gold, #dfba73); font-weight:700;">${selectedSizeName ? selectedSizeName : 'Vui lòng chọn size'}</strong></span>
        <div class="size-selector" id="sizeSelectorContainer"></div>
      </div>

      <div class="pd-actions">
        <div class="qty-input-group">
          <button class="qty-nav-btn" onclick="updateDetailQty(-1)" type="button">-</button>
          <input type="text" class="qty-val" id="detailQty" value="${quantity}" readonly>
          <button class="qty-nav-btn" onclick="updateDetailQty(1)" type="button">+</button>
        </div>
        <button class="btn-add-cart-lg" onclick="addDetailToCart()" type="button"><i class="fas fa-shopping-bag" style="margin-right:8px;"></i> THÊM VÀO GIỎ HÀNG</button>
      </div>

      <div style="margin-top:30px; padding-top:20px; border-top:1px solid #eee; display:flex; gap:20px; color:#64748b; font-size:12.5px; flex-wrap:wrap;">
        <div><i class="fas fa-shipping-fast" style="color:var(--gold, #dfba73); margin-right:6px;"></i> Miễn phí ship từ 1.000.000₫</div>
        <div><i class="fas fa-undo-alt" style="color:var(--gold, #dfba73); margin-right:6px;"></i> Đổi hàng trong 30 ngày</div>
        <div><i class="fas fa-shield-alt" style="color:var(--gold, #dfba73); margin-right:6px;"></i> 100% hàng chính hãng</div>
      </div>
    </div>
  `;

  renderSizeButtons();
}

function renderSizeButtons() {
  const sizeContainer = document.getElementById('sizeSelectorContainer');
  if (!sizeContainer) return;

  if (!selectedColor.sizes || selectedColor.sizes.length === 0) {
    sizeContainer.innerHTML = '<span style="color:#94a3b8; font-style:italic;">Freesize / Liên hệ đặt may</span>';
    return;
  }

  sizeContainer.innerHTML = selectedColor.sizes
    .map((s) => {
      const sName = s.name || s.size;
      const isOutOfStock = s.stock <= 0;
      const isSelected = selectedSizeName === sName;

      return `
        <div class="size-btn ${isSelected ? 'selected' : ''} ${isOutOfStock ? 'disabled' : ''}" 
             onclick="selectSize('${sName}', ${s.stock || 0}, this)">
             ${sName}
        </div>`;
    })
    .join('');
}

function selectColor(index, btn) {
  if (!currentProduct || !currentProduct.variants || !currentProduct.variants[index]) return;
  selectedColor = currentProduct.variants[index];
  selectedSizeName = null;
  renderDetailHTML();
}

function selectSize(name, stock, btn) {
  if (stock <= 0) return;
  selectedSizeName = name;
  const sizeNameEl = document.getElementById('sizeName');
  if (sizeNameEl) sizeNameEl.innerText = name;

  document.querySelectorAll('.size-btn').forEach((b) => b.classList.remove('selected'));
  if (btn) btn.classList.add('selected');
}

function updateDetailQty(change) {
  quantity += change;
  if (quantity < 1) quantity = 1;
  const el = document.getElementById('detailQty');
  if (el) el.value = quantity;
}

function addDetailToCart() {
  if (!selectedSizeName) {
    showToast({ title: 'Chưa chọn size', message: 'Vui lòng chọn kích thước phù hợp trước khi thêm vào giỏ hàng.', type: 'warning' });
    return;
  }

  const sizeObj = (selectedColor.sizes || []).find((s) => (s.name || s.size) === selectedSizeName);
  if (sizeObj && sizeObj.stock < quantity) {
    showToast({ title: 'Tồn kho không đủ', message: `Size ${selectedSizeName} chỉ còn ${sizeObj.stock} sản phẩm.`, type: 'error' });
    return;
  }

  const item = {
    id: currentProduct.id || currentProduct._id,
    name: currentProduct.name,
    price: selectedColor.price,
    img: selectedColor.img || currentProduct.image,
    color: selectedColor.color,
    size: selectedSizeName,
    quantity: quantity
  };

  addToCart(item);
  showToast({ title: 'Thành công', message: `Đã thêm ${quantity} x "${currentProduct.name}" vào giỏ hàng!`, type: 'success' });
}

function renderRelatedProducts() {
  const grid = document.getElementById('related-grid');
  if (!grid) return;
  const currentId = currentProduct ? (currentProduct.id || currentProduct._id) : null;
  const related = products.filter((p) => String(p.id || p._id) !== String(currentId)).slice(0, 4);
  renderProductGrid(related, 'related-grid');
}

// --- 5. LOGIC GIỎ HÀNG (CORE) ---

function addToCart(newItem) {
  const exist = cart.find((i) => String(i.id) === String(newItem.id) && i.color === newItem.color && i.size === newItem.size);
  if (exist) {
    exist.quantity += newItem.quantity;
  } else {
    cart.push(newItem);
  }

  saveCart();
  updateCartIcon();
  toggleCart();
  showToast({ title: 'Thành công', message: `Đã thêm "${newItem.name}" vào giỏ hàng.`, type: 'success' });
}

function quickAdd(id) {
  const p = products.find((x) => String(x.id) === String(id) || String(x._id) === String(id));
  if (!p) return;

  const v = p.variants?.[0];
  if (!v) return;

  const availableSize = v.sizes?.find((s) => s.stock > 0);
  if (!availableSize) {
    showToast({ title: 'Hết hàng', message: 'Sản phẩm này tạm thời hết hàng.', type: 'error' });
    return;
  }

  const item = {
    id: p.id || p._id,
    name: p.name,
    price: v.price,
    img: v.img,
    color: v.color,
    size: availableSize.name || availableSize.size,
    quantity: 1
  };
  addToCart(item);
}

function saveCart() {
  localStorage.setItem('moonlight_cart', JSON.stringify(cart));
}

function updateCartIcon() {
  const badge = document.getElementById('cartBadge') || document.querySelector('.badge');
  if (badge) badge.innerText = cart.reduce((sum, i) => sum + i.quantity, 0);
}

function renderCartSidebar() {
  const list = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  if (!list) return;

  if (cart.length === 0) {
    list.innerHTML = `
      <div style="text-align:center; padding:40px 20px; color:#888;">
        <i class="fas fa-shopping-bag" style="font-size:36px; margin-bottom:12px; opacity:0.35;"></i>
        <p style="margin:0; font-size:14px;">Giỏ hàng của bạn đang trống</p>
      </div>
    `;
    if (totalEl) totalEl.innerText = '0₫';
    return;
  }

  let total = 0;
  list.innerHTML = cart
    .map((item, idx) => {
      total += item.price * item.quantity;
      return `
      <div class="cart-item-row" style="display:flex; gap:12px; padding:12px 0; border-bottom:1px solid #f1f5f9; align-items:center;">
          <img src="${item.img}" style="width:50px; height:60px; object-fit:cover; border-radius:4px;" alt="${item.name}">
          <div class="cart-item-info" style="flex:1;">
              <h4 style="font-size:13px; margin:0 0 4px 0; color:#0f172a;">${item.name}</h4>
              <p style="font-size:11px; color:#64748b; margin:2px 0;">${item.color} / Size: ${item.size}</p>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
                  <strong style="font-size:13px; color:var(--gold);">${(item.price * item.quantity).toLocaleString('vi-VN')}₫</strong>
                  <div style="background:#f1f5f9; display:flex; align-items:center; border-radius:4px; padding:2px;">
                      <button onclick="changeCartQty(${idx}, -1)" style="border:none; background:none; padding:2px 8px; cursor:pointer; font-weight:700;">-</button>
                      <span style="font-size:12px; padding:0 6px; font-weight:600;">${item.quantity}</span>
                      <button onclick="changeCartQty(${idx}, 1)" style="border:none; background:none; padding:2px 8px; cursor:pointer; font-weight:700;">+</button>
                  </div>
              </div>
          </div>
          <div onclick="removeCartItem(${idx})" style="cursor:pointer; color:#ef4444; padding:6px;" title="Xóa món"><i class="fas fa-trash"></i></div>
      </div>`;
    })
    .join('');

  if (totalEl) totalEl.innerText = `${total.toLocaleString('vi-VN')}₫`;
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
    if (overlay) overlay.classList.toggle('open');
    if (sidebar.classList.contains('open')) renderCartSidebar();
  }
}

// Chuyển sang trang thanh toán
function goToCheckout() {
  if (cart.length === 0) {
    showToast({ title: 'Giỏ hàng trống', message: 'Vui lòng chọn sản phẩm trước khi tiến hành thanh toán.', type: 'warning' });
    return;
  }
  window.location.href = 'checkout.html';
}

// --- 6. LOGIC YÊU THÍCH (WISHLIST SIDEBAR) ---

function updateWishlistIcon() {
  const badge = document.getElementById('wishlistBadge');
  if (badge) badge.innerText = wishlist.length;
}

function toggleWishlistSidebar() {
  const sidebar = document.getElementById('wishlistSidebar');
  const overlay = document.getElementById('wishlistOverlay');
  if (!sidebar) return;
  sidebar.classList.toggle('open');
  if (overlay) overlay.classList.toggle('open');
  if (sidebar.classList.contains('open')) {
    renderWishlistSidebar();
  }
}

function renderWishlistSidebar() {
  const container = document.getElementById('wishlistItems');
  if (!container) return;

  const likedProducts = products.filter((p) => wishlist.includes(p.id) || wishlist.includes(p._id));

  if (likedProducts.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:50px 20px; color:#888;">
        <i class="far fa-heart" style="font-size:40px; margin-bottom:12px; opacity:0.4;"></i>
        <div style="font-weight:700; color:#333; margin-bottom:6px;">Danh sách yêu thích trống</div>
        <p style="font-size:13px; line-height:1.5;">Nhấn biểu tượng trái tim ở các sản phẩm bạn thích để lưu lại tại đây.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = likedProducts
    .map((p) => {
      const v = p.variants?.[0] || { img: p.image || '', price: p.price || 0 };
      const prodId = p.id || p._id;
      return `
      <div class="cart-item-row" style="display:flex; gap:12px; padding:14px 0; border-bottom:1px solid #f1f5f9; align-items:center;">
        <img src="${v.img}" style="width:55px; height:68px; object-fit:cover; border-radius:4px;" alt="${p.name}">
        <div style="flex:1;">
          <h4 style="font-size:13px; margin:0 0 4px 0;"><a href="product.html?id=${prodId}" style="color:#0f172a; text-decoration:none;">${p.name}</a></h4>
          <strong style="color:var(--gold); font-size:13px;">${Number(v.price).toLocaleString('vi-VN')}₫</strong>
          <div style="margin-top:6px; display:flex; gap:12px; align-items:center;">
            <a href="product.html?id=${prodId}" style="font-size:11px; color:#5b50f6; font-weight:700; text-decoration:none;">Xem chi tiết &rarr;</a>
            <button onclick="quickAdd('${prodId}')" style="background:none; border:none; color:#10b981; font-size:11px; font-weight:700; cursor:pointer;">+ Giỏ hàng</button>
          </div>
        </div>
        <button onclick="toggleWishlist(null, '${prodId}')" style="background:none; border:none; color:#ef4444; cursor:pointer; padding:6px;" title="Bỏ thích">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    })
    .join('');
}

function toggleWishlist(btn, id) {
  const strId = String(id);
  const exists = wishlist.some((x) => String(x) === strId);

  if (exists) {
    wishlist = wishlist.filter((i) => String(i) !== strId);
    showToast({ title: 'Đã bỏ thích', message: 'Đã xóa sản phẩm khỏi danh sách yêu thích.', type: 'info' });
  } else {
    wishlist.push(id);
    showToast({ title: 'Đã yêu thích', message: 'Đã lưu sản phẩm vào danh sách yêu thích.', type: 'success' });
  }

  localStorage.setItem('moonlight_wishlist', JSON.stringify(wishlist));
  updateWishlistIcon();

  // Cập nhật icon trên card
  if (btn) {
    const icon = btn.querySelector('i');
    if (icon) {
      if (exists) {
        icon.classList.remove('fas');
        icon.classList.add('far');
        btn.classList.remove('active');
      } else {
        icon.classList.remove('far');
        icon.classList.add('fas');
        btn.classList.add('active');
      }
    }
  }

  // Cập nhật lại sidebar nếu đang mở
  const sidebar = document.getElementById('wishlistSidebar');
  if (sidebar && sidebar.classList.contains('open')) {
    renderWishlistSidebar();
  }
}

// --- 7. LOGIC THANH TOÁN (CHECKOUT) ---

function renderCheckoutPage() {
  const container = document.getElementById('checkoutItems');
  const subTotalEl = document.getElementById('checkoutSubtotal');
  const totalEl = document.getElementById('checkoutTotal');

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:35px 15px;">
        <i class="fas fa-shopping-bag" style="font-size:38px; color:#cbd5e1; margin-bottom:12px; display:block;"></i>
        <h4 style="margin:0 0 6px 0; color:#0f172a; font-size:15px;">Giỏ hàng của bạn đang trống</h4>
        <p style="margin:0 0 16px 0; color:#64748b; font-size:13px;">Hãy chọn các thiết kế mới nhất tại cửa hàng.</p>
        <a href="index.html#shop" class="btn-primary" style="display:inline-block; padding:10px 24px; font-size:12px; text-decoration:none; border-radius:4px;">MUA SẮM NGAY</a>
      </div>
    `;
    if (subTotalEl) subTotalEl.innerText = '0₫';
    if (totalEl) totalEl.innerText = '0₫';
    return;
  }

  let total = 0;
  container.innerHTML = cart
    .map((item) => {
      total += item.price * item.quantity;
      return `
      <div class="order-item-mini" style="display:flex; gap:14px; margin-bottom:14px; padding-bottom:14px; border-bottom:1px solid #f1f5f9; align-items:center;">
          <img src="${item.img}" style="width:60px; height:72px; object-fit:cover; border-radius:4px; border:1px solid #e2e8f0; flex-shrink:0;">
          <div style="flex:1;">
              <h4 style="font-size:13.5px; margin:0 0 4px 0; color:#0f172a; font-weight:600;">${item.name}</h4>
              <p style="font-size:12px; color:#64748b; margin:0;">${item.color} | Size: <strong>${item.size}</strong></p>
              <p style="font-size:12px; margin:4px 0 0 0; color:#475569;">Số lượng: <strong>${item.quantity}</strong></p>
          </div>
          <div style="font-weight:700; font-size:14px; color:#0f172a;">${(item.price * item.quantity).toLocaleString('vi-VN')}₫</div>
      </div>`;
    })
    .join('') + `
      <a href="index.html#shop" class="btn-add-more-items">
        <i class="fas fa-plus-circle" style="color:var(--gold, #dfba73);"></i> CHỌN THÊM SẢN PHẨM KHÁC
      </a>
    `;

  if (subTotalEl) subTotalEl.innerText = `${total.toLocaleString('vi-VN')}₫`;
  if (totalEl) totalEl.innerText = `${total.toLocaleString('vi-VN')}₫`;
}

async function handleCheckout(e) {
  e.preventDefault();
  if (cart.length === 0) return alert('Giỏ hàng trống!');

  const name = document.getElementById('cusName').value;
  const phone = document.getElementById('cusPhone').value;
  const address = document.getElementById('cusAddress').value;
  const note = document.getElementById('cusNote').value;
  const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'cod';

  const orderCode = `ML-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const newOrder = {
    id: orderCode,
    orderCode,
    customer: { name, phone, address, note },
    items: [...cart],
    total,
    status: 'pending',
    isPaid: false,
    paymentMethod: paymentMethod === 'cod' ? 'cod' : 'banking',
    date: new Date().toLocaleString('vi-VN')
  };

  // Gửi API backend nếu có
  try {
    if (window.MoonlightAPI) {
      await window.MoonlightAPI.createOrder(newOrder);
    }
  } catch (err) {
    console.warn('[Checkout API]:', err.message);
  }

  // Lưu vào LocalStorage
  let orders = JSON.parse(localStorage.getItem('moonlight_orders')) || [];
  orders.unshift(newOrder);
  localStorage.setItem('moonlight_orders', JSON.stringify(orders));

  cart = [];
  saveCart();

  alert(`Đặt hàng thành công! Mã đơn của quý khách: ${orderCode}`);
  window.location.href = 'index.html';
}

// --- 8. TIỆN ÍCH & TƯƠNG TÁC GIAO DIỆN ---

// Tìm kiếm
function setupSearch() {
  const input = document.getElementById('searchInput');
  if (input) {
    input.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        const keyword = e.target.value.toLowerCase().trim();
        const filtered = products.filter((p) => p.name.toLowerCase().includes(keyword));
        renderProductGrid(filtered, 'product-grid');
        toggleSearch();
        const shopSec = document.getElementById('shop');
        if (shopSec) shopSec.scrollIntoView({ behavior: 'smooth' });
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

// Scroll Effects (Navbar đổi màu, Nút lên đầu trang, Reveal Animation)
function setupScrollEffects() {
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    // 1. Navbar scrolled style
    if (window.scrollY > 80) {
      if (navbar) navbar.classList.add('scrolled');
    } else {
      if (navbar) navbar.classList.remove('scrolled');
    }

    // 2. Scroll to top button show/hide
    if (window.scrollY > 300) {
      if (scrollTopBtn) scrollTopBtn.classList.add('show');
    } else {
      if (scrollTopBtn) scrollTopBtn.classList.remove('show');
    }
  });

  // 3. Scroll to top click
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 4. Reveal Animations
  const elements = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('active');
    });
  });
  elements.forEach((el) => observer.observe(el));
}

// Mobile Menu Navigation
function setupMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const menu = document.querySelector('.menu');
  const overlay = document.querySelector('.mobile-menu-overlay');

  if (toggleBtn && menu) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('open');
      if (overlay) overlay.classList.toggle('open');
    });
  }

  if (overlay && menu) {
    overlay.addEventListener('click', () => {
      menu.classList.remove('open');
      overlay.classList.remove('open');
    });
  }

  document.querySelectorAll('.menu a').forEach((link) => {
    link.addEventListener('click', () => {
      if (menu) menu.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
    });
  });
}

// Đăng ký nhận bản tin Newsletter
function handleNewsletter(e) {
  e.preventDefault();
  const form = e.target;
  const input = form.querySelector('input[type="email"]');
  const email = (input?.value || '').trim();

  if (!email || !email.includes('@')) {
    showToast({ title: 'Email không hợp lệ', message: 'Vui lòng nhập địa chỉ email chính xác.', type: 'warning' });
    return;
  }

  let subs = JSON.parse(localStorage.getItem('moonlight_subscribers')) || [];
  if (!subs.includes(email)) {
    subs.push(email);
    localStorage.setItem('moonlight_subscribers', JSON.stringify(subs));
  }

  if (input) input.value = '';
  showToast({
    title: 'Đăng ký thành công!',
    message: 'Mã giảm giá 10% của bạn là: MOONLIGHT10 (áp dụng khi thanh toán)',
    type: 'success'
  });
}

// Toast Notification
function showToast({ title, message, type }) {
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
        <div class="toast__close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></div>
    `;

  box.appendChild(toast);

  setTimeout(() => {
    if (toast && toast.parentElement) toast.remove();
  }, 3500);
}

// --- 9. MODALS CHÂN TRANG (TRA CỨU ĐƠN, BẢNG SIZE, CHÍNH SÁCH) ---

function openOrderTrackingModal() {
  const m = document.getElementById('orderTrackingModal');
  if (m) m.classList.add('open');
}
function closeOrderTrackingModal() {
  const m = document.getElementById('orderTrackingModal');
  if (m) m.classList.remove('open');
}

function handleTrackOrderSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('trackOrderInput');
  const val = (input?.value || '').trim().toLowerCase();
  const resContainer = document.getElementById('trackOrderResult');
  if (!val || !resContainer) return;

  const orders = JSON.parse(localStorage.getItem('moonlight_orders')) || [];
  const found = orders.find(
    (o) =>
      (o.id && o.id.toLowerCase().includes(val)) ||
      (o.orderCode && o.orderCode.toLowerCase().includes(val)) ||
      (o.customer?.phone && o.customer.phone.includes(val))
  );

  if (found) {
    const statusMap = {
      pending: '🟡 Chờ xác nhận',
      confirmed: '🔵 Đã xác nhận',
      shipping: '🚚 Đang giao hàng',
      completed: '✅ Đã hoàn thành',
      cancelled: '❌ Đã hủy'
    };
    resContainer.innerHTML = `
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px; margin-top:14px; text-align:left;">
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
          <strong>Mã đơn: #${found.orderCode || found.id}</strong>
          <span style="font-weight:700;">${statusMap[found.status] || found.status}</span>
        </div>
        <div style="font-size:12px; color:#64748b; line-height:1.6;">
          <div>Khách hàng: <strong>${found.customer?.name || 'Khách lẻ'}</strong> (${found.customer?.phone || ''})</div>
          <div>Tổng tiền: <strong style="color:var(--gold); font-size:14px;">${Number(found.total || 0).toLocaleString('vi-VN')}₫</strong></div>
          <div>Ngày đặt: ${found.date || (found.createdAt ? new Date(found.createdAt).toLocaleDateString('vi-VN') : 'Mới đây')}</div>
          <div style="margin-top:6px; font-style:italic;">Địa chỉ: ${found.customer?.address || 'Tại cửa hàng'}</div>
        </div>
      </div>
    `;
  } else {
    resContainer.innerHTML = `
      <div style="color:#ef4444; font-size:13px; margin-top:14px; padding:12px; background:rgba(239, 68, 68, 0.08); border-radius:6px;">
        Không tìm thấy đơn hàng nào khớp với mã đơn hoặc SĐT này. Quý khách vui lòng kiểm tra lại!
      </div>
    `;
  }
}

function openSizeGuideModal() {
  const m = document.getElementById('sizeGuideModal');
  if (m) m.classList.add('open');
}
function closeSizeGuideModal() {
  const m = document.getElementById('sizeGuideModal');
  if (m) m.classList.remove('open');
}

function openPolicyModal() {
  const m = document.getElementById('policyModal');
  if (m) m.classList.add('open');
}
function closePolicyModal() {
  const m = document.getElementById('policyModal');
  if (m) m.classList.remove('open');
}

// --- 10. REVIEWS SẢN PHẨM RIÊNG BIỆT ---
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
  const productReviews = allReviews.filter((r) => String(r.productId) === String(pid));

  const avgScore =
    productReviews.length > 0
      ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
      : currentProduct && currentProduct.rating
      ? currentProduct.rating
      : '5.0';

  const count = productReviews.length;
  const avgEl = document.querySelector('.average-rating');
  if (avgEl) avgEl.innerText = avgScore;
  const totalEl = document.querySelector('.total-reviews');
  if (totalEl) totalEl.innerText = `(${count} đánh giá)`;

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

  listContainer.innerHTML = productReviews
    .map((rev) => {
      const initials = (rev.name || 'K').split(' ').map((w) => w[0]).filter(Boolean).slice(-2).join('').toUpperCase();
      return `
      <div class="review-item" style="margin-bottom:20px; padding-bottom:18px; border-bottom:1px solid #eee; display:flex; gap:16px; align-items:flex-start;">
        <div class="review-avatar" style="width:44px; height:44px; border-radius:50%; background:linear-gradient(135deg, #1e293b, #0f172a); border:2px solid #dfba73; display:flex; align-items:center; justify-content:center; font-weight:700; color:#dfba73; flex-shrink:0; font-size:15px; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          ${initials}
        </div>
        <div class="review-content" style="flex:1;">
          <div class="review-top" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <strong style="color:#0f172a; font-size:15px; font-weight:700;">${rev.name}</strong>
            <span class="review-date" style="font-size:12.5px; color:#64748b;">${rev.date || 'Gần đây'}</span>
          </div>
          <div class="stars-display" style="color:#f59e0b; font-size:13px; margin:2px 0 6px 0;">
            ${'★'.repeat(rev.rating)}${'☆'.repeat(Math.max(0, 5 - rev.rating))}
          </div>
          <p style="margin:0; color:#334155; line-height:1.6; font-size:14px;">${rev.content}</p>
          ${
            rev.shopReply
              ? `
            <div class="shop-reply-customer-view" style="margin-top:12px; background:#f8fafc; border-left:3px solid var(--gold, #dfba73); border-radius:0 8px 8px 0; padding:12px 16px; font-size:13px; border:1px solid #e2e8f0; border-left-width:3px;">
              <div class="customer-reply-header" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
                <span class="customer-reply-brand" style="color:#0f172a; font-weight:700; font-size:12px; text-transform:uppercase; letter-spacing:0.5px; display:inline-flex; align-items:center; gap:6px;">
                  <i class="fas fa-shield-alt" style="color:#dfba73;"></i> Phản Hồi Từ MoonLight
                </span>
                <small style="color:#64748b; font-size:11.5px;">${rev.shopReplyDate || ''}</small>
              </div>
              <p class="customer-reply-content" style="margin:0; color:#334155; line-height:1.55; font-size:13px;">${rev.shopReply}</p>
            </div>
          `
              : ''
          }
        </div>
      </div>
    `;
    })
    .join('');
}

function submitReview(e) {
  e.preventDefault();
  if (selectedRating === 0) {
    showToast({ title: 'Chưa chọn số sao', message: 'Vui lòng chọn số sao đánh giá sản phẩm.', type: 'warning' });
    return;
  }

  const nameInput = document.getElementById('reviewerName');
  const contentInput = document.getElementById('reviewContent');
  const name = nameInput ? nameInput.value.trim() : 'Khách hàng';
  const content = contentInput ? contentInput.value.trim() : '';

  if (!content) {
    showToast({ title: 'Nội dung trống', message: 'Vui lòng viết đôi lời cảm nhận về sản phẩm.', type: 'warning' });
    return;
  }

  const pid = currentProduct ? currentProduct.id || currentProduct._id : 1;
  const pName = currentProduct ? currentProduct.name : 'Sản phẩm';

  const newReview = {
    id: Date.now(),
    productId: pid,
    productName: pName,
    name,
    rating: selectedRating,
    content,
    date: new Date().toLocaleDateString('vi-VN'),
    status: 'approved'
  };

  let allReviews = JSON.parse(localStorage.getItem('moonlight_all_reviews')) || [];
  allReviews.unshift(newReview);
  localStorage.setItem('moonlight_all_reviews', JSON.stringify(allReviews));

  const form = document.getElementById('reviewForm');
  if (form) form.reset();
  rateStar(0);

  showToast({ title: 'Cảm ơn quý khách!', message: 'Đánh giá của bạn đã được hiển thị công khai.', type: 'success' });
  renderProductReviews(pid);
}