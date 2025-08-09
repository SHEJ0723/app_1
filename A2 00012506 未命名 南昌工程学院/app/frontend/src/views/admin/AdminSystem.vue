<template>
  <div class="admin-system-container">
    <el-card>
      <template #header>
        <h3>系统运维</h3>
      </template>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card>
            <h4>收费标准配置</h4>
            <el-form :model="fee" :rules="feeRules" ref="feeFormRef" label-width="120px">
              <el-form-item label="首小时" prop="first">
                <el-input v-model.number="fee.first" suffix="元" type="number" min="0" />
              </el-form-item>
              <el-form-item label="后续每小时" prop="next">
                <el-input v-model.number="fee.next" suffix="元" type="number" min="0" />
              </el-form-item>
              <el-form-item label="24小时封顶" prop="max">
                <el-input v-model.number="fee.max" suffix="元" type="number" min="0" />
              </el-form-item>
              <el-form-item>
                <CommonButton 
                  type="primary" 
                  size="medium" 
                  text="保存" 
                  :loading="feeLoading"
                  @click="saveFee"
                />
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <h4>告警规则设置</h4>
            <el-form :model="alarm" :rules="alarmRules" ref="alarmFormRef" label-width="120px">
              <el-form-item label="超时停车提醒(小时)" prop="timeout">
                <el-input v-model.number="alarm.timeout" suffix="小时" type="number" min="1" />
              </el-form-item>
              <el-form-item>
                <CommonButton 
                  type="primary" 
                  size="medium" 
                  text="保存" 
                  :loading="alarmLoading"
                  @click="saveAlarm"
                />
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
      <el-divider />
      <div class="log-section">
        <div class="log-header">
          <h4>操作日志审计</h4>
          <CommonButton 
            type="secondary" 
            size="small" 
            text="刷新" 
            @click="fetchLogs"
          />
        </div>
        <el-table :data="logs" style="width: 100%" v-loading="logsLoading">
          <el-table-column prop="time" label="时间" width="180" />
          <el-table-column prop="user" label="管理员" width="120" />
          <el-table-column prop="action" label="操作内容" />
          <el-table-column prop="details" label="详细信息" />
        </el-table>
        <div v-if="logs.length === 0 && !logsLoading" class="empty-logs">
          <el-icon><Document /></el-icon>
          <p>暂无操作日志</p>
        </div>
      </div>
    </el-card>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import CommonButton from '@/components/CommonButton.vue'
import api from '@/api/index'

// 响应式数据
const feeFormRef = ref(null)
const alarmFormRef = ref(null)
const feeLoading = ref(false)
const alarmLoading = ref(false)
const logsLoading = ref(false)

const fee = ref({ first: 5, next: 2, max: 30 })
const alarm = ref({ timeout: 72 })
const logs = ref([])
const logsTotal = ref(0)

// 表单验证规则
const feeRules = {
  first: [
    { required: true, message: '请输入首小时费用', trigger: 'blur' },
    { type: 'number', min: 0, message: '费用不能为负数', trigger: 'blur' }
  ],
  next: [
    { required: true, message: '请输入后续每小时费用', trigger: 'blur' },
    { type: 'number', min: 0, message: '费用不能为负数', trigger: 'blur' }
  ],
  max: [
    { required: true, message: '请输入24小时封顶费用', trigger: 'blur' },
    { type: 'number', min: 0, message: '费用不能为负数', trigger: 'blur' }
  ]
}

const alarmRules = {
  timeout: [
    { required: true, message: '请输入超时停车提醒时间', trigger: 'blur' },
    { type: 'number', min: 1, message: '时间必须大于0', trigger: 'blur' }
  ]
}

// 获取当前配置
const fetchConfig = async () => {
  try {
          const response = await api.get('/api/system/config')
    if (response.success && response.data) {
      fee.value = response.data.fee || { first: 5, next: 2, max: 30 }
      alarm.value = response.data.alarm || { timeout: 72 }
    }
  } catch (error) {
    console.error('获取配置失败:', error)
    // 使用默认配置
  }
}

// 保存收费标准
const saveFee = async () => {
  try {
    await feeFormRef.value.validate()
    feeLoading.value = true
    
          const response = await api.put('/api/system/fee-config', fee.value)
    
    if (response.success) {
      ElMessage.success('收费标准保存成功')
      await addLog('修改收费标准', `首小时: ${fee.value.first}元, 后续每小时: ${fee.value.next}元, 24小时封顶: ${fee.value.max}元`)
    } else {
      ElMessage.error(response.message || '保存失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('保存收费标准失败:', error)
      ElMessage.error('保存失败，请重试')
    }
  } finally {
    feeLoading.value = false
  }
}

// 保存告警规则
const saveAlarm = async () => {
  try {
    await alarmFormRef.value.validate()
    alarmLoading.value = true
    
          const response = await api.put('/api/system/alarm-config', alarm.value)
    
    if (response.success) {
      ElMessage.success('告警规则保存成功')
      await addLog('设置超时停车告警', `超时停车提醒时间: ${alarm.value.timeout}小时`)
    } else {
      ElMessage.error(response.message || '保存失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('保存告警规则失败:', error)
      ElMessage.error('保存失败，请重试')
    }
  } finally {
    alarmLoading.value = false
  }
}

// 获取操作日志
const fetchLogs = async () => {
  try {
    logsLoading.value = true
          const response = await api.get('/api/system/logs', {
      params: {
        page: 1,
        size: 50
      }
    })
    
    if (response.success) {
      logs.value = response.data || []
      logsTotal.value = response.total || 0
    } else {
      ElMessage.error(response.message || '获取日志失败')
    }
  } catch (error) {
    console.error('获取操作日志失败:', error)
    ElMessage.error('获取日志失败')
  } finally {
    logsLoading.value = false
  }
}

// 添加操作日志
const addLog = async (action, details = '') => {
  try {
    const logData = {
      action,
      details,
      timestamp: new Date().toISOString()
    }
    
          await api.post('/api/system/logs', logData)
    
    // 刷新日志列表
    await fetchLogs()
  } catch (error) {
    console.error('添加操作日志失败:', error)
  }
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN')
}

// 组件挂载时获取数据
onMounted(() => {
  fetchConfig()
  fetchLogs()
})
</script>
<style scoped>
.admin-system-container {
  max-width: 1100px;
  margin: 30px auto;
  padding: 20px;
}

.log-section {
  margin-top: 20px;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.log-header h4 {
  margin: 0;
  color: #303133;
}

.empty-logs {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #909399;
}

.empty-logs .el-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #c0c4cc;
}

.empty-logs p {
  margin: 0;
  font-size: 14px;
}

/* 表单样式优化 */
.el-form-item {
  margin-bottom: 20px;
}

.el-input {
  width: 100%;
}

/* 卡片样式 */
.el-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.el-card h4 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

/* 表格样式 */
.el-table {
  border-radius: 8px;
  overflow: hidden;
}

.el-table th {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-system-container {
    padding: 10px;
    margin: 10px;
  }
  
  .log-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .el-col {
    margin-bottom: 20px;
  }
}
</style> 