import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  TextField,
  Button,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  FormHelperText,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  HelpOutline as HelpOutlineIcon,
  ContactSupport as ContactSupportIcon,
  Book as BookIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
} from '@mui/icons-material'
import Toast from '../components/Toast'

const helpCategories = [
  {
    title: 'Bắt đầu sử dụng',
    icon: <BookIcon />,
    items: [
      {
        question: 'Làm thế nào để đăng nhập vào hệ thống?',
        answer: 'Bạn có thể đăng nhập bằng email và mật khẩu đã được cấp. Nếu quên mật khẩu, hãy sử dụng chức năng "Quên mật khẩu" trên trang đăng nhập.',
      },
      {
        question: 'Làm thế nào để tạo tài khoản mới?',
        answer: 'Nhấp vào nút "Đăng ký" trên trang đăng nhập và điền đầy đủ thông tin. Tài khoản mới sẽ được tạo với quyền admin mặc định.',
      },
      {
        question: 'Làm thế nào để thay đổi thông tin cá nhân?',
        answer: 'Nhấp vào avatar của bạn ở góc trên bên phải, chọn "Thông tin tài khoản" để truy cập trang Profile và cập nhật thông tin.',
      },
    ],
  },
  {
    title: 'Quản lý sản phẩm',
    icon: <BookIcon />,
    items: [
      {
        question: 'Làm thế nào để thêm thuộc tính sản phẩm?',
        answer: 'Vào menu "Sản phẩm" > "Thuộc tính", nhấp "Thêm thuộc tính" và điền thông tin. Bạn có thể chọn loại thuộc tính: text, number, file, textarea, selection option, email validation, hoặc gallery (nhiều hình ảnh).',
      },
      {
        question: 'Làm thế nào để sắp xếp lại thứ tự thuộc tính?',
        answer: 'Trong trang "Thuộc tính", bạn có thể kéo thả các thuộc tính để sắp xếp lại thứ tự hiển thị.',
      },
      {
        question: 'Làm thế nào để thêm sản phẩm mới?',
        answer: 'Vào menu "Sản phẩm" > "Danh sách sản phẩm", nhấp "Thêm sản phẩm" và điền thông tin dựa trên các thuộc tính đã tạo. Bạn cũng có thể upload file CSV để thêm nhiều sản phẩm cùng lúc.',
      },
    ],
  },
  {
    title: 'Quản lý đơn hàng',
    icon: <BookIcon />,
    items: [
      {
        question: 'Làm thế nào để xem danh sách đơn hàng?',
        answer: 'Vào menu "Đơn hàng" để xem tất cả đơn hàng. Bạn có thể lọc theo trạng thái, tìm kiếm, hoặc xem đơn hàng hôm nay, 7 ngày trước.',
      },
      {
        question: 'Làm thế nào để thay đổi trạng thái đơn hàng?',
        answer: 'Trong danh sách đơn hàng, nhấp vào dropdown trạng thái và chọn trạng thái mới: Chờ, Đang xử lý, Đã vận chuyển, hoặc Hủy bỏ.',
      },
      {
        question: 'Làm thế nào để in hóa đơn?',
        answer: 'Nhấp vào nút "Xem chi tiết" của đơn hàng, sau đó chọn mẫu hóa đơn và nhấp "In hóa đơn". Bạn cũng có thể chọn nhiều đơn hàng và in hàng loạt.',
      },
    ],
  },
  {
    title: 'Template và Tone AI',
    icon: <BookIcon />,
    items: [
      {
        question: 'Làm thế nào để tạo template?',
        answer: 'Vào menu "Template", nhấp "Tạo template mới", chọn loại template (Tra cứu thông tin hoặc Dữ liệu trả về), sau đó kéo thả các thuộc tính vào editor.',
      },
      {
        question: 'Làm thế nào để tạo tone AI?',
        answer: 'Vào menu "Tone AI", nhấp "Thêm tone", điền tên tone, chọn nhân viên tư vấn và các phong cách (lịch sự, vui vẻ, v.v.).',
      },
      {
        question: 'Làm thế nào để thêm nhân viên tư vấn?',
        answer: 'Trong trang "Tone AI", nhấp "Thêm nhân viên" và điền thông tin. Nhân viên sẽ tự động được gán với tone hiện tại.',
      },
    ],
  },
  {
    title: 'Cài đặt và Quyền',
    icon: <BookIcon />,
    items: [
      {
        question: 'Làm thế nào để cập nhật thông tin shop?',
        answer: 'Vào menu "Cài đặt", cập nhật thông tin shop như tên shop, địa chỉ, lĩnh vực, loại hình kinh doanh, mục đích sử dụng, và avatar shop.',
      },
      {
        question: 'Làm thế nào để quản lý người dùng?',
        answer: 'Vào menu "Người dùng" (chỉ admin), bạn có thể xem danh sách, tạo mới, chỉnh sửa, xóa người dùng và phân quyền cho từng người dùng.',
      },
      {
        question: 'Làm thế nào để phân quyền cho người dùng?',
        answer: 'Trong trang "Người dùng", chỉnh sửa người dùng và chọn các quyền tương ứng. Admin có tất cả quyền, không cần phân quyền riêng.',
      },
    ],
  },
]

function Help() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const dispatch = useDispatch()
  const { tickets, loading, error } = useSelector((state) => state.tickets)
  const { user } = useSelector((state) => state.auth)

  const [tabValue, setTabValue] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [openTicketDialog, setOpenTicketDialog] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'other',
  })
  const [errors, setErrors] = useState({})
  const [statusFilter, setStatusFilter] = useState('all')
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' })

  // Load tickets
  useEffect(() => {
    dispatch({ type: 'GET_TICKETS_REQUEST', payload: { status: statusFilter !== 'all' ? statusFilter : undefined } })
  }, [dispatch, statusFilter])

  // Handle errors
  useEffect(() => {
    if (error) {
      setToast({ open: true, message: error, severity: 'error' })
    }
  }, [error])

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false)
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const handleOpenDialog = () => {
    setFormData({ title: '', description: '', priority: 'medium', category: 'other' })
    setErrors({})
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setFormData({ title: '', description: '', priority: 'medium', category: 'other' })
    setErrors({})
  }

  const handleOpenTicketDialog = (ticket) => {
    setSelectedTicket(ticket)
    setOpenTicketDialog(true)
  }

  const handleCloseTicketDialog = () => {
    setOpenTicketDialog(false)
    setSelectedTicket(null)
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Vui lòng nhập mô tả'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) return

    dispatch({ type: 'CREATE_TICKET_REQUEST', payload: formData })
    setToast({ open: true, message: 'Đang tạo ticket...', severity: 'info' })
    handleCloseDialog()
  }

  const handleUpdateStatus = (ticketId, newStatus) => {
    dispatch({
      type: 'UPDATE_TICKET_REQUEST',
      payload: { id: ticketId, ticketData: { status: newStatus } },
    })
    setToast({ open: true, message: 'Đang cập nhật trạng thái...', severity: 'info' })
  }

  const handleDelete = (ticketId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa ticket này?')) {
      dispatch({ type: 'DELETE_TICKET_REQUEST', payload: ticketId })
      setToast({ open: true, message: 'Đang xóa ticket...', severity: 'info' })
    }
  }

  // Filter FAQs based on search term
  const filteredCategories = helpCategories.map((category) => ({
    ...category,
    items: category.items.filter(
      (item) =>
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter((category) => category.items.length > 0)

  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    if (statusFilter !== 'all' && ticket.status !== statusFilter) return false
    if (searchTerm && !ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) && !ticket.description.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'success'
      case 'closed':
        return 'default'
      case 'pending':
        return 'warning'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'open':
        return 'Mở'
      case 'closed':
        return 'Đóng'
      case 'pending':
        return 'Đang xử lý'
      default:
        return status
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <CheckCircleIcon />
      case 'closed':
        return <CancelIcon />
      case 'pending':
        return <PendingIcon />
      default:
        return null
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'error'
      case 'high':
        return 'warning'
      case 'medium':
        return 'info'
      case 'low':
        return 'default'
      default:
        return 'default'
    }
  }

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'Khẩn cấp'
      case 'high':
        return 'Cao'
      case 'medium':
        return 'Trung bình'
      case 'low':
        return 'Thấp'
      default:
        return priority
    }
  }

  const contactInfo = [
    { icon: <EmailIcon />, label: 'Email hỗ trợ', value: 'support@myapp.com' },
    { icon: <PhoneIcon />, label: 'Hotline', value: '1900-xxxx' },
  ]

  return (
    <Container maxWidth="xl" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Trung tâm Trợ giúp
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tìm câu trả lời cho các câu hỏi thường gặp, tạo ticket hỗ trợ hoặc liên hệ với chúng tôi
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="FAQ" />
          <Tab label="Tickets của tôi" />
        </Tabs>
      </Card>

      {tabValue === 0 && (
        <>
          {/* Search Section */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <TextField
                fullWidth
                placeholder="Tìm kiếm câu hỏi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{ mb: 2 }}
              />
              {searchTerm && (
                <Typography variant="body2" color="text.secondary">
                  Tìm thấy {filteredCategories.reduce((sum, cat) => sum + cat.items.length, 0)} kết quả
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* FAQ Categories */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {filteredCategories.map((category, categoryIndex) => (
              <Grid item xs={12} key={categoryIndex}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ mr: 2, color: 'primary.main' }}>{category.icon}</Box>
                      <Typography variant="h6" fontWeight={600}>
                        {category.title}
                      </Typography>
                      <Chip
                        label={category.items.length}
                        size="small"
                        color="primary"
                        sx={{ ml: 2 }}
                      />
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    {category.items.map((item, itemIndex) => {
                      const panelId = `panel-${categoryIndex}-${itemIndex}`
                      return (
                        <Accordion
                          key={itemIndex}
                          expanded={expanded === panelId}
                          onChange={handleChange(panelId)}
                          sx={{
                            mb: 1,
                            '&:before': {
                              display: 'none',
                            },
                            boxShadow: 'none',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                          }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            sx={{
                              '&:hover': {
                                backgroundColor: 'action.hover',
                              },
                            }}
                          >
                            <Typography variant="subtitle1" fontWeight={500}>
                              {item.question}
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                              {item.answer}
                            </Typography>
                          </AccordionDetails>
                        </Accordion>
                      )
                    })}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Contact Section */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <ContactSupportIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  Liên hệ hỗ trợ
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Nếu bạn không tìm thấy câu trả lời trong phần FAQ, vui lòng liên hệ với chúng tôi qua các kênh sau:
              </Typography>
              <Grid container spacing={3}>
                {contactInfo.map((info, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <Box sx={{ mr: 2, color: 'primary.main' }}>{info.icon}</Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {info.label}
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {info.value}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </>
      )}

      {tabValue === 1 && (
        <>
          {/* Tickets Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Tickets hỗ trợ
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog}>
                  Tạo ticket mới
                </Button>
              </Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Tìm kiếm ticket..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      label="Trạng thái"
                    >
                      <MenuItem value="all">Tất cả</MenuItem>
                      <MenuItem value="open">Mở</MenuItem>
                      <MenuItem value="pending">Đang xử lý</MenuItem>
                      <MenuItem value="closed">Đóng</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Tickets List */}
          <Card>
            <CardContent>
              {loading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography>Đang tải...</Typography>
                </Box>
              ) : filteredTickets.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Chưa có ticket nào.
                  </Typography>
                </Box>
              ) : isMobile ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {filteredTickets.map((ticket) => (
                    <Card key={ticket._id || ticket.id} sx={{ border: '1px solid', borderColor: 'divider' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {ticket.title}
                          </Typography>
                          <Chip
                            label={getStatusLabel(ticket.status)}
                            color={getStatusColor(ticket.status)}
                            size="small"
                            icon={getStatusIcon(ticket.status)}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {ticket.description.length > 100 ? `${ticket.description.substring(0, 100)}...` : ticket.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                          <Chip label={getPriorityLabel(ticket.priority)} color={getPriorityColor(ticket.priority)} size="small" />
                          <Chip label={ticket.category} size="small" variant="outlined" />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <IconButton size="small" onClick={() => handleOpenTicketDialog(ticket)}>
                            <VisibilityIcon />
                          </IconButton>
                          {ticket.status !== 'closed' && (
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleUpdateStatus(ticket._id || ticket.id, 'closed')}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          )}
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(ticket._id || ticket.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Tiêu đề</TableCell>
                        <TableCell>Mô tả</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell>Độ ưu tiên</TableCell>
                        <TableCell>Danh mục</TableCell>
                        <TableCell>Ngày tạo</TableCell>
                        <TableCell align="center">Hành động</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredTickets.map((ticket) => (
                        <TableRow key={ticket._id || ticket.id} hover>
                          <TableCell>{ticket.title}</TableCell>
                          <TableCell>
                            {ticket.description.length > 50 ? `${ticket.description.substring(0, 50)}...` : ticket.description}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(ticket.status)}
                              color={getStatusColor(ticket.status)}
                              size="small"
                              icon={getStatusIcon(ticket.status)}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip label={getPriorityLabel(ticket.priority)} color={getPriorityColor(ticket.priority)} size="small" />
                          </TableCell>
                          <TableCell>
                            <Chip label={ticket.category} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            {ticket.createdAt
                              ? new Date(ticket.createdAt).toLocaleDateString('vi-VN')
                              : '-'}
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                              <IconButton size="small" onClick={() => handleOpenTicketDialog(ticket)}>
                                <VisibilityIcon />
                              </IconButton>
                              {ticket.status !== 'closed' && (
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleUpdateStatus(ticket._id || ticket.id, 'closed')}
                                >
                                  <CheckCircleIcon />
                                </IconButton>
                              )}
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(ticket._id || ticket.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Create Ticket Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Tạo ticket hỗ trợ mới</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Tiêu đề"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              error={!!errors.title}
              helperText={errors.title}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Mô tả"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              error={!!errors.description}
              helperText={errors.description}
              multiline
              rows={4}
              sx={{ mb: 2 }}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Độ ưu tiên</InputLabel>
                  <Select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    label="Độ ưu tiên"
                  >
                    <MenuItem value="low">Thấp</MenuItem>
                    <MenuItem value="medium">Trung bình</MenuItem>
                    <MenuItem value="high">Cao</MenuItem>
                    <MenuItem value="urgent">Khẩn cấp</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Danh mục</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    label="Danh mục"
                  >
                    <MenuItem value="technical">Kỹ thuật</MenuItem>
                    <MenuItem value="billing">Thanh toán</MenuItem>
                    <MenuItem value="account">Tài khoản</MenuItem>
                    <MenuItem value="feature">Tính năng</MenuItem>
                    <MenuItem value="other">Khác</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSave} variant="contained">
            Tạo ticket
          </Button>
        </DialogActions>
      </Dialog>

      {/* Ticket Detail Dialog */}
      <Dialog open={openTicketDialog} onClose={handleCloseTicketDialog} maxWidth="md" fullWidth>
        <DialogTitle>Chi tiết ticket</DialogTitle>
        <DialogContent>
          {selectedTicket && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedTicket.title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={getStatusLabel(selectedTicket.status)}
                  color={getStatusColor(selectedTicket.status)}
                  icon={getStatusIcon(selectedTicket.status)}
                />
                <Chip label={getPriorityLabel(selectedTicket.priority)} color={getPriorityColor(selectedTicket.priority)} />
                <Chip label={selectedTicket.category} variant="outlined" />
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Mô tả
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
                {selectedTicket.description}
              </Typography>
              {selectedTicket.createdBy && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Người tạo
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {selectedTicket.createdBy.name || selectedTicket.createdBy.email}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedTicket.createdAt
                      ? new Date(selectedTicket.createdAt).toLocaleString('vi-VN')
                      : '-'}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedTicket && selectedTicket.status !== 'closed' && (
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                handleUpdateStatus(selectedTicket._id || selectedTicket.id, 'closed')
                handleCloseTicketDialog()
              }}
            >
            Đóng ticket
          </Button>
          )}
          <Button onClick={handleCloseTicketDialog}>Đóng</Button>
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

export default Help
