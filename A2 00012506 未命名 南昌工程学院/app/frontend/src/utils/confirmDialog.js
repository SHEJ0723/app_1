import { ElMessageBox } from 'element-plus'

/**
 * 操作确认工具
 */
export class ConfirmDialog {
  /**
   * 删除确认
   * @param {string} title - 标题
   * @param {string} content - 内容
   * @param {Object} options - 选项
   * @returns {Promise} 确认结果
   */
  static async delete(title = '确认删除', content = '确定要删除吗？', options = {}) {
    const defaultOptions = {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      dangerouslyUseHTMLString: false
    }
    
    try {
      await ElMessageBox.confirm(content, title, { ...defaultOptions, ...options })
      return true
    } catch (error) {
      if (error === 'cancel') {
        return false
      }
      throw error
    }
  }

  /**
   * 批量删除确认
   * @param {number} count - 删除数量
   * @param {string} itemName - 项目名称
   * @param {Object} options - 选项
   * @returns {Promise} 确认结果
   */
  static async batchDelete(count, itemName = '项目', options = {}) {
    const content = `确定要删除选中的 ${count} 个${itemName}吗？此操作不可恢复！`
    return this.delete('批量删除', content, { ...options, type: 'warning' })
  }

  /**
   * 操作确认
   * @param {string} title - 标题
   * @param {string} content - 内容
   * @param {Object} options - 选项
   * @returns {Promise} 确认结果
   */
  static async confirm(title = '确认操作', content = '确定要执行此操作吗？', options = {}) {
    const defaultOptions = {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
      dangerouslyUseHTMLString: false
    }
    
    try {
      await ElMessageBox.confirm(content, title, { ...defaultOptions, ...options })
      return true
    } catch (error) {
      if (error === 'cancel') {
        return false
      }
      throw error
    }
  }

  /**
   * 危险操作确认
   * @param {string} title - 标题
   * @param {string} content - 内容
   * @param {Object} options - 选项
   * @returns {Promise} 确认结果
   */
  static async danger(title = '危险操作', content = '此操作具有危险性，确定要继续吗？', options = {}) {
    const defaultOptions = {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error',
      dangerouslyUseHTMLString: false
    }
    
    try {
      await ElMessageBox.confirm(content, title, { ...defaultOptions, ...options })
      return true
    } catch (error) {
      if (error === 'cancel') {
        return false
      }
      throw error
    }
  }

  /**
   * 保存确认
   * @param {string} title - 标题
   * @param {string} content - 内容
   * @param {Object} options - 选项
   * @returns {Promise} 确认结果
   */
  static async save(title = '保存确认', content = '确定要保存更改吗？', options = {}) {
    const defaultOptions = {
      confirmButtonText: '保存',
      cancelButtonText: '取消',
      type: 'info',
      dangerouslyUseHTMLString: false
    }
    
    try {
      await ElMessageBox.confirm(content, title, { ...defaultOptions, ...options })
      return true
    } catch (error) {
      if (error === 'cancel') {
        return false
      }
      throw error
    }
  }

  /**
   * 退出确认
   * @param {string} title - 标题
   * @param {string} content - 内容
   * @param {Object} options - 选项
   * @returns {Promise} 确认结果
   */
  static async exit(title = '退出确认', content = '确定要退出吗？未保存的更改将丢失。', options = {}) {
    const defaultOptions = {
      confirmButtonText: '退出',
      cancelButtonText: '取消',
      type: 'warning',
      dangerouslyUseHTMLString: false
    }
    
    try {
      await ElMessageBox.confirm(content, title, { ...defaultOptions, ...options })
      return true
    } catch (error) {
      if (error === 'cancel') {
        return false
      }
      throw error
    }
  }

  /**
   * 重置确认
   * @param {string} title - 标题
   * @param {string} content - 内容
   * @param {Object} options - 选项
   * @returns {Promise} 确认结果
   */
  static async reset(title = '重置确认', content = '确定要重置吗？所有更改将丢失。', options = {}) {
    const defaultOptions = {
      confirmButtonText: '重置',
      cancelButtonText: '取消',
      type: 'warning',
      dangerouslyUseHTMLString: false
    }
    
    try {
      await ElMessageBox.confirm(content, title, { ...defaultOptions, ...options })
      return true
    } catch (error) {
      if (error === 'cancel') {
        return false
      }
      throw error
    }
  }

  /**
   * 自定义确认
   * @param {string} title - 标题
   * @param {string} content - 内容
   * @param {Object} options - 选项
   * @returns {Promise} 确认结果
   */
  static async custom(title, content, options = {}) {
    const defaultOptions = {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
      dangerouslyUseHTMLString: false
    }
    
    try {
      await ElMessageBox.confirm(content, title, { ...defaultOptions, ...options })
      return true
    } catch (error) {
      if (error === 'cancel') {
        return false
      }
      throw error
    }
  }
}

/**
 * 组合式函数：操作确认
 * @returns {Object} 确认方法集合
 */
export function useConfirm() {
  return {
    delete: ConfirmDialog.delete,
    batchDelete: ConfirmDialog.batchDelete,
    confirm: ConfirmDialog.confirm,
    danger: ConfirmDialog.danger,
    save: ConfirmDialog.save,
    exit: ConfirmDialog.exit,
    reset: ConfirmDialog.reset,
    custom: ConfirmDialog.custom
  }
}

export default ConfirmDialog 