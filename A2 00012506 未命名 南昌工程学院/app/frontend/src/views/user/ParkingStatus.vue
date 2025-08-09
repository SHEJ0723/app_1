<template>
  <div class="fade-in">
    <!-- 页面标题 -->
    <div class="mb-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-[clamp(1.25rem,3vw,1.75rem)] font-semibold">车位状态</h2>
          <p class="text-gray-500 mt-1">实时查看停车场各区域车位使用情况</p>
        </div>
        <el-button type="primary" @click="$router.push('/user')" class="back-btn">
          <i class="fa fa-arrow-left mr-2"></i> 返回首页
        </el-button>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="stat-card">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">总车位</p>
            <h3 class="text-2xl font-semibold mt-1">{{ totalSpots }}</h3>
          </div>
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <i class="fa fa-car"></i>
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">空闲车位</p>
            <h3 class="text-2xl font-semibold mt-1">{{ availableSpots }}</h3>
          </div>
          <div class="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
            <i class="fa fa-check-circle"></i>
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">已预约</p>
            <h3 class="text-2xl font-semibold mt-1">{{ reservedSpots }}</h3>
          </div>
          <div class="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
            <i class="fa fa-clock-o"></i>
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">已占用</p>
            <h3 class="text-2xl font-semibold mt-1">{{ occupiedSpots }}</h3>
          </div>
          <div class="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center text-danger">
            <i class="fa fa-ban"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="bg-white rounded-lg shadow-sm border border-gray-100 p-12">
      <div class="text-center">
        <i class="fa fa-spinner fa-spin text-4xl text-primary mb-4"></i>
        <p class="text-gray-500">正在加载车位信息...</p>
      </div>
    </div>

    <!-- 车位状态展示 -->
    <div v-else>
      <div v-for="zone in zones" :key="zone" class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-medium text-lg">{{ zone }} 区车位状态</h3>
          <div class="flex gap-2">
            <span class="px-2 py-1 bg-success/10 text-success rounded-full text-xs">
              空闲: {{ getZoneStats(zone).available }}
            </span>
            <span class="px-2 py-1 bg-warning/10 text-warning rounded-full text-xs">
              预约: {{ getZoneStats(zone).reserved }}
            </span>
            <span class="px-2 py-1 bg-danger/10 text-danger rounded-full text-xs">
              占用: {{ getZoneStats(zone).occupied }}
            </span>
          </div>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <div 
            v-for="spot in groupedSpots[zone]" 
            :key="spot.id" 
            class="spot-card-modern"
            :class="getSpotCardClass(spot.status)"
          >
            <div class="spot-header">
              <div class="spot-number">{{ spot.spot_number }}</div>
              <div class="spot-status-badge" :class="getStatusClass(spot.status)">
                {{ spot.status }}
              </div>
            </div>
            <div class="spot-info">
              <div class="spot-type">
                <i class="fa fa-car mr-1"></i>
                {{ spot.type }}
              </div>
              <div class="spot-zone">
                <i class="fa fa-map-marker mr-1"></i>
                {{ spot.zone }}区
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useRealtime } from '@/utils/realtimeManager'

const spots = ref([])
const loading = ref(true)
const zones = ref(['A', 'B', 'C'])

const groupedSpots = computed(() => {
  const groups = { A: [], B: [], C: [] }
  spots.value.forEach(spot => {
    if (groups[spot.zone]) groups[spot.zone].push(spot)
  })
  return groups
})

// 计算属性
const totalSpots = computed(() => spots.value.length)
const availableSpots = computed(() => spots.value.filter(spot => spot.status === '空闲').length)
const reservedSpots = computed(() => spots.value.filter(spot => spot.status === '已预约').length)
const occupiedSpots = computed(() => spots.value.filter(spot => spot.status === '已占用').length)

const getZoneStats = (zone) => {
  const zoneSpots = groupedSpots.value[zone] || []
  return {
    available: zoneSpots.filter(spot => spot.status === '空闲').length,
    reserved: zoneSpots.filter(spot => spot.status === '已预约').length,
    occupied: zoneSpots.filter(spot => spot.status === '已占用').length
  }
}

const getStatusClass = (status) => {
  const statusMap = {
    '空闲': 'bg-success/10 text-success',
    '已预约': 'bg-warning/10 text-warning',
    '已占用': 'bg-danger/10 text-danger'
  }
  return statusMap[status] || 'bg-gray-100 text-gray-600'
}

const getSpotCardClass = (status) => {
  const statusMap = {
    '空闲': 'spot-available',
    '已预约': 'spot-reserved',
    '已占用': 'spot-occupied'
  }
  return statusMap[status] || 'spot-default'
}

// 数据获取函数
const fetchParkingSpots = async () => {
    const token = localStorage.getItem('token')
    const res = await axios.get('/api/parking-spots', {
      headers: { Authorization: `Bearer ${token}` },
      params: { per_page: 20 }
    })
    if (res.data.success) {
    return res.data.data
    }
  throw new Error('获取车位信息失败')
}

// 使用实时更新
const { data: realtimeData, loading: realtimeLoading, error: realtimeError, lastUpdate } = useRealtime(
  'parking-status',
  fetchParkingSpots,
  {
    interval: 30000, // 30秒更新一次
    cacheKey: 'parking_status_data',
    cacheTTL: 60000 // 1分钟缓存
  }
)

// 监听实时数据变化
watch(realtimeData, (newData) => {
  if (newData) {
    spots.value = newData
  }
})

// 监听加载状态
watch(realtimeLoading, (newLoading) => {
  loading.value = newLoading
})

// 监听错误
watch(realtimeError, (newError) => {
  if (newError) {
    ElMessage.error('获取车位信息失败，请稍后重试')
  }
})
</script>

<style scoped>
.spot-card-modern {
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  cursor: pointer;
}

.spot-card-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.spot-available {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.spot-available:hover {
  background: #dcfce7;
  border-color: #86efac;
}

.spot-reserved {
  background: #fffbeb;
  border-color: #fed7aa;
}

.spot-reserved:hover {
  background: #fef3c7;
  border-color: #fbbf24;
}

.spot-occupied {
  background: #fef2f2;
  border-color: #fecaca;
}

.spot-occupied:hover {
  background: #fee2e2;
  border-color: #f87171;
}

.spot-default {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.spot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.spot-number {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.spot-status-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.spot-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.spot-type, .spot-zone {
  font-size: 12px;
  color: #6b7280;
  display: flex;
  align-items: center;
}

.spot-type i, .spot-zone i {
  width: 12px;
  margin-right: 6px;
}
</style> 