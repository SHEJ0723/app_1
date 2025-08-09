<template>
  <nav class="bottom-nav" v-if="isMobile">
    <el-menu mode="horizontal" :default-active="active" @select="onSelect">
      <el-menu-item index="/user">
        <el-icon><House /></el-icon>
        <span>首页</span>
      </el-menu-item>
      <el-menu-item index="/user/parking" class="reservation-item">
        <el-icon><Calendar /></el-icon>
        <span>预约停车</span>
      </el-menu-item>
      <el-menu-item index="/user/orders">
        <el-icon><Document /></el-icon>
        <span>我的订单</span>
      </el-menu-item>
      <el-menu-item index="/user/chat">
        <el-icon><ChatDotRound /></el-icon>
        <span>在线助手</span>
      </el-menu-item>
    </el-menu>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { House, Calendar, Document, ChatDotRound } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const active = ref(route.path)
const isMobile = ref(window.innerWidth < 600)

const onSelect = (index) => {
  router.push(index)
}

const handleResize = () => {
  isMobile.value = window.innerWidth < 600
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

watch(route, (val) => {
  active.value = val.path
})
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  background: #fff;
  box-shadow: 0 -2px 8px #0001;
  border-top: 1px solid #eee;
}

.el-menu {
  display: flex;
  justify-content: space-around;
  border-bottom: none;
}

.el-menu-item {
  flex: 1;
  text-align: center;
  padding: 0 0;
  font-size: 15px;
}

/* 预约停车按钮特殊样式 */
.reservation-item {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
}

.reservation-item:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: #ffffff;
}

.reservation-item.is-active {
  background: linear-gradient(135deg, #047857 0%, #065f46 100%);
  color: #ffffff;
}
</style> 