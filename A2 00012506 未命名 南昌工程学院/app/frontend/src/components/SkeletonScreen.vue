<template>
  <div class="skeleton-container">
    <!-- 列表骨架屏 -->
    <div v-if="type === 'list'" class="skeleton-list">
      <div 
        v-for="i in count" 
        :key="i" 
        class="skeleton-item"
        :style="{ animationDelay: `${i * 0.1}s` }"
      >
        <div class="skeleton-avatar"></div>
        <div class="skeleton-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-text short"></div>
        </div>
      </div>
    </div>

    <!-- 卡片骨架屏 -->
    <div v-else-if="type === 'card'" class="skeleton-card">
      <div class="skeleton-card-header">
        <div class="skeleton-avatar large"></div>
        <div class="skeleton-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-text"></div>
        </div>
      </div>
      <div class="skeleton-card-body">
        <div class="skeleton-text"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text short"></div>
      </div>
      <div class="skeleton-card-footer">
        <div class="skeleton-button"></div>
        <div class="skeleton-button"></div>
      </div>
    </div>

    <!-- 表格骨架屏 -->
    <div v-else-if="type === 'table'" class="skeleton-table">
      <div class="skeleton-table-header">
        <div 
          v-for="i in columns" 
          :key="i" 
          class="skeleton-table-cell"
        ></div>
      </div>
      <div 
        v-for="row in rows" 
        :key="row" 
        class="skeleton-table-row"
        :style="{ animationDelay: `${row * 0.1}s` }"
      >
        <div 
          v-for="col in columns" 
          :key="col" 
          class="skeleton-table-cell"
        ></div>
      </div>
    </div>

    <!-- 表单骨架屏 -->
    <div v-else-if="type === 'form'" class="skeleton-form">
      <div 
        v-for="i in fields" 
        :key="i" 
        class="skeleton-form-field"
        :style="{ animationDelay: `${i * 0.1}s` }"
      >
        <div class="skeleton-label"></div>
        <div class="skeleton-input"></div>
      </div>
      <div class="skeleton-form-actions">
        <div class="skeleton-button primary"></div>
        <div class="skeleton-button"></div>
      </div>
    </div>

    <!-- 详情页骨架屏 -->
    <div v-else-if="type === 'detail'" class="skeleton-detail">
      <div class="skeleton-detail-header">
        <div class="skeleton-title large"></div>
        <div class="skeleton-subtitle"></div>
      </div>
      <div class="skeleton-detail-content">
        <div 
          v-for="i in 6" 
          :key="i" 
          class="skeleton-detail-item"
          :style="{ animationDelay: `${i * 0.1}s` }"
        >
          <div class="skeleton-label"></div>
          <div class="skeleton-text"></div>
        </div>
      </div>
    </div>

    <!-- 自定义骨架屏 -->
    <div v-else-if="type === 'custom'" class="skeleton-custom">
      <slot></slot>
    </div>

    <!-- 默认骨架屏 -->
    <div v-else class="skeleton-default">
      <div class="skeleton-loading">
        <div class="skeleton-spinner"></div>
        <div class="skeleton-text">加载中...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 骨架屏类型
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['list', 'card', 'table', 'form', 'detail', 'custom', 'default'].includes(value)
  },
  // 列表项数量
  count: {
    type: Number,
    default: 5
  },
  // 表格行数
  rows: {
    type: Number,
    default: 5
  },
  // 表格列数
  columns: {
    type: Number,
    default: 4
  },
  // 表单项数量
  fields: {
    type: Number,
    default: 4
  },
  // 是否显示
  show: {
    type: Boolean,
    default: true
  },
  // 自定义样式
  customStyle: {
    type: Object,
    default: () => ({})
  }
})

// 计算样式
const containerStyle = computed(() => ({
  ...props.customStyle
}))
</script>

<style scoped>
.skeleton-container {
  width: 100%;
  height: 100%;
}

/* 骨架屏动画 */
@keyframes skeleton-loading {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

/* 通用骨架屏样式 */
.skeleton-avatar,
.skeleton-title,
.skeleton-text,
.skeleton-button,
.skeleton-input,
.skeleton-label {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
}

/* 列表骨架屏 */
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-avatar.large {
  width: 60px;
  height: 60px;
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-title {
  height: 16px;
  width: 60%;
}

.skeleton-title.large {
  height: 24px;
  width: 80%;
}

.skeleton-text {
  height: 12px;
  width: 100%;
}

.skeleton-text.short {
  width: 40%;
}

/* 卡片骨架屏 */
.skeleton-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.skeleton-card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.skeleton-card-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-card-footer {
  display: flex;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #f0f0f0;
}

.skeleton-button {
  height: 36px;
  width: 80px;
  border-radius: 6px;
}

.skeleton-button.primary {
  width: 120px;
}

/* 表格骨架屏 */
.skeleton-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.skeleton-table-header {
  display: grid;
  grid-template-columns: repeat(v-bind(columns), 1fr);
  gap: 1px;
  background: #f0f0f0;
}

.skeleton-table-row {
  display: grid;
  grid-template-columns: repeat(v-bind(columns), 1fr);
  gap: 1px;
  background: #f0f0f0;
}

.skeleton-table-cell {
  height: 48px;
  background: white;
  padding: 12px;
}

.skeleton-table-header .skeleton-table-cell {
  background: #f8f9fa;
  font-weight: 600;
}

/* 表单骨架屏 */
.skeleton-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.skeleton-form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-label {
  height: 14px;
  width: 80px;
}

.skeleton-input {
  height: 40px;
  width: 100%;
  border-radius: 6px;
}

.skeleton-form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 详情页骨架屏 */
.skeleton-detail {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.skeleton-detail-header {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-subtitle {
  height: 14px;
  width: 40%;
}

.skeleton-detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.skeleton-detail-item:last-child {
  border-bottom: none;
}

.skeleton-detail-item .skeleton-label {
  width: 100px;
}

.skeleton-detail-item .skeleton-text {
  width: 200px;
}

/* 默认骨架屏 */
.skeleton-default {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.skeleton-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.skeleton-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f0f0f0;
  border-top: 3px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 自定义骨架屏 */
.skeleton-custom {
  width: 100%;
  height: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .skeleton-item {
    padding: 12px;
  }
  
  .skeleton-card-header,
  .skeleton-card-body,
  .skeleton-card-footer {
    padding: 16px;
  }
  
  .skeleton-form {
    padding: 16px;
  }
  
  .skeleton-detail {
    padding: 16px;
  }
  
  .skeleton-table-cell {
    padding: 8px;
    height: 40px;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .skeleton-avatar,
  .skeleton-title,
  .skeleton-text,
  .skeleton-button,
  .skeleton-input,
  .skeleton-label {
    background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
  }
  
  .skeleton-item,
  .skeleton-card,
  .skeleton-table,
  .skeleton-form,
  .skeleton-detail {
    background: #1a1a1a;
    color: #ffffff;
  }
  
  .skeleton-table-header .skeleton-table-cell {
    background: #2a2a2a;
  }
  
  .skeleton-table-cell {
    background: #1a1a1a;
  }
  
  .skeleton-detail-item {
    border-bottom-color: #2a2a2a;
  }
}
</style> 