import axios from 'axios'

export const getToken = () => {
  const token = localStorage.getItem('token')
  if (!token) return null
  
  // 解析JWT token检查过期时间
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.exp * 1000 < Date.now()) {
      removeToken()
      return null
    }
    return token
  } catch (e) {
    removeToken()
    return null
  }
}

export const setToken = (token) => {
  localStorage.setItem('token', token)
  // 设置自动刷新检查
  startTokenRefreshTimer()
}

export const removeToken = () => {
  localStorage.removeItem('token')
  clearRefreshTimer()
}

let refreshTimer = null

const startTokenRefreshTimer = () => {
  const token = getToken()
  if (!token) return
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const expiresIn = payload.exp * 1000 - Date.now() - 300000 // 提前5分钟刷新
    if (expiresIn > 0) {
      refreshTimer = setTimeout(() => {
        refreshToken()
      }, expiresIn)
    }
  } catch (e) {
    console.error('Token刷新定时器错误:', e)
  }
}

const clearRefreshTimer = () => {
  if (refreshTimer) {
    clearTimeout(refreshTimer)
    refreshTimer = null
  }
}

const refreshToken = async () => {
  try {
    const res = await axios.post('/auth/refresh', {}, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    })
    setToken(res.data.token)
  } catch (error) {
    console.error('刷新token失败:', error)
    removeToken()
    window.location.href = '/login'
  }
}

// 初始化检查token
if (getToken()) {
  startTokenRefreshTimer()
}