import axios from 'axios'
import { getToken, setToken, removeToken } from '@/utils/auth'

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 10000,
  withCredentials: true,  // 添加这行以支持跨域cookie
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
}, error => {
  console.error('API Error:', error)
  
  // 处理401错误 - token过期（只在非登录页面时跳转）
  if (error.response?.status === 401) {
    removeToken()
    // 检查当前是否在登录页面，避免在登录页面时刷新
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
    return Promise.reject(new Error(error.response.data?.message || '登录已过期，请重新登录'))
  }
  
  // 处理400错误（包括验证码错误）
  if (error.response?.status === 400) {
    const message = error.response.data?.message || '请求参数错误'
    return Promise.reject(new Error(message))
  }
  
  // 处理404错误
  if (error.response?.status === 404) {
    return Promise.reject(new Error('请求的资源不存在'))
  }
  
  // 处理其他HTTP错误
  const message = error.response?.data?.message || '请求失败'
  return Promise.reject(new Error(message))
})

// 生成简单的验证码（模拟功能）
function generateSimpleCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  // 创建简单的SVG验证码
  const svg = `
    <svg width="120" height="40" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="40" fill="white" stroke="#ddd" stroke-width="1"/>
      <text x="60" y="25" font-family="Arial, sans-serif" font-size="18" 
            text-anchor="middle" fill="#333" font-weight="bold">${result}</text>
      <line x1="10" y1="15" x2="110" y2="25" stroke="#ddd" stroke-width="1"/>
      <line x1="10" y1="25" x2="110" y2="15" stroke="#ddd" stroke-width="1"/>
    </svg>
  `
  
  return {
    text: result,
    image: `data:image/svg+xml;base64,${btoa(svg)}`
  }
}

export const authAPI = {
  // 获取验证码
  async getCaptcha() {
    try {
      const response = await api.get('/api/captcha')
      return response
    } catch (error) {
      console.error('获取验证码失败:', error)
      // 不要使用模拟验证码，直接抛出错误
      throw error
    }
  },

  // 用户登录
  async userLogin(data) {
    try {
      const response = await api.post('/api/user-login', data)
      return response
    } catch (error) {
      console.error('用户登录失败:', error)
      throw error
    }
  },

  // 管理员登录
  async adminLogin(data) {
    try {
      const response = await api.post('/api/admin-login', data)
      return response
    } catch (error) {
      console.error('管理员登录失败:', error)
      throw error
    }
  },

  // 用户注册
  async register(data) {
    try {
      const response = await api.post('/api/register', data)
      return response
    } catch (error) {
      console.error('用户注册失败:', error)
      throw error
    }
  },

  // 退出登录
  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('userType')
    return Promise.resolve()
  },

  // 生成图片验证码
  async sendCaptchaCode(phone, purpose = 'reset') {
    try {
      const response = await api.post('/api/send-captcha', { phone, purpose })
      return response
    } catch (error) {
      console.error('生成图片验证码失败:', error)
      throw error
    }
  },

  // 重置密码
  async resetPassword(data) {
    try {
      const response = await api.post('/api/reset-password', data)
      return response
    } catch (error) {
      console.error('重置密码失败:', error)
      throw error
    }
  }
}

export default api 