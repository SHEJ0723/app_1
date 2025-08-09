<template>
  <div class="parking-map-view">
    <div class="header-row">
      <el-button type="primary" link class="back-btn" @click="$router.push('/user')">返回首页</el-button>
      <h2>停车场布局图</h2>
    </div>
    <img src="@/assets/images/bujutu.png" alt="停车场布局图" class="parking-map-img" />
  </div>
</template>
<script setup>
</script>
<style scoped>
.header-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}
.back-btn {
  margin-left: 0;
  font-size: 16px;
}
.parking-map-view {
  max-width: 900px;
  margin: 40px auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px #0001;
  padding: 32px 24px 24px 24px;
  text-align: center;
}
.parking-map-img {
  max-width: 100%;
  height: auto;
  border-radius: 16px;
  box-shadow: 0 2px 12px #1976d220;
  border: 1.5px solid #e3eaf5;
  margin-top: 24px;
}
</style> 