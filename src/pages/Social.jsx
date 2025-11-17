import { useState, useEffect } from 'react'
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Facebook as FacebookIcon,
  Send as SendIcon,
  Schedule as ScheduleIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  VideoLibrary as VideoLibraryIcon,
} from '@mui/icons-material'
import Toast from '../components/Toast'

function Social() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const dispatch = useDispatch()
  const { connections } = useSelector((state) => state.socialConnections)
  const { error: publishError } = useSelector((state) => state.socialPosts || {})
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' })
  const [posts, setPosts] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [formData, setFormData] = useState({
    platform: 'facebook',
    content: '',
    scheduledTime: '',
    imageUrl: '',
    link: '',
  })
  const [errors, setErrors] = useState({})

  const facebookConnected = connections?.find((c) => c.platform === 'facebook')?.isConnected

  useEffect(() => {
    // Load posts from localStorage or API
    const savedPosts = localStorage.getItem('socialPosts')
    if (savedPosts) {
      try {
        setPosts(JSON.parse(savedPosts))
      } catch (error) {
        console.error('Error loading posts:', error)
      }
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.content.trim()) {
      newErrors.content = 'Nội dung bài đăng không được để trống'
    }
    if (formData.scheduledTime && new Date(formData.scheduledTime) < new Date()) {
      newErrors.scheduledTime = 'Thời gian đăng phải trong tương lai'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleOpenDialog = (post = null) => {
    if (post) {
      setEditingPost(post)
      setFormData({
        platform: post.platform,
        content: post.content,
        scheduledTime: post.scheduledTime || '',
        imageUrl: post.imageUrl || '',
        link: post.link || '',
      })
    } else {
      setEditingPost(null)
      setFormData({
        platform: 'facebook',
        content: '',
        scheduledTime: '',
        imageUrl: '',
        link: '',
      })
    }
    setErrors({})
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingPost(null)
    setFormData({
      platform: 'facebook',
      content: '',
      scheduledTime: '',
      imageUrl: '',
      link: '',
    })
    setErrors({})
  }

  const handleSavePost = () => {
    if (!validateForm()) return

    if (editingPost) {
      // Update existing post
      const updatedPosts = posts.map((p) =>
        p.id === editingPost.id
          ? {
              ...p,
              ...formData,
              updatedAt: new Date().toISOString(),
            }
          : p
      )
      setPosts(updatedPosts)
      localStorage.setItem('socialPosts', JSON.stringify(updatedPosts))
      setToast({
        open: true,
        message: 'Đã cập nhật bài đăng',
        severity: 'success',
      })
    } else {
      // Create new post
      const newPost = {
        id: Date.now().toString(),
        ...formData,
        status: formData.scheduledTime ? 'scheduled' : 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const updatedPosts = [newPost, ...posts]
      setPosts(updatedPosts)
      localStorage.setItem('socialPosts', JSON.stringify(updatedPosts))
      setToast({
        open: true,
        message: formData.scheduledTime ? 'Đã lên lịch đăng bài' : 'Đã lưu bài đăng',
        severity: 'success',
      })
    }
    handleCloseDialog()
  }

  const handleDeletePost = (postId) => {
    const updatedPosts = posts.filter((p) => p.id !== postId)
    setPosts(updatedPosts)
    localStorage.setItem('socialPosts', JSON.stringify(updatedPosts))
    setToast({
      open: true,
      message: 'Đã xóa bài đăng',
      severity: 'success',
    })
  }

  const handlePublishNow = async (post) => {
    if (!facebookConnected) {
      setToast({
        open: true,
        message: 'Vui lòng kết nối Facebook trước',
        severity: 'error',
      })
      return
    }

    try {
      // Call API to publish post
      dispatch({
        type: 'PUBLISH_SOCIAL_POST_REQUEST',
        payload: {
          platform: post.platform,
          content: post.content,
          imageUrl: post.imageUrl,
          link: post.link,
        },
      })

      // Update post status
      const updatedPosts = posts.map((p) =>
        p.id === post.id
          ? {
              ...p,
              status: 'published',
              publishedAt: new Date().toISOString(),
            }
          : p
      )
      setPosts(updatedPosts)
      localStorage.setItem('socialPosts', JSON.stringify(updatedPosts))

      setToast({
        open: true,
        message: 'Đã đăng bài thành công',
        severity: 'success',
      })
    } catch (error) {
      setToast({
        open: true,
        message: 'Đăng bài thất bại. Vui lòng thử lại',
        severity: 'error',
      })
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'success'
      case 'scheduled':
        return 'warning'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'published':
        return 'Đã đăng'
      case 'scheduled':
        return 'Đã lên lịch'
      default:
        return 'Bản nháp'
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
          Quản lý đăng bài
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          Tạo và quản lý bài đăng trên mạng xã hội
        </Typography>
      </Box>

      {/* Connection Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#1877F2', width: 48, height: 48 }}>
                <FacebookIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Facebook
                </Typography>
                <Chip
                  label={facebookConnected ? 'Đã kết nối' : 'Chưa kết nối'}
                  color={facebookConnected ? 'success' : 'default'}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            </Box>
            {!facebookConnected && (
              <Button
                variant="contained"
                startIcon={<LinkIcon />}
                onClick={() => window.location.href = '/settings#social'}
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
          </Box>
        </CardContent>
      </Card>

      {/* Create Post Button */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={!facebookConnected}
          sx={{
            minWidth: 150,
            fontSize: '1rem',
            py: 1.5,
          }}
        >
          Tạo bài đăng
        </Button>
      </Box>

      {/* Posts List */}
      <Card>
        <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
          {posts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chưa có bài đăng nào
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Tạo bài đăng mới để bắt đầu
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                disabled={!facebookConnected}
              >
                Tạo bài đăng đầu tiên
              </Button>
            </Box>
          ) : isMobile ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {posts.map((post) => (
                <Card key={post.id} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Chip
                          label={getStatusLabel(post.status)}
                          color={getStatusColor(post.status)}
                          size="small"
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary" display="block">
                          {new Date(post.createdAt).toLocaleString('vi-VN')}
                        </Typography>
                      </Box>
                      <Box>
                        <IconButton size="small" onClick={() => handleOpenDialog(post)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeletePost(post.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                      {post.content}
                    </Typography>
                    {post.imageUrl && (
                      <Box sx={{ mb: 2 }}>
                        <img
                          src={post.imageUrl}
                          alt="Post"
                          style={{ width: '100%', borderRadius: 8, maxHeight: 200, objectFit: 'cover' }}
                        />
                      </Box>
                    )}
                    {post.link && (
                      <Typography variant="caption" color="primary" sx={{ display: 'block', mb: 1 }}>
                        🔗 {post.link}
                      </Typography>
                    )}
                    {post.scheduledTime && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        📅 Lên lịch: {new Date(post.scheduledTime).toLocaleString('vi-VN')}
                      </Typography>
                    )}
                    {post.status === 'draft' && (
                      <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        startIcon={<SendIcon />}
                        onClick={() => handlePublishNow(post)}
                        sx={{ mt: 2 }}
                      >
                        Đăng ngay
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <List>
              {posts.map((post) => (
                <ListItem
                  key={post.id}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    mb: 2,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Box sx={{ flex: 1, mr: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip
                        label={getStatusLabel(post.status)}
                        color={getStatusColor(post.status)}
                        size="small"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(post.createdAt).toLocaleString('vi-VN')}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>
                      {post.content.substring(0, 150)}
                      {post.content.length > 150 && '...'}
                    </Typography>
                    {post.scheduledTime && (
                      <Typography variant="caption" color="text.secondary">
                        📅 Lên lịch: {new Date(post.scheduledTime).toLocaleString('vi-VN')}
                      </Typography>
                    )}
                  </Box>
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {post.status === 'draft' && (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<SendIcon />}
                          onClick={() => handlePublishNow(post)}
                        >
                          Đăng ngay
                        </Button>
                      )}
                      <IconButton edge="end" onClick={() => handleOpenDialog(post)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" onClick={() => handleDeletePost(post.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Post Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingPost ? 'Chỉnh sửa bài đăng' : 'Tạo bài đăng mới'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Nền tảng</InputLabel>
                <Select
                  name="platform"
                  value={formData.platform}
                  onChange={handleInputChange}
                  label="Nền tảng"
                >
                  <MenuItem value="facebook">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FacebookIcon sx={{ color: '#1877F2' }} />
                      Facebook
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                name="content"
                label="Nội dung bài đăng *"
                value={formData.content}
                onChange={handleInputChange}
                error={!!errors.content}
                helperText={errors.content}
                placeholder="Viết nội dung bài đăng của bạn..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="imageUrl"
                label="URL hình ảnh"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                InputProps={{
                  startAdornment: <ImageIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="link"
                label="Link (tùy chọn)"
                value={formData.link}
                onChange={handleInputChange}
                placeholder="https://example.com"
                InputProps={{
                  startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="datetime-local"
                name="scheduledTime"
                label="Lên lịch đăng (tùy chọn)"
                value={formData.scheduledTime}
                onChange={handleInputChange}
                error={!!errors.scheduledTime}
                helperText={errors.scheduledTime || 'Để trống nếu muốn đăng ngay'}
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  startAdornment: <ScheduleIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSavePost} variant="contained">
            {formData.scheduledTime ? 'Lên lịch' : editingPost ? 'Cập nhật' : 'Lưu bản nháp'}
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

export default Social

