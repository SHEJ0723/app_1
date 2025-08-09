/**
 * 表单验证工具
 */

// 手机号验证
export const validatePhone = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入手机号'))
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的手机号格式'))
  } else {
    callback()
  }
}

// 车牌号验证
export const validatePlate = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入车牌号'))
  } else if (!/^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-Z0-9]{5,7}$/.test(value)) {
    callback(new Error('请输入正确的车牌号格式'))
  } else {
    callback()
  }
}

// 密码验证
export const validatePassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (value.length < 6) {
    callback(new Error('密码长度不能少于6位'))
  } else if (value.length > 20) {
    callback(new Error('密码长度不能超过20位'))
  } else {
    callback()
  }
}

// 确认密码验证
export const validateConfirmPassword = (password) => {
  return (rule, value, callback) => {
    if (!value) {
      callback(new Error('请确认密码'))
    } else if (value !== password) {
      callback(new Error('两次输入的密码不一致'))
    } else {
      callback()
    }
  }
}

// 邮箱验证
export const validateEmail = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入邮箱'))
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    callback(new Error('请输入正确的邮箱格式'))
  } else {
    callback()
  }
}

// 用户名验证
export const validateUsername = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入用户名'))
  } else if (value.length < 3) {
    callback(new Error('用户名长度不能少于3位'))
  } else if (value.length > 20) {
    callback(new Error('用户名长度不能超过20位'))
  } else if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(value)) {
    callback(new Error('用户名只能包含字母、数字、下划线和中文'))
  } else {
    callback()
  }
}

// 工号验证
export const validateWorkId = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入工号'))
  } else if (!/^[a-zA-Z0-9]{3,10}$/.test(value)) {
    callback(new Error('工号必须是3-10位字母或数字'))
  } else {
    callback()
  }
}

// 验证码验证
export const validateCaptcha = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入验证码'))
  } else if (!/^[a-zA-Z0-9]{4,6}$/.test(value)) {
    callback(new Error('验证码格式不正确'))
  } else {
    callback()
  }
}

// 时间范围验证
export const validateTimeRange = (rule, value, callback) => {
  if (!value || value.length !== 2) {
    callback(new Error('请选择时间范围'))
  } else if (value[1] <= value[0]) {
    callback(new Error('结束时间必须晚于开始时间'))
  } else {
    callback()
  }
}

// 金额验证
export const validateAmount = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入金额'))
  } else if (!/^\d+(\.\d{1,2})?$/.test(value)) {
    callback(new Error('请输入正确的金额格式'))
  } else if (parseFloat(value) <= 0) {
    callback(new Error('金额必须大于0'))
  } else {
    callback()
  }
}

// 内容长度验证
export const validateContentLength = (min = 5, max = 500) => {
  return (rule, value, callback) => {
    if (!value) {
      callback(new Error('请输入内容'))
    } else if (value.length < min) {
      callback(new Error(`内容长度不能少于${min}个字符`))
    } else if (value.length > max) {
      callback(new Error(`内容长度不能超过${max}个字符`))
    } else {
      callback()
    }
  }
}

// 通用必填验证
export const validateRequired = (fieldName) => {
  return (rule, value, callback) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      callback(new Error(`请输入${fieldName}`))
    } else {
      callback()
    }
  }
}

// 数字范围验证
export const validateNumberRange = (min, max) => {
  return (rule, value, callback) => {
    if (!value) {
      callback(new Error('请输入数值'))
    } else if (isNaN(value) || parseFloat(value) < min || parseFloat(value) > max) {
      callback(new Error(`数值必须在${min}-${max}之间`))
    } else {
      callback()
    }
  }
}

// 预定义验证规则
export const validationRules = {
  phone: [
    { required: true, validator: validatePhone, trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePassword, trigger: 'blur' }
  ],
  email: [
    { required: true, validator: validateEmail, trigger: 'blur' }
  ],
  username: [
    { required: true, validator: validateUsername, trigger: 'blur' }
  ],
  workId: [
    { required: true, validator: validateWorkId, trigger: 'blur' }
  ],
  captcha: [
    { required: true, validator: validateCaptcha, trigger: 'blur' }
  ],
  plate: [
    { required: true, validator: validatePlate, trigger: 'blur' }
  ],
  timeRange: [
    { required: true, validator: validateTimeRange, trigger: 'change' }
  ],
  amount: [
    { required: true, validator: validateAmount, trigger: 'blur' }
  ],
  content: [
    { required: true, validator: validateContentLength(5, 500), trigger: 'blur' }
  ]
}

export default {
  validatePhone,
  validatePassword,
  validateEmail,
  validateUsername,
  validateWorkId,
  validateCaptcha,
  validatePlate,
  validateTimeRange,
  validateAmount,
  validateContentLength,
  validateRequired,
  validateNumberRange,
  validationRules
} 