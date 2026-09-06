/**
 * ==========================================================================
 * MOONLIGHT POS PRO TERMINAL — LOGIC SYSTEM (v2.0)
 * Thiết kế cho thu ngân Boutique cao cấp: Đa đơn hàng, VietQR MB Bank,
 * Phân loại biến thể trực quan, in hóa đơn nhiệt và phím tắt chuyên nghiệp.
 * ==========================================================================
 */

// Danh mục sản phẩm mặc định cao cấp (luôn sẵn sàng cả khi chưa có mạng)
const POS_FALLBACK_PRODUCTS = [
  {
    id: 1,
    _id: '67c3db00d57e603b70b50001',
    name: 'Áo Vest Luxury Slim Fit Hoàng Gia',
    category: 'vest',
    type: 'vest',
    price: 2450000,
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

// STATE MANAGEMENT
let posProducts = [];
let activeCategory = 'all';
let activeTabIndex = 0;

// Danh sách các tab đơn hàng (Hỗ trợ treo đơn)
let posTabs = [
  {
    id: 1,
    name: 'Đơn #1',
    cart: [],
    customerName: '',
    customerPhone: '',
    tier: 'Khách vãng lai',
    paymentMethod: 'Tiền mặt',
    discount: 0
  }
];

// Trạng thái modal biến thể hiện tại
let currentModalProd = null;
let selectedVariantIdx = 0;
let selectedSizeName = '';
let selectedSizeStock = 0;

// ==========================================================================
// KHỞI CHẠY HỆ THỐNG
// ==========================================================================
document.addEventListener('DOMContentLoaded', async () => {
  initStaffAuth();
  initClockAndShift();
  setupKeyboardShortcuts();
  await loadPosProducts();
  renderPosTabs();
  renderCurrentCart();
});

// 1. Xác thực & Hiển thị thông tin nhân viên
function initStaffAuth() {
  const user = JSON.parse(localStorage.getItem('moonlight_user')) || {
    name: 'Vũ Phạm Luân',
    role: 'Staff'
  };

  const nameEl = document.getElementById('staffName');
  const roleEl = document.getElementById('staffRole');
  const avatarEl = document.getElementById('staffAvatar');

  if (nameEl) nameEl.innerText = user.name;
  if (roleEl) roleEl.innerText = user.role === 'Admin' ? 'Quản Trị Viên' : user.role === 'Owner' ? 'Chủ Shop' : 'Thu Ngân';
  if (avatarEl) avatarEl.innerText = (user.name || 'L').charAt(0).toUpperCase();
}

// 2. Đồng hồ số thời gian thực & xác định ca trực
function initClockAndShift() {
  const clockEl = document.getElementById('posDigitalClock');
  const dateEl = document.getElementById('posCurrentDate');
  const shiftEl = document.getElementById('posShiftText');

  function update() {
    const now = new Date();
    if (clockEl) clockEl.innerText = now.toLocaleTimeString('vi-VN');
    if (dateEl) dateEl.innerText = now.toLocaleDateString('vi-VN');

    const h = now.getHours();
    let shiftName = 'Ca Sáng (07:00 - 13:00)';
    if (h >= 13 && h < 18) shiftName = 'Ca Chiều (13:00 - 18:00)';
    else if (h >= 18 || h < 7) shiftName = 'Ca Tối (18:00 - 22:00)';
    if (shiftEl) shiftEl.innerText = shiftName;
  }

  update();
  setInterval(update, 1000);
}

// 3. Nạp danh mục sản phẩm (API + LocalStorage + Fallback)
async function loadPosProducts() {
  try {
    if (window.MoonlightAPI) {
      const res = await window.MoonlightAPI.getProducts();
      if (res && res.data && res.data.length > 0) {
        posProducts = res.data;
        localStorage.setItem('moonlight_products', JSON.stringify(posProducts));
      }
    }
  } catch (err) {
    console.warn('[POS] Không kết nối được API, sử dụng dữ liệu cục bộ:', err.message);
  }

  if (!posProducts || posProducts.length === 0) {
    posProducts = JSON.parse(localStorage.getItem('moonlight_products')) || POS_FALLBACK_PRODUCTS;
    localStorage.setItem('moonlight_products', JSON.stringify(posProducts));
  }

  // Chuẩn hóa dữ liệu nếu thiếu variants
  posProducts = posProducts.map((p, idx) => {
    if (!p.id) p.id = idx + 1;
    if (!p.category && p.type) p.category = p.type;
    if (!p.category) p.category = 'vest';
    if (!p.variants || p.variants.length === 0) {
      p.variants = [
        {
          color: 'Tiêu chuẩn',
          hex: '#000000',
          img: p.image || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
          price: p.price || 500000,
          sizes: [
            { name: 'M', size: 'M', stock: 20 },
            { name: 'L', size: 'L', stock: 20 }
          ]
        }
      ];
    }
    return p;
  });

  updateCategoryCounts();
  renderPosProductGrid();
}

// 4. Cập nhật số lượng từng danh mục
function updateCategoryCounts() {
  const countAll = posProducts.length;
  const countVest = posProducts.filter((p) => (p.category || p.type) === 'vest').length;
  const countSomi = posProducts.filter((p) => (p.category || p.type) === 'somi').length;
  const countPolo = posProducts.filter((p) => (p.category || p.type) === 'polo').length;
  const countQuanau = posProducts.filter((p) => (p.category || p.type) === 'quanau').length;

  const setT = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
  };

  setT('countAll', countAll);
  setT('countVest', countVest);
  setT('countSomi', countSomi);
  setT('countPolo', countPolo);
  setT('countQuanau', countQuanau);
}

// 5. Lọc danh mục sản phẩm
function filterPosCategory(cat) {
  activeCategory = cat;
  document.querySelectorAll('#posCategoryBar .cat-chip').forEach((btn) => {
    btn.classList.remove('active');
  });
  if (event && event.currentTarget) {
    event.currentTarget.classList.add('active');
  }
  renderPosProductGrid();
}

// 6. Tìm kiếm sản phẩm
function searchPosProduct() {
  renderPosProductGrid();
}

// 7. Render lưới sản phẩm
function renderPosProductGrid() {
  const grid = document.getElementById('posProductGrid');
  if (!grid) return;

  const keyword = (document.getElementById('posSearchInput')?.value || '').trim().toLowerCase();

  let list = posProducts;

  if (activeCategory !== 'all') {
    list = list.filter((p) => (p.category || p.type) === activeCategory);
  }

  if (keyword) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(keyword) ||
        (p.category && p.category.toLowerCase().includes(keyword))
    );
  }

  if (list.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #64748b;">
        <i class="fas fa-search" style="font-size: 36px; margin-bottom: 12px; color: #334155;"></i>
        <div style="font-size: 15px; font-weight: 700; color: #94a3b8;">Không tìm thấy sản phẩm nào</div>
        <div style="font-size: 12px; margin-top: 4px;">Hãy thử tìm bằng từ khóa hoặc danh mục khác</div>
      </div>
    `;
    return;
  }

  grid.innerHTML = list
    .map((p) => {
      const v = p.variants && p.variants.length > 0 ? p.variants[0] : null;
      const img = v?.img || p.image || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800';
      const price = v?.price || p.price || 0;

      // Tính tổng tồn kho
      let totalStock = 0;
      if (p.variants) {
        p.variants.forEach((vr) => {
          if (vr.sizes) vr.sizes.forEach((s) => (totalStock += s.stock || 0));
        });
      }

      const isLowStock = totalStock <= 5;
      const stockBadgeClass = isLowStock ? 'pos-stock-tag low' : 'pos-stock-tag';
      const stockText = totalStock > 0 ? (isLowStock ? `Sắp hết: ${totalStock}` : `Kho: ${totalStock}`) : 'Hết hàng';

      return `
        <div class="pos-card" onclick="openPosVariantModal('${p.id || p._id}')">
          <div class="pos-card-thumb-wrap">
            <span class="${stockBadgeClass}">${stockText}</span>
            <img src="${img}" class="pos-card-thumb" alt="${p.name}" loading="lazy">
          </div>
          <div class="pos-card-body">
            <div class="pos-card-title">${p.name}</div>
            <div class="pos-card-footer">
              <div class="pos-card-price-val">${price.toLocaleString('vi-VN')}₫</div>
              <div class="pos-card-add-btn" title="Chọn phân loại">
                <i class="fas fa-plus"></i>
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join('');
}

// ==========================================================================
// QUẢN LÝ ĐA ĐƠN HÀNG (TREO ĐƠN / MULTI-TABS)
// ==========================================================================
function renderPosTabs() {
  const header = document.getElementById('posTabsHeader');
  if (!header) return;

  header.innerHTML =
    posTabs
      .map((tab, idx) => {
        const isActive = idx === activeTabIndex ? 'active' : '';
        const totalItems = tab.cart.reduce((sum, item) => sum + item.quantity, 0);
        return `
        <div class="pos-tab-item ${isActive}" onclick="switchPosTab(${idx})">
          <span>${tab.name}</span>
          <span class="pos-tab-count" id="tabCount${idx}">${totalItems}</span>
          ${
            posTabs.length > 1
              ? `<i class="fas fa-times" style="font-size: 10px; margin-left: 4px; opacity: 0.6;" onclick="closePosTab(${idx}, event)"></i>`
              : ''
          }
        </div>
      `;
      })
      .join('') +
    `
    <button class="pos-tab-new" onclick="addNewPosTab()" title="Mở đơn mới (Treo đơn hiện tại - F6)">
      <i class="fas fa-plus"></i>
    </button>
  `;
}

function switchPosTab(idx) {
  if (idx < 0 || idx >= posTabs.length) return;
  activeTabIndex = idx;
  renderPosTabs();

  // Nạp dữ liệu khách của tab
  const curTab = posTabs[activeTabIndex];
  const nameInput = document.getElementById('posCusName');
  const phoneInput = document.getElementById('posCusPhone');
  if (nameInput) nameInput.value = curTab.customerName || '';
  if (phoneInput) phoneInput.value = curTab.customerPhone || '';
  checkCustomerTier(curTab.customerPhone || '');

  renderCurrentCart();
}

function addNewPosTab() {
  if (posTabs.length >= 5) {
    showToast({ title: 'Giới hạn số tab', message: 'Bạn chỉ có thể mở tối đa 5 đơn hàng cùng lúc!', type: 'warning' });
    return;
  }
  const nextNum = posTabs.length + 1;
  posTabs.push({
    id: Date.now(),
    name: `Đơn #${nextNum}`,
    cart: [],
    customerName: '',
    customerPhone: '',
    tier: 'Khách vãng lai',
    paymentMethod: 'Tiền mặt',
    discount: 0
  });
  switchPosTab(posTabs.length - 1);
}

function closePosTab(idx, e) {
  if (e) e.stopPropagation();
  if (posTabs.length <= 1) return;
  if (posTabs[idx].cart.length > 0) {
    if (!confirm(`Đơn #${idx + 1} đang có sản phẩm, bạn có chắc chắn muốn hủy đơn này?`)) return;
  }
  posTabs.splice(idx, 1);
  if (activeTabIndex >= posTabs.length) activeTabIndex = posTabs.length - 1;
  renderPosTabs();
  renderCurrentCart();
}

function saveHoldOrder() {
  addNewPosTab();
}

function clearCurrentCart() {
  const curTab = posTabs[activeTabIndex];
  if (!curTab || curTab.cart.length === 0) return;
  if (confirm('Bạn có chắc chắn muốn xóa toàn bộ sản phẩm trong đơn hiện tại?')) {
    curTab.cart = [];
    renderPosTabs();
    renderCurrentCart();
  }
}

// ==========================================================================
// MODAL CHỌN BIẾN THỂ (MÀU SẮC & SIZE)
// ==========================================================================
function openPosVariantModal(id) {
  const p = posProducts.find((x) => String(x.id) === String(id) || String(x._id) === String(id));
  if (!p) return;

  currentModalProd = p;
  selectedVariantIdx = 0;
  selectedSizeName = '';
  selectedSizeStock = 0;

  const titleEl = document.getElementById('posModalProdTitle');
  if (titleEl) titleEl.innerText = p.name;

  renderModalVariantOptions();

  const modal = document.getElementById('posVariantModal');
  if (modal) modal.classList.add('open');
}

function renderModalVariantOptions() {
  const container = document.getElementById('posVariantContainer');
  if (!container || !currentModalProd) return;

  const variants = currentModalProd.variants || [];
  const curV = variants[selectedVariantIdx] || variants[0];

  let html = `
    <div style="margin-bottom: 16px;">
      <div class="pos-v-section-title">1. Chọn Màu Sắc</div>
      <div class="pos-v-options" id="modalColorOptions">
  `;

  variants.forEach((v, idx) => {
    const isSel = idx === selectedVariantIdx ? 'selected' : '';
    const colorHex = v.hex || v.colorCode || '#c5a059';
    html += `
      <div class="pos-v-btn ${isSel}" onclick="setModalVariant(${idx})">
        <span class="variant-color-dot" style="background: ${colorHex};"></span>
        <span>${v.color}</span>
      </div>
    `;
  });

  html += `
      </div>
    </div>
    <div>
      <div class="pos-v-section-title">2. Chọn Kích Cỡ (Size)</div>
      <div class="pos-v-options" id="modalSizeOptions">
  `;

  const sizes = curV?.sizes || [];
  if (sizes.length === 0) {
    html += `<span style="color: #ef4444; font-size: 13px;">Hết hàng</span>`;
  } else {
    // Tự động chọn size đầu tiên còn hàng nếu chưa chọn
    if (!selectedSizeName) {
      const firstAvailable = sizes.find((s) => s.stock > 0);
      if (firstAvailable) {
        selectedSizeName = firstAvailable.name || firstAvailable.size;
        selectedSizeStock = firstAvailable.stock;
      }
    }

    sizes.forEach((s) => {
      const sName = s.name || s.size;
      const isSel = selectedSizeName === sName ? 'selected' : '';
      const isOutOfStock = s.stock <= 0;
      const disabledStyle = isOutOfStock ? 'opacity: 0.35; pointer-events: none;' : '';

      html += `
        <div class="pos-v-btn ${isSel}" style="${disabledStyle}" onclick="setModalSize('${sName}', ${s.stock})">
          <span>Size ${sName}</span>
          <small style="color: ${s.stock > 0 ? '#38bdf8' : '#ef4444'}; font-size: 11px;">(${s.stock})</small>
        </div>
      `;
    });
  }

  html += `
      </div>
    </div>

    <div style="margin-top: 16px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: 13px; color: #94a3b8;">Đơn giá áp dụng:</span>
      <span style="font-size: 16px; font-weight: 800; color: #dfba73;">${(curV?.price || currentModalProd.price || 0).toLocaleString('vi-VN')}₫</span>
    </div>
  `;

  container.innerHTML = html;
}

function setModalVariant(idx) {
  selectedVariantIdx = idx;
  selectedSizeName = '';
  renderModalVariantOptions();
}

function setModalSize(sizeName, stock) {
  selectedSizeName = sizeName;
  selectedSizeStock = stock;
  renderModalVariantOptions();
}

function closePosModal() {
  const modal = document.getElementById('posVariantModal');
  if (modal) modal.classList.remove('open');
}

function confirmPosAddToCart() {
  if (!currentModalProd) return;
  const v = currentModalProd.variants[selectedVariantIdx];
  if (!v) return;

  if (!selectedSizeName) {
    showToast({ title: 'Chưa chọn size', message: 'Vui lòng chọn size kích cỡ trước khi thêm vào giỏ!', type: 'warning' });
    return;
  }

  const curTab = posTabs[activeTabIndex];
  const itemKey = `${currentModalProd.id || currentModalProd._id}-${v.color}-${selectedSizeName}`;

  const existing = curTab.cart.find((i) => i.key === itemKey);
  if (existing) {
    if (existing.quantity >= selectedSizeStock) {
      showToast({
        title: 'Tồn kho có hạn',
        message: `Số lượng trong kho của Size ${selectedSizeName} chỉ còn ${selectedSizeStock} cái!`,
        type: 'warning'
      });
      return;
    }
    existing.quantity++;
  } else {
    curTab.cart.push({
      key: itemKey,
      id: currentModalProd.id || currentModalProd._id,
      name: currentModalProd.name,
      price: v.price || currentModalProd.price,
      img: v.img || currentModalProd.image,
      color: v.color,
      colorHex: v.hex || v.colorCode || '#c5a059',
      size: selectedSizeName,
      maxStock: selectedSizeStock,
      quantity: 1
    });
  }

  closePosModal();
  renderPosTabs();
  renderCurrentCart();
}

// ==========================================================================
// QUẢN LÝ GIỎ HÀNG & TÍNH TIỀN
// ==========================================================================
function renderCurrentCart() {
  const curTab = posTabs[activeTabIndex];
  const cartContainer = document.getElementById('posCartItems');
  if (!cartContainer || !curTab) return;

  if (curTab.cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="pos-cart-empty">
        <i class="fas fa-shopping-bag"></i>
        <div style="font-weight: 700; color: #94a3b8; margin-bottom: 4px;">Giỏ hàng đang trống</div>
        <p>Chọn sản phẩm ở danh mục bên trái hoặc nhấn <strong>F2</strong> để tìm kiếm.</p>
      </div>
    `;
    updateCartTotals(0, 0);
    return;
  }

  let subtotal = 0;
  let totalQty = 0;

  cartContainer.innerHTML = curTab.cart
    .map((item, idx) => {
      const itemSubtotal = item.price * item.quantity;
      subtotal += itemSubtotal;
      totalQty += item.quantity;

      return `
      <div class="pos-item-card">
        <img src="${item.img}" class="pos-item-img" alt="${item.name}">
        <div class="pos-item-details">
          <div class="pos-item-name" title="${item.name}">${item.name}</div>
          <div class="pos-item-variant">
            <span class="variant-color-dot" style="background: ${item.colorHex};"></span>
            <span>${item.color}</span>
            <span>•</span>
            <strong style="color: #e2e8f0;">Size ${item.size}</strong>
          </div>
          <div class="pos-item-price">${item.price.toLocaleString('vi-VN')}₫</div>
        </div>

        <div class="pos-item-actions">
          <div class="pos-qty-group">
            <button class="btn-qty" onclick="changeItemQty(${idx}, -1)">
              <i class="fas fa-minus"></i>
            </button>
            <input type="text" class="input-qty" value="${item.quantity}" readonly>
            <button class="btn-qty" onclick="changeItemQty(${idx}, 1)">
              <i class="fas fa-plus"></i>
            </button>
          </div>
          <button class="btn-item-del" onclick="removeItemFromCart(${idx})" title="Xóa món">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
    })
    .join('');

  updateCartTotals(subtotal, totalQty);
}

function changeItemQty(idx, delta) {
  const curTab = posTabs[activeTabIndex];
  const item = curTab.cart[idx];
  if (!item) return;

  if (delta > 0 && item.quantity >= item.maxStock) {
    showToast({ title: 'Tồn kho có hạn', message: `Kho chỉ còn ${item.maxStock} sản phẩm cho phân loại này!`, type: 'warning' });
    return;
  }

  item.quantity += delta;
  if (item.quantity <= 0) {
    curTab.cart.splice(idx, 1);
  }

  renderPosTabs();
  renderCurrentCart();
}

function removeItemFromCart(idx) {
  const curTab = posTabs[activeTabIndex];
  curTab.cart.splice(idx, 1);
  renderPosTabs();
  renderCurrentCart();
}

function updateCartTotals(subtotal, totalQty) {
  const curTab = posTabs[activeTabIndex];
  const discount = curTab ? curTab.discount || 0 : 0;
  const finalTotal = Math.max(0, subtotal - discount);

  const setT = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
  };

  setT('posTotalQty', totalQty);
  setT('posSubtotalPrice', `${subtotal.toLocaleString('vi-VN')}₫`);
  setT('posDiscountPrice', `-${discount.toLocaleString('vi-VN')}₫`);
  setT('posTotalPrice', `${finalTotal.toLocaleString('vi-VN')}₫`);

  // Cập nhật mã VietQR động nếu đang chọn Banking
  updateVietQrCode(finalTotal);
}

// 8. Chọn phương thức thanh toán
function selectPaymentMethod(method, el) {
  const curTab = posTabs[activeTabIndex];
  if (curTab) curTab.paymentMethod = method;

  document.querySelectorAll('.payment-pill').forEach((pill) => {
    pill.classList.remove('selected');
  });
  if (el) el.classList.add('selected');

  const qrBox = document.getElementById('posQrBox');
  if (method === 'Banking') {
    if (qrBox) qrBox.classList.add('active');
    const total = calculateCurrentTotal();
    updateVietQrCode(total);
  } else {
    if (qrBox) qrBox.classList.remove('active');
  }
}

function calculateCurrentTotal() {
  const curTab = posTabs[activeTabIndex];
  if (!curTab) return 0;
  const subtotal = curTab.cart.reduce((s, i) => s + i.price * i.quantity, 0);
  return Math.max(0, subtotal - (curTab.discount || 0));
}

function updateVietQrCode(amount) {
  const qrImg = document.getElementById('posQrImg');
  if (!qrImg) return;
  const orderCode = `POS${Date.now().toString().slice(-6)}`;
  qrImg.src = `https://img.vietqr.io/image/Agribank-5490205425168-compact2.png?amount=${amount}&addInfo=${encodeURIComponent('MoonLight ' + orderCode)}&accountName=VU%20PHAM%20LUAN`;
}

// 9. Kiểm tra hạng khách hàng tự động
function checkCustomerTier(phone) {
  const tierBadge = document.getElementById('posCusTierBadge');
  if (!tierBadge) return;

  const p = phone.trim();
  if (!p) {
    tierBadge.innerText = 'Khách vãng lai';
    tierBadge.style.color = '#dfba73';
    return;
  }

  const customers = JSON.parse(localStorage.getItem('moonlight_customers')) || [];
  const found = customers.find((c) => c.phone === p);

  if (found) {
    tierBadge.innerText = `★ ${found.tier || 'Thân thiết'}`;
    const nameInput = document.getElementById('posCusName');
    if (nameInput && !nameInput.value) nameInput.value = found.name;

    // Ưu đãi phân hạng
    const curTab = posTabs[activeTabIndex];
    if (curTab) {
      const subtotal = curTab.cart.reduce((s, i) => s + i.price * i.quantity, 0);
      if (found.tier === 'VIP') {
        curTab.discount = Math.floor(subtotal * 0.1); // Giảm 10% cho VIP
      } else if (found.tier === 'Thân thiết') {
        curTab.discount = Math.floor(subtotal * 0.05); // Giảm 5% cho Thân thiết
      }
      renderCurrentCart();
    }
  } else {
    tierBadge.innerText = 'Khách mới';
  }
}

// ==========================================================================
// HOÀN TẤT ĐƠN HÀNG & IN HÓA ĐƠN
// ==========================================================================
async function processPosCheckout() {
  const curTab = posTabs[activeTabIndex];
  if (!curTab || curTab.cart.length === 0) {
    showToast({ title: 'Giỏ hàng trống', message: 'Vui lòng chọn ít nhất 1 sản phẩm trước khi thanh toán.', type: 'warning' });
    return;
  }

  const nameInput = document.getElementById('posCusName');
  const phoneInput = document.getElementById('posCusPhone');
  const cusName = (nameInput?.value || '').trim() || 'Khách lẻ tại quầy';
  const cusPhone = (phoneInput?.value || '').trim() || '0000000000';

  const subtotal = curTab.cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = curTab.discount || 0;
  const total = Math.max(0, subtotal - discount);
  const orderCode = `ML-POS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
  const staffName = document.getElementById('staffName')?.innerText || 'Thu Ngân 01';

  const orderData = {
    orderCode,
    customer: {
      name: cusName,
      phone: cusPhone,
      address: 'Mua trực tiếp tại cửa hàng (127 Tăng Bạt Hổ, Bảo Lộc)',
      note: `Thu ngân: ${staffName}`
    },
    items: curTab.cart.map((i) => ({
      productId: i.id,
      productName: i.name,
      variant: `${i.color} - Size ${i.size}`,
      img: i.img,
      price: i.price,
      quantity: i.quantity,
      subtotal: i.price * i.quantity
    })),
    subtotal,
    discount,
    shippingFee: 0,
    total,
    paymentMethod: curTab.paymentMethod === 'Banking' ? 'banking' : 'cod',
    status: 'completed',
    processedBy: staffName
  };

  // 1. Gửi lên Backend REST API
  try {
    if (window.MoonlightAPI) {
      await window.MoonlightAPI.createOrder(orderData);
    }
  } catch (err) {
    console.warn('[POS Checkout] Không gửi được API, chuyển sang lưu LocalStorage:', err.message);
  }

  // 2. Lưu vào LocalStorage
  let orders = JSON.parse(localStorage.getItem('moonlight_orders')) || [];
  orders.unshift({
    id: orderCode,
    ...orderData,
    date: new Date().toLocaleString('vi-VN'),
    isPaid: true
  });
  localStorage.setItem('moonlight_orders', JSON.stringify(orders));

  // 3. Trừ tồn kho cục bộ
  curTab.cart.forEach((c) => {
    const prod = posProducts.find((p) => String(p.id) === String(c.id) || String(p._id) === String(c.id));
    if (prod && prod.variants) {
      const v = prod.variants.find((vr) => vr.color === c.color);
      if (v && v.sizes) {
        const s = v.sizes.find((sz) => (sz.name || sz.size) === c.size);
        if (s) s.stock = Math.max(0, s.stock - c.quantity);
      }
    }
  });
  localStorage.setItem('moonlight_products', JSON.stringify(posProducts));

  // 4. Mở hóa đơn in nhiệt
  showReceiptModal(orderData, staffName);

  // 5. Đặt lại giỏ hàng
  curTab.cart = [];
  curTab.discount = 0;
  if (nameInput) nameInput.value = '';
  if (phoneInput) phoneInput.value = '';

  renderPosTabs();
  renderCurrentCart();
  renderPosProductGrid();
}

// 10. Hiển thị modal hóa đơn
function showReceiptModal(order, staffName) {
  const setT = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
  };

  setT('recOrderCode', `#${order.orderCode}`);
  setT('recDate', new Date().toLocaleString('vi-VN'));
  setT('recStaff', staffName);
  setT('recCustomer', `${order.customer.name} (${order.customer.phone})`);
  setT('recPaymentMethod', order.paymentMethod === 'banking' ? 'Agribank QR' : 'Tiền mặt');

  const itemsBody = document.getElementById('recItemsBody');
  if (itemsBody) {
    itemsBody.innerHTML = order.items
      .map(
        (i) => `
      <tr>
        <td>
          <div style="font-weight:700;">${i.productName}</div>
          <small style="color:#64748b;">${i.variant}</small>
        </td>
        <td style="text-align:center;">${i.quantity}</td>
        <td style="text-align:right;">${i.price.toLocaleString('vi-VN')}₫</td>
        <td style="text-align:right; font-weight:700;">${i.subtotal.toLocaleString('vi-VN')}₫</td>
      </tr>
    `
      )
      .join('');
  }

  setT('recSubtotal', `${order.subtotal.toLocaleString('vi-VN')}₫`);
  setT('recDiscount', `-${order.discount.toLocaleString('vi-VN')}₫`);
  setT('recTotal', `${order.total.toLocaleString('vi-VN')}₫`);

  const modal = document.getElementById('receiptModal');
  if (modal) modal.classList.add('open');
}

function closeReceiptModal() {
  const modal = document.getElementById('receiptModal');
  if (modal) modal.classList.remove('open');
}

// ==========================================================================
// PHÍM TẮT & HỖ TRỢ BÁN HÀNG
// ==========================================================================
function setupKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    // F2: Tìm kiếm sản phẩm
    if (e.key === 'F2') {
      e.preventDefault();
      const input = document.getElementById('posSearchInput');
      if (input) {
        input.focus();
        input.select();
      }
    }

    // F4: Nhập số điện thoại khách
    if (e.key === 'F4') {
      e.preventDefault();
      const phone = document.getElementById('posCusPhone');
      if (phone) phone.focus();
    }

    // F6: Treo đơn / Đơn mới
    if (e.key === 'F6') {
      e.preventDefault();
      addNewPosTab();
    }

    // F8: Hủy giỏ hàng
    if (e.key === 'F8') {
      e.preventDefault();
      clearCurrentCart();
    }

    // F9: Thanh toán & In hóa đơn
    if (e.key === 'F9') {
      e.preventDefault();
      processPosCheckout();
    }

    // Escape: Đóng modal
    if (e.key === 'Escape') {
      closePosModal();
      closeReceiptModal();
      closeShortcutsModal();
    }
  });
}

function openShortcutsModal() {
  const modal = document.getElementById('shortcutsModal');
  if (modal) modal.classList.add('open');
}

function closeShortcutsModal() {
  const modal = document.getElementById('shortcutsModal');
  if (modal) modal.classList.remove('open');
}

// ==========================================================================
// THÔNG BÁO TOAST & GHI ĐÈ WINDOW.ALERT
// ==========================================================================
function showToast(arg1, arg2, arg3) {
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

  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);
  }

  const icons = {
    success: 'fas fa-check-circle',
    warning: 'fas fa-exclamation-triangle',
    error: 'fas fa-times-circle',
    info: 'fas fa-info-circle'
  };

  const item = document.createElement('div');
  item.className = `toast-item ${type}`;
  item.innerHTML = `
    <i class="${icons[type] || icons.info} toast-icon"></i>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-desc">${message}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
  `;

  container.appendChild(item);
  setTimeout(() => {
    if (item && item.parentElement) item.remove();
  }, 4000);
}

if (typeof window !== 'undefined') {
  window.alert = function (message) {
    const msgStr = String(message || '');
    let type = 'info';
    let title = 'Thông báo';
    if (msgStr.toLowerCase().includes('thành công')) {
      type = 'success';
      title = 'Thành công';
    } else if (msgStr.toLowerCase().includes('lỗi') || msgStr.toLowerCase().includes('không thể') || msgStr.toLowerCase().includes('hết hàng')) {
      type = 'error';
      title = 'Cảnh báo';
    } else if (msgStr.toLowerCase().includes('vui lòng') || msgStr.toLowerCase().includes('chỉ còn')) {
      type = 'warning';
      title = 'Lưu ý';
    }
    showToast({ title, message: msgStr, type });
  };
}