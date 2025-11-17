import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Pagination,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Divider,
  useTheme,
  useMediaQuery,
  Checkbox,
  Tooltip,
} from '@mui/material'
import {
  Visibility as VisibilityIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Print as PrintIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  Today as TodayIcon,
  CalendarToday as CalendarTodayIcon,
  TrendingUp as TrendingUpIcon,
  Cancel as CancelStatusIcon,
} from '@mui/icons-material'
import { ordersAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Toast from '../components/Toast'
import CircularProgress from '@mui/material/CircularProgress'

function Orders() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all') // 'all', 'today', 'last7days'
  const [searchTerm, setSearchTerm] = useState('')
  const [invoiceTemplate, setInvoiceTemplate] = useState('default')
  const [selectedOrders, setSelectedOrders] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' })
  const rowsPerPage = 10

  const invoiceTemplates = [
    { value: 'default', label: 'Mẫu mặc định' },
    { value: 'simple', label: 'Mẫu đơn giản' },
    { value: 'detailed', label: 'Mẫu chi tiết' },
  ]

  // Load orders from API
  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return

      setLoading(true)
      try {
        const response = await ordersAPI.getOrders({
          page,
          limit: 1000, // Get all orders for filtering
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: searchTerm || undefined,
        })
        setOrders(response.data.orders || [])
        setTotalPages(response.data.totalPages || 1)
        setTotal(response.data.total || 0)
      } catch (error) {
        setToast({
          open: true,
          message: error.formattedMessage || 'Lỗi khi tải đơn hàng',
          severity: 'error',
        })
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [user, page, statusFilter, searchTerm])

  // Calculate statistics
  const statistics = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const todayOrders = orders.filter((order) => {
      if (!order.createdAt) return false
      const orderDate = new Date(order.createdAt)
      orderDate.setHours(0, 0, 0, 0)
      return orderDate.getTime() === today.getTime()
    })

    const last7DaysOrders = orders.filter((order) => {
      if (!order.createdAt) return false
      const orderDate = new Date(order.createdAt)
      return orderDate >= sevenDaysAgo
    })

    const successfulOrders = orders.filter((order) => order.status === 'shipped' || order.status === 'Đã vận chuyển')
    const failedOrders = orders.filter((order) => order.status === 'cancelled' || order.status === 'Hủy bỏ')

    return {
      total: orders.length,
      today: todayOrders.length,
      last7Days: last7DaysOrders.length,
      successful: successfulOrders.length,
      failed: failedOrders.length,
    }
  }, [orders])

  // Filter orders
  const filteredOrders = useMemo(() => {
    let filtered = [...orders]

    // Filter by date
    if (dateFilter === 'today') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      filtered = filtered.filter((order) => {
        if (!order.createdAt) return false
        const orderDate = new Date(order.createdAt)
        orderDate.setHours(0, 0, 0, 0)
        return orderDate.getTime() === today.getTime()
      })
    } else if (dateFilter === 'last7days') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const sevenDaysAgo = new Date(today)
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      filtered = filtered.filter((order) => {
        if (!order.createdAt) return false
        const orderDate = new Date(order.createdAt)
        return orderDate >= sevenDaysAgo
      })
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => (order.status || 'pending') === statusFilter)
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (order) =>
          (order.orderNumber || order.id || '').toLowerCase().includes(searchLower) ||
          (order.customerName || '').toLowerCase().includes(searchLower) ||
          (order.customerPhone || '').toLowerCase().includes(searchLower) ||
          (order.customerEmail || '').toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }, [orders, statusFilter, searchTerm, dateFilter])

  // Memoize pagination calculations
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredOrders.length / rowsPerPage)
    const startIndex = (page - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    const currentOrders = filteredOrders.slice(startIndex, endIndex)
    return { totalPages, startIndex, endIndex, currentOrders }
  }, [filteredOrders, page, rowsPerPage])

  const handlePageChange = useCallback((event, value) => {
    setPage(value)
  }, [])

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedOrder(null)
  }

  const statusOptions = [
    { value: 'pending', label: 'Chờ', color: 'warning' },
    { value: 'processing', label: 'Đang xử lý', color: 'info' },
    { value: 'shipped', label: 'Đã vận chuyển', color: 'primary' },
    { value: 'cancelled', label: 'Hủy bỏ', color: 'error' },
  ]

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find((opt) => opt.value === status)
    return statusOption ? statusOption.color : 'default'
  }

  const getStatusLabel = (status) => {
    const statusOption = statusOptions.find((opt) => opt.value === status)
    return statusOption ? statusOption.label : status || 'Chờ'
  }

  const handleStatusChange = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      )
    )
  }

  const handleDeleteOrder = (orderId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
      setOrders((prev) => prev.filter((order) => order.id !== orderId))
      setSelectedOrders((prev) => prev.filter((id) => id !== orderId))
      if (selectedOrder && selectedOrder.id === orderId) {
        handleCloseDialog()
      }
    }
  }

  const handleDeleteSelectedOrders = () => {
    if (selectedOrders.length === 0) {
      alert('Vui lòng chọn ít nhất một đơn hàng để xóa')
      return
    }

    const confirmMessage =
      selectedOrders.length === 1
        ? 'Bạn có chắc chắn muốn xóa đơn hàng này?'
        : `Bạn có chắc chắn muốn xóa ${selectedOrders.length} đơn hàng đã chọn?`

    if (window.confirm(confirmMessage)) {
      setOrders((prev) => prev.filter((order) => !selectedOrders.includes(order.id)))
      
      // Close dialog if selected order is being deleted
      if (selectedOrder && selectedOrders.includes(selectedOrder.id)) {
        handleCloseDialog()
      }
      
      // Reset selection
      setSelectedOrders([])
      setSelectAll(false)
    }
  }

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value)
    setPage(1) // Reset to first page when filter changes
    setSelectedOrders([]) // Reset selection when filter changes
    setSelectAll(false)
  }

  const handleDateFilterChange = (filter) => {
    setDateFilter(filter)
    setPage(1)
    setSelectedOrders([])
    setSelectAll(false)
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setPage(1) // Reset to first page when search changes
    setSelectedOrders([]) // Reset selection when search changes
    setSelectAll(false)
  }

  // Reset selection when page changes
  useEffect(() => {
    setSelectedOrders([])
    setSelectAll(false)
  }, [page])

  const handleSelectOrder = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    )
  }

  const handleSelectAll = () => {
    if (selectAll || (selectedOrders.length === paginationData.currentOrders.length && selectedOrders.length > 0)) {
      // Unselect all current page orders
      const currentPageOrderIds = paginationData.currentOrders.map((order) => order.id)
      setSelectedOrders((prev) => prev.filter((id) => !currentPageOrderIds.includes(id)))
      setSelectAll(false)
    } else {
      // Select all current page orders
      const currentPageOrderIds = paginationData.currentOrders.map((order) => order.id)
      setSelectedOrders((prev) => {
        const newSelection = [...prev]
        currentPageOrderIds.forEach((id) => {
          if (!newSelection.includes(id)) {
            newSelection.push(id)
          }
        })
        return newSelection
      })
      setSelectAll(true)
    }
  }

  // Update selectAll state based on current selection
  useEffect(() => {
    const currentPageOrderIds = paginationData.currentOrders.map((order) => order.id)
    const allSelected = currentPageOrderIds.length > 0 && currentPageOrderIds.every((id) => selectedOrders.includes(id))
    setSelectAll(allSelected)
  }, [selectedOrders, paginationData.currentOrders])

  const handlePrintSelectedInvoices = () => {
    if (selectedOrders.length === 0) {
      alert('Vui lòng chọn ít nhất một đơn hàng để in hóa đơn')
      return
    }

    const ordersToPrint = orders.filter((order) => selectedOrders.includes(order.id))
    
    if (ordersToPrint.length === 1) {
      // In một hóa đơn
      handlePrintInvoice(ordersToPrint[0])
    } else {
      // In nhiều hóa đơn
      ordersToPrint.forEach((order, index) => {
        setTimeout(() => {
          const printWindow = window.open('', '_blank')
          const invoiceContent = generateInvoiceHTML(order, invoiceTemplate)
          
          printWindow.document.write(invoiceContent)
          printWindow.document.close()
          printWindow.focus()
          
          setTimeout(() => {
            printWindow.print()
          }, 250)
        }, index * 500) // Delay để tránh popup blocker
      })
    }
  }

  const handlePrintInvoice = (order = null) => {
    const orderToPrint = order || selectedOrder
    if (!orderToPrint) return

    const printWindow = window.open('', '_blank')
    const invoiceContent = generateInvoiceHTML(orderToPrint, invoiceTemplate)
    
    printWindow.document.write(invoiceContent)
    printWindow.document.close()
    printWindow.focus()
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  const generateInvoiceHTML = (order, template) => {
    const orderDate = order.createdAt
      ? new Date(order.createdAt).toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : new Date().toLocaleDateString('vi-VN')

    const statusLabel = getStatusLabel(order.status || 'pending')

    let templateStyle = ''
    if (template === 'simple') {
      templateStyle = `
        body { font-family: Arial, sans-serif; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .info { margin-bottom: 20px; }
        .items { margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        .total { text-align: right; font-weight: bold; margin-top: 20px; }
      `
    } else if (template === 'detailed') {
      templateStyle = `
        body { font-family: 'Times New Roman', serif; padding: 30px; max-width: 800px; margin: 0 auto; }
        .header { border-bottom: 3px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
        .company-info { float: right; text-align: right; }
        .info { margin: 15px 0; padding: 10px; background: #f5f5f5; }
        .items { margin: 30px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #333; color: white; padding: 12px; text-align: left; }
        td { padding: 10px; border-bottom: 1px solid #ddd; }
        .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 30px; padding-top: 20px; border-top: 2px solid #000; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
      `
    } else {
      templateStyle = `
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #1976d2; padding-bottom: 20px; }
        .header h1 { color: #1976d2; margin: 0; }
        .info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
        .info-section { padding: 15px; background: #f8f9fa; border-radius: 5px; }
        .items { margin: 30px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #1976d2; color: white; padding: 12px; text-align: left; }
        td { padding: 12px; border-bottom: 1px solid #e0e0e0; }
        .total { text-align: right; font-size: 20px; font-weight: bold; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 5px; }
        .status { display: inline-block; padding: 5px 15px; border-radius: 20px; background: #1976d2; color: white; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e0e0e0; padding-top: 20px; }
      `
    }

    const itemsHTML = order.items && order.items.length > 0
      ? order.items
          .map(
            (item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.name || '-'}</td>
              <td style="text-align: right;">${item.quantity || 0}</td>
              <td style="text-align: right;">${item.price ? Number(item.price).toLocaleString('vi-VN') : '0'} đ</td>
              <td style="text-align: right; font-weight: bold;">${item.quantity && item.price ? Number(item.quantity * item.price).toLocaleString('vi-VN') : '0'} đ</td>
            </tr>
          `
          )
          .join('')
      : '<tr><td colspan="5" style="text-align: center; padding: 20px;">Không có sản phẩm</td></tr>'

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Hóa đơn ${order.orderNumber || order.id}</title>
          <style>
            ${templateStyle}
            @media print {
              body { margin: 0; padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>HÓA ĐƠN BÁN HÀNG</h1>
            <p>Mã đơn hàng: <strong>${order.orderNumber || order.id}</strong></p>
            <p>Ngày: ${orderDate}</p>
            <p>Trạng thái: <span class="status">${statusLabel}</span></p>
          </div>

          <div class="info">
            <div class="info-section">
              <h3>Thông tin khách hàng</h3>
              <p><strong>Tên:</strong> ${order.customerName || '-'}</p>
              <p><strong>Email:</strong> ${order.customerEmail || '-'}</p>
              <p><strong>Điện thoại:</strong> ${order.customerPhone || '-'}</p>
            </div>
          </div>

          <div class="items">
            <h3>Chi tiết sản phẩm</h3>
            <table>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên sản phẩm</th>
                  <th style="text-align: right;">Số lượng</th>
                  <th style="text-align: right;">Đơn giá</th>
                  <th style="text-align: right;">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>
          </div>

          <div class="total">
            <p>Tổng cộng: <strong>${order.totalAmount ? Number(order.totalAmount).toLocaleString('vi-VN') : '0'} đ</strong></p>
          </div>

          <div class="footer">
            <p>Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!</p>
            <p>Hóa đơn được tạo tự động từ hệ thống</p>
          </div>
        </body>
      </html>
    `
  }

  // Mock data if empty
  if (orders.length === 0) {
    const mockOrders = [
      {
        id: 'order-1',
        orderNumber: 'ORD-001',
        customerName: 'Nguyễn Văn A',
        customerEmail: 'nguyenvana@example.com',
        customerPhone: '0123456789',
        totalAmount: 500000,
        status: 'pending',
        createdAt: new Date().toISOString(),
        items: [
          { name: 'Sản phẩm 1', quantity: 2, price: 250000 },
        ],
      },
    ]
    setOrders(mockOrders)
  }

  return (
    <Container maxWidth="xl" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Quản lý Đơn hàng
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Xem và quản lý tất cả đơn hàng
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
                    Tổng đơn hàng
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
                    Đơn hôm nay
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
                    Gửi thành công
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    {statistics.successful}
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
                    Thất bại
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    {statistics.failed}
                  </Typography>
                </Box>
                <CancelStatusIcon sx={{ fontSize: { xs: 28, sm: 32 }, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Section */}
      <Card sx={{ mb: { xs: 2, md: 3 } }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
          <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
            {/* Date Filter Buttons */}
            <Grid item xs={12} sm={12} md={12}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Button
                  variant={dateFilter === 'all' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => {
                    setDateFilter('all')
                    setPage(1)
                  }}
                  sx={{
                    minWidth: { xs: 'auto', sm: 120 },
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  }}
                >
                  Tất cả
                </Button>
                <Button
                  variant={dateFilter === 'today' ? 'contained' : 'outlined'}
                  size="small"
                  startIcon={<TodayIcon />}
                  onClick={() => {
                    setDateFilter('today')
                    setPage(1)
                  }}
                  sx={{
                    minWidth: { xs: 'auto', sm: 150 },
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  }}
                >
                  Hôm nay ({statistics.today})
                </Button>
                <Button
                  variant={dateFilter === 'last7days' ? 'contained' : 'outlined'}
                  size="small"
                  startIcon={<CalendarTodayIcon />}
                  onClick={() => {
                    setDateFilter('last7days')
                    setPage(1)
                  }}
                  sx={{
                    minWidth: { xs: 'auto', sm: 180 },
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  }}
                >
                  7 ngày trước ({statistics.last7Days})
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Tìm kiếm đơn hàng..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  displayEmpty
                >
                  <MenuItem value="all">Tất cả trạng thái</MenuItem>
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Chip
                        label={option.label}
                        color={option.color}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={12} md={5}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'stretch', sm: 'center' },
                  gap: 1.5,
                  flexWrap: 'wrap',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    flexWrap: 'wrap',
                    flex: 1,
                  }}
                >
                  <Chip
                    label={`Tổng: ${filteredOrders.length}`}
                    size="small"
                    color="default"
                    variant="outlined"
                    sx={{
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      fontWeight: 500,
                    }}
                  />
                  {selectedOrders.length > 0 && (
                    <Chip
                      label={`${selectedOrders.length} đã chọn`}
                      size="small"
                      color="primary"
                      onDelete={() => {
                        setSelectedOrders([])
                        setSelectAll(false)
                      }}
                      sx={{
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        fontWeight: 600,
                      }}
                    />
                  )}
                  {statusFilter !== 'all' && (
                    <Chip
                      label={`Lọc: ${statusOptions.find((opt) => opt.value === statusFilter)?.label || ''}`}
                      size="small"
                      onDelete={() => setStatusFilter('all')}
                      color="primary"
                      variant="outlined"
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                    />
                  )}
                  {searchTerm && (
                    <Chip
                      label={`Tìm: ${searchTerm.length > 10 ? searchTerm.substring(0, 10) + '...' : searchTerm}`}
                      size="small"
                      onDelete={() => setSearchTerm('')}
                      color="primary"
                      variant="outlined"
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                    />
                  )}
                </Box>
                {selectedOrders.length > 0 && (
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      alignItems: 'center',
                      flexWrap: { xs: 'wrap', sm: 'nowrap' },
                    }}
                  >
                    <Tooltip title="In hóa đơn cho các đơn hàng đã chọn">
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<PrintIcon />}
                        onClick={handlePrintSelectedInvoices}
                        color="primary"
                        sx={{
                          minWidth: { xs: 'auto', sm: 130 },
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          px: { xs: 1.5, sm: 2 },
                          boxShadow: 1,
                          '&:hover': {
                            boxShadow: 3,
                          },
                        }}
                      >
                        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                          In hóa đơn
                        </Box>
                        <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                          In
                        </Box>
                      </Button>
                    </Tooltip>
                    <Tooltip title="Xóa các đơn hàng đã chọn">
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={handleDeleteSelectedOrders}
                        color="error"
                        sx={{
                          minWidth: { xs: 'auto', sm: 130 },
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          px: { xs: 1.5, sm: 2 },
                          boxShadow: 1,
                          '&:hover': {
                            boxShadow: 3,
                            bgcolor: 'error.dark',
                          },
                        }}
                      >
                        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                          Xóa đơn hàng
                        </Box>
                        <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                          Xóa
                        </Box>
                      </Button>
                    </Tooltip>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
          {paginationData.currentOrders.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Chưa có đơn hàng nào.
              </Typography>
            </Box>
          ) : isMobile ? (
            // Mobile Card View
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {paginationData.currentOrders.map((order) => (
                <Card
                  key={order.id}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      boxShadow: 2,
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                          {order.orderNumber || order.id}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString('vi-VN')
                            : '-'}
                        </Typography>
                      </Box>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={order.status || 'pending'}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          renderValue={(value) => (
                            <Chip
                              label={getStatusLabel(value)}
                              color={getStatusColor(value)}
                              size="small"
                              sx={{ height: 24, fontSize: '0.75rem' }}
                            />
                          )}
                        >
                          {statusOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              <Chip
                                label={option.label}
                                color={option.color}
                                size="small"
                                sx={{ mr: 1 }}
                              />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Grid container spacing={1.5} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Khách hàng
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {order.customerName || '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Điện thoại
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {order.customerPhone || '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">
                          Tổng tiền
                        </Typography>
                        <Typography variant="h6" color="primary" fontWeight={600}>
                          {order.totalAmount
                            ? `${Number(order.totalAmount).toLocaleString('vi-VN')} đ`
                            : '-'}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 1.5 }} />

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
                      <Checkbox
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                        size="small"
                        icon={<CheckBoxOutlineBlankIcon />}
                        checkedIcon={<CheckBoxIcon />}
                      />
                      <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewOrder(order)}
                          fullWidth
                        >
                          Xem chi tiết
                        </Button>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDeleteOrder(order.id)}
                          sx={{ border: '1px solid', borderColor: 'error.main' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            // Desktop Table View
            <TableContainer
              sx={{
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
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" sx={{ width: 48 }}>
                      <Checkbox
                        checked={selectAll && paginationData.currentOrders.length > 0}
                        indeterminate={
                          selectedOrders.length > 0 &&
                          selectedOrders.length < paginationData.currentOrders.length
                        }
                        onChange={handleSelectAll}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Mã đơn hàng
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Khách hàng
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        display: { xs: 'none', md: 'table-cell' },
                      }}
                    >
                      Số điện thoại
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Tổng tiền
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Trạng thái
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        display: { xs: 'none', md: 'table-cell' },
                      }}
                    >
                      Ngày tạo
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, width: { xs: '80px', sm: '100px' } }} align="center">
                      Hành động
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginationData.currentOrders.map((order) => (
                    <TableRow key={order.id} hover selected={selectedOrders.includes(order.id)}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => handleSelectOrder(order.id)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {order.orderNumber || order.id}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {order.customerName || '-'}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          display: { xs: 'none', md: 'table-cell' },
                        }}
                      >
                        {order.customerPhone || '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {order.totalAmount
                          ? `${Number(order.totalAmount).toLocaleString('vi-VN')} đ`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: { xs: 120, sm: 150 } }}>
                          <Select
                            value={order.status || 'pending'}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            sx={{
                              '& .MuiSelect-select': {
                                py: 0.5,
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              },
                            }}
                            renderValue={(value) => (
                              <Chip
                                label={getStatusLabel(value)}
                                color={getStatusColor(value)}
                                size="small"
                                sx={{ height: 24, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                              />
                            )}
                          >
                            {statusOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                <Chip
                                  label={option.label}
                                  color={option.color}
                                  size="small"
                                  sx={{ mr: 1 }}
                                />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          display: { xs: 'none', md: 'table-cell' },
                        }}
                      >
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString('vi-VN')
                          : '-'}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleViewOrder(order)}
                            title="Xem chi tiết"
                            sx={{ padding: { xs: 0.5, sm: 1 } }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDeleteOrder(order.id)}
                            title="Xóa đơn hàng"
                            sx={{ padding: { xs: 0.5, sm: 1 } }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {filteredOrders.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 3,
                pt: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Pagination
                count={paginationData.totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
                sx={{
                  '& .MuiPaginationItem-root': {
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  },
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
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
        <DialogTitle>Chi tiết đơn hàng</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mã đơn hàng
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedOrder.orderNumber || selectedOrder.id}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Trạng thái
                  </Typography>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={selectedOrder.status || 'pending'}
                      onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                      renderValue={(value) => (
                        <Chip
                          label={getStatusLabel(value)}
                          color={getStatusColor(value)}
                          size="small"
                        />
                      )}
                    >
                      {statusOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Chip
                            label={option.label}
                            color={option.color}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tên khách hàng
                  </Typography>
                  <Typography variant="body1">
                    {selectedOrder.customerName || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {selectedOrder.customerEmail || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Số điện thoại
                  </Typography>
                  <Typography variant="body1">
                    {selectedOrder.customerPhone || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tổng tiền
                  </Typography>
                  <Typography variant="body1" fontWeight={600} color="primary">
                    {selectedOrder.totalAmount
                      ? `${Number(selectedOrder.totalAmount).toLocaleString('vi-VN')} đ`
                      : '-'}
                  </Typography>
                </Grid>
                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Sản phẩm
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Tên sản phẩm</TableCell>
                            <TableCell align="right">Số lượng</TableCell>
                            <TableCell align="right">Đơn giá</TableCell>
                            <TableCell align="right">Thành tiền</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedOrder.items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell align="right">{item.quantity}</TableCell>
                              <TableCell align="right">
                                {item.price
                                  ? `${Number(item.price).toLocaleString('vi-VN')} đ`
                                  : '-'}
                              </TableCell>
                              <TableCell align="right">
                                {item.quantity && item.price
                                  ? `${Number(item.quantity * item.price).toLocaleString('vi-VN')} đ`
                                  : '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 2 }, p: { xs: 1.5, sm: 2, md: 3 } }}>
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 180 }, order: { xs: 2, sm: 1 } }}>
            <Select
              value={invoiceTemplate}
              onChange={(e) => setInvoiceTemplate(e.target.value)}
              displayEmpty
              fullWidth
            >
              {invoiceTemplates.map((template) => (
                <MenuItem key={template.value} value={template.value}>
                  {template.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ flex: 1, display: { xs: 'none', sm: 'block' } }} />
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={() => handlePrintInvoice(selectedOrder)}
              color="primary"
              fullWidth={window.innerWidth < 600}
              sx={{ order: { xs: 1, sm: 2 } }}
            >
              In hóa đơn
            </Button>
          <Button
            onClick={handleCloseDialog}
            fullWidth={window.innerWidth < 600}
            sx={{ order: { xs: 3, sm: 3 } }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default Orders

