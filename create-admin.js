// Script to create admin user
// Run this in browser console (F12 -> Console tab)
// Copy and paste this entire code block

const adminUser = {
  id: `admin-${Date.now()}`,
  name: 'anhluat165',
  email: 'nluat134@gmail.com',
  password: 'admin165', // Mật khẩu mặc định - nên đổi sau khi đăng nhập
  avatar: null,
  role: 'admin',
  permissions: [], // Admin có tất cả quyền, nên mảng rỗng là đủ
  createdAt: new Date().toISOString(),
}

// Lấy danh sách users hiện có
const existingUsers = JSON.parse(localStorage.getItem('users') || '[]')

// Kiểm tra xem user đã tồn tại chưa
const existingUserIndex = existingUsers.findIndex((u) => u.email === adminUser.email)

if (existingUserIndex !== -1) {
  // Cập nhật user hiện có thành admin (giữ nguyên mật khẩu nếu có, nếu không thì set mặc định)
  existingUsers[existingUserIndex] = {
    ...existingUsers[existingUserIndex],
    role: 'admin',
    name: adminUser.name,
    password: existingUsers[existingUserIndex].password || adminUser.password, // Giữ mật khẩu cũ hoặc set mới
    permissions: [],
  }
  console.log('✅ Đã cập nhật user thành admin:', existingUsers[existingUserIndex])
  console.log('📧 Email:', existingUsers[existingUserIndex].email)
  console.log('🔑 Mật khẩu:', existingUsers[existingUserIndex].password)
} else {
  // Thêm admin user mới
  existingUsers.push(adminUser)
  console.log('✅ Đã tạo admin user mới:', adminUser)
  console.log('📧 Email:', adminUser.email)
  console.log('🔑 Mật khẩu:', adminUser.password)
}

// Lưu vào localStorage
localStorage.setItem('users', JSON.stringify(existingUsers))

console.log('✅ Hoàn tất! Tài khoản admin đã được tạo/cập nhật!')
console.log('📧 Email đăng nhập:', adminUser.email)
console.log('🔑 Mật khẩu:', adminUser.password)
console.log('👤 Role:', adminUser.role)

