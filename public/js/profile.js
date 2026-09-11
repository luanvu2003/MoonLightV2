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
    setTimeout(() => {
      document.querySelectorAll('.ticket-messages-scroll').forEach(el => {
        el.scrollTop = el.scrollHeight;
      });
    }, 120);
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

// ==========================================
// HỘP THOẠI MODAL CONTAINER TÙY CHỈNH (THAY THẾ WINDOW.CONFIRM & PROMPT)
// ==========================================
let pendingCustConfirmResolve = null;

function ensureCustConfirmModalHtml() {
  if (document.getElementById('custConfirmModal')) return;
  const div = document.createElement('div');
  div.id = 'custConfirmModal';
  div.className = 'cust-modal-overlay';
  div.style.display = 'none';
  div.innerHTML = `
    <div class="cust-modal-card">
      <button type="button" class="cust-modal-close-btn" onclick="closeCustConfirmModal(false)" title="Đóng">
        <i class="fas fa-times"></i>
      </button>
      <div class="cust-modal-icon-wrapper" id="custConfirmIconWrap">
        <i class="fas fa-question" id="custConfirmIcon"></i>
      </div>
      <h3 class="cust-modal-title" id="custConfirmTitle">Xác nhận thao tác</h3>
      <div class="cust-modal-desc" id="custConfirmMessage">Bạn có chắc chắn muốn thực hiện hành động này không?</div>
      
      <div id="custConfirmInputWrap" style="display:none; margin-bottom:20px; text-align:left;">
        <label id="custConfirmInputLabel" style="display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:6px;">Lý do:</label>
        <textarea id="custConfirmInput" rows="2" style="width:100%; box-sizing:border-box; border:1.5px solid #cbd5e1; border-radius:12px; padding:10px 12px; font-size:13px; outline:none; resize:none; font-family:inherit;"></textarea>
      </div>

      <div class="cust-modal-actions">
        <button type="button" class="cust-modal-cancel-btn" id="custConfirmCancelBtn" onclick="closeCustConfirmModal(false)">HỦY BỎ</button>
        <button type="button" class="cust-modal-confirm-btn" id="custConfirmAcceptBtn">XÁC NHẬN</button>
      </div>
    </div>
  `;
  document.body.appendChild(div);
}

function showCustomConfirmModal({
  title = 'Xác nhận thao tác',
  message = 'Bạn có chắc chắn muốn thực hiện hành động này không?',
  icon = 'fa-question-circle',
  iconType = 'primary', // 'primary' | 'warning' | 'danger' | 'success'
  confirmText = 'ĐỒNG Ý',
  cancelText = 'HỦY BỎ',
  isDanger = false
}) {
  return new Promise((resolve) => {
    ensureCustConfirmModalHtml();
    const modal = document.getElementById('custConfirmModal');
    const iconWrap = document.getElementById('custConfirmIconWrap');
    const iconEl = document.getElementById('custConfirmIcon');
    const titleEl = document.getElementById('custConfirmTitle');
    const msgEl = document.getElementById('custConfirmMessage');
    const acceptBtn = document.getElementById('custConfirmAcceptBtn');
    const cancelBtn = document.getElementById('custConfirmCancelBtn');
    const inputWrap = document.getElementById('custConfirmInputWrap');

    if (!modal) return resolve(window.confirm(message));

    pendingCustConfirmResolve = resolve;

    if (titleEl) titleEl.innerText = title;
    if (msgEl) msgEl.innerHTML = message;
    if (iconEl) iconEl.className = `fas ${icon}`;

    if (iconWrap) {
      iconWrap.className = 'cust-modal-icon-wrapper';
      if (iconType && iconType !== 'primary') {
        iconWrap.classList.add(iconType);
      }
    }

    if (inputWrap) inputWrap.style.display = 'none';

    if (cancelBtn) {
      cancelBtn.style.display = 'block';
      cancelBtn.innerText = cancelText;
    }

    if (acceptBtn) {
      acceptBtn.innerText = confirmText;
      acceptBtn.className = `cust-modal-confirm-btn ${isDanger ? 'danger' : ''}`;
      acceptBtn.onclick = () => closeCustConfirmModal(true);
    }

    modal.onclick = (e) => {
      if (e.target === modal) closeCustConfirmModal(false);
    };

    modal.style.display = 'flex';
    requestAnimationFrame(() => {
      modal.classList.add('open');
    });
  });
}

function showCustomPromptModal({
  title = 'Nhập thông tin',
  message = 'Vui lòng nhập nội dung bên dưới:',
  label = 'Lý do:',
  placeholder = 'Nhập nội dung...',
  defaultValue = '',
  icon = 'fa-edit',
  iconType = 'primary',
  confirmText = 'XÁC NHẬN',
  cancelText = 'HỦY BỎ',
  isDanger = false
}) {
  return new Promise((resolve) => {
    ensureCustConfirmModalHtml();
    const modal = document.getElementById('custConfirmModal');
    const iconWrap = document.getElementById('custConfirmIconWrap');
    const iconEl = document.getElementById('custConfirmIcon');
    const titleEl = document.getElementById('custConfirmTitle');
    const msgEl = document.getElementById('custConfirmMessage');
    const acceptBtn = document.getElementById('custConfirmAcceptBtn');
    const cancelBtn = document.getElementById('custConfirmCancelBtn');
    const inputWrap = document.getElementById('custConfirmInputWrap');
    const inputLabel = document.getElementById('custConfirmInputLabel');
    const inputEl = document.getElementById('custConfirmInput');

    if (!modal) return resolve(window.prompt(message, defaultValue));

    pendingCustConfirmResolve = resolve;

    if (titleEl) titleEl.innerText = title;
    if (msgEl) msgEl.innerHTML = message;
    if (iconEl) iconEl.className = `fas ${icon}`;

    if (iconWrap) {
      iconWrap.className = 'cust-modal-icon-wrapper';
      if (iconType && iconType !== 'primary') {
        iconWrap.classList.add(iconType);
      }
    }

    if (inputWrap) {
      inputWrap.style.display = 'block';
      if (inputLabel) inputLabel.innerText = label;
      if (inputEl) {
        inputEl.placeholder = placeholder;
        inputEl.value = defaultValue;
      }
    }

    if (cancelBtn) {
      cancelBtn.style.display = 'block';
      cancelBtn.innerText = cancelText;
    }

    if (acceptBtn) {
      acceptBtn.innerText = confirmText;
      acceptBtn.className = `cust-modal-confirm-btn ${isDanger ? 'danger' : ''}`;
      acceptBtn.onclick = () => {
        const val = inputEl ? inputEl.value : '';
        closeCustConfirmModal(val);
      };
    }

    modal.onclick = (e) => {
      if (e.target === modal) closeCustConfirmModal(null);
    };

    modal.style.display = 'flex';
    requestAnimationFrame(() => {
      modal.classList.add('open');
      if (inputEl) {
        inputEl.focus();
        inputEl.select();
      }
    });
  });
}

function closeCustConfirmModal(result = false) {
  const modal = document.getElementById('custConfirmModal');
  if (modal) {
    modal.classList.remove('open');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 250);
  }
  if (typeof pendingCustConfirmResolve === 'function') {
    const fn = pendingCustConfirmResolve;
    pendingCustConfirmResolve = null;
    fn(result);
  }
}

// Bắt phím Escape để đóng modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('custConfirmModal');
    if (modal && modal.classList.contains('open')) {
      closeCustConfirmModal(false);
    }
  }
});

// Khách hàng tự hủy đơn hàng (khi đơn còn ở trạng thái Pending)
async function handleCancelCustomerOrder(orderId, orderCode) {
  const reason = await showCustomPromptModal({
    title: 'Xác nhận hủy đơn hàng',
    message: `Quý khách có chắc chắn muốn hủy đơn hàng <strong>${escapeHtml(orderCode || '')}</strong>?<br>Vui lòng cho MoonLight biết lý do bên dưới:`,
    label: 'Lý do hủy đơn hàng:',
    placeholder: 'Nhập lý do hủy (ví dụ: Tôi muốn đổi màu / size hoặc địa chỉ khác)...',
    defaultValue: 'Tôi muốn đổi sản phẩm / địa chỉ khác',
    icon: 'fa-exclamation-triangle',
    iconType: 'danger',
    confirmText: 'HỦY ĐƠN HÀNG',
    cancelText: 'GIỮ LẠI ĐƠN',
    isDanger: true
  });
  if (reason === null || reason === false) return; // Khách bấm Hủy bỏ

  try {
    showToast({ title: 'Đang xử lý', message: 'Đang tiến hành hủy đơn hàng...', type: 'info' });
    const res = await MoonlightAPI.cancelMyOrder(orderId, (typeof reason === 'string' && reason.trim()) ? reason.trim() : 'Khách hàng tự hủy đơn qua trang cá nhân');

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

  // Lưu lại draft người dùng đang nhập và phần tử đang focus để không bao giờ bị mất chữ
  const activeFocusedId = document.activeElement ? document.activeElement.id : null;
  const savedDrafts = {};
  if (Array.isArray(currentTicketsList)) {
    currentTicketsList.forEach(t => {
      const tid = t._id || t.id;
      const inp = document.getElementById(`custTicketInput-${tid}`);
      if (inp && inp.value) {
        savedDrafts[tid] = inp.value;
      }
    });
  }

  container.innerHTML = filtered.map(t => {
    const sm = statusMeta[t.status] || { label: t.status, bg: '#f1f5f9', color: '#475569', border: '#cbd5e1', icon: 'fa-info-circle' };
    const catLabel = categoryNames[t.category] || t.category;
    const pri = priorityMeta[t.priority] || { label: 'Bình thường', color: '#0284c7' };
    const dateStr = t.createdAt ? new Date(t.createdAt).toLocaleString('vi-VN') : '';
    const isClosed = t.status === 'closed' || t.status === 'resolved';

    // Tổng hợp danh sách tin nhắn trong cuộc hội thoại (hỗ trợ cả dữ liệu cũ)
    let msgList = [];
    if (Array.isArray(t.messages) && t.messages.length > 0) {
      msgList = t.messages;
    } else {
      if (t.message) {
        msgList.push({
          senderRole: 'customer',
          senderName: 'Bạn',
          message: t.message,
          createdAt: t.createdAt
        });
      }
      if (t.reply && t.reply.message) {
        msgList.push({
          senderRole: 'admin',
          senderName: t.reply.repliedBy || 'CSKH MoonLight',
          message: t.reply.message,
          createdAt: t.reply.repliedAt || t.updatedAt
        });
      }
    }

    const hasAdminReplied = msgList.some(m => m.senderRole === 'admin' || m.senderRole === 'staff');

    return `
      <div class="ticket-item-card" id="ticketCard-${t._id}" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin-bottom:20px; box-shadow:0 2px 10px rgba(0,0,0,0.03);">
        <div class="ticket-header-row" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:10px;">
          <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
            <span class="ticket-code-tag" style="background:#0f172a; color:#fff; font-size:12px; font-weight:700; padding:4px 10px; border-radius:6px;"><i class="fas fa-ticket-alt" style="color:var(--gold,#d4af37);"></i> ${t.ticketCode || 'TK-#'}</span>
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

        <div style="margin-bottom:14px;">
          <h4 style="font-size:15.5px; font-weight:700; color:#0f172a; margin-bottom:4px;">${escapeHtml(t.subject)}</h4>
          <span style="font-size:11.5px; color:#94a3b8;"><i class="far fa-clock"></i> Khởi tạo lúc: ${dateStr}</span>
        </div>

        <!-- KHUNG TRAO ĐỔI TIN NHẮN (CHAT THREAD) -->
        <div class="ticket-chat-box" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; padding:18px 20px; margin-bottom:16px;">
          <div style="font-size:12.5px; font-weight:700; color:#334155; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
            <span><i class="fas fa-comments" style="color:var(--gold,#d4af37); margin-right:7px; font-size:14px;"></i> Lịch sử trao đổi (<span id="custMsgCount-${t._id}">${msgList.length}</span> tin nhắn)</span>
            <span style="font-size:11.5px; font-weight:600; color:#10b981; display:flex; align-items:center; gap:5px;"><i class="fas fa-circle" style="font-size:7px;"></i> Hỗ trợ trực tuyến</span>
          </div>

          <div class="ticket-chat-scroll-wrapper" style="position:relative; margin-bottom:12px;">
            <div class="ticket-messages-scroll" id="custMsgScroll-${t._id}" onscroll="handleCustomerChatScroll('${t._id}')" style="min-height:420px; max-height:560px; overflow-y:auto; display:flex; flex-direction:column; gap:2px; padding:16px 18px; background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; box-shadow:inset 0 1px 4px rgba(0,0,0,0.02);">
              ${renderCustomerChatMessagesHtml(t._id, msgList, !hasAdminReplied && !isClosed)}
            </div>

            <!-- NÚT NHẢY ĐẾN TIN NHẮN HIỆN TẠI & THÔNG BÁO TIN MỚI -->
            <button type="button" id="custJumpBtn-${t._id}" class="ticket-jump-to-latest-btn" onclick="jumpCustomerChatToBottom('${t._id}')" style="display:none;" title="Nhảy đến tin nhắn mới nhất">
              <span id="custNewMsgPill-${t._id}" class="ticket-new-msg-pill" style="display:none;"><i class="fas fa-bell fa-shake"></i> Tin mới</span>
              <span class="jump-btn-label"><i class="fas fa-arrow-down"></i> Tin mới nhất</span>
            </button>
          </div>

          <!-- INPUT GỬI TIN NHẮN PHẢN HỒI TIẾP (TEXTAREA & ATTACHMENTS) -->
          ${!isClosed ? `
            <form onsubmit="handleSendCustomerMessage(event, '${t._id}')" class="ticket-chat-form-box">
              <!-- KHỐI XEM TRƯỚC TỆP ĐÍNH KÈM (ATTACHMENT PREVIEW CHIP) -->
              <div id="custAttachPreview-${t._id}" style="display:none;" class="ticket-attach-preview-chip">
                <div style="display:flex; align-items:center; gap:8px; overflow:hidden;">
                  <i id="custAttachIcon-${t._id}" class="fas fa-paperclip" style="font-size:14px; color:#0284c7;"></i>
                  <div style="display:flex; flex-direction:column; overflow:hidden;">
                    <strong id="custAttachName-${t._id}"></strong>
                    <span id="custAttachSize-${t._id}"></span>
                  </div>
                </div>
                <button type="button" class="ticket-attach-remove-btn" onclick="handleRemoveCustAttach('${t._id}')" title="Bỏ đính kèm">
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <!-- THANH TIẾN TRÌNH UPLOAD FILE (REAL-TIME PROGRESS) -->
              <div id="custUploadProgressBox-${t._id}" style="display:none;" class="ticket-upload-progress-box">
                <div class="ticket-upload-progress-header">
                  <span id="custUploadStatusText-${t._id}"><i class="fas fa-cloud-arrow-up fa-fade"></i> Đang tải lên...</span>
                  <span id="custUploadPercent-${t._id}">0%</span>
                </div>
                <div class="ticket-upload-progress-track">
                  <div id="custUploadBarFill-${t._id}" class="ticket-upload-progress-fill"></div>
                </div>
              </div>

              <!-- TEXTAREA NHIỀU DÒNG TỰ CO GIÃN -->
              <textarea id="custTicketInput-${t._id}"
                class="cust-ticket-textarea"
                rows="1"
                placeholder="Nhập tin nhắn... (Shift+Enter để xuống dòng, Enter để gửi)"
                oninput="handleCustTextareaInput('${t._id}')"
                onkeydown="handleCustTextareaKeydown(event, '${t._id}')"></textarea>

              <div class="ticket-form-bottom-row">
                <div class="ticket-form-tools-left">
                  <!-- Nút đính kèm ảnh / video -->
                  <label class="btn-ticket-attach" title="Đính kèm ảnh (< 5MB) hoặc video (< 500MB)">
                    <i class="fas fa-paperclip"></i>
                    <input type="file" id="custTicketFile-${t._id}" accept="image/*,video/*" style="display:none;" onchange="handleCustFileSelect(event, '${t._id}')">
                  </label>
                  <label class="btn-ticket-attach" title="Đính kèm ảnh từ thiết bị" onclick="document.getElementById('custTicketFile-${t._id}').click();">
                    <i class="fas fa-image"></i>
                  </label>
                  <span id="custFileHint-${t._id}" style="font-size:11px; color:#94a3b8;">Ảnh &lt; 5MB · Video &lt; 500MB</span>
                </div>
                <button type="submit" id="btnCustSend-${t._id}" class="btn-ticket-send" title="Gửi tin nhắn (Enter)">
                  <span>Gửi</span>
                  <i class="fas fa-paper-plane"></i>
                </button>
              </div>
            </form>
          ` : `
            <div style="margin-top:12px; display:flex; justify-content:space-between; align-items:center; background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:8px 14px; font-size:12px; color:#64748b; flex-wrap:wrap; gap:8px;">
              <span><i class="fas fa-lock"></i> Phiếu hỗ trợ này đã hoàn tất/đóng.</span>
              <button type="button" class="btn-order-action" onclick="handleReopenCustomerTicket('${t._id}')" style="font-size:11.5px; padding:4px 12px; border-color:#cbd5e1; background:#f8fafc;">
                <i class="fas fa-rotate-left"></i> Mở lại cuộc trò chuyện này
              </button>
            </div>
          `}
        </div>

        <div style="display:flex; justify-content:flex-end; align-items:center; padding-top:10px; border-top:1px solid #f1f5f9; gap:10px;">
          ${!isClosed ? `
            <button type="button" class="btn-order-action" onclick="handleCloseCustomerTicket('${t._id}')" style="font-size:12px; padding:6px 14px; border-color:#cbd5e1;">
              <i class="fas fa-check"></i> Đã giải quyết xong / Đóng ticket
            </button>
          ` : `
            <span style="font-size:12px; color:#94a3b8;"><i class="fas fa-lock"></i> Phiếu đã đóng</span>
          `}
        </div>
      </div>
    `;
  }).join('');

  // Khôi phục lại nội dung draft và focus cho người dùng
  Object.keys(savedDrafts).forEach(tid => {
    const inp = document.getElementById(`custTicketInput-${tid}`);
    if (inp) {
      inp.value = savedDrafts[tid];
    }
  });
  if (activeFocusedId) {
    const el = document.getElementById(activeFocusedId);
    if (el) {
      el.focus();
      if (typeof el.selectionStart === 'number') {
        el.selectionStart = el.selectionEnd = el.value.length;
      }
    }
  }

  // Tự động cuộn xuống tin nhắn mới nhất cho toàn bộ cuộc trò chuyện
  setTimeout(() => {
    filtered.forEach(t => {
      const tid = t._id || t.id;
      scrollCustomerChatToBottom(tid, false);
    });
  }, 60);
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
  const confirmed = await showCustomConfirmModal({
    title: 'Xác nhận đóng yêu cầu hỗ trợ',
    message: 'Quý khách có chắc chắn vấn đề đã được hỗ trợ xong và muốn đóng phiếu hỗ trợ này không?',
    icon: 'fa-clipboard-check',
    iconType: 'warning',
    confirmText: 'ĐỒNG Ý ĐÓNG',
    cancelText: 'HỦY BỎ',
    isDanger: false
  });
  if (!confirmed) return;

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

// Tự động nhận diện và biến đổi URL thành clickable links
function formatChatContent(rawText) {
  if (!rawText) return '';
  // Xóa khoảng trắng và dòng trống dư thừa ở đầu và cuối
  let cleaned = String(rawText).trim();
  // Giới hạn tối đa 2 lần xuống dòng liên tiếp (tránh người dùng spam Enter tạo khoảng trống lớn)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  const escaped = escapeHtml(cleaned);
  const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
  return escaped.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="chat-link"><i class="fas fa-external-link-alt" style="font-size:10px; margin-right:3px;"></i>${url}</a>`;
  });
}

// Render ảnh hoặc video đính kèm trong tin nhắn
function renderMessageAttachments(attachments, isCust) {
  if (!Array.isArray(attachments) || attachments.length === 0) return '';

  return `<div class="chat-media-attachment-wrap">` + attachments.map(att => {
    if (att.type === 'video' || (att.url && att.url.match(/\.(mp4|webm|mov|mkv)$/i))) {
      return `
        <div style="max-width:100%;">
          <video controls preload="metadata" class="chat-media-video">
            <source src="${escapeHtml(att.url)}" type="video/mp4">
            Trình duyệt không hỗ trợ phát video này.
          </video>
          ${att.name ? `<div style="font-size:11px; color:#64748b; margin-top:3px;"><i class="fas fa-file-video"></i> ${escapeHtml(att.name)}</div>` : ''}
        </div>
      `;
    } else if (att.type === 'image' || (att.url && att.url.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i))) {
      return `
        <div>
          <img src="${escapeHtml(att.url)}" alt="${escapeHtml(att.name || 'Ảnh đính kèm')}" class="chat-media-image" onclick="openChatImageLightbox('${escapeHtml(att.url)}')">
        </div>
      `;
    } else {
      return `
        <div>
          <a href="${escapeHtml(att.url)}" target="_blank" download style="display:inline-flex; align-items:center; gap:6px; font-size:12px; color:#0284c7; text-decoration:none; background:#f1f5f9; padding:6px 12px; border-radius:8px;">
            <i class="fas fa-paperclip"></i> <span>${escapeHtml(att.name || 'Tệp đính kèm')}</span>
          </a>
        </div>
      `;
    }
  }).join('') + `</div>`;
}

// Lightbox phóng to ảnh khi nhấp vào
function openChatImageLightbox(imgUrl) {
  let modal = document.getElementById('chatImageLightbox');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'chatImageLightbox';
    modal.style.cssText = "position:fixed; inset:0; background:rgba(0,0,0,0.88); z-index:99999; display:flex; align-items:center; justify-content:center; padding:20px; cursor:zoom-out; backdrop-filter:blur(4px);";
    modal.onclick = () => { modal.style.display = 'none'; };
    modal.innerHTML = `
      <div style="position:relative; max-width:90vw; max-height:90vh; display:flex; align-items:center; justify-content:center;">
        <img id="chatLightboxImg" src="" style="max-width:100%; max-height:90vh; border-radius:8px; box-shadow:0 20px 50px rgba(0,0,0,0.5); object-fit:contain;">
        <button type="button" style="position:absolute; top:-14px; right:-14px; width:32px; height:32px; border-radius:50%; background:#fff; color:#000; border:none; font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(0,0,0,0.3);">&times;</button>
      </div>
    `;
    document.body.appendChild(modal);
  }
  const img = document.getElementById('chatLightboxImg');
  if (img) img.src = imgUrl;
  modal.style.display = 'flex';
}

// Định dạng mốc thời gian phân tách (Time divider)
function formatTimeDivider(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${hours}:${minutes} · ${day}/${month}/${year}`;
}

function renderCustomerChatMessagesHtml(ticketId, msgList, showPendingNotice) {
  let html = '';

  msgList.forEach((m, idx) => {
    const isCust = m.senderRole === 'customer';
    const mTime = m.createdAt ? new Date(m.createdAt).toLocaleString('vi-VN') : '';
    const mDateObj = m.createdAt ? new Date(m.createdAt) : null;

    const prev = idx > 0 ? msgList[idx - 1] : null;
    const next = idx < msgList.length - 1 ? msgList[idx + 1] : null;

    const prevDateObj = prev && prev.createdAt ? new Date(prev.createdAt) : null;
    const nextDateObj = next && next.createdAt ? new Date(next.createdAt) : null;

    // Phân tách mốc thời gian (Time Divider) nếu là tin đầu tiên hoặc cách tin trước hơn 45 phút / khác ngày
    let showTimeDivider = false;
    let dividerLabel = '';
    if (idx === 0 && mDateObj) {
      showTimeDivider = true;
      dividerLabel = formatTimeDivider(m.createdAt);
    } else if (prevDateObj && mDateObj) {
      const timeDiff = mDateObj - prevDateObj;
      const isDifferentDay = prevDateObj.toDateString() !== mDateObj.toDateString();
      if (timeDiff > 45 * 60 * 1000 || isDifferentDay) {
        showTimeDivider = true;
        dividerLabel = formatTimeDivider(m.createdAt);
      }
    }

    if (showTimeDivider) {
      html += `
        <div class="chat-time-divider" style="display:flex; justify-content:center; align-items:center; margin:16px 0 10px 0; width:100%;">
          <span style="font-size:11px; color:#64748b; background:#f1f5f9; border:1px solid #e2e8f0; padding:3px 12px; border-radius:12px; font-weight:600; letter-spacing:0.2px;">
            ${dividerLabel}
          </span>
        </div>
      `;
    }

    // Kiểm tra tin nhắn trước và sau có cùng người gửi không
    // Cùng một người gửi liên tiếp nếu cùng senderRole VÀ không bị ngắt bởi time divider lớn
    const sameSenderAsPrev = !showTimeDivider && prev && prev.senderRole === m.senderRole;

    // Tin nhắn tiếp theo có cùng người gửi không
    let nextHasDivider = false;
    if (next && nextDateObj && mDateObj) {
      const nextDiff = nextDateObj - mDateObj;
      const nextDiffDay = nextDateObj.toDateString() !== mDateObj.toDateString();
      if (nextDiff > 45 * 60 * 1000 || nextDiffDay) {
        nextHasDivider = true;
      }
    }
    const sameSenderAsNext = !nextHasDivider && next && next.senderRole === m.senderRole;

    const isFirstInGroup = !sameSenderAsPrev;
    const isLastInGroup = !sameSenderAsNext;

    const itemMarginTop = isFirstInGroup ? (idx === 0 && !showTimeDivider ? '0px' : '10px') : '2px';

    // Bo góc chuẩn Facebook Messenger
    let custRadius = '18px';
    if (!isFirstInGroup && !isLastInGroup) {
      custRadius = '18px 4px 4px 18px'; // Ở giữa cụm
    } else if (isFirstInGroup && !isLastInGroup) {
      custRadius = '18px 18px 4px 18px'; // Đầu cụm
    } else if (!isFirstInGroup && isLastInGroup) {
      custRadius = '18px 4px 18px 18px'; // Cuối cụm
    }

    let adminRadius = '18px';
    if (!isFirstInGroup && !isLastInGroup) {
      adminRadius = '4px 18px 18px 4px';
    } else if (isFirstInGroup && !isLastInGroup) {
      adminRadius = '18px 18px 18px 4px';
    } else if (!isFirstInGroup && isLastInGroup) {
      adminRadius = '4px 18px 18px 18px';
    }

    const hasText = Boolean(m.message && m.message.trim());
    const hasMedia = Array.isArray(m.attachments) && m.attachments.length > 0;

    if (isCust) {
      // Tin nhắn Khách hàng gửi (bên phải): Messenger style
      let bubbleHtml = '';
      if (!hasText && hasMedia) {
        // Chỉ gửi ảnh/video: Trong suốt, không bọc bóng xanh khổng lồ
        bubbleHtml = `<div class="chat-msg-bubble chat-bubble-media-only" title="${mTime}" style="background:transparent !important; border:none !important; box-shadow:none !important; padding:0 !important; width:fit-content; max-width:78%;">${renderMessageAttachments(m.attachments, true)}</div>`;
      } else if (hasText && hasMedia) {
        // Có cả ảnh/video và chú thích văn bản
        bubbleHtml = `<div class="chat-msg-bubble" title="${mTime}" style="background:linear-gradient(135deg, #0284c7, #0369a1); color:#ffffff; padding:6px; border-radius:${custRadius}; width:fit-content; max-width:78%; box-shadow:0 2px 8px rgba(2,132,199,0.18);">${renderMessageAttachments(m.attachments, true)}<div class="chat-msg-text" style="padding:6px 8px 3px 8px; font-size:13.5px; line-height:1.45; word-break:break-word; overflow-wrap:anywhere; white-space:pre-wrap;">${formatChatContent(m.message)}</div></div>`;
      } else {
        // Chỉ gửi văn bản (gọn gàng, vừa khít nội dung, không bị kéo dài)
        bubbleHtml = `<div class="chat-msg-bubble" title="${mTime}" style="background:linear-gradient(135deg, #0284c7, #0369a1); color:#ffffff; padding:8px 14px; border-radius:${custRadius}; width:fit-content; max-width:78%; font-size:13.5px; line-height:1.45; word-break:break-word; overflow-wrap:anywhere; box-shadow:0 2px 6px rgba(2,132,199,0.15);"><div class="chat-msg-text" style="word-break:break-word; overflow-wrap:anywhere; white-space:pre-wrap;">${formatChatContent(m.message)}</div></div>`;
      }

      html += `
        <div class="cust-chat-msg-item" data-msg-role="customer" style="display:flex; flex-direction:column; align-items:flex-end; margin-top:${itemMarginTop};">
          ${bubbleHtml}
          ${isLastInGroup ? renderCustomerMessageStatus(m.status) : ''}
        </div>
      `;
    } else {
      // Tin nhắn CSKH gửi (bên trái): Chỉ hiện tên CSKH ở tin nhắn đầu tiên trong cụm
      let adminBubbleHtml = '';
      if (!hasText && hasMedia) {
        adminBubbleHtml = `<div class="chat-msg-bubble chat-bubble-media-only" title="${mTime}" style="background:transparent !important; border:none !important; box-shadow:none !important; padding:0 !important; width:fit-content; max-width:78%;">${renderMessageAttachments(m.attachments, false)}</div>`;
      } else if (hasText && hasMedia) {
        adminBubbleHtml = `<div class="chat-msg-bubble" title="${mTime}" style="background:#ffffff; border:1px solid #e2e8f0; color:#0f172a; padding:6px; border-radius:${adminRadius}; width:fit-content; max-width:78%; box-shadow:0 2px 8px rgba(0,0,0,0.04);">${renderMessageAttachments(m.attachments, false)}<div class="chat-msg-text" style="padding:6px 8px 3px 8px; font-size:13.5px; line-height:1.45; word-break:break-word; overflow-wrap:anywhere; white-space:pre-wrap;">${formatChatContent(m.message)}</div></div>`;
      } else {
        adminBubbleHtml = `<div class="chat-msg-bubble" title="${mTime}" style="background:#ffffff; border:1px solid #e2e8f0; color:#0f172a; padding:8px 14px; border-radius:${adminRadius}; width:fit-content; max-width:78%; font-size:13.5px; line-height:1.45; word-break:break-word; overflow-wrap:anywhere; box-shadow:0 2px 6px rgba(0,0,0,0.03);"><div class="chat-msg-text" style="word-break:break-word; overflow-wrap:anywhere; white-space:pre-wrap;">${formatChatContent(m.message)}</div></div>`;
      }

      html += `
        <div class="cust-chat-msg-item" data-msg-role="admin" style="display:flex; flex-direction:column; align-items:flex-start; margin-top:${itemMarginTop};">
          ${isFirstInGroup ? `
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:3px; font-size:11px; color:#64748b; padding-left:2px;">
              <strong style="color:var(--gold,#b48518); display:flex; align-items:center; gap:4px;">
                <i class="fas fa-headset"></i> ${escapeHtml(m.senderName || 'CSKH MoonLight')}
              </strong>
            </div>
          ` : ''}
          ${adminBubbleHtml}
        </div>
      `;
    }
  });

  if (showPendingNotice) {
    html += `
      <div id="custPendingNotice-${ticketId}" style="text-align:center; padding:10px 14px; background:#f0f9ff; border:1px dashed #bae6fd; border-radius:8px; font-size:12px; color:#0369a1; margin-top:8px;">
        <i class="fas fa-hourglass-half fa-spin"></i> Chuyên viên CSKH MoonLight đang tiếp nhận yêu cầu và sẽ trả lời bạn ngay tại khung chat này.
      </div>
    `;
  }

  html += `
    <!-- KHỐI HIỂN THỊ ĐANG NHẬP TIN NHẮN (TYPING INDICATOR) -->
    <div id="custTypingIndicator-${ticketId}" style="display:none; align-items:center; gap:6px; font-size:11.5px; color:#b48518; background:rgba(212,175,55,0.1); border:1px dashed rgba(212,175,55,0.35); padding:6px 14px; border-radius:12px; width:fit-content; margin-top:6px;">
      <i class="fas fa-pen-nib fa-bounce"></i>
      <span id="custTypingText-${ticketId}">CSKH MoonLight đang nhập tin nhắn...</span>
    </div>
  `;

  return html;
}

// Quản lý số tin nhắn mới khi người dùng đang cuộn lên xem lịch sử
const custNewMsgCount = {};

function scrollCustomerChatToBottom(ticketId, smooth = false) {
  const scrollEl = document.getElementById(`custMsgScroll-${ticketId}`);
  if (!scrollEl) return;

  if (smooth) {
    scrollEl.scrollTo({ top: scrollEl.scrollHeight, behavior: 'smooth' });
  } else {
    scrollEl.scrollTop = scrollEl.scrollHeight;
  }

  const jumpBtn = document.getElementById(`custJumpBtn-${ticketId}`);
  const pill = document.getElementById(`custNewMsgPill-${ticketId}`);
  if (jumpBtn) {
    jumpBtn.style.display = 'none';
    jumpBtn.classList.remove('has-new-messages');
  }
  if (pill) {
    pill.style.display = 'none';
  }
  custNewMsgCount[ticketId] = 0;
}

function jumpCustomerChatToBottom(ticketId) {
  scrollCustomerChatToBottom(ticketId, true);
}

function handleCustomerChatScroll(ticketId) {
  const scrollEl = document.getElementById(`custMsgScroll-${ticketId}`);
  const jumpBtn = document.getElementById(`custJumpBtn-${ticketId}`);
  const pill = document.getElementById(`custNewMsgPill-${ticketId}`);
  if (!scrollEl || !jumpBtn) return;

  const isNearBottom = scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight < 65;

  if (isNearBottom) {
    jumpBtn.style.display = 'none';
    jumpBtn.classList.remove('has-new-messages');
    if (pill) pill.style.display = 'none';
    custNewMsgCount[ticketId] = 0;
  } else {
    jumpBtn.style.display = 'inline-flex';
  }
}

function renderCustomerChatThreadOnly(ticket) {
  const ticketId = ticket._id || ticket.id;
  const scrollEl = document.getElementById(`custMsgScroll-${ticketId}`);
  if (!scrollEl) return;

  let msgList = [];
  if (Array.isArray(ticket.messages) && ticket.messages.length > 0) {
    msgList = ticket.messages;
  } else if (ticket.message) {
    msgList.push({
      senderRole: 'customer',
      senderName: ticket.customerName || 'Bạn',
      message: ticket.message,
      createdAt: ticket.createdAt
    });
  }

  const isClosed = ticket.status === 'closed' || ticket.status === 'resolved';
  const hasAdminReplied = msgList.some(m => m.senderRole === 'admin' || m.senderRole === 'staff');

  const countEl = document.getElementById(`custMsgCount-${ticketId}`);
  const prevCount = parseInt(countEl?.innerText || '0', 10);
  if (countEl) countEl.innerText = `${msgList.length}`;

  const curTypingEl = document.getElementById(`custTypingIndicator-${ticketId}`);
  const wasTyping = curTypingEl && curTypingEl.style.display !== 'none';
  const curTypingText = document.getElementById(`custTypingText-${ticketId}`)?.innerText || '';

  // Kiểm tra nếu người dùng đang ở sát đáy
  const isNearBottom = scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight < 75;

  scrollEl.innerHTML = renderCustomerChatMessagesHtml(ticketId, msgList, !hasAdminReplied && !isClosed);

  if (wasTyping) {
    const newTypingEl = document.getElementById(`custTypingIndicator-${ticketId}`);
    const newTypingText = document.getElementById(`custTypingText-${ticketId}`);
    if (newTypingEl && newTypingText) {
      newTypingText.innerText = curTypingText;
      newTypingEl.style.display = 'inline-flex';
    }
  }

  const hasNewMsgs = msgList.length > prevCount;
  if (hasNewMsgs) {
    if (isNearBottom) {
      setTimeout(() => {
        scrollCustomerChatToBottom(ticketId, true);
      }, 50);
    } else {
      // Người dùng đang cuộn lên xem tin cũ -> hiển thị badge có tin nhắn mới
      const diff = msgList.length - prevCount;
      custNewMsgCount[ticketId] = (custNewMsgCount[ticketId] || 0) + diff;
      const jumpBtn = document.getElementById(`custJumpBtn-${ticketId}`);
      const pill = document.getElementById(`custNewMsgPill-${ticketId}`);
      if (jumpBtn) {
        jumpBtn.style.display = 'inline-flex';
        jumpBtn.classList.add('has-new-messages');
      }
      if (pill) {
        pill.innerHTML = `<i class="fas fa-bell fa-shake"></i> ${custNewMsgCount[ticketId]} tin mới`;
        pill.style.display = 'inline-flex';
      }
    }
  } else if (isNearBottom) {
    setTimeout(() => {
      scrollEl.scrollTop = scrollEl.scrollHeight;
    }, 50);
  }
}

function renderCustomerMessageStatus(status) {
  if (status === 'sending') {
    return `<div class="msg-status-tag" style="display:flex; align-items:center; gap:4px; font-size:10.5px; color:#94a3b8; margin-top:3px;">
      <i class="fas fa-spinner fa-spin" style="font-size:9.5px;"></i> <span>Đang gửi...</span>
    </div>`;
  } else if (status === 'sent') {
    return `<div class="msg-status-tag" style="display:flex; align-items:center; gap:4px; font-size:10.5px; color:#94a3b8; margin-top:3px;">
      <i class="fas fa-check" style="font-size:10px;"></i> <span>Đã gửi</span>
    </div>`;
  } else if (status === 'seen') {
    return `<div class="msg-status-tag" style="display:flex; align-items:center; gap:4px; font-size:10.5px; color:#0284c7; margin-top:3px; font-weight:600;">
      <i class="fas fa-check-double" style="font-size:10px; color:#0284c7;"></i> <span>Đã xem</span>
    </div>`;
  } else {
    // Mặc định: Đã nhận vào máy chủ
    return `<div class="msg-status-tag" style="display:flex; align-items:center; gap:4px; font-size:10.5px; color:#94a3b8; margin-top:3px;">
      <i class="fas fa-check-double" style="font-size:10px;"></i> <span>Đã nhận</span>
    </div>`;
  }
}

// Xử lý gửi trạng thái đang gõ phím của khách hàng
let custTypingTimers = {};
let custTypingSent = {};

function handleCustTicketTyping(ticketId) {
  if (!custTypingSent[ticketId]) {
    custTypingSent[ticketId] = true;
    MoonlightAPI.setTicketTyping(ticketId, true).catch(() => {});
  }

  if (custTypingTimers[ticketId]) {
    clearTimeout(custTypingTimers[ticketId]);
  }

  custTypingTimers[ticketId] = setTimeout(() => {
    custTypingSent[ticketId] = false;
    MoonlightAPI.setTicketTyping(ticketId, false).catch(() => {});
  }, 2500);
}

// Xử lý tự co giãn textarea nhiều dòng
function handleCustTextareaInput(ticketId) {
  const textarea = document.getElementById(`custTicketInput-${ticketId}`);
  if (textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 140) + 'px';
  }
  handleCustTicketTyping(ticketId);
}

// Nhấn Enter để gửi, Shift+Enter để xuống dòng
function handleCustTextareaKeydown(event, ticketId) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    const form = event.target.closest('form');
    if (form) form.requestSubmit();
  }
}

// Quản lý file đính kèm phía Khách hàng
const custSelectedFiles = {};

function handleCustFileSelect(event, ticketId) {
  const file = event.target.files?.[0];
  if (!file) return;

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');

  if (!isImage && !isVideo) {
    showToast({ title: 'Không hỗ trợ', message: 'Vui lòng chọn tệp hình ảnh hoặc video.', type: 'warning' });
    event.target.value = '';
    return;
  }

  const maxImgBytes = 5 * 1024 * 1024; // 5MB
  const maxVideoBytes = 500 * 1024 * 1024; // 500MB

  if (isImage && file.size > maxImgBytes) {
    showToast({
      title: 'Tệp ảnh quá lớn',
      message: `Ảnh "${file.name}" (${(file.size / (1024*1024)).toFixed(1)}MB) vượt quá giới hạn 5MB cho phép.`,
      type: 'danger'
    });
    event.target.value = '';
    return;
  }

  if (isVideo && file.size > maxVideoBytes) {
    showToast({
      title: 'Video quá lớn',
      message: `Video "${file.name}" (${(file.size / (1024*1024)).toFixed(1)}MB) vượt quá giới hạn 500MB cho phép.`,
      type: 'danger'
    });
    event.target.value = '';
    return;
  }

  custSelectedFiles[ticketId] = file;

  const previewBox = document.getElementById(`custAttachPreview-${ticketId}`);
  const nameEl = document.getElementById(`custAttachName-${ticketId}`);
  const sizeEl = document.getElementById(`custAttachSize-${ticketId}`);
  const iconEl = document.getElementById(`custAttachIcon-${ticketId}`);

  if (previewBox && nameEl && sizeEl) {
    nameEl.innerText = file.name;
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    sizeEl.innerText = `${isImage ? 'Ảnh' : 'Video'} · ${sizeMb} MB`;
    if (iconEl) {
      iconEl.className = isImage ? 'fas fa-image' : 'fas fa-video';
      iconEl.style.color = isImage ? '#10b981' : '#f59e0b';
    }
    previewBox.style.display = 'flex';
  }
}

function handleRemoveCustAttach(ticketId) {
  delete custSelectedFiles[ticketId];
  const fileInput = document.getElementById(`custTicketFile-${ticketId}`);
  if (fileInput) fileInput.value = '';

  const previewBox = document.getElementById(`custAttachPreview-${ticketId}`);
  if (previewBox) previewBox.style.display = 'none';

  const progressBox = document.getElementById(`custUploadProgressBox-${ticketId}`);
  if (progressBox) progressBox.style.display = 'none';
}

async function handleSendCustomerMessage(event, ticketId) {
  event.preventDefault();
  const input = document.getElementById(`custTicketInput-${ticketId}`);
  const btn = document.getElementById(`btnCustSend-${ticketId}`);
  const text = input ? input.value.trim() : '';
  const file = custSelectedFiles[ticketId];

  if (!text && !file) return;

  // Hủy trạng thái typing ngay khi gửi
  if (custTypingTimers[ticketId]) clearTimeout(custTypingTimers[ticketId]);
  custTypingSent[ticketId] = false;
  MoonlightAPI.setTicketTyping(ticketId, false).catch(() => {});

  if (btn) btn.disabled = true;

  let attachments = [];

  // Nếu có file đính kèm, thực hiện upload lên server với thanh tiến trình
  if (file) {
    const progressBox = document.getElementById(`custUploadProgressBox-${ticketId}`);
    const statusText = document.getElementById(`custUploadStatusText-${ticketId}`);
    const percentText = document.getElementById(`custUploadPercent-${ticketId}`);
    const barFill = document.getElementById(`custUploadBarFill-${ticketId}`);

    if (progressBox) progressBox.style.display = 'block';

    try {
      const upRes = await MoonlightAPI.uploadTicketFile(file, (progress) => {
        if (percentText) percentText.innerText = `${progress.percent}%`;
        if (barFill) barFill.style.width = `${progress.percent}%`;
        if (statusText) {
          const loadedMb = (progress.loaded / (1024 * 1024)).toFixed(1);
          const totalMb = (progress.total / (1024 * 1024)).toFixed(1);
          statusText.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Đang tải lên: ${loadedMb}/${totalMb} MB (${progress.percent}%)`;
        }
      });

      if (upRes && (upRes.success || upRes.data)) {
        attachments.push(upRes.data);
        if (statusText) statusText.innerHTML = `<i class="fas fa-check" style="color:#10b981;"></i> Tải lên hoàn tất!`;
      } else {
        throw new Error(upRes?.message || 'Tải file thất bại.');
      }
    } catch (uploadErr) {
      console.error('Lỗi upload file ticket:', uploadErr);
      showToast({ title: 'Lỗi tải tệp', message: uploadErr.message || 'Không thể tải tệp đính kèm lên máy chủ.', type: 'danger' });
      if (btn) btn.disabled = false;
      if (progressBox) progressBox.style.display = 'none';
      return;
    }
  }

  // Xóa nội dung trong ô nhập ngay lập tức và reset độ cao textarea
  if (input) {
    input.value = '';
    input.style.height = 'auto';
  }
  handleRemoveCustAttach(ticketId);

  // Chèn trực tiếp tin nhắn tạm thời với trạng thái 'Đang gửi...' vào khung chat
  const scrollContainer = document.getElementById(`custMsgScroll-${ticketId}`);
  const tempMsgId = 'temp-msg-' + Date.now();
  const nowStr = new Date().toLocaleString('vi-VN');

  if (scrollContainer) {
    const allItems = scrollContainer.querySelectorAll('.cust-chat-msg-item');
    const lastMsg = allItems.length > 0 ? allItems[allItems.length - 1] : null;
    const wasSameSender = lastMsg && lastMsg.getAttribute('data-msg-role') === 'customer';

    // Ẩn trạng thái cũ của tin nhắn trước nếu cùng người gửi (chỉ tin mới nhất có status)
    if (wasSameSender) {
      const oldStatus = lastMsg.querySelector('.msg-status-tag');
      if (oldStatus) oldStatus.remove();
    }

    const hasText = Boolean(text && text.trim());
    const hasMedia = Array.isArray(attachments) && attachments.length > 0;

    let bubbleStyle = `width:fit-content; max-width:78%;`;
    let bubbleContent = '';

    if (!hasText && hasMedia) {
      bubbleStyle += `background:transparent !important; border:none !important; box-shadow:none !important; padding:0 !important;`;
      bubbleContent = renderMessageAttachments(attachments, true);
    } else if (hasText && hasMedia) {
      bubbleStyle += `background:linear-gradient(135deg, #0284c7, #0369a1); color:#ffffff; padding:6px; border-radius:${wasSameSender ? '18px 4px 18px 18px' : '18px'}; box-shadow:0 2px 8px rgba(2,132,199,0.18);`;
      bubbleContent = `${renderMessageAttachments(attachments, true)}<div class="chat-msg-text" style="padding:6px 8px 3px 8px; font-size:13.5px; line-height:1.45; word-break:break-word; overflow-wrap:anywhere; white-space:pre-wrap;">${formatChatContent(text)}</div>`;
    } else {
      bubbleStyle += `background:linear-gradient(135deg, #0284c7, #0369a1); color:#ffffff; padding:8px 14px; border-radius:${wasSameSender ? '18px 4px 18px 18px' : '18px'}; font-size:13.5px; line-height:1.45; box-shadow:0 2px 6px rgba(2,132,199,0.15);`;
      bubbleContent = `<div class="chat-msg-text" style="word-break:break-word; overflow-wrap:anywhere; white-space:pre-wrap;">${formatChatContent(text)}</div>`;
    }

    tempEl.innerHTML = `
      <div class="chat-msg-bubble" title="${nowStr}" style="${bubbleStyle}">${bubbleContent}</div>
      ${renderCustomerMessageStatus('sending')}
    `;
    const typingInd = document.getElementById(`custTypingIndicator-${ticketId}`);
    if (typingInd) {
      scrollContainer.insertBefore(tempEl, typingInd);
    } else {
      scrollContainer.appendChild(tempEl);
    }
    scrollCustomerChatToBottom(ticketId, true);
  }

  try {
    const res = await MoonlightAPI.sendTicketMessage(ticketId, text, attachments);
    if (res && (res.success || res.data)) {
      // Cập nhật trạng thái từ 'Đang gửi...' sang 'Đã nhận'
      const tempEl = document.getElementById(tempMsgId);
      if (tempEl) {
        const statusDiv = tempEl.querySelector('.msg-status-tag');
        if (statusDiv) {
          statusDiv.outerHTML = renderCustomerMessageStatus('delivered');
        }
      }

      const updatedTicket = res.data;
      if (updatedTicket) {
        const idx = currentTicketsList.findIndex(t => String(t._id || t.id) === String(ticketId));
        if (idx !== -1) {
          currentTicketsList[idx] = updatedTicket;
        }
      }
    } else {
      const tempEl = document.getElementById(tempMsgId);
      if (tempEl) {
        const statusDiv = tempEl.querySelector('.msg-status-tag');
        if (statusDiv) {
          statusDiv.innerHTML = `<span style="color:#ef4444;"><i class="fas fa-exclamation-circle"></i> Lỗi gửi</span>`;
        }
      }
    }
  } catch (err) {
    console.error('Lỗi khi gửi tin nhắn ticket:', err);
    const tempEl = document.getElementById(tempMsgId);
    if (tempEl) {
      const statusDiv = tempEl.querySelector('.msg-status-tag');
      if (statusDiv) {
        statusDiv.innerHTML = `<span style="color:#ef4444;"><i class="fas fa-exclamation-circle"></i> Lỗi gửi</span>`;
      }
    }
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function handleReopenCustomerTicket(ticketId) {
  try {
    const res = await MoonlightAPI.reopenMyTicket(ticketId);
    if (res && (res.success || res.data)) {
      await loadCustomerTickets();
    }
  } catch (err) {
    console.error('Lỗi khi mở lại ticket:', err);
  }
}

// Polling kiểm tra trạng thái live (Typing + Đã xem + Tin nhắn mới) trên trang Profile
let custLivePollTimer = null;

function startCustomerTicketLiveSync() {
  if (custLivePollTimer) clearInterval(custLivePollTimer);

  custLivePollTimer = setInterval(async () => {
    const paneTickets = document.getElementById('paneTickets');
    if (!paneTickets || paneTickets.style.display === 'none') return;
    if (!currentTicketsList || currentTicketsList.length === 0) return;

    for (const t of currentTicketsList) {
      const ticketId = t._id || t.id;
      const scrollEl = document.getElementById(`custMsgScroll-${ticketId}`);
      if (!scrollEl) continue; // Chỉ kiểm tra ticket đang hiển thị

      try {
        const res = await MoonlightAPI.getTicketLive(ticketId);
        if (res && res.success && res.data) {
          const liveData = res.data;
          const liveTicket = liveData.ticket || liveData;
          const adminTyping = liveData.typing?.admin;

          // 1. Cập nhật typing indicator
          const typingEl = document.getElementById(`custTypingIndicator-${ticketId}`);
          const typingText = document.getElementById(`custTypingText-${ticketId}`);
          if (typingEl && typingText) {
            if (adminTyping && adminTyping.isTyping) {
              typingText.innerText = `${adminTyping.name || 'CSKH MoonLight'} đang nhập tin nhắn...`;
              typingEl.style.display = 'inline-flex';
            } else {
              typingEl.style.display = 'none';
            }
          }

          // 2. Kiểm tra nếu có tin nhắn mới từ CSKH
          const currentCount = scrollEl.querySelectorAll('.cust-chat-msg-item').length;
          const serverMsgs = liveTicket.messages || [];
          if (serverMsgs.length > currentCount) {
            // Có tin nhắn mới từ CSKH -> CHỈ cập nhật khung chat, KHÔNG re-render cả trang và KHÔNG đụng vào input!
            const idx = currentTicketsList.findIndex(item => String(item._id || item.id) === String(ticketId));
            if (idx !== -1) {
              currentTicketsList[idx] = liveTicket;
            }
            renderCustomerChatThreadOnly(liveTicket);
          } else {
            // Cập nhật trạng thái 'Đã xem' cho các tin nhắn của khách nếu admin đã xem
            const adminSeenTime = liveTicket.adminLastSeenAt ? new Date(liveTicket.adminLastSeenAt).getTime() : 0;
            if (adminSeenTime > 0) {
              const statusTags = scrollEl.querySelectorAll('.msg-status-tag');
              statusTags.forEach(tag => {
                if (!tag.innerHTML.includes('Đã xem') && !tag.innerHTML.includes('Lỗi')) {
                  tag.outerHTML = renderCustomerMessageStatus('seen');
                }
              });
            }
          }
        }
      } catch (e) {
        // Lỗi polling ngầm không làm gián đoạn người dùng
      }
    }
  }, 2500);
}

// Bắt đầu live polling khi tải xong
startCustomerTicketLiveSync();

// Gán hàm vào window để gọi được từ inline onclick
window.handleSendCustomerMessage = handleSendCustomerMessage;
window.handleReopenCustomerTicket = handleReopenCustomerTicket;
window.handleCloseCustomerTicket = handleCloseCustomerTicket;
window.handleCustTicketTyping = handleCustTicketTyping;
window.handleCustTextareaInput = handleCustTextareaInput;
window.handleCustTextareaKeydown = handleCustTextareaKeydown;
window.handleCustFileSelect = handleCustFileSelect;
window.handleRemoveCustAttach = handleRemoveCustAttach;
window.formatChatContent = formatChatContent;
window.renderMessageAttachments = renderMessageAttachments;
window.openChatImageLightbox = openChatImageLightbox;
window.renderCustomerMessageStatus = renderCustomerMessageStatus;
window.renderCustomerChatMessagesHtml = renderCustomerChatMessagesHtml;
window.renderCustomerChatThreadOnly = renderCustomerChatThreadOnly;
window.scrollCustomerChatToBottom = scrollCustomerChatToBottom;
window.jumpCustomerChatToBottom = jumpCustomerChatToBottom;
window.handleCustomerChatScroll = handleCustomerChatScroll;
window.showCustomConfirmModal = showCustomConfirmModal;
window.showCustomPromptModal = showCustomPromptModal;
window.closeCustConfirmModal = closeCustConfirmModal;


