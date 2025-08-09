<template>
  <div class="app-gradient-bg"></div>
  <div id="app-content">
    <router-view />
    <GlobalLoading />
    <FeedbackToast 
      :show-network-status="true"
      :show-offline-queue="true"
      :show-update-notification="showUpdateNotification"
      @network-status-change="handleNetworkStatusChange"
      @offline-sync="handleOfflineSync"
      @update-refresh="handleUpdateRefresh"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import GlobalLoading from '@/components/GlobalLoading.vue'
import FeedbackToast from '@/components/FeedbackToast.vue'
import { useOffline } from '@/utils/offlineManager'
import { interactionFeedback } from '@/utils/interactionFeedback'

// 离线状态管理
const { isOnline, offlineQueueCount, syncOfflineData } = useOffline()

// 更新通知状态
const showUpdateNotification = ref(false)

// 处理网络状态变化
const handleNetworkStatusChange = (show) => {
  if (show && !isOnline.value) {
    interactionFeedback.warning('网络连接已断开，部分功能可能受限')
  }
}

// 处理离线同步
const handleOfflineSync = async () => {
  try {
    await syncOfflineData()
    interactionFeedback.success('离线数据同步完成')
  } catch (error) {
    interactionFeedback.error('离线数据同步失败')
  }
}

// 处理更新刷新
const handleUpdateRefresh = () => {
  window.location.reload()
}

// 检查系统更新
const checkForUpdates = () => {
  // 这里可以添加检查更新的逻辑
  // 例如检查Service Worker是否有更新
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.addEventListener('updatefound', () => {
          showUpdateNotification.value = true
        })
      })
    })
  }
}

onMounted(() => {
  checkForUpdates()
})
</script>

<style>
.app-gradient-bg {
  position: fixed;
  top: 0; left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  background: linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 50%, #d4a1fd 100%);
  pointer-events: none;
}
#app-content {
  position: relative;
  z-index: 1;
  min-height: 100vh;
}
#app {
  font-family: Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style> 