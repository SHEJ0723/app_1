/**
 * 数据缓存管理工具
 */

// 内存缓存
const memoryCache = new Map()

// 缓存配置
const cacheConfig = {
  // 默认缓存时间（毫秒）
  defaultTTL: 5 * 60 * 1000, // 5分钟
  // 最大缓存项数
  maxItems: 100,
  // 本地存储前缀
  storagePrefix: 'app_cache_',
  // 是否启用本地存储
  enableStorage: true
}

/**
 * 缓存项类
 */
class CacheItem {
  constructor(key, value, ttl = cacheConfig.defaultTTL) {
    this.key = key
    this.value = value
    this.timestamp = Date.now()
    this.ttl = ttl
    this.expiresAt = this.timestamp + ttl
  }

  /**
   * 检查是否过期
   */
  isExpired() {
    return Date.now() > this.expiresAt
  }

  /**
   * 获取剩余时间
   */
  getTimeToLive() {
    return Math.max(0, this.expiresAt - Date.now())
  }
}

/**
 * 缓存管理器类
 */
export class CacheManager {
  constructor() {
    this.memoryCache = new Map()
    this.init()
  }

  /**
   * 初始化缓存
   */
  init() {
    // 清理过期的内存缓存
    this.cleanupMemoryCache()
    
    // 清理过期的本地存储缓存
    if (cacheConfig.enableStorage) {
      this.cleanupStorageCache()
    }

    // 设置定期清理
    setInterval(() => {
      this.cleanupMemoryCache()
      if (cacheConfig.enableStorage) {
        this.cleanupStorageCache()
      }
    }, 60000) // 每分钟清理一次
  }

  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {any} value - 缓存值
   * @param {number} ttl - 生存时间（毫秒）
   * @param {Object} options - 选项
   */
  set(key, value, ttl = cacheConfig.defaultTTL, options = {}) {
    const { useStorage = false, namespace = 'default' } = options
    const cacheKey = `${namespace}:${key}`
    const cacheItem = new CacheItem(cacheKey, value, ttl)

    // 内存缓存
    this.memoryCache.set(cacheKey, cacheItem)

    // 本地存储缓存
    if (useStorage && cacheConfig.enableStorage) {
      try {
        const storageKey = cacheConfig.storagePrefix + cacheKey
        localStorage.setItem(storageKey, JSON.stringify(cacheItem))
      } catch (error) {
        console.warn('本地存储缓存失败:', error)
      }
    }

    // 检查缓存大小限制
    this.enforceSizeLimit()
  }

  /**
   * 获取缓存
   * @param {string} key - 缓存键
   * @param {Object} options - 选项
   * @returns {any} 缓存值
   */
  get(key, options = {}) {
    const { useStorage = false, namespace = 'default' } = options
    const cacheKey = `${namespace}:${key}`

    // 先从内存缓存获取
    let cacheItem = this.memoryCache.get(cacheKey)
    
    if (!cacheItem && useStorage && cacheConfig.enableStorage) {
      // 从本地存储获取
      try {
        const storageKey = cacheConfig.storagePrefix + cacheKey
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          const parsed = JSON.parse(stored)
          cacheItem = new CacheItem(parsed.key, parsed.value, parsed.ttl)
          cacheItem.timestamp = parsed.timestamp
          cacheItem.expiresAt = parsed.expiresAt
          
          // 如果未过期，添加到内存缓存
          if (!cacheItem.isExpired()) {
            this.memoryCache.set(cacheKey, cacheItem)
          }
        }
      } catch (error) {
        console.warn('读取本地存储缓存失败:', error)
      }
    }

    if (!cacheItem || cacheItem.isExpired()) {
      return null
    }

    return cacheItem.value
  }

  /**
   * 删除缓存
   * @param {string} key - 缓存键
   * @param {Object} options - 选项
   */
  delete(key, options = {}) {
    const { useStorage = false, namespace = 'default' } = options
    const cacheKey = `${namespace}:${key}`

    // 删除内存缓存
    this.memoryCache.delete(cacheKey)

    // 删除本地存储缓存
    if (useStorage && cacheConfig.enableStorage) {
      try {
        const storageKey = cacheConfig.storagePrefix + cacheKey
        localStorage.removeItem(storageKey)
      } catch (error) {
        console.warn('删除本地存储缓存失败:', error)
      }
    }
  }

  /**
   * 清空所有缓存
   * @param {Object} options - 选项
   */
  clear(options = {}) {
    const { useStorage = false, namespace = 'default' } = options

    // 清空内存缓存
    if (namespace === 'default') {
      this.memoryCache.clear()
    } else {
      const prefix = `${namespace}:`
      for (const key of this.memoryCache.keys()) {
        if (key.startsWith(prefix)) {
          this.memoryCache.delete(key)
        }
      }
    }

    // 清空本地存储缓存
    if (useStorage && cacheConfig.enableStorage) {
      try {
        const prefix = cacheConfig.storagePrefix + namespace + ':'
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i)
          if (key && key.startsWith(prefix)) {
            localStorage.removeItem(key)
          }
        }
      } catch (error) {
        console.warn('清空本地存储缓存失败:', error)
      }
    }
  }

  /**
   * 检查缓存是否存在
   * @param {string} key - 缓存键
   * @param {Object} options - 选项
   * @returns {boolean} 是否存在
   */
  has(key, options = {}) {
    const { useStorage = false, namespace = 'default' } = options
    const cacheKey = `${namespace}:${key}`

    // 检查内存缓存
    const memoryItem = this.memoryCache.get(cacheKey)
    if (memoryItem && !memoryItem.isExpired()) {
      return true
    }

    // 检查本地存储缓存
    if (useStorage && cacheConfig.enableStorage) {
      try {
        const storageKey = cacheConfig.storagePrefix + cacheKey
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          const parsed = JSON.parse(stored)
          const cacheItem = new CacheItem(parsed.key, parsed.value, parsed.ttl)
          cacheItem.timestamp = parsed.timestamp
          cacheItem.expiresAt = parsed.expiresAt
          return !cacheItem.isExpired()
        }
      } catch (error) {
        console.warn('检查本地存储缓存失败:', error)
      }
    }

    return false
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    const memorySize = this.memoryCache.size
    let storageSize = 0

    if (cacheConfig.enableStorage) {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith(cacheConfig.storagePrefix)) {
            storageSize++
          }
        }
      } catch (error) {
        console.warn('获取本地存储统计失败:', error)
      }
    }

    return {
      memorySize,
      storageSize,
      maxItems: cacheConfig.maxItems,
      enableStorage: cacheConfig.enableStorage
    }
  }

  /**
   * 清理过期的内存缓存
   */
  cleanupMemoryCache() {
    for (const [key, item] of this.memoryCache.entries()) {
      if (item.isExpired()) {
        this.memoryCache.delete(key)
      }
    }
  }

  /**
   * 清理过期的本地存储缓存
   */
  cleanupStorageCache() {
    if (!cacheConfig.enableStorage) return

    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i)
        if (key && key.startsWith(cacheConfig.storagePrefix)) {
          const stored = localStorage.getItem(key)
          if (stored) {
            try {
              const parsed = JSON.parse(stored)
              const cacheItem = new CacheItem(parsed.key, parsed.value, parsed.ttl)
              cacheItem.timestamp = parsed.timestamp
              cacheItem.expiresAt = parsed.expiresAt
              
              if (cacheItem.isExpired()) {
                localStorage.removeItem(key)
              }
            } catch (error) {
              // 解析失败，删除无效缓存
              localStorage.removeItem(key)
            }
          }
        }
      }
    } catch (error) {
      console.warn('清理本地存储缓存失败:', error)
    }
  }

  /**
   * 强制执行大小限制
   */
  enforceSizeLimit() {
    if (this.memoryCache.size <= cacheConfig.maxItems) return

    // 按过期时间排序，删除最旧的
    const entries = Array.from(this.memoryCache.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)

    const toDelete = entries.slice(0, this.memoryCache.size - cacheConfig.maxItems)
    for (const [key] of toDelete) {
      this.memoryCache.delete(key)
    }
  }
}

// 创建全局缓存实例
export const cacheManager = new CacheManager()

/**
 * 组合式函数：缓存管理
 * @param {string} namespace - 命名空间
 * @returns {Object} 缓存方法
 */
export function useCache(namespace = 'default') {
  return {
    set: (key, value, ttl, options = {}) => 
      cacheManager.set(key, value, ttl, { ...options, namespace }),
    get: (key, options = {}) => 
      cacheManager.get(key, { ...options, namespace }),
    delete: (key, options = {}) => 
      cacheManager.delete(key, { ...options, namespace }),
    clear: (options = {}) => 
      cacheManager.clear({ ...options, namespace }),
    has: (key, options = {}) => 
      cacheManager.has(key, { ...options, namespace }),
    getStats: () => cacheManager.getStats()
  }
}

/**
 * 缓存装饰器：为异步函数添加缓存
 * @param {string} key - 缓存键
 * @param {number} ttl - 生存时间
 * @param {Object} options - 选项
 */
export function withCache(key, ttl = cacheConfig.defaultTTL, options = {}) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function(...args) {
      const cacheKey = typeof key === 'function' ? key(...args) : key
      const cached = cacheManager.get(cacheKey, options)
      
      if (cached !== null) {
        return cached
      }

      const result = await originalMethod.apply(this, args)
      cacheManager.set(cacheKey, result, ttl, options)
      
      return result
    }

    return descriptor
  }
}

export default cacheManager 