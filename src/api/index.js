import axios from 'axios'

export const getImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${import.meta.env.VITE_API_BASE_URL}${url}`
}

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
})

// 요청마다 JWT 자동 첨부
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 401 → 로그인 페이지로
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────
export const signup = (data) => api.post('/auth/signup', data)
export const login = (data) => api.post('/auth/login', data)
export const getMyProfile = () => api.get('/auth/me')
export const updateMyProfile = (data) => api.put('/auth/me', data)
export const getMySellingProducts = () => api.get('/auth/me/products')

// ── Products ──────────────────────────────────────────────
export const getProducts = (params) => api.get('/products', { params })
export const getProduct = (id) => api.get(`/products/${id}`)
export const createProduct = (formData) =>
  api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const updateProduct = (id, data) => api.put(`/products/${id}`, data)
export const deleteProduct = (id) => api.delete(`/products/${id}`)
export const updateProductStatus = (id, status) =>
  api.patch(`/products/${id}/status`, { status })

// ── Chat ──────────────────────────────────────────────────
export const createChatRoom = (productId) => api.post('/chat/rooms', { productId })
export const getChatRooms = () => api.get('/chat/rooms')
export const getChatMessages = (roomId) => api.get(`/chat/rooms/${roomId}/messages`)
export const getTotalUnread = () => api.get('/chat/unread')

// ── Wish ──────────────────────────────────────────────────
export const toggleWish = (productId) => api.post(`/wishes/${productId}`)
export const getWishes = () => api.get('/wishes')

// ── Review ────────────────────────────────────────────────
export const createReview = (data) => api.post('/reviews', data)
export const getUserReviews = (userId) => api.get(`/reviews/users/${userId}`)
export const getMyReceivedReviews = () => api.get('/reviews/me')

// ── Order ────────────────────────────────────────────
export const createOrder = (data) => api.post('/orders', data)
export const getMyOrders = () => api.get('/orders')
export const getOrder = (id) => api.get(`/orders/${id}`)

// ── AI ────────────────────────────────────────────
export const generateAiDescription = (data) => api.post('/ai/description', data)

// ── Report ────────────────────────────────────────────────
export const createReport = (data) => api.post('/reports', data)