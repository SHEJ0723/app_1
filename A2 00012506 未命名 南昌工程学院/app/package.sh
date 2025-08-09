#!/bin/bash

# 智慧停车场管理系统打包脚本

echo "📦 开始打包智慧停车场管理系统..."

# 设置版本号
VERSION="1.0.0"
PACKAGE_NAME="parking-system-v${VERSION}"

# 创建临时目录
TEMP_DIR="/tmp/${PACKAGE_NAME}"
mkdir -p $TEMP_DIR

echo "📁 创建打包目录: $TEMP_DIR"

# 复制项目文件
echo "📋 复制项目文件..."
cp -r . $TEMP_DIR/

# 删除不需要的文件
echo "🧹 清理不需要的文件..."
cd $TEMP_DIR
rm -rf .git .gitignore .vscode .idea
rm -rf node_modules .venv __pycache__
rm -rf *.log *.tmp
rm -rf test_*.py
rm -rf .DS_Store Thumbs.db

# 创建必要的目录
mkdir -p logs uploads backups

# 设置文件权限
chmod +x deploy.sh deploy-loongson.sh
chmod 755 logs uploads backups

# 创建数据库初始化脚本
echo "🗄️ 创建数据库初始化脚本..."
cat > init-db.sh << 'EOF'
#!/bin/bash
echo "🗄️ 初始化数据库..."
docker-compose exec mysql mysql -u root -prootpassword parking_automation_system < database/parking_automation_system.sql
echo "✅ 数据库初始化完成"
EOF
chmod +x init-db.sh

# 创建快速启动脚本
echo "🚀 创建快速启动脚本..."
cat > start.sh << 'EOF'
#!/bin/bash
echo "🚀 启动智慧停车场管理系统..."
docker-compose up -d
echo "✅ 系统启动完成"
echo "🌐 访问地址: http://localhost"
echo "🔧 管理后台: http://localhost/admin"
EOF
chmod +x start.sh

# 创建停止脚本
echo "🛑 创建停止脚本..."
cat > stop.sh << 'EOF'
#!/bin/bash
echo "🛑 停止智慧停车场管理系统..."
docker-compose down
echo "✅ 系统已停止"
EOF
chmod +x stop.sh

# 创建状态检查脚本
echo "🔍 创建状态检查脚本..."
cat > status.sh << 'EOF'
#!/bin/bash
echo "🔍 检查系统状态..."
docker-compose ps
echo ""
echo "📊 资源使用情况:"
docker stats --no-stream
EOF
chmod +x status.sh

# 创建备份脚本
echo "💾 创建备份脚本..."
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"

mkdir -p $BACKUP_DIR

echo "💾 开始备份..."

# 备份数据库
docker-compose exec mysql mysqldump -u root -prootpassword parking_automation_system > $BACKUP_DIR/db_$DATE.sql

# 备份上传文件
if [ -d "uploads" ]; then
    tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz uploads/
fi

# 备份日志
if [ -d "logs" ]; then
    tar -czf $BACKUP_DIR/logs_$DATE.tar.gz logs/
fi

echo "✅ 备份完成: $BACKUP_DIR/"
ls -la $BACKUP_DIR/
EOF
chmod +x backup.sh

# 创建恢复脚本
echo "🔄 创建恢复脚本..."
cat > restore.sh << 'EOF'
#!/bin/bash
if [ -z "$1" ]; then
    echo "❌ 请指定备份文件"
    echo "用法: ./restore.sh backup_file.sql"
    exit 1
fi

BACKUP_FILE=$1
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ 备份文件不存在: $BACKUP_FILE"
    exit 1
fi

echo "🔄 开始恢复数据库..."
docker-compose exec -T mysql mysql -u root -prootpassword parking_automation_system < $BACKUP_FILE
echo "✅ 数据库恢复完成"
EOF
chmod +x restore.sh

# 创建README文件
echo "📝 创建README文件..."
cat > README.md << 'EOF'
# 🚀 智慧停车场管理系统

## 📋 系统概述

这是一个完整的智慧停车场管理系统，包含用户端、管理端和AI助手功能。

## 🚀 快速开始

### 1. 启动系统
```bash
./start.sh
```

### 2. 停止系统
```bash
./stop.sh
```

### 3. 检查状态
```bash
./status.sh
```

### 4. 备份数据
```bash
./backup.sh
```

### 5. 恢复数据
```bash
./restore.sh backup_file.sql
```

## 🌐 访问地址

- 前端地址：http://localhost
- 管理后台：http://localhost/admin
- API文档：http://localhost:5000

## 📋 默认账号

- 管理员账号：admin
- 管理员密码：Admin@123456

## 📞 技术支持

如有问题，请联系技术支持团队。
EOF

# 创建压缩包
echo "📦 创建压缩包..."
cd /tmp
tar -czf ${PACKAGE_NAME}.tar.gz ${PACKAGE_NAME}/

# 移动到当前目录
mv ${PACKAGE_NAME}.tar.gz ./

# 清理临时文件
rm -rf $TEMP_DIR

echo "✅ 打包完成！"
echo "📦 文件: ${PACKAGE_NAME}.tar.gz"
echo "📏 大小: $(du -h ${PACKAGE_NAME}.tar.gz | cut -f1)"
echo ""
echo "📋 打包内容："
echo "  ✅ 前端代码 (Vue.js + Element Plus)"
echo "  ✅ 后端代码 (Flask + SQLAlchemy)"
echo "  ✅ 数据库脚本 (MySQL)"
echo "  ✅ Docker配置 (docker-compose.yml)"
echo "  ✅ 部署脚本 (deploy.sh, deploy-loongson.sh)"
echo "  ✅ 管理脚本 (start.sh, stop.sh, status.sh)"
echo "  ✅ 备份脚本 (backup.sh, restore.sh)"
echo "  ✅ 文档说明 (README.md, README-DEPLOY.md)"
echo ""
echo "🚀 部署说明："
echo "  1. 解压文件: tar -xzf ${PACKAGE_NAME}.tar.gz"
echo "  2. 进入目录: cd ${PACKAGE_NAME}"
echo "  3. 运行部署: ./deploy.sh"
echo "  4. 访问系统: http://localhost" 