# Hướng dẫn setup Environment Variables

## Backend (server/.env)

File `.env` đã được tạo trong thư mục `server/` với nội dung:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/myapp
JWT_SECRET=myapp-secret-key-change-this-in-production-2024
JWT_EXPIRE=7d
NODE_ENV=development
```

## Frontend (.env)

**QUAN TRỌNG:** Vite sử dụng `VITE_` prefix thay vì `REACT_APP_`!

Tạo file `.env` trong thư mục root với nội dung:

```
VITE_API_URL=http://localhost:5000/api
```

### Lưu ý:
- Vite sử dụng `import.meta.env.VITE_API_URL` thay vì `process.env.REACT_APP_API_URL`
- Tất cả biến môi trường phải có prefix `VITE_` để được expose ra client
- Sau khi tạo/sửa file `.env`, cần **restart dev server** để áp dụng thay đổi

## Cách tạo file .env cho frontend:

1. **Copy từ template:**
   ```bash
   copy env.example .env
   ```

2. **Hoặc tạo thủ công:**
   Tạo file `.env` trong root với nội dung:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Restart dev server:**
   ```bash
   # Dừng server (Ctrl+C)
   npm run dev
   ```




