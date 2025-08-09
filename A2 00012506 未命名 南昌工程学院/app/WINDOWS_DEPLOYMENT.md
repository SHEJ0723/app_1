# 🪟 Windows环境部署指南

## 📋 系统要求
- Windows 10/11 (64位)
- 至少2GB可用内存
- 至少10GB可用磁盘空间
- 管理员权限

## 🚀 快速部署步骤

### 1. 安装Docker Desktop
```powershell
# 下载Docker Desktop for Windows
# 下载地址: https://www.docker.com/products/docker-desktop/

# 安装完成后启动Docker Desktop
# 在系统托盘中找到Docker图标，确保状态为"Running"
```

### 2. 配置WSL2（推荐）
```powershell
# 以管理员身份运行PowerShell
wsl --install
wsl --set-default-version 2

# 重启电脑后，WSL2会自动启动
```

### 3. 启动停车场管理系统
```powershell
# 进入app目录
cd app

# 运行启动脚本
.\start.bat
```

### 4. 验证部署
```powershell
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 5. 访问应用
- **前端界面**: http://localhost:80
- **后端API**: http://localhost:5000
- **管理员账号**: admin / admin123

## 🔧 环境变量配置

### 首次运行自动创建
启动脚本会自动创建 `.env` 文件，但建议手动配置：

```powershell
# 编辑环境变量文件
notepad .env
```

### 环境变量内容
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

## 📊 系统管理

### 常用命令
```powershell
# 进入app目录
cd app

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
```powershell
# 备份数据库
..\scripts\backup_database.bat

# 进入MySQL
docker-compose exec mysql mysql -u root -p

# 查看数据库
SHOW DATABASES;
USE parking_system;
SHOW TABLES;
```

### 应用更新
```powershell
# 拉取最新代码
git pull

# 重新构建
docker-compose up -d --build

# 清理旧镜像
docker system prune -f
```

## 🔒 安全配置

### 生产环境建议
1. **修改默认密码**
   ```powershell
   # 在.env文件中设置强密码
   MYSQL_ROOT_PASSWORD=your_strong_password
   MYSQL_PASSWORD=your_strong_password
   JWT_SECRET_KEY=your_jwt_secret_key
   ```

2. **配置Windows防火墙**
   ```powershell
   # 添加入站规则
   New-NetFirewallRule -DisplayName "Parking System" -Direction Inbound -Protocol TCP -LocalPort 80,5000 -Action Allow
   ```

3. **启用HTTPS**
   - 配置SSL证书
   - 使用反向代理（Nginx）

## 🐛 故障排除

### 常见问题

1. **Docker Desktop未启动**
   ```powershell
   # 启动Docker Desktop
   # 在开始菜单中找到Docker Desktop并启动
   ```

2. **端口冲突**
   ```powershell
   # 修改.env文件中的端口配置
   BACKEND_PORT=5001
   FRONTEND_PORT=8080
   ```

3. **内存不足**
   ```powershell
   # 在Docker Desktop设置中调整内存限制
   # 打开Docker Desktop -> Settings -> Resources -> Memory
   ```

4. **WSL2问题**
   ```powershell
   # 重启WSL2
   wsl --shutdown
   wsl --start
   ```

### 日志查看
```powershell
# 进入app目录
cd app

# 查看所有日志
docker-compose logs

# 查看特定服务日志
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mysql
```

## 📋 部署检查清单

### 部署前检查
- [ ] Docker Desktop已安装并启动
- [ ] WSL2已启用（推荐）
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

1. **查看日志**: `cd app && docker-compose logs`
2. **检查状态**: `cd app && docker-compose ps`
3. **重启服务**: `cd app && docker-compose restart`
4. **重新构建**: `cd app && docker-compose up -d --build`
5. **查看文档**: `DEPLOYMENT_GUIDE.md`

---

**注意**: 首次部署后，请及时修改默认密码并配置安全设置。 