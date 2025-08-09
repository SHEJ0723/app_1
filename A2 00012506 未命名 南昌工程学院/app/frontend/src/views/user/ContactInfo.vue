<template>
  <div class="contact-info-view">
    <CommonButton class="pretty-btn back-btn" type="secondary" size="small" text="返回" @click="$router.back()" />
    <h2>联系客服</h2>
    <el-button class="pretty-btn" type="primary" @click="showTodo">联系客服</el-button>
  </div>
</template>
<script setup>
import { ElMessage } from 'element-plus'
import CommonButton from '@/components/CommonButton.vue'
function showTodo() {
  ElMessage.info('客服功能正在开发中，请稍后使用')
}
</script>
<style scoped>
.contact-info-view {
  max-width: 600px;
  margin: 40px auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px #0001;
  padding: 32px 24px 24px 24px;
  text-align: center;
}
.back-btn { margin-bottom: 16px; }
</style> 