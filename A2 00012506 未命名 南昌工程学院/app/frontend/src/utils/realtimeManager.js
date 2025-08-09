/**
 * 实时数据更新管理工具
 */

import { ref, onMounted, onUnmounted } from 'vue'
import { cacheManager } from './cacheManager'

/**
 * 实时更新配置
 */
const realtimeConfig = {
  // 默认轮询间隔（毫秒）
  defaultPollInterval: 30000, // 30秒
  // 最大轮询间隔
  maxPollInterval: 300000, // 5分钟
  // 最小轮询间隔
  minPollInterval: 5000, // 5秒
  // 重试次数
  maxRetries: 3,
  // 重试延迟
  retryDelay: 1000,
  // 是否启用WebSocket
  enableWebSocket: false,
  // WebSocket重连间隔
  wsReconnectInterval: 5000
}

/**
 * 实时数据更新管理器
 */
export class RealtimeManager {
  constructor() {
    this.pollingTasks = new Map()
    this.websocketConnections = new Map()
    this.subscribers = new Map()
    this.isInitialized = false
  }

  /**
   * 初始化实时管理器
   */
  init() {
    if (this.isInitialized) return
    
    this.isInitialized = true
    
    // 页面可见性变化时暂停/恢复轮询
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this))
    
    // 网络状态变化时处理
    window.addEventListener('online', this.handleOnline.bind(this))
    window.addEventListener('offline', this.handleOffline.bind(this))
  }

  /**
   * 创建轮询任务
   * @param {string} key - 任务标识
   * @param {Function} fetcher - 数据获取函数
   * @param {Object} options - 配置选项
   */
  createPollingTask(key, fetcher, options = {}) {
    const {
      interval = realtimeConfig.defaultPollInterval,
      immediate = true,
      onSuccess = null,
      onError = null,
      retryOnError = true,
      cacheKey = null,
      cacheTTL = null
    } = options

    // 验证间隔时间
    const pollInterval = Math.max(
      realtimeConfig.minPollInterval,
      Math.min(interval, realtimeConfig.maxPollInterval)
    )

    const task = {
      key,
      fetcher,
      interval: pollInterval,
      timer: null,
      retryCount: 0,
      isRunning: false,
      onSuccess,
      onError,
      retryOnError,
      cacheKey,
      cacheTTL,
      lastUpdate: null
    }

    this.pollingTasks.set(key, task)

    if (immediate) {
      this.startPolling(key)
    }

    return task
  }

  /**
   * 开始轮询
   * @param {string} key - 任务标识
   */
  async startPolling(key) {
    const task = this.pollingTasks.get(key)
    if (!task || task.isRunning) return

    task.isRunning = true
    await this.executePollingTask(task)
    
    task.timer = setInterval(async () => {
      await this.executePollingTask(task)
    }, task.interval)
  }

  /**
   * 停止轮询
   * @param {string} key - 任务标识
   */
  stopPolling(key) {
    const task = this.pollingTasks.get(key)
    if (!task) return

    if (task.timer) {
      clearInterval(task.timer)
      task.timer = null
    }
    task.isRunning = false
  }

  /**
   * 执行轮询任务
   * @param {Object} task - 轮询任务
   */
  async executePollingTask(task) {
    try {
      const result = await task.fetcher()
      
      // 更新缓存
      if (task.cacheKey) {
        cacheManager.set(task.cacheKey, result, task.cacheTTL)
      }

      // 通知订阅者
      this.notifySubscribers(task.key, result)

      // 成功回调
      if (task.onSuccess) {
        task.onSuccess(result)
      }

      task.lastUpdate = Date.now()
      task.retryCount = 0

    } catch (error) {
      console.error(`轮询任务 ${task.key} 执行失败:`, error)

      // 错误回调
      if (task.onError) {
        task.onError(error)
      }

      // 重试逻辑
      if (task.retryOnError && task.retryCount < realtimeConfig.maxRetries) {
        task.retryCount++
        setTimeout(async () => {
          await this.executePollingTask(task)
        }, realtimeConfig.retryDelay * task.retryCount)
      }
    }
  }

  /**
   * 订阅数据更新
   * @param {string} key - 订阅标识
   * @param {Function} callback - 回调函数
   */
  subscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set())
    }
    this.subscribers.get(key).add(callback)

    // 返回取消订阅函数
    return () => {
      const callbacks = this.subscribers.get(key)
      if (callbacks) {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          this.subscribers.delete(key)
        }
      }
    }
  }

  /**
   * 通知订阅者
   * @param {string} key - 订阅标识
   * @param {any} data - 数据
   */
  notifySubscribers(key, data) {
    const callbacks = this.subscribers.get(key)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('订阅回调执行失败:', error)
        }
      })
    }
  }

  /**
   * 手动触发数据更新
   * @param {string} key - 任务标识
   */
  async triggerUpdate(key) {
    const task = this.pollingTasks.get(key)
    if (task) {
      await this.executePollingTask(task)
    }
  }

  /**
   * 更新轮询间隔
   * @param {string} key - 任务标识
   * @param {number} interval - 新的间隔时间
   */
  updatePollingInterval(key, interval) {
    const task = this.pollingTasks.get(key)
    if (!task) return

    const newInterval = Math.max(
      realtimeConfig.minPollInterval,
      Math.min(interval, realtimeConfig.maxPollInterval)
    )

    if (task.interval !== newInterval) {
      task.interval = newInterval
      
      // 如果正在运行，重启轮询
      if (task.isRunning) {
        this.stopPolling(key)
        this.startPolling(key)
      }
    }
  }

  /**
   * 获取任务状态
   * @param {string} key - 任务标识
   * @returns {Object} 任务状态
   */
  getTaskStatus(key) {
    const task = this.pollingTasks.get(key)
    if (!task) return null

    return {
      key: task.key,
      isRunning: task.isRunning,
      interval: task.interval,
      retryCount: task.retryCount,
      lastUpdate: task.lastUpdate,
      nextUpdate: task.lastUpdate ? task.lastUpdate + task.interval : null
    }
  }

  /**
   * 获取所有任务状态
   * @returns {Array} 所有任务状态
   */
  getAllTaskStatus() {
    return Array.from(this.pollingTasks.keys()).map(key => this.getTaskStatus(key))
  }

  /**
   * 处理页面可见性变化
   */
  handleVisibilityChange() {
    if (document.hidden) {
      // 页面隐藏时暂停轮询
      this.pauseAllPolling()
    } else {
      // 页面显示时恢复轮询
      this.resumeAllPolling()
    }
  }

  /**
   * 处理网络在线
   */
  handleOnline() {
    console.log('网络已连接，恢复实时更新')
    this.resumeAllPolling()
  }

  /**
   * 处理网络离线
   */
  handleOffline() {
    console.log('网络已断开，暂停实时更新')
    this.pauseAllPolling()
  }

  /**
   * 暂停所有轮询
   */
  pauseAllPolling() {
    this.pollingTasks.forEach((task, key) => {
      if (task.isRunning) {
        this.stopPolling(key)
      }
    })
  }

  /**
   * 恢复所有轮询
   */
  resumeAllPolling() {
    this.pollingTasks.forEach((task, key) => {
      if (!task.isRunning) {
        this.startPolling(key)
      }
    })
  }

  /**
   * 清理资源
   */
  destroy() {
    // 停止所有轮询
    this.pollingTasks.forEach((task, key) => {
      this.stopPolling(key)
    })

    // 清理订阅者
    this.subscribers.clear()

    // 移除事件监听器
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)

    this.isInitialized = false
  }
}

// 创建全局实时管理器实例
export const realtimeManager = new RealtimeManager()

/**
 * 组合式函数：实时数据更新
 * @param {string} key - 任务标识
 * @param {Function} fetcher - 数据获取函数
 * @param {Object} options - 配置选项
 * @returns {Object} 实时更新控制对象
 */
export function useRealtime(key, fetcher, options = {}) {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const lastUpdate = ref(null)

  const unsubscribe = ref(null)

  const startRealtime = () => {
    const task = realtimeManager.createPollingTask(key, fetcher, {
      ...options,
      onSuccess: (result) => {
        data.value = result
        loading.value = false
        error.value = null
        lastUpdate.value = Date.now()
      },
      onError: (err) => {
        error.value = err
        loading.value = false
      }
    })

    // 订阅更新
    unsubscribe.value = realtimeManager.subscribe(key, (result) => {
      data.value = result
      lastUpdate.value = Date.now()
    })

    return task
  }

  const stopRealtime = () => {
    realtimeManager.stopPolling(key)
    if (unsubscribe.value) {
      unsubscribe.value()
      unsubscribe.value = null
    }
  }

  const triggerUpdate = () => {
    realtimeManager.triggerUpdate(key)
  }

  const updateInterval = (interval) => {
    realtimeManager.updatePollingInterval(key, interval)
  }

  onMounted(() => {
    realtimeManager.init()
    startRealtime()
  })

  onUnmounted(() => {
    stopRealtime()
  })

  return {
    data,
    loading,
    error,
    lastUpdate,
    startRealtime,
    stopRealtime,
    triggerUpdate,
    updateInterval
  }
}

export default realtimeManager 