<template>
  <div class="admin-home-bg">
    <div class="admin-home-container">
      <el-card class="admin-home-card">
        <div class="admin-home-header">
          <img src="/src/assets/logo.svg" class="admin-logo" alt="logo" />
          <h2>欢迎来到龙跃智慧园区停车场管理系统</h2>
        </div>
        <p class="admin-home-desc">高效 · 智能 · 便捷</p>
        <el-divider />
        <div class="admin-home-features">
          <div class="feature-item">
            <i class="el-icon-s-data feature-icon"></i>
            <span>数据看板</span>
          </div>
          <div class="feature-item">
            <i class="el-icon-user-solid feature-icon"></i>
            <span>用户与车位管理</span>
          </div>
          <div class="feature-item">
            <i class="el-icon-s-order feature-icon"></i>
            <span>订单与账单</span>
          </div>
          <div class="feature-item">
            <i class="el-icon-s-tools feature-icon"></i>
            <span>系统运维</span>
          </div>
          <div class="feature-item">
            <i class="el-icon-message-solid feature-icon"></i>
            <span>智能助手</span>
          </div>
        </div>
        <el-divider />
        <p class="admin-home-tip">请通过左侧菜单进入各功能模块，开启高效管理之旅。</p>
      </el-card>
    </div>
  </div>
</template>
<script setup>
</script>
<style scoped>
.admin-home-bg {
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #e3f0ff 0%, #fafdff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.admin-home-container {
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
}
.admin-home-card {
  max-width: 480px;
  width: 100%;
  margin: 60px 0;
  box-shadow: 0 8px 32px 0 rgba(60,120,255,0.13);
  border-radius: 18px;
  padding: 36px 32px 28px 32px;
  background: #fff;
}
.admin-home-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
}
.admin-logo {
  width: 64px;
  height: 64px;
  margin-bottom: 10px;
}
h2 {
  color: #2563eb;
  text-align: center;
  margin-bottom: 0;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 1px;
}
.admin-home-desc {
  text-align: center;
  color: #3b82f6;
  font-size: 1.15rem;
  margin-bottom: 10px;
  font-weight: 500;
  letter-spacing: 2px;
}
.admin-home-features {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin: 18px 0 10px 0;
}
.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 32%;
  margin-bottom: 18px;
  color: #2563eb;
  font-size: 1.05rem;
  font-weight: 500;
  letter-spacing: 1px;
}
.feature-icon {
  font-size: 2.1rem;
  margin-bottom: 6px;
  color: #3b82f6;
  filter: drop-shadow(0 2px 8px #2563eb22);
}
.admin-home-tip {
  text-align: center;
  color: #888;
  font-size: 1rem;
  margin-top: 10px;
}
</style> 