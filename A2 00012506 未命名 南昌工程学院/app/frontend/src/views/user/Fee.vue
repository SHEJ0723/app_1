<template>
  <div class="faq-container">
    <el-card>
      <template #header>
        <span>常见问题</span>
      </template>
      <el-collapse v-model="activeNames" accordion>
        <el-collapse-item v-for="item in faqs" :key="item.id" :name="item.id">
          <template #title>
            <el-icon><QuestionFilled /></el-icon>
            <span>{{ item.question }}</span>
          </template>
          <div class="faq-answer">{{ item.answer }}</div>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'

const activeNames = ref([])
const faqs = ref([
  { id: 1, question: '如何预约停车位？', answer: '在首页点击“预订车位”，选择区域和时段后提交即可。' },
  { id: 2, question: '如何绑定/解绑车牌？', answer: '在个人信息设置中可添加或删除车牌号。' },
  { id: 3, question: '如何查看和支付账单？', answer: '在“账单”页面可查看所有账单并完成支付。' },
  { id: 4, question: '忘记密码怎么办？', answer: '请在登录页点击“忘记密码”或联系客服协助找回。' },
  { id: 5, question: '如何联系客服？', answer: '在个人中心点击“联系客服”可获取客服电话、邮箱和在线客服二维码。' }
])
</script>
<style scoped>
.faq-container {
  max-width: 500px;
  margin: 40px auto;
}
.faq-answer {
  color: #333;
  font-size: 1.08rem;
  line-height: 1.7;
  margin-top: 8px;
}
</style> 