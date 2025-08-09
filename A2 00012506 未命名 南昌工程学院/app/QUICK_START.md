# 🚀 停车场管理系统 - 快速启动指南

## 📋 系统概述
基于Vue.js + Flask + MySQL + Redis的现代化停车场管理系统，支持Docker容器化部署。

## ⚡ 一键启动

### Windows系统
```powershell
# 1. 安装Docker Desktop
# 下载: https://www.docker.com/products/docker-desktop/

# 2. 启动系统
.\start.bat

# 3. 访问应用
# 前端: http://localhost:80
# 后端: http://localhost:5000
# 管理员: admin / admin123
```

### 龙芯Linux系统
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
chmod +x start.sh
./start.sh

# 4. 访问应用
# 前端: http://localhost:80
# 后端: http://localhost:5000
# 管理员: admin / admin123
```

## 🔧 常用命令

### 服务管理
```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 数据库管理
```bash
# 备份数据库
./scripts/backup_database.sh  # Linux
.\scripts\backup_database.bat  # Windows

# 进入MySQL
docker-compose exec mysql mysql -u root -p
```

## 📊 系统要求
- **最低配置**: 2GB RAM, 2 CPU cores
- **推荐配置**: 4GB RAM, 4 CPU cores
- **存储**: 至少10GB可用空间

## 🔒 安全配置
1. 修改默认密码（在.env文件中）
2. 配置防火墙规则
3. 启用HTTPS（生产环境）

## 📞 技术支持
- 查看详细文档: `DEPLOYMENT_GUIDE.md`
- 查看部署总结: `DEPLOYMENT_SUMMARY.md`
- 查看故障排除: `README.md#故障排除`

---

**注意**: 首次部署后，请及时修改默认密码并配置安全设置。 