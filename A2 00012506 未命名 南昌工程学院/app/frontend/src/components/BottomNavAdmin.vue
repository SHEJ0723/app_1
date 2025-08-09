<template>
  <nav class="bottom-nav" v-if="isMobile">
    <el-menu mode="horizontal" :default-active="active" @select="onSelect">
      <el-menu-item index="/admin/dashboard">
        <el-icon><Monitor /></el-icon>
        <span>仪表盘</span>
      </el-menu-item>
      <el-menu-item index="/admin/users">
        <el-icon><User /></el-icon>
        <span>用户管理</span>
      </el-menu-item>
      <el-menu-item index="/admin/parking">
        <el-icon><Location /></el-icon>
        <span>停车场管理</span>
      </el-menu-item>
      <el-menu-item index="/admin/assistant">
        <el-icon><ChatDotRound /></el-icon>
        <span>助手</span>
      </el-menu-item>
    </el-menu>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Monitor, User, Location, ChatDotRound } from '@element-plus/icons-vue'

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
</style> 