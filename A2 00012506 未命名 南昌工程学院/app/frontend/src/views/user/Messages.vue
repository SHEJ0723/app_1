<template>
  <div class="fade-in">
    <!-- 页面标题 -->
    <div class="mb-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-[clamp(1.25rem,3vw,1.75rem)] font-semibold">消息中心</h2>
          <p class="text-gray-500 mt-1">查看和管理您的系统消息</p>
        </div>
        <div class="flex gap-3">
          <el-button type="primary" size="small" @click="markAllRead" v-if="unreadCount > 0">
            <i class="fa fa-check-double mr-1"></i> 全部标为已读
          </el-button>
          <el-button type="danger" size="small" @click="clearAll">
            <i class="fa fa-trash mr-1"></i> 清空
          </el-button>
        </div>
      </div>
    </div>

    <!-- 消息统计 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div class="stat-card">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">总消息</p>
            <h3 class="text-2xl font-semibold mt-1">{{ messages.length }}</h3>
          </div>
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <i class="fa fa-envelope"></i>
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">未读消息</p>
            <h3 class="text-2xl font-semibold mt-1">{{ unreadCount }}</h3>
          </div>
          <div class="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center text-danger">
            <i class="fa fa-bell"></i>
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">已读消息</p>
            <h3 class="text-2xl font-semibold mt-1">{{ readCount }}</h3>
          </div>
          <div class="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
            <i class="fa fa-check-circle"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选和操作栏 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-4">
          <el-checkbox v-model="showOnlyUnread" class="filter-checkbox">
            只看未读消息
          </el-checkbox>
          <el-button 
            type="primary" 
            size="small" 
            :disabled="!selectedRowKeys.length" 
            @click="markBatchRead"
            class="batch-btn"
          >
            <i class="fa fa-check mr-1"></i> 批量标为已读
          </el-button>
        </div>
        <div class="text-sm text-gray-500">
          已选择 {{ selectedRowKeys.length }} 条消息
        </div>
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div class="flex justify-between items-center mb-6">
        <h3 class="font-medium text-lg">消息列表</h3>
        <el-button type="primary" size="small" @click="fetchMessages">
          <i class="fa fa-refresh mr-1"></i> 刷新
        </el-button>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">
                <el-checkbox 
                  v-model="selectAll" 
                  @change="handleSelectAll"
                  :indeterminate="isIndeterminate"
                />
              </th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">内容</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">时间</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="message in filteredMessages" :key="message.id" class="border-b border-gray-50 hover:bg-gray-50">
              <td class="py-3 px-4">
                <el-checkbox 
                  v-model="message.selected" 
                  @change="handleSelectionChange"
                />
              </td>
              <td class="py-3 px-4">
                <span :class="getStatusClass(message.is_read)" class="px-2 py-1 rounded-full text-xs">
                  {{ message.is_read ? '已读' : '未读' }}
                </span>
              </td>
              <td class="py-3 px-4">
                <el-button 
                  type="primary" 
                  link 
                  @click="showDetail(message)"
                  class="view-btn"
                >
                  <i class="fa fa-eye mr-1"></i> 查看内容
                </el-button>
              </td>
              <td class="py-3 px-4 text-sm text-gray-600">{{ message.created_at }}</td>
              <td class="py-3 px-4">
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="handleDelete(message.id)"
                  class="delete-btn"
                >
                  <i class="fa fa-trash mr-1"></i> 删除
                </el-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 空状态 -->
      <div v-if="filteredMessages.length === 0" class="text-center py-12">
        <i class="fa fa-inbox text-4xl text-gray-300 mb-4"></i>
        <p class="text-gray-500">{{ showOnlyUnread ? '暂无未读消息' : '暂无消息' }}</p>
      </div>
    </div>

    <!-- 消息详情对话框 -->
    <el-dialog v-model="detailDialog" title="消息详情" width="600px" class="message-dialog">
      <div class="message-content">
        <div class="message-header">
          <div class="message-meta">
            <span class="message-time">{{ detailMessage.created_at }}</span>
            <span :class="getStatusClass(detailMessage.is_read)" class="message-status">
              {{ detailMessage.is_read ? '已读' : '未读' }}
            </span>
          </div>
        </div>
        <div class="message-body">
          {{ detailContent }}
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api/index'
import { ElMessage } from 'element-plus'

const messages = ref([])
const detailDialog = ref(false)
const detailContent = ref('')
const detailMessage = ref({})
const showOnlyUnread = ref(false)
const selectedRowKeys = ref([])
const selectAll = ref(false)

// 计算属性
const filteredMessages = computed(() => {
  return showOnlyUnread.value ? messages.value.filter(m => !m.is_read) : messages.value
})

const unreadCount = computed(() => messages.value.filter(m => !m.is_read).length)
const readCount = computed(() => messages.value.filter(m => m.is_read).length)

const isIndeterminate = computed(() => {
  const selectedCount = selectedRowKeys.value.length
  return selectedCount > 0 && selectedCount < filteredMessages.value.length
})

const getStatusClass = (isRead) => {
  return isRead ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
}

// 方法
const fetchMessages = async () => {
  try {
    const res = await api.get('/api/messages')
    messages.value = (res.data || []).map(msg => ({ ...msg, selected: false }))
  } catch (error) {
    ElMessage.error('获取消息失败')
  }
}

const handleDelete = async (id) => {
  try {
          await api.delete(`/api/messages/${id}`)
    ElMessage.success('删除成功')
    fetchMessages()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const showDetail = async (message) => {
  detailContent.value = message.content
  detailMessage.value = message
  detailDialog.value = true
  
  if (!message.is_read) {
    try {
      await api.put(`/api/messages/${message.id}/read`)
      message.is_read = true
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }
}

const handleSelectionChange = () => {
  selectedRowKeys.value = messages.value.filter(m => m.selected).map(m => m.id)
  updateSelectAll()
}

const handleSelectAll = (val) => {
  filteredMessages.value.forEach(message => {
    message.selected = val
  })
  selectedRowKeys.value = val ? filteredMessages.value.map(m => m.id) : []
}

const updateSelectAll = () => {
  const selectedCount = selectedRowKeys.value.length
  const totalCount = filteredMessages.value.length
  selectAll.value = selectedCount === totalCount && totalCount > 0
}

const markBatchRead = async () => {
  try {
    for (const id of selectedRowKeys.value) {
      const msg = messages.value.find(m => m.id === id)
      if (msg && !msg.is_read) {
        await api.put(`/api/messages/${id}/read`)
        msg.is_read = true
      }
    }
    ElMessage.success('批量标记为已读成功')
    selectedRowKeys.value = []
    messages.value.forEach(m => m.selected = false)
    selectAll.value = false
  } catch (error) {
    ElMessage.error('批量标记失败')
  }
}

const markAllRead = async () => {
  try {
    for (const msg of messages.value) {
      if (!msg.is_read) {
        await api.put(`/api/messages/${msg.id}/read`)
        msg.is_read = true
      }
    }
    ElMessage.success('全部标记为已读成功')
  } catch (error) {
    ElMessage.error('标记失败')
  }
}

const clearAll = async () => {
  try {
          await api.delete('/api/messages/clear-all')
    messages.value = []
    ElMessage.success('清空成功')
  } catch (error) {
    ElMessage.error('清空失败')
  }
}

onMounted(fetchMessages)
</script>

<style scoped>
.filter-checkbox {
  font-weight: 500;
}

.batch-btn {
  border-radius: 6px;
  font-weight: 500;
}

.view-btn {
  font-weight: 500;
}

.delete-btn {
  border-radius: 6px;
  font-weight: 500;
}

.message-dialog :deep(.el-dialog) {
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.message-content {
  padding: 20px 0;
}

.message-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.message-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.message-time {
  font-size: 14px;
  color: #6b7280;
}

.message-status {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.message-body {
  font-size: 16px;
  line-height: 1.6;
  color: #374151;
  white-space: pre-wrap;
  word-break: break-word;
}
</style> 