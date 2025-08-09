<template>
  <div class="feedback-view">
    <CommonButton class="pretty-btn back-btn" type="secondary" size="small" text="返回" @click="$router.back()" />
    <h2>意见反馈</h2>
    <el-card style="max-width:500px;margin:0 auto;">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px" class="feedback-form">
        <el-form-item label="反馈内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="4" placeholder="请输入您的建议或遇到的问题" />
        </el-form-item>
        <el-form-item>
          <el-button class="pretty-btn" type="primary" @click="onSubmit" :loading="loading">提交</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <div style="text-align:center;margin-top:32px;">
      <el-button class="pretty-btn" type="primary" @click="goToHistory">查看我的反馈记录</el-button>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { submitFeedback } from '@/api/feedback'
import { useRouter } from 'vue-router'
import CommonButton from '@/components/CommonButton.vue'

const form = ref({ content: '' })
const rules = { content: [ { required: true, message: '请输入反馈内容', trigger: 'blur' }, { min: 5, message: '内容不少于5个字', trigger: 'blur' } ] }
const formRef = ref(null)
const loading = ref(false)
const router = useRouter()

const onSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const res = await submitFeedback({ content: form.value.content })
      if (res.success) {
        ElMessage.success('反馈提交成功！')
        form.value.content = ''
        router.push({ name: 'FeedbackHistory' })
      } else {
        ElMessage.error(res.message || '提交失败')
      }
    } catch (e) {
      ElMessage.error('提交失败')
      console.error('提交反馈失败:', e)
    } finally {
      loading.value = false
    }
  })
}
function goToHistory() {
  router.push({ name: 'FeedbackHistory' })
}
</script>
<style scoped>
.feedback-view {
  max-width: 700px;
  margin: 40px auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px #0001;
  padding: 32px 24px 24px 24px;
}
.back-btn { margin-bottom: 16px; }
.feedback-form {
  margin-top: 20px;
}
</style> 