<template>
  <el-container class="user-layout">
    <!-- 侧边栏 -->
    <el-aside width="240px" v-show="!isMobile" class="sidebar">
      <div class="sidebar-header">
        <div class="logo-container">
          <img src="/src/assets/logo.svg" alt="logo" class="logo" />
          <h3 class="logo-text">智慧停车</h3>
        </div>
      </div>
      
      <el-menu :default-active="$route.path" router class="user-menu">
        <el-menu-item index="/user" class="menu-item">
          <i class="fa fa-home menu-icon"></i>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/user/dashboard" class="menu-item">
          <i class="fa fa-tachometer menu-icon"></i>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/user/profile" class="menu-item">
          <i class="fa fa-user menu-icon"></i>
          <span>个人信息</span>
        </el-menu-item>
        <el-menu-item index="/user/chat" class="menu-item">
          <i class="fa fa-comments menu-icon"></i>
          <span>在线助手</span>
        </el-menu-item>
        <el-menu-item index="/user/plates" class="menu-item">
          <i class="fa fa-car menu-icon"></i>
          <span>车辆管理</span>
        </el-menu-item>
        <el-menu-item index="/user/parking" class="menu-item reservation-item">
          <i class="fa fa-calendar-plus menu-icon"></i>
          <span>预约停车</span>
        </el-menu-item>
        <el-menu-item index="/user/messages" class="menu-item">
          <i class="fa fa-bell menu-icon"></i>
          <span>消息中心</span>
        </el-menu-item>
        <el-menu-item index="/user/fee-standard" class="menu-item">
          <i class="fa fa-money menu-icon"></i>
          <span>收费标准</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <!-- 主容器 -->
    <el-container>
      <!-- 头部 -->
      <el-header height="64px" class="header">
        <div class="header-content">
          <div class="header-left">
            <h2 class="header-title">龙跃智慧停车场管理系统</h2>
            <p class="header-subtitle">用户端</p>
          </div>
          <div class="header-right">
            <el-dropdown class="user-dropdown">
              <div class="user-info">
                <div class="user-avatar">
                  <i class="fa fa-user"></i>
                </div>
                <div class="user-details">
                  <span class="user-name">{{ maskedPhone }}</span>
                  <span class="user-role">普通用户</span>
                </div>
                <i class="fa fa-chevron-down dropdown-icon"></i>
              </div>
              <template #dropdown>
                <el-dropdown-menu class="user-dropdown-menu">
                  <el-dropdown-item @click="handleLogout" class="dropdown-item">
                    <i class="fa fa-sign-out mr-2"></i> 退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>
      
      <!-- 主内容区 -->
      <el-main class="main-content">
        <router-view></router-view>
      </el-main>
    </el-container>
    
    <!-- 移动端底部导航 -->
    <BottomNavUser />
  </el-container>
</template>

<script>
import { useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import BottomNavUser from '@/components/BottomNavUser.vue'

export default {
  name: 'UserLayout',
  components: {
    BottomNavUser
  },
  setup() {
    const router = useRouter()
    const phone = ref('')
    const isMobile = ref(window.innerWidth < 600)
    
    onMounted(() => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'))
        if (userInfo && userInfo.phone) {
          phone.value = userInfo.phone
        }
      } catch (e) {}
      
      window.addEventListener('resize', () => {
        isMobile.value = window.innerWidth < 600
      })
    })
    
    const maskedPhone = computed(() => {
      if (!phone.value) return ''
      return phone.value.slice(0, 3) + '****' + phone.value.slice(-4)
    })
    
    const handleLogout = () => {
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('userType')
      router.push('/login')
    }
    
    return {
      phone,
      isMobile,
      maskedPhone,
      handleLogout
    }
  }
}
</script>

<style scoped>
.user-layout {
  height: 100vh;
  background: #f8fafc;
}

/* 侧边栏样式 */
.sidebar {
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  width: 32px;
  height: 32px;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #2563eb;
  margin: 0;
}

.user-menu {
  border: none;
  background: transparent;
}

.menu-item {
  margin: 4px 12px;
  border-radius: 8px;
  height: 48px;
  line-height: 48px;
  transition: all 0.3s ease;
}

.menu-item:hover {
  background: #f1f5f9;
  color: #2563eb;
}

.menu-item.is-active {
  background: #2563eb;
  color: #ffffff;
}

.menu-icon {
  margin-right: 12px;
  width: 16px;
  text-align: center;
}

/* 头部样式 */
.header {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 0 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.header-left {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  line-height: 1.2;
}

.header-subtitle {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
  margin-top: 2px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.user-info:hover {
  background: #f1f5f9;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 16px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  line-height: 1.2;
}

.user-role {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.2;
}

.dropdown-icon {
  font-size: 12px;
  color: #6b7280;
  transition: transform 0.3s ease;
}

.user-dropdown:hover .dropdown-icon {
  transform: rotate(180deg);
}

.user-dropdown-menu {
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.dropdown-item {
  padding: 12px 16px;
  font-size: 14px;
  color: #374151;
  transition: all 0.3s ease;
}

.dropdown-item:hover {
  background: #f1f5f9;
  color: #2563eb;
}

/* 主内容区样式 */
.main-content {
  background: #f8fafc;
  padding: 24px;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    padding: 0 16px;
  }
  
  .header-title {
    font-size: 18px;
  }
  
  .main-content {
    padding: 16px;
  }
  
  .user-info {
    padding: 6px 12px;
  }
  
  .user-avatar {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
}

/* 预约停车按钮特殊样式 */
.reservation-item {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  margin: 8px 16px;
  border-radius: 8px;
  border: none;
}

.reservation-item:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.reservation-item.is-active {
  background: linear-gradient(135deg, #047857 0%, #065f46 100%);
  color: #ffffff;
  border-right: 3px solid #10b981;
}
</style> 