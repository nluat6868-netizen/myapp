import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Box, CircularProgress, Alert } from '@mui/material'

function ProtectedRoute({ children, permission }) {
  const { isAuthenticated, isLoading, hasPermission } = useAuth()

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check permission if required
  if (permission && !hasPermission(permission)) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          Bạn không có quyền truy cập trang này!
        </Alert>
      </Box>
    )
  }

  return children
}

export default ProtectedRoute

