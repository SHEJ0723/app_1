<template>
  <div class="parking-assistant">
    <!-- 状态指示器 -->
    <header>
      <div class="status-indicator" :class="{ online: isOnline, offline: !isOnline }">
        <span class="dot"></span>
        {{ isOnline ? '在线服务中' : '离线模式' }}
      </div>
      <div class="chat-info">
        <span class="message-count">{{ messages.length }} 条消息</span>
        <span class="history-status" v-if="hasHistory">已保存历史记录</span>
      </div>
    </header>

    <!-- 快捷操作 -->
    <div class="quick-actions">
      <el-button
        v-for="action in quickActions"
        :key="action.id"
        type="primary"
        size="small"
        @click="triggerAssistantAction(action.command)"
        :icon="action.icon"
        round
      >{{ action.label }}</el-button>
      <el-button
        type="info"
        size="small"
        @click="checkLoginStatus"
        round
      >检查登录</el-button>
    </div>

    <!-- 消息流 -->
    <div class="message-flow" @contextmenu.prevent="showContextMenu">
      <transition-group name="fade" tag="div">
        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          :class="['message-bubble', msg.role]"
        >
          <template v-if="msg.type === 'text'">
            <span v-if="msg.role === 'user'">我：</span>
            <span v-else>助手：</span>
            <span v-html="msg.content"></span>
          </template>
          <template v-else-if="msg.type === 'image'">
            <span v-if="msg.role === 'user'">我：</span>
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
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { chatWithDeepSeek } from '@/api/chat'
import { getParkingSpots } from '@/api/parking'
import { Message } from '@element-plus/icons-vue'
import { getToken } from '@/utils/auth'
import { generateLayoutHtml, generateZoneStatusReply, isLayoutQuery, isZoneStatusQuery } from '@/utils/parkingLayoutInfo'
import { getParkingStats } from '@/api/parking'

const router = useRouter()
const isOnline = ref(true)
const input = ref('')
const loading = ref(false)
const messages = ref([
  {
    role: 'assistant',
    type: 'text',
    content: `<div class="welcome-message">
      <h3>👋 您好！我是智慧停车助手</h3>
      <p>我可以为您提供以下服务：</p>
      <div class="service-list">
        <div class="service-item">
          <span class="service-icon">🅿️</span>
          <span>实时查询车位状态</span>
        </div>
        <div class="service-item">
          <span class="service-icon">⏰</span>
          <span>预约停车位</span>
        </div>
        <div class="service-item">
          <span class="service-icon">🗺️</span>
          <span>导航至空闲车位</span>
        </div>
        <div class="service-item">
          <span class="service-icon">📊</span>
          <span>查看实时停车场数据</span>
        </div>
      </div>
      <p class="help-text">请问需要什么帮助？</p>
    </div>`
  }
])

// 实时停车场数据
const parkingData = ref(null)
// 用户车牌信息
const userPlatesData = ref(null)
// 是否有历史记录
const hasHistory = ref(false)

// 聊天历史记录管理
const CHAT_HISTORY_KEY = 'chat_history'

// 保存聊天记录到本地存储
function saveChatHistory() {
  try {
    const token = getToken()
    if (token) {
      const historyKey = `${CHAT_HISTORY_KEY}_${token}`
      localStorage.setItem(historyKey, JSON.stringify(messages.value))
    }
  } catch (error) {
    console.error('保存聊天记录失败:', error)
  }
}

// 从本地存储加载聊天记录
function loadChatHistory() {
  try {
    const token = getToken()
    if (token) {
      const historyKey = `${CHAT_HISTORY_KEY}_${token}`
      const savedHistory = localStorage.getItem(historyKey)
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory)
        // 只保留最近的50条消息，避免存储过大
        if (parsedHistory.length > 50) {
          parsedHistory.splice(0, parsedHistory.length - 50)
        }
        messages.value = parsedHistory
        hasHistory.value = true
        return true
      }
    }
  } catch (error) {
    console.error('加载聊天记录失败:', error)
  }
  hasHistory.value = false
  return false
}

// 清除聊天记录
function clearChatHistory() {
  try {
    const token = getToken()
    if (token) {
      const historyKey = `${CHAT_HISTORY_KEY}_${token}`
      localStorage.removeItem(historyKey)
    }
    // 重置为初始欢迎消息
    messages.value = [
      {
        role: 'assistant',
        type: 'text',
        content: `<div class="welcome-message">
          <h3>👋 您好！我是智慧停车助手</h3>
          <p>我可以为您提供以下服务：</p>
          <div class="service-list">
            <div class="service-item">
              <span class="service-icon">🅿️</span>
              <span>实时查询车位状态</span>
            </div>
            <div class="service-item">
              <span class="service-icon">⏰</span>
              <span>预约停车位</span>
            </div>
            <div class="service-item">
              <span class="service-icon">🗺️</span>
              <span>导航至空闲车位</span>
            </div>
            <div class="service-item">
              <span class="service-icon">📊</span>
              <span>查看实时停车场数据</span>
            </div>
          </div>
          <p class="help-text">请问需要什么帮助？</p>
        </div>`
      }
    ]
  } catch (error) {
    console.error('清除聊天记录失败:', error)
  }
}

// 获取实时停车场数据
async function fetchParkingData() {
  try {
    const token = getToken()
    if (!token) {
      console.error('未登录，无法获取停车场数据')
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

// 获取用户车牌信息
async function fetchUserPlates() {
  try {
    const token = getToken()
    if (!token) {
      console.error('未登录，无法获取用户车牌信息')
      return
    }
    
    const response = await fetch('/api/chat/user-plates', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        ElMessage.error('登录已过期，请重新登录')
        router.push('/login')
        return
      }
      throw new Error(`请求失败: ${response.status}`)
    }
    
    const result = await response.json()
    if (result.success) {
      userPlatesData.value = result.data
    }
  } catch (error) {
    console.error('获取用户车牌信息失败:', error)
  }
}

// 组件挂载时获取数据
onMounted(() => {
  // 检查登录状态
  const token = getToken()
  if (!token) {
    ElMessage.error('请先登录')
    router.push('/login')
    return
  }
  
  // 加载聊天历史记录
  const hasHistory = loadChatHistory()
  if (!hasHistory) {
    // 如果没有历史记录，使用默认欢迎消息
    messages.value = [
      {
        role: 'assistant',
        type: 'text',
        content: `<div class="welcome-message">
          <h3>👋 您好！我是智慧停车助手</h3>
          <p>我可以为您提供以下服务：</p>
          <div class="service-list">
            <div class="service-item">
              <span class="service-icon">🅿️</span>
              <span>实时查询车位状态</span>
            </div>
            <div class="service-item">
              <span class="service-icon">⏰</span>
              <span>预约停车位</span>
            </div>
            <div class="service-item">
              <span class="service-icon">🗺️</span>
              <span>导航至空闲车位</span>
            </div>
            <div class="service-item">
              <span class="service-icon">📊</span>
              <span>查看实时停车场数据</span>
            </div>
          </div>
          <p class="help-text">请问需要什么帮助？</p>
        </div>`
      }
    ]
  }
  
  fetchParkingData()
  fetchUserPlates()
})

// 监听消息变化，自动保存聊天记录
watch(messages, () => {
  saveChatHistory()
}, { deep: true })

// 组件卸载时保存聊天记录
onUnmounted(() => {
  saveChatHistory()
})

// 将函数绑定到window对象，供右键菜单使用
window.clearChatHistory = clearChatHistory
window.exportChatHistory = exportChatHistory

const quickActions = [
  { id: 1, icon: Message, label: '查车位', command: '显示当前空闲车位' },
  { id: 2, icon: Message, label: '预约', command: '我要预约停车位' },
  { id: 3, icon: Message, label: '车牌', command: '查看我的车牌信息' },
  { id: 4, icon: Message, label: '收费', command: '查看收费标准' },
  { id: 5, icon: Message, label: '布局图', command: '查看停车场布局图' },
  { id: 6, icon: Message, label: '清除记录', command: 'clear_history' }
]

function triggerAssistantAction(command) {
  if (command === 'clear_history') {
    // 清除聊天记录
    ElMessage.success('聊天记录已清除')
    clearChatHistory()
    return
  }
  
  input.value = command
  sendMessage()
}

// 关键词匹配，判断是否为车位空闲/分布相关问题
function isParkingQuery(text) {
  const keywords = [
    '空闲车位', '车位空闲', '剩余车位', '可用车位', '停车位分布', '车位分布', '停车场分布', '各区车位', 'A区', 'B区', 'C区', 'D区', 'E区', 'F区', '停车场状态', '车位状态'
  ]
  return keywords.some(k => text.includes(k))
}

// 关键词匹配，判断是否为车牌相关问题
function isPlateQuery(text) {
  const keywords = [
    '车牌', '我的车牌', '绑定车牌', '车牌信息', '车牌号', '车牌号码'
  ]
  return keywords.some(k => text.includes(k))
}

// 替换助手初始消息和收费相关回复为统一标准
const feeTableHtml = `
<div class="fee-table-container">
  <h3>💰 停车场收费标准</h3>
  <div class="fee-table">
    <div class="fee-header">
      <div class="fee-cell header">车辆类型</div>
      <div class="fee-cell header">路内停车场</div>
      <div class="fee-cell header">路外地面停车场</div>
      <div class="fee-cell header">地下停车场</div>
    </div>
    
    <div class="fee-row">
      <div class="fee-cell type">小型车</div>
      <div class="fee-cell">
        <div class="fee-item">首30分钟免费</div>
        <div class="fee-item">白天(8:00-20:00)：首小时3元，后每半小时1元</div>
        <div class="fee-item">夜间(20:00-8:00)：每小时1元，夜间最高5元</div>
        <div class="fee-item">24小时最高15元</div>
        <div class="fee-item highlight">包月200元/辆</div>
      </div>
      <div class="fee-cell">
        <div class="fee-item">首1小时免费</div>
        <div class="fee-item">4小时内5元，4-8小时10元，24小时15元</div>
        <div class="fee-item highlight">包月180元/辆</div>
      </div>
      <div class="fee-cell">
        <div class="fee-item">首2小时免费</div>
        <div class="fee-item">4小时内4元，4-8小时8元，24小时12元</div>
        <div class="fee-item highlight">包月150元/辆</div>
      </div>
    </div>
    
    <div class="fee-row">
      <div class="fee-cell type">大型车</div>
      <div class="fee-cell">
        <div class="fee-item">首30分钟免费</div>
        <div class="fee-item">白天(8:00-20:00)：首小时4元，后每半小时2元</div>
        <div class="fee-item">夜间(20:00-8:00)：每小时2元，夜间最高8元</div>
        <div class="fee-item">24小时最高25元</div>
        <div class="fee-item highlight">包月300元/辆</div>
      </div>
      <div class="fee-cell">
        <div class="fee-item">首1小时免费</div>
        <div class="fee-item">4小时内7元，4-8小时14元，24小时20元</div>
        <div class="fee-item highlight">包月250元/辆</div>
      </div>
      <div class="fee-cell">
        <div class="fee-item">首2小时免费</div>
        <div class="fee-item">4小时内6元，4-8小时12元，24小时18元</div>
        <div class="fee-item highlight">包月220元/辆</div>
      </div>
    </div>
    
    <div class="fee-row">
      <div class="fee-cell type">新能源汽车</div>
      <div class="fee-cell">
        <div class="fee-item">当日首次2小时内免费(含充电)</div>
        <div class="fee-item">白天首小时2元，后每半小时1元</div>
        <div class="fee-item">夜间每小时1元</div>
        <div class="fee-item">24小时最高12元</div>
        <div class="fee-item highlight">包月150元/辆</div>
      </div>
      <div class="fee-cell">
        <div class="fee-item">首2小时免费</div>
        <div class="fee-item">4小时内4元，4-8小时8元，24小时12元</div>
        <div class="fee-item highlight">包月120元/辆</div>
      </div>
      <div class="fee-cell">
        <div class="fee-item">首2小时免费</div>
        <div class="fee-item">4小时内3元，4-8小时6元，24小时10元</div>
        <div class="fee-item highlight">包月100元/辆</div>
      </div>
    </div>
  </div>
</div>`;

// 在sendMessage中，若用户问题包含“收费标准”，直接回复feeTableHtml
function isFeeQuery(text) {
  return text.includes('收费标准') || text.includes('停车收费') || text.includes('停车费')
}

async function sendMessage() {
  if (!input.value.trim()) return
  
  // 检查登录状态
  const token = getToken()
  if (!token) {
    ElMessage.error('登录已过期，请重新登录')
    router.push('/login')
    return
  }
  
  messages.value.push({ role: 'user', type: 'text', content: input.value })
  loading.value = true
  try {
    // 先刷新实时数据
    await fetchParkingData()
    await fetchUserPlates()
    
    if (isFeeQuery(input.value)) {
      messages.value.push({ role: 'assistant', type: 'text', content: feeTableHtml })
      isOnline.value = true
    } else if (isLayoutQuery(input.value)) {
      // 处理停车场布局图查询 - 直接显示图片
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
    } else if (isPlateQuery(input.value)) {
      // 处理车牌信息查询
      if (userPlatesData.value && userPlatesData.value.license_plates) {
        const plates = userPlatesData.value.license_plates
        if (plates.length > 0) {
          let reply = `<div class="plate-info">
            <h3>🚗 您的车牌信息</h3>
            <div class="plate-list">`
          
          plates.forEach((plate, index) => {
            const defaultMark = plate.is_default ? ' (默认)' : ''
            reply += `
              <div class="plate-item ${plate.is_default ? 'default' : ''}">
                <div class="plate-number">${plate.plate_number}</div>
                <div class="plate-status">${defaultMark}</div>
              </div>`
          })
          
          reply += `
            </div>
            <div class="plate-tip">
              <p>💡 提示：预约车位时会使用您的默认车牌，如需更换请前往车牌管理页面设置。</p>
            </div>
          </div>`
          
          messages.value.push({ role: 'assistant', type: 'text', content: reply })
        } else {
          messages.value.push({ 
            role: 'assistant', 
            type: 'text', 
            content: `<div class="no-plate-warning">
              <div class="warning-icon">⚠️</div>
              <h3>您还没有绑定车牌</h3>
              <p>请先前往"车牌管理"页面绑定车牌，然后才能预约车位。</p>
              <div class="action-buttons">
                <button class="action-btn primary" onclick="window.location.href='/user/plates'">
                  前往车牌管理
                </button>
              </div>
            </div>` 
          })
        }
              } else {
          messages.value.push({ 
            role: 'assistant', 
            type: 'error', 
            content: `<div class="error-message">
              <div class="error-icon">❌</div>
              <h3>获取车牌信息失败</h3>
              <p>请稍后再试或联系客服</p>
            </div>` 
          })
        }
      isOnline.value = true
    } else if (isParkingQuery(input.value)) {
      // 使用实时数据
      if (parkingData.value) {
        let reply = `<div class="parking-stats">
          <h3>📊 实时停车场数据</h3>
          
          <div class="stats-overview">
            <div class="stat-item">
              <div class="stat-number">${parkingData.value.total_spots}</div>
              <div class="stat-label">总车位</div>
            </div>
            <div class="stat-item available">
              <div class="stat-number">${parkingData.value.available_spots}</div>
              <div class="stat-label">可用车位</div>
            </div>
            <div class="stat-item occupied">
              <div class="stat-number">${parkingData.value.occupied_spots}</div>
              <div class="stat-label">已占用</div>
            </div>
            <div class="stat-item reserved">
              <div class="stat-number">${parkingData.value.reserved_spots}</div>
              <div class="stat-label">已预约</div>
            </div>
            <div class="stat-item utilization">
              <div class="stat-number">${parkingData.value.utilization_rate}%</div>
              <div class="stat-label">使用率</div>
            </div>
          </div>
          
          <div class="zone-stats">
            <h4>🏢 各分区情况</h4>
            <div class="zone-grid">`
        
        Object.entries(parkingData.value.zone_stats).forEach(([zone, stats]) => {
          if (stats.total > 0) {
            reply += `
              <div class="zone-item">
                <div class="zone-name">${zone}区</div>
                <div class="zone-details">
                  <span class="detail-item">总计: ${stats.total}</span>
                  <span class="detail-item available">可用: ${stats.available}</span>
                  <span class="detail-item occupied">占用: ${stats.occupied}</span>
                  <span class="detail-item reserved">预约: ${stats.reserved}</span>
                </div>
              </div>`
          }
        })
        
        reply += `
            </div>
          </div>
          
          <div class="type-stats">
            <h4>🚙 各类型车位</h4>
            <div class="type-grid">`
        
        Object.entries(parkingData.value.type_stats).forEach(([type, stats]) => {
          if (stats.total > 0) {
            reply += `
              <div class="type-item">
                <div class="type-name">${type}</div>
                <div class="type-details">
                  <span class="detail-item">总计: ${stats.total}</span>
                  <span class="detail-item available">可用: ${stats.available}</span>
                  <span class="detail-item occupied">占用: ${stats.occupied}</span>
                  <span class="detail-item reserved">预约: ${stats.reserved}</span>
                </div>
              </div>`
          }
        })
        
        reply += `
            </div>
          </div>
        </div>`
        
        messages.value.push({ role: 'assistant', type: 'text', content: reply })
              } else {
          // 备用方案：使用原有API
          const res = await getParkingSpots({ per_page: 100 })
          if (res && Array.isArray(res.data)) {
            const zones = {}
            res.data.forEach(spot => {
              if (!zones[spot.zone]) zones[spot.zone] = { total: 0, free: 0 }
              zones[spot.zone].total++
              if (spot.status === '空闲') zones[spot.zone].free++
            })
            let reply = `<div class="parking-stats">
              <h3>📊 各分区车位情况</h3>
              <div class="zone-grid">`
            
            Object.entries(zones).forEach(([zone, stat]) => {
              reply += `
                <div class="zone-item">
                  <div class="zone-name">${zone}区</div>
                  <div class="zone-details">
                    <span class="detail-item">总数: ${stat.total}</span>
                    <span class="detail-item available">空闲: ${stat.free}</span>
                  </div>
                </div>`
            })
            
            reply += `
              </div>
            </div>`
            
            messages.value.push({ role: 'assistant', type: 'text', content: reply })
        } else {
          messages.value.push({ 
            role: 'assistant', 
            type: 'error', 
            content: `<div class="error-message">
              <div class="error-icon">❌</div>
              <h3>获取车位信息失败</h3>
              <p>请稍后再试或联系客服</p>
            </div>` 
          })
        }
      }
      isOnline.value = true
    } else {
      // 其它问题走AI
      const reply = await chatWithDeepSeek(messages.value.map(m => ({
        role: m.role,
        content: m.content
      })))
      messages.value.push({ role: 'assistant', type: 'text', content: reply })
      isOnline.value = true
    }
  } catch (e) {
    console.error('聊天错误:', e)
    if (e.message.includes('登录') || e.message.includes('401')) {
      ElMessage.error('登录已过期，请重新登录')
      router.push('/login')
      return
    }
    messages.value.push({ 
      role: 'assistant', 
      type: 'error', 
      content: `<div class="error-message">
        <div class="error-icon">⚠️</div>
        <h3>对话出错</h3>
        <p>请稍后再试或联系客服</p>
      </div>` 
    })
    isOnline.value = false
  }
  input.value = ''
  loading.value = false
}

function checkLoginStatus() {
  const token = getToken()
  if (token) {
    ElMessage.success('已登录，Token有效')
  } else {
    ElMessage.error('未登录或Token已过期')
  }
}

// 右键菜单
function showContextMenu(event) {
  event.preventDefault()
  
  // 创建右键菜单
  const menu = document.createElement('div')
  menu.className = 'context-menu'
  menu.innerHTML = `
    <div class="menu-item" onclick="clearChatHistory()">
      🗑️ 清除聊天记录
    </div>
    <div class="menu-item" onclick="exportChatHistory()">
      📤 导出聊天记录
    </div>
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
  
  setTimeout(() => {
    document.addEventListener('click', closeMenu)
  }, 100)
}

// 导出聊天记录
function exportChatHistory() {
  try {
    const chatData = {
      timestamp: new Date().toISOString(),
      messages: messages.value
    }
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat_history_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    
    URL.revokeObjectURL(url)
    ElMessage.success('聊天记录已导出')
  } catch (error) {
    console.error('导出聊天记录失败:', error)
    ElMessage.error('导出失败')
  }
}
</script>

<style scoped>
.parking-assistant {
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-info {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #666;
}

.message-count {
  background: #e3f2fd;
  padding: 2px 8px;
  border-radius: 12px;
  color: #1976d2;
}

.history-status {
  background: #d4edda;
  padding: 2px 8px;
  border-radius: 12px;
  color: #155724;
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

/* 欢迎消息样式 */
.welcome-message {
  padding: 16px;
}

.welcome-message h3 {
  color: #1976d2;
  margin: 0 0 12px 0;
  font-size: 18px;
}

.service-list {
  margin: 16px 0;
}

.service-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.service-item:last-child {
  border-bottom: none;
}

.service-icon {
  font-size: 20px;
  margin-right: 12px;
  width: 24px;
  text-align: center;
}

.help-text {
  color: #666;
  font-style: italic;
  margin-top: 12px;
}

/* 停车场统计样式 */
.parking-stats {
  padding: 16px;
}

.parking-stats h3 {
  color: #1976d2;
  margin: 0 0 16px 0;
  font-size: 18px;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 12px 8px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.stat-item.available {
  background: #d4edda;
  border-color: #c3e6cb;
}

.stat-item.occupied {
  background: #f8d7da;
  border-color: #f5c6cb;
}

.stat-item.reserved {
  background: #fff3cd;
  border-color: #ffeaa7;
}

.stat-item.utilization {
  background: #d1ecf1;
  border-color: #bee5eb;
}

.stat-number {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.zone-stats, .type-stats {
  margin-top: 20px;
}

.zone-stats h4, .type-stats h4 {
  color: #495057;
  margin: 0 0 12px 0;
  font-size: 16px;
}

.zone-grid, .type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.zone-item, .type-item {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px;
}

.zone-name, .type-name {
  font-weight: bold;
  color: #495057;
  margin-bottom: 8px;
  font-size: 14px;
}

.zone-details, .type-details {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-item {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  background: #f8f9fa;
}

.detail-item.available {
  background: #d4edda;
  color: #155724;
}

.detail-item.occupied {
  background: #f8d7da;
  color: #721c24;
}

.detail-item.reserved {
  background: #fff3cd;
  color: #856404;
}

/* 车牌信息样式 */
.plate-info {
  padding: 16px;
}

.plate-info h3 {
  color: #1976d2;
  margin: 0 0 16px 0;
  font-size: 18px;
}

.plate-list {
  margin-bottom: 16px;
}

.plate-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid #e9ecef;
}

.plate-item.default {
  background: #d4edda;
  border-color: #c3e6cb;
}

.plate-number {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.plate-status {
  font-size: 12px;
  color: #28a745;
  font-weight: bold;
}

.plate-tip {
  background: #e3f2fd;
  border: 1px solid #bbdefb;
  border-radius: 8px;
  padding: 12px;
}

.plate-tip p {
  margin: 0;
  color: #1976d2;
  font-size: 14px;
}

/* 无车牌警告样式 */
.no-plate-warning {
  text-align: center;
  padding: 20px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
}

.warning-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.no-plate-warning h3 {
  color: #856404;
  margin: 0 0 8px 0;
  font-size: 18px;
}

.no-plate-warning p {
  color: #856404;
  margin: 0 0 16px 0;
}

.action-buttons {
  margin-top: 16px;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  background: #007bff;
  color: white;
}

.action-btn.primary:hover {
  background: #0056b3;
}

/* 收费表样式 */
.fee-table-container {
  padding: 16px;
}

.fee-table-container h3 {
  color: #1976d2;
  margin: 0 0 16px 0;
  font-size: 18px;
  text-align: center;
}

.fee-table {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.fee-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  background: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}

.fee-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  border-bottom: 1px solid #e9ecef;
}

.fee-row:last-child {
  border-bottom: none;
}

.fee-cell {
  padding: 12px;
  border-right: 1px solid #e9ecef;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.fee-cell:last-child {
  border-right: none;
}

.fee-cell.header {
  background: #e3f2fd;
  font-weight: bold;
  color: #1976d2;
  text-align: center;
  font-size: 14px;
}

.fee-cell.type {
  background: #f8f9fa;
  font-weight: bold;
  color: #495057;
  text-align: center;
  font-size: 14px;
}

.fee-item {
  margin-bottom: 4px;
  font-size: 12px;
  line-height: 1.4;
  color: #333;
}

.fee-item.highlight {
  color: #28a745;
  font-weight: bold;
  font-size: 13px;
}

.fee-item:last-child {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .fee-table {
    font-size: 12px;
  }
  
  .fee-cell {
    padding: 8px;
    min-height: 60px;
  }
  
  .fee-item {
    font-size: 11px;
  }
}

/* 错误信息样式 */
.error-message {
  text-align: center;
  padding: 20px;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.error-message h3 {
  color: #721c24;
  margin: 0 0 8px 0;
  font-size: 18px;
}

.error-message p {
  color: #721c24;
  margin: 0;
}

/* 右键菜单样式 */
.context-menu {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  min-width: 160px;
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

.menu-item:first-child {
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.menu-item:last-child {
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
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
  .parking-assistant {
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
  .parking-assistant {
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