<template>
  <div class="fade-in">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h2 class="text-[clamp(1.25rem,3vw,1.75rem)] font-semibold">停车场管理</h2>
      <p class="text-gray-500 mt-1">管理停车场车位信息，监控车位状态</p>
    </div>
    
    <!-- 搜索和过滤 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5 mb-6">
      <div class="flex flex-wrap gap-4 items-center">
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">分区:</label>
          <el-select v-model="searchForm.zone" placeholder="选择分区" clearable size="small" style="width: 120px;">
            <el-option v-for="zone in zones" :key="zone.value" :label="zone.label" :value="zone.value" />
          </el-select>
        </div>
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">类型:</label>
          <el-select v-model="searchForm.type" placeholder="选择类型" clearable size="small" style="width: 120px;">
            <el-option v-for="type in types" :key="type.value" :label="type.label" :value="type.value" />
          </el-select>
        </div>
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">状态:</label>
          <el-select v-model="searchForm.status" placeholder="选择状态" clearable size="small" style="width: 120px;">
            <el-option v-for="status in statuses" :key="status.value" :label="status.label" :value="status.value" />
          </el-select>
        </div>
        <div class="flex gap-2">
          <el-button type="primary" size="small" @click="loadParkingSpots">
            <i class="fa fa-search mr-1"></i>搜索
          </el-button>
          <el-button size="small" @click="resetSearch">
            <i class="fa fa-refresh mr-1"></i>重置
          </el-button>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex gap-2">
        <el-button type="primary" @click="showAddDialog">
          <i class="fa fa-plus mr-1"></i>添加停车位
        </el-button>
        <el-button @click="exportData">
          <i class="fa fa-download mr-1"></i>导出数据
        </el-button>
        <el-button type="success" @click="refreshParkingSpots" :loading="refreshLoading">
          <i class="fa fa-refresh mr-1"></i>刷新状态
        </el-button>
        <el-button type="info" @click="toggleAutoRefresh" size="small">
          <i class="fa fa-clock-o mr-1"></i>{{ autoRefreshEnabled ? '关闭自动刷新' : '开启自动刷新' }}
        </el-button>
      </div>
      <div class="flex items-center gap-4">
        <div class="text-sm text-gray-500">
          共 {{ total }} 个车位
        </div>
        <div class="flex items-center gap-2 text-xs" :class="autoRefreshEnabled ? 'text-green-500' : 'text-gray-400'">
          <div class="w-2 h-2 rounded-full" :class="autoRefreshEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'"></div>
          <span>{{ autoRefreshEnabled ? '自动刷新已启用' : '自动刷新已关闭' }}</span>
        </div>
      </div>
    </div>

    <!-- 停车位列表 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <el-table :data="parkingSpots" v-loading="loading" class="table-row-hover">
        <el-table-column
          v-for="key in dataKeys"
          :key="key"
          :prop="key"
          :label="fieldLabelMap[key] || key"
          :min-width="100"
        >
          <template v-if="key === 'status'" #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
          <template v-else-if="key === 'is_active'" #default="{ row }">
            <el-switch v-model="row.is_active" @change="handleStatusChange(row)" size="small" />
          </template>
          <template v-else #default="{ row }">
            {{ row[key] }}
          </template>
        </el-table-column>
        <!-- 操作列 -->
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <div class="flex gap-1">
              <el-button size="small" @click="showEditDialog(row)">
                <i class="fa fa-edit"></i>
              </el-button>
              <el-button size="small" type="danger" @click="handleDelete(row)">
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

    <!-- 添加/编辑对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '添加停车位' : '编辑停车位'"
      v-model="dialogVisible"
      width="500px"
      @closed="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="车位号" prop="spot_number">
          <el-input 
            v-model="form.spot_number" 
            :disabled="dialogType === 'edit'"
            placeholder="请输入车位号，如A001"
          />
        </el-form-item>
        <el-form-item label="分区" prop="zone">
          <el-select v-model="form.zone" placeholder="选择分区">
            <el-option v-for="zone in zones" :key="zone.value" :label="zone.label" :value="zone.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="选择类型">
            <el-option v-for="type in types" :key="type.value" :label="type.label" :value="type.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="选择状态">
            <el-option v-for="status in statuses" :key="status.value" :label="status.label" :value="status.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="pretty-btn" @click="dialogVisible = false">取消</el-button>
          <el-button class="pretty-btn" type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getParkingSpots,
  createParkingSpot,
  updateParkingSpot,
  deleteParkingSpot
} from '@/api/parking'

// 数据
const parkingSpots = ref([])
const loading = ref(false)
const refreshLoading = ref(false)
const autoRefreshEnabled = ref(true)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)

// 字段中文名映射（可选）
const fieldLabelMap = {
  spot_number: '车位号',
  zone: '分区',
  type: '类型',
  status: '状态',
  is_active: '是否启用'
}

// 自动获取所有字段
const dataKeys = computed(() => {
  if (parkingSpots.value.length === 0) return []
  // 过滤掉不需要展示的字段（如 id、created_at、updated_at）
  return Object.keys(parkingSpots.value[0]).filter(
    key => !['id', 'created_at', 'updated_at'].includes(key)
  )
})

// 选项数据
const zones = [
  { value: 'A', label: 'A区' },
  { value: 'B', label: 'B区' },
  { value: 'C', label: 'C区' },
  { value: 'D', label: 'D区' },
  { value: 'E', label: 'E区' },
  { value: 'F', label: 'F区' }
]

const types = [
  { value: '普通', label: '普通' },
  { value: '新能源', label: '新能源' },
  { value: '无障碍', label: '无障碍' }
]

const statuses = [
  { value: '空闲', label: '空闲' },
  { value: '已占用', label: '已占用' },
  { value: '已预约', label: '已预约' },
  { value: '维修', label: '维修' }
]

// 搜索表单
const searchForm = reactive({
  zone: '',
  type: '',
  status: ''
})

// 表单数据
const form = reactive({
  id: '',
  spot_number: '',
  zone: '',
  type: '',
  status: '空闲'
})

// 表单验证规则
const rules = {
  spot_number: [
    { required: true, message: '请输入车位号', trigger: 'blur' },
    { pattern: /^[A-Z0-9]{1,10}$/, message: '车位号只能包含大写字母和数字，长度1-10', trigger: 'blur' }
  ],
  zone: [
    { required: true, message: '请选择分区', trigger: 'change' }
  ],
  type: [
    { required: true, message: '请选择类型', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 生命周期
onMounted(() => {
  loadParkingSpots()
  // 启动自动刷新（每30秒刷新一次）
  startAutoRefresh()
})

// 组件卸载时清理定时器
onUnmounted(() => {
  stopAutoRefresh()
})

// 自动刷新定时器
let autoRefreshTimer = null

// 启动自动刷新
const startAutoRefresh = () => {
  // 清除之前的定时器
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer)
  }
  // 每30秒自动刷新一次
  autoRefreshTimer = setInterval(() => {
    if (!refreshLoading.value && !loading.value && autoRefreshEnabled.value) {
      refreshParkingSpots()
    }
  }, 30000) // 30秒
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

// 停止自动刷新
const stopAutoRefresh = () => {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer)
    autoRefreshTimer = null
  }
}

// 方法
const loadParkingSpots = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      per_page: pageSize.value,
      ...searchForm
    }
    const response = await getParkingSpots(params)
    parkingSpots.value = response.data
    total.value = response.total
  } catch (error) {
    console.error('获取车位列表失败:', error)
    ElMessage.error(error.message || '获取车位列表失败')
  } finally {
    loading.value = false
  }
}

// 刷新车位状态
const refreshParkingSpots = async () => {
  refreshLoading.value = true
  try {
    const params = {
      page: currentPage.value,
      per_page: pageSize.value,
      ...searchForm
    }
    const response = await getParkingSpots(params)
    parkingSpots.value = response.data
    total.value = response.total
    ElMessage.success('车位状态已刷新')
  } catch (error) {
    console.error('刷新车位状态失败:', error)
    ElMessage.error(error.message || '刷新车位状态失败')
  } finally {
    refreshLoading.value = false
  }
}

const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  currentPage.value = 1
  loadParkingSpots()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  loadParkingSpots()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  loadParkingSpots()
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  form.spot_number = ''
  form.zone = ''
  form.type = ''
  form.status = '空闲'
}

const showAddDialog = () => {
  dialogType.value = 'add'
  resetForm()
  dialogVisible.value = true
}

const showEditDialog = (row) => {
  dialogType.value = 'edit'
  Object.keys(form).forEach(key => {
    form[key] = row[key]
  })
  form.id = row.id
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      const loadingInstance = ElMessage({
        message: '正在提交...',
        duration: 0,
        icon: 'loading'
      })
      try {
        if (dialogType.value === 'add') {
          await createParkingSpot(form)
          ElMessage.success('添加成功')
        } else {
          await updateParkingSpot(form.id, form)
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
        // 立即刷新车位状态
        await refreshParkingSpots()
      } catch (error) {
        console.error('提交表单失败:', error)
        let errorMsg = '操作失败'
        if (error.response) {
          if (error.response.data.message) {
            errorMsg = error.response.data.message
          } else if (error.response.status === 400) {
            errorMsg = '请求参数错误'
          } else if (error.response.status === 404) {
            errorMsg = '停车位不存在'
          }
        }
        ElMessage.error(errorMsg)
      } finally {
        loadingInstance.close()
      }
    }
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该停车位吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteParkingSpot(row.id)
      ElMessage.success('删除成功')
      // 立即刷新车位状态
      await refreshParkingSpots()
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error(error.message || '删除失败')
    }
  })
}

const exportData = () => {
  // 导出数据功能
  ElMessage.info('导出功能开发中...')
}

const handleStatusChange = async (row) => {
  try {
    await updateParkingSpot(row.id, { is_active: row.is_active })
    ElMessage.success('状态更新成功')
    // 立即刷新车位状态
    await refreshParkingSpots()
  } catch (error) {
    console.error('状态更新失败:', error)
    ElMessage.error(error.message || '状态更新失败')
    row.is_active = !row.is_active // 恢复原状态
  }
}

const getStatusType = (status) => {
  const types = {
    '空闲': 'success',
    '已占用': 'warning',
    '已预约': 'info',
    '维修': 'danger'
  }
  return types[status] || 'info'
}
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