<template>
  <div class="fade-in">
    <!-- 页面标题和刷新控制 -->
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h2 class="text-[clamp(1.25rem,3vw,1.75rem)] font-semibold">数据统计</h2>
        <p class="text-gray-500 mt-1">停车场运营数据分析和统计</p>
      </div>
      <div class="flex items-center gap-3">
        <el-button 
          @click="manualRefresh" 
          :loading="refreshLoading"
          type="primary" 
          size="small"
          icon="Refresh"
        >
          手动刷新
        </el-button>
        <el-button 
          @click="toggleAutoRefresh" 
          :type="autoRefreshEnabled ? 'success' : 'info'"
          size="small"
        >
          {{ autoRefreshEnabled ? '自动刷新开启' : '自动刷新关闭' }}
        </el-button>
        <div class="text-xs text-gray-500">
          {{ lastRefreshTime ? `最后更新: ${new Date(lastRefreshTime).toLocaleTimeString()}` : '未更新' }}
        </div>
      </div>
    </div>
    
    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div class="stat-card">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">本月收入</p>
            <h3 class="text-2xl font-semibold mt-1">¥{{ monthlyIncome.toLocaleString() }}</h3>
            <p class="text-success text-sm mt-2 flex items-center">
              <i class="fa fa-arrow-up mr-1"></i> {{ incomeGrowth }}% <span class="text-gray-500 ml-1">较上月</span>
            </p>
          </div>
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <i class="fa fa-money"></i>
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">本月车流量</p>
            <h3 class="text-2xl font-semibold mt-1">{{ monthlyTraffic.toLocaleString() }}</h3>
            <p class="text-success text-sm mt-2 flex items-center">
              <i class="fa fa-arrow-up mr-1"></i> {{ trafficGrowth }}% <span class="text-gray-500 ml-1">较上月</span>
            </p>
          </div>
          <div class="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
            <i class="fa fa-car"></i>
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">平均停车时长</p>
            <h3 class="text-2xl font-semibold mt-1">{{ avgParkingTime }}小时</h3>
            <p class="text-warning text-sm mt-2 flex items-center">
              <i class="fa fa-clock-o mr-1"></i> 2.1小时 <span class="text-gray-500 ml-1">平均</span>
            </p>
          </div>
          <div class="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
            <i class="fa fa-clock-o"></i>
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">车位使用率</p>
            <h3 class="text-2xl font-semibold mt-1">{{ occupancyRate }}%</h3>
            <p class="text-info text-sm mt-2 flex items-center">
              <i class="fa fa-chart-pie mr-1"></i> 高峰期 <span class="text-gray-500 ml-1">85%</span>
            </p>
          </div>
          <div class="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center text-info">
            <i class="fa fa-chart-pie"></i>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 图表区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-medium">收入趋势</h3>
          <el-select v-model="selectedPeriod" placeholder="选择时间范围" size="small">
            <el-option label="近7天" value="7" />
            <el-option label="近30天" value="30" />
            <el-option label="近90天" value="90" />
          </el-select>
        </div>
        <div class="h-80">
          <canvas id="incomeChart"></canvas>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-medium">车流量分布</h3>
          <button class="text-gray-400 hover:text-primary">
            <i class="fa fa-ellipsis-v"></i>
          </button>
        </div>
        <div class="h-80 flex items-center justify-center">
          <canvas id="trafficChart"></canvas>
        </div>
      </div>
    </div>
    
    <!-- 详细统计表格 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div class="flex justify-between items-center p-5 border-b border-gray-100">
        <h3 class="font-medium">分区统计详情</h3>
        <CommonButton type="text" size="small" text="导出报表" />
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th class="px-6 py-3">分区</th>
              <th class="px-6 py-3">总车位</th>
              <th class="px-6 py-3">已占用</th>
              <th class="px-6 py-3">使用率</th>
              <th class="px-6 py-3">今日收入</th>
              <th class="px-6 py-3">状态</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="zone in zoneStats" :key="zone.name" class="table-row-hover">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">{{ zone.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">{{ zone.total }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">{{ zone.occupied }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex items-center">
                  <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div class="bg-primary h-2 rounded-full" :style="{ width: zone.usage + '%' }"></div>
                  </div>
                  <span class="text-xs text-gray-500">{{ zone.usage }}%</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">¥{{ zone.income }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="zone.status === '正常' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                      class="px-2 py-1 text-xs rounded-full">
                  {{ zone.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { getMonthlyStatistics, getChartData, getZoneStatistics } from '@/api/statistics'
import CommonButton from '@/components/CommonButton.vue'
import { ElMessage } from 'element-plus'
// Chart.js 已通过 CDN 引入，直接使用全局的 Chart 对象

// 数据
const selectedPeriod = ref('30')
const monthlyIncome = ref(0)
const monthlyTraffic = ref(0)
const avgParkingTime = ref(0)
const occupancyRate = ref(0)
const incomeGrowth = ref(0)
const trafficGrowth = ref(0)
const loading = ref(false)
const refreshLoading = ref(false)

// 自动刷新相关
const autoRefreshEnabled = ref(true)
const autoRefreshTimer = ref(null)
const lastRefreshTime = ref(null)

// 图表实例
let incomeChart = null
let trafficChart = null

// 分区统计数据
const zoneStats = ref([])

// 加载分区统计数据
const loadZoneStatistics = async () => {
  try {
    const response = await getZoneStatistics()
    if (response.success) {
      zoneStats.value = response.data
      console.log('分区统计数据加载成功:', zoneStats.value)
    } else {
      console.error('分区统计数据加载失败:', response.message)
    }
  } catch (error) {
    console.error('获取分区统计失败:', error)
  }
}

// 加载月度统计数据
const loadMonthlyStatistics = async () => {
  try {
    const response = await getMonthlyStatistics()
    if (response.success) {
      const data = response.data
      monthlyIncome.value = data.monthly_income || 0
      monthlyTraffic.value = data.monthly_traffic || 0
      avgParkingTime.value = data.avg_parking_time || 2.1
      occupancyRate.value = data.occupancy_rate || 78.0
      incomeGrowth.value = data.income_growth || 0
      trafficGrowth.value = data.traffic_growth || 0
      console.log('月度统计数据加载成功:', data)
    } else {
      console.error('月度统计数据加载失败:', response.message)
    }
  } catch (error) {
    console.error('获取月度统计失败:', error)
  }
}

// 更新图表
const updateCharts = async () => {
  try {
    const response = await getChartData(parseInt(selectedPeriod.value))
    if (response.success) {
      const data = response.data
      
      // 更新收入趋势图表
      if (incomeChart) {
        incomeChart.destroy()
      }
      const incomeCtx = document.getElementById('incomeChart')
      if (incomeCtx) {
        incomeChart = new Chart(incomeCtx, {
          type: 'line',
          data: {
            labels: data.income_trend.map(item => item.date),
            datasets: [{
              label: '收入',
              data: data.income_trend.map(item => item.income),
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function(value) {
                    return '¥' + value
                  }
                }
              }
            }
          }
        })
      }
      
      // 更新车流量趋势图表
      if (trafficChart) {
        trafficChart.destroy()
      }
      const trafficCtx = document.getElementById('trafficChart')
      if (trafficCtx) {
        trafficChart = new Chart(trafficCtx, {
          type: 'bar',
          data: {
            labels: data.traffic_trend.map(item => item.date),
            datasets: [{
              label: '车流量',
              data: data.traffic_trend.map(item => item.traffic),
              backgroundColor: '#10B981',
              borderRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        })
      }
      
      console.log('图表数据更新成功')
    } else {
      console.error('图表数据更新失败:', response.message)
    }
  } catch (error) {
    console.error('更新图表失败:', error)
  }
}

// 手动刷新
const manualRefresh = async () => {
  refreshLoading.value = true
  try {
    await Promise.all([
      loadMonthlyStatistics(),
      loadZoneStatistics(),
      updateCharts()
    ])
    lastRefreshTime.value = Date.now()
    ElMessage.success('数据刷新成功')
  } catch (error) {
    console.error('手动刷新失败:', error)
    ElMessage.error('数据刷新失败')
  } finally {
    refreshLoading.value = false
  }
}

// 切换自动刷新
const toggleAutoRefresh = () => {
  autoRefreshEnabled.value = !autoRefreshEnabled.value
  if (autoRefreshEnabled.value) {
    startAutoRefresh()
    ElMessage.success('自动刷新已开启')
  } else {
    stopAutoRefresh()
    ElMessage.info('自动刷新已关闭')
  }
}

// 启动自动刷新
const startAutoRefresh = () => {
  if (autoRefreshTimer.value) {
    clearInterval(autoRefreshTimer.value)
  }
  // 每5分钟刷新一次
  autoRefreshTimer.value = setInterval(() => {
    manualRefresh()
  }, 5 * 60 * 1000)
}

// 停止自动刷新
const stopAutoRefresh = () => {
  if (autoRefreshTimer.value) {
    clearInterval(autoRefreshTimer.value)
    autoRefreshTimer.value = null
  }
}

// 监听时间范围变化
watch(selectedPeriod, () => {
  updateCharts()
})

// 组件挂载时初始化
onMounted(async () => {
  await manualRefresh()
  if (autoRefreshEnabled.value) {
    startAutoRefresh()
  }
})

// 组件卸载时清理
onUnmounted(() => {
  stopAutoRefresh()
  if (incomeChart) {
    incomeChart.destroy()
  }
  if (trafficChart) {
    trafficChart.destroy()
  }
})
</script>
<style scoped>
/* 统计卡片样式 */
.stat-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
  border: 1px solid #E5E7EB;
  transition: box-shadow 0.3s;
}

.stat-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

.table-row-hover {
  transition: background-color 0.2s;
}

.table-row-hover:hover {
  background-color: rgba(22, 93, 255, 0.05);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stat-card {
    padding: 16px;
  }
  
  .stat-card h3 {
    font-size: 1.5rem;
  }
}
</style> 