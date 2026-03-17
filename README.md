# 🚗 Car Rental System — Backend

REST API cho hệ thống cho thuê xe ô tô, hỗ trợ đầy đủ quy trình đặt xe, thanh toán VNPay, phân công tài xế và báo cáo tài chính.

---

## Công nghệ sử dụng

| Công nghệ | Phiên bản | Mô tả |
|---|---|---|
| Node.js | ≥ 18 | Runtime |
| Express | 5.x | HTTP framework |
| TypeScript | 5.x | Kiểu tĩnh |
| MongoDB + Mongoose | 9.x | Cơ sở dữ liệu |
| JWT | 9.x | Xác thực người dùng |
| bcrypt | 6.x | Mã hóa mật khẩu |
| VNPay (`vnpay`) | 2.x | Cổng thanh toán trực tuyến |
| Multer | 2.x | Upload file hợp đồng |
| Swagger UI Express | 5.x | Tài liệu API tự động |
| Google Generative AI | 1.x | Chatbot AI (Gemini) |
| Passport.js | 0.7.x | Authentication middleware |

---

## Cấu trúc thư mục

```
Car-Rental-System-Backend/
├── src/
│   ├── configs/
│   │   ├── config.ts         # Biến môi trường
│   │   ├── db.ts             # Kết nối MongoDB
│   │   └── swagger.ts        # Cấu hình Swagger
│   ├── middlewares/
│   │   ├── auth.ts           # Xác thực JWT
│   │   └── uploadContract.ts # Upload file hợp đồng (Multer)
│   ├── modules/
│   │   ├── user/             # Đăng ký, đăng nhập, quản lý user
│   │   ├── vehicle/          # Quản lý xe
│   │   ├── booking/          # Đặt xe, phân công tài xế
│   │   ├── payment/          # Thanh toán VNPay
│   │   ├── report/           # Báo cáo tài chính
│   │   └── chat/             # Chatbot AI (Gemini)
│   ├── scripts/
│   │   └── seedVehicles.ts   # Seed dữ liệu xe mẫu
│   ├── types/                # TypeScript types
│   ├── utils/                # JWT, hash password
│   └── server.ts             # Entry point
├── uploads/
│   └── contracts/            # File hợp đồng được upload
├── .env                      # Biến môi trường (tự tạo)
├── package.json
└── tsconfig.json
```

---

## Chức năng hệ thống

### 👥 Quản lý người dùng (`/api/v1/auth`)

| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/auth/register` | Đăng ký tài khoản khách hàng |
| `POST` | `/auth/login` | Đăng nhập (tất cả roles) |
| `GET/POST/PUT/DELETE` | `/auth/staff` | CRUD nhân viên |
| `GET/POST/PUT/DELETE` | `/auth/driver` | CRUD tài xế (yêu cầu `licenseNumber`) |
| `GET/PUT` | `/auth/user/:id` | Xem/cập nhật hồ sơ khách hàng |

### 🚙 Quản lý xe (`/api/v1/vehicle`)

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/vehicle` | Danh sách xe |
| `POST` | `/vehicle` | Thêm xe mới |
| `GET/PUT/DELETE` | `/vehicle/:id` | Xem/sửa/xóa xe |

Trạng thái xe: `available` | `rented` | `maintenance`

### 📋 Quản lý đặt xe (`/api/v1/booking`)

| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/booking` | Tạo đơn đặt xe |
| `GET` | `/booking` | Danh sách tất cả đơn |
| `GET` | `/booking/customer/:id` | Đơn theo khách hàng |
| `GET` | `/booking/driver/:id` | Đơn theo tài xế |
| `GET` | `/booking/status/:status` | Lọc đơn theo trạng thái |
| `GET` | `/booking/drivers-availability` | Kiểm tra tài xế rảnh/bận (`?startDate&endDate`) |
| `GET/PUT/DELETE` | `/booking/:id` | Xem/sửa/xóa đơn |
| `PATCH` | `/booking/:id/customer-confirm-deposit` | Khách xác nhận đã chuyển cọc |
| `PATCH` | `/booking/:id/staff-confirm-deposit` | Nhân viên xác nhận nhận cọc |
| `PATCH` | `/booking/:id/assign-driver` | Phân công tài xế (`body: { driverId }`) |
| `PATCH` | `/booking/:id/driver-accept` | Tài xế nhận chuyến |
| `PATCH` | `/booking/:id/driver-reject` | Tài xế từ chối chuyến |
| `PATCH` | `/booking/:id/receive-vehicle` | Xuất/nhận xe + upload hợp đồng (`multipart/form-data`) |

**Quy trình đặt xe (booking workflow):**

```
pending
 → awaiting_deposit_confirmation   (khách xác nhận chuyển cọc)
   → confirmed                     (nhân viên xác nhận nhận cọc)
     → vehicle_delivered           (xe đã được giao, hợp đồng đã upload)
       → in_progress               (khách tự lái)
       → transporting              (tài xế đang chở khách)
     → vehicle_returned            (xe trả, chờ thanh toán nốt)
       → completed                 (đã thanh toán xong)
 → cancelled                       (hủy đơn)
 → deposit_lost                    (hủy đơn, mất cọc)
```

### 💳 Thanh toán VNPay (`/api/v1/payment`)

| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/payment/vnpay/create-url` | Tạo link thanh toán cọc |
| `POST` | `/payment/vnpay/create-remaining-url` | Tạo link thanh toán phần còn lại |
| `GET` | `/payment/vnpay/ipn` | VNPay server-to-server callback |
| `GET` | `/payment/vnpay/return` | VNPay redirect về sau thanh toán → BE verify → redirect FE |

### 📊 Báo cáo tài chính (`/api/v1/reports`)

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/reports/financial` | Doanh thu tổng + top 10 xe được đặt nhiều nhất (`?from=&to=`) |

### 🤖 Chatbot AI (`/api/v1/chat`)

| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/chat/conversation` | Tạo cuộc hội thoại mới |
| `POST` | `/chat/conversation/:id/message` | Gửi tin nhắn |
| `GET` | `/chat/conversation/:id` | Lấy lịch sử hội thoại |

Chatbot dùng **Google Gemini 1.5 Flash**, trả lời bằng tiếng Việt, hiểu ngữ cảnh thuê xe và query trực tiếp dữ liệu xe trong DB để gợi ý.

---

## Cài đặt & Chạy

### Yêu cầu

- Node.js ≥ 18
- MongoDB Atlas hoặc MongoDB local
- Tài khoản VNPay sandbox

### 1. Clone & cài dependencies

```bash
git clone https://github.com/SWD392-Group5-CarRentalSystem/Car-Rental-System-Backend.git
cd Car-Rental-System-Backend
npm install
```

### 2. Tạo file `.env`

```env
# Server
PORT=4000

# MongoDB
MONGODB_URI_2=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>

# JWT
JWT_SECRET=your_jwt_secret_key

# VNPay Sandbox
VNP_TMN_CODE=your_tmn_code
VNP_HASH_SECRET=your_hash_secret
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:4000/api/v1/payment/vnpay/return

# Frontend URL (dùng khi redirect sau thanh toán)
FRONTEND_URL=http://localhost:5173

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Seed dữ liệu xe mẫu (tuỳ chọn)

```bash
npx ts-node src/scripts/seedVehicles.ts
```

### 4. Chạy development

```bash
npm run dev
```

### 5. Build & chạy production

```bash
npm run build
npm start
```

| URL | Mô tả |
|---|---|
| `http://localhost:4000/api/v1` | Base API |
| `http://localhost:4000/api-docs` | Swagger UI |

---

## Deploy lên production

1. Đẩy code lên GitHub
2. Tạo Web Service trên **Render** / **Railway** / **VPS**
3. Đặt biến môi trường trên platform:

```env
VNP_RETURN_URL=https://your-backend.com/api/v1/payment/vnpay/return
FRONTEND_URL=https://your-frontend.com
```

> ⚠️ `VNP_RETURN_URL` phải được **đăng ký** trong cổng quản lý VNPay merchant portal.
