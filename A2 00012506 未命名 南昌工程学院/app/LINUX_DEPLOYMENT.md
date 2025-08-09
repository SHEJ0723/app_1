# 🐧 Linux环境部署指南

## 📋 系统要求
- Linux发行版（Ubuntu 20.04+, CentOS 7+, Loongnix 20/21, UOS 20/21）
- 龙芯3A5000/3A6000处理器（推荐）
- 至少2GB可用内存
- 至少10GB可用磁盘空间
- sudo权限

## 🚀 快速部署步骤

### 1. 安装Docker
```bash
# 更新系统包
sudo apt update && sudo apt upgrade -y

# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 启动Docker服务
sudo systemctl start docker
sudo systemctl enable docker

# 将当前用户添加到docker组
sudo usermod -aG docker $USER
newgrp docker

# 验证Docker安装
docker --version
```

### 2. 安装Docker Compose
```bash
# 下载Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 添加执行权限
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker-compose --version
```

### 3. 启动停车场管理系统
```bash
# 进入app目录
cd app

# 给启动脚本添加执行权限
chmod +x start.sh

# 运行启动脚本
./start.sh
```

### 4. 验证部署
```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 检查容器健康状态
docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
```

### 5. 访问应用
- **前端界面**: http://localhost:80
- **后端API**: http://localhost:5000
- **管理员账号**: admin / admin123

## 🔧 环境变量配置

### 首次运行自动创建
启动脚本会自动创建 `.env` 文件，但建议手动配置：

```bash
# 编辑环境变量文件
nano .env
# 或使用vim
vim .env
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
```bash
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
```bash
# 备份数据库
../scripts/backup_database.sh

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

## 🔒 安全配置

### 生产环境建议
1. **修改默认密码**
   ```bash
   # 在.env文件中设置强密码
   MYSQL_ROOT_PASSWORD=your_strong_password
   MYSQL_PASSWORD=your_strong_password
   JWT_SECRET_KEY=your_jwt_secret_key
   ```

2. **配置防火墙**
   ```bash
   # Ubuntu/Debian系统
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   
   # CentOS/RHEL系统
   sudo firewall-cmd --permanent --add-port=80/tcp
   sudo firewall-cmd --permanent --add-port=443/tcp
   sudo firewall-cmd --reload
   ```

3. **启用HTTPS**
   - 配置SSL证书
   - 使用反向代理（Nginx）

## 🐛 故障排除

### 常见问题

1. **Docker服务未启动**
   ```bash
   # 启动Docker服务
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

2. **权限问题**
   ```bash
   # 将用户添加到docker组
   sudo usermod -aG docker $USER
   newgrp docker
   ```

3. **端口冲突**
   ```bash
   # 修改.env文件中的端口配置
   BACKEND_PORT=5001
   FRONTEND_PORT=8080
   ```

4. **内存不足**
   ```bash
   # 检查系统内存
   free -h
   
   # 增加swap空间
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

5. **磁盘空间不足**
   ```bash
   # 检查磁盘空间
   df -h
   
   # 清理Docker
   docker system prune -a
   ```

### 日志查看
```bash
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
- [ ] Docker已安装并启动
- [ ] Docker Compose已安装
- [ ] 端口80和5000未被占用
- [ ] 至少2GB可用内存
- [ ] 网络连接正常
- [ ] 用户已添加到docker组

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

## 🐉 龙芯系统特殊配置

### 龙芯优化
1. **使用龙芯优化的Docker镜像**
   ```bash
   # 检查系统架构
   uname -m
   
   # 龙芯系统通常显示 loongarch64
   ```

2. **内存优化**
   ```bash
   # 调整Docker内存限制
   # 在docker-compose.yml中设置内存限制
   ```

3. **网络优化**
   ```bash
   # 使用host网络模式（可选）
   # 在docker-compose.yml中设置network_mode: host
   ```

## 📞 技术支持

如遇到部署问题：

1. **查看日志**: `cd app && docker-compose logs`
2. **检查状态**: `cd app && docker-compose ps`
3. **重启服务**: `cd app && docker-compose restart`
4. **重新构建**: `cd app && docker-compose up -d --build`
5. **查看文档**: `DEPLOYMENT_GUIDE.md`

---

**注意**: 首次部署后，请及时修改默认密码并配置安全设置。 