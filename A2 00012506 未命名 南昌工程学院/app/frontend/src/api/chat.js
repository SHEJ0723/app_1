export async function chatWithDeepSeek(messages, userType = 'user') {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('未登录，请先登录')
  }
  
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ messages, userType })
  })
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('登录已过期，请重新登录')
    }
    throw new Error(`请求失败: ${response.status}`)
  }
  
  const data = await response.json()
  if (data.success) {
    return data.reply
  }
  throw new Error(data.message || 'API Error')
} 