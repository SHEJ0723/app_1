<template>
  <div class="admin-orders-container">
    <!-- 页面标题和统计 -->
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">订单管理</h2>
        <p class="page-subtitle">管理系统中的所有停车订单</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showAddModal" class="add-btn">
          <i class="fa fa-plus mr-2"></i>新增订单
        </el-button>
        <el-button @click="fetchOrders" :loading="loading" class="refresh-btn">
          <i class="fa fa-refresh mr-2"></i>刷新
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon bg-blue-500">
          <i class="fa fa-list"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ totalOrders }}</div>
          <div class="stat-label">总订单数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-orange-500">
          <i class="fa fa-clock-o"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ unpaidOrders }}</div>
          <div class="stat-label">待支付</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-green-500">
          <i class="fa fa-check-circle"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ completedOrders }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-red-500">
          <i class="fa fa-times-circle"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ cancelledOrders }}</div>
          <div class="stat-label">已取消</div>
        </div>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <div class="filter-left">
        <el-select v-model="statusFilter" placeholder="状态筛选" clearable @change="handleFilter">
          <el-option label="全部状态" value="" />
          <el-option label="未支付" value="未支付" />
          <el-option label="已完成" value="已完成" />
          <el-option label="已取消" value="已取消" />
        </el-select>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleDateFilter"
          class="ml-3"
          :shortcuts="dateShortcuts"
        />
      </div>
      <div class="filter-right">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索订单号、用户名或车牌号"
          prefix-icon="Search"
          @input="handleSearch"
          clearable
          class="search-input"
        />
        <el-button @click="clearAllFilters" type="info" size="small" class="ml-2">
          <i class="fa fa-times mr-1"></i>清除筛选
        </el-button>
      </div>
    </div>

    <!-- 筛选结果统计 -->
    <div class="filter-stats" v-if="hasActiveFilters">
      <el-tag type="info" size="small">
        筛选结果: {{ filteredOrders.length }} 条订单
      </el-tag>
      <el-tag v-if="statusFilter" type="warning" size="small" class="ml-2">
        状态: {{ statusFilter }}
      </el-tag>
      <el-tag v-if="dateRange && dateRange.length === 2" type="success" size="small" class="ml-2">
        日期: {{ formatDateRange(dateRange) }}
      </el-tag>
      <el-tag v-if="searchKeyword" type="primary" size="small" class="ml-2">
        关键词: {{ searchKeyword }}
      </el-tag>
    </div>

    <!-- 订单表格 -->
    <el-card class="orders-table-card">
      <el-table :data="filteredOrders" style="width: 100%" v-loading="loading" stripe>
        <el-table-column prop="id" label="订单号" width="80" />
        <el-table-column label="用户信息" width="150">
          <template #default="{ row }">
            <div class="user-info">
              <div class="user-name">{{ getUserName(row.user_id) }}</div>
              <div class="user-phone">{{ getUserPhone(row.user_id) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="车位信息" width="120">
          <template #default="{ row }">
            <div class="spot-info">
              <div class="spot-number">{{ getSpotNumber(row.spot_id) }}</div>
              <div class="spot-zone">{{ getSpotZone(row.spot_id) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="预约时间" width="200">
          <template #default="{ row }">
            <div class="time-info">
              <div class="start-time">开始: {{ formatDateTime(row.start_time) }}</div>
              <div class="end-time">结束: {{ formatDateTime(row.end_time) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="100">
          <template #default="{ row }">
            <span class="amount">¥{{ row.amount || '0.00' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="pay_method" label="支付方式" width="100">
          <template #default="{ row }">
            <span v-if="row.pay_method">{{ row.pay_method }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="150">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button size="small" @click="viewOrderDetail(row)" class="view-btn">
                <i class="fa fa-eye"></i> 查看
              </el-button>
              <el-button 
                v-if="row.status === '未支付'"
                size="small" 
                type="success" 
                @click="markAsPaid(row)"
                class="pay-btn"
              >
                <i class="fa fa-check"></i> 标记已付
              </el-button>
              <el-button 
                v-if="row.status === '未支付' || row.status === '进行中'"
                size="small" 
                type="warning" 
                @click="handleCancelOrder(row)"
                class="cancel-btn"
              >
                <i class="fa fa-times"></i> 取消订单
              </el-button>
            <el-popconfirm title="确定要删除该订单吗？" @confirm="handleDelete(row.id)">
              <template #reference>
                  <el-button size="small" type="danger" class="delete-btn">
                    <i class="fa fa-trash"></i> 删除
                  </el-button>
              </template>
            </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalOrders"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增订单对话框 -->
      <el-dialog v-model="addModalVisible" title="新增订单" @closed="resetForm">
        <el-form :model="form" label-width="80px">
          <el-form-item label="用户ID" required>
            <el-input v-model="form.user_id" />
          </el-form-item>
          <el-form-item label="车位ID" required>
            <el-input v-model="form.spot_id" />
          </el-form-item>
          <el-form-item label="开始时间" required>
            <el-date-picker v-model="form.start_time" type="datetime" />
          </el-form-item>
          <el-form-item label="结束时间" required>
            <el-date-picker v-model="form.end_time" type="datetime" />
          </el-form-item>
          <el-form-item label="金额(元)" required>
            <el-input v-model="form.amount" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="form.status">
              <el-option label="未支付" value="未支付" />
              <el-option label="已完成" value="已完成" />
              <el-option label="已取消" value="已取消" />
            </el-select>
          </el-form-item>
          <el-form-item label="支付方式">
            <el-select v-model="form.pay_method">
              <el-option label="支付宝" value="支付宝" />
              <el-option label="微信" value="微信" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
        <el-button @click="addModalVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAdd">确定</el-button>
        </template>
      </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getOrders, createOrder, deleteOrder, payOrder, cancelOrder } from '@/api/orders'
import { getUsers } from '@/api/users'
import { getParkingSpots } from '@/api/parking'
import { ElMessage, ElMessageBox } from 'element-plus'

// 响应式数据
const orders = ref([])
const users = ref([])
const spots = ref([])
const loading = ref(false)
const addModalVisible = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const statusFilter = ref('')
const dateRange = ref([])
const searchKeyword = ref('')

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  },
  {
    text: '今天',
    value: () => {
      const today = new Date()
      return [today, today]
    }
  },
  {
    text: '昨天',
    value: () => {
      const yesterday = new Date()
      yesterday.setTime(yesterday.getTime() - 3600 * 1000 * 24)
      return [yesterday, yesterday]
    }
  }
]

// 表单数据
const form = ref({ 
  user_id: '', 
  spot_id: '', 
  start_time: '', 
  end_time: '', 
  amount: '', 
  status: '未支付', 
  pay_method: '' 
})

// 计算属性
const totalOrders = computed(() => orders.value.length)
const unpaidOrders = computed(() => orders.value.filter(o => o.status === '未支付').length)
const completedOrders = computed(() => orders.value.filter(o => o.status === '已完成').length)
const cancelledOrders = computed(() => orders.value.filter(o => o.status === '已取消').length)

const filteredOrders = computed(() => {
  let filtered = orders.value

  // 状态筛选
  if (statusFilter.value) {
    filtered = filtered.filter(o => o.status === statusFilter.value)
  }

  // 日期筛选
  if (dateRange.value && dateRange.value.length === 2) {
    const startDate = new Date(dateRange.value[0])
    const endDate = new Date(dateRange.value[1])
    // 设置结束日期为当天的23:59:59
    endDate.setHours(23, 59, 59, 999)
    
    console.log('日期筛选范围:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalOrders: filtered.length
    })
    
    filtered = filtered.filter(o => {
      // 检查订单的开始时间或结束时间是否在选择的日期范围内
      const orderStartTime = new Date(o.start_time)
      const orderEndTime = new Date(o.end_time)
      
      const isInRange = (orderStartTime >= startDate && orderStartTime <= endDate) ||
                       (orderEndTime >= startDate && orderEndTime <= endDate) ||
                       (orderStartTime <= startDate && orderEndTime >= endDate) // 跨日期订单
      
      if (!isInRange) {
        console.log('订单被过滤:', {
          orderId: o.id,
          orderStartTime: orderStartTime.toISOString(),
          orderEndTime: orderEndTime.toISOString()
        })
      }
      
      return isInRange
    })
    
    console.log('筛选后订单数量:', filtered.length)
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(o => 
      o.id.toString().includes(keyword) ||
      getUserName(o.user_id).toLowerCase().includes(keyword) ||
      getUserPhone(o.user_id).includes(keyword) ||
      getSpotNumber(o.spot_id).toLowerCase().includes(keyword)
    )
  }

  return filtered
})

// 是否有活跃的筛选条件
const hasActiveFilters = computed(() => {
  return statusFilter.value || 
         (dateRange.value && dateRange.value.length === 2) || 
         searchKeyword.value
})

// 格式化日期范围显示
const formatDateRange = (dateRange) => {
  if (!dateRange || dateRange.length !== 2) return ''
  const startDate = new Date(dateRange[0])
  const endDate = new Date(dateRange[1])
  return `${startDate.toLocaleDateString()} 至 ${endDate.toLocaleDateString()}`
}

// 获取用户信息
const getUserName = (userId) => {
  const user = users.value.find(u => u.id === userId)
  return user ? user.name : `用户${userId}`
}

const getUserPhone = (userId) => {
  const user = users.value.find(u => u.id === userId)
  return user ? user.phone : '-'
}

// 获取车位信息
const getSpotNumber = (spotId) => {
  const spot = spots.value.find(s => s.id === spotId)
  return spot ? spot.spot_number : `车位${spotId}`
}

const getSpotZone = (spotId) => {
  const spot = spots.value.find(s => s.id === spotId)
  return spot ? `${spot.zone}区` : '-'
}

// 格式化日期时间
const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    '未支付': 'warning',
    '已完成': 'success',
    '已取消': 'danger'
  }
  return statusMap[status] || 'info'
}

// 获取数据
const fetchOrders = async () => {
  loading.value = true
  try {
    const res = await getOrders({ per_page: 1000 })
    orders.value = res.data || []
  } catch (e) {
    ElMessage.error(e.message || '获取订单失败')
  } finally {
    loading.value = false
  }
}

const fetchUsers = async () => {
  try {
    const res = await getUsers({ per_page: 1000 })
    users.value = res.data || []
  } catch (e) {
    console.error('获取用户列表失败:', e)
  }
}

const fetchSpots = async () => {
  try {
    const res = await getParkingSpots({ per_page: 1000 })
    spots.value = res.data || []
  } catch (e) {
    console.error('获取车位列表失败:', e)
  }
}

// 筛选和搜索
const handleFilter = () => {
  currentPage.value = 1
}

const handleDateFilter = () => {
  currentPage.value = 1
  if (dateRange.value && dateRange.value.length === 2) {
    const startDate = new Date(dateRange.value[0])
    const endDate = new Date(dateRange.value[1])
    ElMessage.success(`已筛选 ${startDate.toLocaleDateString()} 至 ${endDate.toLocaleDateString()} 的订单`)
  } else if (!dateRange.value || dateRange.value.length === 0) {
    ElMessage.info('已清除日期筛选')
  }
}

const handleSearch = () => {
  currentPage.value = 1
}

// 清除所有筛选
const clearAllFilters = () => {
  statusFilter.value = ''
  dateRange.value = []
  searchKeyword.value = ''
  currentPage.value = 1
  ElMessage.success('已清除所有筛选条件')
}

// 分页
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

// 订单操作
const showAddModal = () => {
  addModalVisible.value = true
  resetForm()
}

const resetForm = () => {
  form.value = { 
    user_id: '', 
    spot_id: '', 
    start_time: '', 
    end_time: '', 
    amount: '', 
    status: '未支付', 
    pay_method: '' 
  }
}

const handleAdd = async () => {
  try {
    await createOrder(form.value)
    ElMessage.success('新增成功')
    addModalVisible.value = false
    fetchOrders()
  } catch (e) {
    ElMessage.error(e.message || '新增失败')
  }
}

const handleDelete = async (id) => {
  try {
    await deleteOrder(id)
    ElMessage.success('删除成功')
    fetchOrders()
  } catch (e) {
    ElMessage.error(e.message || '删除失败')
  }
}

const viewOrderDetail = (order) => {
  ElMessageBox.alert(`
订单详情：
订单号：${order.id}
用户：${getUserName(order.user_id)} (${getUserPhone(order.user_id)})
车位：${getSpotNumber(order.spot_id)} (${getSpotZone(order.spot_id)})
开始时间：${formatDateTime(order.start_time)}
结束时间：${formatDateTime(order.end_time)}
金额：¥${order.amount || '0.00'}
状态：${order.status}
支付方式：${order.pay_method || '-'}
创建时间：${formatDateTime(order.created_at)}
  `, '订单详情', {
    confirmButtonText: '确定'
  })
}

const markAsPaid = async (order) => {
  try {
    await ElMessageBox.confirm(
      `确定要将订单 ${order.id} 标记为已支付吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await payOrder(order.id, '管理员标记')
    ElMessage.success('标记成功')
    fetchOrders()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error(e.message || '标记失败')
    }
  }
}

const handleCancelOrder = async (order) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消订单 ${order.id} 吗？\n取消后车位将重新变为可用状态。`,
      '确认取消订单',
      {
        confirmButtonText: '确定取消',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await cancelOrder(order.id)
    ElMessage.success('订单已取消，车位已释放')
    
    // 刷新订单和车位信息
    await Promise.all([
      fetchOrders(),
      fetchSpots()
    ])
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error(e.message || '取消订单失败')
    }
  }
}

// 初始化
onMounted(async () => {
  await Promise.all([
    fetchOrders(),
    fetchUsers(),
    fetchSpots()
  ])
})
</script>

<style scoped>
.admin-orders-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
}

/* 页面标题 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.header-content .page-title {
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0 0 8px 0;
}

.header-content .page-subtitle {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.add-btn, .refresh-btn {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.add-btn:hover, .refresh-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: white;
  font-size: 1.2rem;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.9rem;
  color: #718096;
  font-weight: 500;
}

/* 筛选区域 */
.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  width: 300px;
}

/* 筛选统计 */
.filter-stats {
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

/* 表格卡片 */
.orders-table-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 用户信息 */
.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: #2d3748;
}

.user-phone {
  font-size: 0.8rem;
  color: #718096;
}

/* 车位信息 */
.spot-info {
  display: flex;
  flex-direction: column;
}

.spot-number {
  font-weight: 500;
  color: #2d3748;
}

.spot-zone {
  font-size: 0.8rem;
  color: #718096;
}

/* 时间信息 */
.time-info {
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
}

.start-time, .end-time {
  margin-bottom: 2px;
}

.start-time {
  color: #2d3748;
}

.end-time {
  color: #718096;
}

/* 金额 */
.amount {
  font-weight: 600;
  color: #e53e3e;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.view-btn, .pay-btn, .cancel-btn, .delete-btn {
  border-radius: 6px;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.view-btn:hover, .pay-btn:hover, .cancel-btn:hover, .delete-btn:hover {
  transform: translateY(-1px);
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 20px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filter-section {
    flex-direction: column;
    gap: 12px;
  }
  
  .search-input {
    width: 100%;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style> 