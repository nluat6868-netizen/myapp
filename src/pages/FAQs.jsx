import { useState, useMemo, useCallback, useEffect } from 'react'
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
  Alert,
  Chip,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  UploadFile as UploadFileIcon,
  Download as DownloadIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material'
import * as XLSX from 'xlsx'
import Toast from '../components/Toast'

function FAQs() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const dispatch = useDispatch()
  const { faqs, loading, error } = useSelector((state) => state.faqs)
  const [page, setPage] = useState(1)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' })
  const [formData, setFormData] = useState({ question: '', answer: '' })
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const rowsPerPage = 8

  // Load FAQs from API
  useEffect(() => {
    dispatch({ type: 'GET_FAQS_REQUEST' })
  }, [dispatch])

  // Handle success/error from Redux
  useEffect(() => {
    if (error) {
      setToast({
        open: true,
        message: error,
        severity: 'error',
      })
    }
  }, [error])

  // Memoize pagination calculations
  const paginationData = useMemo(() => {
    const faqsList = faqs || []
    const totalPages = Math.ceil(faqsList.length / rowsPerPage)
    const startIndex = (page - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    const currentFaqs = faqsList.slice(startIndex, endIndex)
    return { totalPages, startIndex, endIndex, currentFaqs }
  }, [faqs, page, rowsPerPage])

  const handlePageChange = useCallback((event, value) => {
    setPage(value)
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
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
    if (!formData.question.trim()) {
      newErrors.question = 'Câu hỏi không được để trống'
    }
    if (!formData.answer.trim()) {
      newErrors.answer = 'Câu trả lời không được để trống'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleOpenDialog = (faq = null) => {
    if (faq) {
      setEditingId(faq._id || faq.id)
      setFormData({ question: faq.question, answer: faq.answer })
    } else {
      setEditingId(null)
      setFormData({ question: '', answer: '' })
    }
    setErrors({})
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingId(null)
    setFormData({ question: '', answer: '' })
    setErrors({})
  }

  const handleSave = () => {
    if (!validateForm()) return

    if (editingId) {
      // Update existing FAQ
      dispatch({ type: 'UPDATE_FAQ_REQUEST', payload: { id: editingId, faqData: formData } })
      setToast({
        open: true,
        message: 'Cập nhật FAQ thành công!',
        severity: 'success',
      })
    } else {
      // Add new FAQ
      dispatch({ type: 'CREATE_FAQ_REQUEST', payload: formData })
      setToast({
        open: true,
        message: 'Thêm FAQ thành công!',
        severity: 'success',
      })
      setPage(1)
    }
    handleCloseDialog()
    setTimeout(() => setToast((prev) => ({ ...prev, open: false })), 3000)
  }

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa FAQ này?')) {
      dispatch({ type: 'DELETE_FAQ_REQUEST', payload: id })
      setToast({
        open: true,
        message: 'Xóa FAQ thành công!',
        severity: 'success',
      })
      setTimeout(() => setToast((prev) => ({ ...prev, open: false })), 3000)
      // Adjust page if current page becomes empty
      const newTotalPages = Math.ceil((faqs.length - 1) / rowsPerPage)
      if (page > newTotalPages && newTotalPages > 0) {
        setPage(newTotalPages)
      }
    }
  }

  const handleExcelUpload = (e) => {
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
          alert('File Excel không có dữ liệu')
          return
        }

        // Validate columns
        const firstRow = jsonData[0]
        if (!firstRow.hasOwnProperty('Câu hỏi') && !firstRow.hasOwnProperty('Question')) {
          alert('File Excel phải có cột "Câu hỏi" hoặc "Question"')
          return
        }
        if (!firstRow.hasOwnProperty('Câu trả lời') && !firstRow.hasOwnProperty('Answer')) {
          alert('File Excel phải có cột "Câu trả lời" hoặc "Answer"')
          return
        }

        // Parse data
        const newFaqs = jsonData.map((row) => {
          const question =
            row['Câu hỏi'] || row['Question'] || row['câu hỏi'] || row['question'] || ''
          const answer =
            row['Câu trả lời'] || row['Answer'] || row['câu trả lời'] || row['answer'] || ''
          return {
            question: String(question).trim(),
            answer: String(answer).trim(),
          }
        })

        // Filter out empty rows
        const validFaqs = newFaqs.filter((faq) => faq.question && faq.answer)

        if (validFaqs.length === 0) {
          alert('Không có dữ liệu hợp lệ trong file Excel')
          return
        }

        // Create FAQs via API
        validFaqs.forEach((faq) => {
          dispatch({ type: 'CREATE_FAQ_REQUEST', payload: faq })
        })

        setToast({
          open: true,
          message: `Đã import ${validFaqs.length} FAQs từ file Excel!`,
          severity: 'success',
        })
        setTimeout(() => setToast((prev) => ({ ...prev, open: false })), 3000)
        setPage(1)
      } catch (error) {
        console.error('Error reading Excel file:', error)
        alert('Lỗi khi đọc file Excel. Vui lòng kiểm tra lại file.')
      }
    }
    reader.readAsArrayBuffer(file)
    // Reset input
    e.target.value = ''
  }

  const handleDownloadTemplate = () => {
    // Create template data
    const templateData = [
      { 'Câu hỏi': 'Câu hỏi mẫu 1?', 'Câu trả lời': 'Câu trả lời mẫu 1' },
      { 'Câu hỏi': 'Câu hỏi mẫu 2?', 'Câu trả lời': 'Câu trả lời mẫu 2' },
    ]

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'FAQs')

    // Set column widths
    ws['!cols'] = [{ wch: 50 }, { wch: 80 }]

    // Download file
    XLSX.writeFile(wb, 'Mau_FAQs.xlsx')
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
          Quản lý FAQs
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          Quản lý câu hỏi thường gặp và câu trả lời
        </Typography>
      </Box>

      {loading && (
        <Alert severity="info" sx={{ mb: { xs: 2, md: 3 } }}>
          Đang tải dữ liệu...
        </Alert>
      )}

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
                Thêm FAQ
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <input
                accept=".xlsx,.xls"
                style={{ display: 'none' }}
                id="excel-upload"
                type="file"
                onChange={handleExcelUpload}
              />
              <label htmlFor="excel-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadFileIcon />}
                  fullWidth
                >
                  Upload Excel
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
                Tải mẫu Excel
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Chip
                label={`Tổng: ${faqs?.length || 0} FAQs`}
                color="primary"
                variant="outlined"
                sx={{ width: '100%', height: '40px' }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* FAQs Table */}
      <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: { xs: 1, sm: 2, md: 3 } }}>
          {isMobile ? (
            // Mobile Card View
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {paginationData.currentFaqs.map((faq, index) => (
                <Card
                  key={faq._id || faq.id}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      boxShadow: 2,
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        #{paginationData.startIndex + index + 1}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleOpenDialog(faq)}
                          sx={{ padding: 0.5 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDelete(faq._id || faq.id)}
                          sx={{ padding: 0.5 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      {faq.question}
                    </Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                      {faq.answer}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
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
              <Table stickyHeader sx={{ minWidth: 500 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, width: { xs: '40px', sm: '50px' }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    STT
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Câu hỏi
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      display: { xs: 'none', md: 'table-cell' },
                    }}
                  >
                    Câu trả lời
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, width: { xs: '80px', sm: '120px' } }} align="center">
                    Hành động
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginationData.currentFaqs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Chưa có FAQs nào. Hãy thêm FAQ mới hoặc upload file Excel.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginationData.currentFaqs.map((faq, index) => (
                    <TableRow key={faq._id || faq.id} hover>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {paginationData.startIndex + index + 1}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {faq.question}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          display: { xs: 'none', md: 'table-cell' },
                        }}
                      >
                        {faq.answer}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleOpenDialog(faq)}
                            aria-label="edit"
                            sx={{ padding: { xs: 0.5, sm: 1 } }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDelete(faq._id || faq.id)}
                            aria-label="delete"
                            sx={{ padding: { xs: 0.5, sm: 1 } }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          )}

          {/* Pagination */}
          {faqs && faqs.length > 0 && (
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

      {/* Edit/Add Dialog */}
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
          {editingId ? 'Chỉnh sửa FAQ' : 'Thêm FAQ mới'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Câu hỏi"
              name="question"
              value={formData.question}
              onChange={handleInputChange}
              error={!!errors.question}
              helperText={errors.question}
              required
              multiline
              rows={2}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Câu trả lời"
              name="answer"
              value={formData.answer}
              onChange={handleInputChange}
              error={!!errors.answer}
              helperText={errors.answer}
              required
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={<SaveIcon />}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default FAQs

