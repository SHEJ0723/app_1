@echo off
echo ========================================
echo    停车场管理系统 - 快速启动
echo ========================================
echo.

REM 检查Docker是否安装
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: Docker未安装或未启动
    echo 请先安装Docker Desktop并启动
    echo 下载地址: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo ✅ Docker已安装

REM 检查环境变量文件
if not exist .env (
    echo 📝 创建环境变量文件...
    copy ..\env.example .env
    echo ✅ 环境变量文件已创建，请根据需要编辑.env文件
    echo.
)

echo 🚀 启动停车场管理系统...
echo.

REM 构建并启动服务
docker-compose up -d --build

if %errorlevel% equ 0 (
    echo.
    echo ✅ 服务启动成功！
    echo.
    echo 📍 访问地址:
    echo   前端界面: http://localhost:80
    echo   后端API:  http://localhost:5000
    echo.
    echo 👤 默认管理员账号: admin / admin123
    echo.
    echo 📊 查看服务状态: docker-compose ps
    echo 📋 查看日志: docker-compose logs -f
    echo 🛑 停止服务: docker-compose down
    echo.
) else (
    echo ❌ 服务启动失败，请检查错误信息
    echo.
    echo 🔍 查看详细日志:
    echo docker-compose logs
    echo.
)

pause 