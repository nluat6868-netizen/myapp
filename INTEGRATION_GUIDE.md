# Hướng dẫn tích hợp Backend và Frontend

## Setup Backend

1. **Cài đặt dependencies:**
```bash
cd server
npm install
```

2. **Tạo file `.env`:**
```bash
cp .env.example .env
```

3. **Cập nhật `.env`:**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/myapp
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRE=7d
NODE_ENV=development
```

4. **Khởi động MongoDB** (đảm bảo MongoDB đang chạy)

5. **Chạy backend:**
```bash
npm run dev
```

Backend sẽ chạy tại: `http://localhost:5000`

## Setup Frontend

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

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Users (Admin only)
- `GET /api/users` - Lấy danh sách users
- `POST /api/users` - Tạo user mới
- `PUT /api/users/:id` - Cập nhật user
- `DELETE /api/users/:id` - Xóa user

### FAQs
- `GET /api/faqs` - Lấy danh sách FAQs
- `POST /api/faqs` - Tạo FAQ mới
- `PUT /api/faqs/:id` - Cập nhật FAQ
- `DELETE /api/faqs/:id` - Xóa FAQ

### Product Attributes
- `GET /api/product-attributes` - Lấy danh sách attributes
- `POST /api/product-attributes` - Tạo attribute mới
- `PUT /api/product-attributes/:id` - Cập nhật attribute
- `DELETE /api/product-attributes/:id` - Xóa attribute
- `PUT /api/product-attributes/order` - Cập nhật thứ tự

### Products
- `GET /api/products?page=1&limit=8` - Lấy danh sách products (có pagination)
- `POST /api/products` - Tạo product mới
- `PUT /api/products/:id` - Cập nhật product
- `DELETE /api/products/:id` - Xóa product

### Orders
- `GET /api/orders?page=1&limit=8&status=all&search=` - Lấy danh sách orders (có filter)
- `POST /api/orders` - Tạo order mới
- `PUT /api/orders/:id` - Cập nhật order
- `DELETE /api/orders/:id` - Xóa order
- `POST /api/orders/bulk-delete` - Xóa nhiều orders

### Templates
- `GET /api/templates` - Lấy danh sách templates
- `POST /api/templates` - Tạo template mới
- `PUT /api/templates/:id` - Cập nhật template
- `DELETE /api/templates/:id` - Xóa template

### Tones
- `GET /api/tones` - Lấy danh sách tones
- `POST /api/tones` - Tạo tone mới
- `PUT /api/tones/:id` - Cập nhật tone
- `DELETE /api/tones/:id` - Xóa tone

### Settings
- `GET /api/settings` - Lấy settings
- `PUT /api/settings` - Cập nhật settings

## Redux Store Structure

```javascript
{
  auth: {
    user: null,
    token: null,
    loading: false,
    error: null
  },
  users: {
    users: [],
    loading: false,
    error: null
  },
  faqs: {
    faqs: [],
    loading: false,
    error: null
  }
}
```

## Cách sử dụng Redux-Saga trong Components

```javascript
import { useDispatch, useSelector } from 'react-redux'

function MyComponent() {
  const dispatch = useDispatch()
  const { faqs, loading, error } = useSelector((state) => state.faqs)

  useEffect(() => {
    dispatch({ type: 'GET_FAQS_REQUEST' })
  }, [dispatch])

  const handleCreate = (data) => {
    dispatch({ type: 'CREATE_FAQ_REQUEST', payload: data })
  }

  return (
    // Your component JSX
  )
}
```

## Lưu ý

- Tất cả API routes (trừ auth) đều yêu cầu authentication token
- Token được tự động thêm vào header qua axios interceptor
- Khi token hết hạn (401), user sẽ tự động bị logout và redirect về login
- Backend sử dụng JWT để xác thực
- Passwords được hash bằng bcrypt




