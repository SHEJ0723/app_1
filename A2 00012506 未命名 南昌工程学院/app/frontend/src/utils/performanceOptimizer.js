/**
 * 性能优化工具
 */

import { ref, nextTick } from 'vue'

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @param {boolean} immediate - 是否立即执行
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, wait = 300, immediate = false) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func(...args)
  }
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 限制时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(func, limit = 300) {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 虚拟滚动管理器
 */
export class VirtualScroller {
  constructor(options = {}) {
    this.itemHeight = options.itemHeight || 50
    this.containerHeight = options.containerHeight || 400
    this.bufferSize = options.bufferSize || 5
    this.items = options.items || []
    this.onRender = options.onRender || (() => {})
  }

  /**
   * 计算可见范围
   * @param {number} scrollTop - 滚动位置
   * @returns {Object} 可见范围信息
   */
  calculateVisibleRange(scrollTop) {
    const startIndex = Math.floor(scrollTop / this.itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(this.containerHeight / this.itemHeight) + this.bufferSize,
      this.items.length
    )
    const startIndexWithBuffer = Math.max(0, startIndex - this.bufferSize)
    const endIndexWithBuffer = Math.min(this.items.length, endIndex + this.bufferSize)

    return {
      startIndex: startIndexWithBuffer,
      endIndex: endIndexWithBuffer,
      visibleItems: this.items.slice(startIndexWithBuffer, endIndexWithBuffer),
      totalHeight: this.items.length * this.itemHeight,
      offsetY: startIndexWithBuffer * this.itemHeight
    }
  }

  /**
   * 渲染可见项
   * @param {number} scrollTop - 滚动位置
   */
  render(scrollTop) {
    const range = this.calculateVisibleRange(scrollTop)
    this.onRender(range)
    return range
  }
}

/**
 * 图片懒加载
 * @param {string} src - 图片源
 * @param {Object} options - 选项
 * @returns {Promise} 加载Promise
 */
export function lazyLoadImage(src, options = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    
    if (options.crossOrigin) {
      img.crossOrigin = options.crossOrigin
    }
    
    img.src = src
  })
}

/**
 * 资源预加载
 * @param {Array} resources - 资源列表
 * @returns {Promise} 预加载Promise
 */
export function preloadResources(resources) {
  const promises = resources.map(resource => {
    if (resource.type === 'image') {
      return lazyLoadImage(resource.src)
    } else if (resource.type === 'script') {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = resource.src
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
    } else if (resource.type === 'css') {
      return new Promise((resolve, reject) => {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = resource.src
        link.onload = resolve
        link.onerror = reject
        document.head.appendChild(link)
      })
    }
    return Promise.resolve()
  })

  return Promise.all(promises)
}

/**
 * 内存使用监控
 */
export class MemoryMonitor {
  constructor() {
    this.observers = []
    this.isMonitoring = false
    this.interval = null
  }

  /**
   * 开始监控
   * @param {number} interval - 监控间隔（毫秒）
   */
  startMonitoring(interval = 5000) {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.interval = setInterval(() => {
      this.checkMemoryUsage()
    }, interval)
  }

  /**
   * 停止监控
   */
  stopMonitoring() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
    this.isMonitoring = false
  }

  /**
   * 检查内存使用情况
   */
  checkMemoryUsage() {
    if ('memory' in performance) {
      const memory = performance.memory
      const usage = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      }

      this.observers.forEach(observer => {
        try {
          observer(usage)
        } catch (error) {
          console.error('Memory observer error:', error)
        }
      })

      // 内存使用超过80%时发出警告
      if (usage.percentage > 80) {
        console.warn('High memory usage detected:', usage)
      }
    }
  }

  /**
   * 添加观察者
   * @param {Function} observer - 观察者函数
   */
  addObserver(observer) {
    this.observers.push(observer)
  }

  /**
   * 移除观察者
   * @param {Function} observer - 观察者函数
   */
  removeObserver(observer) {
    const index = this.observers.indexOf(observer)
    if (index > -1) {
      this.observers.splice(index, 1)
    }
  }
}

/**
 * 组件懒加载
 * @param {Function} importFunc - 导入函数
 * @param {Object} options - 选项
 * @returns {Object} 懒加载组件
 */
export function lazyComponent(importFunc, options = {}) {
  const {
    loadingComponent = null,
    errorComponent = null,
    delay = 200,
    timeout = 10000
  } = options

  return {
    component: importFunc,
    loading: loadingComponent,
    error: errorComponent,
    delay,
    timeout
  }
}

/**
 * 组合式函数：防抖
 * @param {Function} fn - 要防抖的函数
 * @param {number} delay - 延迟时间
 * @returns {Function} 防抖函数
 */
export function useDebounce(fn, delay = 300) {
  const timeoutRef = ref(null)
  
  const debouncedFn = (...args) => {
    if (timeoutRef.value) {
      clearTimeout(timeoutRef.value)
    }
    timeoutRef.value = setTimeout(() => {
      fn(...args)
    }, delay)
  }

  return debouncedFn
}

/**
 * 组合式函数：节流
 * @param {Function} fn - 要节流的函数
 * @param {number} delay - 延迟时间
 * @returns {Function} 节流函数
 */
export function useThrottle(fn, delay = 300) {
  const lastCall = ref(0)
  
  const throttledFn = (...args) => {
    const now = Date.now()
    if (now - lastCall.value >= delay) {
      lastCall.value = now
      fn(...args)
    }
  }

  return throttledFn
}

/**
 * 组合式函数：虚拟滚动
 * @param {Array} items - 数据项
 * @param {Object} options - 选项
 * @returns {Object} 虚拟滚动状态
 */
export function useVirtualScroll(items, options = {}) {
  const scrollTop = ref(0)
  const containerHeight = ref(options.containerHeight || 400)
  const itemHeight = ref(options.itemHeight || 50)
  const bufferSize = ref(options.bufferSize || 5)

  const scroller = new VirtualScroller({
    items,
    itemHeight: itemHeight.value,
    containerHeight: containerHeight.value,
    bufferSize: bufferSize.value
  })

  const visibleRange = ref(scroller.calculateVisibleRange(0))

  const handleScroll = (event) => {
    scrollTop.value = event.target.scrollTop
    visibleRange.value = scroller.calculateVisibleRange(scrollTop.value)
  }

  const updateItems = (newItems) => {
    scroller.items = newItems
    visibleRange.value = scroller.calculateVisibleRange(scrollTop.value)
  }

  return {
    scrollTop,
    containerHeight,
    itemHeight,
    visibleRange,
    handleScroll,
    updateItems
  }
}

/**
 * 组合式函数：图片懒加载
 * @param {string} src - 图片源
 * @param {Object} options - 选项
 * @returns {Object} 懒加载状态
 */
export function useLazyImage(src, options = {}) {
  const loading = ref(true)
  const error = ref(false)
  const loaded = ref(false)
  const imageSrc = ref(options.placeholder || '')

  const loadImage = async () => {
    try {
      loading.value = true
      error.value = false
      
      await lazyLoadImage(src, options)
      
      imageSrc.value = src
      loaded.value = true
      loading.value = false
    } catch (err) {
      error.value = true
      loading.value = false
      console.error('Image load failed:', err)
    }
  }

  // 使用 Intersection Observer 实现懒加载
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadImage()
        observer.unobserve(entry.target)
      }
    })
  })

  const observeElement = (element) => {
    if (element) {
      observer.observe(element)
    }
  }

  return {
    loading,
    error,
    loaded,
    imageSrc,
    observeElement
  }
}

/**
 * 性能监控器
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
    this.observers = []
  }

  /**
   * 开始计时
   * @param {string} name - 计时器名称
   */
  startTimer(name) {
    this.metrics.set(name, {
      startTime: performance.now(),
      endTime: null,
      duration: null
    })
  }

  /**
   * 结束计时
   * @param {string} name - 计时器名称
   * @returns {number} 持续时间
   */
  endTimer(name) {
    const metric = this.metrics.get(name)
    if (!metric) return 0

    metric.endTime = performance.now()
    metric.duration = metric.endTime - metric.startTime

    this.notifyObservers(name, metric)
    return metric.duration
  }

  /**
   * 测量函数执行时间
   * @param {string} name - 测量名称
   * @param {Function} fn - 要测量的函数
   * @returns {any} 函数执行结果
   */
  async measure(name, fn) {
    this.startTimer(name)
    try {
      const result = await fn()
      this.endTimer(name)
      return result
    } catch (error) {
      this.endTimer(name)
      throw error
    }
  }

  /**
   * 添加观察者
   * @param {Function} observer - 观察者函数
   */
  addObserver(observer) {
    this.observers.push(observer)
  }

  /**
   * 通知观察者
   * @param {string} name - 测量名称
   * @param {Object} metric - 测量结果
   */
  notifyObservers(name, metric) {
    this.observers.forEach(observer => {
      try {
        observer(name, metric)
      } catch (error) {
        console.error('Performance observer error:', error)
      }
    })
  }

  /**
   * 获取所有指标
   * @returns {Object} 所有指标
   */
  getMetrics() {
    const result = {}
    this.metrics.forEach((metric, name) => {
      result[name] = metric
    })
    return result
  }

  /**
   * 清理指标
   */
  clear() {
    this.metrics.clear()
  }
}

// 创建全局性能监控器
export const performanceMonitor = new PerformanceMonitor()

export default {
  debounce,
  throttle,
  VirtualScroller,
  lazyLoadImage,
  preloadResources,
  MemoryMonitor,
  lazyComponent,
  useDebounce,
  useThrottle,
  useVirtualScroll,
  useLazyImage,
  PerformanceMonitor,
  performanceMonitor
} 