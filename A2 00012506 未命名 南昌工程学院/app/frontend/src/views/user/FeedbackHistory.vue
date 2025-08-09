<template>
  <div class="feedback-history-view">
    <CommonButton class="back-btn" type="secondary" size="small" text="返回" @click="$router.back()" />
    <h2>我的反馈记录</h2>
    <el-card style="max-width:700px;margin:0 auto;">
      <div style="margin-bottom:16px;display:flex;align-items:center;gap:16px;">
        <el-input v-model="search" placeholder="搜索反馈内容..." clearable style="width:200px;" @input="handleSearch" />
        <el-select v-model="replyFilter" placeholder="回复筛选" clearable style="width:140px;" @change="handleSearch">
          <el-option label="全部" value="all" />
          <el-option label="已回复" value="replied" />
          <el-option label="未回复" value="unreplied" />
        </el-select>
      </div>
      <el-table :data="pagedFeedbacks" style="width:100%;">
        <el-table-column prop="created_at" label="提交时间" width="180" />
        <el-table-column prop="content" label="反馈内容" />
        <el-table-column label="管理员回复">
          <template #default="{ row }">
            <div v-if="row.reply">{{ row.reply }}<br/><span style='color:#888;font-size:12px;'>{{ row.reply_at ? row.reply_at.replace('T',' ').slice(0,19) : '' }}</span></div>
            <div v-else style="color:#aaa">暂未回复</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="90">
          <template #default="{ row }">
            <el-popconfirm title="确定删除这条反馈？" @confirm="handleDelete(row)">
              <el-button type="danger" size="small">删除</el-button>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top:18px;text-align:right;">
        <el-pagination
          background
          layout="prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          v-model:current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { getUserFeedback, deleteFeedback } from '@/api/feedback'
import { ElMessage } from 'element-plus'
import CommonButton from '@/components/CommonButton.vue'

const feedbacks = ref([])
const search = ref('')
const replyFilter = ref('all')
const currentPage = ref(1)
const pageSize = 8
const total = ref(0)

const fetchFeedbacks = async () => {
  try {
    const res = await getUserFeedback({
      page: currentPage.value,
      per_page: pageSize,
      search: search.value
    })
    
    if (res.success) {
      feedbacks.value = res.data.map(f => ({
        ...f,
        created_at: f.created_at.replace('T',' ').slice(0,19)
      }))
      total.value = res.total
    } else {
      feedbacks.value = []
      total.value = 0
      ElMessage.error(res.message || '获取反馈记录失败')
    }
  } catch (e) {
    feedbacks.value = []
    total.value = 0
    ElMessage.error('获取反馈记录失败')
    console.error('获取反馈记录失败:', e)
  }
}

const filteredFeedbacks = computed(() => {
  let arr = feedbacks.value
  if (replyFilter.value === 'replied') {
    arr = arr.filter(f => !!f.reply)
  } else if (replyFilter.value === 'unreplied') {
    arr = arr.filter(f => !f.reply)
  }
  return arr
})

const pagedFeedbacks = computed(() => {
  return filteredFeedbacks.value
})

const handleDelete = async (row) => {
  try {
    const res = await deleteFeedback(row.id)
    if (res.success) {
      ElMessage.success('删除成功')
      fetchFeedbacks()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (e) {
    ElMessage.error('删除失败')
    console.error('删除反馈失败:', e)
  }
}

// 监听搜索和筛选变化
const handleSearch = () => {
  currentPage.value = 1
  fetchFeedbacks()
}

// 监听分页变化
const handlePageChange = () => {
  fetchFeedbacks()
}

onMounted(fetchFeedbacks)
</script>
<style scoped>
.feedback-history-view {
  max-width: 700px;
  margin: 40px auto;
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.back-btn {
  margin-bottom: 16px;
}

h2 {
  color: #409eff;
  text-align: center;
  margin-bottom: 24px;
}
</style> 