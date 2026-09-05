/**
 * 🌙 MoonLight Luxury — Catalog & Filter Engine (catalog.js)
 * Tích hợp toàn diện: MoonlightAPI (MongoDB), Smart Size Advisor (Chiều cao & Cân nặng),
 * Bộ lọc đa tiêu chí (Danh mục, Giới tính, Size, Giá, Kiểu dáng), URL Deep Linking,
 * Quick View, Wishlist, và Giỏ hàng đồng bộ.
 */

// ==========================================================================
// 1. DỮ LIỆU SẢN PHẨM MẪU CHUẨN LUXURY (FALLBACK TOÀN DIỆN)
// ==========================================================================
const CATALOG_FALLBACK_PRODUCTS = [
  {
    _id: '67c3db00d57e603b70b50001',
    id: 1,
    name: 'Áo Vest Luxury Slim Fit Hoàng Gia',
    category: 'vest',
    type: 'vest',
    gender: 'Nam',
    style: 'Slimfit',
    price: 2450000,
    originalPrice: 2800000,
    sold: 48,
    rating: 5.0,
    salePercent: 12,
    badge: 'HOT',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80',
    description: 'Chất liệu len Ý dệt thủ công cao cấp, form dáng Slimfit tôn vẻ lịch lãm và quý phái.',
    variants: [
      {
        color: 'Đen Hoàng Gia',
        colorCode: '#000000',
        img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80',
        price: 2450000,
        sizes: [
          { size: 'M', stock: 15 },
          { size: 'L', stock: 20 },
          { size: 'XL', stock: 10 }
        ]
      },
      {
        color: 'Xanh Navy Đêm',
        colorCode: '#1a2a3a',
        img: 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=800&auto=format&fit=crop&q=80',
        price: 2450000,
        sizes: [
          { size: 'M', stock: 12 },
          { size: 'L', stock: 18 }
        ]
      }
    ]
  },
  {
    _id: '67c3db00d57e603b70b50002',
    id: 2,
    name: 'Áo Sơ Mi Lụa Mulberry MoonLight',
    category: 'somi',
    type: 'somi',
    gender: 'Nam',
    style: 'Regular fit',
    price: 890000,
    originalPrice: 890000,
    sold: 125,
    rating: 4.9,
    salePercent: 0,
    badge: 'NEW',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
    description: 'Vải lụa tơ tằm Mulberry 100%, bóng nhẹ tinh tế, mềm mượt thoáng khí tối đa.',
    variants: [
      {
        color: 'Trắng Ngọc Trai',
        colorCode: '#f8fafc',
        img: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
        price: 890000,
        sizes: [
          { size: 'S', stock: 25 },
          { size: 'M', stock: 35 },
          { size: 'L', stock: 30 }
        ]
      }
    ]
  },
  {
    _id: '67c3db00d57e603b70b50003',
    id: 3,
    name: 'Áo Polo Dệt Kim Diamond Knit',
    category: 'polo',
    type: 'polo',
    gender: 'Nam',
    style: 'Regular fit',
    price: 650000,
    originalPrice: 750000,
    sold: 210,
    rating: 4.8,
    salePercent: 15,
    badge: 'BEST SELLER',
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
    description: 'Dệt kim sợi cotton Pima cao cấp, họa tiết kim cương dập chìm sang trọng.',
    variants: [
      {
        color: 'Be Ánh Kim',
        colorCode: '#d2b48c',
        img: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
        price: 650000,
        sizes: [
          { size: 'M', stock: 40 },
          { size: 'L', stock: 50 },
          { size: 'XL', stock: 15 }
        ]
      },
      {
        color: 'Đen Obsidian',
        colorCode: '#111827',
        img: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80',
        price: 650000,
        sizes: [
          { size: 'S', stock: 20 },
          { size: 'M', stock: 30 },
          { size: 'L', stock: 25 }
        ]
      }
    ]
  },
  {
    _id: '67c3db00d57e603b70b50004',
    id: 4,
    name: 'Quần Âu May Đo Sartorial Cao Cấp',
    category: 'quanau',
    type: 'quanau',
    gender: 'Nam',
    style: 'Slimfit',
    price: 950000,
    originalPrice: 950000,
    sold: 95,
    rating: 4.9,
    salePercent: 0,
    badge: '',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
    description: 'Vải dệt chéo chống nhăn, cạp đai Gurkha mang đậm phong cách quý ông cổ điển.',
    variants: [
      {
        color: 'Xám Tro',
        colorCode: '#708090',
        img: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
        price: 950000,
        sizes: [
          { size: '29', stock: 15 },
          { size: '30', stock: 20 },
          { size: '31', stock: 25 },
          { size: '32', stock: 22 }
        ]
      }
    ]
  },
  {
    _id: '67c3db00d57e603b70b50005',
    id: 5,
    name: 'Áo Thun Pima Cotton Heavyweight Oversize',
    category: 'aothun',
    type: 'aothun',
    gender: 'Unisex',
    style: 'Oversize',
    price: 390000,
    originalPrice: 450000,
    sold: 340,
    rating: 4.9,
    salePercent: 13,
    badge: 'NEW',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    description: 'Chất liệu 100% Pima Cotton định lượng 260gsm dày dặn, đứng form và mềm mịn.',
    variants: [
      {
        color: 'Trắng Sữa',
        colorCode: '#f1f5f9',
        img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
        price: 390000,
        sizes: [
          { size: 'S', stock: 30 },
          { size: 'M', stock: 45 },
          { size: 'L', stock: 50 },
          { size: 'XL', stock: 25 }
        ]
      },
      {
        color: 'Đen Than',
        colorCode: '#0f172a',
        img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
        price: 390000,
        sizes: [
          { size: 'M', stock: 35 },
          { size: 'L', stock: 40 },
          { size: 'XL', stock: 20 }
        ]
      }
    ]
  },
  {
    _id: '67c3db00d57e603b70b50006',
    id: 6,
    name: 'Áo Blazer Nữ Parisian Chic Đẳng Cấp',
    category: 'vest',
    type: 'vest',
    gender: 'Nu',
    style: 'Regular fit',
    price: 1850000,
    originalPrice: 2200000,
    sold: 67,
    rating: 5.0,
    salePercent: 15,
    badge: 'HOT',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    description: 'Phong cách quý cô Paris thanh lịch, đường may sắc nét kết hợp khuy kim mạ vàng 18K.',
    variants: [
      {
        color: 'Be Kem Sữa',
        colorCode: '#fef3c7',
        img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
        price: 1850000,
        sizes: [
          { size: 'S', stock: 20 },
          { size: 'M', stock: 25 },
          { size: 'L', stock: 15 }
        ]
      }
    ]
  },
  {
    _id: '67c3db00d57e603b70b50007',
    id: 7,
    name: 'Đầm Dạ Hội Lụa Satin Moonlit Night',
    category: 'dam',
    type: 'dam',
    gender: 'Nu',
    style: 'Slimfit',
    price: 2150000,
    originalPrice: 2500000,
    sold: 42,
    rating: 5.0,
    salePercent: 14,
    badge: 'LUXURY',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80',
    description: 'Lụa Satin cao cấp bóng rủ tự nhiên, thiết kế xẻ tà quyến rũ cho các đêm tiệc thượng lưu.',
    variants: [
      {
        color: 'Xanh Emerald',
        colorCode: '#065f46',
        img: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80',
        price: 2150000,
        sizes: [
          { size: 'S', stock: 15 },
          { size: 'M', stock: 20 },
          { size: 'L', stock: 10 }
        ]
      }
    ]
  },
  {
    _id: '67c3db00d57e603b70b50008',
    id: 8,
    name: 'Quần Jeans Selvedge Denim Cổ Điển',
    category: 'quanjeans',
    type: 'quanjeans',
    gender: 'Nam',
    style: 'Classic',
    price: 1150000,
    originalPrice: 1150000,
    sold: 110,
    rating: 4.8,
    salePercent: 0,
    badge: '',
    image: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80',
    description: 'Vải Denim dệt thoi mép đỏ Nhật Bản 14oz, bền bỉ và tạo nếp phai màu độc bản theo thời gian.',
    variants: [
      {
        color: 'Xanh Indigo Thô',
        colorCode: '#1e3a8a',
        img: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80',
        price: 1150000,
        sizes: [
          { size: '29', stock: 15 },
          { size: '30', stock: 30 },
          { size: '31', stock: 25 },
          { size: '32', stock: 20 }
        ]
      }
    ]
  },
  {
    _id: '67c3db00d57e603b70b50009',
    id: 9,
    name: 'Chân Váy Xếp Ly Midi Ánh Kim',
    category: 'vay',
    type: 'vay',
    gender: 'Nu',
    style: 'Regular fit',
    price: 780000,
    originalPrice: 890000,
    sold: 83,
    rating: 4.9,
    salePercent: 12,
    badge: '',
    image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&auto=format&fit=crop&q=80',
    description: 'Xếp ly dập nhiệt định hình vĩnh viễn, chuyển động mềm mại tôn nét nữ tính thanh tao.',
    variants: [
      {
        color: 'Vàng Champagne',
        colorCode: '#dfba73',
        img: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&auto=format&fit=crop&q=80',
        price: 780000,
        sizes: [
          { size: 'S', stock: 18 },
          { size: 'M', stock: 25 }
        ]
      }
    ]
  },
  {
    _id: '67c3db00d57e603b70b50010',
    id: 10,
    name: 'Áo Sơ Mi Nữ Cổ Nơ Lụa Tơ Tằm',
    category: 'somi',
    type: 'somi',
    gender: 'Nu',
    style: 'Slimfit',
    price: 920000,
    originalPrice: 920000,
    sold: 90,
    rating: 4.8,
    salePercent: 0,
    badge: 'NEW',
    image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&auto=format&fit=crop&q=80',
    description: 'Thiết kế nơ cổ tiểu thư quý phái, chất liệu lụa dệt mềm mại nâng niu làn da.',
    variants: [
      {
        color: 'Hồng Phấn Ánh Trăng',
        colorCode: '#fce7f3',
        img: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&auto=format&fit=crop&q=80',
        price: 920000,
        sizes: [
          { size: 'S', stock: 25 },
          { size: 'M', stock: 30 }
        ]
      }
    ]
  },
  {
    _id: '67c3db00d57e603b70b50011',
    id: 11,
    name: 'Thắt Lưng Da Bò Ý Khóa Vàng MoonLight',
    category: 'phukien',
    type: 'phukien',
    gender: 'Nam',
    style: 'Classic',
    price: 550000,
    originalPrice: 650000,
    sold: 180,
    rating: 4.9,
    salePercent: 15,
    badge: 'ACCESSORY',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    description: 'Da bò thuộc thảo mộc nhập khẩu Ý, mặt khóa hợp kim mạ vàng chống xước tinh xảo.',
    variants: [
      {
        color: 'Đen Tuyển',
        colorCode: '#000000',
        img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
        price: 550000,
        sizes: [
          { size: 'Freesize', stock: 100 }
        ]
      }
    ]
  },
  {
    _id: '67c3db00d57e603b70b50012',
    id: 12,
    name: 'Áo Hoodie Nỉ Bông Unisex MoonLight Essential',
    category: 'aothun',
    type: 'aothun',
    gender: 'Unisex',
    style: 'Oversize',
    price: 620000,
    originalPrice: 700000,
    sold: 145,
    rating: 4.9,
    salePercent: 11,
    badge: 'BEST SELLER',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
    description: 'Chất nỉ bông 380gsm siêu ấm, mũ 2 lớp đứng form in logo dạ quang MoonLight.',
    variants: [
      {
        color: 'Xám Khói',
        colorCode: '#94a3b8',
        img: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
        price: 620000,
        sizes: [
          { size: 'M', stock: 25 },
          { size: 'L', stock: 35 },
          { size: 'XL', stock: 30 },
          { size: 'XXL', stock: 15 }
        ]
      }
    ]
  }
];

// ==========================================================================
// 2. TRẠNG THÁI BỘ LỌC TOÀN CỤC (GLOBAL FILTER STATE)
// ==========================================================================
const catalogState = {
  allProducts: [],
  filteredProducts: [],
  gender: 'all',          // 'all' | 'Nam' | 'Nu' | 'Unisex'
  category: 'all',        // 'all' | 'vest' | 'somi' | 'polo' | 'aothun' | 'quanau' | 'quanjeans' | 'dam' | 'vay' | 'phukien'
  minPrice: null,
  maxPrice: null,
  selectedSizes: new Set(),
  selectedStyles: new Set(),
  searchKeyword: '',
  sortBy: 'featured',     // 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'bestseller' | 'rating'
  viewMode: 'grid-3',     // 'grid-3' | 'grid-4' | 'grid-list'
  
  // Smart Size Advisor
  advisorGender: 'Nam',
  advisorHeight: 172,
  advisorWeight: 68,
  advisorFit: 'regular',  // 'slim' | 'regular' | 'loose'
  advisorSizeResult: 'L',
  advisorActive: false
};

// ==========================================================================
// 3. THUẬT TOÁN TÍNH SIZE THÔNG MINH THEO CHIỀU CAO & CÂN NẶNG
// ==========================================================================
function calculateSmartSize(gender, height, weight, fit) {
  let baseSize = 'L';

  if (gender === 'Nam') {
    if (height < 165) {
      if (weight < 53) baseSize = 'S';
      else if (weight <= 62) baseSize = 'M';
      else baseSize = 'L';
    } else if (height <= 172) {
      if (weight < 58) baseSize = 'S';
      else if (weight <= 67) baseSize = 'M';
      else if (weight <= 76) baseSize = 'L';
      else baseSize = 'XL';
    } else if (height <= 178) {
      if (weight < 64) baseSize = 'M';
      else if (weight <= 74) baseSize = 'L';
      else if (weight <= 84) baseSize = 'XL';
      else baseSize = 'XXL';
    } else if (height <= 185) {
      if (weight < 70) baseSize = 'L';
      else if (weight <= 82) baseSize = 'XL';
      else baseSize = 'XXL';
    } else {
      if (weight < 78) baseSize = 'XL';
      else baseSize = 'XXL';
    }
  } else {
    // Nữ
    if (height < 155) {
      if (weight < 45) baseSize = 'S';
      else if (weight <= 52) baseSize = 'M';
      else baseSize = 'L';
    } else if (height <= 162) {
      if (weight < 48) baseSize = 'S';
      else if (weight <= 55) baseSize = 'M';
      else if (weight <= 62) baseSize = 'L';
      else baseSize = 'XL';
    } else if (height <= 170) {
      if (weight < 53) baseSize = 'S';
      else if (weight <= 60) baseSize = 'M';
      else if (weight <= 68) baseSize = 'L';
      else baseSize = 'XL';
    } else {
      if (weight < 58) baseSize = 'M';
      else if (weight <= 68) baseSize = 'L';
      else baseSize = 'XL';
    }
  }

  // Điều chỉnh theo form dáng mong muốn
  const sizeOrder = ['S', 'M', 'L', 'XL', 'XXL'];
  let curIndex = sizeOrder.indexOf(baseSize);

  if (fit === 'loose' && curIndex < sizeOrder.length - 1) {
    baseSize = sizeOrder[curIndex + 1];
  } else if (fit === 'slim' && curIndex > 0) {
    baseSize = sizeOrder[curIndex - 1];
  }

  return baseSize;
}

// Cập nhật giao diện Advisor theo thời gian thực
function updateAdvisorUI() {
  const size = calculateSmartSize(
    catalogState.advisorGender,
    catalogState.advisorHeight,
    catalogState.advisorWeight,
    catalogState.advisorFit
  );
  catalogState.advisorSizeResult = size;

  const resultEl = document.getElementById('advisorResultSize');
  const hintEl = document.getElementById('advisorResultHint');
  const hText = document.getElementById('advisorHeightVal');
  const wText = document.getElementById('advisorWeightVal');

  if (resultEl) resultEl.innerText = `SIZE ${size}`;
  if (hText) hText.innerText = `${catalogState.advisorHeight} cm`;
  if (wText) wText.innerText = `${catalogState.advisorWeight} kg`;

  const fitName = catalogState.advisorFit === 'slim' ? 'Ôm vừa người' : (catalogState.advisorFit === 'loose' ? 'Rộng rãi thoải mái' : 'Chuẩn form vừa vặn');
  if (hintEl) {
    hintEl.innerText = `Độ phù hợp 98% cho ${catalogState.advisorGender.toLowerCase()}, ${catalogState.advisorHeight}cm / ${catalogState.advisorWeight}kg (${fitName}).`;
  }
}

// ==========================================================================
// 4. ENGINE LỌC & SẮP XẾP SẢN PHẨM (FILTER & SORT ENGINE)
// ==========================================================================
function applyFiltersAndRender() {
  let list = [...catalogState.allProducts];

  // 1. Lọc Giới tính
  if (catalogState.gender !== 'all') {
    list = list.filter(p => p.gender === catalogState.gender || p.gender === 'Unisex');
  }

  // 2. Lọc Danh mục
  if (catalogState.category !== 'all') {
    list = list.filter(p => p.category === catalogState.category || p.type === catalogState.category);
  }

  // 3. Lọc Khoảng giá
  if (catalogState.minPrice !== null) {
    list = list.filter(p => p.price >= catalogState.minPrice);
  }
  if (catalogState.maxPrice !== null) {
    list = list.filter(p => p.price <= catalogState.maxPrice);
  }

  // 4. Lọc Size đã chọn (bao gồm size từ Smart Advisor)
  if (catalogState.selectedSizes.size > 0) {
    list = list.filter(p => {
      if (!p.variants || p.variants.length === 0) return true;
      return p.variants.some(v => 
        v.sizes && v.sizes.some(s => catalogState.selectedSizes.has(s.size) && (s.stock === undefined || s.stock > 0))
      );
    });
  }

  // 5. Lọc Kiểu dáng (Style)
  if (catalogState.selectedStyles.size > 0) {
    list = list.filter(p => {
      const pStyle = (p.style || '').toLowerCase();
      const pDesc = (p.description || '').toLowerCase();
      for (const st of catalogState.selectedStyles) {
        const stLower = st.toLowerCase();
        if (pStyle.includes(stLower) || pDesc.includes(stLower)) return true;
      }
      return false;
    });
  }

  // 6. Tìm kiếm từ khóa
  if (catalogState.searchKeyword) {
    const kw = catalogState.searchKeyword.toLowerCase();
    list = list.filter(p => 
      p.name.toLowerCase().includes(kw) || 
      (p.description && p.description.toLowerCase().includes(kw)) ||
      (p.category && p.category.toLowerCase().includes(kw))
    );
  }

  // 7. Sắp xếp (Sorting)
  if (catalogState.sortBy === 'price-asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (catalogState.sortBy === 'price-desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (catalogState.sortBy === 'newest') {
    list.sort((a, b) => (new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
  } else if (catalogState.sortBy === 'bestseller') {
    list.sort((a, b) => (b.sold || 0) - (a.sold || 0));
  } else if (catalogState.sortBy === 'rating') {
    list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  catalogState.filteredProducts = list;

  renderProductsGrid(list);
  renderActiveFiltersBar();
  updateCategoryCounts();
  syncURLWithState();
}

// ==========================================================================
// 5. RENDER LƯỚI SẢN PHẨM & CARD CHI TIẾT
// ==========================================================================
function renderProductsGrid(products) {
  const grid = document.getElementById('catalogProductsGrid');
  const countEl = document.getElementById('catalogResultsCount');
  if (!grid) return;

  if (countEl) {
    countEl.innerHTML = `Tìm thấy <strong>${products.length}</strong> sản phẩm`;
  }

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="catalog-empty-state">
        <div class="catalog-empty-icon"><i class="fas fa-search"></i></div>
        <div class="catalog-empty-title">Không tìm thấy sản phẩm phù hợp</div>
        <div class="catalog-empty-desc">Rất tiếc, không có sản phẩm nào khớp với tiêu chí bạn đã lọc. Hãy thử nới lỏng bộ lọc hoặc xóa bớt size đã chọn.</div>
        <button class="btn-reset-filters" onclick="resetAllFilters()" style="margin: 0 auto; background: var(--catalog-gold); color: #000; padding: 10px 24px; border-radius: 8px; font-weight: 700;">
          <i class="fas fa-rotate-right"></i> Xóa Tất Cả Bộ Lọc
        </button>
      </div>
    `;
    return;
  }

  const wishlist = getWishlistIds();

  grid.innerHTML = products.map((p, idx) => {
    const isLiked = wishlist.includes(String(p._id || p.id));
    const displayPrice = p.price ? p.price.toLocaleString('vi-VN') + 'đ' : 'Liên hệ';
    const oldPrice = p.originalPrice && p.originalPrice > p.price ? p.originalPrice.toLocaleString('vi-VN') + 'đ' : '';
    
    // Thu thập danh sách size có sẵn
    const allSizes = [];
    if (p.variants) {
      p.variants.forEach(v => {
        if (v.sizes) {
          v.sizes.forEach(s => {
            if (!allSizes.includes(s.size)) allSizes.push(s.size);
          });
        }
      });
    }

    const sizesHtml = allSizes.slice(0, 5).map(sz => {
      const isAdvised = catalogState.selectedSizes.has(sz);
      return `<span class="card-size-tag ${isAdvised ? 'highlight' : ''}">${sz}</span>`;
    }).join('');

    // Chấm màu
    const swatchesHtml = (p.variants || []).slice(0, 4).map((v, vIdx) => `
      <span class="swatch-dot ${vIdx === 0 ? 'active' : ''}" 
            style="background: ${v.colorCode || '#000'};" 
            title="${v.color || ''}"
            onclick="switchCardVariant(event, '${p._id || p.id}', '${v.img || p.image}', '${v.price ? v.price.toLocaleString('vi-VN') + 'đ' : displayPrice}')">
      </span>
    `).join('');

    let badgeClass = 'new';
    let badgeText = p.badge || (p.salePercent ? `-${p.salePercent}%` : '');
    if (p.badge === 'HOT') badgeClass = 'hot';
    if (p.salePercent) badgeClass = 'sale';

    return `
      <div class="catalog-card" data-id="${p._id || p.id}">
        <div class="catalog-card-media">
          ${badgeText ? `<span class="card-badge-tag ${badgeClass}">${badgeText}</span>` : ''}
          <button class="btn-card-wishlist ${isLiked ? 'active' : ''}" onclick="toggleWishlist('${p._id || p.id}', event)" title="Lưu vào yêu thích">
            <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i>
          </button>
          <img src="${p.image || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800'}" alt="${p.name}" class="catalog-card-img" id="img-${p._id || p.id}" loading="lazy">
          
          <div class="card-quick-actions">
            <button class="btn-quick-action view" onclick="openQuickView('${p._id || p.id}')">
              <i class="fas fa-eye"></i> Xem Nhanh
            </button>
            <button class="btn-quick-action cart" onclick="quickAddToCart('${p._id || p.id}')">
              <i class="fas fa-bag-shopping"></i> Thêm Giỏ
            </button>
          </div>
        </div>

        <div class="catalog-card-body">
          <div class="card-cat-gender">${p.gender === 'Nu' ? 'NỮ' : (p.gender === 'Nam' ? 'NAM' : 'UNISEX')} • ${formatCatName(p.category)}</div>
          <a href="product.html?id=${p._id || p.id}" class="card-product-name" title="${p.name}">${p.name}</a>
          
          <div class="card-rating-sold">
            <span class="card-stars"><i class="fas fa-star"></i> ${p.rating || 5.0}</span>
            <span>•</span>
            <span>Đã bán ${p.sold || 0}</span>
          </div>

          ${swatchesHtml ? `<div class="card-swatches">${swatchesHtml}</div>` : ''}
          ${sizesHtml ? `<div class="card-sizes-row">${sizesHtml}</div>` : ''}

          <div class="card-price-row">
            <span class="card-price-current" id="price-${p._id || p.id}">${displayPrice}</span>
            ${oldPrice ? `<span class="card-price-original">${oldPrice}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Đổi ảnh và giá card khi bấm chọn chấm màu
function switchCardVariant(e, pId, imgUrl, priceStr) {
  e.stopPropagation();
  const card = document.querySelector(`.catalog-card[data-id="${pId}"]`);
  if (!card) return;

  const imgEl = document.getElementById(`img-${pId}`);
  const priceEl = document.getElementById(`price-${pId}`);
  if (imgEl && imgUrl) imgEl.src = imgUrl;
  if (priceEl && priceStr) priceEl.innerText = priceStr;

  card.querySelectorAll('.swatch-dot').forEach(d => d.classList.remove('active'));
  e.target.classList.add('active');
}

// ==========================================================================
// 6. THANH TAG BỘ LỌC ĐANG ÁP DỤNG (ACTIVE FILTER CHIPS)
// ==========================================================================
function renderActiveFiltersBar() {
  const bar = document.getElementById('activeFiltersBar');
  if (!bar) return;

  const chips = [];

  if (catalogState.gender !== 'all') {
    chips.push({
      label: `Giới tính: ${catalogState.gender === 'Nu' ? 'Nữ' : catalogState.gender}`,
      clear: () => setGenderFilter('all')
    });
  }

  if (catalogState.category !== 'all') {
    chips.push({
      label: `Danh mục: ${formatCatName(catalogState.category)}`,
      clear: () => setCategoryFilter('all')
    });
  }

  if (catalogState.minPrice || catalogState.maxPrice) {
    const minTxt = catalogState.minPrice ? (catalogState.minPrice / 1000) + 'k' : '0';
    const maxTxt = catalogState.maxPrice ? (catalogState.maxPrice / 1000) + 'k' : 'Max';
    chips.push({
      label: `Giá: ${minTxt} - ${maxTxt}`,
      clear: () => { catalogState.minPrice = null; catalogState.maxPrice = null; applyFiltersAndRender(); }
    });
  }

  catalogState.selectedSizes.forEach(sz => {
    chips.push({
      label: `Size ${sz}`,
      clear: () => toggleSizeFilter(sz)
    });
  });

  catalogState.selectedStyles.forEach(st => {
    chips.push({
      label: `Kiểu dáng: ${st}`,
      clear: () => toggleStyleFilter(st)
    });
  });

  if (catalogState.searchKeyword) {
    chips.push({
      label: `Từ khóa: "${catalogState.searchKeyword}"`,
      clear: () => { catalogState.searchKeyword = ''; applyFiltersAndRender(); }
    });
  }

  if (chips.length === 0) {
    bar.innerHTML = '';
    bar.style.display = 'none';
    return;
  }

  bar.style.display = 'flex';
  bar.innerHTML = chips.map((c, i) => `
    <span class="active-filter-tag">
      ${c.label}
      <i class="fas fa-times" onclick="removeActiveFilterChip(${i})"></i>
    </span>
  `).join('') + `
    <button class="btn-reset-filters" onclick="resetAllFilters()" style="margin-left: 8px;">
      <i class="fas fa-trash-can"></i> Xóa tất cả
    </button>
  `;

  window._activeFilterChips = chips;
}

function removeActiveFilterChip(index) {
  if (window._activeFilterChips && window._activeFilterChips[index]) {
    window._activeFilterChips[index].clear();
  }
}

function updateCategoryCounts() {
  const catBtns = document.querySelectorAll('.filter-cat-btn');
  catBtns.forEach(btn => {
    const cat = btn.getAttribute('data-cat');
    if (!cat) return;
    const countEl = btn.querySelector('.filter-cat-count');
    if (!countEl) return;

    if (cat === 'all') {
      countEl.innerText = catalogState.allProducts.length;
    } else {
      const count = catalogState.allProducts.filter(p => p.category === cat || p.type === cat).length;
      countEl.innerText = count;
    }
  });
}

function formatCatName(cat) {
  const map = {
    all: 'Tất Cả Sản Phẩm',
    vest: 'Áo Vest & Blazer',
    somi: 'Áo Sơ Mi Luxury',
    polo: 'Áo Polo Premium',
    aothun: 'Áo Thun & Hoodie',
    quanau: 'Quần Âu May Đo',
    quanjeans: 'Quần Jeans',
    dam: 'Váy & Đầm Dạ Hội',
    vay: 'Chân Váy',
    phukien: 'Phụ Kiện Da'
  };
  return map[cat] || cat;
}

// ==========================================================================
// 7. CÁC HÀM XỬ LÝ SỰ KIỆN LỌC (EVENT HANDLERS)
// ==========================================================================
function setGenderFilter(gender) {
  catalogState.gender = gender;
  document.querySelectorAll('.gender-chip-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-gender') === gender);
  });
  applyFiltersAndRender();
}

function setCategoryFilter(cat) {
  catalogState.category = cat;
  document.querySelectorAll('.filter-cat-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-cat') === cat);
  });
  applyFiltersAndRender();
}

function toggleSizeFilter(size) {
  if (catalogState.selectedSizes.has(size)) {
    catalogState.selectedSizes.delete(size);
  } else {
    catalogState.selectedSizes.add(size);
  }

  document.querySelectorAll('.size-chip-btn').forEach(btn => {
    const sz = btn.getAttribute('data-size');
    btn.classList.toggle('active', catalogState.selectedSizes.has(sz));
  });

  applyFiltersAndRender();
}

function toggleStyleFilter(style) {
  if (catalogState.selectedStyles.has(style)) {
    catalogState.selectedStyles.delete(style);
  } else {
    catalogState.selectedStyles.add(style);
  }

  document.querySelectorAll('.style-pill-btn').forEach(btn => {
    const st = btn.getAttribute('data-style');
    btn.classList.toggle('active', catalogState.selectedStyles.has(st));
  });

  applyFiltersAndRender();
}

function setPricePreset(min, max) {
  catalogState.minPrice = min;
  catalogState.maxPrice = max;

  const minInput = document.getElementById('priceMinInput');
  const maxInput = document.getElementById('priceMaxInput');
  if (minInput) minInput.value = min || '';
  if (maxInput) maxInput.value = max || '';

  document.querySelectorAll('.price-preset-btn').forEach(btn => {
    const bMin = btn.getAttribute('data-min') ? Number(btn.getAttribute('data-min')) : null;
    const bMax = btn.getAttribute('data-max') ? Number(btn.getAttribute('data-max')) : null;
    btn.classList.toggle('active', bMin === min && bMax === max);
  });

  applyFiltersAndRender();
}

function applyCustomPriceInput() {
  const minVal = document.getElementById('priceMinInput')?.value;
  const maxVal = document.getElementById('priceMaxInput')?.value;

  catalogState.minPrice = minVal ? parseInt(minVal, 10) : null;
  catalogState.maxPrice = maxVal ? parseInt(maxVal, 10) : null;

  document.querySelectorAll('.price-preset-btn').forEach(b => b.classList.remove('active'));
  applyFiltersAndRender();
}

function resetAllFilters() {
  catalogState.gender = 'all';
  catalogState.category = 'all';
  catalogState.minPrice = null;
  catalogState.maxPrice = null;
  catalogState.selectedSizes.clear();
  catalogState.selectedStyles.clear();
  catalogState.searchKeyword = '';
  catalogState.sortBy = 'featured';

  // Cập nhật DOM
  document.querySelectorAll('.gender-chip-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-gender') === 'all'));
  document.querySelectorAll('.filter-cat-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-cat') === 'all'));
  document.querySelectorAll('.size-chip-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.style-pill-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.price-preset-btn').forEach(b => b.classList.remove('active'));

  const minInput = document.getElementById('priceMinInput');
  const maxInput = document.getElementById('priceMaxInput');
  const searchInput = document.getElementById('catalogSearchInput');
  if (minInput) minInput.value = '';
  if (maxInput) maxInput.value = '';
  if (searchInput) searchInput.value = '';

  const sortSelect = document.getElementById('catalogSortSelect');
  if (sortSelect) sortSelect.value = 'featured';

  applyFiltersAndRender();
  if (typeof showToast === 'function') {
    showToast("Đã xóa bộ lọc", "Đã hiển thị lại toàn bộ sản phẩm", "info");
  }
}

// Áp dụng Size tính từ Smart Advisor vào danh sách sản phẩm
function applyAdvisorSizeToFilter() {
  const recSize = catalogState.advisorSizeResult;
  if (!recSize) return;

  // Đặt giới tính theo advisor
  catalogState.gender = catalogState.advisorGender;
  document.querySelectorAll('.gender-chip-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-gender') === catalogState.gender));

  // Tích chọn size này
  catalogState.selectedSizes.clear();
  catalogState.selectedSizes.add(recSize);

  document.querySelectorAll('.size-chip-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-size') === recSize);
  });

  applyFiltersAndRender();

  if (typeof showToast === 'function') {
    showToast("Gợi Ý Vóc Dáng", `Đang lọc các sản phẩm có Size ${recSize} vừa vặn với bạn!`, "success");
  }
}

// Đổi chế độ xem (3 cột / 4 cột / 1 cột)
function setViewMode(mode) {
  catalogState.viewMode = mode;
  const grid = document.getElementById('catalogProductsGrid');
  if (!grid) return;

  grid.className = `catalog-products-grid ${mode === 'grid-4' ? 'grid-4' : (mode === 'grid-list' ? 'grid-list' : '')}`;

  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-view') === mode);
  });
}

// ==========================================================================
// 8. ĐỒNG BỘ URL QUERY & DEEP LINKING (URL SYNC)
// ==========================================================================
function parseURLParams() {
  const params = new URLSearchParams(window.location.search);
  
  if (params.has('category')) {
    catalogState.category = params.get('category');
    document.querySelectorAll('.filter-cat-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-cat') === catalogState.category));
  }
  if (params.has('gender')) {
    catalogState.gender = params.get('gender');
    document.querySelectorAll('.gender-chip-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-gender') === catalogState.gender));
  }
  if (params.has('size')) {
    const szList = params.get('size').split(',');
    szList.forEach(s => catalogState.selectedSizes.add(s.trim()));
    document.querySelectorAll('.size-chip-btn').forEach(b => b.classList.toggle('active', catalogState.selectedSizes.has(b.getAttribute('data-size'))));
  }
  if (params.has('search')) {
    catalogState.searchKeyword = params.get('search');
    const sInput = document.getElementById('catalogSearchInput');
    if (sInput) sInput.value = catalogState.searchKeyword;
  }
  if (params.has('minPrice')) catalogState.minPrice = Number(params.get('minPrice'));
  if (params.has('maxPrice')) catalogState.maxPrice = Number(params.get('maxPrice'));
  if (params.has('sort')) {
    catalogState.sortBy = params.get('sort');
    const sortSelect = document.getElementById('catalogSortSelect');
    if (sortSelect) sortSelect.value = catalogState.sortBy;
  }
}

function syncURLWithState() {
  const params = new URLSearchParams();
  if (catalogState.category !== 'all') params.set('category', catalogState.category);
  if (catalogState.gender !== 'all') params.set('gender', catalogState.gender);
  if (catalogState.selectedSizes.size > 0) params.set('size', Array.from(catalogState.selectedSizes).join(','));
  if (catalogState.searchKeyword) params.set('search', catalogState.searchKeyword);
  if (catalogState.minPrice) params.set('minPrice', catalogState.minPrice);
  if (catalogState.maxPrice) params.set('maxPrice', catalogState.maxPrice);
  if (catalogState.sortBy !== 'featured') params.set('sort', catalogState.sortBy);

  const queryStr = params.toString();
  const newURL = window.location.pathname + (queryStr ? `?${queryStr}` : '');
  window.history.replaceState({}, '', newURL);
}

// ==========================================================================
// 9. QUẢN LÝ GIỎ HÀNG & DANH SÁCH YÊU THÍCH (CART & WISHLIST)
// ==========================================================================
function getCart() {
  try {
    return JSON.parse(localStorage.getItem('moonlight_cart')) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('moonlight_cart', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const cart = getCart();
  const totalQty = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const badges = document.querySelectorAll('#cartBadge, .cart-badge');
  badges.forEach(b => {
    b.innerText = totalQty;
    b.style.display = totalQty > 0 ? 'flex' : 'none';
  });
}

function quickAddToCart(productId) {
  const prod = catalogState.allProducts.find(p => String(p._id || p.id) === String(productId));
  if (!prod) return;

  const firstVariant = prod.variants && prod.variants.length > 0 ? prod.variants[0] : null;
  const firstSize = firstVariant && firstVariant.sizes && firstVariant.sizes.length > 0 ? firstVariant.sizes[0].size : 'Freesize';

  const cart = getCart();
  const existingIdx = cart.findIndex(it => String(it.id) === String(productId) && it.size === firstSize);

  if (existingIdx > -1) {
    cart[existingIdx].quantity += 1;
  } else {
    cart.push({
      id: prod._id || prod.id,
      name: prod.name,
      price: firstVariant ? firstVariant.price : prod.price,
      image: firstVariant ? firstVariant.img : prod.image,
      size: firstSize,
      color: firstVariant ? firstVariant.color : 'Tiêu chuẩn',
      quantity: 1
    });
  }

  saveCart(cart);
  if (typeof showToast === 'function') {
    showToast("Đã Thêm Vào Giỏ", `+1 ${prod.name} (${firstSize})`, "success");
  } else {
    alert(`Đã thêm ${prod.name} vào giỏ hàng!`);
  }
}

function getWishlistIds() {
  try {
    return JSON.parse(localStorage.getItem('moonlight_wishlist')) || [];
  } catch (e) {
    return [];
  }
}

function toggleWishlist(productId, e) {
  if (e) e.stopPropagation();
  let wishlist = getWishlistIds();
  const idStr = String(productId);
  const exists = wishlist.includes(idStr);

  if (exists) {
    wishlist = wishlist.filter(id => id !== idStr);
    if (typeof showToast === 'function') showToast("Yêu Thích", "Đã xóa sản phẩm khỏi danh sách yêu thích", "info");
  } else {
    wishlist.push(idStr);
    if (typeof showToast === 'function') showToast("Yêu Thích", "Đã thêm sản phẩm vào danh sách yêu thích!", "success");
  }

  localStorage.setItem('moonlight_wishlist', JSON.stringify(wishlist));
  
  // Cập nhật icon trái tim
  const btn = document.querySelector(`.catalog-card[data-id="${productId}"] .btn-card-wishlist`);
  if (btn) {
    btn.classList.toggle('active', !exists);
    btn.innerHTML = `<i class="${!exists ? 'fas' : 'far'} fa-heart"></i>`;
  }

  const badge = document.getElementById('wishlistBadge');
  if (badge) {
    badge.innerText = wishlist.length;
    badge.style.display = wishlist.length > 0 ? 'flex' : 'none';
  }
}

// ==========================================================================
// 10. QUICK VIEW MODAL
// ==========================================================================
function openQuickView(productId) {
  const prod = catalogState.allProducts.find(p => String(p._id || p.id) === String(productId));
  if (!prod) return;

  const modal = document.getElementById('quickViewModal');
  const body = document.getElementById('quickViewBody');
  if (!modal || !body) return;

  const variants = prod.variants || [];
  const activeVar = variants[0] || { color: 'Tiêu chuẩn', img: prod.image, price: prod.price, sizes: [{ size: 'Freesize', stock: 10 }] };

  body.innerHTML = `
    <div style="display: flex; gap: 24px; flex-wrap: wrap;">
      <div style="flex: 1; min-width: 260px;">
        <img src="${activeVar.img || prod.image}" id="qvModalImg" alt="${prod.name}" style="width: 100%; border-radius: 10px; object-fit: cover; max-height: 420px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
      </div>
      <div style="flex: 1.2; min-width: 280px; display: flex; flex-direction: column;">
        <span style="color: var(--catalog-gold); font-size: 11.5px; font-weight: 700; text-transform: uppercase;">${prod.gender || 'UNISEX'} • ${formatCatName(prod.category)}</span>
        <h3 style="color: #fff; margin: 6px 0 10px 0; font-size: 20px;">${prod.name}</h3>
        
        <div style="display: flex; align-items: baseline; gap: 10px; margin-bottom: 14px;">
          <span style="font-size: 22px; font-weight: 800; color: var(--catalog-gold);" id="qvModalPrice">${activeVar.price.toLocaleString('vi-VN')}đ</span>
          ${prod.originalPrice ? `<span style="font-size: 14px; color: #64748b; text-decoration: line-through;">${prod.originalPrice.toLocaleString('vi-VN')}đ</span>` : ''}
        </div>

        <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0 0 16px 0;">${prod.description || 'Chất lượng cao cấp tiêu chuẩn MoonLight.'}</p>

        <!-- Chọn màu -->
        ${variants.length > 0 ? `
          <div style="margin-bottom: 14px;">
            <label style="font-size: 12px; font-weight: 700; color: #fff; display: block; margin-bottom: 6px;">MÀU SẮC:</label>
            <div style="display: flex; gap: 8px;" id="qvColorsWrap">
              ${variants.map((v, i) => `
                <button type="button" class="swatch-dot ${i === 0 ? 'active' : ''}" 
                        style="background: ${v.colorCode || '#000'}; width: 22px; height: 22px;" 
                        title="${v.color}"
                        onclick="selectQuickViewVariant(${i}, '${prod._id || p.id}')">
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Chọn size -->
        <div style="margin-bottom: 20px;">
          <label style="font-size: 12px; font-weight: 700; color: #fff; display: block; margin-bottom: 6px;">KÍCH CỠ:</label>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;" id="qvSizesWrap">
            ${(activeVar.sizes || []).map((s, i) => `
              <button type="button" class="size-chip-btn ${i === 0 ? 'active' : ''}" style="padding: 6px 14px;" data-size="${s.size}" onclick="selectQuickViewSize(this)">
                ${s.size}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Nút thêm giỏ hàng -->
        <div style="display: flex; gap: 12px; margin-top: auto;">
          <button class="btn-primary" onclick="confirmQuickViewAddToCart('${prod._id || prod.id}')" style="flex: 1; padding: 12px; background: var(--catalog-gold); color: #000; font-weight: 700; border-radius: 8px; border: none; cursor: pointer;">
            <i class="fas fa-cart-plus"></i> THÊM VÀO GIỎ HÀNG
          </button>
          <a href="product.html?id=${prod._id || prod.id}" class="btn-outline" style="padding: 12px 18px; border: 1px solid var(--catalog-border); color: #fff; border-radius: 8px; text-decoration: none; display: inline-flex; align-items: center; font-size: 13px; font-weight: 600;">
            Chi Tiết
          </a>
        </div>
      </div>
    </div>
  `;

  window._currentQuickViewProduct = prod;
  window._currentQuickViewVariantIdx = 0;
  modal.style.display = 'flex';
}

function closeQuickView() {
  const modal = document.getElementById('quickViewModal');
  if (modal) modal.style.display = 'none';
}

function selectQuickViewVariant(vIdx, pId) {
  const prod = window._currentQuickViewProduct;
  if (!prod || !prod.variants[vIdx]) return;
  window._currentQuickViewVariantIdx = vIdx;

  const v = prod.variants[vIdx];
  const img = document.getElementById('qvModalImg');
  const price = document.getElementById('qvModalPrice');
  const sizesWrap = document.getElementById('qvSizesWrap');
  const colorDots = document.querySelectorAll('#qvColorsWrap .swatch-dot');

  if (img && v.img) img.src = v.img;
  if (price && v.price) price.innerText = v.price.toLocaleString('vi-VN') + 'đ';

  colorDots.forEach((d, i) => d.classList.toggle('active', i === vIdx));

  if (sizesWrap && v.sizes) {
    sizesWrap.innerHTML = v.sizes.map((s, i) => `
      <button type="button" class="size-chip-btn ${i === 0 ? 'active' : ''}" style="padding: 6px 14px;" data-size="${s.size}" onclick="selectQuickViewSize(this)">
        ${s.size}
      </button>
    `).join('');
  }
}

function selectQuickViewSize(btn) {
  document.querySelectorAll('#qvSizesWrap .size-chip-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function confirmQuickViewAddToCart(productId) {
  const prod = window._currentQuickViewProduct;
  if (!prod) return;

  const vIdx = window._currentQuickViewVariantIdx || 0;
  const v = prod.variants && prod.variants[vIdx] ? prod.variants[vIdx] : { price: prod.price, img: prod.image, color: 'Tiêu chuẩn' };

  const activeSizeBtn = document.querySelector('#qvSizesWrap .size-chip-btn.active');
  const size = activeSizeBtn ? activeSizeBtn.getAttribute('data-size') : 'Freesize';

  const cart = getCart();
  const existingIdx = cart.findIndex(it => String(it.id) === String(productId) && it.size === size && it.color === v.color);

  if (existingIdx > -1) {
    cart[existingIdx].quantity += 1;
  } else {
    cart.push({
      id: prod._id || prod.id,
      name: prod.name,
      price: v.price || prod.price,
      image: v.img || prod.image,
      size: size,
      color: v.color || 'Tiêu chuẩn',
      quantity: 1
    });
  }

  saveCart(cart);
  closeQuickView();
  if (typeof showToast === 'function') {
    showToast("Đã Thêm Vào Giỏ", `Đã thêm ${prod.name} (Size ${size}) vào giỏ hàng!`, "success");
  }
}

// Mobile Filter Drawer Toggle
function toggleMobileFilters() {
  const sidebar = document.getElementById('catalogSidebar');
  const overlay = document.getElementById('mobileFilterOverlay');
  if (sidebar) sidebar.classList.toggle('mobile-open');
  if (overlay) overlay.classList.toggle('active');
}

// ==========================================================================
// 11. KHỞI TẠO TRANG CATALOG (INIT)
// ==========================================================================
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Tải giỏ hàng & wishlist badges
  updateCartBadge();
  const wlBadge = document.getElementById('wishlistBadge');
  if (wlBadge) {
    const wl = getWishlistIds();
    wlBadge.innerText = wl.length;
    wlBadge.style.display = wl.length > 0 ? 'flex' : 'none';
  }

  // 2. Tải sản phẩm từ API Backend hoặc Fallback
  let products = [];
  try {
    if (window.MoonlightAPI && typeof MoonlightAPI.getProducts === 'function') {
      const res = await MoonlightAPI.getProducts();
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        products = res.data;
      }
    }
  } catch (e) {
    console.warn('MoonlightAPI không khả dụng, sử dụng CATALOG_FALLBACK_PRODUCTS:', e);
  }

  if (products.length === 0) {
    products = CATALOG_FALLBACK_PRODUCTS;
  }

  catalogState.allProducts = products;

  // 3. Đọc tham số URL (Deep Linking)
  parseURLParams();

  // 4. Khởi tạo Smart Size Advisor UI
  updateAdvisorUI();

  // 5. Gắn sự kiện Slider Chiều cao & Cân nặng
  const hSlider = document.getElementById('advisorHeightSlider');
  const wSlider = document.getElementById('advisorWeightSlider');
  if (hSlider) {
    hSlider.addEventListener('input', (e) => {
      catalogState.advisorHeight = parseInt(e.target.value, 10);
      updateAdvisorUI();
    });
  }
  if (wSlider) {
    wSlider.addEventListener('input', (e) => {
      catalogState.advisorWeight = parseInt(e.target.value, 10);
      updateAdvisorUI();
    });
  }

  // Sự kiện nút Giới tính Advisor
  document.querySelectorAll('.advisor-gender-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.advisor-gender-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      catalogState.advisorGender = btn.getAttribute('data-gender');
      updateAdvisorUI();
    });
  });

  // Sự kiện Sort Select
  const sortSelect = document.getElementById('catalogSortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      catalogState.sortBy = e.target.value;
      applyFiltersAndRender();
    });
  }

  // Sự kiện Tìm kiếm
  const searchInput = document.getElementById('catalogSearchInput');
  if (searchInput) {
    let searchDebounce = null;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        catalogState.searchKeyword = e.target.value.trim();
        applyFiltersAndRender();
      }, 300);
    });
  }

  // 6. Chạy render lần đầu
  applyFiltersAndRender();
});
