import api from './index'

export const getOrders = async (params = {}) => {
  return api.get('/api/orders', { params })
}

// createOrder: data需包含user_id, spot_id, start_time, end_time, 其余字段可选
export const createOrder = async (data) => {
  return api.post('/api/orders', data)
}

export const deleteOrder = async (orderId) => {
  return api.delete(`/api/orders/${orderId}`)
}

export const cancelOrder = async (orderId) => {
  return api.post(`/api/orders/${orderId}/cancel`)
}

export const payOrder = async (orderId, pay_method) => {
  return api.post(`/api/orders/${orderId}/pay`, { pay_method })
} 