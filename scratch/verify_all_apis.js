/**
 * Automated Verification Script for MoonLight V2 TypeScript API
 */

const BASE_URL = 'http://localhost:10000';

async function runTests() {
  console.log('🧪 Bắt đầu kiểm thử toàn diện hệ thống MoonLight V2...\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // 1. Static Routes
  await test('Trang chủ (GET /)', async () => {
    const res = await fetch(`${BASE_URL}/`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    if (!text.toLowerCase().includes('moon light') && !text.toLowerCase().includes('moonlight')) {
      throw new Error('Nội dung không chứa Moon Light');
    }
  });

  await test('Trang Admin (GET /admin)', async () => {
    const res = await fetch(`${BASE_URL}/admin`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    if (!text.includes('Moon Light Luxury Admin')) throw new Error('Nội dung không chứa tiêu đề Admin');
  });

  await test('Trang Đăng Nhập (GET /login)', async () => {
    const res = await fetch(`${BASE_URL}/login`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    if (!text.includes('Đăng Nhập Quản Trị')) throw new Error('Nội dung không chứa form Đăng nhập');
  });

  await test('Trang Thu Ngân POS (GET /staff)', async () => {
    const res = await fetch(`${BASE_URL}/staff`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });

  await test('Trang Thanh Toán (GET /checkout)', async () => {
    const res = await fetch(`${BASE_URL}/checkout`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });

  // 2. Auth API
  let adminToken = '';
  await test('Đăng nhập Admin (POST /api/v1/auth/login)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: '123' })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Login failed');
    if (!data.data?.tokens?.accessToken) throw new Error('Không nhận được accessToken');
    adminToken = data.data.tokens.accessToken;
    if (data.data.user.role !== 'Admin') throw new Error('Vai trò không phải Admin');
  });

  await test('Xác thực Token cá nhân (GET /api/v1/auth/me)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    if (data.data.username !== 'admin') throw new Error('Username sai');
  });

  // 3. Products API
  await test('Lấy danh sách sản phẩm (GET /api/v1/products)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/products`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    if (!Array.isArray(data.data) || data.data.length === 0) throw new Error('Dữ liệu sản phẩm rỗng');
  });

  await test('Legacy Alias tương thích ngược (GET /api/products)', async () => {
    const res = await fetch(`${BASE_URL}/api/products`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    if (!Array.isArray(data.data) || data.data.length === 0) throw new Error('Dữ liệu sản phẩm rỗng');
  });

  // 4. Reports & Overview API
  await test('Báo cáo Tổng quan KPI (GET /api/v1/reports/overview)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/reports/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    if (typeof data.data.todayRevenue !== 'number') throw new Error('Thiếu trường todayRevenue');
  });

  await test('Biểu đồ doanh thu (GET /api/v1/reports/revenue?days=7)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/reports/revenue?days=7`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    if (!Array.isArray(data.data.labels)) throw new Error('Thiếu mảng labels');
  });

  // 5. Schedules API
  await test('Xem Lịch trực (GET /api/v1/schedules)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/schedules`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
  });

  // 6. RBAC Guard: Staff không được truy cập User management
  await test('RBAC Guard: Staff bị chặn truy cập /api/v1/users', async () => {
    const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'staff', password: '123' })
    });
    const loginData = await loginRes.json();
    const staffToken = loginData.data?.tokens?.accessToken;

    const res = await fetch(`${BASE_URL}/api/v1/users`, {
      headers: { Authorization: `Bearer ${staffToken}` }
    });
    if (res.status !== 403) throw new Error(`Mong đợi 403 Forbidden, nhưng nhận được ${res.status}`);
  });

  // 7. Reviews API: Tạo đánh giá liêm khiết
  await test('Gửi Đánh Giá Liêm Khiết (POST /api/v1/reviews)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: '67c3db00d57e603b70b50001',
        productName: 'Áo Vest Luxury Slim Fit Hoàng Gia',
        name: 'Nguyễn Văn Long',
        rating: 5,
        content: 'Vest mặc rất ôm dáng, chất lượng vải xịn xò đẳng cấp!'
      })
    });
    const data = await res.json();
    // Đánh giá được phê duyệt ngay lập tức (liêm khiết)
    if (data.data?.status && data.data.status !== 'approved') {
      throw new Error('Đánh giá liêm khiết phải có status approved');
    }
  });

  console.log(`\n📊 KẾT QUẢ KIỂM THỬ: ${passed} PASS, ${failed} FAIL\n`);
  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error('Fatal error in tests:', err);
  process.exit(1);
});
