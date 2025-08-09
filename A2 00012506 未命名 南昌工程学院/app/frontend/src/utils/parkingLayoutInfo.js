// 停车场布局信息
export const parkingLayoutInfo = {
  // 基本信息
  basic: {
    name: "龙跃园区停车场",
    totalSpots: 60,
    entranceExit: 2,
    compass: "N (北向)"
  },
  
  // 各区域详细信息
  zones: {
    A: {
      name: "A区",
      type: "标准停车区",
      spots: 10,
      numbering: "A1-A10",
      layout: "两列垂直排列，左列A1-A5，右列A6-A10",
      color: "黄色",
      description: "标准停车位，适合小型车辆"
    },
    B: {
      name: "B区", 
      type: "标准停车区",
      spots: 10,
      numbering: "B1-B10",
      layout: "两列垂直排列，左列B1-B5，右列B6-B10",
      color: "黄色",
      description: "标准停车位，适合小型车辆"
    },
    C: {
      name: "C区",
      type: "大型车辆区",
      spots: 10,
      numbering: "C1-C10",
      layout: "单列垂直排列，从下到上编号",
      color: "黄色",
      description: "专门用于大型车辆停放"
    },
    D: {
      name: "D区",
      type: "标准停车区",
      spots: 10,
      numbering: "D1-D10",
      layout: "单行水平排列，从左到右编号",
      color: "绿色",
      description: "标准停车位，适合小型车辆"
    },
    E: {
      name: "E区",
      type: "无障碍停车区",
      spots: 10,
      numbering: "E1-E10",
      layout: "两列垂直排列，左列E1-E5，右列E6-E10",
      color: "蓝色",
      description: "无障碍停车位，配备轮椅标识，专为残障人士设计"
    },
    F: {
      name: "F区",
      type: "标准停车区", 
      spots: 10,
      numbering: "F1-F10",
      layout: "单行水平排列，从左到右编号",
      color: "绿色",
      description: "标准停车位，适合小型车辆"
    }
  },
  
  // 特殊区域
  specialAreas: {
    newEnergy: {
      name: "新能源区域",
      location: "D区和F区之间",
      description: "专门为新能源汽车提供充电服务",
      features: ["充电桩", "新能源车辆专用", "绿色环保"]
    }
  },
  
  // 出入口信息
  entrances: [
    {
      location: "左上角",
      type: "主出入口",
      description: "主要车辆进出通道"
    },
    {
      location: "右下角", 
      type: "次出入口",
      description: "辅助车辆进出通道"
    }
  ],
  
  // 布局特点
  features: [
    "六个独立停车区域，分区明确",
    "无障碍停车位配备完善",
    "新能源车辆专用充电区域",
    "大型车辆专用停车区",
    "双出入口设计，交通便利",
    "清晰的编号系统和方向指示"
  ]
}

// 生成布局图HTML
export function generateLayoutHtml() {
  return `<div class="parking-layout-info">
  <h3>🗺️ 龙跃园区停车场布局详情</h3>
  
  <div class="layout-summary">
    <div class="summary-item">
      <span class="label">总车位数：</span>
      <span class="value">${parkingLayoutInfo.basic.totalSpots}个</span>
    </div>
    <div class="summary-item">
      <span class="label">停车区域：</span>
      <span class="value">6个区域 (A-F)</span>
    </div>
    <div class="summary-item">
      <span class="label">出入口：</span>
      <span class="value">2个</span>
    </div>
  </div>

  <div class="zones-detail">
    <h4>📋 各区域详情：</h4>
    
    <div class="zone-item">
      <div class="zone-header">
        <span class="zone-name">A区 & B区</span>
        <span class="zone-type">标准停车区</span>
      </div>
      <div class="zone-info">
        <p>• 各10个车位，共20个标准停车位</p>
        <p>• 编号：A1-A10, B1-B10</p>
        <p>• 布局：两列垂直排列</p>
        <p>• 适合：小型车辆</p>
      </div>
    </div>

    <div class="zone-item">
      <div class="zone-header">
        <span class="zone-name">C区</span>
        <span class="zone-type">大型车辆区</span>
      </div>
      <div class="zone-info">
        <p>• 10个大型车辆专用车位</p>
        <p>• 编号：C1-C10</p>
        <p>• 布局：单列垂直排列</p>
        <p>• 适合：货车、大巴等大型车辆</p>
      </div>
    </div>

    <div class="zone-item">
      <div class="zone-header">
        <span class="zone-name">D区 & F区</span>
        <span class="zone-type">标准停车区</span>
      </div>
      <div class="zone-info">
        <p>• 各10个车位，共20个标准停车位</p>
        <p>• 编号：D1-D10, F1-F10</p>
        <p>• 布局：单行水平排列</p>
        <p>• 适合：小型车辆</p>
      </div>
    </div>

    <div class="zone-item">
      <div class="zone-header">
        <span class="zone-name">E区</span>
        <span class="zone-type">无障碍停车区</span>
      </div>
      <div class="zone-info">
        <p>• 10个无障碍停车位</p>
        <p>• 编号：E1-E10</p>
        <p>• 布局：两列垂直排列</p>
        <p>• 特点：配备轮椅标识，专为残障人士设计</p>
      </div>
    </div>

    <div class="zone-item special">
      <div class="zone-header">
        <span class="zone-name">新能源区域</span>
        <span class="zone-type">充电服务区</span>
      </div>
      <div class="zone-info">
        <p>• 位置：D区和F区之间</p>
        <p>• 功能：新能源汽车充电服务</p>
        <p>• 特点：绿色环保，专用充电桩</p>
      </div>
    </div>
  </div>

  <div class="entrance-info">
    <h4>🚪 出入口信息：</h4>
    <p>• 主出入口：左上角 - 主要车辆进出通道</p>
    <p>• 次出入口：右下角 - 辅助车辆进出通道</p>
  </div>

  <div class="layout-features">
    <h4>✨ 布局特点：</h4>
    <ul>
      <li>六个独立停车区域，分区明确</li>
      <li>无障碍停车位配备完善</li>
      <li>新能源车辆专用充电区域</li>
      <li>大型车辆专用停车区</li>
      <li>双出入口设计，交通便利</li>
      <li>清晰的编号系统和方向指示</li>
    </ul>
  </div>
</div>`
}

// 生成区域状态查询回复
export function generateZoneStatusReply(zoneData) {
  if (!zoneData) {
    return "抱歉，暂时无法获取实时车位状态信息。"
  }
  
  let reply = `<div class="zone-status-info">
    <h3>🅿️ 各区域车位状态</h3>
    <div class="status-grid">`
  
  Object.keys(parkingLayoutInfo.zones).forEach(zoneKey => {
    const zone = parkingLayoutInfo.zones[zoneKey]
    const zoneStatus = zoneData[zoneKey] || { available: 0, total: zone.spots }
    const occupied = zoneStatus.total - zoneStatus.available
    const percentage = Math.round((zoneStatus.available / zoneStatus.total) * 100)
    
    reply += `<div class="status-item">
        <div class="zone-name">${zone.name}</div>
        <div class="status-details">
          <span class="available">空闲：${zoneStatus.available}个</span>
          <span class="occupied">占用：${occupied}个</span>
          <span class="total">总计：${zoneStatus.total}个</span>
        </div>
        <div class="percentage">${percentage}% 空闲</div>
      </div>`
  })
  
  reply += `</div></div>`
  return reply
}

// 关键词匹配函数
export function isLayoutQuery(text) {
  const keywords = [
    '停车场布局', '布局图', '车位分布', '停车区域', 'A区', 'B区', 'C区', 'D区', 'E区', 'F区',
    '新能源区域', '无障碍停车', '大型车辆', '出入口', '车位编号', '停车位分布'
  ]
  return keywords.some(k => text.includes(k))
}

export function isZoneStatusQuery(text) {
  const keywords = [
    '车位状态', '空闲车位', '剩余车位', '各区域车位', 'A区车位', 'B区车位', 'C区车位', 
    'D区车位', 'E区车位', 'F区车位', '车位占用', '车位数量'
  ]
  return keywords.some(k => text.includes(k))
} 