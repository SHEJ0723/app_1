<template>
  <div class="fade-in">
    <!-- 页面标题和刷新控制 -->
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h2 class="text-[clamp(1.25rem,3vw,1.75rem)] font-semibold">仪表盘</h2>
        <p class="text-gray-500 mt-1">欢迎回来，这里是停车场系统概览</p>
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
            <p class="text-gray-500 text-sm">今日收入</p>
            <h3 class="text-2xl font-semibold mt-1">¥{{ income.toLocaleString() }}</h3>
            <p class="text-success text-sm mt-2 flex items-center">
              <i class="fa fa-arrow-up mr-1"></i> 12.5% <span class="text-gray-500 ml-1">较昨日</span>
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
            <p class="text-gray-500 text-sm">今日车流量</p>
            <h3 class="text-2xl font-semibold mt-1">{{ traffic }}</h3>
            <p class="text-success text-sm mt-2 flex items-center">
              <i class="fa fa-arrow-up mr-1"></i> 8.2% <span class="text-gray-500 ml-1">较昨日</span>
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
            <p class="text-gray-500 text-sm">空闲车位</p>
            <h3 class="text-2xl font-semibold mt-1">{{ availableSpots }}</h3>
            <p class="text-success text-sm mt-2 flex items-center">
              <i class="fa fa-arrow-up mr-1"></i> 5.3% <span class="text-gray-500 ml-1">较上周</span>
            </p>
          </div>
                      <div class="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
              <i class="fa fa-car"></i>
            </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">高峰时段</p>
            <h3 class="text-2xl font-semibold mt-1">{{ peakTime }}</h3>
            <p class="text-danger text-sm mt-2 flex items-center">
              <i class="fa fa-clock-o mr-1"></i> 当前时段 <span class="text-gray-500 ml-1">繁忙</span>
            </p>
          </div>
          <div class="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center text-danger">
            <i class="fa fa-clock-o"></i>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 图表区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5 lg:col-span-2">
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-medium">车流量趋势</h3>
          <el-select v-model="selectedRange" placeholder="选择时间范围" size="small">
            <el-option label="近7天" value="7" />
            <el-option label="近30天" value="30" />
            <el-option label="近90天" value="90" />
          </el-select>
        </div>
        <div class="h-80">
          <canvas id="trafficChart"></canvas>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-medium">车位使用率</h3>
          <button class="text-gray-400 hover:text-primary">
            <i class="fa fa-ellipsis-v"></i>
          </button>
        </div>
        <div class="h-80 flex items-center justify-center">
          <canvas id="usageChart"></canvas>
        </div>
      </div>
    </div>
    
    <!-- 停车场布局图 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div class="flex justify-between items-center p-5 border-b border-gray-100">
        <h3 class="font-medium">停车场布局图</h3>
        <CommonButton type="text" size="small" text="查看详情" />
      </div>
      <div class="p-5">
        <img src="@/assets/images/bujutu.png" alt="停车场布局图" class="max-w-full rounded-lg shadow-sm border border-gray-200" />
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { getDashboardStatistics, getChartData } from '@/api/statistics'
import CommonButton from '@/components/CommonButton.vue'
import { ElMessage } from 'element-plus'
// Chart.js 已通过 CDN 引入，直接使用全局的 Chart 对象

const income = ref(0)
const traffic = ref(0)
const availableSpots = ref(0)
const peakTime = ref('--')
const selectedRange = ref('30')
const loading = ref(false)
const refreshLoading = ref(false)

// 自动刷新相关
const autoRefreshEnabled = ref(true)
const autoRefreshTimer = ref(null)
const lastRefreshTime = ref(null)

const fetchStatistics = async () => {
  loading.value = true
  try {
    const res = await getDashboardStatistics()
    if (res.success && res.data) {
      income.value = res.data.income || 0
      traffic.value = res.data.traffic || 0
      availableSpots.value = res.data.available_spots || 0
      peakTime.value = res.data.peak_time || '--'
      
      // 更新增长率显示
      updateGrowthDisplay(res.data)
      
      lastRefreshTime.value = new Date()
      ElMessage.success('数据已更新')
    }
  } catch (e) {
    ElMessage.error('获取统计数据失败')
    console.error('获取统计数据失败', e)
  } finally {
    loading.value = false
  }
}

// 手动刷新
const manualRefresh = async () => {
  refreshLoading.value = true
  try {
    await fetchStatistics()
    await updateCharts()
    ElMessage.success('数据已手动刷新')
  } catch (e) {
    ElMessage.error('刷新失败')
  } finally {
    refreshLoading.value = false
  }
}

// 更新增长率显示
const updateGrowthDisplay = (data) => {
  // 这里可以更新增长率显示，如果需要的话
}

// 自动刷新控制
const startAutoRefresh = () => {
  if (autoRefreshTimer.value) {
    clearInterval(autoRefreshTimer.value)
  }
  autoRefreshTimer.value = setInterval(async () => {
    if (autoRefreshEnabled.value) {
      await fetchStatistics()
      await updateCharts()
    }
  }, 30 * 60 * 1000) // 30分钟
}

const stopAutoRefresh = () => {
  if (autoRefreshTimer.value) {
    clearInterval(autoRefreshTimer.value)
    autoRefreshTimer.value = null
  }
}

const toggleAutoRefresh = () => {
  autoRefreshEnabled.value = !autoRefreshEnabled.value
  if (autoRefreshEnabled.value) {
    ElMessage.success('自动刷新已开启')
  } else {
    ElMessage.info('自动刷新已关闭')
  }
}

// 图表实例
let trafficChart = null
let usageChart = null

// 更新图表数据
const updateCharts = async () => {
  try {
    const res = await getChartData(parseInt(selectedRange.value))
    if (res.success && res.data) {
      updateTrafficChart(res.data.traffic_trend)
      updateUsageChart(res.data.usage_distribution)
    }
  } catch (e) {
    console.error('更新图表失败', e)
  }
}

// 更新车流量趋势图表
const updateTrafficChart = (data) => {
  const trafficCtx = document.getElementById('trafficChart')
  if (!trafficCtx) return
  
  if (trafficChart) {
    trafficChart.destroy()
  }
  
  const labels = data.map(item => item.date)
  const values = data.map(item => item.traffic)
  
  trafficChart = new Chart(trafficCtx.getContext('2d'), {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: '车流量',
          data: values,
          borderColor: '#165DFF',
          backgroundColor: 'rgba(22, 93, 255, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return value.toLocaleString();
            }
          }
        }
      }
    }
  });
}

// 更新车位使用率图表
const updateUsageChart = (data) => {
  const usageCtx = document.getElementById('usageChart')
  if (!usageCtx) return
  
  if (usageChart) {
    usageChart.destroy()
  }
  
  const labels = data.map(item => item.status)
  const values = data.map(item => item.count)
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
  
  usageChart = new Chart(usageCtx.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: colors.slice(0, labels.length)
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        }
      }
    }
  });
}

// 监听时间范围变化
watch(selectedRange, () => {
  updateCharts()
})

// 初始化
onMounted(async () => {
  await fetchStatistics()
  await updateCharts()
  startAutoRefresh()
})

// 组件卸载时清理
onUnmounted(() => {
  stopAutoRefresh()
  if (trafficChart) {
    trafficChart.destroy()
  }
  if (usageChart) {
    usageChart.destroy()
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