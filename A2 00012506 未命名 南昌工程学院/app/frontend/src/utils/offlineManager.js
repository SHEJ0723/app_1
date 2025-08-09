/**
 * 离线功能管理工具
 */

import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

/**
 * 离线管理器类
 */
export class OfflineManager {
  constructor() {
    this.isOnline = ref(navigator.onLine)
    this.registration = null
    this.offlineQueue = []
    this.syncInProgress = false
    this.listeners = new Map()
  }

  /**
   * 初始化离线管理器
   */
  async init() {
    // 注册Service Worker
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js')
        console.log('Service Worker registered:', this.registration)
        
        // 监听Service Worker更新
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration.installing
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateNotification()
            }
          })
        })
      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    }

    // 监听网络状态变化
    window.addEventListener('online', this.handleOnline.bind(this))
    window.addEventListener('offline', this.handleOffline.bind(this))

    // 监听Service Worker消息
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', this.handleMessage.bind(this))
    }
  }

  /**
   * 处理在线状态
   */
  handleOnline() {
    this.isOnline.value = true
    ElMessage.success('网络已连接')
    this.syncOfflineData()
  }

  /**
   * 处理离线状态
   */
  handleOffline() {
    this.isOnline.value = false
    ElMessage.warning('网络已断开，已切换到离线模式')
  }

  /**
   * 处理Service Worker消息
   */
  handleMessage(event) {
    const { type, data } = event.data
    
    switch (type) {
      case 'CACHE_UPDATED':
        this.handleCacheUpdate(data)
        break
      case 'SYNC_COMPLETED':
        this.handleSyncCompleted(data)
        break
      case 'OFFLINE_DATA_AVAILABLE':
        this.handleOfflineData(data)
        break
    }
  }

  /**
   * 添加离线队列项
   * @param {Object} item - 队列项
   */
  addToOfflineQueue(item) {
    this.offlineQueue.push({
      ...item,
      timestamp: Date.now(),
      id: this.generateId()
    })
    
    // 保存到本地存储
    this.saveOfflineQueue()
  }

  /**
   * 同步离线数据
   */
  async syncOfflineData() {
    if (this.syncInProgress || this.offlineQueue.length === 0) return

    this.syncInProgress = true
    
    try {
      const queue = [...this.offlineQueue]
      
      for (const item of queue) {
        try {
          await this.processOfflineItem(item)
          this.removeFromOfflineQueue(item.id)
        } catch (error) {
          console.error('Failed to sync offline item:', error)
        }
      }
      
      ElMessage.success('离线数据同步完成')
    } catch (error) {
      console.error('Offline sync failed:', error)
      ElMessage.error('离线数据同步失败')
    } finally {
      this.syncInProgress = false
    }
  }

  /**
   * 处理离线队列项
   * @param {Object} item - 队列项
   */
  async processOfflineItem(item) {
    const { type, data, url, method } = item
    
    switch (type) {
      case 'API_REQUEST':
        await this.processApiRequest(url, method, data)
        break
      case 'FORM_SUBMIT':
        await this.processFormSubmit(data)
        break
      case 'DATA_UPDATE':
        await this.processDataUpdate(data)
        break
    }
  }

  /**
   * 处理API请求
   * @param {string} url - 请求URL
   * @param {string} method - 请求方法
   * @param {Object} data - 请求数据
   */
  async processApiRequest(url, method, data) {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: method !== 'GET' ? JSON.stringify(data) : undefined
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    return response.json()
  }

  /**
   * 处理表单提交
   * @param {Object} data - 表单数据
   */
  async processFormSubmit(data) {
    // 根据表单类型处理不同的提交逻辑
    const { formType, formData } = data
    
    switch (formType) {
      case 'parking_reservation':
        await this.submitParkingReservation(formData)
        break
      case 'feedback':
        await this.submitFeedback(formData)
        break
      case 'user_profile':
        await this.updateUserProfile(formData)
        break
    }
  }

  /**
   * 处理数据更新
   * @param {Object} data - 更新数据
   */
  async processDataUpdate(data) {
    const { entity, action, payload } = data
    
    switch (entity) {
      case 'parking_spot':
        await this.updateParkingSpot(action, payload)
        break
      case 'user':
        await this.updateUser(action, payload)
        break
      case 'order':
        await this.updateOrder(action, payload)
        break
    }
  }

  /**
   * 提交停车预约
   * @param {Object} formData - 表单数据
   */
  async submitParkingReservation(formData) {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(formData)
    })

    if (!response.ok) {
      throw new Error('停车预约提交失败')
    }

    return response.json()
  }

  /**
   * 提交反馈
   * @param {Object} formData - 表单数据
   */
  async submitFeedback(formData) {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(formData)
    })

    if (!response.ok) {
      throw new Error('反馈提交失败')
    }

    return response.json()
  }

  /**
   * 更新用户资料
   * @param {Object} formData - 表单数据
   */
  async updateUserProfile(formData) {
    const response = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(formData)
    })

    if (!response.ok) {
      throw new Error('用户资料更新失败')
    }

    return response.json()
  }

  /**
   * 更新停车位
   * @param {string} action - 操作类型
   * @param {Object} payload - 数据
   */
  async updateParkingSpot(action, payload) {
    const { id, ...data } = payload
    const method = action === 'create' ? 'POST' : action === 'update' ? 'PUT' : 'DELETE'
    const url = action === 'create' ? '/api/parking-spots' : `/api/parking-spots/${id}`

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: method !== 'DELETE' ? JSON.stringify(data) : undefined
    })

    if (!response.ok) {
      throw new Error('停车位更新失败')
    }

    return response.json()
  }

  /**
   * 更新用户
   * @param {string} action - 操作类型
   * @param {Object} payload - 数据
   */
  async updateUser(action, payload) {
    const { id, ...data } = payload
    const method = action === 'create' ? 'POST' : action === 'update' ? 'PUT' : 'DELETE'
    const url = action === 'create' ? '/api/users' : `/api/users/${id}`

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: method !== 'DELETE' ? JSON.stringify(data) : undefined
    })

    if (!response.ok) {
      throw new Error('用户更新失败')
    }

    return response.json()
  }

  /**
   * 更新订单
   * @param {string} action - 操作类型
   * @param {Object} payload - 数据
   */
  async updateOrder(action, payload) {
    const { id, ...data } = payload
    const method = action === 'create' ? 'POST' : action === 'update' ? 'PUT' : 'DELETE'
    const url = action === 'create' ? '/api/orders' : `/api/orders/${id}`

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: method !== 'DELETE' ? JSON.stringify(data) : undefined
    })

    if (!response.ok) {
      throw new Error('订单更新失败')
    }

    return response.json()
  }

  /**
   * 从离线队列中移除项
   * @param {string} id - 队列项ID
   */
  removeFromOfflineQueue(id) {
    this.offlineQueue = this.offlineQueue.filter(item => item.id !== id)
    this.saveOfflineQueue()
  }

  /**
   * 保存离线队列到本地存储
   */
  saveOfflineQueue() {
    try {
      localStorage.setItem('offlineQueue', JSON.stringify(this.offlineQueue))
    } catch (error) {
      console.error('Failed to save offline queue:', error)
    }
  }

  /**
   * 从本地存储加载离线队列
   */
  loadOfflineQueue() {
    try {
      const saved = localStorage.getItem('offlineQueue')
      if (saved) {
        this.offlineQueue = JSON.parse(saved)
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error)
      this.offlineQueue = []
    }
  }

  /**
   * 清空离线队列
   */
  clearOfflineQueue() {
    this.offlineQueue = []
    this.saveOfflineQueue()
  }

  /**
   * 获取离线队列状态
   * @returns {Object} 队列状态
   */
  getOfflineQueueStatus() {
    return {
      count: this.offlineQueue.length,
      syncInProgress: this.syncInProgress,
      isOnline: this.isOnline.value
    }
  }

  /**
   * 显示更新通知
   */
  showUpdateNotification() {
    ElMessage.info('系统已更新，请刷新页面以使用最新版本')
  }

  /**
   * 处理缓存更新
   * @param {Object} data - 缓存数据
   */
  handleCacheUpdate(data) {
    console.log('Cache updated:', data)
  }

  /**
   * 处理同步完成
   * @param {Object} data - 同步数据
   */
  handleSyncCompleted(data) {
    console.log('Sync completed:', data)
  }

  /**
   * 处理离线数据
   * @param {Object} data - 离线数据
   */
  handleOfflineData(data) {
    console.log('Offline data available:', data)
  }

  /**
   * 生成唯一ID
   * @returns {string} 唯一ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  /**
   * 添加事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  /**
   * 移除事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  removeEventListener(event, callback) {
    const listeners = this.listeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * 触发事件
   * @param {string} event - 事件名称
   * @param {any} data - 事件数据
   */
  triggerEvent(event, data) {
    const listeners = this.listeners.get(event)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Event listener error:', error)
        }
      })
    }
  }

  /**
   * 销毁离线管理器
   */
  destroy() {
    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)
    
    if (navigator.serviceWorker) {
      navigator.serviceWorker.removeEventListener('message', this.handleMessage)
    }
    
    this.listeners.clear()
  }
}

// 创建全局离线管理器实例
export const offlineManager = new OfflineManager()

/**
 * 组合式函数：离线状态
 * @returns {Object} 离线状态对象
 */
export function useOffline() {
  const isOnline = ref(navigator.onLine)
  const offlineQueueCount = ref(0)
  const syncInProgress = ref(false)

  const updateStatus = () => {
    isOnline.value = navigator.onLine
    const status = offlineManager.getOfflineQueueStatus()
    offlineQueueCount.value = status.count
    syncInProgress.value = status.syncInProgress
  }

  const addToOfflineQueue = (item) => {
    offlineManager.addToOfflineQueue(item)
    updateStatus()
  }

  const syncOfflineData = async () => {
    await offlineManager.syncOfflineData()
    updateStatus()
  }

  const clearOfflineQueue = () => {
    offlineManager.clearOfflineQueue()
    updateStatus()
  }

  onMounted(() => {
    offlineManager.init()
    offlineManager.loadOfflineQueue()
    updateStatus()
    
    // 监听状态变化
    offlineManager.addEventListener('statusChanged', updateStatus)
  })

  onUnmounted(() => {
    offlineManager.removeEventListener('statusChanged', updateStatus)
  })

  return {
    isOnline,
    offlineQueueCount,
    syncInProgress,
    addToOfflineQueue,
    syncOfflineData,
    clearOfflineQueue
  }
}

export default offlineManager 