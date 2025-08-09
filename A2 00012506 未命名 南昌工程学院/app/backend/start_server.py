#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os

# 添加src目录到Python路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from app import create_app

if __name__ == '__main__':
    app = create_app()
    print("🚀 启动龙跃智慧园区停车场管理系统后端服务...")
    print("📍 服务地址: http://localhost:5000")
    print("📊 统计API: http://localhost:5000/api/statistics/dashboard")
    app.run(host='0.0.0.0', port=5000, debug=True) 