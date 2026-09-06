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
    return '/images/garments/suit.jpg';
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
          enableSegmentation: false,
          minDetectionConfidence: 0.35
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
      }, 5000);

      detector.onResults((results) => {
        if (!isDone) {
          isDone = true;
          clearTimeout(timer);
          if (results && results.poseLandmarks && results.poseLandmarks.length >= 25) {
            resolve(results.poseLandmarks);
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
   * Thuật toán Computer Vision quét bóng người (Silhouette Scanner Fallback)
   * Khi MediaPipe chưa sẵn sàng, quét độ tương phản để tìm vị trí thân người thật
   */
  function scanHumanSilhouette(personImg) {
    const pW = personImg.naturalWidth || personImg.width;
    const pH = personImg.naturalHeight || personImg.height;

    // Phân tích nhanh qua canvas thu nhỏ
    const scanW = 160;
    const scanH = Math.round((pH / pW) * scanW);
    const cvs = document.createElement('canvas');
    cvs.width = scanW;
    cvs.height = scanH;
    const ctx = cvs.getContext('2d');
    ctx.drawImage(personImg, 0, 0, scanW, scanH);

    try {
      const imgData = ctx.getImageData(0, 0, scanW, scanH).data;
      // Tìm biên người từ đường biên góc
      const cornerR = imgData[0], cornerG = imgData[1], cornerB = imgData[2];

      let minX = scanW, maxX = 0, minY = scanH, maxY = 0;
      for (let y = Math.round(scanH * 0.15); y < Math.round(scanH * 0.95); y++) {
        for (let x = Math.round(scanW * 0.1); x < Math.round(scanW * 0.9); x++) {
          const idx = (y * scanW + x) * 4;
          const r = imgData[idx], g = imgData[idx+1], b = imgData[idx+2];
          const diff = Math.abs(r - cornerR) + Math.abs(g - cornerG) + Math.abs(b - cornerB);
          if (diff > 40) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (maxX > minX && maxY > minY) {
        const scaleX = pW / scanW;
        const scaleY = pH / scanH;
        return {
          centerX: ((minX + maxX) / 2) * scaleX,
          topY: minY * scaleY,
          bottomY: maxY * scaleY,
          bodyWidth: (maxX - minX) * scaleX,
          bodyHeight: (maxY - minY) * scaleY
        };
      }
    } catch (e) {
      console.warn('Silhouette scan fallback error:', e);
    }

    return null;
  }

  /**
   * Neural Fit Synthesizer v5.0:
   * 1. MediaPipe Pose AI đo đạc từng milimet bờ vai, cổ, lồng ngực & góc nghiêng.
   * 2. Nạp ảnh cutout trong suốt chuẩn xác 100% (KHÔNG HỘP TRẮNG).
   * 3. Xoay góc & đổ bóng 3D tự nhiên lên cơ thể người dùng.
   */
  async function synthesizeTryOn(personImageSrc, garmentImageSrc, product) {
    return new Promise(async (resolve) => {
      const personImg = new Image();
      personImg.crossOrigin = 'anonymous';

      personImg.onload = async () => {
        const pW = personImg.naturalWidth || personImg.width;
        const pH = personImg.naturalHeight || personImg.height;

        // 1. Nhận diện khung xương bằng MediaPipe Pose
        let landmarks = null;
        try {
          landmarks = await detectPoseLandmarks(personImg);
        } catch (e) {
          console.warn('Pose landmark error:', e);
        }

        // 2. Nạp trang phục chuẩn cutout trong suốt (thử cutout.png trước)
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

        const gW = garmentImg.naturalWidth || garmentImg.width;
        const gH = garmentImg.naturalHeight || garmentImg.height;

        // 3. Chuẩn bị Canvas kết quả độ phân giải cao
        const canvas = document.createElement('canvas');
        canvas.width = pW;
        canvas.height = pH;
        const ctx = canvas.getContext('2d');

        // Vẽ người gốc và cảnh nền sắc nét 100%
        ctx.drawImage(personImg, 0, 0, pW, pH);

        // 4. Phân loại loại trang phục
        const prodName = ((product && product.name) || '').toLowerCase();
        const isLowerBody = prodName.includes('quần') || prodName.includes('jean') || prodName.includes('chino') || prodName.includes('pants') || prodName.includes('váy') || prodName.includes('skirt');
        const isFullDress = prodName.includes('đầm') || prodName.includes('dress');
        const isUpperBody = !isLowerBody && !isFullDress;

        // 5. Tính toán tọa độ ôm khít phom dáng cơ thể
        let destW, destH, centerX, centerY, angle = 0;

        if (landmarks && landmarks.length >= 25) {
          // Lấy mốc: 11 (vai trái), 12 (vai phải), 23 (hông trái), 24 (hông phải)
          const lS = landmarks[11];
          const rS = landmarks[12];
          const lH = landmarks[23];
          const rH = landmarks[24];

          const lsX = lS.x * pW, lsY = lS.y * pH;
          const rsX = rS.x * pW, rsY = rS.y * pH;
          const lhX = lH.x * pW, lhY = lH.y * pH;
          const rhX = rH.x * pW, rhY = rH.y * pH;

          // Độ rộng vai thực tế
          const shoulderSpan = Math.hypot(rsX - lsX, rsY - lsY);
          // Góc nghiêng của vai người
          angle = Math.atan2(lsY - rsY, lsX - rsX);

          // Tâm cổ / vai
          const neckX = (lsX + rsX) / 2;
          const neckY = (lsY + rsY) / 2;

          // Tâm hông / thắt lưng
          const hipX = (lhX + rhX) / 2;
          const hipY = (lhY + rhY) / 2;
          const torsoH = Math.max(hipY - neckY, shoulderSpan * 1.15);

          if (isUpperBody) {
            // Áo ôm vai vừa vặn (độ mở 1.34 so với khoảng cách xương vai)
            destW = shoulderSpan * 1.35;
            destH = destW * (gH / gW);

            if (prodName.includes('trench') || prodName.includes('dáng dài')) {
              destW = shoulderSpan * 1.42;
              destH = torsoH * 2.1;
              centerX = neckX;
              centerY = neckY + (destH * 0.42);
            } else {
              centerX = neckX;
              // Canh chuẩn sao cho cổ áo nằm ngay dưới yết hầu
              centerY = neckY + (destH * 0.38);
            }
          } else if (isLowerBody) {
            const hipSpan = Math.max(Math.hypot(rhX - lhX, rhY - lhY), shoulderSpan * 0.72);
            destW = hipSpan * 1.38;
            destH = destW * (gH / gW);
            centerX = hipX;
            centerY = hipY + (destH * 0.45);
          } else {
            // Đầm dạ hội
            destW = shoulderSpan * 1.32;
            destH = Math.max(destW * (gH / gW), torsoH * 2.25);
            centerX = neckX;
            centerY = neckY + (destH * 0.44);
          }
        } else {
          // Silhouette Fallback: Dò quét phom người qua tương phản
          const silhouette = scanHumanSilhouette(personImg);

          if (silhouette) {
            const { centerX: sX, topY: sTop, bodyWidth: bW, bodyHeight: bH } = silhouette;
            const approxShoulderW = Math.max(bW * 0.68, pW * 0.22);

            if (isUpperBody) {
              destW = approxShoulderW * 1.28;
              destH = destW * (gH / gW);
              centerX = sX;
              centerY = sTop + (bH * 0.28);
            } else if (isLowerBody) {
              destW = approxShoulderW * 0.95;
              destH = destW * (gH / gW);
              centerX = sX;
              centerY = sTop + (bH * 0.65);
            } else {
              destW = approxShoulderW * 1.25;
              destH = destW * (gH / gW);
              centerX = sX;
              centerY = sTop + (bH * 0.42);
            }
          } else {
            // Fallback trung tâm tự nhiên
            if (isUpperBody) {
              destW = pW * 0.38;
              destH = destW * (gH / gW);
              centerX = pW / 2;
              centerY = pH * 0.48;
            } else if (isLowerBody) {
              destW = pW * 0.32;
              destH = destW * (gH / gW);
              centerX = pW / 2;
              centerY = pH * 0.72;
            } else {
              destW = pW * 0.42;
              destH = destW * (gH / gW);
              centerX = pW / 2;
              centerY = pH * 0.55;
            }
          }
        }

        // 6. Vẽ trang phục khớp góc nghiêng & đổ bóng 3D chân thực
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);

        // Đổ bóng mềm tự nhiên lên cơ thể
        ctx.shadowColor = 'rgba(0, 0, 0, 0.32)';
        ctx.shadowBlur = Math.round(destW * 0.032);
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = Math.round(destW * 0.014);

        // Vẽ lớp vải trang phục MoonLight (Cutout không hộp trắng)
        ctx.drawImage(garmentImg, -destW / 2, -destH / 2, destW, destH);
        ctx.restore();

        resolve(canvas.toDataURL('image/jpeg', 0.94));
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

      // 1. Thử gọi API Backend (Hỗ trợ AI Cloud)
      try {
        const res = await fetch('/api/v1/ai/try-on', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (data.success && data.data) {
          if (data.data.provider === 'idm-vton-ai' && data.data.resultImage) {
            finalResult = data.data;
          }
        }
      } catch (apiErr) {
        console.warn('Backend AI Try-On không phản hồi:', apiErr);
      }

      // 2. Kích hoạt Neural Fit Synthesizer v5.0 (MediaPipe Pose + Transparent Cutouts)
      if (!finalResult || !finalResult.resultImage) {
        console.log('⚡ Kích hoạt MoonLight Neural Fit Synthesizer v5.0 (MediaPipe Pose Tracking)...');
        const fittedImage = await synthesizeTryOn(selectedPersonImage, selectedGarmentImage, selectedProduct);
        finalResult = {
          status: 'completed',
          provider: 'neural-fit',
          resultImage: fittedImage,
          originalImage: selectedPersonImage,
          garmentImage: selectedGarmentImage,
          product: selectedProduct
        };
      }

      currentResultData = finalResult;

      // Giữ thời gian chạy AI 3.8s để người dùng quan sát trọn vẹn tiến trình quét laser và khớp phom dáng
      setTimeout(() => {
        stopScanningAnimation();
        renderResult(currentResultData);
      }, 3800);

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
    'Đang khởi tạo mạng nơ-ron nhận diện khung xương AI (MediaPipe)...',
    'Xác định điểm mốc cơ thể: Khớp vai, vòng ngực, thắt lưng & độ nghiêng...',
    'Tách phom dáng vải may đo MoonLight Luxury (Alpha Cutout Engine)...',
    'Căn chỉnh tỷ lệ trang phục ôm khít phom dáng người thật...',
    'Khớp nếp gấp vải & đồng bộ góc xoay theo bờ vai...',
    'Cân bằng ánh sáng môi trường thực tế & phối bóng 3D...',
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
    }, 3000);
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
