import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
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
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  useTheme,
  useMediaQuery,
  Divider,
  Checkbox,
  Tooltip,
  Menu,
  CircularProgress,
  Alert,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  UploadFile as UploadFileIcon,
  Download as DownloadIcon,
  Image as ImageIcon,
  MoreVert as MoreVertIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
} from '@mui/icons-material'
import * as XLSX from 'xlsx'
import Toast from '../components/Toast'

function ProductsList() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const dispatch = useDispatch()
  const { attributes, loading: attributesLoading } = useSelector((state) => state.productAttributes)
  const { products, loading: productsLoading, total, currentPage, totalPages } = useSelector((state) => state.products)
  
  const [page, setPage] = useState(1)
  const [openDialog, setOpenDialog] = useState(false)
  const [openDownloadDialog, setOpenDownloadDialog] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})
  const [selectedProducts, setSelectedProducts] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' })
  const [anchorEl, setAnchorEl] = useState(null)
  const rowsPerPage = 10
  const prevLoading = useRef(false)

  // Load attributes and products from Redux
  useEffect(() => {
    dispatch({ type: 'GET_ATTRIBUTES_REQUEST' })
    dispatch({ type: 'GET_PRODUCTS_REQUEST', payload: { page: 1, limit: 1000 } })
  }, [dispatch])

  // Handle success messages
  const prevLoading = useRef(productLoading)
  useEffect(() => {
    if (prevLoading.current && !productLoading && !productError) {
      // Check if it was a create/update/delete action
      if (editingId === null && !openDialog) {
        // Likely a delete or create success
        setToast({
          open: true,
          message: 'Thao tác thành công!',
          severity: 'success',
        })
      }
    }
    prevLoading.current = productLoading
  }, [productLoading, productError, editingId, openDialog])

  // Update page when Redux currentPage changes
  useEffect(() => {
    if (currentPage) {
      setPage(currentPage)
    }
  }, [currentPage])

  // Memoize pagination calculations
  const paginationData = useMemo(() => {
    const totalPagesCalc = totalPages || Math.ceil(products.length / rowsPerPage)
    const startIndex = (page - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    const currentProducts = products.slice(startIndex, endIndex)
    return { totalPages: totalPagesCalc, startIndex, endIndex, currentProducts }
  }, [products, page, rowsPerPage, totalPages])

  const handlePageChange = useCallback((event, value) => {
    setPage(value)
    dispatch({ type: 'GET_PRODUCTS_REQUEST', payload: { page: value, limit: rowsPerPage } })
  }, [dispatch, rowsPerPage])

  const handleInputChange = (e, attributeId) => {
    const { name, value, files } = e.target
    const newFormData = { ...formData }
    const attribute = attributes.find((attr) => attr._id === attributeId || attr.id === attributeId)

    if (files && files.length > 0) {
      // Handle multiple file upload for image-gallery
      if (attribute?.type === 'image-gallery') {
        const fileArray = Array.from(files)
        const imagePromises = fileArray.map((file) => {
          return new Promise((resolve) => {
            if (!file.type.startsWith('image/')) {
              resolve(null)
              return
            }
            const reader = new FileReader()
            reader.onloadend = () => {
              resolve({
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                data: reader.result,
              })
            }
            reader.readAsDataURL(file)
          })
        })

        Promise.all(imagePromises).then((images) => {
          const validImages = images.filter((img) => img !== null)
          const existingImages = Array.isArray(newFormData[attributeId])
            ? newFormData[attributeId]
            : []
          newFormData[attributeId] = [...existingImages, ...validImages]
          setFormData(newFormData)
        })
      } else {
        // Handle single file upload
        const file = files[0]
        const reader = new FileReader()
        reader.onloadend = () => {
          newFormData[attributeId] = {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            data: reader.result,
          }
          setFormData(newFormData)
        }
        reader.readAsDataURL(file)
      }
    } else {
      newFormData[attributeId] = value
      setFormData(newFormData)
    }

    // Clear error
    if (errors[attributeId]) {
      setErrors((prev) => ({
        ...prev,
        [attributeId]: '',
      }))
    }
  }

  const handleRemoveImage = (attributeId, imageIndex) => {
    const newFormData = { ...formData }
    if (Array.isArray(newFormData[attributeId])) {
      newFormData[attributeId] = newFormData[attributeId].filter(
        (_, index) => index !== imageIndex
      )
      setFormData(newFormData)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    attributes.forEach((attr) => {
      const attrId = attr._id || attr.id
      if (attr.required) {
        if (attr.type === 'image-gallery') {
          const galleryData = formData[attrId]
          if (!galleryData || !Array.isArray(galleryData) || galleryData.length === 0) {
            newErrors[attrId] = `${attr.name} là bắt buộc (ít nhất 1 ảnh)`
          }
        } else if (!formData[attrId]) {
          newErrors[attrId] = `${attr.name} là bắt buộc`
        }
      }
      if (attr.type === 'email' && formData[attrId]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData[attrId])) {
          newErrors[attrId] = 'Email không hợp lệ'
        }
      }
      if (attr.type === 'number' && formData[attrId]) {
        if (isNaN(Number(formData[attrId]))) {
          newErrors[attrId] = 'Giá trị phải là số'
        }
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingId(product._id || product.id)
      // Backend uses 'attributes', frontend uses 'data' for compatibility
      setFormData(product.attributes || product.data || {})
    } else {
      setEditingId(null)
      setFormData({})
    }
    setErrors({})
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingId(null)
    setFormData({})
    setErrors({})
  }

  const handleSave = () => {
    if (!validateForm()) return

    // Convert formData to match backend format (attributes is a Map)
    const productData = {
      attributes: formData,
    }

    if (editingId) {
      dispatch({
        type: 'UPDATE_PRODUCT_REQUEST',
        payload: {
          id: editingId,
          productData,
        },
      })
    } else {
      dispatch({
        type: 'CREATE_PRODUCT_REQUEST',
        payload: productData,
      })
    }

    handleCloseDialog()
  }

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      dispatch({ type: 'DELETE_PRODUCT_REQUEST', payload: id })
    }
  }

  const handleDeleteSelected = () => {
    if (selectedProducts.length === 0) return
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedProducts.length} sản phẩm đã chọn?`)) {
      selectedProducts.forEach((id) => {
        dispatch({ type: 'DELETE_PRODUCT_REQUEST', payload: id })
      })
      setSelectedProducts([])
      setSelectAll(false)
    }
  }

  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(paginationData.currentProducts.map((p) => p._id || p.id))
    }
    setSelectAll(!selectAll)
  }

  const handleCSVUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet)

        if (jsonData.length === 0) {
          setToast({
            open: true,
            message: 'File CSV không có dữ liệu',
            severity: 'error',
          })
          return
        }

        // Map CSV columns to attributes (only text types)
        const textAttributes = attributes.filter((attr) => 
          ['text', 'number', 'email', 'textarea', 'select'].includes(attr.type)
        )

        const newProducts = jsonData.map((row) => {
          const productData = {}
          textAttributes.forEach((attr) => {
            const attrId = attr._id || attr.id
            const columnName = attr.name
            if (row[columnName] !== undefined && row[columnName] !== null && row[columnName] !== '') {
              // Handle different attribute types
              if (attr.type === 'number') {
                productData[attrId] = Number(row[columnName]) || row[columnName]
              } else {
                productData[attrId] = String(row[columnName])
              }
            }
          })

          return {
            data: productData,
          }
        })

        // Create products via API
        newProducts.forEach((product) => {
          dispatch({ type: 'CREATE_PRODUCT_REQUEST', payload: product })
        })

        setToast({
          open: true,
          message: `Đã import ${newProducts.length} sản phẩm từ CSV!`,
          severity: 'success',
        })
        setPage(1)
      } catch (error) {
        console.error('Error reading CSV file:', error)
        setToast({
          open: true,
          message: 'Lỗi khi đọc file CSV. Vui lòng kiểm tra lại file.',
          severity: 'error',
        })
      }
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ''
  }

  const handleDownloadTemplate = () => {
    if (attributes.length === 0) {
      setToast({
        open: true,
        message: 'Vui lòng tạo thuộc tính trước!',
        severity: 'warning',
      })
      return
    }

    // Only include text-based attributes
    const textAttributes = attributes.filter((attr) => 
      ['text', 'number', 'email', 'textarea', 'select'].includes(attr.type)
    )

    if (textAttributes.length === 0) {
      setToast({
        open: true,
        message: 'Không có thuộc tính loại text để tạo mẫu CSV!',
        severity: 'warning',
      })
      return
    }

    // Create template data
    const templateData = [
      textAttributes.reduce((acc, attr) => {
        acc[attr.name] = `Giá trị mẫu cho ${attr.name}`
        return acc
      }, {}),
    ]

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Products')

    // Set column widths
    const colWidths = textAttributes.map(() => ({ wch: 30 }))
    ws['!cols'] = colWidths

    // Download file
    XLSX.writeFile(wb, 'Mau_San_Pham.csv')
  }

  const handleDownloadSelected = () => {
    if (selectedProducts.length === 0) {
      setToast({
        open: true,
        message: 'Vui lòng chọn sản phẩm để tải xuống!',
        severity: 'warning',
      })
      return
    }

    // Only include text-based attributes
    const textAttributes = attributes.filter((attr) => 
      ['text', 'number', 'email', 'textarea', 'select'].includes(attr.type)
    )

    const selectedProductsData = products.filter((p) => 
      selectedProducts.includes(p._id || p.id)
    )

    const exportData = selectedProductsData.map((product) => {
      const row = {}
      const productData = getProductAttributes(product)
      textAttributes.forEach((attr) => {
        const attrId = attr._id || attr.id
        row[attr.name] = productData[attrId] || ''
      })
      return row
    })

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Products')

    // Set column widths
    const colWidths = textAttributes.map(() => ({ wch: 30 }))
    ws['!cols'] = colWidths

    // Download file
    XLSX.writeFile(wb, `San_Pham_${new Date().toISOString().split('T')[0]}.csv`)
    
    setToast({
      open: true,
      message: `Đã tải xuống ${selectedProducts.length} sản phẩm!`,
      severity: 'success',
    })
    setOpenDownloadDialog(false)
  }

  // Memoize findImageAttribute function
  const findImageAttribute = useCallback(
    (product) => {
      // Backend uses 'attributes', frontend uses 'data' for compatibility
      let productData = product.attributes || product.data || {}
      
      // Convert Map to object if needed
      if (productData instanceof Map) {
        productData = Object.fromEntries(productData)
      }
      
      // First, check for image-gallery
      for (const attr of attributes) {
        const attrId = attr._id || attr.id
        if (attr.type === 'image-gallery' && productData[attrId]) {
          const galleryData = productData[attrId]
          if (Array.isArray(galleryData) && galleryData.length > 0) {
            return { attribute: attr, imageData: galleryData[0], isGallery: true, gallery: galleryData }
          }
        }
      }
      // Then check for single file image
      for (const attr of attributes) {
        const attrId = attr._id || attr.id
        if (attr.type === 'file' && productData[attrId]) {
          const fileData = productData[attrId]
          if (fileData?.fileType && fileData.fileType.startsWith('image/')) {
            return { attribute: attr, imageData: fileData, isGallery: false }
          }
          if (fileData?.data && typeof fileData.data === 'string' && fileData.data.startsWith('data:image/')) {
            return { attribute: attr, imageData: fileData, isGallery: false }
          }
        }
      }
      return null
    },
    [attributes]
  )

  const renderFormField = (attribute) => {
    const attrId = attribute._id || attribute.id
    const value = formData[attrId] || ''
    const error = errors[attrId]

    switch (attribute.type) {
      case 'text':
        return (
          <TextField
            fullWidth
            label={attribute.name}
            value={value}
            onChange={(e) => handleInputChange(e, attrId)}
            error={!!error}
            helperText={error}
            required={attribute.required}
            sx={{ mb: 2 }}
          />
        )
      case 'number':
        return (
          <TextField
            fullWidth
            label={attribute.name}
            type="number"
            value={value}
            onChange={(e) => handleInputChange(e, attrId)}
            error={!!error}
            helperText={error}
            required={attribute.required}
            sx={{ mb: 2 }}
          />
        )
      case 'email':
        return (
          <TextField
            fullWidth
            label={attribute.name}
            type="email"
            value={value}
            onChange={(e) => handleInputChange(e, attrId)}
            error={!!error}
            helperText={error}
            required={attribute.required}
            sx={{ mb: 2 }}
          />
        )
      case 'textarea':
        return (
          <TextField
            fullWidth
            label={attribute.name}
            multiline
            rows={4}
            value={value}
            onChange={(e) => handleInputChange(e, attrId)}
            error={!!error}
            helperText={error}
            required={attribute.required}
            sx={{ mb: 2 }}
          />
        )
      case 'file':
        return (
          <Box sx={{ mb: 2 }}>
            <input
              accept="*/*"
              style={{ display: 'none' }}
              id={`file-${attrId}`}
              type="file"
              onChange={(e) => handleInputChange(e, attrId)}
            />
            <label htmlFor={`file-${attrId}`}>
              <Button variant="outlined" component="span" fullWidth>
                {value?.fileName || `Chọn file cho ${attribute.name}`}
              </Button>
            </label>
            {value?.fileName && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {value.fileName} ({(value.fileSize / 1024).toFixed(2)} KB)
              </Typography>
            )}
            {error && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {error}
              </Typography>
            )}
          </Box>
        )
      case 'image-gallery':
        const images = Array.isArray(value) ? value : []
        return (
          <Box sx={{ mb: 2 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id={`gallery-${attrId}`}
              type="file"
              multiple
              onChange={(e) => handleInputChange(e, attrId)}
            />
            <label htmlFor={`gallery-${attrId}`}>
              <Button variant="outlined" component="span" fullWidth startIcon={<ImageIcon />}>
                Thêm hình ảnh ({images.length} ảnh)
              </Button>
            </label>
            {images.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  {images.map((img, index) => (
                    <Grid item xs={6} sm={4} md={3} key={index}>
                      <Box
                        sx={{
                          position: 'relative',
                          width: '100%',
                          paddingTop: '100%',
                          borderRadius: 1,
                          overflow: 'hidden',
                          border: '1px solid',
                          borderColor: 'divider',
                          bgcolor: 'grey.100',
                        }}
                      >
                        <img
                          src={img.data}
                          alt={img.fileName || `Image ${index + 1}`}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: 'rgba(0,0,0,0.5)',
                            color: 'white',
                            '&:hover': {
                              bgcolor: 'rgba(0,0,0,0.7)',
                            },
                          }}
                          onClick={() => handleRemoveImage(attrId, index)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.5, display: 'block' }}
                        noWrap
                      >
                        {img.fileName}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
            {error && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {error}
              </Typography>
            )}
          </Box>
        )
      case 'select':
        return (
          <FormControl fullWidth sx={{ mb: 2 }} error={!!error} required={attribute.required}>
            <InputLabel>{attribute.name}</InputLabel>
            <Select
              value={value}
              onChange={(e) => handleInputChange(e, attrId)}
              label={attribute.name}
            >
              {attribute.options?.map((option, index) => (
                <MenuItem key={index} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {error && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                {error}
              </Typography>
            )}
          </FormControl>
        )
      default:
        return null
    }
  }

  const productError = useSelector((state) => state.products?.error)
  const productAttributeError = useSelector((state) => state.productAttributes?.error)
  const productLoading = useSelector((state) => state.products?.loading)

  // Handle Redux success/error
  useEffect(() => {
    if (productError) {
      setToast({
        open: true,
        message: productError,
        severity: 'error',
      })
    }
  }, [productError])

  useEffect(() => {
    if (productAttributeError) {
      setToast({
        open: true,
        message: productAttributeError,
        severity: 'error',
      })
    }
  }, [productAttributeError])

  // Handle success messages
  useEffect(() => {
    if (!productLoading && !productError) {
      // Success handled by individual actions
    }
  }, [productLoading, productError])

  if (attributesLoading) {
    return (
      <Container maxWidth="lg" sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  if (attributes.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" gutterBottom>
              Chưa có thuộc tính nào
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Vui lòng tạo thuộc tính trước khi thêm sản phẩm
            </Typography>
            <Button
              variant="contained"
              onClick={() => window.location.href = '/products/attributes'}
            >
              Đi đến trang Thuộc tính
            </Button>
          </CardContent>
        </Card>
      </Container>
    )
  }

  // Helper function to convert Map to object if needed
  const getProductAttributes = useCallback((product) => {
    if (!product) return {}
    let attrs = product.attributes || product.data || {}
    
    // If it's a Map, convert to object
    if (attrs instanceof Map) {
      attrs = Object.fromEntries(attrs)
    }
    
    // If it's already an object but might have Map values, convert recursively
    if (typeof attrs === 'object' && attrs !== null && !Array.isArray(attrs)) {
      const result = {}
      for (const key in attrs) {
        if (attrs[key] instanceof Map) {
          result[key] = Object.fromEntries(attrs[key])
        } else {
          result[key] = attrs[key]
        }
      }
      return result
    }
    
    return attrs || {}
  }, [])

  const sortedAttributes = [...attributes].sort((a, b) => (a.order || 0) - (b.order || 0))

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
          Danh sách sản phẩm
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          Quản lý sản phẩm dựa trên các thuộc tính đã tạo
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Card sx={{ mb: { xs: 2, md: 3 } }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
          <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                fullWidth
              >
                Thêm sản phẩm
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <input
                accept=".csv,.xlsx,.xls"
                style={{ display: 'none' }}
                id="csv-upload"
                type="file"
                onChange={handleCSVUpload}
              />
              <label htmlFor="csv-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadFileIcon />}
                  fullWidth
                >
                  Upload CSV
                </Button>
              </label>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadTemplate}
                fullWidth
              >
                Tải mẫu CSV
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => setOpenDownloadDialog(true)}
                fullWidth
                disabled={selectedProducts.length === 0}
              >
                Tải đã chọn ({selectedProducts.length})
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteSelected}
                fullWidth
                disabled={selectedProducts.length === 0}
              >
                Xóa đã chọn
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Chip
                label={`Tổng: ${total || products.length} sản phẩm`}
                color="primary"
                variant="outlined"
                sx={{ width: '100%', height: '40px' }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {productsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : products.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                minHeight: 300,
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chưa có sản phẩm nào
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hãy thêm sản phẩm mới hoặc upload file CSV
              </Typography>
            </Box>
          ) : isMobile ? (
            // Mobile Card View
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {paginationData.currentProducts.map((product, index) => {
                const productId = product._id || product.id
                const imageInfo = findImageAttribute(product)
                return (
                  <Card
                    key={productId}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        boxShadow: 2,
                      },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Checkbox
                          checked={selectedProducts.includes(productId)}
                          onChange={() => handleSelectProduct(productId)}
                          sx={{ alignSelf: 'flex-start' }}
                        />
                        {imageInfo && imageInfo.imageData?.data ? (
                          <Box
                            sx={{
                              width: 100,
                              height: 100,
                              borderRadius: 1,
                              overflow: 'hidden',
                              border: '1px solid',
                              borderColor: 'divider',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: 'grey.100',
                              flexShrink: 0,
                            }}
                          >
                            <img
                              src={imageInfo.imageData.data}
                              alt={imageInfo.imageData.fileName || 'Product image'}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none'
                              }}
                            />
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              width: 100,
                              height: 100,
                              borderRadius: 1,
                              border: '1px dashed',
                              borderColor: 'divider',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: 'grey.50',
                              flexShrink: 0,
                            }}
                          >
                            <ImageIcon sx={{ color: 'text.disabled', fontSize: 32 }} />
                          </Box>
                        )}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          {sortedAttributes.slice(0, 3).map((attr) => {
                            const attrId = attr._id || attr.id
                            const productData = getProductAttributes(product)
                            const value =
                              attr.type === 'image-gallery' && Array.isArray(productData[attrId])
                                ? `${productData[attrId].length} ảnh`
                                : attr.type === 'file' && productData[attrId]?.fileName
                                ? productData[attrId].fileName
                                : productData[attrId] || '-'
                            return (
                              <Box key={attrId} sx={{ mb: 1 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {attr.name}
                                </Typography>
                                <Typography variant="body2" fontWeight={500} noWrap>
                                  {value}
                                </Typography>
                              </Box>
                            )
                          })}
                        </Box>
                      </Box>
                      {sortedAttributes.length > 3 && (
                        <>
                          <Divider sx={{ my: 1.5 }} />
                          <Grid container spacing={1.5}>
                            {sortedAttributes.slice(3).map((attr) => {
                              const attrId = attr._id || attr.id
                              const productData = getProductAttributes(product)
                              const value =
                                attr.type === 'image-gallery' && Array.isArray(productData[attrId])
                                  ? `${productData[attrId].length} ảnh`
                                  : attr.type === 'file' && productData[attrId]?.fileName
                                  ? productData[attrId].fileName
                                  : productData[attrId] || '-'
                              return (
                                <Grid item xs={6} key={attrId}>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    {attr.name}
                                  </Typography>
                                  <Typography variant="body2" fontWeight={500} noWrap>
                                    {value}
                                  </Typography>
                                </Grid>
                              )
                            })}
                          </Grid>
                        </>
                      )}
                      <Divider sx={{ my: 1.5 }} />
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleOpenDialog(product)}
                          fullWidth
                        >
                          Sửa
                        </Button>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDelete(productId)}
                          sx={{ border: '1px solid', borderColor: 'error.main' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                )
              })}
            </Box>
          ) : (
            // Desktop Table View
            <TableContainer
              component={Paper}
              sx={{
                flex: 1,
                overflowX: 'auto',
                '&::-webkit-scrollbar': {
                  height: 8,
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderRadius: 4,
                },
              }}
            >
              <Table stickyHeader sx={{ minWidth: 600 }}>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" sx={{ width: 50 }}>
                      <Checkbox
                        indeterminate={selectedProducts.length > 0 && selectedProducts.length < paginationData.currentProducts.length}
                        checked={selectAll && paginationData.currentProducts.length > 0}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, width: { xs: '40px', sm: '50px' }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      STT
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        width: { xs: '60px', sm: '100px' },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        display: { xs: 'none', sm: 'table-cell' },
                      }}
                    >
                      Hình ảnh
                    </TableCell>
                    {sortedAttributes.map((attr) => (
                      <TableCell
                        key={attr._id || attr.id}
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          minWidth: { xs: 100, sm: 120 },
                        }}
                      >
                        {attr.name}
                      </TableCell>
                    ))}
                    <TableCell sx={{ fontWeight: 600, width: { xs: '80px', sm: '120px' } }} align="center">
                      Hành động
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginationData.currentProducts.map((product, index) => {
                    const productId = product._id || product.id
                    const imageInfo = findImageAttribute(product)
                    return (
                      <TableRow key={productId} hover>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedProducts.includes(productId)}
                            onChange={() => handleSelectProduct(productId)}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {paginationData.startIndex + index + 1}
                        </TableCell>
                        <TableCell
                          sx={{
                            display: { xs: 'none', sm: 'table-cell' },
                          }}
                        >
                          {imageInfo && imageInfo.imageData?.data ? (
                            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                              <Box
                                sx={{
                                  width: { xs: 50, sm: 60 },
                                  height: { xs: 50, sm: 60 },
                                  borderRadius: 1,
                                  overflow: 'hidden',
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  bgcolor: 'grey.100',
                                  flexShrink: 0,
                                }}
                              >
                                <img
                                  src={imageInfo.imageData.data}
                                  alt={imageInfo.imageData.fileName || 'Product image'}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                  }}
                                />
                              </Box>
                              {imageInfo.isGallery && imageInfo.gallery && imageInfo.gallery.length > 1 && (
                                <Chip
                                  label={`+${imageInfo.gallery.length - 1}`}
                                  size="small"
                                  color="primary"
                                  sx={{ fontSize: '0.7rem', height: 24 }}
                                />
                              )}
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                width: 60,
                                height: 60,
                                borderRadius: 1,
                                border: '1px dashed',
                                borderColor: 'divider',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'grey.50',
                              }}
                            >
                              <ImageIcon sx={{ color: 'text.disabled', fontSize: 24 }} />
                            </Box>
                          )}
                        </TableCell>
                        {sortedAttributes.map((attr) => {
                          const attrId = attr._id || attr.id
                          const productData = getProductAttributes(product)
                          return (
                            <TableCell
                              key={attrId}
                              sx={{
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                maxWidth: { xs: 150, sm: 'none' },
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: { xs: 'nowrap', sm: 'normal' },
                              }}
                            >
                              {attr.type === 'image-gallery' && Array.isArray(productData[attrId])
                                ? `${productData[attrId].length} ảnh`
                                : attr.type === 'file' && productData[attrId]?.fileName
                                ? productData[attrId].fileName
                                : productData[attrId] || '-'}
                            </TableCell>
                          )
                        })}
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handleOpenDialog(product)}
                              aria-label="edit"
                              sx={{ padding: { xs: 0.5, sm: 1 } }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleDelete(productId)}
                              aria-label="delete"
                              sx={{ padding: { xs: 0.5, sm: 1 } }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Pagination */}
          {products.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={paginationData.totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        sx={{
          '& .MuiDialog-paper': {
            m: { xs: 0, sm: 2 },
            maxHeight: { xs: '100vh', sm: '90vh' },
          },
        }}
      >
        <DialogTitle>
          {editingId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {sortedAttributes.map((attr) => (
              <Box key={attr._id || attr.id}>{renderFormField(attr)}</Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
            Hủy
          </Button>
          <Button onClick={handleSave} variant="contained" startIcon={<SaveIcon />} disabled={productsLoading}>
            {productsLoading ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Download Selected Dialog */}
      <Dialog
        open={openDownloadDialog}
        onClose={() => setOpenDownloadDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Tải xuống sản phẩm đã chọn</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Bạn đã chọn <strong>{selectedProducts.length}</strong> sản phẩm để tải xuống.
            Chỉ các thuộc tính loại text sẽ được xuất ra CSV.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            File CSV sẽ chứa các thuộc tính: {sortedAttributes
              .filter((attr) => ['text', 'number', 'email', 'textarea', 'select'].includes(attr.type))
              .map((attr) => attr.name)
              .join(', ')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDownloadDialog(false)}>
            Hủy
          </Button>
          <Button onClick={handleDownloadSelected} variant="contained" startIcon={<DownloadIcon />}>
            Tải xuống
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

export default ProductsList
