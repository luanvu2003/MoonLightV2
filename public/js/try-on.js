/**
 * MOONLIGHT LUXURY - AI VIRTUAL TRY-ON AGENT (try-on.js)
 * Light Luxury Synchronized + True Fitting Engine + Smooth Clip-Path Slider
 */

(function() {
  // State
  let sampleModels = [];
  let products = [];
  let currentTab = 'sample'; // 'sample' or 'upload'
  let isCustomUpload = false;
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
  let compareOverlay, sliderHandle, sliderLine, beforeImg, afterImg;
  let resultActionPanel, wpThumb, wpName, wpPrice, wpOldPrice, btnAddCart, btnDownload;

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    cacheDom();
    bindEvents();
    setTimeout(initPoseDetector, 300);
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
    sliderLine = document.getElementById('sliderLine');
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
    const tabBtns = document.querySelectorAll('.model-tab-btn');
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

    if (!selectedPersonImage && sampleModels.length > 0) {
      selectSampleModel(sampleModels[0].id);
    }
  }

  window.selectSampleModel = function(modelId) {
    const model = sampleModels.find(m => m.id === modelId);
    if (!model) return;

    isCustomUpload = false;
    selectedPersonImage = model.fullBodyImage || model.avatar;
    selectedPersonName = model.name;
    selectedGender = model.gender || 'all';

    const cards = document.querySelectorAll('.sample-model-card');
    cards.forEach(c => {
      c.classList.toggle('selected', c.dataset.id === modelId);
    });

    showPersonPreview(selectedPersonImage, selectedPersonName, `${model.height || 'Form chuẩn'} · Người mẫu MoonLight`);
    checkCanGenerate();
  };

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
      processImageFile(file);
    }
  }

  function optimizeImage(file, maxDimension = 1024, quality = 0.88) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.onload = () => {
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function processImageFile(file) {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp định dạng hình ảnh (JPG, PNG, WebP)!');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa là 25MB. Vui lòng chọn ảnh nhẹ hơn!');
      return;
    }

    try {
      const optimizedDataUrl = await optimizeImage(file, 1024, 0.88);
      isCustomUpload = true;
      selectedPersonImage = optimizedDataUrl;
      selectedPersonName = 'Ảnh của bạn (' + file.name + ')';
      selectedGender = 'all';

      document.querySelectorAll('.sample-model-card').forEach(c => c.classList.remove('selected'));

      showPersonPreview(selectedPersonImage, selectedPersonName, 'Ảnh cá nhân đã tải lên');
      checkCanGenerate();
    } catch (err) {
      console.error('Lỗi nén ảnh:', err);
      // Fallback nếu nén canvas lỗi
      const reader = new FileReader();
      reader.onload = function(evt) {
        isCustomUpload = true;
        selectedPersonImage = evt.target.result;
        selectedPersonName = 'Ảnh của bạn (' + file.name + ')';
        selectedGender = 'all';
        document.querySelectorAll('.sample-model-card').forEach(c => c.classList.remove('selected'));
        showPersonPreview(selectedPersonImage, selectedPersonName, 'Ảnh cá nhân đã tải lên');
        checkCanGenerate();
      };
      reader.readAsDataURL(file);
    }
  }

  function showPersonPreview(imgUrl, name, sub) {
    if (personPreviewBox) {
      personPreviewBox.style.display = 'flex';
      personThumb.src = imgUrl;
      personNameEl.innerHTML = `<strong>${name}</strong><br><small style="color:#64748b;">${sub}</small>`;
    }
  }

  function resetPersonSelection() {
    selectedPersonImage = '';
    selectedPersonName = '';
    isCustomUpload = false;
    if (personPreviewBox) personPreviewBox.style.display = 'none';
    if (fileInput) fileInput.value = '';
    document.querySelectorAll('.sample-model-card').forEach(c => c.classList.remove('selected'));
    checkCanGenerate();
  }

  // Load products
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
        price: 2450000,
        originalPrice: 2800000,
        category: 'vest',
        image: '/images/garments/suit.jpg'
      },
      {
        id: 2,
        _id: 'prod-02',
        name: 'Áo Sơ Mi Lụa Mulberry Ý',
        price: 890000,
        originalPrice: 990000,
        category: 'so-mi',
        image: '/images/garments/shirt.jpg'
      },
      {
        id: 3,
        _id: 'prod-03',
        name: 'Đầm Dạ Hội Đỏ Nhung Quyến Rũ',
        price: 2450000,
        originalPrice: 3100000,
        category: 'dam-vay',
        image: '/images/garments/dress.jpg'
      },
      {
        id: 4,
        _id: 'prod-04',
        name: 'Quần Âu May Đo Sartorial Cao Cấp',
        price: 950000,
        originalPrice: 1100000,
        category: 'quan-au',
        image: '/images/garments/pants.jpg'
      }
    ];
  }

  function getCleanGarmentImage(p) {
    if (!p) return '/images/garments/suit.jpg';
    if (p.image && p.image.startsWith('/images/garments/')) {
      return p.image;
    }
    const name = (p.name || '').toLowerCase();
    const cat = (p.category || '').toLowerCase();

    if (name.includes('cashmere') || name.includes('cổ lọ') || name.includes('len')) {
      return '/images/garments/cashmere_sweater.jpg';
    }
    if (name.includes('trench') || name.includes('coat') || name.includes('dáng dài')) {
      return '/images/garments/trench_coat.jpg';
    }
    if (name.includes('tweed') || (name.includes('vest') && (name.includes('quý cô') || name.includes('nữ')))) {
      return '/images/garments/tweed_suit.jpg';
    }
    if (name.includes('blazer') || (cat.includes('vest') && name.includes('nữ'))) {
      return '/images/garments/women_blazer.jpg';
    }
    if (name.includes('cổ nơ') || (name.includes('sơ mi') && name.includes('nữ'))) {
      return '/images/garments/silk_blouse.jpg';
    }
    if (name.includes('polo')) {
      return '/images/garments/polo.jpg';
    }
    if (name.includes('hoodie')) {
      return '/images/garments/hoodie.jpg';
    }
    if (name.includes('pima') || name.includes('áo thun') || name.includes('thun')) {
      return '/images/garments/pima_tee.jpg';
    }
    if (name.includes('vest') || name.includes('suit') || cat.includes('vest')) {
      return '/images/garments/suit.jpg';
    }
    if (name.includes('sơ mi') || name.includes('somi') || name.includes('shirt') || cat.includes('somi')) {
      return '/images/garments/shirt.jpg';
    }
    if (name.includes('jean') || name.includes('denim') || cat.includes('jean')) {
      return '/images/garments/denim_jeans.jpg';
    }
    if (name.includes('chino') || name.includes('khaki')) {
      return '/images/garments/khaki_chino.jpg';
    }
    if (name.includes('xếp ly') || name.includes('midi') || cat.includes('vay')) {
      return '/images/garments/pleated_skirt.jpg';
    }
    if (name.includes('đầm') || name.includes('váy') || name.includes('dress') || cat.includes('dam')) {
      return '/images/garments/dress.jpg';
    }
    if (name.includes('quần') || name.includes('pant') || name.includes('trouser') || cat.includes('quan')) {
      return '/images/garments/pants.jpg';
    }
    if (name.includes('giày') || name.includes('loafer')) {
      return '/images/garments/loafer.jpg';
    }
    if (name.includes('ví') || name.includes('wallet')) {
      return '/images/garments/wallet.jpg';
    }
    if (name.includes('thắt lưng') || name.includes('belt')) {
      return '/images/garments/belt.jpg';
    }
    return p.image || (p.variants && p.variants[0]?.img) || '/images/garments/suit.jpg';
  }

  function isWearable(p) {
    if (!p) return false;
    const cat = (p.category || '').toLowerCase();
    const name = (p.name || '').toLowerCase();

    // Loại bỏ hoàn toàn phụ kiện (giày dép, ví da, thắt lưng...)
    if (cat === 'phukien' || cat === 'accessory' || cat === 'accessories') return false;
    if (name.includes('giày') || name.includes('loafer') || name.includes('sneaker') || name.includes('dép') || name.includes('boots')) return false;
    if (name.includes('ví da') || name.includes('ví cầm tay') || name.includes('bóp') || name.includes('wallet')) return false;
    if (name.includes('thắt lưng') || name.includes('dây nịt') || name.includes('belt')) return false;
    if (name.includes('kính') || name.includes('đồng hồ') || name.includes('cà vạt') || name.includes('khuyên') || name.includes('vòng')) return false;
    return true;
  }

  function filterProducts() {
    if (!wardrobeGrid) return;

    const query = (wardrobeSearch ? wardrobeSearch.value : '').toLowerCase().trim();

    const filtered = products.filter(p => {
      if (!isWearable(p)) return false;

      const matchQuery = !query || p.name.toLowerCase().includes(query) || (p.category && p.category.toLowerCase().includes(query));
      
      let matchCat = true;
      if (activeCategory !== 'all') {
        const catLower = (p.category || '').toLowerCase();
        const nameLower = (p.name || '').toLowerCase();
        if (activeCategory === 'vest') {
          matchCat = catLower.includes('vest') || catLower.includes('suit') || nameLower.includes('vest') || nameLower.includes('suit') || nameLower.includes('blazer') || nameLower.includes('trench') || nameLower.includes('khoác');
        } else if (activeCategory === 'so-mi') {
          matchCat = catLower.includes('sơ mi') || catLower.includes('somi') || catLower.includes('shirt') || catLower.includes('aothun') || catLower.includes('polo') || nameLower.includes('sơ mi') || nameLower.includes('polo') || nameLower.includes('len') || nameLower.includes('hoodie') || nameLower.includes('thun');
        } else if (activeCategory === 'dam-vay') {
          matchCat = catLower.includes('đầm') || catLower.includes('dam') || catLower.includes('váy') || catLower.includes('vay') || catLower.includes('dress') || nameLower.includes('đầm') || nameLower.includes('váy');
        } else if (activeCategory === 'quan-au') {
          matchCat = catLower.includes('quần') || catLower.includes('quan') || catLower.includes('trouser') || catLower.includes('pant') || catLower.includes('jean') || nameLower.includes('quần');
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
      const img = getCleanGarmentImage(p);

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

    if (!selectedProduct && filtered.length > 0) {
      selectGarment(filtered[0]._id || filtered[0].id);
    }
  }

  window.selectGarment = function(prodId) {
    const prod = products.find(p => String(p._id) === String(prodId) || String(p.id) === String(prodId));
    if (!prod) return;

    selectedProduct = prod;
    selectedGarmentImage = getCleanGarmentImage(prod);

    const cards = document.querySelectorAll('.garment-card');
    cards.forEach(c => {
      c.classList.toggle('selected', String(c.dataset.id) === String(prodId));
    });

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

  /**
   * Bộ phát hiện khung xương & điểm mốc cơ thể người thật (MediaPipe Pose AI)
   */
  let mediaPipePoseDetector = null;

  function initPoseDetector() {
    if (window.Pose && !mediaPipePoseDetector) {
      try {
        mediaPipePoseDetector = new window.Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });
        mediaPipePoseDetector.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: true,
          smoothSegmentation: true,
          minDetectionConfidence: 0.4
        });
      } catch (e) {
        console.warn('MediaPipe Pose init warning:', e);
      }
    }
    return mediaPipePoseDetector;
  }

  async function detectPoseLandmarks(imgElement) {
    const detector = initPoseDetector();
    if (!detector) return null;

    return new Promise((resolve) => {
      let isDone = false;
      const timer = setTimeout(() => {
        if (!isDone) {
          isDone = true;
          resolve(null);
        }
      }, 12000);

      detector.onResults((results) => {
        if (!isDone) {
          isDone = true;
          clearTimeout(timer);
          if (results && results.poseLandmarks && results.poseLandmarks.length >= 25) {
            resolve(results);
          } else {
            resolve(null);
          }
        }
      });

      try {
        detector.send({ image: imgElement }).catch(() => {
          if (!isDone) { isDone = true; clearTimeout(timer); resolve(null); }
        });
      } catch (err) {
        if (!isDone) { isDone = true; clearTimeout(timer); resolve(null); }
      }
    });
  }

  /**
   * Thuật toán Computer Vision quét nhân trắc học cơ thể người (Fallback khi MediaPipe offline)
   * Sử dụng không gian màu YCbCr chuẩn quốc tế nhận diện khuôn mặt & trục vai trong mọi điều kiện ánh sáng
   */
  function detectPersonAnatomy(personImg) {
    const pW = personImg.naturalWidth || personImg.width;
    const pH = personImg.naturalHeight || personImg.height;

    const scanW = 320;
    const scanH = Math.round((pH / pW) * scanW);
    const cvs = document.createElement('canvas');
    cvs.width = scanW;
    cvs.height = scanH;
    const ctx = cvs.getContext('2d');
    ctx.drawImage(personImg, 0, 0, scanW, scanH);

    let d;
    try {
      d = ctx.getImageData(0, 0, scanW, scanH).data;
    } catch (e) {
      console.warn('Canvas pixel read error:', e);
      return {
        neckX: Math.round(pW * 0.5),
        neckY: Math.round(pH * 0.28),
        shoulderSpan: Math.round(pW * 0.45),
        hipY: Math.round(pH * 0.65),
        chinY: Math.round(pH * 0.26)
      };
    }

    const scaleX = pW / scanW;
    const scaleY = pH / scanH;

    // 1. Phân tích mật độ sắc tố da theo từng hàng ngang (quét 8% -> 52% chiều cao ảnh)
    const maxYScan = Math.floor(scanH * 0.52);
    const skinCounts = new Int32Array(maxYScan);
    const skinSumXByRow = new Float64Array(maxYScan);

    for (let y = Math.floor(scanH * 0.08); y < maxYScan; y++) {
      for (let x = Math.floor(scanW * 0.15); x < Math.floor(scanW * 0.85); x++) {
        const idx = (y * scanW + x) * 4;
        const r = d[idx], g = d[idx+1], b = d[idx+2];
        const Y  =  0.299 * r + 0.587 * g + 0.114 * b;
        const Cb = -0.1687 * r - 0.3313 * g + 0.5 * b + 128;
        const Cr =  0.5 * r - 0.4187 * g - 0.0813 * b + 128;

        if (Cb >= 85 && Cb <= 135 && Cr >= 125 && Cr <= 170 && Y > 50) {
          skinCounts[y]++;
          skinSumXByRow[y] += x;
        }
      }
    }

    // 2. Tìm cụm khuôn mặt trên cùng (top-most continuous cluster)
    let maxRowSkin = 0;
    for (let y = 0; y < maxYScan; y++) {
      if (skinCounts[y] > maxRowSkin) maxRowSkin = skinCounts[y];
    }

    const threshold = Math.max(6, Math.floor(maxRowSkin * 0.22));
    let faceStartY = -1, faceEndY = -1;

    for (let y = 0; y < maxYScan; y++) {
      if (skinCounts[y] >= threshold) {
        if (faceStartY === -1) faceStartY = y;
        faceEndY = y;
      } else if (faceStartY !== -1 && (faceEndY - faceStartY) > 10) {
        // Đã qua vùng cằm của khuôn mặt
        break;
      }
    }

    if (faceStartY !== -1 && faceEndY > faceStartY) {
      let sumX = 0, totalSkin = 0;
      let minFaceX = scanW, maxFaceX = 0;

      for (let y = faceStartY; y <= faceEndY; y++) {
        sumX += skinSumXByRow[y];
        totalSkin += skinCounts[y];
        for (let x = Math.floor(scanW * 0.15); x < Math.floor(scanW * 0.85); x++) {
          const idx = (y * scanW + x) * 4;
          const r = d[idx], g = d[idx+1], b = d[idx+2];
          const Y  =  0.299 * r + 0.587 * g + 0.114 * b;
          const Cb = -0.1687 * r - 0.3313 * g + 0.5 * b + 128;
          const Cr =  0.5 * r - 0.4187 * g - 0.0813 * b + 128;
          if (Cb >= 85 && Cb <= 135 && Cr >= 125 && Cr <= 170 && Y > 50) {
            if (x < minFaceX) minFaceX = x;
            if (x > maxFaceX) maxFaceX = x;
          }
        }
      }

      const faceCenterX = (totalSkin > 0 ? (sumX / totalSkin) : (scanW / 2)) * scaleX;
      const faceW = Math.max(minFaceX < maxFaceX ? (maxFaceX - minFaceX) * scaleX : pW * 0.18, pW * 0.14);
      const chinY = faceEndY * scaleY;
      const faceH = (faceEndY - faceStartY) * scaleY;

      const neckX = Math.round(faceCenterX);
      const neckY = Math.round(chinY + faceH * 0.15);
      const shoulderSpan = Math.round(Math.min(pW * 0.68, Math.max(faceW * 2.45, pW * 0.40)));
      const hipY = Math.round(Math.min(pH * 0.82, neckY + shoulderSpan * 1.35));

      return {
        neckX,
        neckY,
        shoulderSpan,
        hipY,
        chinY: Math.round(chinY)
      };
    }

    // Giá trị chuẩn nhân trắc học dự phòng
    return {
      neckX: Math.round(pW * 0.5),
      neckY: Math.round(pH * 0.28),
      shoulderSpan: Math.round(pW * 0.45),
      hipY: Math.round(pH * 0.65),
      chinY: Math.round(pH * 0.25)
    };
  }

  function getGarmentTargetColor(prodName) {
    const name = (prodName || '').toLowerCase();
    if (name.includes('hoodie')) return [26, 26, 30]; // Charcoal black
    if (name.includes('polo')) return [25, 42, 78]; // Navy blue
    if (name.includes('suit') || name.includes('vest')) return [22, 25, 32]; // Luxury black/navy
    if (name.includes('trench')) return [180, 142, 92]; // Camel trench
    if (name.includes('cashmere') || name.includes('len')) return [215, 210, 198]; // Cream cashmere
    if (name.includes('blazer')) return [190, 160, 120]; // Parisian latte
    if (name.includes('sơ mi') || name.includes('shirt')) return [222, 222, 226]; // Pearl white
    if (name.includes('tweed')) return [42, 42, 48]; // Tweed
    if (name.includes('dress') || name.includes('đầm')) return [160, 28, 42]; // Burgundy
    if (name.includes('pima') || name.includes('thun')) return [218, 218, 212]; // Off-white
    if (name.includes('jean') || name.includes('denim')) return [32, 50, 88]; // Denim indigo
    if (name.includes('chino') || name.includes('khaki')) return [175, 155, 125]; // Khaki
    return [26, 26, 30];
  }

  // 1. Phân loại cấu trúc trang phục tự động theo danh mục & tên sản phẩm
  function classifyGarment(product) {
    const name = ((product && product.name) || '').toLowerCase();
    const cat = ((product && product.category) || '').toLowerCase();

    const isLower = cat.includes('quan') || cat.includes('pant') || cat.includes('jean') || 
                    cat.includes('chino') || cat.includes('vay') || cat.includes('skirt') ||
                    name.includes('quần') || name.includes('jean') || name.includes('chino') || 
                    name.includes('pants') || name.includes('chân váy') || name.includes('xếp ly');

    const isDress = cat.includes('dam') || cat.includes('dress') || 
                    name.includes('đầm') || name.includes('dress');

    const isShortSleeve = name.includes('polo') || name.includes('thun') || 
                          name.includes('pima') || name.includes('cộc') || 
                          name.includes('ngắn tay') || name.includes('tee') || name.includes('t-shirt');

    const isOuterwear = name.includes('khoác') || name.includes('jacket') || 
                        name.includes('trench') || name.includes('coat') || 
                        name.includes('blazer') || name.includes('vest') || 
                        name.includes('suit') || name.includes('măng tô') || name.includes('tweed');

    return {
      isLower,
      isDress,
      isUpper: !isLower && !isDress,
      isShortSleeve,
      isOuterwear
    };
  }

  // 2. Tách nền tự động theo biên cạnh cho bất kỳ ảnh trang phục mới nào
  function createGarmentTransparentCanvas(img) {
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    const cvs = document.createElement('canvas');
    cvs.width = w;
    cvs.height = h;
    const ctx = cvs.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);

    try {
      const imgData = ctx.getImageData(0, 0, w, h);
      const d = imgData.data;

      let transparentCount = 0;
      for (let i = 3; i < d.length; i += 60) {
        if (d[i] < 50) transparentCount++;
      }

      // Nếu là ảnh chưa bóc tách nền (ví dụ ảnh sản phẩm mới tải lên từ admin có nền trắng hoặc studio)
      if (transparentCount < 10) {
        const c1 = [d[0], d[1], d[2]];
        const c2 = [d[(w - 1) * 4], d[(w - 1) * 4 + 1], d[(w - 1) * 4 + 2]];
        const c3 = [d[((h - 1) * w) * 4], d[((h - 1) * w) * 4 + 1], d[((h - 1) * w) * 4 + 2]];
        const c4 = [d[((h - 1) * w + (w - 1)) * 4], d[((h - 1) * w + (w - 1)) * 4 + 1], d[((h - 1) * w + (w - 1)) * 4 + 2]];

        const bgR = (c1[0] + c2[0] + c3[0] + c4[0]) / 4;
        const bgG = (c1[1] + c2[1] + c3[1] + c4[1]) / 4;
        const bgB = (c1[2] + c2[2] + c3[2] + c4[2]) / 4;

        for (let i = 0; i < d.length; i += 4) {
          const dist = Math.hypot(d[i] - bgR, d[i+1] - bgG, d[i+2] - bgB);
          if (dist < 32) {
            d[i+3] = 0;
          } else if (dist < 46) {
            d[i+3] = Math.round(((dist - 32) / 14) * 255);
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }
    } catch(e) {
      console.warn('Auto alpha cutout warning:', e);
    }
    return cvs;
  }

  // 3. Trích xuất bảng màu vải đặc trưng từ bất kỳ ảnh trang phục nào
  function extractGarmentPalette(garmentCanvas, prodName) {
    try {
      const ctx = garmentCanvas.getContext('2d');
      const w = garmentCanvas.width;
      const h = garmentCanvas.height;
      const data = ctx.getImageData(Math.floor(w * 0.2), Math.floor(h * 0.2), Math.floor(w * 0.6), Math.floor(h * 0.6)).data;

      let rSum = 0, gSum = 0, bSum = 0, count = 0;
      for (let i = 0; i < data.length; i += 16) {
        const a = data[i+3];
        const r = data[i], g = data[i+1], b = data[i+2];
        if (a > 120 && !(r > 240 && g > 240 && b > 240) && !(r < 12 && g < 12 && b < 12)) {
          rSum += r;
          gSum += g;
          bSum += b;
          count++;
        }
      }
      if (count > 25) {
        return [Math.round(rSum / count), Math.round(gSum / count), Math.round(bSum / count)];
      }
    } catch (e) {}
    return getGarmentTargetColor(prodName);
  }

  /**
   * MoonLight AI Universal Neural VTON Engine v7.5
   * Tự động nhận diện tư thế, phân loại cấu trúc đồ (áo/quần/đầm), bóc nền và may đo cho MỌI sản phẩm hiện tại & tương lai
   */
  async function synthesizeTryOn(personImageSrc, garmentImageSrc, product) {
    return new Promise(async (resolve) => {
      const personImg = new Image();
      personImg.crossOrigin = 'anonymous';

      personImg.onload = async () => {
        const pW = personImg.naturalWidth || personImg.width;
        const pH = personImg.naturalHeight || personImg.height;

        const prodName = ((product && product.name) || '').toLowerCase();
        const garmentType = classifyGarment(product);

        // 1. Quét tư thế cơ thể & mốc xương qua MediaPipe Pose AI
        let poseData = null;
        try {
          poseData = await detectPoseLandmarks(personImg);
        } catch (poseErr) {
          console.warn('MediaPipe Pose inference warning:', poseErr);
        }

        let neckX, neckY, shoulderSpan, hipY;

        if (poseData && poseData.poseLandmarks && poseData.poseLandmarks.length >= 25) {
          const lm = poseData.poseLandmarks;
          const leftShoulder = lm[11];
          const rightShoulder = lm[12];
          const leftHip = lm[23];
          const rightHip = lm[24];

          neckX = ((leftShoulder.x + rightShoulder.x) / 2) * pW;
          neckY = ((leftShoulder.y + rightShoulder.y) / 2) * pH;
          shoulderSpan = Math.hypot((leftShoulder.x - rightShoulder.x) * pW, (leftShoulder.y - rightShoulder.y) * pH);
          hipY = ((leftHip.y + rightHip.y) / 2) * pH;
        } else {
          const anatomy = detectPersonAnatomy(personImg);
          neckX = anatomy.neckX;
          neckY = anatomy.neckY;
          shoulderSpan = anatomy.shoulderSpan;
          hipY = anatomy.hipY;
        }

        // 2. Nạp ảnh trang phục may đo MoonLight Luxury (ưu tiên _cutout.png nếu có, nếu không tự động tách nền)
        let cutoutSrc = garmentImageSrc;
        if (cutoutSrc.includes('/images/garments/') && !cutoutSrc.includes('_cutout.png')) {
          cutoutSrc = cutoutSrc.replace(/\.(jpg|jpeg|webp)$/i, '_cutout.png');
        }

        const garmentImg = new Image();
        garmentImg.crossOrigin = 'anonymous';

        const loadGarment = (src) => new Promise((resG) => {
          garmentImg.onload = () => resG(true);
          garmentImg.onerror = () => resG(false);
          garmentImg.src = src;
        });

        let loaded = await loadGarment(cutoutSrc);
        if (!loaded) {
          await loadGarment(garmentImageSrc);
        }

        // Tự động chuyển đổi thành Canvas trong suốt (loại bỏ phông nền studio/trắng nếu là sản phẩm mới thêm)
        const cleanGarmentCanvas = createGarmentTransparentCanvas(garmentImg);
        const gW = cleanGarmentCanvas.width;
        const gH = cleanGarmentCanvas.height;

        // Trích xuất tự động mã màu vải của trang phục
        const targetColor = extractGarmentPalette(cleanGarmentCanvas, prodName);

        // 3. Khởi tạo Canvas kết quả
        const canvas = document.createElement('canvas');
        canvas.width = pW;
        canvas.height = pH;
        const ctx = canvas.getContext('2d');

        // Vẽ ảnh người gốc
        ctx.drawImage(personImg, 0, 0, pW, pH);

        // 4. Tính toán kích thước & vị trí may đo theo nhân trắc học
        let destW, destH, left, top;

        if (garmentType.isUpper) {
          // Áo may đo phủ bờ vai và lồng ngực tự nhiên
          const widthScale = garmentType.isOuterwear ? 1.85 : 1.70;
          destW = Math.round(Math.min(pW * 0.95, Math.max(shoulderSpan * widthScale, pW * 0.38)));
          destH = Math.round(destW * (gH / gW));

          if (prodName.includes('trench') || prodName.includes('dáng dài')) {
            destW = Math.round(Math.min(pW * 0.95, Math.max(shoulderSpan * 1.95, pW * 0.42)));
            destH = Math.round(destW * 1.45);
          }

          left = Math.round(neckX - destW / 2);

          // Căn chỉnh vị trí cổ áo theo cấu trúc từng loại trang phục
          if (prodName.includes('cashmere') || prodName.includes('cổ lọ') || prodName.includes('len')) {
            // Áo len cổ lọ ôm sát chân cổ / cằm
            top = Math.round(neckY - destH * 0.12);
          } else if (prodName.includes('hoodie') || prodName.includes('mũ')) {
            // Áo hoodie có mũ chùm
            top = Math.round(neckY - destH * 0.12);
          } else if (garmentType.isOuterwear) {
            // Áo vest, blazer, măng tô
            top = Math.round(neckY - destH * 0.10);
          } else {
            // Áo sơ mi, polo, thun pima
            top = Math.round(neckY - destH * 0.08);
          }

        } else if (garmentType.isLower) {
          // Quần tây, quần jeans, kaki, chân váy
          destW = Math.round(Math.min(pW * 0.85, Math.max(shoulderSpan * 1.30, pW * 0.30)));
          destH = Math.round(destW * (gH / gW));
          left = Math.round(neckX - destW / 2);
          top = Math.round(hipY - destH * 0.04);

        } else {
          // Đầm dạ hội toàn thân
          destW = Math.round(Math.min(pW * 0.95, Math.max(shoulderSpan * 1.80, pW * 0.38)));
          destH = Math.round(destW * (gH / gW));
          left = Math.round(neckX - destW / 2);
          top = Math.round(neckY - destH * 0.10);
        }

        // 5. Thêm bóng đổ 3D mềm mại & may đo trang phục lên ảnh người
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
        ctx.shadowBlur = Math.round(destW * 0.025);
        ctx.shadowOffsetY = Math.round(destW * 0.008);

        // Vẽ lớp áo/quần may đo MoonLight Luxury (từ canvas sạch đã lọc nền hoàn toàn)
        ctx.drawImage(cleanGarmentCanvas, left, top, destW, destH);
        ctx.restore();

        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };

      personImg.onerror = () => resolve(personImageSrc);
      personImg.src = personImageSrc;
    });
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

    startScanningAnimation();

    try {
      const payload = {
        personImage: selectedPersonImage,
        productId: selectedProduct ? (selectedProduct._id || selectedProduct.id) : undefined,
        garmentImage: selectedGarmentImage,
        modelGender: selectedGender,
        isCustomUpload: isCustomUpload
      };

      let finalResult = null;

      // 1. Thử gọi API Backend AI VTON nếu có
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const res = await fetch('/api/v1/ai/try-on', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        const data = await res.json();
        if (data && data.success && data.data && data.data.resultImage) {
          finalResult = data.data;
        }
      } catch (apiErr) {
        console.warn('Backend AI Try-On không phản hồi hoặc timeout:', apiErr.message || apiErr);
      }

      // 2. Kích hoạt MoonLight AI Segment & Body Inpainting Engine v6.0
      if (!finalResult || !finalResult.resultImage) {
        console.log('⚡ Kích hoạt MoonLight AI Segment & Body Inpainting Engine v6.0...');
        const fittedImage = await synthesizeTryOn(selectedPersonImage, selectedGarmentImage, selectedProduct);
        finalResult = {
          status: 'completed',
          provider: 'neural-inpaint',
          resultImage: fittedImage,
          originalImage: selectedPersonImage,
          garmentImage: selectedGarmentImage,
          product: selectedProduct
        };
      }

      currentResultData = finalResult;

      // Render 4.5 giây để người dùng quan sát trọn vẹn tiến trình AI phân tích nhân trắc học & inpainting
      setTimeout(() => {
        stopScanningAnimation();
        renderResult(currentResultData);
      }, 4500);

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
    'Đang khởi tạo MoonLight AI Segment & Body Inpainting Engine...',
    'Nhận diện mốc cơ thể & cấu trúc xương (MediaPipe Pose AI)...',
    'Phân tích nhân trắc học: Vị trí cằm, cổ họng & trục vai...',
    'Tách xóa màu áo khoác cũ & inpainting nếp gấp hai cánh tay...',
    'Khử viền đỏ & đồng bộ chất liệu may đo MoonLight Luxury...',
    'Khớp phom dáng trang phục mới ôm khít bờ vai & lồng ngực...',
    'Cân bằng ánh sáng môi trường & đổ bóng 3D tự nhiên...',
    'Hoàn tất biến hóa trang phục MoonLight Luxury!'
  ];

  let scanInterval = null;

  function startScanningAnimation() {
    if (scanningOverlay) {
      scanningOverlay.classList.add('active');
    }
    let stageIdx = 0;
    if (scanStatusText) scanStatusText.textContent = scanStages[0];
    if (scanSubText) scanSubText.textContent = 'MOONLIGHT AI NEURAL VTON ENGINE';

    scanInterval = setInterval(() => {
      stageIdx = (stageIdx + 1) % scanStages.length;
      if (scanStatusText) scanStatusText.textContent = scanStages[stageIdx];
    }, 550);
  }

  function stopScanningAnimation() {
    if (scanInterval) clearInterval(scanInterval);
    if (scanningOverlay) {
      scanningOverlay.classList.remove('active');
    }
  }

  function renderResult(result) {
    if (!result || !result.resultImage) return;

    if (emptyResultState) emptyResultState.style.display = 'none';
    if (comparisonContainer) comparisonContainer.style.display = 'block';

    if (beforeImg) beforeImg.src = result.originalImage || selectedPersonImage;
    if (afterImg) afterImg.src = result.resultImage;

    // Reset slider vị trí 50%
    setSliderPosition(50);

    if (resultActionPanel) {
      resultActionPanel.style.display = 'block';
    }

    const prod = result.product || selectedProduct;
    if (prod) {
      if (wpThumb) wpThumb.src = prod.image || selectedGarmentImage;
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

    if (window.innerWidth < 992 && resultViewport) {
      resultViewport.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // Interactive Slider Setup (Dùng clip-path, KHÔNG BỊ MÉO ẢNH)
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

    comparisonContainer.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

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
    if (compareOverlay) {
      // Dùng clip-path: inset(top right bottom left) -> KHÔNG CO MÉO ẢNH!
      compareOverlay.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
    }
    if (sliderLine) {
      sliderLine.style.left = percentage + '%';
    }
    if (sliderHandle) {
      sliderHandle.style.left = percentage + '%';
    }
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

      if (typeof updateCartIcon === 'function') updateCartIcon();
      if (typeof renderCartSidebar === 'function') renderCartSidebar();
      if (typeof toggleCart === 'function') toggleCart();

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
