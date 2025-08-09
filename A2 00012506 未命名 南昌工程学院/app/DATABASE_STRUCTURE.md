# 停车场管理系统数据库结构

## 📊 数据库概述

**数据库名称**: `parking_automation_system`  
**字符集**: `utf8mb4`  
**排序规则**: `utf8mb4_unicode_ci`  
**存储引擎**: InnoDB

## 🗂️ 数据表结构

### 1. 用户管理表

#### `users` - 用户表
| 字段名 | 类型 | 长度 | 约束 | 说明 |
|--------|------|------|------|------|
| id | INT | - | PRIMARY KEY, AUTO_INCREMENT | 用户ID |
| phone | VARCHAR | 11 | UNIQUE, NOT NULL, INDEX | 手机号 |
| password_hash | VARCHAR | 255 | NOT NULL | 密码哈希 |
| name | VARCHAR | 50 | NOT NULL | 用户姓名 |
| email | VARCHAR | 120 | UNIQUE | 邮箱 |
| avatar_url | VARCHAR | 255 | - | 头像URL |
| status | VARCHAR | 20 | DEFAULT 'active' | 状态(active/disabled) |
| created_at | DATETIME | - | DEFAULT NOW | 创建时间 |
| updated_at | DATETIME | - | DEFAULT NOW, ON UPDATE NOW | 更新时间 |
| last_login | DATETIME | - | - | 最后登录时间 |

#### `admins` - 管理员表
| 字段名 | 类型 | 长度 | 约束 | 说明 |
|--------|------|------|------|------|
| id | INT | - | PRIMARY KEY, AUTO_INCREMENT | 管理员ID |
| employee_id | VARCHAR | 10 | UNIQUE, NOT NULL, INDEX | 员工号 |
| password_hash | VARCHAR | 255 | NOT NULL | 密码哈希 |
| name | VARCHAR | 50 | NOT NULL | 管理员姓名 |
| email | VARCHAR | 120 | UNIQUE | 邮箱 |
| role | VARCHAR | 20 | NOT NULL | 角色(super_admin/admin/operator) |
| department | VARCHAR | 50 | - | 部门 |
| status | VARCHAR | 20 | DEFAULT 'active' | 状态 |
| created_at | DATETIME | - | DEFAULT NOW | 创建时间 |
| updated_at | DATETIME | - | DEFAULT NOW, ON UPDATE NOW | 更新时间 |
| last_login | DATETIME | - | - | 最后登录时间 |

#### `license_plates` - 车牌信息表
| 字段名 | 类型 | 长度 | 约束 | 说明 |
|--------|------|------|------|------|
| id | INT | - | PRIMARY KEY, AUTO_INCREMENT | 车牌ID |
| plate_number | VARCHAR | 10 | UNIQUE, NOT NULL, INDEX | 车牌号 |
| vehicle_type | VARCHAR | 20 | NOT NULL | 车辆类型(car/motorcycle/truck) |
| user_id | INT | - | FOREIGN KEY(users.id) | 用户ID |
| is_default | BOOLEAN | - | DEFAULT FALSE | 是否默认车牌 |
| status | VARCHAR | 20 | DEFAULT 'active' | 状态 |
| created_at | DATETIME | - | DEFAULT NOW | 创建时间 |
| updated_at | DATETIME | - | DEFAULT NOW, ON UPDATE NOW | 更新时间 |

### 2. 停车场管理表

#### `parking_spots` - 停车位表
| 字段名 | 类型 | 长度 | 约束 | 说明 |
|--------|------|------|------|------|
| id | INT | - | PRIMARY KEY, AUTO_INCREMENT | 车位ID |
| spot_number | VARCHAR | 10 | UNIQUE, NOT NULL, INDEX | 车位号 |
| zone | VARCHAR | 20 | NOT NULL | 分区(A/B/C/D/E/F) |
| type | VARCHAR | 20 | NOT NULL | 类型(普通/大型/新能源/无障碍) |
| status | VARCHAR | 20 | NOT NULL, DEFAULT '空闲' | 状态(空闲/占用/维修) |
| is_active | BOOLEAN | - | DEFAULT TRUE | 是否启用 |
| special_attribute | VARCHAR | 50 | - | 特殊属性(Electric/Wheelchair/Large) |
| coordinates | VARCHAR | 10 | - | 网格坐标 |
| created_at | DATETIME | - | DEFAULT NOW | 创建时间 |
| updated_at | DATETIME | - | DEFAULT NOW, ON UPDATE NOW | 更新时间 |

### 3. 订单和账单表

#### `orders` - 订单表
| 字段名 | 类型 | 长度 | 约束 | 说明 |
|--------|------|------|------|------|
| id | INT | - | PRIMARY KEY, AUTO_INCREMENT | 订单ID |
| user_id | INT | - | NOT NULL, INDEX | 用户ID |
| spot_id | INT | - | NOT NULL, INDEX | 车位ID |
| start_time | DATETIME | - | NOT NULL | 开始时间 |
| end_time | DATETIME | - | - | 结束时间 |
| status | VARCHAR | 20 | NOT NULL, DEFAULT '未支付' | 状态(已完成/未支付/已取消) |
| amount | FLOAT | - | NOT NULL, DEFAULT 0.0 | 金额 |
| pay_method | VARCHAR | 20 | - | 支付方式(支付宝/微信) |
| created_at | DATETIME | - | DEFAULT NOW | 创建时间 |
| updated_at | DATETIME | - | DEFAULT NOW, ON UPDATE NOW | 更新时间 |

#### `bills` - 账单表
| 字段名 | 类型 | 长度 | 约束 | 说明 |
|--------|------|------|------|------|
| id | INT | - | PRIMARY KEY, AUTO_INCREMENT | 账单ID |
| user_id | INT | - | NOT NULL, INDEX | 用户ID |
| order_id | INT | - | NOT NULL, INDEX | 订单ID |
| amount | FLOAT | - | NOT NULL, DEFAULT 0.0 | 金额 |
| pay_time | DATETIME | - | - | 支付时间 |
| status | VARCHAR | 20 | NOT NULL, DEFAULT '未支付' | 状态(已支付/未支付) |
| pay_method | VARCHAR | 20 | - | 支付方式 |
| created_at | DATETIME | - | DEFAULT NOW | 创建时间 |
| updated_at | DATETIME | - | DEFAULT NOW, ON UPDATE NOW | 更新时间 |

### 4. 消息和反馈表

#### `messages` - 消息表
| 字段名 | 类型 | 长度 | 约束 | 说明 |
|--------|------|------|------|------|
| id | INT | - | PRIMARY KEY, AUTO_INCREMENT | 消息ID |
| sender_id | INT | - | - | 发送者ID(管理员) |
| receiver_id | INT | - | NOT NULL | 接收者ID(用户) |
| content | TEXT | - | NOT NULL | 消息内容 |
| created_at | DATETIME | - | DEFAULT NOW | 创建时间 |
| is_read | BOOLEAN | - | DEFAULT FALSE | 是否已读 |

#### `feedbacks` - 反馈表
| 字段名 | 类型 | 长度 | 约束 | 说明 |
|--------|------|------|------|------|
| id | INT | - | PRIMARY KEY, AUTO_INCREMENT | 反馈ID |
| user_id | INT | - | NOT NULL, INDEX | 用户ID |
| content | TEXT | - | NOT NULL | 反馈内容 |
| created_at | DATETIME | - | DEFAULT NOW | 创建时间 |
| reply | TEXT | - | - | 回复内容 |
| reply_at | DATETIME | - | - | 回复时间 |

### 5. 系统配置表

#### `system_config` - 系统配置表
| 字段名 | 类型 | 长度 | 约束 | 说明 |
|--------|------|------|------|------|
| id | INT | - | PRIMARY KEY, AUTO_INCREMENT | 配置ID |
| fee_first | FLOAT | - | NOT NULL, DEFAULT 5 | 首小时费用 |
| fee_next | FLOAT | - | NOT NULL, DEFAULT 2 | 后续每小时费用 |
| fee_max | FLOAT | - | NOT NULL, DEFAULT 30 | 最高费用 |
| alarm_timeout | FLOAT | - | NOT NULL, DEFAULT 72 | 超时报警时间(小时) |
| updated_at | DATETIME | - | DEFAULT NOW, ON UPDATE NOW | 更新时间 |

#### `system_logs` - 系统日志表
| 字段名 | 类型 | 长度 | 约束 | 说明 |
|--------|------|------|------|------|
| id | INT | - | PRIMARY KEY, AUTO_INCREMENT | 日志ID |
| user_id | INT | - | FOREIGN KEY(users.id) | 用户ID |
| action | VARCHAR | 200 | NOT NULL | 操作内容 |
| details | TEXT | - | - | 详细信息 |
| ip_address | VARCHAR | 45 | - | IP地址 |
| user_agent | VARCHAR | 500 | - | 用户代理 |
| created_at | DATETIME | - | DEFAULT NOW | 创建时间 |

## 🔗 表关系

### 外键关系
- `license_plates.user_id` → `users.id`
- `orders.user_id` → `users.id`
- `orders.spot_id` → `parking_spots.id`
- `bills.user_id` → `users.id`
- `bills.order_id` → `orders.id`
- `messages.sender_id` → `admins.id` (可选)
- `messages.receiver_id` → `users.id`
- `feedbacks.user_id` → `users.id`
- `system_logs.user_id` → `users.id`

### 索引
- `users.phone` - 唯一索引
- `users.email` - 唯一索引
- `admins.employee_id` - 唯一索引
- `admins.email` - 唯一索引
- `license_plates.plate_number` - 唯一索引
- `parking_spots.spot_number` - 唯一索引
- `orders.user_id` - 普通索引
- `orders.spot_id` - 普通索引
- `bills.user_id` - 普通索引
- `bills.order_id` - 普通索引
- `feedbacks.user_id` - 普通索引

## 📈 数据量预估

### 用户数据
- 用户表: 1000-10000条记录
- 车牌表: 1500-15000条记录
- 管理员表: 10-50条记录

### 业务数据
- 停车位表: 60条记录(固定)
- 订单表: 10000-100000条记录/月
- 账单表: 10000-100000条记录/月
- 消息表: 5000-50000条记录/月
- 反馈表: 100-1000条记录/月

### 系统数据
- 系统配置表: 1条记录
- 系统日志表: 10000-100000条记录/月

## 💾 存储需求

### 数据存储
- 用户数据: ~50MB
- 业务数据: ~500MB-5GB/月
- 系统数据: ~10MB
- **总计**: ~1-10GB(取决于使用量)

### 备份策略
- 每日全量备份
- 每小时增量备份
- 保留30天备份数据

## 🔧 部署注意事项

### 数据库配置
- MySQL 5.7+ 或 MariaDB 10.2+
- 字符集: utf8mb4
- 排序规则: utf8mb4_unicode_ci
- 存储引擎: InnoDB

### 性能优化
- 定期清理系统日志(保留3个月)
- 定期清理过期订单(保留1年)
- 配置适当的连接池大小
- 启用查询缓存

### 安全配置
- 数据库用户权限最小化
- 启用SSL连接
- 定期更换数据库密码
- 限制数据库访问IP 