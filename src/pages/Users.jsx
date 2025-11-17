import { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
  Checkbox,
  FormControlLabel,
  useTheme,
  useMediaQuery,
  Divider,
  Alert,
  InputAdornment,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Refresh as RefreshIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import Toast from '../components/Toast'

// Available permissions
const availablePermissions = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'faqs', label: 'FAQs' },
  { id: 'tone-ai', label: 'Tone AI' },
  { id: 'products', label: 'Sản phẩm' },
  { id: 'promotions', label: 'Khuyến mãi' },
  { id: 'shipping', label: 'Vận chuyển' },
  { id: 'orders', label: 'Đơn hàng' },
  { id: 'templates', label: 'Template' },
  { id: 'settings', label: 'Cài đặt' },
  { id: 'users', label: 'Quản lý người dùng' },
]

const roles = [
  { value: 'admin', label: 'Quản trị viên' },
  { value: 'user', label: 'Người dùng' },
]

function Users() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const dispatch = useDispatch()
  const { user: currentUser, hasPermission } = useAuth()
  const usersState = useSelector((state) => state.users)
  const users = usersState.users || []
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin', // Default to admin
    permissions: [],
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' })

  // Generate random password
  const generateRandomPassword = () => {
    const length = 12
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    return password
  }

  // Check if current user has permission to manage users
  const canManageUsers = hasPermission('users') || currentUser?.role === 'admin'

  // Load users from API
  useEffect(() => {
    if (!canManageUsers) {
      setToast({
        open: true,
        message: 'Bạn không có quyền truy cập trang này!',
        severity: 'error',
      })
      return
    }
    dispatch({ type: 'GET_USERS_REQUEST' })
  }, [canManageUsers, dispatch])

  // Handle error from Redux
  useEffect(() => {
    if (usersState.error) {
      setToast({ open: true, message: usersState.error, severity: 'error' })
    }
  }, [usersState.error])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handlePermissionChange = (permissionId, checked) => {
    setFormData((prev) => {
      const newPermissions = checked
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter((p) => p !== permissionId)
      return {
        ...prev,
        permissions: newPermissions,
      }
    })
  }

  const handleSelectAllPermissions = (checked) => {
    setFormData((prev) => ({
      ...prev,
      permissions: checked ? availablePermissions.map((p) => p.id) : [],
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Tên người dùng không được để trống'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }
    // Password validation only when editing and password is provided
    if (editingId && formData.password && formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingId(user._id || user.id)
      setFormData({
        name: user.name,
        email: user.email,
        password: '', // Don't show existing password
        role: user.role || 'admin', // Default to admin
        permissions: user.permissions || [],
      })
    } else {
      // Generate random password for new user
      const randomPassword = generateRandomPassword()
      setEditingId(null)
      setFormData({
        name: '',
        email: '',
        password: randomPassword,
        role: 'admin', // Default to admin for new users
        permissions: [],
      })
    }
    setShowPassword(true) // Show password by default for new users
    setErrors({})
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingId(null)
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'admin', // Default to admin
      permissions: [],
    })
    setShowPassword(false)
    setErrors({})
  }

  const handleSave = () => {
    if (!validateForm()) return

    const userData = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      permissions: formData.permissions,
    }

    if (editingId) {
      // Update existing user
      if (formData.password.trim()) {
        userData.password = formData.password
      }
      dispatch({ type: 'UPDATE_USER_REQUEST', payload: { id: editingId, userData } })
      setToast({
        open: true,
        message: formData.password.trim() 
          ? 'Cập nhật người dùng và mật khẩu thành công!' 
          : 'Cập nhật người dùng thành công!',
        severity: 'success',
      })
    } else {
      // Create new user with password
      userData.password = formData.password
      dispatch({ type: 'CREATE_USER_REQUEST', payload: userData })
      setToast({
        open: true,
        message: `Thêm người dùng thành công! Mật khẩu: ${formData.password}`,
        severity: 'success',
      })
    }

    handleCloseDialog()
    setTimeout(() => setToast((prev) => ({ ...prev, open: false })), 3000)
  }

  const handleDelete = (id) => {
    // Prevent deleting current user
    const userId = id._id || id.id || id
    const currentUserId = currentUser?._id || currentUser?.id
    if (userId === currentUserId) {
      setToast({
        open: true,
        message: 'Không thể xóa tài khoản của chính bạn!',
        severity: 'error',
      })
      return
    }

    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      dispatch({ type: 'DELETE_USER_REQUEST', payload: userId })
      setToast({
        open: true,
        message: 'Xóa người dùng thành công!',
        severity: 'success',
      })
      setTimeout(() => setToast((prev) => ({ ...prev, open: false })), 3000)
    }
  }

  // Get all admin users
  const adminUsers = useMemo(() => {
    return users.filter((u) => u.role === 'admin')
  }, [users])

  // Filter out current user from list if not admin
  const displayUsers = useMemo(() => {
    return users.filter((u) => {
      // Always show current user
      if (u.id === currentUser?.id) return true
      // Admin can see all users
      if (currentUser?.role === 'admin') return true
      // Others can only see themselves
      return false
    })
  }, [users, currentUser])

  if (!canManageUsers) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error" sx={{ mt: 4 }}>
          Bạn không có quyền truy cập trang này!
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: { xs: 2, md: 4 } }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          fontWeight={600}
          sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}
        >
          Người dùng
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          Quản lý người dùng và phân quyền truy cập
        </Typography>
      </Box>

      {/* Current Admin Info */}
      {currentUser?.role === 'admin' && (
        <Card sx={{ mb: { xs: 2, md: 3 }, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <AdminPanelSettingsIcon sx={{ fontSize: { xs: 32, sm: 40 } }} />
                <Box>
                  <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    Tài khoản Admin hiện tại
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Bạn đang đăng nhập với quyền Quản trị viên
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ ml: 'auto', textAlign: { xs: 'left', sm: 'right' } }}>
                <Typography variant="body1" fontWeight={600} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  {currentUser.name}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  {currentUser.email}
                </Typography>
                <Chip
                  label="Quản trị viên"
                  size="small"
                  sx={{
                    mt: 1,
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                  icon={<AdminPanelSettingsIcon sx={{ color: 'white !important' }} />}
                />
              </Box>
            </Box>
            <Divider sx={{ my: 2, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.9, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                Quyền truy cập: Tất cả quyền (Admin có quyền truy cập tất cả các module)
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* All Admin Users */}
      {adminUsers.length > 0 && (
        <Card sx={{ mb: { xs: 2, md: 3 }, border: '2px solid', borderColor: 'error.main' }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AdminPanelSettingsIcon color="error" />
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Danh sách Quản trị viên ({adminUsers.length})
              </Typography>
            </Box>
            <Grid container spacing={2}>
              {adminUsers.map((admin) => (
                <Grid item xs={12} sm={6} md={4} key={admin._id || admin.id}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: admin.id === currentUser?.id ? 'error.light' : 'grey.100',
                      border: admin.id === currentUser?.id ? '2px solid' : '1px solid',
                      borderColor: admin.id === currentUser?.id ? 'error.main' : 'grey.300',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AdminPanelSettingsIcon
                        color={admin.id === currentUser?.id ? 'error' : 'action'}
                        fontSize="small"
                      />
                      <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {admin.name}
                        {admin.id === currentUser?.id && (
                          <Chip label="Bạn" size="small" color="primary" sx={{ ml: 1 }} />
                        )}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      {admin.email}
                    </Typography>
                    {admin.createdAt && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                        Tạo: {new Date(admin.createdAt).toLocaleDateString('vi-VN')}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      <Box sx={{ mb: { xs: 2, md: 3 }, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<PersonIcon />}
          onClick={() => handleOpenDialog()}
          fullWidth={isMobile}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Thêm người dùng
        </Button>
      </Box>

      {displayUsers.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Chưa có người dùng nào. Hãy thêm người dùng mới!
            </Typography>
          </CardContent>
        </Card>
      ) : isMobile ? (
        // Mobile Card View
        <Grid container spacing={2}>
          {displayUsers.map((userItem) => (
            <Grid item xs={12} key={userItem._id || userItem.id}>
              <Card>
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                          {userItem.name}
                        </Typography>
                        {userItem.role === 'admin' && (
                          <Chip
                            label="Admin"
                            size="small"
                            color="error"
                            icon={<AdminPanelSettingsIcon />}
                          />
                        )}
                        {userItem.id === currentUser?.id && (
                          <Chip label="Bạn" size="small" color="primary" />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {userItem.email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleOpenDialog(userItem)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      {userItem.id !== currentUser?.id && (
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDelete(userItem.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                  <Divider sx={{ my: 1.5 }} />
                  <Grid container spacing={1.5}>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        Vai trò
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {userItem.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        Quyền truy cập
                      </Typography>
                      <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {userItem.role === 'admin' ? (
                          <Chip label="Tất cả quyền" size="small" color="success" />
                        ) : userItem.permissions?.length > 0 ? (
                          userItem.permissions.map((permId) => {
                            const perm = availablePermissions.find((p) => p.id === permId)
                            return perm ? (
                              <Chip key={permId} label={perm.label} size="small" />
                            ) : null
                          })
                        ) : (
                          <Chip label="Không có quyền" size="small" />
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        // Desktop Table View
        <Card>
          <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 600 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Tên</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Vai trò</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Quyền truy cập</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: '120px', fontSize: { xs: '0.875rem', sm: '1rem' } }} align="center">
                      Hành động
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayUsers.map((userItem) => (
                    <TableRow key={userItem._id || userItem.id} hover>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {userItem.name}
                          {userItem.id === currentUser?.id && (
                            <Chip label="Bạn" size="small" color="primary" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{userItem.email}</TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        <Chip
                          label={userItem.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                          size="small"
                          color={userItem.role === 'admin' ? 'error' : 'default'}
                          icon={userItem.role === 'admin' ? <AdminPanelSettingsIcon /> : <PersonIcon />}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {userItem.role === 'admin' ? (
                          <Chip label="Tất cả quyền" size="small" color="success" />
                        ) : userItem.permissions?.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {userItem.permissions.slice(0, 3).map((permId) => {
                              const perm = availablePermissions.find((p) => p.id === permId)
                              return perm ? (
                                <Chip key={permId} label={perm.label} size="small" />
                              ) : null
                            })}
                            {userItem.permissions.length > 3 && (
                              <Chip label={`+${userItem.permissions.length - 3}`} size="small" />
                            )}
                          </Box>
                        ) : (
                          <Chip label="Không có quyền" size="small" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleOpenDialog(userItem)}
                        >
                          <EditIcon />
                        </IconButton>
                        {userItem.id !== currentUser?.id && (
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDelete(userItem.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth fullScreen={isMobile}>
        <DialogTitle>
          {editingId ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Tên người dùng"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={!!errors.name}
              helperText={errors.name}
              required
              sx={{ mb: 3 }}
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
              disabled={!!editingId}
              sx={{ mb: 3 }}
            />

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label={editingId ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu (tự động tạo)'}
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                error={!!errors.password}
                helperText={errors.password || (editingId ? 'Để trống nếu không muốn đổi mật khẩu' : 'Mật khẩu đã được tạo tự động, có thể copy hoặc tạo lại')}
                required={!editingId}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      {!editingId && (
                        <IconButton
                          onClick={() => {
                            const newPassword = generateRandomPassword()
                            setFormData((prev) => ({ ...prev, password: newPassword }))
                          }}
                          edge="end"
                          aria-label="generate new password"
                          sx={{ mr: 0.5 }}
                        >
                          <RefreshIcon />
                        </IconButton>
                      )}
                      <IconButton
                        onClick={() => {
                          navigator.clipboard.writeText(formData.password)
                          setToast({
                            open: true,
                            message: 'Đã copy mật khẩu!',
                            severity: 'success',
                          })
                          setTimeout(() => setToast((prev) => ({ ...prev, open: false })), 2000)
                        }}
                        edge="end"
                        aria-label="copy password"
                        sx={{ mr: 0.5 }}
                        disabled={!formData.password}
                      >
                        <ContentCopyIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        aria-label="toggle password visibility"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {!editingId && formData.password && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    <strong>Mật khẩu đã tạo:</strong> {formData.password}
                    <br />
                    <small>Vui lòng lưu lại mật khẩu này để cung cấp cho người dùng!</small>
                  </Typography>
                </Alert>
              )}
            </Box>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Vai trò</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    role: e.target.value,
                    // If admin, give all permissions
                    permissions: e.target.value === 'admin' ? availablePermissions.map((p) => p.id) : prev.permissions,
                  }))
                }}
                label="Vai trò"
              >
                {roles.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Quản trị viên có tất cả quyền truy cập
              </FormHelperText>
            </FormControl>

            {formData.role !== 'admin' && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Phân quyền truy cập
                  </Typography>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.permissions.length === availablePermissions.length}
                        indeterminate={
                          formData.permissions.length > 0 &&
                          formData.permissions.length < availablePermissions.length
                        }
                        onChange={(e) => handleSelectAllPermissions(e.target.checked)}
                      />
                    }
                    label="Chọn tất cả"
                  />
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={1}>
                  {availablePermissions.map((permission) => (
                    <Grid item xs={12} sm={6} key={permission.id}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.permissions.includes(permission.id)}
                            onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                          />
                        }
                        label={permission.label}
                      />
                    </Grid>
                  ))}
                </Grid>
                {formData.permissions.length === 0 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Người dùng này sẽ không có quyền truy cập bất kỳ mục nào
                  </Alert>
                )}
              </Box>
            )}

            {formData.role === 'admin' && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Quản trị viên có tất cả quyền truy cập, không cần phân quyền riêng
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
            Hủy
          </Button>
          <Button onClick={handleSave} variant="contained" startIcon={<SaveIcon />}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </Container>
  )
}

export default Users

