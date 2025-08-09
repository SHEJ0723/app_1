<template>
  <div class="fade-in">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h2 class="text-[clamp(1.25rem,3vw,1.75rem)] font-semibold">个人仪表盘</h2>
      <p class="text-gray-500 mt-1">欢迎回来，这里是您的停车信息概览</p>
    </div>
    
    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div class="stat-card">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">可用车位</p>
            <h3 class="text-2xl font-semibold mt-1">{{ availableSpots }}</h3>
            <p class="text-success text-sm mt-2 flex items-center">
              <i class="fa fa-arrow-up mr-1"></i> 实时更新 <span class="text-gray-500 ml-1">车位状态</span>
            </p>
          </div>
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <i class="fa fa-car"></i>
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">已绑定车牌</p>
            <h3 class="text-2xl font-semibold mt-1">{{ licensePlates.length }}</h3>
            <p class="text-success text-sm mt-2 flex items-center">
              <i class="fa fa-check mr-1"></i> 正常 <span class="text-gray-500 ml-1">车辆信息</span>
            </p>
          </div>
          <div class="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
            <i class="fa fa-id-card"></i>
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">账户余额</p>
            <h3 class="text-2xl font-semibold mt-1">¥{{ balance.toFixed(2) }}</h3>
            <p class="text-warning text-sm mt-2 flex items-center">
              <i class="fa fa-wallet mr-1"></i> 余额充足 <span class="text-gray-500 ml-1">可正常使用</span>
            </p>
          </div>
          <div class="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
            <i class="fa fa-credit-card"></i>
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">本月停车</p>
            <h3 class="text-2xl font-semibold mt-1">{{ parkingRecords.length }}</h3>
            <p class="text-info text-sm mt-2 flex items-center">
              <i class="fa fa-history mr-1"></i> 停车记录 <span class="text-gray-500 ml-1">本月统计</span>
            </p>
          </div>
          <div class="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center text-info">
            <i class="fa fa-clock-o"></i>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 主要内容区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5 lg:col-span-2">
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-medium">最近停车记录</h3>
          <el-button type="primary" size="small" @click="$router.push({ name: 'UserOrders' })">
            查看全部
          </el-button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-100">
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">日期</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">停车时长</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">费用</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in parkingRecords.slice(0, 5)" :key="record.id" class="border-b border-gray-50 hover:bg-gray-50">
                <td class="py-3 px-4 text-sm">{{ record.date }}</td>
                <td class="py-3 px-4 text-sm">{{ record.duration }}</td>
                <td class="py-3 px-4 text-sm font-medium">¥{{ record.fee }}</td>
                <td class="py-3 px-4">
                  <span :class="getStatusClass(record.status)" class="px-2 py-1 rounded-full text-xs">
                    {{ record.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-medium">快捷操作</h3>
          <button class="text-gray-400 hover:text-primary">
            <i class="fa fa-ellipsis-v"></i>
          </button>
        </div>
        <div class="space-y-3">
          <button 
            @click="$router.push({ name: 'ParkingReservation' })"
            class="w-full flex items-center justify-between p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
          >
            <div class="flex items-center">
              <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                <i class="fa fa-calendar"></i>
              </div>
              <span class="font-medium">预约停车</span>
            </div>
            <i class="fa fa-chevron-right text-gray-400"></i>
          </button>
          
          <button 
            @click="$router.push({ name: 'FindCar' })"
            class="w-full flex items-center justify-between p-3 rounded-lg bg-success/5 hover:bg-success/10 transition-colors"
          >
            <div class="flex items-center">
              <div class="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center text-success mr-3">
                <i class="fa fa-search"></i>
              </div>
              <span class="font-medium">查找车辆</span>
            </div>
            <i class="fa fa-chevron-right text-gray-400"></i>
          </button>
          
          <button 
            @click="$router.push({ name: 'AutoPay' })"
            class="w-full flex items-center justify-between p-3 rounded-lg bg-warning/5 hover:bg-warning/10 transition-colors"
          >
            <div class="flex items-center">
              <div class="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center text-warning mr-3">
                <i class="fa fa-credit-card"></i>
              </div>
              <span class="font-medium">自动扣费</span>
            </div>
            <i class="fa fa-chevron-right text-gray-400"></i>
          </button>
          
          <button 
            @click="$router.push({ name: 'ParkingMap' })"
            class="w-full flex items-center justify-between p-3 rounded-lg bg-info/5 hover:bg-info/10 transition-colors"
          >
            <div class="flex items-center">
              <div class="w-8 h-8 rounded-full bg-info/10 flex items-center justify-center text-info mr-3">
                <i class="fa fa-map"></i>
              </div>
              <span class="font-medium">停车场地图</span>
            </div>
            <i class="fa fa-chevron-right text-gray-400"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getParkingSpots } from '@/api/parking'
import { getOrders } from '@/api/orders'

const availableSpots = ref(0)
const licensePlates = ref([])
const balance = ref(0)
const parkingRecords = ref([])

const getStatusClass = (status) => {
  const statusMap = {
    '已完成': 'bg-success/10 text-success',
    '进行中': 'bg-warning/10 text-warning',
    '已取消': 'bg-gray-100 text-gray-600',
    '待支付': 'bg-danger/10 text-danger'
  }
  return statusMap[status] || 'bg-gray-100 text-gray-600'
}

onMounted(async () => {
  // 1. 车牌、余额：localStorage.userInfo
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    licensePlates.value = userInfo?.licensePlates || []
    balance.value = userInfo?.balance || 0
  } catch (e) {
    licensePlates.value = []
    balance.value = 0
  }
  // 2. 可用车位
  try {
    const res = await getParkingSpots({ status: '空闲', per_page: 1000 })
    availableSpots.value = Array.isArray(res.data) ? res.data.length : 0
  } catch (e) {
    availableSpots.value = 0
  }
  // 3. 最近停车记录
  try {
    const res = await getOrders({ page: 1, pageSize: 5 })
    parkingRecords.value = (res.data || []).map(o => ({
      date: o.start_time ? o.start_time.replace('T',' ').slice(0,16) : '',
      duration: o.duration || '--',
      fee: o.amount ? `¥${o.amount.toFixed(2)}` : '--',
      status: o.status || '--'
    }))
  } catch (e) {
    parkingRecords.value = []
  }
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.mt-4 {
  margin-top: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quick-actions .el-button {
  width: 100%;
}

.parking-status,
.my-vehicles,
.balance {
  text-align: center;
  padding: 20px 0;
}
</style> 