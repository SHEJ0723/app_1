# 🚀 智慧停车场管理系统 - Docker部署指南

## 📋 系统概述

**项目名称**: 龙跃智慧园区停车场管理系统  
**技术栈**: Vue.js + Flask + MySQL + Redis  
**部署方式**: Docker Compose  
**支持平台**: Linux (Ubuntu/CentOS/Debian) + 龙芯架构

### 项目功能
- 🎯 用户端：车位查询、预约、支付
- 🔧 管理端：数据统计、用户管理、系统配置
- 🤖 AI助手：智能客服、实时数据查询
- 📊 实时监控：车位状态、使用率统计

## 🗂️ 项目结构

```
parking-system/
├── backend/                 # 后端服务
│   ├── src/                # 源代码
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # API路由
│   │   ├── utils/          # 工具函数
│   │   └── config/         # 配置文件
│   ├── requirements.txt    # Python依赖
│   ├── Dockerfile         # 后端镜像
│   └── init_database.py   # 数据库初始化
├── frontend/              # 前端服务
│   ├── src/               # 源代码
│   ├── package.json       # Node.js依赖
│   └── Dockerfile         # 前端镜像
├── database/              # 数据库相关
│   └── data.sql          # 初始数据
├── docker-compose.yml     # Docker编排
├── deploy.sh             # 部署脚本
└── README.md             # 项目说明
```

## 🚀 快速部署

### 1. 环境要求

- **操作系统**: Linux (Ubuntu 18.04+, CentOS 7+, Debian 9+)
- **内存**: 最少 2GB RAM
- **存储**: 最少 10GB 可用空间
- **网络**: 可访问外网下载依赖

### 2. 一键部署

```bash
# 下载项目
git clone <repository-url>
cd parking-system

# 运行部署脚本
chmod +x deploy.sh
./deploy.sh
```

### 3. 龙芯架构部署

```bash
# 使用龙芯专用部署脚本
chmod +x deploy-loongson.sh
./deploy-loongson.sh
```

## 🔧 手动部署步骤

### 1. 安装Docker和Docker Compose

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y docker.io docker-compose

# CentOS/RHEL
sudo yum install -y docker docker-compose

# 启动Docker服务
sudo systemctl start docker
sudo systemctl enable docker

# 添加用户到docker组
sudo usermod -aG docker $USER
```

### 2. 配置环境变量

```bash
# 创建环境配置文件
cat > .env << EOF
# 数据库配置
MYSQL_ROOT_PASSWORD=your_password
MYSQL_DATABASE=parking_automation_system
MYSQL_USER=parking_user
MYSQL_PASSWORD=parking_pass

# Redis配置
REDIS_PASSWORD=redis_pass

# 应用配置
HUNYUAN_API_KEY=your_api_key
JWT_SECRET_KEY=your_jwt_secret
EOF
```

### 3. 启动服务

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 4. 初始化数据库

```bash
# 进入后端容器
docker-compose exec backend bash

# 初始化数据库
python init_database.py init
```

## 📊 数据库管理

### 数据库结构

系统包含以下主要数据表：

1. **用户管理**
   - `users` - 用户信息
   - `admins` - 管理员信息
   - `license_plates` - 车牌信息

2. **停车场管理**
   - `parking_spots` - 停车位信息

3. **业务数据**
   - `orders` - 订单信息
   - `bills` - 账单信息
   - `messages` - 消息记录
   - `feedbacks` - 反馈信息

4. **系统配置**
   - `system_config` - 系统配置
   - `system_logs` - 系统日志

### 数据备份

```bash
# 创建备份
python database_backup.py backup

# 列出备份
python database_backup.py list

# 恢复备份
python database_backup.py restore backups/parking_system_backup_20231201_143022.sql

# 导出数据
python database_backup.py export

# 清理旧备份
python database_backup.py cleanup
```

### 数据迁移

```bash
# 备份当前数据
python database_backup.py backup

# 导出数据
python database_backup.py export

# 在新环境中恢复
python init_database.py init
# 然后导入数据文件
```

## 🔐 安全配置

### 1. 防火墙设置

```bash
# 开放必要端口
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 22/tcp    # SSH
sudo ufw enable
```

### 2. SSL证书配置

```bash
# 使用Let's Encrypt
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com

# 配置Nginx SSL
# 参考 nginx.conf 中的SSL配置
```

### 3. 数据库安全

```bash
# 修改默认密码
mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

## 📈 性能优化

### 1. 数据库优化

```sql
-- 创建索引
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_bills_user_id ON bills(user_id);
CREATE INDEX idx_bills_pay_time ON bills(pay_time);

-- 配置MySQL
[mysqld]
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
max_connections = 200
```

### 2. 应用优化

```bash
# 调整Docker资源限制
docker-compose.yml:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
```

### 3. 缓存配置

```bash
# Redis配置
redis.conf:
maxmemory 512mb
maxmemory-policy allkeys-lru
```

## 🔍 监控和维护

### 1. 日志管理

```bash
# 查看应用日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 查看数据库日志
docker-compose logs -f mysql
docker-compose logs -f redis
```

### 2. 性能监控

```bash
# 查看资源使用
docker stats

# 查看磁盘使用
df -h

# 查看内存使用
free -h
```

### 3. 定期维护

```bash
# 清理Docker镜像
docker system prune -a

# 清理日志文件
sudo journalctl --vacuum-time=7d

# 更新系统
sudo apt update && sudo apt upgrade
```

## 🚨 故障排除

### 常见问题

1. **服务无法启动**
   ```bash
   # 检查端口占用
   sudo netstat -tlnp | grep :80
   
   # 检查Docker状态
   sudo systemctl status docker
   ```

2. **数据库连接失败**
   ```bash
   # 检查MySQL状态
   docker-compose logs mysql
   
   # 重启数据库
   docker-compose restart mysql
   ```

3. **前端无法访问**
   ```bash
   # 检查Nginx配置
   docker-compose exec frontend nginx -t
   
   # 重启前端服务
   docker-compose restart frontend
   ```

### 日志分析

```bash
# 查看错误日志
docker-compose logs backend | grep ERROR

# 查看访问日志
docker-compose logs frontend | grep "GET\|POST"

# 实时监控
docker-compose logs -f --tail=100
```

## 📞 技术支持

### 联系信息

- **项目维护**: 龙跃智慧园区团队
- **技术支持**: tech-support@parking.com
- **文档地址**: https://docs.parking-system.com

### 更新日志

- **v1.0.0** - 初始版本发布
- **v1.1.0** - 添加统计功能
- **v1.2.0** - 优化性能，修复已知问题

## 📄 许可证

本项目采用 MIT 许可证，详见 LICENSE 文件。

---

**注意**: 部署前请仔细阅读所有配置说明，确保环境满足要求。如有问题，请参考故障排除部分或联系技术支持。 