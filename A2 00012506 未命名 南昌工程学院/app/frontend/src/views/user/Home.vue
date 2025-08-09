<template>
  <div class="fade-in">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h2 class="text-[clamp(1.25rem,3vw,1.75rem)] font-semibold">智慧停车</h2>
      <p class="text-gray-500 mt-1">便捷的停车服务，让您的出行更加轻松</p>
    </div>

    <!-- 消息快速查看 -->
    <div class="mb-6">
      <MessageQuickView />
    </div>

    <!-- 快捷操作区域 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
      <div class="flex justify-between items-center mb-6">
        <h3 class="font-medium text-lg">快捷服务</h3>
        <p class="text-gray-500 text-sm">选择您需要的服务</p>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div 
          class="action-card-modern" 
          @click="goTo('ParkingReservation')"
        >
          <div class="action-icon bg-primary/10 text-primary">
            <i class="fa fa-calendar"></i>
          </div>
          <span class="action-text">预订车位</span>
        </div>
        
        <div 
          class="action-card-modern" 
          @click="goTo('ParkingStatus')"
        >
          <div class="action-icon bg-success/10 text-success">
            <i class="fa fa-car"></i>
          </div>
          <span class="action-text">车位查看</span>
        </div>
        
        <div 
          class="action-card-modern" 
          @click="goTo('ParkingMap')"
        >
          <div class="action-icon bg-info/10 text-info">
            <i class="fa fa-map"></i>
          </div>
          <span class="action-text">停车场布局</span>
        </div>
        
        <div 
          class="action-card-modern" 
          @click="goTo('Fee')"
        >
          <div class="action-icon bg-warning/10 text-warning">
            <i class="fa fa-money"></i>
          </div>
          <span class="action-text">收费明细</span>
        </div>
        
        <div 
          class="action-card-modern" 
          @click="goTo('Orders')"
        >
          <div class="action-icon bg-purple-500/10 text-purple-500">
            <i class="fa fa-list"></i>
          </div>
          <span class="action-text">订单查看</span>
        </div>
      </div>
    </div>

    <!-- 停车场布局图区域 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div class="flex justify-between items-center mb-6">
                    <h3 class="font-medium text-lg">龙跃园区停车场布局</h3>
        <el-button type="primary" size="small" @click="goTo('ParkingMap')">
          查看详情
        </el-button>
      </div>
      <div class="relative overflow-hidden rounded-lg">
        <img 
          :src="parkingBg" 
          alt="停车场布局图" 
          class="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import parkingBg from '@/assets/images/bujutu.png'
import MessageQuickView from '@/components/MessageQuickView.vue'

const router = useRouter()

function goTo(name) {
  // 路由name映射表
  const nameMap = {
    ParkingMap: 'ParkingMap',
    Fee: 'UserBills',
    Orders: 'UserOrders'
  }
  router.push({ name: nameMap[name] || name })
}
</script>

<style scoped>
.action-card-modern {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 16px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 100px;
}

.action-card-modern:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  font-size: 20px;
}

.action-text {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  text-align: center;
  line-height: 1.2;
}
</style> 