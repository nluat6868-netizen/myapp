import { memo } from 'react'
import { Box, Container, Typography, Link, Grid } from '@mui/material'

const Footer = memo(function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        px: 2,
        mt: { xs: 6, sm: 8, md: 10 },
        mb: 2,
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[900],
        borderTop: '1px solid',
        borderColor: 'divider',
        borderTopLeftRadius: { xs: 16, sm: 24 },
        borderTopRightRadius: { xs: 16, sm: 24 },
        boxShadow: (theme) =>
          theme.palette.mode === 'light'
            ? '0 -2px 8px rgba(0, 0, 0, 0.08)'
            : '0 -2px 8px rgba(0, 0, 0, 0.3)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'rgba(255, 255, 255, 0.6)'
                    : 'rgba(255, 255, 255, 0.05)',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="h6" gutterBottom fontWeight={600}>
                My App
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ứng dụng quản lý hiện đại được xây dựng với React và Material-UI
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'rgba(255, 255, 255, 0.6)'
                    : 'rgba(255, 255, 255, 0.05)',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                Liên kết
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Link href="#" color="text.secondary" underline="hover" variant="body2">
                  Trang chủ
                </Link>
                <Link href="#" color="text.secondary" underline="hover" variant="body2">
                  Về chúng tôi
                </Link>
                <Link href="#" color="text.secondary" underline="hover" variant="body2">
                  Liên hệ
                </Link>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'rgba(255, 255, 255, 0.6)'
                    : 'rgba(255, 255, 255, 0.05)',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                Hỗ trợ
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Link href="#" color="text.secondary" underline="hover" variant="body2">
                  Trợ giúp
                </Link>
                <Link href="#" color="text.secondary" underline="hover" variant="body2">
                  Tài liệu
                </Link>
                <Link href="#" color="text.secondary" underline="hover" variant="body2">
                  Chính sách
                </Link>
              </Box>
            </Box>
          </Grid>
        </Grid>
        <Box
          sx={{
            mt: 4,
            pt: 3,
            borderTop: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? 'rgba(255, 255, 255, 0.4)'
                : 'rgba(255, 255, 255, 0.03)',
            p: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} My App. Tất cả quyền được bảo lưu.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
})

export default Footer

