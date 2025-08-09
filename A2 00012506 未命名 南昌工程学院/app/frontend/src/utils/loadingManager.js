import { ref } from 'vue'

/**
 * 加载状态管理工具
 */
export class LoadingManager {
  constructor() {
    this.loadingStates = new Map()
    this.globalLoading = ref(false)
  }

  /**
   * 创建加载状态
   * @param {string} key - 加载状态标识
   * @param {boolean} initialValue - 初始值
   * @returns {Ref} 响应式加载状态
   */
  createLoading(key, initialValue = false) {
    const loading = ref(initialValue)
    this.loadingStates.set(key, loading)
    return loading
  }

  /**
   * 获取加载状态
   * @param {string} key - 加载状态标识
   * @returns {Ref} 响应式加载状态
   */
  getLoading(key) {
    if (!this.loadingStates.has(key)) {
      return this.createLoading(key)
    }
    return this.loadingStates.get(key)
  }

  /**
   * 设置加载状态
   * @param {string} key - 加载状态标识
   * @param {boolean} value - 加载状态值
   */
  setLoading(key, value) {
    const loading = this.getLoading(key)
    loading.value = value
  }

  /**
   * 执行异步操作并管理加载状态
   * @param {string} key - 加载状态标识
   * @param {Function} asyncFn - 异步函数
   * @param {Object} options - 选项
   * @returns {Promise} 异步操作结果
   */
  async executeWithLoading(key, asyncFn, options = {}) {
    const {
      showGlobalLoading = false,
      errorHandler = null,
      successHandler = null
    } = options

    const loading = this.getLoading(key)
    
    try {
      loading.value = true
      if (showGlobalLoading) {
        this.globalLoading.value = true
      }

      const result = await asyncFn()
      
      if (successHandler) {
        successHandler(result)
      }
      
      return result
    } catch (error) {
      if (errorHandler) {
        errorHandler(error)
      } else {
        throw error
      }
    } finally {
      loading.value = false
      if (showGlobalLoading) {
        this.globalLoading.value = false
      }
    }
  }

  /**
   * 清除所有加载状态
   */
  clearAll() {
    this.loadingStates.forEach(loading => {
      loading.value = false
    })
    this.globalLoading.value = false
  }

  /**
   * 获取全局加载状态
   * @returns {Ref} 全局加载状态
   */
  getGlobalLoading() {
    return this.globalLoading
  }
}

// 创建全局实例
export const loadingManager = new LoadingManager()

/**
 * 组合式函数：创建加载状态
 * @param {string} key - 加载状态标识
 * @param {boolean} initialValue - 初始值
 * @returns {Object} 包含loading状态和执行方法的对象
 */
export function useLoading(key, initialValue = false) {
  const loading = loadingManager.getLoading(key)
  
  const executeWithLoading = async (asyncFn, options = {}) => {
    return loadingManager.executeWithLoading(key, asyncFn, options)
  }

  return {
    loading,
    executeWithLoading,
    setLoading: (value) => loadingManager.setLoading(key, value)
  }
}

export default LoadingManager 