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
let currentOrderPage = 1;
const ORDERS_PER_PAGE = 5;

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

  // 3. Khởi tạo bộ chọn địa chỉ modal & Tải danh sách sổ địa chỉ
  await initModalAddressSelector();
  await loadSavedAddresses();

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

  // RÀNG BUỘC CỐ ĐỊNH: Họ và tên KHÔNG THỂ SỬA
  if (profFullName) {
    profFullName.value = user.name || user.username || '';
    profFullName.readOnly = true;
    profFullName.classList.add('input-locked');
  }

  if (profUsername) profUsername.value = user.username || '';
  if (profEmail) profEmail.value = user.email || '';
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
    if (typeof stopCustomerTicketLiveSync === 'function') stopCustomerTicketLiveSync();
    if (btnOrders) btnOrders.classList.add('active');
    if (paneOrders) paneOrders.style.display = 'block';
  } else if (tabName === 'tickets') {
    if (btnTickets) btnTickets.classList.add('active');
    if (paneTickets) paneTickets.style.display = 'block';
    if (typeof loadCustomerTickets === 'function') {
      loadCustomerTickets();
    }
    if (typeof startCustomerTicketLiveSync === 'function') {
      startCustomerTicketLiveSync();
    }
    setTimeout(() => {
      document.querySelectorAll('.ticket-messages-scroll').forEach(el => {
        el.scrollTop = el.scrollHeight;
      });
    }, 120);
  } else {
    if (typeof stopCustomerTicketLiveSync === 'function') stopCustomerTicketLiveSync();
    if (btnProfile) btnProfile.classList.add('active');
    if (paneProfile) paneProfile.style.display = 'block';
  }

  if (updateUrl && window.history.replaceState) {
    const newUrl = `${window.location.pathname}?tab=${tabName}`;
    window.history.replaceState({ tab: tabName }, '', newUrl);
  }
}

let currentAddressesList = [];

// Khởi tạo bộ chọn Tỉnh / Quận / Phường cho Modal thêm/sửa địa chỉ
async function initModalAddressSelector() {
  const provEl = document.getElementById('addrModalProvince');
  const distEl = document.getElementById('addrModalDistrict');
  const wardEl = document.getElementById('addrModalWard');
  const streetEl = document.getElementById('addrModalStreet');

  if (!provEl || !distEl || !wardEl) return;

  // Lắng nghe thay đổi số nhà để cập nhật xem trước
  if (streetEl) {
    streetEl.removeEventListener('input', updateModalAddressPreview);
    streetEl.addEventListener('input', updateModalAddressPreview);
  }

  // 1. Tải danh sách tỉnh thành nếu chưa có
  try {
    if (!profileGeoState.provinces || profileGeoState.provinces.length === 0) {
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
    }

    provEl.innerHTML = '<option value="">-- Chọn Tỉnh / Thành phố --</option>' +
      profileGeoState.provinces.map(p => `<option value="${p.code}" data-name="${p.name}">${p.name}</option>`).join('');

  } catch (err) {
    provEl.innerHTML = '<option value="">-- Lỗi tải danh sách Tỉnh/Thành --</option>';
  }

  // 2. Sự kiện đổi Tỉnh / Thành phố
  provEl.onchange = async function () {
    const pCode = this.value;
    distEl.innerHTML = '<option value="">-- Chọn Quận / Huyện --</option>';
    distEl.disabled = true;
    wardEl.innerHTML = '<option value="">-- Chọn Phường / Xã --</option>';
    wardEl.disabled = true;
    updateModalAddressPreview();

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
  };

  // 3. Sự kiện đổi Quận / Huyện
  distEl.onchange = async function () {
    const dCode = this.value;
    wardEl.innerHTML = '<option value="">-- Chọn Phường / Xã --</option>';
    wardEl.disabled = true;
    updateModalAddressPreview();

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
  };

  // 4. Sự kiện đổi Phường / Xã
  wardEl.onchange = function () {
    updateModalAddressPreview();
  };
}

// Cập nhật thẻ xem trước địa chỉ trong modal
function updateModalAddressPreview() {
  const provEl = document.getElementById('addrModalProvince');
  const distEl = document.getElementById('addrModalDistrict');
  const wardEl = document.getElementById('addrModalWard');
  const streetEl = document.getElementById('addrModalStreet');
  const previewCard = document.getElementById('addrModalPreviewCard');
  const previewText = document.getElementById('addrModalPreviewText');

  if (!provEl) return '';

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

// Tải danh sách các địa chỉ đã lưu của người dùng từ API
async function loadSavedAddresses() {
  const container = document.getElementById('savedAddressListContainer');
  if (!container) return;

  try {
    const res = await MoonlightAPI.getMyAddresses();
    if (res && res.success && Array.isArray(res.data)) {
      currentAddressesList = res.data;
    } else {
      // Fallback từ localStorage nếu API chưa trả về
      const user = JSON.parse(localStorage.getItem('moonlight_user') || 'null');
      currentAddressesList = (user && Array.isArray(user.addresses)) ? user.addresses : [];
    }

    renderSavedAddressesList(currentAddressesList);

    // Cập nhật lại Hero Card nếu có địa chỉ mặc định
    const defaultAddr = currentAddressesList.find(a => a.isDefault);
    if (defaultAddr && defaultAddr.phone) {
      const heroPhone = document.getElementById('profHeroPhone');
      if (heroPhone) heroPhone.textContent = `SĐT: ${defaultAddr.phone}`;
    }
  } catch (err) {
    console.error('Lỗi khi nạp sổ địa chỉ:', err);
    container.innerHTML = `
      <div style="text-align:center; padding:24px; color:#ef4444; background:#fef2f2; border-radius:10px;">
        <i class="fas fa-exclamation-circle" style="font-size:24px; margin-bottom:8px;"></i>
        <div>Không thể tải sổ địa chỉ lúc này. Vui lòng tải lại trang!</div>
      </div>
    `;
  }
}

// Hiển thị danh sách thẻ địa chỉ
function renderSavedAddressesList(addresses) {
  const container = document.getElementById('savedAddressListContainer');
  if (!container) return;

  if (!addresses || addresses.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:36px 20px; background:#f8fafc; border-radius:12px; border:1px dashed #cbd5e1;">
        <i class="fas fa-map-marked-alt" style="font-size:32px; color:#94a3b8; margin-bottom:10px;"></i>
        <p style="color:#64748b; font-size:13.5px; margin-bottom:14px; font-weight:500;">Bạn chưa có địa chỉ nhận hàng nào trong sổ địa chỉ.</p>
        <button type="button" class="btn-primary" onclick="openAddressModal()" style="padding:9px 20px; font-size:13px; border-radius:8px; display:inline-flex; align-items:center; gap:6px; cursor:pointer;">
          <i class="fas fa-plus"></i> <span>Thêm địa chỉ ngay</span>
        </button>
      </div>
    `;
    return;
  }

  // Sắp xếp: Địa chỉ mặc định luôn lên đầu tiên
  const sorted = [...addresses].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));

  container.innerHTML = sorted.map(addr => {
    const isDef = !!addr.isDefault;
    const labelText = addr.label || 'Nhà riêng';
    const labelIcon = labelText === 'Văn phòng' ? 'fa-building' : (labelText === 'Khác' ? 'fa-map-pin' : 'fa-home');
    const displayAddr = addr.fullAddress || [addr.street, addr.ward, addr.district, addr.province].filter(Boolean).join(', ');

    return `
      <div class="address-card-item ${isDef ? 'is-default' : ''}" id="addr-card-${addr._id}">
        <div class="address-card-top">
          <div class="address-card-title-group">
            <span class="address-card-name">${escapeHtml(addr.recipientName || 'Người nhận')}</span>
            <span class="address-card-phone"><i class="fas fa-phone-alt" style="font-size:11px; margin-right:3px;"></i>${escapeHtml(addr.phone || '')}</span>
            <span class="badge-addr-label"><i class="fas ${labelIcon}"></i> ${escapeHtml(labelText)}</span>
            ${isDef ? `<span class="badge-addr-default"><i class="fas fa-check-circle"></i> Mặc định</span>` : ''}
          </div>
        </div>
        <div class="address-card-full-text">
          <i class="fas fa-map-marker-alt" style="color:#dfba73; margin-right:6px; font-size:12px;"></i>
          <span>${escapeHtml(displayAddr)}</span>
        </div>
        <div class="address-card-actions">
          ${!isDef ? `
            <button type="button" class="btn-addr-action set-default" onclick="handleSetDefaultAddress('${addr._id}')">
              <i class="fas fa-star"></i> Đặt làm mặc định
            </button>
          ` : ''}
          <button type="button" class="btn-addr-action edit" onclick="openAddressModal('${addr._id}')">
            <i class="fas fa-edit"></i> Chỉnh sửa
          </button>
          <button type="button" class="btn-addr-action delete" onclick="handleDeleteAddress('${addr._id}')">
            <i class="fas fa-trash-alt"></i> Xóa
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Mở Modal Thêm mới hoặc Chỉnh sửa địa chỉ
async function openAddressModal(editId = null) {
  const modal = document.getElementById('profileAddressModal');
  const form = document.getElementById('profileAddressForm');
  const titleEl = document.getElementById('addrModalTitle');
  const editIdEl = document.getElementById('addrModalEditId');
  const recipientEl = document.getElementById('addrModalRecipient');
  const phoneEl = document.getElementById('addrModalPhone');
  const streetEl = document.getElementById('addrModalStreet');
  const defaultCheckEl = document.getElementById('addrModalIsDefault');
  const provEl = document.getElementById('addrModalProvince');
  const distEl = document.getElementById('addrModalDistrict');
  const wardEl = document.getElementById('addrModalWard');

  if (!modal) return;

  // Đảm bảo options Tỉnh/Thành đã được nạp
  await initModalAddressSelector();

  if (editId) {
    const addr = currentAddressesList.find(a => String(a._id) === String(editId));
    if (!addr) {
      showToast({ title: 'Lỗi', message: 'Không tìm thấy địa chỉ cần sửa.', type: 'warning' });
      return;
    }

    if (titleEl) titleEl.innerHTML = '<i class="fas fa-edit" style="color:var(--gold,#dfba73);"></i> <span>Chỉnh sửa địa chỉ nhận hàng</span>';
    if (editIdEl) editIdEl.value = addr._id;
    if (recipientEl) recipientEl.value = addr.recipientName || '';
    if (phoneEl) phoneEl.value = addr.phone || '';
    if (streetEl) streetEl.value = addr.street || '';
    if (defaultCheckEl) {
      defaultCheckEl.checked = !!addr.isDefault;
      defaultCheckEl.disabled = !!addr.isDefault; // Nếu đang là mặc định thì không cho bỏ check
    }

    // Chọn radio nhãn
    const labelRadios = document.querySelectorAll('input[name="addrModalLabel"]');
    labelRadios.forEach(r => {
      r.checked = (r.value === (addr.label || 'Nhà riêng'));
    });

    // Chọn Tỉnh / Huyện / Xã theo dữ liệu cũ
    if (provEl && (addr.provinceCode || addr.province)) {
      const pVal = addr.provinceCode || addr.province;
      let matchedProv = Array.from(provEl.options).find(o => o.value === String(pVal) || o.getAttribute('data-name') === pVal || (pVal && o.text.includes(pVal)));
      if (matchedProv) {
        provEl.value = matchedProv.value;
        await provEl.onchange();

        const dVal = addr.districtCode || addr.district;
        if (dVal && distEl) {
          let matchedDist = Array.from(distEl.options).find(o => o.value === String(dVal) || o.getAttribute('data-name') === dVal || (dVal && o.text.includes(dVal)));
          if (matchedDist) {
            distEl.value = matchedDist.value;
            await distEl.onchange();

            const wVal = addr.wardCode || addr.ward;
            if (wVal && wardEl) {
              let matchedWard = Array.from(wardEl.options).find(o => o.value === String(wVal) || o.getAttribute('data-name') === wVal || (wVal && o.text.includes(wVal)));
              if (matchedWard) {
                wardEl.value = matchedWard.value;
              }
            }
          }
        }
      }
    }
  } else {
    // Tạo địa chỉ mới
    if (titleEl) titleEl.innerHTML = '<i class="fas fa-map-marker-alt" style="color:var(--gold,#dfba73);"></i> <span>Thêm địa chỉ nhận hàng mới</span>';
    if (editIdEl) editIdEl.value = '';
    if (form) form.reset();

    // Điền mặc định thông tin từ User nếu có
    const user = JSON.parse(localStorage.getItem('moonlight_user') || 'null');
    if (user) {
      if (recipientEl) recipientEl.value = user.name || user.username || '';
      if (phoneEl) phoneEl.value = user.phone || '';
    }

    // Nếu chưa có địa chỉ nào thì tự động tích chọn mặc định
    if (defaultCheckEl) {
      defaultCheckEl.checked = (!currentAddressesList || currentAddressesList.length === 0);
      defaultCheckEl.disabled = false;
    }

    if (distEl) {
      distEl.innerHTML = '<option value="">-- Chọn Quận / Huyện --</option>';
      distEl.disabled = true;
    }
    if (wardEl) {
      wardEl.innerHTML = '<option value="">-- Chọn Phường / Xã --</option>';
      wardEl.disabled = true;
    }
  }

  updateModalAddressPreview();
  modal.style.display = 'flex';
  if (recipientEl) setTimeout(() => recipientEl.focus(), 100);
}

// Đóng Modal Địa chỉ
function closeAddressModal() {
  const modal = document.getElementById('profileAddressModal');
  if (modal) modal.style.display = 'none';
}

// Xử lý gửi Form lưu địa chỉ (Thêm hoặc Sửa)
async function handleSaveAddressForm(event) {
  event.preventDefault();
  const submitBtn = document.getElementById('btnAddrModalSubmit');
  const originalHtml = submitBtn ? submitBtn.innerHTML : '';

  const editId = document.getElementById('addrModalEditId')?.value;
  const recipientName = document.getElementById('addrModalRecipient')?.value.trim();
  const phone = document.getElementById('addrModalPhone')?.value.trim();
  const street = document.getElementById('addrModalStreet')?.value.trim();
  const isDefault = !!document.getElementById('addrModalIsDefault')?.checked;

  const provEl = document.getElementById('addrModalProvince');
  const distEl = document.getElementById('addrModalDistrict');
  const wardEl = document.getElementById('addrModalWard');

  const labelEl = document.querySelector('input[name="addrModalLabel"]:checked');
  const label = labelEl ? labelEl.value : 'Nhà riêng';

  if (!recipientName) {
    showToast({ title: 'Thiếu thông tin', message: 'Vui lòng nhập tên người nhận hàng!', type: 'warning' });
    return;
  }

  if (!phone || !/^[0-9]{9,11}$/.test(phone.replace(/\s+/g, ''))) {
    showToast({ title: 'Số điện thoại không hợp lệ', message: 'Vui lòng nhập số điện thoại hợp lệ (9 - 11 chữ số)!', type: 'warning' });
    return;
  }

  if (!provEl || !provEl.value) {
    showToast({ title: 'Thiếu thông tin', message: 'Vui lòng chọn Tỉnh / Thành phố!', type: 'warning' });
    return;
  }

  if (!distEl || !distEl.value) {
    showToast({ title: 'Thiếu thông tin', message: 'Vui lòng chọn Quận / Huyện!', type: 'warning' });
    return;
  }

  if (!wardEl || !wardEl.value) {
    showToast({ title: 'Thiếu thông tin', message: 'Vui lòng chọn Phường / Xã!', type: 'warning' });
    return;
  }

  if (!street) {
    showToast({ title: 'Thiếu thông tin', message: 'Vui lòng nhập số nhà, tên đường cụ thể!', type: 'warning' });
    return;
  }

  const province = (provEl.selectedIndex > 0) ? provEl.options[provEl.selectedIndex].text : '';
  const district = (distEl.selectedIndex > 0) ? distEl.options[distEl.selectedIndex].text : '';
  const ward = (wardEl.selectedIndex > 0) ? wardEl.options[wardEl.selectedIndex].text : '';
  const fullAddress = [street, ward, district, province].filter(Boolean).join(', ');

  const payload = {
    recipientName,
    phone,
    province,
    provinceCode: provEl.value,
    district,
    districtCode: distEl.value,
    ward,
    wardCode: wardEl.value,
    street,
    fullAddress,
    isDefault,
    label
  };

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG LƯU...';
  }

  try {
    let res;
    if (editId) {
      res = await MoonlightAPI.updateAddress(editId, payload);
    } else {
      res = await MoonlightAPI.addAddress(payload);
    }

    if (res && res.success) {
      showToast({
        title: 'Thành công',
        message: editId ? 'Đã cập nhật địa chỉ thành công!' : 'Đã thêm địa chỉ mới vào sổ địa chỉ!',
        type: 'success'
      });
      closeAddressModal();
      await loadSavedAddresses();
    } else {
      throw new Error(res?.message || 'Không thể lưu địa chỉ lúc này.');
    }
  } catch (err) {
    showToast({
      title: 'Lỗi lưu địa chỉ',
      message: err.message || 'Có lỗi xảy ra, vui lòng thử lại sau!',
      type: 'error'
    });
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHtml;
    }
  }
}

// Xử lý đặt địa chỉ làm mặc định
async function handleSetDefaultAddress(addressId) {
  if (!addressId) return;

  try {
    const res = await MoonlightAPI.setDefaultAddress(addressId);
    if (res && res.success) {
      showToast({
        title: 'Thành công',
        message: 'Đã đặt làm địa chỉ nhận hàng mặc định!',
        type: 'success'
      });
      await loadSavedAddresses();
    } else {
      throw new Error(res?.message || 'Không thể thiết lập địa chỉ mặc định.');
    }
  } catch (err) {
    showToast({
      title: 'Thất bại',
      message: err.message || 'Lỗi khi cập nhật địa chỉ mặc định.',
      type: 'error'
    });
  }
}

// Xử lý xóa địa chỉ
async function handleDeleteAddress(addressId) {
  if (!addressId) return;

  const addr = currentAddressesList.find(a => String(a._id) === String(addressId));
  const isDefault = addr && addr.isDefault;

  const confirmed = await showCustomConfirmModal({
    title: 'Xóa địa chỉ nhận hàng',
    message: isDefault
      ? 'Địa chỉ này đang được đặt làm MẶC ĐỊNH. Bạn có chắc chắn muốn xóa không?'
      : 'Bạn có chắc chắn muốn xóa địa chỉ này khỏi sổ địa chỉ không?',
    confirmText: 'XÓA ĐỊA CHỈ',
    confirmColor: '#ef4444'
  });

  if (!confirmed) return;

  try {
    const res = await MoonlightAPI.deleteAddress(addressId);
    if (res && res.success) {
      showToast({
        title: 'Đã xóa',
        message: 'Đã xóa địa chỉ thành công!',
        type: 'success'
      });
      await loadSavedAddresses();
    } else {
      throw new Error(res?.message || 'Không thể xóa địa chỉ lúc này.');
    }
  } catch (err) {
    showToast({
      title: 'Lỗi xóa địa chỉ',
      message: err.message || 'Không thể xóa địa chỉ. Vui lòng thử lại!',
      type: 'error'
    });
  }
}

// Tương thích ngược: Xử lý lưu profile form nếu người dùng ấn submit form cũ
function handleSaveProfile(event) {
  if (event) event.preventDefault();
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
        const localOrders = JSON.parse(localStorage.getItem('moonlight_orders') || localStorage.getItem('moonlight_all_orders') || '[]');
        orders = localOrders.filter(o => o.customer?.phone === user.phone || (o.customerId && String(o.customerId) === String(user.id || user._id)));
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
  currentOrderPage = 1; // Reset về trang 1 khi lọc trạng thái
  document.querySelectorAll('.orders-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-status') === status);
  });
  renderCustomerOrders(status);
}

// Lấy danh sách đơn hàng đã lọc và sắp xếp theo ngày từ mới nhất đến cũ nhất
function getFilteredCustomerOrders(filterStatus = 'all') {
  let list = Array.isArray(currentOrdersList) ? [...currentOrdersList] : [];
  if (filterStatus !== 'all') {
    list = list.filter(o => o.status === filterStatus);
  }

  // Luôn sắp xếp từ mới nhất đến cũ nhất (Newest first)
  list.sort((a, b) => {
    const timeA = new Date(a.createdAt || a.date || 0).getTime() || 0;
    const timeB = new Date(b.createdAt || b.date || 0).getTime() || 0;
    if (timeB !== timeA) return timeB - timeA;
    const codeA = String(a.orderCode || a._id || '');
    const codeB = String(b.orderCode || b._id || '');
    return codeB.localeCompare(codeA);
  });

  return list;
}

// Chuyển trang đơn hàng
function goToOrderPage(page) {
  const filtered = getFilteredCustomerOrders(currentFilterStatus);
  const totalPages = Math.ceil(filtered.length / ORDERS_PER_PAGE) || 1;
  const targetPage = Math.max(1, Math.min(page, totalPages));

  currentOrderPage = targetPage;
  renderCustomerOrders(currentFilterStatus);

  // Cuộn mượt lên đầu danh sách đơn hàng để tiện theo dõi
  const ordersTab = document.getElementById('paneOrders');
  if (ordersTab) {
    ordersTab.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Tạo danh sách các số trang hiển thị có hỗ trợ dấu '...'
function getPaginationPages(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = [];
  if (currentPage <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push('...');
    pages.push(totalPages);
  } else if (currentPage >= totalPages - 3) {
    pages.push(1);
    pages.push('...');
    for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    pages.push('...');
    pages.push(currentPage - 1);
    pages.push(currentPage);
    pages.push(currentPage + 1);
    pages.push('...');
    pages.push(totalPages);
  }
  return pages;
}

// Render thanh phân trang đơn hàng
function renderOrdersPagination(totalItems, totalPages, startIndex, endIndex) {
  const paginEl = document.getElementById('customerOrdersPagination');
  if (!paginEl) return;

  if (totalItems <= ORDERS_PER_PAGE || totalPages <= 1) {
    paginEl.style.display = 'none';
    paginEl.innerHTML = '';
    return;
  }

  paginEl.style.display = 'flex';

  const pages = getPaginationPages(currentOrderPage, totalPages);

  const prevDisabled = currentOrderPage <= 1 ? 'disabled' : '';
  const nextDisabled = currentOrderPage >= totalPages ? 'disabled' : '';

  let buttonsHtml = `
    <button class="btn-order-page" ${prevDisabled} onclick="goToOrderPage(${currentOrderPage - 1})" title="Trang trước">
      <i class="fas fa-chevron-left"></i>
    </button>
  `;

  pages.forEach(p => {
    if (p === '...') {
      buttonsHtml += `<span class="orders-page-dots">...</span>`;
    } else {
      const activeClass = p === currentOrderPage ? 'active' : '';
      buttonsHtml += `
        <button class="btn-order-page ${activeClass}" onclick="goToOrderPage(${p})">
          ${p}
        </button>
      `;
    }
  });

  buttonsHtml += `
    <button class="btn-order-page" ${nextDisabled} onclick="goToOrderPage(${currentOrderPage + 1})" title="Trang sau">
      <i class="fas fa-chevron-right"></i>
    </button>
  `;

  paginEl.innerHTML = `
    <div class="orders-pagination-info">
      Hiển thị <strong>${startIndex + 1} - ${endIndex}</strong> trong tổng số <strong>${totalItems}</strong> đơn hàng
    </div>
    <div class="orders-pagination-controls">
      ${buttonsHtml}
    </div>
  `;
}

// Render giao diện danh sách đơn hàng kèm Stepper tiến trình và Phân trang (5 đơn / trang, mới nhất đến cũ nhất)
function renderCustomerOrders(filterStatus = 'all') {
  const container = document.getElementById('customerOrdersContainer');
  const paginEl = document.getElementById('customerOrdersPagination');
  if (!container) return;

  const sortedAndFiltered = getFilteredCustomerOrders(filterStatus);
  const totalItems = sortedAndFiltered.length;

  if (totalItems === 0) {
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
    if (paginEl) {
      paginEl.style.display = 'none';
      paginEl.innerHTML = '';
    }
    return;
  }

  // Tính toán phân trang
  const totalPages = Math.ceil(totalItems / ORDERS_PER_PAGE);
  if (currentOrderPage > totalPages) {
    currentOrderPage = totalPages;
  }
  if (currentOrderPage < 1) {
    currentOrderPage = 1;
  }

  const startIndex = (currentOrderPage - 1) * ORDERS_PER_PAGE;
  const endIndex = Math.min(startIndex + ORDERS_PER_PAGE, totalItems);
  const pagedOrders = sortedAndFiltered.slice(startIndex, endIndex);

  const statusMeta = {
    pending: { label: 'Chờ tiếp nhận', class: 'pending', icon: 'fa-clock' },
    confirmed: { label: 'Đã xác nhận', class: 'confirmed', icon: 'fa-check-circle' },
    shipping: { label: 'Đang giao hàng', class: 'shipping', icon: 'fa-truck-fast' },
    completed: { label: 'Giao thành công', class: 'completed', icon: 'fa-circle-check' },
    cancelled: { label: 'Đã hủy đơn', class: 'cancelled', icon: 'fa-ban' }
  };

  container.innerHTML = pagedOrders.map(order => {
    const meta = statusMeta[order.status] || { label: order.status, class: 'pending', icon: 'fa-info-circle' };
    const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : (order.date || 'Gần đây');
    const items = order.items || [];
    const totalAmount = Number(order.total || 0).toLocaleString('vi-VN');
    const orderId = order._id || order.id;
    const isPending = order.status === 'pending';
    const isConfirmed = order.status === 'confirmed';
    const canCancel = isPending || isConfirmed;
    const isCancelled = order.status === 'cancelled';
    const isBanking = order.paymentMethod === 'banking';
    const isPaid = Boolean(order.isPaid);

    // Tính toán stepper (Tiến trình 4 bước hoặc Thông báo đơn đã hủy)
    let stepperHtml = '';
    if (isCancelled) {
      const cancelReasonText = escapeHtml(order.cancelReason || 'Theo yêu cầu của quý khách');
      stepperHtml = `
        <div class="order-cancelled-card">
          <div class="cancelled-card-icon">
            <i class="fas fa-ban"></i>
          </div>
          <div class="cancelled-card-body">
            <div class="cancelled-card-header">
              <span class="cancelled-card-title"><i class="fas fa-times-circle" style="margin-right:4px;"></i> Đơn hàng đã bị hủy</span>
              <span class="cancelled-card-badge">Đã kết thúc</span>
            </div>
            <div class="cancelled-card-detail">
              Lý do hủy: <strong>${cancelReasonText}</strong>
            </div>
          </div>
        </div>
      `;
    } else {
      const stepIdx = ['pending', 'confirmed', 'shipping', 'completed'].indexOf(order.status);
      const fillWidth = stepIdx <= 0 ? '0%' : (stepIdx === 1 ? '25%' : (stepIdx === 2 ? '50%' : '75%'));

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
            <div class="stepper-circle"><i class="fas fa-circle-check"></i></div>
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
    const cusNote = order.customer?.note ? `<div style="font-size:12px; color:#64748b; margin-top:4px; word-break:break-word;"><em>Ghi chú: ${order.customer.note}</em></div>` : '';

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
          <div class="order-delivery-grid">
            <div>
              <div><i class="fas fa-user" style="color:var(--gold,#d4af37); width:16px;"></i> Người nhận: <strong>${cusName}</strong> · SĐT: <strong>${cusPhone}</strong></div>
              <div><i class="fas fa-map-marker-alt" style="color:var(--gold,#d4af37); width:16px;"></i> Địa chỉ: ${cusAddress}</div>
              ${cusNote}
            </div>
            <div>
              <div>Phương thức: <strong>${isBanking ? 'Chuyển khoản TPBank (VietQR)' : 'Thanh toán khi nhận hàng (COD)'}</strong></div>
              <div style="margin-top:4px;">Trạng thái TT: ${isPaid ?
                `<span style="display:inline-flex; align-items:center; gap:5px; background:#ecfdf5; color:#059669; border:1px solid #a7f3d0; padding:2px 9px; border-radius:12px; font-size:11.5px; font-weight:700;"><i class="fas fa-circle-check"></i> Đã thanh toán</span>` :
                (order.customerTransferConfirmed ?
                  `<span style="display:inline-flex; align-items:center; gap:5px; background:#fef3c7; color:#b45309; border:1px solid #fde68a; padding:2px 9px; border-radius:12px; font-size:11.5px; font-weight:700;"><i class="fas fa-spinner fa-spin"></i> Chờ duyệt tiền vào</span>` :
                  `<span style="display:inline-flex; align-items:center; gap:5px; background:#fffbeb; color:#d97706; border:1px solid #fde68a; padding:2px 9px; border-radius:12px; font-size:11.5px; font-weight:700;"><i class="fas fa-hourglass-half"></i> Chưa thanh toán</span>`
                )
              }</div>
              ${isBanking && !isPaid ? `
                <button onclick="showOrderVietQrModal('${order.orderCode}', ${order.total || 0})" style="margin-top:7px; background:linear-gradient(135deg, #ffffff 0%, #fdfbf7 100%); border:1.5px solid var(--gold,#d4af37); color:#92400e; padding:5px 12px; border-radius:6px; font-size:11.5px; cursor:pointer; font-weight:700; display:inline-flex; align-items:center; gap:6px; box-shadow:0 2px 6px rgba(212,175,55,0.12); transition:all 0.2s;">
                  <i class="fas fa-qrcode" style="color:var(--gold,#b48518); font-size:13px;"></i> Quét mã VietQR thanh toán
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
            ${canCancel ? `
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

  // Hiển thị thanh phân trang
  renderOrdersPagination(totalItems, totalPages, startIndex, endIndex);
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

// Khách hàng tự hủy đơn hàng (khi đơn ở trạng thái Chờ tiếp nhận hoặc Đã xác nhận)
async function handleCancelCustomerOrder(orderId, orderCode) {
  const order = currentOrdersList.find(o => String(o._id || o.id) === String(orderId));
  if (order && !['pending', 'confirmed'].includes(order.status)) {
    showToast({
      title: 'Không thể hủy đơn',
      message: 'Đơn hàng đang giao hoặc đã hoàn tất/đã hủy, không thể tự hủy lúc này.',
      type: 'warning'
    });
    return;
  }

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

// ==========================================
// HỆ THỐNG THANH TOÁN VIETQR TPBANK (PROFILE)
// ==========================================
let currentProfileQrOrderCode = '';
let currentProfileQrAmount = 0;
let _profilePaymentTimer = null;
let _profileAutoCloseTimer = null;

function copyText(text, successMsg) {
  if (!text) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast({
        title: 'Đã sao chép! 📋',
        message: successMsg || 'Đã sao chép nội dung vào bộ nhớ tạm.',
        type: 'success'
      });
    }).catch(() => {
      fallbackCopyText(text, successMsg);
    });
  } else {
    fallbackCopyText(text, successMsg);
  }
}

function fallbackCopyText(text, successMsg) {
  const tempInput = document.createElement('textarea');
  tempInput.value = text;
  tempInput.style.position = 'fixed';
  tempInput.style.opacity = '0';
  document.body.appendChild(tempInput);
  tempInput.focus();
  tempInput.select();
  try {
    document.execCommand('copy');
    showToast({
      title: 'Đã sao chép! 📋',
      message: successMsg || 'Đã sao chép nội dung vào bộ nhớ tạm.',
      type: 'success'
    });
  } catch (err) {
    showToast({
      title: 'Lỗi sao chép',
      message: 'Không thể sao chép tự động, vui lòng chọn và copy thủ công.',
      type: 'error'
    });
  }
  document.body.removeChild(tempInput);
}

function copyProfileQrAmount() {
  if (currentProfileQrAmount > 0) {
    copyText(String(currentProfileQrAmount), `Đã sao chép số tiền: ${currentProfileQrAmount.toLocaleString('vi-VN')}₫`);
  }
}

function clearProfileTimers() {
  if (_profilePaymentTimer) {
    clearInterval(_profilePaymentTimer);
    _profilePaymentTimer = null;
  }
  if (_profileAutoCloseTimer) {
    clearInterval(_profileAutoCloseTimer);
    _profileAutoCloseTimer = null;
  }
}

function copyProfileQrMemo() {
  if (currentProfileQrOrderCode) {
    copyText(currentProfileQrOrderCode, `Đã sao chép nội dung chuyển khoản: ${currentProfileQrOrderCode}`);
  }
}

function closeProfileQrModal() {
  const modal = document.getElementById('profileQrModal');
  if (modal) modal.style.display = 'none';
  clearProfileTimers();
}

// Lắng nghe tự động tín hiệu tiền về từ Webhook SePay / TPBank
function startProfilePaymentCheck(orderCode) {
  clearProfileTimers();
  if (!orderCode) return;

  _profilePaymentTimer = setInterval(async () => {
    try {
      const res = await fetch(`/api/v1/orders/${encodeURIComponent(orderCode)}/status`);
      const json = await res.json();
      if (json && json.success && json.data && json.data.isPaid) {
        clearInterval(_profilePaymentTimer);
        _profilePaymentTimer = null;

        const qrWrapper = document.getElementById('profileQrWrapper');
        const waitingNotice = document.getElementById('profileWaitingNotice');
        const paidSuccessBox = document.getElementById('profilePaidSuccessBox');
        const successDesc = document.getElementById('profilePaidSuccessDesc');

        if (qrWrapper) qrWrapper.style.display = 'none';
        if (waitingNotice) waitingNotice.style.display = 'none';
        if (paidSuccessBox) paidSuccessBox.style.display = 'flex';

        // Cập nhật trạng thái đơn trong danh sách cục bộ
        const targetOrder = currentOrdersList.find(o => (o.orderCode === orderCode || o.id === orderCode || o._id === orderCode));
        if (targetOrder) {
          targetOrder.isPaid = true;
        }

        // Re-render danh sách đơn hàng để cập nhật badge thời gian thực
        if (typeof renderCustomerOrders === 'function') {
          renderCustomerOrders(typeof currentFilterStatus !== 'undefined' ? currentFilterStatus : 'all');
        }

        showToast({
          title: 'Thanh toán thành công! 🎉',
          message: `Đơn hàng ${orderCode} đã khớp lệnh thanh toán TPBank. Cảm ơn bạn!`,
          type: 'success',
          duration: 9000
        });

        // Bắt đầu đếm ngược 5 giây và tự động đóng modal
        let secondsLeft = 5;
        if (successDesc) {
          successDesc.innerHTML = `Hệ thống TPBank đã khớp lệnh thanh toán. Cửa sổ sẽ tự đóng sau <strong id="profileAutoCloseCountdown" style="color:#059669; font-weight:800;">${secondsLeft}s</strong>...`;
        }

        _profileAutoCloseTimer = setInterval(() => {
          secondsLeft -= 1;
          const countdownEl = document.getElementById('profileAutoCloseCountdown');
          if (countdownEl) countdownEl.textContent = `${secondsLeft}s`;

          if (secondsLeft <= 0) {
            clearInterval(_profileAutoCloseTimer);
            _profileAutoCloseTimer = null;
            closeProfileQrModal();
          }
        }, 1000);
      }
    } catch (err) {
      // Bỏ qua lỗi polling mạng nhẹ
    }
  }, 2500);
}

// Hiển thị mã QR Chuyển khoản TPBank với giao diện tự động bắt tín hiệu SePay
function showOrderVietQrModal(orderCode, amount) {
  const modal = document.getElementById('profileQrModal');
  const qrImg = document.getElementById('profileQrImg');
  const amountText = document.getElementById('profileQrAmountText');
  const memoText = document.getElementById('profileQrMemoText');
  const qrWrapper = document.getElementById('profileQrWrapper');
  const waitingNotice = document.getElementById('profileWaitingNotice');
  const paidSuccessBox = document.getElementById('profilePaidSuccessBox');
  const successDesc = document.getElementById('profilePaidSuccessDesc');

  if (!modal || !qrImg) return;

  clearProfileTimers();

  currentProfileQrOrderCode = String(orderCode || '').trim();
  const total = Number(amount) || 0;
  currentProfileQrAmount = total;

  const qrUrl = `https://img.vietqr.io/image/TPB-0393203037-compact2.png?amount=${total}&addInfo=${encodeURIComponent(currentProfileQrOrderCode)}&accountName=VU%20PHAM%20LUAN`;

  qrImg.src = qrUrl;
  if (amountText) amountText.textContent = `${total.toLocaleString('vi-VN')}₫`;
  if (memoText) memoText.textContent = currentProfileQrOrderCode;

  // Kiểm tra đơn hàng xem đã thanh toán hay chưa
  const existingOrder = currentOrdersList.find(o => (o.orderCode === currentProfileQrOrderCode || o.id === currentProfileQrOrderCode || o._id === currentProfileQrOrderCode));
  const isAlreadyPaid = existingOrder && Boolean(existingOrder.isPaid);

  if (isAlreadyPaid) {
    if (qrWrapper) qrWrapper.style.display = 'none';
    if (waitingNotice) waitingNotice.style.display = 'none';
    if (paidSuccessBox) paidSuccessBox.style.display = 'flex';
    if (successDesc) {
      successDesc.innerHTML = 'Hệ thống TPBank đã khớp lệnh thanh toán. Đơn hàng đang được chuẩn bị đóng gói giao ngay!';
    }
  } else {
    if (qrWrapper) qrWrapper.style.display = 'flex';
    if (waitingNotice) waitingNotice.style.display = 'flex';
    if (paidSuccessBox) paidSuccessBox.style.display = 'none';

    // Kích hoạt auto polling kiểm tra SePay / TPBank Webhook
    startProfilePaymentCheck(currentProfileQrOrderCode);
  }

  modal.style.display = 'flex';
}

// Đóng modal chuyển khoản & modal địa chỉ khi click ngoài backdrop hoặc bấm Escape
window.addEventListener('click', (e) => {
  const qrModal = document.getElementById('profileQrModal');
  if (e.target === qrModal) {
    closeProfileQrModal();
  }
  const addrModal = document.getElementById('profileAddressModal');
  if (e.target === addrModal) {
    closeAddressModal();
  }
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const qrModal = document.getElementById('profileQrModal');
    if (qrModal && qrModal.style.display === 'flex') {
      closeProfileQrModal();
    }
    const addrModal = document.getElementById('profileAddressModal');
    if (addrModal && addrModal.style.display === 'flex') {
      closeAddressModal();
    }
  }
});

// ==========================================
// HỆ THỐNG YÊU CẦU HỖ TRỢ / TICKET KHÁCH HÀNG
// ==========================================

let currentTicketsList = [];
let currentTicketFilterStatus = 'all';
let currentTicketPage = 1;
const TICKETS_PER_PAGE = 2;

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
  currentTicketPage = 1; // Reset về trang 1 khi lọc
  const tabsContainer = document.querySelector('#paneTickets .orders-filter-bar');
  if (tabsContainer) {
    tabsContainer.querySelectorAll('.orders-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-status') === status);
    });
  }
  renderCustomerTickets(status);
}

// Lấy danh sách ticket đã lọc và sắp xếp theo ngày từ mới nhất đến cũ nhất
function getFilteredCustomerTickets(filterStatus = 'all') {
  let list = Array.isArray(currentTicketsList) ? [...currentTicketsList] : [];
  if (filterStatus === 'pending') {
    list = list.filter(t => t.status === 'pending' || t.status === 'processing');
  } else if (filterStatus === 'replied') {
    list = list.filter(t => t.status === 'replied');
  } else if (filterStatus === 'closed') {
    list = list.filter(t => t.status === 'closed' || t.status === 'resolved');
  }

  // Luôn sắp xếp từ mới nhất đến cũ nhất (Newest first)
  list.sort((a, b) => {
    const timeA = new Date(a.createdAt || a.updatedAt || 0).getTime() || 0;
    const timeB = new Date(b.createdAt || b.updatedAt || 0).getTime() || 0;
    if (timeB !== timeA) return timeB - timeA;
    const codeA = String(a.ticketCode || a._id || '');
    const codeB = String(b.ticketCode || b._id || '');
    return codeB.localeCompare(codeA);
  });

  return list;
}

// Chuyển trang ticket khách hàng
function goToTicketPage(page) {
  const filtered = getFilteredCustomerTickets(currentTicketFilterStatus);
  const totalPages = Math.ceil(filtered.length / TICKETS_PER_PAGE) || 1;
  const targetPage = Math.max(1, Math.min(page, totalPages));

  currentTicketPage = targetPage;
  renderCustomerTickets(currentTicketFilterStatus);

  // Cuộn mượt lên đầu danh sách yêu cầu hỗ trợ
  const ticketsTab = document.getElementById('paneTickets');
  if (ticketsTab) {
    ticketsTab.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Render thanh phân trang ticket
function renderTicketsPagination(totalItems, totalPages, startIndex, endIndex) {
  const paginEl = document.getElementById('customerTicketsPagination');
  if (!paginEl) return;

  if (totalItems <= TICKETS_PER_PAGE || totalPages <= 1) {
    paginEl.style.display = 'none';
    paginEl.innerHTML = '';
    return;
  }

  paginEl.style.display = 'flex';

  const pages = getPaginationPages(currentTicketPage, totalPages);

  const prevDisabled = currentTicketPage <= 1 ? 'disabled' : '';
  const nextDisabled = currentTicketPage >= totalPages ? 'disabled' : '';

  let buttonsHtml = `
    <button class="btn-order-page" ${prevDisabled} onclick="goToTicketPage(${currentTicketPage - 1})" title="Trang trước">
      <i class="fas fa-chevron-left"></i>
    </button>
  `;

  pages.forEach(p => {
    if (p === '...') {
      buttonsHtml += `<span class="orders-page-dots">...</span>`;
    } else {
      const activeClass = p === currentTicketPage ? 'active' : '';
      buttonsHtml += `
        <button class="btn-order-page ${activeClass}" onclick="goToTicketPage(${p})">
          ${p}
        </button>
      `;
    }
  });

  buttonsHtml += `
    <button class="btn-order-page" ${nextDisabled} onclick="goToTicketPage(${currentTicketPage + 1})" title="Trang sau">
      <i class="fas fa-chevron-right"></i>
    </button>
  `;

  paginEl.innerHTML = `
    <div class="orders-pagination-info">
      Hiển thị <strong>${startIndex + 1} - ${endIndex}</strong> trong tổng số <strong>${totalItems}</strong> yêu cầu hỗ trợ
    </div>
    <div class="orders-pagination-controls">
      ${buttonsHtml}
    </div>
  `;
}

// Render giao diện danh sách yêu cầu hỗ trợ (Phân trang 2 ticket / trang, mới nhất đến cũ nhất)
function renderCustomerTickets(filterStatus = 'all') {
  const container = document.getElementById('customerTicketsContainer');
  const paginEl = document.getElementById('customerTicketsPagination');
  if (!container) return;

  const sortedAndFiltered = getFilteredCustomerTickets(filterStatus);
  const totalItems = sortedAndFiltered.length;

  if (totalItems === 0) {
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
    if (paginEl) {
      paginEl.style.display = 'none';
      paginEl.innerHTML = '';
    }
    return;
  }

  // Tính toán phân trang: 2 ticket / trang
  const totalPages = Math.ceil(totalItems / TICKETS_PER_PAGE);
  if (currentTicketPage > totalPages) {
    currentTicketPage = totalPages;
  }
  if (currentTicketPage < 1) {
    currentTicketPage = 1;
  }

  const startIndex = (currentTicketPage - 1) * TICKETS_PER_PAGE;
  const endIndex = Math.min(startIndex + TICKETS_PER_PAGE, totalItems);
  const pagedTickets = sortedAndFiltered.slice(startIndex, endIndex);

  const custTicketStatusMeta = {
    pending: { label: 'Chờ tiếp nhận', bg: '#fef3c7', color: '#b45309', border: '#fde68a', icon: 'fa-clock' },
    processing: { label: 'Đang xử lý', bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd', icon: 'fa-spinner fa-spin' },
    replied: { label: 'Đã phản hồi', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0', icon: 'fa-comment-dots' },
    resolved: { label: 'Đã giải quyết', bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', icon: 'fa-check-circle' },
    closed: { label: 'Đã đóng', bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0', icon: 'fa-lock' }
  };
  const statusMeta = custTicketStatusMeta;

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

  container.innerHTML = pagedTickets.map(t => {
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
                  <!-- NÚT 1: THÊM HÌNH ẢNH -->
                  <label class="btn-ticket-attach" title="Thêm hình ảnh (< 5MB)" style="cursor:pointer;">
                    <i class="fas fa-image" style="color:#0284c7;"></i>
                    <input type="file" id="custTicketImgFile-${t._id}" accept="image/*" style="display:none;" onchange="handleCustFileSelect(event, '${t._id}')">
                  </label>
                  <!-- NÚT 2: ĐÍNH KÈM TỆP / VIDEO -->
                  <label class="btn-ticket-attach" title="Đính kèm tệp hoặc video (< 500MB)" style="cursor:pointer;">
                    <i class="fas fa-paperclip" style="color:#f59e0b;"></i>
                    <input type="file" id="custTicketFile-${t._id}" accept="video/*,image/*" style="display:none;" onchange="handleCustFileSelect(event, '${t._id}')">
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
            <div class="ticket-closed-notice">
              <i class="fas fa-lock"></i>
              <span>Phiếu hỗ trợ này đã hoàn tất và đóng lại. Quý khách có thể xem lại toàn bộ lịch sử tin nhắn bên trên.</span>
            </div>

            ${(t.rating && t.rating.score) ? `
              <div class="ticket-rating-card rated">
                <div class="rating-prompt-header">
                  <div class="rating-badge-icon" style="background:#10b981; box-shadow:0 4px 10px rgba(16,185,129,0.28);"><i class="fas fa-check"></i></div>
                  <div>
                    <h5 class="rating-prompt-title" style="color:#065f46;">Đánh giá của bạn về dịch vụ hỗ trợ</h5>
                    <p class="rating-prompt-subtitle" style="color:#047857;">Cảm ơn quý khách đã dành thời gian gửi phản hồi.</p>
                  </div>
                </div>
                <div style="display:flex; align-items:center; gap:6px; margin:6px 0 8px;">
                  ${renderStarScoreHtml(t.rating.score)}
                  <strong style="color:#f59e0b; font-size:13px; margin-left:4px;">${t.rating.score}/5 sao</strong>
                </div>
                ${t.rating.comment ? `<div class="rating-comment-quote">“${escapeHtml(t.rating.comment)}”</div>` : ''}
              </div>
            ` : `
              <div class="ticket-rating-card unrated" id="ticketRatingCard-${t._id}">
                <div class="rating-prompt-header">
                  <div class="rating-badge-icon"><i class="fas fa-award"></i></div>
                  <div>
                    <h5 class="rating-prompt-title">Đánh giá chất lượng phục vụ của chuyên viên</h5>
                    <p class="rating-prompt-subtitle">Đánh giá của bạn sẽ giúp đội ngũ CSKH MoonLight hoàn thiện hơn mỗi ngày.</p>
                  </div>
                </div>
                <div class="rating-interactive-stars" id="ratingStars-${t._id}">
                  <span class="star-btn active" data-star="1" onclick="selectTicketStar('${t._id}', 1)" onmouseover="hoverTicketStar('${t._id}', 1)" onmouseout="resetTicketStar('${t._id}')" title="1 sao"><i class="fas fa-star"></i></span>
                  <span class="star-btn active" data-star="2" onclick="selectTicketStar('${t._id}', 2)" onmouseover="hoverTicketStar('${t._id}', 2)" onmouseout="resetTicketStar('${t._id}')" title="2 sao"><i class="fas fa-star"></i></span>
                  <span class="star-btn active" data-star="3" onclick="selectTicketStar('${t._id}', 3)" onmouseover="hoverTicketStar('${t._id}', 3)" onmouseout="resetTicketStar('${t._id}')" title="3 sao"><i class="fas fa-star"></i></span>
                  <span class="star-btn active" data-star="4" onclick="selectTicketStar('${t._id}', 4)" onmouseover="hoverTicketStar('${t._id}', 4)" onmouseout="resetTicketStar('${t._id}')" title="4 sao"><i class="fas fa-star"></i></span>
                  <span class="star-btn active" data-star="5" onclick="selectTicketStar('${t._id}', 5)" onmouseover="hoverTicketStar('${t._id}', 5)" onmouseout="resetTicketStar('${t._id}')" title="5 sao"><i class="fas fa-star"></i></span>
                  <span class="star-rating-label" id="starRatingLabel-${t._id}">5/5 sao - Rất hài lòng</span>
                </div>
                <input type="hidden" id="starRatingValue-${t._id}" value="5">
                <div class="rating-comment-box">
                  <textarea id="ratingComment-${t._id}" rows="2" placeholder="Góp ý thêm cho chuyên viên tư vấn (tùy chọn)..."></textarea>
                </div>
                <div style="display:flex; justify-content:flex-end; margin-top:10px;">
                  <button type="button" class="btn-primary" onclick="handleSubmitTicketRating('${t._id}')" style="padding:8px 18px; font-size:12.5px; border-radius:10px; font-weight:700;">
                    <i class="fas fa-paper-plane"></i> Gửi đánh giá
                  </button>
                </div>
              </div>
            `}
          `}
        </div>

        <div style="display:flex; justify-content:flex-end; align-items:center; padding-top:10px; border-top:1px solid #f1f5f9; gap:10px;">
          ${!isClosed ? `
            <button type="button" class="btn-order-action" onclick="handleCloseCustomerTicket('${t._id}')" style="font-size:12px; padding:6px 14px; border-color:#cbd5e1;">
              <i class="fas fa-check"></i> Đã giải quyết xong / Đóng ticket
            </button>
          ` : `
            <span style="font-size:12px; color:#94a3b8; display:inline-flex; align-items:center; gap:5px;"><i class="fas fa-lock"></i> Phiếu đã đóng (Chỉ xem lịch sử)</span>
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

  // Tự động cuộn xuống tin nhắn mới nhất cho các ticket trong trang hiện tại
  setTimeout(() => {
    pagedTickets.forEach(t => {
      const tid = t._id || t.id;
      scrollCustomerChatToBottom(tid, false);
    });
  }, 60);

  // Hiển thị thanh phân trang ticket
  renderTicketsPagination(totalItems, totalPages, startIndex, endIndex);
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

      currentTicketPage = 1;
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
  const imgInput = document.getElementById(`custTicketImgFile-${ticketId}`);
  if (imgInput) imgInput.value = '';

  const previewBox = document.getElementById(`custAttachPreview-${ticketId}`);
  if (previewBox) previewBox.style.display = 'none';

  const progressBox = document.getElementById(`custUploadProgressBox-${ticketId}`);
  if (progressBox) progressBox.style.display = 'none';
}

async function handleSendCustomerMessage(event, ticketId) {
  if (event && typeof event.preventDefault === 'function') {
    event.preventDefault();
  }
  const input = document.getElementById(`custTicketInput-${ticketId}`);
  const btn = document.getElementById(`btnCustSend-${ticketId}`);
  const text = input ? input.value.trim() : '';
  const file = custSelectedFiles[ticketId];

  const ticket = Array.isArray(currentTicketsList) ? currentTicketsList.find(t => String(t._id || t.id) === String(ticketId)) : null;
  if (ticket && ticket.status === 'closed') {
    showToast({ title: 'Phiếu đã đóng', message: 'Yêu cầu hỗ trợ này đã được đóng lại, không thể gửi thêm tin nhắn!', type: 'warning' });
    return;
  }

  if (!text && !file) {
    showToast({ title: 'Chưa nhập tin', message: 'Vui lòng nhập tin nhắn hoặc chọn ảnh để gửi!', type: 'warning' });
    return;
  }

  // Hủy trạng thái typing ngay khi gửi
  if (custTypingTimers[ticketId]) clearTimeout(custTypingTimers[ticketId]);
  custTypingSent[ticketId] = false;
  MoonlightAPI.setTicketTyping(ticketId, false).catch(() => {});

  if (btn) btn.disabled = true;

  const tempMsgId = 'temp-msg-' + Date.now();
  let tempEl = null;

  try {
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

      tempEl = document.createElement('div');
      tempEl.id = tempMsgId;
      tempEl.className = 'cust-chat-msg-item';
      tempEl.setAttribute('data-msg-role', 'customer');
      tempEl.style.display = 'flex';
      tempEl.style.flexDirection = 'column';
      tempEl.style.alignItems = 'flex-end';
      tempEl.style.marginBottom = wasSameSender ? '3px' : '12px';
      tempEl.style.position = 'relative';

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

    const res = await MoonlightAPI.sendTicketMessage(ticketId, text, attachments);
    if (res && (res.success || res.data)) {
      const updatedTicket = res.data;
      if (updatedTicket) {
        const idx = currentTicketsList.findIndex(t => String(t._id || t.id) === String(ticketId));
        if (idx !== -1) {
          currentTicketsList[idx] = updatedTicket;
        }
        renderCustomerChatThreadOnly(updatedTicket);
        scrollCustomerChatToBottom(ticketId, true);
      }
    } else {
      showToast({ title: 'Lỗi gửi tin', message: res?.message || 'Không thể gửi phản hồi.', type: 'danger' });
      if (tempEl) {
        const statusDiv = tempEl.querySelector('.msg-status-tag');
        if (statusDiv) {
          statusDiv.innerHTML = `<span style="color:#ef4444;"><i class="fas fa-exclamation-circle"></i> Lỗi gửi</span>`;
        }
      }
    }
  } catch (err) {
    console.error('Lỗi khi gửi tin nhắn ticket:', err);
    showToast({ title: 'Lỗi gửi tin', message: err.message || 'Có lỗi xảy ra khi gửi tin nhắn.', type: 'danger' });
    if (tempEl) {
      const statusDiv = tempEl.querySelector('.msg-status-tag');
      if (statusDiv) {
        statusDiv.innerHTML = `<span style="color:#ef4444;"><i class="fas fa-exclamation-circle"></i> Lỗi gửi</span>`;
      }
    }
  } finally {
    if (btn) btn.disabled = false;
    if (input) input.focus();
  }
}

// ==========================================
// ĐÁNH GIÁ CHẤT LƯỢNG DỊCH VỤ HỖ TRỢ (TICKET RATING)
// ==========================================
const ticketStarLabels = {
  1: '1/5 sao - Rất không hài lòng',
  2: '2/5 sao - Chưa hài lòng',
  3: '3/5 sao - Bình thường',
  4: '4/5 sao - Hài lòng',
  5: '5/5 sao - Rất hài lòng'
};

function renderStarScoreHtml(score) {
  let s = Math.min(5, Math.max(1, Math.round(score || 5)));
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= s) {
      html += '<i class="fas fa-star" style="color:#f59e0b; margin-right:2px;"></i>';
    } else {
      html += '<i class="far fa-star" style="color:#cbd5e1; margin-right:2px;"></i>';
    }
  }
  return html;
}

function selectTicketStar(ticketId, score) {
  const container = document.getElementById(`ratingStars-${ticketId}`);
  const valInput = document.getElementById(`starRatingValue-${ticketId}`);
  const labelEl = document.getElementById(`starRatingLabel-${ticketId}`);
  if (!container || !valInput) return;

  valInput.value = score;
  if (labelEl) labelEl.textContent = ticketStarLabels[score] || `${score}/5 sao`;

  container.querySelectorAll('.star-btn').forEach(btn => {
    const s = parseInt(btn.getAttribute('data-star'), 10);
    btn.classList.toggle('active', s <= score);
    btn.classList.remove('hover');
  });
}

function hoverTicketStar(ticketId, score) {
  const container = document.getElementById(`ratingStars-${ticketId}`);
  const labelEl = document.getElementById(`starRatingLabel-${ticketId}`);
  if (!container) return;

  if (labelEl) labelEl.textContent = ticketStarLabels[score] || `${score}/5 sao`;

  container.querySelectorAll('.star-btn').forEach(btn => {
    const s = parseInt(btn.getAttribute('data-star'), 10);
    btn.classList.toggle('hover', s <= score);
  });
}

function resetTicketStar(ticketId) {
  const container = document.getElementById(`ratingStars-${ticketId}`);
  const valInput = document.getElementById(`starRatingValue-${ticketId}`);
  const labelEl = document.getElementById(`starRatingLabel-${ticketId}`);
  if (!container || !valInput) return;

  const currentScore = parseInt(valInput.value, 10) || 5;
  if (labelEl) labelEl.textContent = ticketStarLabels[currentScore] || `${currentScore}/5 sao`;

  container.querySelectorAll('.star-btn').forEach(btn => {
    const s = parseInt(btn.getAttribute('data-star'), 10);
    btn.classList.toggle('active', s <= currentScore);
    btn.classList.remove('hover');
  });
}

async function handleSubmitTicketRating(ticketId) {
  const valInput = document.getElementById(`starRatingValue-${ticketId}`);
  const commentInput = document.getElementById(`ratingComment-${ticketId}`);
  const score = parseInt(valInput?.value, 10) || 5;
  const comment = (commentInput?.value || '').trim();

  try {
    const res = await MoonlightAPI.rateMyTicket(ticketId, score, comment);
    if (res && (res.success || res.data)) {
      showToast({ title: 'Thành công', message: 'Cảm ơn quý khách đã gửi đánh giá dịch vụ hỗ trợ!', type: 'success' });
      await loadCustomerTickets();
    } else {
      showToast({ title: 'Lỗi', message: res?.message || 'Không thể gửi đánh giá lúc này.', type: 'danger' });
    }
  } catch (err) {
    console.error('Lỗi khi gửi đánh giá:', err);
    showToast({ title: 'Lỗi', message: err.message || 'Lỗi kết nối khi gửi đánh giá.', type: 'danger' });
  }
}

// ==========================================
// ĐỒNG BỘ TIN NHẮN TRỰC TIẾP PHÍA KHÁCH HÀNG (LIVE SYNC & POLLING)
// ==========================================
let custLivePollTimer = null;

function startCustomerTicketLiveSync() {
  stopCustomerTicketLiveSync();

  custLivePollTimer = setInterval(async () => {
    // Chỉ đồng bộ khi tab Yêu cầu hỗ trợ đang mở
    const paneTickets = document.getElementById('paneTickets');
    if (!paneTickets || paneTickets.style.display === 'none') {
      return;
    }

    if (!Array.isArray(currentTicketsList) || currentTicketsList.length === 0) {
      return;
    }

    // Lọc các ticket đang mở (chưa đóng) để đồng bộ tin nhắn từ Admin
    const openTickets = currentTicketsList.filter(t => t.status !== 'closed' && t.status !== 'resolved');
    if (openTickets.length === 0) {
      return;
    }

    for (const t of openTickets) {
      const ticketId = String(t._id || t.id);
      const scrollEl = document.getElementById(`custMsgScroll-${ticketId}`);
      if (!scrollEl) continue;

      try {
        const res = await MoonlightAPI.getTicketLive(ticketId);
        if (res && res.success && res.data) {
          const liveData = res.data;
          const liveTicket = liveData.ticket || liveData;
          const adminTyping = liveData.typing?.admin;

          // 1. Cập nhật trạng thái Admin / CSKH đang soạn tin nhắn
          const typingEl = document.getElementById(`custTypingIndicator-${ticketId}`);
          const typingText = document.getElementById(`custTypingText-${ticketId}`);
          if (typingEl && typingText) {
            if (adminTyping && adminTyping.isTyping) {
              typingText.innerText = `${adminTyping.name || 'CSKH MoonLight'} đang soạn tin nhắn...`;
              typingEl.style.display = 'inline-flex';
            } else {
              typingEl.style.display = 'none';
            }
          }

          // 2. Kiểm tra nếu có tin nhắn mới từ Admin
          const currentCount = scrollEl.querySelectorAll('.cust-chat-msg-item').length;
          const serverMsgs = liveTicket.messages || [];

          if (serverMsgs.length > currentCount) {
            const isNearBottom = scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight < 75;

            // Cập nhật ticket trong currentTicketsList
            const idx = currentTicketsList.findIndex(item => String(item._id || item.id) === ticketId);
            if (idx !== -1) {
              currentTicketsList[idx] = liveTicket;
            }

            // Đồng bộ trạng thái badge nếu status thay đổi (vd: từ 'pending' sang 'replied')
            if (liveTicket.status && liveTicket.status !== t.status) {
              t.status = liveTicket.status;
              const cardEl = document.getElementById(`ticketCard-${ticketId}`);
              const badgeEl = cardEl ? cardEl.querySelector('.ticket-header-row span[style*="border-radius:20px"]') : null;
              if (badgeEl && custTicketStatusMeta[liveTicket.status]) {
                const sm = custTicketStatusMeta[liveTicket.status];
                badgeEl.style.background = sm.bg;
                badgeEl.style.color = sm.color;
                badgeEl.style.border = `1px solid ${sm.border}`;
                badgeEl.innerHTML = `<i class="fas ${sm.icon}"></i> ${sm.label}`;
              }
            }

            // Render lại khung tin nhắn
            renderCustomerChatThreadOnly(liveTicket);

            if (isNearBottom) {
              setTimeout(() => {
                scrollCustomerChatToBottom(ticketId, true);
              }, 50);
            } else {
              const diff = serverMsgs.length - currentCount;
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
          } else {
            // Cập nhật trạng thái 'Đã xem' nếu Admin đã xem tin nhắn của khách
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
        // Tránh gián đoạn giao diện khi mạng chập chờn
      }
    }
  }, 2500);
}

function stopCustomerTicketLiveSync() {
  if (custLivePollTimer) {
    clearInterval(custLivePollTimer);
    custLivePollTimer = null;
  }
}

// Bắt đầu live polling khi tải xong
startCustomerTicketLiveSync();

// Gán hàm vào window để gọi được từ inline onclick
window.startCustomerTicketLiveSync = startCustomerTicketLiveSync;
window.stopCustomerTicketLiveSync = stopCustomerTicketLiveSync;
window.handleSendCustomerMessage = handleSendCustomerMessage;
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
window.selectTicketStar = selectTicketStar;
window.hoverTicketStar = hoverTicketStar;
window.resetTicketStar = resetTicketStar;
window.handleSubmitTicketRating = handleSubmitTicketRating;
window.renderStarScoreHtml = renderStarScoreHtml;
window.goToOrderPage = goToOrderPage;
window.filterCustomerOrders = filterCustomerOrders;
window.goToTicketPage = goToTicketPage;
window.filterCustomerTickets = filterCustomerTickets;
window.showOrderVietQrModal = showOrderVietQrModal;
window.closeProfileQrModal = closeProfileQrModal;
window.copyText = copyText;
window.copyProfileQrAmount = copyProfileQrAmount;
window.copyProfileQrMemo = copyProfileQrMemo;
window.openAddressModal = openAddressModal;
window.closeAddressModal = closeAddressModal;
window.handleSaveAddressForm = handleSaveAddressForm;
window.handleSetDefaultAddress = handleSetDefaultAddress;
window.handleDeleteAddress = handleDeleteAddress;
window.initModalAddressSelector = initModalAddressSelector;
window.updateModalAddressPreview = updateModalAddressPreview;
window.loadSavedAddresses = loadSavedAddresses;
window.renderSavedAddressesList = renderSavedAddressesList;
window.handleSaveProfile = handleSaveProfile;
