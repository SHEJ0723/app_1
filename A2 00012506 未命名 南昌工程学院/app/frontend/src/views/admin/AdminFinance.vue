<template>
  <div class="admin-finance-container">
    <el-card>
      <template #header>
        <h3>财务报表导出</h3>
      </template>
      <el-form :inline="true" style="margin-bottom: 20px;">
        <el-form-item label="维度">
          <el-select v-model="dimension" placeholder="请选择维度">
            <el-option label="日" value="day" />
            <el-option label="月" value="month" />
            <el-option label="年" value="year" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button class="pretty-btn" type="primary" @click="exportReport">导出报表</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="reports" style="width: 100%">
        <el-table-column prop="date" label="日期" width="180" />
        <el-table-column prop="income" label="收入(元)" width="120" />
        <el-table-column prop="orders" label="订单数" width="120" />
      </el-table>
    </el-card>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
const dimension = ref('day')
const reports = ref([
  { date: '2024-06-01', income: 12800, orders: 320 },
  { date: '2024-06-02', income: 13500, orders: 340 }
])
const exportReport = () => {
  ElMessage.success('报表已导出')
}
</script>
<style scoped>
.admin-finance-container {
  max-width: 1100px;
  margin: 30px auto;
  padding: 20px;
}
</style> 