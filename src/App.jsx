import { useState, lazy, Suspense, useMemo, useCallback } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box, Toolbar, CircularProgress } from '@mui/material'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import SettingsRequiredCheck from './components/SettingsRequiredCheck'

// Lazy load pages for better performance
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Profile = lazy(() => import('./pages/Profile'))
const FAQs = lazy(() => import('./pages/FAQs'))
const ToneAI = lazy(() => import('./pages/ToneAI'))
const Attributes = lazy(() => import('./pages/Attributes'))
const ProductsList = lazy(() => import('./pages/ProductsList'))
const Promotions = lazy(() => import('./pages/Promotions'))
const Shipping = lazy(() => import('./pages/Shipping'))
const Orders = lazy(() => import('./pages/Orders'))
const Templates = lazy(() => import('./pages/Templates'))
const Settings = lazy(() => import('./pages/Settings'))
const Users = lazy(() => import('./pages/Users'))
const Help = lazy(() => import('./pages/Help'))
const Social = lazy(() => import('./pages/Social'))
const FacebookMessages = lazy(() => import('./pages/FacebookMessages'))
const ZaloMessages = lazy(() => import('./pages/ZaloMessages'))
const TelegramMessages = lazy(() => import('./pages/TelegramMessages'))
const ErrorLogs = lazy(() => import('./pages/ErrorLogs'))
const SuperAdmin = lazy(() => import('./pages/SuperAdmin'))
const QuickBotSetup = lazy(() => import('./pages/QuickBotSetup'))

// Loading component
const PageLoader = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
    }}
  >
    <CircularProgress />
  </Box>
)

const drawerWidth = 260

function App() {
  const { isAuthenticated, user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = useCallback(() => {
    setMobileOpen((prev) => !prev)
  }, [])

  // Memoize main content styles
  const mainStyles = useMemo(
    () => ({
      flexGrow: 1,
      p: { xs: 1.5, sm: 2, md: 3 },
      width: { md: `calc(100% - ${drawerWidth}px)` },
      backgroundColor: (theme) =>
        theme.palette.mode === 'light'
          ? theme.palette.grey[50]
          : theme.palette.grey[900],
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }),
    []
  )

  // Public routes (no layout)
  if (!isAuthenticated) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    )
  }

  // Protected routes (with layout)
  return (
    <SettingsRequiredCheck>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar onMenuClick={handleDrawerToggle} user={user} />
        <Box sx={{ display: 'flex', flex: 1 }}>
          <Sidebar mobileOpen={mobileOpen} onMobileClose={handleDrawerToggle} />
          <Box component="main" sx={mainStyles}>
            <Toolbar />
            <Suspense fallback={<PageLoader />}>
              <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quick-bot-setup"
                element={
                  <ProtectedRoute>
                    <QuickBotSetup />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/faqs"
                element={
                  <ProtectedRoute>
                    <FAQs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tone-ai"
                element={
                  <ProtectedRoute>
                    <ToneAI />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products/attributes"
                element={
                  <ProtectedRoute>
                    <Attributes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products/list"
                element={
                  <ProtectedRoute>
                    <ProductsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/promotions"
                element={
                  <ProtectedRoute>
                    <Promotions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shipping"
                element={
                  <ProtectedRoute>
                    <Shipping />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/templates"
                element={
                  <ProtectedRoute>
                    <Templates />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute permission="users">
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/help"
                element={
                  <ProtectedRoute>
                    <Help />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/social"
                element={
                  <ProtectedRoute>
                    <Social />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/social/facebook"
                element={
                  <ProtectedRoute>
                    <FacebookMessages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/social/zalo"
                element={
                  <ProtectedRoute>
                    <ZaloMessages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/social/telegram"
                element={
                  <ProtectedRoute>
                    <TelegramMessages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/error-logs"
                element={
                  <ProtectedRoute permission="error-logs">
                    <ErrorLogs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin"
                element={
                  <ProtectedRoute>
                    <SuperAdmin />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          {/* <Footer /> */}
        </Box>
      </Box>
    </Box>
    </SettingsRequiredCheck>
  )
}

export default App
