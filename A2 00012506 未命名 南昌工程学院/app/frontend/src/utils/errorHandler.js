import { ElMessage } from 'element-plus'

/**
 * 统一错误处理工具
 */
export class ErrorHandler {
  /**
   * 处理API错误
   * @param {Error} error - 错误对象
   * @param {string} context - 错误上下文
   * @param {boolean} showMessage - 是否显示错误消息
   */
  static handleApiError(error, context = '', showMessage = true) {
    // 开发环境打印详细错误信息
    if (process.env.NODE_ENV === 'development') {
      console.error(`${context} API错误:`, error)
    }

    // 根据错误类型显示不同的消息
    let message = '操作失败，请稍后重试'
    
    if (error.response) {
      // 服务器响应错误
      const status = error.response.status
      const data = error.response.data
      
      switch (status) {
        case 400:
          message = data?.message || '请求参数错误'
          break
        case 401:
          message = '登录已过期，请重新登录'
          // 清除token并跳转到登录页（只在非登录页面时跳转）
          localStorage.removeItem('token')
          localStorage.removeItem('userType')
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          return
        case 403:
          message = '权限不足，无法执行此操作'
          break
        case 404:
          message = '请求的资源不存在'
          break
        case 500:
          message = '服务器内部错误，请稍后重试'
          break
        default:
          message = data?.message || `请求失败 (${status})`
      }
    } else if (error.request) {
      // 网络错误
      message = '网络连接失败，请检查网络设置'
    } else {
      // 其他错误
      message = error.message || '未知错误'
    }

    if (showMessage) {
      ElMessage.error(message)
    }

    return message
  }

  /**
   * 处理表单验证错误
   * @param {Error} error - 验证错误
   * @param {string} field - 字段名
   */
  static handleValidationError(error, field = '') {
    const message = field ? `${field}验证失败: ${error.message}` : error.message
    ElMessage.warning(message)
  }

  /**
   * 处理业务逻辑错误
   * @param {string} message - 错误消息
   * @param {string} type - 消息类型 (error, warning, info)
   */
  static handleBusinessError(message, type = 'error') {
    ElMessage[type](message)
  }

  /**
   * 处理网络超时
   * @param {Function} retryFn - 重试函数
   * @param {number} maxRetries - 最大重试次数
   */
  static async handleTimeout(retryFn, maxRetries = 3) {
    let retries = 0
    
    while (retries < maxRetries) {
      try {
        return await retryFn()
      } catch (error) {
        retries++
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          if (retries >= maxRetries) {
            ElMessage.error('请求超时，请检查网络连接')
            throw error
          }
          // 等待一段时间后重试
          await new Promise(resolve => setTimeout(resolve, 1000 * retries))
        } else {
          throw error
        }
      }
    }
  }
}

/**
 * 全局错误处理器
 */
export const setupGlobalErrorHandler = () => {
  // 处理未捕获的Promise错误
  window.addEventListener('unhandledrejection', (event) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('未处理的Promise错误:', event.reason)
    }
    ErrorHandler.handleApiError(event.reason, '全局错误')
  })

  // 处理全局JavaScript错误
  window.addEventListener('error', (event) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('全局JavaScript错误:', event.error)
    }
    // 对于全局错误，只记录不显示消息，避免用户体验问题
  })
}

export default ErrorHandler 