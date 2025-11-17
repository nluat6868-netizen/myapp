import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Avatar,
  Divider,
} from '@mui/material'
import {
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  BugReport as BugReportIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ReportProblem as CriticalIcon,
} from '@mui/icons-material'
import Toast from '../components/Toast'

function ErrorLogs() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const dispatch = useDispatch()
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' })
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(false)
  const [levelFilter, setLevelFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 })
  const [selectedLog, setSelectedLog] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)

  useEffect(() => {
    loadLogs()
    loadStats()
  }, [levelFilter, page])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })
      if (levelFilter !== 'all') {
        params.append('level', levelFilter)
      }

      const response = await fetch(`${API_URL}/error-logs?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs || [])
        setPagination(data.pagination || {})
      } else {
        setToast({
          open: true,
          message: 'Không thể tải danh sách log',
          severity: 'error',
        })
      }
    } catch (error) {
      setToast({
        open: true,
        message: 'Lỗi khi tải danh sách log',
        severity: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${API_URL}/error-logs/stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleViewLog = (log) => {
    setSelectedLog(log)
    setOpenDialog(true)
  }

  const handleDeleteLog = async (logId) => {
    if (!window.confirm('Bạn có chắc muốn xóa log này?')) return

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${API_URL}/error-logs/${logId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (response.ok) {
        setToast({
          open: true,
          message: 'Đã xóa log',
          severity: 'success',
        })
        loadLogs()
        loadStats()
      } else {
        setToast({
          open: true,
          message: 'Không thể xóa log',
          severity: 'error',
        })
      }
    } catch (error) {
      setToast({
        open: true,
        message: 'Lỗi khi xóa log',
        severity: 'error',
      })
    }
  }

  const getLevelIcon = (level) => {
    switch (level) {
      case 'critical':
        return <CriticalIcon sx={{ color: 'error.main' }} />
      case 'error':
        return <ErrorIcon sx={{ color: 'error.main' }} />
      case 'warning':
        return <WarningIcon sx={{ color: 'warning.main' }} />
      default:
        return <InfoIcon sx={{ color: 'info.main' }} />
    }
  }

  const getLevelColor = (level) => {
    switch (level) {
      case 'critical':
        return 'error'
      case 'error':
        return 'error'
      case 'warning':
        return 'warning'
      default:
        return 'info'
    }
  }

  const getLevelLabel = (level) => {
    switch (level) {
      case 'critical':
        return 'Nghiêm trọng'
      case 'error':
        return 'Lỗi'
      case 'warning':
        return 'Cảnh báo'
      default:
        return 'Thông tin'
    }
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
          Log lỗi hệ thống
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          Xem và quản lý các lỗi hệ thống
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2.4}>
          <Card sx={{ bgcolor: 'error.main', color: 'error.contrastText' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.9, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    Tổng lỗi
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    {stats.total || 0}
                  </Typography>
                </Box>
                <BugReportIcon sx={{ fontSize: { xs: 28, sm: 32 }, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Card sx={{ bgcolor: 'error.dark', color: 'error.contrastText' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.9, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    Nghiêm trọng
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    {stats.critical || 0}
                  </Typography>
                </Box>
                <CriticalIcon sx={{ fontSize: { xs: 28, sm: 32 }, opacity: 0.8 }} />
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
                    Lỗi
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    {stats.errors || 0}
                  </Typography>
                </Box>
                <ErrorIcon sx={{ fontSize: { xs: 28, sm: 32 }, opacity: 0.8 }} />
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
                    Cảnh báo
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    {stats.warnings || 0}
                  </Typography>
                </Box>
                <WarningIcon sx={{ fontSize: { xs: 28, sm: 32 }, opacity: 0.8 }} />
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
                    Hôm nay
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    {stats.today || 0}
                  </Typography>
                </Box>
                <InfoIcon sx={{ fontSize: { xs: 28, sm: 32 }, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Mức độ</InputLabel>
              <Select
                value={levelFilter}
                label="Mức độ"
                onChange={(e) => {
                  setLevelFilter(e.target.value)
                  setPage(1)
                }}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="critical">Nghiêm trọng</MenuItem>
                <MenuItem value="error">Lỗi</MenuItem>
                <MenuItem value="warning">Cảnh báo</MenuItem>
                <MenuItem value="info">Thông tin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
          {loading ? (
            <LinearProgress sx={{ mb: 2 }} />
          ) : logs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Không có log nào
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hệ thống chưa ghi nhận lỗi nào
              </Typography>
            </Box>
          ) : isMobile ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {logs.map((log) => (
                <Card key={log._id} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getLevelIcon(log.level)}
                        <Chip
                          label={getLevelLabel(log.level)}
                          color={getLevelColor(log.level)}
                          size="small"
                        />
                      </Box>
                      <Box>
                        <IconButton size="small" onClick={() => handleViewLog(log)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteLog(log._id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      {log.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {log.endpoint && `${log.method} ${log.endpoint}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {new Date(log.createdAt).toLocaleString('vi-VN')}
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
                    <TableCell sx={{ fontWeight: 600 }}>Mức độ</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Thông báo</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Endpoint</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Người dùng</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Thời gian</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log._id} hover>
                      <TableCell>
                        <Chip
                          icon={getLevelIcon(log.level)}
                          label={getLevelLabel(log.level)}
                          color={getLevelColor(log.level)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {log.message}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {log.method} {log.endpoint}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {log.user ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                              {log.user.name?.[0] || log.user.email?.[0] || 'U'}
                            </Avatar>
                            <Typography variant="caption">
                              {log.user.name || log.user.email}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            System
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(log.createdAt).toLocaleString('vi-VN')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small" onClick={() => handleViewLog(log)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteLog(log._id)}>
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

          {/* Pagination */}
          {pagination.pages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={pagination.pages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* View Log Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedLog && getLevelIcon(selectedLog.level)}
            <Typography variant="h6">Chi tiết lỗi</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Mức độ</Typography>
                  <Chip
                    icon={getLevelIcon(selectedLog.level)}
                    label={getLevelLabel(selectedLog.level)}
                    color={getLevelColor(selectedLog.level)}
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status Code</Typography>
                  <Typography variant="body1">{selectedLog.statusCode || '-'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Thông báo</Typography>
                  <Typography variant="body1" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                    {selectedLog.message}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Endpoint</Typography>
                  <Typography variant="body1">{selectedLog.method} {selectedLog.endpoint || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">IP Address</Typography>
                  <Typography variant="body1">{selectedLog.ipAddress || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Người dùng</Typography>
                  <Typography variant="body1">
                    {selectedLog.user?.name || selectedLog.user?.email || 'System'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Thời gian</Typography>
                  <Typography variant="body1">
                    {new Date(selectedLog.createdAt).toLocaleString('vi-VN')}
                  </Typography>
                </Grid>
                {selectedLog.stack && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Stack Trace</Typography>
                    <Box
                      component="pre"
                      sx={{
                        mt: 1,
                        p: 2,
                        bgcolor: 'grey.100',
                        borderRadius: 1,
                        overflow: 'auto',
                        fontSize: '0.75rem',
                        maxHeight: 300,
                      }}
                    >
                      {selectedLog.stack}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Đóng</Button>
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

export default ErrorLogs

