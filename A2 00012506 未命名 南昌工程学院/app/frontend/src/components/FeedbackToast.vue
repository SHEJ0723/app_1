<template>
  <div class="feedback-toast-container">
    <!-- 网络状态提示 -->
    <div v-if="showNetworkStatus" class="feedback-toast network-status" :class="networkStatusClass">
      <div class="toast-icon">
        <i :class="networkStatusIcon"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title">{{ networkStatusTitle }}</div>
        <div class="toast-message">{{ networkStatusMessage }}</div>
      </div>
      <button class="toast-close" @click="hideNetworkStatus">
        <i class="fa fa-times"></i>
      </button>
    </div>

    <!-- 操作进度提示 -->
    <div v-if="showProgress" class="feedback-toast progress-toast">
      <div class="toast-icon">
        <div class="progress-spinner"></div>
      </div>
      <div class="toast-content">
        <div class="toast-title">{{ progressTitle }}</div>
        <div class="toast-message">{{ progressMessage }}</div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
        </div>
      </div>
    </div>

    <!-- 离线队列提示 -->
    <div v-if="showOfflineQueue" class="feedback-toast offline-queue">
      <div class="toast-icon">
        <i class="fa fa-database"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title">离线队列</div>
        <div class="toast-message">{{ offlineQueueCount }} 项待同步</div>
      </div>
      <button class="toast-action" @click="syncOfflineData">
        <i class="fa fa-sync"></i>
        同步
      </button>
    </div>

    <!-- 系统更新提示 -->
    <div v-if="showUpdateNotification" class="feedback-toast update-notification">
      <div class="toast-icon">
        <i class="fa fa-download"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title">系统更新</div>
        <div class="toast-message">发现新版本，建议立即更新</div>
      </div>
      <button class="toast-action" @click="refreshPage">
        <i class="fa fa-refresh"></i>
        更新
      </button>
    </div>

    <!-- 权限请求提示 -->
    <div v-if="showPermissionRequest" class="feedback-toast permission-request">
      <div class="toast-icon">
        <i class="fa fa-shield"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title">权限请求</div>
        <div class="toast-message">{{ permissionMessage }}</div>
      </div>
      <div class="toast-actions">
        <button class="toast-action secondary" @click="denyPermission">
          拒绝
        </button>
        <button class="toast-action primary" @click="grantPermission">
          授权
        </button>
      </div>
    </div>

    <!-- 数据同步提示 -->
    <div v-if="showDataSync" class="feedback-toast data-sync">
      <div class="toast-icon">
        <i class="fa fa-sync-alt" :class="{ 'fa-spin': syncInProgress }"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title">{{ syncTitle }}</div>
        <div class="toast-message">{{ syncMessage }}</div>
      </div>
      <button v-if="!syncInProgress" class="toast-action" @click="retrySync">
        <i class="fa fa-redo"></i>
        重试
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useOffline } from '@/utils/offlineManager'

const props = defineProps({
  // 是否显示网络状态
  showNetworkStatus: {
    type: Boolean,
    default: false
  },
  // 是否显示进度
  showProgress: {
    type: Boolean,
    default: false
  },
  // 是否显示离线队列
  showOfflineQueue: {
    type: Boolean,
    default: true
  },
  // 是否显示更新通知
  showUpdateNotification: {
    type: Boolean,
    default: false
  },
  // 是否显示权限请求
  showPermissionRequest: {
    type: Boolean,
    default: false
  },
  // 是否显示数据同步
  showDataSync: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'network-status-change',
  'progress-update',
  'offline-sync',
  'update-refresh',
  'permission-grant',
  'permission-deny',
  'sync-retry'
])

// 离线状态
const { isOnline, offlineQueueCount, syncInProgress, syncOfflineData } = useOffline()

// 网络状态
const networkStatusClass = computed(() => ({
  'online': isOnline.value,
  'offline': !isOnline.value
}))

const networkStatusIcon = computed(() => 
  isOnline.value ? 'fa fa-wifi' : 'fa fa-wifi-slash'
)

const networkStatusTitle = computed(() => 
  isOnline.value ? '网络已连接' : '网络已断开'
)

const networkStatusMessage = computed(() => 
  isOnline.value ? '网络连接正常' : '已切换到离线模式'
)

// 进度状态
const progressTitle = ref('处理中...')
const progressMessage = ref('请稍候')
const progressPercentage = ref(0)

// 权限状态
const permissionMessage = ref('需要获取相关权限以提供完整功能')

// 同步状态
const syncTitle = ref('数据同步')
const syncMessage = ref('正在同步数据...')

// 方法
const hideNetworkStatus = () => {
  emit('network-status-change', false)
}

const refreshPage = () => {
  window.location.reload()
}

const grantPermission = () => {
  emit('permission-grant')
}

const denyPermission = () => {
  emit('permission-deny')
}

const retrySync = () => {
  emit('sync-retry')
}

// 更新进度
const updateProgress = (title, message, percentage) => {
  progressTitle.value = title
  progressMessage.value = message
  progressPercentage.value = percentage
}

// 更新同步状态
const updateSyncStatus = (title, message, inProgress) => {
  syncTitle.value = title
  syncMessage.value = message
  syncInProgress.value = inProgress
}

// 暴露方法
defineExpose({
  updateProgress,
  updateSyncStatus
})
</script>

<style scoped>
.feedback-toast-container {
  position: fixed;
  top: 20px;
  right: 200px;
  z-index: 1000;
  display: flex;
  flex-direction: row;
  gap: 8px;
  max-width: 600px;
}

.feedback-toast {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-left: 3px solid #409eff;
  animation: slideIn 0.3s ease-out;
  max-width: 280px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  min-width: 200px;
}

.feedback-toast.network-status.online {
  border-left-color: #67c23a;
}

.feedback-toast.network-status.offline {
  border-left-color: #f56c6c;
}

.feedback-toast.progress-toast {
  border-left-color: #e6a23c;
}

.feedback-toast.offline-queue {
  border-left-color: #909399;
}

.feedback-toast.update-notification {
  border-left-color: #409eff;
}

.feedback-toast.permission-request {
  border-left-color: #f56c6c;
}

.feedback-toast.data-sync {
  border-left-color: #67c23a;
}

.toast-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
  font-size: 14px;
}

.feedback-toast.network-status.online .toast-icon {
  color: #67c23a;
}

.feedback-toast.network-status.offline .toast-icon {
  color: #f56c6c;
}

.feedback-toast.progress-toast .toast-icon {
  color: #e6a23c;
}

.feedback-toast.offline-queue .toast-icon {
  color: #909399;
}

.feedback-toast.update-notification .toast-icon {
  color: #409eff;
}

.feedback-toast.permission-request .toast-icon {
  color: #f56c6c;
}

.feedback-toast.data-sync .toast-icon {
  color: #67c23a;
}

.toast-content {
  flex: 1;
  min-width: 0;
  margin-right: 4px;
}

.toast-title {
  font-weight: 600;
  font-size: 13px;
  color: #000000;
  margin-bottom: 2px;
  text-shadow: none;
  opacity: 1;
}

.toast-message {
  font-size: 11px;
  color: #000000;
  line-height: 1.3;
  font-weight: 500;
  opacity: 1;
}

.toast-close {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border: none;
  background: none;
  color: #909399;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  transition: all 0.2s;
  font-size: 12px;
}

.toast-close:hover {
  background: #f5f7fa;
  color: #606266;
}

.toast-action {
  flex-shrink: 0;
  padding: 6px 12px;
  border: 1px solid #000000;
  background: #ffffff;
  color: #000000;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 3px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  opacity: 1;
}

.toast-action:hover {
  border-color: #409eff;
  color: #409eff;
}

.toast-action.primary {
  background: #409eff;
  border-color: #409eff;
  color: white;
}

.toast-action.primary:hover {
  background: #66b1ff;
  border-color: #66b1ff;
}

.toast-action.secondary {
  background: #f5f7fa;
  border-color: #dcdfe6;
  color: #606266;
}

.toast-action.secondary:hover {
  background: #e4e7ed;
  border-color: #c0c4cc;
}

.toast-actions {
  display: flex;
  gap: 8px;
}

.progress-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e6a23c;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  margin-top: 8px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #409eff;
  border-radius: 2px;
  transition: width 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .feedback-toast-container {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
  
  .feedback-toast {
    padding: 12px;
  }
  
  .toast-actions {
    flex-direction: column;
    gap: 4px;
  }
  
  .toast-action {
    width: 100%;
    justify-content: center;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .feedback-toast {
    background: #1a1a1a;
    color: #ffffff;
  }
  
  .toast-title {
    color: #ffffff;
  }
  
  .toast-message {
    color: #a0a0a0;
  }
  
  .toast-close:hover {
    background: #2a2a2a;
    color: #a0a0a0;
  }
  
  .toast-action {
    background: #2a2a2a;
    border-color: #404040;
    color: #a0a0a0;
  }
  
  .toast-action:hover {
    border-color: #409eff;
    color: #409eff;
  }
  
  .toast-action.primary {
    background: #409eff;
    border-color: #409eff;
    color: white;
  }
  
  .toast-action.secondary {
    background: #2a2a2a;
    border-color: #404040;
    color: #a0a0a0;
  }
  
  .progress-bar {
    background: #2a2a2a;
  }
}
</style> 