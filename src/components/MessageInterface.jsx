import { useState, useEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  TextField,
  IconButton,
  Chip,
  Divider,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Autocomplete,
  useTheme,
  useMediaQuery,
  Badge,
  Tooltip,
  Fade,
} from '@mui/material'
import {
  Send as SendIcon,
  Search as SearchIcon,
  Label as LabelIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiEmotionsIcon,
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreVertIcon,
  PushPin as PushPinIcon,
  Videocam as VideocamIcon,
  Phone as PhoneIcon,
  Info as InfoIcon,
} from '@mui/icons-material'
import Toast from './Toast'

// Sample data structure
const generateSampleConversations = (platform) => {
  const sampleData = [
    {
      name: 'Văn Khánh( nhà xe)',
      lastMessage: 'Bạn: Khách xù kèo e rồi',
      time: '22 giờ',
      pinned: true,
      unread: 2,
      online: false,
      messages: [
        {
          text: 'Khách xù kèo e rồi',
          sender: 'user',
          hoursAgo: 22,
        },
        {
          text: 'Anh ơi, khách hàng vừa hủy đơn hàng rồi. Em cần xử lý như thế nào ạ?',
          sender: 'user',
          hoursAgo: 22,
        },
        {
          text: 'Để tôi kiểm tra và liên hệ lại với khách hàng nhé. Bạn có thể gửi thông tin đơn hàng cho tôi không?',
          sender: 'me',
          hoursAgo: 21,
        },
      ],
    },
    {
      name: 'Mozzi Huỳnh Văn Bánh',
      lastMessage: 'Bạn: 1 đứa nữa',
      time: '11 giờ',
      pinned: false,
      unread: 0,
      online: true,
      messages: [
        {
          text: '1 đứa nữa',
          sender: 'user',
          hoursAgo: 11,
        },
        {
          text: 'Anh ơi, có thêm 1 đơn hàng mới nữa. Em đã xác nhận với khách hàng rồi.',
          sender: 'user',
          hoursAgo: 11,
        },
        {
          text: 'Cảm ơn bạn! Tôi sẽ xử lý đơn hàng này ngay.',
          sender: 'me',
          hoursAgo: 10,
        },
      ],
    },
    {
      name: 'M Anh',
      lastMessage: 'Tin nhắn thoại',
      time: '14 giờ',
      pinned: false,
      unread: 1,
      online: false,
      messages: [
        {
          text: 'Tin nhắn thoại',
          sender: 'user',
          hoursAgo: 14,
        },
        {
          text: 'Chào bạn! Tôi đã nghe tin nhắn thoại của bạn. Bạn có thể nhắn lại được không?',
          sender: 'me',
          hoursAgo: 13,
        },
      ],
    },
    {
      name: 'Hungvien',
      lastMessage: 'Bạn: C ơn a',
      time: '15 giờ',
      pinned: false,
      unread: 0,
      online: true,
      messages: [
        {
          text: 'C ơn a',
          sender: 'user',
          hoursAgo: 15,
        },
        {
          text: 'Cảm ơn anh đã hỗ trợ. Đơn hàng đã được xử lý tốt.',
          sender: 'user',
          hoursAgo: 15,
        },
        {
          text: 'Không có gì! Rất vui được hỗ trợ bạn. Nếu cần gì thêm cứ liên hệ nhé.',
          sender: 'me',
          hoursAgo: 14,
        },
      ],
    },
    {
      name: 'Mỹ Nhi ( mẹ chaiko)',
      lastMessage: 'Bị ghiền',
      time: '21 giờ',
      pinned: false,
      unread: 0,
      online: false,
      messages: [
        {
          text: 'Bị ghiền',
          sender: 'user',
          hoursAgo: 21,
        },
        {
          text: 'Sản phẩm này làm mình bị ghiền luôn. Có thể đặt thêm không?',
          sender: 'user',
          hoursAgo: 21,
        },
        {
          text: 'Cảm ơn bạn đã yêu thích sản phẩm! Tất nhiên là có thể đặt thêm. Bạn muốn đặt bao nhiêu?',
          sender: 'me',
          hoursAgo: 20,
        },
      ],
    },
    {
      name: 'Linh',
      lastMessage: 'cảm ơn em',
      time: '22 giờ',
      pinned: false,
      unread: 3,
      online: true,
      messages: [
        {
          text: 'cảm ơn em',
          sender: 'user',
          hoursAgo: 22,
        },
        {
          text: 'Cảm ơn em đã hỗ trợ nhiệt tình. Dịch vụ rất tốt!',
          sender: 'user',
          hoursAgo: 22,
        },
        {
          text: 'Em sẽ gửi thêm thông tin về sản phẩm mới cho chị nhé.',
          sender: 'user',
          hoursAgo: 21,
        },
        {
          text: 'Chị có muốn xem thêm sản phẩm khác không ạ?',
          sender: 'user',
          hoursAgo: 20,
        },
        {
          text: 'Cảm ơn chị! Rất vui được phục vụ chị. Em sẽ gửi catalog sản phẩm mới cho chị ngay.',
          sender: 'me',
          hoursAgo: 19,
        },
      ],
    },
    {
      name: 'Phương Anh',
      lastMessage: 'Bạn: Hay của tay ban nha j đó',
      time: '22 giờ',
      pinned: false,
      unread: 0,
      online: false,
      messages: [
        {
          text: 'Hay của tay ban nha j đó',
          sender: 'user',
          hoursAgo: 22,
        },
        {
          text: 'Sản phẩm này có phải hàng từ Tây Ban Nha không?',
          sender: 'user',
          hoursAgo: 22,
        },
        {
          text: 'Đúng rồi ạ! Đây là sản phẩm nhập khẩu từ Tây Ban Nha, chất lượng cao.',
          sender: 'me',
          hoursAgo: 21,
        },
      ],
    },
    {
      name: 'Hugo Nguyễn',
      lastMessage: 'Bạn: Hướng nội hướng ngoại có đủ lu...',
      time: '2 ngày',
      pinned: false,
      unread: 0,
      online: false,
      messages: [
        {
          text: 'Hướng nội hướng ngoại có đủ lu...',
          sender: 'user',
          daysAgo: 2,
        },
        {
          text: 'Sản phẩm này phù hợp cho cả người hướng nội và hướng ngoại. Bạn có muốn tìm hiểu thêm không?',
          sender: 'user',
          daysAgo: 2,
        },
        {
          text: 'Cảm ơn bạn đã quan tâm! Đúng vậy, sản phẩm phù hợp với mọi tính cách. Tôi sẽ gửi thêm thông tin chi tiết.',
          sender: 'me',
          daysAgo: 2,
        },
      ],
    },
    {
      name: 'Vương Diễm My',
      lastMessage: 'Chòi tiếc quá mẹ e tự mua 2 bé rồi',
      time: '2 ngày',
      pinned: false,
      unread: 0,
      online: false,
      messages: [
        {
          text: 'Chòi tiếc quá mẹ e tự mua 2 bé rồi',
          sender: 'user',
          daysAgo: 2,
        },
        {
          text: 'Tiếc quá, mẹ em đã tự mua 2 sản phẩm rồi. Lần sau em sẽ đặt qua đây.',
          sender: 'user',
          daysAgo: 2,
        },
        {
          text: 'Không sao đâu ạ! Lần sau khi cần gì cứ liên hệ em nhé. Em sẽ ưu đãi đặc biệt cho bạn.',
          sender: 'me',
          daysAgo: 2,
        },
      ],
    },
  ]

  return sampleData.map((item, index) => {
    const messages = item.messages.map((msg, msgIndex) => {
      let timestamp
      if (msg.hoursAgo !== undefined) {
        timestamp = new Date(Date.now() - msg.hoursAgo * 3600000).toISOString()
      } else if (msg.daysAgo !== undefined) {
        timestamp = new Date(Date.now() - msg.daysAgo * 24 * 3600000).toISOString()
      } else {
        timestamp = new Date(Date.now() - (index * 60 + msgIndex * 10) * 60000).toISOString()
      }

      return {
        id: `${platform}-${index + 1}-msg-${msgIndex + 1}`,
        text: msg.text,
        sender: msg.sender,
        timestamp,
        tags: msgIndex === 0 && item.unread > 0 ? ['Quan trọng'] : [],
      }
    })

    return {
      id: `${platform}-${index + 1}`,
      name: item.name,
      lastMessage: item.lastMessage,
      time: item.time,
      pinned: item.pinned,
      unread: item.unread,
      online: item.online,
      avatar: `https://i.pravatar.cc/150?img=${index + 1}`,
      messages,
    }
  })
}

const MessageInterface = ({ platform, platformIcon, platformColor }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const dispatch = useDispatch()
  const { conversations, selectedConversation: reduxSelectedConversation, loading, error } = useSelector((state) => state.messages)
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [messageText, setMessageText] = useState('')
  const [openTagDialog, setOpenTagDialog] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [tagInput, setTagInput] = useState('')
  const [availableTags, setAvailableTags] = useState(['Quan trọng', 'Khách hàng', 'Hỗ trợ', 'Bán hàng', 'Chốt đơn', 'Khiếu nại'])
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' })
  const messagesEndRef = useRef(null)

  useEffect(() => {
    // Load conversations from API
    dispatch({ type: 'GET_CONVERSATIONS_REQUEST', payload: platform })
  }, [dispatch, platform])

  useEffect(() => {
    // Update selected conversation when Redux state changes
    if (reduxSelectedConversation) {
      setSelectedConversation(reduxSelectedConversation)
    }
  }, [reduxSelectedConversation])

  useEffect(() => {
    // Show error toast
    if (error) {
      setToast({
        open: true,
        message: error,
        severity: 'error',
      })
    }
  }, [error])

  useEffect(() => {
    // Scroll to bottom when conversation is first loaded or new message is added
    if (selectedConversation?.messages && selectedConversation.messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [selectedConversation?.id, selectedConversation?.messages?.length])

  const filteredConversations = useMemo(() => {
    let sorted = [...conversations]
    // Sort: pinned first, then by unread, then by time
    sorted.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      if (a.unread > 0 && b.unread === 0) return -1
      if (a.unread === 0 && b.unread > 0) return 1
      return 0
    })

    if (!searchTerm) return sorted
    return sorted.filter((conv) => {
      const name = (conv.customerName || conv.name || '').toLowerCase()
      const message = (conv.lastMessage || '').toLowerCase()
      const search = searchTerm.toLowerCase()
      return name.includes(search) || message.includes(search)
    })
  }, [conversations, searchTerm])

  const handleSelectConversation = (conversation) => {
    // Load full conversation with messages from API
    dispatch({ type: 'GET_CONVERSATION_REQUEST', payload: conversation.id })
    dispatch({ type: 'SET_SELECTED_CONVERSATION', payload: conversation })
  }

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return

    dispatch({
      type: 'CREATE_MESSAGE_REQUEST',
      payload: {
        conversationId: selectedConversation.id,
        text: messageText,
        sender: 'user',
        tags: [],
        attachments: [],
      },
    })

    setMessageText('')
  }

  const handleOpenTagDialog = (message) => {
    setSelectedMessage(message)
    setTagInput('')
    setOpenTagDialog(true)
  }

  const handleAddTag = () => {
    if (!tagInput.trim() || !selectedMessage || !selectedConversation) return

    const tag = tagInput.trim()
    const updatedTags = [...(selectedMessage.tags || []), tag]

    dispatch({
      type: 'UPDATE_MESSAGE_REQUEST',
      payload: {
        id: selectedMessage.id,
        messageData: {
          tags: updatedTags,
        },
      },
    })

    if (!availableTags.includes(tag)) {
      setAvailableTags([...availableTags, tag])
    }

    setTagInput('')
    setOpenTagDialog(false)
    setToast({
      open: true,
      message: 'Đã thêm tag',
      severity: 'success',
    })
  }

  const handleRemoveTag = (messageId, tagToRemove) => {
    const message = selectedConversation?.messages?.find((msg) => msg.id === messageId)
    if (!message) return

    const updatedTags = (message.tags || []).filter((tag) => tag !== tagToRemove)

    dispatch({
      type: 'UPDATE_MESSAGE_REQUEST',
      payload: {
        id: messageId,
        messageData: {
          tags: updatedTags,
        },
      },
    })
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} ngày trước`
    if (hours > 0) return `${hours} giờ trước`
    const minutes = Math.floor(diff / 60000)
    if (minutes > 0) return `${minutes} phút trước`
    return 'Vừa xong'
  }

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    
    if (isToday) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) + ' ' +
           date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Box sx={{ display: 'flex', height: '100%', gap: { xs: 0, md: 2 }, position: 'relative' }}>
      {/* Conversations List */}
      <Paper
        elevation={0}
        sx={{
          width: isMobile ? '100%' : 380,
          display: isMobile && selectedConversation ? 'none' : 'flex',
          flexDirection: 'column',
          borderRadius: { xs: 0, md: 3 },
          overflow: 'hidden',
          border: { xs: 'none', md: '1px solid' },
          borderColor: 'divider',
          bgcolor: 'background.paper',
          position: isMobile ? (selectedConversation ? 'absolute' : 'relative') : 'relative',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: isMobile && selectedConversation ? 1 : 'auto',
          minHeight: 0,
          maxHeight: '100%',
        }}
      >
        {/* Search */}
        <Box
          sx={{
            p: { xs: 2, md: 2.5 },
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Tìm kiếm cuộc trò chuyện..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: { xs: 2, md: 3 },
                bgcolor: 'grey.50',
                '&:hover': {
                  bgcolor: 'grey.100',
                },
                '&.Mui-focused': {
                  bgcolor: 'white',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: { xs: 18, md: 20 } }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Conversations */}
        <List
          sx={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            p: 0,
            minHeight: 0,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '3px',
              '&:hover': {
                background: 'rgba(0,0,0,0.3)',
              },
            },
          }}
        >
          {loading && conversations.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Đang tải...
              </Typography>
            </Box>
          ) : filteredConversations.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Chưa có cuộc trò chuyện nào
              </Typography>
            </Box>
          ) : (
            filteredConversations.map((conversation) => (
            <Fade in key={conversation.id}>
              <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleSelectConversation(conversation)}
                    selected={selectedConversation?.id === conversation.id}
                    sx={{
                      px: { xs: 2, md: 2.5 },
                      py: { xs: 1.25, md: 1.5 },
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.2s ease',
                      '&.Mui-selected': {
                        bgcolor: `${platformColor}08`,
                        '&:hover': {
                          bgcolor: `${platformColor}12`,
                        },
                      },
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                  <ListItemAvatar sx={{ minWidth: 56 }}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      variant="dot"
                      sx={{
                        '& .MuiBadge-badge': {
                          bgcolor: conversation.online ? '#4caf50' : 'transparent',
                          border: '2px solid white',
                          width: 14,
                          height: 14,
                        },
                      }}
                    >
                      <Avatar
                        src={conversation.customerAvatar || conversation.avatar}
                        alt={conversation.customerName || conversation.name}
                        sx={{
                          width: { xs: 44, md: 48 },
                          height: { xs: 44, md: 48 },
                          border: { xs: 'none', md: '2px solid' },
                          borderColor: selectedConversation?.id === conversation.id ? platformColor : 'transparent',
                        }}
                      />
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography
                          variant="body2"
                          fontWeight={conversation.unread > 0 ? 600 : 500}
                          noWrap
                          sx={{
                            flex: 1,
                            color: conversation.unread > 0 ? 'text.primary' : 'text.primary',
                            fontSize: '0.9375rem',
                          }}
                        >
                          {conversation.customerName || conversation.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                          {conversation.pinned && (
                            <PushPinIcon sx={{ fontSize: 14, color: 'text.secondary', transform: 'rotate(45deg)' }} />
                          )}
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              fontSize: '0.75rem',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {formatTime(conversation.updatedAt || conversation.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                          sx={{
                            flex: 1,
                            fontSize: '0.875rem',
                            fontWeight: conversation.unread > 0 ? 700 : 400,
                            color: conversation.unread > 0 ? 'text.primary' : 'text.secondary',
                          }}
                        >
                          {conversation.lastMessage}
                        </Typography>
                        {conversation.unread > 0 && (
                          <Chip
                            label={conversation.unread}
                            size="small"
                            sx={{
                              ml: 1,
                              height: 20,
                              minWidth: 20,
                              bgcolor: platformColor,
                              color: 'white',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              '& .MuiChip-label': {
                                px: 1,
                              },
                            }}
                          />
                        )}
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            </Fade>
            ))
          )}
        </List>
      </Paper>

      {/* Messages */}
      {selectedConversation ? (
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: { xs: 0, md: 3 },
            overflow: 'hidden',
            border: { xs: 'none', md: '1px solid' },
            borderColor: 'divider',
            bgcolor: 'background.paper',
            position: isMobile ? 'absolute' : 'relative',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: isMobile ? 2 : 'auto',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: { xs: 2, md: 2.5 },
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1.5, md: 2 },
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            }}
          >
            {isMobile && (
              <IconButton
                onClick={() => setSelectedConversation(null)}
                sx={{ mr: { xs: -0.5, md: -1 } }}
              >
                <ArrowBackIcon />
              </IconButton>
            )}
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              variant="dot"
              sx={{
                '& .MuiBadge-badge': {
                  bgcolor: selectedConversation.online ? '#4caf50' : 'transparent',
                  border: '2px solid white',
                  width: 14,
                  height: 14,
                },
              }}
            >
            <Avatar
              src={selectedConversation.customerAvatar || selectedConversation.avatar}
              alt={selectedConversation.customerName || selectedConversation.name}
              sx={{ width: { xs: 40, md: 48 }, height: { xs: 40, md: 48 } }}
            />
            </Badge>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{
                  fontSize: { xs: '0.9375rem', md: '1rem' },
                  mb: 0.25,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {selectedConversation.customerName || selectedConversation.name}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', md: '0.8125rem' } }}
              >
                {selectedConversation.online ? 'Đang hoạt động' : formatTime(selectedConversation.updatedAt || selectedConversation.createdAt)}
              </Typography>
            </Box>
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 0.5 }}>
              <Tooltip title="Gọi video">
                <IconButton size="small">
                  <VideocamIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Gọi thoại">
                <IconButton size="small">
                  <PhoneIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Thông tin">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <IconButton size="small">
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
            {isMobile && (
              <IconButton size="small">
                <MoreVertIcon fontSize="small" />
              </IconButton>
            )}
          </Box>

          {/* Messages */}
          <Box
            ref={(el) => {
              if (el) {
                // Store ref for scroll handling
              }
            }}
            sx={{
              flex: 1,
              overflow: 'auto',
              overflowY: 'scroll',
              p: { xs: 2, md: 3 },
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 1, md: 1.5 },
              bgcolor: 'grey.50',
              backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(120, 119, 198, 0.03) 0%, transparent 50%)',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '3px',
                '&:hover': {
                  background: 'rgba(0,0,0,0.3)',
                },
              },
            }}
          >
            {selectedConversation.messages && selectedConversation.messages.length > 0 ? (
              selectedConversation.messages.map((message, index) => {
              const isMe = message.sender === 'user'
              const messageTime = message.timestamp || message.createdAt
              const prevMessageTime = selectedConversation.messages[index - 1]?.timestamp || selectedConversation.messages[index - 1]?.createdAt
              const showTime = index === 0 || 
                (messageTime && prevMessageTime && new Date(messageTime) - new Date(prevMessageTime) > 300000)
              
              return (
                <Fade in key={message.id}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMe ? 'flex-end' : 'flex-start',
                      gap: 0.5,
                    }}
                  >
                    {showTime && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          alignSelf: 'center',
                          px: 2,
                          py: 0.5,
                          bgcolor: 'rgba(0,0,0,0.05)',
                          borderRadius: 2,
                          fontSize: '0.75rem',
                          mb: 0.5,
                        }}
                      >
                        {formatMessageTime(message.timestamp || message.createdAt)}
                      </Typography>
                    )}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: { xs: 0.75, md: 1 },
                        maxWidth: { xs: '85%', md: '70%' },
                        flexDirection: isMe ? 'row-reverse' : 'row',
                      }}
                    >
                      {!isMe && (
                        <Avatar
                          src={selectedConversation.customerAvatar || selectedConversation.avatar}
                          alt={selectedConversation.customerName || selectedConversation.name}
                          sx={{
                            width: { xs: 28, md: 32 },
                            height: { xs: 28, md: 32 },
                            mb: 0.5,
                            display: { xs: 'none', sm: 'flex' },
                          }}
                        />
                      )}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, maxWidth: '100%' }}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: { xs: 1.25, md: 1.75 },
                            bgcolor: isMe ? platformColor : 'white',
                            color: isMe ? 'white' : 'text.primary',
                            borderRadius: isMe 
                              ? { xs: '16px 16px 4px 16px', md: '18px 18px 4px 18px' }
                              : { xs: '16px 16px 16px 4px', md: '18px 18px 18px 4px' },
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            position: 'relative',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                            },
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              fontSize: { xs: '0.875rem', md: '0.9375rem' },
                              lineHeight: 1.5,
                            }}
                          >
                            {message.text}
                          </Typography>
                          {message.attachments && message.attachments.length > 0 && (
                            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {message.attachments.map((attachment, idx) => (
                                attachment.type === 'image' ? (
                                  <Box
                                    key={idx}
                                    component="img"
                                    src={attachment.url}
                                    alt={attachment.name || 'Image'}
                                    sx={{
                                      maxWidth: 200,
                                      maxHeight: 200,
                                      borderRadius: 1,
                                      objectFit: 'cover',
                                    }}
                                  />
                                ) : attachment.type === 'icon' ? (
                                  <Box
                                    key={idx}
                                    sx={{
                                      fontSize: 32,
                                      display: 'inline-block',
                                    }}
                                  >
                                    {attachment.url}
                                  </Box>
                                ) : (
                                  <Chip
                                    key={idx}
                                    label={attachment.name || 'File'}
                                    size="small"
                                    sx={{ fontSize: '0.7rem' }}
                                  />
                                )
                              ))}
                            </Box>
                          )}
                          {message.tags && message.tags.length > 0 && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1.5 }}>
                              {message.tags.map((tag, tagIndex) => (
                                <Chip
                                  key={tagIndex}
                                  label={tag}
                                  size="small"
                                  onDelete={() => handleRemoveTag(message.id, tag)}
                                  sx={{
                                    bgcolor: isMe ? 'rgba(255,255,255,0.25)' : `${platformColor}15`,
                                    color: isMe ? 'white' : platformColor,
                                    fontSize: '0.7rem',
                                    height: 22,
                                    fontWeight: 500,
                                    border: isMe ? 'none' : `1px solid ${platformColor}30`,
                                  }}
                                />
                              ))}
                            </Box>
                          )}
                          <Tooltip title="Thêm tag" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenTagDialog(message)}
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                opacity: 0,
                                transition: 'opacity 0.2s ease',
                                color: isMe ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                                '&:hover': {
                                  bgcolor: isMe ? 'rgba(255,255,255,0.2)' : 'action.hover',
                                },
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = '1'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = '0'
                              }}
                            >
                              <LabelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Paper>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            px: 1,
                            fontSize: '0.75rem',
                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                          }}
                        >
                          {formatTime(message.timestamp || message.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Fade>
              )
            })}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Box
            sx={{
              p: { xs: 1.5, md: 2.5 },
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              display: 'flex',
              gap: { xs: 0.5, md: 1 },
              alignItems: 'flex-end',
            }}
          >
            <Tooltip title="Đính kèm file">
              <IconButton
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    color: platformColor,
                  },
                }}
              >
                <AttachFileIcon fontSize={isMobile ? 'small' : 'medium'} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Emoji">
              <IconButton
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    color: platformColor,
                  },
                }}
              >
                <EmojiEmotionsIcon fontSize={isMobile ? 'small' : 'medium'} />
              </IconButton>
            </Tooltip>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Nhập tin nhắn..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: { xs: 3, md: 4 },
                  bgcolor: 'grey.50',
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                  '&.Mui-focused': {
                    bgcolor: 'white',
                  },
                  '& fieldset': {
                    borderColor: 'divider',
                  },
                },
              }}
            />
            <IconButton
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
              size={isMobile ? 'small' : 'medium'}
              sx={{
                bgcolor: platformColor,
                color: 'white',
                width: { xs: 36, md: 40 },
                height: { xs: 36, md: 40 },
                '&:hover': {
                  bgcolor: platformColor,
                  opacity: 0.9,
                  transform: 'scale(1.05)',
                },
                '&.Mui-disabled': {
                  bgcolor: 'grey.300',
                  color: 'grey.500',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <SendIcon fontSize={isMobile ? 'small' : 'medium'} />
            </IconButton>
          </Box>
        </Paper>
      ) : (
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{ textAlign: 'center', px: 4 }}>
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                bgcolor: `${platformColor}10`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              {platformIcon}
            </Box>
            <Typography
              variant="h6"
              color="text.secondary"
              fontWeight={500}
              gutterBottom
              sx={{ fontSize: '1.25rem' }}
            >
              Chọn một cuộc trò chuyện
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: '0.9375rem' }}
            >
              Bắt đầu trò chuyện với người dùng của bạn
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Tag Dialog */}
      <Dialog
        open={openTagDialog}
        onClose={() => setOpenTagDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1.5, fontWeight: 600 }}>Thêm tag cho tin nhắn</DialogTitle>
        <DialogContent>
          <Autocomplete
            freeSolo
            options={availableTags}
            value={tagInput}
            onInputChange={(event, newValue) => setTagInput(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tag"
                placeholder="Nhập hoặc chọn tag"
                fullWidth
                sx={{ mt: 1 }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LabelIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                {option}
              </Box>
            )}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
          <Button onClick={() => setOpenTagDialog(false)}>Hủy</Button>
          <Button
            onClick={handleAddTag}
            variant="contained"
            disabled={!tagInput.trim()}
            sx={{
              bgcolor: platformColor,
              '&:hover': {
                bgcolor: platformColor,
                opacity: 0.9,
              },
            }}
          >
            Thêm tag
          </Button>
        </DialogActions>
      </Dialog>

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </Box>
  )
}

export default MessageInterface
