/**
 * 交互反馈工具
 */

import { ElMessage, ElNotification, ElMessageBox } from 'element-plus'

/**
 * 交互反馈管理器
 */
export class InteractionFeedback {
  constructor() {
    this.notificationQueue = []
    this.isProcessingQueue = false
  }

  /**
   * 成功反馈
   * @param {string} message - 消息内容
   * @param {Object} options - 选项
   */
  success(message, options = {}) {
    const defaultOptions = {
      duration: 3000,
      showClose: true,
      type: 'success'
    }
    
    ElMessage({
      message,
      ...defaultOptions,
      ...options
    })
  }

  /**
   * 错误反馈
   * @param {string} message - 消息内容
   * @param {Object} options - 选项
   */
  error(message, options = {}) {
    const defaultOptions = {
      duration: 5000,
      showClose: true,
      type: 'error'
    }
    
    ElMessage({
      message,
      ...defaultOptions,
      ...options
    })
  }

  /**
   * 警告反馈
   * @param {string} message - 消息内容
   * @param {Object} options - 选项
   */
  warning(message, options = {}) {
    const defaultOptions = {
      duration: 4000,
      showClose: true,
      type: 'warning'
    }
    
    ElMessage({
      message,
      ...defaultOptions,
      ...options
    })
  }

  /**
   * 信息反馈
   * @param {string} message - 消息内容
   * @param {Object} options - 选项
   */
  info(message, options = {}) {
    const defaultOptions = {
      duration: 3000,
      showClose: true,
      type: 'info'
    }
    
    ElMessage({
      message,
      ...defaultOptions,
      ...options
    })
  }

  /**
   * 通知反馈
   * @param {string} title - 标题
   * @param {string} message - 消息内容
   * @param {Object} options - 选项
   */
  notify(title, message, options = {}) {
    const defaultOptions = {
      type: 'info',
      duration: 4500,
      position: 'top-right',
      showClose: true
    }
    
    ElNotification({
      title,
      message,
      ...defaultOptions,
      ...options
    })
  }

  /**
   * 成功通知
   * @param {string} title - 标题
   * @param {string} message - 消息内容
   * @param {Object} options - 选项
   */
  notifySuccess(title, message, options = {}) {
    this.notify(title, message, { type: 'success', ...options })
  }

  /**
   * 错误通知
   * @param {string} title - 标题
   * @param {string} message - 消息内容
   * @param {Object} options - 选项
   */
  notifyError(title, message, options = {}) {
    this.notify(title, message, { type: 'error', ...options })
  }

  /**
   * 警告通知
   * @param {string} title - 标题
   * @param {string} message - 消息内容
   * @param {Object} options - 选项
   */
  notifyWarning(title, message, options = {}) {
    this.notify(title, message, { type: 'warning', ...options })
  }

  /**
   * 操作确认
   * @param {string} message - 确认消息
   * @param {string} title - 标题
   * @param {Object} options - 选项
   * @returns {Promise} 确认结果
   */
  async confirm(message, title = '确认操作', options = {}) {
    const defaultOptions = {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
    
    try {
      await ElMessageBox.confirm(message, title, { ...defaultOptions, ...options })
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * 危险操作确认
   * @param {string} message - 确认消息
   * @param {string} title - 标题
   * @param {Object} options - 选项
   * @returns {Promise} 确认结果
   */
  async confirmDanger(message, title = '危险操作', options = {}) {
    return this.confirm(message, title, { type: 'error', ...options })
  }

  /**
   * 输入确认
   * @param {string} message - 提示消息
   * @param {string} title - 标题
   * @param {Object} options - 选项
   * @returns {Promise} 输入结果
   */
  async prompt(message, title = '请输入', options = {}) {
    const defaultOptions = {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /.*/,
      inputErrorMessage: '输入格式不正确'
    }
    
    try {
      const result = await ElMessageBox.prompt(message, title, { ...defaultOptions, ...options })
      return result.value
    } catch (error) {
      return null
    }
  }

  /**
   * 加载反馈
   * @param {string} message - 加载消息
   * @param {Object} options - 选项
   * @returns {Function} 关闭加载的函数
   */
  loading(message = '加载中...', options = {}) {
    const defaultOptions = {
      lock: true,
      text: message,
      background: 'rgba(0, 0, 0, 0.7)'
    }
    
    const loadingInstance = ElLoading.service({ ...defaultOptions, ...options })
    
    return () => {
      loadingInstance.close()
    }
  }

  /**
   * 进度反馈
   * @param {number} percentage - 进度百分比
   * @param {string} status - 状态文本
   * @param {Object} options - 选项
   */
  progress(percentage, status = '', options = {}) {
    const defaultOptions = {
      strokeWidth: 6,
      textInside: true,
      status: percentage === 100 ? 'success' : ''
    }
    
    // 这里可以集成进度条组件
    console.log(`Progress: ${percentage}% - ${status}`)
  }

  /**
   * 震动反馈
   * @param {number} duration - 震动时长（毫秒）
   */
  vibrate(duration = 100) {
    if ('vibrate' in navigator) {
      navigator.vibrate(duration)
    }
  }

  /**
   * 声音反馈
   * @param {string} type - 声音类型
   */
  playSound(type = 'notification') {
    const sounds = {
      notification: '/sounds/notification.mp3',
      success: '/sounds/success.mp3',
      error: '/sounds/error.mp3',
      warning: '/sounds/warning.mp3'
    }
    
    const audio = new Audio(sounds[type])
    audio.play().catch(error => {
      console.warn('Failed to play sound:', error)
    })
  }

  /**
   * 复制到剪贴板反馈
   * @param {string} text - 要复制的文本
   * @param {string} successMessage - 成功消息
   */
  async copyToClipboard(text, successMessage = '已复制到剪贴板') {
    try {
      await navigator.clipboard.writeText(text)
      this.success(successMessage)
      this.vibrate(50)
    } catch (error) {
      this.error('复制失败，请手动复制')
    }
  }

  /**
   * 表单验证反馈
   * @param {Object} errors - 验证错误
   */
  formValidation(errors) {
    if (Object.keys(errors).length > 0) {
      this.warning('请检查表单输入')
      this.vibrate(200)
    }
  }

  /**
   * 网络状态反馈
   * @param {boolean} isOnline - 是否在线
   */
  networkStatus(isOnline) {
    if (isOnline) {
      this.notifySuccess('网络连接', '网络已恢复连接')
    } else {
      this.notifyWarning('网络断开', '网络连接已断开，部分功能可能受限')
    }
  }

  /**
   * 数据同步反馈
   * @param {string} status - 同步状态
   * @param {number} count - 同步数量
   */
  dataSync(status, count = 0) {
    switch (status) {
      case 'start':
        this.info(`开始同步 ${count} 条数据`)
        break
      case 'progress':
        this.progress(count, `已同步 ${count} 条数据`)
        break
      case 'success':
        this.success(`成功同步 ${count} 条数据`)
        break
      case 'error':
        this.error(`同步失败，请重试`)
        break
    }
  }

  /**
   * 操作结果反馈
   * @param {boolean} success - 是否成功
   * @param {string} message - 消息内容
   * @param {Object} options - 选项
   */
  operationResult(success, message, options = {}) {
    if (success) {
      this.success(message, options)
      this.vibrate(100)
    } else {
      this.error(message, options)
      this.vibrate(300)
    }
  }

  /**
   * 批量操作反馈
   * @param {string} action - 操作类型
   * @param {number} total - 总数
   * @param {number} success - 成功数
   * @param {number} failed - 失败数
   */
  batchOperation(action, total, success, failed) {
    if (failed === 0) {
      this.success(`${action}完成，共处理 ${total} 项`)
    } else if (success === 0) {
      this.error(`${action}失败，共 ${total} 项`)
    } else {
      this.warning(`${action}部分完成，成功 ${success} 项，失败 ${failed} 项`)
    }
  }

  /**
   * 文件操作反馈
   * @param {string} action - 操作类型
   * @param {string} fileName - 文件名
   * @param {boolean} success - 是否成功
   */
  fileOperation(action, fileName, success) {
    const message = `${action}${success ? '成功' : '失败'}: ${fileName}`
    this.operationResult(success, message)
  }

  /**
   * 权限反馈
   * @param {string} permission - 权限名称
   * @param {boolean} granted - 是否授权
   */
  permission(permission, granted) {
    if (granted) {
      this.success(`${permission}权限已授权`)
    } else {
      this.warning(`${permission}权限被拒绝，部分功能可能无法使用`)
    }
  }

  /**
   * 系统更新反馈
   * @param {string} version - 版本号
   * @param {boolean} available - 是否可用
   */
  systemUpdate(version, available) {
    if (available) {
      this.notifyInfo('系统更新', `发现新版本 ${version}，建议立即更新`)
    } else {
      this.info('当前已是最新版本')
    }
  }

  /**
   * 添加通知到队列
   * @param {Object} notification - 通知对象
   */
  addToQueue(notification) {
    this.notificationQueue.push(notification)
    this.processQueue()
  }

  /**
   * 处理通知队列
   */
  async processQueue() {
    if (this.isProcessingQueue || this.notificationQueue.length === 0) return

    this.isProcessingQueue = true
    
    while (this.notificationQueue.length > 0) {
      const notification = this.notificationQueue.shift()
      
      try {
        await this.showNotification(notification)
        await this.delay(1000) // 延迟1秒显示下一个通知
      } catch (error) {
        console.error('Failed to show notification:', error)
      }
    }
    
    this.isProcessingQueue = false
  }

  /**
   * 显示通知
   * @param {Object} notification - 通知对象
   */
  async showNotification(notification) {
    const { type, title, message, options } = notification
    
    switch (type) {
      case 'success':
        this.success(message, options)
        break
      case 'error':
        this.error(message, options)
        break
      case 'warning':
        this.warning(message, options)
        break
      case 'info':
        this.info(message, options)
        break
      case 'notify':
        this.notify(title, message, options)
        break
    }
  }

  /**
   * 延迟函数
   * @param {number} ms - 延迟毫秒数
   * @returns {Promise} 延迟Promise
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// 创建全局交互反馈实例
export const interactionFeedback = new InteractionFeedback()

/**
 * 组合式函数：交互反馈
 * @returns {Object} 交互反馈方法
 */
export function useInteractionFeedback() {
  return {
    success: interactionFeedback.success.bind(interactionFeedback),
    error: interactionFeedback.error.bind(interactionFeedback),
    warning: interactionFeedback.warning.bind(interactionFeedback),
    info: interactionFeedback.info.bind(interactionFeedback),
    notify: interactionFeedback.notify.bind(interactionFeedback),
    confirm: interactionFeedback.confirm.bind(interactionFeedback),
    loading: interactionFeedback.loading.bind(interactionFeedback),
    vibrate: interactionFeedback.vibrate.bind(interactionFeedback),
    copyToClipboard: interactionFeedback.copyToClipboard.bind(interactionFeedback),
    operationResult: interactionFeedback.operationResult.bind(interactionFeedback)
  }
}

export default interactionFeedback 