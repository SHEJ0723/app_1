# 停车场管理系统 - 部署总结

## 📦 Docker打包完成

### ✅ 已完成的工作

1. **Docker配置优化**
   - 创建了根目录的 `docker-compose.yml`
   - 优化了后端和前端Dockerfile
   - 添加了资源限制和健康检查
   - 配置了数据持久化

2. **数据库备份**
   - 现有备份文件: `app/backend/backups/parking_system_backup_20250808_003821.sql`
   - 数据库初始化文件: `app/database/parking_automation_system.sql`
   - 创建了自动备份脚本

3. **部署脚本**
   - Windows启动脚本: `start.bat`
   - Linux启动脚本: `start.sh`
   - 数据库备份脚本: `scripts/backup_database.sh` (Linux)
   - 数据库备份脚本: `scripts/backup_database.bat` (Windows)

4. **文档整合**
   - 更新了 `README.md` 包含完整部署指南
   - 创建了详细的 `DEPLOYMENT_GUIDE.md`
   - 合并了相关功能描述

## 🚀 快速部署步骤

### Windows系统部署

1. **安装Docker Desktop**
   ```powershell
   # 下载并安装 Docker Desktop for Windows
   # 启动Docker Desktop
   # 启用WSL2（推荐）
   ```

2. **一键启动**
   ```powershell
   # 双击运行 start.bat
   # 或在命令行运行:
   .\start.bat
   ```

3. **访问应用**
   - 前端: http://localhost:80
   - 后端: http://localhost:5000
   - 管理员: admin / admin123

### 龙芯Linux系统部署

1. **安装Docker**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo systemctl start docker
   sudo usermod -aG docker $USER
   newgrp docker
   ```

2. **安装Docker Compose**
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **一键启动**
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

4. **访问应用**
   - 前端: http://localhost:80
   - 后端: http://localhost:5000
   - 管理员: admin / admin123

## 🔧 环境变量配置

创建 `.env` 文件（首次运行会自动创建）:

```env
# 数据库配置
MYSQL_ROOT_PASSWORD=your_strong_password
MYSQL_DATABASE=parking_system
MYSQL_USER=parking_user
MYSQL_PASSWORD=your_strong_password
MYSQL_PORT=3306

# 应用端口
BACKEND_PORT=5000
FRONTEND_PORT=80

# JWT密钥
JWT_SECRET_KEY=your_jwt_secret_key

# 腾讯混元API密钥（可选）
HUNYUAN_API_KEY=your_hunyuan_api_key
```

## 📊 系统管理命令

### 服务管理
```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 数据库管理
```bash
# 备份数据库
./scripts/backup_database.sh

# 进入MySQL
docker-compose exec mysql mysql -u root -p

# 查看数据库
SHOW DATABASES;
USE parking_system;
SHOW TABLES;
```

### 应用更新
```bash
# 拉取最新代码
git pull

# 重新构建
docker-compose up -d --build

# 清理旧镜像
docker system prune -f
```

## 🔒 安全建议

### 生产环境配置
1. **修改默认密码**
   - 在 `.env` 文件中设置强密码
   - 修改默认管理员密码

2. **网络安全**
   ```bash
   # 配置防火墙
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

3. **SSL证书**
   - 配置HTTPS证书
   - 使用反向代理

## 📈 性能优化

### 系统要求
- **最低配置**: 2GB RAM, 2 CPU cores
- **推荐配置**: 4GB RAM, 4 CPU cores
- **存储**: 至少10GB可用空间

### 龙芯系统优化
1. **使用龙芯优化的Docker镜像**
2. **调整内存限制**
3. **配置MySQL缓存**
4. **使用host网络模式**

## 🐛 故障排除

### 常见问题

1. **端口冲突**
   ```bash
   # 修改.env文件中的端口
   BACKEND_PORT=5001
   FRONTEND_PORT=8080
   ```

2. **数据库连接失败**
   ```bash
   # 检查MySQL服务
   docker-compose logs mysql
   ```

3. **内存不足**
   ```bash
   # 增加Docker内存限制
   # 在Docker Desktop设置中调整
   ```

4. **构建失败**
   ```bash
   # 清理并重新构建
   docker-compose down
   docker system prune -f
   docker-compose up -d --build
   ```

### 日志查看
```bash
# 查看所有日志
docker-compose logs

# 查看特定服务日志
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mysql
```

## 📋 部署检查清单

### 部署前检查
- [ ] Docker已安装并启动
- [ ] Docker Compose已安装
- [ ] 端口80和5000未被占用
- [ ] 至少2GB可用内存
- [ ] 网络连接正常

### 部署后检查
- [ ] 所有容器正常运行 (`docker-compose ps`)
- [ ] 前端可以访问 (http://localhost:80)
- [ ] 后端API可以访问 (http://localhost:5000)
- [ ] 数据库连接正常
- [ ] 管理员账号可以登录

### 安全配置
- [ ] 修改默认密码
- [ ] 配置防火墙规则
- [ ] 设置强密码策略
- [ ] 配置日志轮转
- [ ] 定期备份数据库

## 📞 技术支持

如遇到部署问题：

1. **查看日志**: `docker-compose logs`
2. **检查状态**: `docker-compose ps`
3. **重启服务**: `docker-compose restart`
4. **重新构建**: `docker-compose up -d --build`
5. **查看文档**: `DEPLOYMENT_GUIDE.md`

---

**注意**: 首次部署后，请及时修改默认密码并配置安全设置。 