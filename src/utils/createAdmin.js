// Utility function to create admin user
// This will be called automatically on app initialization

export const createAdminUser = () => {
  try {
    const adminUser = {
      id: `admin-${Date.now()}`,
      name: 'anhluat165',
      email: 'nluat134@gmail.com',
      password: 'admin123', // Default password - user should change this
      avatar: null,
      role: 'admin',
      permissions: [], // Admin has all permissions
      createdAt: new Date().toISOString(),
    }

    // Get existing users
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]')

    // Check if user already exists
    const existingUserIndex = existingUsers.findIndex((u) => u.email === adminUser.email)

    if (existingUserIndex !== -1) {
      // Update existing user to admin (preserve password if exists, otherwise set default)
      existingUsers[existingUserIndex] = {
        ...existingUsers[existingUserIndex],
        role: 'admin',
        name: adminUser.name,
        password: existingUsers[existingUserIndex].password || adminUser.password, // Keep existing password or set default
        permissions: [],
      }
      console.log('✅ Updated existing user to admin:', existingUsers[existingUserIndex].email)
      console.log('📧 Email:', existingUsers[existingUserIndex].email)
      console.log('🔑 Password:', existingUsers[existingUserIndex].password)
    } else {
      // Add new admin user
      existingUsers.push(adminUser)
      console.log('✅ Created new admin user:', adminUser.email)
      console.log('📧 Email:', adminUser.email)
      console.log('🔑 Password:', adminUser.password)
    }

    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(existingUsers))
    
    return true
  } catch (error) {
    console.error('Error creating admin user:', error)
    return false
  }
}

