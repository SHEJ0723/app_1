// 调试工具
export const debugAuth = () => {
  console.log('=== 调试认证状态 ===')
  
  // 检查token
  const token = localStorage.getItem('token')
  console.log('Token:', token ? '存在' : '不存在')
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      console.log('Token payload:', payload)
      console.log('Token 过期时间:', new Date(payload.exp * 1000))
      console.log('Token 是否过期:', payload.exp * 1000 < Date.now())
    } catch (e) {
      console.log('Token 解析失败:', e)
    }
  }
  
  // 检查用户信息
  const userInfo = localStorage.getItem('userInfo')
  console.log('用户信息:', userInfo ? JSON.parse(userInfo) : '不存在')
  
  // 检查用户类型
  const userType = localStorage.getItem('userType')
  console.log('用户类型:', userType)
  
  console.log('=== 调试完成 ===')
}

export const debugAPI = async () => {
  console.log('=== 调试API调用 ===')
  
  try {
    const response = await fetch('http://localhost:5000/api/bills', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'X-Require-Role': 'admin'
      }
    })
    
    console.log('API 响应状态:', response.status)
    const data = await response.json()
    console.log('API 响应数据:', data)
  } catch (error) {
    console.log('API 调用失败:', error)
  }
  
  console.log('=== API调试完成 ===')
} 