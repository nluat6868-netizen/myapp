import axios from 'axios'

// Vite uses import.meta.env instead of process.env
// Environment variables must be prefixed with VITE_
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Helper function to get error message
const getErrorMessage = (error) => {
  // Network error (no response from server)
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return 'Kết nối quá thời gian. Vui lòng thử lại.'
    }
    if (error.message === 'Network Error') {
      return 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'
    }
    return 'Lỗi kết nối. Vui lòng thử lại sau.'
  }

  // Server responded with error status
  const status = error.response.status
  const data = error.response.data

  // Handle specific status codes
  switch (status) {
    case 400:
      return data?.message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.'
    case 401:
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Delay redirect to allow error to be shown
      setTimeout(() => {
        window.location.href = '/login'
      }, 1000)
      return data?.message || 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
    case 403:
      return data?.message || 'Bạn không có quyền thực hiện thao tác này.'
    case 404:
      return data?.message || 'Không tìm thấy dữ liệu.'
    case 409:
      return data?.message || 'Dữ liệu đã tồn tại. Vui lòng kiểm tra lại.'
    case 422:
      return data?.message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.'
    case 500:
      return data?.message || 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.'
    case 502:
      return 'Máy chủ không phản hồi. Vui lòng thử lại sau.'
    case 503:
      return 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.'
    case 504:
      return 'Hết thời gian chờ phản hồi từ máy chủ. Vui lòng thử lại.'
    default:
      return data?.message || `Lỗi không xác định (${status}). Vui lòng thử lại.`
  }
}

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Attach formatted error message to error object
    error.formattedMessage = getErrorMessage(error)
    
    // Log error for debugging (only in development)
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        status: error.response?.status,
        message: error.formattedMessage,
        data: error.response?.data,
        originalError: error,
      })
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
}

// Users API
export const usersAPI = {
  getUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
}

// FAQs API
export const faqsAPI = {
  getFAQs: () => api.get('/faqs'),
  getFAQById: (id) => api.get(`/faqs/${id}`),
  createFAQ: (faqData) => api.post('/faqs', faqData),
  updateFAQ: (id, faqData) => api.put(`/faqs/${id}`, faqData),
  deleteFAQ: (id) => api.delete(`/faqs/${id}`),
}

// Product Attributes API
export const productAttributesAPI = {
  getAttributes: () => api.get('/product-attributes'),
  getAttributeById: (id) => api.get(`/product-attributes/${id}`),
  createAttribute: (attributeData) => api.post('/product-attributes', attributeData),
  updateAttribute: (id, attributeData) => api.put(`/product-attributes/${id}`, attributeData),
  deleteAttribute: (id) => api.delete(`/product-attributes/${id}`),
  updateAttributeOrder: (attributes) => api.put('/product-attributes/order', { attributes }),
}

// Products API
export const productsAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  createProduct: (productData) => api.post('/products', productData),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}`),
}

// Orders API
export const ordersAPI = {
  getOrders: (params) => api.get('/orders', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  createOrder: (orderData) => api.post('/orders', orderData),
  updateOrder: (id, orderData) => api.put(`/orders/${id}`, orderData),
  deleteOrder: (id) => api.delete(`/orders/${id}`),
  deleteOrders: (ids) => api.post('/orders/bulk-delete', { ids }),
}

// Templates API
export const templatesAPI = {
  getTemplates: () => api.get('/templates'),
  getTemplateById: (id) => api.get(`/templates/${id}`),
  createTemplate: (templateData) => api.post('/templates', templateData),
  updateTemplate: (id, templateData) => api.put(`/templates/${id}`, templateData),
  deleteTemplate: (id) => api.delete(`/templates/${id}`),
}

// Tones API
export const tonesAPI = {
  getTones: () => api.get('/tones'),
  getToneById: (id) => api.get(`/tones/${id}`),
  createTone: (toneData) => api.post('/tones', toneData),
  updateTone: (id, toneData) => api.put(`/tones/${id}`, toneData),
  deleteTone: (id) => api.delete(`/tones/${id}`),
}

// Settings API
export const settingsAPI = {
  getSettings: () => api.get('/settings'),
  updateSettings: (settingsData) => api.put('/settings', settingsData),
}

// Tickets API
export const ticketsAPI = {
  getTickets: (params) => api.get('/tickets', { params }),
  getTicketById: (id) => api.get(`/tickets/${id}`),
  createTicket: (ticketData) => api.post('/tickets', ticketData),
  updateTicket: (id, ticketData) => api.put(`/tickets/${id}`, ticketData),
  deleteTicket: (id) => api.delete(`/tickets/${id}`),
  addComment: (id, comment) => api.post(`/tickets/${id}/comments`, { comment }),
}

// Activity Logs API
export const activityLogsAPI = {
  getActivityLogs: (params) => api.get('/activity-logs', { params }),
  getActivityStats: () => api.get('/activity-logs/stats'),
}

// Social Connections API
export const socialConnectionsAPI = {
  getSocialConnections: () => api.get('/social-connections'),
  getSocialConnectionByPlatform: (platform) => api.get(`/social-connections/${platform}`),
  connectSocialPlatform: (platform) => api.post(`/social-connections/${platform}/connect`),
  handleSocialCallback: (platform, data) => api.post(`/social-connections/${platform}/callback`, data),
  disconnectSocialPlatform: (platform) => api.post(`/social-connections/${platform}/disconnect`),
}

// Social Posts API
export const socialPostsAPI = {
  publishPost: (postData) => api.post('/social-posts/publish', postData),
}

// Promotions API
export const promotionsAPI = {
  getPromotions: () => api.get('/promotions'),
  getPromotionById: (id) => api.get(`/promotions/${id}`),
  createPromotion: (promotionData) => api.post('/promotions', promotionData),
  updatePromotion: (id, promotionData) => api.put(`/promotions/${id}`, promotionData),
  deletePromotion: (id) => api.delete(`/promotions/${id}`),
}

// SuperAdmin API
// Messages API
export const messagesAPI = {
  getConversations: (platform) => api.get('/messages/conversations', { params: { platform } }),
  createConversation: (conversationData) => api.post('/messages/conversations', conversationData),
  getConversation: (id) => api.get(`/messages/conversations/${id}`),
  updateConversation: (id, conversationData) => api.put(`/messages/conversations/${id}`, conversationData),
  deleteConversation: (id) => api.delete(`/messages/conversations/${id}`),
  createMessage: (messageData) => api.post('/messages', messageData),
  updateMessage: (id, messageData) => api.put(`/messages/${id}`, messageData),
  deleteMessage: (id) => api.delete(`/messages/${id}`),
  getMessageStats: (platform) => api.get('/messages/stats', { params: { platform } }),
}

export const superAdminAPI = {
  getDashboard: () => api.get('/super-admin/dashboard'),
  getAllAdmins: () => api.get('/super-admin/admins'),
  getAdminStats: () => api.get('/super-admin/stats'),
  getIndustryReport: () => api.get('/super-admin/industries'),
  getAdminDetails: (id) => api.get(`/super-admin/admins/${id}`),
  deleteAdmin: (id) => api.delete(`/super-admin/admins/${id}`),
}

export default api

