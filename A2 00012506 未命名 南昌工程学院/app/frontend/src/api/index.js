import axios from 'axios'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { ErrorHandler } from '@/utils/errorHandler'

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 10000,
  withCredentials: true, // 启用cookie支持
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(config => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

// 响应拦截器
api.interceptors.response.use(response => {
  return response.data
}, async error => {
  const originalRequest = error.config
  
  // 处理401错误 - token过期
  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true
    try {
      const refreshResponse = await axios.post('/auth/refresh')
      const newToken = refreshResponse.data.token
      setToken(newToken)
      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return api(originalRequest)
    } catch (refreshError) {
      removeToken()
      // 只在非登录页面时跳转，避免在登录页面时刷新
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
      return Promise.reject(refreshError)
    }
  }

  // 使用统一错误处理
  ErrorHandler.handleApiError(error, 'API请求', false)
  return Promise.reject(error)
})

export default api