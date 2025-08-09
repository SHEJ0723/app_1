<template>
  <div class="fade-in">
    <!-- 页面标题 -->
    <div class="mb-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-[clamp(1.25rem,3vw,1.75rem)] font-semibold">收费明细</h2>
          <p class="text-gray-500 mt-1">查看您的停车费用记录</p>
        </div>
        <el-button type="primary" @click="$router.push('/user')" class="back-btn">
          <i class="fa fa-arrow-left mr-2"></i> 返回首页
        </el-button>
      </div>
    </div>

    <!-- 账单统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="stat-card">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">总账单数</p>
            <h3 class="text-2xl font-semibold mt-1">{{ bills.length }}</h3>
          </div>
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <i class="fa fa-file-text"></i>
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">已支付</p>
            <h3 class="text-2xl font-semibold mt-1">{{ paidBills }}</h3>
          </div>
          <div class="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
            <i class="fa fa-check-circle"></i>
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">待支付</p>
            <h3 class="text-2xl font-semibold mt-1">{{ unpaidBills }}</h3>
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

    <!-- 账单列表 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div class="flex justify-between items-center mb-6">
        <h3 class="font-medium text-lg">账单列表</h3>
        <el-button type="primary" size="small" @click="fetchBills" :loading="loading">
          <i class="fa fa-refresh mr-1"></i> 刷新
        </el-button>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">账单号</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">订单号</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">金额</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">支付时间</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">支付方式</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="bill in bills" :key="bill.id" class="border-b border-gray-50 hover:bg-gray-50">
              <td class="py-3 px-4 text-sm font-medium">{{ bill.id }}</td>
              <td class="py-3 px-4 text-sm">{{ bill.order_id }}</td>
              <td class="py-3 px-4 text-sm font-medium">¥{{ bill.amount }}</td>
              <td class="py-3 px-4 text-sm">{{ bill.pay_time || '-' }}</td>
              <td class="py-3 px-4">
                <span :class="getStatusClass(bill.status)" class="px-2 py-1 rounded-full text-xs">
                  {{ bill.status }}
                </span>
              </td>
              <td class="py-3 px-4 text-sm">{{ bill.pay_method || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 空状态 -->
      <div v-if="bills.length === 0 && !loading" class="text-center py-12">
        <i class="fa fa-file-text-o text-4xl text-gray-300 mb-4"></i>
        <p class="text-gray-500">暂无账单记录</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getBills } from '@/api/bills'
import { ElMessage } from 'element-plus'

const bills = ref([])
const loading = ref(false)

// 计算属性
const paidBills = computed(() => bills.value.filter(bill => bill.status === '已支付').length)
const unpaidBills = computed(() => bills.value.filter(bill => bill.status !== '已支付').length)
const totalAmount = computed(() => bills.value.reduce((sum, bill) => sum + (bill.amount || 0), 0).toFixed(2))

const getStatusClass = (status) => {
  const statusMap = {
    '已支付': 'bg-success/10 text-success',
    '待支付': 'bg-warning/10 text-warning',
    '已取消': 'bg-gray-100 text-gray-600',
    '支付失败': 'bg-danger/10 text-danger'
  }
  return statusMap[status] || 'bg-gray-100 text-gray-600'
}

const fetchBills = async () => {
  loading.value = true
  try {
    const res = await getBills()
    bills.value = res.data || []
  } catch (e) {
    ElMessage.error(e.message || '获取账单失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchBills)
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
</style> 