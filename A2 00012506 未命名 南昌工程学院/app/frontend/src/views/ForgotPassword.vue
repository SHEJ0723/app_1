<template>
  <div class="login-bg">
    <div class="bg-shape bg-shape-1"></div>
    <div class="bg-shape bg-shape-2"></div>
    <div class="bg-shape bg-shape-3"></div>
    
    <el-card class="forgot-password-card">
      <h2>重置密码</h2>
      <p class="subtitle">请输入您的手机号,我们将发送验证码帮您重置密码</p>
      
      <el-form
        ref="forgotPasswordFormRef"
        :model="forgotPasswordForm"
        :rules="rules"
        label-width="80px"
        class="forgot-password-form"
        @submit.prevent="handleResetPassword"
      >
        <el-form-item label="* 手机号" prop="phone">
          <el-input
            v-model="forgotPasswordForm.phone"
            placeholder="请输入手机号"
            prefix-icon="Phone"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="* 验证码" prop="captchaCode">
          <el-input
            v-model="forgotPasswordForm.captchaCode"
            placeholder="请输入图片验证码"
            prefix-icon="Picture"
            clearable
          />
          <div class="captcha-image-container">
            <img 
              v-if="captchaImage" 
              :src="captchaImage" 
              @click="refreshCaptcha"
              class="captcha-image"
              alt="验证码"
            />
            <el-button
              v-else
              type="primary"
              @click="sendCaptchaCode"
              :disabled="captchaCountdown > 0"
              style="width: 100%;"
            >
              {{ captchaCountdown > 0 ? `${captchaCountdown}s` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
        
        <el-form-item label="* 新密码" prop="newPassword">
          <el-input
            v-model="forgotPasswordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>
        
        <el-form-item label="* 确认密码" prop="confirmPassword">
          <el-input
            v-model="forgotPasswordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            @click="handleResetPassword"
            :loading="loading"
            style="width: 100%;"
          >
            重置密码
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-link">
        <el-button link type="primary" @click="$router.push('/login')">
          想起密码了?立即登录
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authAPI } from '@/api/auth'

const router = useRouter()
const forgotPasswordFormRef = ref(null)
const loading = ref(false)
const captchaImage = ref('')
const captchaCountdown = ref(0)
const captchaTimer = ref(null)

// 表单数据
const forgotPasswordForm = reactive({
  phone: '',
  captchaCode: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码确认验证
const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== forgotPasswordForm.newPassword) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

// 表单验证规则
const rules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'change' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'change' }
  ],
  captchaCode: [
    { required: true, message: '请输入验证码', trigger: 'change' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass2, trigger: 'blur' }
  ]
}

// 生成图片验证码
const sendCaptchaCode = async () => {
  try {
    // 先验证手机号
    if (!forgotPasswordForm.phone) {
      ElMessage.warning('请先输入手机号')
      return
    }
    
    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(forgotPasswordForm.phone)) {
      ElMessage.error('请输入正确的手机号格式')
      return
    }
    
    const response = await authAPI.sendCaptchaCode(forgotPasswordForm.phone, 'reset')
    if (response.success) {
      ElMessage.success(response.message || '验证码已生成')
      captchaImage.value = response.data.image
      // 存储验证码文本用于验证（仅用于模拟模式）
      if (response.data.text) {
        localStorage.setItem('temp_captcha', response.data.text)
      }
      captchaCountdown.value = 60
      captchaTimer.value = setInterval(() => {
        captchaCountdown.value--
        if (captchaCountdown.value <= 0) {
          clearInterval(captchaTimer.value)
        }
      }, 1000)
    } else {
      ElMessage.error(response.message || '生成失败')
    }
  } catch (error) {
    console.error('生成验证码失败:', error)
    
    // 处理验证错误
    if (error.response?.data) {
      const errorData = error.response.data
      if (errorData.phone && Array.isArray(errorData.phone)) {
        ElMessage.error(errorData.phone[0] || '手机号格式错误')
      } else if (errorData.message) {
        ElMessage.error(errorData.message)
      } else {
        ElMessage.error('生成验证码失败')
      }
    } else {
      ElMessage.error(error.message || '生成验证码失败')
    }
  }
}

// 刷新验证码
const refreshCaptcha = () => {
  if (forgotPasswordForm.phone) {
    sendCaptchaCode()
  } else {
    ElMessage.warning('请先输入手机号')
  }
}

// 重置密码
const handleResetPassword = async () => {
  if (!forgotPasswordFormRef.value) return
  try {
    await forgotPasswordFormRef.value.validate()
    
    // 验证验证码（模拟模式）
    const storedCaptcha = localStorage.getItem('temp_captcha')
    if (storedCaptcha && forgotPasswordForm.captchaCode.toUpperCase() !== storedCaptcha) {
      ElMessage.error('验证码错误')
      return
    }
    
    loading.value = true
    const response = await authAPI.resetPassword({
      phone: forgotPasswordForm.phone,
      smsCode: forgotPasswordForm.captchaCode,
      newPassword: forgotPasswordForm.newPassword
    })
    if (response.success) {
      ElMessage.success(response.message || '密码重置成功，请使用新密码登录')
      localStorage.removeItem('temp_captcha') // 清除临时验证码
      router.push('/login')
    } else {
      ElMessage.error(response.message || '密码重置失败')
    }
  } catch (error) {
    console.error('重置密码失败:', error)
    ElMessage.error(error.message || '重置密码失败')
  } finally {
    loading.value = false
  }
}

// 组件卸载时清理定时器
onUnmounted(() => {
  if (captchaTimer.value) {
    clearInterval(captchaTimer.value)
  }
})
</script>

<style scoped>
.login-bg {
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 50%, #d4a1fd 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.25;
  z-index: 1;
}

.bg-shape-1 {
  width: 200px;
  height: 200px;
  background: linear-gradient(45deg, #ff6b6b, #ffa500);
  top: 10%;
  left: 10%;
  animation: float 6s ease-in-out infinite;
}

.bg-shape-2 {
  width: 150px;
  height: 150px;
  background: linear-gradient(45deg, #4ecdc4, #44a08d);
  top: 60%;
  right: 10%;
  animation: float 8s ease-in-out infinite reverse;
}

.bg-shape-3 {
  width: 100px;
  height: 100px;
  background: linear-gradient(45deg, #a8edea, #fed6e3);
  bottom: 20%;
  left: 20%;
  animation: float 7s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.forgot-password-card {
  width: 400px;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 2;
  position: relative;
}

.forgot-password-card h2 {
  text-align: center;
  color: #333;
  margin-bottom: 10px;
  font-size: 24px;
  font-weight: 600;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
  font-size: 14px;
}

.forgot-password-form {
  margin-bottom: 20px;
}

.captcha-image-container {
  margin-top: 10px;
  text-align: center;
}

.captcha-image {
  width: 140px;
  height: 45px;
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f9f9f9;
}

.captcha-image:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #409eff;
}

.captcha-hint {
  display: block;
  font-size: 12px;
  color: #666;
  margin-top: 8px;
}

.captcha-placeholder {
  margin-top: 15px;
  text-align: center;
  padding: 20px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.login-link {
  text-align: center;
  margin-top: 20px;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.3s ease;
  min-height: 44px;
  width: 100%;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #409eff;
}

:deep(.el-input__inner) {
  font-size: 16px;
  padding: 12px 15px;
  width: 100%;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

:deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  height: 44px;
}

:deep(.el-button--primary) {
  background: linear-gradient(45deg, #409eff, #67c23a);
  border: none;
}

:deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}
</style> 