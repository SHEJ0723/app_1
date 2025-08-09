<template>
  <div class="fade-in">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h2 class="text-[clamp(1.25rem,3vw,1.75rem)] font-semibold">账单管理</h2>
      <p class="text-gray-500 mt-1">管理用户账单和支付记录</p>
    </div>
    
    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">总账单数</p>
            <p class="text-2xl font-bold text-gray-900">{{ statistics.total_bills || 0 }}</p>
          </div>
          <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <i class="fa fa-file-text text-blue-600"></i>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">已支付</p>
            <p class="text-2xl font-bold text-green-600">{{ statistics.paid_bills || 0 }}</p>
          </div>
          <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <i class="fa fa-check text-green-600"></i>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">未支付</p>
            <p class="text-2xl font-bold text-orange-600">{{ statistics.unpaid_bills || 0 }}</p>
          </div>
          <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <i class="fa fa-clock text-orange-600"></i>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">总金额</p>
            <p class="text-2xl font-bold text-blue-600">¥{{ (statistics.total_amount || 0).toFixed(2) }}</p>
          </div>
          <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <i class="fa fa-yen text-blue-600"></i>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 搜索和过滤 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5 mb-6">
      <div class="flex flex-wrap gap-4 items-center">
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">状态:</label>
          <el-select v-model="searchForm.status" placeholder="选择状态" clearable size="small" style="width: 120px;">
            <el-option label="已支付" value="已支付" />
            <el-option label="未支付" value="未支付" />
            <el-option label="已取消" value="已取消" />
          </el-select>
        </div>
        
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">用户名:</label>
          <el-input v-model="searchForm.user_name" placeholder="搜索用户名" size="small" style="width: 150px;" />
        </div>
        
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">订单号:</label>
          <el-input v-model="searchForm.order_id" placeholder="搜索订单号" size="small" style="width: 150px;" />
        </div>
        
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">时间范围:</label>
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            size="small"
            style="width: 240px;"
            value-format="YYYY-MM-DD"
          />
        </div>
        
        <div class="flex gap-2">
          <el-button type="primary" size="small" @click="loadBillsHandler">
            <i class="fa fa-search mr-1"></i>搜索
          </el-button>
          <el-button size="small" @click="resetSearchHandler">
            <i class="fa fa-refresh mr-1"></i>重置
          </el-button>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex gap-2">
        <el-button @click="exportBillsHandler" :loading="exporting">
          <i class="fa fa-download mr-1"></i>导出账单
        </el-button>
        <el-button @click="generateReportHandler">
          <i class="fa fa-chart-bar mr-1"></i>生成报表
        </el-button>
        <el-button type="primary" @click="showCreateDialogHandler">
          <i class="fa fa-plus mr-1"></i>新增账单
        </el-button>
      </div>
      <div class="text-sm text-gray-500">
        共 {{ total }} 条账单记录
      </div>
    </div>

    <!-- 账单列表 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <el-table :data="bills" v-loading="loading" class="table-row-hover">
        <el-table-column prop="id" label="账单编号" width="120">
          <template #default="{ row }">
            <span class="font-medium">BILL-{{ String(row.id).padStart(6, '0') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="user_name" label="用户名" width="120" />
        <el-table-column prop="user_phone" label="用户电话" width="130" />
        <el-table-column prop="order_number" label="订单编号" width="120" />
        <el-table-column prop="amount" label="金额" width="100">
          <template #default="{ row }">
            <span class="font-medium text-green-600">¥{{ row.amount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="pay_method" label="支付方式" width="100">
          <template #default="{ row }">
            <span v-if="row.pay_method">{{ row.pay_method }}</span>
            <span v-else class="text-gray-400">未支付</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="pay_time" label="支付时间" width="160">
          <template #default="{ row }">
            <span v-if="row.pay_time">{{ formatDateTime(row.pay_time) }}</span>
            <span v-else class="text-gray-400">未支付</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="flex gap-1">
              <el-button size="small" @click="viewBillDetailHandler(row)">
                <i class="fa fa-eye"></i>
              </el-button>
              <el-button size="small" type="primary" @click="editBillHandler(row)">
                <i class="fa fa-edit"></i>
              </el-button>
              <el-button size="small" type="warning" @click="sendReminderHandler(row)" v-if="row.status === '未支付'">
                <i class="fa fa-bell"></i>
              </el-button>
              <el-button size="small" type="danger" @click="deleteBillHandler(row)">
                <i class="fa fa-trash"></i>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
        <p class="text-sm text-gray-500">显示 {{ (currentPage - 1) * pageSize + 1 }} 至 {{ Math.min(currentPage * pageSize, total) }} 条，共 {{ total }} 条</p>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="sizes, prev, pager, next"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          size="small"
        />
      </div>
    </div>

    <!-- 账单详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="账单详情"
      width="700px"
    >
      <div v-if="selectedBill" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-700">账单编号:</label>
            <p class="text-sm">BILL-{{ String(selectedBill.id).padStart(6, '0') }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700">订单编号:</label>
            <p class="text-sm">{{ selectedBill.order_number }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700">用户名:</label>
            <p class="text-sm">{{ selectedBill.user_name }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700">用户电话:</label>
            <p class="text-sm">{{ selectedBill.user_phone }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700">用户邮箱:</label>
            <p class="text-sm">{{ selectedBill.user_email || '未设置' }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700">金额:</label>
            <p class="text-sm font-medium text-green-600">¥{{ selectedBill.amount.toFixed(2) }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700">状态:</label>
            <el-tag :type="getStatusType(selectedBill.status)" size="small">
              {{ selectedBill.status }}
            </el-tag>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700">支付方式:</label>
            <p class="text-sm">{{ selectedBill.pay_method || '未支付' }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700">创建时间:</label>
            <p class="text-sm">{{ formatDateTime(selectedBill.created_at) }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700">支付时间:</label>
            <p class="text-sm">{{ selectedBill.pay_time ? formatDateTime(selectedBill.pay_time) : '未支付' }}</p>
          </div>
          <div v-if="selectedBill.order_start_time">
            <label class="text-sm font-medium text-gray-700">订单开始时间:</label>
            <p class="text-sm">{{ formatDateTime(selectedBill.order_start_time) }}</p>
          </div>
          <div v-if="selectedBill.order_end_time">
            <label class="text-sm font-medium text-gray-700">订单结束时间:</label>
            <p class="text-sm">{{ formatDateTime(selectedBill.order_end_time) }}</p>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 编辑账单对话框 -->
    <el-dialog
      v-model="editVisible"
      title="编辑账单"
      width="500px"
    >
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="金额">
          <el-input v-model="editForm.amount" type="number" step="0.01" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="editForm.status">
            <el-option label="已支付" value="已支付" />
            <el-option label="未支付" value="未支付" />
            <el-option label="已取消" value="已取消" />
          </el-select>
        </el-form-item>
        <el-form-item label="支付方式">
          <el-select v-model="editForm.pay_method" clearable>
            <el-option label="支付宝" value="支付宝" />
            <el-option label="微信" value="微信" />
            <el-option label="银行卡" value="银行卡" />
          </el-select>
        </el-form-item>
        <el-form-item label="支付时间">
          <el-date-picker
            v-model="editForm.pay_time"
            type="datetime"
            placeholder="选择支付时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEditHandler" :loading="saving">保存</el-button>
      </template>
    </el-dialog>

    <!-- 新增账单对话框 -->
    <el-dialog
      v-model="createVisible"
      title="新增账单"
      width="500px"
    >
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="用户ID" required>
          <el-input v-model="createForm.user_id" type="number" />
        </el-form-item>
        <el-form-item label="订单ID" required>
          <el-input v-model="createForm.order_id" type="number" />
        </el-form-item>
        <el-form-item label="金额" required>
          <el-input v-model="createForm.amount" type="number" step="0.01" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="createForm.status">
            <el-option label="已支付" value="已支付" />
            <el-option label="未支付" value="未支付" />
            <el-option label="已取消" value="已取消" />
          </el-select>
        </el-form-item>
        <el-form-item label="支付方式">
          <el-select v-model="createForm.pay_method" clearable>
            <el-option label="支付宝" value="支付宝" />
            <el-option label="微信" value="微信" />
            <el-option label="银行卡" value="银行卡" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCreateHandler" :loading="creating">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getBills, getBillStatistics, getBillDetail, createBill, updateBill, deleteBill, sendBillReminder, exportBills } from '@/api/bills'
import { debugAuth } from '@/utils/debug'

// 数据
const bills = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const detailVisible = ref(false)
const selectedBill = ref(null)
const editVisible = ref(false)
const editForm = ref({})
const createVisible = ref(false)
const createForm = ref({})
const saving = ref(false)
const creating = ref(false)
const exporting = ref(false)
const statistics = ref({})

// 搜索表单
const searchForm = reactive({
  status: '',
  user_name: '',
  order_id: '',
  dateRange: []
})

// 获取账单列表
const loadBillsHandler = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      per_page: pageSize.value,
      status: searchForm.status,
      user_name: searchForm.user_name,
      order_id: searchForm.order_id
    }
    
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.start_date = searchForm.dateRange[0]
      params.end_date = searchForm.dateRange[1]
    }
    
    console.log('loadBillsHandler - 请求参数:', params)
    const response = await getBills(params)
    console.log('loadBillsHandler - 完整API响应:', response)
    
    if (response.success) {
      bills.value = response.data
      total.value = response.total
      console.log('loadBillsHandler - 账单数据:', bills.value)
      console.log('loadBillsHandler - 总数:', total.value)
    } else {
      console.error('loadBillsHandler - API返回失败:', response.message)
      ElMessage.error(response.message || '获取账单列表失败')
    }
  } catch (error) {
    console.error('获取账单列表失败:', error)
    ElMessage.error('获取账单列表失败')
  } finally {
    loading.value = false
  }
}

// 获取统计信息
const loadStatisticsHandler = async () => {
  try {
    console.log('loadStatisticsHandler - 开始获取统计信息')
    const response = await getBillStatistics()
    console.log('loadStatisticsHandler - 完整API响应:', response)
    
    if (response.success) {
      statistics.value = response.data
      console.log('loadStatisticsHandler - 统计数据:', statistics.value)
    } else {
      console.error('loadStatisticsHandler - API返回失败:', response.message)
    }
  } catch (error) {
    console.error('获取统计信息失败:', error)
  }
}

// 重置搜索
const resetSearchHandler = () => {
  searchForm.status = ''
  searchForm.user_name = ''
  searchForm.order_id = ''
  searchForm.dateRange = []
  currentPage.value = 1
  loadBillsHandler()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  loadBillsHandler()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  loadBillsHandler()
}

// 状态处理
const getStatusType = (status) => {
  const types = {
    '已支付': 'success',
    '未支付': 'warning',
    '已取消': 'danger'
  }
  return types[status] || 'info'
}

// 格式化日期时间
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return ''
  const date = new Date(dateTimeStr)
  return date.toLocaleString('zh-CN')
}

// 查看账单详情
const viewBillDetailHandler = async (row) => {
  try {
    const response = await getBillDetail(row.id)
    if (response.success) {
      selectedBill.value = response.data
      detailVisible.value = true
    } else {
      ElMessage.error(response.message || '获取账单详情失败')
    }
  } catch (error) {
    console.error('获取账单详情失败:', error)
    ElMessage.error('获取账单详情失败')
  }
}

// 编辑账单
const editBillHandler = (row) => {
  editForm.value = {
    id: row.id,
    amount: row.amount,
    status: row.status,
    pay_method: row.pay_method,
    pay_time: row.pay_time
  }
  editVisible.value = true
}

// 保存编辑
const saveEditHandler = async () => {
  saving.value = true
  try {
    const response = await updateBill(editForm.value.id, editForm.value)
    if (response.success) {
      ElMessage.success('账单更新成功')
      editVisible.value = false
      loadBillsHandler()
    } else {
      ElMessage.error(response.message || '更新失败')
    }
  } catch (error) {
    console.error('更新账单失败:', error)
    ElMessage.error('更新账单失败')
  } finally {
    saving.value = false
  }
}

// 显示新增对话框
const showCreateDialogHandler = () => {
  createForm.value = {
    user_id: '',
    order_id: '',
    amount: '',
    status: '未支付',
    pay_method: ''
  }
  createVisible.value = true
}

// 保存新增
const saveCreateHandler = async () => {
  creating.value = true
  try {
    const response = await createBill(createForm.value)
    if (response.success) {
      ElMessage.success('账单创建成功')
      createVisible.value = false
      loadBillsHandler()
      loadStatisticsHandler()
    } else {
      ElMessage.error(response.message || '创建失败')
    }
  } catch (error) {
    console.error('创建账单失败:', error)
    ElMessage.error('创建账单失败')
  } finally {
    creating.value = false
  }
}

// 删除账单
const deleteBillHandler = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除账单 BILL-${String(row.id).padStart(6, '0')} 吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await deleteBill(row.id)
    if (response.success) {
      ElMessage.success('账单删除成功')
      loadBillsHandler()
      loadStatisticsHandler()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除账单失败:', error)
      ElMessage.error('删除账单失败')
    }
  }
}

// 发送提醒
const sendReminderHandler = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要向用户 ${row.user_name} 发送支付提醒吗？`, '发送提醒', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await sendBillReminder(row.id)
    if (response.success) {
      ElMessage.success('提醒发送成功')
    } else {
      ElMessage.error(response.message || '发送失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('发送提醒失败:', error)
      ElMessage.error('发送提醒失败')
    }
  }
}

// 导出账单
const exportBillsHandler = async () => {
  exporting.value = true
  try {
    const response = await exportBills()
    if (response.success) {
      // 创建下载链接
      const dataStr = JSON.stringify(response.data, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = response.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      ElMessage.success('账单导出成功')
    } else {
      ElMessage.error(response.message || '导出失败')
    }
  } catch (error) {
    console.error('导出账单失败:', error)
    ElMessage.error('导出账单失败')
  } finally {
    exporting.value = false
  }
}

// 生成报表
const generateReportHandler = () => {
  ElMessage.info('报表生成功能开发中...')
}

onMounted(() => {
  // 调试认证状态
  debugAuth()
  
  loadBillsHandler()
  loadStatisticsHandler()
})
</script>

<style scoped>
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
  .flex-wrap {
    flex-direction: column;
    align-items: stretch;
  }
  
  .flex-wrap > div {
    margin-bottom: 8px;
  }
}
</style> 