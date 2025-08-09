<template>
  <div class="fade-in">
    <!-- 页面标题 -->
    <div class="mb-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-[clamp(1.25rem,3vw,1.75rem)] font-semibold">预订车位</h2>
          <p class="text-gray-500 mt-1">选择并预约您需要的停车位</p>
        </div>
        <el-button type="primary" @click="$router.push('/user')" class="back-btn">
          <i class="fa fa-arrow-left mr-2"></i> 返回首页
        </el-button>
      </div>
    </div>

    <!-- 筛选和统计区域 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
      <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4">
        <h3 class="font-medium text-lg text-gray-800">车位选择</h3>
        <div class="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
          <span class="text-sm font-medium text-gray-600 flex items-center">
            <i class="fa fa-filter mr-2 text-blue-500"></i>
            筛选条件
          </span>
          <el-select 
            v-model="zone" 
            placeholder="选择分区" 
            @change="handleZoneChange" 
            class="zone-select"
            style="width: 140px;"
          >
            <el-option label="全部区域" value="" />
            <el-option label="A区 - 普通车位" value="A" />
            <el-option label="B区 - 普通车位" value="B" />
            <el-option label="C区 - 混合车位" value="C" />
            <el-option label="D区 - 充电车位" value="D" />
            <el-option label="E区 - 无障碍车位" value="E" />
            <el-option label="F区 - 新能源车位" value="F" />
          </el-select>
          <el-select 
            v-model="spotType" 
            placeholder="选择类型" 
            @change="handleTypeChange" 
            class="type-select"
            style="width: 140px;"
          >
            <el-option label="全部类型" value="" />
            <el-option label="普通车位" value="普通" />
            <el-option label="大型车位" value="大型" />
            <el-option label="新能源车位" value="新能源" />
            <el-option label="无障碍车位" value="无障碍" />
          </el-select>
        </div>
      </div>
      
      <!-- 统计信息 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="stat-item bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 hover:shadow-md transition-all duration-300">
          <div class="stat-icon bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center mb-3">
            <i class="fa fa-car text-lg"></i>
          </div>
          <div class="stat-content">
            <p class="stat-label text-blue-700 font-medium">总车位</p>
            <p class="stat-value text-blue-900 text-2xl font-bold">{{ total }}</p>
          </div>
        </div>
        <div class="stat-item bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 hover:shadow-md transition-all duration-300">
          <div class="stat-icon bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center mb-3">
            <i class="fa fa-check-circle text-lg"></i>
          </div>
          <div class="stat-content">
            <p class="stat-label text-green-700 font-medium">可用车位</p>
            <p class="stat-value text-green-900 text-2xl font-bold">{{ availableSpots }}</p>
          </div>
        </div>
        <div class="stat-item bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4 hover:shadow-md transition-all duration-300">
          <div class="stat-icon bg-orange-500 text-white rounded-full w-12 h-12 flex items-center justify-center mb-3">
            <i class="fa fa-clock-o text-lg"></i>
          </div>
          <div class="stat-content">
            <p class="stat-label text-orange-700 font-medium">已预约</p>
            <p class="stat-value text-orange-900 text-2xl font-bold">{{ reservedSpots }}</p>
          </div>
        </div>
        <div class="stat-item bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4 hover:shadow-md transition-all duration-300">
          <div class="stat-icon bg-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center mb-3">
            <i class="fa fa-ban text-lg"></i>
          </div>
          <div class="stat-content">
            <p class="stat-label text-red-700 font-medium">已占用</p>
            <p class="stat-value text-red-900 text-2xl font-bold">{{ occupiedSpots }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 车位列表 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div class="flex justify-between items-center mb-6">
        <h3 class="font-medium text-lg text-gray-800 flex items-center">
          <i class="fa fa-list mr-2 text-blue-500"></i>
          车位列表
          <span class="ml-2 text-sm text-gray-500">
            (已绑定 {{ licensePlates.length }} 个车牌)
          </span>
        </h3>
        <div class="flex gap-2">
          <el-button 
            v-if="licensePlates.length > 0 && availableSpots > 0"
            type="success" 
            size="small" 
            @click="showBatchReserveDialog"
            class="batch-reserve-btn"
            title="批量预约空闲车位"
          >
            <i class="fa fa-th-large mr-1"></i> 批量预约
          </el-button>
          <el-button type="primary" size="small" @click="fetchLicensePlates" :loading="loading" class="refresh-btn">
            <i class="fa fa-car mr-1"></i> 刷新车牌
          </el-button>
          <el-button type="primary" size="small" @click="fetchSpots" :loading="loading" class="refresh-btn">
            <i class="fa fa-refresh mr-1"></i> 刷新车位
          </el-button>
        </div>
      </div>
      
      <div class="overflow-x-auto rounded-lg border border-gray-200">
        <table class="w-full">
          <thead>
            <tr class="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <th class="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wide">车位号</th>
              <th class="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wide">分区</th>
              <th class="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wide">类型</th>
              <th class="text-center py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wide">状态</th>
              <th class="text-center py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wide">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(spot, index) in spots" :key="spot.id" 
                class="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-200"
                :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'">
              <td class="py-4 px-6 text-sm font-semibold text-gray-900">{{ spot.spot_number }}</td>
              <td class="py-4 px-6 text-sm text-gray-700">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ spot.zone }}区
                </span>
              </td>
              <td class="py-4 px-6 text-sm text-gray-700">{{ spot.type }}</td>
              <td class="py-4 px-6 text-center">
                <span :class="getStatusClass(spot.status)" class="px-3 py-1.5 rounded-full text-xs font-medium">
                  {{ spot.status }}
                </span>
              </td>
              <td class="py-4 px-6 text-center">
                <div class="flex flex-col gap-2">
                  <!-- 主要预约按钮 -->
                  <el-button 
                    type="primary" 
                    size="small" 
                    :disabled="licensePlates.length === 0 || spot.status !== '空闲'"
                    @click="openReserveDialog(spot)"
                    class="reserve-btn hover:shadow-md transition-all duration-200"
                    :title="licensePlates.length === 0 ? '请先绑定车牌' : '点击预约此车位'"
                  >
                    <i class="fa fa-calendar-plus mr-1"></i> 
                    {{ licensePlates.length === 0 ? '需绑定车牌' : '立即预约' }}
                  </el-button>
                  
                  <!-- 快速预约按钮（如果状态为空闲且有车牌） -->
                  <el-button 
                    v-if="licensePlates.length > 0 && spot.status === '空闲'"
                    type="success" 
                    size="small" 
                    @click="quickReserve(spot)"
                    class="quick-reserve-btn hover:shadow-md transition-all duration-200"
                    title="快速预约（使用默认车牌）"
                  >
                    <i class="fa fa-bolt mr-1"></i> 
                    快速预约
                  </el-button>
                  
                  <!-- 状态提示 -->
                  <div v-if="spot.status !== '空闲'" class="text-xs text-gray-500">
                    {{ spot.status === '已占用' || spot.status === '占用' ? '车位已占用' : (spot.status === '已预约' || spot.status === '预约') ? '车位已预约' : '车位不可用' }}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 分页 -->
      <div class="mt-6 flex justify-center">
        <el-pagination
          :current-page="page"
          :page-size="pageSize"
          :total="total"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[5, 10, 20, 50]"
        />
      </div>
      
      <!-- 加载状态 -->
      <SkeletonScreen 
        v-if="loading" 
        type="table" 
        :rows="5"
        :columns="5"
        class="mb-6"
      />
      
      <!-- 空状态 -->
      <div v-if="spots.length === 0 && !loading" class="text-center py-12">
        <i class="fa fa-car text-4xl text-gray-300 mb-4"></i>
        <p class="text-gray-500">暂无可用车位</p>
      </div>
    </div>

    <!-- 预约对话框 -->
    <el-dialog v-model="dialogVisible" title="填写预约信息" width="500px" @closed="resetForm" class="reserve-dialog">
      <div v-if="licensePlates.length === 0" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <i class="fa fa-exclamation-triangle text-red-500 mr-2"></i>
            <span class="text-red-700">请先绑定车牌后再预约！</span>
          </div>
          <el-button 
            type="primary" 
            size="small" 
            @click="goToPlateManagement"
            class="ml-2"
          >
            <i class="fa fa-plus mr-1"></i> 去绑定车牌
          </el-button>
        </div>
      </div>
      
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="reserve-form">
        <el-form-item label="车牌号" prop="plate" class="form-item-modern">
          <el-select 
            v-model="form.plate" 
            placeholder="请选择车牌号" 
            style="width:100%"
            filterable
            clearable
            @change="handlePlateChange"
          >
            <el-option 
              v-for="plate in licensePlatesData" 
              :key="plate.id" 
              :label="plate.plate_number + (plate.is_default ? ' (默认)' : '')" 
              :value="plate.plate_number"
            >
              <div class="flex items-center justify-between">
                <span>{{ plate.plate_number }}</span>
                <span v-if="plate.is_default" class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">默认</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone" class="form-item-modern">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        
        <el-form-item label="预约时间段" prop="timeRange" class="form-item-modern">
          <el-date-picker
            v-model="form.timeRange"
            type="datetimerange"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width:100%"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            :shortcuts="timeShortcuts"
            :disabled-date="disabledDate"
            :disabled-time="disabledTime"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="dialogVisible = false" class="cancel-btn">取消</el-button>
          <el-button 
            type="primary" 
            :disabled="!form.plate || !form.phone || !form.timeRange || form.timeRange.length !== 2" 
            @click="handleReserve"
            class="confirm-btn"
            :loading="loading"
          >
            <i class="fa fa-check mr-1"></i> 确定预约
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量预约对话框 -->
    <el-dialog v-model="batchReserveVisible" title="批量预约车位" width="600px" class="batch-reserve-dialog">
      <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="flex items-center">
          <i class="fa fa-info-circle text-blue-500 mr-2"></i>
          <span class="text-blue-700">选择要批量预约的车位，系统将使用您的默认车牌进行预约</span>
        </div>
      </div>
      
      <div class="mb-4">
        <h4 class="font-medium text-gray-800 mb-3">可预约车位列表：</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
          <div 
            v-for="spot in spots.filter(s => s.status === '空闲')" 
            :key="spot.id"
            class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            :class="{ 'bg-blue-50 border-blue-300': selectedSpots.includes(spot) }"
          >
            <el-checkbox 
              v-model="selectedSpots" 
              :value="spot"
              @change="(checked) => handleSpotSelection(spot, checked)"
            />
            <div class="ml-3 flex-1">
              <div class="font-medium text-gray-900">{{ spot.spot_number }}</div>
              <div class="text-sm text-gray-500">{{ spot.zone }}区 - {{ spot.type }}</div>
            </div>
            <span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              空闲
            </span>
          </div>
        </div>
      </div>
      
      <div class="text-sm text-gray-600">
        <p>• 已选择 {{ selectedSpots.length }} 个车位</p>
        <p>• 预约时间：当前时间起2小时</p>
        <p>• 使用车牌：{{ licensePlatesData.find(p => p.is_default)?.plate_number || '未设置默认车牌' }}</p>
      </div>
      
      <template #footer>
        <div class="flex justify-between items-center">
          <el-button @click="batchReserveVisible = false" class="cancel-btn">取消</el-button>
          <div class="flex gap-2">
            <el-button 
              type="info" 
              size="small" 
              @click="selectedSpots = spots.filter(s => s.status === '空闲').slice(0, 3)"
            >
              选择前3个
            </el-button>
            <el-button 
              type="warning" 
              size="small" 
              @click="selectedSpots = []"
            >
              清空选择
            </el-button>
            <el-button 
              type="primary" 
              :disabled="selectedSpots.length === 0"
              @click="handleBatchReserve"
              class="confirm-btn"
            >
              <i class="fa fa-check mr-1"></i> 确认批量预约 ({{ selectedSpots.length }})
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getParkingSpots, updateParkingSpot } from '@/api/parking'
import { createOrder } from '@/api/orders'
import { getUserLicensePlates } from '@/api/license_plates'
import { ElMessage, ElMessageBox } from 'element-plus'
import SkeletonScreen from '@/components/SkeletonScreen.vue'

const spots = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const formRef = ref(null)
const form = ref({ plate: '', phone: '', timeRange: [], spot: null })
const zone = ref('')
const spotType = ref('')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 时间快捷选项
const timeShortcuts = [
  {
    text: '今天',
    value: () => {
      const end = new Date()
      const start = new Date()
      return [start, end]
    }
  },
  {
    text: '明天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() + 3600 * 1000 * 24)
      end.setTime(end.getTime() + 3600 * 1000 * 24)
      return [start, end]
    }
  },
  {
    text: '本周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '下周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() + 3600 * 1000 * 24 * 7)
      end.setTime(end.getTime() + 3600 * 1000 * 24 * 14)
      return [start, end]
    }
  }
]

// 禁用过去的日期
const disabledDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7 // 禁用今天之前的日期
}

// 禁用时间（可选）
const disabledTime = (date, type) => {
  if (type === 'start') {
    return {
      disabledHours: () => [],
      disabledMinutes: () => [],
      disabledSeconds: () => []
    }
  }
  return {
    disabledHours: () => [],
    disabledMinutes: () => [],
    disabledSeconds: () => []
  }
}

const rules = {
  plate: [ { required: true, message: '请选择车牌号', trigger: 'change' } ],
  phone: [ { required: true, message: '请输入手机号', trigger: 'blur' }, { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' } ],
  timeRange: [
    { required: true, message: '请选择预约时间段', trigger: 'change' },
    { validator: (rule, value, callback) => {
        if (value && value.length === 2 && value[1] <= value[0]) {
          callback(new Error('结束时间必须晚于开始时间'))
        } else {
          callback()
        }
      }, trigger: 'change'
    }
  ]
}

// 用户车牌列表
const licensePlates = ref([])
const licensePlatesData = ref([]) // 完整的车牌数据

// 处理车牌选择变化
const handlePlateChange = (value) => {
          // 选择车牌
  form.value.plate = value
  
  // 自动填充手机号（如果用户信息中有）
  if (!form.value.phone) {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    if (userInfo && userInfo.phone) {
      form.value.phone = userInfo.phone
    }
  }
}

// 获取用户车牌列表
const fetchLicensePlates = async () => {
  try {
    const response = await getUserLicensePlates()
    if (response.success) {
      licensePlatesData.value = response.data
      licensePlates.value = response.data.map(plate => plate.plate_number)
    } else {
      console.error('获取车牌列表失败:', response.message)
      licensePlatesData.value = []
      licensePlates.value = []
    }
  } catch (error) {
    console.error('获取车牌列表失败:', error)
    ElMessage.error('获取车牌列表失败，请检查网络连接')
    licensePlatesData.value = []
    licensePlates.value = []
  }
}

onMounted(async () => {
  // 获取用户车牌列表
  await fetchLicensePlates()
  // 获取车位列表
  await fetchSpots()
})

// 处理分区变化
const handleZoneChange = () => {
  page.value = 1 // 重置页码
  fetchSpots()
}

// 处理类型变化
const handleTypeChange = () => {
  page.value = 1 // 重置页码
  fetchSpots()
}

// 计算属性
const availableSpots = computed(() => spots.value.filter(spot => spot.status === '空闲').length)
const reservedSpots = computed(() => spots.value.filter(spot => spot.status === '已预约').length)
const occupiedSpots = computed(() => spots.value.filter(spot => spot.status === '已占用').length)

const getStatusClass = (status) => {
  const statusMap = {
    '空闲': 'bg-green-100 text-green-800 border border-green-200',
    '已预约': 'bg-orange-100 text-orange-800 border border-orange-200',
    '已占用': 'bg-red-100 text-red-800 border border-red-200'
  }
  return statusMap[status] || 'bg-gray-100 text-gray-600 border border-gray-200'
}

const fetchSpots = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      per_page: pageSize.value,
      ...(zone.value ? { zone: zone.value } : {}),
      ...(spotType.value ? { type: spotType.value } : {})
    }
    const res = await getParkingSpots(params)
    
    if (res.success) {
      spots.value = res.data || []
      total.value = res.total
    } else {
      ElMessage.error(res.message || '获取车位失败')
      spots.value = []
      total.value = 0
    }
  } catch (e) {

    ElMessage.error(e.message || '获取车位失败')
    spots.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function handlePageChange(val) {
  page.value = val
  fetchSpots()
}
function handleSizeChange(val) {
  pageSize.value = val
  page.value = 1
  fetchSpots()
}

function openReserveDialog(spot) {
  form.value = { plate: '', phone: '', timeRange: [], spot }
  
  // 自动选择默认车牌
  const defaultPlate = licensePlatesData.value.find(plate => plate.is_default)
  if (defaultPlate) {
    form.value.plate = defaultPlate.plate_number
  }
  
  dialogVisible.value = true
}

// 批量预约对话框
const batchReserveVisible = ref(false)
const selectedSpots = ref([])

// 显示批量预约对话框
function showBatchReserveDialog() {
  const availableSpotsList = spots.value.filter(spot => spot.status === '空闲')
  if (availableSpotsList.length === 0) {
    ElMessage.warning('当前没有可用的空闲车位')
    return
  }
  
  selectedSpots.value = availableSpotsList.slice(0, 3) // 默认选择前3个
  batchReserveVisible.value = true
}

// 处理车位选择
function handleSpotSelection(spot, checked) {
  if (checked) {
    if (!selectedSpots.value.includes(spot)) {
      selectedSpots.value.push(spot)
    }
  } else {
    selectedSpots.value = selectedSpots.value.filter(s => s.id !== spot.id)
  }
}

// 批量预约功能
async function handleBatchReserve() {
  try {
    // 检查是否有默认车牌
    const defaultPlate = licensePlatesData.value.find(plate => plate.is_default)
    if (!defaultPlate) {
      ElMessage.warning('请先设置默认车牌')
      return
    }
    
    // 检查用户登录状态
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    if (!userInfo || !userInfo.id) {
      ElMessage.error('请先登录')
      return
    }
    
    if (selectedSpots.value.length === 0) {
      ElMessage.warning('请选择要预约的车位')
      return
    }
    
    // 设置默认时间范围（当前时间到2小时后）
    const now = new Date()
    const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2小时后
    
    // 显示确认对话框
    try {
      await ElMessageBox.confirm(
        `确定要批量预约 ${selectedSpots.value.length} 个车位吗？\n使用车牌：${defaultPlate.plate_number}\n时间：${now.toLocaleString()} - ${endTime.toLocaleString()}`,
        '批量预约确认',
        {
          confirmButtonText: '确认预约',
          cancelButtonText: '取消',
          type: 'info'
        }
      )
      
      // 用户确认，执行批量预约
      const promises = selectedSpots.value.map(spot => 
        createOrder({
          user_id: userInfo.id,
          spot_id: spot.id,
          start_time: formatDateToMySQL(now),
          end_time: formatDateToMySQL(endTime),
          status: '未支付',
          amount: 0
        })
      )
      
      const results = await Promise.all(promises)
      const successCount = results.filter(result => result.success).length
      
      if (successCount > 0) {
        ElMessage.success(`批量预约成功！成功预约 ${successCount} 个车位`)
        batchReserveVisible.value = false
        // 刷新车位列表
        await fetchSpots()
        
        // 显示成功提示，让用户选择是否立即跳转
        try {
          await ElMessageBox.confirm(
            `批量预约成功！成功预约 ${successCount} 个车位，状态已更新。\n是否立即查看订单详情？`,
            '批量预约成功',
            {
              confirmButtonText: '查看订单',
              cancelButtonText: '继续预约',
              type: 'success'
            }
          )
          // 用户选择查看订单
          window.location.href = '/user/orders'
        } catch (error) {
          // 用户选择继续预约，留在当前页面
          console.log('用户选择继续预约')
        }
      } else {
        ElMessage.error('批量预约失败，请稍后重试')
      }
    } catch (error) {
      // 检查是否是用户取消
      if (error === 'cancel' || error === 'close') {
        ElMessage.info('已取消批量预约')
      } else {
        console.error('批量预约失败:', error)
        ElMessage.error('批量预约失败，请稍后重试')
      }
    }
    
  } catch (error) {
    console.error('批量预约失败:', error)
    ElMessage.error('批量预约失败，请稍后重试')
  }
}

// 快速预约功能
async function quickReserve(spot) {
  try {
    // 检查是否有默认车牌
    const defaultPlate = licensePlatesData.value.find(plate => plate.is_default)
    if (!defaultPlate) {
      ElMessage.warning('请先设置默认车牌')
      return
    }
    
    // 检查用户登录状态
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    if (!userInfo || !userInfo.id) {
      ElMessage.error('请先登录')
      return
    }
    
    // 设置默认时间范围（当前时间到2小时后）
    const now = new Date()
    const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2小时后
    
    // 显示确认对话框
    try {
      await ElMessageBox.confirm(
        `确定要快速预约 ${spot.spot_number} 车位吗？\n使用车牌：${defaultPlate.plate_number}\n时间：${now.toLocaleString()} - ${endTime.toLocaleString()}`,
        '快速预约确认',
        {
          confirmButtonText: '确认预约',
          cancelButtonText: '取消',
          type: 'info'
        }
      )
      
      // 用户确认，执行预约
      const result = await createOrder({
        user_id: userInfo.id,
        spot_id: spot.id,
        start_time: formatDateToMySQL(now),
        end_time: formatDateToMySQL(endTime),
        status: '未支付',
        amount: 0
      })
      
      if (result.success) {
        ElMessage.success('快速预约成功！车位已锁定')
        // 刷新车位列表
        await fetchSpots()
        
        // 显示成功提示，让用户选择是否立即跳转
        try {
          await ElMessageBox.confirm(
            '快速预约成功！车位状态已更新。\n是否立即查看订单详情？',
            '预约成功',
            {
              confirmButtonText: '查看订单',
              cancelButtonText: '继续预约',
              type: 'success'
            }
          )
          // 用户选择查看订单
          window.location.href = '/user/orders'
        } catch (error) {
          // 用户选择继续预约，留在当前页面
          console.log('用户选择继续预约')
        }
      } else {
        ElMessage.error(result.message || '快速预约失败')
      }
    } catch (error) {
      // 检查是否是用户取消
      if (error === 'cancel' || error === 'close') {
        ElMessage.info('已取消预约')
      } else {
        console.error('快速预约失败:', error)
        ElMessage.error('快速预约失败，请稍后重试')
      }
    }
    
  } catch (error) {
    console.error('快速预约失败:', error)
    ElMessage.error('快速预约失败，请稍后重试')
  }
}

// 跳转到车牌管理页面
function goToPlateManagement() {
  dialogVisible.value = false
  // 使用router跳转到车牌管理页面
  window.location.href = '/user/plates'
}
function resetForm() {
  form.value = { plate: '', phone: '', timeRange: [], spot: null }
  if (formRef.value) formRef.value.resetFields()
}
function formatDateToMySQL(dateStr) {
  const d = new Date(dateStr)
  const pad = n => n < 10 ? '0' + n : n
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
const handleReserve = () => {
  console.log('开始预约，表单数据:', form.value)
  
  formRef.value.validate(async (valid) => {
    console.log('表单验证结果:', valid)
    if (!valid) {
      console.log('表单验证失败')
      return
    }
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      if (!userInfo || !userInfo.id) {
        ElMessage.error('请先登录')
        return
      }
      
      console.log('用户信息:', userInfo)
      console.log('预约参数:', {
        user_id: userInfo.id,
        spot_id: form.value.spot.id,
        start_time: formatDateToMySQL(form.value.timeRange[0]),
        end_time: formatDateToMySQL(form.value.timeRange[1]),
        status: '未支付',
        amount: 0
      })
      
      const result = await createOrder({
        user_id: userInfo.id,
        spot_id: form.value.spot.id,
        start_time: formatDateToMySQL(form.value.timeRange[0]),
        end_time: formatDateToMySQL(form.value.timeRange[1]),
        status: '未支付',
        amount: 0
      })
      
      console.log('预约结果:', result)
      
      if (result.success) {
        ElMessage.success('预约成功，车位已锁定！')
        dialogVisible.value = false
        // 刷新车位列表
        await fetchSpots()
        
        // 显示成功提示，让用户选择是否立即跳转
        try {
          await ElMessageBox.confirm(
            '预约成功！车位状态已更新。\n是否立即查看订单详情？',
            '预约成功',
            {
              confirmButtonText: '查看订单',
              cancelButtonText: '继续预约',
              type: 'success'
            }
          )
          // 用户选择查看订单
          window.location.href = '/user/orders'
        } catch (error) {
          // 用户选择继续预约，留在当前页面
          console.log('用户选择继续预约')
        }
      } else {
        ElMessage.error(result.message || '预约失败')
      }
    } catch (e) {
      console.error('预约失败:', e)
      if (e.response && e.response.data) {
        ElMessage.error(e.response.data.message || '预约失败，请稍后重试')
      } else {
        ElMessage.error('预约失败，请检查网络连接')
      }
    }
  })
}
</script>
<style scoped>
.header-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.back-btn {
  margin-left: 0;
  font-size: 16px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  transform: translateX(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.reservation-view {
  max-width: 900px;
  margin: 40px auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px #0001;
  padding: 32px 24px 24px 24px;
}

.zone-select {
  transition: all 0.3s ease;
}

.zone-select:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.refresh-btn {
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  transform: scale(1.05);
}

.reserve-btn {
  transition: all 0.3s ease;
}

.reserve-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.quick-reserve-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.quick-reserve-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.batch-reserve-btn {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.batch-reserve-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

/* 统计卡片悬停效果 */
.stat-item {
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

/* 表格行悬停效果 */
tbody tr:hover {
  transform: scale(1.01);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stat-item {
    padding: 1rem;
  }
  
  .stat-icon {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
}

/* 预约对话框样式 */
.reserve-dialog {
  z-index: 2000;
}

.reserve-dialog .el-dialog {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.reserve-dialog .el-dialog__header {
  border-bottom: 1px solid #e5e7eb;
  padding: 20px 24px;
}

.reserve-dialog .el-dialog__body {
  padding: 24px;
}

.reserve-dialog .el-dialog__footer {
  border-top: 1px solid #e5e7eb;
  padding: 16px 24px;
}

/* 表单样式 */
.reserve-form .form-item-modern {
  margin-bottom: 20px;
}

.reserve-form .el-form-item__label {
  font-weight: 500;
  color: #374151;
}

.reserve-form .el-input,
.reserve-form .el-select,
.reserve-form .el-date-picker {
  width: 100%;
}

/* 确保下拉选择器正常工作 */
.reserve-form .el-select-dropdown {
  z-index: 3000 !important;
}

.reserve-form .el-select .el-input__wrapper {
  border-radius: 8px;
  border: 1px solid #d1d5db;
  transition: all 0.3s ease;
}

.reserve-form .el-select .el-input__wrapper:hover {
  border-color: #3b82f6;
}

.reserve-form .el-select .el-input__wrapper.is-focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* 按钮样式 */
.confirm-btn {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.confirm-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.confirm-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.cancel-btn {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 10px 24px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  border-color: #9ca3af;
  background: #f9fafb;
}
</style> 