import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tgtg_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('tgtg_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const login = (data) => api.post('/api/auth/login', data)
export const register = (data) => api.post('/api/auth/register', data)
export const getMe = () => api.get('/api/auth/me')

export const getStores = (params) => api.get('/api/stores/', { params })
export const getStore = (id) => api.get(`/api/stores/${id}`)
export const getStoreBags = (id) => api.get(`/api/stores/${id}/bags`)
export const createStore = (data) => api.post('/api/stores/', data)

export const getAllBags = () => api.get('/api/bags/')
export const createBag = (data) => api.post('/api/bags/', data)
export const getIncomingOrders = () => api.get('/api/orders/incoming')

export const getFlexQuote = (storeId, punches) => api.get(`/api/flexpass/quote/${storeId}`, { params: { punches } })
export const buyFlexPass = (data) => api.post('/api/flexpass/', data)
export const getMyFlexPasses = () => api.get('/api/flexpass/my')
export const redeemFlexPass = (id) => api.post(`/api/flexpass/${id}/redeem`)

export const getStoreAddOns = (storeId) => api.get(`/api/addons/store/${storeId}`)
export const createAddOn = (data) => api.post('/api/addons/', data)
export const deleteAddOn = (id) => api.delete(`/api/addons/${id}`)

export const createOrder = (data) => api.post('/api/orders/', data)
export const getMyOrders = () => api.get('/api/orders/my')
export const updateOrderStatus = (id, status) =>
  api.patch(`/api/orders/${id}/status`, null, { params: { status } })

export const updateProfile = (data) => api.patch('/api/users/profile', null, { params: data })
export const updateDietary = (data) => api.patch('/api/users/dietary', data)
export const toggleFavorite = (storeId) => api.post(`/api/users/favorites/${storeId}`)
export const getFavorites = () => api.get('/api/users/favorites')

export default api
