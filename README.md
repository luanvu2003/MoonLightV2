# 🌙 MoonLight V2 — Full-Stack E-Commerce Platform

> **Luxury Fashion E-Commerce** · Thiết kế bởi **Vũ Phạm Luân**
> Tài liệu kỹ thuật & Kế hoạch phát triển toàn diện

---

## 📌 Mục Lục

- [1. Tổng Quan Dự Án](#1-tổng-quan-dự-án)
- [2. Kiến Trúc Hiện Tại (v1)](#2-kiến-trúc-hiện-tại-v1)
- [3. Những Gì Đã Hoàn Thành](#3-những-gì-đã-hoàn-thành)
- [4. Kiến Trúc Mục Tiêu (v2 — TypeScript)](#4-kiến-trúc-mục-tiêu-v2--typescript)
- [5. Cấu Trúc Thư Mục v2](#5-cấu-trúc-thư-mục-v2)
- [6. Thiết Kế Database (MongoDB)](#6-thiết-kế-database-mongodb)
- [7. API Design (RESTful)](#7-api-design-restful)
- [8. Luồng Hoạt Động (User Flows)](#8-luồng-hoạt-động-user-flows)
- [9. Frontend Pages & Components](#9-frontend-pages--components)
- [10. Phân Quyền (RBAC)](#10-phân-quyền-rbac)
- [11. Bảo Mật & Authentication](#11-bảo-mật--authentication)
- [12. Deployment & DevOps](#12-deployment--devops)
- [13. Roadmap Chuyển Đổi TypeScript](#13-roadmap-chuyển-đổi-typescript)
- [14. Tính Năng Tương Lai](#14-tính-năng-tương-lai)

---

## 1. Tổng Quan Dự Án

| Thuộc tính | Chi tiết |
|---|---|
| **Tên dự án** | MoonLight V2 — Luxury Fashion E-Commerce |
| **Loại** | Web bán hàng thời trang cao cấp (Full-stack) |
| **Chủ sở hữu** | Vũ Phạm Luân |
| **Địa chỉ cửa hàng** | 127 Tăng Bạt Hổ, Bảo Lộc |
| **Hotline** | 0393.203.037 |
| **Email** | luanvutk123@gmail.com |
| **GitHub** | [luanvu2003/MoonLightV2](https://github.com/luanvu2003/MoonLightV2) |
| **Live Demo** | [GitHub Pages](https://luanvu2003.github.io/MoonLightV2/) |

### Mục tiêu kinh doanh
- Trang bán hàng thời trang luxury (Vest, Sơ mi, Polo, Quần âu...) cho nam & nữ
- Hệ thống quản trị Admin đa vai trò (Admin / Owner / Staff)
- Trang POS cho nhân viên thu ngân tại cửa hàng
- Hỗ trợ thanh toán COD + chuyển khoản ngân hàng (MB Bank)

---

## 2. Kiến Trúc Hiện Tại (v1)

### Tech Stack hiện tại

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND                       │
│  HTML + Vanilla CSS + Vanilla JavaScript         │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │index.html│ │product   │ │ admin.html       │ │
│  │(Trang    │ │.html     │ │ (Quản trị viên)  │ │
│  │chủ shop) │ │(Chi tiết)│ │ + staff.html     │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
│  checkout.html │ login.html                      │
├─────────────────────────────────────────────────┤
│                   BACKEND                        │
│  Express.js (CommonJS) + Mongoose                │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │server.js │ │ db.js    │ │ Product Model    │ │
│  │(Express) │ │(MongoDB) │ │ (Schema duy nhất)│ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
├─────────────────────────────────────────────────┤
│                   DATABASE                       │
│  MongoDB Atlas (Cluster) + localStorage (Client) │
└─────────────────────────────────────────────────┘
```

### Vấn đề hiện tại cần cải thiện

| # | Vấn đề | Mức độ | Ghi chú |
|---|--------|--------|---------|
| 1 | **Dữ liệu chạy bằng localStorage** | 🔴 Nghiêm trọng | Đơn hàng, khách hàng, reviews, accounts, lịch trực... đều lưu ở client. Mất khi xóa trình duyệt |
| 2 | **Chỉ có 1 model MongoDB** (Product) | 🔴 Nghiêm trọng | Cần thêm User, Order, Review, Schedule, Customer |
| 3 | **Không có Authentication thực sự** | 🔴 Nghiêm trọng | Login chỉ check localStorage, không có JWT/session |
| 4 | **Backend chỉ có API Products** | 🟡 Trung bình | Thiếu API cho Orders, Users, Reviews, Customers |
| 5 | **CommonJS (require/module.exports)** | 🟡 Trung bình | Cần chuyển sang ESM + TypeScript |
| 6 | **Không có validation backend** | 🟡 Trung bình | Dữ liệu POST/PUT không được verify phía server |
| 7 | **Không có error handling chuẩn** | 🟡 Trung bình | Cần middleware xử lý lỗi tập trung |
| 8 | **Thiếu SEO metadata** | 🟢 Nhẹ | Cần thêm meta description, Open Graph, favicon |
| 9 | **Ảnh dùng Unsplash links** | 🟢 Nhẹ | Nên upload ảnh riêng hoặc dùng CDN |

---

## 3. Những Gì Đã Hoàn Thành

### ✅ Frontend — Trang Khách Hàng

| Trang | File | Trạng thái | Mô tả |
|-------|------|------------|-------|
| Trang chủ | `index.html` + `shop.js` | ✅ Hoàn thiện | Hero banner, Product grid, Best Sellers, Lookbook, Testimonials, Newsletter, Floating contact |
| Chi tiết SP | `product.html` + `shop.js` | ✅ Hoàn thiện | Gallery ảnh, chọn màu/size, đánh giá sản phẩm, SP liên quan |
| Thanh toán | `checkout.html` + `shop.js` | ✅ Hoàn thiện | Form giao hàng, COD + Banking (QR MB Bank), xác nhận đơn |
| Đăng nhập | `login.html` | ✅ Hoàn thiện | Login Admin/Owner/Staff → redirect đúng trang |

### ✅ Frontend — Trang Admin (admin.html + admin.js)

| Module | Trạng thái | Chi tiết |
|--------|------------|---------|
| Dashboard | ✅ | 6 stat cards, biểu đồ doanh thu (Chart.js), hoạt động gần đây |
| Quản lý Sản phẩm | ✅ | CRUD, biến thể (màu + size), upload ảnh, bộ lọc/tìm kiếm |
| Quản lý Đơn hàng | ✅ | Danh sách, cập nhật trạng thái (pending/confirmed/shipping/completed/cancelled), bộ lọc |
| Quản lý Khách hàng | ✅ | Danh sách, phân hạng VIP/Thân thiết/Mới (theo tổng chi tiêu), tìm kiếm tên/SĐT, xuất CSV |
| Đánh giá Khách hàng | ✅ | Hiển thị liêm khiết (không duyệt/không xóa), lọc theo SP/sao/trạng thái phản hồi, phản hồi shop |
| Quản lý Nhân sự | ✅ | CRUD tài khoản, phân vai trò (Admin/Owner/Staff) |
| Lịch trực & Phân ca | ✅ | Lịch tuần, phân ca (Sáng/Chiều/Tối), xếp lịch tự động, xuất CSV |
| Báo cáo Doanh thu | ✅ | Biểu đồ doanh thu, phân tích lợi nhuận |
| Cài đặt | ✅ | Đổi mật khẩu, avatar, chuyển dark/light theme |
| **RBAC (Phân quyền)** | ✅ | Đầy đủ 3 vai trò: Admin (toàn quyền), Owner (không nhân sự), Staff (chỉ xem + xử lý đơn) |

### ✅ Frontend — Trang POS (staff.html + staff.js)

| Tính năng | Trạng thái |
|-----------|------------|
| Giao diện bán hàng nhanh | ✅ |
| Tìm kiếm & thêm SP vào đơn | ✅ |
| Tính tiền & thanh toán | ✅ |

### ✅ Backend (server.js)

| Tính năng | Trạng thái |
|-----------|------------|
| Express.js server | ✅ |
| MongoDB Atlas kết nối | ✅ |
| API CRUD Products | ✅ |
| Static file serving | ✅ |
| Route aliases (/admin, /staff, /login) | ✅ |
| Deploy script (GitHub Pages) | ✅ |

### ✅ Thiết kế & UX

| Tính năng | Trạng thái |
|-----------|------------|
| Responsive design (Mobile/Tablet/Desktop) | ✅ |
| Dark/Light mode (Admin) | ✅ |
| Smooth scroll, reveal animations | ✅ |
| Dropdown mega-menu (Bộ sưu tập) | ✅ |
| Floating contact buttons (Zalo, Messenger, Phone) | ✅ |
| Toast notifications | ✅ |
| Confirm dialogs (thay window.confirm) | ✅ |

---

## 4. Kiến Trúc Mục Tiêu (v2 — TypeScript)

### Tech Stack mới

```
┌───────────────────────────────────────────────────────┐
│                    FRONTEND                            │
│  HTML + Vanilla CSS + TypeScript (biên dịch → JS)     │
│  (Giữ nguyên các trang HTML hiện tại, JS → TS)        │
├───────────────────────────────────────────────────────┤
│                    BACKEND                             │
│  Node.js + Express.js + TypeScript                     │
│  ┌────────────┐ ┌────────────┐ ┌───────────────────┐  │
│  │ Routes     │ │Controllers │ │ Middleware         │  │
│  │ (API định  │ │(Xử lý     │ │ (Auth, Validate,   │  │
│  │  tuyến)    │ │logic)      │ │  Error handling)   │  │
│  └────────────┘ └────────────┘ └───────────────────┘  │
│  ┌────────────┐ ┌────────────┐ ┌───────────────────┐  │
│  │ Models     │ │ Services   │ │ Types/Interfaces   │  │
│  │ (Mongoose  │ │ (Business  │ │ (TypeScript types)  │  │
│  │  Schemas)  │ │  logic)    │ │                     │  │
│  └────────────┘ └────────────┘ └───────────────────┘  │
├───────────────────────────────────────────────────────┤
│                    DATABASE                            │
│  MongoDB Atlas                                         │
│  ┌────────┐ ┌────────┐ ┌─────────┐ ┌───────────────┐ │
│  │Products│ │Users   │ │Orders   │ │Reviews        │ │
│  │        │ │        │ │         │ │               │ │
│  └────────┘ └────────┘ └─────────┘ └───────────────┘ │
│  ┌────────┐ ┌────────┐                                │
│  │Schedule│ │Customer│                                │
│  └────────┘ └────────┘                                │
├───────────────────────────────────────────────────────┤
│                    SERVICES                            │
│  JWT Auth · bcrypt · Multer (Upload) · Nodemailer      │
└───────────────────────────────────────────────────────┘
```

---

## 5. Cấu Trúc Thư Mục v2

```
MoonLightV2/
├── public/                          # Frontend (giữ nguyên HTML/CSS)
│   ├── index.html                   # Trang chủ shop
│   ├── product.html                 # Chi tiết sản phẩm
│   ├── checkout.html                # Thanh toán
│   ├── login.html                   # Đăng nhập
│   ├── admin.html                   # Trang quản trị
│   ├── staff.html                   # Trang POS
│   ├── css/
│   │   ├── style.css                # Style khách hàng
│   │   └── admin.css                # Style admin panel
│   └── js/                          # Output của TypeScript (biên dịch)
│       ├── shop.js                  # ← biên dịch từ src/client/shop.ts
│       ├── admin.js                 # ← biên dịch từ src/client/admin.ts
│       ├── main.js                  # ← (deprecated, gộp vào admin.ts)
│       └── staff.js                 # ← biên dịch từ src/client/staff.ts
│
├── src/                             # Source TypeScript
│   ├── server.ts                    # Entry point Express server
│   │
│   ├── config/
│   │   ├── db.ts                    # MongoDB connection
│   │   ├── env.ts                   # Environment variables (typed)
│   │   └── cors.ts                  # CORS configuration
│   │
│   ├── models/                      # Mongoose Schemas + TypeScript interfaces
│   │   ├── User.ts                  # Admin/Owner/Staff accounts
│   │   ├── Product.ts               # Sản phẩm + biến thể
│   │   ├── Order.ts                 # Đơn hàng
│   │   ├── Customer.ts              # Khách hàng
│   │   ├── Review.ts                # Đánh giá + phản hồi shop
│   │   └── Schedule.ts              # Lịch trực / Phân ca
│   │
│   ├── routes/                      # API route definitions
│   │   ├── auth.routes.ts           # Login, Logout, Refresh token
│   │   ├── product.routes.ts        # CRUD sản phẩm
│   │   ├── order.routes.ts          # CRUD đơn hàng
│   │   ├── customer.routes.ts       # CRUD khách hàng
│   │   ├── review.routes.ts         # CRUD đánh giá + phản hồi
│   │   ├── schedule.routes.ts       # CRUD lịch trực
│   │   ├── user.routes.ts           # CRUD tài khoản nhân viên
│   │   ├── report.routes.ts         # API báo cáo doanh thu
│   │   └── upload.routes.ts         # Upload ảnh sản phẩm / avatar
│   │
│   ├── controllers/                 # Request handlers (logic xử lý)
│   │   ├── auth.controller.ts
│   │   ├── product.controller.ts
│   │   ├── order.controller.ts
│   │   ├── customer.controller.ts
│   │   ├── review.controller.ts
│   │   ├── schedule.controller.ts
│   │   ├── user.controller.ts
│   │   └── report.controller.ts
│   │
│   ├── middleware/                   # Express middleware
│   │   ├── auth.middleware.ts        # JWT verify + role check
│   │   ├── validate.middleware.ts    # Request body validation
│   │   ├── error.middleware.ts       # Global error handler
│   │   └── upload.middleware.ts      # Multer file upload
│   │
│   ├── services/                    # Business logic (tách riêng khỏi controller)
│   │   ├── auth.service.ts          # Hash password, generate JWT
│   │   ├── email.service.ts         # Gửi email xác nhận đơn hàng
│   │   └── report.service.ts        # Tính toán doanh thu, thống kê
│   │
│   ├── types/                       # TypeScript type definitions
│   │   ├── express.d.ts             # Extend Express Request type
│   │   ├── models.types.ts          # Shared interfaces cho Models
│   │   ├── api.types.ts             # Request/Response types
│   │   └── enums.ts                 # Enums (OrderStatus, Role, ShiftType...)
│   │
│   ├── utils/                       # Utility functions
│   │   ├── response.ts              # Chuẩn hóa API response format
│   │   ├── logger.ts                # Logging (console + file)
│   │   └── helpers.ts               # Format tiền VNĐ, date...
│   │
│   └── client/                      # Frontend TypeScript source
│       ├── shop.ts                  # Logic trang khách hàng
│       ├── admin.ts                 # Logic trang admin
│       └── staff.ts                 # Logic trang POS
│
├── uploads/                         # Thư mục lưu ảnh upload
│   ├── products/
│   └── avatars/
│
├── tsconfig.json                    # TypeScript config (server)
├── tsconfig.client.json             # TypeScript config (client → public/js)
├── package.json
├── .env
├── .env.example
├── .gitignore
└── README.md                        # ← File này
```

---

## 6. Thiết Kế Database (MongoDB)

### 6.1 Collection: `users` (Tài khoản quản trị)

```typescript
interface IUser {
  _id: ObjectId;
  name: string;                    // "Nguyễn Văn A"
  username: string;                // "admin" (unique)
  password: string;                // bcrypt hash
  role: 'Admin' | 'Owner' | 'Staff';
  avatar?: string;                 // URL ảnh đại diện
  isActive: boolean;               // Trạng thái kích hoạt
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### 6.2 Collection: `products` (Sản phẩm)

```typescript
interface IVariantSize {
  size: string;                    // "S", "M", "L", "XL"...
  stock: number;                   // Số lượng tồn kho
}

interface IVariant {
  color: string;                   // "Đen", "Trắng"...
  colorCode: string;               // "#000000"
  img: string;                     // URL ảnh biến thể
  price: number;                   // Giá (VNĐ)
  sizes: IVariantSize[];           // Danh sách size + stock
}

interface IProduct {
  _id: ObjectId;
  name: string;                    // "Áo Vest Luxury Slim Fit"
  description?: string;
  category: string;                // "vest", "somi", "polo", "quanau"...
  gender: 'Nam' | 'Nữ' | 'Unisex';
  variants: IVariant[];            // Các biến thể màu/size
  rating: number;                  // Điểm đánh giá trung bình (1-5)
  sold: number;                    // Tổng đã bán
  salePercent?: number;            // % giảm giá (nếu có)
  isActive: boolean;               // Còn kinh doanh
  createdAt: Date;
  updatedAt: Date;
}
```

### 6.3 Collection: `orders` (Đơn hàng)

```typescript
interface IOrderItem {
  productId: ObjectId;
  productName: string;
  variant: string;                 // "Đen - L"
  img: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface IOrder {
  _id: ObjectId;
  orderCode: string;               // "ML-20260905-001"
  customer: {
    name: string;
    phone: string;
    address: string;
    note?: string;
  };
  items: IOrderItem[];
  subtotal: number;                // Tổng trước giảm
  discount: number;                // Giảm giá
  shippingFee: number;             // Phí vận chuyển
  total: number;                   // Tổng thanh toán
  paymentMethod: 'cod' | 'banking';
  status: 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled';
  processedBy?: ObjectId;          // Nhân viên xử lý
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 6.4 Collection: `customers` (Khách hàng)

```typescript
interface ICustomer {
  _id: ObjectId;
  name: string;
  phone: string;                   // unique identifier
  email?: string;
  address?: string;
  totalSpent: number;              // Tổng chi tiêu → phân hạng tự động
  orderCount: number;              // Số đơn đã mua
  tier: 'VIP' | 'Thân thiết' | 'Khách mới';
  // VIP: > 10 triệu, Thân thiết: > 5 triệu, Mới: < 5 triệu
  lastOrderDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### 6.5 Collection: `reviews` (Đánh giá)

```typescript
interface IReview {
  _id: ObjectId;
  productId: ObjectId;
  productName: string;
  name: string;                    // Tên khách đánh giá
  rating: number;                  // 1-5 sao
  content: string;                 // Nội dung nhận xét
  status: 'approved';              // Luôn approved (Liêm khiết)

  // Phản hồi từ shop (Admin ghi trong trang quản trị)
  shopReply?: string;              // Nội dung phản hồi
  shopReplyBy?: string;            // Tên nhân viên (nội bộ)
  shopReplyRole?: string;          // Vai trò nhân viên
  shopReplyDate?: Date;
  // Trang ngoài khách hàng luôn hiển thị "MoonLight" thay vì tên NV

  createdAt: Date;
}
```

### 6.6 Collection: `schedules` (Lịch trực)

```typescript
interface ISchedule {
  _id: ObjectId;
  staffId: ObjectId;               // ref → User
  staffName: string;
  date: string;                    // "2026-09-05" (ISO date string)
  shiftType: 'morning' | 'afternoon' | 'evening';
  shiftName: string;               // "Ca Sáng", "Ca Chiều", "Ca Tối"
  startTime: string;               // "07:00"
  endTime: string;                 // "13:00"
  role: string;                    // "Thu ngân", "Kho hàng", "Tư vấn"...
  status: 'scheduled' | 'active' | 'completed' | 'off';
  note?: string;
  createdAt: Date;
}
```

### Sơ đồ quan hệ (Entity Relationship)

```
    USERS ──────┬── xử lý ──────── ORDERS
       │        │                     │
       │        └── phản hồi ──── REVIEWS
       │                              │
       └── được phân ca ── SCHEDULES  │
                                      │
    PRODUCTS ── nhận đánh giá ────────┘
       │
       └── thuộc đơn ── ORDER_ITEMS ── thuộc ── ORDERS

    CUSTOMERS ── đặt mua ── ORDERS
```

---

## 7. API Design (RESTful)

### Base URL: `/api/v1`

### 7.1 Authentication

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `POST` | `/auth/login` | Đăng nhập → JWT token | ❌ |
| `POST` | `/auth/logout` | Đăng xuất (invalidate token) | ✅ |
| `POST` | `/auth/refresh` | Refresh access token | ✅ |
| `GET` | `/auth/me` | Lấy thông tin user hiện tại | ✅ |
| `PUT` | `/auth/password` | Đổi mật khẩu | ✅ |
| `PUT` | `/auth/avatar` | Cập nhật avatar | ✅ |

### 7.2 Products

| Method | Endpoint | Mô tả | Auth | Role |
|--------|----------|-------|------|------|
| `GET` | `/products` | Danh sách SP (hỗ trợ filter, pagination) | ❌ | All |
| `GET` | `/products/:id` | Chi tiết 1 SP | ❌ | All |
| `GET` | `/products/category/:cat` | SP theo danh mục | ❌ | All |
| `POST` | `/products` | Thêm SP mới | ✅ | Admin, Owner |
| `PUT` | `/products/:id` | Sửa SP | ✅ | Admin, Owner |
| `DELETE` | `/products/:id` | Xóa SP | ✅ | Admin |

### 7.3 Orders

| Method | Endpoint | Mô tả | Auth | Role |
|--------|----------|-------|------|------|
| `GET` | `/orders` | Danh sách đơn hàng (filter: status, date) | ✅ | Admin, Owner, Staff |
| `GET` | `/orders/:id` | Chi tiết đơn hàng | ✅ | Admin, Owner, Staff |
| `POST` | `/orders` | Tạo đơn hàng mới (từ checkout) | ❌ | Khách hàng |
| `PUT` | `/orders/:id/status` | Cập nhật trạng thái đơn | ✅ | Admin, Owner, Staff |
| `DELETE` | `/orders/:id` | Xóa đơn hàng | ✅ | Admin, Owner |

### 7.4 Customers

| Method | Endpoint | Mô tả | Auth | Role |
|--------|----------|-------|------|------|
| `GET` | `/customers` | Danh sách khách hàng (search, filter tier) | ✅ | Admin, Owner, Staff |
| `GET` | `/customers/:id` | Chi tiết khách + lịch sử đơn | ✅ | Admin, Owner |
| `GET` | `/customers/export/csv` | Xuất CSV | ✅ | Admin, Owner |

### 7.5 Reviews

| Method | Endpoint | Mô tả | Auth | Role |
|--------|----------|-------|------|------|
| `GET` | `/reviews` | Danh sách đánh giá (filter: product, star, reply status) | ✅ | Admin, Owner, Staff |
| `GET` | `/reviews/product/:productId` | Đánh giá theo SP (cho trang khách) | ❌ | All |
| `POST` | `/reviews` | Gửi đánh giá mới (khách hàng) | ❌ | All |
| `PUT` | `/reviews/:id/reply` | Phản hồi đánh giá (shop) | ✅ | Admin, Owner, Staff |
| `GET` | `/reviews/export/csv` | Xuất CSV đánh giá | ✅ | Admin, Owner |

### 7.6 Users (Nhân sự)

| Method | Endpoint | Mô tả | Auth | Role |
|--------|----------|-------|------|------|
| `GET` | `/users` | Danh sách tài khoản | ✅ | Admin |
| `POST` | `/users` | Tạo tài khoản nhân viên | ✅ | Admin |
| `PUT` | `/users/:id` | Sửa thông tin nhân viên | ✅ | Admin |
| `DELETE` | `/users/:id` | Xóa tài khoản | ✅ | Admin |

### 7.7 Schedules (Lịch trực)

| Method | Endpoint | Mô tả | Auth | Role |
|--------|----------|-------|------|------|
| `GET` | `/schedules` | Lịch trực tuần (query: week offset) | ✅ | All |
| `POST` | `/schedules` | Phân ca mới | ✅ | Admin, Owner |
| `PUT` | `/schedules/:id` | Sửa ca | ✅ | Admin, Owner |
| `DELETE` | `/schedules/:id` | Xóa ca | ✅ | Admin, Owner |
| `PUT` | `/schedules/:id/status` | Đổi trạng thái ca | ✅ | Admin, Owner |
| `POST` | `/schedules/auto-generate` | Xếp lịch tự động | ✅ | Admin, Owner |

### 7.8 Reports (Báo cáo)

| Method | Endpoint | Mô tả | Auth | Role |
|--------|----------|-------|------|------|
| `GET` | `/reports/revenue` | Doanh thu theo khoảng thời gian | ✅ | Admin, Owner |
| `GET` | `/reports/top-products` | SP bán chạy nhất | ✅ | Admin, Owner |
| `GET` | `/reports/overview` | Tổng quan dashboard | ✅ | Admin, Owner |
| `GET` | `/reports/export` | Xuất báo cáo | ✅ | Admin, Owner |

### Chuẩn Response Format

```typescript
// Thành công
{
  "success": true,
  "data": { ... },
  "message": "Lấy dữ liệu thành công",
  "pagination": {             // Chỉ có khi list
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}

// Lỗi
{
  "success": false,
  "message": "Không tìm thấy sản phẩm",
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "status": 404
  }
}
```

---

## 8. Luồng Hoạt Động (User Flows)

### 8.1 Luồng Mua Hàng (Khách hàng)

```
🏠 Trang Chủ
    │
    ▼
📦 Chọn sản phẩm → Trang Chi Tiết SP
    │
    ▼
🎨 Chọn Màu + Size → Chọn số lượng
    │
    ▼
🛒 Thêm vào Giỏ Hàng
    │
    ├── Tiếp tục mua → Quay lại Trang Chủ
    │
    └── Thanh toán → 💳 Trang Checkout
                        │
                        ▼
                   Nhập thông tin giao hàng
                        │
                        ▼
                   ┌─── Chọn thanh toán ───┐
                   │                        │
                COD (nhận hàng)     Banking (QR MB Bank)
                   │                        │
                   └────────┬───────────────┘
                            ▼
                   ✅ Xác nhận đơn hàng
                   📧 Email xác nhận
                   📋 Đơn vào Admin
```

### 8.2 Luồng Xử Lý Đơn Hàng (Admin/Staff)

```
📋 Đơn hàng mới (pending)
    │
    ▼
👤 Admin/Staff xem xét
    │
    ▼
✅ Xác nhận đơn (confirmed)
    │
    ▼
🚚 Giao hàng (shipping)
    │
    ├── Giao thành công → ✅ Hoàn thành (completed)
    │                          │
    │                          ├── 💰 Cập nhật doanh thu
    │                          └── 👤 Cập nhật chi tiêu khách hàng
    │                                  │
    │                                  ├── > 10 triệu → 🌟 VIP
    │                                  ├── > 5 triệu  → 💛 Thân thiết
    │                                  └── < 5 triệu  → 🆕 Khách mới
    │
    └── Khách hủy → ❌ Hủy đơn (cancelled)
```

### 8.3 Luồng Đăng Nhập & Phân Quyền

```
🔑 Login Page
    │
    ▼
POST /api/v1/auth/login (username + password)
    │
    ▼
Server: bcrypt.compare() → verify
    │
    ├── ❌ Sai → Hiện lỗi "Tài khoản không hợp lệ"
    │
    └── ✅ Đúng → Trả JWT Token (accessToken + refreshToken)
                    │
                    ▼
              Check role trong token
                    │
                    ├── Admin → 🏠 Dashboard (toàn quyền)
                    ├── Owner → 🏠 Dashboard (ẩn menu Nhân sự)
                    └── Staff → 📋 Đơn hàng (giới hạn quyền)

Mọi API request sau đó:
    Authorization: Bearer <accessToken>
        │
        ▼
    auth.middleware.ts → verify token + kiểm tra role
        │
        ├── Token hết hạn → POST /auth/refresh
        └── Token OK → Cho phép truy cập
```

### 8.4 Luồng Đánh Giá & Phản Hồi

```
👤 Khách hàng (Trang chi tiết SP)
    │
    ▼
Viết đánh giá: Chọn sao + Nhận xét
    │
    ▼
POST /api/v1/reviews → Lưu vào MongoDB
    │
    ▼
✅ Hiển thị NGAY LẬP TỨC (Liêm khiết - không duyệt)
    │
    ▼
📊 Admin thấy đánh giá mới
    │
    ├── Phản hồi → Mở modal → PUT /api/v1/reviews/:id/reply
    │                              │
    │                              ├── Trang admin: hiện tên NV thật + role
    │                              └── Trang khách: hiện "MoonLight"
    │
    └── Chưa phản hồi → Badge 🟡 "Chưa phản hồi"
```

---

## 9. Frontend Pages & Components

### Bảng tổng hợp các trang

| Trang | URL | File | JS | CSS | Mô tả |
|-------|-----|------|-----|-----|-------|
| Trang chủ | `/` | `index.html` | `shop.js` | `style.css` | Hero, Products, Best Sellers, Lookbook, Testimonials |
| Chi tiết SP | `/product?id=X` | `product.html` | `shop.js` | `style.css` | Gallery, Variants, Reviews, Related |
| Thanh toán | `/checkout` | `checkout.html` | `shop.js` | `style.css` | Form, Payment, Confirm |
| Đăng nhập | `/login` | `login.html` | inline | `style.css` | Login form → redirect |
| Admin | `/admin` | `admin.html` | `admin.js` | `admin.css` | Dashboard, Products, Orders, Customers, Reviews, Staff, Schedule, Reports, Settings |
| POS | `/staff` | `staff.html` | `staff.js` | `admin.css` | Quick sale interface |

### Components tái sử dụng (trong JS)

| Component | File | Dùng ở |
|-----------|------|--------|
| Toast Notification | `admin.js` | Admin, Shop |
| Confirm Dialog | `admin.js` | Admin |
| Result Modal | `admin.js` | Admin |
| Cart Sidebar | `shop.js` | Index, Product |
| Wishlist Sidebar | `shop.js` | Index |
| Search Overlay | `shop.js` | Index |
| Product Card | `shop.js` | Index |
| Shop Reply Modal | `admin.js` | Admin (Reviews) |
| Shift Modal | `admin.js` | Admin (Schedule) |
| Staff Modal | `admin.js` | Admin (HR) |

---

## 10. Phân Quyền (RBAC)

### Ma trận quyền đầy đủ

```
┌───────────────────────────┬───────┬───────┬───────┐
│         CHỨC NĂNG          │ ADMIN │ OWNER │ STAFF │
├───────────────────────────┼───────┼───────┼───────┤
│ Dashboard (Tổng quan)      │  ✅   │  ✅   │  ❌   │
│ Báo cáo doanh thu          │  ✅   │  ✅   │  ❌   │
├───────────────────────────┼───────┼───────┼───────┤
│ Xem sản phẩm               │  ✅   │  ✅   │  ✅   │
│ Thêm / Sửa sản phẩm       │  ✅   │  ✅   │  ❌   │
│ Xóa sản phẩm               │  ✅   │  ❌   │  ❌   │
├───────────────────────────┼───────┼───────┼───────┤
│ Xem đơn hàng               │  ✅   │  ✅   │  ✅   │
│ Xử lý đơn hàng             │  ✅   │  ✅   │  ✅   │
│ Xóa đơn hàng               │  ✅   │  ✅   │  ❌   │
├───────────────────────────┼───────┼───────┼───────┤
│ Xem khách hàng              │  ✅   │  ✅   │  ✅   │
│ Xuất CSV khách hàng         │  ✅   │  ✅   │  ❌   │
├───────────────────────────┼───────┼───────┼───────┤
│ Xem đánh giá                │  ✅   │  ✅   │  ✅   │
│ Phản hồi đánh giá           │  ✅   │  ✅   │  ✅   │
├───────────────────────────┼───────┼───────┼───────┤
│ Xem lịch trực               │  ✅   │  ✅   │  👁   │
│ Phân ca / Sửa / Xóa ca     │  ✅   │  ✅   │  ❌   │
│ Xếp lịch tự động            │  ✅   │  ✅   │  ❌   │
├───────────────────────────┼───────┼───────┼───────┤
│ Quản lý nhân sự (CRUD)     │  ✅   │  ❌   │  ❌   │
├───────────────────────────┼───────┼───────┼───────┤
│ Cài đặt cá nhân             │  ✅   │  ✅   │  ✅   │
│ POS (bán hàng tại quầy)    │  ✅   │  ✅   │  ✅   │
└───────────────────────────┴───────┴───────┴───────┘
👁 = Chỉ xem, không thao tác
```

### Cơ chế bảo mật 3 lớp (sau migrate)

1. **UI Layer**: Ẩn menu/nút dựa trên `data-roles` + `applyRolePermissions()`
2. **Logic Layer**: Guard function kiểm tra `role` trước mỗi thao tác nhạy cảm
3. **API Layer** (MỚI): Middleware `auth.middleware.ts` kiểm tra JWT token + role trên mỗi request

---

## 11. Bảo Mật & Authentication

### Hiện tại (v1) — localStorage

```
Login → Check hardcoded accounts → Lưu user vào localStorage → Đọc role từ localStorage
```

### Mục tiêu (v2) — JWT + bcrypt

```
Login → POST /api/v1/auth/login
     → Server: bcrypt.compare(password, hashedPassword)
     → Trả { accessToken (15 phút), refreshToken (7 ngày) }
     → Client lưu token vào httpOnly cookie hoặc memory
     → Mọi API request: Authorization: Bearer <token>
     → Middleware: verify token + check role → cho phép / từ chối
```

### Dependencies bảo mật

| Package | Mục đích |
|---------|----------|
| `bcrypt` | Hash mật khẩu (10 rounds salt) |
| `jsonwebtoken` | Tạo/verify JWT token |
| `cookie-parser` | Đọc cookies (httpOnly cookie) |
| `helmet` | Bảo mật HTTP headers |
| `express-rate-limit` | Chống brute-force login |
| `express-validator` | Validate request body |

---

## 12. Deployment & DevOps

### Hiện tại

| Môi trường | Platform | URL |
|-----------|----------|-----|
| Frontend (static) | GitHub Pages | `luanvu2003.github.io/MoonLightV2/` |
| Backend + Frontend | Render / Local | `localhost:10000` |
| Database | MongoDB Atlas | Cluster free tier |

### Mục tiêu

| Môi trường | Platform | Ghi chú |
|-----------|----------|---------|
| Production | **Render** hoặc **Railway** | Node.js + TypeScript build |
| Database | MongoDB Atlas (M0 free → M10 nếu cần) | |
| File Storage | **Cloudinary** hoặc **AWS S3** | Upload ảnh sản phẩm |
| Domain | Tùy chọn (moonlight.vn?) | |

### Scripts (package.json)

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc && tsc -p tsconfig.client.json",
    "start": "node dist/server.js",
    "deploy:gh": "node deploy.js",
    "seed": "tsx src/scripts/seed.ts",
    "migrate": "tsx src/scripts/migrate-localstorage.ts"
  }
}
```

---

## 13. Roadmap Chuyển Đổi TypeScript

### Phase 1: Chuẩn bị nền tảng (1-2 ngày)

- [ ] Cài đặt TypeScript + dependencies
  ```bash
  npm i -D typescript @types/node @types/express tsx
  npm i bcrypt jsonwebtoken cookie-parser helmet express-rate-limit express-validator
  npm i -D @types/bcrypt @types/jsonwebtoken @types/cookie-parser
  ```
- [ ] Tạo `tsconfig.json` (server) + `tsconfig.client.json` (client)
- [ ] Tạo cấu trúc thư mục `src/` mới
- [ ] Tạo file `src/types/enums.ts` (enum dùng chung)
- [ ] Tạo file `src/types/models.types.ts` (interfaces)

### Phase 2: Backend TypeScript (3-5 ngày)

- [ ] **Chuyển `server.js` → `src/server.ts`** (ESM import, typed)
- [ ] **Chuyển `src/config/db.js` → `src/config/db.ts`**
- [ ] **Tạo Models đầy đủ:**
  - [ ] `User.ts` (thay localStorage accounts)
  - [ ] `Product.ts` (nâng cấp schema hiện tại, thêm variants)
  - [ ] `Order.ts` (thay localStorage orders)
  - [ ] `Customer.ts` (thay localStorage customers)
  - [ ] `Review.ts` (thay localStorage reviews)
  - [ ] `Schedule.ts` (thay localStorage schedules)
- [ ] **Tạo Middleware:**
  - [ ] `auth.middleware.ts` (JWT verify + role guard)
  - [ ] `error.middleware.ts` (global error handler)
  - [ ] `validate.middleware.ts` (request validation)
- [ ] **Tạo Routes + Controllers:**
  - [ ] Auth (login / logout / refresh / me)
  - [ ] Products CRUD
  - [ ] Orders CRUD + status update
  - [ ] Customers (list, detail, export CSV)
  - [ ] Reviews (list, create, reply)
  - [ ] Users (CRUD nhân sự)
  - [ ] Schedules (CRUD, auto-generate)
  - [ ] Reports (revenue, top products)
- [ ] **Tạo Services:**
  - [ ] `auth.service.ts` (bcrypt + JWT)
  - [ ] `email.service.ts` (Nodemailer xác nhận đơn)

### Phase 3: Frontend kết nối API (2-3 ngày)

- [ ] **Tạo API client helper** (fetch wrapper với token)
- [ ] **Chuyển shop.js localStorage → fetch API:**
  - [ ] Products: `GET /api/v1/products`
  - [ ] Orders: `POST /api/v1/orders`
  - [ ] Reviews: `GET/POST /api/v1/reviews`
- [ ] **Chuyển admin.js localStorage → fetch API:**
  - [ ] Login: `POST /api/v1/auth/login`
  - [ ] Products CRUD
  - [ ] Orders CRUD
  - [ ] Customers list
  - [ ] Reviews + Reply
  - [ ] Users CRUD
  - [ ] Schedules CRUD
  - [ ] Reports
- [ ] **Chuyển staff.js localStorage → fetch API**

### Phase 4: Migration dữ liệu (1 ngày)

- [ ] Tạo script `seed.ts` (data mẫu)
- [ ] Tạo script `migrate-localstorage.ts` (import dữ liệu cũ vào MongoDB)
- [ ] Tạo tài khoản Admin mặc định (hashed password)

### Phase 5: TypeScript cho Frontend — Tùy chọn (2-3 ngày)

- [ ] Chuyển `shop.js` → `src/client/shop.ts`
- [ ] Chuyển `admin.js` → `src/client/admin.ts`
- [ ] Chuyển `staff.js` → `src/client/staff.ts`
- [ ] Cấu hình build pipeline (tsc → public/js/)

### Phase 6: Testing & Polish (1-2 ngày)

- [ ] Test tất cả API endpoints (Postman / Thunder Client)
- [ ] Test RBAC trên browser (Admin / Owner / Staff)
- [ ] Test luồng mua hàng đầy đủ (Khách → Checkout → Admin xử lý)
- [ ] Fix responsive issues
- [ ] Deploy lên Render / Railway

### Tổng thời gian ước tính: **10-16 ngày làm việc**

---

## 14. Tính Năng Tương Lai

| # | Tính năng | Ưu tiên | Ghi chú |
|---|-----------|---------|---------|
| 1 | **Tìm kiếm nâng cao** (full-text search) | 🔴 Cao | MongoDB Atlas Search hoặc Algolia |
| 2 | **Quản lý kho tự động** (trừ stock khi bán) | 🔴 Cao | Trừ stock khi đơn completed |
| 3 | **Mã giảm giá / Voucher** | 🟡 TB | Collection `coupons`, apply khi checkout |
| 4 | **Thông báo real-time** | 🟡 TB | Socket.io — đơn mới, đánh giá mới |
| 5 | **Trang "Theo dõi đơn hàng"** cho khách | 🟡 TB | Nhập SĐT + mã đơn → xem trạng thái |
| 6 | **Email transactional** | 🟡 TB | Xác nhận đơn, cập nhật trạng thái |
| 7 | **Thanh toán online** (VNPay / Momo) | 🟢 Thấp | Tích hợp payment gateway |
| 8 | **PWA (Progressive Web App)** | 🟢 Thấp | Offline support, push notification |
| 9 | **Multi-language** (EN / VI) | 🟢 Thấp | i18n |
| 10 | **Analytics dashboard** (Google Analytics) | 🟢 Thấp | Tracking user behavior |

---

## Chạy Dự Án

### Development (hiện tại — JavaScript)
```bash
# Cài dependencies
npm install

# Chạy dev server (tự restart khi sửa code)
npm run dev

# Truy cập
# Trang shop:  http://localhost:10000
# Trang admin: http://localhost:10000/admin
# Trang POS:   http://localhost:10000/staff
# Trang login: http://localhost:10000/login
```

### Development (sau khi chuyển TypeScript)
```bash
# Cài dependencies
npm install

# Chạy dev server TypeScript (tsx watch)
npm run dev

# Build production
npm run build

# Chạy production
npm start
```

### Environment Variables (.env)
```env
PORT=10000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/Moonlight
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here
EMAIL_USER=moonlight.contact.help@gmail.com
EMAIL_PASS=your_app_password
CLOUDINARY_URL=cloudinary://...    # (Tùy chọn - upload ảnh)
```

---

> **Tài liệu cập nhật:** 05/09/2026
> **Phiên bản:** 2.0-planning
> **Tác giả:** Vũ Phạm Luân × Antigravity AI
