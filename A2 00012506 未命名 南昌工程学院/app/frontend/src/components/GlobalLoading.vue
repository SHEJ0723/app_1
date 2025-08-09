<template>
  <div v-if="globalLoading" class="global-loading-overlay">
    <div class="global-loading-content">
      <div class="loading-spinner">
        <div class="spinner"></div>
      </div>
      <div class="loading-text">加载中...</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { loadingManager } from '@/utils/loadingManager'

const globalLoading = computed(() => loadingManager.getGlobalLoading().value)
</script>

<style scoped>
.global-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.global-loading-content {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-spinner {
  position: relative;
  width: 48px;
  height: 48px;
}

.spinner {
  width: 100%;
  height: 100%;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 16px;
  color: #606266;
  font-weight: 500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .global-loading-content {
    padding: 24px;
  }
  
  .loading-spinner {
    width: 40px;
    height: 40px;
  }
  
  .loading-text {
    font-size: 14px;
  }
}
</style> 