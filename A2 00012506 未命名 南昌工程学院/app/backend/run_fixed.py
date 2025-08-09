#!/usr/bin/env python3
"""
修复的启动脚本
"""

import sys
import os

# 添加src目录到Python路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def main():
    """启动后端服务"""
    print("🚀 启动龙跃智慧园区停车场管理系统后端服务...")
    
    try:
        from app import create_app
        
        app = create_app()
        
        print("✅ 后端服务启动成功")
        print("📍 访问地址: http://localhost:5000")
        print("🔧 开发模式已启用")
        
        # 启动开发服务器
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=True,
            use_reloader=False
        )
        
    except Exception as e:
        print(f"❌ 启动失败: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main() 