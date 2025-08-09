import api from './index'

// 获取账单列表
export const getBills = async (params = {}) => {
  return api.get('/api/bills', { 
    params,
    headers: {
      'X-Require-Role': 'admin'
    }
  })
}

// 获取账单统计信息
export const getBillStatistics = async () => {
  return api.get('/api/bills/statistics', {
    headers: {
      'X-Require-Role': 'admin'
    }
  })
}

// 获取账单详情
export const getBillDetail = async (billId) => {
  return api.get(`/api/bills/${billId}`, {
    headers: {
      'X-Require-Role': 'admin'
    }
  })
}

// 创建账单
export const createBill = async (data) => {
  return api.post('/api/bills', data, {
    headers: {
      'X-Require-Role': 'admin'
    }
  })
}

// 更新账单
export const updateBill = async (billId, data) => {
  return api.put(`/api/bills/${billId}`, data, {
    headers: {
      'X-Require-Role': 'admin'
    }
  })
}

// 删除账单
export const deleteBill = async (billId) => {
  return api.delete(`/api/bills/${billId}`, {
    headers: {
      'X-Require-Role': 'admin'
    }
  })
}

// 发送账单提醒
export const sendBillReminder = async (billId) => {
  return api.post(`/api/bills/${billId}/send-reminder`, {}, {
    headers: {
      'X-Require-Role': 'admin'
    }
  })
}

// 导出账单
export const exportBills = async () => {
  return api.get('/api/bills/export', {
    headers: {
      'X-Require-Role': 'admin'
    }
  })
} 