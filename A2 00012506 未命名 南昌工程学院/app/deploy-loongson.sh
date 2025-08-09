#!/bin/bash

# 智慧停车场管理系统 - 龙芯Linux部署脚本
# 适用于龙芯架构的Linux系统

echo "🐉 龙芯Linux部署脚本启动..."

# 检查系统架构
ARCH=$(uname -m)
if [[ "$ARCH" != "loongarch64" && "$ARCH" != "loong64" ]]; then
    echo "⚠️ 警告：当前系统架构为 $ARCH，不是龙芯架构"
    read -p "是否继续部署？(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装"
    echo "📦 正在安装Docker..."
    
    # 更新包管理器
    if command -v apt-get &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y docker.io docker-compose
    elif command -v yum &> /dev/null; then
        sudo yum install -y docker docker-compose
    elif command -v dnf &> /dev/null; then
        sudo dnf install -y docker docker-compose
    else
        echo "❌ 不支持的包管理器，请手动安装Docker"
        exit 1
    fi
    
    # 启动Docker服务
    sudo systemctl start docker
    sudo systemctl enable docker
    
    # 将当前用户添加到docker组
    sudo usermod -aG docker $USER
    echo "✅ Docker安装完成，请重新登录或重启系统"
fi

# 检查Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "📦 安装Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# 创建项目目录
PROJECT_DIR="/opt/parking-system"
echo "📁 创建项目目录: $PROJECT_DIR"
sudo mkdir -p $PROJECT_DIR
sudo chown $USER:$USER $PROJECT_DIR

# 复制项目文件
echo "📋 复制项目文件..."
cp -r . $PROJECT_DIR/
cd $PROJECT_DIR

# 创建必要的目录
mkdir -p logs uploads
chmod 755 logs uploads

# 设置环境变量
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# 停止现有容器
echo "🛑 停止现有容器..."
docker-compose down

# 清理系统
echo "🧹 清理系统..."
docker system prune -f

# 构建并启动服务
echo "🔨 构建并启动服务..."
docker-compose up -d --build

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 45

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
    echo ""
    echo "🎉 龙芯Linux部署成功！"
    echo "🌐 访问地址: http://localhost"
    echo "🔧 管理后台: http://localhost/admin"
    echo "📊 API文档: http://localhost:5000"
    echo ""
    echo "📋 默认账号信息："
    echo "   管理员账号: admin"
    echo "   管理员密码: Admin@123456"
    echo ""
    echo "📝 常用命令："
    echo "   查看日志: cd $PROJECT_DIR && docker-compose logs -f"
    echo "   停止服务: cd $PROJECT_DIR && docker-compose down"
    echo "   重启服务: cd $PROJECT_DIR && docker-compose restart"
    echo "   更新代码: cd $PROJECT_DIR && docker-compose up -d --build"
    echo ""
    echo "🔧 系统服务设置："
    echo "   创建系统服务: sudo cp parking-system.service /etc/systemd/system/"
    echo "   启用服务: sudo systemctl enable parking-system"
    echo "   启动服务: sudo systemctl start parking-system"
else
    echo "❌ 部署失败，请检查日志"
    docker-compose logs
    exit 1
fi 