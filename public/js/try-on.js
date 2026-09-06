/**
 * MOONLIGHT LUXURY - AI VIRTUAL TRY-ON AGENT (try-on.js)
 * High-definition virtual try-on engine & interactive showroom
 */

(function() {
  // State
  let sampleModels = [];
  let products = [];
  let currentTab = 'sample'; // 'sample' or 'upload'
  let selectedPersonImage = '';
  let selectedPersonName = '';
  let selectedProduct = null;
  let selectedGarmentImage = '';
  let selectedGender = 'all';
  let activeCategory = 'all';
  let isGenerating = false;
  let currentResultData = null;

  // DOM Elements
  let dropzone, fileInput, sampleGrid, personPreviewBox, personThumb, personNameEl;
  let wardrobeGrid, wardrobeSearch, selectedGarmentBar, sgThumb, sgName, sgPrice;
  let btnGenerate, scanningOverlay, scanStatusText, scanSubText;
  let resultViewport, emptyResultState, comparisonContainer;
  let compareOverlay, sliderHandle, beforeImg, afterImg;
  let resultActionPanel, wpThumb, wpName, wpPrice, wpOldPrice, btnAddCart, btnDownload;

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    cacheDom();
    bindEvents();
    await Promise.all([loadSampleModels(), loadProducts()]);
    setupSlider();
  }

  function cacheDom() {
    dropzone = document.getElementById('personDropzone');
    fileInput = document.getElementById('personFileInput');
    sampleGrid = document.getElementById('sampleModelsGrid');
    personPreviewBox = document.getElementById('personPreviewBox');
    personThumb = document.getElementById('personThumbImg');
    personNameEl = document.getElementById('personNameText');

    wardrobeGrid = document.getElementById('wardrobeGrid');
    wardrobeSearch = document.getElementById('wardrobeSearch');
    selectedGarmentBar = document.getElementById('selectedGarmentBar');
    sgThumb = document.getElementById('sgThumb');
    sgName = document.getElementById('sgName');
    sgPrice = document.getElementById('sgPrice');

    btnGenerate = document.getElementById('btnAiGenerate');
    scanningOverlay = document.getElementById('scanningOverlay');
    scanStatusText = document.getElementById('scanStatusText');
    scanSubText = document.getElementById('scanSubText');

    resultViewport = document.getElementById('resultViewport');
    emptyResultState = document.getElementById('emptyResultState');
    comparisonContainer = document.getElementById('comparisonContainer');
    compareOverlay = document.getElementById('compareOverlay');
    sliderHandle = document.getElementById('sliderHandle');
    beforeImg = document.getElementById('beforeImg');
    afterImg = document.getElementById('afterImg');

    resultActionPanel = document.getElementById('resultActionPanel');
    wpThumb = document.getElementById('wpThumb');
    wpName = document.getElementById('wpName');
    wpPrice = document.getElementById('wpPrice');
    wpOldPrice = document.getElementById('wpOldPrice');
    btnAddCart = document.getElementById('btnTryOnAddCart');
    btnDownload = document.getElementById('btnDownloadResult');
  }

  function bindEvents() {
    // Tab switching (Mẫu có sẵn / Tải ảnh lên)
    const tabBtns = document.querySelectorAll('.tab-pill-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTab = btn.dataset.tab;
        if (currentTab === 'sample') {
          sampleGrid.style.display = 'grid';
          dropzone.style.display = 'none';
        } else {
          sampleGrid.style.display = 'none';
          dropzone.style.display = 'block';
        }
      });
    });

    // File input change
    if (fileInput) {
      fileInput.addEventListener('change', handleFileSelect);
    }

    // Drag & Drop
    if (dropzone) {
      ['dragenter', 'dragover'].forEach(name => {
        dropzone.addEventListener(name, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.add('dragover');
        });
      });
      ['dragleave', 'drop'].forEach(name => {
        dropzone.addEventListener(name, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.remove('dragover');
        });
      });
      dropzone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
          processImageFile(files[0]);
        }
      });
    }

    // Remove person selection
    const btnRemove = document.getElementById('btnRemovePerson');
    if (btnRemove) {
      btnRemove.addEventListener('click', resetPersonSelection);
    }

    // Wardrobe search
    if (wardrobeSearch) {
      wardrobeSearch.addEventListener('input', () => {
        filterProducts();
      });
    }

    // Wardrobe category tabs
    const wTabs = document.querySelectorAll('.w-tab-btn');
    wTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        wTabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.dataset.cat;
        filterProducts();
      });
    });

    // Generate Try-On Button
    if (btnGenerate) {
      btnGenerate.addEventListener('click', executeVirtualTryOn);
    }

    // Add to cart from result
    if (btnAddCart) {
      btnAddCart.addEventListener('click', handleAddToCartFromResult);
    }

    // Download result
    if (btnDownload) {
      btnDownload.addEventListener('click', downloadResultImage);
    }
  }

  // Load sample models from backend
  async function loadSampleModels() {
    try {
      const res = await fetch('/api/v1/ai/sample-models');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        sampleModels = data.data;
      } else {
        sampleModels = getFallbackModels();
      }
    } catch (e) {
      console.warn('Fallback sample models:', e);
      sampleModels = getFallbackModels();
    }
    renderSampleModels();
  }

  function getFallbackModels() {
    return [
      {
        id: 'model-female-01',
        name: 'Diễm My (Nữ · 1m68)',
        gender: 'female',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        fullBodyImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop&q=80',
        stats: '1m68 · 50kg · Form Chuẩn'
      },
      {
        id: 'model-male-01',
        name: 'Hoàng Nam (Nam · 1m80)',
        gender: 'male',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        fullBodyImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&auto=format&fit=crop&q=80',
        stats: '1m80 · 72kg · Dáng Chuẩn'
      },
      {
        id: 'model-female-02',
        name: 'Khánh Linh (Nữ · 1m62)',
        gender: 'female',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
        fullBodyImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&auto=format&fit=crop&q=80',
        stats: '1m62 · 46kg · Nhỏ Nhắn'
      },
      {
        id: 'model-male-02',
        name: 'Quốc Bảo (Nam · 1m75)',
        gender: 'male',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
        fullBodyImage: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=900&auto=format&fit=crop&q=80',
        stats: '1m75 · 68kg · Cân Đối'
      }
    ];
  }

  function renderSampleModels() {
    if (!sampleGrid) return;
    sampleGrid.innerHTML = sampleModels.map(m => `
      <div class="sample-model-card ${selectedPersonName === m.name ? 'selected' : ''}" data-id="${m.id}" onclick="window.selectSampleModel('${m.id}')">
        <div class="model-img-wrap">
          <img src="${m.fullBodyImage || m.avatar}" alt="${m.name}" loading="lazy">
          <div class="selected-check"><i class="fas fa-check"></i></div>
        </div>
        <div class="model-info">
          <div class="model-name">${m.name}</div>
          <div class="model-stats">${m.height ? `${m.height} · ${m.weight || 'Chuẩn'}` : (m.stats || 'Chuẩn')}</div>
        </div>
      </div>
    `).join('');

    // Pre-select first sample model for delightful instant experience
    if (!selectedPersonImage && sampleModels.length > 0) {
      selectSampleModel(sampleModels[0].id);
    }
  }

  window.selectSampleModel = function(modelId) {
    const model = sampleModels.find(m => m.id === modelId);
    if (!model) return;

    selectedPersonImage = model.fullBodyImage || model.avatar;
    selectedPersonName = model.name;
    selectedGender = model.gender || 'all';

    // Highlight card
    const cards = document.querySelectorAll('.sample-model-card');
    cards.forEach(c => {
      c.classList.toggle('selected', c.dataset.id === modelId);
    });

    showPersonPreview(selectedPersonImage, selectedPersonName, `${model.height || 'Form chuẩn'} · Người mẫu phòng thử MoonLight`);
    checkCanGenerate();
  };

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
      processImageFile(file);
    }
  }

  function processImageFile(file) {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp định dạng hình ảnh (JPG, PNG, WebP)!');
      return;
    }

    // Limit to 15MB
    if (file.size > 15 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa là 15MB. Vui lòng chọn ảnh nhẹ hơn!');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(evt) {
      selectedPersonImage = evt.target.result;
      selectedPersonName = 'Ảnh của bạn (' + file.name + ')';
      selectedGender = 'all';

      // Unselect sample cards
      document.querySelectorAll('.sample-model-card').forEach(c => c.classList.remove('selected'));

      showPersonPreview(selectedPersonImage, selectedPersonName, 'Ảnh cá nhân đã tải lên');
      checkCanGenerate();
    };
    reader.readAsDataURL(file);
  }

  function showPersonPreview(imgUrl, name, sub) {
    if (personPreviewBox) {
      personPreviewBox.style.display = 'flex';
      personThumb.src = imgUrl;
      personNameEl.innerHTML = `<strong>${name}</strong><br><small style="color:#94a3b8;">${sub}</small>`;
    }
  }

  function resetPersonSelection() {
    selectedPersonImage = '';
    selectedPersonName = '';
    if (personPreviewBox) personPreviewBox.style.display = 'none';
    if (fileInput) fileInput.value = '';
    document.querySelectorAll('.sample-model-card').forEach(c => c.classList.remove('selected'));
    checkCanGenerate();
  }

  // Load products from MoonLight store
  async function loadProducts() {
    try {
      const res = await fetch('/api/v1/products');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        products = data.data;
      } else if (Array.isArray(data)) {
        products = data;
      } else {
        products = getFallbackProducts();
      }
    } catch (e) {
      console.warn('Fallback products:', e);
      products = getFallbackProducts();
    }
    filterProducts();
  }

  function getFallbackProducts() {
    return [
      {
        id: 1,
        _id: 'prod-01',
        name: 'Bộ Vest Nam Hoàng Gia Luxury',
        price: 3200000,
        originalPrice: 4200000,
        category: 'vest',
        image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80'
      },
      {
        id: 2,
        _id: 'prod-02',
        name: 'Áo Sơ Mi Lụa Ý Cao Cấp',
        price: 850000,
        originalPrice: 1100000,
        category: 'so-mi',
        image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80'
      },
      {
        id: 3,
        _id: 'prod-03',
        name: 'Đầm Dạ Hội Đỏ Nhung Quyến Rũ',
        price: 2450000,
        originalPrice: 3100000,
        category: 'dam-vay',
        image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80'
      },
      {
        id: 4,
        _id: 'prod-04',
        name: 'Set Vest Nữ Quyền Lực Paris',
        price: 2890000,
        originalPrice: 3500000,
        category: 'vest',
        image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80'
      },
      {
        id: 5,
        _id: 'prod-05',
        name: 'Quần Âu Slimfit Co Giãn 4 Chiều',
        price: 790000,
        originalPrice: 990000,
        category: 'quan-au',
        image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80'
      }
    ];
  }

  function filterProducts() {
    if (!wardrobeGrid) return;

    const query = (wardrobeSearch ? wardrobeSearch.value : '').toLowerCase().trim();

    const filtered = products.filter(p => {
      const matchQuery = !query || p.name.toLowerCase().includes(query) || (p.category && p.category.toLowerCase().includes(query));
      
      let matchCat = true;
      if (activeCategory !== 'all') {
        const catLower = (p.category || '').toLowerCase();
        const nameLower = (p.name || '').toLowerCase();
        if (activeCategory === 'vest') {
          matchCat = catLower.includes('vest') || catLower.includes('suit') || nameLower.includes('vest') || nameLower.includes('suit') || nameLower.includes('blazer');
        } else if (activeCategory === 'so-mi') {
          matchCat = catLower.includes('sơ mi') || catLower.includes('shirt') || nameLower.includes('sơ mi') || nameLower.includes('áo sơ mi');
        } else if (activeCategory === 'dam-vay') {
          matchCat = catLower.includes('đầm') || catLower.includes('váy') || catLower.includes('dress') || nameLower.includes('đầm') || nameLower.includes('váy');
        } else if (activeCategory === 'quan-au') {
          matchCat = catLower.includes('quần') || catLower.includes('trouser') || catLower.includes('pant') || nameLower.includes('quần');
        }
      }
      return matchQuery && matchCat;
    });

    if (filtered.length === 0) {
      wardrobeGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 30px; color: #94a3b8;">
          <i class="fas fa-search" style="font-size: 24px; margin-bottom: 8px;"></i>
          <p>Không tìm thấy trang phục phù hợp</p>
        </div>
      `;
      return;
    }

    wardrobeGrid.innerHTML = filtered.map(p => {
      const isSel = selectedProduct && (String(selectedProduct._id) === String(p._id) || String(selectedProduct.id) === String(p.id));
      const priceFmt = Number(p.price || 0).toLocaleString('vi-VN') + '₫';
      const img = p.image || (p.variants && p.variants[0]?.img) || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500';

      return `
        <div class="garment-card ${isSel ? 'selected' : ''}" data-id="${p._id || p.id}" onclick="window.selectGarment('${p._id || p.id}')">
          <div class="garment-check"><i class="fas fa-check"></i></div>
          <div class="garment-img">
            <img src="${img}" alt="${p.name}" loading="lazy">
          </div>
          <div class="garment-info">
            <div class="garment-title" title="${p.name}">${p.name}</div>
            <div class="garment-price">${priceFmt}</div>
          </div>
        </div>
      `;
    }).join('');

    // Pre-select first product if none selected
    if (!selectedProduct && filtered.length > 0) {
      selectGarment(filtered[0]._id || filtered[0].id);
    }
  }

  window.selectGarment = function(prodId) {
    const prod = products.find(p => String(p._id) === String(prodId) || String(p.id) === String(prodId));
    if (!prod) return;

    selectedProduct = prod;
    selectedGarmentImage = prod.image || (prod.variants && prod.variants[0]?.img) || '';

    // Highlight card
    const cards = document.querySelectorAll('.garment-card');
    cards.forEach(c => {
      c.classList.toggle('selected', String(c.dataset.id) === String(prodId));
    });

    // Update selected bar
    if (selectedGarmentBar) {
      selectedGarmentBar.style.display = 'flex';
      sgThumb.src = selectedGarmentImage;
      sgName.textContent = prod.name;
      sgPrice.textContent = Number(prod.price || 0).toLocaleString('vi-VN') + '₫';
    }

    checkCanGenerate();
  };

  function checkCanGenerate() {
    const can = Boolean(selectedPersonImage && (selectedProduct || selectedGarmentImage));
    if (btnGenerate) {
      btnGenerate.disabled = !can || isGenerating;
    }
  }

  // Execute Virtual Try-On
  async function executeVirtualTryOn() {
    if (!selectedPersonImage) {
      alert('Vui lòng chọn hoặc tải lên ảnh toàn thân trước!');
      return;
    }
    if (!selectedProduct && !selectedGarmentImage) {
      alert('Vui lòng chọn trang phục bạn muốn thử!');
      return;
    }
    if (isGenerating) return;

    isGenerating = true;
    checkCanGenerate();

    // Start scanner animation
    startScanningAnimation();

    try {
      const payload = {
        personImage: selectedPersonImage,
        productId: selectedProduct ? (selectedProduct._id || selectedProduct.id) : undefined,
        garmentImage: selectedGarmentImage,
        modelGender: selectedGender
      };

      const res = await fetch('/api/v1/ai/try-on', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || 'Không thể tạo ảnh thử đồ');
      }

      currentResultData = data.data;

      // Small dramatic delay for visual satisfaction
      setTimeout(() => {
        stopScanningAnimation();
        renderResult(currentResultData);
      }, 1800);

    } catch (err) {
      console.error('Lỗi thử đồ:', err);
      stopScanningAnimation();
      alert('Đã xảy ra lỗi khi thử đồ: ' + (err.message || 'Vui lòng thử lại!'));
    } finally {
      isGenerating = false;
      checkCanGenerate();
    }
  }

  const scanStages = [
    'Quét dáng & cấu trúc khung cơ thể...',
    'Bóc tách phom dáng trang phục...',
    'Dệt chất liệu vải & nếp gấp thực tế...',
    'Cân chỉnh ánh sáng & bóng đổ Studio MoonLight...',
    'Đang hoàn tất ảnh người mẫu mặc đồ...'
  ];

  let scanInterval = null;

  function startScanningAnimation() {
    if (scanningOverlay) {
      scanningOverlay.classList.add('active');
    }
    let stageIdx = 0;
    if (scanStatusText) scanStatusText.textContent = scanStages[0];
    if (scanSubText) scanSubText.textContent = 'NEURAL ENGINE · RESOLUTION 4K';

    scanInterval = setInterval(() => {
      stageIdx = (stageIdx + 1) % scanStages.length;
      if (scanStatusText) scanStatusText.textContent = scanStages[stageIdx];
    }, 700);
  }

  function stopScanningAnimation() {
    if (scanInterval) clearInterval(scanInterval);
    if (scanningOverlay) {
      scanningOverlay.classList.remove('active');
    }
  }

  function renderResult(result) {
    if (!result || !result.resultImage) return;

    // Show comparison, hide empty state
    if (emptyResultState) emptyResultState.style.display = 'none';
    if (comparisonContainer) comparisonContainer.style.display = 'block';

    // Set images
    if (beforeImg) beforeImg.src = result.originalImage || selectedPersonImage;
    if (afterImg) afterImg.src = result.resultImage;

    // Reset split slider to 50%
    setSliderPosition(50);

    // Show action panel
    if (resultActionPanel) {
      resultActionPanel.style.display = 'block';
    }

    const prod = result.product || selectedProduct;
    if (prod) {
      if (wpThumb) wpThumb.src = prod.image || result.resultImage;
      if (wpName) wpName.textContent = prod.name;
      if (wpPrice) wpPrice.textContent = Number(prod.price || 0).toLocaleString('vi-VN') + '₫';
      if (wpOldPrice) {
        if (prod.originalPrice && prod.originalPrice > prod.price) {
          wpOldPrice.textContent = Number(prod.originalPrice).toLocaleString('vi-VN') + '₫';
          wpOldPrice.style.display = 'inline';
        } else {
          wpOldPrice.style.display = 'none';
        }
      }
    }

    // Smooth scroll into view on mobile
    if (window.innerWidth < 992 && resultViewport) {
      resultViewport.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // Interactive Slider Setup
  function setupSlider() {
    if (!comparisonContainer) return;

    let isSliding = false;

    const onStart = (e) => {
      isSliding = true;
      updateSliderWithEvent(e);
    };

    const onMove = (e) => {
      if (!isSliding) return;
      updateSliderWithEvent(e);
    };

    const onEnd = () => {
      isSliding = false;
    };

    // Mouse events
    comparisonContainer.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    // Touch events for mobile
    comparisonContainer.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
  }

  function updateSliderWithEvent(e) {
    if (!comparisonContainer) return;
    const rect = comparisonContainer.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const offsetX = clientX - rect.left;
    let percentage = (offsetX / rect.width) * 100;
    percentage = Math.max(0, Math.min(100, percentage));
    setSliderPosition(percentage);
  }

  function setSliderPosition(percentage) {
    if (compareOverlay) compareOverlay.style.width = percentage + '%';
    if (sliderHandle) sliderHandle.style.left = percentage + '%';
  }

  // Add to cart from result
  function handleAddToCartFromResult() {
    const prod = (currentResultData && currentResultData.product) || selectedProduct;
    if (!prod) return;

    try {
      let cart = [];
      const raw = localStorage.getItem('moonlight_cart');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) cart = parsed;
      }

      const prodId = prod._id || prod.id;
      const existing = cart.find(i => String(i.id) === String(prodId));

      if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
      } else {
        cart.push({
          id: prodId,
          title: prod.name,
          price: prod.price,
          originalPrice: prod.originalPrice || prod.price,
          image: prod.image || selectedGarmentImage,
          color: 'Tiêu chuẩn',
          size: 'M',
          quantity: 1
        });
      }

      localStorage.setItem('moonlight_cart', JSON.stringify(cart));

      // Trigger standard badge & sidebar updates if functions exist
      if (typeof updateCartIcon === 'function') updateCartIcon();
      if (typeof renderCartSidebar === 'function') renderCartSidebar();
      if (typeof toggleCart === 'function') toggleCart();

      // Show toast
      if (typeof showToast === 'function') {
        showToast(`Đã thêm "${prod.name}" vào giỏ hàng thành công!`);
      } else {
        alert(`Đã thêm "${prod.name}" vào giỏ hàng thành công!`);
      }

    } catch (e) {
      console.error('Lỗi thêm giỏ hàng:', e);
    }
  }

  // Download result image
  function downloadResultImage() {
    if (!currentResultData || !currentResultData.resultImage) return;

    const link = document.createElement('a');
    link.href = currentResultData.resultImage;
    link.download = `MoonLight_AI_TryOn_${Date.now()}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

})();
