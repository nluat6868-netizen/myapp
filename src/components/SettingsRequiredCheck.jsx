import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  CircularProgress,
} from '@mui/material'
import { Save as SaveIcon } from '@mui/icons-material'
import Toast from './Toast'

const REQUIRED_FIELDS = ['shopName', 'phone', 'address', 'industry', 'businessPurpose']

function SettingsRequiredCheck({ children }) {
  const dispatch = useDispatch()
  const { settings, loading } = useSelector((state) => state.settings || {})
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    shopName: '',
    phone: '',
    address: '',
    industry: '',
    businessPurpose: '',
  })
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' })
  const [saving, setSaving] = useState(false)

  // Load settings
  useEffect(() => {
    dispatch({ type: 'GET_SETTINGS_REQUEST' })
  }, [dispatch])

  // Check if settings are complete and show dialog if needed
  useEffect(() => {
    if (!loading && settings) {
      const missingFields = REQUIRED_FIELDS.filter((field) => !settings[field] || settings[field].trim() === '')
      
      if (missingFields.length > 0) {
        // Set form data with existing values
        setFormData((prev) => ({
          shopName: settings.shopName || prev.shopName || '',
          phone: settings.phone || prev.phone || '',
          address: settings.address || prev.address || '',
          industry: settings.industry || prev.industry || '',
          businessPurpose: settings.businessPurpose || prev.businessPurpose || '',
        }))
        setOpen(true)
      } else {
        setOpen(false)
      }
    }
  }, [settings, loading])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.shopName || formData.shopName.trim() === '') {
      newErrors.shopName = 'Vui lòng nhập tên shop'
    }
    
    if (!formData.phone || formData.phone.trim() === '') {
      newErrors.phone = 'Vui lòng nhập số điện thoại'
    }
    
    if (!formData.address || formData.address.trim() === '') {
      newErrors.address = 'Vui lòng nhập địa chỉ'
    }
    
    if (!formData.industry || formData.industry.trim() === '') {
      newErrors.industry = 'Vui lòng chọn lĩnh vực kinh doanh'
    }
    
    if (!formData.businessPurpose || formData.businessPurpose.trim() === '') {
      newErrors.businessPurpose = 'Vui lòng chọn mục đích sử dụng'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) {
      setToast({
        open: true,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc',
        severity: 'error',
      })
      return
    }

    setSaving(true)
    // Merge with existing settings to preserve other fields
    const updateData = {
      ...settings,
      ...formData,
    }
    dispatch({
      type: 'UPDATE_SETTINGS_REQUEST',
      payload: updateData,
    })
  }

  // Handle update success/error
  const settingsError = useSelector((state) => state.settings?.error)
  const wasSaving = saving

  useEffect(() => {
    if (wasSaving && !loading) {
      if (settingsError) {
        setToast({
          open: true,
          message: settingsError || 'Có lỗi xảy ra khi lưu thông tin',
          severity: 'error',
        })
        setSaving(false)
      } else if (settings) {
        const missingFields = REQUIRED_FIELDS.filter((field) => !settings[field] || settings[field].trim() === '')
        if (missingFields.length === 0) {
          setToast({
            open: true,
            message: 'Đã lưu thông tin shop thành công',
            severity: 'success',
          })
          setSaving(false)
        }
      }
    }
  }, [settings, loading, settingsError, wasSaving])

  // Show loading while checking
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <>
      {children}
      
      <Dialog
        open={open}
        onClose={() => {}} // Prevent closing
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight={600}>
            Thiết lập thông tin shop
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Vui lòng điền đầy đủ thông tin bắt buộc để tiếp tục sử dụng hệ thống
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Các trường có dấu * là bắt buộc
          </Alert>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Tên shop *"
              name="shopName"
              value={formData.shopName}
              onChange={handleChange}
              error={!!errors.shopName}
              helperText={errors.shopName}
              fullWidth
              required
            />

            <TextField
              label="Số điện thoại *"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={!!errors.phone}
              helperText={errors.phone}
              fullWidth
              required
            />

            <TextField
              label="Địa chỉ *"
              name="address"
              value={formData.address}
              onChange={handleChange}
              error={!!errors.address}
              helperText={errors.address}
              fullWidth
              multiline
              rows={3}
              required
            />

            <FormControl fullWidth error={!!errors.industry} required>
              <InputLabel>Lĩnh vực kinh doanh *</InputLabel>
              <Select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                label="Lĩnh vực kinh doanh *"
              >
                <MenuItem value="Thời trang">Thời trang</MenuItem>
                <MenuItem value="Điện tử">Điện tử</MenuItem>
                <MenuItem value="Thực phẩm">Thực phẩm</MenuItem>
                <MenuItem value="Mỹ phẩm">Mỹ phẩm</MenuItem>
                <MenuItem value="Nội thất">Nội thất</MenuItem>
                <MenuItem value="Sách">Sách</MenuItem>
                <MenuItem value="Đồ chơi">Đồ chơi</MenuItem>
                <MenuItem value="Thể thao">Thể thao</MenuItem>
                <MenuItem value="Y tế">Y tế</MenuItem>
                <MenuItem value="Giáo dục">Giáo dục</MenuItem>
                <MenuItem value="Du lịch">Du lịch</MenuItem>
                <MenuItem value="Nhà hàng">Nhà hàng</MenuItem>
                <MenuItem value="Khách sạn">Khách sạn</MenuItem>
                <MenuItem value="BDS">BDS</MenuItem>
                <MenuItem value="Khác">Khác</MenuItem>
              </Select>
              {errors.industry && <FormHelperText>{errors.industry}</FormHelperText>}
            </FormControl>

            <FormControl fullWidth error={!!errors.businessPurpose} required>
              <InputLabel>Mục đích sử dụng *</InputLabel>
              <Select
                name="businessPurpose"
                value={formData.businessPurpose}
                onChange={handleChange}
                label="Mục đích sử dụng *"
              >
                <MenuItem value="Bán hàng">Bán hàng</MenuItem>
                <MenuItem value="Tra cứu thông tin">Tra cứu thông tin</MenuItem>
                <MenuItem value="Đặt lịch">Đặt lịch</MenuItem>
              </Select>
              {errors.businessPurpose && <FormHelperText>{errors.businessPurpose}</FormHelperText>}
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 2 }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            sx={{ minWidth: 120 }}
          >
            {saving ? 'Đang lưu...' : 'Lưu và tiếp tục'}
          </Button>
        </DialogActions>
      </Dialog>

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </>
  )
}

export default SettingsRequiredCheck

