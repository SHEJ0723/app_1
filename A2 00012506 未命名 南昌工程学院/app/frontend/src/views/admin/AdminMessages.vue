<template>
  <div class="admin-messages-container">
    <h2>消息管理</h2>
    <div style="margin-bottom:24px;text-align:center;">
      <el-button class="pretty-btn" type="primary" @click="goToOrders">客户预约信息</el-button>
      <el-button class="pretty-btn" type="success" @click="goToFeedbacks">客户反馈信息</el-button>
    </div>
    <el-card class="send-msg-card">
      <el-form label-width="80px" style="max-width: 700px; margin: 0 auto;">
        <el-form-item label="选择用户">
          <div style="display:flex;align-items:center;gap:12px;width:100%">
            <el-select v-model="selectedUserIds" multiple filterable placeholder="请选择用户" style="flex:1">
              <el-option v-for="user in userList" :key="user.id" :label="user.name || user.phone || ('用户' + user.id)" :value="user.id" />
            </el-select>
            <el-button class="pretty-btn" type="success" @click="selectAllUsers" size="small">全体发送</el-button>
          </div>
        </el-form-item>
        <el-form-item label="消息内容">
          <el-input v-model="msgContent" type="textarea" :rows="4" placeholder="请输入消息内容" style="width: 100%" />
        </el-form-item>
        <el-form-item>
          <el-button class="pretty-btn" type="primary" @click="handleSendMsg">发送</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <div style="margin:32px auto 0 auto;max-width:900px;">
      <h3 style="margin-bottom:12px;text-align:left;">用户列表（单独发送）</h3>
      <el-table :data="userList" style="width:100%;">
        <el-table-column prop="id" label="用户ID" width="100" />
        <el-table-column prop="name" label="用户名" width="140" />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button class="pretty-btn" size="small" @click="openSingleDialog(row)">单独发送</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog v-model="singleDialogVisible" title="单独发送消息" width="400px">
      <div style="margin-bottom:12px;">发送给用户ID: <b>{{ singleUser?.id }}</b>，用户名: <b>{{ singleUser?.name || singleUser?.phone }}</b></div>
      <el-input v-model="singleMsg" type="textarea" :rows="4" placeholder="请输入消息内容" />
      <template #footer>
        <el-button class="pretty-btn" @click="singleDialogVisible = false">取消</el-button>
        <el-button class="pretty-btn" type="primary" @click="handleSingleSend">发送</el-button>
      </template>
    </el-dialog>
    <div style="text-align:center;margin-top:32px;">
      <el-button class="pretty-btn" type="primary" @click="goToSent">查看已发送记录</el-button>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUsers } from '@/api/users'
import api from '@/api/index'
import { ElMessage } from 'element-plus'
const selectedUserIds = ref([])
const msgContent = ref('')
const userList = ref([])
const router = useRouter()
const singleDialogVisible = ref(false)
const singleUser = ref(null)
const singleMsg = ref('')
const fetchUsers = async () => {
  const users = await getUsers({ page: 1, pageSize: 1000 })
  userList.value = Array.isArray(users) ? users : (users.list || [])
}
const selectAllUsers = () => {
  selectedUserIds.value = userList.value.map(u => u.id)
}
const handleSendMsg = async () => {
  if (!selectedUserIds.value.length || !msgContent.value) {
    ElMessage.error('请选择用户并输入内容')
    return
  }
  await api.post('/api/messages/send', {
    receiver_ids: selectedUserIds.value,
    content: msgContent.value
  })
  ElMessage.success('发送成功')
  msgContent.value = ''
  selectedUserIds.value = []
}
const openSingleDialog = (row) => {
  singleUser.value = row
  singleMsg.value = ''
  singleDialogVisible.value = true
}
const handleSingleSend = async () => {
  if (!singleMsg.value) {
    ElMessage.error('请输入消息内容')
    return
  }
  await api.post('/api/messages/send', {
    receiver_ids: [singleUser.value.id],
    content: singleMsg.value
  })
  ElMessage.success('发送成功')
  singleDialogVisible.value = false
  singleMsg.value = ''
}
const goToSent = () => {
  router.push('/admin/messages/sent')
}
const goToOrders = () => {
  router.push('/admin/orders')
}
const goToFeedbacks = () => {
  router.push('/admin/feedbacks')
}
onMounted(() => {
  fetchUsers()
})
</script>
<style scoped>
.admin-messages-container { max-width: 1200px; margin: 32px auto; padding: 24px; background: #fff; border-radius: 16px; box-shadow: 0 2px 12px #0001; }
.send-msg-card { margin-bottom: 32px; }
</style> 