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
  Alert,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Switch,
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
  Image as ImageIcon,
  Today as TodayIcon,
  CalendarToday as CalendarTodayIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelStatusIcon,
  TrendingUp as TrendingUpIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material'
import Toast from '../components/Toast'

function Promotions() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const dispatch = useDispatch()
  const { promotions, loading, error } = useSelector((state) => state.promotions)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    order: '',
    campaignName: '',
    startDate: '',
    endDate: '',
    discountType: 'percentage', // 'percentage', 'fixed', 'freeship'
    discountPercentage: '',
    discountAmount: '',
    freeShip: false,
    description: '',
    voucherImage: null,
    quantity: '',
  })
  const [voucherPreview, setVoucherPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' })

  useEffect(() => {
    dispatch({ type: 'GET_PROMOTIONS_REQUEST' })
  }, [dispatch])

  useEffect(() => {
    if (error) {
      setToast({
        open: true,
        message: error,
        severity: 'error',
      })
    }
  }, [error])

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target

    if (type === 'file' && files && files[0]) {
      const file = files[0]
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({
          ...prev,
          voucherImage: 'Vui lòng chọn file ảnh',
        }))
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          voucherImage: 'Kích thước ảnh không được vượt quá 5MB',
        }))
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setVoucherPreview(reader.result)
        setFormData((prev) => ({
          ...prev,
          voucherImage: file,
        }))
      }
      reader.readAsDataURL(file)
      if (errors.voucherImage) {
        setErrors((prev) => ({
          ...prev,
          voucherImage: '',
        }))
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }))
    }

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

    if (!formData.campaignName.trim()) {
      newErrors.campaignName = 'Tên chiến dịch không được để trống'
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Thời gian bắt đầu không được để trống'
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Thời gian kết thúc không được để trống'
    }

    if (formData.startDate && formData.endDate) {
      const startDateTime = new Date(formData.startDate)
      const endDateTime = new Date(formData.endDate)
      if (startDateTime >= endDateTime) {
        newErrors.endDate = 'Thời gian kết thúc phải sau thời gian bắt đầu'
      }
    }

    if (formData.discountType === 'percentage') {
      if (!formData.discountPercentage) {
        newErrors.discountPercentage = 'Vui lòng nhập phần trăm giảm giá'
      } else if (Number(formData.discountPercentage) < 0 || Number(formData.discountPercentage) > 100) {
        newErrors.discountPercentage = 'Phần trăm giảm giá phải từ 0 đến 100'
      }
    }

    if (formData.discountType === 'fixed') {
      if (!formData.discountAmount) {
        newErrors.discountAmount = 'Vui lòng nhập số tiền giảm giá'
      } else if (Number(formData.discountAmount) < 0) {
        newErrors.discountAmount = 'Số tiền giảm giá phải lớn hơn 0'
      }
    }

    if (formData.quantity && Number(formData.quantity) < 0) {
      newErrors.quantity = 'Số lượng phải lớn hơn hoặc bằng 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleOpenDialog = (promotion = null) => {
    if (promotion) {
      setEditingId(promotion._id || promotion.id)
      setFormData({
        order: promotion.order || '',
        campaignName: promotion.campaignName || '',
        startDate: promotion.startDate || '',
        endDate: promotion.endDate || '',
        discountType: promotion.discountType || 'percentage',
        discountPercentage: promotion.discountPercentage || '',
        discountAmount: promotion.discountAmount || '',
        freeShip: promotion.freeShip || false,
        description: promotion.description || '',
        voucherImage: null,
        quantity: promotion.quantity || '',
      })
      setVoucherPreview(promotion.voucherImage || null)
    } else {
      setEditingId(null)
      const nextOrder = promotions.length > 0
        ? Math.max(...promotions.map((p) => Number(p.order) || 0)) + 1
        : 1
      setFormData({
        order: String(nextOrder),
        campaignName: '',
        startDate: '',
        endDate: '',
        discountType: 'percentage',
        discountPercentage: '',
        discountAmount: '',
        freeShip: false,
        description: '',
        voucherImage: null,
        quantity: '',
      })
      setVoucherPreview(null)
    }
    setErrors({})
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingId(null)
    setFormData({
      order: '',
      campaignName: '',
      startDate: '',
      endDate: '',
      discountType: 'percentage',
      discountPercentage: '',
      discountAmount: '',
      freeShip: false,
      description: '',
      voucherImage: null,
      quantity: '',
    })
    setVoucherPreview(null)
    setErrors({})
  }

  const handleSave = () => {
    if (!validateForm()) return

    const promotionData = {
      order: Number(formData.order) || 0,
      campaignName: formData.campaignName,
      startDate: formData.startDate,
      endDate: formData.endDate,
      discountType: formData.discountType,
      discountPercentage: formData.discountPercentage ? Number(formData.discountPercentage) : null,
      discountAmount: formData.discountAmount ? Number(formData.discountAmount) : null,
      freeShip: formData.freeShip,
      description: formData.description,
      quantity: formData.quantity ? Number(formData.quantity) : null,
      voucherImage: voucherPreview,
    }

    if (editingId) {
      dispatch({
        type: 'UPDATE_PROMOTION_REQUEST',
        payload: {
          id: editingId,
          promotionData,
        },
      })
      setToast({
        open: true,
        message: 'Đang cập nhật khuyến mãi...',
        severity: 'info',
      })
    } else {
      dispatch({
        type: 'CREATE_PROMOTION_REQUEST',
        payload: promotionData,
      })
      setToast({
        open: true,
        message: 'Đang tạo khuyến mãi...',
        severity: 'info',
      })
    }

    handleCloseDialog()
  }

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?')) {
      dispatch({
        type: 'DELETE_PROMOTION_REQUEST',
        payload: id,
      })
      setToast({
        open: true,
        message: 'Đang xóa khuyến mãi...',
        severity: 'info',
      })
    }
  }

  const sortedPromotions = promotions ? [...promotions].sort((a, b) => {
    const orderA = Number(a.order) || 0
    const orderB = Number(b.order) || 0
    return orderA - orderB
  }) : []

  // Calculate statistics
  const statistics = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const todayPromotions = sortedPromotions.filter((promo) => {
      if (!promo.createdAt) return false
      const promoDate = new Date(promo.createdAt)
      promoDate.setHours(0, 0, 0, 0)
      return promoDate.getTime() === today.getTime()
    })

    const last7DaysPromotions = sortedPromotions.filter((promo) => {
      if (!promo.createdAt) return false
      const promoDate = new Date(promo.createdAt)
      return promoDate >= sevenDaysAgo
    })

    const now = new Date()
    const activePromotions = sortedPromotions.filter((promo) => {
      if (!promo.startDate || !promo.endDate) return false
      const startDate = new Date(promo.startDate)
      const endDate = new Date(promo.endDate)
      return now >= startDate && now <= endDate
    })

    const inactivePromotions = sortedPromotions.filter((promo) => {
      if (!promo.startDate || !promo.endDate) return true
      const startDate = new Date(promo.startDate)
      const endDate = new Date(promo.endDate)
      return now < startDate || now > endDate
    })

    return {
      total: sortedPromotions.length,
      today: todayPromotions.length,
      last7Days: last7DaysPromotions.length,
      active: activePromotions.length,
      inactive: inactivePromotions.length,
    }
  }, [sortedPromotions])

  return (
    <Container maxWidth="xl" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Quản lý Khuyến mãi
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Quản lý các chiến dịch khuyến mãi và voucher
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: { xs: 2, md: 3 } }}>
        <Grid item xs={6} sm={4} md={2.4}>
          <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.9, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    Tổng khuyến mãi
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    {statistics.total}
                  </Typography>
                </Box>
                <FilterListIcon sx={{ fontSize: { xs: 28, sm: 32 }, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Card sx={{ bgcolor: 'info.main', color: 'info.contrastText' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.9, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    Khuyến mãi hôm nay
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    {statistics.today}
                  </Typography>
                </Box>
                <TodayIcon sx={{ fontSize: { xs: 28, sm: 32 }, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Card sx={{ bgcolor: 'warning.main', color: 'warning.contrastText' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.9, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    7 ngày qua
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    {statistics.last7Days}
                  </Typography>
                </Box>
                <CalendarTodayIcon sx={{ fontSize: { xs: 28, sm: 32 }, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Card sx={{ bgcolor: 'success.main', color: 'success.contrastText' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.9, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    Đang hoạt động
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    {statistics.active}
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: { xs: 28, sm: 32 }, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Card sx={{ bgcolor: 'error.main', color: 'error.contrastText' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.9, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    Ngừng hoạt động
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    {statistics.inactive}
                  </Typography>
                </Box>
                <CancelStatusIcon sx={{ fontSize: { xs: 28, sm: 32 }, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Thêm khuyến mãi
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Đang tải...
          </Typography>
        </Box>
      ) : sortedPromotions.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Chưa có khuyến mãi nào. Hãy thêm khuyến mãi mới!
            </Typography>
          </CardContent>
        </Card>
      ) : isMobile ? (
        // Mobile Card View
        <Grid container spacing={2}>
          {sortedPromotions.map((promo) => (
            <Grid item xs={12} key={promo._id || promo.id}>
              <Card>
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                        {promo.campaignName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        STT: {promo.order}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleOpenDialog(promo)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDelete(promo._id || promo.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 1.5 }} />
                  <Grid container spacing={1.5}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Thời gian bắt đầu
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {new Date(promo.startDate).toLocaleString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Thời gian kết thúc
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {new Date(promo.endDate).toLocaleString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Loại giảm giá
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {promo.discountType === 'percentage' && 'Giảm %'}
                        {promo.discountType === 'fixed' && 'Giảm đơn giá'}
                        {promo.discountType === 'freeship' && 'Freeship'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Giá trị
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {promo.discountType === 'percentage' && `${promo.discountPercentage}%`}
                        {promo.discountType === 'fixed' && `${Number(promo.discountAmount).toLocaleString('vi-VN')} đ`}
                        {promo.discountType === 'freeship' && 'Miễn phí vận chuyển'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Số lượng
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {promo.quantity || 'Không giới hạn'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Hình ảnh
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        {promo.voucherImage ? (
                          <Chip label="Có ảnh" size="small" color="success" />
                        ) : (
                          <Chip label="Không có" size="small" />
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
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>STT</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Tên chiến dịch</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Thời gian bắt đầu</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Thời gian kết thúc</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Loại giảm giá</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Giá trị</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Số lượng</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Hình ảnh</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: '120px', fontSize: { xs: '0.875rem', sm: '1rem' } }} align="center">
                      Hành động
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedPromotions.map((promo) => (
                    <TableRow key={promo._id || promo.id} hover>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{promo.order}</TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{promo.campaignName}</TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {new Date(promo.startDate).toLocaleString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {new Date(promo.endDate).toLocaleString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {promo.discountType === 'percentage' && 'Giảm %'}
                        {promo.discountType === 'fixed' && 'Giảm đơn giá'}
                        {promo.discountType === 'freeship' && 'Freeship'}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {promo.discountType === 'percentage' && `${promo.discountPercentage}%`}
                        {promo.discountType === 'fixed' && `${Number(promo.discountAmount).toLocaleString('vi-VN')} đ`}
                        {promo.discountType === 'freeship' && 'Miễn phí vận chuyển'}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{promo.quantity || 'Không giới hạn'}</TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {promo.voucherImage ? (
                          <Chip label="Có ảnh" size="small" color="success" />
                        ) : (
                          <Chip label="Không có" size="small" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleOpenDialog(promo)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDelete(promo._id || promo.id)}
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth fullScreen={isMobile}>
        <DialogTitle>
          {editingId ? 'Chỉnh sửa khuyến mãi' : 'Thêm khuyến mãi mới'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Số thứ tự"
                  name="order"
                  type="number"
                  value={formData.order}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Số lượng"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  error={!!errors.quantity}
                  helperText={errors.quantity || 'Để trống nếu không giới hạn'}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tên chiến dịch"
                  name="campaignName"
                  value={formData.campaignName}
                  onChange={handleInputChange}
                  error={!!errors.campaignName}
                  helperText={errors.campaignName}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Thời gian bắt đầu"
                  name="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  error={!!errors.startDate}
                  helperText={errors.startDate || 'Chọn ngày và giờ bắt đầu'}
                  required
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    step: 1, // Allow seconds selection
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Thời gian kết thúc"
                  name="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  error={!!errors.endDate}
                  helperText={errors.endDate || 'Chọn ngày và giờ kết thúc'}
                  required
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    step: 1, // Allow seconds selection
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Loại giảm giá</FormLabel>
                  <RadioGroup
                    row
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                  >
                    <FormControlLabel value="percentage" control={<Radio />} label="Giảm theo %" />
                    <FormControlLabel value="fixed" control={<Radio />} label="Giảm theo đơn giá" />
                    <FormControlLabel value="freeship" control={<Radio />} label="Freeship" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              {formData.discountType === 'percentage' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phần trăm giảm giá (%)"
                    name="discountPercentage"
                    type="number"
                    value={formData.discountPercentage}
                    onChange={handleInputChange}
                    error={!!errors.discountPercentage}
                    helperText={errors.discountPercentage}
                    inputProps={{ min: 0, max: 100 }}
                  />
                </Grid>
              )}
              {formData.discountType === 'fixed' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Số tiền giảm giá (đ)"
                    name="discountAmount"
                    type="number"
                    value={formData.discountAmount}
                    onChange={handleInputChange}
                    error={!!errors.discountAmount}
                    helperText={errors.discountAmount}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
              )}
              {formData.discountType === 'freeship' && (
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.freeShip}
                        onChange={handleInputChange}
                        name="freeShip"
                      />
                    }
                    label="Miễn phí vận chuyển"
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mô tả"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <Box>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="voucher-image-upload"
                    type="file"
                    onChange={handleInputChange}
                    name="voucherImage"
                  />
                  <label htmlFor="voucher-image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<ImageIcon />}
                      fullWidth
                    >
                      {voucherPreview ? 'Thay đổi hình ảnh voucher' : 'Tải lên hình ảnh voucher'}
                    </Button>
                  </label>
                  {voucherPreview && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <img
                        src={voucherPreview}
                        alt="Voucher preview"
                        style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }}
                      />
                    </Box>
                  )}
                  {errors.voucherImage && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                      {errors.voucherImage}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
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

export default Promotions

