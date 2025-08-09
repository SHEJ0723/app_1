<template>
  <div class="fee-standard-container">
    <h2>停车场收费标准</h2>
    <div v-html="feeTableHtml" />
  </div>
</template>
<script setup>
const feeTableHtml = `
<table border="1" cellpadding="6" style="border-collapse:collapse;min-width:600px;text-align:center;">
  <tr style="background:#f6faff;font-weight:bold;"><td>类型</td><td>路内停车场</td><td>路外地面停车场</td><td>地下停车场</td></tr>
  <tr><td>小型车</td><td>首30分钟免费<br>白天(8:00-20:00)：首小时3元，后每半小时1元<br>夜间(20:00-8:00)：每小时1元，夜间最高5元<br>24小时最高15元<br>包月200元/辆</td><td>首1小时免费<br>4小时内5元，4-8小时10元，24小时15元<br>包月180元/辆</td><td>首2小时免费<br>4小时内4元，4-8小时8元，24小时12元<br>包月150元/辆</td></tr>
  <tr><td>大型车</td><td>首30分钟免费<br>白天(8:00-20:00)：首小时4元，后每半小时2元<br>夜间(20:00-8:00)：每小时2元，夜间最高8元<br>24小时最高25元<br>包月300元/辆</td><td>首1小时免费<br>4小时内7元，4-8小时14元，24小时20元<br>包月250元/辆</td><td>首2小时免费<br>4小时内6元，4-8小时12元，24小时18元<br>包月220元/辆</td></tr>
  <tr><td>新能源汽车</td><td>当日首次2小时内免费(含充电)<br>白天首小时2元，后每半小时1元<br>夜间每小时1元<br>24小时最高12元<br>包月150元/辆</td><td>首2小时免费<br>4小时内4元，4-8小时8元，24小时12元<br>包月120元/辆</td><td>首2小时免费<br>4小时内3元，4-8小时6元，24小时10元<br>包月100元/辆</td></tr>
</table>`
</script>
<style scoped>
.fee-standard-container {
  max-width: 800px;
  margin: 40px auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px #0001;
  padding: 32px 24px 24px 24px;
}
h2 {
  text-align: center;
  color: #2563eb;
  margin-bottom: 24px;
}
table {
  margin: 0 auto;
  background: #fafdff;
  font-size: 16px;
}
td {
  padding: 8px 12px;
}
</style> 