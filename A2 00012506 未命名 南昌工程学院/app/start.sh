#!/bin/bash

echo "========================================"
echo "    停车场管理系统 - 快速启动"
echo "========================================"
echo

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ 错误: Docker未安装"
    echo "请先安装Docker:"
    echo "curl -fsSL https://get.docker.com -o get-docker.sh"
    echo "sudo sh get-docker.sh"
    exit 1
fi

# 检查Docker Compose是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ 错误: Docker Compose未安装"
    echo "请先安装Docker Compose:"
    echo "sudo curl -L \"https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose"
    echo "sudo chmod +x /usr/local/bin/docker-compose"
    exit 1
fi

echo "✅ Docker已安装"

# 检查Docker服务是否运行
if ! docker info &> /dev/null; then
    echo "❌ 错误: Docker服务未启动"
    echo "请启动Docker服务:"
    echo "sudo systemctl start docker"
    echo "sudo usermod -aG docker \$USER"
    echo "newgrp docker"
    exit 1
fi

echo "✅ Docker服务已启动"

# 检查环境变量文件
if [ ! -f .env ]; then
    echo "📝 创建环境变量文件..."
    cp ../env.example .env
    echo "✅ 环境变量文件已创建，请根据需要编辑.env文件"
    echo
fi

echo "🚀 启动停车场管理系统..."
echo

# 构建并启动服务
docker-compose up -d --build

if [ $? -eq 0 ]; then
    echo
    echo "✅ 服务启动成功！"
    echo
    echo "📍 访问地址:"
    echo "  前端界面: http://localhost:80"
    echo "  后端API:  http://localhost:5000"
    echo
    echo "👤 默认管理员账号: admin / admin123"
    echo
    echo "📊 查看服务状态: docker-compose ps"
    echo "📋 查看日志: docker-compose logs -f"
    echo "🛑 停止服务: docker-compose down"
    echo
else
    echo "❌ 服务启动失败，请检查错误信息"
    echo
    echo "🔍 查看详细日志:"
    echo "docker-compose logs"
    echo
fi 