<template>
  <div id="app" class="flex w-full h-screen overflow-hidden bg-gray-50">
    <!-- 侧边栏 -->
    <aside class="bg-white w-64 border-r border-gray-200 flex-shrink-0 hidden md:block transition-all duration-300" :class="{'-ml-64': isSidebarCollapsed}">
      <div class="p-5 border-b border-gray-200">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white">
            <i class="fa fa-car"></i>
          </div>
          <h1 class="text-lg font-semibold">龙跃智慧停车场</h1>
        </div>
      </div>
      
      <nav class="p-3">
        <p class="text-xs text-gray-400 uppercase px-4 py-2">主菜单</p>
        <router-link to="/admin/dashboard" class="sidebar-item" :class="{ active: $route.path === '/admin/dashboard' }">
          <i class="fa fa-tachometer"></i>
          <span>仪表盘</span>
        </router-link>
        <router-link to="/admin/users" class="sidebar-item" :class="{ active: $route.path === '/admin/users' }">
          <i class="fa fa-users"></i>
          <span>用户管理</span>
        </router-link>
        <router-link to="/admin/parking" class="sidebar-item" :class="{ active: $route.path === '/admin/parking' }">
          <i class="fa fa-car"></i>
          <span>停车场管理</span>
        </router-link>
        <router-link to="/admin/orders" class="sidebar-item" :class="{ active: $route.path === '/admin/orders' }">
          <i class="fa fa-shopping-cart"></i>
          <span>订单管理</span>
        </router-link>
        <router-link to="/admin/bills" class="sidebar-item" :class="{ active: $route.path === '/admin/bills' }">
          <i class="fa fa-credit-card"></i>
          <span>账单管理</span>
        </router-link>
        <router-link to="/admin/statistics" class="sidebar-item" :class="{ active: $route.path === '/admin/statistics' }">
          <i class="fa fa-bar-chart"></i>
          <span>数据统计</span>
        </router-link>
        
        <p class="text-xs text-gray-400 uppercase px-4 py-2 mt-4">系统设置</p>
        <router-link to="/admin/assistant" class="sidebar-item" :class="{ active: $route.path === '/admin/assistant' }">
          <i class="fa fa-comments"></i>
          <span>管理助手</span>
        </router-link>
        <router-link to="/admin/messages" class="sidebar-item" :class="{ active: $route.path === '/admin/messages' }">
          <i class="fa fa-envelope"></i>
          <span>消息管理</span>
        </router-link>
        <router-link to="/admin/system" class="sidebar-item" :class="{ active: $route.path === '/admin/system' }">
          <i class="fa fa-cog"></i>
          <span>系统配置</span>
        </router-link>
      </nav>
    </aside>
    
    <!-- 主内容区 -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- 顶部导航 -->
      <header class="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
        <div class="flex items-center gap-4">
          <button class="md:hidden text-gray-500" @click="isSidebarCollapsed = !isSidebarCollapsed">
            <i class="fa fa-bars text-xl"></i>
          </button>
          <div class="relative">
            <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input type="text" placeholder="搜索..." class="pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-64 text-sm">
          </div>
        </div>
        
        <div class="flex items-center gap-6">
          <button class="text-gray-500 hover:text-primary transition-colors relative">
            <i class="fa fa-bell text-xl"></i>
            <span class="absolute -top-1 -right-1 w-4 h-4 bg-danger rounded-full text-white text-xs flex items-center justify-center">3</span>
          </button>
                  <div class="flex items-center gap-3">
          <img src="https://picsum.photos/id/1005/40/40" alt="用户头像" class="w-8 h-8 rounded-full object-cover border border-gray-200">
          <div class="hidden md:block">
            <p class="text-sm font-medium">管理员</p>
            <p class="text-xs text-gray-500">系统管理员</p>
          </div>
          <el-dropdown @command="handleCommand">
            <span class="cursor-pointer">
              <i class="fa fa-angle-down text-gray-500"></i>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        </div>
      </header>
      
      <!-- 页面内容 -->
      <div class="flex-1 overflow-y-auto p-6 bg-gray-50">
        <router-view></router-view>
      </div>
    </main>
    
    <!-- 移动端底部导航 -->
    <BottomNavAdmin v-show="isMobile" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import BottomNavAdmin from '@/components/BottomNavAdmin.vue'

const router = useRouter()
const isMobile = ref(window.innerWidth < 600)
const isSidebarCollapsed = ref(false)

onMounted(() => {
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 600
  })
})

const handleCommand = (command) => {
  if (command === 'logout') {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('userType')
    router.push('/login')
  }
}
</script>

<style scoped>
/* Tailwind 配置 */
:root {
  --primary: #165DFF;
  --success: #00B42A;
  --warning: #FF7D00;
  --danger: #F53F3F;
  --info: #86909C;
  --light: #F2F3F5;
  --dark: #1D2129;
}

/* 自定义样式 */
.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #6B7280;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
  border-radius: 8px;
  margin: 2px 8px;
}

.sidebar-item:hover {
  background-color: rgba(22, 93, 255, 0.05);
  color: var(--primary);
}

.sidebar-item.active {
  background-color: rgba(22, 93, 255, 0.1);
  color: var(--primary);
  font-weight: 500;
  border-left: 4px solid var(--primary);
}

.stat-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
  border: 1px solid #E5E7EB;
  transition: box-shadow 0.3s;
}

.stat-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.table-row-hover {
  transition: background-color 0.2s;
}

.table-row-hover:hover {
  background-color: rgba(22, 93, 255, 0.05);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar-item {
    padding: 10px 12px;
    font-size: 14px;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}
</style> 