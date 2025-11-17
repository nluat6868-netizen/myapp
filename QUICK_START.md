# Quick Start Guide

## Backend Setup

1. **Cài đặt dependencies:**
```bash
cd server
npm install
```

2. **Tạo file `.env`:**
```bash
cp .env.example .env
```

3. **Cập nhật `.env` với MongoDB URI của bạn:**
```
MONGODB_URI=mongodb://localhost:27017/myapp
JWT_SECRET=your-secret-key-here
```

4. **Khởi động MongoDB** (đảm bảo MongoDB đang chạy)

5. **Chạy backend:**
```bash
npm run dev
```

Backend sẽ chạy tại: `http://localhost:5000`

## Frontend Setup

1. **Cài đặt dependencies:**
```bash
npm install
```

2. **Tạo file `.env` trong root:**
```
REACT_APP_API_URL=http://localhost:5000/api
```

3. **Chạy frontend:**
```bash
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

## Tạo Admin User đầu tiên

Sau khi backend và MongoDB đã chạy, bạn có thể tạo admin user bằng cách:

1. **Qua API:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "anhluat165",
    "email": "nluat134@gmail.com",
    "password": "admin123",
    "role": "admin"
  }'
```

2. **Hoặc đăng ký qua frontend** và sau đó update role thành "admin" trong MongoDB

## Đăng nhập

- Email: `nluat134@gmail.com`
- Password: `admin123`

## Cấu trúc đã tích hợp

✅ **Backend:**
- Express.js server với MongoDB
- JWT authentication
- Controllers và routes cho tất cả features
- Models cho User, FAQ, Product, Order, Template, Tone, Settings

✅ **Frontend:**
- Redux store với Saga middleware
- API services với axios interceptors
- AuthContext tích hợp Redux
- Login/Register đã tích hợp Redux-Saga
- FAQs page đã tích hợp Redux-Saga

## Các components cần cập nhật tiếp

Các components sau vẫn đang dùng localStorage, cần cập nhật để dùng Redux-Saga:
- Users (đã có saga, cần cập nhật component)
- Products/Attributes
- Orders
- Templates
- Tones
- Settings
- Dashboard
- Promotions
- Shipping

## Lưu ý

- Tất cả API calls đều qua Redux-Saga
- Token được tự động thêm vào header
- Khi token hết hạn, user sẽ tự động logout
- Backend sử dụng MongoDB để lưu trữ dữ liệu



