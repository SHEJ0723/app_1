<template>
  <div class="admin-device-monitor-container">
    <el-card>
      <template #header>
        <h3>设备监控</h3>
      </template>
      <el-table :data="devices" style="width: 100%">
        <el-table-column prop="id" label="设备编号" width="120" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="location" label="位置" width="180" />
        <el-table-column prop="status" label="状态" width="120" />
        <el-table-column label="报警" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.status === '故障'" type="danger">故障报警</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const devices = ref([
  { id: 'D001', type: '道闸', location: '入口A', status: '正常' },
  { id: 'D002', type: '摄像头', location: 'B区', status: '故障' },
  { id: 'D003', type: '充电桩', location: 'A区', status: '正常' }
])
</script>
<style scoped>
.admin-device-monitor-container {
  max-width: 1100px;
  margin: 30px auto;
  padding: 20px;
}
</style> 