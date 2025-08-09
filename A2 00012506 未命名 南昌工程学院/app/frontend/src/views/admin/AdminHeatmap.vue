<template>
  <div class="admin-heatmap-container">
    <el-card>
      <template #header>
        <h3>实时车位占用热力图</h3>
      </template>
      <div class="heatmap-placeholder">[此处可集成ECharts热力图]</div>
    </el-card>
  </div>
</template>
<script setup>
</script>
<style scoped>
.admin-heatmap-container {
  max-width: 1100px;
  margin: 30px auto;
  padding: 20px;
}
.heatmap-placeholder {
  width: 100%;
  height: 400px;
  background: #f5f7fa;
  border: 1px dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 18px;
}
</style> 