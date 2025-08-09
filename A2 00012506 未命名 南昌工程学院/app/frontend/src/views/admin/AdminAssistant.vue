<template>
  <div class="admin-assistant">
    <!-- 状态指示器 -->
    <header>
      <div class="status-indicator" :class="{ online: isOnline, offline: !isOnline }">
        <span class="dot"></span>
        {{ isOnline ? '管理助手在线' : '离线模式' }}
      </div>
    </header>

    <!-- 聊天状态信息 -->
    <div class="chat-info" v-if="hasHistory">
      <el-tag type="info" size="small">
        消息数量: {{ messages.length - 1 }}
      </el-tag>
      <el-tag type="success" size="small" class="ml-2">
        历史状态: 已保存
      </el-tag>
    </div>

    <!-- 快捷操作 -->
    <div class="quick-actions">
      <el-button
        v-for="action in quickActions"
        :key="action.id"
        class="pretty-btn"
        type="primary"
        size="small"
        @click="triggerAssistantAction(action.command)"
        :icon="action.icon"
        round
      >{{ action.label }}</el-button>
    </div>

    <!-- 消息流 -->
    <div class="message-flow" style="max-height:420px;overflow-y:auto;" @contextmenu.prevent="showContextMenu">
      <transition-group name="fade" tag="div">
        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          :class="['message-bubble', msg.role]"
        >
          <template v-if="msg.type === 'text'">
            <span v-if="msg.role === 'user'">管理员：</span>
            <span v-else>助手：</span>
            <span v-html="renderMarkdown(msg.content)" />
          </template>
          <template v-else-if="msg.type === 'image'">
            <span v-if="msg.role === 'user'">管理员：</span>
            <span v-else>助手：</span>
            <div class="image-message">
              <img :src="msg.content" :alt="msg.alt || '图片'" class="message-image" />
              <div v-if="msg.caption" class="image-caption">{{ msg.caption }}</div>
            </div>
          </template>
          <template v-else-if="msg.type === 'error'">
            <span class="error-msg">⚠️ {{ msg.content }}</span>
          </template>
        </div>
        <div v-if="loading" key="loading" class="message-bubble assistant loading">
          <span class="dot-pulse"></span> 思考中...
        </div>
      </transition-group>
    </div>

    <!-- 输入区 -->
    <div class="input-controller">
      <el-input
        v-model="input"
        placeholder="请输入您的问题..."
        @keyup.enter="sendMessage"
        :disabled="loading"
        clearable
      />
      <el-button
        class="pretty-btn"
        type="primary"
        :disabled="loading || !input.trim()"
        @click="sendMessage"
        icon="el-icon-s-promotion"
      >发送</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { chatWithDeepSeek } from '@/api/chat'
import { Message, DataAnalysis, User, Money } from '@element-plus/icons-vue'
import { marked } from 'marked'
import { getToken } from '@/utils/auth'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { generateLayoutHtml, generateZoneStatusReply, isLayoutQuery, isZoneStatusQuery } from '@/utils/parkingLayoutInfo'
import { getParkingStats } from '@/api/parking'

const router = useRouter()
const isOnline = ref(true)
const input = ref('')
const loading = ref(false)

// 聊天历史持久化相关
const CHAT_HISTORY_KEY = 'admin_chat_history'
const hasHistory = ref(false)

const messages = ref([
  {
    role: 'assistant',
    type: 'text',
    content: `您好！我是管理助手，可以帮您：<br>
      1. 查询停车场每日收入 💰<br>
      2. 查看停车场使用情况 📊<br>
      3. 分析用户信息和行为 👥<br>
      4. 生成管理报表和统计 📈<br>
      5. 实时监控车位状态 🅿️<br>
      请问需要什么帮助？`
  }
])

// 实时停车场数据
const parkingData = ref(null)

// 聊天历史管理函数
const saveChatHistory = () => {
  try {
    const token = getToken()
    if (!token) return
    
    const historyKey = `${CHAT_HISTORY_KEY}_${token}`
    const historyData = {
      messages: messages.value,
      timestamp: Date.now()
    }
    localStorage.setItem(historyKey, JSON.stringify(historyData))
    hasHistory.value = messages.value.length > 1
  } catch (error) {
    console.error('保存聊天历史失败:', error)
  }
}

const loadChatHistory = () => {
  try {
    const token = getToken()
    if (!token) return
    
    const historyKey = `${CHAT_HISTORY_KEY}_${token}`
    const savedHistory = localStorage.getItem(historyKey)
    
    if (savedHistory) {
      const historyData = JSON.parse(savedHistory)
      // 只加载消息，保留初始欢迎消息
      const savedMessages = historyData.messages.filter(msg => msg.role !== 'assistant' || msg.content !== messages.value[0].content)
      if (savedMessages.length > 0) {
        messages.value = [messages.value[0], ...savedMessages]
        hasHistory.value = true
        ElMessage.success('已恢复聊天历史')
      }
    }
  } catch (error) {
    console.error('加载聊天历史失败:', error)
  }
}

const clearChatHistory = () => {
  try {
    const token = getToken()
    if (!token) return
    
    const historyKey = `${CHAT_HISTORY_KEY}_${token}`
    localStorage.removeItem(historyKey)
    messages.value = [messages.value[0]] // 保留初始欢迎消息
    hasHistory.value = false
    ElMessage.success('聊天记录已清除')
  } catch (error) {
    console.error('清除聊天历史失败:', error)
  }
}

const exportChatHistory = () => {
  try {
    const chatText = messages.value
      .filter(msg => msg.type === 'text')
      .map(msg => `${msg.role === 'user' ? '管理员' : '助手'}: ${msg.content}`)
      .join('\n\n')
    
    const blob = new Blob([chatText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `管理助手对话记录_${new Date().toLocaleDateString()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('聊天记录已导出')
  } catch (error) {
    console.error('导出聊天历史失败:', error)
    ElMessage.error('导出失败')
  }
}

// 获取实时停车场数据
async function fetchParkingData() {
  try {
    const token = getToken()
    if (!token) {
      ElMessage.error('请先登录')
      router.push('/login')
      return
    }
    
    // 使用真实的停车场统计数据API
    const response = await getParkingStats()
    if (response && response.success) {
      parkingData.value = response.data
    } else {
      console.error('获取停车场数据失败：API返回失败')
      parkingData.value = null
    }
  } catch (error) {
    console.error('获取停车场数据失败:', error)
    parkingData.value = null
  }
}

// 组件挂载时获取数据和加载历史
onMounted(() => {
  // 检查登录状态
  const token = getToken()
  if (!token) {
    ElMessage.error('请先登录')
    router.push('/login')
    return
  }
  
  fetchParkingData()
  loadChatHistory()
})

// 监听消息变化，自动保存历史
watch(messages, () => {
  saveChatHistory()
}, { deep: true })

// 组件卸载时保存历史
onUnmounted(() => {
  saveChatHistory()
})

const quickActions = [
  { id: 1, icon: Money, label: '今日收入', command: '查询今日停车场收入情况' },
  { id: 2, icon: DataAnalysis, label: '使用统计', command: '显示停车场使用率统计' },
  { id: 3, icon: User, label: '用户分析', command: '分析用户信息和活跃度' },
  { id: 4, icon: Message, label: '生成报表', command: '生成今日管理报表' },
  { id: 5, icon: Message, label: '布局图', command: '查看停车场布局图' },
  { id: 6, icon: 'Delete', label: '清除记录', command: 'clear_history' }
]

function triggerAssistantAction(command) {
  if (command === 'clear_history') {
    clearChatHistory()
    return
  }
  input.value = command
  sendMessage()
}

function renderMarkdown(md) {
  return marked.parse(md)
}

async function sendMessage() {
  if (!input.value.trim()) return
  
  // 检查登录状态
  const token = getToken()
  if (!token) {
    ElMessage.error('请先登录')
    router.push('/login')
    return
  }
  
  messages.value.push({ role: 'user', type: 'text', content: input.value })
  loading.value = true
  try {
    // 先刷新实时数据
    await fetchParkingData()
    
    // 检查是否为布局图查询
    if (isLayoutQuery(input.value)) {
      messages.value.push({ 
        role: 'assistant', 
        type: 'image', 
        content: '/src/assets/images/bujutu.png',
        alt: '龙跃园区停车场布局图',
        caption: '🗺️ 龙跃园区停车场布局图 - 包含A、B、C、D、E、F六个区域及新能源充电区域'
      })
      isOnline.value = true
    } else if (isZoneStatusQuery(input.value)) {
      // 处理区域状态查询
      if (parkingData.value && parkingData.value.zone_stats) {
        const zoneStatusReply = generateZoneStatusReply(parkingData.value.zone_stats)
        messages.value.push({ role: 'assistant', type: 'text', content: zoneStatusReply })
      } else {
        messages.value.push({ 
          role: 'assistant', 
          type: 'text', 
          content: "抱歉，暂时无法获取实时车位状态信息，请稍后再试。" 
        })
      }
      isOnline.value = true
    } else {
      const reply = await chatWithDeepSeek(messages.value.map(m => ({
        role: m.role,
        content: m.content
      })), 'admin')
      messages.value.push({ role: 'assistant', type: 'text', content: reply })
      isOnline.value = true
    }
    await nextTick()
    scrollToBottom()
  } catch (e) {
    if (e.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      router.push('/login')
      return
    }
    messages.value.push({ role: 'assistant', type: 'error', content: '对话出错，请稍后再试。' })
    isOnline.value = false
  }
  input.value = ''
  loading.value = false
}

function scrollToBottom() {
  const el = document.querySelector('.message-flow')
  if (el) el.scrollTop = el.scrollHeight
}

// 右键菜单
function showContextMenu(event) {
  event.preventDefault()
  
  // 创建右键菜单
  const menu = document.createElement('div')
  menu.className = 'context-menu'
  menu.innerHTML = `
    <div class="menu-item" onclick="window.clearAdminChatHistory()">清除聊天记录</div>
    <div class="menu-item" onclick="window.exportAdminChatHistory()">导出聊天记录</div>
  `
  
  // 设置菜单位置
  menu.style.position = 'fixed'
  menu.style.left = event.clientX + 'px'
  menu.style.top = event.clientY + 'px'
  menu.style.zIndex = '9999'
  
  // 添加到页面
  document.body.appendChild(menu)
  
  // 点击其他地方关闭菜单
  const closeMenu = () => {
    document.body.removeChild(menu)
    document.removeEventListener('click', closeMenu)
  }
  document.addEventListener('click', closeMenu)
}

// 绑定到window对象
window.clearAdminChatHistory = clearChatHistory
window.exportAdminChatHistory = exportChatHistory
</script>

<style scoped>
.admin-assistant {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 80px);
  height: 100%;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  background: #f5f7fa;
  border-radius: 16px;
  box-shadow: 0 2px 12px #0001;
  padding: 24px 24px 12px 24px;
  box-sizing: border-box;
}

header {
  margin-bottom: 12px;
}

.status-indicator {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 15px;
  margin-bottom: 8px;
}

.status-indicator .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
  background: #43a047;
  animation: pulse 1.2s infinite;
}

.status-indicator.offline .dot {
  background: #e53935;
  animation: none;
}

/* 聊天信息 */
.chat-info {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 右键菜单 */
.context-menu {
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  min-width: 120px;
}

.menu-item {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: #f5f5f5;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 #43a04755; }
  70% { box-shadow: 0 0 0 8px #43a04700; }
  100% { box-shadow: 0 0 0 0 #43a04700; }
}

.quick-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.message-flow {
  flex: 1 1 0;
  min-height: 220px;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px #0001;
  max-height: 60vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.message-bubble {
  margin-bottom: 10px;
  padding: 8px 14px;
  border-radius: 16px;
  max-width: 90%;
  word-break: break-all;
  line-height: 1.7;
  transition: all 0.2s;
}

.message-bubble.user {
  background: #e3f2fd;
  color: #1976d2;
  align-self: flex-end;
  margin-left: auto;
  text-align: right;
}

.message-bubble.assistant {
  background: #fff;
  color: #333;
  align-self: flex-start;
  margin-right: auto;
  box-shadow: 0 1px 4px #0001;
}

.message-bubble.error-msg {
  color: #e53935;
  font-weight: bold;
}

.input-controller {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 8px;
  width: 100%;
}

.loading .dot-pulse {
  display: inline-block;
  width: 24px;
  height: 8px;
  position: relative;
}

.loading .dot-pulse:before, .loading .dot-pulse:after {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  background: #43a047;
  border-radius: 50%;
  position: absolute;
  animation: dotPulse 1s infinite alternate;
}

.loading .dot-pulse:after {
  left: 12px;
  animation-delay: 0.5s;
}

@keyframes dotPulse {
  0% { opacity: 0.3; }
  100% { opacity: 1; }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 900px) {
  .admin-assistant {
    max-width: 100vw;
    padding: 8px 2vw 8px 2vw;
    border-radius: 0;
    box-shadow: none;
  }
  .message-flow {
    max-height: 50vh;
    padding: 8px;
  }
}

@media (max-width: 600px) {
  .admin-assistant {
    min-height: 100vh;
    padding: 0;
  }
  .quick-actions {
    gap: 6px;
    margin-bottom: 8px;
  }
  .input-controller {
    flex-direction: column;
    gap: 6px;
  }
  .message-bubble {
    font-size: 15px;
    padding: 6px 8px;
  }
}

/* 停车场布局信息样式 */
.parking-layout-info {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin: 10px 0;
  border: 1px solid #e9ecef;
}

.parking-layout-info h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 600;
}

.layout-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.summary-item .label {
  font-weight: 500;
  color: #495057;
}

.summary-item .value {
  font-weight: 600;
  color: #007bff;
}

.zones-detail h4 {
  color: #2c3e50;
  margin: 20px 0 15px 0;
  font-size: 16px;
  font-weight: 600;
}

.zone-item {
  background: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 12px;
  border: 1px solid #dee2e6;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.zone-item.special {
  border-left: 4px solid #28a745;
  background: linear-gradient(135deg, #f8fff9 0%, #ffffff 100%);
}

.zone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e9ecef;
}

.zone-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 16px;
}

.zone-type {
  background: #007bff;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.zone-info p {
  margin: 5px 0;
  color: #495057;
  font-size: 14px;
  line-height: 1.4;
}

.entrance-info, .layout-features {
  background: white;
  border-radius: 8px;
  padding: 15px;
  margin: 15px 0;
  border: 1px solid #dee2e6;
}

.entrance-info h4, .layout-features h4 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 600;
}

.entrance-info p, .layout-features ul {
  color: #495057;
  font-size: 14px;
  line-height: 1.5;
}

.layout-features ul {
  margin: 0;
  padding-left: 20px;
}

.layout-features li {
  margin: 5px 0;
}

/* 区域状态信息样式 */
.zone-status-info {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin: 10px 0;
  border: 1px solid #e9ecef;
}

.zone-status-info h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 600;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.status-item {
  background: white;
  border-radius: 8px;
  padding: 15px;
  border: 1px solid #dee2e6;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.status-item .zone-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 16px;
  margin-bottom: 10px;
}

.status-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
}

.status-details span {
  font-size: 14px;
  color: #495057;
}

.status-details .available {
  color: #28a745;
  font-weight: 500;
}

.status-details .occupied {
  color: #dc3545;
  font-weight: 500;
}

.status-details .total {
  color: #6c757d;
  font-weight: 500;
}

.percentage {
  font-weight: 600;
  color: #007bff;
  font-size: 14px;
}

/* 图片消息样式 */
.image-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px 0;
}

.message-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 2px solid #e9ecef;
  object-fit: contain;
}

.image-caption {
  margin-top: 8px;
  font-size: 14px;
  color: #6c757d;
  text-align: center;
  font-style: italic;
}
</style> 