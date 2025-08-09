import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCnConfig from './utils/i18n'
import { setupGlobalErrorHandler } from './utils/errorHandler'
import './assets/theme.css'

// 创建应用实例
const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用 Element Plus，并配置全局选项
app.use(ElementPlus, {
  // 配置全局选项
  experimentalFeatures: {
    // 启用新版本的 API
    vueNext: true
  },
  // 配置中文语言包
  locale: zhCnConfig
})

// 注册路由
app.use(router)

// 设置全局错误处理
setupGlobalErrorHandler()

// 挂载应用
app.mount('#app') 