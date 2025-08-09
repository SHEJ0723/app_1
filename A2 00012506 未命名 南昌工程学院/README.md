# 停车场管理系统

一个基于Vue.js + Flask + MySQL + Redis的现代化停车场管理系统，支持Docker容器化部署。

## 🚀 系统特性

### 核心功能
- **智能停车管理**: 实时车位状态监控和智能分配
- **用户管理**: 完整的用户注册、登录和权限管理
- **订单系统**: 停车订单创建、支付和状态跟踪
- **账单管理**: 自动计费和账单生成
- **消息系统**: 实时消息通知和客服聊天
- **反馈系统**: 用户反馈收集和处理
- **统计分析**: 停车场使用率统计和报表
- **车牌管理**: 多车牌绑定和管理

### 技术特性
- **响应式设计**: 支持PC和移动端访问
- **实时更新**: WebSocket实时数据推送
- **离线支持**: PWA离线功能
- **AI助手**: 集成腾讯混元AI聊天助手
- **多语言**: 国际化支持
- **主题切换**: 深色/浅色主题
- **性能优化**: 懒加载和缓存优化

## 🏗️ 系统架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Vue.js 3)    │◄──►│   (Flask)       │◄──►│   (MySQL 8.0)   │
│   + Vite        │    │   + SQLAlchemy  │    │   + Redis 7     │
│   + Element Plus│    │   + JWT Auth    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 项目结构

```
parking-system/
├── app/                    # 主应用目录
│   ├── frontend/          # 前端项目 (Vue.js 3)
│   ├── backend/           # 后端项目 (Flask)
│   ├── database/          # 数据库文件
│   ├── docker-compose.yml # Docker编排文件
│   ├── start.bat          # Windows启动脚本
│   ├── start.sh           # Linux启动脚本
│   ├── .dockerignore      # Docker忽略文件
│   ├── env.example        # 环境变量示例
│   ├── WINDOWS_DEPLOYMENT.md # Windows部署指南
│   ├── LINUX_DEPLOYMENT.md   # Linux部署指南
│   ├── DEPLOYMENT_GUIDE.md   # 详细部署指南
│   ├── DEPLOYMENT_SUMMARY.md # 部署总结
│   └── QUICK_START.md     # 快速启动指南
├── scripts/               # 脚本文件
│   ├── backup_database.sh # Linux备份脚本
│   └── backup_database.bat # Windows备份脚本
├── backups/               # 数据库备份目录
└── README.md              # 项目说明
```

## ⚡ 快速部署

### Windows系统
```powershell
# 1. 安装Docker Desktop
# 下载: https://www.docker.com/products/docker-desktop/

# 2. 启动系统
cd app
.\start.bat

# 3. 访问应用
# 前端: http://localhost:80
# 后端: http://localhost:5000
# 管理员: admin / admin123
```

### Linux系统（含龙芯）
```bash
# 1. 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo systemctl start docker
sudo usermod -aG docker $USER
newgrp docker

# 2. 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 3. 启动系统
cd app
chmod +x start.sh
./start.sh

# 4. 访问应用
# 前端: http://localhost:80
# 后端: http://localhost:5000
# 管理员: admin / admin123
```

## 📚 详细部署指南

### Windows环境
- 查看 [Windows部署指南](app/WINDOWS_DEPLOYMENT.md)

### Linux环境（含龙芯）
- 查看 [Linux部署指南](app/LINUX_DEPLOYMENT.md)

### 通用指南
- 查看 [详细部署指南](app/DEPLOYMENT_GUIDE.md)
- 查看 [快速启动指南](app/QUICK_START.md)
- 查看 [部署总结](app/DEPLOYMENT_SUMMARY.md)

## 📊 系统管理

### 常用命令
```bash
# 进入app目录
cd app

# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 备份数据库
../scripts/backup_database.sh  # Linux
../scripts/backup_database.bat  # Windows
```

### 数据库管理
```bash
# 进入MySQL
docker-compose exec mysql mysql -u root -p

# 查看数据库
SHOW DATABASES;
USE parking_system;
SHOW TABLES;
```

## 🔒 安全配置

### 生产环境建议
1. **修改默认密码**
   ```bash
   # 在app/.env文件中设置强密码
   MYSQL_ROOT_PASSWORD=your_strong_password
   MYSQL_PASSWORD=your_strong_password
   JWT_SECRET_KEY=your_jwt_secret_key
   ```

2. **配置防火墙**
   ```bash
   # Linux系统
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   
   # Windows系统
   # 在Windows防火墙中添加入站规则
   ```

3. **启用HTTPS**
   - 配置SSL证书
   - 使用反向代理（Nginx）

## 📈 性能优化

### 系统要求
- **最低配置**: 2GB RAM, 2 CPU cores
- **推荐配置**: 4GB RAM, 4 CPU cores
- **存储**: 至少10GB可用空间

### 优化建议
1. **内存优化**: 调整Docker内存限制
2. **数据库优化**: 配置MySQL缓存
3. **网络优化**: 使用host网络模式（Linux）
4. **监控**: 配置系统监控和告警

## 🐛 故障排除

### 常见问题
1. **端口冲突**
   ```bash
   # 修改app/.env文件中的端口配置
   BACKEND_PORT=5001
   FRONTEND_PORT=8080
   ```

2. **数据库连接失败**
   ```bash
   # 检查MySQL服务状态
   cd app
   docker-compose logs mysql
   ```

3. **内存不足**
   ```bash
   # 增加Docker内存限制
   # 在Docker Desktop设置中调整内存限制
   ```

### 日志查看
```bash
# 进入app目录
cd app

# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mysql
```

## 📚 开发指南

### 本地开发
```bash
# 前端开发
cd app/frontend
npm install
npm run dev

# 后端开发
cd app/backend
pip install -r requirements.txt
python run_fixed.py
```

### API文档
- 后端API文档: http://localhost:5000/docs
- 前端API配置: `app/frontend/src/api/`

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 支持

如有问题，请：
1. 查看 [Windows部署指南](app/WINDOWS_DEPLOYMENT.md) 或 [Linux部署指南](app/LINUX_DEPLOYMENT.md)
2. 检查 [故障排除](#故障排除) 部分
3. 查看系统日志
4. 提交 Issue

---

**注意**: 首次部署后，请及时修改默认密码并配置安全设置。 