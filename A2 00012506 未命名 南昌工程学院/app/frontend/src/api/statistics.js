import api from './index'

// 获取仪表盘统计数据
export function getDashboardStatistics() {
  return api.get('/api/statistics/dashboard', {
    headers: {
      'X-Require-Role': 'admin'
    }
  })
}

// 获取月度统计数据
export function getMonthlyStatistics() {
  return api.get('/api/statistics/monthly', {
    headers: {
      'X-Require-Role': 'admin'
    }
  })
}

// 获取图表数据
export function getChartData(days = 30) {
  return api.get('/api/statistics/charts', {
    params: { days },
    headers: {
      'X-Require-Role': 'admin'
    }
  })
}

// 获取分区统计详情
export function getZoneStatistics() {
  return api.get('/api/statistics/zone-details', {
    headers: {
      'X-Require-Role': 'admin'
    }
  })
} 