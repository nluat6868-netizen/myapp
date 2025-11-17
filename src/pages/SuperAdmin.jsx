import { useState, useEffect, useMemo } from 'react'
import {
  Container,
  Card,
  CardContent,
  Typography,
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
  Button,
  Chip,
  Tabs,
  Tab,
  Divider,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  AdminPanelSettings as AdminPanelSettingsIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  People as PeopleIcon,
  Store as StoreIcon,
  Category as CategoryIcon,
  TrendingUp as TrendingUpIcon,
  Dashboard as DashboardIcon,
  AttachMoney as AttachMoneyIcon,
  PersonAdd as PersonAddIcon,
  ShoppingCart as ShoppingCartIcon,
  Today as TodayIcon,
  CalendarToday as CalendarTodayIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import { superAdminAPI } from '../services/api'
import Toast from '../components/Toast'

function SuperAdmin() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { user } = useAuth()
  const [tabValue, setTabValue] = useState(0)
  const [dashboardData, setDashboardData] = useState(null)
  const [admins, setAdmins] = useState([])
  const [adminStats, setAdminStats] = useState([])
  const [industryReport, setIndustryReport] = useState(null)
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' })
  const [selectedIndustry, setSelectedIndustry] = useState('all')

  // Check if user is superAdmin
  useEffect(() => {
    if (user?.role !== 'superAdmin') {
      setToast({
        open: true,
        message: 'Bạn không có quyền truy cập trang này!',
        severity: 'error',
      })
    }
  }, [user])

  // Load data based on tab
  useEffect(() => {
    const loadData = async () => {
      if (user?.role !== 'superAdmin') return

      setLoading(true)
      try {
        if (tabValue === 0) {
          // Load dashboard stats
          const response = await superAdminAPI.getDashboard()
          setDashboardData(response.data)
        } else if (tabValue === 1) {
          // Load admins list
          const response = await superAdminAPI.getAllAdmins()
          setAdmins(response.data || [])
        } else if (tabValue === 2) {
          // Load admin stats
          const response = await superAdminAPI.getAdminStats()
          setAdminStats(response.data || [])
        } else if (tabValue === 3) {
          // Load industry report
          const response = await superAdminAPI.getIndustryReport()
          setIndustryReport(response.data)
        }
      } catch (error) {
        setToast({
          open: true,
          message: error.formattedMessage || 'Lỗi khi tải dữ liệu',
          severity: 'error',
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [tabValue, user])

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const handleViewAdmin = async (adminId) => {
    try {
      const response = await superAdminAPI.getAdminDetails(adminId)
      setSelectedAdmin(response.data)
      setOpenDialog(true)
    } catch (error) {
      setToast({
        open: true,
        message: error.formattedMessage || 'Lỗi khi tải thông tin admin',
        severity: 'error',
      })
    }
  }

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa admin này?')) return

    try {
      await superAdminAPI.deleteAdmin(adminId)
      setAdmins((prev) => prev.filter((admin) => admin._id !== adminId))
      setAdminStats((prev) => prev.filter((stat) => stat.admin.id !== adminId))
      setToast({
        open: true,
        message: 'Xóa admin thành công!',
        severity: 'success',
      })
      if (selectedAdmin && selectedAdmin.admin._id === adminId) {
        setOpenDialog(false)
      }
    } catch (error) {
      setToast({
        open: true,
        message: error.formattedMessage || 'Lỗi khi xóa admin',
        severity: 'error',
      })
    }
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedAdmin(null)
  }

  if (user?.role !== 'superAdmin') {
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
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          fontWeight={600}
          sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}
        >
          SuperAdmin Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          Quản lý tất cả admin và xem báo cáo ngành hàng
        </Typography>
      </Box>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant={isMobile ? 'scrollable' : 'fullWidth'}>
            <Tab icon={<DashboardIcon />} iconPosition="start" label="Dashboard" />
            <Tab icon={<PeopleIcon />} iconPosition="start" label="Quản lý Admin" />
            <Tab icon={<AssessmentIcon />} iconPosition="start" label="Thống kê Admin" />
            <Tab icon={<BusinessIcon />} iconPosition="start" label="Báo cáo Ngành hàng" />
          </Tabs>
        </Box>

        <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : tabValue === 0 ? (
            // Dashboard Tab
            dashboardData ? (
              <Box>
                {/* Statistics Cards */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  {/* User Registration Stats */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="caption" sx={{ opacity: 0.9, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                              Tổng User
                            </Typography>
                            <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                              {dashboardData.users.total}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <PersonAddIcon sx={{ fontSize: 16, mr: 0.5 }} />
                              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                +{dashboardData.users.newToday} hôm nay
                              </Typography>
                            </Box>
                          </Box>
                          <PeopleIcon sx={{ fontSize: { xs: 28, sm: 32 }, opacity: 0.8 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: 'info.main', color: 'info.contrastText' }}>
                      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="caption" sx={{ opacity: 0.9, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                              User mới (7 ngày)
                            </Typography>
                            <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                              {dashboardData.users.newLast7Days}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.9, mt: 0.5, display: 'block' }}>
                              {dashboardData.users.newLast30Days} (30 ngày)
                            </Typography>
                          </Box>
                          <PersonAddIcon sx={{ fontSize: { xs: 28, sm: 32 }, opacity: 0.8 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  {/* Revenue Stats */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: 'success.main', color: 'success.contrastText' }}>
                      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="caption" sx={{ opacity: 0.9, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                              Doanh thu hôm nay
                            </Typography>
                            <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                              {dashboardData.revenue.today >= 1000000
                                ? `${(dashboardData.revenue.today / 1000000).toFixed(1)}M`
                                : `${(dashboardData.revenue.today / 1000).toFixed(0)}K`}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                {dashboardData.revenue.lastMonth > 0 && (
                                  <>
                                    {dashboardData.revenue.thisMonth >= dashboardData.revenue.lastMonth ? (
                                      <ArrowUpwardIcon sx={{ fontSize: 14 }} />
                                    ) : (
                                      <ArrowDownwardIcon sx={{ fontSize: 14 }} />
                                    )}
                                    {(
                                      ((dashboardData.revenue.thisMonth - dashboardData.revenue.lastMonth) /
                                        dashboardData.revenue.lastMonth) *
                                      100
                                    ).toFixed(1)}
                                    % so với tháng trước
                                  </>
                                )}
                              </Typography>
                            </Box>
                          </Box>
                          <AttachMoneyIcon sx={{ fontSize: { xs: 28, sm: 32 }, opacity: 0.8 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: 'warning.main', color: 'warning.contrastText' }}>
                      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="caption" sx={{ opacity: 0.9, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                              Tổng doanh thu
                            </Typography>
                            <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                              {dashboardData.revenue.total >= 1000000000
                                ? `${(dashboardData.revenue.total / 1000000000).toFixed(2)}B`
                                : dashboardData.revenue.total >= 1000000
                                ? `${(dashboardData.revenue.total / 1000000).toFixed(1)}M`
                                : `${(dashboardData.revenue.total / 1000).toFixed(0)}K`}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.9, mt: 0.5, display: 'block' }}>
                              {dashboardData.revenue.last30Days >= 1000000
                                ? `${(dashboardData.revenue.last30Days / 1000000).toFixed(1)}M`
                                : `${(dashboardData.revenue.last30Days / 1000).toFixed(0)}K`}{' '}
                              (30 ngày)
                            </Typography>
                          </Box>
                          <TrendingUpIcon sx={{ fontSize: { xs: 28, sm: 32 }, opacity: 0.8 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Additional Stats */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <AdminPanelSettingsIcon color="primary" />
                          <Typography variant="h6" fontWeight={600}>
                            Tổng Admin
                          </Typography>
                        </Box>
                        <Typography variant="h4" fontWeight={700} color="primary">
                          {dashboardData.admins.total}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {dashboardData.admins.byIndustry.length} ngành hàng
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <ShoppingCartIcon color="success" />
                          <Typography variant="h6" fontWeight={600}>
                            Tổng đơn hàng
                          </Typography>
                        </Box>
                        <Typography variant="h4" fontWeight={700} color="success.main">
                          {dashboardData.orders.total}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <TodayIcon color="warning" />
                          <Typography variant="h6" fontWeight={600}>
                            User mới tháng này
                          </Typography>
                        </Box>
                        <Typography variant="h4" fontWeight={700} color="warning.main">
                          {dashboardData.users.newThisMonth}
                        </Typography>
                        {dashboardData.users.newLastMonth > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            {dashboardData.users.newThisMonth >= dashboardData.users.newLastMonth ? (
                              <ArrowUpwardIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                            ) : (
                              <ArrowDownwardIcon sx={{ fontSize: 16, color: 'error.main', mr: 0.5 }} />
                            )}
                            <Typography
                              variant="caption"
                              color={dashboardData.users.newThisMonth >= dashboardData.users.newLastMonth ? 'success.main' : 'error.main'}
                            >
                              {Math.abs(
                                ((dashboardData.users.newThisMonth - dashboardData.users.newLastMonth) /
                                  dashboardData.users.newLastMonth) *
                                  100
                              ).toFixed(1)}
                              % so với tháng trước ({dashboardData.users.newLastMonth})
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                {/* Admin by Industry */}
                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                  Admin theo Ngành hàng
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label="Tất cả"
                      onClick={() => setSelectedIndustry('all')}
                      color={selectedIndustry === 'all' ? 'primary' : 'default'}
                      sx={{ cursor: 'pointer' }}
                    />
                    {dashboardData.admins.byIndustry.map((industry, index) => (
                      <Chip
                        key={index}
                        label={`${industry.industry} (${industry.count})`}
                        onClick={() => setSelectedIndustry(industry.industry)}
                        color={selectedIndustry === industry.industry ? 'primary' : 'default'}
                        sx={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Box>
                </Box>
                <Grid container spacing={2}>
                  {(selectedIndustry === 'all'
                    ? dashboardData.admins.byIndustry.flatMap((ind) => ind.admins)
                    : dashboardData.admins.byIndustry
                        .find((ind) => ind.industry === selectedIndustry)
                        ?.admins || []
                  ).map((adminInfo, index) => {
                    const adminStat = dashboardData.adminStats.find((stat) => stat.admin.id === adminInfo.adminId)
                    return (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <StoreIcon color="primary" />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" fontWeight={600}>
                                  {adminInfo.shopName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {adminInfo.adminName}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                              <Chip
                                label={adminInfo.industry}
                                size="small"
                                color="primary"
                                sx={{ mr: 1, mb: 1 }}
                              />
                              <Chip label={adminInfo.businessType} size="small" sx={{ mr: 1, mb: 1 }} />
                              <Chip label={adminInfo.businessPurpose} size="small" />
                            </Box>
                            {adminStat && (
                              <>
                                <Divider sx={{ my: 2 }} />
                                <Grid container spacing={1}>
                                  <Grid item xs={4}>
                                    <Typography variant="caption" color="text.secondary">
                                      Sản phẩm
                                    </Typography>
                                    <Typography variant="body1" fontWeight={600}>
                                      {adminStat.stats.products}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={4}>
                                    <Typography variant="caption" color="text.secondary">
                                      Đơn hàng
                                    </Typography>
                                    <Typography variant="body1" fontWeight={600}>
                                      {adminStat.stats.orders}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={4}>
                                    <Typography variant="caption" color="text.secondary">
                                      Doanh thu
                                    </Typography>
                                    <Typography variant="body1" fontWeight={600} color="success.main">
                                      {adminStat.stats.revenue >= 1000000
                                        ? `${(adminStat.stats.revenue / 1000000).toFixed(1)}M`
                                        : `${(adminStat.stats.revenue / 1000).toFixed(0)}K`}
                                    </Typography>
                                  </Grid>
                                </Grid>
                                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<VisibilityIcon />}
                                    onClick={() => handleViewAdmin(adminInfo.adminId)}
                                  >
                                    Chi tiết
                                  </Button>
                                </Box>
                              </>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    )
                  })}
                </Grid>
              </Box>
            ) : (
              <Alert severity="info">Đang tải dữ liệu dashboard...</Alert>
            )
          ) : tabValue === 1 ? (
            // Admins List Tab
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 600 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Tên Admin</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tên Shop</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Ngành hàng</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Loại hình KD</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: '120px' }} align="center">
                      Hành động
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {admins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          Chưa có admin nào
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    admins.map((admin) => (
                      <TableRow key={admin._id || admin.id} hover>
                        <TableCell>{admin.name}</TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>{admin.shopInfo?.shopName || 'Chưa có'}</TableCell>
                        <TableCell>{admin.shopInfo?.industry || 'Chưa cập nhật'}</TableCell>
                        <TableCell>{admin.shopInfo?.businessType || 'Chưa cập nhật'}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleViewAdmin(admin._id || admin.id)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDeleteAdmin(admin._id || admin.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          ) : tabValue === 2 ? (
            // Admin Stats Tab
            <Grid container spacing={2}>
              {adminStats.length === 0 ? (
                <Grid item xs={12}>
                  <Alert severity="info">Chưa có dữ liệu thống kê</Alert>
                </Grid>
              ) : (
                adminStats.map((stat) => (
                  <Grid item xs={12} sm={6} md={4} key={stat.admin.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <AdminPanelSettingsIcon color="primary" />
                          <Typography variant="h6" fontWeight={600}>
                            {stat.admin.name}
                          </Typography>
                        </Box>
                        {stat.shop && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Shop: {stat.shop.shopName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Ngành hàng: {stat.shop.industry || 'Chưa cập nhật'}
                            </Typography>
                          </Box>
                        )}
                        <Divider sx={{ my: 2 }} />
                        <Grid container spacing={1}>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary">
                              Sản phẩm
                            </Typography>
                            <Typography variant="h6" fontWeight={600}>
                              {stat.stats.products}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary">
                              Đơn hàng
                            </Typography>
                            <Typography variant="h6" fontWeight={600}>
                              {stat.stats.orders}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary">
                              Khuyến mãi
                            </Typography>
                            <Typography variant="h6" fontWeight={600}>
                              {stat.stats.promotions}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          ) : tabValue === 3 ? (
            // Industry Report Tab
            <Box>
              {industryReport ? (
                <>
                  <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={4}>
                      <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                        <CardContent>
                          <Typography variant="caption">Tổng số Admin</Typography>
                          <Typography variant="h4" fontWeight={700}>
                            {industryReport.totalAdmins}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Card sx={{ bgcolor: 'info.main', color: 'info.contrastText' }}>
                        <CardContent>
                          <Typography variant="caption">Tổng số Shop</Typography>
                          <Typography variant="h4" fontWeight={700}>
                            {industryReport.totalShops}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Card sx={{ bgcolor: 'success.main', color: 'success.contrastText' }}>
                        <CardContent>
                          <Typography variant="caption">Số Ngành hàng</Typography>
                          <Typography variant="h4" fontWeight={700}>
                            {industryReport.industryReport.length}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    Báo cáo theo Ngành hàng
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 4 }}>
                    {industryReport.industryReport.map((industry, index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <CategoryIcon color="primary" />
                              <Typography variant="h6" fontWeight={600}>
                                {industry.industry}
                              </Typography>
                              <Chip label={industry.count} size="small" color="primary" />
                            </Box>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Loại hình kinh doanh:
                              </Typography>
                              {industry.businessTypes.map((bt, idx) => (
                                <Chip
                                  key={idx}
                                  label={`${bt.type}: ${bt.count}`}
                                  size="small"
                                  sx={{ mr: 1, mb: 1 }}
                                />
                              ))}
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              Danh sách shop:
                            </Typography>
                            <Box sx={{ mt: 1, maxHeight: 150, overflowY: 'auto' }}>
                              {industry.shops.map((shop, idx) => (
                                <Typography key={idx} variant="body2" sx={{ py: 0.5 }}>
                                  • {shop.shopName} ({shop.adminName})
                                </Typography>
                              ))}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  <Divider sx={{ my: 4 }} />

                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    Thống kê Loại hình kinh doanh
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 4 }}>
                    {industryReport.businessTypeReport.map((bt, index) => (
                      <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="body2" color="text.secondary">
                              {bt.type}
                            </Typography>
                            <Typography variant="h5" fontWeight={700}>
                              {bt.count}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  <Divider sx={{ my: 4 }} />

                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    Thống kê Mục đích sử dụng
                  </Typography>
                  <Grid container spacing={2}>
                    {industryReport.businessPurposeReport.map((bp, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="body2" color="text.secondary">
                              {bp.purpose}
                            </Typography>
                            <Typography variant="h5" fontWeight={700}>
                              {bp.count}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </>
              ) : (
                <Alert severity="info">Chưa có dữ liệu báo cáo</Alert>
              )}
            </Box>
          ) : null}
        </CardContent>
      </Card>

      {/* Admin Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Chi tiết Admin</Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedAdmin && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tên Admin
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedAdmin.admin.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{selectedAdmin.admin.email}</Typography>
                </Grid>
                {selectedAdmin.shop && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Tên Shop
                      </Typography>
                      <Typography variant="body1">{selectedAdmin.shop.shopName || 'Chưa có'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Ngành hàng
                      </Typography>
                      <Typography variant="body1">{selectedAdmin.shop.industry || 'Chưa cập nhật'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Loại hình kinh doanh
                      </Typography>
                      <Typography variant="body1">{selectedAdmin.shop.businessType || 'Chưa cập nhật'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Mục đích sử dụng
                      </Typography>
                      <Typography variant="body1">{selectedAdmin.shop.businessPurpose || 'Chưa cập nhật'}</Typography>
                    </Grid>
                  </>
                )}
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Sản phẩm
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {selectedAdmin.stats.products}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Đơn hàng
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {selectedAdmin.stats.orders}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Khuyến mãi
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {selectedAdmin.stats.promotions}
                  </Typography>
                </Grid>
                {selectedAdmin.stats.revenue !== undefined && (
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Doanh thu
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {selectedAdmin.stats.revenue >= 1000000
                        ? `${(selectedAdmin.stats.revenue / 1000000).toFixed(1)}M`
                        : `${(selectedAdmin.stats.revenue / 1000).toFixed(0)}K`}{' '}
                      VNĐ
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedAdmin && (
            <Button
              color="error"
              onClick={() => handleDeleteAdmin(selectedAdmin.admin._id)}
              startIcon={<DeleteIcon />}
            >
              Xóa Admin
            </Button>
          )}
          <Button onClick={handleCloseDialog}>Đóng</Button>
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

export default SuperAdmin

