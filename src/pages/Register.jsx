import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  InputAdornment,
  IconButton,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  PersonAdd,
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import Toast from '../components/Toast'

function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false,
  })
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Họ tên không được để trống'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu không được để trống'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    // Register user - role will be set to 'admin' by default on backend
    const newUser = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
    }

    register(newUser)

    setToast({
      open: true,
      message: 'Đăng ký thành công! Đang chuyển đến trang đăng nhập...',
      severity: 'success',
    })

    setTimeout(() => {
      navigate('/login')
    }, 2000)
  }

  const handleCloseToast = () => {
    setToast({ ...toast, open: false })
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[900],
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={3}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
                Đăng ký
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tạo tài khoản mới để bắt đầu sử dụng
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Họ và tên"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={!!errors.name}
                helperText={errors.name}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />

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
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Mật khẩu"
                name="password"
                type={showPasswords.password ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                error={!!errors.password}
                helperText={errors.password}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('password')}
                        edge="end"
                        aria-label="toggle password visibility"
                      >
                        {showPasswords.password ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Xác nhận mật khẩu"
                name="confirmPassword"
                type={showPasswords.confirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('confirmPassword')}
                        edge="end"
                        aria-label="toggle password visibility"
                      >
                        {showPasswords.confirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                startIcon={<PersonAdd />}
                sx={{ mb: 2 }}
              >
                Đăng ký
              </Button>

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Đã có tài khoản?{' '}
                  <Link
                    to="/login"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <Typography
                      component="span"
                      variant="body2"
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    >
                      Đăng nhập ngay
                    </Typography>
                  </Link>
                </Typography>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={handleCloseToast}
      />
    </Box>
  )
}

export default Register

