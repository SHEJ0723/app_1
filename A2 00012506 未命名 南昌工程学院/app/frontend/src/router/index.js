import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/ForgotPassword.vue'),
    meta: { requiresAuth: false }
  },

  {
    path: '/admin',
    name: 'AdminLayout',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'AdminHome',
        component: () => import('../views/admin/AdminHome.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/admin/AdminDashboard.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'parking',
        name: 'AdminParkingManagement',
        component: () => import('../views/admin/AdminParkingManagement.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'users',
        name: 'AdminUserManagement',
        component: () => import('../views/admin/AdminUserManagement.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('../views/admin/AdminOrders.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'bills',
        name: 'AdminBills',
        component: () => import('../views/admin/AdminBills.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'finance',
        name: 'AdminFinance',
        component: () => import('../views/admin/AdminFinance.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'statistics',
        name: 'AdminStatistics',
        component: () => import('../views/admin/AdminStatistics.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'system',
        name: 'AdminSystem',
        component: () => import('../views/admin/AdminSystem.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'assistant',
        name: 'AdminAssistant',
        component: () => import('../views/admin/AdminAssistant.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'messages',
        name: 'AdminMessages',
        component: () => import('../views/admin/AdminMessages.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'messages/sent',
        name: 'AdminMessagesSent',
        component: () => import('../views/admin/AdminMessagesSent.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'feedbacks',
        name: 'AdminFeedbacks',
        component: () => import('../views/admin/AdminFeedbacks.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      }
    ]
  },
  {
    path: '/user',
    name: 'UserLayout',
    component: () => import('../layouts/UserLayout.vue'),
    meta: { requiresAuth: true, requiresUser: true },
    children: [
      {
        path: '',
        name: 'UserHome',
        component: () => import('../views/user/Home.vue'),
        meta: { requiresAuth: true, requiresUser: true }
      },
      {
        path: 'dashboard',
        name: 'UserDashboard',
        component: () => import('../views/user/Dashboard.vue'),
        meta: { requiresAuth: true, requiresUser: true }
      },
      {
        path: 'parking',
        name: 'ParkingReservation',
        component: () => import('../views/user/ParkingReservation.vue'),
        meta: { requiresAuth: true, requiresUser: true }
      },
      {
        path: 'status',
        name: 'ParkingStatus',
        component: () => import('../views/user/ParkingStatus.vue'),
        meta: { requiresAuth: true, requiresUser: true }
      },
      {
        path: 'orders',
        name: 'UserOrders',
        component: () => import('../views/user/Orders.vue'),
        meta: { requiresAuth: true, requiresUser: true }
      },
      {
        path: 'bills',
        name: 'UserBills',
        component: () => import('../views/user/Bills.vue'),
        meta: { requiresAuth: true, requiresUser: true }
      },
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('../views/user/Profile.vue'),
        meta: { requiresAuth: true, requiresUser: true }
      },
      {
        path: 'chat',
        name: 'UserChat',
        component: () => import('../views/user/Chat.vue'),
        meta: { requiresAuth: true, requiresUser: true }
      },
      {
        path: 'find-car',
        name: 'FindCar',
        component: () => import('../views/user/FindCar.vue'),
        meta: { requiresAuth: true, requiresUser: true }
      },
      {
        path: 'auto-pay',
        name: 'AutoPay',
        component: () => import('../views/user/AutoPay.vue'),
        meta: { requiresAuth: true, requiresUser: true }
      },
      {
        path: 'map',
        name: 'ParkingMap',
        component: () => import('../views/user/ParkingMap.vue'),
        meta: { requiresAuth: true, requiresUser: true }
      },
      {
        path: 'plates',
        name: 'PlateManagement',
        component: () => import('../views/user/PlateManagement.vue'),
        meta: { requiresAuth: true, requiresUser: true }
      },
      {
        path: 'fee-standard',
        name: 'UserFeeStandard',
        component: () => import('../views/user/FeeStandard.vue'),
        meta: { requiresAuth: true, requiresUser: true }
      },
      {
        path: 'messages',
        name: 'UserMessages',
        component: () => import('../views/user/Messages.vue'),
        meta: { requiresAuth: true, requiresUser: true }
      },
      {
        path: 'password',
        name: 'UserPassword',
        component: () => import('../views/user/Password.vue'),
        meta: { requiresAuth: true, requiresUser: true }
      },
      {
        path: 'feedback',
        name: 'Feedback',
        component: () => import('../views/user/Feedback.vue'),
        meta: { requiresAuth: true, requiresUser: true }
      },
      {
        path: 'feedback-history',
        name: 'FeedbackHistory',
        component: () => import('../views/user/FeedbackHistory.vue'),
        meta: { requiresAuth: true, requiresUser: true }
      },
      {
        path: 'faq',
        name: 'FAQ',
        component: () => import('../views/user/FAQ.vue'),
        meta: { requiresAuth: true, requiresUser: true }
      },
      {
        path: 'contact',
        name: 'ContactInfo',
        component: () => import('../views/user/ContactInfo.vue'),
        meta: { requiresAuth: true, requiresUser: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

import { getToken, removeToken } from '@/utils/auth'

// 路由导航守卫
router.beforeEach(async (to, from, next) => {
  // 不需要认证的路由直接通过
  if (!to.meta.requiresAuth) {
    const token = getToken()
    const userType = localStorage.getItem('userType')
    // 如果已登录且访问登录页，重定向到对应的首页
    if (token && userType && (to.path === '/login' || to.path === '/register')) {
      next(userType === 'admin' ? '/admin' : '/user')
    } else {
      next()
    }
    return
  }

  // 需要认证的路由处理
  try {
    const token = getToken()
    const userType = localStorage.getItem('userType')
    
    // 验证token有效性
    if (!token) {
      removeToken()
      next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
      return
    }

    // 检查用户类型
    if (!userType) {
      // 可以在这里添加获取用户信息的逻辑
    }

    // 检查管理员权限
    if (to.meta.requiresAdmin && userType !== 'admin') {
      next(userType === 'user' ? '/user' : '/login')
      return
    }

    // 检查用户权限
    if (to.meta.requiresUser && userType !== 'user') {
      next(userType === 'admin' ? '/admin' : '/login')
      return
    }

    next()
  } catch (error) {
    console.error('路由守卫错误:', error)
    removeToken()
    next('/login')
  }
})

export default router 