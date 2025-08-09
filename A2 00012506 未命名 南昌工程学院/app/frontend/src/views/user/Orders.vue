<template>
  <div class="fade-in">
    <!-- 页面标题 -->
    <div class="mb-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-[clamp(1.25rem,3vw,1.75rem)] font-semibold">我的订单</h2>
          <p class="text-gray-500 mt-1">查看和管理您的停车订单</p>
        </div>
        <el-button type="primary" @click="$router.push('/user')" class="back-btn">
          <i class="fa fa-arrow-left mr-2"></i> 返回首页
        </el-button>
      </div>
    </div>

    <!-- 订单统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="stat-card">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">总订单数</p>
            <h3 class="text-2xl font-semibold mt-1">{{ orders.length }}</h3>
          </div>
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <i class="fa fa-list"></i>
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">已完成</p>
            <h3 class="text-2xl font-semibold mt-1">{{ completedOrders }}</h3>
          </div>
          <div class="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
            <i class="fa fa-check"></i>
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">待支付</p>
            <h3 class="text-2xl font-semibold mt-1">{{ pendingOrders }}</h3>
          </div>
          <div class="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
            <i class="fa fa-clock-o"></i>
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">总金额</p>
            <h3 class="text-2xl font-semibold mt-1">¥{{ totalAmount }}</h3>
          </div>
          <div class="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center text-info">
            <i class="fa fa-money"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 订单列表 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div class="flex justify-between items-center mb-6">
        <h3 class="font-medium text-lg">订单列表</h3>
        <el-button type="primary" size="small" @click="fetchOrders" :loading="loading">
          <i class="fa fa-refresh mr-1"></i> 刷新
        </el-button>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">订单号</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">车位ID</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">开始时间</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">结束时间</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">金额</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">支付方式</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id" class="border-b border-gray-50 hover:bg-gray-50">
              <td class="py-3 px-4 text-sm font-medium">{{ order.id }}</td>
              <td class="py-3 px-4 text-sm">{{ order.spot_id }}</td>
              <td class="py-3 px-4 text-sm">{{ order.start_time }}</td>
              <td class="py-3 px-4 text-sm">{{ order.end_time }}</td>
              <td class="py-3 px-4 text-sm font-medium">¥{{ order.amount }}</td>
              <td class="py-3 px-4">
                <span :class="getStatusClass(order.status)" class="px-2 py-1 rounded-full text-xs">
                  {{ order.status }}
                </span>
              </td>
              <td class="py-3 px-4 text-sm">{{ order.pay_method || '-' }}</td>
              <td class="py-3 px-4">
                <div class="flex gap-2">
                  <!-- 支付按钮 - 仅对未支付订单显示 -->
                  <el-button 
                    v-if="order.status === '未支付'" 
                    type="primary" 
                    size="small" 
                    @click="pay(order, '支付宝')"
                    class="pay-btn"
                  >
                    <i class="fa fa-credit-card mr-1"></i> 支付宝
                  </el-button>
                  <el-button 
                    v-if="order.status === '未支付'" 
                    type="success" 
                    size="small" 
                    @click="pay(order, '微信')"
                    class="pay-btn"
                  >
                    <i class="fa fa-wechat mr-1"></i> 微信
                  </el-button>
                  
                  <!-- 取消预约按钮 - 仅对未支付和进行中订单显示 -->
                  <el-button 
                    v-if="order.status === '未支付' || order.status === '进行中'" 
                    type="danger" 
                    size="small" 
                    @click="handleCancelOrder(order)"
                    class="cancel-btn"
                  >
                    <i class="fa fa-times mr-1"></i> 取消预约
                  </el-button>
                  
                  <!-- 已完成订单显示已支付标签 -->
                  <el-tag v-if="order.status === '已完成'" type="success" class="paid-tag">
                    <i class="fa fa-check mr-1"></i> 已支付
                  </el-tag>
                  
                  <!-- 已取消订单显示已取消标签 -->
                  <el-tag v-if="order.status === '已取消'" type="danger" class="cancelled-tag">
                    <i class="fa fa-times mr-1"></i> 已取消
                  </el-tag>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 空状态 -->
      <div v-if="orders.length === 0 && !loading" class="text-center py-12">
        <i class="fa fa-inbox text-4xl text-gray-300 mb-4"></i>
        <p class="text-gray-500">暂无订单记录</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getOrders, payOrder, cancelOrder } from '@/api/orders'
import { ElMessage, ElMessageBox } from 'element-plus'

const orders = ref([])
const loading = ref(false)

// 计算属性
const completedOrders = computed(() => orders.value.filter(order => order.status === '已完成').length)
const pendingOrders = computed(() => orders.value.filter(order => order.status === '未支付').length)
const totalAmount = computed(() => orders.value.reduce((sum, order) => sum + (order.amount || 0), 0).toFixed(2))

const getStatusClass = (status) => {
  const statusMap = {
    '已完成': 'bg-success/10 text-success',
    '进行中': 'bg-warning/10 text-warning',
    '已取消': 'bg-gray-100 text-gray-600',
    '未支付': 'bg-danger/10 text-danger'
  }
  return statusMap[status] || 'bg-gray-100 text-gray-600'
}

const fetchOrders = async () => {
  loading.value = true
  try {
    const res = await getOrders()
    orders.value = res.data || []
  } catch (e) {
    ElMessage.error(e.message || '获取订单失败')
  } finally {
    loading.value = false
  }
}

const pay = async (row, method) => {
  try {
    await payOrder(row.id, method)
    ElMessage.success('支付成功')
    fetchOrders()
  } catch (e) {
    ElMessage.error(e.message || '支付失败')
  }
}

const handleCancelOrder = async (order) => {
  try {
    // 确认取消操作
    await ElMessageBox.confirm(
      `确定要取消订单 ${order.id} 的预约吗？\n取消后车位将重新变为可用状态。`,
      '确认取消预约',
      {
        confirmButtonText: '确定取消',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await cancelOrder(order.id)
    ElMessage.success('预约已取消，车位已释放')
    fetchOrders()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error(e.message || '取消预约失败')
    }
  }
}

onMounted(fetchOrders)
</script>

<style scoped>
.back-btn {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.back-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.pay-btn {
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.pay-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.cancel-btn {
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.2);
}

.paid-tag {
  border-radius: 6px;
  font-weight: 500;
}

.cancelled-tag {
  border-radius: 6px;
  font-weight: 500;
}
</style> 