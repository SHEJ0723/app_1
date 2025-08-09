#!/bin/bash

# 智慧停车场管理系统部署脚本
# 适用于Linux系统（包括龙芯架构）

echo "🚀 开始部署智慧停车场管理系统..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

# 检查Docker Compose是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

# 创建必要的目录
echo "📁 创建必要的目录..."
mkdir -p logs uploads

# 设置权限
echo "🔐 设置文件权限..."
chmod +x deploy.sh
chmod 755 logs uploads

# 停止现有容器
echo "🛑 停止现有容器..."
docker-compose down

# 清理旧镜像（可选）
read -p "是否清理旧镜像？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 清理旧镜像..."
    docker system prune -f
fi

# 构建并启动服务
echo "🔨 构建并启动服务..."
docker-compose up -d --build

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose ps

# 检查数据库连接
echo "🗄️ 检查数据库连接..."
docker-compose exec backend python -c "
import sys
sys.path.append('/app/src')
from app import create_app
app = create_app()
with app.app_context():
    from models.base import db
    try:
        db.engine.execute('SELECT 1')
        print('✅ 数据库连接成功')
    except Exception as e:
        print(f'❌ 数据库连接失败: {e}')
        sys.exit(1)
"

if [ $? -eq 0 ]; then
    echo "✅ 部署成功！"
    echo "🌐 访问地址: http://localhost"
    echo "🔧 管理后台: http://localhost/admin"
    echo "📊 API文档: http://localhost:5000"
    echo ""
    echo "📋 默认账号信息："
    echo "   管理员账号: admin"
    echo "   管理员密码: Admin@123456"
    echo ""
    echo "📝 常用命令："
    echo "   查看日志: docker-compose logs -f"
    echo "   停止服务: docker-compose down"
    echo "   重启服务: docker-compose restart"
    echo "   更新代码: docker-compose up -d --build"
else
    echo "❌ 部署失败，请检查日志"
    docker-compose logs
    exit 1
fi 