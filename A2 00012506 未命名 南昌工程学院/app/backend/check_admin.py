#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
检查管理员数据
"""

import sys
import os

# 添加src目录到Python路径
current_dir = os.path.dirname(os.path.abspath(__file__))
src_dir = os.path.join(current_dir, 'src')
sys.path.insert(0, src_dir)

from app import create_app
from models.user import Admin
from models import db

def check_admin():
    """检查管理员数据"""
    app = create_app()
    
    with app.app_context():
        # 检查管理员表是否存在
        try:
            admins = Admin.query.all()
            print(f"找到 {len(admins)} 个管理员:")
            for admin in admins:
                print(f"  ID: {admin.id}, 工号: {admin.employee_id}, 姓名: {admin.name}, 角色: {admin.role}")
        except Exception as e:
            print(f"查询管理员表失败: {e}")
            
        # 检查特定的admin账户
        admin = Admin.query.filter_by(employee_id='admin').first()
        if admin:
            print(f"\n找到admin账户:")
            print(f"  工号: {admin.employee_id}")
            print(f"  姓名: {admin.name}")
            print(f"  角色: {admin.role}")
            print(f"  状态: {admin.status}")
            # 测试密码
            if admin.check_password('admin123'):
                print("  密码验证: 成功")
            else:
                print("  密码验证: 失败")
        else:
            print("\n未找到admin账户")

if __name__ == '__main__':
    check_admin() 