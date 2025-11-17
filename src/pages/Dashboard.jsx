import { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  LinearProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  LocalOffer as LocalOfferIcon,
  LocalShipping as LocalShippingIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  ArrowForward as ArrowForwardIcon,
  AttachMoney as AttachMoneyIcon,
  CalendarToday as CalendarTodayIcon,
  History as HistoryIcon,
  Person as PersonIcon,
} from '@mui/icons-material'
// Temporarily commented out for deployment
// import {
//   LineChart,
//   Line,
//   AreaChart,
//   Area,
//   BarChart,
//   Bar,
//   PieChart,
//   Pie,
//   Cell,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from 'recharts'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { productsAPI, ordersAPI, promotionsAPI } from '../services/api'
import CircularProgress from '@mui/material/CircularProgress'

function Dashboard() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const dispatch = useDispatch()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { logs: activityLogs, loading: logsLoading } = useSelector((state) => state.activityLogs)
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenueToday: 0,
    revenue30Days: 0,
    promotions: 0,
    shipping: 0,
  })
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [promotions, setPromotions] = useState([])

  useEffect(() => {
    // Load activity logs
    dispatch({ type: 'GET_ACTIVITY_LOGS_REQUEST', payload: { limit: 20 } })
  }, [dispatch])

  useEffect(() => {
    // Load statistics from API
    const loadStats = async () => {
      if (!user) return

      setLoading(true)
      try {
        // Load all data in parallel
        const [productsRes, ordersRes, promotionsRes] = await Promise.all([
          productsAPI.getProducts({ page: 1, limit: 1 }),
          ordersAPI.getOrders({ page: 1, limit: 1000 }),
          promotionsAPI.getPromotions(),
        ])

        const productsData = productsRes.data.products || []
        const ordersData = ordersRes.data.orders || []
        const promotionsData = promotionsRes.data || []

        setProducts(productsData)
        setOrders(ordersData)
        setPromotions(promotionsData)

        // Calculate revenue for today
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayStr = today.toISOString().split('T')[0]

        const revenueToday = ordersData
          .filter((order) => {
            if (!order.createdAt) return false
            const orderDate = new Date(order.createdAt).toISOString().split('T')[0]
            return orderDate === todayStr
          })
          .reduce((sum, order) => {
            const total = parseFloat(order.total || order.totalAmount || 0)
            return sum + (isNaN(total) ? 0 : total)
          }, 0)

        // Calculate revenue for last 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        thirtyDaysAgo.setHours(0, 0, 0, 0)

        const revenue30Days = ordersData
          .filter((order) => {
            if (!order.createdAt) return false
            const orderDate = new Date(order.createdAt)
            return orderDate >= thirtyDaysAgo
          })
          .reduce((sum, order) => {
            const total = parseFloat(order.total || order.totalAmount || 0)
            return sum + (isNaN(total) ? 0 : total)
          }, 0)

        setStats({
          products: productsRes.data.total || 0,
          orders: ordersRes.data.total || 0,
          revenueToday,
          revenue30Days,
          promotions: promotionsData.length || 0,
          shipping: 0, // TODO: Add shipping API if available
        })
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [user])

  const statCards = useMemo(
    () => [
      {
        title: 'Tổng sản phẩm',
        value: stats.products,
        icon: <InventoryIcon />,
        color: '#1976d2',
        path: '/products/list',
        format: (val) => val.toLocaleString(),
      },
      {
        title: 'Tổng đơn hàng',
        value: stats.orders,
        icon: <ShoppingCartIcon />,
        color: '#2e7d32',
        path: '/orders',
        format: (val) => val.toLocaleString(),
      },
      {
        title: 'Doanh thu hôm nay',
        value: stats.revenueToday,
        icon: <AttachMoneyIcon />,
        color: '#ed6c02',
        path: '/orders',
        format: (val) => `${(val / 1000).toFixed(0)}K VNĐ`,
      },
      {
        title: 'Doanh thu 30 ngày',
        value: stats.revenue30Days,
        icon: <CalendarTodayIcon />,
        color: '#9c27b0',
        path: '/orders',
        format: (val) => {
          if (val >= 1000000) {
            return `${(val / 1000000).toFixed(1)}M VNĐ`
          }
          return `${(val / 1000).toFixed(0)}K VNĐ`
        },
      },
    ],
    [stats]
  )

  const recentOrders = useMemo(() => {
    return orders
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5)
  }, [orders])

  // Chart data - Orders over time (last 7 days)
  const ordersChartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      const dateStr = date.toISOString().split('T')[0]
      return {
        name: date.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric' }),
        date: dateStr,
        orders: orders.filter(
          (order) => order.createdAt && order.createdAt.split('T')[0] === dateStr
        ).length,
      }
    })
    return last7Days
  }, [orders])

  // Products by category (mock data based on attributes)
  const productsByCategory = useMemo(() => {
    // TODO: Load productAttributes from API when needed
    const attributes = []
    
    // Count products by first selection attribute if exists
    const categoryCounts = {}
    attributes
      .filter((attr) => attr.type === 'selection')
      .forEach((attr) => {
        if (attr.options) {
          attr.options.forEach((option) => {
            categoryCounts[option] = 0
          })
        }
      })

    products.forEach((product) => {
      attributes.forEach((attr) => {
        if (attr.type === 'selection' && product.attributes?.[attr.id]) {
          const value = product.attributes[attr.id]
          if (categoryCounts[value] !== undefined) {
            categoryCounts[value]++
          }
        }
      })
    })

    return Object.entries(categoryCounts)
      .map(([name, value]) => ({ name, value }))
      .filter((item) => item.value > 0)
      .slice(0, 5)
  }, [products])

  // Status distribution for orders
  const orderStatusData = useMemo(() => {
    const statusCounts = {}
    orders.forEach((order) => {
      const status = order.status || 'Chờ'
      statusCounts[status] = (statusCounts[status] || 0) + 1
    })
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
  }, [orders])

  // Monthly revenue trend (mock data)
  const revenueData = useMemo(() => {
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6']
    return months.map((month, index) => ({
      name: month,
      revenue: Math.floor(Math.random() * 5000000) + 1000000,
      orders: Math.floor(Math.random() * 50) + 10,
    }))
  }, [])

  const COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#00bcd4', '#ff9800']

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Chào buổi sáng'
    if (hour < 18) return 'Chào buổi chiều'
    return 'Chào buổi tối'
  }

  return (
    <Container maxWidth="xl" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 2, md: 4 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              fontWeight={600}
              sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}
            >
              {getGreeting()}, {user?.name || 'Người dùng'}! 👋
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              Đây là tổng quan về hệ thống của bạn
            </Typography>
          </Box>
          <Avatar
            sx={{
              width: { xs: 48, sm: 56, md: 64 },
              height: { xs: 48, sm: 56, md: 64 },
              bgcolor: 'primary.main',
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, md: 4 } }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`,
                border: `1px solid ${stat.color}30`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                  borderColor: stat.color,
                },
              }}
              onClick={() => navigate(stat.path)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: `${stat.color}20`,
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <IconButton size="small" sx={{ color: stat.color }}>
                    <ArrowForwardIcon />
                  </IconButton>
                </Box>
                <Typography
                  variant="h3"
                  component="div"
                  fontWeight={700}
                  color={stat.color}
                  gutterBottom
                  sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem', md: '3rem' } }}
                >
                  {stat.format ? stat.format(stat.value) : stat.value.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Additional Stats */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, md: 4 } }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #ff980015 0%, #ff980005 100%)',
              border: '1px solid #ff980030',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LocalOfferIcon sx={{ color: '#ff9800' }} />
                <Typography variant="h5" fontWeight={700} color="#ff9800">
                  {stats.promotions}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Khuyến mãi
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #00bcd415 0%, #00bcd405 100%)',
              border: '1px solid #00bcd430',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LocalShippingIcon sx={{ color: '#00bcd4' }} />
                <Typography variant="h5" fontWeight={700} color="#00bcd4">
                  {stats.shipping}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Phương thức vận chuyển
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <Card
            sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #4caf5015 0%, #4caf5005 100%)',
              border: '1px solid #4caf5030',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h5" fontWeight={700} color="#4caf50" gutterBottom>
                    Hệ thống hoạt động tốt
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tất cả các module đã được cấu hình và sẵn sàng sử dụng
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 48, color: '#4caf50' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Content Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ flex: 1 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                  Đơn hàng gần đây
                </Typography>
                <Chip
                  label="Xem tất cả"
                  size="small"
                  clickable
                  onClick={() => navigate('/orders')}
                  icon={<ArrowForwardIcon />}
                />
              </Box>
              {recentOrders.length > 0 ? (
                <List>
                  {recentOrders.map((order, index) => (
                    <Box key={order.id || index}>
                      <ListItem
                        sx={{
                          px: 0,
                          py: 1.5,
                          '&:hover': {
                            bgcolor: 'action.hover',
                            borderRadius: 1,
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <ShoppingCartIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1" fontWeight={600}>
                                {order.orderNumber || order.id || `Đơn hàng #${index + 1}`}
                              </Typography>
                              <Chip
                                label={order.status || 'Mới'}
                                size="small"
                                color={
                                  order.status === 'Hoàn thành'
                                    ? 'success'
                                    : order.status === 'Đang xử lý'
                                    ? 'warning'
                                    : 'default'
                                }
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <ScheduleIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {order.createdAt
                                  ? new Date(order.createdAt).toLocaleDateString('vi-VN')
                                  : 'Chưa có ngày'}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < recentOrders.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              ) : (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 4,
                  }}
                >
                  <ShoppingCartIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Chưa có đơn hàng nào
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Thống kê nhanh
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Sản phẩm
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {stats.products}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((stats.products / 100) * 100, 100)}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Đơn hàng
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {stats.orders}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((stats.orders / 50) * 100, 100)}
                    color="success"
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Doanh thu 30 ngày
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {stats.revenue30Days >= 1000000
                        ? `${(stats.revenue30Days / 1000000).toFixed(1)}M`
                        : `${(stats.revenue30Days / 1000).toFixed(0)}K`}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((stats.revenue30Days / 100000000) * 100, 100)}
                    color="secondary"
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Hành động nhanh
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                <Paper
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => navigate('/products/list')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <InventoryIcon color="primary" />
                    <Typography variant="body2" fontWeight={500}>
                      Thêm sản phẩm mới
                    </Typography>
                  </Box>
                </Paper>
                <Paper
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => navigate('/orders')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AttachMoneyIcon color="primary" />
                    <Typography variant="body2" fontWeight={500}>
                      Xem doanh thu
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mt: { xs: 1, md: 2 } }}>
        {/* Orders Trend Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
              <Typography
                variant="h6"
                gutterBottom
                fontWeight={600}
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                Xu hướng đơn hàng (7 ngày qua)
              </Typography>
              <Box sx={{ width: '100%', height: { xs: 250, sm: 300 }, mt: 2, overflowX: 'auto' }}>
                <ResponsiveContainer>
                  <AreaChart data={ordersChartData}>
                    <defs>
                      <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#1976d2" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="orders"
                      stroke="#1976d2"
                      fillOpacity={1}
                      fill="url(#colorOrders)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Status Pie Chart */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
              <Typography
                variant="h6"
                gutterBottom
                fontWeight={600}
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                Phân bố trạng thái đơn hàng
              </Typography>
              {orderStatusData.length > 0 ? (
                <Box sx={{ width: '100%', height: { xs: 250, sm: 300 }, mt: 2 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 300,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Chưa có dữ liệu đơn hàng
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue Trend */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
              <Typography
                variant="h6"
                gutterBottom
                fontWeight={600}
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                Doanh thu theo tháng
              </Typography>
              <Box sx={{ width: '100%', height: { xs: 250, sm: 300 }, mt: 2, overflowX: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Biểu đồ tạm thời bị tắt để deploy
                </Typography>
                {/* Temporarily commented out for deployment
                <ResponsiveContainer>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${(value / 1000000).toFixed(1)}M VNĐ`} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#2e7d32" name="Doanh thu" />
                  </BarChart>
                </ResponsiveContainer>
                */}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Orders vs Revenue */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
              <Typography
                variant="h6"
                gutterBottom
                fontWeight={600}
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                Đơn hàng & Doanh thu
              </Typography>
              <Box sx={{ width: '100%', height: { xs: 250, sm: 300 }, mt: 2, overflowX: 'auto' }}>
                <ResponsiveContainer>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="orders"
                      stroke="#ed6c02"
                      name="Số đơn hàng"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#9c27b0"
                      name="Doanh thu (VNĐ)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Products by Category */}
        {productsByCategory.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  fontWeight={600}
                  sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                >
                  Sản phẩm theo danh mục
                </Typography>
                <Box sx={{ width: '100%', height: { xs: 250, sm: 300 }, mt: 2, overflowX: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Biểu đồ tạm thời bị tắt để deploy
                  </Typography>
                  {/* Temporarily commented out for deployment
                  <ResponsiveContainer>
                    <BarChart data={productsByCategory} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#00bcd4" name="Số lượng" />
                    </BarChart>
                  </ResponsiveContainer>
                  */}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Summary Stats Card */}
        <Grid item xs={12} md={productsByCategory.length > 0 ? 6 : 12}>
          <Card
            sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600} sx={{ color: 'white', mb: 3 }}>
                Tổng quan hiệu suất
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
                      {stats.products}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Tổng sản phẩm
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
                      {stats.orders}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Tổng đơn hàng
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
                      {stats.revenueToday >= 1000000
                        ? `${(stats.revenueToday / 1000000).toFixed(1)}M`
                        : `${(stats.revenueToday / 1000).toFixed(0)}K`}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Doanh thu hôm nay
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
                      {stats.revenue30Days >= 1000000
                        ? `${(stats.revenue30Days / 1000000).toFixed(1)}M`
                        : `${(stats.revenue30Days / 1000).toFixed(0)}K`}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Doanh thu 30 ngày
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Activity Logs Section */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <HistoryIcon sx={{ mr: 2, fontSize: 28, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Lịch sử hoạt động
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {logsLoading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <LinearProgress sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Đang tải lịch sử hoạt động...
                  </Typography>
                </Box>
              ) : activityLogs.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Chưa có hoạt động nào được ghi lại.
                  </Typography>
                </Box>
              ) : isMobile ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {activityLogs.map((log) => (
                    <Card key={log._id || log.id} sx={{ border: '1px solid', borderColor: 'divider' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, mr: 1.5, bgcolor: 'primary.main' }}>
                            <PersonIcon fontSize="small" />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {log.user?.name || log.user?.email || 'Người dùng'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {log.user?.email}
                            </Typography>
                          </Box>
                          <Chip
                            label={log.action}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontSize: '0.65rem' }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
                          {log.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {log.createdAt
                            ? new Date(log.createdAt).toLocaleString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Thời gian</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Người dùng</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Hành động</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Mô tả</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>IP Address</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {activityLogs.map((log) => (
                        <TableRow key={log._id || log.id} hover>
                          <TableCell>
                            {log.createdAt
                              ? new Date(log.createdAt).toLocaleString('vi-VN', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ width: 32, height: 32, mr: 1.5, bgcolor: 'primary.main' }}>
                                <PersonIcon fontSize="small" />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {log.user?.name || log.user?.email || 'Người dùng'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {log.user?.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip label={log.action} size="small" color="primary" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{log.description}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {log.ipAddress || '-'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Dashboard

