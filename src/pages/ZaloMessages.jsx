import { Typography, Box, Paper, Chip, Grid, useMediaQuery, useTheme } from '@mui/material'
import { Message as MessageIcon, ShoppingCart as ShoppingCartIcon } from '@mui/icons-material'
import MessageInterface from '../components/MessageInterface'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// Zalo icon component
const ZaloIcon = ({ size = 32 }) => (
  <Box
    component="svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z"
      fill="#006AFF"
    />
  </Box>
)

function ZaloMessages() {
  const dispatch = useDispatch()
  const { stats, selectedConversation } = useSelector((state) => state.messages)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  useEffect(() => {
    // Load stats from API
    dispatch({ type: 'GET_MESSAGE_STATS_REQUEST', payload: 'zalo' })
  }, [dispatch])

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', p: { xs: selectedConversation ? 0 : 1, sm: selectedConversation ? 0 : 2, md: selectedConversation ? 0 : 3 } }}>
      <Paper
        elevation={0}
        sx={{
          mb: { xs: 2, md: 3 },
          p: { xs: 2, md: 3 },
          borderRadius: { xs: 2, md: 3 },
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          display: selectedConversation ? 'none' : 'block',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 2 } }}>
            <Box
              sx={{
                width: { xs: 48, md: 56 },
                height: { xs: 48, md: 56 },
                borderRadius: 2,
                bgcolor: '#006AFF15',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ZaloIcon size={24} />
            </Box>
            <Box>
              <Typography
                variant="h5"
                component="h1"
                fontWeight={700}
                sx={{ mb: 0.5, fontSize: { xs: '1.125rem', md: '1.5rem' } }}
              >
                Zalo Messages
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}
              >
                Quản lý và trả lời tin nhắn từ Zalo
              </Typography>
            </Box>
          </Box>
          <Chip
            label="Đang hoạt động"
            color="success"
            size="small"
            sx={{ fontWeight: 500 }}
          />
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: '#006AFF10',
                border: '1px solid',
                borderColor: '#006AFF30',
                textAlign: 'center',
              }}
            >
              <MessageIcon sx={{ fontSize: 32, color: '#006AFF', mb: 1 }} />
              <Typography variant="h4" fontWeight={700} sx={{ color: '#006AFF', mb: 0.5 }}>
                {stats.totalMessages}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                Tin nhắn đến
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: '#2e7d3210',
                border: '1px solid',
                borderColor: '#2e7d3230',
                textAlign: 'center',
              }}
            >
              <ShoppingCartIcon sx={{ fontSize: 32, color: '#2e7d32', mb: 1 }} />
              <Typography variant="h4" fontWeight={700} sx={{ color: '#2e7d32', mb: 0.5 }}>
                {stats.closedOrders}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                Khách hàng chốt đơn
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
      <Box sx={{ flex: 1, minHeight: 0, height: selectedConversation ? '100vh' : 'auto', flexGrow: 1 }}>
        <MessageInterface
          platform="zalo"
          platformIcon={<ZaloIcon size={48} />}
          platformColor="#006AFF"
        />
      </Box>
    </Box>
  )
}

export default ZaloMessages

