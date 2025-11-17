import { useState, useEffect, useMemo, useCallback } from 'react'
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
  Alert,
  Chip,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
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
  UploadFile as UploadFileIcon,
  Download as DownloadIcon,
  Image as ImageIcon,
} from '@mui/icons-material'
import * as XLSX from 'xlsx'
import Toast from '../components/Toast'

function ProductsList() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [attributes, setAttributes] = useState([])
  const [products, setProducts] = useState(
    JSON.parse(localStorage.getItem('products') || '[]')
  )
  const [page, setPage] = useState(1)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' })
  const rowsPerPage = 10

  useEffect(() => {
    const attrs = JSON.parse(localStorage.getItem('productAttributes') || '[]')
    setAttributes(attrs.sort((a, b) => (a.order || 0) - (b.order || 0)))
  }, [])

  // Debounced save to localStorage
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem('products', JSON.stringify(products))
      } catch (error) {
        console.error('Error saving products to localStorage:', error)
      }
    }, 300) // Debounce 300ms

    return () => clearTimeout(timeoutId)
  }, [products])

  // Memoize pagination calculations
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(products.length / rowsPerPage)
    const startIndex = (page - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    const currentProducts = products.slice(startIndex, endIndex)
    return { totalPages, startIndex, endIndex, currentProducts }
  }, [products, page, rowsPerPage])

  const handlePageChange = useCallback((event, value) => {
    setPage(value)
  }, [])

  const handleInputChange = (e, attributeId) => {
    const { name, value, files } = e.target
    const newFormData = { ...formData }
    const attribute = attributes.find((attr) => attr.id === attributeId)

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
      if (attr.required) {
        if (attr.type === 'image-gallery') {
          const galleryData = formData[attr.id]
          if (!galleryData || !Array.isArray(galleryData) || galleryData.length === 0) {
            newErrors[attr.id] = `${attr.name} là bắt buộc (ít nhất 1 ảnh)`
          }
        } else if (!formData[attr.id]) {
          newErrors[attr.id] = `${attr.name} là bắt buộc`
        }
      }
      if (attr.type === 'email' && formData[attr.id]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData[attr.id])) {
          newErrors[attr.id] = 'Email không hợp lệ'
        }
      }
      if (attr.type === 'number' && formData[attr.id]) {
        if (isNaN(Number(formData[attr.id]))) {
          newErrors[attr.id] = 'Giá trị phải là số'
        }
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingId(product.id)
      setFormData(product.data || {})
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

    if (editingId) {
      setProducts((prev) =>
        prev.map((product) =>
          product.id === editingId
            ? { ...product, data: formData, updatedAt: new Date().toISOString() }
            : product
        )
      )
      setToast({
        open: true,
        message: 'Cập nhật sản phẩm thành công!',
        severity: 'success',
      })
    } else {
      const newProduct = {
        id: `product-${Date.now()}`,
        data: formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setProducts((prev) => [...prev, newProduct])
      setToast({
        open: true,
        message: 'Thêm sản phẩm thành công!',
        severity: 'success',
      })
    }

    handleCloseDialog()
    setTimeout(() => setToast({ ...toast, open: false }), 3000)
    setPage(1)
  }

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      setProducts((prev) => prev.filter((product) => product.id !== id))
      setToast({
        open: true,
        message: 'Xóa sản phẩm thành công!',
        severity: 'success',
      })
      setTimeout(() => setToast({ ...toast, open: false }), 3000)
      const newTotalPages = Math.ceil((products.length - 1) / rowsPerPage)
      if (page > newTotalPages && newTotalPages > 0) {
        setPage(newTotalPages)
      }
    }
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
          alert('File CSV không có dữ liệu')
          return
        }

        // Map CSV columns to attributes
        const newProducts = jsonData.map((row) => {
          const productData = {}
          attributes.forEach((attr) => {
            const columnName = attr.name
            if (row[columnName] !== undefined) {
              productData[attr.id] = String(row[columnName])
            }
          })

          return {
            id: `product-${Date.now()}-${Math.random()}`,
            data: productData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        })

        setProducts((prev) => [...prev, ...newProducts])
        setToast({
          open: true,
          message: `Đã import ${newProducts.length} sản phẩm từ CSV!`,
          severity: 'success',
        })
        setTimeout(() => setToast({ ...toast, open: false }), 3000)
        setPage(1)
      } catch (error) {
        console.error('Error reading CSV file:', error)
        alert('Lỗi khi đọc file CSV. Vui lòng kiểm tra lại file.')
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
      setTimeout(() => setToast({ ...toast, open: false }), 3000)
      return
    }

    // Create template data
    const templateData = [
      attributes.reduce((acc, attr) => {
        acc[attr.name] = `Giá trị mẫu cho ${attr.name}`
        return acc
      }, {}),
    ]

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Products')

    // Set column widths
    const colWidths = attributes.map(() => ({ wch: 30 }))
    ws['!cols'] = colWidths

    // Download file
    XLSX.writeFile(wb, 'Mau_San_Pham.csv')
  }

  // Memoize findImageAttribute function
  const findImageAttribute = useCallback(
    (product) => {
      // First, check for image-gallery
      for (const attr of attributes) {
        if (attr.type === 'image-gallery' && product.data[attr.id]) {
          const galleryData = product.data[attr.id]
          if (Array.isArray(galleryData) && galleryData.length > 0) {
            return { attribute: attr, imageData: galleryData[0], isGallery: true, gallery: galleryData }
          }
        }
      }
      // Then check for single file image
      for (const attr of attributes) {
        if (attr.type === 'file' && product.data[attr.id]) {
          const fileData = product.data[attr.id]
          if (fileData.fileType && fileData.fileType.startsWith('image/')) {
            return { attribute: attr, imageData: fileData, isGallery: false }
          }
          if (fileData.data && typeof fileData.data === 'string' && fileData.data.startsWith('data:image/')) {
            return { attribute: attr, imageData: fileData, isGallery: false }
          }
        }
      }
      return null
    },
    [attributes]
  )

  const renderFormField = (attribute) => {
    const value = formData[attribute.id] || ''
    const error = errors[attribute.id]

    switch (attribute.type) {
      case 'text':
        return (
          <TextField
            fullWidth
            label={attribute.name}
            value={value}
            onChange={(e) => handleInputChange(e, attribute.id)}
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
            onChange={(e) => handleInputChange(e, attribute.id)}
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
            onChange={(e) => handleInputChange(e, attribute.id)}
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
            onChange={(e) => handleInputChange(e, attribute.id)}
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
              id={`file-${attribute.id}`}
              type="file"
              onChange={(e) => handleInputChange(e, attribute.id)}
            />
            <label htmlFor={`file-${attribute.id}`}>
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
              id={`gallery-${attribute.id}`}
              type="file"
              multiple
              onChange={(e) => handleInputChange(e, attribute.id)}
            />
            <label htmlFor={`gallery-${attribute.id}`}>
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
                          onClick={() => handleRemoveImage(attribute.id, index)}
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
      case 'selection':
        return (
          <FormControl fullWidth sx={{ mb: 2 }} error={!!error} required={attribute.required}>
            <InputLabel>{attribute.name}</InputLabel>
            <Select
              value={value}
              onChange={(e) => handleInputChange(e, attribute.id)}
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
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                fullWidth
              >
                Thêm sản phẩm
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
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
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadTemplate}
                fullWidth
              >
                Tải mẫu CSV
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Chip
                label={`Tổng: ${products.length} sản phẩm`}
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
          {products.length === 0 ? (
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
                const imageInfo = findImageAttribute(product)
                return (
                  <Card
                    key={product.id}
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
                          {attributes.slice(0, 3).map((attr) => {
                            const value =
                              attr.type === 'image-gallery' && Array.isArray(product.data[attr.id])
                                ? `${product.data[attr.id].length} ảnh`
                                : attr.type === 'file' && product.data[attr.id]?.fileName
                                ? product.data[attr.id].fileName
                                : product.data[attr.id] || '-'
                            return (
                              <Box key={attr.id} sx={{ mb: 1 }}>
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
                      {attributes.length > 3 && (
                        <>
                          <Divider sx={{ my: 1.5 }} />
                          <Grid container spacing={1.5}>
                            {attributes.slice(3).map((attr) => {
                              const value =
                                attr.type === 'image-gallery' && Array.isArray(product.data[attr.id])
                                  ? `${product.data[attr.id].length} ảnh`
                                  : attr.type === 'file' && product.data[attr.id]?.fileName
                                  ? product.data[attr.id].fileName
                                  : product.data[attr.id] || '-'
                              return (
                                <Grid item xs={6} key={attr.id}>
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
                          onClick={() => handleDelete(product.id)}
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
                    {attributes.map((attr) => (
                      <TableCell
                        key={attr.id}
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
                    const imageInfo = findImageAttribute(product)
                    return (
                      <TableRow key={product.id} hover>
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
                        {attributes.map((attr) => (
                          <TableCell
                            key={attr.id}
                            sx={{
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              maxWidth: { xs: 150, sm: 'none' },
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: { xs: 'nowrap', sm: 'normal' },
                            }}
                          >
                            {attr.type === 'image-gallery' && Array.isArray(product.data[attr.id])
                              ? `${product.data[attr.id].length} ảnh`
                              : attr.type === 'file' && product.data[attr.id]?.fileName
                              ? product.data[attr.id].fileName
                              : product.data[attr.id] || '-'}
                          </TableCell>
                        ))}
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
                              onClick={() => handleDelete(product.id)}
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
        fullScreen={window.innerWidth < 600}
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
            {attributes.map((attr) => (
              <Box key={attr.id}>{renderFormField(attr)}</Box>
            ))}
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

export default ProductsList

