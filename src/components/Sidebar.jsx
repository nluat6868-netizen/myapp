import { useState, memo, useCallback, useMemo } from 'react'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  Typography,
  Collapse,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Psychology as PsychologyIcon,
  ExpandLess,
  ExpandMore,
  Category as CategoryIcon,
  List as ListIcon,
  LocalOffer as LocalOfferIcon,
  LocalShipping as LocalShippingIcon,
  ShoppingCart as ShoppingCartIcon,
  Article as ArticleIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  Help as HelpIcon,
  Share as ShareIcon,
  BugReport as BugReportIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  Facebook as FacebookIcon,
  Telegram as TelegramIcon,
  SmartToy as SmartToyIcon,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const drawerWidth = 260

const Sidebar = memo(function Sidebar({ mobileOpen, onMobileClose }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const location = useLocation()
  const { hasPermission, user } = useAuth()
  const isSuperAdmin = user?.role === 'superAdmin'
  
  const isProductsActive = useMemo(
    () => location.pathname === '/products/attributes' || location.pathname === '/products/list',
    [location.pathname]
  )
  
  const isSocialActive = useMemo(
    () => location.pathname === '/social/facebook' || location.pathname === '/social/zalo' || location.pathname === '/social/telegram',
    [location.pathname]
  )
  
  const [productsOpen, setProductsOpen] = useState(isProductsActive)
  const [socialOpen, setSocialOpen] = useState(isSocialActive)

  const handleNavigation = useCallback(
    (path) => {
      navigate(path)
      if (isMobile) {
        onMobileClose()
      }
    },
    [navigate, isMobile, onMobileClose]
  )

  const handleProductsClick = useCallback(() => {
    setProductsOpen((prev) => !prev)
  }, [])

  const handleSocialClick = useCallback(() => {
    setSocialOpen((prev) => !prev)
  }, [])

  const drawer = (
    <Box>
      <Toolbar
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          minHeight: '64px !important',
        }}
      >
        <Typography variant="h6" noWrap component="div" fontWeight={600}>
          My App
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ pt: 1 }}>
        {/* SuperAdmin Dashboard - Only for SuperAdmin */}
        {isSuperAdmin && (
          <>
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                SuperAdmin
              </Typography>
            </Box>
            <ListItem disablePadding sx={{ mb: 0.5, px: 1 }}>
              <ListItemButton
                onClick={() => handleNavigation('/super-admin')}
                selected={location.pathname === '/super-admin'}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'error.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'error.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === '/super-admin' ? 'white' : 'inherit',
                    minWidth: 40,
                  }}
                >
                  <AdminPanelSettingsIcon />
                </ListItemIcon>
                <ListItemText primary="SuperAdmin" />
              </ListItemButton>
            </ListItem>
            <Divider sx={{ my: 1, mx: 2 }} />
          </>
        )}

        {/* Dashboard - Main */}
        {hasPermission('dashboard') && (
          <>
            <ListItem disablePadding sx={{ mb: 0.5, px: 1 }}>
              <ListItemButton
                onClick={() => handleNavigation('/')}
                selected={location.pathname === '/'}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === '/' ? 'white' : 'inherit',
                    minWidth: 40,
                  }}
                >
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>

            {/* Tạo chat Bot Nhanh */}
            <ListItem disablePadding sx={{ mb: 0.5, px: 1 }}>
              <ListItemButton
                onClick={() => handleNavigation('/quick-bot-setup')}
                selected={location.pathname === '/quick-bot-setup'}
                sx={{
                  borderRadius: 2,
                  bgcolor: 'success.light',
                  color: 'success.contrastText',
                  '&.Mui-selected': {
                    backgroundColor: 'success.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'success.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'success.main',
                    color: 'white',
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === '/quick-bot-setup' ? 'white' : 'inherit',
                    minWidth: 40,
                  }}
                >
                  <SmartToyIcon />
                </ListItemIcon>
                <ListItemText primary="Tạo chat Bot Nhanh" />
              </ListItemButton>
            </ListItem>
            <Divider sx={{ my: 1, mx: 2 }} />
          </>
        )}

        {/* Quản lý sản phẩm */}
        {hasPermission('products') && (
          <>
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                Sản phẩm
              </Typography>
            </Box>
            <ListItem disablePadding sx={{ mb: 0.5, px: 1 }}>
              <ListItemButton
                onClick={handleProductsClick}
                selected={isProductsActive}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isProductsActive ? 'white' : 'inherit',
                    minWidth: 40,
                  }}
                >
                  <InventoryIcon />
                </ListItemIcon>
                <ListItemText primary="Sản phẩm" />
                {productsOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={productsOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton
                  sx={{ pl: 4 }}
                  onClick={() => handleNavigation('/products/attributes')}
                  selected={location.pathname === '/products/attributes'}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CategoryIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Thuộc tính" />
                </ListItemButton>
                <ListItemButton
                  sx={{ pl: 4 }}
                  onClick={() => handleNavigation('/products/list')}
                  selected={location.pathname === '/products/list'}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <ListIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Danh sách sản phẩm" />
                </ListItemButton>
              </List>
            </Collapse>
            <Divider sx={{ my: 1, mx: 2 }} />
          </>
        )}

        {/* Quản lý bán hàng */}
        {(hasPermission('orders') || hasPermission('promotions') || hasPermission('shipping')) && (
          <>
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                Bán hàng
              </Typography>
            </Box>
            {hasPermission('orders') && (
              <ListItem disablePadding sx={{ mb: 0.5, px: 1 }}>
                <ListItemButton
                  onClick={() => handleNavigation('/orders')}
                  selected={location.pathname === '/orders'}
                  sx={{
                    borderRadius: 2,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: location.pathname === '/orders' ? 'white' : 'inherit',
                      minWidth: 40,
                    }}
                  >
                    <ShoppingCartIcon />
                  </ListItemIcon>
                  <ListItemText primary="Đơn hàng" />
                </ListItemButton>
              </ListItem>
            )}
            {hasPermission('promotions') && (
              <ListItem disablePadding sx={{ mb: 0.5, px: 1 }}>
                <ListItemButton
                  onClick={() => handleNavigation('/promotions')}
                  selected={location.pathname === '/promotions'}
                  sx={{
                    borderRadius: 2,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: location.pathname === '/promotions' ? 'white' : 'inherit',
                      minWidth: 40,
                    }}
                  >
                    <LocalOfferIcon />
                  </ListItemIcon>
                  <ListItemText primary="Khuyến mãi" />
                </ListItemButton>
              </ListItem>
            )}
            {hasPermission('shipping') && (
              <ListItem disablePadding sx={{ mb: 0.5, px: 1 }}>
                <ListItemButton
                  onClick={() => handleNavigation('/shipping')}
                  selected={location.pathname === '/shipping'}
                  sx={{
                    borderRadius: 2,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: location.pathname === '/shipping' ? 'white' : 'inherit',
                      minWidth: 40,
                    }}
                  >
                    <LocalShippingIcon />
                  </ListItemIcon>
                  <ListItemText primary="Vận chuyển" />
                </ListItemButton>
              </ListItem>
            )}
            <Divider sx={{ my: 1, mx: 2 }} />
          </>
        )}

        {/* Mạng XH */}
        {hasPermission('social') && (
          <>
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                Mạng XH
              </Typography>
            </Box>
            <ListItem disablePadding sx={{ mb: 0.5, px: 1 }}>
              <ListItemButton
                onClick={handleSocialClick}
                selected={isSocialActive}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isSocialActive ? 'white' : 'inherit',
                    minWidth: 40,
                  }}
                >
                  <ShareIcon />
                </ListItemIcon>
                <ListItemText primary="Mạng XH" />
                {socialOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={socialOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton
                  sx={{ pl: 4 }}
                  onClick={() => handleNavigation('/social/facebook')}
                  selected={location.pathname === '/social/facebook'}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <FacebookIcon fontSize="small" sx={{ color: '#1877F2' }} />
                  </ListItemIcon>
                  <ListItemText primary="Facebook" />
                </ListItemButton>
                <ListItemButton
                  sx={{ pl: 4 }}
                  onClick={() => handleNavigation('/social/zalo')}
                  selected={location.pathname === '/social/zalo'}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: '#006AFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                      }}
                    >
                      Z
                    </Box>
                  </ListItemIcon>
                  <ListItemText primary="Zalo" />
                </ListItemButton>
                <ListItemButton
                  sx={{ pl: 4 }}
                  onClick={() => handleNavigation('/social/telegram')}
                  selected={location.pathname === '/social/telegram'}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <TelegramIcon fontSize="small" sx={{ color: '#0088cc' }} />
                  </ListItemIcon>
                  <ListItemText primary="Telegram" />
                </ListItemButton>
              </List>
            </Collapse>
            <Divider sx={{ my: 1, mx: 2 }} />
          </>
        )}

        {/* Quản lý nội dung */}
        {(hasPermission('faqs') || hasPermission('tone-ai') || hasPermission('templates')) && (
          <>
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                Nội dung
              </Typography>
            </Box>
            {hasPermission('faqs') && (
              <ListItem disablePadding sx={{ mb: 0.5, px: 1 }}>
                <ListItemButton
                  onClick={() => handleNavigation('/faqs')}
                  selected={location.pathname === '/faqs'}
                  sx={{
                    borderRadius: 2,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: location.pathname === '/faqs' ? 'white' : 'inherit',
                      minWidth: 40,
                    }}
                  >
                    <QuestionAnswerIcon />
                  </ListItemIcon>
                  <ListItemText primary="FAQs" />
                </ListItemButton>
              </ListItem>
            )}
            {hasPermission('tone-ai') && (
              <ListItem disablePadding sx={{ mb: 0.5, px: 1 }}>
                <ListItemButton
                  onClick={() => handleNavigation('/tone-ai')}
                  selected={location.pathname === '/tone-ai'}
                  sx={{
                    borderRadius: 2,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: location.pathname === '/tone-ai' ? 'white' : 'inherit',
                      minWidth: 40,
                    }}
                  >
                    <PsychologyIcon />
                  </ListItemIcon>
                  <ListItemText primary="Tone AI" />
                </ListItemButton>
              </ListItem>
            )}
            {hasPermission('templates') && (
              <ListItem disablePadding sx={{ mb: 0.5, px: 1 }}>
                <ListItemButton
                  onClick={() => handleNavigation('/templates')}
                  selected={location.pathname === '/templates'}
                  sx={{
                    borderRadius: 2,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: location.pathname === '/templates' ? 'white' : 'inherit',
                      minWidth: 40,
                    }}
                  >
                    <ArticleIcon />
                  </ListItemIcon>
                  <ListItemText primary="Template" />
                </ListItemButton>
              </ListItem>
            )}
            <Divider sx={{ my: 1, mx: 2 }} />
          </>
        )}

        {/* Quản lý hệ thống */}
        {(hasPermission('users') || hasPermission('settings')) && (
          <>
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                Hệ thống
              </Typography>
            </Box>
            {hasPermission('users') && (
              <ListItem disablePadding sx={{ mb: 0.5, px: 1 }}>
                <ListItemButton
                  onClick={() => handleNavigation('/users')}
                  selected={location.pathname === '/users'}
                  sx={{
                    borderRadius: 2,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: location.pathname === '/users' ? 'white' : 'inherit',
                      minWidth: 40,
                    }}
                  >
                    <PeopleIcon />
                  </ListItemIcon>
                  <ListItemText primary="Người dùng" />
                </ListItemButton>
              </ListItem>
            )}
            {hasPermission('settings') && (
              <ListItem disablePadding sx={{ mb: 0.5, px: 1 }}>
                <ListItemButton
                  onClick={() => handleNavigation('/settings')}
                  selected={location.pathname === '/settings'}
                  sx={{
                    borderRadius: 2,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: location.pathname === '/settings' ? 'white' : 'inherit',
                      minWidth: 40,
                    }}
                  >
                    <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Cài đặt" />
                </ListItemButton>
              </ListItem>
            )}
            <Divider sx={{ my: 1, mx: 2 }} />
          </>
        )}

        {/* Hỗ trợ */}
        {(hasPermission('help') || hasPermission('error-logs')) && (
          <>
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                Hỗ trợ
              </Typography>
            </Box>
            {hasPermission('help') && (
              <ListItem disablePadding sx={{ mb: 0.5, px: 1 }}>
                <ListItemButton
                  onClick={() => handleNavigation('/help')}
                  selected={location.pathname === '/help'}
                  sx={{
                    borderRadius: 2,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: location.pathname === '/help' ? 'white' : 'inherit',
                      minWidth: 40,
                    }}
                  >
                    <HelpIcon />
                  </ListItemIcon>
                  <ListItemText primary="Trợ giúp" />
                </ListItemButton>
              </ListItem>
            )}
            {hasPermission('error-logs') && (
              <ListItem disablePadding sx={{ mb: 0.5, px: 1 }}>
                <ListItemButton
                  onClick={() => handleNavigation('/error-logs')}
                  selected={location.pathname === '/error-logs'}
                  sx={{
                    borderRadius: 2,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: location.pathname === '/error-logs' ? 'white' : 'inherit',
                      minWidth: 40,
                    }}
                  >
                    <BugReportIcon />
                  </ListItemIcon>
                  <ListItemText primary="Log lỗi" />
                </ListItemButton>
              </ListItem>
            )}
          </>
        )}
      </List>
    </Box>
  )

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </Drawer>
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  )
})

export default Sidebar
