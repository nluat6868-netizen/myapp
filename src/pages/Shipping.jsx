import { useState, useEffect } from 'react'
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
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material'
import Toast from '../components/Toast'

function Shipping() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [shippingMethods, setShippingMethods] = useState(
    JSON.parse(localStorage.getItem('shippingMethods') || '[]')
  )
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cost: '',
    estimatedDays: '',
    isActive: true,
  })
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' })

  useEffect(() => {
    localStorage.setItem('shippingMethods', JSON.stringify(shippingMethods))
  }, [shippingMethods])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
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
      newErrors.name = 'Tên phương thức vận chuyển không được để trống'
    }
    if (formData.cost && Number(formData.cost) < 0) {
      newErrors.cost = 'Chi phí phải lớn hơn hoặc bằng 0'
    }
    if (formData.estimatedDays && Number(formData.estimatedDays) < 0) {
      newErrors.estimatedDays = 'Số ngày ước tính phải lớn hơn hoặc bằng 0'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleOpenDialog = (method = null) => {
    if (method) {
      setEditingId(method.id)
      setFormData(method)
    } else {
      setEditingId(null)
      setFormData({
        name: '',
        description: '',
        cost: '',
        estimatedDays: '',
        isActive: true,
      })
    }
    setErrors({})
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingId(null)
    setFormData({
      name: '',
      description: '',
      cost: '',
      estimatedDays: '',
      isActive: true,
    })
    setErrors({})
  }

  const handleSave = () => {
    if (!validateForm()) return

    if (editingId) {
      setShippingMethods((prev) =>
        prev.map((method) =>
          method.id === editingId ? { ...method, ...formData } : method
        )
      )
      setToast({
        open: true,
        message: 'Cập nhật phương thức vận chuyển thành công!',
        severity: 'success',
      })
    } else {
      const newMethod = {
        id: `shipping-${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString(),
      }
      setShippingMethods((prev) => [...prev, newMethod])
      setToast({
        open: true,
        message: 'Thêm phương thức vận chuyển thành công!',
        severity: 'success',
      })
    }

    handleCloseDialog()
    setTimeout(() => setToast({ ...toast, open: false }), 3000)
  }

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phương thức vận chuyển này?')) {
      setShippingMethods((prev) => prev.filter((method) => method.id !== id))
      setToast({
        open: true,
        message: 'Xóa phương thức vận chuyển thành công!',
        severity: 'success',
      })
      setTimeout(() => setToast({ ...toast, open: false }), 3000)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Quản lý Vận chuyển
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Quản lý các phương thức vận chuyển
        </Typography>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Thêm phương thức vận chuyển
        </Button>
      </Box>

      {shippingMethods.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Chưa có phương thức vận chuyển nào. Hãy thêm phương thức mới!
            </Typography>
          </CardContent>
        </Card>
      ) : isMobile ? (
        // Mobile Card View
        <Grid container spacing={2}>
          {shippingMethods.map((method) => (
            <Grid item xs={12} key={method.id}>
              <Card>
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                        {method.name}
                      </Typography>
                      {method.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {method.description}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleOpenDialog(method)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDelete(method.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 1.5 }} />
                  <Grid container spacing={1.5}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Chi phí
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {method.cost
                          ? `${Number(method.cost).toLocaleString('vi-VN')} đ`
                          : 'Miễn phí'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Thời gian ước tính
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {method.estimatedDays ? `${method.estimatedDays} ngày` : '-'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        Trạng thái
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={method.isActive ? 'Hoạt động' : 'Tạm dừng'}
                          color={method.isActive ? 'success' : 'default'}
                          size="small"
                        />
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
                    <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Tên phương thức</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Mô tả</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Chi phí (đ)</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Thời gian ước tính</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Trạng thái</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: '120px', fontSize: { xs: '0.875rem', sm: '1rem' } }} align="center">
                      Hành động
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shippingMethods.map((method) => (
                    <TableRow key={method.id} hover>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{method.name}</TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{method.description || '-'}</TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {method.cost
                          ? `${Number(method.cost).toLocaleString('vi-VN')} đ`
                          : 'Miễn phí'}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {method.estimatedDays ? `${method.estimatedDays} ngày` : '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        <Chip
                          label={method.isActive ? 'Hoạt động' : 'Tạm dừng'}
                          color={method.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleOpenDialog(method)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDelete(method.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle>
          {editingId ? 'Chỉnh sửa phương thức vận chuyển' : 'Thêm phương thức vận chuyển mới'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Tên phương thức"
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
              label="Mô tả"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={3}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Chi phí (đ)"
              name="cost"
              type="number"
              value={formData.cost}
              onChange={handleInputChange}
              error={!!errors.cost}
              helperText={errors.cost || 'Để trống nếu miễn phí'}
              inputProps={{ min: 0 }}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Thời gian ước tính (ngày)"
              name="estimatedDays"
              type="number"
              value={formData.estimatedDays}
              onChange={handleInputChange}
              error={!!errors.estimatedDays}
              helperText={errors.estimatedDays}
              inputProps={{ min: 0 }}
              sx={{ mb: 3 }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                id="isActive-checkbox"
              />
              <label htmlFor="isActive-checkbox" style={{ marginLeft: 8 }}>
                <Typography variant="body2">Kích hoạt phương thức này</Typography>
              </label>
            </Box>
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

export default Shipping

