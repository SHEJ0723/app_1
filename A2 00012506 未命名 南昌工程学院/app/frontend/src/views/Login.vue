<template>
  <div class="login-bg">
    <div class="bg-shape circle1"></div>
    <div class="bg-shape circle2"></div>
    <div class="bg-shape triangle"></div>
    <div class="login-card">
      <div class="login-title">欢迎登录龙跃智慧停车场</div>
      <div class="login-type-switch">
        <el-radio-group v-model="loginType" size="large">
          <el-radio-button value="user">用户登录</el-radio-button>
          <el-radio-button value="admin">管理员登录</el-radio-button>
        </el-radio-group>
      </div>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="rules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <template v-if="loginType === 'user'">
          <el-form-item prop="phone">
            <el-input
              v-model="loginForm.phone"
              placeholder="请输入手机号"
              prefix-icon="Phone"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          <div class="form-options">
            <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
            <router-link to="/forgot-password" class="forgot-password-link">忘记密码？</router-link>
          </div>
        </template>
        <template v-else>
          <el-form-item prop="workId">
            <el-input
              v-model="loginForm.workId"
              placeholder="请输入工号"
              prefix-icon="User"
            />
          </el-form-item>
          <el-form-item prop="adminPassword">
            <el-input
              v-model="loginForm.adminPassword"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          <el-form-item prop="captcha">
            <el-input
              v-model="loginForm.captcha"
              placeholder="请输入验证码"
              @keyup.enter="handleLogin"
            />
            <div class="captcha-image-container">
              <img
                :src="captchaUrl"
                class="captcha-image"
                @click="refreshCaptcha"
                alt="验证码"
              />
            </div>
          </el-form-item>
        </template>
        <el-button
          type="primary"
          :loading="loading"
          class="login-btn"
          @click.prevent="handleLogin"
        >
          {{ loading ? '登录中...' : '登录' }}
        </el-button>
        <div v-if="loginType === 'user'" class="register-link">
          还没有账号？
          <router-link to="/register">立即注册</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Phone } from '@element-plus/icons-vue'
import { validationRules } from '@/utils/validators'
import { authAPI } from '@/api/auth'
import bgImg from '@/assets/images/bg-login.jpg'

    const router = useRouter()
    const loginFormRef = ref(null)
    const loading = ref(false)
    const loginType = ref('user')
    const captchaUrl = ref('')
    const captchaExpiresIn = ref(0)
    const captchaTimer = ref(null)
    


    const loginForm = reactive({
      phone: '',
      password: '',
      workId: 'admin',
      adminPassword: 'admin123',
      captcha: '',
      remember: false
    })



    const rules = reactive({
      phone: validationRules.phone,
      password: validationRules.password,
      workId: validationRules.workId,
      adminPassword: validationRules.password,
      captcha: validationRules.captcha
    })



    const refreshCaptcha = async () => {
      try {
        if (captchaTimer.value) {
          clearInterval(captchaTimer.value)
        }
        
        // 清除之前的验证码
        loginForm.captcha = ''
        captchaUrl.value = ''
        
        const response = await authAPI.getCaptcha()
        if (response.success) {
          captchaUrl.value = response.data.image
          captchaExpiresIn.value = response.data.expires_in
          console.log('验证码获取成功，session_id应该已设置到cookie中')
          captchaTimer.value = setInterval(() => {
            captchaExpiresIn.value--
            if (captchaExpiresIn.value <= 0) {
              clearInterval(captchaTimer.value)
              captchaUrl.value = ''
              ElMessage.warning('验证码已过期，请点击图片重新获取')
            }
          }, 1000)
        }
      } catch (error) {
        console.error('获取验证码失败:', error)
        ElMessage.error(error.message || '获取验证码失败')
      }
    }

    watch(loginType, (newType) => {
      loginForm.phone = ''
      loginForm.password = ''
      loginForm.workId = ''
      loginForm.adminPassword = ''
      loginForm.captcha = ''
      if (newType === 'admin') {
        refreshCaptcha()
      } else {
        if (captchaTimer.value) {
          clearInterval(captchaTimer.value)
        }
        captchaUrl.value = ''
        captchaExpiresIn.value = 0
      }
    })

    const handleLogin = async () => {
      if (!loginFormRef.value) return
      try {
        await loginFormRef.value.validate()
        loading.value = true
        let response
        if (loginType.value === 'user') {
          response = await authAPI.userLogin({
            phone: loginForm.phone,
            password: loginForm.password,
            remember: loginForm.remember
          })
        } else {
          // 确保在登录前已经获取了验证码（这样cookie会被正确设置）
          if (!captchaUrl.value || captchaExpiresIn.value <= 0) {
            ElMessage.warning('请先获取验证码')
            await refreshCaptcha()
            return
          }
          response = await authAPI.adminLogin({
            workId: loginForm.workId,
            adminPassword: loginForm.adminPassword,
            captcha: loginForm.captcha
          })
        }
        if (response.success) {
          try {
            localStorage.setItem('token', response.data.token)
            const userInfo = loginType.value === 'admin' ? response.data.admin : response.data.user
            if (!userInfo || typeof userInfo !== 'object') {
              throw new Error('Invalid user information received')
            }
            localStorage.setItem('userInfo', JSON.stringify(userInfo))
            localStorage.setItem('userType', loginType.value)
            ElMessage.success('登录成功')
            const targetPath = loginType.value === 'admin' ? '/admin' : '/user'
            await router.push(targetPath)
          } catch (error) {
            console.error('保存用户信息失败:', error)
            ElMessage.error('登录失败：无法保存用户信息')
            localStorage.removeItem('token')
            localStorage.removeItem('userInfo')
            localStorage.removeItem('userType')
          }
        } else {
          ElMessage.error(response.message || '登录失败，请检查账号密码')
          // 不要自动刷新验证码，让用户手动刷新
        }
      } catch (error) {
        console.error('登录错误:', error)
        const errorMsg = error.message || '登录失败，请稍后重试'
        ElMessage.error(errorMsg)
        // 不要自动刷新验证码，让用户手动刷新
        // if (loginType.value === 'admin' && 
        //     (errorMsg.includes('验证码') || error.response?.status === 400)) {
        //   refreshCaptcha()
        // }
      } finally {
        loading.value = false
      }
    }

    const rememberedPhone = localStorage.getItem('rememberedPhone')
    if (rememberedPhone) {
      loginForm.phone = rememberedPhone
      loginForm.remember = true
    }


</script>

<style>
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
.circle1 {
  width: 300px; height: 300px; left: 10%; top: 10%; background: #b2fefa;
}
.circle2 {
  width: 200px; height: 200px; right: 15%; bottom: 15%; background: #d4a1fd;
}
.triangle {
  width: 0; height: 0; border-left: 80px solid transparent; border-right: 80px solid transparent; border-bottom: 140px solid #a1c4fd; left: 60%; top: 60%; opacity: 0.18;
  position: absolute;
  z-index: 1;
}
.login-card {
  position: relative;
  z-index: 2;
  background: rgba(255,255,255,0.95);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(80,80,160,0.15);
  padding: 48px 36px 36px 36px;
  width: 400px;
  max-width: 90vw;
  margin: 0 auto;
}
.login-title {
  font-size: 2.2rem;
  font-weight: bold;
  color: #1e3a8a;
  margin-bottom: 18px;
  letter-spacing: 1px;
  text-align: center;
}
.login-btn {
  background: linear-gradient(90deg, #2563eb 0%, #7c3aed 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 12px 0;
  font-size: 1.1rem;
  font-weight: bold;
  width: 100%;
  margin-top: 18px;
  box-shadow: 0 2px 8px rgba(80,80,160,0.08);
  transition: background 0.3s;
  cursor: pointer;
}
.login-btn:hover {
  background: linear-gradient(90deg, #1e40af 0%, #a78bfa 100%);
}
.register-link {
  margin-top: 18px;
  text-align: right;
}
.register-link a {
  color: #7c3aed;
  text-decoration: underline;
  font-weight: bold;
  cursor: pointer;
}

.forgot-password-link {
  color: #7c3aed;
  text-decoration: underline;
  font-weight: bold;
  cursor: pointer;
}

.forgot-password-link:hover {
  color: #a78bfa;
}
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.captcha-image-container {
  margin-top: 10px;
  text-align: center;
}
.captcha-image {
  height: 40px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: border-color 0.2s;
}
.captcha-image:hover {
  border-color: #409eff;
}

.sms-container {
  display: flex;
  gap: 10px;
  align-items: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 