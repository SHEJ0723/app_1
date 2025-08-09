<template>
  <div class="admin-feedbacks-container">
    <CommonButton class="pretty-btn back-btn" type="secondary" size="small" text="返回" @click="$router.back()" />
    <h2>客户反馈信息</h2>
    <el-table :data="feedbacks" style="width:96%;margin:32px auto 0 auto;min-height:320px;" @row-click="selectRow">
      <el-table-column prop="user_id" label="用户ID" width="120" />
      <el-table-column prop="content" label="反馈内容" min-width="200" />
      <el-table-column prop="created_at" label="提交时间" width="200" />
      <el-table-column label="管理员回复" min-width="220">
        <template #default="{ row }">
          <div v-if="row.reply">{{ row.reply }}<br/><span style='color:#888;font-size:12px;'>{{ row.reply_at ? row.reply_at.replace('T',' ').slice(0,19) : '' }}</span></div>
          <div v-else style="color:#aaa">暂未回复</div>
        </template>
      </el-table-column>
    </el-table>
    <div v-if="selected" class="reply-panel">
      <div style="font-weight:600;margin-bottom:8px;">回复用户ID: {{ selected.user_id }}，内容：{{ selected.content }}</div>
      <el-input
        v-model="selected._reply"
        type="textarea"
        :rows="3"
        placeholder="输入回复内容..."
        style="width:420px;max-width:90%;margin-bottom:12px;"
      />
      <el-button class="pretty-btn" type="primary" @click="reply(selected)">回复</el-button>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/api/index'
import CommonButton from '@/components/CommonButton.vue'
const feedbacks = ref([])
const selected = ref(null)
const fetchFeedbacks = async () => {
  try {
    const res = await api.get('/api/feedbacks')
    feedbacks.value = (res.data || []).map(f => ({ ...f, _reply: '' }))
  } catch (e) {
    feedbacks.value = []
  }
}
const selectRow = (row) => {
  selected.value = row
}
const reply = async (row) => {
  if (!row._reply) {
    ElMessage.error('请输入回复内容')
    return
  }
  try {
    await api.put(`/feedbacks/${row.id}/reply`, { reply: row._reply })
    ElMessage.success('回复成功')
    row.reply = row._reply
    row.reply_at = new Date().toISOString()
    row._reply = ''
    selected.value = null
  } catch (e) {
    ElMessage.error(e.message || '回复失败')
  }
}
onMounted(fetchFeedbacks)
</script>
<style scoped>
.admin-feedbacks-container {
  max-width: 1400px;
  margin: 40px auto;
  padding: 32px 0 48px 0;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 2px 16px #0001;
}
.back-btn { margin-bottom: 18px; }
.reply-panel {
  margin: 32px auto 0 auto;
  padding: 24px 32px;
  background: #f6faff;
  border-radius: 16px;
  box-shadow: 0 2px 12px #2563eb11;
  max-width: 700px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
</style> 