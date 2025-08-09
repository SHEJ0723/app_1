<template>
  <div class="fade-in">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h2 class="text-[clamp(1.25rem,3vw,1.75rem)] font-semibold">个人资料</h2>
      <p class="text-gray-500 mt-1">管理您的个人信息和账户设置</p>
    </div>

    <!-- 消息中心按钮 -->
    <div class="mb-6 flex justify-end">
      <el-badge :value="unreadCount" v-if="unreadCount > 0">
        <CommonButton type="primary" size="medium" @click="goToMessages" class="msg-btn">
          <i class="fa fa-bell mr-2"></i> 消息中心
        </CommonButton>
      </el-badge>
      <CommonButton v-else type="primary" size="medium" @click="goToMessages" class="msg-btn">
        <i class="fa fa-bell mr-2"></i> 消息中心
      </CommonButton>
    </div>

    <!-- 快捷操作区域 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
      <div class="flex justify-between items-center mb-6">
        <h3 class="font-medium text-lg">快捷设置</h3>
        <p class="text-gray-500 text-sm">常用功能快速访问</p>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          class="setting-card" 
          @click="goTo('Password')"
        >
          <div class="setting-icon bg-primary/10 text-primary">
            <i class="fa fa-lock"></i>
          </div>
          <span class="setting-text">修改密码</span>
        </div>
        
        <div 
          class="setting-card" 
          @click="goTo('Feedback')"
        >
          <div class="setting-icon bg-success/10 text-success">
            <i class="fa fa-edit"></i>
          </div>
          <span class="setting-text">意见反馈</span>
        </div>
        
        <div 
          class="setting-card" 
          @click="goTo('FAQ')"
        >
          <div class="setting-icon bg-warning/10 text-warning">
            <i class="fa fa-question-circle"></i>
          </div>
          <span class="setting-text">常见问题</span>
        </div>
        
        <div 
          class="setting-card" 
          @click="goTo('ContactInfo')"
        >
          <div class="setting-icon bg-info/10 text-info">
            <i class="fa fa-phone"></i>
          </div>
          <span class="setting-text">联系客服</span>
        </div>
      </div>
    </div>

    <!-- 个人信息表单 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div class="flex justify-between items-center mb-6">
        <h3 class="font-medium text-lg">个人信息设置</h3>
        <p class="text-gray-500 text-sm">更新您的个人资料</p>
      </div>
      
      <el-form :model="form" :rules="rules" ref="profileForm" label-width="100px" class="profile-form">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <el-form-item label="用户名" class="form-item-modern">
            <el-input v-model="form.name" placeholder="请输入用户名" />
          </el-form-item>
          
          <el-form-item label="手机号" prop="phone" class="form-item-modern">
            <el-input v-model="form.phone" placeholder="请输入手机号" />
          </el-form-item>
          
          <el-form-item label="邮箱" prop="email" class="form-item-modern">
            <el-input v-model="form.email" placeholder="请输入邮箱地址" />
          </el-form-item>
        </div>
        
        <el-form-item label="车牌号" class="form-item-modern">
          <div class="space-y-3">
            <div class="flex flex-wrap gap-2">
              <el-tag
                v-for="(plate, idx) in form.licensePlates"
                :key="plate"
                closable
                @close="removePlate(idx)"
                type="info"
                class="plate-tag"
              >
                {{ plate }}
              </el-tag>
            </div>
            <div class="flex gap-3 items-center">
              <el-input
                v-model="newPlate"
                placeholder="添加车牌号"
                style="width: 200px;"
                size="default"
                @keyup.enter="addPlate"
                maxlength="10"
              />
              <el-button type="primary" @click="addPlate" :disabled="!newPlate">
                <i class="fa fa-plus mr-1"></i> 添加
              </el-button>
            </div>
          </div>
        </el-form-item>
        
        <el-form-item class="form-item-modern">
          <el-button type="primary" @click="onSave" class="save-btn">
            <i class="fa fa-save mr-2"></i> 保存修改
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/api/index'
import { useRouter } from 'vue-router'
import CommonButton from '@/components/CommonButton.vue'

const form = ref({
  name: '',
  phone: '',
  email: '',
  licensePlates: []
})
const newPlate = ref('')

const rules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ]
}

const profileForm = ref(null)

// 假设消息数据可全局管理或本地存储
const messages = ref([
  { id: 1, read: false },
  { id: 2, read: false },
  { id: 3, read: true }
])
const unreadCount = ref(0)
const fetchUnreadCount = async () => {
      const res = await api.get('/api/messages')
  unreadCount.value = (res.data || []).filter(msg => !msg.is_read).length
}
onMounted(fetchUnreadCount)

const router = useRouter()
function goToMessages() {
  router.push({ name: 'UserMessages' })
}

function goTo(page) {
  // 路由 name 需与 router/index.js 保持一致
  // 修正映射
  const nameMap = {
    Password: 'UserPassword',
    Feedback: 'Feedback',
    FAQ: 'FAQ',
    ContactInfo: 'ContactInfo',
  }
  router.push({ name: nameMap[page] || page })
}

onMounted(async () => {
  // 假设有获取当前用户信息的API
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    if (userInfo) {
      form.value.name = userInfo.name
      form.value.phone = userInfo.phone
      form.value.email = userInfo.email
      form.value.licensePlates = userInfo.licensePlates || []
    }
  } catch (e) {}
})

function addPlate() {
  const plate = newPlate.value.trim().toUpperCase()
  if (!plate) return
  if (form.value.licensePlates.includes(plate)) {
    ElMessage.warning('该车牌已存在')
    return
  }
  // 简单车牌校验（可根据实际需求调整）
  if (!/^([\u4e00-\u9fa5][A-Z][A-Z0-9]{5,7})$/.test(plate)) {
    ElMessage.warning('请输入有效的车牌号')
    return
  }
  form.value.licensePlates.push(plate)
  newPlate.value = ''
}
function removePlate(idx) {
  form.value.licensePlates.splice(idx, 1)
}

const onSave = () => {
  profileForm.value.validate(async (valid) => {
    if (!valid) return
    try {
      // 假设有更新用户信息的API
      // await api.updateProfile(form.value)
      ElMessage.success('保存成功')
      // 更新本地缓存
      localStorage.setItem('userInfo', JSON.stringify(form.value))
    } catch (e) {
      ElMessage.error('保存失败')
    }
  })
}
</script>

<style scoped>
.setting-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 16px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 100px;
}

.setting-card:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.setting-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  font-size: 20px;
}

.setting-text {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  text-align: center;
  line-height: 1.2;
}

.form-item-modern {
  margin-bottom: 20px;
}

.form-item-modern :deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}

.form-item-modern :deep(.el-input__wrapper) {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  transition: all 0.3s ease;
}

.form-item-modern :deep(.el-input__wrapper:hover) {
  border-color: #cbd5e1;
}

.form-item-modern :deep(.el-input__wrapper.is-focus) {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.plate-tag {
  border-radius: 6px;
  font-weight: 500;
}

.save-btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.msg-btn {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.msg-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}
</style> 