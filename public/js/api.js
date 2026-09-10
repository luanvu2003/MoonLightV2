/**
 * 🌙 MoonLight V2 — API Client Helper
 * Tích hợp toàn diện với Backend Node.js / Express REST API (v1)
 * Hỗ trợ JWT Token, RBAC, và Fallback mượt mà với LocalStorage
 */

const API_BASE_URL = '/api/v1';

const MoonlightAPI = {
  // 1. Quản lý Token
  getToken() {
    return localStorage.getItem('moonlight_token') || '';
  },

  setToken(token) {
    localStorage.setItem('moonlight_token', token);
  },

  clearToken() {
    localStorage.removeItem('moonlight_token');
    localStorage.removeItem('moonlight_user');
  },

  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const opts = {
      ...options,
      headers: this.getHeaders(options.headers || {})
    };

    let timeoutId = null;
    try {
      // Timeout linh hoạt: mặc định 30 giây cho tác vụ thông thường, hoặc custom cho các tác vụ dài như deploy (180s)
      let controller = null;
      if (!opts.signal && typeof AbortController !== 'undefined') {
        const timeoutMs = options.timeout !== undefined ? options.timeout : 30000;
        if (timeoutMs > 0) {
          controller = new AbortController();
          opts.signal = controller.signal;
          timeoutId = setTimeout(() => {
            controller.abort(new Error(`Yêu cầu mạng quá thời gian chờ (${Math.round(timeoutMs / 1000)}s). Vui lòng thử lại.`));
          }, timeoutMs);
        }
      }

      const res = await fetch(url, opts);
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || `Lỗi yêu cầu HTTP ${res.status}`);
      }
      return data;
    } catch (err) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      console.warn(`[MoonlightAPI] Request to ${endpoint} failed:`, err.message);
      throw err;
    }
  },

  // 2. Authentication
  async login(username, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (res?.data?.tokens?.accessToken) {
      this.setToken(res.data.tokens.accessToken);
    }
    if (res?.data?.user) {
      localStorage.setItem('moonlight_user', JSON.stringify(res.data.user));
    }
    return res;
  },

  async sendRegisterOtp(username, email) {
    return await this.request('/auth/send-register-otp', {
      method: 'POST',
      body: JSON.stringify({ username, email })
    });
  },

  async verifyRegisterOtp(data) {
    const res = await this.request('/auth/verify-register-otp', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (res?.data?.tokens?.accessToken) {
      this.setToken(res.data.tokens.accessToken);
    }
    if (res?.data?.user) {
      localStorage.setItem('moonlight_user', JSON.stringify(res.data.user));
    }
    return res;
  },

  async loginWithGoogle(credential, accessToken = null, userInfo = null) {
    const res = await this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential, accessToken, userInfo })
    });
    if (res?.data?.tokens?.accessToken) {
      this.setToken(res.data.tokens.accessToken);
    }
    if (res?.data?.user) {
      localStorage.setItem('moonlight_user', JSON.stringify(res.data.user));
    }
    return res;
  },

  async getGoogleConfig() {
    try {
      const res = await this.request('/auth/google/config');
      return res?.data || null;
    } catch (e) {
      return null;
    }
  },

  async syncCustomerData(cart = [], wishlist = []) {
    if (!this.getToken()) return null;
    try {
      return await this.request('/auth/sync', {
        method: 'POST',
        body: JSON.stringify({ cart, wishlist })
      });
    } catch (e) {
      return null;
    }
  },

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearToken();
    }
  },

  async getMe() {
    return this.request('/auth/me');
  },

  async changePassword(currentPassword, newPassword) {
    return this.request('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  },

  // 3. Products
  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/products?${query}` : '/products';
    return this.request(endpoint);
  },

  async getProductById(id) {
    return this.request(`/products/${id}`);
  },

  async createProduct(productData) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },

  async updateProduct(id, productData) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  },

  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE'
    });
  },

  // 4. Orders
  async getOrders(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/orders?${query}` : '/orders';
    return this.request(endpoint);
  },

  async getOrderById(id) {
    return this.request(`/orders/${id}`);
  },

  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  async updateOrderStatus(id, status, cancelReason = '') {
    return this.request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, cancelReason })
    });
  },

  async confirmBankTransfer(orderCode) {
    return this.request(`/orders/${orderCode}/confirm-transfer`, {
      method: 'POST'
    });
  },

  async deleteOrder(id) {
    return this.request(`/orders/${id}`, {
      method: 'DELETE'
    });
  },

  // 5. Customers
  async getCustomers(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/customers?${query}` : '/customers';
    return this.request(endpoint);
  },

  async getCustomerById(id) {
    return this.request(`/customers/${id}`);
  },

  // 6. Reviews
  async getReviews(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/reviews?${query}` : '/reviews';
    return this.request(endpoint);
  },

  async getProductReviews(productId) {
    return this.request(`/reviews/product/${productId}`);
  },

  async createReview(reviewData) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  },

  async replyReview(id, reply) {
    return this.request(`/reviews/${id}/reply`, {
      method: 'PUT',
      body: JSON.stringify({ reply })
    });
  },

  // 7. Users (Nhân sự)
  async getUsers() {
    return this.request('/users');
  },

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE'
    });
  },

  // 8. Schedules (Lịch trực)
  async getSchedules(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/schedules?${query}` : '/schedules';
    return this.request(endpoint);
  },

  async createSchedule(scheduleData) {
    return this.request('/schedules', {
      method: 'POST',
      body: JSON.stringify(scheduleData)
    });
  },

  async updateSchedule(id, scheduleData) {
    return this.request(`/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(scheduleData)
    });
  },

  async deleteSchedule(id) {
    return this.request(`/schedules/${id}`, {
      method: 'DELETE'
    });
  },

  async autoGenerateSchedules(startDate) {
    return this.request('/schedules/auto-generate', {
      method: 'POST',
      body: JSON.stringify({ startDate })
    });
  },

  // 9. Reports (Thống kê)
  async getOverview() {
    return this.request('/reports/overview');
  },

  async getRevenueChart(days = 7) {
    return this.request(`/reports/revenue?days=${days}`);
  },

  async getTopProducts() {
    return this.request('/reports/top-products');
  },

  // 10. System Health & Deploy
  async getSystemHealth() {
    return this.request('/system/health');
  },

  async deploySystem() {
    return this.request('/system/deploy', {
      method: 'POST',
      timeout: 180000 // 3 phút cho git pull, build TypeScript và reload PM2
    });
  }
};

// Export toàn cục cho trình duyệt
if (typeof window !== 'undefined') {
  window.MoonlightAPI = MoonlightAPI;
}
