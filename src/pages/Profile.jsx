import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  PhotoCamera,
  Visibility,
  VisibilityOff,
  Save,
  Cancel,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Toast from '../components/Toast'
import { resizeImage } from '../utils/imageResize'

function Profile() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useAuth()
  const userState = useSelector((state) => state.users)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar: null,
    phone: '',
    address: '',
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' })

  // Load user data from API
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        avatar: user.avatar || null,
        phone: user.phone || '',
        address: user.address || '',
      })
      setAvatarPreview(user.avatar || null)
    }
  }, [user])

  const authState = useSelector((state) => state.auth)

  // Handle update success/error
  useEffect(() => {
    if (!userState.loading && userState.error) {
      setToast({
        open: true,
        message: userState.error,
        severity: 'error',
      })
      setLoading(false)
    } else if (!userState.loading && !userState.error && authState.user) {
      // Check if current user was updated
      if (authState.user._id === user?._id) {
        // Update form data and avatar preview with new user data
        const updatedUser = authState.user
        setFormData({
          name: updatedUser.name || '',
          email: updatedUser.email || '',
          avatar: updatedUser.avatar || null,
          phone: updatedUser.phone || '',
          address: updatedUser.address || '',
        })
        setAvatarPreview(updatedUser.avatar || null)
        setToast({
          open: true,
          message: 'Cập nhật thông tin thành công!',
          severity: 'success',
        })
        // Clear password fields
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
        setAvatarFile(null)
        setLoading(false)
      }
    }
  }, [userState.loading, userState.error, authState.user, user?._id])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setToast({
          open: true,
          message: 'Vui lòng chọn file ảnh',
          severity: 'error',
        })
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setToast({
          open: true,
          message: 'Kích thước ảnh không được vượt quá 5MB',
          severity: 'error',
        })
        return
      }
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
        setAvatarFile(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Họ tên không được để trống'
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }

    // Validate phone
    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ'
    }

    // Validate password if user wants to change
    if (passwordData.newPassword || passwordData.confirmPassword || passwordData.currentPassword) {
      if (!passwordData.currentPassword) {
        newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại'
      }
      if (!passwordData.newPassword) {
        newErrors.newPassword = 'Vui lòng nhập mật khẩu mới'
      } else if (passwordData.newPassword.length < 6) {
        newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự'
      }
      if (!passwordData.confirmPassword) {
        newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu'
      } else if (passwordData.newPassword !== passwordData.confirmPassword) {
        newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      let avatarUrl = formData.avatar

      // Upload avatar if new file is selected
      if (avatarFile) {
        try {
          // Resize avatar image to reduce file size (max 800x800, quality 0.8)
          avatarUrl = await resizeImage(avatarFile, 800, 800, 0.8)
        } catch (error) {
          console.error('Error resizing avatar:', error)
          // Fallback to original if resize fails
          const reader = new FileReader()
          avatarUrl = await new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result)
            reader.onerror = reject
            reader.readAsDataURL(avatarFile)
          })
        }
      }

      // Prepare user data
      const userData = {
        name: formData.name,
        email: formData.email,
        avatar: avatarUrl,
        phone: formData.phone,
        address: formData.address,
      }

      // Update password if provided
      if (passwordData.newPassword) {
        userData.password = passwordData.newPassword
        userData.currentPassword = passwordData.currentPassword
      }

      // Update user via API
      dispatch({
        type: 'UPDATE_USER_REQUEST',
        payload: {
          id: user._id,
          userData,
        },
      })

      // Don't set toast here - let useEffect handle it after successful update
    } catch (error) {
      setToast({
        open: true,
        message: error.message || 'Có lỗi xảy ra khi cập nhật thông tin',
        severity: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/')
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  return (
    <Container maxWidth="md" sx={{ py: 4, flex: 1 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Thông tin cá nhân
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý thông tin tài khoản và cài đặt bảo mật của bạn
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          {/* Avatar Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                <Avatar
                  src={avatarPreview || user?.avatar}
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: 'primary.main',
                    fontSize: '3rem',
                    mb: 2,
                  }}
                >
                  {!avatarPreview && !user?.avatar && formData.name?.charAt(0)?.toUpperCase()}
                </Avatar>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="avatar-upload"
                  type="file"
                  onChange={handleAvatarChange}
                />
                <label htmlFor="avatar-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCamera />}
                    sx={{ mb: 1 }}
                  >
                    Thay đổi ảnh đại diện
                  </Button>
                </label>
                {errors.avatar && (
                  <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                    {errors.avatar}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  JPG, PNG hoặc GIF. Tối đa 5MB
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
                Thông tin cá nhân
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Họ và tên"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={!!errors.name}
                    helperText={errors.name}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Số điện thoại"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    error={!!errors.phone}
                    helperText={errors.phone}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Địa chỉ"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
                Đổi mật khẩu
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Để trống nếu không muốn thay đổi mật khẩu
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mật khẩu hiện tại"
                    name="currentPassword"
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    error={!!errors.currentPassword}
                    helperText={errors.currentPassword}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => togglePasswordVisibility('current')}
                            edge="end"
                          >
                            {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mật khẩu mới"
                    name="newPassword"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    error={!!errors.newPassword}
                    helperText={errors.newPassword}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => togglePasswordVisibility('new')}
                            edge="end"
                          >
                            {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Xác nhận mật khẩu mới"
                    name="confirmPassword"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => togglePasswordVisibility('confirm')}
                            edge="end"
                          >
                            {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={handleCancel}
              size="large"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              size="large"
            >
              Lưu thay đổi
            </Button>
          </Box>
        </form>

        <Toast
          open={toast.open}
          message={toast.message}
          severity={toast.severity}
          onClose={() => setToast({ ...toast, open: false })}
        />
      </Container>
  )
}

export default Profile

