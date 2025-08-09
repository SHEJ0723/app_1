<template>
  <div class="admin-messages-sent-container">
    <CommonButton class="pretty-btn back-btn" type="secondary" size="small" text="返回" @click="$router.back()" />
    <h2>已发送消息记录</h2>
    <el-table :data="sentMessages" style="width: 100%">
      <el-table-column prop="content" label="内容" />
      <el-table-column prop="receiver_id" label="接收用户ID" />
      <el-table-column prop="created_at" label="发送时间" />
    </el-table>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/index'
import CommonButton from '@/components/CommonButton.vue'
const sentMessages = ref([])
const fetchSentMessages = async () => {
      const res = await api.get('/api/messages?sent=1')
  sentMessages.value = res.data || []
}
onMounted(fetchSentMessages)
</script>
<style scoped>
.admin-messages-sent-container { max-width: 1200px; margin: 32px auto; padding: 24px; background: #fff; border-radius: 16px; box-shadow: 0 2px 12px #0001; }
.back-btn { margin-bottom: 18px; }
</style> 