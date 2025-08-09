<template>
  <button
    :class="[
      'common-button',
      `common-button--${type}`,
      `common-button--${size}`,
      { 'common-button--loading': loading, 'common-button--disabled': disabled }
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="loading-spinner"></span>
    <slot>{{ text }}</slot>
  </button>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  // 按钮类型：primary, secondary, danger, success, text
  type: {
    type: String,
    default: 'primary'
  },
  // 按钮大小：small, medium, large
  size: {
    type: String,
    default: 'medium'
  },
  // 按钮文本
  text: {
    type: String,
    default: ''
  },
  // 是否加载中
  loading: {
    type: Boolean,
    default: false
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.common-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #409eff;
  background: #ffffff;
  color: #409eff;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
  text-decoration: none;
  font-family: inherit;
  line-height: 1;
  white-space: nowrap;
  user-select: none;
}

/* 按钮大小 */
.common-button--small {
  padding: 6px 12px;
  font-size: 12px;
  min-height: 28px;
}

.common-button--medium {
  padding: 8px 16px;
  font-size: 14px;
  min-height: 36px;
}

.common-button--large {
  padding: 12px 24px;
  font-size: 16px;
  min-height: 44px;
}

/* 按钮类型 */
.common-button--primary {
  border-color: #409eff;
  background: #ffffff;
  color: #409eff;
}

.common-button--primary:hover:not(:disabled) {
  background: #409eff;
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.common-button--secondary {
  border-color: #909399;
  background: #ffffff;
  color: #909399;
}

.common-button--secondary:hover:not(:disabled) {
  background: #909399;
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(144, 147, 153, 0.3);
}

.common-button--success {
  border-color: #67c23a;
  background: #ffffff;
  color: #67c23a;
}

.common-button--success:hover:not(:disabled) {
  background: #67c23a;
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
}

.common-button--danger {
  border-color: #f56c6c;
  background: #ffffff;
  color: #f56c6c;
}

.common-button--danger:hover:not(:disabled) {
  background: #f56c6c;
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
}

/* 文本按钮样式 */
.common-button--text {
  border-color: transparent;
  background: transparent;
  color: #409eff;
  padding: 0;
  border: none;
}

.common-button--text:hover:not(:disabled) {
  background: transparent;
  color: #66b1ff;
  transform: none;
  box-shadow: none;
}

.common-button--text:active:not(:disabled) {
  transform: none;
  box-shadow: none;
}

/* 禁用状态 */
.common-button--disabled,
.common-button:disabled {
  border-color: #dcdfe6;
  background: #f5f7fa;
  color: #c0c4cc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.common-button--disabled:hover,
.common-button:disabled:hover {
  border-color: #dcdfe6;
  background: #f5f7fa;
  color: #c0c4cc;
  transform: none;
  box-shadow: none;
}

/* 加载状态 */
.common-button--loading {
  cursor: wait;
}

.loading-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 6px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .common-button--large {
    padding: 10px 20px;
    font-size: 15px;
    min-height: 40px;
  }
  
  .common-button--medium {
    padding: 7px 14px;
    font-size: 13px;
    min-height: 32px;
  }
  
  .common-button--small {
    padding: 5px 10px;
    font-size: 11px;
    min-height: 26px;
  }
}

/* 焦点状态 */
.common-button:focus {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 激活状态 */
.common-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.2);
}
</style> 