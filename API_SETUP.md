# Hướng dẫn Setup và Test API

## Cấu hình Backend

### 1. File `.env` trong `server/`

Đảm bảo file `server/.env` có nội dung:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/myapp
JWT_SECRET=myapp-secret-key-change-this-in-production-2024
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 2. Cấu hình Frontend

File `.env` trong root có:

```env
VITE_API_URL=http://localhost:5000/api
```

## Chạy Backend

```bash
cd server
npm install  # Nếu chưa install
npm start    # hoặc npm run dev (nếu có nodemon)
```

Backend sẽ chạy tại: `http://localhost:5000`

## Test API

### 1. Test Root Endpoint

Mở browser hoặc dùng Postman/curl:

```bash
GET http://localhost:5000/
```

Kết quả mong đợi:
```json
{
  "status": "OK",
  "message": "Backend API Server is running",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "users": "/api/users",
    "faqs": "/api/faqs",
    ...
  }
}
```

### 2. Test Health Check

```bash
GET http://localhost:5000/api/health
```

Kết quả:
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2024-..."
}
```

### 3. Test API Endpoints

Tất cả API endpoints đều có prefix `/api`:

- **Auth**: `http://localhost:5000/api/auth/login`
- **Users**: `http://localhost:5000/api/users`
- **FAQs**: `http://localhost:5000/api/faqs`
- **Products**: `http://localhost:5000/api/products`
- **Orders**: `http://localhost:5000/api/orders`
- **Templates**: `http://localhost:5000/api/templates`
- **Tones**: `http://localhost:5000/api/tones`
- **Settings**: `http://localhost:5000/api/settings`

## Cấu trúc API

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `POST /api/auth/forgot-password` - Quên mật khẩu

#### Users
- `GET /api/users` - Lấy danh sách users
- `GET /api/users/:id` - Lấy user theo ID
- `POST /api/users` - Tạo user mới
- `PUT /api/users/:id` - Cập nhật user
- `DELETE /api/users/:id` - Xóa user

#### FAQs
- `GET /api/faqs` - Lấy danh sách FAQs
- `GET /api/faqs/:id` - Lấy FAQ theo ID
- `POST /api/faqs` - Tạo FAQ mới
- `PUT /api/faqs/:id` - Cập nhật FAQ
- `DELETE /api/faqs/:id` - Xóa FAQ

#### Product Attributes
- `GET /api/product-attributes` - Lấy danh sách attributes
- `GET /api/product-attributes/:id` - Lấy attribute theo ID
- `POST /api/product-attributes` - Tạo attribute mới
- `PUT /api/product-attributes/:id` - Cập nhật attribute
- `PUT /api/product-attributes/order` - Cập nhật thứ tự attributes
- `DELETE /api/product-attributes/:id` - Xóa attribute

#### Products
- `GET /api/products` - Lấy danh sách products (có pagination)
- `GET /api/products/:id` - Lấy product theo ID
- `POST /api/products` - Tạo product mới
- `PUT /api/products/:id` - Cập nhật product
- `DELETE /api/products/:id` - Xóa product

#### Orders
- `GET /api/orders` - Lấy danh sách orders (có pagination, filter)
- `GET /api/orders/:id` - Lấy order theo ID
- `POST /api/orders` - Tạo order mới
- `PUT /api/orders/:id` - Cập nhật order
- `DELETE /api/orders/:id` - Xóa order
- `POST /api/orders/bulk-delete` - Xóa nhiều orders

#### Templates
- `GET /api/templates` - Lấy danh sách templates
- `GET /api/templates/:id` - Lấy template theo ID
- `POST /api/templates` - Tạo template mới
- `PUT /api/templates/:id` - Cập nhật template
- `DELETE /api/templates/:id` - Xóa template

#### Tones
- `GET /api/tones` - Lấy danh sách tones
- `GET /api/tones/:id` - Lấy tone theo ID
- `POST /api/tones` - Tạo tone mới
- `PUT /api/tones/:id` - Cập nhật tone
- `DELETE /api/tones/:id` - Xóa tone

#### Settings
- `GET /api/settings` - Lấy settings
- `PUT /api/settings` - Cập nhật settings

## CORS Configuration

Backend đã được cấu hình CORS để cho phép frontend từ:
- `http://localhost:3000` (mặc định)
- Hoặc giá trị từ `FRONTEND_URL` trong `.env`

## Troubleshooting

### Lỗi: "Network Error" hoặc "CORS Error"

1. Kiểm tra backend có đang chạy không:
   ```bash
   curl http://localhost:5000/api/health
   ```

2. Kiểm tra CORS config trong `server/server.js`

3. Kiểm tra `FRONTEND_URL` trong `server/.env` có đúng với frontend URL không

### Lỗi: "Cannot connect to MongoDB"

1. Đảm bảo MongoDB đang chạy
2. Kiểm tra `MONGODB_URI` trong `server/.env`
3. Test connection:
   ```bash
   mongosh "mongodb://localhost:27017/myapp"
   ```

### Lỗi: "401 Unauthorized"

1. Đảm bảo đã đăng nhập và có token
2. Kiểm tra token có được gửi trong header:
   ```
   Authorization: Bearer <token>
   ```

### Lỗi: "404 Not Found"

1. Kiểm tra endpoint có đúng prefix `/api` không
2. Kiểm tra route có được định nghĩa trong `server/server.js` không

## Test với cURL

```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nluat134@gmail.com","password":"admin123"}'

# Get users (cần token)
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer <token>"
```

## Test với Postman

1. Import collection từ file (nếu có)
2. Set base URL: `http://localhost:5000/api`
3. Test từng endpoint
4. Lưu token từ login response để dùng cho các request khác




