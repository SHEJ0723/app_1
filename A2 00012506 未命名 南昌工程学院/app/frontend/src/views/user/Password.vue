<template>
  <div class="user-page-container">
    <CommonButton class="pretty-btn back-btn" type="secondary" size="small" text="返回" @click="$router.back()" />
    <h2>修改密码</h2>
    <p>修改密码功能开发中。</p>
  </div>
</template>
<script setup>
import CommonButton from '@/components/CommonButton.vue'
</script>
<style scoped>
.user-page-container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 16px; box-shadow: 0 2px 12px #0001; padding: 32px 24px 24px 24px; }
.back-btn { margin-bottom: 16px; }
</style> 