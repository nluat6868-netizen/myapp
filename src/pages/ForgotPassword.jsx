import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  InputAdornment,
  Alert,
} from '@mui/material'
import {
  Email,
  Send,
  ArrowBack,
} from '@mui/icons-material'
import Toast from '../components/Toast'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' })
  const [emailSent, setEmailSent] = useState(false)

  const handleInputChange = (e) => {
    setEmail(e.target.value)
    setError('')
  }

  const validateEmail = () => {
    if (!email.trim()) {
      setError('Email không được để trống')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email không hợp lệ')
      return false
    }
    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateEmail()) return

    // Check if email exists
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const user = users.find((u) => u.email === email)

    if (!user) {
      setToast({
        open: true,
        message: 'Email này chưa được đăng ký trong hệ thống!',
        severity: 'error',
      })
      return
    }

    // In real app, this would send an email with reset link
    // For now, we'll just show a success message
    setEmailSent(true)
    setToast({
      open: true,
      message: `Email đặt lại mật khẩu đã được gửi đến ${email}. Vui lòng kiểm tra hộp thư của bạn.`,
      severity: 'success',
    })

    // Mock: Store reset token (in real app, this would be handled by backend)
    const resetToken = Math.random().toString(36).substring(2, 15)
    localStorage.setItem(`resetToken_${email}`, resetToken)
  }

  const handleCloseToast = () => {
    setToast({ ...toast, open: false })
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
                Quên mật khẩu
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nhập email của bạn để nhận link đặt lại mật khẩu
              </Typography>
            </Box>

            {emailSent ? (
              <Box>
                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    Chúng tôi đã gửi email đặt lại mật khẩu đến <strong>{email}</strong>.
                    Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn.
                  </Typography>
                </Alert>
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Link
                    to="/login"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <Button variant="outlined" startIcon={<ArrowBack />}>
                      Quay lại đăng nhập
                    </Button>
                  </Link>
                </Box>
              </Box>
            ) : (
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={handleInputChange}
                  error={!!error}
                  helperText={error}
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

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<Send />}
                  sx={{ mb: 2 }}
                >
                  Gửi email đặt lại mật khẩu
                </Button>

                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Link
                    to="/login"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <Typography
                      variant="body2"
                      color="primary"
                      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}
                    >
                      <ArrowBack sx={{ fontSize: 16 }} />
                      Quay lại đăng nhập
                    </Typography>
                  </Link>
                </Box>
              </form>
            )}
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

export default ForgotPassword



