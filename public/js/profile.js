/**
 * MOONLIGHT HAUTE COUTURE - CUSTOMER PROFILE & ORDER STATUS LOGIC
 * Quản lý Thông tin cá nhân (Cố định Họ Tên, Sửa SĐT & Địa chỉ) và Theo dõi Đơn Mua
 */

let profileGeoState = {
  provinces: [],
  districtsCache: {},
  wardsCache: {}
};

let currentOrdersList = [];
let currentFilterStatus = 'all';

document.addEventListener('DOMContentLoaded', () => {
  initProfilePage();
});

async function initProfilePage() {
  const user = JSON.parse(localStorage.getItem('moonlight_user') || 'null');

  if (!user) {
    // Chưa đăng nhập -> Hiển thị thông báo và nút mở popup đăng nhập
    renderLoginRequiredScreen();
    return;
  }

  // 1. Điền thông tin vào Thẻ Hero
  updateHeroCard(user);

  // 2. Điền thông tin vào Form Thông tin cá nhân
  populateProfileForm(user);

  // 3. Khởi tạo bộ chọn địa chỉ phân cấp
  await initProfileAddressSelector(user);

  // 4. Kiểm tra URL param ?tab=
  const urlParams = new URLSearchParams(window.location.search);
  const targetTab = urlParams.get('tab') || 'profile';
  switchProfileTab(targetTab, false);

  // 5. Tải danh sách đơn hàng của khách hàng & tickets
  await loadCustomerOrders();
  loadCustomerTickets();
}

function renderLoginRequiredScreen() {
  const mainContent = document.querySelector('.profile-page-wrapper .container');
  if (!mainContent) return;

  mainContent.innerHTML = `
    <div style="background:#ffffff; border-radius:12px; padding:60px 20px; text-align:center; max-width:600px; margin:40px auto; border:1px solid #e2e8f0; box-shadow:0 6px 20px rgba(0,0,0,0.06);">
      <div style="width:70px; height:70px; border-radius:50%; background:rgba(212,175,55,0.12); color:var(--gold,#d4af37); display:flex; align-items:center; justify-content:center; margin:0 auto 16px; font-size:30px; border:1px solid rgba(212,175,55,0.3);">
        <i class="fas fa-user-lock"></i>
      </div>
      <h3 style="font-size:20px; color:#0f172a; margin-bottom:8px; font-weight:700;">YÊU CẦU ĐĂNG NHẬP</h3>
      <p style="color:#64748b; font-size:14px; margin-bottom:24px; line-height:1.6;">
        Vui lòng đăng nhập vào tài khoản MoonLight của bạn để cập nhật thông tin cá nhân và theo dõi đơn mua hàng.
      </p>
      <div style="display:flex; gap:12px; justify-content:center;">
        <button class="btn-primary" onclick="openAuthModal('login')" style="padding:12px 28px; font-weight:700; border-radius:6px; cursor:pointer;">
          <i class="fas fa-sign-in-alt"></i> ĐĂNG NHẬP NGAY
        </button>
        <a href="index.html" class="btn-order-action" style="padding:12px 24px; font-weight:600; text-decoration:none;">
          VỀ TRANG CHỦ
        </a>
      </div>
    </div>
  `;
}

function updateHeroCard(user) {
  const heroName = document.getElementById('profHeroName');
  const heroTier = document.getElementById('profHeroTier');
  const heroEmail = document.getElementById('profHeroEmail');
  const heroPhone = document.getElementById('profHeroPhone');
  const avatarBox = document.getElementById('profAvatarBox');

  const fullName = user.name || user.username || 'Khách Hàng';
  if (heroName) heroName.textContent = fullName;
  
  const rLower = String(user.role || '').toLowerCase();
  const isStaffOrAdmin = ['admin', 'owner', 'staff'].includes(rLower);

  if (heroTier) {
    if (rLower === 'admin') {
      heroTier.textContent = 'Quản Trị Viên';
    } else if (rLower === 'owner') {
      heroTier.textContent = 'Chủ Cửa Hàng';
    } else if (rLower === 'staff') {
      heroTier.textContent = 'Nhân Viên Cửa Hàng';
    } else {
      heroTier.textContent = user.tier || 'Thành viên MoonLight';
    }
  }

  const sideNavAdminBtn = document.getElementById('sideNavAdminBtn');
  if (sideNavAdminBtn) {
    sideNavAdminBtn.style.display = isStaffOrAdmin ? 'flex' : 'none';
  }

  if (heroEmail) heroEmail.textContent = user.email || 'Chưa liên kết email';
  if (heroPhone) heroPhone.textContent = user.phone ? `SĐT: ${user.phone}` : 'Chưa cập nhật SĐT';

  if (avatarBox) {
    if (user.avatar) {
      avatarBox.innerHTML = `<img src="${user.avatar}" alt="${fullName}">`;
    } else {
      const initial = fullName.charAt(0).toUpperCase() || 'M';
      avatarBox.innerHTML = `<span style="font-size:26px; font-weight:800; color:#000;">${initial}</span>`;
    }
  }
}

function populateProfileForm(user) {
  const profFullName = document.getElementById('profFullName');
  const profUsername = document.getElementById('profUsername');
  const profEmail = document.getElementById('profEmail');
  const profPhone = document.getElementById('profPhone');
  const profStreet = document.getElementById('profStreet');

  // RÀNG BUỘC CỐ ĐỊNH: Họ và tên KHÔNG THỂ SỬA
  if (profFullName) {
    profFullName.value = user.name || user.username || '';
    profFullName.readOnly = true;
    profFullName.classList.add('input-locked');
  }

  if (profUsername) profUsername.value = user.username || '';
  if (profEmail) profEmail.value = user.email || '';

  // SỐ ĐIỆN THOẠI CÓ THỂ SỬA
  if (profPhone) {
    profPhone.value = user.phone || '';
    profPhone.readOnly = false;
  }

  // SỐ NHÀ TÊN ĐƯỜNG CÓ THỂ SỬA
  if (profStreet) {
    profStreet.value = user.street || '';
  }
}

// Chuyển đổi Tab (Thông tin cá nhân <-> Đơn mua <-> Yêu cầu hỗ trợ)
function switchProfileTab(tabName, updateUrl = true) {
  const btnProfile = document.getElementById('btnTabProfile');
  const btnOrders = document.getElementById('btnTabOrders');
  const btnTickets = document.getElementById('btnTabTickets');
  const paneProfile = document.getElementById('paneProfile');
  const paneOrders = document.getElementById('paneOrders');
  const paneTickets = document.getElementById('paneTickets');

  if (btnProfile) btnProfile.classList.remove('active');
  if (btnOrders) btnOrders.classList.remove('active');
  if (btnTickets) btnTickets.classList.remove('active');
  if (paneProfile) paneProfile.style.display = 'none';
  if (paneOrders) paneOrders.style.display = 'none';
  if (paneTickets) paneTickets.style.display = 'none';

  if (tabName === 'orders') {
    if (btnOrders) btnOrders.classList.add('active');
    if (paneOrders) paneOrders.style.display = 'block';
  } else if (tabName === 'tickets') {
    if (btnTickets) btnTickets.classList.add('active');
    if (paneTickets) paneTickets.style.display = 'block';
    if (typeof loadCustomerTickets === 'function') {
      loadCustomerTickets();
    }
  } else {
    if (btnProfile) btnProfile.classList.add('active');
    if (paneProfile) paneProfile.style.display = 'block';
  }

  if (updateUrl && window.history.replaceState) {
    const newUrl = `${window.location.pathname}?tab=${tabName}`;
    window.history.replaceState({ tab: tabName }, '', newUrl);
  }
}

// Khởi tạo bộ chọn Tỉnh / Quận / Phường cho trang hồ sơ
async function initProfileAddressSelector(user) {
  const provEl = document.getElementById('profProvince');
  const distEl = document.getElementById('profDistrict');
  const wardEl = document.getElementById('profWard');
  const streetEl = document.getElementById('profStreet');

  if (!provEl || !distEl || !wardEl) return;

  // Lắng nghe thay đổi số nhà để cập nhật xem trước
  if (streetEl) streetEl.addEventListener('input', updateProfileAddressPreview);

  // 1. Tải danh sách tỉnh thành
  try {
    provEl.innerHTML = '<option value="">-- Đang nạp danh sách Tỉnh/Thành... --</option>';
    let list = [];
    try {
      const res = await fetch('https://provinces.open-api.vn/api/v1/p/');
      if (res.ok) list = await res.json();
    } catch (e) {}

    if (!list || list.length === 0) {
      list = (typeof VN_PROVINCES_FALLBACK !== 'undefined') ? VN_PROVINCES_FALLBACK : [];
    }

    profileGeoState.provinces = list;
    provEl.innerHTML = '<option value="">-- Chọn Tỉnh / Thành phố --</option>' +
      list.map(p => `<option value="${p.code}" data-name="${p.name}">${p.name}</option>`).join('');

  } catch (err) {
    provEl.innerHTML = '<option value="">-- Lỗi tải danh sách Tỉnh/Thành --</option>';
  }

  // 2. Sự kiện đổi Tỉnh / Thành phố
  provEl.addEventListener('change', async function () {
    const pCode = this.value;
    distEl.innerHTML = '<option value="">-- Chọn Quận / Huyện --</option>';
    distEl.disabled = true;
    wardEl.innerHTML = '<option value="">-- Chọn Phường / Xã --</option>';
    wardEl.disabled = true;
    updateProfileAddressPreview();

    if (!pCode) return;

    distEl.innerHTML = '<option value="">-- Đang nạp Quận / Huyện... --</option>';
    try {
      let districts = profileGeoState.districtsCache[pCode];
      if (!districts) {
        const res = await fetch(`https://provinces.open-api.vn/api/v1/p/${pCode}?depth=2`);
        if (res.ok) {
          const data = await res.json();
          districts = data.districts || [];
          profileGeoState.districtsCache[pCode] = districts;
        }
      }
      if (districts && districts.length > 0) {
        distEl.innerHTML = '<option value="">-- Chọn Quận / Huyện --</option>' +
          districts.map(d => `<option value="${d.code}" data-name="${d.name}">${d.name}</option>`).join('');
        distEl.disabled = false;
      }
    } catch (dErr) {
      distEl.innerHTML = '<option value="">-- Lỗi nạp dữ liệu --</option>';
    }
  });

  // 3. Sự kiện đổi Quận / Huyện
  distEl.addEventListener('change', async function () {
    const dCode = this.value;
    wardEl.innerHTML = '<option value="">-- Chọn Phường / Xã --</option>';
    wardEl.disabled = true;
    updateProfileAddressPreview();

    if (!dCode) return;

    wardEl.innerHTML = '<option value="">-- Đang nạp Phường / Xã... --</option>';
    try {
      let wards = profileGeoState.wardsCache[dCode];
      if (!wards) {
        const res = await fetch(`https://provinces.open-api.vn/api/v1/d/${dCode}?depth=2`);
        if (res.ok) {
          const data = await res.json();
          wards = data.wards || [];
          profileGeoState.wardsCache[dCode] = wards;
        }
      }
      if (wards && wards.length > 0) {
        wardEl.innerHTML = '<option value="">-- Chọn Phường / Xã --</option>' +
          wards.map(w => `<option value="${w.code}" data-name="${w.name}">${w.name}</option>`).join('');
        wardEl.disabled = false;
      }
    } catch (wErr) {
      wardEl.innerHTML = '<option value="">-- Lỗi nạp dữ liệu --</option>';
    }
  });

  // 4. Sự kiện đổi Phường / Xã
  wardEl.addEventListener('change', updateProfileAddressPreview);

  // 5. Khôi phục thông tin địa chỉ đã lưu của người dùng
  if (user && (user.province || user.provinceCode)) {
    const pVal = user.provinceCode || user.province;
    let matchedProv = Array.from(provEl.options).find(o => o.value === String(pVal) || o.getAttribute('data-name') === pVal || (pVal && o.text.includes(pVal)));
    if (matchedProv) {
      provEl.value = matchedProv.value;
      provEl.dispatchEvent(new Event('change'));
      setTimeout(() => {
        const dVal = user.districtCode || user.district;
        if (dVal) {
          let matchedDist = Array.from(distEl.options).find(o => o.value === String(dVal) || o.getAttribute('data-name') === dVal || (dVal && o.text.includes(dVal)));
          if (matchedDist) {
            distEl.value = matchedDist.value;
            distEl.dispatchEvent(new Event('change'));
            setTimeout(() => {
              const wVal = user.wardCode || user.ward;
              if (wVal) {
                let matchedWard = Array.from(wardEl.options).find(o => o.value === String(wVal) || o.getAttribute('data-name') === wVal || (wVal && o.text.includes(wVal)));
                if (matchedWard) wardEl.value = matchedWard.value;
                updateProfileAddressPreview();
              }
            }, 180);
          }
        }
      }, 180);
    }
  }
}

function updateProfileAddressPreview() {
  const provEl = document.getElementById('profProvince');
  const distEl = document.getElementById('profDistrict');
  const wardEl = document.getElementById('profWard');
  const streetEl = document.getElementById('profStreet');
  const previewCard = document.getElementById('profAddressPreviewCard');
  const previewText = document.getElementById('profAddressPreviewText');

  if (!provEl) return;

  const street = (streetEl?.value || '').trim();
  const provName = (provEl.selectedIndex > 0 && !provEl.options[provEl.selectedIndex].text.startsWith('--'))
    ? provEl.options[provEl.selectedIndex].text
    : '';
  const distName = (distEl && distEl.selectedIndex > 0 && !distEl.options[distEl.selectedIndex].text.startsWith('--'))
    ? distEl.options[distEl.selectedIndex].text
    : '';
  const wardName = (wardEl && wardEl.selectedIndex > 0 && !wardEl.options[wardEl.selectedIndex].text.startsWith('--'))
    ? wardEl.options[wardEl.selectedIndex].text
    : '';

  const parts = [street, wardName, distName, provName].filter(Boolean);
  const fullAddress = parts.join(', ');

  if (previewCard && previewText) {
    if (fullAddress) {
      previewCard.style.display = 'flex';
      previewText.textContent = fullAddress;
    } else {
      previewCard.style.display = 'none';
    }
  }

  return fullAddress;
}

// Lưu cập nhật thông tin cá nhân (SĐT, Địa chỉ)
async function handleSaveProfile(event) {
  event.preventDefault();
  const submitBtn = document.getElementById('btnSaveProfileSubmit');
  const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';

  const phone = document.getElementById('profPhone')?.value.trim();
  const street = document.getElementById('profStreet')?.value.trim();
  const provEl = document.getElementById('profProvince');
  const distEl = document.getElementById('profDistrict');
  const wardEl = document.getElementById('profWard');

  if (!phone) {
    showToast({ title: 'Thiếu thông tin', message: 'Vui lòng nhập số điện thoại nhận hàng!', type: 'warning' });
    return;
  }

  const province = (provEl && provEl.selectedIndex > 0 && !provEl.options[provEl.selectedIndex].text.startsWith('--'))
    ? provEl.options[provEl.selectedIndex].text
    : '';
  const district = (distEl && distEl.selectedIndex > 0 && !distEl.options[distEl.selectedIndex].text.startsWith('--'))
    ? distEl.options[distEl.selectedIndex].text
    : '';
  const ward = (wardEl && wardEl.selectedIndex > 0 && !wardEl.options[wardEl.selectedIndex].text.startsWith('--'))
    ? wardEl.options[wardEl.selectedIndex].text
    : '';

  const fullAddress = updateProfileAddressPreview() || [street, ward, district, province].filter(Boolean).join(', ');

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG LƯU...';
  }

  try {
    const payload = {
      phone,
      street,
      province,
      district,
      ward,
      address: fullAddress,
      provinceCode: provEl?.value || '',
      districtCode: distEl?.value || '',
      wardCode: wardEl?.value || ''
    };

    // RÀNG BUỘC CỐ ĐỊNH: Tuyệt đối không gửi trường 'name' để không ai có thể sửa tên
    const res = await MoonlightAPI.updateProfile(payload);

    if (res && res.success) {
      const updatedUser = res.data?.user;
      if (updatedUser) {
        updateHeroCard(updatedUser);
        if (typeof updateCustomerNavbarUI === 'function') updateCustomerNavbarUI();
      }

      showToast({
        title: 'Cập nhật thành công',
        message: 'Thông tin cá nhân và địa chỉ nhận hàng của bạn đã được lưu!',
        type: 'success'
      });
    } else {
      throw new Error(res?.message || 'Không thể lưu thông tin hồ sơ.');
    }
  } catch (err) {
    showToast({
      title: 'Lỗi cập nhật',
      message: err.message || 'Không thể lưu thông tin lúc này. Vui lòng thử lại!',
      type: 'error'
    });
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
    }
  }
}

// Xử lý đổi mật khẩu
async function handleChangePassword(event) {
  event.preventDefault();
  const currentPassword = document.getElementById('pwdCurrent').value;
  const newPassword = document.getElementById('pwdNew').value;
  const confirmPassword = document.getElementById('pwdConfirm').value;
  const submitBtn = document.getElementById('btnChangePwdSubmit');

  if (newPassword !== confirmPassword) {
    showToast({ title: 'Mật khẩu không khớp', message: 'Mật khẩu xác nhận không trùng khớp với mật khẩu mới!', type: 'warning' });
    return;
  }

  if (newPassword.length < 3) {
    showToast({ title: 'Mật khẩu quá ngắn', message: 'Mật khẩu mới phải có tối thiểu 3 ký tự!', type: 'warning' });
    return;
  }

  const originalContent = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG ĐỔI...';

  try {
    const res = await MoonlightAPI.changePassword(currentPassword, newPassword);
    if (res && res.success) {
      showToast({ title: 'Thành công', message: 'Đổi mật khẩu tài khoản thành công!', type: 'success' });
      document.getElementById('changePasswordForm').reset();
    } else {
      throw new Error(res?.message || 'Mật khẩu hiện tại không chính xác.');
    }
  } catch (err) {
    showToast({ title: 'Đổi mật khẩu thất bại', message: err.message || 'Lỗi đổi mật khẩu', type: 'error' });
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalContent;
  }
}

// Tải danh sách đơn hàng của khách hàng từ Server
async function loadCustomerOrders() {
  const container = document.getElementById('customerOrdersContainer');
  if (!container) return;

  try {
    let orders = [];
    const res = await MoonlightAPI.getMyOrders();

    if (res && res.data) {
      orders = Array.isArray(res.data) ? res.data : (res.data.items || []);
    }

    if (!orders || orders.length === 0) {
      // Fallback tìm đơn qua số điện thoại nếu DB chưa đồng bộ user id
      const user = JSON.parse(localStorage.getItem('moonlight_user') || 'null');
      if (user && user.phone) {
        const localOrders = JSON.parse(localStorage.getItem('moonlight_all_orders') || '[]');
        orders = localOrders.filter(o => o.customer?.phone === user.phone);
      }
    }

    currentOrdersList = orders;
    updateOrdersCounters(orders);
    populateTicketOrderCodes(orders);
    renderCustomerOrders(currentFilterStatus);

  } catch (err) {
    console.error('Lỗi tải danh sách đơn hàng:', err);
    container.innerHTML = `
      <div style="text-align:center; padding:40px 20px; color:#ef4444;">
        <i class="fas fa-exclamation-triangle" style="font-size:32px; margin-bottom:10px;"></i>
        <p style="font-size:14px;">Không thể tải danh sách đơn hàng lúc này. Quý khách vui lòng thử lại sau.</p>
        <button class="btn-order-action" onclick="loadCustomerOrders()" style="margin-top:12px;">
          <i class="fas fa-redo"></i> TẢI LẠI
        </button>
      </div>
    `;
  }
}

function updateOrdersCounters(orders) {
  const totalCount = orders.length;
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const confirmedCount = orders.filter(o => o.status === 'confirmed').length;
  const shippingCount = orders.filter(o => o.status === 'shipping').length;
  const completedCount = orders.filter(o => o.status === 'completed').length;
  const cancelledCount = orders.filter(o => o.status === 'cancelled').length;

  const navCounter = document.getElementById('navOrdersCounter');
  if (navCounter) navCounter.textContent = totalCount;

  // Cập nhật filter pills
  const cAll = document.getElementById('countFilterAll');
  const cPending = document.getElementById('countFilterPending');
  const cConfirmed = document.getElementById('countFilterConfirmed');
  const cShipping = document.getElementById('countFilterShipping');
  const cCompleted = document.getElementById('countFilterCompleted');
  const cCancelled = document.getElementById('countFilterCancelled');

  if (cAll) cAll.textContent = totalCount;
  if (cPending) cPending.textContent = pendingCount;
  if (cConfirmed) cConfirmed.textContent = confirmedCount;
  if (cShipping) cShipping.textContent = shippingCount;
  if (cCompleted) cCompleted.textContent = completedCount;
  if (cCancelled) cCancelled.textContent = cancelledCount;
}

// Lọc đơn hàng theo trạng thái
function filterCustomerOrders(status) {
  currentFilterStatus = status;
  document.querySelectorAll('.orders-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-status') === status);
  });
  renderCustomerOrders(status);
}

// Render giao diện danh sách đơn hàng kèm Stepper tiến trình
function renderCustomerOrders(filterStatus = 'all') {
  const container = document.getElementById('customerOrdersContainer');
  if (!container) return;

  let filtered = currentOrdersList;
  if (filterStatus !== 'all') {
    filtered = currentOrdersList.filter(o => o.status === filterStatus);
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:50px 20px; color:#64748b;">
        <i class="fas fa-box-open" style="font-size:46px; color:#cbd5e1; margin-bottom:14px; display:block;"></i>
        <h4 style="font-size:16px; color:#0f172a; margin-bottom:6px; font-weight:700;">Không có đơn hàng nào</h4>
        <p style="font-size:13px; margin-bottom:20px;">Quý khách chưa có đơn hàng nào trong danh mục này.</p>
        <a href="catalog.html" class="btn-primary" style="display:inline-flex; padding:10px 24px; font-size:12.5px; border-radius:4px; text-decoration:none;">
          MUA SẮM NGAY
        </a>
      </div>
    `;
    return;
  }

  const statusMeta = {
    pending: { label: 'Chờ tiếp nhận', class: 'pending', icon: 'fa-clock' },
    confirmed: { label: 'Đã xác nhận', class: 'confirmed', icon: 'fa-check-circle' },
    shipping: { label: 'Đang giao hàng', class: 'shipping', icon: 'fa-shipping-fast' },
    completed: { label: 'Giao thành công', class: 'completed', icon: 'fa-box-check' },
    cancelled: { label: 'Đã hủy đơn', class: 'cancelled', icon: 'fa-times-circle' }
  };

  container.innerHTML = filtered.map(order => {
    const meta = statusMeta[order.status] || { label: order.status, class: 'pending', icon: 'fa-info-circle' };
    const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : (order.date || 'Gần đây');
    const items = order.items || [];
    const totalAmount = Number(order.total || 0).toLocaleString('vi-VN');
    const orderId = order._id || order.id;
    const isPending = order.status === 'pending';
    const isCancelled = order.status === 'cancelled';
    const isBanking = order.paymentMethod === 'banking';
    const isPaid = Boolean(order.isPaid);

    // Tính toán stepper (Tiến trình 4 bước)
    let stepperHtml = '';
    if (isCancelled) {
      stepperHtml = `
        <div class="order-cancelled-notice">
          <i class="fas fa-exclamation-circle" style="font-size:18px;"></i>
          <div>
            <strong>Đơn hàng đã bị hủy.</strong> Lý do: ${order.cancelReason || 'Theo yêu cầu của khách hàng'}.
          </div>
        </div>
      `;
    } else {
      const stepIdx = ['pending', 'confirmed', 'shipping', 'completed'].indexOf(order.status);
      const fillWidth = stepIdx <= 0 ? '0%' : (stepIdx === 1 ? '33%' : (stepIdx === 2 ? '66%' : '100%'));

      stepperHtml = `
        <div class="order-stepper">
          <div class="stepper-progress-fill" style="width: ${fillWidth};"></div>
          <div class="stepper-step ${stepIdx >= 0 ? 'completed' : ''} ${stepIdx === 0 ? 'active' : ''}">
            <div class="stepper-circle"><i class="fas fa-file-invoice"></i></div>
            <div class="stepper-label">Đã đặt hàng</div>
          </div>
          <div class="stepper-step ${stepIdx >= 1 ? 'completed' : ''} ${stepIdx === 1 ? 'active' : ''}">
            <div class="stepper-circle"><i class="fas fa-clipboard-check"></i></div>
            <div class="stepper-label">Đã xác nhận</div>
          </div>
          <div class="stepper-step ${stepIdx >= 2 ? 'completed' : ''} ${stepIdx === 2 ? 'active' : ''}">
            <div class="stepper-circle"><i class="fas fa-truck-fast"></i></div>
            <div class="stepper-label">Đang giao</div>
          </div>
          <div class="stepper-step ${stepIdx >= 3 ? 'completed' : ''} ${stepIdx === 3 ? 'active' : ''}">
            <div class="stepper-circle"><i class="fas fa-box-open"></i></div>
            <div class="stepper-label">Giao thành công</div>
          </div>
        </div>
      `;
    }

    // Danh sách sản phẩm trong đơn
    const itemsHtml = items.map(item => {
      const img = item.img || item.image || 'img/products/suit-demo.png';
      const name = item.productName || item.name || 'Sản phẩm may đo';
      const variant = item.variant || [item.color, item.size].filter(Boolean).join(' - ') || 'Tiêu chuẩn';
      const qty = item.quantity || 1;
      const price = Number(item.price || 0).toLocaleString('vi-VN');
      const itemSubtotal = Number(item.subtotal || (item.price * qty)).toLocaleString('vi-VN');

      return `
        <div class="order-item-row">
          <img src="${img}" alt="${name}" class="order-item-img" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'60\\' height=\\'70\\' fill=\\'%23f1f5f9\\'><rect width=\\'100%\\' height=\\'100%\\'/></svg>'">
          <div class="order-item-info">
            <h5>${name}</h5>
            <p>Phân loại: <strong>${variant}</strong> · Số lượng: <strong>${qty}</strong></p>
            <p style="color:#94a3b8; font-size:11.5px;">Đơn giá: ${price}₫</p>
          </div>
          <div class="order-item-price">${itemSubtotal}₫</div>
        </div>
      `;
    }).join('');

    // Thông tin người nhận
    const cusName = order.customer?.name || 'Khách hàng';
    const cusPhone = order.customer?.phone || '--';
    const cusAddress = order.customer?.address || 'Chưa cung cấp địa chỉ';
    const cusNote = order.customer?.note ? `<div style="font-size:12px; color:#64748b; margin-top:4px;"><em>Ghi chú: ${order.customer.note}</em></div>` : '';

    return `
      <div class="order-box-card" id="orderCard_${orderId}">
        <!-- Header đơn hàng -->
        <div class="order-box-header">
          <div>
            <span class="order-code-badge">MÃ ĐƠN: ${order.orderCode || '#' + String(orderId).slice(-6)}</span>
            <span class="order-date-text"><i class="far fa-calendar-alt"></i> ${dateStr}</span>
          </div>
          <div>
            <span class="badge-status ${meta.class}">
              <i class="fas ${meta.icon}"></i> ${meta.label}
            </span>
          </div>
        </div>

        <!-- Tiến trình Stepper -->
        ${stepperHtml}

        <!-- Danh sách mặt hàng -->
        <div class="order-items-wrapper">
          ${itemsHtml}
        </div>

        <!-- Thông tin giao hàng & thanh toán -->
        <div style="background:#f8fafc; border-radius:8px; padding:12px 14px; margin-top:12px; font-size:12.5px; line-height:1.6; color:#334155; border:1px solid #f1f5f9;">
          <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:16px;">
            <div>
              <div><i class="fas fa-user" style="color:var(--gold,#d4af37); width:16px;"></i> Người nhận: <strong>${cusName}</strong> · SĐT: <strong>${cusPhone}</strong></div>
              <div><i class="fas fa-map-marker-alt" style="color:var(--gold,#d4af37); width:16px;"></i> Địa chỉ: ${cusAddress}</div>
              ${cusNote}
            </div>
            <div>
              <div>Phương thức: <strong>${isBanking ? 'Chuyển khoản TPBank (VietQR)' : 'Thanh toán khi nhận hàng (COD)'}</strong></div>
              <div>Trạng thái TT: <strong style="color:${isPaid ? '#059669' : '#d97706'};">${isPaid ? '<i class="fas fa-check-circle"></i> Đã thanh toán' : '<i class="fas fa-hourglass-half"></i> Chưa thanh toán'}</strong></div>
              ${isBanking && !isPaid ? `
                <button onclick="showOrderVietQrModal('${order.orderCode}', ${order.total || 0})" style="margin-top:6px; background:transparent; border:1px solid var(--gold,#d4af37); color:#b48518; padding:3px 10px; border-radius:4px; font-size:11px; cursor:pointer; font-weight:700;">
                  <i class="fas fa-qrcode"></i> Xem mã QR thanh toán
                </button>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Footer tổng tiền & nút thao tác -->
        <div class="order-box-footer">
          <div>
            <span style="font-size:13px; color:#64748b;">Tổng giá trị thanh toán: </span>
            <span class="order-total-sum">${totalAmount}₫</span>
          </div>
          <div class="order-actions-group">
            ${isPending ? `
              <button class="btn-order-action danger" onclick="handleCancelCustomerOrder('${orderId}', '${order.orderCode || ''}')">
                <i class="fas fa-ban"></i> HỦY ĐƠN HÀNG
              </button>
            ` : ''}
            <button class="btn-order-action primary" onclick="handleRepurchaseOrder('${orderId}')">
              <i class="fas fa-cart-plus"></i> MUA LẠI ĐƠN NÀY
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Khách hàng tự hủy đơn hàng (khi đơn còn ở trạng thái Pending)
async function handleCancelCustomerOrder(orderId, orderCode) {
  const reason = prompt(`Quý khách có chắc chắn muốn hủy đơn hàng ${orderCode || ''}?\nVui lòng nhập lý do hủy (hoặc bấm OK để tiếp tục):`, 'Tôi muốn đổi sản phẩm / địa chỉ khác');
  if (reason === null) return; // Khách bấm Cancel trên prompt

  try {
    showToast({ title: 'Đang xử lý', message: 'Đang tiến hành hủy đơn hàng...', type: 'info' });
    const res = await MoonlightAPI.cancelMyOrder(orderId, reason.trim() || 'Khách hàng tự hủy đơn qua trang cá nhân');

    if (res && res.success) {
      showToast({ title: 'Hủy thành công', message: `Đơn hàng ${orderCode || ''} đã được hủy thành công.`, type: 'success' });
      await loadCustomerOrders();
    } else {
      throw new Error(res?.message || 'Không thể hủy đơn hàng lúc này.');
    }
  } catch (err) {
    showToast({ title: 'Hủy đơn thất bại', message: err.message || 'Lỗi hủy đơn hàng', type: 'error' });
  }
}

// Mua lại đơn hàng: Thêm lại tất cả sản phẩm vào giỏ hàng
function handleRepurchaseOrder(orderId) {
  const order = currentOrdersList.find(o => String(o._id || o.id) === String(orderId));
  if (!order || !order.items || order.items.length === 0) {
    showToast({ title: 'Lỗi', message: 'Không tìm thấy sản phẩm trong đơn hàng!', type: 'warning' });
    return;
  }

  let cart = JSON.parse(localStorage.getItem('moonlight_cart') || '[]');

  order.items.forEach(item => {
    const pId = item.productId || item.id || item._id;
    const existing = cart.find(x => String(x.id) === String(pId) && x.color === item.color && x.size === item.size);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
    } else {
      cart.push({
        id: pId,
        productId: pId,
        name: item.productName || item.name,
        price: item.price,
        img: item.img || item.image || '',
        color: item.color || '',
        size: item.size || '',
        quantity: item.quantity || 1
      });
    }
  });

  localStorage.setItem('moonlight_cart', JSON.stringify(cart));
  if (typeof updateCartIcon === 'function') updateCartIcon();

  showToast({
    title: 'Đã thêm vào giỏ',
    message: `Đã thêm ${order.items.length} món từ đơn hàng vào giỏ hàng của bạn!`,
    type: 'success'
  });

  setTimeout(() => {
    window.location.href = 'checkout.html';
  }, 800);
}

// Hiển thị mã QR Chuyển khoản TPBank
function showOrderVietQrModal(orderCode, amount) {
  const modal = document.getElementById('profileQrModal');
  const qrImg = document.getElementById('profileQrImg');
  const amountText = document.getElementById('profileQrAmountText');
  const memoText = document.getElementById('profileQrMemoText');

  if (!modal || !qrImg) return;

  const total = Number(amount) || 0;
  const qrUrl = `https://img.vietqr.io/image/TPB-89896789999-compact2.png?amount=${total}&addInfo=${encodeURIComponent(orderCode)}&accountName=VU%20PHAM%20LUAN`;

  qrImg.src = qrUrl;
  if (amountText) amountText.textContent = `${total.toLocaleString('vi-VN')}₫`;
  if (memoText) memoText.textContent = orderCode;

  modal.style.display = 'flex';
}

// ==========================================
// HỆ THỐNG YÊU CẦU HỖ TRỢ / TICKET KHÁCH HÀNG
// ==========================================

let currentTicketsList = [];
let currentTicketFilterStatus = 'all';

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function toggleNewTicketForm() {
  const container = document.getElementById('newTicketFormContainer');
  const btn = document.getElementById('btnToggleNewTicketForm');
  if (!container) return;

  const isHidden = container.style.display === 'none' || !container.style.display;
  if (isHidden) {
    container.style.display = 'block';
    if (btn) btn.innerHTML = '<i class="fas fa-times"></i> Đóng biểu mẫu';
    const subj = document.getElementById('ticketSubject');
    if (subj) subj.focus();
  } else {
    container.style.display = 'none';
    if (btn) btn.innerHTML = '<i class="fas fa-plus"></i> Tạo yêu cầu mới';
  }
}

function populateTicketOrderCodes(orders) {
  const select = document.getElementById('ticketOrderCode');
  if (!select) return;
  const currentVal = select.value;
  select.innerHTML = '<option value="">-- Không liên quan đơn cụ thể --</option>' +
    orders.map(o => {
      const code = o.orderCode || o.id || o._id;
      const total = Number(o.total || o.totalAmount || 0).toLocaleString('vi-VN');
      return `<option value="${code}">#${code} (${total}₫)</option>`;
    }).join('');
  if (currentVal) select.value = currentVal;
}

async function loadCustomerTickets() {
  const container = document.getElementById('customerTicketsContainer');
  if (!container) return;

  try {
    const res = await MoonlightAPI.getMyTickets();
    let tickets = [];
    if (res && res.data) {
      tickets = Array.isArray(res.data) ? res.data : (res.data.items || []);
    }
    currentTicketsList = tickets;
    updateTicketCounters(tickets);
    renderCustomerTickets(currentTicketFilterStatus);
  } catch (err) {
    console.error('Lỗi tải danh sách yêu cầu hỗ trợ:', err);
    container.innerHTML = `
      <div style="text-align:center; padding:30px 20px; color:#ef4444;">
        <i class="fas fa-exclamation-triangle" style="font-size:30px; margin-bottom:10px;"></i>
        <p style="font-size:13.5px;">Không thể tải danh sách phiếu hỗ trợ lúc này. Vui lòng thử lại.</p>
        <button class="btn-order-action" onclick="loadCustomerTickets()" style="margin-top:10px;">
          <i class="fas fa-redo"></i> TẢI LẠI
        </button>
      </div>
    `;
  }
}

function updateTicketCounters(tickets) {
  const total = tickets.length;
  const pending = tickets.filter(t => t.status === 'pending' || t.status === 'processing').length;
  const replied = tickets.filter(t => t.status === 'replied').length;
  const closed = tickets.filter(t => t.status === 'closed' || t.status === 'resolved').length;

  const elAll = document.getElementById('countTicketAll');
  const elPending = document.getElementById('countTicketPending');
  const elReplied = document.getElementById('countTicketReplied');
  const elClosed = document.getElementById('countTicketClosed');
  const elNavCounter = document.getElementById('navTicketsCounter');

  if (elAll) elAll.textContent = total;
  if (elPending) elPending.textContent = pending;
  if (elReplied) elReplied.textContent = replied;
  if (elClosed) elClosed.textContent = closed;

  if (elNavCounter) {
    const activeCount = pending + replied;
    if (activeCount > 0) {
      elNavCounter.textContent = activeCount;
      elNavCounter.style.display = 'inline-flex';
    } else {
      elNavCounter.style.display = 'none';
    }
  }
}

function filterCustomerTickets(status) {
  currentTicketFilterStatus = status;
  const tabsContainer = document.querySelector('#paneTickets .orders-filter-tabs');
  if (tabsContainer) {
    tabsContainer.querySelectorAll('.orders-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-status') === status);
    });
  }
  renderCustomerTickets(status);
}

function renderCustomerTickets(filterStatus = 'all') {
  const container = document.getElementById('customerTicketsContainer');
  if (!container) return;

  let filtered = currentTicketsList;
  if (filterStatus === 'pending') {
    filtered = currentTicketsList.filter(t => t.status === 'pending' || t.status === 'processing');
  } else if (filterStatus === 'replied') {
    filtered = currentTicketsList.filter(t => t.status === 'replied');
  } else if (filterStatus === 'closed') {
    filtered = currentTicketsList.filter(t => t.status === 'closed' || t.status === 'resolved');
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:50px 20px; color:#64748b;">
        <i class="fas fa-headset" style="font-size:42px; color:#cbd5e1; margin-bottom:12px; display:block;"></i>
        <h4 style="font-size:16px; color:#0f172a; margin-bottom:6px; font-weight:700;">Chưa có yêu cầu hỗ trợ nào</h4>
        <p style="font-size:13px; margin-bottom:18px;">Bạn có thể tạo yêu cầu mới nếu cần tư vấn kích thước, đổi trả hoặc hỗ trợ đơn hàng.</p>
        <button type="button" class="btn-primary" onclick="toggleNewTicketForm()" style="padding:9px 22px; font-size:12.5px; border-radius:5px; border:none; cursor:pointer;">
          <i class="fas fa-plus"></i> TẠO YÊU CẦU NGAY
        </button>
      </div>
    `;
    return;
  }

  const statusMeta = {
    pending: { label: 'Chờ tiếp nhận', bg: '#fef3c7', color: '#b45309', border: '#fde68a', icon: 'fa-clock' },
    processing: { label: 'Đang xử lý', bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd', icon: 'fa-spinner fa-spin' },
    replied: { label: 'Đã phản hồi', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0', icon: 'fa-comment-dots' },
    resolved: { label: 'Đã giải quyết', bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', icon: 'fa-check-circle' },
    closed: { label: 'Đã đóng', bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0', icon: 'fa-lock' }
  };

  const categoryNames = {
    order_issue: 'Sự cố đơn hàng',
    size_advice: 'Tư vấn may đo / Size',
    return_refund: 'Đổi trả / Hoàn tiền',
    payment: 'Thanh toán / Chuyển khoản',
    other: 'Yêu cầu khác'
  };

  const priorityMeta = {
    low: { label: 'Thấp', color: '#64748b' },
    medium: { label: 'Bình thường', color: '#0284c7' },
    high: { label: 'Cao', color: '#ea580c' },
    urgent: { label: 'Khẩn cấp', color: '#dc2626' }
  };

  container.innerHTML = filtered.map(t => {
    const sm = statusMeta[t.status] || { label: t.status, bg: '#f1f5f9', color: '#475569', border: '#cbd5e1', icon: 'fa-info-circle' };
    const catLabel = categoryNames[t.category] || t.category;
    const pri = priorityMeta[t.priority] || { label: 'Bình thường', color: '#0284c7' };
    const dateStr = t.createdAt ? new Date(t.createdAt).toLocaleString('vi-VN') : '';
    const isClosed = t.status === 'closed' || t.status === 'resolved';

    let replySection = '';
    if (t.reply && t.reply.message) {
      const replyDate = t.reply.repliedAt ? new Date(t.reply.repliedAt).toLocaleString('vi-VN') : '';
      replySection = `
        <div class="ticket-reply-box">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:6px;">
            <span style="font-size:12.5px; font-weight:700; color:#0f172a; display:flex; align-items:center; gap:6px;">
              <i class="fas fa-certificate" style="color:var(--gold,#d4af37);"></i>
              Phản hồi từ ${escapeHtml(t.reply.repliedBy || 'Chuyên viên CSKH MoonLight')}:
            </span>
            <span style="font-size:11.5px; color:#94a3b8;"><i class="far fa-clock"></i> ${replyDate}</span>
          </div>
          <div style="font-size:13.5px; color:#1e293b; line-height:1.6; white-space:pre-wrap;">${escapeHtml(t.reply.message)}</div>
        </div>
      `;
    }

    return `
      <div class="ticket-item-card" id="ticketCard-${t._id}">
        <div class="ticket-header-row">
          <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
            <span class="ticket-code-tag"><i class="fas fa-ticket-alt"></i> ${t.ticketCode || 'TK-#'}</span>
            <span style="font-size:12px; font-weight:600; color:#475569; background:#f1f5f9; padding:3px 10px; border-radius:4px;">
              ${catLabel}
            </span>
            ${t.orderCode ? `<span style="font-size:12px; color:#0284c7; font-weight:600; background:#f0f9ff; padding:3px 10px; border-radius:4px; border:1px solid #bae6fd;"><i class="fas fa-box"></i> Đơn: #${t.orderCode}</span>` : ''}
            <span style="font-size:11.5px; font-weight:600; color:${pri.color};">
              Ưu tiên: ${pri.label}
            </span>
          </div>
          <div>
            <span style="display:inline-flex; align-items:center; gap:5px; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:700; background:${sm.bg}; color:${sm.color}; border:1px solid ${sm.border};">
              <i class="fas ${sm.icon}"></i> ${sm.label}
            </span>
          </div>
        </div>

        <div style="margin-bottom:12px;">
          <h4 style="font-size:15px; font-weight:700; color:#0f172a; margin-bottom:6px;">${escapeHtml(t.subject)}</h4>
          <p style="font-size:13.5px; color:#334155; line-height:1.6; margin:0; white-space:pre-wrap;">${escapeHtml(t.message)}</p>
        </div>

        ${replySection}

        <div style="display:flex; justify-content:space-between; align-items:center; padding-top:12px; border-top:1px solid #f1f5f9; margin-top:14px; flex-wrap:wrap; gap:10px;">
          <div style="font-size:12px; color:#94a3b8;">
            <i class="far fa-calendar-alt"></i> Gửi lúc: ${dateStr}
          </div>
          <div>
            ${!isClosed ? `
              <button type="button" class="btn-order-action" onclick="handleCloseCustomerTicket('${t._id}')" style="font-size:12px; padding:6px 14px; border-color:#cbd5e1;">
                <i class="fas fa-check"></i> Đánh dấu đã giải quyết / Đóng ticket
              </button>
            ` : `
              <span style="font-size:12px; color:#94a3b8;"><i class="fas fa-lock"></i> Phiếu đã đóng</span>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function handleCustomerSubmitTicket(event) {
  event.preventDefault();
  const btn = document.getElementById('btnSubmitTicket');
  const cat = document.getElementById('ticketCategory')?.value;
  const orderCode = document.getElementById('ticketOrderCode')?.value;
  const subject = document.getElementById('ticketSubject')?.value?.trim();
  const priority = document.getElementById('ticketPriority')?.value || 'medium';
  const message = document.getElementById('ticketMessage')?.value?.trim();

  if (!subject || !message) {
    showToast({ title: 'Thiếu thông tin', message: 'Vui lòng điền đầy đủ tiêu đề và nội dung yêu cầu!', type: 'warning' });
    return;
  }

  try {
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi yêu cầu...';
    }

    const payload = {
      category: cat,
      orderCode: orderCode || undefined,
      subject,
      priority,
      message
    };

    const res = await MoonlightAPI.createTicket(payload);
    if (res && (res.success || res.data)) {
      showToast({
        title: 'Gửi thành công!',
        message: 'Yêu cầu của quý khách đã được gửi đến bộ phận CSKH MoonLight. Chúng tôi sẽ xử lý sớm nhất.',
        type: 'success'
      });

      const form = document.getElementById('newTicketForm');
      if (form) form.reset();
      toggleNewTicketForm();

      await loadCustomerTickets();
    } else {
      showToast({ title: 'Lỗi', message: res?.message || 'Không thể gửi yêu cầu lúc này.', type: 'danger' });
    }
  } catch (err) {
    console.error('Lỗi khi tạo ticket:', err);
    showToast({ title: 'Lỗi', message: err.message || 'Không thể kết nối đến máy chủ.', type: 'danger' });
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> GỬI YÊU CẦU HỖ TRỢ';
    }
  }
}

async function handleCloseCustomerTicket(ticketId) {
  if (!confirm('Quý khách có chắc chắn muốn đóng phiếu hỗ trợ này không?')) return;

  try {
    const res = await MoonlightAPI.closeMyTicket(ticketId);
    if (res && (res.success || res.data)) {
      showToast({ title: 'Thành công', message: 'Đã đóng yêu cầu hỗ trợ.', type: 'success' });
      await loadCustomerTickets();
    } else {
      showToast({ title: 'Lỗi', message: res?.message || 'Không thể đóng ticket lúc này.', type: 'danger' });
    }
  } catch (err) {
    console.error('Lỗi khi đóng ticket:', err);
    showToast({ title: 'Lỗi', message: err.message || 'Có lỗi xảy ra khi đóng ticket.', type: 'danger' });
  }
}
