<template>
  <div class="message-quick-view">
    <!-- 消息通知按钮 -->
    <div class="message-notification">
      <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="message-badge">
        <CommonButton 
          type="primary" 
          size="medium" 
          @click="toggleMessagePanel" 
          class="message-btn"
        >
          <el-icon><Bell /></el-icon>
          <span class="btn-text">消息</span>
        </CommonButton>
      </el-badge>
    </div>

    <!-- 消息面板 -->
    <el-drawer
      v-model="messagePanelVisible"
      title="消息中心"
      direction="rtl"
      size="400px"
      :with-header="true"
    >
      <div class="message-panel">
        <!-- 消息操作栏 -->
        <div class="message-actions">
          <CommonButton 
            type="secondary" 
            size="small" 
            text="全部标为已读" 
            @click="markAllRead"
            :disabled="unreadCount === 0"
          />
          <CommonButton 
            type="danger" 
            size="small" 
            text="清空" 
            @click="clearAllMessages"
            :disabled="messages.length === 0"
          />
        </div>

        <!-- 消息列表 -->
        <div class="message-list">
          <div v-if="messages.length === 0" class="empty-message">
            <el-icon><Message /></el-icon>
            <p>暂无消息</p>
          </div>
          
          <div 
            v-for="message in messages" 
            :key="message.id"
            class="message-item"
            :class="{ 'unread': !message.is_read }"
            @click="viewMessage(message)"
          >
            <div class="message-header">
              <span class="message-status">
                <i v-if="!message.is_read" class="fa fa-circle unread-dot"></i>
                <span v-else class="read-dot"></span>
              </span>
              <span class="message-time">{{ formatTime(message.created_at) }}</span>
            </div>
            <div class="message-content">
              {{ message.content }}
            </div>
            <div class="message-actions-item">
                             <CommonButton 
                 type="secondary" 
                 size="small" 
                 text="查看详情" 
                 @click.stop="viewMessageDetail(message)"
               />
              <CommonButton 
                type="danger" 
                size="small" 
                text="删除" 
                @click.stop="deleteMessage(message.id)"
              />
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="messages.length > 0" class="message-pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50]"
            :total="totalMessages"
            layout="total, sizes, prev, pager, next"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-drawer>

    <!-- 消息详情对话框 -->
    <el-dialog
      v-model="messageDetailVisible"
      title="消息详情"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="message-detail">
        <div class="detail-header">
          <span class="detail-time">{{ formatTime(selectedMessage?.created_at) }}</span>
          <span class="detail-status" :class="{ 'unread': !selectedMessage?.is_read }">
            {{ selectedMessage?.is_read ? '已读' : '未读' }}
          </span>
        </div>
        <div class="detail-content">
          {{ selectedMessage?.content }}
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <CommonButton 
            type="secondary" 
            size="medium" 
            text="关闭" 
            @click="messageDetailVisible = false"
          />
          <CommonButton 
            v-if="!selectedMessage?.is_read"
            type="primary" 
            size="medium" 
            text="标为已读" 
            @click="markAsRead(selectedMessage?.id)"
          />
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Bell, Message } from '@element-plus/icons-vue'
import CommonButton from './CommonButton.vue'
import api from '@/api/index'

// 响应式数据
const messagePanelVisible = ref(false)
const messageDetailVisible = ref(false)
const messages = ref([])
const selectedMessage = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)
const totalMessages = ref(0)
const loading = ref(false)

// 计算属性
const unreadCount = computed(() => {
  return messages.value.filter(msg => !msg.is_read).length
})

// 获取消息列表
const fetchMessages = async () => {
  try {
    loading.value = true
          const response = await api.get('/api/messages', {
      params: {
        page: currentPage.value,
        size: pageSize.value
      }
    })
    messages.value = response.data || []
    totalMessages.value = response.total || messages.value.length
  } catch (error) {
    console.error('获取消息失败:', error)
    ElMessage.error('获取消息失败')
  } finally {
    loading.value = false
  }
}

// 切换消息面板
const toggleMessagePanel = () => {
  messagePanelVisible.value = !messagePanelVisible.value
  if (messagePanelVisible.value) {
    fetchMessages()
  }
}

// 查看消息
const viewMessage = (message) => {
  selectedMessage.value = message
  messageDetailVisible.value = true
  
  // 如果消息未读，标记为已读
  if (!message.is_read) {
    markAsRead(message.id)
  }
}

// 查看消息详情
const viewMessageDetail = (message) => {
  selectedMessage.value = message
  messageDetailVisible.value = true
}

// 标记消息为已读
const markAsRead = async (messageId) => {
  try {
    await api.put(`/messages/${messageId}/read`)
    const message = messages.value.find(m => m.id === messageId)
    if (message) {
      message.is_read = true
    }
    if (selectedMessage.value?.id === messageId) {
      selectedMessage.value.is_read = true
    }
    ElMessage.success('已标记为已读')
  } catch (error) {
    console.error('标记已读失败:', error)
    ElMessage.error('标记已读失败')
  }
}

// 全部标记为已读
const markAllRead = async () => {
  try {
    await ElMessageBox.confirm('确定要将所有消息标记为已读吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    for (const message of messages.value) {
      if (!message.is_read) {
        await api.put(`/messages/${message.id}/read`)
        message.is_read = true
      }
    }
    
    ElMessage.success('全部标记为已读')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('标记已读失败:', error)
      ElMessage.error('标记已读失败')
    }
  }
}

// 删除消息
const deleteMessage = async (messageId) => {
  try {
    await ElMessageBox.confirm('确定要删除这条消息吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await api.delete(`/messages/${messageId}`)
    messages.value = messages.value.filter(m => m.id !== messageId)
    
    if (selectedMessage.value?.id === messageId) {
      messageDetailVisible.value = false
      selectedMessage.value = null
    }
    
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除消息失败:', error)
      ElMessage.error('删除消息失败')
    }
  }
}

// 清空所有消息
const clearAllMessages = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有消息吗？此操作不可恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
          await api.delete('/api/messages/clear-all')
    messages.value = []
    messageDetailVisible.value = false
    selectedMessage.value = null
    
    ElMessage.success('清空成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清空消息失败:', error)
      ElMessage.error('清空消息失败')
    }
  }
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchMessages()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchMessages()
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) { // 1天内
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return date.toLocaleDateString()
  }
}

// 监听面板显示状态
watch(messagePanelVisible, (visible) => {
  if (visible) {
    fetchMessages()
  }
})

// 组件挂载时获取消息数量
onMounted(() => {
  fetchMessages()
})
</script>

<style scoped>
.message-quick-view {
  position: relative;
}

.message-notification {
  display: flex;
  align-items: center;
}

.message-badge {
  margin-right: 16px;
}

.message-btn {
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-text {
  margin-left: 4px;
}

.message-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.message-actions {
  display: flex;
  gap: 8px;
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.empty-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #909399;
}

.empty-message .el-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.message-item {
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.message-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.message-item.unread {
  background-color: #f0f9ff;
  border-color: #409eff;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.message-status {
  display: flex;
  align-items: center;
}

.unread-dot {
  color: #f56c6c;
  font-size: 12px;
}

.read-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #c0c4cc;
}

.message-time {
  font-size: 12px;
  color: #909399;
}

.message-content {
  font-size: 14px;
  line-height: 1.5;
  color: #303133;
  margin-bottom: 8px;
  word-break: break-word;
}

.message-actions-item {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.message-pagination {
  padding: 16px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: center;
}

.message-detail {
  padding: 16px 0;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.detail-time {
  font-size: 14px;
  color: #909399;
}

.detail-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  background-color: #f0f9ff;
  color: #409eff;
}

.detail-status.unread {
  background-color: #fef0f0;
  color: #f56c6c;
}

.detail-content {
  font-size: 14px;
  line-height: 1.6;
  color: #303133;
  white-space: pre-wrap;
  word-break: break-word;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .message-actions {
    flex-direction: column;
  }
  
  .message-actions-item {
    flex-direction: column;
  }
  
  .detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style> 