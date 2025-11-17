import { useState, useEffect, useRef } from 'react'
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
  Divider,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Avatar,
  IconButton,
  Chip,
  CircularProgress,
} from '@mui/material'
import {
  Save as SaveIcon,
  Store as StoreIcon,
  LocationOn as LocationOnIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
  PhotoCamera as PhotoCameraIcon,
  Facebook as FacebookIcon,
  Link as LinkIcon,
  LinkOff as LinkOffIcon,
} from '@mui/icons-material'
import Toast from '../components/Toast'

const defaultShopInfo = {
  shopName: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  industry: '',
  businessType: '',
  businessPurpose: '', // 'Bán hàng', 'Tra cứu thông tin', hoặc 'Đặt lịch'
  taxCode: '',
  description: '',
  avatar: null,
}

function Settings() {
  const dispatch = useDispatch()
  const { connections, loading: connectionsLoading, error: connectionsError } = useSelector((state) => state.socialConnections)
  const [shopInfo, setShopInfo] = useState(defaultShopInfo)
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' })
  const [industryOptions, setIndustryOptions] = useState([])
  const [businessTypeOptions, setBusinessTypeOptions] = useState([])
  const [prevSettings, setPrevSettings] = useState(null)
  const [saving, setSaving] = useState(false)
  const hasLoadedSettingsRef = useRef(false)

  // Load social connections
  useEffect(() => {
    dispatch({ type: 'GET_SOCIAL_CONNECTIONS_REQUEST' })
  }, [dispatch])

  // Handle Redux errors
  useEffect(() => {
    if (connectionsError) {
      setToast({
        open: true,
        message: connectionsError,
        severity: 'error',
      })
    }
  }, [connectionsError])

  // Handle OAuth callback from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const platform = urlParams.get('platform')
    const action = urlParams.get('action')
    const code = urlParams.get('code')
    
    if (platform && action === 'callback' && code) {
      dispatch({
        type: 'HANDLE_SOCIAL_CALLBACK_REQUEST',
        payload: {
          platform,
          data: { code },
        },
      })
      setToast({
        open: true,
        message: `Đang xử lý kết nối với ${platform}...`,
        severity: 'info',
      })
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [dispatch])

  // Load shop info from Redux/API
  const settingsState = useSelector((state) => state.settings || {})
  const reduxSettings = settingsState?.settings || null
  const settingsLoading = settingsState?.loading || false
  const settingsError = settingsState?.error || null
  
  // Only fetch settings if we don't have data yet
  const hasFetchedRef = useRef(false)
  useEffect(() => {
    // If we already have settings data, use it immediately (no need to fetch)
    if (reduxSettings && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      return
    }
    
    // Only fetch if we don't have data and haven't fetched yet
    if (!hasFetchedRef.current && !reduxSettings && !settingsLoading) {
      dispatch({ type: 'GET_SETTINGS_REQUEST' })
      hasFetchedRef.current = true
    }
  }, [dispatch, reduxSettings, settingsLoading])

  // Debug: Log settings state changes (disabled to prevent loop)
  // useEffect(() => {
  //   if (import.meta.env.DEV) {
  //     console.log('Settings state:', {
  //       loading: settingsLoading,
  //       settings: reduxSettings,
  //       error: settingsError,
  //     })
  //   }
  // }, [settingsLoading, reduxSettings, settingsError])

  // Update shopInfo when settings are loaded from Redux (immediate if data exists)
  useEffect(() => {
    if (reduxSettings) {
      // Check if this is a new settings object (by ID or updatedAt)
      const isNewSettings = !prevSettings || 
        prevSettings._id !== reduxSettings._id ||
        prevSettings.updatedAt !== reduxSettings.updatedAt
      
      // Update immediately if new settings or haven't loaded yet
      if (isNewSettings || !hasLoadedSettingsRef.current) {
        setShopInfo((prev) => {
          // Handle avatar - if it's a file object (has data property), keep it, otherwise use server data
          let avatarValue = null
          if (prev.avatar && typeof prev.avatar === 'object' && prev.avatar.data) {
            // User just uploaded a file, keep it
            avatarValue = prev.avatar
          } else if (reduxSettings.avatar) {
            // Server has avatar data (base64 string), convert to object format
            avatarValue = typeof reduxSettings.avatar === 'string' 
              ? { data: reduxSettings.avatar } 
              : reduxSettings.avatar
          }
          
          return {
            ...defaultShopInfo,
            ...reduxSettings,
            avatar: avatarValue,
          }
        })
        setPrevSettings(reduxSettings)
        hasLoadedSettingsRef.current = true
      }
    } else if (!reduxSettings && !settingsLoading && !settingsError && !hasLoadedSettingsRef.current) {
      // If no settings exist yet, mark as loaded to prevent further attempts
      hasLoadedSettingsRef.current = true
    }
  }, [reduxSettings, settingsLoading, settingsError, prevSettings])

  // Load industry and business type options from products
  useEffect(() => {
    try {
      const attributes = JSON.parse(localStorage.getItem('productAttributes') || '[]')
      const products = JSON.parse(localStorage.getItem('products') || '[]')

      // Find attributes that might be industry or business type related
      const industryAttr = attributes.find(
        (attr) =>
          attr.type === 'selection' &&
          (attr.name.toLowerCase().includes('lĩnh vực') ||
            attr.name.toLowerCase().includes('ngành hàng') ||
            attr.name.toLowerCase().includes('industry') ||
            attr.name.toLowerCase().includes('category'))
      )

      const businessTypeAttr = attributes.find(
        (attr) =>
          attr.type === 'selection' &&
          (attr.name.toLowerCase().includes('loại hình') ||
            attr.name.toLowerCase().includes('hình thức') ||
            attr.name.toLowerCase().includes('business') ||
            attr.name.toLowerCase().includes('type'))
      )

      // Get unique values from products
      const industrySet = new Set()
      const businessTypeSet = new Set()

      if (industryAttr) {
        // Get options from attribute
        if (industryAttr.options && Array.isArray(industryAttr.options)) {
          industryAttr.options.forEach((opt) => industrySet.add(opt))
        }
        // Get values from products
        products.forEach((product) => {
          if (product.data && product.data[industryAttr.id]) {
            const value = product.data[industryAttr.id]
            if (value) industrySet.add(value)
          }
        })
      }

      if (businessTypeAttr) {
        // Get options from attribute
        if (businessTypeAttr.options && Array.isArray(businessTypeAttr.options)) {
          businessTypeAttr.options.forEach((opt) => businessTypeSet.add(opt))
        }
        // Get values from products
        products.forEach((product) => {
          if (product.data && product.data[businessTypeAttr.id]) {
            const value = product.data[businessTypeAttr.id]
            if (value) businessTypeSet.add(value)
          }
        })
      }

      // If no specific attributes found, try to extract from all selection attributes
      if (industrySet.size === 0) {
        attributes
          .filter((attr) => attr.type === 'selection')
          .forEach((attr) => {
            if (attr.options && Array.isArray(attr.options)) {
              attr.options.forEach((opt) => {
                // Add if it looks like an industry
                if (
                  opt.toLowerCase().includes('thời trang') ||
                  opt.toLowerCase().includes('điện tử') ||
                  opt.toLowerCase().includes('thực phẩm') ||
                  opt.toLowerCase().includes('mỹ phẩm') ||
                  opt.toLowerCase().includes('nội thất') ||
                  opt.toLowerCase().includes('đồ chơi')
                ) {
                  industrySet.add(opt)
                }
              })
            }
          })
      }

      if (businessTypeSet.size === 0) {
        attributes
          .filter((attr) => attr.type === 'selection')
          .forEach((attr) => {
            if (attr.options && Array.isArray(attr.options)) {
              attr.options.forEach((opt) => {
                // Add if it looks like a business type
                if (
                  opt.toLowerCase().includes('bán lẻ') ||
                  opt.toLowerCase().includes('bán buôn') ||
                  opt.toLowerCase().includes('dịch vụ') ||
                  opt.toLowerCase().includes('sản xuất')
                ) {
                  businessTypeSet.add(opt)
                }
              })
            }
          })
      }

      // Default options if still empty
      if (industrySet.size === 0) {
        // Thời trang & Phụ kiện
        industrySet.add('Thời trang')
        industrySet.add('Giày dép')
        industrySet.add('Túi xách')
        industrySet.add('Phụ kiện thời trang')
        // Điện tử & Công nghệ
        industrySet.add('Điện tử')
        industrySet.add('Điện thoại & Phụ kiện')
        industrySet.add('Máy tính & Laptop')
        industrySet.add('Thiết bị điện tử')
        // Thực phẩm & Đồ uống
        industrySet.add('Thực phẩm')
        industrySet.add('Đồ uống')
        industrySet.add('Thực phẩm chức năng')
        // Mỹ phẩm & Chăm sóc sức khỏe
        industrySet.add('Mỹ phẩm')
        industrySet.add('Chăm sóc da')
        industrySet.add('Chăm sóc tóc')
        industrySet.add('Dược phẩm')
        // Nội thất & Trang trí
        industrySet.add('Nội thất')
        industrySet.add('Trang trí nhà cửa')
        industrySet.add('Đồ gia dụng')
        // Bất động sản
        industrySet.add('Bất động sản')
        industrySet.add('Cho thuê bất động sản')
        industrySet.add('Mua bán bất động sản')
        // Ô tô & Xe máy
        industrySet.add('Ô tô')
        industrySet.add('Xe máy')
        industrySet.add('Phụ tùng xe')
        // Giáo dục & Sách
        industrySet.add('Sách')
        industrySet.add('Giáo dục')
        industrySet.add('Đồ dùng học tập')
        // Thể thao & Giải trí
        industrySet.add('Thể thao')
        industrySet.add('Đồ chơi')
        industrySet.add('Game & Giải trí')
        // Dịch vụ
        industrySet.add('Dịch vụ tài chính')
        industrySet.add('Dịch vụ du lịch')
        industrySet.add('Dịch vụ vận chuyển')
        industrySet.add('Dịch vụ công nghệ')
        // Khác
        industrySet.add('Vật nuôi & Phụ kiện')
        industrySet.add('Đồ handmade')
        industrySet.add('Quà tặng')
      }

      if (businessTypeSet.size === 0) {
        businessTypeSet.add('Bán lẻ')
        businessTypeSet.add('Bán buôn')
        businessTypeSet.add('Dịch vụ')
        businessTypeSet.add('Sản xuất')
        businessTypeSet.add('Phân phối')
      }

      setIndustryOptions(Array.from(industrySet).sort())
      setBusinessTypeOptions(Array.from(businessTypeSet).sort())
    } catch (error) {
      console.error('Error loading options from products:', error)
      // Set default options on error
      setIndustryOptions([
        'Thời trang', 'Giày dép', 'Túi xách', 'Phụ kiện thời trang',
        'Điện tử', 'Điện thoại & Phụ kiện', 'Máy tính & Laptop', 'Thiết bị điện tử',
        'Thực phẩm', 'Đồ uống', 'Thực phẩm chức năng',
        'Mỹ phẩm', 'Chăm sóc da', 'Chăm sóc tóc', 'Dược phẩm',
        'Nội thất', 'Trang trí nhà cửa', 'Đồ gia dụng',
        'Bất động sản', 'Cho thuê bất động sản', 'Mua bán bất động sản',
        'Ô tô', 'Xe máy', 'Phụ tùng xe',
        'Sách', 'Giáo dục', 'Đồ dùng học tập',
        'Thể thao', 'Đồ chơi', 'Game & Giải trí',
        'Dịch vụ tài chính', 'Dịch vụ du lịch', 'Dịch vụ vận chuyển', 'Dịch vụ công nghệ',
        'Vật nuôi & Phụ kiện', 'Đồ handmade', 'Quà tặng'
      ])
      setBusinessTypeOptions(['Bán lẻ', 'Bán buôn', 'Dịch vụ', 'Sản xuất', 'Phân phối'])
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setShopInfo((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSelectChange = (name, value) => {
    setShopInfo((prev) => ({ ...prev, [name]: value }))
    // Clear error when user selects
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

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
        message: 'Kích thước file không được vượt quá 5MB',
        severity: 'error',
      })
      return
    }

    // Read file as base64
    const reader = new FileReader()
    reader.onloadend = () => {
      setShopInfo((prev) => ({
        ...prev,
        avatar: {
          data: reader.result,
          fileName: file.name,
          fileType: file.type,
        },
      }))
    }
    reader.onerror = () => {
      setToast({
        open: true,
        message: 'Lỗi khi đọc file ảnh',
        severity: 'error',
      })
    }
    reader.readAsDataURL(file)
    
    // Reset input
    e.target.value = ''
  }

  const handleRemoveAvatar = () => {
    setShopInfo((prev) => ({ ...prev, avatar: null }))
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!shopInfo.shopName.trim()) {
      newErrors.shopName = 'Tên shop là bắt buộc'
    }
    
    if (!shopInfo.address.trim()) {
      newErrors.address = 'Địa chỉ là bắt buộc'
    }
    
    if (!shopInfo.businessPurpose) {
      newErrors.businessPurpose = 'Mục đích sử dụng là bắt buộc'
    }
    
    if (shopInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shopInfo.email)) {
      newErrors.email = 'Email không hợp lệ'
    }
    
    if (shopInfo.phone && !/^[0-9+\-\s()]+$/.test(shopInfo.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) {
      setToast({
        open: true,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc',
        severity: 'error',
      })
      return
    }

    setSaving(true)
    // Prepare data for API (convert avatar base64 to string if exists)
    const saveData = {
      ...shopInfo,
      avatar: shopInfo.avatar?.data || shopInfo.avatar || null,
    }

    dispatch({
      type: 'UPDATE_SETTINGS_REQUEST',
      payload: saveData,
    })
  }

  // Handle save success/error
  const settingsLoadingState = settingsState?.loading || false

  useEffect(() => {
    if (settingsError && saving) {
      setToast({
        open: true,
        message: settingsError || 'Lỗi khi lưu thông tin shop',
        severity: 'error',
      })
      setSaving(false)
    }
  }, [settingsError, saving])

  // Handle save success - detect when settings update completes
  useEffect(() => {
    if (prevSettings && reduxSettings && !settingsLoading && !settingsLoadingState) {
      // Check if settings actually changed (save was successful)
      if (reduxSettings._id && reduxSettings.updatedAt !== prevSettings?.updatedAt) {
        setToast({
          open: true,
          message: 'Lưu thông tin shop thành công!',
          severity: 'success',
        })
        setSaving(false)
        setPrevSettings(reduxSettings)
        // Update shopInfo with new settings after save
        setShopInfo((prev) => {
          let avatarValue = null
          if (prev.avatar && typeof prev.avatar === 'object' && prev.avatar.data) {
            avatarValue = prev.avatar
          } else if (reduxSettings.avatar) {
            avatarValue = typeof reduxSettings.avatar === 'string' 
              ? { data: reduxSettings.avatar } 
              : reduxSettings.avatar
          }
          return {
            ...defaultShopInfo,
            ...reduxSettings,
            avatar: avatarValue,
          }
        })
      }
    } else if (reduxSettings && !prevSettings) {
      setPrevSettings(reduxSettings)
    }
  }, [reduxSettings, settingsLoading, settingsLoadingState, prevSettings])

  // Show loading state only on initial load (show form immediately, loading in background)
  // Form will be populated when data arrives

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
          Cài đặt Shop
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          Quản lý thông tin shop và cài đặt hệ thống
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
          {/* Avatar Shop */}
          <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ position: 'relative', mb: 2 }}>
              <Avatar
                src={shopInfo.avatar?.data || shopInfo.avatar || null}
                alt={shopInfo.shopName || 'Shop Avatar'}
                sx={{
                  width: { xs: 120, sm: 150, md: 180 },
                  height: { xs: 120, sm: 150, md: 180 },
                  fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
                  bgcolor: 'primary.main',
                  border: '4px solid',
                  borderColor: 'primary.light',
                }}
              >
                {shopInfo.shopName?.charAt(0)?.toUpperCase() || <StoreIcon sx={{ fontSize: 'inherit' }} />}
              </Avatar>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="avatar-upload"
                type="file"
                onChange={handleAvatarChange}
              />
              <label htmlFor="avatar-upload">
                <IconButton
                  color="primary"
                  component="span"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'background.paper',
                    border: '2px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <PhotoCameraIcon />
                </IconButton>
              </label>
            </Box>
            {shopInfo.avatar && (
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={handleRemoveAvatar}
                sx={{ mt: 1 }}
              >
                Xóa avatar
              </Button>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
              Tải lên logo/avatar cho shop (JPG, PNG, tối đa 5MB)
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Thông tin cơ bản */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <StoreIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Thông tin cơ bản
              </Typography>
            </Box>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tên shop *"
                  name="shopName"
                  value={shopInfo.shopName}
                  onChange={handleInputChange}
                  error={!!errors.shopName}
                  helperText={errors.shopName}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mã số thuế"
                  name="taxCode"
                  value={shopInfo.taxCode}
                  onChange={handleInputChange}
                  error={!!errors.taxCode}
                  helperText={errors.taxCode}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mô tả shop"
                  name="description"
                  value={shopInfo.description}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  error={!!errors.description}
                  helperText={errors.description}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Thông tin liên hệ */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <LocationOnIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Thông tin liên hệ
              </Typography>
            </Box>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Địa chỉ *"
                  name="address"
                  value={shopInfo.address}
                  onChange={handleInputChange}
                  error={!!errors.address}
                  helperText={errors.address}
                  required
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  name="phone"
                  value={shopInfo.phone}
                  onChange={handleInputChange}
                  error={!!errors.phone}
                  helperText={errors.phone || 'VD: 0123456789'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={shopInfo.email}
                  onChange={handleInputChange}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Website"
                  name="website"
                  value={shopInfo.website}
                  onChange={handleInputChange}
                  error={!!errors.website}
                  helperText={errors.website || 'VD: https://example.com'}
                  placeholder="https://"
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Thông tin ngành hàng */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <BusinessIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Thông tin ngành hàng
              </Typography>
            </Box>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.industry}>
                  <InputLabel>Lĩnh vực</InputLabel>
                  <Select
                    value={shopInfo.industry || ''}
                    onChange={(e) => handleSelectChange('industry', e.target.value)}
                    label="Lĩnh vực"
                    displayEmpty
                  >
                    <MenuItem value="">
                      <em>Chọn lĩnh vực</em>
                    </MenuItem>
                    {industryOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.industry && <FormHelperText>{errors.industry}</FormHelperText>}
                  {!errors.industry && (
                    <FormHelperText>
                      Tự động lấy từ các ngành hàng trong sản phẩm
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.businessType}>
                  <InputLabel>Loại hình kinh doanh</InputLabel>
                  <Select
                    value={shopInfo.businessType || ''}
                    onChange={(e) => handleSelectChange('businessType', e.target.value)}
                    label="Loại hình kinh doanh"
                    displayEmpty
                  >
                    <MenuItem value="">
                      <em>Chọn loại hình</em>
                    </MenuItem>
                    {businessTypeOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.businessType && <FormHelperText>{errors.businessType}</FormHelperText>}
                  {!errors.businessType && (
                    <FormHelperText>
                      Tự động lấy từ các loại hình trong sản phẩm
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.businessPurpose} required>
                  <InputLabel>Mục đích sử dụng</InputLabel>
                  <Select
                    value={shopInfo.businessPurpose || ''}
                    onChange={(e) => handleSelectChange('businessPurpose', e.target.value)}
                    label="Mục đích sử dụng"
                    displayEmpty
                  >
                    <MenuItem value="">
                      <em>Chọn mục đích</em>
                    </MenuItem>
                    <MenuItem value="Bán hàng">Bán hàng</MenuItem>
                    <MenuItem value="Tra cứu thông tin">Tra cứu thông tin</MenuItem>
                    <MenuItem value="Đặt lịch">Đặt lịch</MenuItem>
                  </Select>
                  {errors.businessPurpose && <FormHelperText>{errors.businessPurpose}</FormHelperText>}
                  {!errors.businessPurpose && (
                    <FormHelperText>
                      Chọn mục đích sử dụng hệ thống của bạn
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving || settingsLoading}
              sx={{
                minWidth: 150,
                fontSize: '1rem',
                py: 1.5,
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4,
                },
              }}
            >
              {saving ? 'Đang lưu...' : 'Lưu thông tin'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Social Connections */}
      <Card sx={{ mt: 3 }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <LinkIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Kết nối mạng xã hội
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Kết nối tài khoản mạng xã hội để quản lý và đăng bài tự động
          </Typography>

          <Grid container spacing={3}>
            {/* Facebook */}
            <Grid item xs={12} md={4}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  border: '2px solid',
                  borderColor: (theme) =>
                    connections?.find((c) => c.platform === 'facebook')?.isConnected
                      ? 'success.main'
                      : 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: 2,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: '#1877F2',
                        width: 48,
                        height: 48,
                        mr: 2,
                      }}
                    >
                      <FacebookIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600}>
                        Facebook
                      </Typography>
                      {connections?.find((c) => c.platform === 'facebook')?.isConnected ? (
                        <Chip
                          label="Đã kết nối"
                          color="success"
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      ) : (
                        <Chip
                          label="Chưa kết nối"
                          size="small"
                          variant="outlined"
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </Box>
                  </Box>
                  {connections?.find((c) => c.platform === 'facebook')?.username && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      @{connections.find((c) => c.platform === 'facebook')?.username}
                    </Typography>
                  )}
                  {connections?.find((c) => c.platform === 'facebook')?.isConnected ? (
                    <Button
                      variant="outlined"
                      color="error"
                      fullWidth
                      startIcon={<LinkOffIcon />}
                      onClick={() => {
                        dispatch({ type: 'DISCONNECT_SOCIAL_REQUEST', payload: { platform: 'facebook' } })
                        setToast({
                          open: true,
                          message: 'Đang ngắt kết nối Facebook...',
                          severity: 'info',
                        })
                      }}
                      disabled={connectionsLoading}
                    >
                      Ngắt kết nối
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<LinkIcon />}
                      onClick={() => {
                        dispatch({ type: 'CONNECT_SOCIAL_REQUEST', payload: { platform: 'facebook' } })
                        setToast({
                          open: true,
                          message: 'Đang mở trang kết nối Facebook...',
                          severity: 'info',
                        })
                      }}
                      disabled={connectionsLoading}
                      sx={{
                        bgcolor: '#1877F2',
                        '&:hover': {
                          bgcolor: '#1565C0',
                        },
                      }}
                    >
                      Kết nối Facebook
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Zalo */}
            <Grid item xs={12} md={4}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  border: '2px solid',
                  borderColor: (theme) =>
                    connections?.find((c) => c.platform === 'zalo')?.isConnected
                      ? 'success.main'
                      : 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: 2,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: '#0068FF',
                        width: 48,
                        height: 48,
                        mr: 2,
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          color: 'white',
                        }}
                      >
                        Z
                      </Box>
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600}>
                        Zalo
                      </Typography>
                      {connections?.find((c) => c.platform === 'zalo')?.isConnected ? (
                        <Chip
                          label="Đã kết nối"
                          color="success"
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      ) : (
                        <Chip
                          label="Chưa kết nối"
                          size="small"
                          variant="outlined"
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </Box>
                  </Box>
                  {connections?.find((c) => c.platform === 'zalo')?.username && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      @{connections.find((c) => c.platform === 'zalo')?.username}
                    </Typography>
                  )}
                  {connections?.find((c) => c.platform === 'zalo')?.isConnected ? (
                    <Button
                      variant="outlined"
                      color="error"
                      fullWidth
                      startIcon={<LinkOffIcon />}
                      onClick={() => {
                        dispatch({ type: 'DISCONNECT_SOCIAL_REQUEST', payload: { platform: 'zalo' } })
                        setToast({
                          open: true,
                          message: 'Đang ngắt kết nối Zalo...',
                          severity: 'info',
                        })
                      }}
                      disabled={connectionsLoading}
                    >
                      Ngắt kết nối
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<LinkIcon />}
                      onClick={() => {
                        dispatch({ type: 'CONNECT_SOCIAL_REQUEST', payload: { platform: 'zalo' } })
                        setToast({
                          open: true,
                          message: 'Đang mở trang kết nối Zalo...',
                          severity: 'info',
                        })
                      }}
                      disabled={connectionsLoading}
                      sx={{
                        bgcolor: '#0068FF',
                        '&:hover': {
                          bgcolor: '#0052CC',
                        },
                      }}
                    >
                      Kết nối Zalo
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Telegram */}
            <Grid item xs={12} md={4}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  border: '2px solid',
                  borderColor: (theme) =>
                    connections?.find((c) => c.platform === 'telegram')?.isConnected
                      ? 'success.main'
                      : 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: 2,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: '#0088cc',
                        width: 48,
                        height: 48,
                        mr: 2,
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          color: 'white',
                        }}
                      >
                        T
                      </Box>
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600}>
                        Telegram
                      </Typography>
                      {connections?.find((c) => c.platform === 'telegram')?.isConnected ? (
                        <Chip
                          label="Đã kết nối"
                          color="success"
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      ) : (
                        <Chip
                          label="Chưa kết nối"
                          size="small"
                          variant="outlined"
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </Box>
                  </Box>
                  {connections?.find((c) => c.platform === 'telegram')?.username && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      @{connections.find((c) => c.platform === 'telegram')?.username}
                    </Typography>
                  )}
                  {connections?.find((c) => c.platform === 'telegram')?.isConnected ? (
                    <Button
                      variant="outlined"
                      color="error"
                      fullWidth
                      startIcon={<LinkOffIcon />}
                      onClick={() => {
                        dispatch({ type: 'DISCONNECT_SOCIAL_REQUEST', payload: { platform: 'telegram' } })
                        setToast({
                          open: true,
                          message: 'Đang ngắt kết nối Telegram...',
                          severity: 'info',
                        })
                      }}
                      disabled={connectionsLoading}
                    >
                      Ngắt kết nối
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<LinkIcon />}
                      onClick={() => {
                        dispatch({ type: 'CONNECT_SOCIAL_REQUEST', payload: { platform: 'telegram' } })
                        setToast({
                          open: true,
                          message: 'Đang mở trang kết nối Telegram...',
                          severity: 'info',
                        })
                      }}
                      disabled={connectionsLoading}
                      sx={{
                        bgcolor: '#0088cc',
                        '&:hover': {
                          bgcolor: '#006699',
                        },
                      }}
                    >
                      Kết nối Telegram
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </Container>
  )
}

export default Settings

