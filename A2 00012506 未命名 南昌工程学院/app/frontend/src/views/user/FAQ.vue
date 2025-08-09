<template>
  <div class="faq-view">
    <CommonButton class="pretty-btn back-btn" type="secondary" size="small" text="返回" @click="$router.back()" />
    <h2>常见问题</h2>
    <p>常见问题功能开发中。</p>
  </div>
</template>
<script setup>
import CommonButton from '@/components/CommonButton.vue'
</script>
<style scoped>
.faq-view {
  max-width: 700px;
  margin: 40px auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px #0001;
  padding: 32px 24px 24px 24px;
  text-align: center;
}
.back-btn {
  margin-bottom: 16px;
}
</style> 