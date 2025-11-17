# Deployment Guide

## Backend Deployment

Backend đã được deploy tại: **https://myapp-oou3.vercel.app/**

### API Endpoints
- Base URL: `https://myapp-oou3.vercel.app/api`
- Swagger Docs: `https://myapp-oou3.vercel.app/api-docs`

### Environment Variables cần thiết cho Backend:
- `PORT`: Port cho server (Vercel tự động set)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key cho JWT
- `FRONTEND_URL`: URL của frontend (ví dụ: https://myapp-nluat6868-netizens-projects.vercel.app)

## Frontend Deployment

### Cấu hình Environment Variables trên Vercel:

1. Vào Vercel Dashboard → Project Settings → Environment Variables
2. Thêm biến môi trường:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://myapp-oou3.vercel.app/api`
   - **Environment**: Production, Preview, Development

3. Sau khi thêm, cần **Redeploy** để áp dụng thay đổi

### Hoặc tạo file `.env.production`:
```env
VITE_API_URL=https://myapp-oou3.vercel.app/api
```

## Kiểm tra kết nối

Sau khi cấu hình, frontend sẽ tự động kết nối với backend production.

### Test API:
```bash
curl https://myapp-oou3.vercel.app/api/auth/me
```

## Troubleshooting

### Frontend không kết nối được với backend:
1. Kiểm tra `VITE_API_URL` đã được set đúng chưa
2. Kiểm tra CORS settings trên backend
3. Kiểm tra network tab trong browser console

### Backend lỗi:
1. Kiểm tra MongoDB connection string
2. Kiểm tra JWT_SECRET đã được set
3. Xem logs trên Vercel Dashboard

