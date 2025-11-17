import { useState, memo, useCallback, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Box,
  useTheme,
  useMediaQuery,
  Badge,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
} from '@mui/material'
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Person,
  Notifications as NotificationsIcon,
  Circle as CircleIcon,
  History as HistoryIcon,
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'

const Navbar = memo(function Navbar({ onMenuClick, user }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { logout } = useAuth()
  const { logs: activityLogs } = useSelector((state) => state.activityLogs)
  const [anchorEl, setAnchorEl] = useState(null)
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null)
  const [readLogs, setReadLogs] = useState(new Set())
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const open = Boolean(anchorEl)
  const notificationOpen = Boolean(notificationAnchorEl)

  // Load activity logs
  useEffect(() => {
    dispatch({ type: 'GET_ACTIVITY_LOGS_REQUEST', payload: { limit: 20 } })
  }, [dispatch])

  // Load read logs from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('readActivityLogs')
      if (saved) {
        setReadLogs(new Set(JSON.parse(saved)))
      }
    } catch (error) {
      console.error('Error loading read logs:', error)
    }
  }, [])

  // Save read logs to localStorage
  useEffect(() => {
    if (readLogs.size > 0) {
      try {
        localStorage.setItem('readActivityLogs', JSON.stringify(Array.from(readLogs)))
      } catch (error) {
        console.error('Error saving read logs:', error)
      }
    }
  }, [readLogs])

  // Convert activity logs to notifications format
  const notifications = useMemo(() => {
    if (!activityLogs || activityLogs.length === 0) return []
    
    return activityLogs.slice(0, 20).map((log) => ({
      id: log._id || log.id,
      title: log.action,
      message: log.description,
      type: 'activity',
      time: log.createdAt,
      read: readLogs.has(log._id || log.id),
      log: log,
    }))
  }, [activityLogs, readLogs])

  const handleClick = useCallback((event) => {
    setAnchorEl(event.currentTarget)
  }, [])

  const handleClose = useCallback(() => {
    setAnchorEl(null)
  }, [])

  const handleProfile = useCallback(() => {
    handleClose()
    navigate('/profile')
  }, [navigate, handleClose])

  const handleLogout = useCallback(() => {
    handleClose()
    logout()
    navigate('/login')
  }, [logout, navigate, handleClose])

  const handleNotificationIconClick = useCallback((event) => {
    setNotificationAnchorEl(event.currentTarget)
  }, [])

  const handleNotificationClose = useCallback(() => {
    setNotificationAnchorEl(null)
  }, [])

  const handleMarkAsRead = useCallback((id) => {
    setReadLogs((prev) => new Set([...prev, id]))
  }, [])

  const handleMarkAllAsRead = useCallback(() => {
    const allIds = notifications.map((notif) => notif.id)
    setReadLogs((prev) => new Set([...prev, ...allIds]))
  }, [notifications])

  const handleNotificationClick = useCallback((notif) => {
    if (!notif.read) {
      handleMarkAsRead(notif.id)
    }
    // Navigate to dashboard to see full activity log
    handleNotificationClose()
    navigate('/')
  }, [navigate, handleMarkAsRead, handleNotificationClose])

  const unreadCount = useMemo(
    () => notifications.filter((notif) => !notif.read).length,
    [notifications]
  )

  const formatTime = useCallback((timeString) => {
    const time = new Date(timeString)
    const now = new Date()
    const diff = now - time
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Vừa xong'
    if (minutes < 60) return `${minutes} phút trước`
    if (hours < 24) return `${hours} giờ trước`
    if (days < 7) return `${days} ngày trước`
    return time.toLocaleDateString('vi-VN')
  }, [])

  const userInitial = useMemo(
    () => user?.name?.charAt(0)?.toUpperCase() || 'U',
    [user?.name]
  )

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: '#fff',
        color: '#000',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
      }}
    >
      <Toolbar>
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
          Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Notifications */}
          <IconButton
            onClick={handleNotificationIconClick}
            size="small"
            aria-controls={notificationOpen ? 'notification-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={notificationOpen ? 'true' : undefined}
            sx={{ color: 'inherit' }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
            {user?.name || 'Người dùng'}
          </Typography>
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 1 }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <Avatar
              src={user?.avatar}
              sx={{
                width: 36,
                height: 36,
                bgcolor: 'primary.main',
                cursor: 'pointer',
              }}
            >
              {userInitial}
            </Avatar>
          </IconButton>
        </Box>
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          PaperProps={{
            elevation: 3,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              minWidth: 200,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleClose}>
            <Avatar src={user?.avatar} sx={{ bgcolor: 'primary.main' }}>
              {userInitial}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {user?.name || 'Người dùng'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email || 'user@example.com'}
              </Typography>
            </Box>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleProfile}>
            <Person sx={{ mr: 2, fontSize: 20 }} />
            Thông tin tài khoản
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <Logout sx={{ mr: 2, fontSize: 20 }} />
            Đăng xuất
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationAnchorEl}
          id="notification-menu"
          open={notificationOpen}
          onClose={handleNotificationClose}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1.5,
              minWidth: 320,
              maxWidth: 400,
              maxHeight: 500,
              overflow: 'auto',
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ p: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              Hoạt động gần đây
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} mới`}
                size="small"
                color="primary"
                onClick={handleMarkAllAsRead}
                sx={{ cursor: 'pointer' }}
              />
            )}
          </Box>
          <Divider />
          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Chưa có hoạt động nào
              </Typography>
            </Box>
          ) : (
            <>
              {notifications.map((notif) => (
                <MenuItem
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    bgcolor: notif.read ? 'transparent' : 'action.selected',
                    borderLeft: notif.read ? 'none' : '3px solid',
                    borderColor: 'primary.main',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {!notif.read && (
                      <CircleIcon
                        sx={{
                          fontSize: 8,
                          color: 'primary.main',
                        }}
                      />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={notif.read ? 400 : 600}>
                        {notif.log?.user?.name || notif.log?.user?.email || 'Hệ thống'}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {notif.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          {formatTime(notif.time)}
                        </Typography>
                      </Box>
                    }
                  />
                </MenuItem>
              ))}
              <Divider />
              <Box sx={{ p: 1.5, textAlign: 'center' }}>
                <Button
                  size="small"
                  startIcon={<HistoryIcon />}
                  onClick={() => {
                    navigate('/')
                    handleNotificationClose()
                  }}
                  fullWidth
                >
                  Xem tất cả hoạt động
                </Button>
              </Box>
            </>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  )
})

export default Navbar

